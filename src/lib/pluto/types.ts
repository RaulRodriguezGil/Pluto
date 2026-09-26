export type PlutoState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "EXECUTING"
  | "RESPONDING"
  | "ERROR"
  | "OFFLINE";

export type ConnectionStatus = "UNKNOWN" | "ONLINE" | "OFFLINE" | "ERROR";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  streaming?: boolean;
  failed?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ActivityStatus = "pending" | "running" | "completed" | "failed";

export type ActivityKind =
  | "Web Search"
  | "File Read"
  | "File Write"
  | "Shell"
  | "Memory"
  | "Subagent"
  | "API"
  | "Agent";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  detail?: string;
  status: ActivityStatus;
  at: number;
}

export interface MemoryEntry {
  id: string;
  label: string;
  value: string;
  updatedAt: number;
}

export interface SystemInfo {
  pluto: string;
  backend: string;
  gateway: string;
  model: string;
  memory: string;
  telegram: string;
  voice: string;
  source: "mock" | "bujji";
}

export type PanelKind = "activity" | "memory" | "system" | "tool" | "file" | null;

export type OverlayKind =
  | null
  | "historial"
  | "memoria"
  | "actividad"
  | "herramientas"
  | "sistema"
  | "configuracion"
  | "conexiones"
  | "voz"
  | "telegram"
  | "informacion";
