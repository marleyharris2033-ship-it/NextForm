// NextForm guided mode: a full-screen player with a spoken coach.
//  - Workouts: one exercise and set at a time, with start/finish pictures, the target, form tips, a big
//    "done" button, a full-screen rest countdown and "next up". Timed holds count down on their own.
//  - Stretch & yoga: plays a routine pose by pose (both sides where needed), then logs it as a Mobility session.
// The voice uses the phone's built-in speech, so it's free and works offline. It can be muted.
(() => {
  const VOICE_KEY = 'nextform-voice';
  let voiceOn = (() => { try { return localStorage.getItem(VOICE_KEY) !== 'off'; } catch { return true; } })();
  let mode = null, tick = null, lastSpoken = '', wakeLock = null;
  const T = () => window.NextFormTrain;
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const g1 = v => Math.round(+v * 10) / 10;

  // ---------- voice ----------
  let voice = null;
  function pickVoice() {
    const vs = window.speechSynthesis?.getVoices?.() || [];
    voice = vs.find(v => /en-GB/i.test(v.lang) && /female|serena|kate|martha|libby|sonia/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; }
  function say(text, { force = false } = {}) {
    if (!voiceOn || !window.speechSynthesis || (!force && text === lastSpoken)) return;
    lastSpoken = text;
    try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); if (voice) u.voice = voice; u.lang = voice?.lang || 'en-GB'; u.rate = 1; window.speechSynthesis.speak(u); } catch {}
  }
  const spokenKg = kg => `${g1(kg)} ${+kg === 1 ? 'kilo' : 'kilos'}`;
  async function keepAwake(on) {
    try { if (on && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen'); else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; } } catch {}
  }

  // ---------- overlay ----------
  const el = () => $('#guided');
  function show(html) { el().innerHTML = html; }
  function open(m) {
    mode = m; el().classList.remove('hidden'); document.body.classList.add('guidedOpen'); keepAwake(true);
    clearInterval(tick); tick = setInterval(update, 250);
  }
  function close() {
    clearInterval(tick); tick = null; mode = null; el().classList.add('hidden'); el().innerHTML = '';
    document.body.classList.remove('guidedOpen'); window.speechSynthesis?.cancel(); keepAwake(false);
  }
  const top = (title, sub) => `<div class="gTop"><button type="button" class="gIcon" data-g="close" aria-label="Leave guided mode"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="gTitle"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
    <button type="button" class="gIcon" data-g="voice" aria-pressed="${voiceOn}" aria-label="${voiceOn ? 'Mute the coach' : 'Turn the coach on'}">${voiceOn
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'}</button></div>`;

  // ======================= workouts =======================
  let w = null; // { ei, si, holdEnd, holdLen, restSpokenEnd }
  const sess = () => T()?.session;
  function nextUndone() {
    const s = sess(); if (!s) return null;
    for (let ei = 0; ei < s.exercises.length; ei++) { const si = s.exercises[ei].sets.findIndex(x => !x.done); if (si >= 0) return { ei, si }; }
    return null;
  }
  function startWorkout() {
    const s = sess(); if (!s || !s.exercises.length) return;
    T().unlockAudio(); T().ensureStarted();
    const n = nextUndone() || { ei: s.exercises.length - 1, si: s.exercises.at(-1).sets.length - 1 };
    w = { ...n, holdEnd: 0 }; open('workout'); renderWorkout(true);
  }
  const meta = name => EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase());
  function targetText(ex, st) {
    const timed = ex.unit === 's';
    if (timed) return `${st.reps || 30} seconds`;
    return `${+st.kg ? `${g1(st.kg)} kg × ` : ''}${st.reps || '?'} reps`;
  }
  function renderWorkout(announce = false) {
    const s = sess(); if (!s) return close();
    const ex = s.exercises[w.ei], st = ex?.sets[w.si]; if (!st) return renderDone();
    const timed = ex.unit === 's', m = meta(ex.name), sug = T().suggestionFor(ex);
    const total = s.exercises.reduce((a, e) => a + e.sets.length, 0), done = s.exercises.reduce((a, e) => a + e.sets.filter(x => x.done).length, 0);
    show(`${top(s.name, `Exercise ${w.ei + 1} of ${s.exercises.length}`)}
      <div class="gProg"><i style="width:${done / total * 100}%"></i></div>
      <div class="gBody">
        <h2 class="gName">${esc(ex.name)}</h2>
        <div class="gFig">${window.Figures?.pictures(ex.name, 150) || ''}</div>
        <div class="gSet"><span>Set ${w.si + 1} of ${ex.sets.length}${st.done ? ' · done' : ''}</span>
          <div class="gTarget">${timed ? `<div class="gStep"><button type="button" data-g="reps" data-d="-5" aria-label="5 seconds less">−</button><b id="gReps">${st.reps || 30}</b><small>sec</small><button type="button" data-g="reps" data-d="5" aria-label="5 seconds more">+</button></div>`
            : `<div class="gStep"><button type="button" data-g="kg" data-d="-2.5" aria-label="Less weight">−</button><b id="gKg">${+st.kg ? g1(st.kg) : 0}</b><small>kg</small><button type="button" data-g="kg" data-d="2.5" aria-label="More weight">+</button></div>
               <div class="gStep"><button type="button" data-g="reps" data-d="-1" aria-label="One rep less">−</button><b id="gReps">${st.reps || 0}</b><small>reps</small><button type="button" data-g="reps" data-d="1" aria-label="One rep more">+</button></div>`}</div>
          ${sug && !timed && w.si === 0 ? `<p class="gTip">Coach: ${esc(sug.reason || '')}</p>` : ''}</div>
        ${m?.cues?.length ? `<ul class="gCues">${m.cues.slice(0, 3).map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="gActions">
        <button type="button" class="gNav" data-g="prev" ${w.ei === 0 && w.si === 0 ? 'disabled' : ''} aria-label="Previous set"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        ${timed ? `<button type="button" class="gGo" data-g="hold" id="gHoldBtn">Start ${st.reps || 30}s hold</button>` : `<button type="button" class="gGo" data-g="done">${st.done ? 'Done again ✓' : 'Done ✓'}</button>`}
        <button type="button" class="gNav" data-g="next" aria-label="Skip to next set"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div class="gRest hidden" id="gRest"><p>Rest</p><b id="gRestTime">1:30</b><small id="gRestNext"></small>
        <div class="row"><button type="button" class="gSmall" data-g="rest-15">−15s</button><button type="button" class="gSmall" data-g="rest+15">+15s</button><button type="button" class="gSmall" data-g="skiprest">Skip rest</button></div></div>`);
    if (announce) say(`${ex.name}. Set ${w.si + 1} of ${ex.sets.length}. ${timed ? `Hold for ${st.reps || 30} seconds.` : `${st.reps || ''} reps${+st.kg ? ` at ${spokenKg(st.kg)}` : ''}.`}`);
    update();
  }
  function advance() {
    const n = nextUndone();
    if (!n) return renderDone();
    w = { ...n, holdEnd: 0 }; renderWorkout(false);
  }
  function renderDone() {
    const s = sess();
    show(`${top(s?.name || 'Workout', 'All sets done')}<div class="gBody gCenter"><div class="gBig">💪</div><h2>That’s every set.</h2><p class="muted">Great work. Finish to see your XP.</p></div>
      <div class="gActions"><button type="button" class="gGo" data-g="finish">Finish workout</button></div>`);
    say('That’s every set. Great work. Tap finish to see your XP.');
  }
  function nextText() {
    const s = sess(), n = nextUndone(); if (!s || !n) return 'Last set done';
    const ex = s.exercises[n.ei], st = ex.sets[n.si];
    return n.ei === w.ei ? `Next: set ${n.si + 1} of ${ex.sets.length}` : `Next up: ${ex.name}, ${targetText(ex, st)}`;
  }
  function update() {
    if (mode === 'workout') return updateWorkout();
    if (mode === 'flow') return updateFlow();
  }
  let warned = 0;
  function updateWorkout() {
    const s = sess(); if (!s) return close();
    const rest = $('#gRest'); if (!rest) return;
    // timed hold
    if (w.holdEnd) {
      const left = (w.holdEnd - Date.now()) / 1000, btn = $('#gHoldBtn');
      if (btn) btn.textContent = left > 0 ? `${Math.ceil(left)}s` : 'Done';
      if (left <= 3 && left > 0 && warned !== Math.ceil(left)) { warned = Math.ceil(left); T().beep(); }
      if (left <= 0) { const ex = s.exercises[w.ei]; w.holdEnd = 0; T().setDone(w.ei, w.si, ex.sets[w.si].kg, ex.sets[w.si].reps || 30); if (!nextUndone()) { T().skipRest(); return renderDone(); } say('Good. Rest.'); }
    }
    if (s.restEnd) {
      const left = (s.restEnd - Date.now()) / 1000;
      rest.classList.remove('hidden');
      $('#gRestTime').textContent = mmss(left); $('#gRestNext').textContent = nextText();
      if (w.restSpokenEnd !== s.restEnd) { w.restSpokenEnd = s.restEnd; if (!w.holdEnd) say(`Rest ${Math.round(s.restLen || 90)} seconds. ${nextText().replace('Next up:', 'Next up,')}`); }
      if (left <= 3.2 && left > 0 && warned !== -Math.ceil(left)) { warned = -Math.ceil(left); }
      if (left <= 0.3) { T().skipRest(); rest.classList.add('hidden'); advanceAfterRest(); }
    } else if (!rest.classList.contains('hidden')) { rest.classList.add('hidden'); advanceAfterRest(); }
  }
  function advanceAfterRest() {
    if (mode !== 'workout') return;
    const n = nextUndone(); if (!n) return renderDone();
    w = { ...n, holdEnd: 0 }; renderWorkout(true);
  }

  // ======================= stretch & yoga =======================
  let f = null; // { routine, steps:[{pose, side, sec}], i, end, paused, left, startedAt }
  function expand(routine) {
    const byId = new Map((window.STRETCH_POSES || []).map(p => [p.id, p]));
    const out = [];
    for (const st of routine.steps) { const p = byId.get(st.pose); if (!p) continue; const sec = st.sec || p.sec;
      if (p.sides) out.push({ p, side: 'left', sec }, { p, side: 'right', sec }); else out.push({ p, side: '', sec }); }
    return out;
  }
  const routineSeconds = r => expand(r).reduce((a, s) => a + s.sec, 0) + expand(r).length * 3;
  function startFlow(routine) {
    window.NextFormTrain?.unlockAudio();
    f = { routine, steps: expand(routine), i: -1, end: 0, paused: false, left: 0, startedAt: Date.now(), ready: true };
    open('flow'); nextPose();
  }
  function nextPose(delta = 1) {
    f.i += delta;
    if (f.i >= f.steps.length) return flowDone();
    if (f.i < 0) f.i = 0;
    const st = f.steps[f.i];
    f.getReady = 3; f.end = Date.now() + (st.sec + 3) * 1000; f.paused = false; f.beeped = 0;
    renderFlow();
    say(`${st.p.name}${st.side ? `, ${st.side} side` : ''}. ${st.sec} seconds. ${st.p.cues[0]}`, { force: true });
  }
  function renderFlow() {
    const st = f.steps[f.i], nx = f.steps[f.i + 1];
    show(`${top(f.routine.name, `${f.i + 1} of ${f.steps.length}`)}
      <div class="gProg"><i style="width:${f.i / f.steps.length * 100}%"></i></div>
      <div class="gBody">
        <h2 class="gName">${esc(st.p.name)}${st.side ? ` <span class="gSide">${st.side} side</span>` : ''}</h2>
        <div class="gFig single${st.side === 'right' ? ' mirror' : ''}">${window.Figures.svg(st.p.pose, { size: 220, label: st.p.name })}</div>
        <div class="gClock"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="gTrack"/><circle cx="60" cy="60" r="52" class="gArc" id="gArc" pathLength="100" stroke-dasharray="100 100"/></svg><b id="gLeft">${st.sec}</b><small id="gState">Get ready</small></div>
        <ul class="gCues">${st.p.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
        <p class="gNext">${nx ? `Next: ${esc(nx.p.name)}${nx.side ? ` (${nx.side})` : ''}` : 'Last one'}</p>
      </div>
      <div class="gActions">
        <button type="button" class="gNav" data-g="fprev" aria-label="Previous pose" ${f.i === 0 ? 'disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button type="button" class="gGo" data-g="pause" id="gPause">Pause</button>
        <button type="button" class="gNav" data-g="fnext" aria-label="Next pose"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>`);
    updateFlow();
  }
  function updateFlow() {
    if (!f || f.done) return;
    const st = f.steps[f.i]; if (!st) return;
    const left = f.paused ? f.left : (f.end - Date.now()) / 1000;
    const hold = Math.min(st.sec, left), ready = left > st.sec;
    const lb = $('#gLeft'), arc = $('#gArc'), state = $('#gState'); if (!lb) return;
    lb.textContent = ready ? Math.ceil(left - st.sec) : Math.max(0, Math.ceil(hold));
    state.textContent = f.paused ? 'Paused' : ready ? 'Get ready' : 'Hold';
    arc.setAttribute('stroke-dasharray', `${ready ? 0 : Math.max(0, hold / st.sec * 100)} 100`);
    if (!f.paused && !ready && hold <= 3 && hold > 0 && f.beeped !== Math.ceil(hold)) { f.beeped = Math.ceil(hold); window.NextFormTrain?.beep(); }
    if (!f.paused && !ready && st.sec >= 30 && Math.ceil(hold) === Math.round(st.sec / 2) && f.half !== f.i) { f.half = f.i; say(st.p.cues[1] || 'Halfway. Keep breathing.'); }
    if (!f.paused && left <= 0) nextPose();
  }
  function flowDone() {
    f.done = true;
    const minutes = Math.max(1, Math.round((Date.now() - f.startedAt) / 60000));
    const yoga = f.routine.kind === 'yoga';
    show(`${top(f.routine.name, 'Complete')}<div class="gBody gCenter"><div class="gBig">🧘</div><h2>Routine complete</h2><p class="muted">${minutes} minute${minutes > 1 ? 's' : ''} of ${yoga ? 'yoga' : 'stretching'}. Your body will thank you.</p></div>
      <div class="gActions col"><button type="button" class="gGo" data-g="logflow">Log it and earn XP</button><button type="button" class="gSmall" data-g="close">Don’t log</button></div>`);
    say(`Routine complete. ${minutes} minutes. Nice work.`);
    f.minutes = minutes;
  }
  function logFlow() {
    const ok = T()?.startMobility({ name: f.routine.name, activity: f.routine.kind === 'yoga' ? 'Yoga class' : 'Stretching', minutes: f.minutes, startedAt: f.startedAt });
    close(); if (ok) T().finish();
  }

  // ---------- controls ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('#guided [data-g]'); if (!b) return;
    const a = b.dataset.g, s = sess();
    if (a === 'close') { if (mode === 'flow' && f && !f.done && f.i > 0 && !confirm('Stop this routine?')) return; return close(); }
    if (a === 'voice') { voiceOn = !voiceOn; try { localStorage.setItem(VOICE_KEY, voiceOn ? 'on' : 'off'); } catch {} if (!voiceOn) window.speechSynthesis?.cancel(); b.outerHTML = top('', '').match(/<button type="button" class="gIcon" data-g="voice"[\s\S]*?<\/button>/)[0]; return; }
    if (mode === 'workout' && s) {
      const ex = s.exercises[w.ei], st = ex?.sets[w.si];
      if (a === 'kg' && st) { st.kg = Math.max(0, g1((+st.kg || 0) + +b.dataset.d)); T().persist(); $('#gKg').textContent = g1(st.kg); }
      if (a === 'reps' && st) { st.reps = Math.max(ex.unit === 's' ? 5 : 1, (+st.reps || 0) + +b.dataset.d); T().persist(); $('#gReps').textContent = st.reps; const hb = $('#gHoldBtn'); if (hb && !w.holdEnd) hb.textContent = `Start ${st.reps}s hold`; }
      if (a === 'done' && st) { if (!(+st.reps > 0)) return; navigator.vibrate?.(15); T().setDone(w.ei, w.si); const n = nextUndone(); if (!n) { T().skipRest(); renderDone(); } }
      if (a === 'hold' && st && !w.holdEnd) { w.holdEnd = Date.now() + (+st.reps || 30) * 1000; warned = 0; say('Go.'); }
      if (a === 'next') { const all = s.exercises.flatMap((x, ei) => x.sets.map((_, si) => ({ ei, si }))); const k = all.findIndex(p => p.ei === w.ei && p.si === w.si); if (k < all.length - 1) { T().skipRest(); w = { ...all[k + 1], holdEnd: 0 }; renderWorkout(true); } }
      if (a === 'prev') { const all = s.exercises.flatMap((x, ei) => x.sets.map((_, si) => ({ ei, si }))); const k = all.findIndex(p => p.ei === w.ei && p.si === w.si); if (k > 0) { T().skipRest(); w = { ...all[k - 1], holdEnd: 0 }; renderWorkout(true); } }
      if (a === 'skiprest') { T().skipRest(); }
      if (a === 'rest+15') T().addRest(15);
      if (a === 'rest-15') T().addRest(-15);
      if (a === 'finish') { close(); T().finish(); }
    }
    if (mode === 'flow' && f) {
      if (a === 'pause') { if (f.paused) { f.end = Date.now() + f.left * 1000; f.paused = false; b.textContent = 'Pause'; } else { f.left = (f.end - Date.now()) / 1000; f.paused = true; b.textContent = 'Resume'; window.speechSynthesis?.cancel(); } updateFlow(); }
      if (a === 'fnext') nextPose(1);
      if (a === 'fprev') nextPose(-1);
      if (a === 'logflow') logFlow();
    }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && mode) keepAwake(true); });
  window.NextFormGuided = { startWorkout, startFlow, close, routineSeconds, expand, get mode() { return mode; } };
})();
