const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

async function redirectIfLoggedIn() {
  const res = await fetch('/api/me');
  if (!res.ok) return;
  const data = await res.json();
  window.location.href = data.user?.role === 'admin' ? '/admin.html' : '/index.html';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = 'Utente o password non corretti.';
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // keep fallback message
    }
    loginError.textContent = message;
    return;
  }

  const data = await res.json();
  window.location.href = data.redirectTo || '/index.html';
});

redirectIfLoggedIn().catch(() => {});
