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
  // Fibre, sugar and salt: only some foods have them, so also count how many entries do.
  const EXTRAS = [{ key: 'fibre', label: 'Fibre', target: 30, kind: 'aim' }, { key: 'sugar', label: 'Sugar', target: 90, kind: 'limit' }, { key: 'salt', label: 'Salt', target: 6, kind: 'limit' }];
  function extraTotals(list) {
    const out = { known: 0, of: list.length };
    for (const x of EXTRAS) out[x.key] = 0;
    for (const e of list) { if (e.fibre == null && e.sugar == null && e.salt == null) continue; out.known++; for (const x of EXTRAS) out[x.key] += +e[x.key] || 0; }
    return out;
  }
  function validBarcode(code) {
    if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
    const digits = code.split('').map(Number), check = digits.pop();
    const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === check;
  }

  // ---------- targets ----------
  function formulaBurn() {
    const p = data.profile || {};
    const w = weight() || 75, h = +p.height || 175, a = +p.age || 30;
    const sexAdj = p.sex === 'female' ? -161 : p.sex === 'male' ? 5 : -78;
    return (10 * w + 6.25 * h - 5 * a + sexAdj) * 1.55;
  }
  function suggestedTargets() {
    const p = data.profile || {};
    const w = weight() || 75, h = +p.height || 175, a = +p.age || 30;
    const sexAdj = p.sex === 'female' ? -161 : p.sex === 'male' ? 5 : -78;
    const maintain = formulaBurn(); // moderately active
    const goal = +p.goalWeight || null;
    const adjust = goal && goal < w - 1 ? -400 : goal && goal > w + 1 ? 250 : 0;
    const kcal = Math.round((maintain + adjust) / 10) * 10;
    const protein = Math.round(1.8 * w), fat = Math.round(0.8 * w);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat, adjust, goal };
  }
  function targets() {
    const n = data.nutrition || {};
    if (n.custom) return { kcal: +n.kcal || 0, protein: +n.protein || 0, carbs: +n.carbs || 0, fat: +n.fat || 0 };
    if (n.adaptive?.burn) return { ...window.Adaptive.targetsFrom(n.adaptive.burn, weight(), +data.profile?.goalWeight || null), goal: +data.profile?.goalWeight || null, adaptive: true };
    return suggestedTargets();
  }
  // ---------- adaptive targets: weekly check-in ----------
  const WEEK = 7 * 864e5;
  const adaptiveEstimate = () => window.Adaptive.estimate({ foodLog: data.foodLog || [], weights: data.weights || [], today: today(), formulaBurn: formulaBurn() });
  function renderCheckin() {
    const box = $('#checkinCard'); if (!box) return;
    const n = data.nutrition || {}, est = adaptiveEstimate(), now = Date.now();
    const due = est.ready && !n.adaptive?.burn && !(n.checkinSnooze > now) && foodDay === today();
    if (!due) { box.classList.add('hidden'); return; }
    const goal = +data.profile?.goalWeight || null, next = window.Adaptive.targetsFrom(est.burn, weight(), goal), cur = targets();
    const trend = Math.abs(est.kgPerWeek) < 0.1 ? 'your weight held steady' : `your weight went ${est.kgPerWeek < 0 ? 'down' : 'up'} about ${Math.abs(est.kgPerWeek).toFixed(1)} kg a week`;
    const diff = next.kcal - cur.kcal;
    box.classList.remove('hidden');
    box.innerHTML = `<div class="sectionHead"><div class="secTitle"><span class="secIcon" style="--c:var(--glacier)"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/><path d="M12 8v4l3 2"/></svg></span><h2>Weekly check-in</h2></div></div>
      <p>Over the last 3 weeks you averaged <b>${fmt(est.avgIntake)} kcal</b> a day and ${trend}. So your body burns about <b>${fmt(est.burn)} kcal</b> a day.</p>
      <div class="checkinRow"><div><span>Now</span><b>${fmt(cur.kcal)}</b><small>kcal a day</small></div><span class="checkinArrow" aria-hidden="true">→</span><div class="new"><span>Suggested</span><b>${fmt(next.kcal)}</b><small>${next.adjust < 0 ? `with a gentle deficit towards ${goal} kg` : next.adjust > 0 ? `with a small surplus towards ${goal} kg` : 'to maintain'}</small></div></div>
      <p class="muted small">${Math.abs(diff) < 50 ? 'Your current target is already about right.' : diff > 0 && next.adjust < 0 ? `Good news: that's ${fmt(diff)} kcal more than now, and you'd still be heading towards your goal.` : `That's ${fmt(Math.abs(diff))} kcal ${diff > 0 ? 'more' : 'less'} than now.`} Protein ${next.protein} g, carbs ${next.carbs} g, fat ${next.fat} g. Updates each week as you log.</p>
      <div class="row wrap"><button type="button" class="primary" id="checkinApply">Use ${fmt(next.kcal)} kcal</button><button type="button" class="secondary" id="checkinLater">Not now</button></div>`;
    $('#checkinApply').onclick = () => { data.nutrition = { custom: false, adaptive: { burn: est.burn, at: Date.now() } }; save(); toastFood(`Target updated to ${fmt(next.kcal)} kcal. Nice work keeping your log going.`); };
    $('#checkinLater').onclick = () => { data.nutrition = { ...(data.nutrition || {}), checkinSnooze: Date.now() + 3 * 864e5 }; save(); };
  }
  // Adaptive targets refresh themselves weekly once switched on (the check-in card only asks the first time).
  function refreshAdaptive() {
    const n = data.nutrition || {};
    if (!n.adaptive?.burn || Date.now() - n.adaptive.at < WEEK) return;
    const est = adaptiveEstimate();
    if (est.ready) { n.adaptive = { burn: est.burn, at: Date.now(), prev: n.adaptive.burn }; data.nutrition = n; save(); }
  }

  // Kinder over-target: calm colour, no warnings, and the bigger picture (this week's average).
  function weekAverage() {
    const days = [];
    for (let i = 0; i < 7; i++) { const d = shiftDay(today(), -i), k = totals(entriesFor(d)).kcal; if (k >= 800 || (i === 0 && k > 0)) days.push(k); }
    return days.length >= 3 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
  }
  function renderKind(t, sum, list, left) {
    const el = $('#kindNote'); if (!el) return;
    const enc = window.Encourage?.on(), parts = [];
    if (left < 0) {
      const avg = weekAverage();
      parts.push(avg && avg <= t.kcal * 1.05 ? `Your 7-day average is ${fmt(avg)} kcal, right where you want it.` : 'One day doesn’t undo your progress.');
      if (enc) parts.push(Encourage.line('foodOver', foodDay));
    } else if (enc && foodDay === today() && list.length) {
      parts.push(Math.abs(left) <= t.kcal * 0.05 && sum.protein >= t.protein * 0.9 ? Encourage.line('foodDone', foodDay) : Encourage.line('food', foodDay));
    }
    const txt = [...new Set(parts)].join(' ');
    el.textContent = txt; el.classList.toggle('hidden', !txt);
  }

  function renderExtras(list) {
    const box = $('#extraNutrients'); if (!box) return;
    const x = extraTotals(list);
    if (!x.known) { box.innerHTML = list.length ? '<p class="muted small">Fibre, sugar and salt show here for foods that include them.</p>' : ''; return; }
    box.innerHTML = `<div class="extraRow">${EXTRAS.map(n => { const v = x[n.key], pct = Math.min(100, v / n.target * 100);
      return `<div class="extra ${n.kind}"><span>${n.label}</span><b>${g1(v)}<small> g</small></b><div class="tinybar"><i style="width:${pct}%"></i></div><small>${n.kind === 'aim' ? `aim ${n.target} g` : `guide ${n.target} g`}</small></div>`; }).join('')}</div>
      ${x.known < x.of ? `<p class="muted tiny">From ${x.known} of ${x.of} foods. The others don’t list these.</p>` : ''}`;
  }

  // ---------- rendering ----------
  function renderFood() {
    refreshAdaptive();
    const t = targets();
    const list = entriesFor(foodDay), sum = totals(list);
    const left = Math.round(t.kcal - sum.kcal);

    $('#foodDayLabel').textContent = dayLabel(foodDay);
    $('#foodNext').disabled = foodDay >= today();
    $('#kcalRing').innerHTML = ringsSvg([{ value: t.kcal ? sum.kcal / t.kcal : 0, color: left < 0 ? 'var(--glacier)' : 'var(--pine)' }]);
    $('#kcalLeft').textContent = fmt(Math.abs(left));
    $('#kcalLeftLabel').textContent = left < 0 ? 'above target' : 'kcal left';
    renderKind(t, sum, list, left);
    $('#kcalEaten').textContent = fmt(sum.kcal);
    $('#kcalTarget').textContent = fmt(t.kcal);
    $('#macroBars').innerHTML = MACROS.map(m => macroRow(m, sum[m.key], t[m.key])).join('');
    renderExtras(list);
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

    const custom = data.nutrition?.custom, ad = data.nutrition?.adaptive;
    if (!custom && ad?.burn) {
      $('#targetNote').textContent = `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. Adaptive: from your own logging, your body burns about ${fmt(ad.burn)} kcal a day${t.adjust < 0 ? `, with a gentle deficit towards ${t.goal} kg` : t.adjust > 0 ? `, with a small surplus towards ${t.goal} kg` : ''}. It updates every week${ad.prev ? ` (last week ${fmt(ad.prev)})` : ''}.`;
      renderCheckin(); renderHomeFuel(); return;
    }
    const est = adaptiveEstimate();
    const progressLine = est.ready ? '' : ` Adaptive targets unlock as you log: ${Math.min(est.loggedDays, est.needDays)} of ${est.needDays} full days of food and ${Math.min(est.weighIns, est.needWeighIns)} of ${est.needWeighIns} weigh-ins so far.`;
    $('#targetNote').textContent = custom
      ? `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. These are your own targets.`
      : `${fmt(t.kcal)} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat. Suggested from your profile${t.adjust < 0 ? ` with a gentle deficit towards ${t.goal} kg` : t.adjust > 0 ? ` with a small surplus towards ${t.goal} kg` : ''}. These are estimates, so adjust them to suit you.`;
    $('#targetNote').textContent += progressLine;
    renderCheckin();

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
    $('#fuelLeft').textContent = sum.kcal ? (left >= 0 ? `${fmt(left)} kcal left` : `${fmt(-left)} kcal above target`) : 'Nothing logged yet';
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
    if (tab !== 'portion' && tab !== 'label') sheet.prevTab = tab;
    sheet.tab = tab;
    $$('#foodSheet [data-pane]').forEach(p => p.hidden = p.dataset.pane !== tab);
    $$('#foodSheet [data-tab]').forEach(b => { const on = b.dataset.tab === tab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    $('#foodSheet .sheetTabs').hidden = tab === 'portion' || tab === 'label';
    $('#sheetBack').hidden = !(tab === 'portion' || tab === 'label') || !!sheet.editing;
    $('#sheetTitle').textContent = tab === 'portion' ? (sheet.editing ? 'Edit food' : 'Add food') : tab === 'label' ? 'Check the label' : `Add to ${sheet.meal.toLowerCase()}`;
    if (tab !== 'scan') $('#scanLabelBtn')?.classList.add('hidden');
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
      per: kcal == null ? null : { kcal, protein: num(n.proteins_100g) || 0, carbs: num(n.carbohydrates_100g) || 0, fat: num(n.fat_100g) || 0,
        ...(num(n.fiber_100g) != null ? { fibre: num(n.fiber_100g) } : {}), ...(num(n.sugars_100g) != null ? { sugar: num(n.sugars_100g) } : {}),
        ...(num(n.salt_100g) != null ? { salt: num(n.salt_100g) } : num(n.sodium_100g) != null ? { salt: num(n.sodium_100g) * 2.5 } : {}) },
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
    const logged = [...(data.foodLog || [])].reverse().find(e => e.code === code && e.per);
    if (logged && logged.labelPhoto) return { code, name: logged.name, brand: logged.brand || '', unit: logged.unit || 'g', per: logged.per, servingG: logged.servingG || null, servingLabel: logged.servingLabel || '', image: '', fromLabel: true };
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
  // Open Food Facts is a free, volunteer-run service and its search goes down or slows down fairly often.
  // So: ask both search services at once and use whichever answers first, keep every successful search on
  // the device for 30 days, show saved results straight away, and quietly retry in the background.
  const SEARCH_CACHE = 'nextform-searches', SEARCH_TTL = 30 * 864e5;
  const searchCache = () => { try { return JSON.parse(localStorage.getItem(SEARCH_CACHE) || '{}'); } catch { return {}; } };
  const cacheKey = q => words(q).join(' ');
  function cachedSearch(q) { const c = searchCache()[cacheKey(q)]; return c && Date.now() - c.at < SEARCH_TTL ? c : null; }
  function saveSearch(q, list) {
    try {
      const c = searchCache(); c[cacheKey(q)] = { at: Date.now(), list: list.slice(0, 24).map(({ image, ...p }) => p) };
      Object.keys(c).sort((a, b) => c[b].at - c[a].at).slice(80).forEach(k => delete c[k]); // newest 80 searches
      localStorage.setItem(SEARCH_CACHE, JSON.stringify(c));
    } catch {}
  }
  // Products seen before in any search or scan, so a brand you've looked up once is found even when OFF is down.
  function seenProducts(ws) {
    const out = new Map();
    for (const p of Object.values(productCache())) if (p?.per && matches(`${p.name} ${p.brand}`.toLowerCase(), ws)) out.set(p.code || p.name, p);
    for (const c of Object.values(searchCache())) for (const p of c.list || []) if (p?.per && matches(`${p.name} ${p.brand}`.toLowerCase(), ws)) out.set(p.code || p.name, p);
    return [...out.values()].slice(0, 12);
  }
  async function searchNew(q, ms) {
    const json = await fetchJSON(`${OFF_SEARCH_NEW}?q=${encodeURIComponent(q)}&langs=en&page_size=24&fields=${OFF_FIELDS}`, ms);
    if (!Array.isArray(json?.hits)) throw new Error('bad response');
    const list = json.hits.map(fromOFF), missing = list.filter(p => !p.per && p.code).slice(0, 8);
    await Promise.all(missing.map(async p => { try { const full = await findBarcode(p.code); if (full?.per) Object.assign(p, full); } catch {} }));
    return list.filter(p => p.per);
  }
  async function searchOld(q, ms) {
    const json = await fetchJSON(`${OFF_SEARCH}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=${OFF_FIELDS}`, ms);
    if (!Array.isArray(json?.products)) throw new Error('bad response');
    return json.products.map(fromOFF).filter(p => p.per);
  }
  // First service with results wins; the other gets a moment longer so both sets can be combined.
  function searchOFF(q, ms = 15000) {
    return new Promise((resolve, reject) => {
      let pending = 2, empty = false, got = [], timer = null, finished = false;
      const finish = () => { if (finished) return; finished = true; clearTimeout(timer);
        const seen = new Set(); resolve(got.filter(p => { const k = p.code || `${p.name}|${p.brand}`; if (seen.has(k)) return false; seen.add(k); return true; })); };
      const settle = () => { if (!--pending) got.length || empty ? finish() : (finished = true, reject(new Error('unavailable'))); };
      const done = list => { if (list.length) { got = got.concat(list); if (!timer && pending > 1) timer = setTimeout(finish, 1200); } else empty = true; settle(); };
      searchNew(q, ms).then(done, settle);
      searchOld(q, ms).then(done, settle);
    });
  }
  let searchSeq = 0;
  $('#foodSearchForm').addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('#foodQuery').value.trim();
    if (q.length < 2) return;
    const out = $('#searchResults'), status = $('#searchStatus'), seq = ++searchSeq;
    const { common, recent } = localMatches(q), ws = words(q);
    const cached = cachedSearch(q);
    const seen = seenProducts(ws).filter(p => !recent.some(r => (r.code && r.code === p.code) || r.name === p.name));
    let online = cached?.list || [], fromCache = !!cached;
    const draw = (note) => {
      const keys = new Set([...recent].map(p => p.code || p.name));
      const onl = online.filter(p => !keys.has(p.code || p.name));
      const extra = seen.filter(p => !onl.some(o => (o.code || o.name) === (p.code || p.name)));
      const groups = [['Your recent foods', recent], ['Everyday foods', common], [fromCache ? 'Open Food Facts (saved from an earlier search)' : 'From Open Food Facts', onl], ['Seen before', online.length ? [] : extra]].filter(g => g[1].length);
      const all = groups.flatMap(g => g[1]);
      let i = 0;
      out.innerHTML = groups.map(([title, list]) => `<p class="resultHead">${title}</p>` + list.map(p => resultRow(p, i++)).join('')).join('');
      out.onclick = ev => { const b = ev.target.closest('[data-i]'); if (b) { const p = all[+b.dataset.i]; if (p.code && !p.lastAmount) rememberProduct(p); showPortion(p, p.lastAmount ? { grams: p.lastAmount } : {}); } };
      status.textContent = note;
    };
    const anyLocal = () => common.length || recent.length || seen.length || online.length;
    draw(anyLocal() ? 'Checking Open Food Facts for more…' : 'Searching Open Food Facts…');
    if (!navigator.onLine) return draw(anyLocal() ? 'You’re offline, so these are foods saved on your phone.' : 'You’re offline. Try Recent, Scan or Quick add.');
    // Tell people it's still going rather than leaving them wondering.
    const slow = setTimeout(() => { if (seq === searchSeq && !online.length) status.textContent = 'Open Food Facts is slow right now. Still trying…'; }, 5000);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const list = await searchOFF(q, attempt ? 20000 : 15000);
        if (seq !== searchSeq) return;
        clearTimeout(slow);
        if (list.length) { online = list; fromCache = false; saveSearch(q, list); }
        return draw(online.length ? '' : anyLocal() ? 'No branded matches on Open Food Facts. Try different words, or pick one above.' : 'No matches with nutrition info. Try fewer words, scan the barcode, or use Quick add.');
      } catch {
        if (seq !== searchSeq) return;
        if (!attempt) { status.textContent = 'Open Food Facts didn’t answer. Trying once more…'; await sleep(1500); if (seq !== searchSeq) return; }
      }
    }
    clearTimeout(slow);
    draw(online.length ? 'Open Food Facts is down right now, so these are results saved from an earlier search.'
      : anyLocal() ? 'Open Food Facts is down right now, so only foods saved on your phone are shown. Scanning the barcode often still works.'
      : 'Open Food Facts is down right now (it’s a free service and has outages). Scanning the barcode often still works, or take a photo of the label (Photo tab).');
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
    $('#pGrams').step = isG ? 'any' : '0.5';
    $('#pGrams').value = String(Math.round((grams || (isG ? (product.servingG || 100) : 1)) * 10) / 10);
    const quick = isG
      ? [product.servingG && { g: product.servingG, label: `1 serving (${g1(product.servingG)} g)` }, product.servingG && { g: product.servingG * 2, label: '2 servings' }, { g: 100, label: '100 g' }].filter(Boolean)
      : [{ g: 0.5, label: 'Half' }, { g: 1, label: '1 portion' }, { g: 2, label: '2 portions' }];
    $('#pQuick').innerHTML = quick.map(q => `<button type="button" class="chip" data-g="${q.g}">${esc(q.label)}</button>`).join('');
    $('#pSource').textContent = product.fromLabel ? 'From your photo of the label.' : product.code ? `Nutrition from Open Food Facts${product.servingLabel ? `. Serving on pack: ${product.servingLabel}` : ''}.` : product.brand === 'Common food' ? 'Typical values for this food. Check the pack for a specific brand.' : '';
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
    const f = product.unit === 'portion' ? amount : amount / 100, p = product.per, out = { kcal: p.kcal * f, protein: p.protein * f, carbs: p.carbs * f, fat: p.fat * f };
    for (const k of ['fibre', 'sugar', 'salt']) if (p[k] != null) out[k] = p[k] * f;
    return out;
  }
  function updatePortionTotals() {
    const amt = Math.max(0, num($('#pGrams').value) || 0), v = scaled(sheet.product, amt);
    $('#pTotals').innerHTML = [['Calories', `${fmt(v.kcal)}`, 'kcal'], ['Protein', g1(v.protein), 'g'], ['Carbs', g1(v.carbs), 'g'], ['Fat', g1(v.fat), 'g']]
      .map(([l, n, u]) => `<div><span>${l}</span><b>${n}<small> ${u}</small></b></div>`).join('')
      + (v.fibre != null || v.sugar != null || v.salt != null ? `<p class="pExtras">${[['Fibre', v.fibre], ['Sugar', v.sugar], ['Salt', v.salt]].filter(([, n]) => n != null).map(([l, n]) => `${l} ${g1(n)} g`).join(' · ')}</p>` : '');
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
  const roundVals = v => ({ kcal: Math.round(v.kcal), protein: Math.round(v.protein * 10) / 10, carbs: Math.round(v.carbs * 10) / 10, fat: Math.round(v.fat * 10) / 10,
    ...Object.fromEntries(['fibre', 'sugar', 'salt'].map(k => [k, v[k] != null ? Math.round(v[k] * 100) / 100 : undefined])) });
  function addEntry(product, amount, meal) {
    data.foodLog = data.foodLog || [];
    data.foodLog.push({
      id: newId(), date: foodDay, meal, name: product.name, brand: product.brand || '', code: product.code || '',
      unit: product.unit === 'portion' ? 'portion' : 'g', grams: amount,
      per: product.per, servingG: product.servingG || null, servingLabel: product.servingLabel || '',
      ...(product.fromLabel ? { labelPhoto: true } : {}),
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

  // ---------- photos: front of pack (find it) and nutrition label (read it) ----------
  const photoStatus = t => { $('#photoStatus').textContent = t; };
  function photoProgress(p) {
    const bar = $('#photoProgress'); bar.classList.toggle('hidden', p == null);
    if (p == null) return;
    bar.classList.toggle('busy', p < 0); bar.firstElementChild.style.width = p < 0 ? '35%' : `${Math.round(p * 100)}%`;
  }
  const READ_FAIL = 'Couldn’t read that photo. Try again closer up, flat and without glare, or type it in.';
  async function onFront(file) {
    photoStatus('Reading the pack… (the first time takes a little longer)'); photoProgress(-1);
    try {
      const { query } = await window.LabelReader.readFront(file, photoProgress);
      photoProgress(null);
      if (!query) return photoStatus('Couldn’t make out a name. Try a closer photo of the brand and product name, or use Search.');
      setTab('search'); $('#foodQuery').value = query; photoStatus('');
      $('#foodSearchForm').requestSubmit();
      setTimeout(() => { const st = $('#searchStatus'); if (st && !st.textContent) st.textContent = `Read “${query}” from your photo. Edit the words if it’s not right.`; }, 50);
    } catch (e) { photoProgress(null); photoStatus(/download/.test(e?.message) ? 'The photo reader needs internet the first time. Try again when you’re online.' : READ_FAIL); }
  }
  const LFIELDS = [['kcal', '#lKcal'], ['protein', '#lProtein'], ['carbs', '#lCarbs'], ['fat', '#lFat'], ['fibre', '#lFibre'], ['sugar', '#lSugar'], ['salt', '#lSalt']];
  async function onLabel(file) {
    setTab('photo'); photoStatus('Reading the label… (the first time takes a little longer)'); photoProgress(-1);
    try {
      const r = await window.LabelReader.readLabel(file, photoProgress);
      photoProgress(null); photoStatus('');
      if (!r.ok && !Object.keys(r.per).length) return photoStatus(READ_FAIL);
      $('#labelPreview').src = r.preview;
      $('#lName').value = sheet.labelName || r.name || '';
      for (const [k, sel] of LFIELDS) { const el = $(sel); el.value = r.per[k] ?? ''; el.classList.toggle('unsure', r.per[k] == null || r.sure[k] === false); }
      $('#lServing').value = r.servingG || '';
      const unsure = LFIELDS.filter(([k]) => r.per[k] == null || r.sure[k] === false).length;
      $('#labelNote').textContent = unsure ? `Read it. Check the ${unsure === 1 ? 'highlighted number' : `${unsure} highlighted numbers`} against your photo.` : 'Read it. All the numbers agree with each other, but give them a quick check.';
      checkLabel(); setTab('label');
      if (!$('#lName').value) setTimeout(() => $('#lName').focus(), 60);
    } catch (e) { photoProgress(null); photoStatus(/download/.test(e?.message) ? 'The photo reader needs internet the first time. Try again when you’re online.' : READ_FAIL); }
  }
  // Sense check: calories should roughly match 4 kcal/g carbs and protein, 9 kcal/g fat.
  function checkLabel() {
    const v = k => num($(LFIELDS.find(f => f[0] === k)[1]).value);
    const kcal = v('kcal'), c = v('carbs'), p = v('protein'), f = v('fat');
    const msg = $('#lCheck');
    if ([kcal, c, p, f].some(x => x == null)) { msg.textContent = 'Calories, protein, carbs and fat are needed.'; return false; }
    const est = 4 * c + 4 * p + 9 * f + 2 * (v('fibre') || 0);
    msg.textContent = est && Math.abs(est - kcal) > Math.max(25, est * 0.15) ? `Heads up: those macros add up to about ${fmt(est)} kcal, not ${fmt(kcal)}. Worth a second look.` : '';
    return true;
  }
  $('#foodSheet').addEventListener('input', e => { if (e.target.closest('[data-pane="label"]')) { e.target.classList.remove('unsure'); checkLabel(); } });
  $('#labelSave').addEventListener('click', () => {
    if (!checkLabel()) return;
    const per = {};
    for (const [k, sel] of LFIELDS) { const x = num($(sel).value); if (x != null) per[k] = x; }
    const servingG = num($('#lServing').value) || null;
    const product = { code: sheet.labelCode || '', name: $('#lName').value.trim() || 'Food from label photo', brand: '', unit: 'g', per,
      servingG, servingLabel: servingG ? `1 serving (${g1(servingG)} g)` : '', image: '', fromLabel: true };
    if (product.code) rememberProduct(product);
    sheet.labelCode = ''; sheet.labelName = '';
    showPortion(product, servingG ? { grams: servingG } : {});
  });
  $('#labelRetake').addEventListener('click', () => $('#photoLabel').click());
  $('#photoFront').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) onFront(f); });
  $('#photoLabel').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) onLabel(f); });
  $('#scanLabelBtn').addEventListener('click', () => { stopScan(); $('#photoLabel').click(); });
  // Opening the Photo tab directly means a fresh product (not tied to a barcode that missed).
  $$('#foodSheet [data-tab="photo"]').forEach(b => b.addEventListener('click', () => { sheet.labelCode = ''; sheet.labelName = ''; }));

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
      scanStatus(p ? `${p.name} has no nutrition info yet. Take a photo of the nutrition label and NextForm will read it.` : `Barcode ${code} isn’t in Open Food Facts yet. Take a photo of the nutrition label and NextForm will read it, and remember it for next time.`);
      if (p) $('#mName').value = p.name;
      sheet.labelCode = code; sheet.labelName = p?.name || '';
      $('#scanLabelBtn').classList.remove('hidden');
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
  // Real products for a template ingredient: products you've logged before first, then popular UK products
  // from Open Food Facts. Searches are remembered for a week (Open Food Facts limits how often apps search).
  const TERM_CACHE = 'nextform-offterms';
  const termCache = () => { try { return JSON.parse(localStorage.getItem(TERM_CACHE) || '{}'); } catch { return {}; } };
  async function productsForTerm(term, role) {
    const ws = words(term).filter(w => w.length > 2 && !['fat', 'free', 'range'].includes(w));
    const mine = recentProducts().filter(p => p.unit !== 'portion' && window.MealSuggest.roleFits(role, p.per) && ws.filter(w => `${p.name} ${p.brand}`.toLowerCase().includes(w)).length >= Math.max(1, Math.ceil(ws.length * 0.66)));
    const c = termCache()[term];
    let off = c && Date.now() - c.at < 7 * 864e5 ? c.list : null;
    if (!off && mine.length) off = []; // you've logged a matching product: no need to search
    if (!off) {
      off = [];
      for (const q of [`(${term}) AND countries:"en:united-kingdom"`, term]) {
        try {
          const json = await fetchJSON(`${OFF_SEARCH_NEW}?q=${encodeURIComponent(q)}&langs=en&page_size=20&sort_by=-unique_scans_n&fields=${OFF_FIELDS}`, 9000);
          off = (json?.hits || []).map(fromOFF).filter(p => p.per).slice(0, 12);
          if (off.length) break;
        } catch {}
      }
      if (off.length) try { const all = termCache(); all[term] = { at: Date.now(), list: off.map(({ image, ...rest }) => rest) }; localStorage.setItem(TERM_CACHE, JSON.stringify(all)); } catch {}
    }
    return [...mine, ...off.filter(p => window.MealSuggest.roleFits(role, p.per))];
  }
  async function makeReal(i) {
    const base = shown[i]; if (!base?.template) return;
    const card = $(`#suggestList .ideaCard[data-card="${i}"]`); card?.classList.add('loading');
    const btn = card?.querySelector('[data-real]'); if (btn) btn.textContent = 'Finding real products…';
    const parts = window.MealSuggest.templateParts(base.template);
    base.cands = base.cands || await Promise.all(parts.map(([, , , , term, role]) => productsForTerm(term, role)));
    base.pick = base.source === 'real' ? (base.pick || 0) + 1 : 0; // from everyday foods: start with the first products
    const picks = base.cands.map(list => list.length ? list[base.pick % list.length] : null);
    card?.classList.remove('loading');
    if (!picks.some(Boolean)) { if (btn) btn.textContent = 'Open Food Facts isn’t responding. Try again later'; return; }
    const real = window.MealSuggest.realVersion(base.template, picks, remainingToday(), window.COMMON_FOODS || []);
    shown[i] = Object.assign(real, { cands: base.cands, pick: base.pick, generic: base.generic || base });
    renderSuggestCards();
  }
  const packText = s => { const n = s.packs; return n === 1 ? '1 pack' : n === 0.5 ? '½ pack' : `${n === 1.5 ? '1½' : n} packs`; };
  function ideaCard(s, i, kind) {
    const r0 = v => Math.round(v);
    const brandOf = f => (f.brand && f.brand !== 'Common food' ? f.brand : '');
    return `<div class="ideaCard" data-card="${kind === 'i' ? i : ''}">
      <div class="ideaHead"><b>${esc(s.title)}</b>${s.source === 'saved' ? '<span class="ideaTag">Your saved meal</span>' : s.source === 'real' ? '<span class="ideaTag off">Real products</span>' : s.source === 'off' && s.items[0].food.brand ? `<span class="ideaTag off">${esc(s.items[0].food.brand)}</span>` : ''}</div>
      <ul class="ideaItems">${s.source === 'off' ? `<li><span>${packText(s)}</span><b>${g1(s.items[0].grams)} g</b></li>` : s.items.map(it => `<li><span>${esc(it.food.name)}${brandOf(it.food) ? `<small>${esc(brandOf(it.food))}</small>` : ''}</span><b>${it.food.unit === 'portion' ? `${g1(it.grams)} portion${it.grams === 1 ? '' : 's'}` : `${g1(it.grams)} g`}</b></li>`).join('')}</ul>
      <div class="ideaMacros"><span><b>${fmt(s.totals.kcal)}</b> kcal</span><span><b>${r0(s.totals.protein)}</b> g protein</span><span><b>${r0(s.totals.carbs)}</b> g carbs</span><span><b>${r0(s.totals.fat)}</b> g fat</span></div>
      <p class="ideaAfter">Covers ${s.proteinCover}% of your remaining protein. Afterwards: ${s.after.kcal >= 0 ? `${fmt(s.after.kcal)} kcal left` : `${fmt(-s.after.kcal)} kcal over`}.</p>
      <button type="button" class="primary full" data-add-idea="${kind}${i}">Add to ${suggestMeal.toLowerCase()}</button>
      ${kind === 'i' && s.template && navigator.onLine ? `<div class="ideaAlt"><button type="button" class="link" data-real="${i}">${s.source === 'real' ? 'Try different products' : 'Use real products'}</button>${s.source === 'real' ? `<button type="button" class="link muted" data-generic="${i}">Use everyday foods</button>` : ''}</div>` : ''}
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
    renderSuggestCards();
    return;
  }
  function renderSuggestCards() {
    const rem = remainingToday();
    $('#suggestList').innerHTML = shown.length ? shown.map((s, i) => ideaCard(s, i, 'i')).join('')
      : `<p class="muted">You’re within ${fmt(Math.max(0, rem.kcal))} kcal of your target, so there’s no need for a full meal. A piece of fruit or a yogurt would round off the day.</p>`;
    $('#suggestMore').classList.toggle('hidden', !shown.length || !!shown.find(s => s.source === 'real'));
    if (offShown.length && $('#suggestOff').dataset.meal !== suggestMeal) { $('#suggestOff').dataset.meal = suggestMeal; $('#suggestOff').innerHTML = `<p class="resultHead">Ready meals from Open Food Facts</p>` + offShown.map((s, i) => ideaCard(s, i, 'o')).join(''); }
  }
  $('#suggestMeal')?.addEventListener('click', openSuggest);
  $('#suggestClose').addEventListener('click', closeSuggest);
  $('#suggestMore').addEventListener('click', () => { suggestSkip += 3; renderSuggest(); $('#suggestSheet .sheetBody').scrollTop = 0; });
  $('#suggestMealChips').addEventListener('click', e => { const b = e.target.closest('[data-smeal]'); if (b) { suggestMeal = b.dataset.smeal; renderSuggest(); } });
  $('#suggestSheet').addEventListener('click', e => {
    const rb = e.target.closest('[data-real]'), gb = e.target.closest('[data-generic]');
    if (rb) return makeReal(+rb.dataset.real);
    if (gb) { const s = shown[+gb.dataset.generic]; if (s?.generic) { shown[+gb.dataset.generic] = s.generic; renderSuggestCards(); } return; }
    const b = e.target.closest('[data-add-idea]'); if (!b) return;
    const id = b.dataset.addIdea, s = (id[0] === 'o' ? offShown : shown)[+id.slice(1)]; if (!s) return;
    const now = Date.now();
    data.foodLog = data.foodLog || [];
    s.items.forEach((it, k) => {
      const f = it.food, isG = f.unit !== 'portion', mult = isG ? it.grams / 100 : it.grams;
      data.foodLog.push({ id: newId() + k, date: foodDay, meal: suggestMeal, name: f.name, brand: f.brand === 'Common food' ? '' : (f.brand || ''), code: f.code || '',
        unit: isG ? 'g' : 'portion', grams: it.grams, per: f.per, servingG: f.servingG || null, servingLabel: f.servingLabel || '', ...roundVals(scaled(f, it.grams)), updatedAt: now });
    });
    save(); closeSuggest(); toastFood(`Added ${s.title.toLowerCase()} to ${suggestMeal.toLowerCase()}.`);
  });

  window.NextFormFood = { validBarcode, suggestedTargets }; // handy for checks
  renderFood();
})();
