'use strict';

const fs = require('fs');
const path = require('path');
const { checkContentSafety, BLOCKED_STORY_MODES, BLOCKED_TERMS } = require('./content-policy');

const ROOT_DIR = path.join(__dirname, '..', '..');
const APPS_FILE = path.join(ROOT_DIR, 'apps.json');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function main() {
  const apps = readJson(APPS_FILE, []);
  const processed = readJson(PROCESSED_FILE, {});

  const appResults = (Array.isArray(apps) ? apps : []).map(app => ({
    name: app.name,
    file: app.file,
    type: 'app',
    result: checkContentSafety(app)
  }));

  const processedResults = Object.values(processed || {}).map(record => ({
    name: record.name,
    file: record.file,
    type: 'processed',
    result: checkContentSafety(record)
  }));

  const all = [...appResults, ...processedResults];

  const passed = all.filter(x => x.result.status === 'pass');
  const warned = all.filter(x => x.result.status === 'warn');
  const blocked = all.filter(x => x.result.status === 'block');

  console.log('');
  console.log('UselessApps.fun Brand Safety Report');
  console.log('===================================');
  console.log('');
  console.log(`Total checked: ${all.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Warnings: ${warned.length}`);
  console.log(`Blocked: ${blocked.length}`);
  console.log('');

  console.log('Blocked story modes');
  console.log('-------------------');
  for (const mode of BLOCKED_STORY_MODES) console.log(`- ${mode}`);
  console.log('');

  console.log('Blocked terms');
  console.log('-------------');
  console.log(BLOCKED_TERMS.join(', '));
  console.log('');

  if (blocked.length) {
    console.log('Blocked items');
    console.log('-------------');

    for (const item of blocked) {
      console.log(`- ${item.name || item.file || 'unknown'} (${item.type})`);
      for (const blocker of item.result.blockers) {
        console.log(`  ${blocker}`);
      }
    }

    console.log('');
  } else {
    console.log('No blocked items detected.');
    console.log('');
  }
}

main();
