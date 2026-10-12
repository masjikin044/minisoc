# 12 — Troubleshooting
## Masalah build / jaringan
| Gejala | Penyebab | Solusi |
|---|---|---|
| Build gagal di langkah `npm install` (timeout/ENOTFOUND) | Build tidak bisa menjangkau registry npm | 1) Tes dari VM: `curl -sI https://registry.npmjs.org \| head -1`. 2) **`make deps`** lalu **`make up`** (memakai node_modules dari host; butuh Node/npm di VM: `apt install nodejs npm` atau nodejs 22 dari NodeSource). 3) Atau isi `NPM_REGISTRY=<mirror>` di `.env`. |
| Error `deb.debian.org ... timed out` | Versi lama Dockerfile memakai `apt` | Pakai versi terbaru proyek ini (tanpa apt). |
| `no such file: scripts/setup-vm.sh` | Zip lama | Unduh zip terbaru. |
| `docker: command not found` | Docker belum terpasang | `docs/04` atau `sudo ./scripts/setup-vm.sh` |
| Tidak ada image/container setelah `make up` | Build gagal | Baca error pertama di output build, bukan yang terakhir. |

Cek DNS/Internet dari VM: `ping -c1 1.1.1.1 && curl -sI https://registry.npmjs.org | head -1`.
Jika VM di balik proxy, atur proxy di Docker: https://docs.docker.com/engine/daemon/proxy/

## Masalah saat berjalan
| Gejala | Penyebab | Solusi |
|---|---|---|
| `make up`: "isi SOC_INGEST_TOKEN" | `.env` kosong | `make init` (atau isi manual) |
| Tidak bisa diakses dari Kali | `BIND_IP` kosong/127.0.0.1 atau UFW | Isi `BIND_IP` dengan IP LAN VM, cek UFW, lalu `docker compose up -d` |
| soc-api restart terus | Password admin < 8 karakter | Perbaiki `.env`; `docker compose logs soc-api` |
| Alert tidak muncul | Token berbeda / soc-api down | `docker compose logs vulnshop soc-api` |
| Alert tidak berulang | Cooldown rule | Tunggu `cooldown_sec` (docs/09) |
| IP di log selalu IP Docker | Akses langsung ke container | Akses lewat nginx (port 80) |
| Grafik kosong | CDN Chart.js tidak terjangkau | Periksa internet klien; tabel tetap berfungsi |
| `ExperimentalWarning: SQLite` | Normal pada Node 22 | Diabaikan (sudah disembunyikan di image) |
