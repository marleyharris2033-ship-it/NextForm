// NextForm insights: strength chart for each exercise (Progress) and last week's review (Home).
// Uses globals from app.js/rpg.js: data, $, esc, fmt, today, localDate, setsOf, e1rm, weekKey, shiftWeek, weekGoal, weekStreak, WORKOUT_TYPES.
(() => {
  const css = n => getComputedStyle(document.body).getPropertyValue(n).trim();
  const short = ds => new Date(ds + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const r1 = v => Math.round(v * 10) / 10;

  // ---------- strength chart ----------
  // One point per session: best estimated 1-rep max (weighted), total reps (bodyweight) or longest hold (timed).
  function seriesFor(name) {
    const pts = [];
    for (const w of data.workouts) for (const e of w.exercises || []) {
      if (e.name !== name) continue;
      const sets = setsOf(e).filter(s => s.reps > 0); if (!sets.length) continue;
      const timed = e.unit === 's', weighted = !timed && sets.some(s => s.kg > 0);
      const v = timed ? Math.max(...sets.map(s => s.reps)) : weighted ? Math.max(...sets.map(s => e1rm(s.kg, s.reps))) : sets.reduce((a, s) => a + s.reps, 0);
      const best = timed ? null : weighted ? sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a)) : null;
      pts.push({ date: w.date, v, kind: timed ? 'hold' : weighted ? 'max' : 'reps', best });
    }
    pts.sort((a, b) => a.date.localeCompare(b.date));
    const byDay = new Map(); for (const p of pts) { const q = byDay.get(p.date); if (!q || p.v > q.v) byDay.set(p.date, p); }
    const out = [...byDay.values()], kinds = new Set(out.map(p => p.kind));
    const kind = kinds.has('max') ? 'max' : kinds.has('hold') ? 'hold' : 'reps';
    return out.filter(p => p.kind === kind);
  }
  const UNIT = { max: ['kg', 'Estimated 1-rep max'], reps: ['reps', 'Total reps per session'], hold: ['s', 'Longest hold'] };
  function drawChart(name) {
    const box = $('#exerciseChartBox'), c = $('#exerciseChart'), stat = $('#exerciseStat');
    if (!box) return;
    const pts = name ? seriesFor(name) : [];
    box.classList.toggle('hidden', !pts.length);
    if (!pts.length) return;
    const kind = pts[0].kind, [unit, label] = UNIT[kind], first = pts[0], last = pts.at(-1), top = pts.reduce((a, p) => (p.v > a.v ? p : a));
    const diff = last.v - first.v;
    stat.innerHTML = `<div><span>${label}</span><b>${r1(last.v)}<small> ${unit}</small></b></div>
      <div><span>Best</span><b>${r1(top.v)}<small> ${unit}</small></b><small>${short(top.date)}</small></div>
      <div><span>Since ${short(first.date)}</span><b class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff > 0 ? '+' : ''}${r1(diff)}<small> ${unit}</small></b></div>`;
    const dpr = devicePixelRatio || 1, W = Math.max(280, c.getBoundingClientRect().width || 320), H = 190;
    c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr); x.clearRect(0, 0, W, H);
    const ink = css('--stone'), line = css('--hairline'), pine = css('--pine'), amber = css('--amber');
    x.font = `12px ${getComputedStyle(document.body).fontFamily}`;
    const vs = pts.map(p => p.v); let mn = Math.min(...vs), mx = Math.max(...vs);
    const pad = Math.max(1, (mx - mn) * 0.15); mn = Math.max(0, mn - pad); mx = mx + pad;
    const L = 40, R = 12, T = 12, B = 24, pw = W - L - R, ph = H - T - B;
    const t0 = new Date(first.date).getTime(), span = (new Date(last.date).getTime() - t0) || 1;
    const px = p => (pts.length === 1 ? L + pw / 2 : L + (new Date(p.date).getTime() - t0) / span * pw), py = v => T + (mx - v) / (mx - mn) * ph;
    x.strokeStyle = line; x.fillStyle = ink; x.lineWidth = 1; x.textAlign = 'right'; x.textBaseline = 'middle';
    for (let i = 0; i <= 3; i++) { const v = mn + (mx - mn) * i / 3, y = py(v); x.beginPath(); x.moveTo(L, y); x.lineTo(W - R, y); x.stroke(); x.fillText(String(Math.round(v)), L - 8, y); }
    x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(short(first.date), L, H - 6);
    if (pts.length > 1) { x.textAlign = 'right'; x.fillText(short(last.date), W - R, H - 6); }
    // area + line
    if (pts.length > 1) {
      const g = x.createLinearGradient(0, T, 0, T + ph); g.addColorStop(0, pine + '33'); g.addColorStop(1, pine + '00');
      x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(px(p), py(p.v)) : x.moveTo(px(p), py(p.v)))); x.lineTo(px(last), T + ph); x.lineTo(px(first), T + ph); x.closePath(); x.fillStyle = g; x.fill();
      x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(px(p), py(p.v)) : x.moveTo(px(p), py(p.v)))); x.strokeStyle = pine; x.lineWidth = 2.5; x.lineJoin = 'round'; x.stroke();
    }
    pts.forEach(p => { x.beginPath(); x.arc(px(p), py(p.v), p === top ? 5 : 3, 0, Math.PI * 2); x.fillStyle = p === top ? amber : pine; x.fill(); });
  }
  // Most-logged exercise lately, so the chart shows something straight away.
  function defaultExercise() {
    const counts = new Map(), since = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return localDate(d); })();
    for (const w of data.workouts) if (w.date >= since) for (const e of w.exercises || []) counts.set(e.name, (counts.get(e.name) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  }
  function syncChart() {
    const sel = $('#historyExercise'); if (!sel) return;
    if (!sel.value) { const d = defaultExercise(); if (d && [...sel.options].some(o => o.value === d)) { sel.value = d; sel.onchange?.(); } }
    drawChart(sel.value);
  }
  $('#historyExercise')?.addEventListener('change', () => drawChart($('#historyExercise').value));
  // Tap a personal best to see its chart.
  document.addEventListener('click', e => {
    const pb = e.target.closest('#pbs .pb'); if (!pb) return;
    const name = pb.querySelector('b')?.textContent, sel = $('#historyExercise');
    if (!name || ![...sel.options].some(o => o.value === name)) return;
    sel.value = name; sel.onchange?.(); drawChart(name);
    $('#exerciseChartBox').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------- last week in review (Home) ----------
  function weekReview() {
    const box = $('#weekReview'); if (!box) return;
    const thisWk = weekKey(today()), lastWk = shiftWeek(thisWk, -1), prevWk = shiftWeek(thisWk, -2);
    const lastSun = (() => { const d = new Date(lastWk + 'T12:00:00'); d.setDate(d.getDate() + 6); return localDate(d); })();
    const inWk = (k, ds) => weekKey(ds) === k;
    const ws = data.workouts.filter(w => inWk(lastWk, w.date)), prev = data.workouts.filter(w => inWk(prevWk, w.date));
    const food = (data.foodLog || []).filter(f => inWk(lastWk, f.date));
    if (!ws.length && !food.length) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    const sum = (list, f) => list.reduce((a, w) => a + (+f(w) || 0), 0);
    const goal = weekGoal(), n = ws.length, hit = n >= goal;
    const mins = sum(ws, w => w.duration), pMins = sum(prev, w => w.duration);
    const vol = sum(ws, w => w.result?.volume), pVol = sum(prev, w => w.result?.volume);
    const pbs = sum(ws, w => w.result?.pbs);
    const km = sum(ws, w => (['Running', 'Cycling', 'Walking'].includes(w.type) ? w.distance : 0) + (w.type === 'Swimming' ? (+w.metres || 0) / 1000 : 0));
    const arrow = (a, b) => (!b ? '' : a > b * 1.05 ? '<i class="up">▲</i>' : a < b * 0.95 ? '<i class="down">▼</i>' : '');
    const days = [...new Set(food.map(f => f.date))], t = window.foodTargets?.() || { kcal: 0, protein: 0 };
    const avg = k => (days.length ? sum(food, f => f[k]) / days.length : 0);
    const st = weekStreak();
    const head = hit ? `Goal hit: ${n} session${n > 1 ? 's' : ''} (goal ${goal}).${st > 1 ? ` That’s ${st} weeks in a row.` : ''}`
      : `${n} of ${goal} sessions.${n ? ' Hit your goal this week to start a new streak.' : ''}`;
    const tiles = [
      ['Sessions', `${n}<small> / ${goal}</small>`, arrow(n, prev.length)],
      ['Training time', mins >= 60 ? `${r1(mins / 60)}<small> h</small>` : `${mins}<small> min</small>`, arrow(mins, pMins)],
      vol ? ['Volume', vol >= 10000 ? `${r1(vol / 1000)}<small> t</small>` : `${fmt(vol)}<small> kg</small>`, arrow(vol, pVol)] : null,
      pbs ? ['New PBs', `${pbs}`, ''] : null,
      km ? ['Distance', `${r1(km)}<small> km</small>`, ''] : null,
      days.length ? ['Avg calories', `${fmt(avg('kcal'))}<small> / ${fmt(t.kcal)}</small>`, ''] : null,
      days.length ? ['Avg protein', `${Math.round(avg('protein'))}<small> / ${t.protein} g</small>`, ''] : null
    ].filter(Boolean);
    box.innerHTML = `<div class="sectionHead"><div class="secTitle"><span class="secIcon" style="--c:var(--glacier)"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg></span><h2>Last week</h2></div><span class="muted small">${short(lastWk)} to ${short(lastSun)}</span></div>
      <p class="reviewHead${hit ? ' hit' : ''}">${esc(head)}</p>
      <div class="reviewGrid">${tiles.map(([k, v, a]) => `<div><span>${k}</span><b>${v}${a}</b></div>`).join('')}</div>
      ${days.length ? `<p class="muted small reviewFoot">Food logged on ${days.length} of 7 days${days.length < 7 ? '. Averages are for the days you logged.' : '.'}</p>` : ''}`;
  }

  window.renderInsights = () => { try { syncChart(); weekReview(); } catch (e) { console.warn(e); } };
  window.renderInsights();
  window.addEventListener('resize', () => drawChart($('#historyExercise')?.value));
})();
