#!/usr/bin/env bash
# Renders tools/preview.html to site/preview.jpg (1200x630) with headless Chrome.
# Needs the local server running: python3 tools/serve.py
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
cp tools/preview.html site/_preview.html
trap 'rm -f site/_preview.html' EXIT
tmp="$(mktemp -d)"
"$CHROME" --headless=new --hide-scrollbars --user-data-dir="$tmp/profile" --window-size=1200,630 \
  --virtual-time-budget=4000 --screenshot="$tmp/preview.png" "http://localhost:${PORT:-5180}/_preview.html" >/dev/null 2>&1
ffmpeg -v error -y -i "$tmp/preview.png" -q:v 3 site/preview.jpg
echo "wrote site/preview.jpg"
