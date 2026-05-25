# Bug Hunter Notes: Availability Checker

## Scope

Validate the public availability checker on `booking.html` and the handoff into the full booking inquiry form. This feature must not expose client names, venue names, private notes, block titles, invoices, payments, or raw admin event details.

## High-Priority Checks

- Checker requires event date, event type, start time, and end time.
- Checker rejects past dates and end times that are not after start times.
- `available`, `pending`, `unavailable`, and `contact_required` responses each render a clear public message.
- `unavailable` and API error states still allow the visitor to continue to the full inquiry form.
- Continue button copies event date, start time, end time, event type, and city/state into the booking form.
- Successful checker results populate `availability-status-at-submission` and `availability-checked-at` before inquiry submission.
- Editing event date, time, event type, or city/state in the full inquiry form clears the carried checker snapshot so stale status is not submitted.
- Booking submission stores only public availability status/timestamp fields and does not process payment data.

## API Cases

- `POST /availability-check` with a known open window returns `available`.
- Overlap with a confirmed event or unavailable/personal/travel block returns `unavailable`.
- Overlap with a hold block returns `pending`.
- Maintenance/setup/manual-review conditions return `contact_required`.
- Missing or unclear date/time returns `contact_required`.

## Regression Risks

- The public checker and the older public availability board both use availability language; confirm they render independently.
- The full booking form keeps Netlify/email fallback behavior when `apiBaseUrl` is not configured.
- The checker result is an estimate only. It must never read like a confirmed booking.
