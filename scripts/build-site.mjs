import { readFileSync } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const rootFileExtensions = new Set([".html", ".css", ".js", ".txt", ".ico", ".webmanifest"]);
const assetDirectories = ["assets"];

const env = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local")),
  ...process.env,
};

const deploymentEnv = env.PROJECT_NEO_ENV || env.VERCEL_ENV || env.CONTEXT || "development";
const publicConfig = {
  apiBaseUrl: cleanUrl(env.PROJECT_NEO_API_BASE_URL),
  supabaseUrl: cleanUrl(env.SUPABASE_URL),
  supabasePublishableKey: cleanString(env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY),
  appUrl: cleanUrl(env.PROJECT_NEO_APP_URL),
  adminEmail: cleanString(env.PROJECT_NEO_ADMIN_EMAIL),
  publicContactEmail: cleanString(env.PROJECT_NEO_PUBLIC_CONTACT_EMAIL) || "djtookold@gmail.com",
  environment: cleanString(deploymentEnv),
};

const requiresConfig = isProductionLike(deploymentEnv) || env.PROJECT_NEO_REQUIRE_PUBLIC_CONFIG === "true";
if (requiresConfig) {
  const missing = Object.entries({
    PROJECT_NEO_API_BASE_URL: publicConfig.apiBaseUrl,
    SUPABASE_URL: publicConfig.supabaseUrl,
    SUPABASE_PUBLISHABLE_KEY: publicConfig.supabasePublishableKey,
    PROJECT_NEO_APP_URL: publicConfig.appUrl,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing required production public config: ${missing.join(", ")}`);
  }
}

assertNoServerSecretInPublicConfig(publicConfig, env);

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const rootEntries = await readdir(rootDir, { withFileTypes: true });
await Promise.all(
  rootEntries
    .filter((entry) => entry.isFile() && rootFileExtensions.has(path.extname(entry.name)))
    .map((entry) => copyFile(path.join(rootDir, entry.name), path.join(distDir, entry.name))),
);

for (const directory of assetDirectories) {
  const source = path.join(rootDir, directory);
  if (await exists(source)) {
    await copyDirectory(source, path.join(distDir, directory));
  }
}

await writeFile(path.join(distDir, "project-neo-config.js"), renderBrowserConfig(publicConfig));

console.log(`Built Project Neo static site to ${path.relative(rootDir, distDir)}`);
if (!publicConfig.apiBaseUrl || !publicConfig.supabaseUrl || !publicConfig.supabasePublishableKey) {
  console.warn("Browser API config is incomplete. Public forms and auth screens will run in fallback mode.");
}

function loadEnvFile(filePath) {
  const values = {};

  try {
    const raw = readFileSyncText(filePath);
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  return values;
}

function readFileSyncText(filePath) {
  return readFileSync(filePath, "utf8");
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanUrl(value) {
  return cleanString(value).replace(/\/+$/, "");
}

function isProductionLike(value) {
  return ["production", "prod"].includes(String(value).toLowerCase());
}

function assertNoServerSecretInPublicConfig(config, envValues) {
  const publicValues = Object.values(config).filter(Boolean);
  const forbiddenValues = [
    envValues.SUPABASE_SERVICE_ROLE_KEY,
    envValues.SUPABASE_SECRET_KEY,
    envValues.PAYMENT_SECRET_KEY,
    envValues.PAYMENT_WEBHOOK_SECRET,
    envValues.CALENDAR_API_KEY,
  ].filter((value) => typeof value === "string" && value.trim().length > 8);

  for (const publicValue of publicValues) {
    for (const secretValue of forbiddenValues) {
      if (publicValue === secretValue) {
        throw new Error("A server-only secret was assigned to browser config. Fix the environment variables before deploying.");
      }
    }
  }
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function copyDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath);
        return;
      }

      if (entry.isFile()) {
        await copyFile(sourcePath, destinationPath);
      }
    }),
  );
}

function renderBrowserConfig(config) {
  return `window.ProjectNeoConfig = Object.freeze(${JSON.stringify(config, null, 2)});\n`;
}
