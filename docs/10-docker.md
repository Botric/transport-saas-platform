# Docker Setup

## Overview

The `docker/` directory contains Docker Compose files for running the full platform in containers. This covers the backend API and PostgreSQL database. The web portal can optionally be served by Nginx.

---

## Quick Start (Backend + PostgreSQL)

### Step 1 — Create docker-compose.yml

Create `docker/docker-compose.yml`:

```yaml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    container_name: tango_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: transport_saas
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ../backend/api
      dockerfile: Dockerfile
    container_name: tango_api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      PORT: 3000
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: changeme
      DB_NAME: transport_saas
      JWT_SECRET: change-this-in-production
      JWT_EXPIRES_IN: 24h
      ACTIVATION_TOKEN_SECRET: change-this-too-in-production
      ACTIVATION_TOKEN_EXPIRES_IN: 12h
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

> **Security:** Replace all default passwords and secrets before deploying. Never use `changeme` in production.

### Step 2 — Create a Dockerfile for the backend

Create `backend/api/Dockerfile`:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Step 3 — Start the stack

```bash
cd docker
docker compose up -d
```

Check logs:
```bash
docker compose logs -f api
docker compose logs -f db
```

Stop the stack:
```bash
docker compose down
```

---

## Docker Compose with Web Portal (Nginx)

Add an Nginx service to serve the pre-built portal.

### Step 1 — Build the portal first

```bash
cd apps/web-portal
npm install
npm run build
# dist/ is now in apps/web-portal/dist/
```

### Step 2 — Create an Nginx config

Create `docker/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Step 3 — Add Nginx to docker-compose.yml

```yaml
  portal:
    image: nginx:alpine
    container_name: tango_portal
    restart: unless-stopped
    depends_on:
      - api
    volumes:
      - ../apps/web-portal/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
```

Then rebuild:
```bash
docker compose up -d portal
```

Portal will be at `http://localhost`.

---

## Environment Variable Options

All environment variables can be overridden at runtime:

```bash
# Override a single variable
DB_PASSWORD=my-secure-password docker compose up -d

# Or use a .env file in the docker/ directory
```

Create `docker/.env`:

```env
POSTGRES_PASSWORD=my-secure-password
JWT_SECRET=my-super-long-random-secret-at-least-32-chars
ACTIVATION_TOKEN_SECRET=another-long-random-secret
```

Then reference them in `docker-compose.yml`:

```yaml
environment:
  DB_PASSWORD: ${POSTGRES_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
  ACTIVATION_TOKEN_SECRET: ${ACTIVATION_TOKEN_SECRET}
```

---

## Useful Docker Commands

| Command | Purpose |
|---|---|
| `docker compose up -d` | Start all services in background |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop containers AND delete volumes (wipes DB) |
| `docker compose logs -f api` | Follow API logs |
| `docker compose logs -f db` | Follow database logs |
| `docker compose ps` | Show running containers |
| `docker compose restart api` | Restart just the API |
| `docker compose exec db psql -U postgres` | Open psql in the DB container |
| `docker compose build api` | Rebuild the API image |
| `docker compose pull` | Pull latest base images |

---

## Rebuilding After Code Changes

```bash
# 1. Rebuild the API image
cd docker
docker compose build api

# 2. Restart the API container
docker compose up -d api
```

Or rebuild everything:

```bash
docker compose down
docker compose build
docker compose up -d
```

---

## Production Checklist

- [ ] Change `POSTGRES_PASSWORD` to a strong value
- [ ] Change `JWT_SECRET` to a 32+ character random string
- [ ] Change `ACTIVATION_TOKEN_SECRET` to a different 32+ character random string
- [ ] Set `NODE_ENV=production`
- [ ] Put Nginx (or a load balancer) in front of the API with TLS
- [ ] Set `allowMixedContent: false` in `capacitor.config.ts` once backend is HTTPS
- [ ] Enable CORS only for your portal/app domains in `backend/api/src/main.ts`
- [ ] Use Docker secrets or a secrets manager for credentials in production

---

## Volumes

| Volume | Contents |
|---|---|
| `pgdata` | All PostgreSQL data — preserves DB across container restarts |

To reset the database completely:

```bash
docker compose down -v
docker compose up -d
```

> Warning: `down -v` deletes all data in the volume.

---

## Ports Summary

| Service | Host Port | Container Port |
|---|---|---|
| PostgreSQL | 5432 | 5432 |
| Backend API | 3000 | 3000 |
| Nginx/Portal | 80 | 80 |
