# Agent Handoff - Invoice and Payment Ledger

## Agent Name

Ledger

## Agent Role

Payments and Invoices Engineer

## Date

2026-05-26

## Task Summary

Designed and implemented the Project Neo invoice, deposit, balance, and payment tracking system for DJ Too Kold. The work keeps payment tracking separate from payment processing, prepares invoices for hosted Square or Stripe payment links, and keeps sensitive card data out of Project Neo.

## Files Created

- `docs/agent-handoffs/2026-05-26-ledger-invoice-payment-ledger.md`

## Files Modified

- `supabase/migrations/20260523000000_project_neo_core.sql`
- `supabase/functions/project-neo-api/index.ts`
- `admin-dashboard.html`
- `admin.js`
- `style.css`
- `docs/PROJECT_NEO_BACKEND.md`
- `docs/PROJECT_NEO_DATABASE_SCHEMA.md`
- `docs/PROJECT_NEO_AUTH.md`
- `README.md`
- `CHANGELOG.md`
- `docs/agent-status.md`

## Files Deleted, if any

- None.

## Key Decisions Made

- Payments are tracked separately from processing; Project Neo stores provider/link/reference/status data only.
- Payments attach to invoices, and client/event context is reached through the invoice relationship.
- Invoice snapshots for amount paid, deposit paid, and balance due are maintained from payment records instead of being manually edited.
- Hosted checkout details are stored as invoice metadata for Square, Stripe, or another provider; card numbers, PAN values, CVV/CVC values, and expiration data are not accepted.
- Admin dashboard summaries should use `balance_due_cents` for open balances rather than invoice total.

## Data/API/Schema Changes

- Added invoice fields for hosted payment metadata: `payment_provider`, `payment_link_url`, `payment_link_expires_at`, `external_invoice_id`, and `external_invoice_url`.
- Added invoice ledger snapshot fields: `amount_paid_cents`, `deposit_paid_cents`, and `balance_due_cents`.
- Added `payments.payment_date`.
- Added constraints for HTTPS hosted links, provider/reference pairing, nonnegative ledger amounts, deposit paid limits, and paid payment date/timestamp requirements.
- Added invoice/payment ledger trigger functions to update invoice totals and statuses when payment records change.
- Updated admin API support for invoice creation, hosted payment link fields, external payment references, payment date handling, balance validation, overdue refresh, and `GET /admin/invoices`.
- Updated dashboard summary data to include open invoice ledger records.

## Invoice/payment behavior changed

- Invoice balances now come from tracked payment records instead of manual balance edits.
- Paid deposit and balance payments reduce `balance_due_cents`.
- Paid deposit payments increase `deposit_paid_cents`.
- Refund-like records reduce collected totals.
- Pending and failed payments are tracked but do not reduce the invoice balance.
- Sent unpaid invoices can refresh to `overdue` after the due date.

## Data fields changed

- `invoices.payment_provider`
- `invoices.payment_link_url`
- `invoices.payment_link_expires_at`
- `invoices.external_invoice_id`
- `invoices.external_invoice_url`
- `invoices.amount_paid_cents`
- `invoices.deposit_paid_cents`
- `invoices.balance_due_cents`
- `payments.payment_date`

## External provider assumptions

- Square, Stripe, or another provider owns hosted checkout and card collection.
- Project Neo stores provider names, hosted URLs, external invoice IDs, and external payment references only.
- Payment provider records should be reconciled through processor webhooks or admin-confirmed manual updates in a later integration pass.

## Square-related notes if any

- Square remains a supported future hosted checkout provider.
- No Square API calls, Square webhook handlers, Square OAuth, or Square secrets were added.
- Square payment-link URLs should be stored in `invoices.payment_link_url` only after Square creates them externally.

## PCI-DSS impact

- This is a PCI-aligned tracking design, not a PCI-DSS compliance claim.
- Sensitive card data should remain entirely in Square, Stripe, or the selected hosted checkout provider.
- Shield should review the final implementation before launch to confirm no payment card data enters Project Neo forms, APIs, logs, or database tables.

## Security concerns

- Ensure no future frontend sends card numbers, PAN values, CVV/CVC values, expiration values, or magnetic stripe/chip data to Project Neo.
- Ensure payment provider webhooks validate signatures before trusting external payment status updates.
- Ensure hosted payment links remain HTTPS-only and are not treated as proof of payment without a matching provider/payment reference.

## Environment Variable Changes

- None.

## Security/Compliance Impact

- Positive payment-safety impact. The API rejects card/PAN/CVV/CVC/expiration-style payload keys before storage.
- Project Neo remains payment-tracking-only and does not process or store sensitive card data.
- Hosted payment URLs must use HTTPS.
- No official PCI-DSS compliance claim is made; this is PCI-aligned design hygiene only.
- No secrets, tokens, API keys, passwords, or private credentials are documented here.

## Agents That Need This Update

- Data Knox
- Stack Mason
- Mission Control
- Shield
- Launchpad
- Bug Hunter
- Scribe
- Neo Prime
- Booker

## Required Follow-Up Tasks

- Run the Supabase migration against a linked local or hosted project when Supabase CLI/database access is available.
- Run Deno/Edge Function type checks when Deno or equivalent tooling is available.
- Have Bug Hunter test invoice creation, deposit payment, balance payment, failed payment, and refund flows.
- Have Mission Control review the admin invoice ledger workflow and decide whether a fuller invoice management screen is needed.
- Have Data Knox review the invoice/payment schema, ledger triggers, indexes, and RLS impact.
- Have Stack Mason review the invoice/payment API route contracts and backend validation behavior.
- Have Shield review PCI-DSS alignment, card-data rejection, hosted payment assumptions, and future webhook signature requirements.
- Have Launchpad confirm no new environment variables are required for the current tracking-only implementation, and document future Square/Stripe variables when provider integrations are added.
- Have Scribe keep backend/schema/admin docs current after provider integration decisions.
- Have the future payments integration owner wire Square or Stripe payment-link creation and webhook reconciliation.

## Risks or Blockers

- Supabase CLI, Deno, `psql`, `npm`, and `tsc` were not available in the local workspace during implementation, so database migration execution and Edge Function type checking were not completed locally.
- Square and Stripe hosted payment-link generation/webhook handling are prepared for but not implemented.
- The worktree contains unrelated changes from other agents; Ledger scope should not be treated as ownership of those unrelated files.

## Testing Performed

- Ran `node --check admin.js`.
- Ran `node --check script.js`.
- Smoke-checked `admin-dashboard.html` through a local static server in the in-app browser.
- Confirmed the dashboard route loaded, the invoice ledger DOM exists, three admin panels are present, no browser console errors were reported, and no horizontal overflow was detected.

## Suggested Next Agent

Bug Hunter
