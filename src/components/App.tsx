"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import HeatTab from "./HeatTab";
import HistoryTab from "./HistoryTab";
import RegisterTab from "./RegisterTab";
import StatsTab from "./StatsTab";
import { Card } from "./ui";
import { clearDemo, demoStore, supabaseStore, type Store } from "@/lib/store";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import type { Child, Injection, NewInjection } from "@/lib/types";

type Mode = { kind: "loading" } | { kind: "out" } | { kind: "in"; session: Session } | { kind: "demo" };
type Tab = "registrar" | "historial" | "mapa" | "stats";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "registrar", label: "Registrar", icon: "M12 5v14M5 12h14" },
  { id: "historial", label: "Historial", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "mapa", label: "Mapa", icon: "M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM7 21l1-8-3-3h14l-3 3 1 8" },
  { id: "stats", label: "Estadísticas", icon: "M5 20V10M12 20V4M19 20v-7" },
];

const DEMO_FLAG = "app-vacunas-demo-mode";

export default function App() {
  const [mode, setMode] = useState<Mode>({ kind: "loading" });

  useEffect(() => {
    let demo = false;
    try {
      demo = localStorage.getItem(DEMO_FLAG) === "1";
    } catch {}
    if (demo || !supabaseConfigured) {
      queueMicrotask(() => setMode({ kind: demo ? "demo" : "out" }));
      return;
    }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) =>
      setMode(data.session ? { kind: "in", session: data.session } : { kind: "out" }),
    );
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) =>
      setMode(session ? { kind: "in", session } : { kind: "out" }),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (mode.kind === "loading") return <Splash />;
  if (mode.kind === "out")
    return (
      <Login
        onDemo={() => {
          try {
            localStorage.setItem(DEMO_FLAG, "1");
          } catch {}
          setMode({ kind: "demo" });
        }}
      />
    );

  const store = mode.kind === "demo" ? demoStore : supabaseStore;
  const who = mode.kind === "in" ? (mode.session.user.email ?? "") : "Modo prueba";
  const signOut = async () => {
    if (mode.kind === "demo") {
      try {
        localStorage.removeItem(DEMO_FLAG);
      } catch {}
      setMode({ kind: "out" });
    } else {
      await getSupabase().auth.signOut();
    }
  };
  return <Main key={mode.kind} store={store} who={who} demo={mode.kind === "demo"} onSignOut={signOut} />;
}

function Splash() {
  return <div className="flex flex-1 items-center justify-center text-stone-400">Cargando…</div>;
}

function Login({ onDemo }: { onDemo: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const google = async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setErr(error.message);
  };
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9502c] text-3xl text-white shadow">
          💉
        </div>
        <h1 className="text-2xl font-bold text-stone-800">Mi registro de inyecciones</h1>
        <p className="mt-2 text-stone-500">
          Anota cada día dónde se puso la hormona de crecimiento, rota las zonas y revisa el historial.
        </p>
      </div>
      {supabaseConfigured ? (
        <button
          onClick={google}
          className="flex items-center justify-center gap-3 rounded-2xl bg-white py-3 font-semibold text-stone-700 shadow ring-1 ring-black/10 active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Entrar con Google
        </button>
      ) : (
        <p className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800">
          El inicio de sesión con Google aún no está configurado.
        </p>
      )}
      <button onClick={onDemo} className="text-sm font-medium text-stone-500 underline underline-offset-4">
        Probar sin cuenta (los datos quedan solo en este teléfono)
      </button>
      {err && <p className="text-center text-sm text-red-600">{err}</p>}
    </div>
  );
}

function Main({ store, who, demo, onSignOut }: { store: Store; who: string; demo: boolean; onSignOut: () => void }) {
  const [children, setChildren] = useState<Child[] | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [injections, setInjections] = useState<Injection[]>([]);
  const [tab, setTab] = useState<Tab>("registrar");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    store
      .listChildren()
      .then((c) => {
        setChildren(c);
        setChildId(c[0]?.id ?? null);
      })
      .catch((e) => setError(e.message));
  }, [store]);

  const reload = useCallback(async () => {
    if (!childId) return;
    try {
      setInjections(await store.listInjections(childId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [store, childId]);

  useEffect(() => {
    if (!childId) return;
    store
      .listInjections(childId)
      .then(setInjections)
      .catch((e) => setError(e.message));
  }, [store, childId]);

  const child = children?.find((c) => c.id === childId) ?? null;

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!children) return <Splash />;
  if (!child)
    return (
      <NewChild
        onCreate={async (c) => {
          const created = await store.createChild(c);
          setChildren([...children, created]);
          setChildId(created.id);
        }}
      />
    );

  const add = async (i: NewInjection) => {
    await store.addInjection(i);
    await reload();
  };
  const update = async (id: string, patch: Partial<NewInjection>) => {
    await store.updateInjection(id, patch);
    await reload();
  };
  const del = async (id: string) => {
    await store.deleteInjection(id);
    await reload();
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-[#fdf6ef]/90 px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur">
        <div className="min-w-0">
          {children.length > 1 ? (
            <select
              value={child.id}
              onChange={(e) => setChildId(e.target.value)}
              className="bg-transparent text-lg font-bold text-stone-800"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <h1 className="truncate text-lg font-bold text-stone-800">{child.name}</h1>
          )}
          <div className="truncate text-xs text-stone-400">{who}</div>
        </div>
        <details className="relative">
          <summary className="list-none rounded-full p-2 text-stone-500 hover:bg-stone-100" aria-label="Menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
          </summary>
          <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white p-1 text-sm shadow-lg ring-1 ring-black/10">
            <button
              className="w-full rounded-lg px-3 py-2 text-left hover:bg-stone-50"
              onClick={() => {
                setChildId(null);
                setChildren([...children]);
              }}
            >
              Agregar otro hijo/a
            </button>
            {demo && (
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm("¿Borrar todos los datos de prueba?")) {
                    clearDemo();
                    location.reload();
                  }
                }}
              >
                Borrar datos de prueba
              </button>
            )}
            <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-stone-50" onClick={onSignOut}>
              {demo ? "Salir del modo prueba" : "Cerrar sesión"}
            </button>
          </div>
        </details>
      </header>

      <main className="flex-1 px-4 pb-28 pt-2">
        {tab === "registrar" && <RegisterTab childId={child.id} injections={injections} onSave={add} />}
        {tab === "historial" && <HistoryTab injections={injections} startDate={child.start_date} onDelete={del} onUpdate={update} />}
        {tab === "mapa" && <HeatTab injections={injections} />}
        {tab === "stats" && <StatsTab injections={injections} startDate={child.start_date} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                tab === t.id ? "text-[#c9502c]" : "text-stone-400"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function NewChild({ onCreate }: { onCreate: (c: Omit<Child, "id">) => Promise<void> }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
      <Card className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-stone-800">¿A quién le registramos?</h1>
          <p className="text-sm text-stone-500">Como en la ficha de la libreta.</p>
        </div>
        <label className="block text-sm text-stone-600">
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base" />
        </label>
        <label className="block text-sm text-stone-600">
          Fecha de inicio del tratamiento
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base" />
        </label>
        <button
          disabled={!name.trim() || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onCreate({ name: name.trim(), start_date: start || null });
            } finally {
              setBusy(false);
            }
          }}
          className="w-full rounded-2xl bg-[#c9502c] py-3 font-semibold text-white disabled:opacity-40"
        >
          Continuar
        </button>
      </Card>
    </div>
  );
}
