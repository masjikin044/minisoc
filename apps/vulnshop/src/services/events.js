// Pengirim event ke soc-api. Tidak pernah mengirim password/cookie/body mentah.
const SOC_URL = process.env.SOC_URL || 'http://soc-api:8080/api/events';
const TOKEN = process.env.SOC_INGEST_TOKEN || '';

const cut = (v, n) => (v == null ? undefined : String(v).slice(0, n));

function clientIp(req) {
  // Container tidak dipublish ke host; satu-satunya pengirim adalah nginx.
  return cut(req.headers['x-real-ip'] || req.socket.remoteAddress, 64);
}

function buildEvent(req, type, extra = {}) {
  const { password, ...safe } = extra; // buang password jika terlanjur terkirim
  return {
    source: 'vulnshop',
    type,
    ip: clientIp(req),
    method: req.method,
    path: cut(req.originalUrl, 300),
    ua: cut(req.headers['user-agent'], 200),
    ...safe,
    payload: cut(safe.payload, 500),
    username: cut(safe.username, 64),
  };
}

function emit(req, type, extra) {
  const ev = buildEvent(req, type, extra);
  fetch(SOC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-ingest-token': TOKEN },
    body: JSON.stringify(ev),
    signal: AbortSignal.timeout(2000),
  }).catch(() => {}); // SOC mati tidak boleh mematikan toko
  return ev;
}
module.exports = { emit, buildEvent, clientIp };
