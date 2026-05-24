# Project Neo MVP Database Notes

Executable SQL migration: `supabase/migrations/20260523000000_project_neo_core.sql`.

This note is the MVP working map for backend and admin dashboard engineers. The migration contains a few support and future-ready tables, but the MVP surface is:

- `users`
- `clients`
- `booking_inquiries`
- `events`
- `venues`
- `invoices`
- `invoice_items`
- `payments`
- `services`
- `packages`
- `gallery_items`
- `mixes`
- `event_notes`

## Relationship Map

- `users.id` references `auth.users.id`. Use this for Project Neo owner/admin/staff records.
- `clients.portal_user_id` optionally references `auth.users.id` for future client portal ownership.
- `booking_inquiries.client_id` links a public inquiry to a client after staff review.
- `events.client_id` links an event to the customer.
- `events.booking_inquiry_id` preserves the inquiry that created the event.
- `events.venue_id` links to a reusable venue. `events.venue_name` and `events.location` are snapshots for one-off venues or historical display.
- `events.package_id` links to the sold package when applicable.
- `invoices.client_id` and `invoices.event_id` tie billing to the customer and event.
- `invoice_items.invoice_id` cascades with the invoice and can optionally reference `services` or `packages`.
- `payments.invoice_id` tracks deposits, balances, refunds, or other payments for an invoice.
- `gallery_items.event_id` is optional. Use it when portfolio media belongs to a specific event.
- `event_notes.event_id` cascades with the event.

`package_services` is a support join table for package composition. It is not a primary MVP screen by itself, but it keeps package/service data normalized.

## MVP Status Fields

- `booking_inquiries.status`: `new`, `reviewing`, `quoted`, `deposit_requested`, `confirmed`, `completed`, `cancelled`
- `events.status`: `inquiry`, `pending`, `confirmed`, `completed`, `cancelled`, `hold`
- `events.visibility`: `private`, `public`
- `invoices.status`: `draft`, `sent`, `partially_paid`, `paid`, `overdue`, `cancelled`
- `payments.status`: `pending`, `paid`, `failed`, `refunded`
- `users.role`: `owner`, `admin`, `dj`, `client`, `staff`
- `gallery_items.is_published` and `mixes.is_published`: public website visibility flags
- `event_notes.is_private`: controls client visibility

## Indexes That Matter For MVP

- Admin inbox: `booking_inquiries(status, created_at desc)`, `booking_inquiries(event_date)`, `booking_inquiries(email)`
- Calendar/admin schedule: `events(event_date, status)`, `events(event_date, status, visibility)`, `events(client_id)`, `events(venue_id)`
- Billing: `invoices(status, due_date)`, `invoices(client_id)`, `invoices(event_id)`, `payments(invoice_id)`, `payments(status, paid_at desc)`
- Public content: `services(is_active, sort_order, name)`, `packages(is_active, sort_order, name)`, `gallery_items(is_published, sort_order, created_at desc)`, `mixes(is_published, sort_order, created_at desc)`
- Notes: `event_notes(event_id, created_at desc)`

## RLS Recommendations

RLS is enabled on the MVP tables.

- Anonymous users should only insert public booking inquiries and read active public catalog/media records.
- Anonymous users must not select from `clients`, `booking_inquiries`, `events`, `invoices`, `invoice_items`, `payments`, `users`, or private `event_notes`.
- Authenticated `owner`, `admin`, and `staff` users can manage MVP operational tables.
- `owner` and `admin` can manage `users`.
- Public website reads are limited to active `services`, active `packages`, published `gallery_items`, and published `mixes`.
- Portal/client access is future-ready through `clients.portal_user_id`; when enabled, clients should only read their own events, invoices, invoice items, payments, and non-private event notes.

## Backend Notes

- Store money as integer cents. Do not use floating-point currency values.
- Never store card number, CVV/CVC, PAN, or card expiration values.
- Payment providers belong in `payments.payment_provider` and `payments.provider_payment_id`.
- Hosted invoice links can be stored on `invoices.payment_link_url` and related external invoice fields.
- `payments` update invoice snapshots through database triggers, so backend code should insert/update payments rather than manually editing `amount_paid_cents`, `deposit_paid_cents`, or `balance_due_cents`.
- Booking conversion should create or link a `clients` row, update `booking_inquiries.client_id`, then create an `events` row tied to both.
- Keep public media reads filtered by `is_published = true`.
- Keep public service/package reads filtered by `is_active = true`.

## Admin Dashboard Notes

- Dashboard cards can derive open leads from `booking_inquiries.status in ('new', 'reviewing', 'quoted', 'deposit_requested')`.
- Upcoming events should filter `events.event_date >= current_date` and exclude `cancelled` / `completed`.
- Calendar availability should use `events.status in ('pending', 'confirmed', 'hold')`; display only sanitized labels for private events.
- Invoice queues should group by `draft`, `sent`, `partially_paid`, and `overdue`.
- Revenue widgets should sum paid `payments`, not invoice totals.
- Client detail screens should join `clients -> events -> invoices -> payments` and load `event_notes` separately by `event_id`.
- Gallery and mix admin screens should expose publish toggles, featured toggles, and sort order.
