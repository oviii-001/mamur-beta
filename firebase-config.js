// Firebase Configuration for MamurBeta
// Firebase SDK v8 configuration

const firebaseConfig = {
    apiKey: "AIzaSyCrl0wGaETrVRPpPPZ7oacyfXO8n0A_-B8",
    authDomain: "mamurbeta-ovijog-box.firebaseapp.com",
    projectId: "mamurbeta-ovijog-box",
    storageBucket: "mamurbeta-ovijog-box.firebasestorage.app",
    messagingSenderId: "131932765897",
    appId: "1:131932765897:web:9f0f52521f5e78ec151718",
    measurementId: "G-EQ1ZXGKS5E"
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
