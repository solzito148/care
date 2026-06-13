-- Parche idempotente: roles en onboarding (no en signup).
-- Ejecutar en SQL Editor si migrate-all.sql completo ya fue aplicado antes.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_type text := nullif(coalesce(new.raw_user_meta_data->>'account_type', ''), '');
  v_first_name text := coalesce(new.raw_user_meta_data->>'first_name', '');
  v_last_name text := coalesce(new.raw_user_meta_data->>'last_name', '');
  v_full_name text := trim(both ' ' from concat_ws(' ', nullif(v_first_name, ''), nullif(v_last_name, '')));
  v_phone text := nullif(coalesce(new.raw_user_meta_data->>'phone', ''), '');
begin
  insert into public.profiles (id, full_name, phone, account_type)
  values (new.id, nullif(v_full_name, ''), v_phone, v_account_type)
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        account_type = coalesce(excluded.account_type, public.profiles.account_type),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.protect_profile_account_type()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
     and old.account_type is not null
     and new.account_type is distinct from old.account_type then
    new.account_type := old.account_type;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_account_type on public.profiles;
create trigger trg_protect_profile_account_type
before update on public.profiles
for each row execute function public.protect_profile_account_type();

create or replace function public.sync_user_role_from_account_type(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_type text;
  v_role_code text;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'No autorizado para asignar roles.';
  end if;

  select account_type into v_account_type
  from public.profiles
  where id = p_user_id;

  v_role_code := case v_account_type
    when 'tutor-familiar-encargado' then 'tutor'
    when 'cuidador' then 'caregiver'
    when 'profesional-salud' then 'professional'
    when 'profesional-legal-administrativo' then 'legal_admin'
    when 'proveedor-marketplace' then 'provider'
    when 'proveedor-servicios' then 'provider'
    else null
  end;

  if v_role_code is not null then
    insert into public.user_roles (user_id, role_id)
    select p_user_id, r.id
    from public.roles r
    where r.code = v_role_code
    on conflict (user_id, role_id) do nothing;
  end if;
end;
$$;

revoke all on function public.sync_user_role_from_account_type(uuid) from public;
grant execute on function public.sync_user_role_from_account_type(uuid) to authenticated;
