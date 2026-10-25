// Google sign-in doesn't work inside other apps' built-in browsers (WhatsApp, Instagram, Facebook, Snapchat,
// TikTok...): the Google window can't hand back to NextForm and people are left on a white screen. iPhone
// home-screen apps can freeze the same way. Spot those before sign-in starts and explain what to do instead.
(() => {
  const ua = navigator.userAgent || '';
  const IN_APP = [[/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i, 'Facebook'], [/Instagram/i, 'Instagram'], [/WhatsApp/i, 'WhatsApp'], [/Snapchat/i, 'Snapchat'],
    [/musical_ly|TikTok|BytedanceWebview|trill/i, 'TikTok'], [/Messenger|MessengerLite/i, 'Messenger'], [/LinkedInApp/i, 'LinkedIn'], [/Pinterest/i, 'Pinterest'],
    [/Line\//i, 'LINE'], [/Twitter|XApp/i, 'X'], [/GSA\//i, 'the Google app'], [/; wv\)/i, 'another app']];
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const inApp = (IN_APP.find(([re]) => re.test(ua)) || [])[1] || null;
  const iosHome = ios && (navigator.standalone === true || matchMedia('(display-mode: standalone)').matches);
  const url = location.origin + location.pathname;
  let triedHome = false;

  function show(kind) {
    let el = document.getElementById('inAppSheet');
    if (!el) { el = document.createElement('div'); el.id = 'inAppSheet'; el.className = 'inAppSheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'inAppTitle'); document.body.appendChild(el); }
    const browser = ios ? 'Safari' : 'Chrome';
    const how = kind === 'home'
      ? `<p>Google sign-in can freeze on a white screen when NextForm is opened from the iPhone home screen. If that happens, close NextForm and open the link in <b>Safari</b> to sign in.</p>`
      : `<p>You’ve opened NextForm inside <b>${inApp}</b>. Google doesn’t allow signing in from other apps’ built-in browsers, so it would get stuck on a white screen.</p>
         <ol>${android ? '<li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Open in Chrome</b> (or “Open in browser”).</li>' : ios ? '<li>Tap the <b>⋯</b> or compass button.</li><li>Tap <b>Open in Safari</b> (or “Open in browser”).</li>' : `<li>Open the menu in this app.</li><li>Choose <b>Open in browser</b>.</li>`}
           <li>Or copy the link below and paste it into ${browser}.</li></ol>`;
    el.innerHTML = `<div class="inAppCard"><h2 id="inAppTitle">${kind === 'home' ? 'Before you sign in' : `Open in ${browser} to sign in`}</h2>${how}
      <div class="inAppLink"><code>${url.replace(/^https:\/\//, '')}</code><button type="button" class="primary" data-inapp="copy">Copy link</button></div>
      <p class="muted small" id="inAppMsg" role="status"></p>
      <div class="row wrap">${kind === 'home' ? '<button type="button" class="primary" data-inapp="try">Try signing in</button>' : ''}<button type="button" class="secondary" data-inapp="guest">Use as guest for now</button><button type="button" class="link" data-inapp="close">Close</button></div></div>`;
    el.classList.remove('hidden');
    el.querySelector('[data-inapp="copy"]').focus();
  }
  const hide = () => document.getElementById('inAppSheet')?.classList.add('hidden');

  // Runs before auth.js's own click handler (capture phase), so the doomed Google window never opens.
  document.addEventListener('click', e => {
    if (e.target.closest('#googleSignIn')) {
      if (inApp) { e.stopImmediatePropagation(); e.preventDefault(); show('app'); }
      else if (iosHome && !triedHome) { e.stopImmediatePropagation(); e.preventDefault(); show('home'); }
      return;
    }
    const b = e.target.closest('[data-inapp]'); if (!b) { if (e.target.id === 'inAppSheet') hide(); return; }
    const act = b.dataset.inapp;
    if (act === 'copy') {
      const done = () => { document.getElementById('inAppMsg').textContent = `Copied. Now paste it into ${ios ? 'Safari' : 'Chrome'}.`; };
      (navigator.clipboard?.writeText(url) || Promise.reject()).then(done).catch(() => {
        const r = document.createRange(), code = document.querySelector('#inAppSheet code'); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        document.getElementById('inAppMsg').textContent = 'Press and hold the link to copy it.';
      });
    } else if (act === 'try') { triedHome = true; hide(); document.getElementById('googleSignIn')?.click(); }
    else if (act === 'guest') { hide(); document.getElementById('welcomeGuest')?.click(); }
    else hide();
  }, true);
  window.NextFormInApp = { inApp, iosHome, show };
})();
