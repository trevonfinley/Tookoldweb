# Agent Handoff - Agent Collaboration Rules

- From: Neo Prime, Lead Software Architect
- To: All Project Neo engineering agents
- Date: 2026-05-24
- Related Version: 0.1.0

## Summary

Created the shared agent collaboration rules so Project Neo agents have one place to understand handoff expectations, notification rules, and cross-role boundaries.

## Files Changed

- `agents.md`
- `docs/agent-handoffs/2026-05-24-neo-prime-agent-collaboration.md`
- `CHANGELOG.md`

## Decisions Made

- Use `docs/agent-handoffs/` as the required folder for agent handoff notes.
- Require a handoff note when meaningful work affects another agent.
- Require changelog updates when meaningful work is completed.
- Keep agents inside their assigned role scope and use notes instead of building outside their lane.

## Important Notes

- No feature code, database schema, authentication logic, UI components, or deployment settings were changed.
- This change affects all future agents because it defines collaboration behavior.

## What the Next Agent Should Do

- Read `agents.md` before starting work.
- Add or update a handoff note when their work affects another agent.
- Update `CHANGELOG.md` for meaningful work.

## Blockers or Risks

- None.

## Questions for the Next Agent

- Should the project also add an uppercase `AGENTS.md` if future tooling expects that exact filename?
