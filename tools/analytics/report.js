'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DB_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function groupBy(items, keyFn) {
  const out = new Map();

  for (const item of items) {
    const key = keyFn(item) || 'unknown';
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(item);
  }

  return out;
}

function avg(items, keyFn) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + Number(keyFn(item) || 0), 0) / items.length);
}

function printGroup(title, groups) {
  console.log(title);
  console.log('-'.repeat(title.length));

  const rows = [...groups.entries()].map(([key, items]) => ({
    key,
    count: items.length,
    avgScore: avg(items, item => item.score),
    views: items.reduce((sum, item) => sum + Number(item.stats?.viewCount || 0), 0),
    likes: items.reduce((sum, item) => sum + Number(item.stats?.likeCount || 0), 0),
    comments: items.reduce((sum, item) => sum + Number(item.stats?.commentCount || 0), 0)
  })).sort((a, b) => b.avgScore - a.avgScore);

  if (!rows.length) {
    console.log('No data yet.');
    console.log('');
    return;
  }

  for (const row of rows) {
    console.log(`${row.key} | count=${row.count} | avgScore=${row.avgScore} | views=${row.views} | likes=${row.likes} | comments=${row.comments}`);
  }

  console.log('');
}

const db = readJson(DB_FILE, { videos: {} });
const videos = Object.values(db.videos || {}).filter(v => !v.missingFromApi);

console.log('');
console.log('UselessApps.fun Analytics Report');
console.log('================================');
console.log('');
console.log(`Last pulled: ${db.lastPulledAt || 'never'}`);
console.log(`Tracked videos: ${videos.length}`);
console.log('');

const ranked = [...videos].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

console.log('Top videos');
console.log('----------');

if (!ranked.length) {
  console.log('No stats available yet. Run ./scripts/youtube-stats-pull.sh');
} else {
  ranked.slice(0, 10).forEach((v, i) => {
    console.log(`${i + 1}. ${v.appName}`);
    console.log(`   score: ${v.score || 0}`);
    console.log(`   views: ${v.stats?.viewCount || 0}, likes: ${v.stats?.likeCount || 0}, comments: ${v.stats?.commentCount || 0}`);
    console.log(`   type: ${v.appType || 'unknown'}, story: ${v.storyMode || 'unknown'}`);
    console.log(`   url: ${v.url || ''}`);
  });
}

console.log('');

printGroup('Performance by app type', groupBy(videos, v => v.appType));
printGroup('Performance by story mode', groupBy(videos, v => v.storyMode));

console.log('Recommendations');
console.log('---------------');

if (!ranked.length) {
  console.log('- Pull YouTube stats first.');
} else {
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  console.log(`- Best current video: ${best.appName} with score ${best.score || 0}.`);
  console.log(`- Weakest current video: ${worst.appName} with score ${worst.score || 0}.`);
  console.log('- Generate sequel ideas from the best app type/story mode.');
  console.log('- Avoid repeating weak story modes until more data exists.');
  console.log('- Use this report before public publishing decisions.');
}

console.log('');

// Learning recommendations summary
try {
  const recFile = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations.json');
  const rec = readJson(recFile, null);

  console.log('Learning Recommendations File');
  console.log('-----------------------------');

  if (!rec) {
    console.log('No recommendations.json yet. Run ./scripts/learning-recommendations.sh');
  } else {
    console.log(`Generated: ${rec.generatedAt}`);
    console.log(`Prefer app types: ${(rec.prefer?.appTypes || []).join(', ') || 'none'}`);
    console.log(`Prefer story modes: ${(rec.prefer?.storyModes || []).join(', ') || 'none'}`);
    console.log(`Avoid app types: ${(rec.avoid?.appTypes || []).join(', ') || 'none'}`);
    console.log(`Avoid story modes: ${(rec.avoid?.storyModes || []).join(', ') || 'none'}`);

    if (rec.sequelIdeas?.length) {
      console.log('');
      console.log('Sequel ideas:');
      rec.sequelIdeas.slice(0, 5).forEach((idea, i) => {
        console.log(`${i + 1}. ${idea.idea}`);
      });
    }
  }

  console.log('');
} catch (err) {
  console.log(`Could not read recommendations: ${err.message}`);
}

const fs2 = require('fs');
const path2 = require('path');

const recsV2File = path2.join(__dirname, 'recommendations-v2.json');

if (fs2.existsSync(recsV2File)) {
  const recsV2 = JSON.parse(fs2.readFileSync(recsV2File, 'utf8'));

  console.log('');
  console.log('Learning Recommendations v2');
  console.log('===========================');
  console.log('');

  console.log('Summary');
  console.log('-------');
  for (const [key, value] of Object.entries(recsV2.summary || {})) {
    console.log(`${key}: ${value}`);
  }

  console.log('');

  console.log('Prefer');
  console.log('------');
  console.log(`App types: ${(recsV2.prefer?.appTypes || []).map(x => x.key).join(', ') || 'none'}`);
  console.log(`Story modes: ${(recsV2.prefer?.storyModes || []).map(x => x.key).join(', ') || 'none'}`);
  console.log(`Audio moods: ${(recsV2.prefer?.audioMoods || []).map(x => x.key).join(', ') || 'none'}`);

  console.log('');

  console.log('Avoid');
  console.log('-----');
  console.log(`App types: ${(recsV2.avoid?.appTypes || []).map(x => x.key).join(', ') || 'none'}`);
  console.log(`Story modes: ${(recsV2.avoid?.storyModes || []).map(x => x.key).join(', ') || 'none'}`);
  console.log(`Audio moods: ${(recsV2.avoid?.audioMoods || []).map(x => x.key).join(', ') || 'none'}`);

  console.log('');

  console.log('Next ideas');
  console.log('----------');
  for (const idea of recsV2.nextIdeas || []) {
    console.log(`- ${idea.appType} + ${idea.storyMode} + ${idea.audioMood}`);
    console.log(`  ${idea.reason}`);
  }
}
