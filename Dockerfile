FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app

FROM base AS builder

# Build-time environment variable injection
ARG VITE_API_URL
ARG VITE_PRESENTATION_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_VAPID_KEY
ARG NODE_ENV=production

# Set as environment variables for the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PRESENTATION_URL=$VITE_PRESENTATION_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY
ENV NODE_ENV=$NODE_ENV

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
