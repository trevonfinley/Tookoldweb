# Agent Handoff - Public Contact Email Routing

- From: Full-Stack Product Engineer
- To: Frontend Engineer, Client Portal Engineer, DevOps Engineer, Booking Systems Engineer, Backend/Supabase Engineer, Security Engineer, QA Test Engineer, Documentation/Release Engineer
- Date: 2026-05-24
- Related Version: Unreleased

## Summary

Routed direct public email touchpoints to `djtookold@gmail.com` while keeping the Supabase-backed booking and contact form submission flow unchanged.

## Files Changed

- `script.js`
- `client-portal.js`
- `client-portal.html`
- `index.html`
- `project-neo-config.js`
- `scripts/build-site.mjs`
- `.env.example`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `WEBSITE_STRATEGY.md`
- `docs/BOOKER_NOTES.md`
- `CHANGELOG.md`
- `docs/agent-handoffs/2026-05-24-public-contact-email-routing.md`

## Decisions Made

- Treat `djtookold@gmail.com` as public contact information, not a secret.
- Keep form POST behavior pointed at the existing Supabase API when `apiBaseUrl` is configured.
- Add `publicContactEmail` to browser config with `djtookold@gmail.com` as the default.
- Avoid database, Edge Function, auth, payment, and admin workflow changes.

## Important Notes

- Direct `mailto:` links continue to encode subject and body content before opening an email draft.
- Backend notification emails are not part of this change and can be planned as a future server-side feature.

## What the Next Agent Should Do

- QA should verify build output, validation, and direct email links on booking, contact, and client portal pages.
- Future backend notification work should be owned by the Backend/Supabase Engineer and Security Engineer.

## Blockers or Risks

- None.

## Questions for the Next Agent

- None.
