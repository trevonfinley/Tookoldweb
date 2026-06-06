# Changelog

All notable changes to Project Neo will be documented in this file.

Version format:
- MAJOR version: Big breaking changes or major platform shifts
- MINOR version: New features
- PATCH version: Bug fixes, small improvements, cleanup

---

## [Unreleased]

### Added
- Added Scribe + Neo Prime's 2026-06-06 launch-readiness rollup handoff documenting the current NO-GO decision and GO-only-after-critical-blockers-pass rule.
- Added a 2026-06-06 launch-readiness addendum to the `v0.8.0` release notes.
- Added Booker + Bug Hunter final production booking/contact QA handoff documenting overnight availability verification and successful public booking/contact writes against deployment `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`.
- Added Ledger's approved admin-session invoice/payment verification handoff documenting the unavailable owner session, protected-route pass, approved QA booking/contact prerequisites, and missing invoice/payment QA records.
- Added Mission Control's authenticated admin workflow verification handoff documenting protected-route results, approved QA booking/contact record readiness, the unconfirmed owner-session blocker, missing invoice/payment test records, and affected-agent follow-up.
- Added Gatekeeper's production owner bootstrap handoff documenting the first Supabase Auth owner identity, matching active role profile, owner-controlled activation path, security impact, and affected-agent follow-up.
- Added Bug Hunter's official-launch regression rerun handoff documenting production deployment `dpl_5QTuMWv2QYUKBqigZkpf6Zbq3m8c`, resolved overnight booking browser behavior, verified booking/contact database writes, and remaining NO-GO blockers.
- Added Gatekeeper's auth/authorization handoff for the final Vercel protection decision, including protected-route behavior, environment/redirect notes, security risks, testing notes, and affected-agent follow-up.
- Added the final Vercel protection decision record documenting that production remains public for MVP launch while Supabase Auth, protected API routes, and RLS remain the private-data boundary.
- Added Launchpad's Vercel protection decision handoff for Launchpad, Gatekeeper, Shield, Bug Hunter, Scribe, Mission Control, Concierge, and Stack Mason follow-up.
- Added Pixel Frost's overnight booking UI validation handoff documenting production deployment `dpl_5QTuMWv2QYUKBqigZkpf6Zbq3m8c`, changed booking validation behavior, and affected-agent follow-up.
- Added Booker overnight booking UI deployment handoff documenting production deployment `dpl_5QTuMWv2QYUKBqigZkpf6Zbq3m8c`, overnight availability validation verification, and affected-agent follow-up.
- Added Launchpad's clean Speed Insights production promotion handoff documenting deployment `dpl_7WvwHohRDsFwmgSBaHK6zXF486Er`, original clean preview `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ`, verification results, rollback target, and remaining launch blockers.
- Added Scribe's launch documentation consolidation handoff for the 2026-06-01 Neo Prime NO-GO launch-readiness summary.
- Added Neo Prime's final launch-readiness summary and launch-impacting handoff coverage table to `docs/PROJECT_NEO_LAUNCH_READINESS.md`.
- Added Mission Control launch-critical admin workflows: Admin Review Queue, booking inquiry status actions, event conflict indicators, payment review actions, and invoice/payment review context.
- Added Mission Control's admin workflow launch handoff documenting changed admin pages, data requirements, auth assumptions, private data handling, testing, and affected agents.
- Added Bug Hunter's official-launch production regression handoff documenting desktop/mobile public-page QA, booking/contact production writes, overnight availability drift, admin/client protection checks, private-page Speed Insights drift, and launch readiness recommendation.
- Added Launchpad's official production deployment readiness handoff documenting Vercel build settings, production-safe environment variables, final domain status, HTTPS/noindex/clean URL checks, Speed Insights status, rollback targets, and the production Supabase API URL.
- Added the Project Neo client portal foundation with authenticated client event views, invoice/balance display, hosted payment-link access, contract status, venue details, song requests, and client-visible notes/preferences.
- Added client portal API routes under `/portal/*`, scoped to `clients.portal_user_id`, plus `event_notes.client_editable` for allowed preference-note updates.
- Added Concierge's client portal foundation handoff note.
- Added the Agent Handoff and Change Notification Protocol to `AGENTS.md`, including required handoff fields, notification routing, and documentation safety rules.
- Added `docs/agent-handoffs/HANDOFF_TEMPLATE.md` as the standard template for new agent handoff notes.
- Added README guidance explaining how agent handoffs work.
- Added Gatekeeper handoff and agent status notes for auth route protection verification.
- Added Neo Prime handoff note for agent handoff/status process confirmation.
- Added Sync's Availability Checker calendar logic handoff, covering conflict rules, status mapping, all-day behavior, travel/setup blocks, and future Google Calendar sync notes.
- Added Data Knox Availability Checker schema closeout documentation, covering the Supabase availability migration, RLS/security impact, and handoffs for Booker, Mission Control, Stack Mason, Shield, and Sync.
- Added Shield's Availability Checker security review handoff, documenting the RLS helper mismatch, public reason-code leakage, schedule scraping risk, and required follow-up work.
- Added Mission Control availability management to the protected admin dashboard, including block creation, block lists, upcoming event context, conflict indicators, and booking inquiry availability snapshots.
- Added protected admin availability block API documentation and the Mission Control availability management handoff note.
- Added Ledger's invoice/payment handoff note for the invoice, deposit, balance, hosted payment-link, and payment tracking system.
- Added invoice ledger tracking for hosted payment references, deposit paid, amount paid, balance due, payment dates, and admin invoice visibility.
- Added Brand / Content production QA handoff documenting official logo confirmation, production content checks for gallery, mixes, events, FAQ, and footer, plus deployment follow-up ownership.
- Added Birmingham/Alabama local SEO content, homepage LocalBusiness structured data, FAQPage structured data, and crawl hygiene rules for private pages.
- Added Scout's SEO/performance handoff note in `docs/agent-handoffs/`.
- Added public launch `sitemap.xml` with clean public URLs for the current production target.
- Added Scout's public launch SEO/accessibility handoff note.
- Added Stack Mason production backend verification handoff documenting that the configured Supabase Edge Function API is not currently deployed or reachable.
- Added Pixel Frost frontend handoff documentation for public clean-route, media asset, and booking/contact UI fixes.
- Added Launchpad's Vercel production deployment handoff with public deployment verification, environment notes, and Supabase Edge Function follow-up ownership.
- Added Bug Hunter's live production desktop/mobile regression handoff with booking, availability checker, contact, admin protection, dynamic API feed, and launch readiness findings.
- Added Neo Prime architecture handoff requirements to `agents.md` for architecture, routing, folder structure, app strategy, and major technical decisions.
- Added the official Project Neo launch readiness tracker with blockers, owners, launch gates, and pass/fail criteria.
- Added Gatekeeper authentication handoff requirements to `agents.md`, including required auth-specific fields and notification routing for Mission Control, Concierge, Shield, Launchpad, Data Knox, Bug Hunter, and Scribe.
- Added Vercel Speed Insights static-site integration notes and Launchpad handoff for public-page performance observability.
- Added Booker booking/admin flow review handoff documenting admin status workflow, availability snapshot trust, unchecked availability copy, and public message follow-up.
- Added Booker full booking journey launch review handoff covering visitor inquiry, availability check, admin review, quote/invoice, deposit, and confirmed-event readiness.
- Added Bug Hunter overnight conflict QA handoff documenting targeted cross-midnight availability, block, admin-conflict, and booking UI test coverage.
- Added Stack Mason backend function deployment handoff documenting the reduced production `project-neo-api` deployment for Sync's overnight availability update.
- Added Data Knox production Supabase schema handoff documenting applied production migrations, tables, columns, relationships, indexes, RLS, grant hardening, and affected-agent follow-up.
- Added Stack Mason full production API deploy handoff documenting `project-neo-api` version 3 route coverage, verification results, cleanup, and remaining authenticated-session follow-up.
- Added Ledger launch invoice/payment verification handoff confirming tracking readiness, sensitive card-data rejection, protected invoice/payment routes, and live Square/Stripe collection deferral.
- Added Ledger authenticated admin invoice/payment workflow verification handoff documenting the production blocker: zero Auth users, zero Project Neo users, and zero active owner/admin records.

### Changed
- Updated launch tracker, deployment notes, release notes, README launch-readiness summary, production launch checklist, and agent status with the 2026-06-06 NO-GO launch decision.
- Documented that Neo Prime can declare GO only after all critical blockers pass or receive explicit owner-approved deferrals.
- Verified overnight booking behavior and public booking/contact submissions still write correctly on the current final production deployment.
- Deployed the deferred client portal visibility fix in Vercel production deployment `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`: all nine public pages now hide Portal links and the direct portal displays invitation-only private-beta copy.
- Re-attempted the approved-session Mission Control/Ledger workflow verification; the owner identity remains unconfirmed/unsigned-in, protected admin routes reject unauthenticated access, approved booking/contact rows remain available, and invoice/payment review remains blocked by zero records.
- Re-verified production admin, invoice, and payment workflow readiness: unauthenticated protected routes return `401`, two approved QA booking/contact runs remain available for admin review, and authenticated success paths remain blocked because the owner Auth identity is unconfirmed and production has zero invoice/payment records.
- Bootstrapped the first production Supabase Auth identity and matching active `public.users` owner profile; approved admin-session QA remains pending owner email confirmation and first sign-in.
- Updated `docs/agent-status.md` with Bug Hunter's official-launch rerun result, new QA run ID, resolved overnight availability blocker, and remaining production release-drift follow-up.
- Updated deployment, auth, launch-readiness, deployment-note, and agent-status documentation to close the host-level Vercel protection decision item and move remaining work to verification.
- Updated `docs/agent-status.md` with Ledger's authenticated invoice/payment workflow verification result and the required Gatekeeper/Data Knox admin bootstrap follow-up.
- Fixed and deployed booking UI validation so overnight event windows where end time is at or before start time are allowed in the public availability checker and booking inquiry form.
- Deployed the overnight-aware booking availability checker UI to production so `22:00` to `02:00` event windows are no longer served from the stale browser validation artifact.
- Promoted the clean Vercel deployment that removes private-page Speed Insights drift while keeping the Vercel static Speed Insights script on intended public pages.
- Updated launch checklist, deployment notes, README launch-readiness guidance, and agent status with the current 2026-06-01 NO-GO launch decision and remaining launch blockers.
- Updated launch-impacting handoff notes so the latest launch-critical agent notes include the required handoff fields.
- Deferred the client portal from official launch to hidden/private beta, removed public Portal navigation/footer entry points, and marked the direct portal login as invitation-only pending approved client-session QA.
- Updated public availability evaluation so pending/hold admin event overlaps return the public `pending` status instead of appearing available.
- Updated booking checker validation so missing required availability-check fields keep Continue to Inquiry hidden.
- Updated admin dashboard documentation for booking status actions, payment status actions, and conflict-warning visibility.
- Updated `docs/agent-status.md` with Bug Hunter's official-launch regression result, QA production record run ID, launch-blocking findings, and required follow-up owners.
- Prepared the official production deployment gate and held promotion because the current release remains NO-GO until Speed Insights production drift, final authenticated QA, preview verification, and pending local launch-readiness changes are resolved.
- Applied the production Supabase schema for Project Neo through the Supabase connector, including core booking/contact/client/event/billing/media/portal tables and the Availability Checker schema.
- Fixed the `availability_blocks` RLS helper mismatch by moving the policy to the existing `private.is_project_neo_admin()` helper and adding a repair migration.
- Allowed overnight availability and booking windows by treating end times at or before start times as next-day endings, with `next day` labels in public, admin, and client schedule displays.
- Hardened admin, auth, and client portal form fallback behavior so missing configuration does not submit credentials through query strings.
- Redirected direct admin dashboard access to admin login when auth configuration is unavailable.
- Expanded Vercel and Netlify noindex header coverage for admin, auth, and client portal clean URLs and `.html` routes.
- Added `docs/agent-status.md` to track the current documentation/process handoff status.
- Updated `docs/agent-status.md` with Neo Prime process confirmation.
- Updated the Booker availability checker handoff note to the expanded required handoff format.
- Added Booker-specific booking flow handoff notification and required-content rules to `AGENTS.md`.
- Updated public page titles, meta descriptions, booking-focused internal links, image loading attributes, alt text, skip-link accessibility, focus states, and deferred script loading for search clarity and speed.
- Added canonical URLs to public pages and absolute launch-domain references to homepage/FAQ structured data.
- Expanded `robots.txt` to disallow clean private routes and declare the production sitemap.
- Updated the static build script to copy `.xml` launch artifacts into `dist`.
- Updated the official logo branding handoff note to the required structured agent handoff format.
- Updated `docs/agent-status.md` with the Stack Mason production API verification blocker.
- Updated the static build to emit clean public route output and root-relative built HTML links/assets.
- Updated public media fallback paths so dynamic gallery and mix images load correctly from clean routes.
- Updated booking/contact valid-submit behavior so users stay on the branded page and see an API success or actionable email fallback.
- Expanded deployment validation to require all public pages and confirm official logo usage in public headers and footers.
- Updated `docs/agent-status.md` with Launchpad's Vercel production deployment status and remaining backend deployment blocker.
- Updated `docs/agent-status.md` with Bug Hunter's production regression result and backend launch blocker.
- Updated `docs/agent-status.md` with a recent handoffs section and Scribe's handoff protocol package update.
- Standardized the canonical agent instruction file name as `AGENTS.md`.
- Updated `docs/agent-status.md` with Neo Prime architecture handoff rule status.
- Updated Gatekeeper's auth route protection handoff with auth methods, route, role, environment, redirect, security risk, and testing details.
- Updated the static build to inject Vercel Speed Insights only during Vercel builds and only on public pages, with query/hash redaction before metrics are sent and legacy standalone `speed-insights.js` references removed.
- Updated `docs/agent-status.md` with Launchpad's Speed Insights status and deployment follow-up.
- Documented current Vercel bot `speed-insights.js` production drift so Launchpad, Shield, and Bug Hunter can verify the clean build-injection implementation after promotion.
- Updated Ledger handoff/status documentation with required invoice/payment affected-agent notifications and payment-change details.
- Updated `docs/agent-status.md` with Bug Hunter's overnight conflict QA result and deployed-runtime follow-up.
- Deployed a reduced production Supabase `project-neo-api` Edge Function with public health, availability, booking, contact, and catalog/feed routes while documenting the remaining full API deployment follow-up.
- Updated `docs/agent-status.md` with the reduced backend deployment status and remaining schema/full-function blockers.
- Updated `docs/agent-status.md` with Neo Prime launch coordination status.
- Replaced the reduced production Supabase `project-neo-api` deployment with full-route version 3 and verified public booking, contact, availability, service package, media, mix, feed, admin-auth, invoice/payment-auth, and portal-auth behavior against the production schema.
- Updated `docs/agent-status.md` with the full production API deployment status and remaining authenticated admin/client testing follow-up.
- Added Shield's launch security review handoff covering production RLS, Edge Function auth, route boundaries, public availability responses, CORS, secret handling, payment data handling, noindex behavior, abuse protection, and compliance wording.
- Updated `docs/agent-status.md` with Ledger's launch invoice/payment verification result and remaining authenticated-admin payment QA blocker.

### Security
- Confirmed the requested approved-session verification did not bypass the unconfirmed owner identity: direct dashboard access redirected to login and protected admin, booking, invoice, and payment routes returned `401` without authorization.
- Documented that current production again loads Speed Insights scripts on admin/auth/client pages and still exposes public client portal links despite the portal hidden/private beta deferral.
- Recorded the final Vercel protection posture: no global Vercel Authentication or production Deployment Protection wall for the public MVP site; preview/staging should use Vercel protection where available; protected data remains behind Supabase Auth, Edge Function authorization, and RLS.
- Resolved the documented private-page Speed Insights production drift for admin login and client portal routes by promoting the clean static build; public Speed Insights remains limited to public pages.
- Confirmed production currently has no Auth users or active Project Neo owner/admin users, so authenticated admin invoice/payment workflows remain unverified until Gatekeeper/Data Knox complete a controlled admin bootstrap.
- Confirmed admin status/payment actions remain behind protected `/admin/*` API routes and documented that authenticated production write testing still requires an approved Gatekeeper admin session.
- Confirmed invoice/payment tracking stores references, hosted links, statuses, amounts, deposits, balances, and payment dates while live Square/Stripe collection remains deferred unless separately verified.
- Verified production sensitive card-field rejection returns `400 sensitive_payment_data_rejected`.
- Documented that unauthenticated admin/portal API routes return `401`, invalid admin login does not leak test credentials in the URL, and the previously observed private-page Speed Insights telemetry drift required Launchpad/Shield follow-up.
- Resolved the launch-blocking `availability_blocks` RLS helper mismatch in production.
- Hardened Project Neo production table grants so `anon` and `authenticated` browser roles do not retain `TRUNCATE`, `REFERENCES`, or `TRIGGER` privileges on audited tables.
- Documented public Availability Checker scraping and reason-code leakage risks for Stack Mason, Data Knox, Booker, Mission Control, Bug Hunter, and Launchpad follow-up.
- Removed public availability `reason_code` output, added lightweight availability endpoint rate limiting, bounded public availability checks to a 370-day horizon, restricted the public availability feed to intentionally public events, and recomputed booking availability snapshots server-side.
- Changed Edge Function CORS defaults to the current production Vercel origin unless `PROJECT_NEO_ALLOWED_ORIGIN` is explicitly configured.

---

## [0.8.0] - 2026-05-25

### Added
- Added first successful Vercel web preview deployment documentation.
- Documented `v0.8.0 — First Web Preview` in `VERSION.md` and `docs/versions/v0.8.0.md`.
- Added deployment notes for the Vercel preview in `docs/deployment-notes.md`.
- Added a deployment milestone summary for the first web preview.
- Added `agents.md` with Project Neo agent collaboration and handoff rules.
- Created `docs/agent-handoffs/` with the first Neo Prime handoff note.
- Added availability checker requirements to `agents.md` for public-safe status handling and admin conflict checks.
- Added the public booking availability checker with API integration, loading/error/status states, and booking inquiry status snapshot handoff.
- Added Mission Control and Bug Hunter notes for availability checker review.
- Added SOC 2 Type II readiness and PCI-DSS alignment requirements to `agents.md`.
- Created the first compliance decision record in `docs/decisions/`.
- Added the official DJ Too Kold logo asset and wired it into site branding.

### Changed
- Routed direct public email links and website contact metadata to `djtookold@gmail.com`.
- Preserved public availability status and checked timestamp when booking inquiries are submitted after a successful checker result.
- Confirmed the first Vercel deployment is a preview milestone, not the official `v1.0.0` MVP launch.

### Deferred
- Confirmed Square integration remains deferred.

### Compliance Notes
- Confirmed SOC 2 Type II and PCI-DSS are readiness/alignment goals only, not official compliance claims.

---

## [0.1.0] - 2026-05-24

### Added
- Created initial Project Neo repo structure.
- Added global AGENTS.md instructions.
- Defined engineering agents for Codex workflow.
- Added initial DJ Too Kold brand direction.
- Added MVP build order.

### Changed
- N/A

### Fixed
- N/A

### Removed
- N/A
