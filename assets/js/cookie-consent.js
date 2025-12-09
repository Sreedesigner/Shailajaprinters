/**
 * Privacy-Compliant Cookie Consent Manager
 * Complies with Indian data protection regulations and Information Technology Act
 */

class CookieConsent {
  constructor() {
    this.cookieName = 'ShailajaPrinters_cookie_consent';
    this.cookieDuration = 365; // days
    this.preferences = {
      necessary: true,  // Always true, cannot be disabled
      analytics: false,
      marketing: false
    };
    
    this.init();
  }

  init() {
    // Check if user has already made a choice
    const savedPreferences = this.getCookie(this.cookieName);
    
    if (savedPreferences) {
      this.preferences = JSON.parse(savedPreferences);
      this.applyPreferences();
    } else {
      // Show banner if no consent given
      this.showBanner();
    }
    
    this.attachEventListeners();
  }

  showBanner() {
    const banner = document.querySelector('.cookie-consent');
    if (banner) {
      setTimeout(() => banner.classList.add('show'), 100);
    }
  }

  hideBanner() {
    const banner = document.querySelector('.cookie-consent');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  showSettings() {
    const modal = document.querySelector('.cookie-settings-modal');
    if (modal) {
      modal.classList.add('show');
      // Update toggle states based on current preferences
      document.getElementById('cookie-analytics').checked = this.preferences.analytics;
      document.getElementById('cookie-marketing').checked = this.preferences.marketing;
    }
  }

  hideSettings() {
    const modal = document.querySelector('.cookie-settings-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  acceptAll() {
    this.preferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    this.savePreferences();
    this.applyPreferences();
    this.hideBanner();
  }

  rejectAll() {
    this.preferences = {
      necessary: true,  // Necessary cookies cannot be rejected
      analytics: false,
      marketing: false
    };
    this.savePreferences();
    this.applyPreferences();
    this.hideBanner();
  }

  saveCustomPreferences() {
    this.preferences = {
      necessary: true,  // Always true
      analytics: document.getElementById('cookie-analytics').checked,
      marketing: document.getElementById('cookie-marketing').checked
    };
    this.savePreferences();
    this.applyPreferences();
    this.hideSettings();
    this.hideBanner();
  }

  savePreferences() {
    const preferences = JSON.stringify(this.preferences);
    this.setCookie(this.cookieName, preferences, this.cookieDuration);
  }

  applyPreferences() {
    // Apply analytics cookies (e.g., Google Analytics)
    if (this.preferences.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Apply marketing cookies
    if (this.preferences.marketing) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }
  }

  enableAnalytics() {
    // Example: Load Google Analytics
    // Uncomment and configure when you have GA tracking ID
    /*
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
    */
    console.log('Analytics cookies enabled');
  }

  disableAnalytics() {
    // Disable analytics tracking
    window['ga-disable-GA_MEASUREMENT_ID'] = true;
    console.log('Analytics cookies disabled');
  }

  enableMarketing() {
    // Enable marketing/advertising cookies
    console.log('Marketing cookies enabled');
  }

  disableMarketing() {
    // Disable marketing cookies
    console.log('Marketing cookies disabled');
  }

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  attachEventListeners() {
    // Accept all button
    const acceptBtn = document.getElementById('cookie-accept-all');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptAll());
    }

    // Reject all button
    const rejectBtn = document.getElementById('cookie-reject-all');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => this.rejectAll());
    }

    // Settings button
    const settingsBtn = document.getElementById('cookie-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
    }

    // Close settings modal
    const closeBtn = document.getElementById('cookie-settings-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideSettings());
    }

    // Save custom preferences
    const saveBtn = document.getElementById('cookie-save-preferences');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCustomPreferences());
    }

    // Close modal when clicking outside
    const modal = document.querySelector('.cookie-settings-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideSettings();
        }
      });
    }
  }
}

// Initialize cookie consent when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
  });
} else {
  new CookieConsent();
}
