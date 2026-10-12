const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { compile, matchPatterns } = require('../src/detection/patterns');

const rules = compile(JSON.parse(fs.readFileSync(path.join(__dirname, '../../../rules/detection-rules.json'), 'utf8')).rules);
const ids = ev => matchPatterns(ev, rules).map(r => r.id);

test('SQLi terdeteksi (termasuk URL-encoded)', () => {
  assert.ok(ids({ type: 'search', payload: "x' OR 1=1 --" }).includes('SQLI-001'));
  assert.ok(ids({ type: 'search', payload: '1%20UNION%20SELECT%20null' }).includes('SQLI-001'));
});
test('XSS terdeteksi', () => assert.ok(ids({ type: 'comment', payload: '<script>alert(1)</script>' }).includes('XSS-001')));
test('Path traversal terdeteksi', () => assert.ok(ids({ type: 'http_error', path: '/../../etc/passwd' }).includes('TRAV-001')));
test('Command injection terdeteksi', () => assert.ok(ids({ type: 'search', payload: 'a; cat /etc/passwd' }).includes('CMDI-001')));
test('User-Agent scanner terdeteksi', () => assert.ok(ids({ type: 'http_error', ua: 'sqlmap/1.7', path: '/' }).includes('SCAN-UA-001')));
test('Pencarian normal tidak memicu rule', () => {
  assert.deepStrictEqual(ids({ type: 'search', payload: 'keyboard mekanik', path: '/search?q=keyboard+mekanik', ua: 'Mozilla/5.0' }), []);
});
