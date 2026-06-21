'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const { google } = require('googleapis');
const { getAudioUrl } = require('google-tts-api');
const uselessBrain = require('./useless-brain');

const { createStoryPackage } = require('../story/story-engine');
const { createMetadataPackage } = require('../metadata/metadata-engine');
const { createQualityPlan } = require('../media/quality-engine');

/**
 * generate-v3.js
 *
 * UselessApps.fun Next-Level Ridiculous Generator
 *
 * This is not a normal app demo generator.
 * This creates fake emergency broadcasts, fake documentaries, fake trials,
 * fake sponsor breaks, fake scientific investigations, and chaotic Shorts
 * around useless apps.
 *
 * Default local render: 720x1280 for Ubuntu safety.
 * Full YouTube render: SHORTS_WIDTH=1080 SHORTS_HEIGHT=1920.
 */

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------

const ROOT_DIR = path.join(__dirname, '..', '..');

const BASE_URL = process.env.BASE_URL || 'https://btcetherkings.github.io/useless-apps-fun/';
const RECORD_BASE_URL = process.env.RECORD_BASE_URL || BASE_URL;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || BASE_URL;
const APPS_JSON = process.env.APPS_JSON || path.join(ROOT_DIR, 'apps.json');

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN || '';

const VIDEO_PRIVACY = process.env.VIDEO_PRIVACY || 'private';
const MAX_PER_RUN = Number(process.env.MAX_PER_RUN || 1);
const DRY_RUN = String(process.env.DRY_RUN || '').toLowerCase() === 'true';
const FORCE = String(process.env.FORCE || '').toLowerCase() === 'true';
const USE_STORY_ENGINE = String(process.env.USE_STORY_ENGINE || 'true').toLowerCase() !== 'false';
const USE_METADATA_ENGINE = String(process.env.USE_METADATA_ENGINE || 'true').toLowerCase() !== 'false';
const USE_QUALITY_ENGINE = String(process.env.USE_QUALITY_ENGINE || 'true').toLowerCase() !== 'false';
const VERBOSE = String(process.env.VERBOSE || '').toLowerCase() === 'true';
const KEEP_TMP = String(process.env.KEEP_TMP || '').toLowerCase() === 'true';

const CHAOS_MODE = String(process.env.CHAOS_MODE || 'true').toLowerCase() !== 'false';
const CHAOS_SFX_VOLUME = Number(process.env.CHAOS_SFX_VOLUME || 0.11);

const BACKGROUND_MUSIC = process.env.BACKGROUND_MUSIC || '';
const USE_SYNTH_MUSIC = String(process.env.USE_SYNTH_MUSIC || 'true').toLowerCase() === 'true';
const MUSIC_VOLUME = Number(process.env.MUSIC_VOLUME || 0.045);
const NARRATION_VOLUME = Number(process.env.NARRATION_VOLUME || 1.25);

const RECORD_WIDTH = Number(process.env.RECORD_WIDTH || 1280);
const RECORD_HEIGHT = Number(process.env.RECORD_HEIGHT || 720);

const SHORTS_WIDTH = Number(process.env.SHORTS_WIDTH || 720);
const SHORTS_HEIGHT = Number(process.env.SHORTS_HEIGHT || 1280);
const VIDEO_FPS = Number(process.env.VIDEO_FPS || 24);

const TMP_DIR = path.join(__dirname, 'tmp-v3');
const OUT_DIR = path.join(ROOT_DIR, 'generated-videos');
const PROCESSED_FILE = path.join(__dirname, 'processed-v3.json');

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// -----------------------------------------------------------------------------
// BASIC HELPERS
// -----------------------------------------------------------------------------

function log(message) {
  console.log(message);
}

function verbose(message) {
  if (VERBOSE) console.log(message);
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`Could not read ${file}: ${err.message}`);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function slugify(input) {
  return String(input || 'useless-app')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'useless-app';
}

function safeText(input, max = 5000) {
  return String(input || '')
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function requireBinary(binary) {
  try {
    execFileSync(binary, ['-version'], { stdio: 'pipe' });
  } catch {
    console.error(`${binary} not found. Install it first: sudo apt install ffmpeg`);
    process.exit(1);
  }
}

function runCommand(binary, args) {
  if (VERBOSE) {
    console.log(`\n${binary} ${args.map(a => `"${a}"`).join(' ')}\n`);
  }

  execFileSync(binary, args, { stdio: 'inherit' });
}

function ffmpeg(args) {
  runCommand('ffmpeg', args);
}

function ffprobeDuration(file) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file
    ], { encoding: 'utf8' });

    return Number(out.trim());
  } catch {
    return 0;
  }
}

function ffprobeStreams(file) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'stream=codec_type',
      '-of', 'json',
      file
    ], { encoding: 'utf8' });

    return JSON.parse(out);
  } catch {
    return { streams: [] };
  }
}

function verifyMediaFile(file, label = 'media', options = {}) {
  const {
    requireAudio = false,
    requireVideo = false,
    minSize = 5000,
    minDuration = 0.8
  } = options;

  if (!file || !fs.existsSync(file)) {
    throw new Error(`${label} does not exist: ${file}`);
  }

  const stat = fs.statSync(file);

  if (stat.size < minSize) {
    throw new Error(`${label} is too small or broken: ${file} (${stat.size} bytes)`);
  }

  const duration = ffprobeDuration(file);

  if (!duration || duration < minDuration) {
    throw new Error(`${label} has invalid duration: ${file} (${duration}s)`);
  }

  const streamData = ffprobeStreams(file);
  const streamTypes = (streamData.streams || []).map(s => s.codec_type);

  if (requireVideo && !streamTypes.includes('video')) {
    throw new Error(`${label} has no video stream: ${file}`);
  }

  if (requireAudio && !streamTypes.includes('audio')) {
    throw new Error(`${label} has no audio stream: ${file}`);
  }

  return duration;
}

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function hasYouTubeSecrets() {
  return Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && YOUTUBE_REFRESH_TOKEN);
}

function buildRecordAppUrl(app) {
  const appFile = app.file || app.url || '';

  if (appFile.startsWith('http://') || appFile.startsWith('https://')) {
    return appFile;
  }

  return new URL(appFile, RECORD_BASE_URL).toString();
}

function buildPublicAppUrl(app) {
  const appFile = app.file || app.url || '';

  if (appFile.startsWith('http://') || appFile.startsWith('https://')) {
    return appFile;
  }

  return new URL(appFile, PUBLIC_BASE_URL).toString();
}

// -----------------------------------------------------------------------------
// TEXT / FFMPEG HELPERS
// -----------------------------------------------------------------------------

function writeDrawTextFile(workDir, filename, text, max = 240) {
  const filePath = path.join(workDir, filename);

  const cleaned = safeText(text, max)
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .trim();

  fs.writeFileSync(filePath, cleaned || 'Useless App', 'utf8');
  return filePath;
}

function escapeTextFilePath(filePath) {
  return filePath
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "'\\''");
}

function safeDrawText(input) {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/%/g, '\\%')
    .replace(/'/g, '')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .slice(0, 220);
}

function drawStatic(text, opts = {}) {
  const {
    color = 'white',
    size = 42,
    x = '(w-text_w)/2',
    y = 100,
    box = true,
    boxColor = 'black@0.64',
    boxBorder = 18,
    enable = ''
  } = opts;

  let out = `drawtext=text='${safeDrawText(text)}':fontcolor=${color}:fontsize=${size}:x=${x}:y=${y}:expansion=none`;

  if (box) {
    out += `:box=1:boxcolor=${boxColor}:boxborderw=${boxBorder}`;
  }

  if (enable) {
    out += `:enable='${enable}'`;
  }

  return out;
}

function drawTextFile(filePath, opts = {}) {
  const {
    color = 'white',
    size = 42,
    x = '(w-text_w)/2',
    y = 100,
    box = true,
    boxColor = 'black@0.64',
    boxBorder = 18,
    enable = ''
  } = opts;

  let out = `drawtext=textfile='${escapeTextFilePath(filePath)}':fontcolor=${color}:fontsize=${size}:x=${x}:y=${y}:expansion=none`;

  if (box) {
    out += `:box=1:boxcolor=${boxColor}:boxborderw=${boxBorder}`;
  }

  if (enable) {
    out += `:enable='${enable}'`;
  }

  return out;
}

function fontScale(n) {
  return Math.round(SHORTS_WIDTH * n);
}

// -----------------------------------------------------------------------------
// BRAIN BRIDGES
// -----------------------------------------------------------------------------

function buildNarration(app) {
  const p = getProfile(app);
  const base = uselessBrain.buildNarration(app);

  const extra = [
    'Emergency producers have confirmed that the following footage may contain trace amounts of productivity, but only by accident.',
    `The app is now being monitored by the Department of Bad Ideas under case number ${getCertificate(app).certificateId}.`,
    `Official app thought detected: ${p.sentienceThought || 'I refuse to explain myself.'}`,
    'A panel of imaginary experts has advised viewers to remain seated, hydrated, and unimpressed.'
  ].join(' ');

  return `${base} ${extra}`;
}

function buildTitle(app) {
  return uselessBrain.buildTitle(app);
}

function buildDescription(app, appUrl) {
  return uselessBrain.buildDescription(app, appUrl);
}

function getProfile(app) {
  if (typeof uselessBrain.getAbsurdProfile === 'function') {
    return uselessBrain.getAbsurdProfile(app);
  }

  return {
    name: safeText(app.name, 90),
    uselessness: Number(app.uselessness || 99),
    grade: 'S (Sublimely Useless)',
    category: app.fakeCategory || 'Pointless Internet Technology',
    dangerLevel: 'Productivity negative',
    warning: 'No useful features were harmed.',
    award: 'Winner of the Golden Nothing Award',
    stat: 'Nothing continued to happen.',
    review: '"Five stars. I still do not know why."',
    sentiencePercent: 0,
    sentienceStatus: 'inert',
    sentienceThought: '"Why am I like this?"'
  };
}

function getSceneLines(app) {
  const p = getProfile(app);

  const fallback = {
    topBrand: 'UselessApps.fun',
    topTitle: p.name,
    lowerLine1: `${p.uselessness}% useless - ${p.grade || 'grade S'}`,
    lowerLine2: p.dangerLevel || 'Load-bearing nonsense',
    lowerLine3: 'Common sense left the chat',
    introTitle: p.name,
    introSubtitle: 'A fake documentary about pointless software',
    outroLine1: 'SUBMIT YOUR BAD IDEA',
    outroLine2: 'No purpose. Maximum joy.',
    ticker: `${p.name} STILL USELESS • EXPERTS BAFFLED • NOTHING CONTINUES TO HAPPEN • `,
    expertQuote: 'It should not work. It does not work. And yet here we are.'
  };

  if (typeof uselessBrain.buildOnScreenLines === 'function') {
    return { ...fallback, ...uselessBrain.buildOnScreenLines(app) };
  }

  return fallback;
}

function getCertificate(app) {
  if (typeof uselessBrain.certifyUselessness === 'function') {
    return uselessBrain.certifyUselessness(app);
  }

  const p = getProfile(app);

  return {
    certificateId: 'DBI-000000',
    issuedBy: 'The Department of Bad Ideas',
    appName: p.name,
    finding: `Hereby certified ${p.uselessness}% useless.`,
    validity: 'Valid forever, probably.',
    signature: 'Dr. Nobody',
    disclaimer: 'This certificate certifies nothing.'
  };
}

function getExperts(app) {
  if (typeof uselessBrain.summonExpertPanel === 'function') {
    return uselessBrain.summonExpertPanel(app, 3);
  }

  return [
    {
      name: 'Dr. Nobody',
      title: 'Head of Applied Pointlessness',
      institution: 'Department of Bad Ideas',
      quote: 'It should not work. It does not work. And yet here we are.'
    }
  ];
}

// -----------------------------------------------------------------------------
// AUDIO
// -----------------------------------------------------------------------------

async function downloadFile(url, outputPath, redirectDepth = 0) {
  if (redirectDepth > 5) {
    throw new Error('Too many redirects while downloading file');
  }

  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    const request = https.get(url, response => {
      const status = response.statusCode || 0;

      if (status >= 300 && status < 400 && response.headers.location) {
        file.close();
        fs.rmSync(outputPath, { force: true });

        const redirectUrl = response.headers.location.startsWith('http')
          ? response.headers.location
          : new URL(response.headers.location, url).toString();

        return downloadFile(redirectUrl, outputPath, redirectDepth + 1)
          .then(resolve)
          .catch(reject);
      }

      if (status !== 200) {
        file.close();
        fs.rmSync(outputPath, { force: true });
        return reject(new Error(`Download failed with HTTP ${status}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close(resolve);
      });
    });

    request.setTimeout(30000, () => {
      request.destroy(new Error('Download timed out'));
    });

    request.on('error', err => {
      file.close();
      fs.rmSync(outputPath, { force: true });
      reject(err);
    });
  });
}

function createSilence(outputPath, seconds = 16) {
  ffmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=stereo',
    '-t', String(seconds),
    '-q:a', '9',
    '-acodec', 'libmp3lame',
    outputPath
  ]);

  verifyMediaFile(outputPath, 'silence narration', {
    requireAudio: true,
    minDuration: 1,
    minSize: 500
  });
}

function splitTextForTts(input, maxLen = 175) {
  const sentences = String(input || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);

      if (sentence.length <= maxLen) {
        current = sentence;
      } else {
        for (let i = 0; i < sentence.length; i += maxLen) {
          chunks.push(sentence.slice(i, i + maxLen));
        }
        current = '';
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : ['This app is useless. Perfect.'];
}

async function generateNarration(app, slug, workDir) {
  const text = buildNarration(app);
  const mp3Path = path.join(workDir, `${slug}-narration.mp3`);

  try {
    const chunks = splitTextForTts(text, 175);
    const partFiles = [];

    for (let i = 0; i < chunks.length; i++) {
      const partPath = path.join(workDir, `${slug}-narration-part-${i}.mp3`);

      const url = getAudioUrl(chunks[i], {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com'
      });

      await downloadFile(url, partPath);

      verifyMediaFile(partPath, `narration part ${i}`, {
        requireAudio: true,
        minSize: 500,
        minDuration: 0.35
      });

      partFiles.push(partPath);
    }

    if (partFiles.length === 1) {
      fs.copyFileSync(partFiles[0], mp3Path);
    } else {
      const listFile = path.join(workDir, `${slug}-narration-list.txt`);

      fs.writeFileSync(
        listFile,
        partFiles.map(file => `file '${file.replace(/'/g, "'\\''")}'`).join('\n')
      );

      ffmpeg([
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', listFile,
        '-c:a', 'libmp3lame',
        '-q:a', '4',
        mp3Path
      ]);
    }

    const duration = verifyMediaFile(mp3Path, 'narration', {
      requireAudio: true,
      minSize: 1000,
      minDuration: 1
    });

    return {
      path: mp3Path,
      text,
      duration,
      synthetic: false,
      chunks: chunks.length
    };
  } catch (err) {
    console.warn(`TTS failed for "${app.name}": ${err.message}`);
    console.warn('Using generated silence instead.');

    createSilence(mp3Path, 18);

    return {
      path: mp3Path,
      text,
      duration: ffprobeDuration(mp3Path),
      synthetic: true,
      warning: err.message
    };
  }
}

function createSynthMusic(outputPath, seconds = 24) {
  ffmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', `sine=frequency=110:sample_rate=44100:duration=${seconds}`,
    '-f', 'lavfi',
    '-i', `sine=frequency=220:sample_rate=44100:duration=${seconds}`,
    '-filter_complex',
    `[0:a]volume=${MUSIC_VOLUME}[a0];[1:a]volume=${MUSIC_VOLUME * 0.45}[a1];[a0][a1]amix=inputs=2:duration=shortest[a]`,
    '-map', '[a]',
    '-ac', '2',
    '-c:a', 'aac',
    outputPath
  ]);

  verifyMediaFile(outputPath, 'synthetic background music', {
    requireAudio: true,
    minDuration: 1,
    minSize: 500
  });
}

function createChaosSfx(outputPath, seconds = 24) {
  const duration = Math.max(8, Math.ceil(seconds));

  ffmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', `sine=frequency=880:sample_rate=44100:duration=${duration}`,
    '-f', 'lavfi',
    '-i', `sine=frequency=1320:sample_rate=44100:duration=${duration}`,
    '-f', 'lavfi',
    '-i', `anoisesrc=color=pink:duration=${duration}:amplitude=0.018`,
    '-filter_complex',
    [
      `[0:a]volume=${CHAOS_SFX_VOLUME},aecho=0.6:0.45:180:0.20[s1]`,
      `[1:a]volume=${CHAOS_SFX_VOLUME * 0.45},atrim=0:${duration}[s2]`,
      `[2:a]volume=${CHAOS_SFX_VOLUME * 0.30}[n]`,
      `[s1][s2][n]amix=inputs=3:duration=shortest[a]`
    ].join(';'),
    '-map', '[a]',
    '-ac', '2',
    '-c:a', 'aac',
    outputPath
  ]);

  verifyMediaFile(outputPath, 'chaos sound effects', {
    requireAudio: true,
    minDuration: 1,
    minSize: 500
  });
}

// -----------------------------------------------------------------------------
// PLAYWRIGHT RECORDING
// -----------------------------------------------------------------------------

function defaultActionScript(app) {
  const name = String(app.name || '').toLowerCase();

  if (name.includes('runaway')) {
    return {
      plan: 'runaway',
      steps: [
        { type: 'move', args: [640, 360], captionHint: 'TARGET ACQUIRED' },
        { type: 'move', args: [620, 330], captionHint: 'BUTTON PANICS' },
        { type: 'click', args: [640, 360], captionHint: 'CLICK FAILURE' },
        { type: 'move', args: [300, 220], captionHint: 'CURSOR IN PURSUIT' },
        { type: 'move', args: [1000, 520], captionHint: 'BUTTON ESCAPES' },
        { type: 'click', args: [980, 400], captionHint: 'SEND BACKUP' }
      ]
    };
  }

  if (name.includes('todo') || name.includes('to-do')) {
    return {
      plan: 'todo',
      steps: [
        { type: 'click', args: [520, 240], captionHint: 'TASK CREATED' },
        { type: 'type', args: ['Become productive'], captionHint: 'HOPE DETECTED' },
        { type: 'key', args: ['Enter'], captionHint: 'HOPE SUBMITTED' },
        { type: 'click', args: [640, 360], captionHint: 'TASK DELETED' },
        { type: 'type', args: ['Regret everything'], captionHint: 'REGRET LOGGED' },
        { type: 'key', args: ['Enter'], captionHint: 'PRODUCTIVITY CANCELLED' }
      ]
    };
  }

  if (name.includes('calculator')) {
    return {
      plan: 'calculator',
      steps: [
        { type: 'click', args: [500, 400], captionHint: 'MATH REQUEST DETECTED' },
        { type: 'type', args: ['2+2'], captionHint: 'NUMBERS ENTERED' },
        { type: 'key', args: ['Enter'], captionHint: 'ANSWER REFUSED' },
        { type: 'click', args: [650, 420], captionHint: 'MATH PANICS' },
        { type: 'type', args: ['999/3'], captionHint: 'CALCULATOR JUDGES YOU' },
        { type: 'key', args: ['Enter'], captionHint: 'MATH LEFT THE CHAT' }
      ]
    };
  }

  if (name.includes('spinner') || name.includes('loading')) {
    return {
      plan: 'spinner',
      steps: [
        { type: 'wait', args: [1000], captionHint: 'LOADING' },
        { type: 'wait', args: [1000], captionHint: 'STILL LOADING' },
        { type: 'wait', args: [1000], captionHint: 'TIME IS FAKE' },
        { type: 'click', args: [640, 360], captionHint: 'NO PROGRESS FOUND' },
        { type: 'wait', args: [1000], captionHint: 'FOREVER CONTINUES' }
      ]
    };
  }

  if (name.includes('rock')) {
    return {
      plan: 'rock',
      steps: [
        { type: 'move', args: [640, 360], captionHint: 'MINERAL DETECTED' },
        { type: 'wait', args: [1300], captionHint: 'ROCK IS STARING' },
        { type: 'click', args: [640, 360], captionHint: 'ROCK UNIMPRESSED' },
        { type: 'wait', args: [1300], captionHint: 'EYE CONTACT CONTINUES' },
        { type: 'wait', args: [1300], captionHint: 'ROCK WINS AGAIN' }
      ]
    };
  }

  return {
    plan: 'default',
    steps: [
      { type: 'move', args: [640, 360], captionHint: 'USELESSNESS DETECTED' },
      { type: 'click', args: [640, 360], captionHint: 'NO PURPOSE FOUND' },
      { type: 'wheel', args: [0, 350], captionHint: 'SYSTEM CONFUSED' },
      { type: 'move', args: [300, 300], captionHint: 'FEATURES QUESTIONABLE' },
      { type: 'click', args: [980, 400], captionHint: 'NOTHING ACHIEVED' }
    ]
  };
}

async function performActionStep(page, step) {
  if (!step || !step.type) return;

  if (step.type === 'move') {
    const [x, y] = step.args || [RECORD_WIDTH / 2, RECORD_HEIGHT / 2];
    await page.mouse.move(x, y, { steps: 30 });
    return;
  }

  if (step.type === 'click') {
    const [x, y] = step.args || [RECORD_WIDTH / 2, RECORD_HEIGHT / 2];
    await page.mouse.click(x, y);
    return;
  }

  if (step.type === 'wheel') {
    const [dx, dy] = step.args || [0, 300];
    await page.mouse.wheel(dx, dy);
    return;
  }

  if (step.type === 'key') {
    const [key] = step.args || ['Enter'];
    await page.keyboard.press(key);
    return;
  }

  if (step.type === 'type') {
    const [text] = step.args || ['This is not a task. This is a cry for help.'];
    await page.keyboard.type(text, { delay: 35 });
    return;
  }

  if (step.type === 'wait') {
    const [ms] = step.args || [1000];
    await page.waitForTimeout(ms);
    return;
  }
}

async function recordApp(app, slug, workDir) {
  const recordUrl = buildRecordAppUrl(app);
  const appUrl = buildPublicAppUrl(app);

  const storyPackage = USE_STORY_ENGINE
    ? createStoryPackage(app)
    : null;

  const metadataPackage = USE_METADATA_ENGINE
    ? createMetadataPackage(app, storyPackage || {}, appUrl)
    : null;

  const qualityPlan = USE_QUALITY_ENGINE
    ? createQualityPlan({
        qualityMode: process.env.QUALITY_MODE || 'preview',
        renderTarget: process.env.RENDER_TARGET || 'shorts'
      })
    : null;
  const videoDir = path.join(workDir, `${slug}-recording`);

  ensureCleanDir(videoDir);

  log(`Opening for recording: ${recordUrl}`);
  log(`Public app URL: ${appUrl}`);

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: {
      width: RECORD_WIDTH,
      height: RECORD_HEIGHT
    },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: videoDir,
      size: {
        width: RECORD_WIDTH,
        height: RECORD_HEIGHT
      }
    }
  });

  const page = await context.newPage();

  try {
    const isLocalRecordingUrl =
      recordUrl.startsWith('http://127.0.0.1') ||
      recordUrl.startsWith('http://localhost') ||
      recordUrl.startsWith('file:');

    try {
      await page.goto(recordUrl, {
        waitUntil: isLocalRecordingUrl ? 'domcontentloaded' : 'networkidle',
        timeout: isLocalRecordingUrl ? 15000 : 60000
      });
    } catch (err) {
      console.warn(`Initial page load wait failed, retrying with simple load: ${err.message}`);

      await page.goto(recordUrl, {
        waitUntil: 'load',
        timeout: isLocalRecordingUrl ? 15000 : 30000
      });
    }

    await page.waitForTimeout(900);

    await page.addStyleTag({
      content: uselessBrain.buildRecordingOverlayCss
        ? uselessBrain.buildRecordingOverlayCss()
        : `
          .ua-rec-overlay {
            position: fixed;
            z-index: 2147483647;
            left: 18px;
            top: 18px;
            width: 380px;
            padding: 14px;
            border-radius: 18px;
            font-family: monospace;
            color: #fff;
            background: rgba(0,0,0,0.82);
            border: 2px solid rgba(255,47,167,0.45);
            pointer-events: none;
          }
        `
    });

    const overlayHtml = uselessBrain.buildFakeDashboardHtml
      ? uselessBrain.buildFakeDashboardHtml(app)
      : `<div><strong>LIVE USELESSNESS REPORT</strong><br>${safeText(app.name, 80)}</div>`;

    await page.evaluate(html => {
      const existing = document.querySelector('.ua-rec-overlay');
      if (existing) existing.remove();

      const top = document.createElement('div');
      top.className = 'ua-rec-overlay';
      top.innerHTML = html;

      document.body.appendChild(top);
    }, overlayHtml);

    const script = uselessBrain.getAppSpecificActionScript
      ? uselessBrain.getAppSpecificActionScript(app)
      : defaultActionScript(app);

    const steps = script && Array.isArray(script.steps) && script.steps.length
      ? script.steps
      : defaultActionScript(app).steps;

    for (let i = 0; i < Math.min(12, steps.length * 2); i++) {
      const step = steps[i % steps.length];

      try {
        await performActionStep(page, step);
      } catch (err) {
        verbose(`Interaction ignored: ${err.message}`);
      }

      await page.waitForTimeout(420);
    }

    await page.waitForTimeout(950);
  } finally {
    await context.close();
    await browser.close();
  }

  const webms = fs.readdirSync(videoDir)
    .filter(file => file.endsWith('.webm'))
    .map(file => path.join(videoDir, file));

  if (webms.length === 0) {
    throw new Error(`No Playwright video file found for ${app.name}`);
  }

  const videoPath = webms
    .map(file => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].file;

  const stablePath = path.join(workDir, `${slug}-raw.webm`);
  fs.copyFileSync(videoPath, stablePath);

  verifyMediaFile(stablePath, 'raw recording', {
    requireVideo: true,
    minDuration: 3
  });

  return {
    videoPath: stablePath,
    appUrl
  };
}

// -----------------------------------------------------------------------------
// VIDEO SCENES
// -----------------------------------------------------------------------------

function createSceneCard({ output, duration = 2.2, background = 'black', lines = [] }) {
  const filters = [
    `drawbox=x=0:y=0:w=iw:h=ih:color=${background}@0.18:t=fill`
  ];

  for (const line of lines) {
    if (line.textFile) {
      filters.push(drawTextFile(line.textFile, line));
    } else {
      filters.push(drawStatic(line.text || '', line));
    }
  }

  ffmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=black:s=${SHORTS_WIDTH}x${SHORTS_HEIGHT}:d=${duration}`,
    '-vf', filters.join(','),
    '-r', String(VIDEO_FPS),
    '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    output
  ]);

  verifyMediaFile(output, 'scene card', {
    requireVideo: true,
    minDuration: 1,
    minSize: 3000
  });

  return output;
}

function createIntro(slug, app, workDir) {
  const p = getProfile(app);
  const lines = getSceneLines(app);
  const output = path.join(workDir, `${slug}-01-breaking-news.mp4`);

  const appFile = writeDrawTextFile(workDir, `${slug}-intro-app.txt`, lines.introTitle || p.name, 180);
  const subtitleFile = writeDrawTextFile(workDir, `${slug}-intro-subtitle.txt`, lines.introSubtitle || 'A public warning from the internet', 180);

  return createSceneCard({
    output,
    duration: 2.35,
    background: 'red',
    lines: [
      {
        text: 'BREAKING USELESS NEWS',
        color: 'yellow',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.24),
        boxColor: 'red@0.72',
        boxBorder: 22
      },
      {
        text: 'THE INTERNET HAS BECOME TOO USEFUL',
        color: 'white',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.34),
        boxColor: 'black@0.74',
        boxBorder: 16
      },
      {
        textFile: appFile,
        color: 'white',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.47),
        boxColor: 'black@0.82',
        boxBorder: 20
      },
      {
        textFile: subtitleFile,
        color: 'yellow',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.58),
        boxColor: 'black@0.65',
        boxBorder: 15
      },
      {
        text: 'THIS IS NOT A DRILL. IT IS WORSE.',
        color: 'red',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.70),
        box: false
      }
    ]
  });
}

function createEmergencySirensCard(slug, app, workDir) {
  const p = getProfile(app);
  const output = path.join(workDir, `${slug}-02-sirens.mp4`);

  const thoughtFile = writeDrawTextFile(workDir, `${slug}-thought.txt`, p.sentienceThought || '"I refuse."', 180);

  return createSceneCard({
    output,
    duration: 1.8,
    background: 'red',
    lines: [
      {
        text: 'EMERGENCY MEETING CALLED',
        color: 'white',
        size: fontScale(0.047),
        y: Math.round(SHORTS_HEIGHT * 0.28),
        boxColor: 'red@0.75',
        boxBorder: 22
      },
      {
        text: `APP SENTIENCE: ${p.sentiencePercent || 0}%`,
        color: 'yellow',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.43),
        boxColor: 'black@0.74',
        boxBorder: 18
      },
      {
        text: 'LAST KNOWN APP THOUGHT:',
        color: 'white',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.56),
        box: false
      },
      {
        textFile: thoughtFile,
        color: 'yellow',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.64),
        boxColor: 'black@0.70',
        boxBorder: 16
      }
    ]
  });
}

function createInvestigationCard(slug, app, workDir) {
  const p = getProfile(app);
  const output = path.join(workDir, `${slug}-03-investigation.mp4`);

  const categoryFile = writeDrawTextFile(workDir, `${slug}-category.txt`, p.category, 180);
  const statFile = writeDrawTextFile(workDir, `${slug}-stat.txt`, p.stat, 220);
  const warningFile = writeDrawTextFile(workDir, `${slug}-warning.txt`, p.warning, 220);

  return createSceneCard({
    output,
    duration: 2.8,
    background: 'blue',
    lines: [
      {
        text: 'OFFICIAL USELESSNESS INVESTIGATION',
        color: 'yellow',
        size: fontScale(0.036),
        y: Math.round(SHORTS_HEIGHT * 0.18),
        boxColor: 'black@0.76',
        boxBorder: 18
      },
      {
        text: `USELESSNESS SCORE: ${p.uselessness}%`,
        color: 'red',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.32),
        boxColor: 'white@0.90',
        boxBorder: 21
      },
      {
        textFile: categoryFile,
        color: 'white',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.47),
        boxColor: 'black@0.67',
        boxBorder: 15
      },
      {
        textFile: statFile,
        color: 'yellow',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.59),
        boxColor: 'black@0.67',
        boxBorder: 15
      },
      {
        textFile: warningFile,
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.73),
        boxColor: 'red@0.56',
        boxBorder: 15
      }
    ]
  });
}

function createCourtroomCard(slug, app, workDir) {
  const output = path.join(workDir, `${slug}-05-courtroom.mp4`);
  const p = getProfile(app);
  const experts = getExperts(app);
  const quote = experts[0] ? experts[0].quote : 'My peer review consisted entirely of sighing.';
  const quoteFile = writeDrawTextFile(workDir, `${slug}-expert-quote.txt`, quote, 220);
  const expertFile = writeDrawTextFile(workDir, `${slug}-expert-name.txt`, experts[0] ? `${experts[0].title} ${experts[0].name}` : 'Dr. Nobody', 200);

  return createSceneCard({
    output,
    duration: 2.8,
    background: 'purple',
    lines: [
      {
        text: 'THE APP HAS BEEN SUMMONED TO COURT',
        color: 'yellow',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.18),
        boxColor: 'black@0.76',
        boxBorder: 18
      },
      {
        text: 'CHARGE: AGGRAVATED POINTLESSNESS',
        color: 'red',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.33),
        boxColor: 'white@0.88',
        boxBorder: 18
      },
      {
        textFile: expertFile,
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.49),
        boxColor: 'black@0.66',
        boxBorder: 14
      },
      {
        textFile: quoteFile,
        color: 'yellow',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.62),
        boxColor: 'black@0.66',
        boxBorder: 16
      },
      {
        text: `VERDICT: ${p.grade || 'S (Sublimely Useless)'}`,
        color: 'white',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.79),
        boxColor: 'red@0.57',
        boxBorder: 16
      }
    ]
  });
}

function createFakeSponsorCard(slug, app, workDir) {
  const output = path.join(workDir, `${slug}-06-fake-sponsor.mp4`);

  const sponsors = [
    'Sponsored by AirNothing: premium oxygen for imaginary emergencies.',
    'Sponsored by RegretOS: the operating system for bad decisions.',
    'Sponsored by Loading Plus: wait forever, professionally.',
    'Sponsored by Button Insurance: protection against clickable disappointment.',
    'Sponsored by CloudConfusion: enterprise nonsense at startup prices.'
  ];

  const sponsorFile = writeDrawTextFile(workDir, `${slug}-sponsor.txt`, randomItem(sponsors), 220);

  return createSceneCard({
    output,
    duration: 2.2,
    background: 'green',
    lines: [
      {
        text: 'A WORD FROM OUR FAKE SPONSOR',
        color: 'black',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.26),
        boxColor: 'yellow@0.92',
        boxBorder: 20
      },
      {
        textFile: sponsorFile,
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.45),
        boxColor: 'black@0.70',
        boxBorder: 18
      },
      {
        text: 'No money was exchanged. No value was created.',
        color: 'yellow',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.68),
        boxColor: 'black@0.65',
        boxBorder: 15
      }
    ]
  });
}

function createCertificateCard(slug, app, workDir) {
  const p = getProfile(app);
  const cert = getCertificate(app);
  const output = path.join(workDir, `${slug}-07-certificate.mp4`);

  const findingFile = writeDrawTextFile(workDir, `${slug}-finding.txt`, cert.finding, 220);
  const reviewFile = writeDrawTextFile(workDir, `${slug}-review.txt`, p.review, 220);
  const signatureFile = writeDrawTextFile(workDir, `${slug}-signature.txt`, `Signed: ${cert.signature}`, 180);

  return createSceneCard({
    output,
    duration: 2.8,
    background: 'purple',
    lines: [
      {
        text: 'CERTIFICATE OF ABSOLUTE POINTLESSNESS',
        color: 'yellow',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.18),
        boxColor: 'black@0.76',
        boxBorder: 18
      },
      {
        text: cert.certificateId,
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.32),
        boxColor: 'red@0.56',
        boxBorder: 18
      },
      {
        textFile: findingFile,
        color: 'white',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.46),
        boxColor: 'black@0.67',
        boxBorder: 16
      },
      {
        textFile: reviewFile,
        color: 'yellow',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.61),
        boxColor: 'black@0.67',
        boxBorder: 16
      },
      {
        textFile: signatureFile,
        color: 'white',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.77),
        boxColor: 'black@0.58',
        boxBorder: 14
      }
    ]
  });
}

function createOutro(slug, app, workDir) {
  const lines = getSceneLines(app);
  const output = path.join(workDir, `${slug}-08-outro.mp4`);

  const line1File = writeDrawTextFile(workDir, `${slug}-outro-line1.txt`, lines.outroLine1 || 'SUBMIT YOUR BAD IDEA', 180);
  const line2File = writeDrawTextFile(workDir, `${slug}-outro-line2.txt`, lines.outroLine2 || 'No purpose. Maximum joy.', 180);

  return createSceneCard({
    output,
    duration: 2.5,
    background: 'purple',
    lines: [
      {
        text: 'THE APP REMAINS USELESS',
        color: 'yellow',
        size: fontScale(0.036),
        y: Math.round(SHORTS_HEIGHT * 0.28),
        boxColor: 'black@0.74',
        boxBorder: 21
      },
      {
        text: 'No problems were solved.',
        color: 'white',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.41),
        box: false
      },
      {
        text: 'No value was created.',
        color: 'white',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.48),
        box: false
      },
      {
        text: 'Mission accomplished.',
        color: 'red',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.58),
        box: false
      },
      {
        textFile: line1File,
        color: 'white',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.72),
        boxColor: 'black@0.64',
        boxBorder: 16
      },
      {
        textFile: line2File,
        color: 'yellow',
        size: fontScale(0.027),
        y: Math.round(SHORTS_HEIGHT * 0.80),
        boxColor: 'black@0.64',
        boxBorder: 16
      }
    ]
  });
}

// -----------------------------------------------------------------------------
// APP EVIDENCE CLIP
// -----------------------------------------------------------------------------

function getChaosCaptions(app) {
  const script = uselessBrain.getAppSpecificActionScript
    ? uselessBrain.getAppSpecificActionScript(app)
    : defaultActionScript(app);

  const fromScript = script.steps
    .map(s => s.captionHint)
    .filter(Boolean);

  if (fromScript.length >= 4) return fromScript;

  return [
    'USELESSNESS DETECTED',
    'NO PURPOSE FOUND',
    'SYSTEM CONFUSED',
    'COMMON SENSE UNAVAILABLE',
    'FEATURES QUESTIONABLE',
    'ABSOLUTELY NOTHING ACHIEVED'
  ];
}

function makeEvidenceClip(input, output, app, workDir) {
  const lines = getSceneLines(app);
  const p = getProfile(app);

  const titleFile = writeDrawTextFile(workDir, `${path.basename(output)}-title.txt`, lines.topTitle || p.name, 180);
  const tickerFile = writeDrawTextFile(workDir, `${path.basename(output)}-ticker.txt`, lines.ticker || 'BREAKING: NOTHING CONTINUES TO HAPPEN', 1000);
  const lower1File = writeDrawTextFile(workDir, `${path.basename(output)}-lower1.txt`, lines.lowerLine1, 180);
  const lower2File = writeDrawTextFile(workDir, `${path.basename(output)}-lower2.txt`, lines.lowerLine2, 180);
  const lower3File = writeDrawTextFile(workDir, `${path.basename(output)}-lower3.txt`, lines.lowerLine3, 180);

  const captions = getChaosCaptions(app);
  const captionFiles = captions.slice(0, 6).map((caption, index) => {
    return writeDrawTextFile(workDir, `${path.basename(output)}-caption-${index}.txt`, caption, 180);
  });

  while (captionFiles.length < 6) {
    captionFiles.push(writeDrawTextFile(workDir, `${path.basename(output)}-caption-extra-${captionFiles.length}.txt`, 'NOTHING ACHIEVED', 180));
  }

  const appY = Math.round(SHORTS_HEIGHT * 0.32);
  const appMaxWidth = SHORTS_WIDTH - 50;

  const filter = [
    `color=c=0x090014:s=${SHORTS_WIDTH}x${SHORTS_HEIGHT}:d=30[base]`,
    `[0:v]scale=${appMaxWidth}:-2:force_original_aspect_ratio=decrease,fps=${VIDEO_FPS},setsar=1[fg]`,
    `[base][fg]overlay=(W-w)/2:${appY},` +

      `drawbox=x=0:y=0:w=iw:h=${Math.round(SHORTS_HEIGHT * 0.085)}:color=red@0.80:t=fill,` +
      drawStatic('LIVE USELESSNESS EVIDENCE', {
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.025),
        box: false
      }) + ',' +

      drawStatic('UselessApps.fun', {
        color: 'white',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.105),
        boxColor: 'black@0.64',
        boxBorder: 16
      }) + ',' +

      drawTextFile(titleFile, {
        color: 'yellow',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.165),
        boxColor: 'black@0.64',
        boxBorder: 14
      }) + ',' +

      drawStatic('EXHIBIT A: THE APP', {
        color: 'red',
        size: fontScale(0.023),
        x: 24,
        y: Math.round(SHORTS_HEIGHT * 0.245),
        boxColor: 'black@0.74',
        boxBorder: 12
      }) + ',' +

      drawStatic(`USELESS ${p.uselessness || 99}%`, {
        color: 'yellow',
        size: fontScale(0.023),
        x: SHORTS_WIDTH - Math.round(SHORTS_WIDTH * 0.34),
        y: Math.round(SHORTS_HEIGHT * 0.245),
        boxColor: 'black@0.74',
        boxBorder: 12
      }) + ',' +

      drawTextFile(captionFiles[0], {
        color: 'yellow',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'red@0.70',
        boxBorder: 18,
        enable: 'between(t\\,0.6\\,2.3)'
      }) + ',' +

      drawTextFile(captionFiles[1], {
        color: 'white',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'black@0.76',
        boxBorder: 18,
        enable: 'between(t\\,2.4\\,4.4)'
      }) + ',' +

      drawTextFile(captionFiles[2], {
        color: 'yellow',
        size: fontScale(0.040),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'purple@0.72',
        boxBorder: 18,
        enable: 'between(t\\,4.5\\,6.5)'
      }) + ',' +

      drawTextFile(captionFiles[3], {
        color: 'red',
        size: fontScale(0.036),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'white@0.90',
        boxBorder: 18,
        enable: 'between(t\\,6.6\\,8.6)'
      }) + ',' +

      drawTextFile(captionFiles[4], {
        color: 'white',
        size: fontScale(0.025),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'red@0.78',
        boxBorder: 18,
        enable: 'between(t\\,8.7\\,10.7)'
      }) + ',' +

      drawTextFile(captionFiles[5], {
        color: 'yellow',
        size: fontScale(0.036),
        y: Math.round(SHORTS_HEIGHT * 0.705),
        boxColor: 'black@0.84',
        boxBorder: 18,
        enable: 'between(t\\,10.8\\,14.0)'
      }) + ',' +

      drawTextFile(lower1File, {
        color: 'yellow',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.765),
        boxColor: 'black@0.67',
        boxBorder: 14,
        enable: 'between(t\\,0\\,5)'
      }) + ',' +

      drawTextFile(lower2File, {
        color: 'white',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.765),
        boxColor: 'black@0.67',
        boxBorder: 14,
        enable: 'between(t\\,5.1\\,10)'
      }) + ',' +

      drawTextFile(lower3File, {
        color: 'yellow',
        size: fontScale(0.023),
        y: Math.round(SHORTS_HEIGHT * 0.765),
        boxColor: 'purple@0.67',
        boxBorder: 14,
        enable: 'between(t\\,10.1\\,30)'
      }) + ',' +

      drawStatic('This app is performing exactly as badly as designed.', {
        color: 'white',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.835),
        boxColor: 'black@0.67',
        boxBorder: 14
      }) + ',' +

      drawStatic('Comment a worse idea. We might build it.', {
        color: 'yellow',
        size: fontScale(0.024),
        y: Math.round(SHORTS_HEIGHT * 0.835),
        boxColor: 'black@0.67',
        boxBorder: 14
      }) + ',' +

      `drawbox=x=0:y=${Math.round(SHORTS_HEIGHT * 0.910)}:w=iw:h=${Math.round(SHORTS_HEIGHT * 0.035)}:color=yellow@0.94:t=fill,` +
      drawTextFile(tickerFile, {
        color: 'black',
        size: fontScale(0.023),
        x: `w-mod(t*160\\,w+text_w)`,
        y: Math.round(SHORTS_HEIGHT * 0.925),
        box: false
      }) + ',' +

      `drawbox=x=10:y=10:w=${SHORTS_WIDTH - 20}:h=${SHORTS_HEIGHT - 20}:color=red@0.13:t=12:enable='between(t\\,3.0\\,3.16)+between(t\\,7.0\\,7.16)+between(t\\,11.0\\,11.16)',` +

      `fps=${VIDEO_FPS},setsar=1[v]`
  ].join(';');

  ffmpeg([
    '-y',
    '-i', input,
    '-filter_complex', filter,
    '-map', '[v]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    output
  ]);

  verifyMediaFile(output, 'evidence clip', {
    requireVideo: true,
    minDuration: 3,
    minSize: 5000
  });

  return output;
}

// -----------------------------------------------------------------------------
// STITCHING
// -----------------------------------------------------------------------------

function concatClips(clips, output, workDir) {
  const listFile = path.join(workDir, `concat-${Date.now()}.txt`);

  fs.writeFileSync(
    listFile,
    clips.map(file => `file '${file.replace(/'/g, "'\\''")}'`).join('\n')
  );

  ffmpeg([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    output
  ]);

  fs.rmSync(listFile, { force: true });

  verifyMediaFile(output, 'concatenated video', {
    requireVideo: true,
    minDuration: 5
  });

  return output;
}

function stitchFinalVideo({ rawVideoPath, narrationPath, slug, app, workDir }) {
  const intro = createIntro(slug, app, workDir);
  const sirens = createEmergencySirensCard(slug, app, workDir);
  const investigation = createInvestigationCard(slug, app, workDir);
  const evidence = path.join(workDir, `${slug}-04-evidence.mp4`);
  const courtroom = createCourtroomCard(slug, app, workDir);
  const sponsor = createFakeSponsorCard(slug, app, workDir);
  const certificate = createCertificateCard(slug, app, workDir);
  const outro = createOutro(slug, app, workDir);

  makeEvidenceClip(rawVideoPath, evidence, app, workDir);

  const silentCombined = path.join(workDir, `${slug}-silent-combined.mp4`);
  const finalOutput = path.join(OUT_DIR, `${slug}-v3.mp4`);

  concatClips([
    intro,
    sirens,
    investigation,
    evidence,
    courtroom,
    sponsor,
    certificate,
    outro
  ], silentCombined, workDir);

  const silentDuration = verifyMediaFile(silentCombined, 'silent combined video', {
    requireVideo: true,
    minDuration: 5
  });

  let musicPath = BACKGROUND_MUSIC;

  if (!musicPath && USE_SYNTH_MUSIC) {
    musicPath = path.join(workDir, `${slug}-music.m4a`);
    createSynthMusic(musicPath, Math.ceil(silentDuration) + 2);
  }

  let sfxPath = '';

  if (CHAOS_MODE) {
    sfxPath = path.join(workDir, `${slug}-chaos-sfx.m4a`);
    createChaosSfx(sfxPath, Math.ceil(silentDuration) + 1);
  }

  const args = [
    '-y',
    '-i', silentCombined,
    '-i', narrationPath
  ];

  const filterParts = [
    `[1:a]volume=${NARRATION_VOLUME},apad[narr]`
  ];

  const mixInputs = ['[narr]'];
  let inputIndex = 2;

  if (musicPath && fs.existsSync(musicPath)) {
    verifyMediaFile(musicPath, 'background music', {
      requireAudio: true,
      minDuration: 1,
      minSize: 500
    });

    args.push('-stream_loop', '-1', '-i', musicPath);
    filterParts.push(`[${inputIndex}:a]volume=${MUSIC_VOLUME},apad[music]`);
    mixInputs.push('[music]');
    inputIndex++;
  }

  if (sfxPath && fs.existsSync(sfxPath)) {
    verifyMediaFile(sfxPath, 'chaos sound effects', {
      requireAudio: true,
      minDuration: 1,
      minSize: 500
    });

    args.push('-i', sfxPath);
    filterParts.push(`[${inputIndex}:a]volume=${CHAOS_SFX_VOLUME},apad[sfx]`);
    mixInputs.push('[sfx]');
    inputIndex++;
  }

  if (mixInputs.length === 1) {
    filterParts.push('[narr]anull[aud]');
  } else {
    filterParts.push(`${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=2[aud]`);
  }

  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '0:v:0',
    '-map', '[aud]',
    '-t', String(silentDuration),
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-c:a', 'aac',
    '-ar', '44100',
    '-ac', '2',
    '-b:a', '128k',
    '-movflags', '+faststart',
    finalOutput
  );

  ffmpeg(args);

  verifyMediaFile(finalOutput, 'final video', {
    requireVideo: true,
    requireAudio: true,
    minDuration: 5,
    minSize: 50_000
  });

  return finalOutput;
}

// -----------------------------------------------------------------------------
// YOUTUBE
// -----------------------------------------------------------------------------

async function getYouTubeClient() {
  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: YOUTUBE_REFRESH_TOKEN
  });

  return google.youtube({
    version: 'v3',
    auth: oauth2Client
  });
}

async function uploadToYouTube({ videoPath, app, appUrl }) {
  const youtube = await getYouTubeClient();

  const title = buildTitle(app);
  const description = buildDescription(app, appUrl);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        tags: [
          'useless apps',
          'uselessapps',
          'funny app',
          'coding',
          'web development',
          'javascript',
          'shorts',
          'pointless app',
          'useless website',
          'fake documentary',
          'tech comedy',
          'meme app',
          'bad software'
        ],
        categoryId: '28'
      },
      status: {
        privacyStatus: VIDEO_PRIVACY,
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: fs.createReadStream(videoPath)
    }
  });

  return {
    videoId: response.data.id,
    title,
    description,
    privacyStatus: VIDEO_PRIVACY,
    url: `https://youtu.be/${response.data.id}`
  };
}

// -----------------------------------------------------------------------------
// PIPELINE
// -----------------------------------------------------------------------------

function validateApp(app) {
  if (!app) return false;
  if (!app.name) return false;
  if (!app.file && !app.url) return false;
  return true;
}

function getAppKey(app) {
  return app.file || app.url;
}

async function processOneApp(app) {
  const key = getAppKey(app);
  const slug = slugify(app.name || key);
  const workDir = path.join(TMP_DIR, slug);
  const startedAt = new Date().toISOString();

  ensureCleanDir(workDir);

  try {
    const { videoPath: rawVideoPath, appUrl } = await recordApp(app, slug, workDir);

    const storyPackage = USE_STORY_ENGINE
      ? createStoryPackage(app)
      : null;

    const metadataPackage = USE_METADATA_ENGINE
      ? createMetadataPackage(app, storyPackage || {}, appUrl)
      : null;

    const qualityPlan = USE_QUALITY_ENGINE
      ? createQualityPlan({
          qualityMode: process.env.QUALITY_MODE || 'preview',
          renderTarget: process.env.RENDER_TARGET || 'shorts'
        })
      : null;

    const narration = await generateNarration(app, slug, workDir);

    const finalVideo = stitchFinalVideo({
      rawVideoPath,
      narrationPath: narration.path,
      slug,
      app,
      workDir
    });

    const finalDuration = verifyMediaFile(finalVideo, 'final video', {
      requireVideo: true,
      requireAudio: true,
      minDuration: 5,
      minSize: 50_000
    });

    const result = {
      name: app.name,
      file: key,
      appUrl,
      startedAt,
      generatedAt: new Date().toISOString(),
      localVideo: finalVideo,
      finalDuration,
    storyPackage,
    metadataPackage,
    qualityPlan,
      narration: narration.text,
      narrationMeta: {
        duration: narration.duration,
        synthetic: narration.synthetic || false,
        warning: narration.warning || null,
        chunks: narration.chunks || null
      },
      uploaded: false
    };

    if (DRY_RUN) {
      log(`DRY_RUN=true. Not uploading. Video saved: ${finalVideo}`);
      result.dryRun = true;
      return result;
    }

    if (!hasYouTubeSecrets()) {
      log(`YouTube secrets not set. Video saved locally: ${finalVideo}`);
      result.reason = 'missing_youtube_secrets';
      return result;
    }

    const upload = await uploadToYouTube({
      videoPath: finalVideo,
      app,
      appUrl
    });

    result.uploaded = true;
    result.youtube = upload;

    log(`Uploaded: ${app.name}`);
    log(upload.url);

    return result;
  } finally {
    if (!KEEP_TMP) {
      fs.rmSync(workDir, { recursive: true, force: true });
    } else {
      log(`KEEP_TMP=true. Temp files kept at: ${workDir}`);
    }
  }
}

function printStartupInfo() {
  log('UselessApps.fun V3 RIDICULOUSNESS MACHINE starting...');
  log(`BASE_URL: ${BASE_URL}`);
  log(`RECORD_BASE_URL: ${RECORD_BASE_URL}`);
  log(`PUBLIC_BASE_URL: ${PUBLIC_BASE_URL}`);
  log(`APPS_JSON: ${APPS_JSON}`);
  log(`MAX_PER_RUN: ${MAX_PER_RUN}`);
  log(`VIDEO_PRIVACY: ${VIDEO_PRIVACY}`);
  log(`DRY_RUN: ${DRY_RUN}`);
  log(`FORCE: ${FORCE}`);
  log(`USE_STORY_ENGINE: ${USE_STORY_ENGINE}`);
  log(`USE_METADATA_ENGINE: ${USE_METADATA_ENGINE}`);
  log(`USE_QUALITY_ENGINE: ${USE_QUALITY_ENGINE}`);
  log(`KEEP_TMP: ${KEEP_TMP}`);
  log(`CHAOS_MODE: ${CHAOS_MODE}`);
  log(`USE_SYNTH_MUSIC: ${USE_SYNTH_MUSIC}`);
  log(`RECORD_SIZE: ${RECORD_WIDTH}x${RECORD_HEIGHT}`);
  log(`SHORTS_SIZE: ${SHORTS_WIDTH}x${SHORTS_HEIGHT}`);
  log(`VIDEO_FPS: ${VIDEO_FPS}`);

  if (!DRY_RUN && !hasYouTubeSecrets()) {
    log('YouTube secrets are not fully set. Upload will be skipped.');
  }
}

async function main() {
  requireBinary('ffmpeg');
  requireBinary('ffprobe');

  printStartupInfo();

  const processed = readJson(PROCESSED_FILE, {});
  const apps = readJson(APPS_JSON, []);

  if (!Array.isArray(apps)) {
    throw new Error('apps.json must be an array');
  }

  const validApps = apps.filter(validateApp);

  if (validApps.length === 0) {
    log('No valid apps found in apps.json.');
    return;
  }

  const candidates = validApps.filter(app => {
    if (FORCE) return true;

    const key = getAppKey(app);
    return !processed[key]?.uploaded;
  });

  if (candidates.length === 0) {
    log('No unprocessed apps found.');
    return;
  }

  let completed = 0;
  let attempted = 0;

  for (const app of candidates) {
    if (attempted >= MAX_PER_RUN || completed >= MAX_PER_RUN) break;

    const key = getAppKey(app);

    log('');
    log(`Processing: ${app.name}`);
    log(`Key: ${key}`);

    attempted++;

    try {
      const result = await processOneApp(app);

      processed[key] = result;
      writeJson(PROCESSED_FILE, processed);

      completed++;
    } catch (err) {
      console.error(`Failed processing "${app.name}": ${err.stack || err.message}`);

      processed[key] = {
        name: app.name,
        file: key,
        uploaded: false,
        failedAt: new Date().toISOString(),
        error: err.message
      };

      writeJson(PROCESSED_FILE, processed);
    }
  }

  log('');
  log(`Done. Attempted ${attempted}, completed ${completed}.`);
}

main().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
