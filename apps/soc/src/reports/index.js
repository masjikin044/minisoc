const db = require('../db');

function stats(hours = 24) {
  const since = Date.now() - hours * 3600e3;
  const one = (sql, ...p) => db.prepare(sql).get(...p);
  const all = (sql, ...p) => db.prepare(sql).all(...p);
  const bucket = 3600e3;
  const tl = (table) => Object.fromEntries(all(
    `SELECT (ts/${bucket})*${bucket} b, COUNT(*) c FROM ${table} WHERE ts >= ? GROUP BY b`, since).map(r => [r.b, r.c]));
  const ev = tl('events'), al = tl('alerts');
  const start = Math.floor(since / bucket) * bucket;
  const timeline = [];
  for (let t = start; t <= Date.now(); t += bucket) timeline.push({ t, events: ev[t] || 0, alerts: al[t] || 0 });
  return {
    hours,
    events: one('SELECT COUNT(*) c FROM events WHERE ts >= ?', since).c,
    alerts: one('SELECT COUNT(*) c FROM alerts WHERE ts >= ?', since).c,
    openIncidents: one("SELECT COUNT(*) c FROM incidents WHERE status IN ('open','investigating')").c,
    bySeverity: all('SELECT severity, COUNT(*) c FROM alerts WHERE ts >= ? GROUP BY severity', since),
    topIps: all('SELECT ip, COUNT(*) c FROM alerts WHERE ts >= ? GROUP BY ip ORDER BY c DESC LIMIT 5', since),
    topRules: all('SELECT rule_name name, COUNT(*) c FROM alerts WHERE ts >= ? GROUP BY rule_id ORDER BY c DESC LIMIT 5', since),
    timeline,
  };
}
const csvCell = v => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah CSV/formula injection
  return `"${s.replace(/"/g, '""')}"`;
};
function alertsCsv(hours = 24) {
  const rows = db.prepare('SELECT * FROM alerts WHERE ts >= ? ORDER BY id DESC').all(Date.now() - hours * 3600e3);
  const cols = ['id', 'ts', 'rule_id', 'rule_name', 'severity', 'ip', 'evidence', 'incident_id'];
  return [cols.join(',')].concat(rows.map(r =>
    cols.map(c => csvCell(c === 'ts' ? new Date(r.ts).toISOString() : r[c])).join(','))).join('\n');
}
module.exports = { stats, alertsCsv, csvCell };
