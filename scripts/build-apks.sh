#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build-apks.sh  –  Build debug APKs for both apps, baking in the API URL.
#
# Usage:
#   APP_URL=https://your-domain.com ./scripts/build-apks.sh
#
# Or set APP_URL in docker/.env before running docker-compose:
#   APP_URL=https://your-domain.com  # in docker/.env
#   docker-compose -f docker/docker-compose.yml run --rm apk-builder
#
# Output:  docker/apks/tango-driver.apk
#          docker/apks/tango-passenger.apk
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APKS_DIR="$ROOT/docker/apks"

# ── Resolve APP_URL ──────────────────────────────────────────────────────────
APP_URL="${APP_URL:-}"
if [[ -z "$APP_URL" ]]; then
  # Try loading from docker/.env
  ENV_FILE="$ROOT/docker/.env"
  if [[ -f "$ENV_FILE" ]]; then
    APP_URL="$(grep -E '^APP_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]"' || true)"
  fi
fi

if [[ -z "$APP_URL" ]]; then
  echo ""
  echo "  ERROR: APP_URL is not set."
  echo "  Set it before running this script:"
  echo "    APP_URL=https://your-domain.com ./scripts/build-apks.sh"
  echo ""
  exit 1
fi

# Strip trailing slash for consistency
APP_URL="${APP_URL%/}"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Tango APK Builder"
echo "  API URL: $APP_URL"
echo "══════════════════════════════════════════════════════"
echo ""

mkdir -p "$APKS_DIR"

# ── 1. Passenger App (Capacitor) ─────────────────────────────────────────────
echo "▶ Building Passenger App web assets..."
cd "$ROOT/apps/passenger-app"

# Install deps if node_modules missing
if [[ ! -d node_modules ]]; then
  echo "  Installing npm dependencies (--no-bin-links)..."
  npm install --no-bin-links
fi

# Build web assets with API URL baked in
VITE_API_URL="$APP_URL" node node_modules/typescript/bin/tsc -b
VITE_API_URL="$APP_URL" node node_modules/vite/dist/node/cli.js build

echo "▶ Syncing Capacitor..."
node node_modules/@capacitor/cli/bin/capacitor sync android

echo "▶ Building Passenger APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon -q

PASSENGER_APK="$ROOT/apps/passenger-app/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ -f "$PASSENGER_APK" ]]; then
  cp "$PASSENGER_APK" "$APKS_DIR/tango-passenger.apk"
  echo "  ✓ tango-passenger.apk"
else
  echo "  ✗ Passenger APK not found at expected path. Check Gradle output."
  exit 1
fi

# ── 2. Driver App (native Android) ──────────────────────────────────────────
echo ""
echo "▶ Building Driver APK..."
cd "$ROOT/apps/driver-android"
chmod +x gradlew
./gradlew assembleDebug --no-daemon -q \
  -PAPI_BASE_URL="$APP_URL"

DRIVER_APK="$ROOT/apps/driver-android/app/build/outputs/apk/debug/app-debug.apk"
if [[ -f "$DRIVER_APK" ]]; then
  cp "$DRIVER_APK" "$APKS_DIR/tango-driver.apk"
  echo "  ✓ tango-driver.apk"
else
  echo "  ✗ Driver APK not found at expected path. Check Gradle output."
  exit 1
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo "  APKs ready in docker/apks/"
echo "  Start the platform:  docker-compose -f docker/docker-compose.yml up -d"
echo "  Download links will appear in the admin portal at:"
echo "    $APP_URL/admin/driver-app    → Driver app"
echo "    $APP_URL/ticketing           → Passenger app"
echo "══════════════════════════════════════════════════════"
echo ""
