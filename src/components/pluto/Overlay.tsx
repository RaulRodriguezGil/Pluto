import { useEffect, useState } from "react";
import { actions, usePluto } from "@/lib/pluto/store";
import type { OverlayKind } from "@/lib/pluto/types";
import { SystemContent } from "./panels/panelContents";
import { backendConfig } from "@/api/config";

const titles: Record<Exclude<OverlayKind, null>, string> = {
  historial: "Historial",
  memoria: "Memoria",
  actividad: "Actividad",
  herramientas: "Herramientas",
  sistema: "Sistema",
  configuracion: "Configuración",
  conexiones: "Conexiones",
  voz: "Voz",
  telegram: "Telegram",
  informacion: "Información",
};

export function Overlay() {
  const overlay = usePluto((s) => s.overlay);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && actions.setOverlay(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!overlay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titles[overlay]}
        className="fade-rise surface flex max-h-[80vh] w-full max-w-xl flex-col rounded-2xl p-6"
      >
        <header className="flex items-center justify-between pb-5">
          <h2 className="label-xs">{titles[overlay]}</h2>
          <button
            type="button"
            onClick={() => actions.setOverlay(null)}
            className="label-xs rounded px-2 py-1 transition-colors hover:text-foreground"
          >
            Cerrar
          </button>
        </header>
        <div className="scroll-thin overflow-y-auto pr-1">{renderBody(overlay)}</div>
      </div>
    </div>
  );
}

function renderBody(kind: Exclude<OverlayKind, null>) {
  switch (kind) {
    case "historial":
      return <History />;
    case "sistema":
      return <SystemContent />;
    case "actividad":
      return <ActivityFull />;
    case "informacion":
      return (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground/90">Pluto — interfaz del asistente personal.</p>
          <p>
            Esta interfaz habla únicamente con Bujji. No contiene claves ni llama a ningún proveedor de modelos
            directamente.
          </p>
          <p className="font-mono text-[0.7rem]">
            {backendConfig.useMocks ? "MODO MOCK ACTIVO" : `BUJJI · ${backendConfig.backendUrl}`}
          </p>
        </div>
      );
    default:
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Esta sección está preparada pero aún no conectada a Bujji. No se muestran datos simulados como reales.
        </p>
      );
  }
}

function ActivityFull() {
  const activity = usePluto((s) => s.activity);
  if (!activity.length)
    return <p className="text-sm text-muted-foreground">Sin actividad en la sesión actual.</p>;
  return (
    <ul className="space-y-3 text-sm">
      {activity.map((a) => (
        <li key={a.id} className="flex justify-between gap-4 border-b border-border/40 pb-2">
          <span className="text-foreground/90">{a.label}</span>
          <span className="label-xs">{a.status}</span>
        </li>
      ))}
    </ul>
  );
}

function History() {
  const conversations = usePluto((s) => s.conversations);
  const activeId = usePluto((s) => s.activeId);
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar conversación"
          aria-label="Buscar conversación"
          className="flex-1 rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-signal/60"
        />
        <button
          type="button"
          onClick={() => {
            actions.newConversation();
            actions.setOverlay(null);
          }}
          className="label-xs rounded-lg border border-border/60 px-3 transition-colors hover:border-signal/60 hover:text-foreground"
        >
          Nueva
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay conversaciones guardadas.</p>
      ) : (
        <ul className="space-y-1">
          {filtered.map((c) => (
            <li
              key={c.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2 ${
                c.id === activeId ? "bg-burgundy/25" : "hover:bg-burgundy/15"
              }`}
            >
              {renaming === c.id ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    actions.renameConversation(c.id, draft.trim() || c.title);
                    setRenaming(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  aria-label="Renombrar conversación"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => actions.openConversation(c.id)}
                  className="flex-1 truncate text-left text-sm text-foreground/90"
                >
                  {c.title}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRenaming(c.id);
                  setDraft(c.title);
                }}
                className="label-xs opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              >
                Renombrar
              </button>
              <button
                type="button"
                onClick={() => void actions.deleteConversation(c.id)}
                className="label-xs opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
