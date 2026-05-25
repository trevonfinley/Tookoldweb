document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const desktopQuery = window.matchMedia('(min-width: 1040px)');
  const projectNeoConfig = window.ProjectNeoConfig || {};
  const apiBaseUrl = typeof projectNeoConfig.apiBaseUrl === 'string'
    ? projectNeoConfig.apiBaseUrl.replace(/\/+$/, '')
    : '';
  const publicContactEmail = typeof projectNeoConfig.publicContactEmail === 'string' && projectNeoConfig.publicContactEmail.trim()
    ? projectNeoConfig.publicContactEmail.trim()
    : 'djtookold@gmail.com';
  let bookingAvailabilitySnapshot = null;

  const publicAvailabilityStatuses = new Set(['available', 'pending', 'unavailable', 'contact_required']);
  const readTrimmedValue = (field) => (field && field.value ? field.value.trim() : '');
  const todayInputValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setBookingAvailabilitySnapshot = (snapshot) => {
    bookingAvailabilitySnapshot = snapshot;
    const bookingForm = document.querySelector('#booking-form');
    if (!bookingForm) return;

    const statusInput = bookingForm.querySelector('#availability-status-at-submission');
    const checkedAtInput = bookingForm.querySelector('#availability-checked-at');
    if (statusInput) statusInput.value = snapshot ? snapshot.status : '';
    if (checkedAtInput) checkedAtInput.value = snapshot ? snapshot.checkedAt : '';
  };

  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove('nav-open');
    document.body.classList.remove('nav-lock');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };

  const toggleMenu = () => {
    if (!header || !menuToggle) return;
    const isOpen = header.classList.toggle('nav-open');
    document.body.classList.toggle('nav-lock', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  if (siteNav) {
    siteNav.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) closeMenu();
    });
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener((event) => {
      if (event.matches) closeMenu();
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const availabilityBoard = document.querySelector('[data-public-availability]');
  if (availabilityBoard) {
    const statusEl = availabilityBoard.querySelector('[data-availability-status]');
    const listEl = availabilityBoard.querySelector('[data-availability-list]');

    const formatAvailabilityDate = (value) => {
      if (!value) return '';
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    };

    const formatAvailabilityTime = (value) => {
      if (!value) return '';
      const [hours, minutes] = String(value).split(':').map((part) => Number.parseInt(part, 10));
      if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return '';
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
        new Date(2026, 0, 1, hours, minutes)
      );
    };

    const formatAvailabilityRange = (startTime, endTime) => {
      const start = formatAvailabilityTime(startTime);
      const end = formatAvailabilityTime(endTime);
      if (start && end) return `${start}-${end}`;
      return start || end || 'Time pending';
    };

    const setAvailabilityStatus = (message) => {
      if (statusEl) statusEl.textContent = message;
    };

    const renderAvailability = (items) => {
      if (!listEl) return;
      listEl.textContent = '';

      if (!items.length) {
        setAvailabilityStatus('No public holds are currently listed.');
        return;
      }

      setAvailabilityStatus('');
      items.forEach((item) => {
        const row = document.createElement('article');
        row.className = 'availability-item';
        row.dataset.status = item.status || 'limited';

        const text = document.createElement('div');
        const title = document.createElement('strong');
        const meta = document.createElement('span');
        const badge = document.createElement('span');

        title.textContent = item.label || 'Unavailable';
        meta.textContent = [formatAvailabilityDate(item.date), formatAvailabilityRange(item.startTime, item.endTime)].filter(Boolean).join(' / ');
        badge.className = 'availability-badge';
        badge.textContent = (item.status || 'limited').replace(/[-_]+/g, ' ');

        text.append(title, meta);
        row.append(text, badge);
        listEl.append(row);
      });
    };

    if (!apiBaseUrl) {
      setAvailabilityStatus('Use the booking form for current availability.');
    } else {
      fetch(`${apiBaseUrl}/availability?limit=8`, { headers: { Accept: 'application/json' } })
        .then((response) => response.json().then((payload) => ({ response, payload })))
        .then(({ response, payload }) => {
          if (!response.ok || payload?.ok === false) throw new Error('Availability unavailable.');
          renderAvailability(Array.isArray(payload.data) ? payload.data : []);
        })
        .catch(() => setAvailabilityStatus('Use the booking form for current availability.'));
    }
  }

  const availabilityChecker = document.querySelector('[data-availability-checker]');
  if (availabilityChecker) {
    const resultEl = availabilityChecker.querySelector('[data-availability-result]');
    const submitButton = availabilityChecker.querySelector('button[type="submit"]');
    const continueButton = availabilityChecker.querySelector('[data-availability-continue]');
    const checkFields = {
      eventDate: availabilityChecker.querySelector('#check-event-date'),
      startTime: availabilityChecker.querySelector('#check-start-time'),
      endTime: availabilityChecker.querySelector('#check-end-time'),
      eventType: availabilityChecker.querySelector('#check-event-type'),
      cityState: availabilityChecker.querySelector('#check-city-state')
    };
    const checkErrors = {};

    availabilityChecker.querySelectorAll('[data-check-error-for]').forEach((error) => {
      checkErrors[error.dataset.checkErrorFor] = error;
    });

    if (checkFields.eventDate) checkFields.eventDate.min = todayInputValue();

    const setCheckError = (key, message) => {
      if (checkErrors[key]) checkErrors[key].textContent = message;
      if (checkFields[key]) checkFields[key].setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const clearCheckErrors = () => {
      Object.keys(checkErrors).forEach((key) => setCheckError(key, ''));
    };

    const setCheckerLoading = (isLoading) => {
      if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Checking...' : 'Check Availability';
      }
      if (isLoading && resultEl) {
        delete resultEl.dataset.status;
        resultEl.textContent = 'Checking availability...';
        resultEl.hidden = false;
      }
      if (isLoading && continueButton) continueButton.hidden = true;
    };

    const normalizeAvailabilityStatus = (value) => {
      const status = String(value || '').trim();
      return publicAvailabilityStatuses.has(status) ? status : 'contact_required';
    };

    const availabilityCopy = {
      available: {
        title: 'Appears available',
        message: 'This date appears available. Submit your inquiry to start the booking process.'
      },
      pending: {
        title: 'Pending review',
        message: 'This date may have another request pending. Submit your inquiry and we will confirm availability.'
      },
      unavailable: {
        title: 'Currently unavailable',
        message: 'This date is currently unavailable. You can still contact us about alternate times.'
      },
      contact_required: {
        title: 'Manual review needed',
        message: 'This date needs manual review. Submit your inquiry and we will follow up.'
      }
    };

    const renderAvailabilityResult = (result, isError = false) => {
      if (!resultEl) return;
      const status = isError ? 'contact_required' : normalizeAvailabilityStatus(result?.status);
      const copy = availabilityCopy[status] || availabilityCopy.contact_required;
      const message = typeof result?.message === 'string' && result.message.trim()
        ? result.message.trim()
        : copy.message;

      resultEl.textContent = '';
      resultEl.dataset.status = status;

      const heading = document.createElement('div');
      heading.className = 'availability-result-heading';

      const title = document.createElement('strong');
      title.textContent = copy.title;

      const badge = document.createElement('span');
      badge.className = 'availability-result-badge';
      badge.textContent = status.replace(/_/g, ' ');

      const body = document.createElement('p');
      body.textContent = message;

      const note = document.createElement('small');
      note.textContent = 'This is an availability estimate, not a confirmed booking.';

      heading.append(title, badge);
      resultEl.append(heading, body, note);
      resultEl.hidden = false;
      if (continueButton) continueButton.hidden = false;
    };

    const checkerPayload = () => ({
      eventDate: readTrimmedValue(checkFields.eventDate),
      event_date: readTrimmedValue(checkFields.eventDate),
      startTime: readTrimmedValue(checkFields.startTime),
      start_time: readTrimmedValue(checkFields.startTime),
      endTime: readTrimmedValue(checkFields.endTime),
      end_time: readTrimmedValue(checkFields.endTime),
      eventType: readTrimmedValue(checkFields.eventType),
      event_type: readTrimmedValue(checkFields.eventType),
      cityState: readTrimmedValue(checkFields.cityState),
      city_state: readTrimmedValue(checkFields.cityState)
    });

    const validateChecker = () => {
      clearCheckErrors();
      let ok = true;

      if (!readTrimmedValue(checkFields.eventDate)) {
        setCheckError('eventDate', 'Please choose an event date.');
        ok = false;
      } else if (checkFields.eventDate && readTrimmedValue(checkFields.eventDate) < checkFields.eventDate.min) {
        setCheckError('eventDate', 'Please choose today or a future date.');
        ok = false;
      }

      if (!readTrimmedValue(checkFields.eventType)) {
        setCheckError('eventType', 'Please choose an event type.');
        ok = false;
      }

      if (!readTrimmedValue(checkFields.startTime)) {
        setCheckError('startTime', 'Please add a start time.');
        ok = false;
      }

      if (!readTrimmedValue(checkFields.endTime)) {
        setCheckError('endTime', 'Please add an end time.');
        ok = false;
      }

      if (
        readTrimmedValue(checkFields.startTime) &&
        readTrimmedValue(checkFields.endTime) &&
        readTrimmedValue(checkFields.endTime) <= readTrimmedValue(checkFields.startTime)
      ) {
        setCheckError('endTime', 'End time should be after start time.');
        ok = false;
      }

      return ok;
    };

    availabilityChecker.addEventListener('submit', async (event) => {
      event.preventDefault();
      setBookingAvailabilitySnapshot(null);

      if (!validateChecker()) {
        renderAvailabilityResult({
          status: 'contact_required',
          message: 'Add the required event details to check availability.'
        }, true);
        return;
      }

      if (!apiBaseUrl) {
        renderAvailabilityResult({
          status: 'contact_required',
          message: 'Availability checking is not connected right now. You can still send an inquiry.'
        }, true);
        return;
      }

      try {
        setCheckerLoading(true);
        const response = await fetch(`${apiBaseUrl}/availability-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(checkerPayload())
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.ok === false) {
          throw new Error(payload?.error?.message || 'Availability check failed');
        }

        const result = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
        const status = normalizeAvailabilityStatus(result?.status);
        const checkedAt = typeof result?.checked_at === 'string' && result.checked_at
          ? result.checked_at
          : new Date().toISOString();

        setBookingAvailabilitySnapshot({ status, checkedAt });
        renderAvailabilityResult({ ...result, status, checked_at: checkedAt });
      } catch (err) {
        console.error(err);
        setBookingAvailabilitySnapshot(null);
        renderAvailabilityResult({
          status: 'contact_required',
          message: 'Availability checking is unavailable right now. You can still send an inquiry.'
        }, true);
      } finally {
        setCheckerLoading(false);
      }
    });

    if (continueButton) {
      continueButton.addEventListener('click', () => {
        const bookingForm = document.querySelector('#booking-form');
        if (!bookingForm) return;

        const snapshotToCarry = bookingAvailabilitySnapshot;
        const copyMap = {
          '#event-date': checkFields.eventDate,
          '#start-time': checkFields.startTime,
          '#end-time': checkFields.endTime,
          '#event-type': checkFields.eventType,
          '#city-state': checkFields.cityState
        };

        Object.entries(copyMap).forEach(([selector, sourceField]) => {
          const targetField = bookingForm.querySelector(selector);
          if (!targetField || !sourceField) return;
          targetField.value = readTrimmedValue(sourceField);
          targetField.dispatchEvent(new Event('input', { bubbles: true }));
        });

        setBookingAvailabilitySnapshot(snapshotToCarry);
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const firstInput = bookingForm.querySelector('#client-name');
        window.setTimeout(() => {
          if (firstInput) firstInput.focus({ preventScroll: true });
        }, 350);
      });
    }
  }

  document.querySelectorAll('.inquiry-form').forEach((form) => {
    const statusEl = form.querySelector('#form-status');
    const mailtoLink = form.querySelector('#mailto-link');
    const submitButton = form.querySelector('button[type="submit"]');
    const publicEmail = publicContactEmail;
    const isBookingForm = form.id === 'booking-form';
    const defaultEndpoint = apiBaseUrl
      ? `${apiBaseUrl}/${isBookingForm ? 'booking-inquiries' : 'contact-messages'}`
      : '';

    const getField = (selector) => form.querySelector(selector);
    const fields = isBookingForm
      ? {
          clientName: getField('#client-name'),
          email: getField('#email'),
          phone: getField('#phone'),
          eventType: getField('#event-type'),
          eventDate: getField('#event-date'),
          startTime: getField('#start-time'),
          endTime: getField('#end-time'),
          venueName: getField('#venue-name'),
          venueAddress: getField('#venue-address'),
          cityState: getField('#city-state'),
          guestCount: getField('#guest-count'),
          indoorOutdoor: getField('#indoor-outdoor'),
          musicPreferences: getField('#music-preferences'),
          budgetRange: getField('#budget-range'),
          heardAbout: getField('#heard-about'),
          additionalNotes: getField('#additional-notes'),
          availabilityStatusAtSubmission: getField('#availability-status-at-submission'),
          availabilityCheckedAt: getField('#availability-checked-at')
        }
      : {
          name: getField('#name'),
          email: getField('#email'),
          subject: getField('#subject'),
          message: getField('#message')
        };

    const errorTargets = {};
    const fieldByError = {};
    form.querySelectorAll('[data-error-for]').forEach((error) => {
      errorTargets[error.dataset.errorFor] = error;
    });
    Object.entries(fields).forEach(([key, field]) => {
      if (field) fieldByError[key] = field;
    });

    const valueOf = (field) => (field && field.value ? field.value.trim() : '');
    const localToday = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const setBookingDateMin = () => {
      if (isBookingForm && fields.eventDate) fields.eventDate.min = localToday();
    };
    setBookingDateMin();

    const setStatus = (message, className = '') => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = className;
    };

    const setError = (key, message) => {
      if (errorTargets[key]) errorTargets[key].textContent = message;
      if (fieldByError[key]) fieldByError[key].setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const clearErrors = () => {
      Object.keys(errorTargets).forEach((key) => setError(key, ''));
    };

    const bookingLine = (label, value) => `${label}: ${value || 'Not provided'}`;
    const indoorOutdoorLabel = (value) => ({
      indoor: 'Indoor',
      outdoor: 'Outdoor',
      both: 'Both',
      not_sure: 'Not sure yet'
    })[value] || value;

    const bookingPayload = () => ({
      clientName: valueOf(fields.clientName),
      name: valueOf(fields.clientName),
      email: valueOf(fields.email),
      phone: valueOf(fields.phone),
      eventType: valueOf(fields.eventType),
      eventDate: valueOf(fields.eventDate),
      startTime: valueOf(fields.startTime),
      endTime: valueOf(fields.endTime),
      venueName: valueOf(fields.venueName),
      venueAddress: valueOf(fields.venueAddress),
      cityState: valueOf(fields.cityState),
      guestCount: Number.parseInt(valueOf(fields.guestCount), 10),
      indoorOutdoor: valueOf(fields.indoorOutdoor),
      musicPreferences: valueOf(fields.musicPreferences),
      budgetRange: valueOf(fields.budgetRange),
      heardAbout: valueOf(fields.heardAbout),
      additionalNotes: valueOf(fields.additionalNotes),
      availabilityStatusAtSubmission: valueOf(fields.availabilityStatusAtSubmission),
      availabilityCheckedAt: valueOf(fields.availabilityCheckedAt),
      availability_status_at_submission: valueOf(fields.availabilityStatusAtSubmission),
      availability_checked_at: valueOf(fields.availabilityCheckedAt),
      source: 'website'
    });

    const contactPayload = () => ({
      name: valueOf(fields.name),
      email: valueOf(fields.email),
      subject: valueOf(fields.subject) || 'Contact from website',
      message: valueOf(fields.message)
    });

    const setMailtoHref = () => {
      const subject = isBookingForm ? 'Booking request from website' : valueOf(fields.subject) || 'Contact from website';
      const body = isBookingForm
        ? [
            bookingLine('Client name', valueOf(fields.clientName)),
            bookingLine('Email', valueOf(fields.email)),
            bookingLine('Phone', valueOf(fields.phone)),
            bookingLine('Event type', valueOf(fields.eventType)),
            bookingLine('Event date', valueOf(fields.eventDate)),
            bookingLine('Start time', valueOf(fields.startTime)),
            bookingLine('End time', valueOf(fields.endTime)),
            bookingLine('Venue name', valueOf(fields.venueName)),
            bookingLine('Venue address', valueOf(fields.venueAddress)),
            bookingLine('City/state', valueOf(fields.cityState)),
            bookingLine('Estimated guests', valueOf(fields.guestCount)),
            bookingLine('Indoor/outdoor', indoorOutdoorLabel(valueOf(fields.indoorOutdoor))),
            bookingLine('Music preferences', valueOf(fields.musicPreferences)),
            bookingLine('Budget range', valueOf(fields.budgetRange)),
            bookingLine('Heard about', valueOf(fields.heardAbout)),
            bookingLine('Additional notes', valueOf(fields.additionalNotes))
          ].join('\n')
        : [
            `Name: ${valueOf(fields.name)}`,
            `Email: ${valueOf(fields.email)}`,
            valueOf(fields.message)
          ].filter(Boolean).join('\n\n');
      const href = `mailto:${publicEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (mailtoLink) mailtoLink.href = href;
    };

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener('input', setMailtoHref);
      field.addEventListener('change', setMailtoHref);
    });
    setMailtoHref();

    if (isBookingForm) {
      ['eventType', 'eventDate', 'startTime', 'endTime', 'cityState'].forEach((key) => {
        const field = fields[key];
        if (!field) return;
        const clearStoredAvailability = () => setBookingAvailabilitySnapshot(null);
        field.addEventListener('input', clearStoredAvailability);
        field.addEventListener('change', clearStoredAvailability);
      });
    }

    const requireField = (key, message) => {
      if (valueOf(fields[key])) return true;
      setError(key, message);
      return false;
    };

    const validateEmail = () => {
      const emailVal = valueOf(fields.email);
      if (!emailVal) {
        setError('email', 'Please enter your email.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError('email', 'Please enter a valid email.');
        return false;
      }
      return true;
    };

    const validate = () => {
      clearErrors();
      let ok = validateEmail();

      if (isBookingForm) {
        ok = requireField('clientName', 'Please enter the client name.') && ok;
        ok = requireField('eventType', 'Please choose an event type.') && ok;
        ok = requireField('eventDate', 'Please choose an event date.') && ok;
        ok = requireField('cityState', 'Please enter the event city and state.') && ok;
        ok = requireField('guestCount', 'Please enter an estimated guest count.') && ok;

        const phoneVal = valueOf(fields.phone).replace(/\D/g, '');
        if (phoneVal && phoneVal.length < 7) {
          setError('phone', 'Please enter a valid phone number.');
          ok = false;
        }

        const eventDate = valueOf(fields.eventDate);
        if (eventDate && fields.eventDate && eventDate < fields.eventDate.min) {
          setError('eventDate', 'Please choose today or a future date.');
          ok = false;
        }

        const guestCount = valueOf(fields.guestCount);
        if (guestCount && (!/^\d+$/.test(guestCount) || Number.parseInt(guestCount, 10) <= 0)) {
          setError('guestCount', 'Please enter a positive whole number.');
          ok = false;
        }

        if (valueOf(fields.startTime) && valueOf(fields.endTime) && valueOf(fields.startTime) === valueOf(fields.endTime)) {
          setError('endTime', 'End time should be different from start time.');
          ok = false;
        }
      } else {
        ok = requireField('name', 'Please enter your name.') && ok;
        ok = requireField('message', 'Please enter a message.') && ok;
      }

      return ok;
    };

    form.addEventListener('submit', async (event) => {
      if (!validate()) {
        event.preventDefault();
        setStatus('Please fix the errors above.', 'error');
        return;
      }

      const endpoint = form.dataset.endpoint || defaultEndpoint;
      if (!endpoint) return;

      event.preventDefault();
      try {
        setStatus('Sending...');
        if (submitButton) submitButton.disabled = true;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(isBookingForm ? bookingPayload() : contactPayload())
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || (data && data.ok === false)) {
          throw new Error(data && data.error && data.error.message ? data.error.message : 'Request failed');
        }
        setStatus(
          isBookingForm
            ? 'Thanks. Your booking request has been sent. DJ Too Kold will review the details and follow up soon.'
            : 'Thanks. I will be in touch soon.',
          'success'
        );
        form.reset();
        if (isBookingForm) setBookingAvailabilitySnapshot(null);
        setBookingDateMin();
        clearErrors();
        setMailtoHref();
      } catch (err) {
        console.error(err);
        setStatus('Sorry, something went wrong. Try email instead.', 'error');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
});
