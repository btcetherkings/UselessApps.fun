'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const MANIFEST_FILE = path.join(ROOT_DIR, 'tools', 'media', 'audio-manifest.json');

const AUDIO_EXTENSIONS = /\.(mp3|wav|m4a|aac|ogg)$/i;

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
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function normaliseId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'audio_asset';
}

function inferKind(file) {
  if (file.includes('/music/')) return 'music';
  if (file.includes('/sfx/')) return 'sfx';
  if (file.includes('/test-audio/')) return 'test';
  return 'unknown';
}

function inferMood(file) {
  const name = String(file || '').toLowerCase();

  for (const mood of [
    'fake-news',
    'documentary',
    'corporate',
    'courtroom',
    'scientific',
    'emergency',
    'mystery',
    'therapy',
    'chaotic',
    'comedy',
    'default'
  ]) {
    if (name.includes(mood)) return mood;
  }

  return 'default';
}

function inferTags(file) {
  const name = String(file || '').toLowerCase();
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
    'beep',
    'background',
    'loop'
  ]) {
    if (name.includes(tag)) tags.push(tag);
  }

  if (!tags.length && inferKind(file) === 'music') tags.push('background');
  if (!tags.length && inferKind(file) === 'sfx') tags.push('sfx');

  return [...new Set(tags)];
}

function isTestAudio(file) {
  const name = String(file || '').toLowerCase();

  return file.includes('/test-audio/') || [
    'test',
    'test-bed',
    'test-tone',
    'sine',
    'beep-test',
    'default-test',
    'intro-ding-test',
    'fail-beep-test'
  ].some(token => name.includes(token));
}

function findAudioFiles() {
  const dirs = [
    path.join(ROOT_DIR, 'assets', 'music'),
    path.join(ROOT_DIR, 'assets', 'sfx'),
    path.join(ROOT_DIR, 'assets', 'test-audio')
  ];

  const files = [];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!AUDIO_EXTENSIONS.test(file)) continue;

      const full = path.join(dir, file);
      const relative = path.relative(ROOT_DIR, full);

      files.push(relative);
    }
  }

  return files.sort();
}

function defaultManifest() {
  return {
    version: 2,
    generatedAt: null,
    assets: []
  };
}

function loadManifest() {
  const old = readJson(MANIFEST_FILE, defaultManifest());

  // Migrate old shape: { music: [], sfx: [] }
  if (!old.assets) {
    const assets = [];

    for (const item of old.music || []) {
      assets.push({
        id: normaliseId(item.relativePath || item.file),
        kind: 'music',
        file: item.relativePath || item.file,
        mood: item.mood || inferMood(item.relativePath || item.file),
        tags: item.tags || inferTags(item.relativePath || item.file),
        license: isTestAudio(item.relativePath || item.file) ? 'test-generated' : '',
        source: isTestAudio(item.relativePath || item.file) ? 'generated-test-tone' : '',
        safeForPublic: false,
        notes: isTestAudio(item.relativePath || item.file) ? 'Generated test tone. Not for public publishing.' : ''
      });
    }

    for (const item of old.sfx || []) {
      assets.push({
        id: normaliseId(item.relativePath || item.file),
        kind: 'sfx',
        file: item.relativePath || item.file,
        mood: item.mood || inferMood(item.relativePath || item.file),
        tags: item.tags || inferTags(item.relativePath || item.file),
        license: isTestAudio(item.relativePath || item.file) ? 'test-generated' : '',
        source: isTestAudio(item.relativePath || item.file) ? 'generated-test-tone' : '',
        safeForPublic: false,
        notes: isTestAudio(item.relativePath || item.file) ? 'Generated test tone. Not for public publishing.' : ''
      });
    }

    return {
      version: 2,
      generatedAt: old.generatedAt || null,
      assets
    };
  }

  old.version = old.version || 2;
  old.assets = old.assets || [];

  return old;
}

function saveManifest(manifest) {
  manifest.version = 2;
  manifest.generatedAt = new Date().toISOString();
  writeJson(MANIFEST_FILE, manifest);
}

function refreshManifest() {
  const manifest = loadManifest();
  const existingByFile = new Map((manifest.assets || []).map(item => [item.file, item]));
  const files = findAudioFiles();
  const assets = [];

  for (const file of files) {
    const existing = existingByFile.get(file);
    const testAudio = isTestAudio(file);
    const kind = inferKind(file);

    assets.push({
      id: existing?.id || normaliseId(`${kind}_${file}`),
      kind: existing?.kind || kind,
      file,
      mood: existing?.mood || inferMood(file),
      tags: existing?.tags || inferTags(file),
      license: existing?.license || (testAudio ? 'test-generated' : ''),
      source: existing?.source || (testAudio ? 'generated-test-tone' : ''),
      safeForPublic: testAudio ? false : Boolean(existing?.safeForPublic),
      notes: existing?.notes || (testAudio ? 'Generated test tone. Not for public publishing.' : '')
    });
  }

  manifest.assets = assets;
  saveManifest(manifest);

  return manifest;
}

function registerAsset({ file, kind, mood, tags, license, source, safeForPublic, notes }) {
  const manifest = refreshManifest();
  const relative = file.replace(/^\.?\//, '');
  const existingIndex = manifest.assets.findIndex(item => item.file === relative);
  const testAudio = isTestAudio(relative);

  const item = {
    id: normaliseId(`${kind}_${relative}`),
    kind,
    file: relative,
    mood: mood || inferMood(relative),
    tags: Array.isArray(tags) ? tags : inferTags(relative),
    license: license || '',
    source: source || '',
    safeForPublic: testAudio ? false : String(safeForPublic).toLowerCase() === 'true',
    notes: notes || ''
  };

  if (existingIndex >= 0) manifest.assets[existingIndex] = { ...manifest.assets[existingIndex], ...item };
  else manifest.assets.push(item);

  saveManifest(manifest);
  return item;
}

function publicSafeAssets(kind = null) {
  const manifest = loadManifest();

  return manifest.assets.filter(item => {
    if (kind && item.kind !== kind) return false;
    if (!item.safeForPublic) return false;
    if (!item.license || !item.source) return false;
    if (isTestAudio(item.file)) return false;
    if (!fs.existsSync(path.join(ROOT_DIR, item.file))) return false;
    return true;
  });
}

if (require.main === module) {
  const cmd = process.argv[2] || 'refresh';

  if (cmd === 'refresh') {
    const manifest = refreshManifest();
    console.log(`Refreshed ${MANIFEST_FILE}`);
    console.log(`Assets: ${manifest.assets.length}`);

    for (const item of manifest.assets) {
      console.log(`- ${item.id} | ${item.kind} | ${item.file} | safeForPublic=${item.safeForPublic}`);
    }
  } else if (cmd === 'register') {
    const [, , , file, kind, mood, license, source, safeForPublic, ...noteParts] = process.argv;

    if (!file || !kind) {
      console.error('Usage: node tools/media/audio-assets.js register FILE music|sfx MOOD LICENSE SOURCE SAFE_FOR_PUBLIC "notes"');
      process.exit(1);
    }

    const item = registerAsset({
      file,
      kind,
      mood,
      license,
      source,
      safeForPublic,
      notes: noteParts.join(' ')
    });

    console.log(`Registered ${item.id}`);
    console.log(JSON.stringify(item, null, 2));
  } else {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }
}

module.exports = {
  ROOT_DIR,
  MANIFEST_FILE,
  loadManifest,
  saveManifest,
  refreshManifest,
  registerAsset,
  publicSafeAssets,
  isTestAudio,
  inferTags,
  inferMood
};
