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

### Phase 8 — Security, Payments, Notifications, Multi-tenancy, CI, Docker
**Commit:** `861b6bc`

Delivered:
- **User roles + JWT**: `UserRole` enum (super_admin, org_admin, finance, route_manager, driver_app_manager, control, api_admin, read_only); role + organisationId embedded in JWT payload
- **RolesGuard + `@Roles()` decorator**: global guard applied via `APP_GUARD`; super_admin/org_admin bypass
- **Admin seed script** (`src/database/seed.ts`): creates Default Organisation + super_admin user on first run; `npm run seed`
- **TypeORM migrations**: `data-source.ts` CLI config; `migration:run`, `migration:generate`, `migration:revert` scripts; two migration files committed
  - `1715450000000-AddUserRoleAndFcmToken` — adds `role` and `fcm_token` to users table
  - `1715460000000-AddOrganisationIdToTicketProductsAndApiKeys` — adds `organisation_id` to ticket_products and api_keys
- **Stripe Checkout payments**: `PaymentsModule` — creates Stripe Checkout Sessions; webhook handling for `checkout.session.completed`; passenger app opens checkout URL via Capacitor Browser
- **FCM push notifications**: `NotificationsModule` — firebase-admin lazy-loaded from `FIREBASE_SERVICE_ACCOUNT_BASE64`; `POST /notifications/token` and `DELETE /notifications/token`; passenger app registers/removes FCM token on auth events
- **Role-based portal UI guards**: `AuthContext` decodes JWT role + organisationId; `ProtectedRoute` redirects on missing role; sidebar nav items filtered by role; route constants `ROUTE_ROLES`, `DRIVER_ROLES`, `FINANCE_ROLES`, `API_ADMIN_ROLES`
- **Multi-tenancy organisation scoping**: all admin queries (regions, routes, departures, driver-app activation codes, driver-app vehicles, ticket products, API keys, reports finance/live/history) scoped by `organisationId` for non-super-admins
- **Organisation ownership on ticket products and API keys**: `organisationId` column on both entities; services scope list/create/update/revoke by org
- **Reports scoping**: `getLiveRoutes`, `getLiveVehicles`, `getHistoricalSessions` scope by org's route IDs; `financeExportCsv` filters orders through org's ticket products
- **Jest unit tests**: 22 tests across `auth.service.spec.ts`, `regions.service.spec.ts`, `ticketing.service.spec.ts`
- **APK build pipeline**: `scripts/build-apks.sh` — bakes `APP_URL` into both APKs via `VITE_API_URL` (passenger) and Gradle `-PAPI_BASE_URL` (driver); outputs to `docker/apks/`
- **Docker setup**: portal `Dockerfile` (multi-stage Vite → nginx); `docker-compose.yml` — all three services (db, api, portal) + `./apks` volume served at `/apks/`; nginx proxies `/api/` and serves `/apks/` with correct MIME type
- **APK download banners in portal**: Driver App APK download in Activation Codes page; Passenger App APK download in Ticket Products page

---

## Open Items / Next Steps

| Item | Priority | Notes |
|---|---|---|
| HTTPS / TLS setup guide | Low | Document reverse proxy (Nginx/Caddy) with Certbot for production |
| React Native driver app | Future | Native alternative to the current Kotlin driver app |
| Release (signed) APK builds | Future | `build-apks.sh` currently produces debug APKs; add keystore signing for Play Store / direct distribution |
| End-to-end tests | Future | Playwright or Detox coverage for critical flows |
