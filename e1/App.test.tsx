import { expect, open, test } from "nsh/test";

test("phone sends text over LAN and copies draft", async () => {
  const app = await open("./App.tsx", {
    platform: "android",
    network: {
      "POST *": { body: { ok: true } },
      "GET *": { body: { text: "", ts: "" } },
    },
  });
  await app.type("id:message", "hello from phone");
  await app.press("Send to PC");
  expect(app.texts().some((t) => t.includes("Sent to"))).toBe(true);
  const reqs = app.requests().filter((r) => r.method === "POST");
  expect(reqs.length).toBe(1);
  expect(reqs[0].body ?? "").toContain("hello from phone");
  await app.press("Copy draft");
  expect(app.clipboard()).toBe("hello from phone");
});

test("pc receiver shows latest and copies it", async () => {
  const app = await open("./App.tsx", {
    platform: "linux",
    network: {
      "GET *": { body: { text: "hello from phone", ts: "2026-11-06T00:00:00Z" } },
      "POST *": { body: { ok: true } },
    },
  });
  await app.waitFor("hello from phone");
  expect(app.texts()).toContain("hello from phone");
  await app.press("Copy to clipboard");
  expect(app.clipboard()).toBe("hello from phone");
});

test("pc sends text to phone", async () => {
  const app = await open("./App.tsx", {
    platform: "linux",
    network: {
      "GET *": { body: { text: "", ts: "" } },
      "POST *": { body: { ok: true } },
    },
  });
  await app.type("id:pcmssg", "hello from pc");
  await app.press("Send to phone");
  expect(app.texts().some((t) => t.includes("Sent to phone"))).toBe(true);
  const reqs = app.requests().filter((r) => r.method === "POST");
  expect(reqs.length).toBe(1);
  expect(reqs[0].url ?? "").toContain("/send_pc");
  expect(reqs[0].body ?? "").toContain("hello from pc");
});

test("phone receives text from pc and copies it", async () => {
  const app = await open("./App.tsx", {
    platform: "android",
    network: {
      "GET *": { body: { text: "hello from pc", ts: "2026-11-06T00:00:00Z" } },
      "POST *": { body: { ok: true } },
    },
  });
  await app.waitFor("hello from pc");
  expect(app.texts()).toContain("hello from pc");
  await app.press("Copy PC message");
  expect(app.clipboard()).toBe("hello from pc");
});
