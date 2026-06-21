'use strict';

require('dotenv').config();

const http = require('http');
const { URL } = require('url');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

const REDIRECT_PORT = Number(process.env.YOUTUBE_AUTH_PORT || 53682);
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/oauth2callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env');
  process.exit(1);
}

function buildAuthUrl() {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', SCOPES.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

async function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(json, null, 2)}`);
  }

  return json;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, REDIRECT_URI);

    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400);
      res.end('Missing code');
      return;
    }

    const token = await exchangeCode(code);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Success. You can close this browser tab and return to the terminal.\n');

    console.log('');
    console.log('NEW TOKEN RESULT');
    console.log('================');
    console.log('');
    console.log('Copy this into .env as YOUTUBE_REFRESH_TOKEN:');
    console.log('');
    console.log(token.refresh_token || '(No refresh_token returned. Re-run and make sure prompt=consent is used.)');
    console.log('');
    console.log('Scopes requested:');
    for (const scope of SCOPES) console.log(`- ${scope}`);
    console.log('');

    server.close();
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(err.message);
    console.error(err);
    server.close();
  }
});

server.listen(REDIRECT_PORT, '127.0.0.1', () => {
  console.log('');
  console.log('Open this URL in your browser:');
  console.log('');
  console.log(buildAuthUrl());
  console.log('');
  console.log(`Waiting on ${REDIRECT_URI}`);
});
