// e1 lane module — the deep LAN contract (slice). One owner for routes + hosts.
// Imported by App.tsx (phone sender + PC receiver) and tested via nsh/test.

export type Lane = {
  send: (text: string) => Promise<void>;
  sendPc: (text: string) => Promise<void>;
  latest: () => Promise<{ text: string; ts: string }>;
  latestPc: () => Promise<{ text: string; ts: string }>;
};

export function lane(host: string): Lane {
  const base = `http://${host.trim()}`;
  async function post(path: string, text: string): Promise<void> {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
  async function get(path: string): Promise<{ text: string; ts: string }> {
    const res = await fetch(`${base}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { text?: string; ts?: string };
    return { text: data.text ?? "", ts: data.ts ?? "" };
  }
  return {
    send: (text) => post("/send", text),
    sendPc: (text) => post("/send_pc", text),
    latest: () => get("/latest"),
    latestPc: () => get("/latest_pc"),
  };
}

export function pollEvery(
  fn: () => Promise<void>,
  ms = 2000,
): () => void {
  let stopped = false;
  const tick = () => {
    if (!stopped) void fn();
  };
  void fn();
  const id = setInterval(tick, ms);
  return () => {
    stopped = true;
    clearInterval(id);
  };
}
