'use strict';

const { setDecision } = require('./lib');

const videoId = process.argv[2];
const note = process.argv.slice(3).join(' ');

if (!videoId) {
  console.error('Usage: node tools/publish/reject.js VIDEO_ID "optional note"');
  process.exit(1);
}

const item = setDecision(videoId, 'rejected', 'rejected', note || 'Rejected');

console.log(`Rejected: ${item.appName}`);
console.log(`Video ID: ${item.videoId}`);
