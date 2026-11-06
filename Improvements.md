---
type: template
title: Improvements Template
description: Deferred improvements and technical debt tracking document
tags: [tpm, quality]
---

# Improvements

## Purpose
Captures features, changes, and enhancements identified during grilling that are explicitly deferred until AFTER the full build is complete. These are not part of MVP scope.

## Rules
- Populated during Phase 1 grilling
- Never implemented during initial build
- Agent must ask user before implementing after full build is done
- Each entry must have a reason why it's deferred

## Format

```markdown
## {Improvement Name}

### Description
{what it does}

### Deferred Reason
{why not in MVP — e.g., complexity, cost, dependency on shipping first}

### Dependencies
{what needs to exist first (optional)}
```

## Version Freshness Gate — NSH pre-1.0 WARN (e1)

### Description
NSH is `v0.4.0` pre-1.0 (bleeding-edge, 7 showcase apps, no enterprise case studies). Tier 1 flat build proceeds (one codebase, two artifacts, LAN text slice) with pinned runtime **nsh 0.4.0 (e626a8d)**.

### Current / Target / Blocker
- **current:** `nsh 0.4.0 (e626a8d)` (v0.4.0, 2026-11-04) — sandbox receipts: `nsh --version` → `nsh 0.4.0 (e626a8d)`.
- **target:** NSH 1.0 API freeze (or the last 0.4.x compatibility floor per `nsh-compat`) before any Tier 4 enterprise work.
- **blocker:** NSH is pre-1.0; changing APIs (clipboard listener, server/mDNS/BLE — all absent in pure TSX) would break LAN/file paths. Downgrade path if frozen out: Tauri (`/data/home/stack/agents/frontend-dev/stack/09-desktop.md` primary) or Omasend fork.

### Deferred Reason
Upgrading/switching runtimes mid-slice churns the LAN contract; pin first, ship the text vertical slice, re-run the gate when 1.0 lands.

### Dependencies
- Feasibility probe (`research/feasibility-nsh-e1.md`) — done. Next: Rust mixed server.

## §7 probe leftovers (do not lose)

- **Real handset/router 50 MB Wi-Fi MB/s + Android clipboard round-trip:** BLOCKED only by lack of a physical handset/router here (no `adb` device; emulator needs 7.3 GB userdata but `/data` has 6.4 GB free). Android SDK is now installed (`ANDROID_HOME=/data/home/Android/Sdk`, platform-tools 37.0.1, `nsh package --target android` produces 61 MB APK). Loopback 50 MB was 1.45–3.11 GB/s (localhost, not Wi-Fi). On the user's router/handset: `adb install .nsh/out/e1.apk`, mirror with `scrcpy -m1024`, run `server.py`, phone `POST` slice, `iperf3`/`curl` 50 MB both ways, and a 10× Copy/Paste round-trip logging the Android 13+ overlay behavior.
- **Native server replace `server.py`:** pure-TSX has no listen (client-only `fetch`/`net`/`websocket`). Migrate `e1/server.py` (0.0.0.0:8791, `/send`/`/latest`) into a Rust `#[native_module]` (mixed template) or Stack Axum + Tokio backend; keep the JSON contract.
- **50 MB file lane (chunk/resume/verify):** needs 256 KB–1 MB chunks + per-chunk SHA-256 + progress UI + scoped-storage/background-kill handling. `fs/promises` `writeFile` 8 MiB max rules out a single-shot TSX write.
- **Small-footprint Android testing (no 8 GB emulator):** GitHub `scrcpy` (USB/TCP-IP, no root, 35–70 ms, ~1 sec startup) + NSH `web`/`tui` targets. See `research/small-footprint-android-testing.md`. Kept only `system-images;android-28;google_apis;x86_64` (2.7 GB); removed the `e1` AVD and 30/35 stubs.
