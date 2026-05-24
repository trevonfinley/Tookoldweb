# Project Neo Authentication and Access Control

Project Neo uses Supabase Auth for identity and a `public.users` profile row for Project Neo roles. The first production user should be the owner account for DJ Too Kold.

## Roles

| Role | Current access | Future intent |
| --- | --- | --- |
| `owner` | Full admin dashboard and user management. | Business owner account. Keep this role rare. |
| `admin` | Full admin dashboard and user management. | Trusted operational admins. |
| `staff` | Admin dashboard and operational records, but not user management. | Booking, event, billing, and task helpers. |
| `dj` | Reserved. No admin access by default. | Assigned event view, music planning, and limited task access. |
| `client` | Reserved in `users`; portal access is currently enforced through `clients.portal_user_id`. | Client portal profile, events, invoices, contracts, notes, and song requests. |

Admin access means `owner`, `admin`, or `staff` with `is_active = true`.

## Login Flow

1. Admin users sign in through `admin-login.html` with Supabase email/password auth.
2. The browser stores a normal Supabase Auth session using the public publishable key.
3. `admin-dashboard.html` checks for a Supabase session.
4. The dashboard calls `GET /admin/me` with `Authorization: Bearer <access_token>`.
5. The Edge Function verifies the token with Supabase Auth and checks `public.users`.
6. Non-admin, inactive, missing, or expired sessions are rejected before dashboard data is loaded.

The public site does not link to admin pages, and both admin HTML pages are marked `noindex,nofollow`. The security boundary is still the Supabase Auth token, the Edge Function role check, and Postgres RLS. Static HTML files can be guessed on a public static host, so production hosting should also block or isolate `/admin-*` paths when the host supports route protection.

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

## Supabase Auth Pattern

- Use Supabase email/password auth for the first owner/admin account.
- Keep Project Neo authorization in `public.users` so role changes are database-driven and easy to audit.
- Keep JWT claims small. If future UI needs role claims, add them through a Custom Access Token Auth Hook or trusted `app_metadata`, not user-editable metadata.
- Use a short JWT expiry and force sign-out/revoke sessions after removing admin access when immediate lockout matters.
- Add MFA for `owner` and `admin` accounts before storing live financial or contract workflows.

## Configuration

`project-neo-config.js` needs the deployed API URL and Supabase browser credentials:

```js
window.ProjectNeoConfig = {
  apiBaseUrl: "https://YOUR_PROJECT_REF.functions.supabase.co/project-neo-api",
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

Never put the `service_role` key or any secret key in this file.

## Owner Bootstrap

Create the owner in Supabase Auth first, then insert the matching Project Neo profile with a service-role SQL connection or the Supabase SQL editor:

```sql
insert into public.users (id, role, full_name, email)
values ('AUTH_USER_ID_HERE', 'owner', 'DJ Too Kold', 'admin@example.com');
```

For additional admin users, create the Auth user and insert a `public.users` row with `role` set to `admin` or `staff`.

## RLS Model

All exposed `public` tables have RLS enabled.

- Anonymous users can only submit new booking inquiries and contact messages.
- Anonymous users can only read active services/packages and published media/mixes.
- `owner`, `admin`, and `staff` can manage operational records.
- Only `owner` and `admin` can manage Project Neo user roles.
- Clients can only read records connected to their own `clients.portal_user_id`.
- Future clients can add or edit song requests only for their own events while the request status is still `requested`.
- Event notes default to private; portal clients can only read notes where `is_private = false`, and can only update note bodies through the portal API when `client_editable = true`.

Role helper functions live in the private schema as security-definer functions. They are not placed in the exposed `public` schema.

## Security Assumptions

- Supabase Auth is the source of identity truth.
- Authorization roles live in `public.users`, not user-editable `user_metadata`.
- The browser uses only the public Supabase publishable key.
- The Edge Function is the only place that uses `SUPABASE_SERVICE_ROLE_KEY`.
- Payment records store processor IDs and state only; card numbers, PAN values, CVC/CVV, and expiration values are rejected.
- Removing admin access should set `is_active = false` or change the role, then force sign-out/revoke sessions where strict immediate lockout is required.
