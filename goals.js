// NextForm goal weight: progress from where you started, a rough finish date from your trend, and a
// celebration with a "what next?" choice when you get there (so the app doesn't go quiet once a goal is hit).
(() => {
  const sorted = () => [...(data.weights || [])].filter(w => +w.value > 0).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const dayNum = ds => Math.round(new Date(String(ds) + 'T12:00:00').getTime() / 864e5);

  function startOf(goal) {
    const s = data.profile.goalStart;
    if (s && +s.goal === +goal && +s.kg > 0) return +s.kg;
    return sorted()[0]?.value ?? null;
  }
  // kg per week from the last 4 weeks of weigh-ins (least squares), or null.
  function trend() {
    const ws = sorted(), t = dayNum(today()), pts = ws.filter(w => dayNum(w.date) >= t - 28).map(w => ({ d: dayNum(w.date), v: +w.value }));
    if (pts.length < 3 || pts.at(-1).d - pts[0].d < 10) return null;
    const mx = pts.reduce((a, p) => a + p.d, 0) / pts.length, my = pts.reduce((a, p) => a + p.v, 0) / pts.length;
    return pts.reduce((a, p) => a + (p.d - mx) * (p.v - my), 0) / (pts.reduce((a, p) => a + (p.d - mx) ** 2, 0) || 1) * 7;
  }
  function status() {
    const goal = +data.profile.goalWeight || null, cur = weight();
    if (!goal || !cur) return { goal, cur };
    const start = startOf(goal) ?? cur, losing = goal < start;
    const reached = losing ? cur <= goal + 0.2 : goal > start ? cur >= goal - 0.2 : Math.abs(cur - goal) <= 0.5;
    const total = Math.abs(start - goal), done = losing ? start - cur : cur - start;
    const pct = total ? Math.max(0, Math.min(100, done / total * 100)) : 100;
    const tr = trend(), left = Math.abs(cur - goal);
    let eta = null;
    if (!reached && tr && (losing ? tr < -0.05 : tr > 0.05)) { const weeks = left / Math.abs(tr); if (weeks < 104) { const d = new Date(); d.setDate(d.getDate() + Math.round(weeks * 7)); eta = d; } }
    return { goal, cur, start, losing, reached, pct, left, tr, eta, maintain: !!data.profile.goalMaintain };
  }
  function setGoal(kg, maintain = false) {
    const cur = weight();
    data.profile.goalWeight = kg || null;
    data.profile.goalMaintain = !!maintain;
    data.profile.goalStart = kg && cur ? { kg: cur, goal: kg, date: today() } : null;
    save();
  }

  function render() {
    const box = $('#goalCard'); if (!box) return;
    const s = status(), wkTxt = s.tr != null ? `${s.tr < 0 ? '−' : '+'}${Math.abs(s.tr).toFixed(1)} kg a week lately` : '';
    if (!s.goal) {
      box.innerHTML = `<div class="sectionHead"><h2>Goal weight</h2></div><p class="muted small">Set a goal to see your progress, a rough finish date and calorie targets that work towards it.</p>
        <div class="row goalSet"><input type="number" id="goalInput" min="30" max="300" step="0.5" inputmode="decimal" placeholder="Goal in kg"><button type="button" class="primary" id="goalSave">Set goal</button></div>`;
      return;
    }
    if (!s.cur) { box.innerHTML = `<div class="sectionHead"><h2>Goal weight</h2><button class="link" type="button" id="goalChange">Change</button></div><p class="muted small">Goal: <b>${s.goal} kg</b>. Add a weigh-in above to track your progress.</p>`; return; }
    if (s.maintain) {
      const off = s.cur - s.goal;
      box.innerHTML = `<div class="sectionHead"><h2>Maintaining ${s.goal} kg</h2><button class="link" type="button" id="goalChange">Change</button></div>
        <p class="muted small">${Math.abs(off) <= 1 ? `You’re ${Math.abs(off) < 0.1 ? 'right on it' : `within ${Math.abs(off).toFixed(1)} kg`}. Holding a goal is its own achievement.` : `You’re ${Math.abs(off).toFixed(1)} kg ${off > 0 ? 'above' : 'below'}. Small adjustments get you back.`}${wkTxt ? ` ${wkTxt}.` : ''}</p>`;
      return;
    }
    if (s.reached) {
      box.innerHTML = `<div class="goalHit"><span class="goalBadge" aria-hidden="true">★</span><h2>You reached ${s.goal} kg!</h2>
        <p>From ${s.start} kg to ${s.cur} kg. That took real consistency. What’s next?</p>
        <div class="goalNext"><button type="button" class="primary" id="goalKeep">Keep this weight</button><button type="button" class="secondary" id="goalNew">Set a new goal</button></div>
        <div class="row goalSet hidden" id="goalNewRow"><input type="number" id="goalInput" min="30" max="300" step="0.5" inputmode="decimal" placeholder="New goal in kg"><button type="button" class="primary" id="goalSave">Save</button></div></div>`;
      return;
    }
    box.innerHTML = `<div class="sectionHead"><h2>Goal weight</h2><button class="link" type="button" id="goalChange">Change</button></div>
      <div class="goalNums"><div><span>Start</span><b>${s.start}</b></div><div class="now"><span>Now</span><b>${s.cur}</b></div><div><span>Goal</span><b>${s.goal}</b></div></div>
      <div class="goalBar"><i style="width:${s.pct}%"></i></div>
      <p class="muted small">${Math.round(s.pct)}% of the way, ${s.left.toFixed(1)} kg to go.${wkTxt ? ` ${wkTxt[0].toUpperCase() + wkTxt.slice(1)}` : ''}${s.eta ? `, so you could get there around <b>${s.eta.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</b>.` : wkTxt ? '.' : ' Weigh in a few times a week to see a finish date.'}</p>
      <div class="row goalSet hidden" id="goalNewRow"><input type="number" id="goalInput" min="30" max="300" step="0.5" inputmode="decimal" placeholder="New goal in kg"><button type="button" class="primary" id="goalSave">Save</button></div>`;
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('#goalSave,#goalKeep,#goalNew,#goalChange'); if (!t) return;
    if (t.id === 'goalSave') { const v = Math.round(+$('#goalInput').value * 10) / 10; if (!(v >= 30 && v <= 300)) return alert('Enter a goal between 30 and 300 kg.'); setGoal(v); }
    else if (t.id === 'goalKeep') { setGoal(Math.round(weight() * 2) / 2, true); }
    else { $('#goalNewRow')?.classList.remove('hidden'); $('#goalInput')?.focus(); }
  });
  window.NextFormGoal = { status, render, setGoal };
  render();
})();
