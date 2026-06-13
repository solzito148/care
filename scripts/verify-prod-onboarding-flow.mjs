#!/usr/bin/env node
/**
 * Verifica registro → onboarding → asignación de rol en Supabase cloud.
 * Uso:
 *   set -a; source .env.local; set +a
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/verify-prod-onboarding-flow.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const projectRef = "yewezdnajbcahtfybyzd";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const ACCOUNT_TYPE_TO_ROLE = {
  "tutor-familiar-encargado": "tutor",
  cuidador: "caregiver",
  "profesional-salud": "professional",
  "profesional-legal-administrativo": "legal_admin",
  "proveedor-marketplace": "provider",
  "proveedor-servicios": "provider",
};

const PASSWORD = "TestCare2026!a";

async function dbQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`DB query failed: ${JSON.stringify(body)}`);
  return body;
}

async function confirmEmail(email) {
  if (!accessToken) return;
  await dbQuery(`
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmed_at = coalesce(confirmed_at, now())
    where email = '${email.replace(/'/g, "''")}';
  `);
}

async function getUserRoles(userId, client) {
  if (client) {
    const { data, error } = await client
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", userId);
    if (error) throw new Error(`roles query: ${error.message}`);
    return (data ?? []).map((row) => row.roles?.code).filter(Boolean).sort();
  }
  const rows = await dbQuery(`
    select r.code
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '${userId}'::uuid
    order by r.code;
  `);
  return rows.map((r) => r.code);
}

async function getProfile(userId, client) {
  if (client) {
    const { data, error } = await client
      .from("profiles")
      .select("account_type, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(`profile query: ${error.message}`);
    return data;
  }
  const rows = await dbQuery(`
    select account_type, full_name
    from public.profiles
    where id = '${userId}'::uuid;
  `);
  return rows[0] ?? null;
}

async function deleteTestUser(email) {
  if (!accessToken) return;
  await dbQuery(`
    delete from auth.users where email = '${email.replace(/'/g, "''")}';
  `);
}

async function checkRegistroPage(baseUrl) {
  const res = await fetch(`${baseUrl}/registro`, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  const html = res.status < 400 ? await res.text() : "";
  return {
    status: res.status,
    location: res.headers.get("location"),
    hasHeading: html.includes("Crear cuenta en CARE"),
    hasForm: html.includes("Registrarme"),
  };
}

async function testAccountType(accountType) {
  const stamp = Date.now();
  const email = `care.e2e.${accountType}.${stamp}@mailinator.com`;
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = { accountType, email, steps: {} };

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: PASSWORD,
      options: {
        emailRedirectTo: "https://care-two-eta.vercel.app/auth/callback",
        data: {
          account_type: accountType,
          first_name: "E2E",
          last_name: "Test",
          phone: "+5491112345678",
        },
      },
    });

    if (signUpError) {
      result.error = `signup: ${signUpError.message}`;
      return result;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      result.error = "signup: sin user id";
      return result;
    }

    result.userId = userId;
    result.steps.signupSession = Boolean(signUpData.session);
    result.steps.requiresEmailConfirmation = !signUpData.session;

    let authedClient = supabase;
    if (!signUpData.session) {
      await confirmEmail(email);
      authedClient = createClient(supabaseUrl, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: signInError } = await authedClient.auth.signInWithPassword({
        email,
        password: PASSWORD,
      });
      if (signInError) {
        result.error = `signin: ${signInError.message}`;
        return result;
      }
    }

    const profileAfterSignup = await getProfile(userId, authedClient);
    result.steps.profileAccountType = profileAfterSignup?.account_type ?? null;

    const rolesAfterSignup = await getUserRoles(userId, authedClient);
    result.steps.rolesAfterSignup = rolesAfterSignup;

    const { error: profileUpdateError } = await authedClient
      .from("profiles")
      .update({ full_name: "E2E Test User", phone: "+5491112345678" })
      .eq("id", userId);
    if (profileUpdateError) {
      result.error = `profile update: ${profileUpdateError.message}`;
      return result;
    }

    const { error: rpcError } = await authedClient.rpc("sync_user_role_from_account_type", {
      p_user_id: userId,
    });
    if (rpcError) {
      result.error = `role rpc: ${rpcError.message}`;
      return result;
    }

    const rolesAfterOnboarding = await getUserRoles(userId, authedClient);
    const expectedRole = ACCOUNT_TYPE_TO_ROLE[accountType];
    result.steps.rolesAfterOnboarding = rolesAfterOnboarding;
    result.steps.expectedRole = expectedRole;
    result.steps.roleOk = rolesAfterOnboarding.includes(expectedRole);
    result.ok = result.steps.roleOk && rolesAfterSignup.length === 0;
    return result;
  } finally {
    try {
      await deleteTestUser(email);
      result.steps.cleanedUp = true;
    } catch (e) {
      result.steps.cleanedUp = false;
      result.steps.cleanupError = String(e);
    }
  }
}

const prodUrl = process.env.PLAYWRIGHT_BASE_URL ?? "https://care-two-eta.vercel.app";
const page = await checkRegistroPage(prodUrl);
console.log(`=== Página /registro (${prodUrl}) ===`);
console.log(JSON.stringify(page, null, 2));

const typesToTest = Object.keys(ACCOUNT_TYPE_TO_ROLE);

console.log("\n=== Flujo registro → onboarding (API + DB) ===");
const results = [];
for (const accountType of typesToTest) {
  const r = await testAccountType(accountType);
  results.push(r);
  console.log(JSON.stringify(r, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

const registroOk = page.status === 200 && page.hasHeading;
const allOk = registroOk && results.every((r) => r.ok);
console.log("\n=== Resumen ===");
console.log(
  JSON.stringify(
    {
      registroPageOk: registroOk,
      registroRedirect: page.location,
      tests: results.map((r) => ({
        accountType: r.accountType,
        ok: Boolean(r.ok),
        expectedRole: r.steps?.expectedRole,
        rolesAfterSignup: r.steps?.rolesAfterSignup,
        rolesAfterOnboarding: r.steps?.rolesAfterOnboarding,
        error: r.error,
      })),
      allOk,
    },
    null,
    2,
  ),
);

process.exit(allOk ? 0 : 1);
