// NextForm "Today's suggestion": a strength session built from the muscle groups you've rested longest.
// Skips anything trained in the last 2 days, uses your own most-used exercises for each group
// (the session then pre-fills your last numbers), and falls back to sensible basics.
(() => {
  const GROUPS = {
    Chest: { cats: ['Chest'], basics: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly'] },
    Back: { cats: ['Back'], basics: ['Lat Pulldown', 'Seated Cable Row', 'Pull-Up'] },
    Shoulders: { cats: ['Shoulders'], basics: ['Overhead Press', 'Lateral Raise', 'Face Pull'] },
    Legs: { cats: ['Legs', 'Glutes', 'Hamstrings', 'Calves'], basics: ['Back Squat', 'Romanian Deadlift', 'Leg Press'] },
    Arms: { cats: ['Arms'], basics: ['Dumbbell Curl', 'Triceps Pushdown', 'Hammer Curl'] },
    Core: { cats: ['Core'], basics: ['Plank', 'Hanging Leg Raise', 'Cable Crunch'] }
  };
  const MAIN = ['Chest', 'Back', 'Shoulders', 'Legs'], EXTRA = ['Arms', 'Core'];
  const dayNum = ds => Math.round(new Date(String(ds) + 'T12:00:00').getTime() / 864e5);

  function build({ workouts = [], exercises = [], today, plans = [] }) {
    const meta = new Map(exercises.map(e => [e.name.toLowerCase(), e]));
    const groupOf = name => { const cat = meta.get(String(name).toLowerCase())?.cat; return Object.keys(GROUPS).find(g => GROUPS[g].cats.includes(cat)) || null; };
    const t = dayNum(today), last = {}, uses = {};
    for (const w of workouts) {
      const d = dayNum(w.date); if (!(d <= t)) continue;
      for (const e of w.exercises || []) {
        const g = groupOf(e.name); if (!g) continue;
        if (last[g] == null || d > last[g]) last[g] = d;
        const k = e.name; uses[g] = uses[g] || {}; const u = uses[g][k] = uses[g][k] || { n: 0, at: 0 }; u.n++; u.at = Math.max(u.at, d);
      }
    }
    const ago = g => last[g] == null ? Infinity : t - last[g];
    const rested = gs => gs.filter(g => ago(g) >= 2).sort((a, b) => ago(b) - ago(a) || gs.indexOf(a) - gs.indexOf(b));
    const main = rested(MAIN).slice(0, 2);
    if (!main.length) return { rest: true, reason: 'You’ve trained every main muscle group in the last 2 days. A rest day or some easy cardio would be a smart choice.' };
    const extra = rested(EXTRA)[0];
    const known = n => meta.has(n.toLowerCase());
    const pick = (g, n) => {
      const mine = Object.entries(uses[g] || {}).sort((a, b) => b[1].n - a[1].n || b[1].at - a[1].at).map(([k]) => k);
      return [...new Set([...mine, ...GROUPS[g].basics.filter(known)])].slice(0, n);
    };
    const names = [...main.flatMap(g => pick(g, main.length === 1 ? 3 : 2)), ...(extra ? pick(extra, 1) : [])];
    const ex = names.map(name => { const timed = !!meta.get(name.toLowerCase())?.timed; return { name, sets: 3, reps: timed ? '30-45s' : groupOf(name) === 'Legs' && /squat|deadlift|press/i.test(name) ? '6-10' : '8-12' }; });
    const groups = [...main, ...(extra ? [extra] : [])];
    const agoText = g => ago(g) === Infinity ? 'not yet' : ago(g) === 1 ? 'yesterday' : `${ago(g)} days ago`;
    const seen = main.filter(g => ago(g) !== Infinity), fresh = main.filter(g => ago(g) === Infinity);
    const reason = [seen.length ? `You last trained ${seen.map(g => `${g.toLowerCase()} ${agoText(g)}`).join(' and ')}.` : '',
      fresh.length ? `You haven’t logged ${fresh.map(g => g.toLowerCase()).join(' or ')} yet.` : ''].filter(Boolean).join(' ');
    return { rest: false, groups, name: `${groups.slice(0, 2).join(' & ')}${extra ? ` + ${extra.toLowerCase()}` : ''}`, reason, exercises: ex };
  }
  const api = { build, GROUPS };
  if (typeof window !== 'undefined') window.TodaySession = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
