# DJ Too Kold Booker Notes

These notes are for the person handling booking inquiries and public-site content updates for Project Neo.

## Public Website Shell

The public-facing website shell is in place and is intentionally static-first:

- `index.html`: Home page with hero, service highlights, event types, mixes preview, testimonials, and booking CTA.
- `about.html`: Brand approach, preparation style, performance signals, and trust-building copy.
- `services.html`: Weddings, school events, private parties, corporate events, nightlife, and custom event support.
- `booking.html`: Public booking inquiry form and planning guidance.
- `mixes.html`: Mix showcase layout ready for real embeds or audio files.
- `gallery.html`: Responsive gallery grid ready for event photos.
- `events.html`: Event type details and event flow.
- `contact.html`: General contact form and contact guidance.
- `faq.html`: Common booking questions.

## Component Map

Reusable public-site components are implemented as shared HTML patterns plus shared CSS classes:

- Navbar: `.site-header`, `.brand`, `.menu-toggle`, `.site-nav`, `.nav-cta`
- Footer: `.site-footer`, `.footer-inner`, `.footer-brand`
- Hero: `.hero`, `.hero-image`, `.hero-content`, `.page-hero`
- ServiceCard: `.service-card`
- CTASection: `.cta-strip`
- GalleryGrid: `.gallery-grid`, `.media-card-grid`
- MixCard: `.mix-card`, `.media-mix-card`
- ContactSection: `.contact-section`, `.form-layout`, `.inquiry-form`

Keep new sections aligned to these classes so the site stays consistent on mobile, tablet, and desktop.

## Booking Intake Priority

When reviewing a public booking inquiry, prioritize:

- Availability checker status shown at submission, if present.
- Event date and location.
- Event type.
- Guest count.
- Start and end time.
- Indoor or outdoor setup.
- Venue name and address if available.
- Music preferences, clean-edit requirements, and must-play or do-not-play notes.
- Budget range and how they heard about DJ Too Kold.
- Any microphone, announcement, ceremony, special dance, load-in, or parking needs.

If the lead is missing key details, reply with the smallest number of questions needed to determine fit and availability.

The public availability checker is an estimate only. Treat `available`, `pending`, `unavailable`, and `contact_required` as review signals, not as booking confirmation.

## Content To Replace Before Launch

Replace or confirm these before the public launch:

- Public booking/contact email confirmed as `djtookold@gmail.com` in config.
- Official DJ Too Kold logo is stored at `assets/images/dj-too-kold-logo.jpeg`.
- Real client testimonials.
- Real gallery photos and alt text.
- Real mix embeds or audio files.
- Official social links.
- Final service area wording.
- Pricing/package language, if DJ Too Kold wants it public.
- Any legal, cancellation, deposit, travel, or event-policy language.

## Backend Boundary

Do not treat the public shell as a completed booking backend. The current public pages are designed for inquiry capture, trust building, and handoff. Payment collection, contract signing, quote approval, calendar holds, and automated follow-up belong to a later operational/backend workflow.
