document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const statusMessage = document.getElementById('statusMessage');

  if (!form || !statusMessage) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    statusMessage.textContent = 'Saving login details...';

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      statusMessage.textContent = data.message || 'Login submitted.';
    } catch (error) {
      statusMessage.textContent = 'Failed to submit login details.';
      console.error(error);
    }
  });
});
