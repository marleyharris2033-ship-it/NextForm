// NextForm badges: earned automatically from what you already log. Once earned, a badge is kept (stored with the
// date in data.profile.badges) even if a total later drops. Card backgrounds live here too: generic ones are free,
// the rest unlock with a badge. Artwork lives in cards/<id>.webp (720×960); img: true uses it, with the gradient as a fallback.
(() => {
  // [id, name, how to earn, icon, tier, test(ctx) -> [have, need]]
  const B = [];
  // \u00AD marks where a long name may break onto a second line on the small card.
  const add = (group, list) => list.forEach(([id, name, how, icon, tier, fn]) => B.push({ id, group, name, how, icon, tier, fn }));
  const steps = (prefix, vals, nameFn, howFn, icon, key, tiers) => vals.map((n, i) => [`${prefix}${n}`, nameFn(n, i), howFn(n), icon, tiers[i], c => [c[key], n]]);
  const T5 = ['bronze', 'bronze', 'silver', 'silver', 'gold', 'gold', 'special'];

  add('Getting started', [
    ['first-workout', 'First step', 'Log your first workout.', '👟', 'bronze', c => [c.workouts, 1]],
    ['first-food', 'Fuelled up', 'Log food for the first time.', '🥗', 'bronze', c => [c.foodDays, 1]],
    ['first-weigh', 'On the scale', 'Log your weight for the first time.', '⚖️', 'bronze', c => [c.weighIns, 1]],
    ['first-friend', 'Squad up', 'Add your first friend.', '🤝', 'bronze', c => [c.friends, 1]]
  ]);
  add('Workouts', steps('workouts-', [10, 25, 50, 100, 250, 500], (n, i) => ['Getting going', 'Regular', 'Commit\u00ADted', 'Centu\u00ADrion', 'Machine', 'Legend'][i], n => `Log ${n} workouts.`, '🏋️', 'workouts', T5));
  add('Streaks', steps('streak-', [3, 8, 12, 26, 52], (n, i) => ['Heating up', 'On fire', 'Quarter', 'Half year', 'Full year'][i], n => `Hit your weekly goal ${n} weeks in a row.`, '🔥', 'bestStreak', ['bronze', 'silver', 'gold', 'gold', 'special']));
  add('Levels', steps('level-', [5, 10, 20, 30, 50], (n, i) => ['Rising', 'Double digits', 'Seasoned', 'Veteran', 'Elite'][i], n => `Reach level ${n}.`, '⭐', 'level', ['bronze', 'silver', 'silver', 'gold', 'special']));
  add('Quests', steps('quests-', [1, 10, 25, 50], (n, i) => ['Quest starter', 'Adven\u00ADturer', 'Hero', 'Quest master'][i], n => n === 1 ? 'Complete a quest.' : `Complete ${n} quests.`, '🏆', 'quests', ['bronze', 'silver', 'gold', 'special']));
  add('Story', steps('story-', [1, 3, 12], (n, i) => ['Chapter closed', 'Story\u00ADteller', 'Saga'][i], n => n === 1 ? 'Finish all four chapters of a monthly story.' : `Finish ${n} monthly stories.`, '📖', 'stories', ['silver', 'gold', 'special']));
  add('Distance', steps('km-', [10, 100, 500, 1000], (n, i) => ['First 10', 'Open road', 'Long haul', 'Thousand club'][i], n => `Cover ${n} km in total (runs, rides, walks, swims).`, '🛣️', 'km', ['bronze', 'silver', 'gold', 'special']));
  add('Time', steps('hours-', [10, 50, 100], (n, i) => ['Ten hours', 'Fifty hours', 'Hundred hours'][i], n => `Train for ${n} hours in total.`, '⏱️', 'hours', ['bronze', 'silver', 'gold']));
  add('Strength', [
    ['volume-10', '10 tonnes', 'Lift 10,000 kg in total (weight × reps).', '🧱', 'bronze', c => [c.tonnes, 10]],
    ['volume-100', '100 tonnes', 'Lift 100,000 kg in total.', '🧱', 'silver', c => [c.tonnes, 100]],
    ['volume-1000', 'Mountain mover', 'Lift 1,000,000 kg in total.', '🏔️', 'special', c => [c.tonnes, 1000]],
    ['club-100', '100 kg club', 'Log a set of 100 kg or more on any lift.', '💯', 'gold', c => [c.bestKg, 100]],
    ['bw-bench', 'Body\u00ADweight bench', 'Bench press your own bodyweight (log your weight first).', '🛋️', 'gold', c => [c.bw ? Math.min(c.benchKg, c.bw) : 0, c.bw || 1]]
  ]);
  add('Milestones', [
    ['pb-first', 'Break\u00ADthrough', 'Set a strength personal best.', '📈', 'silver', c => [c.pbs, 1]],
    ['s-grade', 'S-Class', 'Earn an S grade on a workout.', '👑', 'gold', c => [c.sGrade, 1]],
    ['one-5k', '5K', 'Cover 5 km in one session.', '🏃', 'bronze', c => [c.long5k, 1]],
    ['rounds-10', 'Ten rounds', 'Complete 10 boxing rounds in one session.', '🥊', 'silver', c => [c.rounds10, 1]]
  ]);
  add('Variety', [
    ['types-5', 'All-\u00ADrounder', 'Log 5 different kinds of workout.', '🎯', 'silver', c => [c.types, 5]],
    ['types-10', 'Jack of all trades', 'Log 10 different kinds of workout.', '🎯', 'gold', c => [c.types, 10]],
    ['stretch-10', 'Bendy', 'Log 10 stretch, yoga or mobility sessions.', '🧘', 'silver', c => [c.mobility, 10]],
    ['stretch-50', 'Zen master', 'Log 50 stretch, yoga or mobility sessions.', '🧘', 'gold', c => [c.mobility, 50]]
  ]);
  add('Food', steps('food-', [7, 30, 100], (n, i) => ['Week of logging', 'Month of logging', 'Hundred days'][i], n => `Log food on ${n} different days.`, '🍎', 'foodDays', ['bronze', 'silver', 'gold']));
  add('Friends', [
    ['friends-5', 'Crew', 'Have 5 friends on NextForm.', '👥', 'silver', c => [c.friends, 5]],
    ['kudos-10', 'Cheer\u00ADleader', 'Give 10 kudos.', '👏', 'bronze', c => [c.kudos, 10]],
    ['kudos-50', 'Hype squad', 'Give 50 kudos.', '👏', 'silver', c => [c.kudos, 50]]
  ]);

  // Card backgrounds. unlock: badge id (null = free). Placeholder gradients until the artwork arrives.
  const BACKGROUNDS = [
    { id: 'pine', name: 'Pine', grad: 'linear-gradient(135deg,#1f4a3a,#2f6b52)', dark: true, img: true },
    { id: 'mist', name: 'Mist', grad: 'linear-gradient(135deg,#eef3ec,#d9e5d4)', dark: false, img: true },
    { id: 'midnight', name: 'Midnight', grad: 'linear-gradient(135deg,#141b2d,#2b3a5c)', dark: true, img: true },
    { id: 'sunrise', name: 'Sunrise', grad: 'linear-gradient(135deg,#ffb36b,#ff6f61)', dark: true, img: true },
    { id: 'ocean', name: 'Ocean', grad: 'linear-gradient(135deg,#0f5e7a,#2bb3c0)', dark: true, img: true },
    { id: 'sand', name: 'Sand', grad: 'linear-gradient(135deg,#f5e9d3,#e2cda5)', dark: false, img: true },
    { id: 'iron', name: 'Iron', grad: 'linear-gradient(135deg,#2c2f33,#6b7178)', dark: true, img: true, unlock: 'workouts-50' },
    { id: 'ember', name: 'Ember', grad: 'linear-gradient(135deg,#3a0d0d,#e2531f)', dark: true, img: true, unlock: 'streak-12' },
    { id: 'summit', name: 'Summit', grad: 'linear-gradient(160deg,#7fa7c9,#e9f0f7)', dark: false, img: true, unlock: 'level-10' },
    { id: 'road', name: 'Open road', grad: 'linear-gradient(160deg,#3b4a3f,#c9a96e)', dark: true, img: true, unlock: 'km-100' },
    { id: 'zen', name: 'Zen garden', grad: 'linear-gradient(160deg,#2f3b2c,#6f8a62)', dark: true, img: true, unlock: 'stretch-10' },
    { id: 'harvest', name: 'Harvest', grad: 'linear-gradient(135deg,#f3c35b,#7aa34a)', dark: true, img: true, unlock: 'food-30' },
    { id: 'trophy', name: 'Trophy room', grad: 'linear-gradient(135deg,#3d2b0f,#d4a537)', dark: true, img: true, unlock: 'quests-25' },
    { id: 'storybook', name: 'Storybook', grad: 'linear-gradient(135deg,#3b2a5c,#b07cc6)', dark: true, img: true, unlock: 'story-3' },
    { id: 'plates', name: 'Plates', grad: 'linear-gradient(135deg,#111,#3a3a3a)', dark: true, img: true, unlock: 'club-100' },
    { id: 'crew', name: 'Crew', grad: 'linear-gradient(135deg,#2b5876,#4e4376)', dark: true, img: true, unlock: 'friends-5' },
    { id: 'aurora', name: 'Aurora', grad: 'linear-gradient(135deg,#0b2a3a,#2fd3a0 60%,#8a5cf6)', dark: true, img: true, unlock: 'level-30' },
    { id: 'legend', name: 'Legend', grad: 'linear-gradient(135deg,#1a1a1a,#b8860b 50%,#1a1a1a)', dark: true, img: true, unlock: 'workouts-250' }
  ];

  function context() {
    const ws = data.workouts || [], types = new Set(), wc = {};
    let km = 0, mins = 0, kg = 0, bestKg = 0, benchKg = 0, mobility = 0;
    for (const w of ws) {
      types.add(w.type); km += +w.distance || 0; mins += +w.duration || 0;
      if (w.type === 'Mobility') mobility++;
      for (const e of w.exercises || []) for (const s of setsOf(e)) {
        kg += s.kg * s.reps; if (s.reps > 0) { bestKg = Math.max(bestKg, s.kg); if (/bench press/i.test(e.name) && !/close|floor|jm/i.test(e.name)) benchKg = Math.max(benchKg, s.kg); }
      }
      const k = weekKey(w.date); if (k) wc[k] = (wc[k] || 0) + 1;
    }
    const g = weekGoal(); let best = 0, run = 0, prev = null;
    for (const k of Object.keys(wc).sort()) { if (wc[k] < g) { run = 0; prev = k; continue; } run = prev && shiftWeek(k, -1) === prev && run ? run + 1 : 1; best = Math.max(best, run); prev = k; }
    const story = (data.storyLog || []).filter(x => /-c4$/.test(x.id)).length;
    const weights = [...(data.weights || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const soc = data.profile.social || {};
    return {
      workouts: ws.length, types: types.size, km: Math.round(km), hours: Math.round(mins / 60), tonnes: Math.floor(kg / 1000), bestKg, benchKg, mobility,
      bestStreak: Math.max(best, weekStreak()), level: levelInfo(data.xp || 0).level, quests: (data.claimedChallenges || []).length, stories: story,
      foodDays: new Set((data.foodLog || []).map(f => f.date)).size, weighIns: weights.length, bw: +weights.at(-1)?.value || 0,
      pbs: ws.some(w => (+w.result?.pbs || 0) > 0) ? 1 : 0, sGrade: ws.some(w => w.result?.grade === 'S') ? 1 : 0,
      long5k: ws.some(w => (+w.distance || 0) >= 5) ? 1 : 0, rounds10: ws.some(w => (+w.rounds || 0) >= 10) ? 1 : 0,
      friends: Math.max(+soc.friendsMax || 0, window.NextFormSocial?.state?.friends?.length || 0), kudos: +soc.kudosGiven || 0
    };
  }
  const earnedMap = () => (data.profile.badges = data.profile.badges && typeof data.profile.badges === 'object' ? data.profile.badges : {});
  function all() {
    const c = context(), got = earnedMap();
    return B.map(b => { const [have, need] = b.fn(c); return { ...b, have: Math.min(have, need), need, earned: !!got[b.id] || have >= need, date: got[b.id] || null }; });
  }
  const byId = id => B.find(b => b.id === id);
  // Record new badges and announce them. Called after every save.
  let checking = false;
  function check(quiet = false) {
    if (checking) return []; checking = true;
    try {
      const got = earnedMap(), fresh = all().filter(b => b.earned && !got[b.id]);
      if (!fresh.length) return [];
      fresh.forEach(b => { got[b.id] = today(); });
      save();
      if (!quiet) { const t = window.NextFormFood?.toast; const m = fresh.length === 1 ? `New badge: ${fresh[0].icon} ${fresh[0].name}` : `${fresh.length} new badges! See them in Profile.`; t ? t(m) : null; }
      return fresh;
    } finally { checking = false; }
  }
  const bgUnlocked = bg => !bg.unlock || !!earnedMap()[bg.unlock];
  const bgById = id => BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
  // Artwork sits at the bottom of each image, so anchor it there; a light veil keeps text readable.
  const bgStyle = bg => bg.img ? `background:${bg.grad};background-image:linear-gradient(${bg.dark ? 'rgba(0,0,0,.18),rgba(0,0,0,.05)' : 'rgba(255,255,255,.25),rgba(255,255,255,0)'}),url('cards/${bg.id}.webp');background-size:cover;background-position:center bottom` : `background:${bg.grad}`;

  window.NextFormBadges = { BADGES: B, BACKGROUNDS, all, check, context, byId, bgById, bgUnlocked, bgStyle, earned: () => earnedMap() };
  // First run: quietly award what people have already done, so long-time users aren't flooded with toasts.
  check(Object.keys(earnedMap()).length === 0);
  window.addEventListener('nextform-saved', () => setTimeout(() => check(), 0));
  if (typeof renderAchievements === 'function') renderAchievements(); // app.js drew them before badges existed
})();
