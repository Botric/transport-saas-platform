# Tracking

## Overview

Live tracking records GPS positions from the driver app and displays them in the web portal and passenger app using Leaflet + OpenStreetMap.

---

## How Tracking Works

1. Driver starts a journey → a `driver_session` is created with `status = active`.
2. Driver's device POSTs a `tracking_point` every few seconds.
3. The web portal queries `/driver-sessions/active` to get live sessions and their latest positions.
4. The passenger app queries `/passenger/routes/:id/live` to get the nearest active session and the latest bus position for their route.

---

## Sending a Tracking Point

```
POST /tracking
Authorization: Activation Token (in header or body)

Body:
{
  "sessionId": "driver-session-uuid",
  "lat": 51.5074,
  "lon": -0.1278,
  "speed": 32.5,
  "heading": 270.0,
  "accuracy": 5.0,
  "batteryLevel": 84,
  "timestamp": "2025-01-20T09:15:00Z"
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| sessionId | uuid | Yes | Active driver session |
| lat | number | Yes | GPS latitude |
| lon | number | Yes | GPS longitude |
| speed | number | No | Speed in km/h |
| heading | number | No | Direction in degrees (0 = North) |
| accuracy | number | No | GPS accuracy in metres |
| batteryLevel | integer | No | 0-100 |
| timestamp | ISO 8601 | Yes | Device timestamp |

The server also records `serverTimestamp` (the time the point was received) independently of the device clock.

---

## Retrieving Tracking Data

### Admin — All points for a session

```
GET /tracking/:sessionId
Authorization: Bearer <admin-jwt>
```

### Admin — Active sessions with latest position

```
GET /driver-sessions/active
Authorization: Bearer <admin-jwt>
```

Returns:
```json
[
  {
    "id": "session-uuid",
    "driverName": "John Smith",
    "vehicleRegistration": "AB12 CDE",
    "routeName": "School Run A",
    "status": "active",
    "latestLat": 51.5074,
    "latestLon": -0.1278,
    "capacity": "medium",
    "startedAt": "2025-01-20T08:00:00Z"
  }
]
```

### Passenger — Live bus position for a route

```
GET /passenger/routes/:routeId/live
```

Returns the nearest active session on that route with:
```json
{
  "sessionId": "uuid",
  "lat": 51.5074,
  "lon": -0.1278,
  "capacity": "medium",
  "driverName": "John Smith",
  "vehicleRegistration": "AB12 CDE",
  "updatedAt": "2025-01-20T09:15:00Z"
}
```

---

## Stop ETAs

Stop ETAs are computed from the route timetable (not live GPS), so they represent the scheduled arrival time at each stop.

```
GET /driver-app/routes/:routeId/stop-etas?departureId=uuid
```

Response:
```json
[
  { "stopId": "uuid", "name": "Town Centre", "sequence": 1, "scheduledEta": "08:00" },
  { "stopId": "uuid", "name": "High Street", "sequence": 2, "scheduledEta": "08:07" },
  { "stopId": "uuid", "name": "School Gate", "sequence": 3, "scheduledEta": "08:15" }
]
```

Each ETA is `departureTime + plannedArrivalOffsetMinutes` formatted as `HH:MM`.

The passenger app displays these in an expandable panel on the live map screen.

---

## Capacity Updates

```
POST /capacity
Authorization: Activation Token

Body:
{
  "sessionId": "driver-session-uuid",
  "level": "high"
}
```

Levels: `empty`, `low`, `medium`, `high`, `full`

The web portal and passenger app show the current capacity level alongside the live bus marker.

---

## Tracking CSV Export

Admins and partners can download all tracking points as CSV.

```
GET /reports/tracking
Authorization: Bearer <admin-jwt>

GET /partner/tracking
X-API-Key: <api-key>
```

CSV columns: `sessionId`, `driverName`, `vehicleRegistration`, `routeName`, `lat`, `lon`, `speed`, `heading`, `accuracy`, `batteryLevel`, `timestamp`, `serverTimestamp`

---

## GTFS Export

The GTFS ZIP contains a static timetable derived from routes, stops and departures.

```
GET /reports/export/gtfs
Authorization: Bearer <admin-jwt>

GET /partner/export/gtfs
X-API-Key: <api-key>
```

Files included in the ZIP:

| File | Contents |
|---|---|
| `agency.txt` | Organisation details |
| `routes.txt` | All active routes |
| `stops.txt` | All route stops with GPS |
| `trips.txt` | All active departures |
| `stop_times.txt` | Per-stop scheduled times |
| `calendar.txt` | Operating days |
| `feed_info.txt` | Feed metadata |

The GTFS ZIP can be imported into journey planners such as Google Transit, OpenTripPlanner, or Transportr.
