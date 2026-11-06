# e1 — Handoff: NSH.dev Deep-Dive + Project Birth

**Date:** 2026-11-06
**Session:** ses_e502052efffe9HTIEzDJkt9Q3k — **retired**, continuation in new session keeps going in `/data/workspace/e1/`
**Project:** `e1` inside `/data/workspace/e1/` (ABSOLUTE Stack Project Boot Sequence done)
**Driver:** Crouton Alpha (ABSOLUTE Stack OS), Tony-Stark senior-architect voice on, concepts > code
**Purpose:** Everything learned about **NSH.dev** (user wrote "NSA.dev"; correct is **NSH.dev — Native Shell by Longbridge**) plus everything done so far on e1. A fresh session should read this first, then `Requirements.md`, before writing a single line of TSX.

---

## 1. What was bootstrapped (receipts, not vibes)

**Location:** `/data/workspace/e1/`

- `mkdir -p /data/workspace/e1/tasks/{scheduled,ongoing,review,done,closed}` + `artifacts/` + `research/` — seeded
- `cp -a /data/home/stack/templates/. /data/workspace/e1/` — templates landed:
  - `Requirements.md`, `CONTEXT.md`, `Architecture.md`, `Design.md`
  - `task.md`, `handoff.md` (this file), `ci.yml`, `Upgrades.md`, `Improvements.md`, `competitive-feature-sheet.md`
- **User prompt:** "one desktop software and one APK that will live on both devices, one PC and one mobile. I can send text from my mobile to the PC. I can use my keyboard to type something on the PC or send my clipboard to the PC. I can also send my PC clipboard to my mobile, and I can also send files up to 50 MB from mobile to PC or PC to mobile. It will be connected over Wi-Fi or Bluetooth, or whatever else is best and optimized."
- **Assistant intake filled `Requirements.md` in e1:** frontmatter `name: e1`, `stack: NSH`, `tier: 1` flat build, `type: tauri-desktop` sibling / mobile, `languages: typescript, rust`. Spec, user stories, acceptance criteria, and technical defaults recorded. Phase 0 intake closed, Phase 1 scaffolding done — **no code written yet**, correctly.
- **Absolute rule for next session:** do NOT jump to `nsh init` until you read this handoff + `Requirements.md` + the feasibility probe notes in §7 below.

---

## 2. NSH.dev in 60 seconds (the framework, naked)

**Native Shell (NSH)** — "Build once, native everywhere." Longbridge (brokerage company), Apache-2.0 code, CC BY 4.0 docs, **v0.4.0 pre-1.0**.

**One codebase, 8 backends:**
- macOS: AppKit + CoreText + `NSTextView` (macOS 14+)
- Linux: GTK 4 + Pango + `GtkTextView` (GTK 4.14+)
- Windows: Win32 + Direct2D + DirectWrite (Windows 10 1809+)
- Web: HTML/CSS in browser (Wasm runtime, ~1.1 MB hello-world download)
- iOS: UIKit + CoreText + `UITextView` (iOS 15+)
- Android: Android Views + StaticLayout + `EditText` (API 28+)
- TUI: ratatui on the character grid
- GPUI: GPUI text system (embedded in GPUI Kit apps)

**Language model:** Write whole apps in Rust (native, no JS VM) **or** TSX `/ App.tsx` (QuickJS, hot updates) **or** mixed (`--template mixed` — TSX screens import Rust `#[native_module]`). Core primitives: `signal()`, `mount()`, `View`, `Text`. Only your app code is JS; reactive graph, renderer, layout, and every module are Rust, shared pipeline for both.

**Toolchain (one `nsh` binary, Rust-built):**
- `nsh init my-app --template ts|rust|mixed` — creates `App.tsx` + `nsh.json` (+ `tsconfig.json` / `.nsh/types` for TS, or Cargo project for Rust)
- `nsh run my-app [--target macos|linux|windows|web|ios|android|tui|gpui|...]` — builds, launches, hot-patches (TSX: ~120 ms save→running, preserves state if only a component changed; Rust: rebuild + restart)
- `nsh check` — TS 7 native `tsc` type-check
- `nsh test [--target ios|--target android|--target linux|...] [--trace] [--fps]` — headless tests on real targets; trace shows ops + commit ms (e.g. counter: 56 ops / 50 mount items, press = 10 ops / 7 items)
- `nsh package my-app --target ios|android|macos|linux|windows|web` — standalone installables (dmg, msi/nsis, AppImage, apk/aab, ipa)
- `nsh dev my-app` — dev server for embedding (ws://127.0.0.1:8790/ws)
- `nsh keygen` / `nsh certify` / `nsh publish` — Ed25519-signed `.nshpkg` plugins with offline root, release cert, revocation list

**Distribution & embedding modes:**
1. **Standalone** — `nsh package` installable, no Xcode/Gradle project of your own
2. **Embed** — `NshAppView` (Swift/UIKit), `NshView` (Java/Kotlin Android), `AppView` (Rust: macOS/Windows/Linux GPUI cores). Host decides capabilities: `grantCapabilities(grants)` sets network hosts, VM memory/call-time/node limits, maps/webviews as subviews
3. **Dynamic/AI-generated UI** — model writes TSX module per request → server signs → device verifies sig + cert + revocation → sandboxed run. Landing page calls out exactly this.

**UI system:** `nsh/base` unstyled components (Button, dialog, menu, data table, code editor, rich text) that own focus/keyboard/accessibility; **the app owns the look** via Tailwind classes or typed styles + `theme()` tokens (`bg-background`, `bg-primary`, `text-primary-foreground`, `rounded-(--radius)`). Flexbox layout in points, children column-by-default. Declarations generated from Rust sources + `llms.txt` for agents.

**Learning materials:** `nsh.dev/docs/getting-started`, `performance-report` with 120/144 Hz per-page frame-time histograms, `llms.txt`, AI skills via `npx skills add longbridge/nsh` (`nsh` + `nsh-design-guides`).

---

## 3. Performance & footprints (vendor-measured, Apple M3 / Win RTX 3060 Ti / Linux RTX 3060 Ti)

**Baselines & rates:**
- Counter app, headless debug: first frame ~0.5–0.65 ms; tap ~0.15 ms. Catalyst release: first frame ~1.05–1.15 ms (0.7 ms is first CoreText layout of 10 texts); tap ~0.12 ms.
- Stocks demo (22 sparklines + intraday chart + order book + tape): 117–120 FPS Linux (p95 5–6 ms, 25–32% CPU), 120 FPS macOS (p95 2.7–3.7 ms, 33–36% CPU), 143–145 FPS 4K 144 Hz Linux (p95 4.1 ms). Frames only when content changes; a page at rest draws no frame, 2–5% CPU.
- Engine startup: 75–155 µs; global APIs (`fetch`, `URL`) ~90 µs on first use.
- Hot reload: ~120 ms save→new version running; update apply 0.2–0.5 ms.

**Footprints at rest (3 s after start, 480×640 reference window):**
- macOS: TSX counter ~20 MB footprint (89 MB RSS), Rust ~19 MB (86 MB RSS), bare AppKit label ~17 MB (80 MB RSS) — so TSX overhead is **+3 MB** above bare window.
- Linux (USS, isolated): TSX counter ~79 MB private / 166 MB resident (GL), Rust ~49 / 142 MB, bare GTK label ~62 / 132 MB Vulkan (~40 / 109 MB Cairo) — so TSX overhead is **+9 MB**.
- Windows private working set: TSX ~15 MB, Rust ~14 MB (full sets ~56–71 MB).

**App size (stripped, LTO, arm64/x86_64 release runners):**
- Hello world Rust: 12.4 MB exe / 6.0 MB zip macOS, 16.5 / 7.5 MB Linux, 15.0 / 6.7 MB Windows
- Hello world TSX (QuickJS inside): 19.8 / 9.5 MB macOS, 25.7 / 11.6 MB Linux, 28.6 / 12.4 MB Windows. Your app code inside that bundle is under 1 KB.
- Production Rust apps: sysmon 0.1.3 — 21.6 MB / 8.4 MB macOS; Omasend 0.2.0 — 18.4 / 9.7 MB macOS, 22.3 / 9.8 MB Linux.

**What that means for e1:** a 50 MB file-share client will not live or die by engine micro-optimizations. It lives or dies by transport (Wi-Fi then BLE) and Android permission flows. Budget for chunking/resume and progress UI — engine budget is already won.

---

## 4. Case studies (verified from nsh.dev/apps — 7 total, 4 featured)

### 4.1 Noop — "your own AI team"
- **What:** Self-hosted AI team operator. Claude Code + Codex agents on your boxes do daily work, decide from past choices, and ping you with one-tap decision cards. Quiet, learning, yours (no shared service).
- **Platforms:** macOS, Linux, Windows, Android, iOS, Web
- **Stack:** NSH TSX clients + personal backend on your free Cloudflare account; always-on Linux primary, others slave.
- **Evidence:** `github.com/huacnlee/noop` — 141 stars, 16 forks, MIT at fetch; website `huacnlee.github.io/noop`; install scripts `install.sh` / `install-client.sh` (desktop, Windows, Android APK, unsigned iOS IPA via Sideloadly/AltStore). X post (Nov 5 2026, 18.9K views) demoed Liquid Glass + one-codebase phone/desktop/TUI.
- **Why it matters for e1:** Proves the *notify-decision* pattern and the client-only NSH surface with external backend. Not an offline template.

### 4.2 Omasend — LocalSend-compatible file sharing
- **What:** Send files, folders, screenshots, recordings, text over LAN, no account/cloud. Built for Omarchy.
- **Platforms:** Linux, macOS, Windows, Android, iOS (Featured)
- **Evidence:** `github.com/huacnlee/omasend`, `huacnlee.github.io/omasend`, showcase 42 stars. Rust 0.2.0 binaries cited in vendor performance report (see §3).
- **Why it matters for e1:** Isomorphic to e1. Offline LAN peer-to-peer, no server, packaged per-OS with `nsh package`. The architecture split (NSH = presentation + LAN stack, backend = empty) is exactly what e1 needs to copy. Limitation: Linux desktop primary, no Web player shipped — honest signal, not hidden gap.

**Other public apps to study before building:**
- **sysmon** (huacnlee, Rust, Win/macOS/Linux/iOS/Android, 17 stars) — native charts, per-app activity, dev-server/Docker workload, live gauges. Great for perf/frame budget patterns.
- **Disktree** (huacnlee, macOS/Linux, 22 stars) — nested color-coded treemap, pinch-zoom, reviewed Trash path. Great for canvas/file-ops UI.
- **Mado** (huacnlee, macOS, commercial) — Markdown reading-first for AI plans/specs, typography, outline/search, split editing, export.
- **StoatMD** (forecho, macOS/iOS, commercial) — plain `.md` folders for agents, source/split/reading views, Drive/Dropbox sync.
- **Zeedle** (Jordan-Haidee, Win/Linux/macOS, 0 stars) — local music, lyric seeking, spectrum, metadata editing port of Zeedle.

**Honesty box:** Only 7 showcase apps exist in NSH v0.4.0. Two enterprise case studies do not exist yet — do not pretend otherwise. This is a year-one runtime. Feasibility probe is not suppressed-cynical; it's how you find out if e1's clipboard-permission wall stops you cold.

---

## 5. Maturity & the Electron comparison

**GitHub at fetch (longbridge/nsh):** 1.7k stars, 103 forks, 890 commits, 61 open issues, 52 PRs. Docs: goals, platform overview, getting-started, performance report, signed-packages, sandbox-and-capabilities, testing-and-trace, plus `llms.txt` and AI skills. Community signals: showcase submissions auto-published, human Featured selection.

**Electron:** 13 years of scar tissue. Every WebView quirk, signing flow, native menu bug, updater edge case, GPU crash — Stack Overflow, issue threads, release notes. Bundle 150–200 MB, RAM 150–300 MB idle, 2–5 s startup. You pay for that armor in size, but you sleep.

**ABSOLUTE verdict:**
- **Longbridge production run tomorrow:** stay on Electron / Tauri (`/data/home/stack/agents/frontend-dev/stack/09-desktop.md` primary). Unknown unknowns dominate.
- **Side hustle / internal tool / e1 learning lab:** NSH is the interesting bet. Lack of armor is the point — you are the production test.
- **Version Freshness Gate (`/data/home/stack/agents/architect/stack/17-version-freshness-gate.md`):** v0.4.0 = WARN, bleeding-edge. Tier 1 flat build: acceptable with ADR note. Tier 4 enterprise: BLOCK until 1.0 API freeze.

---

## 6. How NSH maps to the in-house Stack (so the next agent doesn't fight the wrong rival)

**Your Stack already has three NSH-shaped things.** NSH is not competing with the ABSOLUTE process shell; it competes with these three files:

### 6.1 Tauri doctrine — the direct rival
Files: `/data/home/stack/TAURI-PATHWAY.md`, `/data/home/stack/agents/frontend-dev/stack/09-desktop.md`, `/data/home/stack/agents/frontend-dev/stack/10-mobile.md`, `/data/home/stack/agents/frontend-dev/stack/27-exe-pipeline.md`, `/data/home/stack/agents/frontend-dev/stack/26-apk-pipeline.md`

- Vision: "Desktop apps rebuilt in Tauri. Same core experience. 90% less RAM. Instant startup. 5MB installs instead of 200MB."
- Model: OS WebView (WebView2 Windows, WebKit macOS/Linux) + Rust backend via JSON IPC, capability JSON in `src-tauri/capabilities/`, plugins (fs, dialog, shell, sql, http, notification, updater, window-state, etc.).
- Bundles: 3–10 MB Tauri vs 12–19 MB NSH Rust / 19–28 MB NSH TSX. Footprint parity on macOS/Linux. Trade: WebView familiarity vs native views + Liquid Glass.
- **Missing row:** `09-desktop.md` Section 10 decision order (Tauri → Electron → tinyjs → Neutralinojs → Wails, Gluon specialist) has **no NSH row yet**. Per Stack rules, challenges must earn a row — when to consider, language/runtime, bundle, trade-off — before Phase 6 Architecture approves them. e1 will not edit that row until the feasibility probe passes.

### 6.2 Rust Injection — same obsession, different granularity
File: `/data/home/stack/agents/architect/stack/12-rust-injection.md`
- Stack doctrine: scan for hot loops, `.map().filter().reduce()` on >10K items, JSON/CSV parse >1 MB, regex-heavy, canvas pixel loops, crypto — then `wasm-pack` the offender. Verdict: INJECT / SKIP with speedup + effort hours.
- NSH doctrine: the **whole renderer is Rust**, no JS GC on the frame path. Turns every audit into INJECT ALL.
- Pair with `/data/home/stack/agents/backend-dev/stack/06-rust-stack.md` (Axum + Tokio + SQLx Postgres): your stack already trusts Rust for the backend. NSH asks you to trust Rust for the client UI too. Elegant, terrifying hiring pool.

### 6.3 Design gates — governance vs runtime
Files: `/data/home/stack/agents/ui-ux-designer/stack/16-design-quality-gates.md`, `.../12-desktop-ui.md`, `.../11-mobile-ui.md`, `.../01-design-tokens.md`
- Gate set: Visual Intent, Design System (tokens not raw hex), 8pt grid, type scale (body ≥16 px), defined states (150–250 ms), WCAG AA (4.5:1 body), responsive 375/768/1280, frontend readiness with `DESIGN.md`, **Gate 9 Theatrical** ("would a user show this to someone else").
- NSH runtime equivalent: `theme()` tokens (`bg-primary`, `text-primary-foreground`) + `nsh/base` (navigation, dialogs, menus) that own focus/keyboard/accessibility. `desktop`/`phone` idioms compile Gate 7's responsive pain away.
- Desktop spec tax (`12-desktop-ui.md`): you hand-spec window constraints (800×500 min), shortcuts (mod+k), context menus, drag threshold (5 px, 150 ms snap), tray/menuBar JSON because WebView knows nothing about native menus. NSH inherits those from AppKit/GTK/Win32 — genuine win if the runtime holds.

### 6.4 Complete-stack shape for e1 (if we build NSH)

**Frontend (NSH owns):**
- TSX `App.tsx` + `nsh.json`, `nsh check` (TS 7 native tsc), `nsh/base` components, Tailwind + `theme()` tokens, `signal()`/`mount()`, `View`/`Text`, typed styles
- Toolchain: `nsh run --target`, `nsh test --target ios/android/... --trace --fps`, `nsh package --target`, `nsh publish` signed packages
- Optional Rust layer: `src/lib.rs`, `#[component]`, `#[native_module("my-app/native")]` for hot work

**Backend (NSH does NOT own — you bring it):**
- Recommendation from Stack: Axum (`06-rust-stack.md`) + SQLx Postgres + argon2/jwt. NSH Networking client with allowlisted hosts (`grantCapabilities`) calls it; capabilities gate is the trust boundary.
- Local-first variant: SQLite on client via Rust layer, no server — Omasend pattern.
- Networked variant (if e1 grows sync/multi-user): server, file storage (`05-file-storage.md`), queues (`14-message-queues.md`), observability (`13-observability.md`). e1 v1 needs none of that.

---

## 7. e1 feasibility probe — what to run next (do not skip)

**Phase 6 probe (orchestration.md Step 1):** For each open question, the Researcher must shout **VIABLE — [evidence + limits]** or **NOT-VIABLE — [reason + alternative]**. No "maybe."

1. **Clipboard round-trip:**
   - Android permission model: `ClipboardManager` listener + foreground/background limits (Android 13+ shows system overlay on read programmatically). Does NSH `Input`/`TextView` / `EditText` bridge give you paste notifications, or do you need to host `NshView` + register a native component per Capability rules?
2. **Discovery & transport (your ask: Wi-Fi or Bluetooth, "whatever is best and optimized"):**
   - Wi-Fi LAN: NSD/mDNS + direct IP + HTTP server on PC, or BLE GATT as wake-up + Wi-Fi pivot? What is the 50 MB chunk retry model when the phone switches AP?
   - Android Hotspot mode: do you need the phone to host, or the PC? How does captive-portal / no-internet handling work in NSH WebView-less HTTP client?
   - Measure: simple probe of bytes/sec for 50 MB on the user's own router/phones before any framework commitment.
3. **APK vs Desktop packaging:**
   - Desktop target on user's OS (which OS? — Windows 10 1809+/macOS 14+/Linux GTK 4.14+ per NSH). `nsh package --target` signing/notarization path.
   - Android: `nsh package --target android` APK/AAB + keystore, ProGuard/R8 interop keep rules for Rust FFI (`26-apk-pipeline.md` pitfalls).
4. **File sharing concurrency:**
   - Chunking, resume, progress UI, SHA-256 verify, storage permission (Scoped Storage on Android 10+). 50 MB limit is a one-transfer UX promise; what is the single-transfer retry semantics when Android kills the app in background?
5. **Version Freshness Gate (`/data/home/stack/agents/architect/stack/17-version-freshness-gate.md`):**
   - Record NSH at v0.4.0, WARN bleeding-edge, downgrade plan (Tauri `09-desktop.md` or Omasend fork) in ADR. Same table as Electron 28-vs-32 example in gate doc — do not let training-data versions drift.

**Deliverable of probe:** one page in `/data/workspace/e1/research/feasibility-nsh-e1.md` with VIABLE/NOT-VIABLE per bullet + hardware tested on. No ADRs until that lands.

---

## 8. Decision journal (what we chose, what we deferred)

- **Chose:** NSH for e1 learning lab. Reason: actual cross-platform native views (not WebView) + one-codebase proof (Noop/Omasend) + performance report with per-page histograms. Pushback acknowledged: docs thin vs Electron; if docs fail we are on our own.
- **Deferred:** Section 10 Tauri table edit, `Architecture.md` write, `DESIGN.md` lock. These require a passing feasibility probe and a locked `Requirements.md` grill confirmation. Do not infer them from Venetian-demo enthusiasm.
- **Rejected:** Building a Tauri hybrid for e1. Reason: misses the experiment. e1 is a deliberately chosen NSH bet to interrogate pre-1.0 country. It stays Tier 1 flat build; any future Tier 2+ work will re-run the probe with a version-fresh check against NSH 1.0 if it ever lands.

---

## 9. For the next session (you, reading this cold)

1. **Open this file first, then read `/data/workspace/e1/Requirements.md`.** Do not `nsh init` until you have done so. Nervous energy is not architecture.
2. **Run the feasibility probe (§7)**, starting with Android clipboard + a 50 MB throughput log on the actual router/handset. Hardware truth > vendor blog.
3. **Scaffold:** `curl -fsSL https://nsh.dev/install.sh | sh` then `nsh init e1 --template ts` under `/data/workspace/e1/` — keep the templates dir you already seeded from git side-effects minimal; do not overwrite `tasks/` or `Requirements.md`.
4. **Smallest vertical slice (Tier 1 flat):** one `View` screen per device reading/writing a shared secret over LAN, no file UI yet. Prove connect + clipboard direction phone→PC. Then add reverse. Then file.
5. **Report back in the same posture:** file paths, numbers (first frame ms, runner MB, transfer MB/s), bug logs with exact NSH version (v0.4.0) and platform. If the gate fires, document it as tech debt in `Improvements.md` with current/target/blocker.

You have everything we learned in the previous session, plus the ground truth of where e1 lives. Do the probe, keep receipts, and only then celebrate Liquid Glass.

— Crouton Alpha, Absolute Stack OS (counseled by Crosshair cohort, caffeinated by NSH perf histograms)
