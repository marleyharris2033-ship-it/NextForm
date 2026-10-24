// NextForm food log: daily totals and targets, meals, Open Food Facts search, barcode scanning.
// Uses globals from app.js: data, save, $, $$, esc, fmt, today, localDate, newId, weight, ringsSvg, go.
(() => {
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const OFF_PRODUCT = 'https://world.openfoodfacts.org/api/v2/product/';
  const OFF_SEARCH = 'https://uk.openfoodfacts.org/cgi/search.pl'; // older search, used as a fallback
  const OFF_SEARCH_NEW = 'https://search.openfoodfacts.org/search'; // newer, faster search service
  const OFF_FIELDS = 'code,product_name,product_name_en,brands,serving_size,serving_quantity,nutriments,image_front_small_url';
  const PRODUCT_CACHE = 'nextform-products'; // barcode lookups, kept on this device for offline re-use
  const DETECTOR_URL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/dist/es/ponyfill.min.js';
  const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
  const MEAL_ICONS = { Breakfast: ['sunrise', 'var(--amber)'], Lunch: ['sun', 'var(--lichen)'], Dinner: ['moon', 'var(--glacier)'], Snacks: ['cookie', 'var(--moss)'] };
  const MACROS = [
    { key: 'protein', label: 'Protein', color: 'var(--glacier)' },
    { key: 'carbs', label: 'Carbs', color: 'var(--lichen)' },
    { key: 'fat', label: 'Fat', color: 'var(--amber)' }
  ];

  let foodDay = today();
  const sheet = { tab: 'search', prevTab: 'search', meal: mealForNow(), product: null, editing: null };

  // ---------- helpers ----------
  const num = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };
  const g1 = v => (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10);
  function mealForNow() {
    const h = new Date().getHours();
    return h < 11 ? 'Breakfast' : h < 15 ? 'Lunch' : h < 21 ? 'Dinner' : 'Snacks';
  }
  function dayLabel(k) {
    const t = today();
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (k === t) return 'Today';
    if (k === localDate(y)) return 'Yesterday';
    return new Date(k + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function shiftDay(k, n) { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return localDate(d); }
  const entriesFor = k => (data.foodLog || []).filter(e => e.date === k);
  function totals(list) {
    return list.reduce((t, e) => ({ kcal: t.kcal + (+e.kcal || 0), protein: t.protein + (+e.protein || 0), carbs: t.carbs + (+e.carbs || 0), fat: t.fat + (+e.fat || 0) }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  }
  function validBarcode(code) {
    if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
    const digits = code.split('').map(Number), check = digits.pop();
    const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === check;
  }

  // ---------- targets ----------
  function suggestedTargets() {
    const p = data.profile || {};
    const w = weight() || 75, h = +p.height || 175, a = +p.age || 30;
    const sexAdj = p.sex === 'female' ? -161 : p.sex === 'male' ? 5 : -78;
    const maintain = (10 * w + 6.25 * h - 5 * a + sexAdj) * 1.55; // moderately active
    const goal = +p.goalWeight || null;
    const adjust = goal && goal < w - 1 ? -400 : goal && goal > w + 1 ? 250 : 0;
    const kcal = Math.round((maintain + adjust) / 10) * 10;
    const protein = Math.round(1.8 * w), fat = Math.round(0.8 * w);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat, adjust, goal };
  }
  function targets() {
    const n = data.nutrition || {};
    return n.custom ? { kcal: +n.kcal || 0, protein: +n.protein || 0, carbs: +n.carbs || 0, fat: +n.fat || 0 } : suggestedTargets();
  }

  // ---------- rendering ----------
  function renderFood() {
    const t = targets();
    const list = entriesFor(foodDay), sum = totals(list);
    const left = Math.round(t.kcal - sum.kcal);

    $('#foodDayLabel').textContent = dayLabel(foodDay);
    $('#foodNext').disabled = foodDay >= today();
    $('#kcalRing').innerHTML = ringsSvg([{ value: t.kcal ? sum.kcal / t.kcal : 0, color: left < 0 ? 'var(--amber)' : 'var(--pine)' }]);
    $('#kcalLeft').textContent = fmt(Math.abs(left));
    $('#kcalLeftLabel').textContent = left < 0 ? 'kcal over' : 'kcal left';
    $('#kcalEaten').textContent = fmt(sum.kcal);
    $('#kcalTarget').textContent = fmt(t.kcal);
    $('#macroBars').innerHTML = MACROS.map(m => macroRow(m, sum[m.key], t[m.key])).join('');
    const btn = $('#suggestMeal');
    if (btn) { btn.classList.toggle('hidden', !(left >= 120 && foodDay === today())); $('#suggestHint').textContent = `${fmt(left)} kcal and ${Math.max(0, Math.round(t.protein - sum.protein))} g protein left today`; }

    const yday = shiftDay(foodDay, -1), yList = entriesFor(yday);
    const dayAction = foodDay === today()
      ? (!list.length && yList.length ? `<button type="button" class="copyDay" data-copy-day="${yday}"><span class="cdIcon" aria-hidden="true">${COPY_ICON}</span><span><b>Copy all of yesterday</b><small>${yList.length} item${yList.length > 1 ? 's' : ''}, ${fmt(totals(yList).kcal)} kcal</small></span></button>` : '')
      : (list.length ? `<button type="button" class="copyDay" data-copy-day="${foodDay}" data-to-today="1"><span class="cdIcon" aria-hidden="true">${COPY_ICON}</span><span><b>Copy this whole day to today</b><small>${list.length} item${list.length > 1 ? 's' : ''}, ${fmt(sum.kcal)} kcal</small></span></button>` : '');
    $('#mealList').innerHTML = dayAction + MEALS.map(meal => {
      const items = list.filter(e => e.meal === meal || (meal === 'Snacks' && !MEALS.includes(e.meal))), mt = totals(items);
      const mi = MEAL_ICONS[meal];
      return `<section class="card mealCard"><div class="sectionHead"><div class="secTitle"><span class="secIcon" style="--c:${mi[1]}">${icon(mi[0])}</span><h2>${meal}</h2></div><div class="row"><span class="muted">${items.length ? `${fmt(mt.kcal)} kcal` : ''}</span><button type="button" class="iconBtn addMeal" data-meal="${meal}" aria-label="Add food to ${meal}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button></div></div>
        ${mealActions(meal, items, yList)}
        ${items.length ? `<ul class="foodItems">${items.map(e => `<li><button type="button" class="foodItem" data-entry="${esc(e.id)}"><span><b>${esc(e.name)}</b><small>${esc(amountText(e))}${e.brand ? `, ${esc(e.brand)}` : ''}</small></span><span class="foodKcal">${fmt(e.kcal)}</span></button></li>`).join('')}</ul>` : `<p class="muted small emptyMeal">Nothing logged yet.</p>`}
      </section>`;
    }).join('');

    const custom = data.nutrition?.custom;
    $('#targetNote').textContent = custom
      ? `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. These are your own targets.`
      : `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. Suggested from your profile${t.adjust < 0 ? ` with a gentle deficit towards ${t.goal} kg` : t.adjust > 0 ? ` with a small surplus towards ${t.goal} kg` : ''}. These are estimates, so adjust them to suit you.`;

    renderHomeFuel();
  }
  const COPY_ICON = '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const inMeal = (list, meal) => list.filter(e => e.meal === meal || (meal === 'Snacks' && !MEALS.includes(e.meal)));
  // Shortcuts under each meal: copy yesterday's (empty meal today), copy to today (past day), save as a meal.
  function mealActions(meal, items, yList) {
    const out = [];
    if (foodDay === today() && !items.length) {
      const y = inMeal(yList, meal);
      if (y.length) out.push(`<button type="button" class="mealAct" data-copy-meal="${meal}" data-from="${shiftDay(foodDay, -1)}">${COPY_ICON}Copy yesterday’s ${meal.toLowerCase()} <small>${fmt(totals(y).kcal)} kcal</small></button>`);
    }
    if (foodDay < today() && items.length) out.push(`<button type="button" class="mealAct" data-copy-meal="${meal}" data-from="${foodDay}" data-to-today="1">${COPY_ICON}Copy to today</button>`);
    if (items.length) out.push(`<button type="button" class="mealAct" data-save-meal="${meal}"><svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4z"/></svg>Save as meal</button>`);
    return out.length ? `<div class="mealActs">${out.join('')}</div>` : '';
  }
  // Copy entries to a day as new entries (they're separate from the originals).
  function copyEntries(entries, toDay, meal = null) {
    data.foodLog = data.foodLog || [];
    const now = Date.now();
    entries.forEach((e, i) => { const { id, date, updatedAt, ...rest } = e; data.foodLog.push({ ...rest, id: newId() + i, date: toDay, meal: meal || (MEALS.includes(e.meal) ? e.meal : 'Snacks'), updatedAt: now }); });
    save();
  }
  const savedMeals = () => (data.savedMeals = Array.isArray(data.savedMeals) ? data.savedMeals : []);
  function saveMeal(meal) {
    const items = inMeal(entriesFor(foodDay), meal); if (!items.length) return;
    const name = (prompt('Name this meal', `My usual ${meal.toLowerCase()}`) || '').trim().slice(0, 50);
    if (!name) return;
    const keep = ['name', 'brand', 'code', 'unit', 'grams', 'per', 'servingG', 'servingLabel', 'kcal', 'protein', 'carbs', 'fat'];
    savedMeals().unshift({ id: 'meal_' + newId(), name, meal, items: items.map(e => Object.fromEntries(keep.filter(k => e[k] != null).map(k => [k, e[k]]))), updatedAt: Date.now() });
    save();
    toastFood(`Saved “${name}”. Add it from Saved meals any time.`);
  }
  function toastFood(text) {
    let t = $('#foodToast'); if (!t) { t = document.createElement('div'); t.id = 'foodToast'; t.className = 'foodToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function renderSaved() {
    const list = savedMeals(), box = $('#savedMeals');
    box.innerHTML = list.length ? list.map(m => { const t = totals(m.items);
      return `<div class="savedMeal"><button type="button" class="smAdd" data-add-saved="${esc(m.id)}"><span><b>${esc(m.name)}</b><small>${m.items.length} item${m.items.length > 1 ? 's' : ''}, ${fmt(t.kcal)} kcal, ${g1(t.protein)} g protein</small><small class="smItems">${esc(m.items.map(i => i.name).join(', '))}</small></span><span class="smPlus" aria-hidden="true">+</span></button>
        <button type="button" class="iconBtn smDel" data-del-saved="${esc(m.id)}" aria-label="Delete ${esc(m.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`; }).join('')
      : `<p class="muted small savedEmpty">No saved meals yet. Log a meal, then tap <b>Save as meal</b> under it to add it here in one tap next time.</p>`;
  }
  $('#savedMeals').addEventListener('click', e => {
    const add = e.target.closest('[data-add-saved]'), del = e.target.closest('[data-del-saved]');
    if (add) { const m = savedMeals().find(x => x.id === add.dataset.addSaved); if (m) { copyEntries(m.items, foodDay, sheet.meal); closeSheet(); toastFood(`Added ${m.name} to ${sheet.meal.toLowerCase()}.`); } }
    if (del) { const m = savedMeals().find(x => x.id === del.dataset.delSaved); if (m && confirm(`Delete saved meal “${m.name}”?`)) {
      data.savedMeals = savedMeals().filter(x => x.id !== m.id); data.deletedSavedMeals = [...new Set([...(data.deletedSavedMeals || []), m.id])].slice(-500); save(); renderSaved(); } }
  });
  function macroRow(m, val, target) {
    const pct = target ? Math.min(100, val / target * 100) : 0;
    return `<div class="macro" style="--c:${m.color}"><div class="macroHead"><span>${m.label}</span><b>${g1(val)}<small> / ${target} g</small></b></div><div class="tinybar"><i style="width:${pct}%"></i></div></div>`;
  }
  function amountText(e) {
    if (e.unit === 'portion') return `${g1(e.grams || 1)} portion${(e.grams || 1) === 1 ? '' : 's'}`;
    return e.grams ? `${g1(e.grams)} g` : '1 portion';
  }
  function renderHomeFuel() {
    const card = $('#fuelBars'); if (!card) return;
    const t = targets(), sum = totals(entriesFor(today())), left = Math.round(t.kcal - sum.kcal);
    $('#fuelLeft').textContent = sum.kcal ? (left >= 0 ? `${fmt(left)} kcal left` : `${fmt(-left)} kcal over`) : 'Nothing logged yet';
    const rows = [{ label: 'Calories', val: sum.kcal, target: t.kcal, unit: 'kcal', color: 'var(--pine)' },
      { label: 'Protein', val: sum.protein, target: t.protein, unit: 'g', color: 'var(--glacier)' }];
    card.innerHTML = rows.map(r => `<div class="macro" style="--c:${r.color}"><div class="macroHead"><span>${r.label}</span><b>${fmt(r.val)}<small> / ${fmt(r.target)} ${r.unit}</small></b></div><div class="tinybar"><i style="width:${r.target ? Math.min(100, r.val / r.target * 100) : 0}%"></i></div></div>`).join('');
  }

  // ---------- targets editing ----------
  $('#editTargets').addEventListener('click', () => {
    const f = $('#targetForm'), open = f.classList.toggle('hidden') === false;
    $('#editTargets').textContent = open ? 'Cancel' : 'Edit';
    if (open) { const t = targets(); $('#tKcal').value = t.kcal; $('#tProtein').value = t.protein; $('#tCarbs').value = t.carbs; $('#tFat').value = t.fat; }
  });
  $('#saveTargets').addEventListener('click', () => {
    const v = id => Math.max(0, Math.round(+$(id).value || 0));
    if (v('#tKcal') < 800) return alert('Set a calorie target of at least 800 kcal.');
    data.nutrition = { custom: true, kcal: v('#tKcal'), protein: v('#tProtein'), carbs: v('#tCarbs'), fat: v('#tFat') };
    $('#targetForm').classList.add('hidden'); $('#editTargets').textContent = 'Edit';
    save();
  });
  $('#resetTargets').addEventListener('click', () => {
    data.nutrition = { custom: false };
    $('#targetForm').classList.add('hidden'); $('#editTargets').textContent = 'Edit';
    save();
  });

  // ---------- day navigation ----------
  $('#foodPrev').addEventListener('click', () => { foodDay = shiftDay(foodDay, -1); renderFood(); });
  $('#foodNext').addEventListener('click', () => { if (foodDay < today()) { foodDay = shiftDay(foodDay, 1); renderFood(); } });

  // ---------- sheet ----------
  const sheetEl = $('#foodSheet');
  function openSheet(tab, meal) {
    sheet.meal = meal || (foodDay === today() ? mealForNow() : 'Snacks');
    sheet.editing = null;
    sheetEl.classList.remove('hidden');
    document.body.classList.add('sheetOpen');
    setTab(tab);
  }
  function closeSheet() {
    stopScan();
    sheetEl.classList.add('hidden');
    document.body.classList.remove('sheetOpen');
  }
  function setTab(tab) {
    if (tab !== 'portion') sheet.prevTab = tab;
    sheet.tab = tab;
    $$('#foodSheet [data-pane]').forEach(p => p.hidden = p.dataset.pane !== tab);
    $$('#foodSheet [data-tab]').forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    $('#foodSheet .sheetTabs').hidden = tab === 'portion';
    $('#sheetBack').hidden = tab !== 'portion' || !!sheet.editing;
    $('#sheetTitle').textContent = tab === 'portion' ? (sheet.editing ? 'Edit food' : 'Add food') : `Add to ${sheet.meal.toLowerCase()}`;
    if (tab === 'scan') startScan(); else stopScan();
    if (tab === 'recent') renderRecent();
    if (tab === 'saved') renderSaved();
    if (tab === 'search') setTimeout(() => $('#foodQuery').focus(), 50);
  }
  $$('#foodSheet [data-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#sheetBack').addEventListener('click', () => setTab(sheet.prevTab || 'search'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheetEl.classList.contains('hidden')) closeSheet(); });
  $('#openScan').addEventListener('click', () => openSheet('scan'));
  $('#openSearch').addEventListener('click', () => openSheet('search'));
  $('#mealList').addEventListener('click', e => {
    const cm = e.target.closest('[data-copy-meal]'), cd = e.target.closest('[data-copy-day]'), sm = e.target.closest('[data-save-meal]');
    if (cm) { const to = cm.dataset.toToday ? today() : foodDay, items = inMeal(entriesFor(cm.dataset.from), cm.dataset.copyMeal);
      copyEntries(items, to); toastFood(cm.dataset.toToday ? `Copied ${cm.dataset.copyMeal.toLowerCase()} to today.` : `Copied yesterday’s ${cm.dataset.copyMeal.toLowerCase()}.`); return; }
    if (cd) { const to = cd.dataset.toToday ? today() : foodDay; copyEntries(entriesFor(cd.dataset.copyDay), to); toastFood(cd.dataset.toToday ? 'Copied the whole day to today.' : 'Copied all of yesterday.'); return; }
    if (sm) return saveMeal(sm.dataset.saveMeal);
    const add = e.target.closest('.addMeal');
    if (add) return openSheet('search', add.dataset.meal);
    const item = e.target.closest('[data-entry]');
    if (item) editEntry(item.dataset.entry);
  });

  // ---------- Open Food Facts ----------
  // The newer search can return a name as text or as { en: ..., main: ... }.
  const textOf = v => (typeof v === 'string' ? v.trim() : v && typeof v === 'object' ? String(v.en || v.main || Object.values(v)[0] || '').trim() : '');
  function fromOFF(p) {
    const n = p.nutriments || {};
    let kcal = num(n['energy-kcal_100g']);
    if (kcal == null && num(n.energy_100g) != null) kcal = num(n.energy_100g) / 4.184; // kJ to kcal
    return {
      code: String(p.code || ''),
      name: textOf(p.product_name_en) || textOf(p.product_name) || 'Unnamed product',
      brand: (Array.isArray(p.brands) ? String(p.brands[0] || '') : String(p.brands || '').split(',')[0]).trim(),
      unit: 'g',
      per: kcal == null ? null : { kcal, protein: num(n.proteins_100g) || 0, carbs: num(n.carbohydrates_100g) || 0, fat: num(n.fat_100g) || 0 },
      servingG: num(p.serving_quantity) > 0 ? num(p.serving_quantity) : null,
      packG: num(p.product_quantity) > 0 && !/ml|cl|l$/i.test(String(p.product_quantity_unit || '')) ? num(p.product_quantity) : null,
      servingLabel: p.serving_size || '',
      image: /^https:\/\/images\.openfoodfacts\.org\//.test(p.image_front_small_url || '') ? p.image_front_small_url : ''
    };
  }
  async function fetchJSON(url, ms = 10000) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  }
  const productCache = () => { try { return JSON.parse(localStorage.getItem(PRODUCT_CACHE) || '{}'); } catch { return {}; } };
  function rememberProduct(p) {
    try {
      const c = productCache(); c[p.code] = { ...p, savedAt: Date.now() };
      const keys = Object.keys(c).sort((a, b) => c[b].savedAt - c[a].savedAt);
      keys.slice(150).forEach(k => delete c[k]); // keep the newest 150
      localStorage.setItem(PRODUCT_CACHE, JSON.stringify(c));
    } catch {}
  }
  async function findBarcode(code) {
    const cached = productCache()[code];
    if (cached) return cached;
    const json = await fetchJSON(`${OFF_PRODUCT}${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`);
    if (json?.status !== 1 || !json.product) return null;
    const p = fromOFF({ code, ...json.product });
    if (p.per) rememberProduct(p);
    return p;
  }

  // Search
  // Search: everyday foods and your recent foods first (instant, work offline), then Open Food Facts.
  const words = q => q.toLowerCase().split(/[^a-z0-9%]+/).filter(w => w.length > 1);
  const matches = (text, ws) => ws.every(w => text.includes(w));
  function localMatches(q) {
    const ws = words(q); if (!ws.length) return { common: [], recent: [] };
    const common = (window.COMMON_FOODS || []).filter(f => matches(f.keywords, ws)).slice(0, 6);
    const recent = recentProducts().filter(p => matches(`${p.name} ${p.brand}`.toLowerCase(), ws)).slice(0, 5);
    return { common, recent };
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function searchOFF(q) {
    // 1. The newer search service. Fill in nutrition from the barcode lookup if a result is missing it.
    try {
      const json = await fetchJSON(`${OFF_SEARCH_NEW}?q=${encodeURIComponent(q)}&langs=en&page_size=24&fields=${OFF_FIELDS}`, 9000);
      if (Array.isArray(json?.hits) && json.hits.length) {
        const list = json.hits.map(fromOFF), missing = list.filter(p => !p.per && p.code).slice(0, 8);
        await Promise.all(missing.map(async p => { try { const full = await findBarcode(p.code); if (full?.per) Object.assign(p, full); } catch {} }));
        const good = list.filter(p => p.per);
        if (good.length) return good;
      }
    } catch {}
    // 2. The older search, tried twice: it has been failing intermittently.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const json = await fetchJSON(`${OFF_SEARCH}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=${OFF_FIELDS}`, 12000);
        return (json.products || []).map(fromOFF).filter(p => p.per);
      } catch (e) { if (attempt) throw e; await sleep(700); }
    }
    return [];
  }
  let searchSeq = 0;
  $('#foodSearchForm').addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('#foodQuery').value.trim();
    if (q.length < 2) return;
    const out = $('#searchResults'), status = $('#searchStatus'), seq = ++searchSeq;
    const { common, recent } = localMatches(q);
    let online = [];
    const draw = (note) => {
      const groups = [['Your recent foods', recent], ['Everyday foods', common], ['From Open Food Facts', online]].filter(g => g[1].length);
      const all = groups.flatMap(g => g[1]);
      let i = 0;
      out.innerHTML = groups.map(([title, list]) => `<p class="resultHead">${title}</p>` + list.map(p => resultRow(p, i++)).join('')).join('');
      out.onclick = ev => { const b = ev.target.closest('[data-i]'); if (b) { const p = all[+b.dataset.i]; showPortion(p, p.lastAmount ? { grams: p.lastAmount } : {}); } };
      status.textContent = note;
    };
    draw(common.length || recent.length ? 'Searching Open Food Facts for more…' : 'Searching…');
    if (!navigator.onLine) return draw(common.length || recent.length ? 'You’re offline, so only everyday and recent foods are shown.' : 'You’re offline. Try Recent or Quick add.');
    try {
      online = await searchOFF(q);
      if (seq !== searchSeq) return;
      draw(online.length ? '' : common.length || recent.length ? 'No branded matches on Open Food Facts. Try different words, or pick one above.' : 'No matches with nutrition info. Try fewer words, scan the barcode, or use Quick add.');
    } catch {
      if (seq !== searchSeq) return;
      draw(common.length || recent.length ? 'Open Food Facts isn’t responding right now, so only everyday and recent foods are shown.' : 'Open Food Facts search isn’t responding right now. Try again in a minute, scan the barcode, or use Quick add.');
    }
  });
  function resultRow(p, i) {
    return `<button type="button" class="foodResult" data-i="${i}"><span><b>${esc(p.name)}</b><small>${esc([p.brand === 'Common food' ? '' : p.brand, p.unit === 'g' ? `${fmt(p.per.kcal)} kcal per 100 g` : `${fmt(p.per.kcal)} kcal per portion`, p.per.protein >= 1 ? `${g1(p.per.protein)} g protein` : ''].filter(Boolean).join(', '))}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>`;
  }

  // Recent foods, newest first, one per product
  function recentProducts() {
    const seen = new Set(), out = [];
    for (const e of [...(data.foodLog || [])].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))) {
      const key = e.code || `${e.name}|${e.brand || ''}`;
      if (seen.has(key) || !e.per) continue;
      seen.add(key);
      out.push({ code: e.code || '', name: e.name, brand: e.brand || '', unit: e.unit || 'g', per: e.per, servingG: e.servingG || null, servingLabel: e.servingLabel || '', image: '', lastAmount: e.grams });
      if (out.length >= 30) break;
    }
    return out;
  }
  function renderRecent() {
    const list = recentProducts(), box = $('#recentFoods');
    box.innerHTML = list.length ? list.map(resultRow).join('') : '<p class="muted small">Foods you log will appear here for quick re-adding, even offline.</p>';
    box.onclick = ev => { const b = ev.target.closest('[data-i]'); if (b) { const p = list[+b.dataset.i]; showPortion(p, { grams: p.lastAmount }); } };
  }

  // Manual entry: stored as one portion with the totals given
  $('#manualForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#mName').value.trim(), kcal = num($('#mKcal').value);
    if (kcal == null) { $('#mKcal').focus(); return; }
    const per = { kcal, protein: num($('#mProtein').value) || 0, carbs: num($('#mCarbs').value) || 0, fat: num($('#mFat').value) || 0 };
    addEntry({ code: '', name: name || `Quick add, ${fmt(kcal)} kcal`, brand: '', unit: 'portion', per, servingG: null }, 1, sheet.meal);
    e.target.reset();
    closeSheet();
  });

  // ---------- portion editor ----------
  function showPortion(product, { grams, entry } = {}) {
    sheet.product = product;
    sheet.editing = entry || null;
    if (entry) sheet.meal = entry.meal;
    stopScan();
    const isG = product.unit !== 'portion';
    $('#pName').textContent = product.name;
    $('#pBrand').textContent = product.brand || '';
    const img = $('#pImage'); img.hidden = !product.image; if (product.image) img.src = product.image;
    $('#pGrams').previousSibling.textContent = isG ? 'Amount (g or ml)' : 'Portions';
    $('#pGrams').step = isG ? '1' : '0.5';
    $('#pGrams').value = g1(grams || (isG ? (product.servingG || 100) : 1));
    const quick = isG
      ? [product.servingG && { g: product.servingG, label: `1 serving (${g1(product.servingG)} g)` }, product.servingG && { g: product.servingG * 2, label: '2 servings' }, { g: 100, label: '100 g' }].filter(Boolean)
      : [{ g: 0.5, label: 'Half' }, { g: 1, label: '1 portion' }, { g: 2, label: '2 portions' }];
    $('#pQuick').innerHTML = quick.map(q => `<button type="button" class="chip" data-g="${q.g}">${esc(q.label)}</button>`).join('');
    $('#pSource').textContent = product.code ? `Nutrition from Open Food Facts${product.servingLabel ? `. Serving on pack: ${product.servingLabel}` : ''}.` : product.brand === 'Common food' ? 'Typical values for this food. Check the pack for a specific brand.' : '';
    $('#pSave').textContent = entry ? 'Save changes' : 'Add food';
    $('#pDelete').classList.toggle('hidden', !entry);
    renderMealChips();
    updatePortionTotals();
    setTab('portion');
  }
  function renderMealChips() {
    $('#pMeal').innerHTML = MEALS.map(m => `<button type="button" class="chip${m === sheet.meal ? ' active' : ''}" data-meal="${m}">${m}</button>`).join('');
  }
  function scaled(product, amount) {
    const f = product.unit === 'portion' ? amount : amount / 100, p = product.per;
    return { kcal: p.kcal * f, protein: p.protein * f, carbs: p.carbs * f, fat: p.fat * f };
  }
  function updatePortionTotals() {
    const amt = Math.max(0, num($('#pGrams').value) || 0), v = scaled(sheet.product, amt);
    $('#pTotals').innerHTML = [['Calories', `${fmt(v.kcal)}`, 'kcal'], ['Protein', g1(v.protein), 'g'], ['Carbs', g1(v.carbs), 'g'], ['Fat', g1(v.fat), 'g']]
      .map(([l, n, u]) => `<div><span>${l}</span><b>${n}<small> ${u}</small></b></div>`).join('');
  }
  $('#pGrams').addEventListener('input', updatePortionTotals);
  $('#pQuick').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { $('#pGrams').value = g1(+b.dataset.g); updatePortionTotals(); } });
  $('#pMeal').addEventListener('click', e => { const b = e.target.closest('[data-meal]'); if (b) { sheet.meal = b.dataset.meal; renderMealChips(); } });
  $('#pSave').addEventListener('click', () => {
    const amt = num($('#pGrams').value);
    if (!amt || amt <= 0) return alert('Enter how much you had.');
    if (sheet.editing) {
      const e = data.foodLog.find(x => x.id === sheet.editing.id);
      if (e) Object.assign(e, { grams: amt, meal: sheet.meal, ...roundVals(scaled(sheet.product, amt)), updatedAt: Date.now() });
      save();
    } else addEntry(sheet.product, amt, sheet.meal);
    closeSheet();
  });
  $('#pDelete').addEventListener('click', () => {
    const id = sheet.editing?.id; if (!id) return;
    data.foodLog = data.foodLog.filter(e => e.id !== id);
    data.deletedFood = [...(data.deletedFood || []), id].slice(-500);
    save(); closeSheet();
  });
  const roundVals = v => ({ kcal: Math.round(v.kcal), protein: Math.round(v.protein * 10) / 10, carbs: Math.round(v.carbs * 10) / 10, fat: Math.round(v.fat * 10) / 10 });
  function addEntry(product, amount, meal) {
    data.foodLog = data.foodLog || [];
    data.foodLog.push({
      id: newId(), date: foodDay, meal, name: product.name, brand: product.brand || '', code: product.code || '',
      unit: product.unit === 'portion' ? 'portion' : 'g', grams: amount,
      per: product.per, servingG: product.servingG || null, servingLabel: product.servingLabel || '',
      ...roundVals(scaled(product, amount)), updatedAt: Date.now()
    });
    save();
  }
  function editEntry(id) {
    const e = (data.foodLog || []).find(x => x.id === id); if (!e) return;
    sheetEl.classList.remove('hidden'); document.body.classList.add('sheetOpen');
    const product = e.per ? { code: e.code, name: e.name, brand: e.brand, unit: e.unit || 'g', per: e.per, servingG: e.servingG, servingLabel: e.servingLabel || '', image: '' }
      : { code: '', name: e.name, brand: e.brand, unit: 'portion', per: { kcal: e.kcal, protein: e.protein || 0, carbs: e.carbs || 0, fat: e.fat || 0 } };
    showPortion(product, { grams: e.per ? e.grams : 1, entry: e });
  }

  // ---------- barcode scanning ----------
  const video = $('#scanVideo');
  let stream = null, scanning = false, detector = null, lastMiss = '';
  const scanStatus = t => { $('#scanStatus').textContent = t; };
  async function getDetector() {
    if (detector) return detector;
    if ('BarcodeDetector' in window) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const usable = FORMATS.filter(f => supported.includes(f));
        if (usable.length) return (detector = new window.BarcodeDetector({ formats: usable }));
      } catch {}
    }
    const mod = await import(DETECTOR_URL); // iPhone Safari has no built-in reader; load one on first use
    return (detector = new mod.BarcodeDetector({ formats: FORMATS }));
  }
  async function startScan() {
    if (scanning || stream) return;
    if (!navigator.mediaDevices?.getUserMedia) return scanStatus('This browser can’t use the camera. Type the barcode number below.');
    scanStatus('Starting camera…');
    try {
      await getDetector();
    } catch {
      return scanStatus(navigator.onLine ? 'The scanner couldn’t load. Type the barcode number below.' : 'You’re offline, so the scanner can’t load. Type the barcode number or use Recent.');
    }
    if (sheet.tab !== 'scan') return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (sheet.tab !== 'scan') { s.getTracks().forEach(t => t.stop()); return; }
      stream = s; video.srcObject = s; await video.play();
      scanning = true;
      scanStatus('Point your camera at the barcode.');
      scanLoop();
    } catch (e) {
      stopScan();
      scanStatus(e?.name === 'NotAllowedError' ? 'Camera access is blocked. Allow it for this site in your browser settings, or type the barcode number below.' : 'Couldn’t start the camera. Type the barcode number below.');
    }
  }
  async function scanLoop() {
    if (!scanning) return;
    try {
      if (video.readyState >= 2) {
        const found = await detector.detect(video);
        const code = found.map(b => String(b.rawValue || '').trim()).find(c => validBarcode(c) && c !== lastMiss);
        if (code) { scanning = false; navigator.vibrate?.(40); return lookup(code); }
      }
    } catch {}
    setTimeout(scanLoop, 200);
  }
  function stopScan() {
    scanning = false;
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    if (video) video.srcObject = null;
  }
  async function lookup(code) {
    scanStatus(`Looking up ${code}…`);
    try {
      const p = await findBarcode(code);
      if (p && p.per) { stopScan(); return showPortion(p); }
      lastMiss = code;
      scanStatus(p ? `${p.name} has no nutrition info yet. Enter it manually instead.` : `Barcode ${code} isn’t in Open Food Facts yet. Try Search, or enter it manually.`);
      if (p) $('#mName').value = p.name;
    } catch {
      scanStatus(navigator.onLine ? 'The lookup didn’t respond. Try again in a moment.' : 'You’re offline, so the barcode can’t be looked up. Use Recent or enter it manually.');
    }
    if (sheet.tab === 'scan' && stream) { scanning = true; setTimeout(scanLoop, 1500); }
  }
  $('#barcodeForm').addEventListener('submit', e => {
    e.preventDefault();
    const code = $('#barcodeInput').value.replace(/\D/g, '');
    if (!validBarcode(code)) return scanStatus('That doesn’t look like a full barcode. Check the numbers under the bars.');
    scanning = false;
    lookup(code);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopScan(); else if (sheet.tab === 'scan' && !sheetEl.classList.contains('hidden')) startScan(); });

  window.renderFood = renderFood;
  window.foodTargets = targets;
  // ---------- meal suggestions ----------
  let suggestSkip = 0, suggestMeal = 'Dinner';
  function remainingToday() {
    const t = targets(), s = totals(entriesFor(foodDay));
    return { kcal: t.kcal - s.kcal, protein: t.protein - s.protein, carbs: t.carbs - s.carbs, fat: t.fat - s.fat };
  }
  function openSuggest() {
    suggestSkip = 0; suggestMeal = mealForNow(); offShown = [];
    $('#suggestSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    renderSuggest(); $('#suggestOff').dataset.meal = suggestMeal; renderOFFMeals(remainingToday());
  }
  function closeSuggest() { $('#suggestSheet').classList.add('hidden'); if (!document.querySelector('.sheet:not(.hidden)')) document.body.classList.remove('sheetOpen'); }
  let shown = [], offShown = [];
  // Ready meals sold in the UK from Open Food Facts, filtered towards what you need (more protein, less fat
  // on a high-fat day). Cached for half an hour so reopening the sheet doesn't search again.
  const offMealCache = new Map();
  async function fetchOFFMeals(rem) {
    const needProtein = rem.protein > 25, lowFat = rem.fat < 10;
    const key = `${needProtein}|${lowFat}`, hit = offMealCache.get(key);
    if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.list;
    const base = 'categories:"en:meals" AND countries:"en:united-kingdom"';
    const queries = [
      [base, needProtein ? 'nutriments.proteins_100g:[7 TO *]' : '', lowFat ? 'nutriments.fat_100g:[* TO 5]' : ''].filter(Boolean).join(' AND '),
      base, 'ready meal'
    ];
    for (const q of [...new Set(queries)]) {
      try {
        const json = await fetchJSON(`${OFF_SEARCH_NEW}?q=${encodeURIComponent(q)}&langs=en&page_size=100&sort_by=-unique_scans_n&fields=${OFF_FIELDS},product_quantity,product_quantity_unit`, 9000);
        const list = (json?.hits || []).map(fromOFF).filter(p => p.per && p.per.kcal > 40 && (p.packG || p.servingG));
        if (list.length >= 5) { offMealCache.set(key, { at: Date.now(), list }); return list; }
      } catch {}
    }
    return [];
  }
  const packText = s => { const n = s.packs; return n === 1 ? '1 pack' : n === 0.5 ? '½ pack' : `${n === 1.5 ? '1½' : n} packs`; };
  function ideaCard(s, i, kind) {
    const r0 = v => Math.round(v);
    return `<div class="ideaCard">
      <div class="ideaHead"><b>${esc(s.title)}</b>${s.source === 'saved' ? '<span class="ideaTag">Your saved meal</span>' : s.source === 'off' && s.items[0].food.brand ? `<span class="ideaTag off">${esc(s.items[0].food.brand)}</span>` : ''}</div>
      <ul class="ideaItems">${s.source === 'off' ? `<li><span>${packText(s)}</span><b>${g1(s.items[0].grams)} g</b></li>` : s.items.map(it => `<li><span>${esc(it.food.name)}</span><b>${it.food.unit === 'portion' ? `${g1(it.grams)} portion${it.grams === 1 ? '' : 's'}` : `${g1(it.grams)} g`}</b></li>`).join('')}</ul>
      <div class="ideaMacros"><span><b>${fmt(s.totals.kcal)}</b> kcal</span><span><b>${r0(s.totals.protein)}</b> g protein</span><span><b>${r0(s.totals.carbs)}</b> g carbs</span><span><b>${r0(s.totals.fat)}</b> g fat</span></div>
      <p class="ideaAfter">Covers ${s.proteinCover}% of your remaining protein. Afterwards: ${s.after.kcal >= 0 ? `${fmt(s.after.kcal)} kcal left` : `${fmt(-s.after.kcal)} kcal over`}.</p>
      <button type="button" class="primary full" data-add-idea="${kind}${i}">Add to ${suggestMeal.toLowerCase()}</button>
    </div>`;
  }
  let offSeq = 0;
  async function renderOFFMeals(rem) {
    const box = $('#suggestOff'), seq = ++offSeq;
    if (!navigator.onLine || rem.kcal < 120) { box.innerHTML = ''; return; }
    box.innerHTML = `<p class="resultHead">Ready meals from Open Food Facts</p><p class="muted small">Looking for UK ready meals that fit…</p>`;
    const list = await fetchOFFMeals(rem);
    if (seq !== offSeq) return;
    offShown = window.MealSuggest.rankProducts(rem, list, 3);
    box.innerHTML = `<p class="resultHead">Ready meals from Open Food Facts</p>` + (offShown.length
      ? offShown.map((s, i) => ideaCard(s, i, 'o')).join('') + `<p class="tiny muted">Nutrition from Open Food Facts, a volunteer database. Check the pack if accuracy matters.</p>`
      : `<p class="muted small">${list.length ? 'No ready meals fit what you have left right now.' : 'Open Food Facts isn’t responding right now, so only the ideas above are shown.'}</p>`);
  }
  function renderSuggest() {
    const rem = remainingToday();
    const left = (k, unit) => rem[k] >= 0 ? `${k === 'kcal' ? fmt(rem[k]) : Math.round(rem[k])}${unit}` : null;
    const over = ['protein', 'carbs', 'fat'].filter(k => rem[k] < -0.5).map(k => `${k} by ${Math.round(-rem[k])} g`);
    $('#suggestLeft').innerHTML = `You have <b>${fmt(Math.max(0, rem.kcal))} kcal</b>, <b>${Math.max(0, Math.round(rem.protein))} g protein</b>, <b>${Math.max(0, Math.round(rem.carbs))} g carbs</b> and <b>${Math.max(0, Math.round(rem.fat))} g fat</b> left.${over.length ? ` You’re already over on ${over.join(' and ')}, so these ideas keep that low.` : ''}`;
    $('#suggestMealChips').innerHTML = MEALS.map(m => `<button type="button" class="chip${m === suggestMeal ? ' active' : ''}" data-smeal="${m}">${m}</button>`).join('');
    shown = window.MealSuggest.suggest(rem, { foods: window.COMMON_FOODS || [], savedMeals: data.savedMeals || [], count: 3, skip: suggestSkip });
    if (!shown.length && suggestSkip) { suggestSkip = 0; return renderSuggest(); }
    $('#suggestList').innerHTML = shown.length ? shown.map((s, i) => ideaCard(s, i, 'i')).join('')
      : `<p class="muted">You’re within ${fmt(Math.max(0, rem.kcal))} kcal of your target, so there’s no need for a full meal. A piece of fruit or a yogurt would round off the day.</p>`;
    $('#suggestMore').classList.toggle('hidden', !shown.length);
    if (offShown.length && $('#suggestOff').dataset.meal !== suggestMeal) { $('#suggestOff').dataset.meal = suggestMeal; $('#suggestOff').innerHTML = `<p class="resultHead">Ready meals from Open Food Facts</p>` + offShown.map((s, i) => ideaCard(s, i, 'o')).join(''); }
  }
  $('#suggestMeal')?.addEventListener('click', openSuggest);
  $('#suggestClose').addEventListener('click', closeSuggest);
  $('#suggestMore').addEventListener('click', () => { suggestSkip += 3; renderSuggest(); $('#suggestSheet .sheetBody').scrollTop = 0; });
  $('#suggestMealChips').addEventListener('click', e => { const b = e.target.closest('[data-smeal]'); if (b) { suggestMeal = b.dataset.smeal; renderSuggest(); } });
  $('#suggestSheet').addEventListener('click', e => {
    const b = e.target.closest('[data-add-idea]'); if (!b) return;
    const id = b.dataset.addIdea, s = (id[0] === 'o' ? offShown : shown)[+id.slice(1)]; if (!s) return;
    const now = Date.now();
    data.foodLog = data.foodLog || [];
    s.items.forEach((it, k) => {
      const f = it.food, isG = f.unit !== 'portion', mult = isG ? it.grams / 100 : it.grams;
      data.foodLog.push({ id: newId() + k, date: foodDay, meal: suggestMeal, name: f.name, brand: f.brand === 'Common food' ? '' : (f.brand || ''), code: f.code || '',
        unit: isG ? 'g' : 'portion', grams: it.grams, per: f.per, servingG: f.servingG || null, servingLabel: f.servingLabel || '', ...roundVals({ kcal: f.per.kcal * mult, protein: f.per.protein * mult, carbs: f.per.carbs * mult, fat: f.per.fat * mult }), updatedAt: now });
    });
    save(); closeSuggest(); toastFood(`Added ${s.title.toLowerCase()} to ${suggestMeal.toLowerCase()}.`);
  });

  window.NextFormFood = { validBarcode, suggestedTargets }; // handy for checks
  renderFood();
})();
