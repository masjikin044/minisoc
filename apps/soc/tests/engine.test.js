const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'soc-'));
const db = require('../src/db');
const { loadRules, createEngine } = require('../src/detection/engine');
const reports = require('../src/reports');
const engine = createEngine(db, loadRules(path.join(__dirname, '../../../rules/detection-rules.json')));
const ins = db.prepare('INSERT INTO events(ts,source,type,ip,status,payload,path,ua) VALUES (?,?,?,?,?,?,?,?)');

function send(ev, now = Date.now()) {
  const id = db.tx(() => {
    const r = ins.run(now, 'test', ev.type, ev.ip, ev.status ?? null, ev.payload ?? null, ev.path ?? null, ev.ua ?? null);
    return r.lastInsertRowid;
  })();
  return engine.evaluate(ev, id, now).map(a => a.rule_id);
}

test('brute force: alert pada gagal ke-5, lalu cooldown', () => {
  const out = [];
  for (let i = 0; i < 6; i++) out.push(send({ type: 'login_failed', ip: '10.0.0.9', status: 401 }));
  assert.ok(!out.slice(0, 4).flat().includes('BRUTE-001'));
  assert.ok(out[4].includes('BRUTE-001'));
  assert.ok(!out[5].includes('BRUTE-001'));
});
test('login sukses setelah gagal -> COMP-001', () => {
  assert.ok(send({ type: 'login_success', ip: '10.0.0.9', status: 302 }).includes('COMP-001'));
});
test('SQLi memicu alert dan stats/CSV berjalan', () => {
  assert.ok(send({ type: 'search', ip: '10.0.0.7', payload: "' OR 1=1 --" }).includes('SQLI-001'));
  const s = reports.stats(24);
  assert.ok(s.alerts >= 3 && s.events >= 8);
  assert.ok(s.timeline.some(t => t.events > 0), 'bucket timeline terisi');
  assert.ok(reports.alertsCsv(24).includes('SQLI-001'));
});
test('scan 404 >= 15 memicu alert', () => {
  let hit = false;
  for (let i = 0; i < 16; i++) hit = send({ type: 'http_error', ip: '10.0.0.8', status: 404, path: '/x' + i }).includes('SCAN-404-001') || hit;
  assert.ok(hit);
});
