# Agent Handoff - Environment Strategy

## Agent Name

Neo Prime

## Agent Role

Lead Software Architect and Project Neo Launch Coordinator

## Date

2026-06-06

## Related Branch

Not applicable. Documentation-only strategy update in the current workspace.

## Task Summary

Designed and documented the official Project Neo dev, staging, and production environment strategy. This pass defines the branch promotion flow, Vercel deployment mapping, Supabase environment mapping, release gates, rollback flow, hotfix flow, environment variable rules, and cross-agent responsibilities. No feature code was implemented, no branch was created, no production credentials were changed, and no deployment was performed.

## Files Created

- `docs/environments.md`
- `docs/agent-handoffs/2026-06-06-neo-prime-environment-strategy.md`

## Files Modified

- `AGENTS.md`
- `README.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/deployment-notes.md`
- `docs/agent-status.md`
- `docs/agent-handoffs/HANDOFF_TEMPLATE.md`
- `CHANGELOG.md`
- `VERSION.md`

## Files Deleted

- None.

## Key Decisions Made

- Official release flow is `feature/* -> dev -> staging -> main`.
- `feature/*` branches are for individual agent work and should branch from `dev`.
- `dev` is the integration branch for active development and agent collaboration.
- `staging` is the pre-production branch for release candidate testing.
- `main` is the production/live branch and should be the only source for Vercel Production Deployments.
- Hotfixes should use `hotfix/*` branches from `main`, then back-merge `main` into `staging` and `dev`.
- Scribe owns release/version documentation updates.
- Launchpad owns Vercel deployment mapping, deployment notes, rollback notes, and platform configuration follow-through.
- Shield must review security-sensitive changes before production.
- Bug Hunter must QA staging before production.

## Architecture Changes

- Added the official environment and release-promotion architecture for Project Neo.
- No application routing, frontend code, backend API code, Supabase schema, or production deployment architecture was changed.

## Folder/File Structure Changes

- Added `docs/environments.md` as the top-level environment strategy document.
- Added one new handoff note under `docs/agent-handoffs/`.
- No existing folders were moved or renamed.

## New Conventions

- Use `feature/* -> dev -> staging -> main` for normal release flow.
- Use `hotfix/*` from `main` for urgent production fixes.
- Run documented merge gates before `dev -> staging` and `staging -> main`.
- Include `Related Branch` in future handoff notes.

## Affected Modules

- Release strategy
- Environment strategy
- Vercel deployment workflow
- Supabase environment planning
- Agent handoff process
- Changelog/version documentation
- Deployment notes

## Data/API/Schema Changes

- None. No database, API, schema, payload, RLS, Edge Function, or data-shape changes were made.

## Environment Variable Changes

- No actual environment variables were changed.
- Documentation now recommends separate dev, staging, and production variables.
- Documentation now recommends separate Supabase projects: `project-neo-dev`, `project-neo-staging`, and `project-neo-prod`.
- Documentation reaffirms that production secrets must not be used in dev or staging, `.env.example` must remain placeholder-only, and service role keys must remain server-side only.

## Security/Compliance Impact

- Documentation-only impact.
- Reinforces least privilege, environment separation, no committed secrets, and server-only service role keys.
- Reaffirms that SOC 2 Type II and PCI-DSS are readiness/alignment goals only, not official certification or compliance claims.
- Reaffirms Square variables remain deferred placeholders unless payment work is explicitly activated later.
- No secrets, tokens, API keys, passwords, private credentials, private client details, or payment data were documented.

## Agents That Need This Update

- Launchpad
- Scribe
- Shield
- Bug Hunter
- Data Knox
- Stack Mason
- Pixel Frost
- Mission Control
- Booker
- Gatekeeper
- Ledger
- Concierge
- Scout
- All feature agents

## Required Follow-Up Tasks

- Launchpad: create or verify `dev` and `staging` GitHub branches, Vercel Production Branch `main`, Preview deployments for `dev` and `staging`, branch-scoped Preview environment variables, and rollback procedure.
- Data Knox and Stack Mason: confirm whether separate Supabase projects exist for dev, staging, and production; if not, propose creation steps and migration order.
- Gatekeeper: map Supabase Auth Site URL and redirect allowlists separately for dev, staging, previews, and production.
- Shield: review the environment separation plan, secret rules, preview protection posture, and production private-data boundary before production promotion.
- Bug Hunter: define staging QA checklist for public pages, booking/contact, admin/private routes, mobile/desktop, and release regression.
- Scribe: use `CHANGELOG.md`, `VERSION.md`, release notes, and handoff notes for release documentation before `staging -> main`.
- Feature agents: branch from `dev`, merge to `dev`, update handoffs and changelog entries after meaningful work.

## Risks or Blockers

- The documented strategy does not prove that `dev` or `staging` branches currently exist in GitHub.
- The documented strategy does not prove that separate Supabase dev/staging/prod projects currently exist.
- Vercel branch-scoped Preview environment variables still need Launchpad configuration.
- Production remains NO-GO under the existing launch-readiness tracker until all critical blockers pass or receive explicit owner-approved deferrals.

## Testing Performed

- Documentation consistency review against current README, deployment guide, deployment notes, agent rules, and handoff template.
- No application tests were run because this was a documentation-only architecture and release strategy update.

## Suggested Next Agent

Launchpad

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
