# Transport SaaS Platform

A fully built SaaS platform for managed passenger transport — home-to-school, workforce shuttles, contracted services and public shuttle routes.

## What Is Built

| Phase | Description | Status |
|---|---|---|
| 1 | Driver Android APK (activation, tracking, capacity) | ✅ Done |
| 2 | NestJS backend API + PostgreSQL (15 entities, 10 modules) | ✅ Done |
| 3 | Web admin portal (React + Vite + Tailwind) | ✅ Done |
| 4 | Passenger PWA + Capacitor Android APK | ✅ Done |
| 5 | Ticketing — free ticket claim, QR codes, finance orders | ✅ Done |
| 6 | API keys, partner API, CSV exports, audit log | ✅ Done |
| 7 | Boarding validation, stop ETAs, GTFS export, real QR codes | ✅ Done |

## Repository Structure

```
transport-saas-platform/
├── apps/
│   ├── passenger-app/          React + Vite PWA + Capacitor Android
│   └── web-portal/             React + Vite admin portal
├── backend/
│   └── api/                    NestJS REST API
├── docs/                       All documentation
├── docker/                     Docker Compose files (see docs/10-docker.md)
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend/api
cp .env.example .env          # edit DB_PASSWORD, JWT_SECRET, ACTIVATION_TOKEN_SECRET
npm install
npm run start:dev
```

Backend runs at `http://localhost:3000`.

### 2. Web Portal

```bash
cd apps/web-portal
npm install
npm run dev
```

Portal runs at `http://localhost:5173`. All `/api` calls are proxied to the backend.

### 3. Passenger App (PWA)

```bash
cd apps/passenger-app
npm install
npm run dev
```

PWA runs at `http://localhost:5174`.

### 4. Passenger App (Android APK)

See [docs/03-passenger-app.md](docs/03-passenger-app.md) for the full APK build guide.

## Documentation Index

| File | Contents |
|---|---|
| [01-product-overview.md](docs/01-product-overview.md) | Platform purpose, roles, user flows |
| [02-driver-app.md](docs/02-driver-app.md) | Driver Android APK — setup and build steps |
| [03-passenger-app.md](docs/03-passenger-app.md) | Passenger app — PWA dev and Android APK build |
| [04-web-portal.md](docs/04-web-portal.md) | Web portal — setup, modules, pages |
| [05-backend-api.md](docs/05-backend-api.md) | Backend API reference — all endpoints |
| [06-database-schema.md](docs/06-database-schema.md) | Database tables and entity descriptions |
| [07-ticketing.md](docs/07-ticketing.md) | Ticketing, orders, QR validation |
| [08-tracking.md](docs/08-tracking.md) | Live tracking, driver sessions, ETAs |
| [09-github-vscode-setup.md](docs/09-github-vscode-setup.md) | Local dev setup, VS Code, Git |
| [10-docker.md](docs/10-docker.md) | Docker Compose setup and config options |
| [11-roadmap.md](docs/11-roadmap.md) | Phase roadmap and feature checklist |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeORM, PostgreSQL, JWT, class-validator |
| Web Portal | React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5 |
| Passenger App | React 19, Vite, Tailwind CSS v4, Capacitor Android |
| Maps | Leaflet + OpenStreetMap |
| QR Codes | qrcode (canvas) |
| CSV/GTFS | Built-in, adm-zip for GTFS |
| API Auth | JWT (portal/passenger) + SHA-256 API keys (partner) |


### Android Apps

- Kotlin
- Android Studio for final APK build
- VS Code for code editing if preferred
- REST API for data sync
- Background GPS service for driver tracking

### Web Portal

- React or Next.js
- Tailwind CSS
- MapLibre or Leaflet for live map
- Role-based access control

### Backend

- Node.js with NestJS
- PostgreSQL
- PostGIS for locations and route geometry
- Redis for live tracking/cache
- WebSockets or Server-Sent Events for live updates

### Hosting

- Docker or Podman
- GitHub repository
- CI/CD later using GitHub Actions

## Core Concept

The system has three main sides:

1. **Driver side**  
   Drivers activate the app, enter/select vehicle reg, enter name, select region, select route, select departure time, and then operate the journey.

2. **Passenger side**  
   Users save their region and route, view live buses, buy/free-claim tickets, view previous orders, see ETA, and see bus capacity.

3. **Admin side**  
   Staff manage users, routes, tickets, activation codes, driver app prefills, vehicles, tracking, finance, capacity, and API access.
