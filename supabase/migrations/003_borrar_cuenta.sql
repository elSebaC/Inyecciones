-- Permite que cada usuario borre su propia cuenta desde la app (lo exigen
-- App Store y Google Play). Al borrar el usuario, sus hijos, inyecciones y
-- medidas se borran en cascada.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'No hay sesión iniciada';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
