#!/usr/bin/env bash
# npm install untuk kedua aplikasi, dijalankan di container node dengan jaringan HOST
# (menghindari masalah jaringan saat 'docker build'). Pakai --force untuk install ulang.
set -euo pipefail
cd "$(dirname "$0")/.."
IMG=node:20-bookworm-slim   # sama dengan image runtime -> binary native kompatibel
for app in vulnshop soc; do
  d="apps/$app"
  if [ -d "$d/node_modules/better-sqlite3" ] && [ "${1:-}" != "--force" ]; then
    echo "[skip] $app (node_modules sudah ada)"; continue
  fi
  echo "==> npm install: $app"
  rm -rf "$d/node_modules"
  docker run --rm --network host -v "$PWD/$d":/app -w /app "$IMG" sh -c '
    npm install --omit=dev --no-audit --no-fund || {
      echo "npm gagal, coba pasang toolchain lalu ulangi...";
      apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
      && npm install --omit=dev --no-audit --no-fund; }'
done
echo "Dependensi siap."
