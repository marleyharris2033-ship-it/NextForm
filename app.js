const KEY="nextform-v1",DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
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
].map(([name,cat,cues,q])=>({name,cat,cues,q}));

const BUILTIN_PLANS=[
{id:"builtin1",name:"Full Body 1 — Classic",type:"Strength",desc:"Balanced barbell and dumbbell full body session.",exercises:[
{name:"Back Squat",sets:3,reps:"6-8",priority:1},{name:"Bench Press",sets:3,reps:"6-8",priority:1},{name:"Lat Pulldown",sets:3,reps:"8-12",priority:1},{name:"Romanian Deadlift",sets:3,reps:"8-10",priority:1},{name:"Lateral Raise",sets:2,reps:"12-15",priority:2},{name:"Barbell Curl",sets:2,reps:"10-12",priority:3}]},
{id:"builtin2",name:"Full Body 2 — Dumbbell",type:"Strength",desc:"Minimal equipment and unilateral work.",exercises:[
{name:"Bulgarian Split Squat",sets:3,reps:"8-10",priority:1},{name:"Incline Dumbbell Press",sets:3,reps:"8-12",priority:1},{name:"Barbell Row",sets:3,reps:"8-12",priority:1},{name:"Romanian Deadlift",sets:3,reps:"8-12",priority:1},{name:"Overhead Press",sets:2,reps:"8-12",priority:2},{name:"Plank",sets:3,reps:"30",priority:3}]},
{id:"builtin3",name:"Full Body 3 — Strength",type:"Strength",desc:"Lower-rep compounds with sensible accessory volume.",exercises:[
{name:"Back Squat",sets:3,reps:"5-6",priority:1},{name:"Bench Press",sets:3,reps:"5-8",priority:1},{name:"Barbell Row",sets:3,reps:"6-8",priority:1},{name:"Romanian Deadlift",sets:2,reps:"6-8",priority:1},{name:"Overhead Press",sets:2,reps:"6-8",priority:2},{name:"Hanging Leg Raise",sets:3,reps:"8-12",priority:3}]},
{id:"builtin4",name:"Full Body 4 — Unilateral",type:"Strength",desc:"Single-limb emphasis for balance and variation.",exercises:[
{name:"Bulgarian Split Squat",sets:3,reps:"8-12",priority:1},{name:"Incline Dumbbell Press",sets:3,reps:"8-12",priority:1},{name:"Seated Cable Row",sets:3,reps:"8-12",priority:1},{name:"Romanian Deadlift",sets:3,reps:"8-12",priority:1},{name:"Lateral Raise",sets:2,reps:"12-15",priority:2},{name:"Hammer Curl",sets:2,reps:"10-15",priority:3},{name:"Plank",sets:2,reps:"45",priority:3}]},
{id:"builtin5",name:"Full Body 5 — Posterior",type:"Strength",desc:"Extra posterior-chain and pulling emphasis.",exercises:[
{name:"Deadlift",sets:3,reps:"5",priority:1},{name:"Bench Press",sets:3,reps:"8-10",priority:1},{name:"Pull-Up",sets:3,reps:"6-10",priority:1},{name:"Bulgarian Split Squat",sets:3,reps:"8-10",priority:1},{name:"Overhead Press",sets:2,reps:"8-10",priority:2},{name:"Barbell Curl",sets:2,reps:"10-12",priority:3},{name:"Triceps Pushdown",sets:2,reps:"10-12",priority:3}]},
{id:"builtin6",name:"Full Body 6 — Higher Rep",type:"Strength",desc:"Higher-rep hypertrophy-style session without fancy machines.",exercises:[
{name:"Back Squat",sets:3,reps:"10-12",priority:1},{name:"Incline Dumbbell Press",sets:3,reps:"10-15",priority:1},{name:"Lat Pulldown",sets:3,reps:"10-15",priority:1},{name:"Romanian Deadlift",sets:3,reps:"10-12",priority:1},{name:"Lateral Raise",sets:3,reps:"12-20",priority:2},{name:"Barbell Row",sets:2,reps:"10-15",priority:2},{name:"Hammer Curl",sets:2,reps:"12-15",priority:3},{name:"Triceps Pushdown",sets:2,reps:"12-15",priority:3}]}
];
const SUBS={
"Back Squat":["Bulgarian Split Squat","Goblet Squat","Front Squat"],"Lat Pulldown":["Pull-Up","Barbell Row","Seated Cable Row"],
"Bench Press":["Incline Dumbbell Press","Push-Up"],"Romanian Deadlift":["Deadlift","Hip Thrust"],"Deadlift":["Romanian Deadlift","Hip Thrust"],
"Seated Cable Row":["Barbell Row","Pull-Up"],"Triceps Pushdown":["Push-Up","Skull Crusher"]
};
let chosenDuration=60;
const CHALLENGES=[
["first","Starter","Complete 1 workout",1,100,d=>d.workouts.length],
["three","Three Strong","Complete 3 workouts",3,150,d=>d.workouts.length],
["ten","Ten Down","Complete 10 workouts",10,300,d=>d.workouts.length],
["twentyfive","Quarter Century","Complete 25 workouts",25,600,d=>d.workouts.length],
["fifty","Fifty Club","Complete 50 workouts",50,1000,d=>d.workouts.length],
["hundred","Centurion","Complete 100 workouts",100,2000,d=>d.workouts.length],
["streak3","Consistency I","Reach a 3-day training streak",3,150,d=>streak()],
["streak5","Consistency II","Reach a 5-day training streak",5,250,d=>streak()],
["streak7","Consistency III","Reach a 7-day training streak",7,400,d=>streak()],
["pb1","Breakthrough","Set 1 strength PB",1,100,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["pb5","PB Hunter","Set 5 strength PBs",5,300,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["pb20","Progress Machine","Set 20 strength PBs",20,800,d=>d.workouts.reduce((s,w)=>s+(w.result?.pbs||0),0)],
["vol10","Move 10 Tonnes","Accumulate 10,000 kg volume",10000,150,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["vol100","100 Tonne Club","Accumulate 100,000 kg volume",100000,600,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["vol500","Half Million","Accumulate 500,000 kg volume",500000,1500,d=>d.workouts.reduce((s,w)=>s+(w.result?.volume||0),0)],
["mins300","Five Hours","Train for 300 total minutes",300,250,d=>d.workouts.reduce((s,w)=>s+(+w.duration||0),0)],
["mins1000","Thousand Minutes","Train for 1,000 total minutes",1000,700,d=>d.workouts.reduce((s,w)=>s+(+w.duration||0),0)],
["strength10","Iron Habit","Complete 10 strength sessions",10,350,d=>d.workouts.filter(w=>w.type==="Strength").length],
["run5","First 5K","Log a run of at least 5 km",1,250,d=>d.workouts.filter(w=>(w.distance||0)>=5).length],
["boxing10","Ten Rounds","Complete a boxing session of 10+ rounds",1,250,d=>d.workouts.filter(w=>(w.rounds||0)>=10).length],
["gradeA","A-Class","Earn 3 A-or-better workout grades",3,300,d=>d.workouts.filter(w=>["A","S"].includes(w.result?.grade)).length],
["gradeS","S-Class","Earn your first S grade",1,500,d=>d.workouts.filter(w=>w.result?.grade==="S").length],
["gradeS5","S-Class Regular","Earn 5 S grades",5,1000,d=>d.workouts.filter(w=>w.result?.grade==="S").length],
["fullbody6","Rotation Master","Complete all 6 built-in full-body workouts",6,750,d=>new Set(d.workouts.map(w=>w.planId).filter(x=>String(x).startsWith("builtin"))).size],
["weight3","Scale Habit","Log bodyweight 3 times",3,100,d=>d.weights.length],
["weight10","Data Driven","Log bodyweight 10 times",10,250,d=>d.weights.length],
["level5","Bronze Bound","Reach level 5",5,300,d=>levelInfo(d.xp).level],
["level10","Double Digit Level","Reach level 10",10,700,d=>levelInfo(d.xp).level],
["long75","Long Haul","Complete a 75+ minute workout",1,150,d=>d.workouts.filter(w=>w.duration>=75).length],
["earlyvar","Variety Pack","Complete 4 different workout types",4,400,d=>new Set(d.workouts.map(w=>w.type)).size]
];

const Y=q=>"https://www.youtube.com/results?search_query="+encodeURIComponent(q);
const defaults={profile:{name:"",age:32,height:185,sex:"male",goalWeight:null},weights:[],workouts:[],xp:0,theme:"dark",plans:[],schedule:{},claimedChallenges:[],version:3};
let data=(()=>{try{let o=JSON.parse(localStorage.getItem(KEY)||"{}");return {...defaults,...o,profile:{...defaults.profile,...(o.profile||{})},plans:o.plans||[],schedule:o.schedule||{},claimedChallenges:o.claimedChallenges||[],version:3}}catch{return JSON.parse(JSON.stringify(defaults))}})();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],today=()=>new Date().toISOString().slice(0,10);$("#date").value=today();$("#weightDate").value=today();
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function levelInfo(xp){let level=1,spent=0,need=500;while(xp-spent>=need){spent+=need;level++;need=Math.round(500*Math.pow(1.16,level-1)/25)*25}return{level,into:xp-spent,need}}
function rankFor(l){return l>=30?"MASTER":l>=20?"ELITE":l>=14?"GOLD":l>=9?"SILVER":l>=5?"BRONZE":"NOVICE"}
function weight(){return data.weights.length?[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).at(-1).value:null}
function e1rm(w,r){return w&&r?w*(1+r/30):0}
function priorBest(name,before){let best=0;for(const w of data.workouts){if(before&&w.date>=before)continue;for(const e of w.exercises||[])if(e.name.toLowerCase()===name.toLowerCase())best=Math.max(best,e1rm(+e.weight,+e.reps))}return best}
function grade(w){const bw=weight()||85;let vol=0,ratio=0,pbs=0,exn=0;for(const e of w.exercises||[]){let wt=+e.weight||0,s=+e.sets||0,r=+e.reps||0;if(e.name)exn++;vol+=wt*s*r;if(wt)ratio=Math.max(ratio,e1rm(wt,r)/bw);let pb=priorBest(e.name,w.date);if(pb&&e1rm(wt,r)>pb*1.005)pbs++}let effort=Math.min(20,Math.max(0,(w.effort-3)*2.85)),duration=Math.min(15,w.duration/4),volume=Math.min(18,Math.log10(vol+10)*4.5),relative=Math.min(15,ratio*8),progress=Math.min(20,pbs*10),cons=Math.min(12,data.workouts.filter(x=>Math.abs(new Date(w.date)-new Date(x.date))<=14*86400000).length*2.5),activity=0;if(w.type==="Running"&&w.distance&&w.runMinutes){activity=Math.max(0,Math.min(23,32-(w.runMinutes/w.distance)*3.2));volume=relative=0}if(w.type==="Boxing"&&w.rounds){activity=Math.min(20,w.rounds*1.8);volume=relative=0}if(w.type==="Mobility"){activity=Math.min(18,w.duration/2.5);volume=relative=0}let score=Math.min(100,effort+duration+volume+relative+progress+cons+activity),g=score>=90?"S":score>=78?"A":score>=66?"B":score>=52?"C":"D",xp=Math.round(80+score*4.2+pbs*55+Math.min(60,exn*7));return{grade:g,score:Math.round(score),xp,pbs,volume:Math.round(vol),breakdown:{Effort:Math.round(effort),Duration:Math.round(duration),Volume:Math.round(volume),"Relative strength":Math.round(relative),Progression:Math.round(progress),Consistency:Math.round(cons),"Activity score":Math.round(activity)}}}
function streak(){let ds=[...new Set(data.workouts.map(w=>w.date))].sort().reverse();if(!ds.length)return 0;if((new Date(today())-new Date(ds[0]))/86400000>1)return 0;let n=1;for(let i=1;i<ds.length;i++){if((new Date(ds[i-1])-new Date(ds[i]))/86400000<=1)n++;else break}return n}
function attrs(){let a={Strength:0,Endurance:0,Conditioning:0,Consistency:0,Progression:0,Mobility:0};data.workouts.forEach(w=>{let s=w.result?.score||50;if(["Strength","Mixed"].includes(w.type))a.Strength+=s*.06;if(["Running","Mixed"].includes(w.type))a.Endurance+=s*.065;if(["Boxing","Running","Mixed"].includes(w.type))a.Conditioning+=s*.055;if(w.type==="Mobility")a.Mobility+=s*.09;a.Consistency+=1.7;a.Progression+=(w.result?.pbs||0)*3.5});Object.keys(a).forEach(k=>a[k]=Math.min(100,Math.round(a[k])));return a}
function week(){let n=new Date(),d=(n.getDay()+6)%7,s=new Date(n);s.setDate(n.getDate()-d);s.setHours(0,0,0,0);let ws=data.workouts.filter(w=>new Date(w.date+"T12:00:00")>=s),mins=ws.reduce((a,w)=>a+(+w.duration||0),0),xp=ws.reduce((a,w)=>a+(w.result?.xp||0),0),vol=ws.reduce((a,w)=>a+(w.result?.volume||0),0),pbs=ws.reduce((a,w)=>a+(w.result?.pbs||0),0),avg=ws.length?ws.reduce((a,w)=>a+(w.result?.score||0),0)/ws.length:0,g=avg>=90?"S":avg>=78?"A":avg>=66?"B":avg>=52?"C":ws.length?"D":"—";return{ws,mins,xp,vol,pbs,g}}
function renderHome(){let l=levelInfo(data.xp),w=week();$("#level").textContent=l.level;$("#rank").textContent=rankFor(l.level);$("#xpCurrent").textContent=l.into;$("#xpRemaining").textContent=`${l.need-l.into} to next level`;$("#xpBar").style.width=(l.into/l.need*100)+"%";$("#weightNow").textContent=weight()?.toFixed(1)||"—";$("#latestGrade").textContent=data.workouts.at(-1)?.result?.grade||"—";$("#streak").textContent=streak();$("#weekCount").textContent=w.ws.length;$("#weekMinutes").textContent=w.mins;$("#weekXP").textContent=w.xp;$("#weekVolume").textContent=w.vol.toLocaleString();$("#weekPBs").textContent=w.pbs;$("#weekGrade").textContent=w.g;$("#weekInsight").textContent=w.ws.length?`${w.ws.length} session${w.ws.length>1?"s":""} completed. ${w.pbs?`${w.pbs} PB${w.pbs>1?"s":""} this week. `:""}${w.mins>=150?"Excellent weekly training volume.":"Keep building your consistency."}`:"Log a workout to start your weekly report.";$("#attrs").innerHTML=Object.entries(attrs()).map(([k,v])=>`<div class="attr"><div class="row"><span>${k}</span><b>${v}</b></div><div class="tinybar"><i style="width:${v}%"></i></div></div>`).join("");let map={};data.workouts.forEach(x=>map[x.date]=(map[x.date]||0)+1);let h="";for(let i=34;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=d.toISOString().slice(0,10);h+=`<div class="heat ${map[k]?"on":""}" title="${k}"></div>`}$("#heatmap").innerHTML=h;renderAchievements()}
const ACH=[["⚡","First Step","Complete your first workout",()=>data.workouts.length>=1],["🔟","Double Digits","Complete 10 workouts",()=>data.workouts.length>=10],["🏆","Committed","Complete 50 workouts",()=>data.workouts.length>=50],["🔥","Heating Up","Reach a 3-day streak",()=>streak()>=3],["🔥","On Fire","Reach a 7-day streak",()=>streak()>=7],["📈","Breakthrough","Set a strength PB",()=>data.workouts.some(w=>(w.result?.pbs||0)>0)],["👑","S-Class","Earn an S grade",()=>data.workouts.some(w=>w.result?.grade==="S")],["🥉","Bronze Rank","Reach level 5",()=>levelInfo(data.xp).level>=5],["🏃","5K","Log a 5 km run",()=>data.workouts.some(w=>(w.distance||0)>=5)],["🥊","Ten Rounds","Complete 10 boxing rounds",()=>data.workouts.some(w=>(w.rounds||0)>=10)]];
function renderAchievements(){let cards=ACH.map(([ic,t,d,fn])=>`<div class="achievement ${fn()?"":"locked"}"><div class="icon">${ic}</div><strong>${t}</strong><span>${fn()?"Unlocked":d}</span></div>`).join("");$("#achievements").innerHTML=cards;$("#achievementPreview").innerHTML=`<div class="achievementGrid">${ACH.slice(0,4).map(([ic,t,d,fn])=>`<div class="achievement ${fn()?"":"locked"}"><div class="icon">${ic}</div><strong>${t}</strong><span>${fn()?"Unlocked":d}</span></div>`).join("")}</div>`}
function addEx(e={}){let f=$("#exTemplate").content.cloneNode(true),r=f.querySelector(".exrow");r.querySelector(".exname").value=e.name||"";r.querySelector(".exsets").value=e.sets||3;r.querySelector(".exreps").value=e.reps||8;r.querySelector(".exweight").value=e.weight??"";r.querySelector(".x").onclick=()=>r.remove();$("#exerciseRows").appendChild(f)}
addEx({name:"Bench Press"});addEx({name:"Back Squat"});$("#addEx").onclick=()=>addEx();$("#type").onchange=()=>{$("#runningFields").classList.toggle("hidden",$("#type").value!=="Running");$("#boxingFields").classList.toggle("hidden",$("#type").value!=="Boxing")};
$("#loadPlanBtn").onclick=()=>go("planner");
$("#finish").onclick=()=>{let ex=$$("#exerciseRows .exrow").map(r=>({name:r.querySelector(".exname").value.trim(),sets:+r.querySelector(".exsets").value||0,reps:+r.querySelector(".exreps").value||0,weight:+r.querySelector(".exweight").value||0})).filter(e=>e.name),w={id:String(Date.now()),date:$("#date").value||today(),type:$("#type").value,duration:+$("#duration").value||0,effort:+$("#effort").value||0,notes:$("#notes").value.trim(),exercises:ex,distance:+$("#distance").value||0,runMinutes:+$("#runMinutes").value||0,rounds:+$("#rounds").value||0,roundLength:+$("#roundLength").value||0};if(!w.duration||w.effort<1||w.effort>10)return alert("Add a valid duration and effort score.");w.planId=$("#finish").dataset.planId||null;w.result=grade(w);data.workouts.push(w);data.xp+=w.result.xp;delete $("#finish").dataset.planId;save();$("#result").classList.remove("hidden");$("#result").innerHTML=`<div class="result"><span class="muted">WORKOUT COMPLETE</span><div class="bigGrade">${w.result.grade}</div><div class="bigXP">+${w.result.xp} XP</div><p>${w.result.score}/100</p><div class="scoreBreak">${Object.entries(w.result.breakdown).filter(x=>x[1]>0).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("")}</div></div>`}
$("#showWeight").onclick=()=>$("#weightEntry").classList.toggle("hidden");$("#saveWeight").onclick=()=>{let v=+$("#weightValue").value;if(!v)return alert("Enter your weight.");data.weights.push({date:$("#weightDate").value||today(),value:v});data.weights.sort((a,b)=>a.date.localeCompare(b.date));$("#weightValue").value="";save()};$("#saveGoal").onclick=()=>{data.profile.goalWeight=+$("#goalWeight").value||null;save()}
function renderProgress(){let all={};data.workouts.forEach(w=>(w.exercises||[]).forEach(e=>{let est=e1rm(+e.weight,+e.reps);if(e.weight&&(!all[e.name]||est>all[e.name].est))all[e.name]={...e,est,date:w.date}}));let es=Object.entries(all).sort((a,b)=>b[1].est-a[1].est);$("#pbs").innerHTML=es.length?es.map(([n,e])=>`<div class="pb"><div><b>${n}</b><small>${e.date} · est. 1RM ${e.est.toFixed(1)} kg</small></div><b>${e.weight} × ${e.reps}</b></div>`).join(""):`<p class="muted">No strength PBs yet.</p>`;let names=[...new Set(data.workouts.flatMap(w=>(w.exercises||[]).map(e=>e.name)))].sort();$("#historyExercise").innerHTML=`<option value="">Choose exercise</option>`+names.map(n=>`<option>${n}</option>`).join("");$("#history").innerHTML=[...data.workouts].reverse().map(w=>`<div class="history"><div><b>${w.type}</b><small>${w.date} · ${w.duration} min · +${w.result?.xp||0} XP</small></div><span class="gradeTag">${w.result?.grade||"—"}</span></div>`).join("")||`<p class="muted">No workouts yet.</p>`;$("#goalWeight").value=data.profile.goalWeight||"";drawWeight();renderAchievements()}
$("#historyExercise").onchange=()=>{let n=$("#historyExercise").value,logs=[];if(!n)return $("#exerciseHistory").innerHTML="";data.workouts.forEach(w=>(w.exercises||[]).filter(e=>e.name===n).forEach(e=>logs.push({date:w.date,...e,est:e1rm(+e.weight,+e.reps)})));$("#exerciseHistory").innerHTML=logs.reverse().map(e=>`<div class="history"><div><b>${e.weight} kg × ${e.reps}</b><small>${e.date} · ${e.sets} sets</small></div><b>${e.est.toFixed(1)} e1RM</b></div>`).join("")}
function drawWeight(){let c=$("#weightChart"),r=c.getBoundingClientRect(),dpr=devicePixelRatio||1,w=Math.max(280,r.width),h=230;c.width=w*dpr;c.height=h*dpr;let x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,w,h);let vals=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);if($("#trendMode").value==="avg"&&vals.length>2)vals=vals.map((v,i,a)=>({...v,value:a.slice(Math.max(0,i-2),i+1).reduce((s,z)=>s+z.value,0)/Math.min(3,i+1)}));let st=getComputedStyle(document.body),line=st.getPropertyValue("--line"),muted=st.getPropertyValue("--muted"),accent=st.getPropertyValue("--accent");x.strokeStyle=line;x.fillStyle=muted;x.font="12px system-ui";for(let i=1;i<5;i++){let y=i*h/5;x.beginPath();x.moveTo(12,y);x.lineTo(w-12,y);x.stroke()}if(vals.length<2){x.textAlign="center";x.fillText(vals.length?"Add another weight":"Add your first weight",w/2,h/2);return}let min=Math.min(...vals.map(v=>v.value))-2,max=Math.max(...vals.map(v=>v.value))+2;x.strokeStyle=accent;x.lineWidth=3;x.beginPath();vals.forEach((v,i)=>{let px=16+i*(w-32)/(vals.length-1),py=h-18-(v.value-min)/(max-min)*(h-36);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
$("#trendMode").onchange=drawWeight;
let activeCat="All";function renderLearn(){let cats=["All",...new Set(EXERCISES.map(e=>e.cat))];$("#categoryChips").innerHTML=cats.map(c=>`<button class="chip ${c===activeCat?"active":""}" data-cat="${c}">${c}</button>`).join("");$$(".chip").forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderLearn()});let q=$("#learnSearch").value.toLowerCase(),list=EXERCISES.filter(e=>(activeCat==="All"||e.cat===activeCat)&&e.name.toLowerCase().includes(q));$("#exerciseLibrary").innerHTML=list.map(e=>`<div class="learnCard"><h3>${e.name}</h3><span class="tiny muted">${e.cat}</span><ul>${e.cues.map(c=>`<li>${c}</li>`).join("")}</ul><a href="${Y(e.q)}" target="_blank" rel="noopener">▶ Watch form guide</a></div>`).join("")}$("#learnSearch").oninput=renderLearn;
function renderProfile(){$("#name").value=data.profile.name||"";$("#age").value=data.profile.age||32;$("#height").value=data.profile.height||185;$("#sex").value=data.profile.sex||"male"}$("#saveProfile").onclick=()=>{data.profile.name=$("#name").value.trim();data.profile.age=+$("#age").value||32;data.profile.height=+$("#height").value||185;data.profile.sex=$("#sex").value;save();alert("Profile saved.")};$("#themeBtn").onclick=()=>{data.theme=data.theme==="light"?"dark":"light";save()};$("#exportBtn").onclick=()=>{let b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="nextform-v2-backup.json";a.click();URL.revokeObjectURL(u)};$("#importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{data={...defaults,...JSON.parse(r.result),version:2};save();alert("Backup imported.")}catch{alert("Backup could not be read.")}};r.readAsText(f)};$("#resetBtn").onclick=()=>{if(confirm("Delete all NextForm data?")){localStorage.removeItem(KEY);location.reload()}}


window.startPremadePlan=id=>{
  let p=BUILTIN_PLANS.find(x=>x.id===id);
  if(!p)return;
  $("#type").value=p.type;
  $("#type").onchange();
  $("#exerciseRows").innerHTML="";
  let maxPriority=chosenDuration<=45?1:chosenDuration<=60?2:3;
  let chosen=p.exercises.filter(e=>(e.priority||1)<=maxPriority);
  chosen.forEach(e=>addEx({name:e.name,sets:e.sets,reps:parseInt(String(e.reps))||8}));
  $("#duration").value=chosenDuration;
  $("#notes").value=`Plan: ${p.name}\nTargets: ${chosen.map(e=>`${e.name} ${e.sets}×${e.reps}`).join(" · ")}`;
  $("#finish").dataset.planId=p.id;
  go("train");
};

window.togglePremadeDetails=id=>{
  let el=document.getElementById("details-"+id);
  if(el)el.classList.toggle("hidden");
};

function renderSimplePlanner(){
  $("#premadeWorkoutList").innerHTML=BUILTIN_PLANS.map(p=>`
    <div class="planCard builtinPlan">
      <div class="row between">
        <div>
          <span class="premadeBadge">PRE-MADE FULL BODY</span>
          <b style="display:block;margin-top:5px">${p.name}</b>
          <div class="tiny muted">${p.desc}</div>
        </div>
        <span class="planNumber">${p.id.replace("builtin","")}/6</span>
      </div>
      <div class="planExercisePreview">
        ${p.exercises.slice(0,4).map(e=>`<span>${e.name}</span>`).join("")}
        ${p.exercises.length>4?`<span>+${p.exercises.length-4} more</span>`:""}
      </div>
      <div class="buttons">
        <button class="primary" onclick="startPremadePlan('${p.id}')">Start workout</button>
        <button class="secondary" onclick="togglePremadeDetails('${p.id}')">View exercises</button>
      </div>
      <div id="details-${p.id}" class="planDetails hidden">
        ${p.exercises.map(e=>`<div><b>${e.name}</b><span>${e.sets} × ${e.reps}</span></div>`).join("")}
      </div>
    </div>
  `).join("");

  $$(".plannerDuration button").forEach(b=>{
    b.classList.toggle("active",+b.dataset.duration===chosenDuration);
    b.onclick=()=>{
      chosenDuration=+b.dataset.duration;
      renderSimplePlanner();
    };
  });

  $("#weekPlanner").innerHTML=DAYS.map(d=>`
    <div class="dayrow diaryRow">
      <b>${d}</b>
      <select data-day="${d}">
        <option value="">Rest / no workout</option>
        ${BUILTIN_PLANS.map(p=>`<option value="${p.id}" ${data.schedule[d]===p.id?"selected":""}>${p.name}</option>`).join("")}
      </select>
      ${data.schedule[d]?`<button class="secondary diaryStart" data-start="${data.schedule[d]}">Start</button>`:""}
    </div>
  `).join("");

  $$("#weekPlanner select").forEach(s=>s.onchange=()=>{
    if(s.value)data.schedule[s.dataset.day]=s.value;
    else delete data.schedule[s.dataset.day];
    save();
  });
  $$(".diaryStart").forEach(b=>b.onclick=()=>startPremadePlan(b.dataset.start));
}

let activeChallengeCat="All";
function challengeStatus(c){let cur=Math.max(0,c[5](data)),target=c[3];return{cur:Math.min(cur,target),target,done:cur>=target,pct:Math.min(100,cur/target*100)}}
function claimChallenge(id){let c=CHALLENGES.find(x=>x[0]===id),s=c&&challengeStatus(c);if(!c||!s.done||data.claimedChallenges.includes(id))return;data.claimedChallenges.push(id);data.xp+=c[4];save()}
function renderChallenges(){
 let cats=["All","Workout","Progress","Special"];$("#challengeChips").innerHTML=cats.map(c=>`<button class="chip ${c===activeChallengeCat?"active":""}" onclick="setChallengeCat('${c}')">${c}</button>`).join("");
 let list=CHALLENGES.filter((c,i)=>activeChallengeCat==="All"||(activeChallengeCat==="Workout"&&i<10)||(activeChallengeCat==="Progress"&&i>=10&&i<24)||(activeChallengeCat==="Special"&&i>=24));
 $("#challengeList").innerHTML=list.map(c=>{let s=challengeStatus(c),claimed=data.claimedChallenges.includes(c[0]);return `<div class="challengeCard ${s.done?"done":""}"><div class="challengeTop"><div><b>${c[1]}</b><p>${c[2]}</p></div><span class="challengeXP">+${c[4]} XP</span></div><div class="challengeProgress"><i style="width:${s.pct}%"></i></div><div class="challengeFoot"><span>${s.cur.toLocaleString()} / ${s.target.toLocaleString()}</span>${s.done&&!claimed?`<button class="primary" onclick="claimChallenge('${c[0]}')">Claim</button>`:claimed?"✓ Claimed":""}</div></div>`}).join("");
 let ready=CHALLENGES.filter(c=>challengeStatus(c).done&&!data.claimedChallenges.includes(c[0])).slice(0,3);
 $("#challengePreview").innerHTML=ready.length?ready.map(c=>`<div class="challengeCard done"><div class="challengeTop"><b>${c[1]}</b><span class="challengeXP">+${c[4]} XP</span></div><p>Ready to claim</p><button class="primary" onclick="claimChallenge('${c[0]}')">Claim reward</button></div>`).join(""):`<p class="muted">Keep training — your next challenges are in the Quest Hub.</p>`;
}
window.setChallengeCat=c=>{activeChallengeCat=c;renderChallenges()};

function renderAll(){document.body.classList.toggle("light",data.theme==="light");$("#exerciseNames").innerHTML=EXERCISES.map(e=>`<option value="${e.name}">`).join("");renderHome();renderPlansV3();renderProgress();renderLearn();renderChallenges();renderProfile()}const titles={home:"Home",train:"Train",planner:"Planner",progress:"Progress",learn:"Learn",challenges:"Challenges",profile:"Profile"};function go(p){$$(".page").forEach(x=>x.classList.toggle("active",x.id===p));$$("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===p));$("#pageTitle").textContent=titles[p];if(p==="progress")setTimeout(drawWeight,30);scrollTo({top:0,behavior:"smooth"})}$$("nav button").forEach(b=>b.onclick=()=>go(b.dataset.page));$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});renderAll();