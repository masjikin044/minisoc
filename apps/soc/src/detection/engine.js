const fs = require('fs');
const { compile, matchPatterns } = require('./patterns');

function loadRules(file) {
  return compile(JSON.parse(fs.readFileSync(file, 'utf8')).rules);
}

function createEngine(db, rules) {
  const thresholds = rules.filter(r => r.type === 'threshold' || r.type === 'success_after_fail');
  const stmts = new Map(thresholds.map(r => {
    const w = ['ip = @ip', 'ts >= @since'];
    const type = r.type === 'success_after_fail' ? 'login_failed' : r.event_type;
    if (type && type !== '*') w.push('type = @type');
    if (r.status) w.push('status = @status');
    if (r.status_min) w.push('status >= @smin');
    return [r.id, { type, sql: db.prepare(`SELECT COUNT(*) c FROM events WHERE ${w.join(' AND ')}`) }];
  }));
  const getCd = db.prepare('SELECT until FROM cooldowns WHERE key = ?');
  const setCd = db.prepare('INSERT OR REPLACE INTO cooldowns(key, until) VALUES (?, ?)');
  const insAlert = db.prepare(`INSERT INTO alerts(ts,rule_id,rule_name,severity,ip,description,evidence,event_id)
    VALUES (?,?,?,?,?,?,?,?)`);

  function triggers(r, ev) {
    if (r.type === 'success_after_fail') return ev.type === 'login_success';
    if (r.event_type !== '*' && r.event_type !== ev.type) return false;
    if (r.status && r.status !== ev.status) return false;
    if (r.status_min && !(ev.status >= r.status_min)) return false;
    return true;
  }

  // Dipanggil SETELAH event disimpan. Mengembalikan alert baru.
  function evaluate(ev, eventId, now = Date.now()) {
    const hits = matchPatterns(ev, rules).map(r => ({
      rule: r, evidence: String(ev.payload || ev.path || ev.ua || '').slice(0, 300),
    }));
    for (const r of thresholds) {
      if (!triggers(r, ev)) continue;
      const s = stmts.get(r.id);
      const p = { ip: ev.ip, since: now - r.window_sec * 1000 };
      if (s.type && s.type !== '*') p.type = s.type;
      if (r.status) p.status = r.status;
      if (r.status_min) p.smin = r.status_min;
      const c = s.sql.get(p).c;
      if (c >= r.count) hits.push({ rule: r, evidence: `${c} kejadian dalam ${r.window_sec} detik` });
    }
    const created = [];
    for (const h of hits) {
      const key = `${h.rule.id}|${ev.ip}`;
      const cd = getCd.get(key);
      if (cd && cd.until > now) continue; // deduplikasi / cooldown
      setCd.run(key, now + (h.rule.cooldown_sec ?? 60) * 1000);
      const info = insAlert.run(now, h.rule.id, h.rule.name, h.rule.severity, ev.ip,
        h.rule.description, h.evidence, eventId);
      created.push({ id: info.lastInsertRowid, rule_id: h.rule.id, severity: h.rule.severity });
    }
    return created;
  }
  return { evaluate };
}
module.exports = { loadRules, createEngine };
