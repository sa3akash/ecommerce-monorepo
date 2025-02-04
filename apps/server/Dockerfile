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




# Base image
FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

WORKDIR /usr/src/app

# Copy only the necessary files for dependency installation
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/

# Install dependencies (all workspace packages)
RUN bun install --frozen-lockfile

# Copy full workspace
COPY . .

# Build the application
WORKDIR /usr/src/app/apps/server
RUN bun run build

# Production-ready image
FROM oven/bun:alpine AS production
WORKDIR /usr/src/app

# Copy only production dependencies
COPY --from=base /usr/src/app/node_modules node_modules

# Copy built app
COPY --from=base /usr/src/app/apps/server/dist ./dist
COPY --from=base /usr/src/app/apps/server/package.json . 

# Set environment
ENV NODE_ENV=production
EXPOSE 5500

USER bun
CMD ["bun", "run", "start"]
