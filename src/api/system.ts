import type { MemoryEntry, SystemInfo } from "@/lib/pluto/types";
import { backendConfig, dataSource } from "./config";
import { bujji } from "./client";
import { mockMemory, mockSystem } from "./mocks";

/**
 * Expected Bujji contract:
 *   GET /system/status -> { pluto, backend, gateway, model, memory, telegram, voice }
 *   GET /memory        -> MemoryEntry[]
 * Unknown values are surfaced as UNKNOWN; never claim a service is connected.
 */
export const systemApi = {
  async status(): Promise<SystemInfo> {
    if (backendConfig.useMocks) return mockSystem;
    const raw = await bujji.get<Partial<SystemInfo>>("/system/status");
    const v = (x?: string) => (x && x.trim() ? x.toUpperCase() : "UNKNOWN");
    return {
      pluto: v(raw.pluto),
      backend: v(raw.backend ?? "BUJJI"),
      gateway: v(raw.gateway),
      model: raw.model?.trim() || "UNKNOWN",
      memory: v(raw.memory),
      telegram: v(raw.telegram),
      voice: v(raw.voice),
      source: dataSource(),
    };
  },
  async memory(): Promise<MemoryEntry[]> {
    if (backendConfig.useMocks) return mockMemory;
    return bujji.get<MemoryEntry[]>("/memory");
  },
};
