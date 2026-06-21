'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { queueAction, loadQueue } = require('../actions/action-lib');
const { getReviewCards } = require('../review/review-summary');
const { addCalendarItem } = require('../calendar/calendar-lib');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PORT = Number(process.env.DASHBOARD_PORT || 8787);

const FILES = {
  '/': {
    path: path.join(ROOT_DIR, 'tools', 'dashboard', 'dashboard.html'),
    type: 'text/html; charset=utf-8'
  },
  '/dashboard.css': {
    path: path.join(ROOT_DIR, 'tools', 'dashboard', 'dashboard.css'),
    type: 'text/css; charset=utf-8'
  },
  '/dashboard.js': {
    path: path.join(ROOT_DIR, 'tools', 'dashboard', 'dashboard.js'),
    type: 'application/javascript; charset=utf-8'
  }
};

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, status, text, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1000000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error(`Invalid JSON body: ${err.message}`));
      }
    });

    req.on('error', reject);
  });
}

function runNode(args) {
  const child = spawnSync('node', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    shell: false
  });

  if (child.error) throw child.error;

  if (child.status !== 0) {
    throw new Error((child.stderr || child.stdout || `node ${args.join(' ')} failed`).trim());
  }

  return {
    stdout: child.stdout || '',
    stderr: child.stderr || '',
    status: child.status
  };
}

function buildReportIfMissing() {
  const jsonPath = path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.json');

  if (!fs.existsSync(jsonPath)) {
    const result = spawnSync('bash', ['./scripts/dashboard.sh'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      shell: false
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || 'dashboard report generation failed');
    }
  }

  return jsonPath;
}

const server = http.createServer(async (req, res) => {
  const cleanUrl = (req.url || '/').split('?')[0];

  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (cleanUrl === '/api/health' && req.method === 'GET') {
      sendJson(res, 200, {
        ok: true,
        service: 'uselessapps-command-centre',
        time: new Date().toISOString(),
        port: PORT,
        root: ROOT_DIR
      });
      return;
    }

    if (cleanUrl === '/api/report' && req.method === 'GET') {
      const jsonPath = buildReportIfMissing();
      sendJson(res, 200, readJson(jsonPath, {}));
      return;
    }

    if (cleanUrl === '/api/report-md' && req.method === 'GET') {
      const mdPath = path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.md');

      if (!fs.existsSync(mdPath)) {
        spawnSync('bash', ['./scripts/dashboard.sh'], {
          cwd: ROOT_DIR,
          encoding: 'utf8',
          shell: false
        });
      }

      sendText(
        res,
        200,
        fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '',
        'text/markdown; charset=utf-8'
      );
      return;
    }

    if (cleanUrl === '/api/actions' && req.method === 'GET') {
      sendJson(res, 200, loadQueue());
      return;
    }

    if (cleanUrl === '/api/actions' && req.method === 'POST') {
      const parsed = await readBody(req);
      const action = queueAction(parsed.type, parsed.payload || {}, 'dashboard');
      sendJson(res, 201, action);
      return;
    }


    if (cleanUrl === '/api/connections' && req.method === 'GET') {
      sendJson(res, 200, readJson(path.join(ROOT_DIR, 'tools', 'connections', 'api-connections.json'), { version: 1, connections: {} }));
      return;
    }

    if (cleanUrl === '/api/connections' && req.method === 'POST') {
      const parsed = await readBody(req);
      if (!parsed.provider || !parsed.field) throw new Error('provider and field are required');
      const child = runNode(['tools/connections/manage-connection.js', 'set', parsed.provider, parsed.field, String(parsed.value ?? '')]);
      sendJson(res, 201, { ok: true, output: child.stdout.trim() });
      return;
    }

    if (cleanUrl === '/api/channels' && req.method === 'GET') {
      sendJson(res, 200, readJson(path.join(ROOT_DIR, 'tools', 'social', 'social-channels.json'), { version: 1, channels: {} }));
      return;
    }

    if (cleanUrl === '/api/channels' && req.method === 'POST') {
      const parsed = await readBody(req);
      if (!parsed.platform || !parsed.field) throw new Error('platform and field are required');
      const child = runNode(['tools/social/manage-channel.js', 'set', parsed.platform, parsed.field, String(parsed.value ?? '')]);
      sendJson(res, 201, { ok: true, output: child.stdout.trim() });
      return;
    }

    if (cleanUrl === '/api/business' && req.method === 'GET') {
      sendJson(res, 200, readJson(path.join(ROOT_DIR, 'tools', 'business', 'business-metrics.json'), { version: 1, settings: {} }));
      return;
    }

    if (cleanUrl === '/api/business' && req.method === 'POST') {
      const parsed = await readBody(req);
      if (!parsed.field) throw new Error('field is required');
      const child = runNode(['tools/business/manage-business.js', 'set', parsed.field, String(parsed.value ?? '')]);
      sendJson(res, 201, { ok: true, output: child.stdout.trim() });
      return;
    }

    if (cleanUrl === '/api/archive-video' && req.method === 'POST') {
      const parsed = await readBody(req);
      if (!parsed.videoId) throw new Error('videoId is required');
      const child = runNode(['tools/publish/archive-video-state.js', parsed.videoId]);
      sendJson(res, 201, { ok: true, output: child.stdout.trim() });
      return;
    }

    if (cleanUrl === '/api/review-cards' && req.method === 'GET') {
      sendJson(res, 200, getReviewCards());
      return;
    }

    if (cleanUrl === '/api/export-pack' && req.method === 'POST') {
      const parsed = await readBody(req);
      const videoId = parsed.videoId;

      if (!videoId) throw new Error('videoId is required');

      const child = runNode(['tools/export/export-pack.js', videoId]);

      sendJson(res, 201, {
        ok: true,
        output: child.stdout.trim()
      });
      return;
    }

    if (cleanUrl === '/api/calendar-item' && req.method === 'POST') {
      const parsed = await readBody(req);

      const item = addCalendarItem({
        title: parsed.title || 'Untitled UselessApps item',
        videoId: parsed.videoId || '',
        platform: parsed.platform || 'youtube',
        status: parsed.status || 'ready',
        plannedAt: parsed.plannedAt || '',
        notes: parsed.notes || 'Added from dashboard review card'
      });

      sendJson(res, 201, item);
      return;
    }

    const file = FILES[cleanUrl];

    if (file) {
      if (!fs.existsSync(file.path)) {
        sendText(res, 404, 'File not found');
        return;
      }

      sendText(res, 200, fs.readFileSync(file.path), file.type);
      return;
    }

    sendJson(res, 404, {
      error: 'Not found',
      path: cleanUrl
    });
  } catch (err) {
    console.error(`[dashboard-api-error] ${cleanUrl}:`, err);
    sendJson(res, 500, {
      error: err.message,
      path: cleanUrl
    });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`UselessApps.fun dashboard running at http://127.0.0.1:${PORT}`);
});
