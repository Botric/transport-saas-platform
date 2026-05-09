# Passenger App

## Overview

The passenger app is a React + Vite Progressive Web App (PWA), also packaged as an Android APK via Capacitor. It gives passengers a live map, stop ETAs, and a ticket wallet.

Source: `apps/passenger-app/`

## Development Setup (PWA)

### Prerequisites

- Node.js v18 or later
- Backend running at `http://localhost:3000`

### Steps

```bash
cd apps/passenger-app
npm install
npm run dev
```

App is available at `http://localhost:5174`.

All calls to `/api/*` are proxied by Vite to `http://localhost:3000` — no CORS issues in development.

### Environment Variables (PWA — no .env needed)

Leave `VITE_API_URL` blank. The Vite proxy handles `/api` automatically.

```env
# .env.local (optional)
VITE_API_URL=
```

---

## Android APK Build

### Prerequisites

- Android Studio installed (tested with Panda 4, Flamingo or later)
- JDK from Android Studio's bundled JBR (Java 21) — **not** system Java
- Capacitor CLI: already installed as a dev dependency
- Backend accessible from the Android device/emulator IP

### Step 1 — Set the backend URL

The Android WebView cannot use the Vite proxy. You must point it at a real host.

```bash
# Use your machine's LAN IP if testing on a physical device
VITE_API_URL=http://192.168.1.100:3000 npm run build
```

Or edit `.env.local`:

```env
VITE_API_URL=http://192.168.1.100:3000
```

Then:

```bash
npm run build
```

This outputs to `dist/`.

### Step 2 — Sync Capacitor

```bash
npx cap sync android
```

This copies `dist/` into the Android project and updates Capacitor plugins.

### Step 3 — Fix Java version (Linux/Fedora with Java 25)

If your system Java is version 25, Gradle will fail. Use Android Studio's bundled JBR:

```bash
# Find the JBR path — example for Panda 4 on Linux:
/home/<user>/Downloads/android-studio-panda4-linux/android-studio/jbr

# Add this line to: apps/passenger-app/android/gradle.properties
org.gradle.java.home=/home/<user>/Downloads/android-studio-panda4-linux/android-studio/jbr
```

### Step 4 — Build the APK

**Option A — Android Studio:**

```
1. Open Android Studio.
2. File > Open > apps/passenger-app/android/
3. Wait for Gradle sync.
4. Build > Build Bundle(s) / APK(s) > Build APK(s).
5. APK is in: android/app/build/outputs/apk/debug/app-debug.apk
```

**Option B — Command line:**

```bash
cd apps/passenger-app/android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Step 5 — Install on device

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

Or transfer the APK file manually and install via Files on the device.

---

## Rebuilding After Code Changes

```bash
# 1. Make code changes in apps/passenger-app/src/
# 2. Rebuild the web bundle
npm run build

# 3. Sync to Android project
npx cap sync android

# 4. Rebuild APK (command line)
cd android && ./gradlew assembleDebug
```

---

## Capacitor Configuration

File: `apps/passenger-app/capacitor.config.ts`

```ts
{
  appId: 'com.tango.passenger',
  appName: 'Tango',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,      // needed if backend is HTTP during dev/testing
    backgroundColor: '#2563eb',   // Tango blue splash screen
  }
}
```

| Option | Description |
|---|---|
| `appId` | Android package name — change for production |
| `appName` | App display name |
| `webDir` | Output folder from `npm run build` (always `dist`) |
| `androidScheme` | `https` prevents mixed-content blocks |
| `allowMixedContent` | Set `true` for HTTP backends during testing; set `false` for production HTTPS |
| `backgroundColor` | Splash screen colour |

---

## App Pages

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Email + password login |
| `/register` | RegisterPage | Create passenger account |
| `/setup` | SetupPage | Choose region and route (saved to account) |
| `/` | DashboardPage | Route summary, next departure, live status, ticket button |
| `/map` | LiveMapPage | Full-screen live map with bus marker, stop ETAs panel |
| `/tickets` | TicketsPage | Active tickets with QR code, get new ticket, past orders |
| `/settings` | SettingsPage | Change region/route, account details |

---

## API Calls Made by the Passenger App

| Call | Endpoint |
|---|---|
| Register | `POST /auth/register` |
| Login | `POST /auth/login` |
| Regions | `GET /passenger/regions` |
| Routes | `GET /passenger/regions/:id/routes` |
| Departures | `GET /passenger/routes/:id/departures` |
| Live bus | `GET /passenger/routes/:id/live` |
| Stop ETAs | `GET /driver-app/routes/:id/stop-etas?departureId=` |
| Public ticket products | `GET /ticketing/public/products` |
| My tickets | `GET /ticketing/my/orders` |
| Claim free ticket | `POST /ticketing/my/claim` |
