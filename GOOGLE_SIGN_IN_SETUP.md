# Google sign-in and cloud backup for NextForm

When someone signs in with Google, NextForm backs up their workouts, weights, profile, plans and challenges to Firestore and restores them on any device they sign in on. Guests keep everything in this browser only.

## One-time Firebase setup

Google sign-in is already configured in `firebase-config.js`. Cloud backup also needs a Firestore database with the rules in `firestore.rules`. Until that exists, sign-in still works but the account card shows "Cloud backup isn't set up yet", and workouts stay on the device.

1. Open https://console.firebase.google.com/ and select the **nextform1993** project.
2. Go to **Build → Firestore Database → Create database**. Choose **Production mode** and a location near your users (for example `europe-west2`, London). The location can't be changed later.
3. Open the **Rules** tab, replace everything with the contents of `firestore.rules`, and press **Publish**.
4. Check **Authentication → Sign-in method**: Google should be enabled.
5. Check **Authentication → Settings → Authorized domains** includes `marleyharris2033-ship-it.github.io`.

Only public web configuration belongs in the repository. Never commit a service-account JSON file, private key, password or OAuth client secret.

## How backup works

- Each account has one document at `users/{uid}` holding the app data as JSON. The rules let only that user read or write it, and cap its size at about 900 KB (thousands of workouts).
- Every save is backed up about a second later, and immediately when the app goes to the background. Uploads read, merge and write in one transaction, so edits from two devices are combined rather than overwritten. Deleted workouts are remembered so they don't come back from another device.
- Offline changes are kept on the device and backed up when the connection returns.
- Signing in as a guest with existing workouts merges them into the account. Signing in on a device holding a different account's data replaces it with the new account's data (the old account's data is already in its own backup).
- Signing out backs up any pending changes first, then clears the device. If the backup can't complete, the user is asked before signing out, and their changes stay on the device.
- Reset (Profile → Data) deletes the cloud backup as well when signed in.

## Checks before announcing it

- Sign in on a phone, log a workout, and see "Backed up to your Google account" under Account.
- Sign in on a second device or browser and check the workout appears.
- Log a workout on each device while one is offline; reconnect and check both appear on both.
- Sign out and confirm the device is cleared; sign in again and confirm everything returns.
- Test iPhone Safari and Add to Home Screen mode. If pop-ups are blocked, allow them for the site.

References:
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/quickstart
- https://firebase.google.com/docs/firestore/security/get-started
