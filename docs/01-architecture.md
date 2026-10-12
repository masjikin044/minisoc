# 01 — Arsitektur
```
Kali/User → nginx:80 ─┬─▶ vulnshop:3000 ──(POST + token)──▶ soc-api:8080 ─▶ SQLite (volume)
                      └─▶ /soc/  ───────────────────────────▶ soc-api (dashboard)
```
## Alur data
1. Request masuk ke nginx; nginx menimpa `X-Real-IP` dengan IP asli client.
2. VulnShop mengirim event ke `http://soc-api:8080/api/events` dengan header `X-Ingest-Token`.
3. soc-api memvalidasi, menyimpan event, mengevaluasi `rules/detection-rules.json`, menyimpan alert (dengan cooldown).
4. Dashboard (`/soc/`) membaca SQLite lewat API ber-session.

## Jaringan
Jaringan `mini-soc-net` (bridge). Hanya nginx yang mem-publish port. `/soc/api/events` diblokir di nginx (403) sehingga ingest hanya bisa dari jaringan Docker.
Catatan: jaringan tidak ditandai `internal: true` karena nginx perlu menerima trafik dari host.

## Data
Volume bernama `mini-soc-soc-data` dan `mini-soc-vulnshop-data` (bertahan saat container di-restart).

## Catatan teknis
Runtime: Node.js 22 LTS dengan `node:sqlite` bawaan (menggantikan better-sqlite3 agar build Docker tidak perlu compile native/apt). Fungsi dan skema SQLite tidak berubah.
