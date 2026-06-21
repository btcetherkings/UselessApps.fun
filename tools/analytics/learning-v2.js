'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const PERFORMANCE_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');
const OUT_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations-v2.json');

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
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function normalise(value) {
  return String(value || 'unknown').trim().toLowerCase().replace(/\s+/g, '_');
}

function getPerformanceByVideoId(performance) {
  const map = new Map();

  for (const item of performance.videos || performance.items || []) {
    if (item.videoId) map.set(item.videoId, item);
    if (item.id) map.set(item.id, item);
  }

  for (const [key, item] of Object.entries(performance || {})) {
    if (item && typeof item === 'object') {
      if (item.videoId) map.set(item.videoId, item);
      else if (/^[A-Za-z0-9_-]{8,}$/.test(key)) map.set(key, { ...item, videoId: key });
    }
  }

  return map;
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = normalise(row[field]);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function scoreVideo(row) {
  let score = 0;

  score += Number(row.views || 0) * 1;
  score += Number(row.likes || 0) * 8;
  score += Number(row.comments || 0) * 15;

  if (row.decision === 'approved') score += 20;
  if (row.publishStatus === 'published_unlisted') score += 35;
  if (row.publishStatus === 'published_public') score += 75;

  if (row.decision === 'rejected') score -= 100;
  if (row.decision === 'needs_rerender') score -= 60;
  if (row.audioReadiness === 'blocked_for_public') score -= 30;

  for (const warning of row.audioWarnings || []) {
    if (warning === 'audio_missing') score -= 20;
    if (warning === 'test_audio_used') score -= 25;
    if (warning === 'music_not_public_safe') score -= 25;
    if (warning === 'sfx_not_public_safe') score -= 15;
  }

  if (row.publicSafe === true) score += 10;
  if (row.publicSafe === false) score -= 25;

  if (row.uploaded) score += 5;
  if (row.dryRun) score -= 5;

  return score;
}

function addGroupScore(groups, key, score) {
  const k = normalise(key);
  if (!groups[k]) {
    groups[k] = {
      key: k,
      count: 0,
      totalScore: 0,
      averageScore: 0
    };
  }

  groups[k].count += 1;
  groups[k].totalScore += score;
  groups[k].averageScore = groups[k].totalScore / groups[k].count;
}

function rankGroups(groups) {
  return Object.values(groups)
    .sort((a, b) => {
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      return b.count - a.count;
    });
}

function buildDataset() {
  const processed = readJson(PROCESSED_FILE, {});
  const review = readJson(REVIEW_FILE, { items: {} });
  const performance = readJson(PERFORMANCE_FILE, {});
  const perfByVideoId = getPerformanceByVideoId(performance);

  const rows = [];

  for (const [key, record] of Object.entries(processed)) {
    if (!record || record.failedAt) continue;

    const videoId = record.youtube?.videoId || null;
    const reviewItem = videoId ? review.items?.[videoId] : null;
    const perf = videoId ? perfByVideoId.get(videoId) || {} : {};

    const audioValidation = reviewItem?.audioValidation || null;
    const audioPlan = record.audioPlan || {};
    const audioMix = record.audioMix || {};
    const storyPackage = record.storyPackage || {};

    const views = Number(perf.views || perf.statistics?.viewCount || 0);
    const likes = Number(perf.likes || perf.statistics?.likeCount || 0);
    const comments = Number(perf.comments || perf.statistics?.commentCount || 0);

    const row = {
      key,
      videoId,
      name: record.name,
      appType: storyPackage.appType || record.fakeCategory || record.type || 'unknown',
      storyMode: storyPackage.storyMode || 'unknown',
      audioMode: audioMix.mode || audioValidation?.mode || 'unknown',
      audioMood: audioPlan.mood || 'unknown',
      musicUsed: audioMix.musicUsed || audioPlan.music?.file || null,
      sfxTags: (audioPlan.sfx || []).flatMap(sfx => sfx.tags || []),
      reviewStatus: reviewItem?.status || 'not_in_review',
      decision: reviewItem?.decision || 'none',
      publishStatus: reviewItem?.status || record.youtube?.privacyStatus || 'local',
      audioReadiness: audioValidation?.readiness || 'not_validated',
      publicSafe: audioValidation?.publicSafe === true,
      audioWarnings: audioValidation?.warnings || [],
      uploaded: Boolean(record.uploaded),
      dryRun: Boolean(record.dryRun),
      views,
      likes,
      comments,
      url: record.youtube?.url || reviewItem?.url || null,
      generatedAt: record.generatedAt || record.startedAt || null
    };

    row.learningScore = scoreVideo(row);
    rows.push(row);
  }

  return rows;
}

function buildRecommendations(rows) {
  const appTypes = {};
  const storyModes = {};
  const audioMoods = {};
  const sfxTags = {};

  for (const row of rows) {
    addGroupScore(appTypes, row.appType, row.learningScore);
    addGroupScore(storyModes, row.storyMode, row.learningScore);
    addGroupScore(audioMoods, row.audioMood, row.learningScore);

    for (const tag of row.sfxTags || []) {
      addGroupScore(sfxTags, tag, row.learningScore);
    }
  }

  const rankedAppTypes = rankGroups(appTypes);
  const rankedStoryModes = rankGroups(storyModes);
  const rankedAudioMoods = rankGroups(audioMoods);
  const rankedSfxTags = rankGroups(sfxTags);

  const prefer = {
    appTypes: rankedAppTypes.filter(x => x.averageScore >= 0).slice(0, 5),
    storyModes: rankedStoryModes.filter(x => x.averageScore >= 0).slice(0, 5),
    audioMoods: rankedAudioMoods.filter(x => x.averageScore >= 0).slice(0, 5),
    sfxTags: rankedSfxTags.filter(x => x.averageScore >= 0).slice(0, 8)
  };

  const avoid = {
    appTypes: rankedAppTypes.filter(x => x.averageScore < 0).slice(-5).reverse(),
    storyModes: rankedStoryModes.filter(x => x.averageScore < 0).slice(-5).reverse(),
    audioMoods: rankedAudioMoods.filter(x => x.averageScore < 0).slice(-5).reverse(),
    sfxTags: rankedSfxTags.filter(x => x.averageScore < 0).slice(-8).reverse()
  };

  const topVideos = [...rows].sort((a, b) => b.learningScore - a.learningScore).slice(0, 10);
  const weakVideos = [...rows].sort((a, b) => a.learningScore - b.learningScore).slice(0, 10);

  const nextIdeas = prefer.appTypes.slice(0, 3).map((type, index) => ({
    appType: type.key,
    storyMode: prefer.storyModes[index]?.key || prefer.storyModes[0]?.key || 'fake_documentary',
    audioMood: prefer.audioMoods[index]?.key || prefer.audioMoods[0]?.key || 'documentary',
    reason: `High learning score: appType=${type.averageScore.toFixed(1)}`
  }));

  const summary = {
    videos: rows.length,
    uploaded: rows.filter(r => r.uploaded).length,
    approved: rows.filter(r => r.decision === 'approved').length,
    publishedUnlisted: rows.filter(r => r.publishStatus === 'published_unlisted').length,
    publishedPublic: rows.filter(r => r.publishStatus === 'published_public').length,
    publicSafe: rows.filter(r => r.publicSafe).length,
    blockedForPublic: rows.filter(r => r.audioReadiness === 'blocked_for_public').length
  };

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    summary,
    prefer,
    avoid,
    topVideos,
    weakVideos,
    nextIdeas,
    rows
  };
}

function printReport(recs) {
  console.log('');
  console.log('UselessApps.fun Learning Recommendations v2');
  console.log('===========================================');
  console.log('');

  console.log('Summary');
  console.log('-------');
  for (const [key, value] of Object.entries(recs.summary)) {
    console.log(`${key}: ${value}`);
  }

  console.log('');

  console.log('Prefer app types');
  console.log('----------------');
  for (const item of recs.prefer.appTypes) {
    console.log(`- ${item.key}: avg=${item.averageScore.toFixed(1)} count=${item.count}`);
  }

  console.log('');

  console.log('Prefer story modes');
  console.log('------------------');
  for (const item of recs.prefer.storyModes) {
    console.log(`- ${item.key}: avg=${item.averageScore.toFixed(1)} count=${item.count}`);
  }

  console.log('');

  console.log('Prefer audio moods');
  console.log('------------------');
  for (const item of recs.prefer.audioMoods) {
    console.log(`- ${item.key}: avg=${item.averageScore.toFixed(1)} count=${item.count}`);
  }

  console.log('');

  console.log('Top videos');
  console.log('----------');
  for (const row of recs.topVideos.slice(0, 5)) {
    console.log(`- ${row.name} | score=${row.learningScore} | status=${row.publishStatus} | publicSafe=${row.publicSafe}`);
  }

  console.log('');

  console.log('Next ideas');
  console.log('----------');
  for (const idea of recs.nextIdeas) {
    console.log(`- ${idea.appType} + ${idea.storyMode} + ${idea.audioMood}`);
    console.log(`  ${idea.reason}`);
  }

  console.log('');
}

function main() {
  const rows = buildDataset();
  const recs = buildRecommendations(rows);
  writeJson(OUT_FILE, recs);
  printReport(recs);
  console.log(`Saved: ${OUT_FILE}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildDataset,
  buildRecommendations,
  scoreVideo
};
