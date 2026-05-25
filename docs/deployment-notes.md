# Project Neo Deployment Notes

Last Updated: 2026-05-25

## Current Deployment Milestone

Project Neo is currently documented at `v0.8.0 — First Web Preview`.

This records the first successful Vercel web preview deployment. It is a preview/beta review milestone only and is not the official `v1.0.0` MVP launch.

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
- Production launch status: in progress; production build requires public Vercel env config before launch can be confirmed

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

## Deferred Integrations

- Square integration remains deferred.
- Payments must remain hosted or tokenized when implemented.
- Project Neo must not store credit card numbers, CVV values, or raw cardholder data.

## Compliance Notes

Project Neo has SOC 2 Type II readiness and PCI-DSS alignment goals.

This deployment note does not claim official SOC 2 Type II compliance or PCI-DSS compliance. Official claims require the correct audit, assessment, controls, validation, and owner approval.

## Follow-Up Needed

- Confirm the production deployment after the Vercel public env configuration fix is pushed.
- Record QA smoke-test results after Bug Hunter reviews the preview.
- Record security review notes after Shield reviews preview deployment settings, secrets handling, and compliance wording.
