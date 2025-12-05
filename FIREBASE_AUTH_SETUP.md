# Firebase Setup Instructions

## Enable Google Authentication

To use Google Sign-In in your Secret Santa application, you need to enable it in the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Click on **Google** from the list of providers
6. Toggle the **Enable** switch to ON
7. Select a **Project support email** from the dropdown
8. Click **Save**

## That's it!

Your application is now configured to use Google Authentication. Users will be able to:
- Sign in with their Google account when creating rooms
- Access the admin dashboard to manage their rooms
- Create both public and secured (PIN-protected) rooms

## Testing

To test the Google login:
1. Run your application (`npm run dev`)
2. Go to the landing page
3. Fill in room details
4. Click "Generate Room"
5. You'll see the Google sign-in popup
6. After signing in, the room will be created automatically
