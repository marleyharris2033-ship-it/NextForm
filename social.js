// NextForm friends: private by default. Turn on sharing to get a friend code; friends add each other by code
// and then see each other's level, weekly sessions and recent workouts, give kudos, and share a weekly
// party quest. Needs a Google sign-in. Nothing about food, weight or notes is ever shared.
(() => {
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', PARTY_XP = 200, REFRESH_MS = 5 * 60e3;
  let friends = [], requests = [], kudos = [], loaded = false, loading = null, pushTimer = null, lastPushed = '';
  const cloud = () => window.NextFormCloud?.firestore || null;
  const prefs = () => (data.profile.social = data.profile.social && typeof data.profile.social === 'object' ? data.profile.social : {});
  const sharing = () => !!prefs().on && !!cloud();
  const myName = () => String(data.profile.name || cloud()?.displayName || 'Friend').trim().split(/\s+/)[0].slice(0, 40) || 'Friend';
  const ref = (c, ...p) => c.fs.doc(c.db, ...p);
  const thisWeek = () => weekKey(today());
  const errText = e => String(e?.code || e?.message || e).replace('firestore/', '');

  // ---------- what friends see about you ----------
  function publicProfile() {
    const lv = levelInfo(data.xp || 0);
    const recent = [...data.workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)) || (+b.updatedAt || 0) - (+a.updatedAt || 0)).slice(0, 3).map(w => ({
      id: String(w.id).slice(0, 40), type: w.type, label: (allPlans().find(p => p.id === w.planId)?.name || w.name || WORKOUT_TYPES.typeDef(w.type).label).slice(0, 40),
      date: w.date, duration: +w.duration || 0, xp: +w.result?.xp || 0
    }));
    return { name: myName(), level: lv.level, rank: rankFor(lv.level), weekCount: weekCounts()[thisWeek()] || 0, weekGoal: weekGoal(), streak: weekStreak(), recent, code: prefs().code || '', week: thisWeek() };
  }
  async function pushProfile(force = false) {
    const c = cloud(); if (!c || !prefs().on) return;
    const p = publicProfile(), sig = JSON.stringify(p);
    if (!force && sig === lastPushed) return;
    await c.fs.setDoc(ref(c, 'profiles', c.uid), { ...p, updatedAt: Date.now() });
    lastPushed = sig;
  }
  const schedulePush = () => { clearTimeout(pushTimer); if (sharing()) pushTimer = setTimeout(() => pushProfile().catch(e => console.warn('profile', e)), 2500); };

  // ---------- turning sharing on and off ----------
  async function enable() {
    const c = cloud(); if (!c) return alert('Sign in with Google first (Profile, Account).');
    let code = prefs().code;
    if (code) { const s = await c.fs.getDoc(ref(c, 'codes', code)).catch(() => null); if (!s?.exists() || s.data().uid !== c.uid) code = ''; }
    for (let i = 0; !code && i < 6; i++) {
      const tryCode = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => CODE_CHARS[b % CODE_CHARS.length]).join('');
      try { await c.fs.setDoc(ref(c, 'codes', tryCode), { uid: c.uid }); code = tryCode; } catch {}
    }
    if (!code) throw new Error('Could not create a friend code. Please try again.');
    Object.assign(prefs(), { on: true, code }); save();
    await pushProfile(true); await refresh(true);
  }
  async function disable(all = false) {
    const c = cloud(); const p = prefs();
    if (c) {
      try { await c.fs.deleteDoc(ref(c, 'profiles', c.uid)); } catch {}
      if (p.code) try { await c.fs.deleteDoc(ref(c, 'codes', p.code)); } catch {}
      if (all) await removeEverything(c);
    }
    Object.assign(p, { on: false, code: '' }); lastPushed = ''; save(); render();
  }
  // Used when the account is deleted: friendships both ways, requests and kudos.
  async function removeEverything(c = cloud()) {
    if (!c) return;
    const list = async path => { try { return (await c.fs.getDocs(c.fs.collection(c.db, ...path))).docs.map(d => d.id); } catch { return []; } };
    for (const id of await list(['friends', c.uid, 'list'])) { try { await c.fs.deleteDoc(ref(c, 'friends', id, 'list', c.uid)); } catch {} try { await c.fs.deleteDoc(ref(c, 'friends', c.uid, 'list', id)); } catch {} }
    for (const id of await list(['requests', c.uid, 'in'])) try { await c.fs.deleteDoc(ref(c, 'requests', c.uid, 'in', id)); } catch {}
    for (const id of await list(['kudos', c.uid, 'in'])) try { await c.fs.deleteDoc(ref(c, 'kudos', c.uid, 'in', id)); } catch {}
    try { await c.fs.deleteDoc(ref(c, 'profiles', c.uid)); } catch {}
    if (prefs().code) try { await c.fs.deleteDoc(ref(c, 'codes', prefs().code)); } catch {}
  }

  // ---------- friends, requests, kudos ----------
  async function refresh(force = false) {
    const c = cloud(); if (!c || !prefs().on) { friends = []; requests = []; kudos = []; render(); return; }
    if (loading) return loading;
    if (!force && loaded && Date.now() - loaded < REFRESH_MS) return;
    loading = (async () => {
      try {
        const ids = (await c.fs.getDocs(c.fs.collection(c.db, 'friends', c.uid, 'list'))).docs.map(d => d.id);
        friends = (await Promise.all(ids.map(async id => { try { const s = await c.fs.getDoc(ref(c, 'profiles', id)); return s.exists() ? { uid: id, ...s.data() } : { uid: id, name: 'Friend', hidden: true }; } catch { return { uid: id, name: 'Friend', hidden: true }; } })));
        requests = (await c.fs.getDocs(c.fs.collection(c.db, 'requests', c.uid, 'in'))).docs.map(d => ({ uid: d.id, ...d.data() })).filter(r => !ids.includes(r.uid));
        kudos = (await c.fs.getDocs(c.fs.collection(c.db, 'kudos', c.uid, 'in'))).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.at || 0) - (a.at || 0));
        loaded = Date.now();
      } catch (e) { console.warn('friends', e); }
      finally { loading = null; render(); }
    })();
    return loading;
  }
  async function addByCode(raw) {
    const c = cloud(); const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z2-9]{6}$/.test(code)) throw new Error('Friend codes are 6 letters and numbers.');
    if (code === prefs().code) throw new Error('That’s your own code. Send it to a friend instead.');
    const s = await c.fs.getDoc(ref(c, 'codes', code));
    if (!s.exists()) throw new Error('No one has that code. Check it and try again.');
    const to = s.data().uid;
    if (friends.some(f => f.uid === to)) throw new Error('You’re already friends.');
    // If they already asked you, accept straight away.
    if (requests.some(r => r.uid === to)) return accept(to);
    try { await c.fs.setDoc(ref(c, 'requests', to, 'in', c.uid), { name: myName(), at: Date.now() }); }
    catch (e) { if (!/permission/i.test(errText(e))) throw e; } // already sent
    return 'sent';
  }
  async function accept(from) {
    const c = cloud(), since = Date.now();
    await c.fs.setDoc(ref(c, 'friends', c.uid, 'list', from), { since });
    await c.fs.setDoc(ref(c, 'friends', from, 'list', c.uid), { since });
    try { await c.fs.deleteDoc(ref(c, 'requests', c.uid, 'in', from)); } catch {}
    try { await c.fs.deleteDoc(ref(c, 'requests', from, 'in', c.uid)); } catch {}
    await refresh(true); return 'friends';
  }
  async function decline(from) { const c = cloud(); try { await c.fs.deleteDoc(ref(c, 'requests', c.uid, 'in', from)); } catch {} requests = requests.filter(r => r.uid !== from); render(); }
  async function unfriend(uid) {
    const c = cloud(), f = friends.find(x => x.uid === uid);
    if (!confirm(`Remove ${f?.name || 'this friend'}? You’ll stop seeing each other’s progress.`)) return;
    try { await c.fs.deleteDoc(ref(c, 'friends', c.uid, 'list', uid)); } catch {}
    try { await c.fs.deleteDoc(ref(c, 'friends', uid, 'list', c.uid)); } catch {}
    friends = friends.filter(x => x.uid !== uid); render();
  }
  const givenKey = 'nextform-kudos-given';
  const given = () => { try { return new Set(JSON.parse(localStorage.getItem(givenKey) || '[]')); } catch { return new Set(); } };
  async function giveKudos(to, workoutId, label) {
    const c = cloud(), key = `${to}:${workoutId}`, g = given(); if (g.has(key)) return;
    try { await c.fs.setDoc(ref(c, 'kudos', to, 'in', `${c.uid}_${String(workoutId).slice(0, 60)}`), { from: c.uid, name: myName(), workout: String(label || '').slice(0, 40), at: Date.now() }); }
    catch (e) { if (!/permission/i.test(errText(e))) throw e; }
    g.add(key); try { localStorage.setItem(givenKey, JSON.stringify([...g].slice(-300))); } catch {}
    render();
  }
  async function clearKudos() { const c = cloud(); for (const k of kudos) try { await c.fs.deleteDoc(ref(c, 'kudos', c.uid, 'in', k.id)); } catch {} kudos = []; render(); }

  // ---------- party quest: hit your combined weekly goals together ----------
  function party() {
    const me = publicProfile(), wk = thisWeek();
    const members = [{ name: 'You', weekCount: me.weekCount, weekGoal: me.weekGoal, me: true },
      ...friends.filter(f => !f.hidden).slice(0, 5).map(f => ({ name: f.name, weekCount: f.week === wk ? +f.weekCount || 0 : 0, weekGoal: +f.weekGoal || 3 }))];
    const goal = members.reduce((a, m) => a + m.weekGoal, 0), have = members.reduce((a, m) => a + Math.min(m.weekCount, m.weekGoal), 0);
    const id = `party-${wk}`, claimed = (data.storyLog || []).some(x => x.id === id);
    return { members, goal, have, done: members.length > 1 && have >= goal, claimed, id };
  }
  function claimParty() {
    const p = party(); if (!p.done || p.claimed) return;
    data.storyLog = Array.isArray(data.storyLog) ? data.storyLog : [];
    data.storyLog.push({ id: p.id, xp: PARTY_XP, t: Date.now() }); data.xp = (+data.xp || 0) + PARTY_XP; save();
  }

  // ---------- rendering ----------
  const ago = ds => { const n = Math.round((new Date(today() + 'T12:00:00') - new Date(ds + 'T12:00:00')) / 864e5); return n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`; };
  const initial = n => esc(String(n || '?').charAt(0).toUpperCase());
  function render() {
    renderHome(); renderProfileCard();
  }
  function renderHome() {
    const box = $('#friendsCard'); if (!box) return;
    if (!sharing() || (!friends.length && !requests.length && !kudos.length)) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    const p = party(), g = given();
    const feed = friends.filter(f => !f.hidden && f.recent?.length).flatMap(f => f.recent.slice(0, 2).map(w => ({ f, w }))).sort((a, b) => String(b.w.date).localeCompare(String(a.w.date))).slice(0, 5);
    box.innerHTML = `<div class="sectionHead"><div class="secTitle"><span class="secIcon"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2a5.2 5.2 0 0 1 5.5 5.8"/></svg></span><h2>Friends</h2></div><button class="link" type="button" data-social-open>Manage</button></div>
      ${kudos.length ? `<div class="kudosIn"><span aria-hidden="true">👏</span><p>${esc(kudos.slice(0, 3).map(k => k.name).join(', '))}${kudos.length > 3 ? ` and ${kudos.length - 3} more` : ''} gave you kudos${kudos[0].workout ? ` for ${esc(kudos[0].workout)}` : ''}.</p><button type="button" class="link" data-kudos-clear>Clear</button></div>` : ''}
      ${requests.length ? `<p class="reqLine">${requests.length} friend request${requests.length > 1 ? 's' : ''} waiting. <button type="button" class="link" data-social-open>See</button></p>` : ''}
      ${p.members.length > 1 ? `<div class="party game"><div class="partyHead"><b>Party quest</b><span>${p.have} / ${p.goal} sessions this week</span></div>
        <div class="goalBar"><i style="width:${Math.min(100, p.have / p.goal * 100)}%"></i></div>
        <p class="muted small">Hit your weekly goals together for +${PARTY_XP} XP each. ${p.members.map(m => `${esc(m.name)} ${Math.min(m.weekCount, m.weekGoal)}/${m.weekGoal}`).join(' · ')}</p>
        ${p.done && !p.claimed ? `<button type="button" class="primary full" data-party-claim>Claim +${PARTY_XP} XP</button>` : p.claimed ? '<p class="small partyDone">Party quest complete this week.</p>' : ''}</div>` : ''}
      ${feed.length ? `<ul class="feed">${feed.map(({ f, w }) => { const k = `${f.uid}:${w.id}`, done = g.has(k);
        return `<li><span class="fAvatar">${initial(f.name)}</span><span class="fText"><b>${esc(f.name)}</b> did ${esc(w.label)}<small>${ago(w.date)}${w.duration ? `, ${w.duration} min` : ''} · Level ${+f.level || 1}</small></span>
          <button type="button" class="kudosBtn${done ? ' given' : ''}" data-kudos="${esc(f.uid)}" data-w="${esc(w.id)}" data-label="${esc(w.label)}" ${done ? 'disabled aria-label="Kudos given"' : `aria-label="Give ${esc(f.name)} kudos"`}>👏</button></li>`; }).join('')}</ul>`
        : friends.length ? '<p class="muted small">No workouts from friends yet this week.</p>' : ''}`;
  }
  function renderProfileCard() {
    const box = $('#socialCard'); if (!box) return;
    const c = cloud(), p = prefs();
    if (!c) { box.innerHTML = `<h2>Friends</h2><p class="muted small">Sign in with Google above to add friends, share progress and do party quests together.</p>`; return; }
    if (!p.on) { box.innerHTML = `<h2>Friends</h2><p class="muted small">Add friends to see each other’s level, weekly sessions and recent workouts, give kudos and do weekly party quests. Your food, weight and notes are never shared. Off until you turn it on.</p><button type="button" class="primary full" data-social-on>Turn on friends</button>`; return; }
    box.innerHTML = `<div class="sectionHead"><h2>Friends</h2><button type="button" class="link muted" data-social-off>Turn off</button></div>
      <div class="codeBox"><span>Your friend code</span><b>${esc(p.code)}</b><button type="button" class="secondary" data-code-share>Share code</button></div>
      <div class="row addFriend"><input id="friendCode" maxlength="7" autocapitalize="characters" autocomplete="off" placeholder="Friend’s code"><button type="button" class="primary" data-add-friend>Add</button></div>
      <p class="muted small" id="friendMsg" role="status"></p>
      ${requests.length ? `<p class="fieldLabel">Requests</p><ul class="friendList">${requests.map(r => `<li><span class="fAvatar">${initial(r.name)}</span><span class="fText"><b>${esc(r.name)}</b><small>wants to be friends</small></span><button type="button" class="primary small" data-accept="${esc(r.uid)}">Accept</button><button type="button" class="link muted" data-decline="${esc(r.uid)}">Ignore</button></li>`).join('')}</ul>` : ''}
      <p class="fieldLabel">${friends.length ? `${friends.length} friend${friends.length > 1 ? 's' : ''}` : 'No friends yet'}</p>
      ${friends.length ? `<ul class="friendList">${friends.map(f => `<li><span class="fAvatar">${initial(f.name)}</span><span class="fText"><b>${esc(f.name)}</b><small>${f.hidden ? 'Not sharing right now' : `Level ${+f.level || 1} · ${f.week === thisWeek() ? +f.weekCount || 0 : 0} of ${+f.weekGoal || 3} this week${+f.streak > 1 ? ` · ${f.streak}-week streak` : ''}`}</small></span><button type="button" class="link muted" data-unfriend="${esc(f.uid)}">Remove</button></li>`).join('')}</ul>` : '<p class="muted small">Share your code with a friend, or type theirs above.</p>'}
      <p class="tiny muted">Friends see your first name, level, weekly sessions, streak and your last 3 workouts (type, name, date, length). Never your food, weight or notes.</p>`;
  }

  // ---------- events ----------
  const msg = t => { const m = $('#friendMsg'); if (m) m.textContent = t; };
  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-social-on],[data-social-off],[data-add-friend],[data-accept],[data-decline],[data-unfriend],[data-kudos],[data-kudos-clear],[data-party-claim],[data-code-share],[data-social-open]');
    if (!t) return;
    try {
      if (t.matches('[data-social-open]')) { go('profile'); setTimeout(() => $('#socialCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); }
      else if (t.matches('[data-social-on]')) { t.disabled = true; t.textContent = 'Turning on…'; await enable(); }
      else if (t.matches('[data-social-off]')) { if (confirm('Turn off friends? Friends will stop seeing your progress. Your friendships are kept if you turn it back on.')) await disable(); }
      else if (t.matches('[data-add-friend]')) { t.disabled = true; const r = await addByCode($('#friendCode').value); render(); msg(r === 'friends' ? 'You’re now friends!' : 'Request sent. You’ll be friends once they accept.'); }
      else if (t.matches('[data-accept]')) await accept(t.dataset.accept);
      else if (t.matches('[data-decline]')) await decline(t.dataset.decline);
      else if (t.matches('[data-unfriend]')) await unfriend(t.dataset.unfriend);
      else if (t.matches('[data-kudos]')) await giveKudos(t.dataset.kudos, t.dataset.w, t.dataset.label);
      else if (t.matches('[data-kudos-clear]')) await clearKudos();
      else if (t.matches('[data-party-claim]')) claimParty();
      else if (t.matches('[data-code-share]')) {
        const text = `Add me on NextForm! My friend code is ${prefs().code}. ${location.origin}${location.pathname}`;
        try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); msg('Copied. Paste it to a friend.'); } } catch {}
      }
    } catch (err) { msg(err?.message && !/permission|internal/i.test(err.message) ? err.message : 'Something went wrong. Please try again.'); console.warn('social', err); t.disabled = false; }
  });
  window.addEventListener('nextform-saved', schedulePush);
  window.addEventListener('nextform-cloud-ready', () => { if (prefs().on) { pushProfile(true).catch(() => {}); refresh(true); } else render(); });
  window.addEventListener('nextform-auth', e => { if (!e.detail?.signedIn) { friends = []; requests = []; kudos = []; loaded = false; } render(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && sharing()) refresh(); });
  window.NextFormSocial = { render, refresh, enable, disable, removeEverything, party, publicProfile, addByCode, accept, get state() { return { friends, requests, kudos }; } };
  render();
})();
