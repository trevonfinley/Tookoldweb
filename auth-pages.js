(() => {
  const page = document.body.dataset.authPage;
  if (!page) return;

  const auth = window.ProjectNeoAuth;
  const statusEl = document.querySelector("[data-auth-status]");

  function setStatus(message, state = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = state ? `admin-status ${state}` : "admin-status";
  }

  function setBusy(button, isBusy) {
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
  }

  function formatProvider(provider) {
    if (provider === "apple") return "Apple ID";
    if (provider === "google") return "Google";
    return provider;
  }

  function requireConfig() {
    const status = auth?.validateConfig();
    if (!status?.ok) {
      setStatus(status?.message || "Supabase Auth is not configured.", "error");
      return false;
    }
    return true;
  }

  function getReturnTo(fallback = "admin-login.html") {
    return auth?.getReturnPath(fallback) || fallback;
  }

  function setupOAuthButtons(defaultReturnTo) {
    document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!requireConfig()) return;

        const provider = button.dataset.oauthProvider;
        try {
          setBusy(button, true);
          setStatus(`Opening ${formatProvider(provider)}...`);
          const { error } = await auth.signInWithOAuth(provider, getReturnTo(defaultReturnTo));
          if (error) throw error;
        } catch (error) {
          setStatus(error.message || `Could not start ${formatProvider(provider)} sign-in.`, "error");
          setBusy(button, false);
        }
      });
    });
  }

  async function initSignup() {
    setupOAuthButtons("admin-dashboard.html");

    const form = document.querySelector("[data-auth-signup-form]");
    const submitButton = form?.querySelector("button[type='submit']");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!requireConfig()) return;

      const fullName = form.fullName.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;

      if (!email || !password) {
        setStatus("Email and password are required.", "error");
        return;
      }

      try {
        setBusy(submitButton, true);
        setStatus("Creating account...");
        const { data, error } = await auth.signUpWithPassword({
          email,
          password,
          fullName,
          returnTo: getReturnTo("admin-login.html"),
        });
        if (error) throw error;

        setStatus(data.session ? "Account created. Redirecting..." : "Check your email to confirm this account.", "success");
        if (data.session) window.location.assign(getReturnTo("admin-dashboard.html"));
      } catch (error) {
        setStatus(error.message || "Could not create the account.", "error");
      } finally {
        setBusy(submitButton, false);
      }
    });

    requireConfig();
  }

  async function initForgotPassword() {
    const form = document.querySelector("[data-auth-forgot-form]");
    const submitButton = form?.querySelector("button[type='submit']");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!requireConfig()) return;

      const email = form.email.value.trim();
      if (!email) {
        setStatus("Email is required.", "error");
        return;
      }

      try {
        setBusy(submitButton, true);
        setStatus("Sending reset link...");
        const { error } = await auth.sendPasswordReset(email);
        if (error) throw error;
        setStatus("Check your email for the reset link.", "success");
      } catch (error) {
        setStatus(error.message || "Could not send reset link.", "error");
      } finally {
        setBusy(submitButton, false);
      }
    });

    requireConfig();
  }

  async function initResetPassword() {
    const form = document.querySelector("[data-auth-reset-form]");
    const submitButton = form?.querySelector("button[type='submit']");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!requireConfig()) return;

      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (!password || password !== confirmPassword) {
        setStatus("Passwords must match.", "error");
        return;
      }

      try {
        setBusy(submitButton, true);
        setStatus("Updating password...");
        const { error } = await auth.updatePassword(password);
        if (error) throw error;
        setStatus("Password updated. Redirecting...", "success");
        window.location.assign(auth.getLoginUrl("admin-dashboard.html"));
      } catch (error) {
        setStatus(error.message || "Could not update password.", "error");
      } finally {
        setBusy(submitButton, false);
      }
    });

    if (!requireConfig()) return;

    try {
      const { error } = await auth.exchangeCodeForSession();
      if (error) throw error;
    } catch (error) {
      setStatus(error.message || "Reset session could not be confirmed.", "error");
    }
  }

  async function initCallback() {
    if (!requireConfig()) return;

    try {
      setStatus("Completing sign-in...");
      const { error } = await auth.exchangeCodeForSession();
      if (error) throw error;

      const session = await auth.getSession();
      if (!session) throw new Error("No active session was returned.");

      window.location.replace(getReturnTo("admin-dashboard.html"));
    } catch (error) {
      setStatus(error.message || "Could not complete sign-in.", "error");
    }
  }

  if (page === "signup") initSignup();
  if (page === "forgot-password") initForgotPassword();
  if (page === "reset-password") initResetPassword();
  if (page === "callback") initCallback();
})();
