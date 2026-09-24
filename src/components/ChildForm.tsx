"use client";

import { useState } from "react";
import { ageText, localDay } from "@/lib/stats";
import type { Child } from "@/lib/types";

const input = "mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base";

// Datos del paciente: se usa al crear y al editar.
export default function ChildForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Child;
  submitLabel: string;
  onSubmit: (c: Omit<Child, "id">) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birth, setBirth] = useState(initial?.birth_date ?? "");
  const [start, setStart] = useState(initial?.start_date ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const today = localDay(new Date());

  return (
    <div className="space-y-4">
      <label className="block text-sm text-stone-600">
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={input} />
      </label>
      <label className="block text-sm text-stone-600">
        Fecha de nacimiento
        <input type="date" value={birth} max={today} onChange={(e) => setBirth(e.target.value)} className={input} />
        {birth && <span className="mt-1 block text-xs text-stone-500">Edad: {ageText(birth)}</span>}
      </label>
      <label className="block text-sm text-stone-600">
        Fecha de inicio del tratamiento
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
      </label>
      <div className="flex gap-2">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 rounded-2xl bg-stone-100 py-3 font-semibold text-stone-600">
            Cancelar
          </button>
        )}
        <button
          disabled={!name.trim() || busy}
          onClick={async () => {
            setBusy(true);
            setErr(null);
            try {
              const data: Omit<Child, "id"> = { name: name.trim(), start_date: start || null };
              // Solo se envía si hay algo que guardar, así funciona aunque la base aún no tenga la columna.
              if (birth || initial?.birth_date) data.birth_date = birth || null;
              await onSubmit(data);
            } catch (e) {
              const msg = (e as Error).message;
              setErr(
                /birth_date/.test(msg)
                  ? "Falta actualizar la base de datos: ejecuta supabase/migrations/002_nacimiento_y_medidas.sql en Supabase."
                  : msg,
              );
            } finally {
              setBusy(false);
            }
          }}
          className="flex-[2] rounded-2xl bg-[#c9502c] py-3 font-semibold text-white disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
      {err && <p className="text-center text-sm text-red-600">{err}</p>}
    </div>
  );
}
