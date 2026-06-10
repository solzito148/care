-- CARE - Migracion consolidada (cloud)
-- GENERADO por scripts/build-migration.mjs - NO editar a mano.
-- Pegar TODO este archivo en Supabase SQL Editor y ejecutar una sola vez.
-- Idempotente: seguro re-ejecutar (create if not exists / drop policy if exists).
-- Orden: schema.sql -> phase2.sql -> phase3.sql -> phase4.sql -> phase5.sql -> phase6.sql

-- ============================================================================
-- schema.sql
-- ============================================================================
-- CARE - Minimal initial schema
-- Target: Supabase/PostgreSQL

create extension if not exists pgcrypto;

-- Roles catalog
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- User profile (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  birth_date date,
  account_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backwards compatible: ensure column exists if profiles already created
alter table public.profiles add column if not exists account_type text;

-- Many-to-many user roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, role_id)
);

-- Family/care units
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null check (member_role in ('owner', 'family', 'caregiver', 'professional')),
  created_at timestamptz not null default now(),
  unique(household_id, user_id)
);

-- Person being cared for
create table if not exists public.care_recipients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  birth_date date,
  blood_type text,
  emergency_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campos JSON para UI (listas en persona cuidada, snapshot de medicacion). Idempotente.
alter table public.care_recipients
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Medication catalog assigned to care recipient
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients(id) on delete cascade,
  name text not null,
  dosage text not null,
  route text,
  instructions text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medications
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  frequency text not null, -- e.g. daily, weekly, custom
  time_of_day time not null,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.medication_intakes (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.medication_schedules(id) on delete cascade,
  taken_at timestamptz,
  status text not null check (status in ('pending', 'taken', 'skipped', 'late')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Agenda and appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients(id) on delete cascade,
  title text not null,
  provider_name text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'done', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medical studies / labs (Fase 3)
create table if not exists public.medical_studies (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients(id) on delete cascade,
  title text not null,
  study_type text,
  prescribing_doctor text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  preparation_notes text,
  result_summary text,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Basic auditable events
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes para FK columns. Postgres no los crea automaticamente para foreign
-- keys, y las RLS policies hacen lookups del tipo `where xxx_id = X`. Sin
-- index, full scan en cada query.
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_household_members_user_id on public.household_members(user_id);
create index if not exists idx_household_members_household_id on public.household_members(household_id);
create index if not exists idx_care_recipients_household_id on public.care_recipients(household_id);
create index if not exists idx_medications_care_recipient_id on public.medications(care_recipient_id);
create index if not exists idx_medication_schedules_medication_id on public.medication_schedules(medication_id);
create index if not exists idx_medication_intakes_schedule_id on public.medication_intakes(schedule_id);
create index if not exists idx_medication_intakes_created_by on public.medication_intakes(created_by);
create index if not exists idx_appointments_care_recipient_id on public.appointments(care_recipient_id);
create index if not exists idx_appointments_starts_at on public.appointments(starts_at);
create index if not exists idx_medical_studies_care_recipient_id on public.medical_studies(care_recipient_id);
create index if not exists idx_medical_studies_status on public.medical_studies(status);
create index if not exists idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

-- Timestamp trigger helper
-- search_path explicito para silenciar el linter de Supabase
-- (function_search_path_mutable) y evitar lookups en schemas de atacante.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_care_recipients_updated_at on public.care_recipients;
create trigger trg_care_recipients_updated_at
before update on public.care_recipients
for each row execute function public.set_updated_at();

drop trigger if exists trg_medications_updated_at on public.medications;
create trigger trg_medications_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists trg_medical_studies_updated_at on public.medical_studies;
create trigger trg_medical_studies_updated_at
before update on public.medical_studies
for each row execute function public.set_updated_at();

-- Basic RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.care_recipients enable row level security;
alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_intakes enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_studies enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Own roles (read-only from client; writes via service role or future admin policies)
alter table public.user_roles enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles for select
using (user_id = auth.uid());

-- Household membership helper
-- `stable` + `set search_path` para que el linter de Supabase la marque como
-- segura. Se invoca desde RLS policies de varias tablas.
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

-- Postgres 15+ restringio default privileges para `public` schema.
-- Asegurar que `authenticated` pueda invocar la helper desde RLS.
grant execute on function public.is_household_member(uuid) to authenticated;

-- Household and care data policies (membership bound)
drop policy if exists "Members can read households" on public.households;
create policy "Members can read households"
on public.households for select
using (public.is_household_member(id) or owner_user_id = auth.uid());

drop policy if exists "Owner can manage household" on public.households;
create policy "Owner can manage household"
on public.households for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Members can read household members" on public.household_members;
create policy "Members can read household members"
on public.household_members for select
using (public.is_household_member(household_id));

drop policy if exists "Owner can manage household members" on public.household_members;
create policy "Owner can manage household members"
on public.household_members for all
using (
  exists (
    select 1 from public.households h
    where h.id = household_id and h.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.households h
    where h.id = household_id and h.owner_user_id = auth.uid()
  )
);

drop policy if exists "Members can read care recipients" on public.care_recipients;
create policy "Members can read care recipients"
on public.care_recipients for select
using (public.is_household_member(household_id));

drop policy if exists "Members can manage care recipients" on public.care_recipients;
create policy "Members can manage care recipients"
on public.care_recipients for all
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

drop policy if exists "Members can read medications" on public.medications;
create policy "Members can read medications"
on public.medications for select
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medications.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can manage medications" on public.medications;
create policy "Members can manage medications"
on public.medications for all
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medications.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
)
with check (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medications.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can read medication schedules" on public.medication_schedules;
create policy "Members can read medication schedules"
on public.medication_schedules for select
using (
  exists (
    select 1
    from public.medications m
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where m.id = medication_schedules.medication_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can manage medication schedules" on public.medication_schedules;
create policy "Members can manage medication schedules"
on public.medication_schedules for all
using (
  exists (
    select 1
    from public.medications m
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where m.id = medication_schedules.medication_id
      and public.is_household_member(cr.household_id)
  )
)
with check (
  exists (
    select 1
    from public.medications m
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where m.id = medication_schedules.medication_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can read medication intakes" on public.medication_intakes;
create policy "Members can read medication intakes"
on public.medication_intakes for select
using (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where ms.id = medication_intakes.schedule_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can manage medication intakes" on public.medication_intakes;
create policy "Members can manage medication intakes"
on public.medication_intakes for all
using (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where ms.id = medication_intakes.schedule_id
      and public.is_household_member(cr.household_id)
  )
)
with check (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    join public.care_recipients cr on cr.id = m.care_recipient_id
    where ms.id = medication_intakes.schedule_id
      and public.is_household_member(cr.household_id)
  )
);

-- Appointments policies
drop policy if exists "Members can read appointments" on public.appointments;
create policy "Members can read appointments"
on public.appointments for select
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = appointments.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can manage appointments" on public.appointments;
create policy "Members can manage appointments"
on public.appointments for all
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = appointments.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
)
with check (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = appointments.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

-- Medical studies policies
drop policy if exists "Members can read medical studies" on public.medical_studies;
create policy "Members can read medical studies"
on public.medical_studies for select
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medical_studies.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can manage medical studies" on public.medical_studies;
create policy "Members can manage medical studies"
on public.medical_studies for all
using (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medical_studies.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
)
with check (
  exists (
    select 1
    from public.care_recipients cr
    where cr.id = medical_studies.care_recipient_id
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members can insert audit logs" on public.audit_logs;
create policy "Members can insert audit logs"
on public.audit_logs for insert
to authenticated
with check (coalesce(actor_user_id, auth.uid()) = auth.uid());

drop policy if exists "Users can read own audit logs" on public.audit_logs;
create policy "Users can read own audit logs"
on public.audit_logs for select
to authenticated
using (actor_user_id = auth.uid());

alter table public.roles enable row level security;

drop policy if exists "Authenticated can read roles" on public.roles;
create policy "Authenticated can read roles"
on public.roles for select
to authenticated
using (true);

-- Seed roles
insert into public.roles(code, name, description)
values
  ('admin', 'Administrador', 'Admin de la plataforma CARE'),
  ('tutor', 'Tutor/Familiar', 'Responsable principal del cuidado'),
  ('caregiver', 'Cuidador', 'Cuidador profesional o particular'),
  ('professional', 'Profesional de salud', 'Medicos y especialistas'),
  ('legal_admin', 'Profesional legal/administrativo', 'Asesores legales y administrativos'),
  ('provider', 'Proveedor', 'Proveedor de servicios o marketplace'),
  ('care_recipient', 'Persona cuidada', 'Usuario de vista simple')
on conflict (code) do nothing;

-- Trigger: bootstrap profile + role on signup
-- Reads first_name/last_name/phone/account_type from auth.users.raw_user_meta_data
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
  v_role_code text;
begin
  insert into public.profiles (id, full_name, phone, account_type)
  values (new.id, nullif(v_full_name, ''), v_phone, v_account_type)
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        account_type = coalesce(excluded.account_type, public.profiles.account_type),
        updated_at = now();

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
    select new.id, r.id
    from public.roles r
    where r.code = v_role_code
    on conflict (user_id, role_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- ============================================================================
-- phase2.sql
-- ============================================================================
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


-- ============================================================================
-- phase3.sql
-- ============================================================================
-- CARE Fase 3 - estudios, alta de cuidadores y recomendaciones
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql y phase2.sql)
-- Idempotente: safe re-run.

-- 1) Alta de cuidadores: un usuario autenticado puede crear su propio perfil
--    de cuidador (linked_user_id = auth.uid()).
drop policy if exists "Authenticated creates own caregiver profile" on public.caregiver_profiles;
create policy "Authenticated creates own caregiver profile"
on public.caregiver_profiles for insert
to authenticated
with check (linked_user_id = auth.uid());

-- 2) Recomendaciones de cuidadores (persistencia del formulario /cuidadores/recomendar)
create table if not exists public.caregiver_recommendations (
  id uuid primary key default gen_random_uuid(),
  caregiver_profile_id uuid not null references public.caregiver_profiles(id) on delete cascade,
  recommender_user_id uuid not null references auth.users(id) on delete cascade,
  recommender_name text not null,
  period_from date,
  period_to date,
  zone text,
  modality text,
  tasks_summary text,
  score_general smallint not null default 5 check (score_general between 1 and 5),
  score_punctuality smallint not null default 5 check (score_punctuality between 1 and 5),
  score_treatment smallint not null default 5 check (score_treatment between 1 and 5),
  score_responsibility smallint not null default 5 check (score_responsibility between 1 and 5),
  score_communication smallint not null default 5 check (score_communication between 1 and 5),
  score_reliability smallint not null default 5 check (score_reliability between 1 and 5),
  comment text,
  would_rehire boolean not null default true,
  allow_public boolean not null default true,
  allow_contact boolean not null default false,
  status text not null default 'pendiente-revision'
    check (status in ('pendiente-revision', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now()
);

create index if not exists idx_caregiver_recommendations_profile
  on public.caregiver_recommendations(caregiver_profile_id);
create index if not exists idx_caregiver_recommendations_recommender
  on public.caregiver_recommendations(recommender_user_id);

alter table public.caregiver_recommendations enable row level security;

drop policy if exists "User inserts own recommendation" on public.caregiver_recommendations;
create policy "User inserts own recommendation"
on public.caregiver_recommendations for insert
to authenticated
with check (recommender_user_id = auth.uid());

drop policy if exists "User reads own or approved public recommendations" on public.caregiver_recommendations;
create policy "User reads own or approved public recommendations"
on public.caregiver_recommendations for select
to authenticated
using (
  recommender_user_id = auth.uid()
  or (status = 'aprobada' and allow_public)
);

-- 3) Storage bucket privado para adjuntos de estudios medicos.
--    Convencion de paths: {care_recipient_id}/{uuid}-{filename}
insert into storage.buckets (id, name, public)
values ('estudios', 'estudios', false)
on conflict (id) do nothing;

drop policy if exists "Members upload study attachments" on storage.objects;
create policy "Members upload study attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'estudios'
  and exists (
    select 1
    from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members read study attachments" on storage.objects;
create policy "Members read study attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'estudios'
  and exists (
    select 1
    from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.is_household_member(cr.household_id)
  )
);

drop policy if exists "Members delete study attachments" on storage.objects;
create policy "Members delete study attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'estudios'
  and exists (
    select 1
    from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.is_household_member(cr.household_id)
  )
);


-- ============================================================================
-- phase4.sql
-- ============================================================================
-- CARE Fase 4 - servicios y marketplace persistidos
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql, phase2.sql y phase3.sql)
-- Idempotente: safe re-run.

-- 1) Servicios publicados por proveedores
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  provider_name text not null,
  category text not null check (category in (
    'traslados-y-acompanamiento',
    'desarme-y-organizacion-del-hogar',
    'adaptacion-del-hogar',
    'tramites-y-gestiones',
    'servicios-domiciliarios-complementarios'
  )),
  description text not null default '',
  coverage_zone text not null default '',
  availability text not null default '',
  phone_whatsapp text not null default '',
  email text not null default '',
  plan text not null default 'Basico' check (plan in ('Basico', 'Destacado', 'Premium')),
  featured boolean not null default false,
  status text not null default 'publicado' check (status in ('publicado', 'pausado', 'bloqueado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_status on public.services(status);

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

alter table public.services enable row level security;

drop policy if exists "Authenticated read published services" on public.services;
create policy "Authenticated read published services"
on public.services for select
to authenticated
using (status = 'publicado' or owner_user_id = auth.uid());

drop policy if exists "Owner inserts service" on public.services;
create policy "Owner inserts service"
on public.services for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Owner updates service" on public.services;
create policy "Owner updates service"
on public.services for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Owner deletes service" on public.services;
create policy "Owner deletes service"
on public.services for delete
to authenticated
using (owner_user_id = auth.uid());

-- 2) Marketplace (venta / alquiler / intercambio / donaciones)
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category text not null default '',
  zone text not null default '',
  condition text not null default '',
  price text,
  listing_type text not null check (listing_type in ('venta', 'alquiler', 'intercambio', 'donaciones')),
  contact_phone text not null default '',
  status text not null default 'publicado' check (status in ('publicado', 'pausado', 'bloqueado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Intercambio y donaciones son gratuitos: sin precio.
  constraint marketplace_free_sections_no_price
    check (listing_type in ('venta', 'alquiler') or price is null)
);

create index if not exists idx_marketplace_items_type on public.marketplace_items(listing_type);
create index if not exists idx_marketplace_items_status on public.marketplace_items(status);

drop trigger if exists trg_marketplace_items_updated_at on public.marketplace_items;
create trigger trg_marketplace_items_updated_at
before update on public.marketplace_items
for each row execute function public.set_updated_at();

alter table public.marketplace_items enable row level security;

drop policy if exists "Authenticated read published items" on public.marketplace_items;
create policy "Authenticated read published items"
on public.marketplace_items for select
to authenticated
using (status = 'publicado' or owner_user_id = auth.uid());

drop policy if exists "Owner inserts item" on public.marketplace_items;
create policy "Owner inserts item"
on public.marketplace_items for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Owner updates item" on public.marketplace_items;
create policy "Owner updates item"
on public.marketplace_items for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Owner deletes item" on public.marketplace_items;
create policy "Owner deletes item"
on public.marketplace_items for delete
to authenticated
using (owner_user_id = auth.uid());

-- 3) Seed inicial (los datos que antes vivian en mocks; sin owner => solo lectura)
insert into public.services (
  id, provider_name, category, description, coverage_zone, availability,
  phone_whatsapp, email, plan, featured
)
values
('33333333-3333-4333-8333-333333333301', 'Traslados CARE Move', 'traslados-y-acompanamiento',
 'Traslado de personas mayores a turnos medicos, estudios y tramites. Incluye vehiculo adaptado y acompanamiento.',
 'CABA y Buenos Aires Norte', 'Lunes a domingo 24 hs', '+54 11 4555-1010', 'contacto@caremove.com', 'Premium', true),
('33333333-3333-4333-8333-333333333302', 'Hogar en Orden Senior', 'desarme-y-organizacion-del-hogar',
 'Desmontaje de vivienda, inventario, embalaje, coordinacion de donaciones/venta/descarte y limpieza final.',
 'CABA, Buenos Aires Sur y Oeste', 'Lunes a sabados', '+54 11 4333-7878', 'equipo@hogarenorden.com', 'Destacado', true),
('33333333-3333-4333-8333-333333333303', 'Casa Segura Adaptaciones', 'adaptacion-del-hogar',
 'Instalacion de rampas, barrales, bano adaptado y mejoras de seguridad domiciliaria para prevencion de caidas.',
 'La Plata e Interior Buenos Aires', 'Lunes a viernes', '+54 11 4999-1212', 'ventas@casasegura.com', 'Basico', false),
('33333333-3333-4333-8333-333333333304', 'Gestiones Senior Plus', 'tramites-y-gestiones',
 'Asistencia con obras sociales, prepagas, CUD, recetas, autorizaciones y documentacion medica.',
 'Resto Argentina (remoto y presencial)', 'Lunes a viernes', '+54 11 4222-9900', 'info@gestionsenior.com', 'Destacado', true),
('33333333-3333-4333-8333-333333333305', 'Asistencia Hogar Integral', 'servicios-domiciliarios-complementarios',
 'Limpieza, cocina, lavanderia, compras, mantenimiento menor, compania y asistencia digital domiciliaria.',
 'CABA y Buenos Aires Oeste', 'Turnos por hora y jornada completa', '+54 11 4777-1313', 'contacto@hogarintegral.com', 'Basico', false)
on conflict (id) do nothing;

insert into public.marketplace_items (
  id, title, category, zone, condition, price, listing_type
)
values
('44444444-4444-4444-8444-444444444401', 'Silla de ruedas plegable', 'movilidad', 'CABA', 'Excelente', '$320.000', 'venta'),
('44444444-4444-4444-8444-444444444402', 'Colchon antiescaras premium', 'rehabilitacion', 'La Plata', 'Nuevo', '$210.000', 'venta'),
('44444444-4444-4444-8444-444444444403', 'Cama ortopedica electrica', 'descanso', 'Buenos Aires Norte', 'Muy bueno', '$95.000 / mes', 'alquiler'),
('44444444-4444-4444-8444-444444444404', 'Concentrador de oxigeno', 'salud-domiciliaria', 'Buenos Aires Oeste', 'Muy bueno', '$60.000 / mes', 'alquiler'),
('44444444-4444-4444-8444-444444444405', 'Intercambio andador por silla de ducha', 'movilidad', 'CABA', 'Buen estado', null, 'intercambio'),
('44444444-4444-4444-8444-444444444406', 'Intercambio sesiones de rehabilitacion', 'rehabilitacion', 'Buenos Aires Sur', 'Disponible', null, 'intercambio'),
('44444444-4444-4444-8444-444444444407', 'Donacion de barras de apoyo para bano', 'bano', 'Interior Buenos Aires', 'Muy bueno', null, 'donaciones'),
('44444444-4444-4444-8444-444444444408', 'Solicitud de panales para adulto', 'insumos', 'Resto Argentina', 'Urgente', null, 'donaciones')
on conflict (id) do nothing;


-- ============================================================================
-- phase5.sql
-- ============================================================================
-- CARE Fase 5 - suscripciones (pagos) y notificaciones in-app
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql y phase2..4.sql)
-- Idempotente: safe re-run.

-- 1) Suscripciones a planes
-- El cobro real (Mercado Pago) llega en una fase posterior: por ahora la
-- seleccion de plan crea una suscripcion `pendiente-pago` que un admin (o el
-- webhook de pagos, cuando exista) pasa a `activa`.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  plan_name text not null,
  line text not null check (line in (
    'planes-familiares',
    'profesionales',
    'proveedores-marketplace',
    'servicios',
    'legales-administrativos',
    'intercambio-donaciones'
  )),
  status text not null default 'pendiente-pago' check (status in (
    'activa', 'pendiente-pago', 'vencida', 'cancelada'
  )),
  amount text not null default '$0',
  billing_cycle text not null default 'Mensual',
  next_due_date date,
  -- Referencia externa del proveedor de pagos (preapproval_id de Mercado Pago).
  payment_external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "Owner reads own subscriptions" on public.subscriptions;
create policy "Owner reads own subscriptions"
on public.subscriptions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Owner inserts own subscription" on public.subscriptions;
create policy "Owner inserts own subscription"
on public.subscriptions for insert
to authenticated
with check (user_id = auth.uid());

-- El usuario solo puede cancelar (no auto-activar): el cambio a `activa`
-- queda en manos del service role (webhook de pagos / admin).
drop policy if exists "Owner cancels own subscription" on public.subscriptions;
create policy "Owner cancels own subscription"
on public.subscriptions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status in ('cancelada', 'pendiente-pago'));

-- 2) Notificaciones in-app
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'info' check (kind in ('info', 'warning', 'urgent', 'billing')),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Owner reads own notifications" on public.notifications;
create policy "Owner reads own notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Owner inserts own notifications" on public.notifications;
create policy "Owner inserts own notifications"
on public.notifications for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Owner marks own notifications" on public.notifications;
create policy "Owner marks own notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Owner deletes own notifications" on public.notifications;
create policy "Owner deletes own notifications"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());


-- ============================================================================
-- phase6.sql
-- ============================================================================
-- CARE Fase 6 - panel admin, contactos y documentos legales
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql y phase2..5.sql)
-- Idempotente: safe re-run.

-- 1) Helper de rol admin. `security definer` para poder leer user_roles/roles
--    sin depender de las RLS del invocador y evitar recursion en las policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- 2) Policies de moderacion para admins.
-- Recomendaciones de cuidadores: leer todas y aprobar/rechazar.
drop policy if exists "Admin reads all recommendations" on public.caregiver_recommendations;
create policy "Admin reads all recommendations"
on public.caregiver_recommendations for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin updates recommendation status" on public.caregiver_recommendations;
create policy "Admin updates recommendation status"
on public.caregiver_recommendations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Perfiles de cuidadores: el cuidador puede actualizar su propio perfil
-- (confirmar que sus datos estan vigentes, pausar perfil, etc.).
drop policy if exists "Owner updates own caregiver profile" on public.caregiver_profiles;
create policy "Owner updates own caregiver profile"
on public.caregiver_profiles for update
to authenticated
using (linked_user_id = auth.uid())
with check (linked_user_id = auth.uid());

-- Perfiles de cuidadores: el admin puede marcarlos como recomendados / verificados.
drop policy if exists "Admin reads all caregiver profiles" on public.caregiver_profiles;
create policy "Admin reads all caregiver profiles"
on public.caregiver_profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin updates caregiver profiles" on public.caregiver_profiles;
create policy "Admin updates caregiver profiles"
on public.caregiver_profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Servicios: el admin ve todo y puede bloquear/restaurar.
drop policy if exists "Admin reads all services" on public.services;
create policy "Admin reads all services"
on public.services for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin moderates services" on public.services;
create policy "Admin moderates services"
on public.services for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Marketplace: idem servicios.
drop policy if exists "Admin reads all items" on public.marketplace_items;
create policy "Admin reads all items"
on public.marketplace_items for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin moderates items" on public.marketplace_items;
create policy "Admin moderates items"
on public.marketplace_items for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Suscripciones: el admin ve todas y puede activarlas (rol de "webhook manual").
drop policy if exists "Admin reads all subscriptions" on public.subscriptions;
create policy "Admin reads all subscriptions"
on public.subscriptions for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin updates subscriptions" on public.subscriptions;
create policy "Admin updates subscriptions"
on public.subscriptions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Notificaciones: el admin puede crear notificaciones para cualquier usuario
--    (avisos de moderacion, activacion de plan, etc.).
drop policy if exists "Admin inserts notifications" on public.notifications;
create policy "Admin inserts notifications"
on public.notifications for insert
to authenticated
with check (public.is_admin());

-- Audit logs: el admin puede leer toda la auditoria.
drop policy if exists "Admin reads all audit logs" on public.audit_logs;
create policy "Admin reads all audit logs"
on public.audit_logs for select
to authenticated
using (public.is_admin());

-- 3) Contactos (red de apoyo: familia, medicos, emergencias) por hogar.
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  full_name text not null,
  relationship text not null default '',
  category text not null default 'familia'
    check (category in ('familia', 'medico', 'emergencia', 'servicio', 'otro')),
  phone text not null default '',
  email text not null default '',
  notes text not null default '',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_household on public.contacts(household_id);

drop trigger if exists trg_contacts_updated_at on public.contacts;
create trigger trg_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

drop policy if exists "Members read contacts" on public.contacts;
create policy "Members read contacts"
on public.contacts for select
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members manage contacts" on public.contacts;
create policy "Members manage contacts"
on public.contacts for all
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

-- 4) Documentos legales / administrativos por hogar.
create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  doc_type text not null default 'otro'
    check (doc_type in ('poder', 'directiva-anticipada', 'curatela', 'tramite', 'seguro', 'otro')),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en-tramite', 'vigente', 'vencido')),
  responsible text not null default '',
  due_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_legal_documents_household on public.legal_documents(household_id);

drop trigger if exists trg_legal_documents_updated_at on public.legal_documents;
create trigger trg_legal_documents_updated_at
before update on public.legal_documents
for each row execute function public.set_updated_at();

alter table public.legal_documents enable row level security;

drop policy if exists "Members read legal documents" on public.legal_documents;
create policy "Members read legal documents"
on public.legal_documents for select
to authenticated
using (public.is_household_member(household_id));

drop policy if exists "Members manage legal documents" on public.legal_documents;
create policy "Members manage legal documents"
on public.legal_documents for all
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));
