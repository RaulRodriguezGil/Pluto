import type { Conversation } from "@/lib/pluto/types";
import { backendConfig } from "./config";
import { bujji } from "./client";

/**
 * Expected Bujji contract (adjust here only — the UI never calls fetch):
 *   GET    /conversations            -> Conversation[]
 *   GET    /conversations/:id        -> Conversation
 *   POST   /conversations {title?}   -> Conversation
 *   DELETE /conversations/:id        -> 204
 *
 * While mocks are on, conversations live in the browser only.
 */

const KEY = "pluto.conversations.v1";

function readLocal(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — history simply does not persist */
  }
}

export const conversationsApi = {
  async list(): Promise<Conversation[]> {
    if (backendConfig.useMocks) return readLocal();
    return bujji.get<Conversation[]>("/conversations");
  },
  async get(id: string): Promise<Conversation | undefined> {
    if (backendConfig.useMocks) return readLocal().find((c) => c.id === id);
    return bujji.get<Conversation>(`/conversations/${id}`);
  },
  async remove(id: string): Promise<void> {
    if (backendConfig.useMocks) {
      writeLocal(readLocal().filter((c) => c.id !== id));
      return;
    }
    await bujji.del(`/conversations/${id}`);
  },
  /** Local persistence mirror used while mocks are enabled. */
  persist(list: Conversation[]) {
    if (backendConfig.useMocks) writeLocal(list);
  },
  readPersisted: readLocal,
};
