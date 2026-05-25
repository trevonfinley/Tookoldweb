# Agent Handoff - Availability Checker Schema

- From: Data Knox, Database Engineer
- Date: 2026-05-24
- Scope: Supabase/PostgreSQL schema, indexes, RLS, and database handoff notes
- Migration: `supabase/migrations/20260524000000_project_neo_availability_checker.sql`

## What Changed

- Added `public.availability_blocks` for manual unavailable windows, holds, booked blocks, personal blocks, travel blocks, maintenance days, and setup days.
- Added exact conflict-check windows to `public.events`: `start_at timestamptz`, `end_at timestamptz`.
- Added availability snapshot fields to `public.booking_inquiries`:
  - `requested_start_at timestamptz`
  - `requested_end_at timestamptz`
  - `availability_status_at_submission`
  - `availability_checked_at timestamptz`
- Added btree indexes on `start_at` and `end_at`.
- Added GiST range indexes for fast overlap checks.
- Enabled RLS on `availability_blocks`.
- Blocked anonymous direct access to `availability_blocks`.
- Allowed only Project Neo staff/admin roles to manage `availability_blocks`.

## Table Relationship Explanation

`availability_blocks` is intentionally separate from `events`.

- `events` represents real event records tied to clients, inquiries, venues, packages, invoices, and admin operations.
- `availability_blocks` represents calendar windows that block or soften availability but may not be client events.
- `availability_blocks.created_by` references `users.id` so Mission Control can audit which staff user created a block.
- `booking_inquiries` stores the public availability result shown at submission time so Booker and Mission Control can see what the visitor saw when they submitted the inquiry.

Conflict checks should use both sources:

```sql
-- Event conflicts.
select id
from public.events
where start_at is not null
  and end_at is not null
  and status in ('pending', 'confirmed', 'hold')
  and tstzrange(start_at, end_at, '[)') && tstzrange(:requested_start_at, :requested_end_at, '[)');

-- Manual availability block conflicts.
select id, block_type, status, public_message
from public.availability_blocks
where tstzrange(start_at, end_at, '[)') && tstzrange(:requested_start_at, :requested_end_at, '[)');
```

Private event details should not be returned from either query in public responses.

## Suggested Lookup Indexes

The migration adds these date/time lookup indexes:

- `availability_blocks_start_at_idx`
- `availability_blocks_end_at_idx`
- `availability_blocks_status_window_idx`
- `availability_blocks_type_window_idx`
- `availability_blocks_time_range_gist_idx`
- `events_start_at_idx`
- `events_end_at_idx`
- `events_conflict_time_range_gist_idx`
- `booking_inquiries_requested_start_at_idx`
- `booking_inquiries_requested_end_at_idx`
- `booking_inquiries_availability_snapshot_idx`

Use the GiST range indexes for overlap checks. Use the btree indexes for ordering, dashboards, and bounded date filters.

## RLS And Security Notes

- Anonymous users must not query `availability_blocks` directly.
- Public API responses should expose only safe values: `available`, `pending`, `unavailable`, or `contact_required`.
- Internal `block_type`, `reason`, and `internal_notes` are not browser-facing fields.
- `public_message` is the only availability-block message intended for public display.
- Public availability responses must not include client names, venue names, invoice/payment data, internal event notes, exact private event titles, or `internal_notes`.
- Event `visibility` should continue to control whether a generic event label can be shown. Private events should only appear as sanitized unavailable windows.
- Booking inquiries may store `availability_status_at_submission`, but that value is a historical snapshot, not a guarantee that the date is still open.

## Handoff Notes

Booker:
- Use `booking_inquiries.availability_status_at_submission` and `availability_checked_at` when replying to leads.
- Treat `pending` and `contact_required` as follow-up opportunities, not automatic rejections.
- If a visitor submits while unavailable, preserve the inquiry and ask for alternate dates.

Mission Control:
- Build admin CRUD around `availability_blocks`.
- Show conflict warnings by checking both `events` and `availability_blocks`.
- Keep `reason` and `internal_notes` admin-only.
- Use `public_message` for the safe copy that can be returned to visitors.

Stack Mason:
- Own the API implementation.
- Public checker should query events and availability blocks, map internal results to safe public statuses, and return sanitized fields only.
- Booking inquiry creation should write `requested_start_at`, `requested_end_at`, `availability_status_at_submission`, and `availability_checked_at`.
- Do not return raw `availability_blocks` rows from public endpoints.

Shield:
- Review RLS and public API serialization before launch.
- Verify anonymous users cannot read `availability_blocks`, `events`, `clients`, `invoices`, `payments`, or private `event_notes`.
- Confirm public responses never leak `reason`, `internal_notes`, client details, venue details for private events, or exact private event titles.

Sync:
- Future calendar sync should populate `events.start_at` / `events.end_at` for real bookings.
- External blackout windows that are not client events should sync into `availability_blocks`.
- Preserve external IDs in a future sync-owned column if needed; Data Knox did not add that field in this schema pass to keep MVP scope tight.
