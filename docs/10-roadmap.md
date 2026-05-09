# Roadmap

## Build Priority

The project should focus on Android APK files first, especially the Driver Android App.

## Phase 0 — Planning

- [ ] Confirm platform name
- [ ] Confirm if passenger app is Android APK, PWA or both
- [ ] Confirm payment provider
- [ ] Confirm map provider
- [ ] Confirm hosting method
- [ ] Confirm whether routes are public, private or mixed
- [ ] Confirm if driver login is activation-code only or account-based later

## Phase 1 — Driver App MVP

Goal: create a working Android APK that lets a driver book onto a service and send tracking.

Features:

- [ ] Activation code screen
- [ ] Vehicle reg prefill
- [ ] Manual UK reg entry
- [ ] Driver name entry
- [ ] Region selection
- [ ] Route selection
- [ ] Departure selection
- [ ] Next-hour departure default
- [ ] View more departures button
- [ ] Start journey
- [ ] Send GPS tracking
- [ ] Update capacity
- [ ] End journey

Deliverable:

```text
driver-app-debug.apk
```

## Phase 2 — Backend MVP

Goal: support Driver App.

Features:

- [ ] Activation code API
- [ ] Vehicle list API
- [ ] Regions API
- [ ] Routes API
- [ ] Departures API
- [ ] Driver session API
- [ ] Tracking API
- [ ] Capacity API

Deliverable:

```text
Working backend API with database
```

## Phase 3 — Web Portal MVP

Goal: manage the Driver App and view live services.

Features:

- [ ] User login
- [ ] User roles
- [ ] Activation code management
- [ ] Vehicle reg management
- [ ] Region management
- [ ] Route management
- [ ] Departure management
- [ ] Live tracking dashboard
- [ ] Capacity view

Deliverable:

```text
Working admin portal
```

## Phase 4 — Passenger App MVP

Goal: allow passengers to view their route and live bus.

Features:

- [ ] Passenger login/register
- [ ] Select region
- [ ] Select route
- [ ] Save preferences
- [ ] View live bus
- [ ] View ETA
- [ ] View capacity
- [ ] View service alerts

Deliverable:

```text
Passenger app or PWA
```

## Phase 5 — Ticketing MVP

Goal: support free and paid ticket products.

Features:

- [ ] Create ticket product
- [ ] Link ticket to one route
- [ ] Link ticket to many routes
- [ ] Free ticket claim
- [ ] Paid ticket purchase
- [ ] Previous orders
- [ ] Ticket QR/code
- [ ] Finance order list

Deliverable:

```text
Ticketing and orders system
```

## Phase 6 — API and Reporting

Goal: allow external systems to read data.

Features:

- [ ] API key management
- [ ] Live route API
- [ ] Live vehicle API
- [ ] Historical session API
- [ ] Finance export
- [ ] Tracking export
- [ ] Audit logs

Deliverable:

```text
Partner/API integration layer
```

## Phase 7 — Advanced Features

Possible future features:

- [ ] Route optimisation
- [ ] Stop-level ETAs
- [ ] Passenger boarding validation
- [ ] Driver document compliance
- [ ] Vehicle compliance
- [ ] QR ticket scanner in driver app
- [ ] School/parent mode
- [ ] Workforce employer dashboard
- [ ] Supplier portal
- [ ] Automated duty allocation
- [ ] GTFS/TransXChange export
- [ ] SIRI/GTFS-RT live feed
