#!/usr/bin/env bash
# Downloads restaurant images from Google Drive into public/images/.
# Run locally after a fresh checkout: npm run download-images
# Runs automatically on Vercel before the build step.
set -e

mkdir -p public/images

BASE="https://drive.google.com/uc?export=download"

echo "Downloading images from Google Drive..."
curl -fsSL -o public/images/hero.PNG           "$BASE&id=1qrtMtBSgp_jjC-r36fk2QP1so_HUiETL"
curl -fsSL -o public/images/terrasse.jpg       "$BASE&id=10QTegRfGcyEofnHoEiHwqnYy2pJeK2UR"
curl -fsSL -o public/images/interieur.PNG      "$BASE&id=137uDvSjKSRIUgSojLdwVmIMmQHahf8PI"
curl -fsSL -o public/images/puis_lumineux.jpg  "$BASE&id=1XpcNTUTVbQw7FkdBzYo7zVKO9QzAhhGG"
curl -fsSL -o public/images/exterieur.JPEG     "$BASE&id=1vKTpA3avpJJIbH9S96qPltqZjvrXspKP"
echo "✓ Images downloaded to public/images/"
