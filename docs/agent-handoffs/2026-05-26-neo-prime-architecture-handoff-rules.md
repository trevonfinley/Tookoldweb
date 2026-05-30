# Agent Handoff - Architecture Handoff Rules

## Agent Name

Neo Prime

## Agent Role

Lead Software Architect

## Date

2026-05-26

## Task Summary

Added architecture-specific handoff requirements to `agents.md` so architecture, routing, folder structure, app strategy, and major technical decisions always notify the correct Project Neo agents.

## Files Created

- `docs/agent-handoffs/2026-05-26-neo-prime-architecture-handoff-rules.md`

## Files Modified

- `agents.md`
- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted, if any

- None

## Key Decisions Made

- Neo Prime must create handoff notes when architecture, routing, folder structure, app strategy, or major technical decisions affect another agent.
- The always-notify list is Data Knox, Stack Mason, Pixel Frost, Mission Control, Launchpad, Scribe, and Shield, with the impact area documented for each.
- Architecture handoffs must explicitly include architecture changes, folder/file structure changes, new conventions, affected modules, risks, and the recommended next agent.

## Data/API/Schema Changes

- None

## Environment Variable Changes

- None

## Security/Compliance Impact

- No secrets, tokens, API keys, passwords, or private credentials were documented.
- Shield is now an always-notify agent for security impact in architecture handoffs.

## Agents That Need This Update

- Data Knox
- Stack Mason
- Pixel Frost
- Mission Control
- Launchpad
- Scribe
- Shield

## Required Follow-Up Tasks

- Future Neo Prime tasks must apply the architecture handoff requirements when relevant.
- Scribe should preserve this convention in future documentation/versioning updates.

## Risks or Blockers

- Risk: agents may miss cross-role impact if handoff notes omit the architecture-specific fields.
- Blockers: none.

## Testing Performed

- Documentation diff validation with `git diff --check`.
- Reviewed updated files to confirm no secrets or private credentials were included.

## Suggested Next Agent

Scribe

## Architecture Changes

- Added a process-level architecture handoff rule to `agents.md`.
- No application architecture was changed.

## Folder/File Structure Changes

- Added one handoff note under `docs/agent-handoffs/`.
- No app folders or runtime structure were changed.

## New Conventions

- Neo Prime architecture handoffs must include architecture changes, folder/file structure changes, new conventions, affected modules, risks, and recommended next agent.
- Neo Prime must always notify Data Knox, Stack Mason, Pixel Frost, Mission Control, Launchpad, Scribe, and Shield when their domains are affected.

## Affected Modules

- Agent process documentation
- Project handoff workflow
- Documentation/versioning workflow

## Risks

- The convention only works if future agents keep handoff notes current.

## Recommended Next Agent

Scribe
