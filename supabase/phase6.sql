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
