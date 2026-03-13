// ════════════════════════════ STATE ════════════════════════════
const G = {
  profile: JSON.parse(localStorage.getItem('vq_profile') || 'null'),
  picks: {},
  today: JSON.parse(localStorage.getItem('vq_' + new Date().toDateString()) || '{"water":0,"steps":0,"cals":0,"wo":0,"weight":null,"xp":0,"questsDone":[]}'),
  ingredients: [],
  xp: parseInt(localStorage.getItem('vq_xp') || '0'),
  streak: parseInt(localStorage.getItem('vq_streak') || '0'),
};
function saveToday() { localStorage.setItem('vq_' + new Date().toDateString(), JSON.stringify(G.today)); }
function saveXP() { localStorage.setItem('vq_xp', G.xp); }

const CLASSES = { lose_weight:'Flame Warrior', build_muscle:'Iron Guardian', get_fit:'Storm Runner', improve_health:'Life Sage', more_energy:'Solar Monk', stress_less:'Zen Archer' };
const ACT_MULT = { sedentary:1.2, light:1.375, moderate:1.55, very_active:1.725 };

function getLevel() { return Math.floor(G.xp / 100) + 1; }
function getXPInLevel() { return G.xp % 100; }

// ════════════════════════════ NAV ════════════════════════════
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  ['hq','plan','kitchen','sage','settings'].forEach(k => {
    if (k === id) {
      document.getElementById('ni-' + k)?.classList.add('active');
      document.getElementById('bni-' + k)?.classList.add('active');
    }
  });
  if (id === 'hq') refreshHQ();
  if (id === 'plan') renderPlan();
  if (id === 'settings') populateSettings();
}

// ════════════════════════════ QUIZ ════════════════════════════
let step = 0;
function pick(el, key, val) {
  el.closest('.choices').querySelectorAll('.choice').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel'); G.picks[key] = val;
}
function goStep(n) {
  document.getElementById('qs' + step).classList.remove('active');
  document.getElementById('ps' + step).classList.remove('active');
  document.getElementById('ps' + step).classList.add('done');
  step = n;
  document.getElementById('qs' + n).classList.add('active');
  document.getElementById('ps' + n).classList.add('active');
}
function createHero() {
  const name = document.getElementById('f-name').value.trim() || 'Hero';
  const age = +document.getElementById('f-age').value || 25;
  const weight = +document.getElementById('f-weight').value || 70;
  const height = +document.getElementById('f-height').value || 170;
  const target = +document.getElementById('f-target').value || weight;
  const gender = document.getElementById('f-gender').value || 'Female';
  const days = +document.getElementById('f-days').value || 4;
  const activity = G.picks.activity || 'moderate';
  const goal = G.picks.goal || 'get_fit';
  const diet = G.picks.diet || 'no_restriction';
  const bmr = gender === 'Male' ? 10*weight+6.25*height-5*age+5 : 10*weight+6.25*height-5*age-161;
  const calories = Math.round(bmr * ACT_MULT[activity]);
  const cTarget = goal === 'lose_weight' ? calories-500 : goal === 'build_muscle' ? calories+300 : calories;
  G.profile = { name, age, weight, height, target, gender, days, goal, activity, diet, calories: cTarget, protein: Math.round(weight*1.8), carbs: Math.round(cTarget*.45/4), fat: Math.round(cTarget*.25/9) };
  localStorage.setItem('vq_profile', JSON.stringify(G.profile));
  G.today.weight = weight; saveToday();
  showNav();
  updateNavBar();
  showToast('⚔️ Quest begins! Your journey starts now.');
  initPedometer();
  go('hq');
}

// ════════════════════════════ NAV BAR UPDATE ════════════════════════════
function showNav() {
  document.getElementById('top-nav').style.display = 'flex';
  document.getElementById('bottom-nav').classList.add('nav-ready');
}

function updateNavBar() {
  if (!G.profile) return;
  document.getElementById('nav-name').textContent = G.profile.name;
  const lv = getLevel(), xpIn = getXPInLevel();
  document.getElementById('nav-level').textContent = 'LV ' + lv;
  document.getElementById('nav-xp-fill').style.width = xpIn + '%';
  document.getElementById('nav-xp-text').textContent = xpIn + ' / 100 XP';
  document.getElementById('streak-count').textContent = G.streak;
  document.getElementById('plan-streak').textContent = G.streak;
}

// ════════════════════════════ DASHBOARD ════════════════════════════
function refreshHQ() {
  const p = G.profile; const t = G.today;
  if (!p) return;
  updateNavBar();
  // Hero panel
  document.getElementById('hq-name').textContent = p.name;
  document.getElementById('hq-class').textContent = CLASSES[p.goal] + ' · Level ' + getLevel();
  document.getElementById('hq-str').textContent = Math.round(p.protein);
  document.getElementById('hq-agi').textContent = p.days;
  document.getElementById('hq-vit').textContent = Math.round(p.calories / 10);
  document.getElementById('hq-lvl').textContent = getLevel();
  // Status bars
  const xpPct = getXPInLevel();
  const hpPct = Math.min(100, Math.max(0, 100 - ((t.cals / p.calories - 1) * 50)));
  const stepGoal = p.goal === 'lose_weight' ? 12000 : p.goal === 'improve_health' ? 8000 : 10000;
  const calBurned = estimateCalBurned(t.steps, p);
  const calBurnGoal = p.goal === 'lose_weight' ? 500 : p.goal === 'build_muscle' ? 300 : 400;

  setBar('xp-bar', xpPct); document.getElementById('xp-val').textContent = getXPInLevel() + '/100';
  setBar('agi-bar', Math.min(t.steps/stepGoal*100,100));
  document.getElementById('agi-val').textContent = t.steps.toLocaleString() + ' / ' + stepGoal.toLocaleString();
  setBar('cals-bar', Math.min(t.cals/p.calories*100,100));
  document.getElementById('cals-bar-val').textContent = t.cals + ' / ' + p.calories + ' kcal';
  // Stat tiles
  document.getElementById('st-steps').textContent = t.steps.toLocaleString();
  document.getElementById('st-steps-unit').textContent = G.sensorActive ? '📡 live sensor' : 'tap to add manually';
  document.getElementById('st-cals-burned').textContent = calBurned;
  document.getElementById('st-cals').textContent = t.cals;
  document.getElementById('st-wo').textContent = t.wo;
  document.getElementById('st-wo-label').textContent = 'of ' + p.days + ' goal';
  setBar('stb-steps', Math.min(t.steps/stepGoal*100,100));
  setBar('stb-cals-burned', Math.min(calBurned/calBurnGoal*100,100));
  setBar('stb-cals', Math.min(t.cals/p.calories*100,100));
  setBar('stb-wo', Math.min(t.wo/p.days*100,100));
  // Daily quests
  const quests = getDailyQuests(p);
  document.getElementById('daily-quests').innerHTML = quests.map(q => {
    const done = t.questsDone.includes(q.id);
    const prog = Math.min(q.progress(), 100);
    return `<div class="quest-card ${done?'completed':''}" onclick="completeQuest('${q.id}',${q.xpVal})">
      <div class="quest-top"><div class="quest-icon">${q.icon}</div><div class="quest-xp">+${q.xpVal} XP</div></div>
      <div class="quest-name">${q.name}</div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-prog"><div class="quest-prog-fill" style="width:${prog}%"></div></div>
      ${done ? '<div class="quest-check">✅</div>' : ''}
    </div>`;
  }).join('');
  // Workouts
  const ws = getWorkouts(p.goal);
  document.getElementById('hq-workouts').innerHTML = ws.map(w => `
    <div class="workout-entry">
      <div class="we-icon" style="background:${w.bg}">${w.icon}</div>
      <div style="flex:1"><div class="we-name">${w.name}</div><div class="we-meta">${w.dur} · ${w.sets}</div></div>
      <div class="we-reward">${w.xp} XP</div>
    </div>`).join('');
  // Achievements
  renderAchievements();
}

function setBar(id, pct) { const el = document.getElementById(id); if(el) el.style.width = Math.max(0,Math.min(100,pct)) + '%'; }

function getDailyQuests(p) {
  const t = G.today;
  const stepGoal = p.goal === 'lose_weight' ? 12000 : p.goal === 'improve_health' ? 8000 : 10000;
  const calBurned = estimateCalBurned(t.steps, p);
  const calBurnGoal = p.goal === 'lose_weight' ? 500 : p.goal === 'build_muscle' ? 300 : 400;
  return [
    {
      id:'steps', icon:'👟', name:`${stepGoal.toLocaleString()} Steps`,
      desc: G.sensorActive ? '📡 Live from your device pedometer' : 'Tracked via device sensor · grant motion access',
      xpVal:25, progress:() => t.steps / stepGoal * 100
    },
    {
      id:'cals_burned', icon:'🔥', name:`Burn ${calBurnGoal} kcal`,
      desc:`Estimated from your steps · ${calBurned} kcal burned so far`,
      xpVal:20, progress:() => calBurned / calBurnGoal * 100
    },
    {
      id:'calories', icon:'🍽️', name:'Hit Calorie Target',
      desc:`Log meals to reach ${p.calories} kcal · ${t.cals} logged so far`,
      xpVal:20, progress:() => t.cals / p.calories * 100
    },
    {
      id:'workout', icon:'⚔️', name:'Complete Training',
      desc:"Finish today's workout session", xpVal:35,
      progress:() => t.wo > 0 ? 100 : 0
    },
  ];
}

function estimateCalBurned(steps, p) {
  // MET-based estimate: walking ~0.04 kcal/step adjusted for weight
  const weight = p?.weight || 70;
  return Math.round(steps * 0.04 * (weight / 70));
}

function completeQuest(id, xpVal) {
  if (G.today.questsDone.includes(id)) return;
  G.today.questsDone.push(id);
  G.xp += xpVal; saveXP(); saveToday();
  showToast(`✅ Quest done! +${xpVal} XP`);
  updateNavBar(); refreshHQ();
}

function tapStat(el, type) {
  if (type === 'wo') { G.today.wo += 1; G.xp += 10; showToast('⚔️ Workout logged! +10 XP'); }
  if (type === 'cals') { openModal(); return; }
  if (el) { el.classList.add('tap-glow'); setTimeout(() => el.classList.remove('tap-glow'), 400); }
  saveToday(); saveXP(); updateNavBar(); refreshHQ();
}

function logFood() {
  const inp = document.getElementById('food-input');
  const v = inp.value.trim(); if (!v) return;
  const est = Math.round(Math.random()*280+120);
  G.today.cals += est; G.xp += 5; saveToday(); saveXP();
  const el = document.getElementById('food-log');
  el.innerHTML = `<div class="food-logged">${v} — <span>~${est} kcal · +5 XP</span></div>` + el.innerHTML;
  inp.value = ''; updateNavBar(); refreshHQ();
}

function openModal() { document.getElementById('modal-bg').classList.add('open'); }
function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }
function saveModal() {
  const w = parseFloat(document.getElementById('m-weight').value);
  if (w) G.today.weight = w;
  G.today.cals += +document.getElementById('m-cals').value || 0;
  G.xp += 10; saveToday(); saveXP(); closeModal();
  showToast('📊 Stats logged! +10 XP'); updateNavBar(); refreshHQ();
}

function getWorkouts(goal) {
  const m = { lose_weight:[{icon:'🔥',name:'HIIT Circuit',dur:'30 min',sets:'5 rounds',xp:'+35',bg:'#fb923c18'},{icon:'🏃',name:'Jump Rope',dur:'15 min',sets:'10×1 min',xp:'+20',bg:'#fb923c10'},{icon:'🧘',name:'Core & Stretch',dur:'15 min',sets:'Flow',xp:'+10',bg:'#4ade8010'}], build_muscle:[{icon:'💪',name:'Bench Press',dur:'40 min',sets:'4×8-10',xp:'+35',bg:'#60a5fa18'},{icon:'🏋️',name:'Barbell Rows',dur:'30 min',sets:'4×8',xp:'+30',bg:'#60a5fa10'},{icon:'🦵',name:'Squats',dur:'35 min',sets:'4×10',xp:'+35',bg:'#a78bfa10'}], get_fit:[{icon:'⚡',name:'Full Body Circuit',dur:'35 min',sets:'3 rounds',xp:'+35',bg:'#f5c84218'},{icon:'🤸',name:'Mobility Flow',dur:'20 min',sets:'Sequence',xp:'+15',bg:'#4ade8010'}], improve_health:[{icon:'🚶',name:'Brisk Walk',dur:'30 min',sets:'Steady',xp:'+20',bg:'#4ade8018'},{icon:'🧘',name:'Yoga Flow',dur:'25 min',sets:'3 seq.',xp:'+20',bg:'#a78bfa10'}] };
  return m[goal] || m.get_fit;
}

function renderAchievements() {
  const all = [
    {icon:'🏃',name:'First Steps',color:'var(--xp)',earned: G.today.steps > 0},
    {icon:'👟',name:'5K Walker',color:'var(--mana)',earned: G.today.steps >= 5000},
    {icon:'🔥',name:'On Fire',color:'var(--orange)',earned: G.streak >= 3},
    {icon:'⚔️',name:'Warrior',color:'var(--gold)',earned: G.today.wo >= 1},
    {icon:'🧙',name:'Level 5',color:'var(--purple)',earned: getLevel() >= 5},
    {icon:'🏆',name:'Legend',color:'var(--gold)',earned: getLevel() >= 10},
  ];
  document.getElementById('achievements-row').innerHTML = all.map(a => `
    <div class="achievement">
      <div class="ach-icon ${a.earned?'earned':'locked'}" style="border-color:${a.color};color:${a.color}">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
    </div>`).join('');
}

// ════════════════════════════ PLAN ════════════════════════════
function renderPlan() {
  const p = G.profile; if (!p) return;
  loadSavedNutritionPlan();
  loadRestDay();
  cycleHydrationTip();
  document.getElementById('plan-streak').textContent = G.streak;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const todayI = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const types = { lose_weight:['HIIT','Rest','Cardio','Strength','HIIT','Walk','Rest'], build_muscle:['Chest','Back','Rest','Legs','Shoulder','Arms','Rest'], get_fit:['Full','Cardio','Rest','Strength','HIIT','Flex','Rest'], improve_health:['Walk','Yoga','Strength','Walk','Rest','Cardio','Yoga'] };
  const colors = { HIIT:'rchip-cal',Cardio:'rchip-cal',Strength:'rchip-pro',Rest:'rchip-time',Walk:'rchip-pro',Yoga:'rchip-pro',Full:'rchip-time',Chest:'rchip-time',Back:'rchip-time',Legs:'rchip-cal',Shoulder:'rchip-time',Arms:'rchip-cal',Flex:'rchip-pro' };
  const ts = types[p.goal] || types.get_fit;
  document.getElementById('plan-week').innerHTML = days.map((d,i) => `
    <div class="plan-day ${i===todayI?'today':''} ${G.today.wo>0&&i===todayI?'done':''}">
      <div class="pd-name">${d}</div>
      <div class="pd-num">${i+1}</div>
      <div class="pd-badge ${colors[ts[i]]||''}">${ts[i]}</div>
    </div>`).join('');

  const exs = getExercises(p.goal);
  document.getElementById('plan-exercises').innerHTML = exs.map((e,i) => `
    <div class="exercise-row" id="ex-${i}" onclick="doneExercise(${i},${e.xp})">
      <div class="ex-num-badge">${i+1}</div>
      <div class="ex-info"><div class="ex-name-g">${e.name}</div><div class="ex-meta-g">${e.sets} · ${e.rest}</div></div>
      <div class="ex-xp-badge">+${e.xp}XP</div>
      <button class="complete-btn">Done</button>
    </div>`).join('');

}

function doneExercise(i, xpVal) {
  const el = document.getElementById('ex-' + i);
  if (el.classList.contains('done-ex')) return;
  el.classList.add('done-ex');
  G.xp += xpVal; saveXP(); updateNavBar();
  showToast(`💪 Exercise done! +${xpVal} XP`);
}

function getExercises(goal) {
  const m = { lose_weight:[{name:'Jumping Jacks',sets:'3×30',rest:'30s',xp:8},{name:'Burpees',sets:'3×12',rest:'45s',xp:12},{name:'Mountain Climbers',sets:'3×20',rest:'30s',xp:10},{name:'High Knees',sets:'3×30',rest:'30s',xp:8},{name:'Plank',sets:'3×45s',rest:'30s',xp:7}], build_muscle:[{name:'Bench Press',sets:'4×8-10',rest:'90s',xp:14},{name:'Incline DB Press',sets:'3×10',rest:'75s',xp:12},{name:'Cable Flyes',sets:'3×12',rest:'60s',xp:10},{name:'Tricep Dips',sets:'3×12',rest:'60s',xp:10},{name:'Push-ups',sets:'3×15',rest:'45s',xp:8}], get_fit:[{name:'Bodyweight Squats',sets:'3×15',rest:'45s',xp:10},{name:'Push-ups',sets:'3×12',rest:'45s',xp:10},{name:'Reverse Lunges',sets:'3×12 ea',rest:'45s',xp:10},{name:'DB Rows',sets:'3×12 ea',rest:'45s',xp:10},{name:'Plank',sets:'3×30s',rest:'30s',xp:7}], improve_health:[{name:'Brisk Walk',sets:'30 min',rest:'—',xp:20},{name:'Squats',sets:'2×10',rest:'60s',xp:10},{name:'Band Rows',sets:'2×12',rest:'60s',xp:10},{name:'Sun Salutation',sets:'5 rounds',rest:'—',xp:15}] };
  return m[goal] || m.get_fit;
}



// ════════════════════════════ COACH ════════════════════════════
async function sendCoach() {
  const inp = document.getElementById('coach-input');
  const txt = inp.value.trim(); if (!txt) return;
  inp.value = ''; askCoach(txt);
}
async function askCoach(txt) {
  const msgs = document.getElementById('coach-msgs');
  msgs.innerHTML += `<div class="coach-bubble user">${txt}</div>`;
  msgs.innerHTML += `<div class="coach-bubble bot loading-row" id="coach-thinking"><div class="spin"></div> Consulting the scrolls…</div>`;
  msgs.scrollTop = msgs.scrollHeight;
  const p = G.profile;
  const sys = `You are a Sage Advisor inside a wellness RPG app called FitnessGo. Be encouraging, concise (max 90 words), and use 1-2 light RPG metaphors when fitting (e.g. "level up your recovery", "equip more protein"). ${p ? `Hero profile: ${p.name}, class: ${CLASSES[p.goal]||p.goal}, weight: ${p.weight}kg, target: ${p.target}kg, diet: ${p.diet}, calories: ${p.calories}/day.` : ''} Write naturally like a coach, not a robot. No bullet points.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system: sys, messages:[{role:'user',content:txt}] }) });
    const d = await r.json();
    document.getElementById('coach-thinking').outerHTML = `<div class="coach-bubble bot">${d.content?.[0]?.text || 'The Sage is unavailable. Try again shortly.'}</div>`;
  } catch { document.getElementById('coach-thinking').outerHTML = `<div class="coach-bubble bot">Connection to the sage realm failed. Try again.</div>`; }
  msgs.scrollTop = msgs.scrollHeight;
}

// ════════════════════════════ KITCHEN ════════════════════════════
function onDragOver(e) { e.preventDefault(); document.getElementById('scan-zone').classList.add('dragover'); }
function onDragLeave() { document.getElementById('scan-zone').classList.remove('dragover'); }
function onDrop(e) { e.preventDefault(); document.getElementById('scan-zone').classList.remove('dragover'); processFile(e.dataTransfer.files[0]); }
function onFileChange(e) { processFile(e.target.files[0]); }

async function processFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const src = e.target.result;
    document.getElementById('scan-preview').src = src;
    document.getElementById('scan-preview').style.display = 'block';
    document.getElementById('scan-content').style.display = 'none';
    document.getElementById('ing-wrap').style.display = 'block';
    document.getElementById('ing-count').innerHTML = '<div class="spin" style="width:12px;height:12px;border-width:2px;display:inline-block"></div>';
    document.getElementById('ing-chips').innerHTML = '<div class="loading-row"><div class="spin"></div>Scanning ingredients…</div>';
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:file.type,data:src.split(',')[1]}},{type:'text',text:'List all visible food ingredients in this image. Return ONLY a JSON array of strings, no markdown. Example: ["eggs","tomatoes","chicken"]. Be specific and complete.'}]}] }) });
      const d = await r.json();
      G.ingredients = JSON.parse(d.content?.[0]?.text?.replace(/```json|```/g,'').trim() || '[]');
    } catch { G.ingredients = ['eggs','tomatoes','onion','garlic','olive oil','chicken']; }
    renderIngChips();
    document.getElementById('ing-count').textContent = `· ${G.ingredients.length} found`;
  };
  reader.readAsDataURL(file);
}

function renderIngChips() {
  document.getElementById('ing-chips').innerHTML = G.ingredients.map((v,i) => `
    <span class="ing-chip found">${v} <span class="ing-x" onclick="G.ingredients.splice(${i},1);renderIngChips()">×</span></span>`).join('');
}
function addIng() {
  const inp = document.getElementById('ing-add');
  const v = inp.value.trim(); if (!v) return;
  G.ingredients.push(v); renderIngChips(); inp.value = '';
}

async function cookSuggest() {
  if (!G.ingredients.length) return;
  const p = G.profile;
  document.getElementById('recipes').innerHTML = '<div class="loading-row"><div class="spin"></div>Crafting recipes…</div>';
  document.getElementById('shop-list').innerHTML = '<div class="loading-row"><div class="spin"></div>Building supply run…</div>';
  const prompt = `Ingredients: ${G.ingredients.join(', ')}. Diet: ${p?.diet||'none'}. Goal: ${p?.goal||'healthy'}. Calorie target: ${p?.calories||2000}/day. Suggest 3 meals I can make and 5 ingredients to buy next time. Return ONLY JSON (no markdown): {"meals":[{"name":"","description":"","time":"","calories":0,"protein":0,"instructions":""}],"shopping":["item"]}`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] }) });
    const d = await r.json();
    const res = JSON.parse(d.content?.[0]?.text?.replace(/```json|```/g,'').trim() || '{}');
    renderRecipes(res.meals || []); renderShop(res.shopping || []);
  } catch {
    renderRecipes([{name:'Egg & Tomato Scramble',description:'Quick protein breakfast',time:'10 min',calories:320,protein:24,instructions:'Whisk eggs and cook with diced tomatoes in olive oil. Season generously.'},{name:'Garlic Chicken Stir Fry',description:'High-protein lunch',time:'20 min',calories:480,protein:42,instructions:'Sauté chicken until golden, add garlic and vegetables, cook through.'},{name:'Simple Fried Rice',description:'Filling dinner bowl',time:'15 min',calories:420,protein:20,instructions:'Fry cooked rice with eggs, onion and garlic. Season with salt and pepper.'}]);
    renderShop(['Brown rice','Broccoli','Greek yogurt','Oats','Bell peppers']);
  }
  G.xp += 15; saveXP(); updateNavBar(); showToast('⚗️ Recipes unlocked! +15 XP');
}

function renderRecipes(meals) {
  document.getElementById('recipes').innerHTML = meals.map(m => `
    <div class="recipe-card">
      <div class="recipe-name">${m.name}</div>
      <div class="recipe-desc">${m.description}</div>
      <div class="recipe-steps">${m.instructions}</div>
      <div class="recipe-chips">
        <span class="rchip rchip-cal">🔥 ${m.calories} kcal</span>
        <span class="rchip rchip-time">⏱ ${m.time}</span>
        <span class="rchip rchip-pro">💪 ${m.protein}g protein</span>
      </div>
    </div>`).join('');
}
function renderShop(items) {
  document.getElementById('shop-list').innerHTML = items.map(item => `
    <div class="shop-entry">
      <div class="shop-box" onclick="this.classList.toggle('ticked');this.textContent=this.classList.contains('ticked')?'✓':''"></div>
      ${item}
    </div>`).join('');
}



// ════════════════════════════ REST DAY / BUSY MODE ════════════════════════════
const REST_REASONS = {
  business_trip: 'On a business trip today — micro-habits unlocked.',
  event:         'Big day out! Keeping it light with micro-habits.',
  too_busy:      'Busy day — small habits still count.',
  tired:         'Rest and recover — your body needs it too.',
  sick:          'Not feeling well — focus on rest and fluids.',
  rest_day:      'Scheduled rest day — muscles are rebuilding.'
};

const MICRO_HABITS = {
  business_trip: [
    {icon:'🚶',text:'Take the stairs at your hotel or office',xp:5},
    {icon:'💧',text:'Drink 2 glasses of water before lunch',xp:3},
    {icon:'📱',text:'Do 3 mins of deep breathing between meetings',xp:5},
    {icon:'🧘',text:'10 desk stretches — neck, shoulders, hips',xp:5},
    {icon:'🥗',text:'Choose a salad or protein option at meals',xp:5},
  ],
  event: [
    {icon:'💃',text:'Dance or stay active at the event',xp:8},
    {icon:'🥤',text:'Alternate every alcoholic drink with water',xp:5},
    {icon:'🚶',text:'Walk to/from the venue if possible',xp:8},
    {icon:'🥗',text:'Eat a protein-rich meal before you go',xp:5},
  ],
  too_busy: [
    {icon:'⏱️',text:'Do a 5-minute bodyweight circuit between tasks',xp:8},
    {icon:'🚶',text:'Walk during your lunch break (even 10 mins)',xp:5},
    {icon:'📵',text:'Step away from screens for 5 mins every hour',xp:3},
    {icon:'💧',text:'Keep a water bottle on your desk all day',xp:3},
    {icon:'🧘',text:'2 minutes of box breathing before bed',xp:5},
  ],
  tired: [
    {icon:'😴',text:'Sleep 7–9 hours tonight — prioritise this',xp:10},
    {icon:'🧘',text:'10 mins of light stretching or yoga',xp:5},
    {icon:'💧',text:'Stay hydrated — fatigue often means dehydration',xp:3},
    {icon:'🥗',text:'Eat a light, nutritious meal — avoid heavy carbs',xp:5},
  ],
  sick: [
    {icon:'💊',text:'Take any medication you need',xp:5},
    {icon:'💧',text:'Drink water or electrolytes every hour',xp:5},
    {icon:'😴',text:'Rest as much as possible today',xp:5},
    {icon:'🍲',text:'Eat warm, easy-to-digest foods',xp:3},
  ],
  rest_day: [
    {icon:'🧘',text:'Light stretching or foam rolling — 10 mins',xp:8},
    {icon:'🚶',text:'Easy 20-minute walk — no pressure',xp:8},
    {icon:'💧',text:'Hydrate well to support muscle recovery',xp:3},
    {icon:'😴',text:'Prioritise 7–9 hours of sleep tonight',xp:5},
    {icon:'📖',text:'Read something positive or do a mindful activity',xp:3},
  ]
};

const HYDRATION_TIPS = [
  'Drink a glass of water before each meal — it helps with portion control and keeps energy stable.',
  'Start your morning with 500ml of water before coffee — it wakes up your metabolism.',
  'Thirst is a late signal — sip water throughout the day, don\'t wait until you\'re thirsty.',
  'Adding a slice of lemon or cucumber makes water more appealing and easier to drink more of.',
  'Your urine should be pale yellow — that\'s the easiest hydration check you can do.',
  'Coffee and tea count toward your fluid intake, but water is still best for long workouts.',
  'Eating water-rich foods (cucumber, watermelon, celery) also contributes to daily hydration.',
];

function showCantDoModal() {
  document.getElementById('cant-do-bg').style.display = 'flex';
}
function closeCantDoModal() {
  document.getElementById('cant-do-bg').style.display = 'none';
}

function activateRestDay(reason) {
  closeCantDoModal();
  localStorage.setItem('vq_rest_day', JSON.stringify({reason, date: new Date().toDateString()}));
  applyRestDay(reason);
  showToast('😮‍💨 Rest day activated — micro-habits unlocked! +5 XP');
  G.xp += 5; saveXP(); updateNavBar();
}

function applyRestDay(reason) {
  document.getElementById('rest-day-banner').style.display = 'block';
  document.getElementById('rest-day-reason').textContent = REST_REASONS[reason] || 'Taking it easy today.';
  document.getElementById('plan-exercises').style.display = 'none';
  document.getElementById('micro-habits').style.display = 'block';
  document.getElementById('cant-do-btn').style.display = 'none';
  const habits = MICRO_HABITS[reason] || MICRO_HABITS.rest_day;
  document.getElementById('micro-habit-list').innerHTML = habits.map((h,i) => `
    <div class="micro-habit-item" id="mh-${i}" onclick="doneMicroHabit(${i}, ${h.xp})">
      <div class="mh-icon">${h.icon}</div>
      <div class="mh-text">${h.text}</div>
      <div class="mh-xp">+${h.xp}XP</div>
    </div>`).join('');
}

function cancelRestDay() {
  localStorage.removeItem('vq_rest_day');
  document.getElementById('rest-day-banner').style.display = 'none';
  document.getElementById('plan-exercises').style.display = 'block';
  document.getElementById('micro-habits').style.display = 'none';
  document.getElementById('cant-do-btn').style.display = 'block';
}

function doneMicroHabit(i, xpVal) {
  const el = document.getElementById('mh-' + i);
  if (el.classList.contains('done-habit')) return;
  el.classList.add('done-habit');
  G.xp += xpVal; saveXP(); updateNavBar();
  showToast(`✅ Habit done! +${xpVal} XP`);
}

function loadRestDay() {
  const saved = JSON.parse(localStorage.getItem('vq_rest_day') || 'null');
  if (saved && saved.date === new Date().toDateString()) {
    applyRestDay(saved.reason);
  }
}

function cycleHydrationTip() {
  const el = document.getElementById('hydration-tip-text');
  if (!el) return;
  const tip = HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)];
  el.textContent = tip;
}

// ════════════════════════════ NUTRITION PLAN ════════════════════════════
async function generateNutritionPlan() {
  const input = document.getElementById('nu-food-input');
  const foods = input.value.trim();
  if (!foods) { showToast('⚠️ Tell us what food you have first!'); return; }
  const btn = document.getElementById('nu-btn-text');
  btn.innerHTML = '<div class="spin" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></div>Crafting your meal plan…';
  document.querySelector('.nu-submit-btn').disabled = true;
  const p = G.profile;
  const prompt = `Hero profile: goal=${p?.goal||'get_fit'}, diet=${p?.diet||'none'}, calories_target=${p?.calories||2000}/day.
Available food: ${foods}.
Create 4 meal quests (breakfast, lunch, snack, dinner) using ONLY the available food listed. Each meal should be realistic and achievable with those ingredients.
Return ONLY this JSON (no markdown):
{"meals":[{"time":"07:00","label":"Breakfast","name":"","description":"","calories":0,"protein":0,"tip":""}]}`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] })
    });
    const d = await r.json();
    const res = JSON.parse(d.content?.[0]?.text?.replace(/```json|```/g,'').trim() || '{}');
    renderNutritionPlan(res.meals || [], foods);
  } catch {
    renderNutritionPlan([
      {time:'07:00',label:'Breakfast',name:'Available Ingredients Breakfast',description:'Make the most of what you have',calories:350,protein:20,tip:'Eat within 1 hour of waking'},
      {time:'12:00',label:'Lunch',name:'Midday Fuel Plate',description:'Balance your macros at lunch',calories:500,protein:35,tip:'Biggest meal of the day'},
      {time:'15:00',label:'Snack',name:'Energy Boost Snack',description:'Keep hunger at bay',calories:200,protein:10,tip:'Pairs well with water'},
      {time:'19:00',label:'Dinner',name:'Recovery Dinner',description:'Refuel after training',calories:500,protein:40,tip:'Eat 2-3 hrs before sleep'},
    ], foods);
  }
  G.xp += 20; saveXP(); updateNavBar(); showToast('🥗 Nutrition plan unlocked! +20 XP');
}

function renderNutritionPlan(meals, foods) {
  localStorage.setItem('vq_meal_plan', JSON.stringify({meals, foods, date: new Date().toDateString()}));
  document.querySelector('.nutrition-unlock-state').style.display = 'none';
  const content = document.getElementById('plan-meals-content');
  content.style.display = 'block';
  content.innerHTML = meals.map(m => `
    <div class="meal-quest-row">
      <div class="mq-time">${m.time}<br><span style="font-size:0.58rem;color:var(--muted);font-family:'Inter',sans-serif">${m.label}</span></div>
      <div style="flex:1">
        <div class="mq-name">${m.name}</div>
        <div class="mq-macros">${m.calories} kcal · ${m.protein}g protein</div>
        ${m.tip ? `<div style="font-size:0.7rem;color:var(--gold);margin-top:3px;font-style:italic">💡 ${m.tip}</div>` : ''}
      </div>
    </div>`).join('');
  document.getElementById('plan-meals-reset').style.display = 'block';
  document.getElementById('plan-meals').style.display = 'none';
}

function resetNutritionPlan() {
  localStorage.removeItem('vq_meal_plan');
  document.querySelector('.nutrition-unlock-state').style.display = 'block';
  document.getElementById('plan-meals-content').style.display = 'none';
  document.getElementById('plan-meals-reset').style.display = 'none';
  document.getElementById('plan-meals').style.display = 'block';
  document.getElementById('nu-food-input').value = '';
  document.getElementById('nu-btn-text').textContent = '⚗️ Generate My Meal Plan';
  document.querySelector('.nu-submit-btn').disabled = false;
}

function loadSavedNutritionPlan() {
  const saved = JSON.parse(localStorage.getItem('vq_meal_plan') || 'null');
  if (saved && saved.date === new Date().toDateString()) {
    renderNutritionPlan(saved.meals, saved.foods);
  }
}


// ════════════════════════════ PEDOMETER / SENSOR ════════════════════════════
G.sensorActive = false;
G.stepAccumulator = 0;
G.lastAcc = null;
G.stepThreshold = 12; // acceleration delta to count a step

function initPedometer() {
  // Try DeviceMotionEvent (works on iOS 13+ with permission, Android Chrome)
  if (typeof DeviceMotionEvent !== 'undefined') {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ needs explicit permission
      DeviceMotionEvent.requestPermission()
        .then(state => {
          if (state === 'granted') startMotionListener();
          else setSensorNote('Motion access denied. <button onclick="initPedometer()" style="color:var(--gold);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:700">Tap to retry</button>');
        })
        .catch(() => setSensorNote('Motion sensor unavailable on this device.'));
    } else {
      // Android / desktop — no permission needed
      startMotionListener();
    }
  } else {
    setSensorNote('Motion sensor not available. You can still log workouts manually.');
  }
}

function startMotionListener() {
  G.sensorActive = true;
  setSensorNote('✅ Live step tracking active');
  document.getElementById('st-steps-unit').textContent = '📡 live sensor';
  window.addEventListener('devicemotion', handleMotion, { passive: true });
}

function handleMotion(e) {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;
  const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
  if (G.lastAcc !== null) {
    const delta = Math.abs(mag - G.lastAcc);
    G.stepAccumulator += delta;
    if (G.stepAccumulator >= G.stepThreshold) {
      G.today.steps += 1;
      G.stepAccumulator = 0;
      // Batch save every 10 steps to avoid excessive writes
      if (G.today.steps % 10 === 0) {
        saveToday();
        refreshHQ();
      }
    }
  }
  G.lastAcc = mag;
}

function setSensorNote(html) {
  const el = document.getElementById('sensor-status-note');
  if (el) el.innerHTML = html;
}

// Tile click for steps — request sensor or show manual fallback
document.addEventListener('DOMContentLoaded', () => {
  const tile = document.getElementById('tile-steps');
  if (tile) {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', () => {
      if (!G.sensorActive) {
        initPedometer();
      } else {
        showToast('📡 Steps are tracked automatically!');
      }
    });
  }
});

// ════════════════════════════ TOAST ════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ════════════════════════════ SETTINGS ════════════════════════════
function populateSettings() {
  const p = G.profile; if (!p) return;
  document.getElementById('s-name').value = p.name || '';
  document.getElementById('s-age').value = p.age || '';
  document.getElementById('s-height').value = p.height || '';
  document.getElementById('s-weight').value = p.weight || '';
  document.getElementById('s-target').value = p.target || '';
  document.getElementById('s-gender').value = p.gender || '';
  document.getElementById('s-goal').value = p.goal || 'get_fit';
  document.getElementById('s-days').value = p.days || 4;
  document.getElementById('s-activity').value = p.activity || 'moderate';
  document.getElementById('s-diet').value = p.diet || 'no_restriction';
}

function saveSettings() {
  const p = G.profile; if (!p) return;
  p.name = document.getElementById('s-name').value.trim() || p.name;
  p.age = +document.getElementById('s-age').value || p.age;
  p.height = +document.getElementById('s-height').value || p.height;
  p.weight = +document.getElementById('s-weight').value || p.weight;
  p.target = +document.getElementById('s-target').value || p.target;
  p.gender = document.getElementById('s-gender').value || p.gender;
  p.goal = document.getElementById('s-goal').value;
  p.days = +document.getElementById('s-days').value || p.days;
  p.activity = document.getElementById('s-activity').value;
  p.diet = document.getElementById('s-diet').value;
  // Recalculate calories
  const bmr = p.gender === 'Male' ? 10*p.weight+6.25*p.height-5*p.age+5 : 10*p.weight+6.25*p.height-5*p.age-161;
  const tdee = Math.round(bmr * (ACT_MULT[p.activity] || 1.375));
  p.calories = p.goal === 'lose_weight' ? tdee-500 : p.goal === 'build_muscle' ? tdee+300 : tdee;
  p.protein = Math.round(p.weight * 1.8);
  p.carbs = Math.round(p.calories * .45 / 4);
  p.fat = Math.round(p.calories * .25 / 9);
  localStorage.setItem('vq_profile', JSON.stringify(p));
  updateNavBar();
  showToast('✅ Settings saved!');
}

function resetHero() {
  if (!confirm('Reset your hero? All XP and progress will be lost.')) return;
  localStorage.clear();
  location.reload();
}

// ════════════════════════════ INIT ════════════════════════════
if (G.profile) {
  showNav();
  updateNavBar();
  initPedometer();
  go('hq');
}
