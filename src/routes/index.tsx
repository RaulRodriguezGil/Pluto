import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { actions, usePluto } from "@/lib/pluto/store";
import { PlutoCore } from "@/components/pluto/PlutoCore";
import { PromptBar } from "@/components/pluto/PromptBar";
import { ChatPanel } from "@/components/pluto/ChatPanel";
import { RightPanels } from "@/components/pluto/panels/DynamicPanel";
import { Overlay } from "@/components/pluto/Overlay";
import { backendConfig } from "@/api/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pluto — Asistente personal" },
      {
        name: "description",
        content:
          "Interfaz del asistente personal Pluto: núcleo vivo, conversación contextual y actividad del agente sobre el backend Bujji.",
      },
      { property: "og:title", content: "Pluto — Asistente personal" },
      {
        property: "og:description",
        content: "Interfaz mínima y técnica para conversar con Pluto y seguir la actividad del agente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlutoScreen,
});

function PlutoScreen() {
  const plutoState = usePluto((s) => s.plutoState);
  const pending = usePluto((s) => s.pendingTasks);
  const unread = usePluto((s) => s.unreadReply);

  useEffect(() => {
    void actions.hydrate();
    actions.setPanel("bottom", "system");
  }, []);

  return (
    <main className="pluto-env relative min-h-screen overflow-hidden">
      <div className="pluto-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6">
        <span className="label-xs">Pluto</span>
        <span className="label-xs">
          {backendConfig.useMocks ? "mock" : "bujji"} · {plutoState.toLowerCase()}
          {pending > 0 && " · en curso"}
        </span>
      </header>

      <div className="relative flex min-h-screen items-center justify-center px-6">
        <PlutoCore state={plutoState} />
      </div>

      {unread && (
        <span
          className="pointer-events-none fixed bottom-24 left-1/2 z-30 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-signal"
          role="status"
        >
          respuesta lista
        </span>
      )}

      <ChatPanel />
      <RightPanels />
      <PromptBar />
      <Overlay />
    </main>
  );
}
