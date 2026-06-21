'use strict';

const crypto = require('crypto');
const { openDb, now } = require('../db/db');

function makeId() {
  return `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function auditLog({ eventType, source = 'system', entityType = null, entityId = null, message = '', payload = {} }) {
  const db = openDb();

  const row = {
    id: makeId(),
    event_type: eventType,
    source,
    entity_type: entityType,
    entity_id: entityId,
    message,
    payload_json: JSON.stringify(payload || {}),
    created_at: now()
  };

  db.prepare(`
    INSERT INTO audit_events
    (id, event_type, source, entity_type, entity_id, message, payload_json, created_at)
    VALUES
    (@id, @event_type, @source, @entity_type, @entity_id, @message, @payload_json, @created_at)
  `).run(row);

  db.close();
  return row;
}

module.exports = {
  auditLog
};
