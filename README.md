# Project Neo

Project Neo is the custom DJ Too Kold website and business platform. The v1 architecture is intentionally simple: a fast static HTML/CSS/JS frontend backed by Supabase Postgres, Supabase Auth, Supabase Storage-ready records, and one Supabase Edge Function API.

The first release should prioritize the public website, booking/contact intake, admin dashboard visibility, and the event-to-invoice workflow. Do not start a Next.js migration for v1.

## Architecture

Project Neo currently uses:

- Static public/admin/portal pages at the repository root.
- Plain CSS and browser JavaScript for the frontend experience.
- Supabase Postgres for business data.
- Supabase Auth for admin and future client identity.
- Supabase Edge Functions for API routes and server-only access.
- `dist/` as generated deploy output from the static build script.
- Vercel or Netlify for static hosting.

Keep the system static-first until the booking, admin, billing, media, and portal workflows justify a larger app framework.

## Current App Shape

```txt
.
|-- index.html
|-- about.html
|-- services.html
|-- booking.html
|-- mixes.html
|-- gallery.html
|-- events.html
|-- contact.html
|-- faq.html
|-- admin-login.html
|-- admin-dashboard.html
|-- client-portal.html
|-- style.css
|-- script.js
|-- admin.js
|-- client-portal.js
|-- media-data.js
|-- media-library.js
|-- assets/
|-- docs/
|-- scripts/
|-- supabase/
|-- dist/
|-- package.json
|-- project-neo-config.js
|-- vercel.json
`-- netlify.toml
```

Important ownership boundaries:

- Root `.html` files are route-level screens for the public site, admin login/dashboard, and client portal.
- `style.css` owns the shared visual system.
- `script.js` owns shared public-site behavior, form handling, navigation, and public availability rendering.
- `admin.js` owns admin authentication, dashboard reads, and admin UI behavior.
- `client-portal.js` owns portal authentication, portal reads, song requests, and editable notes.
- `media-data.js` and `media-library.js` own fallback and API-backed media rendering.
- `assets/` stores brand and media assets used by the static frontend.
- `scripts/` stores build and deployment validation tooling.
- `supabase/migrations/` stores executable database schema changes.
- `supabase/functions/project-neo-api/` stores the Supabase Edge Function API.
- `docs/` stores deeper backend, schema, auth, deployment, and QA references.
- `docs/BOOKER_NOTES.md` stores the public-site handoff notes for booking intake and content replacement.
- `dist/` is generated deploy output only. Do not edit files in `dist/` by hand.

## Recommended Structure

Keep the v1 structure beginner-friendly:

- Keep route pages at the repository root while the app remains static.
- Keep all business and architecture documentation in `docs/`.
- Keep backend ownership inside `supabase/`.
- Keep build and validation tooling inside `scripts/`.
- Keep generated deployment output inside `dist/`.
- Avoid adding framework folders such as `src/app/` until Project Neo intentionally migrates to a full app framework.

If the platform later outgrows static pages, migrate in a separate phase after the booking, admin, payments, and portal workflows are stable.

## Major Modules

- Public website: homepage, about, services, events, FAQ, gallery, mixes, and contact pages.
- Booking/contact intake: public forms that create Supabase-backed leads and messages when `apiBaseUrl` is configured.
- Admin dashboard: authenticated operational view for bookings, clients, events, invoices, payments, venues, media, and tasks.
- Client portal: authenticated client-facing event details, invoices, contracts, notes, and song requests.
- Media library: local fallback media plus API-backed gallery and mix records.
- Supabase API: one Edge Function that validates requests, applies auth checks, and talks to Postgres.
- Database schema: Supabase migration covering users, clients, inquiries, events, invoices, payments, contracts, media, mixes, notes, tasks, and RLS.
- Deployment workflow: static build to `dist/`, environment-driven browser config, and validation before deploy.

## API Boundaries

The browser talks to the configured Project Neo API base URL from `project-neo-config.js`.

Public routes:

- `POST /booking-inquiries`
- `POST /contact-messages`
- `GET /media`
- `GET /mixes`
- `GET /service-packages`
- `POST /availability-check`
- `GET /availability`

Admin routes require a Supabase Auth bearer token for an active `owner` or `admin` user:

- `GET /admin/me`
- `GET /admin/dashboard-summary`
- `GET /admin/booking-inquiries`
- `PATCH /admin/booking-inquiries/:id/status`
- `GET /admin/clients`
- `POST /admin/clients`
- `GET /admin/events`
- `POST /admin/events`
- `GET /admin/events/upcoming`
- `GET /admin/invoices`
- `POST /admin/invoices`
- `GET /admin/payments`
- `POST /admin/payments`
- `PATCH /admin/payments/:id/status`
- `GET /admin/venues`
- `GET /admin/media`
- `GET /admin/tasks`

Portal routes require a Supabase Auth bearer token connected to `clients.portal_user_id`:

- `GET /portal/me`
- `GET /portal/summary`
- `POST /portal/song-requests`
- `PATCH /portal/song-requests/:id`
- `PATCH /portal/event-notes/:id`

See `docs/PROJECT_NEO_BACKEND.md` for route payloads and response shape. See `docs/MISSION_CONTROL_BOOKING.md` for the booking workflow handoff notes.

## Backend And Data Model

Project Neo uses Supabase as the business data boundary. The migration in `supabase/migrations/20260523000000_project_neo_core.sql` defines:

- Auth-linked users and roles.
- Clients and future portal ownership.
- Booking inquiries and contact messages.
- Venues, services, packages, and package-service mappings.
- Events, event notes, tasks, and public availability support.
- Invoices, invoice items, payments, and ledger snapshots.
- Contracts, song requests, gallery items, and mixes.
- Row Level Security policies for public, admin, and portal access.

Money is stored in integer cents. Payment records store provider references and status only. Project Neo must never store credit card numbers, CVC/CVV values, PAN values, or card expiration details.

## Local Development

Copy environment templates before local work:

```bash
cp .env.example .env.local
cp supabase/functions/.env.example supabase/functions/.env
```

Build and preview the deploy output:

```bash
npm run build
npm run preview
```

For quick static-only editing:

```bash
npm run dev
```

The local static server uses `http://localhost:4173`. Production-style deploy output lives in `dist/`.
Supabase Auth redirects, Google OAuth, Apple OAuth, and passkey setup are documented in `docs/PROJECT_NEO_AUTH.md` and `docs/PROJECT_NEO_DEPLOYMENT.md`.

If `npm` is not available on the shell PATH, the existing validator can still be run with a Node binary:

```bash
node scripts/validate-deploy.mjs
```

## Validation

Before deployment or handoff:

```bash
npm run validate
```

The validation script checks required files, scans deployable frontend files for server-only secret references, verifies important `.gitignore` entries, and guards against confusing Supabase public and service-role keys.

Current reviewed baseline:

- `scripts/validate-deploy.mjs` passes when run directly with Node.
- `npm` was not available on the reviewer shell PATH, so `npm run validate` still needs to be confirmed in a normal developer environment.

## Agent Handoffs

Project Neo agents must create or update a handoff note in `docs/agent-handoffs/` after meaningful work. Use the file name format `YYYY-MM-DD-agent-name-task-summary.md` and start new notes from `docs/agent-handoffs/HANDOFF_TEMPLATE.md`.

Handoffs should clearly explain what changed, which files changed, key decisions, data/API/schema impact, environment variable impact, security/compliance impact, affected agents, follow-up work, risks or blockers, testing performed, and the suggested next agent. Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unfinished work described as complete.

## Launch Readiness

Official launch readiness is tracked in `docs/PROJECT_NEO_LAUNCH_READINESS.md`. As of 2026-06-06, Project Neo remains NO-GO for official public launch even though the public Vercel site, production Supabase schema, full production API, overnight booking behavior, and public booking/contact writes are live.

Current launch blockers include owner email confirmation and first sign-in, approved authenticated admin/client QA sessions or explicit deferrals, authenticated admin/invoice/payment success-path QA, final domain decision, final Shield/Bug Hunter security and telemetry recheck, and a final production regression. Neo Prime declares GO only after all critical blockers pass or receive explicit owner-approved deferrals.

## Missing Setup Files

The next tooling pass should add or confirm:

- `.nvmrc` or `.node-version` for Node 20+.
- `deno.json` for Supabase Edge Function formatting and linting.
- `supabase/config.toml` for local Supabase workflow.
- `.editorconfig` for consistent whitespace and line endings.
- Optional formatter/lint config once the team chooses the tool.
- CI workflow that runs the deployment validator.
- `tests/` or a QA automation folder for browser/API checks.
- `*.swp` in `.gitignore`; a local Vim swap file exists under `docs/`.

Do not add these in the README-only architecture pass unless explicitly assigned.

## Development Phases

Phase 0: Architecture cleanup

- Update this README as the owner-friendly architecture index.
- Preserve existing files and uncommitted user changes.
- Document setup gaps and validation status.

Phase 1: Runtime/tooling hardening

- Add Node version, Deno config, Supabase local config, editor config, and CI validation.
- Confirm `npm run validate` works once `npm` is available.

Phase 2: Public booking reliability

- Stabilize booking/contact submit behavior and missing-config states.
- Verify Supabase writes in staging.

Phase 3: Admin workflow completion

- Add admin create/update actions for inquiries, clients, events, invoices, and payments.
- Keep the existing Edge Function contract unless a bug requires a narrow change.

Phase 4: Money and contracts

- Add real Stripe or Square payment flow.
- Add webhook verification and contract document handling.

Phase 5: Client portal polish

- Expand event summary, invoices, contracts, song requests, and client-visible notes.

Phase 6: Operations scale

- Add reminders, calendar sync, richer reporting, content management, and role refinements.

## Documentation Map

- `docs/PROJECT_NEO_BACKEND.md`: API routes, payloads, response patterns, and backend behavior.
- `docs/PROJECT_NEO_DATABASE_SCHEMA.md`: schema, statuses, relationships, RLS model, indexes, and seed data.
- `docs/PROJECT_NEO_AUTH.md`: admin/client auth flow, roles, owner bootstrap, redirect URLs, OAuth setup, passkeys, and access assumptions.
- `docs/PROJECT_NEO_DEPLOYMENT.md`: local setup, environment model, Supabase deployment, Vercel/Netlify setup, auth provider setup, launch checklist.
- `docs/deployment-notes.md`: preview and production deployment records, deploy IDs, domain status, rollback notes, and launch follow-up.
- `docs/PROJECT_NEO_LAUNCH_READINESS.md`: Neo Prime launch-readiness summary, launch blockers, launch gates, and handoff coverage.
- `docs/PROJECT_NEO_QA_BUG_REPORT.md`: current QA findings and fix checklist.
- `AGENTS.md`: agent collaboration rules, handoff protocol, availability checker requirements, and compliance readiness requirements.
- `docs/agent-handoffs/HANDOFF_TEMPLATE.md`: required structure for new handoff notes.
- `docs/agent-status.md`: current agent status summary and recent handoff index.

## Notes For The Next Engineer

- Keep v1 static-first with Supabase.
- Do not edit generated `dist/` files directly.
- Do not introduce a framework migration while fixing booking/admin reliability.
- Do not put `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, or calendar secrets in browser config.
- Start with tooling hardening, then fix public form reliability, then complete admin workflow controls.
- Treat this README as the top-level architecture guide and the `docs/` files as detailed implementation references.
