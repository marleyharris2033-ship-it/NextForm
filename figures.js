// NextForm exercise pictures: original side-view figures drawn as SVG from simple pose data, so they are
// tiny, work offline and share one look. Each exercise maps to a movement pattern with a start and a
// finish pose; stretches and yoga poses have one pose each.
//
// Angles are in degrees for each body segment, measured from straight down: 0 = down, 90 = forward
// (the way the figure faces), 180 = up, -90 = backwards. t = torso (hip to shoulders), an/af = near/far arm
// [upper arm, forearm], ln/lf = near/far leg [thigh, shin]. The figure is fitted into the frame automatically.
(() => {
  const L = { torso: 27, neck: 4, head: 6.4, upper: 14, fore: 13, thigh: 21, shin: 21, foot: 7 };
  const rad = a => a * Math.PI / 180, dir = (a, l) => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l];
  const add = (p, a, l) => { const [dx, dy] = dir(a, l); return [p[0] + dx, p[1] + dy]; };

  function joints(p) {
    const t = p.t ?? 180, hip = [0, 0];
    const sh = add(hip, t, L.torso), neck = add(sh, p.hd ?? t, L.neck), head = add(neck, p.hd ?? t, L.head);
    const arm = ([u, f]) => { const e = add(sh, u, L.upper); return [e, add(e, f, L.fore)]; };
    const leg = ([th, s], foot) => { const k = add(hip, th, L.thigh), a = add(k, s, L.shin); return [k, a, add(a, foot ?? (s + (p.flip ? -90 : 90)), L.foot)]; };
    return { hip, sh, head, an: arm(p.an || [0, 0]), af: arm(p.af || p.an || [0, 0]), ln: leg(p.ln || [0, 0], p.fn), lf: leg(p.lf || p.ln || [0, 0], p.ff) };
  }

  // ---------- movement patterns: [start, finish] ----------
  // Props: bb barbell, db dumbbells, kb kettlebell, bench, incline, bar (pull-up bar), cable 'hi'|'mid'|'lo', box, boxFar, mat, wall
  const stand = { t: 180, an: [5, 5], ln: [0, 0], lf: [0, 0] };
  const P = {
    squatBar: [{ ...stand, an: [-150, 10], props: ['bbBack'] }, { t: 140, an: [-170, -10], ln: [100, -20], lf: [95, -25], props: ['bbBack'] }],
    squatFront: [{ ...stand, an: [-40, 150], props: ['bbFront'] }, { t: 160, an: [-20, 160], ln: [100, -20], lf: [95, -25], props: ['bbFront'] }],
    goblet: [{ ...stand, an: [-20, 160], props: ['dbChest'] }, { t: 160, an: [10, 170], ln: [100, -20], lf: [95, -25], props: ['dbChest'] }],
    squatBw: [{ ...stand, an: [0, 0] }, { t: 150, an: [80, 85], af: [85, 90], ln: [100, -20], lf: [95, -25] }],
    wallSit: [{ t: 180, an: [0, 0], ln: [90, 0], lf: [90, 0], props: ['wallBack'] }, { t: 180, an: [0, 0], ln: [90, 0], lf: [90, 0], props: ['wallBack'] }],
    hingeBar: [{ t: 105, an: [0, 0], ln: [40, -15], lf: [40, -15], props: ['bbHand'] }, { ...stand, an: [0, 0], props: ['bbHand'] }],
    rdl: [{ ...stand, an: [0, 0], props: ['bbHand'] }, { t: 100, an: [0, 0], ln: [15, -8], lf: [15, -8], props: ['bbHand'] }],
    rdlDb: [{ ...stand, an: [0, 0], props: ['db'] }, { t: 100, an: [0, 0], ln: [15, -8], lf: [15, -8], props: ['db'] }],
    goodMorning: [{ ...stand, an: [-150, 10], props: ['bbBack'] }, { t: 95, an: [-120, 30], ln: [15, -8], lf: [15, -8], props: ['bbBack'] }],
    kbSwing: [{ t: 115, an: [-20, -20], ln: [40, -15], lf: [40, -15], props: ['kb'] }, { t: 180, an: [90, 90], props: ['kb'] }],
    lunge: [{ ...stand, an: [0, 0], props: ['db'] }, { t: 180, an: [0, 0], ln: [90, 0], lf: [-40, -140], ff: -110, props: ['db'] }],
    bulgarian: [{ t: 180, an: [0, 0], ln: [10, 0], lf: [-30, -110], ff: -150, props: ['db', 'benchFoot'] }, { t: 175, an: [0, 0], ln: [90, -5], lf: [-15, -150], ff: -170, props: ['db', 'benchFoot'] }],
    stepUp: [{ ...stand, an: [0, 0], ln: [90, 0], props: ['db', 'box'] }, { ...stand, an: [0, 0], lf: [-10, -60], props: ['db', 'box', 'onBox'] }],
    legPress: [{ t: -150, hd: -160, an: [-60, 20], ln: [150, 70], lf: [150, 70], fn: 160, ff: 160, props: ['seat', 'plate'] }, { t: -150, hd: -160, an: [-60, 20], ln: [118, 118], lf: [118, 118], fn: 208, ff: 208, props: ['seat', 'plate'] }],
    legExt: [{ t: 180, an: [20, 20], ln: [90, 0], lf: [90, 0], props: ['seat'] }, { t: 180, an: [20, 20], ln: [90, 85], lf: [90, 85], props: ['seat'] }],
    legCurl: [{ t: 90, hd: 95, an: [175, 175], ln: [-90, -90], lf: [-90, -90], fn: 0, ff: 0, props: ['benchUnder'] }, { t: 90, hd: 95, an: [175, 175], ln: [-90, 165], lf: [-90, 165], fn: -105, ff: -105, props: ['benchUnder'] }],
    calfRaise: [{ ...stand, an: [0, 0], props: ['db', 'step'] }, { ...stand, an: [0, 0], fn: 140, ff: 140, props: ['db', 'step'], lift: 5 }],
    hipThrust: [{ t: -125, hd: -110, an: [100, 80], ln: [115, 5], lf: [115, 5], props: ['benchBack', 'bbHip'] }, { t: -95, hd: -80, an: [100, 80], ln: [88, 0], lf: [88, 0], props: ['benchBack', 'bbHip'] }],
    glueBridge: [{ t: -90, hd: -90, an: [0, 30], ln: [140, 25], lf: [140, 25], props: ['mat'] }, { t: -112, hd: -105, an: [-20, 20], ln: [102, 10], lf: [102, 10], props: ['mat'] }],
    bench: [{ t: -90, hd: -90, an: [-130, 140], ln: [80, 0], lf: [80, 0], props: ['bench', 'bbPress'] }, { t: -90, hd: -90, an: [180, 180], ln: [80, 0], lf: [80, 0], props: ['bench', 'bbPress'] }],
    benchDb: [{ t: -90, hd: -90, an: [-130, 140], ln: [80, 0], lf: [80, 0], props: ['bench', 'dbPress'] }, { t: -90, hd: -90, an: [180, 180], ln: [80, 0], lf: [80, 0], props: ['bench', 'dbPress'] }],
    incline: [{ t: -135, hd: -135, an: [-100, 175], ln: [80, 0], lf: [80, 0], props: ['incline', 'bbPress'] }, { t: -135, hd: -135, an: [150, 150], ln: [80, 0], lf: [80, 0], props: ['incline', 'bbPress'] }],
    inclineDb: [{ t: -135, hd: -135, an: [-100, 175], ln: [80, 0], lf: [80, 0], props: ['incline', 'dbPress'] }, { t: -135, hd: -135, an: [150, 150], ln: [80, 0], lf: [80, 0], props: ['incline', 'dbPress'] }],
    fly: [{ t: -90, hd: -90, an: [180, 180], ln: [80, 0], lf: [80, 0], props: ['bench', 'dbPress'] }, { t: -90, hd: -90, an: [-100, -150], ln: [80, 0], lf: [80, 0], props: ['bench', 'dbPress'] }],
    cableFly: [{ t: 170, an: [-100, -60], af: [-100, -60], props: ['cableHiBack'] }, { t: 165, an: [60, 75], af: [60, 75], props: ['cableHiBack'] }],
    pushUp: [{ t: 98, hd: 100, an: [0, 0], ln: [-82, -82], lf: [-82, -82], fn: -10, ff: -10 }, { t: 92, hd: 95, an: [-60, 25], ln: [-88, -88], lf: [-88, -88], fn: -10, ff: -10 }],
    dip: [{ t: 175, an: [0, 0], ln: [10, -40], lf: [10, -40], props: ['dipBars'] }, { t: 160, an: [-60, 10], ln: [10, -40], lf: [10, -40], props: ['dipBars'] }],
    row: [{ t: 105, an: [0, 0], ln: [30, -10], lf: [30, -10], props: ['bbHand'] }, { t: 105, an: [-60, 30], ln: [30, -10], lf: [30, -10], props: ['bbHand'] }],
    rowDb: [{ t: 100, an: [0, 0], af: [80, 0], ln: [45, -10], lf: [-20, 0], props: ['dbNear', 'benchHand'] }, { t: 100, an: [-60, 30], af: [80, 0], ln: [45, -10], lf: [-20, 0], props: ['dbNear', 'benchHand'] }],
    cableRow: [{ t: 170, an: [90, 90], ln: [80, 80], lf: [80, 80], props: ['cableMid', 'floorSeat'] }, { t: 185, an: [-45, 85], ln: [80, 80], lf: [80, 80], props: ['cableMid', 'floorSeat'] }],
    pullUp: [{ t: 180, an: [175, 175], ln: [5, -20], lf: [5, -20], props: ['bar'], hang: 1 }, { t: 180, an: [140, -150], ln: [5, -20], lf: [5, -20], props: ['bar'], hang: 1 }],
    pulldown: [{ t: 175, an: [170, 170], ln: [90, 0], lf: [90, 0], props: ['seat', 'cableHi'] }, { t: 172, an: [-30, 160], ln: [90, 0], lf: [90, 0], props: ['seat', 'cableHi'] }],
    ohp: [{ ...stand, an: [-40, 150], props: ['bbFront'] }, { ...stand, an: [170, 175], props: ['bbOver'] }],
    ohpDb: [{ ...stand, an: [-60, 170], props: ['dbShoulder'] }, { ...stand, an: [175, 178], props: ['dbOver'] }],
    lateral: [{ ...stand, an: [8, 8], af: [-8, -8], props: ['db'] }, { ...stand, an: [80, 80], af: [-80, -80], props: ['db'] }],
    frontRaise: [{ ...stand, an: [5, 5], props: ['db'] }, { ...stand, an: [90, 90], props: ['db'] }],
    facePull: [{ t: 180, an: [90, 90], props: ['cableMidFront'] }, { t: 180, an: [80, -120], props: ['cableMidFront'] }],
    shrug: [{ ...stand, an: [0, 0], props: ['db'] }, { ...stand, an: [0, 0], props: ['db'], shrug: 3 }],
    curl: [{ ...stand, an: [0, 0], props: ['db'] }, { ...stand, an: [5, 160], props: ['db'] }],
    curlBar: [{ ...stand, an: [0, 0], props: ['bbHand'] }, { ...stand, an: [5, 160], props: ['bbHand'] }],
    pushdown: [{ t: 175, an: [5, 110], props: ['cableHiFront'] }, { t: 175, an: [5, 5], props: ['cableHiFront'] }],
    overheadExt: [{ ...stand, an: [170, -10], props: ['dbOne'] }, { ...stand, an: [170, 175], props: ['dbOne'] }],
    skull: [{ t: -90, hd: -90, an: [160, 175], ln: [80, 0], lf: [80, 0], props: ['bench', 'bbPress'] }, { t: -90, hd: -90, an: [160, -80], ln: [80, 0], lf: [80, 0], props: ['bench', 'bbPress'] }],
    plank: [{ t: 98, hd: 100, an: [0, 90], ln: [-82, -82], lf: [-82, -82], fn: -10, ff: -10, props: ['mat'] }, null],
    sidePlank: [{ t: 98, hd: 100, an: [0, 90], af: [-170, -170], ln: [-82, -82], lf: [-82, -82], fn: -10, ff: -10, props: ['mat'] }, null],
    crunch: [{ t: -90, hd: -90, an: [-150, 30], ln: [140, 25], lf: [140, 25], props: ['mat'] }, { t: -130, hd: -125, an: [-150, 30], ln: [140, 25], lf: [140, 25], props: ['mat'] }],
    cableCrunch: [{ t: 175, hd: 175, an: [150, 30], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['cableHiFront'] }, { t: 105, hd: 100, an: [100, 0], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['cableHiFront'] }],
    legRaise: [{ t: 180, an: [175, 175], ln: [5, 0], lf: [5, 0], props: ['bar'], hang: 1 }, { t: 180, an: [175, 175], ln: [90, 90], lf: [90, 90], props: ['bar'], hang: 1 }],
    deadBug: [{ t: -90, hd: -90, an: [180, 180], af: [180, 180], ln: [180, 90], lf: [180, 90], props: ['mat'] }, { t: -90, hd: -90, an: [-110, -110], af: [180, 180], ln: [180, 90], lf: [100, 100], props: ['mat'] }],
    birdDog: [{ t: 90, hd: 100, an: [0, 0], ln: [0, -90], lf: [0, -90], props: ['mat'] }, { t: 90, hd: 100, an: [100, 100], af: [0, 0], ln: [0, -90], lf: [-90, -90], props: ['mat'] }],
    twist: [{ t: -155, hd: -160, an: [70, 150], ln: [145, 40], lf: [145, 40], props: ['mat', 'dbChestLow'] }, { t: -155, hd: -160, an: [30, 100], ln: [145, 40], lf: [145, 40], props: ['mat', 'dbChestLow'] }],
    hollow: [{ t: -105, hd: -110, an: [-110, -110], ln: [80, 80], lf: [80, 80], props: ['mat'] }, null],
    carry: [{ ...stand, an: [0, 0], ln: [20, -10], lf: [-15, 10], props: ['db'] }, { ...stand, an: [0, 0], ln: [-15, 10], lf: [20, -10], props: ['db'] }],
    jumpRope: [{ ...stand, an: [20, 60], props: ['rope'] }, { ...stand, an: [20, 60], fn: 130, ff: 130, props: ['rope'], lift: 6 }],
    boxing: [{ t: 175, an: [40, 160], af: [30, 165], ln: [10, 0], lf: [-15, 0] }, { t: 172, an: [85, 90], af: [30, 165], ln: [10, 0], lf: [-15, 0] }],
    burpee: [{ t: 150, an: [60, 30], ln: [100, -30], lf: [100, -30] }, { t: 98, hd: 100, an: [0, 0], ln: [-82, -82], lf: [-82, -82], fn: -10, ff: -10 }],
    hang: [{ t: 180, an: [175, 175], ln: [5, -10], lf: [5, -10], props: ['bar'], hang: 1 }, null],
    lsit: [{ t: 180, an: [0, 0], ln: [90, 90], lf: [90, 90], fn: 160, ff: 160, props: ['parallettes'] }, null],
    handstand: [{ t: 0, hd: 0, an: [180, 180], ln: [180, 180], lf: [180, 180], fn: 180, ff: 180, props: ['wall'] }, null],
    pikePush: [{ t: 40, hd: 30, an: [0, 0], ln: [-30, -30], lf: [-30, -30], fn: 60, ff: 60 }, { t: 30, hd: 15, an: [-50, 30], ln: [-30, -30], lf: [-30, -30], fn: 60, ff: 60 }],
    backExt: [{ t: 70, hd: 70, an: [0, 0], ln: [-90, -90], lf: [-90, -90], props: ['hyper'] }, { t: 100, hd: 110, an: [80, 0], ln: [-90, -90], lf: [-90, -90], props: ['hyper'] }],
    nordic: [{ t: 180, an: [60, 60], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['mat'] }, { t: 150, hd: 140, an: [100, 100], ln: [-30, -90], lf: [-30, -90], fn: -100, ff: -100, props: ['mat'] }],
    abWheel: [{ t: 160, hd: 150, an: [20, 20], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['mat', 'wheel'] }, { t: 100, hd: 105, an: [95, 95], ln: [-55, -90], lf: [-55, -90], fn: -100, ff: -100, props: ['mat', 'wheel'] }],
    abduction: [{ t: 180, an: [20, 20], ln: [90, 0], lf: [90, 0], props: ['seat'] }, { t: 180, an: [20, 20], ln: [90, 0], lf: [90, 0], props: ['seat'] }],
    kickback: [{ t: 95, hd: 100, an: [0, 0], ln: [0, -90], lf: [0, -90], props: ['mat'] }, { t: 95, hd: 100, an: [0, 0], ln: [0, -90], lf: [-100, -100], props: ['mat'] }],
    running: [{ t: 170, an: [-40, 60], af: [40, 140], ln: [50, -30], lf: [-30, -80] }, { t: 170, an: [40, 140], af: [-40, 60], ln: [-30, -80], lf: [50, -30] }]
  };
  // Exercise name -> pattern
  const MAP = {
    'Back Squat': 'squatBar', 'Box Squat': 'squatBar', 'Smith Machine Squat': 'squatBar', 'Hack Squat': 'squatBar', 'Zercher Squat': 'squatFront', 'Front Squat': 'squatFront',
    'Goblet Squat': 'goblet', 'Sumo Squat': 'goblet', 'Cossack Squat': 'goblet', 'Bodyweight Squat': 'squatBw', 'Pistol Squat': 'squatBw', 'Wall Sit': 'wallSit',
    'Deadlift': 'hingeBar', 'Trap Bar Deadlift': 'hingeBar', 'Sumo Deadlift': 'hingeBar', 'Rack Pull': 'rdl', 'Romanian Deadlift': 'rdl', 'Dumbbell Romanian Deadlift': 'rdlDb', 'Single-Leg Romanian Deadlift': 'rdlDb', 'Good Morning': 'goodMorning',
    'Kettlebell Swing': 'kbSwing', 'Reverse Lunge': 'lunge', 'Walking Lunge': 'lunge', 'Dumbbell Step-Back Lunge': 'lunge', 'Bulgarian Split Squat': 'bulgarian', 'Step-Up': 'stepUp',
    'Leg Press': 'legPress', 'Leg Extension': 'legExt', 'Leg Curl': 'legCurl', 'Calf Raise': 'calfRaise', 'Standing Calf Raise': 'calfRaise', 'Seated Calf Raise': 'calfRaise',
    'Hip Thrust': 'hipThrust', 'Glute Bridge': 'glueBridge', 'Single-Leg Glute Bridge': 'glueBridge', 'Glute Kickback': 'kickback', 'Hip Abduction Machine': 'abduction', 'Hip Adduction Machine': 'abduction',
    'Bench Press': 'bench', 'Close-Grip Bench Press': 'bench', 'Floor Press': 'bench', 'JM Press': 'bench', 'Machine Chest Press': 'benchDb', 'Dumbbell Bench Press': 'benchDb', 'Dumbbell Squeeze Press': 'benchDb', 'Seated Dumbbell Press': 'benchDb',
    'Incline Barbell Press': 'incline', 'Incline Dumbbell Press': 'inclineDb', 'Dumbbell Fly': 'fly', 'Reverse Fly': 'fly', 'Pec Deck': 'cableFly', 'Cable Fly': 'cableFly', 'Low-to-High Cable Fly': 'cableFly', 'Plate Squeeze': 'benchDb',
    'Push-Up': 'pushUp', 'Incline Push-Up': 'pushUp', 'Decline Push-Up': 'pushUp', 'Diamond Push-Up': 'pushUp', 'Archer Push-Up': 'pushUp', 'Dip': 'dip', 'Weighted Dip': 'dip',
    'Barbell Row': 'row', 'Pendlay Row': 'row', 'T-Bar Row': 'row', 'Meadows Row': 'rowDb', 'Dumbbell Row': 'rowDb', 'One-Arm Dumbbell Row': 'rowDb', 'Chest-Supported Dumbbell Row': 'rowDb', 'Seal Row': 'row',
    'Seated Cable Row': 'cableRow', 'Machine Row': 'cableRow', 'Inverted Row': 'cableRow', 'Rear Delt Row': 'cableRow',
    'Pull-Up': 'pullUp', 'Chin-Up': 'pullUp', 'Neutral-Grip Pull-Up': 'pullUp', 'Wide-Grip Pull-Up': 'pullUp', 'Muscle-Up': 'pullUp', 'Lat Pulldown': 'pulldown', 'Straight-Arm Pulldown': 'pushdown', 'Dumbbell Pullover': 'skull',
    'Dead Hang': 'hang', 'Front Lever Hold': 'hang', 'Back Lever Hold': 'hang',
    'Overhead Press': 'ohp', 'Push Press': 'ohp', 'Landmine Press': 'ohp', 'Z Press': 'ohp', 'Dumbbell Shoulder Press': 'ohpDb', 'Arnold Press': 'ohpDb', 'Machine Shoulder Press': 'ohpDb',
    'Lateral Raise': 'lateral', 'Cable Lateral Raise': 'lateral', 'Lean-Away Lateral Raise': 'lateral', 'Front Raise': 'frontRaise', 'Prone Y Raise': 'frontRaise', 'Upright Row': 'curlBar',
    'Face Pull': 'facePull', 'Rear Delt Raise': 'lateral', 'Reverse Pec Deck': 'facePull', 'Barbell Shrug': 'shrug', 'Dumbbell Shrug': 'shrug',
    'Handstand Hold': 'handstand', 'Handstand Push-Up': 'handstand', 'Pike Push-Up': 'pikePush', 'Planche Lean': 'pushUp',
    'Dumbbell Curl': 'curl', 'Hammer Curl': 'curl', 'Cross-Body Hammer Curl': 'curl', 'Incline Dumbbell Curl': 'curl', 'Concentration Curl': 'curl', 'Zottman Curl': 'curl', 'Spider Curl': 'curl',
    'Barbell Curl': 'curlBar', 'EZ-Bar Curl': 'curlBar', 'Preacher Curl': 'curlBar', 'Cable Curl': 'curlBar',
    'Triceps Pushdown': 'pushdown', 'Overhead Cable Extension': 'overheadExt', 'Overhead Triceps Extension': 'overheadExt', 'Skull Crusher': 'skull', 'Dumbbell Tate Press': 'skull',
    'Plank': 'plank', 'Side Plank': 'sidePlank', 'Cable Crunch': 'cableCrunch', 'Hanging Leg Raise': 'legRaise', 'Toes-to-Bar': 'legRaise', 'Dead Bug': 'deadBug', 'Bird Dog': 'birdDog',
    'Russian Twist': 'twist', 'Hollow Body Hold': 'hollow', 'Dragon Flag': 'hollow', 'L-Sit': 'lsit', "Farmer's Carry": 'carry', 'Ab Wheel Rollout': 'abWheel', 'Cable Woodchop': 'facePull', 'Pallof Press': 'facePull',
    'Back Extension': 'backExt', 'Nordic Curl': 'nordic', 'Jump Rope': 'jumpRope', 'Running': 'running', 'Boxing Heavy Bag': 'boxing', 'Shadow Boxing': 'boxing'
  };

  // ---------- drawing ----------
  const C = { near: '#1f4a3a', far: '#7f9b8c', skin: '#1f4a3a', prop: '#5f6f66', soft: '#dfe6dc', accent: '#a6c46f' };
  const line = (a, b, w, c) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  function svg(pose, { size = 160, label = '' } = {}) {
    if (!pose) return '';
    const j = joints(pose);
    if (pose.shrug) { j.sh[1] -= pose.shrug; j.head[1] -= pose.shrug; }
    const pts = [j.hip, j.sh, j.head, ...j.an, ...j.af, ...j.ln, ...j.lf];
    let minX = Math.min(...pts.map(p => p[0])) - 10, maxX = Math.max(...pts.map(p => p[0])) + 10, minY = Math.min(...pts.map(p => p[1])) - 10, maxY = Math.max(...pts.map(p => p[1]));
    const props = pose.props || [], parts = [];
    const ground = maxY + (pose.lift || 0);
    const handN = j.an[1], handF = j.af[1], footN = j.ln[2];
    // props behind the body
    for (const pr of props) {
      if (pr === 'bench') { const y = Math.max(j.hip[1], j.sh[1]) + 5; parts.push(`<rect x="${Math.min(j.hip[0], j.sh[0]) - 4}" y="${y}" width="${Math.abs(j.sh[0] - j.hip[0]) + 16}" height="5" rx="2" fill="${C.prop}"/>`, line([j.hip[0] + 2, y + 5], [j.hip[0] + 2, ground], 3, C.prop), line([j.sh[0] - 2, y + 5], [j.sh[0] - 2, ground], 3, C.prop)); }
      if (pr === 'incline') { const a = [j.hip[0] + 3, j.hip[1] + 6], b = [j.sh[0] - 2, j.sh[1] + 6]; parts.push(line(a, b, 6, C.prop), line([a[0] + 2, a[1]], [a[0] + 2, ground], 3, C.prop), line([b[0] + 4, b[1]], [b[0] + 4, ground], 3, C.prop)); }
      if (pr === 'benchUnder') { const y = Math.max(j.hip[1], j.sh[1]) + 5; parts.push(`<rect x="${j.ln[1][0] - 2}" y="${y}" width="${Math.abs(j.sh[0] - j.ln[1][0]) + 6}" height="5" rx="2" fill="${C.prop}"/>`, line([j.hip[0], y + 5], [j.hip[0], ground + 18], 3, C.prop)); maxY += 18; }
      if (pr === 'benchBack') { const y = j.sh[1] + 5; parts.push(`<rect x="${j.sh[0] - 12}" y="${y}" width="16" height="5" rx="2" fill="${C.prop}"/>`, line([j.sh[0] - 4, y + 5], [j.sh[0] - 4, ground], 3, C.prop)); }
      if (pr === 'benchFoot') { const f = j.lf[2], y = f[1] + 3; parts.push(`<rect x="${f[0] - 10}" y="${y}" width="16" height="5" rx="2" fill="${C.prop}"/>`, line([f[0] - 2, y + 5], [f[0] - 2, ground], 3, C.prop)); }
      if (pr === 'benchHand') { const h = j.af[1], y = h[1] + 2; parts.push(`<rect x="${h[0] - 18}" y="${y}" width="30" height="5" rx="2" fill="${C.prop}"/>`, line([h[0] - 10, y + 5], [h[0] - 10, ground], 3, C.prop)); }
      if (pr === 'seat') { const y = j.hip[1] + 5; parts.push(`<rect x="${j.hip[0] - 10}" y="${y}" width="22" height="5" rx="2" fill="${C.prop}"/>`, line([j.hip[0] - 8, j.hip[1] + 4], [j.sh[0] - 7, j.sh[1] + 2], 4, C.prop), line([j.hip[0], y + 5], [j.hip[0], ground], 3, C.prop)); }
      if (pr === 'floorSeat') { const y = j.hip[1] + 5; parts.push(`<rect x="${j.hip[0] - 8}" y="${y}" width="40" height="4" rx="2" fill="${C.prop}"/>`); }
      if (pr === 'hyper') { const y = j.hip[1] + 5; parts.push(`<rect x="${j.hip[0] - 14}" y="${y}" width="18" height="5" rx="2" fill="${C.prop}"/>`, line([j.hip[0] - 6, y + 5], [j.hip[0] - 6, ground + 6], 3, C.prop)); }
      if (pr === 'wallFront') { const x = Math.max(handN[0], handF[0]) + 3; parts.push(line([x, minY], [x, ground], 3, C.prop)); maxX = Math.max(maxX, x + 4); }
      if (pr === 'wallBehindArm') { const x = j.an[1][0] - 4; parts.push(line([x, minY], [x, ground], 3, C.prop)); minX = Math.min(minX, x - 4); }
      if (pr === 'wall' || pr === 'wallBack') { const x = pr === 'wall' ? Math.min(...pts.map(p => p[0])) - 3 : j.sh[0] - 6; parts.push(line([x, minY], [x, ground], 3, C.prop)); }
      if (pr === 'bar' || pr === 'dipBars' || pr === 'parallettes') { const y = Math.min(handN[1], handF[1]) - (pr === 'bar' ? 2 : -2); parts.push(line([handN[0] - 16, y], [handN[0] + 16, y], 4, C.prop)); if (pr !== 'bar') parts.push(line([handN[0] - 10, y], [handN[0] - 10, ground], 3, C.prop)); }
      if (pr === 'box') { const f = j.ln[2]; parts.push(`<rect x="${f[0] - 12}" y="${pose.props.includes('onBox') ? ground - 16 : f[1] - 0}" width="22" height="16" rx="2" fill="${C.soft}" stroke="${C.prop}" stroke-width="2"/>`); }
      if (pr === 'plate') { const f = j.ln[2], k = j.ln[1]; parts.push(line([f[0] + 4, f[1] - 10], [f[0] + 4, f[1] + 12], 5, C.prop)); }
      if (pr === 'step') parts.push(`<rect x="${footN[0] - 10}" y="${ground - (pose.lift || 0)}" width="18" height="5" rx="2" fill="${C.prop}"/>`);
      if (pr === 'mat') parts.push(`<rect x="${minX + 4}" y="${ground + 1}" width="${maxX - minX - 8}" height="3" rx="1.5" fill="${C.accent}"/>`);
      if (pr.startsWith('cable')) {
        const hi = /Hi/.test(pr), mid = /Mid/.test(pr), front = /Front/.test(pr) || pr === 'cableMid' || pr === 'cableHi';
        const ax = front ? maxX + 12 : minX - 8, ay = hi ? minY - 6 : mid ? (handN[1] + j.sh[1]) / 2 : ground - 10;
        parts.push(line([ax, minY - 8], [ax, ground], 3, C.prop), `<circle cx="${ax}" cy="${ay}" r="3" fill="${C.prop}"/>`, `<line x1="${ax}" y1="${ay}" x2="${handN[0]}" y2="${handN[1]}" stroke="${C.prop}" stroke-width="1.2" stroke-dasharray="2 2"/>`);
        minX = Math.min(minX, ax - 4); maxX = Math.max(maxX, ax + 4); minY = Math.min(minY, ay - 4);
      }
    }
    // far limbs, body, near limbs
    const limb = (seg, c, w1, w2) => line(seg[0], seg[1], w1, c) + (seg[2] ? line(seg[1], seg[2], w2, c) : '');
    parts.push(line(j.hip, j.lf[0], 8, C.far), line(j.lf[0], j.lf[1], 7, C.far), line(j.lf[1], j.lf[2], 4, C.far));
    parts.push(line(j.sh, j.af[0], 6, C.far), line(j.af[0], j.af[1], 5, C.far));
    parts.push(line(j.hip, j.sh, 11, C.near), `<circle cx="${j.head[0].toFixed(1)}" cy="${j.head[1].toFixed(1)}" r="${L.head}" fill="${C.near}"/>`);
    parts.push(line(j.hip, j.ln[0], 9, C.near), line(j.ln[0], j.ln[1], 8, C.near), line(j.ln[1], j.ln[2], 4.5, C.near));
    parts.push(line(j.sh, j.an[0], 7, C.near), line(j.an[0], j.an[1], 6, C.near));
    // props in front
    const dbAt = h => `<rect x="${(h[0] - 5).toFixed(1)}" y="${(h[1] - 2.5).toFixed(1)}" width="10" height="5" rx="2.2" fill="${C.prop}"/>`;
    for (const pr of props) {
      if (pr === 'db') parts.push(dbAt(handF), dbAt(handN));
      if (pr === 'dbNear' || pr === 'dbOne' || pr === 'dbChest' || pr === 'dbChestLow') parts.push(dbAt(handN));
      if (pr === 'dbPress' || pr === 'dbShoulder' || pr === 'dbOver') parts.push(dbAt(handN));
      if (pr === 'kb') parts.push(`<circle cx="${handN[0].toFixed(1)}" cy="${(handN[1] + 5).toFixed(1)}" r="5" fill="${C.prop}"/>`);
      if (/^bb/.test(pr)) { const at = pr === 'bbBack' ? [j.sh[0] - 3, j.sh[1] + 2] : pr === 'bbFront' ? [j.sh[0] + 4, j.sh[1] + 2] : pr === 'bbHip' ? [j.hip[0], j.hip[1] - 6] : handN;
        parts.push(`<circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="9" fill="none" stroke="${C.prop}" stroke-width="3.5"/><circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="2" fill="${C.prop}"/>`);
        minY = Math.min(minY, at[1] - 10); maxX = Math.max(maxX, at[0] + 10); minX = Math.min(minX, at[0] - 10); if (at[1] + 9 > maxY) maxY = at[1] + 9; }
      if (pr === 'wheel') parts.push(`<circle cx="${handN[0].toFixed(1)}" cy="${(handN[1] + 1).toFixed(1)}" r="5" fill="none" stroke="${C.prop}" stroke-width="3"/>`);
      if (pr === 'rope') parts.push(`<path d="M${handF[0]} ${handF[1]} Q ${(handN[0] + handF[0]) / 2 + 20} ${ground + 6} ${handN[0]} ${handN[1]}" fill="none" stroke="${C.prop}" stroke-width="1.5"/>`);
    }
    maxY = Math.max(maxY, ground) + 6;
    // Same scale for every picture (people stay the same size); only very wide or tall scenes zoom out.
    const w = maxX - minX, h = maxY - minY, s = Math.max(118, w + 6, (h + 6) * 1.1);
    const vx = (minX + maxX) / 2 - s / 2, vy = maxY - s / 1.1 + 2;
    return `<svg class="fig" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${s.toFixed(1)} ${(s / 1.1).toFixed(1)}" width="${size}" height="${Math.round(size / 1.1)}" role="img" aria-label="${label}">`
      + `<line x1="${vx}" y1="${ground + 0.5}" x2="${vx + s}" y2="${ground + 0.5}" stroke="${C.soft}" stroke-width="2"/>${parts.join('')}</svg>`;
  }
  const forExercise = name => { const k = MAP[name]; return k ? { pattern: k, start: P[k][0], finish: P[k][1] } : null; };
  const pictures = (name, size) => { const f = forExercise(name); if (!f) return '';
    return f.finish ? `<div class="figPair"><figure>${svg(f.start, { size, label: `${name}, start` })}<figcaption>Start</figcaption></figure><figure>${svg(f.finish, { size, label: `${name}, finish` })}<figcaption>Finish</figcaption></figure></div>`
      : `<div class="figPair one"><figure>${svg(f.start, { size, label: name })}<figcaption>Hold</figcaption></figure></div>`; };
  window.Figures = { svg, forExercise, pictures, PATTERNS: P, MAP, joints };
})();
