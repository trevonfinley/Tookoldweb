# Agent Handoff - Event Prep Checklist Product Brief

## Agent Name

Roadmap

## Agent Role

Product Manager for Project Neo

## Date

2026-06-25

## Related Branch

`codex-project-neo-deployment-workflow`

## Task Summary

Defined the Event Prep Checklist feature for Project Neo as a product-planning artifact. The brief sets MVP scope, Phase 1 vs later scope, user stories, acceptance criteria, existing data sources, manually editable checklist data, admin-only privacy boundaries, and affected-agent handoffs. This is a documentation-only update; no application code, schema, API, payment, contract, or calendar behavior was changed.

## Files Created

- `docs/PROJECT_NEO_EVENT_PREP_CHECKLIST.md`
- `docs/agent-handoffs/2026-06-25-roadmap-event-prep-checklist.md`

## Files Modified

- `CHANGELOG.md`
- `docs/PROJECT_NEO_ROADMAP.md`
- `docs/agent-status.md`

## Files Deleted

- None.

## Key Decisions Made

- Event Prep Checklist is planned as a Phase 2 operational follow-through feature, not a new First Web Preview launch requirement unless Neo Prime and the owner approve a scope change.
- MVP should give owner/admin users one private event-connected checklist for venue, load-in, parking, contacts, timeline, music, production needs, balance/contract/final confirmation, and internal notes.
- Checklist completion state and manually editable prep fields should be admin-only and should not appear on public pages or client portal responses.
- Deposit and balance visibility should use existing invoice/payment tracking snapshots only; this feature must not activate Square or payment processing.
- Contract status can be displayed when records exist, but contract automation/e-signature remains later scope.
- Completion cannot be claimed until Bug Hunter verifies implemented behavior and Shield verifies privacy boundaries.

## Architecture Changes

- None. Product scope only.

## Folder/File Structure Changes

- Added `docs/PROJECT_NEO_EVENT_PREP_CHECKLIST.md` as the feature brief.

## New Conventions

- Event prep values should distinguish sourced data from checklist-specific manual prep data.
- Event Prep Checklist content is admin-only by default.

## Affected Modules

- Future admin event detail/prep checklist surface.
- Future protected admin event/checklist API surface.
- Future event/client/booking/invoice/contract/song-request data reads.
- Documentation only in this task.

## Data/API/Schema Changes

- None in this task.
- Future implementation likely needs Data Knox and Stack Mason review for checklist completion state, manually editable prep fields, and protected admin reads/writes.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Reaffirmed that checklist details, internal notes, client contact details, load-in/access details, invoice/payment context, balance due, contract status, and checklist completion state are private/admin-only.
- Reaffirmed that the feature must not expose private notes publicly or through client portal responses.
- Reaffirmed that Square/payment processing remains inactive and no official SOC 2 Type II or PCI-DSS compliance claim is made.

## Agents That Need This Update

- Data Knox
- Mission Control
- Booker
- Stack Mason
- Sync
- Shield
- Bug Hunter
- Scribe
- Ledger
- Gatekeeper
- Concierge
- Neo Prime

## Required Follow-Up Tasks

- Data Knox should determine the eventual schema approach for checklist completion state and manually editable prep fields.
- Mission Control should design the admin checklist view and section hierarchy when implementation is approved.
- Booker should confirm which booking inquiry fields should carry forward into event prep.
- Stack Mason should define protected admin API requirements if implementation is scheduled.
- Sync should review event timing, overnight events, and calendar/availability alignment.
- Shield should review admin-only privacy boundaries before implementation is marked ready.
- Bug Hunter should verify desktop, tablet, mobile usability, empty states, and no public/private-data leakage after implementation.
- Scribe should keep roadmap and release notes aligned with the planned/deferred status.

## Risks or Blockers

- Existing event, contract, invoice, payment, and song-request data may not fully cover all checklist sections without future schema/API work.
- Client portal exposure is explicitly out of scope; accidental reuse of checklist data in portal responses would be a privacy risk.
- Payment and contract readiness must stay status/tracking-only until Ledger, Shield, Launchpad, and the owner activate provider/contract automation separately.
- Current staging, deployment, and authenticated-session blockers are not resolved by this planning update.

## Testing Performed

- Documentation-only change; no application tests were run.
- Reviewed current roadmap, handoff template, agent status, changelog, and existing MVP data notes before writing the brief.

## Suggested Next Agent

Data Knox, then Mission Control after Neo Prime/owner approval to schedule implementation.

## Safety Reminder

Do not include secrets, API keys, tokens, passwords, private credentials, private client details, or unverified claims in handoff notes.
