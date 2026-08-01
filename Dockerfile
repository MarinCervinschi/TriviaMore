# syntax=docker/dockerfile:1

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash \
 && apt-get update && apt-get install -y --no-install-recommends infisical \
 && apt-get purge -y gnupg && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build
# Declared so the build works with plain --build-arg. With Coolify's Docker
# Build Secrets enabled these arrive as secret-mounted env vars on the RUN step
# instead, and never reach an image layer.
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID
ARG INFISICAL_SITE_URL
ARG INFISICAL_ENV=prod
ENV INFISICAL_CLIENT_ID=$INFISICAL_CLIENT_ID \
    INFISICAL_CLIENT_SECRET=$INFISICAL_CLIENT_SECRET \
    INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID \
    INFISICAL_SITE_URL=$INFISICAL_SITE_URL \
    INFISICAL_ENV=$INFISICAL_ENV
# Measured: the bundle step OOMs at 3072 and succeeds at 4096.
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# VITE_* values are inlined into the client bundle here, so each environment
# needs its own image — INFISICAL_ENV is what distinguishes them.
RUN ./docker-entrypoint.sh pnpm build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
# Nitro's node-server preset bundles dependencies into .output, so no install here.
COPY --from=build --chown=node:node /app/.output ./.output
COPY --chown=node:node docker-entrypoint.sh ./
USER node
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
