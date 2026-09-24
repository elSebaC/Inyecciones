"use client";

import { useState } from "react";
import BodyMap from "./BodyMap";
import { formatDose, localDay, localTime, parseDose, toIso } from "@/lib/stats";
import type { Injection, NewInjection } from "@/lib/types";
import { zoneById, type ZoneId } from "@/lib/zones";

const input = "mt-1 w-full rounded-lg border border-stone-200 px-2 py-2 text-base text-stone-800";

export default function EditInjection({
  injection,
  onSave,
  onClose,
}: {
  injection: Injection;
  onSave: (patch: Partial<NewInjection>) => Promise<void>;
  onClose: () => void;
}) {
  const at = new Date(injection.injected_at);
  const [zone, setZone] = useState<ZoneId>(injection.zone);
  const [day, setDay] = useState(localDay(at));
  const [time, setTime] = useState(localTime(at));
  const [dose, setDose] = useState(formatDose(injection.dose_mg));
  const [notes, setNotes] = useState(injection.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await onSave({ zone, injected_at: toIso(day, time), dose_mg: parseDose(dose), notes: notes.trim() || null });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Editar registro"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(env(safe-area-inset-bottom),16px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800">Editar registro</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-stone-500">Cancelar</button>
        </div>
        <BodyMap mode="select" selected={zone} onSelect={setZone} />
        <p className="-mt-1 mb-3 text-center text-sm font-semibold text-stone-700">{zoneById(zone)?.label}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-stone-500">
            Fecha
            <input type="date" value={day} max={localDay(new Date())} onChange={(e) => setDay(e.target.value)} className={input} />
          </label>
          <label className="text-xs text-stone-500">
            Hora
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={input} />
          </label>
          <label className="text-xs text-stone-500">
            Dosis (mg)
            <input inputMode="decimal" value={dose} onChange={(e) => setDose(e.target.value)} className={input} />
          </label>
          <label className="text-xs text-stone-500">
            Nota
            <input value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} className={input} />
          </label>
        </div>
        <button
          disabled={saving || !day}
          onClick={save}
          className="mt-4 w-full rounded-2xl bg-[#c9502c] py-3 text-base font-semibold text-white shadow disabled:opacity-40"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {err && <p className="mt-2 text-center text-sm text-red-600">No se pudo guardar: {err}</p>}
      </div>
    </div>
  );
}
