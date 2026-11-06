#!/usr/bin/env bash
# e1 handset smoke — run on the PC that has your Android phone.
# Steps: start PC helper, install APK, open scrcpy, verify both directions.
set -euo pipefail
E1_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APK="$E1_DIR/.nsh/out-arm64/e1.apk"
echo "== e1 handset smoke =="
echo "APK: $APK"
[ -f "$APK" ] || { echo "Missing APK — build: nsh package e1 --target android --abi arm64-v8a -o .nsh/out-arm64"; exit 1; }
if ! command -v python3 >/dev/null; then echo "python3 missing"; exit 1; fi
if ! command -v adb >/dev/null; then echo "adb missing — install platform-tools (ANDROID_HOME=$ANDROID_HOME)"; exit 1; fi
echo "--- devices ---"
adb devices
echo "--- start PC helper on 0.0.0.0:8791 ---"
python3 "$E1_DIR/e1/server.py" &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 1
echo "--- health ---"
curl -fsS http://127.0.0.1:8791/health; echo
echo "--- install APK ---"
adb install -r "$APK"
echo "--- mirror (scrcpy, optional: Ctrl-C to quit) ---"
if command -v scrcpy >/dev/null; then
  scrcpy -m1024
else
  echo "scrcpy not found — open the e1 app on the phone manually."
  echo "Phone: enter PC IP:8791, type text, Send to PC."
  echo "PC:    type text, Send to phone; check phone Latest from PC."
fi
echo "--- verify reverse channel ---"
curl -fsS -X POST -H 'Content-Type: application/json' -d '{"text":"smoke from pc"}' http://127.0.0.1:8791/send_pc; echo
curl -fsS http://127.0.0.1:8791/latest_pc; echo
