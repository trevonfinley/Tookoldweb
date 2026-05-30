# Agent Handoff - Availability Checker Schema Closeout

## 1. Agent Name

Data Knox

## 2. Agent Role

Database Engineer for Project Neo

## 3. Date

2026-05-26

## 4. Task Summary

Added database/schema support for the Project Neo Availability Checker. The work stays within Supabase/PostgreSQL scope and gives the backend, booking, admin dashboard, security, and sync agents a safe foundation for checking event availability without exposing private event or client details.

## 5. Files Created

- `supabase/migrations/20260524000000_project_neo_availability_checker.sql`
- `docs/agent-handoffs/2026-05-24-data-knox-availability-checker-schema.md`
- `docs/agent-handoffs/2026-05-26-data-knox-availability-checker-schema-closeout.md`

## 6. Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## 7. Files Deleted

- None

## 8. Key Decisions Made

- Created a dedicated `availability_blocks` table instead of overloading `events` for personal blocks, travel blocks, maintenance days, setup days, and manual holds.
- Added `events.start_at` and `events.end_at` as `timestamptz` conflict windows so backend code can perform precise overlap checks.
- Added booking inquiry snapshot fields so Booker and Mission Control can see the availability status shown to the visitor at submission time.
- Kept public-safe availability status separate from internal block details.
- Did not build frontend UI or API implementation because those belong to Stack Mason and Mission Control.

## 9. Data/API/Schema Changes

Schema changes:

- Added enum `project_neo_availability_block_type`.
- Added enum `project_neo_availability_status`.
- Added table `public.availability_blocks`.
- Added `start_at` and `end_at` to `public.events`.
- Added `requested_start_at`, `requested_end_at`, `availability_status_at_submission`, and `availability_checked_at` to `public.booking_inquiries`.
- Added time-order constraints for event and inquiry request windows.
- Added btree and GiST range indexes for fast date/time overlap checks.
- Added RLS and staff-only management policy for `availability_blocks`.

API changes:

- None implemented by Data Knox.
- Stack Mason should update public availability and booking inquiry endpoints to use the new schema.

## 10. Environment Variable Changes

- None

## 11. Security/Compliance Impact

- Anonymous direct access to `availability_blocks` is revoked.
- RLS allows only authenticated Project Neo staff/admin roles to manage availability blocks.
- Public responses must expose only safe statuses: `available`, `pending`, `unavailable`, or `contact_required`.
- `internal_notes`, `reason`, private event titles, client names, venue details for private events, invoice data, and payment data must not be returned to public users.
- No secrets, tokens, API keys, passwords, or private credentials were documented.

## 12. Agents That Need This Update

- Booker
- Mission Control
- Stack Mason
- Shield
- Sync

## 13. Required Follow-Up Tasks

- Stack Mason: update the availability API to check both `events` and `availability_blocks`, return sanitized public statuses, and write availability snapshots to `booking_inquiries`.
- Mission Control: build admin controls for managing availability blocks and viewing conflict warnings.
- Booker: use the inquiry availability snapshot when following up with leads.
- Shield: review RLS, public API serialization, and privacy behavior before launch.
- Sync: decide how external calendar blackout windows should map into `availability_blocks`.
- Data/Backend owner: backfill `events.start_at` and `events.end_at` for existing event records before relying on conflict checks in production.

## 14. Risks or Blockers

- Supabase CLI and `psql` were not installed in the workspace, so the migration was not applied or database-validated locally.
- Existing `events` rows will not conflict-check precisely until `start_at` and `end_at` are populated.
- Current public availability API code still needs Stack Mason updates to use `availability_blocks`.
- Privacy depends on API serialization as well as RLS; Shield should review both.

## 15. Testing Performed

- Reviewed current `events` and `booking_inquiries` schema before adding the migration.
- Verified the migration contains `availability_blocks`, event conflict fields, booking inquiry snapshot fields, date/time indexes, GiST overlap indexes, trigger setup, grants, and RLS policy.
- Verified no frontend UI files were intentionally modified by Data Knox for this schema task.
- Could not run `supabase db push`, `supabase db lint`, or `psql` validation because the commands are unavailable in this workspace.

## 16. Suggested Next Agent

Stack Mason should take the next implementation pass because the public availability endpoint and booking inquiry API need to consume the new schema safely.
