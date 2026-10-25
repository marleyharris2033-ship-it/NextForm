// NextForm Plans+: multi-week programmes, the plan maker, session time estimates, exercise swaps and sharing
// your own plans by link. Programme sessions are generated for the current week (ids pg_0, pg_1...) and show up
// in allPlans(), so the weekly schedule, Today's plan and Start buttons all just work.
(() => {
  const PD = () => window.NextFormPlanData || { SESSIONS: [], PROGRAMMES: [] };
  const DAY_SETS = { 2: ['Mon', 'Thu'], 3: ['Mon', 'Wed', 'Fri'], 4: ['Mon', 'Tue', 'Thu', 'Fri'], 5: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'], 6: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  const COMPOUND = /squat|deadlift|bench press|overhead press|row|pull-up|chin-up|hip thrust|leg press|dip|push press|lunge/i;
  const meta = name => EXERCISES.find(e => e.name.toLowerCase() === String(name).toLowerCase());
  const dayNum = ds => Math.round(new Date(String(ds) + 'T12:00:00').getTime() / 864e5);
  const mondayOf = ds => { const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return localDate(d); };

  // ---------- time estimate ----------
  function minutes(plan) {
    if (!plan) return 0;
    if (plan.mins) return plan.mins; // sessions designed around a set time
    if (plan.type === 'Running') return 30;
    const circuit = plan.type === 'Mixed' || /circuit|superset/i.test(plan.desc || '');
    let sec = 5 * 60; // warm-up
    for (const e of plan.exercises || []) {
      const timed = /s$/.test(String(e.reps)), work = timed ? (parseInt(String(e.reps).split('-').pop()) || 30) : 40;
      const rest = circuit ? 25 : COMPOUND.test(e.name) ? 120 : 75;
      sec += (+e.sets || 3) * (work + rest) + 30; // + moving between exercises
    }
    return Math.max(10, Math.round(sec / 60 / 5) * 5);
  }

  // ---------- programmes ----------
  const state = () => data.programme && typeof data.programme === 'object' && data.programme.id ? data.programme : null;
  const progById = id => PD().PROGRAMMES.find(p => p.id === id);
  function weekOf(st = state()) { if (!st) return 0; return Math.floor((dayNum(mondayOf(today())) - dayNum(st.start)) / 7) + 1; }
  function sessionFor(prog, slot, week) {
    const ph = prog.phase(week);
    if (prog.slots[slot] === 'run') {
      const run = prog.runs[Math.min(week, prog.runs.length) - 1];
      return { id: `pg_${slot}`, name: `${prog.name} · ${run}`, type: 'Running', desc: `Week ${week}: ${run}. ${ph.note}`, exercises: [], mins: 30, programme: true };
    }
    const base = allPlansBase().find(p => p.id === prog.slots[slot]); if (!base) return null;
    const ex = base.exercises.map((e, i) => {
      let sets = +e.sets || 3, reps = e.reps;
      const timed = /s$/.test(String(reps)), big = !timed && COMPOUND.test(e.name) && i < 2;
      if (ph.deload) sets = Math.max(2, sets - 1);
      else { if (ph.extraSet) sets += 1; if (ph.compoundReps && big) reps = ph.compoundReps; }
      return { name: e.name, sets, reps };
    });
    return { id: `pg_${slot}`, name: `${base.name}`, type: base.type, desc: `${prog.name} · Week ${week} (${ph.label}): ${ph.note}`, exercises: ex, programme: true, baseId: base.id };
  }
  const allPlansBase = () => [...(data.plans || []), ...BUILTIN_PLANS];
  function plans() {
    const st = state(); if (!st) return [];
    const prog = progById(st.id), w = weekOf(st); if (!prog || w < 1 || w > prog.weeks) return [];
    return prog.slots.map((_, i) => sessionFor(prog, i, w)).filter(Boolean);
  }
  function startProgramme(id, days) {
    const prog = progById(id); if (!prog) return;
    days = (days && days.length === prog.days ? days : DAY_SETS[prog.days] || DAY_SETS[3]).slice();
    const prev = state()?.prev || { ...(data.schedule || {}) };
    data.programme = { id, start: mondayOf(today()), days, prev, startedAt: Date.now() };
    data.schedule = {}; days.forEach((d, i) => { data.schedule[d] = `pg_${i}`; });
    save(); renderAll();
  }
  function stopProgramme(restore = true) {
    const st = state(); if (!st) return;
    data.schedule = restore && st.prev ? { ...st.prev } : Object.fromEntries(Object.entries(data.schedule || {}).filter(([, v]) => !String(v).startsWith('pg_')));
    data.programme = null; save(); renderAll();
  }

  // ---------- plan maker ----------
  const Q = [
    ['goal', 'What’s your main goal?', [['strength', 'Get stronger'], ['muscle', 'Build muscle'], ['fitness', 'Fitness & fat loss'], ['general', 'Just get moving']]],
    ['days', 'How many days a week?', [['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']]],
    ['equip', 'What equipment do you have?', [['gym', 'Full gym'], ['dumbbells', 'Dumbbells'], ['kettlebell', 'Kettlebell'], ['none', 'Nothing (home)']]],
    ['time', 'How long per session?', [['30', 'About 30 min'], ['45', '45 min'], ['60', '60 min+']]],
    ['level', 'How experienced are you?', [['Beginner', 'New to this'], ['Intermediate', 'Some experience'], ['Advanced', 'Very experienced']]]
  ];
  function recommend(a) {
    const days = +a.days || 3, quick = a.time === '30';
    const pools = {
      gym: { Beginner: ['beg1', 'beg2', 'beg3'], 2: ['fb1', 'fb3'], 3: ['fb1', 'fb2', 'fb3'], 4: ['upperA', 'lowerA', 'upperB', 'lowerB'], 5: ['push1', 'pull1', 'lowerA', 'upperB', 'lowerB'], 6: ['push1', 'pull1', 'lowerA', 'push2', 'pull2', 'lowerB'] },
      dumbbells: { all: ['db1', 'db2', 'db3', 'db4', 'db1', 'db2'] },
      kettlebell: { all: ['kb1', 'kb2', 'kb3', 'kb1', 'kb2', 'kb3'] },
      none: { Beginner: ['home1', 'home3', 'home2', 'home4', 'home1', 'home3'], all: ['cal1', 'cal2', 'cal3', 'home3', 'cal4', 'home1'] }
    };
    let list;
    if (quick) list = a.equip === 'gym' ? ['exp1', 'exp3', 'exp2', 'exp4', 'exp1', 'exp3'] : a.equip === 'none' ? ['home4', 'hiit1', 'home4', 'core2', 'hiit1', 'home4'] : a.equip === 'kettlebell' ? ['kb2', 'kb1', 'kb3', 'kb2', 'kb1', 'kb3'] : ['exp1', 'hiit2', 'exp1', 'hiit2', 'exp1', 'hiit2'];
    else { const p = pools[a.equip] || pools.gym; list = (a.level === 'Beginner' && p.Beginner) || p[days] || p.all || pools.gym[3]; }
    list = Array.from({ length: days }, (_, i) => list[i % list.length]);
    if (a.goal === 'fitness' && days >= 3 && !quick) list[days - 1] = a.equip === 'gym' || a.equip === 'dumbbells' ? 'hiit2' : 'hiit1';
    if (a.goal === 'muscle' && a.equip === 'gym' && days === 3 && a.level !== 'Beginner') list = ['upperA', 'lowerA', 'upperB'];
    // Best-matching programme, if one fits well.
    const score = p => (p.equip === a.equip || p.equip === 'any' || (a.equip === 'gym' && p.equip !== 'none' && p.equip !== 'kettlebell') ? 3 : -9)
      + (p.goal === a.goal ? 3 : 0) + (p.days === days ? 3 : -Math.abs(p.days - days)) + (p.level === a.level || p.level === 'Any' ? 1 : 0);
    const prog = [...PD().PROGRAMMES].sort((x, y) => score(y) - score(x))[0];
    return { days: DAY_SETS[days] || DAY_SETS[3], sessions: list, programme: score(prog) >= 6 ? prog : null };
  }

  // ---------- sharing your own plans ----------
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  const encodePlan = p => b64(JSON.stringify({ n: p.name, t: p.type, e: p.exercises.map(e => [e.name, +e.sets || 3, String(e.reps || '')]) }));
  function decodePlan(code) {
    try {
      const o = JSON.parse(unb64(String(code).trim()));
      if (!o || typeof o.n !== 'string' || !Array.isArray(o.e) || !o.e.length || o.e.length > 30) return null;
      const exercises = o.e.filter(x => Array.isArray(x) && typeof x[0] === 'string').map(([name, sets, reps]) => ({ name: String(name).slice(0, 60), sets: Math.min(10, Math.max(1, +sets || 3)), reps: String(reps || '').slice(0, 12) }));
      return exercises.length ? { name: o.n.slice(0, 60), type: ['Strength', 'Calisthenics', 'Mixed', 'Other'].includes(o.t) ? o.t : 'Strength', exercises } : null;
    } catch { return null; }
  }
  const linkFor = p => `${location.origin}${location.pathname}#plan=${encodePlan(p)}`;
  function importPlan(p) {
    const plan = { ...p, id: 'my_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), custom: true, updatedAt: Date.now() };
    data.plans = Array.isArray(data.plans) ? data.plans : []; data.plans.push(plan); save(); renderAll(); return plan;
  }
  function checkLink() {
    const m = location.hash.match(/^#plan=([A-Za-z0-9_-]+)$/); if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);
    const p = decodePlan(m[1]); if (!p) return;
    if (confirm(`Add “${p.name}” (${p.exercises.length} exercises) to My plans?`)) { importPlan(p); go('planner'); toast(`Added “${p.name}” to My plans.`); }
  }
  const toast = m => (window.NextFormFood?.toast || alert)(m);

  // ---------- swap an exercise ----------
  function alternatives(name) {
    const m = meta(name); if (!m) return [];
    const pat = window.Figures?.MAP?.[m.name];
    const same = EXERCISES.filter(e => e.name !== m.name && e.cat === m.cat && !!e.timed === !!m.timed);
    const byPattern = pat ? same.filter(e => window.Figures.MAP[e.name] === pat) : [];
    return [...new Set([...byPattern, ...same])].slice(0, 12).map(e => e.name);
  }

  // ---------- UI ----------
  const sheet = () => document.getElementById('plansSheet');
  function openSheet(title, html) {
    const s = sheet(); if (!s) return;
    document.getElementById('plansTitle').textContent = title; document.getElementById('plansBody').innerHTML = html;
    s.classList.remove('hidden'); document.body.classList.add('sheetOpen'); document.getElementById('plansBody').scrollTop = 0;
  }
  function closeSheet() { sheet()?.classList.add('hidden'); if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen'); }
  const planLine = p => p ? `${esc(p.name)} <small>~${minutes(p)} min</small>` : '';

  function renderCard() {
    const box = document.getElementById('programmeCard'); if (!box) return;
    const st = state(), prog = st && progById(st.id), w = weekOf(st);
    if (prog && w > prog.weeks) {
      box.innerHTML = `<div class="sectionHead"><h2>Programme complete! 🎉</h2></div><p>You finished <b>${esc(prog.name)}</b>. Brilliant work.</p>
        <div class="row wrap"><button type="button" class="primary" data-prog-list>Choose another</button><button type="button" class="secondary" data-prog-stop>Back to my old week</button></div>`; return;
    }
    if (prog) {
      const ph = prog.phase(w), ps = plans();
      box.innerHTML = `<div class="sectionHead"><h2>${esc(prog.name)}</h2><span class="progWeek">Week ${w} of ${prog.weeks}</span></div>
        <div class="goalBar"><i style="width:${Math.round((w - 1) / prog.weeks * 100 + 100 / prog.weeks / 2)}%"></i></div>
        <p class="progPhase"><b>${esc(ph.label)}${ph.deload ? ' week' : ''}:</b> ${esc(ph.note)}</p>
        <ul class="progWeekList">${st.days.map((d, i) => `<li><b>${d}</b><span>${planLine(ps[i])}</span>${ps[i] ? `<button type="button" class="secondary small" data-prog-start="${ps[i].id}">Start</button>` : ''}</li>`).join('')}</ul>
        <div class="row wrap"><button type="button" class="link" data-prog-list>Change programme</button><button type="button" class="link muted" data-prog-stop>Stop programme</button></div>`;
      return;
    }
    box.innerHTML = `<h2>Programmes & plan maker</h2><p class="muted">Follow a programme that fills your week for you, or answer 5 quick questions and NextForm will plan your week.</p>
      <div class="row wrap"><button type="button" class="primary" data-maker-open>Make my plan</button><button type="button" class="secondary" data-prog-list>Browse programmes</button></div>`;
  }
  function renderProgrammes() {
    openSheet('Programmes', `<p class="muted">Pick one and it fills your week. Each week changes a little: more sets, heavier lifts, and easier deload weeks to recover.</p>
      ${PD().PROGRAMMES.map(p => `<div class="progItem"><div><b>${esc(p.name)}</b><small>${p.weeks} weeks · ${p.days} days a week · ${esc(p.level)} · ${({ gym: 'Gym', dumbbells: 'Dumbbells', none: 'No equipment', any: 'Any' })[p.equip] || ''}</small><p class="muted small">${esc(p.desc)}</p></div>
        <button type="button" class="secondary" data-prog-view="${p.id}">View</button></div>`).join('')}`);
  }
  function renderProgramme(id, days) {
    const p = progById(id); if (!p) return;
    days = days || DAY_SETS[p.days] || DAY_SETS[3];
    const sample = p.slots.map((_, i) => sessionFor(p, i, 1));
    openSheet(p.name, `<p>${esc(p.desc)}</p><p class="muted small">${p.weeks} weeks · ${p.days} days a week · ${esc(p.level)}</p>
      <p class="fieldLabel">Your training days <span class="muted">(pick ${p.days})</span></p>
      <div class="chips wrapChips" id="progDays">${DAYS.map(d => `<button type="button" class="chip pickChip${days.includes(d) ? ' on' : ''}" data-prog-day="${d}">${d}</button>`).join('')}</div>
      <p class="fieldLabel">Week 1</p><ul class="progWeekList">${sample.map((s, i) => `<li><b>${days[i] || '–'}</b><span>${planLine(s)}</span></li>`).join('')}</ul>
      <p class="fieldLabel">How it changes</p><ul class="progPhases">${[...new Set(Array.from({ length: p.weeks }, (_, i) => i + 1).map(w => { const ph = p.phase(w); return `${ph.label}${ph.deload ? ' week' : ''}: ${ph.note}`; }))].slice(0, 5).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${state() ? '<p class="muted small">This replaces the programme you’re on now.</p>' : '<p class="muted small">Your current week is saved, and comes back if you stop the programme.</p>'}
      <p class="muted small" id="progMsg" role="status"></p>
      <button type="button" class="primary full" data-prog-go="${p.id}">Start ${esc(p.name)}</button>`);
    document.getElementById('plansBody').dataset.days = days.join(',');
  }
  let answers = {};
  function renderMaker() {
    openSheet('Make my plan', `${Q.map(([k, q, opts]) => `<p class="fieldLabel">${esc(q)}</p><div class="chips wrapChips">${opts.map(([v, l]) => `<button type="button" class="chip pickChip${answers[k] === v ? ' on' : ''}" data-ans="${k}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`).join('')}
      <div id="makerResult"></div>`);
    renderResult();
  }
  function renderResult() {
    const box = document.getElementById('makerResult'); if (!box) return;
    if (Q.some(([k]) => !answers[k])) { box.innerHTML = `<p class="muted small">${Q.filter(([k]) => !answers[k]).length} question${Q.filter(([k]) => !answers[k]).length > 1 ? 's' : ''} to go.</p>`; return; }
    const r = recommend(answers), all = allPlansBase();
    box.innerHTML = `<div class="makerOut"><h3>Your week</h3><ul class="progWeekList">${r.days.map((d, i) => `<li><b>${d}</b><span>${planLine(all.find(p => p.id === r.sessions[i]))}</span></li>`).join('')}</ul>
      <button type="button" class="primary full" data-maker-use>Use this week</button>
      ${r.programme ? `<p class="fieldLabel">Or follow a programme</p><div class="progItem"><div><b>${esc(r.programme.name)}</b><small>${r.programme.weeks} weeks · ${r.programme.days} days a week</small><p class="muted small">${esc(r.programme.desc)}</p></div><button type="button" class="secondary" data-prog-view="${r.programme.id}">View</button></div>` : ''}
      <p class="muted tiny">You can change any day afterwards in Your week.</p></div>`;
  }
  function useMaker() {
    const r = recommend(answers);
    if (state() && !confirm('This will stop your current programme. Carry on?')) return;
    if (state()) stopProgramme(false);
    data.schedule = {}; r.days.forEach((d, i) => { data.schedule[d] = r.sessions[i]; });
    data.profile.planAnswers = { ...answers }; save(); renderAll(); closeSheet(); toast('Your week is planned. Have a great session!');
    setTimeout(() => document.getElementById('weekPlanner')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }
  function openSwap(name, choose) {
    const alts = alternatives(name);
    openSheet(`Swap ${name}`, alts.length ? `<p class="muted">Pick something similar, for example if the equipment is busy or missing.</p><div class="swapList">${alts.map(a => `<button type="button" class="swapOpt" data-swap-to="${esc(a)}"><b>${esc(a)}</b><small>${esc(meta(a)?.cat || '')}</small></button>`).join('')}</div>` : '<p class="muted">No close alternatives found. You can remove it and add another exercise instead.</p>');
    swapCb = choose;
  }
  let swapCb = null;
  async function sharePlan(id) {
    const p = (data.plans || []).find(x => x.id === id); if (!p) return;
    const url = linkFor(p), text = `Try my NextForm workout “${p.name}”: ${url}`;
    try { if (navigator.share) { await navigator.share({ title: p.name, text: `Try my NextForm workout “${p.name}”`, url }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Link copied. Send it to a friend.'); } catch { prompt('Copy this link:', url); }
  }
  function renderImport() {
    openSheet('Add a shared plan', `<p class="muted">Paste a NextForm plan link a friend sent you.</p><input id="planImport" placeholder="https://…#plan=…" autocomplete="off"><p class="muted small" id="importMsg" role="status"></p><button type="button" class="primary full" data-import-go>Add to My plans</button>`);
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-prog-list],[data-prog-view],[data-prog-go],[data-prog-stop],[data-prog-start],[data-prog-day],[data-maker-open],[data-ans],[data-maker-use],[data-swap-to],[data-share-plan],[data-import-open],[data-import-go],#plansClose');
    if (!t) { if (e.target.id === 'plansSheet') closeSheet(); return; }
    if (t.id === 'plansClose') return closeSheet();
    if (t.matches('[data-prog-list]')) return renderProgrammes();
    if (t.matches('[data-prog-view]')) return renderProgramme(t.dataset.progView);
    if (t.matches('[data-prog-day]')) {
      const body = document.getElementById('plansBody'), id = body.querySelector('[data-prog-go]')?.dataset.progGo, p = progById(id);
      let days = (body.dataset.days || '').split(',').filter(Boolean); const d = t.dataset.progDay;
      days = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
      days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      if (days.length > p.days) { document.getElementById('progMsg').textContent = `This programme has ${p.days} days. Untick one first.`; return; }
      return renderProgramme(id, days);
    }
    if (t.matches('[data-prog-go]')) {
      const p = progById(t.dataset.progGo), days = (document.getElementById('plansBody').dataset.days || '').split(',').filter(Boolean);
      if (days.length !== p.days) { document.getElementById('progMsg').textContent = `Pick ${p.days} training days.`; return; }
      startProgramme(p.id, days); closeSheet(); toast(`${p.name} started. Week 1 is in Your week.`); go('planner'); return;
    }
    if (t.matches('[data-prog-stop]')) { if (confirm('Stop this programme? Your old week comes back.')) stopProgramme(true); return; }
    if (t.matches('[data-prog-start]')) return window.startPremadePlan(t.dataset.progStart);
    if (t.matches('[data-maker-open]')) { answers = { ...(data.profile.planAnswers || {}) }; return renderMaker(); }
    if (t.matches('[data-ans]')) { answers[t.dataset.ans] = t.dataset.v; t.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === t)); return renderResult(); }
    if (t.matches('[data-maker-use]')) return useMaker();
    if (t.matches('[data-swap-to]')) { const cb = swapCb; swapCb = null; closeSheet(); cb?.(t.dataset.swapTo); return; }
    if (t.matches('[data-share-plan]')) return sharePlan(t.dataset.sharePlan);
    if (t.matches('[data-import-open]')) return renderImport();
    if (t.matches('[data-import-go]')) {
      const v = document.getElementById('planImport').value, m = v.match(/plan=([A-Za-z0-9_-]+)/) || v.match(/^([A-Za-z0-9_-]{20,})$/), p = m && decodePlan(m[1]);
      if (!p) { document.getElementById('importMsg').textContent = 'That doesn’t look like a NextForm plan link.'; return; }
      importPlan(p); closeSheet(); toast(`Added “${p.name}” to My plans.`);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet()?.classList.contains('hidden')) closeSheet(); });
  window.addEventListener('hashchange', checkLink);

  window.NextFormPlansPlus = { minutes, plans, startProgramme, stopProgramme, weekOf, state, recommend, encodePlan, decodePlan, linkFor, alternatives, openSwap, renderCard, DAY_SETS };
  // The planner and Today's plan were drawn before this file loaded; redraw so programme sessions show.
  try { if (state()) renderAll(); else { renderSimplePlanner(); renderCard(); } } catch { renderCard(); }
  setTimeout(checkLink, 400);
})();
