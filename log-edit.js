// NextForm: edit a past workout from the training log (every set, plus date, duration, effort and notes).
// Saving re-grades the workout and adjusts XP by the difference.
(() => {
  let id = null, draft = null, original = '';
  const WT = window.WORKOUT_TYPES;
  const isTimed = name => !!EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase())?.timed;

  function open(workoutId) {
    const w = data.workouts.find(x => String(x.id) === String(workoutId)); if (!w) return;
    id = w.id;
    draft = {
      date: w.date, duration: w.duration || '', effort: w.effort || 7, notes: w.notes || '',
      fields: Object.fromEntries((WT.fields(WT.typeDef(w.type), w)).map(f => [f.k, w[f.k] ?? ''])),
      exercises: (w.exercises || []).map(e => ({ name: e.name, unit: e.unit, sets: setsOf(e).map(s => ({ kg: s.kg || '', reps: s.reps || '' })) }))
    };
    original = JSON.stringify(draft);
    $('#logEditTitle').textContent = `Edit ${WT.typeDef(w.type).label.toLowerCase()} workout`;
    $('#logEditSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    render(w);
  }
  function close(force = false) {
    if (!force && draft && JSON.stringify(draft) !== original && !confirm('Close without saving your changes?')) return;
    id = null; draft = null; $('#logEditSheet').classList.add('hidden');
    if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen');
  }
  function render(w = data.workouts.find(x => x.id === id)) {
    const t = WT.typeDef(w.type);
    const fields = WT.fields(t, w).map(f => `<label>${esc(f.label)}<input type="number" min="0" step="${f.step || 1}" inputmode="decimal" data-fld="${f.k}" value="${draft.fields[f.k] ?? ''}"></label>`).join('');
    $('#logEditBody').innerHTML = `
      <div class="form2"><label>Date<input type="date" data-top="date" value="${draft.date}" max="${today()}"></label><label>Duration (min)<input type="number" min="1" inputmode="numeric" data-top="duration" value="${draft.duration}"></label></div>
      <label class="leEffort">How hard was it? <b>${draft.effort}/10</b><input type="range" min="1" max="10" data-top="effort" value="${draft.effort}"></label>
      ${fields ? `<div class="form2 leFields">${fields}</div>` : ''}
      ${t.mode === 'sets' || draft.exercises.length ? `<div class="leExList">${draft.exercises.map((e, i) => `<div class="leEx" data-ex="${i}">
          <div class="leExHead"><b>${esc(e.name)}</b><button type="button" class="iconBtn" data-rmex="${i}" aria-label="Remove ${esc(e.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
          <div class="leSets"><span>Set</span><span>kg</span><span>${e.unit === 's' ? 'sec' : 'reps'}</span>${e.sets.map((s, j) => `<span class="setNo">${j + 1}</span>
            <input type="number" inputmode="decimal" min="0" step="0.5" data-set="${j}" data-f="kg" value="${s.kg}" placeholder="–" aria-label="Set ${j + 1} kg">
            <input type="number" inputmode="numeric" min="0" step="1" data-set="${j}" data-f="reps" value="${s.reps}" placeholder="–" aria-label="Set ${j + 1} ${e.unit === 's' ? 'seconds' : 'reps'}">`).join('')}</div>
          <div class="exFoot"><button type="button" class="link" data-addset="${i}">+ Add set</button>${e.sets.length > 1 ? `<button type="button" class="link muted" data-delset="${i}">Remove last set</button>` : ''}</div>
        </div>`).join('')}</div>
        <button type="button" class="secondary full" id="leAddEx">+ Add exercise</button>` : ''}
      <label>Notes<textarea data-top="notes" rows="2" placeholder="Optional">${esc(draft.notes)}</textarea></label>`;
  }
  function saveEdit() {
    const w = data.workouts.find(x => x.id === id); if (!w) return close(true);
    const duration = Math.round(+draft.duration || 0);
    if (duration < 1) return alert('Add how long the workout took.');
    if (!draft.date || draft.date > today()) return alert('Choose a date that isn’t in the future.');
    const exercises = draft.exercises.map(e => {
      const sets = e.sets.map(s => ({ kg: +s.kg || 0, reps: +s.reps || 0 })).filter(s => s.reps > 0);
      if (!sets.length) return null;
      const best = e.unit === 's' ? sets.reduce((a, s) => (s.reps > a.reps ? s : a)) : sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) || (!a.kg && s.reps > a.reps) ? s : a));
      return { name: e.name, sets: sets.length, reps: best.reps, weight: best.kg, setsDetail: sets, ...(e.unit === 's' ? { unit: 's' } : {}) };
    }).filter(Boolean);
    const oldXp = w.result?.xp || 0;
    Object.assign(w, { date: draft.date, duration, effort: +draft.effort || 7, notes: String(draft.notes || '').trim(), exercises });
    for (const [k, v] of Object.entries(draft.fields)) w[k] = +v || 0;
    recalcWorkoutAndXp(w, oldXp);
    save(); close(true);
  }

  // ---------- events ----------
  document.addEventListener('click', e => { const b = e.target.closest('[data-edit-workout]'); if (b) open(b.dataset.editWorkout); });
  $('#logEditClose').addEventListener('click', () => close());
  $('#logEditSave').addEventListener('click', saveEdit);
  $('#logEditBody').addEventListener('input', e => {
    if (!draft) return; const el = e.target;
    if (el.dataset.top) { draft[el.dataset.top] = el.value; if (el.dataset.top === 'effort') el.previousElementSibling.textContent = `${el.value}/10`; return; }
    if (el.dataset.fld) { draft.fields[el.dataset.fld] = el.value; return; }
    const ex = el.closest('[data-ex]'); if (ex && el.dataset.f) draft.exercises[+ex.dataset.ex].sets[+el.dataset.set][el.dataset.f] = el.value;
  });
  $('#logEditBody').addEventListener('click', e => {
    if (!draft) return;
    const add = e.target.closest('[data-addset]'), del = e.target.closest('[data-delset]'), rm = e.target.closest('[data-rmex]');
    if (add) { const ex = draft.exercises[+add.dataset.addset], last = ex.sets.at(-1) || { kg: '', reps: '' }; ex.sets.push({ ...last }); return render(); }
    if (del) { draft.exercises[+del.dataset.delset].sets.pop(); return render(); }
    if (rm) { const ex = draft.exercises[+rm.dataset.rmex]; if (confirm(`Remove ${ex.name} from this workout?`)) { draft.exercises.splice(+rm.dataset.rmex, 1); render(); } return; }
    if (e.target.closest('#leAddEx')) window.openExercisePicker(name => {
      if (!draft) return;
      draft.exercises.push({ name, unit: isTimed(name) ? 's' : undefined, sets: [{ kg: '', reps: '' }, { kg: '', reps: '' }, { kg: '', reps: '' }] }); render();
    });
  });
})();
