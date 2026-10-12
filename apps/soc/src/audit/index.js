const db = require('../db');
const ins = db.prepare('INSERT INTO audit(ts,actor,action,target,ip,detail) VALUES (?,?,?,?,?,?)');
const log = (actor, action, target, ip, detail) =>
  ins.run(Date.now(), actor || '-', action, target || '', ip || '', detail || '');
const list = (limit = 200) => db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT ?').all(limit);
module.exports = { log, list };
