# Secret Santa App - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Setup

1. **Create a Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Realtime Database:**
   - In your Firebase project, go to "Build" > "Realtime Database"
   - Click "Create Database"
   - Choose your location
   - Start in **test mode** for development (we'll add security rules later)

3. **Get Your Config:**
   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" section
   - Click the web icon `</>`
   - Register your app with a nickname (e.g., "Secret Santa")
   - Copy the `firebaseConfig` object

4. **Create Config File:**
   - Create `src/firebase/firebaseConfig.ts`
   - Paste your config:

   ```typescript
   export const firebaseConfig = {
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
     databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_PROJECT_ID.appspot.com',
     messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
     appId: 'YOUR_APP_ID',
   };
   ```

### Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser! 🎉

---

## 🔐 Deploy Security Rules

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login

```bash
firebase login
```

### Step 3: Initialize Firebase

```bash
firebase init
```

- Select "Realtime Database" and "Hosting" (use spacebar to select)
- Choose your existing Firebase project
- For database rules: use `database.rules.json`
- For hosting:
  - Public directory: `dist`
  - Single-page app: `Yes`
  - Don't overwrite `dist/index.html`

### Step 4: Deploy Rules

```bash
firebase deploy --only database
```

---

## 🌐 Deploy to Production

### Build the App

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 📱 How to Use

### For Organizers:

1. Open the app
2. Enter participant names (one per line)
3. Click "Create room and start"
4. Share the room URL with participants via WhatsApp, email, etc.

### For Participants:

1. Open the shared room link
2. Enter your name exactly as the organizer spelled it
3. Click "Pick my Secret Santa"
4. See who you're buying a gift for
5. Keep it secret! 🤫

---

## 🛠️ Development Commands

| Command                           | Description                      |
| --------------------------------- | -------------------------------- |
| `npm run dev`                     | Start development server         |
| `npm run build`                   | Build for production             |
| `npm run preview`                 | Preview production build locally |
| `npm run lint`                    | Run ESLint                       |
| `firebase deploy`                 | Deploy everything to Firebase    |
| `firebase deploy --only hosting`  | Deploy only the web app          |
| `firebase deploy --only database` | Deploy only database rules       |

---

## 🐛 Troubleshooting

### "Cannot find module 'firebase/app'" or similar errors

- Run `npm install` to install dependencies

### "Room not found" after creating

- Check that `databaseURL` in your `firebaseConfig.ts` is correct
- Ensure Realtime Database is enabled in Firebase Console
- Check browser console for errors

### "Name not found in this room"

- Names are case-insensitive but must match exactly
- Check for extra spaces or typos
- Ask the organizer to confirm the spelling

### Build errors with TypeScript

- Make sure all dependencies are installed: `npm install`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Firebase deployment issues

- Make sure you're logged in: `firebase login`
- Verify you selected the correct project: `firebase use --add`
- Check that you have owner/editor permissions on the Firebase project

---

## 📂 Key Files

| File                             | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `src/firebase/firebaseConfig.ts` | **YOU MUST CREATE THIS** - Your Firebase credentials |
| `src/firebase/roomsService.ts`   | All Firebase operations (create, read, assign)       |
| `src/pages/HomePage.tsx`         | Room creation page                                   |
| `src/pages/RoomPage.tsx`         | Secret Santa picker page                             |
| `database.rules.json`            | Firebase security rules                              |
| `src/App.css`                    | All styling                                          |

---

## 🔒 Security Notes

The default security rules are permissive to make development easy. For production:

1. **Restrict room creation** - Add authentication
2. **Add rate limiting** - Prevent spam/abuse
3. **Validate assignments** - Ensure no cheating
4. **Set room expiration** - Auto-delete old rooms

See comments in `database.rules.json` for improvement areas.

---

## 🎯 Features

✅ Real-time synchronization across all devices
✅ Race-condition-safe assignment (uses Firebase transactions)
✅ No self-assignments
✅ No duplicate picks
✅ Device memory (localStorage)
✅ Mobile-responsive design
✅ Works offline (after initial load)

---

## 🤝 Support

Issues? Check:

1. Browser console for errors (F12)
2. Firebase Console > Realtime Database for data
3. Network tab to see if Firebase requests are working
4. README.md for detailed documentation

---

Happy Secret Santa! 🎅🎁
