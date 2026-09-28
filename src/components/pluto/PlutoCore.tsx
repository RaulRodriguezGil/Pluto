import type { PlutoState } from "@/lib/pluto/types";

// Contour traced from the isolated U in the supplied Pluto series logo.
const plutoUPath = "M404 805 c39 -132 57 -530 23 -496 -15 15 -230 14 -244 0 -9 -9 -14 -5 -19 16 -11 43 4 331 21 409 8 38 13 71 11 73 -11 11 -118 -252 -151 -371 -45 -161 -44 -270 2 -394 l16 -42 239 0 239 0 16 37 c8 21 22 71 30 111 14 66 13 83 -1 169 -19 113 -69 267 -128 396 -41 90 -67 134 -54 92z";

function LogoU() {
  return <g transform="translate(-1.165892,82.082139) scale(0.1,-0.1)"><path d={plutoUPath} /></g>;
}

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

export function PlutoCore({ state, size = 480 }: { state: PlutoState; size?: number }) {
  return (
    <div
      className={`pluto-core ${stateClass[state]}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={`Pluto ${label[state]}`}
    >
      <div className="pluto-core__glow" aria-hidden="true" />
      <svg viewBox="0 0 200 200" className="pluto-core__svg" aria-hidden="true">
        <svg x="65" y="48" width="70" height="98" viewBox="0 0 58.540012 82.082139" className="pluto-u" fill="currentColor">
          <LogoU />
        </svg>
      </svg>
      <span className="pluto-core__label">{label[state]}</span>
    </div>
  );
}

export function PlutoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 58.540012 82.082139" className={className} aria-hidden="true" fill="currentColor">
      <LogoU />
    </svg>
  );
}
