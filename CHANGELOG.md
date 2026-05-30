# Changelog

All notable changes to Project Neo will be documented in this file.

Version format:
- MAJOR version: Big breaking changes or major platform shifts
- MINOR version: New features
- PATCH version: Bug fixes, small improvements, cleanup

---

## [Unreleased]

### Added
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
- Added Stack Mason production backend verification handoff documenting that the configured Supabase Edge Function API is not currently deployed or reachable.
- Added Pixel Frost frontend handoff documentation for public clean-route, media asset, and booking/contact UI fixes.
- Added Launchpad's Vercel production deployment handoff with public deployment verification, environment notes, and Supabase Edge Function follow-up ownership.
- Added Bug Hunter's live production desktop/mobile regression handoff with booking, availability checker, contact, admin protection, dynamic API feed, and launch readiness findings.
- Added Neo Prime architecture handoff requirements to `agents.md` for architecture, routing, folder structure, app strategy, and major technical decisions.
- Added Gatekeeper authentication handoff requirements to `agents.md`, including required auth-specific fields and notification routing for Mission Control, Concierge, Shield, Launchpad, Data Knox, Bug Hunter, and Scribe.
- Added Vercel Speed Insights static-site integration notes and Launchpad handoff for public-page performance observability.

### Changed
- Allowed overnight availability and booking windows by treating end times at or before start times as next-day endings, with `next day` labels in public, admin, and client schedule displays.
- Hardened admin, auth, and client portal form fallback behavior so missing configuration does not submit credentials through query strings.
- Redirected direct admin dashboard access to admin login when auth configuration is unavailable.
- Expanded Vercel and Netlify noindex header coverage for admin, auth, and client portal clean URLs and `.html` routes.
- Added `docs/agent-status.md` to track the current documentation/process handoff status.
- Updated `docs/agent-status.md` with Neo Prime process confirmation.
- Updated the Booker availability checker handoff note to the expanded required handoff format.
- Added Booker-specific booking flow handoff notification and required-content rules to `AGENTS.md`.
- Updated public page titles, meta descriptions, booking-focused internal links, image loading attributes, alt text, skip-link accessibility, focus states, and deferred script loading for search clarity and speed.
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

### Security
- Flagged `availability_blocks` RLS as launch-blocking until the policy references a valid Project Neo admin/staff predicate.
- Documented public Availability Checker scraping and reason-code leakage risks for Stack Mason, Data Knox, Booker, Mission Control, Bug Hunter, and Launchpad follow-up.

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
