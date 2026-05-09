# Database Schema

## Overview

TypeORM manages the schema via entity definitions in `backend/api/src/entities/`. In development (`NODE_ENV=development`), TypeORM runs `synchronize: true` — it auto-creates and alters tables on startup. In production, use explicit migrations.

---

## Tables

### `organisation`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | Organisation name |
| slug | varchar | Unique URL slug |
| isActive | boolean | |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `user`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | varchar | Unique |
| passwordHash | varchar | bcrypt |
| name | varchar | |
| role | enum | super_admin, org_admin, finance, route_manager, driver_app_manager, control, api_admin, read_only |
| organisationId | uuid | FK → organisation |
| isActive | boolean | |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `region`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | |
| description | text | Optional |
| organisationId | uuid | FK → organisation |
| isActive | boolean | |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `route`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | |
| description | text | Optional |
| regionId | uuid | FK → region |
| isActive | boolean | |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `route_stop`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| routeId | uuid | FK → route |
| name | varchar | Stop name |
| sequence | integer | Order of stop on route |
| lat | decimal(10,7) | Optional GPS latitude |
| lon | decimal(10,7) | Optional GPS longitude |
| plannedArrivalOffsetMinutes | integer | Minutes after departure time |
| createdAt | timestamptz | |

---

### `route_departure`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| routeId | uuid | FK → route |
| departureTime | varchar | `HH:MM` format |
| operatingDays | integer[] | 0=Sun, 1=Mon, ..., 6=Sat |
| isActive | boolean | |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `driver_activation_code`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| code | varchar | Human-readable code |
| status | enum | active, used, expired, disabled |
| regionId | uuid | Optional FK → region |
| maxUses | integer | Null = unlimited |
| usedCount | integer | |
| expiresAt | timestamptz | Optional |
| organisationId | uuid | FK → organisation |
| createdAt | timestamptz | |

---

### `vehicle_registration`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| registration | varchar | UK plate format |
| regionId | uuid | FK → region |
| description | varchar | Optional label |
| isActive | boolean | |
| organisationId | uuid | FK → organisation |
| createdAt | timestamptz | |

---

### `driver_session`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| activationCodeId | uuid | FK → driver_activation_code |
| routeId | uuid | FK → route |
| departureId | uuid | FK → route_departure |
| vehicleRegistration | varchar | |
| driverName | varchar | |
| status | enum | active, completed, abandoned |
| startedAt | timestamptz | |
| endedAt | timestamptz | Nullable |
| organisationId | uuid | FK → organisation |
| createdAt | timestamptz | |

---

### `tracking_point`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| driverSessionId | uuid | FK → driver_session |
| lat | decimal(10,7) | |
| lon | decimal(10,7) | |
| speed | decimal(5,2) | km/h, nullable |
| heading | decimal(5,2) | Degrees, nullable |
| accuracy | decimal(8,2) | Metres, nullable |
| batteryLevel | integer | 0-100, nullable |
| timestamp | timestamptz | Device time |
| serverTimestamp | timestamptz | Server receive time |

---

### `capacity_update`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| driverSessionId | uuid | FK → driver_session |
| level | enum | empty, low, medium, high, full |
| timestamp | timestamptz | |
| serverTimestamp | timestamptz | |

---

### `ticket_product`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | |
| description | text | Optional |
| price | decimal(10,2) | 0 = free |
| currency | varchar | `GBP` default |
| validityType | enum | single, day, week, month |
| routeId | uuid | Optional FK → route (null = all routes) |
| regionId | uuid | Optional FK → region (null = all regions) |
| isActive | boolean | |
| organisationId | uuid | FK → organisation |
| createdAt | timestamptz | |

---

### `ticket_order`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| userId | uuid | FK → user |
| ticketProductId | uuid | FK → ticket_product |
| ticketCode | varchar | 8-char unique code for QR |
| status | enum | active, used, expired, cancelled |
| price | decimal(10,2) | Price at time of purchase |
| currency | varchar | |
| validFrom | timestamptz | |
| validUntil | timestamptz | |
| boardedAt | timestamptz | Set on successful validation |
| boardedSessionId | uuid | FK → driver_session, set on boarding |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

---

### `api_key`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | Label |
| keyHash | varchar | SHA-256 hash of plain key |
| lastFourChars | varchar | Last 4 characters for display |
| isActive | boolean | |
| organisationId | uuid | FK → organisation |
| createdAt | timestamptz | |
| updatedAt | timestamptz | |

> Plain API keys are shown once on creation and never stored.

---

### `audit_log`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| userId | uuid | FK → user, nullable (system or API key ops) |
| action | varchar | `create`, `update`, `delete`, etc. |
| entityType | varchar | Entity name |
| entityId | varchar | Affected record ID |
| details | jsonb | Before/after snapshot or extra context |
| ipAddress | varchar | Nullable |
| createdAt | timestamptz | |

---

## Entity Relationships (Summary)

```
organisation
  ├── users
  ├── regions
  │     └── routes
  │           ├── route_stops
  │           ├── route_departures
  │           └── driver_sessions
  │                 ├── tracking_points
  │                 └── capacity_updates
  ├── driver_activation_codes
  ├── vehicle_registrations
  ├── ticket_products
  │     └── ticket_orders
  │           └── users
  └── api_keys
```
