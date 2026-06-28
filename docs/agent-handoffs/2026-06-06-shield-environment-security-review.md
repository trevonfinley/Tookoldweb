# Agent Handoff - Environment Security Review

## Agent Name

Shield

## Agent Role

App Security Engineer for Project Neo

## Date

2026-06-06

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Reviewed the dev, staging, and production environment strategy created by Neo Prime and operationalized by Launchpad. The review covered environment separation, GitHub branch protection expectations, Vercel environment scoping, Supabase environment scoping, secret handling, rollback/hotfix flow, SOC 2 Type II readiness wording, PCI-DSS alignment wording, and security-sensitive handoff expectations.

This task stayed within Shield scope. No Square implementation was added, no real secrets were added, and no unrelated application features were changed.

## Files Reviewed

- `AGENTS.md`
- `README.md`
- `.env.example`
- `.gitignore`
- `vercel.json`
- `scripts/build-site.mjs`
- `scripts/validate-deploy.mjs`
- `docs/environments.md`
- `docs/deployment-notes.md`
- `docs/release-checklist.md`
- `docs/rollback-plan.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`
- `docs/agent-status.md`
- `docs/agent-handoffs/2026-06-06-launchpad-dev-stage-prod-setup.md`
- `docs/agent-handoffs/2026-06-06-neo-prime-environment-strategy.md`
- `CHANGELOG.md`
- `VERSION.md`
- `version.md`

## Files Created

- `docs/agent-handoffs/2026-06-06-shield-environment-security-review.md`

## Files Modified

- `vercel.json`
- `docs/environments.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/release-checklist.md`
- `docs/agent-status.md`
- `CHANGELOG.md`

## Files Deleted

- None.

## Key Decisions Made

- Treat checked-in production public runtime values in `vercel.json` as a production-blocking environment separation risk because this static build reads top-level Vercel config env values during Vercel builds.
- Remove production public runtime values from `vercel.json`; environment-specific public config must come from Vercel environment scoping or approved CI/CD secret storage.
- Treat separate Supabase dev, staging, and production projects as not verified until Data Knox, Stack Mason, Gatekeeper, Launchpad, and Shield confirm project refs and isolation evidence.
- Treat GitHub branch protection/rulesets as not verified until Launchpad or the owner confirms enforcement in GitHub.
- Keep compliance language limited to SOC 2 Type II-ready and PCI-DSS-aligned readiness goals. Project Neo must not claim official SOC 2 Type II or PCI-DSS compliance.

## Security Findings Summary

- Critical: `vercel.json` previously contained production public runtime values that could make Preview deployments point at production API/Supabase targets. Fixed locally by removing the config block; Launchpad must verify previews and production generated config values.
- High: Supabase dev/staging/prod separation is documented as recommended, not proven. Production data isolation is not complete until separate projects or an approved equivalent are verified.
- High: GitHub branch protections and required checks are documented, but not verified in the local repo. No `.github` workflow file exists in this workspace for required build/validation checks.
- Medium: Vercel branch-scoped Preview environment variables and preview protection remain dashboard configuration items requiring Launchpad/owner verification.
- Medium: `npm run validate` should be extended later to fail if checked-in Vercel config reintroduces production runtime values.
- Informational: `.env.example` and Supabase function env examples remain placeholder-only in this review; no real Square credentials or Supabase service role key were found in reviewed committed files.

## Environment Variable Concerns

- `PROJECT_NEO_API_BASE_URL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` are browser-visible once generated into `dist/project-neo-config.js`; they are not secrets, but wrong environment scoping can route preview traffic into production.
- `SUPABASE_SERVICE_ROLE_KEY` must remain only in Supabase Edge Function secrets for the current static architecture.
- `NEXT_PUBLIC_*` values must be treated as browser-visible and must not contain secrets.
- Square access tokens and webhook signature keys remain deferred and must stay server-side only if Square is approved later.
- Production public config belongs in Vercel Production variables only, not in committed repo config that can affect Preview builds.

## Architecture Changes

- No app architecture, routing, backend behavior, database schema, or feature behavior changed.
- Deployment configuration posture changed by removing checked-in production runtime values from `vercel.json`.

## Folder/File Structure Changes

- Added one Shield handoff note under `docs/agent-handoffs/`.

## New Conventions

- `vercel.json` must not contain environment-specific production public runtime values for the static build.
- Branch protection or repository ruleset status must be documented before treating `staging -> main` promotion as production-controlled.

## Affected Modules

- Deployment workflow
- Environment strategy documentation
- Vercel static build configuration
- Release checklist
- Agent status and handoff documentation

## Data/API/Schema Changes

- None.

## Environment Variable Changes

- Removed checked-in production public runtime values from `vercel.json`.
- No real Vercel, Supabase, Square, OAuth, Apple, calendar, webhook, or payment secrets were added or modified.
- No live Vercel dashboard or Supabase dashboard settings were changed in this local repo review.

## Security/Compliance Impact

- Positive: reduces risk that feature, dev, or staging Preview deployments accidentally use production API/Supabase targets.
- Positive: strengthens documented production release controls by adding explicit branch protection expectations.
- Positive: reinforces server-only handling for service role keys, payment secrets, OAuth secrets, Apple private keys, webhook secrets, and calendar secrets.
- Positive: confirms Project Neo remains SOC 2 Type II-ready and PCI-DSS-aligned as readiness goals only; no official compliance claim was added.
- Remaining risk: environment isolation, branch protection, and branch-scoped Vercel variables still require owner/Launchpad/Data Knox/Gatekeeper verification outside this local file review.

## Agents That Need This Update

- Launchpad
- Scribe
- Neo Prime
- Bug Hunter
- Gatekeeper
- Data Knox
- Stack Mason
- Booker
- Mission Control

## Required Follow-Up Tasks

- Launchpad / Owner: verify Vercel Production Branch is `main`.
- Launchpad / Owner: configure and verify Vercel variables so Production uses production values, `staging` Preview uses staging values, and `dev`/`feature/*` previews use dev-safe values.
- Launchpad / Owner: verify Preview deployments are protected where available and production remains public per the recorded Vercel protection decision.
- Launchpad / Owner: configure or verify GitHub branch protection/rulesets for `main` and `staging`, including required PR review, required checks, restricted direct pushes, and force-push protection.
- Launchpad / Stack Mason: add CI or an equivalent required check that runs `npm run build` and `npm run validate` before `main` merges.
- Data Knox / Stack Mason / Gatekeeper / Launchpad: verify or create separate Supabase projects for dev, staging, and production; document project refs without exposing secrets.
- Gatekeeper: verify environment-specific Supabase Auth Site URL and redirect allowlists for local, dev, staging, preview, and production.
- Stack Mason / Data Knox: confirm migrations and Edge Function changes promote dev -> staging -> prod and that RLS remains enabled on exposed public tables.
- Bug Hunter: retest generated `project-neo-config.js` values on dev, staging, and production deployments before public launch.
- Scribe: keep compliance wording limited to readiness/alignment until a formal audit or PCI validation exists.

## Risks or Blockers

- Blocking production: Preview and production config must be verified after removing `vercel.json` runtime env values. A production build without correctly scoped Vercel variables would run without required public API/Supabase config.
- Blocking production: Supabase environment isolation is not proven until separate dev/staging/prod projects or an approved equivalent are verified.
- Blocking production: GitHub branch protection/rulesets and required checks are not proven from this local repo review.
- Public launch risk: final production CORS, private-page telemetry/noindex behavior, authenticated admin/client success-path QA, and RLS advisor review still need final evidence.

## Testing Performed

- Reviewed local documentation and deployment config for environment separation, secret handling, branch/release controls, Supabase separation assumptions, Vercel protection posture, compliance wording, rollback/hotfix process, and payment deferral.
- Reviewed `.gitignore` and placeholder env examples for committed secret handling.
- Reviewed the static build script and confirmed it reads `vercel.json` top-level `env` during Vercel builds, making checked-in production runtime values a real preview leakage risk.
- Ran `npm run validate`; Project Neo deployment validation passed.
- Ran `npm run build`; static build completed. The build warned that browser API config is incomplete because this local shell does not have environment-specific public Vercel/Supabase values loaded.
- Ran `git diff --check`; no whitespace errors were reported.
- Ran a focused secret-pattern scan. Matches were source-code variable names, placeholder examples, documentation warnings, and one documented fake QA password example; no real Supabase service role key, Square credential, API token, or private credential was identified in reviewed matches.

## Suggested Next Agent

Launchpad, then Data Knox/Gatekeeper for Supabase and Auth environment verification.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
