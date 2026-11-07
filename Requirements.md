---
type: requirements
title: e1 Requirements
description: Tier 1 flat-build NSH.dev (Native Shell by Longbridge v0.4.0) — one codebase, two artifacts
tags: [e1, nsh, requirements]
tier: 1
---

# e1 Requirements

## Overview
e1 is a Tier 1 flat-build NSH.dev (Native Shell by Longbridge, v0.4.0 pre-1.0) experiment: one codebase, two shipping artifacts — desktop client (Windows target; Linux build kept as artifact) + Android APK — sending bidirectional text, clipboard on demand both ways, and 50 MB files both ways over Wi-Fi/BLE. Keep the tree flat. No enterprise ceremony.

## Core Features
- **Bidirectional text over LAN** — phone sender (`POST /send`) + PC receiver (`GET /latest`, 2s poll); reverse PC sender (`POST /send_pc`) + phone receiver (`GET /latest_pc`).
- **Clipboard both ways** — button-triggered only (`Clipboard.writeText` / `readText`); no background listener (NSH has none).
- **50 MB files both ways** — chunked JSON/base64 lane (256 KiB chunks × 200) proven loopback 93.7 MB/s; single-shot TSX NOT-VIABLE (`writeFile` 8 MiB max). No file UI in slice by design.
- **CLI client** — `scripts/e1-cli.py` (stdlib) for terminal send/recv/copy over the same LAN contract.
- **Two artifacts from one codebase** — Windows runner (`nsh package --target windows`) + Android APK (`--target android --abi arm64-v8a`, 36 MB). Web target for iteration.

## Technical Constraints
- NSH v0.4.0 (`nsh 0.4.0 (e626a8d)`), TSX on QuickJS; `nsh.json` needs `capabilities:{clipboard:true, network:{hosts:["*"]}}` for LAN.
- Pure-TSX has no HTTP listen socket — receiver is `e1/server.py` helper (port 8791). Native Rust `native_module` server is follow-up (see `research/feasibility-nsh-e1.md`).
- NSH is pre-1.0 — Version Freshness Gate WARN (Tier 1 OK, Tier 4 BLOCK). Record current/target/blocker in `Improvements.md`.
- No Android emulator on this box (needs 7.3 GB userdata, 6.4 GB free, no KVM). Use headless `nsh test` + handset via `scripts/handset-smoke.sh` (adb + scrcpy). See `research/small-footprint-android-testing.md`.
- Windows packaging not built locally (no `~/.nsh/bin/nsh-windows-app`); CI `windows-latest` job builds it.

## User Stories
- As a phone owner, I want to type text and send it to my PC over Wi-Fi LAN so I don't retype it.
- As a PC user, I want to send text to my phone and copy it to clipboard, so the phone shows it without manual entry.
- As a developer, I want one codebase to ship both artifacts, so I never maintain two text stacks.

## Acceptance Criteria
- [x] Phone→PC text round-trip headless (`nsh test` 4/4) + live `server.py` smoke both directions.
- [x] PC→phone text round-trip headless + live smoke both directions.
- [x] Clipboard copy both directions headless (`Clipboard`).
- [x] CLI `send`/`recv` both directions live against `server.py`.
- [ ] Live handset clipboard round-trip + real Wi-Fi 50 MB MB/s on user router/phone (blocked on hardware, see `scripts/handset-smoke.sh`).
- [ ] File UI + 50 MB lane in production (needs Rust mixed layer / native server; probe in `research/file-lane-probe.md`).
- [x] Green CI: `android` (ubuntu-24.04) + `windows` (windows-latest) artifacts on push; releases on `v*` tags.

## Out of Scope
- File UI in this slice (str\Desktop by design).
- mDNS / BLE / hotspot discovery, ambient clipboard listener, auth/persistence.
- Tier 4 enterprise ceremony; Linux desktop as primary target (kept only as build artifact/lint fallback).
