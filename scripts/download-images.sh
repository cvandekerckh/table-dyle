#!/usr/bin/env bash
# Downloads restaurant images from Google Drive into public/images/.
# Image URLs are configured in images.config.json at the project root.
# Run locally: npm run download-images
# Runs automatically on Vercel before the build step.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."
CONFIG="$ROOT/images.config.json"
BASE="https://drive.google.com/uc?export=download"

mkdir -p "$ROOT/public/images"

echo "Downloading images from Google Drive..."

# Parse images.config.json with Node (already available in the Astro project)
node -e "
  const c = require('$CONFIG');
  Object.entries(c).forEach(([filename, url]) => {
    if (!filename.startsWith('_') && typeof url === 'string') {
      // Extract file ID from Drive sharing URL: /d/FILE_ID/
      const match = url.match(/\/d\/([^/]+)/);
      if (match) console.log(filename + ' ' + match[1]);
    }
  });
" | while read -r filename id; do
  curl -fsSL -o "$ROOT/public/images/$filename" "$BASE&id=$id"
  echo "  ✓ $filename"
done

echo "✓ All images downloaded to public/images/"
