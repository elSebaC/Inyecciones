import { getSupabase } from "./supabase";
import type { Child, Injection, Measurement, NewInjection, NewMeasurement } from "./types";

export interface Store {
  listChildren(): Promise<Child[]>;
  createChild(c: Omit<Child, "id">): Promise<Child>;
  updateChild(id: string, patch: Partial<Omit<Child, "id">>): Promise<void>;
  listInjections(childId: string): Promise<Injection[]>;
  addInjection(i: NewInjection): Promise<Injection>;
  updateInjection(id: string, patch: Partial<NewInjection>): Promise<void>;
  deleteInjection(id: string): Promise<void>;
  listMeasurements(childId: string): Promise<Measurement[]>;
  addMeasurement(m: NewMeasurement): Promise<void>;
  updateMeasurement(id: string, patch: Partial<NewMeasurement>): Promise<void>;
  deleteMeasurement(id: string): Promise<void>;
}

export const supabaseStore: Store = {
  async listChildren() {
    const { data, error } = await getSupabase()
      .from("children")
      .select("*")
      .order("created_at");
    if (error) throw error;
    return data;
  },
  async createChild(c) {
    const { data, error } = await getSupabase()
      .from("children")
      .insert(c)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
  async listInjections(childId) {
    const { data, error } = await getSupabase()
      .from("injections")
      .select("id, child_id, zone, injected_at, dose_mg, notes")
      .eq("child_id", childId)
      .order("injected_at", { ascending: false });
    if (error) throw error;
    return data.map((r) => ({ ...r, dose_mg: r.dose_mg === null ? null : Number(r.dose_mg) }));
  },
  async addInjection(i) {
    const { data, error } = await getSupabase()
      .from("injections")
      .insert(i)
      .select("id, child_id, zone, injected_at, dose_mg, notes")
      .single();
    if (error) throw error;
    return data;
  },
  async updateInjection(id, patch) {
    const { error } = await getSupabase().from("injections").update(patch).eq("id", id);
    if (error) throw error;
  },
  async deleteInjection(id) {
    const { error } = await getSupabase().from("injections").delete().eq("id", id);
    if (error) throw error;
  },
  async updateChild(id, patch) {
    const { error } = await getSupabase().from("children").update(patch).eq("id", id);
    if (error) throw error;
  },
  async listMeasurements(childId) {
    const { data, error } = await getSupabase()
      .from("measurements")
      .select("id, child_id, measured_on, height_cm, weight_kg, notes")
      .eq("child_id", childId)
      .order("measured_on", { ascending: false });
    if (error) throw error;
    return data.map((r) => ({
      ...r,
      height_cm: r.height_cm === null ? null : Number(r.height_cm),
      weight_kg: r.weight_kg === null ? null : Number(r.weight_kg),
    }));
  },
  async addMeasurement(m) {
    const { error } = await getSupabase().from("measurements").insert(m);
    if (error) throw error;
  },
  async updateMeasurement(id, patch) {
    const { error } = await getSupabase().from("measurements").update(patch).eq("id", id);
    if (error) throw error;
  },
  async deleteMeasurement(id) {
    const { error } = await getSupabase().from("measurements").delete().eq("id", id);
    if (error) throw error;
  },
};

// Modo demo: datos guardados solo en este navegador.
const KEY = "app-vacunas-demo";
type DemoData = { children: Child[]; injections: Injection[]; measurements?: Measurement[] };

function load(): DemoData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { children: [], injections: [] };
}
function save(d: DemoData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export const demoStore: Store = {
  async listChildren() {
    return load().children;
  },
  async createChild(c) {
    const d = load();
    const child = { ...c, id: crypto.randomUUID() };
    d.children.push(child);
    save(d);
    return child;
  },
  async listInjections(childId) {
    return load()
      .injections.filter((i) => i.child_id === childId)
      .sort((a, b) => b.injected_at.localeCompare(a.injected_at));
  },
  async addInjection(i) {
    const d = load();
    const inj = { ...i, id: crypto.randomUUID() };
    d.injections.push(inj);
    save(d);
    return inj;
  },
  async updateInjection(id, patch) {
    const d = load();
    d.injections = d.injections.map((i) => (i.id === id ? { ...i, ...patch } : i));
    save(d);
  },
  async deleteInjection(id) {
    const d = load();
    d.injections = d.injections.filter((i) => i.id !== id);
    save(d);
  },
  async updateChild(id, patch) {
    const d = load();
    d.children = d.children.map((c) => (c.id === id ? { ...c, ...patch } : c));
    save(d);
  },
  async listMeasurements(childId) {
    return (load().measurements ?? [])
      .filter((m) => m.child_id === childId)
      .sort((a, b) => b.measured_on.localeCompare(a.measured_on));
  },
  async addMeasurement(m) {
    const d = load();
    d.measurements = [...(d.measurements ?? []), { ...m, id: crypto.randomUUID() }];
    save(d);
  },
  async updateMeasurement(id, patch) {
    const d = load();
    d.measurements = (d.measurements ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m));
    save(d);
  },
  async deleteMeasurement(id) {
    const d = load();
    d.measurements = (d.measurements ?? []).filter((m) => m.id !== id);
    save(d);
  },
};

export function clearDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
