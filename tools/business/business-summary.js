'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const BUSINESS_FILE = path.join(ROOT_DIR, 'tools', 'business', 'business-metrics.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function sum(items) {
  return (items || []).reduce((total, item) => total + Number(item.amount || 0), 0);
}

function getBusinessSummary() {
  const data = readJson(BUSINESS_FILE, {
    currency: 'GBP',
    assumptions: {},
    revenue: [],
    costs: []
  });

  const revenueTotal = sum(data.revenue);
  const costTotal = sum(data.costs);
  const profit = revenueTotal - costTotal;

  return {
    currency: data.currency || 'GBP',
    revenueTotal,
    costTotal,
    profit,
    assumptions: data.assumptions || {},
    revenueCount: (data.revenue || []).length,
    costCount: (data.costs || []).length
  };
}

module.exports = {
  getBusinessSummary
};
