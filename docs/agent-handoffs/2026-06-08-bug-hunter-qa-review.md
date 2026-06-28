# Agent Handoff - Preview/Staging QA Review

## Agent Name

Bug Hunter

## Agent Role

QA Test Engineer for Project Neo

## Date

2026-06-08

## Related Branch

`codex-project-neo-deployment-workflow`

## Test Environment

- Vercel Preview/expected staging target: `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app`
- Latest READY non-production deployment checked: `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2`
- Deployment branch: `codex-project-neo-deployment-workflow`
- Deployment commit: `f30467c870f4b8451192e96724027baeb9887444`
- Local generated preview: `http://localhost:4174`
- Local source smoke target: `http://localhost:4173`
- Production was not tested because this request requires owner confirmation before production testing.

## Tested URL

- `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/`
- `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/booking`
- `http://localhost:4174/`
- `http://localhost:4174/about`
- `http://localhost:4174/services`
- `http://localhost:4174/booking`
- `http://localhost:4174/gallery`
- `http://localhost:4174/mixes`
- `http://localhost:4174/events`
- `http://localhost:4174/faq`
- `http://localhost:4174/contact`
- `http://localhost:4174/admin-login`
- `http://localhost:4174/admin-dashboard`
- `http://localhost:4174/admin-dashboard.html`
- `http://localhost:4174/client-portal`
- `http://localhost:4174/definitely-not-found`

## Task Summary

Ran Bug Hunter QA for the current Project Neo preview/staging deployment workflow. The live Vercel preview is protected by Vercel Authentication, so deployed page-level QA, deployed form success states, and deployed database write verification are blocked without approved preview access. Local generated-preview regression completed against the built `dist/` output.

Current recommendation: safe to keep as a protected preview, not ready for staging sign-off, not ready for production, and not ready for public launch.

## Pages/Features Tested

- Public pages: Home, About, Services, Booking, Gallery, Mixes, Events, FAQ, Contact.
- Navbar/footer links and mobile menu.
- Official DJ Too Kold logo rendering.
- Booking availability checker validation states.
- Booking inquiry form required, invalid, long-notes, and disconnected fallback states.
- Contact form required, invalid, and disconnected fallback states.
- Admin login missing-config behavior.
- Admin dashboard logged-out route behavior.
- Client portal private-beta route behavior.
- 404/not-found behavior.
- Desktop/mobile responsive checks at 375, 430, 768, and 1440 widths.
- Basic accessibility checks for labels, button names, focus-capable controls, and logo alt acceptance.
- Environment/release documentation checks.

## Bugs Found

### Bug ID: BH-QA-20260608-01

Title: Vercel preview/staging deployment blocks Bug Hunter page-level QA.

Severity: High

Area: Deployment / Preview Access / Release QA

Environment: Vercel Preview

URL/Page: `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app/booking`

Steps to Reproduce:
1. Open the latest READY preview URL.
2. Open `/booking`.
3. Inspect browser result and Vercel fetch result.

Expected Result:
Bug Hunter has an approved way to test the preview/staging site pages, forms, admin route behavior, mobile layout, assets, and console errors without testing production.

Actual Result:
Browser redirects to Vercel login. Vercel fetch returns `401 Unauthorized` with an Authentication Required page.

Screenshots/Notes:
Browser showed `Log in to Vercel`. No Project Neo page content was reachable on the preview URL.

Suggested Owner Agent:
Launchpad and Gatekeeper

Suggested Fix:
Provide an approved QA access path for protected previews, such as Vercel Authentication access, Trusted Sources, or an owner-approved bypass token. Do not make preview/staging public unless Launchpad, Gatekeeper, Shield, and the owner approve that posture.

Retest Instructions:
After approved access is available, rerun full deployed preview/staging regression on all public pages, booking, contact, availability checker, admin login, admin dashboard route, client portal route, media loading, console errors, and mobile breakpoints.

### Bug ID: BH-QA-20260608-02

Title: No confirmed staging-branch deployment was available for staging QA.

Severity: High

Area: Release Workflow / Staging Readiness

Environment: Vercel deployment metadata

URL/Page: Latest READY non-production deployment `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2`

Steps to Reproduce:
1. List current Vercel deployments for Project Neo.
2. Identify latest READY non-production deployment.
3. Compare branch metadata against the documented `feature/* -> dev -> staging -> main` flow.

Expected Result:
Bug Hunter can test a stable staging Preview Deployment from the `staging` branch before production promotion.

Actual Result:
Latest READY non-production deployment is a protected preview from `codex-project-neo-deployment-workflow`, not a confirmed `staging` branch deployment.

Screenshots/Notes:
This does not mean the preview is unsafe; it means true staging-gate QA is incomplete.

Suggested Owner Agent:
Launchpad, Scribe, Neo Prime

Suggested Fix:
Create or identify the official `staging` branch preview URL, document it in deployment notes, and provide approved QA access.

Retest Instructions:
Rerun Bug Hunter staging regression only after a stable `staging` branch preview is available and accessible.

### Bug ID: BH-QA-20260608-03

Title: Clean admin dashboard route can redirect to nested 404 in generated local preview.

Severity: Medium

Area: Admin Protection / Routing

Environment: Local generated preview

URL/Page: `http://localhost:4174/admin-dashboard`

Steps to Reproduce:
1. Run `npm run build`.
2. Serve `dist/`.
3. Open `http://localhost:4174/admin-dashboard`.
4. Wait for logged-out redirect behavior.

Expected Result:
Logged-out admin dashboard access redirects to the admin login page without exposing private data and without landing on a 404.

Actual Result:
The route lands on `http://localhost:4174/admin-dashboard/admin-login.html?returnTo=admin-dashboard.html`, which returns a default `404 File not found` response.

Screenshots/Notes:
Direct `http://localhost:4174/admin-dashboard.html` redirects correctly to `admin-login.html?returnTo=admin-dashboard.html`. This may depend on trailing-slash clean-route serving, so it must be retested on the Vercel preview once access is available.

Suggested Owner Agent:
Gatekeeper, Mission Control, Launchpad

Suggested Fix:
Use root-relative login redirects for admin routes, such as `/admin-login` or `/admin-login.html`, and verify both clean and `.html` admin URLs.

Retest Instructions:
Open `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html` while logged out on the official staging preview and verify all land on login without 404s or private data exposure.

### Bug ID: BH-QA-20260608-04

Title: Official logo alt text does not match the QA acceptance criterion.

Severity: Low

Area: Accessibility / Brand

Environment: Local generated preview

URL/Page: Header/footer brand logo on public, admin, and portal pages.

Steps to Reproduce:
1. Open `http://localhost:4174/`.
2. Inspect `.brand-mark img[src*="dj-too-kold-logo.jpeg"]`.
3. Repeat on `booking`, `contact`, `gallery`, `admin-login`, and `client-portal`.

Expected Result:
Per QA request, official logo alt text should be `DJ Too Kold logo`.

Actual Result:
Brand logo images render and load, but their `alt` values are empty. The containing `.brand-mark` is also `aria-hidden="true"`.

Screenshots/Notes:
This is not currently blocking keyboard/screen-reader navigation because the surrounding brand link has the accessible label `DJ Too Kold home`. It is still an acceptance mismatch.

Suggested Owner Agent:
Access, Pixel Frost, Style Guide

Suggested Fix:
Either set the logo image alt to `DJ Too Kold logo` and remove decorative hiding where appropriate, or update the acceptance criterion to explicitly allow the logo image to be decorative when the brand link provides the accessible name.

Retest Instructions:
Inspect rendered header/footer logos on desktop and mobile after the chosen accessibility pattern is implemented.

### Bug ID: BH-QA-20260608-05

Title: Missing branded 404/not-found page.

Severity: Low

Area: Public Website / Error State

Environment: Local generated preview

URL/Page: `http://localhost:4174/definitely-not-found`

Steps to Reproduce:
1. Open a nonexistent route.
2. Observe the page content.

Expected Result:
A branded Project Neo/DJ Too Kold 404 page with safe navigation back to public pages.

Actual Result:
Default server `Error response` page appears with no branding, navbar, footer, or booking/contact recovery path.

Screenshots/Notes:
No private data is exposed. This is a polish and recovery issue, not a booking blocker.

Suggested Owner Agent:
Pixel Frost and Launchpad

Suggested Fix:
Add a static `404.html` page and confirm Vercel serves it for missing routes.

Retest Instructions:
Open an unknown route on the official staging preview and confirm a branded 404 displays.

### Bug ID: BH-QA-20260608-06

Title: Local build copies local `.DS_Store` metadata into `dist/assets` if present.

Severity: Informational

Area: Deployment Packaging / Hygiene

Environment: Local generated preview

URL/Page: `dist/assets/.DS_Store`

Steps to Reproduce:
1. Run `npm run build`.
2. Inspect generated `dist/assets`.

Expected Result:
Generated deploy output excludes OS metadata and dotfiles.

Actual Result:
`dist/assets/.DS_Store` was generated from the local `assets/.DS_Store` file.

Screenshots/Notes:
`.DS_Store` is already listed in `.gitignore`, so this may not appear in Git-based Vercel builds. It remains a local deploy hygiene risk if someone deploys from local build output.

Suggested Owner Agent:
Launchpad and Shield

Suggested Fix:
Update the build copy routine to skip dotfiles and remove local OS metadata from asset folders.

Retest Instructions:
Run `npm run build` and confirm no dotfiles are present in `dist/`.

## Severity Summary

- Critical: 0
- High: 2
- Medium: 1
- Low: 2
- Informational: 1

## Files Created

- `docs/agent-handoffs/2026-06-08-bug-hunter-qa-review.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Did not test production because the request says production should only be tested with explicit owner confirmation.
- Did not create or use a Vercel temporary auth-bypass link because that changes access posture and was not explicitly owner-approved.
- Treated local generated-preview results as fallback evidence only where live preview/staging access was blocked.
- Did not mark backend writes, admin authenticated success paths, or deployed success states as passed.

## Architecture Changes

- None.

## Folder/File Structure Changes

- Added this QA handoff note only.

## New Conventions

- None.

## Affected Modules

- Public website routes.
- Booking and contact forms.
- Availability checker.
- Admin login and dashboard routing.
- Client portal private-beta route.
- Vercel preview/staging workflow.
- Release documentation and status tracking.

## Data/API/Schema Changes

- None.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Positive: Preview/staging is protected by Vercel Authentication.
- Risk: Bug Hunter cannot complete required preview/staging QA until an approved access path exists.
- No secrets, tokens, passwords, API keys, private credentials, private client data, or payment data were documented.
- Compliance wording in reviewed docs remains readiness/alignment only; no official SOC 2 Type II or PCI-DSS compliance claim was found.
- No private admin/client records were exposed in local unauthenticated route checks.

## Agents That Need This Update

- Launchpad
- Gatekeeper
- Mission Control
- Pixel Frost
- Access
- Style Guide
- Shield
- Scribe
- Neo Prime
- Booker
- Stack Mason
- Data Knox

## Required Follow-Up Tasks

- Launchpad/Gatekeeper: Provide an approved access path for protected preview/staging QA.
- Launchpad/Scribe/Neo Prime: Identify and document the official `staging` branch preview URL.
- Gatekeeper/Mission Control/Launchpad: Fix or confirm clean admin dashboard route redirect behavior for `/admin-dashboard`, `/admin-dashboard/`, and `/admin-dashboard.html`.
- Access/Pixel Frost/Style Guide: Resolve the official logo alt-text acceptance mismatch or update the agreed accessibility criterion.
- Pixel Frost/Launchpad: Add and verify a branded static 404 page.
- Launchpad/Shield: Exclude dotfiles from generated deploy output.
- Booker/Stack Mason/Data Knox: Retest deployed booking, contact, availability checker, and database writes after staging access exists.
- Gatekeeper/Mission Control/Ledger/Concierge: Retest authenticated admin/client success paths only after approved sessions exist.

## Risks or Blockers

- Live preview/staging UI QA is blocked by Vercel Authentication.
- True staging QA is incomplete because the tested non-production deployment is not confirmed as a `staging` branch preview.
- Supabase read/write behavior was not tested in this pass because deployed preview access was blocked and local config intentionally has no API base URL.
- Production was not tested in this pass.
- Admin authenticated success paths remain untested without an approved admin session.
- Client portal authenticated success paths remain untested and should stay private beta unless owner-approved.

## Retest Requirements

- Rerun full Bug Hunter regression on an accessible staging preview.
- Include desktop widths 1440 and mobile widths 375 and 430 at minimum.
- Verify all public pages, nav/footer links, logo, media, gallery, mixes, services, events, FAQ, booking, contact, availability checker, admin login, admin dashboard logged-out behavior, client portal private-beta behavior, branded 404, console logs, and private-data boundaries.
- Use approved QA data only for any deployed booking/contact database write tests.
- Do not mark authenticated admin/client flows as passed until approved sessions are available.

## Testing Performed

- `npm run build` passed.
- `npm run validate` passed.
- Vercel deployment metadata checked for latest READY preview and production separation.
- Vercel preview `/booking` fetch returned `401 Unauthorized`.
- Browser opened latest preview and confirmed Vercel login wall.
- Local generated preview route matrix at 375, 430, 768, and 1440 widths.
- Local public pages checked for horizontal overflow, non-lazy broken images, labels, button names, public portal links, and logo rendering.
- Local mobile menu open/close tested at 375px.
- Local availability checker tested for missing fields, past date, and overnight `22:00` to `02:00` fallback behavior.
- Local booking form tested for empty submit, invalid email, invalid phone, past date, invalid guest count, long notes, and no-API fallback.
- Local contact form tested for empty submit, invalid email, valid-looking no-API fallback.
- Local admin login and dashboard route behavior checked while unauthenticated/missing config.
- Local client portal route checked for private beta/no-config behavior and hidden portal shell.
- Source internal-link scan checked 174 internal `.html` links and hash targets; no missing targets found.
- Secret/compliance wording scan checked for obvious real-secret patterns and official compliance/launch claims.

## Suggested Next Agent

Launchpad

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
