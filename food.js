// NextForm food log: daily totals and targets, meals, Open Food Facts search, barcode scanning.
// Uses globals from app.js: data, save, $, $$, esc, fmt, today, localDate, newId, weight, ringsSvg, go.
(() => {
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const OFF_PRODUCT = 'https://world.openfoodfacts.org/api/v2/product/';
  const OFF_SEARCH = 'https://uk.openfoodfacts.org/cgi/search.pl';
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

    $('#mealList').innerHTML = MEALS.map(meal => {
      const items = list.filter(e => e.meal === meal || (meal === 'Snacks' && !MEALS.includes(e.meal))), mt = totals(items);
      const mi = MEAL_ICONS[meal];
      return `<section class="card mealCard"><div class="sectionHead"><div class="secTitle"><span class="secIcon" style="--c:${mi[1]}">${icon(mi[0])}</span><h2>${meal}</h2></div><div class="row"><span class="muted">${items.length ? `${fmt(mt.kcal)} kcal` : ''}</span><button type="button" class="iconBtn addMeal" data-meal="${meal}" aria-label="Add food to ${meal}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button></div></div>
        ${items.length ? `<ul class="foodItems">${items.map(e => `<li><button type="button" class="foodItem" data-entry="${esc(e.id)}"><span><b>${esc(e.name)}</b><small>${esc(amountText(e))}${e.brand ? `, ${esc(e.brand)}` : ''}</small></span><span class="foodKcal">${fmt(e.kcal)}</span></button></li>`).join('')}</ul>` : `<p class="muted small emptyMeal">Nothing logged yet.</p>`}
      </section>`;
    }).join('');

    const custom = data.nutrition?.custom;
    $('#targetNote').textContent = custom
      ? `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. These are your own targets.`
      : `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. Suggested from your profile${t.adjust < 0 ? ` with a gentle deficit towards ${t.goal} kg` : t.adjust > 0 ? ` with a small surplus towards ${t.goal} kg` : ''}. These are estimates, so adjust them to suit you.`;

    renderHomeFuel();
  }
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
    if (tab === 'search') setTimeout(() => $('#foodQuery').focus(), 50);
  }
  $$('#foodSheet [data-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#sheetBack').addEventListener('click', () => setTab(sheet.prevTab || 'search'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheetEl.classList.contains('hidden')) closeSheet(); });
  $('#openScan').addEventListener('click', () => openSheet('scan'));
  $('#openSearch').addEventListener('click', () => openSheet('search'));
  $('#mealList').addEventListener('click', e => {
    const add = e.target.closest('.addMeal');
    if (add) return openSheet('search', add.dataset.meal);
    const item = e.target.closest('[data-entry]');
    if (item) editEntry(item.dataset.entry);
  });

  // ---------- Open Food Facts ----------
  function fromOFF(p) {
    const n = p.nutriments || {};
    let kcal = num(n['energy-kcal_100g']);
    if (kcal == null && num(n.energy_100g) != null) kcal = num(n.energy_100g) / 4.184; // kJ to kcal
    return {
      code: String(p.code || ''),
      name: (p.product_name_en || p.product_name || '').trim() || 'Unnamed product',
      brand: String(p.brands || '').split(',')[0].trim(),
      unit: 'g',
      per: kcal == null ? null : { kcal, protein: num(n.proteins_100g) || 0, carbs: num(n.carbohydrates_100g) || 0, fat: num(n.fat_100g) || 0 },
      servingG: num(p.serving_quantity) > 0 ? num(p.serving_quantity) : null,
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
  $('#foodSearchForm').addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('#foodQuery').value.trim();
    if (q.length < 2) return;
    const out = $('#searchResults'), status = $('#searchStatus');
    out.innerHTML = ''; status.textContent = 'Searching…';
    if (!navigator.onLine) { status.textContent = 'You’re offline. Use Recent or enter the food manually.'; return; }
    try {
      const json = await fetchJSON(`${OFF_SEARCH}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=${OFF_FIELDS}`, 15000);
      const products = (json.products || []).map(fromOFF).filter(p => p.per);
      status.textContent = products.length ? `${products.length} results from Open Food Facts` : 'No matches with nutrition info. Try fewer words, or enter it manually.';
      out.innerHTML = products.map((p, i) => resultRow(p, i)).join('');
      out.onclick = ev => { const b = ev.target.closest('[data-i]'); if (b) showPortion(products[+b.dataset.i]); };
    } catch {
      status.textContent = 'Search didn’t respond. Try again in a moment, or enter the food manually.';
    }
  });
  function resultRow(p, i) {
    return `<button type="button" class="foodResult" data-i="${i}"><span><b>${esc(p.name)}</b><small>${esc([p.brand, p.unit === 'g' ? `${fmt(p.per.kcal)} kcal per 100 g` : `${fmt(p.per.kcal)} kcal per portion`].filter(Boolean).join(', '))}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>`;
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
    if (!name || kcal == null) return;
    const per = { kcal, protein: num($('#mProtein').value) || 0, carbs: num($('#mCarbs').value) || 0, fat: num($('#mFat').value) || 0 };
    addEntry({ code: '', name, brand: '', unit: 'portion', per, servingG: null }, 1, sheet.meal);
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
    $('#pSource').textContent = product.code ? `Nutrition from Open Food Facts${product.servingLabel ? `. Serving on pack: ${product.servingLabel}` : ''}.` : '';
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
  window.NextFormFood = { validBarcode, suggestedTargets }; // handy for checks
  renderFood();
})();
