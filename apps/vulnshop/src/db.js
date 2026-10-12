const { DatabaseSync } = require('node:sqlite'); // bawaan Node >= 22.13, tanpa compile native
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dir = process.env.DATA_DIR || './data';
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, 'vulnshop.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, price INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, author TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL);
`);

function seed() {
  if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
    // Akun demo KHUSUS lab. Jangan dipakai di tempat lain.
    db.prepare('INSERT INTO users(username,password_hash) VALUES (?,?)')
      .run('demo', bcrypt.hashSync('demo12345', 10));
  }
  if (!db.prepare('SELECT 1 FROM products LIMIT 1').get()) {
    const ins = db.prepare('INSERT INTO products(name,description,price) VALUES (?,?,?)');
    [
      ['Keyboard Mekanik', 'Switch linear, layout 75%.', 650000],
      ['Mouse Wireless', 'Ergonomis, baterai 6 bulan.', 250000],
      ['Monitor 24 inci', 'Panel IPS 75Hz.', 1800000],
      ['Headset Gaming', 'Mic noise-cancelling.', 450000],
      ['Webcam Full HD', '1080p dengan autofokus.', 380000],
      ['SSD 512GB', 'NVMe, baca 3000MB/s.', 720000],
    ].forEach(r => ins.run(...r));
  }
}
module.exports = { db, seed };
