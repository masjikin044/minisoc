#!/usr/bin/env bash
# Setup lengkap di VM Debian (12/13): Docker + .env + UFW(opsional) + jalankan.
# Pakai:  sudo ./scripts/setup-vm.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Jalankan dengan sudo."; exit 1; }
cd "$(dirname "$0")/.."
. /etc/os-release
echo "==> 1/4 Paket dasar + Docker (${PRETTY_NAME:-debian})"
apt-get update -y
apt-get install -y ca-certificates curl make openssl ufw
if ! docker compose version >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
  echo "deb [signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker
chmod +x scripts/*.sh
echo "==> 2/4 Firewall (opsional)"
IP=$(ip -4 route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
CIDR=$(ip -4 -o addr show | awk -v ip="$IP" '$4 ~ "^"ip"/" {print $4}' | head -1)
read -r -p "Aktifkan UFW (izinkan SSH & web hanya dari subnet VM, $CIDR)? (y/N): " A
if [ "${A,,}" = "y" ]; then
  NET=$(python3 -c "import ipaddress;print(ipaddress.ip_interface('$CIDR').network)" 2>/dev/null || echo "$CIDR")
  ufw default deny incoming; ufw default allow outgoing
  ufw allow from "$NET" to any port 22 proto tcp
  ufw allow from "$NET" to any port 80 proto tcp
  ufw --force enable
fi
echo "==> 3/4 .env"; ./scripts/init-env.sh
echo "==> 4/4 Jalankan"; make start
