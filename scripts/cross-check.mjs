import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const buildEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "test-publishable-key",
};

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "tailwind.config.ts",
  "playwright.config.ts",
  "src/hooks/useCurrentUser.ts",
  "src/components/providers/user-provider.tsx",
  "src/lib/navigation.ts",
  "src/components/layout/sidebar-nav.tsx",
  "src/components/layout/bottom-nav.tsx",
  "src/components/auth/protected-route.tsx",
  "src/lib/permissions.ts",
  "src/proxy.ts",
  "src/app/(app)/layout.tsx",
  "e2e/auth-and-routes.spec.ts",
  "e2e/accessibility.spec.ts",
];

const requiredDeps = [
  "next",
  "react",
  "react-dom",
  "typescript",
  "@supabase/ssr",
  "zod",
];

const fileResults = Object.fromEntries(
  requiredFiles.map((file) => [file, existsSync(join(root, file))]),
);
const allFilesPresent = Object.values(fileResults).every(Boolean);

const nodeModules = join(root, "node_modules");
const depResults = Object.fromEntries(
  requiredDeps.map((dep) => [dep, existsSync(join(nodeModules, dep))]),
);
const allDepsPresent = Object.values(depResults).every(Boolean);

let lintOk = false;
let buildOk = false;
let testOk = false;

try {
  execSync("npm run lint", { cwd: root, stdio: "pipe", env: buildEnv });
  lintOk = true;
} catch (error) {
  console.error("Lint failed:", error.stderr?.toString() || error.message);
}

try {
  execSync("npm run test", { cwd: root, stdio: "pipe", env: buildEnv });
  testOk = true;
} catch (error) {
  console.error("Tests failed:", error.stderr?.toString() || error.message);
}

try {
  execSync("npm run build", { cwd: root, stdio: "pipe", env: buildEnv });
  buildOk = true;
} catch (error) {
  console.error("Build failed:", error.stderr?.toString() || error.message);
}

const success =
  allFilesPresent && allDepsPresent && lintOk && testOk && buildOk;

if (!success) {
  console.error("Cross-check failed:", {
    allFilesPresent,
    allDepsPresent,
    lintOk,
    testOk,
    buildOk,
    fileResults,
    depResults,
  });
  process.exit(1);
}

console.log("Cross-check passed.");
