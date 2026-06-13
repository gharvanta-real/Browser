# Aero Browser Backend

This backend is the production boundary for Aero's browser services. The existing root UI is a visual shell; this Rust workspace is where search, local indexing, agent planning, and permission enforcement move out of mock JavaScript and into auditable services.

## Crates

- `search_core`: fast local search index for bookmarks, history, tabs, downloads, page snapshots, and reading list items.
- `agent_protocol`: serializable browser action and permission model shared between the UI shell, native browser host, and AI runtime.
- `browser_domain`: typed browser entities for profiles, tabs, sessions, downloads, privacy modes, and settings.
- `browser_automation`: typed commands for opening pages, clicking, filling, keyboard events, scrolling, AXTree reads, screenshots, and network intercept rules.
- `browser_cdp`: compiler and executor abstraction for Chrome DevTools Protocol method payloads.
- `browser_policy`: safety, privacy, audit, and PRD-readiness policy layer.
- `browser_storage`: SQLite persistence for audit events and search documents, ready to be wrapped by DPAPI-backed encryption.
- `browser_backend`: local HTTP service for development. Production can swap this transport for Windows Named Pipes while keeping the same request/response contracts.

## Run

```powershell
cd backend
cargo run -p browser_backend
```

The development service listens on `http://127.0.0.1:4978`.

## API

`GET /health`

Returns service status and indexed document count.

`POST /v1/search/index`

Indexes documents:

```json
{
  "documents": [
    {
      "id": "bookmark:1",
      "kind": "bookmark",
      "title": "Aero Browser Architecture",
      "url": "https://aero.internal/docs",
      "body": "Rust backend, Chromium shell, AI agent runtime.",
      "tags": ["architecture", "browser"],
      "source": "bookmarks",
      "updated_at": "2026-06-13T00:00:00Z"
    }
  ]
}
```

`POST /v1/search/query`

Queries indexed documents:

```json
{
  "query": "rust browser architecture",
  "limit": 10,
  "kinds": ["bookmark", "history"]
}
```

`POST /v1/agent/plan`

Creates an auditable browser action plan:

```json
{
  "tab_id": "tab-new",
  "user_goal": "book a flight to Tokyo",
  "page_summary": null,
  "max_allowed_tier": "navigate"
}
```

`POST /v1/automation/evaluate`

Validates an automation command for the future native CDP/AXTree executor. This endpoint does **not** execute inside a real browser yet; it checks that a command is safe to queue and maps it into the permission model.

```json
{
  "command": {
    "type": "click",
    "tab_id": "tab-new",
    "target": {
      "target_type": "accessibility_node",
      "ax_node_id": "ax-submit",
      "label": "Submit"
    },
    "button": "left"
  },
  "origin": "https://example.com",
  "user_visible_reason": "Click the visible Submit button requested by the user"
}
```

`POST /v1/automation/compile-cdp`

Compiles a command into CDP calls. This is the layer a native Chromium connector will send over an authenticated local CDP session.

```json
{
  "command": {
    "type": "open_page",
    "tab_id": "tab-new",
    "url": "https://example.com"
  }
}
```

Example output includes `Page.navigate`, `Input.dispatchMouseEvent`, `Input.insertText`, `Input.dispatchKeyEvent`, `Accessibility.getFullAXTree`, `Page.captureScreenshot`, or `Fetch.*` calls depending on command type.

`POST /v1/automation/execute-dry-run`

Runs the command through the CDP compiler and mock executor. This is useful for integration tests before a real Chromium CDP transport is attached.

`POST /v1/automation/execute-cdp`

Executes a validated command through a real Chrome DevTools Protocol WebSocket. For safety this only accepts loopback WebSocket URLs such as `ws://127.0.0.1:9222/devtools/page/...` or `ws://localhost:9222/devtools/page/...`.

```json
{
  "command": {
    "type": "open_page",
    "tab_id": "tab-new",
    "url": "https://example.com"
  },
  "websocket_url": "ws://127.0.0.1:9222/devtools/page/PAGE_ID",
  "origin": "https://example.com",
  "user_visible_reason": "Open the page requested by the user"
}
```

Tier 3-5 commands are rejected by this endpoint unless a confirmation/biometric flow has approved them. The native production build should replace raw DevTools URLs with a per-session authenticated browser-process bridge.

`POST /v1/security/evaluate-action`

Evaluates a browser action before execution, applies per-origin rate limits, and appends an audit event:

```json
{
  "action": {
    "type": "confirm_transaction",
    "description": "Place order for laptop",
    "amount": "$1200",
    "payee": "Example Store"
  },
  "origin": "https://store.example",
  "target_description": "Place Order button"
}
```

`GET /v1/security/audit-log`

Returns the latest 250 agent action audit events.

`GET /v1/security/policy`

Returns the active safety policy, including automatic tier limits and per-origin action rate.

`POST /v1/privacy/decide`

Returns data handling rules for a data class and usage:

```json
{
  "data_class": "payment_card",
  "data_use": "cloud_ai_request"
}
```

`GET /v1/privacy/policy`

Returns the active privacy policy.

`GET /v1/readiness`

Returns a PRD feature-readiness report.

`GET /v1/storage/health`

Returns the active SQLite path, schema version, audit event count, and persisted search document count. Override the database path with `AERO_BACKEND_DB`.

## Production Direction

The current service is intentionally local-first. The next hardening steps are:

1. Replace HTTP transport with a Windows Named Pipe host for the desktop build.
2. Wrap `browser_storage` with DPAPI-protected encryption keys for at-rest production storage.
3. Replace raw loopback CDP URLs with an authenticated Chromium browser-process connector that emits `PageSnapshot` documents and executes approved `BrowserAction` steps.
4. Add Windows Hello attestation before Tier 3-5 actions.
5. Persist structured audit logs for every agent plan, permission decision, and executed browser event.
