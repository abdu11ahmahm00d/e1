#!/usr/bin/env python3
"""e1 CLI — terminal client for the bidirectional text slice.

Talks to the PC helper (e1/server.py) on the same LAN contract as the
NSH apps. Stdlib only.

Usage:
  python3 e1-cli.py send "hello from cli" [--host 192.168.1.2:8791]
  python3 e1-cli.py recv [--host 192.168.1.2:8791]
  python3 e1-cli.py copy [--host 192.168.1.2:8791] [--to phone|pc]

Copy uses the system clipboard tool if present (xclip/xsel/wl-copy/pbcopy/
powershell). Otherwise it just prints the text.
"""
import argparse, json, shutil, subprocess, sys, urllib.request

def fetch(host, path, data=None):
    url = f"http://{host}{path}"
    if data is not None:
        body = json.dumps({"text": data}).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    else:
        req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read().decode())

def copy_to_clipboard(text):
    for cmd in (["xclip", "-selection", "clipboard"], ["xsel", "--clipboard"], ["wl-copy"], ["pbcopy"]):
        exe = shutil.which(cmd[0])
        if exe:
            try:
                subprocess.run([exe, *cmd[1:]], input=text.encode(), check=True, timeout=5)
                return True
            except Exception:
                pass
    # Windows PowerShell fallback
    if shutil.which("powershell.exe") or shutil.which("pwsh.exe"):
        exe = shutil.which("powershell.exe") or shutil.which("pwsh.exe")
        try:
            subprocess.run([exe, "-NoProfile", "-Command", "Set-Clipboard"],
                           input=text.encode(), check=True, timeout=5)
            return True
        except Exception:
            pass
    return False

def main():
    p = argparse.ArgumentParser(description="e1 CLI — send/receive text over LAN")
    p.add_argument("--host", default="127.0.0.1:8791", help="PC helper host:port (default 127.0.0.1:8791)")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("send"); s.add_argument("text")
    s.add_argument("--to", choices=["pc", "phone"], default="pc")
    r = sub.add_parser("recv"); r.add_argument("--from", dest="from_dir", choices=["pc", "phone"], default="pc")
    c = sub.add_parser("copy"); c.add_argument("--from", dest="from_dir", choices=["pc", "phone"], default="pc")
    a = p.parse_args()
    try:
        if a.cmd == "send":
            path = "/send" if a.to == "pc" else "/send_pc"
            print(fetch(a.host, path, a.text))
        elif a.cmd == "recv":
            path = "/latest" if a.from_dir == "pc" else "/latest_pc"
            d = fetch(a.host, path)
            print(d.get("text", ""))
        elif a.cmd == "copy":
            path = "/latest" if a.from_dir == "pc" else "/latest_pc"
            text = fetch(a.host, path).get("text", "")
            if not text:
                print("nothing to copy")
                return
            print(text)
            print("copied" if copy_to_clipboard(text) else "clipboard tool not found — text printed above")
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
