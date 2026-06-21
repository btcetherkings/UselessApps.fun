'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const SOCIAL_FILE = path.join(ROOT_DIR, 'tools', 'social', 'social-channels.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function getSocialSummary() {
  const data = readJson(SOCIAL_FILE, { channels: {} });
  const channels = Object.entries(data.channels || {}).map(([key, value]) => ({
    key,
    ...value
  }));

  return {
    total: channels.length,
    enabled: channels.filter(c => c.enabled).length,
    connected: channels.filter(c => c.connected).length,
    notConnected: channels.filter(c => !c.connected).length,
    channels
  };
}

module.exports = {
  getSocialSummary
};
