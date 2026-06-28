# Project Neo Event Prep Checklist Product Brief

Last updated: 2026-06-25

Owner: Roadmap, Product Manager

Feature: Event Prep Checklist

Current version context: `v0.8.0 - First Web Preview`

Product decision: define Event Prep Checklist as a Phase 2 operational follow-through feature. It should not expand the current First Web Preview launch scope unless Neo Prime and the owner explicitly approve the schedule change.

## Feature Purpose

The Event Prep Checklist gives DJ Too Kold one private admin workspace for reviewing and completing event preparation before event day. The feature should reduce missed details for confirmed and upcoming events without turning Phase 1 into a full production-management suite.

## MVP Scope

Status: Planned after core booking/admin gates are stable.

MVP goal: let the owner/admin open an upcoming or confirmed event, review key prep details, and mark preparation items complete or incomplete.

MVP sections:
- Event basics: event name/type, date, start/end time, status, package/service, event location.
- Venue and arrival: venue name/address, load-in instructions, parking notes, setup/access notes.
- Contacts: primary client name, phone, email, and backup contact if available.
- Timeline: ceremony/program timing, DJ start/end time, key transitions, announcements timing.
- Music: music preferences, must-play songs, do-not-play songs, clean/explicit preference.
- Production needs: mic needs, announcements, gear/loadout notes.
- Money/admin readiness: deposit status, balance due, contract status, final confirmation status.
- Internal notes: private preparation notes visible only to owner/admin users.
- Checklist completion: each checklist item can be marked complete or incomplete and remains connected to the event.

MVP non-goals:
- Do not activate Square or payment processing.
- Do not create contract automation or e-signature.
- Do not launch client-facing checklist access.
- Do not add Google Calendar sync.
- Do not add staff assignment, inventory management, or route planning.
- Do not claim SOC 2 Type II or PCI-DSS compliance.

## Phase 1 vs Later

### Phase 1: Definition And Planning Only

Status: Product-defined; implementation deferred.

Phase 1 deliverables:
- Product brief, MVP scope, user stories, acceptance criteria, and handoff coverage.
- Clear split between existing event/client/booking data and manually editable prep fields.
- Privacy rule: checklist is admin-only until explicitly redesigned for client portal or staff collaboration.

Phase 1 does not include:
- New schema migrations.
- New API routes.
- New admin UI implementation.
- New payment, contract, calendar, or portal behavior.

### Phase 2: Admin MVP Implementation

Status: Mission Control added the first admin-only UI pass on 2026-06-24. Protected persistence APIs remain a Stack Mason follow-up.

Phase 2 candidate implementation:
- Add Event Prep Checklist entry point from upcoming/confirmed event rows in Mission Control.
- Add a checklist detail view or panel tied to one event.
- Persist per-event checklist item completion state.
- Show sourced event, venue, client, invoice/payment, contract, and song-request details.
- Allow owner/admin to edit prep-only notes and checklist-specific fields.
- Support desktop and tablet layouts, with usable mobile fallback.
- Include empty states for missing venue, contact, music, financial, contract, and confirmation data.

Current Mission Control UI behavior:
- Event Prep appears only inside the protected admin dashboard shell.
- Event detail panels include an `Open Prep Checklist` action.
- The Event Prep section shows progress percentage, completed item count, required items remaining, and an overall status badge.
- Sections include event overview, client contact, venue/load-in, timeline, music preferences, must-play/do-not-play, gear loadout, mic/announcements, payment/balance, contract, final confirmation, and internal notes.
- Completion toggles are available in the admin UI and are stored only as private local browser overrides until protected admin API persistence is implemented.
- Missing sourced data displays clear empty states instead of public exposure or hard failures.

### Later Ideas

Deferred until after the admin MVP proves useful:
- Checklist templates by event type.
- Due dates and reminders.
- Staff/DJ assignment and handoff mode.
- Printable or exportable prep sheet.
- Gear inventory presets.
- Route/load-in day-of timeline.
- Client portal review of selected non-private fields.
- Calendar sync or reminder automation.
- Vendor/venue contact directory.

## User Stories

### Owner/Admin: Open Prep Checklist

As the owner/admin, I want to open an event and see a prep checklist so I can prepare from one place.

Acceptance criteria:
- Checklist appears only for upcoming or confirmed/pending event records, not public pages.
- Checklist is connected to exactly one event.
- The entry point is available from an event detail view or upcoming events list.
- The view shows clear sections for venue, contacts, timeline, music, production needs, money/admin readiness, and internal notes.

### Owner/Admin: Mark Items Complete

As the owner/admin, I want to mark prep items as complete so I can track what still needs attention.

Acceptance criteria:
- Checklist items can be marked complete or incomplete.
- Completion state persists for the event.
- Completed and incomplete states are visually distinct.
- Missing sourced data can remain incomplete without blocking the whole checklist.
- The UI does not imply the event is fully ready until required prep items are complete.

### Owner/Admin: Review Venue, Load-In, And Contact Details

As the owner/admin, I want to see venue, load-in, parking, and client contact details so I have the practical arrival information ready.

Acceptance criteria:
- Venue name, venue address/location, and known event location data are shown when available.
- Load-in, parking, and setup notes are shown when available or display clear empty states.
- Primary client contact details are shown from client/event/booking data.
- Private client contact details stay behind admin authentication.

### Owner/Admin: Track Music Preferences

As the owner/admin, I want to track music preferences, must-play songs, and do-not-play songs so the event set is aligned with the client.

Acceptance criteria:
- Music preference summary is visible when sourced from the booking inquiry, event, or song request records.
- Must-play and do-not-play lists are separated.
- Clean/explicit preference is visible and treated as an important prep signal.
- Empty music sections prompt the admin to collect or add details without exposing them publicly.

### Owner/Admin: Verify Contract, Deposit, Balance, And Final Confirmation

As the owner/admin, I want to see whether the contract, deposit, balance, and final confirmation are complete so I can avoid event-day surprises.

Acceptance criteria:
- Contract status is shown if contract records exist; otherwise show `No contract recorded`.
- Deposit and balance due are sourced from invoice/payment tracking, not direct payment processing.
- Balance due is visible as an admin readiness item.
- Final confirmation status is manually trackable until a stronger confirmation workflow exists.
- The feature does not activate Square, collect card data, or claim payment automation.

### Owner/Admin: Keep Internal Notes Private

As the owner/admin, I want internal notes that clients cannot see so I can track prep details candidly.

Acceptance criteria:
- Internal notes are admin-only.
- Internal notes must not appear on public pages or client portal responses.
- Client-visible note behavior must be explicitly designed separately before any portal exposure.
- Private notes should be labeled clearly in the admin UI.

## Existing Data Sources

These fields should come from existing event/client/booking records when available:

- Event basics from `events`: event date, start/end time, status, visibility, location, venue snapshot, package/service links, confirmed/hold/pending state.
- Venue details from `venues` and event venue snapshots: venue name, address/location, and reusable venue context.
- Client contact details from `clients` and `booking_inquiries`: client name, email, phone, booking inquiry contact fields, event type, and original inquiry notes.
- Timeline notes from `booking_inquiries` or `events` when already captured; otherwise show empty state.
- Music preferences from `booking_inquiries.music_preferences` and future/available `song_requests`.
- Must-play songs from `song_requests` where the request is approved or marked must-play, if available.
- Do-not-play songs from existing notes or a future checklist/music field; do not infer from general music preferences.
- Contract status from `contracts` when present.
- Deposit and balance due from `invoices` and `payments`, using invoice/payment tracking snapshots.
- Final event status from `events.status`, with final confirmation as a separate checklist/admin readiness concept.
- Internal notes from private `event_notes` or a future checklist-specific private notes field.

## Booking Inquiry Intake Mapping

Booker's 2026-06-25 booking intake update captures optional prep source material without changing the public booking schema:

- Contact prep: `clientName`, `email`, `phone`, optional `dayOfContactName`, and optional `dayOfContactPhone`.
- Event basics: `eventType`, `eventDate`, `startTime`, `endTime`, `cityState`, `guestCount`, `indoorOutdoor`, `eventVibe`, and `crowdType`.
- Venue/load-in prep: `venueName`, `venueAddress`, `loadInNotes`, and `parkingNotes`.
- Music prep: `musicPreferences`, `mustPlaySongs`, `doNotPlaySongs`, and `cleanExplicitPreference`.
- Timeline prep: `announcementsNeeded`, `specialMoments`, `startTime`, and `endTime`.
- Gear prep: `micNeeds`, `indoorOutdoor`, `guestCount`, venue details, and load-in notes.
- Lead/admin context: `budgetRange`, `heardAbout`, `additionalNotes`, and availability snapshot fields.

Required public inquiry fields remain limited to client name, email, event type, event date, city/state, and estimated guest count. Optional prep fields should not block submission. The public route currently folds prep source material into existing booking inquiry `additional_notes`/`message` text so Mission Control can review it before future protected admin mapping into `event_prep_checklists`, `event_music_notes`, `event_timeline_items`, or related records.

## Manually Editable Checklist Data

These fields should be manually editable by owner/admin users in the checklist MVP:

- Checklist item complete/incomplete state.
- Load-in instructions.
- Parking notes.
- Setup/access notes.
- Timeline notes and announcement timing.
- Mic needs.
- Announcements.
- Gear/loadout needs.
- Clean/explicit preference when not already captured.
- Must-play songs and do-not-play songs when not provided through a structured song request flow.
- Final confirmation status.
- Internal prep notes.

Manual edits should preserve source-of-truth clarity. If a value is copied from a booking inquiry, event record, invoice, contract, or song request, the admin should be able to tell whether it is sourced data or checklist-specific prep data.

## Private/Admin-Only Data

The following must remain private/admin-only:

- Client phone numbers and private email addresses.
- Load-in, parking, setup, and access notes.
- Internal notes.
- Gear/loadout needs.
- Balance due, invoice/payment context, deposit status, and hosted payment references.
- Contract status and contract links/documents.
- Private venue details, access instructions, and security/contact notes.
- Any do-not-play, preference, or event detail marked internal.
- Checklist completion state.

No Event Prep Checklist data should be public. Client portal exposure is out of scope unless Concierge, Shield, Gatekeeper, Data Knox, and the owner define a separate client-safe subset.

## UX And Empty-State Requirements

- Desktop and tablet should be the primary admin experience.
- Mobile should remain usable for day-of reference even if the broader admin dashboard is desktop-first.
- Empty sections should name what is missing, such as `No load-in details recorded`, `No must-play songs recorded`, or `No contract recorded`.
- The checklist should avoid scary red states for normal missing prep data; reserve urgent styling for event-day-critical missing items.
- The page should show the event date/time near the top so the admin always knows which event is being prepared.

## Acceptance Criteria Summary

- Checklist appears for confirmed or upcoming events.
- Checklist items can be marked complete and incomplete.
- Checklist is connected to one event.
- Checklist does not expose private notes or prep data publicly.
- Checklist has clear sections.
- Checklist works on desktop and tablet.
- Mobile is usable for review and basic completion toggles.
- Empty states are clear.
- Feature does not activate Square/payment processing.
- Feature does not claim SOC 2 Type II or PCI-DSS compliance.
- Completion is not claimed until Bug Hunter verifies the implemented behavior and Shield verifies privacy boundaries.

## Agent Handoff Requirements

- Data Knox: validate whether checklist completion state and manually editable fields need new tables/columns or can reuse private `event_notes` plus related records.
- Mission Control: design admin event detail/checklist UI and section hierarchy.
- Booker: confirm booking inquiry source fields and how inquiry music/timeline details carry into event prep.
- Stack Mason: define protected admin API reads/writes if implementation moves forward.
- Sync: confirm checklist event timing aligns with availability/calendar rules and overnight events.
- Shield: review privacy boundaries, admin-only data, payment/contract visibility, and compliance wording.
- Bug Hunter: verify desktop/tablet/mobile behavior, private-route protection, empty states, and no public exposure.
- Scribe: keep roadmap, changelog, release notes, and handoffs consistent.
