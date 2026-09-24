import { getSupabase } from "./supabase";
import type { Child, Injection, NewInjection } from "./types";

export interface Store {
  listChildren(): Promise<Child[]>;
  createChild(c: Omit<Child, "id">): Promise<Child>;
  listInjections(childId: string): Promise<Injection[]>;
  addInjection(i: NewInjection): Promise<Injection>;
  deleteInjection(id: string): Promise<void>;
}

export const supabaseStore: Store = {
  async listChildren() {
    const { data, error } = await getSupabase()
      .from("children")
      .select("id, name, start_date")
      .order("created_at");
    if (error) throw error;
    return data;
  },
  async createChild(c) {
    const { data, error } = await getSupabase()
      .from("children")
      .insert(c)
      .select("id, name, start_date")
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
  async deleteInjection(id) {
    const { error } = await getSupabase().from("injections").delete().eq("id", id);
    if (error) throw error;
  },
};

// Modo demo: datos guardados solo en este navegador.
const KEY = "app-vacunas-demo";
type DemoData = { children: Child[]; injections: Injection[] };

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
  async deleteInjection(id) {
    const d = load();
    d.injections = d.injections.filter((i) => i.id !== id);
    save(d);
  },
};

export function clearDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
