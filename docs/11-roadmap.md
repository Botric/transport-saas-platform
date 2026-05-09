# Roadmap

## Completed Phases

All 7 build phases are complete and committed to `main`.

### Phase 1 — Driver Android APK
**Commit:** Initial scaffold

Delivered:
- `apps/driver-app/` Capacitor Android project skeleton
- Activation code entry flow
- Vehicle selection screen
- Driver name and service selection
- GPS tracking loop via backend API
- Capacity update controls
- Start / End journey buttons

---

### Phase 2 — NestJS Backend API
**Commit:** `0d8a0ee`

Delivered:
- NestJS project in `backend/api/`
- 15 TypeORM entities: organisation, user, region, route, route_stop, route_departure, driver_activation_code, vehicle_registration, driver_session, tracking_point, capacity_update, ticket_product, ticket_order, api_key, audit_log
- 12 modules: AuthModule, RegionsModule, RoutesModule, DeparturesModule, DriverAppModule, DriverSessionsModule, TrackingModule, CapacityModule, PassengerModule, TicketingModule, ApiKeysModule, ReportsModule
- JWT auth with class-validator DTOs
- `.env.example` with all required variables

---

### Phase 3 — Web Admin Portal
**Commit:** `9744b27`

Delivered:
- `apps/web-portal/` — React 19 + Vite + Tailwind CSS v4
- Pages: Live Tracking, Regions, Routes (with stops), Departures, Activation Codes, Vehicles
- Leaflet map with live bus markers
- TanStack Query v5 data fetching
- Vite dev proxy for `/api`

---

### Phase 4 — Passenger PWA + Android APK
**Commit:** included in Phase 4 work

Delivered:
- `apps/passenger-app/` — React 19 + Vite + Capacitor
- Pages: Login, Register, Setup, Dashboard, Live Map, Tickets, Settings
- Leaflet map with live bus position
- Capacitor Android project in `apps/passenger-app/android/`
- `capacitor.config.ts` for Tango app identity

---

### Phase 5 — Ticketing MVP
**Commit:** `9856bfc`

Delivered:
- Ticket products CRUD (admin)
- Free ticket claim endpoint
- Ticket orders and validity windows
- Ticket QR code display in passenger app (canvas)
- Finance orders page in web portal

---

### Phase 6 — API Keys, Partner API, Exports, Audit Log
**Commit:** `6438e30`

Delivered:
- API key management (create, revoke, list) — keys hashed with SHA-256
- Partner API endpoints: `/partner/tracking`, `/partner/finance`, `/partner/export/gtfs`
- Tracking CSV and Finance CSV export endpoints
- Audit log entity and service
- Web portal: API Keys page, Reports page (with CSV download buttons)

---

### Phase 7 — Boarding Validation, Stop ETAs, GTFS, Real QR Codes
**Commit:** `7a40925`

Delivered:
- `POST /ticketing/validate` — validates ticket against an active driver session
- `boardedAt` and `boardedSessionId` fields on ticket_order
- `GET /driver-app/routes/:id/stop-etas` — computed `HH:MM` ETAs per stop
- Stop ETAs expandable panel in passenger app live map
- GTFS ZIP export (agency, routes, stops, trips, stop_times, calendar, feed_info)
- GTFS download button in web portal Reports page
- Real QR code canvas using `qrcode` library (replacing placeholder grid)

---

## Open Items / Next Steps

| Item | Priority | Notes |
|---|---|---|
| Payment gateway integration | High | Stripe or similar — currently only free tickets work end-to-end |
| Push notifications | High | Notify passengers of delays, service changes |
| Native driver Android app (Kotlin) | Medium | Current driver flow uses backend activation API only |
| Role-based UI guards | Medium | Portal pages need role checks per user role |
| TypeORM migrations | Medium | Replace `synchronize: true` for production database management |
| Multi-tenancy isolation | Medium | Enforce organisation scoping on all queries |
| Admin user seeding | Low | First-run script to create a super admin account |
| HTTPS / TLS setup guide | Low | Document reverse proxy (Nginx/Caddy) with Certbot |
| Automated tests | Low | Unit and integration test coverage |
| React Native driver app | Future | Native alternative to Capacitor for driver app |
