// Inbox JavaScript for MamurBeta - Admin Dashboard

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageCount = document.getElementById('messageCount');
    const todayCount = document.getElementById('todayCount');
    const recentActivity = document.getElementById('recentActivity');
    const refreshBtn = document.getElementById('refreshBtn');
    const sortOrder = document.getElementById('sortOrder');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const statusMessage = document.getElementById('statusMessage');

    let lastVisible = null;
    let allMessagesLoaded = false;
    const MESSAGES_PER_PAGE = 20;

    // Check Firebase configuration
    if (!firebase.apps.length) {
        messagesContainer.innerHTML = '<div class="no-messages">⚠️ Firebase is not configured. Please check firebase-config.js</div>';
        return;
    }

    // Get Firestore instance
    const db = firebase.firestore();

    // Show status message
    function showStatus(message, type = 'success') {
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }

    // Update recent activity
    function updateRecentActivity() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        recentActivity.textContent = timeString;
    }

    // Load messages function
    async function loadMessages(append = false) {
        try {
            if (!append) {
                messagesContainer.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>অভিযোগ লোড হচ্ছে... / Loading complaints...</p>
                    </div>
                `;
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
                messagesContainer.innerHTML = `
                    <div class="no-messages">
                        কোনো অভিযোগ পাওয়া যায়নি / No complaints found yet
                    </div>
                `;
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

            // Get total count and today's count
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
                
                // Update recent activity
                updateRecentActivity();
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
                messagesContainer.innerHTML = '<div class="no-messages">কোনো অভিযোগ পাওয়া যায়নি / No complaints found</div>';
            } else {
                if (!append) {
                    messagesContainer.innerHTML = messagesHTML;
                } else {
                    messagesContainer.innerHTML += messagesHTML;
                }
            }

            if (!append) {
                showStatus('অভিযোগ সফলভাবে লোড হয়েছে / Complaints loaded successfully');
            }

        } catch (error) {
            console.error('Error loading messages:', error);
            const errorMsg = error.code === 'permission-denied' 
                ? 'অনুমতি অস্বীকৃত / Permission denied. Admin authentication required.'
                : 'অভিযোগ লোড করতে ত্রুটি / Error loading complaints. Please check your Firebase configuration.';
            
            if (!append) {
                messagesContainer.innerHTML = `<div class="no-messages">${errorMsg}</div>`;
            }
            
            showStatus(errorMsg, 'error');
        }
    }

    // Create message element - Professional admin card style
    function createMessageElement(id, data) {
        // Format timestamp
        let dateString = 'Unknown';
        let timeAgo = '';
        
        if (data.timestamp) {
            const date = data.timestamp.toDate();
            dateString = date.toLocaleString('bn-BD', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Calculate time ago
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffDays > 0) {
                timeAgo = `${diffDays} দিন আগে / ${diffDays} days ago`;
            } else if (diffHours > 0) {
                timeAgo = `${diffHours} ঘন্টা আগে / ${diffHours} hours ago`;
            } else {
                timeAgo = `${diffMinutes} মিনিট আগে / ${diffMinutes} minutes ago`;
            }
        } else if (data.createdAt) {
            const date = new Date(data.createdAt);
            dateString = date.toLocaleString('bn-BD', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Truncate ID for display
        const shortId = id.substring(0, 8) + '...';

        return `
            <div class="message-card">
                <div class="message-header">
                    <div class="message-id">📄 ID: ${shortId}</div>
                    <div class="message-time">
                        <div>${dateString}</div>
                        <small>${timeAgo}</small>
                    </div>
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
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<span class="icon">⏳</span> রিফ্রেশিং... / Refreshing...';
        refreshBtn.disabled = true;
        
        loadMessages().then(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        });
    });

    // Sort order change event
    sortOrder.addEventListener('change', function() {
        showStatus('ক্রম পরিবর্তন করা হচ্ছে... / Changing sort order...');
        loadMessages();
    });

    // Load more button event
    loadMoreBtn.addEventListener('click', function() {
        if (!allMessagesLoaded) {
            const originalText = loadMoreBtn.innerHTML;
            loadMoreBtn.innerHTML = '<span class="icon">⏳</span> লোড হচ্ছে... / Loading...';
            loadMoreBtn.disabled = true;
            
            loadMessages(true).then(() => {
                loadMoreBtn.innerHTML = originalText;
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

    // Update recent activity every minute
    setInterval(() => {
        updateRecentActivity();
    }, 60000);

    // Initial load
    loadMessages();
});
