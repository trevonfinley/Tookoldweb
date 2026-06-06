# Agent Handoff - Clean Speed Insights Production Promotion

## Agent Name

Launchpad

## Agent Role

Project Neo Deployment Engineer

## Date

2026-06-01

## Task Summary

Promoted the clean Vercel deployment that removes private-page Speed Insights drift from Project Neo production. The clean deployment keeps Speed Insights on intended public pages through Vercel's static script route and removes the prior Vercel bot `speed-insights.js` drift from checked admin/client pages.

This task completes the Launchpad-owned Speed Insights drift promotion. It does not make Project Neo an official public launch because other launch blockers remain.

## Files Created

- `docs/agent-handoffs/2026-06-01-launchpad-clean-speed-insights-promotion.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/deployment-notes.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`

## Files Deleted

- None.

## Key Decisions Made

- Promoted the already-validated clean preview deployment instead of deploying the dirty local workspace.
- Used `vercel promote` through the official Vercel CLI so production aliases move to the existing clean build without rebuilding.
- Kept Project Neo on the static HTML/CSS/JS architecture; no Next.js migration was made.
- Kept Vercel Speed Insights scoped to public-page static build output.
- Recorded previous production deployment `dpl_2mKhqPH4g8CMvzwCZBfocXSGeTUU` as the rollback target.
- Kept official public launch status as NO-GO until the remaining launch blockers are cleared.

## Data/API/Schema Changes

- None.
- No Supabase schema, migration, Edge Function, API payload, auth, payment, invoice, admin, or client portal behavior was changed by this task.
- Production Supabase API remains `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api`.

## Environment Variable Changes

- None.
- No server-only secrets were added to Vercel.
- No Supabase service-role key, payment secret, calendar secret, OAuth secret, Apple private key material, webhook secret, token, password, or private credential was added to browser code or documentation.

## Security/Compliance Impact

- Resolved the documented production privacy drift where private/admin/client pages carried Speed Insights telemetry scripts.
- Verified production `admin-login` and `client-portal` clean URLs no longer include `speed-insights.js` or `/_vercel/speed-insights/script.js`.
- Verified production `admin-login` and `client-portal` still return `x-robots-tag: noindex, nofollow`.
- Verified the production homepage still includes the intended public-page Vercel Speed Insights script route.
- No official SOC 2 Type II or PCI-DSS compliance claim was made.

## Agents That Need This Update

- Shield
- Bug Hunter
- Scribe
- Scout
- Gatekeeper
- Neo Prime
- Pixel Frost

## Required Follow-Up Tasks

- Shield: Re-review private-page telemetry on production deployment `dpl_7WvwHohRDsFwmgSBaHK6zXF486Er`.
- Bug Hunter: Rerun the official-launch production regression against deployment `dpl_7WvwHohRDsFwmgSBaHK6zXF486Er`.
- Neo Prime / Launchpad: Keep official launch NO-GO until remaining launch blockers are cleared or owner-approved as deferrals.
- Gatekeeper: Provide approved production admin/client sessions for authenticated success-path QA.
- Booker / Pixel Frost / Stack Mason: Align production booking UI behavior with overnight windows accepted by the API.
- Launchpad / Gatekeeper / Shield: Record the final host-level Vercel protection decision for admin/client static shells.
- Launchpad / Owner: Confirm whether `https://tookoldweb.vercel.app` is the final launch domain or configure a custom domain.

## Risks or Blockers

- Official launch remains NO-GO.
- Final authenticated admin/client QA is still pending.
- Production booking UI overnight behavior remains a launch blocker from Bug Hunter's regression.
- Final domain remains open. Superseded 2026-06-01: the host-level Vercel protection decision is now recorded in `docs/decisions/2026-06-01-vercel-protection-decision.md`.
- The local workspace contains additional uncommitted launch-readiness changes; this promotion intentionally did not deploy the dirty workspace.

## Testing Performed

- Confirmed clean preview deployment `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ` was READY and tied to commit `e3a786830cdf65c14ff1b198de3c2058d36ef838`.
- Ran `npx vercel promote tookoldweb-31nlhz9up-trevonfinleys-projects.vercel.app --yes --scope trevonfinleys-projects`; Vercel created production deployment `dpl_7WvwHohRDsFwmgSBaHK6zXF486Er`.
- Confirmed new production deployment `dpl_7WvwHohRDsFwmgSBaHK6zXF486Er` is READY and targets production.
- Confirmed production aliases include `tookoldweb.vercel.app`, `tookoldweb-trevonfinleys-projects.vercel.app`, and the branch alias.
- Fetched `https://tookoldweb.vercel.app/`; confirmed status `200` and the intended `/_vercel/speed-insights/script.js` public-page script.
- Fetched `https://tookoldweb.vercel.app/_vercel/speed-insights/script.js`; confirmed status `200`.
- Fetched `https://tookoldweb.vercel.app/admin-login`; confirmed status `200`, `x-robots-tag: noindex, nofollow`, and no Speed Insights script reference in returned HTML.
- Fetched `https://tookoldweb.vercel.app/client-portal`; confirmed status `200`, `x-robots-tag: noindex, nofollow`, and no Speed Insights script reference in returned HTML.

## Suggested Next Agent

Bug Hunter, with Shield reviewing the telemetry/privacy result in parallel.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
