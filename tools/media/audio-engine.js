'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const MUSIC_DIR = path.join(ROOT_DIR, 'assets', 'music');
const SFX_DIR = path.join(ROOT_DIR, 'assets', 'sfx');
const MANIFEST_FILE = path.join(ROOT_DIR, 'tools', 'media', 'audio-manifest.json');
const { refreshManifest, loadManifest } = require('./audio-assets');

const AUDIO_EXTENSIONS = /\.(mp3|wav|m4a|aac|ogg)$/i;

const STORY_MODE_TO_MOOD = {
  fake_emergency_broadcast: 'emergency',
  fake_government_warning: 'emergency',
  fake_documentary: 'documentary',
  fake_nature_documentary: 'documentary',
  fake_courtroom_trial: 'courtroom',
  fake_scientific_experiment: 'scientific',
  fake_therapy_session: 'therapy',
  fake_corporate_audit: 'corporate',
  fake_investor_pitch: 'corporate',
  fake_conspiracy_investigation: 'mystery',
  fake_product_launch_disaster: 'chaotic',
  fake_police_chase: 'chaotic',
  fake_breaking_news_debate: 'fake-news'
};

const STORY_MODE_TO_SFX = {
  fake_emergency_broadcast: ['intro', 'alert', 'static'],
  fake_government_warning: ['intro', 'alert'],
  fake_documentary: ['intro', 'whoosh'],
  fake_nature_documentary: ['intro', 'ding'],
  fake_courtroom_trial: ['intro', 'gavel'],
  fake_scientific_experiment: ['intro', 'glitch', 'ding'],
  fake_therapy_session: ['intro', 'ding'],
  fake_corporate_audit: ['intro', 'typing'],
  fake_investor_pitch: ['intro', 'applause'],
  fake_conspiracy_investigation: ['intro', 'static'],
  fake_product_launch_disaster: ['intro', 'fail', 'record-scratch'],
  fake_police_chase: ['intro', 'whoosh', 'alert']
};

function listAudioFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(file => AUDIO_EXTENSIONS.test(file))
    .map(file => {
      const full = path.join(dir, file);
      const lower = file.toLowerCase();

      return {
        file,
        path: full,
        relativePath: path.relative(ROOT_DIR, full),
        tags: inferTagsFromFilename(lower),
        mood: inferMoodFromFilename(lower)
      };
    });
}

function inferTagsFromFilename(name) {
  const tags = [];

  for (const tag of [
    'intro',
    'outro',
    'alert',
    'whoosh',
    'fail',
    'ding',
    'glitch',
    'gavel',
    'typing',
    'static',
    'loading',
    'applause',
    'record-scratch',
    'siren',
    'beep'
  ]) {
    if (name.includes(tag)) tags.push(tag);
  }

  return tags.length ? tags : ['default'];
}

function inferMoodFromFilename(name) {
  for (const mood of [
    'chaotic',
    'fake-news',
    'documentary',
    'corporate',
    'courtroom',
    'scientific',
    'emergency',
    'mystery',
    'therapy'
  ]) {
    if (name.includes(mood)) return mood;
  }

  return 'default';
}

function buildManifest() {
  const manifest = refreshManifest();

  const music = (manifest.assets || [])
    .filter(item => item.kind === 'music')
    .map(item => ({
      ...item,
      path: path.join(ROOT_DIR, item.file),
      relativePath: item.file
    }));

  const sfx = (manifest.assets || [])
    .filter(item => item.kind === 'sfx')
    .map(item => ({
      ...item,
      path: path.join(ROOT_DIR, item.file),
      relativePath: item.file
    }));

  return {
    ...manifest,
    music,
    sfx
  };
}

function pick(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function chooseMusic(manifest, mood) {
  let music = manifest.music || [];

  if (!music.length) return null;

  const preferPublicSafe = String(process.env.AUDIO_REQUIRE_PUBLIC_SAFE || 'false').toLowerCase() === 'true';

  if (preferPublicSafe) {
    const safe = music.filter(item => item.safeForPublic === true);
    if (safe.length) music = safe;
  }

  const exact = music.filter(item => item.mood === mood);
  if (exact.length) return pick(exact);

  const defaults = music.filter(item => item.mood === 'default');
  if (defaults.length) return pick(defaults);

  return pick(music);
}

function chooseSfx(manifest, desiredTags) {
  let sfx = manifest.sfx || [];

  if (!sfx.length) return [];

  const preferPublicSafe = String(process.env.AUDIO_REQUIRE_PUBLIC_SAFE || 'false').toLowerCase() === 'true';

  if (preferPublicSafe) {
    const safe = sfx.filter(item => item.safeForPublic === true);
    if (safe.length) sfx = safe;
  }

  const chosen = [];

  for (const tag of desiredTags) {
    const matches = sfx.filter(item => item.tags.includes(tag));
    const selected = matches.length ? pick(matches) : null;

    if (selected && !chosen.some(item => item.relativePath === selected.relativePath)) {
      chosen.push(selected);
    }
  }

  return chosen.slice(0, 3);
}

function createAudioPlan(options = {}) {
  const storyPackage = options.storyPackage || {};
  const storyMode = storyPackage.storyMode || 'default';

  const manifest = buildManifest();

  const useAudio = String(process.env.USE_AUDIO_ENGINE || 'true').toLowerCase() !== 'false';
  const useMusic = String(process.env.USE_BACKGROUND_MUSIC || 'true').toLowerCase() !== 'false';
  const useSfx = String(process.env.USE_SFX || 'true').toLowerCase() !== 'false';

  const mood = process.env.AUDIO_STYLE && process.env.AUDIO_STYLE !== 'auto'
    ? process.env.AUDIO_STYLE
    : (STORY_MODE_TO_MOOD[storyMode] || 'default');

  const music = useAudio && useMusic ? chooseMusic(manifest, mood) : null;
  const sfxTags = STORY_MODE_TO_SFX[storyMode] || ['intro', 'ding'];
  const sfx = useAudio && useSfx ? chooseSfx(manifest, sfxTags) : [];

  return {
    enabled: useAudio,
    storyMode,
    mood,
    music: music ? {
      file: music.relativePath,
      mood: music.mood,
      volume: Number(process.env.MUSIC_VOLUME || 0.035)
    } : null,
    sfx: sfx.map((item, index) => ({
      file: item.relativePath,
      tags: item.tags,
      at: index === 0 ? 0.45 : 2.2 + index,
      volume: Number(process.env.SFX_VOLUME || process.env.CHAOS_SFX_VOLUME || 0.09)
    })),
    ducking: String(process.env.AUDIO_DUCKING || 'true').toLowerCase() !== 'false',
    narrationVolume: Number(process.env.NARRATION_VOLUME || 1.25),
    fallback: {
      noMusicFiles: !manifest.music.length,
      noSfxFiles: !manifest.sfx.length
    }
  };
}

if (require.main === module) {
  const plan = createAudioPlan({
    storyPackage: {
      storyMode: process.env.TEST_STORY_MODE || 'fake_emergency_broadcast'
    }
  });

  console.log(JSON.stringify(plan, null, 2));
}

module.exports = {
  buildManifest,
  createAudioPlan
};
