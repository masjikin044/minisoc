#!/usr/bin/env bash
# Backup volume SQLite. soc-api dihentikan sebentar agar file konsisten.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
STAMP=$(date +%Y%m%d-%H%M%S)
OUT="backups/mini-soc-$STAMP.tar.gz"
docker compose stop soc-api vulnshop
trap 'docker compose start soc-api vulnshop' EXIT
docker run --rm -v mini-soc-soc-data:/s -v mini-soc-vulnshop-data:/v -v "$PWD/backups":/b alpine \
  sh -c "mkdir -p /t/soc /t/vulnshop && cp -a /s/. /t/soc/ && cp -a /v/. /t/vulnshop/ && tar czf /b/mini-soc-$STAMP.tar.gz -C /t ."
echo "Backup tersimpan: $OUT"
