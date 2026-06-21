'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DB_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');
const OUT_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations.json');

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

function groupBy(items, keyFn) {
  const groups = new Map();

  for (const item of items) {
    const key = keyFn(item) || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  return groups;
}

function avgScore(items) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + Number(item.score || 0), 0) / items.length);
}

function rankGroups(groups) {
  return [...groups.entries()]
    .map(([name, items]) => ({
      name,
      count: items.length,
      avgScore: avgScore(items),
      totalScore: items.reduce((sum, item) => sum + Number(item.score || 0), 0),
      totalViews: items.reduce((sum, item) => sum + Number(item.stats?.viewCount || 0), 0),
      totalLikes: items.reduce((sum, item) => sum + Number(item.stats?.likeCount || 0), 0),
      totalComments: items.reduce((sum, item) => sum + Number(item.stats?.commentCount || 0), 0)
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function makeSequelIdeas(bestVideos) {
  return bestVideos.slice(0, 5).map(video => {
    const base = video.appName || 'Useless App';
    const type = video.appType || 'general';

    return {
      sourceVideoId: video.videoId,
      sourceApp: base,
      sourceUrl: video.url || null,
      appType: type,
      idea: `Make a spiritual sequel to "${base}" but with a different useless mechanic.`,
      instruction: `Create a new ${type} app inspired by "${base}" without copying the same name, script, or UI.`
    };
  });
}

function buildRecommendations() {
  const db = readJson(DB_FILE, { videos: {} });
  const videos = Object.values(db.videos || {}).filter(v => !v.missingFromApi);

  const ranked = [...videos].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const positive = ranked.filter(v => Number(v.score || 0) > 0);

  const byType = rankGroups(groupBy(videos, v => v.appType));
  const byStory = rankGroups(groupBy(videos, v => v.storyMode));
  const byHook = rankGroups(groupBy(videos, v => v.hook));

  const hasUsefulStats = positive.length > 0;

  const preferAppTypes = hasUsefulStats ? byType.filter(x => x.avgScore > 0).slice(0, 3).map(x => x.name) : [];
  const preferStoryModes = hasUsefulStats ? byStory.filter(x => x.avgScore > 0).slice(0, 3).map(x => x.name) : [];
  const preferHooks = hasUsefulStats ? byHook.filter(x => x.avgScore > 0).slice(0, 3).map(x => x.name) : [];

  const avoidAppTypes = hasUsefulStats ? byType.slice(-3).filter(x => x.avgScore === 0 && x.count >= 2).map(x => x.name) : [];
  const avoidStoryModes = hasUsefulStats ? byStory.slice(-3).filter(x => x.avgScore === 0 && x.count >= 2).map(x => x.name) : [];

  const recommendations = {
    generatedAt: new Date().toISOString(),
    source: {
      performanceDb: DB_FILE,
      lastPulledAt: db.lastPulledAt || null
    },
    summary: {
      trackedVideos: videos.length,
      videosWithPositiveScore: positive.length,
      bestVideo: ranked[0] ? {
        videoId: ranked[0].videoId,
        appName: ranked[0].appName,
        score: ranked[0].score || 0,
        url: ranked[0].url || null
      } : null,
      weakestVideo: ranked.length ? {
        videoId: ranked[ranked.length - 1].videoId,
        appName: ranked[ranked.length - 1].appName,
        score: ranked[ranked.length - 1].score || 0,
        url: ranked[ranked.length - 1].url || null
      } : null
    },
    prefer: {
      appTypes: preferAppTypes,
      storyModes: preferStoryModes,
      hooks: preferHooks,
      titlePatterns: []
    },
    avoid: {
      appTypes: avoidAppTypes,
      storyModes: avoidStoryModes,
      hooks: []
    },
    rankings: {
      appTypes: byType,
      storyModes: byStory,
      hooks: byHook.slice(0, 10)
    },
    sequelIdeas: makeSequelIdeas(ranked),
    notes: []
  };

  if (!videos.length) {
    recommendations.notes.push('No videos tracked yet. Run youtube-stats-pull first.');
  }

  if (!hasUsefulStats) {
    recommendations.notes.push('All scores are zero or missing. Use variety and anti-repeat rules only. Do not overfit yet.');
  }

  if (hasUsefulStats) {
    recommendations.notes.push('Use preferred patterns cautiously. Generate related but not identical apps.');
  }

  writeJson(OUT_FILE, recommendations);
  return recommendations;
}

if (require.main === module) {
  const rec = buildRecommendations();

  console.log('');
  console.log('UselessApps.fun Learning Recommendations');
  console.log('========================================');
  console.log('');
  console.log(`Tracked videos: ${rec.summary.trackedVideos}`);
  console.log(`Positive-score videos: ${rec.summary.videosWithPositiveScore}`);
  console.log('');

  if (rec.summary.bestVideo) {
    console.log(`Best video: ${rec.summary.bestVideo.appName} | score=${rec.summary.bestVideo.score}`);
  }

  if (rec.summary.weakestVideo) {
    console.log(`Weakest video: ${rec.summary.weakestVideo.appName} | score=${rec.summary.weakestVideo.score}`);
  }

  console.log('');
  console.log(`Prefer app types: ${rec.prefer.appTypes.join(', ') || 'none yet'}`);
  console.log(`Prefer story modes: ${rec.prefer.storyModes.join(', ') || 'none yet'}`);
  console.log(`Avoid app types: ${rec.avoid.appTypes.join(', ') || 'none yet'}`);
  console.log(`Avoid story modes: ${rec.avoid.storyModes.join(', ') || 'none yet'}`);
  console.log('');

  console.log('Notes:');
  for (const note of rec.notes) {
    console.log(`- ${note}`);
  }

  console.log('');
  console.log(`Wrote ${OUT_FILE}`);
}

module.exports = {
  buildRecommendations
};
