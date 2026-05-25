# Changelog

All notable changes to Project Neo will be documented in this file.

Version format:
- MAJOR version: Big breaking changes or major platform shifts
- MINOR version: New features
- PATCH version: Bug fixes, small improvements, cleanup

---

## [Unreleased]

### Added
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

### Fixed
- 

### Removed
- 

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
