# Project Neo Admin Dashboard

Mission Control is the private DJ Too Kold admin workspace for bookings, clients, events, availability, invoices, payments, venues, media, and settings.

## Version 1 Scope

- Protected admin layout with Overview, Booking Inquiries, Clients, Events, Availability, Invoices, Payments, Venues, Media, and Settings.
- Overview cards for new inquiries, confirmed bookings, upcoming events, open invoices, and balance due.
- Booking inquiries table with status badges and a detail pane.
- Booking inquiry detail actions for protected status updates and private admin review notes.
- Basic event list with status filtering and empty states.
- Availability management with upcoming events, availability blocks, a create-block form, block type filters, and conflict indicators.
- Event and availability detail views surface API `conflict_warnings` plus dashboard-visible overlap checks.
- Payment detail actions for protected payment status updates after processor confirmation.
- Empty states for every section that has no records yet.

## Gatekeeper Notes

- The dashboard shell stays hidden until the browser has Project Neo config, a Supabase session, and a successful `/admin/me` response.
- Admin data must only load from `/admin/*` API routes after `requireAdmin` verifies an active `owner` or `admin` user.
- Dashboard pages use `noindex,nofollow` and should not expose service-role keys or private records in static HTML.

## Availability Notes

- Availability blocks are managed only through protected `/admin/availability-blocks` routes.
- Booking inquiries show `availability_status_at_submission`, `availability_checked_at`, and the requested window so Mission Control can see what the visitor saw when the inquiry was submitted.
- Public pages should only receive public-safe availability statuses and `public_message`; block titles and `internal_notes` remain admin-only.

## Sync Notes

- Sync owns future external calendar import/export behavior.
- External blackout windows that are not client events should sync into `availability_blocks`.
- Calendar IDs, sync metadata, and provider-specific conflict resolution should stay out of Mission Control until Sync defines those fields.

## Shield Notes

- Shield should verify anonymous users cannot read `availability_blocks` or private event details through exposed Data API routes.
- Shield should review public availability responses before launch and confirm `internal_notes`, block titles, client names, venue names, invoice data, and payment data are never returned publicly.

## Bug Hunter Notes

- Test block creation for `hold`, `unavailable`, `personal_block`, `travel_block`, `setup_day`, and `maintenance_day`.
- Test overlap indicators for event-to-event, event-to-block, and block-to-block conflicts.
- Test that booking inquiries display the historical availability snapshot without treating it as a confirmed booking.

## Ledger Notes

- Invoice and payment records stay behind protected admin routes.
- Store payment processor links, invoice IDs, and provider payment references only. Do not store card numbers, CVV, or other raw card data.
- The database ledger trigger owns `amount_paid_cents`, `deposit_paid_cents`, `balance_due_cents`, and invoice paid/overdue snapshots.
