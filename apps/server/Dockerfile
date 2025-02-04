# FROM oven/bun:alpine AS base
# LABEL authors="SHAKIL"

# WORKDIR /usr/src/app

# # Install dependencies into a temp directory to cache them
# FROM base AS install

# RUN mkdir -p /temp/dev
# COPY package.json bun.lockb /temp/dev/
# RUN cd /temp/dev && bun install --frozen-lockfile

# # Install production dependencies only
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# # Copy node_modules from temp directory
# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# # Optional: tests & build
# ENV NODE_ENV=production
# RUN bun run build

# # Production image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/dist ./dist
# COPY --from=prerelease /usr/src/app/package.json .

# # Set environment variables
# ENV NODE_ENV=production
# EXPOSE 5500/tcp

# # Change user to bun which is assumed to have necessary permissions
# USER bun
# # run
# CMD ["bun", "run", "start"]




# Use Bun base image
FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

WORKDIR /usr/src/app

# Copy root-level package files first (better caching)
COPY package.json bun.lock bunfig.toml ./

# Copy server app's package.json (to resolve workspace dependencies correctly)
COPY apps/server/package.json apps/server/

# Install dependencies for the entire monorepo (cached separately)
RUN bun install --frozen-lockfile

# Copy the entire monorepo AFTER dependencies are installed (reduces cache busting)
COPY . .

# Set working directory to the server app
WORKDIR /usr/src/app/apps/server

# Build the server application
RUN bun run build

# Production image
FROM oven/bun:alpine AS production
WORKDIR /usr/src/app

# Copy production dependencies only (prune unnecessary packages)
COPY --from=base /usr/src/app/node_modules node_modules

# Copy only built app and necessary files
COPY --from=base /usr/src/app/apps/server/dist ./dist
COPY --from=base /usr/src/app/apps/server/package.json .

# Set environment variables
ENV NODE_ENV=production
EXPOSE 5500

USER bun
CMD ["bun", "run", "start"]

