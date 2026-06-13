-- CARE Fase 7 - Relaciones entre roles y persona cuidada + flujo de aprobacion
-- (ejecutar en Supabase SQL Editor DESPUES de schema.sql y phase2..6.sql)
-- Idempotente: safe re-run.
--
-- Modelo:
--   * Las relaciones se asocian a cada adulto mayor (care_recipient).
--   * El sujeto puede tener cuenta CARE (subject_user_id) o ser externo (subject_name).
--   * El tutor/owner del hogar crea relaciones aprobadas automaticamente.
--   * Un cuidador/profesional aprobado puede PROPONER una relacion (ej: un medico),
--     que queda 'pending' hasta que el tutor la aprueba.
--   * El acceso a los modulos se deriva de relaciones aprobadas:
--       - medico (professional) aprobado: lectura + escritura.
--       - cuidador aprobado: lectura + escritura.
--       - cuidador 'pending': solo lectura (limitada).
--   * Se preserva el acceso historico via household_members (aditivo).

-- 1) Tabla de relaciones
create table if not exists public.care_relationships (
  id uuid primary key default gen_random_uuid(),
  care_recipient_id uuid not null references public.care_recipients(id) on delete cascade,
  relationship_type text not null
    check (relationship_type in ('caregiver', 'professional', 'family', 'legal', 'other')),
  subject_user_id uuid references auth.users(id) on delete set null,
  subject_name text,
  subject_phone text,
  subject_email text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'revoked')),
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint care_relationships_subject_present
    check (subject_user_id is not null or subject_name is not null)
);

create index if not exists idx_care_relationships_recipient
  on public.care_relationships(care_recipient_id);
create index if not exists idx_care_relationships_subject
  on public.care_relationships(subject_user_id);
create index if not exists idx_care_relationships_status
  on public.care_relationships(status);
create index if not exists idx_care_relationships_requested_by
  on public.care_relationships(requested_by);

-- Evita relaciones activas duplicadas (mismo sujeto, persona y tipo).
create unique index if not exists uniq_active_care_relationship
  on public.care_relationships (care_recipient_id, subject_user_id, relationship_type)
  where status in ('pending', 'approved') and subject_user_id is not null;

-- 2) Helpers (security definer para evitar recursion de RLS al leer relaciones
--    desde las policies de otras tablas).
create or replace function public.is_recipient_owner(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.care_recipients cr
    join public.households h on h.id = cr.household_id
    where cr.id = target_recipient
      and h.owner_user_id = auth.uid()
  );
$$;

grant execute on function public.is_recipient_owner(uuid) to authenticated;

create or replace function public.can_read_recipient(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    exists (
      select 1
      from public.care_recipients cr
      where cr.id = target_recipient
        and public.is_household_member(cr.household_id)
    )
    or exists (
      select 1
      from public.care_relationships rel
      where rel.care_recipient_id = target_recipient
        and rel.subject_user_id = auth.uid()
        and rel.status = 'approved'
    )
    or exists (
      -- cuidador pendiente: lectura limitada mientras el tutor decide
      select 1
      from public.care_relationships rel
      where rel.care_recipient_id = target_recipient
        and rel.subject_user_id = auth.uid()
        and rel.status = 'pending'
        and rel.relationship_type = 'caregiver'
    );
$$;

grant execute on function public.can_read_recipient(uuid) to authenticated;

create or replace function public.can_write_recipient(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    exists (
      select 1
      from public.care_recipients cr
      where cr.id = target_recipient
        and public.is_household_member(cr.household_id)
    )
    or exists (
      select 1
      from public.care_relationships rel
      where rel.care_recipient_id = target_recipient
        and rel.subject_user_id = auth.uid()
        and rel.status = 'approved'
        and rel.relationship_type in ('caregiver', 'professional')
    );
$$;

grant execute on function public.can_write_recipient(uuid) to authenticated;

-- Quien puede PROPONER una relacion para una persona cuidada.
create or replace function public.can_propose_relationship(target_recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_recipient_owner(target_recipient)
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

-- 3) Triggers: fijan el estado segun el actor (el tutor aprueba; el resto queda pendiente).
create or replace function public.handle_care_relationship_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.requested_by := coalesce(new.requested_by, auth.uid());

  if public.is_recipient_owner(new.care_recipient_id) or public.is_admin() then
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

create or replace function public.handle_care_relationship_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
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

-- 4) RLS de la tabla de relaciones
alter table public.care_relationships enable row level security;

drop policy if exists "Read related care relationships" on public.care_relationships;
create policy "Read related care relationships"
on public.care_relationships for select
to authenticated
using (
  public.is_recipient_owner(care_recipient_id)
  or subject_user_id = auth.uid()
  or requested_by = auth.uid()
  or public.is_admin()
);

drop policy if exists "Propose care relationships" on public.care_relationships;
create policy "Propose care relationships"
on public.care_relationships for insert
to authenticated
with check (public.can_propose_relationship(care_recipient_id));

-- Solo el tutor/owner (o admin) aprueba, rechaza o revoca.
drop policy if exists "Owner moderates care relationships" on public.care_relationships;
create policy "Owner moderates care relationships"
on public.care_relationships for update
to authenticated
using (public.is_recipient_owner(care_recipient_id) or public.is_admin())
with check (public.is_recipient_owner(care_recipient_id) or public.is_admin());

drop policy if exists "Owner deletes care relationships" on public.care_relationships;
create policy "Owner deletes care relationships"
on public.care_relationships for delete
to authenticated
using (public.is_recipient_owner(care_recipient_id) or public.is_admin());

-- 5) Reescritura de RLS de los modulos: acceso derivado de relaciones.
--    Lectura -> can_read_recipient ; escritura -> can_write_recipient.

-- care_recipients (un sujeto vinculado puede ver su persona cuidada)
drop policy if exists "Members can read care recipients" on public.care_recipients;
create policy "Members can read care recipients"
on public.care_recipients for select
to authenticated
using (public.can_read_recipient(id));

drop policy if exists "Members can manage care recipients" on public.care_recipients;
create policy "Members can manage care recipients"
on public.care_recipients for all
to authenticated
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

-- medications
drop policy if exists "Members can read medications" on public.medications;
create policy "Members can read medications"
on public.medications for select
to authenticated
using (public.can_read_recipient(care_recipient_id));

drop policy if exists "Members can manage medications" on public.medications;
drop policy if exists "Members can write medications" on public.medications;
create policy "Members can write medications"
on public.medications for all
to authenticated
using (public.can_write_recipient(care_recipient_id))
with check (public.can_write_recipient(care_recipient_id));

-- medication_schedules (recipient via medication)
drop policy if exists "Members can read medication schedules" on public.medication_schedules;
create policy "Members can read medication schedules"
on public.medication_schedules for select
to authenticated
using (
  exists (
    select 1 from public.medications m
    where m.id = medication_schedules.medication_id
      and public.can_read_recipient(m.care_recipient_id)
  )
);

drop policy if exists "Members can manage medication schedules" on public.medication_schedules;
drop policy if exists "Members can write medication schedules" on public.medication_schedules;
create policy "Members can write medication schedules"
on public.medication_schedules for all
to authenticated
using (
  exists (
    select 1 from public.medications m
    where m.id = medication_schedules.medication_id
      and public.can_write_recipient(m.care_recipient_id)
  )
)
with check (
  exists (
    select 1 from public.medications m
    where m.id = medication_schedules.medication_id
      and public.can_write_recipient(m.care_recipient_id)
  )
);

-- medication_intakes (recipient via schedule -> medication)
drop policy if exists "Members can read medication intakes" on public.medication_intakes;
create policy "Members can read medication intakes"
on public.medication_intakes for select
to authenticated
using (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    where ms.id = medication_intakes.schedule_id
      and public.can_read_recipient(m.care_recipient_id)
  )
);

drop policy if exists "Members can manage medication intakes" on public.medication_intakes;
drop policy if exists "Members can write medication intakes" on public.medication_intakes;
create policy "Members can write medication intakes"
on public.medication_intakes for all
to authenticated
using (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    where ms.id = medication_intakes.schedule_id
      and public.can_write_recipient(m.care_recipient_id)
  )
)
with check (
  exists (
    select 1
    from public.medication_schedules ms
    join public.medications m on m.id = ms.medication_id
    where ms.id = medication_intakes.schedule_id
      and public.can_write_recipient(m.care_recipient_id)
  )
);

-- appointments
drop policy if exists "Members can read appointments" on public.appointments;
create policy "Members can read appointments"
on public.appointments for select
to authenticated
using (public.can_read_recipient(care_recipient_id));

drop policy if exists "Members can manage appointments" on public.appointments;
drop policy if exists "Members can write appointments" on public.appointments;
create policy "Members can write appointments"
on public.appointments for all
to authenticated
using (public.can_write_recipient(care_recipient_id))
with check (public.can_write_recipient(care_recipient_id));

-- medical_studies
drop policy if exists "Members can read medical studies" on public.medical_studies;
create policy "Members can read medical studies"
on public.medical_studies for select
to authenticated
using (public.can_read_recipient(care_recipient_id));

drop policy if exists "Members can manage medical studies" on public.medical_studies;
drop policy if exists "Members can write medical studies" on public.medical_studies;
create policy "Members can write medical studies"
on public.medical_studies for all
to authenticated
using (public.can_write_recipient(care_recipient_id))
with check (public.can_write_recipient(care_recipient_id));

-- 6) Storage (adjuntos de estudios): el sujeto vinculado tambien accede segun
--    lectura/escritura sobre la persona cuidada (path = {care_recipient_id}/...).
drop policy if exists "Members upload study attachments" on storage.objects;
create policy "Members upload study attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'estudios'
  and exists (
    select 1 from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.can_write_recipient(cr.id)
  )
);

drop policy if exists "Members read study attachments" on storage.objects;
create policy "Members read study attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'estudios'
  and exists (
    select 1 from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.can_read_recipient(cr.id)
  )
);

drop policy if exists "Members delete study attachments" on storage.objects;
create policy "Members delete study attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'estudios'
  and exists (
    select 1 from public.care_recipients cr
    where cr.id::text = (storage.foldername(name))[1]
      and public.can_write_recipient(cr.id)
  )
);
