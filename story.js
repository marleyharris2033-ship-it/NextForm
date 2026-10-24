// NextForm monthly story quests: a new four-chapter quest line every month. Each chapter has a goal from
// a different part of your training (sessions, cardio, food logging, records...), unlocks in order and pays
// bonus XP. Goals scale with your weekly goal, and everything counts from the 1st of the month.
(() => {
  const ENDURANCE = new Set(['Running', 'Cycling', 'Swimming', 'Cardio', 'HIIT', 'Walking']);
  const REWARDS = [150, 200, 250, 400];
  // Metric labels: [short noun, how to phrase a target]
  const METRICS = {
    workouts: n => n === 1 ? 'Train once' : `Train ${n} times`, strength: n => `Do ${n} strength sessions`, cardioMin: n => `Do ${n} minutes of cardio`,
    activeDays: n => `Be active on ${n} different days`, foodDays: n => `Log your food on ${n} days`, weighIns: n => `Weigh in ${n} times`,
    pbs: n => n === 1 ? 'Set a new personal best' : `Set ${n} new personal bests`, types: n => `Try ${n} different kinds of workout`,
    mobility: n => n === 1 ? 'Do a mobility or yoga session' : `Do ${n} mobility or yoga sessions`, volume: n => `Lift ${n >= 1000 ? `${Math.round(n / 1000)} tonnes` : `${n} kg`} in total`,
    minutes: n => `Train for ${Math.round(n / 60)} hours in total`
  };
  // g = your weekly session goal (1–7). Targets are for the whole month so far.
  const THEMES = [
    { name: 'The Mountain Pass', intro: 'A pass through the high peaks opens once a year. Only the steady make it over.', ch: [
      ['Base camp', 'Pack your bag and find your rhythm.', g => [['workouts', g]]],
      ['The foothills', 'The path climbs. Your lungs learn the way.', g => [['cardioMin', 60]]],
      ['Supplies', 'No climber goes far on an empty pack.', g => [['foodDays', 7]]],
      ['The summit', 'The wind drops. The whole valley is yours.', g => [['workouts', 3 * g], ['pbs', 1]]]] },
    { name: 'The Iron Forge', intro: 'The old smith only teaches those who come back, day after day.', ch: [
      ['Light the fire', 'Every forge starts with one spark.', g => [['strength', Math.max(2, g - 1)]]],
      ['Heat the metal', 'Weight on the bar, again and again.', g => [['volume', 10000]]],
      ['Temper the blade', 'Strength needs patience to hold its edge.', g => [['activeDays', 2 * g]]],
      ['Master’s mark', 'The smith nods. Your name goes on the wall.', g => [['pbs', 2], ['strength', 3 * g - 2]]]] },
    { name: 'The River Run', intro: 'The river runs from the hills to the sea. Follow it all the way down.', ch: [
      ['The spring', 'Small beginnings. Keep moving.', g => [['cardioMin', 45]]],
      ['Rapids', 'Faster water. Hold your line.', g => [['workouts', 2 * g]]],
      ['The weir', 'Time to check your bearings.', g => [['weighIns', 4]]],
      ['Open sea', 'The horizon opens. You made it.', g => [['cardioMin', 180], ['activeDays', 3 * g]]]] },
    { name: 'The Lantern Festival', intro: 'Each night a lantern is lit for every promise kept.', ch: [
      ['First lantern', 'One promise, kept.', g => [['activeDays', g]]],
      ['A street of light', 'Variety makes the brightest festivals.', g => [['types', 2]]],
      ['The feast', 'Good food, shared and counted.', g => [['foodDays', 10]]],
      ['The sky lights up', 'A thousand lanterns. All of them yours.', g => [['workouts', 3 * g], ['types', 3]]]] },
    { name: 'The Tide Keeper', intro: 'The keeper of the lighthouse needs a steady hand through stormy weeks.', ch: [
      ['Climb the stairs', 'Two hundred steps to the lamp room.', g => [['workouts', g]]],
      ['Trim the wick', 'Look after the light, look after yourself.', g => [['mobility', 2]]],
      ['Storm watch', 'The storm tests everyone. Keep the light on.', g => [['activeDays', 2 * g + 1]]],
      ['Calm water', 'Morning comes. Every ship got home.', g => [['minutes', 60 * 2 * g + 120]]]] },
    { name: 'The Dragon’s Hoard', intro: 'A sleeping dragon guards a hoard. It wakes for the strong.', ch: [
      ['The cave mouth', 'The air is warm. Something stirs.', g => [['strength', g]]],
      ['Gold underfoot', 'Every kilo lifted is a coin in your pocket.', g => [['volume', 15000]]],
      ['Dragon fire', 'Heat and speed. Get your heart going.', g => [['cardioMin', 60]]],
      ['The hoard', 'The dragon bows. The treasure is yours.', g => [['pbs', 2], ['volume', 30000]]]] },
    { name: 'The Long Road', intro: 'The road to the capital is long, but every mile counts.', ch: [
      ['The first mile', 'Shoes on. Out of the door.', g => [['workouts', g]]],
      ['Waystation', 'Rest, eat, write it down.', g => [['foodDays', 5], ['weighIns', 2]]],
      ['The crossroads', 'Try a new path.', g => [['types', 2]]],
      ['City gates', 'Trumpets. You’ve arrived.', g => [['workouts', 3 * g + 1]]]] },
    { name: 'The Starlit Arena', intro: 'Champions are made in the arena under the stars.', ch: [
      ['Sign up', 'Your name on the board.', g => [['workouts', g]]],
      ['Sparring', 'Push hard. Learn fast.', g => [['minutes', 240]]],
      ['Training camp', 'Fuel like a champion.', g => [['foodDays', 8]]],
      ['Title fight', 'The crowd is on its feet.', g => [['pbs', 1], ['activeDays', 3 * g]]]] },
    { name: 'The Winter Keep', intro: 'The castle must be ready before the snow. Every day of work counts.', ch: [
      ['Gather wood', 'Small loads, often.', g => [['activeDays', g + 1]]],
      ['Build the walls', 'Heavy stones. Strong backs.', g => [['strength', 2 * g - 1]]],
      ['Stock the larder', 'Count what comes in.', g => [['foodDays', 10]]],
      ['First snow', 'Fires lit, walls high. Ready.', g => [['workouts', 3 * g], ['weighIns', 4]]]] },
    { name: 'The Sky Garden', intro: 'A garden floats above the clouds. It grows with care, not force.', ch: [
      ['Plant the seeds', 'Begin gently.', g => [['workouts', g]]],
      ['Stretch to the sun', 'Bend, breathe, grow.', g => [['mobility', 2]]],
      ['Water daily', 'Little and often.', g => [['activeDays', 2 * g]]],
      ['Full bloom', 'Look how far it’s grown.', g => [['minutes', 60 * 3 * g], ['types', 3]]]] },
    { name: 'The Lost Map', intro: 'An old map shows four landmarks. Find them all before the month is out.', ch: [
      ['The old oak', 'Start where the map starts.', g => [['workouts', g]]],
      ['The stone bridge', 'Cross it at a run.', g => [['cardioMin', 60]]],
      ['The watchtower', 'From up here you can see your progress.', g => [['weighIns', 3]]],
      ['X marks the spot', 'Dig. There it is.', g => [['pbs', 1], ['workouts', 3 * g]]]] },
    { name: 'The Midwinter Trials', intro: 'At year’s end the trials ask one thing: did you keep going?', ch: [
      ['Trial of habit', 'Show up.', g => [['activeDays', g + 1]]],
      ['Trial of strength', 'Lift something heavy.', g => [['strength', g]]],
      ['Trial of care', 'Feed yourself well.', g => [['foodDays', 7]]],
      ['Trial of will', 'Finish the year strong.', g => [['workouts', 3 * g], ['minutes', 60 * 3 * g]]]] }
  ];

  const monthKey = (ds = today()) => String(ds).slice(0, 7);
  const themeFor = key => { const [y, m] = key.split('-').map(Number); return THEMES[(y * 12 + m - 1) % THEMES.length]; };
  const weekGoalOf = () => { const g = +data.profile?.weekGoal; return g >= 1 && g <= 7 ? Math.round(g) : 3; };

  function metrics(key) {
    const ws = (data.workouts || []).filter(w => String(w.date).startsWith(key));
    const sets = w => WORKOUT_TYPES.typeDef(w.type).mode === 'sets';
    const before = new Map();
    for (const w of data.workouts || []) if (String(w.date) < key) for (const e of w.exercises || []) if (e.unit !== 's') for (const s of setsOf(e)) { const k = e.name.toLowerCase(); before.set(k, Math.max(before.get(k) || 0, e1rm(+s.kg || 0, +s.reps || 0))); }
    const best = new Map();
    for (const w of ws) for (const e of w.exercises || []) if (e.unit !== 's') for (const s of setsOf(e)) { if (!+s.kg) continue; const k = e.name.toLowerCase(); best.set(k, Math.max(best.get(k) || 0, e1rm(+s.kg, +s.reps || 0))); }
    let pbs = 0; for (const [k, v] of best) if (before.has(k) && v > before.get(k) + 0.01) pbs++;
    return {
      workouts: ws.length, strength: ws.filter(sets).length,
      cardioMin: ws.filter(w => ENDURANCE.has(w.type)).reduce((a, w) => a + (+w.duration || 0), 0),
      activeDays: new Set(ws.map(w => w.date)).size,
      foodDays: new Set((data.foodLog || []).filter(e => String(e.date).startsWith(key)).map(e => e.date)).size,
      weighIns: (data.weights || []).filter(w => String(w.date).startsWith(key)).length,
      pbs, types: new Set(ws.map(w => w.type)).size, mobility: ws.filter(w => w.type === 'Mobility').length,
      volume: Math.round(ws.reduce((a, w) => a + (w.exercises || []).reduce((b, e) => b + (e.unit === 's' ? 0 : setsOf(e).reduce((c, s) => c + (+s.kg || 0) * (+s.reps || 0), 0)), 0), 0)),
      minutes: ws.reduce((a, w) => a + (+w.duration || 0), 0)
    };
  }
  const log = () => (data.storyLog = Array.isArray(data.storyLog) ? data.storyLog : []);
  const claimed = (key, i) => log().some(x => x.id === `${key}-c${i + 1}`);

  function state(key = monthKey()) {
    const th = themeFor(key), g = weekGoalOf(), m = metrics(key);
    const chapters = th.ch.map(([title, text, fn], i) => {
      const goals = fn(g).map(([k, n]) => ({ k, n, have: Math.min(m[k], n), label: METRICS[k](n) }));
      const pct = goals.reduce((a, x) => a + x.have / x.n, 0) / goals.length;
      return { i, title, text, goals, pct, done: goals.every(x => m[x.k] >= x.n), claimed: claimed(key, i), xp: REWARDS[i] };
    });
    chapters.forEach((c, i) => { c.unlocked = i === 0 || chapters[i - 1].claimed; });
    const d = new Date(today() + 'T12:00:00'), end = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return { key, theme: th, chapters, daysLeft: end - d.getDate() + 1, current: chapters.find(c => !c.claimed) || null };
  }
  function claim(i) {
    const s = state(), c = s.chapters[i]; if (!c || !c.done || c.claimed || !c.unlocked) return;
    log().push({ id: `${s.key}-c${i + 1}`, xp: c.xp, t: Date.now() });
    data.xp = (+data.xp || 0) + c.xp;
    save();
    const last = i === s.chapters.length - 1;
    showToast(last ? `Quest complete: ${s.theme.name}! +${c.xp} XP` : `Chapter ${i + 1} complete. +${c.xp} XP. Chapter ${i + 2} unlocked.`);
  }
  function showToast(text) {
    let t = $('#storyToast'); if (!t) { t = document.createElement('div'); t.id = 'storyToast'; t.className = 'foodToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200);
  }

  const goalLine = x => `<li class="${x.have >= x.n ? 'met' : ''}"><span>${esc(x.label)}</span><b>${x.k === 'volume' ? `${fmt(x.have)} / ${fmt(x.n)} kg` : x.k === 'minutes' || x.k === 'cardioMin' ? `${x.have} / ${x.n} min` : `${x.have} / ${x.n}`}</b></li>`;
  function render() {
    const box = $('#storyCard'), prev = $('#storyPreview');
    if (!box && !prev) return;
    const s = state(), done = s.chapters.filter(c => c.claimed).length;
    const head = `<p class="storyKicker">${new Date(today() + 'T12:00:00').toLocaleDateString('en-GB', { month: 'long' })} story quest · ${s.daysLeft} day${s.daysLeft === 1 ? '' : 's'} left</p><h2>${esc(s.theme.name)}</h2>`;
    if (box) box.innerHTML = `${head}<p class="storyIntro">${esc(s.theme.intro)}</p>
      <div class="storyTrack" aria-label="${done} of 4 chapters complete">${s.chapters.map(c => `<i class="${c.claimed ? 'done' : c.unlocked ? 'now' : ''}"></i>`).join('')}</div>
      ${s.chapters.map(c => !c.unlocked ? `<div class="chapter locked"><span class="chNum">${c.i + 1}</span><div><b>Chapter ${c.i + 1}</b><small>Finish chapter ${c.i} to reveal</small></div></div>`
        : `<div class="chapter${c.claimed ? ' claimed' : ''}"><span class="chNum">${c.claimed ? '✓' : c.i + 1}</span><div class="chBody"><b>${esc(c.title)}</b><p class="chText">${esc(c.text)}</p>
          ${c.claimed ? `<small class="chDone">Complete, +${c.xp} XP</small>` : `<ul class="chGoals">${c.goals.map(goalLine).join('')}</ul>
          ${c.done ? `<button type="button" class="primary full" data-story-claim="${c.i}">Claim +${c.xp} XP</button>` : `<div class="tinybar"><i style="width:${Math.round(c.pct * 100)}%"></i></div><small class="muted">Reward: ${c.xp} XP</small>`}`}</div></div>`).join('')}
      ${done === 4 ? `<p class="storyEnd">Quest complete. A new story starts on the 1st.</p>` : ''}`;
    if (prev) {
      const c = s.current;
      prev.innerHTML = `<button type="button" class="storyPrev" data-story-open><span class="storyPrevIcon" aria-hidden="true">${done === 4 ? '★' : (c?.i ?? 0) + 1}</span><span><small>${esc(s.theme.name)}</small><b>${c ? (c.done ? `Chapter ${c.i + 1} ready to claim` : `Chapter ${c.i + 1}: ${esc(c.title)}`) : 'Quest complete'}</b>${c && !c.done ? `<span class="tinybar"><i style="width:${Math.round(c.pct * 100)}%"></i></span>` : ''}</span></button>`;
    }
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-story-claim]'); if (b) claim(+b.dataset.storyClaim); if (e.target.closest('[data-story-open]')) go('challenges'); });
  window.NextFormStory = { state, metrics, claim, render, THEMES, themeFor };
  render();
})();
