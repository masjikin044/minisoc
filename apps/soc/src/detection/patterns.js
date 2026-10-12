// Logika murni (tanpa DB) agar mudah diuji.
function decode(s) {
  let o = String(s || '');
  for (let i = 0; i < 2; i++) {
    try { const d = decodeURIComponent(o.replace(/\+/g, ' ')); if (d === o) break; o = d; } catch { break; }
  }
  return o;
}
function compile(rules) {
  return rules.filter(r => r.enabled !== false)
    .map(r => (r.pattern ? { ...r, _re: new RegExp(r.pattern, 'i') } : r));
}
function values(ev, fields) {
  return fields.flatMap(f => (ev[f] ? [String(ev[f]), decode(ev[f])] : []));
}
function matchPatterns(ev, rules) {
  return rules.filter(r => r.type === 'pattern'
    && (!r.event_types || r.event_types.includes(ev.type))
    && values(ev, r.fields || ['payload', 'path']).some(v => r._re.test(v)));
}
module.exports = { decode, compile, matchPatterns };
