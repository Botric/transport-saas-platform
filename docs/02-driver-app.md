# Driver Android App

## Overview

The driver app is a React + Vite PWA wrapped in Capacitor to produce an Android APK. It lets drivers activate, select a service, and send live GPS and capacity data to the backend.

> **Note:** There is currently no dedicated `apps/driver-app` folder. The driver app logic is served from the backend driver-app API module. A native Kotlin driver app skeleton is planned; current driver interaction is handled via the backend activation flow and Android APK via a separate build if required.

## Driver App API Endpoints (No Auth Required)

| Method | Path | Purpose |
|---|---|---|
| POST | `/driver-app/activate` | Validate activation code, get session token |
| GET | `/driver-app/vehicles?regionId=` | List prefilled vehicle registrations |
| POST | `/driver-app/driver-details` | Submit driver name and vehicle |
| GET | `/driver-app/regions` | List active regions |
| GET | `/driver-app/regions/:id/routes` | List active routes for a region |
| GET | `/driver-app/routes/:id/departures` | List upcoming departures |
| GET | `/driver-app/routes/:id/stop-etas?departureId=` | List stops with scheduled ETAs |
| POST | `/tracking` | Send a GPS tracking point |
| POST | `/capacity` | Update capacity level |
| POST | `/driver-sessions` | Start a session |
| PATCH | `/driver-sessions/:id` | Update or end a session |

## Activation Code Flow

### Step 1 — Admin creates a code in the web portal

1. Log in to the web portal.
2. Go to **Activation Codes**.
3. Click **New Code**.
4. Set the code (e.g. `SCHOOL01`), an optional region, expiry and usage limit.
5. Save.

### Step 2 — Driver enters code in app

```
POST /driver-app/activate
Body: { "code": "SCHOOL01", "deviceId": "device-abc" }
```

Response includes an `activationToken` (JWT) with the allowed regions and expiry.

### Step 3 — Driver selects service

The app fetches:
- `GET /driver-app/regions`
- `GET /driver-app/regions/:id/routes`
- `GET /driver-app/routes/:id/departures`

### Step 4 — Session starts

```
POST /driver-sessions
Body: { activationToken, routeId, departureId, vehicleRegistration, driverName }
```

### Step 5 — GPS tracking

```
POST /tracking
Body: { sessionId, lat, lon, speed, heading, accuracy, batteryLevel, timestamp }
```

Sent every few seconds while the driver is active.

### Step 6 — Capacity update

```
POST /capacity
Body: { sessionId, level }
```

Level values: `empty`, `low`, `medium`, `high`, `full`

### Step 7 — End session

```
PATCH /driver-sessions/:id
Body: { status: "completed" }
```

## Boarding Ticket Validation

When a passenger shows a QR code, the driver's device can call:

```
POST /ticketing/validate
Body: { ticketCode: "ABCD1234", sessionId: "session-uuid" }
```

Response:
```json
{ "valid": true, "message": "Ticket accepted", "ticketCode": "ABCD1234", "passenger": "Jane Smith" }
```

If valid, the ticket is marked `used` with a `boardedAt` timestamp. If the sessionId is not an active session, the call is rejected — this prevents brute-force guessing.

## Stop ETAs

```
GET /driver-app/routes/:routeId/stop-etas?departureId=uuid
```

Returns all stops for the route with computed scheduled ETAs in `HH:MM` format, calculated from the departure time plus each stop's planned offset in minutes.

## Activation Code Fields

| Field | Description |
|---|---|
| code | Human-readable code the driver enters |
| status | active, used, expired, disabled |
| regionId | Optional region restriction |
| maxUses | Max number of uses (null = unlimited) |
| usedCount | Times this code has been used |
| expiresAt | Optional expiry date |
