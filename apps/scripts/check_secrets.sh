#!/usr/bin/env bash
set -euo pipefail

patterns=(
  'sb_secret_'
  'SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9_.-]{20,}'
  'JWT_SECRET=[A-Za-z0-9_./+=-]{32,}'
  'postgresql://[^<[:space:]]+:[^<[:space:]]+@'
)

fail=0
for pattern in "${patterns[@]}"; do
  if grep -RInE \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=venv \
    --exclude-dir=.venv \
    --exclude-dir=__pycache__ \
    --exclude='*.pyc' \
    --exclude='check_secrets.sh' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.example' \
    "$pattern" .; then
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "Potential secret detected. Remove it or move it to a local secret store." >&2
  exit 1
fi

echo "No obvious committed secrets detected."
