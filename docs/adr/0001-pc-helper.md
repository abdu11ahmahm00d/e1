# ADR 0001: Why a Python PC helper exists

## Status
Accepted (2026-11-06). Revisit when the chunked lane needs resume/auth, or when NSH ships a native listen socket / Rust `native_module` server.

## Context
e1 needs a LAN receiver: phone POSTs text, Windows polls it. NSH v0.4.0 (TSX on QuickJS) is client-only — `fetch`/`net` cannot listen. There is no HTTP server, mDNS, or BLE in the TSX surface.

## Decision
`e1/server.py` (Python stdlib `ThreadingHTTPServer` on `0.0.0.0:8791`, locked in-memory store) owns the LAN contract (`POST /send`, `GET /latest`, `POST /send_pc`, `GET /latest_pc`, `POST /chunk`, `GET /assemble/{id}`) as the slice receiver. The NSH apps are clients only.

## Consequences
- Pro: slice ships today, both directions tested headless + live; no Rust toolchain needed.
- Con: second runtime (Python) on the PC; in-memory only, no auth/persistence; the 50 MB lane lives here until a native server lands.
- Tests hit the seam via `e1/lane.ts` mocks today; candidate 5 is to drive them against a live helper on an ephemeral port.

## Alternatives rejected
- Wait for a native server: blocks the slice.
- Electron/Tauri for the receiver: violates Tier 1 flat / one-codebase constraint.
