# CARE - Checklist de Deploy en AWS

Este checklist deja a CARE online en una URL publica con un camino claro de evolucion.

## 1) Base recomendada para etapa inicial

- Frontend Next.js en Vercel o AWS Amplify Hosting.
- Base de datos y auth en Supabase (Postgres + Auth + Storage).
- Dominio en Route53 (si usas AWS full) o dominio externo.
- HTTPS obligatorio.

> Si el objetivo es "todo AWS" desde el dia 1, usar ECS Fargate + ALB para Next.js y RDS Postgres.

## 2) Requisitos previos

- Cuenta AWS activa.
- Repositorio GitHub conectado (`git@github.com:solzito148/care.git`).
- Proyecto Supabase creado.
- Variables de entorno definidas (usar `.env.example`).

## 3) Variables de entorno minimas

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo backend/server)

## 4) Seguridad minima antes de produccion

- RLS activado en tablas sensibles.
- Rotacion de claves y secretos fuera del repo.
- CORS restringido por dominio.
- Politica de backups habilitada.
- Logging y alertas basicas activas.

## 5) Pipeline CI/CD

- Workflow de CI en `.github/workflows/ci.yml`.
- Bloquear merge si falla `lint` o `build`.
- Deploy automatico en `main`.
- Ambiente `staging` recomendado en `develop`.

## 6) Ruta de despliegue sugerida (progresiva)

### Etapa A (velocidad)

1. Deploy frontend con previews por PR.
2. Configurar dominio y SSL.
3. Validar login/registro y rutas principales.

### Etapa B (estabilidad)

1. Mover notificaciones/cron a workers.
2. Agregar cache Redis.
3. Separar backend en NestJS para pagos, notificaciones, matching.

### Etapa C (escala)

1. Archivos clinicos en S3 con lifecycle.
2. Colas con SQS/SNS.
3. Observabilidad completa (trazas, alertas de negocio).

## 7) Validaciones de salida a produccion

- Landing, login y registro funcionando.
- Dashboard admin y vista simple navegables en mobile/desktop.
- Modulos base responden sin errores visuales.
- Accesibilidad minima WCAG AA en flujos principales.
- Monitoreo de errores activo.

## 8) Runbook rapido de incidentes

- Error de auth: validar expiracion de tokens y claves.
- Error DB: revisar RLS y politicas.
- Error deploy: revisar logs de build y variables.
- Error de performance: verificar cache, imagenes y queries.
