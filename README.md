# Micro‑Frontend Lesson Builder

## What's inside?

### Apps

| App                 | Framework     | Build  | Styling / UI                | Extra                                                             |
| ------------------- | ------------- | ------ | --------------------------- | ----------------------------------------------------------------- |
| **`app/`**          | React 19 (TS) | Vite 7 | Tailwind CSS v4, Shadcn/ui  | Main app — hosts the remote Vue presentation editor               |
| **`presentation/`** | Vue 3 (TS)    | Vite 5 | Tailwind CSS v3, PPTist     | GPL‑3.0 licensed PPTist editor, exposed via Module Federation     |
| **`admin/`**        | React 19 (TS) | Vite 7 | Tailwind CSS v4             | Admin dashboard                                                   |

### Shared Packages

| Package                      | Description                                  |
| ---------------------------- | -------------------------------------------- |
| **`packages/api`**           | Axios‑based API client (`@aiprimary/api`)    |
| **`packages/core`**          | Shared types & utilities (`@aiprimary/core`) |
| **`packages/ui`**            | Radix‑based React components (`@aiprimary/ui`) |
| **`packages/question`**      | Question/exam components (`@aiprimary/question`) |
| **`packages/frontend-data`** | Templates, themes, graphics (`@aiprimary/frontend-data`) |

At the root you'll also find shared config for **Prettier**, **ESLint**, **pnpm**, **commitlint** + **Husky** hooks, plus **Turborepo** pipelines.

## Prerequisites

- **Node >= 20** (LTS recommended)
- **pnpm >= 10** → `corepack enable && corepack prepare pnpm@latest --activate`
- Git >= 2.40 (for Husky hooks)

> **Why pnpm?** To isolate dependency trees per workspace. That means **you must `cd` into a package before adding deps**, e.g. `cd app && pnpm add lodash`.

## Getting Started

```bash
# 1. Clone & install all workspaces
$ git clone <repo-url>
$ pnpm install

# 2. Kick off all apps in parallel (Turbo handles caching & watch mode)
$ pnpm dev
```

By default Vite serves:

- React app at **http://localhost:5173**
- Vue editor at **http://localhost:5174** (remote fed into the app)
- Admin dashboard at **http://localhost:5175**

You can tweak ports in the respective `vite.config.ts` files or via `.env`.

## Environment Variables

Each workspace ships a **`.env.sample`** (or `.env.example`). Copy it and fill in any secrets:

```bash
cp app/.env.sample app/.env
cp presentation/.env.sample presentation/.env
cp admin/.env.example admin/.env
```

Key variables include `VITE_API_URL`, `VITE_PRESENTATION_URL`, and Firebase config. See the sample files for the full list.

## Scripts

All root‑level scripts are Turborepo pipelines:

| Command            | What it does                                         |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | `turbo run dev --parallel` — starts all apps         |
| `pnpm build`       | Build all workspaces (production)                    |
| `pnpm lint`        | Lint everything with root ESLint + per‑pkg configs   |
| `pnpm format`      | Run Prettier via Turbo across all workspaces         |
| `pnpm format:root` | Run Prettier on `**/*.{js,ts,vue,json,css,tsx}`      |
| `pnpm type-check`  | TypeScript type‑checking in each workspace           |
| `pnpm test`        | Run tests (Vitest) across all workspaces             |
| `pnpm test:run`    | Run tests in CI mode (no watch)                      |
| `pnpm preview`     | Preview production builds                            |
| `pnpm knip`        | Detect unused code and dependencies                  |
| `pnpm prepare`     | Install Husky git hooks                              |

Inside each package you'll find the usual `dev`, `build`, `lint`, etc. scoped to that app.

---

## Module Federation Cheatsheet

- **Remote**: `presentation` exposes its root Vue component in `vite.config.ts`.

- **Host**: `app` consumes it asynchronously:

  ```tsx
  const RemotePresentation = React.lazy(() => import('presentation/App'));
  ```

- Make sure both apps are running; the host fetches the remote JS bundle at runtime.

- **Version bumps**: keep `shared` deps aligned in both `package.json` files (React, Vue, etc.).

---

## Code Quality

- **Prettier** (+ VS Code extension) → instant formatting on save
- **ESLint** root config + package‑specific overrides
- **commitlint** enforces Conventional Commits; triggered by Husky `commit-msg` hook
- **Knip** for detecting unused exports and dependencies

Run the full hygiene suite:

```bash
pnpm lint && pnpm format && pnpm type-check
```

## Testing

Tests use **Vitest** with **@testing-library/react**:

```bash
pnpm test        # watch mode
pnpm test:run    # single run (CI)
```

## Deployment

### CI/CD Pipelines

Three GitHub Actions workflows handle CI/CD (see `.github/workflows/`):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| **`ci-cd.yml`** | PR to `main` | Build + test, then deploy **preview** to Vercel (only for changed apps). Posts preview URL as a PR comment. |
| **`ci-cd-prod.yml`** | Push to `main` | Build + test, then deploy **production** to Vercel (both `app` and `presentation`). |
| **`docker-build.yml`** | After prod CI/CD succeeds (or manual) | Triggers a Jenkins job to build & deploy Docker images. |

#### Required GitHub Secrets

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_CONTAINER_ID` | Vercel project ID for `app` |
| `VERCEL_PRESENTATION_ID` | Vercel project ID for `presentation` |
| `TURBO_TOKEN` / `TURBO_TEAM` | Turborepo remote caching |
| `JENKINS_USER` / `JENKINS_API_TOKEN` | Jenkins deployment trigger |

### Vercel

Each app is deployed as a separate Vercel project. The `app` project uses a generated `vercel.json` with rewrites to proxy `/vue-remote` requests to the `presentation` deployment URL.

- **Production**: auto‑deployed on push to `main`
- **Preview**: auto‑deployed on PRs (only for changed apps); the app preview automatically points to the presentation preview URL when both change

### Docker

The multi‑stage `Dockerfile` produces three Nginx‑based production images. Environment variables (`VITE_*`) are injected at build time via `ARG`.

#### Production (Docker Compose)

```bash
# Build and start all three containers
docker-compose -f docker-compose.prod.yml up -d

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

This will start:

- **App** at http://localhost:5173
- **Presentation** at http://localhost:5174
- **Admin** at http://localhost:5175

Images are published to `ghcr.io/tien4112004/datn-fe:{app,presentation,admin}-latest`. All services join the external `network-aiprimary` Docker network (create it with `docker network create network-aiprimary` if it doesn't exist).

#### Development (Docker Compose)

```bash
# Start dev environment with hot-reload
docker-compose up
```

#### Individual Container Builds

```bash
# Build each app
docker build --target app-production -t app .
docker build --target presentation-production -t presentation-app .
docker build --target admin-production -t admin-app .

# Run individually
docker run -p 5173:5173 app
docker run -p 5174:5174 presentation-app
docker run -p 5175:5175 admin-app
```

### Jenkins

The `docker-build.yml` workflow triggers a Jenkins multibranch pipeline job (`aiprimary-frontend`) after a successful production CI/CD run. This handles building Docker images and deploying them to the server. It can also be triggered manually via `workflow_dispatch`.

## Adding Dependencies

```bash
# React app example
cd app
pnpm add @tanstack/react-query

# Vue editor example
cd presentation
pnpm add @vueuse/core

# Shared package example
cd packages/ui
pnpm add some-lib
```

> Remember: **never** install from the repo root.

## Licensing

- **Vue editor**: GPL‑3.0 (see `presentation/LICENSE`). The copyleft terms apply to derivative distribution.

---

Happy hacking! 🛠️
