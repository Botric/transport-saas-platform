# Product Overview

## Purpose

The platform is a SaaS system for managing planned passenger transport. It can be used for:

- Home-to-school transport
- Workforce shuttles
- Rail replacement style transport
- Event transport
- Closed-door contracted services
- Public or semi-public shuttle services

## Main Goals

- Let drivers book onto routes using an Android app.
- Let passengers view their route and buy or claim tickets.
- Let control teams track active vehicles live.
- Let admins create routes, regions, tickets, and user accounts.
- Let finance teams report on ticket sales and service activity.
- Provide API access to read live and historic operational data.

## Core Objects

| Object | Description |
|---|---|
| Region | Area/grouping for routes, users, vehicles and services |
| Route | A service route passengers can use |
| Stop | A pickup/drop-off point on a route |
| Departure | A scheduled journey time for a route |
| Driver Session | A driver booked onto a specific route and departure |
| Vehicle | Vehicle used by the driver |
| Passenger User | User of the passenger app |
| Ticket Product | A ticket type that can be free or paid |
| Ticket Order | A passenger purchase or free claim |
| Tracking Point | GPS update from a driver app |
| Capacity Record | Current onboard/fill level for a live vehicle |
| Activation Code | One-time or reusable code used to activate the driver app |

## High-Level Workflow

### Driver Flow

1. Driver opens Android app.
2. Driver enters activation code.
3. App validates code against backend.
4. Driver selects or enters UK vehicle registration.
5. Driver enters driver name.
6. Driver selects region.
7. Driver selects route.
8. Driver selects departure time.
9. App starts tracking.
10. Driver operates journey.
11. App sends GPS, status and capacity updates.
12. Driver ends journey.

### Passenger Flow

1. Passenger creates/logs into account.
2. Passenger selects region.
3. Passenger selects route.
4. Region and route are stored against the account.
5. Passenger views live bus location and ETA.
6. Passenger buys or claims a free ticket.
7. Passenger can view current and previous orders.
8. Passenger can show a ticket QR/code if required.

### Admin Flow

1. Admin creates regions.
2. Admin creates routes and stops.
3. Admin creates route departure times.
4. Admin creates ticket products.
5. Admin creates driver app activation codes.
6. Admin manages prefilled vehicle registrations.
7. Control team monitors live drivers.
8. Finance team reviews orders, revenue and usage.
9. API users read live and historic data.

## Main User Roles

| Role | Access |
|---|---|
| Super Admin | Full platform access |
| Organisation Admin | Full access for their organisation |
| Control User | Live tracking, route status, duty/session monitoring |
| Finance User | Ticket sales, orders, payments and reports |
| Driver App Manager | Activation codes, approved vehicle regs, app settings |
| Route Planner | Regions, routes, stops and departure times |
| Ticket Manager | Ticket products and ticket rules |
| Read Only User | Dashboard and reports only |
| API User | API key based access only |

## MVP Scope

The first MVP should focus on:

- Driver Android app activation
- UK vehicle reg capture
- Driver name capture
- Region selection
- Route selection
- Departure time selection
- Live GPS tracking
- Web portal live tracking dashboard
- Route/region/departure management
- Driver app activation code management

Ticketing and passenger app can be added after the basic driver tracking loop works.
