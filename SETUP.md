# MamurBeta Setup Guide

## 🚀 Quick Start

### 1. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "mamurbeta")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Firestore Database**
   - In Firebase Console, go to "Build" → "Firestore Database"
   - Click "Create database"
   - Start in **production mode**
   - Choose a location close to your users
   - Click "Enable"

3. **Get Firebase Configuration**
   - In Firebase Console, click the gear icon → "Project settings"
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Register app with nickname (e.g., "MamurBeta Web")
   - Copy the `firebaseConfig` object

4. **Update firebase-config.js**
   - Open `firebase-config.js`
   - Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

5. **Deploy Firestore Rules**
   - In Firebase Console, go to "Firestore Database" → "Rules"
   - Copy the rules from `firestore.rules` file
   - Click "Publish"

### 2. Local Testing

1. **Open the site locally**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (if you have http-server)
     npx http-server
     ```

2. **Test sending messages**
   - Open `index.html`
   - Type a message (minimum 10 characters)
   - Click "SEND MESSAGE"
   - You should see a success message

3. **View messages (Admin)**
   - Open `inbox.html` in your browser
   - Messages should appear (requires Firebase authentication for production)

### 3. Deploy to Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   - Select "Hosting" and "Firestore"
   - Choose your existing project
   - Accept default files (firebase.json, firestore.rules)
   - Configure as single-page app: **No**
   - Don't overwrite existing files

4. **Deploy**
   ```bash
   firebase deploy
   ```

5. **Access your site**
   - Your site will be live at: `https://your-project-id.web.app`

### 4. Security Configuration

#### Option A: Public Inbox (Anyone can view messages)
In `firestore.rules`, change the read rule:
```javascript
allow read: if true;
```

#### Option B: Admin-Only Inbox (Recommended)
1. Enable Firebase Authentication:
   - Go to Firebase Console → "Authentication"
   - Click "Get started"
   - Enable "Email/Password" provider
   - Add your admin email

2. Add authentication to `inbox.html`:
   - Uncomment the Firebase Auth script
   - Add login UI or use Firebase UI

3. Keep the rule as:
```javascript
allow read: if request.auth != null;
```

## 🔧 Configuration Options

### Rate Limiting
In `js/main.js`, adjust the rate limit:
```javascript
const RATE_LIMIT_MS = 30000; // 30 seconds (default)
```

### Messages Per Page
In `js/inbox.js`, adjust pagination:
```javascript
const MESSAGES_PER_PAGE = 20; // default
```

### Auto-refresh Interval
In `js/inbox.js`, adjust refresh interval:
```javascript
setInterval(() => {
    loadMessages();
}, 30000); // 30 seconds (default)
```

## 📊 Firestore Structure

```
messages (collection)
└── [auto-generated-id] (document)
    ├── message: string
    ├── timestamp: timestamp
    ├── createdAt: string (ISO)
    ├── messageLength: number
    └── version: string
```

## 🛡️ Security Best Practices

1. **Enable App Check** (Recommended for production)
   - Protects against abuse and spam
   - Firebase Console → "App Check"

2. **Set up Budget Alerts**
   - Firebase Console → "Usage and billing"
   - Set alerts to monitor usage

3. **Regular Monitoring**
   - Check Firebase Console regularly
   - Review Firestore usage
   - Monitor authentication logs

## 🐛 Troubleshooting

### Messages not sending
- Check browser console for errors
- Verify Firebase config in `firebase-config.js`
- Check Firestore rules are published
- Ensure Firestore is enabled in Firebase Console

### Permission Denied errors
- Check Firestore rules are correct
- For inbox, ensure authentication is set up
- Verify your user is authenticated

### Messages not appearing in inbox
- Check if Firebase Auth is required
- Verify you're logged in (if auth is enabled)
- Check browser console for errors
- Try refreshing the page

## 📞 Support

For issues related to:
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **Firestore**: [Firestore Documentation](https://firebase.google.com/docs/firestore)
- **Hosting**: [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

## 🎉 You're Ready!

Your anonymous messaging site is now production-ready with:
- ✅ Input validation
- ✅ Rate limiting
- ✅ Error handling
- ✅ Pagination
- ✅ Auto-refresh
- ✅ Message statistics
- ✅ Responsive design
- ✅ Security rules
