# 02 — Prasyarat
- Server Proxmox VE dengan 1 VM Debian 12 atau 13: min 2 vCPU, 2 GB RAM, 20 GB disk.
- Satu VM/host Kali Linux di jaringan LAN yang sama (hanya untuk lab).
- Akses internet pada VM saat build (npm, image Docker).
- curl, make, openssl (`apt install curl make openssl`); Docker (docs/04 atau `scripts/setup-vm.sh`).
- Pengetahuan dasar: terminal Linux, Docker.
- Tidak perlu Node/npm di VM (build berjalan di dalam Docker). Node/npm hanya dibutuhkan jika memakai `make deps`.
- Port keluar HTTPS (443) ke Docker Hub dan registry npm dari VM.
