# Agent Collaboration and Handoff Rules

Agents do not work in isolation. Each agent must leave clear handoff notes when their work affects another engineer.

## Agent Handoff and Change Notification Protocol

Every agent must create a handoff/update note after completing any meaningful task.

The goal is to keep all Project Neo agents aligned on:
- What changed
- Why it changed
- Which files were changed
- Which agents are affected
- What the next agent needs to know
- What risks, blockers, or follow-up tasks exist

Required handoff folder:
- `docs/agent-handoffs/`

Required handoff template:
- `docs/agent-handoffs/HANDOFF_TEMPLATE.md`

Required format:
- File name format:
  - `YYYY-MM-DD-agent-name-task-summary.md`
  - Example: `2026-05-25-stack-mason-availability-api.md`
- Start from `docs/agent-handoffs/HANDOFF_TEMPLATE.md` when creating a new handoff note.

Every handoff note must include:
1. Agent Name
2. Agent Role
3. Date
4. Task Summary
5. Files Created
6. Files Modified
7. Files Deleted
8. Key Decisions Made
9. Data/API/Schema Changes
10. Environment Variable Changes
11. Security/Compliance Impact
12. Agents That Need This Update
13. Required Follow-Up Tasks
14. Risks or Blockers
15. Testing Performed
16. Suggested Next Agent

Rules:
- If backend/API behavior changes, notify Stack Mason, Booker, Mission Control, Data Knox, Shield, Bug Hunter, and Scribe as needed.
- If database/schema changes, notify Data Knox, Stack Mason, Booker, Mission Control, Shield, and Scribe.
- If UI/components change, notify Pixel Frost, Style Guide, Access, Booker, Mission Control, Bug Hunter, and Scribe as needed.
- If authentication changes, notify Gatekeeper, Mission Control, Concierge, Shield, Launchpad, Data Knox, Bug Hunter, and Scribe.
- If payments/invoices change, notify Ledger, Data Knox, Mission Control, Shield, Launchpad, Bug Hunter, and Scribe.
- If deployment/env/config changes, notify Launchpad, Shield, Scribe, and any affected feature owner.
- If documentation/versioning changes, notify Scribe and any affected agent.
- If security/compliance changes, notify Shield, Audit, Launchpad, Gatekeeper, Data Knox, and Scribe.
- If availability/calendar logic changes, notify Sync, Stack Mason, Booker, Mission Control, Shield, Bug Hunter, and Scribe.
- If the work affects another agent, do not assume they know. Write it down.
- Update `CHANGELOG.md` if the work is meaningful.
- Update `docs/agent-status.md` if the work changes project status.
- Do not document fake work as completed.
- Do not include secrets, tokens, API keys, passwords, or private credentials in handoff notes.
- If a task is outside the current agent's role, leave a note instead of building it directly.

## Architecture Handoff Requirements

At the end of every task, Neo Prime must create a handoff note for any agents affected by architecture, routing, folder structure, app strategy, or major technical decisions.

Always notify:
- Data Knox for schema/data impact
- Stack Mason for backend/API impact
- Pixel Frost for frontend structure impact
- Mission Control for admin structure impact
- Launchpad for deployment/config impact
- Scribe for documentation/versioning impact
- Shield for security impact

Architecture handoffs must include:
- Architecture changes
- Folder/file structure changes
- New conventions
- Affected modules
- Risks
- Recommended next agent

## Booking Flow Handoff Requirements

At the end of every task, Booker must create a handoff note for any agents affected by booking flow changes.

Always notify:
- Stack Mason if APIs/backend logic changed
- Data Knox if booking data fields changed
- Mission Control if admin booking display needs updates
- Sync if availability/calendar behavior changed
- Ledger if deposits/invoices are affected
- Shield if private data/security is affected
- Bug Hunter for QA
- Scribe for documentation

Booking flow handoffs must include:
- Booking flow changes
- Form fields changed
- Validation rules
- API/data requirements
- Availability checker behavior, if affected
- Admin follow-up needed
- Testing performed

## Authentication Handoff Requirements

At the end of every task, Gatekeeper must create or update a handoff note for any agents affected by authentication or authorization changes.

Always notify:
- Mission Control for protected admin routes
- Concierge for future client portal access
- Shield for security review
- Launchpad for environment variables and redirect URLs
- Data Knox for user/role schema impact
- Bug Hunter for auth testing
- Scribe for documentation

Authentication handoffs must include:
- Auth methods changed
- Login/signup/callback routes changed
- Role/permission changes
- Protected route behavior
- Environment variables required
- Redirect URL notes
- Security risks
- Testing performed

## Availability Checker Requirements

Project Neo will include an availability checker for booking inquiries.

Goals:
- Let potential clients check whether a date/time may be available.
- Help reduce booking conflicts.
- Encourage visitors to submit inquiries.
- Protect private event and client information.

Public availability statuses:
- `available`
- `pending`
- `unavailable`
- `contact_required`

Internal admin statuses:
- `available`
- `hold`
- `pending`
- `booked`
- `unavailable`
- `personal_block`
- `travel_block`
- `maintenance_day`

Public rules:
- Do not expose client names.
- Do not expose venue names.
- Do not expose private event notes.
- Do not expose exact event details for booked/private events.
- Show only safe availability messages.
- Encourage inquiry submission even when status is `pending` or `contact_required`.
- Prevent obvious double-booking warnings in admin.

Admin rules:
- Admin can view exact events and blocked dates.
- Admin can manually create holds and blocked dates.
- Admin can override availability status.
- Admin can mark travel/personal/setup days.
- Admin can see conflicts between event times.

Availability checker MVP:
- Check date and time against events and availability blocks.
- Return a simple public status.
- Allow inquiry submission even if status is not fully available.
- Store the checked availability result with the inquiry if possible.

## Compliance Requirements: SOC 2 Type II and PCI-DSS

Project Neo must be designed to be SOC 2 Type II-ready and PCI-DSS-aligned from the beginning.

Important:
- Project Neo is not officially SOC 2 Type II compliant until an independent audit is completed.
- Project Neo is not officially PCI-DSS compliant until the correct PCI assessment, controls, and required validation are completed.
- Agents must build with compliance readiness in mind.
- Agents must not claim official compliance unless an audit or assessment has been completed.

SOC 2 Type II readiness goals:
- Security controls
- Access control
- Change management
- Logging and monitoring
- Vendor management
- Incident response
- Data protection
- Backup and recovery planning
- Secure software development lifecycle
- Least privilege access
- Evidence collection
- Policy documentation

PCI-DSS alignment goals:
- Do not store credit card numbers.
- Do not store CVV values.
- Do not store raw cardholder data.
- Do not process card data directly inside Project Neo unless explicitly approved.
- Use Square-hosted payment pages, Square Invoices, or Square Web Payments SDK.
- Keep Square access tokens server-side only.
- Verify Square webhook signatures before trusting payment events.
- Use HTTPS in production.
- Use environment variables for secrets.
- Protect admin dashboard access.
- Require strong authentication for admin users.
- Log security-relevant events.
- Restrict access to invoice and payment records.
- Maintain secure development practices.

Compliance rules for all agents:
- Do not expose secrets in client-side code.
- Do not commit secrets to GitHub.
- Do not log sensitive tokens, passwords, payment data, or private client data.
- Do not expose private event, client, invoice, payment, or contract data publicly.
- Use role-based access control.
- Use least privilege permissions.
- Document important security decisions.
- Update `CHANGELOG.md` for meaningful security-related changes.
- Create a decision record in `docs/decisions/` for major compliance/security choices.
- Create handoff notes when work affects security, auth, payments, logging, or customer data.
