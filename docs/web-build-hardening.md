# Hardening del build de produccion (web) — CARE

CARE es **Next.js 16 con bundler SWC/Turbopack**. No usa `webpack.config.js`,
`vite.config.js` ni un bundler manual: el empaquetado lo gestiona Next.

## Que ya hace el build de produccion (`next build`)

- **Minificacion** del JS/CSS (SWC) y **tree-shaking** de codigo no usado.
- **Eliminacion de comentarios** y reduccion de nombres locales.
- **Code splitting** por ruta (menos superficie expuesta por pagina).
- Sin source maps del navegador (ver abajo), asi los nombres no se "des-minifican"
  facilmente.

## Lo que configuramos explicitamente (`next.config.ts`)

```ts
compiler: {
  // Quita console.log/info/debug del bundle del navegador en produccion.
  // Mantiene console.error y console.warn para diagnostico.
  removeConsole: isDev ? false : { exclude: ["error", "warn"] },
},
// No exponer source maps del browser en produccion.
productionBrowserSourceMaps: false,
```

Tambien se aplican headers de seguridad (CSP, HSTS, X-Frame-Options, etc.) en el
mismo `next.config.ts`.

## Sobre la "ofuscacion" del frontend web (postura)

Un agregado de ofuscacion pesada (p. ej. `javascript-obfuscator` o `webpack-obfuscator`)
**no se recomienda** para una app React/Next por:

1. **Rompe o degrada** la hidratacion, el splitting y el runtime de React.
2. **Costo de performance** alto (bundles mas grandes y lentos) y peores Core
   Web Vitals.
3. **Beneficio de seguridad marginal**: cualquier logica de cliente es, por
   definicion, inspeccionable. La ofuscacion solo agrega friccion, no protege
   secretos.
4. Next/SWC no expone un hook soportado para inyectar un ofuscador sin
   eyectar/forzar webpack, lo que rompe Turbopack.

**Conclusion:** la minificacion + el stripping de console + sin source maps es el
estandar de industria para frontends modernos. Lo que protege de verdad es:

- **Nunca** poner secretos en el cliente (solo `NEXT_PUBLIC_*` no sensibles).
- **Logica sensible en el servidor**: Server Actions, RLS de Supabase,
  validacion con Zod, webhook de pagos fail-closed.
- Headers de seguridad (CSP/HSTS) ya configurados.

Si en el futuro se requiere ofuscacion real de logica propietaria, debe vivir en
una **Server Action / API route** (servidor), no en el bundle del navegador.

## Verificacion

```bash
npm run build      # genera el build de produccion minificado
```

Para confirmar que no quedan `console.log`: inspeccionar el bundle servido en
`/_next/static/chunks/*.js` en produccion y buscar `console.log` (no deberia
aparecer; `console.error`/`console.warn` si pueden quedar).
