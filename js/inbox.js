// Inbox JavaScript for MamurBeta - Admin Dashboard

// Logout function
function logout() {
    if (confirm('আপনি কি লগআউট করতে চান? / Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        window.location.href = 'login.html';
    }
}

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

    // Enhanced Firebase configuration check
    function checkFirebaseReady() {
        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }
            
            if (!firebase.apps || firebase.apps.length === 0) {
                throw new Error('Firebase not initialized');
            }
            
            if (!firebase.firestore) {
                throw new Error('Firestore not available');
            }
            
            return true;
        } catch (error) {
            console.error('Firebase check failed:', error);
            return false;
        }
    }

    // Wait for Firebase to be ready with retry mechanism
    function waitForFirebaseReady(maxRetries = 30) {
        return new Promise((resolve, reject) => {
            let retries = 0;
            
            function check() {
                if (checkFirebaseReady()) {
                    resolve(true);
                } else if (retries >= maxRetries) {
                    reject(new Error('Firebase failed to initialize after maximum retries'));
                } else {
                    retries++;
                    setTimeout(check, 100);
                }
            }
            
            check();
        });
    }

    // Initialize everything after Firebase is ready
    async function initializeApp() {
        try {
            await waitForFirebaseReady();
            console.log('✅ Firebase confirmed ready, initializing app...');
            
            // Get Firestore instance
            window.db = firebase.firestore();
            
            // Card expansion disabled in new design
            // initializeCardExpansion();
            
            // Load initial data
            loadMessages();
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <div class="no-messages-icon">⚠️</div>
                    <h3>Firebase Configuration Error</h3>
                    <p>Unable to connect to Firebase. Please check your connection and try again.</p>
                    <button onclick="location.reload()" style="
                        background: #e94560; 
                        color: white; 
                        border: none; 
                        padding: 1rem 2rem; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        margin-top: 1rem;
                    ">Retry</button>
                </div>
            `;
            return;
        }
    }

    // Start initialization
    initializeApp();

    // Show status message with enhanced styling
    function showStatus(message, type = 'success') {
        statusMessage.className = `status-message ${type}`;
        statusMessage.innerHTML = `
            <div class="status-content">
                <span class="status-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="status-text">${message}</span>
            </div>
        `;
        statusMessage.style.display = 'block';
        statusMessage.style.animation = 'slideDown 0.3s ease-out';
        
        setTimeout(() => {
            statusMessage.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Enhanced loading state
    function showLoading() {
        messagesContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">মেসেজগুলি লোড হচ্ছে... / Loading messages...</div>
            </div>
        `;
    }

    // Enhanced no messages state
    function showNoMessages() {
        messagesContainer.innerHTML = `
            <div class="no-messages">
                <div class="no-messages-icon">📭</div>
                <h3>কোনো মেসেজ নেই / No Messages</h3>
                <p>এখনো কোনো অভিযোগ জমা দেওয়া হয়নি। যখন নতুন মেসেজ আসবে তখন এখানে দেখানো হবে।<br><br>
                No complaints have been submitted yet. New messages will appear here when they arrive.</p>
            </div>
        `;
    }

    // Update stats function
    async function updateStats(totalCount = null, todayCountValue = null) {
        try {
            if (totalCount === null) {
                const totalSnapshot = await window.db.collection('messages').get();
                messageCount.textContent = totalSnapshot.size;
            } else {
                messageCount.textContent = totalCount;
            }

            if (todayCountValue === null) {
                // Count today's messages
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todaySnapshot = await window.db.collection('messages')
                    .where('timestamp', '>=', todayStart)
                    .get();
                todayCount.textContent = todaySnapshot.size;
            } else {
                todayCount.textContent = todayCountValue;
            }
            
            // Update recent activity
            updateRecentActivity();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
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

    // Enhanced load messages function
    async function loadMessages(append = false) {
        try {
            if (!append) {
                showLoading();
                lastVisible = null;
                allMessagesLoaded = false;
            } else {
                loadMoreBtn.innerHTML = `
                    <span class="loading-spinner" style="width: 20px; height: 20px; margin-right: 0.5rem;"></span>
                    লোড হচ্ছে... / Loading...
                `;
                loadMoreBtn.disabled = true;
            }

            const order = sortOrder.value;
            let query = window.db.collection('messages')
                .orderBy('timestamp', order)
                .limit(MESSAGES_PER_PAGE);

            // Pagination
            if (append && lastVisible) {
                query = query.startAfter(lastVisible);
            }

            const snapshot = await query.get();

            if (snapshot.empty && !append) {
                showNoMessages();
                updateStats(0, 0);
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
                const totalSnapshot = await window.db.collection('messages').get();
                messageCount.textContent = totalSnapshot.size;

                // Count today's messages
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todaySnapshot = await window.db.collection('messages')
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
                messagesContainer.classList.add('empty-state');
            } else {
                messagesContainer.classList.remove('empty-state');
                if (!append) {
                    messagesContainer.innerHTML = messagesHTML;
                } else {
                    messagesContainer.innerHTML += messagesHTML;
                }
            }

            if (!append) {
                showStatus('অভিযোগ সফলভাবে লোড হয়েছে / Complaints loaded successfully');
            } else {
                // Reset load more button
                loadMoreBtn.innerHTML = `
                    <span class="icon">📥</span>
                    আরো লোড করুন / Load More
                `;
                loadMoreBtn.disabled = false;
                showStatus('আরো অভিযোগ লোড হয়েছে / More complaints loaded');
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
            
            // Reset load more button if appending failed
            if (append) {
                loadMoreBtn.innerHTML = `
                    <span class="icon">📥</span>
                    আরো লোড করুন / Load More
                `;
                loadMoreBtn.disabled = false;
            }
        }
    }

    // Card expand/collapse functionality
    function setupCardExpansion() {
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.message-card');
            const expandBtn = e.target.closest('.expand-indicator');
            
            if (card && card.dataset.expandable === 'true') {
                e.preventDefault();
                e.stopPropagation();
                
                const content = card.querySelector('.message-content');
                const indicator = card.querySelector('.expand-indicator');
                
                if (card.classList.contains('expanded')) {
                    // Collapse
                    card.classList.remove('expanded');
                    content.classList.remove('expanded');
                    if (indicator) indicator.textContent = '⬇';
                } else {
                    // Expand
                    card.classList.add('expanded');
                    content.classList.add('expanded');
                    if (indicator) indicator.textContent = '⬆';
                }
            }
        });
    }

    // Initialize card expansion when messages are loaded
    function initializeCardExpansion() {
        setupCardExpansion();
    }

    // Create message element - Minimalist admin card style
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

        // Get nickname or use fallback
        const displayName = data.nickname && data.nickname.trim() !== '' ? data.nickname.trim() : 'Anonymous';
        const timeRight = timeAgo ? `${dateString} • ${timeAgo}` : `${dateString}`;

        return `
            <div class="message-card" data-id="${id}" data-message-id="${id}">
                <div class="message-meta">
                    <span class="message-author">${escapeHtml(displayName)}</span>
                    <span class="message-timestamp">${timeRight}</span>
                </div>
                <div class="message-content" data-full-text="${escapeHtml(data.message || '')}">
                    <div class="message-content-text">${escapeHtml(data.message || '')}</div>
                </div>
                <div class="message-actions">
                    <button class="action-btn" onclick="copyMessage('${id}')">Copy</button>
                    <button class="action-btn" onclick="markAsRead('${id}')">Mark read</button>
                    <button class="action-btn delete" onclick="deleteMessage('${id}')">Delete</button>
                </div>
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

    // Note: Initial load is now handled by initializeApp()
});
