# Web Portal

## Overview

The web portal is the admin interface for the platform. It is a React + Vite + Tailwind CSS SPA running in the browser.

Source: `apps/web-portal/`

---

## Development Setup

### Prerequisites

- Node.js v18 or later
- Backend running at `http://localhost:3000`

### Steps

```bash
cd apps/web-portal
npm install
npm run dev
```

Portal opens at `http://localhost:5173`. No environment file is needed — the Vite dev proxy routes all `/api` calls to the backend automatically.

---

## Build for Production

```bash
cd apps/web-portal
npm run build
```

Output goes to `apps/web-portal/dist/`. Serve with Nginx or any static file server.

### Preview the production build locally

```bash
npm run preview
```

Serves the `dist/` folder at `http://localhost:4173`.

---

## Rebuild After Code Changes

The dev server auto-refreshes on save. For a production rebuild:

```bash
npm run build
```

For a TypeScript check without building:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

---

## Vite Configuration

File: `apps/web-portal/vite.config.ts`

The dev proxy is set at the bottom of the config:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
}
```

If the backend runs on a different port or host, change `http://localhost:3000` here.

---

## Environment Variables

The web portal does not use a `.env` file by default. The proxy handles all API routing in dev. In production, configure your web server to proxy `/api` to the backend.

---

## Pages and Routes

| Route | Page | Access |
|---|---|---|
| `/` | LiveTrackingPage | Live map showing all active driver sessions |
| `/regions` | RegionsPage | Create and manage regions |
| `/routes` | RoutesPage | Routes, stops, and departures |
| `/departures` | DeparturesPage | Scheduled departures per route |
| `/activation-codes` | ActivationCodesPage | Create and manage driver activation codes |
| `/vehicles` | VehiclesPage | Vehicle registrations per region |
| `/tickets` | TicketProductsPage | Ticket products (free or paid) |
| `/finance` | FinanceOrdersPage | All ticket orders, downloadable as CSV |
| `/api-keys` | ApiKeysPage | Partner API key management |
| `/reports` | ReportsPage | Tracking/finance CSV exports, GTFS ZIP download |

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI |
| Vite | Latest | Dev server + bundler |
| Tailwind CSS | v4 | Styling |
| React Router DOM | v7 | Routing |
| TanStack Query | v5 | Data fetching + caching |
| Axios | Latest | HTTP client |
| Leaflet | Latest | Maps |
| lucide-react | Latest | Icons |

---

## Serving in Production (Nginx Example)

```nginx
server {
    listen 80;
    server_name portal.example.com;

    root /var/www/web-portal/dist;
    index index.html;

    # React Router — return index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Copy `apps/web-portal/dist/` to `/var/www/web-portal/dist/` after each build.
