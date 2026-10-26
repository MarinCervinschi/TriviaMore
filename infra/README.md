# infra

TriviaMore's servers as Terraform, one root per environment (`docs/PLATFORM.md`). Production holds the
ops console (#203, #198); staging on `rieti` holds the whole stack, the app included (#208, #211). The
production app and Supabase are still managed by hand in Coolify, until #212.

## Run it

```bash
pnpm infra:plan             # production: what would change; reads only
pnpm infra:apply            # production: applies, after showing the same plan and asking
pnpm infra:output           # production: the values the last apply recorded
pnpm infra:staging:plan     # the same three for staging
pnpm infra:staging:apply
pnpm infra:staging:output
pnpm infra:infisical:plan   # the Infisical projects, identities and settings
pnpm infra:infisical:apply
```

`run.sh` wraps Terraform in one `infisical run` per folder of the `trivia-more-infra` project that the root
needs, in its `ops` environment, so the secrets never come from a file. Needs Terraform ≥ 1.10, the
Infisical CLI signed in, and **Tailscale on, on the personal tailnet**, because Coolify's API is reached
through it.

## What it holds

| Path | |
|---|---|
| `run.sh` | `run.sh <prod\|staging> <command>`: the shared secrets, then the root's `vars.sh`, then Terraform in that root |
| `infisical/` | the Infisical projects of the app (`TriviaMore` for production, `trivia-more-staging` for staging and local runs), their environments, folders, identities and memberships, and the settings that are not secrets. State `triviamore-infisical.tfstate` |
| `modules/app/` | an application built from GitHub by Coolify, with its runtime variables |
| `modules/access/` | a proxied DNS record and the Cloudflare Access application and policy in front of it, with an optional bypass for the ACME challenge |
| `envs/prod/` | the console's server and worker on the VPS, `admin.trivia-more.it`, and `moved.tf` for the move into modules. State `triviamore.tfstate` |
| `envs/staging/` | on `rieti`: the `staging` environment, its Postgres, the app, the tunnel with `pr.trivia-more.it` and `mail-pr.trivia-more.it` behind Access, Mailpit and Garage. State `triviamore-staging.tfstate` |

Each root has `versions.tf` (providers and the R2 backend), `providers.tf`, `discovery.tf` (the projects
and servers looked up by name), `variables.tf` and `vars.sh` (which maps the Infisical secrets onto them).

## Secrets: `trivia-more-infra` → `ops`

A project of its own, so no identity that runs the app can read it: without custom roles, a project is the
only boundary Infisical draws. Every root reads `/terraform`, `/cloudflare`, `/coolify` and `/r2`, plus the
folder named after it.

| Folder | Secret | For |
|---|---|---|
| `/terraform` | `TF_INFISICAL_HOST`, `TF_INFISICAL_CLIENT_ID`, `TF_INFISICAL_CLIENT_SECRET` | universal auth of `TriviaMore-Terraform`, an organization admin that is no member of this project; its secret is rotated by hand |
| `/terraform` | `INFISICAL_PROJECT_ID`, `INFISICAL_SITE_URL` | the app's project, and where its identities sign in |
| `/cloudflare` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | DNS records, Cloudflare Access and the tunnel |
| `/cloudflare` | `CONSOLE_OWNER_EMAIL` | the one address Access lets into the console and the staging pages |
| `/coolify` | `COOLIFY_ENDPOINT`, `COOLIFY_TOKEN` | Coolify's API, as `http://savvy:8000` with a read, write and deploy token |
| `/r2` | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | the state bucket on R2 (`triviamore-tfstate`, override with `TF_STATE_BUCKET`) |
| `/prod` | `CONSOLE_INFISICAL_CLIENT_ID`, `CONSOLE_INFISICAL_CLIENT_SECRET` | the console's machine identity, which the container uses to read its own secrets |
| `/prod` | `CONSOLE_SEQ_API_KEY`, `CONSOLE_WORKER_SEQ_API_KEY` | the Seq keys of the server and the worker, set on each as `SEQ_SERVICE_API_KEY` |
| `/staging` | `STAGING_POSTGRES_PASSWORD` | the `postgres` user of the staging database |
| `/staging` | `STAGING_APP_DB_PASSWORD` | `trivia_app` on the staging database, set by `db:reset-staging`, and in the `DATABASE_URL` the staging root publishes |
| `/staging` | `STAGING_DATABASE_URL` | the admin URL `db:migrate:staging` and `db:reset-staging` use |
| `/staging` | `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN` | Garage's cluster secret and its admin API |
| `/staging` | `GARAGE_APP_ACCESS_KEY_ID`, `GARAGE_APP_SECRET_ACCESS_KEY` | the S3 key the app uses, imported into Garage at every start |

## What the staging root publishes

`envs/staging/secrets.tf` writes to `trivia-more-staging` what it generates or knows, so nobody copies it by
hand. The app reads it through `TriviaMore-Staging`, whose client secret the root creates and hands to Coolify.

| Environment | Folder | Secret |
|---|---|---|
| `staging` | `/database` | `DATABASE_URL`, to the database by its container name; `STAGING_SEED_PASSWORD`, of the made-up accounts (`seed-<role>@trivia-more.it`) |
| `staging` | `/auth` | `BETTER_AUTH_SECRET` |
| `staging` | `/email` | `SMTP_HOST`, Mailpit by its container name |
| `dev` | `/database` | `DATABASE_URL`, to the same database through rieti's tailnet address |
| `dev` | `/auth` | `BETTER_AUTH_SECRET`, its own |

The state holds these values in clear, which is why it lives in a private bucket and never in git.

## Coolify's API through the tailnet

- The endpoint is plain HTTP on the tailnet; WireGuard encrypts it, so the provider's *Insecure Coolify
  Endpoint* warning is expected.
- Coolify runs in Docker behind `docker-proxy`, so it sees every API call coming from the gateway of its
  network, `<docker-gateway-ip>`. That address is in **Allowed API IPs**, which means **the Oracle firewall is what
  keeps the API off the internet**: its ingress rules open only 22, 80 and 443.

## Staging on rieti

`rieti` has no public address, so staging reaches the internet through a Cloudflare Tunnel: `cloudflared`
runs there as a Coolify service and opens the connections outward. A hostname is a CNAME to the tunnel
and an ingress rule in `tunnel.tf` to a container on the `coolify` network, which every staging service
joins. Cloudflare holds the certificate, so no ACME bypass is needed.

- **The app** builds from the `staging` branch on every push that touches its paths, and answers at
  `pr.trivia-more.it`. The tunnel reaches it by the alias `trivia-more-app-staging` on the `coolify`
  network, because Coolify names the container after each deployment. It reads Infisical `staging`,
  which points at this database, at Mailpit, and at the staging OAuth clients; `AUTH_ALLOWED_EMAIL_DOMAIN`
  admits only `@trivia-more.it` accounts.
- **Mailpit** catches every email staging sends (SMTP on 1025) and shows them at `mail-pr.trivia-more.it`.
- **Garage** is the S3 store: buckets `public` (served by its web endpoint) and `contributions` (private).
  `garage-init` imports the app's key and creates the buckets on every start, skipping what exists.
- Coolify creates a variable for every `${VAR}` in a compose file, empty, so a service's secrets are set
  with `coolify_envs_bulk`, which overwrites them. Services are created with `instant_deploy = false`
  when they need those secrets, and started after the apply.

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
