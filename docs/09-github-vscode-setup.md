# Local Dev Setup — Git, GitHub and VS Code

## Prerequisites

- Git installed (`git --version`)
- Node.js v18 or later (`node --version`)
- VS Code (or VS Code Insiders)
- PostgreSQL 14 or later

---

## Cloning the Repository

```bash
git clone https://github.com/Botric/transport-saas-platform.git
cd transport-saas-platform
```

---

## First-Time Setup

### Backend

```bash
cd backend/api
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET, ACTIVATION_TOKEN_SECRET
npm install
npm run start:dev
```

### Web Portal

```bash
cd apps/web-portal
npm install
npm run dev
```

### Passenger App

```bash
cd apps/passenger-app
npm install
npm run dev
```

> **Linux / GVFS-mounted filesystems:** If `npm install` fails with `EIO` errors on symlinks, use:
> ```bash
> npm install --no-bin-links
> ```
> Then use `node node_modules/vite/dist/node/cli.js` instead of `npx vite`.

---

## Installing Dependencies After Pulling Changes

```bash
cd backend/api && npm install
cd apps/web-portal && npm install
cd apps/passenger-app && npm install
```

---

## Running All Services

Open three terminal windows or VS Code split terminals:

**Terminal 1 — Backend:**
```bash
cd backend/api
npm run start:dev
```

**Terminal 2 — Web Portal:**
```bash
cd apps/web-portal
npm run dev
```

**Terminal 3 — Passenger App:**
```bash
cd apps/passenger-app
npm run dev
```

| Service | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Web Portal | http://localhost:5173 |
| Passenger App | http://localhost:5174 |

---

## TypeScript Checks

Run a full TypeScript check without building:

```bash
# Backend
cd backend/api
node node_modules/typescript/bin/tsc --noEmit

# Web Portal
cd apps/web-portal
node node_modules/typescript/bin/tsc --noEmit

# Passenger App
cd apps/passenger-app
node node_modules/typescript/bin/tsc --noEmit
```

> **Do not use `npx tsc`** — on some Linux systems it installs an unrelated package. Use the local binary from `node_modules` as shown above.

---

## Recommended VS Code Extensions

| Extension | Purpose |
|---|---|
| ESLint | Lint JavaScript and TypeScript |
| Prettier | Code formatting |
| Tailwind CSS IntelliSense | Autocomplete for Tailwind classes |
| REST Client | Test API endpoints directly in VS Code |
| GitLens | Enhanced Git history and blame |
| DotENV | Syntax highlighting for `.env` files |
| NestJS Snippets | NestJS boilerplate shortcuts |

Install all at once:
```bash
code --install-extension dbaeumer.vscode-eslint \
  esbenp.prettier-vscode \
  bradlc.vscode-tailwindcss \
  humao.rest-client \
  eamodio.gitlens \
  mikestead.dotenv \
  ashinzekene.nestjs-snippets
```

---

## Git Workflow

### Branching

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Push and open a PR
git push -u origin feature/my-feature
```

### Committing

```bash
git add -A
git commit -m "feat: add route stops page"
git push
```

### Conventional commit prefixes

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `chore:` | Build, config, tooling |
| `refactor:` | Code change with no behaviour change |

---

## Database (Local PostgreSQL)

```bash
# Start PostgreSQL (Linux — systemd)
sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE transport_saas;"

# Connect to database
psql -U postgres -d transport_saas
```

TypeORM will create all tables automatically on first `npm run start:dev`.

---

## Environment Files

Never commit `.env` files. They are in `.gitignore`. Only commit `.env.example` files.

```
backend/api/.env.example        ← committed
backend/api/.env                ← gitignored (your local config)
apps/passenger-app/.env.example ← committed
apps/passenger-app/.env.local   ← gitignored
```
