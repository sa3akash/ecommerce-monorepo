# Use Bun Alpine as the base image
FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

WORKDIR /usr/src/app

# Copy package.json and bun.lock for dependency installation
COPY package.json bun.lock ./

# Install dependencies into a temp directory to cache them
FROM base AS install
RUN mkdir -p /usr/src/app/apps/server

# Copy root and application-specific package.json before installing dependencies
COPY package.json bun.lock /usr/src/app/
COPY apps/server/package.json /usr/src/app/apps/server/

# Install all dependencies (including dev) for building
WORKDIR /usr/src/app
RUN bun install --frozen-lockfile

# Install only production dependencies separately
FROM base AS production-deps
WORKDIR /usr/src/app
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/
RUN bun install --frozen-lockfile --production

# Build the application
FROM base AS prerelease
WORKDIR /usr/src/app
COPY --from=install /usr/src/app/node_modules node_modules
COPY . . 
WORKDIR /usr/src/app/apps/server
RUN bun run build

# Final production image
FROM base AS release
WORKDIR /usr/src/app

# Copy only production dependencies
COPY --from=production-deps /usr/src/app/node_modules node_modules

# Copy built files
COPY --from=prerelease /usr/src/app/apps/server/dist ./dist
COPY --from=prerelease /usr/src/app/package.json ./

# Set environment variables
ENV NODE_ENV=production
EXPOSE 5500/tcp

# Change user to bun which has necessary permissions
USER bun

# Run the application
CMD ["bun", "run", "start"]
