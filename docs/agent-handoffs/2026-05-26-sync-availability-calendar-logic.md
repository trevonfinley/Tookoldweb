# Agent Handoff - Availability Checker Calendar Logic

## Agent Name

Sync

## Agent Role

Calendar Integration Engineer for Project Neo

## Date

2026-05-26

## Task Summary

Designed the MVP calendar logic for the public Availability Checker. Reviewed the existing `events` and `availability_blocks` model, defined public-safe conflict rules, mapped internal schedule statuses to public availability statuses, clarified all-day block behavior, documented travel/setup block handling, and scoped future Google Calendar sync notes without building external calendar integration.

## Files Created

- `docs/agent-handoffs/2026-05-26-sync-availability-calendar-logic.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted, if any

- None.

## Key Decisions Made

- Keep MVP conflict detection based on simple half-open time windows: requested start is before existing end, and requested end is after existing start.
- Treat `events` as booking records and `availability_blocks` as non-booking schedule blockers or soft-review windows.
- Keep public availability output limited to `available`, `pending`, `unavailable`, and `contact_required`.
- Keep overnight or unclear public requests as `contact_required` for MVP.
- Allow admin overrides only through protected admin review, with internal notes explaining the override.

## Data/API/Schema Changes

- None made in this task.
- Reviewed existing schema support for `events.start_at`, `events.end_at`, `events.calendar_sync_id`, and `availability_blocks`.
- Recommended that future Google Calendar sync add sync metadata to `availability_blocks` before importing external blackout windows.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Documentation-only security impact.
- Reaffirmed that public availability responses must not expose client names, venue details, private event titles, block titles, internal notes, invoices, payments, provider metadata, secrets, tokens, API keys, passwords, or private credentials.
- Reaffirmed that anonymous users should not directly query `availability_blocks`.

## Agents That Need This Update

- Stack Mason
- Booker
- Mission Control
- Shield
- Data Knox
- Bug Hunter
- Scribe

## Required Follow-Up Tasks

- Stack Mason: keep the public checker API response sanitized and status-only.
- Booker: treat checker results as estimates, not booking confirmations.
- Mission Control: require admin notes for conflict overrides.
- Shield: verify public responses and RLS before launch.
- Data Knox: add `availability_blocks` sync metadata only when calendar sync becomes active.
- Bug Hunter: test event/block conflicts, all-day blocks, travel blocks, setup days, and override paths.

## Risks or Blockers

- Google Calendar sync is intentionally deferred.
- `availability_blocks` does not yet have a provider sync ID field.
- Public checker behavior should remain conservative until real booking load proves the edge cases.
- Overnight public events are not an MVP availability-check path and should stay manual review unless Booker and Sync revisit the rule.

## Testing Performed

- Documentation and schema review only.
- Reviewed existing Supabase migration and Edge Function availability logic.
- No application tests were run because no app code or schema was changed in this task.

## Suggested Next Agent

Shield
