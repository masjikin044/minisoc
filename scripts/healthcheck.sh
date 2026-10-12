#!/usr/bin/env bash
# Cek kesehatan stack. Pakai: ./scripts/healthcheck.sh [base_url]
BASE="${1:-http://127.0.0.1}"
fail=0
check() { # nama url
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$2")
  if [ "$code" = "200" ] || [ "$code" = "302" ]; then echo "[OK]   $1 ($code)"; else echo "[FAIL] $1 ($code)"; fail=1; fi
}
check "VulnShop /health" "$BASE/health"
check "Dashboard login"  "$BASE/soc/login"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST --max-time 5 "$BASE/soc/api/events")
[ "$code" = "403" ] && echo "[OK]   Ingest diblokir dari luar (403)" || { echo "[FAIL] Ingest tidak terblokir ($code)"; fail=1; }
docker compose ps --format 'table {{.Service}}\t{{.State}}\t{{.Health}}' 2>/dev/null
exit $fail
