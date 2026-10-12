const { DatabaseSync } = require('node:sqlite'); // bawaan Node >= 22.13
const fs = require('fs');
const path = require('path');

const dir = process.env.DATA_DIR || './data';
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, 'soc.db'));
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, source TEXT, type TEXT NOT NULL,
  ip TEXT, method TEXT, path TEXT, status INTEGER, username TEXT, payload TEXT, ua TEXT);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_ip ON events(ip, type, ts);
CREATE TABLE IF NOT EXISTS alerts(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, rule_id TEXT, rule_name TEXT,
  severity TEXT, ip TEXT, description TEXT, evidence TEXT, event_id INTEGER, incident_id INTEGER);
CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts(ts);
CREATE TABLE IF NOT EXISTS incidents(
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER, updated_at INTEGER, title TEXT,
  severity TEXT, status TEXT DEFAULT 'open', assignee TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, actor TEXT, action TEXT, target TEXT, ip TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at INTEGER);
CREATE TABLE IF NOT EXISTS cooldowns(key TEXT PRIMARY KEY, until INTEGER NOT NULL);
`);
// Pembungkus transaksi sederhana (node:sqlite tidak punya db.transaction)
db.tx = fn => (...a) => {
  db.exec('BEGIN');
  try { const r = fn(...a); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
};
module.exports = db;
