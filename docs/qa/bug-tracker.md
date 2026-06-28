# Project Neo QA Bug Tracker

Last updated: 2026-06-22

Maintainer: Scribe

Source QA handoff: `docs/agent-handoffs/2026-06-08-bug-hunter-qa-review.md`

Current QA decision: Bug Hunter completed the 2026-06-21 Ready for Retest pass and Shield completed the 2026-06-21 post-retest security review. The site is preview-reviewable only in protected/local scopes; it is not staging-ready and not production-ready. The two High severity deployment/release blockers remain Still Open, `BH-QA-20260608-03` and `BH-QA-20260608-05` are Partially Resolved, and `BH-QA-20260608-04` plus `BH-QA-20260608-06` are Resolved in the verified local/generated-preview scope. Staging sign-off, production readiness, and public launch remain blocked until the approved staging access path, official `staging` branch preview URL/deployment ID, deployed admin/private-data retest, deployed availability privacy retest, and deployed 404 fallback are complete.

## Final QA Cycle Summary - 2026-06-22

Scribe reviewed Bug Hunter's 2026-06-21 retest handoff and Shield's 2026-06-21 post-retest security review.

Readiness state:
- Preview-ready: limited protected/local preview review may continue. The currently reviewed non-production deployment remains protected and is not confirmed as official staging.
- Staging-ready: no. Staging sign-off is blocked by missing approved controlled access and missing official `staging` branch preview URL/deployment ID.
- Production-ready: no. Production readiness is blocked until staging blockers close, deployed privacy/security checks pass, authenticated success paths are verified or owner-deferred, and Shield/Bug Hunter clear final evidence.

Final numbered bug status:
- Still Open: `BH-QA-20260608-01`, `BH-QA-20260608-02`.
- Partially Resolved: `BH-QA-20260608-03`, `BH-QA-20260608-05`.
- Resolved: `BH-QA-20260608-04`, `BH-QA-20260608-06`.
- Deferred: none.

Remaining open issues:
- Approved controlled preview/staging access for Bug Hunter and Shield is still missing.
- Official READY `staging` branch preview URL and deployment ID are still missing or unrecorded.
- Deployed staging verification is still required for admin route redirects, private-data boundaries, public availability response privacy, public form/API response privacy, noindex/private-route behavior, and absence of secrets/private records.
- Unknown-route branded 404 behavior is not confirmed on Vercel; direct `404.html` passes locally, but reviewed unknown routes returned plain `NOT_FOUND`.
- Authenticated admin/client, invoice/payment, and client portal success paths still require approved sessions and safe QA records or explicit owner-approved deferrals.

Do not call Project Neo officially launched, `v1.0.0`, staging-ready, or production-ready from this QA cycle.

## Bug Hunter Ready-for-Retest Verification - 2026-06-21

Bug Hunter retested all six numbered Ready for Retest findings without implementing product fixes. Retest evidence combined Vercel deployment metadata, Vercel protected-preview fetches, a rebuilt local generated preview, desktop/mobile Browser checks, validation interactions, media loading checks, and deploy-output hygiene checks.

Environment and commands:
- Branch: `codex-project-neo-deployment-workflow`
- Latest READY non-production Vercel deployment reviewed: `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2`
- Latest READY non-production URL reviewed: `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app`
- Local preview URL: `http://127.0.0.1:4174`
- Commands run: `npm run build`, `npm run validate`, `find assets -name '.*' -print`, `find dist -name '.*' -print`, `node --check scripts/build-site.mjs`

Retest results:

| Bug ID | Bug Hunter Retest Status | Evidence | Remaining Owner / Follow-Up |
| --- | --- | --- | --- |
| `BH-QA-20260608-01` | Still Open | Vercel fetch for `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/booking` still returns `401 Unauthorized` / Vercel Authentication Required. Bug Hunter did not request or create a bypass link. | Launchpad + Gatekeeper + Owner must provide approved controlled QA access. |
| `BH-QA-20260608-02` | Still Open | Vercel deployment metadata still does not show an official READY `staging` branch deployment. Latest READY non-production deployment remains from `codex-project-neo-deployment-workflow`, not `staging`. | Launchpad + Scribe + Neo Prime must create or identify and record the official staging preview URL/deployment ID. |
| `BH-QA-20260608-03` | Partially Resolved | Local generated preview verified `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to `/admin-login.html?returnTo=admin-dashboard.html`, render the login shell, expose no private admin tables/terms, and show no console errors or mobile overflow. | Launchpad + Gatekeeper + Mission Control must still support deployed official-staging retest after access exists. |
| `BH-QA-20260608-04` | Resolved | Desktop and 390px mobile rendered checks verified public, admin, auth, and client-portal logo images load with `alt="DJ Too Kold logo"`, no `.brand-mark` logo wrapper uses `aria-hidden="true"`, and no logo-related overflow or console errors appeared. | Access / Style Guide can do optional screen-reader confirmation; no Bug Hunter blocker remains for this bug. |
| `BH-QA-20260608-05` | Partially Resolved | Local direct `404.html` renders the branded DJ Too Kold 404 with logo, public nav/footer, recovery links, noindex meta, and no desktop/mobile overflow. However `/definitely-not-found` on the local Python preview still shows the default server 404, and the reviewed Vercel preview unknown route returns plain `NOT_FOUND` instead of the branded page. | Pixel Frost + Launchpad must ensure unknown routes on the official Vercel staging preview serve the branded 404. |
| `BH-QA-20260608-06` | Resolved | `assets/.DS_Store` still exists as a source dotfile input; after `npm run build`, `find dist -name '.*' -print` returned no dotfiles. `npm run validate` passed. | Launchpad + Shield can treat local deploy-output dotfile hygiene as verified. |

Regression checks performed:
- Desktop local route matrix passed for Home, About, Services, Booking, Contact, Gallery, Mixes, Events, FAQ, `404.html`, admin login, client portal, signup, forgot password, reset password, and auth callback.
- Mobile 390px route matrix passed for Home, Booking, Contact, Gallery, Mixes, Events, FAQ, `404.html`, admin login, and client portal with no horizontal overflow.
- Mobile menu interaction passed: `Open menu` changed `aria-expanded` to `true`, exposed the expected public links, avoided client portal advertising, and closed back to `false` without overflow.
- Booking validation passed locally: missing availability-checker fields showed field-specific errors and focus; overnight `22:00` to `02:00` did not trigger the old end-time-after-start-time rejection; empty inquiry submission showed required-field errors.
- Contact validation passed locally: empty submit showed required-field errors, focused the first invalid field, and did not attempt a write.
- Gallery media passed after lazy-load scroll and direct asset verification; the initially incomplete thumbnail loaded at `458x520`.

New regressions:
- No new Critical or High product-code regressions were found in the local generated preview.
- Deployed unknown-route fallback remains incomplete for `BH-QA-20260608-05` and must not be treated as launch-ready.

Launch readiness recommendation: NO-GO. Project Neo must not be marked staging-ready or production-ready while the High severity staging access and official staging deployment issues remain Still Open. Shield's post-retest review is complete, but deployed staging privacy/security verification is still blocked by those access/deployment gaps.

## Shield Post-Retest Security Review - 2026-06-21

Shield reviewed Bug Hunter's 2026-06-21 retest results, the latest QA tracker updates, recent owner-agent fix handoffs, and the security-sensitive implementation boundaries for admin/auth, Supabase access, public availability, secrets, payments, noindex behavior, and compliance wording.

- Post-retest security summary: no new Critical or High direct security/privacy exposure was identified in the reviewed local/generated-preview evidence, source checks, tracker notes, or handoffs.
- Remaining release blockers: `BH-QA-20260608-01` and `BH-QA-20260608-02` remain High staging/production blockers because deployed QA still lacks an approved controlled access path and an official `staging` branch preview URL/deployment ID.
- Admin/private areas: local logged-out admin clean-route retest remains privacy-positive, with no private admin shell, tables, client records, event details, invoice/payment data, or internal notes exposed. Official deployed staging verification and authenticated admin success-path QA are still required before staging or production sign-off.
- Availability checker privacy: reviewed source and owner notes keep public availability responses to safe `status`, `message`, and `checked_at` fields. The public checker does not serialize client names, venue names, private event details, internal notes, raw block reasons, calendar sync IDs, invoice/payment data, or private metadata in the reviewed code. Deployed response-level confirmation remains blocked until approved staging access exists.
- Secrets handling: focused scans found no obvious live Supabase service-role key, Square credential, API token, bypass token, password, private key, or private credential in the reviewed tracker, handoffs, and client-relevant source. Matches were placeholders, variable names, warnings, or normal password form fields.
- Service-role boundary: browser/static auth code uses the Supabase publishable/anon key only. `SUPABASE_SERVICE_ROLE_KEY` remains server-side in the Supabase Edge Function code path and must not be added to Vercel/static browser config.
- Payments/PCI: Square/payment processing remains deferred and no live Square, Stripe, webhook, or card-processing flow was activated. Existing API validation rejects submitted card-number/CVV-style fields and invoice/payment records remain tracking-only.
- Compliance wording: reviewed wording remains SOC 2 Type II-ready and PCI-DSS-aligned as goals only. No official SOC 2 Type II compliance or PCI-DSS compliance claim should be made.
- Noindex/crawl posture: admin, auth, and client-portal pages include noindex/noindex-nofollow handling in source/Vercel config. Bug Hunter still needs deployed staging confirmation after official access exists.
- `BH-QA-20260608-05` note: the unknown-route branded 404 fallback remains a launch/retest blocker, but Shield does not currently classify it as a private-data exposure.

Shield launch recommendation: NO-GO for staging sign-off, production readiness, and public launch until the High staging access/deployment blockers are closed and deployed privacy/admin/API checks pass.

Required before staging:
- Launchpad/Gatekeeper/Owner must provide Bug Hunter and Shield approved controlled staging/preview access without documenting bypass credentials or private access material.
- Launchpad/Scribe/Neo Prime must record the official `staging` branch preview URL and deployment ID.
- Bug Hunter and Shield must retest deployed admin redirects, private-data boundaries, public availability response privacy, public form/API response privacy, noindex/private-route behavior, and absence of secrets/private records.

Required before production:
- All staging blockers must pass or receive explicit owner-approved deferrals.
- Authenticated admin/client success paths need approved sessions and safe QA records, or a documented owner-approved launch deferral.
- Square/payment processing must remain deferred unless Ledger, Shield, Launchpad, Stack Mason, Bug Hunter, and Audit complete a separate provider security review.

## Data Knox Post-Retest Schema/RLS Recheck - 2026-06-24

Data Knox reviewed the current QA tracker, Bug Hunter's 2026-06-21 Ready-for-Retest verification, Shield's 2026-06-21 post-retest security review, and the Project Neo Supabase migrations for database, schema, migration, RLS, and data-model issues.

- Status: Ready for Retest for Data Knox-owned schema verification. No current numbered `BH-QA-20260608-*` item lists Data Knox as an owner, so no individual bug ID status was changed.
- No SQL migration was needed. Existing migrations already cover booking inquiries, contact messages, clients, events, venues, invoices, invoice items, payments, media, mixes, auth-linked users, availability blocks, indexes, RLS, and grant hardening.
- Booking, availability, event, client, and admin data structures remain clear: `booking_inquiries`, `availability_blocks`, `events`, `clients`, and `users` have UUID keys, timestamps, statuses, relationships, and lookup/conflict indexes.
- No cardholder data fields were added. No CVV/CVC, card number, PAN, card expiration, or raw payment credential columns were found in the reviewed migrations.
- Invoice/payment tables remain payment-tracking only: hosted payment URLs, provider names, provider references, statuses, amounts, payment dates, and paid/refunded timestamps.
- Availability checker tables do not expose private event details publicly at the database access layer: `availability_blocks` has no anonymous grant, uses admin-only RLS through `private.is_project_neo_admin()`, and separates private `internal_notes` from intended public-safe `public_message`.
- RLS recommendations remain documented: keep `anon` limited to public catalog/media reads and booking/contact inserts; keep clients, events, invoices, payments, contracts, event notes, tasks, and availability blocks behind admin or portal-scoped policies; keep security-definer helpers in the private schema.
- Deployed response-level privacy still requires Bug Hunter and Shield retest after approved staging access exists because table-level RLS does not prove Edge Function serialization behavior.

## Data Knox Event Prep Checklist Schema - 2026-06-24

Data Knox added database support for the admin-private Event Prep Checklist feature. This is schema/data-model support only; no frontend, admin dashboard, API, Square, or payment-provider integration was implemented.

- Status: Ready for downstream implementation. This feature work does not change the current numbered `BH-QA-20260608-*` bug statuses.
- Migration file: `supabase/migrations/20260624000000_project_neo_event_prep_checklists.sql`.
- Tables created: `event_prep_checklists`, `event_prep_default_items`, `event_prep_items`, `event_gear_items`, `event_timeline_items`, and `event_music_notes`.
- Relationships: prep checklists belong to `events`; prep items belong to checklists; gear, timeline, and music-note records belong to events and optionally to matching event checklists; completion/admin ownership references use `users`.
- Indexes: event/status/confirmation lookups, active default-item ordering, checklist section ordering, open-item due dates, completed-by lookup, gear status lookup, timeline ordering, and music-note event lookup.
- RLS/security: all new event prep tables have RLS enabled, no anonymous table access, and authenticated access only through Project Neo admin policies using `private.is_project_neo_admin()`.
- Payment/compliance: no cardholder data, CVV/CVC, PAN, raw cardholder data, raw payment credentials, or Square fields were added. Deposit, balance, and contract values are safe status snapshots for prep review only.
- Privacy: event prep data, internal notes, gear notes, timeline notes, and music notes are private/admin-only unless a future migration explicitly creates a client-safe surface.
- Retest needed: after Stack Mason and Mission Control wire protected APIs/admin UI, Bug Hunter and Shield should verify admin-only access, RLS behavior, no public exposure of prep details, and no raw payment-card fields.

## Mission Control Event Prep Checklist UI - 2026-06-24

Mission Control added the first admin-only Event Prep Checklist UI inside the protected admin dashboard. This feature work does not change the current numbered `BH-QA-20260608-*` bug statuses.

- Status: Ready for feature QA once approved admin access and safe event records exist.
- Admin pages changed: `admin-dashboard.html` adds an Event Prep nav item and protected Event Prep section.
- Event detail views now include an `Open Prep Checklist` action that selects the event in the Event Prep workspace.
- Checklist sections: Event Overview, Client Contact, Venue & Load-In, Timeline, Music Preferences, Must-Play / Do-Not-Play, Gear Loadout, Mic & Announcements, Payment / Balance, Contract, Final Confirmation, and Internal Notes.
- Progress display: percentage complete, completed item count, required items remaining, and overall status badge.
- Data visibility: the UI reads protected admin event/client/venue/invoice/payment/conflict data and future event-prep API payloads when available.
- Persistence note: completion toggles are private local browser overrides until Stack Mason implements protected admin event-prep APIs.
- Empty states: missing event prep, contact, venue/load-in, timeline, music, gear, payment, contract, final confirmation, and internal-note data show clear admin-only empty states.
- Security note: logged-out generated-preview Browser checks confirmed `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to root admin login, no Event Prep text is visible, no admin tables render, and desktop/tablet/mobile checks show no horizontal overflow.
- Retest needed: Bug Hunter and Shield should retest the protected Event Prep UI with an approved admin session and safe event records after Stack Mason wires persistence APIs.

## Scribe Fix-Cycle Consolidation - 2026-06-21

Scribe reviewed the recent QA fix-cycle handoffs in `docs/agent-handoffs/`, including Launchpad, Gatekeeper, Stack Mason, Data Knox, Sync, Booker, Mission Control, Concierge, Ledger, Audit, Pixel Frost, Shield, Access, Style Guide, Cold Copy, and prior Scribe/Bug Hunter notes.

Fixes and reviews now ready for Bug Hunter retest:
- `BH-QA-20260608-01`: Preview/staging access policy and documentation are updated, but the actual approved access grant is still required from Owner/Gatekeeper/Launchpad before deployed QA can run.
- `BH-QA-20260608-02`: Staging branch policy is documented, but the official `staging` branch preview URL/deployment ID still needs to be created or identified and recorded before staging-gate QA can pass.
- `BH-QA-20260608-03`: Gatekeeper and Mission Control report local clean admin-route redirects now land on root admin login without nested 404 behavior or private data exposure.
- `BH-QA-20260608-04`: Pixel Frost, Style Guide, and Access report the official logo accessibility pattern is applied across public, admin, auth, and client-portal shells and remains ready for rendered retest.
- `BH-QA-20260608-05`: Pixel Frost added and rechecked a branded static `404.html`; Launchpad still needs Vercel unknown-route fallback verification on the official staging preview.
- `BH-QA-20260608-06`: Launchpad reports the static build copy routine skips dotfiles; Bug Hunter should verify `npm run build` output contains no dotfiles.

Still open before staging sign-off:
- Bug Hunter needs approved access to a protected preview/staging deployment.
- The official `staging` branch preview URL and deployment ID must be recorded.
- Bug Hunter must retest every numbered finding in the intended deployed environment.
- Shield's post-retest review is complete, but Shield must still receive deployed official-staging evidence for access posture, private-data boundaries, public availability privacy, noindex/private-route behavior, and no exposed secrets/private records.
- Authenticated admin/client success paths remain outside this tracker until approved sessions and safe QA records exist.

At the time of this Scribe consolidation, no bug was marked Resolved. Bug Hunter's later 2026-06-21 retest table above is now authoritative for current statuses.

## Shield Security Retriage - 2026-06-13

Shield re-reviewed this tracker, the latest Bug Hunter handoff, and the security-sensitive owner updates added since the 2026-06-08 Shield triage.

- No new Critical or High security/privacy exposure was identified in the updated QA evidence.
- The two High findings remain staging and production blockers because Bug Hunter still needs an approved access path and an official `staging` branch preview to complete deployed regression. `Ready for Retest` does not mean passed.
- Security-positive updates are ready for Bug Hunter retest: server-side 5xx API details are suppressed, admin clean-route redirects now use root login locally, public availability serialization is documented as safe, availability RLS assumptions were reviewed, and local dotfile deploy-output hygiene was fixed.
- Admin route protection is improved locally, but authenticated admin success paths and deployed clean-route behavior remain unverified until approved staging access and approved owner/admin sessions exist.
- Availability checker privacy remains a required deployed retest item. Public responses must expose only safe statuses/messages and must not expose client names, venue names, private event details, internal notes, raw block reasons, calendar sync IDs, invoice/payment data, or private metadata.
- No exposed secrets, credentials, API tokens, bypass tokens, private records, or payment data were identified in the reviewed tracker and handoffs. Do not document protected-preview bypass material in repo docs.
- Square/payment processing remains deferred and was not implemented. Invoice/payment work remains tracking-only and must not store card numbers, CVV/CVC, PAN, card expiration, raw cardholder data, raw payment credentials, provider secret keys, or webhook secrets.
- SOC 2 Type II and PCI-DSS wording remains readiness/alignment only. Project Neo must not claim official SOC 2 Type II or PCI-DSS compliance without formal audit/assessment.
- Production remains NO-GO from Shield's perspective until Bug Hunter verifies the official staging preview, private-data boundaries, admin/client route protection, public availability privacy, public form/database writes, and any owner-approved deferrals.

## Gatekeeper Auth Recheck - 2026-06-13

Gatekeeper re-reviewed this tracker, Bug Hunter's latest QA handoff, Shield's 2026-06-13 retriage, the auth/admin source files, and the auth documentation for authentication, authorization, route protection, role access, callbacks, and login/admin access scope.

- No new Gatekeeper-owned product-code defect was identified in this pass.
- `BH-QA-20260608-03` remains `Ready for Retest`: local generated-preview browser verification confirmed `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to root `/admin-login.html?returnTo=admin-dashboard.html` while logged out.
- Logged-out local checks rendered the admin login shell only; the admin dashboard shell stayed hidden and no private admin tables rendered.
- `BH-QA-20260608-01` remains `Ready for Retest` as a controlled-access blocker. Bug Hunter still needs owner-approved Vercel Authentication, Trusted Sources, or equivalent protected-preview/staging access without documenting bypass credentials or private access material.
- Auth callback documentation still records `auth-callback.html` for OAuth/email confirmation/session exchange and `auth-reset-password.html` for password recovery.
- Planned auth methods remain documented as email/password, Google OAuth, Apple ID OAuth, and Supabase passkeys/WebAuthn, with passkeys as an additional method and fallback login methods preserved.
- Focused scans of browser/static auth config and generated browser files did not find service-role key exposure or obvious live secret patterns.
- Authenticated admin success-path QA remains blocked until an approved owner/admin session exists; this item must not be marked Resolved until Bug Hunter verifies the official staging/approved-session behavior.

## Stack Mason Backend/API Recheck - 2026-06-13

Stack Mason re-reviewed this tracker, Bug Hunter's latest QA handoff, Shield's 2026-06-13 security retriage, Data Knox's latest schema/RLS handoff, the backend API notes, and the `project-neo-api` Edge Function for backend/API, server-side validation, data access, error handling, secret-boundary, and availability-checking issues assigned to Stack Mason.

- Status: Ready for Retest remains active for Stack Mason-owned backend/API verification. No current bug ID lists Stack Mason as a primary owner, so no individual bug ID status was changed.
- No backend/API product-code change was needed in this pass. The existing `project-neo-api` source still suppresses server-side `ApiError.details` on 5xx responses while preserving safe 4xx validation details for useful UI feedback.
- Backend/API request and response behavior remains documented in `docs/PROJECT_NEO_BACKEND.md`, including public booking/contact payloads, safe error response shapes, `POST /availability-check`, `POST /availability/check`, and public catalog/feed routes.
- Public availability checker responses remain safe: `POST /availability-check` and `POST /availability/check` return only `status`, `message`, and `checked_at` to public callers.
- Availability checker review confirmed public responses do not serialize reason codes, event IDs, client names, venue names, event titles, block titles, raw block reasons, internal notes, invoice/payment data, calendar sync IDs, or private event metadata.
- Secret-boundary review confirmed service-role access remains server-side in the Supabase Edge Function; browser/static client code does not reference `SUPABASE_SERVICE_ROLE_KEY` or `service_role`.
- Square/payment processing remains out of scope and was not implemented.
- Retest required: after approved staging access and the official staging preview exist, Bug Hunter should retest public booking/contact writes, all four availability statuses, availability response privacy, safe validation errors, public API 5xx sanitization, unauthenticated admin/portal `401` behavior, and absence of secrets/private records in public responses.

## Sync Calendar/Availability Recheck - 2026-06-13

Sync re-reviewed this tracker, Bug Hunter's latest QA handoff, Stack Mason's 2026-06-13 backend/API recheck, Data Knox's latest schema/RLS handoff, Shield's 2026-06-13 security retriage, the backend availability notes, and the `project-neo-api` availability logic for calendar, scheduling, availability, conflict rules, event timing, and future calendar integration issues assigned to Sync.

- Status: Ready for Retest remains active for Sync-owned calendar/availability verification. No current bug ID lists Sync as a primary owner, so no individual `BH-QA-20260608-*` status was changed.
- No availability/calendar product-code change was needed in this pass.
- Availability status rules remain clear: public checker responses use only `available`, `pending`, `unavailable`, and `contact_required`.
- Conflict detection rules remain documented: confirmed event conflicts map to `unavailable`, pending/hold event conflicts map to `pending`, and overlap checks compare canonical `start_at`/`end_at` windows with legacy date/time fallback for older records.
- Public availability responses remain privacy-safe: `POST /availability-check` and `POST /availability/check` return only safe status, message, and checked timestamp, with no client names, venue names, event titles, block titles, internal notes, raw block reasons, reason codes, calendar sync IDs, invoice/payment data, or private event metadata.
- Block behavior remains documented: `booked`, `unavailable`, `personal_block`, and `travel_block` map to `unavailable`; `hold` maps to `pending`; `maintenance_day` and `setup_day` map to `contact_required`; all-day blocks apply according to their stored `start_at`/`end_at` coverage.
- Overnight behavior remains documented: the selected `event_date` is the start date, and `end_time <= start_time` means the event ends on the next calendar day.
- Google Calendar sync remains deferred. Future calendar sync should normalize provider events into `start_at`/`end_at`, keep provider sync IDs private/admin-only, and avoid publishing private calendar titles, notes, client names, venue names, or blackout reasons.
- Retest required: after approved staging access and official staging preview exist, Bug Hunter should retest all four public availability statuses, overnight windows, all-day blocks, hold blocks, booked/unavailable windows, travel blocks, setup/maintenance days, admin conflict warnings, and public response privacy.

## Booker Booking Flow Recheck - 2026-06-13

Booker reviewed this tracker, Bug Hunter's latest QA handoff, Stack Mason's 2026-06-13 backend/API recheck, Sync's 2026-06-13 calendar/availability recheck, and Data Knox's latest schema/RLS handoff for booking inquiry flow, booking form, availability checker UI, form validation, booking UX, and booking data submission issues assigned to Booker.

- Status: Ready for Retest remains active for Booker-owned booking flow verification. No current bug ID lists Booker as a primary owner, so no individual `BH-QA-20260608-*` status was changed.
- Product-code result: no booking form, availability checker UI, validation, submission, schema, API, payment, admin, or unrelated feature-code change was needed in this recheck.
- Required fields confirmed in local source: booking inquiry requires client name, email, event type, event date, city/state, and estimated guest count; phone, times, venue details, music preferences, budget, referral source, and notes remain optional or contextual.
- Availability checker required fields confirmed in local source: event date, event type, start time, and end time are required; city/state remains optional.
- Error states confirmed in local source: field-specific messages identify missing/invalid required fields, invalid email, invalid optional phone, past event date, invalid guest count, disconnected online sending, and availability-checker connection failures.
- Success state confirmed in local source: booking submission thanks the visitor, states the request was sent, and says DJ Too Kold will review and follow up soon.
- Availability language confirmed in local source: available status title is "Appears available" and result notes state the availability response is an estimate, not a confirmed booking.
- Continuation behavior confirmed in local source: valid public availability statuses can continue into the full inquiry; pending and contact-required states still allow inquiry submission. Validation failures keep the continue action hidden until required checker fields are supplied.
- Unavailable behavior confirmed in local source: unavailable status tells visitors the date is currently unavailable and invites alternate times or nearby dates.
- Mobile behavior confirmed from local source/CSS review: booking and availability sections are single-column by default, actions are full-width on small screens, and form grids expand only at wider breakpoints.
- Remaining retest requirement: Bug Hunter must verify deployed booking form validation, success/error states, availability status copy, pending/contact-required continuation, unavailable alternate-date/contact messaging, mobile booking layout, and booking/contact writes after approved staging access and the official staging preview exist.

## Cold Copy Copy/CTA Recheck - 2026-06-21

Cold Copy reviewed this tracker and Bug Hunter's latest QA handoff for website copy, CTAs, brand voice, service descriptions, booking language, FAQ wording, availability checker messaging, and client-facing language issues assigned to Cold Copy.

- Status: Ready for Retest for Cold Copy-owned public copy verification.
- No current `BH-QA-20260608-*` item lists Cold Copy as a primary owner, so no numbered bug status was changed.
- No product-code, backend, database, auth, payment, schema, deployment, layout, or unrelated feature change was made in this pass.
- Prior Cold Copy public-site copy polish remains the active copy fix for Home, About, Services, Booking, FAQ, form validation, and availability checker states.
- Booking CTA language remains review-oriented and does not imply a date is secured before admin confirmation.
- Availability checker language remains centered on `Appears available`, manual review, and estimate/not-confirmed-booking wording.
- FAQ/payment language keeps Square or other payment tools deferred unless separately confirmed.
- No official launch claim, official SOC 2 Type II compliance claim, official PCI-DSS compliance claim, guaranteed availability claim, or completed payment-processing claim was added.
- Remaining retest requirement: Bug Hunter should verify rendered public copy, booking CTAs, availability messages, FAQ payment language, and form success/error copy in the official staging preview after approved access exists.

## Access Accessibility Recheck - 2026-06-21

Access reviewed this tracker plus the latest Bug Hunter, Pixel Frost, and Style Guide handoffs for accessibility, keyboard navigation, alt text, labels, focus states, semantic HTML, contrast, and usability issues assigned to Access.

- Status: Ready for Retest remains active for Access-owned accessibility verification.
- Access-owned bug tracker item reviewed: `BH-QA-20260608-04`.
- No additional product-code change was needed in this pass. Public logo semantics were already fixed by Pixel Frost, and non-public admin/auth/client-portal logo semantics were already aligned by Style Guide on 2026-06-21.
- Source scan confirmed every current `dj-too-kold-logo.jpeg` image uses `alt="DJ Too Kold logo"`.
- Source scan confirmed no current `.brand-mark` wrapping an official logo is hidden with `aria-hidden="true"`.
- Source review confirmed booking, contact, auth, admin, and client-portal form controls have visible labels or label-wrapped controls; hidden honeypot fields remain intentionally hidden and labeled.
- Source review confirmed buttons and primary links have understandable visible names, including mobile menu controls, booking/contact actions, auth buttons, admin navigation, portal tabs, and public recovery links.
- Source/CSS review confirmed visible focus states remain in place for links, buttons, inputs, selects, textareas, summaries, public cards, portal tabs, and admin selectable table rows where possible.
- Source review confirmed heading order remains logical in the reviewed public, auth, admin, and portal pages.
- Color contrast remains readable from source/CSS review for the reviewed text/control states; final contrast and screen-reader behavior still need rendered Bug Hunter retest on the official staging preview.
- No backend, database, auth logic, payment, API, deployment, or unrelated feature code was modified by Access in this pass.

## Shield Security Triage - 2026-06-08

Shield reviewed this tracker and Bug Hunter's latest QA handoff for security, privacy, compliance, and launch-blocking risk.

- No Critical security or privacy exposure was identified from the QA evidence reviewed.
- The two High findings remain staging and production blockers because required deployed QA evidence is blocked, not because they currently expose private data.
- Do not make preview/staging public just to unblock QA unless Launchpad, Gatekeeper, Shield, and the owner explicitly approve that access posture. Prefer approved Vercel access, Trusted Sources, or another controlled access path. Do not document bypass tokens or private access credentials in this tracker.
- `BH-QA-20260608-03` remains a Medium admin-route protection issue: no private data exposure was reported, but clean admin routes must redirect to login consistently before staging sign-off.
- Availability checker privacy could not be fully verified on the protected deployed preview. Bug Hunter must retest deployed availability responses after approved staging access exists and confirm public responses expose only safe statuses/messages, not client names, venue names, private event details, or internal notes.
- No exposed secrets, credentials, API tokens, private records, or payment data were identified in the reviewed QA tracker or Bug Hunter/Scribe handoffs.
- Square/payment processing remains deferred; no active Square or live payment processing was identified in this QA evidence.
- SOC 2 Type II and PCI-DSS wording remains readiness/alignment only. Do not mark Project Neo officially SOC 2 Type II compliant or PCI-DSS compliant from these QA notes.
- Local `.DS_Store` deploy-output copying remains an informational deploy-hygiene issue. It should be fixed before broad local deploy workflows are used, but it does not change the current production/staging blocker count.

## Data Knox Schema/RLS Review - 2026-06-08

Data Knox reviewed this tracker, Bug Hunter's latest QA handoff, Shield's latest security triage, and the Project Neo Supabase migrations for database, schema, migration, RLS, and data-model issues.

- Status: Ready for Retest for Data Knox-owned schema verification. No current bug tracker item lists Data Knox as an owner agent, so no bug ID status was changed.
- No SQL migration was needed. Existing migrations already define the required booking, contact, availability, client, event, admin, invoice, payment, media, mix, and auth-linked user structures.
- Booking, availability, event, client, and admin data structures are clear in the migrations: `booking_inquiries`, `availability_blocks`, `events`, `clients`, and `users` have UUID keys, timestamps, statuses, relationships, and supporting lookup indexes.
- No cardholder data fields were added. No CVV/CVC, card number, PAN, card expiration, or raw payment credential columns were found in the reviewed migrations.
- Invoice/payment schema remains tracking-only: hosted links, provider names, provider references, statuses, amounts, payment dates, and paid/refunded timestamps.
- Availability checker table access remains private by default: `availability_blocks` has no anonymous grant in the reviewed migrations, uses admin RLS through `private.is_project_neo_admin()`, and keeps `internal_notes` separate from `public_message`.
- RLS/security recommendation: public availability responses must continue to expose only safe statuses/messages and must not serialize availability block titles, reasons, internal notes, created-by users, event titles, client names, venue names, or private event details.
- Deployed response-level privacy and public form/database writes still require Bug Hunter retest after approved staging access exists.

## Stack Mason Backend/API Review - 2026-06-08

Stack Mason reviewed this tracker, Bug Hunter's latest QA handoff, Shield's latest security triage, Data Knox's latest schema/RLS review, the Project Neo backend notes, and the `project-neo-api` Edge Function for backend/API issues assigned to Stack Mason.

- Status: Ready for Retest for Stack Mason-owned backend/API verification. No current bug ID lists Stack Mason as a primary owner, so no individual bug ID status was changed.
- Backend/API fix completed: server-side `ApiError.details` is now suppressed on 5xx responses so raw database messages, config failures, or other internal details are not returned to public callers. Safe 4xx validation details such as `field` and `allowed` remain available for useful UI feedback.
- API request/response documentation was updated in `docs/PROJECT_NEO_BACKEND.md` to clarify success/error response shapes, safe validation details, and sanitized server errors.
- Public availability checker review: `POST /availability-check` and `POST /availability/check` return only `status`, `message`, and `checked_at`; public responses do not include reason codes, event IDs, client names, venue names, block titles, block reasons, internal notes, invoice/payment data, or private event metadata.
- Public availability feed review: `GET /availability` reads only intentionally public events and returns public-safe date/time/status/label fields.
- Secret boundary review: no service role key is used in browser client code; service-role access remains server-side in the Supabase Edge Function. Existing build/validation scripts guard against assigning server-only secrets to browser config.
- Retest required: after approved staging access exists, Bug Hunter should retest public booking/contact writes, availability-check response shape, safe validation errors, unauthenticated admin/portal `401` behavior, and public API responses for absence of private details and secrets.

## Sync Calendar/Availability Review - 2026-06-08

Sync reviewed this tracker, Bug Hunter's latest QA handoff, Stack Mason's backend/API QA review, Data Knox's schema/RLS review, Shield's security triage, the backend availability notes, and the `project-neo-api` availability logic for calendar, scheduling, conflict, availability, event timing, and future calendar integration issues assigned to Sync.

- Status: Ready for Retest for Sync-owned calendar/availability verification. No current bug ID lists Sync as a primary owner, so no individual bug ID status was changed.
- No application code change was needed in this pass. Existing availability logic already maps confirmed event overlaps to `unavailable`, pending or hold event overlaps to `pending`, unavailable/booked/personal/travel blocks to `unavailable`, hold blocks to `pending`, and setup/maintenance/contact-required blocks to `contact_required`.
- Overnight behavior remains documented and in scope: the selected `event_date` is the start date, and `end_time <= start_time` means the event ends on the next calendar day.
- Conflict detection remains documented as window overlap using canonical `start_at`/`end_at` timestamps where available, with legacy event date/time fallback for older records.
- Public availability privacy review: `POST /availability-check` and `POST /availability/check` return only safe public status, message, and checked timestamp. They must not expose client names, venue names, event titles, block titles, internal notes, raw block reasons, reason codes, calendar sync IDs, invoice/payment data, or private event metadata.
- Public availability feed review: `GET /availability` returns only public-visibility events with public-safe date/time/status/label fields; private events remain blocking for availability checks but are not listed in the feed.
- All-day blocks, holds, booked times, unavailable times, travel blocks, personal blocks, setup days, and maintenance days should be retested after approved staging access exists.
- Google Calendar sync remains deferred. Future sync should use `calendar_sync_id`/provider metadata, normalize provider events into `start_at`/`end_at`, sync non-client blackout windows into `availability_blocks`, and never publish private calendar titles or notes.

## Booker Booking Flow Review - 2026-06-11

Booker reviewed this tracker, Bug Hunter's latest QA handoff, and the latest Stack Mason, Sync, and Data Knox handoffs for booking inquiry flow, booking form, availability checker UI, form validation, booking UX, and booking data submission issues assigned to Booker.

- Status: Ready for Retest for Booker-owned booking flow verification. No current bug ID lists Booker as a primary owner, so no individual bug ID status was changed.
- No booking form, availability checker UI, validation, submission, schema, API, payment, admin, or unrelated feature code change was needed in this pass.
- Required booking inquiry fields remain client name, email, event type, event date, city/state, and estimated guest count.
- Required availability checker fields remain event date, event type, start time, and end time; city/state remains optional.
- Booking form error states remain clear and field-specific for missing name, email, event type, event date, city/state, guest count, invalid email, invalid phone, past event date, and non-positive guest count.
- Booking form success state remains clear: the site tells the visitor the booking request was sent and DJ Too Kold will review the details and follow up soon.
- Availability checker language continues to use "Appears available" and estimate language; it does not guarantee booking before admin approval, deposit, and contract steps.
- `pending` and `contact_required` availability results still allow visitors to continue to the full booking inquiry form.
- `unavailable` availability results still direct visitors to contact DJ Too Kold about alternate times.
- Mobile booking experience remains covered by the existing single-column form layout at small widths, full-width booking CTA behavior, and responsive two-column form/action layout at wider breakpoints.
- Retest required: Bug Hunter should retest booking form required fields, availability checker statuses, pending/contact-required inquiry continuation, unavailable alternate-contact messaging, success/error states, mobile booking layout, and deployed booking/contact database writes after approved staging access exists.

## Mission Control Admin Dashboard Review - 2026-06-12

Mission Control reviewed this tracker plus the latest Bug Hunter, Shield, Gatekeeper, Data Knox, and Stack Mason handoffs for admin dashboard, admin display, protected admin route behavior, status tables, empty states, and internal management UI issues assigned to Mission Control.

- Status: Ready for Retest for Mission Control-owned admin dashboard verification.
- Mission Control-owned bug tracker item reviewed: `BH-QA-20260608-03`.
- No admin dashboard product-code change was needed in this pass. Gatekeeper's root-relative admin login redirect fix is present in `admin.js`, `auth-client.js`, and the generated `dist` files.
- Local generated-preview verification confirmed `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to root `/admin-login.html?returnTo=admin-dashboard.html` without nested 404 behavior.
- Logged-out admin checks confirmed the login shell renders, admin tables are not present, and the protected dashboard shell remains hidden.
- Dashboard protection remains incomplete for authenticated success-path QA until approved owner/admin sessions exist. Do not mark authenticated admin workflows Resolved until Bug Hunter retests with approved access.
- Booking inquiry display remains implemented behind auth: the table includes client/event/date/venue/availability/status columns, detail view includes `availability_status_at_submission`, `availability_checked_at`, and requested window fields, and each section has a clear empty state.
- Desktop, tablet, and mobile login-shell checks had no horizontal overflow in the local generated preview.
- No private client, event, invoice, payment, contract, availability-block internal note, or admin-only data was exposed publicly during these checks.

## Mission Control Admin Dashboard Recheck - 2026-06-13

Mission Control re-reviewed this tracker plus the latest Bug Hunter, Shield, Gatekeeper, Data Knox, and Stack Mason handoffs for admin dashboard, admin display, protected admin route behavior, status tables, empty states, and internal management UI issues assigned to Mission Control.

- Status: Ready for Retest remains active for Mission Control-owned admin dashboard verification.
- Mission Control-owned bug tracker item reviewed: `BH-QA-20260608-03`.
- No admin dashboard product-code change was needed in this pass. The current generated build still redirects clean admin dashboard routes to root admin login while logged out.
- Local generated-preview browser verification confirmed `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to `/admin-login.html?returnTo=admin-dashboard.html`.
- Logged-out checks confirmed the login shell renders, the dashboard shell remains hidden, and no booking, invoice, payment, event, client, availability block, internal note, or private record table renders publicly.
- The missing/incomplete auth configuration state remains clear on the admin login page: it displays the missing Supabase config message rather than showing dashboard data.
- Booking inquiry display remains implemented behind auth: the table includes client/event/date/venue/availability/status columns; detail view includes `availability_status_at_submission`, `availability_checked_at`, requested window, status badges, private notes, and clear empty states.
- Desktop, tablet, and mobile login-shell checks had no horizontal overflow in the local generated preview.
- `BH-QA-20260608-04` mentions admin/auth/client-portal logo semantics, but its current owner agents remain Access, Pixel Frost, and Style Guide. Mission Control did not change non-public logo semantics in this pass.
- Do not mark authenticated admin workflows Resolved until approved owner/admin sessions and safe QA records exist.

## Concierge Client Portal Review - 2026-06-12

Concierge reviewed this tracker and Bug Hunter's latest QA handoff for client portal, private-beta copy, public portal visibility, and authenticated client success-path issues assigned to Concierge.

- Status: Reviewed for Concierge-owned client portal scope. No current bug ID lists Concierge as an owner agent, so no bug status was changed.
- No client portal product-code change was needed in this pass.
- Local source verification confirmed the public website pages do not link to `client-portal.html`.
- Local direct portal verification confirmed the page remains `noindex,nofollow`, includes private-beta invitation copy, and keeps the authenticated portal shell hidden until client auth succeeds.
- `BH-QA-20260608-01` still includes the client portal route in the required deployed preview/staging retest, but the owner action remains Launchpad/Gatekeeper preview access rather than Concierge code.
- `BH-QA-20260608-04` mentions portal logo markup, but the current owner agents remain Access, Pixel Frost, and Style Guide. Concierge did not change non-public client portal logo semantics pending their acceptance decision.
- Authenticated client portal success paths remain untested until Gatekeeper provides an approved client session and safe test client data exists.
- The client portal remains hidden/private beta and is not part of official launch unless the owner explicitly approves inclusion after successful QA.
- Retest required: Bug Hunter should retest the deployed client portal private-beta shell, noindex behavior, no public data exposure before auth, and authenticated portal success paths only after approved access/session prerequisites exist.

## Ledger Invoice/Payment QA Review - 2026-06-12

Ledger reviewed this tracker and Bug Hunter's latest QA handoff for invoice, deposit, balance, payment tracking, hosted payment-link, Square/Stripe, and PCI-DSS alignment issues assigned to Ledger.

- Status: Reviewed; no Ledger-owned QA bug ID requires a fix in the current tracker.
- No current `BH-QA-20260608-*` item lists Ledger as a primary owner, so no individual bug status was changed.
- No invoice/payment product-code, schema, API, Square, Stripe, checkout, webhook, or environment-variable change was needed in this pass.
- Invoice/payment tracking remains covered by the existing schema and API assumptions: hosted links, provider names, provider references, statuses, amounts, deposits, balances, payment dates, and paid/refunded timestamps.
- No cardholder-data handling was added. Project Neo must still not store card numbers, CVV/CVC, PAN, card expiration, raw cardholder data, raw payment credentials, provider secret keys, or webhook secrets in browser-visible code, logs, docs, or database fields.
- Square/payment processing remains deferred and was not implemented.
- Authenticated invoice/payment success-path QA remains pending approved admin access and approved non-sensitive invoice/payment QA records; this is a retest prerequisite, not a current Ledger-owned bug fix.

## Status Definitions

- Open: Confirmed finding that still needs triage, clarification, or an owner decision before fix work is fully scoped.
- Ready for Fix: Confirmed finding with an assigned owner and clear next action.
- Ready for Retest: Fix is reported complete, but Bug Hunter has not verified it yet.
- Still Open: Bug Hunter retested and the required behavior still does not pass, or a required operational prerequisite is still missing.
- Partially Resolved: Bug Hunter verified some expected behavior, but at least one required environment, route, deployment behavior, or acceptance condition remains unverified or failing.
- Resolved: Bug Hunter has verified the fix.
- Regressed: Bug Hunter retested and found the behavior is worse than the prior known state or introduced a new failure in the same area.
- Deferred: Owner or Neo Prime explicitly deferred the item from the current release scope.

## Severity Summary

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 2 |
| Medium | 1 |
| Low | 2 |
| Informational | 1 |

## Critical

No critical bugs were reported in the 2026-06-08 Bug Hunter preview/staging QA handoff.

## High

### BH-QA-20260608-01: Vercel preview/staging deployment blocks Bug Hunter page-level QA

- Status: Still Open
- Owner agents: Launchpad, Gatekeeper
- Area: Deployment / Preview Access / Release QA
- Environment: Vercel Preview
- Tested URL/Page: `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/booking`
- Expected: Bug Hunter has an approved way to test preview/staging pages, forms, admin route behavior, mobile layout, assets, and console errors without testing production.
- Actual: Browser redirects to Vercel login; Vercel fetch returns `401 Unauthorized` with an Authentication Required page.
- Next fix action: Provide an approved QA access path for protected previews, such as Vercel Authentication, Trusted Sources, or another owner-approved controlled access method. Do not make preview/staging public unless Launchpad, Gatekeeper, Shield, and the owner approve that posture.
- Launchpad update 2026-06-08: Deployment notes, environment strategy, and release checklist now document the approved protected-preview QA access options and prohibit publicizing preview/staging or documenting bypass credentials. Owner/Gatekeeper still need to grant the chosen controlled access method before Bug Hunter can complete the retest.
- Launchpad recheck 2026-06-13: Status remains Ready for Retest for Launchpad-owned deployment documentation. No repo-side config change can grant Vercel access; Owner/Gatekeeper must still grant approved controlled access without documenting private access material.
- Gatekeeper update 2026-06-08: Reviewed the protected-preview access finding and confirmed no app auth-code change is required. Preview/staging should remain protected; Bug Hunter still needs an owner-approved Vercel Authentication, Trusted Sources, or equivalent controlled access grant. No bypass tokens or private access credentials were documented.
- Gatekeeper recheck 2026-06-13: No app auth-code change is required for this finding. The required action remains an owner-approved controlled access grant for Bug Hunter; do not make preview/staging public or document bypass tokens/private access material.
- Retest required: Bug Hunter reruns full deployed preview/staging regression across public pages, booking, contact, availability checker, admin login, admin dashboard route, client portal route, media loading, console errors, and mobile breakpoints.
- Bug Hunter retest 2026-06-21: Still Open. Vercel fetch for `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/booking` still returned `401 Unauthorized` / Vercel Authentication Required, so deployed page-level QA remains blocked. No bypass link or private access material was requested, generated, or documented.

### BH-QA-20260608-02: No confirmed staging-branch deployment was available for staging QA

- Status: Still Open
- Owner agents: Launchpad, Scribe, Neo Prime
- Area: Release Workflow / Staging Readiness
- Environment: Vercel deployment metadata
- Tested URL/Page: Latest READY non-production deployment `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2`
- Expected: Bug Hunter can test a stable staging Preview Deployment from the `staging` branch before production promotion.
- Actual: Latest READY non-production deployment is a protected preview from `codex-project-neo-deployment-workflow`, not a confirmed `staging` branch deployment.
- Next fix action: Create or identify the official `staging` branch preview URL, document it in deployment notes, and provide approved QA access.
- Launchpad update 2026-06-08: Deployment notes and environment docs now define `staging` as the official staging Preview branch, record that `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2` is not confirmed staging, and require the official staging deployment ID and URL to be recorded before staging sign-off. The actual `staging` branch deployment still needs to be created or identified in Vercel.
- Launchpad recheck 2026-06-13: Status remains Ready for Retest for Launchpad-owned release workflow documentation. The official `staging` branch preview URL/deployment ID is still not recorded and must be created or identified with Vercel/GitHub owner access before Bug Hunter can resolve this item.
- Retest required: Bug Hunter reruns staging regression only after a stable `staging` branch preview is available and accessible.
- Bug Hunter retest 2026-06-21: Still Open. Vercel deployment metadata still showed the latest READY non-production deployment as `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2` from `codex-project-neo-deployment-workflow`; no official READY `staging` branch deployment URL/deployment ID was found in the returned deployment list.

## Medium

### BH-QA-20260608-03: Clean admin dashboard route can redirect to nested 404 in generated local preview

- Status: Partially Resolved
- Owner agents: Gatekeeper, Mission Control, Launchpad
- Area: Admin Protection / Routing
- Environment: Local generated preview
- Tested URL/Page: `http://localhost:4174/admin-dashboard`
- Expected: Logged-out admin dashboard access redirects to the admin login page without exposing private data and without landing on a 404.
- Actual: The route lands on `http://localhost:4174/admin-dashboard/admin-login.html?returnTo=admin-dashboard.html`, which returns a default `404 File not found` response.
- Next fix action: Use root-relative login redirects for admin routes, such as `/admin-login` or `/admin-login.html`, and verify both clean and `.html` admin URLs.
- Launchpad update 2026-06-08: Retest coverage for clean admin URLs remains documented in the release/deployment workflow. The route implementation is owned by Gatekeeper and Mission Control; Launchpad did not modify app routing in this pass.
- Launchpad recheck 2026-06-13: Status remains Ready for Retest. Launchpad's remaining responsibility is deployed staging verification after the official protected `staging` preview exists.
- Gatekeeper update 2026-06-08: Updated the shared auth helper and admin fallback to use root-relative `/admin-login.html` redirects. Local generated-preview testing now sends `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` to the root login page without a nested 404 or private data exposure.
- Gatekeeper recheck 2026-06-13: Rebuilt the generated preview and verified in headless Chrome that `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to `/admin-login.html?returnTo=admin-dashboard.html`, render the login form, keep the dashboard shell hidden, and expose no private admin tables while logged out.
- Mission Control update 2026-06-12: Rebuilt `dist` and verified `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to root `/admin-login.html?returnTo=admin-dashboard.html`; no private admin shell, booking table, invoice table, payment table, or record details render while logged out. Status remains Ready for Retest pending Bug Hunter staging verification.
- Mission Control recheck 2026-06-13: Rebuilt `dist` and verified in the in-app browser that `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` redirect to `/admin-login.html?returnTo=admin-dashboard.html`; no private admin shell, booking table, invoice table, payment table, event/client data, or record details render while logged out. Desktop, tablet, and mobile login-shell checks showed no horizontal overflow. Status remains Ready for Retest pending Bug Hunter staging verification.
- Retest required: Open `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` while logged out on the official staging preview and verify all land on login without 404s or private data exposure.
- Bug Hunter retest 2026-06-21: Partially Resolved. Local generated preview verified all three logged-out admin routes redirect to `/admin-login.html?returnTo=admin-dashboard.html`, render the admin login form, keep private dashboard shells/tables/record terms hidden, and avoid console errors and mobile overflow. Official staging verification remains blocked by `BH-QA-20260608-01` and `BH-QA-20260608-02`.

## Low

### BH-QA-20260608-04: Official logo alt text does not match the QA acceptance criterion

- Status: Resolved
- Owner agents: Access, Pixel Frost, Style Guide
- Area: Accessibility / Brand
- Environment: Local generated preview
- Tested URL/Page: Header/footer brand logo on public, admin, and portal pages
- Expected: Per QA request, official logo alt text should be `DJ Too Kold logo`.
- Actual: Brand logo images render and load, but their `alt` values are empty and the containing `.brand-mark` is `aria-hidden="true"`.
- Next fix action: Bug Hunter should retest public header/footer logo markup; Access and Style Guide should decide whether to extend this same pattern to non-public admin/auth/client-portal shells.
- Pixel Frost update 2026-06-12: Public website header/footer logo markup now keeps the official `assets/images/dj-too-kold-logo.jpeg` asset, removes `aria-hidden` from public brand marks, and sets public logo image alt text to `DJ Too Kold logo`. Admin/auth/client-portal logo semantics were not changed in this public website UI pass and should remain with Access/Mission Control/Gatekeeper if QA extends beyond public pages.
- Pixel Frost recheck 2026-06-14: Rebuilt and validated the static site, confirmed public pages still use the official logo asset with `alt="DJ Too Kold logo"`, verified the logo source remains square at `711x711`, and rendered desktop/mobile public checks confirmed square `object-fit: contain` logo display with no stretching, cropping, distortion, or recoloring.
- Style Guide update 2026-06-21: Extended the accepted public logo accessibility pattern to the non-public admin, auth, and client-portal shells. `admin-login.html`, `admin-dashboard.html`, `client-portal.html`, `auth-signup.html`, `auth-forgot-password.html`, `auth-reset-password.html`, and `auth-callback.html` now expose the official logo image as `alt="DJ Too Kold logo"` and no longer hide `.brand-mark` with `aria-hidden`. Status remains Ready for Retest pending Bug Hunter verification on rendered desktop/mobile routes.
- Retest required: Inspect rendered header/footer logos on desktop and mobile after the chosen accessibility pattern is implemented.
- Clarification resolved 2026-06-21: Style Guide accepted that non-public admin/auth/client-portal shells should follow the same official-logo semantics as public pages for this QA criterion.
- Bug Hunter retest 2026-06-21: Resolved. Desktop and mobile rendered checks verified the official logo loads with `alt="DJ Too Kold logo"` across public, admin, auth, and client-portal shells. No checked `.brand-mark` logo wrapper used `aria-hidden="true"`, logo images loaded with nonzero natural dimensions, and no logo-related overflow or console errors were found.

### BH-QA-20260608-05: Missing branded 404/not-found page

- Status: Partially Resolved
- Owner agents: Pixel Frost, Launchpad
- Area: Public Website / Error State
- Environment: Local generated preview
- Tested URL/Page: `http://localhost:4174/definitely-not-found`
- Expected: A branded Project Neo / DJ Too Kold 404 page with safe navigation back to public pages.
- Actual: Default server `Error response` page appears with no branding, navbar, footer, or booking/contact recovery path.
- Next fix action: Bug Hunter should retest the branded `404.html` page locally and on the official staging preview; Launchpad should confirm Vercel unknown-route fallback behavior after deployment.
- Launchpad update 2026-06-08: Vercel retest responsibility is documented, but the branded 404 implementation is owned by Pixel Frost. Launchpad did not add frontend error-page UI in this pass.
- Launchpad recheck 2026-06-13: Status remains Ready for Retest. Launchpad's remaining responsibility is to verify Vercel unknown-route fallback behavior on the official staging preview after access exists.
- Pixel Frost update 2026-06-12: Added a branded static `404.html` with the shared public navbar, official logo, mobile menu, footer, noindex meta, recovery links to public pages, and booking CTA. Added `404.html` to deploy validation so it must keep the shared public shell.
- Pixel Frost recheck 2026-06-14: Rebuilt and validated the static site, confirmed `404.html` remains branded with shared public navbar/footer/logo, verified the 404 footer Booking link navigates to `/booking/`, and rendered desktop/mobile checks showed no horizontal overflow or console errors. Local Python preview still cannot prove Vercel unknown-route fallback behavior.
- Retest required: Open an unknown route on the official staging preview and confirm a branded 404 displays.
- Bug Hunter retest 2026-06-21: Partially Resolved. Direct local `404.html` rendered the branded DJ Too Kold recovery page with public nav/footer/logo, recovery links, noindex meta, and no desktop/mobile overflow. However local `/definitely-not-found` still showed the Python static server's default `Error response`, and the reviewed Vercel preview unknown route returned a plain `NOT_FOUND` response instead of the branded page.

## Informational

### BH-QA-20260608-06: Local build copies local `.DS_Store` metadata into `dist/assets` if present

- Status: Resolved
- Owner agents: Launchpad, Shield
- Area: Deployment Packaging / Hygiene
- Environment: Local generated preview
- Tested URL/Page: `dist/assets/.DS_Store`
- Expected: Generated deploy output excludes OS metadata and dotfiles.
- Actual: `dist/assets/.DS_Store` was generated from the local `assets/.DS_Store` file.
- Next fix action: Update the build copy routine to skip dotfiles and remove local OS metadata from asset folders.
- Launchpad update 2026-06-08: Static build asset copying now skips dotfiles, including `.DS_Store`, before writing to `dist/`.
- Launchpad recheck 2026-06-13: Status remains Ready for Retest. `npm run build` and a `dist` dotfile scan should be included in Bug Hunter retest evidence.
- Retest required: Run `npm run build` and confirm no dotfiles are present in `dist/`.
- Note: `.DS_Store` is already listed in `.gitignore`, so this may not appear in Git-based Vercel builds. It remains a local deploy hygiene risk if someone deploys from local build output.
- Bug Hunter retest 2026-06-21: Resolved. `assets/.DS_Store` was present as a source input, `npm run build` completed, and `find dist -name '.*' -print` returned no dotfiles. `npm run validate` also passed.

## Owner Action Queue

- Launchpad: Coordinate the documented protected-preview QA access path, record the official `staging` branch preview URL once created or identified, verify branded 404 routing after Pixel Frost implementation, and retest dotfile deploy-output hygiene.
- Gatekeeper: Coordinate protected preview access, provide approved owner/admin session guidance without documenting private access material, and support Bug Hunter/Mission Control retest of logged-out admin clean-route redirect behavior on official staging.
- Scribe: Keep staging URL, QA tracker, agent status, deployment notes, and changelog current as staging-gate evidence changes.
- Neo Prime: Keep launch decision at NO-GO until staging QA, protected access, critical launch blockers, and owner-approved deferrals are complete.
- Mission Control: Admin clean-route redirect behavior is Ready for Retest locally; authenticated admin workflow retest still requires approved owner/admin sessions and safe QA records. Non-public admin logo semantics remain with Access/Style Guide unless reassigned.
- Ledger: No current QA bug ID lists Ledger as an owner; support authenticated invoice/payment retest only after approved admin access and approved non-sensitive invoice/payment QA records exist.
- Concierge: No current QA bug ID lists Concierge as an owner; support client portal private-beta shell retest after approved preview/staging access exists and authenticated portal success-path retest only after approved client access and safe test data exist.
- Access / Style Guide: Non-public admin/auth/client-portal logo semantics now follow the public pattern and are Ready for Retest; Access confirmed the source-level screen-reader/accessibility pattern and Bug Hunter should verify rendered behavior during staging retest.
- Pixel Frost: Public logo accessibility and branded 404 fixes are Ready for Retest; support Bug Hunter if public-page retest finds layout or responsive regressions.
- Cold Copy: Public website copy, booking CTAs, availability checker language, FAQ wording, and form/client-facing messages are Ready for Retest; support Bug Hunter if staging retest finds copy, tone, claims, CTA, or client-facing messaging regressions.
- Shield: Post-retest review is complete for local/generated-preview evidence; re-review deployed official staging evidence after access and official staging deployment exist.
- Booker / Stack Mason / Data Knox / Sync: Booker booking-flow verification, Data Knox schema verification, Stack Mason backend/API verification, and Sync calendar/availability verification are Ready for Retest with no Booker product-code change, SQL migration, backend/API change, or Sync-owned code fix required; retest deployed booking, contact, availability checker, all-day blocks, holds, booked/unavailable times, travel/setup/maintenance blocks, overnight windows, safe validation errors, mobile booking layout, public availability response privacy, and database writes after staging access exists.
- Bug Hunter: Rerun deployed preview/staging regression after the High-severity access and staging-branch blockers are cleared.

## Retest Gate

Bug Hunter should not mark remaining Still Open or Partially Resolved bugs Resolved until fixes are deployed or otherwise available in the intended test environment and verified. Staging sign-off requires an accessible official staging preview, deployed page-level regression, public form/database verification with approved QA data, Shield review, and retest notes for each open bug above.
