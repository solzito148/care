# CARE

Plataforma web/mobile responsive para gestion del cuidado de personas mayores.

## Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Estructura base incluida

- Landing publica
- Login y registro
- Dashboard administrador
- Vista simple persona cuidada
- Modulos: agenda, medicacion, turnos, estudios, cuidadores, servicios, marketplace, legales, mi cuenta, planes
- Sistema de layout responsive (sidebar + bottom navigation)
- Documentacion de diseno/funcionalidad en `docs/care-design-functional-guide.md`
- Esquema inicial Supabase/Postgres en `supabase/schema.sql`
- CI de GitHub Actions en `.github/workflows/ci.yml`

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+ o pnpm/yarn

## Arranque local

```bash
npm install
npm run dev
```

App local: `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Push automatico a GitHub (cada 10 minutos)

El repo incluye un script que hace **commit de los cambios locales** y **push** a `origin`. Pensado para ejecutarse cada 10 minutos en tu maquina (no en GitHub Actions).

**macOS (LaunchAgent, recomendado):**

```bash
bash scripts/install-auto-push-launchagent.sh
```

Logs del sistema: `~/Library/Logs/care-auto-push-github.out.log` y `.err.log`. Log del script: `.auto-push.log` (ignorado por git).

**Cron (cualquier OS):** agregar en `crontab -e` (ajusta la ruta):

```cron
*/10 * * * * /bin/bash /Users/msanes/Documents/Cursor/care/scripts/auto-push-to-github.sh
```

Requisitos: `git` configurado con `user.name` / `user.email`, SSH o HTTPS contra GitHub funcionando, y remoto `origin` apuntando al repo.

## Estado actual del repo

- Repositorio Git inicializado y remoto configurado a `git@github.com:solzito148/care.git`.
- Si `npm install` falla por red, reintentar cuando vuelva la conectividad a `registry.npmjs.org`.

## Proximos pasos sugeridos

1. Instalar dependencias.
2. Ejecutar `npm run lint` y `npm run build`.
3. Crear primer commit base del proyecto.
4. Publicar rama principal en GitHub.
5. Configurar pipeline CI/CD y deploy inicial.

## Documentacion adicional

- Diseno y funcional: `docs/care-design-functional-guide.md`
- Backlog 8 semanas: `docs/sprints-8-semanas.md`
- Checklist deploy AWS: `docs/aws-deploy-checklist.md`
- Trabajo sin red / sin npm: `docs/trabajo-sin-red.md`
- Setup de Supabase Auth (Fase 1): `docs/supabase-setup.md`

## Autenticacion

Login y registro estan integrados a Supabase Auth (`@supabase/ssr`).

- `src/lib/auth.ts` - API alta nivel (`signInWithPassword`, `signUpWithPassword`).
- `src/lib/supabase/{client,server,middleware}.ts` - clientes browser/SSR.
- `src/middleware.ts` - refresca cookies y protege `(app)/*` redirigiendo a `/login`.
- `src/app/actions/auth.ts` - server action `signOutAction`.
- `src/app/(app)/layout.tsx` - guard SSR con `redirect("/login")`.
- Trigger `on_auth_user_created` en `supabase/schema.sql` crea profile y rol.

Antes de probar, completar `.env.local` siguiendo `docs/supabase-setup.md`.
