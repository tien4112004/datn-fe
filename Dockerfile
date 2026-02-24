FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
# Copy workspace configuration first
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc* .pnpmfile.cjs* ./
# Copy all package.json files (including nested packages)
COPY app/package.json ./app/package.json
COPY presentation/package.json ./presentation/package.json
COPY admin/package.json ./admin/package.json
COPY packages ./packages

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/node_modules ./app/node_modules
COPY --from=deps /app/presentation/node_modules ./presentation/node_modules
COPY --from=deps /app/admin/node_modules ./admin/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

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

RUN pnpm build

# Production stage for app
FROM nginx:alpine AS app-production
COPY --from=builder /app/app/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 5173;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

# Production stage for presentation
FROM nginx:alpine AS presentation-production
COPY --from=builder /app/presentation/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 5174;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]

# Production stage for admin
FROM nginx:alpine AS admin-production
COPY --from=builder /app/admin/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 5175;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5175
CMD ["nginx", "-g", "daemon off;"]
