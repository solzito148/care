# CARE - Configuracion de Supabase Auth

Este documento deja CARE listo para usar Supabase Auth como proveedor de
autenticacion en login y registro. Cubre Fase 1 del roadmap.

## 1. Crear el proyecto en Supabase

1. Crear cuenta en <https://supabase.com> y un nuevo proyecto.
2. Anotar:
   - Project URL (ej. `https://xxxxx.supabase.co`).
   - `anon` public API key.
   - `service_role` secret key (solo para tareas administrativas server-side).
3. Region recomendada: `sa-east-1` o la mas cercana al usuario final.

## 2. Variables de entorno locales

Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

Variables minimas requeridas para Auth:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` es el origen del sitio (esquema + host + puerto). En el
browser CARE usa `window.location.origin`; esta env solo se usa como fallback
en SSR o scripts. En produccion debe ser la URL real (`https://care.tudominio.com`).

`SUPABASE_SERVICE_ROLE_KEY` queda reservada para scripts y tareas admin server-side.

## 2.1 Variables en Vercel (produccion)

En Vercel > Project > Settings > Environment Variables, cargar para
**Production** (y Preview si vas a probar):

| Variable | Requerida | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | si | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | si | anon key (cliente) |
| `NEXT_PUBLIC_SITE_URL` | si | origen real, ej. `https://care-two-eta.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | si (webhook MP) | activa suscripciones desde el webhook (ignora RLS) |
| `MERCADOPAGO_ACCESS_TOKEN` | opcional | sin esto, los planes pagos quedan `pendiente-pago` (activacion manual desde `/admin`) |
| `MERCADOPAGO_WEBHOOK_SECRET` | opcional | verifica la firma `x-signature` del webhook |
| `EMAIL_PROVIDER_API_KEY` | opcional | Resend; sin esto el email se simula en consola |
| `EMAIL_FROM_ADDRESS` | opcional | remitente, ej. `CARE <no-reply@care.app>` |
| `WHATSAPP_API_TOKEN` | opcional | WhatsApp Cloud API; sin esto se simula en consola |
| `WHATSAPP_PHONE_NUMBER_ID` | opcional | id del numero de WhatsApp |
| `SENTRY_DSN` | opcional | observabilidad; sin esto `captureError` solo loguea |

> Las variables `NEXT_PUBLIC_*` se exponen al browser: solo el anon key, nunca
> el `service_role`. Tras cambiar envs en Vercel hay que **redeploy** para que
> tomen efecto.

## 3. Aplicar el esquema SQL

En el dashboard Supabase abrir **SQL Editor** y ejecutar el contenido de
`supabase/schema.sql`. Esto crea:

- Tablas (`profiles`, `roles`, `user_roles`, `households`, `care_recipients`,
  `medications`, `medication_schedules`, `medication_intakes`, `audit_logs`).
- Politicas RLS por entidad.
- Seed de roles (`admin`, `tutor`, `caregiver`, `professional`, `legal_admin`,
  `provider`, `care_recipient`).
- Funcion `public.handle_new_user()` y trigger `on_auth_user_created` sobre
  `auth.users` para crear automaticamente el `profile` y un `user_role` por
  defecto al registrarse.

### Fase 2 (persistencia modulos — ejecutar despues del schema base)

Si el proyecto ya tenia `schema.sql` aplicado antes de mayo 2026, ejecutar ademas
**una vez** el script `supabase/phase2.sql` en SQL Editor. Agrega:

- `metadata` en `care_recipients` y `medications` (JSON flexible para la UI).
- Tablas `caregiver_profiles` y `caregiver_reference_entries` + RLS + seed del directorio de cuidadores.

Las instalaciones nuevas pueden ejecutar `schema.sql` (ya incluye la funcion
`is_household_member` corregida para incluir al owner del hogar) y luego
`phase2.sql` para columnas/tablas adicionales.

### Fase 3 (estudios, alta de cuidadores y recomendaciones)

Ejecutar **una vez** el script `supabase/phase3.sql` en SQL Editor (despues de
`schema.sql` y `phase2.sql`). Agrega:

- Politica de INSERT en `caregiver_profiles` para que un usuario autenticado
  cree su propio perfil de cuidador (`/cuidadores/alta`).
- Tabla `caregiver_recommendations` + RLS (persistencia de
  `/cuidadores/recomendar`; estados `pendiente-revision` / `aprobada` / `rechazada`).
- Bucket privado de Storage `estudios` con politicas por hogar para los adjuntos
  de `/estudios` (paths `{care_recipient_id}/{uuid}-{archivo}`; la app genera
  signed URLs de 30 minutos para descargar).

### Fase 4 (servicios y marketplace)

Ejecutar **una vez** el script `supabase/phase4.sql` en SQL Editor (despues de
las fases anteriores). Agrega:

- Tabla `services` + RLS: publicaciones de servicios complementarios
  (`/servicios`). Lectura de todo lo `publicado` para usuarios autenticados;
  insert/update/delete solo del dueno (`owner_user_id`). Incluye seed con las
  publicaciones de ejemplo.
- Tabla `marketplace_items` + RLS: publicaciones de venta, alquiler,
  intercambio y donaciones (`/marketplace`), con las mismas reglas de
  visibilidad y propiedad. Incluye seed de ejemplo.
- Estados de publicacion: `publicado`, `pausado` (el dueno puede pausar y
  reactivar desde la UI) y `bloqueado` (reservado para moderacion admin).

### Fase 5 (suscripciones y notificaciones)

Ejecutar **una vez** el script `supabase/phase5.sql` en SQL Editor. Agrega:

- Tabla `subscriptions` + RLS: seleccion de plan desde `/planes`. Los planes
  pagos quedan `pendiente-pago` hasta integrar Mercado Pago (el usuario solo
  puede cancelar; la activacion queda para el service role / webhook futuro,
  campo `payment_external_ref` reservado para el `preapproval_id`).
- Tabla `notifications` + RLS: notificaciones in-app por usuario (tipos
  `info`, `warning`, `urgent`, `billing`), visibles en `/mi-cuenta` con
  marcar-como-leida.

### Fase 6 (panel admin, contactos y documentos legales)

Ejecutar **una vez** el script `supabase/phase6.sql` en SQL Editor (despues de
las fases anteriores). Agrega:

- Funcion `public.is_admin()` (`security definer`) + politicas RLS de moderacion
  para el rol `admin` sobre `caregiver_recommendations`, `caregiver_profiles`,
  `services`, `marketplace_items`, `subscriptions`, `notifications` y `audit_logs`
  (alimentan `/admin`).
- Politica para que el cuidador actualice su propio `caregiver_profile`.
- Tabla `contacts` + RLS por hogar (modulo `/contactos`: red de apoyo).
- Tabla `legal_documents` + RLS por hogar (modulo `/legales`).

### Aplicar migraciones en produccion (forma recomendada: un solo paste)

Para evitar errores de orden, hay un script consolidado e idempotente que une
`schema.sql` + `phase2..6` en orden:

```bash
node scripts/build-migration.mjs   # regenera supabase/migrate-all.sql
```

En el proyecto Supabase real abrir **SQL Editor**, pegar **todo** el contenido de
`supabase/migrate-all.sql` y ejecutar una sola vez. Es seguro re-ejecutarlo
(`create ... if not exists`, `drop policy if exists`, `create or replace`).

Alternativa archivo por archivo (mismo resultado), en orden:
`schema.sql -> phase2.sql -> phase3.sql -> phase4.sql -> phase5.sql -> phase6.sql`.

Con Supabase CLI (tras `supabase login` y `supabase link --project-ref <ref>`):

```bash
npx supabase db execute -f supabase/migrate-all.sql
```

## 4. Configurar Auth en Supabase

En el dashboard, **Authentication > Providers**:

- **Email**: habilitado. Para acelerar pruebas locales, podes desactivar
  *Confirm email* (Authentication > Providers > Email > Confirm email = off).
  En produccion conviene mantenerlo activo.

En **Authentication > URL Configuration**:

- **Site URL** (desarrollo): `http://localhost:3000`
- **Site URL** (produccion Vercel): `https://care-two-eta.vercel.app`
- **Redirect URLs**: agregar como minimo:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/callback?type=recovery`
  - `http://localhost:3000/**`
  - `https://care-two-eta.vercel.app/auth/callback`
  - `https://care-two-eta.vercel.app/auth/callback?type=recovery`
  - `https://care-two-eta.vercel.app/**`
  - Cada preview de Vercel (`https://*-solzito148s-projects.vercel.app/**`) si vas a probar auth en PRs.

CARE expone un **route handler** en `src/app/auth/callback/route.ts` que hace
`exchangeCodeForSession` y redirige:

- `?type=signup` o sin tipo  ->  `/dashboard` (o `?next=/ruta`).
- `?type=recovery`           ->  `/actualizar-password` (flujo "olvide contrasena").

## 4.1 Flujo "olvide mi contrasena"

1. El usuario entra a `/recuperar-password`.
2. Ingresa su email; CARE llama a `supabase.auth.resetPasswordForEmail` con
   `redirectTo = <origin>/auth/callback?type=recovery`.
3. Supabase envia un email; al hacer clic vuelve a `/auth/callback?...&type=recovery`.
4. El route handler intercambia el codigo por sesion y redirige a
   `/actualizar-password`, donde el usuario define la nueva contrasena
   (`supabase.auth.updateUser({ password })`).

## 5. Que sucede en signup

`signUp` envia metadata en `options.data`:

```ts
{
  account_type: AccountType,
  first_name: string,
  last_name: string,
  phone: string,
}
```

El trigger `on_auth_user_created` lee esa metadata desde
`auth.users.raw_user_meta_data` y:

1. Crea o actualiza la fila en `public.profiles` con `full_name`, `phone`,
   `account_type`.
2. **No asigna roles RBAC en el signup** (evita escalacion si alguien manipula
   metadata). Los roles se asignan al completar onboarding via la funcion
   `public.sync_user_role_from_account_type()` (solo el propio usuario).

`account_type` queda fijado en el perfil: un trigger impide cambiarlo despues
del alta.

Mapping de roles (aplicado en onboarding):

| account_type                              | role        |
| ----------------------------------------- | ----------- |
| tutor-familiar-encargado                  | tutor       |
| cuidador                                  | caregiver   |
| profesional-salud                         | professional|
| profesional-legal-administrativo          | legal_admin |
| proveedor-marketplace                     | provider    |
| proveedor-servicios                       | provider    |

## 6. Probar el flujo end-to-end

```bash
npm install
npm run dev
```

1. Abrir <http://localhost:3000/registro>.
2. Crear una cuenta con email real.
3. Si email confirmation esta activo, confirmar desde la casilla.
4. Iniciar sesion en <http://localhost:3000/login>.
5. Verificar que `(app)/dashboard` esta accesible y `/login` redirige al
   dashboard si ya hay sesion.
6. Probar logout desde el header privado.

## 7. Que protege el proxy (middleware)

`src/proxy.ts` corre `updateSession` en cada request:

- Refresca cookies de sesion.
- Si la ruta esta dentro de prefijos protegidos
  (`/dashboard`, `/admin`, `/agenda`, `/cuidadores`, ...) y no hay usuario,
  redirige a `/login?redirectTo=<ruta>`.

Las rutas publicas siguen siendo `/`, `/login`, `/registro`, `/onboarding/*`.

## 8. Rutas protegidas adicionales

Para sumar una nueva ruta protegida:

1. Crear el directorio dentro de `src/app/(app)/<ruta>/`.
2. Agregar el prefijo en `PROTECTED_PREFIXES` de
   `src/lib/supabase/middleware.ts`.
## 9. Verificar RLS en produccion (SEC-18)

La seguridad de CARE depende de que las policies RLS esten aplicadas en la base
cloud. Sin RLS, la `anon`/`auth` key expone datos de todos los hogares.

Despues de pegar `supabase/migrate-all.sql`, ejecutar tambien
`supabase/verify-rls.sql` en el SQL Editor y confirmar:

1. El bloque 1 (tablas **sin** RLS) devuelve **0 filas**.
2. El bloque 2 (RLS **sin** policies) devuelve **0 filas**.
3. En el inventario (bloque 3), toda tabla con datos de usuario tiene
   `rls_habilitado = true` y `policies >= 1`.
4. El bucket `estudios` aparece con `es_publico = false`.

Si alguna verificacion falla, volver a aplicar la fase correspondiente antes de
exponer la app a usuarios reales.

### Variables de entorno minimas en Vercel (produccion)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server; nunca `NEXT_PUBLIC_*`)
- `NEXT_PUBLIC_APP_URL` (dominio de produccion, para back_urls de pago)
- `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET`
  (sin el secret en produccion el webhook responde 503 — fail-closed, SEC-10)

## 10. Troubleshooting

- **`Faltan NEXT_PUBLIC_SUPABASE_URL...`**: confirmar que `.env.local` existe y
  reiniciar `npm run dev`.
- **Logout no redirige**: limpiar cookies del navegador, el middleware refresca
  cuando hay sesion vencida.
- **Trigger no inserta profile**: revisar logs en Supabase > Database > Logs.
  Asegurarse de haber ejecutado el bloque del trigger luego del seed de roles.
