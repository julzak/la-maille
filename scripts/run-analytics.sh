#!/bin/bash
# Wrapper for weekly-analytics.ts — invoked by launchd (com.lamaille.weekly-analytics)
# launchd starts jobs with a minimal PATH, so we set it explicitly.

set -e
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

PROJECT_DIR="/Users/julienzakoian/Projects/la-maille"
LOG="/tmp/la-maille-analytics.log"

echo "[$(date -Iseconds)] starting weekly-analytics" >> "$LOG"
cd "$PROJECT_DIR"

if [ ! -f .env.local ]; then
  echo "[$(date -Iseconds)] FATAL: .env.local missing" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

npm exec -- tsx scripts/weekly-analytics.ts >> "$LOG" 2>&1
echo "[$(date -Iseconds)] done" >> "$LOG"
