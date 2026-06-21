'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const WAREHOUSE_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'advanced-warehouse.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function topVideos(videos, metric, limit = 10) {
  return Object.values(videos || {})
    .map(v => ({
      videoId: v.videoId,
      value: Number(v.core?.[metric] || 0),
      errors: v.errors || []
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function sumMetric(videos, metric) {
  return Object.values(videos || {}).reduce((sum, v) => sum + Number(v.core?.[metric] || 0), 0);
}

function main() {
  const warehouse = readJson(WAREHOUSE_FILE, null);

  if (!warehouse) {
    console.error('No advanced warehouse found. Run ./scripts/youtube-advanced-pull.sh first.');
    process.exit(1);
  }

  const videos = warehouse.videos || {};
  const videoList = Object.values(videos);

  console.log('');
  console.log('UselessApps.fun Advanced Analytics Report');
  console.log('=========================================');
  console.log('');

  console.log('Date range');
  console.log('----------');
  console.log(`${warehouse.dateRange?.startDate} to ${warehouse.dateRange?.endDate}`);
  console.log('');

  console.log('Channel');
  console.log('-------');
  if (warehouse.channel?.error) {
    console.log(`Channel error: ${warehouse.channel.error}`);
  } else {
    console.log(`Title: ${warehouse.channel?.title || 'unknown'}`);
    console.log(`Subscribers: ${warehouse.channel?.subscriberCount ?? 'unknown'}`);
    console.log(`Hidden subscribers: ${warehouse.channel?.hiddenSubscriberCount ?? 'unknown'}`);
    console.log(`Total views: ${warehouse.channel?.viewCount ?? 'unknown'}`);
    console.log(`Public videos: ${warehouse.channel?.videoCount ?? 'unknown'}`);
  }
  console.log('');

  console.log('Totals from pulled video analytics');
  console.log('----------------------------------');
  console.log(`Videos pulled: ${videoList.length}`);
  console.log(`Views: ${sumMetric(videos, 'views')}`);
  console.log(`Likes: ${sumMetric(videos, 'likes')}`);
  console.log(`Comments: ${sumMetric(videos, 'comments')}`);
  console.log(`Shares: ${sumMetric(videos, 'shares')}`);
  console.log(`Subscribers gained: ${sumMetric(videos, 'subscribersGained')}`);
  console.log(`Subscribers lost: ${sumMetric(videos, 'subscribersLost')}`);
  console.log(`Estimated minutes watched: ${sumMetric(videos, 'estimatedMinutesWatched')}`);
  console.log('');

  const metrics = [
    'views',
    'estimatedMinutesWatched',
    'averageViewDuration',
    'averageViewPercentage',
    'impressions',
    'impressionsCtr',
    'subscribersGained',
    'shares'
  ];

  for (const metric of metrics) {
    console.log(`Top by ${metric}`);
    console.log('-'.repeat(`Top by ${metric}`.length));

    for (const item of topVideos(videos, metric, 5)) {
      console.log(`- ${item.videoId}: ${item.value}`);
    }

    console.log('');
  }

  const withErrors = videoList.filter(v => (v.errors || []).length);

  console.log('Data gaps / API errors');
  console.log('----------------------');

  if (!withErrors.length && !(warehouse.errors || []).length) {
    console.log('No API errors recorded.');
  } else {
    for (const err of warehouse.errors || []) {
      console.log(`- ${err.scope}: ${err.error}`);
    }

    for (const video of withErrors) {
      console.log(`- ${video.videoId}`);
      for (const err of video.errors) {
        console.log(`  ${err.scope}: ${err.error}`);
      }
    }
  }

  console.log('');
}

main();
