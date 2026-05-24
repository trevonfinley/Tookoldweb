# Project Neo Deployment Guide

This guide sets up a safe, repeatable workflow for DJ Too Kold's public site, admin dashboard, client portal, and Supabase backend.

## Recommended Stack

Use Supabase for the database, Auth, and the `project-neo-api` Edge Function. Use Vercel as the first-choice static host because it has simple GitHub imports, environment scopes for Production/Preview/Development, and automatic preview deployments for non-production branches and pull requests. Netlify is also a strong option for this static site; use it if the team prefers Netlify Forms or Netlify's deploy-context workflow.

Do not run the Project Neo service role key through the static host. Keep it only in Supabase Edge Function secrets.

## Environment Model

| Environment | Branch/source | Static host | Supabase project | Purpose |
| --- | --- | --- | --- | --- |
| Local | Developer machine | `npm run dev` or `npm run preview` | Local Supabase or dev project | Build, test, and QA changes before GitHub |
| Staging | `staging` branch and PR previews | Vercel Preview or Netlify branch/deploy preview | Separate staging Supabase project | Test deploys with realistic data and no production risk |
| Production | `main` branch | Production domain | Production Supabase project | Live DJ Too Kold website and admin platform |

Staging and production should use different Supabase projects. This keeps test bookings, payment tests, and admin experiments away from live client data.

## Environment Variables

### Static Site Build Variables

These values are safe to use in browser code when Row Level Security and API authorization are correct. They are generated into `dist/project-neo-config.js` by `npm run build`.

| Name | Required | Example | Notes |
| --- | --- | --- | --- |
| `PROJECT_NEO_ENV` | Yes | `development`, `staging`, `production` | Controls environment labeling and production build validation. |
| `PROJECT_NEO_APP_URL` | Production yes | `https://djtoo-kold.com` | Public website URL for the active environment. |
| `PROJECT_NEO_API_BASE_URL` | Production yes | `https://PROJECT_REF.functions.supabase.co/project-neo-api` | Public base URL for the Supabase Edge Function. |
| `SUPABASE_URL` | Production yes | `https://PROJECT_REF.supabase.co` | Public Supabase project URL. |
| `SUPABASE_PUBLISHABLE_KEY` | Production yes | `sb_publishable_...` or anon key | Browser key only. Never use a secret or service role key here. |
| `PROJECT_NEO_ADMIN_EMAIL` | Optional | `admin@example.com` | Public support/admin contact if UI needs it. |
| `PROJECT_NEO_REQUIRE_PUBLIC_CONFIG` | Optional | `true` | Makes non-production builds fail when public config is missing. |

### Supabase Edge Function Secrets

Set these in Supabase, not in frontend code. For local serving, copy `supabase/functions/.env.example` to `supabase/functions/.env`.

| Name | Required | Example | Notes |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Yes | `https://PROJECT_REF.supabase.co` | Supabase function runtime also provides this by default. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | server-only value | Server-side only. Bypasses RLS and must never reach the browser. |
| `PROJECT_NEO_ALLOWED_ORIGIN` | Yes | `https://djtoo-kold.com` | CORS origin. Use the exact staging or production site URL. |
| `PROJECT_NEO_ADMIN_EMAIL` | Optional | `admin@example.com` | Server-side notification/contact setting. |
| `PAYMENT_PROVIDER` | Later | `manual`, `stripe`, `square` | Keep payment integration server-side. |
| `PAYMENT_SECRET_KEY` | Later | provider secret | Server-side only. |
| `PAYMENT_WEBHOOK_SECRET` | Later | provider webhook secret | Server-side only. |
| `CALENDAR_PROVIDER` | Later | `manual`, `google` | Server-side calendar integration flag. |
| `CALENDAR_API_KEY` | Later | provider secret | Server-side only unless using a restricted public browser key by design. |
| `GOOGLE_CALENDAR_ID` | Later | calendar ID | Can be server-side even if not secret. |

## Local Setup

1. Install the basics:

```bash
node --version
npm --version
python3 --version
supabase --version
```

Use Node 20 or newer. Python is only used for the dependency-free local static server.

2. Create local env files:

```bash
cp .env.example .env.local
cp supabase/functions/.env.example supabase/functions/.env
```

Fill `.env.local` with public local or staging values. Fill `supabase/functions/.env` with server-only function secrets.

3. Start Supabase locally or point `.env.local` at a staging Supabase project.

```bash
supabase start
supabase db reset
supabase functions serve project-neo-api --env-file supabase/functions/.env
```

4. Build and preview the static site:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`. The deployable files live in `dist/`.

5. For quick static-only edits, run:

```bash
npm run dev
```

This serves the repository root. It is useful for design/content work, but production deploys should always use `npm run build` and the generated `dist/` output.

## Build Scripts

| Script | Purpose |
| --- | --- |
| `npm run build` | Copies static assets into `dist/` and generates browser-safe `project-neo-config.js` from env vars. |
| `npm run validate` | Checks required deployment files and scans deployable frontend files for server-only secret references. |
| `npm run dev` | Serves the repository root locally on port `4173`. |
| `npm run preview` | Builds `dist/` and serves the production-style output locally on port `4173`. |

## Git Branch Recommendation

Use a simple stable-release flow:

| Branch | Role | Deploy target |
| --- | --- | --- |
| `main` | Production-ready code only | Production |
| `staging` | Integrated release candidate | Staging |
| `feature/name-of-change` | Individual work | Preview deployment |
| `hotfix/name-of-fix` | Urgent production fix | Preview, then `main` |

Open pull requests into `staging` for normal work. Promote by opening a pull request from `staging` into `main` after QA. Hotfixes can go straight to `main` after a preview deployment and focused review.

## Supabase Deployment

Do this once for staging, then repeat for production with the production project ref and production secrets.

1. Link the Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

2. Review and apply migrations:

```bash
supabase db push
```

3. Deploy the Edge Function:

```bash
supabase functions deploy project-neo-api
```

4. Set function secrets:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_ONLY_SERVICE_ROLE_KEY"
supabase secrets set PROJECT_NEO_ALLOWED_ORIGIN="https://YOUR_SITE_DOMAIN"
```

5. Create the first owner in Supabase Auth, then add the Project Neo role row:

```sql
insert into public.users (id, role, full_name, email)
values ('AUTH_USER_ID_HERE', 'owner', 'DJ Too Kold', 'admin@example.com');
```

6. Before launch, run Supabase advisors from the dashboard or CLI and confirm all exposed public tables have explicit grants, RLS enabled, and matching policies.

## Vercel Setup

1. Import the GitHub repository into Vercel.
2. Set Framework Preset to `Other` if Vercel does not detect the static app cleanly.
3. Confirm build settings:

```text
Build Command: npm run build
Output Directory: dist
Production Branch: main
```

4. Add environment variables in Vercel:

| Vercel environment | Values |
| --- | --- |
| Development | Local/dev public values if using `vercel dev`. |
| Preview | Staging Supabase URL, staging publishable key, staging API URL, `PROJECT_NEO_ENV=staging`. |
| Production | Production Supabase URL, production publishable key, production API URL, `PROJECT_NEO_ENV=production`. |

5. Keep `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, and calendar secrets out of Vercel unless Project Neo later adds private Vercel server code.
6. Enable deployment protection for preview/admin URLs if available on the account.

## Netlify Setup

If Netlify is chosen instead of Vercel:

1. Import the GitHub repository into Netlify.
2. Confirm build settings:

```text
Build command: npm run build
Publish directory: dist
Production branch: main
```

3. Add build-scoped environment variables for production and deploy previews.
4. Use the checked-in `netlify.toml` deploy contexts. Production maps to `PROJECT_NEO_ENV=production`; deploy previews and branch deploys map to `PROJECT_NEO_ENV=staging`.
5. Configure branch deploys for `staging` and deploy previews for pull requests.
6. Keep all server-only secrets in Supabase Edge Function secrets.

## Preview Deployments

Preview deployments should prove a change without touching live customer data.

- Pull requests and feature branches use staging Supabase values.
- The `staging` branch uses the staging Supabase project and a stable staging URL.
- Production variables should only be attached to the `main` production deployment.
- Preview deployments should keep admin and client portal pages noindexed and protected when the hosting plan supports it.
- Test payment and calendar integrations only against sandbox/test provider accounts.

## Production Launch Checklist

- [ ] `main` is up to date and contains only approved release changes.
- [ ] `npm run build` succeeds locally.
- [ ] `npm run validate` succeeds locally.
- [ ] Staging preview has been tested on desktop and mobile.
- [ ] Booking form writes to Supabase and creates an admin-reviewable inquiry.
- [ ] Contact form writes to Supabase or has an intentional fallback.
- [ ] Admin login works for the owner account.
- [ ] Client portal login behavior is verified with a test client.
- [ ] Supabase Auth owner account has MFA enabled.
- [ ] Production `PROJECT_NEO_ALLOWED_ORIGIN` is the live site origin, not `*`.
- [ ] Production Supabase RLS policies and grants have been reviewed.
- [ ] Supabase advisors show no unresolved security issues.
- [ ] Payment provider is in live mode only after test-mode payment flow is verified.
- [ ] Calendar integration uses the production calendar only after staging tests pass.
- [ ] Domain DNS and HTTPS are active.
- [ ] `robots.txt` and noindex headers are correct for public/admin/client pages.
- [ ] A recent database backup or restore point exists.
- [ ] The previous successful deployment is identified for rollback.

## Rollback Checklist

1. Stop the bleeding:

- [ ] Pause new merges to `main`.
- [ ] Identify whether the issue is static frontend, Edge Function, database migration, env config, payment, calendar, or DNS.
- [ ] Capture the failing URL, deploy ID, timestamp, and error message.

2. Roll back static hosting:

- [ ] In Vercel or Netlify, promote the last known-good production deployment.
- [ ] Confirm `PROJECT_NEO_API_BASE_URL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` still point to production.
- [ ] Smoke test homepage, booking, contact, admin login, and client portal.

3. Roll back Supabase Edge Function:

- [ ] Checkout the last known-good commit locally.
- [ ] Redeploy only `project-neo-api`.
- [ ] Confirm `supabase secrets list` still shows the expected production secrets.
- [ ] Smoke test public form submission and authenticated admin route.

4. Handle database changes carefully:

- [ ] Prefer a forward-fix migration for schema issues.
- [ ] If data was corrupted or deleted, restore from a verified Supabase backup.
- [ ] Do not manually delete production data to "undo" a migration without a written recovery plan.

5. If a secret was exposed:

- [ ] Rotate the exposed key immediately.
- [ ] Update Supabase Edge Function secrets or provider secrets.
- [ ] Redeploy/restart affected services if required by the provider.
- [ ] Review logs for suspicious usage.

6. Close the incident:

- [ ] Document root cause and customer impact.
- [ ] Add a test or checklist item that would have caught the issue.
- [ ] Reopen normal deploy flow after production is stable.

## Source Links

- Supabase Edge Function environment variables and secrets: <https://supabase.com/docs/guides/functions/secrets>
- Supabase 2026 Data API grant change: <https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically>
- Vercel environment variables: <https://vercel.com/docs/environment-variables>
- Vercel preview environments: <https://vercel.com/docs/deployments/environments#preview-environment-pre-production>
- Netlify build environment variables: <https://docs.netlify.com/build/configure-builds/environment-variables/>
- Netlify branch deploys, deploy previews, and deploy contexts: <https://docs.netlify.com/deploy/deploy-overview/>
