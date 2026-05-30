# Agent Handoff - Vercel Speed Insights

## Agent Name

Launchpad

## Agent Role

DevOps / Deployment Engineer

## Date

2026-05-29

## Task Summary

Added Vercel Speed Insights support for Project Neo's current static HTML/CSS/JS architecture without migrating to Next.js. The static build now injects the Vercel Speed Insights script only during Vercel builds and only for public pages, so performance data can be collected from Vercel deployments while auth, admin, and client portal pages stay out of telemetry.

Launchpad also inspected the current Vercel production state and found deployment drift from a Vercel bot Speed Insights install: production references a standalone `speed-insights.js` file that is not present in this local workspace and appears on at least the homepage and client portal. The local build-injection implementation should replace that drift before the private-page exclusion is considered live.

## Files Created

- `docs/agent-handoffs/2026-05-29-launchpad-vercel-speed-insights.md`

## Files Modified

- `CHANGELOG.md`
- `docs/PROJECT_NEO_DEPLOYMENT.md`
- `docs/agent-status.md`
- `scripts/build-site.mjs`

## Files Deleted

- None.

## Architecture Changes

- No app framework migration was made.
- Project Neo remains a static HTML/CSS/JS site.
- The Next.js `SpeedInsights` component is intentionally not used because the repo is not a Next.js app.
- Speed Insights is added as a Vercel-only static build injection into generated public-page HTML.

## Folder/File Structure Changes

- No new runtime folders were added.
- No generated `dist/` files were edited by hand.
- A new Launchpad handoff note was added under `docs/agent-handoffs/`.

## New Conventions

- Vercel-only observability snippets should be injected through `scripts/build-site.mjs`, not copied manually into built files.
- Speed Insights should stay limited to public pages unless Shield and Neo Prime approve broader telemetry coverage.
- Private workflow pages such as auth, admin, and client portal pages should remain excluded from Speed Insights.
- Legacy standalone `speed-insights.js` files from Vercel bot install branches should not ship from the static build.

## Affected Modules

- Static build pipeline: `scripts/build-site.mjs`
- Deployment documentation: `docs/PROJECT_NEO_DEPLOYMENT.md`
- Project status and release notes: `docs/agent-status.md`, `CHANGELOG.md`

## Key Decisions Made

- Used the Vercel-supported static/vanilla script integration instead of `@vercel/speed-insights/next`.
- Injected Speed Insights only when `VERCEL` is present in the build environment.
- Injected the script only for public pages: `/`, `/about`, `/services`, `/booking`, `/mixes`, `/gallery`, `/events`, `/contact`, and `/faq`.
- Added a `beforeSend` redaction hook that removes query strings and hashes from reported URLs.
- Added a private-path guard in the hook so auth, admin, and client portal paths are dropped if the snippet is ever placed there by mistake.
- Guarded the hook against unexpected event shapes before normalizing `event.url`.
- Added build cleanup for legacy standalone `speed-insights.js` references/files so a reconciled Vercel bot branch does not duplicate telemetry or re-add private-page coverage.
- Confirmed the Vercel project currently serves `/_vercel/speed-insights/script.js` with `200`.
- Confirmed Vercel project deployments include recent Speed Insights install activity, but the live production implementation is currently the Vercel bot `speed-insights.js` drift rather than this local build-injection version.

## Data/API/Schema Changes

- No Supabase schema changes.
- No API route changes.
- No auth, booking, payment, invoice, contract, admin, portal, or calendar workflow changes.
- New telemetry data is limited to Vercel Speed Insights web performance metrics on public pages after deployment.

## Environment Variable Changes

- None.
- No new `.env` values are required.
- No server-only secrets, API keys, access tokens, passwords, private keys, or private credentials were added to frontend code or documentation.

## Security/Compliance Impact

- Speed Insights records anonymous web performance data such as route/path, browser/device class, country, Core Web Vitals, and element attribution.
- The local build-injection implementation excludes auth, admin, and client portal pages to avoid collecting private workflow paths.
- The local build-injection implementation strips query strings and hashes from reported URLs before metrics are sent.
- Current production drift still includes the Vercel bot `speed-insights.js` reference on the client portal, so Shield should treat private-page telemetry exclusion as pending deployment correction.
- No client names, booking details, payment data, invoice data, contracts, private event notes, admin records, Supabase secrets, or credentials are intentionally exposed through this integration.
- This does not change Project Neo's SOC 2 Type II readiness status or PCI-DSS alignment claims. Project Neo still must not claim official SOC 2 or PCI compliance without the required independent audit or assessment.

## Agents That Need This Update

- Pixel Frost
- Shield
- Scribe
- Bug Hunter
- Scout
- Launchpad

## Required Follow-Up Tasks

- Launchpad: reconcile or replace the current Vercel bot `speed-insights.js` production drift with the local build-injection implementation before treating Speed Insights as privacy-reviewed.
- Bug Hunter: after deployment, verify desktop/mobile page loads, no console errors, and the Speed Insights script appears only on intended public pages.
- Shield: review the deployed telemetry behavior and confirm the private-page exclusion still satisfies Project Neo privacy expectations.
- Scout: use collected Speed Insights data later to guide performance work; do not treat this as an SEO content change.
- Scribe: include this observability change in the next release notes.

## Risks or Blockers

- Current production includes a Vercel bot `speed-insights.js` integration that is not represented in this local workspace and appears on at least the homepage and client portal.
- The local build now strips that legacy standalone file/reference, but production remains drifted until the clean build is promoted.
- The Vercel MCP project metadata does not expose the Speed Insights dashboard toggle directly; Launchpad confirmed the script route is available and recent Speed Insights deployments exist, but the dashboard should be checked visually after the clean local implementation is promoted.
- If future pages add sensitive query strings to public routes, the redaction hook should remain in place and Bug Hunter should retest it.
- Existing clean-route admin redirect behavior should remain on Gatekeeper/Bug Hunter's QA list; it was not changed by Speed Insights.

## Testing Performed

- Confirmed Vercel project metadata and deployment history for `tookoldweb`.
- Confirmed `https://tookoldweb.vercel.app/_vercel/speed-insights/script.js` returns `200`.
- Confirmed current production homepage references `speed-insights.js` from a Vercel bot Speed Insights deployment.
- Confirmed current production `client-portal.html` also references `speed-insights.js`, which the local clean implementation avoids.
- Ran `node --check scripts/build-site.mjs`.
- Ran `npm run build` and confirmed normal local builds do not inject the Speed Insights script.
- Ran `VERCEL=1 npm run build` and confirmed generated public pages include `/_vercel/speed-insights/script.js`.
- Confirmed generated auth, admin, and client portal pages do not include the Speed Insights script.
- Confirmed Vercel-mode and local builds do not copy or reference legacy standalone `speed-insights.js`.
- Ran `npm run validate`.
- Served `dist/` locally and confirmed `/`, `/booking/`, `/contact/`, and `/client-portal.html` return HTTP `200`.

## Recommended Next Agent

Bug Hunter

## Suggested Next Agent

Bug Hunter

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified compliance claims in handoff notes.
