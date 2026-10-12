# 05 — Deployment
Satu-satunya file yang perlu diedit adalah `.env`.

## Langkah
```bash
cd mini-soc
make init        # buat .env: secret acak, password admin acak, BIND_IP = IP VM (terdeteksi)
nano .env        # opsional: ganti password / BIND_IP
make config      # validasi compose
make up          # build + jalankan
make health
```
Catat password admin yang ditampilkan `make init` (juga ada di `.env`). Buka:
- Toko `http://<IP_VM>/` — Dashboard `http://<IP_VM>/soc/`

## Isi `.env`
| Variabel | Arti |
|---|---|
| `SOC_INGEST_TOKEN` | Secret antar-service (otomatis; `openssl rand -hex 32`) |
| `SESSION_SECRET` | Secret session (otomatis) |
| `SOC_ADMIN_USER` / `SOC_ADMIN_PASSWORD` | Login dashboard (password min. 8 karakter) |
| `BIND_IP` | IP LAN VM. Kosong = 127.0.0.1 (hanya dari VM sendiri) |
| `NPM_REGISTRY` | Opsional, mirror npm bila registry resmi tidak terjangkau |

## Tanpa `make`
```bash
cp .env.example .env && nano .env     # isi SEMUA nilai
docker compose up -d --build
```

## Cara otomatis penuh (termasuk install Docker)
`sudo ./scripts/setup-vm.sh`

## Operasional
| Perintah | Fungsi |
|---|---|
| `make logs` | Log semua service |
| `make ps` | Status container |
| `make down` | Hentikan (data tetap) |
| `make clean` | Hentikan **dan hapus volume** |
| `make deps` | npm install di host (alternatif jika build gagal di npm) |

## Catatan teknis build
- Image berbasis `node:22-bookworm-slim`. Database memakai `node:sqlite` bawaan Node 22, jadi **tidak ada compile native dan tidak ada `apt`** saat build.
- Build memakai `network: host` agar tidak terkena masalah DNS/firewall pada bridge Docker.
- Jika folder `apps/<app>/node_modules` ada (hasil `make deps`), Dockerfile memakainya dan tidak menjalankan `npm install` lagi.
