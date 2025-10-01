# Project Overview: MamurBeta

## Project Name
**MamurBeta**  

## Project Description
MamurBeta is a simple web platform where users can send **anonymous messages** to the site owner. The site is designed in a **retro 90s web style**, giving a nostalgic, old-school internet feel. The platform ensures full anonymity for the sender—messages are stored in **Firebase Firestore**, and the recipient cannot see the identity of the sender.  

## Key Features
- **Anonymous Messaging:** Users can send messages without revealing their identity.
- **Retro 90s UI/UX:** Classic web design elements like pixel fonts, bright background colors, and simple layouts.
- **Firebase Firestore Integration:** Securely store messages in the cloud.
- **Read-Only Inbox:** Admin can view messages, but cannot trace who sent them.
- **Responsive Design:** Works on both desktop and mobile browsers.

## Tech Stack
- **Frontend:** HTML, CSS (90s style), JavaScript
- **Backend:** Firebase Firestore (No backend server required)
- **Hosting:** Firebase Hosting

## Project Structure
```

mamur-beta/
├── index.html          # Main landing page
├── inbox.html          # Admin message inbox
├── css/
│   └── style.css       # Retro 90s style CSS
├── js/
│   └── main.js         # Message submission and Firestore logic
├── firebase-config.js  # Firebase Firestore configuration
└── README.md           # Project documentation

````

## Functional Flow
1. **User sends a message:**
   - Open `index.html`
   - Type message in a text box
   - Submit button sends message to Firestore
2. **Message storage:**
   - Firestore stores the message with timestamp
   - No sender information is collected
3. **Admin views messages:**
   - Open `inbox.html`
   - Fetch all messages from Firestore
   - Display in a simple list format

## Firebase Setup
1. Create a Firebase project
2. Enable Firestore
3. Add Firebase SDK to your project
4. Set up Firestore rules for write-only access for anonymous users, and read-only for admin

```json
// Firestore rules example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{message} {
      allow write: if true;
      allow read: if request.auth != null; // Optional admin auth
    }
  }
}
````

## UI/UX Design Notes

* Use bright background colors and pixelated fonts
* Keep layout minimal and table-like
* Include blinking GIFs, old-school buttons, and marquee text for authenticity
* Use simple alerts for confirmations

## Possible Extensions

* Add emoji support in messages
* Add message deletion after admin reads
* Add a counter for total messages received
* Add basic analytics for total submissions per day

## Goals

* Build a fully anonymous messaging website
* Implement a 90s retro website aesthetic
* Learn Firebase Firestore integration and basic web development