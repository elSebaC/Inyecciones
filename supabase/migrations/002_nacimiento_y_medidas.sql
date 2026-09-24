-- Actualización 2: fecha de nacimiento y medidas de crecimiento.
-- Ejecutar una vez en Supabase > SQL Editor (se puede repetir sin problema).

alter table public.children add column if not exists birth_date date;

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  measured_on date not null default current_date,
  height_cm numeric(5, 1) check (height_cm is null or (height_cm > 20 and height_cm < 250)),
  weight_kg numeric(5, 2) check (weight_kg is null or (weight_kg > 1 and weight_kg < 300)),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  check (height_cm is not null or weight_kg is not null)
);

create index if not exists measurements_child_date_idx
  on public.measurements (child_id, measured_on desc);

alter table public.measurements enable row level security;

drop policy if exists "measurements_own" on public.measurements;
create policy "measurements_own" on public.measurements
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.children c
      where c.id = child_id and c.user_id = auth.uid()
    )
  );
