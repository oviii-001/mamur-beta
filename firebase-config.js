// Firebase Configuration for MamurBeta
// Replace these values with your actual Firebase project credentials

// TODO: Replace with your Firebase project configuration
// You can find these values in your Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click on the gear icon (Project Settings)
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>)
// 6. Copy the configuration object

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully!');
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    alert('⚠️ Firebase configuration error. Please check firebase-config.js');
}

// Firestore Rules for your project:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{message} {
      // Allow anyone to write (send anonymous messages)
      allow write: if true;
      
      // Allow authenticated users to read (admin only)
      // For public access, change to: allow read: if true;
      allow read: if request.auth != null;
    }
  }
}
*/
