(() => {
  const page = document.body.dataset.adminPage;
  if (!page) return;

  const config = window.ProjectNeoConfig || {};
  const apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl);
  const supabaseUrl = normalizeBaseUrl(config.supabaseUrl);
  const supabaseKey = config.supabasePublishableKey || config.supabaseAnonKey || "";
  const statusEl = document.querySelector("[data-admin-status]");
  let supabaseClient = null;

  const state = {
    session: null,
    profile: null,
    summary: {},
    records: {},
    errors: {},
    filters: {},
    selected: {},
    activeSection: "overview",
  };

  const endpoints = [
    ["booking-inquiries", "/admin/booking-inquiries?limit=50"],
    ["clients", "/admin/clients?limit=50"],
    ["events", "/admin/events?limit=75"],
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
        ];
      },
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
    if (!apiBaseUrl || !supabaseUrl || !supabaseKey || !window.supabase?.createClient) {
      setStatus("Project Neo admin configuration is missing.", "error");
      return false;
    }
    return true;
  }

  function getSupabaseClient() {
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
  }

  async function getSession() {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function adminFetch(path, session) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
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

  function getSafeReturnPath() {
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
    const currentPage = `${window.location.pathname.split("/").pop() || "admin-dashboard.html"}${window.location.search}`;
    return `admin-login.html?returnTo=${encodeURIComponent(currentPage)}`;
  }

  async function signOutAndRedirect() {
    await getSupabaseClient().auth.signOut();
    window.location.replace(getLoginUrl());
  }

  function setButtonBusy(button, isBusy) {
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
  }

  async function initLogin() {
    if (!requireConfig()) return;

    const form = document.querySelector("[data-admin-login-form]");
    const submitButton = form?.querySelector("button[type='submit']");

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

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;

      if (!email || !password) {
        setStatus("Email and password are required.", "error");
        return;
      }

      try {
        setButtonBusy(submitButton, true);
        setStatus("Signing in...");
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
        if (error) throw error;

        const session = data.session || await getSession();
        if (!session) throw new Error("Could not start an admin session.");

        await adminFetch("/admin/me", session);
        window.location.assign(getSafeReturnPath());
      } catch (error) {
        await getSupabaseClient().auth.signOut();
        setStatus(error.status === 403 ? "This account does not have Project Neo admin access." : "Sign in failed.", "error");
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  async function initDashboard() {
    if (!requireConfig()) return;

    setupNavigation();
    setupRecordControls();

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
    showSection(state.activeSection);
  }

  function renderProfile(profile) {
    setText("[data-admin-email]", profile.email || "Project Neo user");
    setText("[data-admin-role]", profile.role || "staff");
    setText("[data-settings='email']", profile.email || "Project Neo user");
    setText("[data-settings='role']", formatStatus(profile.role || "staff"));
    setText("[data-settings='api']", apiBaseUrl ? "Configured" : "Missing");
    setText("[data-settings='supabase']", supabaseUrl ? "Configured" : "Missing");

    const account = document.querySelector("[data-admin-account]");
    if (account) account.hidden = false;
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

  }

  function setupNavigation() {
    document.querySelectorAll("[data-admin-nav]").forEach((button) => {
      button.addEventListener("click", () => showSection(button.dataset.adminNav));
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

    detail.append(header, list);
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
      li.append(textWrap, createBadge(view.badge || "open"));
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
    if (start && end) return `${start}-${end}`;
    return start || end;
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

  if (page === "login") initLogin();
  if (page === "dashboard") initDashboard();
})();
