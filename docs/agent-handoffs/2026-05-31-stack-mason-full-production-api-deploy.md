# Agent Handoff - Full Production API Deploy

## Agent Name

Stack Mason

## Agent Role

Backend/Supabase Engineer for Project Neo

## Date

2026-05-31

## Task Summary

Replaced the reduced-mode production Supabase Edge Function with the full `project-neo-api` route surface and verified the public routes against the production schema. The function is active as version 3 with Supabase gateway JWT verification disabled so public website routes remain callable. Admin and client portal routes now reach the full function authorization gates instead of reduced-mode `503 full_api_deploy_required` behavior.

## Files Created

- `docs/agent-handoffs/2026-05-31-stack-mason-full-production-api-deploy.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Deployed `project-neo-api` version 3 with `verify_jwt: false` because Project Neo needs anonymous public routes for booking inquiries, contact messages, availability checks, media, mixes, packages, and public availability feed reads.
- Preserved route-level authorization for `/admin/*` and `/portal/*`.
- Used a pinned production entrypoint that imports the full repository Edge Function source from commit `e3a786830cdf65c14ff1b198de3c2058d36ef838` because the local Supabase CLI deploy path is still blocked by missing `SUPABASE_ACCESS_TOKEN`.
- Did not change frontend design, public page markup, or static UI assets.
- Did not expose or document service-role keys, tokens, passwords, cookies, or private credentials.

## API Routes/Functions Created or Changed

Supabase Edge Function:
- `project-neo-api`
- Production version: 3
- Status: active
- Gateway JWT setting: disabled

Public routes:
- `GET /health`
- `POST /availability-check`
- `POST /availability/check`
- `POST /booking-inquiries`
- `POST /contact-messages`
- `GET /availability`
- `GET /media`
- `GET /mixes`
- `GET /service-packages`

Admin routes:
- `GET /admin/me`
- `GET /admin/clients`
- `POST /admin/clients`
- `GET /admin/events`
- `POST /admin/events`
- `GET /admin/availability-blocks`
- `POST /admin/availability-blocks`
- `GET /admin/events/upcoming`
- `GET /admin/dashboard-summary`
- `GET /admin/booking-inquiries`
- `PATCH /admin/booking-inquiries/:id/status`
- `GET /admin/invoices`
- `POST /admin/invoices`
- `GET /admin/payments`
- `POST /admin/payments`
- `PATCH /admin/payments/:id/status`
- `GET /admin/venues`
- `GET /admin/media`
- `GET /admin/tasks`

Portal routes:
- `GET /portal/me`
- `GET /portal/summary`
- `POST /portal/song-requests`
- `PATCH /portal/song-requests/:id`
- `PATCH /portal/event-notes/:id`

## Request/Response Formats

Shared response envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Shared error envelope:

```json
{
  "ok": false,
  "error": {
    "code": "error_code",
    "message": "Safe message",
    "details": null
  }
}
```

`GET /health` returns:

```json
{
  "ok": true,
  "data": {
    "service": "project-neo-api",
    "status": "ok"
  }
}
```

`POST /availability-check` accepts:

```json
{
  "event_date": "2026-12-31",
  "start_time": "22:00",
  "end_time": "02:00",
  "event_type": "Private party",
  "timezone": "America/Chicago"
}
```

`POST /availability-check` returns safe public statuses:

```json
{
  "ok": true,
  "data": {
    "status": "available",
    "message": "This date appears available. Submit your inquiry to start the booking process.",
    "checked_at": "ISO timestamp"
  }
}
```

`POST /booking-inquiries` accepts public booking fields including name, email, phone, event date, start/end time, event type, timezone, venue/city, guest count, budget, and notes. It returns the new inquiry `id`, `status`, availability snapshot fields, and `created_at`.

`POST /contact-messages` accepts `name`, `email`, `subject`, and `message`. It returns the new message `id`, `status`, and `created_at`.

Admin and portal routes require `Authorization: Bearer <access_token>` and return `401 unauthorized` without a session.

## Validation Rules

- Request bodies must be JSON objects.
- JSON payloads are capped at 32 KB.
- Sensitive card fields such as `cvv`, `cvc`, card numbers, card expiry values, security-code fields, and PAN-like keys are rejected.
- Emails must pass format validation.
- Dates must use `YYYY-MM-DD`.
- Times must use `HH:MM` or `HH:MM:SS`.
- Timezones must be valid IANA timezone names.
- Overnight windows are valid: when `end_time <= start_time`, the selected `event_date` is the start date and the end datetime is normalized to the next calendar day.
- UUID path/body parameters must match UUID format.
- Invoice totals must equal subtotal minus discount plus tax.
- Deposits cannot exceed invoice totals.
- Payment amounts cannot exceed the invoice balance when marking paid/refunded through the payment logic.

## Error Handling Behavior

- Validation failures return safe `400` errors or safe public `contact_required` availability results, depending on route behavior.
- Missing admin authorization returns `401 unauthorized`.
- Missing client portal authorization returns `401 unauthorized`.
- Unknown routes return `404 not_found`.
- Booking/contact write failures return route-specific safe server errors.
- Public availability database failures return `contact_required` instead of exposing table or private schedule details.
- Internal database details are not returned to public availability callers.

## Database Tables Touched

Public route tests created and cleaned up temporary rows in:
- `availability_blocks`
- `booking_inquiries`
- `contact_messages`

Routes depend on the production schema for:
- `users`
- `clients`
- `venues`
- `booking_inquiries`
- `contact_messages`
- `events`
- `availability_blocks`
- `invoices`
- `invoice_items`
- `payments`
- `gallery_items`
- `mixes`
- `packages`
- `services`
- `contracts`
- `song_requests`
- `event_notes`
- `tasks`

## Data/API/Schema Changes

- Production Edge Function changed from reduced-mode version 2 to full-route version 3.
- No Postgres schema changes were made by Stack Mason in this task.
- Data Knox's production migrations were already present before this deploy and were used for verification.
- Temporary verification rows were removed after testing.

## Environment Variable Changes

- None made.
- The function still depends on server-side Supabase function secrets.
- No service-role key, token, password, cookie, or private credential was exposed in docs or code.

## Security/Compliance Impact

- Public function gateway JWT remains disabled by design, but admin and portal routes enforce bearer-session checks inside the function.
- Public availability responses did not expose client names, venue names, event titles, private notes, internal block notes, invoices, payment records, or portal data.
- Public route CORS accepts the production Vercel origin.
- Card/payment data fields are rejected before storage.
- Public `reason_code` values remain present for some availability outcomes and should stay on Shield's review list.
- Authenticated admin/portal success paths were not tested because no approved production admin/client access tokens were available in this session.

## Agents That Need This Update

- Data Knox
- Booker
- Mission Control
- Gatekeeper
- Ledger
- Sync
- Shield
- Bug Hunter
- Launchpad
- Scribe

## Required Follow-Up Tasks

- Gatekeeper: create or confirm approved production owner/admin and client portal test sessions.
- Mission Control: retest authenticated admin event, availability block, dashboard, and booking status workflows.
- Ledger: retest authenticated invoice/payment create, fetch, and status update routes.
- Concierge: retest authenticated portal summary, song request, and event note edit routes.
- Sync: verify overnight conflicts with real or approved test `events` and `availability_blocks` data.
- Shield: review public `reason_code` exposure, CORS policy, route-level auth, and public availability abuse controls.
- Bug Hunter: rerun production regression across public forms, availability states, admin auth, invoice/payment, portal, media/mixes, packages, and mobile flows.
- Launchpad: update deployment notes to reflect `project-neo-api` version 3 full-route deployment.
- Scribe: keep backend/API docs aligned with the full production deployment.

## Risks or Blockers

- Authenticated admin, invoice/payment, and portal success paths still need approved production access tokens.
- The production entrypoint imports pinned full source from GitHub because CLI auth is unavailable locally. A future deployment should replace this with a normal full-source CLI or connector deploy when practical.
- Public availability `reason_code` output remains a known Shield review item.
- Media, mixes, and availability feed routes returned valid empty arrays because production seed data is currently empty for those tables.

## Testing Performed

- Confirmed `project-neo-api` version 3 is active with `verify_jwt: false`.
- Confirmed deployed entrypoint imports the pinned full source from commit `e3a786830cdf65c14ff1b198de3c2058d36ef838`.
- Verified `GET /health` returns `200` with `{ service: "project-neo-api", status: "ok" }` and no reduced-mode marker.
- Verified CORS preflight allows `https://tookoldweb.vercel.app`.
- Verified overnight `POST /availability-check` returns `available` for an open Saturday 10:00 PM to Sunday 2:00 AM-style window.
- Inserted temporary availability blocks and verified public statuses:
  - `pending`
  - `unavailable`
  - `contact_required`
- Verified `POST /booking-inquiries` created a temporary inquiry with an availability snapshot.
- Verified `POST /contact-messages` created a temporary message.
- Verified `GET /service-packages` returns seeded package data.
- Verified `GET /media`, `GET /mixes`, and `GET /availability` return `200` with valid empty arrays.
- Verified `GET /admin/me`, `GET /admin/events/upcoming`, `GET /admin/dashboard-summary`, `GET /admin/invoices`, and `GET /admin/payments` return `401 unauthorized` without an admin token.
- Verified `GET /portal/summary` returns `401 unauthorized` without a client token.
- Verified a payload containing `cvv` returns `400 sensitive_payment_data_rejected`.
- Verified invalid availability input returns safe `contact_required`.
- Cleaned up temporary verification rows:
  - 3 availability blocks deleted.
  - 1 booking inquiry deleted.
  - 1 contact message deleted.
- Verified zero Stack Mason verification rows remain.

## Suggested Next Agent

Gatekeeper
