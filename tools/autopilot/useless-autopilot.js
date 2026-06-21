'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..', '..');
const APPS_JSON = path.join(ROOT_DIR, 'apps.json');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const STATE_FILE = path.join(ROOT_DIR, 'tools', 'autopilot', 'autopilot-state.json');
const LEDGER_FILE = path.join(ROOT_DIR, 'tools', 'autopilot', 'content-ledger.json');
const RECOMMENDATIONS_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations.json');
const RECOMMENDATIONS_V2_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations-v2.json');

const AUTO_DRY_RUN = String(process.env.AUTO_DRY_RUN || 'true').toLowerCase() === 'true';
const AUTO_VIDEO_PRIVACY = process.env.AUTO_VIDEO_PRIVACY || 'private';
const AUTO_MAX_PER_RUN = Number(process.env.AUTO_MAX_PER_RUN || 1);
const AUTO_GENERATE_WHEN_EMPTY = String(process.env.AUTO_GENERATE_WHEN_EMPTY || 'true').toLowerCase() !== 'false';
const AUTO_LOCAL_PORT = Number(process.env.AUTO_LOCAL_PORT || 8765);
const AUTO_GIT_COMMIT = String(process.env.AUTO_GIT_COMMIT || 'false').toLowerCase() === 'true';
const AUTO_GIT_PUSH = String(process.env.AUTO_GIT_PUSH || 'false').toLowerCase() === 'true';
const AUTO_AVOID_RECENT_TYPES = Number(process.env.AUTO_AVOID_RECENT_TYPES || 3);
const USE_LEARNING_ENGINE = String(process.env.USE_LEARNING_ENGINE || 'true').toLowerCase() !== 'false';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || process.env.BASE_URL || 'https://btcetherkings.github.io/useless-apps-fun/';
const RECORD_BASE_URL = `http://127.0.0.1:${AUTO_LOCAL_PORT}/`;

function log(msg) {
  console.log(msg);
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`Could not read ${file}: ${err.message}`);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function slugify(input) {
  return String(input || 'useless-app')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'useless-app';
}

function uniqueId() {
  return Math.random().toString(36).slice(2, 8);
}

function getAppKey(app) {
  return app.file || app.url;
}

function appWasUploaded(app, processed) {
  const key = getAppKey(app);
  return Boolean(processed[key]?.uploaded);
}
function appWasGeneratedOrUploaded(app, processed) {
  const key = getAppKey(app);
  const item = processed[key];

  if (!item) return false;
  if (item.failedAt || item.error) return false;
  if (item.uploaded) return true;
  if (item.dryRun && item.localVideo) return true;
  if (item.generatedAt && item.localVideo) return true;

  return false;
}


function findNextUnpublishedApp(apps, processed) {
  return apps.find(app => {
    if (!app || !app.name || (!app.file && !app.url)) return false;
    return !appWasUploaded(app, processed);
  });
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}


function normaliseType(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function getAppType(app) {
  return normaliseType(app.vibe || app.fakeCategory || app.type || 'unknown');
}

function readLedger() {
  return readJson(LEDGER_FILE, {
    version: 1,
    recentTypes: [],
    created: [],
    notes: []
  });
}

function writeLedger(ledger) {
  ledger.version = ledger.version || 1;
  ledger.recentTypes = Array.isArray(ledger.recentTypes) ? ledger.recentTypes : [];
  ledger.created = Array.isArray(ledger.created) ? ledger.created : [];
  writeJson(LEDGER_FILE, ledger);
}

function rememberCreatedAppInLedger(ledger, app, templateType) {
  const type = normaliseType(templateType || getAppType(app));

  ledger.recentTypes = [type, ...(ledger.recentTypes || []).filter(t => t !== type)]
    .slice(0, 10);

  ledger.created = ledger.created || [];

  ledger.created.push({
    name: app.name,
    file: app.file || app.url,
    type,
    fakeCategory: app.fakeCategory || null,
    generatedAt: app.generatedAt || new Date().toISOString()
  });

  writeLedger(ledger);
}


function readRecommendations() {
  if (!USE_LEARNING_ENGINE) {
    return null;
  }

  return readJson(RECOMMENDATIONS_FILE, null);
}

function learningTypeFromTemplate(template) {
  return normaliseType(template?.type || template?.fakeCategory || 'unknown');
}

function templateLearningScore(template, recommendations) {
  if (!recommendations) return 0;

  const type = learningTypeFromTemplate(template);
  let score = 0;

  const preferTypes = (recommendations.prefer?.appTypes || []).map(normaliseType);
  const avoidTypes = (recommendations.avoid?.appTypes || []).map(normaliseType);

  if (preferTypes.includes(type)) score += 10;
  if (avoidTypes.includes(type)) score -= 20;

  // If there are sequel ideas matching the type, gently boost it.
  const sequelTypes = (recommendations.sequelIdeas || [])
    .map(item => normaliseType(item.appType || 'unknown'));

  if (sequelTypes.includes(type)) score += 4;

  return score;
}

function chooseTemplateWithLearning(templates, apps, ledger) {
  const recommendations = readRecommendations();

  // First use existing anti-repeat selection as candidate base.
  const existingTypes = (apps || []).map(getAppType).filter(Boolean);
  const recentFromApps = existingTypes.slice(-AUTO_AVOID_RECENT_TYPES);
  const recentFromLedger = (ledger.recentTypes || []).slice(0, AUTO_AVOID_RECENT_TYPES);
  const blocked = new Set([...recentFromApps, ...recentFromLedger].map(normaliseType));

  let candidates = templates.filter(t => !blocked.has(normaliseType(t.type)));

  if (!candidates.length) {
    candidates = [...templates];
  }

  const scored = candidates
    .map(template => ({
      template,
      learningScore: templateLearningScore(template, recommendations),
      randomTieBreaker: Math.random()
    }))
    .sort((a, b) => {
      if (b.learningScore !== a.learningScore) return b.learningScore - a.learningScore;
      return b.randomTieBreaker - a.randomTieBreaker;
    });

  const selected = scored[0]?.template || pick(templates);

  selected.__learningReason = {
    useLearningEngine: USE_LEARNING_ENGINE,
    selectedType: selected.type,
    learningScore: scored[0]?.learningScore || 0,
    preferredTypes: recommendations?.prefer?.appTypes || [],
    avoidedTypes: recommendations?.avoid?.appTypes || [],
    note: recommendations?.notes?.[0] || null
  };

  return selected;
}


function chooseTemplateWithAntiRepeat(templates, apps, ledger) {
  const existingTypes = (apps || []).map(getAppType).filter(Boolean);
  const recentFromApps = existingTypes.slice(-AUTO_AVOID_RECENT_TYPES);
  const recentFromLedger = (ledger.recentTypes || []).slice(0, AUTO_AVOID_RECENT_TYPES);
  const blocked = new Set([...recentFromApps, ...recentFromLedger].map(normaliseType));

  const candidates = templates.filter(t => !blocked.has(normaliseType(t.type)));

  if (candidates.length > 0) {
    return pick(candidates);
  }

  const usage = new Map();

  for (const t of templates) {
    usage.set(normaliseType(t.type), 0);
  }

  for (const app of apps || []) {
    const type = getAppType(app);
    usage.set(type, (usage.get(type) || 0) + 1);
  }

  const sorted = [...templates].sort((a, b) => {
    const au = usage.get(normaliseType(a.type)) || 0;
    const bu = usage.get(normaliseType(b.type)) || 0;
    return au - bu;
  });

  return sorted[0] || pick(templates);
}

const IDEA_TEMPLATES = [
  {
    type: 'button',
    nameBits: [
      'Suspicious Button',
      'Emotionally Unavailable Button',
      'Button With Commitment Issues',
      'Button That Files Complaints',
      'Button That Needs Space'
    ],
    description: 'A button that refuses to cooperate with society.',
    fakeCategory: 'Button Avoidance Technology',
    uselessness: 98,
    html: app => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(app.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at top, #ff2fa7, #120018 60%, #020006);
      font-family: Arial, sans-serif;
      color: white;
      overflow: hidden;
    }
    .panel {
      text-align: center;
      max-width: 760px;
      padding: 40px;
      border: 4px solid rgba(255,255,255,0.25);
      border-radius: 32px;
      background: rgba(0,0,0,0.45);
      box-shadow: 0 0 60px rgba(255,255,0,0.25);
    }
    h1 { font-size: 52px; margin: 0 0 15px; }
    p { font-size: 24px; color: #ffe600; }
    button {
      position: absolute;
      left: 45%;
      top: 55%;
      padding: 24px 42px;
      font-size: 26px;
      font-weight: 900;
      border-radius: 999px;
      border: none;
      background: #ffe600;
      color: #14001d;
      cursor: pointer;
      transition: all 0.12s ease;
      box-shadow: 0 12px 0 #9c8500;
    }
    .status {
      position: fixed;
      bottom: 40px;
      left: 40px;
      right: 40px;
      text-align: center;
      font-size: 28px;
      color: #fff;
      background: rgba(255,0,0,0.35);
      padding: 18px;
      border-radius: 18px;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h1>${escapeHtml(app.name)}</h1>
    <p>Try to click it. The button has already contacted HR.</p>
  </div>

  <button id="btn">DO NOT CLICK</button>
  <div class="status" id="status">Button morale: unstable</div>

  <script>
    const btn = document.getElementById('btn');
    const status = document.getElementById('status');
    const lines = [
      'Button has requested legal representation.',
      'Cursor detected. Evading responsibility.',
      'Click attempt classified as harassment.',
      'Button has left the meeting.',
      'Productivity has been successfully avoided.'
    ];

    function runAway() {
      const x = Math.random() * (window.innerWidth - 240);
      const y = Math.random() * (window.innerHeight - 140);
      btn.style.left = x + 'px';
      btn.style.top = y + 'px';
      status.textContent = lines[Math.floor(Math.random() * lines.length)];
    }

    btn.addEventListener('mouseenter', runAway);
    btn.addEventListener('click', runAway);
    setInterval(runAway, 1900);
  </script>
</body>
</html>`
  },
  {
    type: 'todo',
    nameBits: [
      'Self-Deleting To-Do List',
      'Anti-Productivity Planner',
      'Task Destroyer 3000',
      'To-Do List With Trust Issues',
      'Corporate Regret Board'
    ],
    description: 'A to-do list that destroys your ambition before lunch.',
    fakeCategory: 'Anti-Productivity Software',
    uselessness: 99,
    html: app => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(app.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #0b1020, #38135c, #ff2fa7);
      font-family: Arial, sans-serif;
      color: white;
      display: grid;
      place-items: center;
    }
    .app {
      width: 760px;
      background: rgba(0,0,0,0.55);
      border-radius: 32px;
      padding: 40px;
      border: 3px solid rgba(255,255,255,0.20);
      box-shadow: 0 0 50px rgba(255,255,0,0.25);
    }
    h1 { font-size: 48px; margin: 0 0 15px; }
    input {
      width: 70%;
      padding: 18px;
      font-size: 24px;
      border-radius: 16px;
      border: none;
    }
    button {
      padding: 18px 24px;
      font-size: 22px;
      border: none;
      border-radius: 16px;
      background: #ffe600;
      font-weight: 900;
    }
    li {
      font-size: 28px;
      margin: 18px 0;
      padding: 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.12);
    }
    .panic { color: #ffe600; font-size: 26px; margin-top: 25px; }
  </style>
</head>
<body>
  <div class="app">
    <h1>${escapeHtml(app.name)}</h1>
    <p>Enter a task. Watch hope leave the room.</p>
    <input id="task" placeholder="Try being productive..." />
    <button id="add">Add</button>
    <ul id="list"></ul>
    <div class="panic" id="panic">Efficiency level: threatened</div>
  </div>

  <script>
    const task = document.getElementById('task');
    const add = document.getElementById('add');
    const list = document.getElementById('list');
    const panic = document.getElementById('panic');

    const messages = [
      'Task deleted for your own good.',
      'Ambition intercepted.',
      'Management has cancelled your productivity.',
      'Task entered witness protection.',
      'Calendar refused to cooperate.'
    ];

    function addTask() {
      const value = task.value || 'Become useful';
      const li = document.createElement('li');
      li.textContent = value;
      list.appendChild(li);
      panic.textContent = 'Task created. Destroying shortly...';
      task.value = '';

      setTimeout(() => {
        li.remove();
        panic.textContent = messages[Math.floor(Math.random() * messages.length)];
      }, 900);
    }

    add.onclick = addTask;
    task.addEventListener('keydown', e => {
      if (e.key === 'Enter') addTask();
    });
  </script>
</body>
</html>`
  },
  {
    type: 'spinner',
    nameBits: [
      'Infinite Loading Ceremony',
      'Spinner of Eternal Doubt',
      'Please Wait Forever',
      'Progress Bar of Lies',
      'Loading Screen With No Exit'
    ],
    description: 'A loading screen that has made peace with never finishing.',
    fakeCategory: 'Infinite Waiting Technology',
    uselessness: 97,
    html: app => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(app.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: radial-gradient(circle, #111, #020006);
      color: white;
      font-family: Arial, sans-serif;
      overflow: hidden;
    }
    .box { text-align: center; }
    h1 { font-size: 54px; }
    .spinner {
      width: 180px;
      height: 180px;
      margin: 40px auto;
      border: 24px solid rgba(255,255,255,0.18);
      border-top-color: #ffe600;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .bar {
      width: 640px;
      height: 38px;
      background: rgba(255,255,255,0.12);
      border-radius: 999px;
      overflow: hidden;
      margin: 30px auto;
    }
    .fill {
      height: 100%;
      width: 12%;
      background: #ff2fa7;
      animation: lie 4s ease-in-out infinite;
    }
    .status { font-size: 30px; color: #ffe600; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes lie {
      0% { width: 3%; }
      40% { width: 82%; }
      60% { width: 17%; }
      100% { width: 3%; }
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>${escapeHtml(app.name)}</h1>
    <div class="spinner"></div>
    <div class="bar"><div class="fill"></div></div>
    <div class="status" id="status">Loading disappointment...</div>
  </div>
  <script>
    const lines = [
      'Still loading...',
      'Almost there emotionally.',
      'Progress has resigned.',
      'Time is buffering.',
      'Please wait until the sun burns out.',
      'Loading the concept of loading.'
    ];
    const status = document.getElementById('status');
    setInterval(() => {
      status.textContent = lines[Math.floor(Math.random() * lines.length)];
    }, 1200);
  </script>
</body>
</html>`
  },
  {
    type: 'calculator',
    nameBits: [
      'Emotionally Unhelpful Calculator',
      'Calculator That Judges You',
      'Math Refusal Engine',
      'Numbers Are Under Review',
      'The Government Calculator'
    ],
    description: 'A calculator that refuses to give a straightforward answer.',
    fakeCategory: 'Mathematical Sabotage',
    uselessness: 96,
    html: app => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(app.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #190033, #001f3f);
      color: white;
      font-family: Arial, sans-serif;
      display: grid;
      place-items: center;
    }
    .calc {
      width: 680px;
      padding: 42px;
      border-radius: 34px;
      background: rgba(0,0,0,0.55);
      border: 3px solid rgba(255,255,255,0.22);
      text-align: center;
    }
    h1 { font-size: 46px; }
    input {
      width: 85%;
      padding: 22px;
      font-size: 32px;
      border: none;
      border-radius: 18px;
      text-align: center;
    }
    button {
      margin-top: 25px;
      padding: 20px 34px;
      font-size: 24px;
      border: none;
      border-radius: 18px;
      background: #ffe600;
      font-weight: 900;
    }
    .answer {
      margin-top: 35px;
      font-size: 34px;
      color: #ffe600;
      min-height: 80px;
    }
  </style>
</head>
<body>
  <div class="calc">
    <h1>${escapeHtml(app.name)}</h1>
    <p>Enter maths. Receive emotional admin.</p>
    <input id="sum" placeholder="2 + 2" />
    <br>
    <button id="go">Calculate-ish</button>
    <div class="answer" id="answer">Awaiting questionable numbers...</div>
  </div>

  <script>
    const answers = [
      'Result: classified.',
      'Answer unavailable due to vibes.',
      '2 + 2 is currently under review.',
      'Math has left the chat.',
      'Approximately yes.',
      'The numbers have formed a union.',
      'Please consult a wizard.'
    ];

    document.getElementById('go').onclick = () => {
      document.getElementById('answer').textContent =
        answers[Math.floor(Math.random() * answers.length)];
    };
  </script>
</body>
</html>`
  },
  {
    type: 'rock',
    nameBits: [
      'Rock That Knows Too Much',
      'Staring Pebble Supreme',
      'Emotionally Distant Mineral',
      'Pet Rock With Main Character Energy',
      'The Silent Boulder'
    ],
    description: 'A pet rock that stares at you and refuses to elaborate.',
    fakeCategory: 'Emotional Support Mineral',
    uselessness: 93,
    html: app => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(app.name)}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle, #333, #090909);
      color: white;
      font-family: Arial, sans-serif;
      display: grid;
      place-items: center;
    }
    .scene { text-align: center; }
    h1 { font-size: 52px; }
    .rock {
      width: 300px;
      height: 220px;
      background: linear-gradient(135deg, #777, #333);
      border-radius: 48% 52% 45% 55%;
      margin: 40px auto;
      position: relative;
      box-shadow: inset -30px -30px 40px rgba(0,0,0,0.35), 0 30px 80px rgba(0,0,0,0.7);
    }
    .eye {
      position: absolute;
      top: 75px;
      width: 42px;
      height: 42px;
      background: white;
      border-radius: 50%;
    }
    .eye:after {
      content: '';
      position: absolute;
      left: 14px;
      top: 14px;
      width: 16px;
      height: 16px;
      background: black;
      border-radius: 50%;
    }
    .left { left: 85px; }
    .right { right: 85px; }
    .caption { font-size: 32px; color: #ffe600; }
  </style>
</head>
<body>
  <div class="scene">
    <h1>${escapeHtml(app.name)}</h1>
    <div class="rock">
      <div class="eye left"></div>
      <div class="eye right"></div>
    </div>
    <div class="caption" id="caption">The rock is aware of your browser history.</div>
  </div>
  <script>
    const lines = [
      'The rock refuses interview.',
      'Eye contact continues.',
      'Mineral confidence rising.',
      'Rock has said nothing. Powerful.',
      'You blinked. Rock wins.'
    ];
    const c = document.getElementById('caption');
    setInterval(() => {
      c.textContent = lines[Math.floor(Math.random() * lines.length)];
    }, 1300);
  </script>
</body>
</html>`
  }
];

function existingNames(apps) {
  return new Set(apps.map(a => String(a.name || '').toLowerCase()));
}

function createNewUselessApp(apps) {
  const ledger = readLedger();
  const template = chooseTemplateWithLearning(IDEA_TEMPLATES, apps, ledger);
  const taken = existingNames(apps);

  let name = pick(template.nameBits);
  let attempts = 0;

  while (taken.has(name.toLowerCase()) && attempts < 20) {
    name = `${pick(template.nameBits)} ${uniqueId().toUpperCase()}`;
    attempts++;
  }

  const slug = slugify(name);
  const file = `apps/auto-${slug}.html`;
  const fullPath = path.join(ROOT_DIR, file);

  const app = {
    name,
    author: 'Useless Autopilot',
    description: template.description,
    file,
    uselessness: template.uselessness,
    vibe: template.type,
    fakeCategory: template.fakeCategory,
    generatedBy: 'tools/autopilot/useless-autopilot.js',
    generatedAt: new Date().toISOString(),
    learningReason: template.__learningReason || null
  };

  fs.writeFileSync(fullPath, template.html(app), 'utf8');

  rememberCreatedAppInLedger(ledger, app, template.type);

  return app;
}

function startStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, `http://127.0.0.1:${port}`);
      let pathname = decodeURIComponent(url.pathname);

      console.log(`[local-server] ${req.method} ${pathname}`);

      if (pathname === '/') pathname = '/index.html';

      const filePath = path.normalize(path.join(rootDir, pathname));

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500);
      res.end(err.message);
    }
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

function runGeneratorOnce() {
  const env = {
    ...process.env,
    RECORD_BASE_URL,
    PUBLIC_BASE_URL,
    DRY_RUN: String(AUTO_DRY_RUN),
    FORCE: 'false',
    MAX_PER_RUN: String(AUTO_MAX_PER_RUN),
    VIDEO_PRIVACY: AUTO_VIDEO_PRIVACY,
    CHAOS_MODE: process.env.CHAOS_MODE || 'true',
    KEEP_TMP: process.env.KEEP_TMP || 'false',
    VERBOSE: process.env.VERBOSE || 'false'
  };

  return new Promise((resolve, reject) => {
    const child = spawn('node', ['tools/video-generator/generate-v3.js'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env
    });

    child.on('error', reject);

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`generate-v3.js exited with code ${code}`));
      }
    });
  });
}

function gitCommitAndMaybePush(message) {
  if (!AUTO_GIT_COMMIT && !AUTO_GIT_PUSH) return;

  try {
    execFileSync('git', ['add', 'apps.json', 'apps', 'tools/autopilot/autopilot-state.json'], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });

    execFileSync('git', ['commit', '-m', message], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
  } catch (err) {
    console.warn(`Git commit skipped or failed: ${err.message}`);
  }

  if (AUTO_GIT_PUSH) {
    execFileSync('git', ['push'], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
  }
}

async function main() {
  log('UselessApps.fun autopilot starting...');
  log(`AUTO_DRY_RUN: ${AUTO_DRY_RUN}`);
  log(`AUTO_VIDEO_PRIVACY: ${AUTO_VIDEO_PRIVACY}`);
  log(`AUTO_MAX_PER_RUN: ${AUTO_MAX_PER_RUN}`);
  log(`AUTO_GENERATE_WHEN_EMPTY: ${AUTO_GENERATE_WHEN_EMPTY}`);
  log(`AUTO_AVOID_RECENT_TYPES: ${AUTO_AVOID_RECENT_TYPES}`);
  log(`USE_LEARNING_ENGINE: ${USE_LEARNING_ENGINE}`);
  log(`RECORD_BASE_URL: ${RECORD_BASE_URL}`);
  log(`PUBLIC_BASE_URL: ${PUBLIC_BASE_URL}`);

  const state = readJson(STATE_FILE, {
    runs: [],
    generatedApps: []
  });

  let apps = readJson(APPS_JSON, []);
  const processed = readJson(PROCESSED_FILE, {});

  if (!Array.isArray(apps)) {
    throw new Error('apps.json must be an array');
  }

  let nextApp = findNextUnpublishedApp(apps, processed);
  let createdNewApp = false;

  if (!nextApp && AUTO_GENERATE_WHEN_EMPTY) {
    log('No unpublished apps found. Creating a new useless app automatically...');

    nextApp = createNewUselessApp(apps);
    apps.push(nextApp);
    writeJson(APPS_JSON, apps);

    createdNewApp = true;

    state.generatedApps.push({
      name: nextApp.name,
      file: nextApp.file,
      generatedAt: nextApp.generatedAt
    });

    log(`Created new app: ${nextApp.name}`);
    log(`File: ${nextApp.file}`);

    gitCommitAndMaybePush(`Add autogenerated useless app: ${nextApp.name}`);
  }

  if (!nextApp) {
    log('Nothing to do. No unpublished apps and auto-generation is disabled.');
    return;
  }

  log(`Next app selected: ${nextApp.name}`);
  log(`File: ${nextApp.file || nextApp.url}`);

  const server = await startStaticServer(ROOT_DIR, AUTO_LOCAL_PORT);
  log(`Local recording server started on ${RECORD_BASE_URL}`);

  const runRecord = {
    startedAt: new Date().toISOString(),
    selectedApp: nextApp.name,
    selectedFile: nextApp.file || nextApp.url,
    createdNewApp,
    dryRun: AUTO_DRY_RUN,
    privacy: AUTO_VIDEO_PRIVACY,
    success: false
  };

  try {
    await runGeneratorOnce();

    const afterProcessed = readJson(PROCESSED_FILE, {});

    if (!appWasGeneratedOrUploaded(nextApp, afterProcessed)) {
      const key = getAppKey(nextApp);
      const item = afterProcessed[key];

      throw new Error(
        `Generator finished but selected app was not successfully generated/uploaded. ` +
        `App: ${nextApp.name}. Status: ${JSON.stringify(item || null)}`
      );
    }

    runRecord.success = true;
    runRecord.finishedAt = new Date().toISOString();

    log('Autopilot run completed successfully.');
  } catch (err) {
    runRecord.success = false;
    runRecord.error = err.message;
    runRecord.failedAt = new Date().toISOString();

    throw err;
  } finally {
    server.close();
    state.runs.push(runRecord);
    writeJson(STATE_FILE, state);
  }
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
