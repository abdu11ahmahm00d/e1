# e1 feasibility probe — NSH.dev (2026-11-06, updated)

Runtime: **nsh 0.4.0 (e626a8d)**, `longbridge/nsh` v0.4.0 (2026-11-04), `nsh-linux-x86_64.tar.gz` 433,938,788 B.
Host: Linux `instabox-opencode` 6.18.54, Debian 13 (trixie) x86_64, `eth0` 172.16.0.2/30, Tailscale 100.117.205.22 — headless sandbox, **no Wi-Fi, no Android device/adb, GTK3 only at first** (GTK4 now installed — see §3).

## 1. Clipboard round-trip — VIABLE (button-triggered only) / ambient NOT-VIABLE

- **VIABLE — button-triggered copy both ways.** `Clipboard.writeText/readText/hasText` exists on every backend (Android `ClipboardManager`, desktops `NSPasteboard`/GDK/Win32, TSX import `Clipboard` from `nsh`), gated by `capabilities.clipboard: true`. Slice proves it headless: phone test types `hello from phone`, presses Send (stubbed `POST *`), presses `Copy draft` → `app.clipboard()` equals the draft; PC test polls `GET *`, presses `Copy to clipboard` → `SetClipboard("hello from phone")` op captured. Input `onPaste` also delivers `{text, html, files, uris}`.
- **NOT-VIABLE — ambient auto-sync.** No `addPrimaryClipChangedListener` equivalent: docs/types expose only `readText/hasText/writeText` (no listener/watch/poll callback). Android 13+ also shows a system overlay on programmatic read; NSH `readText` docs note the paste notice. Alternative: explicit Copy/Paste buttons (what the slice does); if true ambient sync is mandatory, host `NshView` + a Rust `#[native_module]` that registers the listener under Capability rules.

## 2. Discovery & transport (Wi-Fi/BLE) — VIABLE (text over LAN) / file & discovery NOT-VIABLE here

- **VIABLE — text phone↔PC over LAN (bidirectional).** TSX `fetch` runs on the platform stack (Android `HttpURLConnection`, server/browser stack elsewhere) with `network.hosts: ["*"]` covering LAN IPs. Slice: phone `POST http://<PC>:8791/send {"text"}` → PC helper `server.py` → PC NSH app polls `GET /latest` every 2s; reverse PC `POST http://127.0.0.1:8791/send_pc` → phone polls `GET /latest_pc` every 2s. Headless `nsh test` 4/4 pass; live smoke of `server.py`: `GET /health` `{"ok":true}`, `POST /send` → `GET /latest` round-trip OK, `POST /send_pc` → `GET /latest_pc` round-trip OK.
- **NOT-VIABLE (this session) — mDNS/NSD, BLE, hotspot, 50 MB Wi-Fi MB/s.** No mDNS/BLE/server-listen APIs in TSX (`fetch`/`net.connect`/`websocket.connect` are clients only; `net` needs exact `host:port` grants), no handset/router to measure on, sandbox has no Wi-Fi. Loopback-only 50 MB probe (DUMMY file, `python3 http.server` → `curl`): **1.45–3.11 GB/s** — proves localhost stack, **not** Wi-Fi. Alternative: static IP:port entry (shipped), manual `ping`/`iperf3`/50 MB `curl` from phone on the user's router/handset (see Improvements.md), Rust mixed `native_module` server next.

## 3. APK vs Desktop packaging — VIABLE (package + Linux run) / Android live-device blocked only

- **VIABLE — `nsh package --target linux` ships.** Runner `.nsh/out/e1/e1` **49 MB** ELF (not stripped), `e1.tar.gz` **20 MB**, bundle `bundle.js` 6.8 KB / `bundle.nshc` 20 KB; `capabilities.json` emitted (`network.hosts ["*"]`, `clipboard true`) plus placeholder-id warning.
- **VIABLE (updated) — `nsh run --target linux`.** After installing `libgtk-4-1 libwebkitgtk-6.0-4 libgraphene-1.0-0 libjavascriptcoregtk-6.0-1 libwebkit2gtk-4.1-dev xvfb`, `ldd .nsh/out/e1/e1` is clean and `timeout 25 xvfb-run -a nsh run e1 --target linux` builds 8.3 KB JS / 30.7 KB bytecode and connects (`Linux (instabox-opencode) connected, build 1`).
- **VIABLE — `nsh package --target android`.** With `ANDROID_HOME=/data/home/Android/Sdk` and `platforms;android-35` + `build-tools;35.0.0`, `nsh package e1 --target android` produces **61 MB APK** at `.nsh/out/e1.apk` (arm64-v8a + armeabi-v7a, debug-signed) in ~33s. Re-run confirmed 2026-11-06 11:47 UTC.
  - **APK breakdown (unzip -l):** `lib/arm64-v8a/libnsh.so` 37,015,424 B, `lib/armeabi-v7a/libnsh.so` 26,143,496 B, `classes.dex` 377,928 B, `assets/nsh/bundle.nshc` 5,082 B. The 61 MB is the **prebuilt NSH runtime**, not e1 code (bundle is <7 KB JS). Single-ABI `nsh package --target android --abi arm64-v8a` → **36 MB** APK (`.nsh/out-arm64/e1.apk`). Dev vs release runtime on disk: dev arm64 37 MB vs release 36 MB — no `package --release` flag exists; `nsh build --release` only minifies the TSX bundle (3.9 KB JS), not `libnsh.so`. A <1 MB APK is not possible here: the native shell itself is ~36 MB compressed per ABI.
- **BLOCKED only — `nsh test --target android` live-device run.** Errors correctly with `no Android device or emulator connected (see adb devices)`. No USB device; the AVD emulator needs **7,372 MB** userdata free but `/data` has only ~6.4 GB free and no KVM. Emulator is NOT the path here — use a real handset + `scrcpy` (see `research/small-footprint-android-testing.md`). Headless `nsh test e1` (no target) still passes 2/2.
- **VIABLE — `nsh package --target web`.** Static site **5.4 MB** (`index.html` + Wasm runtime 4.1 MB) at `.nsh/out-web/e1` when using `-o`, so the Linux runner dir is not clobbered.

## 4. File sharing concurrency (50 MB) — NOT-VIABLE in pure TSX slice

- **NOT-VIABLE as a pure-TSX 50 MB file path.** `fs/promises` is desktop/browser only (`writeFile` 8 MiB max, `readFile` 64 MiB, in-flight 64 MiB) — a single `writeFile` cannot hold 50 MB; no chunk/resume/progress/SHA-256-verify API; mobile generic-file pick is photo-only (`Picker.pickImages`); scoped-storage/background-kill semantics untested without a device. The slice ships **no file UI** by design. Alternative: Rust mixed layer (or Axum backend per Stack `06-rust-stack.md`) with 256 KB–1 MB chunks, per-chunk SHA-256, progress UI, resume tokens.

## 5. Version Freshness Gate — WARN (bleeding-edge, Tier 1 acceptable)

- v0.4.0 is **pre-1.0**; 7 showcase apps, no enterprise case studies; docs grew thin on server/mDNS/BLE/clipboard-listener (see below). Per Tier 1 flat rule (architect `17-version-freshness-gate.md`): acceptable with ADR note + downgrade plan (Tauri `09-desktop.md` primary, or Omasend fork) — BLOCK for Tier 4 enterprise until 1.0 API freeze. Logged in `Improvements.md` with current/target/blocker. Exact runtime pinned everywhere as **nsh 0.4.0 (e626a8d)**.

### Measured slice numbers

Bundle: 10498 B JS (re-test 2026-11-06 bidirectional) in 2.8 ms. Headless first frame: phone **1.766 ms** total (eval 890 µs), PC **1.347 ms** (eval 606 µs); 61 ops / 196 µs commit, 18 nodes. Build: 5.9 KB JS, 7.0 KB bytecode. `nsh check` pass, `nsh test` 4/4 pass (1.1s). Runner 49 MB / tar 20 MB. APK 61 MB (36 MB arm64-only). Web 5.4 MB. Transfer: 50 MB loopback 1.45–3.11 GB/s (not Wi-Fi).

### Docs gaps hit

- Clipboard: no listener/background-read story; `readText` overlay behavior undocumented per-OS.
- Networking: no server-listen/mDNS/BLE story in TSX; capabilities needed for LAN IPs (`hosts ["*"]`) only learned via `sandbox-and-capabilities`, not a LAN example.
- Linux run blockers (GTK4/WebKit deps) only surface at `nsh run` time, not in `installation.md` preflight.
- Android packaging stops at `ANDROID_HOME` with no version table (API 28+ only in prose).
