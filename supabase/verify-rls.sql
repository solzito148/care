-- Verificacion de RLS en produccion (SEC-18).
-- Pegar en Supabase > SQL Editor despues de aplicar migrate-all.sql.
-- Objetivo: confirmar que toda tabla de datos de usuario tiene RLS habilitado
-- y al menos una policy. Si alguna fila aparece en el primer bloque, RLS NO
-- esta protegiendo esa tabla y los datos quedan expuestos al anon/auth key.

-- 1. Tablas en `public` SIN RLS habilitado (deberia devolver 0 filas).
select
  c.relname as tabla,
  'RLS DESHABILITADO' as estado
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
order by c.relname;

-- 2. Tablas con RLS habilitado pero SIN policies (deberia devolver 0 filas).
--    RLS sin policies bloquea todo, pero indica una migracion incompleta.
select
  c.relname as tabla,
  'RLS SIN POLICIES' as estado
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = true
  and not exists (
    select 1 from pg_policy p where p.polrelid = c.oid
  )
order by c.relname;

-- 3. Inventario: tablas, RLS y cantidad de policies (revision manual).
select
  c.relname as tabla,
  c.relrowsecurity as rls_habilitado,
  count(p.polname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relname;

-- 4. Confirmar que el bucket privado de estudios no es publico.
select id, name, public as es_publico
from storage.buckets
where id = 'estudios';
