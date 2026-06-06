# Agent Handoff - Vercel Protection Decision

## Agent Name

Launchpad

## Agent Role

Project Neo Deployment Engineer, with Gatekeeper and Shield security coordination

## Date

2026-06-01

## Task Summary

Recorded the final Vercel protection decision for Project Neo. Production remains publicly reachable for MVP launch so visitors can use public marketing, booking, contact, availability, media, mixes, and service-package routes without a Vercel login wall. Private admin/client data remains protected by Supabase Auth, `project-neo-api` route authorization, and Postgres RLS.

This was a documentation and launch-gate decision task. No frontend design, backend code, Supabase schema, Vercel setting, or environment variable was changed.

## Files Created

- `docs/decisions/2026-06-01-vercel-protection-decision.md`
- `docs/agent-handoffs/2026-06-01-launchpad-vercel-protection-decision.md`

## Files Modified

- `CHANGELOG.md`
- `docs/PROJECT_NEO_AUTH.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`
- `docs/agent-status.md`
- `docs/agent-handoffs/2026-05-31-shield-launch-security-review.md`
- `docs/agent-handoffs/2026-06-01-launchpad-clean-speed-insights-promotion.md`
- `docs/agent-handoffs/2026-06-01-scribe-launch-documentation-consolidation.md`
- `docs/deployment-notes.md`

## Files Deleted

- None.

## Key Decisions Made

- Do not enable global Vercel Authentication or production Deployment Protection for the MVP production deployment.
- Keep production public routes reachable for visitor conversion, including booking, contact, availability, media, mixes, and service packages.
- Treat Supabase Auth, protected Edge Function routes, and RLS as the private-data boundary for admin, invoice/payment, event, client, contract, and portal records.
- Keep admin, auth, and client portal static shells `noindex,nofollow`, excluded from private telemetry, and unable to render protected records until authenticated API authorization succeeds.
- Keep preview/staging deployments behind Vercel Authentication or Deployment Protection where available because they are not the public booking surface.
- Revisit host-level protection if Project Neo later splits admin/client into a separate deployment, adopts middleware, or configures path-scoped host/firewall protection.

## Data/API/Schema Changes

- API routes/functions created or changed: None.
- Request formats changed: None.
- Response formats changed: None.
- Validation rules changed: None.
- Error handling behavior changed: None.
- Database tables touched: None.
- Schema/RLS changes: None.
- Existing expected behavior remains: unauthenticated `/admin/*` and `/portal/*` API requests should return safe `401` responses without private records.

## Environment Variable Changes

- None.
- No Vercel, Supabase, payment, OAuth, Apple, webhook, calendar, token, password, or private credential value was added or changed.
- No service-role key was exposed to Vercel, browser config, or documentation.

## Security/Compliance Impact

- Positive: closes the open launch decision by documenting the accepted security boundary for the static production deployment.
- Production public availability is intentional; it is not an authorization boundary.
- `noindex,nofollow` and hidden navigation are crawl/discovery controls only, not access controls.
- Admin/client privacy still depends on Supabase Auth, Edge Function authorization, and RLS.
- Preview/staging protection remains recommended where available.
- No official SOC 2 Type II or PCI-DSS compliance claim was made.

## Agents That Need This Update

- Launchpad
- Gatekeeper
- Shield
- Bug Hunter
- Scribe
- Mission Control
- Concierge
- Stack Mason
- Data Knox
- Booker
- Ledger

## Required Follow-Up Tasks

- Bug Hunter: include the recorded Vercel protection posture in final regression; verify public routes remain reachable and static admin/client shells expose no private data before authenticated API access.
- Shield: verify production private-route behavior, telemetry exclusion, CORS posture, and no secret/private-data exposure under this decision.
- Gatekeeper: provide approved production owner/admin and client sessions for authenticated success-path QA.
- Launchpad: keep preview/staging deployments protected where available and revisit this decision if the hosting architecture changes.
- Launchpad/Owner: still record the final launch domain decision and update CORS/canonical references if a custom domain replaces `https://tookoldweb.vercel.app`.
- Mission Control, Ledger, and Concierge: verify protected admin, invoice/payment, and portal success paths with approved sessions.
- Scribe: keep launch docs and handoff indexes aligned if this decision changes later.

## Risks or Blockers

- Official launch remains NO-GO until authenticated QA, final regression, final domain, and remaining launch gates are cleared or owner-approved as deferrals.
- Static admin/auth/client portal shells are still directly reachable by URL, so any future UI change that renders cached or embedded private data before API authorization would violate this decision.
- Vercel global production protection is intentionally not used for MVP; if the owner later requires a host-level admin wall, Launchpad/Gatekeeper/Shield must design a route-scoped or separate-deployment approach.
- Final production regression still needs to verify the behavior after all pending launch changes are deployed.

## Testing Performed

- Reviewed local deployment, auth, launch-readiness, deployment-note, agent-status, changelog, and decision-record docs.
- Searched local docs for old `pending` or `undecided` Vercel protection wording and replaced the launch-blocking decision language with verification follow-up.
- Documentation-only change; no application tests, Vercel setting changes, Supabase deploys, API calls, or schema checks were run.

## Suggested Next Agent

Bug Hunter, with Shield and Gatekeeper supporting final security/auth verification.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
