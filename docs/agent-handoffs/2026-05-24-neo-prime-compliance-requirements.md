# Agent Handoff - Compliance Requirements

- From: Neo Prime, Lead Software Architect
- To: Security Engineer, DevOps Engineer, Backend Engineer, Admin Dashboard Engineer, Booking Systems Engineer, Payments Engineer, Frontend Engineer, QA Test Engineer
- Date: 2026-05-24
- Related Version: 0.1.0

## Summary

Added SOC 2 Type II readiness and PCI-DSS alignment requirements to `agents.md`, and created a decision record documenting Project Neo's compliance-readiness baseline.

## Files Changed

- `agents.md`
- `CHANGELOG.md`
- `docs/decisions/2026-05-24-compliance-readiness-baseline.md`
- `docs/agent-handoffs/2026-05-24-neo-prime-compliance-requirements.md`

## Decisions Made

- Project Neo should be designed for SOC 2 Type II readiness and PCI-DSS alignment from the beginning.
- Project Neo must not claim official SOC 2 Type II or PCI-DSS compliance until formal audit or assessment validation is complete.
- Project Neo should not store or directly process raw cardholder data by default.
- Square-hosted or tokenized payment flows are the preferred payment direction.
- Major security and compliance choices must be captured in `docs/decisions/`.

## Important Notes

- No feature code, database schema, API routes, authentication behavior, payment integration, logging system, or deployment setting was changed.
- These requirements affect future work touching security, auth, payments, invoices, customer data, contracts, logging, and deployment.

## What the Next Agent Should Do

- Security Engineer: review future auth, data access, logging, and privacy choices against these requirements.
- DevOps Engineer: ensure secrets, HTTPS, environment separation, and deployment controls support compliance readiness.
- Backend Engineer: keep service-role keys server-side and restrict API data exposure.
- Admin Dashboard Engineer: protect admin routes and avoid exposing private data unnecessarily.
- Booking Systems Engineer: keep inquiry and availability data public-safe.
- Payments Engineer: use Square-hosted or tokenized flows and verify webhook signatures.
- QA Test Engineer: add checks for secret exposure, public data leakage, and sensitive logging.

## Blockers or Risks

- Formal SOC 2 Type II and PCI-DSS compliance require external audit or assessment work not included in this documentation change.
- Payment implementation details are not finalized beyond the Square-aligned direction.

## Questions for the Next Agent

- Which Square payment approach should be selected first: Square Invoices, Square-hosted checkout, or Square Web Payments SDK?
- What security event log model should Project Neo use for admin, payment, auth, and data-access events?
