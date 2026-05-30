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
| `PROJECT_NEO_PUBLIC_CONTACT_EMAIL` | Optional | `djtookold@gmail.com` | Public email used for direct `mailto:` links and website contact metadata. |
| `PROJECT_NEO_REQUIRE_PUBLIC_CONFIG` | Optional | `true` | Makes non-production builds fail when public config is missing. |

### Supabase Auth Provider Configuration

Supabase Auth has two configuration surfaces for Project Neo:

- Static site environment variables expose only the Supabase project URL and browser publishable key.
- Provider secrets and Auth URL settings live in Supabase Auth provider settings for hosted staging/production, or in `supabase/config.toml` plus local `.env` values for local Supabase CLI development.

| Name or setting | Where it belongs | Required | Notes |
| --- | --- | --- | --- |
| Supabase Auth Site URL | Supabase Dashboard, Auth URL Configuration | Yes | Production should be `PROJECT_NEO_APP_URL`, such as `https://djtoo-kold.com`. |
| Supabase Auth Redirect URLs | Supabase Dashboard, Auth URL Configuration | Yes | Must include callback and reset URLs for every local, staging, preview, and production auth domain. |
| `SUPABASE_URL` | Static host and Edge Function secrets | Yes | Public project URL. Browser-safe. |
| `SUPABASE_PUBLISHABLE_KEY` | Static host only | Yes | Browser-safe public key. Use publishable key when available; legacy anon key is compatibility only. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Function secrets only | Yes for current API | Server-side only. Bypasses RLS. Never expose through Vercel/Netlify static env or `project-neo-config.js`. |
| `SUPABASE_SECRET_KEY` | Future private server runtime only | No | Server-side only. Use only if Project Neo later adopts newer Supabase secret keys in private server code. |
| Google OAuth Client ID | Supabase Auth provider settings | Yes for Google | Configure with matching secret and redirect URIs. |
| Google OAuth Client Secret | Supabase Auth provider settings or local `.env` for CLI | Yes for Google | Server/provider secret. Never ship to the browser. |
| Apple Services ID / Client ID | Supabase Auth provider settings | Yes for Apple web OAuth | Usually a Services ID like `com.example.app.web`. |
| Apple Team ID and Key ID | Supabase Auth provider settings | Yes for Apple | Provider configuration values. Treat as private operational config. |
| Apple private `.p8` key or generated client secret | Supabase Auth provider settings or local `.env` for CLI | Yes for Apple | Server/provider secret. Store securely and rotate on schedule. |
| `SUPABASE_ACCESS_TOKEN` | Local/CI secret store only | Only for automation | Needed only if automating Supabase Management API provider config. |
| Passkey/WebAuthn config | Supabase project and browser SDK | Conditional | No static secret. Requires supported Supabase SDK surface, HTTPS or localhost, and supported browser/device. |

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

3. Configure local Supabase Auth redirects if using the local Supabase stack.

In `supabase/config.toml`, local auth should use the Project Neo static server as the site URL and allow the callback/reset pages:

```toml
[auth]
site_url = "http://localhost:4173"
additional_redirect_urls = [
  "http://localhost:4173/auth-callback.html",
  "http://localhost:4173/auth-reset-password.html"
]
```

If Google OAuth is tested against local Supabase, add the provider config and keep the secret in local `.env`:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
skip_nonce_check = false
```

If Apple OAuth is tested locally, configure Apple the same way and keep the generated Apple client secret outside git:

```toml
[auth.external.apple]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
redirect_uri = "env(SUPABASE_AUTH_EXTERNAL_APPLE_REDIRECT_URI)"
```

After changing `supabase/config.toml`, restart Supabase with `supabase stop` and `supabase start`.

4. Start Supabase locally or point `.env.local` at a staging Supabase project.

```bash
supabase start
supabase db reset
supabase functions serve project-neo-api --env-file supabase/functions/.env
```

5. Build and preview the static site:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`. The deployable files live in `dist/`.

6. For quick static-only edits, run:

```bash
npm run dev
```

This serves the repository root. It is useful for design/content work, but production deploys should always use `npm run build` and the generated `dist/` output.

Do not use `file://` URLs for Auth QA. OAuth redirects and passkeys should be tested through `http://localhost:4173` locally or HTTPS in staging/production.

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

## Supabase Auth Setup

Project Neo auth uses Supabase email/password, Google OAuth, Apple OAuth, and optional passkeys. Configure these before production launch.

### Redirect URL Checklist

Supabase Auth URL Configuration:

- [ ] Site URL is the production app URL, for example `https://djtoo-kold.com`.
- [ ] Local callback is allowed: `http://localhost:4173/auth-callback.html`.
- [ ] Local password reset is allowed: `http://localhost:4173/auth-reset-password.html`.
- [ ] Local wildcard is allowed for development only: `http://localhost:4173/**`.
- [ ] Staging callback is allowed: `https://STAGING_DOMAIN/auth-callback.html`.
- [ ] Staging password reset is allowed: `https://STAGING_DOMAIN/auth-reset-password.html`.
- [ ] Production callback is allowed exactly: `https://PRODUCTION_DOMAIN/auth-callback.html`.
- [ ] Production password reset is allowed exactly: `https://PRODUCTION_DOMAIN/auth-reset-password.html`.
- [ ] Vercel preview wildcard is allowed only for preview testing: `https://*-TEAM_OR_ACCOUNT.vercel.app/**`.
- [ ] Netlify preview wildcard is allowed only if Netlify is the host: `https://**--SITE_NAME.netlify.app/**`.
- [ ] Production does not rely on broad wildcard redirects.
- [ ] Email templates that use `redirectTo` use `{{ .RedirectTo }}` where appropriate.

OAuth provider callback URLs:

- [ ] Google local Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`.
- [ ] Google staging Authorized redirect URI: `https://STAGING_PROJECT_REF.supabase.co/auth/v1/callback`.
- [ ] Google production Authorized redirect URI: `https://PRODUCTION_PROJECT_REF.supabase.co/auth/v1/callback`.
- [ ] Apple Services ID return URL uses the Supabase callback URL for the active Supabase project.
- [ ] If Supabase custom auth domains are added later, OAuth provider callback URLs are updated to match.

### Google OAuth Checklist

- [ ] Google Cloud project exists for DJ Too Kold / Project Neo.
- [ ] OAuth consent screen is configured with production app name, support email, app domain, privacy policy, and terms URLs.
- [ ] OAuth client type is `Web application`.
- [ ] Authorized JavaScript origins include local, staging, preview as needed, and production origins.
- [ ] Authorized redirect URIs include each Supabase project's `/auth/v1/callback` URL.
- [ ] Client ID and Client Secret are copied into the matching Supabase Auth Google provider.
- [ ] Local CLI testing uses `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` from an ignored `.env`.
- [ ] OAuth scopes are minimal. Request calendar/email provider scopes only when a server-side integration truly needs them.
- [ ] Provider tokens are not stored in frontend code or localStorage outside the Supabase session flow.

### Apple OAuth Checklist

- [ ] Apple Developer account is active.
- [ ] App ID is created and Sign in with Apple capability is enabled.
- [ ] Services ID is created for web OAuth and configured in Supabase as the Apple client ID.
- [ ] Apple Website URLs use the Supabase project domain, and return URLs use that project callback URL.
- [ ] Team ID, Key ID, Services ID, and generated client secret are configured in the Supabase Apple provider.
- [ ] The `.p8` private key is stored securely outside the repo.
- [ ] Calendar reminder exists to rotate/regenerate the Apple OAuth client secret at least every 6 months.
- [ ] Apple private relay email sources are configured if Project Neo sends email to hidden Apple relay addresses.
- [ ] The app does not require Apple full name on later logins; Apple may only provide name data during first authorization, and Supabase OAuth flow may not provide it to the app.

### Passkey/WebAuthn Checklist

- [ ] Passkeys are treated as an enhancement, not the only launch login method.
- [ ] Email/password, Google, or Apple remains available for account recovery and unsupported devices.
- [ ] Supabase JS is loaded with `auth.experimental.passkey = true`.
- [ ] Passkey UI checks `window.PublicKeyCredential`, `navigator.credentials`, and the Supabase `auth.passkey` API before showing required passkey flows.
- [ ] Passkeys are tested on HTTPS staging/production and on `localhost` for local development.
- [ ] Production domain is stable before encouraging passkey registration; passkeys are scoped to the relying-party domain/origin.
- [ ] Multiple passkeys per owner/admin are supported or at least planned so one lost device does not lock out the account.
- [ ] The UI clearly falls back when platform authenticators, roaming security keys, or cross-device passkeys are not available.
- [ ] Passkey management lets authenticated admins view, rename, and remove registered passkeys.
- [ ] Shield reviews recovery, session revocation, and last-admin lockout procedures before passkeys become a launch requirement.

Browser/device support assumptions:

- Most modern browsers support WebAuthn, but passkey behavior varies by browser, OS, device, authenticator, credential manager, and enterprise policy.
- Platform authenticators include Touch ID, Face ID, Windows Hello, Android screen lock, or equivalent device unlock methods.
- Roaming authenticators include hardware security keys and cross-device phone flows.
- `localhost` is acceptable for local testing, but production must use HTTPS.
- Passkeys registered on `localhost` do not prove production-domain passkeys work.

### Auth Production Setup

- [ ] Production Supabase project has Email provider enabled.
- [ ] Production Supabase Site URL is `PROJECT_NEO_APP_URL`.
- [ ] Production redirect URLs include only exact production callback/reset paths plus approved staging/preview patterns.
- [ ] Google and Apple providers are enabled only after their provider-side callback URLs are verified.
- [ ] `PROJECT_NEO_APP_URL`, `PROJECT_NEO_API_BASE_URL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` are set in the static host production environment.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` remains only in Supabase Edge Function secrets.
- [ ] Owner account is created, receives a `public.users` row, and has MFA enabled where available.
- [ ] Admin signup is reviewed by Gatekeeper; a newly signed-up user must not gain admin access until a trusted owner/admin assigns the role row.

### Gatekeeper and Shield Notes

Gatekeeper owns auth behavior and should verify that all browser flows use `auth-callback.html` and `auth-reset-password.html`, that `returnTo` stays same-origin, and that OAuth token exchange code accepts any successful 2xx response rather than hardcoding `201`.

Shield owns security review and should verify the final redirect allowlist, JWT lifetime, MFA posture, session revocation process, RLS policies, role checks, and all server-only secrets before launch. Broad wildcard redirects are acceptable for local/preview QA only, not as the production security posture.

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

For the initial `tookoldweb.vercel.app` launch, the production public browser values are also mirrored in `vercel.json` so the static build can complete even before dashboard-level Vercel environment variables are entered. Do not add server-only secrets to `vercel.json`.

5. Keep `SUPABASE_SERVICE_ROLE_KEY`, payment secrets, and calendar secrets out of Vercel unless Project Neo later adds private Vercel server code.
6. Enable Vercel Authentication or Deployment Protection for preview deployments, and decide whether production admin/client URLs should also require Vercel-level access in addition to Supabase Auth. Public marketing pages must remain public.

### Vercel Speed Insights

Project Neo is currently a static HTML/CSS/JS site. Do not migrate to Next.js just to add Speed Insights, and do not use `@vercel/speed-insights/next` unless Neo Prime approves a future Next.js migration.

For the current static architecture, Speed Insights is integrated by the static build:

- Vercel builds inject the Vercel Speed Insights script into generated public-page HTML.
- Local builds and `npm run dev` do not inject the script, which avoids localhost console noise and accidental local telemetry.
- The script is limited to public marketing/booking/contact pages: `/`, `/about`, `/services`, `/booking`, `/mixes`, `/gallery`, `/events`, `/contact`, and `/faq`.
- Auth, admin, and client portal pages are intentionally excluded.
- A client-side `beforeSend` hook strips query strings, hashes, and private workflow paths before metrics are sent.
- The build removes legacy standalone `speed-insights.js` references/files if a Vercel bot install branch is later reconciled into the source tree.

Vercel project status:

- Speed Insights route check: `https://tookoldweb.vercel.app/_vercel/speed-insights/script.js` returns `200`.
- Vercel project metadata confirms recent `tookoldweb` deployments for Speed Insights, but the current production page references a standalone `speed-insights.js` file from a Vercel bot deployment rather than this local build-injection implementation.
- Current production `client-portal.html` also references that standalone `speed-insights.js`; treat this as deployment drift and promote the local build-injection version before relying on private-page telemetry exclusions.
- Vercel tracks enabled Speed Insights data across preview and production deployments, so review both environments after the next deployment.

No server-only secrets, service role keys, payment secrets, OAuth secrets, Apple private keys, webhook secrets, or Supabase private credentials are required for Speed Insights.

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
- [ ] Google OAuth login works in staging and production.
- [ ] Apple OAuth login works in staging and production, or is hidden until configured.
- [ ] Password reset email returns to `auth-reset-password.html`.
- [ ] Passkey registration/sign-in is tested on at least one supported desktop browser and one supported mobile platform, or passkey UI remains optional.
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
- Supabase Auth redirect URLs: <https://supabase.com/docs/guides/auth/redirect-urls>
- Supabase Google OAuth setup: <https://supabase.com/docs/guides/auth/social-login/auth-google>
- Supabase Apple OAuth setup: <https://supabase.com/docs/guides/auth/social-login/auth-apple>
- Supabase JavaScript passkey API: <https://supabase.com/docs/reference/javascript/auth-passkey-api>
- Supabase local config and secrets: <https://supabase.com/docs/guides/local-development/managing-config>
- Supabase CLI auth config reference: <https://supabase.com/docs/guides/local-development/cli/config>
- Supabase OAuth token endpoint breaking change: <https://supabase.com/changelog/45468-breaking-change-oauth-token-endpoint-will-return-http-200-instead-of-201>
- Supabase 2026 Data API grant change: <https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically>
- MDN passkeys overview: <https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys>
- web.dev passkey registration support notes: <https://web.dev/articles/passkey-registration>
- Vercel environment variables: <https://vercel.com/docs/environment-variables>
- Vercel preview environments: <https://vercel.com/docs/deployments/environments#preview-environment-pre-production>
- Netlify build environment variables: <https://docs.netlify.com/build/configure-builds/environment-variables/>
- Netlify branch deploys, deploy previews, and deploy contexts: <https://docs.netlify.com/deploy/deploy-overview/>
