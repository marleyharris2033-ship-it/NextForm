// NextForm meal suggestions: find meals whose portions best fill what's left of today's calories and macros.
// Pure functions (no DOM) so it can be tested on its own.
//
// How it works: each idea is a set of foods with allowed portion ranges (e.g. chicken 80–300 g in 10 g
// steps). Portions are adjusted one step at a time to minimise how far the totals are from what's left,
// with protein weighted most and going over (especially on fat or calories) penalised more than falling
// short. The best few ideas are returned.
(() => {
  // [title, [[food name, min g, max g, step g, Open Food Facts search, role], ...]] — food names match COMMON_FOODS.
  const TEMPLATES = [
    ['Chicken, rice and broccoli', [['Chicken breast, cooked', 80, 320, 10, 'cooked chicken breast', 'protein'], ['White rice, cooked', 0, 400, 10, 'microwave rice', 'carb'], ['Broccoli, boiled', 0, 160, 40, 'broccoli', 'veg']]],
    ['Salmon, potatoes and peas', [['Salmon fillet, cooked', 60, 240, 20, 'salmon fillets', 'protein'], ['Potatoes, boiled', 0, 400, 25, 'baby potatoes', 'carb'], ['Peas, boiled', 0, 160, 40, 'garden peas', 'veg']]],
    ['Cod, potatoes and peas', [['Cod, cooked', 80, 320, 20, 'cod fillets', 'protein'], ['Potatoes, boiled', 0, 400, 25, 'baby potatoes', 'carb'], ['Peas, boiled', 0, 160, 40, 'garden peas', 'veg']]],
    ['Steak, jacket potato and salad', [['Sirloin steak, cooked', 80, 300, 10, 'sirloin steak', 'protein'], ['Jacket potato', 0, 400, 20, 'baking potatoes', 'carb'], ['Salad leaves', 0, 80, 40, 'salad leaves', 'veg']]],
    ['Tuna pasta with sweetcorn', [['Tuna in spring water, drained', 56, 224, 56, 'tuna chunks spring water', 'protein'], ['Pasta, cooked', 0, 400, 10, 'fusilli pasta', 'carb'], ['Sweetcorn', 0, 120, 40, 'sweetcorn', 'veg']]],
    ['Turkey wraps', [['Turkey breast, cooked', 50, 250, 10, 'turkey breast slices', 'protein'], ['Tortilla wrap', 62, 186, 62, 'tortilla wraps', 'bread'], ['Salad leaves', 0, 80, 40, 'salad leaves', 'veg']]],
    ['Prawn and pea rice', [['Prawns, cooked', 60, 300, 20, 'cooked king prawns', 'protein'], ['White rice, cooked', 0, 400, 10, 'microwave rice', 'carb'], ['Peas, boiled', 0, 160, 40, 'garden peas', 'veg']]],
    ['Lean beef pasta', [['Beef mince, 5% fat, raw', 75, 250, 25, '5% fat beef mince', 'protein'], ['Pasta, cooked', 0, 400, 10, 'fusilli pasta', 'carb'], ['Tomatoes', 0, 170, 85, 'cherry tomatoes', 'veg']]],
    ['Chickpea and spinach rice bowl', [['Chickpeas, cooked', 60, 300, 20, 'chickpeas', 'pulse'], ['Brown rice, cooked', 0, 300, 10, 'brown rice', 'carb'], ['Spinach, raw', 0, 90, 30, 'baby spinach', 'veg']]],
    ['Greek yogurt, oats and berries', [['Greek yogurt, 0% fat', 100, 500, 50, '0% fat greek yogurt', 'protein'], ['Porridge oats', 0, 100, 10, 'porridge oats', 'carb'], ['Blueberries', 0, 160, 20, 'blueberries', 'fruit']]],
    ['Eggs on wholemeal toast', [['Egg, whole', 50, 250, 50, 'free range eggs', 'egg'], ['Egg white', 0, 132, 33, 'liquid egg whites', 'protein'], ['Wholemeal bread', 40, 160, 40, 'wholemeal bread', 'bread']]],
    ['Protein shake and banana', [['Whey protein powder', 30, 60, 30, 'whey protein powder', 'powder'], ['Milk, skimmed', 0, 400, 50, 'skimmed milk', 'milk'], ['Banana', 0, 236, 118, 'bananas', 'fruit']]],
    ['Cottage cheese, rice cakes and fruit', [['Cottage cheese', 100, 400, 50, 'cottage cheese', 'protein'], ['Rice cakes', 0, 54, 9, 'rice cakes', 'bread'], ['Apple', 0, 182, 91, 'apples', 'fruit']]],
    ['Chicken wraps', [['Chicken breast, cooked', 60, 240, 10, 'cooked chicken breast', 'protein'], ['Tortilla wrap', 62, 186, 62, 'tortilla wraps', 'bread'], ['Salad leaves', 0, 80, 40, 'salad leaves', 'veg']]],
    ['Tofu and rice bowl', [['Tofu, firm', 100, 400, 50, 'firm tofu', 'protein'], ['White rice, cooked', 0, 400, 10, 'microwave rice', 'carb'], ['Broccoli, boiled', 0, 160, 40, 'broccoli', 'veg']]]
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
      ideas.push({ title, source: 'idea', template: title, items, loss: r.loss });
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

  // Is an Open Food Facts product a sensible stand-in for a template ingredient? (per 100 g)
  const ROLE_OK = {
    protein: p => p.protein >= 8, pulse: p => p.protein >= 5, carb: p => p.carbs >= 12, bread: p => p.carbs >= 30,
    veg: p => p.kcal <= 130, fruit: p => p.kcal <= 130 && p.carbs >= 5, egg: p => p.protein >= 10 && p.protein <= 16,
    powder: p => p.protein >= 55, milk: p => p.kcal <= 70 && p.protein >= 2.5
  };
  const roleFits = (role, per) => !!per && per.kcal > 0 && (ROLE_OK[role] || (() => true))(per);
  const templateParts = title => (TEMPLATES.find(t => t[0] === title) || [])[1] || [];
  // A template idea rebuilt with real products: picks[i] replaces ingredient i (null keeps the everyday food).
  // Portion ranges are scaled by energy density, so e.g. dry pasta gets about half the grams of cooked pasta.
  function realVersion(title, picks, remaining, foods) {
    const want = Object.fromEntries(KEYS.map(k => [k, Math.max(0, +remaining[k] || 0)]));
    const byName = new Map(foods.map(f => [f.name, f]));
    const parts = templateParts(title).map(([name, min, max, step], i) => {
      const generic = byName.get(name), real = picks[i];
      if (!real) return { food: generic, min, max, step };
      const ratio = generic && real.per.kcal ? generic.per.kcal / real.per.kcal : 1;
      if (ratio > 0.6 && ratio < 1.6) return { food: real, min, max, step };
      const st = Math.max(5, Math.round(step * ratio / 5) * 5);
      return { food: real, min: Math.round(min * ratio / st) * st, max: Math.max(st, Math.round(max * ratio / st) * st), step: st };
    }).filter(p => p.food);
    const r = fit(parts, want);
    const items = parts.map((p, i) => ({ food: p.food, grams: r.grams[i] })).filter(it => it.grams > 0);
    const totals = totalsOf(items);
    return { title, source: 'real', template: title, items, loss: r.loss, totals,
      after: Object.fromEntries(KEYS.map(k => [k, (+remaining[k] || 0) - totals[k]])),
      proteinCover: want.protein ? Math.min(100, Math.round(totals.protein / want.protein * 100)) : 100 };
  }

  const api = { suggest, rankProducts, realVersion, templateParts, roleFits, TEMPLATES };
  if (typeof window !== 'undefined') window.MealSuggest = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
