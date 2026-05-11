# Tango Platform — Complete Local Test Guide

This walks you through standing everything up locally and testing every major
feature end-to-end. No Stripe or Firebase keys are needed for the core flow —
those sections are clearly marked optional.

---

## Prerequisites

| Tool | Min version | Check |
|---|---|---|
| Docker + Docker Compose | v24 / v2 | `docker compose version` |
| Node.js | 20 | `node -v` |
| npm | 10 | `npm -v` |
| Android Studio / ADB | Any | `adb version` (only needed for APK install) |

---

## 1. Start the Backend (Docker)

```bash
cd /home/botric/Documents/DEV/Tango

# Copy the docker env file
cp docker/.env.example docker/.env
```

Edit `docker/.env` — the defaults work for local testing, but set a real JWT secret:

```
APP_URL=http://localhost
JWT_SECRET=local-test-secret-change-me
```

Start the database and API:

```bash
docker compose -f docker/docker-compose.yml up db api -d
```

Wait ~10 seconds, then confirm the API is up:

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"} or HTTP 200
```

> **Note:** The `portal` service is for production. During local testing you
> run the portal with Vite dev server (step 3) so hot-reload works.

---

## 2. Run Migrations and Seed the Admin Account

```bash
cd backend/api

# Copy the backend env file
cp .env.example .env
```

Edit `backend/api/.env` to match the docker database:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=changeme
DB_NAME=transport_saas
NODE_ENV=development
JWT_SECRET=local-test-secret-change-me
ACTIVATION_TOKEN_SECRET=local-test-activation-secret
```

Then run migrations and seed:

```bash
npm install
npm run migration:run
npm run seed
```

Expected output from seed:

```
✔ Organisation "Default Organisation" created
✔ Admin user admin@example.com created
```

Default credentials:
- **Email:** `admin@example.com`
- **Password:** `Admin1234!`

---

## 3. Start the Web Portal (Dev Server)

```bash
cd /home/botric/Documents/DEV/Tango/apps/web-portal
npm install
npm run dev
```

Open **http://localhost:5173** in a browser.

### ✅ Test: Login

1. Go to `http://localhost:5173/login`
2. Enter `admin@example.com` / `Admin1234!`
3. You should land on the Live Tracking dashboard

---

## 4. Admin Portal — Full Walkthrough

### ✅ Regions

1. Sidebar → **Regions**
2. Create a region, e.g. `London North`
3. Confirm it appears in the table

### ✅ Routes

1. Sidebar → **Routes**
2. Create a route under `London North`, e.g. code `LN1`, name `City Centre Loop`
3. Add 3 stops (click the expand arrow on the route row)

### ✅ Departures

1. Sidebar → **Departures**
2. Select route `LN1`
3. Add a departure at `08:00` on weekdays
4. Confirm it appears

### ✅ Ticket Products

1. Sidebar → **Ticketing → Tickets**
2. Create a free ticket product:
   - Name: `Free Single`
   - Is Free: ✓
   - Validity: Single
   - Visible: ✓
3. Create a paid ticket product:
   - Name: `Day Pass`
   - Price: `2.50` (£2.50)
   - Is Free: ✗
   - Validity: Day

### ✅ Activation Codes

1. Sidebar → **Driver App → Activation Codes**
2. Create code `TEST01`, region = `London North`, max uses = 5
3. Note the APK download banner at the top of the page

### ✅ API Keys

1. Sidebar → **API Keys**
2. Create a key named `Test Partner Key`, scopes: `live:read`
3. **Copy the plain key shown once** — you'll use it in step 6

---

## 5. Driver App Simulation (curl)

You can simulate the entire driver journey without an Android device.

### Activate

```bash
curl -s -X POST http://localhost:3000/driver-app/activate \
  -H "Content-Type: application/json" \
  -d '{"activationCode":"TEST01","vehicleRegistration":"LN01 ABC","driverName":"Test Driver"}' \
  | jq .
```

Save the `token` and `sessionToken` from the response.

```bash
DRIVER_TOKEN="<token from response>"
```

### Start a driver session

```bash
SESSION=$(curl -s -X POST http://localhost:3000/driver-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d '{"routeId":"<routeId from step 4>","departureId":"<departureId>","vehicleRegistration":"LN01 ABC","driverName":"Test Driver"}' \
  | jq -r .id)
echo "Session: $SESSION"
```

### Send a tracking point

```bash
curl -s -X POST http://localhost:3000/tracking/points \
  -H "Content-Type: application/json" \
  -d "{\"driverSessionId\":\"$SESSION\",\"lat\":51.5074,\"lon\":-0.1278,\"accuracy\":5,\"speed\":30,\"heading\":90}"
```

### Update capacity

```bash
curl -s -X POST http://localhost:3000/capacity/update \
  -H "Content-Type: application/json" \
  -d "{\"driverSessionId\":\"$SESSION\",\"capacityLevel\":\"medium\"}"
```

### Check Live Tracking page

Reload `http://localhost:5173` — you should see the bus on the Leaflet map.

### End the session

```bash
curl -s -X POST http://localhost:3000/driver-sessions/$SESSION/end \
  -H "Authorization: Bearer $DRIVER_TOKEN"
```

---

## 6. Partner API (API Key Auth)

Use the key copied in step 4.

```bash
API_KEY="tsk_<your key>"

# Live routes
curl -s http://localhost:3000/partner/live/routes \
  -H "Authorization: Bearer $API_KEY" | jq .

# Live vehicles
curl -s http://localhost:3000/partner/live/vehicles \
  -H "Authorization: Bearer $API_KEY" | jq .

# Historical sessions (after ending the session in step 5)
curl -s "http://localhost:3000/partner/history/sessions?from=2026-01-01" \
  -H "Authorization: Bearer $API_KEY" | jq .

# Finance CSV
curl -s "http://localhost:3000/partner/export/finance" \
  -H "Authorization: Bearer $API_KEY"

# GTFS ZIP
curl -s "http://localhost:3000/partner/export/gtfs" \
  -H "Authorization: Bearer $API_KEY" -o gtfs.zip && echo "gtfs.zip downloaded"
```

---

## 7. Passenger App (Dev Server)

```bash
cd /home/botric/Documents/DEV/Tango/apps/passenger-app
npm install --no-bin-links
npm run dev
```

Open **http://localhost:5174** (Vite picks the next available port).

### ✅ Register + Login

1. Go to `/register` — create an account, e.g. `passenger@test.com`
2. Login with those credentials

### ✅ Claim a Free Ticket

1. Go to **Tickets**
2. The `Free Single` product you created should appear
3. Tap **Claim Free Ticket**
4. A QR code ticket should appear under My Tickets

### ✅ Live Map

1. Go to **Live Map**
2. If the driver session is active (step 5), the bus marker should be visible
3. Tap the bus to see stop ETAs

### ✅ Validate a Ticket (Boarding)

```bash
# Use the ticket code shown on the QR ticket
TICKET_CODE="<code from passenger app>"

curl -s -X POST http://localhost:3000/ticketing/validate \
  -H "Content-Type: application/json" \
  -d "{\"ticketCode\":\"$TICKET_CODE\",\"sessionId\":\"$SESSION\"}"
# Expected: {"valid":true, ...}
```

---

## 8. Unit Tests

```bash
cd /home/botric/Documents/DEV/Tango/backend/api
npm test -- --runInBand \
  src/auth/auth.service.spec.ts \
  src/regions/regions.service.spec.ts \
  src/ticketing/ticketing.service.spec.ts
```

Expected: **22 tests passing**, 0 failures.

---

## 9. Optional: Stripe Paid Tickets

> Requires a Stripe test account. Skip if not testing payments.

1. Get your test keys from https://dashboard.stripe.com/test/apikeys
2. Add to `backend/api/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_CHECKOUT_SUCCESS_URL=http://localhost:5174/payment/success
   STRIPE_CHECKOUT_CANCEL_URL=http://localhost:5174/payment/cancel
   ```
3. Restart the API: `docker compose -f docker/docker-compose.yml restart api`
4. In the passenger app, tap the `Day Pass` ticket → it should open a Stripe Checkout URL
5. Use Stripe test card `4242 4242 4242 4242`, any expiry/CVC
6. After payment, the ticket should appear in My Tickets
7. Check Finance page in the portal — the order should appear

---

## 10. Optional: FCM Push Notifications

> Requires a Firebase project. Skip if not testing notifications.

1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Base64-encode it:
   ```bash
   base64 -w 0 serviceAccountKey.json
   ```
3. Add to `backend/api/.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 string>
   ```
4. Restart the API
5. Log in on a real Android device with the passenger APK
6. The app will register its FCM token automatically on login
7. Test sending a notification:
   ```bash
   # Get admin JWT first
   TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Admin1234!"}' | jq -r .token)
   
   # Register a test token manually (or read from device logs)
   curl -s -X POST http://localhost:3000/notifications/token \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"token":"<FCM device token>"}'
   ```

---

## 11. Optional: APK Builds

> Requires Android Studio SDK (ANDROID_HOME set) and Java 17.

```bash
cd /home/botric/Documents/DEV/Tango
APP_URL=http://<your-local-IP>:3000 ./scripts/build-apks.sh
```

- Replace `<your-local-IP>` with your machine's LAN IP (e.g. `192.168.1.50`) so
  the Android device can reach the API over your local network.
- APKs land in `docker/apks/`
- Install on device:
  ```bash
  adb install docker/apks/tango-driver.apk
  adb install docker/apks/tango-passenger.apk
  ```

---

## Teardown

```bash
cd /home/botric/Documents/DEV/Tango
docker compose -f docker/docker-compose.yml down
# To also wipe the database volume:
docker compose -f docker/docker-compose.yml down -v
```
