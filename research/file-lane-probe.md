# e1 file-lane probe — 50 MB chunked vs single-shot (2026-11-06)

## What was measured (loopback, not Wi-Fi)

- Host: `instabox-opencode` 6.18.54, Python stdlib HTTP, `127.0.0.1:8792`.
- File: `/tmp/e1-50m.bin`, 52,428,800 B (50 MiB), random bytes, SHA-256 verified.
- Chunked: 256 KiB chunks × 200, JSON `data_hex` per chunk, server reassembles and checks full SHA-256.
  - Time 0.56s, **93.7 MB/s**, assembled SHA-256 matches source (16-char prefix `159f7d602bf47d9a`).
- Single-shot: one 50 MiB `application/octet-stream` POST.
  - Time 0.84s, **62.6 MB/s**.

Chunked was faster here because the single-shot path holds the full 50 MiB body in memory twice (client + server) before parsing. The chunked path also gives resume (re-send only missing `idx`), per-chunk retry, and progress UI for free — the `fs/promises.writeFile` 8 MiB limit rules out single-shot in TSX anyway.

## Verdict

- **VIABLE — 256 KiB chunked JSON/base64 lane for the 50 MB promise.** Protocol: `POST /chunk {id, idx, total, data_hex}` + `GET /assemble/{id}` for verify. Loopback ceiling is ~60–95 MB/s; real Wi-Fi will be far lower and must be measured on the user's router/handset.
- **NOT-VIABLE — single-shot TSX write.** `writeFile` 8 MiB max, no progress/resume. Needs Rust mixed layer or Axum backend for the production lane.

## Repro

`python3 /tmp/e1_chunk_probe.py` (200 chunks, verify) and `python3 /tmp/e1_single.py` (one POST). Both use only Python stdlib.
