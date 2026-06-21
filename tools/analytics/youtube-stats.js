'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const DB_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'performance-db.json');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

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
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\\n');
}

function uploadedVideosFromProcessed() {
  const processed = readJson(PROCESSED_FILE, {});
  return Object.entries(processed)
    .filter(([, item]) => item?.uploaded && item?.youtube?.videoId)
    .map(([key, item]) => ({
      key,
      appName: item.name,
      file: item.file,
      videoId: item.youtube.videoId,
      url: item.youtube.url,
      title: item.youtube.title,
      appUrl: item.appUrl,
      storyPackage: item.storyPackage || null,
      metadataPackage: item.metadataPackage || null,
      qualityPlan: item.qualityPlan || null
    }));
}

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET or YOUTUBE_REFRESH_TOKEN in .env');
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`OAuth token refresh failed: ${JSON.stringify(json)}`);
  }

  return json.access_token;
}

async function fetchVideoStats(accessToken, videoIds) {
  if (videoIds.length === 0) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,statistics,status');
  url.searchParams.set('id', videoIds.join(','));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`YouTube videos.list failed: ${JSON.stringify(json)}`);
  }

  return json.items || [];
}

function toNumber(value) {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function basicScore(stats) {
  return (
    toNumber(stats.viewCount) * 1 +
    toNumber(stats.likeCount) * 8 +
    toNumber(stats.commentCount) * 15
  );
}

async function main() {
  const uploaded = uploadedVideosFromProcessed();

  console.log(`Found uploaded videos: ${uploaded.length}`);

  if (uploaded.length === 0) {
    console.log('No uploaded videos found in processed-v3.json.');
    return;
  }

  const accessToken = await getAccessToken();

  const db = readJson(DB_FILE, {
    version: 1,
    videos: {},
    learning: {
      topAppTypes: [],
      topStoryModes: [],
      topHooks: [],
      weakAppTypes: [],
      recommendations: []
    }
  });

  db.version = db.version || 1;
  db.videos = db.videos || {};
  db.learning = db.learning || {};
  db.lastPulledAt = new Date().toISOString();

  const chunks = [];
  for (let i = 0; i < uploaded.length; i += 50) {
    chunks.push(uploaded.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const items = await fetchVideoStats(accessToken, chunk.map(v => v.videoId));
    const byId = new Map(items.map(item => [item.id, item]));

    for (const video of chunk) {
      const item = byId.get(video.videoId);

      if (!item) {
        db.videos[video.videoId] = {
          ...(db.videos[video.videoId] || {}),
          videoId: video.videoId,
          appName: video.appName,
          url: video.url,
          missingFromApi: true,
          lastCheckedAt: new Date().toISOString()
        };
        continue;
      }

      const stats = item.statistics || {};
      const snippet = item.snippet || {};
      const status = item.status || {};

      db.videos[video.videoId] = {
        ...(db.videos[video.videoId] || {}),
        videoId: video.videoId,
        appKey: video.key,
        appName: video.appName,
        file: video.file,
        url: video.url,
        appUrl: video.appUrl,
        title: snippet.title || video.title,
        publishedAt: snippet.publishedAt || null,
        privacyStatus: status.privacyStatus || null,
        uploadStatus: status.uploadStatus || null,
        stats: {
          viewCount: toNumber(stats.viewCount),
          likeCount: toNumber(stats.likeCount),
          commentCount: toNumber(stats.commentCount),
          favoriteCount: toNumber(stats.favoriteCount)
        },
        storyMode: video.storyPackage?.storyMode || null,
        appType: video.storyPackage?.appType || null,
        hook: video.storyPackage?.hook || null,
        qualityMode: video.qualityPlan?.qualityMode || null,
        renderTarget: video.qualityPlan?.renderTarget || null,
        score: basicScore(stats),
        lastCheckedAt: new Date().toISOString()
      };
    }
  }

  writeJson(DB_FILE, db);

  console.log(`Updated ${DB_FILE}`);
  console.log('');
  console.log('Top videos by basic score:');

  Object.values(db.videos)
    .filter(v => !v.missingFromApi)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10)
    .forEach((v, index) => {
      console.log(`${index + 1}. ${v.appName} | score=${v.score} | views=${v.stats?.viewCount || 0} | likes=${v.stats?.likeCount || 0} | comments=${v.stats?.commentCount || 0}`);
    });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
