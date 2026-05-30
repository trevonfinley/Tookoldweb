# Agent Handoff - Vercel Production Deployment

## Agent Name

Launchpad

## Agent Role

DevOps / Deployment Engineer

## Date

2026-05-26

## Task Summary

Promoted the latest committed Project Neo static site build to Vercel production, verified the public deployment is reachable without a Vercel Authentication interstitial, confirmed clean URLs are active on the main public and private workflow pages, and documented the production deployment/environment posture for DJ Too Kold's website and admin platform.

## Files Created

- `docs/agent-handoffs/2026-05-26-launchpad-vercel-production-deployment.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/agent-handoffs/2026-05-25-scribe-first-vercel-preview.md`
- `docs/deployment-notes.md`
- `docs/versions/v0.8.0.md`
- `scripts/build-site.mjs`
- `vercel.json`
- `version.md`

## Files Deleted, if any

- None.

## Key Decisions Made

- Kept the public marketing site reachable while leaving admin, auth, and client portal pages protected by application authentication and noindex headers.
- Mirrored only browser-safe production public configuration in `vercel.json` for the initial Vercel launch path.
- Updated the static build flow so Vercel builds can read public Vercel config while normal environment variables still take precedence.
- Did not add service-role, payment, calendar, OAuth client secret, Apple private key, webhook, or other server-only values to frontend code or static hosting config.
- Treated Supabase Edge Function deployment as a separate backend follow-up because the production Supabase project still needs the `project-neo-api` function deployed and verified.

## Data/API/Schema Changes

- No database schema changes were made by Launchpad.
- No API implementation changes were made by Launchpad.
- Production frontend config points browser requests at the intended Supabase Edge Function base URL.
- The configured Supabase project still needs the `project-neo-api` Edge Function deployed before live booking, contact, availability, admin, and client portal API behavior can be verified end to end.

## Environment Variable Changes

- Public production browser config now includes environment name, app URL, API base URL, Supabase project URL, Supabase publishable key, admin email, and public contact email through the static build output.
- Server-only values remain excluded from frontend code and `project-neo-config.js`.
- `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, calendar secrets, OAuth client secrets, Apple private keys/client secrets, webhook secrets, and automation access tokens must remain server-side only.
- No secrets, tokens, passwords, private keys, or private credentials are included in this handoff.

## Security/Compliance Impact

- Positive launch impact: the production Vercel site is public where expected and no longer blocked by Vercel Authentication on the public deployment.
- Positive privacy impact: admin, auth, and client portal static routes retain noindex search hygiene through host configuration where configured by the related auth hardening work.
- Positive secret-handling impact: service-role and provider secrets were not moved into public frontend config.
- Remaining compliance risk: live form/API behavior, CORS, RLS, auth role checks, and sanitized availability responses cannot be fully validated until the Supabase Edge Function is deployed.

## Agents That Need This Update

- Launchpad
- Shield
- Gatekeeper
- Stack Mason
- Data Knox
- Booker
- Mission Control
- Bug Hunter
- Scribe

## Required Follow-Up Tasks

- Stack Mason or Launchpad: deploy `project-neo-api` to the production Supabase project.
- Launchpad: set required Supabase Edge Function secrets in Supabase only, without exposing them in frontend code or docs.
- Data Knox: confirm production migrations are applied before enabling live write flows.
- Shield: review production CORS, RLS, route protection, secret placement, and Vercel Deployment Protection expectations after the backend function exists.
- Gatekeeper: verify production auth redirects and provider settings after Supabase Auth is fully configured.
- Booker and Mission Control: retest public booking, availability, and admin review flows after API deployment.
- Bug Hunter: run production smoke tests after the backend blocker is cleared.
- Scribe: update release notes when the backend/API launch is confirmed.

## Risks or Blockers

- The static production site is live, but the Supabase `project-neo-api` Edge Function is not yet confirmed deployed.
- Booking, contact, availability, admin, and client portal workflows may show fallback or function-not-found behavior until the backend function and required production database setup are complete.
- The workspace now contains later uncommitted agent updates that are not confirmed live on the current Vercel production deployment.
- Public browser config is currently mirrored in `vercel.json` for launch reliability; move the same public values into Vercel dashboard environment variables when the project is fully configured.
- Host-level Vercel Authentication or Deployment Protection for preview/admin/client routes must be configured in Vercel if Shield requires that extra control beyond Supabase Auth.

## Testing Performed

- Confirmed Vercel production deployment reached `READY`.
- Confirmed `https://tookoldweb.vercel.app/` returns `200` without a Vercel Authentication interstitial.
- Confirmed clean URLs return `200` for `/booking`, `/about`, `/admin-login`, and `/client-portal`.
- Confirmed admin/client workflow pages return noindex headers where configured.
- Confirmed production `project-neo-config.js` is generated with public browser config and without server-only secret values.
- Ran the local static build path for production-style Vercel config.
- Ran deployment validation with the project validation script.

## Suggested Next Agent

Shield
