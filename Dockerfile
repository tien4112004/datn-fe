FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.12.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY container/package.json ./container/
COPY presentation/package.json ./presentation/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Production stage for container
FROM node:20-alpine AS container-production

WORKDIR /app

COPY --from=builder /app/container/dist ./dist
COPY --from=builder /app/container/package.json ./

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

# Production stage for presentation
FROM node:20-alpine AS presentation-production

WORKDIR /app

COPY --from=builder /app/presentation/dist ./dist
COPY --from=builder /app/presentation/package.json ./

RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
