FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

WORKDIR /usr/src/app

# Install dependencies into a temp directory to cache them
FROM base AS install

RUN mkdir -p /temp/dev
COPY . /temp/dev/
RUN cd /temp/dev && bun install --filter '/apps/server'

# Install production dependencies only
RUN mkdir -p /temp/prod
COPY . /temp/prod/
RUN cd /temp/prod && bun install --filter '/apps/server' --production

# Copy node_modules from temp directory
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Optional: tests & build
ENV NODE_ENV=production
RUN bun --filter './apps/server' build

# Production image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/apps/server/dist ./dist
COPY --from=prerelease /usr/src/app/apps/server/package.json .

# Set environment variables
ENV NODE_ENV=production
EXPOSE 5500/tcp

# Change user to bun which is assumed to have necessary permissions
USER bun
# run
CMD ["bun", "run", "apps/server/app.js"]