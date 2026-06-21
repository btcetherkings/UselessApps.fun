'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const MUSIC_DIR = path.join(ROOT_DIR, 'assets', 'music');
const SFX_DIR = path.join(ROOT_DIR, 'assets', 'sfx');

const QUALITY_PROFILES = {
  preview: {
    width: 720,
    height: 1280,
    fps: 24,
    crf: 28,
    preset: 'veryfast',
    audioBitrate: '128k'
  },
  final: {
    width: 1080,
    height: 1920,
    fps: 30,
    crf: 20,
    preset: 'medium',
    audioBitrate: '192k'
  },
  web: {
    width: 1920,
    height: 1080,
    fps: 30,
    crf: 20,
    preset: 'medium',
    audioBitrate: '192k'
  },
  square: {
    width: 1080,
    height: 1080,
    fps: 30,
    crf: 21,
    preset: 'medium',
    audioBitrate: '192k'
  }
};

function listMediaFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(file => /\.(mp3|wav|m4a|aac|ogg)$/i.test(file))
    .map(file => path.join(dir, file));
}

function getQualityProfile(mode = 'preview') {
  return QUALITY_PROFILES[mode] || QUALITY_PROFILES.preview;
}

function createQualityPlan(options = {}) {
  const qualityMode = options.qualityMode || process.env.QUALITY_MODE || 'preview';
  const renderTarget = options.renderTarget || process.env.RENDER_TARGET || 'shorts';

  const profile = getQualityProfile(qualityMode);
  const musicFiles = listMediaFiles(MUSIC_DIR);
  const sfxFiles = listMediaFiles(SFX_DIR);

  return {
    qualityMode,
    renderTarget,
    profile,
    music: {
      enabled: musicFiles.length > 0,
      count: musicFiles.length,
      files: musicFiles
    },
    sfx: {
      enabled: sfxFiles.length > 0,
      count: sfxFiles.length,
      files: sfxFiles
    },
    recommendations: [
      'Use preview mode for local testing.',
      'Use final mode for private upload review.',
      'Keep music low under narration.',
      'Render 9:16 for Shorts/Reels/TikTok.',
      'Render 16:9 separately for web/Rumble/YouTube standard.'
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(createQualityPlan(), null, 2));
}

module.exports = {
  QUALITY_PROFILES,
  createQualityPlan,
  getQualityProfile
};
