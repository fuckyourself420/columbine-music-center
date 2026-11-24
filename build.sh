#!/bin/bash
# Builds "Columbine Music Center.app" from this folder (no downloads needed).
set -e
cd "$(dirname "$0")"
APP="Columbine Music Center.app"
if [ ! -d "$APP" ]; then
  if [ -d "CART3R PLAYER.app" ]; then mv "CART3R PLAYER.app" "$APP"
  else cp -R node_modules/electron/dist/Electron.app "$APP"; fi
fi
R="$APP/Contents/Resources/app"
mkdir -p "$R"
cp main.js preload.js index.html package.json "$R/"
if [ ! -d "$R/node_modules/music-metadata" ]; then (cd "$R" && npm install --omit=dev); fi
plutil -replace CFBundleName -string "Columbine Music Center" "$APP/Contents/Info.plist"
plutil -replace CFBundleDisplayName -string "Columbine Music Center" "$APP/Contents/Info.plist"
codesign --force --deep --sign - "$APP"
echo "Built: $APP"
