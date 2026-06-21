'use strict';

const { buildManifest, createAudioPlan } = require('./audio-engine');

const manifest = buildManifest();
const plan = createAudioPlan({
  storyPackage: {
    storyMode: process.env.TEST_STORY_MODE || 'fake_emergency_broadcast'
  }
});

console.log('');
console.log('UselessApps.fun Audio Report');
console.log('============================');
console.log('');

console.log(`Music files: ${manifest.music.length}`);
for (const item of manifest.music) {
  console.log(`- ${item.relativePath} | mood=${item.mood} | tags=${item.tags.join(',')}`);
}

console.log('');

console.log(`SFX files: ${manifest.sfx.length}`);
for (const item of manifest.sfx) {
  console.log(`- ${item.relativePath} | mood=${item.mood} | tags=${item.tags.join(',')}`);
}

console.log('');

console.log('Sample audio plan');
console.log('-----------------');
console.log(`Enabled: ${plan.enabled}`);
console.log(`Story mode: ${plan.storyMode}`);
console.log(`Mood: ${plan.mood}`);
console.log(`Music: ${plan.music ? plan.music.file : 'none'}`);
console.log(`SFX count: ${plan.sfx.length}`);
console.log(`No music fallback: ${plan.fallback.noMusicFiles}`);
console.log(`No SFX fallback: ${plan.fallback.noSfxFiles}`);
console.log('');
