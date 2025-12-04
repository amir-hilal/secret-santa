# Secret Santa Picker - Complete Implementation Guide

## 📦 What You've Got

A fully functional Secret Santa web app with:

### ✅ Core Features

- **Real-time synchronization** - Everyone sees updates instantly
- **Race-condition safe** - Firebase transactions prevent duplicate picks
- **Device persistence** - localStorage remembers users
- **Mobile responsive** - Works perfectly on phones
- **No backend needed** - 100% Firebase serverless
- **Production ready** - With security rules and deployment config

### 📁 File Structure

```
secret-santa/
├── src/
│   ├── firebase/
│   │   ├── firebase.ts                    # Firebase initialization
│   │   ├── firebaseConfig.example.ts      # Config template (COPY THIS!)
│   │   └── roomsService.ts                # All database operations
│   ├── hooks/
│   │   └── useRoom.ts                     # Real-time room subscription hook
│   ├── pages/
│   │   ├── HomePage.tsx                   # Room creation page
│   │   ├── RoomPage.tsx                   # Secret Santa picker page
│   │   └── NotFoundPage.tsx               # 404 page
│   ├── types/
│   │   └── index.ts                       # TypeScript interfaces
│   ├── utils/
│   │   └── localStorage.ts                # localStorage helpers
│   ├── App.tsx                            # Main app with React Router
│   ├── App.css                            # All styles (responsive)
│   └── main.tsx                           # Entry point
├── public/
│   └── vite.svg                           # Vite logo
├── .vscode/
│   ├── extensions.json                    # Recommended extensions
│   └── settings.json                      # VSCode settings
├── database.rules.json                    # Firebase security rules
├── firebase.json                          # Firebase config
├── .firebaserc.example                    # Firebase project template
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── vite.config.ts                         # Vite config
├── eslint.config.js                       # ESLint config
├── .prettierrc                            # Prettier config
├── .gitignore                             # Git ignore rules
├── README.md                              # Full documentation
├── SETUP.md                               # Quick start guide
└── ARCHITECTURE.md                        # Technical deep dive
```

---

## 🚀 Getting Started (First Time)

### 1. Install Dependencies

```bash
cd secret-santa
npm install
```

### 2. Set Up Firebase

#### Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name (e.g., "secret-santa-2024")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### Enable Realtime Database

1. In Firebase Console, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose a location (closest to your users)
4. Start in **"Test mode"** (we'll add rules later)
5. Click **"Enable"**

#### Get Your Firebase Config

1. Click the gear icon → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click the **`</>`** (web) icon
4. App nickname: `Secret Santa`
5. **Don't** check Firebase Hosting (we'll do that separately)
6. Click **"Register app"**
7. **COPY** the `firebaseConfig` object

#### Create Your Config File

1. Copy the example file:

   ```bash
   # On Windows PowerShell:
   Copy-Item src\firebase\firebaseConfig.example.ts src\firebase\firebaseConfig.ts
   ```

2. Open `src/firebase/firebaseConfig.ts`

3. Paste your Firebase config:
   ```typescript
   export const firebaseConfig = {
     apiKey: 'AIza...your-key',
     authDomain: 'your-project.firebaseapp.com',
     databaseURL: 'https://your-project-default-rtdb.firebaseio.com',
     projectId: 'your-project-id',
     storageBucket: 'your-project.appspot.com',
     messagingSenderId: '123456789',
     appId: '1:123456789:web:abc123',
   };
   ```

### 3. Run the App

```bash
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🧪 Testing Your App

### Test Room Creation

1. Open http://localhost:5173
2. Enter some names:
   ```
   Alice
   Bob
   Charlie
   Diana
   ```
3. Click **"Create room and start"**
4. You should be redirected to `/room/{roomId}`

### Test Picking

1. Copy the room URL
2. Open it in a **different browser** (or incognito)
3. Enter "Alice" as your name
4. Click **"Pick my Secret Santa"**
5. You should see one of: Bob, Charlie, or Diana (never Alice)

### Test Real-time Updates

1. Keep both browsers open
2. In the second browser, enter "Bob" and pick
3. In the first browser (Alice), watch the stats update in real-time
4. **"Assignments made"** should increase

### Test Device Persistence

1. Close and reopen the browser
2. Go back to the room URL
3. You should automatically see your previous pick (no re-entering name)

### Test Race Conditions

1. Open the room URL in **3 different browsers** simultaneously
2. In each, enter a different name (Alice, Bob, Charlie)
3. Click **"Pick my Secret Santa"** in all 3 browsers **at the same time**
4. Verify each person got a **different** target (no duplicates)

---

## 🔐 Deploy Security Rules

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Project

```bash
firebase init
```

**Selections:**

- Which features? **Realtime Database, Hosting** (use Space to select)
- Use existing project? **Yes**
- Select your project from the list
- Database rules file? **database.rules.json** (press Enter)
- Public directory? **dist**
- Single-page app? **Yes**
- Overwrite index.html? **No**

### Deploy Database Rules

```bash
firebase deploy --only database
```

---

## 🌐 Deploy to Production

### Build the App

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Your app is now live!** 🎉

The URL will be shown in the terminal, something like:

```
https://your-project-id.web.app
```

---

## 📱 How Users Will Use It

### Organizer Flow

1. Opens https://your-app-url.web.app
2. Enters participant names (one per line)
3. Clicks "Create room and start"
4. **Shares the room URL** via WhatsApp/Email:
   ```
   Hey everyone! Join our Secret Santa:
   https://your-app-url.web.app/room/abc123xyz
   ```

### Participant Flow

1. Opens the shared link on their phone
2. Enters their name (exactly as organizer spelled it)
3. Clicks "Pick my Secret Santa"
4. Sees who they're buying a gift for
5. Keeps it secret! 🤫

---

## 🛠️ Development Workflow

### Start Dev Server

```bash
npm run dev
```

- Live reload on file changes
- HMR (Hot Module Replacement)
- TypeScript checking

### Type Check

```bash
npm run type-check
```

- Checks for TypeScript errors
- Doesn't generate output files

### Lint Code

```bash
npm run lint
```

- Checks for code quality issues
- Shows warnings and errors

### Format Code

```bash
npm run format
```

- Auto-formats all files with Prettier
- Ensures consistent code style

### Build for Production

```bash
npm run build
```

- Type checks TypeScript
- Bundles with Vite
- Minifies and optimizes

### Preview Production Build

```bash
npm run preview
```

- Serves the `dist/` folder locally
- Test production build before deploying

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'react'"

**Solution:**

```bash
npm install
```

### Issue: "Room not found" after creating

**Problem:** `databaseURL` in `firebaseConfig.ts` is wrong

**Solution:**

1. Go to Firebase Console → Realtime Database
2. Look at the URL in the "Data" tab
3. Copy that URL (e.g., `https://your-project-default-rtdb.firebaseio.com`)
4. Update `databaseURL` in `src/firebase/firebaseConfig.ts`

### Issue: "Permission denied" when creating room

**Problem:** Security rules too restrictive or Realtime DB not enabled

**Solution:**

1. Go to Firebase Console → Realtime Database → Rules
2. For testing, use:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Click **"Publish"**
4. ⚠️ **Remember to deploy proper rules later!**

### Issue: "Name not found in this room"

**Problem:** Name doesn't match exactly

**Solution:**

- Names are **case-insensitive** (Alice = alice)
- But must match **exactly** otherwise (Alice ≠ Alise)
- Check for extra spaces
- Ask organizer to confirm spelling

### Issue: Firebase deployment fails

**Problem:** Not logged in or wrong project

**Solution:**

```bash
# Login again
firebase login --reauth

# Check current project
firebase projects:list

# Switch project if needed
firebase use your-project-id

# Try deploying again
firebase deploy
```

---

## 🔒 Production Checklist

Before sharing with real users:

- [ ] Replaced `firebaseConfig.example.ts` with your real config
- [ ] Deployed security rules: `firebase deploy --only database`
- [ ] Tested room creation
- [ ] Tested picking with multiple devices
- [ ] Built production version: `npm run build`
- [ ] Deployed to hosting: `firebase deploy --only hosting`
- [ ] Tested the live URL
- [ ] Room link works when shared

### Security Rules Deployed?

Check in Firebase Console → Realtime Database → Rules

Should NOT be:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Should be (from `database.rules.json`):

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists()"
        // ... more rules
      }
    }
  }
}
```

---

## 📊 Usage Stats

You can see Firebase usage in the console:

1. Go to Firebase Console
2. Click **"Build"** → **"Realtime Database"**
3. Click **"Usage"** tab

Monitor:

- **Simultaneous connections** (Free tier: 100 max)
- **Data downloaded** (Free tier: 10 GB/month)
- **Data stored** (Free tier: 1 GB)

For a typical Secret Santa (15 people):

- ~15 connections when everyone picks
- ~50 KB data stored per room
- ~200 KB data downloaded total

**You can run dozens of rooms on the free tier!**

---

## 🎨 Customization Ideas

### Change Colors

Edit `src/App.css`:

```css
:root {
  --primary-color: #dc3545; /* Change to your brand color */
  --secondary-color: #28a745;
}
```

### Add Your Logo

1. Add logo image to `public/` folder
2. Edit `src/pages/HomePage.tsx`:
   ```tsx
   <img src="/logo.png" alt="Logo" style={{ maxWidth: '200px' }} />
   <h1>🎅 Secret Santa Picker</h1>
   ```

### Change App Title

Edit `index.html`:

```html
<title>My Company Secret Santa</title>
```

### Add More Fields

Edit the `Participant` interface in `src/types/index.ts`:

```typescript
export interface Participant {
  id: string;
  name: string;
  email?: string; // Add email
  department?: string; // Add department
}
```

---

## 🆘 Need Help?

### Documentation

- **README.md** - Full documentation
- **SETUP.md** - Quick start guide
- **ARCHITECTURE.md** - Technical details

### Debugging

1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for Firebase requests
4. Check **Application** → **Local Storage** for saved data

### Firebase Console

- View your data: **Realtime Database** → **Data**
- Check rules: **Realtime Database** → **Rules**
- Monitor usage: **Realtime Database** → **Usage**

---

## 🎉 You're All Set!

Your Secret Santa app is ready to use!

**Next steps:**

1. Test thoroughly with friends/family
2. Deploy to production
3. Share the room URL with your group
4. Enjoy your Secret Santa exchange! 🎁

---

**Happy Secret Santa!** 🎅🎄
