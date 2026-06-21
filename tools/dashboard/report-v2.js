'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

const APPS_FILE = path.join(ROOT_DIR, 'apps.json');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const RECS_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'recommendations-v2.json');
const ADVANCED_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'advanced-warehouse.json');

const REPORT_MD = path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.md');
const REPORT_JSON = path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.json');

const { table, asList, scoreLabel } = require('./report-utils');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getVideoId(record) {
  return record.youtube?.videoId || null;
}

function getReviewItem(review, videoId) {
  if (!videoId) return null;
  return review.items?.[videoId] || null;
}

function audioWarnings(item, record) {
  return item?.audioValidation?.warnings || record?.audioValidation?.warnings || [];
}

function audioReadiness(item, record) {
  return item?.audioValidation?.readiness || record?.audioValidation?.readiness || 'not_validated';
}

function publicSafe(item, record) {
  return item?.audioValidation?.publicSafe === true || record?.audioValidation?.publicSafe === true;
}

function buildRows() {
  const apps = readJson(APPS_FILE, []);
  const processed = readJson(PROCESSED_FILE, {});
  const review = readJson(REVIEW_FILE, { items: {}, audit: [] });
  const recs = readJson(RECS_FILE, null);
  const advanced = readJson(ADVANCED_FILE, null);

  const records = Object.values(processed || {});

  const rows = records.map(record => {
    const videoId = getVideoId(record);
    const reviewItem = getReviewItem(review, videoId);

    return {
      name: record.name,
      file: record.file,
      videoId,
      url: record.youtube?.url || reviewItem?.url || '',
      uploaded: Boolean(record.uploaded),
      dryRun: Boolean(record.dryRun),
      failed: Boolean(record.failedAt || record.error),
      localVideo: record.localVideo || '',
      status: reviewItem?.status || record.youtube?.privacyStatus || (record.dryRun ? 'preview_only' : 'local'),
      decision: reviewItem?.decision || 'none',
      appType: record.storyPackage?.appType || reviewItem?.appType || 'unknown',
      storyMode: record.storyPackage?.storyMode || reviewItem?.storyMode || 'unknown',
      audioMode: record.audioMix?.mode || reviewItem?.audioValidation?.mode || 'unknown',
      audioReadiness: audioReadiness(reviewItem, record),
      publicSafe: publicSafe(reviewItem, record),
      audioWarnings: audioWarnings(reviewItem, record),
      learningReason: record.learningReason || null,
      learningScore: record.learningReason?.learningScore ?? null,
      generatedAt: record.generatedAt || record.startedAt || '',
      record
    };
  });

  return { apps, rows, review, recs, advanced };
}

function calculateHealth({ rows, review, recs }) {
  let score = 0;
  const notes = [];

  if (rows.length) { score += 20; notes.push('+20 processed records exist'); }
  if (rows.some(r => r.uploaded)) { score += 15; notes.push('+15 uploads exist'); }
  if (Object.keys(review.items || {}).length) { score += 15; notes.push('+15 review DB has items'); }
  if (rows.some(r => r.audioMode !== 'unknown')) { score += 15; notes.push('+15 audio mix exists'); }
  if (rows.some(r => r.publicSafe)) { score += 15; notes.push('+15 public-safe item exists'); }
  if (recs?.version === 2) { score += 10; notes.push('+10 learning v2 exists'); }
  if (rows.some(r => r.learningReason)) { score += 10; notes.push('+10 learning reason exists'); }

  if (rows.some(r => r.failed)) { score -= 20; notes.push('-20 failed records exist'); }

  const blocked = rows.filter(r => r.audioReadiness === 'blocked_for_public').length;
  if (blocked > 5) { score -= 10; notes.push('-10 many blocked videos'); }

  score = Math.max(0, Math.min(100, score));

  return { score, label: scoreLabel(score), notes };
}

function recommendedAction(row) {
  if (row.failed) return 'FIX_FAILED_RECORD';
  if (row.status === 'published_public') return 'ALREADY_PUBLIC';
  if (row.status === 'published_unlisted') return 'WATCH_ANALYTICS';
  if (row.decision === 'approved' && row.publicSafe) return 'PUBLISH_UNLISTED';
  if (row.uploaded && row.publicSafe) return 'REVIEW_AND_APPROVE';
  if (row.audioWarnings.includes('audio_missing')) return 'RERENDER_WITH_AUDIO';
  if (row.audioWarnings.includes('test_audio_used')) return 'RERENDER_WITH_PRODUCTION_AUDIO';
  if (row.dryRun) return 'PRIVATE_UPLOAD_IF_GOOD';
  return 'REVIEW';
}

function buildActionCards(rows) {
  return rows
    .map(row => ({ ...row, action: recommendedAction(row) }))
    .filter(row => !['ALREADY_PUBLIC', 'WATCH_ANALYTICS'].includes(row.action))
    .slice(0, 20);
}

function buildRerenderCandidates(rows) {
  return rows.filter(row =>
    row.audioWarnings.includes('audio_missing') ||
    row.audioWarnings.includes('test_audio_used') ||
    row.audioReadiness === 'blocked_for_public'
  );
}

function learningConfidence(recs) {
  const rows = recs?.rows || [];
  const withStats = rows.filter(r => Number(r.views || 0) + Number(r.likes || 0) + Number(r.comments || 0) > 0).length;

  if (withStats >= 25) return { level: 'high', withStats };
  if (withStats >= 5) return { level: 'medium', withStats };
  return { level: 'low', withStats };
}

function buildReport() {
  const data = buildRows();
  const { apps, rows, review, recs, advanced } = data;

  const health = calculateHealth({ rows, review, recs });
  const actions = buildActionCards(rows);
  const rerenderCandidates = buildRerenderCandidates(rows);
  const confidence = learningConfidence(recs);

  const statusCounts = countBy(rows, row => row.status);
  const audioCounts = countBy(rows, row => row.audioReadiness);
  const actionCounts = countBy(actions, row => row.action);

  const latest = [...rows]
    .filter(r => r.generatedAt)
    .sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)))[0] || null;

  const report = {
    generatedAt: new Date().toISOString(),
    health,
    totals: {
      apps: Array.isArray(apps) ? apps.length : 0,
      records: rows.length,
      uploaded: rows.filter(r => r.uploaded).length,
      dryRun: rows.filter(r => r.dryRun).length,
      failed: rows.filter(r => r.failed).length,
      publicSafe: rows.filter(r => r.publicSafe).length,
      blockedForPublic: rows.filter(r => r.audioReadiness === 'blocked_for_public').length,
      withLearningReason: rows.filter(r => r.learningReason).length
    },
    statusCounts,
    audioCounts,
    actionCounts,
    actions,
    rerenderCandidates,
    latest,
    advancedAnalytics: {
      exists: Boolean(advanced),
      generatedAt: advanced?.generatedAt || null,
      channel: advanced?.channel || null,
      videosPulled: advanced ? Object.keys(advanced.videos || {}).length : 0,
      errors: advanced?.errors || []
    },
    learning: {
      exists: recs?.version === 2,
      generatedAt: recs?.generatedAt || null,
      confidence,
      summary: recs?.summary || {},
      prefer: recs?.prefer || {},
      avoid: recs?.avoid || {},
      nextIdeas: recs?.nextIdeas || [],
      topVideos: recs?.topVideos || [],
      weakVideos: recs?.weakVideos || []
    }
  };

  return report;
}

function buildMarkdown(report) {
  const topRows = (report.learning.topVideos || []).slice(0, 8).map(row => [
    row.name,
    row.learningScore,
    row.publishStatus,
    row.publicSafe
  ]);

  const weakRows = (report.learning.weakVideos || []).slice(0, 8).map(row => [
    row.name,
    row.learningScore,
    row.audioReadiness,
    (row.audioWarnings || []).join(', ')
  ]);

  const actionRows = report.actions.slice(0, 12).map(row => [
    row.action,
    row.name,
    row.videoId || '',
    row.publicSafe,
    row.audioWarnings.join(', ') || 'none'
  ]);

  const rerenderRows = report.rerenderCandidates.slice(0, 12).map(row => [
    row.name,
    row.videoId || '',
    row.audioReadiness,
    row.audioWarnings.join(', ') || 'none'
  ]);

  const latest = report.latest || {};

  return `# UselessApps.fun Operator Report v2

Generated: ${report.generatedAt}

## Executive Summary

- System health: **${report.health.score}/100 (${report.health.label})**
- Apps: ${report.totals.apps}
- Processed records: ${report.totals.records}
- Uploaded: ${report.totals.uploaded}
- Dry-run previews: ${report.totals.dryRun}
- Failed: ${report.totals.failed}
- Public-safe: ${report.totals.publicSafe}
- Blocked for public: ${report.totals.blockedForPublic}
- With learning reason: ${report.totals.withLearningReason}

## Health Score Notes

${asList(report.health.notes)}

## Upload / Publish Funnel

\`\`\`json
${JSON.stringify(report.statusCounts, null, 2)}
\`\`\`

## Audio Safety Breakdown

\`\`\`json
${JSON.stringify(report.audioCounts, null, 2)}
\`\`\`

## Action Counts

\`\`\`json
${JSON.stringify(report.actionCounts, null, 2)}
\`\`\`

## Action Cards

${actionRows.length ? table(['Action', 'Video', 'Video ID', 'Public Safe', 'Warnings'], actionRows) : '- none'}

## Rerender Candidates

${rerenderRows.length ? table(['Video', 'Video ID', 'Readiness', 'Warnings'], rerenderRows) : '- none'}

## Advanced YouTube Analytics

- Exists: ${report.advancedAnalytics.exists}
- Generated: ${report.advancedAnalytics.generatedAt || 'not generated'}
- Videos pulled: ${report.advancedAnalytics.videosPulled}
- Channel title: ${report.advancedAnalytics.channel?.title || 'unknown'}
- Subscribers: ${report.advancedAnalytics.channel?.subscriberCount ?? 'unknown'}
- Channel total views: ${report.advancedAnalytics.channel?.viewCount ?? 'unknown'}
- Public videos: ${report.advancedAnalytics.channel?.videoCount ?? 'unknown'}

## Learning v2

- Exists: ${report.learning.exists}
- Generated: ${report.learning.generatedAt || 'not generated'}
- Confidence: ${report.learning.confidence.level}
- Videos with meaningful stats: ${report.learning.confidence.withStats}

### Prefer

- App types: ${(report.learning.prefer.appTypes || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}
- Story modes: ${(report.learning.prefer.storyModes || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}
- Audio moods: ${(report.learning.prefer.audioMoods || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}

### Avoid

- App types: ${(report.learning.avoid.appTypes || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}
- Story modes: ${(report.learning.avoid.storyModes || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}
- Audio moods: ${(report.learning.avoid.audioMoods || []).map(x => `${x.key} (${x.averageScore.toFixed(1)})`).join(', ') || 'none'}

## Top Videos

${topRows.length ? table(['Video', 'Score', 'Status', 'Public Safe'], topRows) : '- none'}

## Weak Videos

${weakRows.length ? table(['Video', 'Score', 'Readiness', 'Warnings'], weakRows) : '- none'}

## Next Ideas

${asList(report.learning.nextIdeas || [], idea => `- ${idea.appType} + ${idea.storyMode} + ${idea.audioMood}: ${idea.reason}`)}

## Latest Autopilot Decision

- App: ${latest.name || 'none'}
- File: ${latest.file || 'none'}
- App type: ${latest.appType || 'none'}
- Story mode: ${latest.storyMode || 'none'}
- Audio mode: ${latest.audioMode || 'none'}
- Uploaded: ${Boolean(latest.uploaded)}
- Dry run: ${Boolean(latest.dryRun)}

### Learning Reason

\`\`\`json
${JSON.stringify(latest.learningReason || null, null, 2)}
\`\`\`

## Next 10 Actions

${asList(buildNextActions(report))}

`;
}

function buildNextActions(report) {
  const actions = [];

  if (report.totals.failed) {
    actions.push('Investigate failed records before scaling uploads.');
  }

  for (const item of report.actions.slice(0, 5)) {
    if (item.action === 'REVIEW_AND_APPROVE') {
      actions.push(`Review ${item.name}, then approve: ./scripts/approve-video.sh ${item.videoId} "Approved for unlisted test"`);
    }
    if (item.action === 'PUBLISH_UNLISTED') {
      actions.push(`Publish ${item.name} as unlisted: ./scripts/publish-approved.sh ${item.videoId} unlisted`);
    }
    if (item.action === 'RERENDER_WITH_AUDIO') {
      actions.push(`Rerender ${item.name} with production-safe audio.`);
    }
    if (item.action === 'PRIVATE_UPLOAD_IF_GOOD') {
      actions.push(`Watch preview ${item.name}, then upload a private version if good.`);
    }
  }

  if (!actions.length) {
    actions.push('Run learning-aware autopilot preview: USE_LEARNING_ENGINE=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh');
    actions.push('Run private upload with production audio: USE_LEARNING_ENGINE=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh');
  }

  return actions.slice(0, 10);
}

function printConsole(report) {
  console.log('');
  console.log('UselessApps.fun Operator Report v2');
  console.log('==================================');
  console.log('');
  console.log(`Health: ${report.health.score}/100 (${report.health.label})`);
  console.log(`Apps: ${report.totals.apps} | Uploaded: ${report.totals.uploaded} | Failed: ${report.totals.failed}`);
  console.log(`Public-safe: ${report.totals.publicSafe} | Blocked: ${report.totals.blockedForPublic}`);
  console.log(`Learning reason records: ${report.totals.withLearningReason}`);
  console.log(`Advanced analytics videos: ${report.advancedAnalytics.videosPulled}`);
  if (report.advancedAnalytics.channel) {
    console.log(`Subscribers: ${report.advancedAnalytics.channel.subscriberCount ?? 'unknown'}`);
  }
  console.log('');
  console.log('Top actions');
  console.log('-----------');

  for (const action of buildNextActions(report).slice(0, 8)) {
    console.log(`- ${action}`);
  }

  console.log('');
  console.log(`Markdown: ${path.relative(ROOT_DIR, REPORT_MD)}`);
  console.log(`JSON: ${path.relative(ROOT_DIR, REPORT_JSON)}`);
  console.log('');
}

function main() {
  const report = buildReport();
  const markdown = buildMarkdown(report);

  writeFile(REPORT_MD, markdown + '\n');
  writeFile(REPORT_JSON, JSON.stringify(report, null, 2) + '\n');

  printConsole(report);
}

main();
