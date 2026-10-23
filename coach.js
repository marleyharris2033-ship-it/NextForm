// NextForm coach: next-session suggestions (progressive overload), rest times and plate maths.
// Pure functions only, so they can be tested without a browser.
(() => {
  const BARBELL = new Set(['bench press', 'back squat', 'front squat', 'box squat', 'zercher squat', 'deadlift', 'sumo deadlift',
    'romanian deadlift', 'rack pull', 'good morning', 'overhead press', 'push press', 'z press', 'barbell row', 'pendlay row',
    'barbell curl', 'barbell shrug', 'trap bar deadlift', 'close-grip bench press', 'incline barbell press', 'floor press', 'hip thrust', 'jm press', 'ez-bar curl', 'skull crusher']);
  const LOWER = /squat|deadlift|rack pull|good morning|hip thrust|leg press|lunge|step-up/;
  const ISOLATION = /curl|raise|fly|extension|pushdown|kickback|crunch|calf|face pull|pullover|squeeze|shrug|y raise|reverse fly|tate press|pec deck|abduction|adduction|woodchop|pallof|twist/;

  function equipment(name) {
    const n = String(name || '').trim().toLowerCase();
    if (BARBELL.has(n) || /barbell|\bbb\b|ez[- ]?bar/.test(n)) return 'barbell';
    if (/dumbbell|\bdb\b|goblet|hammer curl|arnold|lateral raise|rear delt raise|front raise|concentration|zottman|spider curl/.test(n)) return 'dumbbell';
    return 'other';
  }
  const isLower = name => LOWER.test(String(name || '').toLowerCase());
  const isIsolation = name => ISOLATION.test(String(name || '').toLowerCase()) && !/close-grip|leg press/.test(String(name).toLowerCase());

  // Smallest sensible jump in weight for this lift.
  function increment(name) {
    const eq = equipment(name), lower = isLower(name);
    if (eq === 'barbell') return lower ? 5 : 2.5;
    if (eq === 'dumbbell') return 2;
    return lower ? 5 : 2.5;
  }

  // Default rest between sets, in seconds.
  function defaultRest(name) {
    if (isIsolation(name)) return 75;
    if (equipment(name) === 'barbell') return isLower(name) ? 180 : 150;
    return 120;
  }

  // "8-12" -> [8, 12], "8" -> [8, 8], "30-60s" -> [30, 60]. Returns null if there's no usable number.
  function parseRange(t) {
    const m = String(t || '').match(/(\d+)\s*(?:[-–]\s*(\d+))?/);
    if (!m) return null;
    const lo = +m[1], hi = m[2] ? +m[2] : lo;
    return lo > 0 ? [Math.min(lo, hi), Math.max(lo, hi)] : null;
  }
  // Rep range when no plan target is set, from how many reps were done last time.
  function inferRange(reps) {
    if (reps <= 6) return [4, 6];
    if (reps <= 12) return [8, 12];
    return [12, 20];
  }

  const round = (v, step) => Math.max(0, Math.round(v / step) * step);
  const fmtKg = v => String(Math.round(v * 100) / 100);

  // history: this exercise's past sessions, newest first, each { sets: [{kg, reps}], unit }.
  // target: the plan's rep target such as "8-12" (optional).
  // Returns { sets: [{kg, reps}], kind, reason } or null if there's nothing to go on.
  function suggest(name, history, target) {
    const last = history && history[0];
    const sets = (last?.sets || []).filter(s => +s.reps > 0);
    if (!sets.length) return null;
    const timed = last.unit === 's';
    if (timed) {
      return { kind: 'more', sets: sets.map(s => ({ kg: +s.kg || 0, reps: +s.reps + 5 })), reason: 'Hold each set 5 seconds longer than last time.' };
    }
    const top = Math.max(...sets.map(s => +s.kg || 0));
    if (top <= 0) {
      return { kind: 'more', sets: sets.map(s => ({ kg: 0, reps: +s.reps + 1 })), reason: 'Add one rep to each set.' };
    }
    const work = sets.filter(s => (+s.kg || 0) === top);
    const range = parseRange(target) || inferRange(Math.min(...work.map(s => +s.reps)));
    const [lo, hi] = range, inc = increment(name);

    // Stalled: the last three sessions were at this weight with no more total reps than three sessions ago.
    const workOf = h => { const ss = (h?.sets || []).filter(s => +s.reps > 0), t = Math.max(0, ...ss.map(s => +s.kg || 0));
      return { top: t, reps: ss.filter(s => (+s.kg || 0) === t).reduce((a, s) => a + +s.reps, 0) }; };
    if (history.length >= 3) {
      const [a, b, c] = history.slice(0, 3).map(workOf);
      if (a.top === top && b.top === top && c.top === top && a.reps <= c.reps && !work.every(s => +s.reps >= hi)) {
        const kg = round(top * 0.9, equipment(name) === 'dumbbell' ? 2 : 2.5);
        if (kg > 0 && kg < top) return { kind: 'deload', sets: sets.map(() => ({ kg, reps: lo })), reason: `Stuck at ${fmtKg(top)} kg for 3 sessions. Drop to ${fmtKg(kg)} kg and build back up.` };
      }
    }
    if (work.every(s => +s.reps >= hi)) {
      const kg = top + inc;
      // lighter sets (warm-ups, back-off sets) are left as they were
      return { kind: 'up', sets: sets.map(s => (+s.kg || 0) === top ? { kg, reps: lo } : { kg: +s.kg || 0, reps: +s.reps }), reason: `You hit ${hi} reps on every set. Go up ${fmtKg(inc)} kg.` };
    }
    return { kind: 'more', sets: sets.map(s => (+s.kg || 0) === top ? { kg: top, reps: Math.min(hi, +s.reps + 1) } : { kg: +s.kg || 0, reps: +s.reps }),
      reason: `Same weight. Add a rep where you can, up to ${hi}.` };
  }

  // Plate maths: plates per side for a target weight. Plates in kg, largest first.
  const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  function plates(total, bar = 20, available = PLATES) {
    const t = +total || 0;
    if (t <= bar) return { perSide: [], loaded: bar, exact: t === bar, belowBar: t < bar };
    let side = Math.round(((t - bar) / 2) * 1000) / 1000;
    const perSide = [];
    for (const p of available) while (side + 1e-9 >= p) { perSide.push(p); side = Math.round((side - p) * 1000) / 1000; }
    const loaded = bar + 2 * perSide.reduce((a, p) => a + p, 0);
    return { perSide, loaded: Math.round(loaded * 100) / 100, exact: Math.abs(loaded - t) < 1e-6, belowBar: false };
  }

  const api = { equipment, increment, defaultRest, parseRange, suggest, plates, PLATES, isIsolation };
  if (typeof window !== 'undefined') window.NextFormCoach = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
