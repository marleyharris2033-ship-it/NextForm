// NextForm meal suggestions: find meals whose portions best fill what's left of today's calories and macros.
// Pure functions (no DOM) so it can be tested on its own.
//
// How it works: each idea is a set of foods with allowed portion ranges (e.g. chicken 80–300 g in 10 g
// steps). Portions are adjusted one step at a time to minimise how far the totals are from what's left,
// with protein weighted most and going over (especially on fat or calories) penalised more than falling
// short. The best few ideas are returned.
(() => {
  // [title, [[food name, min g, max g, step g], ...]] — food names match COMMON_FOODS.
  const TEMPLATES = [
    ['Chicken, rice and broccoli', [['Chicken breast, cooked', 80, 320, 10], ['White rice, cooked', 0, 400, 10], ['Broccoli, boiled', 0, 160, 40]]],
    ['Salmon, potatoes and peas', [['Salmon fillet, cooked', 60, 240, 20], ['Potatoes, boiled', 0, 400, 25], ['Peas, boiled', 0, 160, 40]]],
    ['Cod, potatoes and peas', [['Cod, cooked', 80, 320, 20], ['Potatoes, boiled', 0, 400, 25], ['Peas, boiled', 0, 160, 40]]],
    ['Steak, jacket potato and salad', [['Sirloin steak, cooked', 80, 300, 10], ['Jacket potato', 0, 400, 20], ['Salad leaves', 0, 80, 40]]],
    ['Tuna pasta with sweetcorn', [['Tuna in spring water, drained', 56, 224, 56], ['Pasta, cooked', 0, 400, 10], ['Sweetcorn', 0, 120, 40]]],
    ['Turkey wraps', [['Turkey breast, cooked', 50, 250, 10], ['Tortilla wrap', 62, 186, 62], ['Salad leaves', 0, 80, 40]]],
    ['Prawn and pea rice', [['Prawns, cooked', 60, 300, 20], ['White rice, cooked', 0, 400, 10], ['Peas, boiled', 0, 160, 40]]],
    ['Lean beef pasta', [['Beef mince, 5% fat, raw', 75, 250, 25], ['Pasta, cooked', 0, 400, 10], ['Tomatoes', 0, 170, 85]]],
    ['Chickpea and spinach rice bowl', [['Chickpeas, cooked', 60, 300, 20], ['Brown rice, cooked', 0, 300, 10], ['Spinach, raw', 0, 90, 30]]],
    ['Greek yogurt, oats and berries', [['Greek yogurt, 0% fat', 100, 500, 50], ['Porridge oats', 0, 100, 10], ['Blueberries', 0, 160, 20]]],
    ['Eggs on wholemeal toast', [['Egg, whole', 50, 250, 50], ['Egg white', 0, 132, 33], ['Wholemeal bread', 40, 160, 40]]],
    ['Protein shake and banana', [['Whey protein powder', 30, 60, 30], ['Milk, skimmed', 0, 400, 50], ['Banana', 0, 236, 118]]],
    ['Cottage cheese, rice cakes and fruit', [['Cottage cheese', 100, 400, 50], ['Rice cakes', 0, 54, 9], ['Apple', 0, 182, 91]]],
    ['Chicken wraps', [['Chicken breast, cooked', 60, 240, 10], ['Tortilla wrap', 62, 186, 62], ['Salad leaves', 0, 80, 40]]],
    ['Tofu and rice bowl', [['Tofu, firm', 100, 400, 50], ['White rice, cooked', 0, 400, 10], ['Broccoli, boiled', 0, 160, 40]]]
  ];
  const KEYS = ['kcal', 'protein', 'carbs', 'fat'];
  const SCALE = { kcal: 120, protein: 12, carbs: 25, fat: 8 };
  const WEIGHT = { kcal: 1, protein: 1.6, carbs: 0.6, fat: 0.8 };
  const OVER = { kcal: 9, protein: 0.6, carbs: 1.4, fat: 2.5 }; // extra protein is fine; extra fat/kcal isn't

  const totalsOf = items => items.reduce((t, it) => { const f = it.grams / 100; for (const k of KEYS) t[k] += (it.food.per[k] || 0) * f * (it.mult || 1); return t; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  function loss(t, want) {
    let s = 0;
    for (const k of KEYS) {
      const d = (t[k] - want[k]) / SCALE[k];
      s += WEIGHT[k] * d * d * (d > 0 ? OVER[k] : 1);
    }
    return s;
  }
  // Coordinate descent over portion steps, from a couple of starting points.
  function fit(parts, want) {
    let best = null;
    for (const start of [0, 0.5]) {
      const g = parts.map(p => snap(p.min + (p.max - p.min) * start, p));
      const score = () => loss(totalsOf(parts.map((p, i) => ({ food: p.food, grams: g[i] }))), want);
      let cur = score();
      for (let pass = 0; pass < 80; pass++) {
        let improved = false;
        for (let i = 0; i < parts.length; i++) for (const dir of [1, -1]) {
          const next = g[i] + dir * parts[i].step;
          if (next < parts[i].min - 1e-9 || next > parts[i].max + 1e-9) continue;
          const old = g[i]; g[i] = next; const s = score();
          if (s < cur - 1e-9) { cur = s; improved = true; } else g[i] = old;
        }
        if (!improved) break;
      }
      if (!best || cur < best.loss) best = { loss: cur, grams: [...g] };
    }
    return best;
  }
  const snap = (v, p) => Math.min(p.max, Math.max(p.min, p.min + Math.round((v - p.min) / p.step) * p.step));

  // remaining: { kcal, protein, carbs, fat } left today (can be negative). foods: COMMON_FOODS.
  // savedMeals: [{ name, items: [{ name, grams, unit, per, kcal, protein, carbs, fat }] }].
  // Returns up to `count` ideas: { title, source, items: [{ food, grams, mult }], totals, after, loss, protein% }.
  function suggest(remaining, { foods = [], savedMeals = [], count = 3, skip = 0 } = {}) {
    const want = Object.fromEntries(KEYS.map(k => [k, Math.max(0, +remaining[k] || 0)]));
    if (want.kcal < 120) return [];
    const byName = new Map(foods.map(f => [f.name, f]));
    const ideas = [];
    for (const [title, spec] of TEMPLATES) {
      const parts = spec.map(([name, min, max, step]) => ({ food: byName.get(name), min, max, step })).filter(p => p.food);
      if (parts.length !== spec.length) continue;
      const r = fit(parts, want);
      const items = parts.map((p, i) => ({ food: p.food, grams: r.grams[i] })).filter(it => it.grams > 0);
      ideas.push({ title, source: 'idea', items, loss: r.loss });
    }
    // Your saved meals, scaled from half to double.
    for (const m of savedMeals) {
      const base = (m.items || []).filter(it => it.per);
      if (!base.length) continue;
      const parts = [{ food: { per: Object.fromEntries(KEYS.map(k => [k, base.reduce((a, it) => a + (it.kcal != null ? (+it[k] || 0) : 0), 0)])) }, min: 50, max: 200, step: 25 }];
      const r = fit(parts, want), mult = r.grams[0] / 100;
      ideas.push({ title: m.name, source: 'saved', meal: m, mult, items: base.map(it => ({ food: { name: it.name, per: it.per, unit: it.unit, brand: it.brand || '', code: it.code || '', servingG: it.servingG || null, servingLabel: it.servingLabel || '' }, grams: Math.round((it.grams || 1) * mult * 10) / 10, savedItem: it })), loss: r.loss });
    }
    for (const idea of ideas) {
      idea.totals = idea.source === 'saved'
        ? Object.fromEntries(KEYS.map(k => [k, idea.meal.items.reduce((a, it) => a + (+it[k] || 0), 0) * idea.mult]))
        : totalsOf(idea.items);
      idea.after = Object.fromEntries(KEYS.map(k => [k, (+remaining[k] || 0) - idea.totals[k]]));
      idea.proteinCover = want.protein ? Math.min(100, Math.round(idea.totals.protein / want.protein * 100)) : 100;
    }
    ideas.sort((a, b) => a.loss - b.loss);
    return ideas.slice(skip, skip + count);
  }

  // Products (e.g. ready meals from Open Food Facts) as single-item ideas, portion fitted from half a pack
  // to two packs. products: [{ name, brand, code, per (per 100 g), packG, servingG }].
  function rankProducts(remaining, products, count = 3) {
    const want = Object.fromEntries(KEYS.map(k => [k, Math.max(0, +remaining[k] || 0)]));
    if (want.kcal < 120) return [];
    const out = [];
    for (const p of products) {
      if (!p?.per || !(p.per.kcal > 0)) continue;
      const unit = p.packG >= 150 && p.packG <= 900 ? p.packG : p.servingG >= 100 && p.servingG <= 900 ? p.servingG : 0;
      if (!unit) continue;
      const two = p.per.kcal * unit * 2 / 100 <= want.kcal * 1.03; // a second pack only if it still fits
      const parts = [{ food: p, min: unit, max: two ? unit * 2 : unit, step: unit }]; // whole packs
      const r = fit(parts, want), grams = r.grams[0];
      const totals = totalsOf([{ food: p, grams }]);
      out.push({ title: p.name, source: 'off', items: [{ food: p, grams }], packs: grams / unit, unit, loss: r.loss, totals,
        after: Object.fromEntries(KEYS.map(k => [k, (+remaining[k] || 0) - totals[k]])),
        proteinCover: want.protein ? Math.min(100, Math.round(totals.protein / want.protein * 100)) : 100 });
    }
    out.sort((a, b) => a.loss - b.loss);
    const seen = new Set();
    return out.filter(o => { const k = o.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, count);
  }

  const api = { suggest, rankProducts, TEMPLATES };
  if (typeof window !== 'undefined') window.MealSuggest = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
