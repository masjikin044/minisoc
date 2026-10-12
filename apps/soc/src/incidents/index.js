const db = require('../db');
const STATUSES = ['open', 'investigating', 'resolved', 'false_positive'];

function createFromAlert(alertId, actor) {
  const a = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);
  if (!a) return null;
  if (a.incident_id) return db.prepare('SELECT * FROM incidents WHERE id = ?').get(a.incident_id);
  const now = Date.now();
  const info = db.prepare(`INSERT INTO incidents(created_at,updated_at,title,severity,status,assignee,notes)
    VALUES (?,?,?,?, 'open', ?, ?)`).run(now, now, `${a.rule_name} dari ${a.ip}`, a.severity, actor, '');
  db.prepare('UPDATE alerts SET incident_id = ? WHERE id = ?').run(info.lastInsertRowid, a.id);
  return db.prepare('SELECT * FROM incidents WHERE id = ?').get(info.lastInsertRowid);
}
function update(id, { status, assignee, notes }) {
  const cur = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
  if (!cur) return null;
  if (status !== undefined && !STATUSES.includes(status)) throw new Error('status tidak valid');
  db.prepare('UPDATE incidents SET status=?, assignee=?, notes=?, updated_at=? WHERE id=?').run(
    status ?? cur.status, assignee !== undefined ? String(assignee).slice(0, 64) : cur.assignee,
    notes !== undefined ? String(notes).slice(0, 2000) : cur.notes, Date.now(), id);
  return db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
}
const list = () => db.prepare('SELECT * FROM incidents ORDER BY id DESC LIMIT 200').all();
module.exports = { createFromAlert, update, list, STATUSES };
