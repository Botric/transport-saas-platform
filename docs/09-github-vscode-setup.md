# GitHub and VS Code Setup

## Objective

Set up the project so it can be developed in VS Code and uploaded to GitHub.

## Recommended Repo Name

```text
transport-saas-platform
```

Alternative names:

```text
school-workforce-transport-platform
passenger-transport-saas
route-tracking-ticketing-platform
```

## Local Folder Structure

```text
transport-saas-platform/
├── apps/
│   ├── driver-android/
│   ├── passenger-app/
│   └── web-portal/
├── backend/
│   ├── api/
│   ├── database/
│   └── services/
├── docs/
├── docker/
├── scripts/
├── README.md
└── .gitignore
```

## VS Code Extensions

Recommended:

- GitHub Pull Requests
- GitLens
- Docker
- ESLint
- Prettier
- Kotlin
- Gradle for Java
- REST Client
- PostgreSQL
- YAML

## Git Setup

```bash
git init
git add .
git commit -m "Initial project documentation"
```

## Create GitHub Repo

1. Go to GitHub
2. Create new repository
3. Name it `transport-saas-platform`
4. Do not initialise with README if you already created one locally
5. Copy the remote URL

Then run:

```bash
git remote add origin https://github.com/Botric/transport-saas-platform.git
git branch -M main
git push -u origin main
```

## .gitignore

Suggested root `.gitignore`:

```gitignore
# Node
node_modules/
dist/
build/
.env
.env.local

# Android
.gradle/
local.properties
*.apk
*.aab
app/release/
app/debug/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Database
*.sqlite
*.db
```

## Branching

Recommended branches:

```text
main
develop
feature/driver-app
feature/backend-api
feature/web-portal
feature/passenger-app
feature/ticketing
```

## Commit Message Examples

```text
Add driver app activation flow
Create route departure API
Add live tracking endpoint
Add vehicle registration validation
Create passenger ticket order schema
```

## Development Order in GitHub

### Milestone 1 — Documentation

- [ ] Add README
- [ ] Add docs folder
- [ ] Add product overview
- [ ] Add driver app spec
- [ ] Add backend API spec
- [ ] Add database schema

### Milestone 2 — Driver APK

- [ ] Create Android project
- [ ] Add activation screen
- [ ] Add vehicle reg screen
- [ ] Add driver name screen
- [ ] Add region/route/departure screens
- [ ] Add tracking service
- [ ] Build APK

### Milestone 3 — Backend API

- [ ] Create API project
- [ ] Add PostgreSQL
- [ ] Add activation code endpoints
- [ ] Add route endpoints
- [ ] Add tracking endpoints
- [ ] Add live status endpoint

### Milestone 4 — Web Portal

- [ ] Add login
- [ ] Add route admin
- [ ] Add activation code admin
- [ ] Add vehicle reg admin
- [ ] Add live map

### Milestone 5 — Passenger App

- [ ] Add login/register
- [ ] Add region/route preference
- [ ] Add live vehicle display
- [ ] Add ticket list
- [ ] Add orders
