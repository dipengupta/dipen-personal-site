# node:*-bookworm-slim (glibc) so better-sqlite3 and sharp use prebuilt binaries.
FROM node:26-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-bookworm-slim AS build
WORKDIR /app
# Footer "last updated" + commit: scripts/deploy.sh passes these from git,
# since .git is not in the build context. Defaults keep plain `docker build` working.
ARG BUILD_DATE=""
ARG GIT_SHA=""
ENV BUILD_DATE=$BUILD_DATE GIT_SHA=$GIT_SHA
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Bundle the seed script so the runtime image needs no tsx/typescript.
RUN npx esbuild scripts/seed.ts --bundle --platform=node --format=cjs \
    --outfile=dist/seed.js --external:better-sqlite3

FROM node:26-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    DATABASE_PATH=/data/site.db \
    MEDIA_DIR=/data/media \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/data/seed ./src/data/seed
COPY docker-entrypoint.sh ./
# Strip CRLF in case the build context was checked out on Windows.
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

RUN useradd -r -u 1001 site && mkdir -p /data/media && chown -R site /data
USER site

EXPOSE 3000
VOLUME /data
ENTRYPOINT ["./docker-entrypoint.sh"]
