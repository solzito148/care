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
