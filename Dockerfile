# syntax=docker/dockerfile:1

# ---- deps: install dependencies (native modules need build tools) ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate the Prisma client and build the Next.js app ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# next build's page-data collection loads server modules (session/jwt) that
# throw if SESSION_SECRET is unset, and generateStaticParams (courses/[slug])
# queries the database — so the build needs *a* schema-shaped SQLite file and
# *a* secret, neither of which is the real runtime value. These are scoped to
# this RUN line only (not a persisted image ENV) and are fully overridden by
# the hosting platform's real env vars at container startup.
RUN SESSION_SECRET="build-time-placeholder-overridden-at-runtime" \
    DATABASE_URL="file:./build-placeholder.db" \
    npx prisma migrate deploy \
    && SESSION_SECRET="build-time-placeholder-overridden-at-runtime" \
       DATABASE_URL="file:./build-placeholder.db" \
       npm run build

# ---- runner: minimal production image ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=400"
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl sqlite3 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output — traced dependencies only, no full node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma's generated client + query engine and the better-sqlite3 native
# binding aren't always fully captured by Next's file tracing — copy them
# explicitly so the adapter has what it needs at runtime.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Migration files + CLI needed to run `prisma migrate deploy` at startup.
# prisma.config.ts (root file) `import`s dotenv directly, so that comes along too.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && chown nextjs:nodejs docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
