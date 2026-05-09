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
