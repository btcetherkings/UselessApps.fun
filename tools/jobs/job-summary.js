'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const JOBS_FILE = path.join(ROOT_DIR, 'tools', 'jobs', 'job-status.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function getJobSummary() {
  const data = readJson(JOBS_FILE, { jobs: {} });

  const jobs = Object.entries(data.jobs || {}).map(([key, value]) => ({
    key,
    ...value
  }));

  return {
    total: jobs.length,
    enabled: jobs.filter(j => j.enabled).length,
    working: jobs.filter(j => j.status === 'working').length,
    testing: jobs.filter(j => j.status === 'testing').length,
    failing: jobs.filter(j => j.lastError || j.status === 'error').length,
    jobs
  };
}

module.exports = {
  getJobSummary
};
