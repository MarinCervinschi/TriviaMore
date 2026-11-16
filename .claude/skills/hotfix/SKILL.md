---
name: hotfix
description: How a fix reaches production without the staging release - a branch cut from prod, the fix plus a patch release on one PR into prod, a merge by hand once CI is green, then prod merged back into staging. Use whenever the user asks for a hotfix, a fix "directly in prod", or a fix that cannot wait for the next release from staging.
---

# Hotfix

Every change normally lands on `staging` and reaches `prod` with the next release. A hotfix skips
that queue for one fix that cannot wait. It is the exception: the release from `staging` stays the
default, and a hotfix carries **only** the fix.

## When it is a hotfix

- A bug in production that users or Google are hitting now: a broken page, wrong data, a lost index.
- Not a feature, not a refactor, not "while we are at it". Those wait for `staging`.
- Not a migration, unless the fix is impossible without one. Then the migration follows
  `method:safe-changes`, and production gets `pnpm db:dump` and then `pnpm db:migrate --apply` on its
  URL before the PR is merged.

## The steps

1. **Branch from `origin/prod`, never from `staging`.** `staging` holds work that is not released
   yet, and a branch cut from it would ship that work too.
   ```bash
   git fetch origin && git switch -c <short-slug> origin/prod
   ```
   The name is a short slug of the fix (`canonical-trailing-slash`), with the issue number in front
   when there is one.
2. **The fix commit**, with a test that would have caught it when one fits in the unit tier.
   Run `pnpm exec tsc --noEmit`, `pnpm test` and `pnpm build`; a server-function change also runs
   `pnpm smoke:reads` and `pnpm smoke:writes`.
3. **Push and open the PR into `prod`**, titled `fix: <what> (<version>)`. The body says what was
   broken and what changed, then `No migrations.` or the migrations it carries. It is short.
4. **The release commit on the same branch**, `chore(release): <version>`: a **patch** bump in
   `package.json` and a `CHANGELOG.md` section referencing the PR number from step 3. Follow the
   `changelog` skill. A public entry under `src/content/changelogs/` only if students noticed the
   bug; otherwise the megaphone lights up for nothing.
5. **Wait for CI, then merge by hand with a merge commit**, as every PR into `prod` is merged. The
   repo does not allow GitHub auto-merge. Merging into `prod` deploys, so it happens only when the
   user said so.
6. **Merge `prod` back into `staging` right away** and push. Until then `staging` misses the fix and
   the version bump, and the next release from `staging` conflicts on `CHANGELOG.md` and
   `package.json`.
   ```bash
   git switch staging && git pull --ff-only && git merge --no-edit origin/prod && git push
   ```
7. **Check production** once the deploy is done, against the symptom that started it (a `curl`, the
   page, the log in Seq), and report what you saw.

## Traps

- The pre-push hook scans every file the push carries; a push can take minutes. Run it in the
  background rather than assuming it hung.
- `pnpm format` can rewrite files you did not touch. Revert those before committing.
- Never squash a hotfix PR: the merge commit keeps the fix and the release commit apart on `prod`.
