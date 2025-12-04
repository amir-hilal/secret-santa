# 🎅 Secret Santa Picker

A simple but robust Secret Santa web app built with React, TypeScript, Vite, and Firebase Realtime Database.

> **⭐ New here?** Start with **[GETTING_STARTED.md](GETTING_STARTED.md)** for complete setup instructions!
>
> **📚 All Documentation:** See **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** for a complete guide to all docs.

## Features

- ✨ Real-time updates using Firebase Realtime Database
- 🎲 Race-condition-safe random assignment using transactions
- 💾 Persistent storage with localStorage for returning users
- 📱 Mobile-friendly, responsive design
- 🔒 No self-assignments
- ✅ Prevents duplicate picks across devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Firebase Realtime Database** for real-time data synchronization
- **Firebase Web SDK v9** (modular APIs)

## Project Structure

```
secret-santa/
├── src/
│   ├── firebase/
│   │   ├── firebase.ts              # Firebase initialization
│   │   ├── firebaseConfig.ts        # Your Firebase config (not in repo)
│   │   └── roomsService.ts          # All Firebase operations
│   ├── hooks/
│   │   └── useRoom.ts               # Custom hook for room subscription
│   ├── pages/
│   │   ├── HomePage.tsx             # Create room page
│   │   ├── RoomPage.tsx             # Main Secret Santa picker page
│   │   └── NotFoundPage.tsx         # 404 page
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   └── localStorage.ts          # LocalStorage helpers
│   ├── App.tsx                      # Main app with routing
│   ├── App.css                      # Global styles
│   └── main.tsx                     # Entry point
├── database.rules.json              # Firebase security rules
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Firebase project with Realtime Database enabled

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable **Realtime Database** (choose a server location)
   - Go to Project Settings > General
   - Scroll to "Your apps" and create a Web app
   - Copy the `firebaseConfig` object

4. **Create your Firebase config file:**

   Create `src/firebase/firebaseConfig.ts` with your config:

   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

   You can use `src/firebase/firebaseConfig.example.ts` as a template.

5. **Deploy Firebase security rules:**

   Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

   Login to Firebase:
   ```bash
   firebase login
   ```

   Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select "Realtime Database"
   - Choose your Firebase project
   - Use `database.rules.json` as your rules file

   Deploy the rules:
   ```bash
   firebase deploy --only database
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

Build the app:
```bash
npm run build
```

The output will be in the `dist/` folder.

Preview the production build:
```bash
npm run preview
```

## Deployment

### Deploy to Firebase Hosting

1. **Initialize Firebase Hosting** (if not done already):
   ```bash
   firebase init hosting
   ```
   - Choose your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite `dist/index.html`

2. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`

### Other Deployment Options

- **Vercel**: Connect your Git repository and deploy automatically
- **Netlify**: Drag & drop the `dist` folder or connect via Git
- **GitHub Pages**: Use `gh-pages` package to deploy the `dist` folder

## How It Works

### For the Organizer

1. Open the app at `/`
2. Enter participant names (one per line)
3. Click "Create room and start"
4. Share the room URL with all participants

### For Participants

1. Open the shared room URL
2. Enter your name (must match exactly what the organizer entered)
3. Click "Pick my Secret Santa"
4. See who you're buying a gift for
5. Keep it a secret! 🤫

### Under the Hood

- **Transaction-based assignment**: When a participant clicks "Pick my Secret Santa", a Firebase transaction ensures that:
  - Two people can't pick the same target
  - No one can pick themselves
  - The assignment is atomic and race-condition-safe

- **Real-time updates**: All participants see live updates of how many people have picked

- **localStorage persistence**: Your pick is saved on your device, so you can close the app and come back later

## Firebase Database Structure

```
/rooms
  /{roomId}
    createdAt: number
    status: "open" | "completed"
    participants:
      {participantId}:
        id: string
        name: string
    assignments:
      {participantId}:
        participantId: string
        targetId: string
        assignedAt: number
    availableTargets:
      {participantId}: boolean
```

## Security Considerations

The included `database.rules.json` is a basic setup with TODO comments indicating where you should tighten security for production use. Consider:

- Implementing authentication (Firebase Auth)
- Restricting who can create rooms
- Adding server-side validation for assignments
- Rate limiting writes to prevent abuse
- Adding room expiration dates

## Troubleshooting

**"Room not found" error:**
- Ensure your Firebase Realtime Database is enabled
- Check that the database URL in `firebaseConfig.ts` is correct
- Verify security rules are deployed

**"Name not found" error:**
- Participant name must match exactly (case-insensitive)
- Ask the organizer for the correct spelling

**"No valid targets available" error:**
- All other participants have been picked
- You're the last person to pick (and only you remain)

## License

MIT License - feel free to use this for your Secret Santa events!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Happy Secret Santa! 🎁🎄
