const express = require('express');
const { db } = require('../db');
const { emit } = require('../services/events');
const r = express.Router();

r.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  res.render('index', { products, user: req.session.user, q: '' });
});

r.get('/search', (req, res) => {
  const q = String(req.query.q || '').slice(0, 200);
  emit(req, 'search', { payload: q, status: 200 });
  // Query berparameter: input tidak pernah disambung ke SQL
  const products = db.prepare('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?')
    .all(`%${q}%`, `%${q}%`);
  res.render('index', { products, user: req.session.user, q });
});

r.get('/product/:id(\\d+)', (req, res, next) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return next();
  const comments = db.prepare('SELECT * FROM comments WHERE product_id = ? ORDER BY id DESC LIMIT 50').all(p.id);
  res.render('product', { p, comments, user: req.session.user, q: '' });
});

r.post('/product/:id(\\d+)/comment', (req, res, next) => {
  const p = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!p) return next();
  const author = String(req.body.author || 'anon').slice(0, 40);
  const body = String(req.body.body || '').slice(0, 500);
  emit(req, 'comment', { payload: `${author} | ${body}`, status: 302 });
  if (body.trim()) {
    // Disimpan apa adanya; di-escape saat ditampilkan (EJS <%= %>)
    db.prepare('INSERT INTO comments(product_id,author,body,created_at) VALUES (?,?,?,?)')
      .run(p.id, author, body, Date.now());
  }
  res.redirect(`/product/${p.id}`);
});
module.exports = r;
