# Project Neo Deployment Notes

Last Updated: 2026-06-22

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

Neo Prime status refresh on 2026-06-06:
- Launch documentation was reviewed for the current production deployment posture.
- No deployment gate moved from blocked to passed in this pass.
- The launch decision remains NO-GO until all critical launch blockers pass or receive explicit owner-approved deferrals.

## Environment Pipeline Strategy - 2026-06-06

Neo Prime documented the official dev, staging, and production release strategy in `docs/environments.md`. Launchpad operationalized the strategy with the release checklist in `docs/release-checklist.md` and the rollback/hotfix plan in `docs/rollback-plan.md`.

Recommended release flow:

```txt
feature/* -> dev -> staging -> main
```

Branch and deployment mapping:
- `feature/*` branches are individual agent work branches and should receive temporary Vercel Preview Deployments using dev-safe config.
- `dev` is the integration branch and should receive a development/integration Preview Deployment.
- `staging` is the pre-production branch and should receive a stable staging Preview Deployment.
- `main` is the production/live branch and should be the only source for Vercel Production Deployments.

Recommended Supabase mapping:
- `project-neo-dev` for local/dev and feature testing.
- `project-neo-staging` for release candidate QA.
- `project-neo-prod` for live production data.

Environment decisions:
- Production secrets must not be used in dev or staging.
- Staging must not use production secrets.
- Development must not use production secrets.
- Square variables remain deferred placeholders unless payment work is explicitly activated later.
- SOC 2 Type II and PCI-DSS remain readiness/alignment goals, not official certification or compliance claims.

Launchpad should configure or verify the Vercel production branch as `main`, branch-scoped Preview environment variables for `dev` and `staging`, and rollback notes for every production release.

Manual Vercel owner setup required:
- Set the Vercel Production Branch to `main`.
- Keep the framework preset as `Other`.
- Keep the build command as `npm run build`.
- Keep the output directory as `dist`.
- Scope production variables to Production only.
- Scope staging variables to the `staging` Preview Deployment where branch-scoped variables are available.
- Scope dev/feature variables to Development/local and `dev`/`feature/*` Preview usage.
- Keep server-only secrets out of Vercel static hosting unless Project Neo later adds private Vercel server code.
- Keep preview/staging deployments behind Vercel Authentication or Deployment Protection where available.

## Preview/Staging QA Access Gate - 2026-06-08

Launchpad reviewed Bug Hunter's 2026-06-08 QA findings and Shield's security triage for deployment-owned blockers.

Current decision:
- Preview and staging deployments should remain protected with Vercel Authentication, Trusted Sources, or an equivalent owner-approved controlled access path.
- Do not make preview or staging public solely to unblock QA unless Launchpad, Gatekeeper, Shield, Neo Prime, and the owner explicitly approve that access posture.
- Do not write bypass tokens, private access links, credentials, or one-time secrets into repository docs, handoff notes, bug trackers, screenshots, or chat transcripts.

Current non-production deployment record from Bug Hunter QA:
- Latest READY non-production deployment tested by Bug Hunter: `dpl_HoiM6igEifGJZyWHY2y7euWxkoZ2`
- Branch: `codex-project-neo-deployment-workflow`
- Preview URL: `https://tookoldweb-hzdx4u3n8-trevonfinleys-projects.vercel.app`
- Status: protected by Vercel Authentication and not confirmed as the official `staging` branch preview.

Official staging requirement:
- The official staging QA target must be a Vercel Preview Deployment from the `staging` branch.
- The staging preview URL and deployment ID must be recorded here before staging sign-off.
- Bug Hunter should rerun deployed staging regression only after the `staging` branch preview exists and approved QA access is granted.

Launchpad retest notes:
- `.gitignore` excludes real environment files through `.env`, `.env.*`, and `!.env.example`.
- `.env.example` was reviewed on 2026-06-08 and remains placeholder-only.
- The static build now skips dotfiles in copied asset directories so local deploy output does not include `.DS_Store` or other dotfile metadata.
- Square remains deferred and was not implemented.

## Launchpad QA Recheck - 2026-06-13

Launchpad re-reviewed the QA tracker, Bug Hunter's preview/staging QA handoff, and Shield's 2026-06-13 security retriage for deployment-owned follow-up.

Current Launchpad status:
- `BH-QA-20260608-01`, `BH-QA-20260608-02`, `BH-QA-20260608-03`, `BH-QA-20260608-05`, and `BH-QA-20260608-06` are still documented as Ready for Retest where Launchpad has deployment/configuration responsibility.
- The latest READY non-production deployment remains documented as a protected preview from `codex-project-neo-deployment-workflow`, not an official `staging` branch preview.
- The official staging QA blocker remains external to repo docs: an official `staging` branch Preview Deployment URL/deployment ID must be created or identified in Vercel, and Bug Hunter/Shield need approved protected-preview access.
- Vercel settings remain documented as static site, framework preset `Other`, build command `npm run build`, output directory `dist`, clean URLs enabled, and trailing slashes disabled.
- Rollback and hotfix steps remain documented in `docs/rollback-plan.md`.
- `.gitignore` and `.env.example` were rechecked; real env files remain ignored and `.env.example` remains placeholder-only.
- No real credentials were added, no production credentials were used for dev/staging, and Square remains deferred.

## Final QA Cycle Deployment Gate - 2026-06-22

Bug Hunter completed Ready-for-Retest verification on 2026-06-21, and Shield completed post-retest security review on 2026-06-21.

Current deployment readiness:
- Preview-ready: limited protected/local preview review may continue.
- Staging-ready: no.
- Production-ready: no.

Deployment blockers still open:
- `BH-QA-20260608-01`: approved controlled preview/staging access for Bug Hunter and Shield is still missing.
- `BH-QA-20260608-02`: official READY `staging` branch preview URL and deployment ID are still missing or unrecorded.
- `BH-QA-20260608-05`: direct local `404.html` passes, but unknown-route fallback on the reviewed Vercel preview returned plain `NOT_FOUND`; Launchpad must confirm the branded 404 on the official staging deployment.
- Deployed admin redirects, private-data boundaries, public availability response privacy, public form/API response privacy, noindex/private-route behavior, and secret-boundary checks still require official staging evidence.

Do not promote this QA cycle to staging sign-off, production readiness, official launch, or `v1.0.0`. Project Neo remains `v0.8.0 — First Web Preview` until the owner approves a version change.

## Launchpad Promotion Readiness - 2026-06-22

Launchpad reviewed the final Bug Hunter retest results, Shield's post-retest security review, Scribe's final QA cycle summary, this deployment note, the release checklist, and the rollback plan.

Promotion readiness summary:
- Critical blockers: none reported in the final QA cycle.
- High blockers: still open. `BH-QA-20260608-01` and `BH-QA-20260608-02` remain High release-gate blockers.
- Scribe updated changelog/release tracking with the final QA cycle summary.
- Deployment notes are current and record the 2026-06-22 NO-GO deployment gate.
- Rollback and hotfix steps remain documented in `docs/rollback-plan.md`.
- No production promotion is approved or recommended from this state.

Target environment recommendation:
- Current target: hold in protected/local preview-reviewable state.
- Next eligible target: official `staging` branch Preview Deployment only after approved controlled QA access exists, the staging preview URL/deployment ID is recorded, and unknown-route branded 404 behavior can be verified on Vercel.
- Production target: not eligible. Do not merge to `main` or promote production without explicit owner approval after staging blockers pass or receive owner-approved deferrals.

Deployment checklist before staging promotion:
- Confirm `npm run build` passes.
- Confirm `npm run validate` passes.
- Confirm no real secrets are committed and `.env.example` remains placeholder-only.
- Confirm Vercel Preview variables for `staging` are staging-safe and do not use production secrets.
- Confirm the official `staging` branch Preview Deployment URL and deployment ID are recorded here.
- Confirm Bug Hunter and Shield have approved protected-preview access without documenting private access material.
- Confirm unknown routes on the Vercel staging preview serve the branded `404.html` page.
- Confirm Bug Hunter and Shield complete deployed staging retest of admin redirects, private-data boundaries, availability privacy, public form/API response privacy, noindex/private-route behavior, and secret exposure checks.

Rollback reminder:
- Use Vercel to redeploy or promote the last known good deployment for static-hosting regressions.
- Use `git revert` for bad commits instead of rewriting shared history.
- Document any rollback in `CHANGELOG.md`, `docs/deployment-notes.md`, and a handoff note.
- Do not include secrets, tokens, private access links, or credentials in rollback documentation.

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
