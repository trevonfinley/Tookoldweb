# Agent Handoff - Production Supabase Schema Applied

## Agent Name

Data Knox

## Agent Role

Project Neo database engineer

## Date

2026-05-31

## Task Summary

Verified the active Supabase project for Project Neo, applied the production database schema, fixed the `availability_blocks` RLS helper mismatch before launch, hardened browser-role table grants, and verified the resulting production schema state. No secrets, tokens, API keys, passwords, or private credentials are included in this note.

Production target confirmed through the Supabase connector:

- Project ref: `wgbyyaeivtavecaszler`
- Status: `ACTIVE_HEALTHY`
- Region: `us-west-2`
- Confirmation basis: this was the only visible Supabase project and it already contained the `project-neo-api` Edge Function.

## Files Created

- `supabase/migrations/20260531000000_fix_availability_blocks_rls_helper.sql`
- `supabase/migrations/20260531001000_harden_project_neo_table_grants.sql`
- `docs/agent-handoffs/2026-05-31-data-knox-production-supabase-schema.md`

## Files Modified

- `supabase/migrations/20260524000000_project_neo_availability_checker.sql`
- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None

## Key Decisions Made

- Treated `wgbyyaeivtavecaszler` as production because it was the only active visible Supabase project and already had the Project Neo Edge Function.
- Applied the schema through the Supabase connector because the local `supabase` CLI is not installed.
- Kept the active launch role model admin-only for operational table management: `owner` and `admin`.
- Fixed the `availability_blocks` policy to use `private.is_project_neo_admin()` because `private.is_project_neo_staff()` is intentionally absent in the active core migration set.
- Added a separate grant-hardening migration after production verification showed browser roles had extra non-DML privileges.
- Did not seed private client, booking, event, invoice, payment, or portal data.

## Data/API/Schema Changes

Production migrations applied:

- `project_neo_core_schema`
- `project_neo_availability_checker`
- `fix_availability_blocks_rls_helper`
- `harden_project_neo_table_grants`

Local migration file paths:

- `supabase/migrations/20260523000000_project_neo_core.sql`
- `supabase/migrations/20260524000000_project_neo_availability_checker.sql`
- `supabase/migrations/20260531000000_fix_availability_blocks_rls_helper.sql`
- `supabase/migrations/20260531001000_harden_project_neo_table_grants.sql`

Tables created in production:

- `users`
- `clients`
- `venues`
- `services`
- `packages`
- `package_services`
- `booking_inquiries`
- `contact_messages`
- `events`
- `invoices`
- `invoice_items`
- `payments`
- `contracts`
- `song_requests`
- `gallery_items`
- `mixes`
- `event_notes`
- `tasks`
- `availability_blocks`

Columns added or launch-critical columns verified:

- `availability_blocks`: `id`, `title`, `block_type`, `status`, `start_at`, `end_at`, `all_day`, `reason`, `internal_notes`, `public_message`, `created_by`, `created_at`, `updated_at`
- `events`: `start_at`, `end_at`
- `booking_inquiries`: `requested_start_at`, `requested_end_at`, `availability_status_at_submission`, `availability_checked_at`
- `clients`: `portal_user_id`
- `event_notes`: `client_editable`
- `invoices`: hosted payment and ledger fields including `payment_provider`, `payment_link_url`, `external_invoice_id`, `amount_paid_cents`, `deposit_paid_cents`, and `balance_due_cents`
- `payments`: `payment_date`, `payment_provider`, `provider_payment_id`

Columns removed or renamed:

- None

Relationships and foreign keys:

- `users.id` references `auth.users(id)`.
- `clients.portal_user_id` references `auth.users(id)`.
- `clients.created_by` references `users(id)`.
- `booking_inquiries.client_id` references `clients(id)`.
- `events.client_id` references `clients(id)`.
- `events.booking_inquiry_id` references `booking_inquiries(id)`.
- `events.venue_id` references `venues(id)`.
- `events.package_id` references `packages(id)`.
- `events.created_by` references `users(id)`.
- `package_services.package_id` references `packages(id)`.
- `package_services.service_id` references `services(id)`.
- `invoices.client_id` references `clients(id)`.
- `invoices.event_id` references `events(id)`.
- `invoice_items.invoice_id` references `invoices(id)`.
- `invoice_items.service_id` references `services(id)`.
- `invoice_items.package_id` references `packages(id)`.
- `payments.invoice_id` references `invoices(id)`.
- `contracts.client_id` references `clients(id)`.
- `contracts.event_id` references `events(id)`.
- `song_requests.event_id` references `events(id)`.
- `gallery_items.event_id` references `events(id)`.
- `event_notes.event_id` references `events(id)`.
- `event_notes.author_user_id` references `users(id)`.
- `tasks.event_id`, `tasks.booking_inquiry_id`, `tasks.client_id`, `tasks.assigned_to`, and `tasks.created_by` reference their related operational tables/users.
- `availability_blocks.created_by` references `users(id)`.

Indexes:

- Booking/contact: `booking_inquiries_created_at_idx`, `booking_inquiries_status_idx`, `booking_inquiries_status_created_at_idx`, `booking_inquiries_event_date_idx`, `booking_inquiries_client_id_idx`, `booking_inquiries_email_idx`, `booking_inquiries_city_state_idx`, `contact_messages_status_created_at_idx`, `contact_messages_email_idx`
- Availability/time lookup: `availability_blocks_start_at_idx`, `availability_blocks_end_at_idx`, `availability_blocks_status_window_idx`, `availability_blocks_type_window_idx`, `availability_blocks_time_range_gist_idx`, `events_start_at_idx`, `events_end_at_idx`, `events_conflict_time_range_gist_idx`, `booking_inquiries_requested_start_at_idx`, `booking_inquiries_requested_end_at_idx`, `booking_inquiries_availability_snapshot_idx`
- Events/calendar: `events_date_status_idx`, `events_availability_idx`, `events_client_id_idx`, `events_booking_inquiry_id_idx`, `events_venue_id_idx`, `events_package_id_idx`, `events_calendar_sync_id_uidx`
- Billing: `invoices_status_due_date_idx`, `invoices_client_id_idx`, `invoices_event_id_idx`, `invoices_created_at_idx`, `invoices_open_balance_idx`, `invoices_payment_provider_idx`, `invoice_items_invoice_id_idx`, `invoice_items_service_id_idx`, `invoice_items_package_id_idx`, `payments_invoice_id_idx`, `payments_status_paid_at_idx`, `payments_payment_date_idx`, `payments_provider_payment_id_uidx`
- Public media/catalog: `services_active_sort_idx`, `packages_active_sort_idx`, `gallery_items_public_idx`, `gallery_items_event_id_idx`, `gallery_items_category_public_idx`, `gallery_items_event_date_idx`, `gallery_items_tags_idx`, `mixes_public_idx`, `mixes_featured_idx`
- Portal/admin support: `clients_portal_user_id_idx`, `users_role_active_idx`, `event_notes_event_id_idx`, `event_notes_author_user_id_idx`, `event_notes_client_visible_idx`, plus task and contract indexes

Seed/public catalog data:

- Verified production has 4 `services`, 3 `packages`, and 7 `package_services` rows.

API changes:

- No Edge Function source was modified or deployed by Data Knox.
- Stack Mason should verify the deployed function against the production schema and decide whether the full local function should replace the reduced production function.

## Environment Variable Changes

- None

## Security/Compliance Impact

- RLS is enabled on all Project Neo production tables.
- `availability_blocks` now has exactly one management policy: `Project Neo admins manage availability blocks`, using `private.is_project_neo_admin()`.
- Production has `private.is_project_neo_admin()` only; no stale `private.is_project_neo_staff()` helper remains.
- Browser-role table grants were hardened:
  - `anon` can insert only `booking_inquiries` and `contact_messages`.
  - `anon` can select only active/published public catalog/media tables through RLS.
  - `authenticated` has DML privileges constrained by RLS.
  - `TRUNCATE`, `REFERENCES`, and `TRIGGER` are not granted to `anon` or `authenticated` on audited Project Neo tables.
- Sensitive payment data is not stored in the schema.
- This work does not claim SOC 2 Type II or PCI-DSS compliance; it only improves launch security posture.

## Agents That Need This Update

- Stack Mason
- Booker
- Mission Control
- Gatekeeper
- Ledger
- Sync
- Shield
- Scribe

## Required Follow-Up Tasks

- Stack Mason: verify deployed `project-neo-api` routes against the now-applied production schema and deploy the full function if the reduced function is still live.
- Booker: retest booking inquiry submission and confirm availability snapshot fields are written.
- Mission Control: verify admin reads/writes for clients, inquiries, events, availability blocks, media, invoices, payments, and dashboard summaries.
- Gatekeeper: create or confirm the first production owner/admin auth user and corresponding `public.users` row.
- Ledger: verify invoice/payment trigger behavior using approved test data only.
- Sync: verify overnight `start_at` / `end_at` windows and availability block conflict checks against production data.
- Shield: rerun RLS and public serialization review now that production schema is live and grants are hardened.
- Scribe: include this production schema milestone in release/version notes.

## Risks or Blockers

- Production database was empty before this work; no Project Neo private data was migrated.
- The active production Edge Function existed before schema application and may still be the reduced function documented by Stack Mason.
- Production migration history was created through the Supabase connector with connector-generated versions/names, not through the local Supabase CLI timestamp filenames. Future CLI-based migration workflows should compare migration history before running `supabase db push`.
- No production owner/admin `public.users` row was created by Data Knox because that requires a real `auth.users` identity.
- No live end-to-end write tests were performed with customer-like data.
- Local CLI validation remains unavailable because `supabase` and `psql` are not installed in this workspace.

## Testing Performed

- Confirmed production project `wgbyyaeivtavecaszler` is active and has `project-neo-api`.
- Confirmed production initially had no Project Neo public tables and no recorded migrations.
- Applied four Supabase connector migrations successfully.
- Verified migration records are present in production.
- Verified all required production tables exist.
- Verified `availability_blocks`, `events`, and `booking_inquiries` availability columns and `timestamptz` types.
- Verified RLS is enabled across the Project Neo production tables.
- Verified `availability_blocks` policy uses `private.is_project_neo_admin()`.
- Verified `private.is_project_neo_staff()` is absent.
- Verified availability/time indexes exist.
- Verified no `TRUNCATE`, `REFERENCES`, or `TRIGGER` grants remain for `anon` or `authenticated` on audited tables.
- Verified public catalog seed counts.

## Suggested Next Agent

Stack Mason should go next to verify and, if needed, deploy the full production Edge Function against the now-applied schema.
