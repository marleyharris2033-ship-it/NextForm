// NextForm plan library, part 2: extra ready-made sessions and multi-week programmes.
// Sessions are added to BUILTIN_PLANS (same shape), so they start, schedule and copy like the originals.
(() => {
  const S = (category, id, name, desc, list, type = 'Strength', mins) =>
    ({ category, id, name, type, desc, ...(mins ? { mins } : {}), exercises: list.map(([name, sets, reps]) => ({ name, sets, reps })) });

  const SESSIONS = [
    // ---------- Home / no equipment ----------
    S('Home', 'home1', 'Home Full Body', 'No equipment. Good any day.', [['Bodyweight Squat', 3, '15-20'], ['Push-Up', 3, '8-15'], ['Reverse Lunge', 3, '10-12'], ['Glute Bridge', 3, '15'], ['Bird Dog', 3, '10'], ['Plank', 3, '30-45s']]),
    S('Home', 'home2', 'Home Upper', 'Push-ups three ways plus core.', [['Push-Up', 3, '8-15'], ['Pike Push-Up', 3, '6-10'], ['Diamond Push-Up', 2, '6-12'], ['Incline Push-Up', 2, '12-15'], ['Dead Bug', 3, '10'], ['Side Plank', 2, '30s']]),
    S('Home', 'home3', 'Home Legs & Glutes', 'Single-leg work makes bodyweight hard enough.', [['Bulgarian Split Squat', 3, '8-12'], ['Cossack Squat', 3, '8'], ['Single-Leg Glute Bridge', 3, '10-12'], ['Wall Sit', 3, '30-45s'], ['Calf Raise', 3, '15-20']]),
    S('Home', 'home4', 'Home 20-Minute Quickie', 'Short on time: two rounds, keep moving.', [['Bodyweight Squat', 2, '20'], ['Push-Up', 2, '10-15'], ['Reverse Lunge', 2, '12'], ['Glute Bridge', 2, '15'], ['Plank', 2, '45s']], 'Strength', 20),
    // ---------- Dumbbell only ----------
    S('Dumbbells', 'db1', 'Dumbbell Full Body', 'One pair of dumbbells, whole body.', [['Goblet Squat', 3, '8-12'], ['Dumbbell Bench Press', 3, '8-12'], ['One-Arm Dumbbell Row', 3, '8-12'], ['Dumbbell Romanian Deadlift', 3, '8-10'], ['Dumbbell Shoulder Press', 3, '8-12'], ['Plank', 3, '30-45s']]),
    S('Dumbbells', 'db2', 'Dumbbell Upper', 'Chest, back, shoulders and arms.', [['Dumbbell Bench Press', 3, '8-12'], ['Dumbbell Row', 3, '8-12'], ['Arnold Press', 3, '8-12'], ['Lateral Raise', 3, '12-15'], ['Dumbbell Curl', 2, '10-12'], ['Overhead Triceps Extension', 2, '10-12']]),
    S('Dumbbells', 'db3', 'Dumbbell Lower', 'Legs and glutes with dumbbells.', [['Goblet Squat', 3, '8-12'], ['Dumbbell Romanian Deadlift', 3, '8-10'], ['Bulgarian Split Squat', 3, '8-10'], ['Dumbbell Step-Back Lunge', 2, '10-12'], ['Single-Leg Glute Bridge', 2, '12'], ['Calf Raise', 3, '15']]),
    S('Dumbbells', 'db4', 'Dumbbell Arms & Shoulders', 'A pump day for shoulders and arms.', [['Dumbbell Shoulder Press', 3, '8-12'], ['Lateral Raise', 3, '12-15'], ['Hammer Curl', 3, '10-12'], ['Incline Dumbbell Curl', 2, '10-12'], ['Dumbbell Tate Press', 3, '10-12'], ['Overhead Triceps Extension', 2, '12']]),
    // ---------- Beginner ----------
    S('Beginner', 'beg1', 'Beginner Machines', 'Machines guide the movement, so it’s an easy start.', [['Leg Press', 3, '10-12'], ['Machine Chest Press', 3, '10-12'], ['Lat Pulldown', 3, '10-12'], ['Seated Cable Row', 3, '10-12'], ['Leg Curl', 2, '12'], ['Plank', 2, '20-30s']]),
    S('Beginner', 'beg2', 'Beginner Full Body', 'Learn the basic movements with light weights.', [['Goblet Squat', 3, '10'], ['Dumbbell Bench Press', 3, '10'], ['Lat Pulldown', 3, '10'], ['Glute Bridge', 3, '12'], ['Dead Bug', 2, '8']]),
    S('Beginner', 'beg3', 'Beginner Full Body 2', 'A second session to alternate with the first.', [['Leg Press', 3, '10-12'], ['Incline Dumbbell Press', 3, '10'], ['Seated Cable Row', 3, '10'], ['Dumbbell Shoulder Press', 2, '10'], ['Leg Extension', 2, '12'], ['Side Plank', 2, '20s']]),
    // ---------- Calisthenics ----------
    S('Calisthenics', 'cal1', 'Calisthenics Basics', 'Bodyweight fundamentals.', [['Push-Up', 3, '8-15'], ['Inverted Row', 3, '8-12'], ['Bodyweight Squat', 3, '15-20'], ['Dip', 3, '5-10'], ['Hollow Body Hold', 3, '20-30s']], 'Calisthenics'),
    S('Calisthenics', 'cal2', 'Pull & Core', 'Bar work and a strong middle.', [['Pull-Up', 4, '3-8'], ['Chin-Up', 3, '3-8'], ['Inverted Row', 3, '10'], ['Hanging Leg Raise', 3, '8-12'], ['Hollow Body Hold', 3, '30s']], 'Calisthenics'),
    S('Calisthenics', 'cal3', 'Push & Legs', 'Dips, pike push-ups and single-leg strength.', [['Dip', 4, '6-12'], ['Pike Push-Up', 3, '6-10'], ['Diamond Push-Up', 3, '8-12'], ['Bulgarian Split Squat', 3, '10'], ['Pistol Squat', 3, '3-6'], ['L-Sit', 3, '10-20s']], 'Calisthenics'),
    S('Calisthenics', 'cal4', 'Skills', 'Practise the hard stuff while you’re fresh.', [['Handstand Hold', 5, '20-30s'], ['Archer Push-Up', 3, '4-8'], ['L-Sit', 4, '10-20s'], ['Dead Hang', 3, '30-45s'], ['Pike Push-Up', 3, '8']], 'Calisthenics'),
    // ---------- Glutes & legs ----------
    S('Glutes & Legs', 'glute1', 'Glute Builder', 'Hip thrusts first, then single-leg work.', [['Hip Thrust', 4, '8-12'], ['Romanian Deadlift', 3, '8-10'], ['Bulgarian Split Squat', 3, '10'], ['Glute Kickback', 3, '12-15'], ['Hip Abduction Machine', 3, '15-20']]),
    S('Glutes & Legs', 'glute2', 'Quad Focus', 'Squats, presses and lunges.', [['Back Squat', 4, '6-8'], ['Leg Press', 3, '10-12'], ['Walking Lunge', 3, '10-12'], ['Leg Extension', 3, '12-15'], ['Standing Calf Raise', 3, '12-15']]),
    S('Glutes & Legs', 'glute3', 'Hamstrings & Glutes', 'The back of the legs.', [['Romanian Deadlift', 4, '6-10'], ['Leg Curl', 3, '10-12'], ['Single-Leg Glute Bridge', 3, '12'], ['Back Extension', 3, '12-15'], ['Hip Thrust', 3, '10']]),
    // ---------- Core ----------
    S('Core', 'core1', 'Core Strength', 'Anti-rotation, carries and hanging work.', [['Plank', 3, '45-60s'], ['Side Plank', 3, '30s'], ['Dead Bug', 3, '10'], ['Hanging Leg Raise', 3, '8-12'], ['Pallof Press', 3, '10-12'], ['Farmer\'s Carry', 3, '40s']]),
    S('Core', 'core2', '10-Minute Abs', 'Quick finisher for after any workout.', [['Hollow Body Hold', 2, '30s'], ['Russian Twist', 2, '20'], ['Dead Bug', 2, '10'], ['Bird Dog', 2, '10']], 'Strength', 10),
    // ---------- 30-minute express ----------
    S('30-Min Express', 'exp1', 'Express Full Body', 'Three sets each, short rests, done in 30.', [['Goblet Squat', 3, '10'], ['Push-Up', 3, '10-15'], ['Dumbbell Row', 3, '10'], ['Plank', 3, '30-45s']], 'Strength', 30),
    S('30-Min Express', 'exp2', 'Express Upper', 'Big upper-body moves only.', [['Bench Press', 3, '6-10'], ['Lat Pulldown', 3, '8-12'], ['Dumbbell Shoulder Press', 3, '8-12'], ['Seated Cable Row', 3, '10']], 'Strength', 30),
    S('30-Min Express', 'exp3', 'Express Lower', 'Squat, hinge, lunge.', [['Back Squat', 3, '6-8'], ['Romanian Deadlift', 3, '8'], ['Walking Lunge', 3, '10']], 'Strength', 30),
    S('30-Min Express', 'exp4', 'Express Supersets', 'Pair each move with the next to save time.', [['Dumbbell Bench Press', 3, '10'], ['One-Arm Dumbbell Row', 3, '10'], ['Lateral Raise', 3, '15'], ['Face Pull', 3, '15']], 'Strength', 30),
    // ---------- Kettlebell ----------
    S('Kettlebell', 'kb1', 'Kettlebell Basics', 'One kettlebell. Use it for the dumbbell moves.', [['Kettlebell Swing', 4, '15'], ['Goblet Squat', 3, '10'], ['One-Arm Dumbbell Row', 3, '10'], ['Dumbbell Shoulder Press', 3, '8'], ['Farmer\'s Carry', 3, '40s']]),
    S('Kettlebell', 'kb2', 'Kettlebell Conditioning', 'Swings and squats to get the heart going.', [['Kettlebell Swing', 5, '15-20'], ['Goblet Squat', 3, '12'], ['Reverse Lunge', 3, '10'], ['Russian Twist', 3, '20']], 'Mixed'),
    S('Kettlebell', 'kb3', 'Kettlebell Lower', 'Hinges and single-leg work.', [['Kettlebell Swing', 4, '15'], ['Single-Leg Romanian Deadlift', 3, '8'], ['Goblet Squat', 3, '10'], ['Cossack Squat', 3, '8']]),
    // ---------- HIIT ----------
    S('HIIT', 'hiit1', 'Bodyweight HIIT Circuit', 'Do one set of each, back to back. Rest 60s, repeat 4 rounds.', [['Bodyweight Squat', 4, '20'], ['Push-Up', 4, '10'], ['Reverse Lunge', 4, '12'], ['Russian Twist', 4, '20'], ['Plank', 4, '30s']], 'Mixed'),
    S('HIIT', 'hiit2', 'Dumbbell Circuit', 'Light dumbbells, move fast, 4 rounds.', [['Goblet Squat', 4, '12'], ['Dumbbell Shoulder Press', 4, '10'], ['Dumbbell Row', 4, '10'], ['Walking Lunge', 4, '12'], ['Russian Twist', 4, '20']], 'Mixed'),
    S('HIIT', 'hiit3', 'Boxing & Core Finisher', 'Punch hard for each round, then core.', [['Shadow Boxing', 5, '60s'], ['Plank', 3, '45s'], ['Russian Twist', 3, '20']], 'Mixed')
  ];

  // ---------- multi-week programmes ----------
  // slots: the sessions for each training day of the week, in order (ids of built-in plans, or 'run').
  // phase(week): how that week differs: { label, note, deload, compoundReps, extraSet }.
  const deload = { label: 'Deload', note: 'Easier week: use about 60% of your normal weights and stop well short of failure. It helps you recover and come back stronger.', deload: true };
  const PROGRAMMES = [
    { id: 'beg-strength', name: 'Beginner Strength', weeks: 8, days: 3, level: 'Beginner', equip: 'gym', goal: 'strength', slots: ['fb1', 'fb3', 'fb2'],
      desc: 'Three full-body sessions a week. Learn the big lifts, then build real strength.',
      phase: w => w === 4 ? deload : w <= 3 ? { label: 'Build', note: 'Learn the moves. Add a little weight when you hit the top of the rep range on every set.' }
        : w <= 7 ? { label: 'Strength', note: 'Heavier now: big lifts go to 4 sets of 5–6. Add 2.5 kg when every set feels solid.', compoundReps: '5-6', extraSet: true }
        : { label: 'Test', note: 'Final week: 3 sets of 3–5 on the big lifts. Go for a new best!', compoundReps: '3-5' } },
    { id: 'home-db', name: 'Home Dumbbell Plan', weeks: 6, days: 3, level: 'Any', equip: 'dumbbells', goal: 'muscle', slots: ['db1', 'db2', 'db3'],
      desc: 'All you need is a pair of dumbbells. Full body, upper and lower each week.',
      phase: w => w === 4 ? deload : w <= 3 ? { label: 'Build', note: 'Pick a weight you could lift 2 more times than the target.' } : { label: 'Push on', note: 'One extra set on every exercise. Slow the lowering part down to 3 seconds.', extraSet: true } },
    { id: 'ppl', name: 'Muscle Builder PPL', weeks: 12, days: 6, level: 'Intermediate', equip: 'gym', goal: 'muscle', slots: ['push1', 'pull1', 'lowerA', 'push2', 'pull2', 'lowerB'],
      desc: 'Push, pull, legs twice a week. Lots of volume for building muscle.',
      phase: w => w === 4 || w === 8 ? deload : w <= 3 ? { label: 'Base', note: 'Leave 1–2 reps in the tank on each set.' }
        : w <= 7 ? { label: 'Volume', note: 'One extra set on every exercise this block.', extraSet: true }
        : w <= 11 ? { label: 'Heavy', note: 'Big lifts drop to 6–8 reps with more weight.', compoundReps: '6-8' } : { label: 'Peak', note: 'Last week: match or beat your best sets from week 11.', compoundReps: '5-8' } },
    { id: 'upper-lower', name: 'Upper / Lower 4-Day', weeks: 8, days: 4, level: 'Intermediate', equip: 'gym', goal: 'strength', slots: ['upperA', 'lowerA', 'upperB', 'lowerB'],
      desc: 'Four days a week, each muscle twice. A great balance of strength and size.',
      phase: w => w === 4 || w === 8 ? deload : w <= 3 ? { label: 'Build', note: 'Add reps first, then weight.' } : { label: 'Strength', note: 'Big lifts go to 5–6 reps, add weight when they feel smooth.', compoundReps: '5-6' } },
    { id: 'c25k', name: 'Couch to 5K + Strength', weeks: 9, days: 5, level: 'Beginner', equip: 'any', goal: 'fitness', slots: ['run', 'exp1', 'run', 'home1', 'run'],
      desc: 'Three runs a week that build up to 30 minutes, plus two short strength sessions.',
      runs: ['Run 1 min, walk 1½ min × 8', 'Run 1½ min, walk 2 min × 6', 'Run 3 min, walk 1½ min × 5', 'Run 5 min, walk 2 min × 3', 'Run 8 min, walk 3 min × 2',
        'Run 10 min, walk 2 min × 2', 'Run 25 minutes non-stop', 'Run 28 minutes non-stop', 'Run 30 minutes, or 5 km!'],
      phase: w => ({ label: w === 9 ? '5K week' : `Week ${w}`, note: 'Start every run with a 5-minute brisk walk. Easy pace: you should be able to talk.' }) },
    { id: 'cali-found', name: 'Calisthenics Foundations', weeks: 8, days: 3, level: 'Beginner', equip: 'none', goal: 'strength', slots: ['cal1', 'cal2', 'cal3'],
      desc: 'Bodyweight strength from the ground up: push-ups, rows, dips and your first pull-ups.',
      phase: w => w === 4 ? deload : w <= 3 ? { label: 'Foundations', note: 'Perfect form first. Use a band or a box to assist pull-ups and dips if needed.' } : { label: 'Progress', note: 'One extra set each. Try harder versions when you can do the top of the range.', extraSet: true } },
    { id: 'glutes', name: 'Glutes & Legs 6-Week', weeks: 6, days: 3, level: 'Any', equip: 'gym', goal: 'muscle', slots: ['glute1', 'glute2', 'glute3'],
      desc: 'Three lower-body days a week focused on glutes, quads and hamstrings.',
      phase: w => w === 4 ? deload : w <= 3 ? { label: 'Build', note: 'Pause for a second at the top of every hip thrust and bridge.' } : { label: 'Push on', note: 'One extra set on the first two exercises.', extraSet: true } },
    { id: 'home-start', name: 'Home Starter', weeks: 4, days: 3, level: 'Beginner', equip: 'none', goal: 'general', slots: ['home1', 'home3', 'home2'],
      desc: 'Four weeks of no-equipment workouts to build the habit.',
      phase: w => ({ label: w <= 2 ? 'Habit' : 'Step up', note: w <= 2 ? 'Just show up. Stop each set with a couple of reps left.' : 'Add 2–3 reps to every set, or slow the lowering down.', extraSet: w >= 3 }) }
  ];

  if (typeof BUILTIN_PLANS !== 'undefined') for (const s of SESSIONS) if (!BUILTIN_PLANS.some(p => p.id === s.id)) BUILTIN_PLANS.push(s);
  window.NextFormPlanData = { SESSIONS, PROGRAMMES };
  if (typeof renderSimplePlanner === 'function') try { renderSimplePlanner(); } catch {} // app.js drew the planner before these existed
})();
