// NextForm character: gear unlocked by real progress, the builder sheet, and the character
// shown on Home, in the header, on Profile and on the reward screen.
// Uses globals from app.js (data, save, $, $$, esc, levelInfo, rankFor, bestStreak),
// rpg.js (characterFrom) and avatar.js (renderAvatar, AVATAR_OPTIONS, AVATAR_DEFAULT).
(() => {
  const GEAR = [
    { id: 'headband', name: 'Headband', need: 'Reach level 10', progress: s => [s.level, 10] },
    { id: 'medal', name: 'Finisher’s medal', need: 'Log a 5 km run', progress: s => [s.longestRun, 5, 'km'] },
    { id: 'gloves', name: 'Boxing gloves', need: 'Reach Boxing skill 10', progress: s => [s.skill.boxing, 10] },
    { id: 'cape', name: 'Summit cape', need: 'Hit a 14-day streak', progress: s => [s.bestStreak, 14, 'days'] },
    { id: 'belt', name: 'Lifting belt', need: 'Reach Legs skill 20', progress: s => [s.skill.legs, 20] },
    { id: 'crown', name: 'Crown', need: 'Reach Master rank (level 30)', progress: s => [s.level, 30] }
  ];
  const GEAR_ICONS = {
    headband: '<path d="M4 12c2.5-2 5.2-3 8-3s5.5 1 8 3v3c-2.5-2-5.2-3-8-3s-5.5 1-8 3z"/><path d="M19 13c2 .5 2.8 2 3 4M19 13c2.2-.5 3.6.2 4 1.5"/>',
    medal: '<path d="M8 3l4 7 4-7"/><circle cx="12" cy="15" r="5"/><path d="M10 15l1.5 1.5 3-3"/>',
    gloves: '<path d="M7 20v-3c-1.8-1-2.8-3-2.8-5.6V8.5A3.5 3.5 0 0 1 7.7 5h4.8A3.5 3.5 0 0 1 16 8.5V10h1a2 2 0 0 1 0 4h-1.5L14 17v3z"/><path d="M7 17h7"/>',
    cape: '<path d="M8 4h8l3 16c-2.4 1-4.6 1.4-7 1.4S7.4 21 5 20z"/><path d="M8 4c1 1.3 2.3 2 4 2s3-.7 4-2"/>',
    belt: '<rect x="2.5" y="9" width="19" height="7" rx="2"/><rect x="9" y="8" width="6" height="9" rx="1.5"/>',
    crown: '<path d="M4 18l-1-10 5 4 4-7 4 7 5-4-1 10z"/><path d="M4 21h16"/>'
  };
  const LABELS = {
    face: { oval: 'Oval', round: 'Round', square: 'Square', long: 'Long', heart: 'Heart', diamond: 'Diamond' },
    eyes: { almond: 'Almond', round: 'Round', hooded: 'Hooded', narrow: 'Narrow', wide: 'Wide', downturned: 'Downturned', upturned: 'Upturned' },
    brows: { natural: 'Natural', thin: 'Thin', thick: 'Thick', arched: 'Arched', straight: 'Straight', bushy: 'Bushy', angled: 'Angled' },
    nose: { straight: 'Straight', button: 'Button', wide: 'Wide', roman: 'Roman', small: 'Small', long: 'Long' },
    mouth: { neutral: 'Neutral', smile: 'Smile', grin: 'Grin', full: 'Full lips', thin: 'Thin lips', smirk: 'Smirk' },
    ears: { average: 'Average', small: 'Small', large: 'Large', protruding: 'Protruding' },
    hair: { buzz: 'Buzz', crop: 'Crop', fade: 'Fade', undercut: 'Undercut', sidepart: 'Side part', slickback: 'Slick back', quiff: 'Quiff', messy: 'Messy', hightop: 'High top', receding: 'Receding', curly: 'Curly', afro: 'Afro', afroPuff: 'Afro puff', twists: 'Twists', locs: 'Locs', cornrows: 'Cornrows', mohawk: 'Mohawk', pixie: 'Pixie', bob: 'Bob', lob: 'Lob', shag: 'Shag', long: 'Long', longBangs: 'Long + fringe', sideSwept: 'Side swept', wavy: 'Wavy', wavyBangs: 'Wavy + fringe', curlyLong: 'Long curls', ponytail: 'Ponytail', highPonytail: 'High ponytail', pigtails: 'Pigtails', plaits: 'Plaits', sideBraid: 'Side braid', braids: 'Box braids', bun: 'Top bun', spaceBuns: 'Space buns', bald: 'Bald' },
    beard: { none: 'None', stubble: 'Stubble', heavyStubble: 'Heavy stubble', moustache: 'Moustache', handlebar: 'Handlebar', soulPatch: 'Soul patch', goatee: 'Goatee', vandyke: 'Van Dyke', circle: 'Circle', chinstrap: 'Chinstrap', mutton: 'Mutton chops', short: 'Short', full: 'Full', bushy: 'Bushy', long: 'Long' },
    top: { tee: 'T-shirt', vneck: 'V-neck', polo: 'Polo', shirt: 'Shirt', jersey: 'Jersey', longsleeve: 'Long sleeve', sweater: 'Sweater', tank: 'Tank', stringer: 'Stringer', hoodie: 'Hoodie', zip: 'Zip hoodie', crop: 'Crop top', sportsbra: 'Sports bra' },
    topPattern: { none: 'Plain', stripes: 'Stripes', dots: 'Dots', check: 'Check' },
    bottom: { shortShorts: 'Short shorts', shorts: 'Shorts', longShorts: 'Long shorts', bikeShorts: 'Bike shorts', tennisSkirt: 'Tennis skirt', joggers: 'Joggers', trackpants: 'Track pants', cargos: 'Cargos', jeans: 'Jeans', leggings: 'Leggings', capris: '3/4 tights' },
    socks: { crew: 'White crew', crewBlack: 'Black crew', ankle: 'Ankle', none: 'No-show' },
    hat: { none: 'None', cap: 'Cap', backwardsCap: 'Backwards cap', beanie: 'Beanie', bucket: 'Bucket hat', bandana: 'Bandana', headwrap: 'Head wrap', turban: 'Turban', hijab: 'Hijab' },
    glasses: { none: 'None', round: 'Round', square: 'Square', catEye: 'Cat-eye', aviator: 'Aviator', heart: 'Heart', sport: 'Sport shades' },
    earrings: { none: 'None', stud: 'Studs', hoops: 'Hoops', drops: 'Drops' },
    necklace: { none: 'None', chain: 'Chain', pendant: 'Pendant', pearls: 'Pearls', beads: 'Beads' },
    hairAcc: { none: 'None', flower: 'Flower', clip: 'Clip', bow: 'Bow' },
    tattoo: { none: 'None', band: 'Arm band', rose: 'Rose', script: 'Script', sleeve: 'Sleeve' }
  };
  const SLIDERS = { height: ['Height', 'Shorter', 'Taller'], muscle: ['Muscle', 'Lean', 'Muscular'], shoulders: ['Shoulders', 'Narrow', 'Broad'], waist: ['Waist', 'Slim', 'Wide'], legs: ['Leg length', 'Shorter', 'Longer'] };
  const TOGGLES = { freckles: 'Freckles', mole: 'Beauty mark', smileLines: 'Smile lines', foreheadLines: 'Forehead lines', headphones: 'Headphones', wristbands: 'Wristbands', watch: 'Watch' };
  const TABS = ['Body', 'Face', 'Hair', 'Beard', 'Outfit', 'Extras', 'Gear'];
  const ZOOM = { Face: 'face', Hair: 'face', Beard: 'face', Extras: 'upper' };

  // ---------- state ----------
  const hasCharacter = () => !!(data.profile && data.profile.avatar);
  const config = () => normalizeAvatar(data.profile.avatar || {});
  const frameFor = level => ({ NOVICE: 'novice', BRONZE: 'bronze', SILVER: 'silver', GOLD: 'gold', ELITE: 'elite', MASTER: 'master' })[rankFor(level)] || 'novice';
  const currentFrame = () => frameFor(levelInfo(data.xp).level);

  function stats(d = data) {
    const ch = characterFrom(d.workouts || []);
    return {
      level: levelInfo(d.xp || 0).level,
      skill: Object.fromEntries(ch.skills.map(s => [s.id, s.level])),
      longestRun: Math.max(0, ...(d.workouts || []).map(w => +w.distance || 0)),
      bestStreak: bestStreak()
    };
  }
  function gearState(d = data) {
    const s = stats(d);
    return GEAR.map(g => { const [cur, target, unit] = g.progress(s); return { ...g, cur, target, unit, unlocked: cur >= target }; });
  }
  const unlockedIds = () => gearState().filter(g => g.unlocked).map(g => g.id);

  // Called when a workout is saved: returns gear unlocked for the first time, and puts it on.
  function claimNewGear() {
    const seen = new Set(data.profile.gearSeen || []);
    const fresh = gearState().filter(g => g.unlocked && !seen.has(g.id));
    if (!fresh.length) return [];
    data.profile.gearSeen = [...seen, ...fresh.map(g => g.id)];
    if (hasCharacter()) data.profile.avatar.gear = [...new Set([...(data.profile.avatar.gear || []), ...fresh.map(g => g.id)])];
    return fresh;
  }

  // ---------- rendering helpers ----------
  const cache = new Map();
  function art(cfg, opts) {
    const key = JSON.stringify([cfg, opts]);
    if (!cache.has(key)) { if (cache.size > 160) cache.clear(); cache.set(key, renderAvatar(cfg, opts)); }
    return cache.get(key);
  }
  const gearIcon = id => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${GEAR_ICONS[id] || ''}</svg>`;

  function paintHeader() {
    const btn = $('#avatarBtn'); if (!btn) return;
    btn.style.backgroundImage = ''; btn.classList.remove('hasPhoto');
    btn.classList.add('charBtn');
    btn.innerHTML = art(config(), { id: 'hdr', view: 'bust', frame: currentFrame() });
  }
  function renderCharacter() {
    const cfg = config(), frame = currentFrame();
    const hero = $('#ascentHero');
    if (hero) hero.innerHTML = art(cfg, { id: 'home', view: 'figure', scenery: false });
    const card = $('#characterCard');
    if (card) {
      const gs = gearState(), have = gs.filter(g => g.unlocked).length;
      const ch = characterFrom(data.workouts);
      card.innerHTML = `<div class="charPreview">${art(cfg, { id: 'prof', frame })}</div>
        <div class="charInfo">
          <h2>Your character</h2>
          <p class="charClass">${esc(ch.title)}, ${esc(titleCase(rankFor(levelInfo(data.xp).level)))} rank</p>
          <p class="muted small">${hasCharacter() ? 'Your frame changes colour as you rank up.' : 'Make it look like you, then earn gear as you train.'}</p>
          <div class="gearDots" aria-label="${have} of ${gs.length} gear unlocked">${gs.map(g => `<span class="gearDot${g.unlocked ? ' on' : ''}" title="${esc(g.name)}">${gearIcon(g.id)}</span>`).join('')}</div>
          <p class="tiny muted">${have} of ${gs.length} gear unlocked</p>
          <button type="button" class="primary" id="editCharacter">${hasCharacter() ? 'Edit character' : 'Create character'}</button>
        </div>`;
    }
    const prompt = $('#characterPrompt');
    if (prompt) prompt.innerHTML = hasCharacter() || !data.profile.setupComplete ? '' :
      `<button type="button" class="charPrompt" id="charPromptBtn"><span class="charPromptArt">${art(cfg, { id: 'prompt', view: 'bust', frame })}</span><span><b>Create your character</b><small>Design how you look, then unlock gear as you train.</small></span><span class="resumeGo">Start</span></button>`;
    paintHeader();
  }

  // ---------- builder ----------
  let draft = null, tab = 'Body', firstTime = false;
  function openBuilder({ first = false } = {}) {
    draft = config();
    if (!hasCharacter()) draft.gear = unlockedIds(); // show off what you've already earned
    firstTime = first || !hasCharacter();
    tab = 'Body';
    $('#charSheet').classList.remove('hidden'); document.body.classList.add('sheetOpen');
    $('#charSheetTitle').textContent = firstTime ? 'Create your character' : 'Edit character';
    renderBuilder();
  }
  function closeBuilder() { $('#charSheet').classList.add('hidden'); document.body.classList.remove('sheetOpen'); draft = null; }
  const group = (label, inner, extra = '') => `<div class="optGroup"><div class="optHead"><p class="optLabel">${label}</p>${extra}</div>${inner}</div>`;
  const swatches = (key, label, extraBtn = '') => {
    const preset = AVATAR_OPTIONS[{ beardColor: 'hairColor', hatColor: 'topColor' }[key] || key], cur = draft[key], custom = !preset.includes(cur);
    return group(label, `<div class="swatches" role="radiogroup" aria-label="${label}">${extraBtn}${preset.map((v, i) =>
      `<button type="button" class="swatch${cur === v ? ' on' : ''}" style="--sw:${v}" data-key="${key}" data-val="${v}" role="radio" aria-checked="${cur === v}" aria-label="${label} ${i + 1}"></button>`).join('')}
      <label class="swatch custom${custom ? ' on' : ''}" style="${custom ? `--sw:${cur}` : ''}" title="Custom colour"><input type="color" value="${cur}" data-color="${key}" aria-label="Custom ${label.toLowerCase()}"><span aria-hidden="true">${custom ? '' : '+'}</span></label></div>`);
  };
  const chips = (key, label) => group(label, `<div class="optChips" role="radiogroup" aria-label="${label}">${AVATAR_OPTIONS[key].map(v =>
    `<button type="button" class="chip${draft[key] === v ? ' active' : ''}" data-key="${key}" data-val="${v}" role="radio" aria-checked="${draft[key] === v}">${LABELS[key][v]}</button>`).join('')}</div>`);
  // Picture options: each choice is drawn on your own character.
  const thumbs = (key, label, view = 'face', cls = '') => group(label, `<div class="thumbGrid ${cls}" role="radiogroup" aria-label="${label}">${AVATAR_OPTIONS[key].map(v =>
    `<button type="button" class="thumb${draft[key] === v ? ' on' : ''}" data-key="${key}" data-val="${v}" role="radio" aria-checked="${draft[key] === v}"><span class="thumbArt">${art({ ...draft, [key]: v, gear: [] }, { id: `th-${key}-${v}`, view, scenery: view === 'face', lite: true })}</span><span class="thumbLabel">${LABELS[key][v]}</span></button>`).join('')}</div>`);
  const slider = key => { const [l, lo, hi] = SLIDERS[key]; return `<div class="sliderRow"><div class="optHead"><p class="optLabel">${l}</p></div><input type="range" min="0" max="100" value="${Math.round(draft[key] * 100)}" data-slider="${key}" aria-label="${l}"><div class="sliderEnds"><span>${lo}</span><span>${hi}</span></div></div>`; };
  const toggles = (keys, label) => group(label, `<div class="optChips">${keys.map(k => `<button type="button" class="chip toggle${draft[k] ? ' active' : ''}" data-toggle="${k}" aria-pressed="${!!draft[k]}">${TOGGLES[k]}</button>`).join('')}</div>`);

  function renderStage() {
    const zoom = ZOOM[tab], stage = $('#charStage');
    stage.classList.toggle('zoomed', !!zoom);
    stage.classList.toggle('upper', zoom === 'upper');
    stage.innerHTML = art(draft, { id: 'bld', frame: currentFrame(), view: zoom || 'full' });
  }
  function renderBuilder() {
    if (!draft) return;
    renderStage();
    $('#charTabs').innerHTML = TABS.map(t => `<button type="button" class="chip${t === tab ? ' active' : ''}" data-tab="${t}" role="tab" aria-selected="${t === tab}">${t}</button>`).join('');
    let h = '';
    if (tab === 'Body') h = swatches('skin', 'Skin tone') + Object.keys(SLIDERS).map(slider).join('');
    if (tab === 'Face') h = thumbs('face', 'Face shape') + thumbs('eyes', 'Eyes', 'eyes', 'wide') + swatches('eyeColor', 'Eye colour') + thumbs('brows', 'Eyebrows', 'brows', 'wide')
      + thumbs('nose', 'Nose', 'nose', 'tall') + thumbs('mouth', 'Mouth', 'mouth', 'wide') + thumbs('ears', 'Ears') + toggles(['freckles', 'mole', 'smileLines', 'foreheadLines'], 'Details');
    if (tab === 'Hair') h = swatches('hairColor', 'Hair colour') + thumbs('hair', 'Style') + thumbs('hairAcc', 'Hair accessory');
    if (tab === 'Beard') h = swatches('beardColor', 'Beard colour', `<button type="button" class="chip matchHair" data-match="1">Match hair</button>`) + thumbs('beard', 'Style');
    if (tab === 'Outfit') h = chips('top', 'Top') + swatches('topColor', 'Top colour') + chips('topPattern', 'Pattern') + chips('bottom', 'Bottoms') + swatches('bottomColor', 'Bottoms colour') + swatches('shoes', 'Trainers') + chips('socks', 'Socks');
    if (tab === 'Extras') h = thumbs('hat', 'Headwear') + swatches('hatColor', 'Headwear and accessory colour') + thumbs('glasses', 'Glasses') + thumbs('earrings', 'Earrings') + thumbs('necklace', 'Necklace', 'neck', 'wide') + toggles(['headphones', 'wristbands', 'watch'], 'Accessories') + chips('tattoo', 'Tattoo');
    if (tab === 'Gear') h = `<p class="muted small gearIntro">Gear is earned by training. Tap unlocked gear to wear it or take it off.</p><div class="gearList">${gearState().map(g => {
      const on = draft.gear.includes(g.id), pct = Math.min(100, (g.cur / g.target) * 100);
      return `<button type="button" class="gearItem${g.unlocked ? ' unlocked' : ''}${on ? ' worn' : ''}" ${g.unlocked ? `data-gear="${g.id}" aria-pressed="${on}"` : 'disabled'}>
        <span class="gearIcon">${gearIcon(g.id)}</span>
        <span class="gearText"><b>${esc(g.name)}</b><small>${g.unlocked ? (on ? 'Wearing' : 'Unlocked, tap to wear') : esc(g.need)}</small>
        ${g.unlocked ? '' : `<span class="gearBar"><i style="width:${pct}%"></i></span><small class="gearProg">${Math.floor(g.cur * 10) / 10} of ${g.target}${g.unit ? ' ' + g.unit : ''}</small>`}</span>
        <span class="gearState" aria-hidden="true">${g.unlocked ? (on ? '✓' : '+') : '🔒'}</span></button>`;
    }).join('')}</div>`;
    $('#charOptions').innerHTML = h;
  }
  function refresh() { const y = $('#charOptions').scrollTop; renderBuilder(); $('#charOptions').scrollTop = y; }
  function randomise() {
    const pick = k => AVATAR_OPTIONS[k][Math.floor(Math.random() * AVATAR_OPTIONS[k].length)], rnd = () => Math.round(Math.random() * 100) / 100;
    ['skin', 'face', 'eyes', 'eyeColor', 'brows', 'nose', 'mouth', 'ears', 'hair', 'hairColor', 'top', 'topColor', 'bottom', 'bottomColor', 'shoes', 'socks'].forEach(k => { draft[k] = pick(k); });
    draft.topPattern = Math.random() < 0.2 ? pick('topPattern') : 'none'; draft.hatColor = pick('topColor');
    draft.earrings = Math.random() < 0.3 ? pick('earrings') : 'none'; draft.necklace = Math.random() < 0.2 ? pick('necklace') : 'none'; draft.hairAcc = Math.random() < 0.15 ? pick('hairAcc') : 'none';
    draft.beard = Math.random() < 0.5 ? 'none' : pick('beard'); draft.beardColor = draft.hairColor;
    Object.keys(SLIDERS).forEach(k => { draft[k] = 0.15 + rnd() * 0.7; });
    draft.hat = Math.random() < 0.2 ? pick('hat') : 'none'; draft.glasses = Math.random() < 0.25 ? pick('glasses') : 'none';
    draft.tattoo = Math.random() < 0.2 ? pick('tattoo') : 'none';
    Object.keys(TOGGLES).forEach(k => { draft[k] = Math.random() < 0.15; });
    refresh();
  }
  $('#charTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; renderBuilder(); $('#charOptions').scrollTop = 0; } });
  $('#charOptions').addEventListener('click', e => {
    const b = e.target.closest('[data-key],[data-toggle],[data-gear],[data-match]'); if (!b || !draft) return;
    if (b.dataset.key) draft[b.dataset.key] = b.dataset.val;
    if (b.dataset.toggle) draft[b.dataset.toggle] = !draft[b.dataset.toggle];
    if (b.dataset.match) draft.beardColor = draft.hairColor;
    if (b.dataset.gear) { const id = b.dataset.gear; draft.gear = draft.gear.includes(id) ? draft.gear.filter(x => x !== id) : [...draft.gear, id]; }
    refresh();
  });
  // Sliders and the colour wheel update the preview live; the option list redraws when you let go.
  $('#charOptions').addEventListener('input', e => {
    const el = e.target; if (!draft) return;
    if (el.dataset.slider) { draft[el.dataset.slider] = +el.value / 100; renderStage(); }
    if (el.dataset.color) { draft[el.dataset.color] = el.value; renderStage(); el.parentElement.style.setProperty('--sw', el.value); }
  });
  $('#charOptions').addEventListener('change', e => { if (e.target.dataset.color || e.target.dataset.slider) refresh(); });
  $('#charShuffle').addEventListener('click', randomise);
  $('#charClose').addEventListener('click', () => {
    if (!firstTime && JSON.stringify(draft) !== JSON.stringify(config()) && !confirm('Discard your changes?')) return;
    closeBuilder();
  });
  $('#charSave').addEventListener('click', () => {
    if (!draft) return;
    const allowed = new Set(unlockedIds());
    data.profile.avatar = { ...normalizeAvatar(draft), gear: draft.gear.filter(id => allowed.has(id)) };
    data.profile.gearSeen = [...new Set([...(data.profile.gearSeen || []), ...allowed])];
    closeBuilder(); save();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('#editCharacter,#charPromptBtn')) openBuilder();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#charSheet').classList.contains('hidden')) $('#charClose').click(); });

  // ---------- reward screen ----------
  function rewardHtml(newGear) {
    return {
      figure: art(config(), { id: 'rwd', view: 'figure', scenery: false }),
      gear: newGear.length ? `<p class="rewardHead">New gear unlocked</p>` + newGear.map(g => `<div class="rGear"><span class="gearIcon">${gearIcon(g.id)}</span><span><b>${esc(g.name)}</b><small>${hasCharacter() ? 'Now on your character' : 'Create your character to wear it'}</small></span></div>`).join('') : ''
    };
  }

  window.NextFormCharacter = { renderCharacter, paintHeader, openBuilder, claimNewGear, gearState, rewardHtml, hasCharacter };
  window.renderCharacter = renderCharacter;
  renderCharacter();
})();
