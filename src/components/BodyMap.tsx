"use client";

import { ZONES, type View, type ZoneId } from "@/lib/zones";

const SKIN = "#f8e4d0";
const OUTLINE = "#b8664a";
const ZONE = "#e9bb92";
const HEAT = ["#f1dcc8", "#fbc893", "#f59f5f", "#e2703a", "#c4441f", "#8e1c10"];

export function heatColor(count: number, max: number) {
  if (count <= 0 || max <= 0) return HEAT[0];
  const idx = Math.min(HEAT.length - 1, 1 + Math.floor(((count - 1) / Math.max(max, 1)) * (HEAT.length - 1)));
  return HEAT[idx];
}

type Props = {
  mode: "select" | "heat";
  selected?: ZoneId | null;
  suggested?: ZoneId | null;
  recent?: Set<ZoneId>;
  counts?: Record<ZoneId, number>;
  onSelect?: (z: ZoneId) => void;
};

function Silhouette({ view }: { view: View }) {
  const shapes = (pad: number, fill: string) => (
    <g fill={fill} stroke={fill} strokeLinecap="round">
      <line x1={82} y1={228} x2={78} y2={372} strokeWidth={30 + pad} />
      <line x1={118} y1={228} x2={122} y2={372} strokeWidth={30 + pad} />
      <line x1={64} y1={110} x2={44} y2={215} strokeWidth={22 + pad} />
      <line x1={136} y1={110} x2={156} y2={215} strokeWidth={22 + pad} />
      <rect x={62} y={92} width={76} height={150} rx={26} strokeWidth={pad} />
      <rect x={90} y={68} width={20} height={30} strokeWidth={pad} />
      <circle cx={100} cy={46} r={30} strokeWidth={pad} />
    </g>
  );
  return (
    <g>
      {shapes(5, OUTLINE)}
      {shapes(0, SKIN)}
      {view === "front" ? (
        <g fill="none" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round">
          <path d="M76 34 q10 -18 30 -14 q14 2 18 12" />
          <circle cx={90} cy={46} r={1.8} fill={OUTLINE} />
          <circle cx={110} cy={46} r={1.8} fill={OUTLINE} />
          <path d="M92 58 q8 6 16 0" />
          <circle cx={100} cy={167} r={1.6} fill={OUTLINE} />
        </g>
      ) : (
        <g fill="none" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round">
          <path d="M72 44 q2 -26 28 -28 q26 2 28 28" />
          <path d="M100 212 v28" />
        </g>
      )}
    </g>
  );
}

export default function BodyMap({ mode, selected, suggested, recent, counts, onSelect }: Props) {
  const max = counts ? Math.max(0, ...Object.values(counts)) : 0;

  const figure = (view: View, dx: number) => (
    <g transform={`translate(${dx} 0)`}>
      <Silhouette view={view} />
      {ZONES.filter((z) => z.view === view).map((z) => {
        const isSel = selected === z.id;
        const isSug = mode === "select" && suggested === z.id && !isSel;
        const count = counts?.[z.id] ?? 0;
        const fill = mode === "heat" ? heatColor(count, max) : isSel ? "#2f7fc1" : ZONE;
        return (
          <g
            key={z.id}
            role={mode === "select" ? "button" : undefined}
            aria-label={z.label}
            aria-pressed={mode === "select" ? isSel : undefined}
            tabIndex={mode === "select" ? 0 : undefined}
            onClick={() => onSelect?.(z.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(z.id)}
            style={{ cursor: mode === "select" ? "pointer" : "default", outline: "none" }}
          >
            <title>{mode === "heat" ? `${z.label}: ${count}` : z.label}</title>
            <ellipse
              cx={z.cx}
              cy={z.cy}
              rx={z.rx}
              ry={z.ry}
              fill={fill}
              opacity={mode === "select" && !isSel ? 0.85 : 1}
              stroke={isSug ? "#1f9d57" : isSel ? "#1b4f7d" : "none"}
              strokeWidth={isSug ? 3 : 2}
              strokeDasharray={isSug ? "4 3" : undefined}
              className={isSug ? "zone-pulse" : undefined}
            />
            {mode === "select" && recent?.has(z.id) && !isSel && (
              <path
                d={`M${z.cx - 6} ${z.cy - 6} l12 12 M${z.cx + 6} ${z.cy - 6} l-12 12`}
                stroke="#27336b"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            )}
            {mode === "select" && isSel && (
              <path
                d={`M${z.cx - 6} ${z.cy} l4 5 l8 -10`}
                stroke="white"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {mode === "heat" && count > 0 && (
              <text
                x={z.cx}
                y={z.cy + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={count / max > 0.5 ? "white" : "#5a2412"}
              >
                {count}
              </text>
            )}
            {/* Área táctil más grande que la zona dibujada */}
            <ellipse cx={z.cx} cy={z.cy} rx={z.rx + 3} ry={z.ry + 4} fill="transparent" />
          </g>
        );
      })}
    </g>
  );

  return (
    <svg viewBox="0 0 400 412" className="w-full h-auto select-none" role="img" aria-label="Silueta del cuerpo">
      {figure("front", 0)}
      {figure("back", 200)}
      <g fontSize={12} fill="#8a6a5c" textAnchor="middle">
        <text x={100} y={406} fontSize={13} fontWeight={600}>Frente</text>
        <text x={300} y={406} fontSize={13} fontWeight={600}>Espalda</text>
        <text x={30} y={300}>D</text>
        <text x={170} y={300}>I</text>
        <text x={230} y={300}>I</text>
        <text x={370} y={300}>D</text>
      </g>
    </svg>
  );
}
