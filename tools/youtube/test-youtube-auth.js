'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const { google } = require('googleapis');

async function main() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const res = await youtube.channels.list({
    part: ['snippet', 'status'],
    mine: true
  });

  console.log(JSON.stringify(res.data, null, 2));
}

main().catch(err => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});
