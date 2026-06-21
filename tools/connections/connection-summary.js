'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const CONNECTIONS_FILE = path.join(ROOT_DIR, 'tools', 'connections', 'api-connections.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function getConnectionSummary() {
  const data = readJson(CONNECTIONS_FILE, { connections: {} });

  const connections = Object.entries(data.connections || {}).map(([key, value]) => ({
    key,
    ...value
  }));

  return {
    total: connections.length,
    enabled: connections.filter(c => c.enabled).length,
    connected: connections.filter(c => c.connected).length,
    failing: connections.filter(c => c.lastError || c.status === 'error').length,
    connections
  };
}

module.exports = {
  getConnectionSummary
};
