FROM oven/bun:alpine AS base

# 1. Install dependencies only when needed
WORKDIR /app
FROM base AS deps

COPY package.json bun.lock ./
COPY apps/admin apps/admin
COPY libs libs/
RUN bun install

# 2. Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app ./

# COPY .env .env
WORKDIR /app/apps/admin
RUN bun run build

# 3. Production image, copy all the files and run next
FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3001
ENV PORT=3001

ENV HOSTNAME="0.0.0.0"
CMD [ "bun", "apps/admin/server.js" ]