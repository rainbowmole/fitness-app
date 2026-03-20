// ════════════════════════════ STATE ════════════════════════════
const G = {
  profile: JSON.parse(localStorage.getItem('vq_profile') || 'null'),
  picks: {},
  today: JSON.parse(localStorage.getItem('vq_' + new Date().toDateString()) || '{"water":0,"steps":0,"cals":0,"wo":0,"weight":null,"xp":0,"questsDone":[]}'),
  ingredients: [],
  exerciseHistory: JSON.parse(localStorage.getItem('vq_ex_history') || '[]'),
  xp: parseInt(localStorage.getItem('vq_xp') || '0'),
  streak: parseInt(localStorage.getItem('vq_streak') || '0'),
  blockMode: 'free',
  scheduleBlocks: JSON.parse(localStorage.getItem('vq_schedule') || 'null'),
  scheduleEntries: JSON.parse(localStorage.getItem('vq_schedule_entries') || '[]'),
  scheduleMeta: JSON.parse(localStorage.getItem('vq_schedule_meta') || 'null'),
  plannerDates: JSON.parse(localStorage.getItem('vq_planner_dates') || '[]'),
  selectedGym: JSON.parse(localStorage.getItem('vq_gym') || 'null'),
  plannerFrequencyOverride: null,  // Temporary frequency adjustment for current plan preview
};
function saveToday() { localStorage.setItem('vq_' + new Date().toDateString(), JSON.stringify(G.today)); }
function saveXP() { localStorage.setItem('vq_xp', G.xp); }
function savePlannerDates() { localStorage.setItem('vq_planner_dates', JSON.stringify(G.plannerDates || [])); }
function saveScheduleEntries() { localStorage.setItem('vq_schedule_entries', JSON.stringify(G.scheduleEntries || [])); }
function saveExerciseHistory() {
  G.exerciseHistory = G.exerciseHistory.slice(-200);
  localStorage.setItem('vq_ex_history', JSON.stringify(G.exerciseHistory));
}

const CLASSES = { lose_weight:'Flame Warrior', build_muscle:'Iron Guardian', get_fit:'Storm Runner', improve_health:'Life Sage', more_energy:'Solar Monk', stress_less:'Zen Archer' };
const ACT_MULT = { sedentary:1.2, light:1.375, moderate:1.55, very_active:1.725 };
const EQUIP_LABELS = {
  full_gym:     { label:'Full Gym',       icon:'🏋️', cls:'gym' },
  minimal_gym:  { label:'Minimal Gym',    icon:'🪁', cls:'minimal' },
  home_equipped:{ label:'Home (Equipped)',icon:'🏠', cls:'home' },
  calisthenics: { label:'Calisthenics',   icon:'🤸', cls:'calisthenics' },
  outdoor:      { label:'Outdoor',        icon:'🌳', cls:'outdoor' },
};
const HERO_ICONS = {
  lose_weight: '🔥',
  build_muscle: '💪',
  get_fit: '⚡',
  improve_health: '❤️',
  more_energy: '☀️',
  stress_less: '🧘',
};
const BODY_TYPE_LABELS = {
  skinny: 'Skinny',
  skinny_fat: 'Skinny Fat',
  average: 'Average',
  athletic: 'Athletic',
  overweight: 'Fat / Overweight',
};
const PHYSIQUE_PHASES = {
  cutting: { label: 'Cutting', calorieDelta: -450, proteinMultiplier: 2.15, carbRatio: 0.34, fatRatio: 0.28 },
  lean_bulk: { label: 'Lean Bulk', calorieDelta: 220, proteinMultiplier: 1.95, carbRatio: 0.44, fatRatio: 0.24 },
  bulking: { label: 'Bulk', calorieDelta: 380, proteinMultiplier: 1.85, carbRatio: 0.48, fatRatio: 0.22 },
  recomp: { label: 'Recomp / Maintain', calorieDelta: 0, proteinMultiplier: 2.05, carbRatio: 0.4, fatRatio: 0.25 },
};
const CALISTHENICS_LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const TRAINING_WINDOW_LABELS = {
  early: 'Early Bird',
  midday: 'Midday',
  evening: 'Evening',
  night: 'Night',
  flexible: 'Flexible',
};
const TRAINING_WINDOW_RANGES = {
  early: [5, 10],
  midday: [11, 15],
  evening: [17, 21],
  night: [20, 24],
  flexible: [0, 24],
};
const EVIDENCE_SOURCES = [
  'ACSM adult exercise guidelines',
  'WHO physical activity guidance',
  'NSCA strength training principles',
];
const CREATOR_REFERENCE_LIBRARY = [
  {
    name: 'Jeff Nippard',
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=Jeff%20Nippard',
    creds: 'Evidence-based hypertrophy educator',
    goals: ['build_muscle', 'get_fit', 'improve_health'],
    bodyTypes: ['skinny', 'average', 'athletic', 'skinny_fat'],
    heightBandCm: [155, 195],
    focus: 'Hypertrophy form cues and progression.',
  },
  {
    name: 'Squat University (Dr. Aaron Horschig, DPT)',
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=Squat%20University',
    creds: 'Doctor of Physical Therapy',
    goals: ['get_fit', 'improve_health', 'build_muscle', 'stress_less'],
    bodyTypes: ['skinny', 'skinny_fat', 'average', 'athletic', 'overweight'],
    heightBandCm: [145, 210],
    focus: 'Mobility and injury-safe lifting mechanics.',
  },
  {
    name: 'Renaissance Periodization (Dr. Mike Israetel)',
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=Renaissance%20Periodization',
    creds: 'PhD sport physiology',
    goals: ['lose_weight', 'build_muscle', 'get_fit'],
    bodyTypes: ['skinny_fat', 'average', 'athletic', 'overweight'],
    heightBandCm: [155, 205],
    focus: 'Periodized programming and volume landmarks.',
  },
  {
    name: 'Layne Norton',
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=Layne%20Norton',
    creds: 'PhD nutrition; coach',
    goals: ['lose_weight', 'build_muscle', 'get_fit', 'improve_health'],
    bodyTypes: ['skinny_fat', 'average', 'athletic', 'overweight'],
    heightBandCm: [150, 205],
    focus: 'Fat-loss and nutrition myths vs data.',
  },
  {
    name: 'MidasMVMT (Coach Midas)',
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=MidasMVMT',
    creds: 'Calisthenics coaching creator',
    goals: ['build_muscle', 'get_fit', 'more_energy'],
    bodyTypes: ['skinny', 'average', 'athletic', 'skinny_fat'],
    heightBandCm: [150, 200],
    focus: 'Bodyweight progressions and skills.',
  },
];
const PLAN_DAY_TYPES = {
  lose_weight: ['HIIT', 'Rest', 'Cardio', 'Strength', 'HIIT', 'Walk', 'Rest'],
  build_muscle: ['Chest', 'Back', 'Rest', 'Legs', 'Shoulder', 'Arms', 'Rest'],
  get_fit: ['Full', 'Cardio', 'Rest', 'Strength', 'HIIT', 'Flex', 'Rest'],
  improve_health: ['Walk', 'Yoga', 'Strength', 'Walk', 'Rest', 'Cardio', 'Yoga'],
};
const BUILD_MUSCLE_SPLITS = {
  classic: ['Chest', 'Back', 'Rest', 'Legs', 'Shoulder', 'Arms', 'Rest'],
  ppl: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs'],
  upper_lower: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Arms', 'Rest'],
  arnold: ['Chest Back', 'Shoulders Arms', 'Legs', 'Rest', 'Chest Back', 'Shoulders Arms', 'Legs'],
};
const PLAN_DAY_COLORS = {
  HIIT:'rchip-cal', Cardio:'rchip-cal', Strength:'rchip-pro', Rest:'rchip-time',
  Walk:'rchip-pro', Yoga:'rchip-pro', Full:'rchip-time', Chest:'rchip-time',
  Back:'rchip-time', Legs:'rchip-cal', Shoulder:'rchip-time', Arms:'rchip-cal', Flex:'rchip-pro',
  Push:'rchip-time', Pull:'rchip-pro', Upper:'rchip-time', Lower:'rchip-cal',
  'Chest Back':'rchip-time', 'Shoulders Arms':'rchip-cal',
  ChestBack:'rchip-time', ShouldersArms:'rchip-cal'
};

// ── Per-muscle-group exercise library for build_muscle split ──────────────────
const BUILD_MUSCLE_SPLIT = {
  Chest: {
    full_gym:      [{name:'Barbell Bench Press',  sets:'4×8-10',rest:'90s', xp:14},{name:'Incline DB Press',     sets:'3×10',   rest:'75s', xp:12},{name:'Cable Flyes',          sets:'3×12',   rest:'60s', xp:10},{name:'Pec Dec Machine',      sets:'3×12',   rest:'60s', xp:10},{name:'Weighted Dips',        sets:'3×8',    rest:'90s', xp:13}],
    minimal_gym:   [{name:'DB Chest Press',       sets:'4×10',  rest:'75s', xp:12},{name:'Incline DB Press',     sets:'3×12',   rest:'60s', xp:10},{name:'DB Flyes',             sets:'3×12',   rest:'60s', xp:10},{name:'DB Pullover',          sets:'3×12',   rest:'60s', xp:9 },{name:'Push-up Burnout',      sets:'2×max',  rest:'60s', xp:8 }],
    home_equipped: [{name:'Push-up Variations',   sets:'4×15',  rest:'60s', xp:10},{name:'Incline Push-ups',     sets:'3×15',   rest:'45s', xp:9 },{name:'Band Chest Fly',       sets:'3×15',   rest:'45s', xp:8 },{name:'Diamond Push-ups',     sets:'3×12',   rest:'60s', xp:10},{name:'Band Pullover',        sets:'3×15',   rest:'45s', xp:8 }],
    calisthenics:  [{name:'Wide Push-ups',        sets:'4×15',  rest:'60s', xp:10},{name:'Incline Push-ups',     sets:'3×15',   rest:'45s', xp:9 },{name:'Diamond Push-ups',     sets:'3×12',   rest:'60s', xp:10},{name:'Dips (chair)',         sets:'3×12',   rest:'60s', xp:10},{name:'Pseudo Planche',       sets:'3×30s',  rest:'60s', xp:12}],
    outdoor:       [{name:'Push-ups',             sets:'5×15',  rest:'60s', xp:10},{name:'Dips (parallel bars)', sets:'4×10',   rest:'75s', xp:13},{name:'Incline Push-ups',     sets:'3×15',   rest:'45s', xp:9 },{name:'Wide Push-ups',        sets:'3×15',   rest:'45s', xp:10}],
  },
  Back: {
    full_gym:      [{name:'Lat Pulldown',         sets:'4×10',  rest:'75s', xp:13},{name:'Barbell Row',          sets:'4×8',    rest:'90s', xp:14},{name:'Seated Cable Row',     sets:'3×12',   rest:'60s', xp:11},{name:'Face Pulls',           sets:'3×15',   rest:'45s', xp:9 },{name:'Straight-Arm Pulldown',sets:'3×12',  rest:'60s', xp:9 }],
    minimal_gym:   [{name:'DB Bent-Over Row',     sets:'4×10',  rest:'75s', xp:12},{name:'DB Single-Arm Row',    sets:'3×12 ea',rest:'60s', xp:11},{name:'DB Romanian Deadlift', sets:'3×12',   rest:'75s', xp:12},{name:'DB Pullover',          sets:'3×12',   rest:'60s', xp:9 },{name:'Band Pull-Apart',      sets:'3×20',   rest:'30s', xp:7 }],
    home_equipped: [{name:'Band Row',             sets:'4×15',  rest:'45s', xp:9 },{name:'Band Pull-Apart',      sets:'3×20',   rest:'30s', xp:7 },{name:'Doorframe Row',        sets:'3×12',   rest:'60s', xp:10},{name:'Superman',             sets:'3×15',   rest:'30s', xp:7 },{name:'Band Face Pulls',      sets:'3×15',   rest:'45s', xp:8 }],
    calisthenics:  [{name:'Pull-ups',             sets:'4×max', rest:'90s', xp:14},{name:'Inverted Rows',        sets:'4×12',   rest:'60s', xp:11},{name:'Negative Pull-ups',    sets:'3×5',    rest:'90s', xp:12},{name:'Superman',             sets:'3×15',   rest:'30s', xp:7 },{name:'Arch Body Hold',       sets:'3×30s',  rest:'30s', xp:8 }],
    outdoor:       [{name:'Pull-ups',             sets:'5×8',   rest:'90s', xp:14},{name:'Chin-ups',             sets:'4×8',    rest:'90s', xp:13},{name:'Hanging Row',          sets:'4×10',   rest:'75s', xp:12},{name:'Inverted Pull-ups',    sets:'3×12',   rest:'60s', xp:11}],
  },
  Legs: {
    full_gym:      [{name:'Barbell Back Squat',   sets:'4×8-10',rest:'120s',xp:15},{name:'Leg Press',            sets:'4×12',   rest:'90s', xp:12},{name:'Romanian Deadlift',    sets:'3×10',   rest:'90s', xp:13},{name:'Leg Curl',             sets:'3×12',   rest:'60s', xp:10},{name:'Calf Raises',          sets:'4×15',   rest:'45s', xp:8 }],
    minimal_gym:   [{name:'Goblet Squat',         sets:'4×12',  rest:'75s', xp:12},{name:'DB Romanian Deadlift', sets:'3×12',   rest:'75s', xp:12},{name:'DB Step-ups',          sets:'3×12 ea',rest:'60s', xp:11},{name:'Reverse Lunges',       sets:'3×12 ea',rest:'60s', xp:11},{name:'DB Calf Raise',        sets:'4×15',   rest:'45s', xp:8 }],
    home_equipped: [{name:'Band Squats',          sets:'4×15',  rest:'60s', xp:10},{name:'Bulgarian Split Squat',sets:'3×10 ea',rest:'75s', xp:12},{name:'Glute Bridge',         sets:'4×15',   rest:'45s', xp:9 },{name:'Band Good Morning',    sets:'3×15',   rest:'45s', xp:9 },{name:'Band Calf Raises',     sets:'4×20',   rest:'30s', xp:7 }],
    calisthenics:  [{name:'Bodyweight Squats',    sets:'4×20',  rest:'60s', xp:10},{name:'Bulgarian Split Squat',sets:'3×12 ea',rest:'75s', xp:12},{name:'Jump Squats',          sets:'3×15',   rest:'60s', xp:11},{name:'Glute Bridge',         sets:'4×15',   rest:'45s', xp:9 },{name:'Calf Raises',          sets:'4×20',   rest:'30s', xp:7 }],
    outdoor:       [{name:'Hill Sprints',         sets:'6×30s', rest:'90s', xp:14},{name:'Walking Lunges',       sets:'4×20',   rest:'60s', xp:11},{name:'Step-ups',             sets:'4×15 ea',rest:'60s', xp:11},{name:'Jump Squats',          sets:'3×15',   rest:'60s', xp:11}],
  },
  Shoulder: {
    full_gym:      [{name:'Barbell OHP',          sets:'4×8',   rest:'90s', xp:14},{name:'DB Lateral Raise',     sets:'4×15',   rest:'45s', xp:9 },{name:'DB Front Raise',       sets:'3×12',   rest:'45s', xp:8 },{name:'Rear Delt Flye',       sets:'3×15',   rest:'45s', xp:9 },{name:'Barbell Shrugs',       sets:'3×12',   rest:'60s', xp:10}],
    minimal_gym:   [{name:'DB Seated OHP',        sets:'4×10',  rest:'75s', xp:12},{name:'Arnold Press',         sets:'3×12',   rest:'60s', xp:11},{name:'DB Lateral Raise',     sets:'4×15',   rest:'45s', xp:9 },{name:'DB Front Raise',       sets:'3×12',   rest:'45s', xp:8 },{name:'DB Shrugs',            sets:'3×15',   rest:'45s', xp:9 }],
    home_equipped: [{name:'Pike Push-ups',        sets:'4×10',  rest:'60s', xp:11},{name:'Band OHP',             sets:'4×15',   rest:'60s', xp:9 },{name:'Band Lateral Raise',   sets:'3×15',   rest:'45s', xp:8 },{name:'Band Face Pulls',      sets:'3×15',   rest:'45s', xp:8 },{name:'Band Shrugs',          sets:'3×20',   rest:'30s', xp:7 }],
    calisthenics:  [{name:'Pike Push-ups',        sets:'4×12',  rest:'60s', xp:11},{name:'Wall Handstand Hold',  sets:'3×20s',  rest:'60s', xp:12},{name:'YTW Raises',           sets:'3×10 ea',rest:'45s', xp:9 },{name:'Lateral Plank Walks',  sets:'3×10',   rest:'45s', xp:9 },{name:'Prone Y Raise',        sets:'3×15',   rest:'30s', xp:7 }],
    outdoor:       [{name:'Pike Push-ups',        sets:'5×10',  rest:'60s', xp:11},{name:'Handstand Practice',   sets:'3×20s',  rest:'60s', xp:12},{name:'Dips (shoulder focus)',sets:'3×10',   rest:'75s', xp:12},{name:'Band Lateral Raise',   sets:'3×15',   rest:'45s', xp:8 }],
  },
  Arms: {
    full_gym:      [{name:'Barbell Curl',         sets:'4×10',  rest:'60s', xp:11},{name:'Tricep Pushdown',      sets:'4×12',   rest:'60s', xp:10},{name:'Skull Crushers',       sets:'3×10',   rest:'75s', xp:12},{name:'Preacher Curl',        sets:'3×12',   rest:'60s', xp:10},{name:'Hammer Curl',          sets:'3×12',   rest:'60s', xp:9 }],
    minimal_gym:   [{name:'DB Curl',              sets:'4×12',  rest:'60s', xp:10},{name:'DB Tricep Extension',  sets:'4×12',   rest:'60s', xp:10},{name:'Hammer Curl',          sets:'3×12',   rest:'60s', xp:9 },{name:'Tricep Kickback',      sets:'3×12',   rest:'60s', xp:9 },{name:'Concentration Curl',   sets:'3×12 ea',rest:'60s', xp:9 }],
    home_equipped: [{name:'Band Curl',            sets:'4×15',  rest:'45s', xp:9 },{name:'Band Tricep Pushdown', sets:'4×15',   rest:'45s', xp:9 },{name:'Diamond Push-ups',     sets:'3×12',   rest:'60s', xp:10},{name:'Band Hammer Curl',     sets:'3×15',   rest:'45s', xp:8 },{name:'Close-grip Push-ups',  sets:'3×12',   rest:'60s', xp:10}],
    calisthenics:  [{name:'Diamond Push-ups',     sets:'4×12',  rest:'60s', xp:10},{name:'Chin-ups',             sets:'4×max',  rest:'90s', xp:13},{name:'Close-grip Push-ups',  sets:'3×15',   rest:'60s', xp:10},{name:'Dips (chair)',         sets:'3×12',   rest:'60s', xp:10},{name:'Isometric Curl Hold',  sets:'3×30s',  rest:'45s', xp:8 }],
    outdoor:       [{name:'Chin-ups',             sets:'5×8',   rest:'90s', xp:13},{name:'Tricep Dips (bars)',   sets:'4×12',   rest:'75s', xp:12},{name:'Close-grip Push-ups',  sets:'3×15',   rest:'60s', xp:10},{name:'Hanging Curl Hold',    sets:'3×10s',  rest:'60s', xp:8 }],
  },
  Rest: {
    full_gym:      [{name:'Light Treadmill Walk', sets:'20 min',rest:'—',   xp:8 },{name:'Full-body Stretching', sets:'15 min', rest:'—',   xp:7 },{name:'Foam Rolling',         sets:'10 min', rest:'—',   xp:6 }],
    minimal_gym:   [{name:'Light Walk',           sets:'20 min',rest:'—',   xp:8 },{name:'Full-body Stretching', sets:'15 min', rest:'—',   xp:7 },{name:'Foam Rolling',         sets:'10 min', rest:'—',   xp:6 }],
    home_equipped: [{name:'Light Walk',           sets:'20 min',rest:'—',   xp:8 },{name:'Full-body Stretching', sets:'15 min', rest:'—',   xp:7 },{name:'Band Mobility Flow',   sets:'10 min', rest:'—',   xp:6 }],
    calisthenics:  [{name:'Light Walk',           sets:'20 min',rest:'—',   xp:8 },{name:'Full-body Stretching', sets:'15 min', rest:'—',   xp:7 },{name:'Mobility Flow',        sets:'10 min', rest:'—',   xp:6 }],
    outdoor:       [{name:'Nature Walk',          sets:'25 min',rest:'—',   xp:10},{name:'Outdoor Stretching',   sets:'15 min', rest:'—',   xp:7 }],
  },
};

const EXERCISE_LOOKBACK_DAYS = 7;

normalizeTodayState();
normalizeStoredProfile();

function getLevel() { return Math.floor(G.xp / 100) + 1; }
function getXPInLevel() { return G.xp % 100; }
function getHeroIcon(goal) { return HERO_ICONS[goal] || '⚔️'; }
function getTodayKey() { return new Date().toDateString(); }
function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}
function inferPhysiquePhase(goal) {
  if (goal === 'lose_weight') return 'cutting';
  if (goal === 'build_muscle') return 'lean_bulk';
  return 'recomp';
}
function mapLegacyBodyType(bodyType) {
  const v = String(bodyType || '').trim().toLowerCase();
  const legacyMap = {
    slim: 'skinny',
    balanced: 'average',
    stocky: 'overweight',
  };
  return legacyMap[v] || v;
}
function inferPhysiquePhaseByBodyType(goal, bodyType) {
  const bt = mapLegacyBodyType(bodyType);
  if (bt === 'skinny_fat') {
    if (goal === 'lose_weight') return 'cutting';
    return 'recomp';
  }
  if (bt === 'skinny') {
    if (goal === 'lose_weight') return 'recomp';
    return goal === 'build_muscle' ? 'lean_bulk' : 'recomp';
  }
  if (bt === 'overweight') {
    return goal === 'build_muscle' ? 'recomp' : 'cutting';
  }
  return inferPhysiquePhase(goal);
}
function getBodyTypeRecommendation(goal, bodyType) {
  const bt = mapLegacyBodyType(bodyType);
  const phase = inferPhysiquePhaseByBodyType(goal, bt);
  const notes = {
    skinny: 'Start with progressive overload and a small calorie surplus or maintenance.',
    skinny_fat: 'Prioritize body recomposition: strength training + high protein.',
    average: 'Use balanced progression with slight deficit/surplus based on your goal.',
    athletic: 'Use performance-focused progression and tighter recovery management.',
    overweight: 'Prioritize fat loss while preserving muscle via resistance training.',
  };
  return { phase, note: notes[bt] || notes.average };
}
function getPhaseConfig(phase) {
  return PHYSIQUE_PHASES[phase] || PHYSIQUE_PHASES[inferPhysiquePhase(G.profile?.goal || 'get_fit')];
}
function getPhaseLabel(phase) {
  return getPhaseConfig(phase).label;
}
function getTrainingWindowLabel(windowKey) {
  return TRAINING_WINDOW_LABELS[windowKey] || TRAINING_WINDOW_LABELS.flexible;
}
function getWindowKeyFromHour(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return 'flexible';
  if (h >= 5 && h < 11) return 'early';
  if (h >= 11 && h < 16) return 'midday';
  if (h >= 16 && h < 20) return 'evening';
  return 'night';
}
function getCreatorReferences(profile, maxItems = 3) {
  if (!profile) return [];
  const height = clampNumber(profile.height, 120, 240, 170);
  const bodyType = mapLegacyBodyType(profile.bodyType);
  const goal = profile.goal || 'get_fit';
  return CREATOR_REFERENCE_LIBRARY.map(item => {
    let score = 0;
    if (item.goals.includes(goal)) score += 28;
    if (item.bodyTypes.includes(bodyType)) score += 24;
    const [minH, maxH] = item.heightBandCm;
    if (height >= minH && height <= maxH) score += 20;
    const center = (minH + maxH) / 2;
    score -= Math.min(Math.abs(height - center) / 2, 14);
    return { ...item, score };
  }).sort((a, b) => b.score - a.score).slice(0, maxItems);
}
function getEffectiveTrainingWindowKey(profile, scheduleContext = null) {
  if (!profile?.autoWindowFromSchedule) return profile?.preferredWindow || 'evening';
  const ctx = scheduleContext || getScheduleInsights(profile);
  return ctx?.recommendedWindowKey || profile?.preferredWindow || 'evening';
}
function normalizeProfileFields(profile) {
  if (!profile) return profile;
  profile.equipment = normalizeEquipmentKey(profile.equipment || 'calisthenics');
  profile.bodyType = mapLegacyBodyType(profile.bodyType);
  profile.bodyType = BODY_TYPE_LABELS[profile.bodyType] ? profile.bodyType : 'average';
  profile.physiquePhase = PHYSIQUE_PHASES[profile.physiquePhase]
    ? profile.physiquePhase
    : inferPhysiquePhaseByBodyType(profile.goal || 'get_fit', profile.bodyType);
  profile.calisthenicsLevel = CALISTHENICS_LEVEL_LABELS[profile.calisthenicsLevel] ? profile.calisthenicsLevel : 'beginner';
  profile.sessionMinutes = clampNumber(profile.sessionMinutes, 20, 90, 45);
  profile.preferredWindow = TRAINING_WINDOW_LABELS[profile.preferredWindow] ? profile.preferredWindow : 'evening';
  profile.autoWindowFromSchedule = !!profile.autoWindowFromSchedule;
  profile.patternMode = profile.patternMode === 'strict' ? 'strict' : 'flexible';
  profile.buildMuscleSplit = getBuildMuscleSplitKey(profile);
  return profile;
}
function computeProfileTargets(profile) {
  if (!profile) return profile;
  normalizeProfileFields(profile);
  const weight = clampNumber(profile.weight, 35, 350, 70);
  const height = clampNumber(profile.height, 120, 240, 170);
  const age = clampNumber(profile.age, 12, 100, 25);
  const isMale = profile.gender === 'Male';
  const bmr = isMale ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * (ACT_MULT[profile.activity] || ACT_MULT.moderate));
  const phase = getPhaseConfig(profile.physiquePhase);
  const bodyAdjustments = {
    skinny: phase.calorieDelta > 0 ? 130 : -20,
    skinny_fat: phase.calorieDelta > 0 ? 10 : -60,
    average: 0,
    athletic: phase.calorieDelta > 0 ? 40 : -20,
    overweight: phase.calorieDelta > 0 ? -40 : -120,
  };
  const calories = Math.max(1400, tdee + phase.calorieDelta + (bodyAdjustments[profile.bodyType] || 0));
  const protein = Math.max(90, Math.round(weight * phase.proteinMultiplier));
  const fats = Math.max(40, Math.round((calories * phase.fatRatio) / 9));
  const remainingCalories = Math.max(0, calories - protein * 4 - fats * 9);
  const carbs = Math.max(80, Math.round(remainingCalories / 4));
  profile.calories = calories;
  profile.protein = protein;
  profile.carbs = carbs;
  profile.fat = fats;
  return profile;
}
function getWeekStartMonday(baseDate = new Date()) {
  const d = new Date(baseDate);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}
function buildQuestWeekTypes(goal, targetWorkoutDays, baseWeek = null) {
  const base = Array.isArray(baseWeek) && baseWeek.length === 7
    ? baseWeek
    : (PLAN_DAY_TYPES[goal] || PLAN_DAY_TYPES.get_fit);
  const workoutPool = base.filter(type => String(type || '').toLowerCase() !== 'rest');
  const target = Math.max(1, Math.min(7, Number(targetWorkoutDays) || 4));

  if (!workoutPool.length) {
    return Array.from({ length: 7 }, (_, i) => (i < target ? 'Full' : 'Rest'));
  }

  const selected = [];
  for (let pick = 0; pick < target; pick += 1) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let idx = 0; idx < 7; idx += 1) {
      if (selected.includes(idx)) continue;
      const minGap = selected.length
        ? selected.reduce((min, day) => Math.min(min, Math.min(Math.abs(day - idx), 7 - Math.abs(day - idx))), 7)
        : 3;
      const baseBonus = String(base[idx] || '').toLowerCase() !== 'rest' ? 3 : 0;
      const score = minGap * 10 + baseBonus;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
    selected.push(bestIdx);
  }

  const week = Array(7).fill('Rest');
  const sortedDays = selected.slice().sort((a, b) => a - b);
  sortedDays.forEach((dayIdx, i) => {
    week[dayIdx] = workoutPool[i % workoutPool.length];
  });
  return week;
}
function getPlanTypesForGoal(goal, profile = null) {
  const activeProfile = profile || (G.profile?.goal === goal ? G.profile : null);
  let base = PLAN_DAY_TYPES[goal] || PLAN_DAY_TYPES.get_fit;
  if (goal === 'build_muscle') {
    const splitKey = getBuildMuscleSplitKey(activeProfile);
    base = BUILD_MUSCLE_SPLITS[splitKey] || BUILD_MUSCLE_SPLITS.classic;
  }
  if (!activeProfile) return base;
  const targetWorkoutDays = getTargetWorkoutDays(activeProfile);
  return buildQuestWeekTypes(goal, targetWorkoutDays, base);
}
function getTodayMuscleGroup(goal, profile = null) {
  return getPlanTypeForDate(goal, toISODate(new Date()), profile);
}

function getBaseQuestTypeForWeekDay(goal, day) {
  const idx = getMondayIndexedDayIndex(day);
  if (idx < 0) return null;
  const profileForGoal = G.profile?.goal === goal ? G.profile : null;
  const types = getPlanTypesForGoal(goal || 'get_fit', profileForGoal);
  return types?.[idx] || null;
}

function getBuildMuscleSplitKey(profile = null) {
  const key = String(profile?.buildMuscleSplit || 'classic').toLowerCase();
  return Object.prototype.hasOwnProperty.call(BUILD_MUSCLE_SPLITS, key) ? key : 'classic';
}

function resolveBuildMuscleExerciseGroup(dayType, dateISO = toISODate(new Date())) {
  const type = String(dayType || '').trim();
  const compactType = type.replace(/\s+/g, '');
  if (!type) return 'Chest';
  if (Object.prototype.hasOwnProperty.call(BUILD_MUSCLE_SPLIT, type)) return type;

  const d = new Date(String(dateISO || '') + 'T00:00:00');
  const daySeed = Number.isNaN(d.getTime()) ? 0 : ((d.getDay() + 6) % 7);

  if (type === 'Legs' || type === 'Lower') return 'Legs';
  if (type === 'Push') return ['Chest', 'Shoulder', 'Arms'][daySeed % 3];
  if (type === 'Pull') return daySeed % 2 === 0 ? 'Back' : 'Arms';
  if (type === 'Upper') return ['Chest', 'Back', 'Shoulder', 'Arms'][daySeed % 4];
  if (compactType === 'ChestBack') return daySeed % 2 === 0 ? 'Chest' : 'Back';
  if (compactType === 'ShouldersArms') return daySeed % 2 === 0 ? 'Shoulder' : 'Arms';
  if (type === 'Rest') return 'Rest';
  return 'Chest';
}

function getPlanTypeForDate(goal, dateISO, profile = null) {
  const autoPlannedType = getAutoPlannedQuestTypeForDate(dateISO);
  if (autoPlannedType && String(autoPlannedType).toLowerCase() !== 'training') return autoPlannedType;
  const d = new Date(dateISO + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const idx = (d.getDay() + 6) % 7;
  const types = getPlanTypesForGoal(goal, profile);
  return types[idx] || null;
}

function parseAutoPlanQuestTypeFromNote(note) {
  const text = String(note || '');
  const match = text.match(/^Auto-plan:\s*([^\u00b7|]+?)\s*(?:\u00b7|$)/i);
  const value = match?.[1] ? String(match[1]).trim() : '';
  return value || null;
}

function isManagedAutoPlanEntry(entry) {
  if (!entry) return false;
  return String(entry.source || '') === 'auto-plan'
    || String(entry.note || '').startsWith('Auto-plan:');
}

function getAutoPlannedQuestTypeForDate(dateISO) {
  if (!dateISO) return null;
  const entries = (G.plannerDates || []).filter(item => item && item.date === dateISO && isManagedAutoPlanEntry(item));
  if (!entries.length) return null;

  const workoutEntry = entries.find(item => item.type === 'workout');
  if (workoutEntry) {
    return parseAutoPlanQuestTypeFromNote(workoutEntry.note);
  }

  const restEntry = entries.find(item => item.type === 'rest_day');
  if (restEntry) {
    const targetDate = parseISODateSafe(dateISO);
    if (!targetDate) return null;
    const weekStart = getWeekStartSunday(targetDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const hasWorkoutInManagedWeek = (G.plannerDates || []).some(item => {
      if (!item || !isManagedAutoPlanEntry(item) || item.type !== 'workout' || !item.date) return false;
      const dt = parseISODateSafe(item.date);
      return !!dt && dt >= weekStart && dt <= weekEnd;
    });

    if (hasWorkoutInManagedWeek) return 'Rest';
  }

  return null;
}

function parseISODateSafe(dateStr) {
  const d = new Date(String(dateStr || '') + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

function getMembershipReminderStatus() {
  const reminders = (G.plannerDates || [])
    .filter(item => item && item.type === 'membership_renewal' && item.date)
    .map(item => ({
      date: item.date,
      note: item.note || 'Membership renewal',
      dt: parseISODateSafe(item.date),
    }))
    .filter(item => item.dt)
    .sort((a, b) => a.dt - b.dt);

  if (!reminders.length) {
    return { hasReminder: false, expired: false, latest: null, daysDelta: null };
  }

  const latest = reminders[reminders.length - 1];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((latest.dt - today) / msPerDay);

  return {
    hasReminder: true,
    expired: diffDays < 0,
    latest,
    // Positive = days until due, negative = days overdue.
    daysDelta: diffDays,
  };
}

function getEffectiveEquipmentForPlan(profile) {
  const eq = normalizeEquipmentKey(profile?.equipment || 'calisthenics');
  const gymBased = eq === 'full_gym' || eq === 'minimal_gym';
  const reminder = getMembershipReminderStatus();

  // Suggest home setup if membership reminder date has passed and user still uses gym equipment profile.
  const suggestHome = gymBased && reminder.hasReminder && reminder.expired;
  const effectiveEquipment = suggestHome ? 'home_equipped' : eq;

  return { effectiveEquipment, reminder, suggestHome };
}
function normalizeEquipmentKey(value) {
  if (value === 'mix') return G.selectedGym ? 'full_gym' : 'calisthenics';
  return EQUIP_LABELS[value] ? value : 'calisthenics';
}
function normalizeTodayState() {
  if (!Array.isArray(G.today.questsDone)) G.today.questsDone = [];
  if (!Array.isArray(G.today.completedExercises)) G.today.completedExercises = [];
  if (!G.today.planSnapshot || typeof G.today.planSnapshot !== 'object') G.today.planSnapshot = null;
  if (!Array.isArray(G.plannerDates)) G.plannerDates = [];
}
function normalizeStoredProfile() {
  if (!G.profile) return;
  const before = JSON.stringify(G.profile);
  const normalizedEquipment = normalizeEquipmentKey(G.profile.equipment);
  if (G.profile.equipment !== normalizedEquipment) {
    G.profile.equipment = normalizedEquipment;
  }
  computeProfileTargets(G.profile);
  if (JSON.stringify(G.profile) !== before) localStorage.setItem('vq_profile', JSON.stringify(G.profile));
}
function slugifyExerciseName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function inferExerciseFamily(name) {
  const value = String(name || '').toLowerCase();
  if (/walk|jog|run|sprint|interval|stair|cardio|bike|jump rope|jumping jack|high knees|burpee|mountain climber/.test(value)) return 'cardio';
  if (/plank|core|twist|salutation/.test(value)) return 'core';
  if (/stretch|mobility|yoga|breathing|recovery/.test(value)) return 'mobility';
  if (/deadlift|hinge/.test(value)) return 'hinge';
  if (/squat|lunge|leg press|step-up|step up|split squat|pistol/.test(value)) return 'lower-body';
  if (/row|pull-up|pull up|lat pulldown|pull-apart|pull apart|ring row/.test(value)) return 'pull';
  if (/bench|press|push-up|push up|dip|fly|thruster|planche/.test(value)) return 'push';
  if (/curl|tricep|skull crusher|kickback|lateral raise/.test(value)) return 'upper-accessory';
  return 'general';
}

function inferPrimaryMuscle(name) {
  const value = String(name || '').toLowerCase();
  if (/face pull|rear delt|reverse fly/.test(value)) return 'shoulders';
  if (/tricep|dip|pushdown|skull crusher|kickback/.test(value)) return 'triceps';
  if (/bicep|curl/.test(value)) return 'biceps';
  if (/bench|chest|push-up|push up|fly/.test(value)) return 'chest';
  if (/row|pull-up|pull up|lat pulldown|pull-apart|pull apart/.test(value)) return 'back';
  if (/squat|lunge|leg press|step-up|step up|split squat|pistol|hamstring|calf/.test(value)) return 'legs';
  if (/shoulder|lateral raise|overhead press|pike push/.test(value)) return 'shoulders';
  if (/plank|core|twist|abs|sit-up|sit up/.test(value)) return 'core';
  if (/walk|jog|run|sprint|cardio|bike|jump rope|burpee|mountain climber|high knees/.test(value)) return 'cardio';
  if (/yoga|stretch|mobility|recovery|breathing/.test(value)) return 'mobility';
  return 'general';
}

function inferMovementPattern(name) {
  const value = String(name || '').toLowerCase();
  if (/push-up|push up|bench|press|dip|fly|thruster|planche/.test(value)) return 'horizontal-push';
  if (/overhead press|pike push|shoulder press|handstand/.test(value)) return 'vertical-push';
  if (/row|ring row|cable row|face pull|rear delt|reverse fly/.test(value)) return 'horizontal-pull';
  if (/pull-up|pull up|lat pulldown|chin-up|chin up|pull-apart|pull apart/.test(value)) return 'vertical-pull';
  if (/squat|leg press|lunge|step-up|step up|split squat|pistol/.test(value)) return 'knee-dominant';
  if (/deadlift|hinge|hip thrust|good morning|romanian/.test(value)) return 'hip-hinge';
  if (/plank|hollow|twist|core|sit-up|sit up/.test(value)) return 'core-stability';
  if (/walk|jog|run|sprint|bike|cardio|jump rope|high knees/.test(value)) return 'locomotion';
  if (/burpee|mountain climber/.test(value)) return 'metcon';
  if (/yoga|stretch|mobility|breathing/.test(value)) return 'mobility';
  return inferExerciseFamily(name);
}

function createExerciseEntry(exercise) {
  const family = exercise.family || inferExerciseFamily(exercise.name);
  const primaryMuscle = exercise.primaryMuscle || inferPrimaryMuscle(exercise.name);
  const movementPattern = exercise.movementPattern || inferMovementPattern(exercise.name);
  return {
    ...exercise,
    key: exercise.key || slugifyExerciseName(exercise.name),
    family,
    primaryMuscle,
    movementPattern,
  };
}
function getRecentExerciseHistory(goal, days = EXERCISE_LOOKBACK_DAYS) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return G.exerciseHistory.filter(entry => {
    if (!entry || entry.goal !== goal) return false;
    const completedAt = entry.completedAt ? new Date(entry.completedAt).getTime() : 0;
    return completedAt >= cutoff;
  });
}
function getUpcomingExamContext(lookaheadDays = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + lookaheadDays);
  const examRegex = /\b(exam|midterm|finals?|quiz|test|assessment|orale?)\b/i;

  const entries = (G.plannerDates || [])
    .filter(item => item?.date)
    .map(item => {
      const dt = parseISODateSafe(item.date);
      return dt ? { ...item, dt } : null;
    })
    .filter(Boolean)
    .filter(item => item.dt >= today && item.dt <= end)
    .filter(item => {
      if (item.type === 'exam') return true;
      const note = String(item.note || '');
      return item.type === 'busy' && examRegex.test(note);
    })
    .sort((a, b) => a.dt - b.dt);

  if (!entries.length) {
    return { active: false, level: 'none', nearestDays: null, nextDate: null, count: 0, titles: [] };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const nearestDays = Math.max(0, Math.floor((entries[0].dt - today) / msPerDay));
  const level = nearestDays <= 3 ? 'high' : nearestDays <= 7 ? 'medium' : 'light';
  const titles = entries.slice(0, 3).map(item => item.note || 'Exam');

  return {
    active: true,
    level,
    nearestDays,
    nextDate: entries[0].date,
    count: entries.length,
    titles,
  };
}

function scalePrimaryCount(label, factor) {
  const out = String(label || '').replace(/(\d+)\s*[x×]/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(1, Math.round(base * factor))}×`;
  });
  if (out !== String(label || '')) return out;

  const outMin = String(label || '').replace(/(\d+)\s*min\b/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(8, Math.round(base * factor))} min`;
  });
  if (outMin !== String(label || '')) return outMin;

  const outRounds = String(label || '').replace(/(\d+)\s*rounds?\b/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(1, Math.round(base * factor))} rounds`;
  });
  if (outRounds !== String(label || '')) return outRounds;

  const outReps = String(label || '').replace(/(\d+)\s*reps?\b/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(2, Math.round(base * factor))} reps`;
  });
  return outReps;
}

function scaleRestLabel(rest, level) {
  const restText = String(rest || '').trim();
  if (!restText || restText === '—') return restText || '—';
  const factor = level === 'high' ? 0.65 : level === 'medium' ? 0.72 : 0.8;

  const secScaled = restText.replace(/(\d+)\s*s\b/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(20, Math.round(base * factor))}s`;
  });
  if (secScaled !== restText) return secScaled;

  const minScaled = restText.replace(/(\d+)\s*min\b/i, (m, n) => {
    const base = parseInt(n, 10);
    if (!Number.isFinite(base)) return m;
    return `${Math.max(1, Math.round(base * factor))} min`;
  });
  return minScaled;
}

function adaptExercisesForExamPeriod(items, examContext) {
  if (!examContext?.active) return items;
  const setFactor = examContext.level === 'high' ? 0.58 : examContext.level === 'medium' ? 0.72 : 0.84;
  const maxItems = examContext.level === 'high' ? 4 : 5;

  return items.slice(0, maxItems).map(ex => ({
    ...ex,
    sets: scalePrimaryCount(ex.sets, setFactor),
    rest: scaleRestLabel(ex.rest, examContext.level),
    xp: Math.max(6, Math.round((ex.xp || 10) * (examContext.level === 'high' ? 0.88 : examContext.level === 'medium' ? 0.92 : 0.96))),
    examAdjusted: true,
  }));
}

function getExamModeKey(examContext) {
  if (!examContext?.active) return 'none';
  return `${examContext.level}|${examContext.nextDate}|${examContext.count}`;
}

function getHistoryMovementPattern(entry) {
  return entry?.movementPattern || inferMovementPattern(entry?.name || '');
}

function getHistoryPrimaryMuscle(entry) {
  return entry?.primaryMuscle || inferPrimaryMuscle(entry?.name || '');
}

function selectDiversifiedExercises(baseExercises, recentHistory, maxItems = 5) {
  const recentPatterns = new Map();
  const recentMuscles = new Map();
  const recentFamilies = new Map();
  const recentKeys = new Set();

  recentHistory.forEach(entry => {
    const key = entry?.key || slugifyExerciseName(entry?.name || '');
    if (key) recentKeys.add(key);
    const pattern = getHistoryMovementPattern(entry);
    const muscle = getHistoryPrimaryMuscle(entry);
    const family = entry?.family || inferExerciseFamily(entry?.name || '');
    recentPatterns.set(pattern, (recentPatterns.get(pattern) || 0) + 1);
    recentMuscles.set(muscle, (recentMuscles.get(muscle) || 0) + 1);
    recentFamilies.set(family, (recentFamilies.get(family) || 0) + 1);
  });

  const candidates = baseExercises.map(ex => ({
    ...ex,
    movementPattern: ex.movementPattern || inferMovementPattern(ex.name),
    primaryMuscle: ex.primaryMuscle || inferPrimaryMuscle(ex.name),
    baseScore:
      100
      - (recentPatterns.get(ex.movementPattern) || 0) * 28
      - (recentMuscles.get(ex.primaryMuscle) || 0) * 14
      - (recentFamilies.get(ex.family) || 0) * 9
      - (recentKeys.has(ex.key) ? 45 : 0),
  }));

  const selected = [];
  const pickedPatterns = new Set();
  const pickedMuscles = new Set();

  while (selected.length < maxItems && selected.length < candidates.length) {
    let best = null;
    candidates.forEach(c => {
      if (selected.some(s => s.key === c.key)) return;
      let score = c.baseScore;
      if (pickedPatterns.has(c.movementPattern)) score -= 18;
      else score += 10;
      if (pickedMuscles.has(c.primaryMuscle)) score -= 8;
      else score += 5;

      if (!best || score > best.score) best = { c, score };
    });

    if (!best) break;
    selected.push(best.c);
    pickedPatterns.add(best.c.movementPattern);
    pickedMuscles.add(best.c.primaryMuscle);
  }

  return selected;
}

function buildAdaptiveExercisePlan(goal, equipment, examContext = null, profile = null, scheduleContext = null) {
  const exerciseProfile = getExercises(goal, equipment, profile, scheduleContext);
  const baseExercises = exerciseProfile.items;
  const recentHistory = getRecentExerciseHistory(goal);
  const recentPatterns = new Set(recentHistory.map(entry => getHistoryMovementPattern(entry)));
  const items = selectDiversifiedExercises(baseExercises, recentHistory, 5);
  const repeatedCount = items.filter(item => recentPatterns.has(item.movementPattern)).length;
  const adaptedItems = adaptExercisesForExamPeriod(items, examContext);
  return {
    items: adaptedItems,
    adapted: repeatedCount > 0,
    hasRecentOverlap: repeatedCount > 0,
    repeatedCount,
    examAdjusted: !!examContext?.active,
    examContext,
    effectiveMinutes: exerciseProfile.effectiveMinutes,
    timeAdjusted: exerciseProfile.timeAdjusted,
    usesProgression: exerciseProfile.usesProgression,
    progressionLevel: exerciseProfile.level,
  };
}
function isPlanSnapshotCurrent(snapshot, profile, examModeKey = 'none', scheduleModeKey = 'none') {
  return !!snapshot
    && snapshot.date === getTodayKey()
    && snapshot.goal === profile.goal
    && snapshot.equipment === (profile.equipment || 'calisthenics')
    && snapshot.examModeKey === examModeKey
    && snapshot.scheduleModeKey === scheduleModeKey
    && snapshot.sessionMinutes === (profile.sessionMinutes || 45)
    && snapshot.buildMuscleSplit === getBuildMuscleSplitKey(profile)
    && snapshot.calisthenicsLevel === (profile.calisthenicsLevel || 'beginner')
    && snapshot.muscleGroup === getTodayMuscleGroup(profile.goal)
    && Array.isArray(snapshot.items);
}
function getPlanSnapshot(profile, examContext = null, scheduleContext = null) {
  const examModeKey = getExamModeKey(examContext);
  const scheduleModeKey = getScheduleModeKey(scheduleContext);
  if (isPlanSnapshotCurrent(G.today.planSnapshot, profile, examModeKey, scheduleModeKey)) return G.today.planSnapshot;
  const equipment = profile.equipment || 'calisthenics';
  const adaptivePlan = buildAdaptiveExercisePlan(profile.goal, equipment, examContext, profile, scheduleContext);
  G.today.planSnapshot = {
    date: getTodayKey(),
    goal: profile.goal,
    equipment,
    examModeKey,
    scheduleModeKey,
    sessionMinutes: profile.sessionMinutes || 45,
    buildMuscleSplit: getBuildMuscleSplitKey(profile),
    calisthenicsLevel: profile.calisthenicsLevel || 'beginner',
    muscleGroup: getTodayMuscleGroup(profile.goal),
    adapted: adaptivePlan.adapted,
    hasRecentOverlap: adaptivePlan.hasRecentOverlap,
    repeatedCount: adaptivePlan.repeatedCount,
    examAdjusted: adaptivePlan.examAdjusted,
    examContext: adaptivePlan.examContext,
    effectiveMinutes: adaptivePlan.effectiveMinutes,
    timeAdjusted: adaptivePlan.timeAdjusted,
    usesProgression: adaptivePlan.usesProgression,
    progressionLevel: adaptivePlan.progressionLevel,
    items: adaptivePlan.items,
  };
  saveToday();
  return G.today.planSnapshot;
}
function recordCompletedExercise(exercise) {
  const todayKey = getTodayKey();
  const alreadyLogged = G.exerciseHistory.some(entry => entry.date === todayKey && entry.key === exercise.key);
  if (alreadyLogged) return;
  G.exerciseHistory.push({
    key: exercise.key,
    name: exercise.name,
    family: exercise.family,
    primaryMuscle: exercise.primaryMuscle || inferPrimaryMuscle(exercise.name),
    movementPattern: exercise.movementPattern || inferMovementPattern(exercise.name),
    goal: G.profile?.goal || 'get_fit',
    equipment: G.profile?.equipment || 'calisthenics',
    date: todayKey,
    completedAt: new Date().toISOString(),
  });
  saveExerciseHistory();
}

// ════════════════════════════ NAV ════════════════════════════
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  ['hq','plan','schedule','guild','kitchen','settings'].forEach(k => {
    if (k === id) {
      document.getElementById('ni-' + k)?.classList.add('active');
      document.getElementById('bni-' + k)?.classList.add('active');
    }
  });
  if (id === 'hq') refreshHQ();
  if (id === 'plan') renderPlan();
  if (id === 'settings') populateSettings();
  if (id === 'schedule') renderScheduleScreen();
  if (id === 'guild') renderGuildScreen();
}

// ════════════════════════════ QUIZ ════════════════════════════
let step = 0;
function pick(el, key, val) {
  el.closest('.choices').querySelectorAll('.choice').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel'); G.picks[key] = val;
  // Show gym prompt hint when full/minimal gym chosen
  if (key === 'equipment') {
    const prompt = document.getElementById('find-gym-prompt');
    if (prompt) prompt.style.display = (val === 'full_gym' || val === 'minimal_gym') ? 'block' : 'none';
  }
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
  const bodyType = mapLegacyBodyType(document.getElementById('f-body-type').value || 'average');
  const days = +document.getElementById('f-days').value || 4;
  const patternMode = document.getElementById('f-pattern-mode')?.value === 'strict' ? 'strict' : 'flexible';
  const buildMuscleSplit = document.getElementById('f-build-muscle-split')?.value || 'classic';
  const activity = G.picks.activity || 'moderate';
  const goal = G.picks.goal || 'get_fit';
  const selectedPhase = document.getElementById('f-phase').value || 'auto';
  const physiquePhase = selectedPhase === 'auto'
    ? inferPhysiquePhaseByBodyType(goal, bodyType)
    : selectedPhase;
  const diet = G.picks.diet || 'no_restriction';
  const calisthenicsLevel = document.getElementById('f-calisthenics-level').value || 'beginner';
  const sessionMinutes = +document.getElementById('f-session-minutes').value || 45;
  const preferredWindow = document.getElementById('f-training-window').value || 'evening';
  const autoWindowFromSchedule = !!document.getElementById('f-auto-window')?.checked;
  const selectedCountry = String(document.getElementById('f-country')?.value || '').toUpperCase();
  const country = isValidCountryCode(selectedCountry)
    ? selectedCountry
    : (getStoredHolidayCountry() || detectLocaleCountryCode() || 'US');
  // Initial environment is sourced from the intro quiz answer.
  const equipment = normalizeEquipmentKey(G.picks.equipment || 'calisthenics');
  G.profile = computeProfileTargets({
    name,
    age,
    weight,
    height,
    target,
    gender,
    bodyType,
    physiquePhase,
    days,
    patternMode,
    buildMuscleSplit,
    goal,
    activity,
    diet,
    equipment,
    calisthenicsLevel,
    sessionMinutes,
    preferredWindow,
    autoWindowFromSchedule,
    country,
  });
  localStorage.setItem('vq_profile', JSON.stringify(G.profile));
  setStoredHolidayCountry(country);
  G.today.weight = weight; saveToday();
  showNav();
  updateNavBar();
  showToast('⚔️ Quest begins! Your journey starts now.');
  initPedometer();
  go('hq');
}

// ════════════════════════════ NAV BAR ════════════════════════════
function showNav() {
  document.getElementById('top-nav').style.display = 'flex';
  document.getElementById('bottom-nav').classList.add('nav-ready');
  const sageFab = document.getElementById('sage-fab');
  if (sageFab) sageFab.style.display = 'inline-flex';
}
function updateNavBar() {
  if (!G.profile) return;
  document.getElementById('plan-streak').textContent = G.streak;
}

// ════════════════════════════ DASHBOARD ════════════════════════════
function refreshHQ() {
  const p = G.profile; const t = G.today;
  if (!p) return;
  updateNavBar();
  document.getElementById('hq-name').textContent = p.name;
  document.getElementById('hq-class').textContent = CLASSES[p.goal] + ' · Level ' + getLevel();
  document.getElementById('hq-avatar').textContent = getHeroIcon(p.goal);
  const normalizedEquipment = normalizeEquipmentKey(p.equipment);
  const eqInfo = EQUIP_LABELS[normalizedEquipment] || EQUIP_LABELS.calisthenics;
  const scheduleContext = getScheduleInsights(p);
  const effectiveWindowKey = getEffectiveTrainingWindowKey(p, scheduleContext);
  const levelTag = ['calisthenics', 'home_equipped', 'outdoor'].includes(normalizedEquipment) ? `${CALISTHENICS_LEVEL_LABELS[p.calisthenicsLevel]} calisthenics` : null;
  document.getElementById('hq-profile-line').textContent = [
    getPhaseLabel(p.physiquePhase),
    `${p.days} days/week`,
    `${p.sessionMinutes} min ${getTrainingWindowLabel(effectiveWindowKey).toLowerCase()}${p.autoWindowFromSchedule ? ' (auto)' : ''}`,
    eqInfo.label,
    levelTag,
  ].filter(Boolean).join(' · ');

  const guildStatus = document.getElementById('hq-guild-status');
  const guildName = document.getElementById('hq-guild-name');
  const guildMeta = document.getElementById('hq-guild-meta');
  const guildTags = document.getElementById('hq-guild-tags');
  const guildButton = document.getElementById('hq-guild-manage-btn');
  if (G.selectedGym) {
    guildStatus.textContent = 'Affiliated';
    guildName.textContent = G.selectedGym.name;
    guildMeta.textContent = `${G.selectedGym.address || 'Guild address unavailable'}${G.selectedGym.distance_km ? ' · ' + G.selectedGym.distance_km + ' km away' : ''}`;
    guildTags.innerHTML = `
      <span class="hq-guild-tag ${G.selectedGym.is_open ? 'open' : 'closed'}">${G.selectedGym.is_open ? 'Open now' : 'Closed'}</span>
      <span class="hq-guild-tag neutral">${G.selectedGym.type || 'Gym'}</span>
      <span class="hq-guild-tag neutral">Current setup: ${eqInfo.label}</span>`;
    guildButton.textContent = 'Manage Guild';
  } else {
    guildStatus.textContent = 'Independent';
    guildName.textContent = 'No active guild selected';
    guildMeta.textContent = `Currently training in ${eqInfo.label.toLowerCase()}. Choose a guild any time if you want gym-based suggestions.`;
    guildTags.innerHTML = `<span class="hq-guild-tag neutral">Current setup: ${eqInfo.label}</span>`;
    guildButton.textContent = 'Choose Guild';
  }

  const xpPct = getXPInLevel();
  const stepGoal = p.goal === 'lose_weight' ? 12000 : p.goal === 'improve_health' ? 8000 : 10000;
  const calBurned = estimateCalBurned(t.steps, p);
  const calBurnGoal = p.goal === 'lose_weight' ? 500 : p.goal === 'build_muscle' ? 300 : 400;

  setBar('xp-bar', xpPct); document.getElementById('xp-val').textContent = getXPInLevel() + '/100';
  setBar('agi-bar', Math.min(t.steps/stepGoal*100,100));
  document.getElementById('agi-val').textContent = t.steps.toLocaleString() + ' / ' + stepGoal.toLocaleString();
  setBar('cals-bar', Math.min(t.cals/p.calories*100,100));
  document.getElementById('cals-bar-val').textContent = t.cals + ' / ' + p.calories + ' kcal';

  document.getElementById('st-steps').textContent = t.steps.toLocaleString();
  document.getElementById('st-steps-unit').textContent = G.sensorActive ? '📡 live sensor' : 'tap to activate';
  document.getElementById('st-cals-burned').textContent = calBurned;
  document.getElementById('st-cals').textContent = t.cals;
  document.getElementById('st-wo').textContent = t.wo;
  document.getElementById('st-wo-label').textContent = 'of ' + p.days + ' goal';
  setBar('stb-steps', Math.min(t.steps/stepGoal*100,100));
  setBar('stb-cals-burned', Math.min(calBurned/calBurnGoal*100,100));
  setBar('stb-cals', Math.min(t.cals/p.calories*100,100));
  setBar('stb-wo', Math.min(t.wo/p.days*100,100));

  const quests = getDailyQuests(p);
  // Auto-complete quests when progress reaches 100%
  quests.forEach(q => {
    if (!t.questsDone.includes(q.id) && q.progress() >= 100) {
      t.questsDone.push(q.id);
      G.xp += q.xpVal;
      saveXP(); saveToday();
      showToast(`✅ Quest complete! +${q.xpVal} XP`);
      updateNavBar();
    }
  });
  document.getElementById('daily-quests').innerHTML = quests.map(q => {
    const done = t.questsDone.includes(q.id);
    const prog = Math.min(q.progress(), 100);
    const badge = done
      ? `<div class="quest-xp quest-done-badge">✅ Done</div>`
      : `<div class="quest-xp">+${q.xpVal} XP</div>`;
    return `<div class="quest-card ${done?'completed':''} non-interactive">
      <div class="quest-top"><div class="quest-icon">${q.icon}</div>${badge}</div>
      <div class="quest-name">${q.name}</div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-prog"><div class="quest-prog-fill" style="width:${prog}%"></div></div>
    </div>`;
  }).join('');

  // Equipment badge + workouts
  const eq = normalizedEquipment;
  document.getElementById('hq-equip-badge').innerHTML = `<button class="equip-badge hq-env-button ${eqInfo.cls}" onclick="go('guild')">${eqInfo.icon} ${eqInfo.label}<span>Change</span></button>`;
  const ws = getWorkouts(p.goal, eq, p, scheduleContext);
  document.getElementById('hq-workouts').innerHTML = ws.map(w => `
    <div class="workout-entry">
      <div class="we-icon" style="background:${w.bg}">${w.icon}</div>
      <div style="flex:1"><div class="we-name">${w.name}</div><div class="we-meta">${w.dur} · ${w.sets}</div></div>
      <div class="we-reward">${w.xp} XP</div>
    </div>`).join('');

  renderAchievements();
}

function setBar(id, pct) { const el = document.getElementById(id); if(el) el.style.width = Math.max(0,Math.min(100,pct)) + '%'; }

function getDailyQuests(p) {
  const t = G.today;
  const stepGoal = p.goal === 'lose_weight' ? 12000 : p.goal === 'improve_health' ? 8000 : 10000;
  const calBurned = estimateCalBurned(t.steps, p);
  const calBurnGoal = p.goal === 'lose_weight' ? 500 : p.goal === 'build_muscle' ? 300 : 400;
  return [
    { id:'steps', icon:'👟', name:`${stepGoal.toLocaleString()} Steps`, desc: G.sensorActive ? '📡 Live from your device pedometer' : 'Grant motion access to track automatically', xpVal:25, progress:() => t.steps / stepGoal * 100 },
    { id:'cals_burned', icon:'🔥', name:`Burn ${calBurnGoal} kcal`, desc:`Estimated from steps · ${calBurned} kcal burned so far`, xpVal:20, progress:() => calBurned / calBurnGoal * 100 },
    { id:'calories', icon:'🍽️', name:'Hit Calorie Target', desc:`Log meals to reach ${p.calories} kcal · ${t.cals} logged so far`, xpVal:20, progress:() => t.cals / p.calories * 100 },
    { id:'workout', icon:'⚔️', name:'Complete Training', desc:"Finish today's workout session", xpVal:35, progress:() => t.wo > 0 ? 100 : 0 },
  ];
}

function estimateCalBurned(steps, p) {
  return Math.round(steps * 0.04 * ((p?.weight || 70) / 70));
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
  saveToday(); saveXP(); closeModal();
  showToast('📊 Stats logged'); updateNavBar(); refreshHQ();
}

function shouldUseCalisthenicsProgression(equipment, profile) {
  return ['calisthenics', 'home_equipped', 'outdoor'].includes(normalizeEquipmentKey(equipment)) && !!profile;
}
function adjustExerciseNameForLevel(name, level) {
  const rules = {
    beginner: [
      [/Pike Push-ups?/i, 'Box Pike Push-ups'],
      [/Push-ups?/i, 'Incline Push-ups'],
      [/Pull-ups?/i, 'Australian Rows'],
      [/Dips?/i, 'Bench Dips'],
      [/Pistol Squat Practice/i, 'Assisted Split Squat'],
      [/Jump Squats?/i, 'Tempo Squats'],
      [/Burpees?/i, 'Squat Thrusts'],
      [/High Knees/i, 'Marching High Knees'],
      [/Mountain Climbers/i, 'Slow Mountain Climbers'],
      [/Plank/i, 'Knee Plank'],
      [/Pseudo Planche/i, 'Planche Lean Hold'],
      [/Sprint Intervals/i, 'Run-Walk Intervals'],
      [/Hill Runs/i, 'Brisk Hill Walk'],
    ],
    advanced: [
      [/Pike Push-ups?/i, 'Wall Pike Push-ups'],
      [/Wide Push-ups?/i, 'Archer Push-ups'],
      [/Push-ups?/i, 'Decline Push-ups'],
      [/Pull-ups?/i, 'Chest-to-Bar Pull-ups'],
      [/Dips?/i, 'Straight-Bar Dips'],
      [/Reverse Lunges/i, 'Jump Lunges'],
      [/Plank/i, 'RKC Plank'],
      [/Burpees?/i, 'Burpee Broad Jumps'],
    ],
  };
  const selectedRules = rules[level] || [];
  for (const [pattern, replacement] of selectedRules) {
    if (pattern.test(name)) return name.replace(pattern, replacement);
  }
  return name;
}
function adjustRestLabelByFactor(rest, factor) {
  const value = String(rest || '').trim();
  if (!value || value === '—') return value || '—';
  const secScaled = value.replace(/(\d+)\s*s\b/i, (match, digits) => `${Math.max(20, Math.round(parseInt(digits, 10) * factor))}s`);
  if (secScaled !== value) return secScaled;
  return value.replace(/(\d+)\s*min\b/i, (match, digits) => `${Math.max(1, Math.round(parseInt(digits, 10) * factor))} min`);
}
function getWorkoutCardLimit(minutes) {
  if (minutes <= 25) return 2;
  if (minutes <= 40) return 2;
  return 3;
}
function getExerciseItemLimit(minutes, level) {
  if (minutes <= 25) return 3;
  if (minutes <= 40) return level === 'beginner' ? 3 : 4;
  if (level === 'beginner') return 4;
  return 5;
}
function getScheduleAwareMinutes(profile, scheduleContext) {
  const preferred = clampNumber(profile?.sessionMinutes, 20, 90, 45);
  if (!scheduleContext?.hasSchedule) return preferred;
  if (scheduleContext.todayWindow) return Math.max(20, Math.min(preferred, scheduleContext.todayAvailableMinutes));
  return Math.max(20, Math.min(preferred, 25));
}
function adaptWorkoutCardsForProfile(items, profile, equipment, scheduleContext) {
  const level = profile?.calisthenicsLevel || 'beginner';
  const effectiveMinutes = getScheduleAwareMinutes(profile, scheduleContext);
  return items
    .slice(0, getWorkoutCardLimit(effectiveMinutes))
    .map(item => ({
      ...item,
      name: shouldUseCalisthenicsProgression(equipment, profile) ? adjustExerciseNameForLevel(item.name, level) : item.name,
    }));
}
function adaptExercisesForProfile(items, profile, equipment, scheduleContext = null) {
  const level = profile?.calisthenicsLevel || 'beginner';
  const effectiveMinutes = getScheduleAwareMinutes(profile, scheduleContext);
  const levelFactor = level === 'beginner' ? 0.82 : level === 'advanced' ? 1.12 : 1;
  const timeFactor = effectiveMinutes <= 25 ? 0.72 : effectiveMinutes <= 40 ? 0.88 : effectiveMinutes >= 75 ? 1.12 : effectiveMinutes >= 60 ? 1.04 : 1;
  const restFactor = level === 'beginner' ? 1.15 : level === 'advanced' ? 0.9 : 1;
  const usesProgression = shouldUseCalisthenicsProgression(equipment, profile);
  const maxItems = getExerciseItemLimit(effectiveMinutes, level);
  const combinedFactor = levelFactor * timeFactor;

  return {
    effectiveMinutes,
    usesProgression,
    level,
    timeAdjusted: !!scheduleContext?.hasSchedule && effectiveMinutes < clampNumber(profile?.sessionMinutes, 20, 90, 45),
    items: items.slice(0, maxItems).map(exercise => ({
      ...exercise,
      name: usesProgression ? adjustExerciseNameForLevel(exercise.name, level) : exercise.name,
      sets: scalePrimaryCount(exercise.sets, combinedFactor),
      rest: adjustRestLabelByFactor(exercise.rest, restFactor),
      xp: Math.max(6, Math.round((exercise.xp || 10) * (timeFactor < 1 ? timeFactor + 0.08 : combinedFactor))),
    })),
  };
}

// ════════════════════════════ EQUIPMENT-AWARE EXERCISES ════════════════════════════
function getWorkouts(goal, equipment, profile = null, scheduleContext = null) {
  const eq = equipment || 'calisthenics';
  const base = {
    lose_weight: {
      full_gym:      [{icon:'🔥',name:'Barbell Complex',dur:'35 min',sets:'5 rounds',xp:'+35',bg:'#fb923c18'},{icon:'🏃',name:'Treadmill HIIT',dur:'20 min',sets:'10×1 min',xp:'+25',bg:'#fb923c10'},{icon:'🧘',name:'Core Circuit',dur:'15 min',sets:'3 rounds',xp:'+15',bg:'#4ade8010'}],
      minimal_gym:   [{icon:'🔥',name:'Dumbbell HIIT',dur:'30 min',sets:'4 rounds',xp:'+30',bg:'#fb923c18'},{icon:'🏃',name:'Jump Rope',dur:'15 min',sets:'10×1 min',xp:'+20',bg:'#fb923c10'},{icon:'🧘',name:'Core & Stretch',dur:'15 min',sets:'Flow',xp:'+10',bg:'#4ade8010'}],
      home_equipped: [{icon:'🔥',name:'Band HIIT Circuit',dur:'30 min',sets:'4 rounds',xp:'+30',bg:'#fb923c18'},{icon:'🏋️',name:'DB Thrusters',dur:'20 min',sets:'3×15',xp:'+20',bg:'#fb923c10'},{icon:'🧘',name:'Yoga Core',dur:'15 min',sets:'Flow',xp:'+10',bg:'#4ade8010'}],
      calisthenics:  [{icon:'🔥',name:'Burpee Circuit',dur:'25 min',sets:'5 rounds',xp:'+30',bg:'#fb923c18'},{icon:'🏃',name:'Mountain Climbers',dur:'15 min',sets:'4×45s',xp:'+20',bg:'#fb923c10'},{icon:'🧘',name:'Plank Progression',dur:'12 min',sets:'3×60s',xp:'+10',bg:'#4ade8010'}],
      outdoor:       [{icon:'🏃',name:'Interval Run',dur:'30 min',sets:'6×3 min',xp:'+35',bg:'#fb923c18'},{icon:'🌳',name:'Park Circuit',dur:'20 min',sets:'3 rounds',xp:'+25',bg:'#4ade8010'},{icon:'🚴',name:'Bike Sprints',dur:'20 min',sets:'8×1 min',xp:'+20',bg:'#fb923c10'}],
    },
    build_muscle: {
      full_gym:      [{icon:'💪',name:'Bench Press',dur:'40 min',sets:'4×8-10',xp:'+35',bg:'#60a5fa18'},{icon:'🏋️',name:'Barbell Rows',dur:'30 min',sets:'4×8',xp:'+30',bg:'#60a5fa10'},{icon:'🦵',name:'Squats',dur:'35 min',sets:'4×10',xp:'+35',bg:'#a78bfa10'}],
      minimal_gym:   [{icon:'💪',name:'DB Chest Press',dur:'35 min',sets:'4×10',xp:'+30',bg:'#60a5fa18'},{icon:'🏋️',name:'DB Rows',dur:'30 min',sets:'4×10',xp:'+28',bg:'#60a5fa10'},{icon:'🦵',name:'Goblet Squats',dur:'30 min',sets:'4×12',xp:'+28',bg:'#a78bfa10'}],
      home_equipped: [{icon:'💪',name:'Push-up Variations',dur:'30 min',sets:'4×15',xp:'+28',bg:'#60a5fa18'},{icon:'🏋️',name:'Band Rows',dur:'25 min',sets:'4×12',xp:'+25',bg:'#60a5fa10'},{icon:'🦵',name:'Bulgarian Split Squat',dur:'30 min',sets:'3×12 ea',xp:'+28',bg:'#a78bfa10'}],
      calisthenics:  [{icon:'💪',name:'Push-up Progressions',dur:'30 min',sets:'5×12',xp:'+28',bg:'#60a5fa18'},{icon:'🏋️',name:'Pull-up Ladder',dur:'25 min',sets:'10→1',xp:'+30',bg:'#60a5fa10'},{icon:'🦵',name:'Pistol Squat Practice',dur:'25 min',sets:'3×8 ea',xp:'+25',bg:'#a78bfa10'}],
      outdoor:       [{icon:'💪',name:'Bar Push-ups',dur:'30 min',sets:'5×12',xp:'+25',bg:'#60a5fa18'},{icon:'🏋️',name:'Park Pull-ups',dur:'25 min',sets:'5×8',xp:'+30',bg:'#60a5fa10'},{icon:'🦵',name:'Step-up Lunges',dur:'25 min',sets:'4×10 ea',xp:'+22',bg:'#a78bfa10'}],
    },
    get_fit: {
      full_gym:      [{icon:'⚡',name:'Full Body Circuit',dur:'40 min',sets:'4 rounds',xp:'+35',bg:'#f5c84218'},{icon:'🏃',name:'Stairmaster',dur:'20 min',sets:'Steady',xp:'+20',bg:'#fb923c10'},{icon:'🤸',name:'Mobility Flow',dur:'15 min',sets:'Sequence',xp:'+15',bg:'#4ade8010'}],
      minimal_gym:   [{icon:'⚡',name:'DB Full Body',dur:'35 min',sets:'3 rounds',xp:'+30',bg:'#f5c84218'},{icon:'🏃',name:'Jump Rope',dur:'15 min',sets:'Continuous',xp:'+15',bg:'#fb923c10'},{icon:'🤸',name:'Stretch Routine',dur:'15 min',sets:'Flow',xp:'+10',bg:'#4ade8010'}],
      home_equipped: [{icon:'⚡',name:'Resistance Band Circuit',dur:'35 min',sets:'3 rounds',xp:'+28',bg:'#f5c84218'},{icon:'🤸',name:'Mobility & Flex',dur:'20 min',sets:'Sequence',xp:'+15',bg:'#4ade8010'}],
      calisthenics:  [{icon:'⚡',name:'Bodyweight Circuit',dur:'35 min',sets:'3 rounds',xp:'+28',bg:'#f5c84218'},{icon:'🤸',name:'Mobility Flow',dur:'20 min',sets:'Sequence',xp:'+15',bg:'#4ade8010'}],
      outdoor:       [{icon:'⚡',name:'Trail Run',dur:'30 min',sets:'Easy pace',xp:'+30',bg:'#f5c84218'},{icon:'🌳',name:'Outdoor Circuit',dur:'25 min',sets:'3 rounds',xp:'+25',bg:'#4ade8010'}],
    },
    improve_health: {
      full_gym:      [{icon:'🚶',name:'Incline Walk',dur:'30 min',sets:'Steady',xp:'+20',bg:'#4ade8018'},{icon:'🧘',name:'Yoga Flow',dur:'25 min',sets:'3 seq.',xp:'+20',bg:'#a78bfa10'}],
      minimal_gym:   [{icon:'🚶',name:'Treadmill Walk',dur:'30 min',sets:'Steady',xp:'+20',bg:'#4ade8018'},{icon:'🧘',name:'Stretch & Relax',dur:'20 min',sets:'Flow',xp:'+15',bg:'#a78bfa10'}],
      home_equipped: [{icon:'🚶',name:'Brisk Walk',dur:'30 min',sets:'Outdoors',xp:'+20',bg:'#4ade8018'},{icon:'🧘',name:'Band Mobility',dur:'20 min',sets:'Flow',xp:'+15',bg:'#a78bfa10'}],
      calisthenics:  [{icon:'🚶',name:'Brisk Walk',dur:'30 min',sets:'Steady',xp:'+20',bg:'#4ade8018'},{icon:'🧘',name:'Yoga Flow',dur:'25 min',sets:'3 seq.',xp:'+20',bg:'#a78bfa10'}],
      outdoor:       [{icon:'🚶',name:'Nature Walk',dur:'40 min',sets:'Easy',xp:'+25',bg:'#4ade8018'},{icon:'🧘',name:'Outdoor Yoga',dur:'20 min',sets:'Flow',xp:'+20',bg:'#a78bfa10'}],
    },
  };
  const goalData = base[goal] || base.get_fit;
  return adaptWorkoutCardsForProfile(goalData[eq] || goalData.calisthenics, profile, eq, scheduleContext);
}

function getExercises(goal, equipment, profile = null, scheduleContext = null) {
  const eq = equipment || 'calisthenics';

  // build_muscle uses a per-day muscle-group split
  if (goal === 'build_muscle') {
    const dayType = getTodayMuscleGroup('build_muscle', profile) || 'Chest';
    const muscleGroup = resolveBuildMuscleExerciseGroup(dayType);
    const splitDb = BUILD_MUSCLE_SPLIT[muscleGroup] || BUILD_MUSCLE_SPLIT.Chest;
    const exercises = (splitDb[eq] || splitDb.calisthenics).map(createExerciseEntry);
    return adaptExercisesForProfile(exercises, profile, eq, scheduleContext);
  }

  const m = {
    lose_weight: {
      full_gym:      [{name:'Barbell Deadlift',sets:'4×8',rest:'90s',xp:14},{name:'Cable Rows',sets:'4×12',rest:'60s',xp:10},{name:'Leg Press',sets:'4×15',rest:'60s',xp:10},{name:'Treadmill Intervals',sets:'10×1 min',rest:'1 min',xp:15},{name:'Plank',sets:'3×60s',rest:'30s',xp:7}],
      minimal_gym:   [{name:'DB Thrusters',sets:'3×12',rest:'60s',xp:12},{name:'Renegade Rows',sets:'3×10',rest:'60s',xp:10},{name:'DB Jump Squats',sets:'3×15',rest:'45s',xp:10},{name:'Burpees',sets:'3×12',rest:'45s',xp:12},{name:'DB Russian Twist',sets:'3×20',rest:'30s',xp:7}],
      home_equipped: [{name:'Band Squat Jump',sets:'3×15',rest:'45s',xp:10},{name:'Push-ups',sets:'3×15',rest:'45s',xp:8},{name:'Band Pull-Apart',sets:'3×20',rest:'30s',xp:7},{name:'Mountain Climbers',sets:'3×30',rest:'30s',xp:10},{name:'Plank',sets:'3×45s',rest:'30s',xp:7}],
      calisthenics:  [{name:'Burpees',sets:'3×12',rest:'45s',xp:12},{name:'Jump Squats',sets:'3×15',rest:'45s',xp:10},{name:'Mountain Climbers',sets:'3×30',rest:'30s',xp:10},{name:'High Knees',sets:'3×30',rest:'30s',xp:8},{name:'Plank',sets:'3×45s',rest:'30s',xp:7}],
      outdoor:       [{name:'Sprint Intervals',sets:'6×100m',rest:'90s',xp:14},{name:'Hill Runs',sets:'5 reps',rest:'2 min',xp:15},{name:'Park Bench Step-ups',sets:'3×20',rest:'45s',xp:10},{name:'Bear Crawl',sets:'3×20m',rest:'60s',xp:10}],
    },
    get_fit: {
      full_gym:      [{name:'Squat Rack Squats',sets:'3×15',rest:'60s',xp:10},{name:'Cable Rows',sets:'3×12',rest:'60s',xp:10},{name:'Leg Press',sets:'3×15',rest:'60s',xp:10},{name:'Lat Pulldown',sets:'3×12',rest:'60s',xp:10},{name:'Core Circuit',sets:'3 rounds',rest:'30s',xp:10}],
      minimal_gym:   [{name:'DB Squats',sets:'3×15',rest:'45s',xp:10},{name:'DB Rows',sets:'3×12 ea',rest:'45s',xp:10},{name:'DB Lunges',sets:'3×12 ea',rest:'45s',xp:10},{name:'Push-ups',sets:'3×12',rest:'45s',xp:10},{name:'Plank',sets:'3×30s',rest:'30s',xp:7}],
      home_equipped: [{name:'Band Squats',sets:'3×15',rest:'45s',xp:10},{name:'Band Rows',sets:'3×15',rest:'45s',xp:10},{name:'Push-ups',sets:'3×12',rest:'45s',xp:8},{name:'Reverse Lunges',sets:'3×12 ea',rest:'45s',xp:10},{name:'Plank',sets:'3×30s',rest:'30s',xp:7}],
      calisthenics:  [{name:'Bodyweight Squats',sets:'3×15',rest:'45s',xp:10},{name:'Push-ups',sets:'3×12',rest:'45s',xp:10},{name:'Reverse Lunges',sets:'3×12 ea',rest:'45s',xp:10},{name:'Pike Push-ups',sets:'3×10',rest:'45s',xp:10},{name:'Plank',sets:'3×30s',rest:'30s',xp:7}],
      outdoor:       [{name:'Trail Run',sets:'30 min',rest:'—',xp:20},{name:'Park Squats',sets:'3×15',rest:'45s',xp:10},{name:'Push-ups',sets:'3×12',rest:'45s',xp:10},{name:'Step-ups',sets:'3×15 ea',rest:'45s',xp:10}],
    },
    improve_health: {
      full_gym:      [{name:'Brisk Walk (treadmill)',sets:'30 min',rest:'—',xp:20},{name:'Light Squats',sets:'2×10',rest:'60s',xp:10},{name:'Cable Rows',sets:'2×12',rest:'60s',xp:10},{name:'Stretching Routine',sets:'10 min',rest:'—',xp:10}],
      minimal_gym:   [{name:'Brisk Walk',sets:'30 min',rest:'—',xp:20},{name:'DB Squats',sets:'2×10',rest:'60s',xp:10},{name:'DB Rows',sets:'2×12',rest:'60s',xp:10}],
      home_equipped: [{name:'Brisk Walk',sets:'30 min',rest:'—',xp:20},{name:'Band Squats',sets:'2×10',rest:'60s',xp:10},{name:'Sun Salutation',sets:'5 rounds',rest:'—',xp:15}],
      calisthenics:  [{name:'Brisk Walk',sets:'30 min',rest:'—',xp:20},{name:'Squats',sets:'2×10',rest:'60s',xp:10},{name:'Band Rows',sets:'2×12',rest:'60s',xp:10},{name:'Sun Salutation',sets:'5 rounds',rest:'—',xp:15}],
      outdoor:       [{name:'Nature Walk',sets:'40 min',rest:'—',xp:25},{name:'Light Jog',sets:'15 min',rest:'—',xp:15},{name:'Outdoor Stretching',sets:'10 min',rest:'—',xp:10}],
    },
  };
  const goalData = m[goal] || m.get_fit;
  const adapted = adaptExercisesForProfile((goalData[eq] || goalData.calisthenics).map(createExerciseEntry), profile, eq, scheduleContext);
  return adapted;
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
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayI = new Date().getDay();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  document.getElementById('plan-week').innerHTML = days.map((d,i) => `
    ${(() => {
      const dateObj = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
      const dateISO = toISODate(dateObj);
      const dayType = getPlanTypeForDate(p.goal, dateISO, p) || '';
      return `<div class="plan-day ${i===todayI?'today':''} ${G.today.wo>0&&i===todayI?'done':''}">
      <div class="pd-name">${d}</div>
      <div class="pd-num">${dateObj.getDate()}</div>
      <div class="pd-badge ${PLAN_DAY_COLORS[dayType]||''}">${dayType}</div>
    </div>`;
    })()}
    `).join('');

  const equipmentView = getEffectiveEquipmentForPlan(p);
  const eq = equipmentView.effectiveEquipment;
  const eqInfo = EQUIP_LABELS[eq] || EQUIP_LABELS.calisthenics;
  const profileForPlan = { ...p, equipment: eq };
  const examContext = getUpcomingExamContext();
  const scheduleContext = getScheduleInsights(profileForPlan);
  const planSnapshot = getPlanSnapshot(profileForPlan, examContext, scheduleContext);
  const reminder = equipmentView.reminder;
  const renewalNote = reminder?.latest?.note ? escapeHtml(reminder.latest.note) : 'Membership renewal reminder';
  const renewalDate = reminder?.latest?.date ? escapeHtml(reminder.latest.date) : '';
  const membershipHint = equipmentView.suggestHome
    ? `<div style="margin-bottom:10px;padding:10px 12px;border-radius:10px;border:1px solid #f8717140;background:#f8717110;color:var(--muted2);font-size:0.74rem;line-height:1.5">⚠️ Gym membership reminder date (${renewalDate}) has passed (${Math.abs(reminder.daysDelta)} day(s) ago). Suggesting <b>Home (Equipped)</b> workouts for now.<div style="margin-top:8px"><button class="planner-btn" onclick="setEquipment('home_equipped')">Use Home Setup</button></div><div style="margin-top:6px;color:var(--muted)">${renewalNote}</div></div>`
    : '';
  const examHint = planSnapshot.examAdjusted && planSnapshot.examContext?.active
    ? `<div style="margin-top:8px;padding:10px 12px;border-radius:10px;border:1px solid #fb923c50;background:#fb923c12;color:var(--muted2);font-size:0.74rem;line-height:1.5">📝 Exam mode active: ${planSnapshot.examContext.count} upcoming exam event(s), nearest in ${planSnapshot.examContext.nearestDays} day(s). Today's plan is shortened to keep momentum while your schedule is busy.</div>`
    : '';
  document.getElementById('plan-equip-badge').innerHTML = `
    <button class="equip-badge hq-env-button ${eqInfo.cls}" style="margin-bottom:8px" onclick="togglePlanEnvironmentPicker()">${eqInfo.icon} ${eqInfo.label}<span>Change</span></button>
    ${membershipHint}
    <div class="plan-adapt-note">${planSnapshot.adapted ? 'Using your recent completed quests to avoid repeating the same movement patterns and muscle focus in this new setup.' : planSnapshot.hasRecentOverlap ? 'Recent completed quests were found, but this setup still needs a small amount of overlap.' : 'No recent overlap detected, so you are getting the full environment-specific plan.'}${planSnapshot.usesProgression ? ` Your ${CALISTHENICS_LEVEL_LABELS[planSnapshot.progressionLevel]} calisthenics level is also shaping the exercise progression.` : ''}</div>
    ${examHint}`;
  renderPlanEnvironmentPicker();
  const picker = document.getElementById('plan-env-picker');
  if (picker) picker.style.display = 'none';

  // Update training title to show the muscle group for build_muscle
  const trainingTitleEl = document.getElementById('plan-training-title');
  if (trainingTitleEl) {
    const muscleGroup = getTodayMuscleGroup(p.goal);
    trainingTitleEl.textContent = muscleGroup && muscleGroup !== 'Rest'
      ? `Today's Training — ${muscleGroup} Day`
      : muscleGroup === 'Rest' ? "Today's Training — Rest Day" : "Today's Training";
  }

  const macroSummary = document.getElementById('macro-summary');
  if (macroSummary) {
    macroSummary.innerHTML = `<div class="macro-pill macro-phase">${getPhaseLabel(p.physiquePhase)}</div><div class="macro-pill">🔥 ${p.calories} kcal</div><div class="macro-pill">💪 ${p.protein}g protein</div><div class="macro-pill">🍚 ${p.carbs}g carbs</div><div class="macro-pill">🥑 ${p.fat}g fat</div>`;
  }

  document.getElementById('plan-exercises').innerHTML = planSnapshot.items.map((e,i) => `
    <div class="exercise-row ${G.today.completedExercises.includes(e.key) ? 'done-ex' : ''}" id="ex-${e.key}" onclick="doneExercise('${e.key}',${e.xp})">
      <div class="ex-num-badge">${i+1}</div>
      <div class="ex-info"><div class="ex-name-g">${e.name}</div><div class="ex-meta-g">${e.sets} · ${e.rest}</div></div>
      <div class="ex-xp-badge">+${e.xp}XP</div>
      <button class="complete-btn">Done</button>
    </div>`).join('');
}

function doneExercise(exerciseKey, xpVal) {
  const el = document.getElementById('ex-' + exerciseKey);
  if (!el || G.today.completedExercises.includes(exerciseKey)) return;
  const exercise = G.today.planSnapshot?.items?.find(item => item.key === exerciseKey);
  if (!exercise) return;
  el.classList.add('done-ex');
  G.today.completedExercises.push(exerciseKey);
  G.today.wo = Math.max(G.today.wo, 1);
  saveToday();
  recordCompletedExercise(exercise);
  G.xp += xpVal; saveXP(); updateNavBar();
  showToast(`💪 Exercise done! +${xpVal} XP`);
}

function normalizeDemoMuscleLabel(primaryMuscle) {
  const value = String(primaryMuscle || '').toLowerCase();
  if (/chest|pec/.test(value)) return 'chest';
  if (/back|lat/.test(value)) return 'back';
  if (/shoulder|delt/.test(value)) return 'shoulders';
  if (/arm|bicep|tricep|forearm/.test(value)) return 'arms';
  if (/leg|quad|ham|glute|calf/.test(value)) return 'legs';
  if (/core|abs|oblique/.test(value)) return 'core';
  return 'core';
}

function getDemoTargetLabel(exerciseName, demoMuscle) {
  const name = String(exerciseName || '').toLowerCase();
  if (/face pull|rear delt|reverse fly/.test(name)) return 'rear delts (shoulders)';
  return demoMuscle;
}

function inferMachineGuide(exerciseName, equipment) {
  const name = String(exerciseName || '').toLowerCase();
  const eq = String(equipment || 'calisthenics');

  if (/lat pulldown/.test(name)) {
    return {
      machine: 'Lat Pulldown Machine\nSeat pad snug over thighs, chest up, slight lean back.',
      howTo: 'Grip just outside shoulder width. Pull bar to upper chest. Pause 1s, return slowly in 2-3s. Keep elbows driving down, not back.',
    };
  }
  if (/seated cable row|cable row/.test(name)) {
    return {
      machine: 'Seated Cable Row\nFeet planted, neutral spine, chest tall.',
      howTo: 'Row handle toward lower ribs. Squeeze shoulder blades at the back. Control the reach forward without rounding your lower back.',
    };
  }
  if (/leg press/.test(name)) {
    return {
      machine: 'Leg Press\nFeet shoulder-width, mid-platform. Lower with control until knees are near 90°.',
      howTo: 'Drive through mid-foot and heel. Avoid locking knees hard at top. Keep hips and lower back glued to the pad.',
    };
  }
  if (/bench press|chest press/.test(name)) {
    return {
      machine: 'Bench or Chest Press Machine\nSet seat so handles align with mid-chest.',
      howTo: 'Lower under control, elbows around 45-70° from torso, press up while keeping shoulder blades stable against bench/pad.',
    };
  }
  if (/tricep pushdown/.test(name)) {
    return {
      machine: 'Cable Pushdown Station\nElbows fixed at sides, torso tall.',
      howTo: 'Press bar/rope down until elbows extend, then return slowly. Keep shoulders down and avoid swinging.',
    };
  }
  if (/shoulder press|ohp|overhead press/.test(name)) {
    return {
      machine: 'Shoulder Press Machine\nSeat height so handles start around ear level.',
      howTo: 'Press overhead in a smooth arc. Do not shrug aggressively. Lower slowly until upper arms are just below parallel.',
    };
  }

  if (eq === 'full_gym' || eq === 'minimal_gym') {
    return {
      machine: 'Machine / Station Match\nUse the closest cable or plate-loaded station for this movement pattern.',
      howTo: 'Use controlled tempo: 1s up, 2-3s down. Keep spine neutral, brace core, and stop 1-2 reps before technical failure.',
    };
  }

  return {
    machine: 'No Machine Required\nThis can be done bodyweight or with your available equipment.',
    howTo: 'Prioritize posture first: brace core, move through full range, and keep the target muscle under control throughout each rep.',
  };
}

function getDemoMovementClass(movementPattern) {
  const pattern = String(movementPattern || '').toLowerCase();
  if (pattern === 'knee-dominant') return 'squat';
  if (pattern === 'hip-hinge') return 'hinge';
  if (pattern === 'core-stability') return 'hinge';
  if (pattern === 'vertical-push' || pattern === 'horizontal-push' || pattern === 'vertical-pull' || pattern === 'horizontal-pull') return pattern;
  if (pattern === 'upper-accessory') return 'horizontal-pull';
  return 'horizontal-push';
}

function openExerciseDemo(exerciseKey) {
  const exercise = G.today.planSnapshot?.items?.find(item => item.key === exerciseKey);
  if (!exercise) return;

  const titleEl = document.getElementById('exercise-demo-title');
  const subtitleEl = document.getElementById('exercise-demo-subtitle');
  const targetEl = document.getElementById('exercise-demo-target');
  const machineEl = document.getElementById('exercise-demo-machine');
  const howToEl = document.getElementById('exercise-demo-howto');
  const figureEl = document.getElementById('exercise-demo-figure');
  const modalEl = document.getElementById('exercise-demo-bg');

  const movement = getDemoMovementClass(exercise.movementPattern || 'general');
  const primaryMuscle = normalizeDemoMuscleLabel(exercise.primaryMuscle);
  const targetLabel = getDemoTargetLabel(exercise.name, primaryMuscle);
  const equipment = G.today.planSnapshot?.equipment || G.profile?.equipment || 'calisthenics';
  const guide = inferMachineGuide(exercise.name, equipment);

  if (titleEl) titleEl.textContent = `Demo: ${exercise.name}`;
  if (subtitleEl) subtitleEl.textContent = `${exercise.sets} · Rest ${exercise.rest} · Tap outside to close`;
  if (targetEl) targetEl.textContent = `Target: ${targetLabel}`;
  if (machineEl) machineEl.textContent = guide.machine;
  if (howToEl) howToEl.textContent = guide.howTo;

  if (figureEl) {
    figureEl.className = 'demo-figure exercise-demo-figure';
    figureEl.classList.add(`target-${primaryMuscle}`);
    figureEl.classList.add(`move-${movement}`);
  }

  if (modalEl) modalEl.style.display = 'flex';
}

function closeExerciseDemo() {
  const modalEl = document.getElementById('exercise-demo-bg');
  if (modalEl) modalEl.style.display = 'none';
}

// ════════════════════════════ SCHEDULE ════════════════════════════
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TIME_SLOTS = ['AM','Mid','PM','Eve'];
const DEFAULT_SCHEDULE_META = { startHour: 4, endHour: 20 };
let plannerMonthCursor = null;
let plannerSelectedDate = null;
let plannerAutoHolidayKey = '';
let plannerCountryAutodetected = false;
let plannerDetectedCountry = '';
let schedulePaintActive = false;
let selectedScheduleEntryId = null;

function isValidCountryCode(code) {
  return /^[A-Z]{2}$/.test(String(code || '').toUpperCase());
}

const COUNTRY_OPTIONS = [
  ['US', 'United States'],
  ['CA', 'Canada'],
  ['GB', 'United Kingdom'],
  ['AU', 'Australia'],
  ['NZ', 'New Zealand'],
  ['PH', 'Philippines'],
  ['SG', 'Singapore'],
  ['MY', 'Malaysia'],
  ['ID', 'Indonesia'],
  ['TH', 'Thailand'],
  ['VN', 'Vietnam'],
  ['IN', 'India'],
  ['PK', 'Pakistan'],
  ['BD', 'Bangladesh'],
  ['AE', 'United Arab Emirates'],
  ['SA', 'Saudi Arabia'],
  ['QA', 'Qatar'],
  ['JP', 'Japan'],
  ['KR', 'South Korea'],
  ['CN', 'China'],
  ['TW', 'Taiwan'],
  ['DE', 'Germany'],
  ['FR', 'France'],
  ['ES', 'Spain'],
  ['IT', 'Italy'],
  ['NL', 'Netherlands'],
  ['SE', 'Sweden'],
  ['NO', 'Norway'],
  ['DK', 'Denmark'],
  ['FI', 'Finland'],
  ['BR', 'Brazil'],
  ['MX', 'Mexico'],
  ['AR', 'Argentina'],
  ['CL', 'Chile'],
  ['ZA', 'South Africa'],
  ['NG', 'Nigeria'],
  ['EG', 'Egypt'],
];

function populateCountrySelect(selectId, preferredCode = 'US') {
  const select = document.getElementById(selectId);
  if (!select) return;
  const normalized = String(preferredCode || 'US').toUpperCase();
  select.innerHTML = COUNTRY_OPTIONS.map(([code, name]) => `<option value="${code}">${name} (${code})</option>`).join('');
  const fallback = COUNTRY_OPTIONS.some(([code]) => code === normalized) ? normalized : 'US';
  select.value = fallback;
}

function getStoredHolidayCountry() {
  const fromProfile = String(G.profile?.country || '').toUpperCase();
  if (isValidCountryCode(fromProfile)) return fromProfile;
  const fromLocal = String(localStorage.getItem('vq_holiday_country') || '').toUpperCase();
  return isValidCountryCode(fromLocal) ? fromLocal : '';
}

function setStoredHolidayCountry(country) {
  const code = String(country || '').toUpperCase();
  if (!isValidCountryCode(code)) return;
  if (G.profile) {
    G.profile.country = code;
    localStorage.setItem('vq_profile', JSON.stringify(G.profile));
  }
  localStorage.setItem('vq_holiday_country', code);
  plannerDetectedCountry = code;
}

function normalizeScheduleMeta(meta) {
  const startRaw = Number(meta?.startHour);
  const endRaw = Number(meta?.endHour);
  const startHour = Number.isFinite(startRaw) ? Math.max(0, Math.min(22, Math.floor(startRaw))) : DEFAULT_SCHEDULE_META.startHour;
  const minEnd = startHour + 1;
  const endHour = Number.isFinite(endRaw)
    ? Math.max(minEnd, Math.min(24, Math.floor(endRaw)))
    : Math.max(minEnd, DEFAULT_SCHEDULE_META.endHour);
  return { startHour, endHour };
}

function getScheduleMeta() {
  G.scheduleMeta = normalizeScheduleMeta(G.scheduleMeta);
  return G.scheduleMeta;
}

function saveScheduleMeta() {
  localStorage.setItem('vq_schedule_meta', JSON.stringify(getScheduleMeta()));
}

function ensureScheduleStartCapacity(minStartHour) {
  const candidate = Number(minStartHour);
  if (!Number.isFinite(candidate)) return false;
  const meta = getScheduleMeta();
  if (candidate >= meta.startHour) return false;
  const targetStart = Math.max(0, Math.floor(candidate));
  if (targetStart >= meta.startHour) return false;
  G.scheduleMeta = normalizeScheduleMeta({ ...meta, startHour: targetStart });
  saveScheduleMeta();
  return true;
}

function ensureScheduleEndCapacity(maxEndHour) {
  const candidate = Number(maxEndHour);
  if (!Number.isFinite(candidate)) return false;
  const meta = getScheduleMeta();
  // Expand by one hour whenever an entry reaches the current visible boundary.
  if (candidate < (meta.endHour - 1)) return false;
  const targetEnd = Math.min(24, Math.max(meta.endHour + 1, candidate + 1));
  if (targetEnd <= meta.endHour) return false;
  G.scheduleMeta = normalizeScheduleMeta({ ...meta, endHour: targetEnd });
  saveScheduleMeta();
  return true;
}

function syncScheduleMetaFromEntries() {
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  if (!entries.length) {
    G.scheduleMeta = normalizeScheduleMeta(DEFAULT_SCHEDULE_META);
    saveScheduleMeta();
    return;
  }
  const maxEnd = entries.reduce((max, item) => {
    const end = Number(item?.endHour);
    return Number.isFinite(end) ? Math.max(max, end) : max;
  }, DEFAULT_SCHEDULE_META.endHour);
  ensureScheduleEndCapacity(maxEnd);
}

function getRenderedHours(meta = getScheduleMeta()) {
  const out = [];
  for (let h = meta.startHour; h < meta.endHour; h += 1) out.push(h);
  return out;
}

function hourToSlotKey(hour24) {
  return `H${String(hour24).padStart(2, '0')}`;
}

function slotKeyToHour24(slot) {
  const m = String(slot || '').trim().match(/^h?(\d{1,2})$/i);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

function formatHourLabel(hour24) {
  const hour12 = ((hour24 + 11) % 12) + 1;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12} ${ampm}`;
}

function hoursForLegacySlot(slotName, meta = getScheduleMeta()) {
  const start = meta.startHour;
  const end = meta.endHour;
  const ranges = {
    AM: [start, 11],
    Mid: [11, 14],
    PM: [14, 18],
    Eve: [18, end],
  };
  const [rawStart, rawEnd] = ranges[slotName] || [start, end];
  const from = Math.max(start, rawStart);
  const to = Math.min(end, Math.max(rawEnd, from + 1));
  const hours = [];
  for (let h = from; h < to; h += 1) hours.push(h);
  return hours.length ? hours : getRenderedHours(meta);
}

function findDetectedHourSpan(scheduleData) {
  const hours = [];
  ['busy', 'free'].forEach(type => {
    (scheduleData?.[type] || []).forEach(entry => {
      (entry?.slots || []).forEach(slot => {
        const hour = slotKeyToHour24(slot);
        if (Number.isFinite(hour)) hours.push(hour);
      });
    });
  });
  if (!hours.length) return null;
  const minHour = Math.min(...hours);
  const maxHour = Math.max(...hours);
  return normalizeScheduleMeta({ startHour: minHour - 1, endHour: maxHour + 2 });
}

function renderScheduleScreen() {
  // Keep early prep-time slots available in the editor and board.
  ensureScheduleStartCapacity(4);
  syncScheduleMetaFromEntries();
  renderScheduleEntryEditor();
  renderScheduleVisualBoard();
  syncScheduleBlocksFromEntries();
  analyseSchedule();
  renderPlannerMonthCalendar();
  renderPlannerDateSection();
  autoConfigurePlannerHolidayCountry().finally(() => {
    autoLoadPlannerHolidaysForCurrentPlace();
  });
}

function expandScheduleEntryDays(dayValue) {
  if (dayValue === 'all_weekdays') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  if (dayValue === 'all_days') return [...DAYS];
  return DAYS.includes(dayValue) ? [dayValue] : [];
}

// ── Coursicle-style form helpers ──
function toggleSchedDay(btn) {
  btn.classList.toggle('active');
}

function formatTimeMinutes(totalMin) {
  const h24 = Math.floor(totalMin / 60) % 24;
  const m   = totalMin % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function buildSchedTimeOptions(forEnd) {
  const meta = getScheduleMeta();
  const startMin = meta.startHour * 60;
  const endMin   = meta.endHour   * 60;
  const opts = [];
  if (forEnd) {
    for (let m = startMin + 10; m <= endMin; m += 10)
      opts.push(`<option value="${m}">${formatTimeMinutes(m)}</option>`);
  } else {
    for (let m = startMin; m < endMin; m += 10)
      opts.push(`<option value="${m}">${formatTimeMinutes(m)}</option>`);
  }
  return opts.join('');
}

function buildSchedTimeRowHtml(isFirst) {
  const startOpts = buildSchedTimeOptions(false);
  const endOpts   = buildSchedTimeOptions(true);
  const removeBtn = isFirst ? '' : `<button class="sc-time-remove" onclick="removeSchedTimeRow(this)" title="Remove">✕</button>`;
  const dayToggles = isFirst ? '' : `
    <div class="sc-time-row-days">
      ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) =>
        `<button class="sc-day-btn sc-day-btn-sm" data-day="${day}" onclick="toggleSchedDay(this)">${['S','M','T','W','T','F','S'][i]}</button>`
      ).join('')}
    </div>`;
  return `<div class="sc-time-row"${isFirst ? '' : ' data-has-days="true"'}>
    ${dayToggles}
    <div class="sc-time-inputs">
      <select class="planner-input sc-time-start" style="flex:1">${startOpts}</select>
      <span class="sc-time-sep">→</span>
      <select class="planner-input sc-time-end" style="flex:1">${endOpts}</select>
      ${removeBtn}
    </div>
  </div>`;
}

function addSchedTimeRow() {
  const container = document.getElementById('sc-time-slots');
  if (!container) return;
  const rowDiv = document.createElement('div');
  rowDiv.innerHTML = buildSchedTimeRowHtml(false).trim();
  const row = rowDiv.firstElementChild;
  // Default new rows to 10 AM – 11 AM
  const s = row.querySelector('.sc-time-start');
  const e = row.querySelector('.sc-time-end');
  if (s && s.querySelector('option[value="600"]')) s.value = '600';
  if (e && e.querySelector('option[value="660"]')) e.value = '660';
  container.appendChild(row);
}

function removeSchedTimeRow(btn) {
  btn.closest('.sc-time-row')?.remove();
}

function clearSchedForm() {
  const nameEl = document.getElementById('sc-name');
  const noteEl = document.getElementById('sched-entry-note');
  if (nameEl) nameEl.value = '';
  if (noteEl) noteEl.value = '';
  document.querySelectorAll('.sc-day-btn').forEach(b => b.classList.remove('active'));
  const container = document.getElementById('sc-time-slots');
  if (container) {
    container.innerHTML = buildSchedTimeRowHtml(true).trim();
    const s = container.querySelector('.sc-time-start');
    const e = container.querySelector('.sc-time-end');
    if (s && s.querySelector('option[value="540"]')) s.value = '540';
    if (e && e.querySelector('option[value="600"]')) e.value = '600';
  }
}

function renderScheduleEntryEditor() {
  // Initialise the first time-slot row if the container is empty
  const slotsContainer = document.getElementById('sc-time-slots');
  if (slotsContainer && !slotsContainer.querySelector('.sc-time-row')) {
    slotsContainer.innerHTML = buildSchedTimeRowHtml(true).trim();
    const s = slotsContainer.querySelector('.sc-time-start');
    const e = slotsContainer.querySelector('.sc-time-end');
    if (s && s.querySelector('option[value="540"]')) s.value = '540';
    if (e && e.querySelector('option[value="600"]')) e.value = '600';
  }

  const listEl = document.getElementById('sched-entry-list');
  if (!listEl) return;
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  if (!entries.length) {
    selectedScheduleEntryId = null;
    listEl.innerHTML = '<div class="planner-empty">No schedule entries yet. Add your schedule above.</div>';
    return;
  }

  const selectedExists = entries.some(item => item.id === selectedScheduleEntryId);
  if (!selectedExists) {
    selectedScheduleEntryId = null;
    listEl.innerHTML = '<div class="planner-empty">Tap a schedule block in the planner to view and remove that specific entry.</div>';
    return;
  }

  const sorted = entries
    .slice()
    .filter(item => item.id === selectedScheduleEntryId)
    .sort((a, b) => (DAYS.indexOf(a.day) - DAYS.indexOf(b.day)) || ((a.startHour || 0) - (b.startHour || 0)));

  listEl.innerHTML = `<div style="font-size:0.72rem;color:var(--muted2);margin-bottom:8px">Selected schedule entry</div>` + sorted.map(item => {
    const note = String(item.note || '').trim();
    const timeStr = (item.startMinute != null && item.endMinute != null)
      ? `${formatTimeMinutes(item.startMinute)} - ${formatTimeMinutes(item.endMinute)}`
      : formatHourRange(item.startHour, item.endHour);
    return `
      <div class="planner-date-item">
        <div>
          <div class="planner-date-head">${item.day} · ${timeStr}</div>
          ${note ? `<div class="planner-date-note">${escapeHtml(note)}</div>` : ''}
        </div>
        <button class="planner-date-del" onclick="removeScheduleEntry('${escapeHtml(item.id || '')}')">✕</button>
      </div>`;
  }).join('');
}

function renderScheduleVisualBoard() {
  const hoursEl = document.getElementById('sched-visual-hours');
  const boardEl = document.getElementById('sched-visual-board');
  if (!hoursEl || !boardEl) return;

  const hours = getRenderedHours();
  const startHour = hours[0] || 6;
  const startMin  = startHour * 60;
  const rowHeight = 44; // px per hour
  const pxPerMin  = rowHeight / 60;
  const totalHeight = hours.length * rowHeight;
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];

  hoursEl.innerHTML = hours.map(h => `<div class="sv-hour">${formatHourLabel(h)}</div>`).join('');

  boardEl.innerHTML = DAYS.map(day => {
    const dayEntries = entries
      .filter(entry => entry.day === day)
      .sort((a, b) => ((a.startMinute ?? a.startHour * 60) - (b.startMinute ?? b.startHour * 60)));

    const blocks = dayEntries.map(item => {
      const iStartMin = item.startMinute ?? item.startHour * 60;
      const iEndMin   = item.endMinute   ?? item.endHour   * 60;
      const top    = Math.max(0, (iStartMin - startMin) * pxPerMin);
      const height = Math.max(22, (iEndMin - iStartMin) * pxPerMin - 3);
      const type  = item.type || 'busy';
      const title = escapeHtml(item.note || (type === 'workout' ? 'Workout' : type === 'free' ? 'Free' : 'Busy'));
      const timeLabel = (item.startMinute != null && item.endMinute != null)
        ? `${formatTimeMinutes(item.startMinute)} - ${formatTimeMinutes(item.endMinute % (24 * 60))}`
        : formatHourRange(item.startHour, item.endHour);
      const selectedClass = item.id === selectedScheduleEntryId ? ' selected' : '';
      return `<div class="sv-entry ${type}${selectedClass}" style="top:${top + 2}px;height:${height}px" title="${title}" onclick="toggleScheduleEntrySelection('${escapeHtml(item.id || '')}')">
        <div class="sv-entry-title">${title}</div>
        <div class="sv-entry-time">${timeLabel}</div>
      </div>`;
    }).join('');

    return `<div class="sv-day-col">
      <div class="sv-day-head">${day}</div>
      <div class="sv-day-grid" style="height:${totalHeight}px">${blocks}</div>
    </div>`;
  }).join('');
}

function toggleScheduleEntrySelection(id) {
  if (!id) return;
  selectedScheduleEntryId = selectedScheduleEntryId === id ? null : id;
  renderScheduleEntryEditor();
  renderScheduleVisualBoard();
}

function addScheduleEntryFromControls() {
  const name = String(document.getElementById('sc-name')?.value || '').trim();
  const note = String(document.getElementById('sched-entry-note')?.value || '').trim();
  const label = name || note || '';

  // Top-level days (for the primary time row which has no own day selector)
  const topDays = [...document.querySelectorAll('.sc-day-row .sc-day-btn.active')]
    .map(b => b.dataset.day)
    .filter(d => DAYS.includes(d));

  // Collect all time slot rows, each may have its own day toggles
  const timeRows = document.querySelectorAll('#sc-time-slots .sc-time-row');
  const timeSlots = [];
  let hasInvalid = false;
  timeRows.forEach(row => {
    const startMin = parseInt(row.querySelector('.sc-time-start')?.value, 10);
    const endMin   = parseInt(row.querySelector('.sc-time-end')?.value, 10);
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
      hasInvalid = true; return;
    }
    const rowDays = row.dataset.hasDays
      ? [...row.querySelectorAll('.sc-day-btn-sm.active')].map(b => b.dataset.day).filter(d => DAYS.includes(d))
      : topDays;
    timeSlots.push({ startMin, endMin, rowDays });
  });
  if (hasInvalid) { showToast('Pick valid times for each slot.'); return; }
  if (!timeSlots.length) { showToast('Add at least one time slot.'); return; }
  if (timeSlots.some(s => !s.rowDays.length)) {
    showToast('Select at least one day for each time slot.'); return;
  }

  G.scheduleEntries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  timeSlots.forEach(({ startMin, endMin, rowDays }) => {
    rowDays.forEach(day => {
      G.scheduleEntries.push({
        id: `se-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        day,
        startHour:   Math.floor(startMin / 60),
        endHour:     Math.ceil(endMin / 60),
        startMinute: startMin,
        endMinute:   endMin,
        type: 'busy',
        note: label,
      });
      ensureScheduleEndCapacity(Math.ceil(endMin / 60));
    });
  });

  const nameEl = document.getElementById('sc-name');
  const noteEl = document.getElementById('sched-entry-note');
  if (nameEl) nameEl.value = '';
  if (noteEl) noteEl.value = '';

  saveScheduleEntries();
  renderScheduleEntryEditor();
  renderScheduleVisualBoard();
  syncScheduleBlocksFromEntries();
  analyseSchedule();
}

function removeScheduleEntry(id) {
  if (selectedScheduleEntryId === id) selectedScheduleEntryId = null;
  G.scheduleEntries = (G.scheduleEntries || []).filter(item => item.id !== id);
  saveScheduleEntries();
  renderScheduleEntryEditor();
  renderScheduleVisualBoard();
  syncScheduleBlocksFromEntries();
  analyseSchedule();
}

function syncScheduleBlocksFromEntries() {
  const renderedHours = getRenderedHours();
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  G.scheduleBlocks = {};

  entries.forEach(entry => {
    const days = expandScheduleEntryDays(entry.day);
    const start = clampNumber(entry.startHour, renderedHours[0] || 6, 23, renderedHours[0] || 6);
    const end = clampNumber(entry.endHour, (renderedHours[0] || 6) + 1, 24, (renderedHours[0] || 6) + 1);
    const state = entry.type || 'busy';
    days.forEach(day => {
      for (let hour = start; hour < end; hour += 1) {
        if (!renderedHours.includes(hour)) continue;
        const key = `${day}-${hourToSlotKey(hour)}`;
        G.scheduleBlocks[key] = state;
      }
    });
  });
}

function rebuildEntriesFromScheduleBlocks() {
  const renderedHours = getRenderedHours();
  const entries = [];

  DAYS.forEach(day => {
    let runState = null;
    let runStart = null;
    let prevHour = null;

    const flush = () => {
      if (runState === null || runStart === null || prevHour === null) return;
      entries.push({
        id: `sb-${day}-${runStart}-${prevHour + 1}-${Math.random().toString(36).slice(2, 6)}`,
        day,
        startHour: runStart,
        endHour: prevHour + 1,
        type: runState,
        note: runState === 'workout' ? 'Auto workout slot' : '',
      });
    };

    renderedHours.forEach(hour => {
      const key = `${day}-${hourToSlotKey(hour)}`;
      const state = G.scheduleBlocks?.[key] || 'free';
      if (state === 'free') {
        flush();
        runState = null;
        runStart = null;
        prevHour = null;
        return;
      }
      if (runState === state && prevHour !== null && hour === prevHour + 1) {
        prevHour = hour;
        return;
      }
      flush();
      runState = state;
      runStart = hour;
      prevHour = hour;
    });

    flush();
  });

  G.scheduleEntries = entries;
}

function captureRenderedScheduleBlocks() {
  if (document.getElementById('sched-entry-list')) {
    syncScheduleBlocksFromEntries();
    return;
  }
  if (!G.scheduleBlocks) G.scheduleBlocks = {};
  const renderedHours = getRenderedHours();
  DAYS.forEach(day => {
    renderedHours.forEach(hour => {
      const key = `${day}-${hourToSlotKey(hour)}`;
      if (!G.scheduleBlocks[key]) {
        const el = document.getElementById('tb-' + key);
        G.scheduleBlocks[key] = el?.dataset?.state || 'free';
      }
    });
  });
}

function getScheduleState(day, hour) {
  const key = `${day}-${hourToSlotKey(hour)}`;
  return G.scheduleBlocks?.[key] || 'free';
}

function getScheduleDayKey(dateISO) {
  const date = parseISODateSafe(dateISO) || new Date();
  return DAYS[date.getDay()];
}

function getPreferredWindowRange(windowKey) {
  return TRAINING_WINDOW_RANGES[windowKey] || TRAINING_WINDOW_RANGES.flexible;
}

function formatHourRange(startHour, endHour) {
  return `${formatHourLabel(startHour)} - ${formatHourLabel(endHour % 24)}`;
}

function getFocusedWorkoutSlot(window, sessionMinutes, preferredKey = 'evening') {
  if (!window) return null;
  const preferred = preferredKey === 'flexible' ? 'evening' : preferredKey;
  const preferredRange = getPreferredWindowRange(preferred);
  const durationHours = Math.max(1, Math.min(2, Math.ceil(clampNumber(sessionMinutes, 20, 120, 60) / 60)));
  const maxStart = window.endHour - durationHours;
  if (maxStart < window.startHour) {
    return {
      startHour: window.startHour,
      endHour: window.endHour,
      durationMinutes: (window.endHour - window.startHour) * 60,
      label: formatHourRange(window.startHour, window.endHour),
    };
  }

  let targetStart = Math.round(((preferredRange[0] + preferredRange[1]) / 2) - (durationHours / 2));
  targetStart = Math.max(window.startHour, Math.min(maxStart, targetStart));

  return {
    startHour: targetStart,
    endHour: targetStart + durationHours,
    durationMinutes: durationHours * 60,
    label: formatHourRange(targetStart, targetStart + durationHours),
  };
}

function timeRangesOverlap(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

function hasScheduleConflict(day, startHour, endHour, types = ['busy', 'workout']) {
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  return entries.some(item => {
    if (!item || item.day !== day) return false;
    if (!types.includes(item.type || 'busy')) return false;
    const entryStart = Number.isFinite(Number(item.startHour)) ? Number(item.startHour) : Math.floor((Number(item.startMinute) || 0) / 60);
    const entryEnd = Number.isFinite(Number(item.endHour)) ? Number(item.endHour) : Math.ceil((Number(item.endMinute) || 0) / 60);
    return timeRangesOverlap(startHour, endHour, entryStart, entryEnd);
  });
}

function hasExactWorkoutEntry(day, startHour, endHour) {
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  return entries.some(item => item
    && item.day === day
    && (item.type || 'busy') === 'workout'
    && Number(item.startHour) === startHour
    && Number(item.endHour) === endHour);
}

  const POST_BUSY_BUFFER_HOURS = 1;
  const MAX_SUGGEST_END_HOUR = 23;
  const MIN_SUGGEST_START_HOUR = 5;

function getSlotDurationHours(sessionMinutes) {
  return Math.max(1, Math.min(2, Math.ceil(clampNumber(sessionMinutes, 20, 120, 60) / 60)));
}

function buildEdgeSlotFromWindow(window, sessionMinutes, edge = 'start') {
  if (!window) return null;
  const normalizedStart = Math.max(0, Math.floor(window.startHour));
  const normalizedEnd = Math.min(MAX_SUGGEST_END_HOUR, Math.floor(window.endHour));
  if (normalizedEnd <= normalizedStart) return null;
  const durationHours = getSlotDurationHours(sessionMinutes);
  const windowHours = Math.max(1, normalizedEnd - normalizedStart);
  if (windowHours <= durationHours) {
    return {
      startHour: normalizedStart,
      endHour: normalizedEnd,
      durationMinutes: windowHours * 60,
      label: formatHourRange(normalizedStart, normalizedEnd),
    };
  }

  if (edge === 'end') {
    const endHour = normalizedEnd;
    const startHour = endHour - durationHours;
    return {
      startHour,
      endHour,
      durationMinutes: durationHours * 60,
      label: formatHourRange(startHour, endHour),
    };
  }

  const startHour = normalizedStart;
  const endHour = startHour + durationHours;
  return {
    startHour,
    endHour,
    durationMinutes: durationHours * 60,
    label: formatHourRange(startHour, endHour),
  };
}

function getBusySpanForDay(day) {
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  const busyEntries = entries.filter(item => item && item.day === day && (item.type || 'busy') === 'busy');
  if (!busyEntries.length) return null;

  const starts = busyEntries.map(item => Number.isFinite(Number(item.startHour)) ? Number(item.startHour) : Math.floor((Number(item.startMinute) || 0) / 60));
  const ends = busyEntries.map(item => Number.isFinite(Number(item.endHour)) ? Number(item.endHour) : Math.ceil((Number(item.endMinute) || 0) / 60));
  if (!starts.length || !ends.length) return null;

  return {
    startHour: Math.min(...starts),
    endHour: Math.max(...ends),
  };
}

function getBusyMinutesByBandForDay(day) {
  const entries = Array.isArray(G.scheduleEntries) ? G.scheduleEntries : [];
  const busyEntries = entries.filter(item => item && item.day === day && (item.type || 'busy') === 'busy');
  const bandRanges = {
    morning: [5, 12],
    afternoon: [12, 18],
    night: [18, 23],
  };
  const totals = { morning: 0, afternoon: 0, night: 0 };

  busyEntries.forEach(item => {
    const startHour = Number.isFinite(Number(item.startHour)) ? Number(item.startHour) : ((Number(item.startMinute) || 0) / 60);
    const endHour = Number.isFinite(Number(item.endHour)) ? Number(item.endHour) : ((Number(item.endMinute) || 0) / 60);
    if (!Number.isFinite(startHour) || !Number.isFinite(endHour) || endHour <= startHour) return;

    Object.entries(bandRanges).forEach(([band, [bandStart, bandEnd]]) => {
      const overlapStart = Math.max(startHour, bandStart);
      const overlapEnd = Math.min(endHour, bandEnd);
      if (overlapEnd > overlapStart) {
        totals[band] += Math.round((overlapEnd - overlapStart) * 60);
      }
    });
  });

  return totals;
}

function getTodayBeforeAfterSuggestion(day, sessionMinutes, preferredKey = 'evening') {
  const windows = getEdgeOnlyWindowsForDay(day) || [];
  if (!windows.length) return null;

  const busySpan = getBusySpanForDay(day);
  if (!busySpan) {
    const fallback = getFocusedWorkoutSlot(windows[0], sessionMinutes, preferredKey);
    return fallback ? { ...fallback, context: 'open-day' } : null;
  }

  const beforeWindows = windows.filter(window => window.edge === 'before');
  const afterWindows = windows.filter(window => window.edge === 'after');

  const beforeWindow = beforeWindows.sort((a, b) => b.endHour - a.endHour)[0] || null;
  const afterWindow = afterWindows.sort((a, b) => a.startHour - b.startHour)[0] || null;

  const beforeSlot = beforeWindow ? buildEdgeSlotFromWindow(beforeWindow, sessionMinutes, 'end') : null;
  const afterSlot = afterWindow ? buildEdgeSlotFromWindow(afterWindow, sessionMinutes, 'start') : null;

  if (beforeSlot && afterSlot) {
    const preferred = preferredKey === 'early' || preferredKey === 'midday' ? 'before' : 'after';
    return preferred === 'before'
      ? { ...beforeSlot, context: 'before' }
      : { ...afterSlot, context: 'after' };
  }
  if (beforeSlot) return { ...beforeSlot, context: 'before' };
  if (afterSlot) return { ...afterSlot, context: 'after' };

  const fallback = getFocusedWorkoutSlot(windows[0], sessionMinutes, preferredKey);
  return fallback ? { ...fallback, context: 'fallback' } : null;
}

function getTimeBandFromHour(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return 'day';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'night';
}

function getTimeBandLabel(band) {
  if (band === 'morning') return 'Morning';
  if (band === 'afternoon') return 'Afternoon';
  if (band === 'night') return 'Night';
  return 'Day';
}

function dayDistance(a, b) {
  const ai = DAYS.indexOf(a);
  const bi = DAYS.indexOf(b);
  if (ai < 0 || bi < 0) return 7;
  const diff = Math.abs(ai - bi);
  return Math.min(diff, 7 - diff);
}

function isHardQuestType(questType) {
  const t = String(questType || '').toLowerCase();
  return ['hiit', 'legs', 'strength', 'chest', 'back', 'shoulder', 'arms', 'full'].includes(t);
}

function scoreWeeklyCandidateWithSpacing(candidate, selected) {
  const base = candidate.score || 0;
  if (!selected.length) return base;

  const minGap = selected.reduce((min, item) => Math.min(min, dayDistance(candidate.day, item.day)), 7);
  const spacingBonus = Math.min(24, minGap * 8);
  const hardPenalty = selected.some(item => dayDistance(candidate.day, item.day) <= 1 && isHardQuestType(item.questType) && isHardQuestType(candidate.questType))
    ? 34
    : 0;
  return base + spacingBonus - hardPenalty;
}

function getWorkoutDayPatterns(targetDays) {
  const patterns = {
    1: [['Wed'], ['Mon'], ['Fri']],
    2: [['Mon', 'Thu'], ['Tue', 'Fri'], ['Wed', 'Sat']],
    3: [['Mon', 'Wed', 'Fri'], ['Tue', 'Thu', 'Sat'], ['Mon', 'Thu', 'Sat']],
    4: [['Mon', 'Tue', 'Thu', 'Fri'], ['Mon', 'Wed', 'Fri', 'Sat'], ['Tue', 'Wed', 'Fri', 'Sun']],
    5: [['Mon', 'Tue', 'Wed', 'Fri', 'Sat'], ['Mon', 'Tue', 'Thu', 'Fri', 'Sun']],
    6: [['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']],
    7: [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
  };
  return patterns[targetDays] || patterns[3];
}

function chooseBestWorkoutPattern(daySuggestions, targetDays) {
  const byDay = new Map((daySuggestions || []).map(item => [item.day, item]));
  const patterns = getWorkoutDayPatterns(targetDays);
  const scoredPatterns = patterns.map(days => {
    let coverage = 0;
    let score = 0;
    days.forEach(day => {
      const item = byDay.get(day);
      const candidate = item?.bestCandidate;
      if (item && candidate?.enoughForSession) {
        coverage += 1;
        score += candidate.score || 0;
      }
    });
    const hasMWF = days.includes('Mon') && days.includes('Wed') && days.includes('Fri');
    return { days, coverage, score, hasMWF };
  });

  const bestCoverage = scoredPatterns.reduce((max, item) => Math.max(max, item.coverage), -1);
  const coveragePool = scoredPatterns.filter(item => item.coverage === bestCoverage);
  const mwfPool = coveragePool.filter(item => item.hasMWF);
  const finalPool = mwfPool.length ? mwfPool : coveragePool;

  return finalPool.reduce((best, item) => (item.score > best.score ? item : best), { days: [], coverage: -1, score: -Infinity, hasMWF: false });
}

function alignStrictRoutineTime(workoutDays, byDayMap) {
  const current = Array.isArray(workoutDays) ? workoutDays : [];
  if (current.length < 2) return current;

  const candidateSets = current.map(item => {
    const dayMeta = byDayMap.get(item.day);
    return (dayMeta?.candidates || []).filter(candidate => candidate?.enoughForSession);
  });
  if (candidateSets.some(set => !set.length)) return current;

  // First choice: exact same start hour across all strict days.
  let sharedHours = [...new Set(candidateSets[0].map(candidate => candidate.startHour))];
  for (let i = 1; i < candidateSets.length; i += 1) {
    const dayHours = new Set(candidateSets[i].map(candidate => candidate.startHour));
    sharedHours = sharedHours.filter(hour => dayHours.has(hour));
    if (!sharedHours.length) break;
  }

  let anchorHour = null;
  if (sharedHours.length) {
    anchorHour = sharedHours.reduce((bestHour, hour) => {
      const totalScore = candidateSets.reduce((sum, set) => {
        const pick = set.filter(candidate => candidate.startHour === hour).sort((a, b) => b.score - a.score)[0];
        return sum + (pick?.score || 0);
      }, 0);
      if (bestHour === null) return hour;
      const bestScore = candidateSets.reduce((sum, set) => {
        const pick = set.filter(candidate => candidate.startHour === bestHour).sort((a, b) => b.score - a.score)[0];
        return sum + (pick?.score || 0);
      }, 0);
      return totalScore > bestScore ? hour : bestHour;
    }, null);
  }

  if (anchorHour === null) {
    // Fallback: choose one anchor hour and keep each day as close as possible.
    anchorHour = Math.round(current.reduce((sum, item) => sum + Number(item.startHour || 0), 0) / current.length);
  }

  return current.map(item => {
    const dayMeta = byDayMap.get(item.day);
    const candidates = (dayMeta?.candidates || []).filter(candidate => candidate?.enoughForSession);
    if (!candidates.length) return item;
    const picked = candidates.reduce((best, candidate) => {
      if (!best) return candidate;
      const delta = Math.abs(Number(candidate.startHour || 0) - anchorHour);
      const bestDelta = Math.abs(Number(best.startHour || 0) - anchorHour);
      if (delta < bestDelta) return candidate;
      if (delta > bestDelta) return best;
      return (candidate.score || 0) > (best.score || 0) ? candidate : best;
    }, null);
    return {
      ...picked,
      questType: item.questType,
      adjustedMinutes: item.adjustedMinutes,
    };
  });
}

function getWeekStartSunday(baseDate = new Date()) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateISOForWeekDay(day, baseDate = new Date()) {
  const idx = DAYS.indexOf(day);
  if (idx < 0) return null;
  const weekStart = getWeekStartSunday(baseDate);
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + idx);
  return toISODate(date);
}

function getMondayIndexedDayIndex(day) {
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return order.indexOf(day);
}

function getQuestTypeForWeekDay(goal, day, baseDate = new Date(), preferAutoPlan = true) {
  if (preferAutoPlan) {
    const dateISO = getDateISOForWeekDay(day, baseDate);
    const autoPlannedType = getAutoPlannedQuestTypeForDate(dateISO);
    if (autoPlannedType && String(autoPlannedType).toLowerCase() !== 'training') return autoPlannedType;
  }
  return getBaseQuestTypeForWeekDay(goal, day);
}

function getQuestAdjustedSessionMinutes(profile, questType) {
  const base = clampNumber(profile?.sessionMinutes, 20, 90, 45);
  const type = String(questType || '').toLowerCase();
  if (!type) return base;
  if (type === 'rest') return 0;
  if (type === 'walk' || type === 'yoga' || type === 'flex') return Math.max(20, Math.min(base, 35));
  if (type === 'cardio' || type === 'hiit') return Math.max(25, Math.min(base, 45));
  return base;
}

function getTargetWorkoutDays(profile) {
  const raw = Number(profile?.days);
  // Respect user's configured workout frequency while keeping it in sane weekly bounds.
  return Math.max(1, Math.min(7, Number.isFinite(raw) ? Math.round(raw) : 4));
}

function getEffectiveWorkoutDaysForPlanning(profile) {
  // If frequency override is set, use it; otherwise use profile default.
  if (G.plannerFrequencyOverride !== null) {
    return Math.max(1, Math.min(7, G.plannerFrequencyOverride));
  }
  return getTargetWorkoutDays(profile);
}

function adjustWorkoutFrequency(delta) {
  if (!G.profile) return;
  const current = G.plannerFrequencyOverride !== null ? G.plannerFrequencyOverride : getTargetWorkoutDays(G.profile);
  const newFreq = Math.max(1, Math.min(7, current + delta));
  if (newFreq === current && G.plannerFrequencyOverride !== null) {
    return;
  }
  G.plannerFrequencyOverride = newFreq;
  analyseSchedule();
  showToast(`📅 Workout frequency: ${newFreq} day(s) / week`);
}

function resetWorkoutFrequency() {
  if (G.plannerFrequencyOverride === null) return;
  G.plannerFrequencyOverride = null;
  analyseSchedule();
  showToast(`♻️ Frequency reset to default: ${getTargetWorkoutDays(G.profile)} day(s) / week`);
}

function getWorkoutPatternMode(profile) {
  return profile?.patternMode === 'strict' ? 'strict' : 'flexible';
}

function syncAdaptiveQuestCalendarEvents(planByDay, goal, baseDate = new Date()) {
  const managedPrefix = 'Auto-plan:';
  G.plannerDates = Array.isArray(G.plannerDates) ? G.plannerDates : [];
  G.plannerDates = G.plannerDates.filter(item => {
    if (!item) return false;
    const isTaggedAutoPlan = String(item?.source || '') === 'auto-plan';
    const hasLegacyManagedPrefix = String(item?.note || '').startsWith(managedPrefix);
    return !(isTaggedAutoPlan || hasLegacyManagedPrefix);
  });

  (planByDay || []).forEach(item => {
    if (!item || !item.day) return;
    const dateISO = getDateISOForWeekDay(item.day, baseDate);
    if (!dateISO) return;
    const questType = item.questType || getQuestTypeForWeekDay(goal, item.day, baseDate, false) || 'Training';
    if (item.planType === 'workout') {
      const slotLabel = item.slot?.label || 'Manual session';
      const bandLabel = item.slot?.bandLabel || 'planned';
      G.plannerDates.push({
        id: `${dateISO}-workout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: dateISO,
        type: 'workout',
        source: 'auto-plan',
        note: `${managedPrefix} ${questType} · ${slotLabel} · ${bandLabel}`,
      });
      return;
    }
    G.plannerDates.push({
      id: `${dateISO}-rest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: dateISO,
      type: 'rest_day',
      source: 'auto-plan',
      note: `${managedPrefix} ${questType} · Recovery day`,
    });
  });
}

function getEdgeOnlyWindowsForDay(day) {
  const windows = getDayTrainingWindows(day) || [];
  const busySpan = getBusySpanForDay(day);
  if (!busySpan) {
    return windows
      .map(window => ({
        ...window,
        startHour: Math.max(MIN_SUGGEST_START_HOUR, Math.floor(window.startHour)),
        endHour: Math.min(MAX_SUGGEST_END_HOUR, Math.floor(window.endHour)),
        edge: 'open',
      }))
      .filter(window => window.endHour > window.startHour);
  }

  const bufferedAfterStart = busySpan.endHour + POST_BUSY_BUFFER_HOURS;
  const edgeWindows = [];

  windows.forEach(window => {
    // Before-busy segment (clip to busy start if needed).
    const beforeStart = window.startHour;
    const beforeEnd = Math.min(window.endHour, busySpan.startHour);
    if (beforeEnd > beforeStart) {
      edgeWindows.push({
        ...window,
        startHour: Math.max(MIN_SUGGEST_START_HOUR, Math.floor(beforeStart)),
        endHour: Math.min(MAX_SUGGEST_END_HOUR, Math.floor(beforeEnd)),
        edge: 'before',
      });
    }

    // After-busy segment (apply +1h grace and keep remaining tail).
    const afterStart = Math.max(window.startHour, bufferedAfterStart);
    const afterEnd = window.endHour;
    if (afterEnd > afterStart) {
      edgeWindows.push({
        ...window,
        startHour: Math.max(MIN_SUGGEST_START_HOUR, Math.floor(afterStart)),
        endHour: Math.min(MAX_SUGGEST_END_HOUR, Math.floor(afterEnd)),
        edge: 'after',
      });
    }
  });

  return edgeWindows.filter(window => window.endHour > window.startHour);
}

function buildAdaptiveDaySuggestion(day, sessionMinutes, preferredKey = 'evening') {
  const edgeWindows = getEdgeOnlyWindowsForDay(day);
  const remainingMinutes = edgeWindows.reduce((sum, window) => sum + (window.lengthHours * 60), 0);
  if (!edgeWindows.length) {
    return { day, canTrain: false, remainingMinutes, bestCandidate: null, candidates: [] };
  }

  const preferredBand = preferredKey === 'early'
    ? 'morning'
    : preferredKey === 'midday'
      ? 'afternoon'
      : preferredKey === 'night'
        ? 'night'
        : 'night';

  const preferredEdge = preferredKey === 'early' ? 'before' : 'after';
  const minComfortHour = preferredKey === 'early' ? 5 : 6;
  const busyMinutesByBand = getBusyMinutesByBandForDay(day);
  const leastBusyBand = ['morning', 'afternoon', 'night'].reduce((best, band) => (
    busyMinutesByBand[band] < busyMinutesByBand[best] ? band : best
  ), preferredBand);
  const fridayMorningPreferred = day === 'Fri' && busyMinutesByBand.morning <= Math.min(busyMinutesByBand.afternoon, busyMinutesByBand.night);
  const adaptiveBand = fridayMorningPreferred ? 'morning' : leastBusyBand;

  const candidates = edgeWindows
    .map(window => {
      const edgePick = window.edge === 'before' ? 'end' : 'start';
      const slot = window.edge === 'open'
        ? getFocusedWorkoutSlot(window, sessionMinutes, preferredKey)
        : buildEdgeSlotFromWindow(window, sessionMinutes, edgePick);
      if (!slot) return null;
      const enoughForSession = (window.lengthHours * 60) >= sessionMinutes;
      const band = getTimeBandFromHour(slot.startHour);
      const earlyPenalty = slot.startHour < minComfortHour ? (minComfortHour - slot.startHour) * 45 : 0;
      const latePenalty = slot.endHour > 22 ? (slot.endHour - 22) * 18 : 0;
      const afterSchoolPrimeBonus = (window.edge === 'after' && slot.startHour >= 17 && slot.startHour <= 21) ? 28 : 0;
      const adaptiveBandBonus = band === adaptiveBand ? 18 : 0;
      const fridayMorningBonus = (day === 'Fri' && band === 'morning' && busyMinutesByBand.night >= busyMinutesByBand.morning) ? 12 : 0;
      const fridayNightPenalty = (day === 'Fri' && band === 'night' && busyMinutesByBand.night >= (busyMinutesByBand.morning + 60)) ? 14 : 0;
      const score =
        (enoughForSession ? 120 : 0)
        + (window.lengthHours * 8)
        + (window.edge === 'before' || window.edge === 'after' ? 18 : 0)
        + (band === preferredBand ? 10 : 0)
        + (window.edge === preferredEdge ? 16 : 0)
        + afterSchoolPrimeBonus
        + adaptiveBandBonus
        + fridayMorningBonus
        - earlyPenalty
        - latePenalty
        - fridayNightPenalty;
      return {
        day,
        startHour: slot.startHour,
        endHour: slot.endHour,
        durationMinutes: slot.durationMinutes,
        label: slot.label,
        edge: window.edge,
        band,
        bandLabel: getTimeBandLabel(band),
        enoughForSession,
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const bestCandidate = candidates[0] || null;
  return {
    day,
    canTrain: !!bestCandidate && bestCandidate.enoughForSession,
    remainingMinutes,
    bestCandidate,
    candidates,
  };
}

function getAdaptiveWeeklySuggestions(profile) {
  if (!profile) return { workoutCandidates: [], workoutDays: [], restDays: [...DAYS], sessionMinutes: 45 };
  const sessionMinutes = clampNumber(profile?.sessionMinutes, 20, 90, 45);
  const targetDays = getEffectiveWorkoutDaysForPlanning(profile);
  const patternMode = getWorkoutPatternMode(profile);
  const preferredKey = profile?.preferredWindow || 'evening';

  const daySuggestions = DAYS.map(day => {
    const rawQuestType = getQuestTypeForWeekDay(profile.goal, day, new Date(), false) || 'Training';
    const isQuestRest = String(rawQuestType || '').toLowerCase() === 'rest';
    // Keep quest guidance, but do not hard-block planner workout candidates on quest rest tags.
    const planningQuestType = isQuestRest ? 'Training' : rawQuestType;
    const adjustedMinutes = getQuestAdjustedSessionMinutes(profile, planningQuestType);
    const daySuggestion = adjustedMinutes > 0
      ? buildAdaptiveDaySuggestion(day, adjustedMinutes, preferredKey)
      : { day, canTrain: false, remainingMinutes: 0, bestCandidate: null, candidates: [] };
    return {
      ...daySuggestion,
      questType: planningQuestType,
      rawQuestType,
      adjustedMinutes,
      isQuestRest,
    };
  });

  const ranked = daySuggestions
    .filter(item => item?.bestCandidate?.enoughForSession)
    .map(item => ({ ...item.bestCandidate, questType: item.questType, adjustedMinutes: item.adjustedMinutes }))
    .sort((a, b) => b.score - a.score);

  const patternChoice = chooseBestWorkoutPattern(daySuggestions, targetDays);
  const byDay = new Map((daySuggestions || []).map(item => [item.day, item]));
  const workoutDays = [];
  const pickedDaySet = new Set();

  // First pass: follow chosen efficient pattern (e.g., M-W-F).
  (patternChoice.days || []).forEach(day => {
    const item = byDay.get(day);
    if (!item || !item?.bestCandidate?.enoughForSession) return;
    workoutDays.push({
      ...item.bestCandidate,
      questType: item.questType,
      adjustedMinutes: item.adjustedMinutes,
    });
    pickedDaySet.add(day);
  });

  // Hard mode keeps a routine by aligning planned sessions to a consistent start time.
  if (patternMode === 'strict' && workoutDays.length > 1) {
    const aligned = alignStrictRoutineTime(workoutDays, byDay);
    workoutDays.length = 0;
    aligned.forEach(item => workoutDays.push(item));
  }

  // Second pass: flexible mode fills missing targets with best remaining valid days.
  if (patternMode === 'flexible') {
    ranked.forEach(candidate => {
      if (workoutDays.length >= targetDays) return;
      if (pickedDaySet.has(candidate.day)) return;
      workoutDays.push(candidate);
      pickedDaySet.add(candidate.day);
    });
  }

  const workoutDaySet = new Set(workoutDays.map(item => item.day));
  const restDays = DAYS.filter(day => !workoutDaySet.has(day));
  const planByDay = DAYS.map(day => {
    const workout = workoutDays.find(item => item.day === day);
    const meta = daySuggestions.find(item => item.day === day);
    if (workout) {
      return {
        day,
        questType: meta?.questType || 'Training',
        planType: 'workout',
        slot: workout,
      };
    }
    return {
      day,
      questType: meta?.questType || 'Rest',
      planType: 'rest',
      slot: null,
    };
  });

  return {
    sessionMinutes,
    targetDays,
    patternMode,
    selectedPatternDays: patternChoice.days || [],
    selectedPatternCoverage: patternChoice.coverage || 0,
    daySuggestions,
    workoutCandidates: ranked,
    workoutDays,
    restDays,
    planByDay,
  };
}

function buildSuggestedWorkoutCandidates(profile, insights) {
  if (!profile || !insights) return [];

  const preferredKey = profile?.preferredWindow || 'evening';
  const preferredRange = getPreferredWindowRange(profile?.autoWindowFromSchedule ? 'flexible' : preferredKey);
  const candidates = [];

  if (insights.todayFocusedSlot) {
    candidates.push({
      day: insights.day,
      startHour: insights.todayFocusedSlot.startHour,
      endHour: insights.todayFocusedSlot.endHour,
      priority: 999,
      source: 'today',
    });
  }

  DAYS.forEach(day => {
    const windows = getDayTrainingWindows(day)
      .map(window => ({
        day,
        window,
        score: scoreScheduleWindow(window, preferredRange, insights.sessionMinutes),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    windows.forEach((item, idx) => {
      const focused = getFocusedWorkoutSlot(item.window, insights.sessionMinutes, preferredKey) || item.window;
      candidates.push({
        day,
        startHour: focused.startHour,
        endHour: focused.endHour,
        priority: item.score - idx,
        source: 'ranked',
      });
    });
  });

  return candidates
    .filter(candidate => candidate.endHour > candidate.startHour)
    .sort((a, b) => b.priority - a.priority);
}

function scoreScheduleWindow(window, preferredRange, sessionMinutes) {
  const preferredCenter = (preferredRange[0] + preferredRange[1]) / 2;
  const windowCenter = (window.startHour + window.endHour) / 2;
  const overlap = Math.max(0, Math.min(window.endHour, preferredRange[1]) - Math.max(window.startHour, preferredRange[0]));
  return (window.hasWorkout ? 80 : 0)
    + overlap * 20
    + Math.min(window.lengthHours * 18, 54)
    + (window.lengthHours * 60 >= sessionMinutes ? 28 : 0)
    - Math.abs(preferredCenter - windowCenter) * 4;
}

function getDayTrainingWindows(day) {
  const hours = getRenderedHours();
  const windows = [];
  let activeStart = null;
  let activeEnd = null;
  let hasWorkout = false;

  const pushWindow = () => {
    if (activeStart === null || activeEnd === null) return;
    windows.push({
      day,
      startHour: activeStart,
      endHour: activeEnd + 1,
      lengthHours: activeEnd - activeStart + 1,
      hasWorkout,
      label: formatHourRange(activeStart, activeEnd + 1),
    });
  };

  hours.forEach(hour => {
    const state = getScheduleState(day, hour);
    if (state === 'free' || state === 'workout') {
      if (activeStart === null) activeStart = hour;
      activeEnd = hour;
      hasWorkout = hasWorkout || state === 'workout';
      return;
    }
    pushWindow();
    activeStart = null;
    activeEnd = null;
    hasWorkout = false;
  });

  pushWindow();
  return windows;
}

function getScheduleModeKey(scheduleContext) {
  if (!scheduleContext?.hasSchedule) return 'none';
  return `${scheduleContext.day}|${scheduleContext.todayWindow?.startHour ?? 'x'}|${scheduleContext.todayWindow?.endHour ?? 'x'}|${scheduleContext.todayAvailableMinutes}|${scheduleContext.sessionMinutes}`;
}

function getScheduleInsights(profile, dateISO = toISODate(new Date())) {
  const hasSchedule = !!Object.keys(G.scheduleBlocks || {}).length;
  const sessionMinutes = clampNumber(profile?.sessionMinutes, 20, 90, 45);
  const preferredKey = profile?.autoWindowFromSchedule ? 'flexible' : profile?.preferredWindow;
  const preferredRange = getPreferredWindowRange(preferredKey);
  const day = getScheduleDayKey(dateISO);
  const daySummaries = DAYS.map(dayKey => {
    const windows = getDayTrainingWindows(dayKey)
      .map(window => ({ ...window, score: scoreScheduleWindow(window, preferredRange, sessionMinutes) }))
      .sort((a, b) => b.score - a.score);
    return { day: dayKey, windows, bestWindow: windows[0] || null };
  });
  const todayEntry = daySummaries.find(entry => entry.day === day) || { day, windows: [], bestWindow: null };
  const todayFocusedSlot = getFocusedWorkoutSlot(todayEntry.bestWindow, sessionMinutes, profile?.preferredWindow || 'evening');
  const adaptiveWeekly = getAdaptiveWeeklySuggestions(profile);
  const todayAdaptive = adaptiveWeekly.daySuggestions.find(item => item.day === day) || null;
  const todayBeforeAfterSuggestion = todayAdaptive?.bestCandidate || getTodayBeforeAfterSuggestion(day, sessionMinutes, profile?.preferredWindow || 'evening');
  const todayRemainingMinutes = todayEntry.windows.reduce((sum, window) => sum + (window.lengthHours * 60), 0);
  const todayCanTrain = todayEntry.windows.some(window => (window.lengthHours * 60) >= sessionMinutes);
  const bestDays = daySummaries
    .filter(entry => entry.bestWindow)
    .sort((a, b) => (b.bestWindow?.score || 0) - (a.bestWindow?.score || 0))
    .slice(0, 3)
    .map(entry => ({
      day: entry.day,
      label: `${entry.day} · ${(getFocusedWorkoutSlot(entry.bestWindow, sessionMinutes, profile?.preferredWindow || 'evening') || entry.bestWindow).label}`,
      availableMinutes: entry.bestWindow.lengthHours * 60,
      windowKey: getWindowKeyFromHour(entry.bestWindow.startHour),
    }));
  const recommendedWindowKey = (todayFocusedSlot && getWindowKeyFromHour(todayFocusedSlot.startHour))
    || bestDays[0]?.windowKey
    || (profile?.preferredWindow || 'evening');

  return {
    hasSchedule,
    day,
    sessionMinutes,
    todayWindow: todayEntry.bestWindow,
    todayFocusedSlot,
    todayBeforeAfterSuggestion,
    todayRemainingMinutes,
    todayCanTrain,
    adaptiveWeekly,
    todayAvailableMinutes: todayEntry.bestWindow ? todayEntry.bestWindow.lengthHours * 60 : 0,
    bestDays,
    recommendedWindowKey,
  };
}

function renderScheduleRangeSelectors(hours) {
  const startEl = document.getElementById('sched-range-start');
  const endEl = document.getElementById('sched-range-end');
  if (!startEl || !endEl) return;
  const options = hours.map(h => ({ value: String(h), label: formatHourLabel(h) }));
  const endOptions = hours.map(h => ({ value: String(h + 1), label: formatHourLabel((h + 1) % 24) }));
  startEl.innerHTML = options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  endEl.innerHTML = endOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  if (String(startEl.value || '') === '' && options.length) startEl.value = options[0].value;
  if (String(endEl.value || '') === '' && endOptions.length > 1) endEl.value = endOptions[Math.min(2, endOptions.length - 1)].value;
}

function applyScheduleRangeFromControls() {
  const dayMode = document.getElementById('sched-range-day')?.value || 'all_weekdays';
  const startHour = parseInt(document.getElementById('sched-range-start')?.value || '6', 10);
  const endHour = parseInt(document.getElementById('sched-range-end')?.value || '7', 10);
  if (!Number.isFinite(startHour) || !Number.isFinite(endHour) || endHour <= startHour) {
    showToast('Pick a valid time range.');
    return;
  }

  const dayTargets = dayMode === 'all_weekdays'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    : dayMode === 'all_days'
      ? [...DAYS]
      : [dayMode];

  if (!G.scheduleBlocks) G.scheduleBlocks = {};
  dayTargets.forEach(day => {
    for (let hour = startHour; hour < endHour; hour += 1) {
      const slot = hourToSlotKey(hour);
      const key = `${day}-${slot}`;
      G.scheduleBlocks[key] = G.blockMode;
      const el = document.getElementById('tb-' + key);
      if (el) setBlockVisual(el, G.blockMode);
    }
  });

  analyseSchedule();
}

function startSchedulePaint(day, slot) {
  schedulePaintActive = true;
  paintScheduleBlock(day, slot);
}

function paintScheduleBlock(day, slot) {
  if (!schedulePaintActive) return;
  const key = `${day}-${slot}`;
  const el = document.getElementById('tb-' + key);
  if (!el) return;
  if (!G.scheduleBlocks) G.scheduleBlocks = {};
  G.scheduleBlocks[key] = G.blockMode;
  setBlockVisual(el, G.blockMode);
}

function stopSchedulePaint() {
  schedulePaintActive = false;
}

function setBlockVisual(el, state) {
  if (!el) return;
  const s = state || 'free';
  el.classList.remove('state-free', 'state-busy', 'state-workout');
  el.classList.add(`state-${s}`);
  el.dataset.state = s;
  const label = el.querySelector('.cs-state');
  if (label) {
    label.textContent = s === 'workout' ? 'Workout' : (s.charAt(0).toUpperCase() + s.slice(1));
  }
}

function loadScheduleFromStorage() {
  if (!G.scheduleBlocks) return;
  Object.entries(G.scheduleBlocks).forEach(([key, state]) => {
    const el = document.getElementById('tb-' + key);
    if (el) {
      setBlockVisual(el, state);
      return;
    }
    const [day, slot] = String(key).split('-');
    if (day && slot) {
      delete G.scheduleBlocks[key];
      setScheduleBlock(day, slot, state);
    }
  });
}

function setBlockMode(mode) {
  G.blockMode = mode;
  const label = document.getElementById('block-mode-label');
  if (label) {
    label.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    label.style.color = mode === 'free' ? 'var(--xp)' : mode === 'busy' ? 'var(--hp)' : 'var(--gold)';
  }
}

function cycleBlock(day, slot) {
  const key = `${day}-${slot}`;
  const el = document.getElementById('tb-' + key);
  if (!el) return;
  if (!G.scheduleBlocks) G.scheduleBlocks = {};
  G.scheduleBlocks[key] = G.blockMode;
  setBlockVisual(el, G.blockMode);
}

function saveManualSchedule() {
  captureRenderedScheduleBlocks();
  autoAssignWorkoutSessionsFromSchedule();
  localStorage.setItem('vq_schedule', JSON.stringify(G.scheduleBlocks || {}));
  analyseSchedule();
  showToast('📅 Planner saved! +10 XP');
  G.xp += 10; saveXP(); updateNavBar();
}

function autoAssignWorkoutSessionsFromSchedule() {
  if (!G.profile || !G.scheduleBlocks) return;

  const daysPerWeek = clampNumber(G.profile.days, 2, 6, 4);
  const insights = getScheduleInsights(G.profile);
  if (!insights?.bestDays?.length) return;

  // Reset previously-marked workout slots back to free before re-assigning.
  Object.entries(G.scheduleBlocks).forEach(([key, state]) => {
    if (state === 'workout') G.scheduleBlocks[key] = 'free';
  });

  const picked = insights.bestDays.slice(0, daysPerWeek);
  picked.forEach(item => {
    const day = item.day;
    const dayWindows = getDayTrainingWindows(day);
    if (!dayWindows.length) return;
    const bestWindow = dayWindows[0];
    const focused = getFocusedWorkoutSlot(bestWindow, insights.sessionMinutes, G.profile.preferredWindow || 'evening') || bestWindow;
    const start = focused.startHour;
    const end = Math.max(start + 1, focused.endHour);
    for (let hour = start; hour < end; hour += 1) {
      const slot = hourToSlotKey(hour);
      const key = `${day}-${slot}`;
      if (G.scheduleBlocks[key] === 'free') {
        G.scheduleBlocks[key] = 'workout';
      }
    }
  });

  // Refresh visible blocks in the week grid after assignment.
  Object.entries(G.scheduleBlocks).forEach(([key, state]) => {
    const el = document.getElementById('tb-' + key);
    if (el) setBlockVisual(el, state);
  });
}

function analyseSchedule() {
  captureRenderedScheduleBlocks();
  const blocks = G.scheduleBlocks || {};
  const freeSlots = Object.entries(blocks).filter(([,v]) => v === 'free');
  const workoutSlots = Object.entries(blocks).filter(([,v]) => v === 'workout');
  const busySlots = Object.entries(blocks).filter(([,v]) => v === 'busy');
  const el = document.getElementById('sched-analysis');
  if (!el) return;
  if (!Object.keys(blocks).length) {
    el.style.display = 'none'; return;
  }
  const freeByDay = {};
  freeSlots.forEach(([key]) => {
    const [day] = key.split('-');
    freeByDay[day] = (freeByDay[day] || 0) + 1;
  });
  const bestDays = Object.entries(freeByDay).sort((a,b) => b[1]-a[1]).slice(0,3).map(([d]) => d);
  const today = new Date();
  const upcomingDateEvents = (G.plannerDates || []).filter(item => {
    if (!item?.date) return false;
    const dt = new Date(item.date + 'T00:00:00');
    return !Number.isNaN(dt.getTime()) && dt >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const scheduleInsights = G.profile ? getScheduleInsights(G.profile) : null;
  const adaptiveWeekly = scheduleInsights?.adaptiveWeekly;
  const targetWorkoutDays = G.profile ? getTargetWorkoutDays(G.profile) : null;
  const detectedWorkoutSlots = adaptiveWeekly?.workoutCandidates?.length || 0;
  const selectedPattern = adaptiveWeekly?.selectedPatternDays?.length ? adaptiveWeekly.selectedPatternDays.join('-') : '';
  const patternModeLabel = adaptiveWeekly?.patternMode === 'strict' ? 'Hard' : 'Soft';
  const adaptiveWorkoutSummary = adaptiveWeekly?.workoutDays?.length
    ? adaptiveWeekly.workoutDays.map(item => `${item.day} (${item.bandLabel.toLowerCase()})`).join(', ')
    : '';
  const adaptiveRestSummary = adaptiveWeekly?.restDays?.length ? adaptiveWeekly.restDays.join(', ') : '';
  const bestSuggestedSlot = scheduleInsights?.bestDays?.[0]?.label || '';
  const todaySuggestion = scheduleInsights?.todayBeforeAfterSuggestion;
  const todayContextLabel = todaySuggestion?.context === 'before'
    ? 'before school/work'
    : todaySuggestion?.context === 'after'
      ? 'after school/work'
      : 'in your free time';
  el.style.display = 'block';
  const effectiveFreq = getEffectiveWorkoutDaysForPlanning(G.profile);
  const defaultFreq = getTargetWorkoutDays(G.profile);
  const isFreqOverridden = G.plannerFrequencyOverride !== null;
  const frequencyDisplay = isFreqOverridden ? `<span style="color:var(--orange)">${effectiveFreq}</span>` : `<span style="color:var(--xp)">${effectiveFreq}</span>`;
  const splitSelector = G.profile?.goal === 'build_muscle'
    ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
        <span style="font-size:0.72rem;color:var(--muted2)">Quest split</span>
        <select onchange="setBuildMuscleSplit(this.value)" style="background:rgba(15,23,42,0.95);border:1px solid #3b4a76;border-radius:6px;color:var(--text);font-size:0.72rem;padding:4px 8px;font-family:'Rajdhani',sans-serif">
          <option value="classic" ${getBuildMuscleSplitKey(G.profile) === 'classic' ? 'selected' : ''}>Classic</option>
          <option value="ppl" ${getBuildMuscleSplitKey(G.profile) === 'ppl' ? 'selected' : ''}>Push Pull Legs</option>
          <option value="upper_lower" ${getBuildMuscleSplitKey(G.profile) === 'upper_lower' ? 'selected' : ''}>Upper Lower</option>
          <option value="arnold" ${getBuildMuscleSplitKey(G.profile) === 'arnold' ? 'selected' : ''}>Arnold</option>
        </select>
      </div>`
    : '';
  el.innerHTML = `
    <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.75rem;color:var(--gold);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">📊 Schedule Analysis</div>
    
    <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px">
      <button onclick="adjustWorkoutFrequency(-1)" style="padding:6px 10px;background:rgba(124,58,237,0.2);border:1.5px solid var(--purple);border-radius:4px;color:var(--purple);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center">−</button>
      <div style="text-align:center;font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:700;color:var(--gold);min-width:24px">${frequencyDisplay}</div>
      <button onclick="adjustWorkoutFrequency(1)" style="padding:6px 10px;background:rgba(124,58,237,0.2);border:1.5px solid var(--purple);border-radius:4px;color:var(--purple);font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center">+</button>
      ${isFreqOverridden ? `<button onclick="resetWorkoutFrequency()" style="padding:4px 8px;background:rgba(251,146,60,0.15);border:1px solid var(--orange);border-radius:4px;color:var(--orange);font-family:'Rajdhani',sans-serif;font-size:0.65rem;font-weight:600;cursor:pointer">Reset</button>` : ''}
    </div>
    ${splitSelector}
    
    ${bestDays.length ? `<div style="margin-bottom:6px">✅ Best training days: <strong style="color:var(--xp)">${bestDays.join(', ')}</strong></div>` : ''}
    ${todaySuggestion ? `<div style="margin-bottom:6px">🕒 Recommended training slot today: <strong style="color:var(--mana)">${todaySuggestion.label}</strong> (${todaySuggestion.durationMinutes} min), ideally <strong>${todayContextLabel}</strong>.</div>` : scheduleInsights?.hasSchedule ? `<div style="margin-bottom:6px">⏳ No focused slot found today for ${scheduleInsights.sessionMinutes} minutes. Try adding more free blocks or extending planner hours.</div>` : ''}
    ${targetWorkoutDays !== null ? `<div style="margin-bottom:6px">🎯 Structured plan for ${effectiveFreq} day(s): <strong style="color:var(--gold)">Valid detected slots: ${detectedWorkoutSlots}</strong>.</div>` : ''}
    ${selectedPattern ? `<div style="margin-bottom:6px">🗓️ Selected pattern: <strong style="color:var(--mana)">${selectedPattern}</strong> · <strong>${patternModeLabel}</strong> mode</div>` : ''}
    ${scheduleInsights?.hasSchedule ? `<div style="margin-bottom:6px">⏱️ Remaining trainable time today: <strong style="color:var(--xp)">${scheduleInsights.todayRemainingMinutes} min</strong>${scheduleInsights.todayCanTrain ? '' : ` (needs at least ${scheduleInsights.sessionMinutes} min for your target session)`}.</div>` : ''}
    ${adaptiveWorkoutSummary ? `<div style="margin-bottom:6px">🧩 Adaptive workout days: <strong style="color:var(--mana)">${adaptiveWorkoutSummary}</strong></div>` : ''}
    ${adaptiveRestSummary ? `<div style="margin-bottom:6px">🛌 Adaptive rest days: <strong style="color:var(--muted2)">${adaptiveRestSummary}</strong></div>` : ''}
    ${bestSuggestedSlot ? `<div style="margin-bottom:8px">💡 Best overall workout time: <strong style="color:var(--gold)">${bestSuggestedSlot}</strong></div>` : ''}
    ${(adaptiveWeekly?.workoutDays?.length || todaySuggestion || scheduleInsights?.todayFocusedSlot || scheduleInsights?.bestDays?.length) ? `<button onclick="addSuggestedWorkoutEntry()" style="width:100%;padding:12px 0;background:linear-gradient(135deg,var(--xp2),var(--xp));border:none;border-radius:9px;color:#0d0f1a;font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:700;letter-spacing:0.06em;cursor:pointer;margin-top:8px">💪 Auto-Plan ${effectiveFreq} Workout Days</button>` : ''}
  `;
}

function togglePatternMode() {
  if (!G.profile) return;
  const current = getWorkoutPatternMode(G.profile);
  G.profile.patternMode = current === 'strict' ? 'flexible' : 'strict';
  localStorage.setItem('vq_profile', JSON.stringify(G.profile));
  showToast(`✅ Pattern mode: ${G.profile.patternMode === 'strict' ? 'Hard' : 'Soft'}`);
  analyseSchedule();
}

function setBuildMuscleSplit(nextSplit) {
  if (!G.profile) return;
  if (G.profile.goal !== 'build_muscle') return;
  const next = getBuildMuscleSplitKey({ buildMuscleSplit: nextSplit });
  if (getBuildMuscleSplitKey(G.profile) === next) return;
  G.profile.buildMuscleSplit = next;
  localStorage.setItem('vq_profile', JSON.stringify(G.profile));
  G.today.planSnapshot = null;
  saveToday();
  analyseSchedule();
  if (document.getElementById('screen-schedule')?.classList.contains('active')) renderScheduleScreen();
  if (document.getElementById('screen-plan')?.classList.contains('active')) renderPlan();
  if (document.getElementById('screen-hq')?.classList.contains('active')) refreshHQ();
  showToast('✅ Muscle split updated');
}

function addSuggestedWorkoutEntry() {
  captureRenderedScheduleBlocks();
  const insights = G.profile ? getScheduleInsights(G.profile) : null;
  if (!insights) { showToast('No schedule insights available.'); return; }
  if (!G.scheduleEntries) G.scheduleEntries = [];

  const adaptiveWeekly = insights.adaptiveWeekly || getAdaptiveWeeklySuggestions(G.profile);
  const targetSessionsPerWeek = getEffectiveWorkoutDaysForPlanning(G.profile);
  const manualWorkoutDays = new Set(
    G.scheduleEntries
      .filter(item => item && (item.type || 'busy') === 'workout' && !String(item.note || '').toLowerCase().includes('auto-suggested'))
      .map(item => item.day)
  );

  // Refresh previously auto-generated workout sessions so the plan stays adaptive.
  G.scheduleEntries = G.scheduleEntries.filter(item => {
    if (!item) return false;
    if ((item.type || 'busy') !== 'workout') return true;
    const isTaggedAutoPlan = String(item.source || '') === 'auto-plan';
    const hasLegacyAutoSuggestedNote = String(item.note || '').toLowerCase().includes('auto-suggested');
    return !(isTaggedAutoPlan || hasLegacyAutoSuggestedNote);
  });

  let remainingToPlan = Math.max(0, targetSessionsPerWeek - manualWorkoutDays.size);
  const selected = [];

  (adaptiveWeekly.planByDay || [])
    .filter(item => item.planType === 'workout' && item.slot)
    .map(item => ({ ...item.slot, questType: item.questType }))
    .forEach(candidate => {
    if (remainingToPlan <= 0) return;
    if (manualWorkoutDays.has(candidate.day)) return;
    if (selected.some(item => item.day === candidate.day)) return;
    if (hasExactWorkoutEntry(candidate.day, candidate.startHour, candidate.endHour)) return;
    if (hasScheduleConflict(candidate.day, candidate.startHour, candidate.endHour, ['busy', 'workout'])) return;
    selected.push(candidate);
    remainingToPlan -= 1;
  });

  if (!selected.length && manualWorkoutDays.size === 0) {
    showToast('No valid edge free-time slots found this week. Add more before/after-school free blocks.');
    return;
  }

  selected.forEach(candidate => {
    const startMinute = candidate.startHour * 60;
    const endMinute = candidate.endHour * 60;
    G.scheduleEntries.push({
      id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      day: candidate.day,
      startHour: candidate.startHour,
      endHour: candidate.endHour,
      startMinute,
      endMinute,
      type: 'workout',
      source: 'auto-plan',
      note: `Workout Session (auto-suggested ${candidate.questType} · ${candidate.bandLabel.toLowerCase()} ${candidate.edge})`,
    });
    ensureScheduleEndCapacity(candidate.endHour);
  });

  const finalWorkoutDays = new Set([
    ...manualWorkoutDays,
    ...selected.map(item => item.day),
  ]);
  const finalRestDays = DAYS.filter(day => !finalWorkoutDays.has(day));
  const goalKey = G.profile?.goal || 'get_fit';
  const workoutQuestByDay = new Map();

  if (goalKey === 'build_muscle') {
    const splitCycle = getPlanTypesForGoal(goalKey, G.profile)
      .filter(type => String(type || '').toLowerCase() !== 'rest' && String(type || '').toLowerCase() !== 'training');
    const orderedWorkoutDays = DAYS.filter(day => finalWorkoutDays.has(day));
    orderedWorkoutDays.forEach((day, idx) => {
      workoutQuestByDay.set(day, splitCycle[idx % Math.max(1, splitCycle.length)] || 'Chest');
    });
  }

  const finalPlanByDay = DAYS.map(day => {
    const selectedSlot = selected.find(item => item.day === day) || null;
    const planMeta = (adaptiveWeekly.planByDay || []).find(item => item.day === day);
    if (selectedSlot || manualWorkoutDays.has(day)) {
      const fallbackQuestType = getQuestTypeForWeekDay(goalKey, day, new Date(), false) || 'Training';
      const splitQuestType = workoutQuestByDay.get(day) || null;
      const resolvedQuestType = splitQuestType || planMeta?.questType || selectedSlot?.questType || fallbackQuestType;
      return {
        day,
        questType: String(resolvedQuestType || '').toLowerCase() === 'rest' ? (splitQuestType || 'Training') : resolvedQuestType,
        planType: 'workout',
        slot: selectedSlot,
      };
    }
    return {
      day,
      questType: planMeta?.questType || 'Rest',
      planType: 'rest',
      slot: null,
    };
  });

  syncAdaptiveQuestCalendarEvents(finalPlanByDay, G.profile?.goal || 'get_fit');

  saveScheduleEntries();
  savePlannerDates();
  captureRenderedScheduleBlocks();
  renderScheduleScreen();
  if (document.getElementById('screen-plan')?.classList.contains('active')) renderPlan();
  if (document.getElementById('screen-hq')?.classList.contains('active')) refreshHQ();
  showToast(`💪 Planned ${finalWorkoutDays.size} workout day(s). Rest days: ${finalRestDays.join(', ') || 'none'}.`);
}

// Schedule photo scan
function onSchedDragOver(e) { e.preventDefault(); document.getElementById('sched-scan-zone').classList.add('dragover'); }
function onSchedDragLeave() { document.getElementById('sched-scan-zone').classList.remove('dragover'); }
function onSchedDrop(e) { e.preventDefault(); document.getElementById('sched-scan-zone').classList.remove('dragover'); processSchedFile(e.dataTransfer.files[0]); }
function onSchedFileChange(e) { processSchedFile(e.target.files[0]); }

async function callGeminiVision(base64Data, mimeType, prompt) {
  const key = (localStorage.getItem('vq_gemini_key') || '').trim();
  if (!key) throw new Error('No Gemini API key set. Add your key in Settings.');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: base64Data } }, { text: prompt }] }] }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const errText = d?.error?.message || `HTTP ${r.status}`;
    throw new Error(`Gemini request failed: ${errText}`);
  }
  return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiText(systemPrompt, userPrompt) {
  const key = (localStorage.getItem('vq_gemini_key') || '').trim();
  if (!key) throw new Error('No Gemini API key set. Add your key in Settings.');
  const mergedPrompt = `${systemPrompt}\n\nUser message: ${userPrompt}\n\nReply as the Sage now.`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: mergedPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 220,
      },
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const errText = d?.error?.message || `HTTP ${r.status}`;
    throw new Error(`Gemini request failed: ${errText}`);
  }
  const parts = d?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(part => part?.text || '').join('').trim();
  return text;
}

async function callOllamaChat(payload) {
  const r = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const errText = d?.error?.message || d?.message || `HTTP ${r.status}`;
    throw new Error(`Ollama request failed: ${errText}`);
  }
  return d;
}

async function callOllamaVision(prompt, base64Data, model = 'llava:7b') {
  const d = await callOllamaChat({
    model,
    messages: [
      {
        role: 'user',
        content: prompt,
        images: [base64Data],
      },
    ],
  });
  return d?.message?.content || d?.response || '';
}

async function callPaddleOcr(src) {
  const base64 = src.split(',')[1];
  const r = await fetch('http://localhost:8181/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  });
  if (!r.ok) throw new Error(`PaddleOCR server HTTP ${r.status}`);
  const d = await r.json().catch(() => ({}));
  if (!d.ok) throw new Error(`PaddleOCR: ${d.error || 'unknown error'}`);
  return d; // { ok, words, text, confidence }
}

async function callAnthropicMessages(payload) {
  const r = await fetch('/api/anthropic/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const errText = d?.error?.message || d?.message || `HTTP ${r.status}`;
    throw new Error(`Anthropic request failed: ${errText}`);
  }
  return d;
}

async function callNearbyGyms(lat, lng) {
  const query = `[out:json][timeout:25];(node["leisure"="fitness_centre"](around:5000,${lat},${lng});node["leisure"="sports_centre"]["sport"="fitness"](around:5000,${lat},${lng}););out body;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!r.ok) throw new Error(`Overpass API error: HTTP ${r.status}`);
  const d = await r.json().catch(() => { throw new Error('Invalid response from Overpass API.'); });
  return d;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function computeDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function mapOverpassToGyms(elements, originLat, originLng) {
  return (elements || []).map((el, idx) => {
    const tags = el.tags || {};
    const placeLat = Number(el.lat);
    const placeLng = Number(el.lon);
    const distanceKm = Number.isFinite(placeLat) && Number.isFinite(placeLng)
      ? computeDistanceKm(originLat, originLng, placeLat, placeLng)
      : null;

    const addrParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'] || tags['addr:suburb'],
    ].filter(Boolean);
    const address = addrParts.length ? addrParts.join(', ') : 'Address unavailable';

    const sports = tags['sport'] ? tags['sport'].split(';').map(s => s.trim()) : [];
    const amenities = sports.length ? sports.slice(0, 3) : ['Fitness', 'Cardio', 'Strength'];

    return {
      name: tags.name || 'Unnamed Gym',
      address,
      lat: placeLat,
      lng: placeLng,
      distance_km: distanceKm !== null ? distanceKm.toFixed(1) : '?',
      rating: null,
      is_open: false,
      type: tags.leisure === 'sports_centre' ? 'Sports Centre' : 'Gym',
      amenities,
      price_range: tags.fee === 'yes' ? 'Paid membership' : tags.fee === 'no' ? 'Free' : 'Pricing varies',
      hours: tags.opening_hours || 'Hours unavailable',
      place_id: `osm-node-${el.id || idx}`,
    };
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseModelJson(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Empty AI response.');
  const noFence = raw.replace(/```json|```/gi, '').trim();
  try { return JSON.parse(noFence); } catch {}
  const objStart = noFence.indexOf('{');
  const arrStart = noFence.indexOf('[');
  const startCandidates = [objStart, arrStart].filter(idx => idx >= 0);
  const start = startCandidates.length ? Math.min(...startCandidates) : -1;
  const objEnd = noFence.lastIndexOf('}');
  const arrEnd = noFence.lastIndexOf(']');
  const end = Math.max(objEnd, arrEnd);
  if (start !== -1 && end !== -1 && end > start) {
    const slice = noFence.slice(start, end + 1);
    return JSON.parse(slice);
  }
  throw new Error('AI returned non-JSON output.');
}

function normalizeDayKey(day) {
  const v = String(day || '').trim().toLowerCase();
  const map = {
    mon: 'Mon', monday: 'Mon',
    tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
    wed: 'Wed', weds: 'Wed', wednesday: 'Wed',
    thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
    fri: 'Fri', friday: 'Fri',
    sat: 'Sat', saturday: 'Sat',
    sun: 'Sun', sunday: 'Sun',
  };
  return map[v] || null;
}

function normalizeSlotKey(slot) {
  const v = String(slot || '').trim().toLowerCase();
  if (v === 'am' || /morning/.test(v)) return 'AM';
  if (v === 'mid' || v === 'midday' || /noon|lunch/.test(v)) return 'Mid';
  if (v === 'pm' || /afternoon/.test(v)) return 'PM';
  if (v === 'eve' || /evening|night/.test(v)) return 'Eve';
  return null;
}

function setScheduleBlock(day, slot, state) {
  const normDay = normalizeDayKey(day);
  if (!normDay) return;
  if (!G.scheduleBlocks) G.scheduleBlocks = {};

  const hour = slotKeyToHour24(slot);
  if (Number.isFinite(hour)) {
    const key = `${normDay}-${hourToSlotKey(hour)}`;
    G.scheduleBlocks[key] = state;
    const el = document.getElementById('tb-' + key);
    setBlockVisual(el, state);
    return;
  }

  const normSlot = normalizeSlotKey(slot);
  if (!normSlot) return;
  hoursForLegacySlot(normSlot).forEach(h => {
    const key = `${normDay}-${hourToSlotKey(h)}`;
    G.scheduleBlocks[key] = state;
    const el = document.getElementById('tb-' + key);
    setBlockVisual(el, state);
  });
}

function extractDayMentions(line) {
  const days = [];
  const patterns = [
    ['Mon', /\b(mon|monday)\b/g],
    ['Tue', /\b(tue|tues|tuesday)\b/g],
    ['Wed', /\b(wed|weds|wednesday)\b/g],
    ['Thu', /\b(thu|thur|thurs|thursday)\b/g],
    ['Fri', /\b(fri|friday)\b/g],
    ['Sat', /\b(sat|saturday)\b/g],
    ['Sun', /\b(sun|sunday)\b/g],
  ];
  patterns.forEach(([day, regex]) => {
    if (regex.test(line)) days.push(day);
  });
  return days;
}

function extractSlotMentions(line) {
  const slots = new Set();
  if (/\b(am|morning|before\s*noon)\b/.test(line)) slots.add('AM');
  if (/\b(mid|midday|noon|lunch)\b/.test(line)) slots.add('Mid');
  if (/\b(pm|afternoon)\b/.test(line)) slots.add('PM');
  if (/\b(eve|evening|night|tonight)\b/.test(line)) slots.add('Eve');
  return [...slots];
}

function inferSlotsFromHours(line) {
  const slots = new Set();
  const timeRegex = /(\d{1,2})(?::\d{2})?\s*(am|pm)?/gi;
  let match;
  while ((match = timeRegex.exec(line)) !== null) {
    let hour = parseInt(match[1], 10);
    if (!Number.isFinite(hour)) continue;
    const ampm = (match[2] || '').toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    if (hour < 11) slots.add('AM');
    else if (hour < 14) slots.add('Mid');
    else if (hour < 18) slots.add('PM');
    else slots.add('Eve');
  }
  return [...slots];
}

function hasFreeHint(line) {
  return /\b(free|open|available|off|rest|holiday|vacant|none)\b/.test(line);
}

function mapHourToSlot(hour24) {
  if (hour24 < 11) return 'AM';
  if (hour24 < 14) return 'Mid';
  if (hour24 < 18) return 'PM';
  return 'Eve';
}

function parseTimeToHour24(value, ampmHint = '') {
  const m = String(value || '').trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  if (!Number.isFinite(hour)) return null;
  const ampm = String(ampmHint || '').toLowerCase();
  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  if (hour < 0 || hour > 23) return null;
  return hour;
}

function slotsFromTimeRange(startHour, endHour) {
  if (!Number.isFinite(startHour)) return [];
  const slots = new Set();
  const safeEnd = Number.isFinite(endHour) ? Math.max(endHour, startHour + 1) : startHour + 1;
  for (let h = startHour; h < safeEnd; h += 1) {
    slots.add(mapHourToSlot(h));
  }
  return [...slots];
}

function extractTimeRangeSlots(line) {
  const text = String(line || '').toLowerCase();
  const re = /(\d{1,2}(?::\d{2})?)\s*(am|pm)?\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)?/;
  const m = text.match(re);
  if (!m) return [];

  const startText = m[1];
  const startAmpm = m[2] || m[4] || '';
  const endText = m[3];
  const endAmpm = m[4] || m[2] || '';

  const startHour = parseTimeToHour24(startText, startAmpm);
  let endHour = parseTimeToHour24(endText, endAmpm);
  if (Number.isFinite(startHour) && Number.isFinite(endHour) && endHour <= startHour) {
    endHour += 12;
    if (endHour > 23) endHour = startHour + 1;
  }
  return slotsFromTimeRange(startHour, endHour);
}

function hoursFromTimeRange(startHour, endHour) {
  if (!Number.isFinite(startHour)) return [];
  const safeEnd = Number.isFinite(endHour) ? Math.max(endHour, startHour + 1) : startHour + 1;
  const out = [];
  for (let h = startHour; h < safeEnd; h += 1) {
    const wrapped = ((h % 24) + 24) % 24;
    out.push(wrapped);
  }
  return out;
}

function extractTimeRangeHours(line) {
  const text = String(line || '').toLowerCase();
  const re = /(\d{1,2}(?::\d{2})?)\s*(am|pm)?\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)?/g;
  const hours = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const startText = m[1];
    const startAmpm = m[2] || m[4] || '';
    const endText = m[3];
    const endAmpm = m[4] || m[2] || '';

    const startHour = parseTimeToHour24(startText, startAmpm);
    let endHour = parseTimeToHour24(endText, endAmpm);
    if (Number.isFinite(startHour) && Number.isFinite(endHour) && endHour <= startHour) {
      endHour += 12;
      if (endHour <= startHour) endHour = startHour + 1;
    }
    hoursFromTimeRange(startHour, endHour).forEach(h => hours.add(h));
  }
  return [...hours];
}

function normalizeOcrWord(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z]/g, '');
}

function detectDayColumns(words) {
  if (!Array.isArray(words) || !words.length) return [];
  const tops = words.map(w => w?.bbox?.y0).filter(v => Number.isFinite(v));
  const topBand = tops.length ? Math.min(...tops) + 140 : 180;
  const columns = [];

  words.forEach(word => {
    const text = normalizeOcrWord(word?.text);
    const day = normalizeDayKey(text);
    const box = word?.bbox || {};
    const y0 = Number(box.y0);
    const x0 = Number(box.x0);
    const x1 = Number(box.x1);
    if (!day || !Number.isFinite(y0) || !Number.isFinite(x0) || !Number.isFinite(x1)) return;
    if (y0 > topBand) return;
    columns.push({ day, x: (x0 + x1) / 2 });
  });

  const dedup = [];
  columns.forEach(col => {
    const exists = dedup.some(d => d.day === col.day || Math.abs(d.x - col.x) < 25);
    if (!exists) dedup.push(col);
  });
  return dedup.sort((a, b) => a.x - b.x);
}

function groupWordsIntoLines(words) {
  if (!Array.isArray(words)) return [];
  const sorted = [...words]
    .filter(w => w?.text && w?.bbox && Number.isFinite(w.bbox.y0) && Number.isFinite(w.bbox.x0) && Number.isFinite(w.bbox.x1) && Number.isFinite(w.bbox.y1))
    .sort((a, b) => (a.bbox.y0 - b.bbox.y0) || (a.bbox.x0 - b.bbox.x0));

  const lines = [];
  const threshold = 16;
  sorted.forEach(word => {
    const cy = (word.bbox.y0 + word.bbox.y1) / 2;
    const candidate = lines.find(line => Math.abs(line.cy - cy) <= threshold);
    if (candidate) {
      candidate.words.push(word);
      candidate.cy = (candidate.cy * (candidate.words.length - 1) + cy) / candidate.words.length;
      candidate.x0 = Math.min(candidate.x0, word.bbox.x0);
      candidate.x1 = Math.max(candidate.x1, word.bbox.x1);
    } else {
      lines.push({ words: [word], cy, x0: word.bbox.x0, x1: word.bbox.x1 });
    }
  });

  return lines.map(line => {
    const ordered = line.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
    return {
      text: ordered.map(w => w.text).join(' ').trim(),
      x: (line.x0 + line.x1) / 2,
      y: line.cy,
    };
  });
}

function nearestDayFromX(x, dayColumns) {
  if (!dayColumns.length || !Number.isFinite(x)) return null;
  let best = dayColumns[0];
  let bestDist = Math.abs(x - best.x);
  for (let i = 1; i < dayColumns.length; i += 1) {
    const d = Math.abs(x - dayColumns[i].x);
    if (d < bestDist) {
      bestDist = d;
      best = dayColumns[i];
    }
  }
  return best.day;
}

function parseScheduleFromOcrData(data) {
  const text = String(data?.text || '');
  const words = Array.isArray(data?.words) ? data.words : [];
  const dayColumns = detectDayColumns(words);
  const lines = groupWordsIntoLines(words);

  const busyMap = {};
  const freeMap = {};
  DAYS.forEach(day => {
    busyMap[day] = new Set();
    freeMap[day] = new Set();
  });

  lines.forEach(line => {
    const lineText = String(line.text || '').toLowerCase();
    let slots = extractTimeRangeHours(lineText).map(hourToSlotKey);
    if (!slots.length) slots = extractTimeRangeSlots(lineText);
    if (!slots.length) slots = extractSlotMentions(lineText);
    if (!slots.length) return;

    let days = extractDayMentions(lineText);
    if (!days.length) {
      const inferredDay = nearestDayFromX(line.x, dayColumns);
      if (inferredDay) days = [inferredDay];
    }
    if (!days.length) return;

    const markFree = hasFreeHint(lineText);
    days.forEach(day => {
      slots.forEach(slot => {
        if (markFree) {
          freeMap[day].add(slot);
          busyMap[day].delete(slot);
        } else {
          busyMap[day].add(slot);
          freeMap[day].delete(slot);
        }
      });
    });
  });

  const busy = DAYS.map(day => ({ day, slots: [...busyMap[day]] })).filter(item => item.slots.length);
  const free = DAYS.map(day => ({ day, slots: [...freeMap[day]] })).filter(item => item.slots.length);

  if (!busy.length && !free.length) {
    return parseScheduleFromOcrText(text);
  }

  const busySlots = busy.reduce((sum, item) => sum + item.slots.length, 0);
  const summary = `Timetable-style scan detected about ${busySlots} busy slot(s) across ${busy.length} day(s).`;
  return { busy, free, summary, detectedHourSpan: findDetectedHourSpan({ busy, free }) };
}

function parseScheduleFromOcrText(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(l => l.trim().toLowerCase())
    .filter(Boolean);

  const busyMap = {};
  const freeMap = {};
  DAYS.forEach(day => {
    busyMap[day] = new Set();
    freeMap[day] = new Set();
  });

  for (const line of lines) {
    const days = extractDayMentions(line);
    if (!days.length) continue;

    let slots = extractTimeRangeHours(line).map(hourToSlotKey);
    if (!slots.length) slots = extractSlotMentions(line);
    if (!slots.length) slots = inferSlotsFromHours(line);
    if (!slots.length) slots = ['Mid'];

    const markFree = hasFreeHint(line);
    days.forEach(day => {
      slots.forEach(slot => {
        if (markFree) {
          freeMap[day].add(slot);
          busyMap[day].delete(slot);
        } else {
          busyMap[day].add(slot);
          freeMap[day].delete(slot);
        }
      });
    });
  }

  const busy = DAYS
    .map(day => ({ day, slots: [...busyMap[day]] }))
    .filter(item => item.slots.length);

  const free = DAYS
    .map(day => ({ day, slots: [...freeMap[day]] }))
    .filter(item => item.slots.length);

  if (!busy.length && !free.length) {
    throw new Error('OCR could not confidently detect day/time patterns from this image.');
  }

  const busySlots = busy.reduce((sum, item) => sum + item.slots.length, 0);
  const busyDays = busy.map(item => item.day).join(', ');
  const summary = busy.length
    ? `Detected approximately ${busySlots} busy time blocks across ${busy.length} day(s): ${busyDays}.`
    : 'Detected mostly free schedule blocks; please review and fine-tune manually.';

  return { busy, free, summary, detectedHourSpan: findDetectedHourSpan({ busy, free }) };
}

async function runTesseractScheduleOcr(imageSrc, onProgress) {
  if (!window.Tesseract || typeof window.Tesseract.recognize !== 'function') {
    throw new Error('OCR engine failed to load. Check your internet connection and try again.');
  }
  const result = await window.Tesseract.recognize(imageSrc, 'eng', {
    tessedit_pageseg_mode: '6',
    preserve_interword_spaces: '1',
    logger: msg => {
      if (msg && msg.status === 'recognizing text' && typeof msg.progress === 'number') {
        onProgress?.(Math.round(msg.progress * 100));
      }
    },
  });
  return result?.data || { text: '' };
}

function countScheduleEntries(scheduleData) {
  const countType = (scheduleData?.busy || []).reduce((sum, item) => sum + (item?.slots?.length || 0), 0)
    + (scheduleData?.free || []).reduce((sum, item) => sum + (item?.slots?.length || 0), 0);
  return countType;
}

function countBusyEntries(scheduleData) {
  return (scheduleData?.busy || []).reduce((sum, item) => sum + (item?.slots?.length || 0), 0);
}

function evaluateScheduleCandidate(parsed, confidence) {
  const totalEntries = countScheduleEntries(parsed);
  const busyEntries = countBusyEntries(parsed);
  const busyDays = (parsed?.busy || []).filter(item => (item?.slots?.length || 0) > 0).length;
  const span = parsed?.detectedHourSpan || getScheduleMeta();
  const hours = Math.max(3, Number(span?.endHour || 23) - Number(span?.startHour || 7));
  const capacity = Math.max(1, hours * DAYS.length);
  const busyRatio = busyEntries / capacity;

  // Favor realistic occupancy and day spread over raw block count.
  let score = Number(confidence || 0);
  score += Math.min(totalEntries, 56) * 1.6;
  score += busyDays * 6;

  if (busyEntries < 2) score -= 26;
  if (busyRatio > 0.72) score -= (busyRatio - 0.72) * 180;
  if (busyRatio < 0.02 && busyEntries > 0) score -= 12;

  return {
    score,
    totalEntries,
    busyEntries,
    busyDays,
    busyRatio,
    confidence: Number(confidence || 0),
  };
}

async function enhanceScheduleImageForOcr(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = img.width < 1400 ? 2 : 1.4;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.imageSmoothingEnabled = false;
        ctx.filter = 'grayscale(1) contrast(1.45) brightness(1.1)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const v = lum > 162 ? 255 : 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
        }
        ctx.putImageData(pixels, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for OCR enhancement.'));
    img.src = imageSrc;
  });
}

// Colour-preserving upscale for Gemini — do NOT binarize; colour fills help Gemini identify busy cells
async function enhanceForGemini(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = img.width < 1200 ? 2 : 1.5;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.filter = 'contrast(1.35) saturate(1.5) brightness(1.05)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Failed to load image for Gemini enhancement.'));
    img.src = imageSrc;
  });
}

function parseHourFromToken(rawToken) {
  const token = String(rawToken || '').trim().toLowerCase();
  if (!token) return null;
  let m = token.match(/^h?(\d{1,2})$/i);
  if (m) {
    const hour = parseInt(m[1], 10);
    if (hour >= 0 && hour <= 23) return hour;
  }
  m = token.match(/^(\d{1,2})(?::\d{2})?\s*(am|pm)$/i);
  if (m) {
    let hour = parseInt(m[1], 10);
    if (hour < 1 || hour > 12) return null;
    const suffix = m[2].toLowerCase();
    if (suffix === 'am') hour = hour % 12;
    else hour = (hour % 12) + 12;
    return hour;
  }
  // 08:00 or 20:00 - plain 24h time, no am/pm suffix
  m = token.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hour = parseInt(m[1], 10);
    if (hour >= 0 && hour <= 23) return hour;
  }
  return null;
}

function parseSlotTokens(value) {
  const text = String(value || '').trim();
  if (!text) return [];
  const rangeParts = text.split(/\s*(?:-|–|to)\s*/i);
  const rangeMatch = rangeParts.length === 2 ? [text, rangeParts[0], rangeParts[1]] : null;
  if (rangeMatch) {
    const a = parseHourFromToken(rangeMatch[1]);
    const b = parseHourFromToken(rangeMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
      const slots = [];
      for (let h = a; h <= b; h += 1) slots.push(hourToSlotKey(h));
      return slots;
    }
  }
  const hour = parseHourFromToken(text);
  if (Number.isFinite(hour)) return [hourToSlotKey(hour)];
  const slot = normalizeSlotKey(text);
  if (slot && /^H\d{2}$/.test(slot)) return [slot];
  return [];
}

function normalizeAiScheduleData(raw) {
  const busyMap = Object.fromEntries(DAYS.map(day => [day, new Set()]));
  const freeMap = Object.fromEntries(DAYS.map(day => [day, new Set()]));
  const pushEntry = (targetMap, entry) => {
    const day = normalizeDayKey(entry?.day);
    if (!day) return;
    const slotsRaw = Array.isArray(entry?.slots) ? entry.slots : [];
    slotsRaw.forEach(slotVal => {
      parseSlotTokens(slotVal).forEach(slot => targetMap[day].add(slot));
    });
  };

  (Array.isArray(raw?.busy) ? raw.busy : []).forEach(entry => pushEntry(busyMap, entry));
  (Array.isArray(raw?.free) ? raw.free : []).forEach(entry => pushEntry(freeMap, entry));

  const busy = DAYS
    .map(day => ({ day, slots: [...busyMap[day]].sort() }))
    .filter(item => item.slots.length);
  const free = DAYS
    .map(day => ({ day, slots: [...freeMap[day]].sort() }))
    .filter(item => item.slots.length);
  if (!busy.length && !free.length) {
    throw new Error('Gemini could not confidently map schedule days/hours from this image.');
  }

  const busySlots = busy.reduce((sum, item) => sum + item.slots.length, 0);
  return {
    busy,
    free,
    summary: String(raw?.summary || '').trim() || `Detected approximately ${busySlots} busy slot(s).`,
    detectedHourSpan: findDetectedHourSpan({ busy, free }),
  };
}

function applyScheduleQuickMap(mode) {
  G.scheduleBlocks = {};
  syncScheduleMetaFromEntries();
  const weekdays = ['Mon','Tue','Wed','Thu','Fri'];
  const renderedHours = getRenderedHours();

  const setByHour = (day, hour, state) => {
    setScheduleBlock(day, hourToSlotKey(hour), state);
  };

  if (mode === 'weekday_mornings') {
    weekdays.forEach(day => {
      renderedHours.forEach(hour => {
        const state = hour < 13 ? 'busy' : 'free';
        setByHour(day, hour, state);
      });
    });
  } else if (mode === 'weekday_daytime') {
    weekdays.forEach(day => {
      renderedHours.forEach(hour => {
        const state = hour < 18 ? 'busy' : 'free';
        setByHour(day, hour, state);
      });
    });
  } else {
    DAYS.forEach(day => renderedHours.forEach(hour => setByHour(day, hour, 'free')));
  }
  autoAssignWorkoutSessionsFromSchedule();
  rebuildEntriesFromScheduleBlocks();
  saveScheduleEntries();
  localStorage.setItem('vq_schedule', JSON.stringify(G.scheduleBlocks));
  renderScheduleVisualBoard();
  renderScheduleEntryEditor();
  analyseSchedule();
  showToast('📅 Quick schedule applied. You can fine-tune it below.');
}

async function processSchedFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const src = e.target.result;
    document.getElementById('sched-preview').src = src;
    document.getElementById('sched-preview').style.display = 'block';
    document.getElementById('sched-scan-content').style.display = 'none';
    const resultEl = document.getElementById('sched-ai-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Scanning…</div>';
    try {
      let res;
      let method;
      const geminiKey = (localStorage.getItem('vq_gemini_key') || '').trim();
      // Prompt A: structured step-by-step
      const GEMINI_PROMPT_A =
        'You are a timetable reader. This image is a WEEKLY SCHEDULE grid.\n' +
        'Layout: day columns (Mon Tue Wed Thu Fri Sat Sun) across the top; hourly rows (6:00 to 24:00) labelled on the left.\n\n' +
        'Task: For each day column identify which hour-rows have content (text, event name, colour fill, any marking) = BUSY, ' +
        'and which hour-rows are blank or empty = FREE.\n\n' +
        'Valid slot IDs:  H06 H07 H08 H09 H10 H11 H12 H13 H14 H15 H16 H17 H18 H19 H20 H21 H22 H23\n' +
        'Valid day names: Mon  Tue  Wed  Thu  Fri  Sat  Sun\n\n' +
        'Rules:\n' +
        '  1. Multi-hour event spanning 9:00-11:00 -> list H09 H10 H11\n' +
        '  2. Only include days actually visible in the image\n' +
        '  3. The time labels on the far-left edge are row headers NOT content inside any day column\n' +
        '  4. Empty / white / unshaded cells = FREE\n\n' +
        'Output ONLY raw JSON - no markdown, no code fences, no explanation:\n' +
        '{"busy":[{"day":"Mon","slots":["H09","H10","H14"]}],"free":[{"day":"Mon","slots":["H06","H07","H08"]}],"summary":"one sentence"}';

      // Prompt B: verification angle with different wording
      const GEMINI_PROMPT_B =
        'Carefully analyse this weekly timetable image and extract the schedule.\n\n' +
        'The grid has day column headers at the top (Mon Tue Wed Thu Fri Sat Sun) and hourly time rows on the left (6:00 through midnight).\n\n' +
        'For EACH visible day column scan from top to bottom and classify each hourly cell:\n' +
        '  BUSY = contains text, a label, an event name, colour shading, or any kind of mark\n' +
        '  FREE = blank, empty, white, or completely unoccupied\n\n' +
        'Important:\n' +
        '  * The time labels on the left margin (6:00, 7:00 ...) are row markers - do NOT treat them as day-column content\n' +
        '  * Block spanning 10:00-13:00 -> list every hour: H10 H11 H12 H13\n' +
        '  * Include Sat and Sun even if mostly empty\n\n' +
        'Slot format: H + two-digit 24h value. Examples: 9 AM = H09, 2 PM = H14, 8 PM = H20\n\n' +
        'Return ONLY valid JSON - zero extra text, zero markdown:\n' +
        '{"busy":[{"day":"Tue","slots":["H08","H09","H10"]}],"free":[{"day":"Tue","slots":["H06","H07"]}],"summary":"brief description"}';

      if (geminiKey) {
        const base64 = src.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        let lastGeminiErr = null;

        const runGeminiPass = async (b64, mime, prompt, uiMsg, tag) => {
          resultEl.innerHTML = `<div class="loading-row"><div class="spin"></div>${uiMsg}</div>`;
          const text = await callGeminiVision(b64, mime, prompt);
          return { parsed: normalizeAiScheduleData(parseModelJson(text)), tag };
        };
        const busyCount = r => (r?.parsed?.busy || []).reduce((s, i) => s + (i?.slots?.length || 0), 0);

        let gr = null;

        // Pass 1 - original image + structured prompt
        try {
          gr = await runGeminiPass(base64, mimeType, GEMINI_PROMPT_A,
            'Scanning with Gemini AI (pass 1)�', 'Gemini AI (pass 1)');
        } catch (e) { lastGeminiErr = e; }

        // Pass 2 - original image + verification-angle prompt (only if pass 1 returned 0 busy)
        if (!gr || busyCount(gr) === 0) {
          try {
            const r2 = await runGeminiPass(base64, mimeType, GEMINI_PROMPT_B,
              'Scanning with Gemini AI (pass 2)�', 'Gemini AI (pass 2)');
            if (busyCount(r2) > busyCount(gr)) gr = r2;
          } catch (e) { lastGeminiErr = e; }
        }

        // Pass 3 - colour-enhanced image + structured prompt (only if still no busy slots)
        if (!gr || busyCount(gr) === 0) {
          try {
            const enhSrc = await enhanceForGemini(src);
            const r3 = await runGeminiPass(enhSrc.split(',')[1], 'image/jpeg', GEMINI_PROMPT_A,
              'Enhancing image for Gemini (pass 3)�', 'Gemini AI (pass 3, enhanced)');
            if (busyCount(r3) > busyCount(gr)) gr = r3;
          } catch (e) { lastGeminiErr = e; }
        }

        if (gr) {
          res = gr.parsed;
          method = gr.tag;
        } else {
          resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Gemini was uncertain. Falling back to local OCR�</div>';
        }
      }

      // Try Ollama vision (llava) before OCR when AI result is still unavailable.
      if (!res) {
        try {
          resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Scanning with local Ollama vision…</div>';
          const ollamaText = await callOllamaVision(
            `${GEMINI_PROMPT_A}\n\nReturn JSON only.`,
            src.split(',')[1],
            'llava:7b'
          );
          const parsed = normalizeAiScheduleData(parseModelJson(ollamaText));
          const busyCount = (parsed?.busy || []).reduce((s, i) => s + (i?.slots?.length || 0), 0);
          if (busyCount > 0) {
            res = parsed;
            method = `${method ? method + ' → ' : ''}Ollama Vision (llava)`;
          }
        } catch {
          // If Ollama isn't running or model isn't pulled, continue to OCR fallback.
        }
      }
      if (!res) {
        let best = null;
        let parseErr = null;

        const tryParseCandidate = (candidate) => {
          try {
            const parsed = parseScheduleFromOcrData(candidate.data);
            const metrics = evaluateScheduleCandidate(parsed, candidate.data?.confidence);
            const withMetrics = { ...candidate, parsed, ...metrics };
            if (!best || withMetrics.score > best.score) best = withMetrics;
          } catch (err) {
            parseErr = err;
          }
        };

        // 1. PaddleOCR – local Python server (port 8181)
        let paddleOk = false;
        try {
          resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Running PaddleOCR (local server)…</div>';
          const paddleData = await callPaddleOcr(src);
          tryParseCandidate({ label: 'PaddleOCR', data: paddleData });
          paddleOk = !!(best && best.busyEntries >= 2);
          if (paddleOk) method = `${method ? method + ' → ' : ''}PaddleOCR`;
        } catch (_paddleErr) {
          // Server not running — fall through to Tesseract
        }

        // 2. Tesseract fallback (browser-based, always available)
        if (!paddleOk) {
          resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Running local OCR…</div>';
          const primaryData = await runTesseractScheduleOcr(src, (pct) => {
            resultEl.innerHTML = `<div class="loading-row"><div class="spin"></div>Running local OCR (pass 1)… ${pct}%</div>`;
          });

          tryParseCandidate({ label: 'pass 1', data: primaryData });

          const needsSecondPass = !best
            || best.confidence < 55
            || best.busyEntries < 2
            || best.busyRatio > 0.78;

          if (needsSecondPass) {
            resultEl.innerHTML = '<div class="loading-row"><div class="spin"></div>Improving image and running OCR (pass 2)…</div>';
            const enhancedSrc = await enhanceScheduleImageForOcr(src);
            const enhancedData = await runTesseractScheduleOcr(enhancedSrc, (pct) => {
              resultEl.innerHTML = `<div class="loading-row"><div class="spin"></div>Running local OCR (pass 2)… ${pct}%</div>`;
            });
            tryParseCandidate({ label: 'pass 2 (enhanced)', data: enhancedData });
          }
        }

        if (!best) {
          throw parseErr || new Error('OCR could not confidently detect day/time patterns from this image.');
        }

        res = best.parsed;
        method = `${method ? method + ' · ' : ''}${best.label === 'PaddleOCR' ? 'PaddleOCR' : `Local OCR · ${best.label}`} · confidence ${Math.round(best.confidence)}% · ${best.totalEntries} blocks`;
      }

      applyScannedSchedule(res);
      resultEl.innerHTML = `
        <div style="padding:12px;background:var(--panel2);border-radius:10px;border:1px solid var(--xp)40">
          <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.75rem;color:var(--xp);margin-bottom:6px">✅ Schedule Detected</div>
          <div style="font-size:0.78rem;color:var(--muted2);line-height:1.6">${res.summary || 'Schedule extracted and applied to your week grid.'}</div>
          <div style="font-size:0.72rem;color:var(--muted);margin-top:8px">${escapeHtml(method)}. Review and fine-tune below.</div>
        </div>`;
      showToast('📅 Planner scanned! +15 XP');
      G.xp += 15; saveXP(); updateNavBar();
    } catch (err) {
      const message = escapeHtml(err?.message || 'Unknown schedule scan error.');
      resultEl.innerHTML = `
        <div style="padding:12px;background:var(--panel2);border-radius:10px;border:1px solid #f8717140">
          <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.75rem;color:var(--hp);margin-bottom:6px">⚠️ Could not auto-read schedule</div>
          <div style="font-size:0.76rem;color:var(--muted2);line-height:1.6;margin-bottom:10px">${message}</div>
          <div style="display:grid;grid-template-columns:1fr;gap:8px">
            <div style="padding:8px 10px;border-radius:8px;border:1px solid #60a5fa40;background:#60a5fa12;color:var(--mana);font-size:0.74rem;line-height:1.5">Tip: use a clearer screenshot with visible day labels and time text, then try upload again.</div>
            <button onclick="applyScheduleQuickMap('weekday_mornings')" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--panel);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.76rem;font-weight:700;cursor:pointer">Use quick map: Weekday mornings busy</button>
            <button onclick="applyScheduleQuickMap('weekday_daytime')" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--panel);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.76rem;font-weight:700;cursor:pointer">Use quick map: Weekday daytime busy</button>
            <button onclick="applyScheduleQuickMap('all_free')" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--panel);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:0.76rem;font-weight:700;cursor:pointer">Clear map: Mark everything free</button>
          </div>
        </div>`;
    }
  };
  reader.readAsDataURL(file);
}

function applyScannedSchedule(data) {
  G.scheduleEntries = [];

  // Convert contiguous busy slot runs into editable schedule entries.
  (data.busy || []).forEach(({ day, slots }) => {
    const normalizedDay = normalizeDayKey(day);
    if (!normalizedDay || !Array.isArray(slots) || !slots.length) return;
    const hours = slots
      .map(slotKeyToHour24)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (!hours.length) return;

    let start = hours[0];
    let prev = hours[0];
    const flush = (s, e) => {
      G.scheduleEntries.push({
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        day: normalizedDay,
        startHour: s,
        endHour: e + 1,
        type: 'busy',
        note: 'Scanned schedule',
      });
    };

    for (let i = 1; i < hours.length; i += 1) {
      if (hours[i] === prev + 1) {
        prev = hours[i];
        continue;
      }
      flush(start, prev);
      start = hours[i];
      prev = hours[i];
    }
    flush(start, prev);
  });

  syncScheduleMetaFromEntries();
  saveScheduleEntries();
  renderScheduleEntryEditor();
  renderScheduleVisualBoard();
  syncScheduleBlocksFromEntries();
  autoAssignWorkoutSessionsFromSchedule();
  localStorage.setItem('vq_schedule', JSON.stringify(G.scheduleBlocks));
  analyseSchedule();
}

function plannerTypeMeta(type) {
  const map = {
    busy: { label: 'Busy', color: 'var(--hp)' },
    exam: { label: 'Exam', color: 'var(--orange)' },
    workout: { label: 'Workout', color: 'var(--gold)' },
    rest_day: { label: 'Rest Day', color: 'var(--purple)' },
    membership_renewal: { label: 'Membership Renewal', color: 'var(--orange)' },
    holiday: { label: 'Holiday', color: 'var(--mana)' },
    free: { label: 'Free', color: 'var(--xp)' },
  };
  return map[type] || map.busy;
}

function plannerMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toISODate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function plannerEventsForDate(dateISO) {
  return (G.plannerDates || []).filter(item => item.date === dateISO);
}

function plannerCellClassByEvents(events) {
  if (!events.length) return '';
  const priority = ['exam', 'membership_renewal', 'holiday', 'workout', 'rest_day', 'busy', 'free'];
  for (const key of priority) {
    if (events.some(e => e.type === key)) return ` has-${key}`;
  }
  return '';
}

function setPlannerMonth(delta) {
  if (!plannerMonthCursor) plannerMonthCursor = plannerMonthStart(new Date());
  plannerMonthCursor = new Date(plannerMonthCursor.getFullYear(), plannerMonthCursor.getMonth() + delta, 1);
  renderPlannerMonthCalendar();
}

function openSchedScanModal() {
  const modal = document.getElementById('sched-scan-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSchedScanModal() {
  const modal = document.getElementById('sched-scan-modal');
  if (modal) modal.style.display = 'none';
}

function selectPlannerDate(dateISO) {
  plannerSelectedDate = dateISO;
  renderPlannerMonthCalendar();
  renderPlannerDateSection();
  openPlannerDateModal();
}

function renderPlannerMonthCalendar() {
  if (!plannerMonthCursor) plannerMonthCursor = plannerMonthStart(new Date());
  const grid = document.getElementById('planner-month-grid');
  const label = document.getElementById('planner-month-label');
  if (!grid || !label) return;

  const y = plannerMonthCursor.getFullYear();
  const m = plannerMonthCursor.getMonth();
  const monthName = plannerMonthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  label.textContent = monthName;

  const first = new Date(y, m, 1);
  const firstDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const todayISO = toISODate(new Date());

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    let dayNum;
    let cellDate;
    let muted = false;
    if (i < firstDow) {
      dayNum = prevDays - firstDow + i + 1;
      cellDate = new Date(y, m - 1, dayNum);
      muted = true;
    } else if (i >= firstDow + daysInMonth) {
      dayNum = i - (firstDow + daysInMonth) + 1;
      cellDate = new Date(y, m + 1, dayNum);
      muted = true;
    } else {
      dayNum = i - firstDow + 1;
      cellDate = new Date(y, m, dayNum);
    }

    const iso = toISODate(cellDate);
    const events = plannerEventsForDate(iso);
    const isToday = iso === todayISO;
    const isSelected = iso === plannerSelectedDate;
    const dayType = getPlanTypeForDate(G.profile?.goal || 'get_fit', iso) || '';
    const marker = events.length > 2 ? `${events.length}` : events.map(e => plannerTypeMeta(e.type).label[0]).join('');
    cells.push(`
      <button class="planner-day-cell${muted ? ' muted' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${plannerCellClassByEvents(events)}" onclick="selectPlannerDate('${iso}')">
        <div class="planner-day-num">${dayNum}</div>
        <div class="planner-day-focus">${escapeHtml(dayType)}</div>
        <div class="planner-day-marker">${marker || ''}</div>
      </button>
    `);
  }
  grid.innerHTML = cells.join('');
}

function renderPlannerDateSection() {
  const selectedEl = document.getElementById('planner-selected-date');
  const summaryEl = document.getElementById('planner-date-summary');
  const upcomingEl = document.getElementById('planner-upcoming-list');
  const modalSelectedEl = document.getElementById('planner-modal-selected-date');
  const modalListEl = document.getElementById('planner-modal-date-list');

  const now = new Date();
  if (!plannerSelectedDate) {
    plannerSelectedDate = toISODate(now);
  }

  if (selectedEl) {
    const pretty = new Date(plannerSelectedDate + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const dayType = getPlanTypeForDate(G.profile?.goal || 'get_fit', plannerSelectedDate);
    selectedEl.textContent = dayType ? `${pretty} · Quest focus: ${dayType} day` : pretty;
    if (modalSelectedEl) modalSelectedEl.textContent = dayType ? `${pretty} · Quest focus: ${dayType} day` : pretty;
  }

  if (summaryEl) {
    const detected = plannerDetectedCountry || getStoredHolidayCountry() || detectLocaleCountryCode() || 'US';
    summaryEl.textContent = `Holiday sync country: ${detected}. You can change this in Settings → Hero Profile.`;
  }

  const items = plannerEventsForDate(plannerSelectedDate)
    .slice()
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));

  if (modalListEl) {
    modalListEl.innerHTML = items.length ? items.map(item => {
      const meta = plannerTypeMeta(item.type);
      return `
        <div class="planner-date-item">
          <div>
            <div class="planner-date-head">${escapeHtml(item.date || '')} · <span style="color:${meta.color}">${meta.label}</span></div>
            <div class="planner-date-note">${escapeHtml(item.note || 'No note')}</div>
          </div>
          <button class="planner-date-del" onclick="removePlannerDateEvent('${escapeHtml(item.id || '')}')">Remove</button>
        </div>`;
    }).join('') : '<div class="planner-empty">No events for this date yet.</div>';
  }

  const upcomingItems = (G.plannerDates || [])
    .filter(item => item?.date && item.date >= toISODate(now))
    .slice()
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.id || '').localeCompare(String(b.id || '')))
    .slice(0, 8);

  if (upcomingEl) {
    if (!upcomingItems.length) {
      upcomingEl.innerHTML = '<div class="planner-empty">No upcoming events yet. Tap any date to add one.</div>';
      return;
    }

    upcomingEl.innerHTML = upcomingItems.map(item => {
      const meta = plannerTypeMeta(item.type);
      return `
        <div class="planner-date-item">
          <div>
            <div class="planner-date-head">${escapeHtml(item.date || '')} · <span style="color:${meta.color}">${meta.label}</span></div>
            <div class="planner-date-note">${escapeHtml(item.note || 'No note')}</div>
          </div>
          <button class="planner-date-del" onclick="selectPlannerDate('${escapeHtml(item.date || '')}')">Open</button>
        </div>`;
    }).join('');
  }
}

function openPlannerDateModal() {
  document.getElementById('planner-date-modal')?.classList.add('open');
}

function closePlannerDateModal() {
  document.getElementById('planner-date-modal')?.classList.remove('open');
}

function addPlannerDateEvent() {
  const date = plannerSelectedDate;
  const type = document.getElementById('planner-event-type')?.value || 'busy';
  const noteInput = document.getElementById('planner-event-note');
  const note = String(noteInput?.value || '').trim();

  if (!date) {
    showToast('Pick a date first.');
    return;
  }

  const id = `${date}-${type}-${Date.now()}`;
  G.plannerDates = Array.isArray(G.plannerDates) ? G.plannerDates : [];
  G.plannerDates.push({ id, date, type, note });
  savePlannerDates();
  renderPlannerMonthCalendar();
  renderPlannerDateSection();
  analyseSchedule();
  if (noteInput) noteInput.value = '';
  showToast('📆 Date event added.');
}

function removePlannerDateEvent(id) {
  G.plannerDates = (G.plannerDates || []).filter(item => item.id !== id);
  savePlannerDates();
  renderPlannerMonthCalendar();
  renderPlannerDateSection();
  analyseSchedule();
}

async function fetchPlannerHolidays(autoImport = false, countryOverride = '', yearOverride = null) {
  const country = String(countryOverride || plannerDetectedCountry || getStoredHolidayCountry() || detectLocaleCountryCode() || 'US').toUpperCase();
  const year = Number.isFinite(Number(yearOverride)) ? Number(yearOverride) : new Date().getFullYear();
  setStoredHolidayCountry(country);
  try {
    const r = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
    if (!r.ok) throw new Error(`Holiday API HTTP ${r.status}`);
    const data = await r.json();
    const holidays = Array.isArray(data) ? data : [];
    if (!holidays.length) return;

    if (autoImport) {
      let added = 0;
      G.plannerDates = Array.isArray(G.plannerDates) ? G.plannerDates : [];
      G.plannerDates = G.plannerDates.filter(item => !(item.type === 'holiday' && item.autoImported && String(item.date || '').startsWith(`${year}-`)));
      holidays.forEach(h => {
        const date = String(h.date || '');
        const name = String(h.localName || h.name || 'Holiday');
        if (!date) return;
        const exists = G.plannerDates.some(item => item.date === date && item.type === 'holiday' && item.note === name);
        if (!exists) {
          G.plannerDates.push({ id: `${date}-holiday-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date, type: 'holiday', note: name, autoImported: true, country });
          added += 1;
        }
      });
      if (added > 0) {
        savePlannerDates();
        renderPlannerMonthCalendar();
        renderPlannerDateSection();
        analyseSchedule();
        showToast(`🎉 Imported ${added} ${country} holiday${added > 1 ? 's' : ''}.`);
      }
    }
  } catch (err) {
    const summaryEl = document.getElementById('planner-date-summary');
    if (summaryEl) summaryEl.textContent = `Holiday sync could not update right now: ${err?.message || 'Unknown error'}`;
  }
}

function importHolidayToPlanner(date, name) {
  if (!date) return;
  const existing = (G.plannerDates || []).some(item => item.date === date && item.type === 'holiday' && item.note === name);
  if (existing) {
    showToast('Holiday already added.');
    return;
  }
  G.plannerDates = Array.isArray(G.plannerDates) ? G.plannerDates : [];
  G.plannerDates.push({ id: `${date}-holiday-${Date.now()}`, date, type: 'holiday', note: name });
  savePlannerDates();
  renderPlannerMonthCalendar();
  renderPlannerDateSection();
  analyseSchedule();
  showToast('🎉 Holiday added to planner.');
}

function importHolidayToPlannerEncoded(dateEncoded, nameEncoded) {
  const date = decodeURIComponent(String(dateEncoded || ''));
  const name = decodeURIComponent(String(nameEncoded || ''));
  importHolidayToPlanner(date, name);
}

function detectLocaleCountryCode() {
  const locales = [];
  if (Array.isArray(navigator.languages)) locales.push(...navigator.languages);
  if (navigator.language) locales.push(navigator.language);
  try { locales.push(Intl.DateTimeFormat().resolvedOptions().locale); } catch {}

  for (const loc of locales) {
    const m = String(loc || '').match(/[-_]([A-Za-z]{2})\b/);
    if (m) return m[1].toUpperCase();
  }
  return 'US';
}

function detectCountryFromGeolocation(timeoutMs = 4500) {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve('');
      return;
    }
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      resolve(value || '');
    };

    const timeout = setTimeout(() => finish(''), timeoutMs);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const lat = Number(pos?.coords?.latitude);
        const lon = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          clearTimeout(timeout);
          finish('');
          return;
        }
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const r = await fetch(url, { headers: { Accept: 'application/json' } });
        const d = await r.json().catch(() => ({}));
        clearTimeout(timeout);
        finish(String(d?.address?.country_code || '').toUpperCase());
      } catch {
        clearTimeout(timeout);
        finish('');
      }
    }, () => {
      clearTimeout(timeout);
      finish('');
    }, { enableHighAccuracy: false, timeout: Math.max(1000, timeoutMs - 500), maximumAge: 86400000 });
  });
}

async function autoConfigurePlannerHolidayCountry(force = false) {
  if (force) plannerCountryAutodetected = false;
  if (plannerCountryAutodetected) return;
  const stored = getStoredHolidayCountry();
  if (stored) {
    plannerDetectedCountry = stored;
    plannerCountryAutodetected = true;
    renderPlannerDateSection();
    return;
  }

  const geoCountry = await detectCountryFromGeolocation();
  const localeCountry = detectLocaleCountryCode();
  const guessed = isValidCountryCode(geoCountry) ? geoCountry
    : (isValidCountryCode(localeCountry) ? localeCountry : 'US');

  plannerDetectedCountry = guessed;
  setStoredHolidayCountry(guessed);
  plannerCountryAutodetected = true;
  renderPlannerDateSection();
}

function onHolidayCountryChanged() {
  const country = plannerDetectedCountry || getStoredHolidayCountry() || 'US';
  if (!isValidCountryCode(country)) {
    showToast('Use a 2-letter country code (ex: US, PH, GB).');
    return;
  }
  plannerCountryAutodetected = true;
  plannerDetectedCountry = country;
  setStoredHolidayCountry(country);
  plannerAutoHolidayKey = '';
  autoLoadPlannerHolidaysForCurrentPlace();
  renderPlannerDateSection();
  showToast(`Holiday country set to ${country}.`);
}

function autoLoadPlannerHolidaysForCurrentPlace() {
  const country = String(plannerDetectedCountry || getStoredHolidayCountry() || detectLocaleCountryCode() || 'US').toUpperCase();
  const year = new Date().getFullYear();
  const key = `${country}-${year}`;
  if (plannerAutoHolidayKey === key) return;
  plannerAutoHolidayKey = key;
  fetchPlannerHolidays(true, country, year);
  fetchPlannerHolidays(true, country, year + 1);
}

// ════════════════════════════ GUILD / GYM FINDER ════════════════════════════
function renderGuildScreen() {
  // Show selected gym if saved
  if (G.selectedGym) renderGymCards([G.selectedGym], true);
}

function setEquipment(tier) {
  const normalizedTier = normalizeEquipmentKey(tier);
  const previousEquipment = normalizeEquipmentKey(G.profile?.equipment);
  document.querySelectorAll('.no-gym-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('eq-' + normalizedTier)?.classList.add('selected');
  if (G.profile) {
    G.profile.equipment = normalizedTier;
    localStorage.setItem('vq_profile', JSON.stringify(G.profile));
    if (previousEquipment !== normalizedTier) {
      G.today.planSnapshot = null;
      saveToday();
    }
    showToast(`${EQUIP_LABELS[normalizedTier].icon} Training set to: ${EQUIP_LABELS[normalizedTier].label}`);
    if (document.getElementById('screen-plan')?.classList.contains('active')) renderPlan();
    if (document.getElementById('screen-hq')?.classList.contains('active')) refreshHQ();
  }
}

async function findNearbyGyms() {
  const btn = document.getElementById('locate-btn');
  const status = document.getElementById('gym-status');
  btn.innerHTML = '<div class="spin" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></div>Locating…';
  btn.disabled = true;
  status.style.display = 'block';
  status.textContent = 'Requesting your location…';

  if (!navigator.geolocation) {
    status.textContent = '⚠️ Geolocation not supported on this device.';
    btn.innerHTML = '📍 Find Gyms Near Me'; btn.disabled = false; return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      status.textContent = `📍 Found you at ${latitude.toFixed(3)}, ${longitude.toFixed(3)} — searching for gyms…`;
      await searchGymsNearby(latitude, longitude);
      btn.innerHTML = '🔄 Search Again'; btn.disabled = false;
    },
    (err) => {
      status.textContent = '⚠️ Location access denied. Enable it in your browser settings and try again.';
      btn.innerHTML = '📍 Find Gyms Near Me'; btn.disabled = false;
    },
    { timeout: 10000 }
  );
}

async function searchGymsNearby(lat, lng) {
  const status = document.getElementById('gym-status');
  try {
    const d = await callNearbyGyms(lat, lng);
    const gyms = mapOverpassToGyms(d.elements || [], lat, lng);
    _allGyms = gyms;
    _userLocation = { lat, lng };
    status.textContent = `✅ Found ${gyms.length} gyms near you`;
    document.getElementById('gym-search-wrap').style.display = gyms.length ? 'block' : 'none';
    document.getElementById('gym-route-info').style.display = gyms.length ? 'block' : 'none';
    document.getElementById('gym-route-info').innerHTML = '<span>Tap a gym card to preview route.</span>';
    document.getElementById('gym-search').value = '';
    try { renderGymMap(gyms, lat, lng); } catch (mapErr) { console.warn('Map init failed:', mapErr); }
    renderGymCards(gyms);
  } catch (err) {
    status.textContent = '⚠️ Could not fetch gyms. Check your connection.';
    const message = escapeHtml(err?.message || 'Unknown gym lookup error.');
    document.getElementById('gym-cards').innerHTML = `<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-icon">🔌</div><div class="empty-text">${message}</div></div></div>`;
  }
}

let _gymMap = null;
let _gymMarkers = [];
let _allGyms = [];
let _userLocation = null;
let _routeLayer = null;
let _gymMarkerById = new Map();
let _gymById = new Map();

function formatMinutes(seconds) {
  const mins = Math.round((Number(seconds) || 0) / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function filterGyms(q) {
  const term = q.trim().toLowerCase();
  const filtered = term ? _allGyms.filter(g =>
    g.name.toLowerCase().includes(term) ||
    (g.address || '').toLowerCase().includes(term)
  ) : _allGyms;
  renderGymCards(filtered);
  // dim markers on map that don't match
  _allGyms.forEach((g) => {
    const marker = _gymMarkerById.get(g.place_id);
    if (!marker) return;
    const match = !term || g.name.toLowerCase().includes(term) || (g.address || '').toLowerCase().includes(term);
    marker.setOpacity(match ? 1 : 0.25);
  });
}

function renderGymMap(gyms, userLat, userLng) {
  const mapEl = document.getElementById('gym-map');
  const validGyms = gyms.filter(g => Number.isFinite(g.lat) && Number.isFinite(g.lng));
  if (!validGyms.length) { mapEl.style.display = 'none'; return; }

  mapEl.style.display = 'block';
  if (_gymMap) { _gymMap.remove(); _gymMap = null; }
  _gymMarkers = [];
  _gymMarkerById = new Map();
  _gymById = new Map();
  _routeLayer = null;

  _gymMap = L.map('gym-map').setView([userLat, userLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(_gymMap);

  const youIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#60a5fa;border:3px solid #fff;box-shadow:0 0 8px #60a5fa80"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
  L.marker([userLat, userLng], { icon: youIcon }).addTo(_gymMap).bindPopup('\ud83d\udccd You are here');

  validGyms.forEach((g) => {
    _gymById.set(g.place_id, g);
    const gymIcon = L.divIcon({ className: '', html: '<div style="width:28px;height:28px;border-radius:50%;background:#f5c842;border:3px solid #0d0f1a;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px #0005">\ud83c\udfcb\ufe0f</div>', iconSize: [28, 28], iconAnchor: [14, 14] });
    const popup = '<b>' + g.name + '</b><br>' + g.distance_km + ' km away';
    const marker = L.marker([g.lat, g.lng], { icon: gymIcon }).addTo(_gymMap).bindPopup(popup);
    marker.on('click', () => {
      previewGym(g.place_id);
    });
    _gymMarkerById.set(g.place_id, marker);
    _gymMarkers.push(marker);
  });
}

async function previewGym(gymId) {
  const gym = _gymById.get(gymId) || _allGyms.find(g => g.place_id === gymId);
  const marker = _gymMarkerById.get(gymId);
  if (!_gymMap || !gym || !marker || !_userLocation) return;

  document.querySelectorAll('.gym-card').forEach((card) => card.classList.remove('focused'));
  document.getElementById(`gym-card-${gymId}`)?.classList.add('focused');

  _gymMap.setView(marker.getLatLng(), 16, { animate: true });
  marker.openPopup();
  document.getElementById('gym-map').scrollIntoView({ behavior: 'smooth', block: 'center' });

  const routeInfo = document.getElementById('gym-route-info');
  routeInfo.style.display = 'block';
  routeInfo.innerHTML = '<span>Calculating walking route...</span>';

  try {
    const origin = `${_userLocation.lng},${_userLocation.lat}`;
    const dest = `${gym.lng},${gym.lat}`;
    const uri = `https://router.project-osrm.org/route/v1/foot/${origin};${dest}?overview=full&geometries=geojson`;
    const res = await fetch(uri);
    if (!res.ok) throw new Error(`Route API HTTP ${res.status}`);
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates?.length) throw new Error('No route found.');

    const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    if (_routeLayer) _gymMap.removeLayer(_routeLayer);
    _routeLayer = L.polyline(latlngs, {
      color: '#60a5fa',
      weight: 5,
      opacity: 0.9,
      lineJoin: 'round'
    }).addTo(_gymMap);

    const distanceKm = (route.distance / 1000).toFixed(1);
    routeInfo.innerHTML = `<span><b>Route to ${escapeHtml(gym.name)}</b>: ${distanceKm} km · ${formatMinutes(route.duration)} walking</span>`;
    _gymMap.fitBounds(_routeLayer.getBounds(), { padding: [25, 25] });
  } catch (err) {
    routeInfo.innerHTML = `<span>Could not build route inside app: ${escapeHtml(err?.message || 'Unknown error')}</span>`;
  }
}

function renderGymCards(gyms, savedOnly = false) {
  const container = document.getElementById('gym-cards');
  if (!gyms.length) {
    container.innerHTML = '<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-icon">🏙️</div><div class="empty-text">No gyms found nearby. Try adjusting your training environment above.</div></div></div>';
    return;
  }
  container.innerHTML = gyms.map((g, i) => {
    const isSel = G.selectedGym && G.selectedGym.name === g.name;
    const stars = g.rating ? '★'.repeat(Math.round(g.rating)) + '☆'.repeat(5 - Math.round(g.rating)) : '';
    const amenities = (g.amenities || []).slice(0, 3);
    return `
    <div class="gym-card ${isSel ? 'selected' : ''}" id="gym-card-${g.place_id}" onclick="previewGym('${g.place_id}')">
      <div class="gym-name">${g.name}</div>
      <div class="gym-distance">📍 ${g.distance_km || '?'} km away</div>
      ${stars ? `<div class="gym-rating">${stars} <span style="color:var(--muted2);font-size:0.7rem">(${g.rating})</span></div>` : ''}
      <div class="gym-address">${g.address || ''}</div>
      <div style="font-size:0.72rem;color:var(--gold);margin-bottom:8px">💰 ${g.price_range || 'Pricing varies'}</div>
      <div style="font-size:0.7rem;color:var(--muted2);margin-bottom:10px">🕐 ${g.hours || 'Hours not available'}</div>
      <div class="gym-tags">
        <span class="gym-tag ${g.is_open ? 'open' : 'closed'}">${g.is_open ? 'Open Now' : 'Closed'}</span>
        <span class="gym-tag type">${g.type || 'Gym'}</span>
        ${amenities.map(a => `<span class="gym-tag type">${a}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        ${Number.isFinite(g.lat) ? `<button class="gym-dir-btn" onclick="event.stopPropagation();previewGym('${g.place_id}')">🗺 Route</button>` : ''}
      </div>
      <button class="gym-select-btn" onclick="event.stopPropagation();selectGym('${g.place_id}', ${JSON.stringify(g).replace(/"/g,'&quot;')})">${isSel ? '✓ My Guild' : 'Set as My Guild'}</button>
    </div>`;
  }).join('');
}

function selectGym(gymId, gym) {
  G.selectedGym = gym;
  localStorage.setItem('vq_gym', JSON.stringify(gym));
  // Auto-set equipment to full_gym
  setEquipment('full_gym');
  document.querySelectorAll('.gym-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('gym-card-' + gymId)?.classList.add('selected');
  previewGym(gymId);
  showToast(`🏛️ ${gym.name} set as your Guild! Workouts updated.`);
}

// ════════════════════════════ COACH ════════════════════════════
function getCoachInputBySource(source = 'main') {
  if (source === 'float') return document.getElementById('coach-input-float');
  return document.getElementById('coach-input');
}

function getCoachMsgTargets() {
  return ['coach-msgs', 'coach-msgs-float']
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(item => !!item.el);
}

function appendCoachBubble(role, text) {
  getCoachMsgTargets().forEach(target => {
    target.el.innerHTML += `<div class="coach-bubble ${role}">${text}</div>`;
    target.el.scrollTop = target.el.scrollHeight;
  });
}

function addCoachThinking() {
  getCoachMsgTargets().forEach(target => {
    target.el.innerHTML += `<div class="coach-bubble bot loading-row" id="coach-thinking-${target.id}"><div class="spin"></div> Consulting the scrolls…</div>`;
    target.el.scrollTop = target.el.scrollHeight;
  });
}

function replaceCoachThinking(content) {
  ['coach-thinking-coach-msgs', 'coach-thinking-coach-msgs-float'].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.outerHTML = `<div class="coach-bubble bot">${content}</div>`;
  });
  getCoachMsgTargets().forEach(target => {
    target.el.scrollTop = target.el.scrollHeight;
  });
}

async function sendCoach(source = 'main') {
  const inp = getCoachInputBySource(source);
  const txt = inp?.value.trim();
  if (!txt) return;
  inp.value = '';
  askCoach(txt, source);
}

async function askCoach(txt, source = 'main') {
  if (!txt) return;
  appendCoachBubble('user', txt);
  addCoachThinking();
  const p = G.profile;
  const eq = p?.equipment ? (EQUIP_LABELS[p.equipment]?.label || p.equipment) : 'bodyweight';
  const gym = G.selectedGym ? `Guild: ${G.selectedGym.name}.` : '';
  const sys = `You are a Sage Advisor inside a wellness RPG app called FitnessGo. Be encouraging, concise (max 90 words), and use 1-2 light RPG metaphors. ${p ? `Hero: ${p.name}, class: ${CLASSES[p.goal]||p.goal}, body type: ${BODY_TYPE_LABELS[p.bodyType] || p.bodyType}, phase: ${getPhaseLabel(p.physiquePhase)}, weight: ${p.weight}kg, target: ${p.target}kg, diet: ${p.diet}, calories: ${p.calories}/day, macros: ${p.protein}g protein / ${p.carbs}g carbs / ${p.fat}g fat, equipment: ${eq}, calisthenics level: ${CALISTHENICS_LEVEL_LABELS[p.calisthenicsLevel] || p.calisthenicsLevel}, session length: ${p.sessionMinutes} min, preferred window: ${getTrainingWindowLabel(p.preferredWindow)}. ${gym}` : ''} Write naturally like a coach. No bullet points.`;
  try {
    const response = await callOllamaChat({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: txt },
      ],
    });
    const outputText = response?.message?.content || response?.response || '';
    replaceCoachThinking(outputText || 'The Sage is unavailable. Try again shortly.');
  } catch {
    replaceCoachThinking('Connection to local Sage failed. Start Ollama server (or check hosted Ollama endpoint) and try again.');
  }
  if (source === 'float') {
    const input = document.getElementById('coach-input-float');
    input?.focus();
  }
}

function toggleSageChat() {
  const panel = document.getElementById('sage-chat-panel');
  const backdrop = document.getElementById('sage-chat-backdrop');
  if (!panel) return;
  const willOpen = !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  backdrop?.classList.toggle('open', willOpen);
  panel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
  document.body.style.overflow = (willOpen && window.innerWidth <= 768) ? 'hidden' : '';
  if (willOpen) {
    const floatInput = document.getElementById('coach-input-float');
    floatInput?.focus();
  }
}

function closeSageChat() {
  const panel = document.getElementById('sage-chat-panel');
  const backdrop = document.getElementById('sage-chat-backdrop');
  if (!panel) return;
  panel.classList.remove('open');
  backdrop?.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
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
      const geminiKey = (localStorage.getItem('vq_gemini_key') || '').trim();
      let parsed;
      if (geminiKey) {
        const text = await callGeminiVision(src.split(',')[1], file.type || 'image/jpeg', 'List all visible food ingredients in this image. Return ONLY a JSON array of strings, no markdown, no explanation. Example: ["eggs","tomatoes","chicken"]. Be specific and complete.');
        parsed = parseModelJson(text);
      } else {
        try {
          const text = await callOllamaVision(
            'List all visible food ingredients in this image. Return ONLY a JSON array of strings, no markdown, no explanation. Example: ["eggs","tomatoes","chicken"]. Be specific and complete.',
            src.split(',')[1],
            'llava:7b'
          );
          parsed = parseModelJson(text);
        } catch {
          const d = await callAnthropicMessages({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:file.type,data:src.split(',')[1]}},{type:'text',text:'List all visible food ingredients in this image. Return ONLY a JSON array of strings, no markdown. Example: ["eggs","tomatoes","chicken"]. Be specific and complete.'}]}] });
          parsed = parseModelJson(d.content?.[0]?.text);
        }
      }
      G.ingredients = Array.isArray(parsed) ? parsed : [];
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
    const d = await callAnthropicMessages({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] });
    const res = parseModelJson(d.content?.[0]?.text);
    renderRecipes(res.meals || []); renderShop(res.shopping || []);
  } catch {
    renderRecipes([{name:'Egg & Tomato Scramble',description:'Quick protein breakfast',time:'10 min',calories:320,protein:24,instructions:'Whisk eggs and cook with diced tomatoes in olive oil.'},{name:'Garlic Chicken Stir Fry',description:'High-protein lunch',time:'20 min',calories:480,protein:42,instructions:'Sauté chicken until golden, add garlic and vegetables.'},{name:'Simple Fried Rice',description:'Filling dinner',time:'15 min',calories:420,protein:20,instructions:'Fry cooked rice with eggs, onion and garlic.'}]);
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

// ════════════════════════════ REST DAY ════════════════════════════
const REST_REASONS = { business_trip:'On a business trip — micro-habits unlocked.', event:'Big day out! Keeping it light.', too_busy:'Busy day — small habits still count.', tired:'Rest and recover — your body needs it.', sick:'Not feeling well — focus on rest and fluids.', rest_day:'Scheduled rest day — muscles are rebuilding.' };
const MICRO_HABITS = {
  business_trip: [{icon:'🚶',text:'Take the stairs at your hotel or office',xp:5},{icon:'💧',text:'Drink 2 glasses of water before lunch',xp:3},{icon:'📱',text:'3 mins of deep breathing between meetings',xp:5},{icon:'🧘',text:'10 desk stretches — neck, shoulders, hips',xp:5},{icon:'🥗',text:'Choose a salad or protein option at meals',xp:5}],
  event: [{icon:'💃',text:'Dance or stay active at the event',xp:8},{icon:'🥤',text:'Alternate every alcoholic drink with water',xp:5},{icon:'🚶',text:'Walk to/from the venue if possible',xp:8},{icon:'🥗',text:'Eat a protein-rich meal before you go',xp:5}],
  too_busy: [{icon:'⏱️',text:'5-minute bodyweight circuit between tasks',xp:8},{icon:'🚶',text:'Walk during your lunch break (10 mins)',xp:5},{icon:'📵',text:'Step away from screens every hour',xp:3},{icon:'💧',text:'Keep a water bottle on your desk',xp:3},{icon:'🧘',text:'2 minutes of box breathing before bed',xp:5}],
  tired: [{icon:'😴',text:'Sleep 7–9 hours tonight',xp:10},{icon:'🧘',text:'10 mins of light stretching or yoga',xp:5},{icon:'💧',text:'Stay hydrated — fatigue = often dehydration',xp:3},{icon:'🥗',text:'Eat light — avoid heavy carbs',xp:5}],
  sick: [{icon:'💊',text:'Take any medication you need',xp:5},{icon:'💧',text:'Drink water or electrolytes every hour',xp:5},{icon:'😴',text:'Rest as much as possible',xp:5},{icon:'🍲',text:'Eat warm, easy-to-digest foods',xp:3}],
  rest_day: [{icon:'🧘',text:'Light stretching or foam rolling — 10 mins',xp:8},{icon:'🚶',text:'Easy 20-minute walk',xp:8},{icon:'💧',text:'Hydrate well to support muscle recovery',xp:3},{icon:'😴',text:'Prioritise 7–9 hours of sleep',xp:5},{icon:'📖',text:'Read something positive or mindful',xp:3}],
};
const HYDRATION_TIPS = [
  'Drink a glass of water before each meal — it helps with portion control and keeps energy stable.',
  'Start your morning with 500ml of water before coffee — it wakes up your metabolism.',
  'Thirst is a late signal — sip water throughout the day, don\'t wait until you\'re thirsty.',
  'Adding lemon or cucumber makes water more appealing and easier to drink more of.',
  'Your urine should be pale yellow — that\'s the easiest hydration check you can do.',
  'Coffee and tea count toward fluid intake, but water is best for long workouts.',
  'Water-rich foods (cucumber, watermelon, celery) also contribute to daily hydration.',
];
function showCantDoModal() { document.getElementById('cant-do-bg').style.display = 'flex'; }
function closeCantDoModal() { document.getElementById('cant-do-bg').style.display = 'none'; }
function activateRestDay(reason) {
  closeCantDoModal();
  localStorage.setItem('vq_rest_day', JSON.stringify({reason, date: new Date().toDateString()}));
  applyRestDay(reason);
  showToast('😮‍💨 Rest day activated! +5 XP');
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
    <div class="micro-habit-item" id="mh-${i}" onclick="doneMicroHabit(${i},${h.xp})">
      <div class="mh-icon">${h.icon}</div><div class="mh-text">${h.text}</div><div class="mh-xp">+${h.xp}XP</div>
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
  if (saved && saved.date === new Date().toDateString()) applyRestDay(saved.reason);
}
function cycleHydrationTip() {
  const el = document.getElementById('hydration-tip-text');
  if (el) el.textContent = HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)];
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
  const prompt = `Hero profile: goal=${p?.goal||'get_fit'}, phase=${getPhaseLabel(p?.physiquePhase)}, body_type=${p?.bodyType||'average'}, diet=${p?.diet||'none'}, calories_target=${p?.calories||2000}/day, protein_target=${p?.protein||140}g, carbs_target=${p?.carbs||220}g, fat_target=${p?.fat||60}g.\nAvailable food: ${foods}.\nCreate 4 meal quests (breakfast, lunch, snack, dinner) using ONLY the available food listed and tuned to the targets above.\nReturn ONLY this JSON (no markdown):\n{"meals":[{"time":"07:00","label":"Breakfast","name":"","description":"","calories":0,"protein":0,"tip":""}]}`;
  try {
    const d = await callAnthropicMessages({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] });
    const res = parseModelJson(d.content?.[0]?.text);
    renderNutritionPlan(res.meals || [], foods);
  } catch {
    renderNutritionPlan([{time:'07:00',label:'Breakfast',name:'Available Ingredients Breakfast',description:'Make the most of what you have',calories:350,protein:20,tip:'Eat within 1 hour of waking'},{time:'12:00',label:'Lunch',name:'Midday Fuel Plate',description:'Balance your macros',calories:500,protein:35,tip:'Biggest meal of the day'},{time:'15:00',label:'Snack',name:'Energy Boost Snack',description:'Keep hunger at bay',calories:200,protein:10,tip:'Pairs well with water'},{time:'19:00',label:'Dinner',name:'Recovery Dinner',description:'Refuel after training',calories:500,protein:40,tip:'Eat 2-3 hrs before sleep'}], foods);
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
  if (saved && saved.date === new Date().toDateString()) renderNutritionPlan(saved.meals, saved.foods);
}

// ════════════════════════════ PEDOMETER ════════════════════════════
G.sensorActive = false;
G.stepAccumulator = 0;
G.lastAcc = null;
G.stepThreshold = 12;

function initPedometer() {
  if (typeof DeviceMotionEvent !== 'undefined') {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(state => { if (state === 'granted') startMotionListener(); else setSensorNote('Motion access denied. <button onclick="initPedometer()" style="color:var(--gold);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:700">Tap to retry</button>'); })
        .catch(() => setSensorNote('Motion sensor unavailable on this device.'));
    } else { startMotionListener(); }
  } else { setSensorNote('Motion sensor not available. Log workouts manually.'); }
}
function startMotionListener() {
  G.sensorActive = true;
  setSensorNote('✅ Live step tracking active');
  document.getElementById('st-steps-unit').textContent = '📡 live sensor';
  window.addEventListener('devicemotion', handleMotion, { passive: true });
}
function handleMotion(e) {
  const acc = e.accelerationIncludingGravity; if (!acc) return;
  const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
  if (G.lastAcc !== null) {
    const delta = Math.abs(mag - G.lastAcc);
    G.stepAccumulator += delta;
    if (G.stepAccumulator >= G.stepThreshold) {
      G.today.steps += 1; G.stepAccumulator = 0;
      if (G.today.steps % 10 === 0) { saveToday(); refreshHQ(); }
    }
  }
  G.lastAcc = mag;
}
function setSensorNote(html) { const el = document.getElementById('sensor-status-note'); if (el) el.innerHTML = html; }

document.addEventListener('DOMContentLoaded', () => {
  const bootCountry = getStoredHolidayCountry() || detectLocaleCountryCode() || 'US';
  populateCountrySelect('f-country', bootCountry);
  populateCountrySelect('s-country', bootCountry);

  const tile = document.getElementById('tile-steps');
  if (tile) { tile.style.cursor = 'pointer'; tile.addEventListener('click', () => { if (!G.sensorActive) initPedometer(); else showToast('📡 Steps tracked automatically!'); }); }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSageChat();
  });
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
  const country = (p.country || getStoredHolidayCountry() || detectLocaleCountryCode() || 'US').toUpperCase();
  populateCountrySelect('s-country', country);
  document.getElementById('s-name').value = p.name || '';
  document.getElementById('s-age').value = p.age || '';
  document.getElementById('s-height').value = p.height || '';
  document.getElementById('s-weight').value = p.weight || '';
  document.getElementById('s-target').value = p.target || '';
  document.getElementById('s-gender').value = p.gender || '';
  document.getElementById('s-country').value = country;
  document.getElementById('s-body-type').value = mapLegacyBodyType(p.bodyType || 'average');
  document.getElementById('s-phase').value = p.physiquePhase || inferPhysiquePhaseByBodyType(p.goal || 'get_fit', p.bodyType || 'average');
  document.getElementById('s-goal').value = p.goal || 'get_fit';
  document.getElementById('s-days').value = p.days || 4;
  document.getElementById('s-pattern-mode').value = getWorkoutPatternMode(p);
  const splitInput = document.getElementById('s-build-muscle-split');
  if (splitInput) splitInput.value = getBuildMuscleSplitKey(p);
  document.getElementById('s-activity').value = p.activity || 'moderate';
  document.getElementById('s-diet').value = p.diet || 'no_restriction';
  document.getElementById('s-equipment').value = normalizeEquipmentKey(p.equipment || 'calisthenics');
  document.getElementById('s-calisthenics-level').value = p.calisthenicsLevel || 'beginner';
  document.getElementById('s-session-minutes').value = String(p.sessionMinutes || 45);
  document.getElementById('s-training-window').value = p.preferredWindow || 'evening';
  const autoWindowInput = document.getElementById('s-auto-window');
  if (autoWindowInput) autoWindowInput.checked = !!p.autoWindowFromSchedule;
}
function saveSettings() {
  const p = G.profile; if (!p) return;
  const previousGoal = p.goal;
  const previousEquipment = normalizeEquipmentKey(p.equipment);
  const previousLevel = p.calisthenicsLevel;
  const previousMinutes = p.sessionMinutes;
  const previousWindow = p.preferredWindow;
  const previousAutoWindow = !!p.autoWindowFromSchedule;
  const previousPatternMode = getWorkoutPatternMode(p);
  const previousBuildMuscleSplit = getBuildMuscleSplitKey(p);
  p.name = document.getElementById('s-name').value.trim() || p.name;
  p.age = +document.getElementById('s-age').value || p.age;
  p.height = +document.getElementById('s-height').value || p.height;
  p.weight = +document.getElementById('s-weight').value || p.weight;
  p.target = +document.getElementById('s-target').value || p.target;
  p.gender = document.getElementById('s-gender').value || p.gender;
  const manualCountry = String(document.getElementById('s-country').value || '').trim().toUpperCase();
  p.country = isValidCountryCode(manualCountry)
    ? manualCountry
    : (isValidCountryCode(p.country) ? String(p.country).toUpperCase() : 'US');
  setStoredHolidayCountry(p.country);
  p.bodyType = mapLegacyBodyType(document.getElementById('s-body-type').value || p.bodyType || 'average');
  p.goal = document.getElementById('s-goal').value;
  const phaseInput = document.getElementById('s-phase').value || p.physiquePhase;
  p.physiquePhase = phaseInput === 'auto' ? inferPhysiquePhaseByBodyType(p.goal || 'get_fit', p.bodyType) : (phaseInput || inferPhysiquePhaseByBodyType(p.goal || 'get_fit', p.bodyType));
  p.days = +document.getElementById('s-days').value || p.days;
  p.patternMode = document.getElementById('s-pattern-mode')?.value === 'strict' ? 'strict' : 'flexible';
  p.buildMuscleSplit = document.getElementById('s-build-muscle-split')?.value || p.buildMuscleSplit || 'classic';
  p.activity = document.getElementById('s-activity').value;
  p.diet = document.getElementById('s-diet').value;
  p.equipment = normalizeEquipmentKey(document.getElementById('s-equipment').value);
  p.calisthenicsLevel = document.getElementById('s-calisthenics-level').value || p.calisthenicsLevel || 'beginner';
  p.sessionMinutes = +document.getElementById('s-session-minutes').value || p.sessionMinutes || 45;
  p.preferredWindow = document.getElementById('s-training-window').value || p.preferredWindow || 'evening';
  p.autoWindowFromSchedule = !!document.getElementById('s-auto-window')?.checked;
  computeProfileTargets(p);
  localStorage.setItem('vq_profile', JSON.stringify(p));
  plannerAutoHolidayKey = '';
  if (document.getElementById('screen-schedule')?.classList.contains('active')) {
    autoLoadPlannerHolidaysForCurrentPlace();
  }
  if (previousGoal !== p.goal || previousEquipment !== p.equipment || previousLevel !== p.calisthenicsLevel || previousMinutes !== p.sessionMinutes || previousWindow !== p.preferredWindow || previousAutoWindow !== p.autoWindowFromSchedule || previousPatternMode !== p.patternMode || previousBuildMuscleSplit !== getBuildMuscleSplitKey(p)) {
    G.today.planSnapshot = null;
    saveToday();
  }
  updateNavBar();
  if (document.getElementById('screen-hq')?.classList.contains('active')) refreshHQ();
  if (document.getElementById('screen-plan')?.classList.contains('active')) renderPlan();
  if (document.getElementById('screen-schedule')?.classList.contains('active')) renderScheduleScreen();
  showToast('✅ Settings saved!');
}
function resetHero() {
  if (!confirm('Reset your hero? All XP and progress will be lost.')) return;
  localStorage.clear(); location.reload();
}

// ════════════════════════════ INIT ════════════════════════════
if (G.profile) {
  showNav();
  updateNavBar();
  initPedometer();
  go('hq');
}

function renderPlanEnvironmentPicker() {
  const picker = document.getElementById('plan-env-picker');
  if (!picker) return;
  const current = normalizeEquipmentKey(G.profile?.equipment || 'calisthenics');
  picker.innerHTML = Object.entries(EQUIP_LABELS).map(([key, info]) => {
    const selected = key === current ? 'selected' : '';
    return `<button class="plan-env-option ${selected}" onclick="setPlanEnvironment('${key}')">${info.icon} ${info.label}</button>`;
  }).join('') + '<div class="plan-env-hint">Default is set from your intro quiz answer. You can change it anytime here.</div>';
}

function togglePlanEnvironmentPicker() {
  const picker = document.getElementById('plan-env-picker');
  if (!picker) return;
  const show = picker.style.display === 'none';
  if (show) renderPlanEnvironmentPicker();
  picker.style.display = show ? 'grid' : 'none';
}

function setPlanEnvironment(tier) {
  setEquipment(tier);
  const picker = document.getElementById('plan-env-picker');
  if (picker) picker.style.display = 'none';
}