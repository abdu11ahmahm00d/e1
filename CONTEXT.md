---
type: context
title: e1 Context
description: Shared domain language for e1 (NSH bidirectional LAN text + files + clipboard)
tags: [e1, nsh, context]
---

# e1 Context

## Language

**e1**:
Tier 1 flat-build NSH.dev experiment — one codebase, two artifacts (Windows desktop + Android APK).
_Avoid_: two-stack app, Electron port.

**slice**:
The smallest vertical slice that proves one lane end-to-end (today: bidirectional text + on-demand clipboard, no file UI).
_Avoid_: MVP, spike without tests.

**phone sender**:
Android screen in `e1/App.tsx` (non-desktop branch). Types text, `POST /send`, polls `GET /latest_pc`, copies via clipboard buttons.
_Avoid_: mobile app without a screen, client-only test.

**PC receiver**:
Windows screen in the same `App.tsx` (`platform.desktop`). Polls `GET /latest`, `POST /send_pc`, copy via `Clipboard`.
_Avoid_: Linux-only desktop, server.py as the app.

**PC helper**:
`e1/server.py` (Python stdlib HTTP on `0.0.0.0:8791`). Holds the LAN contract because pure-TSX has no listen socket.
_Avoid_: native server (future Rust work), production backend.

**LAN contract**:
Plain HTTP JSON on the local network: `POST /send {text}`, `GET /latest`, `POST /send_pc {text}`, `GET /latest_pc`, `GET /health`. Owned by `e1/lane.ts` (`lane(host)`).
_Avoid_: mDNS, BLE, auth — not in slice.

**lane module**:
`e1/lane.ts` — the deep LAN module (`lane(host).send/sendPc/latest/latestPc` + `pollEvery`). Two adapters (phone sender, PC receiver) = real seam.
_Avoid_: fetch literals per screen, wildcard test mocks.

**CLI client**:
`scripts/e1-cli.py` — terminal `send`/`recv`/`copy` over the same LAN contract. Third client, same protocol.
_Avoid_: separate CLI protocol.

**chunked lane**:
File transport for the 50 MB promise: 256 KiB JSON/base64 chunks (`POST /chunk`, `GET /assemble/{id}`), SHA-256 verified.
_Avoid_: single-shot `writeFile` (8 MiB limit), file UI.

**Version Freshness Gate**:
NSH pre-1.0 warning log in `Improvements.md` (current `nsh 0.4.0 (e626a8d)`, target ≥1.0, blocker: breaking-change risk). Tier 1 OK, Tier 4 BLOCK.
_Avoid_: treating v0.4.0 as stable.
