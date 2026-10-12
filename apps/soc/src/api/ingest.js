const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const TYPES = new Set(['login_failed', 'login_success', 'search', 'comment', 'http_error']);
const TOKEN = Buffer.from(process.env.SOC_INGEST_TOKEN || '');
const cut = (v, n) => (v == null ? null : String(v).slice(0, n));

function tokenOk(h) {
  const b = Buffer.from(String(h || ''));
  return TOKEN.length > 0 && b.length === TOKEN.length && crypto.timingSafeEqual(b, TOKEN);
}

module.exports = function ingestRouter(engine) {
  const r = express.Router();
  const ins = db.prepare(`INSERT INTO events(ts,source,type,ip,method,path,status,username,payload,ua)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  r.post('/events', express.json({ limit: '16kb' }), (req, res) => {
    if (!tokenOk(req.headers['x-ingest-token'])) return res.status(401).json({ error: 'unauthorized' });
    const b = req.body || {};
    if (!TYPES.has(b.type)) return res.status(400).json({ error: 'type tidak valid' });
    const ev = {
      source: cut(b.source, 32) || 'unknown', type: b.type, ip: cut(b.ip, 64) || 'unknown',
      method: cut(b.method, 10), path: cut(b.path, 300),
      status: Number.isInteger(b.status) ? b.status : null,
      username: cut(b.username, 64), payload: cut(b.payload, 500), ua: cut(b.ua, 200),
    };
    const run = db.tx(() => {
      const id = ins.run(Date.now(), ev.source, ev.type, ev.ip, ev.method, ev.path,
        ev.status, ev.username, ev.payload, ev.ua).lastInsertRowid;
      return engine.evaluate(ev, id);
    });
    const alerts = run();
    res.status(202).json({ ok: true, alerts: alerts.length });
  });
  return r;
};
