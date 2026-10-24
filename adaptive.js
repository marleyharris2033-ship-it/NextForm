// NextForm adaptive calorie targets: estimate how much you really burn from what you eat and how your
// weight changes, the way MacroFactor's weekly check-in works. Pure functions, testable on their own.
//
//   daily burn ≈ average daily intake − (weight change per day × 7,700 kcal per kg)
//
// Uses the last 21 complete days. Needs at least 10 days with a full day of food logged (800+ kcal, so
// half-logged days don't drag the average down) and 3 weigh-ins spread over 10+ days. The weight change
// is the slope of a straight line through the weigh-ins, so one heavy morning doesn't swing it.
(() => {
  const KCAL_PER_KG = 7700, WINDOW = 21, MIN_DAYS = 10, MIN_WEIGHINS = 3, MIN_SPAN = 10;
  const dayNum = ds => Math.round(new Date(String(ds) + 'T12:00:00').getTime() / 864e5);

  function estimate({ foodLog = [], weights = [], today, formulaBurn = 0 }) {
    const t = dayNum(today), from = t - WINDOW; // [from, t) = the 21 complete days before today
    const perDay = new Map();
    for (const e of foodLog) { const d = dayNum(e.date); if (d >= from && d < t) perDay.set(d, (perDay.get(d) || 0) + (+e.kcal || 0)); }
    const days = [...perDay.values()].filter(k => k >= 800);
    const ws = weights.map(w => ({ d: dayNum(w.date), v: +w.value })).filter(w => w.d >= from - 7 && w.d <= t && w.v > 0).sort((a, b) => a.d - b.d);
    const span = ws.length ? ws[ws.length - 1].d - ws[0].d : 0;
    const progress = { loggedDays: days.length, needDays: MIN_DAYS, weighIns: ws.length, needWeighIns: MIN_WEIGHINS, span, needSpan: MIN_SPAN };
    if (days.length < MIN_DAYS || ws.length < MIN_WEIGHINS || span < MIN_SPAN) return { ready: false, ...progress };
    const avgIntake = days.reduce((a, b) => a + b, 0) / days.length;
    // least-squares slope of weight against day
    const mx = ws.reduce((a, w) => a + w.d, 0) / ws.length, my = ws.reduce((a, w) => a + w.v, 0) / ws.length;
    const slope = ws.reduce((a, w) => a + (w.d - mx) * (w.v - my), 0) / (ws.reduce((a, w) => a + (w.d - mx) ** 2, 0) || 1); // kg per day
    let burn = avgIntake - slope * KCAL_PER_KG;
    // Keep it sensible: within 70–140% of the formula estimate when we have one, and 1,200–5,000 kcal.
    if (formulaBurn > 0) burn = Math.min(formulaBurn * 1.4, Math.max(formulaBurn * 0.7, burn));
    burn = Math.min(5000, Math.max(1200, burn));
    return { ready: true, burn: Math.round(burn / 10) * 10, avgIntake: Math.round(avgIntake), kgPerWeek: Math.round(slope * 7 * 100) / 100, ...progress };
  }

  // Targets from a daily burn: a gentle deficit or surplus towards a goal weight, protein and fat per kg.
  function targetsFrom(burn, weightKg, goalKg) {
    const w = weightKg || 75;
    const adjust = goalKg && goalKg < w - 1 ? -400 : goalKg && goalKg > w + 1 ? 250 : 0;
    const kcal = Math.round((burn + adjust) / 10) * 10;
    const protein = Math.round(1.8 * w), fat = Math.round(0.8 * w);
    return { kcal, protein, fat, carbs: Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4)), adjust };
  }

  const api = { estimate, targetsFrom, KCAL_PER_KG };
  if (typeof window !== 'undefined') window.Adaptive = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
