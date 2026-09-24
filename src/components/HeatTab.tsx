"use client";

import { useState } from "react";
import BodyMap, { heatColor } from "./BodyMap";
import { Card, Segmented } from "./ui";
import { countByZone, inRange } from "@/lib/stats";
import type { Injection } from "@/lib/types";
import { ZONES } from "@/lib/zones";

export const RANGES: { value: number | null; label: string }[] = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: null, label: "Todo" },
];

export default function HeatTab({ injections }: { injections: Injection[] }) {
  const [range, setRange] = useState<number | null>(30);
  const subset = inRange(injections, range);
  const counts = countByZone(subset);
  const max = Math.max(0, ...Object.values(counts));
  const ranked = [...ZONES].sort((a, b) => counts[b.id] - counts[a.id]);

  return (
    <div className="space-y-4">
      <Segmented options={RANGES} value={range} onChange={setRange} />
      <Card>
        <h2 className="text-sm font-semibold text-stone-700">Mapa de calor · {subset.length} inyecciones</h2>
        <BodyMap mode="heat" counts={counts} />
        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-stone-500">
          <span>Menos</span>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="h-3 w-5 rounded" style={{ background: heatColor(n === 0 ? 0 : Math.ceil((n / 5) * 5), 5) }} />
          ))}
          <span>Más</span>
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Zonas más usadas</h2>
        <ul className="space-y-2">
          {ranked.map((z) => (
            <li key={z.id} className="flex items-center gap-2 text-sm">
              <span className="w-44 shrink-0 truncate text-stone-700">{z.label}</span>
              <span className="h-3 flex-1 overflow-hidden rounded bg-stone-100">
                <span className="block h-full rounded" style={{ width: `${max ? (counts[z.id] / max) * 100 : 0}%`, background: heatColor(counts[z.id], max) }} />
              </span>
              <span className="w-6 text-right tabular-nums text-stone-600">{counts[z.id]}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
