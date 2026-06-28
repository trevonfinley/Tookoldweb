(() => {
  const page = document.body.dataset.adminPage;
  if (!page) return;

  const auth = window.ProjectNeoAuth;
  const passkeys = window.ProjectNeoPasskeys;
  const config = auth?.config || window.ProjectNeoConfig || {};
  const apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl);
  const supabaseUrl = normalizeBaseUrl(config.supabaseUrl);
  const supabaseKey = config.supabasePublishableKey || config.supabaseAnonKey || "";
  const statusEl = document.querySelector("[data-admin-status]");
  let supabaseClient = null;

  const BLOCKING_EVENT_STATUSES = new Set(["pending", "confirmed", "hold"]);
  const BOOKING_STATUS_FLOW = Object.freeze({
    new: ["reviewing", "cancelled"],
    reviewing: ["quoted", "cancelled"],
    quoted: ["deposit_requested", "confirmed", "cancelled"],
    deposit_requested: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  });
  const PAYMENT_STATUS_OPTIONS = Object.freeze(["pending", "paid", "failed", "refunded"]);
  const PREP_STORAGE_PREFIX = "project-neo:event-prep:";
  const PREP_REQUIRED_SECTIONS = new Set(["Event Overview", "Client Contact", "Venue & Load-In", "Timeline", "Payment / Balance", "Contract", "Final Confirmation"]);

  const state = {
    session: null,
    profile: null,
    summary: {},
    records: {},
    errors: {},
    filters: {},
    selected: {},
    prepCompletion: {},
    activeSection: "overview",
  };

  const endpoints = [
    ["booking-inquiries", "/admin/booking-inquiries?limit=50"],
    ["clients", "/admin/clients?limit=50"],
    ["events", "/admin/events?limit=75"],
    ["availability", "/admin/availability-blocks?limit=75"],
    ["event-prep", "/admin/event-prep-checklists?limit=75"],
    ["invoices", "/admin/invoices?limit=50"],
    ["payments", "/admin/payments?limit=50"],
    ["venues", "/admin/venues?limit=50"],
    ["media", "/admin/media?limit=50"],
  ];

  const sectionConfigs = {
    "booking-inquiries": {
      empty: "No booking inquiries found.",
      filters: [
        ["all", "All statuses"],
        ["new", "New"],
        ["reviewing", "Reviewing"],
        ["quoted", "Quoted"],
        ["deposit_requested", "Deposit requested"],
        ["confirmed", "Confirmed"],
        ["completed", "Completed"],
        ["cancelled", "Cancelled"],
      ],
      status: (item) => item.status || "new",
      search: (item) => [
        item.full_name,
        item.email,
        item.phone,
        item.event_type,
        item.venue_name,
        item.city_state,
        item.location,
        item.budget_range,
      ],
      title: (item) => item.full_name || "Booking inquiry",
      subtitle: (item) => [formatDate(item.event_date), item.event_type, item.venue_name || item.city_state].filter(Boolean).join(" / "),
      columns: [
        ["Client", (item) => item.full_name || "Unknown"],
        ["Event", (item) => [item.event_type, item.guest_count ? `${formatNumber(item.guest_count)} guests` : ""].filter(Boolean).join(" / ") || "Details pending"],
        ["Date", (item) => [formatDate(item.event_date), formatTimeRange(item.start_time, item.end_time)].filter(Boolean).join(" / ") || "TBD"],
        ["Venue", (item) => item.venue_name || item.city_state || item.location || "TBD"],
        ["Availability", (item) => createBadge(item.availability_status_at_submission || "not_checked")],
        ["Status", (item) => createBadge(item.status || "new")],
      ],
      details: (item) => [
        ["Email", item.email],
        ["Phone", item.phone],
        ["Event type", item.event_type],
        ["Event date", formatDate(item.event_date)],
        ["Time", formatTimeRange(item.start_time, item.end_time)],
        ["Venue", item.venue_name],
        ["Venue address", item.venue_address],
        ["Location", item.city_state || item.location],
        ["Guests", item.guest_count ? formatNumber(item.guest_count) : ""],
        ["Setup", formatStatus(item.indoor_outdoor)],
        ["Requested window", formatRequestedWindow(item)],
        ["Availability at submission", createBadge(item.availability_status_at_submission || "not_checked")],
        ["Availability checked", formatDateTime(item.availability_checked_at)],
        ["Budget", item.budget_range],
        ["Music", item.music_preferences],
        ["Notes", item.additional_notes || item.message],
        ["Internal notes", item.internal_notes],
        ["Created", formatDateTime(item.created_at)],
      ],
    },
    clients: {
      empty: "No clients found.",
      filters: [
        ["all", "All contact methods"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["text", "Text"],
      ],
      status: (item) => item.preferred_contact_method || "email",
      search: (item) => [item.full_name, item.email, item.phone, item.company_name, item.city, item.state],
      title: (item) => item.full_name || "Client",
      subtitle: (item) => [item.company_name, item.email].filter(Boolean).join(" / "),
      columns: [
        ["Client", (item) => item.full_name || "Unknown"],
        ["Contact", (item) => [item.email, item.phone].filter(Boolean).join(" / ") || "No contact"],
        ["Location", (item) => [item.city, item.state].filter(Boolean).join(", ") || "Not set"],
        ["Preferred", (item) => createBadge(item.preferred_contact_method || "email")],
      ],
      details: (item) => [
        ["Email", item.email],
        ["Phone", item.phone],
        ["Company", item.company_name],
        ["Preferred contact", formatStatus(item.preferred_contact_method)],
        ["Location", [item.city, item.state].filter(Boolean).join(", ")],
        ["Notes", item.notes],
        ["Created", formatDateTime(item.created_at)],
      ],
    },
    events: {
      empty: "No events found.",
      filters: [
        ["all", "All statuses"],
        ["inquiry", "Inquiry"],
        ["pending", "Pending"],
        ["hold", "Hold"],
        ["confirmed", "Confirmed"],
        ["completed", "Completed"],
        ["cancelled", "Cancelled"],
      ],
      status: (item) => eventStatus(item),
      search: (item) => {
        const client = firstRelation(item.clients);
        const venue = firstRelation(item.venues);
        return [
          item.title,
          item.event_type,
          item.venue_name,
          item.location,
          item.visibility,
          item.internal_notes,
          item.calendar_sync_id,
          client?.full_name,
          venue?.name,
        ];
      },
      title: (item) => item.title || "Event",
      subtitle: (item) => [formatDate(item.event_date), formatTimeRange(item.start_time, item.end_time)].filter(Boolean).join(" / "),
      columns: [
        ["Event", (item) => item.title || "Untitled event"],
        ["Date", (item) => [formatDate(item.event_date), formatTimeRange(item.start_time, item.end_time)].filter(Boolean).join(" / ") || "TBD"],
        ["Client", (item) => firstRelation(item.clients)?.full_name || "Unassigned"],
        ["Venue", (item) => item.venue_name || firstRelation(item.venues)?.name || item.location || "TBD"],
        ["Conflict", (item) => createConflictBadge(getAvailabilityConflicts("event", item))],
        ["Status", (item) => createBadge(eventStatus(item))],
      ],
      details: (item) => {
        const client = firstRelation(item.clients);
        const venue = firstRelation(item.venues);
        return [
          ["Event type", item.event_type],
          ["Date", formatDate(item.event_date)],
          ["Time", formatTimeRange(item.start_time, item.end_time)],
          ["Client", client?.full_name],
          ["Venue", item.venue_name || venue?.name],
          ["Location", item.location || [venue?.city, venue?.state].filter(Boolean).join(", ")],
          ["Guests", item.guest_count ? formatNumber(item.guest_count) : ""],
          ["Visibility", createBadge(item.visibility || "private")],
          ["Calendar sync ID", item.calendar_sync_id],
          ["Setup notes", item.setup_notes],
          ["Timeline", item.timeline_notes],
          ["Notes", item.notes],
          ["Internal notes", item.internal_notes],
          ["Conflicts", createConflictList(getAvailabilityConflicts("event", item))],
        ];
      },
    },
    availability: {
      empty: "No availability blocks found.",
      filters: [
        ["all", "All block types"],
        ["hold", "Hold"],
        ["unavailable", "Unavailable"],
        ["personal_block", "Personal block"],
        ["travel_block", "Travel block"],
        ["setup_day", "Setup day"],
        ["maintenance_day", "Maintenance day"],
      ],
      status: (item) => item.block_type || item.status || "unavailable",
      matchStatus: (item, value) => value === "all" || item.block_type === value,
      search: (item) => [
        item.title,
        item.block_type,
        item.status,
        item.public_message,
        item.internal_notes,
        item.reason,
        formatAvailabilityWindow(item, "block"),
      ],
      title: (item) => item.title || "Availability block",
      subtitle: (item) => formatAvailabilityWindow(item, "block"),
      columns: [
        ["Block", (item) => item.title || "Availability block"],
        ["Window", (item) => formatAvailabilityWindow(item, "block") || "Not set"],
        ["Type", (item) => createBadge(item.block_type || item.status || "unavailable")],
        ["Public Message", (item) => item.public_message || "Private block"],
        ["Conflict", (item) => createConflictBadge(getAvailabilityConflicts("block", item))],
      ],
      details: (item) => [
        ["Type", createBadge(item.block_type || item.status || "unavailable")],
        ["Window", formatAvailabilityWindow(item, "block")],
        ["All day", item.all_day ? "Yes" : "No"],
        ["Public message", item.public_message],
        ["Internal notes", item.internal_notes],
        ["Created", formatDateTime(item.created_at)],
        ["Conflicts", createConflictList(getAvailabilityConflicts("block", item))],
      ],
    },
    invoices: {
      empty: "No invoices found.",
      filters: [
        ["all", "All statuses"],
        ["draft", "Draft"],
        ["sent", "Sent"],
        ["partially_paid", "Partially paid"],
        ["paid", "Paid"],
        ["overdue", "Overdue"],
        ["cancelled", "Cancelled"],
      ],
      status: (item) => item.status || "draft",
      search: (item) => {
        const client = firstRelation(item.clients);
        const event = firstRelation(item.events);
        return [item.invoice_number, item.status, client?.full_name, client?.email, event?.title];
      },
      title: (item) => item.invoice_number || "Invoice",
      subtitle: (item) => firstRelation(item.clients)?.full_name || "No client",
      columns: [
        ["Invoice", (item) => item.invoice_number || "Invoice"],
        ["Client", (item) => firstRelation(item.clients)?.full_name || "Unassigned"],
        ["Due", (item) => formatDate(item.due_date) || "Not set"],
        ["Balance", (item) => formatMoney(item.balance_due_cents)],
        ["Status", (item) => createBadge(item.status || "draft")],
      ],
      details: (item) => {
        const client = firstRelation(item.clients);
        const event = firstRelation(item.events);
        return [
          ["Client", client?.full_name],
          ["Event", event?.title],
          ["Issue date", formatDate(item.issue_date)],
          ["Due date", formatDate(item.due_date)],
          ["Total", formatMoney(item.total_cents)],
          ["Paid", formatMoney(item.amount_paid_cents)],
          ["Deposit", `${formatMoney(item.deposit_paid_cents)} of ${formatMoney(item.deposit_cents)}`],
          ["Balance due", formatMoney(item.balance_due_cents)],
          ["Payment provider", item.payment_provider],
          ["Payment link", item.payment_link_url ? { label: "Open link", url: item.payment_link_url } : ""],
          ["External invoice", item.external_invoice_url ? { label: "Open invoice", url: item.external_invoice_url } : ""],
          ["Terms", item.terms],
          ["Notes", item.notes],
        ];
      },
    },
    payments: {
      empty: "No payments found.",
      filters: [
        ["all", "All statuses"],
        ["pending", "Pending"],
        ["paid", "Paid"],
        ["failed", "Failed"],
        ["refunded", "Refunded"],
      ],
      status: (item) => item.status || "pending",
      search: (item) => {
        const invoice = firstRelation(item.invoices);
        const client = firstRelation(invoice?.clients);
        return [item.payment_type, item.payment_provider, item.provider_payment_id, invoice?.invoice_number, client?.full_name];
      },
      title: (item) => `${formatMoney(item.amount_cents)} ${formatStatus(item.payment_type)}`,
      subtitle: (item) => {
        const invoice = firstRelation(item.invoices);
        const client = firstRelation(invoice?.clients);
        return [invoice?.invoice_number, client?.full_name].filter(Boolean).join(" / ");
      },
      columns: [
        ["Payment", (item) => formatMoney(item.amount_cents)],
        ["Invoice", (item) => firstRelation(item.invoices)?.invoice_number || "Unlinked"],
        ["Type", (item) => formatStatus(item.payment_type)],
        ["Date", (item) => formatDate(item.payment_date) || formatDateTime(item.paid_at) || "Pending"],
        ["Status", (item) => createBadge(item.status || "pending")],
      ],
      details: (item) => {
        const invoice = firstRelation(item.invoices);
        const client = firstRelation(invoice?.clients);
        const event = firstRelation(invoice?.events);
        return [
          ["Amount", formatMoney(item.amount_cents)],
          ["Type", formatStatus(item.payment_type)],
          ["Provider", item.payment_provider],
          ["Provider reference", item.provider_payment_id],
          ["Invoice status", invoice?.status ? createBadge(invoice.status) : ""],
          ["Invoice balance", invoice?.balance_due_cents !== undefined ? formatMoney(invoice.balance_due_cents) : ""],
          ["Invoice", invoice?.invoice_number],
          ["Client", client?.full_name],
          ["Event", event?.title],
          ["Payment date", formatDate(item.payment_date)],
          ["Paid at", formatDateTime(item.paid_at)],
          ["Refunded at", formatDateTime(item.refunded_at)],
          ["Notes", item.notes],
        ];
      },
    },
    venues: {
      empty: "No venues found.",
      filters: [
        ["all", "All venues"],
        ["preferred", "Preferred"],
        ["standard", "Standard"],
      ],
      status: (item) => item.is_preferred ? "preferred" : "standard",
      matchStatus: (item, value) => value === "preferred" ? item.is_preferred : value === "standard" ? !item.is_preferred : true,
      search: (item) => [item.name, item.city, item.state, item.contact_name, item.contact_email, item.load_in_notes, item.parking_notes],
      title: (item) => item.name || "Venue",
      subtitle: (item) => [item.city, item.state].filter(Boolean).join(", "),
      details: (item) => [
        ["Address", [item.address_line1, item.address_line2, item.city, item.state, item.postal_code].filter(Boolean).join(", ")],
        ["Contact", [item.contact_name, item.contact_email, item.contact_phone].filter(Boolean).join(" / ")],
        ["Website", item.website_url ? { label: "Open website", url: item.website_url } : ""],
        ["Load-in", item.load_in_notes],
        ["Parking", item.parking_notes],
        ["Power", item.power_notes],
        ["Preferred", item.is_preferred ? "Yes" : "No"],
      ],
    },
    media: {
      empty: "No media found.",
      filters: [
        ["all", "All media"],
        ["published", "Published"],
        ["draft", "Draft"],
        ["featured", "Featured"],
      ],
      status: (item) => item.is_published ? "published" : "draft",
      matchStatus: (item, value) => {
        if (value === "featured") return item.is_featured;
        if (value === "published") return item.is_published;
        if (value === "draft") return !item.is_published;
        return true;
      },
      search: (item) => {
        const event = firstRelation(item.events);
        return [
          item.title,
          item.description,
          item.caption,
          item.media_category,
          item.media_type,
          item.venue,
          ...(Array.isArray(item.tags) ? item.tags : []),
          event?.title,
          item.alt_text,
        ];
      },
      title: (item) => item.title || "Media item",
      subtitle: (item) => [
        formatStatus(item.media_category || item.media_type),
        formatDate(item.event_date),
        item.venue || firstRelation(item.events)?.title,
      ].filter(Boolean).join(" / "),
      details: (item) => {
        const event = firstRelation(item.events);
        return [
          ["Category", formatStatus(item.media_category)],
          ["Storage type", formatStatus(item.media_type)],
          ["Status", item.is_published ? "Published" : "Draft"],
          ["Featured", item.is_featured ? "Yes" : "No"],
          ["Display order", item.display_order ?? item.sort_order],
          ["Event date", formatDate(item.event_date)],
          ["Venue", item.venue],
          ["Tags", formatTags(item.tags)],
          ["Source", formatStatus(item.source_type)],
          ["Event", event?.title],
          ["Storage bucket", item.storage_bucket],
          ["Storage path", item.storage_path],
          ["URL", item.url ? { label: "Open media", url: item.url } : ""],
          ["External URL", item.external_url ? { label: "Open external media", url: item.external_url } : ""],
          ["Embed URL", item.embed_url ? { label: "Open embed", url: item.embed_url } : ""],
          ["Thumbnail", item.thumbnail_url ? { label: "Open thumbnail", url: item.thumbnail_url } : ""],
          ["Description", item.description || item.caption],
          ["Alt text", item.alt_text],
        ];
      },
    },
  };

  function normalizeBaseUrl(value) {
    return typeof value === "string" ? value.replace(/\/+$/, "") : "";
  }

  function setStatus(message, statusState = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = statusState ? `admin-status ${statusState}` : "admin-status";
  }

  function requireConfig() {
    const authStatus = auth?.validateConfig?.();
    if (!apiBaseUrl || !authStatus?.ok) {
      setStatus(authStatus?.message || "Project Neo admin configuration is missing.", "error");
      return false;
    }
    return true;
  }

  function getSupabaseClient() {
    if (auth?.getClient) return auth.getClient();
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
          experimental: { passkey: true },
        },
      });
    }
    return supabaseClient;
  }

  async function getSession() {
    if (auth?.getSession) return auth.getSession();
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function adminFetch(path, session, options = {}) {
    if (auth?.apiFetch && !options.method && !options.body) return auth.apiFetch(path, session);
    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    };
    if (options.body) headers["Content-Type"] = "application/json";

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.error?.message || "Project Neo request failed.");
      error.status = response.status;
      throw error;
    }

    return payload.data;
  }

  function getSafeReturnPath() {
    if (auth?.getReturnPath) return auth.getReturnPath("admin-dashboard.html");
    const fallback = "admin-dashboard.html";
    const rawPath = new URLSearchParams(window.location.search).get("returnTo") || fallback;

    try {
      const url = new URL(rawPath, window.location.href);
      if (url.origin !== window.location.origin) return fallback;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallback;
    }
  }

  function getLoginUrl() {
    if (auth?.getLoginUrl) {
      const currentPage = `${window.location.pathname.split("/").pop() || "admin-dashboard.html"}${window.location.search}`;
      return auth.getLoginUrl(currentPage);
    }
    const currentPage = `${window.location.pathname.split("/").pop() || "admin-dashboard.html"}${window.location.search}`;
    return `/admin-login.html?returnTo=${encodeURIComponent(currentPage)}`;
  }

  async function signOutAndRedirect() {
    if (auth?.signOut) {
      await auth.signOut();
    } else {
      await getSupabaseClient().auth.signOut();
    }
    window.location.replace(getLoginUrl());
  }

  function setButtonBusy(button, isBusy) {
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
  }

  async function initLogin() {
    const form = document.querySelector("[data-admin-login-form]");
    const submitButton = form?.querySelector("button[type='submit']");
    setupLoginActions();

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!requireConfig()) return;

      const email = form.email.value.trim();
      const password = form.password.value;

      if (!email || !password) {
        setStatus("Email and password are required.", "error");
        return;
      }

      try {
        setButtonBusy(submitButton, true);
        setStatus("Signing in...");
        const { data, error } = auth?.signInWithPassword
          ? await auth.signInWithPassword(email, password)
          : await getSupabaseClient().auth.signInWithPassword({ email, password });
        if (error) throw error;

        const session = data.session || await getSession();
        if (!session) throw new Error("Could not start an admin session.");

        await adminFetch("/admin/me", session);
        window.location.assign(getSafeReturnPath());
      } catch (error) {
        await getSupabaseClient().auth.signOut();
        setStatus(error.status === 403 ? "This account does not have Project Neo admin access." : error.message || "Sign in failed.", "error");
      } finally {
        setButtonBusy(submitButton, false);
      }
    });

    if (!requireConfig()) return;

    try {
      const existingSession = await getSession();
      if (existingSession) {
        await adminFetch("/admin/me", existingSession);
        window.location.replace(getSafeReturnPath());
        return;
      }
    } catch {
      await getSupabaseClient().auth.signOut();
    }
  }

  function setupLoginActions() {
    renderPasskeyAvailability("[data-passkey-message]");

    document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
      button.addEventListener("click", async () => {
        const provider = button.dataset.oauthProvider;
        try {
          if (!requireConfig()) return;
          setButtonBusy(button, true);
          setStatus(`Opening ${formatStatus(provider)}...`);
          const { error } = await auth.signInWithOAuth(provider, getSafeReturnPath());
          if (error) throw error;
        } catch (error) {
          setStatus(error.message || `Could not start ${formatStatus(provider)} sign-in.`, "error");
          setButtonBusy(button, false);
        }
      });
    });

    const passkeyButton = document.querySelector("[data-passkey-signin]");
    passkeyButton?.addEventListener("click", async () => {
      try {
        if (!requireConfig()) return;
        if (!passkeys) throw new Error("Passkey support is not loaded.");
        setButtonBusy(passkeyButton, true);
        setStatus("Checking passkey...");
        const { error } = await passkeys.signIn();
        if (error) throw error;

        const session = await getSession();
        if (!session) throw new Error("Could not start a passkey session.");
        await adminFetch("/admin/me", session);
        window.location.assign(getSafeReturnPath());
      } catch (error) {
        setStatus(error.message || "Passkey sign-in failed.", "error");
      } finally {
        setButtonBusy(passkeyButton, false);
      }
    });
  }

  async function initDashboard() {
    if (!requireConfig()) {
      window.location.replace(getLoginUrl());
      return;
    }

    setupNavigation();
    setupRecordControls();
    setupAvailabilityForm();
    setupEventPrepControls();
    setupPasskeyManagement();

    const signOutButton = document.querySelector("[data-admin-signout]");
    const refreshButton = document.querySelector("[data-admin-refresh]");
    signOutButton?.addEventListener("click", signOutAndRedirect);
    refreshButton?.addEventListener("click", () => loadDashboard({ refresh: true }));

    await loadDashboard();
  }

  async function loadDashboard(options = {}) {
    const shell = document.querySelector("[data-admin-shell]");
    const refreshButton = document.querySelector("[data-admin-refresh]");

    try {
      setButtonBusy(refreshButton, true);
      setStatus(options.refresh ? "Refreshing dashboard..." : "Checking access...");
      const session = await getSession();
      if (!session) {
        window.location.replace(getLoginUrl());
        return;
      }

      state.session = session;
      const profile = await adminFetch("/admin/me", session);
      state.profile = profile;
      renderProfile(profile);
      await loadPasskeys();

      await loadAdminData(session);
      renderDashboard();

      if (shell) shell.hidden = false;
      setStatus("");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        await signOutAndRedirect();
        return;
      }
      setStatus(error.message || "Could not load Project Neo admin.", "error");
    } finally {
      setButtonBusy(refreshButton, false);
    }
  }

  async function loadAdminData(session) {
    const summaryResult = await Promise.allSettled([
      adminFetch("/admin/dashboard-summary", session),
      ...endpoints.map(([, path]) => adminFetch(path, session)),
    ]);

    const [summary, ...records] = summaryResult;
    if (summary.status === "rejected") throw summary.reason;

    state.summary = summary.value || {};
    state.errors = {};

    records.forEach((result, index) => {
      const [key] = endpoints[index];
      if (result.status === "fulfilled") {
        state.records[key] = Array.isArray(result.value) ? result.value : [];
      } else {
        state.records[key] = [];
        state.errors[key] = result.reason?.message || "Could not load records.";
      }
    });
  }

  function renderDashboard() {
    renderMetrics(state.summary);
    renderOverview(state.summary);
    Object.keys(sectionConfigs).forEach(renderRecordSection);
    renderEventPrepChecklist();
    renderAvailabilitySchedule();
    showSection(state.activeSection);
  }

  function renderProfile(profile) {
    setText("[data-admin-email]", profile.email || "Project Neo user");
    setText("[data-admin-role]", profile.role || "admin");
    setText("[data-settings='email']", profile.email || "Project Neo user");
    setText("[data-settings='role']", formatStatus(profile.role || "admin"));
    setText("[data-settings='api']", apiBaseUrl ? "Configured" : "Missing");
    setText("[data-settings='supabase']", supabaseUrl ? "Configured" : "Missing");

    const account = document.querySelector("[data-admin-account]");
    if (account) account.hidden = false;
  }

  async function renderPasskeyAvailability(selector) {
    const message = document.querySelector(selector);
    if (!message) return;

    if (!passkeys) {
      message.textContent = "Passkey support is not loaded. Use email, Google, or Apple instead.";
      return;
    }

    try {
      const support = await passkeys.getSupportStatus();
      if (!support.webAuthn) {
        message.textContent = "Passkeys are not available on this browser or device. Use email, Google, or Apple instead.";
      } else if (!support.api) {
        message.textContent = "Passkey support is not enabled in the loaded Supabase SDK. Use another sign-in method.";
      } else {
        message.textContent = support.platformAuthenticator
          ? "Passkeys are available on this device."
          : "Passkeys are available when a compatible authenticator is connected.";
      }
    } catch {
      message.textContent = "Passkey availability could not be checked. Use email, Google, or Apple instead.";
    }
  }

  function setupPasskeyManagement() {
    const form = document.querySelector("[data-passkey-register-form]");
    const list = document.querySelector("[data-passkey-list]");
    if (!form || !list) return;

    renderPasskeyAvailability("[data-passkey-settings-message]");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      const friendlyName = form.friendlyName.value.trim();

      try {
        if (!passkeys) throw new Error("Passkey support is not loaded.");
        setButtonBusy(button, true);
        setStatus("Registering passkey...");
        const { error } = await passkeys.register(friendlyName);
        if (error) throw error;
        form.reset();
        await loadPasskeys();
        setStatus("Passkey registered.", "success");
      } catch (error) {
        setStatus(error.message || "Could not register passkey.", "error");
      } finally {
        setButtonBusy(button, false);
      }
    });

    list.addEventListener("click", async (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-passkey-action]") : null;
      if (!button) return;

      const row = button.closest("[data-passkey-id]");
      const id = row?.dataset.passkeyId;
      if (!id) return;

      try {
        if (!passkeys) throw new Error("Passkey support is not loaded.");
        setButtonBusy(button, true);
        if (button.dataset.passkeyAction === "rename") {
          const input = row.querySelector("input");
          const friendlyName = input?.value.trim();
          if (!friendlyName) throw new Error("Passkey name is required.");
          const { error } = await passkeys.update(id, friendlyName);
          if (error) throw error;
          setStatus("Passkey renamed.", "success");
        }

        if (button.dataset.passkeyAction === "delete") {
          const { error } = await passkeys.remove(id);
          if (error) throw error;
          setStatus("Passkey removed.", "success");
        }

        await loadPasskeys();
      } catch (error) {
        setStatus(error.message || "Could not update passkey.", "error");
      } finally {
        setButtonBusy(button, false);
      }
    });
  }

  async function loadPasskeys() {
    const list = document.querySelector("[data-passkey-list]");
    if (!list || !passkeys) return;

    try {
      const { data, error } = await passkeys.list();
      if (error) throw error;
      renderPasskeyList(passkeys.normalizeList(data));
    } catch (error) {
      list.textContent = "";
      list.append(createEmptyListItem(error.message || "Passkeys could not be loaded."));
    }
  }

  function renderPasskeyList(items) {
    const list = document.querySelector("[data-passkey-list]");
    if (!list) return;
    list.textContent = "";

    if (items.length === 0) {
      list.append(createEmptyListItem("No passkeys registered yet."));
      return;
    }

    items.forEach((item) => {
      const id = passkeys.getPasskeyId(item);
      const li = document.createElement("li");
      li.dataset.passkeyId = id;

      const input = document.createElement("input");
      input.type = "text";
      input.value = passkeys.getPasskeyName(item);
      input.setAttribute("aria-label", "Passkey name");

      const actions = document.createElement("div");
      actions.className = "passkey-actions";

      const renameButton = document.createElement("button");
      renameButton.type = "button";
      renameButton.className = "btn-secondary";
      renameButton.dataset.passkeyAction = "rename";
      renameButton.textContent = "Save";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn-secondary";
      deleteButton.dataset.passkeyAction = "delete";
      deleteButton.textContent = "Remove";

      actions.append(renameButton, deleteButton);
      li.append(input, actions);
      list.append(li);
    });
  }

  function createEmptyListItem(message) {
    const item = document.createElement("li");
    item.className = "admin-empty";
    item.textContent = message;
    return item;
  }

  function renderMetrics(summary) {
    const counts = summary.counts || {};
    const money = summary.money || {};

    setText("[data-metric='upcoming-events']", formatNumber(counts.upcomingEvents));
    setText("[data-metric='new-inquiries']", formatNumber(counts.newBookingInquiries));
    setText("[data-metric='confirmed-bookings']", formatNumber(counts.confirmedBookings));
    setText("[data-metric='open-invoices']", formatNumber(counts.openInvoices));
    setText("[data-metric='total-balance-due']", formatMoney(money.unpaidInvoiceCents));
  }

  function renderOverview(summary) {
    renderList("[data-list='recent-inquiries']", summary.recentBookingInquiries || [], (item) => ({
      title: item.full_name || "Unknown inquiry",
      meta: [
        formatDate(item.event_date),
        formatTimeRange(item.start_time, item.end_time),
        item.event_type,
        item.venue_name || item.city_state || item.location,
        item.guest_count ? `${formatNumber(item.guest_count)} guests` : "",
      ].filter(Boolean).join(" / "),
      badge: item.status,
    }));

    renderList("[data-list='next-events']", summary.nextEvents || [], (item) => ({
      title: item.title || "Untitled event",
      meta: [
        formatDate(item.event_date),
        formatTimeRange(item.start_time, item.end_time),
        item.venue_name || item.location,
      ].filter(Boolean).join(" / "),
      badge: eventStatus(item),
    }));

    renderList("[data-list='open-invoices']", summary.openInvoices || [], (item) => {
      const client = firstRelation(item.clients);
      const event = firstRelation(item.events);
      return {
        title: [item.invoice_number, client?.full_name].filter(Boolean).join(" / ") || "Invoice",
        meta: [
          `${formatMoney(item.balance_due_cents)} due`,
          item.due_date ? `Due ${formatDate(item.due_date)}` : "",
          event?.title,
        ].filter(Boolean).join(" / "),
        badge: item.status,
      };
    });

    renderList("[data-list='admin-review']", buildAdminReviewQueue(), (item) => item);
  }

  function buildAdminReviewQueue() {
    const queue = [];
    const inquiries = (state.records["booking-inquiries"] || [])
      .filter((item) => ["new", "reviewing"].includes(item.status || "new"))
      .slice(0, 4);

    inquiries.forEach((item) => {
      queue.push({
        title: `Review ${item.full_name || "new inquiry"}`,
        meta: [
          formatDate(item.event_date),
          formatTimeRange(item.start_time, item.end_time),
          item.event_type,
          item.availability_status_at_submission ? `Availability: ${formatStatus(item.availability_status_at_submission)}` : "Availability not checked",
        ].filter(Boolean).join(" / "),
        badge: item.status || "new",
      });
    });

    (state.records.events || []).forEach((item) => {
      const conflicts = getAvailabilityConflicts("event", item);
      if (conflicts.length === 0) return;
      queue.push({
        title: `Resolve conflict: ${item.title || "Event"}`,
        meta: [formatAvailabilityWindow(item, "event"), item.venue_name || item.location].filter(Boolean).join(" / "),
        badge: createConflictBadge(conflicts),
      });
    });

    (state.records.invoices || [])
      .filter((item) => Number(item.balance_due_cents || 0) > 0 && !["draft", "cancelled"].includes(item.status || ""))
      .slice(0, 3)
      .forEach((item) => {
        const client = firstRelation(item.clients);
        queue.push({
          title: `Collect ${formatMoney(item.balance_due_cents)} ${item.invoice_number || "invoice"}`,
          meta: [client?.full_name, item.due_date ? `Due ${formatDate(item.due_date)}` : ""].filter(Boolean).join(" / "),
          badge: item.status || "sent",
        });
      });

    (state.records.payments || [])
      .filter((item) => ["pending", "failed"].includes(item.status || ""))
      .slice(0, 3)
      .forEach((item) => {
        const invoice = firstRelation(item.invoices);
        queue.push({
          title: `${formatStatus(item.status)} payment ${formatMoney(item.amount_cents)}`,
          meta: [invoice?.invoice_number, formatStatus(item.payment_type), item.payment_provider].filter(Boolean).join(" / "),
          badge: item.status || "pending",
        });
      });

    return queue.slice(0, 8);
  }

  function renderAvailabilitySchedule() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = (state.records.events || [])
      .filter((item) => {
        const window = getAvailabilityWindow("event", item);
        return window && window.end >= today && eventStatus(item) !== "cancelled";
      })
      .sort((a, b) => {
        const aWindow = getAvailabilityWindow("event", a);
        const bWindow = getAvailabilityWindow("event", b);
        return Number(aWindow?.start || 0) - Number(bWindow?.start || 0);
      })
      .slice(0, 6);

    renderList("[data-list='availability-events']", upcomingEvents, (item) => {
      const conflicts = getAvailabilityConflicts("event", item);
      return {
        title: item.title || "Untitled event",
        meta: [
          formatAvailabilityWindow(item, "event"),
          item.venue_name || item.location,
        ].filter(Boolean).join(" / "),
        badge: conflicts.length > 0 ? createConflictBadge(conflicts) : eventStatus(item),
      };
    });
  }

  function availabilityFormPayload(form) {
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const blockType = String(data.get("blockType") || "").trim();
    const startAt = localDateTimeToIso(data.get("startAt"));
    const endAt = localDateTimeToIso(data.get("endAt"));
    const publicMessage = String(data.get("publicMessage") || "").trim();
    const internalNotes = String(data.get("internalNotes") || "").trim();

    if (!title) throw new Error("Title is required.");
    if (!blockType) throw new Error("Block type is required.");
    if (!startAt || !endAt) throw new Error("Start and end date/time are required.");
    if (Date.parse(endAt) <= Date.parse(startAt)) throw new Error("End date/time must be after start date/time.");

    return {
      title,
      blockType,
      startAt,
      endAt,
      allDay: data.get("allDay") === "on",
      publicMessage: publicMessage || null,
      internalNotes: internalNotes || null,
    };
  }

  function localDateTimeToIso(value) {
    if (!value) return null;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function setupNavigation() {
    document.querySelectorAll("[data-admin-nav]").forEach((button) => {
      button.addEventListener("click", () => showSection(button.dataset.adminNav));
    });
  }

  function setupAvailabilityForm() {
    const form = document.querySelector("[data-availability-form]");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("[data-availability-submit]");
      const message = document.querySelector("[data-availability-form-status]");

      try {
        if (!state.session) throw new Error("Admin session is not ready.");
        const body = availabilityFormPayload(form);
        setButtonBusy(submitButton, true);
        if (message) {
          message.textContent = "Saving availability block...";
          message.dataset.status = "";
        }

        const created = await adminFetch("/admin/availability-blocks", state.session, {
          method: "POST",
          body,
        });
        form.reset();
        await loadAdminData(state.session);
        renderDashboard();
        showSection("availability");

        const conflictCount = Array.isArray(created?.conflict_warnings) ? created.conflict_warnings.length : 0;
        if (message) {
          message.textContent = conflictCount > 0
            ? `Block created with ${conflictCount} conflict ${conflictCount === 1 ? "warning" : "warnings"}.`
            : "Availability block created.";
          message.dataset.status = conflictCount > 0 ? "warning" : "success";
        }
      } catch (error) {
        if (message) {
          message.textContent = error.message || "Could not create availability block.";
          message.dataset.status = "error";
        }
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  function setupEventPrepControls() {
    const select = document.querySelector("[data-event-prep-select]");
    if (!select) return;

    select.addEventListener("change", () => {
      state.selected["event-prep"] = select.value || null;
      renderEventPrepChecklist();
    });
  }

  function showSection(section) {
    state.activeSection = section || "overview";
    document.querySelectorAll("[data-admin-section]").forEach((panel) => {
      panel.hidden = panel.dataset.adminSection !== state.activeSection;
    });
    document.querySelectorAll("[data-admin-nav]").forEach((button) => {
      if (button.dataset.adminNav === state.activeSection) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function setupRecordControls() {
    Object.entries(sectionConfigs).forEach(([key, sectionConfig]) => {
      state.filters[key] = state.filters[key] || { search: "", status: "all" };

      const search = document.querySelector(`[data-admin-search="${key}"]`);
      search?.addEventListener("input", () => {
        state.filters[key].search = search.value.trim().toLowerCase();
        renderRecordSection(key);
      });

      const statusFilter = document.querySelector(`[data-admin-status-filter="${key}"]`);
      if (statusFilter) {
        statusFilter.textContent = "";
        sectionConfig.filters.forEach(([value, label]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          statusFilter.append(option);
        });
        statusFilter.addEventListener("change", () => {
          state.filters[key].status = statusFilter.value;
          renderRecordSection(key);
        });
      }
    });
  }

  function renderEventPrepChecklist() {
    const root = document.querySelector("[data-event-prep-root]");
    const select = document.querySelector("[data-event-prep-select]");
    if (!root || !select) return;

    const events = getPrepEligibleEvents();
    syncEventPrepSelect(select, events);
    root.textContent = "";

    if (state.errors["event-prep"]) {
      root.append(createPrepNotice("Checklist API Pending", "Protected Event Prep API routes are not available yet, so completion changes are stored locally for this admin browser until Stack Mason wires persistence."));
    }

    if (events.length === 0) {
      root.append(createEmptyCard("No upcoming or confirmed events are ready for prep yet."));
      return;
    }

    const selectedEvent = events.find((event) => event.id === state.selected["event-prep"]) || events[0];
    state.selected["event-prep"] = selectedEvent.id;
    select.value = selectedEvent.id;

    const checklist = getPrepChecklistForEvent(selectedEvent);
    const sections = buildPrepSections(selectedEvent, checklist);
    const progress = calculatePrepProgress(selectedEvent, sections);

    root.append(createPrepSummary(selectedEvent, progress));

    const grid = document.createElement("div");
    grid.className = "admin-prep-section-grid";
    sections.forEach((section) => {
      grid.append(createPrepSectionCard(selectedEvent, section));
    });
    root.append(grid);
  }

  function getPrepEligibleEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (state.records.events || [])
      .filter((event) => {
        const status = eventStatus(event);
        const window = getAvailabilityWindow("event", event);
        return status !== "cancelled" && status !== "completed" && (!window || window.end >= today);
      })
      .sort((a, b) => {
        const aWindow = getAvailabilityWindow("event", a);
        const bWindow = getAvailabilityWindow("event", b);
        return Number(aWindow?.start || 0) - Number(bWindow?.start || 0);
      });
  }

  function syncEventPrepSelect(select, events) {
    const current = state.selected["event-prep"];
    select.textContent = "";

    if (events.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No upcoming events";
      select.append(option);
      select.disabled = true;
      state.selected["event-prep"] = null;
      return;
    }

    select.disabled = false;
    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = [
        event.title || "Untitled event",
        formatDate(event.event_date),
        event.venue_name || event.location,
      ].filter(Boolean).join(" / ");
      select.append(option);
    });

    if (!events.some((event) => event.id === current)) {
      state.selected["event-prep"] = events[0].id;
    }
  }

  function getPrepChecklistForEvent(event) {
    return (state.records["event-prep"] || []).find((item) => {
      return String(item.event_id || item.eventId || firstRelation(item.events)?.id || "") === String(event.id);
    }) || null;
  }

  function buildPrepSections(event, checklist) {
    const client = firstRelation(event.clients) || findRelatedClient(event);
    const venue = firstRelation(event.venues) || findRelatedVenue(event);
    const invoice = findRelatedInvoice(event);
    const payment = findRelatedPayment(invoice);
    const musicNotes = getPrepMusicNotes(checklist);
    const timelineItems = getPrepTimelineItems(checklist);
    const gearItems = getPrepGearItems(checklist);
    const checklistItems = getPrepItems(checklist);
    const conflicts = getAvailabilityConflicts("event", event);

    return [
      {
        title: "Event Overview",
        description: "Date, time, status, event type, and conflict context.",
        rows: [
          ["Event", event.title],
          ["Type", event.event_type],
          ["Date", formatDate(event.event_date)],
          ["Time", formatTimeRange(event.start_time, event.end_time)],
          ["Status", createBadge(eventStatus(event))],
          ["Guests", event.guest_count ? formatNumber(event.guest_count) : ""],
          ["Conflicts", createConflictList(conflicts)],
        ],
        items: [
          prepItem("event-status", "Confirm event status is correct", Boolean(eventStatus(event) && eventStatus(event) !== "inquiry"), true),
          prepItem("event-window", "Confirm event date and time", Boolean(event.event_date && event.start_time && event.end_time), true),
          prepItem("event-conflicts", "Review conflict indicator", conflicts.length === 0, true),
        ],
      },
      {
        title: "Client Contact",
        description: "Primary contact details for admin follow-up.",
        empty: "No client contact details recorded.",
        rows: [
          ["Client", client?.full_name],
          ["Email", client?.email],
          ["Phone", client?.phone],
          ["Preferred contact", formatStatus(client?.preferred_contact_method)],
        ],
        items: [
          prepItem("client-contact", "Confirm primary contact", Boolean(client?.full_name && (client?.email || client?.phone)), true),
          ...checklistItemsForSection(checklistItems, "Client"),
        ],
      },
      {
        title: "Venue & Load-In",
        description: "Arrival, setup, parking, power, and venue access details.",
        empty: "No venue or load-in details recorded.",
        rows: [
          ["Venue", event.venue_name || venue?.name],
          ["Location", event.location || [venue?.address_line1, venue?.city, venue?.state].filter(Boolean).join(", ")],
          ["Load-in", venue?.load_in_notes || event.load_in_notes],
          ["Parking", venue?.parking_notes || event.parking_notes],
          ["Power", venue?.power_notes],
          ["Setup notes", event.setup_notes],
        ],
        items: [
          prepItem("venue-address", "Verify venue address and room location", Boolean(event.venue_name || venue?.name || event.location), true),
          prepItem("venue-load-in", "Confirm load-in and parking details", Boolean(venue?.load_in_notes || venue?.parking_notes || event.setup_notes), true),
          ...checklistItemsForSection(checklistItems, "Venue"),
        ],
      },
      {
        title: "Timeline",
        description: "Program flow, start/end times, transitions, and announcements.",
        empty: "No timeline items recorded.",
        rows: [
          ["Timeline notes", event.timeline_notes],
          ...timelineItems.map((item) => [item.time_label || "Timeline item", [item.title, item.description].filter(Boolean).join(" / ")]),
        ],
        items: [
          prepItem("timeline-build", "Build event timeline", Boolean(event.timeline_notes || timelineItems.length > 0), true),
          ...checklistItemsForSection(checklistItems, "Timeline"),
        ],
      },
      {
        title: "Music Preferences",
        description: "Requested vibe, clean/explicit preference, and general music notes.",
        empty: "No music preferences recorded.",
        rows: [
          ["Music notes", musicNotes.music_preference_summary || event.music_preferences],
          ["Clean/explicit", formatStatus(musicNotes.clean_or_explicit_preference || checklist?.clean_or_explicit_preference)],
          ["Crowd type", checklist?.crowd_type],
          ["Event vibe", checklist?.event_vibe],
        ],
        items: [
          prepItem("music-preferences", "Review music preferences", Boolean(musicNotes.music_preference_summary || event.music_preferences), false),
          prepItem("music-clean", "Confirm clean or explicit preference", Boolean(musicNotes.clean_or_explicit_preference || checklist?.clean_or_explicit_preference), false),
          ...checklistItemsForSection(checklistItems, "Music"),
        ],
      },
      {
        title: "Must-Play / Do-Not-Play",
        description: "Song guardrails and special requests.",
        empty: "No must-play or do-not-play songs recorded.",
        rows: [
          ["Must-play", musicNotes.must_play_notes],
          ["Do-not-play", musicNotes.do_not_play_notes],
          ["Special songs", musicNotes.special_songs_notes],
        ],
        items: [
          prepItem("music-must-play", "Review must-play list", Boolean(musicNotes.must_play_notes), false),
          prepItem("music-do-not-play", "Review do-not-play list", Boolean(musicNotes.do_not_play_notes), false),
        ],
      },
      {
        title: "Gear Loadout",
        description: "Gear to pack, load, set up, and return.",
        empty: "No gear/loadout checklist recorded.",
        rows: gearItems.map((item) => [
          item.gear_name || "Gear item",
          [item.quantity ? `Qty ${item.quantity}` : "", formatStatus(item.status), item.notes].filter(Boolean).join(" / "),
        ]),
        items: [
          prepItem("gear-list", "Prepare gear list", gearItems.length > 0, true),
          ...gearItems.map((item, index) => prepItem(`gear-${item.id || index}`, item.gear_name || "Gear item", ["packed", "loaded", "set_up", "returned", "not_applicable"].includes(item.status), false)),
          ...checklistItemsForSection(checklistItems, "Gear"),
        ],
      },
      {
        title: "Mic & Announcements",
        description: "Microphone needs, announcement notes, and MC cues.",
        empty: "No mic or announcement notes recorded.",
        rows: [
          ["Announcements", musicNotes.announcements_notes],
          ["Setup notes", event.setup_notes],
        ],
        items: [
          prepItem("announcements", "Review mic and announcements", Boolean(musicNotes.announcements_notes || event.setup_notes), false),
        ],
      },
      {
        title: "Payment / Balance",
        description: "Admin readiness only. No card data or processor actions happen here.",
        empty: "No invoice or payment record connected yet.",
        rows: [
          ["Invoice", invoice?.invoice_number],
          ["Invoice status", invoice?.status ? createBadge(invoice.status) : ""],
          ["Deposit", invoice ? `${formatMoney(invoice.deposit_paid_cents)} of ${formatMoney(invoice.deposit_cents)}` : ""],
          ["Balance due", invoice?.balance_due_cents !== undefined ? formatMoney(invoice.balance_due_cents) : ""],
          ["Latest payment", payment ? [formatMoney(payment.amount_cents), formatStatus(payment.status)].filter(Boolean).join(" / ") : ""],
        ],
        items: [
          prepItem("payment-deposit", "Check deposit status", Boolean(invoice && Number(invoice.deposit_paid_cents || 0) >= Number(invoice.deposit_cents || 0)), true),
          prepItem("payment-balance", "Review balance due", Boolean(invoice && Number(invoice.balance_due_cents || 0) <= 0), true),
          ...checklistItemsForSection(checklistItems, "Payments"),
        ],
      },
      {
        title: "Contract",
        description: "Contract readiness snapshot when records exist.",
        empty: "No contract recorded.",
        rows: [
          ["Contract status", checklist?.contract_status_snapshot ? createBadge(checklist.contract_status_snapshot) : "No contract recorded"],
        ],
        items: [
          prepItem("contract-status", "Check contract status", Boolean(checklist?.contract_status_snapshot && !["not_started", "needs_review"].includes(checklist.contract_status_snapshot)), true),
          ...checklistItemsForSection(checklistItems, "Contract"),
        ],
      },
      {
        title: "Final Confirmation",
        description: "Final admin readiness before event day.",
        empty: "No final confirmation recorded.",
        rows: [
          ["Final confirmation", checklist?.final_confirmation_status ? createBadge(checklist.final_confirmation_status) : "Not started"],
        ],
        items: [
          prepItem("final-confirmation", "Send or record final confirmation", ["confirmed", "completed", "not_applicable"].includes(checklist?.final_confirmation_status), true),
          ...checklistItemsForSection(checklistItems, "Final Confirmation"),
        ],
      },
      {
        title: "Internal Notes",
        description: "Private preparation notes for owner/admin only.",
        empty: "No private prep notes recorded.",
        rows: [
          ["Internal prep notes", checklist?.internal_notes || event.internal_notes],
          ["Event notes", event.notes],
        ],
        items: [
          prepItem("internal-review", "Review private internal notes", Boolean(checklist?.internal_notes || event.internal_notes || event.notes), false),
          ...checklistItemsForSection(checklistItems, "Internal Notes"),
        ],
      },
    ];
  }

  function prepItem(key, title, defaultComplete = false, required = false) {
    return { key, title, defaultComplete, required };
  }

  function checklistItemsForSection(items, section) {
    return items
      .filter((item) => item.section === section)
      .map((item) => prepItem(`api-${item.id || item.title}`, item.title || "Checklist item", item.status === "completed" || item.completed_at, Boolean(item.is_required)));
  }

  function createPrepSummary(event, progress) {
    const summary = document.createElement("article");
    summary.className = "admin-panel admin-prep-summary";

    const heading = document.createElement("div");
    heading.className = "admin-prep-summary-main";
    const text = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = event.title || "Untitled event";
    const meta = document.createElement("p");
    meta.textContent = [
      formatDate(event.event_date),
      formatTimeRange(event.start_time, event.end_time),
      event.venue_name || event.location,
    ].filter(Boolean).join(" / ") || "Event details pending";
    text.append(title, meta);
    heading.append(text, createBadge(progress.status));

    const barWrap = document.createElement("div");
    barWrap.className = "admin-prep-progress";
    const bar = document.createElement("span");
    bar.style.width = `${progress.percent}%`;
    barWrap.append(bar);

    const stats = document.createElement("div");
    stats.className = "admin-prep-stats";
    [
      ["Progress", `${progress.percent}%`],
      ["Completed", `${formatNumber(progress.completed)} of ${formatNumber(progress.total)}`],
      ["Required left", formatNumber(progress.requiredRemaining)],
    ].forEach(([label, value]) => {
      const item = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = value;
      item.append(document.createTextNode(label), strong);
      stats.append(item);
    });

    summary.append(heading, barWrap, stats);
    return summary;
  }

  function createPrepSectionCard(event, section) {
    const card = document.createElement("article");
    card.className = "admin-panel admin-prep-section";

    const heading = document.createElement("div");
    heading.className = "admin-panel-heading";
    const headingText = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = section.title;
    const description = document.createElement("p");
    description.textContent = section.description;
    headingText.append(title, description);
    heading.append(headingText, createBadge(sectionStatus(event, section)));

    const body = document.createElement("div");
    body.className = "admin-prep-section-body";

    const rows = section.rows.filter(([, value]) => hasPrepValue(value));
    if (rows.length > 0) {
      const dl = document.createElement("dl");
      dl.className = "admin-details-list";
      rows.forEach(([label, value]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = label;
        appendCellValue(dd, value);
        row.append(dt, dd);
        dl.append(row);
      });
      body.append(dl);
    } else {
      body.append(createInlineEmpty(section.empty || "No details recorded yet."));
    }

    const checklist = document.createElement("div");
    checklist.className = "admin-prep-checklist";
    section.items.forEach((item) => {
      checklist.append(createPrepToggle(event, section, item));
    });
    body.append(checklist);

    card.append(heading, body);
    return card;
  }

  function createPrepToggle(event, section, item) {
    const id = `prep-${event.id}-${normalizeStatus(section.title)}-${normalizeStatus(item.key)}`;
    const label = document.createElement("label");
    label.className = "admin-prep-check";
    if (item.required) label.dataset.required = "true";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = isPrepItemComplete(event, section, item);
    input.addEventListener("change", () => {
      setPrepItemComplete(event, section, item, input.checked);
      renderEventPrepChecklist();
    });

    const text = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const meta = document.createElement("small");
    meta.textContent = item.required ? "Required" : "Optional";
    text.append(title, meta);
    label.append(input, text);
    return label;
  }

  function calculatePrepProgress(event, sections) {
    const items = sections.flatMap((section) => section.items.map((item) => ({ section, item })));
    const total = items.length;
    const completed = items.filter(({ section, item }) => isPrepItemComplete(event, section, item)).length;
    const requiredRemaining = items.filter(({ section, item }) => item.required && !isPrepItemComplete(event, section, item)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const status = requiredRemaining === 0 && total > 0
      ? percent === 100 ? "completed" : "ready"
      : completed > 0 ? "in_progress" : "not_started";
    return { total, completed, requiredRemaining, percent, status };
  }

  function sectionStatus(event, section) {
    const total = section.items.length;
    const completed = section.items.filter((item) => isPrepItemComplete(event, section, item)).length;
    if (total > 0 && completed === total) return "completed";
    if (completed > 0) return "in_progress";
    return PREP_REQUIRED_SECTIONS.has(section.title) ? "needs_review" : "not_started";
  }

  function isPrepItemComplete(event, section, item) {
    const override = getPrepOverrides(event.id)[prepStorageKey(section, item)];
    return override === undefined ? Boolean(item.defaultComplete) : Boolean(override);
  }

  function setPrepItemComplete(event, section, item, isComplete) {
    const overrides = getPrepOverrides(event.id);
    overrides[prepStorageKey(section, item)] = isComplete;
    state.prepCompletion[event.id] = overrides;
    try {
      window.localStorage?.setItem(`${PREP_STORAGE_PREFIX}${event.id}`, JSON.stringify(overrides));
    } catch {
      setStatus("Checklist update kept for this session only.", "error");
    }
  }

  function getPrepOverrides(eventId) {
    if (state.prepCompletion[eventId]) return state.prepCompletion[eventId];
    try {
      state.prepCompletion[eventId] = JSON.parse(window.localStorage?.getItem(`${PREP_STORAGE_PREFIX}${eventId}`) || "{}") || {};
    } catch {
      state.prepCompletion[eventId] = {};
    }
    return state.prepCompletion[eventId];
  }

  function prepStorageKey(section, item) {
    return `${normalizeStatus(section.title)}:${normalizeStatus(item.key || item.title)}`;
  }

  function hasPrepValue(value) {
    if (value instanceof Node) return true;
    if (Array.isArray(value)) return value.some(Boolean);
    return value !== null && value !== undefined && value !== "";
  }

  function createInlineEmpty(message) {
    const empty = document.createElement("p");
    empty.className = "admin-inline-empty";
    empty.textContent = message;
    return empty;
  }

  function createPrepNotice(titleText, bodyText) {
    const notice = document.createElement("article");
    notice.className = "admin-panel admin-prep-notice";
    const title = document.createElement("strong");
    title.textContent = titleText;
    const body = document.createElement("span");
    body.textContent = bodyText;
    notice.append(title, body);
    return notice;
  }

  function findRelatedClient(event) {
    const clientId = event.client_id || event.clientId;
    if (!clientId) return null;
    return (state.records.clients || []).find((client) => String(client.id) === String(clientId)) || null;
  }

  function findRelatedVenue(event) {
    const venueId = event.venue_id || event.venueId;
    if (!venueId) return null;
    return (state.records.venues || []).find((venue) => String(venue.id) === String(venueId)) || null;
  }

  function findRelatedInvoice(event) {
    return (state.records.invoices || []).find((invoice) => {
      const invoiceEvent = firstRelation(invoice.events);
      return String(invoice.event_id || invoiceEvent?.id || "") === String(event.id);
    }) || null;
  }

  function findRelatedPayment(invoice) {
    if (!invoice) return null;
    return (state.records.payments || []).find((payment) => {
      const paymentInvoice = firstRelation(payment.invoices);
      return String(payment.invoice_id || paymentInvoice?.id || "") === String(invoice.id);
    }) || null;
  }

  function getPrepItems(checklist) {
    return asArray(checklist?.items || checklist?.event_prep_items || checklist?.checklist_items);
  }

  function getPrepGearItems(checklist) {
    return asArray(checklist?.gear_items || checklist?.event_gear_items);
  }

  function getPrepTimelineItems(checklist) {
    return asArray(checklist?.timeline_items || checklist?.event_timeline_items);
  }

  function getPrepMusicNotes(checklist) {
    return firstRelation(checklist?.music_notes || checklist?.event_music_notes) || {};
  }

  function asArray(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function renderRecordSection(key) {
    const sectionConfig = sectionConfigs[key];
    const records = state.records[key] || [];
    const filtered = filterRecords(key, records);
    const selected = selectRecordForSection(key, filtered);

    if (key === "venues" || key === "media") {
      renderCards(key, filtered, sectionConfig, selected);
    } else {
      renderTable(key, filtered, sectionConfig, selected);
    }
    renderDetail(key, selected, sectionConfig);
  }

  function filterRecords(key, records) {
    const sectionConfig = sectionConfigs[key];
    const filters = state.filters[key] || {};
    const query = filters.search || "";
    const status = filters.status || "all";

    return records.filter((item) => {
      const statusMatches = sectionConfig.matchStatus
        ? sectionConfig.matchStatus(item, status)
        : status === "all" || sectionConfig.status(item) === status;
      if (!statusMatches) return false;
      if (!query) return true;
      return sectionConfig.search(item).filter(Boolean).join(" ").toLowerCase().includes(query);
    });
  }

  function selectRecordForSection(key, filtered) {
    const current = filtered.find((item) => item.id === state.selected[key]);
    const selected = current || filtered[0] || null;
    state.selected[key] = selected?.id || null;
    return selected;
  }

  function renderTable(key, items, sectionConfig, selected) {
    const head = document.querySelector(`[data-table-head="${key}"]`);
    const body = document.querySelector(`[data-table="${key}"]`);
    if (!head || !body) return;

    head.textContent = "";
    body.textContent = "";

    const headerRow = document.createElement("tr");
    sectionConfig.columns.forEach(([label]) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      headerRow.append(th);
    });
    head.append(headerRow);

    if (state.errors[key]) {
      appendTableMessage(body, sectionConfig.columns.length, state.errors[key]);
      return;
    }

    if (items.length === 0) {
      appendTableMessage(body, sectionConfig.columns.length, sectionConfig.empty);
      return;
    }

    items.forEach((item) => {
      const row = document.createElement("tr");
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", `View ${sectionConfig.title(item)}`);
      if (item.id === selected?.id) row.classList.add("is-selected");

      row.addEventListener("click", () => {
        state.selected[key] = item.id;
        renderRecordSection(key);
      });
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          state.selected[key] = item.id;
          renderRecordSection(key);
        }
      });

      sectionConfig.columns.forEach(([, getValue]) => {
        const td = document.createElement("td");
        appendCellValue(td, getValue(item));
        row.append(td);
      });
      body.append(row);
    });
  }

  function renderCards(key, items, sectionConfig, selected) {
    const grid = document.querySelector(`[data-card-list="${key}"]`);
    if (!grid) return;
    grid.textContent = "";

    if (state.errors[key]) {
      grid.append(createEmptyCard(state.errors[key]));
      return;
    }

    if (items.length === 0) {
      grid.append(createEmptyCard(sectionConfig.empty));
      renderDetail(key, null, sectionConfig);
      return;
    }

    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-record-card";
      if (item.id === selected?.id) button.classList.add("is-selected");
      button.addEventListener("click", () => {
        state.selected[key] = item.id;
        renderRecordSection(key);
      });

      if (key === "media") {
        const media = document.createElement("span");
        media.className = "admin-media-thumb";
        const thumbUrl = item.thumbnail_url || (item.media_type === "image" ? item.url : "");
        if (thumbUrl) {
          const img = document.createElement("img");
          img.src = thumbUrl;
          img.alt = item.alt_text || item.title || "Media item";
          img.loading = "lazy";
          media.append(img);
        } else {
          media.textContent = formatStatus(item.media_type || "media");
        }
        button.append(media);
      }

      const heading = document.createElement("strong");
      heading.textContent = sectionConfig.title(item);
      const meta = document.createElement("span");
      meta.textContent = sectionConfig.subtitle(item) || "Details pending";
      button.append(heading, meta, createBadge(sectionConfig.status(item)));
      grid.append(button);
    });
  }

  function renderDetail(key, item, sectionConfig) {
    const detail = document.querySelector(`[data-detail="${key}"]`);
    if (!detail) return;
    detail.textContent = "";

    if (!item) {
      detail.append(createEmptyCard(sectionConfig.empty));
      return;
    }

    const header = document.createElement("div");
    header.className = "admin-detail-heading";
    const headingWrap = document.createElement("div");
    const eyebrow = document.createElement("span");
    eyebrow.className = "admin-detail-eyebrow";
    eyebrow.textContent = formatStatus(key);
    const title = document.createElement("h3");
    title.textContent = sectionConfig.title(item);
    const subtitle = document.createElement("p");
    subtitle.textContent = sectionConfig.subtitle(item) || "Details pending";
    headingWrap.append(eyebrow, title, subtitle);
    header.append(headingWrap, createBadge(sectionConfig.status(item)));

    const list = document.createElement("dl");
    list.className = "admin-details-list";
    sectionConfig.details(item).forEach(([label, value]) => {
      if (value === null || value === undefined || value === "") return;
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      appendCellValue(dd, value);
      row.append(dt, dd);
      list.append(row);
    });

    const actions = createDetailActions(key, item);
    detail.append(header, list);
    if (actions) detail.append(actions);
  }

  function createDetailActions(key, item) {
    if (key === "booking-inquiries") return createBookingReviewActions(item);
    if (key === "events") return createEventPrepActions(item);
    if (key === "payments") return createPaymentStatusActions(item);
    return null;
  }

  function createEventPrepActions(item) {
    const panel = document.createElement("div");
    panel.className = "admin-action-panel";

    const heading = document.createElement("h4");
    heading.textContent = "Event Prep";
    const help = document.createElement("p");
    help.textContent = "Open the private prep checklist for venue, music, gear, payment, contract, and final confirmation review.";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-secondary";
    button.textContent = "Open Prep Checklist";
    button.addEventListener("click", () => {
      state.selected["event-prep"] = item.id;
      renderEventPrepChecklist();
      showSection("event-prep");
      document.querySelector("[data-event-prep-root]")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    panel.append(heading, help, button);
    return panel;
  }

  function createBookingReviewActions(item) {
    const form = document.createElement("form");
    form.className = "admin-action-panel";
    form.noValidate = true;

    const heading = document.createElement("h4");
    heading.textContent = "Admin Review";
    const help = document.createElement("p");
    help.textContent = "Move the inquiry through the booking pipeline and keep private admin notes attached to the lead.";

    const statusField = createSelectField(
      "Status",
      "status",
      bookingStatusOptions(item.status || "new"),
      item.status || "new",
    );
    const notesField = createTextareaField("Internal notes", "internalNotes", item.internal_notes || "");
    const actions = createActionRow("Save Review");
    const button = actions.querySelector("button");
    const message = actions.querySelector("[data-action-status]");

    form.append(heading, help, statusField, notesField, actions);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!item.id) return;

      const body = {
        status: formValue(form, "status"),
        internalNotes: formValue(form, "internalNotes").trim() || null,
      };
      await submitAdminAction({
        button,
        message,
        path: `/admin/booking-inquiries/${item.id}/status`,
        body,
        sectionKey: "booking-inquiries",
        successMessage: "Booking inquiry updated.",
      });
    });

    return form;
  }

  function createPaymentStatusActions(item) {
    const form = document.createElement("form");
    form.className = "admin-action-panel";
    form.noValidate = true;

    const heading = document.createElement("h4");
    heading.textContent = "Payment Review";
    const help = document.createElement("p");
    help.textContent = "Update payment state after confirming the processor record. Project Neo stores references only, never card data.";

    const statusField = createSelectField("Status", "status", PAYMENT_STATUS_OPTIONS, item.status || "pending");
    const dateField = createInputField("Payment date", "paymentDate", "date", item.payment_date || "");
    const actions = createActionRow("Update Payment");
    const button = actions.querySelector("button");
    const message = actions.querySelector("[data-action-status]");

    form.append(heading, help, statusField, dateField, actions);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!item.id) return;

      const body = { status: formValue(form, "status") };
      const paymentDate = formValue(form, "paymentDate");
      if (paymentDate) body.paymentDate = paymentDate;
      await submitAdminAction({
        button,
        message,
        path: `/admin/payments/${item.id}/status`,
        body,
        sectionKey: "payments",
        successMessage: "Payment status updated.",
      });
    });

    return form;
  }

  function bookingStatusOptions(currentStatus) {
    return [...new Set([currentStatus, ...(BOOKING_STATUS_FLOW[currentStatus] || [])])];
  }

  function formValue(form, name) {
    const field = form.elements.namedItem(name);
    return field && "value" in field ? String(field.value || "") : "";
  }

  function createSelectField(label, name, options, selectedValue) {
    const field = document.createElement("label");
    field.className = "admin-filter-field";
    const labelText = document.createElement("span");
    labelText.textContent = label;
    const select = document.createElement("select");
    select.name = name;
    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = formatStatus(value);
      option.selected = value === selectedValue;
      select.append(option);
    });
    field.append(labelText, select);
    return field;
  }

  function createInputField(label, name, type, value = "") {
    const field = document.createElement("label");
    field.className = "admin-filter-field";
    const labelText = document.createElement("span");
    labelText.textContent = label;
    const input = document.createElement("input");
    input.name = name;
    input.type = type;
    input.value = value;
    field.append(labelText, input);
    return field;
  }

  function createTextareaField(label, name, value = "") {
    const field = document.createElement("label");
    field.className = "admin-filter-field";
    const labelText = document.createElement("span");
    labelText.textContent = label;
    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.rows = 4;
    textarea.value = value;
    field.append(labelText, textarea);
    return field;
  }

  function createActionRow(buttonText) {
    const actions = document.createElement("div");
    actions.className = "admin-form-actions";
    const button = document.createElement("button");
    button.className = "btn-secondary";
    button.type = "submit";
    button.textContent = buttonText;
    const message = document.createElement("p");
    message.className = "admin-inline-status";
    message.dataset.actionStatus = "";
    message.setAttribute("aria-live", "polite");
    actions.append(button, message);
    return actions;
  }

  async function submitAdminAction({ button, message, path, body, sectionKey, successMessage }) {
    try {
      if (!state.session) throw new Error("Admin session is not ready.");
      setButtonBusy(button, true);
      if (message) {
        message.textContent = "Saving...";
        message.dataset.status = "";
      }

      await adminFetch(path, state.session, {
        method: "PATCH",
        body,
      });
      await loadAdminData(state.session);
      renderDashboard();
      showSection(sectionKey);
      setStatus(successMessage, "success");
    } catch (error) {
      if (message) {
        message.textContent = error.message || "Could not save admin update.";
        message.dataset.status = "error";
      }
      setStatus(error.message || "Could not save admin update.", "error");
    } finally {
      setButtonBusy(button, false);
    }
  }

  function renderList(selector, items, mapItem) {
    const list = document.querySelector(selector);
    if (!list) return;
    list.textContent = "";

    if (items.length === 0) {
      const empty = document.createElement("li");
      empty.className = "admin-empty";
      empty.textContent = "Nothing here yet.";
      list.append(empty);
      return;
    }

    items.forEach((item) => {
      const view = mapItem(item);
      const li = document.createElement("li");
      const textWrap = document.createElement("div");
      const title = document.createElement("strong");
      const meta = document.createElement("span");

      title.textContent = view.title;
      meta.textContent = view.meta || "Details pending";
      textWrap.append(title, meta);
      li.append(textWrap, view.badge instanceof Node ? view.badge : createBadge(view.badge || "open"));
      list.append(li);
    });
  }

  function appendTableMessage(body, colSpan, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "admin-empty-row";
    cell.colSpan = colSpan;
    cell.textContent = message;
    row.append(cell);
    body.append(row);
  }

  function createEmptyCard(message) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-card";
    empty.textContent = message;
    return empty;
  }

  function appendCellValue(element, value) {
    if (value instanceof Node) {
      element.append(value);
      return;
    }

    if (value && typeof value === "object" && value.url) {
      const link = document.createElement("a");
      link.href = value.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = value.label || value.url;
      element.append(link);
      return;
    }

    element.textContent = value ?? "";
  }

  function createBadge(status) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.dataset.status = normalizeStatus(status || "open");
    badge.textContent = formatStatus(status || "open");
    return badge;
  }

  function createConflictBadge(conflicts) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.dataset.status = conflicts.length > 0 ? "conflict" : "clear";
    badge.textContent = conflicts.length > 0 ? `${formatNumber(conflicts.length)} ${conflicts.length === 1 ? "Conflict" : "Conflicts"}` : "Clear";
    return badge;
  }

  function createConflictList(conflicts) {
    const wrap = document.createElement("span");
    wrap.className = "admin-conflict-stack";

    if (conflicts.length === 0) {
      wrap.textContent = "No conflicts detected.";
      return wrap;
    }

    conflicts.forEach((conflict) => {
      const item = document.createElement("span");
      item.className = "admin-conflict-item";
      const title = document.createElement("strong");
      const meta = document.createElement("small");
      title.textContent = conflict.title;
      meta.textContent = [formatStatus(conflict.type), conflict.window, formatStatus(conflict.status)].filter(Boolean).join(" / ");
      item.append(title, meta);
      wrap.append(item);
    });

    return wrap;
  }

  function getAvailabilityConflicts(type, item) {
    const target = getAvailabilityWindow(type, item);
    const conflicts = getApiConflictWarnings(item);
    const seen = new Set(conflicts.map((conflict) => `${conflict.type}:${conflict.id || conflict.title}:${conflict.window}`));
    const addConflict = (conflict) => {
      const key = `${conflict.type}:${conflict.id || conflict.title}:${conflict.window}`;
      if (seen.has(key)) return;
      seen.add(key);
      conflicts.push(conflict);
    };
    if (!target) return conflicts;

    (state.records.events || []).forEach((event) => {
      if (type === "event" && event.id === item.id) return;
      if (!BLOCKING_EVENT_STATUSES.has(eventStatus(event))) return;
      const candidate = getAvailabilityWindow("event", event);
      if (!candidate || !windowsOverlap(target, candidate)) return;
      addConflict({
        id: event.id,
        type: "event",
        title: event.title || "Untitled event",
        status: eventStatus(event),
        window: formatAvailabilityWindow(event, "event"),
      });
    });

    (state.records.availability || []).forEach((block) => {
      if (type === "block" && block.id === item.id) return;
      const candidate = getAvailabilityWindow("block", block);
      if (!candidate || !windowsOverlap(target, candidate)) return;
      addConflict({
        id: block.id,
        type: "availability block",
        title: block.title || "Availability block",
        status: block.block_type || block.status || "unavailable",
        window: formatAvailabilityWindow(block, "block"),
      });
    });

    return conflicts;
  }

  function getApiConflictWarnings(item) {
    const warnings = Array.isArray(item?.conflict_warnings) ? item.conflict_warnings : [];
    return warnings.map((conflict) => {
      const type = String(conflict.type || "conflict").replace(/_/g, " ");
      const startAt = conflict.startAt || conflict.start_at;
      const endAt = conflict.endAt || conflict.end_at;
      const eventDate = conflict.eventDate || conflict.event_date;
      const startTime = conflict.startTime || conflict.start_time;
      const endTime = conflict.endTime || conflict.end_time;
      const window = startAt && endAt
        ? formatDateTimeRange(startAt, endAt, false)
        : [formatDate(eventDate), formatTimeRange(startTime, endTime)].filter(Boolean).join(" / ");

      return {
        id: conflict.id,
        type,
        title: conflict.title || (type === "event" ? "Event" : "Availability block"),
        status: conflict.status || "conflict",
        window,
      };
    });
  }

  function getAvailabilityWindow(type, item) {
    if (!item) return null;
    const startAt = parseDateTime(item.start_at);
    const endAt = parseDateTime(item.end_at);
    if (startAt && endAt && endAt > startAt) {
      return { start: startAt, end: endAt };
    }

    if (type !== "event" || !item.event_date) return null;
    const start = parseLocalDateTime(item.event_date, item.start_time || "00:00");
    if (!start) return null;

    let end = item.end_time
      ? parseLocalDateTime(item.event_date, item.end_time)
      : item.start_time
        ? new Date(start.getTime() + 2 * 60 * 60 * 1000)
        : parseLocalDateTime(item.event_date, "23:59");

    if (!end) return null;
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }

  function windowsOverlap(a, b) {
    return a.start < b.end && b.start < a.end;
  }

  function formatAvailabilityWindow(item, type) {
    if (!item) return "";
    if (type === "block") return formatDateTimeRange(item.start_at, item.end_at, item.all_day);
    if (item.start_at && item.end_at) return formatDateTimeRange(item.start_at, item.end_at, false);
    return [formatDate(item.event_date), formatTimeRange(item.start_time, item.end_time)].filter(Boolean).join(" / ");
  }

  function formatRequestedWindow(item) {
    if (item?.requested_start_at && item?.requested_end_at) {
      return formatDateTimeRange(item.requested_start_at, item.requested_end_at, false);
    }
    return [formatDate(item?.event_date), formatTimeRange(item?.start_time, item?.end_time)].filter(Boolean).join(" / ");
  }

  function eventStatus(item) {
    return normalizeLegacyEventStatus(item?.status || "pending");
  }

  function normalizeLegacyEventStatus(status) {
    return status === "tentative" ? "pending" : status;
  }

  function firstRelation(value) {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value ?? "";
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(cents || 0) / 100);
  }

  function formatDate(value) {
    const date = parseLocalDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatDateTimeRange(startValue, endValue, allDay = false) {
    const start = formatDateTime(startValue);
    const end = formatDateTime(endValue);
    if (!start && !end) return "";
    const range = [start, end].filter(Boolean).join(" to ");
    return allDay ? `${range} / All day` : range;
  }

  function formatTime(value) {
    if (!value) return "";
    const [hours, minutes] = String(value).split(":").map((part) => Number.parseInt(part, 10));
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
      new Date(2026, 0, 1, hours, minutes)
    );
  }

  function formatTimeRange(startTime, endTime) {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    if (start && end) return `${start}-${end}${endsNextDay(startTime, endTime) ? " next day" : ""}`;
    return start || end;
  }

  function endsNextDay(startTime, endTime) {
    const start = minutesFromTime(startTime);
    const end = minutesFromTime(endTime);
    return start !== null && end !== null && end <= start;
  }

  function minutesFromTime(value) {
    if (!value) return null;
    const [hours, minutes] = String(value).split(":").map((part) => Number.parseInt(part, 10));
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    return hours * 60 + minutes;
  }

  function formatTags(value) {
    return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
  }

  function formatStatus(value) {
    if (!value) return "";
    return String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function normalizeStatus(value) {
    return String(value || "open").toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function parseDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function parseLocalDateTime(dateValue, timeValue) {
    if (!dateValue || !timeValue) return null;
    const normalizedTime = String(timeValue).slice(0, 5);
    const date = new Date(`${dateValue}T${normalizedTime}`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  if (page === "login") initLogin();
  if (page === "dashboard") initDashboard();
})();
