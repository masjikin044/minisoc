const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { emit } = require('../services/events');
const r = express.Router();

r.get('/login', (req, res) => res.render('login', { user: req.session.user, error: null, q: '' }));

r.post('/login', (req, res) => {
  const username = String(req.body.username || '').slice(0, 64);
  const password = String(req.body.password || '').slice(0, 128);
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  const ok = u && bcrypt.compareSync(password, u.password_hash);
  if (!ok) {
    emit(req, 'login_failed', { username, status: 401 }); // password TIDAK dikirim
    return res.status(401).render('login', { user: null, error: 'Username atau password salah.', q: '' });
  }
  emit(req, 'login_success', { username, status: 302 });
  req.session.regenerate(() => { req.session.user = u.username; res.redirect('/'); });
});

r.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));
module.exports = r;
