'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..', '..');

const results = [];

function add(status, name, detail = '') {
  results.push({ status, name, detail });
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌';
  console.log(`${icon} ${status} ${name}${detail ? ` — ${detail}` : ''}`);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT_DIR, rel));
}

function readJson(rel) {
  const file = path.join(ROOT_DIR, rel);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: opts.stdio || 'pipe',
    shell: false
  });
}

function checkFile(rel, required = true) {
  if (exists(rel)) add('PASS', `file exists: ${rel}`);
  else add(required ? 'FAIL' : 'WARN', `missing file: ${rel}`);
}

function checkExecutable(rel) {
  const file = path.join(ROOT_DIR, rel);
  if (!fs.existsSync(file)) {
    add('FAIL', `missing executable script: ${rel}`);
    return;
  }

  try {
    fs.accessSync(file, fs.constants.X_OK);
    add('PASS', `script executable: ${rel}`);
  } catch {
    add('WARN', `script not executable: ${rel}`, 'run chmod +x');
  }
}

function checkJson(rel, required = true) {
  if (!exists(rel)) {
    add(required ? 'FAIL' : 'WARN', `missing JSON: ${rel}`);
    return;
  }

  try {
    readJson(rel);
    add('PASS', `JSON parses: ${rel}`);
  } catch (err) {
    add('FAIL', `JSON parse failed: ${rel}`, err.message);
  }
}

function nodeCheck(rel, required = true) {
  if (!exists(rel)) {
    add(required ? 'FAIL' : 'WARN', `missing JS: ${rel}`);
    return;
  }

  const r = run('node', ['--check', rel]);
  if (r.status === 0) add('PASS', `node --check: ${rel}`);
  else add('FAIL', `node --check failed: ${rel}`, (r.stderr || r.stdout || '').trim().split('\n').slice(-1)[0]);
}

function testSafetyEngine() {
  try {
    const { checkContentSafety, isStoryModeAllowed } = require(path.join(ROOT_DIR, 'tools', 'safety', 'content-policy'));

    const unsafeCases = [
      { name: 'Government Button', description: 'fake government warning app' },
      { name: 'Police Chase App', storyMode: 'fake_police_chase' },
      { name: 'Politics Spinner', description: 'election campaign nonsense' },
      { name: 'Adult Useless App', description: 'porn adult content' }
    ];

    for (const item of unsafeCases) {
      const result = checkContentSafety(item);
      if (result.blocked) add('PASS', `safety blocks: ${item.name}`);
      else add('FAIL', `safety failed to block: ${item.name}`);
    }

    const safe = checkContentSafety({
      name: 'Emotionally Unhelpful Calculator',
      description: 'A harmless useless calculator that gives absurd office productivity advice.',
      storyMode: 'fake_corporate_audit'
    });

    if (!safe.blocked) add('PASS', 'safety allows harmless useless app');
    else add('FAIL', 'safety incorrectly blocked harmless app', safe.blockers.join(', '));

    if (!isStoryModeAllowed('fake_government_warning')) add('PASS', 'blocked story mode rejected');
    else add('FAIL', 'blocked story mode allowed');

  } catch (err) {
    add('FAIL', 'safety engine test crashed', err.message);
  }
}

function testActionQueueSnapshot() {
  const queueRel = 'tools/actions/action-queue.json';
  const queueFile = path.join(ROOT_DIR, queueRel);
  const original = fs.existsSync(queueFile) ? fs.readFileSync(queueFile, 'utf8') : null;

  try {
    const { queueAction, updateAction } = require(path.join(ROOT_DIR, 'tools', 'actions', 'action-lib'));

    const action = queueAction('refresh_dashboard', { selfTest: true }, 'full-system-test');

    if (action.id && action.terminalCommand) add('PASS', 'action queue creates action with command');
    else add('FAIL', 'action queue missing id or terminal command');

    updateAction(action.id, { status: 'cancelled' }, 'Cancelled by full-system-test');
    add('PASS', 'action queue update works');

  } catch (err) {
    add('FAIL', 'action queue test crashed', err.message);
  } finally {
    if (original !== null) fs.writeFileSync(queueFile, original);
  }
}

function testDashboardReport() {
  if (!exists('tools/dashboard/report-v2.js')) {
    add('FAIL', 'dashboard report missing');
    return;
  }

  const r = run('node', ['tools/dashboard/report-v2.js']);
  if (r.status === 0) add('PASS', 'dashboard report generates');
  else add('FAIL', 'dashboard report failed', (r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' | '));

  checkJson('reports/daily-autopilot-report.json', false);
}

function testDashboardServerStatic() {
  const serverFile = path.join(ROOT_DIR, 'tools/dashboard/web-dashboard.js');
  if (!fs.existsSync(serverFile)) {
    add('FAIL', 'web dashboard server missing');
    return;
  }

  const text = fs.readFileSync(serverFile, 'utf8');
  if (text.includes('/api/report')) add('PASS', 'web dashboard has /api/report');
  else add('FAIL', 'web dashboard missing /api/report');

  if (text.includes('/api/actions')) add('PASS', 'web dashboard has /api/actions');
  else add('WARN', 'web dashboard missing /api/actions');

  if (text.includes('/api/review-cards')) add('PASS', 'web dashboard has /api/review-cards');
  else add('FAIL', 'web dashboard missing /api/review-cards');

  if (text.includes('/api/export-pack')) add('PASS', 'web dashboard has /api/export-pack');
  else add('FAIL', 'web dashboard missing /api/export-pack');

  if (text.includes('/api/calendar-item')) add('PASS', 'web dashboard has /api/calendar-item');
  else add('FAIL', 'web dashboard missing /api/calendar-item');
}

function main() {
  console.log('');
  console.log('UselessApps.fun Full System Test');
  console.log('================================');
  console.log('');

  [
    'apps.json',
    'tools/video-generator/generate-v3.js',
    'tools/autopilot/useless-autopilot.js',
    'tools/story/story-engine.js',
    'tools/safety/content-policy.js',
    'tools/safety/safety-report.js',
    'tools/actions/action-lib.js',
    'tools/dashboard/report-v2.js',
    'tools/dashboard/web-dashboard.js',
    'tools/dashboard/dashboard.html',
    'tools/dashboard/dashboard.css',
    'tools/dashboard/dashboard.js',
    'tools/publish/preflight.js',
    'tools/media/audio-validate.js'
  ].forEach(f => checkFile(f, !f.includes('preflight') && !f.includes('audio-validate') ? true : false));

  [
    'apps.json',
    'tools/video-generator/processed-v3.json',
    'tools/publish/review-db.json',
    'tools/actions/action-queue.json',
    'tools/jobs/job-status.json',
    'tools/business/business-metrics.json',
    'tools/social/social-channels.json',
    'tools/connections/api-connections.json',
    'tools/calendar/publishing-calendar.json',
    'tools/platforms/platform-registry.json',
    'tools/analytics/recommendations-v2.json',
    'tools/analytics/advanced-warehouse.json'
  ].forEach(f => checkJson(f, !f.includes('recommendations-v2') && !f.includes('advanced-warehouse')));

  [
    'tools/video-generator/generate-v3.js',
    'tools/autopilot/useless-autopilot.js',
    'tools/story/story-engine.js',
    'tools/safety/content-policy.js',
    'tools/safety/safety-report.js',
    'tools/actions/action-lib.js',
    'tools/actions/queue-action.js',
    'tools/actions/list-actions.js',
    'tools/actions/run-action.js',
    'tools/dashboard/report-v2.js',
    'tools/dashboard/web-dashboard.js',
    'tools/dashboard/dashboard.js',
    'tools/testing/full-system-test.js',
    'tools/review/review-summary.js',
    'tools/review/review-cards.js',
    'tools/publish/confirm-publish.js',
    'tools/export/export-report.js',
    'tools/export/export-pack.js',
    'tools/calendar/add-calendar-item.js',
    'tools/calendar/calendar-report.js',
    'tools/calendar/calendar-lib.js',
    'tools/platforms/platform-report.js',
    'tools/platforms/platform-lib.js',
    'tools/business/finance-report.js',
    'tools/business/add-finance-entry.js',
    'tools/audit/audit-report.js',
    'tools/audit/audit-log.js',
    'tools/db/sync-json-to-db.js',
    'tools/db/init-db.js',
    'tools/db/db.js',
    'tools/worker/safe-worker.js'
  ].forEach(f => nodeCheck(f));

  [
    'scripts/safety-report.sh',
    'scripts/full-test.sh',
    'scripts/dashboard.sh',
    'scripts/dashboard-web.sh',
    'scripts/queue-action.sh',
    'scripts/list-actions.sh',
    'scripts/run-action.sh',
    'scripts/review-cards.sh',
    'scripts/confirm-publish.sh',
    'scripts/export-report.sh',
    'scripts/export-pack.sh',
    'scripts/add-calendar-item.sh',
    'scripts/calendar-report.sh',
    'scripts/platform-report.sh',
    'scripts/export-state.sh',
    'scripts/backup-state.sh',
    'scripts/finance-report.sh',
    'scripts/add-cost.sh',
    'scripts/add-revenue.sh',
    'scripts/audit-report.sh',
    'scripts/db-sync.sh',
    'scripts/db-init.sh',
    'scripts/show-schedule.sh',
    'scripts/install-nightly-cron.sh',
    'scripts/safe-worker.sh',
    'scripts/nightly-run.sh'
  ].forEach(checkExecutable);

  testSafetyEngine();
  testActionQueueSnapshot();
  testDashboardReport();
  testDashboardServerStatic();

  const dashboardJs = fs.existsSync(path.join(ROOT_DIR, 'tools/dashboard/dashboard.js'))
    ? fs.readFileSync(path.join(ROOT_DIR, 'tools/dashboard/dashboard.js'), 'utf8')
    : '';

  if (dashboardJs.includes('loadReviewCards')) add('PASS', 'dashboard JS has review card loader');
  else add('FAIL', 'dashboard JS missing review card loader');

  const dashboardHtml = fs.existsSync(path.join(ROOT_DIR, 'tools/dashboard/dashboard.html'))
    ? fs.readFileSync(path.join(ROOT_DIR, 'tools/dashboard/dashboard.html'), 'utf8')
    : '';

  if (dashboardHtml.includes('reviewDeskCards')) add('PASS', 'dashboard HTML has review desk cards');
  else add('FAIL', 'dashboard HTML missing review desk cards');


  console.log('');
  console.log('Summary');
  console.log('-------');

  const pass = results.filter(r => r.status === 'PASS').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;

  console.log(`PASS: ${pass}`);
  console.log(`WARN: ${warn}`);
  console.log(`FAIL: ${fail}`);

  if (fail > 0) {
    console.log('');
    console.log('Failures');
    console.log('--------');
    for (const r of results.filter(x => x.status === 'FAIL')) {
      console.log(`- ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
    }
    process.exit(1);
  }

  console.log('');
  console.log('Full system test completed without hard failures.');
}

main();
