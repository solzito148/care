import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Concatena schema.sql + phaseN.sql en un unico script idempotente para pegar
// una sola vez en el SQL Editor de Supabase cloud. Fuente de verdad: los .sql
// individuales; este archivo solo los une en orden. Regenerar con:
//   node scripts/build-migration.mjs

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const supabaseDir = join(root, "supabase");

const ORDER = [
  "schema.sql",
  "phase2.sql",
  "phase3.sql",
  "phase4.sql",
  "phase5.sql",
  "phase6.sql",
];

const banner = (file) =>
  [
    "",
    "-- ============================================================================",
    `-- ${file}`,
    "-- ============================================================================",
    "",
  ].join("\n");

const header = [
  "-- CARE - Migracion consolidada (cloud)",
  "-- GENERADO por scripts/build-migration.mjs - NO editar a mano.",
  "-- Pegar TODO este archivo en Supabase SQL Editor y ejecutar una sola vez.",
  "-- Idempotente: seguro re-ejecutar (create if not exists / drop policy if exists).",
  "-- Orden: " + ORDER.join(" -> "),
  "",
].join("\n");

const body = ORDER.map(
  (file) => banner(file) + readFileSync(join(supabaseDir, file), "utf8").trimEnd() + "\n",
).join("\n");

const out = join(supabaseDir, "migrate-all.sql");
writeFileSync(out, header + body, "utf8");
console.log(`Wrote ${out} (${ORDER.length} files concatenated).`);
