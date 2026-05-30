# Project Neo Agent Status

Last updated: 2026-05-29

## Recent Handoffs

- 2026-05-29: Launchpad added Vercel Speed Insights static-site integration for public Vercel-built pages and documented the security/deployment impact. Handoff: `docs/agent-handoffs/2026-05-29-launchpad-vercel-speed-insights.md`.
- 2026-05-26: Scribe created the Project Neo Agent Handoff Protocol package, including `AGENTS.md`, `docs/agent-handoffs/HANDOFF_TEMPLATE.md`, README guidance, changelog notes, and this status update. Handoff: `docs/agent-handoffs/2026-05-26-scribe-agent-handoff-protocol.md`.
- 2026-05-26: Bug Hunter documented live production desktop/mobile regression results and the production API launch blocker. Handoff: `docs/agent-handoffs/2026-05-26-bug-hunter-production-regression.md`.
- 2026-05-26: Launchpad documented Vercel production deployment verification and the remaining Supabase Edge Function blocker. Handoff: `docs/agent-handoffs/2026-05-26-launchpad-vercel-production-deployment.md`.
- 2026-05-26: Stack Mason documented production backend API verification blockers. Handoff: `docs/agent-handoffs/2026-05-26-stack-mason-production-backend-verification.md`.
- 2026-05-26: Shield documented Availability Checker security review findings and required launch-blocking RLS follow-up. Handoff: `docs/agent-handoffs/2026-05-26-shield-availability-checker-security-review.md`.

## Bug Hunter

Status: Live production desktop/mobile regression completed; launch is blocked by missing production API function.

Latest update:
- Confirmed `tookoldweb.vercel.app` now serves the Project Neo / DJ Too Kold production site.
- Verified tested public routes resolve, the official logo renders, empty booking/contact validation works, mobile menu opens, mobile booking has no horizontal overflow, and unauthenticated admin dashboard access redirects to admin login in browser testing.
- Confirmed the production API function is still unavailable: availability checker, booking/contact routes, dynamic media/mixes, and availability feeds return missing-function/CORS failures.
- Added handoff: `docs/agent-handoffs/2026-05-26-bug-hunter-production-regression.md`.

Blocked or pending:
- Stack Mason must deploy and verify the Supabase Edge Function before booking, contact, availability, admin, media, mix, and client portal flows can be launch-ready.
- Bug Hunter should rerun full production regression after the backend function is deployed and production-safe test submissions are approved.
- Shield should confirm whether admin/client routes need host-level Vercel protection in addition to Supabase/API authorization.

Next agent: Stack Mason

## Brand / Content

Status: Official logo branding incorporated locally and documented.

Latest update:
- Official DJ Too Kold logo asset is stored at `assets/images/dj-too-kold-logo.jpeg`.
- Shared header/footer brand marks now use the official logo image instead of the previous `TK` text mark.
- Homepage structured data includes the official logo asset.
- Handoff note updated to the required 16-field format.

Blocked or pending:
- QA should spot-check desktop and mobile headers/footers before the next release.
- A transparent PNG/SVG logo asset would improve future dark-surface usage if one becomes available.

Next agent: QA Test Engineer

## Data Knox

Status: Availability Checker schema handoff completed.

Latest update:
- Added a protocol-complete handoff note for the Availability Checker database schema.
- Documented the `availability_blocks` table, event conflict windows, booking inquiry availability snapshots, indexes, and RLS/security posture.
- Confirmed no frontend UI or API implementation was built by Data Knox.

Blocked or pending:
- Supabase CLI and `psql` are unavailable in this workspace, so the migration still needs database validation.
- Stack Mason needs to update public availability and booking inquiry APIs to consume the schema.
- Shield completed static security review; Stack Mason/Data Knox must fix the `availability_blocks` RLS helper mismatch before launch.

Next agent: Stack Mason

## Booker

Status: Booking flow handoff requirements documented and availability checker handoff expanded.

Latest update:
- Refreshed `docs/agent-handoffs/2026-05-24-booker-availability-checker-flow.md` with required handoff fields.
- Added Booker-specific booking flow handoff requirements to `AGENTS.md`.
- Confirmed the note documents booking flow changes, form fields changed, validation rules, API/data requirements, availability behavior, admin follow-up, and testing performed.
- No secrets, tokens, API keys, passwords, or private credentials were added.

Blocked or pending:
- Bug Hunter still needs to run the availability checker QA matrix.
- Supabase/Deno CLI verification remains blocked until those tools are available.

Next agent: Bug Hunter

## Pixel Frost

Status: Public frontend clean-route and form UI fixes completed locally and documented.

Latest update:
- Updated static build output so public pages have clean route directories and built HTML uses root-relative links/assets.
- Updated media fallback paths so gallery and mix images load from clean routes.
- Updated booking/contact valid-submit behavior so users stay on the branded page and receive API success or an actionable direct-email fallback.
- Expanded deployment validation for public page coverage and official header/footer logo usage.
- Added handoff: `docs/agent-handoffs/2026-05-26-pixel-frost-public-routing-form-ui.md`.

Blocked or pending:
- Launchpad / Deployment Engineer must promote the latest build before these exact frontend fixes are live.
- QA Test Engineer should rerun public smoke tests after promotion.
- Booker should confirm direct-email fallback copy for booking/contact inquiries.

Next agent: QA Test Engineer

## Mission Control

Status: Availability management dashboard MVP implemented and documented.

Latest update:
- Added the protected admin Availability section for availability block creation, upcoming event context, block lists, filters, detail views, and conflict indicators.
- Surfaced booking inquiry `availability_status_at_submission`, `availability_checked_at`, and requested window fields in admin review.
- Added protected admin API support and documentation for listing and creating `availability_blocks`.
- Updated `docs/agent-handoffs/2026-05-24-mission-control-availability-management.md` to the expanded required handoff format.

Blocked or pending:
- Full authenticated create-block API testing is pending until Project Neo API config and an admin session are available.
- `npm` and `deno` are not installed in the current shell, so project validation and Edge Function type-checking could not be run.
- Sync still needs to own external calendar import/export behavior.
- Shield completed static public/private availability review; RLS fix and scraping mitigations remain pending before launch.
- Bug Hunter still needs to run the availability management QA matrix.

Next agent: Bug Hunter

## Gatekeeper

Status: Auth route protection hardening completed locally.

Latest update:
- Admin, auth, and client portal forms block native credential-submit fallback when config is missing.
- Direct admin dashboard access redirects to admin login in missing-config state.
- Static hosting noindex headers cover clean and `.html` admin, auth, and portal URLs.
- Live Vercel static page checks passed for public/noindex behavior.
- Gatekeeper auth handoffs now notify Mission Control, Concierge, Shield, Launchpad, Data Knox, Bug Hunter, and Scribe, with explicit auth method, route, role, environment, redirect, risk, and testing sections.

Blocked or pending:
- Live Supabase admin and portal API authorization checks are blocked until Launchpad confirms the production Edge Function deployment.
- Vercel Authentication or Deployment Protection must be configured in Vercel itself if host-level route protection is required beyond Supabase Auth.

Next agent: Launchpad

## Launchpad

Status: Vercel production static deployment is live; the clean Speed Insights static-site integration is implemented locally and awaits promotion over the current Vercel bot `speed-insights.js` deployment drift; Supabase Edge Function deployment remains the launch blocker for live API workflows.

Latest update:
- Added build-time Vercel Speed Insights injection for public pages only, using the static/vanilla Vercel script route instead of a Next.js component.
- Confirmed the Vercel project serves the Speed Insights script route at `/_vercel/speed-insights/script.js`.
- Confirmed current production also contains a Vercel bot `speed-insights.js` integration on at least the homepage and client portal; Launchpad should replace it with the local build-injection approach before treating private-page exclusion as live.
- Added privacy guardrails so the local build-injection version is not injected on auth, admin, or client portal pages, query/hash data is stripped before metrics are sent, and legacy standalone `speed-insights.js` files are not copied forward.
- Added handoff: `docs/agent-handoffs/2026-05-29-launchpad-vercel-speed-insights.md`.
- Confirmed the production Vercel deployment for `tookoldweb.vercel.app` is ready and serves the public site without a Vercel Authentication interstitial.
- Confirmed clean URLs respond for key public, admin-login, and client-portal routes.
- Confirmed public browser config is generated for the production build while server-only values remain excluded from frontend code.
- Added handoff: `docs/agent-handoffs/2026-05-26-launchpad-vercel-production-deployment.md`.

Blocked or pending:
- Push/deploy the local Speed Insights build-injection changes, or reconcile the remote Vercel bot branch first, before treating Project Neo's Speed Insights implementation as privacy-reviewed.
- The `project-neo-api` Supabase Edge Function still needs to be deployed and verified before booking, contact, availability, admin, and client portal API flows can be treated as production-ready.
- Later uncommitted agent updates in this workspace still need review, commit, and promotion before they can be considered live.
- Supabase function secrets must be set in Supabase only; service-role, payment, calendar, OAuth, Apple, and webhook secrets must stay server-side.
- Shield should decide whether preview/admin/client routes require Vercel-level protection in addition to Supabase Auth.
- Bug Hunter should run a production smoke test after the backend function is deployed.

Next agent: Shield

## Stack Mason

Status: Production backend API verification blocked.

Latest update:
- Production Vercel configuration points to the intended Supabase Edge Function API base URL.
- The configured Supabase project currently reports no deployed Edge Functions.
- Expected public backend routes for booking inquiries, contact messages, availability checks, and health checks return function-not-found responses.
- No booking/contact database write success was observed or claimed.

Blocked or pending:
- Deploy `project-neo-api` to the configured Supabase project.
- Confirm function-level CORS allows the production Vercel domain after deployment.
- Confirm booking/contact submissions write to the correct production Supabase tables after deployment.
- Test availability checker responses for `available`, `pending`, `unavailable`, and `contact_required` after deployment.

Next agent: Stack Mason

## Concierge

Status: Client portal foundation implemented locally and documented.

Latest update:
- Added authenticated client portal structure for event overview, event timeline, invoice/balance status, hosted payment links, song requests, contract status, venue details, contact actions, and notes/preferences.
- Added `/portal/*` API routes scoped through `clients.portal_user_id`.
- Added `event_notes.client_editable` for client-editable preference notes.
- Added handoff: `docs/agent-handoffs/2026-05-26-concierge-client-portal-foundation.md`.

Blocked or pending:
- Shield needs to review portal auth boundaries, hosted payment-link exposure, CORS assumptions, and host-level route protection expectations.
- Bug Hunter needs to smoke test the portal against configured Supabase data and real client test accounts.
- Mission Control needs to confirm an admin workflow for linking `clients.portal_user_id` and marking event notes client-editable.
- Edge Function type-checking and Supabase migration validation remain pending until Deno/Supabase CLI or database tooling is available.

Next agent: Shield

## Brand / Content Engineer

Status: Production content QA completed locally and against the public Vercel site.

Latest update:
- Confirmed `assets/images/dj-too-kold-logo.jpeg` remains the repository-designated official logo.
- Confirmed production gallery, mixes, events, FAQ, and footer content are present.
- Confirmed the snowman logo artwork variants remain media-library promo assets, not replacements for the official header/footer logo.
- Added handoff: `docs/agent-handoffs/2026-05-26-brand-content-production-qa.md`.

Blocked or pending:
- Launchpad / Deployment Engineer should update deployment notes if the Vercel production promotion is now official.
- Vault / Media Library Engineer still needs approved playable mix/video sources before placeholder media can become real playback content.

Next agent: Launchpad

## Scout

Status: SEO, performance, accessibility, and local discovery optimization documented.

Latest update:
- Added Birmingham/Alabama search intent to public titles, meta descriptions, page copy, and booking-focused internal links.
- Added homepage LocalBusiness/EntertainmentBusiness structured data and FAQPage structured data.
- Added crawl hygiene for private/admin/auth/client portal routes and nofollow signals for public portal links.
- Improved image loading, alt text, skip-link accessibility, focus states, and deferred script loading.
- Added handoff: `docs/agent-handoffs/2026-05-26-scout-seo-performance-local-discovery.md`.

Blocked or pending:
- Launchpad must confirm the final production domain before canonical URLs and a production sitemap can be added.
- Bug Hunter should smoke test deployed public pages after the next deployment.
- Shield should review crawl boundaries for admin, auth, and client portal routes after deployment.
- Scout should revisit structured data after official phone, social links, service radius, and final domain are confirmed.

Next agent: Bug Hunter

## Neo Prime

Status: Architecture handoff requirements documented.

Latest update:
- Added architecture handoff requirements to `agents.md`.
- Confirmed Neo Prime must notify affected agents when work touches architecture, routing, folder structure, app strategy, or major technical decisions.
- Added a Neo Prime handoff note for the architecture handoff rule update.

Blocked or pending:
- None.

Next agent: Scribe

## Sync

Status: Availability Checker calendar logic supports overnight booking windows locally.

Latest update:
- Updated public availability, booking submission, admin event conflict checks, and client/admin/public schedule display logic so an event can start on one calendar date and end after midnight on the next date.
- Treats `end_time <= start_time` as a next-day ending while preserving the selected `event_date` as the start date.
- Added public-facing `next day` labels for overnight ranges without exposing private event, client, venue, or internal note data.
- Documented the overnight event window rule in the Project Neo backend notes.

Blocked or pending:
- Google Calendar sync remains deferred.
- `availability_blocks` does not yet have provider sync metadata.
- Shield completed static public availability serialization and RLS review; RLS fix and scraping mitigations remain pending before launch.
- Deno/Edge Function type checking could not be run locally because `deno` is not installed in this workspace.
- Bug Hunter should verify overnight public availability, admin conflict warnings, and stored `start_at`/`end_at` behavior against a deployed Edge Function.

Next agent: Bug Hunter

## Shield

Status: Availability Checker security review completed with launch-blocking RLS follow-up.

Latest update:
- Reviewed public availability checker serialization for private event/client/venue/internal note exposure.
- Confirmed `POST /availability-check` returns safe public statuses/messages and does not return client names, venue names, event titles, or internal notes.
- Identified a critical `availability_blocks` RLS helper mismatch: the availability policy references `private.is_project_neo_staff()`, while the core migration defines `private.is_project_neo_admin()` and drops old staff helpers.
- Identified medium-risk public schedule scraping, public `reason_code` leakage, and client-submitted availability snapshot integrity issues.
- Added handoff: `docs/agent-handoffs/2026-05-26-shield-availability-checker-security-review.md`.

Blocked or pending:
- Stack Mason/Data Knox need to fix and verify the `availability_blocks` RLS policy before launch.
- Stack Mason/Launchpad need to add abuse protection for public availability endpoints before launch.
- Stack Mason should remove or collapse public `reason_code` values and recompute booking availability snapshots server-side.
- Bug Hunter should add direct anonymous-access and public-response privacy tests.

Next agent: Stack Mason

## Ledger

Status: Invoice/payment ledger system implemented locally and documented.

Latest update:
- Added invoice hosted payment-link/reference fields for Square, Stripe, or another external checkout provider.
- Added invoice ledger snapshots for amount paid, deposit paid, and balance due.
- Added payment date/reference handling and payment validation in the Project Neo API.
- Added admin invoice ledger visibility and dashboard open balance support.
- Created and expanded `docs/agent-handoffs/2026-05-26-ledger-invoice-payment-ledger.md` with required payment-change notification notes for Data Knox, Stack Mason, Mission Control, Shield, Launchpad, Bug Hunter, and Scribe.

Blocked or pending:
- Supabase migration execution is pending because local Supabase CLI/database tooling was unavailable during implementation.
- Deno/Edge Function type checking is pending because Deno/TypeScript tooling was unavailable in the workspace.
- Square/Stripe payment-link creation and webhook reconciliation are still future integration work.

Next agent: Bug Hunter
