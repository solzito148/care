#!/usr/bin/env node
/**
 * Ejecuta un archivo .sql en Supabase cloud via Management API.
 * Requiere SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
 *
 * Uso:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-supabase-sql.mjs supabase/migrate-all.sql
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-supabase-sql.mjs supabase/patch-role-onboarding.sql
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "yewezdnajbcahtfybyzd";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const sqlPath = process.argv[2];

if (!token) {
  console.error("Falta SUPABASE_ACCESS_TOKEN. Crear en https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}
if (!sqlPath) {
  console.error("Uso: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-supabase-sql.mjs <archivo.sql>");
  process.exit(1);
}

const query = readFileSync(resolve(sqlPath), "utf8");
const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!res.ok) {
  console.error(`Error ${res.status}:`, typeof body === "string" ? body : JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`OK: SQL aplicado en proyecto ${projectRef} (${sqlPath})`);
if (body && typeof body === "object") {
  console.log(JSON.stringify(body, null, 2));
}
