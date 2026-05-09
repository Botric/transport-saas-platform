# Passenger App

## Objective

The Passenger App allows users to store their region and route, view live service information, see ETAs, buy or claim tickets, and view previous orders.

The passenger app could be built as:

- Android APK
- iOS app later
- Progressive Web App
- React Native app

For early testing, a PWA may be quicker. For Android-first, create an APK after the driver app.

## Passenger Account

A passenger must have a user account.

Account fields:

| Field | Description |
|---|---|
| name | Passenger/user name |
| email | Login and receipt email |
| phone | Optional notifications |
| defaultRegionId | Stored selected region |
| defaultRouteId | Stored selected route |
| userType | Adult, parent, student, workforce user |
| status | Active, blocked, deleted |

## First-Login Flow

```text
Open app
→ Create account/login
→ Select region
→ Select route
→ Save preferences
→ Show service dashboard
```

## Stored Region and Route

The app should store against the account:

- Region
- Route
- Optional default stop
- Optional favourite departure time

This allows the user to open the app and immediately see their service.

## Passenger App Main Dashboard

Should show:

- Selected region
- Selected route
- Next scheduled departure
- Live bus location
- ETA
- Capacity level
- Buy/claim ticket button
- Active ticket
- Previous orders
- Service alerts

## Live Bus Location

The app should show:

- Vehicle location on map
- Route line if available
- ETA to selected stop
- Capacity level
- Vehicle reg if allowed
- Last updated time

## ETA

ETA can be calculated from:

- Latest GPS point
- Route geometry
- Stop order
- Scheduled departure time
- Delay against timetable

MVP can use a simple ETA:

```text
ETA = scheduled stop time + current route delay
```

Later versions can use actual map routing.

## Capacity Display

Passenger-facing capacity should be simple.

Example:

```text
Seats available
Quiet
Getting busy
Very busy
Full
```

Avoid showing exact passenger counts unless required.

## Ticketing

The passenger app should allow tickets to be:

- Paid
- Free
- Required
- Optional
- Not required for a route

A user may be able to travel without buying if the route is configured as free/no ticket required.

## Previous Orders

Passenger should be able to view:

- Order number
- Ticket name
- Route/region
- Purchase date
- Validity
- Price
- Status
- Receipt
- QR/code if applicable

## Passenger Ticket Display

Ticket screen should show:

- Ticket name
- Route validity
- Valid from/to
- QR code or barcode
- Passenger name
- Status
- Order reference

## Passenger Notifications

Possible notifications:

- Bus is nearby
- Bus is delayed
- Bus is full
- Route cancelled
- Ticket purchased
- Ticket expired soon
- Service alert

## Passenger App Task List

### Phase 1 — Account and Preferences

- [ ] Create passenger app project
- [ ] Create login/register screen
- [ ] Create region selection
- [ ] Create route selection
- [ ] Save selected region/route to user account
- [ ] Show default service dashboard

### Phase 2 — Live Service View

- [ ] Show active buses for selected route
- [ ] Show ETA
- [ ] Show vehicle capacity level
- [ ] Show last updated time
- [ ] Add map view

### Phase 3 — Tickets

- [ ] Show available ticket products for route
- [ ] Support free tickets
- [ ] Support paid tickets
- [ ] Show active ticket
- [ ] Show previous orders
- [ ] Show ticket QR/code

### Phase 4 — Notifications

- [ ] Add push notification support
- [ ] Add service alerts
- [ ] Add ticket confirmation notifications
- [ ] Add vehicle approaching notifications
