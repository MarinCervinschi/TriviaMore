# syntax=docker/dockerfile:1
# Build from the repository root: the console imports the app's components from ../src.
#   docker build -f admin-console/Dockerfile .
# The worker is the `worker` stage: the same image with another command.

FROM node:22-slim AS base

ARG INFISICAL_CLI_VERSION=0.43.101
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash \
 && apt-get update \
 && apt-get install -y --no-install-recommends "infisical=${INFISICAL_CLI_VERSION}" \
 && apt-get purge -y gnupg && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY admin-console/package.json ./admin-console/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# No secrets at build time: the console reads its environment on the server only.
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/admin-console/node_modules ./admin-console/node_modules
COPY . .
RUN pnpm --filter @triviamore/admin-console build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3100
WORKDIR /app/admin-console
COPY --from=build --chown=node:node /app/admin-console/.output ./.output
COPY --chown=node:node docker-entrypoint.sh ./
USER node
EXPOSE 3100
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]

# Coolify builds this stage for the worker (dockerfile_target_build); the last stage stays the server.
FROM runtime AS worker
CMD ["node", ".output/worker.mjs"]

FROM runtime
