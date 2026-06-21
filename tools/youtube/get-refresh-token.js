'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const readline = require('readline');
const { google } = require('googleapis');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

const scopes = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes
});

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl);
console.log('\nApprove access, then paste the code here.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Code: ', async code => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());

    console.log('\nTokens received:\n');
    console.log(JSON.stringify(tokens, null, 2));

    if (tokens.refresh_token) {
      console.log('\nAdd this to your .env:\n');
      console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log('\nNo refresh_token returned.');
      console.log('Try removing app access from your Google Account security page, then rerun this script.');
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
});
