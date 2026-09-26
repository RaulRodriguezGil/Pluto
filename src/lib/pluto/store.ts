import { useSyncExternalStore } from "react";
import type {
  ActivityItem,
  ConnectionStatus,
  Conversation,
  Message,
  OverlayKind,
  PanelKind,
  PlutoState,
  SystemInfo,
} from "./types";
import { conversationsApi } from "@/api/conversations";
import { systemApi } from "@/api/system";
import { sendMessage } from "@/api/agent";
import { dataSource } from "@/api/config";

export interface PlutoStore {
  plutoState: PlutoState;
  connection: ConnectionStatus;
  conversations: Conversation[];
  activeId: string | null;
  chatOpen: boolean;
  chatMinimized: boolean;
  menuOpen: boolean;
  overlay: OverlayKind;
  panelTop: PanelKind;
  panelBottom: PanelKind;
  panelTopMinimized: boolean;
  panelBottomMinimized: boolean;
  activity: ActivityItem[];
  pendingTasks: number;
  unreadReply: boolean;
  system: SystemInfo | null;
  error: string | null;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

let state: PlutoStore = {
  plutoState: "IDLE",
  connection: "UNKNOWN",
  conversations: [],
  activeId: null,
  chatOpen: false,
  chatMinimized: false,
  menuOpen: false,
  overlay: null,
  panelTop: null,
  panelBottom: null,
  panelTopMinimized: false,
  panelBottomMinimized: false,
  activity: [],
  pendingTasks: 0,
  unreadReply: false,
  system: null,
  error: null,
};

const listeners = new Set<() => void>();
const serverSnapshot = state;

function set(patch: Partial<PlutoStore>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function usePluto<T>(select: (s: PlutoStore) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
    () => select(serverSnapshot),
  );
}

export const getState = () => state;

function activeConversation(): Conversation | undefined {
  return state.conversations.find((c) => c.id === state.activeId);
}

function updateActive(fn: (c: Conversation) => Conversation) {
  const conversations = state.conversations.map((c) =>
    c.id === state.activeId ? fn({ ...c }) : c,
  );
  set({ conversations });
  conversationsApi.persist(conversations);
}

function titleFrom(prompt: string) {
  const t = prompt.trim().replace(/\s+/g, " ");
  return t.length > 42 ? `${t.slice(0, 42)}…` : t || "Conversación";
}

export const actions = {
  async hydrate() {
    const conversations = await conversationsApi.list().catch(() => []);
    set({ conversations });
    void actions.refreshSystem();
  },

  async refreshSystem() {
    try {
      const system = await systemApi.status();
      set({
        system,
        connection: dataSource() === "mock" ? "UNKNOWN" : system.pluto === "ONLINE" ? "ONLINE" : "OFFLINE",
      });
    } catch {
      set({ connection: "OFFLINE", plutoState: "OFFLINE" });
    }
  },

  newConversation(): string {
    const conv: Conversation = {
      id: uid(),
      title: "Nueva conversación",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    const conversations = [conv, ...state.conversations];
    set({ conversations, activeId: conv.id, chatOpen: false, chatMinimized: false, activity: [] });
    conversationsApi.persist(conversations);
    return conv.id;
  },

  openConversation(id: string) {
    set({ activeId: id, chatOpen: true, chatMinimized: false, overlay: null, menuOpen: false, unreadReply: false });
  },

  renameConversation(id: string, title: string) {
    const conversations = state.conversations.map((c) => (c.id === id ? { ...c, title } : c));
    set({ conversations });
    conversationsApi.persist(conversations);
  },

  async deleteConversation(id: string) {
    await conversationsApi.remove(id).catch(() => undefined);
    const conversations = state.conversations.filter((c) => c.id !== id);
    set({
      conversations,
      activeId: state.activeId === id ? null : state.activeId,
      chatOpen: state.activeId === id ? false : state.chatOpen,
    });
    conversationsApi.persist(conversations);
  },

  setChatOpen(open: boolean) {
    set({ chatOpen: open, chatMinimized: false, unreadReply: open ? false : state.unreadReply });
  },
  minimizeChat() {
    set({ chatMinimized: true });
  },
  restoreChat() {
    set({ chatMinimized: false, chatOpen: true, unreadReply: false });
  },
  setMenuOpen(open: boolean) {
    set({ menuOpen: open });
  },
  setOverlay(overlay: OverlayKind) {
    set({ overlay, menuOpen: false });
  },
  setPanel(slot: "top" | "bottom", kind: PanelKind) {
    set(slot === "top" ? { panelTop: kind, panelTopMinimized: false } : { panelBottom: kind, panelBottomMinimized: false });
  },
  togglePanelMinimized(slot: "top" | "bottom") {
    set(
      slot === "top"
        ? { panelTopMinimized: !state.panelTopMinimized }
        : { panelBottomMinimized: !state.panelBottomMinimized },
    );
  },
  closePanel(slot: "top" | "bottom") {
    set(slot === "top" ? { panelTop: null } : { panelBottom: null });
  },

  pushActivity(item: Omit<ActivityItem, "id" | "at">) {
    const existing = [...state.activity];
    const idx = existing.findIndex((a) => a.label === item.label && a.kind === item.kind);
    if (idx >= 0) existing[idx] = { ...existing[idx]!, ...item };
    else existing.push({ ...item, id: uid(), at: Date.now() });
    set({ activity: existing.slice(-12), panelTop: state.panelTop ?? "activity" });
  },

  async send(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    if (!state.activeId) actions.newConversation();

    const userMsg: Message = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    };

    updateActive((c) => ({
      ...c,
      title: c.messages.length === 0 ? titleFrom(text) : c.title,
      updatedAt: Date.now(),
      messages: [...c.messages, userMsg, assistantMsg],
    }));

    set({
      chatOpen: true,
      plutoState: "LISTENING",
      pendingTasks: state.pendingTasks + 1,
      error: null,
      activity: [],
      panelTop: state.panelTop ?? "activity",
    });

    const patchAssistant = (patch: Partial<Message>) =>
      updateActive((c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: c.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      }));

    try {
      await new Promise((r) => setTimeout(r, 180));
      set({ plutoState: "THINKING" });
      let acc = "";
      await sendMessage({
        conversationId: state.activeId!,
        prompt: text,
        onActivity: (item) => {
          actions.pushActivity(item);
          if (item.kind !== "Agent" && state.plutoState !== "RESPONDING") set({ plutoState: "EXECUTING" });
        },
        onToken: (chunk) => {
          acc += chunk;
          if (state.plutoState !== "RESPONDING") set({ plutoState: "RESPONDING" });
          patchAssistant({ content: acc });
        },
      });
      patchAssistant({ streaming: false });
      set({
        plutoState: "IDLE",
        pendingTasks: Math.max(0, state.pendingTasks - 1),
        unreadReply: state.chatMinimized || !state.chatOpen,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fallo desconocido";
      patchAssistant({ streaming: false, failed: true, content: message });
      actions.pushActivity({ kind: "Agent", label: "Tarea fallida", detail: message, status: "failed" });
      set({
        plutoState: message.toLowerCase().includes("contactar") ? "OFFLINE" : "ERROR",
        connection: "OFFLINE",
        error: message,
        pendingTasks: Math.max(0, state.pendingTasks - 1),
      });
      setTimeout(() => set({ plutoState: state.connection === "OFFLINE" ? "OFFLINE" : "IDLE" }), 4000);
    }
  },

  activeConversation,
};
