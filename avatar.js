// NextForm character: a layered, full-body SVG drawn from simple choices.
// Painted-illustration look to sit beside the welcome artwork: realistic proportions (about 8 heads tall),
// soft form shading from the upper left, clothing seams and folds, and a light paper grain.
const AVATAR_OPTIONS = {
  skin: ['#f3d3bb', '#e8b994', '#d29a72', '#b07650', '#8a5638', '#5e3a26'],
  face: ['oval', 'round', 'square'],
  build: ['slim', 'athletic', 'broad'],
  height: ['short', 'average', 'tall'],
  hair: ['crop', 'sidepart', 'curly', 'buzz', 'fade', 'long', 'ponytail', 'bun', 'bald'],
  hairColor: ['#1d1815', '#3f281c', '#6e4428', '#a8743f', '#d4ad6a', '#97938c', '#9c4329'],
  facialHair: ['none', 'stubble', 'moustache', 'short', 'full'],
  top: ['tee', 'tank', 'hoodie', 'crop'],
  topColor: ['#2f5a46', '#8fa58f', '#2e3b42', '#d9962f', '#4a8396', '#b9563f', '#ece6d6', '#5f4a7c'],
  bottom: ['shorts', 'joggers', 'leggings'],
  bottomColor: ['#24292c', '#3b4850', '#2f5a46', '#6a675f', '#2a3c5e'],
  shoes: ['#2f5a46', '#ece9df', '#24292c', '#4a8396', '#b9563f', '#d9962f'],
  glasses: [false, true], cap: [false, true], headphones: [false, true], wristbands: [false, true]
};
const AVATAR_DEFAULT = {
  skin: '#d29a72', face: 'oval', build: 'athletic', height: 'average', hair: 'crop', hairColor: '#3f281c',
  facialHair: 'none', top: 'tee', topColor: '#8fa58f', bottom: 'shorts', bottomColor: '#24292c', shoes: '#2f5a46',
  glasses: false, cap: false, headphones: false, wristbands: false, gear: []
};

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
const r1 = v => Math.round(v * 10) / 10;

// cfg: avatar choices. opts: { id, frame: 'novice'|'bronze'|'silver'|'gold'|'elite'|'master', scenery: bool, view: 'full'|'bust' }
function renderAvatar(cfg = {}, opts = {}) {
  const c = { ...AVATAR_DEFAULT, ...cfg };
  const uid = opts.id || 'av' + Math.random().toString(36).slice(2, 7);
  const gear = new Set(c.gear || []);
  const defs = [], L = [];

  // ---------- palette ----------
  const skin = c.skin, skinD = shadeHex(skin, -0.17), skinDD = shadeHex(skin, -0.3), skinL = shadeHex(skin, 0.14);
  const hairC = c.hairColor, hairD = shadeHex(hairC, -0.3), hairL = shadeHex(hairC, 0.28);
  const topC = c.topColor, topD = shadeHex(topC, -0.18), topDD = shadeHex(topC, -0.32), topL = shadeHex(topC, 0.12);
  const botC = c.bottomColor, botD = shadeHex(botC, -0.22), botL = shadeHex(botC, 0.14);
  const ink = '#2b2420';

  // ---------- proportions ----------
  const B = { slim: 0, athletic: 1, broad: 2 }[c.build];
  const W = [33, 38, 44][B], WA = [20, 22.5, 27][B], HIP = [23, 25, 28.5][B], NW = [5.8, 6.8, 8.4][B], LIMB = [0.9, 1, 1.18][B];
  const st = { short: 0.95, average: 1, tall: 1.04 }[c.height];
  const cx = 100, ground = 378, ankle = ground - 11;
  const headH = 40, headW = { oval: 14.5, round: 15.6, square: 15.2 }[c.face];
  const headTop = ground - 318 * st, chin = headTop + headH, hy = headTop + headH * 0.5;
  const sh = chin + 13;                       // shoulder line
  const waist = sh + 62 * st, hipY = sh + 80 * st, crotch = sh + 98 * st;
  const knee = crotch + (ankle - crotch) * 0.48;
  const X = (s, v) => cx + s * v;

  // Fill a shape, then paint shadow/highlight shapes clipped inside it.
  const part = (name, d, base, extras = '') => {
    const id = `${uid}-${name}`;
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    return `<path d="${d}" fill="${base}"/>${extras ? `<g clip-path="url(#${id})">${extras}</g>` : ''}<path d="${d}" fill="url(#${uid}-form)"/>`;
  };

  defs.push(`<linearGradient id="${uid}-form" x1="0" y1="0" x2="1" y2="0.15">
    <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".58" stop-color="#2a1a10" stop-opacity="0"/><stop offset="1" stop-color="#2a1a10" stop-opacity=".3"/></linearGradient>`);
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
      <path d="M10 70 q14 -8 30 -2 q12 -6 22 2" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" fill="none"/>
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

  // ---------- back layer: cape, long hair, ponytail ----------
  if (gear.has('cape')) L.push(`<path d="M${X(-1, W - 6)} ${sh + 2} Q${X(-1, W + 16)} ${hipY + 40} ${X(-1, W + 8)} ${ankle - 26} Q${cx} ${ankle - 14} ${X(1, W + 8)} ${ankle - 26} Q${X(1, W + 16)} ${hipY + 40} ${X(1, W - 6)} ${sh + 2}Z" fill="#9b3527"/>
    <path d="M${cx + 6} ${sh + 4} Q${X(1, W + 4)} ${hipY + 50} ${X(1, W + 8)} ${ankle - 26} Q${X(1, W + 16)} ${hipY + 40} ${X(1, W - 6)} ${sh + 2}Z" fill="#7f2a1f"/>`);
  if (c.hair === 'long') L.push(`<path d="M${cx - headW - 3} ${hy - 4} Q${cx - headW - 9} ${sh + 26} ${cx - headW + 2} ${sh + 40} L${cx + headW - 2} ${sh + 40} Q${cx + headW + 9} ${sh + 26} ${cx + headW + 3} ${hy - 4}Z" fill="${hairD}"/>`);
  if (c.hair === 'ponytail') L.push(`<path d="M${cx + 9} ${hy - 14} Q${cx + 30} ${hy - 12} ${cx + 26} ${hy + 18} Q${cx + 30} ${hy + 36} ${cx + 22} ${sh + 10} Q${cx + 18} ${hy + 30} ${cx + 16} ${hy + 14} Q${cx + 14} ${hy - 2} ${cx + 6} ${hy - 6}Z" fill="${hairD}"/>
    <path d="M${cx + 20} ${hy + 2} q5 14 2 30 M${cx + 24} ${hy + 6} q3 12 -1 26" stroke="${hairL}" stroke-width="1.1" fill="none" opacity=".6"/>`);

  // ---------- legs ----------
  const k = (LIMB - 1) * 6;
  const legD = (s, g = 0) => { // g = extra width for clothing
    const o = v => X(s, v + 2.5);
    return `M${X(s, 0)} ${crotch - 4} L${o(HIP - 2.5 + g * 0.6)} ${hipY - 6}
      Q${o(HIP + 3 + g + k * 0.5)} ${crotch + 20} ${o(13.2 + k + g * 0.8)} ${knee}
      Q${o(17.8 + k * 1.2 + g * 0.8)} ${knee + 24} ${o(9.4 + g * 0.5)} ${ankle - 5}
      L${o(9 + g * 0.5)} ${ankle} L${o(2.2 - g * 0.4)} ${ankle} L${o(1.9 - g * 0.4)} ${ankle - 6}
      Q${o(-1.4 - g * 0.4)} ${knee + 20} ${o(1.6 - g * 0.3)} ${knee + 4}
      Q${o(-2.2 - g * 0.5)} ${knee - 24} ${X(s, 0.4)} ${crotch + 6}Z`;
  };
  const legShade = s => {
    const o = v => X(s, v + 2.5);
    return s > 0
      ? ''
      : `<path d="M${o(HIP - 8)} ${crotch + 8} Q${o(HIP - 4)} ${knee - 26} ${o(11)} ${knee - 6}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".4"/>`;
  };
  [-1, 1].forEach(s => L.push(part(`leg${s}`, legD(s), skin, legShade(s) +
    `<path d="M${X(s, 5)} ${knee - 2} q${s * 4} 4 ${s * 8} 0" stroke="${skinDD}" stroke-width="1.1" fill="none" opacity=".55"/>
     <path d="M${X(s, 8)} ${knee + 10} Q${X(s, 13)} ${knee + 24} ${X(s, 10)} ${knee + 44}" stroke="${skinDD}" stroke-width="1" fill="none" opacity=".35"/>`)));

  // socks (white crew) unless joggers cover them
  if (c.bottom !== 'joggers') [-1, 1].forEach(s => L.push(`<path d="M${X(s, 4.5)} ${ankle - 13} L${X(s, 11.6)} ${ankle - 13} L${X(s, 11.8)} ${ankle + 1} L${X(s, 4.4)} ${ankle + 1}Z" fill="${s > 0 ? '#e2ded4' : '#f3f0e8'}"/><path d="M${X(s, 4.5)} ${ankle - 11.5} H${X(s, 11.6)}" stroke="#d4cfc3" stroke-width="1"/>`));

  // ---------- bottoms ----------
  const pantsTo = c.bottom === 'shorts' ? knee - 10 : c.bottom === 'leggings' ? ankle - 13 : ankle - 2;
  const g = c.bottom === 'leggings' ? 1 : c.bottom === 'shorts' ? 6.5 : 5;
  defs.push(`<clipPath id="${uid}-pants"><path d="M0 ${waist - 4} H200 V${pantsTo} H0Z"/></clipPath>`);
  const hipBlock = `M${X(-1, WA + 1.5)} ${waist - 2} L${X(1, WA + 1.5)} ${waist - 2} Q${X(1, HIP + 4)} ${hipY - 6} ${X(1, HIP + 3.5)} ${hipY + 4} L${X(1, 2)} ${crotch + 6} L${X(-1, 2)} ${crotch + 6} L${X(-1, HIP + 3.5)} ${hipY + 4} Q${X(-1, HIP + 4)} ${hipY - 6} ${X(-1, WA + 1.5)} ${waist - 2}Z`;
  let pants = `<path d="${hipBlock}" fill="${botC}"/>` + [-1, 1].map(s => `<path d="${legD(s, g)}" fill="${botC}"/><path d="${legD(s, g)}" fill="url(#${uid}-form)"/>`).join('');
  if (c.bottom === 'shorts') pants += [-1, 1].map(s => `<path d="M${X(s, 4)} ${crotch + 4} q${s * 6} 8 ${s * 14} 6" stroke="${botD}" stroke-width="1.4" fill="none" opacity=".8"/>`).join('') + `<path d="M${cx} ${waist + 2} V${crotch}" stroke="${botD}" stroke-width="1.2"/>`;
  if (c.bottom === 'joggers') pants += [-1, 1].map(s => `<path d="M${X(s, 6)} ${knee - 6} q${s * 6} 5 ${s * 13} 1 M${X(s, 6)} ${knee + 4} q${s * 6} 4 ${s * 12} 0 M${X(s, 6)} ${ankle - 22} q${s * 5} 4 ${s * 10} 0" stroke="${botD}" stroke-width="1.3" fill="none"/>
      <rect x="${s < 0 ? X(s, 13.5) : X(s, 2.5)}" y="${ankle - 8}" width="11" height="6" rx="2.5" fill="${shadeHex(botC, -0.3)}"/>`).join('');
  if (c.bottom === 'leggings') pants += [-1, 1].map(s => `<path d="M${X(s, HIP + 1.5)} ${hipY} Q${X(s, HIP)} ${knee - 30} ${X(s, 13)} ${knee} Q${X(s, 15)} ${knee + 26} ${X(s, 10.5)} ${pantsTo}" stroke="${botD}" stroke-width="1" fill="none"/>
      <path d="M${X(s, HIP - 6)} ${hipY + 6} Q${X(s, HIP - 4)} ${knee - 26} ${X(s, 10)} ${knee - 6}" stroke="${botL}" stroke-width="3" fill="none" opacity=".45"/>`).join('');
  pants += `<path d="M${X(-1, WA + 1.5)} ${waist + 1} H${X(1, WA + 1.5)}" stroke="${shadeHex(botC, -0.35)}" stroke-width="4"/>`;
  L.push(`<g clip-path="url(#${uid}-pants)">${pants}</g>`);

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
    const o = v => X(s, v), a = (LIMB - 1) * 5;
    return `M${o(W - 9)} ${sh + 22}
      Q${o(W - 11)} ${sh + 38} ${o(W - 7.5)} ${waist - 6}
      Q${o(W - 6.5)} ${waist + 12} ${o(W - 1.5)} ${hipY + 12}
      L${o(W + 5.5 + a * 0.4)} ${hipY + 12}
      Q${o(W + 6.5 + a)} ${waist + 10} ${o(W + 3.5 + a * 0.6)} ${waist - 6}
      Q${o(W + 5 + a)} ${sh + 30} ${o(W + 1.5 + a * 0.5)} ${sh + 10}
      Q${o(W - 2)} ${sh} ${o(W - 9)} ${sh + 6}Z`;
  };
  const handD = s => {
    const o = v => X(s, v), y = hipY + 10;
    return `M${o(W - 2)} ${y} Q${o(W - 4.5)} ${y + 9} ${o(W - 2)} ${y + 16} Q${o(W + 1.5)} ${y + 20} ${o(W + 4.5)} ${y + 15} Q${o(W + 7)} ${y + 8} ${o(W + 5.5)} ${y}Z`;
  };
  [-1, 1].forEach(s => {
    const shade = s > 0 ? '' : `<path d="M${X(s, W + 1)} ${sh + 14} Q${X(s, W + 2.5)} ${sh + 30} ${X(s, W)} ${waist - 10}" stroke="${skinL}" stroke-width="2.4" fill="none" opacity=".6"/>`;
    L.push(part(`arm${s}`, armD(s), skin, shade + `<path d="M${X(s, W - 6)} ${waist - 5} q${s * 4} 3 ${s * 8} 0" stroke="${skinDD}" stroke-width="1" fill="none" opacity=".5"/>`));
    L.push(part(`hand${s}`, handD(s), skin, `<path d="M${X(s, W - 2)} ${hipY + 20} q${s * 3} 3 ${s * 6} 2 M${X(s, W - 1)} ${hipY + 23} q${s * 3} 2 ${s * 5} 1" stroke="${skinDD}" stroke-width=".8" fill="none" opacity=".6"/>`));
  });

  // ---------- torso ----------
  // Sloped trapezius, rounded deltoids, ribcage tapering to the waist, then hips.
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
  const skinTorsoShade = `    <path d="M${cx - W * 0.6} ${sh + 22} Q${cx - 6} ${sh + 30} ${cx - 2} ${sh + 22} M${cx + 2} ${sh + 22} Q${cx + 6} ${sh + 30} ${cx + W * 0.6} ${sh + 22}" stroke="${skinDD}" stroke-width="1.2" fill="none" opacity=".45"/>
    <path d="M${cx} ${sh + 30} V${waist + 8} M${cx - 6} ${sh + 42} q6 2 12 0 M${cx - 6} ${sh + 52} q6 2 12 0" stroke="${skinDD}" stroke-width="1" fill="none" opacity=".3"/>
    <path d="M${cx - W + 6} ${sh + 4} Q${cx - W * 0.4} ${sh} ${cx - 10} ${sh + 6}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".5"/>`;
  const fabricShade = (dark, light) => `    <path d="M${cx - W + 8} ${sh + 2} Q${cx - W * 0.4} ${sh - 2} ${cx - 12} ${sh + 4}" stroke="${light}" stroke-width="4" fill="none" opacity=".5"/>`;
  const folds = (y0, col) => `<path d="M${X(-1, W - 8)} ${sh + 28} q8 10 6 26 M${X(1, W - 8)} ${sh + 28} q-8 10 -6 26 M${cx - WA + 3} ${y0 - 10} q6 4 12 2 M${cx + 4} ${y0 - 6} q6 3 10 0" stroke="${col}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>`;

  // neck (behind the collar)
  L.push(part('neck', `M${cx - NW} ${chin - 8} L${cx + NW} ${chin - 8} L${cx + NW + 1.5} ${sh - 2} Q${cx} ${sh + 5} ${cx - NW - 1.5} ${sh - 2}Z`, skin,
    `<path d="M${cx - NW} ${chin - 8} H${cx + NW + 2} V${chin + 2} Q${cx} ${chin + 6} ${cx - NW} ${chin + 2}Z" fill="${skinD}" opacity=".7"/><path d="M${cx - NW} ${chin - 2} Q${cx} ${chin + 4} ${cx + NW} ${chin - 2}" stroke="${skinDD}" stroke-width="3" opacity=".35" fill="none"/>`));

  const topEnd = c.top === 'crop' ? sh + 40 : c.top === 'hoodie' ? hipY + 6 : waist + 14;
  if (c.top === 'crop' || c.top === 'tank') L.push(part('torso-skin', torsoPath(0, waist + 1), skin, skinTorsoShade));
  if (c.top === 'tee' || c.top === 'hoodie') {
    L.push(part('top', torsoPath(2, topEnd), topC, fabricShade(topD, topL) + folds(topEnd, topDD) +
      `<path d="M${X(-1, HIP + 1)} ${topEnd - 1} H${X(1, HIP + 1)}" stroke="${topDD}" stroke-width="2" opacity=".6"/>`));
    [-1, 1].forEach(s => {
      const len = c.top === 'tee' ? sh + 40 : hipY + 8, wO = c.top === 'tee' ? 4.5 : 3;
      const d = `M${X(s, W - 10)} ${sh + 22} Q${X(s, W - 12)} ${(sh + len) / 2} ${X(s, W - 9)} ${len} L${X(s, W + wO + 2)} ${len} Q${X(s, W + wO + 4)} ${sh + 20} ${X(s, W + 2.5)} ${sh + 8} Q${X(s, W - 2)} ${sh - 4} ${X(s, W - 12)} ${sh + 2}Z`;
      L.push(part(`sleeve${s}`, d, topC, `<path d="M${X(s, W - 11)} ${len - 3} H${X(s, W + wO + 4)}" stroke="${topDD}" stroke-width="${c.top === 'hoodie' ? 5 : 1.6}"/>
        <path d="M${X(s, W - 6)} ${sh + 16} q${s * 4} 8 ${s * 3} 16" stroke="${topDD}" stroke-width="1.2" fill="none" opacity=".7"/>`));
    });
    if (c.top === 'tee') L.push(`<path d="M${cx - NW - 2.5} ${sh - 5} Q${cx} ${sh + 7} ${cx + NW + 2.5} ${sh - 5}" fill="${skinD}"/><path d="M${cx - NW - 3} ${sh - 5} Q${cx} ${sh + 8} ${cx + NW + 3} ${sh - 5}" stroke="${topDD}" stroke-width="2.2" fill="none"/>`);
    else L.push(`<path d="M${cx - NW - 9} ${sh - 2} Q${cx} ${sh + 9} ${cx + NW + 9} ${sh - 2} Q${cx + NW + 11} ${sh - 12} ${cx + NW + 2} ${sh - 13} L${cx - NW - 2} ${sh - 13} Q${cx - NW - 11} ${sh - 12} ${cx - NW - 9} ${sh - 2}Z" fill="${topD}"/>
      <path d="M${cx - NW - 4} ${sh - 6} Q${cx} ${sh + 4} ${cx + NW + 4} ${sh - 6}" stroke="${topDD}" stroke-width="2" fill="none"/>
      <path d="M${cx - 3.5} ${sh + 1} v16 M${cx + 3.5} ${sh + 1} v14" stroke="#efe9dc" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M${cx - WA + 2} ${waist + 2} H${cx + WA - 2} L${cx + WA - 6} ${hipY - 2} H${cx - WA + 6}Z" fill="${topD}" opacity=".55"/>`);
  } else if (c.top === 'tank') {
    const t = `M${cx - NW - 9} ${sh - 5} L${cx - NW - 4} ${sh - 5} Q${cx - 6} ${sh + 16} ${cx} ${sh + 16} Q${cx + 6} ${sh + 16} ${cx + NW + 4} ${sh - 5} L${cx + NW + 9} ${sh - 5}
      Q${cx + W - 10} ${sh + 18} ${cx + W - 8} ${sh + 28} Q${cx + WA + 4} ${waist - 18} ${cx + WA + 2.5} ${topEnd} L${cx - WA - 2.5} ${topEnd} Q${cx - WA - 4} ${waist - 18} ${cx - W + 8} ${sh + 28} Q${cx - W + 10} ${sh + 18} ${cx - NW - 9} ${sh - 5}Z`;
    L.push(part('top', t, topC, fabricShade(topD, topL) + `<path d="M${cx - WA + 4} ${topEnd - 12} q6 4 12 2 M${cx + 4} ${topEnd - 8} q6 3 10 0" stroke="${topDD}" stroke-width="1.2" fill="none" opacity=".7"/>`));
  } else if (c.top === 'crop') {
    const t = `M${cx - NW - 10} ${sh - 4} L${cx - NW - 5} ${sh - 4} Q${cx - 7} ${sh + 11} ${cx} ${sh + 11} Q${cx + 7} ${sh + 11} ${cx + NW + 5} ${sh - 4} L${cx + NW + 10} ${sh - 4}
      Q${cx + W - 9} ${sh + 16} ${cx + W - 7.5} ${sh + 27} L${cx + W - 8} ${topEnd} L${cx - W + 8} ${topEnd} L${cx - W + 7.5} ${sh + 27} Q${cx - W + 9} ${sh + 16} ${cx - NW - 10} ${sh - 4}Z`;
    L.push(part('top', t, topC, fabricShade(topD, topL) + `<path d="M${cx - W + 8} ${topEnd - 3} H${cx + W - 8}" stroke="${topDD}" stroke-width="4"/>`));
  }
  // gear on the torso
  if (gear.has('belt')) L.push(`<path d="M${X(-1, WA + 4)} ${waist - 6} Q${cx} ${waist - 9} ${X(1, WA + 4)} ${waist - 6} L${X(1, WA + 4.5)} ${waist + 9} Q${cx} ${waist + 6} ${X(-1, WA + 4.5)} ${waist + 9}Z" fill="#6a3d22"/>
    <path d="M${X(-1, WA + 4)} ${waist + 1} Q${cx} ${waist - 2} ${X(1, WA + 4)} ${waist + 1}" stroke="#4f2c17" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/>
    <rect x="${cx - 7}" y="${waist - 7}" width="14" height="14" rx="2.5" fill="none" stroke="#d6b062" stroke-width="2.4"/>`);
  if (gear.has('medal')) L.push(`<path d="M${cx - NW - 2} ${sh - 4} L${cx - 2} ${sh + 26} M${cx + NW + 2} ${sh - 4} L${cx + 2} ${sh + 26}" stroke="#4a8396" stroke-width="3"/><circle cx="${cx}" cy="${sh + 31}" r="6.5" fill="#e0b443" stroke="#b5861f" stroke-width="1.6"/><path d="M${cx - 2.5} ${sh + 31} l2 2 3.5 -4" stroke="#8a6414" stroke-width="1.2" fill="none"/>`);
  if (c.wristbands || gear.has('gloves')) [-1, 1].forEach(s => {
    const y = hipY + 8;
    if (gear.has('gloves')) L.push(`<path d="M${X(s, W - 6)} ${y - 6} Q${X(s, W - 9)} ${y + 12} ${X(s, W - 1)} ${y + 20} Q${X(s, W + 8)} ${y + 22} ${X(s, W + 10)} ${y + 10} Q${X(s, W + 10)} ${y - 4} ${X(s, W + 7)} ${y - 6}Z" fill="${s > 0 ? '#972d27' : '#b9362f'}"/><rect x="${Math.min(X(s, W - 6), X(s, W + 7))}" y="${y - 10}" width="13" height="6" rx="2.5" fill="#efe9dc"/>`);
    else L.push(`<rect x="${Math.min(X(s, W - 2.5), X(s, W + 6.5))}" y="${y - 3}" width="9.5" height="5" rx="2" fill="${topC === '#ece6d6' ? '#2f5a46' : '#efe9dc'}"/>`);
  });

  // ---------- head ----------
  const hw = headW, jaw = c.face === 'square' ? 0.78 : c.face === 'round' ? 0.86 : 0.7;
  const headD = `M${cx} ${headTop} C${cx + hw * 0.75} ${headTop} ${cx + hw} ${hy - 12} ${cx + hw} ${hy - 1}
    C${cx + hw} ${hy + 8} ${cx + hw * (jaw + 0.12)} ${chin - 9} ${cx + hw * jaw * 0.62} ${chin - 3} Q${cx} ${chin + 1.5} ${cx - hw * jaw * 0.62} ${chin - 3}
    C${cx - hw * (jaw + 0.12)} ${chin - 9} ${cx - hw} ${hy + 8} ${cx - hw} ${hy - 1} C${cx - hw} ${hy - 12} ${cx - hw * 0.75} ${headTop} ${cx} ${headTop}Z`;
  [-1, 1].forEach(s => L.push(`<path d="M${X(s, hw - 1)} ${hy - 3} Q${X(s, hw + 4)} ${hy - 5} ${X(s, hw + 3.2)} ${hy + 3} Q${X(s, hw + 2.5)} ${hy + 8} ${X(s, hw - 1)} ${hy + 7}Z" fill="${s > 0 ? skinD : skin}"/><path d="M${X(s, hw + 0.6)} ${hy - 1} q${s * 1.6} 2 0 5" stroke="${skinDD}" stroke-width=".9" fill="none" opacity=".6"/>`));
  const eyeY = hy + 1.5;
  L.push(part('head', headD, skin, `<path d="M${cx + hw * 0.5} ${headTop - 4} Q${cx + hw * 0.78} ${hy} ${cx + hw * 0.45} ${chin + 4} H${cx + 30} V${headTop - 4}Z" fill="${skinD}" opacity=".35"/>
    <path d="M${cx - hw * 0.75} ${hy - 9} Q${cx - hw * 0.4} ${headTop + 3} ${cx} ${headTop + 2}" stroke="${skinL}" stroke-width="3" fill="none" opacity=".45"/>
    <ellipse cx="${cx - 7.5}" cy="${eyeY + 8}" rx="3.5" ry="2" fill="#d97a62" opacity=".12"/>`));

  // facial hair (under the features)
  if (c.facialHair === 'stubble') L.push(`<path d="M${cx - hw + 1} ${hy + 1} Q${cx - hw + 2} ${chin - 4} ${cx} ${chin + 0.5} Q${cx + hw - 2} ${chin - 4} ${cx + hw - 1} ${hy + 1} Q${cx + 6} ${eyeY + 9} ${cx} ${eyeY + 8.5} Q${cx - 6} ${eyeY + 9} ${cx - hw + 1} ${hy + 1}Z" fill="${hairC}" opacity=".26"/>`);
  if (c.facialHair === 'short' || c.facialHair === 'full') {
    const drop = c.facialHair === 'full' ? 7 : 1.5;
    L.push(`<path d="M${cx - hw + 0.5} ${hy - 1} Q${cx - hw + 1} ${chin - 2 + drop * 0.6} ${cx} ${chin + drop} Q${cx + hw - 1} ${chin - 2 + drop * 0.6} ${cx + hw - 0.5} ${hy - 1} Q${cx + 7} ${eyeY + 8} ${cx} ${eyeY + 7} Q${cx - 7} ${eyeY + 8} ${cx - hw + 0.5} ${hy - 1}Z" fill="${hairC}"/>
      <path d="M${cx + 2} ${eyeY + 10} Q${cx + hw - 3} ${chin - 4} ${cx + 2} ${chin + drop - 1}" stroke="${hairD}" stroke-width="3" fill="none" opacity=".5"/>
      <path d="M${cx - 8} ${chin - 6} q2 4 1 7 M${cx - 4} ${chin - 3} q1 4 0 6 M${cx + 6} ${chin - 6} q-1 4 0 7" stroke="${hairL}" stroke-width=".8" fill="none" opacity=".55"/>`);
  }
  // eyes, brows, nose, mouth
  [-1, 1].forEach(s => {
    const ex = X(s, 5.6);
    L.push(`<path d="M${ex - 3} ${eyeY} Q${ex} ${eyeY - 2.3} ${ex + 3} ${eyeY} Q${ex} ${eyeY + 1.6} ${ex - 3} ${eyeY}Z" fill="#f6f1ea"/>
      <circle cx="${ex + 0.2}" cy="${eyeY - 0.1}" r="1.5" fill="#3b2a20"/><circle cx="${ex + 0.7}" cy="${eyeY - 0.7}" r=".45" fill="#fff"/>
      <path d="M${ex - 3.2} ${eyeY - 0.2} Q${ex} ${eyeY - 2.6} ${ex + 3.2} ${eyeY - 0.2}" stroke="${ink}" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M${X(s, 2.4)} ${eyeY - 4.3} Q${X(s, 5.5)} ${eyeY - 6.4} ${X(s, 9)} ${eyeY - 4.6} Q${X(s, 5.5)} ${eyeY - 5.2} ${X(s, 2.4)} ${eyeY - 3.3}Z" fill="${shadeHex(hairC, -0.1)}"/>`);
  });
  L.push(`<path d="M${cx + 0.4} ${eyeY + 1} Q${cx + 2.8} ${eyeY + 6} ${cx + 2} ${eyeY + 7.6} Q${cx} ${eyeY + 8.6} ${cx - 2} ${eyeY + 7.6}" stroke="${skinDD}" stroke-width="1" fill="none" stroke-linecap="round"/>
    <ellipse cx="${cx + 1.5}" cy="${eyeY + 7}" rx="1.6" ry="1" fill="${skinD}" opacity=".7"/>`);
  if (['moustache', 'short', 'full'].includes(c.facialHair)) L.push(`<path d="M${cx - 5.5} ${eyeY + 11.6} Q${cx} ${eyeY + 8} ${cx + 5.5} ${eyeY + 11.6} Q${cx} ${eyeY + 10.6} ${cx - 5.5} ${eyeY + 11.6}Z" fill="${hairC}" stroke="${hairC}" stroke-width="1.8" stroke-linejoin="round"/>`);
  L.push(`<path d="M${cx - 4} ${eyeY + 12.4} Q${cx - 1.5} ${eyeY + 11.2} ${cx} ${eyeY + 11.9} Q${cx + 1.5} ${eyeY + 11.2} ${cx + 4} ${eyeY + 12.4} Q${cx} ${eyeY + 13} ${cx - 4} ${eyeY + 12.4}Z" fill="${shadeHex(skin, -0.25)}"/>
    <path d="M${cx - 3.4} ${eyeY + 12.6} Q${cx} ${eyeY + 15.6} ${cx + 3.4} ${eyeY + 12.6}Z" fill="${shadeHex(skin, -0.12)}"/>
    <path d="M${cx - 4.2} ${eyeY + 12.4} Q${cx} ${eyeY + 13.4} ${cx + 4.2} ${eyeY + 12.4}" stroke="${shadeHex(skin, -0.4)}" stroke-width=".8" fill="none" stroke-linecap="round"/>`);

  // ---------- hair (front) ----------
  const ht = headTop, hs = hw / 21; // hair shapes are authored for a 21-wide head, then fitted
  const Hx = v => r1(cx + v * hs), Hy = v => r1(hy + v * (headH / 51));
  const hairPaths = {
    crop: `M${Hx(-22)} ${Hy(-2)} C${Hx(-24)} ${Hy(-24)} ${Hx(-12)} ${Hy(-31)} ${Hx(2)} ${Hy(-30)} C${Hx(17)} ${Hy(-30)} ${Hx(25)} ${Hy(-20)} ${Hx(22)} ${Hy(-2)} C${Hx(19)} ${Hy(-12)} ${Hx(12)} ${Hy(-17)} ${Hx(4)} ${Hy(-17)} C${Hx(-4)} ${Hy(-19)} ${Hx(-15)} ${Hy(-14)} ${Hx(-22)} ${Hy(-2)}Z`,
    sidepart: `M${Hx(-22)} ${Hy(0)} C${Hx(-25)} ${Hy(-24)} ${Hx(-10)} ${Hy(-33)} ${Hx(4)} ${Hy(-31)} C${Hx(19)} ${Hy(-30)} ${Hx(26)} ${Hy(-18)} ${Hx(22)} ${Hy(0)} C${Hx(20)} ${Hy(-13)} ${Hx(15)} ${Hy(-19)} ${Hx(7)} ${Hy(-20)} C${Hx(-5)} ${Hy(-14)} ${Hx(-15)} ${Hy(-14)} ${Hx(-22)} ${Hy(0)}Z`,
    fade: `M${Hx(-20)} ${Hy(-7)} C${Hx(-21)} ${Hy(-25)} ${Hx(-10)} ${Hy(-31)} ${Hx(1)} ${Hy(-31)} C${Hx(13)} ${Hy(-31)} ${Hx(22)} ${Hy(-24)} ${Hx(20)} ${Hy(-7)} C${Hx(15)} ${Hy(-16)} ${Hx(8)} ${Hy(-19)} ${Hx(0)} ${Hy(-19)} C${Hx(-8)} ${Hy(-19)} ${Hx(-15)} ${Hy(-16)} ${Hx(-20)} ${Hy(-7)}Z`,
    buzz: `M${Hx(-21)} ${Hy(-4)} C${Hx(-22)} ${Hy(-23)} ${Hx(-11)} ${Hy(-28)} ${Hx(0)} ${Hy(-28)} C${Hx(11)} ${Hy(-28)} ${Hx(22)} ${Hy(-23)} ${Hx(21)} ${Hy(-4)} C${Hx(17)} ${Hy(-17)} ${Hx(9)} ${Hy(-20)} ${Hx(0)} ${Hy(-20)} C${Hx(-9)} ${Hy(-20)} ${Hx(-17)} ${Hy(-17)} ${Hx(-21)} ${Hy(-4)}Z`,
    long: `M${Hx(-23)} ${Hy(24)} C${Hx(-29)} ${Hy(-20)} ${Hx(-12)} ${Hy(-33)} ${Hx(1)} ${Hy(-32)} C${Hx(15)} ${Hy(-32)} ${Hx(29)} ${Hy(-20)} ${Hx(23)} ${Hy(24)} L${Hx(18)} ${Hy(22)} C${Hx(21)} ${Hy(-4)} ${Hx(15)} ${Hy(-16)} ${Hx(2)} ${Hy(-18)} C${Hx(-10)} ${Hy(-16)} ${Hx(-20)} ${Hy(-4)} ${Hx(-18)} ${Hy(22)}Z`,
    ponytail: `M${Hx(-22)} ${Hy(-1)} C${Hx(-24)} ${Hy(-24)} ${Hx(-11)} ${Hy(-32)} ${Hx(1)} ${Hy(-31)} C${Hx(15)} ${Hy(-31)} ${Hx(25)} ${Hy(-22)} ${Hx(22)} ${Hy(-1)} C${Hx(18)} ${Hy(-14)} ${Hx(10)} ${Hy(-19)} ${Hx(0)} ${Hy(-19)} C${Hx(-10)} ${Hy(-19)} ${Hx(-18)} ${Hy(-14)} ${Hx(-22)} ${Hy(-1)}Z`
  };
  hairPaths.bun = hairPaths.ponytail;
  if (c.hair === 'bun') L.push(`<circle cx="${cx}" cy="${ht - 5}" r="7.5" fill="${hairC}"/><path d="M${cx - 5} ${ht - 7} q5 -5 10 0 M${cx - 4} ${ht - 3} q4 -3 8 0" stroke="${hairL}" stroke-width=".9" fill="none" opacity=".7"/>`);
  if (c.hair === 'curly') {
    const pts = [[-20, -6], [-21, -15], [-16, -24], [-7, -30], [3, -31], [13, -27], [20, -18], [21, -8], [-11, -22], [8, -23], [-1, -24]];
    L.push(`<g fill="${hairC}">${pts.map(([x, y]) => `<circle cx="${Hx(x)}" cy="${Hy(y)}" r="${r1(8.6 * hs * 1.1)}"/>`).join('')}</g>
      <g fill="none" stroke="${hairL}" stroke-width=".9" opacity=".7">${pts.map(([x, y]) => `<path d="M${r1(Hx(x) - 2.5)} ${Hy(y)} q2 -3 4 0 q1 2 -1 3"/>`).join('')}</g>
      <g fill="none" stroke="${hairD}" stroke-width="1" opacity=".6">${pts.slice(0, 8).map(([x, y]) => `<path d="M${r1(Hx(x) + 1)} ${r1(Hy(y) + 3)} q2 1 3 -1"/>`).join('')}</g>`);
  } else if (hairPaths[c.hair]) {
    const d = hairPaths[c.hair];
    if (c.hair === 'buzz') L.push(`<path d="${d}" fill="${hairC}" opacity=".5"/>`);
    else L.push(part('hair', d, hairC, `
      <path d="M${Hx(-14)} ${Hy(-22)} Q${Hx(-4)} ${Hy(-30)} ${Hx(8)} ${Hy(-27)} M${Hx(-16)} ${Hy(-16)} Q${Hx(-8)} ${Hy(-24)} ${Hx(2)} ${Hy(-24)} M${Hx(4)} ${Hy(-22)} Q${Hx(12)} ${Hy(-24)} ${Hx(17)} ${Hy(-16)}" stroke="${hairL}" stroke-width="1" fill="none" opacity=".65" stroke-linecap="round"/>`));
    if (c.hair === 'fade') [-1, 1].forEach(s => L.push(`<path d="M${X(s, hw - 0.5)} ${hy - 9} Q${X(s, hw + 0.5)} ${hy - 2} ${X(s, hw - 0.2)} ${hy + 3}" stroke="${hairC}" stroke-width="2.4" opacity=".3" fill="none"/>`));
  }

  // ---------- head accessories ----------
  if (gear.has('headband') && !c.cap) L.push(`<path d="M${cx - hw - 0.5} ${hy - 9} Q${cx} ${hy - 15} ${cx + hw + 0.5} ${hy - 9} L${cx + hw + 0.5} ${hy - 5} Q${cx} ${hy - 11} ${cx - hw - 0.5} ${hy - 5}Z" fill="#b9362f"/>
    <path d="M${cx + hw} ${hy - 7} q6 1 8 8 M${cx + hw} ${hy - 7} q8 -2 10 3" stroke="#b9362f" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  if (c.cap) {
    const capC = topC === '#ece6d6' ? '#2f5a46' : topC;
    L.push(`<path d="M${cx - hw - 1} ${hy - 5} C${cx - hw - 1.5} ${ht - 2} ${cx - 7} ${ht - 5} ${cx} ${ht - 5} C${cx + 8} ${ht - 5} ${cx + hw + 1.5} ${ht - 2} ${cx + hw + 1} ${hy - 5}Z" fill="${capC}"/>
      <path d="M${cx + 3} ${ht - 5} C${cx + 10} ${ht - 4} ${cx + hw + 1.5} ${ht} ${cx + hw + 1} ${hy - 5} L${cx + 6} ${hy - 6}Z" fill="${shadeHex(capC, -0.2)}"/>
      <path d="M${cx - hw - 1} ${hy - 6} Q${cx - hw - 7} ${hy - 4} ${cx - hw - 10} ${hy - 1} Q${cx - hw + 2} ${hy - 1} ${cx - 2} ${hy - 6}Z" fill="${shadeHex(capC, -0.28)}"/><circle cx="${cx}" cy="${ht - 5}" r="1.5" fill="${shadeHex(capC, -0.3)}"/>`);
  }
  if (c.headphones) L.push(`<path d="M${cx - hw - 1.5} ${hy + 1} C${cx - hw - 3} ${ht - 10} ${cx + hw + 3} ${ht - 10} ${cx + hw + 1.5} ${hy + 1}" stroke="#2a2a2e" stroke-width="2.6" fill="none"/>
    <rect x="${cx - hw - 5}" y="${hy - 5}" width="6.5" height="12" rx="3" fill="#2a2a2e"/><rect x="${cx + hw - 1.5}" y="${hy - 5}" width="6.5" height="12" rx="3" fill="#3a3a40"/>`);
  if (c.glasses) L.push(`<g fill="rgba(255,255,255,.18)" stroke="#2b2420" stroke-width="1.2"><rect x="${cx - 9.6}" y="${eyeY - 3.6}" width="7.6" height="6.2" rx="2.4"/><rect x="${cx + 2}" y="${eyeY - 3.6}" width="7.6" height="6.2" rx="2.4"/></g><path d="M${cx - 2} ${eyeY - 1} h4 M${cx - 9.6} ${eyeY - 1.5} l-4 -1 M${cx + 9.6} ${eyeY - 1.5} l4 -1" stroke="#2b2420" stroke-width="1.1"/>`);
  if (gear.has('crown')) L.push(`<path d="M${cx - 9.5} ${ht + 2} L${cx - 8.5} ${ht - 9} L${cx - 3.5} ${ht - 3} L${cx} ${ht - 12} L${cx + 3.5} ${ht - 3} L${cx + 8.5} ${ht - 9} L${cx + 9.5} ${ht + 2}Z" fill="#e0b443" stroke="#a87b16" stroke-width="1.1" stroke-linejoin="round"/><circle cx="${cx}" cy="${ht - 2}" r="1.6" fill="#b9362f"/>`);

  // ---------- frame + paper grain ----------
  const frameC = { bronze: '#b8794a', silver: '#a2adb2', gold: '#d4a52c', elite: '#2f5a46', master: '#6b4f8a' }[opts.frame];
  if (opts.scenery !== false && frameC) L.push(`<rect x="6" y="6" width="188" height="388" rx="30" fill="none" stroke="${frameC}" stroke-width="5"/><rect x="10.5" y="10.5" width="179" height="379" rx="26" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>`);
  defs.push(`<filter id="${uid}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 -.02" result="w"/><feComposite in="w" in2="SourceGraphic" operator="in" result="g"/>
    <feBlend in="SourceGraphic" in2="g" mode="soft-light"/></filter>`);
  const vb = opts.view === 'bust' ? `${cx - 34} ${r1(headTop - 19)} 68 68` : opts.view === 'figure' ? '30 24 140 360' : '0 0 200 400';
  return `<svg class="avatarSvg" viewBox="${vb}" role="img" aria-label="Your character" xmlns="http://www.w3.org/2000/svg"><defs>${defs.join('')}</defs><g filter="url(#${uid}-grain)">${L.join('')}</g></svg>`;
}
if (typeof module !== 'undefined') module.exports = { renderAvatar, AVATAR_OPTIONS, AVATAR_DEFAULT };
