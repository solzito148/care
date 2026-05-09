-- CARE Fase 2 - persistencia (ejecutar en Supabase SQL Editor DESPUES de schema.sql)
-- Idempotente: safe re-run.

-- 1) El owner del hogar debe poder acceder aunque no exista fila en household_members.
create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.households h
    where h.id = target_household_id
      and h.owner_user_id = auth.uid()
  );
$$;

grant execute on function public.is_household_member(uuid) to authenticated;

-- 2) JSON flexible para campos de UI no normalizados todavia
alter table public.care_recipients
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.medications
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- 3) Directorio publico de cuidadores (marketplace / busqueda)
create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  display_initials text not null,
  full_name text not null,
  zones text[] not null default '{}',
  locality text not null default '',
  modalities text[] not null default '{}',
  availability_special text[] not null default '{}',
  experience_years integer not null default 0,
  tasks text[] not null default '{}',
  rating numeric(3, 2) not null default 0,
  profile_complete boolean not null default false,
  references_loaded boolean not null default false,
  references_verified boolean not null default false,
  recommended_care boolean not null default false,
  data_updated boolean not null default true,
  profile_status text not null default 'datos-actualizados'
    check (profile_status in (
      'datos-actualizados',
      'pendiente-actualizacion',
      'datos-vencidos',
      'perfil-pausado'
    )),
  high_availability boolean not null default false,
  last_profile_update date,
  linked_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_caregiver_profiles_locality on public.caregiver_profiles(locality);
create index if not exists idx_caregiver_profiles_rating on public.caregiver_profiles(rating desc);

drop trigger if exists trg_caregiver_profiles_updated_at on public.caregiver_profiles;
create trigger trg_caregiver_profiles_updated_at
before update on public.caregiver_profiles
for each row execute function public.set_updated_at();

create table if not exists public.caregiver_reference_entries (
  id uuid primary key default gen_random_uuid(),
  caregiver_profile_id uuid not null references public.caregiver_profiles(id) on delete cascade,
  hirer_name text not null,
  zone text,
  period text,
  modality text,
  tasks_summary text,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_caregiver_ref_caregiver on public.caregiver_reference_entries(caregiver_profile_id);

alter table public.caregiver_profiles enable row level security;
alter table public.caregiver_reference_entries enable row level security;

drop policy if exists "Authenticated read caregiver directory" on public.caregiver_profiles;
create policy "Authenticated read caregiver directory"
on public.caregiver_profiles for select
to authenticated
using (true);

drop policy if exists "Authenticated read caregiver references" on public.caregiver_reference_entries;
create policy "Authenticated read caregiver references"
on public.caregiver_reference_entries for select
to authenticated
using (true);

-- Escrituras del directorio: solo por cuenta vinculada (perfil propio) o futuro admin
drop policy if exists "Linked user updates own caregiver profile" on public.caregiver_profiles;
create policy "Linked user updates own caregiver profile"
on public.caregiver_profiles for update
to authenticated
using (linked_user_id = auth.uid())
with check (linked_user_id = auth.uid());

-- 4) Seed directorio (ids estables para URLs /cuidadores/[id])
insert into public.caregiver_profiles (
  id, display_initials, full_name, zones, locality, modalities, availability_special,
  experience_years, tasks, rating, profile_complete, references_loaded, references_verified,
  recommended_care, data_updated, profile_status, high_availability, last_profile_update
)
values
(
  '11111111-1111-4111-8111-111111111101',
  'LS', 'Laura Sosa',
  array['CABA','Buenos Aires Norte']::text[],
  'Belgrano',
  array['Con retiro','Por hora','Noches']::text[],
  array['Sabados','Domingos']::text[],
  8,
  array['Adultos mayores','Administracion de medicacion','Compania']::text[],
  4.80, true, true, true, true, true, 'datos-actualizados', true, '2026-05-01'::date
),
(
  '11111111-1111-4111-8111-111111111102',
  'MD', 'Mario Diaz',
  array['Zona Oeste','La Matanza']::text[],
  'Ramos Mejia',
  array['Sin retiro','Guardia 24 hs']::text[],
  array['Domingos']::text[],
  12,
  array['Movilidad reducida','Higiene personal','Signos vitales']::text[],
  4.60, true, true, false, true, true, 'datos-actualizados', false, '2026-04-20'::date
),
(
  '11111111-1111-4111-8111-111111111103',
  'PG', 'Paula Gimenez',
  array['CABA','Zona Sur']::text[],
  'Caballito',
  array['Por hora','Jornada completa']::text[],
  array['Feriados']::text[],
  5,
  array['Alzheimer/demencia','Compania']::text[],
  4.90, true, true, true, true, true, 'datos-actualizados', true, '2026-05-05'::date
)
on conflict (id) do nothing;

-- 5) Evitar hogares duplicados por owner
-- Si una race condition vieja dejo duplicados, conservar el mas viejo
-- antes de crear la unique constraint.
with ranked as (
  select id,
         row_number() over (
           partition by owner_user_id
           order by created_at asc, id asc
         ) as rn
  from public.households
),
victims as (
  select id from ranked where rn > 1
)
delete from public.households
where id in (select id from victims);

create unique index if not exists households_owner_user_id_key
  on public.households(owner_user_id);

insert into public.caregiver_reference_entries (
  id, caregiver_profile_id, hirer_name, zone, period, modality, tasks_summary, phone
)
values
(
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111101',
  'Ana Martinez', 'Belgrano', '2024-2026', 'Con retiro',
  'Medicacion, compania y turnos medicos', '+54 11 4000-1112'
),
(
  '22222222-2222-4222-8222-222222222202',
  '11111111-1111-4111-8111-111111111102',
  'Familia Perez', 'Ramos Mejia', '2023-2025', 'Sin retiro',
  'Guardias 24 hs y control de signos vitales', '+54 11 4333-1000'
),
(
  '22222222-2222-4222-8222-222222222203',
  '11111111-1111-4111-8111-111111111103',
  'Lucia Gomez', 'Caballito', '2025-2026', 'Por hora',
  'Acompanamiento y tareas livianas', '+54 11 4777-2200'
)
on conflict (id) do nothing;
