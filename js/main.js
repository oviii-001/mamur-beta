// Main JavaScript for MamurBeta - Anonymous Message Submission

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('messageForm');
    const messageText = document.getElementById('messageText');
    const charCount = document.getElementById('charCount');
    const statusMessage = document.getElementById('statusMessage');

    // Character counter with validation
    messageText.addEventListener('input', function() {
        const count = messageText.value.length;
        charCount.textContent = count;
        
        if (count > 900) {
            charCount.style.color = '#ff0000';
            charCount.style.fontWeight = 'bold';
        } else if (count > 800) {
            charCount.style.color = '#ff6600';
        } else {
            charCount.style.color = '#666';
            charCount.style.fontWeight = 'normal';
        }
    });

    // Show status message function
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Validate message
    function validateMessage(message) {
        if (!message) {
            return { valid: false, error: '⚠️ Please write a message before sending!' };
        }

        if (message.length > 1000) {
            return { valid: false, error: '⚠️ Message too long! Maximum 1000 characters.' };
        }

        // Check for spam patterns
        const spamPatterns = [
            /(.)\1{20,}/i, // Repeated characters
            /^[^a-zA-Z0-9]+$/ // Only special characters
        ];

        for (let pattern of spamPatterns) {
            if (pattern.test(message)) {
                return { valid: false, error: '⚠️ Invalid message format. Please write a proper message.' };
            }
        }

        return { valid: true };
    }

    // Rate limiting
    let lastSubmitTime = 0;
    const RATE_LIMIT_MS = 30000; // 30 seconds between submissions

    // Form submission
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check rate limit
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime;
        
        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            const secondsRemaining = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
            showStatus(`⏳ Please wait ${secondsRemaining} seconds before sending another message.`, 'info');
            return;
        }

        const message = messageText.value.trim();

        // Validate message
        const validation = validateMessage(message);
        if (!validation.valid) {
            showStatus(validation.error, 'error');
            return;
        }

        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            showStatus('⚠️ Firebase is not configured. Please contact the site owner.', 'error');
            return;
        }

        try {
            // Show loading state
            const submitButton = messageForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = '⏳ SENDING...';
            submitButton.disabled = true;
            messageText.disabled = true;

            // Get Firestore instance
            const db = firebase.firestore();

            // Add message to Firestore with additional metadata
            await db.collection('messages').add({
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: new Date().toISOString(),
                messageLength: message.length,
                version: '1.0'
            });

            // Update rate limit timestamp
            lastSubmitTime = now;

            // Success!
            showStatus('✅ Message sent successfully! Your identity is completely safe! 🎉', 'success');
            messageText.value = '';
            charCount.textContent = '0';

            // Restore button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            messageText.disabled = false;
            messageText.focus();

        } catch (error) {
            console.error('Error sending message:', error);
            
            let errorMessage = '❌ Oops! Something went wrong. ';
            
            if (error.code === 'permission-denied') {
                errorMessage += 'Permission denied. Please contact the site owner.';
            } else if (error.code === 'unavailable') {
                errorMessage += 'Network error. Please check your connection.';
            } else {
                errorMessage += 'Please try again later.';
            }
            
            showStatus(errorMessage, 'error');
            
            // Restore button
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.textContent = '🚀 SEND MESSAGE 🚀';
            submitButton.disabled = false;
            messageText.disabled = false;
        }
    });

    // Auto-focus on textarea
    messageText.focus();
});
