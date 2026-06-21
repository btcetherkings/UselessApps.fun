'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PLATFORM_FILE = path.join(ROOT_DIR, 'tools', 'platforms', 'platform-registry.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function getPlatformSummary() {
  const data = readJson(PLATFORM_FILE, { platforms: {} });
  const platforms = Object.entries(data.platforms || {}).map(([key, value]) => ({
    key,
    ...value
  }));

  return {
    total: platforms.length,
    enabled: platforms.filter(p => p.enabled).length,
    connected: platforms.filter(p => p.connected).length,
    api: platforms.filter(p => p.mode === 'api').length,
    manual: platforms.filter(p => p.mode === 'manual').length,
    future: platforms.filter(p => p.mode === 'future').length,
    uploadCapable: platforms.filter(p => p.supportsUpload).length,
    analyticsCapable: platforms.filter(p => p.supportsAnalytics).length,
    platforms
  };
}

module.exports = {
  getPlatformSummary
};
