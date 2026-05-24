# Project Neo QA Bug Report

Date: 2026-05-24
Tester: Bug Hunter
App: Project Neo / DJ Too Kold

## Test Coverage

- Public pages tested: home, about, services, mixes, gallery, events, contact, booking, FAQ.
- Admin pages tested: admin login, admin dashboard direct route.
- Client portal tested: direct portal login page.
- Forms tested: booking inquiry and contact validation, invalid data, valid data with current config.
- Mobile tested at 390 x 844: public navigation and booking form width.
- Static links/assets checked: 225 local references across 12 HTML files, no missing local files found.
- Database behavior checked from UI wiring and Supabase API code. Live Supabase writes could not be verified because `project-neo-config.js` has empty API/Auth values and the Supabase/Deno CLIs are not installed locally.

## Bugs

### 1. Public booking inquiry does not write to Project Neo database with current config

- Area affected: Booking inquiry submission, database write behavior.
- Steps to reproduce:
  1. Open `booking.html`.
  2. Fill all required fields with valid data.
  3. Submit the form.
- Expected result: The UI should POST JSON to the Project Neo API `/booking-inquiries`, create a `booking_inquiries` record, show the success state, and keep the user on a branded page.
- Actual result: `project-neo-config.js` leaves `apiBaseUrl` empty, so `script.js` returns before `preventDefault()`. On the local static server the browser performs a native POST to `booking.html` and lands on a `501 Unsupported method ('POST')` error. No Supabase write is attempted.
- Severity: Critical.
- Suggested fix: Configure `apiBaseUrl` for deployed environments and update `script.js` to always prevent the default submit. If the API is missing, show a clear error or intentionally route to a supported Netlify success page, not a raw native POST.

### 2. Contact form has the same no-API submit failure

- Area affected: Contact form, contact database write behavior.
- Steps to reproduce:
  1. Open `contact.html`.
  2. Fill name, email, and message with valid values.
  3. Submit the form.
- Expected result: The UI should POST to `/contact-messages`, create a `contact_messages` record, and show the success state.
- Actual result: With empty `apiBaseUrl`, the form performs a native POST to `contact.html` and reaches `501 Unsupported method ('POST')` locally. No Project Neo API call happens.
- Severity: Critical.
- Suggested fix: Same submit handling fix as booking. Do not rely on native fallback unless the deployment target is explicitly Netlify Forms and a success page is configured.

### 3. Admin and portal login forms leak passwords into the URL when config is missing

- Area affected: Admin login, client portal login, credential handling.
- Steps to reproduce:
  1. Open `admin-login.html` or `client-portal.html` with the current empty config.
  2. Enter a test email and password.
  3. Click Sign In.
- Expected result: The form should never navigate with credentials in the query string. It should block submit and show a configuration/auth error.
- Actual result: Because `requireConfig()` returns before submit handlers are attached and the forms have no `method="post"`, the browser performs a native GET. Example observed URL: `admin-login.html?email=qa%40example.com&password=FakePassword123%21`.
- Severity: Critical.
- Suggested fix: Add `method="post"` and an unconditional submit listener that calls `preventDefault()` before config checks. Disable the login button when config is missing.

### 4. Protected admin dashboard route is not actually protected in the missing-config state

- Area affected: Protected dashboard routes, admin dashboard access control.
- Steps to reproduce:
  1. Open `admin-dashboard.html` directly in a fresh browser session.
- Expected result: Unauthenticated users should be redirected to `admin-login.html?returnTo=admin-dashboard.html`, or shown a locked state that cannot expose dashboard UI.
- Actual result: The route stays on `admin-dashboard.html` and shows `Project Neo admin configuration is missing.` The data shell remains hidden, but the route guard never reaches the session check.
- Severity: High.
- Suggested fix: Split route protection from data configuration. Direct dashboard access should always run a safe guard path and redirect or lock before any dashboard route is considered accessible.

### 5. Admin dashboard has read-only tables but no workflow controls for required admin actions

- Area affected: Booking status updates, client records, event records, invoice records, payment status tracking.
- Steps to reproduce:
  1. Inspect `admin-dashboard.html`.
  2. Navigate the booking, clients, events, invoices, and payments sections.
- Expected result: Admins should be able to create/edit clients, create/edit events, create invoices, record payments, update payment status, and move booking inquiries through valid statuses.
- Actual result: The dashboard sections expose search/filter/table/detail layouts only. No forms or action buttons exist for create/update/status workflows, even though the Edge Function exposes POST/PATCH endpoints.
- Severity: High.
- Suggested fix: Add scoped action controls to each admin section and wire them to the existing `/admin/*` API endpoints. Start with booking status and payment status because they unblock revenue workflows.

### 6. Mixes and video gallery cards imply media playback but have no playable source or link

- Area affected: Media gallery, mixes page.
- Steps to reproduce:
  1. Open `mixes.html`.
  2. Inspect the three mix cards.
  3. Open `gallery.html` and inspect the video section.
- Expected result: Mixes should render audio controls, embeds, or external links. Video cards should render an embed or a link to play/watch the clip.
- Actual result: The mixes page renders three `.audio-shell` placeholders with zero `<audio>` elements, zero iframes, and no external links. The gallery video card shows a play icon but has no iframe or link because `embedUrl` and `externalUrl` are empty.
- Severity: Medium.
- Suggested fix: Add real `audioUrl`, `embedUrl`, or `externalUrl` values to `media-data.js`, and render external links when embeds are not available.

### 7. Public availability empty state is not a true availability result

- Area affected: Events page, public availability.
- Steps to reproduce:
  1. Open `events.html`.
  2. Review the availability board.
- Expected result: The page should show real public holds/availability from `/availability` or a clear configured-empty state.
- Actual result: With no API configured, it only shows `Use the booking form for current availability.` and zero availability items. This is acceptable as a fallback, but it does not verify availability behavior.
- Severity: Medium.
- Suggested fix: Configure the API and add a tested empty state for `[]` separately from API unavailable/missing config.

## Passed Checks

- Public pages loaded without console errors in the local browser pass.
- Mobile nav opens/closes state correctly at 390 px width and did not introduce horizontal overflow.
- Booking and contact client-side validation catches missing required fields, malformed email, short phone, past date, equal start/end time, and non-positive guest count.
- Gallery renders local fallback media: 1 featured item, 6 gallery cards, 1 video card, and 1 recap card.
- Local static links/assets are present: 225 local href/src references checked, 0 missing.

## Fix Checklist

- [ ] Populate environment-specific `ProjectNeoConfig` values for `apiBaseUrl`, `supabaseUrl`, and `supabasePublishableKey`.
- [ ] Make booking/contact submit handlers always call `event.preventDefault()` before checking endpoint availability.
- [ ] Add visible API-missing error states for public forms instead of native POST fallback.
- [ ] Add `method="post"` and unconditional `preventDefault()` handling to admin and portal login forms.
- [ ] Disable auth submit buttons when config is missing.
- [ ] Ensure direct dashboard access redirects to login or a locked state before dashboard route exposure.
- [ ] Add admin UI actions for booking status updates, payment status updates, client creation, event creation, invoice creation, and payment recording.
- [ ] Wire admin action controls to existing Edge Function POST/PATCH endpoints and test success/error states.
- [ ] Add real audio/video embed URLs or external links for mix/video media.
- [ ] Configure and test `/availability` empty, success, and failure states.
- [ ] Run a live Supabase write/read verification once credentials and CLI or deployment endpoint are available.
