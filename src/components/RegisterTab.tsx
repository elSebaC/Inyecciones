"use client";

import { useMemo, useState } from "react";
import BodyMap from "./BodyMap";
import { Card } from "./ui";
import { agoText, daysBetween, lastDose, lastUsed, localDay, localTime, parseDose, suggestZone, toIso } from "@/lib/stats";
import type { Injection, NewInjection } from "@/lib/types";
import { ZONES, zoneById, type ZoneId } from "@/lib/zones";

function nowTime() {
  return localTime(new Date());
}

export default function RegisterTab({
  childId,
  injections,
  onSave,
}: {
  childId: string;
  injections: Injection[];
  onSave: (i: NewInjection) => Promise<void>;
}) {
  const today = localDay(new Date());
  const [zone, setZone] = useState<ZoneId | null>(null);
  const [day, setDay] = useState(today);
  const [time, setTime] = useState(nowTime);
  const [doseInput, setDose] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const last = useMemo(() => lastUsed(injections), [injections]);
  // Mientras no se escriba nada, la dosis viene prellenada con la última registrada.
  const dose = doseInput ?? lastDose(injections);
  const suggested = useMemo(() => suggestZone(injections), [injections]);
  const recent = useMemo(
    () => new Set(ZONES.filter((z) => last[z.id] && daysBetween(last[z.id]!, today) <= 2).map((z) => z.id)),
    [last, today],
  );
  const todays = injections.filter((i) => localDay(i.injected_at) === today);
  const sel = zone ? zoneById(zone) : null;
  const selAgo = zone && last[zone] ? daysBetween(last[zone]!, day) : null;

  async function save() {
    if (!zone) return;
    setSaving(true);
    setMsg(null);
    try {
      await onSave({
        child_id: childId,
        zone,
        injected_at: toIso(day, time),
        dose_mg: parseDose(dose),
        notes: notes.trim() || null,
      });
      setMsg(`Guardado: ${zoneById(zone)!.label}`);
      setZone(null);
      setNotes("");
      setDose(null);
    } catch (e) {
      setMsg(`No se pudo guardar: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        {todays.length ? (
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-emerald-700">✓ Hoy ya registraste</span>{" "}
            {todays.map((i) => zoneById(i.zone)!.label.toLowerCase()).join(" y ")}.
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-[#c9502c]">Falta la inyección de hoy.</span>
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3">
          <div className="text-sm">
            <div className="text-xs text-emerald-700">Sugerencia para rotar</div>
            <div className="font-semibold text-emerald-900">{zoneById(suggested)!.label}</div>
            <div className="text-xs text-emerald-700">Última vez: {agoText(last[suggested])}</div>
          </div>
          <button
            onClick={() => setZone(suggested)}
            className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white active:scale-95"
          >
            Usar
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-stone-700">Toca la zona de la inyección</h2>
        <BodyMap mode="select" selected={zone} suggested={suggested} recent={recent} onSelect={setZone} />
        <p className="-mt-1 text-center text-xs text-stone-400">
          ✕ usada en los últimos 2 días · borde verde: sugerida
        </p>
      </Card>

      <Card className="space-y-3">
        {sel ? (
          <div>
            <div className="text-xs text-stone-500">Zona elegida</div>
            <div className="text-lg font-semibold text-stone-800">{sel.label}</div>
            {selAgo !== null && selAgo <= 2 && selAgo >= 0 && (
              <div className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">
                Ojo: esta zona se usó {agoText(last[zone!])}. Conviene rotar.
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-stone-500">Elige una zona arriba.</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-stone-500">
            Fecha
            <input type="date" value={day} max={today} onChange={(e) => setDay(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800" />
          </label>
          <label className="text-xs text-stone-500">
            Hora
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800" />
          </label>
          <label className="text-xs text-stone-500">
            Dosis (mg, opcional)
            <input inputMode="decimal" placeholder="Ej: 0,6" value={dose} onChange={(e) => setDose(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800" />
          </label>
          <label className="text-xs text-stone-500">
            Nota (opcional)
            <input value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800" />
          </label>
        </div>
        <button
          disabled={!zone || saving}
          onClick={save}
          className="w-full rounded-2xl bg-[#c9502c] py-3 text-base font-semibold text-white shadow disabled:opacity-40 active:scale-[0.98]"
        >
          {saving ? "Guardando…" : "Guardar inyección"}
        </button>
        {msg && <p className="text-center text-sm text-stone-600">{msg}</p>}
      </Card>
    </div>
  );
}
