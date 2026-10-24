// NextForm stretches and yoga poses, and follow-along routines built from them. Original cues and pictures.
// Pose pictures use the same pose format as figures.js (side view, facing right).
(() => {
  const stand = { t: 180, an: [0, 0], ln: [0, 0], lf: [0, 0] };
  const back = { t: -90, hd: -90, an: [0, 20], ln: [90, 90], lf: [90, 90], props: ['mat'] }; // lying on your back
  // [id, name, seconds, both sides?, kind, cues, pose]
  const POSES = [
    ['neck-tilt', 'Neck side stretch', 30, true, 'stretch', ['Sit or stand tall and drop one ear towards your shoulder.', 'Keep both shoulders down. Breathe slowly.'], { ...stand, hd: 160 }],
    ['neck-forward', 'Neck release', 30, false, 'stretch', ['Gently lower your chin towards your chest.', 'Let the back of your neck lengthen.'], { ...stand, hd: 140 }],
    ['shoulder-cross', 'Cross-body shoulder stretch', 30, true, 'stretch', ['Bring one arm across your chest.', 'Hold it with your other arm just above the elbow.'], { ...stand, an: [90, -90] }],
    ['triceps-overhead', 'Overhead triceps stretch', 30, true, 'stretch', ['Reach one hand down between your shoulder blades.', 'Ease the elbow back with your other hand.'], { ...stand, an: [175, 5] }],
    ['doorway-chest', 'Doorway chest stretch', 30, true, 'stretch', ['Rest your forearm on a door frame, elbow at shoulder height.', 'Step forward gently until you feel it across your chest.'], { ...stand, an: [-90, 180], props: ['wallBehindArm'] }],
    ['upper-back-hug', 'Upper back hug', 30, false, 'stretch', ['Hug your shoulders and round your upper back.', 'Breathe into the space between your shoulder blades.'], { ...stand, hd: 160, an: [80, -60], af: [80, -60] }],
    ['overhead-reach', 'Overhead reach', 20, false, 'stretch', ['Interlace your fingers and reach up tall.', 'Lift through your ribs without arching your lower back.'], { ...stand, an: [178, 178] }],
    ['wall-slides', 'Wall slides', 40, false, 'mobility', ['Stand with your back to a wall, arms in a goalpost shape.', 'Slide your arms up and down slowly, keeping them on the wall.'], { ...stand, an: [-170, 170], props: ['wallBack'] }],
    ['standing-quad', 'Standing quad stretch', 30, true, 'stretch', ['Hold one ankle behind you, knees together.', 'Squeeze your glute and stand tall. Hold a wall for balance.'], { ...stand, ln: [0, 175], fn: 175, an: [-25, -10] }],
    ['standing-hamstring', 'Standing forward fold', 40, false, 'stretch', ['Hinge at your hips and let your upper body hang.', 'Soften your knees and let your head relax.'], { t: 15, hd: 5, an: [0, 0], ln: [5, -5], lf: [5, -5] }],
    ['calf-wall', 'Calf stretch at a wall', 30, true, 'stretch', ['Hands on a wall, step one foot back and press the heel down.', 'Keep the back leg straight.'], { t: 160, an: [80, 80], ln: [40, 0], lf: [-40, -40], props: ['wallFront'] }],
    ['hip-flexor', 'Kneeling hip flexor stretch', 40, true, 'stretch', ['Kneel on one knee, the other foot forward.', 'Tuck your hips under and shift forward gently.'], { t: 180, an: [5, 90], ln: [90, 0], lf: [-10, -90], ff: -100, props: ['mat'] }],
    ['low-lunge', 'Low lunge', 40, true, 'yoga', ['From a kneeling lunge, sink your hips forward.', 'Reach both arms up and lift your chest.'], { t: 170, an: [175, 175], ln: [90, 0], lf: [-40, -90], ff: -100, props: ['mat'] }],
    ['pigeon', 'Pigeon pose', 60, true, 'yoga', ['Bring one shin forward, the other leg long behind you.', 'Walk your hands forward and fold over the front leg if it feels good.'], { t: 165, an: [0, 0], ln: [80, -80], fn: -150, lf: [-88, -90], ff: -180, props: ['mat'] }],
    ['figure-four', 'Lying figure-four stretch', 45, true, 'stretch', ['On your back, cross one ankle over the opposite knee.', 'Draw the legs towards you until you feel it in your outer hip.'], { ...back, an: [140, 120], ln: [150, 60], lf: [160, 80] }],
    ['knees-chest', 'Knees to chest', 40, false, 'stretch', ['Lie on your back and hug both knees in.', 'Rock gently side to side to massage your lower back.'], { ...back, an: [150, 120], ln: [170, 80], lf: [170, 80] }],
    ['supine-twist', 'Lying spinal twist', 45, true, 'stretch', ['On your back, drop both knees to one side.', 'Keep both shoulders on the floor and look the other way.'], { ...back, an: [-90, -90], ln: [150, 60], lf: [140, 50] }],
    ['hamstring-strap', 'Lying hamstring stretch', 45, true, 'stretch', ['Lie on your back and raise one straight leg.', 'Hold behind the thigh (or use a towel) and keep the other leg long.'], { ...back, an: [170, 170], ln: [178, 178], fn: 270 }],
    ['butterfly', 'Butterfly stretch', 45, false, 'stretch', ['Sit with the soles of your feet together.', 'Sit tall and let your knees drop towards the floor.'], { t: 175, an: [30, 30], ln: [85, -100], lf: [85, -100], props: ['mat'] }],
    ['seated-fold', 'Seated forward fold', 45, false, 'yoga', ['Sit with legs straight and hinge forward from your hips.', 'Reach for your shins, ankles or feet. Keep breathing.'], { t: 110, hd: 105, an: [95, 95], ln: [90, 90], lf: [90, 90], fn: 180, ff: 180, props: ['mat'] }],
    ['childs-pose', "Child's pose", 60, false, 'yoga', ['Kneel, sit back on your heels and fold forward.', 'Rest your forehead down and reach your arms long.'], { t: 100, hd: 100, an: [95, 95], ln: [50, -90], lf: [50, -90], fn: -100, ff: -100, props: ['mat'] }],
    ['cat', 'Cat', 20, false, 'yoga', ['On all fours, breathe out and round your back up.', 'Tuck your chin and tailbone.'], { t: 95, hd: 50, an: [0, 0], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['mat'] }],
    ['cow', 'Cow', 20, false, 'yoga', ['On all fours, breathe in and let your belly drop.', 'Lift your chest and look forward.'], { t: 85, hd: 130, an: [0, 0], ln: [0, -90], lf: [0, -90], fn: -100, ff: -100, props: ['mat'] }],
    ['down-dog', 'Downward dog', 45, false, 'yoga', ['From all fours, lift your hips up and back.', 'Press the floor away and let your heels sink towards it.'], { t: 40, hd: 30, an: [40, 40], ln: [-35, -35], lf: [-35, -35], fn: 55, ff: 55, props: ['mat'] }],
    ['cobra', 'Cobra', 30, false, 'yoga', ['Lie on your front, hands under your shoulders.', 'Press up gently, keeping your hips down and shoulders relaxed.'], { t: 125, hd: 135, an: [0, 0], ln: [-88, -90], lf: [-88, -90], fn: -180, ff: -180, props: ['mat'] }],
    ['sphinx', 'Sphinx', 45, false, 'yoga', ['Lie on your front and prop yourself on your forearms.', 'Let your lower back relax and lift through your chest.'], { t: 105, hd: 120, an: [0, 90], ln: [-88, -90], lf: [-88, -90], fn: -180, ff: -180, props: ['mat'] }],
    ['mountain', 'Mountain pose', 30, false, 'yoga', ['Stand tall, feet hip-width apart, arms by your sides.', 'Breathe slowly and feel your weight through your whole foot.'], { ...stand }],
    ['chair', 'Chair pose', 30, false, 'yoga', ['Sit back as if into a chair, arms reaching up.', 'Keep your weight in your heels.'], { t: 150, an: [165, 165], ln: [65, -20], lf: [65, -20] }],
    ['warrior-1', 'Warrior I', 40, true, 'yoga', ['Step one foot back, bend your front knee.', 'Square your hips forward and reach your arms up.'], { t: 180, an: [178, 178], ln: [70, 0], lf: [-35, -35], ff: 45 }],
    ['warrior-2', 'Warrior II', 40, true, 'yoga', ['Wide stance, front knee over your ankle.', 'Arms out long at shoulder height. Look over your front hand.'], { t: 180, an: [90, 90], af: [-90, -90], ln: [70, 0], lf: [-40, -40], ff: 45 }],
    ['triangle', 'Triangle pose', 40, true, 'yoga', ['Wide stance with straight legs.', 'Reach forward, then lower one hand to your shin and the other up.'], { t: 100, hd: 110, an: [10, 10], af: [178, 178], ln: [25, 25], lf: [-30, -30], ff: 60 }],
    ['tree', 'Tree pose', 30, true, 'yoga', ['Stand on one leg and place the other foot on your calf or thigh.', 'Hands together at your chest. Avoid pressing on the knee.'], { ...stand, an: [-30, 160], af: [-30, 160], lf: [50, -70], ff: 0 }],
    ['malasana', 'Deep squat', 40, false, 'mobility', ['Feet wider than hips, sink into a deep squat.', 'Press your elbows gently against your knees, chest up.'], { t: 160, an: [60, 160], ln: [110, -10], lf: [110, -10] }],
    ['bridge', 'Bridge pose', 30, false, 'yoga', ['On your back, feet flat, lift your hips.', 'Press through your feet and keep your knees in line.'], { t: -112, hd: -105, an: [-20, 20], ln: [102, 10], lf: [102, 10], props: ['mat'] }],
    ['happy-baby', 'Happy baby', 45, false, 'yoga', ['On your back, hold your feet with knees wide.', 'Let your lower back sink into the floor.'], { ...back, an: [160, 175], ln: [165, 175], lf: [165, 175], fn: 260, ff: 260 }],
    ['corpse', 'Resting pose', 90, false, 'yoga', ['Lie on your back, arms by your sides, palms up.', 'Close your eyes and let your breathing slow down.'], { ...back, an: [0, 0] }],
    ['plank-hold', 'Plank', 30, false, 'mobility', ['Forearms down, body in a straight line.', 'Squeeze your glutes and breathe.'], { t: 98, hd: 100, an: [0, 90], ln: [-82, -82], lf: [-82, -82], fn: -10, ff: -10, props: ['mat'] }],
    ['side-bend', 'Standing side reach', 30, true, 'stretch', ['Reach one arm overhead and lean gently to the side.', 'Keep both feet grounded.'], { ...stand, an: [178, 150] }],
    ['hip-circles', 'Hip circles', 30, false, 'mobility', ['Hands on hips, draw slow, big circles with your hips.', 'Change direction halfway.'], { ...stand, an: [-30, 160], af: [-30, 160], t: 172 }],
    ['leg-swings', 'Leg swings', 30, true, 'mobility', ['Hold a wall and swing one leg forwards and back.', 'Start small and let the swing grow.'], { ...stand, an: [90, 90], ln: [60, 60], props: ['wallFront'] }],
    ['arm-circles', 'Arm circles', 30, false, 'mobility', ['Arms out to the sides, make slow circles.', 'Go forwards, then backwards.'], { ...stand, an: [90, 90], af: [-90, -90] }],
    ['thoracic-rotation', 'Open book', 30, true, 'mobility', ['Lie on your side, knees bent, arms out in front.', 'Open your top arm across to the other side, following it with your eyes.'], { t: -90, hd: -90, an: [180, 180], af: [90, 90], ln: [90, 0], lf: [90, 0], props: ['mat'] }]
  ];
  const poses = POSES.map(([id, name, sec, sides, kind, cues, pose]) => ({ id, name, sec, sides, kind, cues, pose }));
  // Routines: [id, name, about, icon kind, [poseId, seconds?]...]
  const ROUTINES = [
    ['morning', 'Morning wake-up', 'Loosen up after sleep: spine, hips and shoulders.', 'mobility', ['neck-tilt', 'arm-circles', 'cat', 'cow', 'cat', 'cow', 'down-dog', 'low-lunge', 'standing-hamstring', 'overhead-reach']],
    ['after-run', 'After your run', 'Calves, hamstrings, quads and hips, while you cool down.', 'stretch', ['calf-wall', 'standing-quad', 'standing-hamstring', 'hip-flexor', 'pigeon', 'figure-four']],
    ['after-lift', 'Post-lifting cool-down', 'Chest, shoulders, back and hips after a gym session.', 'stretch', ['doorway-chest', 'shoulder-cross', 'triceps-overhead', 'childs-pose', 'hip-flexor', 'knees-chest', 'supine-twist']],
    ['hips', 'Tight hips', 'Open up your hips, especially after sitting or squatting.', 'mobility', ['hip-circles', 'malasana', 'low-lunge', 'pigeon', 'butterfly', 'figure-four', 'happy-baby']],
    ['lower-back', 'Lower back relief', 'Gentle moves to ease a stiff lower back.', 'stretch', ['knees-chest', 'cat', 'cow', 'cat', 'cow', 'childs-pose', 'sphinx', 'supine-twist', 'figure-four']],
    ['desk', 'Desk break', 'Neck, shoulders and upper back. Five minutes, no mat needed.', 'stretch', ['neck-tilt', 'neck-forward', 'shoulder-cross', 'upper-back-hug', 'doorway-chest', 'overhead-reach', 'side-bend']],
    ['beginner-yoga', 'Beginner yoga flow', 'A calm full-body flow to build balance and flexibility.', 'yoga', ['mountain', 'chair', 'standing-hamstring', 'low-lunge', 'down-dog', 'warrior-1', 'warrior-2', 'triangle', 'tree', 'childs-pose', 'bridge', 'corpse']],
    ['bedtime', 'Bedtime wind-down', 'Slow, gentle stretches to help you switch off.', 'yoga', [['childs-pose', 60], ['cat', 20], ['cow', 20], ['seated-fold', 45], ['butterfly', 45], ['supine-twist', 45], ['happy-baby', 45], ['corpse', 120]]]
  ].map(([id, name, about, kind, steps]) => ({ id, name, about, kind, builtIn: true, steps: steps.map(s => Array.isArray(s) ? { pose: s[0], sec: s[1] } : { pose: s }) }));
  window.STRETCH_POSES = poses;
  window.STRETCH_ROUTINES = ROUTINES;
})();
