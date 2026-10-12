const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const { loadRules, createEngine } = require('./detection/engine');

const BASE = process.env.BASE_PATH || '/soc';
const need = k => { if (!process.env[k]) { console.error(`ENV ${k} wajib diisi`); process.exit(1); } return process.env[k]; };
need('SOC_INGEST_TOKEN'); need('SESSION_SECRET');
const adminPw = need('SOC_ADMIN_PASSWORD');
if (adminPw.length < 8) { console.error('SOC_ADMIN_PASSWORD minimal 8 karakter'); process.exit(1); }

const adminUser = process.env.SOC_ADMIN_USER || 'admin';
if (!db.prepare('SELECT 1 FROM users WHERE username = ?').get(adminUser)) {
  db.prepare('INSERT INTO users(username,password_hash,created_at) VALUES (?,?,?)')
    .run(adminUser, bcrypt.hashSync(adminPw, 12), Date.now());
}

const rules = loadRules(process.env.RULES_FILE || path.join(__dirname, '..', '..', '..', 'rules', 'detection-rules.json'));
console.log(`${rules.length} rule aktif dimuat`);
const engine = createEngine(db, rules);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.get('/health', (req, res) => res.json({ ok: true, service: 'soc-api' }));
app.use('/api', require('./api/ingest')(engine)); // internal (nginx memblokir dari luar)

app.use(session({
  name: 'soc.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict', maxAge: 8 * 3600e3, path: BASE },
}));
app.use((req, res, next) => { res.set({ 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' }); next(); });
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
app.use(require('./dashboard/routes'));
app.use((req, res) => res.status(404).send('Not found'));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`SOC API listening on :${port}`));
