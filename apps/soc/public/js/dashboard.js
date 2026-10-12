const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = t => new Date(t).toLocaleString('id-ID');
const sev = s => `<span class="badge s-${esc(s)}">${esc(s)}</span>`;
let charts = {}, tab = 'overview';

async function api(p, opt = {}) {
  const r = await fetch('api/' + p, { credentials: 'same-origin', ...opt,
    headers: { 'X-Requested-With': 'fetch', 'Content-Type': 'application/json' } });
  if (r.status === 401) { location.href = 'login'; throw new Error('login'); }
  return r.json();
}
function chart(id, cfg) {
  if (typeof Chart === 'undefined') return; // CDN tidak terjangkau (LAN offline)
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart($('#' + id), cfg);
}
const list = (a, k, v) => a.length ? `<table>${a.map(r => `<tr><td>${esc(r[k])}</td><td>${esc(r[v])}</td></tr>`).join('')}</table>` : '<p class="muted">Belum ada data.</p>';

async function overview() {
  const s = await api('stats?hours=24');
  $('#cards').innerHTML = [['Event (24j)', s.events], ['Alert (24j)', s.alerts], ['Insiden aktif', s.openIncidents],
    ['Critical/High', s.bySeverity.filter(x => ['critical', 'high'].includes(x.severity)).reduce((a, x) => a + x.c, 0)]]
    .map(([l, n]) => `<div class="card"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join('');
  const grid = '#242a33', tick = '#8a929c';
  chart('cTime', { type: 'line', data: { labels: s.timeline.map(t => new Date(t.t).getHours() + ':00'),
    datasets: [{ label: 'Event', data: s.timeline.map(t => t.events), borderColor: '#60a5fa', tension: .3 },
      { label: 'Alert', data: s.timeline.map(t => t.alerts), borderColor: '#f59e0b', tension: .3 }] },
    options: { plugins: { legend: { labels: { color: tick } } }, scales: { x: { ticks: { color: tick }, grid: { color: grid } }, y: { beginAtZero: true, ticks: { color: tick }, grid: { color: grid } } } } });
  const col = { critical: '#ef4444', high: '#f59e0b', medium: '#60a5fa', low: '#4ade80' };
  chart('cSev', { type: 'doughnut', data: { labels: s.bySeverity.map(x => x.severity),
    datasets: [{ data: s.bySeverity.map(x => x.c), backgroundColor: s.bySeverity.map(x => col[x.severity]), borderColor: '#14181e' }] },
    options: { plugins: { legend: { labels: { color: tick } } } } });
  $('#topIps').innerHTML = list(s.topIps, 'ip', 'c');
  $('#topRules').innerHTML = list(s.topRules, 'name', 'c');
}
async function alerts() {
  const f = $('#sevFilter').value;
  const a = await api('alerts?limit=100' + (f ? '&severity=' + f : ''));
  $('#tAlerts').innerHTML = '<tr><th>Waktu</th><th>Severity</th><th>Rule</th><th>IP</th><th>Bukti</th><th></th></tr>' +
    a.map(x => `<tr><td>${fmt(x.ts)}</td><td>${sev(x.severity)}</td><td>${esc(x.rule_name)}</td><td>${esc(x.ip)}</td>
    <td><code>${esc(x.evidence)}</code></td><td>${x.incident_id ? 'INC-' + x.incident_id : `<button data-inc="${x.id}">Buat insiden</button>`}</td></tr>`).join('');
}
async function incidents() {
  const a = await api('incidents');
  const opt = (v) => ['open', 'investigating', 'resolved', 'false_positive'].map(s => `<option ${s === v ? 'selected' : ''}>${s}</option>`).join('');
  $('#tInc').innerHTML = '<tr><th>ID</th><th>Judul</th><th>Severity</th><th>Status</th><th>Catatan</th><th>Update</th></tr>' +
    a.map(x => `<tr><td>INC-${x.id}</td><td>${esc(x.title)}</td><td>${sev(x.severity)}</td>
    <td><select data-st="${x.id}">${opt(x.status)}</select></td>
    <td><input data-nt="${x.id}" value="${esc(x.notes)}" placeholder="catatan"></td><td>${fmt(x.updated_at)}</td></tr>`).join('');
}
async function audit() {
  const a = await api('audit');
  $('#tAudit').innerHTML = '<tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Target</th><th>IP</th><th>Detail</th></tr>' +
    a.map(x => `<tr><td>${fmt(x.ts)}</td><td>${esc(x.actor)}</td><td>${esc(x.action)}</td><td>${esc(x.target)}</td><td>${esc(x.ip)}</td><td>${esc(x.detail)}</td></tr>`).join('');
}
const views = { overview, alerts, incidents, audit, reports: async () => {} };
async function show(t) {
  tab = t;
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== t);
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  await views[t]();
}
$('#tabs').addEventListener('click', e => e.target.dataset.t && show(e.target.dataset.t));
$('#sevFilter').addEventListener('change', alerts);
document.addEventListener('click', async e => {
  if (e.target.dataset.inc) { await api(`alerts/${e.target.dataset.inc}/incident`, { method: 'POST', body: '{}' }); alerts(); }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.st) await api('incidents/' + t.dataset.st, { method: 'PATCH', body: JSON.stringify({ status: t.value }) });
  if (t.dataset.nt) await api('incidents/' + t.dataset.nt, { method: 'PATCH', body: JSON.stringify({ notes: t.value }) });
});
show('overview');
setInterval(() => { if (!document.activeElement || !['INPUT', 'SELECT'].includes(document.activeElement.tagName)) views[tab](); }, 10000);
