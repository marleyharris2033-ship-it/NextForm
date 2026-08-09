
const KEY = "nextform-v1";
const today = () => new Date().toISOString().slice(0,10);
const defaultData = {
  profile:{name:"",age:32,height:185,sex:"male"},
  weights:[],
  workouts:[],
  xp:0,
  theme:"dark"
};
let data = load();
function load(){
  try { return {...defaultData, ...JSON.parse(localStorage.getItem(KEY)||"{}")}; }
  catch(e){ return structuredClone(defaultData); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(data)); renderAll(); }

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

$("#workoutDate").value = today();
$("#weightDate").value = today();

function levelInfo(xp){
  let level=1, need=500, spent=0;
  while(xp-spent >= need){
    spent += need; level++; need = Math.round(500*Math.pow(1.16,level-1)/25)*25;
  }
  return {level, into:xp-spent, need};
}
function currentWeight(){
  if(!data.weights.length) return null;
  return [...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).at(-1).value;
}
function previousExerciseBest(name){
  let best=0;
  for(const w of data.workouts){
    for(const ex of w.exercises||[]){
      if(ex.name.toLowerCase()===name.toLowerCase()){
        best=Math.max(best, Number(ex.weight)||0);
      }
    }
  }
  return best;
}

function gradeWorkout(w){
  const bw = currentWeight() || 85;
  const age = Math.max(16, Number(data.profile.age)||30);
  let volume = 0, heaviestRatio = 0, progressionCount=0, exerciseCount=0;

  (w.exercises||[]).forEach(ex=>{
    const wt=Number(ex.weight)||0, sets=Number(ex.sets)||0, reps=Number(ex.reps)||0;
    if(ex.name.trim()) exerciseCount++;
    volume += wt*sets*reps;
    if(wt>0) heaviestRatio=Math.max(heaviestRatio, wt/bw);
    const prev = previousExerciseBest(ex.name);
    if(prev>0 && wt>prev) progressionCount++;
  });

  // Scores intentionally weight personal progression and effort more than raw strength.
  const effortScore = Math.min(20, Math.max(0,(Number(w.effort)-4)*3.3));
  const durationScore = Math.min(15, Number(w.duration)/4);
  const volumeScore = Math.min(20, Math.log10(volume+10)*5);
  const relativeStrength = Math.min(18, heaviestRatio*12);
  const progressionScore = Math.min(17, progressionCount*8.5);
  const consistencyDays = data.workouts.filter(x => (new Date(w.date)-new Date(x.date)) <= 1000*60*60*24*10 && x.date <= w.date).length;
  const consistencyScore = Math.min(10, consistencyDays*2);

  // Small age context: no harsh penalty; simply reduces expectations slightly after 40.
  const ageAdj = age > 40 ? Math.min(4,(age-40)*0.12) : 0;
  const score = Math.max(0, Math.min(100, effortScore+durationScore+volumeScore+relativeStrength+progressionScore+consistencyScore+ageAdj));

  let grade="D";
  if(score>=90) grade="S";
  else if(score>=78) grade="A";
  else if(score>=66) grade="B";
  else if(score>=52) grade="C";

  const xp = Math.round(70 + score*4 + progressionCount*40 + Math.min(80, exerciseCount*10));
  return {grade, score:Math.round(score), xp, breakdown:{
    Effort:Math.round(effortScore),
    Duration:Math.round(durationScore),
    Volume:Math.round(volumeScore),
    "Relative strength":Math.round(relativeStrength),
    Progression:Math.round(progressionScore),
    Consistency:Math.round(consistencyScore)
  }};
}

function attributes(){
  let s=0,e=0,c=0,p=0;
  const sorted=[...data.workouts].sort((a,b)=>a.date.localeCompare(b.date));
  sorted.forEach(w=>{
    const g=w.result||{score:0};
    const t=(w.type||"").toLowerCase();
    if(["strength","mixed"].includes(t)) s += g.score*.08;
    if(["boxing","running","mixed"].includes(t)) e += g.score*.08;
    c += 2;
    const anyPb=(w.exercises||[]).some(ex=>{
      const prior=sorted.filter(x=>x.date<w.date).flatMap(x=>x.exercises||[]).filter(y=>y.name.toLowerCase()===ex.name.toLowerCase());
      return prior.length && Number(ex.weight)>Math.max(...prior.map(y=>Number(y.weight)||0));
    });
    if(anyPb) p+=4;
  });
  return {strength:Math.min(99,Math.round(s)),endurance:Math.min(99,Math.round(e)),consistency:Math.min(99,Math.round(c)),progression:Math.min(99,Math.round(p))};
}

function renderAll(){
  document.body.classList.toggle("light", data.theme==="light");
  const li=levelInfo(data.xp);
  $("#level").textContent=li.level;
  $("#xpNow").textContent=li.into;
  $("#xpNext").textContent=li.need-li.into;
  $("#xpBar").style.width=`${Math.min(100,li.into/li.need*100)}%`;
  $("#currentWeight").textContent=currentWeight()?.toFixed(1) ?? "—";
  $("#workoutCount").textContent=data.workouts.length;
  $("#latestGrade").textContent=data.workouts.at(-1)?.result?.grade ?? "—";
  const a=attributes();
  $("#attrStrength").textContent=a.strength;
  $("#attrEndurance").textContent=a.endurance;
  $("#attrConsistency").textContent=a.consistency;
  $("#attrProgression").textContent=a.progression;

  const recent=[...data.workouts].reverse().slice(0,5);
  $("#recentWorkouts").innerHTML = recent.length ? recent.map(w=>`
    <div class="workout-item">
      <div><b>${escapeHtml(w.type)}</b><div class="muted small">${w.date} · ${w.duration} min · ${w.exercises.length} exercises</div></div>
      <b class="grade">${w.result.grade}</b>
    </div>`).join("") : `<div class="empty">No workouts yet.</div>`;

  $("#profileName").value=data.profile.name||"";
  $("#profileAge").value=data.profile.age||32;
  $("#profileHeight").value=data.profile.height||185;
  $("#profileSex").value=data.profile.sex||"male";

  renderWeight();
  renderPBs();
}
function escapeHtml(v=""){ return v.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

function addExercise(defaults={}){
  const node=$("#exerciseTemplate").content.cloneNode(true);
  node.querySelector(".ex-name").value=defaults.name||"";
  node.querySelector(".ex-sets").value=defaults.sets||3;
  node.querySelector(".ex-reps").value=defaults.reps||8;
  node.querySelector(".ex-weight").value=defaults.weight??"";
  node.querySelector(".remove-ex").onclick=e=>e.currentTarget.closest(".exercise-row").remove();
  $("#exerciseList").appendChild(node);
}
addExercise({name:"Bench Press"});
addExercise({name:"Squat"});

$("#addExercise").onclick=()=>addExercise();

$("#saveWorkout").onclick=()=>{
  const exercises=$$("#exerciseList .exercise-row").map(r=>({
    name:r.querySelector(".ex-name").value.trim(),
    sets:Number(r.querySelector(".ex-sets").value)||0,
    reps:Number(r.querySelector(".ex-reps").value)||0,
    weight:Number(r.querySelector(".ex-weight").value)||0
  })).filter(x=>x.name);
  const w={
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date:$("#workoutDate").value||today(),
    type:$("#workoutType").value,
    duration:Number($("#duration").value)||0,
    effort:Number($("#effort").value)||0,
    notes:$("#notes").value.trim(),
    exercises
  };
  if(!w.duration || w.effort<1 || w.effort>10){ alert("Add a valid duration and effort score."); return; }
  const result=gradeWorkout(w);
  w.result=result;
  data.workouts.push(w); data.xp += result.xp;
  save();
  $("#gradeResult").classList.remove("hidden");
  $("#gradeResult").innerHTML=`
    <div class="grade-result">
      <div class="muted">WORKOUT COMPLETE</div>
      <div class="big-grade">${result.grade}</div>
      <div class="xp-earned">+${result.xp} XP</div>
      <p class="muted small">Session score ${result.score}/100</p>
      <div class="breakdown">
        ${Object.entries(result.breakdown).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("")}
      </div>
    </div>`;
  $("#notes").value="";
  window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
};

$("#addWeightBtn").onclick=()=>$("#weightEntry").classList.toggle("hidden");
$("#saveWeight").onclick=()=>{
  const value=Number($("#weightValue").value), date=$("#weightDate").value||today();
  if(!value){ alert("Enter your weight in kg."); return; }
  data.weights.push({date,value});
  data.weights.sort((a,b)=>a.date.localeCompare(b.date));
  save();
  $("#weightValue").value="";
  $("#weightEntry").classList.add("hidden");
};

function renderWeight(){
  const list=[...data.weights].sort((a,b)=>b.date.localeCompare(a.date));
  $("#weightHistory").innerHTML=list.slice(0,8).map(x=>`<div class="history-row"><span>${x.date}</span><b>${x.value.toFixed(1)} kg</b></div>`).join("");
  drawChart();
}
function drawChart(){
  const c=$("#weightChart"), dpr=window.devicePixelRatio||1;
  const rect=c.getBoundingClientRect(); const w=Math.max(280,rect.width), h=220;
  c.width=w*dpr; c.height=h*dpr; const ctx=c.getContext("2d"); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);
  const vals=[...data.weights].sort((a,b)=>a.date.localeCompare(b.date)).slice(-12);
  const styles=getComputedStyle(document.body), line=styles.getPropertyValue("--line").trim(), text=styles.getPropertyValue("--muted").trim(), accent=styles.getPropertyValue("--accent").trim();
  ctx.strokeStyle=line; ctx.fillStyle=text; ctx.lineWidth=1; ctx.font="12px system-ui";
  for(let i=1;i<5;i++){let y=i*h/5;ctx.beginPath();ctx.moveTo(12,y);ctx.lineTo(w-12,y);ctx.stroke();}
  if(vals.length<2){ctx.textAlign="center";ctx.fillText(vals.length?"Add another weight to see a trend":"Add your first weight",w/2,h/2);return;}
  const min=Math.min(...vals.map(v=>v.value))-2, max=Math.max(...vals.map(v=>v.value))+2;
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();
  vals.forEach((v,i)=>{const x=16+i*(w-32)/(vals.length-1);const y=h-18-(v.value-min)/(max-min)*(h-36); i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.stroke();
  ctx.fillStyle=accent;
  vals.forEach((v,i)=>{const x=16+i*(w-32)/(vals.length-1);const y=h-18-(v.value-min)/(max-min)*(h-36);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});
}

function renderPBs(){
  const pb={};
  data.workouts.forEach(w=>(w.exercises||[]).forEach(ex=>{
    if(Number(ex.weight)>0 && (!pb[ex.name] || Number(ex.weight)>pb[ex.name].weight)){
      pb[ex.name]={weight:Number(ex.weight),date:w.date,reps:Number(ex.reps)||0};
    }
  }));
  const entries=Object.entries(pb).sort((a,b)=>b[1].weight-a[1].weight);
  $("#pbList").innerHTML=entries.length?entries.map(([name,v])=>`
    <div class="pb-row"><div><b>${escapeHtml(name)}</b><div class="muted small">${v.date}</div></div><b>${v.weight} kg × ${v.reps}</b></div>`).join(""):`<div class="empty">No strength PBs yet.</div>`;
}

$("#saveProfile").onclick=()=>{
  data.profile={name:$("#profileName").value.trim(),age:Number($("#profileAge").value)||32,height:Number($("#profileHeight").value)||185,sex:$("#profileSex").value};
  save(); alert("Profile saved.");
};

$("#themeBtn").onclick=()=>{data.theme=data.theme==="light"?"dark":"light";save();};

$("#exportData").onclick=()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url;a.download="nextform-backup.json";a.click();URL.revokeObjectURL(url);
};
$("#resetData").onclick=()=>{
  if(confirm("Delete all NextForm data from this device?")){ localStorage.removeItem(KEY); data=structuredClone(defaultData); save(); location.reload(); }
};

function go(target){
  $$(".screen").forEach(s=>s.classList.toggle("active",s.id===target));
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.target===target));
  const titles={home:"Dashboard",workout:"Workout",progressScreen:"Progress",profile:"Profile"};
  $("#screenTitle").textContent=titles[target]||"NextForm";
  if(target==="progressScreen") setTimeout(drawChart,50);
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav").forEach(n=>n.onclick=()=>go(n.dataset.target));
$$("[data-go]").forEach(n=>n.onclick=()=>go(n.dataset.go));
window.addEventListener("resize",()=>{ if($("#progressScreen").classList.contains("active")) drawChart(); });

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
renderAll();
