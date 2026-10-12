#!/usr/bin/env bash
# Membuat .env otomatis (secret acak, BIND_IP otomatis, password admin acak). Tidak menimpa .env yang ada.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then echo ".env sudah ada, tidak diubah."; exit 0; fi
IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1 || true)
IP=${IP:-127.0.0.1}
PW=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 14)
umask 077
cat > .env <<ENVEOF
# Ubah nilai di bawah sesuai kebutuhan, lalu jalankan: docker compose up -d
SOC_INGEST_TOKEN=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
SOC_ADMIN_USER=admin
SOC_ADMIN_PASSWORD=$PW
# IP LAN VM (agar bisa diakses dari Kali). 127.0.0.1 = hanya dari VM sendiri
BIND_IP=$IP
SERVER_NAME=_
ENVEOF
echo "================================================"
echo ".env dibuat."
echo "  Dashboard : http://$IP/soc/"
echo "  User      : admin"
echo "  Password  : $PW   (ubah di .env bila mau)"
echo "================================================"
