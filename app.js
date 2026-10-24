const KEY="nextform-v1",DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CALI_EXTRA=new Set(["Push-Up","Pull-Up","Chin-Up","Inverted Row","Hanging Leg Raise","Plank","Side Plank","Decline Push-Up","Incline Push-Up","Neutral-Grip Pull-Up","Wide-Grip Pull-Up"]);
const TIMED_EXTRA=new Set(["Plank","Side Plank"]);
const EXERCISES=[
["Bench Press","Chest",["Plant your feet and keep your upper back stable.","Lower with control to the lower chest.","Keep wrists stacked over forearms."],"Jeff Nippard bench press technique"],
["Incline Dumbbell Press","Chest",["Use a moderate incline.","Keep shoulder blades stable.","Lower under control."],"Jeff Nippard incline dumbbell press"],
["Dumbbell Bench Press","Chest",["Keep shoulder blades stable.","Use a controlled range.","Keep forearms stacked under the dumbbells."],"Jeff Nippard dumbbell bench press"],
["Push-Up","Chest",["Keep body in a straight line.","Lower chest between hands.","Keep elbows at a comfortable angle."],"Jeff Nippard push up technique"],
["Cable Fly","Chest",["Keep a soft bend in the elbows.","Move through the shoulder rather than turning it into a press.","Control the stretch."],"Renaissance Periodization cable fly"],
["Dumbbell Fly","Chest",["Keep a soft elbow bend.","Use a controlled range.","Avoid dropping too deep under load."],"Jeff Nippard dumbbell fly"],
["Back Squat","Legs",["Brace before descending.","Keep your whole foot planted.","Use a controlled depth."],"Squat University squat form"],
["Front Squat","Legs",["Keep elbows high.","Brace before each rep.","Drive through the full foot."],"Squat University front squat"],
["Goblet Squat","Legs",["Hold the dumbbell close to the chest.","Keep your full foot planted.","Stay controlled through depth."],"goblet squat form"],
["Bulgarian Split Squat","Legs",["Use a stable stance.","Lower under control.","Drive through the working leg."],"Jeff Nippard Bulgarian split squat"],
["Reverse Lunge","Legs",["Step back far enough to stay balanced.","Keep the front foot planted.","Drive through the front leg to return."],"reverse lunge form"],
["Walking Lunge","Legs",["Keep a stable stride.","Control the lowering phase.","Push through the lead foot."],"walking lunge form"],
["Step-Up","Legs",["Use a box height you can control.","Drive through the working leg.","Avoid pushing heavily off the trailing foot."],"step up exercise form"],
["Leg Press","Legs",["Keep hips supported.","Control the lowering phase.","Let knees track comfortably."],"Renaissance Periodization leg press"],
["Leg Extension","Legs",["Set the machine to fit your knee position.","Control both directions.","Avoid jerking the stack."],"Renaissance Periodization leg extension"],
["Leg Curl","Legs",["Set the pad position comfortably.","Keep hips controlled.","Curl without swinging."],"Renaissance Periodization leg curl"],
["Romanian Deadlift","Hamstrings",["Push hips back.","Keep the load close.","Stop when position or hamstring tension limits range."],"Jeff Nippard Romanian deadlift"],
["Deadlift","Back",["Set the bar over mid-foot.","Brace before pulling.","Keep the bar close."],"Squat University deadlift form"],
["Hip Thrust","Glutes",["Keep upper back supported.","Finish with glutes.","Avoid excessive lower-back extension."],"Jeff Nippard hip thrust"],
["Glute Bridge","Glutes",["Keep ribs controlled.","Drive through the feet.","Finish by squeezing the glutes, not arching the back."],"glute bridge form"],
["Calf Raise","Calves",["Use a controlled stretch.","Rise through the ball of the foot.","Avoid bouncing."],"Renaissance Periodization calf raise"],
["Overhead Press","Shoulders",["Brace trunk and glutes.","Start with forearms near vertical.","Press smoothly overhead."],"Jeff Nippard overhead press"],
["Dumbbell Shoulder Press","Shoulders",["Keep torso stable.","Press through a comfortable path.","Lower under control."],"Jeff Nippard dumbbell shoulder press"],
["Arnold Press","Shoulders",["Use a controlled rotation.","Keep torso stable.","Avoid forcing excessive range."],"Arnold press form"],
["Lateral Raise","Shoulders",["Lead with the upper arm.","Avoid body swing.","Use a comfortable shoulder range."],"Jeff Nippard lateral raise"],
["Rear Delt Raise","Shoulders",["Keep the movement controlled.","Lead with the upper arms.","Avoid shrugging excessively."],"rear delt raise form"],
["Face Pull","Shoulders",["Pull toward face level.","Keep elbows high enough to target rear delts/upper back.","Control the return."],"face pull form"],
["Barbell Row","Back",["Brace the torso.","Pull toward lower ribs.","Avoid excessive hip swing."],"Jeff Nippard barbell row"],
["One-Arm Dumbbell Row","Back",["Keep hips and torso stable.","Pull the elbow toward the hip.","Control the lowering phase."],"Jeff Nippard one arm dumbbell row"],
["Lat Pulldown","Back",["Keep ribs controlled.","Drive elbows down.","Avoid excessive backward lean."],"Jeff Nippard lat pulldown"],
["Pull-Up","Back",["Start from a controlled hang.","Pull elbows down.","Avoid kicking unless intended."],"Jeff Nippard pull up"],
["Chin-Up","Back",["Start from a controlled hang.","Pull the chest upward.","Avoid excessive swinging."],"chin up technique"],
["Seated Cable Row","Back",["Keep torso controlled.","Pull elbows behind you.","Return slowly."],"Renaissance Periodization cable row"],
["Chest-Supported Dumbbell Row","Back",["Keep chest supported.","Pull elbows back under control.","Avoid shrugging."],"chest supported dumbbell row"],
["Barbell Curl","Arms",["Keep upper arms still.","Avoid hip drive.","Lower under control."],"Jeff Nippard biceps curl"],
["Dumbbell Curl","Arms",["Keep elbows controlled.","Curl without swinging.","Lower fully under control."],"dumbbell curl form"],
["Hammer Curl","Arms",["Use a neutral grip.","Keep elbows controlled.","Avoid swinging."],"Jeff Nippard hammer curl"],
["Incline Dumbbell Curl","Arms",["Keep shoulders back against the bench.","Avoid swinging.","Control the stretched bottom position."],"incline dumbbell curl form"],
["Triceps Pushdown","Arms",["Keep elbows close.","Extend fully under control.","Avoid shoulder movement."],"Jeff Nippard triceps pushdown"],
["Skull Crusher","Arms",["Keep upper arms controlled.","Lower through a comfortable range.","Extend without flaring wildly."],"Jeff Nippard skull crusher"],
["Overhead Triceps Extension","Arms",["Keep elbows reasonably fixed.","Use a comfortable shoulder position.","Control the stretched position."],"overhead triceps extension form"],
["Close-Grip Bench Press","Arms",["Keep wrists stacked.","Use a comfortable grip width.","Lower under control and press smoothly."],"close grip bench press form"],
["Plank","Core",["Brace firmly.","Keep ribs and pelvis controlled.","Stop when position breaks down."],"Squat University plank"],
["Side Plank","Core",["Keep hips stacked.","Brace the trunk.","Avoid sagging through the shoulder."],"side plank form"],
["Hanging Leg Raise","Core",["Minimise swinging.","Curl the pelvis upward.","Use a controllable range."],"Jeff Nippard hanging leg raise"],
["Cable Crunch","Core",["Flex through the trunk rather than only hinging at the hips.","Keep tension on the cable.","Control the return."],"Renaissance Periodization cable crunch"],
["Dead Bug","Core",["Keep lower back controlled.","Move opposite arm and leg slowly.","Only extend as far as you can maintain position."],"dead bug exercise form"],
["Bird Dog","Core",["Keep hips square.","Reach long rather than high.","Move slowly and stay balanced."],"bird dog exercise form"],
["Farmer's Carry","Core",["Stand tall.","Keep ribs and pelvis controlled.","Walk with steady short steps."],"farmer carry technique"],
["Boxing Heavy Bag","Boxing",["Return hands to guard.","Rotate through hips and shoulders.","Keep technique sharp as fatigue rises."],"Tony Jeffries heavy bag technique"],
["Shadow Boxing","Boxing",["Stay balanced.","Use active footwork.","Visualise an opponent and return to guard."],"Tony Jeffries shadow boxing"],
["Jump Rope","Cardio",["Stay light on the feet.","Use small wrist turns.","Keep jumps low and relaxed."],"jump rope boxing technique"],
["Running","Cardio",["Stay relaxed.","Build distance gradually.","Keep easy runs easy enough to recover from."],"running form physiotherapist"]
,
["Box Squat","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Box Squat exercise form"],
["Concentration Curl","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Concentration Curl exercise form"],
["Cossack Squat","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Cossack Squat exercise form"],
["Cross-Body Hammer Curl","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Cross-Body Hammer Curl exercise form"],
["Decline Push-Up","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Decline Push-Up exercise form"],
["Dumbbell Pullover","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Pullover exercise form"],
["Dumbbell Romanian Deadlift","Hamstrings",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Romanian Deadlift exercise form"],
["Dumbbell Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Row exercise form"],
["Dumbbell Squeeze Press","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Squeeze Press exercise form"],
["Dumbbell Step-Back Lunge","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Step-Back Lunge exercise form"],
["Dumbbell Tate Press","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Dumbbell Tate Press exercise form"],
["EZ-Bar Curl","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"EZ-Bar Curl exercise form"],
["Floor Press","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Floor Press exercise form"],
["Front Raise","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Front Raise exercise form"],
["Good Morning","Hamstrings",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Good Morning exercise form"],
["Incline Barbell Press","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Incline Barbell Press exercise form"],
["Incline Push-Up","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Incline Push-Up exercise form"],
["Inverted Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Inverted Row exercise form"],
["JM Press","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"JM Press exercise form"],
["Landmine Press","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Landmine Press exercise form"],
["Lean-Away Lateral Raise","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Lean-Away Lateral Raise exercise form"],
["Low-to-High Cable Fly","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Low-to-High Cable Fly exercise form"],
["Meadows Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Meadows Row exercise form"],
["Neutral-Grip Pull-Up","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Neutral-Grip Pull-Up exercise form"],
["Pendlay Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Pendlay Row exercise form"],
["Plate Squeeze","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Plate Squeeze exercise form"],
["Prone Y Raise","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Prone Y Raise exercise form"],
["Push Press","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Push Press exercise form"],
["Rack Pull","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Rack Pull exercise form"],
["Rear Delt Row","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Rear Delt Row exercise form"],
["Reverse Fly","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Reverse Fly exercise form"],
["Seal Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Seal Row exercise form"],
["Seated Calf Raise","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Seated Calf Raise exercise form"],
["Seated Dumbbell Press","Chest",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Seated Dumbbell Press exercise form"],
["Single-Leg Glute Bridge","Glutes",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Single-Leg Glute Bridge exercise form"],
["Single-Leg Romanian Deadlift","Hamstrings",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Single-Leg Romanian Deadlift exercise form"],
["Spider Curl","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Spider Curl exercise form"],
["Standing Calf Raise","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Standing Calf Raise exercise form"],
["Straight-Arm Pulldown","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Straight-Arm Pulldown exercise form"],
["Sumo Deadlift","Hamstrings",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Sumo Deadlift exercise form"],
["T-Bar Row","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"T-Bar Row exercise form"],
["Upright Row","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Upright Row exercise form"],
["Wide-Grip Pull-Up","Back",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Wide-Grip Pull-Up exercise form"],
["Z Press","Shoulders",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Z Press exercise form"],
["Zercher Squat","Legs",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Zercher Squat exercise form"],
["Zottman Curl","Arms",["Use a controlled range of motion.","Keep the movement stable and avoid unnecessary momentum.","Choose a load you can perform with consistent technique."],"Zottman Curl exercise form"],
["Machine Chest Press", "Chest", ["Set the seat so handles line up with mid-chest.", "Keep shoulder blades back against the pad.", "Press smoothly and control the return."], "Machine Chest Press exercise form"],
["Pec Deck", "Chest", ["Keep a soft bend in the elbows.", "Squeeze the chest to bring the pads together.", "Let the stretch come back slowly."], "Pec Deck exercise form"],
["Weighted Dip", "Chest", ["Lean slightly forward for more chest.", "Lower until shoulders are just below elbows.", "Keep the added weight still, not swinging."], "Weighted Dip exercise form"],
["Trap Bar Deadlift", "Back", ["Stand in the centre of the bar.", "Push the floor away with your legs.", "Keep your chest up and back flat."], "Trap Bar Deadlift exercise form"],
["Machine Row", "Back", ["Set the chest pad so you can reach fully.", "Pull elbows back, not up.", "Pause with shoulder blades squeezed."], "Machine Row exercise form"],
["Back Extension", "Hamstrings", ["Hinge at the hips, not the lower back.", "Squeeze glutes to come up.", "Stop when your body is in a straight line."], "Back Extension exercise form"],
["Barbell Shrug", "Back", ["Hold the bar just outside your thighs.", "Lift shoulders straight up towards ears.", "Pause at the top, lower slowly."], "Barbell Shrug exercise form"],
["Dumbbell Shrug", "Back", ["Let the dumbbells hang at your sides.", "Shrug straight up, don't roll the shoulders.", "Pause, then lower under control."], "Dumbbell Shrug exercise form"],
["Hack Squat", "Legs", ["Feet shoulder-width on the platform.", "Lower until thighs are at least parallel.", "Drive through the whole foot."], "Hack Squat exercise form"],
["Smith Machine Squat", "Legs", ["Feet slightly in front of the bar.", "Keep the bar over mid-foot as you sit down.", "Stand up by pushing the floor away."], "Smith Machine Squat exercise form"],
["Sumo Squat", "Legs", ["Wide stance, toes turned out.", "Keep knees tracking over toes.", "Hold the weight close and chest up."], "Sumo Squat exercise form"],
["Hip Abduction Machine", "Glutes", ["Sit tall with your back against the pad.", "Push knees out with control.", "Pause at the widest point."], "Hip Abduction Machine exercise form"],
["Hip Adduction Machine", "Legs", ["Start at a stretch you can control.", "Squeeze knees together smoothly.", "Don't let the stack slam on the way back."], "Hip Adduction Machine exercise form"],
["Glute Kickback", "Glutes", ["Keep hips square to the floor.", "Drive the heel back and up.", "Squeeze the glute at the top."], "Glute Kickback exercise form"],
["Kettlebell Swing", "Glutes", ["Hinge, don't squat.", "Snap the hips forward to float the bell.", "Keep arms relaxed, the hips do the work."], "Kettlebell Swing exercise form"],
["Preacher Curl", "Arms", ["Keep the back of your arms on the pad.", "Curl up without lifting your elbows.", "Lower all the way under control."], "Preacher Curl exercise form"],
["Cable Curl", "Arms", ["Elbows stay by your sides.", "Curl up and squeeze.", "Resist the cable on the way down."], "Cable Curl exercise form"],
["Overhead Cable Extension", "Arms", ["Face away from the cable, elbows by your head.", "Extend fully overhead.", "Keep elbows pointing forward."], "Overhead Cable Extension exercise form"],
["Machine Shoulder Press", "Shoulders", ["Handles start around shoulder height.", "Press up without arching your back.", "Lower until hands are level with chin."], "Machine Shoulder Press exercise form"],
["Cable Lateral Raise", "Shoulders", ["Stand side-on to the cable.", "Lead with the elbow out to the side.", "Stop around shoulder height."], "Cable Lateral Raise exercise form"],
["Reverse Pec Deck", "Shoulders", ["Face the pad, arms straight ahead.", "Open the arms out to the sides.", "Squeeze the rear shoulders, don't shrug."], "Reverse Pec Deck exercise form"],
["Ab Wheel Rollout", "Core", ["Start on your knees with hips tucked.", "Roll out only as far as your back stays flat.", "Pull back with your abs, not your hips."], "Ab Wheel Rollout exercise form"],
["Russian Twist", "Core", ["Lean back slightly with a straight back.", "Rotate through the ribs, not just the arms.", "Feet down for easier, up for harder."], "Russian Twist exercise form"],
["Pallof Press", "Core", ["Stand side-on to the cable.", "Press straight out and resist the twist.", "Keep hips and shoulders square."], "Pallof Press exercise form"],
["Cable Woodchop", "Core", ["Rotate from high to low across your body.", "Pivot the back foot.", "Control the return."], "Cable Woodchop exercise form"],
["Dip", "Chest", ["Shoulders down, away from ears.", "Lower until shoulders are just below elbows.", "Press up to straight arms."], "Dip exercise form", "cali"],
["Muscle-Up", "Back", ["Pull explosively to the lower chest.", "Turn the wrists over quickly at the top.", "Press out to straight arms."], "Muscle-Up exercise form", "cali"],
["Pistol Squat", "Legs", ["Reach the free leg out in front.", "Sit back and down on one leg.", "Use a support until you have the balance."], "Pistol Squat exercise form", "cali"],
["Bodyweight Squat", "Legs", ["Feet shoulder-width, toes slightly out.", "Sit down between your heels.", "Keep your chest up."], "Bodyweight Squat exercise form", "cali"],
["Handstand Push-Up", "Shoulders", ["Kick up against a wall.", "Lower your head to a triangle with your hands.", "Press back up to straight arms."], "Handstand Push-Up exercise form", "cali"],
["Pike Push-Up", "Shoulders", ["Hips high, body in an upside-down V.", "Lower the top of your head towards the floor.", "Press back up through the shoulders."], "Pike Push-Up exercise form", "cali"],
["Archer Push-Up", "Chest", ["Hands wide, shift your weight to one side.", "Keep the other arm nearly straight.", "Alternate sides each rep."], "Archer Push-Up exercise form", "cali"],
["Diamond Push-Up", "Arms", ["Hands together under your chest.", "Keep elbows close to your body.", "Lower until your chest touches your hands."], "Diamond Push-Up exercise form", "cali"],
["Toes-to-Bar", "Core", ["Hang with straight arms.", "Lift your toes to the bar with control.", "Avoid swinging between reps."], "Toes-to-Bar exercise form", "cali"],
["Dragon Flag", "Core", ["Hold a bench behind your head.", "Keep your body straight from shoulders to toes.", "Lower as slowly as you can."], "Dragon Flag exercise form", "cali"],
["Nordic Curl", "Hamstrings", ["Anchor your heels.", "Lower your body forward as slowly as possible.", "Push back up with your hands if needed."], "Nordic Curl exercise form", "cali"],
["L-Sit", "Core", ["Press down through straight arms.", "Lift your legs straight out in front.", "Tuck the knees to make it easier."], "L-Sit exercise form", "cali timed"],
["Handstand Hold", "Shoulders", ["Stack wrists, shoulders and hips.", "Push the floor away.", "Use a wall until you can balance freely."], "Handstand Hold exercise form", "cali timed"],
["Front Lever Hold", "Back", ["Hang and pull your straight body up to horizontal.", "Keep arms straight and squeeze your lats.", "Start with knees tucked."], "Front Lever Hold exercise form", "cali timed"],
["Back Lever Hold", "Back", ["Hang face-down with your body horizontal.", "Keep arms straight.", "Build up from a tucked position."], "Back Lever Hold exercise form", "cali timed"],
["Planche Lean", "Shoulders", ["Start in a push-up position.", "Lean your shoulders forward past your hands.", "Keep arms straight and body tight."], "Planche Lean exercise form", "cali timed"],
["Hollow Body Hold", "Core", ["Lower back pressed into the floor.", "Arms and legs reaching away.", "Bend the knees to make it easier."], "Hollow Body Hold exercise form", "cali timed"],
["Dead Hang", "Back", ["Hang from the bar with straight arms.", "Relax your shoulders, or pull them down for active hangs.", "Build up your time gradually."], "Dead Hang exercise form", "cali timed"],
["Wall Sit", "Legs", ["Back flat against the wall.", "Thighs parallel to the floor.", "Keep your weight in your heels."], "Wall Sit exercise form", "timed"]].map(([name,cat,cues,q,tags=""])=>({name,cat,cues,q,cali:/cali/.test(tags)||CALI_EXTRA.has(name),timed:/timed/.test(tags)||TIMED_EXTRA.has(name)}));

// Your own plans first, then the built-in ones.
function allPlans(){return [...(data.plans||[]).filter(p=>p&&p.id&&Array.isArray(p.exercises)),...BUILTIN_PLANS]}
const BUILTIN_PLANS=[
{category:"Full Body",id:"fb1",name:"Full Body A — Classic",type:"Strength",desc:"Balanced compounds with simple equipment.",exercises:[
{name:"Back Squat",sets:3,reps:"6-8"},{name:"Bench Press",sets:3,reps:"6-8"},{name:"One-Arm Dumbbell Row",sets:3,reps:"8-12"},{name:"Romanian Deadlift",sets:3,reps:"8-10"},{name:"Lateral Raise",sets:2,reps:"12-15"},{name:"Plank",sets:3,reps:"30-60s"}]},
{category:"Full Body",id:"fb2",name:"Full Body B — Dumbbell",type:"Strength",desc:"Minimal-machine variation.",exercises:[
{name:"Goblet Squat",sets:3,reps:"10-12"},{name:"Incline Dumbbell Press",sets:3,reps:"8-12"},{name:"Chest-Supported Dumbbell Row",sets:3,reps:"8-12"},{name:"Hip Thrust",sets:3,reps:"8-12"},{name:"Dumbbell Shoulder Press",sets:2,reps:"8-12"},{name:"Dead Bug",sets:3,reps:"8-12"}]},
{category:"Full Body",id:"fb3",name:"Full Body C — Strength",type:"Strength",desc:"Lower-rep strength bias.",exercises:[
{name:"Front Squat",sets:3,reps:"5-6"},{name:"Close-Grip Bench Press",sets:3,reps:"5-8"},{name:"Pull-Up",sets:3,reps:"6-10"},{name:"Deadlift",sets:3,reps:"4-6"},{name:"Arnold Press",sets:2,reps:"8-10"},{name:"Hanging Leg Raise",sets:3,reps:"8-12"}]},
{category:"Full Body",id:"fb4",name:"Full Body D — Unilateral",type:"Strength",desc:"Single-limb and stability focus.",exercises:[
{name:"Bulgarian Split Squat",sets:3,reps:"8-10"},{name:"Push-Up",sets:3,reps:"10-20"},{name:"Seated Cable Row",sets:3,reps:"8-12"},{name:"Single-Leg Romanian Deadlift",sets:3,reps:"8-10"},{name:"Rear Delt Raise",sets:2,reps:"12-15"},{name:"Side Plank",sets:3,reps:"30-45s"}]},

{category:"Push / Pull",id:"push1",name:"Push A",type:"Strength",desc:"Chest, shoulders and triceps.",exercises:[
{name:"Dumbbell Bench Press",sets:3,reps:"6-10"},{name:"Overhead Press",sets:3,reps:"6-10"},{name:"Dumbbell Fly",sets:3,reps:"10-15"},{name:"Front Raise",sets:2,reps:"12-15"},{name:"Skull Crusher",sets:3,reps:"8-12"}]},
{category:"Push / Pull",id:"pull1",name:"Pull A",type:"Strength",desc:"Back, rear delts and biceps.",exercises:[
{name:"Barbell Row",sets:3,reps:"6-10"},{name:"Chin-Up",sets:3,reps:"6-10"},{name:"Dumbbell Pullover",sets:3,reps:"10-12"},{name:"Face Pull",sets:3,reps:"12-15"},{name:"Hammer Curl",sets:3,reps:"8-12"}]},
{category:"Push / Pull",id:"push2",name:"Push B",type:"Strength",desc:"Second push variation.",exercises:[
{name:"Floor Press",sets:3,reps:"8-12"},{name:"Landmine Press",sets:3,reps:"8-12"},{name:"Cable Fly",sets:3,reps:"10-15"},{name:"Upright Row",sets:2,reps:"10-12"},{name:"Overhead Triceps Extension",sets:3,reps:"10-15"}]},
{category:"Push / Pull",id:"pull2",name:"Pull B",type:"Strength",desc:"Second pull variation.",exercises:[
{name:"Pendlay Row",sets:3,reps:"5-8"},{name:"Lat Pulldown",sets:3,reps:"8-12"},{name:"Inverted Row",sets:3,reps:"8-15"},{name:"Reverse Fly",sets:3,reps:"12-15"},{name:"Incline Dumbbell Curl",sets:3,reps:"10-12"}]},

{category:"Upper / Lower",id:"upperA",name:"Upper A",type:"Strength",desc:"Upper-body strength and balance.",exercises:[
{name:"Incline Barbell Press",sets:3,reps:"6-10"},{name:"T-Bar Row",sets:3,reps:"6-10"},{name:"Neutral-Grip Pull-Up",sets:3,reps:"6-10"},{name:"Seated Dumbbell Press",sets:3,reps:"8-12"},{name:"EZ-Bar Curl",sets:2,reps:"10-12"}]},
{category:"Upper / Lower",id:"lowerA",name:"Lower A",type:"Strength",desc:"Quad and posterior-chain focus.",exercises:[
{name:"Walking Lunge",sets:3,reps:"10-12"},{name:"Good Morning",sets:3,reps:"8-10"},{name:"Step-Up",sets:3,reps:"8-12"},{name:"Glute Bridge",sets:3,reps:"10-15"},{name:"Standing Calf Raise",sets:3,reps:"12-20"}]},
{category:"Upper / Lower",id:"upperB",name:"Upper B",type:"Strength",desc:"Alternative upper-body session.",exercises:[
{name:"Decline Push-Up",sets:3,reps:"10-20"},{name:"Meadows Row",sets:3,reps:"8-12"},{name:"Straight-Arm Pulldown",sets:3,reps:"10-15"},{name:"Z Press",sets:3,reps:"6-10"},{name:"Concentration Curl",sets:2,reps:"10-15"}]},
{category:"Upper / Lower",id:"lowerB",name:"Lower B",type:"Strength",desc:"Alternative lower-body session.",exercises:[
{name:"Box Squat",sets:3,reps:"6-8"},{name:"Sumo Deadlift",sets:3,reps:"5-8"},{name:"Reverse Lunge",sets:3,reps:"8-12"},{name:"Single-Leg Glute Bridge",sets:3,reps:"10-15"},{name:"Seated Calf Raise",sets:3,reps:"12-20"}]},

{category:"Bro Split",id:"broChest",name:"Chest Day",type:"Strength",desc:"Chest-focused session.",exercises:[
{name:"Dumbbell Squeeze Press",sets:3,reps:"8-12"},{name:"Incline Push-Up",sets:3,reps:"10-20"},{name:"Low-to-High Cable Fly",sets:3,reps:"12-15"},{name:"Plate Squeeze",sets:3,reps:"20-30s"}]},
{category:"Bro Split",id:"broBack",name:"Back Day",type:"Strength",desc:"Back-focused session.",exercises:[
{name:"Rack Pull",sets:3,reps:"5-8"},{name:"Wide-Grip Pull-Up",sets:3,reps:"6-10"},{name:"Dumbbell Row",sets:3,reps:"8-12"},{name:"Seal Row",sets:3,reps:"8-12"}]},
{category:"Bro Split",id:"broLegs",name:"Leg Day",type:"Strength",desc:"Leg-focused session.",exercises:[
{name:"Zercher Squat",sets:3,reps:"6-10"},{name:"Dumbbell Romanian Deadlift",sets:3,reps:"8-12"},{name:"Cossack Squat",sets:3,reps:"8-10"},{name:"Dumbbell Step-Back Lunge",sets:3,reps:"10-12"}]},
{category:"Bro Split",id:"broShoulders",name:"Shoulder Day",type:"Strength",desc:"Shoulder-focused session.",exercises:[
{name:"Push Press",sets:3,reps:"5-8"},{name:"Lean-Away Lateral Raise",sets:3,reps:"12-15"},{name:"Rear Delt Row",sets:3,reps:"10-15"},{name:"Prone Y Raise",sets:3,reps:"12-15"}]},
{category:"Bro Split",id:"broArms",name:"Arm Day",type:"Strength",desc:"Biceps and triceps-focused session.",exercises:[
{name:"Spider Curl",sets:3,reps:"10-12"},{name:"Cross-Body Hammer Curl",sets:3,reps:"10-12"},{name:"Zottman Curl",sets:3,reps:"10-12"},{name:"JM Press",sets:3,reps:"8-12"},{name:"Dumbbell Tate Press",sets:3,reps:"10-12"}]}
];
const SUBS={
"Back Squat":["Bulgarian Split Squat","Goblet Squat","Front Squat"],"Lat Pulldown":["Pull-Up","Barbell Row","Seated Cable Row"],
"Bench Press":["Incline Dumbbell Press","Push-Up"],"Romanian Deadlift":["Deadlift","Hip Thrust"],"Deadlift":["Romanian Deadlift","Hip Thrust"],
"Seated Cable Row":["Barbell Row","Pull-Up"],"Triceps Pushdown":["Push-Up","Skull Crusher"]
};

const CHALLENGES=[
["first","Starter","Complete 1 workout",1,100,d=>d.workouts.length],
["three","Three Strong","Complete 3 workouts",3,150,d=>d.workouts.length],
["ten","Ten Down","Complete 10 workouts",10,300,d=>d.workouts.length],
["twentyfive","Quarter Century","Complete 25 workouts",25,600,d=>d.workouts.length],
["fifty","Fifty Club","Complete 50 workouts",50,1000,d=>d.workouts.length],
["hundred","Centurion","Complete 100 workouts",100,2000,d=>d.workouts.length],
["streak3","Consistency I","Hit your weekly goal 2 weeks in a row",2,150,d=>bestWeekStreak()],
["streak5","Consistency II","Hit your weekly goal 4 weeks in a row",4,250,d=>bestWeekStreak()],
["streak7","Consistency III","Hit your weekly goal 8 weeks in a row",8,400,d=>bestWeekStreak()],
["pb1","Breakthrough","Set 1 strength PB",1,100,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["pb5","PB Hunter","Set 5 strength PBs",5,300,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["pb20","Progress Machine","Set 20 strength PBs",20,800,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["vol10","Move 10 Tonnes","Accumulate 10,000 kg volume",10000,150,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["vol100","100 Tonne Club","Accumulate 100,000 kg volume",100000,600,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["vol500","Half Million","Accumulate 500,000 kg volume",500000,1500,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["mins300","Five Hours","Train for 300 total minutes",300,250,d=>d.workouts.reduce((s,w)=>s+(+w.duration||0),0)],
["mins1000","Thousand Minutes","Train for 1,000 total minutes",1000,700,d=>d.workouts.reduce((s,w)=>s+(+w.duration||0),0)],
["strength10","Iron Habit","Complete 10 strength sessions",10,350,d=>d.workouts.filter(w=>w.type==="Strength").length],
["run5","First 5K","Log a run of at least 5 km",1,250,d=>d.workouts.filter(w=>(!w.type||w.type==="Running")&&(w.distance||0)>=5).length],
["boxing10","Ten Rounds","Complete a boxing or combat session of 10+ rounds",1,250,d=>d.workouts.filter(w=>(!w.type||w.type==="Boxing")&&(w.rounds||0)>=10).length],
["gradeA","A-Class","Earn 3 A-or-better workout grades",3,300,d=>d.workouts.filter(w=>["A","S"].includes(w.result?.grade)).length],
["gradeS","S-Class","Earn your first S grade",1,500,d=>d.workouts.filter(w=>w.result?.grade==="S").length],
["gradeS5","S-Class Regular","Earn 5 S grades",5,1000,d=>d.workouts.filter(w=>w.result?.grade==="S").length],
["fullbody6","Rotation Master","Complete all 4 built-in full-body workouts",4,750,d=>new Set(d.workouts.map(w=>w.planId).filter(id=>BUILTIN_PLANS.some(p=>p.id===id&&p.category==="Full Body"))).size],
["weight3","Scale Habit","Log bodyweight 3 times",3,100,d=>d.weights.length],
["weight10","Data Driven","Log bodyweight 10 times",10,250,d=>d.weights.length],
["level5","Bronze Bound","Reach level 5",5,300,d=>levelInfo(d.xp).level],
["level10","Double Digit Level","Reach level 10",10,700,d=>levelInfo(d.xp).level],
["long75","Long Haul","Complete a 75+ minute workout",1,150,d=>d.workouts.filter(w=>w.duration>=75).length],
["earlyvar","Variety Pack","Complete 4 different workout types",4,400,d=>new Set(d.workouts.map(w=>w.type)).size],
// ----- every activity (category is the 7th item) -----
["ride1","First Ride","Log a bike ride",1,100,d=>qType(d,"Cycling").length,"Activities"],
["ride100","Century Wheels","Cycle 100 km in total",100,400,d=>Math.floor(qSum(qType(d,"Cycling"),"distance")),"Activities"],
["ride50m","Monthly Miles","Cycle 50 km in one calendar month",50,350,d=>Math.floor(qMaxPer(qType(d,"Cycling"),w=>String(w.date).slice(0,7),w=>+w.distance||0)),"Activities"],
["swim1","Making Waves","Log a swim",1,100,d=>qType(d,"Swimming").length,"Activities"],
["swim5k","Five K Swimmer","Swim 5,000 m in total",5000,400,d=>qSum(qType(d,"Swimming"),"metres"),"Activities"],
["swim10","Lane Regular","Complete 10 swims",10,350,d=>qType(d,"Swimming").length,"Activities"],
["walk10","Out and About","Log 10 walks or hikes",10,200,d=>qType(d,"Walking").length,"Activities"],
["walk50","Fifty K Walker","Walk or hike 50 km in total",50,350,d=>Math.floor(qSum(qType(d,"Walking"),"distance")),"Activities"],
["walkweek","Step Week","Log 7 walks in one week",7,300,d=>qMaxPer(qType(d,"Walking"),w=>weekKey(w.date),()=>1),"Activities"],
["hiit1","Heart Starter","Complete a HIIT session",1,100,d=>qType(d,"HIIT").length,"Activities"],
["hiit10","Interval Engine","Complete 10 HIIT sessions",10,350,d=>qType(d,"HIIT").length,"Activities"],
["hiit300","300 Hot Minutes","Do 300 minutes of HIIT",300,400,d=>qSum(qType(d,"HIIT"),"duration"),"Activities"],
["sport5","Team Player","Play 5 sports sessions",5,250,d=>qType(d,"Sports").length,"Activities"],
["sport3","All-Sport","Play 3 different sports",3,300,d=>new Set(qType(d,"Sports").map(w=>w.activity).filter(Boolean)).size,"Activities"],
["pullup1","First Pull-Up","Log a pull-up or chin-up",1,250,d=>d.workouts.some(w=>(w.exercises||[]).some(e=>/pull-up|chin-up|muscle-up/i.test(e.name)&&setsOf(e).some(s=>+s.reps>0)))?1:0,"Activities"],
["push100","Push-Up Century","Do 100 push-ups in one week",100,300,d=>qMaxPer(d.workouts,w=>weekKey(w.date),w=>(w.exercises||[]).filter(e=>/push-up/i.test(e.name)).reduce((a,e)=>a+setsOf(e).reduce((b,s)=>b+(+s.reps||0),0),0)),"Activities"],
["cali20","Bodyweight Boss","Complete 20 calisthenics sessions",20,450,d=>qType(d,"Calisthenics").length,"Activities"],
["mob1","Bend, Don't Break","Complete a stretch or yoga session",1,100,d=>qType(d,"Mobility").length,"Activities"],
["mob7","Flexible Week","Stretch or do yoga 7 days in a row",7,400,d=>qRun(qType(d,"Mobility").map(w=>w.date)),"Activities"],
["mob30","Supple","Complete 30 stretch or yoga sessions",30,600,d=>qType(d,"Mobility").length,"Activities"],
["types5m","Decathlete","Do 5 different activity types in one month",5,450,d=>{const m={};for(const w of d.workouts){const k=String(w.date).slice(0,7);(m[k]=m[k]||new Set).add(w.type||"Strength")}return Math.max(0,...Object.values(m).map(x=>x.size))},"Activities"],
["daily7","Every Single Day","Train 7 days in a row",7,500,d=>qRun(d.workouts.map(w=>w.date)),"Activities"],
// ----- food, friends and stories -----
["food7","Food Diary","Log food 7 days in a row",7,250,d=>qRun((d.foodLog||[]).map(e=>e.date)),"Food & friends"],
["protein5","Protein Pro","Hit your protein target on 5 days",5,300,d=>{const t=window.foodTargets?.()?.protein||0;if(!t)return 0;const by={};for(const e of d.foodLog||[])by[e.date]=(by[e.date]||0)+(+e.protein||0);return Object.values(by).filter(p=>p>=t).length},"Food & friends"],
["cook5","Home Cook","Log 5 NextForm or your own recipes",5,250,d=>(d.foodLog||[]).filter(e=>/recipe/i.test(e.brand||"")).length,"Food & friends"],
["myrecipe","Signature Dish","Create your own recipe",1,150,d=>(d.recipes||[]).length,"Food & friends"],
["scan20","Label Reader","Log 20 different packaged foods",20,250,d=>new Set((d.foodLog||[]).map(e=>e.code).filter(Boolean)).size,"Food & friends"],
["friend1","Squad Up","Add a friend in NextForm",1,150,d=>+d.profile?.social?.friendsMax||0,"Food & friends"],
["kudos10","Cheerleader","Give 10 kudos to friends",10,200,d=>+d.profile?.social?.kudosGiven||0,"Food & friends"],
["party3","Party Animal","Complete 3 weekly party quests",3,400,d=>(d.storyLog||[]).filter(x=>String(x.id).startsWith("party-")).length,"Food & friends"],
["story1","Storyteller","Finish a monthly story quest",1,300,d=>(d.storyLog||[]).filter(x=>/-c4$/.test(x.id)).length,"Food & friends"],
["story3","Saga","Finish 3 monthly story quests",3,700,d=>(d.storyLog||[]).filter(x=>/-c4$/.test(x.id)).length,"Food & friends"]
];
// Quest helpers
function qType(d,t){return (d.workouts||[]).filter(w=>w.type===t)}
function qSum(list,k){return list.reduce((s,w)=>s+(+w[k]||0),0)}
function qMaxPer(list,key,val){const m={};for(const w of list){const k=key(w);m[k]=(m[k]||0)+val(w)}return Math.max(0,...Object.values(m))}
function qRun(dates){const days=[...new Set(dates.filter(Boolean))].map(x=>Math.round(new Date(x+"T12:00:00")/864e5)).sort((a,b)=>a-b);let best=0,run=0,prev=null;for(const x of days){run=prev!==null&&x===prev+1?run+1:1;best=Math.max(best,run);prev=x}return best}

const Y=q=>"https://www.youtube.com/results?search_query="+encodeURIComponent(q);
const defaults={profile:{name:"",age:32,height:185,sex:"male",goalWeight:null,photo:"",setupComplete:false},weights:[],workouts:[],xp:0,theme:"dark",plans:[],schedule:{},claimedChallenges:[],deletedWorkouts:[],foodLog:[],deletedFood:[],nutrition:{},lastExport:null,updatedAt:0,version:3};
// Local-only bookkeeping for cloud backup (never synced): which account owns this device's data, and whether it has unsynced changes.
const OWNER_KEY="nextform-owner",DIRTY_KEY="nextform-dirty";
function normalize(o){o=o&&typeof o==="object"?o:{};const arr=v=>Array.isArray(v)?v:[];return {...JSON.parse(JSON.stringify(defaults)),...o,profile:{...defaults.profile,...(o.profile&&typeof o.profile==="object"?o.profile:{})},workouts:arr(o.workouts).filter(w=>w&&typeof w==="object"),weights:arr(o.weights).filter(w=>w&&w.date&&+w.value),plans:arr(o.plans),schedule:o.schedule&&typeof o.schedule==="object"?o.schedule:{},claimedChallenges:arr(o.claimedChallenges),deletedWorkouts:arr(o.deletedWorkouts),foodLog:arr(o.foodLog).filter(e=>e&&typeof e==="object"&&e.date),deletedFood:arr(o.deletedFood),nutrition:o.nutrition&&typeof o.nutrition==="object"?o.nutrition:{},xp:+o.xp||0,updatedAt:+o.updatedAt||0,version:3}}
let data=(()=>{try{return normalize(JSON.parse(localStorage.getItem(KEY)||"{}"))}catch{return normalize({})}})();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,today=()=>localDate(new Date());$("#weightDate").value=today();
const newId=()=>`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
function writeLocal(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch(e){console.error("NextForm could not save:",e);alert("NextForm couldn't save on this device (storage may be full or blocked). Export a backup now so nothing is lost.");return false}}
function save(){data.updatedAt=Date.now();if(writeLocal())localStorage.setItem(DIRTY_KEY,"1");renderAll();window.dispatchEvent(new Event("nextform-saved"))}
// Used by the cloud backup module (auth.js) to read and replace this device's data.
window.NextForm={
  get data(){return data},
  normalize,OWNER_KEY,DIRTY_KEY,
  get challengeXp(){return Object.fromEntries(CHALLENGES.map(c=>[c[0],c[4]]))},
  replace(next){next=normalize(next);const same=JSON.stringify({...next,updatedAt:0})===JSON.stringify({...data,updatedAt:0});data=next;writeLocal();if(same)return;renderAll();if(data.profile.setupComplete)$("#onboarding").classList.add("hidden");else showOnboardingIfNeeded()}
};
function levelInfo(xp){let level=1,spent=0,need=500;while(xp-spent>=need){spent+=need;level++;need=Math.round(500*Math.pow(1.16,level-1)/25)*25}return{level,into:xp-spent,need}}
function rankFor(l){return l>=30?"MASTER":l>=20?"ELITE":l>=14?"GOLD":l>=9?"SILVER":l>=5?"BRONZE":"NOVICE"}
function weight(){return data.weights.length?[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).at(-1).value:null}
function e1rm(w,r){return w&&r?w*(1+r/30):0}
function priorBest(name,before){let best=0;for(const w of data.workouts){if(before&&w.date>=before)continue;for(const e of w.exercises||[])if(e.name.toLowerCase()===name.toLowerCase())best=Math.max(best,e1rm(+e.weight,+e.reps))}return best}
function grade(w){
  const type=(w.type||"Strength").toLowerCase();
  const bw=weight()||85;
  const age=+data.profile.age||30;
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
  const scoreToGrade=s=>s>=90?"S":s>=78?"A":s>=66?"B":s>=52?"C":"D";
  const priorSame=data.workouts.filter(x=>(x.type||"").toLowerCase()===type && x.date<=w.date);
  const recentSame=priorSame.slice(-6);

  const duration=+w.duration||0;
  const effort=+w.effort||0;
  const consistencyCount=data.workouts.filter(x=>Math.abs(new Date(w.date)-new Date(x.date))<=14*86400000).length;
  const consistencyScore=clamp(consistencyCount*2.5,0,10);

  let volume=0,bestRatio=0,pbs=0,exerciseCount=0;
  for(const e of w.exercises||[]){
    const wt=+e.weight||0,sets=+e.sets||0,reps=+e.reps||0;
    if(e.name)exerciseCount++;
    if(e.unit==="s")continue; // timed holds don't count towards volume or PBs
    const bwl=type==="calisthenics"?(WORKOUT_TYPES.BODYWEIGHT_LOAD[String(e.name).toLowerCase()]||0)*bw:0;
    volume+=Array.isArray(e.setsDetail)&&e.setsDetail.length?e.setsDetail.reduce((v,x)=>v+((+x.kg||0)+bwl)*(+x.reps||0),0):(wt+bwl)*sets*reps;
    if(wt)bestRatio=Math.max(bestRatio,e1rm(wt,reps)/bw);
    const pb=priorBest(e.name,w.date);
    if(pb&&e1rm(wt,reps)>pb*1.005)pbs++;
  }

  let breakdown={},score=0,insight=[];

  if(type==="boxing"){
    const rounds=+w.rounds||0;
    const roundLength=+w.roundLength||0;
    const activeMinutes=rounds*roundLength;

    const durationScore=clamp(duration/60*20,0,20);
    const activeScore=clamp(activeMinutes/30*25,0,25);
    const effortScore=clamp((effort-4)/5*20,0,20);
    const roundScore=clamp(rounds/8*15,0,15);

    let progressionScore=0;
    if(recentSame.length){
      const prevBestActive=Math.max(...recentSame.map(x=>(+x.rounds||0)*(+x.roundLength||0)),0);
      const prevBestRounds=Math.max(...recentSame.map(x=>+x.rounds||0),0);
      if(activeMinutes>prevBestActive) progressionScore+=6;
      if(rounds>prevBestRounds) progressionScore+=4;
    }
    progressionScore=clamp(progressionScore,0,10);

    score=durationScore+activeScore+effortScore+roundScore+progressionScore+consistencyScore;
    breakdown={
      "Total duration":Math.round(durationScore),
      "Active boxing":Math.round(activeScore),
      "Intensity":Math.round(effortScore),
      "Round volume":Math.round(roundScore),
      "Progression":Math.round(progressionScore),
      "Consistency":Math.round(consistencyScore)
    };
    insight.push(`${rounds} rounds × ${roundLength} min = ${activeMinutes} active min`);
  } else if(type==="running"){
    const distance=+w.distance||0;
    const runMinutes=+w.runMinutes||duration||0;
    const pace=distance>0?runMinutes/distance:0;

    const durationScore=clamp(duration/60*20,0,20);
    const distanceScore=clamp(distance/5*20,0,20);
    const effortScore=clamp((effort-3)/7*10,0,10);

    let paceScore=10,progressionScore=0;
    const priorRuns=recentSame.filter(x=>(+x.distance||0)>0 && (+x.runMinutes||0)>0);
    if(priorRuns.length && distance>0){
      const comparable=priorRuns.filter(x=>Math.abs((+x.distance||0)-distance)<=Math.max(1,distance*.25));
      if(comparable.length){
        const avgPace=comparable.reduce((s,x)=>s+(+x.runMinutes/+x.distance),0)/comparable.length;
        const improvement=(avgPace-pace)/avgPace;
        paceScore=clamp(10+improvement*100,0,20);
        if(improvement>0) progressionScore+=clamp(improvement*100,0,12);
      } else {
        paceScore=12;
      }
      const prevMaxDistance=Math.max(...priorRuns.map(x=>+x.distance||0));
      if(distance>prevMaxDistance) progressionScore+=8;
    } else if(distance>0){
      paceScore=12;
    }

    progressionScore=clamp(progressionScore,0,20);
    score=durationScore+distanceScore+paceScore+progressionScore+effortScore+consistencyScore;
    breakdown={
      "Duration":Math.round(durationScore),
      "Distance":Math.round(distanceScore),
      "Pace vs history":Math.round(paceScore),
      "Progression":Math.round(progressionScore),
      "Intensity":Math.round(effortScore),
      "Consistency":Math.round(consistencyScore)
    };
    if(distance>0&&pace>0) insight.push(`${distance.toFixed(1)} km at ${pace.toFixed(2)} min/km`);
  } else if(type==="mobility"){
    const durationScore=clamp(duration/30*30,0,30);
    const exerciseVariety=Math.max(exerciseCount,(w.activities||[]).length,(w.notes||"").trim()?1:0);
    const varietyScore=clamp(exerciseVariety/6*20,0,20);
    const effortScore=clamp(15-Math.abs(effort-5)*3,0,15);
    const completenessScore=clamp((duration>=20?15:duration/20*15)+(exerciseVariety>=3?10:exerciseVariety/3*10),0,25);

    score=durationScore+completenessScore+varietyScore+effortScore+consistencyScore;
    breakdown={
      "Duration":Math.round(durationScore),
      "Session completeness":Math.round(completenessScore),
      "Movement variety":Math.round(varietyScore),
      "Appropriate effort":Math.round(effortScore),
      "Consistency":Math.round(consistencyScore)
    };
    insight.push("Mobility rewards controlled, consistent work rather than maximum intensity");
  } else if(["cycling","swimming","cardio","hiit","sports","walking"].includes(type)){
    const WT=WORKOUT_TYPES, active=WT.activeMinutes(w), met=WT.metOf(w);
    const durationScore=clamp(duration/60*20,0,20);
    const activeScore=clamp(active/45*25,0,25);
    const effortScore=clamp((effort-3)/7*20,0,20);
    const workScore=clamp(active*met/400*15,0,15);
    let progressionScore=0;
    if(recentSame.length){
      const prevActive=Math.max(...recentSame.map(x=>WT.activeMinutes(x)),0);
      const dist=x=>(+x.distance||0)+(+x.metres||0)/1000;
      const prevDist=Math.max(...recentSame.map(dist),0);
      if(active>prevActive)progressionScore+=5;
      if(dist(w)>0&&dist(w)>prevDist)progressionScore+=5;
    }
    progressionScore=clamp(progressionScore,0,10);
    score=durationScore+activeScore+effortScore+workScore+progressionScore+consistencyScore;
    breakdown={
      "Duration":Math.round(durationScore),
      "Active time":Math.round(activeScore),
      "Intensity":Math.round(effortScore),
      "Work done":Math.round(workScore),
      "Progression":Math.round(progressionScore),
      "Consistency":Math.round(consistencyScore)
    };
    const sum=WT.summary(w); if(sum)insight.push(sum);
  } else if(type==="mixed"){
    const durationScore=clamp(duration/60*20,0,20);
    const effortScore=clamp((effort-3)/7*15,0,15);
    const varietyScore=clamp(exerciseCount/6*15,0,15);
    const strengthScore=clamp(Math.log10(volume+10)*4,0,15);
    const cardioMinutes=(+w.rounds||0)*(+w.roundLength||0);
    const cardioScore=clamp(((+w.distance||0)/5*10)+(cardioMinutes/20*10),0,20);
    const progressionScore=clamp(pbs*5,0,5);

    score=durationScore+effortScore+varietyScore+strengthScore+cardioScore+progressionScore+consistencyScore;
    breakdown={
      "Duration":Math.round(durationScore),
      "Intensity":Math.round(effortScore),
      "Training variety":Math.round(varietyScore),
      "Strength work":Math.round(strengthScore),
      "Conditioning work":Math.round(cardioScore),
      "Progression":Math.round(progressionScore),
      "Consistency":Math.round(consistencyScore)
    };
  } else {
    const durationScore=clamp(duration/60*20,0,20);
    const effortScore=clamp((effort-3)/7*25,0,25);
    const volumeScore=clamp(Math.log10(volume+10)*5,0,20);
    const relativeScore=clamp(bestRatio*10,0,15);
    const progressionScore=clamp(pbs*7.5,0,15);
    const strengthConsistency=clamp(consistencyScore/2,0,5);

    score=durationScore+effortScore+volumeScore+relativeScore+progressionScore+strengthConsistency;
    breakdown={
      "Effort":Math.round(effortScore),
      "Duration":Math.round(durationScore),
      "Training volume":Math.round(volumeScore),
      "Relative strength":Math.round(relativeScore),
      "Progression / PBs":Math.round(progressionScore),
      "Consistency":Math.round(strengthConsistency)
    };
    if(pbs) insight.push(`${pbs} strength PB${pbs>1?"s":""}`);
  }

  if((type==="strength"||type==="other") && age>45){
    score+=Math.min(2,(age-45)*.05);
  }

  score=clamp(score,0,100);
  const grade=scoreToGrade(score);
  const xp=Math.round(80+score*4.2+pbs*45+Math.min(50,exerciseCount*6));

  return{
    grade,
    score:Math.round(score),
    xp,
    pbs,
    volume:Math.round(volume),
    insight:insight.join(" · "),
    breakdown
  };
}
function bestStreak(){let ds=[...new Set(data.workouts.map(w=>w.date))].sort(),best=0,run=0;for(let i=0;i<ds.length;i++){run=i&&(new Date(ds[i])-new Date(ds[i-1]))/86400000<=1?run+1:1;best=Math.max(best,run)}return best}
function streak(){let ds=[...new Set(data.workouts.map(w=>w.date))].sort().reverse();if(!ds.length)return 0;if((new Date(today())-new Date(ds[0]))/86400000>1)return 0;let n=1;for(let i=1;i<ds.length;i++){if((new Date(ds[i-1])-new Date(ds[i]))/86400000<=1)n++;else break}return n}
function week(){let n=new Date(),d=(n.getDay()+6)%7,s=new Date(n);s.setDate(n.getDate()-d);s.setHours(0,0,0,0);let ws=data.workouts.filter(w=>new Date(w.date+"T12:00:00")>=s),mins=ws.reduce((a,w)=>a+(+w.duration||0),0),xp=ws.reduce((a,w)=>a+(w.result?.xp||0),0),vol=ws.reduce((a,w)=>a+(w.result?.volume||0),0),pbs=ws.reduce((a,w)=>a+(w.result?.pbs||0),0),avg=ws.length?ws.reduce((a,w)=>a+(w.result?.score||0),0)/ws.length:0,g=avg>=90?"S":avg>=78?"A":avg>=66?"B":avg>=52?"C":ws.length?"D":"—";return{ws,mins,xp,vol,pbs,g}}
const WEEK_GOALS={get sessions(){return weekGoal()},minutes:150,xp:1500};
// Weekly streak: weeks in a row (Monday to Sunday) where you hit your session goal. Rest days never break it.
function weekGoal(){const g=+data.profile?.weekGoal;return g>=1&&g<=7?Math.round(g):3}
function weekKey(ds){const d=new Date(String(ds)+"T12:00:00");if(isNaN(d))return"";d.setDate(d.getDate()-(d.getDay()+6)%7);return localDate(d)}
function weekCounts(){const c={};for(const w of data.workouts){const k=weekKey(w.date);if(k)c[k]=(c[k]||0)+1}return c}
function shiftWeek(k,n){const d=new Date(k+"T12:00:00");d.setDate(d.getDate()+7*n);return localDate(d)}
function weekStreak(){const c=weekCounts(),g=weekGoal(),now=weekKey(today());let n=(c[now]||0)>=g?1:0,k=shiftWeek(now,-1);while((c[k]||0)>=g){n++;k=shiftWeek(k,-1)}return n}
function bestWeekStreak(){const c=weekCounts(),g=weekGoal(),ks=Object.keys(c).sort();if(!ks.length)return 0;let best=0,run=0;for(let k=ks[0],end=weekKey(today());k<=end;k=shiftWeek(k,1)){run=(c[k]||0)>=g?run+1:0;best=Math.max(best,run)}return best}
const TYPE_COLORS=Object.fromEntries(WORKOUT_TYPES.TYPES.map(t=>[t.id,t.color]));
const titleCase=t=>t.charAt(0)+t.slice(1).toLowerCase();
const GRADE_RANK={S:5,A:4,B:3,C:2,D:1};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const fmt=n=>Math.round(n).toLocaleString("en-GB");
// Line icons (24px grid, stroke = currentColor)
const ICON_PATHS={
  flame:'<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-2.6 1.6-4.4 3-5.8.3 1.6 1.1 2.7 2.2 3.2C10.3 9 11.5 5.6 14.5 3c-.2 2.6.6 4.4 2 6 1.3 1.5 2 3.2 2 5.3C18.5 18.2 15.9 21 12 21z"/>',
  scale:'<rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="M8.5 10a3.5 3.5 0 0 1 7 0"/><path d="M12 10l1.5-2"/>',
  dumbbell:'<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
  run:'<circle cx="14.5" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v4M6 12l3-3 4 1 2 3 3 1M11 15l-1-4"/>',
  glove:'<path d="M8 20v-3c-2-1-3-3-3-6V8a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v2h1a2 2 0 0 1 0 4h-2l-1 3v3z"/><path d="M8 17h7"/>',
  lotus:'<path d="M12 19c-4 0-7.5-2-8.5-5 3 0 5.5 1 8.5 5zM12 19c4 0 7.5-2 8.5-5-3 0-5.5 1-8.5 5zM12 19c-2-2.5-2.5-6 0-11 2.5 5 2 8.5 0 11z"/>',
  shuffle:'<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1.5 3.8-3.3M14 8.5C15 7.5 16 7 17 7h3M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"/>',
  sunrise:'<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 4v4M5 9l2 2M19 9l-2 2M9 6.5 12 4l3 2.5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  apple:'<path d="M12 7c-1.2-1.6-4-2-5.6-.4C4.6 8.4 5 12.6 7 16c1.3 2.2 3 4 5 3 2 1 3.7-.8 5-3 2-3.4 2.4-7.6.6-9.4C16 5 13.2 5.4 12 7z"/><path d="M12 7c0-1.8.8-3 2.2-3.6"/>',
  chart:'<path d="M5 20V10M10 20V4M15 20v-7M20 20v-11"/>',
  hex:'<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><path d="M12 8v8M9 11l3-3 3 3"/>',
  medal:'<circle cx="12" cy="14" r="5"/><path d="M9 4l3 5 3-5M12 12v4"/>',
  flag:'<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>',
  rings:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>',
  cookie:'<path d="M20.5 12.5A8.5 8.5 0 1 1 11.5 3.5a3 3 0 0 0 4 4 3 3 0 0 0 5 5z"/><path d="M9 10h.01M8.5 15h.01M13 14h.01M15.5 17h.01"/>'
};
const icon=(name,cls="")=>`<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]||""}</svg>`;
// Colour per skill group, used on skills, exercise cards and the reward screen
const SKILL_COLORS={chest:"var(--pine)",back:"var(--pine)",shoulders:"var(--pine)",arms:"var(--pine)",legs:"var(--pine)",posterior:"var(--pine)",core:"var(--moss)",endurance:"var(--glacier)",boxing:"var(--amber)",mobility:"var(--lichen)"};
function ringsSvg(rings){
  // Concentric progress rings; each {value 0..1+, color}
  const C=60;return rings.map((r,i)=>{const rad=50-i*15,len=2*Math.PI*rad,v=Math.min(1,Math.max(0,r.value));
    return `<circle cx="${C}" cy="${C}" r="${rad}" class="ringTrack"/>`+(v<=0?"":`<circle cx="${C}" cy="${C}" r="${rad}" class="ringFill" style="stroke:${r.color};stroke-dasharray:${len*v} ${len}" transform="rotate(-90 ${C} ${C})"/>`)}).join("")}
function renderAscent(l){
  const box=$("#xpRing");if(!box)return;
  const b=levelBreakdown(data,CHALLENGES),pct=b.need?b.into/b.need:0,R=50,C=2*Math.PI*R,gap=b.into?1.6:0;
  // one arc per discipline, in order, filling the ring up to this level's progress
  let off=0;const arcs=b.parts.filter(p=>p.xp>0).map(p=>{const len=Math.max(0,p.xp/b.need*C-gap),a=`<circle class="xpArc" r="${R}" cx="60" cy="60" stroke="${p.color}" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;off+=p.xp/b.need*C;return a}).join("");
  box.innerHTML=`<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="xpTrack" r="${R}" cx="60" cy="60"/><g transform="rotate(-90 60 60)">${arcs}</g></svg><div class="xpCentre"><b>${Math.floor(pct*100)}%</b><small>${fmt(b.into)} / ${fmt(b.need)}</small><small>XP</small></div>`;
  box.setAttribute("aria-label",`Level ${b.level}: ${fmt(b.into)} of ${fmt(b.need)} XP. `+b.parts.filter(p=>p.xp).map(p=>`${p.name} ${fmt(p.xp)}`).join(", "));
  $("#xpLegend").innerHTML=b.into?b.parts.filter(p=>p.xp>0).map(p=>`<li style="--c:${p.color}"><span>${p.name}</span><b>${fmt(p.xp)}</b></li>`).join(""):`<li class="xpEmpty">Train to start filling your ring</li>`;
  $("#rank").textContent=titleCase(rankFor(l.level));$("#level").textContent=l.level;
  $("#xpRemaining").textContent=`${fmt(l.need-l.into)} XP to level ${l.level+1}`;
}
function renderWeekStrip(){
  const now=new Date(),mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
  const t=today();let h="";
  for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);const k=localDate(d);
    const ws=data.workouts.filter(w=>w.date===k);
    const best=ws.map(w=>w.result?.grade).filter(Boolean).sort((a,b)=>(GRADE_RANK[b]||0)-(GRADE_RANK[a]||0))[0];
    const state=ws.length?"done":k===t?"today":k>t?"future":"rest";
    const col=ws.length?(TYPE_COLORS[ws[0].type]||TYPE_COLORS.Other):"";
    const label=d.toLocaleDateString("en-GB",{weekday:"long"});
    h+=`<div class="day ${state}"${col?` style="--c:${col}"`:""} title="${label}${ws.length?`: ${ws.length} workout${ws.length>1?"s":""}`:""}"><span class="dayRing">${ws.length?(best||"✓"):""}</span><span class="dayName">${DAYS[i].charAt(0)}</span></div>`}
  $("#weekStrip").innerHTML=h;
}
function renderHome(){
  const l=levelInfo(data.xp),w=week();
  renderAscent(l);renderWeekStrip();
  // Weekly goals
  const rings=[{key:"Sessions",val:w.ws.length,goal:WEEK_GOALS.sessions,color:"var(--pine)"},{key:"Minutes",val:w.mins,goal:WEEK_GOALS.minutes,color:"var(--glacier)"},{key:"XP",val:w.xp,goal:WEEK_GOALS.xp,color:"var(--amber)"}].filter(r=>!(data.profile.simple&&r.key==="XP"));
  $("#weekRings").innerHTML=ringsSvg(rings.map(r=>({value:r.val/r.goal,color:r.color})));
  $("#weekLegend").innerHTML=rings.map(r=>`<li style="--c:${r.color}"><span>${r.key}</span><b>${fmt(r.val)}<small> / ${fmt(r.goal)}</small></b></li>`).join("");
  $("#weekGrade").textContent=w.g;
  $("#weekInsight").textContent=w.ws.length?`${w.ws.length} session${w.ws.length>1?"s":""} so far.${w.pbs?` ${w.pbs} new PB${w.pbs>1?"s":""}.`:""} ${w.mins>=WEEK_GOALS.minutes?"You've hit your weekly minutes.":`${WEEK_GOALS.minutes-w.mins} minutes to your weekly goal.`}`:"Log a workout to start your weekly report.";
  // Tiles
  const st=weekStreak(),g=weekGoal(),done=weekCounts()[weekKey(today())]||0,best=bestWeekStreak();
  $("#streak").textContent=st;$("#streakUnit").textContent=st===1?"week":"weeks";
  $("#streakSub").textContent=done>=g?`Goal hit this week${best>st?`. Best: ${best} weeks`:""}`:`This week: ${done} of ${g} sessions`;
  const ws=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)),cur=weight();
  $("#weightNow").textContent=cur?cur.toFixed(1):"–";
  const recent=ws.slice(-12);
  if(recent.length>1){const vs=recent.map(x=>x.value),mn=Math.min(...vs),mx=Math.max(...vs),rg=mx-mn||1;
    $("#weightSpark").innerHTML=`<polyline points="${vs.map((v,i)=>`${(i/(vs.length-1)*100).toFixed(1)},${(25-(v-mn)/rg*22).toFixed(1)}`).join(" ")}"/>`;
    const diff=vs.at(-1)-vs[0],goal=data.profile.goalWeight;
    $("#weightSub").textContent=goal?`${Math.abs(cur-goal).toFixed(1)} kg to goal`:`${diff>0?"+":""}${diff.toFixed(1)} kg recently`;
  }else{$("#weightSpark").innerHTML="";$("#weightSub").textContent=cur?"Log again to see a trend":"Add one in Progress"}
  $("#weekVolume").textContent=w.vol>=10000?(w.vol/1000).toFixed(1):fmt(w.vol);
  $("#weekVolume").nextElementSibling.textContent=w.vol>=10000?"tonnes":"kg";
  $("#weekPBs").textContent=w.pbs;
  const allPbs=data.workouts.reduce((a,x)=>a+(x.result?.pbs||0),0);$("#pbSub").textContent=`${allPbs} all time`;
  // Activity bars, 14 days, coloured by type
  const days=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d)}
  const per=days.map(d=>{const k=localDate(d);return{d,k,ws:data.workouts.filter(x=>x.date===k)}});
  const max=Math.max(60,...per.map(p=>p.ws.reduce((a,x)=>a+(+x.duration||0),0)));
  $("#activityBars").innerHTML=per.map(p=>{const segs=p.ws.map(x=>`<i style="height:${(+x.duration||0)/max*100}%;background:${TYPE_COLORS[x.type]||TYPE_COLORS.Other}" title="${esc(x.type)}, ${x.duration} min"></i>`).join("");
    return `<div class="barCol${p.k===today()?" isToday":""}"><div class="barStack">${segs}</div><span>${p.d.getDate()}</span></div>`}).join("");
  const used=[...new Set(per.flatMap(p=>p.ws.map(x=>TYPE_COLORS[x.type]?x.type:"Other")))];
  $("#typeKey").innerHTML=used.map(t=>`<li style="--c:${TYPE_COLORS[t]}">${esc(WORKOUT_TYPES.typeDef(t).short||WORKOUT_TYPES.typeDef(t).label)}</li>`).join("");
  // Attributes
  // Skills (RPG layer, rpg.js)
  const ch=characterFrom(data.workouts);
  $("#totalLevel").textContent=`Total level ${ch.totalLevel}`;
  $("#skillList").innerHTML=ch.skills.map(k=>`<div class="skill${k.xp?"":" untrained"}" style="--c:${SKILL_COLORS[k.id]}"><span class="hex">${k.level}</span><div class="skillInfo"><div class="skillHead"><span>${k.name}</span><small>${k.max?"Max level":`${fmt(k.need-k.into)} XP to ${k.level+1}`}</small></div><div class="tinybar"><i style="width:${k.max?100:k.into/k.need*100}%"></i></div></div></div>`).join("");
  $("#ascentClass").textContent=ch.title;
  renderBackupNudge();renderAchievements();
}
// Guests: remind them their workouts only live on this device.
function renderBackupNudge(){
  const el=$("#backupNudge");if(!el)return;
  const stale=!data.lastExport||Date.now()-data.lastExport>14*86400000;
  const show=!window.NextFormCloud?.signedIn&&data.workouts.length>=3&&stale;
  el.classList.toggle("hidden",!show);
  const canSignIn=!$("#accountCard").hidden&&!$("#googleSignIn").disabled;
  $("#nudgeSignIn").hidden=!canSignIn;
  $("#nudgeText").textContent=`You have ${data.workouts.length} workouts saved only on this device. ${canSignIn?"Sign in to back them up to your Google account, or export a copy.":"Export a copy so they're safe if this browser's data is cleared."}`;
}
$("#nudgeSignIn")?.addEventListener("click",()=>$("#googleSignIn").click());
$("#nudgeExport")?.addEventListener("click",()=>$("#exportBtn").click());
window.addEventListener("nextform-auth",renderBackupNudge);
// Ask the browser not to clear NextForm's storage automatically (helps on Safari/Chrome when granted).
navigator.storage?.persist?.().catch(()=>{});
const ACH=[["⚡","First Step","Complete your first workout",()=>data.workouts.length>=1],["🔟","Double Digits","Complete 10 workouts",()=>data.workouts.length>=10],["🏆","Committed","Complete 50 workouts",()=>data.workouts.length>=50],["🔥","Heating Up","Hit your weekly goal 3 weeks in a row",()=>bestWeekStreak()>=3||bestStreak()>=3],["🔥","On Fire","Hit your weekly goal 8 weeks in a row",()=>bestWeekStreak()>=8||bestStreak()>=7],["📈","Breakthrough","Set a strength PB",()=>data.workouts.some(w=>(w.result?.pbs||0)>0)],["👑","S-Class","Earn an S grade",()=>data.workouts.some(w=>w.result?.grade==="S")],["🥉","Bronze Rank","Reach level 5",()=>levelInfo(data.xp).level>=5],["🏃","5K","Log a 5 km run",()=>data.workouts.some(w=>(w.distance||0)>=5)],["🥊","Ten Rounds","Complete 10 boxing rounds",()=>data.workouts.some(w=>(w.rounds||0)>=10)]];
function renderAchievements(){
  const items=ACH.map(([ic,t,d,fn])=>({ic,t,d,on:fn()}));
  const card=a=>`<div class="achievement ${a.on?"":"locked"}"><div class="icon">${a.ic}</div><strong>${a.t}</strong><span>${a.on?"Unlocked":a.d}</span></div>`;
  $("#achievements").innerHTML=items.map(card).join("");
  const sorted=[...items.filter(a=>a.on),...items.filter(a=>!a.on)];
  $("#achievementPreview").innerHTML=`<div class="badgeStrip">${sorted.map(a=>`<div class="badge ${a.on?"":"locked"}"><span class="badgeIcon">${a.ic}</span><span>${a.t}</span></div>`).join("")}</div>`;
}
$("#showWeight").onclick=()=>$("#weightEntry").classList.toggle("hidden");$("#saveWeight").onclick=()=>{let v=+$("#weightValue").value;if(!v)return alert("Enter your weight.");data.weights.push({date:$("#weightDate").value||today(),value:v});data.weights.sort((a,b)=>a.date.localeCompare(b.date));$("#weightValue").value="";save()};$("#saveGoal").onclick=()=>{data.profile.goalWeight=+$("#goalWeight").value||null;save()}

// ===== EDITABLE TRAINING LOG =====
let pbsAll=false,logShown=10;
// "60 kg × 8, 8, 6" (same weight) or "60 kg × 8, 62.5 kg × 6"; holds in seconds.
function logSetsText(e){const ss=setsOf(e).filter(s=>s.reps>0);if(!ss.length)return`${e.sets||0} sets`;if(e.unit==="s")return ss.map(s=>`${s.reps}s`).join(", ");const kgs=[...new Set(ss.map(s=>s.kg))];if(kgs.length===1)return kgs[0]?`${kgs[0]} kg × ${ss.map(s=>s.reps).join(", ")}`:`${ss.map(s=>s.reps).join(", ")} reps`;return ss.map(s=>s.kg?`${s.kg} kg × ${s.reps}`:`${s.reps} reps`).join(", ")}
function logExerciseOptions(selected=""){
  const cats=[...new Set(EXERCISES.map(e=>e.cat))];
  return `<option value="">Choose exercise</option>`+
    cats.map(cat=>`<optgroup label="${cat}">${EXERCISES.filter(e=>e.cat===cat).map(e=>`<option value="${e.name}" ${e.name===selected?"selected":""}>${e.name}</option>`).join("")}</optgroup>`).join("");
}

function recalcWorkoutAndXp(w,oldXp=0){
  w.result=grade(w);
  w.updatedAt=Date.now();
  data.xp=Math.max(0,data.xp-oldXp+(w.result?.xp||0));
}

window.deleteWorkoutEntry=id=>{
  const w=data.workouts.find(x=>String(x.id)===String(id));
  if(!w)return;
  if(!confirm(`Delete this ${w.type} workout from ${w.date}?`))return;
  data.xp=Math.max(0,data.xp-(w.result?.xp||0));
  data.workouts=data.workouts.filter(x=>String(x.id)!==String(id));
  data.deletedWorkouts=[...(data.deletedWorkouts||[]),String(id)].slice(-500);
  save();
};

window.deleteExerciseEntry=(id,index)=>{
  const w=data.workouts.find(x=>String(x.id)===String(id));
  if(!w||!w.exercises?.[index])return;
  const ex=w.exercises[index];
  if(!confirm(`Delete ${ex.name} from this workout?`))return;
  const oldXp=w.result?.xp||0;
  w.exercises.splice(index,1);
  recalcWorkoutAndXp(w,oldXp);
  save();
};

window.openAddExerciseToWorkout=id=>{
  const holder=document.getElementById("add-ex-"+id);
  if(!holder)return;
  if(!holder.classList.contains("hidden")){
    holder.classList.add("hidden");
    holder.innerHTML="";
    return;
  }
  holder.innerHTML=`
    <select class="inlineExName">${logExerciseOptions("")}</select>
    <input class="inlineExSets" type="number" min="1" value="3" placeholder="Sets">
    <input class="inlineExReps" type="number" min="1" value="8" placeholder="Reps">
    <input class="inlineExWeight" type="number" min="0" step=".5" placeholder="kg">
    <button class="primary inlineSave">Save</button>
    <button class="secondary inlineCancel">Cancel</button>`;
  holder.classList.remove("hidden");
  holder.querySelector(".inlineCancel").onclick=()=>{holder.classList.add("hidden");holder.innerHTML=""};
  holder.querySelector(".inlineSave").onclick=()=>{
    const name=holder.querySelector(".inlineExName").value;
    if(!name){alert("Choose an exercise.");return}
    const w=data.workouts.find(x=>String(x.id)===String(id));
    if(!w)return;
    const oldXp=w.result?.xp||0;
    w.exercises=w.exercises||[];
    w.exercises.push({
      name,
      sets:+holder.querySelector(".inlineExSets").value||3,
      reps:+holder.querySelector(".inlineExReps").value||8,
      weight:+holder.querySelector(".inlineExWeight").value||0
    });
    recalcWorkoutAndXp(w,oldXp);
    save();
  };
};

function renderProgress(){let all={};data.workouts.forEach(w=>(w.exercises||[]).filter(e=>e.unit!=="s").forEach(e=>{let est=e1rm(+e.weight,+e.reps);if(e.weight&&(!all[e.name]||est>all[e.name].est))all[e.name]={...e,est,date:w.date}}));let es=Object.entries(all).sort((a,b)=>b[1].est-a[1].est);const pbShow=pbsAll?es:es.slice(0,5);$("#pbs").innerHTML=es.length?pbShow.map(([n,e])=>`<div class="pb"><div><b>${esc(n)}</b><small>${e.date} · est. 1-rep max ${e.est.toFixed(1)} kg</small></div><b>${e.weight} kg × ${e.reps}</b></div>`).join("")+(es.length>5?`<button type="button" class="link showMore" id="pbsToggle">${pbsAll?"Show top 5":`Show all ${es.length}`}</button>`:""):`<p class="muted">No strength PBs yet.</p>`;$("#pbsToggle")?.addEventListener("click",()=>{pbsAll=!pbsAll;renderProgress()});let names=[...new Set(data.workouts.flatMap(w=>(w.exercises||[]).map(e=>e.name)))].sort();const histSel=$("#historyExercise").value;$("#historyExercise").innerHTML=`<option value="">Choose exercise</option>`+names.map(n=>`<option value="${esc(n)}"${n===histSel?" selected":""}>${esc(n)}</option>`).join("");const logAll=[...data.workouts].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id)));$("#history").innerHTML=logAll.slice(0,logShown).map(w=>`
  <div class="logWorkoutCard">
    <div class="row between">
      <div>
        <b>${esc(WORKOUT_TYPES.typeDef(w.type).label)}</b>
        <small>${w.date} · ${w.duration} min · +${w.result?.xp||0} XP</small>
      </div>
      <span class="gradeTag">${w.result?.grade||"—"}</span>
    </div>

    ${WORKOUT_TYPES.summary(w)?`<div class="logMeta">${esc(WORKOUT_TYPES.summary(w))}</div>`:""}

    <div class="logExercises">
      ${(w.exercises||[]).length?(w.exercises||[]).map((e,ei)=>`
        <div class="logExerciseItem">
          <div><b>${esc(e.name)}</b><span>${esc(logSetsText(e))}</span></div>
        </div>`).join(""):(WORKOUT_TYPES.typeDef(w.type).mode==="sets"?`<div class="tiny muted">No exercises logged.</div>`:"")}
    </div>

    <div class="logActions">
      <button class="secondary" type="button" data-edit-workout="${esc(String(w.id))}">Edit</button>
      <button class="danger" onclick="deleteWorkoutEntry('${esc(String(w.id))}')">Delete workout</button>
    </div>
  </div>`).join("")+(logAll.length>logShown?`<button type="button" class="secondary full showMoreLog" id="logMore">Show ${Math.min(10,logAll.length-logShown)} more of ${logAll.length-logShown}</button>`:"")||`<p class="muted">No workouts yet. Your completed sessions will appear here.</p>`;$("#logMore")?.addEventListener("click",()=>{logShown+=10;renderProgress()});$("#goalWeight").value=data.profile.goalWeight||"";drawWeight();renderAchievements()}
$("#historyExercise").onchange=()=>{let n=$("#historyExercise").value,logs=[];if(!n)return $("#exerciseHistory").innerHTML="";data.workouts.forEach(w=>(w.exercises||[]).filter(e=>e.name===n).forEach(e=>logs.push({date:w.date,...e,est:e1rm(+e.weight,+e.reps)})));logs.sort((a,b)=>String(b.date).localeCompare(String(a.date)));$("#exerciseHistory").innerHTML=logs.map(e=>`<div class="history"><div><b>${esc(logSetsText(e))}</b><small>${e.date} · ${e.sets} sets</small></div>${e.unit==="s"||!e.weight?"":`<b>${e.est.toFixed(1)} kg est. max</b>`}</div>`).join("")}
function drawWeight(){
  const c=$("#weightChart"),r=c.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(280,r.width),h=220;
  c.width=w*dpr;c.height=h*dpr;const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,w,h);
  let vals=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);
  if($("#trendMode").value==="avg"&&vals.length>2)vals=vals.map((v,i,a)=>({...v,value:a.slice(Math.max(0,i-2),i+1).reduce((s,z)=>s+z.value,0)/Math.min(3,i+1)}));
  const st=getComputedStyle(document.body),col=n=>st.getPropertyValue(n).trim();
  const ink=col("--stone"),line=col("--hairline"),pine=col("--pine"),amber=col("--amber"),font=`12px ${st.fontFamily}`;
  x.font=font;x.fillStyle=ink;
  if(vals.length<2){x.textAlign="center";x.fillText(vals.length?"Add another weight to see your trend":"Add your first weight",w/2,h/2);return}
  const goal=+data.profile.goalWeight||null,all=vals.map(v=>v.value).concat(goal?[goal]:[]);
  let min=Math.floor(Math.min(...all)-1),max=Math.ceil(Math.max(...all)+1);
  const L=40,R=12,T=14,B=26,pw=w-L-R,ph=h-T-B;
  const t0=new Date(vals[0].date).getTime(),t1=new Date(vals.at(-1).date).getTime(),span=t1-t0||1;
  const px=d=>L+(new Date(d).getTime()-t0)/span*pw,py=v=>T+(max-v)/(max-min)*ph;
  // gridlines + labels
  x.strokeStyle=line;x.lineWidth=1;x.textAlign="right";x.textBaseline="middle";
  // whole-number ticks on an even step
  // Pick a tidy step (1, 2, 5, 10, 20…) whose 3 bands cover every weight and the goal.
  {const lo=min,hi=max,steps=[1,2,5,10,20,25,50,100];let step=steps.find(st=>Math.floor(lo/st)*st+st*3>=hi)||Math.ceil((hi-lo)/3);min=Math.floor(lo/step)*step;max=min+step*3}
  const step=(max-min)/3;
  for(let i=0;i<=3;i++){const v=min+step*i,y=py(v);x.beginPath();x.moveTo(L,y);x.lineTo(w-R,y);x.stroke();x.fillText(v.toFixed(0),L-8,y)}
  x.textBaseline="alphabetic";x.textAlign="left";const dl=d=>new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  x.fillText(dl(vals[0].date),L,h-6);x.textAlign="right";x.fillText(dl(vals.at(-1).date),w-R,h-6);
  // goal line
  if(goal){const y=py(goal);x.setLineDash([5,5]);x.strokeStyle=amber;x.lineWidth=1.5;x.beginPath();x.moveTo(L,y);x.lineTo(w-R,y);x.stroke();x.setLineDash([]);
    x.fillStyle=amber;x.textAlign="right";x.textBaseline="bottom";x.fillText(`Goal ${goal} kg`,w-R,y-4);x.textBaseline="alphabetic"}
  // area + line
  x.beginPath();vals.forEach((v,i)=>i?x.lineTo(px(v.date),py(v.value)):x.moveTo(px(v.date),py(v.value)));
  x.strokeStyle=pine;x.lineWidth=2.5;x.lineJoin="round";x.stroke();
  x.lineTo(px(vals.at(-1).date),T+ph);x.lineTo(px(vals[0].date),T+ph);x.closePath();
  const g=x.createLinearGradient(0,T,0,T+ph);g.addColorStop(0,"rgba(31,74,58,.16)");g.addColorStop(1,"rgba(31,74,58,0)");x.fillStyle=g;x.fill();
  const last=vals.at(-1);x.fillStyle=pine;x.beginPath();x.arc(px(last.date),py(last.value),4.5,0,Math.PI*2);x.fill();
}
$("#trendMode").onchange=drawWeight;
let activeCat="All";function renderLearn(){let cats=["All","Calisthenics",...new Set(EXERCISES.map(e=>e.cat))];$("#categoryChips").innerHTML=cats.map(c=>`<button class="chip ${c===activeCat?"active":""}" data-cat="${c}">${c}</button>`).join("");$$("#categoryChips .chip").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderLearn()});let q=$("#learnSearch").value.toLowerCase(),list=EXERCISES.filter(e=>(activeCat==="All"||e.cat===activeCat||(activeCat==="Calisthenics"&&e.cali))&&e.name.toLowerCase().includes(q));
  // Compact list: tap an exercise to see its tips and the form video.
  $("#exerciseLibrary").innerHTML=`<p class="libCount muted small">${list.length} exercise${list.length===1?"":"s"}</p>`+list.map(e=>`<details class="learnCard"><summary><span><b>${esc(e.name)}</b><small>${esc(e.cat)}${e.timed?", timed hold":""}${e.cali?", bodyweight":""}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>${window.Figures?.pictures(e.name,120)||""}<ul>${e.cues.map(c=>`<li>${esc(c)}</li>`).join("")}</ul>${window.FormVideos?FormVideos.button(e.name):`<a href="${Y(e.q)}" target="_blank" rel="noopener">▶ Watch form guide</a>`}</details>`).join("")||`<p class="muted">No exercises match “${esc(q)}”.</p>`}$("#learnSearch").oninput=renderLearn;
function renderProfile(){setAvatar($("#profilePhotoPreview"),data.profile.photo,data.profile.name);$("#name").value=data.profile.name||"";$("#age").value=data.profile.age||32;$("#height").value=data.profile.height||185;$("#sex").value=data.profile.sex||"male";$("#weekGoal").value=String(weekGoal());$("#encourageOn").checked=data.profile.encourage!==false;$("#simpleMode").checked=!!data.profile.simple}$("#saveProfile").onclick=()=>{data.profile.weekGoal=+$("#weekGoal").value||3;data.profile.encourage=$("#encourageOn").checked;data.profile.simple=$("#simpleMode").checked;data.profile.name=$("#name").value.trim();data.profile.age=+$("#age").value||32;data.profile.height=+$("#height").value||185;data.profile.sex=$("#sex").value;data.profile.setupComplete=true;save();alert("Profile saved.")};$("#themeBtn").onclick=()=>{data.theme=data.theme==="light"?"dark":"light";save()};$("#exportBtn").onclick=()=>{let b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`nextform-backup-${today()}.json`;a.click();URL.revokeObjectURL(u);data.lastExport=Date.now();save()};$("#importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=="object"||!Array.isArray(o.workouts))throw 0;if(!confirm(`Replace this device's data with the backup (${o.workouts.length} workouts)?`))return;data=normalize(o);save();alert("Backup imported.")}catch{alert("That file isn't a NextForm backup.")}finally{e.target.value=""}};r.readAsText(f)};$("#deleteAccount")?.addEventListener("click",async()=>{
  if(!confirm("Delete your NextForm account? This permanently deletes your backup (workouts, food, weights, plans and profile) and signs you out on every device. This can't be undone."))return;
  if((prompt('Type DELETE to confirm')||"").trim().toUpperCase()!=="DELETE")return alert("Account not deleted.");
  const b=$("#deleteAccount");b.disabled=true;b.textContent="Deleting…";
  try{await window.NextFormCloud.deleteAccount();alert("Your account and all your NextForm data have been deleted.");location.reload()}
  catch(e){b.disabled=false;b.textContent="Delete my account";alert(String(e?.code||"").includes("popup")?"Deletion was cancelled. Your account hasn't been deleted.":"Couldn't delete your account. Check your connection and try again. If it keeps failing, email Nextformstudio@outlook.com.")}
});
$("#resetBtn").onclick=async()=>{const cloud=window.NextFormCloud?.signedIn;if(!confirm(cloud?"Delete all NextForm data on this device AND in your Google account backup? This can't be undone.":"Delete all NextForm data on this device? Export a backup first if you might want it."))return;if(cloud){try{await window.NextFormCloud.deleteCloud()}catch{alert("Couldn't delete your cloud backup. Check your connection and try again.");return}}[KEY,DIRTY_KEY].forEach(k=>localStorage.removeItem(k));location.reload()}



window.togglePremadeDetails=id=>{let el=document.getElementById("details-"+id);if(el)el.classList.toggle("hidden")};
let activePlanCategory="Full Body",plannerTabChosen=false;
function renderSimplePlanner(){
 const cats=["Full Body","Push / Pull","Upper / Lower","Bro Split"];
 const mine=(data.plans||[]).filter(p=>p&&p.id&&Array.isArray(p.exercises));
 if(!plannerTabChosen&&mine.length)activePlanCategory="My plans";
 $("#planCategoryChips").innerHTML=["My plans",...cats].map(c=>`<button type="button" class="chip ${c===activePlanCategory?"active":""}" data-plan-category="${c}">${c}${c==="My plans"&&mine.length?` <small>${mine.length}</small>`:""}</button>`).join("");
 $("#planCategoryChips").querySelectorAll("[data-plan-category]").forEach(btn=>{
   btn.addEventListener("click",()=>{
     activePlanCategory=btn.dataset.planCategory;plannerTabChosen=true;
     renderSimplePlanner();
   });
 });
 const myView=activePlanCategory==="My plans";
 const visible=myView?mine:BUILTIN_PLANS.filter(p=>p.category===activePlanCategory);
 const createCard=myView?`<button type="button" class="createPlan" id="createPlan"><span class="cpPlus" aria-hidden="true">+</span><span><b>Create a plan</b><small>${mine.length?"Name it, pick exercises from the library, save it.":"Build your own workout from the exercise library and save it to use any time."}</small></span></button>`:"";
 $("#premadeWorkoutList").innerHTML=createCard+visible.map(p=>`
  <div class="planCard builtinPlan">
   <b class="planName">${esc(p.name)}</b>
   <div class="tiny muted">${esc(p.desc||`${p.exercises.length} exercises${p.type&&p.type!=="Strength"?`, ${WORKOUT_TYPES.typeDef(p.type).label}`:""}`)}</div>
   <div class="planExercisePreview">${p.exercises.slice(0,4).map(e=>`<span>${esc(e.name)}</span>`).join("")}${p.exercises.length>4?`<span>+${p.exercises.length-4} more</span>`:""}</div>
   <div class="buttons"><button class="primary" onclick="startPremadePlan('${p.id}')">Start workout</button><button class="secondary" onclick="togglePremadeDetails('${p.id}')">View exercises</button></div>
   <div id="details-${p.id}" class="planDetails hidden">${p.exercises.map(e=>`<div><b>${esc(e.name)}</b><span>${e.sets} × ${esc(e.reps)}</span></div>`).join("")}</div>
   <div class="planMore">${p.custom?`<button type="button" class="link" data-edit-plan="${p.id}">Edit</button><button type="button" class="link" data-copy-plan="${p.id}">Duplicate</button><button type="button" class="link danger" data-delete-plan="${p.id}">Delete</button>`:`<button type="button" class="link" data-copy-plan="${p.id}">Copy to My plans and edit</button>`}</div>
  </div>`).join("")+(myView&&!mine.length?"":"");
 $("#createPlan")?.addEventListener("click",()=>window.openPlanBuilder?.());
 $("#weekPlanner").innerHTML=DAYS.map(d=>`<div class="dayrow diaryRow"><b>${d}</b><select data-day="${d}"><option value="">Rest / no workout</option>${mine.length?`<optgroup label="My plans">${mine.map(p=>`<option value="${p.id}" ${data.schedule[d]===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</optgroup>`:""}${cats.map(cat=>`<optgroup label="${cat}">${BUILTIN_PLANS.filter(p=>p.category===cat).map(p=>`<option value="${p.id}" ${data.schedule[d]===p.id?"selected":""}>${p.name}</option>`).join("")}</optgroup>`).join("")}</select>${data.schedule[d]?`<button class="secondary diaryStart" data-start="${data.schedule[d]}">Start</button>`:""}</div>`).join("");
 $$("#weekPlanner select").forEach(sel=>sel.onchange=()=>{if(sel.value)data.schedule[sel.dataset.day]=sel.value;else delete data.schedule[sel.dataset.day];save()});
 $$(".diaryStart").forEach(b=>b.onclick=()=>startPremadePlan(b.dataset.start));
}

let activeChallengeCat="All";
function challengeStatus(c){let cur=Math.max(0,c[5](data)),target=c[3];return{cur:Math.min(cur,target),target,done:cur>=target,pct:Math.min(100,cur/target*100)}}
function claimChallenge(id){let c=CHALLENGES.find(x=>x[0]===id),s=c&&challengeStatus(c);if(!c||!s.done||data.claimedChallenges.includes(id))return;data.claimedChallenges.push(id);data.claimTimes={...(data.claimTimes||{}),[id]:Date.now()};data.xp+=c[4];save()}
function renderChallenges(){
 let cats=["All","Workout","Progress","Special","Activities","Food & friends"];$("#challengeChips").innerHTML=cats.map(c=>`<button class="chip ${c===activeChallengeCat?"active":""}" data-qcat="${c}">${c}</button>`).join("");$$("#challengeChips [data-qcat]").forEach(b=>b.onclick=()=>setChallengeCat(b.dataset.qcat));
 const catOf=(c,i)=>c[6]||(i<10?"Workout":i<24?"Progress":"Special");let list=CHALLENGES.filter((c,i)=>activeChallengeCat==="All"||catOf(c,i)===activeChallengeCat);
 $("#challengeList").innerHTML=list.map(c=>{let s=challengeStatus(c),claimed=data.claimedChallenges.includes(c[0]);return `<div class="challengeCard ${s.done?"done":""}"><div class="challengeTop"><div><b>${c[1]}</b><p>${c[2]}</p></div><span class="challengeXP">+${c[4]} XP</span></div><div class="challengeProgress"><i style="width:${s.pct}%"></i></div><div class="challengeFoot"><span>${s.cur.toLocaleString()} / ${s.target.toLocaleString()}</span>${s.done&&!claimed?`<button class="primary" onclick="claimChallenge('${c[0]}')">Claim</button>`:claimed?"✓ Claimed":""}</div></div>`}).join("");
 let ready=CHALLENGES.filter(c=>challengeStatus(c).done&&!data.claimedChallenges.includes(c[0])).slice(0,3);
 $("#challengePreview").innerHTML=ready.length?ready.map(c=>`<div class="challengeCard done"><div class="challengeTop"><b>${c[1]}</b><span class="challengeXP">+${c[4]} XP</span></div><p>Ready to claim</p><button class="primary" onclick="claimChallenge('${c[0]}')">Claim reward</button></div>`).join(""):`<p class="muted">Keep training — your next challenges are in the Quest Hub.</p>`;
}
window.setChallengeCat=c=>{activeChallengeCat=c;renderChallenges()};


// ===== PROFILE SETUP + WORKOUT TIMER =====
let pendingSetupPhoto="";
function avatarMarkupData(photo,name){
  return photo || "";
}
function setAvatar(el,photo,name){
  if(!el)return;
  if(photo){
    el.style.backgroundImage=`url("${photo}")`;
    el.textContent="";
    el.classList.add("hasPhoto");
  }else{
    el.style.backgroundImage="";
    el.textContent=(name||"N").trim().charAt(0).toUpperCase()||"N";
    el.classList.remove("hasPhoto");
  }
}
function compressPhoto(file,callback){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const size=320,canvas=document.createElement("canvas");
      canvas.width=size;canvas.height=size;
      const ctx=canvas.getContext("2d");
      const scale=Math.max(size/img.width,size/img.height);
      const w=img.width*scale,h=img.height*scale;
      ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
      callback(canvas.toDataURL("image/jpeg",0.78));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
$("#setupPhoto")?.addEventListener("change",e=>{
  const f=e.target.files?.[0]; if(!f)return;
  compressPhoto(f,dataUrl=>{pendingSetupPhoto=dataUrl;setAvatar($("#setupPhotoPreview"),dataUrl,$("#setupName").value)});
});
$("#profilePhotoInput")?.addEventListener("change",e=>{
  const f=e.target.files?.[0];if(!f)return;
  compressPhoto(f,dataUrl=>{data.profile.photo=dataUrl;save();setAvatar($("#profilePhotoPreview"),dataUrl,data.profile.name)});
});
$("#setupName")?.addEventListener("input",()=>{if(!pendingSetupPhoto)setAvatar($("#setupPhotoPreview"),"",$("#setupName").value)});

$("#completeSetup")?.addEventListener("click",()=>{
  const name=$("#setupName").value.trim();
  const age=+$("#setupAge").value;
  const height=+$("#setupHeight").value;
  const wt=+$("#setupWeight").value;
  if(!name||!age||!height||!wt){alert("Please add your name, age, height and current weight.");return}
  data.profile={...data.profile,name,age,height,sex:$("#setupSex").value,goalWeight:+$("#setupGoalWeight").value||null,photo:pendingSetupPhoto||data.profile.photo||"",setupComplete:true};
  if(!data.weights.length)data.weights.push({date:today(),value:wt});
  save();
  $("#onboarding").classList.add("hidden");
});

function showOnboardingIfNeeded(){
  if(data.profile.setupComplete)return;
  $("#setupName").value=data.profile.name||"";
  $("#setupAge").value=data.profile.age||"";
  $("#setupHeight").value=data.profile.height||"";
  $("#setupSex").value=data.profile.sex||"male";
  $("#setupGoalWeight").value=data.profile.goalWeight||"";
  $("#setupWeight").value=weight()||"";
  pendingSetupPhoto=data.profile.photo||"";
  setAvatar($("#setupPhotoPreview"),pendingSetupPhoto,data.profile.name);
  $("#onboarding").classList.remove("hidden");
}

function formatTimer(sec){
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function setHeader(p=document.querySelector(".page.active")?.id||"home"){
  const home=p==="home",name=(data.profile.name||"").trim().split(" ")[0];
  $("#pageTitle").textContent=home?(name?`Hi ${name}`:"Welcome"):titles[p];
  $("#pageKicker").textContent=home?new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}):"";
  $("#pageKicker").hidden=!home;
  setAvatar($("#avatarBtn"),data.profile.photo,data.profile.name);
}
$("#avatarBtn").addEventListener("click",()=>go("profile"));
function renderAll(){document.body.classList.toggle("light",data.theme==="light");document.body.classList.toggle("simple",!!data.profile?.simple);$("#exerciseNames").innerHTML=EXERCISES.map(e=>`<option value="${e.name}">`).join("");renderHome();renderSimplePlanner();renderProgress();renderLearn();renderChallenges();renderProfile();window.renderFood?.();window.renderTrain?.();window.renderInsights?.();window.Encourage?.renderHomeQuote();window.NextFormGoal?.render();window.NextFormStory?.render();setHeader()}const titles={home:"Home",train:"Train",planner:"Plans",progress:"Progress",learn:"Exercise library",food:"Food",challenges:"Quests",profile:"Profile"};function go(p){$$(".page").forEach(x=>x.classList.toggle("active",x.id===p));$$("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===p));setHeader(p);if(p==="progress")setTimeout(()=>{drawWeight();window.renderInsights?.()},30);scrollTo({top:0,behavior:"smooth"})}function bindNavigation(){
  $$("nav button").forEach(b=>{
    b.onclick=null;
    b.addEventListener("click",()=>go(b.dataset.page));
  });
  $$("[data-go]").forEach(b=>{
    b.onclick=null;
    b.addEventListener("click",()=>go(b.dataset.go));
  });
}
bindNavigation();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
try{renderAll();
showOnboardingIfNeeded();}catch(err){console.error("NextForm startup error:",err);}

