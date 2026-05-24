(() => {
  const config = window.ProjectNeoConfig || {};
  const ADMIN_ROLES = new Set(["owner", "admin"]);
  const STAFF_SCOPED_ROLES = new Set(["dj", "staff"]);
  let supabaseClient = null;

  function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function cleanUrl(value) {
    return cleanString(value).replace(/\/+$/, "");
  }

  const authConfig = Object.freeze({
    apiBaseUrl: cleanUrl(config.apiBaseUrl),
    supabaseUrl: cleanUrl(config.supabaseUrl),
    supabasePublishableKey: cleanString(config.supabasePublishableKey || config.supabaseAnonKey),
    appUrl: cleanUrl(config.appUrl),
    environment: cleanString(config.environment || "development"),
  });

  function getOrigin() {
    if (authConfig.appUrl) return authConfig.appUrl;
    if (window.location.origin && window.location.origin !== "null") return window.location.origin;
    return "";
  }

  function getAbsoluteUrl(path, params = {}) {
    const origin = getOrigin();
    const url = origin ? new URL(path, `${origin}/`) : new URL(path, window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  function getReturnPath(fallback = "admin-dashboard.html") {
    const rawPath = new URLSearchParams(window.location.search).get("returnTo") || fallback;

    try {
      const url = new URL(rawPath, window.location.href);
      if (url.origin !== window.location.origin && window.location.origin !== "null") return fallback;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallback;
    }
  }

  function getLoginUrl(returnTo = "admin-dashboard.html") {
    return `admin-login.html?returnTo=${encodeURIComponent(returnTo)}`;
  }

  function getCallbackUrl(returnTo = "admin-dashboard.html") {
    return getAbsoluteUrl("auth-callback.html", { returnTo });
  }

  function validateConfig() {
    const missing = [];
    if (!authConfig.supabaseUrl) missing.push("Supabase URL");
    if (!authConfig.supabasePublishableKey) missing.push("Supabase publishable key");
    if (!window.supabase?.createClient) missing.push("Supabase browser SDK");

    return {
      ok: missing.length === 0,
      missing,
      message: missing.length ? `Missing ${missing.join(", ")}.` : "",
    };
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;

    const status = validateConfig();
    if (!status.ok) {
      throw new Error(status.message || "Supabase Auth is not configured.");
    }

    supabaseClient = window.supabase.createClient(authConfig.supabaseUrl, authConfig.supabasePublishableKey, {
      auth: {
        experimental: { passkey: true },
      },
    });
    return supabaseClient;
  }

  async function getSession() {
    const { data, error } = await getClient().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signInWithPassword(email, password) {
    return getClient().auth.signInWithPassword({ email, password });
  }

  async function signUpWithPassword({ email, password, fullName, returnTo = "admin-login.html" }) {
    return getClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getCallbackUrl(returnTo),
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
  }

  async function signInWithOAuth(provider, returnTo = "admin-dashboard.html") {
    return getClient().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getCallbackUrl(returnTo),
      },
    });
  }

  async function sendPasswordReset(email) {
    return getClient().auth.resetPasswordForEmail(email, {
      redirectTo: getAbsoluteUrl("auth-reset-password.html"),
    });
  }

  async function updatePassword(password) {
    return getClient().auth.updateUser({ password });
  }

  async function exchangeCodeForSession() {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return { data: null, error: null };
    return getClient().auth.exchangeCodeForSession(code);
  }

  async function signOut() {
    return getClient().auth.signOut();
  }

  async function apiFetch(path, session) {
    if (!authConfig.apiBaseUrl) {
      throw new Error("Project Neo API URL is not configured.");
    }

    const response = await fetch(`${authConfig.apiBaseUrl}${path}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.error?.message || "Project Neo request failed.");
      error.status = response.status;
      throw error;
    }

    return payload.data;
  }

  function hasAdminRole(role) {
    return ADMIN_ROLES.has(String(role || ""));
  }

  function hasFutureScopedRole(role) {
    return STAFF_SCOPED_ROLES.has(String(role || ""));
  }

  window.ProjectNeoAuth = Object.freeze({
    config: authConfig,
    getAbsoluteUrl,
    getReturnPath,
    getLoginUrl,
    getCallbackUrl,
    validateConfig,
    getClient,
    getSession,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    sendPasswordReset,
    updatePassword,
    exchangeCodeForSession,
    signOut,
    apiFetch,
    hasAdminRole,
    hasFutureScopedRole,
    adminRoles: Object.freeze([...ADMIN_ROLES]),
    scopedRoles: Object.freeze([...STAFF_SCOPED_ROLES]),
  });
})();
