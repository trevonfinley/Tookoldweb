# Agent Handoff - Event Prep Checklist Schema

## Agent Name

Data Knox

## Agent Role

Database Engineer for Project Neo

## Date

2026-06-24

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Added database support for the Event Prep Checklist feature. The work is complete for schema, relationships, indexes, seeded default items, RLS policies, and documentation. No frontend, admin dashboard, backend API, Square, or payment-provider integration was implemented.

## Files Created

- `supabase/migrations/20260624000000_project_neo_event_prep_checklists.sql`
- `docs/agent-handoffs/2026-06-24-data-knox-event-prep-checklist-schema.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/qa/bug-tracker.md`

## Files Deleted

- None.

## Key Decisions Made

- Event prep data is private/admin-only by default.
- Used dedicated `event_prep_*`, `event_gear_items`, `event_timeline_items`, and `event_music_notes` tables instead of adding many prep fields directly to `events`.
- Added `event_prep_default_items` so standard checklist templates can be managed separately from event-specific checklist rows.
- Stored deposit, balance, and contract values as safe status snapshots for prep review rather than raw payment/provider data.
- Added composite checklist/event foreign keys for gear, timeline, and music-note records so optional checklist links cannot point to a different event.
- Did not add Square API integration, payment processing fields, card numbers, CVV/CVC, PAN, or raw cardholder data.

## Architecture Changes

- Database-only schema extension for admin event preparation workflows.
- No routing, frontend, API, deployment, or folder architecture changes were made.

## Folder/File Structure Changes

- Added one Supabase migration under `supabase/migrations/`.
- Added this handoff note under `docs/agent-handoffs/`.

## New Conventions

- Event prep tables use the `event_prep_` prefix where the table is checklist-specific.
- Event operational detail tables use clear domain names: `event_gear_items`, `event_timeline_items`, and `event_music_notes`.
- Event prep sections are normalized through `public.project_neo_event_prep_section`.

## Affected Modules

- Supabase PostgreSQL schema.
- Future protected admin APIs.
- Future Mission Control admin dashboard workflow.
- Future QA/security checks for admin-private event preparation data.

## Data/API/Schema Changes

Migration file: `supabase/migrations/20260624000000_project_neo_event_prep_checklists.sql`.

Tables created:
- `event_prep_checklists`
- `event_prep_default_items`
- `event_prep_items`
- `event_gear_items`
- `event_timeline_items`
- `event_music_notes`

Columns added:
- `event_prep_checklists`: `id`, `event_id`, `status`, `final_confirmation_status`, `contract_status_snapshot`, `deposit_status_snapshot`, `balance_status_snapshot`, `clean_or_explicit_preference`, `crowd_type`, `event_vibe`, `internal_notes`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- `event_prep_default_items`: `id`, `section`, `title`, `description`, `is_required`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `event_prep_items`: `id`, `checklist_id`, `section`, `title`, `description`, `status`, `is_required`, `due_at`, `completed_at`, `completed_by`, `sort_order`, `created_at`, `updated_at`.
- `event_gear_items`: `id`, `event_id`, `checklist_id`, `gear_name`, `category`, `quantity`, `status`, `notes`, `created_at`, `updated_at`.
- `event_timeline_items`: `id`, `event_id`, `checklist_id`, `time_label`, `title`, `description`, `sort_order`, `created_at`, `updated_at`.
- `event_music_notes`: `id`, `event_id`, `checklist_id`, `music_preference_summary`, `must_play_notes`, `do_not_play_notes`, `special_songs_notes`, `announcements_notes`, `clean_or_explicit_preference`, `created_at`, `updated_at`.

Enums created:
- `project_neo_event_prep_status`: `not_started`, `in_progress`, `ready`, `completed`, `needs_review`.
- `project_neo_event_prep_item_status`: `not_started`, `in_progress`, `completed`, `blocked`, `not_applicable`.
- `project_neo_event_prep_section`: `Client`, `Venue`, `Timeline`, `Music`, `Gear`, `Payments`, `Contract`, `Final Confirmation`, `Internal Notes`.
- `project_neo_event_prep_confirmation_status`: `not_started`, `pending`, `confirmed`, `needs_review`, `not_applicable`.
- `project_neo_event_prep_payment_snapshot_status`: `not_required`, `not_requested`, `requested`, `partially_paid`, `paid`, `overdue`, `needs_review`.
- `project_neo_clean_or_explicit_preference`: `clean_only`, `clean_preferred`, `explicit_allowed`, `client_discretion`, `not_specified`.
- `project_neo_event_gear_status`: `needed`, `packed`, `loaded`, `set_up`, `returned`, `not_applicable`.

Relationships and foreign keys:
- `event_prep_checklists.event_id` references `events.id` with cascade delete.
- `event_prep_checklists.created_by` and `updated_by` reference `users.id`.
- `event_prep_items.checklist_id` references `event_prep_checklists.id` with cascade delete.
- `event_prep_items.completed_by` references `users.id`.
- `event_gear_items.event_id` references `events.id`; `(checklist_id, event_id)` references `(event_prep_checklists.id, event_prep_checklists.event_id)`.
- `event_timeline_items.event_id` references `events.id`; `(checklist_id, event_id)` references `(event_prep_checklists.id, event_prep_checklists.event_id)`.
- `event_music_notes.event_id` references `events.id`; `(checklist_id, event_id)` references `(event_prep_checklists.id, event_prep_checklists.event_id)`.

Indexes:
- `event_prep_checklists_event_id_idx`
- `event_prep_checklists_status_idx`
- `event_prep_checklists_confirmation_idx`
- `event_prep_default_items_active_sort_idx`
- `event_prep_items_checklist_section_sort_idx`
- `event_prep_items_status_due_idx`
- `event_prep_items_completed_by_idx`
- `event_gear_items_event_status_idx`
- `event_gear_items_checklist_sort_idx`
- `event_timeline_items_event_sort_idx`
- `event_timeline_items_checklist_sort_idx`
- `event_music_notes_event_id_idx`

RLS recommendations and implemented policies:
- RLS is enabled on all new event prep tables.
- `anon` and baseline `authenticated` table grants are revoked before controlled grants.
- Authenticated users receive table privileges, but RLS limits access to Project Neo admins through `private.is_project_neo_admin()`.
- No client portal or public policies were added.
- Keep future client-facing event prep surfaces in separate client-safe views or policies rather than exposing these admin tables directly.

Default checklist items seeded:
- Confirm primary contact.
- Confirm guest count and crowd type.
- Verify venue address and load-in.
- Confirm power and table needs.
- Build event timeline.
- Confirm overnight timing if applicable.
- Review music preferences.
- Confirm clean or explicit preference.
- Prepare gear list.
- Check deposit and balance status.
- Check contract status.
- Send final confirmation.
- Review private admin notes.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Event prep records are private/admin-only at the table/RLS layer.
- Internal notes, gear notes, timeline details, music notes, and operational prep details must not be exposed publicly.
- No raw payment card data fields were added.
- No CVV/CVC, card number, PAN, card expiration, raw cardholder data, raw payment credential, provider secret, webhook secret, or Square token fields were added.
- Square integration remains out of scope and was not implemented.
- Data retention note: prep records cascade with their parent event. If legal/retention requirements change, Data Knox and Shield should define a retention/archive policy before deleting event records.

## Agents That Need This Update

- Mission Control
- Stack Mason
- Booker
- Sync
- Shield
- Bug Hunter
- Scribe
- Ledger
- Gatekeeper

## Required Follow-Up Tasks

- Stack Mason: add protected admin API routes for creating prep checklists from defaults and managing checklist items, gear, timeline, and music notes.
- Mission Control: add admin-only UI after protected APIs exist.
- Booker: map booking inquiry preferences into event prep defaults only through approved backend/admin flows.
- Sync: account for event prep timeline and overnight timing context if calendar workflows later consume these records.
- Shield: review the migration, RLS policies, and any future API serialization before launch.
- Bug Hunter: retest admin-only access, no public exposure, checklist defaults, completion states, and status snapshots after APIs/UI are implemented.
- Scribe: keep docs/versioning aligned with this schema addition.
- Ledger: review deposit/balance snapshot mappings when invoice/payment workflow is wired to prep checklists.
- Gatekeeper: confirm admin-role access remains aligned with `private.is_project_neo_admin()`.

## Risks or Blockers

- Migration has not been applied to a live Supabase project in this task.
- No backend API exists yet for the new tables.
- No admin dashboard workflow exists yet for creating or editing prep checklists.
- Default items are seeded but not automatically copied to an event checklist until Stack Mason implements that admin/backend flow.
- Table-level RLS does not prove future Edge Function/API serialization behavior; Shield and Bug Hunter must retest after implementation.

## Testing Performed

- Reviewed existing core and availability migrations for `events`, `clients`, `booking_inquiries`, `venues`, `invoices`, `payments`, `contracts`, and `song_requests`.
- Reviewed the Event Prep Checklist roadmap brief before schema design.
- Added SQL migration with relationships, indexes, triggers, RLS policies, and seeded defaults.
- Ran `npm run validate`; passed.
- Ran `git diff --check` on tracked touched documentation files; passed.
- Ran a focused trailing-whitespace scan across the new migration, new handoff, and touched documentation; passed.
- Ran focused scans for cardholder-data, Square/provider, secret, and token terms; the new SQL migration did not add those fields, and documentation matches were limited to explicit safety notes.
- Live Supabase migration application was not performed in this task.

## Suggested Next Agent

Stack Mason, then Mission Control.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
