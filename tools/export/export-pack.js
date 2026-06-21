'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const REVIEW_DB = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const PROCESSED_DB = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const EXPORT_ROOT = path.join(ROOT_DIR, 'exports', 'manual-packs');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function safeName(value) {
  return String(value || 'video')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function findVideo(videoId) {
  const review = readJson(REVIEW_DB, { items: [], videos: {} });
  const processed = readJson(PROCESSED_DB, {});

  const reviewItems = Array.isArray(review.items)
    ? review.items
    : Object.values(review.videos || review || {});

  const item = reviewItems.find(v =>
    v.videoId === videoId ||
    v.id === videoId ||
    v.youtube?.videoId === videoId
  ) || {};

  const processedItem = Object.values(processed || {}).find(v =>
    v.videoId === videoId ||
    v.youtube?.videoId === videoId
  ) || {};

  return {
    ...processedItem,
    ...item
  };
}

const videoId = process.argv[2];

if (!videoId) {
  console.error('Usage: node tools/export/export-pack.js VIDEO_ID');
  process.exit(1);
}

const video = findVideo(videoId);

if (!video || Object.keys(video).length === 0) {
  console.error(`Video not found: ${videoId}`);
  process.exit(1);
}

const title = video.name || video.title || `UselessApps video ${videoId}`;
const url = video.url || video.youtube?.url || `https://youtu.be/${videoId}`;
const description =
  video.description ||
  video.metadataPackage?.youtube_shorts?.description ||
  video.metadataPackage?.youtube?.description ||
  `A ridiculous useless app from UselessApps.fun.`;

const hashtags = [
  '#UselessApps',
  '#AbsurdTech',
  '#ComedyShorts',
  '#PointlessApp',
  '#AIComedy'
];

const folder = path.join(EXPORT_ROOT, `${safeName(title)}-${videoId}-${stamp()}`);
fs.mkdirSync(folder, { recursive: true });

const metadata = {
  videoId,
  title,
  url,
  description,
  hashtags,
  publicSafe: video.audioValidation?.publicSafe ?? video.publicSafe ?? null,
  safetyStatus: video.safetyCheck?.status || null,
  audioReadiness: video.audioValidation?.readiness || null,
  createdAt: new Date().toISOString(),
  sourceVideoPath: video.videoPath || video.finalVideoPath || video.outputPath || ''
};

fs.writeFileSync(path.join(folder, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');

function writeText(name, text) {
  fs.writeFileSync(path.join(folder, name), text.trim() + '\n');
}

writeText('youtube.txt', `
${title}

${description}

${hashtags.join(' ')}

${url}
`);

writeText('tiktok.txt', `
${title}

${hashtags.slice(0, 4).join(' ')}
`);

writeText('instagram.txt', `
${title}

${description}

${hashtags.join(' ')}
`);

writeText('facebook.txt', `
${title}

${description}

Watch: ${url}
`);

writeText('x.txt', `
${title}

${url}

${hashtags.slice(0, 3).join(' ')}
`);

writeText('rumble.txt', `
Title: ${title}

Description:
${description}

Source:
${url}
`);

writeText('source-video.txt', `
Video ID: ${videoId}
YouTube URL: ${url}
Local source path: ${metadata.sourceVideoPath || 'unknown'}
`);

writeText('checklist.md', `
# Manual Export Checklist

## Video

- Title: ${title}
- Video ID: ${videoId}
- URL: ${url}

## Safety

- Public safe: ${metadata.publicSafe}
- Safety status: ${metadata.safetyStatus}
- Audio readiness: ${metadata.audioReadiness}

## Before Posting

- [ ] Confirm no government/police/politics/adult/banned category
- [ ] Confirm captions and title are clean
- [ ] Confirm audio is public safe
- [ ] Confirm platform-specific length/format
- [ ] Post manually
- [ ] Add publishing calendar entry
`);

console.log(`Export pack created: ${folder}`);
