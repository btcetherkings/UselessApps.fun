'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const RECS_V2_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations-v2.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function getLearningSummary() {
  const recs = readJson(RECS_V2_FILE, null);

  if (!recs) {
    return {
      exists: false,
      summary: {},
      prefer: {},
      avoid: {},
      nextIdeas: [],
      topVideos: []
    };
  }

  return {
    exists: true,
    generatedAt: recs.generatedAt,
    summary: recs.summary || {},
    prefer: recs.prefer || {},
    avoid: recs.avoid || {},
    nextIdeas: recs.nextIdeas || [],
    topVideos: recs.topVideos || [],
    weakVideos: recs.weakVideos || []
  };
}

module.exports = {
  getLearningSummary
};
