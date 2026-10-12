const test = require('node:test');
const assert = require('node:assert');
const { buildEvent } = require('../src/services/events');

test('event tidak memuat password/cookie dan field dipotong', () => {
  const req = { method: 'POST', originalUrl: '/login', headers: { 'x-real-ip': '10.0.0.5', 'user-agent': 'x', cookie: 'sid=secret' }, socket: {} };
  const ev = buildEvent(req, 'login_failed', { username: 'a'.repeat(200), password: 'rahasia', payload: 'p'.repeat(900) });
  assert.strictEqual(ev.ip, '10.0.0.5');
  assert.strictEqual(ev.username.length, 64);
  assert.strictEqual(ev.payload.length, 500);
  assert.ok(!JSON.stringify(ev).includes('secret'));
});
