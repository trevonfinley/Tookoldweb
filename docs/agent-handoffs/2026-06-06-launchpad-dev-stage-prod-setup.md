# Agent Handoff - Dev Staging Production Setup

## Agent Name

Launchpad

## Agent Role

Project Neo DevOps and Deployment Engineer

## Date

2026-06-06

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Operationalized Neo Prime's dev, staging, and production environment strategy for Project Neo. This task documented the official `feature/* -> dev -> staging -> main` release flow, exact Vercel branch-to-environment mapping, Supabase environment recommendations, placeholder-only environment variables, promotion checks, rollback steps, hotfix flow, and deployment-impacting handoff requirements.

This is a documentation/configuration strategy task. No real secrets were added, no Square implementation was built, and no production hosting setting was changed directly.

## Files Created

- `docs/release-checklist.md`
- `docs/rollback-plan.md`
- `docs/agent-handoffs/2026-06-06-launchpad-dev-stage-prod-setup.md`

## Files Modified

- `README.md`
- `docs/deployment-notes.md`
- `docs/environments.md`
- `.env.example`
- `CHANGELOG.md`

## Files Deleted

- None.

## Key Decisions Made

- Confirmed `main` is the production branch.
- Confirmed `staging` is the pre-production branch.
- Confirmed `dev` is the development integration branch.
- Confirmed `feature/*` branches are individual agent work branches created from `dev`.
- Documented that Vercel Production should be connected only to `main`.
- Documented that `staging`, `dev`, and `feature/*` should use Vercel Preview Deployments.
- Documented that production secrets must not be used in dev or staging.
- Documented Square variables as deferred placeholders only.

## Architecture Changes

- No application architecture changed.
- Release architecture is now formally documented as `feature/* -> dev -> staging -> main`.

## Folder/File Structure Changes

- Added standalone release checklist and rollback/hotfix planning docs under `docs/`.
- Added this Launchpad handoff note under `docs/agent-handoffs/`.

## New Conventions

- Feature branches should use `feature/agent-name-task-name`.
- Urgent production fixes should use `hotfix/short-issue-name` from `main`.
- Production deployment records should include deploy ID, release commit, promotion timestamp, production URL, and rollback target.
- Rollbacks and hotfixes must update `CHANGELOG.md`, `docs/deployment-notes.md`, and a handoff note.

## Affected Modules

- Deployment workflow
- Environment variable documentation
- Vercel hosting setup
- Supabase environment planning
- Agent handoff process
- Release checklist and rollback documentation

## Data/API/Schema Changes

- None.
- Supabase environment recommendations were documented only:
  - `project-neo-dev`
  - `project-neo-staging`
  - `project-neo-prod`
- If separate Supabase projects do not exist yet, they remain recommended next steps, not completed work.

## Environment Variable Changes

- Updated `.env.example` with placeholder-only values for:
  - `APP_ENV`
  - `NEXT_PUBLIC_APP_ENV`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_AUTH_CALLBACK_URL`
- Added deferred, commented Square placeholders only:
  - `SQUARE_ENVIRONMENT`
  - `SQUARE_APPLICATION_ID`
  - `SQUARE_ACCESS_TOKEN`
  - `SQUARE_LOCATION_ID`
  - `SQUARE_WEBHOOK_SIGNATURE_KEY`
- No real secrets, tokens, API keys, passwords, or private credentials were added.

## Deployment/Configuration Changes

- Documented exact Vercel setup:
  - Production branch: `main`
  - Staging Preview branch: `staging`
  - Development Preview branch: `dev`
  - Temporary Preview branches: `feature/*`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework preset: `Other`
- Documented branch-scoped Vercel environment variable expectations.
- Documented pre-staging, pre-production, production, and post-deployment checks.
- Documented Vercel rollback, Git revert, Edge Function rollback, database rollback caution, and hotfix flow.

## Security/Compliance Impact

- Positive: clarified that production secrets must only be used in production and must not be used in dev or staging.
- Positive: clarified that `SUPABASE_SERVICE_ROLE_KEY` is server-side only and must not be browser-visible.
- Positive: clarified that `NEXT_PUBLIC_*` variables may be browser-visible and must not contain secrets.
- Positive: documented that `.env.example` must stay placeholder-only and real `.env` files must not be committed.
- No official SOC 2 Type II compliance claim was made.
- No official PCI-DSS compliance claim was made.
- Square remains deferred and unimplemented.

## Agents That Need This Update

- Neo Prime
- Scribe
- Shield
- Bug Hunter
- Gatekeeper
- Stack Mason
- Data Knox
- Booker
- Mission Control
- Ledger
- Concierge
- Pixel Frost
- Scout

## Required Follow-Up Tasks

- Launchpad / Owner: configure or verify Vercel Production Branch is `main`.
- Launchpad / Owner: configure branch-scoped Vercel Preview variables for `staging`, `dev`, and `feature/*` if available on the plan.
- Data Knox / Stack Mason / Gatekeeper / Shield: confirm whether separate Supabase projects `project-neo-dev`, `project-neo-staging`, and `project-neo-prod` exist; create them if approved.
- Scribe: use `docs/release-checklist.md` and `docs/rollback-plan.md` in future release notes.
- Bug Hunter: QA staging before any `staging -> main` production promotion.
- Shield: review staging before production for security-sensitive changes.

## Risks or Blockers

- Separate Supabase dev/staging/prod projects are documented as recommendations unless already provisioned and verified by the owning agents.
- Vercel branch-scoped Preview variables may require owner dashboard configuration.
- Production launch remains separate from this documentation task and still requires Neo Prime/owner approval.

## Testing Performed

- Documentation/configuration-strategy change; application behavior was not changed.
- Ran `npm run build`; static build completed. Local shell reported browser API config is incomplete, which is expected when production/staging values are not loaded locally.
- Ran `npm run validate`; Project Neo deployment validation passed.
- Ran `git diff --check`; no whitespace errors were reported.
- Ran a focused placeholder/secret scan; matches were placeholder-only `.env.example` values and documentation examples, not real credentials.
- Confirmed `AGENTS.md` and `agents.md` are identical so the required uppercase instruction file contains the same environment strategy rules.

## Suggested Next Agent

Launchpad for Vercel dashboard configuration, then Data Knox/Stack Mason/Gatekeeper for Supabase environment provisioning verification.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
