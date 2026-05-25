# Agent Handoff - Mission Control Availability Management

- From: Mission Control, Admin Dashboard Engineer
- Date: 2026-05-24
- Scope: Protected admin dashboard UI, admin availability block create/list flow, and dashboard handoff notes

## What Changed

- Added an Availability section to the protected admin dashboard.
- Added a create-block form for title, block type, start/end date-time, all-day flag, public message, and internal notes.
- Added an availability block list with search, block type filtering, detail view, and conflict badges.
- Added an upcoming events list inside Availability with conflict indicators.
- Added booking inquiry availability snapshot display for `availability_status_at_submission`, `availability_checked_at`, and requested window fields.
- Added protected admin API routes for listing and creating `availability_blocks`.

## Scope Boundaries

- Public availability pages were not given admin-only fields.
- Client portal features were not changed.
- Calendar sync and external provider reconciliation were not built in this pass.

## Sync Notes

- Sync should own calendar import/export, provider IDs, recurring external blackout handling, and sync retry behavior.
- External blackout windows that are not client events should map into `availability_blocks`.
- Keep provider metadata out of public availability responses.

## Shield Notes

- Verify anonymous callers cannot directly query `availability_blocks`.
- Verify public availability routes never expose block title, internal notes, client names, venue details for private events, invoice data, payment data, or provider sync metadata.
- Confirm admin availability routes stay behind `requireAdmin`.

## Bug Hunter Notes

- Test creating every MVP block type: `hold`, `unavailable`, `personal_block`, `travel_block`, `setup_day`, and `maintenance_day`.
- Test event-to-block and block-to-block overlap indicators.
- Test booking inquiries with `available`, `pending`, `unavailable`, `contact_required`, and missing availability snapshots.
- Test that internal notes are visible in admin detail only and never appear on public pages.
