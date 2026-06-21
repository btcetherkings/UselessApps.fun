'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const {
  loadReviewDb,
  saveReviewDb,
  audit,
  readJson,
  PROCESSED_FILE
} = require('./lib');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

const videoId = process.argv[2];
const targetPrivacy = process.argv[3] || 'unlisted';

if (!videoId || !['unlisted', 'public', 'private'].includes(targetPrivacy)) {
  console.error('Usage: node tools/publish/publish-youtube.js VIDEO_ID unlisted|public|private');
  process.exit(1);
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

async function getVideo(accessToken, id) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,status');
  url.searchParams.set('id', id);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`videos.list failed: ${JSON.stringify(json)}`);
  }

  const item = json.items?.[0];

  if (!item) {
    throw new Error(`Video not found: ${id}`);
  }

  return item;
}

async function updatePrivacy(accessToken, video, privacyStatus) {
  const body = {
    id: video.id,
    snippet: {
      title: video.snippet.title,
      description: video.snippet.description || '',
      categoryId: video.snippet.categoryId || '28'
    },
    status: {
      ...video.status,
      privacyStatus
    }
  };

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet,status');

  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`videos.update failed: ${JSON.stringify(json)}`);
  }

  return json;
}

async function main() {
  const db = loadReviewDb();
  const item = db.items[videoId];

  if (!item) {
    throw new Error(`Video not found in review DB: ${videoId}. Run ./scripts/review-private.sh first.`);
  }

  if (item.status !== 'approved' && targetPrivacy !== 'private') {
    throw new Error(`Video must be approved before publishing. Current status: ${item.status}`);
  }

  if (targetPrivacy === 'public' && String(process.env.ALLOW_PUBLIC_PUBLISH || '').toLowerCase() !== 'true') {
    throw new Error('Public publishing blocked. Set ALLOW_PUBLIC_PUBLISH=true to allow public release. Use unlisted first.');
  }

  if (targetPrivacy === 'public' && item.audioValidation && item.audioValidation.publicSafe === false) {
    throw new Error(`Public publishing blocked by audio validation: ${(item.audioValidation.warnings || []).join(', ')}`);
  }

  if (targetPrivacy === 'unlisted' && item.audioValidation && item.audioValidation.publicSafe === false) {
    console.warn(`Warning: publishing unlisted with audio warnings: ${(item.audioValidation.warnings || []).join(', ')}`);
  }

  const accessToken = await getAccessToken();
  const video = await getVideo(accessToken, videoId);
  const updated = await updatePrivacy(accessToken, video, targetPrivacy);

  item.privacyStatus = targetPrivacy;
  item.status = targetPrivacy === 'public' ? 'published_public'
    : targetPrivacy === 'unlisted' ? 'published_unlisted'
    : 'private_uploaded';
  item.updatedAt = new Date().toISOString();
  item.publishedAt = targetPrivacy === 'private' ? null : new Date().toISOString();

  audit(db, `publish_${targetPrivacy}`, videoId, `Changed privacy to ${targetPrivacy}`);
  saveReviewDb(db);

  const processed = readJson(PROCESSED_FILE, {});
  for (const record of Object.values(processed)) {
    if (record?.youtube?.videoId === videoId) {
      record.youtube.privacyStatus = targetPrivacy;
      record.youtube.publishedStatusUpdatedAt = new Date().toISOString();
    }
  }

  console.log(`Updated privacy: ${item.appName}`);
  console.log(`Video ID: ${videoId}`);
  console.log(`Privacy: ${targetPrivacy}`);
  console.log(`URL: ${item.youtubeUrl}`);
}

main().catch(err => {
  const db = loadReviewDb();
  audit(db, 'publish_failed', videoId || 'unknown', err.message);
  saveReviewDb(db);
  console.error(err);
  process.exit(1);
});
