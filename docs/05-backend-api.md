# Backend API

## Objective

The Backend API powers the driver app, passenger app, web portal, live tracking, ticketing, finance and third-party integrations.

## Recommended Backend

```text
Node.js + NestJS
PostgreSQL + PostGIS
Redis
JWT authentication
REST API
WebSockets or Server-Sent Events
```

## API Areas

```text
/auth
/users
/roles
/regions
/routes
/stops
/departures
/driver-app
/driver-sessions
/tracking
/capacity
/passenger
/tickets
/orders
/finance
/api-keys
/reports
```

## Driver App API

### Validate Activation Code

```http
POST /driver-app/activate
```

Request:

```json
{
  "code": "ABC123",
  "deviceId": "android-device-id"
}
```

Response:

```json
{
  "activationToken": "token",
  "organisationId": "org_001",
  "allowedRegions": [],
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

### Get Vehicle Prefill List

```http
GET /driver-app/vehicles
```

Response:

```json
[
  {
    "vehicleId": "veh_001",
    "registration": "AB12 CDE",
    "regionId": "reg_001",
    "status": "active"
  }
]
```

### Submit Driver Details

```http
POST /driver-app/driver-details
```

Request:

```json
{
  "activationToken": "token",
  "driverName": "John Smith",
  "vehicleRegistration": "AB12 CDE"
}
```

### Get Regions

```http
GET /driver-app/regions
```

### Get Routes by Region

```http
GET /driver-app/regions/{regionId}/routes
```

### Get Departures by Route

```http
GET /driver-app/routes/{routeId}/departures?window=next-hour
```

### Create Driver Session

```http
POST /driver-sessions
```

Request:

```json
{
  "routeId": "route_001",
  "departureId": "dep_001",
  "driverName": "John Smith",
  "vehicleRegistration": "AB12 CDE"
}
```

### Send Tracking Point

```http
POST /tracking/points
```

Request:

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

### Send Capacity Update

```http
POST /capacity/update
```

Request:

```json
{
  "sessionId": "session_001",
  "capacityLevel": "medium"
}
```

### End Driver Session

```http
POST /driver-sessions/{sessionId}/end
```

## Passenger App API

### Register/Login

```http
POST /auth/register
POST /auth/login
```

### Save Passenger Region and Route

```http
POST /passenger/preferences
```

Request:

```json
{
  "regionId": "region_001",
  "routeId": "route_001"
}
```

### Get Passenger Dashboard

```http
GET /passenger/dashboard
```

Returns:

- Saved region
- Saved route
- Active vehicles
- ETA
- Capacity
- Available tickets
- Active ticket

### Get Live Vehicles for Route

```http
GET /passenger/routes/{routeId}/live
```

### Get Tickets for Route

```http
GET /passenger/routes/{routeId}/tickets
```

### Create Ticket Order

```http
POST /orders
```

Request for paid ticket:

```json
{
  "ticketProductId": "ticket_001",
  "paymentMethodId": "stripe_pm_123"
}
```

Request for free ticket:

```json
{
  "ticketProductId": "ticket_free_001"
}
```

### Get Previous Orders

```http
GET /orders/my
```

## Web Portal API

### Users

```http
GET /users
POST /users
PATCH /users/{userId}
DELETE /users/{userId}
```

### Roles

```http
GET /roles
POST /roles
PATCH /roles/{roleId}
```

### Regions

```http
GET /regions
POST /regions
PATCH /regions/{regionId}
```

### Routes

```http
GET /routes
POST /routes
PATCH /routes/{routeId}
```

### Stops

```http
GET /routes/{routeId}/stops
POST /routes/{routeId}/stops
PATCH /stops/{stopId}
DELETE /stops/{stopId}
```

### Departures

```http
GET /routes/{routeId}/departures
POST /routes/{routeId}/departures
PATCH /departures/{departureId}
DELETE /departures/{departureId}
```

### Activation Codes

```http
GET /driver-app/activation-codes
POST /driver-app/activation-codes
PATCH /driver-app/activation-codes/{codeId}
```

### Vehicle Registrations

```http
GET /driver-app/vehicle-registrations
POST /driver-app/vehicle-registrations
POST /driver-app/vehicle-registrations/import
PATCH /driver-app/vehicle-registrations/{vehicleId}
```

### Live Tracking

```http
GET /tracking/live
GET /tracking/sessions/{sessionId}
GET /tracking/history
```

### API Access

```http
GET /api-keys
POST /api-keys
PATCH /api-keys/{apiKeyId}
DELETE /api-keys/{apiKeyId}
```

## Public/Partner API

The platform should expose an API for reading live transport data.

Example endpoint:

```http
GET /api/v1/live/routes/{routeId}
```

Response:

```json
{
  "routeId": "route_001",
  "routeName": "MCR-001",
  "activeVehicles": [
    {
      "vehicleRegistration": "AB12 CDE",
      "lat": 53.4808,
      "lon": -2.2426,
      "lastUpdated": "2026-05-09T14:30:00Z",
      "capacityLevel": "medium",
      "etaMinutes": 8
    }
  ]
}
```

## Backend Task List

### Phase 1 — Core Setup

- [ ] Create backend project
- [ ] Add environment config
- [ ] Add PostgreSQL connection
- [ ] Add database migrations
- [ ] Add authentication
- [ ] Add roles/permissions

### Phase 2 — Driver App API

- [ ] Add activation code validation
- [ ] Add vehicle prefill API
- [ ] Add region API
- [ ] Add route API
- [ ] Add departure API
- [ ] Add create driver session API
- [ ] Add tracking point API
- [ ] Add capacity update API

### Phase 3 — Web Portal API

- [ ] Add user management endpoints
- [ ] Add role/profile endpoints
- [ ] Add region management endpoints
- [ ] Add route management endpoints
- [ ] Add stop management endpoints
- [ ] Add departure management endpoints
- [ ] Add activation code management endpoints
- [ ] Add vehicle registration management endpoints

### Phase 4 — Passenger API

- [ ] Add passenger preferences
- [ ] Add live route service endpoint
- [ ] Add ticket products endpoint
- [ ] Add order creation
- [ ] Add previous orders
- [ ] Add active ticket endpoint

### Phase 5 — Realtime

- [ ] Add live tracking cache
- [ ] Add WebSocket or SSE updates
- [ ] Add live map feed
- [ ] Add ETA calculation
- [ ] Add capacity live update events

### Phase 6 — API Keys

- [ ] Add API key creation
- [ ] Add API key permission model
- [ ] Add API rate limits
- [ ] Add audit logging
