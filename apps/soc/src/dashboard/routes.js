const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const audit = require('../audit');
const incidents = require('../incidents');
const reports = require('../reports');

const BASE = process.env.BASE_PATH || '/soc';
const page = n => fs.readFileSync(path.join(__dirname, 'pages', n), 'utf8');
const fails = new Map(); // ip -> {n, until}

const ip = req => req.ip || req.socket.remoteAddress;
const requireAuth = (req, res, next) => (req.session.user ? next()
  : (req.baseUrl.endsWith('/api') ? res.status(401).json({ error: 'login' }) : res.redirect(`${BASE}/login`)));
// Perlindungan CSRF sederhana untuk API yang mengubah data
const requireXhr = (req, res, next) => (['GET', 'HEAD'].includes(req.method)
  || req.headers['x-requested-with'] === 'fetch' ? next() : res.status(403).json({ error: 'csrf' }));
const lim = (v, d, m) => Math.min(Math.max(parseInt(v, 10) || d, 1), m);

const router = express.Router();

router.get('/login', (req, res) => res.type('html').send(page('login.html').replace('<!--ERR-->',
  req.query.e === '1' ? '<p class="err">Username atau password salah.</p>'
    : req.query.e === '2' ? '<p class="err">Terlalu banyak percobaan. Coba lagi nanti.</p>' : '')));

router.post('/login', express.urlencoded({ extended: false, limit: '2kb' }), (req, res) => {
  const f = fails.get(ip(req));
  if (f && f.until > Date.now()) { audit.log(null, 'login_locked', '', ip(req)); return res.redirect(`${BASE}/login?e=2`); }
  const username = String(req.body.username || '').slice(0, 64);
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (u && bcrypt.compareSync(String(req.body.password || '').slice(0, 128), u.password_hash)) {
    fails.delete(ip(req));
    return req.session.regenerate(() => {
      req.session.user = u.username;
      audit.log(u.username, 'login_success', '', ip(req));
      res.redirect(`${BASE}/`);
    });
  }
  const n = ((f && f.n) || 0) + 1;
  fails.set(ip(req), { n, until: n >= 5 ? Date.now() + 5 * 60e3 : 0 }); // lockout 5 menit
  audit.log(username, 'login_failed', '', ip(req));
  res.redirect(`${BASE}/login?e=1`);
});

router.post('/logout', requireAuth, (req, res) => {
  audit.log(req.session.user, 'logout', '', ip(req));
  req.session.destroy(() => res.redirect(`${BASE}/login`));
});

router.get('/', requireAuth, (req, res) => res.type('html').send(page('app.html')));

const api = express.Router();
api.use(requireAuth, requireXhr, express.json({ limit: '8kb' }));
api.get('/stats', (req, res) => res.json(reports.stats(lim(req.query.hours, 24, 720))));
api.get('/alerts', (req, res) => {
  const sev = ['low', 'medium', 'high', 'critical'].includes(req.query.severity) ? req.query.severity : null;
  res.json(db.prepare('SELECT * FROM alerts WHERE (? IS NULL OR severity = ?) ORDER BY id DESC LIMIT ?')
    .all(sev, sev, lim(req.query.limit, 100, 500)));
});
api.get('/events', (req, res) => res.json(
  db.prepare('SELECT * FROM events ORDER BY id DESC LIMIT ?').all(lim(req.query.limit, 100, 500))));
api.post('/alerts/:id/incident', (req, res) => {
  const inc = incidents.createFromAlert(parseInt(req.params.id, 10), req.session.user);
  if (!inc) return res.status(404).json({ error: 'alert tidak ada' });
  audit.log(req.session.user, 'incident_create', `incident#${inc.id}`, ip(req), `alert#${req.params.id}`);
  res.json(inc);
});
api.get('/incidents', (req, res) => res.json(incidents.list()));
api.patch('/incidents/:id', (req, res) => {
  try {
    const inc = incidents.update(parseInt(req.params.id, 10), req.body || {});
    if (!inc) return res.status(404).json({ error: 'tidak ada' });
    audit.log(req.session.user, 'incident_update', `incident#${inc.id}`, ip(req), JSON.stringify(req.body).slice(0, 200));
    res.json(inc);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
api.get('/audit', (req, res) => res.json(audit.list(200)));
api.get('/reports/alerts.csv', (req, res) => {
  audit.log(req.session.user, 'report_export', 'alerts.csv', ip(req));
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="alerts.csv"')
    .send(reports.alertsCsv(lim(req.query.hours, 24, 720)));
});
router.use('/api', api);
module.exports = router;
