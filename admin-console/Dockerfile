# syntax=docker/dockerfile:1
# Build from the repository root: the console imports the app's components from ../src.
#   docker build -f admin-console/Dockerfile .
# The worker is the `worker` stage: the same image with another command.

FROM node:22.23.4-slim@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d AS base

ARG TARGETARCH
ARG INFISICAL_CLI_VERSION=0.43.101
ARG INFISICAL_CLI_SHA256_AMD64=23501dafd482d3b3921a9a8b03c97aa1dfbbbe09b6408c4d73c012e0a088a23b
ARG INFISICAL_CLI_SHA256_ARM64=866de9fa01c2b71de5ae1cdd6a66d09dfa8abb7d4369ee5efc94a65b775ec3ad
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && case "$TARGETARCH" in \
      amd64) sum="$INFISICAL_CLI_SHA256_AMD64" ;; \
      arm64) sum="$INFISICAL_CLI_SHA256_ARM64" ;; \
      *) echo "unsupported arch: $TARGETARCH" >&2; exit 1 ;; \
    esac \
 && curl -fsSL -o /tmp/infisical.deb "https://github.com/Infisical/cli/releases/download/v${INFISICAL_CLI_VERSION}/infisical_${INFISICAL_CLI_VERSION}_linux_${TARGETARCH}.deb" \
 && echo "$sum  /tmp/infisical.deb" | sha256sum -c - \
 && dpkg -i /tmp/infisical.deb \
 && rm -rf /tmp/infisical.deb /var/lib/apt/lists/*
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
