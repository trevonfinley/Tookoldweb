# Decision Record - Compliance Readiness Baseline

Date: 2026-05-24

Status: Accepted

Related Version: 0.1.0

## Context

Project Neo will handle booking inquiries, client records, invoices, payments, contracts, admin access, and future portal data. These workflows include sensitive customer and business information, so security and compliance readiness must be part of the architecture before implementation expands.

## Decision

Project Neo will be designed to be SOC 2 Type II-ready and PCI-DSS-aligned from the beginning. The project must not claim official SOC 2 Type II compliance or PCI-DSS compliance until the correct independent audit, assessment, controls, and validation are completed.

Project Neo will avoid direct card-data handling by default. Payment implementations should use Square-hosted payment pages, Square Invoices, or Square Web Payments SDK, with Square access tokens kept server-side and Square webhook signatures verified before payment events are trusted.

## Requirements

- Do not store credit card numbers, CVV values, raw cardholder data, passwords, tokens, or secrets in client-side code, logs, or Git.
- Keep payment secrets, Square access tokens, service-role keys, and webhook secrets server-side only.
- Use HTTPS in production.
- Protect admin dashboard access with strong authentication and role-based access control.
- Restrict invoice, payment, contract, event, and client data to least-privilege roles.
- Log security-relevant events without logging private client data or sensitive payment data.
- Document major security and compliance decisions in `docs/decisions/`.
- Create handoff notes when work affects security, auth, payments, logging, or customer data.

## Consequences

- Payment work must be designed around hosted or tokenized Square flows unless explicitly approved otherwise.
- Security-sensitive work requires changelog updates, decision records when major choices are made, and cross-agent handoff notes.
- Future compliance claims must be carefully worded as readiness or alignment until formal validation is complete.
