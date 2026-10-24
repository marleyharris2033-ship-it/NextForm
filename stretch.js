// NextForm Stretch & yoga: follow-along routines (stretch-data.js), a pose library and your own routines
// (synced in data.routines). Routines play in guided mode and log as Mobility sessions.
(() => {
  const poses = () => window.STRETCH_POSES || [];
  const poseById = id => poses().find(p => p.id === id);
  const mine = () => (data.routines = Array.isArray(data.routines) ? data.routines : []);
  const all = () => [...mine().map(r => ({ ...r, mine: true })), ...(window.STRETCH_ROUTINES || [])];
  const find = id => all().find(r => r.id === id);
  const mins = r => Math.max(1, Math.round(window.NextFormGuided.routineSeconds(r) / 60));
  const KIND = { yoga: ['Yoga', 'var(--lichen)'], stretch: ['Stretch', 'var(--glacier)'], mobility: ['Mobility', 'var(--moss)'] };
  let view = 'list', tab = 'routines', current = null, draft = null, poseFilter = 'All';

  // ---------- Train start card ----------
  function renderCard() {
    const box = $('#stretchCard'); if (!box) return;
    const picks = ['morning', 'after-lift', 'desk', 'bedtime'].map(find).filter(Boolean);
    box.innerHTML = `<div class="sectionHead"><h2>Stretch &amp; yoga</h2><button class="link" type="button" data-stretch-open>All routines</button></div>
      <p class="muted small">Follow-along routines with a voice coach. They count as Mobility and earn XP.</p>
      <div class="stretchPicks">${picks.map(r => `<button type="button" class="stretchPick" data-stretch="${r.id}" style="--c:${KIND[r.kind][1]}"><span class="spFig">${window.Figures.svg(poseById(r.steps[Math.min(2, r.steps.length - 1)].pose)?.pose, { size: 64 })}</span><b>${esc(r.name)}</b><small>${mins(r)} min</small></button>`).join('')}</div>`;
  }

  // ---------- sheet ----------
  function open(id = null) {
    if (id) { current = id; view = 'detail'; } else view = 'list';
    $('#stretchSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen'); render(); $('#stretchBody').scrollTop = 0;
  }
  function close() {
    if (view === 'build' && draft?.steps.length && !confirm('Close without saving this routine?')) return;
    draft = null; $('#stretchSheet').classList.add('hidden');
    if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen');
  }
  function render() { view === 'detail' ? renderDetail() : view === 'pose' ? renderPose() : view === 'build' ? renderBuild() : renderList(); }
  function renderList() {
    $('#stretchTitle').textContent = 'Stretch & yoga'; $('#stretchBack').hidden = true;
    const kinds = ['All', 'Stretch', 'Yoga', 'Mobility'];
    $('#stretchBody').innerHTML = `<div class="chips segTabs"><button type="button" class="chip${tab === 'routines' ? ' active' : ''}" data-stab="routines">Routines</button><button type="button" class="chip${tab === 'poses' ? ' active' : ''}" data-stab="poses">Pose library</button></div>
      ${tab === 'routines' ? `<button type="button" class="newRecipe" id="newRoutine"><span aria-hidden="true">+</span>Build your own routine</button>
        <div class="routineList">${all().map(r => `<button type="button" class="routineCard" data-stretch="${esc(r.id)}" style="--c:${KIND[r.kind]?.[1] || 'var(--moss)'}"><span class="spFig">${window.Figures.svg(poseById(r.steps[Math.min(2, r.steps.length - 1)]?.pose)?.pose, { size: 70 })}</span>
          <span class="rcBody"><b>${esc(r.name)}</b><small>${mins(r)} min · ${r.steps.length} moves${r.mine ? ' · My routine' : ''}</small><small class="rAbout">${esc(r.about || '')}</small></span></button>`).join('')}</div>`
      : `<div class="chips recipeFilters">${kinds.map(k => `<button type="button" class="chip${k === poseFilter ? ' active' : ''}" data-pkind="${k}">${k}</button>`).join('')}</div>
        <div class="poseGrid">${poses().filter(p => poseFilter === 'All' || KIND[p.kind][0] === poseFilter).map(p => `<button type="button" class="poseTile" data-pose="${p.id}">${window.Figures.svg(p.pose, { size: 96, label: p.name })}<b>${esc(p.name)}</b><small>${p.sec}s${p.sides ? ' each side' : ''}</small></button>`).join('')}</div>`}`;
  }
  function renderDetail() {
    const r = find(current); if (!r) { view = 'list'; return renderList(); }
    $('#stretchTitle').textContent = r.mine ? 'My routine' : 'Routine'; $('#stretchBack').hidden = false;
    $('#stretchBody').innerHTML = `<h2 class="rdTitle">${esc(r.name)}</h2><p class="muted small">${mins(r)} minutes · ${r.steps.length} moves · ${KIND[r.kind]?.[0] || 'Stretch'}</p>${r.about ? `<p class="small">${esc(r.about)}</p>` : ''}
      <button type="button" class="primary full startFlow" data-flow="${esc(r.id)}"><span class="snapDot" aria-hidden="true"></span>Start routine</button>
      <ol class="flowList">${r.steps.map(st => { const p = poseById(st.pose); if (!p) return ''; return `<li><button type="button" class="flowRow" data-pose="${p.id}"><span class="spFig">${window.Figures.svg(p.pose, { size: 64 })}</span><span><b>${esc(p.name)}</b><small>${st.sec || p.sec}s${p.sides ? ' each side' : ''}</small></span></button></li>`; }).join('')}</ol>
      ${r.mine ? '<div class="row rdMine"><button type="button" class="secondary" id="routineEdit">Edit</button><button type="button" class="link muted" id="routineDelete">Delete</button></div>' : ''}
      <p class="tiny muted">Move gently and never into pain. If you have an injury or health condition, check with a professional first.</p>`;
  }
  let poseReturn = 'list';
  function renderPose() {
    const p = poseById(current); if (!p) { view = 'list'; return renderList(); }
    $('#stretchTitle').textContent = 'Pose'; $('#stretchBack').hidden = false;
    $('#stretchBody').innerHTML = `<div class="poseHero">${window.Figures.svg(p.pose, { size: 240, label: p.name })}</div><h2 class="rdTitle">${esc(p.name)}</h2>
      <p class="muted small">Hold ${p.sec} seconds${p.sides ? ' on each side' : ''} · ${KIND[p.kind][0]}</p><ul class="gCues light">${p.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`;
  }

  // ---------- build your own ----------
  function startBuild(r = null) {
    draft = r ? { id: r.id, name: r.name, kind: r.kind, steps: r.steps.map(s => ({ ...s })) } : { id: null, name: '', kind: 'stretch', steps: [] };
    view = 'build'; render();
  }
  function renderBuild() {
    $('#stretchTitle').textContent = draft.id ? 'Edit routine' : 'New routine'; $('#stretchBack').hidden = false;
    const total = draft.steps.reduce((a, s) => { const p = poseById(s.pose); return a + (s.sec || p?.sec || 30) * (p?.sides ? 2 : 1); }, 0);
    $('#stretchBody').innerHTML = `<label>Name<input id="rtName" maxlength="60" placeholder="e.g. My leg-day stretch" value="${esc(draft.name)}"></label>
      <p class="fieldLabel topgap">Moves · about ${Math.max(1, Math.round(total / 60))} min</p>
      <ol class="rbIng buildList">${draft.steps.map((s, i) => { const p = poseById(s.pose); return `<li><span>${esc(p?.name || s.pose)}${p?.sides ? ' <small>each side</small>' : ''}</span>
        <label class="rbAmt"><input type="number" min="10" max="300" step="5" inputmode="numeric" data-ssec="${i}" value="${s.sec || p?.sec || 30}" aria-label="Seconds"><small>s</small></label>
        <button type="button" class="iconBtn" data-sup="${i}" ${i ? '' : 'disabled'} aria-label="Move up"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button>
        <button type="button" class="iconBtn" data-srm="${i}" aria-label="Remove"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`; }).join('') || '<li class="muted small">Tap moves below to add them.</li>'}</ol>
      <p class="fieldLabel topgap">Add moves</p>
      <div class="poseGrid small">${poses().map(p => `<button type="button" class="poseTile" data-padd="${p.id}">${window.Figures.svg(p.pose, { size: 72 })}<b>${esc(p.name)}</b></button>`).join('')}</div>
      <button type="button" class="primary full stickySave" id="rtSave">Save routine</button>`;
  }
  function saveRoutine() {
    draft.name = $('#rtName').value.trim().slice(0, 60);
    if (!draft.name) { $('#rtName').focus(); return alert('Give your routine a name.'); }
    if (!draft.steps.length) return alert('Add at least one move.');
    const kinds = draft.steps.map(s => poseById(s.pose)?.kind), kind = kinds.filter(k => k === 'yoga').length > kinds.length / 2 ? 'yoga' : 'stretch';
    const r = { id: draft.id || 'rt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: draft.name, kind, about: '', steps: draft.steps.map(s => ({ pose: s.pose, sec: Math.max(10, Math.min(300, Math.round(+s.sec || 30))) })), updatedAt: Date.now() };
    const list = mine(), at = list.findIndex(x => x.id === r.id);
    if (at >= 0) list[at] = r; else list.unshift(r);
    save(); draft = null; current = r.id; view = 'detail'; render();
  }
  function deleteRoutine() {
    const r = find(current); if (!r?.mine || !confirm(`Delete “${r.name}”?`)) return;
    data.routines = mine().filter(x => x.id !== r.id);
    data.deletedRoutines = [...new Set([...(data.deletedRoutines || []), r.id])].slice(-500);
    save(); view = 'list'; render();
  }

  // ---------- events ----------
  $('#stretchClose').addEventListener('click', close);
  $('#stretchBack').addEventListener('click', () => {
    if (view === 'build') { if (draft?.steps.length && !confirm('Leave without saving?')) return; view = draft?.id ? 'detail' : 'list'; draft = null; }
    else if (view === 'pose') view = poseReturn; else view = 'list';
    render(); $('#stretchBody').scrollTop = 0;
  });
  $('#stretchBody').addEventListener('input', e => {
    if (!draft) return;
    if (e.target.id === 'rtName') draft.name = e.target.value;
    if (e.target.dataset.ssec != null) draft.steps[+e.target.dataset.ssec].sec = +e.target.value;
  });
  $('#stretchBody').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.stab) { tab = b.dataset.stab; return renderList(); }
    if (b.dataset.pkind) { poseFilter = b.dataset.pkind; return renderList(); }
    if (b.dataset.flow) { const r = find(b.dataset.flow); close(); return window.NextFormGuided.startFlow(r); }
    if (b.dataset.padd) { draft.steps.push({ pose: b.dataset.padd, sec: poseById(b.dataset.padd).sec }); const y = $('#stretchBody').scrollTop; renderBuild(); $('#stretchBody').scrollTop = y; return; }
    if (b.dataset.srm) { draft.steps.splice(+b.dataset.srm, 1); return renderBuild(); }
    if (b.dataset.sup) { const i = +b.dataset.sup; [draft.steps[i - 1], draft.steps[i]] = [draft.steps[i], draft.steps[i - 1]]; return renderBuild(); }
    if (b.dataset.pose && view !== 'build') { poseReturn = view; current = b.dataset.pose; view = 'pose'; render(); $('#stretchBody').scrollTop = 0; return; }
    if (b.dataset.stretch) { current = b.dataset.stretch; view = 'detail'; render(); $('#stretchBody').scrollTop = 0; return; }
    if (b.id === 'newRoutine') return startBuild();
    if (b.id === 'routineEdit') return startBuild(find(current));
    if (b.id === 'routineDelete') return deleteRoutine();
    if (b.id === 'rtSave') return saveRoutine();
  });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-stretch-open]'), r = e.target.closest('#stretchCard [data-stretch]');
    if (o) open(); else if (r) open(r.dataset.stretch);
  });
  window.NextFormStretch = { open, renderCard, all, find };
  renderCard();
})();
