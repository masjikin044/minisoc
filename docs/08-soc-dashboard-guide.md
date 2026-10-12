# 08 — Panduan Dashboard SOC
URL: `http://<IP_VM_DEBIAN>/soc/`. Login memakai `SOC_ADMIN_USER` / `SOC_ADMIN_PASSWORD` (di-hash bcrypt). Setelah 5 kegagalan, IP dikunci 5 menit.

| Tab | Isi |
|---|---|
| Ringkasan | Kartu statistik 24 jam, grafik aktivitas, severity, IP & rule teratas |
| Alert | Daftar alert, filter severity, tombol "Buat insiden" |
| Insiden | Ubah status (open/investigating/resolved/false_positive) dan catatan |
| Audit | Jejak aksi pengguna dashboard |
| Laporan | Unduh `alerts.csv` (24 jam) |

Grafik memakai Chart.js dari CDN; jika VM tidak punya internet, kartu dan tabel tetap berfungsi.
