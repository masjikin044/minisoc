# Mini SOC — Web Attack Detection & Monitoring

Lab SOC mini: toko online demo (**VulnShop**, mode aman) mengirim event ke **soc-api** yang menjalankan
detection rules, menyimpan alert di SQLite, dan menampilkannya di dashboard gelap. Semua di belakang
**nginx** dalam Docker Compose pada VM Debian (Proxmox). Pengujian dari Kali (lab saja).

## Jalankan (3 langkah, di VM)
Prasyarat: Docker + Compose plugin sudah terpasang (belum? `sudo ./scripts/setup-vm.sh` memasangnya, lihat `docs/04`).
```bash
make init        # membuat .env otomatis (secret acak, password admin, BIND_IP) — password ditampilkan
nano .env        # OPSIONAL: ubah SOC_ADMIN_PASSWORD / BIND_IP sesuai keinginan
make up          # build + jalankan, lalu: make health
```
- Toko: `http://<IP_VM>/`  (akun demo lab: `demo` / `demo12345`)
- Dashboard: `http://<IP_VM>/soc/`  (user `admin`, password dari `.env`)

Satu-satunya file yang perlu Anda sentuh adalah **`.env`**. Tanpa `make`: `cp .env.example .env`, isi semua nilai, lalu `docker compose up -d --build`.

## Jika build gagal karena jaringan / npm
Lihat `docs/12-troubleshooting.md`. Solusi cepat: `make deps` (npm install di host), lalu `make up`.
Build Docker tidak memakai `apt` dan tidak mengompilasi apa pun.

## Dokumentasi
Folder [`docs/`](docs/00-project-overview.md) (00–16). Deploy: 05. Pengujian: 10–11. Masalah umum: 12.

## Peringatan
Hanya untuk jaringan lab milik sendiri. Jangan ekspos ke internet. Lihat `docs/14-security-limitations.md`.
