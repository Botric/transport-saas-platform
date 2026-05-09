# Backend API

## Overview

The backend is a NestJS REST API, using TypeORM + PostgreSQL, JWT authentication, and class-validator request validation.

Source: `backend/api/`

---

## Setup

### Prerequisites

- Node.js v18 or later
- PostgreSQL 14 or later running locally or via Docker
- (Optional) pgAdmin or another Postgres client

### Step 1 — Create the database

```sql
CREATE DATABASE transport_saas;
```

### Step 2 — Configure environment

```bash
cd backend/api
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password-here
DB_NAME=transport_saas

# JWT (change these for any real deployment)
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRES_IN=24h

# Activation token (for driver app)
ACTIVATION_TOKEN_SECRET=change-this-to-another-long-random-secret
ACTIVATION_TOKEN_EXPIRES_IN=12h
```

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `DB_HOST` | Postgres hostname | `localhost` or `db` (Docker) |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USERNAME` | Postgres username | `postgres` |
| `DB_PASSWORD` | Postgres password | Set a strong value |
| `DB_NAME` | Database name | `transport_saas` |
| `JWT_SECRET` | Signs JWT tokens for portal/passenger users | Set a long random string |
| `JWT_EXPIRES_IN` | JWT token lifetime | `24h`, `7d`, etc. |
| `ACTIVATION_TOKEN_SECRET` | Signs driver activation tokens | Set a long random string |
| `ACTIVATION_TOKEN_EXPIRES_IN` | Activation token lifetime | `12h` |

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Start in development mode

```bash
npm run start:dev
```

Starts NestJS with hot-reload (watch mode). TypeORM auto-migrates the schema on startup in development.

### Step 5 — Verify

```bash
curl http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'
```

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `start:dev` | `nest start --watch` | Development with hot reload |
| `build` | `nest build` | Compile to `dist/` |
| `start:prod` | `node dist/main` | Run compiled production build |
| `test` | `jest` | Unit tests |

### TypeScript Check (no build)

```bash
node node_modules/typescript/bin/tsc --noEmit
```

> **Note:** Do not use `npx tsc` — on some systems this installs the wrong package. Use the local TypeScript binary directly.

---

## API Endpoints

### Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | None | Register a new user |
| POST | `/auth/login` | None | Login, returns JWT |

### Regions

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/regions` | JWT | List all regions |
| POST | `/regions` | JWT | Create region |
| GET | `/regions/:id` | JWT | Get one region |
| PATCH | `/regions/:id` | JWT | Update region |
| DELETE | `/regions/:id` | JWT | Delete region |

### Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/routes` | JWT | List all routes |
| POST | `/routes` | JWT | Create route |
| GET | `/routes/:id` | JWT | Get one route with stops |
| PATCH | `/routes/:id` | JWT | Update route |
| DELETE | `/routes/:id` | JWT | Delete route |
| POST | `/routes/:id/stops` | JWT | Add stop to route |
| PATCH | `/routes/:id/stops/:stopId` | JWT | Update stop |
| DELETE | `/routes/:id/stops/:stopId` | JWT | Delete stop |

### Departures

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/routes/:id/departures` | JWT | List departures for route |
| POST | `/routes/:id/departures` | JWT | Create departure |
| PATCH | `/departures/:id` | JWT | Update departure |
| DELETE | `/departures/:id` | JWT | Delete departure |

### Driver App (No Auth — Activation Token Only)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/driver-app/activate` | None | Exchange activation code for token |
| GET | `/driver-app/regions` | None | List active regions |
| GET | `/driver-app/regions/:id/routes` | None | Routes in a region |
| GET | `/driver-app/routes/:id/departures` | None | Departures for a route |
| GET | `/driver-app/routes/:id/stop-etas` | None | Stop ETAs (pass `?departureId=`) |
| GET | `/driver-app/vehicles` | None | Prefilled vehicles (pass `?regionId=`) |

### Driver Sessions

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/driver-sessions` | Activation Token | Start a session |
| GET | `/driver-sessions` | JWT | List all sessions |
| GET | `/driver-sessions/active` | JWT | Live active sessions |
| PATCH | `/driver-sessions/:id` | Activation Token | Update/end session |

### Tracking

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/tracking` | Activation Token | Submit a GPS point |
| GET | `/tracking/:sessionId` | JWT | Get all points for a session |

### Capacity

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/capacity` | Activation Token | Update capacity |
| GET | `/capacity/:sessionId` | JWT | Get capacity history |

### Activation Codes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/activation-codes` | JWT | List all codes |
| POST | `/activation-codes` | JWT | Create new code |
| PATCH | `/activation-codes/:id` | JWT | Update code |
| DELETE | `/activation-codes/:id` | JWT | Delete code |

### Vehicle Registrations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/vehicles` | JWT | List vehicles |
| POST | `/vehicles` | JWT | Add vehicle |
| PATCH | `/vehicles/:id` | JWT | Update vehicle |
| DELETE | `/vehicles/:id` | JWT | Remove vehicle |

### Passenger Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/passenger/regions` | None | Public region list |
| GET | `/passenger/regions/:id/routes` | None | Routes in a region |
| GET | `/passenger/routes/:id/departures` | None | Departures for a route |
| GET | `/passenger/routes/:id/live` | None | Live bus position and capacity |

### Ticketing

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/ticketing/public/products` | None | Available ticket products |
| POST | `/ticketing/my/claim` | JWT | Claim a free ticket |
| GET | `/ticketing/my/orders` | JWT | My ticket orders |
| POST | `/ticketing/validate` | None* | Validate and board a ticket |
| GET | `/ticketing/orders` | JWT | All orders (admin) |

> `POST /ticketing/validate` is intentionally open (no JWT) — it requires a valid active `sessionId` to prevent misuse.

### API Keys

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api-keys` | JWT | List API keys |
| POST | `/api-keys` | JWT | Create key — returns plain key once |
| PATCH | `/api-keys/:id` | JWT | Update key |
| DELETE | `/api-keys/:id` | JWT | Revoke key |

### Reports

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/reports/tracking` | JWT | Tracking CSV download |
| GET | `/reports/finance` | JWT | Finance CSV download |
| GET | `/reports/export/gtfs` | JWT | GTFS ZIP download |
| GET | `/partner/tracking` | API Key | Partner tracking CSV |
| GET | `/partner/finance` | API Key | Partner finance CSV |
| GET | `/partner/export/gtfs` | API Key | Partner GTFS ZIP |

---

## CORS

CORS is enabled in `main.ts` for all origins in development:

```ts
app.enableCors();
```

For production, restrict to the portal and app origins:

```ts
app.enableCors({ origin: ['https://portal.example.com', 'https://app.example.com'] });
```

---

## Production Build

```bash
cd backend/api
npm run build
NODE_ENV=production node dist/main
```

Or use Docker — see [10-docker.md](10-docker.md).
