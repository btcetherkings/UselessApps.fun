'use strict';

const fs = require('fs');
const path = require('path');

const { createQualityPlan } = require('./quality-engine');
const { createStoryPackage } = require('../story/story-engine');
const { createMetadataPackage } = require('../metadata/metadata-engine');
const { buildLearningReport } = require('../analytics/learning-engine');

const ROOT_DIR = path.join(__dirname, '..', '..');
const APPS_JSON = path.join(ROOT_DIR, 'apps.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const apps = readJson(APPS_JSON, []);
const sampleApp = apps[apps.length - 1] || {
  name: 'Sample Useless App',
  description: 'A sample pointless app.'
};

const story = createStoryPackage(sampleApp);
const metadata = createMetadataPackage(sampleApp, story, sampleApp.file || '');
const quality = createQualityPlan();
const learning = buildLearningReport();

console.log('');
console.log('UselessApps.fun Media Intelligence Report');
console.log('=========================================');
console.log('');

console.log('Sample app');
console.log('----------');
console.log(sampleApp.name);
console.log(sampleApp.description || '');
console.log('');

console.log('Story package');
console.log('-------------');
console.log(`Mode: ${story.storyMode}`);
console.log(`Type: ${story.appType}`);
console.log(`Hash: ${story.storyHash}`);
console.log(`Hook: ${story.hook}`);
console.log('');

console.log('YouTube metadata');
console.log('----------------');
console.log(`Title: ${metadata.youtube_shorts.title}`);
console.log(`Pinned comment: ${metadata.youtube_shorts.pinnedComment}`);
console.log(`Hashtags: ${metadata.youtube_shorts.hashtags.join(' ')}`);
console.log('');

console.log('Quality plan');
console.log('------------');
console.log(`Mode: ${quality.qualityMode}`);
console.log(`Target: ${quality.renderTarget}`);
console.log(`Size: ${quality.profile.width}x${quality.profile.height}`);
console.log(`FPS: ${quality.profile.fps}`);
console.log(`Music files: ${quality.music.count}`);
console.log(`SFX files: ${quality.sfx.count}`);
console.log('');

console.log('Learning report');
console.log('---------------');
console.log(`Uploaded videos: ${learning.uploadedCount}`);
console.log(`Tracked performance records: ${learning.trackedPerformanceCount}`);
console.log('Recommendations:');
for (const rec of learning.recommendations) {
  console.log(`- ${rec}`);
}
console.log('');
