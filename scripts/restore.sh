#!/usr/bin/env bash
# Pakai: ./scripts/restore.sh backups/mini-soc-XXXX.tar.gz
set -euo pipefail
cd "$(dirname "$0")/.."
FILE="${1:?pakai: restore.sh <file.tar.gz>}"
[ -f "$FILE" ] || { echo "File tidak ada: $FILE"; exit 1; }
read -r -p "Data saat ini akan DITIMPA. Lanjut? (ketik ya): " ans
[ "$ans" = "ya" ] || { echo "Dibatalkan."; exit 1; }
docker compose stop soc-api vulnshop
trap 'docker compose start soc-api vulnshop' EXIT
docker run --rm -v mini-soc-soc-data:/s -v mini-soc-vulnshop-data:/v -v "$PWD/$FILE":/b.tar.gz:ro alpine \
  sh -c "mkdir -p /t && tar xzf /b.tar.gz -C /t && rm -rf /s/* /v/* && cp -a /t/soc/. /s/ && cp -a /t/vulnshop/. /v/ && chown -R 1000:1000 /s /v"
echo "Restore selesai dari $FILE"
