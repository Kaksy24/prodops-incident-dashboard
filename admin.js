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
const adminChartsPreview = document.getElementById('adminChartsPreview');
const uiColorThemeToggleBtn = document.getElementById('uiColorThemeToggleBtn');
const adminColorPicker = document.getElementById('adminColorPicker');
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
let adminChartStats = null;
let adminColorEditTheme = 'light';
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
      catYear: { light: '#6b4ea6', dark: '#9b6cff' },
      teamYear: { light: '#d97706', dark: '#f59e0b' },
      severityYear: { light: '#be185d', dark: '#ec4899' }
    },
    bars: {},
    labels: {
      categories: { light: {}, dark: {} },
      fabs: { light: {}, dark: {} },
      teams: { light: {}, dark: {} },
      severities: { light: {}, dark: {} }
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
    bars: {},
    labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} }, teams: { light: {}, dark: {} }, severities: { light: {}, dark: {} } }
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
  ['categories', 'fabs', 'teams', 'severities'].forEach((group) => {
    ['light', 'dark'].forEach((theme) => {
      const rows = input?.labels?.[group]?.[theme];
      if (!rows || typeof rows !== 'object') return;
      Object.keys(rows).forEach((label) => {
        const next = normalizeHexColor(rows[label]);
        if (next) out.labels[group][theme][label] = next;
      });
    });
  });
  if (input?.bars && typeof input.bars === 'object') {
    Object.keys(input.bars).forEach((chartKey) => {
      if (!out.bars[chartKey]) out.bars[chartKey] = { light: {}, dark: {} };
      ['light', 'dark'].forEach((theme) => {
        const rows = input.bars?.[chartKey]?.[theme];
        if (!rows || typeof rows !== 'object') return;
        Object.keys(rows).forEach((label) => {
          const next = normalizeHexColor(rows[label]);
          if (next) out.bars[chartKey][theme][label] = next;
        });
      });
    });
  }
  return out;
}

function ensureAdminUiColors() {
  if (!adminUiColors) adminUiColors = defaultUiColors();
  adminUiColors = normalizeUiColors(adminUiColors);
}

function colorForLabel(label) {
  let hash = 0;
  const text = String(label || '');
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i);
  const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#17becf', '#bcbd22', '#8c564b', '#e377c2', '#7f7f7f'];
  return palette[Math.abs(hash) % palette.length];
}

function getAdminThemeColor(group, label) {
  ensureAdminUiColors();
  const theme = adminColorEditTheme;
  const normalizedLabel = String(label || '');
  const color = adminUiColors?.labels?.[group]?.[theme]?.[normalizedLabel];
  return normalizeHexColor(color) || colorForLabel(normalizedLabel);
}

function syncAdminColorToggle() {
  if (!uiColorThemeToggleBtn) return;
  const thumb = uiColorThemeToggleBtn.querySelector('.switch-thumb');
  if (thumb) thumb.textContent = adminColorEditTheme === 'dark' ? 'D' : 'L';
  uiColorThemeToggleBtn.setAttribute('aria-pressed', String(adminColorEditTheme === 'dark'));
}

function applyAdminColorTheme(theme) {
  adminColorEditTheme = theme === 'dark' ? 'dark' : 'light';
  syncAdminColorToggle();
  renderColorSettings();
}

function renderAdminChart(chart, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  const card = document.createElement('section');
  card.className = 'panel admin-chart-card';
  card.dataset.chartId = chart.key;
  card.innerHTML = `
    <div class="panel-heading-row">
      <div>
        <h3>${escapeHtml(chart.label)}</h3>
        <p class="muted">Clicca una colonna per cambiarne il colore nel tema ${escapeHtml(adminColorEditTheme)}.</p>
      </div>
    </div>
  `;

  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart vertical-chart';
  const inner = document.createElement('div');
  inner.className = 'chart-inner';
  const axis = document.createElement('div');
  axis.className = 'chart-y-axis';
  const tickValues = Array.from({ length: 5 }, (_, i) => Math.round((max * (4 - i)) / 4));
  axis.innerHTML = tickValues.map((value) => `<span>${value}</span>`).join('');
  const barsWrap = document.createElement('div');
  barsWrap.className = 'chart-bars-wrap';
  const group = chart.key.indexOf('fab') === 0 ? 'fabs' : chart.key.indexOf('cat') === 0 ? 'categories' : chart.key === 'teamYear' ? 'teams' : 'severities';
  sortedStats.forEach((item) => {
    const label = String(item.label || '');
    const total = Number(item.total || 0);
    const height = Math.round((total / max) * 180);
    const pct = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0;
    const color = getAdminThemeColor(group, label);
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'bar admin-bar-button';
    bar.dataset.group = group;
    bar.dataset.label = label;
    bar.dataset.chartId = chart.key;
    bar.innerHTML = `<span class="bar-value">${total}</span><div class="bar-fill" style="height:${height}px;background:${color}"><span class="bar-pct">${pct}%</span></div><span class="bar-label">${escapeHtml(label)}</span>`;
    bar.addEventListener('click', () => {
      if (!adminColorPicker) return;
      const currentColor = getAdminThemeColor(group, label);
      adminColorPicker.value = currentColor || '#000000';
      adminColorPicker.dataset.group = group;
      adminColorPicker.dataset.label = label;
      if (typeof adminColorPicker.showPicker === 'function') {
        adminColorPicker.showPicker();
      } else {
        adminColorPicker.click();
      }
    });
    barsWrap.appendChild(bar);
  });
  inner.appendChild(axis);
  inner.appendChild(barsWrap);
  chartWrap.appendChild(inner);
  card.appendChild(chartWrap);
  return card;
}

function renderColorSettings() {
  if (!adminChartsPreview || !adminChartStats) return;
  ensureAdminUiColors();
  adminChartsPreview.innerHTML = '';
  adminCharts.forEach((chart) => {
    const card = renderAdminChart(chart, adminChartStats[chart.key] || []);
    adminChartsPreview.appendChild(card);
  });
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  adminUiColors = normalizeUiColors(data.ui_colors || data || {});
  renderColorSettings();
}

async function loadAdminChartsPreviewData() {
  try {
    const [fabDay, catDay, fabYear, catYear, teamYear, severityYear] = await Promise.all([
      fetchJson('/api/stats/fab/current-day'),
      fetchJson('/api/stats/category/current-day'),
      fetchJson('/api/stats/fab/current-year?mode=months'),
      fetchJson('/api/stats/category/current-year?mode=months'),
      fetchJson('/api/stats/team/current-year?mode=months'),
      fetchJson('/api/stats/severity/current-year?mode=months')
    ]);
    adminChartStats = {
      fabDay: fabDay.stats || [],
      catDay: catDay.stats || [],
      fabYear: fabYear.stats || [],
      catYear: catYear.stats || [],
      teamYear: teamYear.stats || [],
      severityYear: severityYear.stats || []
    };
    renderColorSettings();
  } catch (error) {
    adminChartStats = {};
    if (adminChartsPreview) {
      adminChartsPreview.innerHTML = `<p class="muted">Impossibile caricare l'anteprima dei grafici: ${escapeHtml(error.message || error)}</p>`;
    }
  }
}

async function saveUiColors() {
  ensureAdminUiColors();
  adminUiColors = normalizeUiColors(adminUiColors);
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
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
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
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
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
  syncAdminColorToggle();
  await Promise.all([loadAdminMenu(null), loadUsers(), loadUiColors(), loadAdminChartsPreviewData()]);
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

uiColorThemeToggleBtn?.addEventListener('click', () => {
  const next = adminColorEditTheme === 'dark' ? 'light' : 'dark';
  applyAdminColorTheme(next);
});

adminColorPicker?.addEventListener('input', () => {
  const group = adminColorPicker.dataset.group || '';
  const label = adminColorPicker.dataset.label || '';
  const color = normalizeHexColor(adminColorPicker.value);
  if (!group || !label || !color) return;
  ensureAdminUiColors();
  if (!adminUiColors.labels[group]) adminUiColors.labels[group] = { light: {}, dark: {} };
  if (!adminUiColors.labels[group][adminColorEditTheme]) adminUiColors.labels[group][adminColorEditTheme] = {};
  adminUiColors.labels[group][adminColorEditTheme][label] = color;
  renderColorSettings();
});
