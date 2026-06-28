# Project Neo Compliance Readiness Tracker

Last updated: 2026-06-12

Owner agent: Audit

Project Neo is being designed toward SOC 2 Type II readiness and PCI-DSS alignment. It is not officially SOC 2 Type II compliant or PCI-DSS compliant until the appropriate audit, assessment, control operation, validation, and evidence review are completed.

## Current Scope

Project Neo currently includes a public DJ Too Kold website, booking and contact forms, a Supabase-backed API, protected admin workflows, deferred client portal workflows, invoice/payment tracking records, and readiness documentation for future Square-hosted payment flows.

In-scope readiness areas:
- Public booking inquiries and contact messages.
- Admin access and role checks.
- Supabase database, RLS, grants, Edge Function authorization, and environment separation.
- Client/event/invoice/payment-reference records.
- Deployment workflow, release gates, rollback notes, and agent handoffs.
- Future hosted Square payment integration planning.

Out of scope for current launch:
- Direct card-data processing.
- Storage of card numbers, CVV/CVC values, PAN, raw cardholder data, or raw payment credentials.
- Live Square payment collection unless Ledger, Shield, Launchpad, and Neo Prime explicitly activate it.
- Official SOC 2 Type II or PCI-DSS compliance claims.

## Compliance Claims Policy

Allowed wording:
- "SOC 2 Type II-ready"
- "SOC 2 readiness"
- "PCI-DSS-aligned"
- "PCI-DSS alignment"
- "Compliance readiness"

Disallowed wording until formal validation:
- "SOC 2 compliant"
- "SOC 2 certified"
- "PCI compliant"
- "PCI-DSS compliant"
- Any wording that suggests Project Neo has passed an audit, assessment, or certification that has not happened.

## SOC 2 Type II Readiness Areas

| Area | Current posture | Gap | Owner agents |
| --- | --- | --- | --- |
| Security controls | Auth, protected API routes, RLS, no-card-data rules, secret-handling documentation, and security handoffs exist. | Need formal control inventory, control owners, operating frequency, and evidence retention plan. | Audit, Shield, Scribe |
| Access control | Supabase Auth, `public.users` roles, owner/admin access, and client portal scoping are documented. | Need MFA posture decision, access review cadence, joiner/mover/leaver process, break-glass process, and session revocation evidence. | Gatekeeper, Shield, Audit |
| Change management | Branch flow, release gates, changelog, handoffs, deployment notes, and rollback plan exist. | Need PR approval evidence, required-check evidence, release approval records, and exception tracking. | Launchpad, Scribe, Neo Prime, Audit |
| Logging and monitoring | Security-relevant logging is a readiness goal; Vercel/Supabase operational notes exist. | Need logging matrix, alert ownership, retention windows, log redaction rules, and incident evidence capture. | Shield, Launchpad, Stack Mason, Audit |
| Data protection | RLS model and no-card-data schema posture are documented. | Need data classification, retention/deletion policy, backup/restore evidence, export controls, and privacy review for future portal data. | Data Knox, Shield, Audit |
| Vendor management | Supabase, Vercel, and future Square are identified as major vendors. | Need vendor inventory, security review notes, contract/terms evidence, subprocessors, and renewal review cadence. | Audit, Launchpad, Ledger, Shield |
| Incident response | Rollback and secret-exposure response notes exist. | Need incident response policy, severity matrix, contact tree, tabletop evidence, customer notification criteria, and post-incident review template. | Audit, Shield, Launchpad, Scribe |
| Backup and recovery | Rollback plan exists; Supabase backup posture is referenced as deployment follow-up. | Need backup schedule, restore test evidence, RPO/RTO targets, and ownership by environment. | Launchpad, Data Knox, Audit |
| Evidence collection | Handoff notes and changelog provide early change evidence. | Need an evidence index with recurring artifacts, owners, storage location, and review dates. | Audit, Scribe, Launchpad |

## PCI-DSS Alignment Areas

| Area | Current posture | Gap | Owner agents |
| --- | --- | --- | --- |
| Cardholder data avoidance | Schema and API notes reject card number, CVV/CVC, PAN, expiration, and raw payment credential fields. | Need repeated release-gate evidence that card-data fields remain absent from schema, forms, API payloads, logs, and docs. | Ledger, Data Knox, Shield, Audit |
| Hosted payment scope | Square/Stripe collection remains deferred; hosted/tokenized flows are required for future activation. | Need approved Square architecture decision before implementation, including webhook signature verification and provider secret boundaries. | Ledger, Shield, Stack Mason, Launchpad, Audit |
| Secrets | `.env.example` is placeholder-only and service role/payment secrets are server-side-only by policy. | Need environment-specific secret inventory without values, rotation cadence, and access owner list. | Launchpad, Shield, Gatekeeper, Audit |
| Webhooks | Future payment webhooks are not active. | Need signature verification, replay protection, idempotency, least-privilege processing, and test evidence before trusting payment events. | Ledger, Stack Mason, Shield, Audit |
| Admin/payment access | Admin and payment records are protected by auth/API/RLS expectations. | Need positive authenticated admin QA with owner-approved sessions and role-review evidence before launch of private money workflows. | Gatekeeper, Mission Control, Ledger, Bug Hunter |
| Logging | Sensitive payment data must not be logged. | Need log redaction rules and verification once Square/payment events exist. | Shield, Ledger, Stack Mason, Audit |

## Data Handling Assumptions

- Public users may submit booking inquiries and contact messages.
- Booking inquiries, contact messages, clients, events, invoices, payments, contracts, notes, and portal data are private business data unless intentionally published as catalog/media content.
- Public availability responses must not expose client names, venue names, private event notes, or exact private event details.
- Payment records may store provider references, statuses, hosted payment links, amounts, dates, and reconciliation metadata.
- Payment records must not store card numbers, CVV/CVC values, PAN, card expiration, track data, raw cardholder data, or raw provider credentials.
- Test records should be clearly fake or QA-labeled and cleaned up after evidence is no longer needed.

## Vendor and Security Assumptions

Known or expected vendors:
- Vercel for static hosting, Preview Deployments, production deployments, and optional deployment protection.
- Supabase for database, Auth, Edge Functions, RLS, and project secrets.
- Square for future hosted payment pages, invoices, Web Payments SDK, or webhook-based payment events if activated.
- Google and Apple for optional OAuth sign-in if enabled.
- Google Calendar or another calendar provider for future Sync work if activated.

Required vendor follow-up:
- Maintain a vendor inventory with vendor purpose, data touched, environment, owner, security review date, and renewal/review cadence.
- Keep provider secrets server-side or in provider-managed settings only.
- Document any change that expands vendor data access before implementation.

## Evidence Needed

Before treating Project Neo as SOC 2 Type II-ready, collect:
- Control inventory with owners, frequency, and evidence artifacts.
- Access review evidence for admin/owner users and provider dashboards.
- Release approval evidence for `dev -> staging -> main`.
- Build, validation, QA, security review, and deployment evidence for each release.
- Supabase RLS/grant review evidence and migration history.
- Secret inventory and rotation evidence without secret values.
- Incident response policy and tabletop exercise record.
- Backup/restore evidence and RPO/RTO decision.
- Vendor inventory and security review notes.
- Data retention/deletion policy and test-data cleanup evidence.

Before treating payment flows as PCI-DSS-aligned enough for live use, collect:
- Approved Square/payment architecture decision record.
- Confirmation that Project Neo never stores raw cardholder data.
- Webhook signature verification and idempotency test evidence.
- Provider-secret storage evidence without values.
- Payment-route auth/RLS QA evidence.
- Log redaction verification.
- Ledger, Shield, Stack Mason, Launchpad, Bug Hunter, and Audit handoff notes.

## Required Policies

High priority:
- Access Control Policy.
- Change Management Policy.
- Incident Response Policy.
- Data Classification and Handling Policy.
- Secrets Management Policy.
- Backup and Recovery Policy.
- Vendor Risk Management Policy.
- Logging and Monitoring Policy.
- Data Retention and Deletion Policy.

Payment-specific before Square activation:
- Payment Data Handling Policy.
- Webhook Security Standard.
- Payment Reconciliation and Refund Handling Procedure.

## Current Audit Findings

1. Compliance wording is conservative in reviewed baseline docs; no official SOC 2 Type II or PCI-DSS claim should be added.
2. Payment collection remains deferred and Project Neo's current schema/API posture is aligned with avoiding cardholder data storage.
3. Environment separation and release gates are documented, but evidence collection and formal control ownership are not yet complete.
4. Auth and RLS are documented as private-data boundaries, but positive authenticated admin/client workflow QA remains a readiness dependency where noted by Gatekeeper, Mission Control, Ledger, Concierge, and Bug Hunter.
5. Vendor management, incident response, backup/restore evidence, and recurring access reviews still need formal policy artifacts and operating evidence.

## Recommended Next Actions

- Audit: create the first formal control inventory and evidence index.
- Shield: review logging/redaction, security control ownership, and incident response policy needs.
- Scribe: keep compliance wording conservative in changelog, release notes, and public docs.
- Launchpad: document deployment evidence storage, backup/restore evidence, branch protection status, and environment secret ownership.
- Gatekeeper: document MFA/session/access review expectations and positive admin-session QA evidence when owner-approved access exists.
- Data Knox: create data classification, retention, deletion, RLS review, and QA test-data cleanup evidence.
- Ledger: keep Square deferred until an approved payment architecture decision and PCI-aligned evidence plan exist.
- Bug Hunter: add compliance-related regression checks for no private data exposure, no card-data collection, protected admin/client routes, and conservative compliance wording.
