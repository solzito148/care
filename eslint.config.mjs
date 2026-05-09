// ESLint flat config para Next.js 16 + ESLint 9.
// `next lint` fue removido en Next 16; corremos ESLint directo via npm script.
//
// eslint-config-next 16 exporta los presets como flat configs nativos en
// subpaths "./core-web-vitals" y "./typescript".

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    // doh-resolver es CommonJS por necesidad (NODE_OPTIONS=--require lo carga
    // antes de que ESM este disponible); no aplicar reglas de modulos ESM.
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "scripts/doh-resolver.js",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
