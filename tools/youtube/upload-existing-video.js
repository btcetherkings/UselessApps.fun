'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

async function main() {
  const videoPath = process.argv[2];

  if (!videoPath) {
    console.error('Usage: node tools/youtube/upload-existing-video.js generated-videos/file.mp4');
    process.exit(1);
  }

  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    required('YOUTUBE_CLIENT_ID'),
    required('YOUTUBE_CLIENT_SECRET')
  );

  oauth2Client.setCredentials({
    refresh_token: required('YOUTUBE_REFRESH_TOKEN')
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const baseName = path.basename(videoPath, path.extname(videoPath));

  const title = `PRIVATE TEST - ${baseName} - UselessApps.fun`.slice(0, 100);

  const description = [
    'Private upload test for UselessApps.fun.',
    '',
    'This is only to verify the OAuth and YouTube API upload pipeline.',
    '',
    'Tiny apps. Zero purpose. Maximum joy.',
    '',
    '#UselessApps #FunnyApps #Shorts #Coding #PointlessApps'
  ].join('\n');

  console.log(`Uploading: ${videoPath}`);
  console.log(`Title: ${title}`);
  console.log('Privacy: private');

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        tags: [
          'useless apps',
          'funny apps',
          'shorts',
          'coding',
          'pointless app',
          'useless website',
          'tech comedy',
          'test upload'
        ],
        categoryId: '28'
      },
      status: {
        privacyStatus: 'private',
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: fs.createReadStream(videoPath)
    }
  });

  console.log('');
  console.log('Uploaded private test video:');
  console.log(`https://youtu.be/${response.data.id}`);
  console.log('');
  console.log('Now check YouTube Studio. It may take a minute to process.');
}

main().catch(err => {
  console.error('');
  console.error('Upload failed:');
  console.error(err.response?.data || err.stack || err.message);
  process.exit(1);
});
