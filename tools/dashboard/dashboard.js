'use strict';

function el(id) {
  return document.getElementById(id);
}

function kv(data) {
  return `<div class="kv">${
    Object.entries(data).map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('')
  }</div>`;
}

function badge(text, color = '') {
  return `<span class="badge ${color}">${text}</span>`;
}

function link(url, text = 'open') {
  if (!url) return '';
  return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
}

function table(target, headers, rows) {
  if (!target) return;
  const head = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
  target.innerHTML = head + body;
}

function listBadges(items, color) {
  if (!items || !items.length) return badge('none');
  return items.map(x => badge(typeof x === 'string' ? x : x.key, color)).join(' ');
}

async function queueDashboardAction(type, payload = {}) {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload })
  });

  if (!res.ok) {
    const text = await res.text();
    alert(`Failed to queue action: ${text}`);
    return;
  }

  const action = await res.json();
  alert(`Queued ${action.type}: ${action.id}`);
  location.reload();
}

function renderPreviousGenerations(report) {
  const container = el('previousGenerations');
  if (!container) return;

  const items = [
    ...(report.learning?.topVideos || []),
    ...(report.learning?.weakVideos || [])
  ];

  const unique = [];
  const seen = new Set();

  for (const item of items) {
    const key = item.videoId || item.name;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  container.innerHTML = unique.slice(0, 12).map(item => `
    <div class="gen-card">
      <div class="gen-thumb">▣</div>
      <strong>${item.name || 'Unknown'}</strong>
      <p class="muted">${item.storyMode || item.publishStatus || 'unknown'}</p>
      <p>${badge(`score ${item.learningScore ?? 0}`, 'blue')} ${item.publicSafe ? badge('safe', 'green') : badge('check', 'orange')}</p>
    </div>
  `).join('') || '<p class="muted">No previous generations yet.</p>';
}

function render(report) {
  el('generatedAt').textContent = `AI STATUS: ACTIVE · ${report.generatedAt || 'unknown'}`;

  el('healthScore').textContent = `${report.health?.score ?? '--'}/100`;
  el('healthLabel').textContent = report.health?.label || 'unknown';

  el('contentStats').innerHTML = kv({
    Apps: report.totals?.apps ?? 0,
    Records: report.totals?.records ?? 0,
    Uploaded: report.totals?.uploaded ?? 0,
    'Dry-run': report.totals?.dryRun ?? 0,
    Failed: report.totals?.failed ?? 0,
    'Learning reason': report.totals?.withLearningReason ?? 0
  });

  el('publishStats').innerHTML = kv({
    'Public-safe': report.totals?.publicSafe ?? 0,
    Blocked: report.totals?.blockedForPublic ?? 0,
    Private: report.statusCounts?.private_uploaded ?? 0,
    Unlisted: report.statusCounts?.published_unlisted ?? 0,
    Public: report.statusCounts?.published_public ?? 0
  });


  el('automationStats').innerHTML = kv({
    'Nightly script': report.automation?.nightlyScriptExists ? 'ready' : 'missing',
    'Worker script': report.automation?.workerScriptExists ? 'ready' : 'missing',
    'Cron installer': report.automation?.cronInstallerExists ? 'ready' : 'missing',
    'Latest nightly': report.automation?.latestNightlyLog?.file || 'none',
    'Latest worker': report.automation?.latestWorkerLog?.file || 'none'
  });


  el('brandSafetyStats').innerHTML = kv({
    Checked: report.safety?.total ?? 0,
    Passed: report.safety?.passed ?? 0,
    Warnings: report.safety?.warned ?? 0,
    Blocked: report.safety?.blocked ?? 0,
    Policy: 'No govt / police / politics / adult'
  });

  el('advancedStats').innerHTML = kv({
    Exists: report.advancedAnalytics?.exists ? 'yes' : 'no',
    Subscribers: report.advancedAnalytics?.channel?.subscriberCount ?? 'unknown',
    'Channel views': report.advancedAnalytics?.channel?.viewCount ?? 'unknown',
    'Videos pulled': report.advancedAnalytics?.videosPulled ?? 0,
    'Public videos': report.advancedAnalytics?.channel?.videoCount ?? 'unknown'
  });

  el('learningStats').innerHTML = `
    ${kv({
      Exists: report.learning?.exists ? 'yes' : 'no',
      Confidence: report.learning?.confidence?.level || 'unknown',
      'Videos with stats': report.learning?.confidence?.withStats ?? 0,
      Generated: report.learning?.generatedAt || 'not generated'
    })}
    <p><strong>Prefer app types</strong><br>${listBadges(report.learning?.prefer?.appTypes, 'purple')}</p>
    <p><strong>Prefer story modes</strong><br>${listBadges(report.learning?.prefer?.storyModes, 'blue')}</p>
    <p><strong>Prefer audio moods</strong><br>${listBadges(report.learning?.prefer?.audioMoods, 'green')}</p>
  `;

  const latest = report.latest || {};
  el('latestDecision').innerHTML = `
    ${kv({
      App: latest.name || 'none',
      Type: latest.appType || 'none',
      Story: latest.storyMode || 'none',
      Audio: latest.audioMode || 'none',
      Uploaded: latest.uploaded ? 'yes' : 'no',
      'Dry-run': latest.dryRun ? 'yes' : 'no'
    })}
    <p><strong>Learning reason</strong></p>
    <pre>${JSON.stringify(latest.learningReason || null, null, 2)}</pre>
  `;

  el('previewTitle').textContent = latest.name || 'Latest Useless App';
  el('previewSub').textContent = `${latest.storyMode || 'unknown story'} · ${latest.audioMode || 'unknown audio'}`;
  el('previewLog').textContent = [
    '> USELESSNESS CORE ONLINE',
    `> APP: ${latest.name || 'none'}`,
    `> STORY: ${latest.storyMode || 'unknown'}`,
    `> AUDIO: ${latest.audioMode || 'unknown'}`,
    `> SAFETY: ${(report.safety?.blocked || 0) ? 'CHECK REQUIRED' : 'CLEAR'}`
  ].join('\\n');

  renderPreviousGenerations(report);

  table(el('actionQueueTable'), ['ID', 'Type', 'Status', 'Safety', 'Command'],
    (report.actionQueue?.actions || []).slice(0, 25).map(a => [
      a.id,
      a.type,
      a.status,
      a.safety?.level || 'unknown',
      a.terminalCommand || ''
    ])
  );

  table(el('actionsTable'), ['Action', 'Video', 'Public Safe', 'Warnings', 'Link'],
    (report.actions || []).slice(0, 20).map(item => [
      item.action,
      item.name,
      item.publicSafe ? badge('yes', 'green') : badge('no', 'red'),
      (item.audioWarnings || []).join(', ') || 'none',
      link(item.url, 'open')
    ])
  );

  table(el('rerenderTable'), ['Video', 'Readiness', 'Warnings', 'Link'],
    (report.rerenderCandidates || []).slice(0, 20).map(item => [
      item.name,
      item.audioReadiness,
      (item.audioWarnings || []).join(', ') || 'none',
      link(item.url, 'open')
    ])
  );

  table(el('topVideosTable'), ['Video', 'Score', 'Status', 'Public Safe'],
    (report.learning?.topVideos || []).slice(0, 10).map(item => [
      item.name,
      item.learningScore,
      item.publishStatus,
      item.publicSafe ? badge('yes', 'green') : badge('no', 'red')
    ])
  );

  table(el('weakVideosTable'), ['Video', 'Score', 'Readiness', 'Warnings'],
    (report.learning?.weakVideos || []).slice(0, 10).map(item => [
      item.name,
      item.learningScore,
      item.audioReadiness,
      (item.audioWarnings || []).join(', ') || 'none'
    ])
  );

  el('businessStats').innerHTML = kv({
    Currency: report.business?.currency || 'GBP',
    Revenue: report.business?.revenueTotal ?? 0,
    Costs: report.business?.costTotal ?? 0,
    Profit: report.business?.profit ?? 0,
    'Revenue entries': report.business?.revenueCount ?? 0,
    'Cost entries': report.business?.costCount ?? 0
  });


  el('platformStats').innerHTML = kv({
    Total: report.platforms?.total ?? 0,
    Enabled: report.platforms?.enabled ?? 0,
    Connected: report.platforms?.connected ?? 0,
    'API mode': report.platforms?.api ?? 0,
    Manual: report.platforms?.manual ?? 0,
    Future: report.platforms?.future ?? 0
  });

  table(el('platformTable'), ['Platform', 'Enabled', 'Connected', 'Mode', 'Status'],
    (report.platforms?.platforms || []).map(p => [
      p.key,
      p.enabled ? badge('yes', 'green') : badge('no', 'red'),
      p.connected ? badge('yes', 'green') : badge('no', 'orange'),
      p.mode,
      p.status
    ])
  );

  el('calendarStats').innerHTML = kv({
    Total: report.calendar?.total ?? 0,
    Ideas: report.calendar?.counts?.idea ?? 0,
    Ready: report.calendar?.counts?.ready ?? 0,
    Scheduled: report.calendar?.counts?.scheduled ?? 0,
    Published: report.calendar?.counts?.published ?? 0,
    Blocked: report.calendar?.counts?.blocked ?? 0
  });

  table(el('calendarTable'), ['ID', 'Platform', 'Status', 'Title'],
    (report.calendar?.items || []).slice(0, 20).map(i => [
      i.id,
      i.platform,
      i.status,
      i.title
    ])
  );


  el('socialStats').innerHTML = kv({
    Total: report.social?.total ?? 0,
    Enabled: report.social?.enabled ?? 0,
    Connected: report.social?.connected ?? 0,
    'Not connected': report.social?.notConnected ?? 0
  });

  table(el('socialTable'), ['Channel', 'Enabled', 'Connected', 'Status'],
    (report.social?.channels || []).map(c => [
      c.key,
      c.enabled ? badge('yes', 'green') : badge('no', 'red'),
      c.connected ? badge('yes', 'green') : badge('no', 'orange'),
      c.status || 'unknown'
    ])
  );

  el('connectionStats').innerHTML = kv({
    Total: report.connections?.total ?? 0,
    Enabled: report.connections?.enabled ?? 0,
    Connected: report.connections?.connected ?? 0,
    Failing: report.connections?.failing ?? 0
  });

  table(el('connectionTable'), ['Connection', 'Enabled', 'Connected', 'Status'],
    (report.connections?.connections || []).map(c => [
      c.key,
      c.enabled ? badge('yes', 'green') : badge('no', 'red'),
      c.connected ? badge('yes', 'green') : badge('no', 'orange'),
      c.status || 'unknown'
    ])
  );

  el('jobStats').innerHTML = kv({
    Total: report.jobs?.total ?? 0,
    Enabled: report.jobs?.enabled ?? 0,
    Working: report.jobs?.working ?? 0,
    Testing: report.jobs?.testing ?? 0,
    Failing: report.jobs?.failing ?? 0
  });

  table(el('jobTable'), ['Job', 'Enabled', 'Status', 'Last error'],
    (report.jobs?.jobs || []).map(j => [
      j.key,
      j.enabled ? badge('yes', 'green') : badge('no', 'red'),
      j.status || 'unknown',
      j.lastError || ''
    ])
  );

  el('commands').textContent = [
    './scripts/safety-report.sh',
    './scripts/sync-review.sh',
    './scripts/youtube-advanced-pull.sh',
    './scripts/learning-v2.sh',
    './scripts/dashboard.sh',
    'USE_LEARNING_ENGINE=true SAFE_CONTENT_ONLY=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh',
    'USE_LEARNING_ENGINE=true SAFE_CONTENT_ONLY=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh'
  ].join('\\n');
}

async function main() {
  const res = await fetch('/api/report', { cache: 'no-store' });
  const report = await res.json();
  render(report);
  loadReviewCards();
}

main().catch(err => {
  document.body.innerHTML = `<pre>${err.stack || err.message}</pre>`;
});

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => {
    alert('Command copied');
  }).catch(() => {
    prompt('Copy command:', text);
  });
}

async function createExportPack(videoId) {
  try {
    const res = await fetch('/api/export-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(`Export failed: ${data.error || res.statusText}`);
      return;
    }

    alert(data.output || 'Export pack created');
  } catch (err) {
    alert(`Export request failed. Is the dashboard server still running?\n\n${err.message}`);
  }
}

async function addReviewCalendarItem(card) {
  try {
    const res = await fetch('/api/calendar-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: card.title || card.name || 'Untitled UselessApps item',
        videoId: card.videoId || '',
        platform: 'youtube',
        status: 'ready',
        notes: `Added from review desk. Recommended: ${card.recommendedAction || 'review'}`
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(`Calendar failed: ${data.error || res.statusText}`);
      return;
    }

    alert(`Calendar item added: ${data.id}`);
  } catch (err) {
    alert(`Calendar request failed. Is the dashboard server still running?\n\n${err.message}`);
  }
}

async function loadReviewCards() {
  const res = await fetch('/api/review-cards', { cache: 'no-store' });
  const summary = await res.json();
  const target = el('reviewDeskCards');

  if (!target) return;

  if (!summary.cards || !summary.cards.length) {
    target.innerHTML = '<p class="muted">No review cards found.</p>';
    return;
  }

  target.innerHTML = summary.cards.map((card, idx) => `
    <article class="review-card">
      <h4>${card.title}</h4>
      <p class="muted">${card.videoId}</p>
      <p>
        ${badge(card.status || 'unknown', 'blue')}
        ${card.publicSafe ? badge('public safe', 'green') : badge('not public safe', 'red')}
        ${badge(card.audioReadiness || 'audio unknown', 'purple')}
        ${card.safetyStatus === 'block' ? badge('safety block', 'red') : badge(card.safetyStatus || 'safety unknown', 'green')}
      </p>
      <p><strong>Recommended:</strong> ${card.recommendedAction}</p>
      <p>${card.url ? `<a href="${card.url}" target="_blank" rel="noopener">Open YouTube</a>` : ''}</p>

      <div class="button-row">
        ${card.videoId ? `<button onclick="queueDashboardAction('approve_video', { videoId: '${card.videoId}', note: 'Approved from Review Desk V2' })">Queue Approve</button>` : ''}
        ${card.videoId ? `<button onclick="queueDashboardAction('reject_video', { videoId: '${card.videoId}', note: 'Rejected from Review Desk V2' })" class="ghost">Queue Reject</button>` : ''}
        ${card.videoId ? `<button onclick="queueDashboardAction('needs_rerender', { videoId: '${card.videoId}', note: 'Needs rerender from Review Desk V2' })" class="ghost">Queue Rerender</button>` : ''}
        ${card.videoId ? `<button onclick="createExportPack('${card.videoId}')">Export Pack</button>` : '<button class="ghost" onclick="copyText(\'./scripts/autopilot-upload-once-private.sh\')">Copy Upload Command</button>'}
        <button onclick='addReviewCalendarItem(${JSON.stringify(card).replace(/'/g, '&apos;')})' class="ghost">Add Calendar</button>
      </div>

      <div class="commands">
        <div class="copy-command" onclick="copyText('${card.commands.publishUnlisted.replace(/'/g, "\\'")}')">${card.commands.publishUnlisted}</div>
        <div class="copy-command" onclick="copyText('${card.commands.publishPublic.replace(/'/g, "\\'")}')">${card.commands.publishPublic}</div>
      </div>
    </article>
  `).join('');
}

function setThemeMode(mode) {
  const allowed = ['dark', 'light', 'gold', 'colourful'];
  const selected = allowed.includes(mode) ? mode : 'dark';

  document.body.classList.remove(
    'theme-dark',
    'theme-light',
    'theme-gold',
    'theme-colourful'
  );

  document.body.classList.add(`theme-${selected}`);
  localStorage.setItem('uselessapps-theme', selected);
}

(function initThemeMode() {
  const saved = localStorage.getItem('uselessapps-theme') || 'dark';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setThemeMode(saved));
  } else {
    setThemeMode(saved);
  }
})();

async function loadManagementSuite() {
  const apiTarget = el('apiConnectionManager');
  const socialTarget = el('socialChannelManager');
  const businessTarget = el('businessManager');
  const lifecycleTarget = el('videoLifecycleManager');

  try {
    const [connections, channels, business, review] = await Promise.all([
      fetch('/api/connections').then(r => r.json()),
      fetch('/api/channels').then(r => r.json()),
      fetch('/api/business').then(r => r.json()),
      fetch('/api/review-cards').then(r => r.json())
    ]);

    if (apiTarget) {
      const rows = Object.entries(connections.connections || {}).map(([k, v]) => `
        <tr><td>${k}</td><td>${v.enabled}</td><td>${v.connected}</td><td>${v.status || ''}</td><td>${(v.requiredEnvVars || []).join(', ')}</td></tr>
      `).join('');

      apiTarget.innerHTML = `
        <table><thead><tr><th>Provider</th><th>Enabled</th><th>Connected</th><th>Status</th><th>Env Vars</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="muted">Secrets stay in .env. Use ./scripts/connection-set.sh to edit.</p>
      `;
    }

    if (socialTarget) {
      const rows = Object.entries(channels.channels || {}).map(([k, v]) => `
        <tr><td>${k}</td><td>${v.enabled}</td><td>${v.connected}</td><td>${v.mode || ''}</td><td>${v.status || ''}</td><td>${v.url || ''}</td></tr>
      `).join('');

      socialTarget.innerHTML = `
        <table><thead><tr><th>Channel</th><th>Enabled</th><th>Connected</th><th>Mode</th><th>Status</th><th>URL</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="muted">Use ./scripts/channel-set.sh to edit social channel metadata.</p>
      `;
    }

    if (businessTarget) {
      businessTarget.innerHTML = kv(business.settings || {});
    }

    if (lifecycleTarget) {
      lifecycleTarget.innerHTML = `
        <p>Total review cards: ${review.total || 0}</p>
        <p>Uploaded: ${review.uploaded || 0}</p>
        <p>Unsafe/rerender: ${review.unsafe || 0}</p>
        <div class="copy-command">./scripts/clean-start.sh</div>
        <p class="muted">Clean start archives local state and resets review/action/video runtime state. It does not delete YouTube videos.</p>
      `;
    }
  } catch (err) {
    if (apiTarget) apiTarget.innerHTML = `<p class="danger">Management suite failed: ${err.message}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadManagementSuite);
} else {
  loadManagementSuite();
}
