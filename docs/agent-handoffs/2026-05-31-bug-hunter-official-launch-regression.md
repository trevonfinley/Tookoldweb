# Agent Handoff - Official Launch Regression

## Agent Name

Bug Hunter

## Agent Role

Project Neo QA Engineer

## Date

2026-05-31 America/Chicago. Automated run generated `2026-06-01T02:00:34.479Z`.

## Task Summary

Completed the official-launch regression against the live Vercel production deployment after the production schema and full Supabase Edge Function API were reported ready.

Target tested:
- Production site: `https://tookoldweb.vercel.app`
- Production API: `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api`
- Current production deployment observed during QA: `dpl_2mKhqPH4g8CMvzwCZBfocXSGeTUU`
- Latest clean preview candidate from Launchpad context: `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ`
- QA run ID: `qa-launch-20260601020033`

Launch readiness recommendation: **NO-GO**. Public booking and contact submissions are writing to production, public API smoke tests pass, and unauthenticated private API boundaries return `401`. However, current production still has launch-blocking deployment drift: overnight availability is rejected by the production browser UI while the API accepts it, Speed Insights scripts remain on private/admin/client pages, and authenticated admin inquiry review could not be completed without an approved production admin session.

## Files Created

- `docs/agent-handoffs/2026-05-31-bug-hunter-official-launch-regression.md`
- Temporary QA artifacts, not committed:
  - `/private/tmp/project-neo-official-launch-regression/report.json`
  - `/private/tmp/project-neo-official-launch-regression/desktop-availability-checker.png`
  - `/private/tmp/project-neo-official-launch-regression/desktop-booking-submit.png`
  - `/private/tmp/project-neo-official-launch-regression/desktop-contact-submit.png`
  - `/private/tmp/project-neo-official-launch-regression/desktop-admin-protection.png`
  - `/private/tmp/project-neo-official-launch-regression/desktop-client-portal.png`
  - `/private/tmp/project-neo-official-launch-regression/mobile-home-menu.png`
  - `/private/tmp/project-neo-official-launch-regression/mobile-booking.png`
  - `/private/tmp/project-neo-official-launch-regression/mobile-gallery.png`
  - `/private/tmp/project-neo-official-launch-regression.mjs`
  - `/private/tmp/project-neo-validation-probe.mjs`
  - `/private/tmp/project-neo-response-probe.mjs`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Treated `https://tookoldweb.vercel.app` as the live production target because it is the active Vercel production alias.
- Did not modify application code. Findings that need fixes are assigned to owning agents.
- Treated the gallery image failure from the first automated scan as a lazy-loading false positive after direct image and scroll verification showed the image loads successfully.
- Kept the production QA records created by this run for Mission Control/admin follow-up instead of deleting them immediately.
- Rated launch readiness as NO-GO because at least one booking-critical frontend behavior is not aligned with production API behavior and private-page telemetry drift remains live.

## Data/API/Schema Changes

- No schema or API code changes were made.
- Production test data was created through public forms:
  - One booking inquiry with QA email `qa-launch-20260601020033@example.com`, status `new`, event date `2026-12-31`, start time `22:00:00`, end time `02:00:00`, requested start/end timestamps present, and `availability_status_at_submission` stored as `available`.
  - One contact message with QA email `qa-launch-20260601020033@example.com`, status `new`.
- Direct API checks passed for:
  - `GET /health`
  - `POST /availability-check`
  - `GET /availability?limit=8`
  - `GET /media?limit=60`
  - `GET /mixes?limit=24`
  - `GET /service-packages`
  - Unauthenticated `GET /admin/booking-inquiries` returning `401`
  - Unauthenticated `GET /portal/me` returning `401`

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Positive: unauthenticated admin API and portal API requests returned safe `401` responses with no private records exposed.
- Positive: unauthenticated admin dashboard access redirects to admin login and private dashboard rows were not visible.
- Positive: invalid admin login did not leak the test email or password into the URL.
- Risk: current production still injects Speed Insights scripts on `admin-login`, redirected `admin-dashboard`, and `client-portal` pages. This conflicts with the documented privacy guardrail that private/admin/client pages should not carry telemetry scripts.
- Risk: authenticated admin inquiry review is unverified because no approved production admin session was available.
- No secrets, tokens, API keys, passwords, private credentials, or real private client details were documented.

## Agents That Need This Update

- Launchpad
- Pixel Frost
- Booker
- Stack Mason
- Gatekeeper
- Mission Control
- Shield
- Data Knox
- Scribe

## Required Follow-Up Tasks

- Launchpad: promote the intended clean release or otherwise remove production drift before final launch verification.
- Launchpad and Shield: recheck that Speed Insights is absent from admin/auth/client routes after the clean release is live.
- Pixel Frost and Booker: fix or deploy the overnight-aware booking availability checker UI so valid cross-midnight windows are not blocked in the browser.
- Gatekeeper: provide an approved production admin session for QA.
- Mission Control: verify the QA booking inquiry appears in the authenticated admin dashboard and that inquiry status updates work.
- Data Knox or Mission Control: clean up the QA booking/contact rows for run ID `qa-launch-20260601020033` after admin review evidence is no longer needed.
- Launchpad, Gatekeeper, and Shield: make the final decision on host-level Vercel protection for static admin/client shells.
- Bug Hunter: rerun official-launch regression against the promoted intended production release and approved admin/client sessions.

## Risks or Blockers

- **Launch blocker:** current production is not aligned with the latest clean preview candidate and still shows private-page Speed Insights drift.
- **Launch blocker:** production browser availability checker rejects overnight event windows even though the production API accepts them.
- **Launch blocker:** authenticated admin inquiry review and status update flow remains untested without an approved admin session.
- **Residual risk:** media/gallery dynamic API feeds currently return valid empty arrays; visual pages rely on static/fallback content until approved production media records exist.
- **Residual risk:** an empty availability-checker validation probe emitted an anonymous browser console `404` line, but response tracing captured no failed app request. Monitor this after the next deployment.

## Testing Performed

### Automated Regression Summary

- Tooling: headless Google Chrome with Playwright.
- Viewports:
  - Desktop: `1280x900`
  - Mobile: `390x844`
- First automated pass: 35 checks, 32 passed, 3 initial failures.
- Post-run drilldown:
  - Gallery/media and mobile gallery initial failures were confirmed as lazy-loading false positives.
  - Remaining functional browser failure is the overnight availability checker.

### Desktop Public Pages

| Result | URL | Steps |
| --- | --- | --- |
| PASS | `https://tookoldweb.vercel.app/` | Open page, verify title/body, logo rendering, no broken images, no horizontal overflow, no console/failed app requests. |
| PASS | `https://tookoldweb.vercel.app/services.html` | Open page, verify services content, logo, media, links, no horizontal overflow. |
| PASS | `https://tookoldweb.vercel.app/events.html` | Open page, verify events page and public availability feed empty state. |
| PASS | `https://tookoldweb.vercel.app/faq.html` | Open page, verify FAQ content and footer/header links. |
| PASS after lazy-load drilldown | `https://tookoldweb.vercel.app/gallery.html` | Open page, scroll gallery, verify official/promo image assets load and no failed image requests remain. |
| PASS | `https://tookoldweb.vercel.app/mixes.html` | Open page, verify mixes page renders and empty feed behavior is safe. |
| PASS | `https://tookoldweb.vercel.app/booking.html` | Open page, verify booking form, logo, layout, API configuration, and success submission behavior. |
| PASS | `https://tookoldweb.vercel.app/contact.html` | Open page, verify contact form, validation, success submission behavior, and no failed app requests. |
| PASS with privacy finding | `https://tookoldweb.vercel.app/admin-login.html` | Open page, verify admin login renders, noindex is present, invalid login shows an error and does not leak credentials in URL. Speed Insights remains present. |
| PASS unauth protection with privacy finding | `https://tookoldweb.vercel.app/admin-dashboard.html` | Open direct route without auth, verify redirect to `https://tookoldweb.vercel.app/admin-login?returnTo=admin-dashboard`, no private rows visible, noindex present. Speed Insights remains present. |
| PASS unauth behavior with privacy finding | `https://tookoldweb.vercel.app/client-portal.html` | Open without auth, verify login shell only, no private invoice data visible, noindex present. Speed Insights remains present. |

### Navbar, Footer, Logo, Media

- PASS: header and footer links resolved without broken-link failures in the automated scan.
- PASS: official DJ Too Kold logo rendered on tested public, admin login, and client portal pages.
- PASS after drilldown: `https://tookoldweb.vercel.app/assets/images/dj-too-kold-logo-thumb-520.jpg` loads directly and after scrolling the lazy gallery image into view.
- PASS: no unrecovered failed image requests were observed after lazy-load verification.

### Booking, Contact, Availability, and Database Behavior

| Result | URL | Steps |
| --- | --- | --- |
| PASS | `https://tookoldweb.vercel.app/booking.html` | Submit a valid QA booking inquiry with run ID `qa-launch-20260601020033`; verify success message and production DB row. |
| FAIL | `https://tookoldweb.vercel.app/booking.html` | Enter date `2026-12-31`, start `22:00`, end `02:00`, event type `Private party`, click Check Availability. Browser blocks the valid overnight window. |
| PASS | `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api/availability-check` | POST the same overnight date/time payload directly to the API; API returns `ok: true` and public `available` status with no private data. |
| PASS | `https://tookoldweb.vercel.app/booking.html` | Submit empty availability checker; inline validation lists missing date, event type, start time, and end time. |
| PASS | `https://tookoldweb.vercel.app/contact.html` | Submit empty contact form; form is invalid and displays `Please fix the errors above.` |
| PASS | `https://tookoldweb.vercel.app/contact.html` | Submit valid QA contact message with run ID `qa-launch-20260601020033`; verify success message and production DB row. |

### Admin and Client Route Protection

| Result | URL | Steps |
| --- | --- | --- |
| PASS | `https://tookoldweb.vercel.app/admin-dashboard.html` | Direct unauthenticated browser request redirects to `https://tookoldweb.vercel.app/admin-login?returnTo=admin-dashboard`; no private dashboard rows visible. |
| PASS | `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api/admin/booking-inquiries` | GET without Bearer token returns `401 unauthorized`. |
| BLOCKED | `https://tookoldweb.vercel.app/admin-dashboard.html` | Authenticated admin inquiry review and status updates could not be tested because no approved production admin session was available. |
| PASS | `https://tookoldweb.vercel.app/client-portal.html` | Open without auth; login shell visible and private invoice text not exposed. |
| PASS | `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api/portal/me` | GET without Bearer token returns `401 unauthorized`. |

### Mobile Regression

| Result | URL | Steps |
| --- | --- | --- |
| PASS | `https://tookoldweb.vercel.app/` | At `390x844`, verify no horizontal overflow, logo renders, mobile nav opens, and nav links are visible. |
| PASS | `https://tookoldweb.vercel.app/booking.html` | At `390x844`, verify no horizontal overflow, availability checker visible, booking form visible. |
| PASS after lazy-load drilldown | `https://tookoldweb.vercel.app/gallery.html` | At `390x844`, verify no horizontal overflow and gallery image loads after scroll/lazy-load. |

## Bugs Found

### Bug 1: Production booking availability checker rejects valid overnight event windows

- Area affected: Booking page, availability checker, launch-critical booking workflow
- Steps to reproduce:
  1. Open `https://tookoldweb.vercel.app/booking.html`.
  2. Enter event date `2026-12-31`.
  3. Enter start time `22:00`.
  4. Enter end time `02:00`.
  5. Select event type `Private party`.
  6. Click `Check Availability`.
- Expected result: Browser accepts the cross-midnight event window and calls the production API, which already supports overnight windows.
- Actual result: Browser displays `End time should be after start time.` and shows `Contact Required` with missing availability snapshot fields.
- Severity: High, launch blocker.
- Suggested fix: Pixel Frost/Booker should deploy the overnight-aware frontend validation already expected by Sync/Stack Mason, treating end times at or before start time as next-day end times. Add a browser regression for `22:00` to `02:00`.

### Bug 2: Speed Insights scripts remain on private/admin/client production pages

- Area affected: Admin login, admin dashboard redirect shell, client portal, security/privacy guardrails
- Steps to reproduce:
  1. Open `https://tookoldweb.vercel.app/admin-login.html`.
  2. Inspect loaded scripts.
  3. Repeat for `https://tookoldweb.vercel.app/admin-dashboard.html` and `https://tookoldweb.vercel.app/client-portal.html`.
- Expected result: Private/admin/client pages have no Speed Insights telemetry scripts.
- Actual result: Pages include `/_vercel/speed-insights/script.js` and `/speed-insights.js`.
- Severity: High, launch blocker.
- Suggested fix: Launchpad should promote the clean release that excludes Speed Insights from private pages, then Shield/Bug Hunter should reverify.

### Bug 3: Authenticated admin inquiry review is not launch-verified

- Area affected: Admin dashboard, booking inquiry review, booking status workflow
- Steps to reproduce:
  1. Submit QA booking inquiry through `https://tookoldweb.vercel.app/booking.html`.
  2. Attempt to review the inquiry in `https://tookoldweb.vercel.app/admin-dashboard.html`.
  3. Attempt to update the inquiry status.
- Expected result: Approved admin can sign in, see the new inquiry, review availability snapshot fields, and update status.
- Actual result: Could not test because no approved production admin session was available.
- Severity: High, launch blocker until verified.
- Suggested fix: Gatekeeper should provide/confirm an approved owner/admin session. Mission Control and Bug Hunter should verify inquiry visibility and status updates using QA record `qa-launch-20260601020033@example.com`.

### Bug 4: Current production deployment is stale relative to documented clean preview candidate

- Area affected: Deployment/release management
- Steps to reproduce:
  1. Compare current production deployment `dpl_2mKhqPH4g8CMvzwCZBfocXSGeTUU` with latest clean preview candidate `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ`.
  2. Verify live production still has Speed Insights drift and stale overnight UI behavior.
- Expected result: Official launch QA runs against the intended clean production release.
- Actual result: Production still appears to be behind the launch-ready preview candidate.
- Severity: High, launch blocker.
- Suggested fix: Launchpad should promote or redeploy the intended candidate after blockers are cleared, then Bug Hunter should rerun this matrix.

### Bug 5: Anonymous console 404 during empty booking availability validation

- Area affected: Booking page validation/asset loading
- Steps to reproduce:
  1. Open `https://tookoldweb.vercel.app/booking.html`.
  2. Click `Check Availability` with required fields empty.
  3. Watch browser console.
- Expected result: Only inline validation messages appear; no console errors.
- Actual result: Browser emitted `Failed to load resource: the server responded with a status of 404 ()`. Response tracing captured no failed app request, so the exact missing resource was not identified.
- Severity: Low.
- Suggested fix: Recheck after the clean production promotion; if still present, inspect browser network logs for favicon/asset/telemetry source.

## Suggested Next Agent

Launchpad, then Gatekeeper and Mission Control. Launchpad should get the intended clean release live first; Gatekeeper/Mission Control should unblock authenticated admin review; Bug Hunter should rerun launch regression after those changes.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
