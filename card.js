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
      ${badges.length ? `<div class="pcBadges">${badges.map(b => `<span class="nfBadge ${b.tier}" title="${esc(b.name)}"><i>${b.icon}</i><small>${esc(b.name)}</small></span>`).join('')}</div>` : ''}
      ${stats.length ? `<div class="pcStats">${stats.map(s => `<div><b>${esc(s.v)}</b><small>${esc(STATS[s.k][0])}</small></div>`).join('')}</div>` : ''}
      ${prs.length ? `<div class="pcPrs"><small>Best lifts</small>${prs.map(x => `<p><span>${esc(x.n)}</span><b>${fmt(+x.kg)} kg × ${+x.r}</b></p>`).join('')}</div>` : ''}
    </div>`;
  }
  const me = () => { const lv = levelInfo(data.xp || 0); return { name: String(data.profile.name || 'You').split(/\s+/)[0], level: lv.level, rank: rankFor(lv.level), streak: weekStreak(), photo: data.profile.photo }; };

  function renderProfileBox() {
    const box = $('#profileCardBox'); if (!box) return;
    const all = B().all(), n = all.filter(b => b.earned).length, socialOn = !!data.profile.social?.on;
    box.innerHTML = `${cardHTML(shared(), me())}
      <div class="row pcBtns"><button type="button" class="secondary" data-card-edit>Edit card</button><button type="button" class="secondary" data-card-share>Share</button></div>
      <p class="muted tiny pcVis">${shareOn() && socialOn ? 'Friends can see your card' : 'Only you can see your card'} · ${n} of ${all.length} badges</p>`;
    if (!$('#ptab-card')?.hidden) renderExtras();
    if (!$('#ptab-badges')?.hidden) renderBadgesInline();
  }
  // Card tab: the next few badges you're closest to.
  function renderExtras() {
    const box = $('#cardExtras'); if (!box) return;
    const next = B().all().filter(b => !b.earned && b.have > 0).sort((a, b) => b.have / b.need - a.have / a.need).slice(0, 3);
    const fresh = B().all().filter(b => b.earned && b.date).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3);
    const row = b => `<li class="${b.earned ? 'earned' : 'locked'}"><span class="nfBadge ${b.tier}"><i>${b.icon}</i></span><span class="bText"><b>${esc(b.name)}</b><small>${esc(b.how)}</small>${b.earned ? '' : `<span class="goalBar"><i style="width:${Math.round(b.have / b.need * 100)}%"></i></span><small>${fmtN(Math.floor(b.have))} / ${fmtN(b.need)}</small>`}</span></li>`;
    box.innerHTML = `<div class="sectionHead"><h2>Next badges</h2><button type="button" class="link" data-ptab="badges">See all</button></div>
      ${next.length ? `<ul class="badgeList">${next.map(row).join('')}</ul>` : '<p class="muted small">Log a workout to start earning badges.</p>'}
      ${fresh.length ? `<p class="fieldLabel">Recently earned</p><ul class="badgeList">${fresh.map(row).join('')}</ul>` : ''}`;
  }
  function renderBadgesInline() { const box = $('#badgesInline'); if (box) box.innerHTML = `<h2>Badges</h2>${badgesHTML()}`; }

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
    const selB = chosenBadges().map(b => b.id), selP = chosenPrs().map(x => x.n), selS = p.stats.filter(k => STATS[k]).slice(0, MAX.stats);
    // Selected items are filled in and numbered with their position on the card.
    const mark = (list, v) => { const i = list.indexOf(v); return i < 0 ? { cls: '', num: '', label: 'Not on your card' } : { cls: ' on', num: `<span class="pickNum" aria-hidden="true">${i + 1}</span>`, label: `On your card, position ${i + 1}` }; };
    const socialOn = !!data.profile.social?.on;
    $('#cardBody').innerHTML = `${cardHTML(shared(), me())}
      <label class="toggleRow pcShare"><input type="checkbox" id="cardShare" ${p.share ? 'checked' : ''}><span><b>Friends can see my card</b><small>${socialOn ? 'Friends tap your name to see it. Food, weight and notes are never shown.' : 'Turn on Friends (Profile, Friends tab) first, then friends can tap your name to see it.'}</small></span></label>
      <p class="muted small pickHelp">Tap to add or remove. Ticked items are numbered in the order they appear on your card. To change the order, untick and tick again.</p>
      <p class="fieldLabel">Background</p>
      <div class="bgGrid">${B().BACKGROUNDS.map(bg => { const ok = B().bgUnlocked(bg), ub = bg.unlock && B().byId(bg.unlock);
        return `<button type="button" class="bgOpt${p.bg === bg.id ? ' on' : ''}${ok ? '' : ' locked'}" data-bg="${bg.id}" style="${B().bgStyle(bg)}" aria-label="${esc(bg.name)}${ok ? '' : ', locked'}"><span>${esc(bg.name)}</span>${ok ? '' : `<em>🔒 ${esc(ub?.name || '')}</em>`}</button>`; }).join('')}</div>
      <p class="muted tiny" id="bgHint" role="status">Locked backgrounds unlock with badges.</p>
      <p class="fieldLabel">Badges <span class="muted">(${selB.length} of ${MAX.badges} chosen)</span></p>
      ${earned.length ? `<div class="pickGrid">${earned.map(b => { const m = mark(selB, b.id); return `<button type="button" class="pick badgePick${m.cls}" data-pick-badge="${b.id}" aria-pressed="${!!m.num}" title="${m.label}">${m.num}<span class="nfBadge ${b.tier}"><i>${b.icon}</i></span><small>${esc(b.name)}</small></button>`; }).join('')}</div>` : '<p class="muted small">No badges yet. Log a workout to earn your first.</p>'}
      <p class="fieldLabel">Stats <span class="muted">(${selS.length} of ${MAX.stats} chosen)</span></p>
      <div class="chips wrapChips">${Object.entries(STATS).map(([k, [label, fn]]) => { const m = mark(selS, k); return `<button type="button" class="chip pickChip${m.cls}" data-pick-stat="${k}" aria-pressed="${!!m.num}" title="${m.label}">${m.num}${esc(label)} <b>${esc(fn(c))}</b></button>`; }).join('')}</div>
      <p class="fieldLabel">Best lifts <span class="muted">(${selP.length} of ${MAX.prs} chosen)</span></p>
      ${L.length ? `<div class="chips wrapChips">${L.slice(0, 30).map(x => { const m = mark(selP, x.n); return `<button type="button" class="chip pickChip${m.cls}" data-pick-pr="${esc(x.n)}" aria-pressed="${!!m.num}" title="${m.label}">${m.num}${esc(x.n)} <b>${fmt(x.kg)} kg × ${x.r}</b></button>`; }).join('')}</div>` : '<p class="muted small">Log a weighted exercise to show your best lifts.</p>'}
      <p class="muted small" id="cardMsg" role="status"></p>`;
  }
  function toggle(listKey, current, value, max) {
    const p = prefs(), list = current.slice();
    const i = list.indexOf(value);
    if (i >= 0) list.splice(i, 1); else { if (list.length >= max) { $('#cardMsg').textContent = `You can show up to ${max}. Untick one first.`; return; } list.push(value); }
    p[listKey] = list; save(); renderEditor();
  }

  function renderBadges() { $('#cardTitle').textContent = 'Badges'; $('#cardBody').innerHTML = badgesHTML(); }
  function badgesHTML() {
    const all = B().all(), n = all.filter(b => b.earned).length, groups = [...new Set(all.map(b => b.group))];
    return `<p class="muted">${n} of ${all.length} earned. Badges unlock automatically from your workouts, food, quests and friends, and some unlock new card backgrounds.</p>
      ${groups.map(g => `<p class="fieldLabel">${esc(g)}</p><ul class="badgeList">${all.filter(b => b.group === g).map(b => { const bg = B().BACKGROUNDS.find(x => x.unlock === b.id);
        return `<li class="${b.earned ? 'earned' : 'locked'}"><span class="nfBadge ${b.tier}"><i>${b.icon}</i></span><span class="bText"><b>${esc(b.name)}</b><small>${esc(b.how)}${bg ? ` Unlocks the ${esc(bg.name)} background.` : ''}</small>
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

  // ---------- share the card as an image (drawn on a canvas, 1080 × 1440) ----------
  const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  async function cardImage() {
    const W = 1080, H = 1440, FONT = '"Bricolage Grotesque", system-ui, sans-serif', card = shared(), who = me(), bg = B().bgById(card.bg);
    try { await document.fonts?.load(`800 80px ${FONT}`); } catch {}
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const rr = (l, tp, w, h, r) => { x.beginPath(); x.moveTo(l + r, tp); x.arcTo(l + w, tp, l + w, tp + h, r); x.arcTo(l + w, tp + h, l, tp + h, r); x.arcTo(l, tp + h, l, tp, r); x.arcTo(l, tp, l + w, tp, r); x.closePath(); };
    const img = bg.img ? await loadImg(`cards/${bg.id}.webp`) : null;
    if (img) { const s = Math.max(W / img.width, H / img.height), w = img.width * s, h = img.height * s; x.drawImage(img, (W - w) / 2, H - h, w, h); }
    else { x.fillStyle = '#1f4a3a'; x.fillRect(0, 0, W, H); }
    const ink = bg.dark ? '#fff' : '#16352a', soft = bg.dark ? 'rgba(255,255,255,.8)' : 'rgba(22,53,42,.75)', box = bg.dark ? 'rgba(0,0,0,.34)' : 'rgba(255,255,255,.66)';
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, bg.dark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.35)'); g.addColorStop(.6, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const txt = (s, px, X, Y, { w = 800, col = ink, align = 'left', max } = {}) => { x.font = `${w} ${px}px ${FONT}`; x.fillStyle = col; x.textAlign = align; x.textBaseline = 'alphabetic'; x.fillText(String(s), X, Y, max); };
    // header
    x.save(); x.beginPath(); x.arc(150, 170, 80, 0, Math.PI * 2); x.closePath(); x.fillStyle = bg.dark ? 'rgba(255,255,255,.22)' : 'rgba(22,53,42,.1)'; x.fill();
    const photo = who.photo ? await loadImg(who.photo) : null;
    if (photo) { x.clip(); const s = Math.max(160 / photo.width, 160 / photo.height); x.drawImage(photo, 150 - photo.width * s / 2, 170 - photo.height * s / 2, photo.width * s, photo.height * s); }
    else txt(String(who.name || '?').charAt(0).toUpperCase(), 80, 150, 198, { align: 'center' });
    x.restore();
    txt(who.name || 'Me', 72, 260, 165, { max: 560 }); txt(`Level ${who.level}${who.rank ? ' · ' + who.rank : ''}`, 36, 260, 220, { w: 600, col: soft, max: 560 });
    if (who.streak > 1) { x.fillStyle = box; rr(830, 120, 170, 90, 45); x.fill(); txt(`🔥 ${who.streak}`, 42, 915, 180, { align: 'center' }); }
    // badges
    let y = 300; const badges = card.badges.map(id => B().byId(id)).filter(Boolean), ring = { bronze: ['#d9a066', '#9a6230'], silver: ['#d7dde2', '#8d99a3'], gold: ['#f3cf5a', '#b88a12'], special: ['#b99cf5', '#6a3fd1'] };
    if (badges.length) {
      const step = (W - 160) / 6;
      badges.forEach((b, i) => { const cx = 80 + step * i + step / 2, cy = y + 70, [f, r] = ring[b.tier] || ring.bronze;
        x.beginPath(); x.arc(cx, cy, 58, 0, Math.PI * 2); x.fillStyle = f; x.fill(); x.lineWidth = 9; x.strokeStyle = r; x.stroke();
        txt(b.icon, 54, cx, cy + 19, { w: 400, align: 'center' }); txt(b.name, 24, cx, cy + 102, { w: 700, align: 'center', max: step - 8 }); });
      y += 200;
    }
    // stats
    const st = card.stats.filter(s => STATS[s.k]);
    st.forEach((s, i) => { const cw = (W - 160 - 24) / 2, ch = 160, cx = 80 + (i % 2) * (cw + 24), cy = y + Math.floor(i / 2) * (ch + 24);
      x.fillStyle = box; rr(cx, cy, cw, ch, 28); x.fill(); txt(s.v, 64, cx + 32, cy + 84, { max: cw - 64 }); txt(STATS[s.k][0], 30, cx + 32, cy + 130, { w: 600, col: soft, max: cw - 64 }); });
    y += Math.ceil(st.length / 2) * 184 + 10;
    // best lifts
    if (card.prs.length) {
      const h = 80 + card.prs.length * 64; x.fillStyle = box; rr(80, y, W - 160, h, 28); x.fill();
      txt('BEST LIFTS', 26, 112, y + 52, { w: 700, col: soft });
      card.prs.forEach((p, i) => { const yy = y + 110 + i * 64; txt(p.n, 38, 112, yy, { w: 600, max: 560 }); txt(`${fmt(p.kg)} kg × ${p.r}`, 38, W - 112, yy, { align: 'right' }); });
    }
    x.font = `600 28px ${FONT}`; x.fillStyle = bg.dark ? 'rgba(255,255,255,.75)' : 'rgba(22,53,42,.7)'; x.textAlign = 'center'; x.fillText('NextForm', W / 2, H - 46);
    return c;
  }
  async function shareImage(btn) {
    const label = btn.textContent; btn.disabled = true; btn.textContent = 'Making image…';
    try {
      const c = await cardImage();
      if (window.NextFormShare?.deliver) await window.NextFormShare.deliver(c, 'nextform-card', 'My NextForm card');
    } catch (e) { console.warn('card share', e); alert('Couldn’t make the image. Please try again.'); }
    finally { btn.disabled = false; btn.textContent = label; }
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-card-edit],[data-card-share],[data-friend-card],[data-bg],[data-pick-badge],[data-pick-stat],[data-pick-pr],#cardClose');
    if (!t) { if (e.target.id === 'cardSheet') close(); return; }
    if (t.id === 'cardClose') return close();
    if (t.matches('[data-card-edit]')) return open('edit');
    if (t.matches('[data-card-share]')) return shareImage(t);
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

  window.NextFormCard = { shared, shareOn, cardHTML, open, close, render: renderProfileBox, renderExtras, renderBadgesInline, cardImage, lifts, STATS };
  renderProfileBox();
})();
