# Project Neo Deployment Notes

Last Updated: 2026-06-06

## Current Deployment Milestone

Project Neo is currently documented at `v0.8.0 — First Web Preview`.

This file records both the first Vercel preview milestone and the current official-launch deployment gate. Project Neo is not officially launched and must not be described as `v1.0.0` until the owner approves launch readiness.

## Official Launch Deployment Gate - 2026-06-06

Current decision: NO-GO for official public launch.

Neo Prime may declare GO only after all critical launch blockers pass or receive explicit owner-approved deferrals. As of 2026-06-06, this condition is not met.

Current production target:
- Public URL: `https://tookoldweb.vercel.app`
- Current production deploy ID: `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`
- Previous production deploy ID: `dpl_5QTuMWv2QYUKBqigZkpf6Zbq3m8c`
- Promoted clean preview source: `dpl_3jfap25hdwAVrHdH68Pd46UST6jJ`
- Release commit: `30bca54e7a6eddb20dba331884443801f4faf0f6`
- Promotion timestamp: 2026-06-03
- Rollback target: previous overnight booking fix deployment `dpl_5QTuMWv2QYUKBqigZkpf6Zbq3m8c`
- Production Supabase API URL: `https://wgbyyaeivtavecaszler.functions.supabase.co/project-neo-api`
- Supabase Edge Function status: `project-neo-api` full-route version 3 active
- Production schema status: applied and verified by Data Knox

Launch is still held because:
- Approved production admin/client sessions are still needed for authenticated success-path QA.
- Booker + Bug Hunter verified overnight booking behavior and public booking/contact writes on the current production deployment on 2026-06-06.
- The production owner identity is bootstrapped but still needs owner email confirmation, first sign-in, and approved owner-controlled session QA.
- Final host-level Vercel protection decision is recorded; final domain, final Shield/Bug Hunter security recheck, and final regression decisions remain open.

Before official launch, Launchpad must confirm the final domain decision, rollback target, private-page telemetry posture, and any later production deployment ID if another release supersedes `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`.

## Vercel Preview Record

- Host: Vercel
- Deployment type: Preview
- Vercel preview URL: `https://tookoldweb-m356lthl3-trevonfinleys-projects.vercel.app`
- Deployed branch: `codex-project-neo-deployment-workflow`
- Preview deploy ID: `dpl_FFk28yhY1uCVaqZwVriF7U1c6AFE`
- Preview commit: `8517bbb5b00ad4fc61c802d4ca29f09f3025a7d0`
- Preview deploy timestamp: `2026-05-25T22:28:40.073Z`
- Documentation branch at time of this note: `codex-project-neo-deployment-workflow`
- Deployment date recorded: 2026-05-25
- Deployment environment: Vercel Preview
- Production launch status: superseded by the official launch deployment gate above; current decision is NO-GO.

## Framework And Build Assumptions

- App shape: static HTML/CSS/JavaScript site
- Framework migration status: no Next.js migration for this preview
- Vercel framework preset: `Other`
- Build command: `npm run build`
- Output directory: `dist`
- Public/admin/client portal screens are served from static build output.
- Browser-safe runtime config is generated through the existing static build flow.

## Deployment Milestone Summary

- First successful Vercel web preview deployment is now recorded as `v0.8.0 — First Web Preview`.
- The deployment is intended for owner, engineering, QA, and security review.
- The preview should not be described as the official website launch.
- `v1.0.0` remains reserved for the official MVP launch.

## Security And Secrets Notes

- Do not store secrets, tokens, API keys, Supabase service role keys, or Square credentials in this file.
- Keep Supabase service role keys server-side only in Supabase Edge Function secrets.
- Keep Square access tokens and webhook secrets server-side only when Square work begins.
- Vercel should receive only browser-safe public config unless Project Neo later adds private Vercel server code.
- Final Vercel protection decision recorded 2026-06-01: production remains publicly reachable for MVP launch, while Supabase Auth, protected Edge Function routes, and RLS remain the data boundary for admin/client/private records. Preview deployments should stay protected by Vercel Authentication or Deployment Protection where available.

## Deferred Integrations

- Square integration remains deferred.
- Payments must remain hosted or tokenized when implemented.
- Project Neo must not store credit card numbers, CVV values, or raw cardholder data.

## Compliance Notes

Project Neo has SOC 2 Type II readiness and PCI-DSS alignment goals.

This deployment note does not claim official SOC 2 Type II compliance or PCI-DSS compliance. Official claims require the correct audit, assessment, controls, validation, and owner approval.

## Follow-Up Needed

- Bug Hunter and Shield should recheck full production after deployment `dpl_14DujRxbJBHLvyPrH9nHDVQfciUa`.
- Record final domain decision: continue with `https://tookoldweb.vercel.app` or configure a custom domain before launch.
- Verify the recorded host-level Vercel protection decision during final regression: production stays public, previews stay protected where available, and static admin/client shells expose no private data without authenticated API access.
- Record owner confirmation, first sign-in, approved admin-session QA, and any explicit client portal deferral before changing launch status.
- Record Bug Hunter final regression result after clean promotion and approved session QA.
- Record Shield final review notes for private-page telemetry, CORS, public availability hardening, route protection, and secrets handling.
