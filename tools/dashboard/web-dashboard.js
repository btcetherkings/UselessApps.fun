'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { queueAction, loadQueue } = require('../actions/action-lib');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PORT = Number(process.env.DASHBOARD_PORT || 8787);

const FILES = {
  '/': path.join(__dirname, 'dashboard.html'),
  '/dashboard.html': path.join(__dirname, 'dashboard.html'),
  '/dashboard.css': path.join(__dirname, 'dashboard.css'),
  '/dashboard.js': path.join(__dirname, 'dashboard.js'),
  '/api/report': path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.json'),
  '/api/report-md': path.join(ROOT_DIR, 'reports', 'daily-autopilot-report.md')
};

function contentType(url) {
  if (url.endsWith('.css')) return 'text/css';
  if (url.endsWith('.js')) return 'application/javascript';
  if (url.includes('/api/report') && !url.endsWith('-md')) return 'application/json';
  if (url.endsWith('-md')) return 'text/markdown';
  return 'text/html';
}

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || '/').split('?')[0];

  if (cleanUrl === '/api/actions' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(loadQueue(), null, 2));
    return;
  }

  if (cleanUrl === '/api/actions' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 100000) req.destroy();
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const action = queueAction(parsed.type, parsed.payload || {}, 'dashboard');

        res.writeHead(201, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        });
        res.end(JSON.stringify(action, null, 2));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }, null, 2));
      }
    });

    return;
  }

  const file = FILES[cleanUrl];

  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`Missing file: ${path.relative(ROOT_DIR, file)}`);
    return;
  }

  res.writeHead(200, {
    'Content-Type': contentType(cleanUrl),
    'Cache-Control': 'no-store'
  });

  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('UselessApps.fun Browser Dashboard');
  console.log('=================================');
  console.log('');
  console.log(`Dashboard running at: http://127.0.0.1:${PORT}`);
  console.log('');
});
