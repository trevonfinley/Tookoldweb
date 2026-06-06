# Agent Handoff - Launch Security Review

## Agent Name

Shield

## Agent Role

Project Neo Security/Compliance Engineer

## Date

2026-05-31

## Task Summary

Reviewed launch security for production Supabase RLS, Edge Function auth boundaries, admin/client route protection, public availability responses, CORS behavior, secret handling, payment data handling, noindex behavior, abuse protection, and compliance wording. Fixed launch-blocking security issues that were in Shield scope and documented the remaining launch dependencies.

## Files Created

- `docs/agent-handoffs/2026-05-31-shield-launch-security-review.md`

## Files Modified

- `supabase/functions/project-neo-api/index.ts`
- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`
- `docs/PROJECT_NEO_BACKEND.md`

## Files Deleted

- None.

## Key Decisions Made

- Public availability responses should not expose internal reason codes. The API now returns only safe public status, message, and checked timestamp.
- Public availability abuse protection should exist in the Edge Function for MVP launch. Added lightweight per-client in-memory throttling for `POST /availability-check` and `GET /availability`.
- Public availability checks should be bounded to a reasonable launch horizon. Added a 370-day future window and generic `contact_required` handling outside that range.
- Public availability feed should not enumerate private busy windows. `GET /availability` now returns only intentionally public events.
- Booking inquiry availability snapshots should be server-evaluated at submission time instead of trusting hidden browser-submitted snapshot fields.
- CORS should default to the production Vercel origin instead of a wildcard. Explicit `PROJECT_NEO_ALLOWED_ORIGIN=*` remains available only when intentionally configured.
- Host-level Vercel protection for admin/client routes remains a Launchpad/Gatekeeper decision; API authorization is still the data boundary.

## Data/API/Schema Changes

- No database schema changes were made by Shield in this pass.
- API response change: public availability responses no longer include `reason_code`.
- API behavior change: availability check requests outside the supported date horizon return safe `contact_required` output.
- API behavior change: public availability routes now rate limit repeated requests.
- API behavior change: booking inquiry submission recomputes availability server-side for the submitted window.
- API behavior change: `GET /availability` filters to `visibility = public` events only.
- CORS behavior change: default allowed origin is now `https://tookoldweb.vercel.app` unless `PROJECT_NEO_ALLOWED_ORIGIN` is explicitly configured.

## Environment Variable Changes

- No new environment variable was added.
- Existing `PROJECT_NEO_ALLOWED_ORIGIN` remains the production control for CORS. Launchpad should set it to the exact final production origin when the final domain is approved.
- Server-only secrets remain in Supabase Edge Function secrets only. No secret values were added to code or documentation.

## Security/Compliance Impact

- Positive launch security impact: closes public reason-code leakage, reduces availability scraping, avoids private-window enumeration in the public feed, and removes trust in client-submitted availability snapshot fields.
- Production RLS helper mismatch has already been fixed locally and documented through Data Knox's migration/status updates; Shield confirmed the current local availability policy uses `private.is_project_neo_admin()`.
- Edge Function admin routes require a valid Supabase Auth bearer token plus active `owner` or `admin` role.
- Edge Function portal routes require a valid Supabase Auth bearer token scoped through `clients.portal_user_id`.
- Payment data handling rejects submitted card number/CVV/expiration style fields before persistence.
- No official SOC 2 Type II or PCI-DSS compliance claim was found or added. Project Neo remains readiness/alignment only until formal audit/assessment validation.

## Agents That Need This Update

- Launchpad
- Stack Mason
- Data Knox
- Gatekeeper
- Mission Control
- Concierge
- Booker
- Bug Hunter
- Ledger
- Scribe

## Required Follow-Up Tasks

- Launchpad: deploy/promote these security changes before treating them as production-active.
- Launchpad: set `PROJECT_NEO_ALLOWED_ORIGIN` to the exact final production origin when the final domain changes from the current Vercel URL.
- Gatekeeper: provide approved production admin and client portal sessions for authenticated success-path verification.
- Bug Hunter: rerun production regression after deployment, including rate-limited availability behavior, public availability payload shape, noindex/private-page checks, and authenticated route boundaries.
- Mission Control/Concierge/Ledger: verify authenticated admin, portal, and payment-status workflows with approved sessions.
- Launchpad/Gatekeeper/Shield: record the final decision on whether Vercel Authentication or Deployment Protection is required for admin/client static routes.
- Launchpad: resolve or explicitly accept current Speed Insights/private-page telemetry deployment drift before launch.

## Risks or Blockers

- These Edge Function hardening changes are local until Stack Mason/Launchpad deploy the updated function.
- Authenticated admin and client success paths were not tested because no approved production access tokens were available in this session.
- In-memory rate limiting is MVP abuse protection, not a durable cross-instance WAF. If abuse appears, Launchpad should add provider-level rate limiting.
- CORS is not an authorization boundary; admin/client data still depends on bearer-token checks and RLS.
- Superseded 2026-06-01: host-level protection for static admin/client pages is now recorded in `docs/decisions/2026-06-01-vercel-protection-decision.md`.
- Speed Insights production drift remains a privacy launch risk until the clean local build is promoted or the drift is accepted.

## Testing Performed

- Static review of RLS migrations, Edge Function auth helpers, public availability serialization, CORS helper, card-data rejection, noindex headers, secret references, and compliance wording.
- Searched for service-role/payment secret exposure patterns in browser-delivered code and documentation.
- Searched for official SOC 2 Type II / PCI-DSS compliance claim wording.
- Confirmed `reason_code` no longer appears in `supabase/functions/project-neo-api/index.ts`.
- Ran `npm run validate` successfully.
- Ran `npm run build` successfully; build reported fallback mode because public browser API config is incomplete in the local shell.
- Ran `git diff --check` successfully on the Shield-touched files.
- Could not run Deno/Edge Function type checking because `deno` is not installed in this workspace.

## Suggested Next Agent

Launchpad, then Bug Hunter after deployment.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
