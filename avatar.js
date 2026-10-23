// NextForm character: a layered, full-body SVG drawn from the creator's choices.
// Painted-illustration look to sit beside the welcome artwork: realistic proportions, rounded form
// shading lit from the upper left, textured hair and beards with soft edges, clothing seams and folds.
// Hand-drawn hairstyles (hair/<name>.webp): [width, height, face-centre x, hairline y] in image pixels, the
// hair's main colour (used for eyebrows and "Match hair") and the top of the hair at the centre. HAIR_HEAD_PX image pixels = the head's width.
const HAIR_HEAD_PX = 130, HAIRLINE = 8.5;
const HAIR_ART = {
  spikyFringe: [184, 174, 89.0, 121, '#43393f', 9],
  textured: [152, 111, 75.5, 70, '#3c3035', 3],
  shoulderStraight: [181, 200, 89.0, 54, '#453d44', 5],
  bowlSweep: [163, 129, 81.0, 91, '#a06f53', 0],
  longStraight: [194, 224, 97.0, 39, '#5f4a44', 2],
  spikyCrop: [174, 144, 86.0, 85, '#392d33', 1],
  locs: [184, 215, 87.0, 53, '#494046', 3],
  wavyBlonde: [196, 148, 98.0, 51, '#cfa775', 3],
  buzz: [150, 108, 74.5, 51, '#221a1e', 1],
  curlyCrop: [173, 126, 86.0, 73, '#3c3034', 1],
  waves: [165, 137, 82.0, 56, '#2f252b', 0],
  quiff: [177, 136, 89.0, 75, '#9e6d52', 3],
  curlyCap: [186, 141, 92.5, 67, '#46363a', 1],
  spikes: [189, 165, 92.0, 112, '#392d32', 8],
  tightCurls: [155, 119, 77.0, 64, '#3a2d33', 0],
  curtainBlonde: [185, 153, 92.5, 58, '#deb680', 3],
  afro: [195, 151, 97.0, 89, '#3a2f36', 0],
  looseCurls: [181, 141, 90.0, 63, '#865f47', 3],
  pompadour: [173, 140, 87.5, 70, '#9d6d52', 2],
  longWavy: [195, 201, 97.5, 50, '#5f4741', 3],
  sideSweep: [165, 130, 82.5, 66, '#684639', 2],
  emoSweep: [164, 135, 82.5, 96, '#453b44', 0],
  slickBack: [168, 130, 84.0, 59, '#736a6e', 1],
  shortWavy: [168, 126, 84.0, 54, '#44363c', 3],
  spikeTop: [190, 173, 94.5, 111, '#2f2529', 3],
  spikyBlonde: [173, 142, 86.5, 85, '#a4825c', 10],
  sidePart: [168, 139, 85.5, 69, '#483e47', 1],
  curlyTop: [179, 134, 89.0, 86, '#3f3236', 1],
  bowl: [175, 157, 87.5, 105, '#946850', 1],
  flatTop: [158, 134, 79.0, 84, '#3b3036', 0],
  messySpiky: [180, 148, 89.5, 120, '#3c3031', 7],
  middlePart: [176, 138, 100.5, 72, '#57392c', 1],
  texturedQuiff: [185, 160, 101.0, 85, '#8a5d41', 1],
  slickedBlack: [179, 157, 88.5, 84, '#3a2f30', 6],
  curlyFade: [182, 142, 90.0, 79, '#312422', 3],
  buzzFade: [158, 129, 79.0, 68, '#5e4336', 0],
  curtains: [197, 144, 98.0, 58, '#4b3630', 3],
  blondeQuiff: [184, 144, 93.5, 70, '#ba9265', 2],
  messy: [193, 159, 94.5, 111, '#3c3132', 0],
  twists: [196, 159, 94.0, 80, '#32221e', 8],
  cornrows: [163, 133, 81.5, 58, '#42322c', 3],
  bigAfro: [202, 166, 100.5, 99, '#2f2221', 3],
  shag: [204, 158, 107.0, 75, '#583b30', 1],
  spikyBlack: [191, 169, 94.5, 120, '#382e30', 9],
  textCrop: [178, 148, 89.5, 82, '#6b4735', 0],
  curlyTopFade: [188, 150, 92.5, 91, '#36241f', 3],
  longDark: [196, 199, 97.5, 57, '#4a362f', 4],
  messyBun: [166, 211, 82.5, 105, '#533628', 1],
  bob: [169, 156, 83.5, 52, '#423537', 3],
  beachWaves: [211, 173, 107.0, 52, '#c79d6d', 2],
  pixie: [159, 146, 81.0, 95, '#82482e', 1],
  longSleek: [200, 222, 100.5, 49, '#4f3933', 2],
  longWaves: [214, 235, 116.5, 56, '#5d3729', 1],
  longFringe: [172, 232, 85.5, 79, '#c3966a', 2],
  halfUp: [178, 224, 109.0, 98, '#4c352f', 3],
  sidePonytail: [181, 218, 114.0, 85, '#4f352c', 2],
  topBun: [149, 232, 75.5, 95, '#b79163', 1],
  curlyUpdo: [168, 226, 87.0, 108, '#3b2925', 1],
  spaceBuns: [198, 180, 99.0, 67, '#392e31', 20],
  plaits: [152, 204, 75.0, 54, '#764227', 3],
  boxBraids: [197, 207, 99.5, 46, '#302526', 3],
  afroPuff: [200, 171, 102.0, 96, '#2c2020', 1],
  longCurls: [196, 177, 99.5, 48, '#503023', 1],
  wavyBun: [206, 207, 104.0, 68, '#af875a', 3],
  shortCurls: [161, 145, 80.5, 85, '#312729', 3],
  longLocs: [202, 204, 102.5, 58, '#3d271f', 2]
};
const OLD_HAIR = { crop: 'textCrop', fade: 'buzzFade', undercut: 'sideSweep', sidepart: 'sidePart', slickback: 'slickBack', hightop: 'flatTop', receding: 'buzz', curly: 'curlyCap', mohawk: 'spikeTop', lob: 'shoulderStraight', long: 'longStraight', longBangs: 'longFringe', sideSwept: 'emoSweep', wavy: 'longWavy', wavyBangs: 'longWaves', curlyLong: 'longCurls', ponytail: 'sidePonytail', highPonytail: 'topBun', pigtails: 'spaceBuns', sideBraid: 'plaits', braids: 'boxBraids', bun: 'topBun' };
const AVATAR_OPTIONS = {
  skin: ['#f6dcc7', '#f0c9a8', '#e6b48c', '#d29a72', '#c08458', '#a86e45', '#8a5638', '#714529', '#5e3a26', '#46291a'],
  face: ['oval', 'round', 'square', 'long', 'heart', 'diamond'],
  eyes: ['almond', 'round', 'hooded', 'narrow', 'wide', 'downturned', 'upturned'],
  eyeColor: ['#5a3b26', '#2e1f16', '#7a6a35', '#4f7a4a', '#4f7fa8', '#7d8a92', '#a8742c'],
  brows: ['natural', 'thin', 'thick', 'arched', 'straight', 'bushy', 'angled'],
  nose: ['straight', 'button', 'wide', 'roman', 'small', 'long'],
  mouth: ['neutral', 'smile', 'grin', 'full', 'thin', 'smirk'],
  ears: ['average', 'small', 'large', 'protruding'],
  hair: [...Object.keys(HAIR_ART), 'bald'],
  hairColor: ['#1d1815', '#2f2019', '#3f281c', '#6e4428', '#8c5a32', '#a8743f', '#d4ad6a', '#e6d3a3', '#9c4329', '#b8b4ad', '#ece9e2'],
  beard: ['none', 'stubble', 'heavyStubble', 'moustache', 'handlebar', 'soulPatch', 'goatee', 'vandyke', 'circle', 'chinstrap', 'mutton', 'short', 'full', 'bushy', 'long'],
  top: ['tee', 'vneck', 'polo', 'shirt', 'jersey', 'longsleeve', 'sweater', 'tank', 'stringer', 'hoodie', 'zip', 'crop', 'sportsbra'],
  topPattern: ['none', 'stripes', 'dots', 'check'],
  topColor: ['#2f5a46', '#8fa58f', '#2e3b42', '#1f2326', '#d9962f', '#4a8396', '#2b4a7a', '#b9563f', '#a33b4c', '#ece6d6', '#c9b79c', '#5f4a7c'],
  bottom: ['shortShorts', 'shorts', 'longShorts', 'bikeShorts', 'tennisSkirt', 'joggers', 'trackpants', 'cargos', 'jeans', 'leggings', 'capris'],
  bottomColor: ['#24292c', '#3b4850', '#2f5a46', '#6a675f', '#2a3c5e', '#3d5a80', '#5b7aa6', '#7a6a52', '#c9b79c'],
  shoes: ['#2f5a46', '#ece9df', '#24292c', '#4a8396', '#b9563f', '#d9962f', '#a33b4c', '#8a8f94'],
  socks: ['crew', 'crewBlack', 'ankle', 'none'],
  hat: ['none', 'cap', 'backwardsCap', 'beanie', 'bucket', 'bandana', 'headwrap', 'turban', 'hijab'],
  glasses: ['none', 'round', 'square', 'catEye', 'aviator', 'heart', 'sport'],
  earrings: ['none', 'stud', 'hoops', 'drops'],
  necklace: ['none', 'chain', 'pendant', 'pearls', 'beads'],
  hairAcc: ['none', 'flower', 'clip', 'bow'],
  tattoo: ['none', 'band', 'rose', 'script', 'sleeve'],
  extras: ['headphones', 'wristbands', 'watch'],
  details: ['freckles', 'mole', 'smileLines', 'foreheadLines'],
  sliders: ['height', 'muscle', 'shoulders', 'waist', 'legs']
};
const AVATAR_DEFAULT = {
  skin: '#d29a72', height: 0.5, muscle: 0.45, shoulders: 0.5, waist: 0.4, legs: 0.5,
  face: 'oval', eyes: 'almond', eyeColor: '#5a3b26', brows: 'natural', nose: 'straight', mouth: 'neutral', ears: 'average',
  freckles: false, mole: false, smileLines: false, foreheadLines: false,
  hair: 'textCrop', hairColor: '#3f281c', beard: 'none', beardColor: '#3f281c',
  top: 'tee', topColor: '#8fa58f', bottom: 'shorts', bottomColor: '#24292c', shoes: '#2f5a46', socks: 'crew',
  topPattern: 'none', hat: 'none', hatColor: '#2f5a46', glasses: 'none', earrings: 'none', necklace: 'none', hairAcc: 'none', tattoo: 'none',
  headphones: false, wristbands: false, watch: false, gear: []
};

// Bring characters saved by the first version of the creator up to date.
function normalizeAvatar(cfg = {}) {
  const c = { ...cfg };
  if (c.build && c.muscle == null) Object.assign(c, { slim: { muscle: 0.2, shoulders: 0.3, waist: 0.25 }, athletic: { muscle: 0.5, shoulders: 0.55, waist: 0.4 }, broad: { muscle: 0.8, shoulders: 0.85, waist: 0.7 } }[c.build] || {});
  if (typeof c.height === 'string') c.height = { short: 0.2, average: 0.5, tall: 0.8 }[c.height] ?? 0.5;
  if (c.facialHair && !c.beard) c.beard = { none: 'none', stubble: 'stubble', moustache: 'moustache', short: 'short', full: 'full' }[c.facialHair] || 'none';
  if (c.beardColor == null && c.hairColor) c.beardColor = c.hairColor;
  if (typeof c.glasses === 'boolean') c.glasses = c.glasses ? 'square' : 'none';
  if (typeof c.cap === 'boolean' && !c.hat) c.hat = c.cap ? 'cap' : 'none';
  if (typeof c.earring === 'boolean' && !c.earrings) c.earrings = c.earring ? 'stud' : 'none';
  if (OLD_HAIR[c.hair]) c.hair = OLD_HAIR[c.hair];
  delete c.build; delete c.facialHair; delete c.cap; delete c.earring;
  const out = { ...AVATAR_DEFAULT, ...c };
  ['height', 'muscle', 'shoulders', 'waist', 'legs'].forEach(k => { out[k] = Math.max(0, Math.min(1, +out[k])); if (Number.isNaN(out[k])) out[k] = AVATAR_DEFAULT[k]; });
  for (const k of ['face', 'eyes', 'brows', 'nose', 'mouth', 'ears', 'hair', 'beard', 'top', 'topPattern', 'bottom', 'socks', 'hat', 'glasses', 'earrings', 'necklace', 'hairAcc', 'tattoo'])
    if (!AVATAR_OPTIONS[k].includes(out[k])) out[k] = AVATAR_DEFAULT[k];
  for (const k of ['skin', 'eyeColor', 'hairColor', 'beardColor', 'topColor', 'bottomColor', 'shoes', 'hatColor'])
    if (!/^#[0-9a-f]{6}$/i.test(out[k] || '')) out[k] = AVATAR_DEFAULT[k];
  out.gear = Array.isArray(out.gear) ? out.gear.filter(x => typeof x === 'string') : [];
  return out;
}

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
const r1 = v => Math.round(v * 100) / 100;
// Seeded random so a character always draws the same way.
function mixHex(a, b, t) {
  const A = parseInt(a.slice(1), 16), Bv = parseInt(b.slice(1), 16), m = (x, y) => Math.round(x + (y - x) * t);
  return '#' + [m(A >> 16, Bv >> 16), m((A >> 8) & 255, (Bv >> 8) & 255), m(A & 255, Bv & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function seeded(seed) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
function strandTile(w, h, n, len, dark, light, wd, seed, curl = 0.6) {
  const rnd = seeded(seed); let d = '', l = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, ln = len * (0.6 + rnd() * 0.7), bend = (rnd() - 0.5) * curl * 2;
    const seg = `M${r1(x)} ${r1(y)} q${r1(bend)} ${r1(ln / 2)} ${r1(bend * 0.4)} ${r1(ln)}`;
    // repeat strands that cross the tile edge so the texture tiles seamlessly
    const wraps = [[0, 0], [0, -h], [-w, 0], [w, 0]].map(([dx, dy]) => seg.replace(/^M([\d.]+) ([\d.]+)/, (_, a, b) => `M${r1(+a + dx)} ${r1(+b + dy)}`)).join(' ');
    if (rnd() < 0.72) d += wraps + ' '; else l += wraps + ' ';
  }
  return `<path d="${d}" stroke="${dark}" stroke-width="${wd}" fill="none" stroke-linecap="round"/><path d="${l}" stroke="${light}" stroke-width="${wd * 0.85}" fill="none" stroke-linecap="round" opacity=".8"/>`;
}
function dotTile(w, n, col, seed) {
  const rnd = seeded(seed); let o = '';
  for (let i = 0; i < n; i++) o += `<circle cx="${r1(rnd() * w)}" cy="${r1(rnd() * w)}" r="${r1(0.1 + rnd() * 0.12)}" fill="${col}" opacity="${r1(0.5 + rnd() * 0.5)}"/>`;
  return o;
}

// opts: { id, frame, scenery (default true), lite (skip paper grain), view: 'full'|'figure'|'bust'|'face'|'eyes'|'nose'|'mouth'|'brows' }
function renderAvatar(cfg = {}, opts = {}) {
  const c = normalizeAvatar(cfg);
  const uid = opts.id || 'av' + Math.random().toString(36).slice(2, 7);
  const gear = new Set(c.gear || []);
  const defs = [], L = [];
  const hatOn = !['none', 'bandana'].includes(c.hat), hijab = c.hat === 'hijab';

  // ---------- palette ----------
  const skin = c.skin, skinD = shadeHex(skin, -0.17), skinDD = shadeHex(skin, -0.32), skinL = shadeHex(skin, 0.14);
  const hairC = HAIR_ART[c.hair] ? HAIR_ART[c.hair][4] : c.hairColor, hairD = shadeHex(hairC, -0.32), hairL = shadeHex(hairC, hairC > '#c0' ? -0.12 : 0.3);
  const beardC = c.beardColor, beardD = shadeHex(beardC, -0.32), beardL = shadeHex(beardC, 0.28);
  const topC = c.topColor, topD = shadeHex(topC, -0.18), topDD = shadeHex(topC, -0.32), topL = shadeHex(topC, 0.14);
  const botC = c.bottomColor, botD = shadeHex(botC, -0.22), botL = shadeHex(botC, 0.14);
  const ink = '#2b2420', lineC = shadeHex(skin, -0.42);

  // ---------- proportions ----------
  const mus = c.muscle, shw = c.shoulders, wst = c.waist;
  const W = 30 + shw * 10 + mus * 4, WA = 18 + wst * 10 + mus, HIP = Math.max(WA + 1.5, 21 + wst * 6 + mus * 1.5);
  const NW = 5.4 + mus * 2.6 + shw * 0.6, LIMB = 0.86 + mus * 0.36;
  const st = 0.92 + c.height * 0.16;
  const cx = 100, ground = 378, ankle = ground - 11;
  const FACE = {
    oval: { fw: 14.5, cw: 14.5, jw: 11.9, chw: 6.3, h: 40 }, round: { fw: 15.6, cw: 15.6, jw: 15, chw: 8.6, h: 38 },
    square: { fw: 15.2, cw: 15.2, jw: 14.2, chw: 9.6, h: 40 }, long: { fw: 13.8, cw: 13.8, jw: 11, chw: 6, h: 43 },
    heart: { fw: 15.6, cw: 15, jw: 9.8, chw: 4.6, h: 40 }, diamond: { fw: 12.6, cw: 15.2, jw: 10.4, chw: 5, h: 41 }
  }[c.face];
  const headH = FACE.h, hw = FACE.cw, F0 = FACE;
  const headTop = ground - 318 * st, chin = headTop + headH, hy = headTop + 20;
  const sh = chin + 13;
  const span = ankle - sh, legFrac = 0.585 + c.legs * 0.065;
  const crotch = ankle - span * legFrac, waist = sh + (crotch - sh) * 0.633, hipY = sh + (crotch - sh) * 0.816;
  const knee = crotch + (ankle - crotch) * 0.48;
  const X = (s, v) => cx + s * v;

  // face landmarks
  const eyeY = hy + 1.5;
  const NOSE = { straight: [0, 2.3], button: [-1, 2.0], wide: [0, 3.3], roman: [0.5, 2.4], small: [-1.5, 1.8], long: [1.8, 2.3] }[c.nose];
  const noseTip = eyeY + 7.4 + NOSE[0], mouthY = noseTip + 4.8;

  const part = (name, d, base, extras = '') => {
    const id = `${uid}-${name}`;
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    return `<path d="${d}" fill="${base}"/>${extras ? `<g clip-path="url(#${id})">${extras}</g>` : ''}<path d="${d}" fill="url(#${uid}-form)"/>`;
  };
  defs.push(`<linearGradient id="${uid}-form" x1="0" y1="0" x2="1" y2="0.15">
      <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".58" stop-color="#2a1a10" stop-opacity="0"/><stop offset="1" stop-color="#2a1a10" stop-opacity=".3"/></linearGradient>
    <filter id="${uid}-rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="1" seed="3" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter>
    <pattern id="${uid}-hairTex" patternUnits="userSpaceOnUse" width="9" height="12" patternTransform="rotate(-10)">${strandTile(9, 12, 26, 6, hairD, hairL, 0.32, 7, 0.9)}</pattern>
    <pattern id="${uid}-beardTex" patternUnits="userSpaceOnUse" width="6" height="7" patternTransform="rotate(6)">${strandTile(6, 7, 22, 2.6, beardD, beardL, 0.3, 11, 0.5)}</pattern>
    <pattern id="${uid}-stubTex" patternUnits="userSpaceOnUse" width="5" height="5">${dotTile(5, 26, beardD, 5)}</pattern>
    <pattern id="${uid}-scalpTex" patternUnits="userSpaceOnUse" width="5" height="5">${dotTile(5, 30, hairD, 9)}</pattern>`);

  // ---------- scenery ----------
  if (opts.scenery !== false) {
    const tint = { novice: ['#f4ead7', '#f1dcc0'], bronze: ['#f5e4cf', '#efcfae'], silver: ['#eceee9', '#dfe4e2'], gold: ['#f6ead0', '#f1d9a2'], elite: ['#e4ece4', '#cfdccf'], master: ['#ece6ef', '#ddd2e3'] }[opts.frame || 'novice'] || ['#f4ead7', '#f1dcc0'];
    defs.push(`<linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint[0]}"/><stop offset="1" stop-color="${tint[1]}"/></linearGradient>
      <clipPath id="${uid}-bg"><rect x="6" y="6" width="188" height="388" rx="30"/></clipPath>`);
    const trees = [[18, 252, 1], [30, 262, 0.8], [172, 244, 1.1], [184, 258, 0.8], [60, 278, 0.7], [150, 270, 0.75]]
      .map(([x, y, k]) => `<path d="M${x} ${y - 46 * k} Q${x + 7 * k} ${y - 20 * k} ${x + 5 * k} ${y} L${x - 5 * k} ${y} Q${x - 7 * k} ${y - 20 * k} ${x} ${y - 46 * k}Z" fill="#3f5d3a"/><path d="M${x} ${y - 46 * k} Q${x + 7 * k} ${y - 20 * k} ${x + 5 * k} ${y} L${x + 1} ${y}Z" fill="#334d30"/>`).join('');
    L.push(`<g clip-path="url(#${uid}-bg)">
      <rect width="200" height="400" fill="url(#${uid}-sky)"/>
      <circle cx="168" cy="136" r="24" fill="#f2c08d" opacity=".9"/>
      <path d="M14 70 q12 -7 24 -2 q8 -4 14 1" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" fill="none"/>
      <path d="M-10 214 L26 178 L48 192 L76 164 L104 186 L134 150 L168 186 L210 160 V400 H-10Z" fill="#a8b7b2"/>
      <path d="M118 210 L150 112 L162 128 L170 120 L210 196 V400 H118Z" fill="#cfc4b0"/>
      <path d="M150 112 L162 128 L170 120 L182 146 L166 140 L156 150 L152 134 L142 146Z" fill="#ece5d6"/>
      <path d="M150 112 L170 120 L210 196 V230 L172 206Z" fill="#b5a993"/>
      <path d="M-10 250 Q40 214 90 232 Q140 248 210 214 V400 H-10Z" fill="#8ea56f"/>
      <path d="M150 400 Q120 330 150 290 Q178 262 164 236" stroke="#d9c29a" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/>
      ${trees}
      <path d="M-10 300 Q50 280 100 292 Q160 304 210 284 V400 H-10Z" fill="#7d9661"/>
      <path d="M-10 ${ground - 8} Q60 ${ground - 22} 110 ${ground - 16} Q170 ${ground - 10} 210 ${ground - 18} V400 H-10Z" fill="#d8c4a0"/>
      <path d="M-10 ${ground + 6} Q80 ${ground - 4} 210 ${ground + 4} V400 H-10Z" fill="#cbb48c"/>
      <ellipse cx="${cx}" cy="${ground + 1}" rx="${46 + W * 0.3}" ry="6" fill="#8d7652" opacity=".35"/>
      <g fill="#6f8a4d"><ellipse cx="20" cy="${ground + 2}" rx="16" ry="7"/><ellipse cx="186" cy="${ground}" rx="18" ry="8"/></g>
      <g fill="#e6c95a"><circle cx="14" cy="${ground - 2}" r="1.8"/><circle cx="24" cy="${ground}" r="1.5"/><circle cx="182" cy="${ground - 3}" r="1.8"/><circle cx="192" cy="${ground}" r="1.5"/></g>
    </g>`);
  }

  // hair accessories are placed on a 42 x 51 head grid
  const hs = hw / 21, Hx = v => r1(cx + v * hs), Hy = v => r1(hy + v * (headH / 51));
  const P = (pts) => pts.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, a, b) => `${Hx(+a)} ${Hy(+b)}`);
  // ---------- legs ----------
  const k = (LIMB - 1) * 6;
  const legD = (s, g = 0) => {
    const o = v => X(s, v + 2.5);
    return `M${X(s, 0)} ${crotch - 4} L${o(HIP - 2.5 + g * 0.6)} ${hipY - 6}
      Q${o(HIP + 3 + g + k * 0.5)} ${crotch + 20} ${o(13.2 + k + g * 0.8)} ${knee}
      Q${o(17.8 + k * 1.2 + g * 0.8)} ${knee + 24} ${o(9.4 + g * 0.5)} ${ankle - 5}
      L${o(9 + g * 0.5)} ${ankle} L${o(2.2 - g * 0.4)} ${ankle} L${o(1.9 - g * 0.4)} ${ankle - 6}
      Q${o(-1.4 - g * 0.4)} ${knee + 20} ${o(1.6 - g * 0.3)} ${knee + 4}
      Q${o(-2.2 - g * 0.5)} ${knee - 24} ${X(s, 0.4)} ${crotch + 6}Z`;
  };
  [-1, 1].forEach(s => L.push(part(`leg${s}`, legD(s), skin,
    (s < 0 ? `<path d="M${X(s, HIP - 5.5)} ${crotch + 8} Q${X(s, HIP - 1.5)} ${knee - 26} ${X(s, 13.5)} ${knee - 6}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".4"/>` : '') +
    `<path d="M${X(s, 5)} ${knee - 2} q${s * 4} 4 ${s * 8} 0" stroke="${skinDD}" stroke-width="1.1" fill="none" opacity=".55"/>
     <path d="M${X(s, 8)} ${knee + 10} Q${X(s, 13)} ${knee + 24} ${X(s, 10)} ${knee + 44}" stroke="${skinDD}" stroke-width="1" fill="none" opacity="${0.25 + mus * 0.25}"/>
     ${mus > 0.55 ? `<path d="M${X(s, HIP - 6)} ${hipY + 8} Q${X(s, HIP - 2)} ${crotch + 18} ${X(s, 11)} ${knee - 10}" stroke="${skinDD}" stroke-width="1" fill="none" opacity=".35"/>` : ''}`)));

  // socks
  const sockH = { crew: 13, crewBlack: 13, ankle: 4.5, none: 0 }[c.socks];
  if (sockH) [-1, 1].forEach(s => {
    const col = c.socks === 'crewBlack' ? (s > 0 ? '#1f2326' : '#2b3034') : (s > 0 ? '#e2ded4' : '#f3f0e8');
    L.push(`<path d="M${X(s, 4.4)} ${ankle - sockH} L${X(s, 11.6)} ${ankle - sockH} L${X(s, 11.8)} ${ankle + 1} L${X(s, 4.4)} ${ankle + 1}Z" fill="${col}"/>${sockH > 6 ? `<path d="M${X(s, 4.5)} ${ankle - sockH + 1.5} H${X(s, 11.6)}" stroke="${c.socks === 'crewBlack' ? '#3b4146' : '#d4cfc3'}" stroke-width="1"/>` : ''}`);
  });

  // ---------- bottoms ----------
  const B = c.bottom;
  const skirt = B === 'tennisSkirt';
  const pantsTo = { shortShorts: crotch + (knee - crotch) * 0.38, shorts: knee - 10, longShorts: knee + 5, bikeShorts: knee - 12, tennisSkirt: crotch + (knee - crotch) * 0.42, leggings: ankle - (sockH > 6 ? 13 : 3), capris: knee + (ankle - knee) * 0.5 }[B] ?? ankle - 2;
  const g = { shortShorts: 5, shorts: 6.5, longShorts: 7, bikeShorts: 1.2, tennisSkirt: 1, joggers: 5, trackpants: 4.5, cargos: 7, jeans: 4, leggings: 1, capris: 1 }[B];
  defs.push(`<clipPath id="${uid}-pants"><path d="M0 ${waist - 4} H200 V${pantsTo} H0Z"/></clipPath>`);
  const hipBlock = `M${X(-1, WA + 1.5)} ${waist - 2} L${X(1, WA + 1.5)} ${waist - 2} Q${X(1, HIP + 4)} ${hipY - 6} ${X(1, HIP + 3.5)} ${hipY + 4} L${X(1, 2)} ${crotch + 6} L${X(-1, 2)} ${crotch + 6} L${X(-1, HIP + 3.5)} ${hipY + 4} Q${X(-1, HIP + 4)} ${hipY - 6} ${X(-1, WA + 1.5)} ${waist - 2}Z`;
  let pants = `<path d="${hipBlock}" fill="${botC}"/>` + [-1, 1].map(s => `<path d="${legD(s, g)}" fill="${botC}"/><path d="${legD(s, g)}" fill="url(#${uid}-form)"/>`).join('');
  const outerSeam = (s, to) => `M${X(s, HIP + 3)} ${hipY} Q${X(s, HIP + 3 + g * 0.6)} ${knee - 30} ${X(s, 15 + g * 0.8)} ${knee} Q${X(s, 18 + g * 0.8)} ${knee + 26} ${X(s, 11.5 + g * 0.5)} ${to}`;
  if (['shortShorts', 'shorts', 'longShorts'].includes(B)) pants += [-1, 1].map(s => `<path d="M${X(s, 4)} ${crotch + 4} q${s * 6} 8 ${s * 14} 6" stroke="${botD}" stroke-width="1.4" fill="none" opacity=".8"/>
      <path d="M${X(s, 2.5)} ${pantsTo - 1.2} H${X(s, HIP + 10)}" stroke="${shadeHex(botC, -0.32)}" stroke-width="1.6"/>`).join('') + `<path d="M${cx} ${waist + 2} V${crotch}" stroke="${botD}" stroke-width="1.2"/>`;
  if (B === 'joggers') pants += [-1, 1].map(s => `<path d="M${X(s, 6)} ${knee - 6} q${s * 6} 5 ${s * 13} 1 M${X(s, 6)} ${knee + 4} q${s * 6} 4 ${s * 12} 0 M${X(s, 6)} ${ankle - 22} q${s * 5} 4 ${s * 10} 0" stroke="${botD}" stroke-width="1.3" fill="none"/>
      <rect x="${s < 0 ? X(s, 14) : X(s, 3)}" y="${ankle - 8}" width="11" height="6" rx="2.5" fill="${shadeHex(botC, -0.3)}"/>`).join('');
  if (B === 'trackpants') pants += [-1, 1].map(s => `<path d="${outerSeam(s, pantsTo)}" stroke="#efe9dc" stroke-width="1.4" fill="none"/><path d="${outerSeam(s, pantsTo)}" stroke="#efe9dc" stroke-width="1.4" fill="none" transform="translate(${-s * 2.4} 0)"/>`).join('');
  if (B === 'cargos') pants += [-1, 1].map(s => {
    const py = crotch + 16, px = X(s, HIP + 2 + g * 0.3);
    return `<rect x="${s < 0 ? px : px - 9}" y="${py}" width="9" height="13" rx="1.5" fill="${botD}"/><rect x="${s < 0 ? px - 0.4 : px - 9.6}" y="${py - 1}" width="9.8" height="4" rx="1" fill="${shadeHex(botC, -0.32)}"/>
      <path d="M${X(s, 6)} ${knee + 2} q${s * 6} 4 ${s * 13} 0 M${X(s, 6)} ${ankle - 14} q${s * 6} 3 ${s * 12} 0" stroke="${botD}" stroke-width="1.2" fill="none"/>`;
  }).join('');
  if (B === 'jeans') pants += [-1, 1].map(s => `<path d="${outerSeam(s, pantsTo)}" stroke="#c9963f" stroke-width=".8" stroke-dasharray="1.6 1.2" fill="none" opacity=".9"/>
      <path d="M${X(s, WA - 2)} ${waist + 4} Q${X(s, WA - 10)} ${waist + 8} ${X(s, 6)} ${waist + 3}" stroke="${shadeHex(botC, -0.35)}" stroke-width="1" fill="none"/><circle cx="${X(s, WA - 3)}" cy="${waist + 5}" r=".9" fill="#c9963f"/>
      <rect x="${s < 0 ? X(s, 13.4) : X(s, 1.6)}" y="${pantsTo - 5}" width="11.8" height="4.5" fill="${shadeHex(botC, 0.18)}"/>`).join('') + `<path d="M${cx + 1} ${waist + 3} Q${cx + 2} ${crotch - 6} ${cx - 1} ${crotch - 1}" stroke="#c9963f" stroke-width=".8" stroke-dasharray="1.6 1.2" fill="none"/>`;
  if (B === 'leggings' || B === 'capris') pants += [-1, 1].map(s => `<path d="${outerSeam(s, pantsTo)}" stroke="${botD}" stroke-width="1" fill="none"/>
      <path d="M${X(s, HIP - 6)} ${hipY + 6} Q${X(s, HIP - 4)} ${knee - 26} ${X(s, 10)} ${knee - 6}" stroke="${botL}" stroke-width="3" fill="none" opacity=".45"/>`).join('');
  pants += `<path d="M${X(-1, WA + 1.5)} ${waist + 1} H${X(1, WA + 1.5)}" stroke="${shadeHex(botC, -0.35)}" stroke-width="${B === 'jeans' ? 2.5 : 4}"/>`;
  if (B === 'jeans') pants += [-1, 1, 0].map(p => `<rect x="${cx + p * (WA - 6) - 1}" y="${waist - 1.5}" width="2" height="5" fill="${shadeHex(botC, -0.4)}"/>`).join('');
  if (B === 'bikeShorts') pants += [-1, 1].map(s => `<path d="${outerSeam(s, pantsTo)}" stroke="${botD}" stroke-width="1" fill="none"/><path d="M${X(s, 2.5)} ${pantsTo - 1.5} H${X(s, HIP + 6)}" stroke="${shadeHex(botC, -0.35)}" stroke-width="2"/>`).join('');
  defs.push(`<clipPath id="${uid}-pantsShape"><path d="${hipBlock}"/><path d="${legD(-1, g)}"/><path d="${legD(1, g)}"/></clipPath>`);
  if (skirt) {
    const hem = pantsTo, sk = `M${X(-1, WA + 1.5)} ${waist - 2} L${X(1, WA + 1.5)} ${waist - 2} L${X(1, HIP + 9)} ${hem} Q${cx} ${hem + 2} ${X(-1, HIP + 9)} ${hem}Z`;
    L.push(part('skirt', sk, botC, Array.from({ length: 9 }, (_, i) => { const t = (i + 1) / 10, x0 = X(-1, WA + 1.5) + (2 * WA + 3) * t, x1 = X(-1, HIP + 9) + (2 * HIP + 18) * t; return `<path d="M${r1(x0)} ${waist + 2} L${r1(x1)} ${hem + 1}" stroke="${i % 2 ? botD : botL}" stroke-width=".9" opacity=".7"/>`; }).join('')
      + `<path d="M${X(-1, WA + 1.5)} ${waist + 1} H${X(1, WA + 1.5)}" stroke="${shadeHex(botC, -0.3)}" stroke-width="4"/>`));
  } else L.push(`<g clip-path="url(#${uid}-pants)"><g clip-path="url(#${uid}-pantsShape)">${pants}</g></g>`);

  // ---------- trainers ----------
  const shoe = c.shoes, shoeD = shadeHex(shoe, -0.2), sole = '#f1eee6', soleD = '#cfc9bb';
  [-1, 1].forEach(s => {
    const x = X(s, 7.8);
    L.push(`<g transform="translate(${x} 0) scale(${s} 1) translate(${-x} 0)">
      <path d="M${x - 6.5} ${ankle - 3} Q${x - 2} ${ankle - 6} ${x + 4} ${ankle - 3} Q${x + 9} ${ankle + 1} ${x + 12} ${ankle + 4} Q${x + 17} ${ankle + 6} ${x + 17} ${ground - 4} L${x - 8} ${ground - 4} Q${x - 9} ${ankle + 4} ${x - 6.5} ${ankle - 3}Z" fill="${s > 0 ? shoeD : shoe}"/>
      <path d="M${x - 9} ${ground - 5} H${x + 17.5} Q${x + 18.5} ${ground - 0.5} ${x + 15} ${ground} H${x - 8} Q${x - 10} ${ground - 1} ${x - 9} ${ground - 5}Z" fill="${s > 0 ? soleD : sole}"/>
      <path d="M${x - 2} ${ankle - 1} l6 1.5 M${x - 2.5} ${ankle + 2} l7 1.8 M${x - 3} ${ankle + 5} l7 2" stroke="${shoe === '#ece9df' ? '#b8b2a4' : '#efe9dc'}" stroke-width="1" stroke-linecap="round"/>
      <path d="M${x - 7} ${ankle + 7} Q${x + 2} ${ankle + 11} ${x + 13} ${ankle + 7}" stroke="${shoe === '#ece9df' ? '#2f5a46' : sole}" stroke-width="1.6" fill="none" opacity=".85"/></g>`);
  });

  // ---------- arms ----------
  const armD = s => {
    const o = v => X(s, v), a = (LIMB - 1) * 5, bi = mus * 3.2;
    return `M${o(W - 9)} ${sh + 22}
      Q${o(W - 11 - bi * 0.4)} ${sh + 36} ${o(W - 7.5)} ${waist - 6}
      Q${o(W - 6.5)} ${waist + 12} ${o(W - 1.5)} ${hipY + 12}
      L${o(W + 5.5 + a * 0.4)} ${hipY + 12}
      Q${o(W + 6.5 + a + mus * 1.2)} ${waist + 6} ${o(W + 3.5 + a * 0.6)} ${waist - 6}
      Q${o(W + 5 + a + bi)} ${sh + 28} ${o(W + 1.5 + a * 0.5)} ${sh + 10}
      Q${o(W - 2)} ${sh} ${o(W - 9)} ${sh + 6}Z`;
  };
  const handD = s => {
    const o = v => X(s, v), y = hipY + 10;
    return `M${o(W - 2)} ${y} Q${o(W - 4.5)} ${y + 9} ${o(W - 2)} ${y + 16} Q${o(W + 1.5)} ${y + 20} ${o(W + 4.5)} ${y + 15} Q${o(W + 7)} ${y + 8} ${o(W + 5.5)} ${y}Z`;
  };
  const tattoo = s => {
    if (s > 0 || c.tattoo === 'none') return '';
    const ti = '#2d3a45', ux = X(s, W - 1), fx = X(s, W + 1), uy = sh + 30, fy = waist + 12;
    if (c.tattoo === 'band') return `<g opacity=".8" stroke="${ti}" fill="none"><path d="M${ux - 10} ${uy - 3.5} q10 2.5 20 0 M${ux - 10} ${uy + 4} q10 2.5 20 0" stroke-width="1.6"/><path d="M${ux - 9} ${uy + 1.2} l2 -3 2 3 2 -3 2 3 2 -3 2 3 2 -3 2 3" stroke-width="1.2"/></g>`;
    if (c.tattoo === 'rose') return `<g opacity=".75"><circle cx="${fx}" cy="${fy}" r="2.6" fill="#a33b4c"/><path d="M${fx - 1.6} ${fy} q1.6 -1.8 3.2 0 q-1.6 1.6 -3.2 0" stroke="#5c1f2a" stroke-width=".5" fill="none"/><path d="M${fx} ${fy + 2.6} q-.6 4 .4 7" stroke="${ti}" stroke-width=".7" fill="none"/><path d="M${fx} ${fy + 5} q-3 -1 -4 1.5 q3 .5 4 -1.5 M${fx + .2} ${fy + 6.5} q3 -1 4 1.2 q-3 .6 -4 -1.2" fill="#3f5d3a"/></g>`;
    if (c.tattoo === 'script') return `<path d="M${fx - 3} ${fy - 4} q1.5 -2 3 0 t3 0 M${fx - 3.2} ${fy - 0.5} q1.5 -2 3 0 t3 0 q.6 -.8 1.2 0 M${fx - 2.6} ${fy + 3} q1.4 -1.8 2.8 0 t2.6 0" stroke="${ti}" stroke-width=".6" fill="none" opacity=".75"/>`;
    return `<g fill="${ti}" opacity=".78">${Array.from({ length: 9 }, (_, i) => { const y = sh + 14 + i * 9.5, x0 = X(s, W - 12); return `<path d="M${x0} ${y} l5 -4.5 l5 4.5 l5 -4.5 l5 4.5 v2.2 l-5 -4.5 l-5 4.5 l-5 -4.5 l-5 4.5Z"/>`; }).join('')}<circle cx="${ux}" cy="${uy + 4}" r="3.2" fill="none" stroke="${ti}" stroke-width="1.2"/></g>`;
  };
  [-1, 1].forEach(s => {
    const shade = s > 0 ? '' : `<path d="M${X(s, W + 1)} ${sh + 14} Q${X(s, W + 2.5)} ${sh + 30} ${X(s, W)} ${waist - 10}" stroke="${skinL}" stroke-width="2.4" fill="none" opacity=".6"/>`;
    L.push(part(`arm${s}`, armD(s), skin, shade + tattoo(s) + `<path d="M${X(s, W - 6)} ${waist - 5} q${s * 4} 3 ${s * 8} 0" stroke="${skinDD}" stroke-width="1" fill="none" opacity=".5"/>
      ${mus > 0.5 ? `<path d="M${X(s, W + 2)} ${sh + 20} Q${X(s, W + 4.5 + mus * 2)} ${sh + 30} ${X(s, W + 2)} ${sh + 40}" stroke="${skinDD}" stroke-width=".9" fill="none" opacity="${(mus - 0.4) * 0.7}"/>` : ''}`));
    L.push(part(`hand${s}`, handD(s), skin, `<path d="M${X(s, W - 2)} ${hipY + 20} q${s * 3} 3 ${s * 6} 2 M${X(s, W - 1)} ${hipY + 23} q${s * 3} 2 ${s * 5} 1" stroke="${skinDD}" stroke-width=".8" fill="none" opacity=".6"/>`));
  });

  // ---------- torso ----------
  const torsoPath = (pad = 0, bottom = crotch - 6) => {
    const pts = s => ({
      neck: [X(s, NW + 1), sh - 5], trap: [X(s, W * 0.66 + pad), sh - 5], shTip: [X(s, W - 3 + pad), sh + 3],
      deltC: [X(s, W + 1.5 + pad), sh + 6], delt: [X(s, W + 0.5 + pad), sh + 17], pitC: [X(s, W - 1 + pad), sh + 25], pit: [X(s, W - 7 + pad), sh + 27],
      ribC: [X(s, W - 6 + pad), waist - 26], waist: [X(s, WA + pad), waist], hipC: [X(s, WA - 0.5 + pad), hipY - 8],
      hip: [X(s, HIP - 1 + pad), Math.min(hipY, bottom)], bot: [X(s, HIP - 2 + pad), bottom]
    });
    const l = pts(-1), r = pts(1), p = a => `${r1(a[0])} ${r1(a[1])}`;
    return `M${p(l.neck)} Q${p(l.trap)} ${p(l.shTip)} Q${p(l.deltC)} ${p(l.delt)} Q${p(l.pitC)} ${p(l.pit)} Q${p(l.ribC)} ${p(l.waist)} Q${p(l.hipC)} ${p(l.hip)} L${p(l.bot)}
      L${p(r.bot)} L${p(r.hip)} Q${p(r.hipC)} ${p(r.waist)} Q${p(r.ribC)} ${p(r.pit)} Q${p(r.pitC)} ${p(r.delt)} Q${p(r.deltC)} ${p(r.shTip)} Q${p(r.trap)} ${p(r.neck)}Z`;
  };
  const absO = 0.18 + mus * 0.35;
  const skinTorsoShade = `<path d="M${cx - W * 0.6} ${sh + 22} Q${cx - 6} ${sh + 30} ${cx - 2} ${sh + 22} M${cx + 2} ${sh + 22} Q${cx + 6} ${sh + 30} ${cx + W * 0.6} ${sh + 22}" stroke="${skinDD}" stroke-width="1.2" fill="none" opacity="${0.3 + mus * 0.3}"/>
    <path d="M${cx} ${sh + 30} V${waist + 8} M${cx - 6} ${sh + 42} q6 2 12 0 M${cx - 6} ${sh + 52} q6 2 12 0 M${cx - 5.5} ${sh + 61} q5.5 2 11 0" stroke="${skinDD}" stroke-width="1" fill="none" opacity="${absO}"/>
    <path d="M${cx - W + 6} ${sh + 4} Q${cx - W * 0.4} ${sh} ${cx - 10} ${sh + 6}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".5"/>`;
  const fabricLight = `<path d="M${cx - W + 8} ${sh + 2} Q${cx - W * 0.4} ${sh - 2} ${cx - 12} ${sh + 4}" stroke="${topL}" stroke-width="4" fill="none" opacity=".5"/>`;
  const folds = y0 => `<path d="M${X(-1, W - 8)} ${sh + 28} q8 10 6 26 M${X(1, W - 8)} ${sh + 28} q-8 10 -6 26 M${cx - WA + 3} ${y0 - 10} q6 4 12 2 M${cx + 4} ${y0 - 6} q6 3 10 0" stroke="${topDD}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>`;

  // neck
  L.push(part('neck', `M${cx - NW} ${chin - 8} L${cx + NW} ${chin - 8} L${cx + NW + 1.5} ${sh - 2} Q${cx} ${sh + 5} ${cx - NW - 1.5} ${sh - 2}Z`, skin,
    `<path d="M${cx - NW} ${chin - 8} H${cx + NW + 2} V${chin + 2} Q${cx} ${chin + 6} ${cx - NW} ${chin + 2}Z" fill="${skinD}" opacity=".7"/>`));

  const T = c.top;
  const sleeveLen = { tee: sh + 40, vneck: sh + 40, polo: sh + 38, shirt: sh + 38, jersey: sh + 40, longsleeve: hipY + 8, sweater: hipY + 8, hoodie: hipY + 8, zip: hipY + 8 }[T];
  const lum = parseInt(topC.slice(1, 3), 16) * 0.3 + parseInt(topC.slice(3, 5), 16) * 0.59 + parseInt(topC.slice(5, 7), 16) * 0.11;
  const patC = lum > 150 ? shadeHex(topC, -0.35) : shadeHex(topC, 0.42);
  defs.push({
    stripes: `<pattern id="${uid}-pat" patternUnits="userSpaceOnUse" width="10" height="6"><rect y="0" width="10" height="2.4" fill="${patC}" opacity=".85"/></pattern>`,
    dots: `<pattern id="${uid}-pat" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="1.5" cy="1.5" r="1" fill="${patC}"/><circle cx="4.5" cy="4.5" r="1" fill="${patC}"/></pattern>`,
    check: `<pattern id="${uid}-pat" patternUnits="userSpaceOnUse" width="8" height="8"><rect width="4" height="8" fill="${patC}" opacity=".35"/><rect width="8" height="4" fill="${patC}" opacity=".35"/><path d="M0 2h8M2 0v8" stroke="${patC}" stroke-width=".4" opacity=".7"/></pattern>`
  }[c.topPattern] || '');
  const pat = c.topPattern !== 'none' ? `<rect x="0" y="0" width="200" height="400" fill="url(#${uid}-pat)"/>` : '';
  const topEnd = { crop: sh + 40, sportsbra: sh + 31, hoodie: hipY + 6, zip: hipY + 6 }[T] ?? waist + 14;
  const bareTorso = ['tank', 'stringer', 'crop', 'sportsbra'].includes(T);
  if (bareTorso) L.push(part('torso-skin', torsoPath(0, waist + 1), skin, skinTorsoShade));
  if (sleeveLen) {
    const zipLines = T === 'zip' ? `<path d="M${cx} ${sh - 4} V${topEnd}" stroke="${topDD}" stroke-width="1.6"/><path d="M${cx} ${sh - 4} V${topEnd}" stroke="#c9c3b6" stroke-width=".6" stroke-dasharray=".8 .8"/>
      <path d="M${cx - WA + 3} ${waist} q4 8 0 14 M${cx + WA - 3} ${waist} q-4 8 0 14" stroke="${topDD}" stroke-width="1.2" fill="none"/>` : '';
    L.push(part('top', torsoPath(2, topEnd), topC, pat + fabricLight + folds(topEnd) + zipLines + (T === 'sweater' ? Array.from({ length: 16 }, (_, i) => `<path d="M${cx - W + i * (W / 7.5)} ${sh} V${topEnd}" stroke="${topD}" stroke-width=".5" opacity=".5"/>`).join('') : '') +
      `<path d="M${X(-1, HIP + 1)} ${topEnd - 1} H${X(1, HIP + 1)}" stroke="${topDD}" stroke-width="${T === 'hoodie' || T === 'zip' ? 4 : 2}" opacity=".6"/>`));
    [-1, 1].forEach(s => {
      const len = sleeveLen, wO = len > sh + 50 ? 3 : 4.5;
      const d = `M${X(s, W - 10)} ${sh + 22} Q${X(s, W - 12)} ${(sh + len) / 2} ${X(s, W - 9)} ${len} L${X(s, W + wO + 2)} ${len} Q${X(s, W + wO + 4 + mus * 1.5)} ${sh + 20} ${X(s, W + 2.5)} ${sh + 8} Q${X(s, W - 2)} ${sh - 4} ${X(s, W - 12)} ${sh + 2}Z`;
      L.push(part(`sleeve${s}`, d, topC, pat + (T === 'jersey' ? `<path d="M${X(s, W - 11)} ${len - 6} H${X(s, W + wO + 4)}" stroke="#efe9dc" stroke-width="1.6"/>` : '') + `<path d="M${X(s, W - 11)} ${len - 3} H${X(s, W + wO + 4)}" stroke="${topDD}" stroke-width="${len > sh + 50 ? 4.5 : 1.6}"/>
        <path d="M${X(s, W - 6)} ${sh + 16} q${s * 4} 8 ${s * 3} 16" stroke="${topDD}" stroke-width="1.2" fill="none" opacity=".7"/>`));
    });
    if (T === 'polo' || T === 'shirt') {
      const flap = s => `<path d="M${X(s, NW + 3)} ${sh - 6} L${X(s, 0.8)} ${sh + 6} L${X(s, NW + 7)} ${sh + 5} Z" fill="${topD}" stroke="${topDD}" stroke-width=".6" stroke-linejoin="round"/>`;
      L.push(`<path d="M${cx - NW - 2} ${sh - 5} L${cx} ${sh + 7} L${cx + NW + 2} ${sh - 5}Z" fill="${skinD}"/>${flap(-1)}${flap(1)}`);
      const end = T === 'polo' ? sh + 16 : topEnd - 2;
      L.push(`<path d="M${cx} ${sh + 6} V${end}" stroke="${topDD}" stroke-width=".8"/>${Array.from({ length: Math.floor((end - sh - 8) / 9) + 1 }, (_, i) => `<circle cx="${cx + 1.4}" cy="${sh + 9 + i * 9}" r=".9" fill="${shadeHex(topC, 0.6)}"/>`).join('')}`);
      if (T === 'shirt') L.push(`<path d="M${cx - W * 0.62} ${sh + 16} h9 v8 q-4.5 2 -9 0Z" fill="none" stroke="${topDD}" stroke-width=".8"/>`);
    }
    if (T === 'jersey') L.push(`<path d="M${cx - NW - 3} ${sh - 5} Q${cx} ${sh + 10} ${cx + NW + 3} ${sh - 5}" fill="${skinD}"/><path d="M${cx - NW - 3.4} ${sh - 5} Q${cx} ${sh + 11} ${cx + NW + 3.4} ${sh - 5}" stroke="#efe9dc" stroke-width="2.4" fill="none"/>
      <text x="${cx}" y="${sh + 40}" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="20" fill="#efe9dc" opacity=".92">7</text>`);
    if (T === 'sweater') L.push(`<path d="M${cx - NW - 2.5} ${sh - 5} Q${cx} ${sh + 7} ${cx + NW + 2.5} ${sh - 5}" fill="${skinD}"/><path d="M${cx - NW - 3.5} ${sh - 5} Q${cx} ${sh + 9} ${cx + NW + 3.5} ${sh - 5}" stroke="${topDD}" stroke-width="3.4" fill="none"/>`);
    if (T === 'tee' || T === 'longsleeve') L.push(`<path d="M${cx - NW - 2.5} ${sh - 5} Q${cx} ${sh + 7} ${cx + NW + 2.5} ${sh - 5}" fill="${skinD}"/><path d="M${cx - NW - 3} ${sh - 5} Q${cx} ${sh + 8} ${cx + NW + 3} ${sh - 5}" stroke="${topDD}" stroke-width="2.2" fill="none"/>`);
    if (T === 'vneck') L.push(`<path d="M${cx - NW - 3} ${sh - 5} L${cx} ${sh + 13} L${cx + NW + 3} ${sh - 5}Z" fill="${skin}"/><path d="M${cx - NW - 3.4} ${sh - 5} L${cx} ${sh + 14} L${cx + NW + 3.4} ${sh - 5}" stroke="${topDD}" stroke-width="2" fill="none" stroke-linejoin="round"/>`);
    if (T === 'hoodie' || T === 'zip') L.push(`<path d="M${cx - NW - 9} ${sh - 2} Q${cx} ${sh + 9} ${cx + NW + 9} ${sh - 2} Q${cx + NW + 11} ${sh - 12} ${cx + NW + 2} ${sh - 13} L${cx - NW - 2} ${sh - 13} Q${cx - NW - 11} ${sh - 12} ${cx - NW - 9} ${sh - 2}Z" fill="${topD}"/>
      <path d="M${cx - NW - 4} ${sh - 6} Q${cx} ${sh + 4} ${cx + NW + 4} ${sh - 6}" stroke="${topDD}" stroke-width="2" fill="none"/>
      ${T === 'hoodie' ? `<path d="M${cx - 3.5} ${sh + 1} v16 M${cx + 3.5} ${sh + 1} v14" stroke="#efe9dc" stroke-width="1.4" stroke-linecap="round"/><path d="M${cx - WA + 2} ${waist + 2} H${cx + WA - 2} L${cx + WA - 6} ${hipY - 2} H${cx - WA + 6}Z" fill="${topD}" opacity=".55"/>` : ''}`);
  } else if (T === 'tank' || T === 'stringer') {
    const strap = T === 'stringer' ? 3 : 5, cut = T === 'stringer' ? 10 : 0;
    const t = `M${cx - NW - 4 - strap} ${sh - 5} L${cx - NW - 4} ${sh - 5} Q${cx - 6} ${sh + 16 + cut} ${cx} ${sh + 16 + cut} Q${cx + 6} ${sh + 16 + cut} ${cx + NW + 4} ${sh - 5} L${cx + NW + 4 + strap} ${sh - 5}
      Q${cx + W - 10 - cut} ${sh + 18 + cut * 2} ${cx + W - 8 - cut * 0.6} ${sh + 30 + cut * 2} Q${cx + WA + 4} ${waist - 14} ${cx + WA + 2.5} ${topEnd} L${cx - WA - 2.5} ${topEnd} Q${cx - WA - 4} ${waist - 14} ${cx - W + 8 + cut * 0.6} ${sh + 30 + cut * 2} Q${cx - W + 10 + cut} ${sh + 18 + cut * 2} ${cx - NW - 4 - strap} ${sh - 5}Z`;
    L.push(part('top', t, topC, pat + fabricLight + `<path d="M${cx - WA + 4} ${topEnd - 12} q6 4 12 2 M${cx + 4} ${topEnd - 8} q6 3 10 0" stroke="${topDD}" stroke-width="1.2" fill="none" opacity=".7"/>`));
  } else {
    const end = topEnd, neckDrop = T === 'sportsbra' ? 9 : 11;
    const t = `M${cx - NW - 10} ${sh - 4} L${cx - NW - 5} ${sh - 4} Q${cx - 7} ${sh + neckDrop} ${cx} ${sh + neckDrop} Q${cx + 7} ${sh + neckDrop} ${cx + NW + 5} ${sh - 4} L${cx + NW + 10} ${sh - 4}
      Q${cx + W - 9} ${sh + 16} ${cx + W - 7.5} ${sh + 27} L${cx + W - 8} ${end} L${cx - W + 8} ${end} L${cx - W + 7.5} ${sh + 27} Q${cx - W + 9} ${sh + 16} ${cx - NW - 10} ${sh - 4}Z`;
    L.push(part('top', t, topC, pat + fabricLight + `<path d="M${cx - W + 8} ${end - 3} H${cx + W - 8}" stroke="${topDD}" stroke-width="4"/>${T === 'sportsbra' ? `<path d="M${cx - 9} ${sh + 4} Q${cx} ${sh + 16} ${cx + 9} ${sh + 4}" stroke="${topDD}" stroke-width="1" fill="none"/>` : ''}`));
  }
  // gear on the torso
  if (gear.has('belt')) L.push(`<path d="M${X(-1, WA + 4)} ${waist - 6} Q${cx} ${waist - 9} ${X(1, WA + 4)} ${waist - 6} L${X(1, WA + 4.5)} ${waist + 9} Q${cx} ${waist + 6} ${X(-1, WA + 4.5)} ${waist + 9}Z" fill="#6a3d22"/>
    <path d="M${X(-1, WA + 4)} ${waist + 1} Q${cx} ${waist - 2} ${X(1, WA + 4)} ${waist + 1}" stroke="#4f2c17" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/>
    <rect x="${cx - 7}" y="${waist - 7}" width="14" height="14" rx="2.5" fill="none" stroke="#d6b062" stroke-width="2.4"/>`);
  if (gear.has('medal')) L.push(`<path d="M${cx - NW - 2} ${sh - 4} L${cx - 2} ${sh + 26} M${cx + NW + 2} ${sh - 4} L${cx + 2} ${sh + 26}" stroke="#4a8396" stroke-width="3"/><circle cx="${cx}" cy="${sh + 31}" r="6.5" fill="#e0b443" stroke="#b5861f" stroke-width="1.6"/><path d="M${cx - 2.5} ${sh + 31} l2 2 3.5 -4" stroke="#8a6414" stroke-width="1.2" fill="none"/>`);
  [-1, 1].forEach(s => {
    const y = hipY + 8;
    if (gear.has('gloves')) return L.push(`<path d="M${X(s, W - 6)} ${y - 6} Q${X(s, W - 9)} ${y + 12} ${X(s, W - 1)} ${y + 20} Q${X(s, W + 8)} ${y + 22} ${X(s, W + 10)} ${y + 10} Q${X(s, W + 10)} ${y - 4} ${X(s, W + 7)} ${y - 6}Z" fill="${s > 0 ? '#972d27' : '#b9362f'}"/><rect x="${Math.min(X(s, W - 6), X(s, W + 7))}" y="${y - 10}" width="13" height="6" rx="2.5" fill="#efe9dc"/>`);
    if (c.wristbands) L.push(`<rect x="${Math.min(X(s, W - 2.5), X(s, W + 6.5))}" y="${y - 3}" width="9.5" height="5" rx="2" fill="${topC === '#ece6d6' ? '#2f5a46' : '#efe9dc'}"/>`);
    if (c.watch && s < 0 && !c.wristbands) L.push(`<rect x="${X(s, W + 6.8)}" y="${y - 3.5}" width="9.8" height="5" rx="1.6" fill="#24292c"/><rect x="${X(s, W + 4.4)}" y="${y - 4.5}" width="5" height="7" rx="1.4" fill="#3b4146" stroke="#8a8f94" stroke-width=".5"/>`);
  });

  // necklace
  if (c.necklace !== 'none') {
    const nk = `M${cx - NW - 1.5} ${sh - 4} Q${cx} ${sh + 10} ${cx + NW + 1.5} ${sh - 4}`;
    if (c.necklace === 'chain' || c.necklace === 'pendant') L.push(`<path d="${nk}" stroke="#d6b062" stroke-width="1" fill="none" stroke-dasharray="1 .5"/>${c.necklace === 'pendant' ? `<path d="M${cx} ${sh + 3} l2.4 3.2 -2.4 3.2 -2.4 -3.2Z" fill="#e0b443" stroke="#a87b16" stroke-width=".5"/>` : ''}`);
    else {
      const beads = Array.from({ length: 13 }, (_, i) => { const t = i / 12, x = (1 - t) * (1 - t) * (cx - NW - 1.5) + 2 * (1 - t) * t * cx + t * t * (cx + NW + 1.5), y = (1 - t) * (1 - t) * (sh - 4) + 2 * (1 - t) * t * (sh + 10) + t * t * (sh - 4);
        return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${c.necklace === 'pearls' ? 1.05 : 1.25}" fill="${c.necklace === 'pearls' ? '#f4efe6' : ['#c4573d', '#e3a02f', '#4a8396', '#2f5a46'][i % 4]}" stroke="${c.necklace === 'pearls' ? '#cfc6b4' : 'none'}" stroke-width=".3"/>`; });
      L.push(beads.join(''));
    }
  }
  const hatC = c.hatColor, hatD = shadeHex(hatC, -0.22), hatL = shadeHex(hatC, 0.18);
  if (hijab) L.push(part('hijabDrape', `M${cx - F0.cw - 4} ${hy - 6} C${cx - F0.cw - 6} ${hy + 12} ${cx - W + 6} ${sh - 2} ${cx - W + 4} ${sh + 16} Q${cx} ${sh + 30} ${cx + W - 4} ${sh + 16} C${cx + W - 6} ${sh - 2} ${cx + F0.cw + 6} ${hy + 12} ${cx + F0.cw + 4} ${hy - 6} C${cx + F0.cw + 4} ${headTop - 10} ${cx - F0.cw - 4} ${headTop - 10} ${cx - F0.cw - 4} ${hy - 6}Z`, hatC,
    `<path d="M${cx - W + 10} ${sh + 4} Q${cx - 8} ${sh + 20} ${cx + 6} ${sh + 24} M${cx + W - 10} ${sh} Q${cx + 4} ${sh + 14} ${cx - 10} ${sh + 22}" stroke="${hatD}" stroke-width="1.2" fill="none" opacity=".7"/>`));

  // ---------- ears ----------
  const ER = { small: [0.82, 0], average: [1, 0], large: [1.22, 0.4], protruding: [1.08, 1.8] }[c.ears];
  if (!hijab) [-1, 1].forEach(s => {
    const k2 = ER[0], out = ER[1], ex = X(s, hw - 1), top = hy - 4.5 * k2, bot = hy + 7.5 * k2;
    L.push(`<path d="M${ex} ${top + 1} Q${X(s, hw + (4.6 + out) * k2)} ${top - 1.2} ${X(s, hw + (3.6 + out) * k2)} ${(top + bot) / 2} Q${X(s, hw + (2.8 + out * 0.7) * k2)} ${bot} ${ex} ${bot - 0.5}Z" fill="${s > 0 ? skinD : skin}"/>
      <path d="M${X(s, hw + 0.6)} ${top + 2} q${s * 2 * k2} 2.5 ${s * 0.3} ${5 * k2}" stroke="${skinDD}" stroke-width=".9" fill="none" opacity=".6"/>
      ${(() => { const ex2 = X(s, hw + 1.5 * k2 + out * 0.5), ey = bot - 1.2; return {
        stud: `<circle cx="${ex2}" cy="${ey}" r="1" fill="#e0b443" stroke="#a87b16" stroke-width=".4"/>`,
        hoops: `<circle cx="${ex2}" cy="${ey + 2.6}" r="2.6" fill="none" stroke="#d6b062" stroke-width=".8"/>`,
        drops: `<path d="M${ex2} ${ey} v2.4" stroke="#d6b062" stroke-width=".5"/><path d="M${ex2} ${ey + 2.4} q1.6 2.4 0 3.8 q-1.6 -1.4 0 -3.8Z" fill="#4a8396" stroke="#d6b062" stroke-width=".4"/>`
      }[c.earrings] || ''; })()}`);
  });

  // ---------- head ----------
  const F = FACE;
  const headD = `M${cx} ${headTop} C${cx + F.fw * 0.75} ${headTop} ${cx + F.fw} ${hy - 12} ${cx + F.cw} ${hy - 1}
    C${cx + F.cw} ${hy + 8} ${cx + F.jw} ${chin - 9} ${cx + F.chw} ${chin - 3} Q${cx} ${chin + 1.5} ${cx - F.chw} ${chin - 3}
    C${cx - F.jw} ${chin - 9} ${cx - F.cw} ${hy + 8} ${cx - F.cw} ${hy - 1} C${cx - F.fw} ${hy - 12} ${cx - F.fw * 0.75} ${headTop} ${cx} ${headTop}Z`;
  const freckles = c.freckles ? `<g fill="${shadeHex(skin, -0.35)}" opacity=".55">${[[-8, 6.5], [-6.2, 7.6], [-9.6, 7.8], [-7.4, 9], [-4.6, 6.8], [8, 6.5], [6.2, 7.6], [9.6, 7.8], [7.4, 9], [4.6, 6.8], [-1.4, 4.6], [1.6, 4.2], [0, 5.6]]
    .map(([x, y]) => `<circle cx="${cx + x}" cy="${eyeY + y}" r=".42"/>`).join('')}</g>` : '';
  const lines = (c.foreheadLines ? `<path d="M${cx - 7} ${headTop + 9} q7 -1.6 14 0 M${cx - 6} ${headTop + 11.8} q6 -1.3 12 0" stroke="${lineC}" stroke-width=".55" fill="none" opacity=".55"/>` : '')
    + (c.smileLines ? `<path d="M${cx - NOSE[1] - 1.4} ${noseTip - 0.6} Q${cx - NOSE[1] - 4.4} ${mouthY - 2} ${cx - 6.2} ${mouthY + 2.6} M${cx + NOSE[1] + 1.4} ${noseTip - 0.6} Q${cx + NOSE[1] + 4.4} ${mouthY - 2} ${cx + 6.2} ${mouthY + 2.6}" stroke="${lineC}" stroke-width=".6" fill="none" opacity=".55"/>
      <path d="M${cx - 11.5} ${eyeY + 0.8} l-1.6 -.8 M${cx - 11.6} ${eyeY + 1.8} l-1.8 .3 M${cx + 11.5} ${eyeY + 0.8} l1.6 -.8 M${cx + 11.6} ${eyeY + 1.8} l1.8 .3" stroke="${lineC}" stroke-width=".45" opacity=".5"/>` : '');
  L.push(part('head', headD, skin, `<path d="M${cx + F.cw * 0.5} ${headTop - 4} Q${cx + F.cw * 0.78} ${hy} ${cx + F.cw * 0.45} ${chin + 4} H${cx + 30} V${headTop - 4}Z" fill="${skinD}" opacity=".35"/>
    <path d="M${cx - F.cw * 0.75} ${hy - 9} Q${cx - F.cw * 0.4} ${headTop + 3} ${cx} ${headTop + 2}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".45"/>
    <ellipse cx="${cx - 7.5}" cy="${eyeY + 8}" rx="3.5" ry="2" fill="#d97a62" opacity=".12"/><ellipse cx="${cx + 7.5}" cy="${eyeY + 8}" rx="3.5" ry="2" fill="#d97a62" opacity=".08"/>
    <path d="M${cx - 4} ${chin - 2.5} Q${cx} ${chin - 1} ${cx + 4} ${chin - 2.5}" stroke="${skinD}" stroke-width="1.6" fill="none" opacity=".5"/>
    ${freckles}${lines}`));

  // ---------- beard (under the features) ----------
  const BD = c.beard, Lx = cx - F.cw, Rx = cx + F.cw;
  const beardArea = (drop, top = hy - 4, wide = 0) => `M${Lx + 0.6} ${top} L${Lx + 2.8} ${top} Q${Lx + 3.4} ${eyeY + 6.5} ${cx - 5.6} ${mouthY - 2.4} Q${cx} ${mouthY - 3.8} ${cx + 5.6} ${mouthY - 2.4} Q${Rx - 3.4} ${eyeY + 6.5} ${Rx - 2.8} ${top} L${Rx - 0.6} ${top}
      C${Rx + 0.2 + wide} ${hy + 8} ${cx + F.chw + 4 + wide * 1.5} ${chin - 2 + drop * 0.5} ${cx} ${chin + drop} C${cx - F.chw - 4 - wide * 1.5} ${chin - 2 + drop * 0.5} ${Lx - 0.2 - wide} ${hy + 8} ${Lx + 0.6} ${top}Z
      M${cx - 5.4} ${mouthY} Q${cx} ${mouthY - 2.6} ${cx + 5.4} ${mouthY} Q${cx} ${mouthY + 4} ${cx - 5.4} ${mouthY}Z`;
  const tache = (wide = 0) => `M${cx - 6 - wide} ${mouthY - 0.1 + wide * 0.1} Q${cx - 5} ${mouthY - 3.4} ${cx - 1.2} ${mouthY - 3.7} Q${cx} ${mouthY - 3.2} ${cx + 1.2} ${mouthY - 3.7} Q${cx + 5} ${mouthY - 3.4} ${cx + 6 + wide} ${mouthY - 0.1 + wide * 0.1} Q${cx + 3} ${mouthY - 1.5} ${cx} ${mouthY - 1.3} Q${cx - 3} ${mouthY - 1.5} ${cx - 6 - wide} ${mouthY - 0.1 + wide * 0.1}Z`;
  const goatee = point => `M${cx - 4.4} ${mouthY + 2.4} Q${cx - 5.4} ${chin - 1} ${cx} ${chin + 1.4 + point} Q${cx + 5.4} ${chin - 1} ${cx + 4.4} ${mouthY + 2.4} Q${cx + 2} ${mouthY + 3.2} ${cx} ${mouthY + 3.6} Q${cx - 2} ${mouthY + 3.2} ${cx - 4.4} ${mouthY + 2.4}Z`;
  const textured = (d, rule = 'nonzero') => `<g filter="url(#${uid}-rough)"><path d="${d}" fill="${beardC}" fill-rule="${rule}"/><path d="${d}" fill="url(#${uid}-beardTex)" fill-rule="${rule}" opacity=".55"/></g>`;
  if (BD === 'stubble' || BD === 'heavyStubble') {
    const d = beardArea(0.4), o = BD === 'stubble' ? [0.12, 0.55] : [0.26, 0.85];
    L.push(`<path d="${d}" fill="${beardC}" fill-rule="evenodd" opacity="${o[0]}"/><path d="${d}" fill="url(#${uid}-stubTex)" fill-rule="evenodd" opacity="${o[1]}"/><path d="${tache()}" fill="${beardC}" opacity="${o[0] + 0.08}"/>`);
  }
  if (['short', 'full', 'long', 'bushy'].includes(BD)) {
    const drop = { short: 1.6, full: 7, long: 16, bushy: 10 }[BD];
    L.push(textured(beardArea(drop, hy - 4, BD === 'bushy' ? 2.6 : 0), 'evenodd'));
    L.push(`<path d="M${cx + 2} ${mouthY + 3} Q${cx + F.cw - 3} ${chin - 4} ${cx + 1} ${chin + drop - 1}" stroke="${beardD}" stroke-width="3" fill="none" opacity=".45"/>`);
  }
  if (BD === 'goatee' || BD === 'vandyke' || BD === 'circle') L.push(textured(goatee(BD === 'vandyke' ? 4 : 0)));
  if (BD === 'circle') L.push(`<g filter="url(#${uid}-rough)"><path d="M${cx - 5.6} ${mouthY - 0.4} Q${cx - 6.4} ${mouthY + 2} ${cx - 4.2} ${mouthY + 3} M${cx + 5.6} ${mouthY - 0.4} Q${cx + 6.4} ${mouthY + 2} ${cx + 4.2} ${mouthY + 3}" stroke="${beardC}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`);
  if (BD === 'soulPatch') L.push(textured(`M${cx - 1.7} ${mouthY + 3} Q${cx} ${mouthY + 6.8} ${cx + 1.7} ${mouthY + 3} Q${cx} ${mouthY + 3.5} ${cx - 1.7} ${mouthY + 3}Z`));
  if (BD === 'mutton') [-1, 1].forEach(s => L.push(textured(`M${X(s, F.cw - 0.6)} ${hy - 4} L${X(s, F.cw - 3)} ${hy - 4} Q${X(s, F.cw - 3.8)} ${eyeY + 6} ${X(s, 6.2)} ${mouthY - 0.6} Q${X(s, 6.8)} ${mouthY + 3} ${X(s, 8.4)} ${chin - 4} Q${X(s, F.cw - 2)} ${chin - 6} ${X(s, F.cw + 0.3)} ${hy + 6}Z`)));
  if (BD === 'chinstrap') L.push(`<g filter="url(#${uid}-rough)"><path d="M${Lx + 1.6} ${hy - 4} C${Lx + 1.2} ${hy + 8} ${cx - F.chw - 3} ${chin - 2} ${cx} ${chin - 0.4} C${cx + F.chw + 3} ${chin - 2} ${Rx - 1.2} ${hy + 8} ${Rx - 1.6} ${hy - 4}" stroke="${beardC}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`);

  // ---------- eyes ----------
  const EY = { almond: [3, 2.3, 1.6, 0], round: [2.8, 2.9, 2.3, 0], hooded: [3, 1.7, 1.6, 0.2], narrow: [3.2, 1.5, 1.0, 0], wide: [3.4, 2.7, 2, 0], downturned: [3, 2.2, 1.6, 0.8], upturned: [3, 2.2, 1.6, -0.8] }[c.eyes];
  const eyeX = 5.4 + (F.cw - 14.5) * 0.15;
  [-1, 1].forEach(s => {
    const ex = X(s, eyeX), [w, up, lo, tilt] = EY;
    const ix = ex - s * w, ox = ex + s * w, iy = eyeY - tilt * 0.3, oy = eyeY + tilt;
    const shape = `M${ix} ${iy} Q${ex} ${eyeY - up * 1.1} ${ox} ${oy} Q${ex} ${eyeY + lo * 1.05} ${ix} ${iy}Z`;
    const id = `${uid}-eye${s}`, ir = Math.min(1.6, 0.9 + up * 0.28);
    defs.push(`<clipPath id="${id}"><path d="${shape}"/></clipPath>`);
    L.push(`<path d="${shape}" fill="#f6f1ea"/><g clip-path="url(#${id})">
        <circle cx="${ex + s * 0.1}" cy="${eyeY - 0.05}" r="${ir}" fill="${c.eyeColor}"/><circle cx="${ex + s * 0.1}" cy="${eyeY - 0.05}" r="${ir}" fill="none" stroke="${shadeHex(c.eyeColor, -0.45)}" stroke-width=".35"/>
        <circle cx="${ex + s * 0.1}" cy="${eyeY - 0.05}" r="${ir * 0.45}" fill="#140e0b"/><circle cx="${ex + s * 0.1 + 0.5}" cy="${eyeY - 0.6}" r=".38" fill="#fff"/>
        <path d="M${ix - 1} ${eyeY - up - 1} H${ox + 1} V${eyeY - up * 0.45} Q${ex} ${eyeY - up * 0.15} ${ix - 1} ${eyeY - up * 0.45}Z" fill="#000" opacity=".12"/>
        ${c.eyes === 'hooded' ? `<path d="M${ix - 1} ${eyeY - 3} H${ox + 1} V${eyeY - 0.7} Q${ex} ${eyeY - 1.1} ${ix - 1} ${eyeY - 0.7}Z" fill="${skinD}"/>` : ''}</g>
      <path d="M${ix - s * 0.2} ${iy} Q${ex} ${eyeY - up * 1.12} ${ox + s * 0.3} ${oy - 0.2}" stroke="${ink}" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M${ox} ${oy - 0.2} l${s * 0.9} ${-0.6}" stroke="${ink}" stroke-width=".6" stroke-linecap="round"/>
      <path d="M${ix + s * 0.6} ${iy + 0.4} Q${ex} ${eyeY + lo * 1.05} ${ox - s * 0.2} ${oy + 0.2}" stroke="${skinDD}" stroke-width=".45" fill="none" opacity=".6"/>
      <path d="M${ix + s * 0.3} ${eyeY - up - 0.9} Q${ex} ${eyeY - up - 2.1} ${ox} ${oy - up * 0.6 - 0.6}" stroke="${skinDD}" stroke-width=".5" fill="none" opacity="${c.eyes === 'hooded' ? 0.75 : 0.35}"/>`);
  });

  // ---------- brows ----------
  const BR = { natural: [1.1, 1.6, 0.2], thin: [0.6, 1.4, 0.3], thick: [1.8, 1.5, 0.2], arched: [1, 2.8, 0.6], straight: [1.2, 0.3, 0], bushy: [2.2, 1.6, 0.1], angled: [1.2, 2.2, 0.9] }[c.brows];
  const browC = shadeHex(hatOn || c.hair === 'bald' ? beardC : hairC, -0.08);
  [-1, 1].forEach(s => {
    const [t, arch, drop] = BR, by = eyeY - 4.2, xi = X(s, 2.2), xo = X(s, eyeX + 3.8), xp = X(s, eyeX + 0.6);
    const peak = c.brows === 'angled' ? `L${xp} ${by - arch}` : `Q${xp} ${by - arch * 1.3}`;
    const d = c.brows === 'angled'
      ? `M${xi} ${by + 0.3} L${xp} ${by - arch} L${xo} ${by + drop} L${xo - s * 0.4} ${by + drop + t * 0.5} L${xp} ${by - arch + t} L${xi} ${by + 0.3 + t}Z`
      : `M${xi} ${by + 0.3} ${peak} ${xo} ${by + drop} Q${xp} ${by - arch * 1.3 + t * 1.6} ${xi} ${by + 0.3 + t}Z`;
    L.push(`<path d="${d}" fill="${browC}"/>${c.brows === 'bushy' || c.brows === 'thick' ? `<path d="M${xi + s * 0.8} ${by + 1.2} l${s * 0.6} -1.4 M${xi + s * 2} ${by + 0.8} l${s * 0.6} -1.6 M${xi + s * 3.2} ${by + 0.2} l${s * 0.7} -1.6" stroke="${shadeHex(browC, 0.2)}" stroke-width=".35" opacity=".8"/>` : ''}`);
  });

  // ---------- nose ----------
  {
    const [len, nw] = NOSE, top = eyeY + 0.5, tip = noseTip;
    const bump = c.nose === 'roman' ? 1.1 : 0;
    L.push(`<path d="M${cx + 0.6} ${top} Q${cx + 2 + bump} ${(top + tip) / 2} ${cx + nw * 0.75} ${tip - 1} Q${cx + nw + 0.8} ${tip + 0.6} ${cx + nw * 0.5} ${tip + 1.4} L${cx + 6} ${tip + 1.4} L${cx + 6} ${top}Z" fill="${skinD}" opacity=".45"/>
      <path d="M${cx + 0.9} ${top + 2.4} Q${cx + 2.2 + bump} ${(top + tip) / 2 + 0.6} ${cx + nw * 0.7} ${tip - 0.6}" stroke="${skinDD}" stroke-width=".6" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M${cx - nw - 0.2} ${tip - 0.2} Q${cx - nw - 0.7} ${tip + 1.4} ${cx - nw * 0.45} ${tip + 1.4}" stroke="${skinDD}" stroke-width=".6" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M${cx + nw + 0.2} ${tip - 0.2} Q${cx + nw + 0.7} ${tip + 1.4} ${cx + nw * 0.45} ${tip + 1.4}" stroke="${skinDD}" stroke-width=".6" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M${cx - nw * 0.45} ${tip + 1.5} Q${cx} ${tip + 2.1} ${cx + nw * 0.45} ${tip + 1.5}" stroke="${skinD}" stroke-width=".7" fill="none" opacity=".6"/>
      <ellipse cx="${cx - nw * 0.4}" cy="${tip + 1.05}" rx="${0.45 + nw * 0.1}" ry=".32" fill="${shadeHex(skin, -0.55)}" opacity=".6"/><ellipse cx="${cx + nw * 0.4}" cy="${tip + 1.05}" rx="${0.45 + nw * 0.1}" ry=".32" fill="${shadeHex(skin, -0.55)}" opacity=".7"/>
      <ellipse cx="${cx - 0.6}" cy="${tip - 0.6}" rx="${0.6 + nw * 0.15}" ry=".55" fill="${skinL}" opacity=".7"/>
      ${c.mole ? `<circle cx="${cx + 6.6}" cy="${mouthY - 2.2}" r=".55" fill="#4a2f22"/>` : ''}`);
  }

  // ---------- mouth ----------
  {
    const m = mouthY, lipBase = mixHex(skin, '#b0504a', 0.32), up = shadeHex(lipBase, -0.16), low = shadeHex(lipBase, 0.04), ln = shadeHex(skin, -0.42), M = c.mouth;
    const w = M === 'full' ? 4.6 : M === 'thin' ? 4.2 : 4.4;
    if (M === 'grin') {
      defs.push(`<clipPath id="${uid}-mouth"><path d="M${cx - 5} ${m - 1} Q${cx} ${m + 5.2} ${cx + 5} ${m - 1} Q${cx} ${m + 0.2} ${cx - 5} ${m - 1}Z"/></clipPath>`);
      L.push(`<path d="M${cx - 5} ${m - 1} Q${cx} ${m + 5.2} ${cx + 5} ${m - 1} Q${cx} ${m + 0.2} ${cx - 5} ${m - 1}Z" fill="#5a2a26"/>
        <g clip-path="url(#${uid}-mouth)"><rect x="${cx - 5}" y="${m - 1}" width="10" height="2.4" fill="#f4efe6"/><path d="M${cx - 1.6} ${m - 1} v2.3 M${cx + 1.6} ${m - 1} v2.3" stroke="#d9d2c4" stroke-width=".3"/><ellipse cx="${cx}" cy="${m + 3.6}" rx="2.6" ry="1.2" fill="#a8504a"/></g>
        <path d="M${cx - 5.3} ${m - 1.1} Q${cx} ${m - 0.3} ${cx + 5.3} ${m - 1.1}" stroke="${up}" stroke-width="1" fill="none" stroke-linecap="round"/>
        <path d="M${cx - 4.8} ${m - 0.3} Q${cx} ${m + 5.8} ${cx + 4.8} ${m - 0.3}" stroke="${low}" stroke-width="1" fill="none"/>`);
    } else {
      const lift = M === 'smile' ? 1.1 : 0, smirkR = M === 'smirk' ? 1.4 : 0;
      const lc = [cx - w, m - lift], rc = [cx + w, m - lift - smirkR];
      const upH = M === 'full' ? 1.7 : M === 'thin' ? 0.7 : 1.2, loH = M === 'full' ? 4.6 : M === 'thin' ? 1.8 : 3;
      L.push(`<path d="M${lc[0]} ${lc[1]} Q${cx - 1.6} ${m - upH} ${cx} ${m - upH * 0.55} Q${cx + 1.6} ${m - upH} ${rc[0]} ${rc[1]} Q${cx} ${m + 0.6 - lift} ${lc[0]} ${lc[1]}Z" fill="${up}"/>
        <path d="M${lc[0] + 0.6} ${lc[1] + 0.2} Q${cx} ${m + loH} ${rc[0] - 0.6} ${rc[1] + 0.2} Q${cx} ${m + 0.8 - lift} ${lc[0] + 0.6} ${lc[1] + 0.2}Z" fill="${low}"/>
        <path d="M${cx - 1.2} ${m + loH * 0.45} q1.2 .5 2.4 0" stroke="${skinL}" stroke-width=".7" opacity=".5" fill="none"/>
        <path d="M${lc[0] - 0.3} ${lc[1] - 0.1} Q${cx} ${m + 0.9 - lift} ${rc[0] + 0.3} ${rc[1] - 0.1}" stroke="${ln}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".85"/>
        ${lift || smirkR ? `<path d="M${rc[0] + 0.2} ${rc[1] - 0.2} q${0.8} ${-0.4} ${1} ${-1.2}" stroke="${ln}" stroke-width=".5" fill="none" opacity=".6"/>` : ''}
        ${lift ? `<path d="M${lc[0] - 0.2} ${lc[1] - 0.2} q${-0.8} ${-0.4} ${-1} ${-1.2}" stroke="${ln}" stroke-width=".5" fill="none" opacity=".6"/>` : ''}`);
    }
  }
  // moustache over the lip
  if (['moustache', 'vandyke', 'short', 'full', 'long', 'bushy', 'circle', 'mutton'].includes(BD)) L.push(textured(tache(BD === 'bushy' ? 0.8 : 0)));
  if (BD === 'handlebar') L.push(`<g filter="url(#${uid}-rough)"><path d="${tache(1.6)}" fill="${beardC}"/><path d="M${cx - 7.4} ${mouthY - 0.2} q-2.6 .4 -2.4 -3.2 M${cx + 7.4} ${mouthY - 0.2} q2.6 .4 2.4 -3.2" stroke="${beardC}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="${tache(1.6)}" fill="url(#${uid}-beardTex)" opacity=".6"/></g>`);

  // ---------- hair: hand-drawn artwork, fitted to the head ----------
  const H = hijab ? 'hidden' : c.hair, art = HAIR_ART[H];
  if (art) {
    const [w, h, ax, ay] = art, k = (2 * hw) / HAIR_HEAD_PX;
    // keep the top of the hair at or above the crown so the scalp never peeks out over a thin parting
    const x = r1(cx - ax * k), y = r1(Math.min(headTop + HAIRLINE - ay * k, headTop - 2 - art[5] * k));
    if (hatOn) defs.push(`<clipPath id="${uid}-hatcut"><rect x="0" y="${hy - 7}" width="200" height="400"/></clipPath>`);
    L.push(`<image href="hair/${H}.webp" x="${x}" y="${y}" width="${r1(w * k)}" height="${r1(h * k)}"${hatOn ? ` clip-path="url(#${uid}-hatcut)"` : ''}/>`);
  }
  if (c.hairAcc !== 'none' && !hatOn && !['bald', 'buzz', 'hidden'].includes(H)) {
    const ax = Hx(-17), ay = Hy(-17);
    if (c.hairAcc === 'flower') L.push(`<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${ax}" cy="${r1(ay - 2.2)}" rx="1.5" ry="2.4" fill="#f2a7b6" transform="rotate(${a} ${ax} ${ay})"/>`).join('')}<circle cx="${ax}" cy="${ay}" r="1.2" fill="#e3b341"/></g>`);
    if (c.hairAcc === 'clip') L.push(`<rect x="${ax - 3}" y="${ay - 1}" width="7" height="2" rx="1" fill="#d6b062" transform="rotate(-25 ${ax} ${ay})"/>`);
    if (c.hairAcc === 'bow') L.push(`<g transform="translate(${Hx(12)} ${Hy(-27)}) rotate(15)"><path d="M0 0 L-5 -3 L-5 3Z M0 0 L5 -3 L5 3Z" fill="${hatC}"/><circle r="1.3" fill="${hatD}"/></g>`);
  }
  // ---------- hats and head gear ----------
  if (c.hat === 'cap' || c.hat === 'backwardsCap') {
    const dome = `M${cx - F.fw - 1.2} ${hy - 4} C${cx - F.fw - 1.6} ${headTop - 3} ${cx - 7} ${headTop - 6} ${cx} ${headTop - 6} C${cx + 8} ${headTop - 6} ${cx + F.fw + 1.6} ${headTop - 3} ${cx + F.fw + 1.2} ${hy - 4} Q${cx} ${hy - 8} ${cx - F.fw - 1.2} ${hy - 4}Z`;
    L.push(part('cap', dome, hatC, `<path d="M${cx} ${headTop - 6} V${hy - 6}" stroke="${hatD}" stroke-width=".7"/><path d="M${cx - 8} ${headTop - 3} Q${cx - 9} ${hy - 10} ${cx - 8.5} ${hy - 6.5}" stroke="${hatD}" stroke-width=".6" fill="none"/>`));
    L.push(`<circle cx="${cx}" cy="${headTop - 5.5}" r="1.4" fill="${hatD}"/>`);
    if (c.hat === 'cap') L.push(`<path d="M${cx - F.fw - 2.5} ${hy - 4.5} Q${cx} ${hy - 9.5} ${cx + F.fw + 2.5} ${hy - 4.5} Q${cx + F.fw + 1} ${hy - 0.4} ${cx} ${hy - 1.2} Q${cx - F.fw - 1} ${hy - 0.4} ${cx - F.fw - 2.5} ${hy - 4.5}Z" fill="${hatD}"/><path d="M${cx - F.fw - 1} ${hy - 4} Q${cx} ${hy - 1.6} ${cx + F.fw + 1} ${hy - 4}" stroke="${shadeHex(hatC, -0.4)}" stroke-width=".8" fill="none"/>`);
    else L.push(`<path d="M${cx - 4} ${hy - 6.6} Q${cx} ${hy - 9} ${cx + 4} ${hy - 6.6}" stroke="${hatD}" stroke-width="1.6" fill="none"/><path d="M${cx - 6} ${headTop - 4} Q${cx} ${headTop - 10} ${cx + 6} ${headTop - 4}" fill="${hatD}"/>`);
  }
  if (c.hat === 'beanie') {
    const dome = `M${cx - F.fw - 1.5} ${hy - 3} C${cx - F.fw - 2} ${headTop - 6} ${cx - 8} ${headTop - 9} ${cx} ${headTop - 9} C${cx + 8} ${headTop - 9} ${cx + F.fw + 2} ${headTop - 6} ${cx + F.fw + 1.5} ${hy - 3}Z`;
    L.push(part('beanie', dome, hatC, Array.from({ length: 13 }, (_, i) => `<path d="M${cx - F.fw + i * (F.fw / 6)} ${headTop - 9} V${hy}" stroke="${hatD}" stroke-width=".55" opacity=".6"/>`).join('')));
    L.push(`<path d="M${cx - F.fw - 2} ${hy - 9} Q${cx} ${hy - 12.5} ${cx + F.fw + 2} ${hy - 9} L${cx + F.fw + 1.8} ${hy - 2.6} Q${cx} ${hy - 6} ${cx - F.fw - 1.8} ${hy - 2.6}Z" fill="${hatD}"/>${Array.from({ length: 15 }, (_, i) => `<path d="M${cx - F.fw - 1 + i * ((F.fw + 1) / 7)} ${hy - 10.6} v7" stroke="${shadeHex(hatC, -0.36)}" stroke-width=".5"/>`).join('')}`);
  }
  if (c.hat === 'bucket') {
    L.push(part('bucket', `M${cx - F.fw - 1} ${hy - 6} C${cx - F.fw - 1} ${headTop - 7} ${cx + F.fw + 1} ${headTop - 7} ${cx + F.fw + 1} ${hy - 6}Z`, hatC, `<path d="M${cx - F.fw} ${hy - 9} H${cx + F.fw}" stroke="${hatD}" stroke-width="2"/>`));
    L.push(`<path d="M${cx - F.fw - 6.5} ${hy - 0.5} Q${cx} ${hy - 4.5} ${cx + F.fw + 6.5} ${hy - 0.5} L${cx + F.fw + 1.6} ${hy - 7} Q${cx} ${hy - 9.5} ${cx - F.fw - 1.6} ${hy - 7}Z" fill="${hatD}"/><path d="M${cx - F.fw - 5} ${hy - 1.5} Q${cx} ${hy - 5} ${cx + F.fw + 5} ${hy - 1.5}" stroke="${shadeHex(hatC, -0.35)}" stroke-width=".5" stroke-dasharray="1 .8" fill="none"/>`);
  }
  if (c.hat === 'bandana') L.push(`<defs><pattern id="${uid}-band" patternUnits="userSpaceOnUse" width="3" height="3"><circle cx="1.5" cy="1.5" r=".55" fill="#f4efe6"/></pattern></defs>
    <path d="M${cx - F.cw - 0.6} ${hy - 10} Q${cx} ${hy - 17} ${cx + F.cw + 0.6} ${hy - 10} L${cx + F.cw + 0.6} ${hy - 5} Q${cx} ${hy - 12} ${cx - F.cw - 0.6} ${hy - 5}Z" fill="${hatC}"/>
    <path d="M${cx - F.cw - 0.6} ${hy - 10} Q${cx} ${hy - 17} ${cx + F.cw + 0.6} ${hy - 10} L${cx + F.cw + 0.6} ${hy - 5} Q${cx} ${hy - 12} ${cx - F.cw - 0.6} ${hy - 5}Z" fill="url(#${uid}-band)"/>
    <path d="M${cx + F.cw} ${hy - 8} l6 4 l-1 4 Z M${cx + F.cw} ${hy - 8} l7 -1 l-1 4Z" fill="${hatD}"/>`);
  if (c.hat === 'headwrap' || c.hat === 'turban') {
    const tall = c.hat === 'headwrap' ? 17 : 12;
    const dome = `M${cx - F.fw - 2.4} ${hy - 4} C${cx - F.fw - 4} ${headTop - tall} ${cx + F.fw + 4} ${headTop - tall} ${cx + F.fw + 2.4} ${hy - 4} Q${cx} ${hy - 11} ${cx - F.fw - 2.4} ${hy - 4}Z`;
    const foldsW = c.hat === 'turban'
      ? `<path d="M${cx - F.fw - 2} ${hy - 7} Q${cx - 2} ${headTop - 2} ${cx + F.fw} ${headTop - tall + 6} M${cx + F.fw + 2} ${hy - 7} Q${cx + 2} ${headTop - 2} ${cx - F.fw} ${headTop - tall + 6} M${cx - F.fw - 1} ${hy - 13} Q${cx} ${hy - 18} ${cx + F.fw + 1} ${hy - 13}" stroke="${hatD}" stroke-width="1.3" fill="none"/>`
      : `<path d="M${cx - F.fw} ${hy - 9} Q${cx - 4} ${headTop - 6} ${cx + 3} ${headTop - tall + 3} M${cx + F.fw} ${hy - 9} Q${cx + 2} ${headTop} ${cx - 4} ${headTop - tall + 5}" stroke="${hatD}" stroke-width="1.2" fill="none"/>`;
    L.push(part(c.hat, dome, hatC, foldsW + `<path d="M${cx - F.fw} ${headTop - 4} Q${cx - F.fw * 0.5} ${headTop - tall + 2} ${cx} ${headTop - tall + 1}" stroke="${hatL}" stroke-width="2" fill="none" opacity=".5"/>`));
    const ky = headTop - tall * 0.75 + 1.5;
    if (c.hat === 'headwrap') L.push(`<ellipse cx="${cx - 3.6}" cy="${ky}" rx="4.4" ry="3" fill="${hatD}" transform="rotate(-25 ${cx - 3.6} ${ky})"/><ellipse cx="${cx + 3.6}" cy="${ky}" rx="4.4" ry="3" fill="${hatC}" transform="rotate(25 ${cx + 3.6} ${ky})"/><circle cx="${cx}" cy="${ky + 1.4}" r="2" fill="${hatD}"/>`);
  }
  if (hijab) {
    const outer = `M${cx - F.cw - 4.5} ${hy} C${cx - F.cw - 4.5} ${headTop - 9} ${cx + F.cw + 4.5} ${headTop - 9} ${cx + F.cw + 4.5} ${hy} C${cx + F.cw + 4} ${chin + 2} ${cx + F.chw + 5} ${chin + 8} ${cx} ${chin + 9} C${cx - F.chw - 5} ${chin + 8} ${cx - F.cw - 4} ${chin + 2} ${cx - F.cw - 4.5} ${hy}Z`;
    const inner = `M${cx - F.cw + 0.4} ${hy + 1} C${cx - F.cw + 0.8} ${hy - 15} ${cx + F.cw - 0.8} ${hy - 15} ${cx + F.cw - 0.4} ${hy + 1} C${cx + F.cw - 0.6} ${chin - 6} ${cx + F.chw + 1.4} ${chin + 0.6} ${cx} ${chin + 1.4} C${cx - F.chw - 1.4} ${chin + 0.6} ${cx - F.cw + 0.6} ${chin - 6} ${cx - F.cw + 0.4} ${hy + 1}Z`;
    defs.push(`<clipPath id="${uid}-hijab"><path d="${outer} ${inner}" clip-rule="evenodd"/></clipPath>`);
    L.push(`<path d="${outer} ${inner}" fill="${hatC}" fill-rule="evenodd"/><g clip-path="url(#${uid}-hijab)"><path d="M${cx - F.cw - 4} ${hy - 4} Q${cx - F.cw - 1} ${hy - 18} ${cx} ${hy - 19}" stroke="${hatL}" stroke-width="2.4" fill="none" opacity=".45"/>
      <path d="M${cx + F.cw + 1} ${hy} Q${cx + F.cw + 3} ${chin} ${cx + 3} ${chin + 6}" stroke="${hatD}" stroke-width="1.4" fill="none" opacity=".7"/></g>
      <path d="${inner}" fill="none" stroke="${hatD}" stroke-width=".9" opacity=".8"/>`);
  }
  if (gear.has('headband') && !hatOn && c.hat !== 'bandana') L.push(`<path d="M${cx - F.cw - 0.5} ${hy - 9} Q${cx} ${hy - 15} ${cx + F.cw + 0.5} ${hy - 9} L${cx + F.cw + 0.5} ${hy - 5} Q${cx} ${hy - 11} ${cx - F.cw - 0.5} ${hy - 5}Z" fill="#b9362f"/>
    <path d="M${cx + F.cw} ${hy - 7} q6 1 8 8 M${cx + F.cw} ${hy - 7} q8 -2 10 3" stroke="#b9362f" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  if (c.headphones) L.push(`<path d="M${cx - F.cw - 1.5} ${hy + 1} C${cx - F.cw - 3} ${headTop - 10} ${cx + F.cw + 3} ${headTop - 10} ${cx + F.cw + 1.5} ${hy + 1}" stroke="#2a2a2e" stroke-width="2.6" fill="none"/>
    <rect x="${cx - F.cw - 5}" y="${hy - 5}" width="6.5" height="12" rx="3" fill="#2a2a2e"/><rect x="${cx + F.cw - 1.5}" y="${hy - 5}" width="6.5" height="12" rx="3" fill="#3a3a40"/>`);
  if (c.glasses === 'round') L.push(`<g fill="rgba(255,255,255,.16)" stroke="#2b2420" stroke-width="1"><circle cx="${cx - eyeX}" cy="${eyeY}" r="3.9"/><circle cx="${cx + eyeX}" cy="${eyeY}" r="3.9"/></g><path d="M${cx - eyeX + 3.9} ${eyeY - 0.6} q${eyeX - 3.9} -1.4 ${2 * (eyeX - 3.9)} 0 M${cx - eyeX - 3.9} ${eyeY - 0.8} l-3.6 -.8 M${cx + eyeX + 3.9} ${eyeY - 0.8} l3.6 -.8" stroke="#2b2420" stroke-width=".9" fill="none"/>`);
  if (c.glasses === 'square') L.push(`<g fill="rgba(255,255,255,.16)" stroke="#2b2420" stroke-width="1.15"><rect x="${cx - eyeX - 4}" y="${eyeY - 3.6}" width="8" height="6.4" rx="1.8"/><rect x="${cx + eyeX - 4}" y="${eyeY - 3.6}" width="8" height="6.4" rx="1.8"/></g><path d="M${cx - eyeX + 4} ${eyeY - 1} h${2 * (eyeX - 4)} M${cx - eyeX - 4} ${eyeY - 1.5} l-3.6 -1 M${cx + eyeX + 4} ${eyeY - 1.5} l3.6 -1" stroke="#2b2420" stroke-width="1"/>`);
  if (c.glasses === 'catEye') L.push([-1, 1].map(s => `<path d="M${X(s, eyeX - 3.6)} ${eyeY - 2.2} Q${X(s, eyeX)} ${eyeY - 3.6} ${X(s, eyeX + 4.6)} ${eyeY - 4.4} Q${X(s, eyeX + 4.2)} ${eyeY + 2.2} ${X(s, eyeX)} ${eyeY + 2.6} Q${X(s, eyeX - 3.8)} ${eyeY + 2.4} ${X(s, eyeX - 3.6)} ${eyeY - 2.2}Z" fill="rgba(255,255,255,.14)" stroke="#2b2420" stroke-width="1.2"/>`).join('') + `<path d="M${cx - eyeX + 3.6} ${eyeY - 1.4} Q${cx} ${eyeY - 2.4} ${cx + eyeX - 3.6} ${eyeY - 1.4}" stroke="#2b2420" stroke-width=".9" fill="none"/>`);
  if (c.glasses === 'aviator') L.push([-1, 1].map(s => `<path d="M${X(s, eyeX - 3.8)} ${eyeY - 2.8} Q${X(s, eyeX)} ${eyeY - 3.6} ${X(s, eyeX + 4.2)} ${eyeY - 2.8} Q${X(s, eyeX + 4.4)} ${eyeY + 2.6} ${X(s, eyeX + 0.6)} ${eyeY + 3.4} Q${X(s, eyeX - 3.6)} ${eyeY + 2.8} ${X(s, eyeX - 3.8)} ${eyeY - 2.8}Z" fill="#6b4a2c" fill-opacity=".55" stroke="#c9a54e" stroke-width=".8"/>`).join('') + `<path d="M${cx - eyeX + 3.8} ${eyeY - 2.4} Q${cx} ${eyeY - 3.6} ${cx + eyeX - 3.8} ${eyeY - 2.4} M${cx - eyeX + 3.6} ${eyeY - 0.8} H${cx + eyeX - 3.6}" stroke="#c9a54e" stroke-width=".7" fill="none"/>`);
  if (c.glasses === 'heart') L.push([-1, 1].map(s => { const hx = X(s, eyeX), y0 = eyeY - 1.6; return `<path d="M${hx} ${y0 + 0.6} C${hx - 1} ${y0 - 2.6} ${hx - 5.4} ${y0 - 1.6} ${hx - 4.4} ${y0 + 1.6} C${hx - 3.6} ${y0 + 3.4} ${hx - 1.4} ${y0 + 4.4} ${hx} ${y0 + 5.6} C${hx + 1.4} ${y0 + 4.4} ${hx + 3.6} ${y0 + 3.4} ${hx + 4.4} ${y0 + 1.6} C${hx + 5.4} ${y0 - 1.6} ${hx + 1} ${y0 - 2.6} ${hx} ${y0 + 0.6}Z" fill="#d9475f" fill-opacity=".6" stroke="#b02e47" stroke-width=".9"/>`; }).join('') + `<path d="M${cx - eyeX + 4.2} ${eyeY - 1} H${cx + eyeX - 4.2}" stroke="#b02e47" stroke-width=".8"/>`);
  if (c.glasses === 'sport') L.push(`<path d="M${cx - eyeX - 5.5} ${eyeY - 3.4} Q${cx} ${eyeY - 5.2} ${cx + eyeX + 5.5} ${eyeY - 3.4} L${cx + eyeX + 4.6} ${eyeY + 1.4} Q${cx + eyeX} ${eyeY + 3.4} ${cx + 1.6} ${eyeY + 1.6} L${cx} ${eyeY + 0.4} L${cx - 1.6} ${eyeY + 1.6} Q${cx - eyeX} ${eyeY + 3.4} ${cx - eyeX - 4.6} ${eyeY + 1.4}Z" fill="#20262b"/>
    <path d="M${cx - eyeX - 3} ${eyeY - 2.4} Q${cx - eyeX} ${eyeY - 3.2} ${cx - eyeX + 2.6} ${eyeY - 2.6}" stroke="#7fb3c8" stroke-width=".9" fill="none" opacity=".8"/>`);
  if (gear.has('crown') && !hatOn) L.push(`<path d="M${cx - 9.5} ${headTop + 2} L${cx - 8.5} ${headTop - 9} L${cx - 3.5} ${headTop - 3} L${cx} ${headTop - 12} L${cx + 3.5} ${headTop - 3} L${cx + 8.5} ${headTop - 9} L${cx + 9.5} ${headTop + 2}Z" fill="#e0b443" stroke="#a87b16" stroke-width="1.1" stroke-linejoin="round"/><circle cx="${cx}" cy="${headTop - 2}" r="1.6" fill="#b9362f"/>`);

  // ---------- frame + paper grain ----------
  const frameC = { bronze: '#b8794a', silver: '#a2adb2', gold: '#d4a52c', elite: '#2f5a46', master: '#6b4f8a' }[opts.frame];
  if (opts.scenery !== false && frameC) L.push(`<rect x="6" y="6" width="188" height="388" rx="30" fill="none" stroke="${frameC}" stroke-width="5"/><rect x="10.5" y="10.5" width="179" height="379" rx="26" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>`);
  if (!opts.lite) defs.push(`<filter id="${uid}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 -.02" result="w"/><feComposite in="w" in2="SourceGraphic" operator="in" result="g"/>
    <feBlend in="SourceGraphic" in2="g" mode="soft-light"/></filter>`);
  const views = {
    full: '0 0 200 400', figure: '30 24 140 360',
    bust: `${cx - 34} ${r1(headTop - 19)} 68 68`,
    face: `${cx - 40} ${r1(headTop - 26)} 80 80`,
    eyes: `${cx - 13} ${r1(eyeY - 7)} 26 13`,
    brows: `${cx - 13} ${r1(eyeY - 8.5)} 26 13`,
    nose: `${cx - 8} ${r1(eyeY - 1)} 16 ${r1(noseTip - eyeY + 4.5)}`,
    mouth: `${cx - 9} ${r1(mouthY - 5)} 18 10`,
    neck: `${cx - 24} ${r1(chin - 6)} 48 32`,
    upper: `${cx - 54} ${r1(headTop - 22)} 108 144`
  };
  const vb = views[opts.view] || views.full;
  return `<svg class="avatarSvg" viewBox="${vb}" role="img" aria-label="Your character" xmlns="http://www.w3.org/2000/svg"><defs>${defs.join('')}</defs><g${opts.lite ? '' : ` filter="url(#${uid}-grain)"`}>${L.join('')}</g></svg>`;
}
if (typeof module !== 'undefined') module.exports = { renderAvatar, normalizeAvatar, AVATAR_OPTIONS, AVATAR_DEFAULT, HAIR_ART };
