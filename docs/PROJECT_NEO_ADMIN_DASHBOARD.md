# Project Neo Admin Dashboard

Mission Control is the private DJ Too Kold admin workspace for bookings, clients, events, invoices, payments, venues, media, and settings.

## Version 1 Scope

- Protected admin layout with Overview, Booking Inquiries, Clients, Events, Invoices, Payments, Venues, Media, and Settings.
- Overview cards for new inquiries, confirmed bookings, upcoming events, open invoices, and balance due.
- Booking inquiries table with status badges and a detail pane.
- Basic event list with status filtering and empty states.
- Empty states for every section that has no records yet.

## Gatekeeper Notes

- The dashboard shell stays hidden until the browser has Project Neo config, a Supabase session, and a successful `/admin/me` response.
- Admin data must only load from `/admin/*` API routes after `requireAdmin` verifies an active `owner`, `admin`, or `staff` user.
- Dashboard pages use `noindex,nofollow` and should not expose service-role keys or private records in static HTML.

## Ledger Notes

- Invoice and payment records stay behind protected admin routes.
- Store payment processor links, invoice IDs, and provider payment references only. Do not store card numbers, CVV, or other raw card data.
- The database ledger trigger owns `amount_paid_cents`, `deposit_paid_cents`, `balance_due_cents`, and invoice paid/overdue snapshots.
