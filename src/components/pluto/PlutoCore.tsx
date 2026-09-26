import type { PlutoState } from "@/lib/pluto/types";

const stateClass: Record<PlutoState, string> = {
  IDLE: "pluto-idle",
  LISTENING: "pluto-listening",
  THINKING: "pluto-thinking",
  EXECUTING: "pluto-executing",
  RESPONDING: "pluto-responding",
  ERROR: "pluto-error",
  OFFLINE: "pluto-offline",
};

const label: Record<PlutoState, string> = {
  IDLE: "en reposo",
  LISTENING: "escuchando",
  THINKING: "pensando",
  EXECUTING: "ejecutando",
  RESPONDING: "respondiendo",
  ERROR: "error",
  OFFLINE: "sin conexión",
};

export function PlutoCore({ state, size = 320 }: { state: PlutoState; size?: number }) {
  return (
    <div
      className={`pluto-core ${stateClass[state]}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={`Pluto ${label[state]}`}
    >
      <div className="pluto-core__glow" aria-hidden="true" />
      <svg viewBox="0 0 200 200" className="pluto-core__svg" aria-hidden="true">
        <g className="pluto-halo" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="100" cy="100" r="88" strokeDasharray="2 10" opacity="0.45" />
          <circle cx="100" cy="100" r="74" opacity="0.18" />
        </g>
        <g className="pluto-ring" fill="none" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="100" cy="100" r="62" strokeDasharray="120 270" />
        </g>
        <g className="pluto-u" fill="none" strokeWidth="7" strokeLinecap="round">
          <path d="M62 52 V104 a38 38 0 0 0 76 0 V52" />
        </g>
        <g className="pluto-inner" fill="none" strokeWidth="2.4" strokeLinecap="round">
          <path d="M78 58 V104 a22 22 0 0 0 44 0 V58" opacity="0.4" />
        </g>
        <circle className="pluto-spark" cx="100" cy="104" r="3.4" />
      </svg>
      <span className="pluto-core__label">{label[state]}</span>
    </div>
  );
}

export function PlutoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      <path
        d="M62 52 V104 a38 38 0 0 0 76 0 V52"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}
