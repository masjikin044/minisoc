# 00 — Ringkasan Proyek
**Mini SOC — Web Attack Detection & Monitoring** adalah lab untuk belajar mendeteksi serangan web.

## Tujuan
- Mensimulasikan alur SOC: log → deteksi → alert → insiden → laporan.
- Menyediakan target aman (VulnShop) agar uji serangan dari Kali tidak benar-benar merusak sistem.

## Komponen
| Komponen | Fungsi |
|---|---|
| nginx | Satu-satunya pintu masuk (port 80), log JSON, rate limit |
| vulnshop | Toko demo; mencatat login, pencarian, komentar, dan error 4xx/5xx |
| soc-api | Collector + detection engine + dashboard + SQLite |

## Prinsip
Mode aman: query berparameter dan output di-escape; input berbahaya **hanya dicatat dan dideteksi**.
