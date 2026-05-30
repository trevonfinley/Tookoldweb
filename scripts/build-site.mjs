import { readFileSync } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile, copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const rootFileExtensions = new Set([".html", ".css", ".js", ".txt", ".ico", ".webmanifest"]);
const excludedRootFiles = new Set(["speed-insights.js"]);
const assetDirectories = ["assets"];
const speedInsightsPublicPages = new Set([
  "index.html",
  "about.html",
  "services.html",
  "booking.html",
  "mixes.html",
  "gallery.html",
  "events.html",
  "contact.html",
  "faq.html",
]);
const speedInsightsScriptSrc = "/_vercel/speed-insights/script.js";

const env = {
  ...loadVercelConfigEnv(path.join(rootDir, "vercel.json")),
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local")),
  ...process.env,
};
const shouldInjectSpeedInsights = Boolean(env.VERCEL);

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
    .filter((entry) => entry.isFile() && rootFileExtensions.has(path.extname(entry.name)) && !excludedRootFiles.has(entry.name))
    .map((entry) => copyRootFile(entry)),
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

function loadVercelConfigEnv(filePath) {
  if (!process.env.VERCEL) return {};

  try {
    const parsed = JSON.parse(readFileSyncText(filePath));
    return parsed && typeof parsed.env === "object" && !Array.isArray(parsed.env) ? parsed.env : {};
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
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

async function copyRootFile(entry) {
  const sourcePath = path.join(rootDir, entry.name);
  const destinationPath = path.join(distDir, entry.name);

  if (path.extname(entry.name) !== ".html") {
    await copyFile(sourcePath, destinationPath);
    return;
  }

  let html = rewriteHtmlForStaticBuild(await readFile(sourcePath, "utf8"));
  if (shouldInjectSpeedInsights && speedInsightsPublicPages.has(entry.name)) {
    html = injectSpeedInsights(html, routeForPage(entry.name));
  }

  await writeFile(destinationPath, html);
  await writeCleanRoute(entry.name, html);
}

async function writeCleanRoute(fileName, html) {
  if (fileName === "index.html") return;

  const routeName = fileName.replace(/\.html$/, "");
  const routeDirectory = path.join(distDir, routeName);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, "index.html"), html);
}

function rewriteHtmlForStaticBuild(html) {
  return removeLegacySpeedInsightsScript(html)
    .replace(/\b(href|src)=(")([^"]+)(")/g, (_match, attribute, openQuote, value, closeQuote) => {
      return `${attribute}=${openQuote}${rewriteLocalUrl(value)}${closeQuote}`;
    })
    .replace(/\b(srcset|imagesrcset)=(")([^"]+)(")/g, (_match, attribute, openQuote, value, closeQuote) => {
      return `${attribute}=${openQuote}${rewriteSrcset(value)}${closeQuote}`;
    });
}

function removeLegacySpeedInsightsScript(html) {
  return html.replace(/\n?\s*<script\b[^>]*\bsrc=(["'])\/?speed-insights\.js\1[^>]*>\s*<\/script>/gi, "");
}

function rewriteSrcset(value) {
  return value
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return trimmed;

      const [url, ...descriptor] = trimmed.split(/\s+/);
      return [rewriteLocalUrl(url), ...descriptor].join(" ");
    })
    .join(", ");
}

function rewriteLocalUrl(value) {
  if (!value || isExternalLikeUrl(value)) return value;

  const [pathPart, hashPart = ""] = value.split("#");
  const hash = hashPart ? `#${hashPart}` : "";

  if (!pathPart) return value;
  if (pathPart.startsWith("/")) return value;

  const cleanHtmlMatch = pathPart.match(/^([^/?]+)\.html$/);
  if (cleanHtmlMatch) {
    const route = cleanHtmlMatch[1] === "index" ? "" : cleanHtmlMatch[1];
    return `/${route}${hash}`;
  }

  return `/${pathPart}${hash}`;
}

function isExternalLikeUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value);
}

function injectSpeedInsights(html, route) {
  if (html.includes(speedInsightsScriptSrc)) return html;
  if (!html.includes("</head>")) {
    throw new Error(`Cannot inject Vercel Speed Insights for ${route}: missing </head>.`);
  }

  return html.replace("</head>", `${renderSpeedInsightsSnippet(route)}\n</head>`);
}

function routeForPage(fileName) {
  if (fileName === "index.html") return "/";
  return `/${fileName.replace(/\.html$/, "")}`;
}

function renderSpeedInsightsSnippet(route) {
  const safeRoute = escapeHtmlAttribute(route);

  return `  <script>
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    window.si("beforeSend", function (event) {
      try {
        if (event && typeof event.url === "string") {
          var url = new URL(event.url, window.location.origin);
          if (/^\\/(?:admin|auth|client-portal)/.test(url.pathname)) return null;
          event.url = url.pathname;
        }
      } catch (error) {}
      return event;
    });
  </script>
  <script defer src="${speedInsightsScriptSrc}" data-route="${safeRoute}" data-path="${safeRoute}"></script>`;
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
