"use client";

import { Card } from "./ui";
import { addDays, groupByDay, localDay, prettyDay } from "@/lib/stats";
import type { Injection } from "@/lib/types";
import { zoneById } from "@/lib/zones";

const timeFmt = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" });

export default function HistoryTab({
  injections,
  startDate,
  onDelete,
}: {
  injections: Injection[];
  startDate: string | null;
  onDelete: (id: string) => Promise<void>;
}) {
  const byDay = new Map(groupByDay(injections));
  const today = localDay(new Date());
  const oldest = [startDate, [...byDay.keys()].at(-1)].filter(Boolean).sort()[0] ?? today;

  // Lista día a día desde hoy hacia atrás, mostrando también los días sin registro.
  const days: string[] = [];
  for (let d = today; d >= oldest && days.length < 366; d = addDays(d, -1)) days.push(d);

  if (!injections.length) {
    return <Card><p className="text-sm text-stone-500">Aún no hay inyecciones registradas.</p></Card>;
  }

  return (
    <Card className="divide-y divide-stone-100 !p-0">
      {days.map((d, idx) => {
        const items = byDay.get(d);
        const dayNum = startDate ? Math.round((Date.parse(d) - Date.parse(startDate)) / 86_400_000) + 1 : null;
        return (
          <div key={d} className="flex gap-3 px-4 py-3">
            <div className="w-20 shrink-0">
              <div className="text-sm font-semibold capitalize text-stone-700">{prettyDay(d)}</div>
              {dayNum !== null && dayNum > 0 && <div className="text-xs text-stone-400">Día {dayNum}</div>}
            </div>
            <div className="flex-1 space-y-1">
              {items ? (
                items.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm text-stone-800">{zoneById(i.zone)?.label}</div>
                      <div className="text-xs text-stone-400">
                        {timeFmt.format(new Date(i.injected_at))}
                        {i.dose_mg !== null && ` · ${String(i.dose_mg).replace(".", ",")} mg`}
                        {i.notes && ` · ${i.notes}`}
                      </div>
                    </div>
                    <button
                      aria-label="Borrar"
                      onClick={() => confirm("¿Borrar este registro?") && onDelete(i.id)}
                      className="rounded-lg px-2 py-1 text-xs text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      Borrar
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-sm ${idx === 0 ? "text-stone-400" : "text-amber-700"}`}>
                  {idx === 0 ? "Pendiente" : "Sin registro"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
