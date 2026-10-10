# infra

The VPS's resources as Terraform, starting with the ops console (#203, #198). The app and Supabase
are still managed by hand in Coolify, and get imported here one at a time if the pilot holds.

## Run it

```bash
pnpm infra:plan     # what would change; reads only
pnpm infra:apply    # applies, after showing the same plan and asking
pnpm infra:output   # the values the last apply recorded
```

Each one runs `infisical run --env=prod --path=/infra -- bash infra/run.sh …`, so the secrets come from
Infisical and never from a file. Needs Terraform ≥ 1.10 and **Tailscale on**, because Coolify's API is
reached through the tailnet.

## What it holds

| File | |
|---|---|
| `versions.tf` | Terraform and the provider (`coolify-terraform/coolify`), and the state on Cloudflare R2 |
| `providers.tf` | the Coolify provider, from `COOLIFY_ENDPOINT` and `COOLIFY_TOKEN` |
| `discovery.tf` | reads only: Coolify's version, the projects, servers, environments, applications and GitHub Apps |
| `console.tf` | the console's two services, server and worker, and their runtime variables |
| `variables.tf` | the values `run.sh` passes from Infisical |
| `run.sh` | maps the Infisical secrets onto what Terraform reads, then runs it |

## Secrets: Infisical `prod` → `/infra`

| Secret | For |
|---|---|
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | the state bucket on R2 (`triviamore-tfstate`, override with `TF_STATE_BUCKET`) |
| `COOLIFY_ENDPOINT`, `COOLIFY_TOKEN` | Coolify's API, as `http://savvy:8000` with a read, write and deploy token |
| `CONSOLE_INFISICAL_CLIENT_ID`, `CONSOLE_INFISICAL_CLIENT_SECRET` | the console's machine identity, which the container uses to read its own secrets |
| `INFISICAL_PROJECT_ID`, `INFISICAL_SITE_URL` | where that identity signs in |

The state holds these values in clear, which is why it lives in a private bucket and never in git. The
identities that run the app and the console have the project role `Runtime-Read`, which reads `prod` and
`staging` but not `/infra`.

## Coolify's API through the tailnet

- The endpoint is plain HTTP on the tailnet; WireGuard encrypts it, so the provider's *Insecure Coolify
  Endpoint* warning is expected.
- Coolify runs in Docker behind `docker-proxy`, so it sees every API call coming from the gateway of its
  network, `10.0.2.1`. That address is in **Allowed API IPs**, which means **the Oracle firewall is what
  keeps the API off the internet**: its ingress rules open only 22, 80 and 443.
- The console's port 3100 is published the same way, on every interface, and kept off the internet by
  the same firewall.

## By hand, outside Terraform

- **`tailscale serve`** on the host, which publishes the console on the tailnet over HTTPS with the
  `*.ts.net` certificate. HTTPS is required, because the Supabase session cookies are `Secure`.
- **The Oracle firewall** and SSH.
- **Migrations**, with `scripts/db/migrations.ts`, before the deploy they belong to.

## Rules

- **A resource Terraform manages is not changed in Coolify's interface**, or the next plan sets it back.
- **Run a plan before updating Coolify.** The provider is a community one over an API still in beta.
- **One worker only.** On start it closes the runs left open, assuming any other worker is gone.
