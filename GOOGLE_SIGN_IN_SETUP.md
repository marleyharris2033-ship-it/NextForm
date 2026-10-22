# Enable Google sign-in for NextForm

The integration is installed but hidden until `firebase-config.js` contains a valid web configuration. Existing workouts remain unchanged. Authentication does not yet upload, partition by account, or synchronise workout records: this browser's records remain visible after signing out or switching accounts. Do not present sign-in as a data lock or cloud backup.

1. Open https://console.firebase.google.com/ using the owner's Google account and create or select the NextForm project. Analytics is not required.
2. Register a Web app (the `</>` button). Hosting is not required; NextForm remains on GitHub Pages.
3. Copy the public `firebaseConfig` object into `firebase-config.js`, replacing `null`. Keep `export const firebaseConfig =` and the final semicolon.
4. Open Authentication, get started if needed, then Sign-in method. Enable Google and choose the support email.
5. In Authentication > Settings > Authorized domains, add `marleyharris2033-ship-it.github.io` (no scheme or path). Keep the project's default Firebase auth domain.
6. Commit the config, wait for Pages deployment, and reload NextForm in Safari or Chrome. Open Profile > Account.

Only public web configuration belongs in the repository. Never paste a service-account JSON file, private key, password or OAuth client secret.

## Verification before announcing availability

- Sign in using a real Google account; check that the expected email appears.
- Reload and verify the session persists.
- Sign out, cancel a sign-in, and try another Google account.
- Verify existing workout records and exports remain intact.
- Test iPhone Safari and Add to Home Screen mode. If pop-ups are blocked, open in Safari and permit the popup. Do not use cross-domain redirect sign-in as a blind fallback: GitHub Pages cannot proxy Firebase's auth helper for Safari's third-party-storage restrictions.
- Test loss of network: workout logging must remain independent of account-service loading.

Cloud data storage and per-user server rules are a separate feature. No Firestore database or public database rules are needed for this sign-in integration.

References:
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/web/redirect-best-practices
- https://firebase.google.com/docs/web/alt-setup
