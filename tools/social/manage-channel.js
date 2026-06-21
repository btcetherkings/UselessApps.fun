'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const FILE = path.join(ROOT_DIR, 'tools', 'social', 'social-channels.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function ensureShape(data) {
  if (!data.version) data.version = 1;
  if (!data.channels) data.channels = {};
  return data;
}

const cmd = process.argv[2] || 'list';
const platform = process.argv[3];
const field = process.argv[4];
const rawValue = process.argv.slice(5).join(' ');

const data = ensureShape(readJson(FILE, { version: 1, updatedAt: null, channels: {} }));

if (cmd === 'list') {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

if (cmd === 'set') {
  if (!platform || !field) {
    console.error('Usage: node tools/social/manage-channel.js set PLATFORM FIELD VALUE');
    process.exit(1);
  }

  if (!data.channels[platform]) {
    data.channels[platform] = {
      enabled: false,
      connected: false,
      mode: 'future',
      handle: '',
      url: '',
      status: 'not_connected',
      supportsUpload: false,
      supportsAnalytics: false,
      notes: ''
    };
  }

  let value = rawValue;
  if (value === 'true') value = true;
  if (value === 'false') value = false;

  data.channels[platform][field] = value;
  writeJson(FILE, data);

  console.log(`Updated channel ${platform}.${field}`);
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
