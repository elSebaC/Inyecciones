"use client";

import { useState } from "react";
import { Card, Segmented, Tile } from "./ui";
import { RANGES } from "./HeatTab";
import { addDays, agoText, countByZone, inRange, lastUsed, localDay, summarize } from "@/lib/stats";
import type { Injection } from "@/lib/types";
import { ZONES, zoneById } from "@/lib/zones";

const GROUP_COLOR: Record<string, string> = {
  Abdomen: "#e2703a",
  Brazo: "#2f7fc1",
  Muslo: "#1f9d57",
  Nalga: "#8e5bb5",
};
const num = (n: number, d = 1) => n.toLocaleString("es-CL", { maximumFractionDigits: d });

export default function StatsTab({ injections, startDate }: { injections: Injection[]; startDate: string | null }) {
  const [range, setRange] = useState<number | null>(null);
  const subset = inRange(injections, range);
  const rangeStart = range ? addDays(localDay(new Date()), -(range - 1)) : null;
  const s = summarize(subset, rangeStart && (!startDate || rangeStart > startDate) ? rangeStart : startDate);
  const counts = countByZone(subset);
  const last = lastUsed(injections);

  const groups = Object.keys(GROUP_COLOR).map((g) => ({
    g,
    n: ZONES.filter((z) => z.group === g).reduce((acc, z) => acc + counts[z.id], 0),
  }));

  // Últimos 28 días como calendario.
  const today = localDay(new Date());
  const byDay = new Map<string, Injection[]>();
  for (const i of injections) {
    const d = localDay(i.injected_at);
    byDay.set(d, [...(byDay.get(d) ?? []), i]);
  }
  const cal = Array.from({ length: 28 }, (_, k) => addDays(today, k - 27));

  return (
    <div className="space-y-4">
      <Segmented options={RANGES} value={range} onChange={setRange} />
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Inyecciones" value={s.total} hint={`${s.daysWithRecord} días con registro`} />
        <Tile
          label="Cumplimiento"
          value={s.adherence === null ? "—" : `${Math.round(s.adherence * 100)}%`}
          hint={s.expectedDays ? `${s.daysWithRecord} de ${s.expectedDays} días` : "Define fecha de inicio"}
        />
        <Tile label="Racha actual" value={`${s.streak} ${s.streak === 1 ? "día" : "días"}`} hint="días seguidos" />
        <Tile label="Zona repetida" value={s.repeats} hint="en días consecutivos" />
        <Tile label="Dosis total" value={s.totalDose ? `${num(s.totalDose, 2)} mg` : "—"} />
        <Tile label="Dosis diaria prom." value={s.avgDailyDose ? `${num(s.avgDailyDose, 2)} mg` : "—"} />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Últimos 28 días</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {cal.map((d) => {
            const items = byDay.get(d);
            const color = items ? GROUP_COLOR[zoneById(items[0].zone)!.group] : undefined;
            return (
              <div
                key={d}
                title={items ? items.map((i) => zoneById(i.zone)!.label).join(", ") : "Sin registro"}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[10px] leading-none ${
                  items ? "text-white" : d === today ? "bg-stone-50 text-stone-400 ring-1 ring-stone-300" : "bg-stone-100 text-stone-400"
                }`}
                style={color ? { background: color } : undefined}
              >
                <span className="font-semibold">{Number(d.slice(8))}</span>
                {items && <span className="mt-0.5 opacity-90">{zoneById(items[0].zone)!.short.split(" ")[1] ?? ""}{items.length > 1 ? "+" : ""}</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-500">
          {Object.entries(GROUP_COLOR).map(([g, c]) => (
            <span key={g} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} /> {g}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Por región</h2>
        <div className="flex h-4 overflow-hidden rounded-full bg-stone-100">
          {groups.map(({ g, n }) =>
            n ? <span key={g} style={{ width: `${(n / Math.max(s.total, 1)) * 100}%`, background: GROUP_COLOR[g] }} /> : null,
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          {groups.map(({ g, n }) => (
            <div key={g} className="flex justify-between text-stone-600">
              <span>{g}</span>
              <span className="tabular-nums">
                {n} · {s.total ? Math.round((n / s.total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Descanso de cada zona</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {[...ZONES]
            .sort((a, b) => (last[a.id] ?? "0").localeCompare(last[b.id] ?? "0"))
            .map((z) => (
              <li key={z.id} className="flex justify-between py-1.5">
                <span className="text-stone-700">{z.label}</span>
                <span className="text-stone-500">{agoText(last[z.id])}</span>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
