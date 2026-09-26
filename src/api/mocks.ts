import type { ActivityItem, MemoryEntry, SystemInfo } from "@/lib/pluto/types";

export const mockSystem: SystemInfo = {
  pluto: "UNKNOWN",
  backend: "BUJJI",
  gateway: "UNKNOWN",
  model: "UNKNOWN",
  memory: "UNKNOWN",
  telegram: "UNKNOWN",
  voice: "UNKNOWN",
  source: "mock",
};

export const mockMemory: MemoryEntry[] = [];

export function mockActivityFor(prompt: string): Omit<ActivityItem, "id" | "at">[] {
  const wantsSearch = /busca|search|noticia|web/i.test(prompt);
  return [
    { kind: "Agent", label: "Analizando solicitud", status: "running" },
    ...(wantsSearch
      ? ([{ kind: "Web Search", label: "Web Search", detail: "consulta enviada", status: "running" }] as const)
      : ([{ kind: "Memory", label: "Memory", detail: "contexto recuperado", status: "running" }] as const)),
    { kind: "Agent", label: "Generando respuesta", status: "pending" },
  ];
}

export function mockReply(prompt: string): string {
  return [
    "Modo mock activo — esta respuesta no proviene de Bujji.",
    "",
    `Solicitud recibida: "${prompt.slice(0, 160)}"`,
    "",
    "Cuando el backend Bujji esté conectado (VITE_USE_MOCKS=false), esta misma superficie mostrará la respuesta real, en streaming si el backend lo ofrece.",
  ].join("\n");
}
