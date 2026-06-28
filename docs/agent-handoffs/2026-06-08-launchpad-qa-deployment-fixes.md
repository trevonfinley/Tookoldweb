# Agent Handoff - QA Deployment Fixes

## Agent Name

Launchpad

## Agent Role

DevOps and Deployment Engineer for Project Neo

## Date

2026-06-08

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Reviewed Bug Hunter's QA tracker and the latest Bug Hunter/Shield handoffs for Launchpad-owned deployment, Vercel, environment, release workflow, and rollback/configuration issues. Completed the Launchpad-owned documentation/config fixes for protected-preview QA access, official staging-preview requirements, env-file hygiene verification, and local deploy-output dotfile cleanup. Did not modify unrelated application features or implement Square.

## Files Created

- `docs/agent-handoffs/2026-06-08-launchpad-qa-deployment-fixes.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`
- `docs/deployment-notes.md`
- `docs/environments.md`
- `docs/qa/bug-tracker.md`
- `docs/release-checklist.md`
- `scripts/build-site.mjs`

## Files Deleted

- None.

## Key Decisions Made

- Kept preview/staging access protected; do not make preview or staging public just to unblock QA unless Launchpad, Gatekeeper, Shield, Neo Prime, and the owner explicitly approve.
- Documented approved QA access options as Vercel Authentication, Trusted Sources, or another owner-approved controlled access method.
- Avoided documenting bypass tokens, private access links, credentials, or one-time secrets.
- Defined the official staging QA target as a Vercel Preview Deployment from the `staging` branch; the current known READY preview from `codex-project-neo-deployment-workflow` is not confirmed staging.
- Fixed local deploy-output hygiene by skipping dotfiles during static asset copying.
- Left admin clean-route redirect implementation to Gatekeeper/Mission Control and branded 404 implementation to Pixel Frost.

## Architecture Changes

- None. Project Neo remains a static HTML/CSS/JS site on Vercel with Supabase-backed APIs/Auth.

## Folder/File Structure Changes

- Added one Launchpad handoff note in `docs/agent-handoffs/`.

## New Conventions

- Preview/staging QA must record deployment ID, branch, URL, and approved access method without recording private access material.
- Local static build asset copying now ignores dotfiles.

## Affected Modules

- Static build packaging: `scripts/build-site.mjs`
- Deployment documentation: `docs/deployment-notes.md`
- Environment/release workflow documentation: `docs/environments.md`, `docs/release-checklist.md`
- QA tracking/status documentation: `docs/qa/bug-tracker.md`, `docs/agent-status.md`, `CHANGELOG.md`

## Data/API/Schema Changes

- None.

## Environment Variable Changes

- No environment variables were added, removed, or changed.
- `.gitignore` was verified to exclude `.env`, `.env.*`, and Supabase function `.env` files.
- `.env.example` was verified as placeholder-only.
- Server-only secrets remain server-side only; no real credentials were added.

## Security/Compliance Impact

- Strengthened deploy hygiene by preventing local OS metadata dotfiles from being copied into deploy output.
- Preserved protected-preview/staging posture and avoided publicizing previews just for QA.
- Reaffirmed that service-role keys, payment secrets, OAuth secrets, Apple private keys, webhook secrets, and calendar secrets must not be committed or placed in browser code.
- Square remains deferred.
- No official SOC 2 Type II or PCI-DSS compliance claim was made.

## Agents That Need This Update

- Bug Hunter
- Scribe
- Shield
- Gatekeeper
- Mission Control
- Pixel Frost
- Neo Prime

## Required Follow-Up Tasks

- Owner/Gatekeeper: grant Bug Hunter and Shield approved protected-preview access through Vercel Authentication, Trusted Sources, or another controlled access method.
- Launchpad/Scribe/Neo Prime: create or identify the official `staging` branch Preview Deployment URL and deployment ID, then record it in `docs/deployment-notes.md`.
- Bug Hunter: retest `BH-QA-20260608-01`, `BH-QA-20260608-02`, and `BH-QA-20260608-06` after access/staging deployment is available.
- Gatekeeper/Mission Control: fix and verify clean admin-dashboard logged-out redirects.
- Pixel Frost: add a branded static 404 page.
- Launchpad: verify Vercel unknown-route behavior after Pixel Frost adds `404.html`.

## Risks or Blockers

- Deployed staging QA remains blocked until approved access is granted and an official `staging` branch preview exists.
- `BH-QA-20260608-03` and `BH-QA-20260608-05` are not fixed by this Launchpad pass because their implementation work belongs to Gatekeeper/Mission Control and Pixel Frost.
- Vercel project settings and protected access grants may require owner dashboard access.

## Testing Performed

- `npm run build` passed.
- `npm run validate` passed.
- `find dist -name '.*' -print` returned no dotfiles.
- `git check-ignore -v .env .env.local .env.production .env.staging supabase/functions/.env` confirmed real env files are ignored.
- Reviewed `.env.example` for placeholders only; no real secrets were found.

## Suggested Next Agent

Bug Hunter, after Owner/Gatekeeper provide approved protected-preview access and Launchpad/Scribe/Neo Prime record the official `staging` preview.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
