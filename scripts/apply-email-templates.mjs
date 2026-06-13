#!/usr/bin/env node
/**
 * Aplica las plantillas de email de CARE (y opcionalmente el SMTP propio)
 * a la config de Auth de Supabase via Management API.
 *
 * Requiere:
 *   SUPABASE_ACCESS_TOKEN  -> https://supabase.com/dashboard/account/tokens
 *   SUPABASE_PROJECT_REF   -> opcional (default: yewezdnajbcahtfybyzd)
 *
 * SMTP (opcional, para que el remitente diga "CARE"). Si pasás SMTP_HOST,
 * se incluyen también estos campos:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   SMTP_ADMIN_EMAIL (ej: no-reply@tudominio)
 *   SMTP_SENDER_NAME (default: CARE)
 *
 * Uso:
 *   # Dry-run (muestra el payload, NO aplica):
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-email-templates.mjs
 *
 *   # Aplicar de verdad:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-email-templates.mjs --apply
 *
 *   # Aplicar plantillas + SMTP de Resend:
 *   SUPABASE_ACCESS_TOKEN=sbp_... \
 *   SMTP_HOST=smtp.resend.com SMTP_PORT=465 SMTP_USER=resend SMTP_PASS=re_... \
 *   SMTP_ADMIN_EMAIL=no-reply@tudominio SMTP_SENDER_NAME=CARE \
 *   node scripts/apply-email-templates.mjs --apply
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, "../supabase/email-templates");

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "yewezdnajbcahtfybyzd";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const apply = process.argv.includes("--apply");

if (!token) {
  console.error(
    "Falta SUPABASE_ACCESS_TOKEN. Crear en https://supabase.com/dashboard/account/tokens",
  );
  process.exit(1);
}

const readTemplate = (name) =>
  readFileSync(resolve(templatesDir, name), "utf8");

const payload = {
  mailer_subjects_confirmation: "Confirmá tu cuenta en CARE",
  mailer_templates_confirmation_content: readTemplate("confirmation.html"),
  mailer_subjects_recovery: "Restablecé tu contraseña de CARE",
  mailer_templates_recovery_content: readTemplate("recovery.html"),
  mailer_subjects_magic_link: "Tu enlace de acceso a CARE",
  mailer_templates_magic_link_content: readTemplate("magic-link.html"),
  mailer_subjects_email_change: "Confirmá tu nuevo correo en CARE",
  mailer_templates_email_change_content: readTemplate("email-change.html"),
};

if (process.env.SMTP_HOST) {
  Object.assign(payload, {
    external_email_enabled: true,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: Number(process.env.SMTP_PORT ?? 465),
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,
    smtp_admin_email: process.env.SMTP_ADMIN_EMAIL,
    smtp_sender_name: process.env.SMTP_SENDER_NAME ?? "CARE",
  });
}

const mask = (value) =>
  typeof value === "string" && value.length > 8
    ? `${value.slice(0, 4)}…${value.slice(-2)}`
    : "•••";

const preview = Object.fromEntries(
  Object.entries(payload).map(([key, value]) => {
    if (key === "smtp_pass") return [key, mask(value)];
    if (typeof value === "string" && value.length > 80) {
      return [key, `<html ${value.length} chars>`];
    }
    return [key, value];
  }),
);

console.log(`Proyecto: ${projectRef}`);
console.log("Payload:", JSON.stringify(preview, null, 2));

if (!apply) {
  console.log("\nDry-run. Volvé a correr con --apply para aplicar los cambios.");
  process.exit(0);
}

const url = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const res = await fetch(url, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!res.ok) {
  console.error(
    `\nError ${res.status}:`,
    typeof body === "string" ? body : JSON.stringify(body, null, 2),
  );
  process.exit(1);
}

console.log(`\nOK: config de Auth actualizada en ${projectRef}.`);
