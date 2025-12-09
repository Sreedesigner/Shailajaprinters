// Contact Form Handler with AWS API Gateway - Vanilla JavaScript
const API_ENDPOINT = 'https://z2ytaxvtv6.execute-api.ap-south-1.amazonaws.com/prod/contact';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    if (!form) {
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const alertContainer = document.getElementById('formAlert');

    // Email validation
    function validEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show alert message
    function showAlert(type, message) {
        alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Clear alert
    function clearAlert() {
        alertContainer.innerHTML = '';
    }

    // Set button loading state
    function setLoading(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
            `;
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                </svg>
                Send Message
            `;
        }
    }

    // Form submit handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAlert();

        // Get form data
        const formData = {
            name: document.getElementById('name')?.value?.trim() || '',
            email: document.getElementById('email')?.value?.trim() || '',
            phone: document.getElementById('phone')?.value?.trim() || '',
            company: document.getElementById('company')?.value?.trim() || '',
            subject: document.getElementById('subject')?.value || 'general',
            message: document.getElementById('message')?.value?.trim() || '',
            website: document.querySelector('input[name="website"]')?.value || '' // Honeypot
        };

        // Honeypot check - if filled, it's likely spam
        if (formData.website) {
            showAlert('danger', 'Form submission failed. Please try again.');
            return;
        }

        // Validate required fields
        if (!formData.name || !formData.email || !formData.message) {
            showAlert('danger', 'Please fill in all required fields.');
            return;
        }

        // Validate email
        if (!validEmail(formData.email)) {
            showAlert('danger', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
                form.reset();
            } else {
                showAlert('danger', result.message || 'There was an error sending your message. Please try again.');
            }
        } catch (error) {
            showAlert('danger', 'There was an error sending your message. Please try again or contact us directly at shailajaprinters@gmail.com');
        } finally {
            setLoading(false);
        }
    });
});
