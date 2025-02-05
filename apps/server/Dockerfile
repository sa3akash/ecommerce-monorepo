# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY apps/server/package.json /temp/dev/apps/server/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY apps/server/package.json /temp/prod/apps/server/
RUN cd /temp/prod && bun install --omit=dev --omit=peer --omit=optional

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
WORKDIR /usr/src/app/apps/server
RUN bun run build

# # copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/apps/server/dist ./dist
COPY --from=prerelease /usr/src/app/apps/server/package.json ./

# run the app
USER bun
EXPOSE 5500/tcp
ENTRYPOINT [ "bun", "dist/app.js" ]




# FROM node:22-alpine AS base
# WORKDIR /usr/src/app

# # install dependencies into temp directory
# FROM base AS install

# RUN mkdir -p /temp/dev
# COPY package.json package-lock.json /temp/dev/
# COPY apps/server/package.json /temp/dev/apps/server/
# RUN cd /temp/dev && npm ci

# # install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json package-lock.json /temp/prod/
# COPY apps/server/package.json /temp/prod/apps/server/
# RUN cd /temp/prod && npm ci --only=production

# # then copy all (non-ignored) project files into the image
# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY . .

# # [optional] tests & build
# ENV NODE_ENV=production
# # RUN bun test
# # RUN cd /usr/src/app/apps/server && npm run build
# RUN npm run build --workspace=apps/server

# # copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/apps/server/dist ./dist
# COPY --from=prerelease /usr/src/app/apps/server/package.json ./

# # Set a non-root user for security
# USER node
# # run the app
# EXPOSE 5500/tcp

# CMD ["node", "dist/app.js"]