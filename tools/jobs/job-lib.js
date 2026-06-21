'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const JOBS_FILE = path.join(ROOT_DIR, 'tools', 'jobs', 'job-status.json');

function now() {
  return new Date().toISOString();
}

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

function loadJobs() {
  return readJson(JOBS_FILE, { version: 1, jobs: {} });
}

function saveJobs(data) {
  writeJson(JOBS_FILE, data);
}

function ensureJob(data, key) {
  data.jobs = data.jobs || {};
  if (!data.jobs[key]) {
    data.jobs[key] = {
      enabled: true,
      status: 'unknown',
      lastRun: null,
      lastSuccess: null,
      lastError: null,
      durationMs: null
    };
  }
  return data.jobs[key];
}

function markJobRunning(key) {
  const data = loadJobs();
  const job = ensureJob(data, key);
  job.status = 'running';
  job.lastRun = now();
  job.lastError = null;
  job._startedAtMs = Date.now();
  saveJobs(data);
}

function markJobSuccess(key) {
  const data = loadJobs();
  const job = ensureJob(data, key);
  const started = Number(job._startedAtMs || Date.now());
  job.status = 'working';
  job.lastSuccess = now();
  job.lastError = null;
  job.durationMs = Date.now() - started;
  delete job._startedAtMs;
  saveJobs(data);
}

function markJobFailure(key, error) {
  const data = loadJobs();
  const job = ensureJob(data, key);
  const started = Number(job._startedAtMs || Date.now());
  job.status = 'error';
  job.lastError = String(error || 'Unknown error');
  job.durationMs = Date.now() - started;
  delete job._startedAtMs;
  saveJobs(data);
}

module.exports = {
  loadJobs,
  saveJobs,
  markJobRunning,
  markJobSuccess,
  markJobFailure
};
