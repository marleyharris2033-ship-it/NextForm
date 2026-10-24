// NextForm recipes: the built-in collection (recipe-data.js) plus your own recipes, with macros per serving
// worked out from the food database. Log a serving in one tap. Your recipes sync in data.recipes.
(() => {
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const KEYS = ['kcal', 'protein', 'carbs', 'fat', 'fibre', 'sugar', 'salt'];
  const foodsByName = () => (foodsByName.m ||= new Map((window.COMMON_FOODS || []).map(f => [f.name, f])));
  const r1 = v => Math.round(v * 10) / 10;
  const mine = () => (data.recipes = Array.isArray(data.recipes) ? data.recipes : []);
  const favs = () => new Set(Array.isArray(data.favRecipes) ? data.favRecipes : []);

  // Built-in recipes: ingredients point at everyday foods by name.
  const builtIns = () => (builtIns.list ||= (window.RECIPE_DATA || []).map(([id, name, meal, mins, serves, tags, ing, steps]) => ({
    id, name, meal, mins, serves, tags: tags.split(/\s+/).filter(Boolean), steps, builtIn: true,
    ing: ing.map(([n, g, note]) => { const f = foodsByName().get(n); return { name: n, grams: g, note: note || '', per: f?.per || null, unit: 'g' }; })
  })));
  const all = () => [...mine().map(r => ({ ...r, tags: r.tags || [], mine: true })), ...builtIns()];
  const find = id => all().find(r => r.id === id);

  function totals(r, servings = r.serves) {
    const t = Object.fromEntries(KEYS.map(k => [k, 0])); const has = {};
    for (const i of r.ing) {
      if (!i.per) continue;
      const f = (i.unit === 'portion' ? i.grams : i.grams / 100);
      for (const k of KEYS) if (i.per[k] != null) { t[k] += i.per[k] * f; has[k] = true; }
    }
    const per = {}; for (const k of KEYS) if (k in has || ['kcal', 'protein', 'carbs', 'fat'].includes(k)) per[k] = t[k] / (r.serves || 1);
    return per;
  }
  const isHighProtein = p => p.protein >= 25 && p.protein * 4 / Math.max(p.kcal, 1) >= 0.25;
  const isVeg = r => r.tags.includes('veg') || r.tags.includes('vegan');

  // ---------- list ----------
  let view = 'list', filter = 'All', query = '', current = null, servings = 1, portion = 1, logMeal = 'Dinner', draft = null;
  const FILTERS = ['All', 'Favourites', 'My recipes', 'High protein', 'Under 500 kcal', 'Quick', 'Vegetarian', ...MEALS];
  function matches(r, p) {
    const f = favs();
    if (filter === 'Favourites' && !f.has(r.id)) return false;
    if (filter === 'My recipes' && !r.mine) return false;
    if (filter === 'High protein' && !isHighProtein(p)) return false;
    if (filter === 'Under 500 kcal' && p.kcal >= 500) return false;
    if (filter === 'Quick' && !(r.tags.includes('quick') || (r.mins && r.mins <= 20))) return false;
    if (filter === 'Vegetarian' && !isVeg(r)) return false;
    if (MEALS.includes(filter) && r.meal !== filter) return false;
    if (query) { const hay = `${r.name} ${r.ing.map(i => i.name).join(' ')}`.toLowerCase(); if (!query.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false; }
    return true;
  }
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function card(r) {
    const p = totals(r), f = favs().has(r.id);
    return `<button type="button" class="recipeCard" data-recipe="${esc(r.id)}"><span class="rcBody"><b>${esc(r.name)}</b>
      <small>${esc(r.meal)}${r.mins ? ` · ${r.mins} min` : ''}${r.mine ? ' · My recipe' : ''}${isVeg(r) ? ' · Vegetarian' : ''}</small></span>
      <span class="rcMacros"><b>${fmt(p.kcal)}</b><small>kcal</small><b>${Math.round(p.protein)} g</b><small>protein</small></span>${f ? `<span class="rcFav" aria-label="Favourite">${HEART}</span>` : ''}</button>`;
  }
  function renderList() {
    const list = all().map(r => [r, totals(r)]).filter(([r, p]) => matches(r, p));
    list.sort((a, b) => (b[0].mine - a[0].mine) || (favs().has(b[0].id) - favs().has(a[0].id)));
    $('#recipeBody').innerHTML = `
      <div class="searchRow"><input id="recipeQuery" type="search" placeholder="Search recipes or ingredients" value="${esc(query)}" autocomplete="off"></div>
      <div class="chips recipeFilters">${FILTERS.map(f => `<button type="button" class="chip${f === filter ? ' active' : ''}" data-rfilter="${f}">${f}</button>`).join('')}</div>
      <button type="button" class="newRecipe" id="newRecipe"><span aria-hidden="true">+</span>Create your own recipe</button>
      <p class="resultHead">${list.length} recipe${list.length === 1 ? '' : 's'}</p>
      <div class="recipeList">${list.map(([r]) => card(r)).join('') || `<p class="muted small">${filter === 'Favourites' ? 'Tap the heart on a recipe to save it here.' : filter === 'My recipes' ? 'Recipes you create appear here.' : 'No recipes match. Try fewer words.'}</p>`}</div>`;
    $('#recipeTitle').textContent = 'Recipes'; $('#recipeBack').hidden = true;
  }

  // ---------- detail ----------
  const amount = (i, mult) => { const g = i.grams * mult; return i.unit === 'portion' ? `${r1(g)} × portion` : `${g >= 100 ? Math.round(g / 5) * 5 : r1(g)} g`; };
  function renderDetail() {
    const r = find(current); if (!r) { view = 'list'; return renderList(); }
    const p = totals(r), mult = servings / r.serves, f = favs().has(r.id);
    const p1 = k => (p[k] ?? 0) * portion;
    $('#recipeTitle').textContent = r.mine ? 'My recipe' : 'Recipe'; $('#recipeBack').hidden = false;
    $('#recipeBody').innerHTML = `
      <div class="rdHead"><div><h2>${esc(r.name)}</h2><p class="muted small">${esc(r.meal)}${r.mins ? ` · ${r.mins} min` : ''} · makes ${r.serves} serving${r.serves > 1 ? 's' : ''}${isVeg(r) ? ' · Vegetarian' : ''}</p></div>
        <button type="button" class="iconBtn favBtn${f ? ' on' : ''}" id="recipeFav" aria-pressed="${f}" aria-label="${f ? 'Remove from favourites' : 'Add to favourites'}">${HEART}</button></div>
      <p class="fieldLabel">Per serving</p>
      <div class="rdMacros"><div><b>${fmt(p.kcal)}</b><small>kcal</small></div><div><b>${Math.round(p.protein)} g</b><small>protein</small></div><div><b>${Math.round(p.carbs)} g</b><small>carbs</small></div><div><b>${Math.round(p.fat)} g</b><small>fat</small></div></div>
      ${p.fibre != null ? `<p class="tiny muted">Fibre ${r1(p.fibre)} g · Sugar ${r1(p.sugar ?? 0)} g · Salt ${r1(p.salt ?? 0)} g</p>` : ''}
      <div class="rdServings"><span>Ingredients for</span><div class="stepper"><button type="button" data-serv="-1" aria-label="Fewer servings">−</button><b>${servings}</b><button type="button" data-serv="1" aria-label="More servings">+</button></div><span>serving${servings > 1 ? 's' : ''}</span></div>
      <ul class="rdIng">${r.ing.map(i => `<li><span>${esc(i.name)}${i.note && mult === 1 ? ` <small>(${esc(i.note)})</small>` : ''}</span><b>${amount(i, mult)}</b></li>`).join('')}</ul>
      ${r.steps?.length ? `<p class="fieldLabel">Method</p><ol class="rdSteps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      <div class="rdLog">
        <p class="fieldLabel">Log it</p>
        <div class="chips">${[0.5, 1, 1.5, 2].map(x => `<button type="button" class="chip${x === portion ? ' active' : ''}" data-portion="${x}">${x === 0.5 ? '½' : x === 1.5 ? '1½' : x} serving${x > 1 ? 's' : ''}</button>`).join('')}</div>
        <div class="chips">${MEALS.map(m => `<button type="button" class="chip${m === logMeal ? ' active' : ''}" data-logmeal="${m}">${m}</button>`).join('')}</div>
        <button type="button" class="primary full" id="recipeLog">Add to ${logMeal.toLowerCase()} · ${fmt(p1('kcal'))} kcal, ${Math.round(p1('protein'))} g protein</button>
      </div>
      ${r.mine ? `<div class="row rdMine"><button type="button" class="secondary" id="recipeEdit">Edit</button><button type="button" class="link muted" id="recipeDelete">Delete</button></div>` : '<p class="tiny muted">Nutrition is worked out from typical values for each ingredient.</p>'}`;
  }
  function logIt() {
    const r = find(current); if (!r) return;
    const per = totals(r);
    const product = { code: '', name: r.name, brand: r.mine ? 'My recipe' : 'NextForm recipe', unit: 'portion', per: Object.fromEntries(Object.entries(per).map(([k, v]) => [k, k === 'kcal' ? Math.round(v) : r1(v)])), servingG: null, servingLabel: '', image: '' };
    window.NextFormFood.addFood(product, portion, logMeal);
    close();
    window.NextFormFood.toast(`Added ${portion === 1 ? '' : `${portion} servings of `}${r.name} to ${logMeal.toLowerCase()}.`);
  }

  // ---------- your own recipes ----------
  function startBuilder(r = null) {
    draft = r ? JSON.parse(JSON.stringify({ id: r.id, name: r.name, meal: r.meal, serves: r.serves, mins: r.mins || '', ing: r.ing, steps: (r.steps || []).join('\n') }))
      : { id: null, name: '', meal: logMeal, serves: 4, mins: '', ing: [], steps: '' };
    view = 'build'; render();
  }
  let searchSeq = 0;
  function renderBuilder() {
    const p = totals({ ...draft, serves: +draft.serves || 1 });
    $('#recipeTitle').textContent = draft.id ? 'Edit recipe' : 'New recipe'; $('#recipeBack').hidden = false;
    $('#recipeBody').innerHTML = `
      <label>Name<input id="rbName" maxlength="70" placeholder="e.g. My chicken chilli" value="${esc(draft.name)}"></label>
      <div class="form2 topgap"><label>Servings it makes<input id="rbServes" type="number" min="1" max="30" inputmode="numeric" value="${draft.serves}"></label>
        <label>Meal<select id="rbMeal">${MEALS.map(m => `<option${m === draft.meal ? ' selected' : ''}>${m}</option>`).join('')}</select></label></div>
      <p class="fieldLabel topgap">Ingredients</p>
      <ul class="rbIng">${draft.ing.map((i, n) => `<li><span>${esc(i.name)}${i.brand && i.brand !== 'Common food' ? ` <small>${esc(i.brand)}</small>` : ''}</span>
        <label class="rbAmt"><input type="number" min="0" step="any" inputmode="decimal" data-ig="${n}" value="${i.grams}" aria-label="Amount of ${esc(i.name)}"><small>${i.unit === 'portion' ? 'portions' : 'g'}</small></label>
        <button type="button" class="iconBtn" data-irm="${n}" aria-label="Remove ${esc(i.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('') || '<li class="muted small">No ingredients yet.</li>'}</ul>
      <div class="searchRow rbSearch"><input id="rbFind" type="search" placeholder="Add an ingredient, e.g. chicken breast" autocomplete="off"><button type="button" class="secondary" id="rbFindBtn">Find</button></div>
      <div id="rbResults" class="foodResults"></div>
      <div class="rbTotals"><span>Per serving</span><b>${fmt(p.kcal)} kcal</b><b>${Math.round(p.protein)} g protein</b><b>${Math.round(p.carbs)} g carbs</b><b>${Math.round(p.fat)} g fat</b></div>
      <label class="topgap">Method <small class="optTag">optional</small><textarea id="rbSteps" rows="4" placeholder="One step per line">${esc(draft.steps)}</textarea></label>
      <button type="button" class="primary full" id="rbSave">Save recipe</button>`;
  }
  async function findIngredient() {
    const q = $('#rbFind').value.trim(), box = $('#rbResults'), seq = ++searchSeq;
    if (q.length < 2) return;
    box.innerHTML = '<p class="muted small">Searching…</p>';
    const list = await window.NextFormFood.searchFoods(q, list => { if (seq === searchSeq) showResults(list, true); });
    if (seq === searchSeq) showResults(list, false);
  }
  let results = [];
  function showResults(list, more) {
    results = list.slice(0, 12);
    $('#rbResults').innerHTML = results.map((p, i) => `<button type="button" class="foodResult" data-ri="${i}"><span><b>${esc(p.name)}</b><small>${esc([p.brand === 'Common food' ? '' : p.brand, p.unit === 'portion' ? `${fmt(p.per.kcal)} kcal per portion` : `${fmt(p.per.kcal)} kcal per 100 g`].filter(Boolean).join(', '))}</small></span><span class="addPlus" aria-hidden="true">+</span></button>`).join('')
      + (more ? '<p class="muted tiny">Checking Open Food Facts for more…</p>' : results.length ? '' : '<p class="muted small">Nothing found. Try other words.</p>');
  }
  function addIngredient(p) {
    draft.ing.push({ name: p.name, brand: p.brand || '', code: p.code || '', unit: p.unit === 'portion' ? 'portion' : 'g', grams: p.unit === 'portion' ? 1 : Math.round(p.servingG || 100), per: p.per });
    results = []; renderBuilder();
    $$('#recipeBody [data-ig]').at(-1)?.focus();
  }
  function saveRecipe() {
    draft.name = $('#rbName').value.trim().slice(0, 70);
    if (!draft.name) { $('#rbName').focus(); return alert('Give your recipe a name.'); }
    if (!draft.ing.length) return alert('Add at least one ingredient.');
    const r = { id: draft.id || 'rcp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: draft.name, meal: draft.meal,
      serves: Math.max(1, Math.min(30, Math.round(+draft.serves || 1))), mins: null, tags: [], ing: draft.ing.filter(i => +i.grams > 0).map(i => ({ ...i, grams: +i.grams })),
      steps: String(draft.steps || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30), updatedAt: Date.now() };
    const list = mine(), at = list.findIndex(x => x.id === r.id);
    if (at >= 0) list[at] = r; else list.unshift(r);
    save(); current = r.id; servings = r.serves; portion = 1; view = 'detail'; draft = null; render();
  }
  function deleteRecipe() {
    const r = find(current); if (!r?.mine || !confirm(`Delete “${r.name}”? Anything you’ve already logged stays in your food log.`)) return;
    data.recipes = mine().filter(x => x.id !== r.id);
    data.deletedRecipes = [...new Set([...(data.deletedRecipes || []), r.id])].slice(-500);
    data.favRecipes = (data.favRecipes || []).filter(x => x !== r.id);
    save(); view = 'list'; render();
  }

  // ---------- sheet ----------
  function render() { view === 'detail' ? renderDetail() : view === 'build' ? renderBuilder() : renderList(); }
  function open(id = null, meal = null) {
    logMeal = meal || window.NextFormFood?.mealNow?.() || 'Dinner';
    if (id) { current = id; const r = find(id); servings = r?.serves || 1; portion = 1; view = 'detail'; } else view = 'list';
    $('#recipeSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    render(); $('#recipeBody').scrollTop = 0;
  }
  function close() {
    if (view === 'build' && draft && (draft.name || draft.ing.length) && !confirm('Close without saving this recipe?')) return;
    $('#recipeSheet').classList.add('hidden'); draft = null;
    if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen');
  }
  function back() {
    if (view === 'build') { if ((draft?.name || draft?.ing.length) && !confirm('Leave without saving this recipe?')) return; view = draft?.id ? 'detail' : 'list'; draft = null; }
    else view = 'list';
    render(); $('#recipeBody').scrollTop = 0;
  }
  $('#recipeClose').addEventListener('click', close);
  $('#recipeBack').addEventListener('click', back);
  $('#recipeBody').addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'recipeQuery') { query = t.value; const pos = t.selectionStart; renderList(); const q = $('#recipeQuery'); q.focus(); q.setSelectionRange(pos, pos); return; }
    if (!draft) return;
    if (t.id === 'rbName') draft.name = t.value;
    if (t.id === 'rbSteps') draft.steps = t.value;
    if (t.id === 'rbMeal') draft.meal = t.value;
    if (t.id === 'rbServes' || t.dataset.ig != null) {
      if (t.id === 'rbServes') draft.serves = t.value; else draft.ing[+t.dataset.ig].grams = t.value;
      const p = totals({ ...draft, serves: +draft.serves || 1, ing: draft.ing.map(i => ({ ...i, grams: +i.grams || 0 })) });
      $('#recipeBody .rbTotals').innerHTML = `<span>Per serving</span><b>${fmt(p.kcal)} kcal</b><b>${Math.round(p.protein)} g protein</b><b>${Math.round(p.carbs)} g carbs</b><b>${Math.round(p.fat)} g fat</b>`;
    }
  });
  $('#recipeBody').addEventListener('change', e => { if (draft && e.target.id === 'rbMeal') draft.meal = e.target.value; });
  $('#recipeBody').addEventListener('keydown', e => { if (e.target.id === 'rbFind' && e.key === 'Enter') { e.preventDefault(); findIngredient(); } });
  $('#recipeBody').addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.rfilter) { filter = t.dataset.rfilter; return renderList(); }
    if (t.dataset.recipe) { current = t.dataset.recipe; const r = find(current); servings = r.serves; portion = 1; view = 'detail'; render(); $('#recipeBody').scrollTop = 0; return; }
    if (t.id === 'newRecipe') return startBuilder();
    if (t.dataset.serv) { servings = Math.max(1, Math.min(20, servings + +t.dataset.serv)); return renderDetail(); }
    if (t.dataset.portion) { portion = +t.dataset.portion; return renderDetail(); }
    if (t.dataset.logmeal) { logMeal = t.dataset.logmeal; return renderDetail(); }
    if (t.id === 'recipeLog') return logIt();
    if (t.id === 'recipeFav') { const f = favs(); f.has(current) ? f.delete(current) : f.add(current); data.favRecipes = [...f]; save(); return renderDetail(); }
    if (t.id === 'recipeEdit') return startBuilder(find(current));
    if (t.id === 'recipeDelete') return deleteRecipe();
    if (t.id === 'rbFindBtn') return findIngredient();
    if (t.dataset.ri != null) return addIngredient(results[+t.dataset.ri]);
    if (t.dataset.irm != null) { draft.ing.splice(+t.dataset.irm, 1); return renderBuilder(); }
    if (t.id === 'rbSave') return saveRecipe();
  });
  document.addEventListener('click', e => { const b = e.target.closest('[data-open-recipes],[data-open-recipe]'); if (b) open(b.dataset.openRecipe || null, b.dataset.meal || null); });

  // For Suggest a meal: recipes whose single serving fits what's left today, best protein fit first.
  function fits(rem, meal, n = 3) {
    if (!(rem.kcal > 120)) return [];
    return all().map(r => ({ r, p: totals(r) }))
      .filter(({ r, p }) => p.kcal <= rem.kcal + 40 && p.kcal >= Math.min(250, rem.kcal * 0.4) && (meal === 'Snacks' ? r.meal === 'Snacks' : r.meal !== 'Snacks'))
      .map(x => ({ ...x, score: Math.abs(Math.max(0, rem.protein) - x.p.protein) / 10 + Math.abs(rem.kcal - x.p.kcal) / 150 + (x.r.meal === meal ? 0 : 1.2) - (favs().has(x.r.id) ? 1 : 0) - (x.r.mine ? 0.5 : 0) }))
      .sort((a, b) => a.score - b.score).slice(0, n);
  }
  window.NextFormRecipes = { open, all, totals, fits, find };
})();
