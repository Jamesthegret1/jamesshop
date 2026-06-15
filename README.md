# Sells Platform

A simple platform to post your sells with a global chat!

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Email/Password Authentication** in Firebase Auth
4. Enable **Firestore Database** in Cloud Firestore (create a database)
5. Add a web app to your project to get Firebase config

### 2. Set Up Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in the Firebase config from your project
3. Set `NEXT_PUBLIC_ADMIN_EMAIL` to your email address (only you can post sells)

### 3. Set Firestore Rules (Important!)
Go to Firestore Database → Rules and use these rules:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sells/{sellId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'your-email@example.com';
    }
    match /chat/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Replace `your-email@example.com` with your actual email!

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Locally
```bash
npm run dev
```
Open http://localhost:3000

### 6. Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and import your repo
3. Add all environment variables from `.env.local` in Vercel settings
4. Deploy!

## Features
- Login with Firebase Auth
- Only admin can post sells
- Global chat for all logged-in users
- Data saved in Firestore
- Ready for Vercel deployment