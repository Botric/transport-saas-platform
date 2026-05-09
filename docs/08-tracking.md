# Tracking and Live Status

## Objective

The platform should track buses that have booked on through the Driver Android App.

The system should show:

- Live vehicle location
- Driver name
- Vehicle registration
- Route
- Departure time
- Capacity level
- ETA
- Last update time
- Historical tracking backlog

## Driver Session

A bus becomes live when a driver creates a session.

Session is created after driver selects:

- Vehicle registration
- Driver name
- Region
- Route
- Departure time

## Live Status Fields

| Field | Description |
|---|---|
| sessionId | Driver session ID |
| vehicleRegistration | Vehicle reg |
| driverName | Driver name |
| regionId | Region |
| routeId | Route |
| departureId | Departure |
| status | Active/completed/cancelled |
| lat | Last known latitude |
| lon | Last known longitude |
| lastUpdated | Last GPS update |
| capacityLevel | Current capacity |
| etaMinutes | ETA to next stop/selected stop |

## Tracking Point Data

Each GPS point should include:

```json
{
  "sessionId": "session_001",
  "lat": 53.4808,
  "lon": -2.2426,
  "speed": 21.3,
  "heading": 180,
  "accuracy": 7,
  "timestamp": "2026-05-09T14:30:00Z"
}
```

## Capacity Levels

Recommended levels:

```text
empty
low
medium
high
full
unknown
```

Passenger-facing labels:

```text
Empty
Seats available
Getting busy
Very busy
Full
Unknown
```

## Live Tracking Dashboard

The WebUI should show:

- Map
- Active sessions list
- Region filter
- Route filter
- Vehicle search
- Capacity filter
- Last update status
- Session detail panel

## Last Update Health

| Last GPS Update | Health |
|---|---|
| Under 1 minute | Good |
| 1-3 minutes | Warning |
| 3+ minutes | Stale |
| 10+ minutes | Lost |

## Historical Tracking

The platform should keep historic data for:

- Route performance
- Service proof
- Disputes
- Finance analysis
- Passenger ETA improvements

## Data Retention

Possible retention policy:

| Data | Retention |
|---|---|
| Live cache | Current sessions only |
| Tracking points | 90 days or configurable |
| Driver sessions | 7 years or configurable |
| Orders/finance | 7 years or legal requirement |
| Audit logs | 1-7 years configurable |

## ETA Calculation

### MVP ETA

Use timetable delay:

```text
delay = current time - expected time at current route point
ETA = planned stop time + delay
```

### Later ETA

Use map routing:

```text
Current GPS → Next stop → Remaining stops
```

Routing engines:

- OSRM
- Valhalla
- GraphHopper

## API Read Access

External systems should be able to read tracking data.

Example:

```http
GET /api/v1/live
GET /api/v1/live/regions/{regionId}
GET /api/v1/live/routes/{routeId}
GET /api/v1/history/sessions/{sessionId}
```

## Tracking Task List

### Phase 1 — Basic Tracking

- [ ] Create driver sessions table
- [ ] Create tracking points table
- [ ] Add driver app tracking endpoint
- [ ] Save last known position on session
- [ ] Show active session list in WebUI

### Phase 2 — Live Map

- [ ] Add map component
- [ ] Plot active vehicles
- [ ] Add route filter
- [ ] Add region filter
- [ ] Add vehicle detail panel
- [ ] Show last update health

### Phase 3 — Capacity

- [ ] Add capacity update endpoint
- [ ] Save latest capacity on session
- [ ] Show capacity in WebUI
- [ ] Show capacity in passenger app

### Phase 4 — ETA

- [ ] Add route stop timing data
- [ ] Calculate delay
- [ ] Calculate ETA to next stop
- [ ] Show ETA in passenger app
- [ ] Show ETA in WebUI

### Phase 5 — History

- [ ] Add historical tracking page
- [ ] Add replay journey option
- [ ] Add export tracking data
- [ ] Add API history endpoint
