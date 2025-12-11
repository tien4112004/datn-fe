# Micro‑Frontend Lesson Builder

##  What’s inside?

| Package             | Framework     | Build | Styling / UI              | Extra                                                             |
| ------------------- | ------------- | ----- | ------------------------- | ----------------------------------------------------------------- |
| **`container/`**    | React 19 (TS) | Vite  | Tailwind CSS v4, Shadcnui | Hosts `<PresentationWrapper>` that lazy‑mounts the remote Vue app |
| **`presentation/`** | Vue 3 (TS)    | Vite  | From PPTist               | GPL‑3.0 licensed PPTist editor                                    |

At the root you’ll also find shared config for **Prettier**, **ESLint**, **pnpm**, **commitlint** + **Husky** hooks, plus **Turborepo** pipelines.

##  Prerequisites

- **Node ≥ 20** (LTS recommended)
- **pnpm ≥ 9** → `corepack enable && corepack prepare pnpm@latest --activate`
- Git ≥ 2.40 (for Husky hooks)

> **Why pnpm?** To isolate dependency trees per workspace. That means **you must `cd` into a package before adding deps**, e.g. `cd container && pnpm add lodash`.

##  Getting Started

```bash
# 1. Clone & install all workspaces
$ git clone <repo-url>
$ pnpm install

# 2. Kick off both apps in parallel (Turbo handles caching & watch mode)
$ pnpm dev
```

By default Vite serves:


- React shell at **[http://localhost:5173](http://localhost:5173)**
- Vue editor at **[http://localhost:5174](http://localhost:5174)** (remote fed into the shell)

You can tweak ports in the respective `vite.config.ts` files or via `.env`.

##  Environment Variables

Each workspace ships a **`.env.sample`**. Copy it and fill in any secrets:

```bash
cp container/.env.sample container/.env
cp presentation/.env.sample presentation/.env
```

##  Scripts

All root‑level scripts are Turborepo pipelines:

| Command          | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | `turbo run dev --parallel` – starts both apps      |
| `pnpm build`     | Build all workspaces (production)                  |
| `pnpm lint`      | Lint everything with root ESLint + per‑pkg configs |
| `pnpm format`    | Run Prettier on `**/*.{js,ts,vue,json,css,tsx}`    |
| `pnpm typecheck` | tsc in each workspace                              |
| `pnpm prepare`   | Install Husky git hooks                            |

Inside each package you’ll find the usual `dev`, `build`, `lint`, etc. scoped to that app.

---

##  Module Federation Cheatsheet

- **Remote**: `presentation` exposes its root Vue component in `vite.config.ts`.

- **Host**: `container/src/PresentationWrapper.tsx` consumes it asynchronously:

  ```tsx
  const RemotePresentation = React.lazy(() => import('presentation/App'));
  ```

- Make sure both apps are running; the host fetches the remote JS bundle at runtime.

- **Version bumps**: keep `shared` deps aligned in both `package.json` files (React, Vue, etc.).

---

##  Code Quality

- **Prettier** (+ VS Code extension) → instant formatting on save
- **ESLint** root config + package‑specific overrides
- **commitlint** enforces Conventional Commits; triggered by Husky `commit-msg` hook

Run the full hygiene suite:

```bash
pnpm lint && pnpm format && pnpm typecheck
```

## Docker Deployment

### Production Build

Build and run both applications using Docker Compose:

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

This will start:

- **Container app** at http://localhost:3000
- **Presentation app** at http://localhost:3001

### Development with Docker

Run the development environment in Docker:

```bash
# Start dev environment with hot-reload
docker-compose up
```

### Individual Container Builds

Build specific applications:

```bash
# Build container app
docker build --target container-production -t container-app .

# Build presentation app
docker build --target presentation-production -t presentation-app .

# Run individually
docker run -p 3000:3000 container-app
docker run -p 3001:3001 presentation-app
```

## Adding Dependencies

```bash
# React shell example
cd container
pnpm add @tanstack/react-query

# Vue editor example
cd presentation
pnpm add @vueuse/core
```

> Remember: **never** install from the repo root.

## Licensing

- **Vue editor**: GPL‑3.0 (see `presentation/LICENSE`). The copyleft terms apply to derivative distribution.

---

Happy hacking! 🛠️
