-- CARE Fase 8 - DNI univoco del adulto mayor + red de cuidado + delegacion
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql y phase2..7.sql)
-- Idempotente: safe re-run.
--
-- Modelo:
--   * El adulto mayor (care_recipient) se identifica de forma univoca por DNI.
--   * Cualquier participante (tutor, cuidador, medico, familiar) que se da de
--     alta puede "cruzar" por DNI para sumarse a la red del adulto mayor.
--   * Si el DNI ya existe, el vinculo queda PENDIENTE de aprobacion del tutor
--     legal (owner). Nunca se exponen datos del adulto mayor hasta aprobar.
--   * El tutor legal puede DELEGAR la administracion en un cuidador
--     (care_relationships.is_manager). El manager puede aprobar/rechazar
--     relaciones y editar el perfil, pero no es el tutor legal.

-- 1) DNI como clave univoca del adulto mayor ---------------------------------

alter table public.care_recipients
  add column if not exists dni text;

-- Normaliza un DNI a solo digitos (descarta puntos, espacios, etc.).
create or replace function public.normalize_dni(p_dni text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select nullif(regexp_replace(coalesce(p_dni, ''), '\D', '', 'g'), '');
$$;

-- Backfill desde metadata.dni. Solo el registro mas antiguo por DNI recibe el
-- valor, para no romper el indice unico si hubiera duplicados previos.
with ranked as (
  select
    id,
    public.normalize_dni(metadata->>'dni') as ndni,
    row_number() over (
      partition by public.normalize_dni(metadata->>'dni')
      order by created_at asc
    ) as rn
  from public.care_recipients
  where public.normalize_dni(metadata->>'dni') is not null
)
update public.care_recipients cr
set dni = ranked.ndni
from ranked
where cr.id = ranked.id
  and ranked.rn = 1
  and cr.dni is null;

-- Un DNI = un adulto mayor (los NULL no compiten en indices parciales).
create unique index if not exists uniq_care_recipients_dni
  on public.care_recipients (dni)
  where dni is not null;

-- 2) Delegacion de administracion -------------------------------------------

alter table public.care_relationships
  add column if not exists is_manager boolean not null default false;

-- Parentesco / detalle del vínculo (ej: para 'family': Hija/o, Hermano/a, etc.).
alter table public.care_relationships
  add column if not exists subject_relation text;

-- Un cuidador con administracion delegada (is_manager) sobre el adulto mayor.
create or replace function public.is_recipient_manager(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.care_relationships rel
    where rel.care_recipient_id = target_recipient
      and rel.subject_user_id = auth.uid()
      and rel.status = 'approved'
      and rel.relationship_type = 'caregiver'
      and rel.is_manager = true
  );
$$;

grant execute on function public.is_recipient_manager(uuid) to authenticated;

-- 3) Moderacion: ahora tambien el manager delegado (ademas del owner/admin) ---

-- Quien puede PROPONER una relacion (se suma owner OR manager).
create or replace function public.can_propose_relationship(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_recipient_owner(target_recipient)
    or public.is_recipient_manager(target_recipient)
    or public.is_admin()
    or exists (
      select 1
      from public.care_relationships rel
      where rel.care_recipient_id = target_recipient
        and rel.subject_user_id = auth.uid()
        and rel.status = 'approved'
        and rel.relationship_type in ('caregiver', 'professional')
    );
$$;

grant execute on function public.can_propose_relationship(uuid) to authenticated;

-- El insert auto-aprueba si lo hace el owner, el manager delegado o un admin.
create or replace function public.handle_care_relationship_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.requested_by := coalesce(new.requested_by, auth.uid());

  if public.is_recipient_owner(new.care_recipient_id)
     or public.is_recipient_manager(new.care_recipient_id)
     or public.is_admin() then
    new.status := 'approved';
    new.approved_by := auth.uid();
    new.approved_at := now();
  else
    new.status := 'pending';
    new.approved_by := null;
    new.approved_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_care_relationships_insert on public.care_relationships;
create trigger trg_care_relationships_insert
before insert on public.care_relationships
for each row execute function public.handle_care_relationship_insert();

-- Solo el tutor legal (owner) o un admin pueden delegar (cambiar is_manager).
create or replace function public.handle_care_relationship_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.is_manager is distinct from old.is_manager
     and not (public.is_recipient_owner(new.care_recipient_id) or public.is_admin()) then
    new.is_manager := old.is_manager;
  end if;

  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.approved_by := auth.uid();
    new.approved_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_care_relationships_update on public.care_relationships;
create trigger trg_care_relationships_update
before update on public.care_relationships
for each row execute function public.handle_care_relationship_update();

-- RLS: el manager delegado tambien lee todas las relaciones y modera.
drop policy if exists "Read related care relationships" on public.care_relationships;
create policy "Read related care relationships"
on public.care_relationships for select
to authenticated
using (
  public.is_recipient_owner(care_recipient_id)
  or public.is_recipient_manager(care_recipient_id)
  or subject_user_id = auth.uid()
  or requested_by = auth.uid()
  or public.is_admin()
);

drop policy if exists "Owner moderates care relationships" on public.care_relationships;
create policy "Owner moderates care relationships"
on public.care_relationships for update
to authenticated
using (
  public.is_recipient_owner(care_recipient_id)
  or public.is_recipient_manager(care_recipient_id)
  or public.is_admin()
)
with check (
  public.is_recipient_owner(care_recipient_id)
  or public.is_recipient_manager(care_recipient_id)
  or public.is_admin()
);

drop policy if exists "Owner deletes care relationships" on public.care_relationships;
create policy "Owner deletes care relationships"
on public.care_relationships for delete
to authenticated
using (
  public.is_recipient_owner(care_recipient_id)
  or public.is_recipient_manager(care_recipient_id)
  or public.is_admin()
);

-- El owner, el manager delegado o un miembro del hogar pueden editar el perfil.
drop policy if exists "Members can manage care recipients" on public.care_recipients;
create policy "Members can manage care recipients"
on public.care_recipients for all
to authenticated
using (
  public.is_household_member(household_id)
  or public.is_recipient_manager(id)
)
with check (
  public.is_household_member(household_id)
  or public.is_recipient_manager(id)
);

-- 4) Red por DNI: resolver / crear / vincularse -----------------------------
-- Security definer para poder cruzar por DNI entre hogares sin exponer datos y
-- para que un cuidador/medico nuevo pueda crear su propio vinculo PENDIENTE
-- (la RLS de insert no lo permitiria por si sola).
create or replace function public.link_self_to_recipient_by_dni(
  p_dni text,
  p_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_dni text := public.normalize_dni(p_dni);
  v_account_type text;
  v_is_tutor boolean;
  v_recipient public.care_recipients%rowtype;
  v_found boolean := false;
  v_household_id uuid;
  v_rel_type text;
  v_existing_status text;
begin
  if v_uid is null then
    return jsonb_build_object('status', 'unauthorized', 'recipient_id', null);
  end if;
  if v_dni is null then
    return jsonb_build_object('status', 'invalid_dni', 'recipient_id', null);
  end if;

  select account_type into v_account_type from public.profiles where id = v_uid;
  v_is_tutor := v_account_type is null or v_account_type = 'tutor-familiar-encargado';

  v_rel_type := case v_account_type
    when 'cuidador' then 'caregiver'
    when 'profesional-salud' then 'professional'
    when 'profesional-legal-administrativo' then 'legal'
    else 'other'
  end;

  select * into v_recipient from public.care_recipients where dni = v_dni limit 1;
  v_found := found;

  if v_found then
    -- Es el tutor legal (owner)?
    select h.id into v_household_id
    from public.households h
    where h.id = v_recipient.household_id
      and h.owner_user_id = v_uid;
    if v_household_id is not null then
      return jsonb_build_object('status', 'owner', 'recipient_id', v_recipient.id);
    end if;

    -- Ya tiene un vinculo vigente?
    select status into v_existing_status
    from public.care_relationships
    where care_recipient_id = v_recipient.id
      and subject_user_id = v_uid
      and status in ('approved', 'pending')
    order by (status = 'approved') desc
    limit 1;
    if v_existing_status is not null then
      return jsonb_build_object(
        'status', case when v_existing_status = 'approved' then 'active' else 'pending' end,
        'recipient_id', v_recipient.id
      );
    end if;

    -- Un segundo tutor entra como vinculo familiar a aprobar.
    if v_is_tutor then
      v_rel_type := 'family';
    end if;

    insert into public.care_relationships (
      care_recipient_id, relationship_type, subject_user_id, subject_name, requested_by
    ) values (
      v_recipient.id, v_rel_type, v_uid,
      nullif(btrim(coalesce(p_name, '')), ''), v_uid
    );

    return jsonb_build_object('status', 'pending', 'recipient_id', v_recipient.id);
  end if;

  -- No existe el adulto mayor: solo un tutor puede registrarlo.
  if not v_is_tutor then
    return jsonb_build_object('status', 'not_found', 'recipient_id', null);
  end if;

  select id into v_household_id
  from public.households
  where owner_user_id = v_uid
  order by created_at asc
  limit 1;

  if v_household_id is null then
    insert into public.households (name, owner_user_id)
    values ('Mi hogar CARE', v_uid)
    returning id into v_household_id;
  end if;

  insert into public.household_members (household_id, user_id, member_role)
  values (v_household_id, v_uid, 'owner')
  on conflict (household_id, user_id) do nothing;

  insert into public.care_recipients (household_id, full_name, dni)
  values (
    v_household_id,
    coalesce(nullif(btrim(coalesce(p_name, '')), ''), 'Persona cuidada'),
    v_dni
  )
  returning * into v_recipient;

  return jsonb_build_object('status', 'created_owner', 'recipient_id', v_recipient.id);
end;
$$;

grant execute on function public.link_self_to_recipient_by_dni(text, text) to authenticated;

-- 5) Agenda / turnos: direccion validada (GeoRef) + localidad + provincia -----
alter table public.appointments add column if not exists address text;
alter table public.appointments add column if not exists locality text;
alter table public.appointments add column if not exists province text;

-- 6) Planes: modelo simplificado a 3 verticales (familias/profesionales/empresas)
-- Migra valores viejos del CHECK de subscriptions.line al nuevo esquema.
-- IMPORTANTE: primero se quita el CHECK viejo, luego se migran los valores y
-- recien al final se agrega el CHECK nuevo (si se actualiza antes de dropear,
-- el UPDATE viola el CHECK viejo que aun no incluye los valores nuevos).
alter table public.subscriptions drop constraint if exists subscriptions_line_check;

update public.subscriptions set line = 'familias' where line = 'planes-familiares';
update public.subscriptions set line = 'empresas'
  where line in ('proveedores-marketplace', 'servicios');
update public.subscriptions set line = 'profesionales' where line = 'legales-administrativos';

alter table public.subscriptions
  add constraint subscriptions_line_check check (line in (
    'familias',
    'profesionales',
    'empresas',
    'intercambio-donaciones'
  ));

-- 7) Vertical Profesionales: nivel de suscripcion (3 niveles) + contacto directo
-- Reemplaza los planes viejos (gratuito/publicado/destacado/premium, legal/admin).
-- El contacto directo (telefono/WhatsApp) solo se expone en Destacado/Premium.
alter table public.caregiver_profiles
  add column if not exists subscription_tier text not null default 'basico';
alter table public.caregiver_profiles
  drop constraint if exists caregiver_profiles_subscription_tier_check;
alter table public.caregiver_profiles
  add constraint caregiver_profiles_subscription_tier_check
  check (subscription_tier in ('basico', 'destacado', 'premium'));
alter table public.caregiver_profiles add column if not exists contact_phone text;
alter table public.caregiver_profiles add column if not exists contact_whatsapp text;
