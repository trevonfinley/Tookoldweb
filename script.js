document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.inquiry-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const mailtoLink = document.getElementById('mailto-link');

  const publicEmail = 'info@tookoldweb.com';
  const isBookingForm = form.id === 'booking-form';

  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    message: document.getElementById('message'),
    eventDate: document.getElementById('event-date'),
    eventType: document.getElementById('event-type'),
    location: document.getElementById('location'),
    guestCount: document.getElementById('guest-count')
  };

  const setMailtoHref = () => {
    const subject = fields.subject && fields.subject.value
      ? fields.subject.value
      : isBookingForm
        ? 'Booking request from website'
        : 'Contact from website';
    const bookingDetails = isBookingForm
      ? [
          `Event date: ${fields.eventDate.value || 'Not provided'}`,
          `Event type: ${fields.eventType.value || 'Not provided'}`,
          `Location: ${fields.location.value || 'Not provided'}`,
          `Estimated guests: ${fields.guestCount.value || 'Not provided'}`
        ].join('\n')
      : '';
    const body = [
      `Name: ${fields.name.value}`,
      `Email: ${fields.email.value}`,
      bookingDetails,
      fields.message.value
    ].filter(Boolean).join('\n\n');
    const href = `mailto:${publicEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (mailtoLink) mailtoLink.href = href;
  };

  Object.values(fields).forEach(el => el && el.addEventListener('input', setMailtoHref));
  setMailtoHref();

  const errors = {
    name: document.querySelector('[data-error-for="name"]'),
    email: document.querySelector('[data-error-for="email"]'),
    message: document.querySelector('[data-error-for="message"]')
  };

  function validate() {
    let ok = true;
    // Clear errors
    Object.values(errors).forEach(e => e && (e.textContent = ''));

    if (!fields.name.value.trim()) {
      errors.name.textContent = 'Please enter your name.';
      ok = false;
    }
    const emailVal = fields.email.value.trim();
    if (!emailVal) {
      errors.email.textContent = 'Please enter your email.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errors.email.textContent = 'Please enter a valid email.';
      ok = false;
    }
    if (!fields.message.value.trim()) {
      errors.message.textContent = 'Please enter a message.';
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    if (!validate()) {
      e.preventDefault();
      statusEl.textContent = 'Please fix the errors above.';
      statusEl.className = 'error';
      return;
    }

    // If a custom endpoint is provided, submit via fetch (Formspree, etc.)
    const endpoint = form.dataset.endpoint; // e.g., https://formspree.io/f/xxxxxx
    if (endpoint) {
      e.preventDefault();
      try {
        statusEl.textContent = 'Sending...';
        statusEl.className = '';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: fields.name.value,
            email: fields.email.value,
            subject: fields.subject ? fields.subject.value : 'Booking request from website',
            message: fields.message.value,
            eventDate: fields.eventDate ? fields.eventDate.value : '',
            eventType: fields.eventType ? fields.eventType.value : '',
            location: fields.location ? fields.location.value : '',
            guestCount: fields.guestCount ? fields.guestCount.value : ''
          })
        });
        if (!res.ok) throw new Error('Request failed');
        statusEl.textContent = "Thanks! I'll be in touch soon.";
        statusEl.className = 'success';
        form.reset();
        setMailtoHref();
      } catch (err) {
        console.error(err);
        statusEl.textContent = 'Sorry, something went wrong. Try email instead.';
        statusEl.className = 'error';
      }
      return;
    }
    // Otherwise, let Netlify (or the default browser submit) handle it.
  });
});
