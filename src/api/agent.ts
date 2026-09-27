import type { ActivityItem } from "@/lib/pluto/types";
import { backendConfig } from "./config";
import { bujji, BujjiError } from "./client";
import { mockActivityFor, mockReply } from "./mocks";

export interface SendMessageArgs {
  conversationId: string;
  prompt: string;
  signal?: AbortSignal;
  onToken: (chunk: string) => void;
  onActivity: (item: Omit<ActivityItem, "id" | "at">) => void;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Expected Bujji contract:
 *   POST /agent/message { conversationId, prompt }
 *   -> text/event-stream of JSON lines:
 *      { "type": "token",    "value": "..." }
 *      { "type": "activity", "kind": "Web Search", "label": "...", "detail": "...", "status": "running" }
 *      { "type": "done" }
 * A plain JSON response { reply: string } is also accepted.
 */
export async function sendMessage(args: SendMessageArgs): Promise<void> {
  if (backendConfig.useMocks) return mockRun(args);

  const res = await bujji.stream("/agent/message", {
    conversationId: args.conversationId,
    prompt: args.prompt,
  }, args.signal);

  const body = res.body;
  if (!body) {
    const data = (await res.json().catch(() => null)) as { reply?: string } | null;
    if (!data?.reply) throw new BujjiError("Respuesta malformada de Bujji", "malformed");
    args.onToken(data.reply);
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.replace(/^data:\s*/, "").trim();
      if (!line || line === "[DONE]") continue;
      try {
        const evt = JSON.parse(line) as Record<string, unknown>;
        if (evt['type'] === "token") args.onToken(String(evt['value'] ?? ""));
        else if (evt['type'] === "activity") {
          args.onActivity({
            kind: (evt['kind'] as ActivityItem["kind"]) ?? "Agent",
            label: String(evt['label'] ?? "Actividad"),
            ...(evt['detail'] ? { detail: String(evt['detail']) } : {}),
            status: (evt['status'] as ActivityItem["status"]) ?? "running",
          });
        }
      } catch {
        args.onToken(line);
      }
    }
  }
}

async function mockRun({ prompt, onToken, onActivity }: SendMessageArgs) {
  const steps = mockActivityFor(prompt);
  for (const step of steps.slice(0, 2)) {
    onActivity(step);
    await wait(500);
    onActivity({ ...step, status: "completed" });
  }
  onActivity({ kind: "Agent", label: "Generando respuesta", status: "running" });
  const text = mockReply(prompt);
  for (const word of text.split(/(\s+)/)) {
    await wait(14);
    onToken(word);
  }
  onActivity({ kind: "Agent", label: "Generando respuesta", status: "completed" });
}
