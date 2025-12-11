FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app

FROM base AS builder
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm fetch --frozen-lockfile
COPY package.json ./
RUN --mount=type=cache,target=/pnpm/store CI=true pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Production stage for app
FROM node:20-alpine AS app-production

WORKDIR /app

COPY --from=builder /app/app/dist ./dist

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]

# Production stage for presentation
FROM node:20-alpine AS presentation-production

WORKDIR /app

COPY --from=builder /app/presentation/dist ./dist

RUN npm install -g serve

EXPOSE 5174

CMD ["serve", "-s", "dist", "-l", "5174"]

# Production stage for admin
FROM node:20-alpine AS admin-production

WORKDIR /app

COPY --from=builder /app/admin/dist ./dist

RUN npm install -g serve

EXPOSE 5175

CMD ["serve", "-s", "dist", "-l", "5175"]
