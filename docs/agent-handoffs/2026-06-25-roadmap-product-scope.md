# Agent Handoff - Roadmap Product Scope

## Agent Name

Roadmap

## Agent Role

Product Manager for Project Neo

## Date

2026-06-25

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Created the first dedicated Project Neo product roadmap document to define Phase 1 MVP scope, Phase 2 scope, deferred future ideas, user stories, acceptance criteria, success criteria, agent dependencies, and product decisions. This is a documentation-only product-scope update; no feature was claimed complete and no app behavior was changed.

## Files Created

- `docs/PROJECT_NEO_ROADMAP.md`
- `docs/agent-handoffs/2026-06-25-roadmap-product-scope.md`

## Files Modified

- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Phase 1 remains the money-path MVP: public website, booking inquiry, public-safe availability estimate, protected admin review, and manual quote/invoice/deposit tracking.
- Phase 2 is reserved for operational follow-through after Phase 1 gates are stable.
- Square/payment automation, Google Calendar sync, contracts, full client portal launch, and company-expansion tooling remain deferred.
- Roadmap status must not be used to claim official launch, SOC 2 Type II compliance, PCI-DSS compliance, or feature completion without owner approval and QA evidence.

## Architecture Changes

- None. This update defines product scope only.

## Folder/File Structure Changes

- Added `docs/PROJECT_NEO_ROADMAP.md` as the dedicated roadmap/product-scope source.

## New Conventions

- Product-scope decisions should be captured in `docs/PROJECT_NEO_ROADMAP.md` when they affect MVP, Phase 2, future scope, or launch claims.

## Affected Modules

- Documentation only.

## Data/API/Schema Changes

- None.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Reaffirmed privacy boundaries for availability, admin, client, invoice, payment, and portal data.
- Reaffirmed that Project Neo must not claim official SOC 2 Type II compliance or PCI-DSS compliance without external validation.
- Reaffirmed that payment automation stays deferred and that no raw cardholder data should be stored.

## Agents That Need This Update

- Neo Prime
- Data Knox
- Stack Mason
- Booker
- Mission Control
- Sync
- Cold Copy
- Shield
- Bug Hunter
- Scribe
- Ledger
- Gatekeeper
- Launchpad
- Concierge

## Required Follow-Up Tasks

- Scribe should use `docs/PROJECT_NEO_ROADMAP.md` as the product-scope reference when updating release notes or roadmap-facing documentation.
- Neo Prime should review any future architecture-impacting roadmap changes before implementation.
- Booker, Mission Control, Stack Mason, Data Knox, Sync, Ledger, Gatekeeper, Shield, Launchpad, and Bug Hunter should keep Phase 1 work inside the documented money-path MVP unless the owner approves a scope change.
- Bug Hunter and Shield should continue treating staging access, official staging deployment evidence, deployed privacy checks, and authenticated-session evidence as launch-gate blockers.

## Risks or Blockers

- The roadmap is documentation-only and does not resolve existing QA/deployment blockers.
- Approved staging access, official `staging` deployment evidence, deployed 404/admin/private-data checks, and authenticated owner/client session evidence remain required before completion or launch claims.
- Deferred items may create scope creep if agents start implementation without owner approval.

## Testing Performed

- Documentation-only change; no application tests were run.
- Reviewed current roadmap-adjacent documentation, launch-readiness notes, agent status, changelog, and handoff template before writing.

## Suggested Next Agent

Scribe, then Neo Prime if roadmap decisions need release-gate or architecture review.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
