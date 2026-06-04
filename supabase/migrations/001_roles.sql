-- profiles + roles (multi-rol por usuario)
create type role_code as enum (
  'tutor',
  'caregiver',
  'professional',
  'legal_admin',
  'provider'
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table user_roles (
  user_id uuid references profiles (id) on delete cascade,
  role role_code not null,
  primary key (user_id, role)
);

alter table profiles enable row level security;
alter table user_roles enable row level security;

create policy "read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "read own roles"
  on user_roles for select
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
