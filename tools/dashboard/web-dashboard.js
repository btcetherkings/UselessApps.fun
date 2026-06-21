'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

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
