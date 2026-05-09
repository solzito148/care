# CARE - Trabajo sin conectividad a npm

Cuando no hay acceso a `registry.npmjs.org`, igual podes avanzar con estas tareas.

## Que siempre podes hacer offline

- Editar rutas y componentes en `src/`.
- Ajustar Tailwind en `tailwind.config.ts` y estilos globales.
- Documentacion en `docs/`.
- SQL y politicas en `supabase/schema.sql` (revisar en SQL editor de Supabase cuando haya red).
- Configuracion de CI en `.github/workflows/`.
- Variables de ejemplo en `.env.example`.

## Que requiere red (una sola vez o cuando vuelva)

- `npm install` / `npm ci` y generar `package-lock.json`.
- `npm run dev`, `npm run build`, `npm run lint`.
- Publicar a GitHub y ejecutar Actions.

## Flujo recomendado al recuperar red

1. `npm install` en la raiz del repo.
2. Commitear `package-lock.json`.
3. En CI, el job usara `npm ci` automaticamente si existe el lockfile.
4. `npm run lint` y `npm run build` localmente antes de push.

## Alternativa con cache local

Si en otra maquina ya tenes `node_modules` y un `package-lock.json` generado, podes copiar el lockfile al repo (sin commitear `node_modules`) para alinear versiones entre entornos.
