#!/usr/bin/env node
/**
 * Verifica el build de produccion:
 * 1. Nuestro codigo (src/) no usa console.log/debug/info.
 * 2. No hay source maps del browser en .next/static.
 * 3. Reporta console.log en chunks de terceros (p. ej. Supabase) como aviso.
 *
 * Ejecutar despues de `npm run build` o via `npm run build:verify`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STATIC_DIR = join(ROOT, ".next", "static");
const SRC_DIR = join(ROOT, "src");

const FORBIDDEN_IN_SRC = /\bconsole\.(log|debug|info)\s*\(/;
const FORBIDDEN_IN_BUNDLE = /\bconsole\.(log|debug|info)\s*\(/;

async function walkFiles(dir, filter) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, filter)));
    } else if (filter(full)) {
      files.push(full);
    }
  }
  return files;
}

async function checkSrcConsole() {
  const files = await walkFiles(SRC_DIR, (f) => /\.(ts|tsx|js|jsx)$/.test(f));
  const violations = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    if (FORBIDDEN_IN_SRC.test(content)) {
      violations.push(relative(ROOT, file));
    }
  }
  return violations;
}

async function checkBundle() {
  try {
    await stat(STATIC_DIR);
  } catch {
    console.error("No existe .next/static. Ejecuta primero: npm run build");
    process.exit(1);
  }

  const allFiles = await walkFiles(STATIC_DIR, (f) => f.endsWith(".js") || f.endsWith(".map"));
  const mapFiles = allFiles.filter((f) => f.endsWith(".map"));
  const jsFiles = allFiles.filter((f) => f.endsWith(".js") && !f.endsWith(".map"));
  const consoleInChunks = [];

  for (const file of jsFiles) {
    const content = await readFile(file, "utf8");
    if (FORBIDDEN_IN_BUNDLE.test(content)) {
      consoleInChunks.push(relative(ROOT, file));
    }
  }

  return { mapFiles: mapFiles.map((f) => relative(ROOT, f)), consoleInChunks };
}

async function main() {
  let failed = false;

  const srcViolations = await checkSrcConsole();
  if (srcViolations.length > 0) {
    failed = true;
    console.error("src/ contiene console.log/debug/info (debe eliminarse):");
    for (const f of srcViolations) console.error(`  - ${f}`);
  } else {
    console.log("OK: src/ sin console.log/debug/info.");
  }

  const { mapFiles, consoleInChunks } = await checkBundle();

  if (mapFiles.length > 0) {
    failed = true;
    console.error("Source maps del browser encontrados (deben estar deshabilitados):");
    for (const f of mapFiles) console.error(`  - ${f}`);
  } else {
    console.log("OK: sin source maps del browser en .next/static.");
  }

  if (consoleInChunks.length > 0) {
    console.warn(
      `Aviso: ${consoleInChunks.length} chunk(s) de terceros aun contienen console.log ` +
        "(p. ej. @supabase/supabase-js). El codigo de CARE ya no los incluye; " +
        "removeConsole solo aplica a nuestro codigo."
    );
    for (const f of consoleInChunks.slice(0, 5)) console.warn(`  - ${f}`);
    if (consoleInChunks.length > 5) {
      console.warn(`  ... y ${consoleInChunks.length - 5} mas`);
    }
  } else {
    console.log("OK: ningun chunk con console.log/debug/info.");
  }

  if (failed) process.exit(1);
  console.log("Verificacion de bundle de produccion completada.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
