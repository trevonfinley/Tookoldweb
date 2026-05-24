# Project Neo Database Schema

Project Neo uses Supabase Postgres for DJ Too Kold booking operations, event management, billing, media, and a future client portal. The executable SQL lives in `supabase/migrations/20260523000000_project_neo_core.sql`.

## Core Statuses

- Booking inquiry: `new`, `reviewing`, `quoted`, `deposit_requested`, `confirmed`, `completed`, `cancelled`
- Event: `inquiry`, `pending`, `confirmed`, `completed`, `cancelled`, `hold`
- Invoice: `draft`, `sent`, `partially_paid`, `paid`, `overdue`, `cancelled`
- Payment: `pending`, `paid`, `failed`, `refunded`
- Contract: `draft`, `sent`, `signed`, `expired`, `cancelled`
- Task: `todo`, `in_progress`, `waiting`, `done`, `cancelled`
- Song request: `requested`, `approved`, `declined`, `played`

## Invoice Workflow

1. Staff creates a `draft` invoice for a client and event, with a total amount, deposit amount, due date, and optional notes or terms.
2. If Square or Stripe is used, staff stores the hosted checkout URL and external invoice/payment-link reference on the invoice. Project Neo never stores card numbers, CVV/CVC values, or card expiration data.
3. When the invoice is sent, status moves to `sent`. If it passes `due_date` before collection, admin invoice/dashboard reads refresh it to `overdue`.
4. Deposits, balances, refunds, and other collections are tracked as `payments` tied to the invoice. These records store provider/reference/status data only.
5. Paid payment records update the invoice snapshots: `amount_paid_cents`, `deposit_paid_cents`, and `balance_due_cents`.
6. Invoice status stays dashboard-friendly: `partially_paid` when any balance has been collected, `paid` when the full total is collected, and `cancelled` when staff intentionally closes the invoice.

## Table Descriptions

| Table | Purpose |
| --- | --- |
| `users` | Auth-linked Project Neo owner, admin, staff, DJ, and client profiles. Used for role-based access control. |
| `clients` | Private customer records, with optional `portal_user_id` for future client portal login. |
| `booking_inquiries` | Public booking leads submitted from the website, including contact info, event timing, venue, setup, music preferences, budget range, referral source, notes, and staff review state. |
| `contact_messages` | General public contact form messages. Kept separate from booking leads. |
| `venues` | Reusable venue records with address, contact, load-in, parking, and power notes. |
| `services` | Individual sellable services such as DJ performance, MC, ceremony sound, or uplighting. |
| `packages` | Bundled offers with price, deposit, duration, and public feature bullets. |
| `package_services` | Join table connecting packages to the services they include. |
| `events` | Calendar records for inquiries, pending events, confirmed bookings, holds, completed events, and cancellations tied to clients, inquiries, venues, and packages. |
| `invoices` | Invoice headers, status, dates, totals, deposit amount, collected deposit snapshot, balance due snapshot, terms, and hosted payment-link metadata. |
| `invoice_items` | Invoice line items. Items can reference a service, a package, or be custom text. |
| `payments` | Separate payment tracking records with provider, amount, payment date, status, and external processor reference. Card numbers, CVV/CVC, and expiration are not stored. |
| `contracts` | Contract status, terms/document link, signature metadata, and lifecycle dates. |
| `song_requests` | Client or guest song requests for an event, including must-play and approval status. |
| `gallery_items` | Publishable media library records tied optionally to an event. Records include title, description, media category, file URL, thumbnail URL, event date, venue, tags, featured status, display order, and optional Supabase Storage or external embed metadata. |
| `mixes` | Publishable DJ mix records with audio or embed URLs, cover art, featured status, and display order. |
| `event_notes` | Internal or client-visible notes attached to events. Defaults to private. Staff can mark a public note as client-editable for portal preference updates. |
| `tasks` | Follow-up tasks for staff, optionally tied to a client, inquiry, or event. |

All tables use UUID primary keys plus `created_at` and `updated_at`. An update trigger keeps `updated_at` fresh.

## Relationships

- `users.id` references `auth.users.id`.
- `clients.portal_user_id` optionally references `auth.users.id` for the future portal.
- `booking_inquiries.client_id` links a lead to a client after staff review.
- `events.client_id`, `events.booking_inquiry_id`, `events.venue_id`, and `events.package_id` connect events to the booking pipeline.
- `packages` and `services` are many-to-many through `package_services`.
- `invoices.client_id` and `invoices.event_id` attach billing to the customer and event.
- `invoice_items.invoice_id` cascades when an invoice is removed.
- `payments.invoice_id` cascades with its invoice and connects payments to clients/events through the invoice.
- `contracts.client_id` and `contracts.event_id` keep agreements tied to the event workflow.
- `song_requests.event_id` and `event_notes.event_id` cascade with their event.
- `gallery_items.event_id` is optional so public portfolio content can stand alone.
- `tasks` can attach to an event, inquiry, client, or only an assigned staff user.

## Suggested Indexes

The migration adds indexes for the main operating screens:

- Inbox and dashboard: `booking_inquiries(status)`, `booking_inquiries(status, created_at desc)`, `booking_inquiries(created_at desc)`, `booking_inquiries(city_state)`, `contact_messages(status, created_at desc)`
- Scheduling: `events(event_date, status)`, `events(event_date, status, visibility)`, plus event foreign-key indexes and a unique partial index on `events.calendar_sync_id` for future calendar sync references
- Billing: `invoices(status, due_date)`, `invoices(client_id)`, `invoices(status, due_date, balance_due_cents)` for open balances, `payments(invoice_id)`, `payments(status, paid_at desc)`, and `payments(payment_date desc)`
- Catalog and public pages: `services(is_active, sort_order, name)`, `packages(is_active, sort_order, name)`, `gallery_items(is_published, sort_order, created_at desc)`, `gallery_items(media_category, is_published, sort_order)`, `gallery_items(tags)`, `mixes(is_published, sort_order, created_at desc)`
- Client portal: `clients(portal_user_id)`, invoice/event foreign-key indexes
- Work management: `tasks(assigned_to, status, due_at)`, plus task relationship indexes

There is also a partial unique index for payment provider IDs so duplicate Stripe/Square/processor webhooks do not create duplicate payment records.

## RLS Model

Row Level Security is enabled on every table.

- `authenticated` receives table privileges needed for RLS-protected admin and portal access.
- `anon` receives only public catalog/media `select` privileges and inquiry/message `insert` privileges.
- Public anonymous users can insert only new booking inquiries and contact messages. Public booking inserts must include the core admin-review fields: client name, event date, event type, city/state, and estimated guest count.
- Public anonymous users can read only active services, active packages, package-service mappings for active packages, published gallery items, and published mixes.
- Authenticated `owner` and `admin` users can manage operational data.
- `owner` and `admin` users can manage `users`.
- `staff` is reserved for future assigned-task access and does not receive admin dashboard access by default.
- `dj` is reserved for future assigned-event access and does not receive admin access by default.
- `client` is reserved for portal identities; current portal ownership is enforced through `clients.portal_user_id`.
- Portal clients can read their own client profile, events, invoices, invoice items, payments, contracts, and non-private event notes.
- Portal clients can add or edit song requests only for their own events, and only while the request status remains `requested`.
- Client note updates are handled through the authenticated portal API and require the note to be non-private, attached to the client event, and marked `client_editable = true`.
- Private client data is never exposed to anonymous users through table policies or public availability responses.

Admin access is controlled by `public.users`:

```sql
insert into public.users (id, role, full_name, email)
values ('AUTH_USER_ID_HERE', 'owner', 'DJ Too Kold', 'admin@example.com');
```

Use a service-role connection or Supabase SQL editor for the first bootstrap insert.

Security-definer role helper functions are created in the private schema, not in the exposed `public` schema.

## Seed Data

The migration seeds public catalog data only:

- Services: DJ Performance, MC and Announcements, Ceremony Sound, Uplighting
- Packages: Essentials, Signature, Elite Experience
- Package-service mappings for those packages

No client, inquiry, invoice, payment, or contract seed data is included because those records are private business data.

## Notes

- Money is stored in integer cents.
- Emails use `citext` for case-insensitive uniqueness.
- Booking inquiries keep both derived `full_name` and separate `first_name` / `last_name` columns so public forms stay friendly while admin review and exports remain structured.
- Booking inquiry setup values are constrained to `indoor`, `outdoor`, `both`, or `not_sure`.
- Invoices intentionally store totals as snapshots so invoices stay historically accurate even if package pricing changes later.
- `amount_paid_cents`, `deposit_paid_cents`, and `balance_due_cents` are ledger snapshots maintained from `payments` by database triggers.
- Invoice status is recalculated from tracked payments: fully collected invoices become `paid`, partial collections become `partially_paid`, and sent unpaid invoices past `due_date` become `overdue`.
- Hosted Square or Stripe checkout details belong on the invoice as `payment_provider`, `payment_link_url`, `payment_link_expires_at`, `external_invoice_id`, and `external_invoice_url`; Project Neo stores the link and reference, not card data.
- Events keep `venue_name` and `location` snapshot fields in addition to optional `venue_id`, which supports one-off venues and protects past event details if a venue record changes.
- Event visibility is stored as `public` or `private`. Admin records keep full event details; public availability uses only sanitized busy windows and generic labels.
- `calendar_sync_id` is reserved for future Google Calendar or external calendar event IDs. No external calendar API is connected by default.
- Sensitive payment fields such as card number, CVC/CVV, and expiration date are intentionally absent.
- Event notes keep `client_editable` separate from `is_private`; a note must be visible and explicitly editable before the portal can update its body.
