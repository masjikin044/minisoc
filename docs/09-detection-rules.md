# 09 — Detection Rules
Berkas: `rules/detection-rules.json` (dibaca saat soc-api start; ubah lalu `docker compose restart soc-api`).

| ID | Jenis | Severity | Pemicu |
|---|---|---|---|
| SQLI-001 | pattern | high | Pola SQL injection pada payload/path |
| XSS-001 | pattern | high | `<script`, `onerror=`, `javascript:` dll. |
| TRAV-001 | pattern | high | `../`, `/etc/passwd` |
| CMDI-001 | pattern | high | `; cat`, `&& whoami`, `$(...)` |
| SCAN-UA-001 | pattern | medium | User-Agent sqlmap/nikto/nmap/dll. |
| PATH-SENS-001 | pattern | medium | `/.env`, `/.git`, `/wp-admin`, dll. (http_error) |
| BRUTE-001 | threshold | high | ≥5 login_failed / 60 dtk / IP |
| COMP-001 | success_after_fail | critical | login_success setelah ≥3 gagal / 5 mnt |
| SCAN-404-001 | threshold | medium | ≥15 respons 404 / 60 dtk |
| ERR-5XX-001 | threshold | medium | ≥5 respons 5xx / 60 dtk |
| SPAM-001 | threshold | low | ≥10 komentar / 60 dtk |
| FLOOD-001 | threshold | medium | ≥100 event / 60 dtk |

## Deduplikasi
Setiap rule+IP punya `cooldown_sec`; alert yang sama tidak dibuat ulang selama cooldown.
## Batasan
Rule berbasis regex dan ambang sederhana: bisa false positive/negative. Payload di-decode URL (2 lapis) sebelum dicocokkan.
