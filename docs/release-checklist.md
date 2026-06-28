# Project Neo Release Checklist

Last Updated: 2026-06-22

Owner: Launchpad, Project Neo DevOps and Deployment Engineer

This checklist operationalizes the official Project Neo release flow:

```txt
feature/* -> dev -> staging -> main
```

Use this checklist for release promotion. Do not mark Project Neo officially launched, SOC 2 Type II compliant, or PCI-DSS compliant from this checklist alone.

2026-06-22 Launchpad promotion-readiness note: Project Neo is not eligible for staging sign-off or production promotion from the final QA cycle because `BH-QA-20260608-01` and `BH-QA-20260608-02` remain High release-gate blockers. The next eligible target is an official protected `staging` branch Preview Deployment after approved QA access and deployment metadata are recorded.

## Branch And Environment Map

| Branch | Environment | Vercel target | Supabase target |
| --- | --- | --- | --- |
| `feature/*` | Feature development | Temporary Preview | `project-neo-dev` or local/dev Supabase |
| `dev` | Development integration | Development/integration Preview | `project-neo-dev` |
| `staging` | Pre-production QA | Staging Preview | `project-neo-staging` |
| `main` | Production | Production Deployment | `project-neo-prod` |

If the recommended Supabase projects do not exist yet, treat them as required setup follow-up. Do not pretend dev/staging/prod isolation is complete until Data Knox, Stack Mason, Gatekeeper, Shield, and Launchpad verify it.

## Feature Branch Checklist

Before merging `feature/*` into `dev`:

- [ ] Branch was created from `dev` using `feature/agent-name-task-name`.
- [ ] Work stayed within the agent's role and task scope.
- [ ] App builds locally or the build blocker is documented.
- [ ] Relevant focused smoke test was run.
- [ ] No obvious broken routes were introduced.
- [ ] No real secrets, tokens, API keys, passwords, or private credentials were committed.
- [ ] `.env.example` remains placeholder-only if touched.
- [ ] `CHANGELOG.md` is updated under `[Unreleased]` for meaningful work.
- [ ] Handoff note exists in `docs/agent-handoffs/`.
- [ ] Affected agents are named in the handoff note.

## Pre-Staging Checklist

Before promoting `dev` to `staging`:

- [ ] `npm run build` passes.
- [ ] `npm run validate` passes.
- [ ] Basic smoke test passes.
- [ ] No obvious broken public routes.
- [ ] No obvious broken admin/auth/client route shells.
- [ ] No secrets are committed.
- [ ] Handoff notes are completed.
- [ ] `CHANGELOG.md` is updated under `[Unreleased]`.
- [ ] Environment variables are documented.
- [ ] Vercel Preview variables for `staging` are present and staging-safe.
- [ ] Official `staging` branch Preview Deployment URL and deployment ID are identified.
- [ ] Approved protected-preview QA access is granted through Vercel Authentication, Trusted Sources, or another owner-approved controlled method.
- [ ] Staging does not use production Supabase secrets.
- [ ] Staging does not use production payment, OAuth, Apple, webhook, or calendar secrets.

## Pre-Production Checklist

Before promoting `staging` to `main`:

- [ ] Bug Hunter QA review completed on staging.
- [ ] Shield security review completed on staging.
- [ ] Launchpad deployment review completed.
- [ ] Scribe release/version notes updated.
- [ ] Neo Prime approves promotion or records explicit owner-approved deferrals.
- [ ] No critical bugs are open.
- [ ] No secrets are exposed.
- [ ] Admin/private routes are reviewed.
- [ ] Public pages are tested on desktop.
- [ ] Public pages are tested on mobile.
- [ ] Booking page loads.
- [ ] Contact page loads.
- [ ] Availability checker works if enabled.
- [ ] Admin route behavior is protected or explicitly marked as not production-ready.
- [ ] Client portal remains hidden/private beta unless Concierge, Gatekeeper, Shield, Bug Hunter, and Neo Prime approve launch.
- [ ] Bug Hunter staging QA used the official `staging` branch Preview Deployment, not a feature-branch preview.
- [ ] No preview/staging bypass tokens, private access links, or private access credentials are committed or documented.
- [ ] Production environment variables are assigned only to Vercel Production.
- [ ] `vercel.json` does not hardcode production public runtime values that would apply to Preview deployments.
- [ ] Production Supabase project is selected intentionally.
- [ ] GitHub branch protection/rulesets are active for `main` and `staging`, or an owner-approved bypass is documented.
- [ ] Rollback target is identified.
- [ ] `docs/deployment-notes.md` is ready to record deployment ID, commit, timestamp, and rollback target.

## Production Deployment Steps

1. Confirm `staging` is release-ready.
2. Merge `staging` into `main` through GitHub review or owner-approved release action.
3. Let Vercel deploy `main` to Production.
4. Record:
   - production deployment ID
   - release commit
   - production URL
   - promotion timestamp
   - rollback target
5. Update `docs/deployment-notes.md`.
6. Update `CHANGELOG.md` if deployment status changed.
7. Create or update the Launchpad handoff note.

## Post-Deployment Verification

After production deploy:

- [ ] Homepage loads.
- [ ] Official DJ Too Kold logo loads.
- [ ] Navbar works.
- [ ] Mobile layout works.
- [ ] Booking page loads.
- [ ] Availability checker works if enabled.
- [ ] Contact page loads.
- [ ] Admin routes are protected or clearly marked as non-production if auth is not complete.
- [ ] Client portal remains hidden/private beta if deferred.
- [ ] No private data is exposed.
- [ ] No console errors break core functionality.
- [ ] `robots.txt` and noindex headers protect admin/auth/client route shells.
- [ ] Speed Insights/private telemetry posture matches Shield/Launchpad decision.
- [ ] Production Supabase API health check passes.
- [ ] Booking/contact writes are verified only with approved QA data.
- [ ] Deployment notes are updated.
- [ ] Affected-agent handoff is complete.

## Preview/Staging QA Access Checklist

Before asking Bug Hunter or Shield to retest a protected Vercel Preview:

- [ ] Confirm the deployment is from the intended branch.
- [ ] Confirm `staging` QA uses a `staging` branch Preview Deployment.
- [ ] Confirm Vercel Authentication, Trusted Sources, or owner-approved controlled access is available to the tester.
- [ ] Confirm no bypass token, credential, private access link, or one-time secret is written into docs or issue trackers.
- [ ] Confirm preview/staging remains protected unless Launchpad, Gatekeeper, Shield, Neo Prime, and the owner approve a public access change.
- [ ] Record the tested deployment ID, branch, and URL in `docs/deployment-notes.md`.
- [ ] Confirm Bug Hunter marks Ready for Retest items Resolved only after deployed staging evidence exists.

## Deployment-Impacting Change Rules

If a change affects deployment, environment variables, hosting settings, build settings, branch strategy, Vercel settings, Supabase environment usage, or production behavior, Launchpad must create a handoff note for:

- Neo Prime
- Scribe
- Shield
- Bug Hunter
- Gatekeeper if auth/redirects are affected
- Stack Mason if backend/API deployment behavior is affected
- Data Knox if database/Supabase environment usage is affected
- Booker if booking/availability behavior is affected
- Mission Control if admin deployment behavior is affected

Handoff notes must not include secrets, tokens, API keys, passwords, or private credentials.
