# Backend vs PRD Comparison

This document compares the current Rust backend foundation against the browser PRD. It is intentionally strict: a feature is not marked production-ready unless the backend has real enforcement and the native browser dependencies are available.

## Current Backend Scope

Implemented now:

- Local search/index core for browser data classes: bookmarks, history, tabs, downloads, reading list, page snapshots, workspaces.
- Agent action protocol with permission tiers 0-5.
- Safety policy that evaluates browser actions before execution.
- Runtime per-origin action rate limiting and latest-event audit log API.
- Privacy policy that classifies data and blocks cloud AI use for credentials, payments, personal identity, and browsing history.
- Typed browser domain contracts for profiles, tabs, windows, workspaces, bookmarks, history, downloads, blocking policy, and settings.
- Typed browser automation contracts for open/click/fill/key/scroll/AXTree/screenshot/network intercept commands.
- CDP compiler for automation commands, producing `Page.*`, `Input.*`, `Accessibility.*`, and `Fetch.*` payloads.
- CDP executor abstraction with mock dry-run transport for backend integration tests.
- Guarded loopback-only CDP WebSocket transport for development execution.
- SQLite storage crate for audit events and search documents.
- API endpoints for search, agent planning, action evaluation, privacy decisions, and readiness reporting.
- Audit event data model for agent actions.

Not implemented yet:

- Native Chromium shell, renderer sandbox, Site Isolation, extension host, PDFium, Widevine, SmartScreen, and certificate inspector.
- Windows DPAPI, Windows Hello, Credential Manager, and native non-bypassable confirmation modal.
- DPAPI-wrapped encrypted stores for history, AI memory, profiles, credentials, and sync blobs.
- CDP/Accessibility-tree connector and OS-level input execution.
- Production browser-process CDP bridge with per-session authentication.
- Network content blocking with Chromium `declarativeNetRequest`.

## PRD Mapping

| PRD Area | Backend Status | Notes |
|---|---:|---|
| 7.1 Tabs & Window Management | Contract only | Search supports tab/workspace documents. Native tab/session lifecycle still required. |
| 7.2 Omnibox | Partial | Local search API exists. Shortcuts, inline answers, certificate indicators, AI intent ranking still missing. |
| 7.3 History | Partial | Full-text searchable history can be indexed. Encrypted persistence and granular clearing still missing. |
| 7.4 Bookmarks & Reading List | Partial | Data can be indexed. Mutation APIs, encrypted sync, and AI summary pipeline still missing. |
| 7.5 Downloads | Contract only | Metadata can be classified/indexed. Real download manager and SmartScreen integration still missing. |
| 7.6 Privacy Blocking | Not started | Needs Chromium network/request layer. |
| 7.7 Security | Contract only | Policy blocks dangerous action requests. Native Chromium security stack still required. |
| 7.8 Password & Identity | Contract only | Privacy rules say never-cloud and biometric-gated. DPAPI/Windows Hello storage still required. |
| 7.9 Media & PDF | Native dependency | Requires Chromium/PDFium/Widevine/native media APIs. |
| 7.10 Sync & Profiles | Contract only | Data retention rules exist. Profile-isolated encrypted stores still required. |
| 10 AI Page Reading | Contract only | Privacy gates exist. AXTree/snapshot reader still required. |
| 13 Permissions & Trust | Partial | Tier 3/4/5 policy, automation command validation, and CDP payload compilation exist. Native confirmation UX and Windows Hello enforcement still required. |
| 14 Privacy & Data Handling | Partial | Data classification and cloud/local decisions exist. Export/delete/what-was-sent inspector still required. |
| 15 Security Architecture | Contract only | Agent/CDP policy boundaries exist. Process sandbox and authenticated named-pipe transport still required. |
| 18 Telemetry & Reliability | Contract only | Telemetry data class blocks content-by-default. Crash reporter and regression gates still required. |

## Backend APIs Added

- `POST /v1/security/evaluate-action`
  - Evaluates a `BrowserAction` against safety policy.
  - Returns confirmation/biometric requirements and an audit event.

- `POST /v1/automation/evaluate`
  - Validates browser automation commands and maps them into safety permissions.
  - Contract-only until Chromium CDP/AXTree executor is attached.

- `POST /v1/automation/compile-cdp`
  - Compiles validated automation commands into Chrome DevTools Protocol payloads.
  - Still requires a native authenticated CDP transport to execute.

- `POST /v1/automation/execute-dry-run`
  - Sends compiled CDP calls through a mock transport.
  - Intended for backend integration testing until real Chromium transport is attached.

- `POST /v1/automation/execute-cdp`
  - Executes validated commands over a loopback-only CDP WebSocket.
  - Development-only shape; production must use the authenticated browser-process bridge.

- `POST /v1/privacy/decide`
  - Evaluates a `DataClass` plus `DataUse`.
  - Returns whether the data can be used, whether encryption/Windows Hello is required, and whether cloud AI is allowed.

- `GET /v1/readiness`
  - Returns a machine-readable PRD readiness report.

- `GET /v1/security/audit-log`
  - Returns recent agent action evaluations and outcomes.

- `GET /v1/security/policy`
  - Returns active automatic tier and rate-limit settings.

- `GET /v1/privacy/policy`
  - Returns active privacy defaults.

## Production Backend Next Steps

1. Replace dev HTTP with authenticated Windows Named Pipes for desktop runtime.
2. Wrap SQLite stores with DPAPI-protected encryption keys and add profile-scoped database paths.
3. Add DPAPI/Credential Manager adapters for credentials, payment data, and API keys.
4. Add Windows Hello attestation adapter for Tier 3-5 approval.
5. Add CDP/AXTree connector crate with per-session token authentication.
6. Add rate limiter for agent-driven actions per origin.
7. Add content-blocking rules manager for Chromium `declarativeNetRequest`.
8. Add persistent readiness/QA gates so PRD areas cannot be marked complete without tests.
