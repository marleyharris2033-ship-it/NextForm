// NextForm profile card: pick a background, up to 6 badges, 4 stats and 3 PRs. Private unless you switch on
// "Friends can see my card" (and have Friends turned on). Friends tap your name to see it.
(() => {
  const MAX = { badges: 6, stats: 4, prs: 3 };
  const B = () => window.NextFormBadges;
  const fmtN = n => Number(n || 0).toLocaleString('en-GB');
  const STATS = {
    workouts: ['Workouts', c => fmtN(c.workouts)],
    year: ['Workouts this year', () => fmtN((data.workouts || []).filter(w => String(w.date).startsWith(today().slice(0, 4))).length)],
    streak: ['Week streak', () => fmtN(weekStreak())],
    bestStreak: ['Best streak', c => `${fmtN(c.bestStreak)} wk`],
    level: ['Level', c => fmtN(c.level)],
    hours: ['Hours trained', c => fmtN(c.hours)],
    km: ['Distance', c => `${fmtN(c.km)} km`],
    tonnes: ['Lifted', c => `${fmtN(c.tonnes)} t`],
    quests: ['Quests done', c => fmtN(c.quests)],
    badges: ['Badges', () => fmtN(Object.keys(B().earned()).length)],
    mobility: ['Stretch sessions', c => fmtN(c.mobility)]
  };
  const DEFAULT_STATS = ['workouts', 'bestStreak', 'hours', 'quests'];
  const prefs = () => { const p = data.profile.card && typeof data.profile.card === 'object' ? data.profile.card : (data.profile.card = {});
    if (!Array.isArray(p.stats)) p.stats = DEFAULT_STATS.slice(); if (typeof p.bg !== 'string') p.bg = 'pine'; return p; };

  // Best set per exercise, most-trained first.
  function lifts() {
    const m = {};
    for (const w of data.workouts || []) for (const e of w.exercises || []) {
      const n = String(e.name || '').trim(); if (!n) continue;
      const r = m[n] || (m[n] = { n, kg: 0, r: 0, times: 0 }); r.times++;
      for (const s of setsOf(e)) if (s.reps > 0 && (s.kg > r.kg || (s.kg === r.kg && s.reps > r.r))) { r.kg = s.kg; r.r = s.reps; }
    }
    return Object.values(m).filter(x => x.kg > 0).sort((a, b) => b.times - a.times || b.kg - a.kg);
  }
  const chosenBadges = () => { const earned = B().all().filter(b => b.earned), p = prefs();
    if (Array.isArray(p.badges)) return p.badges.map(id => earned.find(b => b.id === id)).filter(Boolean).slice(0, MAX.badges);
    const rank = { special: 4, gold: 3, silver: 2, bronze: 1 };
    return earned.sort((a, b) => rank[b.tier] - rank[a.tier] || String(b.date).localeCompare(String(a.date))).slice(0, MAX.badges); };
  const chosenPrs = () => { const L = lifts(), p = prefs();
    if (Array.isArray(p.prs)) return p.prs.map(n => L.find(x => x.n === n)).filter(Boolean).slice(0, MAX.prs);
    const big = ['Bench Press', 'Back Squat', 'Deadlift'].map(n => L.find(x => x.n === n)).filter(Boolean);
    return [...big, ...L.filter(x => !big.includes(x))].slice(0, MAX.prs); };

  // The card as shared with friends: just ids and numbers, rendered with each viewer's own badge list.
  function shared() {
    const c = B().context(), p = prefs();
    return { v: 1, bg: String(p.bg).slice(0, 30), badges: chosenBadges().map(b => b.id),
      stats: p.stats.filter(k => STATS[k]).slice(0, MAX.stats).map(k => ({ k, v: String(STATS[k][1](c)).slice(0, 20) })),
      prs: chosenPrs().map(x => ({ n: x.n.slice(0, 40), kg: +x.kg || 0, r: +x.r || 0 })) };
  }
  const shareOn = () => !!prefs().share;

  // ---------- drawing ----------
  const initial = n => esc(String(n || '?').charAt(0).toUpperCase());
  function cardHTML(card, who) {
    const bg = B().bgById(card?.bg), badges = (card?.badges || []).map(id => B().byId(id)).filter(Boolean).slice(0, MAX.badges);
    const stats = (card?.stats || []).filter(s => s && STATS[s.k]).slice(0, MAX.stats), prs = (card?.prs || []).filter(x => x && x.n).slice(0, MAX.prs);
    return `<div class="pCard ${bg.dark ? 'onDark' : 'onLight'}" style="${B().bgStyle(bg)}">
      <div class="pcHead">${who.photo ? `<img class="pcAvatar" src="${esc(who.photo)}" alt="">` : `<span class="pcAvatar">${initial(who.name)}</span>`}
        <div><b class="pcName">${esc(who.name || 'Friend')}</b><span class="pcRank">Level ${+who.level || 1}${who.rank ? ` · ${esc(who.rank)}` : ''}</span></div>
        ${+who.streak > 1 ? `<span class="pcStreak" title="Week streak">🔥 ${+who.streak}</span>` : ''}</div>
      ${badges.length ? `<div class="pcBadges">${badges.map(b => `<span class="badge ${b.tier}" title="${esc(b.name)}"><i>${b.icon}</i><small>${esc(b.name)}</small></span>`).join('')}</div>` : ''}
      ${stats.length ? `<div class="pcStats">${stats.map(s => `<div><b>${esc(s.v)}</b><small>${esc(STATS[s.k][0])}</small></div>`).join('')}</div>` : ''}
      ${prs.length ? `<div class="pcPrs"><small>Best lifts</small>${prs.map(x => `<p><span>${esc(x.n)}</span><b>${fmt(+x.kg)} kg × ${+x.r}</b></p>`).join('')}</div>` : ''}
    </div>`;
  }
  const me = () => { const lv = levelInfo(data.xp || 0); return { name: String(data.profile.name || 'You').split(/\s+/)[0], level: lv.level, rank: rankFor(lv.level), streak: weekStreak(), photo: data.profile.photo }; };

  function renderProfileBox() {
    const box = $('#profileCardBox'); if (!box) return;
    const all = B().all(), n = all.filter(b => b.earned).length, socialOn = !!data.profile.social?.on;
    box.innerHTML = `<div class="sectionHead"><h2>Your profile card</h2><span class="muted small">${shareOn() && socialOn ? 'Friends can see it' : 'Only you'}</span></div>
      ${cardHTML(shared(), me())}
      <div class="row pcBtns"><button type="button" class="secondary" data-card-edit>Edit card</button><button type="button" class="secondary" data-badges-open>Badges ${n}/${all.length}</button></div>`;
  }

  // ---------- sheet ----------
  let view = null;
  const sheet = () => $('#cardSheet');
  function open(v, arg) {
    view = v; const s = sheet(); if (!s) return;
    s.classList.remove('hidden'); document.body.classList.add('sheetOpen');
    if (v === 'edit') renderEditor(); else if (v === 'badges') renderBadges(); else if (v === 'friend') renderFriend(arg);
    $('#cardBody').scrollTop = 0;
  }
  function close() { sheet()?.classList.add('hidden'); view = null; if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen'); renderProfileBox(); }

  function renderEditor() {
    $('#cardTitle').textContent = 'Edit profile card';
    const p = prefs(), all = B().all(), earned = all.filter(b => b.earned), c = B().context(), L = lifts();
    const selB = new Set(chosenBadges().map(b => b.id)), selP = new Set(chosenPrs().map(x => x.n)), selS = new Set(p.stats);
    const socialOn = !!data.profile.social?.on;
    $('#cardBody').innerHTML = `${cardHTML(shared(), me())}
      <label class="toggleRow pcShare"><input type="checkbox" id="cardShare" ${p.share ? 'checked' : ''}><span><b>Friends can see my card</b><small>${socialOn ? 'Friends tap your name to see it. Food, weight and notes are never shown.' : 'Turn on Friends in Profile first, then friends can tap your name to see it.'}</small></span></label>
      <p class="fieldLabel">Background</p>
      <div class="bgGrid">${B().BACKGROUNDS.map(bg => { const ok = B().bgUnlocked(bg), ub = bg.unlock && B().byId(bg.unlock);
        return `<button type="button" class="bgOpt${p.bg === bg.id ? ' on' : ''}${ok ? '' : ' locked'}" data-bg="${bg.id}" style="${B().bgStyle(bg)}" aria-label="${esc(bg.name)}${ok ? '' : ', locked'}"><span>${esc(bg.name)}</span>${ok ? '' : `<em>🔒 ${esc(ub?.name || '')}</em>`}</button>`; }).join('')}</div>
      <p class="muted tiny" id="bgHint" role="status">Locked backgrounds unlock with badges.</p>
      <p class="fieldLabel">Badges <span class="muted">(pick up to ${MAX.badges})</span></p>
      ${earned.length ? `<div class="pickGrid">${earned.map(b => `<button type="button" class="pick badgePick${selB.has(b.id) ? ' on' : ''}" data-pick-badge="${b.id}"><span class="badge ${b.tier}"><i>${b.icon}</i></span><small>${esc(b.name)}</small></button>`).join('')}</div>` : '<p class="muted small">No badges yet. Log a workout to earn your first.</p>'}
      <p class="fieldLabel">Stats <span class="muted">(pick up to ${MAX.stats})</span></p>
      <div class="chips wrapChips">${Object.entries(STATS).map(([k, [label, fn]]) => `<button type="button" class="chip${selS.has(k) ? ' on' : ''}" data-pick-stat="${k}">${esc(label)} <b>${esc(fn(c))}</b></button>`).join('')}</div>
      <p class="fieldLabel">Best lifts <span class="muted">(pick up to ${MAX.prs})</span></p>
      ${L.length ? `<div class="chips wrapChips">${L.slice(0, 30).map(x => `<button type="button" class="chip${selP.has(x.n) ? ' on' : ''}" data-pick-pr="${esc(x.n)}">${esc(x.n)} <b>${fmt(x.kg)} kg × ${x.r}</b></button>`).join('')}</div>` : '<p class="muted small">Log a weighted exercise to show your best lifts.</p>'}
      <p class="muted small" id="cardMsg" role="status"></p>`;
  }
  function toggle(listKey, current, value, max) {
    const p = prefs(), list = current.slice();
    const i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1); else { if (list.length >= max) { $('#cardMsg').textContent = `You can show up to ${max}. Untick one first.`; return; } list.push(value); }
    p[listKey] = list; save(); renderEditor();
  }

  function renderBadges() {
    $('#cardTitle').textContent = 'Badges';
    const all = B().all(), n = all.filter(b => b.earned).length, groups = [...new Set(all.map(b => b.group))];
    $('#cardBody').innerHTML = `<p class="muted">${n} of ${all.length} earned. Badges unlock automatically from your workouts, food, quests and friends, and some unlock new card backgrounds.</p>
      ${groups.map(g => `<p class="fieldLabel">${esc(g)}</p><ul class="badgeList">${all.filter(b => b.group === g).map(b => { const bg = B().BACKGROUNDS.find(x => x.unlock === b.id);
        return `<li class="${b.earned ? 'earned' : 'locked'}"><span class="badge ${b.tier}"><i>${b.icon}</i></span><span class="bText"><b>${esc(b.name)}</b><small>${esc(b.how)}${bg ? ` Unlocks the ${esc(bg.name)} background.` : ''}</small>
          ${b.earned ? `<small class="bDone">Earned${b.date ? ` ${new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</small>` : `<span class="goalBar"><i style="width:${Math.round(b.have / b.need * 100)}%"></i></span><small>${fmtN(Math.floor(b.have))} / ${fmtN(b.need)}</small>`}</span></li>`; }).join('')}</ul>`).join('')}`;
  }

  function renderFriend(uid) {
    const f = window.NextFormSocial?.state?.friends?.find(x => x.uid === uid);
    $('#cardTitle').textContent = f ? `${f.name}’s card` : 'Card';
    if (!f) { $('#cardBody').innerHTML = '<p class="muted">This friend isn’t available right now.</p>'; return; }
    $('#cardBody').innerHTML = f.card && typeof f.card === 'object'
      ? cardHTML(f.card, { name: f.name, level: f.level, rank: f.rank, streak: f.streak }) + `<p class="muted tiny">Badges ${esc(f.name)} has chosen to show.</p>`
      : `${cardHTML({ bg: 'mist' }, { name: f.name, level: f.level, rank: f.rank, streak: f.streak })}<p class="muted small">${esc(f.name)} hasn’t shared a profile card yet.</p>`;
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-card-edit],[data-badges-open],[data-friend-card],[data-bg],[data-pick-badge],[data-pick-stat],[data-pick-pr],#cardClose');
    if (!t) { if (e.target.id === 'cardSheet') close(); return; }
    if (t.id === 'cardClose') return close();
    if (t.matches('[data-card-edit]')) return open('edit');
    if (t.matches('[data-badges-open]')) return open('badges');
    if (t.matches('[data-friend-card]')) return open('friend', t.dataset.friendCard);
    if (t.matches('[data-bg]')) {
      const bg = B().bgById(t.dataset.bg);
      if (!B().bgUnlocked(bg)) { const ub = B().byId(bg.unlock); $('#bgHint').textContent = `Earn “${ub?.name}” to unlock ${bg.name}: ${ub?.how || ''}`; return; }
      prefs().bg = bg.id; save(); return renderEditor();
    }
    if (t.matches('[data-pick-badge]')) return toggle('badges', chosenBadges().map(b => b.id), t.dataset.pickBadge, MAX.badges);
    if (t.matches('[data-pick-stat]')) return toggle('stats', prefs().stats.filter(k => STATS[k]), t.dataset.pickStat, MAX.stats);
    if (t.matches('[data-pick-pr]')) return toggle('prs', chosenPrs().map(x => x.n), t.dataset.pickPr, MAX.prs);
  });
  document.addEventListener('change', e => { if (e.target.id === 'cardShare') { prefs().share = e.target.checked; save(); renderEditor(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && view) close(); });
  window.addEventListener('nextform-saved', () => { if (!view) renderProfileBox(); });

  window.NextFormCard = { shared, shareOn, cardHTML, open, close, render: renderProfileBox, lifts, STATS };
  renderProfileBox();
})();
