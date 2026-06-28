# Project Neo Product Roadmap

Last updated: 2026-06-25

Owner: Roadmap, Product Manager

Current version target: `v0.8.0 - First Web Preview`

Current product decision: keep Project Neo focused on the money path: visitor to booking inquiry to admin review to quote or invoice to deposit request to confirmed event. Do not expand public or admin scope until the current preview, staging, auth, and QA gates are clean.

## Roadmap Principles

- Prioritize work that creates or protects booking revenue.
- Keep visitor-facing flows short, clear, and mobile-friendly.
- Keep admin tools practical for one owner/operator before designing for a larger team.
- Treat availability as an estimate for visitors and a conflict-prevention tool for admin.
- Keep payment collection hosted or manual until Square/payment automation is explicitly activated.
- Keep client portal, contracts, staff workflows, and company-expansion tooling out of launch scope unless the owner approves a scope change.
- Do not claim official launch, SOC 2 Type II compliance, or PCI-DSS compliance from roadmap language.

## Phase Definitions

### Phase 1: First Web Preview And Money-Path MVP

Status: In progress.

Goal: prove that the public DJ Too Kold site can generate qualified leads and that the owner can safely review and progress those leads.

In scope:
- Public DJ Too Kold website pages for Home, About, Services, Booking, Contact, Gallery, Mixes, Events, FAQ, and branded 404.
- Booking inquiry form with required contact, event, date, time, service, and message fields.
- Public availability checker with safe statuses: `available`, `pending`, `unavailable`, and `contact_required`.
- Public contact form.
- Protected owner/admin login and admin dashboard shell.
- Admin review of booking inquiries, contact messages, availability context, event conflicts, invoices/payment tracking, and operational queues.
- Manual quote/invoice/deposit workflow tracking.
- Public media and service/package catalog display.
- Basic SEO, accessibility, deployment, rollback, and QA documentation.
- Security/privacy boundaries for admin, client, event, invoice, payment, and availability data.

Out of scope for Phase 1:
- Live Square payment automation.
- Google Calendar sync.
- Full public client portal launch.
- Contract generation or e-signature.
- Multi-staff dispatching, payroll, inventory, CRM automation, email marketing, analytics dashboards, or mobile apps.
- Official SOC 2 Type II or PCI-DSS compliance claims.

Phase 1 success criteria:
- A visitor can understand the DJ offer and submit a booking inquiry from desktop and mobile.
- Availability results encourage inquiry submission without exposing private schedule details.
- Booking and contact submissions create records or use an owner-approved fallback.
- The owner/admin can sign in and review incoming leads without exposing private data publicly.
- Bug Hunter, Shield, Launchpad, and Scribe clear or explicitly document all launch-gate blockers before any official launch claim.

## Phase 2: Operational Follow-Through

Status: Planned after Phase 1 gates are stable.

Goal: make the owner workflow faster after a qualified lead arrives.

Candidate scope:
- Admin conversion of booking inquiry to client and event records.
- Admin quote/invoice draft workflow tied to booking status.
- Deposit request tracking through hosted/manual payment references.
- Improved admin search, filtering, and status history.
- Availability block management refinements.
- Event Prep Checklist for confirmed/upcoming events, covering venue, load-in, parking, contacts, timeline, music preferences, production needs, balance/contract/final confirmation, and internal prep notes.
- Owner-approved client portal private beta for selected events.
- Safer media/content management for gallery and mixes.
- Lightweight operational reporting for leads, confirmed events, open invoices, and revenue collected.

Phase 2 success criteria:
- The owner can move a lead from new inquiry to confirmed event with fewer manual cross-checks.
- Admin status labels are trustworthy and backed by saved data.
- Private beta client portal access works only for approved client users.
- Payment records remain tracking-only unless Ledger, Shield, Launchpad, and the owner activate a hosted/tokenized provider path.

## Future Ideas

Status: Deferred.

These ideas may be valuable, but they are not needed for the First Web Preview or Phase 1 launch gates:
- Square-hosted payment automation and webhook reconciliation.
- Contract templates, contract status automation, and e-signature integration.
- Google Calendar two-way sync.
- Automated email/SMS reminders.
- Client portal public launch.
- Multi-DJ/team scheduling and permissions.
- Venue/vendor CRM.
- Music request collaboration.
- Advanced reporting, forecasting, and lead-source attribution.
- Company expansion workflows for additional brands or locations.

## User Stories And Acceptance Criteria

### Visitor: Explore And Decide

User story: As a potential client, I want to quickly understand DJ Too Kold's services, vibe, and event fit so I can decide whether to submit an inquiry.

Acceptance criteria:
- Public pages present services, credibility, event types, and contact paths without requiring login.
- Primary booking CTAs are visible on relevant public pages.
- Pages render on mobile and desktop without horizontal overflow or broken primary navigation.
- Public copy does not promise unavailable features such as live online payment or full client portal access.

### Visitor: Check Availability

User story: As a potential client, I want to check whether my event date and time may be available so I can decide whether to continue with an inquiry.

Acceptance criteria:
- Checker requires date, start time, and end time before returning a result.
- Public response only shows safe status and message data.
- `pending` and `contact_required` still allow inquiry submission.
- `unavailable` encourages alternate dates or direct contact.
- No client names, venue names, private notes, exact private event details, or internal reason codes are exposed.

### Visitor: Submit Booking Inquiry

User story: As a potential client, I want to submit event details so the business can review and respond.

Acceptance criteria:
- Required fields are validated with usable error states.
- A successful inquiry stores the availability status snapshot when available.
- Success and error states remain branded and actionable.
- The form does not require payment, account creation, or contract completion in Phase 1.

### Owner/Admin: Review Leads

User story: As the owner/admin, I want to see new inquiries and availability context so I can decide whether to respond, quote, hold, or decline.

Acceptance criteria:
- Admin dashboard remains behind authenticated owner/admin access.
- New inquiries are visible with enough detail to follow up.
- Availability snapshot is clearly labeled as public estimate or not checked.
- Admin can identify obvious date/time conflicts without exposing those details publicly.
- Unauthenticated users cannot view private inquiry, client, event, invoice, payment, or admin data.

### Owner/Admin: Track Quote, Invoice, And Deposit State

User story: As the owner/admin, I want to track quote, invoice, deposit, and payment statuses so I can move bookings toward confirmation.

Acceptance criteria:
- Phase 1 supports tracking and review, not automated payment collection.
- No raw cardholder data, CVV, PAN, or payment credentials are stored.
- Hosted payment links or external references are treated as server/admin-managed data.
- Any live provider automation remains deferred until Ledger, Shield, Launchpad, and the owner explicitly activate it.

### Client: Private Portal Beta

User story: As an approved client, I may later want to view event and invoice details in a private portal.

Acceptance criteria:
- Portal remains hidden/private beta for Phase 1 unless owner changes scope.
- Public navigation does not advertise portal access as a launch feature.
- Portal records are scoped to the authenticated client's allowed records.
- Client portal success-path QA requires approved client access before completion is claimed.

## Agent Dependencies

- Neo Prime: review architecture or major product-scope changes before they reshape routing, app strategy, or release gates.
- Stack Mason: owns API behavior for booking, contact, availability, admin reads/writes, and protected route behavior.
- Data Knox: owns schema, RLS, data retention, and payment/availability data-shape impact.
- Booker: owns booking inquiry and visitor booking-flow behavior.
- Mission Control: owns admin dashboard workflow design and admin usability.
- Sync: owns availability/calendar rules and Google Calendar deferral/activation decisions.
- Ledger: owns invoice/payment tracking and any future hosted payment provider activation.
- Gatekeeper: owns auth, roles, redirects, and approved owner/client session paths.
- Shield: owns privacy, security, compliance-readiness language, and payment/secret boundaries.
- Bug Hunter: owns verification before any feature is marked complete or launch-ready.
- Launchpad: owns deployment, environment, staging, rollback, and preview/protection gates.
- Cold Copy: owns public-facing wording and CTA clarity.
- Scribe: owns roadmap/release-note continuity and documentation consistency.

## Product Decisions

- `2026-06-25`: Phase 1 remains money-path MVP, not a full business management platform.
- `2026-06-25`: Square/payment automation stays deferred until explicitly activated.
- `2026-06-25`: Client portal stays hidden/private beta until approved client access and QA exist.
- `2026-06-25`: Availability checker is public-safe estimate tooling; admin conflict detail stays private.
- `2026-06-25`: Official launch cannot be claimed from roadmap status alone; launch requires QA/security/deployment gates and owner approval.
- `2026-06-25`: Event Prep Checklist is planned as Phase 2 admin-only operational follow-through; it should not add First Web Preview launch scope unless Neo Prime and the owner approve the change.

## Open Risks And Blockers

- Approved staging access and official `staging` branch deployment evidence are still required before staging sign-off.
- Authenticated owner/admin and client session evidence is still required before private workflow completion claims.
- Deployed branded 404 fallback and deployed admin/private-data checks need Bug Hunter/Shield verification.
- Payment automation, contracts, Google Calendar sync, and full client portal launch remain deferred and should not be pulled into Phase 1 by adjacent implementation work.
