# Agent Handoff - Sync Backend Function Deploy

## Agent Name

Stack Mason

## Agent Role

Backend/Supabase Engineer for Project Neo

## Date

2026-05-31

## Task Summary

Verified Sync's latest overnight availability update against the backend function path and deployed a reduced, safe `project-neo-api` Supabase Edge Function to the configured production Supabase project. The deployed function is reachable and includes public health, availability, booking inquiry, contact message, public catalog/feed, and minimal admin identity routes. Full production API readiness remains blocked because the target Supabase database has no recorded migrations and the expected Project Neo tables/columns were not found.

## Files Created

- `docs/agent-handoffs/2026-05-31-stack-mason-sync-backend-function-deploy.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Deployed `project-neo-api` with Supabase gateway JWT verification disabled because Project Neo has public website routes for booking inquiries, contact messages, availability checks, media, mixes, packages, and public availability feeds.
- Kept route-level authorization inside the function for admin identity checks.
- Did not apply database migrations because schema ownership remains with Data Knox and production schema changes require a dedicated schema pass.
- Did not document or expose secrets, tokens, API keys, passwords, cookies, service-role values, or private credentials.
- Deployed a reduced safe function instead of the full local 99 KB function because the local Supabase CLI path requires an access token and the connector deploy path could not ingest the full local function source directly from disk.

## API Routes/Functions Created or Changed

- Supabase Edge Function: `project-neo-api`
- Deployment status: active, version 2
- Gateway JWT setting: disabled
- `GET /health`
- `POST /availability-check`
- `POST /availability/check`
- `POST /booking-inquiries`
- `POST /contact-messages`
- `GET /availability`
- `GET /media`
- `GET /mixes`
- `GET /service-packages`
- `GET /admin/me`

Reduced-mode limitation:
- Other `/admin/*` and `/portal/*` routes return `503 full_api_deploy_required` until the full local function is deployed.
- Invoice/payment admin APIs are not live in the reduced deployment and must be retested by Ledger after full deployment.

## Request/Response Formats

### `GET /health`

Response:

```json
{
  "ok": true,
  "data": {
    "service": "project-neo-api",
    "status": "ok",
    "mode": "reduced",
    "schema_status": "pending_verification"
  }
}
```

### `POST /availability-check`

Accepted request fields:

```json
{
  "event_date": "2026-06-06",
  "start_time": "22:00",
  "end_time": "02:00",
  "event_type": "Private party",
  "timezone": "America/Chicago"
}
```

Safe public response shape:

```json
{
  "ok": true,
  "data": {
    "status": "contact_required",
    "message": "This date needs manual review. Submit your inquiry and we'll follow up.",
    "checked_at": "ISO timestamp",
    "reason_code": "availability_check_failed"
  }
}
```

Expected statuses after schema/data are ready:
- `available`
- `pending`
- `unavailable`
- `contact_required`

### `POST /booking-inquiries`

Accepted request fields include:
- `firstName`, `lastName`, or compatible full-name fields
- `email`
- `phone`
- `eventDate` or `event_date`
- `startTime` or `start_time`
- `endTime` or `end_time`
- `eventType` or `event_type`
- `timezone`
- `venueName`, `venueAddress`, `cityState`, `guestCount`, `budgetRange`, and optional notes fields

Current production response until schema exists:

```json
{
  "ok": false,
  "error": {
    "code": "database_unavailable",
    "message": "Project Neo backend storage is not ready yet.",
    "details": null
  }
}
```

### `POST /contact-messages`

Accepted request fields:

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "subject": "Message subject",
  "message": "Message body"
}
```

Current production response until schema exists:

```json
{
  "ok": false,
  "error": {
    "code": "database_unavailable",
    "message": "Project Neo backend storage is not ready yet.",
    "details": null
  }
}
```

## Validation Rules

- Request bodies must be JSON objects.
- JSON request bodies are capped at 32 KB.
- Sensitive payment/card fields such as `cvv`, `cvc`, card numbers, card expiration values, and PAN-like keys are rejected.
- Email values must pass a basic email format check.
- Dates must use `YYYY-MM-DD`.
- Times must use `HH:MM` or `HH:MM:SS`.
- Timezones must be valid IANA timezone names.
- Sync overnight rule is active: if `end_time <= start_time`, the selected event date remains the start date and the end datetime is treated as the next calendar day.
- Availability responses are public-safe and status/message only.

## Error Handling Behavior

- Public API responses use `{ "ok": true, "data": ... }` or `{ "ok": false, "error": ... }`.
- Validation errors return `400 validation_error` or related safe error codes.
- Sensitive card fields return `400 sensitive_payment_data_rejected`.
- Missing admin authorization returns `401 unauthorized`.
- Missing or unavailable Project Neo storage returns `503 database_unavailable`.
- Reduced-only admin/portal routes return `503 full_api_deploy_required`.
- Availability database failures return a safe `contact_required` public status instead of exposing database details.
- Internal database error details are logged server-side only and are not returned to public callers.

## Database Tables Touched

No database schema changes were made.

Production schema verification queried `information_schema.columns` and found no expected Project Neo columns for:
- `events`
- `availability_blocks`
- `booking_inquiries`

Deployed route behavior attempts or expects access to:
- `events`
- `availability_blocks`
- `booking_inquiries`
- `contact_messages`
- `media_records`
- `mix_records`
- `service_packages`
- `users`

No successful booking/contact insert was observed because the production schema is not present.

## Data/API/Schema Changes

- Remote Supabase Edge Function deployment changed from no usable production function to active `project-neo-api` version 2 in reduced mode.
- Sync overnight API behavior is present in the deployed reduced function for public availability and booking payload parsing.
- No Postgres migration was applied.
- Supabase migration history in the target project returned empty.

## Environment Variable Changes

- None made by Stack Mason.
- The function depends on server-side Supabase function secrets for database-backed routes.
- No secret values were read into docs or written to the repository.

## Security/Compliance Impact

- Gateway JWT verification is disabled for the Edge Function because public website routes must be callable without a Supabase session.
- Admin identity route still requires `Authorization: Bearer <access_token>`.
- No credit card data is accepted or stored by the deployed function.
- Public availability responses do not return client names, venue names, event titles, private notes, block titles, internal notes, sync IDs, invoices, or payment data.
- Public `reason_code` values remain present and should be reviewed by Shield against the prior reason-code leakage finding.
- Full admin, portal, invoice, and payment route security must be retested after full function deployment and schema availability.

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

- Data Knox: apply or validate the Project Neo production schema and fix the `availability_blocks` RLS helper mismatch before launch.
- Stack Mason: deploy the full local `supabase/functions/project-neo-api/index.ts` once CLI auth or a full-source connector deploy path is available.
- Stack Mason: rerun booking/contact write tests after schema exists and clean up any approved test rows.
- Booker: retest public booking inquiry flow and overnight availability copy after database writes are available.
- Mission Control: retest protected admin availability/event conflict workflows after the full function is deployed.
- Gatekeeper: retest `/admin/me` and client portal session behavior after full deployment.
- Ledger: retest invoice/payment routes after the full function is deployed.
- Sync: verify deployed overnight conflict behavior with real `events` and `availability_blocks` test data.
- Shield: review public `reason_code` exposure, CORS, abuse protection, route-level auth, and RLS after schema/full deployment.
- Bug Hunter: rerun production regression for health, booking, contact, availability states, admin auth, media/mixes, and overnight conflicts.
- Launchpad: update deployment notes to reflect reduced function mode and remaining schema/full-function blockers.
- Scribe: keep backend/API documentation aligned with the reduced deployment and follow-up requirements.

## Risks or Blockers

- The deployed production function is reduced mode, not the full local function source.
- Production database schema is missing or not exposed in the checked project, so DB-backed route verification cannot pass yet.
- Booking/contact submissions currently fail safely with `database_unavailable` and do not write rows.
- Availability status coverage for `available`, `pending`, and `unavailable` cannot be verified until schema and test data exist.
- Admin, portal, invoice, and payment routes are not production-ready in reduced mode.
- Supabase CLI deployment is blocked by missing CLI access token in the local shell.

## Testing Performed

- Reviewed Sync's latest handoff: `docs/agent-handoffs/2026-05-30-sync-overnight-availability-windows.md`.
- Confirmed local function contains overnight normalization for `end_time <= start_time`.
- Ran `npm run validate`; passed.
- Checked local tooling: `deno` and `supabase` CLI were not installed.
- Downloaded Supabase CLI through `npx` with approval and confirmed `functions deploy` supports `--no-verify-jwt` and `--use-api`.
- Attempted Supabase CLI deploy; blocked because `SUPABASE_ACCESS_TOKEN` was not available.
- Queried Supabase Edge Functions; `project-neo-api` is active, version 2, `verify_jwt: false`.
- Queried production migration history; no migrations were recorded.
- Queried production schema columns for Project Neo core availability tables; expected columns were not found.
- Verified `GET /health` returns HTTP 200 with reduced-mode status.
- Verified CORS preflight for `https://tookoldweb.vercel.app` returns HTTP 200 and allows the production origin.
- Verified overnight `POST /availability-check` with Saturday 10:00 PM to Sunday 2:00 AM returns a safe public `contact_required` response while schema is missing.
- Verified `POST /booking-inquiries` validates the dummy payload, then returns `503 database_unavailable`.
- Verified `POST /contact-messages` validates the dummy payload, then returns `503 database_unavailable`.
- Verified unauthenticated `GET /admin/me` returns `401 unauthorized`.
- Verified a payload containing `cvv` returns `400 sensitive_payment_data_rejected`.

## Suggested Next Agent

Data Knox
