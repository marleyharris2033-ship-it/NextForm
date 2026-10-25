// Profile is now a home for you: your card on top, then Card / Badges / Quests / Friends tabs. Settings has its
// own page on the main bar. Old links to the Quests page land on Profile → Quests.
(() => {
  const KEY = 'nextform-ptab', TABS = ['card', 'badges', 'quests', 'friends'];
  const store = (v) => { try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch {} return null; };
  const simple = () => !!data.profile?.simple;
  const allowed = k => TABS.includes(k) && !(simple() && (k === 'badges' || k === 'quests'));
  let current = allowed(store()) ? store() : 'card';

  function show(k, { scroll = true } = {}) {
    if (!allowed(k)) k = 'card';
    current = k; store(k);
    TABS.forEach(t => {
      const b = document.getElementById('ptabBtn-' + t), p = document.getElementById('ptab-' + t);
      if (b) { b.classList.toggle('on', t === k); b.setAttribute('aria-selected', String(t === k)); b.tabIndex = t === k ? 0 : -1; }
      if (p) p.hidden = t !== k;
    });
    if (k === 'badges') window.NextFormCard?.renderBadgesInline();
    if (k === 'card') window.NextFormCard?.renderExtras();
    if (scroll && document.getElementById('profile')?.classList.contains('active')) {
      const bar = document.querySelector('.ptabs'), top = bar ? bar.getBoundingClientRect().top + scrollY - (topbar?.offsetHeight || 0) - 6 : 0;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
    }
  }
  // Keep the tab bar just under the page header when it sticks.
  const topbar = document.querySelector('.topbar');
  const measure = () => document.documentElement.style.setProperty('--topH', (topbar?.offsetHeight || 0) + 'px');
  if (topbar && window.ResizeObserver) new ResizeObserver(measure).observe(topbar); measure();
  function open(k) { go('profile'); show(k, { scroll: false }); }

  // Route old destinations: the Quests page now lives inside Profile.
  titles.settings = 'Settings';
  const baseGo = go;
  go = function (p, ...rest) {
    if (p === 'challenges') { baseGo('profile', ...rest); show('quests', { scroll: false }); return; }
    const r = baseGo(p, ...rest);
    if (p === 'profile') show(current, { scroll: false });
    return r;
  };

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-ptab],[data-badges-open]'); if (!t) return;
    if (t.matches('[data-badges-open]')) { e.preventDefault(); return open('badges'); }
    show(t.dataset.ptab);
  });
  // Arrow keys move between tabs, like a normal tab list.
  document.addEventListener('keydown', e => {
    const t = e.target.closest?.('.ptab'); if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const vis = TABS.filter(allowed), i = vis.indexOf(t.dataset.ptab);
    const n = vis[(i + (e.key === 'ArrowRight' ? 1 : vis.length - 1)) % vis.length];
    show(n); document.getElementById('ptabBtn-' + n)?.focus();
  });
  window.addEventListener('nextform-saved', () => { if (!allowed(current)) show('card', { scroll: false }); });

  window.NextFormProfileTabs = { show, open, get current() { return current; } };
  show(current, { scroll: false });
})();
