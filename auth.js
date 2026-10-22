import { firebaseConfig } from './firebase-config.js';
import { planSignIn, mergeData } from './sync-core.js?v=food1';

const SDK = 'https://www.gstatic.com/firebasejs/13.1.0/';
const panel = document.getElementById('accountCard');
const status = document.getElementById('accountStatus');
const syncLine = document.getElementById('syncStatus');
const identity = document.getElementById('accountIdentity');
const login = document.getElementById('googleSignIn');
const logout = document.getElementById('googleSignOut');
const NF = window.NextForm;
let auth, sdk, fs, db, provider, busy = false;
let user = null, unsubscribe = null, pushTimer = null, retryTimer = null, pushing = null, ready = false;

// Exposed to app.js (backup reminder, reset).
window.NextFormCloud = {
  get signedIn() { return !!user && ready; },
  async deleteCloud() {
    if (!user) return;
    await fs.deleteDoc(userDoc());
    localStorage.removeItem(NF.OWNER_KEY);
  }
};

function message(text) { status.textContent = text; }
function syncState(state, text) { syncLine.dataset.state = state; syncLine.textContent = text; }
function render(u) {
  identity.textContent = u ? (u.email || u.displayName || 'Google account') : 'Guest';
  login.hidden = !!u;
  logout.hidden = !u;
  login.disabled = busy;
  logout.disabled = busy;
  message(u ? 'Signed in with Google.' : 'Sign in with your Google account to back up your workouts, or keep using NextForm as a guest.');
  if (!u) syncState('', '');
  document.getElementById('accountHelp').textContent = u
    ? 'Your workouts, weights and profile back up to this Google account automatically. Signing out removes them from this device; sign in again on any device to get them back.'
    : 'Sign in to back up your workouts, weights and profile to your Google account and restore them on any device. As a guest, everything stays only in this browser.';
  window.dispatchEvent(new CustomEvent('nextform-auth', { detail: { signedIn: !!u } }));
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
function syncError(error) {
  const code = String(error?.code || '');
  if (code.includes('permission-denied')) return 'Cloud backup isn’t switched on yet (Firestore rules not published). Your workouts are still saved on this device.';
  if (code.includes('not-found') || code.includes('failed-precondition')) return 'Cloud backup isn’t set up yet (no Firestore database). Your workouts are still saved on this device.';
  if (code.includes('resource-exhausted') || code.includes('invalid-argument')) return 'Your data is too large to back up. Export a backup to keep a copy.';
  if (!navigator.onLine || code.includes('unavailable') || code.includes('deadline')) return 'Offline — changes are saved on this device and will back up when you reconnect.';
  return 'Backup didn’t complete. It will retry automatically.';
}

const userDoc = () => fs.doc(db, 'users', user.uid);
const isDirty = () => localStorage.getItem(NF.DIRTY_KEY) === '1';
function decode(snap) {
  if (!snap.exists()) return null;
  try { return NF.normalize(JSON.parse(snap.data().payload)); } catch { return null; }
}
function timeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function push() {
  if (!user || !ready) return;
  if (pushing) return pushing;
  const startStamp = NF.data.updatedAt || 0;
  syncState('busy', 'Backing up…');
  pushing = (async () => {
    // Read-merge-write in one transaction so changes made on another device are never overwritten.
    const merged = await fs.runTransaction(db, async tx => {
      const remote = decode(await tx.get(userDoc()));
      const next = remote ? mergeData(NF.data, remote, NF.challengeXp) : { ...NF.data };
      next.updatedAt = Math.max(next.updatedAt || 0, Date.now());
      tx.set(userDoc(), { payload: JSON.stringify(next), updatedAt: next.updatedAt, schema: 1 });
      return next;
    });
    if ((NF.data.updatedAt || 0) > startStamp) {
      // Edited while uploading: keep those edits and back up again shortly.
      const combined = mergeData(NF.data, merged, NF.challengeXp);
      combined.updatedAt = Date.now();
      NF.replace(combined);
      schedulePush();
    } else {
      NF.replace(merged);
      localStorage.removeItem(NF.DIRTY_KEY);
    }
    syncState('ok', `Backed up to your Google account · ${timeLabel()}`);
  })()
    .catch(error => { syncState('error', syncError(error)); throw error; })
    .finally(() => { pushing = null; });
  return pushing;
}
function schedulePush() {
  if (!user || !ready) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => push().catch(() => {}), 1200);
}

let starting = null;
function startSync(u) {
  if (!starting) starting = runStartSync(u).finally(() => { starting = null; });
  return starting;
}
async function runStartSync(u) {
  ready = false;
  user = u;
  syncState('busy', 'Loading your backup…');
  try {
    const remote = decode(await fs.getDoc(userDoc()));
    const owner = localStorage.getItem(NF.OWNER_KEY);
    const plan = planSignIn({ uid: u.uid, owner, dirty: isDirty(), local: NF.data, remote }, NF.challengeXp);
    if (plan.action === 'replace-foreign' && isDirty()) {
      // Another account's unsynced changes are on this device: keep a private copy rather than lose them.
      localStorage.setItem(`nextform-unsynced-${owner}`, JSON.stringify(NF.data));
    }
    if (plan.action !== 'upload') NF.replace(plan.data);
    localStorage.setItem(NF.OWNER_KEY, u.uid);
    ready = true;
    if (plan.action === 'download' || (plan.action === 'replace-foreign' && plan.data)) {
      localStorage.removeItem(NF.DIRTY_KEY);
      syncState('ok', `Restored from your Google account · ${timeLabel()}`);
    } else {
      await push();
    }
  } catch (error) {
    // Couldn't reach the cloud. Keep working locally and try again later; never upload before we've seen the cloud copy.
    ready = false;
    syncState('error', syncError(error));
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => { if (user === u && !ready) startSync(u); }, 30000);
  }
  window.dispatchEvent(new CustomEvent('nextform-auth', { detail: { signedIn: true } }));
  if (!ready) return;
  // Pick up changes made on other devices while the app is open.
  if (unsubscribe) unsubscribe();
  unsubscribe = fs.onSnapshot(userDoc(), snap => {
    if (snap.metadata.hasPendingWrites) return;
    const remote = decode(snap);
    if (!remote || (remote.updatedAt || 0) <= (NF.data.updatedAt || 0)) return;
    if (isDirty()) schedulePush(); // push() merges both sides
    else { NF.replace(remote); syncState('ok', `Updated from another device · ${timeLabel()}`); }
  }, () => {});
}

function stopSync() {
  clearTimeout(pushTimer);
  clearTimeout(retryTimer);
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  user = null;
  ready = false;
}

window.addEventListener('nextform-saved', schedulePush);
window.addEventListener('online', () => { if (!user) return; if (!ready) startSync(user); else if (isDirty()) schedulePush(); });
document.addEventListener('visibilitychange', () => {
  // Flush quickly when the app is backgrounded; phones may close it without warning.
  if (document.visibilityState === 'hidden' && isDirty() && ready) { clearTimeout(pushTimer); push().catch(() => {}); }
  if (document.visibilityState === 'visible' && user && !ready) startSync(user);
});

// Keep the integration out of the live UI until the owner configures Firebase.
const configured = firebaseConfig && ['apiKey', 'authDomain', 'projectId', 'appId']
  .every(key => typeof firebaseConfig[key] === 'string' && firebaseConfig[key].trim());
if (configured) {
  panel.hidden = false;
  login.disabled = true;
  message('Connecting to Google sign-in…');
  try {
    const [appSDK, authSDK, storeSDK] = await Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js'),
      import(SDK + 'firebase-firestore.js')
    ]);
    sdk = authSDK;
    fs = storeSDK;
    const app = appSDK.initializeApp(firebaseConfig);
    auth = sdk.getAuth(app);
    db = fs.getFirestore(app);
    provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await sdk.setPersistence(auth, sdk.browserLocalPersistence);
    sdk.onAuthStateChanged(auth, u => {
      if (u && u.uid !== user?.uid) { stopSync(); render(u); startSync(u); }
      else if (!u) { stopSync(); render(null); }
    }, () => message('Could not read your sign-in status. Please reload.'));
    login.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      login.disabled = true;
      message('Complete sign-in in the Google window.');
      try {
        await sdk.signInWithPopup(auth, provider);
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
      let keepLocal = false;
      try {
        if (isDirty()) {
          try { clearTimeout(pushTimer); if (!ready) throw new Error('not synced'); await push(); }
          catch {
            if (!confirm('Your latest changes haven’t backed up yet. Sign out anyway? They’ll stay on this device and back up next time you sign in with this account.')) return;
            keepLocal = true;
          }
        }
        await sdk.signOut(auth);
        if (!keepLocal) {
          // Everything is safely in the account, so clear this device for the next person.
          [NF.OWNER_KEY, NF.DIRTY_KEY].forEach(k => localStorage.removeItem(k));
          NF.replace({});
          document.body.classList.add('welcome-open');
          message('Signed out. Your workouts are safe in your Google account — sign in again to see them.');
        }
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
