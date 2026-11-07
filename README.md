# e1 — NSH bidirectional LAN slice (Tier 1)

One TSX codebase → Windows desktop + Android APK: bidirectional text, clipboard on demand, 50 MB files (chunked lane probed, no file UI yet).

**Repo:** https://github.com/abdu11ahmahm00d/e1 · **NSH:** `nsh 0.4.0 (e626a8d)` (pre-1.0 — gate in `Improvements.md`)

## Run / verify (30 seconds, this box)

```bash
export PATH="$HOME/.local/bin:$PATH"   # after `curl -fsSL https://nsh.dev/install.sh | sh`
nsh check e1                          # pass
nsh test e1                           # 4/4 (both directions + both clipboards)
nsh package e1 --target android --abi arm64-v8a -o .nsh/out-arm64  # 36 MB APK
nsh package e1 --target web -o .nsh/out-web                       # 5.4 MB web (no GTK)
# Windows runner: `nsh package e1 --target windows` — needs Windows host/CI (no ~/ .nsh/bin/nsh-windows-app here)
```

```bash
python3 e1/server.py &               # PC helper on 0.0.0.0:8791 (GET /health)
python3 scripts/e1-cli.py send "hello from cli"        # -> PC
python3 scripts/e1-cli.py recv                          # <- from PC
python3 scripts/e1-cli.py send "hi" --to phone          # -> phone (reverse)
python3 scripts/e1-cli.py recv --from phone             # <- from phone
./scripts/handset-smoke.sh         # adb install + scrcpy (needs your handset)
```

## Layout

- `e1/App.tsx` — phone sender (`platform.desktop` false) + PC receiver (true), `nsh.json` (`clipboard` + `network.hosts ["*"]`), `e1/App.test.tsx`, `e1/server.py` (LAN helper — pure-TSX has no listen socket).
- `research/feasibility-nsh-e1.md` — VIABLE/NOT-VIABLE per probe bullet (clipboard, LAN, builds, 50 MB lane, gate).
- `research/file-lane-probe.md` — 50 MiB chunked (93.7 MB/s loopback) vs single-shot (62.6 MB/s); real Wi-Fi still TBD.
- `research/small-footprint-android-testing.md` — why emulator is out, headless `nsh test` + `scrcpy` is in.
- `.github/workflows/apk.yml` — `android` job (ubuntu-24.04: SDK `platform-tools`/`platforms;android-35`/`build-tools;35.0.0`, no emulator) + `windows` job (windows-latest). Artifacts per push, `e1.apk` + `e1.zip` on `v*` tags.
- `handoff.md`, `Requirements.md`, `CONTEXT.md`, `Improvements.md` — intent, language, version gate. Read those first.

## How to continue (next agent)

1. Read `handoff.md` → `Requirements.md` → `CONTEXT.md` → `research/feasibility-nsh-e1.md`.
2. Re-run: `nsh check e1 && nsh test e1` (must be 4/4).
3. Blocked on hardware: plug in Android handset + router, run `scripts/handset-smoke.sh`, log clipboard round-trip + 50 MB Wi-Fi MB/s into `research/feasibility-nsh-e1.md`.
4. Then: Rust mixed `native_module` server to replace `server.py`, file UI on the chunked lane, mDNS/BLE discovery.

## Not in repo (by design)

`.nsh/out*` (128 MB runner, 36 MB APK, 9.7 MB web) and `*.apk` — build artifacts, CI rebuilds them. Linux runner kept only as a build artifact; primary desktop is Windows.
