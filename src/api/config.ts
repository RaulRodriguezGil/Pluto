/**
 * Single source of truth for backend configuration.
 * The frontend talks ONLY to Bujji. No LLM providers, no secrets here.
 */
export const backendConfig = {
  /** Bujji base URL. Override with VITE_BUJJI_URL. */
  backendUrl: (import.meta.env['VITE_BUJJI_URL'] as string | undefined) ?? "http://127.0.0.1:7337",
  /** When true, the UI runs on clearly-labelled mock data. */
  useMocks: (import.meta.env['VITE_USE_MOCKS'] as string | undefined) !== "false",
  timeoutMs: 30000,
} as const;

export const dataSource = (): "mock" | "bujji" => (backendConfig.useMocks ? "mock" : "bujji");
