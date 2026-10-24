// NextForm share cards: story-sized images (1080 × 1920) for a level, a finished workout and a monthly recap.
// Drawn on a canvas on the device, then shared with the phone's share sheet (Instagram, WhatsApp...) or saved.
(() => {
  const W = 1080, H = 1920, PINE = '#1f4a3a', LICHEN = '#a6c46f', AMBER = '#e3a02f';
  const FONT = '"Bricolage Grotesque", system-ui, sans-serif';
  let logo = null;
  const loadLogo = () => logo || (logo = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'logo-mark.png'; }));

  async function canvas() {
    try { await document.fonts?.load(`800 100px ${FONT}`); } catch {}
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, W * .4, H); g.addColorStop(0, '#2b6049'); g.addColorStop(.55, PINE); g.addColorStop(1, '#0f251e');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // contour lines, like the Home card
    x.strokeStyle = 'rgba(166,196,111,.13)'; x.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const y = 1380 + i * 70; x.beginPath(); x.moveTo(-40, y); x.bezierCurveTo(260, y - 160 - i * 8, 520, y + 60, 760, y - 70); x.bezierCurveTo(900, y - 140, 1000, y - 40, 1120, y - 120); x.stroke(); }
    const l = await loadLogo();
    if (l) { x.fillStyle = '#eef2ec'; roundRect(x, 84, 114, 104, 104, 28); x.fill(); x.drawImage(l, 94, 124, 84, 84); }
    x.fillStyle = '#fff'; x.font = `800 54px ${FONT}`; x.textBaseline = 'middle'; x.fillText('NextForm', l ? 204 : 90, 168);
    return { c, x };
  }
  function text(x, s, px, y, { weight = 700, color = '#fff', align = 'left', max = W - 180, lx = 90 } = {}) {
    x.font = `${weight} ${px}px ${FONT}`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'alphabetic';
    x.fillText(s, align === 'center' ? W / 2 : lx, y, max);
    x.textAlign = 'left';
  }
  // Word-wrapped paragraph, returns the y after the last line.
  function para(x, s, px, y, opts = {}) {
    const { weight = 600, color = 'rgba(255,255,255,.8)', lh = 1.32, max = W - 180, align = 'left' } = opts;
    x.font = `${weight} ${px}px ${FONT}`;
    const words = String(s).split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    lines.forEach((ln, i) => text(x, ln, px, y + i * px * lh, { weight, color, align, max }));
    return y + lines.length * px * lh;
  }
  function pill(x, s, y, color = LICHEN) {
    x.font = `800 34px ${FONT}`; const w = x.measureText(s).width + 64;
    x.fillStyle = color; roundRect(x, 90, y, w, 72, 36); x.fill();
    text(x, s, 34, y + 48, { weight: 800, color: '#14301f', lx: 122 });
  }
  function roundRect(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }
  function stats(x, items, y) {
    const cols = items.length > 2 ? 3 : 2, gap = 24, cw = (W - 180 - gap * (cols - 1)) / cols, ch = 210;
    items.forEach((it, i) => {
      const cx = 90 + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + gap);
      x.fillStyle = 'rgba(255,255,255,.08)'; roundRect(x, cx, cy, cw, ch, 32); x.fill();
      text(x, it[0], 76, cy + 112, { weight: 800, lx: cx + 34, max: cw - 60 });
      text(x, it[1], 32, cy + 168, { weight: 600, color: 'rgba(255,255,255,.7)', lx: cx + 34, max: cw - 60 });
    });
    return y + Math.ceil(items.length / cols) * (ch + gap);
  }
  function footer(x, line, by = '') {
    if (line) { const y = para(x, `“${line}”`, 40, by ? 1660 : 1700, { weight: 600, color: 'rgba(255,255,255,.85)', align: 'center' }); if (by) text(x, by, 30, y + 6, { weight: 600, color: LICHEN, align: 'center' }); }
    text(x, 'Tracked with NextForm', 30, 1836, { weight: 600, color: 'rgba(255,255,255,.5)', align: 'center' });
  }
  const quoteLine = () => { if (!window.Encourage?.on()) return ['']; const q = Encourage.quote(); return [q.text, q.by === 'NextForm' ? '' : q.by]; };
  const g1 = n => (Math.round(n * 10) / 10).toString();
  const volumeOf = w => (w.exercises || []).reduce((a, e) => a + setsOf(e).reduce((b, s) => b + (e.unit === 's' ? 0 : (+s.kg || 0) * (+s.reps || 0)), 0), 0);
  const kgText = kg => kg >= 10000 ? `${g1(kg / 1000)} t` : `${fmt(Math.round(kg))} kg`;

  // ---------- the three cards ----------
  async function levelCard() {
    const { c, x } = await canvas();
    const b = levelBreakdown(data, CHALLENGES), first = (data.profile?.name || '').trim().split(' ')[0];
    text(x, first ? `${first} reached` : 'Reached', 52, 420, { weight: 600, color: 'rgba(255,255,255,.75)' });
    text(x, `Level ${b.level}`, 190, 600, { weight: 800 });
    pill(x, `${titleCase(rankFor(b.level))} rank`, 650);
    // discipline ring
    const cx = W / 2, cy = 1110, R = 250, lw = 64, C = 2 * Math.PI;
    x.lineWidth = lw; x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(cx, cy, R, 0, C); x.stroke();
    let a = -Math.PI / 2; x.lineCap = 'butt';
    for (const p of b.parts.filter(p => p.xp > 0)) { const s = p.xp / b.need * C; x.strokeStyle = p.color; x.beginPath(); x.arc(cx, cy, R, a, a + Math.max(0, s - .02)); x.stroke(); a += s; }
    text(x, `${Math.floor(b.into / b.need * 100)}%`, 120, cy + 30, { weight: 800, align: 'center' });
    text(x, `to level ${b.level + 1}`, 38, cy + 90, { weight: 600, color: 'rgba(255,255,255,.7)', align: 'center' });
    const parts = b.parts.filter(p => p.xp > 0);
    x.font = `700 34px ${FONT}`;
    const legend = parts.map(p => ({ p, w: x.measureText(p.name).width + 70 })), total = legend.reduce((s, l) => s + l.w, 0);
    let lx = Math.max(90, (W - total) / 2);
    for (const { p, w } of legend) { x.fillStyle = p.color; x.beginPath(); x.arc(lx + 14, 1450, 14, 0, C); x.fill(); text(x, p.name, 34, 1462, { weight: 700, lx: lx + 40, color: 'rgba(255,255,255,.85)' }); lx += w; }
    const st = typeof weekStreak === 'function' ? weekStreak() : 0;
    text(x, `${fmt(data.workouts.length)} workouts${st > 1 ? `  ·  ${st}-week streak` : ''}`, 40, 1580, { weight: 700, align: 'center', color: 'rgba(255,255,255,.85)' });
    footer(x, ...quoteLine());
    return c;
  }
  async function workoutCard(w, records = []) {
    const { c, x } = await canvas();
    const t = WORKOUT_TYPES.typeDef(w.type), vol = volumeOf(w);
    text(x, new Date(w.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }), 44, 400, { weight: 600, color: 'rgba(255,255,255,.7)' });
    const title = allPlans().find(p => p.id === w.planId)?.name || w.name || t.label;
    let y = para(x, title, 120, 540, { weight: 800, color: '#fff', lh: 1.05 });
    pill(x, `Grade ${w.result?.grade || '–'}   +${fmt(w.result?.xp || 0)} XP`, y - 30, AMBER);
    const sets = (w.exercises || []).reduce((a, e) => a + setsOf(e).length, 0);
    const items = [[`${w.duration || 0}`, 'minutes']];
    if (vol) items.push([kgText(vol), 'lifted']);
    if (sets) items.push([`${sets}`, 'sets']);
    if (+w.distance) items.push([`${g1(+w.distance)} km`, 'distance']);
    if (+w.rounds) items.push([`${w.rounds}`, 'rounds']);
    y = stats(x, items.slice(0, 3), y + 110);
    if (records.length) {
      text(x, records.length > 1 ? `${records.length} new personal records` : 'New personal record', 44, y + 70, { weight: 800, color: LICHEN });
      records.slice(0, 3).forEach((r, i) => {
        const ry = y + 110 + i * 130;
        x.fillStyle = 'rgba(166,196,111,.14)'; roundRect(x, 90, ry, W - 180, 110, 28); x.fill();
        text(x, '★', 50, ry + 72, { color: AMBER, lx: 124 });
        text(x, r.name, 40, ry + 52, { weight: 800, lx: 190, max: W - 330 });
        text(x, `${g1(r.kg)} kg × ${r.reps}`, 32, ry + 92, { weight: 600, color: 'rgba(255,255,255,.7)', lx: 190 });
      });
    } else if ((w.exercises || []).length) {
      text(x, 'Exercises', 40, y + 70, { weight: 800, color: LICHEN });
      (w.exercises || []).slice(0, 5).forEach((e, i) => text(x, e.name, 40, y + 140 + i * 64, { weight: 600, color: 'rgba(255,255,255,.85)' }));
    }
    footer(x, window.Encourage?.on() ? Encourage.line(records.length ? 'rewardPB' : 'reward', w.id) : '');
    return c;
  }
  function monthRange() {
    const d = new Date(today() + 'T12:00:00');
    if (d.getDate() <= 3) d.setMonth(d.getMonth() - 1, 1); // early in the month: recap last month
    const key = localDate(d).slice(0, 7);
    return { key, label: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), full: key < today().slice(0, 7) };
  }
  function monthStats() {
    const { key, label, full } = monthRange();
    const ws = data.workouts.filter(w => String(w.date).startsWith(key));
    const before = new Map();
    for (const w of data.workouts) if (String(w.date) < key) for (const e of w.exercises || []) for (const s of setsOf(e)) { if (e.unit === 's') continue; const k = e.name.toLowerCase(); before.set(k, Math.max(before.get(k) || 0, e1rm(+s.kg || 0, +s.reps || 0))); }
    const best = new Map();
    for (const w of ws) for (const e of w.exercises || []) for (const s of setsOf(e)) { if (e.unit === 's' || !+s.kg) continue; const k = e.name.toLowerCase(); best.set(k, Math.max(best.get(k) || 0, e1rm(+s.kg, +s.reps || 0))); }
    let pbs = 0; for (const [k, v] of best) if (before.has(k) && v > before.get(k)) pbs++;
    const days = new Set(ws.map(w => w.date)).size, minutes = ws.reduce((a, w) => a + (+w.duration || 0), 0), vol = ws.reduce((a, w) => a + volumeOf(w), 0);
    const xp = ws.reduce((a, w) => a + (+w.result?.xp || 0), 0);
    const types = {}; for (const w of ws) types[w.type] = (types[w.type] || 0) + 1;
    const top = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
    const food = new Set((data.foodLog || []).filter(e => String(e.date).startsWith(key)).map(e => e.date)).size;
    return { key, label, full, count: ws.length, days, minutes, vol, xp, pbs, top: top ? WORKOUT_TYPES.typeDef(top[0]).label : '', food };
  }
  async function monthCard() {
    const { c, x } = await canvas(), m = monthStats();
    text(x, m.full ? 'My month' : 'My month so far', 52, 420, { weight: 600, color: 'rgba(255,255,255,.75)' });
    text(x, m.label, 130, 570, { weight: 800 });
    const hrs = m.minutes >= 120 ? `${g1(m.minutes / 60)} h` : `${m.minutes} min`;
    const items = [[`${m.count}`, m.count === 1 ? 'workout' : 'workouts'], [`${m.days}`, 'active days'], [hrs, 'training'],
      [m.vol ? kgText(m.vol) : '0 kg', 'lifted'], [`${m.pbs}`, m.pbs === 1 ? 'new PB' : 'new PBs'], [fmt(m.xp), 'XP earned']];
    let y = stats(x, items, 680);
    if (m.top) text(x, `Most trained: ${m.top}`, 42, y + 70, { weight: 700, color: LICHEN });
    if (m.food) text(x, `Food logged on ${m.food} day${m.food > 1 ? 's' : ''}`, 42, y + 140, { weight: 700, color: 'rgba(255,255,255,.85)' });
    footer(x, ...quoteLine());
    return c;
  }

  // ---------- share or save ----------
  async function deliver(c, name, title) {
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    if (!blob) return alert('Couldn’t create the image on this device.');
    const file = new File([blob], `${name}.png`, { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title }); return 'shared'; }
    } catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
    return 'saved';
  }
  async function run(btn, make, name, title) {
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.innerHTML; btn.textContent = 'Making image…'; }
    try { return await deliver(await make(), name, title); }
    catch (e) { console.warn('share', e); alert('Couldn’t make the share image. Please try again.'); }
    finally { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; } }
  }
  let lastWorkout = null;
  const api = {
    levelCard, workoutCard, monthCard, monthStats,
    setWorkout(w, records) { lastWorkout = { w, records }; },
    shareLevel: btn => run(btn, levelCard, `nextform-level-${levelInfo(data.xp).level}`, 'My NextForm level'),
    shareWorkout: btn => lastWorkout && run(btn, () => workoutCard(lastWorkout.w, lastWorkout.records), `nextform-workout-${lastWorkout.w.date}`, 'My workout'),
    shareMonth: btn => run(btn, monthCard, `nextform-${monthRange().key}`, 'My month on NextForm')
  };
  window.NextFormShare = api;

  // ---------- buttons ----------
  function openMenu() { $('#shareSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen'); }
  function closeMenu() { $('#shareSheet').classList.add('hidden'); if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen'); }
  document.addEventListener('click', e => {
    const t = e.target.closest('#shareProgress,#shareClose,[data-share]'); if (!t) return;
    if (t.id === 'shareProgress') return openMenu();
    if (t.id === 'shareClose') return closeMenu();
    const k = t.dataset.share;
    if (k === 'workout') api.shareWorkout(t);
    else run(t, k === 'month' ? monthCard : levelCard, k === 'month' ? `nextform-${monthRange().key}` : `nextform-level-${levelInfo(data.xp).level}`, 'NextForm').then(r => { if (r && r !== 'cancelled') closeMenu(); });
  });
  $('#shareSheet')?.addEventListener('click', e => { if (e.target.id === 'shareSheet') closeMenu(); });
})();
