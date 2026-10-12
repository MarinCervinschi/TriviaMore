# infra

TriviaMore's servers as Terraform, one root per environment (`docs/PLATFORM.md`). Production holds the
ops console (#203, #198); staging on `rieti` is being built in #208. The app and Supabase are still
managed by hand in Coolify, until #212.

## Run it

```bash
pnpm infra:plan             # production: what would change; reads only
pnpm infra:apply            # production: applies, after showing the same plan and asking
pnpm infra:output           # production: the values the last apply recorded
pnpm infra:staging:plan     # the same three for staging
pnpm infra:staging:apply
pnpm infra:staging:output
```

Each one runs `infisical run --env=<env> --path=/infra -- bash infra/run.sh <env> …`, so the secrets come
from that environment's `/infra` folder and never from a file. Needs Terraform ≥ 1.10 and **Tailscale on,
on the personal tailnet**, because Coolify's API is reached through it.

## What it holds

| Path | |
|---|---|
| `run.sh` | `run.sh <prod\|staging> <command>`: the shared secrets, then the root's `vars.sh`, then Terraform in that root |
| `modules/app/` | an application built from GitHub by Coolify, with its runtime variables |
| `modules/access/` | a proxied DNS record and the Cloudflare Access application and policy in front of it, with an optional bypass for the ACME challenge |
| `envs/prod/` | the console's server and worker on the VPS, `admin.trivia-more.it`, and `moved.tf` for the move into modules. State `triviamore.tfstate` |
| `envs/staging/` | the `staging` environment and its Postgres on `rieti`. State `triviamore-staging.tfstate` |

Each root has `versions.tf` (providers and the R2 backend), `providers.tf`, `discovery.tf` (the projects
and servers looked up by name), `variables.tf` and `vars.sh` (which maps the Infisical secrets onto them).

## Secrets: Infisical `prod` → `/infra`

| Secret | For |
|---|---|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | the state bucket on R2 (`triviamore-tfstate`, override with `TF_STATE_BUCKET`) |
| `COOLIFY_ENDPOINT`, `COOLIFY_TOKEN` | Coolify's API, as `http://savvy:8000` with a read, write and deploy token |
| `CONSOLE_INFISICAL_CLIENT_ID`, `CONSOLE_INFISICAL_CLIENT_SECRET` | the console's machine identity, which the container uses to read its own secrets |
| `INFISICAL_PROJECT_ID`, `INFISICAL_SITE_URL` | where that identity signs in |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | the DNS record and Cloudflare Access |
| `CONSOLE_OWNER_EMAIL` | the one address Access lets into the console |
| `CONSOLE_SEQ_API_KEY`, `CONSOLE_WORKER_SEQ_API_KEY` | the Seq keys of the server and the worker, set on each as `SEQ_SERVICE_API_KEY` |

## Secrets: Infisical `staging` → `/infra`

The shared ones are the same values as in `prod` → `/infra`; reference them there instead of copying them:
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `COOLIFY_ENDPOINT`, `COOLIFY_TOKEN`,
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

| Secret | For |
|---|---|
| `STAGING_POSTGRES_PASSWORD` | the `postgres` user of the staging database |

The state holds these values in clear, which is why it lives in a private bucket and never in git. The
identities that run the app and the console have the project role `Runtime-Read`, which reads `prod` and
`staging` but not `/infra`.

## Coolify's API through the tailnet

- The endpoint is plain HTTP on the tailnet; WireGuard encrypts it, so the provider's *Insecure Coolify
  Endpoint* warning is expected.
- Coolify runs in Docker behind `docker-proxy`, so it sees every API call coming from the gateway of its
  network, `<docker-gateway-ip>`. That address is in **Allowed API IPs**, which means **the Oracle firewall is what
  keeps the API off the internet**: its ingress rules open only 22, 80 and 443.

## The console on its domain

The console is `https://admin.trivia-more.it`, behind two layers that do not depend on each other:

1. **Cloudflare Access**, which lets only `CONSOLE_OWNER_EMAIL` through, after a one-time code or a
   social login. Its path `/.well-known/acme-challenge` is bypassed, or Let's Encrypt could not renew.
2. **The console's own login**, a Supabase account whose id is in `CONSOLE_OWNER_IDS`.

The server's IP reaches Traefik without Cloudflare, so Access alone could be walked around. The console
therefore checks the token Access signs on every request (`CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, set by
`console.tf`) and answers 403 without a valid one, or 503 when a deployed console has no Access set.

## By hand, outside Terraform

- **The Supabase redirect URL** `https://admin.trivia-more.it/**`, in the auth stack's
  `ADDITIONAL_REDIRECT_URLS`.
- **The Oracle firewall** and SSH.
- **Migrations**, with `scripts/db/migrations.ts`, before the deploy they belong to.

## Rules

- **A resource Terraform manages is not changed in Coolify's interface**, or the next plan sets it back.
- **Run a plan before updating Coolify.** The provider is a community one over an API still in beta.
- **One worker only.** On start it closes the runs left open, assuming any other worker is gone.
