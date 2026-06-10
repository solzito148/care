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
