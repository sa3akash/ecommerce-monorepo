FROM oven/bun:alpine AS base

# 1. Install dependencies only when needed
WORKDIR /app
FROM base AS deps

COPY package.json bun.lock ./
COPY apps/client apps/client
COPY libs libs/
RUN bun install

# 2. Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app ./

# COPY .env .env
WORKDIR /app/apps/client
RUN bun run build

# 3. Production image, copy all the files and run next
FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/public ./apps/client/public

USER nextjs

EXPOSE 3000
ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD [ "node", "apps/client/server.js" ]