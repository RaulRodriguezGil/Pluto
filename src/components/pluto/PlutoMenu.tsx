import { useEffect, useRef } from "react";
import { actions } from "@/lib/pluto/store";
import type { OverlayKind } from "@/lib/pluto/types";

const items: { key: Exclude<OverlayKind, null>; label: string }[] = [
  { key: "historial", label: "Historial" },
  { key: "memoria", label: "Memoria" },
  { key: "actividad", label: "Actividad" },
  { key: "herramientas", label: "Herramientas" },
  { key: "sistema", label: "Sistema" },
  { key: "configuracion", label: "Configuración" },
  { key: "conexiones", label: "Conexiones" },
  { key: "voz", label: "Voz" },
  { key: "telegram", label: "Telegram" },
  { key: "informacion", label: "Información" },
];

export function PlutoMenu() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) actions.setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && actions.setMenuOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Menú de Pluto"
      className="fade-rise surface absolute bottom-[calc(100%+0.6rem)] left-0 w-60 rounded-2xl p-2"
    >
      <p className="label-xs px-3 pb-2 pt-1">Pluto</p>
      <ul className="grid gap-0.5">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              role="menuitem"
              onClick={() => actions.setOverlay(item.key)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-burgundy/25 hover:text-foreground"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
