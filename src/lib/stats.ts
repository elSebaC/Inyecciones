import type { Injection } from "./types";
import { ZONES, type ZoneId } from "./zones";

const DAY = 86_400_000;

// Fecha local YYYY-MM-DD de un ISO.
export function localDay(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / DAY);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + n));
}

export function inRange(injs: Injection[], days: number | null): Injection[] {
  if (days === null) return injs;
  const from = addDays(localDay(new Date()), -(days - 1));
  return injs.filter((i) => localDay(i.injected_at) >= from);
}

export function countByZone(injs: Injection[]): Record<ZoneId, number> {
  const out = Object.fromEntries(ZONES.map((z) => [z.id, 0])) as Record<ZoneId, number>;
  for (const i of injs) out[i.zone] = (out[i.zone] ?? 0) + 1;
  return out;
}

// Último día (YYYY-MM-DD) en que se usó cada zona.
export function lastUsed(injs: Injection[]): Partial<Record<ZoneId, string>> {
  const out: Partial<Record<ZoneId, string>> = {};
  for (const i of injs) {
    const d = localDay(i.injected_at);
    if (!out[i.zone] || out[i.zone]! < d) out[i.zone] = d;
  }
  return out;
}

// Sugerencia de rotación: la zona que lleva más tiempo sin usarse
// (las nunca usadas primero, en el orden de la libreta).
export function suggestZone(injs: Injection[]): ZoneId {
  const last = lastUsed(injs);
  let best: ZoneId = ZONES[0].id;
  let bestDay = "9999";
  for (const z of ZONES) {
    const d = last[z.id] ?? "0000";
    if (d < bestDay) {
      best = z.id;
      bestDay = d;
    }
  }
  return best;
}

export type Summary = {
  total: number;
  daysWithRecord: number;
  expectedDays: number;
  adherence: number | null;
  streak: number;
  repeats: number;
  totalDose: number;
  avgDailyDose: number | null;
  firstDay: string | null;
};

export function summarize(injs: Injection[], startDate: string | null): Summary {
  const today = localDay(new Date());
  const days = new Set(injs.map((i) => localDay(i.injected_at)));
  const sortedDays = [...days].sort();
  const firstDay = startDate ?? sortedDays[0] ?? null;
  const expectedDays = firstDay ? Math.max(daysBetween(firstDay, today) + 1, 0) : 0;
  const inWindow = firstDay ? sortedDays.filter((d) => d >= firstDay && d <= today).length : 0;

  // Racha: días seguidos con registro terminando hoy (o ayer, si hoy aún no toca).
  let streak = 0;
  let cursor = days.has(today) ? today : addDays(today, -1);
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  // Repeticiones: misma zona usada en dos días consecutivos.
  const zonesByDay = new Map<string, Set<ZoneId>>();
  for (const i of injs) {
    const d = localDay(i.injected_at);
    if (!zonesByDay.has(d)) zonesByDay.set(d, new Set());
    zonesByDay.get(d)!.add(i.zone);
  }
  let repeats = 0;
  for (const d of sortedDays) {
    const prev = zonesByDay.get(addDays(d, -1));
    if (!prev) continue;
    for (const z of zonesByDay.get(d)!) if (prev.has(z)) repeats++;
  }

  const dosed = injs.filter((i) => i.dose_mg !== null);
  const totalDose = dosed.reduce((s, i) => s + (i.dose_mg ?? 0), 0);
  const dosedDays = new Set(dosed.map((i) => localDay(i.injected_at))).size;

  return {
    total: injs.length,
    daysWithRecord: days.size,
    expectedDays,
    adherence: expectedDays > 0 ? inWindow / expectedDays : null,
    streak,
    repeats,
    totalDose,
    avgDailyDose: dosedDays ? totalDose / dosedDays : null,
    firstDay,
  };
}

export function groupByDay(injs: Injection[]): [string, Injection[]][] {
  const map = new Map<string, Injection[]>();
  for (const i of injs) {
    const d = localDay(i.injected_at);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(i);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

const fmt = new Intl.DateTimeFormat("es-CL", { weekday: "short", day: "numeric", month: "short" });
export function prettyDay(day: string): string {
  const today = localDay(new Date());
  if (day === today) return "Hoy";
  if (day === addDays(today, -1)) return "Ayer";
  const [y, m, d] = day.split("-").map(Number);
  return fmt.format(new Date(y, m - 1, d));
}

export function agoText(day: string | undefined): string {
  if (!day) return "nunca";
  const n = daysBetween(day, localDay(new Date()));
  if (n <= 0) return "hoy";
  if (n === 1) return "ayer";
  return `hace ${n} días`;
}

export function localTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function toIso(day: string, time: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0).toISOString();
}

export function parseDose(text: string): number | null {
  const n = text.trim() ? Number(text.replace(",", ".")) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatDose(n: number | null): string {
  return n === null ? "" : String(n).replace(".", ",");
}

// Última dosis ingresada (por fecha de registro), para prellenar el formulario.
export function lastDose(injs: Injection[]): string {
  const withDose = injs.filter((i) => i.dose_mg !== null);
  withDose.sort((a, b) => b.injected_at.localeCompare(a.injected_at));
  return formatDose(withDose[0]?.dose_mg ?? null);
}
