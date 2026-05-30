# Agent Handoff - Availability Checker Security Review

## Agent Name

Shield

## Agent Role

App Security Engineer

## Date

2026-05-26

## Task Summary

Reviewed the Project Neo Availability Checker implementation for public data exposure, `availability_blocks` protection, safe public responses, admin-only availability management, and abuse risks. The public checker mostly returns safe status/message fields and avoids client names, venue names, event titles, and internal notes, but the review found a critical RLS helper mismatch and medium-risk schedule scraping issues.

## Files Created

- `docs/agent-handoffs/2026-05-26-shield-availability-checker-security-review.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted, if any

- None.

## Key Decisions Made

- Treated the missing `private.is_project_neo_staff()` helper in the availability migration as a launch-blocking security issue because proper RLS enforcement for `availability_blocks` cannot be confirmed.
- Kept the work to security review and documentation; no schema, API, frontend, or admin implementation files were changed by Shield.
- Confirmed `POST /availability-check` queries only minimal event/block fields and returns public-safe statuses/messages, with no client names, venue names, event titles, or internal notes.
- Classified public availability scraping and public reason-code leakage as medium risk because they reveal schedule intelligence, even though they do not expose private client records.
- Left implementation ownership to Stack Mason, Data Knox, Booker, and Mission Control.

## Data/API/Schema Changes

- No data, API, or schema changes were made.
- Required future schema fix: update `supabase/migrations/20260524000000_project_neo_availability_checker.sql` so the `availability_blocks` RLS policy uses an existing admin/staff predicate, likely `private.is_project_neo_admin()`, or intentionally recreate a stable `private.is_project_neo_staff()` function.
- Required future API hardening: remove or collapse public `reason_code` values, rate limit public availability endpoints, cap the checkable date horizon, and consider coarser public availability output.
- Required future booking integrity fix: recompute the availability snapshot server-side during inquiry submission instead of trusting hidden client-submitted snapshot fields.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Positive documentation impact only; no controls were changed in this pass.
- Critical blocker documented: `availability_blocks` RLS cannot be confirmed because the availability policy references `private.is_project_neo_staff()`, while the core migration defines `private.is_project_neo_admin()` and drops old staff helpers.
- Public checker privacy posture is mostly sound for private details, but launch should wait for RLS correction and scraping mitigations.
- No secrets, tokens, API keys, passwords, payment card data, private credentials, or private client data were documented.

## Agents That Need This Update

- Stack Mason
- Data Knox
- Booker
- Mission Control
- Bug Hunter
- Launchpad
- Gatekeeper
- Scribe

## Required Follow-Up Tasks

- Stack Mason/Data Knox: fix and verify the `availability_blocks` RLS policy before launch.
- Stack Mason: remove public `reason_code` leakage or make it generic/internal only.
- Stack Mason/Launchpad: add rate limiting or equivalent abuse protection for `POST /availability-check` and `GET /availability`.
- Stack Mason/Booker: cap date ranges and consider coarser public responses so visitors cannot map exact private busy windows.
- Stack Mason: recompute booking availability snapshots server-side during inquiry submission.
- Bug Hunter: add tests proving anonymous users cannot query `availability_blocks` directly and public responses never expose private event/client/venue/internal note fields.
- Mission Control: keep admin availability management behind `requireAdmin` and continue treating the admin dashboard as privileged only.

## Risks or Blockers

- `supabase/migrations/20260524000000_project_neo_availability_checker.sql` lines 125-131 reference `private.is_project_neo_staff()`, which does not exist in the active core migration set.
- `POST /availability-check` and `GET /availability` can be used to enumerate busy windows if left unthrottled.
- `publicAvailabilityResult()` currently includes optional `reason_code` in public responses.
- `availabilitySnapshotForBooking()` currently accepts a client-submitted availability snapshot when present.
- Live Supabase RLS enforcement was not tested in this review.

## Testing Performed

- Static code review of availability migration, Edge Function availability logic, public booking checker, and admin availability request flow.
- Searched local code for `private.is_project_neo_staff()` and `private.is_project_neo_admin()` usage.
- Verified admin availability routes pass through `requireAdmin()` in the Edge Function.
- No Supabase CLI migration test, live database RLS test, browser test, or API integration test was run.

## Suggested Next Agent

Stack Mason, with Data Knox support for the RLS migration fix.
