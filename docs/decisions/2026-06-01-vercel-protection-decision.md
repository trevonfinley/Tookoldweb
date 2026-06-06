# Decision Record - Vercel Protection Decision

Date: 2026-06-01

Status: Accepted

Related Version: Unreleased official-launch gate

## Context

Project Neo is currently a static Vercel-hosted site backed by Supabase Auth, a Supabase Edge Function API, and Postgres RLS. Public marketing, booking, contact, availability, media, mixes, and service-package routes need to stay reachable without a Vercel authentication interstitial so visitors can submit inquiries.

The admin, auth, and client portal pages are static shells. They can be guessed on the public host, but they must not render protected records before a valid Supabase session and a successful protected API authorization check. The protected data boundary is the Supabase session, the `project-neo-api` route authorization checks, and database RLS.

## Decision

Project Neo will not enable global Vercel Authentication or production Deployment Protection for the public production deployment during the MVP launch gate. Global production host protection would block public booking and contact conversion, so it is not acceptable for the current single static-site deployment.

Production admin, auth, and client portal static shells will remain publicly reachable but private-data safe:

- No public navigation links to admin pages.
- Client portal remains hidden/private beta until Concierge, Gatekeeper, and Bug Hunter verify approved client sessions.
- Admin, auth, and client portal routes stay `noindex,nofollow` through page metadata and static-host headers.
- Private telemetry stays excluded from admin, auth, and client portal pages.
- Protected data loads only through authenticated Supabase-backed API requests.
- Unauthorized admin and portal API requests must continue returning safe `401` responses without private records.

Preview and staging deployments should use Vercel Authentication or Deployment Protection where available because previews are not the public booking surface. Preview auth testing should use staging Supabase data unless a production-preview exception is explicitly approved.

If Project Neo later splits the admin app into a separate deployment, adopts a framework with middleware, or configures path-scoped host/firewall protection, Launchpad, Gatekeeper, and Shield should revisit host-level protection for admin and client routes.

## Requirements

- Do not rely on `noindex` or hidden navigation as an authorization boundary.
- Do not expose service-role keys, payment secrets, OAuth secrets, Apple private keys, webhook secrets, passwords, tokens, or private credentials through Vercel static config or documentation.
- Keep Supabase service-role and provider secrets server-side only.
- Keep all admin, invoice, payment, client, contract, event, and private-note records behind Supabase Auth, Edge Function authorization, and RLS.
- Keep production CORS and redirect allowlists exact to the approved launch domain when the final domain changes.
- Do not claim SOC 2 Type II compliance or PCI-DSS compliance from this decision; Project Neo remains readiness/alignment only until formal validation.

## Consequences

- The public production site remains reachable without a Vercel login wall.
- Static admin/auth/client shells may be reachable by URL, so every protected workflow must keep enforcing session and role checks before data is shown or modified.
- Bug Hunter and Shield should keep unauthenticated private-route and protected-API checks in the launch regression matrix.
- Gatekeeper still owns the approved production owner/admin and client session bootstrap needed for authenticated QA.
- Launchpad must revisit this decision if the hosting architecture changes or if the owner requires host-level protection for admin/client shells before launch.
