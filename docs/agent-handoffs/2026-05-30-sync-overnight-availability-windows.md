# Agent Handoff - Overnight Availability Windows

## Agent Name

Sync

## Agent Role

Calendar Integration Engineer for Project Neo

## Date

2026-05-30

## Task Summary

Updated Project Neo calendar and availability logic so bookings can start on one calendar date and end after midnight on the next date, such as Saturday 10:00 PM to Sunday 2:00 AM. The work is complete locally, with Google Calendar integration still deferred.

## Files Created

- `docs/agent-handoffs/2026-05-30-sync-overnight-availability-windows.md`

## Files Modified

- `CHANGELOG.md`
- `admin.js`
- `booking.html`
- `client-portal.js`
- `docs/PROJECT_NEO_BACKEND.md`
- `docs/agent-status.md`
- `script.js`
- `supabase/functions/project-neo-api/index.ts`

## Files Deleted

- None.

## Key Decisions Made

- The selected `event_date` is the event start date.
- If `end_time` is equal to or earlier than `start_time`, the event ends on the next calendar day.
- Overnight events are converted into canonical `start_at` and `end_at` UTC windows before availability and conflict comparisons.
- Public, admin, and client-facing schedule text now labels overnight ranges with `next day` so the time span is understandable.
- Admin overrides remain allowed; the system should warn clearly about conflicts instead of silently blocking legitimate edge cases.

## Data/API/Schema Changes

- API behavior changed for event and availability payloads: `end_time <= start_time` is now a valid overnight window instead of an unclear time range.
- Event create/update payload handling now derives `start_at` and `end_at` from `event_date`, `start_time`, `end_time`, and timezone when both times are present.
- Conflict detection now compares canonical datetime windows and checks nearby dates so overnight events can conflict with events or blocks on the following calendar day.
- No database migration or table schema change was added.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Public availability output remains privacy-safe and does not expose client names, venue names, event titles, or internal notes.
- Overnight display labels expose only the submitted/checkable time range, not private event details.
- No secrets, tokens, passwords, payment data, or private credentials were added.
- Existing Shield findings around public availability scraping, public reason-code leakage, and `availability_blocks` RLS still require follow-up before launch.

## Agents That Need This Update

- Booker
- Stack Mason
- Data Knox
- Mission Control
- Shield
- Bug Hunter
- Scribe

## Required Follow-Up Tasks

- Stack Mason: deploy and verify the updated Edge Function behavior in the target Supabase environment.
- Data Knox: confirm existing `events.start_at`, `events.end_at`, `event_date`, `start_time`, `end_time`, and `timezone` fields support overnight storage without migration.
- Booker: verify public booking copy and inquiry flow expectations for overnight events.
- Mission Control: verify admin event creation/editing and conflict warnings for overnight bookings and blocks.
- Shield: review public availability responses after deployment to confirm private event data remains hidden.
- Bug Hunter: add regression tests for Saturday 10:00 PM to Sunday 2:00 AM availability checks, conflicting Sunday 1:00 AM events, all-day next-day blocks, and admin overrides.
- Scribe: keep availability documentation aligned with the next-day ending rule.

## Risks or Blockers

- Deno/Edge Function type checking could not be run locally because `deno` is not installed.
- Production API deployment was previously documented as unavailable or not reachable; this logic still needs deployed-environment verification.
- Equal start and end times are treated as a 24-hour overnight window for MVP simplicity.
- Google Calendar sync remains deferred and should not be connected until explicitly requested.

## Testing Performed

- `node --check script.js`
- `node --check admin.js`
- `node --check client-portal.js`
- `npm run validate`
- Browser smoke check against local `booking.html` confirmed overnight helper copy renders on the public availability checker and booking form.
- Attempted `deno check supabase/functions/project-neo-api/index.ts`, but `deno` was not installed in the local workspace.

## Suggested Next Agent

Bug Hunter

## Calendar Logic Changed

- Overnight windows are valid when `end_time <= start_time`.
- The event starts on `event_date` and ends on `event_date + 1 day`.
- Canonical UTC windows are used for availability and conflict comparisons where possible.

## Availability Status Behavior

- Public status mapping remains `available`, `pending`, `unavailable`, or `contact_required`.
- Overnight submissions should no longer return `contact_required` solely because the end time is earlier than the start time.
- Existing hold, pending, confirmed, travel, setup, maintenance, and personal block behavior remains unchanged.

## Conflict Detection Rules

- Two timed windows conflict when `a_start < b_end` and `b_start < a_end`.
- Overnight events are normalized before comparison.
- Conflict lookups include the selected date plus nearby previous/next dates so an event crossing midnight can conflict with early-morning next-day events or blocks.
- Cancelled and completed events remain non-blocking unless another agent changes status policy.

## Event/Block Assumptions

- `event_date` is a local start date, not necessarily the only date affected by the event.
- `start_time` and `end_time` are local wall-clock times in the event timezone.
- `availability_blocks` with canonical `start_at` and `end_at` are compared by absolute datetime windows.
- All-day or setup/travel day behavior remains based on block coverage and status policy defined in the prior Sync handoff.

## Public/Private Data Separation Notes

- Public pages must only show safe availability messages and the visitor-selected range.
- Public pages must not reveal private event title, client, venue, notes, block reason, sync IDs, or admin override details.
- Admin views can show exact event/block details to authorized users only.
- Client portal schedule text may show the client's own authorized event range, but must not expose other private bookings.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
