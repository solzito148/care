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

| Opcion | Efecto en produccion |
|--------|----------------------|
| SWC minify (default) | Minifica JS/CSS, elimina comentarios, acorta nombres locales |
| `compiler.removeConsole` | Quita `console.log/info/debug` del bundle del browser |
| `compiler.reactRemoveProperties` | Quita atributos `data-test*` del HTML renderizado |
| `productionBrowserSourceMaps: false` | No publica `.map` del browser |
| `experimental.optimizePackageImports` | Tree-shaking mas agresivo en Supabase y Zod |
| `poweredByHeader: false` | Oculta `X-Powered-By: Next.js` |
| `compress: true` | Compresion gzip en el servidor |

```ts
compiler: {
  removeConsole: isDev ? false : { exclude: ["error", "warn"] },
  reactRemoveProperties: isDev ? false : { properties: ["^data-test"] },
},
productionBrowserSourceMaps: false,
experimental: {
  optimizePackageImports: ["@supabase/ssr", "@supabase/supabase-js", "zod"],
},
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
npm run build          # genera el build de produccion minificado
npm run build:verify   # build + chequeo automatico de console.log y source maps
```

El script `scripts/verify-production-bundle.mjs` revisa:

1. Que `src/` no tenga `console.log/debug/info` (falla si encuentra).
2. Que no existan `.map` del browser en `.next/static` (falla si encuentra).
3. Avisa si chunks de **terceros** (p. ej. `@supabase/supabase-js`) aun traen
   `console.log` — eso no lo controla `removeConsole`, que solo aplica al codigo
   de CARE.
