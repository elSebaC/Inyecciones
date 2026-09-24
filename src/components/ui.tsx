import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 ${className}`}>{children}</section>;
}

export function Tile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-stone-800">{value}</div>
      {hint && <div className="text-xs text-stone-400">{hint}</div>}
    </div>
  );
}

export function Segmented<T extends string | number | null>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl bg-stone-100 p-1 text-sm">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-2 py-1.5 font-medium transition ${
            o.value === value ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
