'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const FILE = path.join(ROOT_DIR, 'tools', 'business', 'business-metrics.json');

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
  if (!data.settings) {
    data.settings = {
      brandName: 'UselessApps.fun',
      siteUrl: 'https://uselessapps.fun',
      currency: 'GBP',
      monthlyBudget: 0,
      targetVideosPerDay: 1,
      targetPrivateUploadsPerDay: 1,
      targetPublicPostsPerWeek: 3,
      notes: ''
    };
  }
  if (!data.revenue) data.revenue = [];
  if (!data.costs) data.costs = [];
  return data;
}

const cmd = process.argv[2] || 'report';
const field = process.argv[3];
const rawValue = process.argv.slice(4).join(' ');

const data = ensureShape(readJson(FILE, { version: 1, updatedAt: null }));

if (cmd === 'report') {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

if (cmd === 'set') {
  if (!field) {
    console.error('Usage: node tools/business/manage-business.js set FIELD VALUE');
    process.exit(1);
  }

  let value = rawValue;
  if (!Number.isNaN(Number(value)) && value.trim() !== '') value = Number(value);
  if (value === 'true') value = true;
  if (value === 'false') value = false;

  data.settings[field] = value;
  writeJson(FILE, data);
  console.log(`Updated business setting ${field}`);
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
