# Changelog

All notable changes to Project Neo will be documented in this file.

Version format:
- MAJOR version: Big breaking changes or major platform shifts
- MINOR version: New features
- PATCH version: Bug fixes, small improvements, cleanup

---

## [Unreleased]

### Added
- Added Booker's Event Prep Checklist booking-intake update with an optional folded prep section for day-of contact, event vibe, crowd type, clean/explicit preference, mic needs, must-play/do-not-play songs, announcements, special moments, load-in notes, and parking notes.
- Added Mission Control's admin-only Event Prep Checklist UI with an Event Prep dashboard section, event-detail checklist entry action, progress summary, required-item counts, sectioned prep cards, local private completion toggles, sourced venue/music/gear/timeline/payment/contract context, and empty states.
- Added Data Knox's Event Prep Checklist database migration and handoff for admin-private event preparation checklists, checklist items, gear lists, timeline items, music notes, seeded default prep items, indexes, relationships, and RLS policies.
- Added Data Knox's 2026-06-24 QA schema/RLS recheck handoff documenting the post-retest database-owner review, no-migration decision, no-card-data confirmation, availability RLS posture, and affected-agent deployed retest notes.
- Added Roadmap's Event Prep Checklist product brief and handoff defining MVP scope, Phase 1 vs later scope, user stories, acceptance criteria, existing data sources, manually editable checklist data, private/admin-only boundaries, and affected-agent follow-up.
- Added Roadmap's product roadmap and handoff documenting Phase 1 money-path MVP scope, Phase 2 operational follow-through, deferred future ideas, user stories, acceptance criteria, success criteria, affected-agent dependencies, and scope-control decisions.
- Added Launchpad's 2026-06-22 promotion readiness handoff documenting the NO-GO deployment decision, remaining High release blockers, target environment recommendation, staging checklist, rollback reminder, and owner follow-up.
- Added Scribe's 2026-06-22 final QA cycle summary handoff for Launchpad and the owner, summarizing final bug statuses, remaining open issues, deployment blockers, and readiness state after Bug Hunter retest and Shield review.
- Added Shield's 2026-06-21 post-retest security review handoff documenting Bug Hunter retest security triage, no new direct Critical/High security exposure found, remaining staging/production blockers, availability/admin privacy retest requirements, secret/payment/compliance checks, and affected-agent follow-up.
- Added Bug Hunter's 2026-06-21 Ready-for-Retest verification handoff documenting Vercel access/staging blockers, local generated-preview regression checks, resolved logo and dotfile hygiene findings, partially resolved admin-route/404 findings, and NO-GO launch recommendation.
- Added Scribe's 2026-06-21 QA fix-cycle consolidation handoff for Bug Hunter and Shield, summarizing completed fixes, Ready for Retest items, still-open blockers, and affected-agent follow-up.
- Added Cold Copy's 2026-06-21 copy/CTA QA recheck handoff documenting that no current numbered QA bug is Cold Copy-owned, public copy remains Ready for Retest, and Bug Hunter should retest client-facing wording on staging.
- Added Access's 2026-06-21 accessibility QA recheck handoff documenting the Access-owned logo alt-text verification, form-label/button/link/focus/heading review, and Bug Hunter retest notes.
- Added Style Guide's 2026-06-21 logo accessibility handoff documenting the non-public admin/auth/client-portal logo semantics decision and retest notes.
- Added Pixel Frost's 2026-06-14 public UI QA recheck handoff documenting refreshed logo, 404, nav/footer, mobile menu, responsive, and rendered Browser verification.
- Added Mission Control's 2026-06-13 admin QA recheck handoff documenting Ready for Retest status, clean admin-route verification, protected-shell/no-private-data behavior, booking inquiry display coverage, responsive login-shell checks, and affected-agent retest notes.
- Added Booker's 2026-06-13 QA booking-flow recheck handoff documenting the no-new-code decision, Ready for Retest status, required booking fields, availability checker copy/continuation behavior, mobile source review, and affected-agent retest notes.
- Added Sync's 2026-06-13 calendar/availability QA recheck handoff documenting the no-new-code decision, Ready for Retest status, availability status rules, conflict detection rules, public/private calendar data boundary, block behavior, and Google Calendar sync deferral.
- Added Stack Mason's 2026-06-13 backend/API QA recheck handoff documenting the no-new-code decision, existing API error sanitization, public availability privacy boundaries, service-role client scan, and affected-agent retest notes.
- Added Gatekeeper's 2026-06-13 QA auth recheck handoff documenting the protected admin route retest evidence, auth callback/method documentation check, service-role exposure scan, and remaining approved-access blockers.
- Added Launchpad's 2026-06-13 QA deployment recheck handoff documenting the reviewed Launchpad-owned QA items, Vercel/staging blockers, env-file hygiene, rollback/hotfix confirmation, and remaining owner-access follow-up.
- Added Shield's 2026-06-13 QA security retest handoff documenting the updated security/privacy/compliance triage of Bug Hunter's QA findings and Scribe's tracker.
- Added Ledger's 2026-06-12 QA invoice/payment review handoff documenting that no current QA bug ID is Ledger-owned, Square/payment processing remains deferred, and authenticated invoice/payment retest still needs approved admin access plus safe QA records.
- Added Audit's compliance readiness tracker covering SOC 2 Type II readiness gaps, PCI-DSS alignment gaps, data handling assumptions, vendor/security assumptions, evidence needs, policy needs, and owner-agent follow-up without making official compliance claims.
- Added Audit's 2026-06-12 compliance readiness handoff for Shield, Scribe, Launchpad, Gatekeeper, Data Knox, Ledger, and Bug Hunter.
- Added Pixel Frost's 2026-06-12 public UI QA fixes handoff documenting public logo accessibility, branded 404, responsive/nav/footer checks, and affected-agent retest notes.
- Added a branded static `404.html` page with the shared public navbar, official DJ Too Kold logo, recovery links, footer, noindex meta, and booking CTA.
- Added Mission Control's 2026-06-12 admin QA review handoff documenting clean admin-route verification, protected-shell behavior, booking inquiry display coverage, empty states, responsive login-shell checks, and affected-agent retest notes.
- Added Booker's 2026-06-11 QA booking-flow review handoff documenting Ready for Retest status for booking form, availability checker UI, validation, copy, mobile UX, and booking submission behavior.
- Added Sync's 2026-06-08 calendar/availability QA handoff documenting Ready for Retest status, public-safe availability response rules, conflict detection rules, all-day/hold/booked/unavailable behavior, and Google Calendar sync deferral.
- Added Stack Mason's 2026-06-08 backend/API QA handoff documenting public API error-detail hardening, availability privacy review, no-service-role-client exposure check, and affected-agent retest notes.
- Added Data Knox's 2026-06-08 QA schema/RLS review handoff documenting the database-owned QA findings review, schema/RLS confirmation, no-card-data verification, no-migration decision, and affected-agent retest notes.
- Added Gatekeeper's 2026-06-08 QA auth handoff documenting the admin clean-route redirect fix, protected-preview access posture, auth-method documentation check, callback-path check, secret-boundary check, and affected-agent retest notes.
- Added Launchpad's 2026-06-08 QA deployment fixes handoff documenting protected-preview access policy, staging-preview requirements, env-file hygiene, dotfile deploy-output cleanup, and remaining owner/agent follow-up.
- Added Shield's 2026-06-08 QA security triage handoff documenting security/privacy/compliance review of Bug Hunter's QA findings and Scribe's bug tracker.
- Added `docs/qa/bug-tracker.md` to organize Bug Hunter's first 2026-06-08 preview/staging QA pass by severity, status, owner agent, next action, and retest requirement.
- Added Bug Hunter's 2026-06-08 preview/staging QA review handoff documenting the protected Vercel preview access blocker, missing confirmed staging branch deployment, local generated-preview regression results, admin clean-route redirect issue, logo alt-text acceptance mismatch, missing branded 404, and launch readiness recommendation.
- Added Launchpad's dev/staging/production operational setup handoff documenting Vercel branch mapping, Supabase environment recommendations, env variable rules, release gates, rollback, hotfix, and affected-agent follow-up.
- Added `docs/release-checklist.md` for feature, pre-staging, pre-production, production, and post-deployment checks.
- Added `docs/rollback-plan.md` for Vercel rollback, Git revert, Supabase Edge Function rollback, database rollback caution, hotfix flow, and rollback handoff requirements.
- Added `docs/environments.md` as the official dev, staging, and production environment strategy for Project Neo.
- Added Neo Prime's environment strategy handoff for Launchpad, Scribe, Shield, Bug Hunter, Data Knox, Stack Mason, Pixel Frost, Mission Control, and feature agents.
- Added Neo Prime's 2026-06-06 launch-readiness status refresh handoff documenting that GO is still blocked until all critical blockers pass or receive explicit owner-approved deferrals.
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
- Updated public booking submission handling to carry optional Event Prep source details into existing booking inquiry `additional_notes`/`message` review text without adding schema, collecting card data, activating Square, or guaranteeing availability.
- Updated Event Prep Checklist, admin dashboard, QA tracker, and agent status documentation with Mission Control's 2026-06-24 admin UI implementation, protected-route verification, and Stack Mason persistence follow-up.
- Updated QA/status documentation with Data Knox's Event Prep Checklist schema support, including the private/admin-only data boundary, safe payment/contract status snapshots, and downstream Mission Control/Stack Mason/Booker/Sync/Shield/Bug Hunter/Scribe follow-up.
- Updated the QA tracker and agent status with Data Knox's 2026-06-24 post-retest schema/RLS recheck: no numbered QA bug is Data Knox-owned, no SQL migration was required, and Data Knox schema verification remains Ready for Retest pending approved staging access and official staging deployment evidence.
- Updated the Roadmap product scope to classify Event Prep Checklist as a Phase 2 admin-only operational follow-through feature unless Neo Prime and the owner approve adding it to the current launch scope.
- Clarified Roadmap's product decision that Project Neo should prioritize the visitor-to-booking-to-admin-review money path for Phase 1, keep Square/payment automation and full client portal launch deferred, and avoid official launch or compliance claims without owner approval and required QA/security/deployment evidence.
- Recorded Launchpad's 2026-06-22 promotion readiness decision in deployment notes and release checklist: hold in protected/local preview review, do not promote to staging sign-off or production, and make the next eligible target an official protected `staging` branch Preview Deployment after access/deployment blockers close.
- Finalized QA cycle documentation after Bug Hunter's 2026-06-21 retest and Shield's 2026-06-21 post-retest review: limited protected/local preview review may continue, but Project Neo is not staging-ready or production-ready.
- Updated deployment notes with the final QA cycle deployment gate, including open staging access, official staging preview, branded 404 fallback, deployed privacy/security retest, and authenticated-session blockers.
- Updated `docs/qa/bug-tracker.md` and `docs/agent-status.md` with Shield's 2026-06-21 post-retest security review: Shield review is complete, no new direct Critical/High security exposure was found, and staging/production remain blocked pending approved staging access, official staging deployment evidence, deployed admin/private-data checks, deployed availability privacy checks, and authenticated-session evidence or owner-approved deferrals.
- Updated `docs/qa/bug-tracker.md` with Bug Hunter's 2026-06-21 retest results: `BH-QA-20260608-01` and `BH-QA-20260608-02` are Still Open, `BH-QA-20260608-03` and `BH-QA-20260608-05` are Partially Resolved, and `BH-QA-20260608-04` plus `BH-QA-20260608-06` are Resolved in the verified local/generated-preview scope.
- Previously consolidated recent QA fix-cycle handoffs in `docs/qa/bug-tracker.md` and `docs/agent-status.md`, which prepared all six numbered Bug Hunter findings for the 2026-06-21 retest pass.
- Updated the QA tracker with Cold Copy's 2026-06-21 copy/CTA recheck notes, keeping public copy, booking CTA language, availability checker messaging, FAQ wording, and form/client-facing language Ready for Retest with no additional product-code change needed.
- Updated the QA tracker with Access's 2026-06-21 accessibility recheck notes, keeping `BH-QA-20260608-04` Ready for Retest with no additional product-code change needed.
- Updated non-public admin, auth, and client-portal logo markup so the official DJ Too Kold logo uses `alt="DJ Too Kold logo"` without decorative hiding, matching the accepted public logo pattern for `BH-QA-20260608-04`.
- Updated the QA tracker with Pixel Frost's 2026-06-14 public UI recheck notes while keeping `BH-QA-20260608-04` and `BH-QA-20260608-05` Ready for Retest.
- Updated the QA tracker, admin dashboard notes, and agent status with Mission Control's 2026-06-13 recheck: `BH-QA-20260608-03` remains Ready for Retest, logged-out admin clean routes redirect to root login locally, and authenticated admin workflows remain blocked pending approved sessions and safe QA records.
- Updated the QA tracker and agent status with Sync's June 13 calendar/availability recheck: no current QA bug is owned by Sync, no availability/calendar code change was needed, and Sync-owned verification remains Ready for Retest once approved staging access exists.
- Rechecked Stack Mason-owned backend/API QA scope after Shield's retriage and updated the QA tracker plus agent status to confirm backend/API verification remains Ready for Retest, with no current Stack Mason-owned bug ID and no new backend code change required.
- Rechecked Gatekeeper-owned QA auth findings and updated the QA tracker, auth notes, and agent status to confirm `BH-QA-20260608-03` remains Ready for Retest with local clean admin-route redirects verified and no new auth-code change required.
- Rechecked Launchpad-owned QA deployment items and updated deployment notes, environment strategy, release checklist, rollback plan, and QA tracker notes for the current 2026-06-13 staging-access posture.
- Updated `docs/qa/bug-tracker.md` with Shield's 2026-06-13 retest notes, confirming no new Critical/High security exposure while keeping staging and production blocked until official staging retests pass.
- Reviewed the QA tracker and Bug Hunter handoff for Concierge-owned client portal scope; documented that no current bug ID is assigned to Concierge and that authenticated portal retest remains blocked pending approved client access.
- Updated the QA tracker and agent status with Ledger's invoice/payment QA review: no Ledger-owned bug status changed, no code fix was needed, and invoice/payment success-path QA remains pending access and safe-record prerequisites.
- Updated Cold Copy public-site wording across Home, About, Services, Booking, FAQ, and form/availability states to sharpen DJ Too Kold brand voice, use safer availability-review language, and keep payment/Square features deferred.
- Improved Access-owned accessibility behavior by programmatically connecting public booking/contact validation errors to their fields, focusing the first invalid field on failed submits, and restoring a visible keyboard focus indicator for Mission Control selectable table rows.
- Updated public header/footer logo markup on Home, About, Services, Booking, Contact, Gallery, Mixes, Events, FAQ, and 404 pages so the official logo keeps its original asset and exposes `alt="DJ Too Kold logo"` without decorative hiding.
- Updated deploy validation and the QA tracker for Pixel Frost-owned public UI findings: `BH-QA-20260608-04` and `BH-QA-20260608-05` are Ready for Retest in the public website scope.
- Updated the QA tracker and admin dashboard notes with Mission Control's Ready for Retest verification for `BH-QA-20260608-03`: local generated `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirects now land on root admin login without private data exposure.
- Updated the QA tracker and agent status with Booker's booking-flow review: no current QA bug is owned by Booker, no product code change was needed, and Booker-owned booking verification is Ready for Retest once approved staging access exists.
- Updated the QA tracker and agent status with Sync's calendar/availability review: no current QA bug is owned by Sync, no Google Calendar sync was implemented, and Sync-owned availability verification is Ready for Retest once approved staging access exists.
- Hardened `project-neo-api` error responses so server-side 5xx `ApiError.details` are suppressed while safe 4xx validation details remain available for UI feedback.
- Updated backend/API notes and the QA tracker with Stack Mason's Ready for Retest backend/API verification status and retest expectations.
- Updated the QA tracker and agent status with Data Knox's schema/RLS review: no current QA bug is owned by Data Knox, no SQL migration was needed, and Data Knox-owned schema verification is Ready for Retest once approved staging access exists.
- Fixed logged-out clean admin dashboard redirects so `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` use root-relative `/admin-login.html` instead of a nested relative login path.
- Updated the QA bug tracker to move Gatekeeper-owned `BH-QA-20260608-03` to Ready for Retest and to document Gatekeeper's protected-preview access review for `BH-QA-20260608-01`.
- Updated Launchpad-owned QA tracker items for protected-preview access, official staging-preview documentation, and dotfile deploy-output hygiene with Ready for Retest notes where Launchpad deployment/config work is complete.
- Updated deployment notes, environment strategy, and release checklist with the protected preview/staging QA access policy, official `staging` branch preview requirement, and no-bypass-credentials documentation rule.
- Updated the static build asset copy routine to skip dotfiles so local deploy output excludes `.DS_Store` and other dotfile metadata.
- Added Shield security triage notes to `docs/qa/bug-tracker.md`, confirming no Critical security/privacy exposure from the reviewed QA evidence while keeping protected-preview access and missing staging deployment as staging/production blockers.
- Updated `docs/agent-status.md` with Scribe's QA tracking rollup and current QA status: first preview/staging QA pass completed, two High severity staging blockers open, and no new bugs marked resolved.
- Operationalized Neo Prime's environment strategy for Launchpad ownership by expanding `docs/environments.md`, `README.md`, `docs/deployment-notes.md`, and `.env.example` with exact Vercel setup, branch-to-environment mapping, Supabase environment recommendations, placeholder-only env vars, and deferred Square placeholders.
- Removed checked-in production public runtime values from `vercel.json` so Vercel dev/staging/feature previews must use scoped environment configuration instead of inheriting production API/Supabase targets.
- Added explicit GitHub branch protection expectations to the environment strategy and release checklist.
- Updated `AGENTS.md`, `README.md`, `docs/PROJECT_NEO_DEPLOYMENT.md`, `docs/deployment-notes.md`, `docs/agent-status.md`, `docs/agent-handoffs/HANDOFF_TEMPLATE.md`, and `VERSION.md` with the official `feature/* -> dev -> staging -> main` release flow.
- Expanded the handoff template to include related branch, architecture/structure changes, new conventions, and affected modules.
- Reaffirmed the 2026-06-06 launch tracker, deployment notes, release notes, and agent status decision: Project Neo remains NO-GO for official launch because no additional critical blocker passed in this documentation pass.
- Corrected the Launchpad/Bug Hunter final regression target in agent status to the current production deployment `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`.
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
- Added admin-only RLS recommendations and policies for Event Prep Checklist tables; no anonymous/client-facing table access, no raw payment card data columns, and no Square integration were added.
- Reconfirmed from the reviewed migrations that no cardholder data, CVV/CVC, card number, PAN, card expiration, or raw payment credential columns exist, and that `availability_blocks` remains admin-only at the table/RLS layer with no anonymous grant.
- Suppressed raw server/database error details from 5xx API responses to reduce the chance of exposing internals, secrets, or private records to public callers.
- Confirmed from the reviewed migrations that Project Neo has no cardholder data, CVV/CVC, card number, PAN, card expiration, or raw payment credential columns, and that `availability_blocks` remains admin-only at the table/RLS layer.
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
