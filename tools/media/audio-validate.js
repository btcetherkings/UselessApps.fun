'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');

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

function isTestAudio(file) {
  const name = String(file || '').toLowerCase();

  return [
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

function validateAudioRecord(record) {
  const warnings = [];
  const audioPlan = record.audioPlan || null;
  const audioMix = record.audioMix || null;

  if (!audioPlan && !audioMix) {
    warnings.push('audio_missing');
  }

  if (audioMix?.mode === 'narration_only') {
    warnings.push('narration_only');
  }

  if (audioPlan?.enabled && !audioMix) {
    warnings.push('audio_plan_exists_but_no_mix');
  }

  const musicUsed = audioMix?.musicUsed || audioPlan?.music?.file || null;
  const sfxUsed = audioMix?.sfxUsed || audioPlan?.sfx || [];

  if (audioPlan?.enabled && !musicUsed) {
    warnings.push('music_missing');
  }

  if (audioPlan?.enabled && (!Array.isArray(sfxUsed) || sfxUsed.length === 0)) {
    warnings.push('sfx_missing');
  }

  if (musicUsed && isTestAudio(musicUsed)) {
    warnings.push('test_audio_used');
  }

  for (const sfx of sfxUsed || []) {
    const file = typeof sfx === 'string' ? sfx : sfx.file;
    if (isTestAudio(file)) {
      warnings.push('test_audio_used');
      break;
    }
  }

  const narrationVolume = Number(audioMix?.narrationVolume || audioPlan?.narrationVolume || 0);
  const musicVolume = Number(audioPlan?.music?.volume || 0);

  if (narrationVolume && narrationVolume > 1.8) {
    warnings.push('narration_volume_too_high');
  }

  if (musicVolume && musicVolume > 0.12) {
    warnings.push('music_volume_too_high');
  }

  const uniqueWarnings = [...new Set(warnings)];

  let readiness = 'ready_for_review';

  if (uniqueWarnings.includes('test_audio_used')) {
    readiness = 'test_audio_only';
  }

  if (uniqueWarnings.includes('narration_only') || uniqueWarnings.includes('music_missing') || uniqueWarnings.includes('sfx_missing')) {
    readiness = readiness === 'test_audio_only' ? 'test_audio_only' : 'needs_audio_review';
  }

  if (uniqueWarnings.includes('audio_missing') || uniqueWarnings.includes('audio_plan_exists_but_no_mix')) {
    readiness = 'blocked_for_public';
  }

  const publicSafe = ![
    'test_audio_used',
    'audio_missing',
    'audio_plan_exists_but_no_mix'
  ].some(w => uniqueWarnings.includes(w));

  return {
    readiness,
    publicSafe,
    warnings: uniqueWarnings,
    mode: audioMix?.mode || 'unknown',
    musicUsed,
    sfxCount: Array.isArray(sfxUsed) ? sfxUsed.length : 0,
    narrationVolume: audioMix?.narrationVolume || audioPlan?.narrationVolume || null
  };
}

function main() {
  const processed = readJson(PROCESSED_FILE, {});
  const review = readJson(REVIEW_FILE, { version: 1, items: {}, audit: [] });

  const results = [];

  for (const [key, record] of Object.entries(processed)) {
    if (!record || record.failedAt) continue;

    const validation = validateAudioRecord(record);

    results.push({
      key,
      name: record.name,
      videoId: record.youtube?.videoId || null,
      uploaded: Boolean(record.uploaded),
      dryRun: Boolean(record.dryRun),
      localVideo: record.localVideo || null,
      validation
    });

    const videoId = record.youtube?.videoId;

    if (videoId && review.items?.[videoId]) {
      review.items[videoId].audioValidation = validation;
      review.items[videoId].updatedAt = new Date().toISOString();
    }
  }

  if (review.items) {
    review.audit = review.audit || [];
    review.audit.push({
      at: new Date().toISOString(),
      action: 'audio_validation',
      videoId: 'all',
      note: `validated=${results.length}`
    });

    writeJson(REVIEW_FILE, review);
  }

  console.log('');
  console.log('UselessApps.fun Audio Validation');
  console.log('================================');
  console.log('');
  console.log(`Validated records: ${results.length}`);
  console.log('');

  for (const item of results.slice(-20)) {
    const v = item.validation;
    console.log(`- ${item.name}`);
    console.log(`  uploaded: ${item.uploaded} | dryRun: ${item.dryRun}`);
    console.log(`  mode: ${v.mode}`);
    console.log(`  readiness: ${v.readiness}`);
    console.log(`  publicSafe: ${v.publicSafe}`);
    console.log(`  music: ${v.musicUsed || 'none'}`);
    console.log(`  sfxCount: ${v.sfxCount}`);
    console.log(`  warnings: ${v.warnings.join(', ') || 'none'}`);
    console.log('');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateAudioRecord,
  isTestAudio
};
