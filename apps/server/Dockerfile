# Use Bun Alpine as the base image
FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

WORKDIR /usr/src/app

# Install dependencies into a temp directory to cache them
FROM base AS install
RUN mkdir -p /temp/dev/apps/server /temp/prod/apps/server


# Copy the root package.json and bun.lock
COPY package.json bun.lock /temp/dev/
COPY apps/server/package.json /temp/dev/apps/server/

# Copy application-specific package.json
COPY apps/server/package.json /temp/dev/apps/server/
COPY apps/server/package.json /temp/prod/apps/server/

# Install all dependencies (including dev) for building
RUN cd /temp/dev && bun install --frozen-lockfile

# Install only production dependencies
COPY package.json bun.lock /temp/prod/
COPY apps/server/package.json /temp/prod/apps/server/

RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory for building
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . . 

# Build the application
ENV NODE_ENV=production
WORKDIR /usr/src/app/apps/server
RUN bun run build

# Final production image
FROM base AS release
WORKDIR /usr/src/app

# Copy only production dependencies
COPY --from=install /temp/prod/node_modules node_modules

# Copy built files
COPY --from=prerelease /usr/src/app/apps/server/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

# Set environment variables
ENV NODE_ENV=production
EXPOSE 5500/tcp

# Change user to bun which has necessary permissions
USER bun

# Run the application
CMD ["bun", "run", "start"]
