(() => {
  const page = document.body.dataset.portalPage;
  if (!page) return;

  const config = window.ProjectNeoConfig || {};
  const apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl);
  const supabaseUrl = normalizeBaseUrl(config.supabaseUrl);
  const supabaseKey = config.supabasePublishableKey || config.supabaseAnonKey || "";
  const statusEl = document.querySelector("[data-portal-status]");
  const authPanel = document.querySelector("[data-portal-auth]");
  const shell = document.querySelector("[data-portal-shell]");
  const contactEmail = "info@tookoldweb.com";
  let supabaseClient = null;

  const state = {
    session: null,
    selectedEventId: null,
    data: {
      client: null,
      events: [],
      invoices: [],
      contracts: [],
      notes: [],
      songRequests: [],
    },
  };

  function normalizeBaseUrl(value) {
    return typeof value === "string" ? value.replace(/\/+$/, "") : "";
  }

  function requireConfig() {
    if (!apiBaseUrl || !supabaseUrl || !supabaseKey || !window.supabase?.createClient) {
      setStatus("Project Neo client portal configuration is missing.", "error");
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

  async function portalFetch(path, options = {}) {
    const session = state.session || await getSession();
    if (!session) {
      const error = new Error("Client portal sign in is required.");
      error.status = 401;
      throw error;
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
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

  function setStatus(message, statusState = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = statusState ? `admin-status portal-status ${statusState}` : "admin-status portal-status";
  }

  function setInlineStatus(selector, message, statusState = "") {
    const el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el) return;
    el.textContent = message;
    el.className = statusState ? `portal-inline-status ${statusState}` : "portal-inline-status";
  }

  function setButtonBusy(button, isBusy) {
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
  }

  function showAuth() {
    if (authPanel) authPanel.hidden = false;
    if (shell) shell.hidden = true;
  }

  function showShell() {
    if (authPanel) authPanel.hidden = true;
    if (shell) shell.hidden = false;
  }

  async function signOut() {
    await getSupabaseClient().auth.signOut();
    state.session = null;
    state.selectedEventId = null;
    showAuth();
    setStatus("");
  }

  async function initPortal() {
    if (!requireConfig()) return;

    setupLogin();
    setupEventPicker();
    setupSongForm();
    document.querySelector("[data-portal-signout]")?.addEventListener("click", signOut);

    try {
      const session = await getSession();
      if (!session) {
        showAuth();
        return;
      }
      state.session = session;
      await loadPortal();
    } catch (error) {
      console.error(error);
      await getSupabaseClient().auth.signOut();
      showAuth();
      setStatus("Sign in to open your client portal.", "error");
    }
  }

  function setupLogin() {
    const form = document.querySelector("[data-portal-login-form]");
    const submitButton = form?.querySelector("button[type='submit']");
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
        state.session = data.session || await getSession();
        if (!state.session) throw new Error("Could not start a client portal session.");
        await loadPortal();
      } catch (error) {
        console.error(error);
        await getSupabaseClient().auth.signOut();
        setStatus(error.status === 403 ? "This account is not connected to a client portal." : "Sign in failed.", "error");
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  function setupEventPicker() {
    document.querySelector("[data-event-select]")?.addEventListener("change", (event) => {
      state.selectedEventId = event.target.value || null;
      renderPortal();
    });
  }

  function setupSongForm() {
    const form = document.querySelector("[data-song-form]");
    const cancelButton = document.querySelector("[data-song-cancel]");

    cancelButton?.addEventListener("click", () => resetSongForm());

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const selectedEvent = getSelectedEvent();
      if (!selectedEvent) {
        setInlineStatus("[data-song-status]", "Choose an event before adding a song.", "error");
        return;
      }

      const songTitle = form.songTitle.value.trim();
      if (!songTitle) {
        setInlineStatus("[data-song-status]", "Song title is required.", "error");
        return;
      }

      const songRequestId = form.songRequestId.value;
      const body = {
        eventId: selectedEvent.id,
        songTitle,
        artist: form.artist.value.trim(),
        dedication: form.dedication.value.trim(),
        notes: form.notes.value.trim(),
        isMustPlay: form.isMustPlay.checked,
      };
      const submitButton = form.querySelector("[data-song-submit]");

      try {
        setButtonBusy(submitButton, true);
        setInlineStatus("[data-song-status]", songRequestId ? "Updating song..." : "Adding song...");
        const saved = await portalFetch(
          songRequestId ? `/portal/song-requests/${songRequestId}` : "/portal/song-requests",
          {
            method: songRequestId ? "PATCH" : "POST",
            body,
          },
        );

        if (songRequestId) {
          state.data.songRequests = state.data.songRequests.map((song) => song.id === saved.id ? saved : song);
        } else {
          state.data.songRequests = [...state.data.songRequests, saved];
        }

        resetSongForm();
        renderSongs();
        setInlineStatus("[data-song-status]", songRequestId ? "Song updated." : "Song added.", "success");
      } catch (error) {
        console.error(error);
        setInlineStatus("[data-song-status]", error.message || "Could not save song.", "error");
      } finally {
        setButtonBusy(submitButton, false);
      }
    });
  }

  async function loadPortal() {
    try {
      setStatus("Loading portal...");
      state.session = state.session || await getSession();
      if (!state.session) {
        showAuth();
        return;
      }

      const data = await portalFetch("/portal/summary");
      state.data = {
        client: data.client || null,
        events: Array.isArray(data.events) ? data.events : [],
        invoices: Array.isArray(data.invoices) ? data.invoices : [],
        contracts: Array.isArray(data.contracts) ? data.contracts : [],
        notes: Array.isArray(data.notes) ? data.notes : [],
        songRequests: Array.isArray(data.songRequests) ? data.songRequests : [],
      };
      chooseDefaultEvent();
      renderPortal();
      showShell();
      setStatus("");
    } catch (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        await signOut();
        setStatus(error.status === 403 ? "This account is not connected to a client portal." : "Sign in to continue.", "error");
        return;
      }
      setStatus(error.message || "Could not load the client portal.", "error");
    }
  }

  function chooseDefaultEvent() {
    const events = state.data.events || [];
    if (events.some((event) => event.id === state.selectedEventId)) return;
    const today = startOfToday();
    const upcoming = events.find((event) => {
      const eventDate = parseLocalDate(event.event_date);
      return eventDate && eventDate >= today && event.status !== "cancelled";
    });
    state.selectedEventId = (upcoming || events[0] || {}).id || null;
  }

  function renderPortal() {
    renderClient();
    renderEventPicker();
    renderEventOverview();
    renderTimeline();
    renderInvoice();
    renderContract();
    renderVenue();
    renderSongs();
    renderNotes();
    renderContact();
  }

  function renderClient() {
    const client = state.data.client || {};
    setText("[data-client-name]", firstName(client.fullName) || "client");
    setText("[data-portal-email]", client.email || client.authEmail || "");
    setText("[data-portal-subtitle]", portalSubtitle());
    const account = document.querySelector("[data-portal-account]");
    if (account) account.hidden = false;
  }

  function portalSubtitle() {
    const event = getSelectedEvent();
    if (!event) return "Your DJ Too Kold event details will appear here.";
    return [formatDate(event.event_date), event.venue_name || event.location].filter(Boolean).join(" / ") || "Your event details are ready.";
  }

  function renderEventPicker() {
    const select = document.querySelector("[data-event-select]");
    if (!select) return;
    select.textContent = "";

    if (state.data.events.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No events yet";
      option.value = "";
      select.append(option);
      select.disabled = true;
      return;
    }

    select.disabled = false;
    state.data.events.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = [event.title, formatDate(event.event_date)].filter(Boolean).join(" - ");
      select.append(option);
    });
    select.value = state.selectedEventId || "";
  }

  function renderEventOverview() {
    const event = getSelectedEvent();
    setText("[data-event-title]", event?.title || "Event Details");
    setBadge("[data-event-status]", event?.status || "pending");

    renderDetails("[data-event-details]", event ? [
      ["Date", formatDate(event.event_date)],
      ["Time", formatTimeRange(event.start_time, event.end_time)],
      ["Type", event.event_type],
      ["Venue", event.venue_name || firstRelation(event.venues)?.name],
      ["Location", event.location],
      ["Guests", event.guest_count ? formatNumber(event.guest_count) : ""],
      ["Setup notes", event.setup_notes],
    ] : []);
  }

  function renderTimeline() {
    const event = getSelectedEvent();
    const list = document.querySelector("[data-event-timeline]");
    if (!list) return;
    list.textContent = "";

    if (!event) {
      appendEmptyListItem(list, "No event timeline is available yet.");
      return;
    }

    const lines = String(event.timeline_notes || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const fallback = [
      event.start_time ? `Event starts at ${formatTime(event.start_time)}` : "",
      event.end_time ? `Event ends at ${formatTime(event.end_time)}` : "",
    ].filter(Boolean);
    const items = lines.length > 0 ? lines : fallback;

    if (items.length === 0) {
      appendEmptyListItem(list, "Timeline details are pending.");
      return;
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
  }

  function renderInvoice() {
    const invoice = getSelectedInvoice();
    setBadge("[data-invoice-status]", invoice?.status || "pending");
    renderInvoiceMetrics(invoice);
    renderPaymentActions(invoice);
    renderInvoiceItems(invoice);
    renderPayments(invoice);
  }

  function renderInvoiceMetrics(invoice) {
    const grid = document.querySelector("[data-invoice-metrics]");
    if (!grid) return;
    grid.textContent = "";

    if (!invoice) {
      grid.append(createMetric("Invoice", "Pending"));
      grid.append(createMetric("Balance", "$0"));
      return;
    }

    [
      ["Total", formatMoney(invoice.total_cents)],
      ["Paid", formatMoney(invoice.amount_paid_cents)],
      ["Deposit", `${formatMoney(invoice.deposit_paid_cents)} / ${formatMoney(invoice.deposit_cents)}`],
      ["Balance", formatMoney(invoice.balance_due_cents)],
    ].forEach(([label, value]) => grid.append(createMetric(label, value)));
  }

  function renderPaymentActions(invoice) {
    const container = document.querySelector("[data-payment-actions]");
    if (!container) return;
    container.textContent = "";

    if (!invoice) {
      container.append(createMutedText("Invoice details will appear after DJ Too Kold sends them."));
      return;
    }

    const balanceDue = Number(invoice.balance_due_cents || 0);
    const paymentLinkOpen = invoice.payment_link_url && !isExpired(invoice.payment_link_expires_at);
    if (balanceDue > 0 && paymentLinkOpen) {
      container.append(createActionLink("Pay Balance", invoice.payment_link_url, "btn-primary"));
    }
    if (invoice.external_invoice_url) {
      container.append(createActionLink("View Invoice", invoice.external_invoice_url, "btn-secondary portal-light-button"));
    }
    if (container.children.length === 0) {
      container.append(createMutedText(balanceDue > 0 ? "Payment link is pending." : "No balance is due."));
    }
  }

  function renderInvoiceItems(invoice) {
    const list = document.querySelector("[data-invoice-items]");
    if (!list) return;
    list.textContent = "";
    const items = Array.isArray(invoice?.invoice_items) ? [...invoice.invoice_items] : [];

    if (items.length === 0) {
      appendEmptyListItem(list, "No invoice items to show.");
      return;
    }

    items
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .forEach((item) => {
        const li = document.createElement("li");
        const textWrap = document.createElement("div");
        const title = document.createElement("strong");
        const meta = document.createElement("span");
        title.textContent = item.description || "Invoice item";
        meta.textContent = `${formatNumber(item.quantity || 1)} x ${formatMoney(item.unit_price_cents)}`;
        textWrap.append(title, meta);
        li.append(textWrap, document.createTextNode(formatMoney(item.line_total_cents)));
        list.append(li);
      });
  }

  function renderPayments(invoice) {
    const list = document.querySelector("[data-payment-list]");
    if (!list) return;
    list.textContent = "";
    const payments = Array.isArray(invoice?.payments) ? [...invoice.payments] : [];

    if (payments.length === 0) {
      appendEmptyListItem(list, "No payments recorded yet.");
      return;
    }

    payments
      .sort((a, b) => String(b.payment_date || b.paid_at || "").localeCompare(String(a.payment_date || a.paid_at || "")))
      .forEach((payment) => {
        const li = document.createElement("li");
        const textWrap = document.createElement("div");
        const title = document.createElement("strong");
        const meta = document.createElement("span");
        title.textContent = `${formatMoney(payment.amount_cents)} ${formatStatus(payment.payment_type)}`;
        meta.textContent = [formatDate(payment.payment_date), formatStatus(payment.payment_provider)].filter(Boolean).join(" / ");
        textWrap.append(title, meta);
        li.append(textWrap, createBadge(payment.status || "pending"));
        list.append(li);
      });
  }

  function renderContract() {
    const contract = getSelectedContract();
    setBadge("[data-contract-status]", contract?.status || "pending");
    renderDetails("[data-contract-details]", contract ? [
      ["Title", contract.title],
      ["Contract", contract.contract_number],
      ["Sent", formatDateTime(contract.sent_at)],
      ["Signed", formatDateTime(contract.signed_at)],
      ["Expires", formatDateTime(contract.expires_at)],
    ] : []);

    const actions = document.querySelector("[data-contract-actions]");
    if (!actions) return;
    actions.textContent = "";
    if (contract?.document_url) {
      actions.append(createActionLink("Open Contract", contract.document_url, "btn-primary"));
    } else {
      actions.append(createMutedText("Contract document is pending."));
    }
  }

  function renderVenue() {
    const event = getSelectedEvent();
    const venue = firstRelation(event?.venues);
    const address = venue
      ? [venue.address_line1, venue.address_line2, venue.city, venue.state, venue.postal_code].filter(Boolean).join(", ")
      : event?.location;

    renderDetails("[data-venue-details]", event ? [
      ["Venue", event.venue_name || venue?.name],
      ["Address", address],
      ["Contact", [venue?.contact_name, venue?.contact_email, venue?.contact_phone].filter(Boolean).join(" / ")],
      ["Website", venue?.website_url ? { label: "Open venue site", url: venue.website_url } : ""],
      ["Load-in", venue?.load_in_notes],
      ["Parking", venue?.parking_notes],
      ["Power", venue?.power_notes],
    ] : []);
  }

  function renderSongs() {
    const event = getSelectedEvent();
    const songs = state.data.songRequests.filter((song) => song.event_id === event?.id);
    const list = document.querySelector("[data-song-list]");
    const form = document.querySelector("[data-song-form]");
    const isOpen = event && ["tentative", "confirmed"].includes(String(event.status));

    form?.querySelectorAll("input, textarea, button").forEach((control) => {
      if (control.matches("[data-song-cancel]")) return;
      control.disabled = !isOpen;
    });

    if (!list) return;
    list.textContent = "";
    if (!event) {
      appendEmptyListItem(list, "Choose an event to manage song requests.");
      return;
    }

    if (songs.length === 0) {
      appendEmptyListItem(list, "No song requests yet.");
      return;
    }

    songs.forEach((song) => {
      const li = document.createElement("li");
      const textWrap = document.createElement("div");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      const actions = document.createElement("div");
      actions.className = "portal-list-actions";
      title.textContent = [song.song_title, song.artist].filter(Boolean).join(" - ");
      meta.textContent = [
        song.is_must_play ? "Must play" : "",
        song.dedication ? `Dedication: ${song.dedication}` : "",
        song.notes,
      ].filter(Boolean).join(" / ");
      textWrap.append(title, meta);
      actions.append(createBadge(song.status || "requested"));
      if (isOpen && song.status === "requested") {
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "btn-secondary portal-light-button portal-small-button";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => editSong(song));
        actions.append(edit);
      }
      li.append(textWrap, actions);
      list.append(li);
    });
  }

  function editSong(song) {
    const form = document.querySelector("[data-song-form]");
    if (!form) return;
    form.songRequestId.value = song.id;
    form.songTitle.value = song.song_title || "";
    form.artist.value = song.artist || "";
    form.dedication.value = song.dedication || "";
    form.notes.value = song.notes || "";
    form.isMustPlay.checked = Boolean(song.is_must_play);
    setText("[data-song-submit]", "Update Song");
    const cancel = document.querySelector("[data-song-cancel]");
    if (cancel) cancel.hidden = false;
    setInlineStatus("[data-song-status]", "");
    form.scrollIntoView({ block: "nearest" });
  }

  function resetSongForm() {
    const form = document.querySelector("[data-song-form]");
    if (!form) return;
    form.reset();
    form.songRequestId.value = "";
    setText("[data-song-submit]", "Add Song");
    const cancel = document.querySelector("[data-song-cancel]");
    if (cancel) cancel.hidden = true;
  }

  function renderNotes() {
    const event = getSelectedEvent();
    const notes = state.data.notes.filter((note) => note.event_id === event?.id);
    const container = document.querySelector("[data-note-list]");
    const isOpen = event && ["tentative", "confirmed"].includes(String(event.status));
    if (!container) return;
    container.textContent = "";

    if (!event) {
      container.append(createEmptyCard("Choose an event to view notes."));
      return;
    }
    if (notes.length === 0) {
      container.append(createEmptyCard("No client-visible notes yet."));
      return;
    }

    notes.forEach((note) => {
      const article = document.createElement("article");
      article.className = "portal-note";
      const label = document.createElement("span");
      label.className = "admin-badge";
      label.dataset.status = note.client_editable ? "open" : "draft";
      label.textContent = formatStatus(note.note_type || "Note");
      article.append(label);

      if (note.client_editable && isOpen) {
        const form = document.createElement("form");
        form.className = "portal-note-form";
        const textarea = document.createElement("textarea");
        textarea.name = "body";
        textarea.rows = 5;
        textarea.value = note.body || "";
        const actions = document.createElement("div");
        actions.className = "portal-form-actions";
        const button = document.createElement("button");
        button.className = "btn-primary";
        button.type = "submit";
        button.textContent = "Save Note";
        const inlineStatus = document.createElement("p");
        inlineStatus.className = "portal-inline-status";
        inlineStatus.setAttribute("aria-live", "polite");
        actions.append(button);
        form.append(textarea, actions, inlineStatus);
        form.addEventListener("submit", (event) => saveNote(event, note.id, inlineStatus, button));
        article.append(form);
      } else {
        const body = document.createElement("p");
        body.textContent = note.body || "No note details.";
        article.append(body);
      }
      container.append(article);
    });
  }

  async function saveNote(event, noteId, inlineStatus, button) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = form.elements.body.value.trim();
    if (!body) {
      setInlineStatus(inlineStatus, "Note cannot be blank.", "error");
      return;
    }

    try {
      setButtonBusy(button, true);
      setInlineStatus(inlineStatus, "Saving note...");
      const saved = await portalFetch(`/portal/event-notes/${noteId}`, {
        method: "PATCH",
        body: { body },
      });
      state.data.notes = state.data.notes.map((note) => note.id === saved.id ? saved : note);
      setInlineStatus(inlineStatus, "Note saved.", "success");
    } catch (error) {
      console.error(error);
      setInlineStatus(inlineStatus, error.message || "Could not save note.", "error");
    } finally {
      setButtonBusy(button, false);
    }
  }

  function renderContact() {
    const event = getSelectedEvent();
    const subject = event ? `Question about ${event.title || "my event"}` : "Client portal question";
    const body = event
      ? [`Event: ${event.title || ""}`, `Date: ${formatDate(event.event_date)}`, ""].join("\n")
      : "";
    const href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const contactLink = document.querySelector("[data-contact-link]");
    const emailLink = document.querySelector("[data-contact-email]");
    if (contactLink) contactLink.href = href;
    if (emailLink) emailLink.href = href;
  }

  function getSelectedEvent() {
    return state.data.events.find((event) => event.id === state.selectedEventId) || null;
  }

  function getSelectedInvoice() {
    const event = getSelectedEvent();
    const invoices = state.data.invoices.filter((invoice) => invoice.event_id === event?.id);
    return invoices.find((invoice) => Number(invoice.balance_due_cents || 0) > 0 && invoice.status !== "cancelled") || invoices[0] || null;
  }

  function getSelectedContract() {
    const event = getSelectedEvent();
    return state.data.contracts.find((contract) => contract.event_id === event?.id && contract.status !== "cancelled") ||
      state.data.contracts.find((contract) => contract.event_id === event?.id) ||
      null;
  }

  function renderDetails(selector, rows) {
    const list = document.querySelector(selector);
    if (!list) return;
    list.textContent = "";
    const visibleRows = rows.filter(([, value]) => value !== null && value !== undefined && value !== "");

    if (visibleRows.length === 0) {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = "Status";
      dd.textContent = "Details pending";
      row.append(dt, dd);
      list.append(row);
      return;
    }

    visibleRows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      appendValue(dd, value);
      row.append(dt, dd);
      list.append(row);
    });
  }

  function appendValue(element, value) {
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

  function createMetric(label, value) {
    const article = document.createElement("article");
    const span = document.createElement("span");
    const strong = document.createElement("strong");
    span.textContent = label;
    strong.textContent = value;
    article.append(span, strong);
    return article;
  }

  function createActionLink(label, href, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }

  function createMutedText(message) {
    const p = document.createElement("p");
    p.className = "portal-muted";
    p.textContent = message;
    return p;
  }

  function createEmptyCard(message) {
    const empty = document.createElement("div");
    empty.className = "admin-empty-card";
    empty.textContent = message;
    return empty;
  }

  function appendEmptyListItem(list, message) {
    const li = document.createElement("li");
    li.className = "admin-empty";
    li.textContent = message;
    list.append(li);
  }

  function createBadge(status) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.dataset.status = normalizeStatus(status || "pending");
    badge.textContent = formatStatus(status || "pending");
    return badge;
  }

  function setBadge(selector, status) {
    const badge = document.querySelector(selector);
    if (!badge) return;
    badge.dataset.status = normalizeStatus(status || "pending");
    badge.textContent = formatStatus(status || "pending");
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value ?? "";
  }

  function firstRelation(value) {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  }

  function firstName(value) {
    return String(value || "").trim().split(/\s+/)[0] || "";
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
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatTime(value) {
    if (!value) return "";
    const [hours, minutes] = String(value).split(":").map((part) => Number.parseInt(part, 10));
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
      new Date(2026, 0, 1, hours, minutes),
    );
  }

  function formatTimeRange(startTime, endTime) {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    if (start && end) return `${start}-${end}`;
    return start || end;
  }

  function formatStatus(value) {
    if (!value) return "";
    return String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function normalizeStatus(value) {
    return String(value || "pending").toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function isExpired(value) {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date < new Date();
  }

  initPortal();
})();
