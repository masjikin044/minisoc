const express = require('express');
const session = require('express-session');
const path = require('path');
const { seed } = require('./db');
const errorLogger = require('./middleware/errorLogger');

seed();
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'vulnshop' }));
app.use(errorLogger);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only',
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 3600e3 },
}));

app.use(require('./routes/auth'));
app.use(require('./routes/shop'));
app.use((req, res) => res.status(404).render('404', { user: req.session && req.session.user, q: '' }));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err.message);
  res.status(500).send('Terjadi kesalahan.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`VulnShop listening on :${port} (mode aman)`));
