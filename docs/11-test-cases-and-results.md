# 11 — Test Case & Hasil
Status awal **BELUM DIEKSEKUSI**. Isi kolom hasil setelah menjalankan `docs/10`.

| ID | Skenario | Ekspektasi | Hasil | Bukti |
|---|---|---|---|---|
| TC-01 | GET /health | 200 | ☐ | |
| TC-02 | Login benar | Event login_success, tanpa alert | ☐ | |
| TC-03 | 6× login salah | Alert BRUTE-001 (high) | ☐ | |
| TC-04 | SQLi di pencarian | Alert SQLI-001; halaman tidak error | ☐ | |
| TC-05 | SQLi di username | Alert SQLI-001; login ditolak | ☐ | |
| TC-06 | XSS di pencarian | Alert XSS-001; tampil sebagai teks | ☐ | |
| TC-07 | XSS di komentar | Alert XSS-001; tidak tereksekusi | ☐ | |
| TC-08 | Path traversal | Alert TRAV-001 | ☐ | |
| TC-09 | Command injection | Alert CMDI-001 | ☐ | |
| TC-10 | UA scanner | Alert SCAN-UA-001 | ☐ | |
| TC-11 | Path sensitif | Alert PATH-SENS-001 | ☐ | |
| TC-12 | 20× 404 | Alert SCAN-404-001 | ☐ | |
| TC-13 | Gagal lalu sukses | Alert COMP-001 (critical) | ☐ | |
| TC-14 | POST /soc/api/events dari luar | 403 | ☐ | |

Screenshot: simpan di `docs/img/` (placeholder: `tc-XX.png`).
