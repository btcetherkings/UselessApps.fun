'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const REPORT_FILE = path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.md');

const { getContentSummary } = require('./content-summary');
const { getReviewSummary } = require('./review-summary');
const { getLearningSummary } = require('./learning-summary');

function line(text = '') {
  console.log(text);
}

function listTop(items, mapper, limit = 5) {
  return (items || []).slice(0, limit).map(mapper);
}

function formatGroup(items) {
  if (!items || !items.length) return '- none';
  return items.map(item => `- ${item.appName || item.name || item.videoId} | ${item.videoId || ''} | ${item.url || ''}`).join('\n');
}

function buildMarkdown({ content, review, learning }) {
  const latest = content.latestRecord || {};
  const latestLearning = latest.learningReason || null;

  const preferAppTypes = (learning.prefer?.appTypes || []).map(x => x.key).join(', ') || 'none';
  const preferStoryModes = (learning.prefer?.storyModes || []).map(x => x.key).join(', ') || 'none';
  const preferAudioMoods = (learning.prefer?.audioMoods || []).map(x => x.key).join(', ') || 'none';

  return `# UselessApps.fun Daily Autopilot Report

Generated: ${new Date().toISOString()}

## Content

- Apps total: ${content.appsTotal}
- Processed records: ${content.processedTotal}
- Uploaded: ${content.uploaded}
- Preview only: ${content.previewOnly}
- Failed: ${content.failed}
- With audio mix: ${content.withAudioMix}
- With learning reason: ${content.withLearningReason}

## Review / Publish

- Review items: ${review.total}
- Public-safe: ${review.publicSafe}
- Blocked for public: ${review.blockedForPublic}

### Status counts

\`\`\`json
${JSON.stringify(review.statusCounts, null, 2)}
\`\`\`

### Audio readiness counts

\`\`\`json
${JSON.stringify(review.audioReadinessCounts, null, 2)}
\`\`\`

## Ready for approval

${formatGroup(review.readyForApproval)}

## Ready for unlisted publish

${formatGroup(review.readyForUnlisted)}

## Learning v2

- Exists: ${learning.exists}
- Generated: ${learning.generatedAt || 'not generated'}
- Prefer app types: ${preferAppTypes}
- Prefer story modes: ${preferStoryModes}
- Prefer audio moods: ${preferAudioMoods}

### Top videos

${listTop(learning.topVideos, row => `- ${row.name} | score=${row.learningScore} | publicSafe=${row.publicSafe} | status=${row.publishStatus}`).join('\n') || '- none'}

### Next ideas

${listTop(learning.nextIdeas, idea => `- ${idea.appType} + ${idea.storyMode} + ${idea.audioMood} — ${idea.reason}`).join('\n') || '- none'}

## Latest generated app

- Name: ${latest.name || 'none'}
- File: ${latest.file || 'none'}
- Uploaded: ${Boolean(latest.uploaded)}
- Dry run: ${Boolean(latest.dryRun)}
- Audio mode: ${latest.audioMix?.mode || 'none'}
- Story mode: ${latest.storyPackage?.storyMode || 'none'}
- App type: ${latest.storyPackage?.appType || 'none'}

### Latest learning reason

\`\`\`json
${JSON.stringify(latestLearning, null, 2)}
\`\`\`

## Recommended next actions

${review.readyForApproval.length ? '- Review and approve public-safe private uploads.' : '- No public-safe private uploads waiting for approval.'}
${review.readyForUnlisted.length ? '- Publish approved public-safe videos as unlisted.' : '- No approved public-safe videos waiting for unlisted publish.'}
${content.failed ? '- Investigate failed processed records.' : '- No failed records detected.'}
${learning.exists ? '- Run a learning-aware autopilot preview/upload using recommendations v2.' : '- Run ./scripts/learning-v2.sh to generate recommendations.'}
`;
}

function printConsole({ content, review, learning }) {
  const latest = content.latestRecord || {};
  const latestLearning = latest.learningReason || null;

  line('');
  line('UselessApps.fun Daily Autopilot Report');
  line('=====================================');
  line('');

  line('Content');
  line('-------');
  line(`Apps total: ${content.appsTotal}`);
  line(`Uploaded: ${content.uploaded}`);
  line(`Preview only: ${content.previewOnly}`);
  line(`Failed: ${content.failed}`);
  line(`With audio mix: ${content.withAudioMix}`);
  line(`With learning reason: ${content.withLearningReason}`);
  line('');

  line('Review / Publish');
  line('----------------');
  line(`Review items: ${review.total}`);
  line(`Public-safe: ${review.publicSafe}`);
  line(`Blocked for public: ${review.blockedForPublic}`);
  line(`Ready for approval: ${review.readyForApproval.length}`);
  line(`Ready for unlisted: ${review.readyForUnlisted.length}`);
  line('');

  line('Learning v2');
  line('-----------');
  line(`Exists: ${learning.exists}`);
  line(`Generated: ${learning.generatedAt || 'not generated'}`);
  line(`Prefer app types: ${(learning.prefer?.appTypes || []).map(x => x.key).join(', ') || 'none'}`);
  line(`Prefer story modes: ${(learning.prefer?.storyModes || []).map(x => x.key).join(', ') || 'none'}`);
  line(`Prefer audio moods: ${(learning.prefer?.audioMoods || []).map(x => x.key).join(', ') || 'none'}`);
  line('');

  line('Latest generated app');
  line('--------------------');
  line(`Name: ${latest.name || 'none'}`);
  line(`File: ${latest.file || 'none'}`);
  line(`Uploaded: ${Boolean(latest.uploaded)}`);
  line(`Dry run: ${Boolean(latest.dryRun)}`);
  line(`Audio mode: ${latest.audioMix?.mode || 'none'}`);
  line(`Story mode: ${latest.storyPackage?.storyMode || 'none'}`);
  line(`App type: ${latest.storyPackage?.appType || 'none'}`);

  if (latestLearning) {
    line('');
    line('Latest learning reason');
    line('----------------------');
    line(`Engine version: ${latestLearning.version || 'unknown'}`);
    line(`Selected type: ${latestLearning.selectedType || 'unknown'}`);
    line(`Learning score: ${latestLearning.learningScore ?? 'unknown'}`);
    line(`Note: ${latestLearning.note || 'none'}`);
  } else {
    line('');
    line('Latest learning reason: missing');
  }

  line('');
  line(`Markdown report: ${path.relative(ROOT_DIR, REPORT_FILE)}`);
  line('');
}

function main() {
  const content = getContentSummary();
  const review = getReviewSummary();
  const learning = getLearningSummary();

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });

  const markdown = buildMarkdown({ content, review, learning });
  fs.writeFileSync(REPORT_FILE, markdown);

  printConsole({ content, review, learning });
}

main();
