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

if (new URLSearchParams(window.location.search).get('error') === '1') {
  loginError.textContent = 'Credenziali non valide';
}

redirectIfLoggedIn().catch(() => {});
