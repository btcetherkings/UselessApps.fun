'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROCESSED_FILE = path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');
const OUT_FILE = path.join(ROOT_DIR, 'tools', 'analytics', 'advanced-warehouse.json');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN || '';

const DAYS_BACK = Number(process.env.ANALYTICS_DAYS_BACK || 90);

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function isoDate(daysAgo = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function getOAuthClient() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, or YOUTUBE_REFRESH_TOKEN in .env');
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return oauth2Client;
}

function getVideoIds() {
  const processed = readJson(PROCESSED_FILE, {});
  const review = readJson(REVIEW_FILE, { items: {} });

  const ids = new Set();

  for (const record of Object.values(processed || {})) {
    if (record?.youtube?.videoId) ids.add(record.youtube.videoId);
  }

  for (const item of Object.values(review.items || {})) {
    if (item?.videoId) ids.add(item.videoId);
  }

  return [...ids];
}

async function getChannelStats(youtube) {
  const res = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true
  });

  const channel = res.data.items?.[0];

  if (!channel) {
    return {
      error: 'No channel returned by channels.list mine=true'
    };
  }

  return {
    id: channel.id,
    title: channel.snippet?.title || '',
    description: channel.snippet?.description || '',
    publishedAt: channel.snippet?.publishedAt || '',
    subscriberCount: Number(channel.statistics?.subscriberCount || 0),
    hiddenSubscriberCount: Boolean(channel.statistics?.hiddenSubscriberCount),
    viewCount: Number(channel.statistics?.viewCount || 0),
    videoCount: Number(channel.statistics?.videoCount || 0)
  };
}

async function analyticsQuery(analytics, params) {
  try {
    const res = await analytics.reports.query(params);
    return {
      ok: true,
      columnHeaders: res.data.columnHeaders || [],
      rows: res.data.rows || []
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      details: err.response?.data || null
    };
  }
}

function rowObject(result, row) {
  const obj = {};
  const headers = result.columnHeaders || [];

  headers.forEach((h, i) => {
    obj[h.name] = row[i];
  });

  return obj;
}

async function getVideoCoreAnalytics(analytics, videoId, startDate, endDate) {
  const metrics = [
    'views',
    'likes',
    'comments',
    'shares',
    'subscribersGained',
    'subscribersLost',
    'estimatedMinutesWatched',
    'averageViewDuration',
    'averageViewPercentage',
    'impressions',
    'impressionsCtr'
  ].join(',');

  const result = await analyticsQuery(analytics, {
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics,
    filters: `video==${videoId}`
  });

  if (!result.ok) return { error: result.error, details: result.details };

  const first = result.rows?.[0] || [];
  const obj = rowObject(result, first);

  return {
    views: Number(obj.views || 0),
    likes: Number(obj.likes || 0),
    comments: Number(obj.comments || 0),
    shares: Number(obj.shares || 0),
    subscribersGained: Number(obj.subscribersGained || 0),
    subscribersLost: Number(obj.subscribersLost || 0),
    estimatedMinutesWatched: Number(obj.estimatedMinutesWatched || 0),
    averageViewDuration: Number(obj.averageViewDuration || 0),
    averageViewPercentage: Number(obj.averageViewPercentage || 0),
    impressions: Number(obj.impressions || 0),
    impressionsCtr: Number(obj.impressionsCtr || 0)
  };
}

async function getBreakdown(analytics, videoId, startDate, endDate, dimension, metrics = 'views,estimatedMinutesWatched,averageViewDuration') {
  const result = await analyticsQuery(analytics, {
    ids: 'channel==MINE',
    startDate,
    endDate,
    dimensions: dimension,
    metrics,
    filters: `video==${videoId}`,
    sort: `-${metrics.split(',')[0]}`,
    maxResults: 25
  });

  if (!result.ok) {
    return {
      error: result.error,
      details: result.details,
      rows: []
    };
  }

  return {
    rows: result.rows.map(row => rowObject(result, row))
  };
}

async function getRetention(analytics, videoId, startDate, endDate) {
  const result = await analyticsQuery(analytics, {
    ids: 'channel==MINE',
    startDate,
    endDate,
    dimensions: 'elapsedVideoTimeRatio',
    metrics: 'audienceWatchRatio,relativeRetentionPerformance',
    filters: `video==${videoId}`,
    sort: 'elapsedVideoTimeRatio'
  });

  if (!result.ok) {
    return {
      error: result.error,
      details: result.details,
      rows: []
    };
  }

  return {
    rows: result.rows.map(row => rowObject(result, row))
  };
}

async function main() {
  const auth = getOAuthClient();
  const youtube = google.youtube({ version: 'v3', auth });
  const analytics = google.youtubeAnalytics({ version: 'v2', auth });

  const startDate = process.env.ANALYTICS_START_DATE || isoDate(DAYS_BACK);
  const endDate = process.env.ANALYTICS_END_DATE || isoDate(1);

  const videoIds = getVideoIds();

  const warehouse = {
    version: 1,
    generatedAt: new Date().toISOString(),
    dateRange: {
      startDate,
      endDate,
      daysBack: DAYS_BACK
    },
    channel: null,
    videos: {},
    errors: []
  };

  console.log('');
  console.log('UselessApps.fun YouTube Advanced Analytics Pull');
  console.log('===============================================');
  console.log('');
  console.log(`Date range: ${startDate} to ${endDate}`);
  console.log(`Video IDs: ${videoIds.length}`);
  console.log('');

  try {
    warehouse.channel = await getChannelStats(youtube);
  } catch (err) {
    warehouse.errors.push({
      scope: 'channel',
      error: err.message
    });
  }

  for (const videoId of videoIds) {
    console.log(`Pulling analytics for ${videoId}...`);

    const item = {
      videoId,
      core: {},
      retention: [],
      trafficSources: [],
      devices: [],
      countries: [],
      errors: []
    };

    const core = await getVideoCoreAnalytics(analytics, videoId, startDate, endDate);
    if (core.error) item.errors.push({ scope: 'core', error: core.error, details: core.details });
    else item.core = core;

    const retention = await getRetention(analytics, videoId, startDate, endDate);
    if (retention.error) item.errors.push({ scope: 'retention', error: retention.error, details: retention.details });
    else item.retention = retention.rows;

    const traffic = await getBreakdown(analytics, videoId, startDate, endDate, 'insightTrafficSourceType');
    if (traffic.error) item.errors.push({ scope: 'trafficSources', error: traffic.error, details: traffic.details });
    else item.trafficSources = traffic.rows;

    const devices = await getBreakdown(analytics, videoId, startDate, endDate, 'deviceType');
    if (devices.error) item.errors.push({ scope: 'devices', error: devices.error, details: devices.details });
    else item.devices = devices.rows;

    const countries = await getBreakdown(analytics, videoId, startDate, endDate, 'country');
    if (countries.error) item.errors.push({ scope: 'countries', error: countries.error, details: countries.details });
    else item.countries = countries.rows;

    warehouse.videos[videoId] = item;
  }

  writeJson(OUT_FILE, warehouse);

  console.log('');
  console.log(`Saved: ${OUT_FILE}`);
  console.log('');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
