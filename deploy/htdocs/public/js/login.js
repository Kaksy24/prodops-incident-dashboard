const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

async function readJsonResponse(res) {
  const text = (await res.text()).replace(/^\uFEFF+/, '');
  return JSON.parse(text);
}

async function redirectIfLoggedIn() {
  const res = await fetch('/api/me', { credentials: 'same-origin' });
  if (!res.ok) return;
  const data = await readJsonResponse(res);
  window.location.replace(data.user?.role === 'admin' ? '/admin.html' : '/index.html');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = 'Utente o password non corretti.';
    try {
      const data = await readJsonResponse(res);
      if (data?.error) message = data.error;
    } catch {
      // keep fallback message
    }
    loginError.textContent = message;
    return;
  }

  const data = await readJsonResponse(res);
  window.location.replace(data.redirectTo || '/index.html');
});

redirectIfLoggedIn().catch(() => {});
