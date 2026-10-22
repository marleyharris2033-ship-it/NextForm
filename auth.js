import { firebaseConfig } from './firebase-config.js';

const panel = document.getElementById('accountCard');
const status = document.getElementById('accountStatus');
const identity = document.getElementById('accountIdentity');
const login = document.getElementById('googleSignIn');
const logout = document.getElementById('googleSignOut');
let auth, sdk, provider, busy = false;

function message(text) { status.textContent = text; }
function render(user) {
  identity.textContent = user ? (user.email || user.displayName || 'Google account') : 'Guest';
  login.hidden = !!user;
  logout.hidden = !user;
  login.disabled = busy;
  logout.disabled = busy;
  message(user ? 'Signed in with Google.' : 'Sign in with your Google account, or keep using NextForm as a guest.');
  window.dispatchEvent(new CustomEvent('nextform-auth', { detail: { signedIn: !!user } }));
}
function errorMessage(error) {
  const messages = {
    'auth/popup-closed-by-user': 'Sign-in was cancelled. You can try again whenever you like.',
    'auth/cancelled-popup-request': 'A sign-in window is already open. Complete it or try again.',
    'auth/popup-blocked': 'Your browser blocked sign-in. Open NextForm in Safari or Chrome and allow pop-ups, then try again.',
    'auth/unauthorized-domain': 'Google sign-in is not enabled for this website yet. Please contact the app owner.',
    'auth/operation-not-allowed': 'Google sign-in has not been enabled yet. Please contact the app owner.',
    'auth/network-request-failed': 'Could not connect. Check your connection and try again.',
    'auth/web-storage-unsupported': 'Your browser is blocking account storage. Open NextForm in Safari or Chrome with storage enabled.',
    'auth/account-exists-with-different-credential': 'This email already uses a different sign-in method. Please contact the app owner.'
  };
  return messages[error?.code] || 'Sign-in could not be completed. Please try again in Safari or Chrome.';
}

// Keep the integration out of the live UI until the owner configures Firebase.
const configured = firebaseConfig && ['apiKey', 'authDomain', 'projectId', 'appId']
  .every(key => typeof firebaseConfig[key] === 'string' && firebaseConfig[key].trim());
if (configured) {
  panel.hidden = false;
  login.disabled = true;
  message('Connecting to Google sign-in…');
  try {
    const [appSDK, authSDK] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')
    ]);
    sdk = authSDK;
    auth = sdk.getAuth(appSDK.initializeApp(firebaseConfig));
    provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await sdk.setPersistence(auth, sdk.browserLocalPersistence);
    sdk.onAuthStateChanged(auth, render, () => message('Could not read your sign-in status. Please reload.'));
    login.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      login.disabled = true;
      message('Complete sign-in in the Google window.');
      try {
        await sdk.signInWithPopup(auth, provider);
        render(auth.currentUser);
      } catch (error) {
        message(errorMessage(error));
      } finally {
        busy = false;
        login.disabled = false;
        logout.disabled = false;
      }
    });
    logout.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      logout.disabled = true;
      try {
        await sdk.signOut(auth);
        render(null);
      } catch {
        message('Could not sign out. Please try again.');
      } finally {
        busy = false;
        login.disabled = false;
        logout.disabled = false;
      }
    });
  } catch {
    message('Account services are unavailable. You can still use NextForm as a guest. Reload to retry.');
    login.disabled = true;
  }
}
