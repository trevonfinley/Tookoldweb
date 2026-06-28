# Project Neo Rollback And Hotfix Plan

Last Updated: 2026-06-22

Owner: Launchpad, Project Neo DevOps and Deployment Engineer

This plan is for production recovery, safe rollback, and urgent hotfixes. It does not replace Bug Hunter QA, Shield review, or Neo Prime release approval.

2026-06-13 Launchpad review: rollback and hotfix steps remain accurate for the current static Vercel + Supabase Edge Function architecture. No Square/payment rollback procedure is active because Square remains deferred.

2026-06-22 Launchpad review: rollback and hotfix steps remain documented and unchanged. No promotion was performed from the final QA cycle, so no new rollback target was created.

## Rollback Principles

- Prefer fast, reversible production recovery.
- Do not rewrite shared Git history.
- Do not hide or delete evidence of a bad release.
- Do not include secrets, tokens, API keys, passwords, or private credentials in rollback notes.
- Do not claim SOC 2 Type II or PCI-DSS compliance because of a rollback.

## Vercel Rollback

Use Vercel rollback when the static production deployment is broken or unsafe.

Steps:

1. Pause new merges to `main`.
2. Identify the bad production deployment ID.
3. Identify the last known good production deployment ID.
4. In Vercel, redeploy or promote the last known good deployment.
5. Verify production URL loads.
6. Run post-rollback checks:
   - homepage loads
   - official DJ Too Kold logo loads
   - navbar works
   - mobile layout works
   - booking page loads
   - contact page loads
   - admin/client route shells do not expose private data
   - production API health check still works if the API was not rolled back
7. Update `docs/deployment-notes.md` with the rollback deployment ID and reason.
8. Update `CHANGELOG.md` under `[Unreleased]`.
9. Create a handoff note in `docs/agent-handoffs/`.

## Git Rollback

Use Git rollback when a bad commit needs to be undone in source control.

Recommended approach:

```bash
git switch main
git pull origin main
git revert <bad-commit-sha>
```

Then:

1. Run focused validation.
2. Open a PR to `main` or follow owner-approved emergency procedure.
3. Deploy production from `main`.
4. Back-merge `main` into `staging`.
5. Back-merge `staging` into `dev`.
6. Document the rollback in `CHANGELOG.md`, `docs/deployment-notes.md`, and a handoff note.

Use `git revert` instead of force-pushing or rewriting shared branch history.

## Supabase Edge Function Rollback

Use Edge Function rollback when the deployed `project-neo-api` function is broken.

Steps:

1. Pause new backend deploys.
2. Identify the bad function deployment/source commit.
3. Redeploy the last known good Edge Function source.
4. Verify:
   - `GET /health`
   - public booking/contact route behavior if affected
   - protected admin/portal routes return safe `401` without auth
   - CORS behavior matches the approved origin posture
5. Document affected API behavior and agents.

Do not expose service-role keys while debugging or documenting rollback.

## Database Rollback

Database rollbacks require extra care.

Rules:

- Prefer forward-fix migrations over destructive rollbacks.
- Coordinate with Data Knox, Stack Mason, Shield, and Neo Prime before changing production data.
- Confirm a backup or restore point before risky database work.
- Never drop or alter production tables casually.
- Document exactly which migration or data issue caused the rollback.

If a secret was exposed, rotate it immediately and document the incident without including the secret value.

## Hotfix Plan

Use hotfixes only for urgent production issues.

Flow:

1. Create `hotfix/short-issue-name` from `main`.
2. Fix only the urgent production issue.
3. Run focused validation and QA.
4. Get Shield review if the hotfix touches auth, data, payments, secrets, public/private route boundaries, CORS, or logging.
5. Open PR into `main` or use owner-approved emergency merge.
6. Deploy production from `main`.
7. Verify production.
8. Back-merge `main` into `staging`.
9. Back-merge `staging` into `dev`.
10. Update `CHANGELOG.md`.
11. Update `docs/deployment-notes.md`.
12. Create a handoff note for affected agents.

Recommended commands:

```bash
git switch main
git pull origin main
git switch -c hotfix/short-issue-name
```

After production is fixed:

```bash
git switch staging
git pull origin staging
git merge main
git push origin staging

git switch dev
git pull origin dev
git merge main
git push origin dev
```

## Rollback Handoff Requirements

Rollback or hotfix handoff notes must include:

- Agent Name
- Agent Role
- Date
- Related branch
- Incident or issue summary
- Bad deployment/commit if known
- Rollback deployment/commit
- Files changed
- Environment variable changes
- Data/API/schema impact
- Security/compliance impact
- Agents affected
- Follow-up tasks
- Risks or blockers
- Testing performed
- Suggested next agent

Notify:

- Neo Prime
- Scribe
- Shield
- Bug Hunter
- Gatekeeper if auth/redirects are affected
- Stack Mason if backend/API behavior is affected
- Data Knox if database/Supabase environment usage is affected
- Booker if booking/availability behavior is affected
- Mission Control if admin behavior is affected
- Ledger if payments/invoices are affected
- Concierge if client portal behavior is affected
