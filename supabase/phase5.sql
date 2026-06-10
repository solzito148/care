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
