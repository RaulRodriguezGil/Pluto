import { actions, usePluto } from "@/lib/pluto/store";
import { panelMeta } from "./panelContents";

export function DynamicPanel({ slot }: { slot: "top" | "bottom" }) {
  const kind = usePluto((s) => (slot === "top" ? s.panelTop : s.panelBottom));
  const minimized = usePluto((s) => (slot === "top" ? s.panelTopMinimized : s.panelBottomMinimized));
  if (!kind) return null;

  const meta = panelMeta[kind];

  return (
    <section
      aria-label={meta.title}
      className="fade-rise pointer-events-auto w-full max-w-[19rem] rounded-xl border border-border/50 bg-background/40 p-4 backdrop-blur-sm"
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="label-xs">{meta.title}</h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => actions.togglePanelMinimized(slot)}
            aria-label={minimized ? `Abrir ${meta.title}` : `Minimizar ${meta.title}`}
            className="label-xs rounded px-1.5 py-0.5 transition-colors hover:text-foreground"
          >
            {minimized ? "+" : "–"}
          </button>
          <button
            type="button"
            onClick={() => actions.closePanel(slot)}
            aria-label={`Cerrar ${meta.title}`}
            className="label-xs rounded px-1.5 py-0.5 transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
      </header>
      {!minimized && <div className="pt-3">{meta.render()}</div>}
    </section>
  );
}

export function RightPanels() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-20 hidden h-full flex-col justify-between gap-6 px-6 py-16 md:flex">
      <DynamicPanel slot="top" />
      <DynamicPanel slot="bottom" />
    </div>
  );
}
