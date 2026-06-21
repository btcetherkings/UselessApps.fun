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
  const head = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
  target.innerHTML = head + body;
}

function listBadges(items, color) {
  if (!items || !items.length) return badge('none');
  return items.map(x => badge(typeof x === 'string' ? x : x.key, color)).join(' ');
}

function render(report) {
  el('generatedAt').textContent = `Generated ${report.generatedAt || 'unknown'}`;

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
    'Blocked': report.totals?.blockedForPublic ?? 0,
    'Private': report.statusCounts?.private_uploaded ?? 0,
    'Unlisted': report.statusCounts?.published_unlisted ?? 0,
    'Public': report.statusCounts?.published_public ?? 0
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

  const nextActions = report.actions?.slice(0, 8) || [];
  el('nextActions').innerHTML = `<div class="action-list">${
    nextActions.length ? nextActions.map(item => `
      <div class="action-item">
        ${badge(item.action, item.action.includes('RERENDER') ? 'orange' : item.action.includes('PUBLISH') ? 'green' : 'blue')}
        <strong>${item.name}</strong><br>
        <span class="muted">${item.videoId || ''}</span>
        ${item.url ? `<br>${link(item.url, 'YouTube')}` : ''}
        <br>Warnings: ${(item.audioWarnings || []).join(', ') || 'none'}
      </div>
    `).join('') : '<p class="muted">No immediate action cards.</p>'
  }</div>`;

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
    './scripts/sync-review.sh',
    './scripts/youtube-advanced-pull.sh',
    './scripts/learning-v2.sh',
    './scripts/dashboard.sh',
    'USE_LEARNING_ENGINE=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh',
    'USE_LEARNING_ENGINE=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh'
  ].join('\\n');
}

async function main() {
  const res = await fetch('/api/report', { cache: 'no-store' });
  const report = await res.json();
  render(report);
}

main().catch(err => {
  document.body.innerHTML = `<pre>${err.stack || err.message}</pre>`;
});

async function queueDashboardAction(type, payload = {}) {
  const res = await fetch('/api/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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
