'use strict';

const fs = require('fs');
const path = require('path');

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

function getContentSummary() {
  const apps = readJson(APPS_FILE, []);
  const processed = readJson(PROCESSED_FILE, {});

  const records = Object.values(processed || {});

  return {
    appsTotal: Array.isArray(apps) ? apps.length : 0,
    processedTotal: records.length,
    uploaded: records.filter(r => r.uploaded).length,
    previewOnly: records.filter(r => r.dryRun && !r.uploaded).length,
    failed: records.filter(r => r.failedAt || r.error).length,
    withAudioMix: records.filter(r => r.audioMix).length,
    withLearningReason: records.filter(r => r.learningReason).length,
    latestRecord: records
      .filter(r => r.generatedAt || r.startedAt)
      .sort((a, b) => String(b.generatedAt || b.startedAt).localeCompare(String(a.generatedAt || a.startedAt)))[0] || null
  };
}

module.exports = {
  getContentSummary
};
