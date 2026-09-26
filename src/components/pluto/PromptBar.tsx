import { useEffect, useRef, useState } from "react";
import { actions, usePluto } from "@/lib/pluto/store";
import { PlutoGlyph } from "./PlutoCore";
import { PlutoMenu } from "./PlutoMenu";

export function PromptBar() {
  const [value, setValue] = useState("");
  const menuOpen = usePluto((s) => s.menuOpen);
  const busy = usePluto((s) => s.pendingTasks > 0);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const text = value;
    setValue("");
    void actions.send(text);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-6">
      <div className="pointer-events-auto relative w-full max-w-2xl">
        {menuOpen && <PlutoMenu />}
        <div className="surface flex items-end gap-3 rounded-2xl px-3 py-2.5 shadow-[0_24px_60px_-30px_oklch(0_0_0)]">
          <button
            type="button"
            aria-label="Abrir menú de Pluto"
            aria-expanded={menuOpen}
            onClick={() => actions.setMenuOpen(!menuOpen)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 text-muted-foreground transition-colors hover:border-signal/60 hover:text-foreground"
          >
            <PlutoGlyph className="size-5" />
          </button>
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
              if (e.key === "Escape") actions.setMenuOpen(false);
            }}
            placeholder="Escribe a Pluto..."
            aria-label="Escribe a Pluto"
            className="scroll-thin max-h-40 flex-1 resize-none bg-transparent py-2 text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            aria-label="Enviar mensaje"
            className="label-xs mb-1 shrink-0 rounded-lg border border-border/70 px-3 py-2 transition-colors hover:border-signal/70 hover:text-foreground disabled:opacity-35"
          >
            {busy ? "···" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
