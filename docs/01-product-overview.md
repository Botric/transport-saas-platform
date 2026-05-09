# Product Overview

## Purpose

A SaaS platform for managing planned passenger transport. Use cases include:

- Home-to-school transport
- Workforce shuttles
- Rail replacement services
- Event transport
- Contracted closed-door services
- Public or semi-public shuttle routes

## Core Objects

| Object | Description |
|---|---|
| Organisation | A company, school, authority or operator |
| Region | An area grouping routes, vehicles and drivers |
| Route | A named service passengers can use |
| Route Stop | A pickup or drop-off point on a route, with optional GPS coordinates and timetable offsets |
| Departure | A scheduled journey time for a route (days of operation + time) |
| Driver Session | A driver booked onto a specific route and departure |
| Vehicle | A vehicle registration managed by the platform |
| Activation Code | A code used to activate the driver Android app |
| Passenger User | An app or portal user account |
| Ticket Product | A ticket that can be free or paid, with validity rules |
| Ticket Order | A passenger's purchased or claimed ticket |
| Tracking Point | A GPS update sent from the driver app |
| Capacity Record | Current fill level of a live vehicle |
| API Key | A hashed key for partner/integration access |
| Audit Log | A write-operation record for compliance |

## User Roles

| Role | Access |
|---|---|
| Super Admin | Everything across all organisations |
| Organisation Admin | Full access for their organisation |
| Finance | Orders, payments, CSV exports |
| Route Manager | Regions, routes, stops, departures |
| Driver App Manager | Activation codes, vehicle registrations |
| Control | Live tracking and driver sessions |
| API Admin | API key management |
| Read Only | View-only access |

## High-Level Workflows

### Driver

1. Open Android app.
2. Enter activation code.
3. Select or enter UK vehicle registration.
4. Enter driver name.
5. Select region, route, departure.
6. Press Start Journey — app begins sending GPS.
7. Update capacity as passengers board/alight.
8. Press End Journey.

### Passenger

1. Register or log in via the app.
2. Select region and route (saved against account).
3. View live bus location and scheduled stop ETAs.
4. Claim free ticket or buy a paid ticket.
5. Show ticket QR code to the driver for boarding validation.
6. View previous orders.

### Admin (Web Portal)

1. Create regions and routes.
2. Add stops to routes with GPS coordinates and timetable offsets.
3. Create departure times and operating days.
4. Create ticket products (free or paid, single/day/week/month).
5. Create driver activation codes.
6. Add vehicle registrations.
7. Monitor live tracking dashboard.
8. Review finance orders and download CSV exports.
9. Issue API keys to partners.
10. Download GTFS feed for journey planner integration.

## Platform Components

```
transport-saas-platform/
├── backend/api/          NestJS REST API (port 3000)
├── apps/web-portal/      React admin portal (port 5173 in dev)
├── apps/passenger-app/   React PWA + Capacitor Android APK (port 5174 in dev)
└── docs/                 All documentation
```

## Completed Build Phases

| Phase | Delivered |
|---|---|
| 1 | Driver Android APK — activation, vehicle selection, GPS tracking, capacity |
| 2 | NestJS backend — 15 entities, 10 modules, PostgreSQL, JWT auth |
| 3 | Web portal — login, regions, routes, departures, live tracking, activation codes, vehicles |
| 4 | Passenger PWA + Capacitor Android APK — login, map, live tracking, ETAs |
| 5 | Ticketing — free ticket claim, ticket products, finance orders, ticket QR code |
| 6 | API keys, partner REST API, finance/tracking CSV exports, audit log, web reports UI |
| 7 | Boarding validation, stop-level ETAs, GTFS ZIP export, real QR code canvas |
