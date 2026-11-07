#!/usr/bin/env python3
"""e1 LAN helper (PC side, slice only).

Run on the PC:  python3 server.py   (binds 0.0.0.0:8791)
Phone -> PC:  POST /send {"text": "..."}   -> PC polls GET /latest
PC -> Phone:  POST /send_pc {"text": "..."} -> phone polls GET /latest_pc
Chunked lane: POST /chunk {"id", "index", "total", "data"} (base64)
              GET /assemble/{id}            -> {"ok", "sha256", "bytes"}

Why a Python helper: pure-TSX NSH has no HTTP listen socket (fetch/net are
client-only), so the slice's receiver is this helper. The native Rust
native_module server is the follow-up (see research/feasibility-nsh-e1.md).
Stdlib only, in-memory store, locked. Tier 1 slice — no auth, no persistence.
"""
import base64
import hashlib
import json
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

_state = {"text": "", "ts": "", "text_pc": "", "ts_pc": ""}
_chunks = {}  # id -> {"total": int, "parts": {index: bytes}}
_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Handler(BaseHTTPRequestHandler):
    server_version = "e1-helper/1"

    def _json(self, code: int, obj: dict) -> None:
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"ok": True})
        elif self.path == "/latest":
            with _lock:
                self._json(200, {"text": _state["text"], "ts": _state["ts"]})
        elif self.path == "/latest_pc":
            with _lock:
                self._json(200, {"text": _state["text_pc"], "ts": _state["ts_pc"]})
        elif self.path.startswith("/assemble/"):
            tid = self.path.split("/", 2)[2] or ""
            with _lock:
                entry = _chunks.get(tid)
                if entry is None or len(entry["parts"]) != entry["total"]:
                    self._json(200, {"ok": False, "missing": entry is None or len(entry["parts"])})
                    return
                blob = b"".join(entry["parts"][i] for i in range(entry["total"]))
                self._json(200, {"ok": True, "sha256": hashlib.sha256(blob).hexdigest(), "bytes": len(blob)})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/chunk":
            data = self._read_body()
            if data is None:
                self._json(400, {"error": "bad json"})
                return
            try:
                tid = str(data["id"]); idx = int(data["index"]); total = int(data["total"])
                chunk = base64.b64decode(data["data"])
            except Exception:
                self._json(400, {"error": "bad chunk"})
                return
            with _lock:
                e = _chunks.setdefault(tid, {"total": total, "parts": {}})
                e["total"] = total; e["parts"][idx] = chunk
                self._json(200, {"ok": True, "have": len(e["parts"]), "total": total})
            return
        if self.path not in ("/send", "/send_pc"):
            self._json(404, {"error": "not found"})
            return
        data = self._read_body()
        if data is None:
            self._json(400, {"error": "bad json"})
            return
        text = str(data.get("text", ""))
        ts = _now()
        with _lock:
            if self.path == "/send":
                _state["text"] = text; _state["ts"] = ts
            else:
                _state["text_pc"] = text; _state["ts_pc"] = ts
        self._json(200, {"ok": True, "ts": ts})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("0.0.0.0", 8791), Handler)
    print("e1 helper on 0.0.0.0:8791 (POST /send, GET /latest, POST /send_pc, GET /latest_pc, POST /chunk, GET /assemble/{id})")
    srv.serve_forever()
