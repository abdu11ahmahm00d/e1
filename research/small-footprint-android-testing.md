# Small-footprint Android testing for e1 (2026-11-06)

## Why the emulator is out

Emulator 37.2.13 insists on a **7,372 MB** userdata partition. This box has a 20 GB disk with ~6.4 GB free and no KVM (`/dev/kvm` absent). Switching system images (android-35 3.5 GB → android-30 3.3 GB → android-28 2.7 GB) does not shrink the userdata requirement. Cost: ~3–7 GB disk, 2–3 GB RAM, slow boot.

Emulator logs on this host: `Not enough space to create userdata partition. Available: ~6053 MB, need 7372 MB.` This is a sandbox constraint, not an NSH bug.

## What GitHub shows

- `longbridge/nsh` (1.8k stars, 106 forks): Android needs SDK API 28+ and a real device or emulator, but NSH also ships `web` and `tui` targets. `nsh run --target web` needs only a browser; `nsh run --target tui` needs only a terminal. Both cost MBs, not GBs, and let you iterate UI without any VM.
- `Genymobile/scrcpy` v5.0.1: the right small replacement for the emulator. No root, no app installed on the phone, works via USB or TCP/IP (`adb pair` + `adb connect`), API 21+, 35–70 ms latency, ~1 second startup. Run with `scrcpy -m1024` to stay light. It mirrors your real handset — exactly what e1 needs for clipboard round-trip and 50 MB Wi-Fi MB/s.

## Recommended Tier 1 path (disk < 1 GB for test tooling)

1. Headless gate — `nsh test /data/workspace/e1/e1` (already 2/2 pass, stubs `fetch`/`Clipboard`). No device, no SDK image needed.
2. Build — `nsh package /data/workspace/e1/e1 --target android` with `ANDROID_HOME=/data/home/Android/Sdk` (already installed: platform-tools 37.0.1, platforms;android-35, build-tools;35.0.0). Output is 61 MB APK at `.nsh/out/e1.apk`.
3. Install + control — `adb install .nsh/out/e1.apk` over USB or Wi-Fi (`adb pair` + `adb connect <ip>:<port>`), then `scrcpy -m1024` for interaction. No 7 GB userdata image is ever created.
4. UI-only iteration with no handset — `nsh package /data/workspace/e1/e1 --target web -o /data/workspace/e1/.nsh/out-web` (5.4 MB static site) or `nsh run /data/workspace/e1/e1 --target web`.

## Cleanup for small disks

- Keep only `platforms;android-35` + `build-tools;35.0.0` + `platform-tools`. Delete `system-images;android-30` / `android-35` leftovers (8 KB stub dirs remain) and the `e1` AVD (`~/.config/.android/avd/e1*`) to reclaim RAM and disk.
- Keep `system-images;android-28;google_apis;x86_64` (2.7 GB) only if you demo the emulator on a bigger machine later. On a 6 GB-free box it will not boot.
