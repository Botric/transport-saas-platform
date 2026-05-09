# Transport SaaS Platform

A SaaS platform for home-to-school transport, workforce transport, shuttle services, contracted transport, and passenger route management.

The platform includes:

- Driver Android app
- Passenger app
- Web admin portal
- Live tracking dashboard
- Route and region management
- Ticketing and free travel support
- Vehicle capacity tracking
- Driver activation codes
- Finance tools
- API access
- Historical data and reporting

## Main Build Priority

The first focus is to build working Android APK files, starting with the Driver App.

Recommended build order:

1. Driver Android APK
2. Backend API
3. Admin Web Portal
4. Passenger App
5. Ticketing and Payments
6. Reporting and Finance
7. Public/API integrations

## Project Structure

```text
transport-saas/
├── apps/
│   ├── driver-android/
│   ├── passenger-app/
│   └── web-portal/
├── backend/
│   ├── api/
│   ├── database/
│   └── services/
├── docs/
│   ├── 01-product-overview.md
│   ├── 02-driver-app.md
│   ├── 03-passenger-app.md
│   ├── 04-web-portal.md
│   ├── 05-backend-api.md
│   ├── 06-database-schema.md
│   ├── 07-ticketing.md
│   ├── 08-tracking.md
│   ├── 09-github-vscode-setup.md
│   └── 10-roadmap.md
└── README.md
```

## Suggested Tech Stack

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
