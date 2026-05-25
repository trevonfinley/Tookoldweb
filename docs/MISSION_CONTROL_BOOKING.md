# Mission Control Booking Notes

## Public Booking Path

The booking form on `booking.html` submits to `POST /booking-inquiries` when `project-neo-config.js` has `apiBaseUrl` set. Without `apiBaseUrl`, the form keeps the Netlify form fallback and email fallback.

Required public fields:

- Client name
- Email
- Event type
- Event date
- City/state
- Estimated guest count

Optional public fields:

- Phone
- Start time
- End time
- Venue name
- Venue address
- Indoor/outdoor
- Music preferences
- Budget range
- Referral source
- Additional notes

## Availability Checker

The booking page now includes a lightweight public availability checker before the full inquiry form. Visitors enter event date, start time, end time, event type, and optional city/state. The checker calls `POST /availability-check` and displays only the safe public status and message returned by the API.

Public statuses:

- `available`
- `pending`
- `unavailable`
- `contact_required`

The UI uses estimate language only. It does not confirm a booking, expose private event/client details, or block the visitor from continuing to the full inquiry form. If the checker succeeds, the full booking form stores the status and checked timestamp in hidden fields so the inquiry can preserve what the visitor saw at submission time.

## Supabase Record Shape

Submissions are saved to `public.booking_inquiries` with `status = 'new'`, `source = 'website'`, and no payment fields. The Edge Function stores `full_name`, splits `first_name` and `last_name` when possible, and keeps event logistics in dedicated columns for admin review.

Primary review columns:

- `full_name`, `email`, `phone`
- `event_type`, `event_date`, `start_time`, `end_time`
- `venue_name`, `venue_address`, `city_state`, `location`
- `guest_count`, `indoor_outdoor`
- `music_preferences`, `budget_range`, `heard_about`, `additional_notes`
- `requested_start_at`, `requested_end_at`
- `availability_status_at_submission`, `availability_checked_at`
- `status`, `internal_notes`, `reviewed_at`, `confirmed_at`, `cancelled_at`

## Status Workflow

Booking inquiries move through:

- `new`
- `reviewing`
- `quoted`
- `deposit_requested`
- `confirmed`
- `completed`
- `cancelled`

No card numbers, CVV/CVC values, card expiration values, or direct payment processing belong in this workflow.
