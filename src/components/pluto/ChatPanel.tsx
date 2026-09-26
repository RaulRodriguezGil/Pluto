import { useEffect, useRef } from "react";
import { actions, usePluto } from "@/lib/pluto/store";

export function ChatPanel() {
  const open = usePluto((s) => s.chatOpen);
  const minimized = usePluto((s) => s.chatMinimized);
  const unread = usePluto((s) => s.unreadReply);
  const conversation = usePluto((s) => s.conversations.find((c) => c.id === s.activeId));
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.messages]);

  if (!open || !conversation) return null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => actions.restoreChat()}
        className="fade-rise surface fixed bottom-28 left-6 z-30 flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors hover:border-signal/60 md:bottom-8"
      >
        <span className="label-xs">Conversación</span>
        <span className="max-w-[9rem] truncate text-xs text-foreground/80">{conversation.title}</span>
        {unread && <span className="size-1.5 rounded-full bg-signal shadow-[0_0_10px_var(--signal)]" />}
      </button>
    );
  }

  return (
    <section
      aria-label="Conversación con Pluto"
      className="fade-rise fixed left-0 top-0 z-30 flex h-full w-full flex-col px-5 pb-40 pt-16 md:w-[26rem] md:px-8 md:pb-32"
      style={{
        background:
          "linear-gradient(90deg, color-mix(in oklab, var(--background) 92%, transparent) 30%, transparent 100%)",
      }}
    >
      <header className="flex items-center justify-between pb-5">
        <h2 className="label-xs truncate pr-3">{conversation.title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => actions.minimizeChat()}
            className="label-xs rounded-md px-2 py-1 transition-colors hover:text-foreground"
          >
            Minimizar
          </button>
          <button
            type="button"
            onClick={() => actions.setChatOpen(false)}
            className="label-xs rounded-md px-2 py-1 transition-colors hover:text-foreground"
          >
            Cerrar
          </button>
        </div>
      </header>

      <div className="scroll-thin flex-1 space-y-7 overflow-y-auto pr-2">
        {conversation.messages.map((m) =>
          m.role === "user" ? (
            <p
              key={m.id}
              className="ml-6 border-l border-burgundy pl-4 text-right font-mono text-[0.78rem] uppercase tracking-[0.12em] text-muted-foreground"
            >
              {m.content}
            </p>
          ) : (
            <p
              key={m.id}
              className={`whitespace-pre-wrap text-[0.95rem] leading-relaxed ${
                m.failed ? "text-destructive" : "text-foreground/95"
              }`}
            >
              {m.content}
              {m.streaming && <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-signal align-middle" />}
            </p>
          ),
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
