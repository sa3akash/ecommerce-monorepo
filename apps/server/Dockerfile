# Stage 1: Base image
FROM oven/bun:alpine AS base
LABEL authors="SHAKIL"

# Set working directory
WORKDIR /usr/src/app

# Stage 2: Install dependencies
FROM base AS install

# Copy root-level package.json and bun.lockb
COPY package.json bun.lockb ./

# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Stage 3: Copy source code and build the app
FROM base AS prerelease

# Copy node_modules from the install stage
COPY --from=install /usr/src/app/node_modules ./node_modules

# Copy the entire monorepo
COPY . .

# Build the specific app using Nx (replace `app1` with your app name)
RUN bun --filter './apps/server/' build

# Stage 4: Production image
FROM base AS release

# Copy production node_modules from the install stage
COPY --from=install /usr/src/app/node_modules ./node_modules

# Copy the built app from the prerelease stage
COPY --from=prerelease /usr/src/app/dist/apps/app1 ./dist

# Copy package.json for production
COPY package.json .

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 5500

# Run the app
CMD ["bun", "run", "start"]