import { Clipboard, effect, mount, platform, signal, Text, View } from "nsh";
import { Input } from "nsh/base";
import { lane, pollEvery } from "./lane";

// e1 vertical slice: one codebase, two screens, bidirectional text.
// Transport: plain HTTP on LAN via PC helper (see server.py, port 8791).
// No file UI in this slice by design.

// --- Phone screen: type + Send over LAN ---------------------------------
function PhoneSender() {
  const draft = signal("");
  const pcHost = signal("192.168.1.2:8791");
  const status = signal("Idle — type text, then Send.");
  const receivedPc = signal("");

  async function send() {
    const text = draft().trim();
    const host = pcHost().trim();
    if (!text) {
      status.set("Nothing to send — type text first.");
      return;
    }
    if (!host) {
      status.set("Enter the PC address (IP:port) first.");
      return;
    }
    status.set("Sending…");
    try {
      await lane(host).send(text);
      status.set(`Sent to ${host}: "${text}"`);
    } catch (e) {
      status.set(`Send failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function copyDraft() {
    try {
      await Clipboard.writeText(draft());
      status.set("Copied draft to clipboard.");
    } catch (e) {
      status.set(`Clipboard copy failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  effect(() => {
    const host = pcHost().trim();
    if (!host) return;
    return pollEvery(async () => {
      try {
        const { text } = await lane(host).latestPc();
        if (text) receivedPc.set(text);
      } catch {
        // Keep last received; status stays on send path.
      }
    });
  });

  async function copyReceivedPc() {
    try {
      await Clipboard.writeText(receivedPc());
      status.set("Copied PC message to clipboard.");
    } catch (e) {
      status.set(`Clipboard copy failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <View class="flex-1 p-6 gap-4 bg-background">
      <Text class="text-2xl font-semibold text-foreground">e1 — Phone</Text>
      <Text class="text-base text-muted-foreground">Type text, send it to the PC over Wi-Fi LAN.</Text>
      <Input
        testID="message"
        value={draft()}
        onChange={({ value }) => draft.set(value)}
        placeholder="Message to PC…"
        returnKeyType="send"
        onSubmit={() => void send()}
        style={{ fontSize: 17, padding: 12, borderWidth: 1, borderColor: "#d0d7de", borderRadius: 8 }}
      />
      <View onPress={() => void send()} role="button" class="rounded-(--radius) bg-primary px-5 py-3 items-center">
        <Text class="text-lg text-primary-foreground">Send to PC</Text>
      </View>
      <Text class="text-base text-muted-foreground">PC address (IP:port)</Text>
      <Input
        testID="pchost"
        value={pcHost()}
        onChange={({ value }) => pcHost.set(value)}
        placeholder="192.168.1.2:8791"
        autoCapitalize="none"
        style={{ fontSize: 17, padding: 12, borderWidth: 1, borderColor: "#d0d7de", borderRadius: 8 }}
      />
      <View onPress={() => void copyDraft()} role="button" class="rounded-(--radius) bg-muted px-5 py-3 items-center">
        <Text class="text-lg text-foreground">Copy draft</Text>
      </View>
      <Text class="text-base text-muted-foreground">Latest from PC (polled every 2s).</Text>
      <View class="rounded-(--radius) bg-muted p-4">
        <Text class="text-lg text-foreground">{receivedPc() === "" ? "(nothing yet)" : receivedPc()}</Text>
      </View>
      <View onPress={() => void copyReceivedPc()} role="button" class="rounded-(--radius) bg-muted px-5 py-3 items-center">
        <Text class="text-lg text-foreground">Copy PC message</Text>
      </View>
      <Text class="text-base text-foreground">{status()}</Text>
    </View>
  );
}

// --- PC screen: poll LAN receiver, show latest, copy to clipboard ------
function DesktopReceiver() {
  const received = signal("");
  const status = signal("Waiting for a message from the phone…");
  const draft = signal("");

  effect(() => {
    return pollEvery(async () => {
      try {
        const { text } = await lane("127.0.0.1:8791").latest();
        if (text) {
          received.set(text);
          status.set(`Latest from phone: "${text}"`);
        } else {
          status.set("Waiting for a message from the phone…");
        }
      } catch (e) {
        status.set(`Receiver unreachable: ${e instanceof Error ? e.message : String(e)}`);
      }
    });
  });

  async function copyReceived() {
    try {
      await Clipboard.writeText(received());
      status.set("Copied to clipboard.");
    } catch (e) {
      status.set(`Clipboard copy failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function sendToPhone() {
    const text = draft().trim();
    if (!text) {
      status.set("Nothing to send — type text first.");
      return;
    }
    status.set("Sending…");
    try {
      await lane("127.0.0.1:8791").sendPc(text);
      status.set(`Sent to phone: "${text}"`);
    } catch (e) {
      status.set(`Send failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <View class="flex-1 p-6 gap-4 bg-background">
      <Text class="text-2xl font-semibold text-foreground">e1 — PC</Text>
      <Text class="text-base text-muted-foreground">Latest message from the phone (polled every 2s).</Text>
      <View class="rounded-(--radius) bg-muted p-4">
        <Text class="text-lg text-foreground">{received() === "" ? "(nothing yet)" : received()}</Text>
      </View>
      <View onPress={() => void copyReceived()} role="button" class="rounded-(--radius) bg-primary px-5 py-3 items-center">
        <Text class="text-lg text-primary-foreground">Copy to clipboard</Text>
      </View>
      <Text class="text-base text-muted-foreground">Send to phone</Text>
      <Input
        testID="pcmssg"
        value={draft()}
        onChange={({ value }) => draft.set(value)}
        placeholder="Message to phone…"
        returnKeyType="send"
        onSubmit={() => void sendToPhone()}
        style={{ fontSize: 17, padding: 12, borderWidth: 1, borderColor: "#d0d7de", borderRadius: 8 }}
      />
      <View onPress={() => void sendToPhone()} role="button" class="rounded-(--radius) bg-primary px-5 py-3 items-center">
        <Text class="text-lg text-primary-foreground">Send to phone</Text>
      </View>
      <Text class="text-base text-foreground">{status()}</Text>
    </View>
  );
}

function App() {
  if (platform.desktop) return <DesktopReceiver />;
  return <PhoneSender />;
}

mount(App);
