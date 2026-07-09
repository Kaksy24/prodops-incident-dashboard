const loginForm = document.getElementById('loginForm');
const appBasePath = new URL(document.currentScript.src).pathname.split('/public/js/')[0];

function appUrl(path) {
  const normalizedPath = String(path || '').charAt(0) === '/' ? String(path || '') : '/' + String(path || '');
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.indexOf(appBasePath + '/') === 0) return normalizedPath;
  return appBasePath + normalizedPath;
}

const loginError = document.getElementById('loginError');

async function readJsonResponse(res) {
  const text = (await res.text()).replace(/^\uFEFF+/, '');
  return JSON.parse(text);
}

async function redirectIfLoggedIn() {
  const res = await fetch(appUrl('/api/me'), { credentials: 'same-origin' });
  if (!res.ok) return;
  await readJsonResponse(res);
  window.location.replace(appUrl('/index.html'));
}

const capsWarning = document.getElementById('capsWarning');
function updateCapsWarning(evt) {
  if (!capsWarning || !evt || typeof evt.getModifierState !== 'function') return;
  capsWarning.hidden = !evt.getModifierState('CapsLock');
}
['keydown', 'keyup'].forEach(function (type) {
  loginForm.addEventListener(type, updateCapsWarning);
});
const passwordInput = document.getElementById('password');
if (passwordInput) {
  passwordInput.addEventListener('blur', function () {
    if (capsWarning) capsWarning.hidden = true;
  });
}

if (new URLSearchParams(window.location.search).get('error') === '1') {
  loginError.textContent = 'Credenziali non valide';
}

redirectIfLoggedIn().catch(() => {});
