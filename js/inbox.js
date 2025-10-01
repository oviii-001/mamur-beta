// Inbox JavaScript for MamurBeta - Admin Message Viewing

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageCount = document.getElementById('messageCount');
    const todayCount = document.getElementById('todayCount');
    const refreshBtn = document.getElementById('refreshBtn');
    const sortOrder = document.getElementById('sortOrder');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    let lastVisible = null;
    let allMessagesLoaded = false;
    const MESSAGES_PER_PAGE = 20;

    // Check Firebase configuration
    if (!firebase.apps.length) {
        messagesContainer.innerHTML = '<p class="no-messages">⚠️ Firebase is not configured. Please check firebase-config.js</p>';
        return;
    }

    // Get Firestore instance
    const db = firebase.firestore();

    // Load messages function
    async function loadMessages(append = false) {
        try {
            if (!append) {
                messagesContainer.innerHTML = '<p class="loading">Loading messages...</p>';
                lastVisible = null;
                allMessagesLoaded = false;
            }

            const order = sortOrder.value;
            let query = db.collection('messages')
                .orderBy('timestamp', order)
                .limit(MESSAGES_PER_PAGE);

            // Pagination
            if (append && lastVisible) {
                query = query.startAfter(lastVisible);
            }

            const snapshot = await query.get();

            if (snapshot.empty && !append) {
                messagesContainer.innerHTML = '<p class="no-messages">📭 No messages yet! Share your link to receive anonymous messages.</p>';
                messageCount.textContent = '0';
                todayCount.textContent = '0';
                loadMoreContainer.style.display = 'none';
                return;
            }

            // Update last visible for pagination
            if (!snapshot.empty) {
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }

            // Check if all messages loaded
            if (snapshot.size < MESSAGES_PER_PAGE) {
                allMessagesLoaded = true;
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }

            // Get total count
            if (!append) {
                const totalSnapshot = await db.collection('messages').get();
                messageCount.textContent = totalSnapshot.size;

                // Count today's messages
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todaySnapshot = await db.collection('messages')
                    .where('timestamp', '>=', todayStart)
                    .get();
                todayCount.textContent = todaySnapshot.size;
            }

            // Clear container if not appending
            if (!append) {
                messagesContainer.innerHTML = '';
            }

            // Display each message
            let messagesHTML = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
                messagesHTML += createMessageElement(doc.id, data);
            });

            if (messagesHTML === '') {
                messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
            } else {
                if (!append) {
                    messagesContainer.innerHTML = messagesHTML;
                } else {
                    messagesContainer.innerHTML += messagesHTML;
                }
            }

        } catch (error) {
            console.error('Error loading messages:', error);
            const errorMsg = error.code === 'permission-denied' 
                ? 'Permission denied. Admin authentication required.'
                : 'Error loading messages. Please check your Firebase configuration.';
            
            if (!append) {
                messagesContainer.innerHTML = `<div class="no-messages">${errorMsg}</div>`;
            }
        }
    }

    // Create message element - Modern dark theme style
    function createMessageElement(id, data) {
        // Format timestamp
        let dateString = 'Unknown';
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            dateString = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (data.createdAt) {
            const date = new Date(data.createdAt);
            dateString = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        return `
            <div class="message-item">
                <div class="message-header">
                    <div class="message-date">📅 ${dateString}</div>
                </div>
                <div class="message-content">${escapeHtml(data.message)}</div>
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Refresh button event
    refreshBtn.addEventListener('click', function() {
        refreshBtn.textContent = '⏳ REFRESHING...';
        refreshBtn.disabled = true;
        
        loadMessages().then(() => {
            refreshBtn.textContent = '🔄 REFRESH MESSAGES';
            refreshBtn.disabled = false;
        });
    });

    // Sort order change event
    sortOrder.addEventListener('change', function() {
        loadMessages();
    });

    // Load more button event
    loadMoreBtn.addEventListener('click', function() {
        if (!allMessagesLoaded) {
            loadMoreBtn.textContent = '⏳ LOADING...';
            loadMoreBtn.disabled = true;
            
            loadMessages(true).then(() => {
                loadMoreBtn.textContent = '📥 LOAD MORE MESSAGES';
                loadMoreBtn.disabled = false;
            });
        }
    });

    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadMessages();
        }
    }, 30000);

    // Initial load
    loadMessages();
});
