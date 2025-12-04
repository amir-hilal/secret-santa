# ⚡ Quick Command Reference

## 🚀 Common Commands

### Development

```bash
npm install          # Install dependencies (first time only)
npm run dev          # Start development server at http://localhost:5173
```

### Code Quality

```bash
npm run type-check   # Check TypeScript types (no output files)
npm run lint         # Check code with ESLint
npm run format       # Auto-format code with Prettier
```

### Production

```bash
npm run build        # Build optimized production bundle → dist/
npm run preview      # Preview production build locally
```

### Firebase

```bash
firebase login                    # Login to Firebase (one time)
firebase init                     # Initialize Firebase in project
firebase deploy                   # Deploy everything
firebase deploy --only hosting    # Deploy web app only
firebase deploy --only database   # Deploy security rules only
```

---

## 📋 Step-by-Step Workflows

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your Firebase config file
# Copy src/firebase/firebaseConfig.example.ts to src/firebase/firebaseConfig.ts
# Add your Firebase credentials from Firebase Console

# 3. Start development
npm run dev
```

### Deploy to Production

```bash
# 1. Build the app
npm run build

# 2. Deploy to Firebase (first time)
firebase login
firebase init       # Select Hosting and Realtime Database
firebase deploy

# 3. Deploy updates (after first time)
npm run build
firebase deploy
```

### Clean Slate

```bash
# Delete all generated files and reinstall
Remove-Item -Recurse -Force node_modules, dist, .firebase
npm install
npm run build
```

---

## 🔧 Troubleshooting Commands

### Check Dependencies

```bash
npm list            # Show all installed packages
npm outdated        # Check for outdated packages
npm audit           # Check for security vulnerabilities
```

### Firebase Debugging

```bash
firebase login --reauth           # Re-authenticate
firebase projects:list            # List all your projects
firebase use                      # Show current project
firebase use <project-id>         # Switch to different project
```

### Clear Everything

```bash
# Clear browser data for testing
# Open DevTools (F12) → Application → Local Storage → Clear

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🎯 Development Workflow

### Typical Day-to-Day

```bash
# Morning: Start work
npm run dev

# Make changes... (Vite auto-reloads)

# Before commit: Check quality
npm run type-check
npm run lint
npm run format

# Build and test
npm run build
npm run preview

# Deploy
firebase deploy
```

---

## 📦 Package Management

### Add a Dependency

```bash
npm install package-name           # Add runtime dependency
npm install -D package-name        # Add dev dependency
```

### Update Dependencies

```bash
npm update                         # Update all packages
npm install package-name@latest    # Update specific package
```

---

## 🔥 Firebase CLI Reference

### Project Management

```bash
firebase projects:list             # List all projects
firebase use <project-id>          # Switch project
firebase use --add                 # Add new project alias
```

### Deployment

```bash
firebase deploy                    # Deploy everything
firebase deploy --only hosting     # Deploy web app
firebase deploy --only database    # Deploy DB rules
firebase deploy -m "Message"       # Deploy with message
```

### Testing Locally

```bash
firebase serve                     # Serve app locally (port 5000)
firebase emulators:start           # Start Firebase emulators
```

### Hosting

```bash
firebase hosting:disable           # Disable hosting
firebase hosting:channel:deploy preview  # Deploy to preview channel
```

---

## 💡 Tips

### Speed Up Development

- Use `npm run dev` (Vite HMR is instant)
- Keep TypeScript checking in VS Code (shows errors inline)
- Only run `npm run type-check` before committing

### Before Deploying

Always run this sequence:

```bash
npm run type-check && npm run lint && npm run build
```

If all pass, then:

```bash
firebase deploy
```

### Save Time with Aliases

Add to your PowerShell profile:

```powershell
function dev { npm run dev }
function build { npm run build }
function deploy { npm run build; firebase deploy }
```

Then just type `dev`, `build`, or `deploy`!

---

## 🆘 Emergency Commands

### App Won't Start

```bash
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Build Fails

```bash
npm run type-check     # Find TypeScript errors
npm run lint           # Find linting errors
```

### Can't Deploy

```bash
firebase login --reauth
firebase use <your-project-id>
firebase deploy --debug
```

### Firebase Connection Issues

```bash
# Check if you're in the right project
firebase use

# Check database URL in firebaseConfig.ts
# Should match Firebase Console → Realtime Database URL
```

---

## 📚 Help Commands

```bash
npm --help              # NPM help
npm run                 # List all available scripts
firebase --help         # Firebase CLI help
firebase deploy --help  # Help for specific command
```

---

**Bookmark this file for quick reference!** 🔖
