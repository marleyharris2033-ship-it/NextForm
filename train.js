// NextForm Train: live workout flow (start, sets, rest timer, finish) and the reward screen.
// Uses globals from app.js and rpg.js.
(() => {
  const SESSION_KEY = 'nextform-session'; // in-progress workout, kept on this device only
  const TYPES = ['Strength', 'Running', 'Boxing', 'Mobility', 'Mixed', 'Other'];
  const EFFORT = ['', 'Very easy', 'Easy', 'Easy', 'Moderate', 'Moderate', 'Moderately hard', 'Hard', 'Very hard', 'Near max', 'All out'];
  const DEFAULT_REST = 90;
  let session = load();
  let clockTimer = null, restTimer = null;

  // ---------- state ----------
  function load() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
  function persist() { try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch {} }
  const usesSets = t => !['Running', 'Boxing'].includes(t);
  const mmss = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
  const elapsed = () => session && !session.past && session.startedAt ? (Date.now() - session.startedAt) / 1000 : 0;
  const started = () => !!(session && !session.past && session.startedAt);
  const targetReps = r => parseInt(String(r), 10) || 8;

  // Past sessions of this exercise, newest first.
  function history(name, max = 3) {
    const key = name.toLowerCase(), out = [];
    const ws = [...data.workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));
    for (const w of ws) { const e = (w.exercises || []).find(x => x.name.toLowerCase() === key); if (e) { out.push({ sets: setsOf(e), unit: e.unit }); if (out.length >= max) break; } }
    return out;
  }
  const lastSets = name => history(name, 1)[0] || null;
  const Coach = window.NextFormCoach;
  const prefs = () => { const p = data.trainPrefs = data.trainPrefs && typeof data.trainPrefs === 'object' ? data.trainPrefs : {}; p.rest = p.rest || {}; p.bar = p.bar || {}; return p; };
  const restFor = name => +prefs().rest[name.toLowerCase()] || Coach.defaultRest(name);
  const rangeOf = e => e.range || String(e.target || '').split('×')[1] || '';
  const suggestionFor = e => Coach.suggest(e.name, history(e.name), rangeOf(e));
  // "62.5 kg × 6, 6, 6" when the weight is the same on every set, otherwise set by set.
  function setsText(sets, timed) {
    if (timed) return sets.map(s => `${s.reps}s`).join(', ');
    const kgs = [...new Set(sets.map(s => +s.kg || 0))];
    if (kgs.length === 1) return kgs[0] ? `${g(kgs[0])} kg × ${sets.map(s => s.reps).join(', ')}` : `${sets.map(s => s.reps).join(', ')} reps`;
    return sets.map(s => +s.kg ? `${g(s.kg)} kg × ${s.reps}` : `${s.reps} reps`).join(', ');
  }
  function newExercise(name, plan) {
    const last = lastSets(name), timed = plan ? /s$/.test(String(plan.reps)) : last?.unit === 's';
    let sets;
    if (last && last.sets.length) sets = last.sets.map(s => ({ kg: s.kg || '', reps: s.reps || '', done: false }));
    else sets = Array.from({ length: plan?.sets || 3 }, () => ({ kg: '', reps: plan ? targetReps(plan.reps) : '', done: false }));
    if (plan && sets.length < plan.sets) while (sets.length < plan.sets) sets.push({ ...sets[sets.length - 1], done: false });
    return { name, unit: timed ? 's' : undefined, target: plan ? `${plan.sets} × ${plan.reps}` : '', range: plan?.reps || '', sets };
  }

  function start({ type = 'Strength', plan = null, past = false } = {}) {
    if (session && sessionHasWork() && !confirm('Replace the workout you have in progress?')) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    session = {
      createdAt: Date.now(), startedAt: null, past, date: past ? localDate(y) : today(), duration: past ? 45 : null,
      type: plan?.type || type, planId: plan?.id || null, name: plan?.name || (type === 'Strength' ? 'Workout' : type),
      exercises: plan ? plan.exercises.map(e => newExercise(e.name, e)) : [],
      distance: '', runMinutes: '', rounds: '', roundLength: 3, restEnd: null
    };
    persist(); go('train'); render();
  }
  function sessionHasWork() {
    return session && (session.exercises.some(e => e.sets.some(s => s.done)) || session.distance || session.rounds);
  }
  window.startPremadePlan = id => { const p = BUILTIN_PLANS.find(x => x.id === id); if (p) start({ plan: p }); };
  window.startPastSession = () => start({ past: true });

  // ---------- rendering ----------
  function render() {
    const active = !!session;
    $('#trainStart').classList.toggle('hidden', active);
    $('#trainSession').classList.toggle('hidden', !active);
    renderResume();
    if (!active) { stopClock(); hideRest(); return renderStart(); }
    $('#sessionName').textContent = session.name;
    $('#pastFields').classList.toggle('hidden', !session.past);
    if (session.past) { $('#pastDate').value = session.date; $('#pastDate').max = today(); $('#pastDuration').value = session.duration || ''; }
    $('#sessionClock').textContent = session.past ? 'Logging a past workout' : started() ? mmss(elapsed()) : 'Not started';
    $('#sessionClock').classList.toggle('idle', !session.past && !started());
    $('#startTimer').classList.toggle('hidden', session.past || started());
    $('#finishBtn').classList.toggle('quiet', !session.past && !started());
    $('#sessionTypes').innerHTML = TYPES.map(t => `<button type="button" role="radio" aria-checked="${t === session.type}" class="chip${t === session.type ? ' active' : ''}" data-type="${t}" style="--c:${TYPE_COLORS[t]}">${t}</button>`).join('');
    renderCardio();
    const sets = usesSets(session.type);
    $('#sessionExercises').classList.toggle('hidden', !sets);
    $('#addExerciseBtn').classList.toggle('hidden', !sets);
    if (sets) $('#sessionExercises').innerHTML = session.exercises.map(exerciseCard).join('') ||
      `<div class="card emptyCard"><p>Add your first exercise to start logging sets.</p></div>`;
    renderProgress(); startClock(); renderRest();
  }
  function renderProgress() {
    const box = $('#setProgress'); if (!box) return;
    const all = session && usesSets(session.type) ? session.exercises.flatMap(e => e.sets) : [];
    const done = all.filter(s => s.done).length;
    box.classList.toggle('hidden', !all.length || session.past);
    $('#setProgressFill').style.width = all.length ? `${done / all.length * 100}%` : '0';
    $('#setProgressText').textContent = `${done} of ${all.length} sets`;
  }
  function renderStart() {
    const day = DAYS[(new Date().getDay() + 6) % 7], planId = data.schedule?.[day], plan = BUILTIN_PLANS.find(p => p.id === planId);
    const first = (data.profile.name || '').trim().split(' ')[0], st = streak();
    $('#heroTitle').textContent = first ? `Ready to climb, ${first}?` : 'Ready to climb?';
    $('#heroKicker').textContent = st > 1 ? `${st}-day streak. Keep it going.` : plan ? `Today: ${plan.name}` : 'Every set counts towards your skills';
    $('#todayPlan').innerHTML = plan ? `<div class="card todayCard"><p class="muted small">Today’s plan</p><h2>${esc(plan.name)}</h2><p class="muted small">${plan.exercises.map(e => esc(e.name)).join(', ')}</p><button type="button" class="primary full" data-plan="${plan.id}">Start ${esc(plan.name)}</button></div>` : '';
    $('#startEmpty').classList.toggle('secondary', !!plan);
    $('#startEmpty').classList.toggle('primary', !plan);
    $('#startEmpty').textContent = plan ? 'Start a different workout' : 'Start workout';
    // Suggest plans: the ones you've used most recently first, then the rest of your split.
    const recent = [...new Set([...data.workouts].reverse().map(w => w.planId).filter(Boolean))];
    const picks = [...recent.map(id => BUILTIN_PLANS.find(p => p.id === id)).filter(Boolean), ...BUILTIN_PLANS].filter((p, i, a) => a.indexOf(p) === i && p.id !== planId).slice(0, 4);
    const CAT_COLOR = { 'Full Body': 'var(--pine)', 'Push / Pull': 'var(--glacier)', 'Upper / Lower': 'var(--amber)', 'Bro Split': 'var(--moss)' };
    $('#planPicks').innerHTML = picks.map(p => `<button type="button" class="planPick" data-plan="${p.id}" style="--c:${CAT_COLOR[p.category] || 'var(--pine)'}"><span class="pickIcon">${icon('dumbbell')}</span><span class="pickText"><b>${esc(p.name)}</b><small>${p.exercises.length} exercises, ${esc(p.category)}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>`).join('');
  }
  function renderResume() {
    const box = $('#resumeBanner'); if (!box) return;
    box.innerHTML = session && !session.past ? `<button type="button" class="resumeBanner" id="resumeBtn"><span class="pulse${started() ? '' : ' still'}" aria-hidden="true"></span><span><b>${started() ? 'Workout in progress' : 'Workout ready to start'}</b><small>${esc(session.name)}${started() ? `, ${mmss(elapsed())}` : ''}</small></span><span class="resumeGo">Resume</span></button>` : '';
  }
  function exerciseCard(e, i) {
    const last = lastSets(e.name), timed = e.unit === 's';
    const lastTxt = last ? `Last time: ${setsText(last.sets.filter(s => +s.reps > 0), timed)}` : e.target ? `Target: ${e.target}` : 'First time logging this';
    const sug = !session.past && !e.sets.every(s => s.done) ? suggestionFor(e) : null;
    const used = sug && e.sugUsed;
    const sugHtml = sug ? `<div class="suggest ${sug.kind}${used ? ' used' : ''}"><span class="sugIcon" aria-hidden="true">${sug.kind === 'up' ? '▲' : sug.kind === 'deload' ? '↺' : '+'}</span>
        <div class="sugText"><b>${used ? 'Using today’s target' : 'Try today'}: ${esc(setsText(sug.sets, timed))}</b><small>${esc(sug.reason)}</small></div>
        ${used ? '' : `<button type="button" class="sugUse" data-usesug="${i}">Use</button>`}</div>` : '';
    const rest = restFor(e.name), barbell = Coach.equipment(e.name) === 'barbell' && !timed;
    const restOpts = [45, 60, 75, 90, 120, 150, 180, 240, 300]; if (!restOpts.includes(rest)) restOpts.push(rest);
    const skill = skillForExercise(e.name), skillName = SKILLS.find(k => k.id === skill)?.name;
    return `<section class="card exCard" data-ex="${i}" style="--c:${SKILL_COLORS[skill] || 'var(--stone)'}">
      <div class="exHead"><div>${skillName ? `<span class="muscleTag">${esc(skillName)}</span>` : ''}<h3>${esc(e.name)}</h3><p class="muted small">${esc(lastTxt)}</p></div>
        <button type="button" class="iconBtn exRemove" data-remove="${i}" aria-label="Remove ${esc(e.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      ${sugHtml}
      ${session.past ? '' : `<div class="exTools">${barbell ? `<button type="button" class="toolBtn" data-plates="${i}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20M6 7v10M9 5v14M15 5v14M18 7v10"/></svg>Plates</button>` : ''}
        <label class="toolBtn restSel"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>Rest <select data-restsel="${i}" aria-label="Rest between sets for ${esc(e.name)}">${restOpts.sort((a, b) => a - b).map(v => `<option value="${v}"${v === rest ? ' selected' : ''}>${mmss(v)}</option>`).join('')}</select></label></div>`}
      <div class="setGrid${session.past ? ' past' : ''}"><span>Set</span><span>kg</span><span>${timed ? 'sec' : 'reps'}</span>${session.past ? '' : '<span aria-hidden="true"></span>'}
        ${e.sets.map((s, j) => `<span class="setNo${s.done ? ' done' : ''}">${j + 1}</span>
          <input type="number" inputmode="decimal" min="0" step="0.5" value="${s.kg}" placeholder="–" class="${s.done ? 'done' : ''}" data-field="kg" data-set="${j}" aria-label="Set ${j + 1} kg">
          <input type="number" inputmode="numeric" min="0" step="1" value="${s.reps}" placeholder="–" class="${s.done ? 'done' : ''}" data-field="reps" data-set="${j}" aria-label="Set ${j + 1} ${timed ? 'seconds' : 'reps'}">
          ${session.past ? '' : `<button type="button" class="tick${s.done ? ' done' : ''}" data-tick="${j}" aria-pressed="${s.done}" aria-label="Set ${j + 1} done"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`}`).join('')}
      </div>
      <div class="exFoot"><button type="button" class="link" data-addset="${i}">+ Add set</button>${e.sets.length > 1 ? `<button type="button" class="link muted" data-delset="${i}">Remove last set</button>` : ''}</div>
    </section>`;
  }
  const g = v => (v === '' || v == null ? '–' : Math.round(+v * 10) / 10);
  function renderCardio() {
    const t = session.type, box = $('#cardioFields');
    const f = (id, label, val, extra = '') => `<label>${label}<input data-cardio="${id}" type="number" min="0" ${extra} value="${val ?? ''}"></label>`;
    box.innerHTML = t === 'Running' ? `<div class="card form2">${f('distance', 'Distance (km)', session.distance, 'step="0.01" inputmode="decimal"')}${f('runMinutes', 'Run time (min)', session.runMinutes, 'step="0.1" inputmode="decimal"')}</div>`
      : t === 'Boxing' ? `<div class="card form2">${f('rounds', 'Rounds', session.rounds, 'inputmode="numeric"')}${f('roundLength', 'Round length (min)', session.roundLength, 'step="0.5" inputmode="decimal"')}</div>`
      : '';
  }

  // ---------- clock + rest ----------
  function startClock() {
    stopClock();
    if (!started()) return;
    clockTimer = setInterval(() => { $('#sessionClock').textContent = mmss(elapsed()); renderResume(); }, 1000);
  }
  function stopClock() { clearInterval(clockTimer); clockTimer = null; }
  // The rest timer ticks on its own (it used to only move while the workout clock was running).
  let audio = null, doneUntil = 0;
  function unlockAudio() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch { audio = null; } }
  function beep() {
    if (!audio) return;
    try { [0, 0.22, 0.44].forEach((t, k) => { const o = audio.createOscillator(), v = audio.createGain(), at = audio.currentTime + t;
      o.frequency.value = k === 2 ? 1175 : 880; v.gain.setValueAtTime(0.0001, at); v.gain.exponentialRampToValueAtTime(0.25, at + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      o.connect(v).connect(audio.destination); o.start(at); o.stop(at + 0.2); }); } catch {}
  }
  function nextSetText() {
    for (const e of session?.exercises || []) { const j = e.sets.findIndex(s => !s.done); if (j >= 0) { const s = e.sets[j], timed = e.unit === 's';
      return `Next: ${e.name}, set ${j + 1}${s.reps ? `, ${timed ? `${s.reps}s` : +s.kg ? `${g(s.kg)} kg × ${s.reps}` : `${s.reps} reps`}` : ''}`; } }
    return 'Last set done. Finish when you’re ready.';
  }
  function startRest(sec = DEFAULT_REST) {
    if (!session || session.past) return;
    session.restEnd = Date.now() + sec * 1000; session.restLen = sec; doneUntil = 0; persist(); renderRest();
    clearInterval(restTimer); restTimer = setInterval(renderRest, 250);
  }
  function hideRest() { $('#restPill').classList.add('hidden'); }
  function renderRest() {
    const pill = $('#restPill');
    if (doneUntil && Date.now() < doneUntil && $('#train').classList.contains('active')) return;
    if (doneUntil) { doneUntil = 0; pill.classList.remove('done'); }
    if (!session?.restEnd) { clearInterval(restTimer); restTimer = null; return pill.classList.add('hidden'); }
    if (!$('#train').classList.contains('active')) return pill.classList.add('hidden');
    const left = (session.restEnd - Date.now()) / 1000;
    if (left <= 0) {
      const fresh = left > -2; // only alert if it ran out just now, not when coming back to the app much later
      session.restEnd = null; persist();
      if (fresh) { navigator.vibrate?.([160, 90, 160]); beep(); doneUntil = Date.now() + 2500; pill.classList.add('done'); $('#restLabel').textContent = 'Rest done'; $('#restTime').textContent = 'Go!'; $('#restBar').style.width = '100%'; return; }
      pill.classList.add('hidden'); return;
    }
    pill.classList.remove('hidden', 'done');
    $('#restLabel').textContent = 'Rest';
    $('#restTime').textContent = mmss(Math.ceil(left));
    $('#restBar').style.width = `${Math.max(0, Math.min(100, 100 - left / (session.restLen || DEFAULT_REST) * 100))}%`;
    $('#restNext').textContent = nextSetText();
  }
  if (session?.restEnd) restTimer = setInterval(renderRest, 250);
  $('#startTimer').addEventListener('click', () => {
    if (!session || started()) return;
    session.startedAt = Date.now(); persist(); render();
  });
  $('#restPlus').addEventListener('click', () => { if (session?.restEnd) { session.restEnd += 15000; session.restLen = (session.restLen || DEFAULT_REST) + 15; persist(); renderRest(); } });
  $('#restMinus').addEventListener('click', () => { if (session?.restEnd) { session.restEnd -= 15000; persist(); renderRest(); } });
  $('#restSkip').addEventListener('click', () => { if (session) { session.restEnd = null; doneUntil = 0; persist(); renderRest(); } });

  // ---------- session interactions ----------
  $('#trainStart').addEventListener('click', e => {
    const p = e.target.closest('[data-plan]'); if (p) return window.startPremadePlan(p.dataset.plan);
    const t = e.target.closest('[data-start-type]'); if (t) return start({ type: t.dataset.startType });
  });
  $('#startEmpty').addEventListener('click', () => start());
  $('#logPast').addEventListener('click', () => start({ past: true }));
  $('#logPastFromLog')?.addEventListener('click', () => start({ past: true }));
  document.addEventListener('click', e => { if (e.target.closest('#resumeBtn')) go('train'); });

  $('#sessionTypes').addEventListener('click', e => {
    const b = e.target.closest('[data-type]'); if (!b || !session) return;
    session.type = b.dataset.type;
    if (session.name === 'Workout' || TYPES.includes(session.name)) session.name = session.type === 'Strength' ? 'Workout' : session.type;
    persist(); render();
  });
  $('#trainSession').addEventListener('input', e => {
    if (!session) return;
    const el = e.target;
    if (el.dataset.cardio) { session[el.dataset.cardio] = el.value; return persist(); }
    if (el.id === 'pastDate') { session.date = el.value; return persist(); }
    if (el.id === 'pastDuration') { session.duration = el.value; return persist(); }
    const card = el.closest('[data-ex]');
    if (card && el.dataset.field) { session.exercises[+card.dataset.ex].sets[+el.dataset.set][el.dataset.field] = el.value; persist(); }
  });
  $('#sessionExercises').addEventListener('click', e => {
    const card = e.target.closest('[data-ex]'); if (!card || !session) return;
    const ex = session.exercises[+card.dataset.ex];
    const tick = e.target.closest('[data-tick]');
    if (tick) {
      const s = ex.sets[+tick.dataset.tick];
      if (!s.done && (s.reps === '' || +s.reps <= 0)) { card.querySelector(`[data-field=reps][data-set="${tick.dataset.tick}"]`).focus(); return; }
      s.done = !s.done; persist();
      tick.classList.toggle('done', s.done); tick.setAttribute('aria-pressed', s.done);
      card.querySelectorAll(`[data-set="${tick.dataset.tick}"]`).forEach(x => x.classList.toggle('done', s.done));
      card.querySelectorAll('.setNo')[+tick.dataset.tick]?.classList.toggle('done', s.done);
      if (s.done) { tick.classList.remove('pop'); void tick.offsetWidth; tick.classList.add('pop'); }
      renderProgress();
      if (s.done) { navigator.vibrate?.(15); unlockAudio(); startRest(restFor(ex.name)); }
      return;
    }
    if (e.target.closest('[data-usesug]')) {
      const sug = suggestionFor(ex); if (!sug) return;
      sug.sets.forEach((t, j) => { if (!ex.sets[j]) ex.sets.push({ kg: '', reps: '', done: false }); if (!ex.sets[j].done) { ex.sets[j].kg = +t.kg ? t.kg : ''; ex.sets[j].reps = t.reps; } });
      ex.sugUsed = true; persist(); return render();
    }
    if (e.target.closest('[data-plates]')) return openPlates(+card.dataset.ex);
    if (e.target.closest('[data-addset]')) { const lastSet = ex.sets[ex.sets.length - 1] || { kg: '', reps: '' }; ex.sets.push({ kg: lastSet.kg, reps: lastSet.reps, done: false }); persist(); return render(); }
    if (e.target.closest('[data-delset]')) { ex.sets.pop(); persist(); return render(); }
    if (e.target.closest('[data-remove]')) {
      if (ex.sets.some(s => s.done) && !confirm(`Remove ${ex.name} and its sets?`)) return;
      session.exercises.splice(+card.dataset.ex, 1); persist(); render();
    }
  });
  $('#sessionExercises').addEventListener('change', e => {
    const sel = e.target.closest('[data-restsel]'); if (!sel || !session) return;
    const ex = session.exercises[+sel.dataset.restsel]; prefs().rest[ex.name.toLowerCase()] = +sel.value; save();
  });

  // ---------- plate maths ----------
  let plateEx = null;
  const PLATE_COLORS = { 25: '#c8423b', 20: '#2f6fb0', 15: '#e2b23a', 10: '#3f8a4f', 5: '#f2f0ea', 2.5: '#1f2a28', 1.25: '#9aa3a0' };
  function openPlates(i) {
    const ex = session.exercises[i]; plateEx = ex.name;
    const s = ex.sets.find(x => !x.done && +x.kg) || [...ex.sets].reverse().find(x => +x.kg);
    $('#plateKg').value = s ? s.kg : '';
    $('#plateTitle').textContent = ex.name;
    $('#plateSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    renderPlates();
  }
  function closePlates() { $('#plateSheet').classList.add('hidden'); document.body.classList.remove('sheetOpen'); }
  function renderPlates() {
    const have = Array.isArray(prefs().plates) ? prefs().plates : Coach.PLATES;
    const bar = +prefs().bar[(plateEx || '').toLowerCase()] || 20, kg = +$('#plateKg').value || 0, r = Coach.plates(kg, bar, Coach.PLATES.filter(p => have.includes(p)));
    $('#plateSet').innerHTML = Coach.PLATES.map(p => `<button type="button" class="pChip${have.includes(p) ? ' on' : ''}" data-plate="${p}" style="--c:${PLATE_COLORS[p]}" aria-pressed="${have.includes(p)}">${p}</button>`).join('');
    $('#plateBars').innerHTML = [20, 15, 10].map(b => `<button type="button" class="chip${b === bar ? ' active' : ''}" data-bar="${b}">${b} kg bar</button>`).join('');
    const h = p => 44 + p * 2.6;
    $('#plateViz').innerHTML = `<div class="pvBar"><span class="pvSleeve"></span>${r.perSide.map(p => `<span class="pvPlate" style="--h:${h(p)}px;--c:${PLATE_COLORS[p]}">${p}</span>`).join('')}<span class="pvCap"></span></div>`;
    $('#plateText').innerHTML = !kg ? 'Type the weight you want on the bar.'
      : r.belowBar ? `That’s less than the ${bar} kg bar on its own.`
      : !r.perSide.length ? 'Just the empty bar.'
      : `<b>Each side: ${r.perSide.join(' + ')} kg</b>${r.exact ? '' : `<br>Can’t make ${g(kg)} kg exactly. This loads ${g(r.loaded)} kg.`}`;
  }
  $('#plateKg').addEventListener('input', renderPlates);
  $('#plateBars').addEventListener('click', e => { const b = e.target.closest('[data-bar]'); if (!b || !plateEx) return; prefs().bar[plateEx.toLowerCase()] = +b.dataset.bar; save(); renderPlates(); });
  $('#plateSet').addEventListener('click', e => {
    const b = e.target.closest('[data-plate]'); if (!b) return;
    const p = +b.dataset.plate, have = Array.isArray(prefs().plates) ? [...prefs().plates] : [...Coach.PLATES];
    prefs().plates = have.includes(p) ? have.filter(x => x !== p) : [...have, p].sort((a, b) => b - a);
    save(); renderPlates();
  });
  $('#plateClose').addEventListener('click', closePlates);
  $('#plateSheet').addEventListener('click', e => { if (e.target.id === 'plateSheet') closePlates(); });

  $('#discardSession').addEventListener('click', () => {
    if (sessionHasWork() && !confirm('Discard this workout? Nothing from it will be saved.')) return;
    session = null; persist(); render();
  });

  // ---------- exercise picker ----------
  let pickerCat = 'All';
  function openPicker() { $('#exPicker').classList.remove('hidden'); document.body.classList.add('sheetOpen'); $('#exSearch').value = ''; renderPicker(); setTimeout(() => $('#exSearch').focus(), 50); }
  function closePicker() { $('#exPicker').classList.add('hidden'); document.body.classList.remove('sheetOpen'); }
  function renderPicker() {
    const q = $('#exSearch').value.trim(), ql = q.toLowerCase();
    const cats = ['All', ...new Set(EXERCISES.map(e => e.cat))];
    $('#exCats').innerHTML = cats.map(c => `<button type="button" class="chip${c === pickerCat ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
    const used = new Set([...data.workouts].reverse().flatMap(w => (w.exercises || []).map(e => e.name)));
    let list = EXERCISES.filter(e => (pickerCat === 'All' || e.cat === pickerCat) && e.name.toLowerCase().includes(ql));
    list.sort((a, b) => (used.has(b.name) - used.has(a.name)) || a.name.localeCompare(b.name));
    const exact = EXERCISES.some(e => e.name.toLowerCase() === ql);
    $('#exList').innerHTML = list.map(e => `<button type="button" class="foodResult" data-name="${esc(e.name)}"><span><b>${esc(e.name)}</b><small>${esc(e.cat)}${used.has(e.name) ? ', done before' : ''}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>`).join('') +
      (q && !exact ? `<button type="button" class="foodResult" data-new="${esc(q)}"><span><b>Add “${esc(q)}”</b><small>As a new exercise</small></span></button>` : '');
  }
  $('#addExerciseBtn').addEventListener('click', openPicker);
  $('#exPickerClose').addEventListener('click', closePicker);
  $('#exSearch').addEventListener('input', renderPicker);
  $('#exCats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { pickerCat = b.dataset.cat; renderPicker(); } });
  $('#exList').addEventListener('click', e => {
    const b = e.target.closest('[data-name],[data-new]'); if (!b || !session) return;
    session.exercises.push(newExercise(b.dataset.name || b.dataset.new.slice(0, 60)));
    persist(); closePicker(); render();
    const cards = $$('#sessionExercises .exCard'); cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ---------- finish ----------
  function countedSets(e) {
    const filled = s => +s.reps > 0;
    return session.past ? e.sets.filter(filled) : e.sets.filter(s => s.done && filled(s));
  }
  function openFinish() {
    if (!session) return;
    let ex = session.exercises.map(e => ({ e, sets: countedSets(e) })).filter(x => x.sets.length);
    const filledUnticked = !session.past && usesSets(session.type) && !ex.length && session.exercises.some(e => e.sets.some(s => +s.reps > 0));
    if (filledUnticked) {
      if (!confirm('You haven’t ticked any sets. Count all the sets you filled in?')) return;
      session.exercises.forEach(e => e.sets.forEach(s => { if (+s.reps > 0) s.done = true; })); persist();
      ex = session.exercises.map(e => ({ e, sets: countedSets(e) })).filter(x => x.sets.length);
    }
    const nSets = ex.reduce((a, x) => a + x.sets.length, 0);
    const vol = ex.reduce((a, x) => a + (x.e.unit === 's' ? 0 : x.sets.reduce((v, s) => v + (+s.kg || 0) * (+s.reps || 0), 0)), 0);
    const mins = session.past ? (+session.duration || 45) : started() ? Math.max(1, Math.round(elapsed() / 60)) : '';
    $('#finishSummary').innerHTML = [
      ['Exercises', ex.length], ['Sets', nSets], ['Volume', `${fmt(vol)} kg`],
      session.type === 'Running' ? ['Distance', `${+session.distance || 0} km`] : null,
      session.type === 'Boxing' ? ['Rounds', +session.rounds || 0] : null
    ].filter(Boolean).filter(([k]) => usesSets(session.type) || !['Exercises', 'Sets', 'Volume'].includes(k))
      .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('#finishDuration').value = mins;
    $('#finishEffort').value = session.effort || 7; effortLabel();
    $('#finishNotes').value = session.notes || '';
    $('#finishSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
  }
  function effortLabel() { const v = +$('#finishEffort').value; $('#effortLabel').textContent = `${v}, ${EFFORT[v].toLowerCase()}`; }
  $('#finishEffort').addEventListener('input', effortLabel);
  $('#finishBtn').addEventListener('click', openFinish);
  $('#finishBack').addEventListener('click', () => { $('#finishSheet').classList.add('hidden'); document.body.classList.remove('sheetOpen'); });
  $('#saveFinish').addEventListener('click', () => {
    if (!session || $('#saveFinish').disabled) return;
    const duration = Math.round(+$('#finishDuration').value || 0);
    if (duration < 1) { $('#finishDuration').focus(); return alert('Add how long the workout took.'); }
    const exercises = session.exercises.map(e => {
      const sets = countedSets(e).map(s => ({ kg: +s.kg || 0, reps: +s.reps || 0 }));
      if (!sets.length) return null;
      const best = e.unit === 's' ? sets.reduce((a, s) => (s.reps > a.reps ? s : a)) : sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) || (!a.kg && s.reps > a.reps) ? s : a));
      return { name: e.name, sets: sets.length, reps: best.reps, weight: best.kg, setsDetail: sets, ...(e.unit === 's' ? { unit: 's' } : {}) };
    }).filter(Boolean);
    const cardio = !usesSets(session.type) && (+session.distance || +session.rounds);
    if (usesSets(session.type) && !exercises.length && !confirm('No sets were logged. Save the workout anyway?')) return;
    if (!usesSets(session.type) && !cardio && !confirm(`No ${session.type === 'Running' ? 'distance' : 'rounds'} entered. Save anyway?`)) return;
    $('#saveFinish').disabled = true; setTimeout(() => { $('#saveFinish').disabled = false; }, 1500);

    const w = {
      id: newId(), updatedAt: Date.now(), date: session.past ? (session.date || today()) : localDate(new Date(session.startedAt || session.createdAt || Date.now())),
      type: session.type, duration, effort: +$('#finishEffort').value, notes: $('#finishNotes').value.trim(), exercises,
      distance: session.type === 'Running' ? +session.distance || 0 : 0, runMinutes: session.type === 'Running' ? +session.runMinutes || 0 : 0,
      rounds: session.type === 'Boxing' ? +session.rounds || 0 : 0, roundLength: session.type === 'Boxing' ? +session.roundLength || 0 : 0,
      planId: session.planId || null
    };
    const before = { xp: data.xp, ch: characterFrom(data.workouts), readyQuests: readyQuests() };
    w.result = grade(w);
    const { records } = workoutSkillXp(w, new Map(before.ch.bests));
    data.workouts.push(w); data.xp += w.result.xp;
    session = null; persist();
    $('#finishSheet').classList.add('hidden'); document.body.classList.remove('sheetOpen');
    save();
    render();
    showReward(w, before, records);
  });
  const readyQuests = () => CHALLENGES.filter(c => challengeStatus(c).done && !data.claimedChallenges.includes(c[0])).length;

  // ---------- reward screen ----------
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function countUp(el, to, ms) {
    if (reduceMotion()) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function showReward(w, before, records) {
    const r = $('#reward'), after = characterFrom(data.workouts);
    const lb = levelInfo(before.xp), la = levelInfo(data.xp);
    r.classList.remove('hidden', 'play'); document.body.classList.add('sheetOpen');
    $('#rewardGrade').textContent = w.result.grade;
    $('#rewardRing').innerHTML = ringsSvg([{ value: w.result.score / 100, color: 'var(--lichen)' }]);
    $('#rewardXp').textContent = '0';
    $('#rewardLevelName').textContent = `Level ${lb.level}`;
    $('#rewardLevelNext').textContent = `${fmt(lb.need - lb.into)} XP to ${lb.level + 1}`;
    const bar = $('#rewardBar'); bar.style.transition = 'none'; bar.style.width = `${lb.into / lb.need * 100}%`;
    const lvUp = $('#levelUp'); lvUp.classList.add('hidden');

    const gains = after.skills.map((s, i) => ({ s, b: before.ch.skills[i], gain: s.xp - before.ch.skills[i].xp })).filter(x => x.gain > 0).sort((a, b) => b.gain - a.gain);
    $('#rewardSkills').innerHTML = gains.length ? `<p class="rewardHead">Skills</p>` + gains.map(x => `<div style="--c:${SKILL_COLORS[x.s.id]}" class="rSkill" data-to="${x.s.max ? 100 : x.s.into / x.s.need * 100}" data-up="${x.s.level > x.b.level ? x.s.level : ''}">
        <span class="hex">${x.b.level}</span><div class="skillInfo"><div class="skillHead"><span>${x.s.name}</span><small>+${fmt(x.gain)} XP</small></div>
        <div class="tinybar"><i style="width:${x.s.level > x.b.level ? 0 : x.b.into / x.b.need * 100}%"></i></div></div></div>`).join('') : '';
    $('#rewardRecords').innerHTML = records.length ? `<p class="rewardHead">New records</p>` + records.map(rc => `<div class="rRecord"><span class="trophy" aria-hidden="true">★</span><span><b>${esc(rc.name)}</b><small>${g(rc.kg)} kg × ${rc.reps}, estimated 1-rep max ${fmt(rc.e1rm)} kg</small></span></div>`).join('') : '';
    const quests = readyQuests();
    $('#rewardQuests').textContent = quests > before.readyQuests ? `${quests} quest${quests > 1 ? 's' : ''} ready to claim on the Quests page.` : '';

    // One orchestrated sequence: grade, XP count, level bar, then skills.
    requestAnimationFrame(() => r.classList.add('play'));
    const fast = reduceMotion();
    setTimeout(() => countUp($('#rewardXp'), w.result.xp, 900), fast ? 0 : 450);
    setTimeout(() => {
      bar.style.transition = fast ? 'none' : 'width .9s cubic-bezier(.2,.8,.2,1)';
      if (la.level > lb.level) {
        bar.style.width = '100%';
        setTimeout(() => {
          bar.style.transition = 'none'; bar.style.width = '0%';
          $('#rewardLevelName').textContent = `Level ${la.level}`;
          $('#rewardLevelNext').textContent = `${fmt(la.need - la.into)} XP to ${la.level + 1}`;
          const newRank = rankFor(la.level) !== rankFor(lb.level);
          lvUp.textContent = newRank ? `Level up! You’ve reached ${titleCase(rankFor(la.level))} rank.` : `Level up! You’re now level ${la.level}.`;
          lvUp.classList.remove('hidden');
          requestAnimationFrame(() => { bar.style.transition = fast ? 'none' : 'width .6s ease-out'; bar.style.width = `${la.into / la.need * 100}%`; });
        }, fast ? 0 : 950);
      } else {
        bar.style.width = `${la.into / la.need * 100}%`;
        $('#rewardLevelNext').textContent = `${fmt(la.need - la.into)} XP to ${la.level + 1}`;
      }
    }, fast ? 0 : 500);
    $$('#rewardSkills .rSkill').forEach((row, i) => setTimeout(() => {
      row.classList.add('show');
      const fill = row.querySelector('.tinybar i'), hex = row.querySelector('.hex');
      fill.style.width = `${row.dataset.to}%`;
      if (row.dataset.up) { hex.textContent = row.dataset.up; row.classList.add('levelled'); row.querySelector('small').textContent += `, level ${row.dataset.up}!`; }
    }, fast ? 0 : 1500 + i * 220));
    setTimeout(() => $('#rewardContinue').focus(), fast ? 0 : 1600);
  }
  $('#rewardContinue').addEventListener('click', () => { $('#reward').classList.add('hidden'); document.body.classList.remove('sheetOpen'); go('home'); });

  document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (session) { $('#sessionClock').textContent = session.past ? $('#sessionClock').textContent : mmss(elapsed()); renderRest(); } renderResume(); } });
  window.renderTrain = render;
  render();
})();
