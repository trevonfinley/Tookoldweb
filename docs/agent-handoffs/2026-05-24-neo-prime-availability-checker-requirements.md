# Agent Handoff - Availability Checker Requirements

- From: Neo Prime, Lead Software Architect
- To: Backend Engineer, Booking Systems Engineer, Admin Dashboard Engineer, Security Engineer, DevOps Engineer, Frontend Engineer, QA Test Engineer
- Date: 2026-05-24
- Related Version: 0.1.0

## Summary

Added availability checker requirements to `agents.md` so future implementation protects private event/client details while still helping visitors check dates and submit booking inquiries.

## Files Changed

- `agents.md`
- `CHANGELOG.md`
- `docs/agent-handoffs/2026-05-24-neo-prime-availability-checker-requirements.md`

## Decisions Made

- Public availability must use safe statuses only: `available`, `pending`, `unavailable`, and `contact_required`.
- Internal admin availability can use detailed operational statuses such as `hold`, `booked`, `personal_block`, `travel_block`, and `maintenance_day`.
- Public responses must not expose client names, venue names, private notes, or exact private event details.
- The MVP should allow inquiry submission even when the checked status is not fully available.

## Important Notes

- No availability checker feature code was built.
- No database schema, API route, UI, auth, or deployment settings were changed.
- Implementation should treat privacy and double-booking prevention as first-class requirements.

## What the Next Agent Should Do

- Backend Engineer: design the minimum schema/API support for availability blocks and safe public status responses.
- Booking Systems Engineer: define how checked availability results attach to booking inquiries.
- Admin Dashboard Engineer: plan admin controls for holds, blocked dates, overrides, and conflict warnings.
- Security Engineer: review public responses for data leakage.
- Frontend Engineer: design the public checker UI around safe messages and inquiry conversion.
- QA Test Engineer: add tests for privacy, conflict detection, and inquiry submission when status is not fully available.

## Blockers or Risks

- Availability block storage is not yet defined.
- Public and internal statuses must not be mixed in browser-facing responses.
- Existing event statuses may need mapping rather than direct reuse.

## Questions for the Next Agent

- Should availability blocks be a dedicated table or represented as event records with special statuses?
- Should checked availability be stored as a structured snapshot on `booking_inquiries` or as a separate audit record?
