(() => {
  const google = document.getElementById('welcomeGoogle');
  const guest = document.getElementById('welcomeGuest');
  const status = document.getElementById('welcomeStatus');
  const login = document.getElementById('googleSignIn');
  const accountStatus = document.getElementById('accountStatus');
  let signedIn = false;
  function enter() {
    document.body.classList.remove('welcome-open');
    window.scrollTo(0, 0);
    const target = document.querySelector('#onboarding:not(.hidden) input') || document.getElementById('pageTitle');
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }
  }
  function sync() {
    google.disabled = !signedIn && login.disabled;
    status.textContent = signedIn ? 'You are signed in. Continue to your training.' : accountStatus.textContent;
    if (!signedIn && status.textContent.startsWith('Sign in with your Google')) status.textContent = '';
    google.querySelector('span').textContent = signedIn ? 'Continue to NextForm' : 'Continue with Google';
  }
  guest.addEventListener('click', enter);
  google.addEventListener('click', () => {
    if (signedIn) enter();
    else login.click(); // Synchronous click retains the browser's popup user gesture.
  });
  document.getElementById('backToWelcome').addEventListener('click', () => {
    document.body.classList.add('welcome-open');
    window.scrollTo(0, 0);
    guest.focus({preventScroll:true});
  });
  window.addEventListener('nextform-auth', event => {
    signedIn = event.detail.signedIn;
    sync();
    if (signedIn) enter();
  });
  new MutationObserver(sync).observe(accountStatus, {childList:true,subtree:true,characterData:true});
  new MutationObserver(sync).observe(login, {attributes:true,attributeFilter:['disabled']});
})();
