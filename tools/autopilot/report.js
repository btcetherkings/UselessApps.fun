'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const APPS_JSON = path.join(ROOT_DIR, 'apps.json');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const STATE_FILE = path.join(ROOT_DIR, 'tools', 'autopilot', 'autopilot-state.json');
const LEDGER_FILE = path.join(ROOT_DIR, 'tools', 'autopilot', 'content-ledger.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function keyOf(app) {
  return app.file || app.url || app.name;
}

function statusOf(app, processed) {
  const key = keyOf(app);
  const item = processed[key];

  if (item?.uploaded) {
    return {
      label: 'UPLOADED_PRIVATE',
      detail: item.youtube?.url || ''
    };
  }

  if (item?.dryRun && item?.localVideo) {
    return {
      label: 'PREVIEW_ONLY',
      detail: item.localVideo
    };
  }

  if (item?.failedAt || item?.error) {
    return {
      label: 'FAILED',
      detail: item.error || ''
    };
  }

  return {
    label: 'PENDING',
    detail: ''
  };
}

const apps = readJson(APPS_JSON, []);
const processed = readJson(PROCESSED_FILE, {});
const state = readJson(STATE_FILE, { runs: [], generatedApps: [] });
const ledger = readJson(LEDGER_FILE, { recentTypes: [], created: [] });

let uploaded = 0;
let previewed = 0;
let failed = 0;
let pending = 0;

console.log('');
console.log('UselessApps.fun Autopilot Report');
console.log('================================');
console.log('');

for (const app of apps) {
  const key = keyOf(app);
  const st = statusOf(app, processed);

  if (st.label === 'UPLOADED_PRIVATE') uploaded++;
  else if (st.label === 'PREVIEW_ONLY') previewed++;
  else if (st.label === 'FAILED') failed++;
  else pending++;

  console.log(`- ${app.name}`);
  console.log(`  file: ${key}`);
  console.log(`  type: ${app.vibe || app.fakeCategory || 'unknown'}`);
  console.log(`  status: ${st.label}${st.detail ? ' ' + st.detail : ''}`);
  console.log('');
}

console.log('Summary');
console.log('-------');
console.log(`Total apps: ${apps.length}`);
console.log(`Uploaded/private: ${uploaded}`);
console.log(`Preview only: ${previewed}`);
console.log(`Failed: ${failed}`);
console.log(`Pending: ${pending}`);
console.log(`Autopilot runs: ${(state.runs || []).length}`);
console.log('');

console.log('Content Ledger');
console.log('--------------');
console.log(`Recent types: ${(ledger.recentTypes || []).join(', ') || 'none'}`);
console.log(`Created by autopilot: ${(ledger.created || []).length}`);
console.log('');

console.log('Next likely action');
console.log('------------------');

if (failed > 0) {
  console.log('There are failed items. Review processed-v3.json before continuing.');
} else if (previewed > 0) {
  console.log('There is a preview-only item. Upload it privately before generating another app.');
} else if (pending > 0) {
  console.log('There is a pending app. Autopilot should upload/preview that next.');
} else {
  console.log('Queue is empty. Autopilot should create a NEW app next.');
}

console.log('');
