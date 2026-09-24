import type { ZoneId } from "./zones";

export type Child = {
  id: string;
  name: string;
  start_date: string | null; // YYYY-MM-DD
  birth_date?: string | null; // YYYY-MM-DD
};

export type Injection = {
  id: string;
  child_id: string;
  zone: ZoneId;
  injected_at: string; // ISO
  dose_mg: number | null;
  notes: string | null;
};

export type NewInjection = Omit<Injection, "id">;

export type Measurement = {
  id: string;
  child_id: string;
  measured_on: string; // YYYY-MM-DD
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
};

export type NewMeasurement = Omit<Measurement, "id">;
