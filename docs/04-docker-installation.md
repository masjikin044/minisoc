# 04 — Instalasi Docker di Debian 12/13
Otomatis: `sudo ./scripts/setup-vm.sh`. Manual di bawah (ganti `$VERSION_CODENAME` otomatis sesuai versi Debian).
Ikuti panduan resmi: https://docs.docker.com/engine/install/debian/ (repo apt Docker, bukan paket `docker.io`).
Ringkas:
```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER   # login ulang
docker compose version
```

Catatan Debian 13 (trixie): ganti `bookworm`/`$VERSION_CODENAME` sesuai versi Anda di `/etc/apt/sources.list.d/docker.list`. Cara otomatis: `sudo ./scripts/setup-vm.sh`.
