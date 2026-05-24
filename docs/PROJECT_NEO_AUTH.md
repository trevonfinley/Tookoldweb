# Project Neo Authentication and Access Control

Project Neo uses Supabase Auth for identity and a `public.users` profile row for Project Neo roles. The first production user should be the DJ Too Kold owner account. Email/password, Google OAuth, Apple OAuth, and Supabase passkeys/WebAuthn are the supported sign-in options.

## Implementation Plan

1. Keep public marketing pages public and do not link admin pages from the public navigation.
2. Use Supabase Auth for email/password, Google, Apple, session storage, password resets, and passkeys.
3. Keep browser auth code modular in `auth-client.js`, passkey code isolated in `passkeys.js`, and auth page flows in `auth-pages.js`.
4. Route all admin data through the Project Neo Edge Function with `Authorization: Bearer <access_token>`.
5. Authorize admin dashboard access only when `public.users.role` is `owner` or `admin` and `is_active = true`.
6. Keep client portal access scoped through `clients.portal_user_id` so clients can only see their own records.
7. Reserve DJ and staff roles for future assigned-event access. Do not give them admin dashboard access until an assignment model exists.

## Roles

| Role | Current access | Future intent |
| --- | --- | --- |
| `owner` | Full admin dashboard and user management. | Business owner account. Keep this role rare. |
| `admin` | Full admin dashboard and user management. | Trusted operational admins. |
| `staff` | No admin dashboard access by default. | Assigned operational tasks after assignment policies exist. |
| `dj` | No admin dashboard access by default. | Assigned event view, music planning, and limited task access. |
| `client` | Portal-only access when linked through `clients.portal_user_id`. | Client portal profile, events, invoices, contracts, notes, and song requests. |

Admin access means `owner` or `admin` with `is_active = true`.

## Login Flow

1. Admin users sign in through `admin-login.html`.
2. Email/password uses `supabase.auth.signInWithPassword`.
3. Google and Apple use `supabase.auth.signInWithOAuth` and return through `auth-callback.html`.
4. Passkey sign-in uses `supabase.auth.passkey.signIn` when WebAuthn and the Supabase passkey SDK surface are available.
5. The dashboard calls `GET /admin/me` with the Supabase access token before loading any admin data.
6. The Edge Function verifies the token and checks `public.users` for active `owner` or `admin` access.
7. Non-admin, inactive, missing, or expired sessions are signed out and sent back to `admin-login.html`.

The public site does not expose admin navigation, and admin/auth pages are marked `noindex,nofollow`. Static HTML files can still be guessed on a public host, so the security boundary is the Supabase session, the Edge Function role check, and Postgres RLS. Production hosting should also block or isolate `/admin-*` and `/auth-*` paths when host route protection is available.

## Auth Pages and Helpers

- `admin-login.html`: email/password, Google, Apple, passkey sign-in, forgot-password link, sign-up link.
- `auth-signup.html`: email/password sign-up and OAuth account creation entry. A new account still has no admin access until a trusted owner/admin creates its `public.users` role row.
- `auth-forgot-password.html`: sends Supabase password reset email.
- `auth-reset-password.html`: completes the password recovery flow.
- `auth-callback.html`: exchanges OAuth or email confirmation codes and redirects to the intended page.
- `auth-client.js`: Supabase browser client, session helpers, OAuth helpers, role helpers, and API fetch wrapper.
- `passkeys.js`: isolated WebAuthn/passkey helper for register, sign in, list, rename, and delete.

## Sign Out

The admin dashboard sign-out button calls Supabase `signOut`, clears the browser session, and returns to `admin-login.html`.

## Client Portal Flow

1. Clients sign in through `client-portal.html` with Supabase email/password auth.
2. The portal calls `/portal/*` API routes with `Authorization: Bearer <access_token>`.
3. The Edge Function verifies the token with Supabase Auth.
4. The portal account is authorized only when `clients.portal_user_id` matches the signed-in Auth user ID.
5. The API returns only records connected to that client: events, non-draft invoices, payments, non-draft contracts, song requests, venue context, and non-private notes.
6. Portal writes are limited to song requests for that client's open events and event-note body updates where `event_notes.client_editable = true`.

To connect a client to the portal, create the Supabase Auth user, then set the matching client record:

```sql
update public.clients
set portal_user_id = 'AUTH_USER_ID_HERE'
where email = 'client@example.com';
```

## Supabase Auth Setup Checklist

See `docs/PROJECT_NEO_DEPLOYMENT.md` for the Launchpad-owned redirect, provider, and environment checklist. The short version:

- Enable the Email provider and allow email/password sign-in.
- Configure the Supabase Site URL to the production `PROJECT_NEO_APP_URL`.
- Add exact callback and password-reset redirect URLs for local, staging, preview, and production.
- Enable the Google provider only after Google Cloud has the matching Supabase `/auth/v1/callback` redirect URI.
- Enable the Apple provider only after Apple Developer has the Services ID, website URLs, return URL, Team ID, Key ID, and private key/client secret ready.
- Keep Google and Apple OAuth secrets in Supabase provider settings or ignored local CLI `.env` files only. Do not place them in frontend files.
- Apple may not return a full name after first authorization, and the OAuth flow may not expose full name to the app, so Project Neo must support missing display names.
- Plan Apple client-secret/private-key rotation at least every 6 months.
- Confirm passkeys/WebAuthn are enabled for the current Supabase project and SDK before making passkeys a launch requirement.
- Do not hardcode a `201` OAuth token success response. Supabase changes the OAuth token endpoint success status to `200 OK` on May 26, 2026; auth code should accept successful 2xx responses.

## Redirect URLs

Project Neo browser auth currently redirects to two static pages:

- `auth-callback.html` for OAuth and email confirmation/session exchange.
- `auth-reset-password.html` for password recovery.

Local Supabase Auth URL configuration:

- Site URL: `http://localhost:4173`
- Additional redirect URLs:
  - `http://localhost:4173/auth-callback.html`
  - `http://localhost:4173/auth-reset-password.html`

Production Supabase Auth URL configuration:

- Site URL: `https://PRODUCTION_DOMAIN`
- Additional redirect URLs:
  - `https://PRODUCTION_DOMAIN/auth-callback.html`
  - `https://PRODUCTION_DOMAIN/auth-reset-password.html`

Staging and preview should use staging Supabase values and staging/preview redirect allowlist entries. Production should use exact redirect URLs rather than broad wildcards.

OAuth provider callback URLs are different from Project Neo app redirect URLs. In Google and Apple provider consoles, use the Supabase project callback URL:

- Local Supabase: `http://127.0.0.1:54321/auth/v1/callback`
- Hosted staging: `https://STAGING_PROJECT_REF.supabase.co/auth/v1/callback`
- Hosted production: `https://PRODUCTION_PROJECT_REF.supabase.co/auth/v1/callback`

## Local Auth Setup

1. Serve the app through `http://localhost:4173`; do not test OAuth or passkeys from `file://`.
2. Keep `.env.local` public browser values limited to `PROJECT_NEO_APP_URL`, `PROJECT_NEO_API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and optional `PROJECT_NEO_ADMIN_EMAIL`.
3. Keep OAuth local provider secrets in an ignored `.env`, not in static host config.
4. Configure `supabase/config.toml` when testing local Supabase Auth:

```toml
[auth]
site_url = "http://localhost:4173"
additional_redirect_urls = [
  "http://localhost:4173/auth-callback.html",
  "http://localhost:4173/auth-reset-password.html"
]

[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
skip_nonce_check = false

[auth.external.apple]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
redirect_uri = "env(SUPABASE_AUTH_EXTERNAL_APPLE_REDIRECT_URI)"
```

5. Restart the local Supabase stack after config changes:

```bash
supabase stop
supabase start
```

## Production Auth Setup

1. Use separate Supabase projects for staging and production.
2. Set the production Supabase Site URL to the final production domain.
3. Add exact production callback/reset redirect URLs.
4. Add staging and preview redirect URLs only to the staging project unless production preview auth is intentionally required.
5. Configure Google and Apple providers in each Supabase project with provider credentials for that environment.
6. Put only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` into static hosting config.
7. Keep `SUPABASE_SERVICE_ROLE_KEY`, Supabase secret keys, OAuth client secrets, Apple private keys/client secrets, payment secrets, webhook secrets, and calendar secrets server-side only.
8. Create the owner account in Supabase Auth and then create the matching `public.users` owner row.
9. Verify that a newly created Auth user has no admin dashboard access until an owner/admin assigns the role row.

## Google OAuth Checklist

- Google Cloud project exists.
- OAuth consent screen is configured with Project Neo/DJ Too Kold branding, support email, authorized domains, privacy policy, and terms links.
- OAuth client type is `Web application`.
- Authorized JavaScript origins include `http://localhost:4173`, staging origin, and production origin.
- Authorized redirect URIs include the Supabase `/auth/v1/callback` URL for each environment.
- Google Client ID and Client Secret are entered in Supabase Auth provider settings for each environment.
- Local CLI testing uses ignored `.env` variables: `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`.
- Scopes stay minimal unless Gatekeeper explicitly adds a server-side Google integration.

## Apple OAuth Checklist

- Apple Developer account is active.
- App ID exists and has Sign in with Apple enabled.
- Services ID exists for web OAuth and is used as the Supabase Apple client ID.
- Apple Website URLs are configured with the Supabase Auth domain for the environment.
- Apple return URL points to the Supabase `/auth/v1/callback` URL for the environment.
- Team ID, Key ID, Services ID, and generated client secret are entered in Supabase Auth provider settings.
- The `.p8` private key is stored outside the repo and access is limited.
- A recurring 6-month rotation reminder exists for Apple OAuth client-secret/key maintenance.
- Private relay email sources are configured if Project Neo sends operational emails to Apple relay addresses.
- UI and profile code tolerate missing names because Apple name data may only be available at first authorization.

## Passkeys and WebAuthn

Project Neo enables the Supabase browser client with:

```js
auth: {
  experimental: { passkey: true }
}
```

The current SDK surface is isolated behind `passkeys.js`:

- `supabase.auth.passkey.register`
- `supabase.auth.passkey.signIn`
- `supabase.auth.passkey.list`
- `supabase.auth.passkey.update`
- `supabase.auth.passkey.delete`

Passkey registration is available only from the authenticated admin settings panel. Passkey sign-in is offered on the login page as an additional option, not the only option. Email/password, Google, and Apple remain fallback methods.

Security assumptions:

- Project Neo does not store passkey private keys.
- Project Neo does not expose passkey challenge/session secrets in client code.
- WebAuthn support depends on browser, device, authenticator, and secure context support.
- `localhost` can be used for local testing, but staging and production must use HTTPS.
- Passkeys are scoped to the relying-party domain/origin. Passkeys registered on `localhost` will not validate the production-domain experience.
- Browser/device support varies across platform authenticators, roaming hardware keys, cross-device flows, credential managers, and enterprise-managed browsers.
- If WebAuthn or the Supabase passkey SDK surface is unavailable, the UI explains that the user should use email, Google, or Apple instead.
- Account settings should continue toward viewing, renaming, and removing registered passkeys. The current dashboard exposes register, list, rename, and remove through the isolated helper.
- Owner/admin users should have more than one recovery method before passkeys become a launch requirement.

## Environment Variables

Static browser config is generated into `project-neo-config.js` from:

```bash
PROJECT_NEO_APP_URL=https://your-domain.com
PROJECT_NEO_API_BASE_URL=https://YOUR_PROJECT_REF.functions.supabase.co/project-neo-api
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
PROJECT_NEO_ADMIN_EMAIL=admin@example.com
```

Server-only values belong in Supabase Edge Function secrets, not frontend config:

```bash
SUPABASE_SERVICE_ROLE_KEY=server_side_only
PROJECT_NEO_ALLOWED_ORIGIN=https://your-domain.com
```

Supabase Auth provider settings and local CLI secrets may also include:

```bash
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=provider_config
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=server_side_only
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=provider_config
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=server_side_only
SUPABASE_AUTH_EXTERNAL_APPLE_REDIRECT_URI=http://127.0.0.1:54321/auth/v1/callback
SUPABASE_ACCESS_TOKEN=server_side_only_for_management_api_automation
```

Never put the `service_role` key, Supabase secret keys, Supabase Management API access tokens, OAuth client secrets, Apple private keys/client secrets, payment secrets, webhook secrets, or calendar secrets in browser-delivered files.

## Owner Bootstrap

Create the owner in Supabase Auth first, then insert the matching Project Neo profile with a service-role SQL connection or the Supabase SQL editor:

```sql
insert into public.users (id, role, full_name, email)
values ('AUTH_USER_ID_HERE', 'owner', 'DJ Too Kold', 'admin@example.com');
```

For additional admin users, create the Auth user and insert a `public.users` row with `role` set to `admin`. Staff, DJ, and client rows should not receive admin dashboard access.

## RLS Model

All exposed `public` tables have RLS enabled.

- Anonymous users can only submit new booking inquiries and contact messages.
- Anonymous users can only read active services/packages and published media/mixes.
- `owner` and `admin` can manage operational records through the admin policies and Edge Function.
- `owner` and `admin` can manage Project Neo user roles.
- Clients can only read records connected to their own `clients.portal_user_id`.
- Future clients can add or edit song requests only for their own events while the request status is still `requested`.
- Event notes default to private. Portal clients can only read notes where `is_private = false`, and can only update note bodies through the portal API when `client_editable = true`.
- Staff/DJ assigned-event access should be added with explicit assignment tables and policies later, not by broad dashboard access.

Role helper functions live in the private schema as security-definer functions. They are not placed in the exposed `public` schema.

## Security Assumptions

- Supabase Auth is the source of identity truth.
- Authorization roles live in `public.users`, not user-editable `user_metadata`.
- The browser uses only the Supabase publishable key.
- The Edge Function is the only place that uses `SUPABASE_SERVICE_ROLE_KEY`.
- Payment records store processor IDs and state only. Card numbers, PAN values, CVC/CVV, and expiration values are rejected.
- Removing admin access should set `is_active = false` or change the role, then force sign-out/revoke sessions where strict immediate lockout is required.
- Short JWT lifetimes and MFA for `owner` and `admin` accounts are recommended before live financial or contract workflows.

## Notes for Other Engineers

Mission Control:

- Treat `/admin/me` as the dashboard gate. Do not render sensitive admin data until that check passes.
- Staff/DJ dashboard features need an assignment model before they are exposed.
- Keep passkey management inside authenticated settings.

Gatekeeper:

- Own the auth behavior, not the deployment config. Verify OAuth, password reset, email confirmation, return-path handling, passkey fallback states, and last-admin recovery flows.
- Keep `returnTo` same-origin and do not accept absolute external redirects from query strings.
- Use `auth-callback.html` for OAuth/session exchange and `auth-reset-password.html` for password recovery unless the deployment guide is updated.
- Do not use user-editable metadata for role decisions.
- Accept successful OAuth token exchanges by 2xx status, not only `201`.

Shield:

- Confirm RLS policies continue to deny clients from other clients' events, invoices, contracts, payments, notes, and song requests.
- Review Supabase Auth provider settings, redirect URLs, JWT lifetime, MFA posture, session revocation procedures, broad wildcard usage, OAuth scopes, provider secret storage, and passkey recovery procedures before launch.
- Re-check Supabase passkey API method names before any SDK upgrade because passkeys are currently isolated as an experimental surface.

Launchpad:

- Configure Supabase Site URL and redirect URLs for every deployed domain and preview domain that needs auth.
- Set only publishable Supabase values in static hosting config.
- Keep OAuth and Apple secrets in Supabase Auth provider settings and server-only deployment environments.

## References

- Supabase Auth redirect URLs: <https://supabase.com/docs/guides/auth/redirect-urls>
- Supabase Google OAuth setup: <https://supabase.com/docs/guides/auth/social-login/auth-google>
- Supabase Apple OAuth setup: <https://supabase.com/docs/guides/auth/social-login/auth-apple>
- Supabase JavaScript passkey API: <https://supabase.com/docs/reference/javascript/auth-passkey-api>
- Supabase local config and secrets: <https://supabase.com/docs/guides/local-development/managing-config>
- Supabase CLI auth config reference: <https://supabase.com/docs/guides/local-development/cli/config>
- Supabase OAuth token endpoint breaking change: <https://supabase.com/changelog/45468-breaking-change-oauth-token-endpoint-will-return-http-200-instead-of-201>
- MDN passkeys overview: <https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys>
- web.dev passkey registration support notes: <https://web.dev/articles/passkey-registration>
