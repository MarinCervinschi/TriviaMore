# The resources moved into modules on 2026-10-12; these keep their state, and can go once every state has applied them.
moved {
  from = coolify_application_github_app.console
  to   = module.console.coolify_application_github_app.this
}

moved {
  from = coolify_environment_variable.console
  to   = module.console.coolify_environment_variable.this
}

moved {
  from = coolify_application_github_app.console_worker
  to   = module.console_worker.coolify_application_github_app.this
}

moved {
  from = coolify_environment_variable.console_worker
  to   = module.console_worker.coolify_environment_variable.this
}

moved {
  from = cloudflare_dns_record.console
  to   = module.console_access.cloudflare_dns_record.this
}

moved {
  from = cloudflare_zero_trust_access_policy.console_owner
  to   = module.console_access.cloudflare_zero_trust_access_policy.allow
}

moved {
  from = cloudflare_zero_trust_access_application.console
  to   = module.console_access.cloudflare_zero_trust_access_application.this
}

moved {
  from = cloudflare_zero_trust_access_policy.acme_bypass
  to   = module.console_access.cloudflare_zero_trust_access_policy.acme_bypass[0]
}

moved {
  from = cloudflare_zero_trust_access_application.console_acme
  to   = module.console_access.cloudflare_zero_trust_access_application.acme[0]
}
