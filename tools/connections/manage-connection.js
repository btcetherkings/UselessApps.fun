'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const FILE = path.join(ROOT_DIR, 'tools', 'connections', 'api-connections.json');

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
  if (!data.connections) data.connections = {};
  return data;
}

const cmd = process.argv[2] || 'list';
const provider = process.argv[3];
const field = process.argv[4];
const rawValue = process.argv.slice(5).join(' ');

const data = ensureShape(readJson(FILE, { version: 1, updatedAt: null, connections: {} }));

if (cmd === 'list') {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

if (cmd === 'set') {
  if (!provider || !field) {
    console.error('Usage: node tools/connections/manage-connection.js set PROVIDER FIELD VALUE');
    process.exit(1);
  }

  if (!data.connections[provider]) {
    data.connections[provider] = {
      enabled: false,
      connected: false,
      status: 'not_connected',
      authType: 'env',
      requiredEnvVars: [],
      lastCheckedAt: null,
      notes: ''
    };
  }

  let value = rawValue;
  if (value === 'true') value = true;
  if (value === 'false') value = false;

  if (field === 'requiredEnvVars') {
    value = rawValue.split(',').map(x => x.trim()).filter(Boolean);
  }

  data.connections[provider][field] = value;
  data.connections[provider].lastCheckedAt = new Date().toISOString();

  writeJson(FILE, data);
  console.log(`Updated connection ${provider}.${field}`);
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
