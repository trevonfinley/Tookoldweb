import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const publicPages = [
  "index.html",
  "about.html",
  "services.html",
  "booking.html",
  "mixes.html",
  "gallery.html",
  "events.html",
  "contact.html",
  "faq.html",
];

const requiredFiles = [
  ...publicPages,
  "admin-login.html",
  "admin-dashboard.html",
  "auth-callback.html",
  "auth-client.js",
  "auth-forgot-password.html",
  "auth-pages.js",
  "auth-reset-password.html",
  "auth-signup.html",
  "client-portal.html",
  "passkeys.js",
  "project-neo-config.js",
  "assets/images/dj-too-kold-logo.jpeg",
  "supabase/functions/project-neo-api/index.ts",
  "supabase/migrations/20260523000000_project_neo_core.sql",
  "docs/PROJECT_NEO_DEPLOYMENT.md",
  ".env.example",
  "supabase/functions/.env.example",
];

const deployableExtensions = new Set([".html", ".css", ".js", ".txt", ".webmanifest"]);
const forbiddenFrontendPatterns = [
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /SUPABASE_SECRET_KEY/i,
  /PAYMENT_SECRET_KEY/i,
  /PAYMENT_WEBHOOK_SECRET/i,
  /CALENDAR_API_KEY/i,
  /\bservice_role\b/i,
  /\bsk_(live|test)_[A-Za-z0-9]/,
];

const failures = [];

for (const file of requiredFiles) {
  if (!(await exists(path.join(rootDir, file)))) {
    failures.push(`Missing required file: ${file}`);
  }
}

for (const page of publicPages) {
  const pagePath = path.join(rootDir, page);
  if (!(await exists(pagePath))) continue;

  const content = await readFile(pagePath, "utf8");
  const logoUseCount = (content.match(/assets\/images\/dj-too-kold-logo\.jpeg/g) || []).length;

  if (!content.includes("site-header")) {
    failures.push(`Public page is missing shared navbar: ${page}`);
  }

  if (!content.includes("site-footer")) {
    failures.push(`Public page is missing shared footer: ${page}`);
  }

  if (logoUseCount < 2) {
    failures.push(`Public page should render the official logo in header and footer: ${page}`);
  }
}

const frontendFiles = await collectDeployableFiles(rootDir);
for (const file of frontendFiles) {
  const content = await readFile(file, "utf8");
  const relative = path.relative(rootDir, file);

  for (const pattern of forbiddenFrontendPatterns) {
    if (pattern.test(content)) {
      failures.push(`Potential server-only secret reference in frontend file: ${relative}`);
      break;
    }
  }
}

const gitignore = await readOptional(path.join(rootDir, ".gitignore"));
for (const expected of [".env", "dist/", ".vercel/", ".netlify/"]) {
  if (!gitignore.includes(expected)) {
    failures.push(`.gitignore should include ${expected}`);
  }
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_PUBLISHABLE_KEY) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.SUPABASE_PUBLISHABLE_KEY) {
    failures.push("SUPABASE_PUBLISHABLE_KEY is equal to SUPABASE_SERVICE_ROLE_KEY.");
  }
}

if (failures.length) {
  console.error("Project Neo deployment validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Project Neo deployment validation passed.");

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function readOptional(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

async function collectDeployableFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || ["node_modules", "supabase", "docs", "scripts", "dist"].includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectDeployableFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && deployableExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}
