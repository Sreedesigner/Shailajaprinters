// Create a small Vue 3 app for reactivity (data-driven services + reactive contact form)
const { createApp } = Vue;

createApp({
  data() {
    return {
      hero: {
        title: 'Quality printing, crafted for your business.',
        subtitle: 'Fast turnarounds, local service, exceptional finishes - everything you need to make an impression.'
      },
      services: [
        { id: 1, title: 'Business Printing', text: 'Brochures, flyers, business cards - professional finishes and quick delivery.' },,
        { id: 2, title: 'Large Format', text: 'Banners, posters, signage - perfect for events and storefronts.' },
        { id: 3, title: 'Custom Finishes', text: 'Lamination, spot UV, embossing - add premium touches to your prints.' }
      ],
      form: {
        name: '',
        email: '',
        message: '',
        website: '' // honeypot (should stay empty)
      },
      formTouched: false,
      formAlert: null,
      submitting: false
    };
  },
  mounted() {
    // Support server redirect fallback (?sent=1 or ?sent=0&error=...)
    try {
      const url = new URL(window.location.href);
      const sent = url.searchParams.get('sent');
      if (sent === '1') {
        this.formAlert = { type: 'success', message: 'Message sent successfully.' };
      } else if (sent === '0') {
        const err = url.searchParams.get('error') || 'There was a problem sending your message.';
        this.formAlert = { type: 'danger', message: decodeURIComponent(err) };
      }
      if (sent !== null) {
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (_) {}
  },
  methods: {
    validEmail(email) {
      if (!email) return false;
      // simple email check
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    },
    async submitForm() {
      this.formTouched = true;
      this.formAlert = null;

      const valid = this.form.name && this.validEmail(this.form.email) && this.form.message;
      if (!valid) {
        this.formAlert = { type: 'danger', message: 'Please fix the errors and try again.' };
        return;
      }

      // Prevent spam (honeypot must be empty)
      if (this.form.website) {
        this.formAlert = { type: 'success', message: 'Thanks! Your message has been received.' };
        return;
      }

      this.submitting = true;
      try {
        const resp = await fetch('contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.form.name, email: this.form.email, message: this.form.message })
        });

        const ctype = resp.headers.get('content-type') || '';
        let data = null;
        if (ctype.includes('application/json')) {
          try { data = await resp.json(); } catch (_) { data = null; }
        } else {
          // Non-JSON success (e.g., server might return HTML); treat 2xx as success
          if (resp.ok) {
            this.formAlert = { type: 'success', message: 'Thanks! Your message has been sent.' };
            this.form = { name: '', email: '', message: '', website: '' };
            this.formTouched = false;
            return;
          }
        }

        if (resp.ok && data && data.success) {
          this.formAlert = { type: 'success', message: data.message || 'Thanks! Your message has been sent.' };
          this.form = { name: '', email: '', message: '', website: '' };
          this.formTouched = false;
        } else {
          const errMsg = (data && data.error) || 'Something went wrong sending your message. Please try again later.';
          this.formAlert = { type: 'danger', message: errMsg };
        }
      } catch (e) {
        this.formAlert = { type: 'danger', message: 'Network error. Please check your connection and try again.' };
      } finally {
        this.submitting = false;
      }
    }
  }
}).mount('#app');

// Set current year dynamically in footer
document.addEventListener('DOMContentLoaded', function() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
