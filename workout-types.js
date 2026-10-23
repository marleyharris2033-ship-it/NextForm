// NextForm workout types: what each type logs, the activities in it, and the skill XP it earns.
// Pure data and functions (no DOM) so the numbers can be tested on their own.
//
// How skill XP is worked out for the newer types:
//   XP = active minutes × MET × 1.2 × effort factor, then shared between skills by the type's split.
// MET is the standard intensity rating for an activity (Compendium of Physical Activities): resting is 1,
// a brisk walk about 4, running about 10. The 1.2 makes a typical session of each type earn about the
// same as a solid hour of lifting (~500 skill XP). Effort factor = 0.8 + effort × 0.04 (effort 5 = ×1.0,
// effort 10 = ×1.2). Running, Boxing and Mobility keep their original formulas so past workouts don't change.
(() => {
  const ICON = {
    strength: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v4M6 12l3-3 4 1 2 3 3 1M11 15l-1-4"/>',
    bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6l3.5 7.5M9 9 12 16.5h-6.5M15 9l-1.5-3H11"/>',
    swim: '<circle cx="16" cy="6" r="1.8"/><path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M5 13l4-4 3 2 3-3"/>',
    machine: '<path d="M4 18h16M6 18l2-9h8l2 9M9 9V5h6v4M10 13h4"/>',
    hiit: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    boxing: '<path d="M8 20v-3c-2-1-3-3-3-6V8a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v2h1a2 2 0 0 1 0 4h-2l-1 3v3z"/><path d="M8 11h5"/>',
    cali: '<path d="M4 4h16M8 4v3M16 4v3"/><circle cx="12" cy="9.5" r="1.8"/><path d="M8 7l4 5 4-5M12 12v5M9.5 21l2.5-4 2.5 4"/>',
    mobility: '<path d="M12 19c-4 0-7.5-2-8.5-5 3 0 5.5 1 8.5 5zM12 19c4 0 7.5-2 8.5-5-3 0-5.5 1-8.5 5zM12 19c-2-2.5-2-6 0-10 2 4 2 7.5 0 10z"/>',
    sports: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5zM12 3.5v4M20.3 10.2l-4.3.3M16.9 19.2 14.5 15M7.1 19.2 9.5 15M3.7 10.2l4.3.3"/>',
    walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 2.5 2.5V21M8 11.5 11 8l3 1.5 1.5 3M11 8l-1 7M17.5 21 20 9"/>',
    mixed: '<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1.5 3.8-3.3M14 8.5C15 7.5 16 7 17 7h3M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"/>',
    other: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>'
  };

  // Activities: [name, MET, skill split]. A split is { skill: share } adding up to 1.
  const E = { endurance: 1 };
  const TYPES = [
    { id: 'Strength', label: 'Strength', icon: ICON.strength, color: 'var(--pine)', mode: 'sets' },
    { id: 'Running', label: 'Running', icon: ICON.run, color: 'var(--glacier)', mode: 'cardio', main: 'distance',
      picks: [{ k: 'activity', label: 'Run type', options: [['Easy run'], ['Long run'], ['Tempo run'], ['Intervals'], ['Hill sprints', 0, { endurance: 0.7, legs: 0.2, posterior: 0.1 }], ['Parkrun'], ['Treadmill run'], ['Trail run', 0, { endurance: 0.85, legs: 0.15 }], ['Race']] }],
      fields: [{ k: 'distance', label: 'Distance (km)', step: 0.01 }, { k: 'runMinutes', label: 'Run time (min)', step: 0.1 }] },
    { id: 'Cycling', label: 'Cycling', icon: ICON.bike, color: '#4f8fb3', mode: 'cardio', main: 'moveMinutes', split: { endurance: 0.7, legs: 0.3 },
      picks: [{ k: 'activity', label: 'Ride type', options: [['Road ride', 'speed'], ['Mountain bike', 8.5], ['Spin class', 8.5], ['Stationary bike', 7], ['Indoor trainer', 8], ['Commute', 6]] }],
      fields: [{ k: 'distance', label: 'Distance (km)', step: 0.1, opt: true }, { k: 'moveMinutes', label: 'Ride time (min)' }, { k: 'elevation', label: 'Climbing (m)', opt: true }] },
    { id: 'Swimming', label: 'Swimming', icon: ICON.swim, color: '#3f9fb5', mode: 'cardio', main: 'moveMinutes', split: { endurance: 0.6, shoulders: 0.15, back: 0.15, core: 0.1 },
      picks: [{ k: 'activity', label: 'Stroke', options: [['Front crawl', 8.3], ['Breaststroke', 5.3], ['Backstroke', 4.8], ['Butterfly', 13.8], ['Mixed strokes', 7], ['Open water', 8]] }],
      fields: [{ k: 'metres', label: 'Distance (m)', step: 25, opt: true }, { k: 'moveMinutes', label: 'Swim time (min)' }] },
    { id: 'Cardio', label: 'Cardio machines', short: 'Cardio', icon: ICON.machine, color: '#6a8f7c', mode: 'cardio', main: 'moveMinutes',
      picks: [{ k: 'activity', label: 'Machine', options: [['Rowing machine', 7, { endurance: 0.6, back: 0.2, legs: 0.2 }], ['Cross-trainer', 5, { endurance: 0.75, legs: 0.25 }],
        ['Stair climber', 9, { endurance: 0.6, legs: 0.25, posterior: 0.15 }], ['Ski erg', 7, { endurance: 0.6, back: 0.2, arms: 0.1, core: 0.1 }],
        ['Assault bike', 10, { endurance: 0.7, legs: 0.2, arms: 0.1 }], ['Incline walk', 6, { endurance: 0.6, legs: 0.25, posterior: 0.15 }]] }],
      fields: [{ k: 'moveMinutes', label: 'Time (min)' }, { k: 'distance', label: 'Distance (km)', step: 0.1, opt: true }, { k: 'calories', label: 'Calories', opt: true }] },
    { id: 'HIIT', label: 'HIIT & circuits', short: 'HIIT', icon: ICON.hiit, color: '#d0743c', mode: 'cardio', main: 'rounds',
      picks: [{ k: 'activity', label: 'Format', options: [['Circuit', 8], ['Tabata', 9], ['EMOM', 8], ['AMRAP', 8.5], ['Bootcamp class', 8], ['Kettlebell circuit', 9], ['CrossFit WOD', 9]] },
        { k: 'moves', label: 'Movements', multi: true, options: [['Burpees', 0, { chest: 0.5, legs: 0.5 }], ['Kettlebell swings', 0, { posterior: 1 }], ['Battle ropes', 0, { shoulders: 0.5, arms: 0.5 }],
          ['Box jumps', 0, { legs: 1 }], ['Mountain climbers', 0, { core: 1 }], ['Jumping jacks', 0, E], ['Thrusters', 0, { legs: 0.5, shoulders: 0.5 }], ['Wall balls', 0, { legs: 0.6, shoulders: 0.4 }],
          ['Sprints', 0, { legs: 0.6, endurance: 0.4 }], ['Squat jumps', 0, { legs: 1 }], ['Push-ups', 0, { chest: 1 }], ['Sit-ups', 0, { core: 1 }]] }],
      fields: [{ k: 'rounds', label: 'Rounds', opt: true }, { k: 'workSec', label: 'Work (sec)', def: 40, opt: true }, { k: 'restSec', label: 'Rest (sec)', def: 20, opt: true }] },
    { id: 'Boxing', label: 'Boxing & combat', short: 'Combat', icon: ICON.boxing, color: 'var(--amber)', mode: 'cardio', main: 'rounds',
      picks: [{ k: 'activity', label: 'Style', options: [['Heavy bag', 0, 'strike'], ['Pad work', 0, 'strike'], ['Shadow boxing', 0, 'strike'], ['Sparring', 0, 'strike'], ['Skipping', 0, { endurance: 0.6, boxing: 0.25, legs: 0.15 }],
        ['Kickboxing', 0, 'strike'], ['Muay Thai', 0, 'strike'], ['MMA class', 0, 'strike'], ['BJJ', 0, 'grapple'], ['Wrestling', 0, 'grapple'], ['Judo', 0, 'grapple']] }],
      fields: [{ k: 'rounds', label: 'Rounds' }, { k: 'roundLength', label: 'Round length (min)', step: 0.5, def: 3 }] },
    { id: 'Calisthenics', label: 'Calisthenics', icon: ICON.cali, color: '#7c6fb0', mode: 'sets' },
    { id: 'Mobility', label: 'Mobility & yoga', short: 'Mobility', icon: ICON.mobility, color: 'var(--lichen)', mode: 'cardio', main: 'moveMinutes',
      picks: [{ k: 'activities', label: 'What you did', multi: true, options: [['Yoga class', 0, { mobility: 0.85, core: 0.15 }], ['Stretching'], ['Foam rolling'], ['Hip mobility flow'], ['Pilates', 0, { mobility: 0.6, core: 0.4 }], ['Cool-down'], ['Breathwork']] }],
      fields: [{ k: 'moveMinutes', label: 'Minutes', opt: true }] },
    { id: 'Sports', label: 'Sports', icon: ICON.sports, color: '#4a9b6e', mode: 'cardio', main: 'moveMinutes',
      picks: [{ k: 'activity', label: 'Sport', options: [['Football', 7, { endurance: 0.55, legs: 0.35, core: 0.1 }], ['Five-a-side', 8, { endurance: 0.55, legs: 0.35, core: 0.1 }],
        ['Basketball', 6.5, { endurance: 0.5, legs: 0.35, core: 0.15 }], ['Tennis', 7.3, 'racket'], ['Padel', 6, 'racket'], ['Squash', 9, 'racket'], ['Badminton', 5.5, 'racket'],
        ['Climbing', 5.8, { back: 0.35, arms: 0.3, core: 0.15, shoulders: 0.1, mobility: 0.1 }], ['Golf', 4.8, { endurance: 0.5, core: 0.25, mobility: 0.25 }],
        ['Rugby', 8.3, { endurance: 0.4, legs: 0.25, core: 0.15, shoulders: 0.1, back: 0.1 }], ['Cricket', 4.8, { endurance: 0.5, shoulders: 0.2, core: 0.15, legs: 0.15 }],
        ['Hockey', 8, { endurance: 0.55, legs: 0.3, core: 0.15 }], ['Netball', 6.5, { endurance: 0.55, legs: 0.35, core: 0.1 }], ['Volleyball', 4, { endurance: 0.45, legs: 0.3, shoulders: 0.25 }]] }],
      fields: [{ k: 'moveMinutes', label: 'Time playing (min)' }] },
    { id: 'Walking', label: 'Walking & hiking', short: 'Walking', icon: ICON.walk, color: '#8a9a5b', mode: 'cardio', main: 'moveMinutes', split: { endurance: 0.65, legs: 0.25, posterior: 0.1 },
      picks: [{ k: 'activity', label: 'Type', options: [['Walk', 'walk'], ['Hike', 5.3], ['Hill walk', 5.5], ['Rucking', 'ruck']] }],
      fields: [{ k: 'distance', label: 'Distance (km)', step: 0.1, opt: true }, { k: 'moveMinutes', label: 'Time (min)' }, { k: 'elevation', label: 'Climbing (m)', opt: true },
        { k: 'packKg', label: 'Pack (kg)', opt: true, only: 'Rucking' }, { k: 'steps', label: 'Steps', opt: true }] },
    { id: 'Mixed', label: 'Mixed', icon: ICON.mixed, color: 'var(--moss)', mode: 'sets' },
    { id: 'Other', label: 'Other', icon: ICON.other, color: 'var(--stone)', mode: 'sets' }
  ];
  const SPLITS = {
    strike: { boxing: 0.8, endurance: 0.1, shoulders: 0.1 },
    grapple: { boxing: 0.7, core: 0.15, back: 0.15 },
    racket: { endurance: 0.55, legs: 0.25, shoulders: 0.1, arms: 0.1 }
  };
  const byId = Object.fromEntries(TYPES.map(t => [t.id, t]));
  const typeDef = id => byId[id] || byId.Other;
  const optionOf = (t, k, name) => t.picks?.find(p => p.k === k)?.options.find(o => o[0] === name);
  const num = v => (Number.isFinite(+v) ? +v : 0);
  const fields = (t, w) => (t.fields || []).filter(f => !f.only || w.activity === f.only);

  // Minutes of actual work in a workout of a newer type.
  function activeMinutes(w) {
    const t = typeDef(w.type), dur = num(w.duration);
    if (t.id === 'Running') return num(w.runMinutes) || dur;
    if (t.id === 'HIIT') return num(w.rounds) ? num(w.rounds) * (num(w.workSec) || 40) / 60 : dur * 0.7;
    if (t.id === 'Boxing') return num(w.rounds) * num(w.roundLength) || dur;
    if (t.id === 'Walking' && !num(w.moveMinutes) && !dur && num(w.steps)) return num(w.steps) / 100;
    return num(w.moveMinutes) || dur;
  }
  // MET for the activity done (see top of file).
  function metOf(w) {
    const t = typeDef(w.type), opt = optionOf(t, 'activity', w.activity), m = opt?.[1];
    const mins = activeMinutes(w);
    if (m === 'speed') { const v = mins ? num(w.distance) / (mins / 60) : 0; return v >= 30.6 ? 12 : v >= 25.7 ? 10 : v >= 22.5 ? 8 : v >= 19.3 ? 6.8 : v >= 16 ? 5.8 : v > 0 ? 4 : 7; }
    if (m === 'walk') { const v = mins ? num(w.distance) / (mins / 60) : 0; return v >= 6.4 ? 5 : v >= 5.6 ? 4.3 : v >= 4.8 ? 3.5 : v > 0 ? 3 : 3.5; }
    if (m === 'ruck') return 6.5 + Math.min(4, num(w.packKg) * 0.08);
    if (typeof m === 'number' && m > 0) return m;
    return { Cycling: 7.5, Swimming: 7, Cardio: 7, HIIT: 8, Sports: 7, Walking: 3.5 }[t.id] || 6;
  }
  const effortFactor = w => (num(w.effort) ? 0.8 + Math.max(1, Math.min(10, num(w.effort))) * 0.04 : 1);
  function splitFor(w) {
    const t = typeDef(w.type), opt = optionOf(t, 'activity', w.activity);
    const s = opt?.[2]; return typeof s === 'string' ? SPLITS[s] : s || t.split || E;
  }

  // Skill XP from the type itself (sets-based exercises are handled separately in rpg.js). add(skill, xp).
  function typeSkillXp(w, add) {
    const t = typeDef(w.type), mins = num(w.duration);
    const share = (total, split) => { for (const [k, v] of Object.entries(split)) add(k, total * v); };
    if (t.id === 'Running') { share(num(w.distance) * 60 + (num(w.runMinutes) || mins) * 2, w.activity ? splitFor(w) : E); return; }
    if (t.id === 'Boxing') { share(num(w.rounds) * 25 + mins * 1.5, w.activity ? splitFor(w) : { boxing: 1 }); return; }
    if (t.id === 'Mobility') {
      const total = (num(w.moveMinutes) || mins) * 4, acts = (w.activities || []).map(a => optionOf(t, 'activities', a)).filter(Boolean);
      if (!acts.length) return share(total, { mobility: 1 });
      acts.forEach(o => share(total / acts.length, o[2] || { mobility: 1 })); return;
    }
    if (['Mixed', 'Other'].includes(t.id)) { if (!(w.exercises || []).length) add('endurance', mins * 2); return; }
    if (t.mode !== 'cardio') return;
    const active = activeMinutes(w), f = effortFactor(w);
    let total = active * metOf(w) * 1.2 * f;
    if (t.id === 'HIIT') {
      const restMin = num(w.rounds) ? num(w.rounds) * (num(w.restSec) || 20) / 60 : mins * 0.3;
      total += restMin * 4 * 1.2;
      const moves = (w.moves || []).map(m => optionOf(t, 'moves', m)).filter(Boolean);
      share(total * 0.5, E); share(total * 0.15, { core: 1 });
      if (moves.length) moves.forEach(o => share(total * 0.35 / moves.length, o[2])); else share(total * 0.35, { legs: 0.6, core: 0.4 });
      return;
    }
    share(total, splitFor(w));
    if (['Cycling', 'Walking'].includes(t.id) && num(w.elevation) > 0) add('legs', Math.min(1500, num(w.elevation)) * 0.4); // climbing bonus
  }

  // One-line description of a workout's type details, e.g. "Road ride · 32 km · 75 min · 25.6 km/h".
  function summary(w) {
    const t = typeDef(w.type), bits = [];
    const act = w.activity || (w.activities || []).join(', ');
    if (act) bits.push(act);
    const mins = activeMinutes(w);
    if (t.id === 'Running' && num(w.distance)) { bits.push(`${num(w.distance).toFixed(1)} km`, `${Math.round(num(w.runMinutes) || num(w.duration))} min`); const p = (num(w.runMinutes) || num(w.duration)) / num(w.distance); if (p) bits.push(`${Math.floor(p)}:${String(Math.round((p % 1) * 60)).padStart(2, '0')} /km`); }
    else if (t.id === 'Boxing' && (num(w.rounds) || num(w.roundLength))) bits.push(`${num(w.rounds)} rounds × ${num(w.roundLength)} min`);
    else if (t.id === 'HIIT' && num(w.rounds)) bits.push(`${num(w.rounds)} rounds, ${num(w.workSec) || 40}s on / ${num(w.restSec) || 20}s off`);
    else if (t.mode === 'cardio' && !['Running', 'Boxing'].includes(t.id)) {
      if (num(w.distance)) bits.push(`${num(w.distance).toFixed(1)} km`);
      if (num(w.metres)) bits.push(`${Math.round(num(w.metres))} m`);
      if (num(w.moveMinutes)) bits.push(`${Math.round(num(w.moveMinutes))} min`);
      if (num(w.distance) && num(w.moveMinutes) && t.id === 'Cycling') bits.push(`${(num(w.distance) / (num(w.moveMinutes) / 60)).toFixed(1)} km/h`);
      if (num(w.elevation)) bits.push(`${Math.round(num(w.elevation))} m climbing`);
      if (num(w.calories)) bits.push(`${Math.round(num(w.calories))} kcal`);
      if (num(w.steps)) bits.push(`${Math.round(num(w.steps)).toLocaleString('en-GB')} steps`);
    }
    if (t.id === 'HIIT' && (w.moves || []).length) bits.push(w.moves.join(', '));
    return bits.join(' · ');
  }

  // How much of each body part a calisthenics move lifts, as a share of bodyweight.
  const BODYWEIGHT_LOAD = {
    'pull-up': 1, 'chin-up': 1, 'neutral-grip pull-up': 1, 'wide-grip pull-up': 1, 'muscle-up': 1, 'dip': 0.95, 'handstand push-up': 0.9,
    'pike push-up': 0.6, 'push-up': 0.65, 'archer push-up': 0.75, 'diamond push-up': 0.65, 'decline push-up': 0.7, 'incline push-up': 0.45,
    'inverted row': 0.55, 'pistol squat': 0.85, 'bodyweight squat': 0.6, 'nordic curl': 0.6, 'toes-to-bar': 0.35, 'hanging leg raise': 0.3, 'dragon flag': 0.45
  };

  const api = { TYPES, typeDef, activeMinutes, metOf, effortFactor, splitFor, typeSkillXp, summary, fields, BODYWEIGHT_LOAD, ICON };
  if (typeof window !== 'undefined') window.WORKOUT_TYPES = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
