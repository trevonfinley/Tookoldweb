# Project Neo Backend

Project Neo uses Supabase Edge Functions and Postgres. The static DJ Too Kold site can stay plain HTML/CSS/JS while forms, public content, and future admin/client screens talk to one API function.

The full database design is documented in `docs/PROJECT_NEO_DATABASE_SCHEMA.md`. The executable migration is `supabase/migrations/20260523000000_project_neo_core.sql`.

MVP table relationships and dashboard/backend implementation notes are documented in `docs/PROJECT_NEO_MVP_ENGINEERING_NOTES.md`.

Authentication and access control are documented in `docs/PROJECT_NEO_AUTH.md`.

## Schema Summary

The core schema includes:

- Auth-linked role profiles: `users`
- Private customer data: `clients`
- Lead capture: `booking_inquiries`, `contact_messages`
- Event planning: `events`, `venues`, `event_notes`, `tasks`
- Catalog: `services`, `packages`, `package_services`
- Billing: `invoices`, `invoice_items`, `payments`
- Agreements: `contracts`
- Music planning: `song_requests`
- Public content: `gallery_items`, `mixes`

RLS is enabled on every table. Anonymous users can submit inquiries/messages and read only published or active public catalog/media records. Admin routes require an active `owner` or `admin` role. Client and financial data stays private unless an authenticated portal user owns that record.

Credit card numbers, PAN values, CVV/CVC values, and card expiration values are intentionally not part of the schema and are rejected by the API if submitted.

## Deploy

For the full local setup, environment variable list, static hosting setup, preview deployment workflow, launch checklist, and rollback checklist, see `docs/PROJECT_NEO_DEPLOYMENT.md`.

1. Create or link the Supabase project.

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

2. Apply the migration after reviewing the schema.

```bash
supabase db push
```

3. Deploy the Edge Function.

```bash
supabase functions deploy project-neo-api
```

4. Set function secrets.

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set PROJECT_NEO_ALLOWED_ORIGIN="https://your-live-domain.com"
```

For local testing, `PROJECT_NEO_ALLOWED_ORIGIN` can be `*`. Use the deployed site origin in production.

5. Add the first Project Neo owner after creating the user in Supabase Auth.

```sql
insert into public.users (id, role, full_name, email)
values ('AUTH_USER_ID_HERE', 'owner', 'DJ Too Kold', 'admin@example.com');
```

6. Point the public website and admin login at Supabase in `project-neo-config.js`.

```js
window.ProjectNeoConfig = {
  apiBaseUrl: "https://YOUR_PROJECT_REF.functions.supabase.co/project-neo-api",
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

## Public Routes

All responses use:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": { "code": "validation_error", "message": "Email must be valid." } }
```

### `POST /booking-inquiries`

Creates a booking inquiry from the public booking form.

```json
{
  "clientName": "Client Name",
  "email": "client@example.com",
  "phone": "555-555-5555",
  "subject": "Booking request from website",
  "eventDate": "2026-09-12",
  "startTime": "18:00",
  "endTime": "23:00",
  "eventType": "Wedding",
  "venueName": "Venue Name",
  "venueAddress": "123 Main St",
  "cityState": "Chicago, IL",
  "guestCount": 150,
  "indoorOutdoor": "indoor",
  "musicPreferences": "Hip-hop, R&B, clean edits, must-play songs...",
  "budgetRange": "$1,200-$1,800",
  "heardAbout": "Referral",
  "additionalNotes": "Load-in starts at 4 PM."
}
```

Required fields are client name, email, event type, event date, city/state, and estimated guest count. The API accepts camelCase, snake_case, and HTML form-style hyphenated field names for the booking payload, stores a derived `full_name`, splits first/last name when possible for admin review, and builds the required internal `message` summary when the public form does not send one.

### `POST /contact-messages`

Creates a public contact message.

```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "subject": "Question",
  "message": "Message..."
}
```

### `GET /media`

Returns published `gallery_items` with public media-library fields: title, description, media category, storage media type, file URL, thumbnail URL, event date, venue, tags, featured status, display order, and optional storage or external embed metadata.

### `GET /mixes`

Returns published `mixes` with audio URL, embed URL, cover image, platform, duration, featured status, and display order for the public mixes page.

### `GET /service-packages`

Returns active `packages` formatted for the public site.

### `GET /availability`

Returns sanitized public availability holds without client, venue, internal note, or calendar sync details. Private events still block availability, but their label is returned as `Unavailable`. Supports `?limit=20`, optional `?from=YYYY-MM-DD`, and optional `?to=YYYY-MM-DD`.

```json
[
  {
    "date": "2026-09-12",
    "startTime": "18:00:00",
    "endTime": "23:00:00",
    "status": "booked",
    "label": "Wedding booked",
    "isPublic": true
  }
]
```

## Client Portal Routes

Client portal routes require:

```http
Authorization: Bearer SUPABASE_AUTH_ACCESS_TOKEN
```

The token must belong to a Supabase Auth user connected to a `clients.portal_user_id` value. Portal responses are scoped to that client only.

### `GET /portal/me`

Returns the current portal client profile.

### `GET /portal/summary`

Returns the client portal bundle: client profile, client-owned events, non-draft invoices with invoice items and payment statuses, non-draft contracts, event venue context, song requests, and non-private event notes.

### `POST /portal/song-requests`

Creates a song request for one of the signed-in client's open events.

```json
{
  "eventId": "uuid",
  "songTitle": "Song title",
  "artist": "Artist",
  "dedication": "Optional dedication",
  "notes": "Optional notes",
  "isMustPlay": true
}
```

The API always stores new portal song requests with `status = requested`.

### `PATCH /portal/song-requests/:id`

Updates a requested song while it is still connected to one of the client's open events.

### `PATCH /portal/event-notes/:id`

Updates only the `body` of a client-visible event note. The note must belong to the client's event, must have `is_private = false`, and must have `client_editable = true`.

## Admin Routes

Admin routes require:

```http
Authorization: Bearer SUPABASE_AUTH_ACCESS_TOKEN
```

The token must belong to a Supabase Auth user with an active `public.users` row whose role is `owner` or `admin`.

### `GET /admin/me`

Returns the current admin identity after token and role verification.

```json
{
  "id": "auth-user-id",
  "email": "admin@example.com",
  "role": "owner",
  "isActive": true
}
```

### `POST /admin/clients`

Creates a client record.

```json
{
  "fullName": "Client Name",
  "email": "client@example.com",
  "phone": "555-555-5555",
  "notes": "Referral source or planning notes."
}
```

### `GET /admin/clients`

Returns protected client records for the admin dashboard. Supports `?limit=50`.

### `POST /admin/events`

Creates an event record.

```json
{
  "clientId": "uuid",
  "bookingInquiryId": "uuid",
  "venueId": "uuid",
  "packageId": "uuid",
  "title": "Smith Wedding",
  "eventType": "Wedding",
  "eventDate": "2026-09-12",
  "startTime": "18:00",
  "endTime": "23:00",
  "venueName": "Venue Name",
  "location": "Chicago, IL",
  "guestCount": 150,
  "status": "confirmed",
  "visibility": "private",
  "internalNotes": "Balance due before load-in.",
  "calendarSyncId": "google-calendar-event-id"
}
```

Allowed event statuses are `inquiry`, `pending`, `confirmed`, `completed`, `cancelled`, and `hold`. New events default to `pending`. Public availability labels never include client records or internal notes; `visibility: "public"` allows a generic event type label, while `visibility: "private"` returns only an unavailable block.

When a new `pending`, `confirmed`, or `hold` event overlaps an existing booking or hold, the API returns `409 event_conflict` unless the admin submits `allowConflict: true` after review. Inquiry records can still return `conflict_warnings` without being blocked.

### `GET /admin/events`

Returns protected event records with client and venue context, visibility, internal notes, calendar sync ID, and `conflict_warnings`. Supports `?limit=50`, optional `?status=confirmed`, and optional `?from=YYYY-MM-DD&to=YYYY-MM-DD`.

### `PATCH /admin/booking-inquiries/:id/status`

Updates booking status.

```json
{
  "status": "quoted",
  "adminNotes": "Quote sent by email.",
  "clientId": "uuid"
}
```

Allowed booking statuses are `new`, `reviewing`, `quoted`, `deposit_requested`, `confirmed`, `completed`, and `cancelled`.

### `POST /admin/invoices`

Creates an invoice record. Amounts are stored in cents. The invoice total must equal subtotal minus discount plus tax. `balance_due_cents` is maintained by the database ledger trigger, not accepted from clients.

```json
{
  "clientId": "uuid",
  "eventId": "uuid",
  "invoiceNumber": "TK-2026-001",
  "subtotalCents": 120000,
  "discountCents": 0,
  "taxCents": 0,
  "depositCents": 30000,
  "totalCents": 120000,
  "dueDate": "2026-08-12",
  "status": "sent",
  "paymentProvider": "stripe",
  "paymentLinkUrl": "https://checkout.stripe.com/c/pay/...",
  "externalInvoiceId": "in_...",
  "externalInvoiceUrl": "https://invoice.stripe.com/i/...",
  "terms": "Deposit is due to confirm the event date."
}
```

Hosted Square or Stripe links should be created by the processor and stored here as references only. Do not submit card data to Project Neo.

### `GET /admin/invoices`

Returns invoice records with client/event context, collected deposit amount, amount paid, balance due, hosted payment-link metadata, terms, and notes. Supports `?limit=25` and optional `?status=sent`.

### `GET /admin/payments`

Returns protected payment records with invoice, client, and event context. Supports `?limit=50` and optional `?status=paid`.

### `POST /admin/payments`

Creates a deposit, balance, refund, or other payment record. Store processor IDs or notes here, not card data.

```json
{
  "invoiceId": "uuid",
  "amountCents": 30000,
  "currency": "USD",
  "paymentType": "deposit",
  "paymentProvider": "stripe",
  "externalPaymentReference": "pi_...",
  "paymentDate": "2026-08-01",
  "status": "paid"
}
```

Paid deposit and balance records automatically update the invoice `amount_paid_cents`, `deposit_paid_cents`, `balance_due_cents`, and status snapshots. Pending and failed records are tracked but do not reduce the balance due.

### `PATCH /admin/payments/:id/status`

Updates payment status. This stores payment state and provider references only, never card data.

```json
{
  "status": "paid",
  "paymentDate": "2026-08-01",
  "paidAt": "2026-08-01T18:30:00Z",
  "notes": "Deposit confirmed."
}
```

### `GET /admin/events/upcoming`

Returns upcoming non-cancelled admin events. Supports `?limit=10`.

### `GET /admin/venues`

Returns protected venue records with logistics notes. Supports `?limit=50`.

### `GET /admin/media`

Returns protected gallery records, including unpublished and featured media, for the admin dashboard. Supports `?limit=50`.

### `GET /admin/tasks`

Returns protected task records with event, client, and inquiry context. Supports `?limit=50` and optional `?status=todo`.

### `GET /admin/booking-inquiries`

Returns admin-ready booking inquiry records with all public form fields, quote/deposit amounts, internal notes, lifecycle timestamps, and status. Supports `?limit=25` and optional `?status=new`.

### `GET /admin/dashboard-summary`

Returns new/open inquiry counts, upcoming event counts, confirmed booking counts, open invoice counts, balance-due totals, recent inquiries, next events, and open invoices for the first Mission Control dashboard panels.

## Booking Status Workflow

Allowed status flow:

- `new` -> `reviewing` or `cancelled`
- `reviewing` -> `quoted` or `cancelled`
- `quoted` -> `deposit_requested`, `confirmed`, or `cancelled`
- `deposit_requested` -> `confirmed` or `cancelled`
- `confirmed` -> `completed` or `cancelled`
- `completed` and `cancelled` are terminal
