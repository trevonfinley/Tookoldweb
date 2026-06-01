# Changelog

All notable changes to Project Neo will be documented in this file.

Version format:
- MAJOR version: Big breaking changes or major platform shifts
- MINOR version: New features
- PATCH version: Bug fixes, small improvements, cleanup

---

## [Unreleased]

### Fixed
- Fixed booking availability checker UI validation so overnight windows such as 10:00 PM to 2:00 AM are allowed instead of rejected.
- Fixed booking inquiry UI validation so equal start/end times are treated as an overnight next-day window instead of a client-side error.

### Changed
- Added public booking form helper copy explaining that overnight events are allowed and morning end times should be used for next-day endings.

---

## [0.8.0] - 2026-05-25

### Added
- Added first successful Vercel web preview deployment documentation.
- Documented `v0.8.0 — First Web Preview` in `VERSION.md` and `docs/versions/v0.8.0.md`.
- Added deployment notes for the Vercel preview in `docs/deployment-notes.md`.
- Added a deployment milestone summary for the first web preview.
- Added `agents.md` with Project Neo agent collaboration and handoff rules.
- Created `docs/agent-handoffs/` with the first Neo Prime handoff note.
- Added availability checker requirements to `agents.md` for public-safe status handling and admin conflict checks.
- Added the public booking availability checker with API integration, loading/error/status states, and booking inquiry status snapshot handoff.
- Added Mission Control and Bug Hunter notes for availability checker review.
- Added SOC 2 Type II readiness and PCI-DSS alignment requirements to `agents.md`.
- Created the first compliance decision record in `docs/decisions/`.
- Added the official DJ Too Kold logo asset and wired it into site branding.

### Changed
- Routed direct public email links and website contact metadata to `djtookold@gmail.com`.
- Preserved public availability status and checked timestamp when booking inquiries are submitted after a successful checker result.
- Confirmed the first Vercel deployment is a preview milestone, not the official `v1.0.0` MVP launch.

### Deferred
- Confirmed Square integration remains deferred.

### Compliance Notes
- Confirmed SOC 2 Type II and PCI-DSS are readiness/alignment goals only, not official compliance claims.

---

## [0.1.0] - 2026-05-24

### Added
- Created initial Project Neo repo structure.
- Added global AGENTS.md instructions.
- Defined engineering agents for Codex workflow.
- Added initial DJ Too Kold brand direction.
- Added MVP build order.

### Changed
- N/A

### Fixed
- N/A

### Removed
- N/A
