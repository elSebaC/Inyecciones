"use client";

import { useEffect, useState } from "react";
import { Card, Tile } from "./ui";
import { ageText, bmi, daysBetween, localDay, prettyDay } from "@/lib/stats";
import type { Store } from "@/lib/store";
import type { Child, Measurement, NewMeasurement } from "@/lib/types";

const input = "mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800";
const num = (n: number, d = 1) => n.toLocaleString("es-CL", { maximumFractionDigits: d });
const parse = (t: string) => {
  const n = Number(t.replace(",", "."));
  return t.trim() && Number.isFinite(n) && n > 0 ? n : null;
};
const fmt = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

const MIGRATION_HINT =
  "Falta actualizar la base de datos: ejecuta supabase/migrations/002_nacimiento_y_medidas.sql en el SQL Editor de Supabase.";

function friendly(e: unknown) {
  const msg = (e as Error).message ?? String(e);
  return /measurements|schema cache|does not exist/i.test(msg) ? MIGRATION_HINT : msg;
}

function MeasurementForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Measurement;
  onSave: (m: Omit<NewMeasurement, "child_id">) => Promise<void>;
  onCancel?: () => void;
}) {
  const [day, setDay] = useState(initial?.measured_on ?? localDay(new Date()));
  const [height, setHeight] = useState(fmt(initial?.height_cm ?? null));
  const [weight, setWeight] = useState(fmt(initial?.weight_kg ?? null));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const h = parse(height);
  const w = parse(weight);
  const b = bmi(h, w);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      await onSave({ measured_on: day, height_cm: h, weight_kg: w, notes: notes.trim() || null });
      if (!initial) {
        setHeight("");
        setWeight("");
        setNotes("");
      }
    } catch (e) {
      setErr(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-stone-500">
          Fecha
          <input type="date" value={day} max={localDay(new Date())} onChange={(e) => setDay(e.target.value)} className={input} />
        </label>
        <div className="text-xs text-stone-500">
          IMC (calculado)
          <div className="mt-1 rounded-lg bg-stone-50 px-2 py-2 text-base font-semibold text-stone-800">
            {b ? num(b) : "—"}
          </div>
        </div>
        <label className="text-xs text-stone-500">
          Altura (cm)
          <input inputMode="decimal" placeholder="Ej: 132,5" value={height} onChange={(e) => setHeight(e.target.value)} className={input} />
        </label>
        <label className="text-xs text-stone-500">
          Peso (kg)
          <input inputMode="decimal" placeholder="Ej: 28,4" value={weight} onChange={(e) => setWeight(e.target.value)} className={input} />
        </label>
        <label className="col-span-2 text-xs text-stone-500">
          Nota (opcional)
          <input value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} className={input} />
        </label>
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 rounded-2xl bg-stone-100 py-3 font-semibold text-stone-600">
            Cancelar
          </button>
        )}
        <button
          disabled={busy || !day || (!h && !w)}
          onClick={save}
          className="flex-[2] rounded-2xl bg-[#c9502c] py-3 font-semibold text-white shadow disabled:opacity-40"
        >
          {busy ? "Guardando…" : initial ? "Guardar cambios" : "Guardar medida"}
        </button>
      </div>
      {err && <p className="text-center text-sm text-red-600">{err}</p>}
    </div>
  );
}

// Gráfico de línea mínimo para una serie (fecha, valor).
function Sparkline({ points, color, unit }: { points: [string, number][]; color: string; unit: string }) {
  if (points.length < 2) return <p className="text-xs text-stone-400">Con 2 o más medidas verás la evolución aquí.</p>;
  const W = 320;
  const H = 110;
  const P = 22;
  const x0 = points[0][0];
  const span = Math.max(daysBetween(x0, points.at(-1)![0]), 1);
  const vs = points.map((p) => p[1]);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  const pad = (hi - lo || 1) * 0.15;
  const X = (d: string) => P + (daysBetween(x0, d) / span) * (W - 2 * P);
  const Y = (v: number) => H - P - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * (H - 2 * P);
  const d = points.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p[0]} cx={X(p[0])} cy={Y(p[1])} r={3.5} fill="white" stroke={color} strokeWidth={2} />
      ))}
      <text x={X(points[0][0])} y={Y(points[0][1]) - 8} fontSize={11} fill="#78716c" textAnchor="start">
        {num(points[0][1])} {unit}
      </text>
      <text x={X(points.at(-1)![0])} y={Y(points.at(-1)![1]) - 8} fontSize={11} fontWeight={700} fill="#44403c" textAnchor="end">
        {num(points.at(-1)![1])} {unit}
      </text>
    </svg>
  );
}

export default function MeasurementsTab({ store, child }: { store: Store; child: Child }) {
  const [items, setItems] = useState<Measurement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    store
      .listMeasurements(child.id)
      .then((m) => {
        setItems(m);
        setError(null);
      })
      .catch((e) => setError(friendly(e)));
  }, [store, child.id, version]);

  const refresh = () => setVersion((v) => v + 1);

  if (error) return <Card><p className="text-sm text-amber-800">{error}</p></Card>;
  if (!items) return <p className="p-4 text-center text-stone-400">Cargando…</p>;

  const heights = items.filter((m) => m.height_cm !== null).map((m) => [m.measured_on, m.height_cm!] as [string, number]).reverse();
  const weights = items.filter((m) => m.weight_kg !== null).map((m) => [m.measured_on, m.weight_kg!] as [string, number]).reverse();
  const lastH = heights.at(-1);
  const lastW = weights.at(-1);
  const currentBmi = bmi(lastH?.[1] ?? null, lastW?.[1] ?? null);

  // Velocidad de crecimiento: cm/año entre la primera y la última altura (si hay al menos ~2 meses entre ellas).
  let velocity: number | null = null;
  if (heights.length >= 2) {
    const days = daysBetween(heights[0][0], lastH![0]);
    if (days >= 60) velocity = ((lastH![1] - heights[0][1]) / days) * 365.25;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Altura" value={lastH ? `${num(lastH[1])} cm` : "—"} hint={lastH ? prettyDay(lastH[0]) : undefined} />
        <Tile label="Peso" value={lastW ? `${num(lastW[1])} kg` : "—"} hint={lastW ? prettyDay(lastW[0]) : undefined} />
        <Tile label="IMC" value={currentBmi ? num(currentBmi) : "—"} hint="con la última altura y peso" />
        <Tile
          label="Crecimiento"
          value={velocity !== null ? `${num(velocity)} cm/año` : "—"}
          hint={velocity !== null ? `desde ${prettyDay(heights[0][0])}` : "necesita 2 alturas con 2+ meses"}
        />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Nueva medida</h2>
        <MeasurementForm
          onSave={async (m) => {
            await store.addMeasurement({ ...m, child_id: child.id });
            refresh();
          }}
        />
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="mb-1 text-sm font-semibold text-stone-700">Altura</h2>
          <Sparkline points={heights} color="#2f7fc1" unit="cm" />
        </div>
        <div>
          <h2 className="mb-1 text-sm font-semibold text-stone-700">Peso</h2>
          <Sparkline points={weights} color="#1f9d57" unit="kg" />
        </div>
      </Card>

      {items.length > 0 && (
        <Card className="divide-y divide-stone-100 !p-0">
          {items.map((m) => (
            <div key={m.id} className="px-4 py-3">
              {editing === m.id ? (
                <MeasurementForm
                  initial={m}
                  onCancel={() => setEditing(null)}
                  onSave={async (patch) => {
                    await store.updateMeasurement(m.id, patch);
                    setEditing(null);
                    refresh();
                  }}
                />
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold capitalize text-stone-700">{prettyDay(m.measured_on)}</div>
                    <div className="text-sm text-stone-700">
                      {[
                        m.height_cm !== null && `${num(m.height_cm)} cm`,
                        m.weight_kg !== null && `${num(m.weight_kg)} kg`,
                        bmi(m.height_cm, m.weight_kg) && `IMC ${num(bmi(m.height_cm, m.weight_kg)!)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div className="text-xs text-stone-400">
                      {child.birth_date && `Edad: ${ageText(child.birth_date, m.measured_on)}`}
                      {m.notes && `${child.birth_date ? " · " : ""}${m.notes}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditing(m.id)} className="rounded-lg px-2 py-1 text-xs font-medium text-[#2f7fc1]">
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("¿Borrar esta medida?")) return;
                        await store.deleteMeasurement(m.id);
                        refresh();
                      }}
                      className="rounded-lg px-2 py-1 text-xs text-stone-400"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
