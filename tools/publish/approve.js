'use strict';

const { setDecision } = require('./lib');

const videoId = process.argv[2];
const note = process.argv.slice(3).join(' ');

if (!videoId) {
  console.error('Usage: node tools/publish/approve.js VIDEO_ID "optional note"');
  process.exit(1);
}

const item = setDecision(videoId, 'approved', 'approved', note || 'Approved for publishing');

console.log(`Approved: ${item.appName}`);
console.log(`Video ID: ${item.videoId}`);
console.log(`URL: ${item.youtubeUrl}`);
