# Web Portal

## Objective

The Web Portal is the admin and operational control interface for the platform.

It is used to manage:

- User accounts
- Profiles and permissions
- Regions
- Routes
- Stops
- Departure times
- Tickets
- Driver app activation codes
- Prefilled vehicle registrations
- Live bus tracking
- Capacity levels
- Finance
- API access
- Historical data

## Main Portal Modules

```text
Dashboard
Users & Roles
Regions
Routes
Stops
Departures
Tickets
Orders
Finance
Driver App Management
Vehicle Registrations
Live Tracking
Historical Data
API Management
Settings
```

## User Accounts and Profiles

The portal should support role-based access control.

### Example Profiles

| Profile | Access |
|---|---|
| Super Admin | Everything |
| Organisation Admin | Everything for one organisation |
| Finance | Orders, payments, reports |
| Driver App Manager | Activation codes and vehicle reg prefills |
| Route Manager | Regions, routes, stops, departures |
| Control | Live tracking and active sessions |
| Read Only | View-only dashboards |
| API Admin | API keys and webhooks |

## Driver App Management

This module controls:

- Activation codes
- Driver app settings
- Prefilled vehicle registrations
- Linked regions/routes
- Used devices
- Active driver sessions

### Activation Code Management

Admin should be able to:

- Create activation code
- Set expiry
- Set usage limit
- Restrict to region
- Restrict to organisation
- Disable code
- View usage history

### Vehicle Reg Prefill Management

Admin should be able to:

- Add vehicle reg
- Edit vehicle reg
- Disable vehicle reg
- Upload CSV of regs
- Assign reg to region/supplier
- Mark vehicle as active/inactive

## Live Tracking

The portal should show buses that have booked on through the driver app.

Live tracking should include:

- Vehicle reg
- Driver name
- Region
- Route
- Departure time
- Current location
- Last update
- Capacity level
- Session status
- Delay/ETA
- App/device status

## Capacity Levels

Control users should see current capacity for each live vehicle.

Example:

| Vehicle | Route | Capacity |
|---|---|---|
| AB12 CDE | MCR-001 | Low |
| XY12 ABC | MCR-002 | Full |

## Routes and Departures

Route management should allow:

- Create region
- Create route
- Add stops
- Add timetable/departure times
- Set route active/inactive
- Configure if ticket is required
- Assign ticket products
- Set route visibility in passenger app
- Upload/import route data

## Ticket Management

Tickets can be linked to:

- One route
- Multiple routes
- One region
- Multiple regions
- Specific dates/times
- Passenger type

Ticket can be:

- Free
- Paid
- Hidden
- Public
- Staff only
- Requires approval

## Finance Module

Finance users should be able to see:

- Ticket orders
- Paid revenue
- Free ticket claims
- Refunds
- Payment status
- Export CSV
- Export Excel
- VAT/tax if required
- Route revenue reports

## API Management

The portal should allow creation of API keys.

API user settings:

- API key name
- Allowed endpoints
- Region restrictions
- Route restrictions
- Expiry date
- Rate limits
- Active/inactive

## Historical Data

The portal should keep a backlog of:

- Driver sessions
- Tracking points
- Capacity updates
- Ticket orders
- Route selections
- Passenger app usage
- API calls
- Audit logs

## Web Portal Task List

### Phase 1 — Admin Shell

- [ ] Create web portal project
- [ ] Add login
- [ ] Add dashboard layout
- [ ] Add sidebar navigation
- [ ] Add role-based access control
- [ ] Add users page
- [ ] Add profiles/roles page

### Phase 2 — Driver App Management

- [ ] Add activation code list
- [ ] Add create activation code screen
- [ ] Add disable activation code action
- [ ] Add activation code usage history
- [ ] Add vehicle registration list
- [ ] Add CSV upload for vehicle regs
- [ ] Add region restriction to vehicle regs

### Phase 3 — Routes

- [ ] Add regions page
- [ ] Add routes page
- [ ] Add stops page
- [ ] Add route stop ordering
- [ ] Add departure time management
- [ ] Add route active/inactive setting

### Phase 4 — Live Tracking

- [ ] Add live map
- [ ] Show active driver sessions
- [ ] Show vehicle reg and driver name
- [ ] Show route and departure time
- [ ] Show capacity level
- [ ] Show last GPS update
- [ ] Add session details panel

### Phase 5 — Tickets and Finance

- [ ] Add ticket products page
- [ ] Link tickets to one or many routes
- [ ] Add free ticket option
- [ ] Add paid ticket option
- [ ] Add order list
- [ ] Add finance dashboard
- [ ] Add CSV/Excel export

### Phase 6 — API and Data

- [ ] Add API key management
- [ ] Add endpoint permission settings
- [ ] Add audit logs
- [ ] Add historical tracking viewer
