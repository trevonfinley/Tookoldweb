# Agent Handoff - Official Production Deployment Readiness

## Agent Name

Launchpad

## Agent Role

Project Neo Deployment Engineer

## Date

2026-05-31

## Task Summary

Prepared the official production deployment gate for Project Neo and confirmed Vercel build settings, production-safe environment variable posture, current domain/HTTPS state, noindex and clean URL behavior, Speed Insights implementation status, rollback targets, and the production Supabase API URL.

Promotion is intentionally held. Project Neo remains NO-GO for official public launch until the blockers below are cleared.

## Files Created

- `docs/agent-handoffs/2026-05-31-launchpad-official-production-readiness.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`

## Files Deleted

- None.

## Key Decisions Made

- Did not promote the latest preview to production because the official launch readiness tracker remains NO-GO.
- Treated `https://tookoldweb.vercel.app` as the current production domain target. No custom launch domain is configured in Vercel yet.
- Confirmed the correct Speed Insights integration for the current static architecture is the Vercel static/vanilla script route, not the Next.js `<SpeedInsights />` component.
- Kept Vercel production environment expectations limited to browser-safe public values.
- Confirmed server-only values must remain outside browser-delivered Vercel config.
- Recorded current production deployment `dpl_2mKhqPH4g8CMvzwCZBfocXSGeTUU` as the active production rollback/reference point.
- Recorded latest clean preview candidate `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ` as the candidate that needs final QA before any promotion decision.

## Data/API/Schema Changes

- No database, schema, migration, API route, or payload changes were made by Launchpad in this task.
- Confirmed production Supabase project ref is `wgbyyaeivtavecaszler`.
- Confirmed production API URL is `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api`.
- Confirmed `project-neo-api` is active as full-route version 3 in Supabase.
- Confirmed production migrations are recorded for core schema, availability checker, RLS helper repair, and table grant hardening.

## Environment Variable Changes

- No environment variables were changed in this task.
- Confirmed Vercel build config uses public browser-safe values for app URL, API base URL, Supabase URL, Supabase publishable key, environment name, and public contact/admin email.
- Confirmed no Supabase service-role key is present in `vercel.json` or public browser config.
- Server-side only variables must remain out of frontend/Vercel browser config:
  - Supabase service role key
  - Payment provider secret keys or webhook secrets
  - Calendar provider secrets
  - Google OAuth client secret
  - Apple OAuth private key, team ID/private key material, and related sensitive credentials
  - Any webhook signing secret
  - Any private admin/client session token
- If `PROJECT_NEO_ALLOWED_ORIGIN` is used for the final domain, it must be set server-side for the Supabase Edge Function and kept exact-origin.

## Security/Compliance Impact

- HTTPS/HSTS are active on production Vercel responses checked during this task.
- Production admin/client clean URLs return `x-robots-tag: noindex, nofollow` and page-level noindex metadata.
- `robots.txt` allows public pages and disallows admin/auth/client portal shells.
- Current production contains Vercel bot `speed-insights.js` drift on private admin/client pages. This is a launch blocker until a clean release is promoted and rechecked.
- Latest clean preview candidate excludes Speed Insights from private admin/client pages, matching Shield's privacy expectation, but final QA is incomplete.
- No secrets, tokens, API keys, passwords, or private credentials were added to documentation.
- This task does not claim official SOC 2 Type II compliance or PCI-DSS compliance. Project Neo remains compliance-ready/aligned only until formal audit/assessment.

## Agents That Need This Update

- Shield
- Bug Hunter
- Gatekeeper
- Stack Mason
- Data Knox
- Scribe
- Scout
- Pixel Frost
- Mission Control
- Booker

## Required Follow-Up Tasks

- Gatekeeper: Provide or confirm approved production owner/admin and client portal sessions for authenticated success-path QA.
- Shield: Re-review Speed Insights/private-page telemetry after the clean release is promoted.
- Bug Hunter: Run final production desktop/mobile regression against the intended release deployment with approved production-safe test data.
- Launchpad: Promote only after launch readiness is GO, then record the production deployment ID and rollback target.
- Launchpad / Neo Prime: Decide whether `https://tookoldweb.vercel.app` is the official launch domain or configure/verify a custom domain and DNS.
- Launchpad / Gatekeeper / Shield: Record the final host-level protection decision for preview/admin/client static routes.
- Scribe: Keep release notes/status aligned with the final promotion decision.
- Scout: Revisit canonical URLs and sitemap once the final launch domain is confirmed.

## Risks or Blockers

- Official public launch remains NO-GO.
- Current production has Speed Insights drift on private admin/client pages.
- Latest clean preview is protected by Vercel Authentication, so normal unauthenticated public browsing could not be fully used for final launch QA.
- Authenticated admin/client success paths remain unverified without approved sessions.
- Pending local launch-readiness changes in this workspace still need review, commit, deployment, and verification before they can be treated as live.
- No custom final domain is configured; launching on the Vercel app domain may be acceptable only if the owner approves it.

## Testing Performed

- Reviewed Vercel project settings for framework, build command, output directory, clean URL behavior, latest production deployment, latest preview deployment, and configured domains.
- Reviewed `vercel.json` for build settings, clean URLs, headers, public browser config, and absence of server-only secrets.
- Verified current production deployment ID `dpl_2mKhqPH4g8CMvzwCZBfocXSGeTUU`.
- Verified latest preview deployment ID `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ`.
- Verified Supabase `project-neo-api` is active as version 3.
- Verified production API `GET /health` returned success.
- Verified production API CORS preflight allows `https://tookoldweb.vercel.app`.
- Verified production API public availability route returned a safe response.
- Verified production API overnight availability check returned a safe public response without `reason_code`.
- Verified production `robots.txt` disallows admin/auth/client portal shells.
- Verified production admin/client clean URLs return noindex headers.
- Verified clean preview candidate excludes Speed Insights from private admin/client pages.
- Verified current production still contains Vercel bot `speed-insights.js` drift on private admin/client pages.
- Ran `npm run build`; build passed and generated `dist`. Local shell reported browser API config is incomplete, so local fallback mode remains expected unless production env values are injected by Vercel.
- Ran `npm run validate`; deployment validation passed.
- Ran `git diff --check`; no whitespace errors were reported.

## Suggested Next Agent

Gatekeeper, then Bug Hunter.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
