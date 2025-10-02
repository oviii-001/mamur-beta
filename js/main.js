// Main JavaScript for MamurBeta - Anonymous Message Submission
// Simple and Clean Version - Inspired by Uro Chithi aesthetic

document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('messageForm');
    const messageText = document.getElementById('messageText');
    const nickname = document.getElementById('nickname');
    const charCount = document.getElementById('charCount');
    const statusMessage = document.getElementById('statusMessage');

    // Character counter
    messageText.addEventListener('input', function() {
        const count = messageText.value.length;
        charCount.textContent = count;
        
        if (count > 900) {
            charCount.style.color = '#ff6b6b';
            charCount.style.fontWeight = 'bold';
        } else if (count > 800) {
            charCount.style.color = '#ffa726';
        } else {
            charCount.style.color = 'rgba(255, 255, 255, 0.6)';
            charCount.style.fontWeight = 'normal';
        }
    });

    // Show status message
    function showStatus(message, type) {
        statusMessage.innerHTML = message;
        statusMessage.className = `status-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Validate message
    function validateMessage(message) {
        if (!message || message.trim().length === 0) {
            return { 
                valid: false, 
                error: 'Cannot send blank message.' 
            };
        }

        if (message.length > 1000) {
            return { 
                valid: false, 
                error: 'Message too long! Maximum 1000 characters.' 
            };
        }

        if (message.trim().length < 5) {
            return { 
                valid: false, 
                error: 'Message too short! Please write at least 5 characters.' 
            };
        }

        // Basic spam detection
        const spamPatterns = [
            /(.)\1{20,}/i, // Repeated characters
            /^[^a-zA-Z0-9\u0980-\u09FF\s]+$/ // Only special characters
        ];

        for (let pattern of spamPatterns) {
            if (pattern.test(message)) {
                return { 
                    valid: false, 
                    error: 'Invalid message format. Please write a proper message.' 
                };
            }
        }

        return { valid: true };
    }

    // Rate limiting
    let lastSubmitTime = 0;
    const RATE_LIMIT_MS = 30000; // 30 seconds

    // Form submission
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check rate limit
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime;
        
        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            const secondsRemaining = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
            showStatus(`Please wait ${secondsRemaining} seconds before sending another message.`, 'info');
            return;
        }

        const message = messageText.value.trim();
        const userNickname = nickname.value.trim();

        // Validate message
        const validation = validateMessage(message);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // Check Firebase
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            alert('Firebase is not configured. Please contact the site owner.');
            return;
        }

        try {
            // Show loading state
            const submitButton = messageForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            messageText.disabled = true;
            nickname.disabled = true;

            // Get Firestore instance
            const db = firebase.firestore();

            // Add message to Firestore
            await db.collection('messages').add({
                text: message,
                nickname: userNickname || 'Anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString(),
                messageLength: message.length,
                version: '4.0'
            });

            // Update rate limit
            lastSubmitTime = now;

            // Success
            showStatus('Message Sent. Thanks for your feedback. Means a lot...', 'success');
            messageText.value = '';
            nickname.value = '';
            charCount.textContent = '0';

            // Restore button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            messageText.disabled = false;
            nickname.disabled = false;
            messageText.focus();

        } catch (error) {
            console.error('Error sending message:', error);
            
            let errorMessage = 'Error sending message. ';
            
            if (error.code === 'permission-denied') {
                errorMessage += 'Permission denied. Please contact the site owner.';
            } else if (error.code === 'unavailable') {
                errorMessage += 'Network error. Please check your connection.';
            } else {
                errorMessage += 'Please try again later.';
            }
            
            alert(errorMessage);
            
            // Restore button
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Send';
            submitButton.disabled = false;
            messageText.disabled = false;
            nickname.disabled = false;
        }
    });

    // Auto-focus on textarea
    setTimeout(() => {
        messageText.focus();
    }, 500);

    // Keyboard shortcut: Ctrl+Enter to submit
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (messageText.value.trim()) {
                messageForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    console.log('🚀 MamurBeta v4.0 - Clean Anonymous Message System Loaded');
});
