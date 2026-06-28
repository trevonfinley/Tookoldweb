# Agent Handoff - Event Prep Booking Intake

## Agent Name

Booker

## Agent Role

Booking Systems Engineer for Project Neo

## Date

2026-06-25

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Updated the public booking inquiry flow so it can collect optional source details for the Event Prep Checklist without making the main booking form too long or changing required fields. The work adds a folded optional Event Prep section to the booking form, wires those fields into API submission and direct-email fallback, and documents how the captured intake can support venue/load-in, music, timeline, gear, and contact prep.

No Square/payment processing was activated. No card numbers, CVV/CVC, PAN, raw cardholder data, provider secrets, or payment credentials were collected. No booking availability guarantee was added.

## Files Created

- `docs/agent-handoffs/2026-06-25-booker-event-prep-booking-intake.md`

## Files Modified

- `booking.html`
- `script.js`
- `style.css`
- `supabase/functions/project-neo-api/index.ts`
- `docs/PROJECT_NEO_BACKEND.md`
- `docs/PROJECT_NEO_EVENT_PREP_CHECKLIST.md`
- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Kept required booking fields unchanged: client name, email, event type, event date, city/state, and estimated guest count.
- Added prep fields as optional, folded behind a single Event Prep expander so the public inquiry flow stays smooth on mobile and desktop.
- Used existing booking inquiry `additional_notes`/`message` review text for prep source material instead of adding a new booking schema migration.
- Sent named prep keys in the browser payload so Stack Mason and Mission Control have a clear future mapping path.
- Included prep details in the direct-email fallback only when the visitor provides at least one optional prep field.
- Did not change availability checker status language or final booking confirmation rules.

## Booking Flow Changes

- Added an optional `Event prep details` section to the booking inquiry form.
- The section is collapsed by default and includes helper copy explaining that the fields help with load-in, timeline, music, gear, and day-of contact prep.
- Booking form submission now includes optional prep source fields when supplied.
- The direct-email fallback now includes an Event Prep Details block only when optional prep details are present.

## Form Fields Changed

Required fields changed:
- None.

Optional prep fields added:
- Day-of contact name
- Day-of contact phone
- Event vibe
- Crowd type
- Clean or explicit preference
- Mic needs
- Must-play songs
- Do-not-play songs
- Announcements needed
- Special moments
- Load-in notes
- Parking notes

Existing fields that also feed Event Prep:
- Event type
- Event date
- Start time
- End time
- Venue name
- Venue address
- City/state
- Indoor/outdoor
- Estimated guest count
- Music preferences
- Budget range
- Referral source
- Additional notes

## Validation Rules

- Existing required booking validation remains: client name, valid email, event type, event date, city/state, and positive whole-number guest count.
- Existing optional phone validation remains: optional phone must be at least seven digits if supplied.
- New optional day-of contact phone validation: must be at least seven digits if supplied, otherwise it can be left blank.
- Clean/explicit preference is validated server-side against `clean_only`, `clean_preferred`, `explicit_allowed`, `client_discretion`, and `not_specified`.
- Optional prep text fields do not block submission when blank.

## API/Data Requirements

- Public booking payload now includes optional named prep keys:
  - `dayOfContactName`
  - `dayOfContactPhone`
  - `eventVibe`
  - `crowdType`
  - `cleanExplicitPreference`
  - `micNeeds`
  - `mustPlaySongs`
  - `doNotPlaySongs`
  - `announcementsNeeded`
  - `specialMoments`
  - `loadInNotes`
  - `parkingNotes`
  - `event_prep_details`
- `POST /booking-inquiries` accepts the new optional prep keys in camelCase, snake_case, or HTML hyphenated naming where applicable.
- Supplied prep details are folded into existing booking inquiry `additional_notes` and generated admin `message` text.
- No booking schema migration was added in this Booker task.
- Future protected admin mapping can promote these details into `event_prep_checklists`, `event_music_notes`, `event_timeline_items`, gear notes, or related admin-only records after Stack Mason/Data Knox alignment.

## Event Prep Checklist Field Mapping

- Contact prep: client name, email, phone, day-of contact name, day-of contact phone.
- Venue/load-in prep: venue name, venue address, city/state, indoor/outdoor, load-in notes, parking notes.
- Music prep: music preferences, must-play songs, do-not-play songs, clean/explicit preference, event vibe, crowd type.
- Timeline prep: start time, end time, announcements needed, special moments.
- Gear prep: mic needs, indoor/outdoor, guest count, venue/load-in notes.
- Admin lead context: budget range, referral source, additional notes, and availability snapshot.

## Availability Checker Behavior

- No availability checker UI or status behavior changed in this task.
- Public availability language still must not guarantee final booking.
- Booking is still not confirmed until admin approval and any required agreement/deposit steps are complete.

## Admin Follow-Up Needed

- Mission Control should surface the folded prep source text in booking inquiry/admin review in a way that is readable for event prep.
- Mission Control and Stack Mason should decide whether/when to map these source fields into protected Event Prep records after the protected admin APIs exist.
- Data Knox should confirm whether future structured booking-to-prep promotion needs dedicated columns, joins, or normalized admin-only records beyond the existing Event Prep schema.

## Architecture Changes

- No routing, authentication, deployment, payment, client portal, or public availability architecture changed.
- The booking API input surface expanded with optional prep keys, but persistence still uses existing booking inquiry fields.

## Folder/File Structure Changes

- Added one Booker handoff under `docs/agent-handoffs/`.

## New Conventions

- Public booking prep intake should stay optional and collapsed/folded by default unless Neo Prime and the owner approve a longer form.
- Booking inquiry prep fields should be treated as source material for admin review, not final event-prep records.

## Affected Modules

- Public booking page
- Shared public form JavaScript
- Project Neo public booking API handler
- Event Prep Checklist documentation
- Backend API documentation
- Changelog and agent status documentation

## Data/API/Schema Changes

- API input accepted by `POST /booking-inquiries` changed to include optional prep keys.
- Database schema did not change.
- New prep values are stored in existing booking inquiry review text, not new columns.
- No Square, invoice, deposit, or payment schema/data flow changed.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- No payment-card data is collected.
- No Square activation, payment processing, provider secret, webhook secret, or payment credential was added.
- Day-of contact phone and event prep details are private client/event information and must stay inside booking/admin review surfaces.
- Prep details are not exposed through public availability responses or public event data.
- SOC 2 Type II and PCI-DSS remain readiness/alignment goals only; no official compliance claim was made.

## Agents That Need This Update

- Data Knox
- Stack Mason
- Mission Control
- Cold Copy
- Shield
- Bug Hunter
- Scribe
- Sync
- Ledger

## Required Follow-Up Tasks

- Data Knox: review whether future structured booking-to-prep promotion needs additional schema, or whether the Event Prep tables already cover the needed admin-only records.
- Stack Mason: align protected admin APIs so supplied booking prep source fields can be promoted into Event Prep records when appropriate.
- Mission Control: verify admin booking review displays prep source details clearly and map them into the Event Prep UI when persistence APIs exist.
- Cold Copy: review the folded Event Prep section labels and helper copy for brand voice and form length.
- Shield: verify no prep details leak publicly and that day-of contact/private event data remains admin-only.
- Bug Hunter: retest booking form validation, optional prep fields, direct-email fallback body, mobile collapsed/expanded behavior, and successful booking submission after approved staging access exists.
- Scribe: keep changelog, agent status, backend docs, and Event Prep docs aligned.
- Sync: confirm future timeline/calendar workflows understand that these prep fields are intake source material, not final scheduling truth.
- Ledger: no deposit/invoice behavior changed; review only if future Event Prep readiness displays payment/deposit status with these intake notes.

## Risks or Blockers

- No live Supabase write test was performed in this task.
- Deno is not available in this workspace unless installed separately, so Edge Function type-checking may remain blocked.
- Official staging verification remains blocked until Launchpad/Gatekeeper provide approved staging access and staging deployment evidence.
- Admin display/promotion of the new prep intake depends on future Mission Control/Stack Mason follow-up.

## Testing Performed

- Reviewed current booking form, booking submission JavaScript, booking API payload handler, Event Prep product brief, Data Knox schema handoff, and Mission Control Event Prep UI handoff.
- Ran `node --check script.js`.
- Ran `node --check scripts/build-site.mjs`.
- Ran `npm run validate`.
- Ran `npm run build`; build completed with the existing local warning that browser API config is incomplete and public forms/auth screens run in fallback mode.
- Ran `git diff --check` on the Booker-touched files.
- Rendered built `booking.html` at a 390px mobile viewport through a local static server.
- Browser check confirmed the optional prep section is collapsed by default, expands successfully, exposes all 12 new optional prep fields, keeps required booking fields unchanged, focuses `client-name` on empty submit validation, and has no horizontal overflow at 390px.
- Initial `npx vite` local preview attempt failed because restricted network access could not reach the npm registry; the rendered check used the built `dist` output instead.

## Suggested Next Agent

Mission Control, with Stack Mason and Data Knox alignment for structured Event Prep promotion.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, raw payment data, cardholder data, private access URLs, bypass tokens, or unverified compliance claims in handoff notes.
