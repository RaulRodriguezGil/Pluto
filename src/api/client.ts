import { backendConfig } from "./config";

export class BujjiError extends Error {
  constructor(
    message: string,
    public readonly kind: "offline" | "timeout" | "http" | "malformed" = "http",
  ) {
    super(message);
    this.name = "BujjiError";
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), backendConfig.timeoutMs);
  try {
    const res = await fetch(`${backendConfig.backendUrl}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new BujjiError(`Bujji respondió ${res.status}`, "http");
    return res;
  } catch (err) {
    if (err instanceof BujjiError) throw err;
    if ((err as Error).name === "AbortError") throw new BujjiError("Tiempo de espera agotado", "timeout");
    throw new BujjiError("No se pudo contactar con Bujji", "offline");
  } finally {
    clearTimeout(timer);
  }
}

export const bujji = {
  async get<T>(path: string): Promise<T> {
    const res = await request(path, { method: "GET" });
    try {
      return (await res.json()) as T;
    } catch {
      throw new BujjiError("Respuesta malformada de Bujji", "malformed");
    }
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await request(path, { method: "POST", body: JSON.stringify(body) });
    try {
      return (await res.json()) as T;
    } catch {
      throw new BujjiError("Respuesta malformada de Bujji", "malformed");
    }
  },
  async del(path: string): Promise<void> {
    await request(path, { method: "DELETE" });
  },
  /** Raw streaming endpoint (SSE / chunked text). */
  async stream(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    return request(path, { method: "POST", body: JSON.stringify(body), signal });
  },
};
