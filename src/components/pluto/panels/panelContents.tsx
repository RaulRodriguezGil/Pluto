import type { ReactNode } from "react";
import { usePluto } from "@/lib/pluto/store";
import type { ActivityStatus, PanelKind } from "@/lib/pluto/types";
import { backendConfig } from "@/api/config";

const statusMark: Record<ActivityStatus, string> = {
  pending: "○",
  running: "●",
  completed: "✓",
  failed: "✕",
};

const statusColor: Record<ActivityStatus, string> = {
  pending: "text-muted-foreground/60",
  running: "text-signal",
  completed: "text-foreground/70",
  failed: "text-destructive",
};

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground/70">{children}</p>;
}

export function ActivityContent() {
  const activity = usePluto((s) => s.activity);
  if (activity.length === 0) return <Empty>Sin actividad registrada.</Empty>;
  return (
    <ul className="space-y-3">
      {activity.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className={`mt-[0.15rem] font-mono text-[0.7rem] ${statusColor[a.status]}`}>
            {statusMark[a.status]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-foreground/90">{a.label}</p>
            {a.detail && <p className="truncate text-[0.7rem] text-muted-foreground">{a.detail}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SystemContent() {
  const system = usePluto((s) => s.system);
  const rows: [string, string][] = [
    ["Pluto", system?.pluto ?? "UNKNOWN"],
    ["Backend", system?.backend ?? "BUJJI"],
    ["Gateway", system?.gateway ?? "UNKNOWN"],
    ["Modelo", system?.model ?? "UNKNOWN"],
    ["Memoria", system?.memory ?? "UNKNOWN"],
    ["Telegram", system?.telegram ?? "UNKNOWN"],
    ["Voz", system?.voice ?? "UNKNOWN"],
  ];
  return (
    <div className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-1.5">
          <span className="label-xs">{k}</span>
          <span
            className={`font-mono text-[0.7rem] ${
              v === "ONLINE" ? "text-signal" : v === "UNKNOWN" ? "text-muted-foreground" : "text-foreground/80"
            }`}
          >
            {v}
          </span>
        </div>
      ))}
      <p className="pt-1 text-[0.65rem] text-muted-foreground/70">
        Origen: {backendConfig.useMocks ? "modo mock — sin datos reales" : backendConfig.backendUrl}
      </p>
    </div>
  );
}

export function MemoryContent() {
  return <Empty>La memoria se mostrará cuando Bujji exponga su almacén. Nada almacenado todavía.</Empty>;
}

export function ToolContent() {
  return <Empty>Las herramientas disponibles se listarán al conectar con Bujji.</Empty>;
}

export function FileContent() {
  return <Empty>Sin archivos en el contexto actual.</Empty>;
}

export const panelMeta: Record<Exclude<PanelKind, null>, { title: string; render: () => ReactNode }> = {
  activity: { title: "Actividad", render: () => <ActivityContent /> },
  memory: { title: "Memoria", render: () => <MemoryContent /> },
  system: { title: "Sistema", render: () => <SystemContent /> },
  tool: { title: "Herramientas", render: () => <ToolContent /> },
  file: { title: "Archivos", render: () => <FileContent /> },
};
