// Cache Clearing Utility
// Add this to browser console to force clear all caches

async function clearAllCaches() {
    try {
        // Clear Service Worker caches
        if ('serviceWorker' in navigator && 'caches' in window) {
            const cacheNames = await caches.keys();
            console.log('Found caches:', cacheNames);
            
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
                console.log('Deleted cache:', cacheName);
            }
        }
        
        // Clear localStorage and sessionStorage
        if (localStorage) {
            localStorage.clear();
            console.log('Cleared localStorage');
        }
        
        if (sessionStorage) {
            sessionStorage.clear();
            console.log('Cleared sessionStorage');
        }
        
        // Send message to service worker to clear its caches
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({type: 'CLEAR_CACHE'});
        }
        
        console.log('✅ All caches cleared! Please refresh the page.');
        alert('ক্যাশ পরিষ্কার হয়েছে! পেজ রিফ্রেশ করুন। / All caches cleared! Please refresh the page.');
        
        // Force page reload
        window.location.reload(true);
        
    } catch (error) {
        console.error('Error clearing caches:', error);
        alert('ক্যাশ পরিষ্কার করতে সমস্যা হয়েছে / Error clearing caches');
    }
}

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
    console.log('Cache clearing utility loaded. Run clearAllCaches() to clear all caches.');
}