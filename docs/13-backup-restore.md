# 13 — Backup & Restore
```bash
make backup                                   # → backups/mini-soc-<waktu>.tar.gz
make restore FILE=backups/mini-soc-XXXX.tar.gz
```
Layanan soc-api & vulnshop dihentikan sebentar saat backup/restore agar file SQLite (mode WAL) konsisten. Salin backup ke luar VM secara berkala. Backup memuat hash password dan log; simpan dengan aman.
