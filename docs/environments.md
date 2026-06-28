# Project Neo Environment Strategy

Last Updated: 2026-06-13

Original strategy owner: Neo Prime

Operational owner: Launchpad, Project Neo DevOps and Deployment Engineer

Project Neo uses a four-step release flow:

```txt
feature/* -> dev -> staging -> main
```

This keeps agent work, integration testing, pre-production testing, and the live DJ Too Kold site separated. The current app remains static-first on Vercel with Supabase for data, Auth, and the `project-neo-api` Edge Function.

## 1. Development Environment

Purpose: active development, agent integration, and early testing.

Development includes:
- Local developer machines.
- `feature/*` branches for individual agent work.
- The `dev` branch as the shared integration branch.
- Vercel Preview Deployments for feature branches and the `dev` branch.
- A recommended `project-neo-dev` Supabase project or local Supabase stack.

Rules:
- Feature agents branch from `dev`.
- Feature branches should be small and task-focused.
- Feature branches merge into `dev`, not directly into `staging` or `main`.
- Development must not use production secrets.
- Test records should be clearly fake or labeled as QA data.

## 2. Staging Environment

Purpose: pre-production release candidate testing.

Staging includes:
- The `staging` branch.
- A stable Vercel Preview Deployment for the `staging` branch.
- A recommended `project-neo-staging` Supabase project.
- Production-like data shape without live customer risk.

Rules:
- `dev` promotes to `staging` only after integration checks pass.
- Bug Hunter must QA staging before production.
- Shield must review security-sensitive changes before production.
- Launchpad must verify deployment settings and rollback notes.
- Scribe must update changelog and release notes before production promotion.
- Staging must not use production secrets.

## 3. Production Environment

Purpose: live public DJ Too Kold website and business platform.

Production includes:
- The `main` branch.
- Vercel Production Deployment.
- The live production domain, currently `https://tookoldweb.vercel.app` until the owner approves a custom domain decision.
- The production Supabase project, currently represented by the live Project Neo production deployment records.

Rules:
- Production deploys should only come from `main`.
- Risky or untested work must never go directly to `main`.
- `main` receives changes from `staging` through a release PR or explicit owner-approved release action.
- Neo Prime declares GO only after every critical launch blocker passes or receives explicit owner-approved deferral.
- Production secrets must only be used in production.

## 4. Branch Mapping

| Branch | Purpose | Source | Merge target | Deploy type |
| --- | --- | --- | --- | --- |
| `feature/*` | Individual agent work | `dev` | `dev` | Temporary Vercel Preview |
| `dev` | Active integration | feature PRs | `staging` | Development/integration Preview |
| `staging` | Release candidate QA | `dev` | `main` | Staging Preview |
| `main` | Production/live | `staging` or `hotfix/*` | N/A | Vercel Production |
| `hotfix/*` | Urgent production fix | `main` | `main`, then back-merge | Focused Preview, then Production |

Recommended branch setup commands:

```bash
git switch main
git pull origin main
git switch -c dev
git push -u origin dev
git switch main
git switch -c staging
git push -u origin staging
```

Only run these if the branches do not already exist. If they exist, update them through normal pull/merge workflow instead of recreating them.

Recommended feature branch commands:

```bash
git switch dev
git pull origin dev
git switch -c feature/agent-task-summary
```

Recommended release promotion shape:

```txt
feature/agent-task-summary -> dev
dev -> staging
staging -> main
```

Use pull requests for each promotion when GitHub is available.

## 5. GitHub Branch Protection Expectations

Configure GitHub branch protection or repository rulesets before treating this flow as production-controlled.

Recommended rules:
- `main` requires a pull request before merge.
- `main` requires passing checks before merge, including at minimum `npm run build` and `npm run validate` through CI or an equivalent required check.
- `main` restricts direct pushes and force pushes.
- `main` requires Launchpad deployment review, Shield review for security-sensitive changes, Bug Hunter QA evidence, and Scribe changelog/version updates before release promotion.
- `staging` requires a pull request or owner-approved promotion from `dev`.
- `staging` requires passing build/validation checks before merge.
- `dev` can be more flexible for agent integration, but direct production-risk changes should still go through a feature branch and review.
- `hotfix/*` branches must be documented, reviewed, deployed narrowly, and back-merged into `staging` and `dev` after production recovery.
- Branch protection status and any owner-approved bypass must be documented in release notes or deployment notes.

## 6. Vercel Deployment Mapping

Recommended Vercel settings:

| Vercel target | Git branch | Supabase target | Notes |
| --- | --- | --- | --- |
| Production | `main` | `project-neo-prod` | Live public site. Production deploys only from `main`. |
| Preview: staging | `staging` | `project-neo-staging` | Stable pre-production QA URL. Use Preview env vars scoped to `staging`. |
| Preview: dev | `dev` | `project-neo-dev` | Integration preview for merged agent work. Use Preview env vars scoped to `dev` where available. |
| Preview: feature | `feature/*` | `project-neo-dev` | Temporary branch previews for focused review. |
| Development | local / `vercel dev` | local Supabase or `project-neo-dev` | Developer-only local workflow. |

Vercel project settings:
- Framework preset: `Other`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Production branch: `main`.
- Production environment variables: assign only to Vercel Production.
- Staging environment variables: assign only to the `staging` branch Preview Deployment where Vercel branch scoping is available.
- Development/integration variables: assign to Development/local and the `dev` branch Preview Deployment.
- Feature previews: use dev-safe Preview variables, never production secrets.
- Preview deployments should remain available for `dev`, `staging`, and feature branches.
- Preview/staging deployments should use Vercel Authentication or Deployment Protection where available.
- Production should remain publicly reachable for the MVP unless Neo Prime, Launchpad, Gatekeeper, and Shield record a new protection decision.

Preview/staging QA access policy:
- Keep Preview and staging deployments protected unless Launchpad, Gatekeeper, Shield, Neo Prime, and the owner record a different access decision.
- Approved QA access options are Vercel Authentication, Trusted Sources, or an owner-approved controlled access method.
- Do not make preview/staging public just to unblock QA.
- Do not commit or document bypass tokens, private access links, credentials, or one-time access material.
- Bug Hunter should test deployed staging only after the protected `staging` branch preview exists and QA access is granted.

Current staging branch status as of 2026-06-13:
- Official staging branch target: `staging`.
- Latest READY non-production deployment known to Bug Hunter was from `codex-project-neo-deployment-workflow`, not confirmed `staging`.
- The official `staging` branch preview URL and deployment ID still need to be created or identified in Vercel and recorded in `docs/deployment-notes.md`.
- Launchpad's 2026-06-13 recheck did not identify a repo-side environment documentation gap; the remaining action requires Vercel/GitHub owner access to create or identify the official staging preview and grant approved protected-preview QA access.

Environment variable guidance for Vercel:
- Production variables are scoped only to Production.
- Staging variables are scoped to Preview for the `staging` branch.
- Dev variables are scoped to Preview for `dev` and feature branches, or to Development for local `vercel dev`.
- Do not put server-only secrets in Vercel unless Project Neo later adds private Vercel server code.
- Do not hardcode production public runtime values in `vercel.json`; top-level checked-in Vercel env config can leak production API targets into preview builds.
- Current static browser config values are public once generated into `dist/project-neo-config.js`.

Exact Vercel setup checklist:
- In Project Settings, set Production Branch to `main`.
- Confirm Build Command is `npm run build`.
- Confirm Output Directory is `dist`.
- Confirm Framework Preset is `Other`.
- Add production public variables only to Production.
- Add staging public variables only to Preview scoped to the `staging` branch when branch scoping is available.
- Add dev public variables to Development/local and Preview scoped to `dev`/feature branches.
- Do not add `SUPABASE_SERVICE_ROLE_KEY`, Square access tokens, webhook secrets, OAuth client secrets, Apple private keys, or calendar secrets to Vercel static hosting.
- Keep preview/staging protected with Vercel Authentication or Deployment Protection where available.
- Confirm the official `staging` branch preview URL before staging QA starts.
- Grant Bug Hunter and Shield approved protected-preview access before asking for deployed page-level QA.
- Record every production deployment ID and rollback target in `docs/deployment-notes.md`.

## 7. Supabase Environment Mapping

Recommended Supabase projects:

| Supabase project | Environment | Use |
| --- | --- | --- |
| `project-neo-dev` | Development | Local/dev testing, feature previews, integration branch testing. |
| `project-neo-staging` | Staging | Release candidate QA with production-like schema and safe test data. |
| `project-neo-prod` | Production | Live DJ Too Kold data and production Auth users. |

If these separate projects are not currently created, they are recommended next steps for Data Knox, Stack Mason, Gatekeeper, Launchpad, and Shield.

Supabase rules:
- Apply migrations to dev first, then staging, then production.
- Deploy Edge Function changes to dev first, then staging, then production.
- Keep each environment's Auth users, redirect URLs, provider settings, Edge Function secrets, and data separate.
- Production service role keys must never be used in dev or staging.
- Production data should not be copied into dev or staging unless it is scrubbed and approved.
- Public tables exposed through the Supabase Data API must have RLS enabled and reviewed policies.
- Service-role access belongs in Supabase Edge Function secrets only for the current static architecture.

## 8. Environment Variable Rules

Required rules:
- Use different environment variables for dev, staging, and production.
- Never commit `.env`, `.env.local`, `.env.*.local`, Supabase function `.env`, or real secret files.
- Keep `.env.example` and `supabase/functions/.env.example` placeholder-only.
- `NEXT_PUBLIC_*` variables may be exposed to the browser in a future Next.js app. They must never contain secrets.
- In the current static app, any value emitted into `project-neo-config.js` is browser-visible, regardless of prefix.
- `SUPABASE_PUBLISHABLE_KEY` may be browser-visible when RLS and API authorization are correct.
- `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only.
- Production secrets must only be used in production.
- Staging must not use production secrets.
- Development must not use production secrets.
- Square variables are deferred and should remain commented placeholders unless Ledger, Shield, Launchpad, and Neo Prime explicitly activate payment work later.
- SOC 2 Type II and PCI-DSS must be described as readiness/alignment goals only, not official certification or compliance claims.

Required environment variables by environment:

| Variable | Development | Staging | Production | Browser-visible | Notes |
| --- | --- | --- | --- | --- | --- |
| `APP_ENV` | `development` | `staging` | `production` | No | General environment label for tooling. |
| `PROJECT_NEO_ENV` | `development` | `staging` | `production` | Yes when emitted to static config | Current static build environment label. |
| `NEXT_PUBLIC_APP_ENV` | `development` | `staging` | `production` | Yes | Future Next.js-compatible public label. |
| `PROJECT_NEO_APP_URL` | local/dev URL | staging URL | production URL | Yes when emitted to static config | Current static app URL. |
| `NEXT_PUBLIC_SITE_URL` | local/dev URL | staging URL | production URL | Yes | Future Next.js-compatible site URL. |
| `PROJECT_NEO_API_BASE_URL` | dev API URL | staging API URL | production API URL | Yes when emitted to static config | Current API base URL. |
| `SUPABASE_URL` | dev Supabase URL | staging Supabase URL | production Supabase URL | Yes when emitted to static config | Public project URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | dev Supabase URL | staging Supabase URL | production Supabase URL | Yes | Future Next.js-compatible public URL. |
| `SUPABASE_PUBLISHABLE_KEY` | dev publishable/anon key | staging publishable/anon key | production publishable/anon key | Yes when emitted to static config | Must rely on RLS/API auth. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev anon key | staging anon key | production anon key | Yes | Future Next.js-compatible public key. |
| `NEXT_PUBLIC_AUTH_CALLBACK_URL` | local/dev callback | staging callback | production callback | Yes | Must be listed in Supabase Auth redirect URLs. |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side dev only | server-side staging only | server-side production only | No | Supabase Edge Function secret only. Never browser config. |

Deferred Square placeholders:
- `SQUARE_ENVIRONMENT`
- `SQUARE_APPLICATION_ID`
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_WEBHOOK_SIGNATURE_KEY`

Square remains deferred. These values must stay placeholder/commented unless Ledger, Shield, Launchpad, and Neo Prime approve Square work.

## 9. Release Promotion Flow

Feature branch to `dev`:
- Agent creates `feature/agent-task-summary` from `dev`.
- Agent completes scoped work.
- Agent runs the relevant checks for the change.
- Agent updates `CHANGELOG.md` under `[Unreleased]` for meaningful work.
- Agent creates or updates a handoff note in `docs/agent-handoffs/`.
- Feature branch merges into `dev` through review.

Before merging `dev` to `staging`:
- App builds successfully.
- Basic QA pass is complete.
- No obvious broken routes are present.
- No secrets are committed.
- Handoff notes are completed.
- `CHANGELOG.md` is updated under `[Unreleased]`.

Before merging `staging` to `main`:
- Bug Hunter QA review is complete.
- Shield security review is complete.
- Launchpad deployment review is complete.
- Scribe release/version notes are updated.
- No critical bugs are open.
- No secrets are exposed.
- Admin/private routes are reviewed.
- Public pages are tested on desktop and mobile.
- Neo Prime confirms the release is allowed to move forward.

## 10. Rollback Process

Use rollback when production is broken or unsafe.

Required rollback steps:
- Pause new merges to `main`.
- Identify the bad deployment, bad commit, environment issue, database issue, or Edge Function issue.
- Use Vercel to redeploy or promote the last known good production deployment when needed.
- Use `git revert` for bad commits so history stays clear.
- If the Edge Function caused the issue, redeploy the last known good function version.
- If a migration caused the issue, prefer a forward-fix migration unless a restore plan is approved.
- If a secret was exposed, rotate it immediately and document the incident without including the secret value.
- Document the rollback in `CHANGELOG.md` and `docs/deployment-notes.md`.
- Create a handoff note explaining the rollback, affected agents, testing performed, and follow-up tasks.

## 11. Hotfix Process

Use hotfixes only for urgent production issues.

Required hotfix flow:
- Create `hotfix/short-issue-name` from `main`.
- Fix only the urgent production issue.
- Run focused validation and QA.
- Have Shield review if the hotfix touches auth, data, payments, secrets, public/private route boundaries, or logging.
- Merge the hotfix back into `main`.
- Deploy production from `main`.
- Back-merge `main` into `staging` and `dev` after production is fixed.
- Document the hotfix in `CHANGELOG.md` and `docs/deployment-notes.md`.
- Create a handoff note for affected agents.

Recommended hotfix commands:

```bash
git switch main
git pull origin main
git switch -c hotfix/short-issue-name
```

After the production fix is merged:

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

## Agent Responsibilities

Feature agents:
- Branch from `dev`.
- Keep changes scoped to their role.
- Leave handoff notes after meaningful work.
- Do not merge risky work directly to `main`.

Scribe:
- Keep `CHANGELOG.md`, release notes, version notes, and handoff indexes current.
- Prepare release notes before `staging -> main`.
- Do not claim official launch or compliance before Neo Prime and the owner approve.

Launchpad:
- Own Vercel environment setup, deploy mapping, rollback notes, and deployment records.
- Confirm production deploys come from `main`.
- Document deploy IDs, rollback targets, environment decisions, and final domain state.

Shield:
- Review security-sensitive changes before production.
- Confirm no secrets are exposed and private/admin/client records remain protected.
- Confirm SOC 2 Type II and PCI-DSS language remains readiness/alignment language only.

Bug Hunter:
- QA `staging` before production.
- Re-run final production regression after approved release promotion.
- Record pass/fail criteria and QA evidence in handoff notes.

Data Knox and Stack Mason:
- Keep Supabase schema/API changes moving dev -> staging -> production.
- Verify migrations, RLS, grants, Edge Function behavior, and environment-specific secrets before production.

Neo Prime:
- Own the architecture and release strategy.
- Keep GO/NO-GO decisions grounded in launch blockers and release gates.
- Leave architecture handoff notes when strategy, routing, folder structure, environment strategy, or major technical decisions change.
