# Agent Collaboration and Handoff Rules

Agents do not work in isolation. Each agent must leave clear handoff notes when their work affects another engineer.

Required handoff folder:
- `docs/agent-handoffs/`

When an agent completes meaningful work, they must create or update a handoff note using this format:

- From:
- To:
- Date:
- Related Version:
- Summary
- Files Changed
- Decisions Made
- Important Notes
- What the Next Agent Should Do
- Blockers or Risks
- Questions for the Next Agent

Rules:
- If the work affects another agent, write a handoff note.
- If database changes are made, notify Backend Engineer, Admin Dashboard Engineer, Booking Systems Engineer, Security Engineer, and DevOps Engineer as needed.
- If authentication changes are made, notify Admin Dashboard Engineer, Security Engineer, and DevOps Engineer.
- If UI components are changed, notify Frontend Engineer and QA Test Engineer.
- If deployment settings are changed, notify DevOps Engineer and Security Engineer.
- If a task is outside the current agent's role, leave a note instead of building it directly.
- Update `CHANGELOG.md` when meaningful work is completed.
