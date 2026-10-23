// NextForm RPG layer: skills that level up from the training you actually do.
// Pure functions over workout history, so existing workouts count straight away.
// Uses globals from app.js: EXERCISES, e1rm.
const SKILLS = [
  { id: 'chest', name: 'Chest' }, { id: 'back', name: 'Back' }, { id: 'shoulders', name: 'Shoulders' },
  { id: 'arms', name: 'Arms' }, { id: 'legs', name: 'Legs' }, { id: 'posterior', name: 'Posterior chain' },
  { id: 'core', name: 'Core' }, { id: 'endurance', name: 'Endurance' }, { id: 'boxing', name: 'Combat' },
  { id: 'mobility', name: 'Mobility' }
];
const CATEGORY_SKILL = { Chest: 'chest', Back: 'back', Shoulders: 'shoulders', Arms: 'arms', Legs: 'legs', Calves: 'legs',
  Hamstrings: 'posterior', Glutes: 'posterior', Core: 'core', Boxing: 'boxing', Cardio: 'endurance' };
const MAX_SKILL_LEVEL = 99;

// Classic RPG curve: early levels come quickly, later ones take real commitment.
const SKILL_XP_TABLE = (() => {
  const t = [0, 0]; let pts = 0;
  for (let l = 1; l < MAX_SKILL_LEVEL; l++) { pts += Math.floor(l + 300 * Math.pow(2, l / 7)); t.push(Math.floor(pts / 4)); }
  return t; // t[L] = total XP needed to reach level L
})();
function skillLevel(xp) {
  let l = 1;
  while (l < MAX_SKILL_LEVEL && xp >= SKILL_XP_TABLE[l + 1]) l++;
  const floor = SKILL_XP_TABLE[l], next = SKILL_XP_TABLE[l + 1] ?? floor;
  return { level: l, xp, into: xp - floor, need: next - floor, max: l >= MAX_SKILL_LEVEL };
}

function skillForExercise(name) {
  const hit = EXERCISES.find(e => e.name.toLowerCase() === String(name || '').trim().toLowerCase());
  if (hit) return CATEGORY_SKILL[hit.cat] || null;
  const n = String(name || '').toLowerCase(); // custom exercise names: best guess from keywords
  if (/bench|chest|fly|push-?up|dip/.test(n)) return 'chest';
  if (/row|pull|chin|lat|deadlift/.test(n)) return 'back';
  if (/shoulder|overhead|lateral|delt|press/.test(n)) return 'shoulders';
  if (/curl|tricep|bicep|arm/.test(n)) return 'arms';
  if (/squat|lunge|leg|calf|step/.test(n)) return 'legs';
  if (/hip|glute|hamstring|rdl/.test(n)) return 'posterior';
  if (/plank|crunch|core|ab|carry/.test(n)) return 'core';
  if (/run|row(er|ing machine)|bike|cycle|rope|swim/.test(n)) return 'endurance';
  return null;
}
// Individual sets for an exercise entry (new per-set log, or older single-line entries).
function setsOf(e) {
  if (Array.isArray(e.setsDetail) && e.setsDetail.length) return e.setsDetail.map(s => ({ kg: +s.kg || 0, reps: +s.reps || 0 }));
  const n = Math.max(0, +e.sets || 0);
  return Array.from({ length: n }, () => ({ kg: +e.weight || 0, reps: +e.reps || 0 }));
}
function setXp(s, timed) {
  if (timed) return Math.round(8 + s.reps / 5); // reps hold seconds for timed holds
  return Math.round(8 + s.reps + (s.kg * s.reps) / 40);
}
const PB_BONUS = 50;
// Latest logged bodyweight, for moves where you lift yourself (pull-ups, dips, push-ups...).
function currentBodyweight() {
  try { const w = typeof weight === 'function' ? +weight() : 0; return w > 25 && w < 350 ? w : 80; } catch { return 80; }
}

// Skill XP a single workout earns. `bests` (exercise -> best e1RM so far) is updated as it goes.
function workoutSkillXp(w, bests = new Map()) {
  const gain = {}, records = [];
  const add = (id, xp) => { if (id && xp > 0) gain[id] = (gain[id] || 0) + Math.round(xp); };
  for (const e of w.exercises || []) {
    const skill = skillForExercise(e.name), timed = e.unit === 's', sets = setsOf(e);
    const bwLoad = WORKOUT_TYPES.BODYWEIGHT_LOAD[e.name.toLowerCase()] || 0, bw = bwLoad ? currentBodyweight() : 0;
    sets.forEach(s => add(skill, setXp(bwLoad ? { kg: s.kg + bw * bwLoad, reps: s.reps } : s, timed)));
    if (timed) continue;
    const key = e.name.toLowerCase(), top = Math.max(0, ...sets.map(s => e1rm(s.kg, s.reps)));
    const prev = bests.get(key) || 0;
    if (prev && top > prev * 1.005) {
      add(skill, PB_BONUS);
      const best = sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a), sets[0]);
      records.push({ name: e.name, kg: best.kg, reps: best.reps, e1rm: top });
    }
    if (top > prev) bests.set(key, top);
  }
  // Running, cycling, swimming, sports and the rest: see workout-types.js for how each is worked out.
  const share = {};
  WORKOUT_TYPES.typeSkillXp(w, (id, xp) => { if (id && xp > 0) share[id] = (share[id] || 0) + xp; });
  for (const [id, xp] of Object.entries(share)) add(id, xp);
  return { gain, records };
}

// Full character from history. Workouts are processed oldest first so records are judged fairly.
function characterFrom(workouts) {
  const xp = Object.fromEntries(SKILLS.map(s => [s.id, 0])), bests = new Map();
  const ordered = [...workouts].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)));
  for (const w of ordered) {
    const { gain } = workoutSkillXp(w, bests);
    for (const [k, v] of Object.entries(gain)) xp[k] += v;
  }
  const skills = SKILLS.map(s => ({ ...s, ...skillLevel(xp[s.id]) }));
  return { skills, totalLevel: skills.reduce((a, s) => a + s.level, 0), title: classTitle(xp), bests };
}

function classTitle(xp) {
  const groups = {
    Warrior: ['chest', 'back', 'shoulders', 'arms', 'legs', 'posterior', 'core'].reduce((a, k) => a + xp[k], 0),
    Ranger: xp.endurance, Brawler: xp.boxing, Monk: xp.mobility
  };
  const total = Object.values(groups).reduce((a, b) => a + b, 0);
  if (!total) return 'Recruit';
  const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] / total >= 0.6) return sorted[0][0];
  return 'Hybrid';
}

// ---------- Level ring ----------
// Where the XP in your current level came from, by discipline. Walks back from your newest workouts and
// quest rewards until it has covered the XP earned since your last level-up. A workout's XP is shared
// between disciplines in the same proportions as the skill XP it earned.
const DISCIPLINES = [
  { id: 'strength', name: 'Strength', color: '#a6c46f' },
  { id: 'endurance', name: 'Endurance', color: '#6fb7d6' },
  { id: 'combat', name: 'Combat', color: '#f0a03c' },
  { id: 'mobility', name: 'Mobility', color: '#c7a6e8' },
  { id: 'quests', name: 'Quests', color: '#f6d76b' }
];
const SKILL_DISCIPLINE = { chest: 'strength', back: 'strength', shoulders: 'strength', arms: 'strength', legs: 'strength', posterior: 'strength', core: 'strength', endurance: 'endurance', boxing: 'combat', mobility: 'mobility' };
function disciplineShares(w) {
  const { gain } = workoutSkillXp(w, new Map()), out = {};
  let total = 0;
  for (const [k, v] of Object.entries(gain)) { const d = SKILL_DISCIPLINE[k] || 'strength'; out[d] = (out[d] || 0) + v; total += v; }
  if (!total) return { [(WORKOUT_TYPES.typeDef(w.type).mode === 'sets' ? 'strength' : 'endurance')]: 1 };
  for (const k in out) out[k] /= total;
  return out;
}
function levelBreakdown(d, challenges) {
  const l = levelInfo(d.xp || 0), parts = Object.fromEntries(DISCIPLINES.map(x => [x.id, 0]));
  const at = ds => new Date(String(ds) + 'T12:00:00').getTime() || 0;
  const events = [
    ...(d.workouts || []).map(w => ({ t: at(w.date), id: String(w.id), xp: +w.result?.xp || 0, w })),
    ...(d.claimedChallenges || []).map(id => ({ t: +(d.claimTimes || {})[id] || 0, id, xp: +(challenges.find(c => c[0] === id)?.[4]) || 0, quest: true }))
  ].filter(e => e.xp > 0).sort((a, b) => b.t - a.t || (b.id > a.id ? 1 : -1));
  let left = l.into;
  for (const e of events) {
    if (left <= 0) break;
    const take = Math.min(left, e.xp); left -= take;
    if (e.quest) { parts.quests += take; continue; }
    for (const [k, share] of Object.entries(disciplineShares(e.w))) parts[k] += take * share;
  }
  if (left > 0) parts.quests += left; // anything unaccounted for (e.g. older imported totals)
  return { ...l, parts: DISCIPLINES.map(x => ({ ...x, xp: Math.round(parts[x.id]) })) };
}
