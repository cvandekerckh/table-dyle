#!/usr/bin/env bash
# Generates public/menu.png from carte/menu.html using Chrome headless.
# Run locally: npm run generate-menu
# The output PNG is committed to git and served statically.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
HTML="$ROOT/carte/menu.html"
OUT="$ROOT/public/images/menu.png"

# Locate Chrome
CHROME=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/usr/bin/google-chrome" \
  "/usr/bin/chromium-browser" \
  "/usr/bin/chromium" \
  "google-chrome" \
  "chromium"
do
  if command -v "$candidate" &>/dev/null 2>&1 || [ -x "$candidate" ]; then
    CHROME="$candidate"
    break
  fi
done

if [ -z "$CHROME" ]; then
  echo "❌  Chrome not found. Install Google Chrome and retry."
  exit 1
fi

echo "Generating menu PNG from carte/menu.html…"
"$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --screenshot="$OUT" \
  --window-size=794,1123 \
  --hide-scrollbars \
  "file://$HTML" 2>/dev/null

echo "✓ Menu PNG saved to public/images/menu.png"
