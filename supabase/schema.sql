-- Esquema de App Vacunas. Ejecutar una vez en Supabase > SQL Editor.
-- En una base nueva, ejecutar también supabase/migrations/ en orden.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  start_date date,
  birth_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.injections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  zone text not null check (zone in (
    'abd_sup_der', 'abd_sup_izq', 'abd_inf_der', 'abd_inf_izq',
    'brazo_der', 'brazo_izq', 'muslo_der', 'muslo_izq', 'nalga_der', 'nalga_izq'
  )),
  injected_at timestamptz not null default now(),
  dose_mg numeric(5, 2) check (dose_mg is null or dose_mg > 0),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists injections_child_time_idx
  on public.injections (child_id, injected_at desc);

alter table public.children enable row level security;
alter table public.injections enable row level security;

-- Cada usuario ve y modifica solo lo suyo.
drop policy if exists "children_own" on public.children;
create policy "children_own" on public.children
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "injections_own" on public.injections;
create policy "injections_own" on public.injections
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.children c
      where c.id = child_id and c.user_id = auth.uid()
    )
  );
