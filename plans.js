// NextForm custom plans: build your own workout from the exercise library, name it and save it.
// Saved plans live in data.plans and start, schedule and sync just like the built-in ones.
(() => {
  const PLAN_TYPES = ['Strength', 'Calisthenics', 'Mixed', 'Other'];
  let draft = null, startedFrom = '';

  const timedName = name => !!EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase())?.timed;
  const catOf = name => EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase())?.cat || 'Custom';
  const newPlanId = () => 'my_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const myPlans = () => (data.plans = Array.isArray(data.plans) ? data.plans : []);

  function openPlanBuilder(id = null, copyFrom = null) {
    const src = id ? myPlans().find(p => p.id === id) : copyFrom ? allPlans().find(p => p.id === copyFrom) : null;
    draft = src ? { id: id ? src.id : null, name: id ? src.name : `${src.name} (my version)`.slice(0, 60), type: PLAN_TYPES.includes(src.type) ? src.type : 'Strength',
      exercises: src.exercises.map(e => ({ name: e.name, sets: +e.sets || 3, reps: String(e.reps || '') })) }
      : { id: null, name: '', type: 'Strength', exercises: [] };
    startedFrom = JSON.stringify(draft);
    $('#planSheetTitle').textContent = id ? 'Edit plan' : 'New plan';
    $('#planName').value = draft.name;
    $('#planSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    renderBuilder();
    if (!id && !copyFrom) setTimeout(() => $('#planName').focus(), 60);
  }
  function closeBuilder(force = false) {
    if (!force && draft && JSON.stringify(draft) !== startedFrom && !confirm('Close without saving this plan?')) return;
    draft = null; $('#planSheet').classList.add('hidden');
    if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen');
  }

  function renderBuilder() {
    $('#planTypes').innerHTML = PLAN_TYPES.map(t => { const d = WORKOUT_TYPES.typeDef(t);
      return `<button type="button" class="chip${t === draft.type ? ' active' : ''}" data-ptype="${t}" style="--c:${d.color}">${esc(d.label)}</button>`; }).join('');
    const n = draft.exercises.length;
    $('#planExList').innerHTML = n ? draft.exercises.map((e, i) => `<div class="pRow" data-i="${i}">
        <div class="pTop"><span class="pNum">${i + 1}</span><div class="pName"><b>${esc(e.name)}</b><small>${esc(catOf(e.name))}${timedName(e.name) ? ', timed hold' : ''}</small></div>
          <div class="pMove"><button type="button" class="iconBtn" data-up="${i}" ${i ? '' : 'disabled'} aria-label="Move ${esc(e.name)} up"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button>
          <button type="button" class="iconBtn" data-down="${i}" ${i < n - 1 ? '' : 'disabled'} aria-label="Move ${esc(e.name)} down"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
          <button type="button" class="iconBtn" data-del="${i}" aria-label="Remove ${esc(e.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
        <div class="pFields"><label>Sets<input type="number" inputmode="numeric" min="1" max="10" data-f="sets" value="${e.sets}"></label>
          <label>${timedName(e.name) ? 'Seconds' : 'Reps'}<input type="text" inputmode="text" maxlength="12" data-f="reps" value="${esc(e.reps)}" placeholder="${timedName(e.name) ? '30-45s' : '8-12'}"></label></div>
      </div>`).join('')
      : `<p class="pEmpty">No exercises yet. Add some from the library.</p>`;
    $('#planCount').textContent = n ? `${n} exercise${n > 1 ? 's' : ''}, ${draft.exercises.reduce((a, e) => a + (+e.sets || 0), 0)} sets` : '';
  }

  function savePlan() {
    draft.name = $('#planName').value.trim().slice(0, 60);
    if (!draft.name) { $('#planName').focus(); return alert('Give your plan a name.'); }
    if (!draft.exercises.length) return alert('Add at least one exercise.');
    const exercises = draft.exercises.map(e => {
      const timed = timedName(e.name), sets = Math.max(1, Math.min(10, Math.round(+e.sets || 3)));
      let reps = String(e.reps || '').trim().replace(/\s+/g, '').replace(/–/g, '-');
      if (!/\d/.test(reps)) reps = timed ? '30-45s' : '8-12';
      if (timed && !/s$/i.test(reps)) reps += 's';
      return { name: e.name, sets, reps };
    });
    const plan = { id: draft.id || newPlanId(), name: draft.name, type: draft.type, category: 'My plans', custom: true, desc: '', exercises, updatedAt: Date.now() };
    const list = myPlans(), at = list.findIndex(p => p.id === plan.id);
    if (at >= 0) list[at] = plan; else list.unshift(plan);
    save(); closeBuilder(true);
    activePlanCategory = 'My plans'; plannerTabChosen = true;
    renderSimplePlanner(); window.renderTrain?.();
  }
  function deletePlan(id) {
    const p = myPlans().find(x => x.id === id); if (!p || !confirm(`Delete “${p.name}”? Workouts you've already done with it stay in your log.`)) return;
    data.plans = myPlans().filter(x => x.id !== id);
    data.deletedPlans = [...new Set([...(data.deletedPlans || []), id])].slice(-500);
    for (const d of Object.keys(data.schedule || {})) if (data.schedule[d] === id) delete data.schedule[d];
    save(); renderSimplePlanner(); window.renderTrain?.();
  }

  // ---------- events ----------
  $('#planClose').addEventListener('click', () => closeBuilder());
  $('#planSave').addEventListener('click', savePlan);
  $('#planName').addEventListener('input', e => { if (draft) draft.name = e.target.value; });
  $('#planTypes').addEventListener('click', e => { const b = e.target.closest('[data-ptype]'); if (b && draft) { draft.type = b.dataset.ptype; renderBuilder(); } });
  $('#planAddEx').addEventListener('click', () => window.openExercisePicker(name => {
    if (!draft) return;
    if (draft.exercises.some(e => e.name.toLowerCase() === name.toLowerCase()) && !confirm(`${name} is already in this plan. Add it again?`)) return;
    draft.exercises.push({ name, sets: 3, reps: timedName(name) ? '30-45s' : '8-12' }); renderBuilder();
    $('#planExList .pRow:last-child')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, draft?.type === 'Calisthenics' ? 'Calisthenics' : 'All'));
  $('#planExList').addEventListener('input', e => {
    const row = e.target.closest('[data-i]'), f = e.target.dataset.f; if (!row || !f || !draft) return;
    draft.exercises[+row.dataset.i][f] = e.target.value;
    if (f === 'sets') $('#planCount').textContent = `${draft.exercises.length} exercise${draft.exercises.length > 1 ? 's' : ''}, ${draft.exercises.reduce((a, x) => a + (+x.sets || 0), 0)} sets`;
  });
  $('#planExList').addEventListener('click', e => {
    if (!draft) return; const ex = draft.exercises, b = e.target.closest('[data-up],[data-down],[data-del]'); if (!b) return;
    if (b.dataset.up) { const i = +b.dataset.up; [ex[i - 1], ex[i]] = [ex[i], ex[i - 1]]; }
    else if (b.dataset.down) { const i = +b.dataset.down; [ex[i + 1], ex[i]] = [ex[i], ex[i + 1]]; }
    else ex.splice(+b.dataset.del, 1);
    renderBuilder();
  });
  document.addEventListener('click', e => {
    const ed = e.target.closest('[data-edit-plan]'), cp = e.target.closest('[data-copy-plan]'), del = e.target.closest('[data-delete-plan]');
    if (ed) openPlanBuilder(ed.dataset.editPlan);
    else if (cp) openPlanBuilder(null, cp.dataset.copyPlan);
    else if (del) deletePlan(del.dataset.deletePlan);
  });
  window.openPlanBuilder = openPlanBuilder;
})();
