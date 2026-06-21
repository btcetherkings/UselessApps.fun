'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DB_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function scoreVideo(stats = {}) {
  const views = Number(stats.views || 0);
  const likes = Number(stats.likes || 0);
  const comments = Number(stats.comments || 0);
  const avgViewDuration = Number(stats.averageViewDuration || 0);
  const subscribersGained = Number(stats.subscribersGained || 0);

  return Math.round(
    views * 1 +
    likes * 8 +
    comments * 12 +
    avgViewDuration * 3 +
    subscribersGained * 50
  );
}

function buildLearningReport() {
  const db = readJson(DB_FILE, { videos: {}, learning: {} });
  const processed = readJson(PROCESSED_FILE, {});

  const uploaded = Object.entries(processed)
    .filter(([, item]) => item?.uploaded)
    .map(([key, item]) => ({
      key,
      name: item.name,
      url: item.youtube?.url,
      title: item.youtube?.title,
      score: scoreVideo(db.videos?.[item.youtube?.videoId]?.stats || {})
    }));

  const sorted = [...uploaded].sort((a, b) => b.score - a.score);

  return {
    uploadedCount: uploaded.length,
    trackedPerformanceCount: Object.keys(db.videos || {}).length,
    topVideos: sorted.slice(0, 5),
    recommendations: [
      uploaded.length === 0 ? 'No uploaded videos found yet.' : null,
      Object.keys(db.videos || {}).length === 0 ? 'No analytics imported yet. Add YouTube Analytics pull next.' : null,
      'Use top videos to generate sequel apps.',
      'Reduce app/story types that repeatedly score low.',
      'Track hook, title, story mode, and app type in content-ledger.json.'
    ].filter(Boolean)
  };
}

if (require.main === module) {
  console.log(JSON.stringify(buildLearningReport(), null, 2));
}

module.exports = {
  scoreVideo,
  buildLearningReport
};
