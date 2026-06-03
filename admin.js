const themeToggleBtn = document.getElementById('themeToggleBtn');
const adminMenu = document.getElementById('adminMenu');
const backToDashboardBtn = document.getElementById('backToDashboardBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminIncidentModal = document.getElementById('adminIncidentModal');
const adminIncidentForm = document.getElementById('adminIncidentForm');
const adminIncidentNameInput = document.getElementById('adminIncidentName');
const adminIncidentPresetInput = document.getElementById('adminIncidentPreset');
const adminSeverityDefaultSelect = document.getElementById('adminSeverityDefault');
const adminSeverityModeSelect = document.getElementById('adminSeverityMode');
const adminFabDefaultSelect = document.getElementById('adminFabDefault');
const addPresetTextFieldBtn = document.getElementById('addPresetTextFieldBtn');
const addPresetSelectFieldBtn = document.getElementById('addPresetSelectFieldBtn');
const userCreateForm = document.getElementById('userCreateForm');
const usersList = document.getElementById('usersList');
const newUsernameInput = document.getElementById('newUsername');
const newPasswordInput = document.getElementById('newPassword');
const newUserRoleSelect = document.getElementById('newUserRole');
const newUserTeamSelect = document.getElementById('newUserTeam');
const chartColorSettings = document.getElementById('chartColorSettings');
const categoryColorSettings = document.getElementById('categoryColorSettings');
const fabColorSettings = document.getElementById('fabColorSettings');
const saveColorSettingsBtn = document.getElementById('saveColorSettingsBtn');

let dragCategoryId = null;
let dragIncidentId = null;
let dragIncidentCategoryId = null;
let editingIncidentId = null;
let adminOverlayPressStarted = false;
let adminModalCloseTimer = null;
let currentAdminUser = null;
let adminCategoriesCache = [];
let adminUiColors = null;
const adminCharts = [
  { key: 'fabDay', label: 'Ticket per FAB (LAST 24H)' },
  { key: 'catDay', label: 'Ticket per categoria (LAST 24H)' },
  { key: 'fabYear', label: 'Ticket per FAB' },
  { key: 'catYear', label: 'Ticket per categoria' },
  { key: 'teamYear', label: 'Ticket per Team' },
  { key: 'severityYear', label: 'Severity Ticket' }
];
const adminFabList = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];

function captureAdminUiState() {
  const openCategoryIds = [...adminMenu.querySelectorAll('.menu-category.open[data-category-id]')]
    .map((el) => Number(el.dataset.categoryId));
  const sidebar = adminMenu.closest('.sidebar');
  const scrollTop = sidebar ? sidebar.scrollTop : 0;
  return { openCategoryIds, scrollTop };
}

function restoreAdminUiState(state) {
  if (!state) return;
  (state.openCategoryIds || []).forEach((id) => {
    const wrap = adminMenu.querySelector(`.menu-category[data-category-id="${id}"]`);
    if (!wrap) return;
    wrap.classList.add('open');
    const toggle = wrap.querySelector('.category-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  });
  const sidebar = adminMenu.closest('.sidebar');
  if (sidebar && Number.isFinite(state.scrollTop)) sidebar.scrollTop = state.scrollTop;
}

function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  const thumb = themeToggleBtn.querySelector('.switch-thumb');
  if (thumb) thumb.textContent = theme === 'dark' ? 'D' : 'L';
}

function defaultUiColors() {
  return {
    charts: {
      fabDay: { light: '#0c5f8c', dark: '#24a0d8' },
      catDay: { light: '#16a0b6', dark: '#2ec4d6' },
      fabYear: { light: '#355a84', dark: '#1fb6ff' },
      catYear: { light: '#6b4ea6', dark: '#9b6cff' }
    },
    labels: {
      categories: { light: {}, dark: {} },
      fabs: { light: {}, dark: {} }
    }
  };
}

function normalizeHexColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : '';
}

function normalizeUiColors(input) {
  const defaults = defaultUiColors();
  const out = {
    charts: {},
    labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} } }
  };
  Object.keys(defaults.charts).forEach((key) => {
    out.charts[key] = { ...defaults.charts[key] };
  });
  if (!input || typeof input !== 'object') return out;
  Object.keys(out.charts).forEach((key) => {
    ['light', 'dark'].forEach((theme) => {
      const next = normalizeHexColor(input?.charts?.[key]?.[theme]);
      if (next) out.charts[key][theme] = next;
    });
  });
  ['categories', 'fabs'].forEach((group) => {
    ['light', 'dark'].forEach((theme) => {
      const rows = input?.labels?.[group]?.[theme];
      if (!rows || typeof rows !== 'object') return;
      Object.keys(rows).forEach((label) => {
        const next = normalizeHexColor(rows[label]);
        if (next) out.labels[group][theme][label] = next;
      });
    });
  });
  return out;
}

function ensureAdminUiColors() {
  if (!adminUiColors) adminUiColors = defaultUiColors();
  adminUiColors = normalizeUiColors(adminUiColors);
}

function buildColorRow(label, lightValue, darkValue, dataKind, dataKey) {
  return `
    <div class="color-setting-row${dataKind === 'chart' ? '' : ' is-compact'}" data-kind="${dataKind}" data-key="${dataKey}">
      <strong>${escapeHtml(label)}</strong>
      <label>Light
        <input type="color" value="${escapeHtml(lightValue)}" data-theme="light" />
      </label>
      <label>Dark
        <input type="color" value="${escapeHtml(darkValue)}" data-theme="dark" />
      </label>
    </div>
  `;
}

function syncColorInputPreview(input) {
  const row = input.closest('.color-setting-row');
  if (!row) return;
  const color = input.value;
  const preview = input.closest('label')?.querySelector('.color-setting-preview');
  if (preview) preview.style.background = color;
}

function renderColorSettings() {
  if (!chartColorSettings || !categoryColorSettings || !fabColorSettings) return;
  ensureAdminUiColors();
  const themeSafe = adminUiColors;
  chartColorSettings.innerHTML = adminCharts.map((chart) => buildColorRow(
    chart.label,
    themeSafe.charts[chart.key].light,
    themeSafe.charts[chart.key].dark,
    'chart',
    chart.key
  )).join('');

  categoryColorSettings.innerHTML = adminCategoriesCache.map((cat) => buildColorRow(
    cat.name,
    themeSafe.labels.categories.light[cat.name] || '#5c6b7d',
    themeSafe.labels.categories.dark[cat.name] || '#9db1c9',
    'category',
    cat.name
  )).join('');

  fabColorSettings.innerHTML = adminFabList.map((fab) => buildColorRow(
    fab,
    themeSafe.labels.fabs.light[fab] || '#5c6b7d',
    themeSafe.labels.fabs.dark[fab] || '#9db1c9',
    'fab',
    fab
  )).join('');

  document.querySelectorAll('.color-setting-row input[type="color"]').forEach((input) => {
    input.addEventListener('input', () => syncColorInputPreview(input));
    syncColorInputPreview(input);
  });
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  adminUiColors = normalizeUiColors(data.ui_colors || data || {});
  renderColorSettings();
}

async function saveUiColors() {
  ensureAdminUiColors();
  const next = defaultUiColors();
  document.querySelectorAll('.color-setting-row').forEach((row) => {
    const kind = row.dataset.kind || '';
    const key = row.dataset.key || '';
    const inputs = row.querySelectorAll('input[type="color"]');
    if (kind === 'chart') {
      inputs.forEach((input) => {
        const theme = input.dataset.theme || 'light';
        const color = normalizeHexColor(input.value);
        if (color) next.charts[key][theme] = color;
      });
      return;
    }
    if (kind === 'category' || kind === 'fab') {
      inputs.forEach((input) => {
        const theme = input.dataset.theme || 'light';
        const color = normalizeHexColor(input.value);
        if (color) next.labels[kind === 'category' ? 'categories' : 'fabs'][theme][key] = color;
      });
    }
  });
  adminUiColors = next;
  await fetchJson('/api/ui-colors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ui_colors: adminUiColors })
  });
  alert('Colori salvati.');
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);
themeToggleBtn.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

backToDashboardBtn.addEventListener('click', () => { window.location.href = '/index.html'; });
logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

function closeIncidentModal() {
  if (!adminIncidentModal) return;
  if (adminModalCloseTimer) clearTimeout(adminModalCloseTimer);
  adminIncidentModal.classList.remove('active');
  adminIncidentModal.classList.add('closing');
  adminIncidentModal.setAttribute('aria-hidden', 'true');
  editingIncidentId = null;
  adminIncidentForm?.reset();
  adminModalCloseTimer = setTimeout(() => {
    adminIncidentModal.classList.remove('show', 'closing');
    adminModalCloseTimer = null;
  }, 260);
}

function openIncidentModal(incident) {
  if (!adminIncidentModal) return;
  if (adminModalCloseTimer) {
    clearTimeout(adminModalCloseTimer);
    adminModalCloseTimer = null;
  }
  adminIncidentModal.classList.remove('closing');
  adminIncidentModal.classList.add('show');
  editingIncidentId = Number(incident.id);
  adminIncidentNameInput.value = incident.name || '';
  adminIncidentPresetInput.value = incident.preset || '';
  adminSeverityDefaultSelect.value = String(incident.severity_default || 1);
  adminSeverityModeSelect.value = incident.severity_mode || 'default';
  adminFabDefaultSelect.value = incident.fab_default || '';
  adminIncidentModal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    adminIncidentModal.classList.add('active');
  });
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('Login richiesta');
  }
  if (res.status === 403) {
    alert('Accesso admin richiesto.');
    window.location.href = '/index.html';
    throw new Error('Accesso admin richiesto');
  }
  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.error || text);
    } catch {
      throw new Error(text);
    }
  }
  return res.json();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadCurrentAdmin() {
  const data = await fetchJson('/api/me');
  currentAdminUser = data.user || null;
}

async function loadUsers() {
  if (!usersList) return;
  try {
    const users = await fetchJson('/api/users');
    if (!users.length) {
      usersList.innerHTML = '<div class="user-row"><span class="muted">Nessun utente</span></div>';
      return;
    }
    usersList.innerHTML = users.map((user) => {
      const isSelf = Number(user.id) === Number(currentAdminUser?.id);
      return `
        <div class="user-row">
          <span class="user-row-id">ID ${Number(user.id)}</span>
          <span>${escapeHtml(user.username)}</span>
          <strong>${escapeHtml(user.role)}</strong>
          <select class="user-team-select" data-user-id="${Number(user.id)}" ${isSelf ? 'disabled' : ''}>
            ${['A', 'B', 'C', 'D', 'E'].map((team) => `<option value="${team}" ${String(user.team || 'A') === team ? 'selected' : ''}>${team}</option>`).join('')}
          </select>
          <button type="button" class="save-user-team-btn" data-user-id="${Number(user.id)}" ${isSelf ? 'disabled' : ''}>Salva</button>
          <button type="button" class="delete-user-btn" data-user-id="${Number(user.id)}" data-username="${escapeHtml(user.username)}" ${isSelf ? 'disabled' : ''}>X</button>
        </div>
      `;
    }).join('');

    usersList.querySelectorAll('.save-user-team-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const userId = Number(btn.dataset.userId);
        if (!userId) return;
        const row = btn.closest('.user-row');
        const teamSelect = row?.querySelector('.user-team-select');
        const team = teamSelect?.value || 'A';
        try {
          await fetchJson(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team })
          });
          await loadUsers();
        } catch (error) {
          alert(`Errore salvataggio team: ${error.message || error}`);
        }
      });
    });

    usersList.querySelectorAll('.delete-user-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const userId = Number(btn.dataset.userId);
        const username = btn.dataset.username || '';
        if (!userId) return;
        const ok = confirm(`Eliminare utente "${username}"?`);
        if (!ok) return;
        try {
          await fetchJson(`/api/users/${userId}`, { method: 'DELETE' });
          await loadUsers();
        } catch (error) {
          alert(`Errore eliminazione utente: ${error.message || error}`);
        }
      });
    });
  } catch (error) {
    usersList.innerHTML = `<div class="user-row"><span class="muted">Errore caricamento utenti: ${escapeHtml(error.message || error)}</span></div>`;
  }
}

async function persistCategoryOrder() {
  const orderedIds = [...adminMenu.querySelectorAll('.menu-category[data-category-id]')].map((el) => Number(el.dataset.categoryId));
  await fetchJson('/api/categories/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds })
  });
}

async function persistIncidentOrder(categoryId, ul) {
  const orderedIds = [...ul.querySelectorAll('li[data-incident-id]')].map((el) => Number(el.dataset.incidentId));
  await fetchJson('/api/incidents/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_id: Number(categoryId), orderedIds })
  });
}

async function loadAdminMenu(state = captureAdminUiState()) {
  const categories = await fetchJson('/api/categories');
  adminCategoriesCache = categories;
  adminMenu.innerHTML = '';

  categories.forEach((cat) => {
    const wrap = document.createElement('div');
    wrap.className = 'menu-category';
    wrap.dataset.categoryId = String(cat.id);
    wrap.draggable = true;

    wrap.addEventListener('dragstart', () => {
      dragCategoryId = cat.id;
      wrap.classList.add('dragging-category');
    });
    wrap.addEventListener('dragend', () => {
      dragCategoryId = null;
      wrap.classList.remove('dragging-category');
    });
    wrap.addEventListener('dragover', (e) => e.preventDefault());
    wrap.addEventListener('drop', async (e) => {
      e.preventDefault();
      const targetId = cat.id;
      if (!dragCategoryId || dragCategoryId === targetId) return;
      const draggedEl = adminMenu.querySelector(`.menu-category[data-category-id="${dragCategoryId}"]`);
      const targetEl = adminMenu.querySelector(`.menu-category[data-category-id="${targetId}"]`);
      if (!draggedEl || !targetEl) return;
      adminMenu.insertBefore(draggedEl, targetEl);
      await persistCategoryOrder();
      await loadAdminMenu();
    });

    const catBtn = document.createElement('div');
    catBtn.className = 'category-toggle';
    catBtn.setAttribute('role', 'button');
    catBtn.tabIndex = 0;
    catBtn.setAttribute('aria-expanded', 'false');
    catBtn.innerHTML = `<span>${cat.name}</span><span class="admin-actions"><button type="button" class="tiny-edit" aria-label="Modifica categoria" title="Modifica categoria" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}">&#9998;</button><button type="button" class="tiny-add" data-type="incident" data-id="${cat.id}" title="Nuovo incident">+</button><button type="button" class="tiny-delete" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" title="Elimina categoria">x</button></span>`;

    const ul = document.createElement('ul');
    ul.className = 'incident-list';
    cat.incidents.forEach((inc) => {
      const li = document.createElement('li');
      li.dataset.incidentId = String(inc.id);
      li.draggable = true;
      const firstPreset = Array.isArray(inc.presets) ? (inc.presets[0] || '') : '';
      li.innerHTML = `<div class="incident-btn"><span>${inc.name}</span><span class="admin-actions"><button type="button" class="tiny-edit" aria-label="Modifica incident" title="Modifica incident" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" data-preset="${firstPreset.replace(/"/g, '&quot;')}" data-severity-default="${Number(inc.severity_default || 1)}" data-severity-mode="${inc.severity_mode || 'default'}" data-fab-default="${inc.fab_default || ''}">&#9998;</button><button type="button" class="tiny-delete" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" title="Elimina incident">x</button></span></div>`;

      li.addEventListener('dragstart', () => {
        dragIncidentId = inc.id;
        dragIncidentCategoryId = cat.id;
        li.classList.add('dragging-incident');
      });
      li.addEventListener('dragend', () => {
        dragIncidentId = null;
        dragIncidentCategoryId = null;
        li.classList.remove('dragging-incident');
      });
      li.addEventListener('dragover', (e) => e.preventDefault());
      li.addEventListener('drop', async (e) => {
        e.preventDefault();
        const targetId = inc.id;
        if (!dragIncidentId || dragIncidentId === targetId) return;
        if (dragIncidentCategoryId !== cat.id) return;
        const draggedEl = ul.querySelector(`li[data-incident-id="${dragIncidentId}"]`);
        const targetEl = ul.querySelector(`li[data-incident-id="${targetId}"]`);
        if (!draggedEl || !targetEl) return;
        ul.insertBefore(draggedEl, targetEl);
        try {
          await persistIncidentOrder(cat.id, ul);
          await loadAdminMenu();
          const rebuilt = adminMenu.querySelector(`.menu-category[data-category-id="${cat.id}"]`);
          if (rebuilt) {
            rebuilt.classList.add('open');
            const rebuiltToggle = rebuilt.querySelector('.category-toggle');
            if (rebuiltToggle) rebuiltToggle.setAttribute('aria-expanded', 'true');
          }
        } catch (error) {
          alert(`Errore ordinamento incident: ${error.message || error}`);
          await loadAdminMenu();
        }
      });
      ul.appendChild(li);
    });

    catBtn.addEventListener('click', () => {
      const isOpen = wrap.classList.toggle('open');
      catBtn.setAttribute('aria-expanded', String(isOpen));
    });
    catBtn.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const isOpen = wrap.classList.toggle('open');
      catBtn.setAttribute('aria-expanded', String(isOpen));
    });

    wrap.appendChild(catBtn);
    wrap.appendChild(ul);
    adminMenu.appendChild(wrap);
  });

  const addCategoryWrap = document.createElement('div');
  addCategoryWrap.className = 'menu-category';
  addCategoryWrap.innerHTML = '<button class="category-toggle" type="button" id="addCategoryBtn">+ Nuova Categoria</button>';
  adminMenu.appendChild(addCategoryWrap);

  bindAdminActions();
  restoreAdminUiState(state);
  renderColorSettings();
}

function bindAdminActions() {
  document.querySelectorAll('.tiny-edit').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const type = btn.dataset.type;
        const id = Number(btn.dataset.id);
        const current = btn.dataset.name || '';

        if (type === 'category') {
          const next = prompt('Nuovo nome categoria:', current);
          if (!next || !next.trim()) return;
          await fetchJson(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: next.trim() })
          });
          await loadAdminMenu();
          return;
        }

        openIncidentModal({
          id,
          name: current,
          preset: btn.dataset.preset || '',
          severity_default: Number(btn.dataset.severityDefault || 1),
          severity_mode: btn.dataset.severityMode || 'default',
          fab_default: btn.dataset.fabDefault || ''
        });
      } catch (error) {
        alert(`Errore modifica: ${error.message || error}`);
      }
    });
  });

  document.querySelectorAll('.tiny-add').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const categoryId = Number(btn.dataset.id);
        const name = prompt('Nome nuovo incident:');
        if (!name || !name.trim()) return;
        await fetchJson('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: categoryId, name: name.trim() })
        });
        await loadAdminMenu();
      } catch (error) {
        alert(`Errore creazione incident: ${error.message || error}`);
      }
    });
  });

  document.querySelectorAll('.tiny-delete').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const type = btn.dataset.type;
        const id = Number(btn.dataset.id);
        const name = btn.dataset.name || '';
        const ok = type === 'category'
          ? confirm(`Eliminare categoria "${name}" e tutti gli incident collegati?`)
          : confirm(`Eliminare incident "${name}"?`);
        if (!ok) return;
        if (type === 'category') {
          await fetchJson(`/api/categories/${id}`, { method: 'DELETE' });
        } else {
          await fetchJson(`/api/incidents/${id}`, { method: 'DELETE' });
        }
        await loadAdminMenu();
      } catch (error) {
        alert(`Errore eliminazione: ${error.message || error}`);
      }
    });
  });

  const addCategoryBtn = document.getElementById('addCategoryBtn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', async () => {
      try {
        const name = prompt('Nome nuova categoria:');
        if (!name || !name.trim()) return;
        await fetchJson('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() })
        });
        await loadAdminMenu();
      } catch (error) {
        alert(`Errore creazione categoria: ${error.message || error}`);
      }
    });
  }
}

document.querySelectorAll('.close-modal').forEach((btn) => {
  btn.addEventListener('click', closeIncidentModal);
});

adminIncidentModal?.addEventListener('mousedown', (e) => {
  adminOverlayPressStarted = e.target === adminIncidentModal;
});

adminIncidentModal?.addEventListener('mouseup', (e) => {
  if (e.target === adminIncidentModal && adminOverlayPressStarted) closeIncidentModal();
  adminOverlayPressStarted = false;
});

adminIncidentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editingIncidentId) return;

  const nextName = (adminIncidentNameInput.value || '').trim();
  const preset = (adminIncidentPresetInput.value || '').trim();
  const severity_default = Number(adminSeverityDefaultSelect.value || 1);
  const severity_mode = (adminSeverityModeSelect.value || 'default').toString();
  const fab_default = (adminFabDefaultSelect.value || '').trim().toUpperCase();
  if (!nextName) return;

  await fetchJson(`/api/incidents/${editingIncidentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nextName, severity_default, severity_mode, fab_default })
  });

  await fetchJson(`/api/incidents/${editingIncidentId}/presets`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presets: preset ? [preset] : [] })
  });

  closeIncidentModal();
  await loadAdminMenu();
});

userCreateForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = (newUsernameInput?.value || '').trim();
  const password = (newPasswordInput?.value || '').trim();
  const role = (newUserRoleSelect?.value || 'user').trim();
  const team = (newUserTeamSelect?.value || 'A').trim();
  if (!username || !password) {
    alert('Inserisci username e password.');
    return;
  }
  try {
    await fetchJson('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, team })
    });
    userCreateForm.reset();
    if (newUserRoleSelect) newUserRoleSelect.value = 'user';
    if (newUserTeamSelect) newUserTeamSelect.value = 'A';
    await loadUsers();
  } catch (error) {
    alert(`Errore creazione utente: ${error.message || error}`);
  }
});

(async function initAdminPage() {
  await loadCurrentAdmin();
  await Promise.all([loadAdminMenu(null), loadUsers(), loadUiColors()]);
})();

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = `${before}${text}${after}`;
  const pos = start + text.length;
  textarea.setSelectionRange(pos, pos);
  textarea.focus();
}

addPresetTextFieldBtn?.addEventListener('click', () => {
  const label = prompt('Nome campo testo (es. Entity):');
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[text:${label.trim()}]]`);
});

addPresetSelectFieldBtn?.addEventListener('click', () => {
  const label = prompt('Nome menu tendina (es. Motivo):');
  if (!label || !label.trim()) return;
  const optionsRaw = prompt('Opzioni separate da virgola (es. timeout,reset,busy):');
  if (!optionsRaw || !optionsRaw.trim()) return;
  const options = optionsRaw.split(',').map((x) => x.trim()).filter(Boolean);
  if (!options.length) return;
  insertAtCursor(adminIncidentPresetInput, `[[select:${label.trim()}|${options.join(',')}]]`);
});

saveColorSettingsBtn?.addEventListener('click', async () => {
  try {
    await saveUiColors();
  } catch (error) {
    alert(`Errore salvataggio colori: ${error.message || error}`);
  }
});
