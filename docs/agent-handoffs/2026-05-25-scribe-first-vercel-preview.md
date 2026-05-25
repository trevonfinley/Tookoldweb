# Agent Handoff - First Vercel Preview Documentation

- From: Scribe, Documentation Engineer
- To: Bug Hunter, Shield, Launchpad
- Date: 2026-05-25
- Related Version: v0.8.0 — First Web Preview

## Summary

Documented the first successful Vercel web preview deployment as `v0.8.0 — First Web Preview`. This is a preview/beta milestone for review, not the official `v1.0.0` MVP launch.

## Files Changed

- `CHANGELOG.md`
- `VERSION.md`
- `docs/versions/v0.8.0.md`
- `docs/deployment-notes.md`
- `docs/agent-handoffs/2026-05-25-scribe-first-vercel-preview.md`

## Decisions Made

- Use `v0.8.0 — First Web Preview` for the first successful Vercel deployment milestone.
- Keep `v1.0.0` reserved for the official MVP launch.
- Record the Vercel preview URL as pending owner input instead of inventing a URL.
- Record the deployed branch as pending owner input until Launchpad confirms it.
- Confirm Square integration remains deferred.
- Keep SOC 2 Type II and PCI-DSS wording limited to readiness/alignment goals, not official compliance claims.

## Important Notes

- No application feature code was changed.
- No secrets, tokens, API keys, Square credentials, or Supabase service role keys were added.
- The current documentation branch while writing this note was `codex-project-neo-deployment-workflow`.
- The preview still needs QA and security review before any broader release announcement.

## What the Next Agent Should Do

- Bug Hunter: smoke test the Vercel preview URL once supplied, including public pages, booking inquiry flow, availability checker messaging, and basic admin/client access boundaries.
- Shield: review preview deployment settings, secret handling, auth redirect assumptions, and compliance wording before any launch announcement.
- Launchpad: confirm the Vercel preview URL, deployed branch, commit, deploy ID, deploy timestamp, and whether preview deployment protection is enabled.

## Blockers or Risks

- Vercel preview URL is confirmed as `https://tookoldweb-m356lthl3-trevonfinleys-projects.vercel.app`.
- Deployed branch is `codex-project-neo-deployment-workflow`.
- Preview deploy ID is `dpl_FFk28yhY1uCVaqZwVriF7U1c6AFE`.
- Preview commit is `8517bbb5b00ad4fc61c802d4ca29f09f3025a7d0`.
- Preview deploy timestamp is `2026-05-25T22:28:40.073Z`.
- Production launch is in progress and must be re-verified after public Vercel env config is applied.
- No QA smoke-test results are documented yet for this preview URL.
- No security review outcome is documented yet for this preview deployment.

## Questions for the Next Agent

- Did the production Vercel deployment complete after public env config was applied?
- Is preview deployment protection enabled for admin and client portal review pages?
