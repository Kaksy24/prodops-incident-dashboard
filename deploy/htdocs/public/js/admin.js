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
const adminColorEditorTitle = document.getElementById('adminColorEditorTitle');
const adminColorEditorMeta = document.getElementById('adminColorEditorMeta');
const adminColorEditorSwatch = document.getElementById('adminColorEditorSwatch');
const adminColorEditorInput = document.getElementById('adminColorEditorInput');
const adminChartsPreview = document.getElementById('adminChartsPreview');
const uiColorThemeToggleBtn = document.getElementById('uiColorThemeToggleBtn');
const saveColorSettingsBtn = document.getElementById('saveColorSettingsBtn');
const uiColorsSyncKey = 'prodops_ui_colors_updated_at';

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
let adminColorSelection = null;
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

function adminThemeFallbackOrder() {
  return adminColorEditTheme === 'dark' ? ['dark', 'light'] : ['light', 'dark'];
}

function getAdminThemeColor(group, label) {
  ensureAdminUiColors();
  const [theme, fallbackTheme] = adminThemeFallbackOrder();
  const normalizedLabel = String(label || '');
  const color = adminUiColors?.labels?.[group]?.[theme]?.[normalizedLabel] || adminUiColors?.labels?.[group]?.[fallbackTheme]?.[normalizedLabel];
  return normalizeHexColor(color) || colorForLabel(normalizedLabel);
}

function chartGroupForId(chartId) {
  if (chartId === 'fabDayChart' || chartId === 'fabYearChart') return 'fabs';
  if (chartId === 'catDayChart' || chartId === 'catYearChart') return 'categories';
  if (chartId === 'teamYearChart') return 'teams';
  if (chartId === 'severityYearChart') return 'severities';
  return '';
}

function chartKeysForGroup(group) {
  if (group === 'fabs') return ['fabDay', 'fabYear'];
  if (group === 'categories') return ['catDay', 'catYear'];
  if (group === 'teams') return ['teamYear'];
  if (group === 'severities') return ['severityYear'];
  return [];
}

const chartTypeStorageKey = 'prodops_chart_types';
const chartTypeChoices = [
  { value: 'column', label: 'Colonne' },
  { value: 'bar', label: 'Barre orizzontali' },
  { value: 'donut', label: 'Ciambella' },
  { value: 'pie', label: 'Torta' },
  { value: 'line', label: 'Linea' }
];
let adminChartTypes = defaultChartTypes();

function defaultChartTypes() {
  return {
    fabDay: 'column',
    catDay: 'column',
    fabYear: 'bar',
    catYear: 'bar',
    teamYear: 'donut',
    severityYear: 'line'
  };
}

function normalizeChartType(value) {
  const allowed = new Set(chartTypeChoices.map((item) => item.value));
  return allowed.has(value) ? value : 'column';
}

function loadChartTypes() {
  const defaults = defaultChartTypes();
  try {
    const raw = localStorage.getItem(chartTypeStorageKey);
    if (!raw) {
      adminChartTypes = defaults;
      localStorage.setItem(chartTypeStorageKey, JSON.stringify(adminChartTypes));
      return adminChartTypes;
    }
    const parsed = JSON.parse(raw);
    adminChartTypes = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      adminChartTypes[key] = normalizeChartType(parsed?.[key] || defaults[key]);
    });
  } catch (error) {
    adminChartTypes = defaults;
  }
  return adminChartTypes;
}

function saveChartTypes() {
  try {
    localStorage.setItem(chartTypeStorageKey, JSON.stringify(adminChartTypes));
  } catch (error) {
    // ignore storage issues
  }
}

function getChartType(chartKey) {
  return normalizeChartType(adminChartTypes?.[chartKey] || defaultChartTypes()[chartKey] || 'column');
}

function getSelectedColor() {
  if (!adminColorSelection) return '';
  const [theme, fallbackTheme] = adminThemeFallbackOrder();
  return normalizeHexColor(adminUiColors?.labels?.[adminColorSelection.group]?.[theme]?.[adminColorSelection.label]) || normalizeHexColor(adminUiColors?.labels?.[adminColorSelection.group]?.[fallbackTheme]?.[adminColorSelection.label]) || getAdminThemeColor(adminColorSelection.group, adminColorSelection.label);
}

function setSelectedColor(color) {
  if (!adminColorSelection) return;
  ensureAdminUiColors();
  const clean = normalizeHexColor(color);
  if (!clean) return;
  if (!adminUiColors.labels[adminColorSelection.group]) adminUiColors.labels[adminColorSelection.group] = { light: {}, dark: {} };
  adminUiColors.labels[adminColorSelection.group][adminColorEditTheme][adminColorSelection.label] = clean;
  chartKeysForGroup(adminColorSelection.group).forEach((chartKey) => {
    if (!adminUiColors.bars[chartKey]) adminUiColors.bars[chartKey] = { light: {}, dark: {} };
    adminUiColors.bars[chartKey][adminColorEditTheme][adminColorSelection.label] = clean;
  });
  updateColorEditor();
  renderColorSettings();
}

function getAdminBarColor(chartKey, group, label) {
  ensureAdminUiColors();
  const [theme, fallbackTheme] = adminThemeFallbackOrder();
  const normalizedLabel = String(label || '');
  const chartColor = adminUiColors?.bars?.[chartKey]?.[theme]?.[normalizedLabel] || adminUiColors?.bars?.[chartKey]?.[fallbackTheme]?.[normalizedLabel];
  if (normalizeHexColor(chartColor)) return normalizeHexColor(chartColor);
  const groupColor = adminUiColors?.labels?.[group]?.[theme]?.[normalizedLabel] || adminUiColors?.labels?.[group]?.[fallbackTheme]?.[normalizedLabel];
  return normalizeHexColor(groupColor) || colorForLabel(normalizedLabel);
}

function updateColorEditor() {
  if (!adminColorEditorTitle || !adminColorEditorMeta || !adminColorEditorInput || !adminColorEditorSwatch) return;
  if (!adminColorSelection) {
    adminColorEditorTitle.textContent = 'Nessuna barra selezionata';
    adminColorEditorMeta.textContent = 'Clicca una colonna sotto per iniziare a modificarla.';
    adminColorEditorInput.value = '#0c5f8c';
    adminColorEditorInput.disabled = true;
    adminColorEditorSwatch.style.background = '#0c5f8c';
    return;
  }
  const color = getSelectedColor();
  adminColorEditorTitle.textContent = `${adminColorSelection.chartLabel} — ${adminColorSelection.label}`;
  adminColorEditorMeta.textContent = `Tema attivo: ${adminColorEditTheme.toUpperCase()}`;
  adminColorEditorInput.disabled = false;
  adminColorEditorInput.value = color;
  adminColorEditorSwatch.style.background = color;
}

function selectAdminColorTarget(chartId, label) {
  const group = chartGroupForId(chartId);
  if (!group) return;
  const chartLabel = adminCharts.find((chart) => chart.key === chartId.replace('Chart', ''))?.label || chartId;
  adminColorSelection = {
    chartId,
    chartLabel,
    group,
    label: String(label || '')
  };
  updateColorEditor();
}

function syncAdminColorToggle() {
  if (!uiColorThemeToggleBtn) return;
  const thumb = uiColorThemeToggleBtn.querySelector('.switch-thumb');
  if (thumb) thumb.textContent = adminColorEditTheme === 'dark' ? 'D' : 'L';
  uiColorThemeToggleBtn.setAttribute('aria-pressed', String(adminColorEditTheme === 'dark'));
  updateColorEditor();
}

function applyAdminColorTheme(theme) {
  adminColorEditTheme = theme === 'dark' ? 'dark' : 'light';
  syncAdminColorToggle();
  renderColorSettings();
}

function renderAdminColumnChart(target, chartKey, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  target.innerHTML = '';
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
  const group = chartGroupForId(`${chartKey}Chart`);
  sortedStats.forEach((item) => {
    const label = String(item.label || '');
    const total = Number(item.total || 0);
    const height = Math.round((total / max) * 180);
    const pct = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0;
    const color = getAdminBarColor(chartKey, group, label);
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'bar admin-bar-button';
    bar.dataset.group = group;
    bar.dataset.label = label;
    bar.dataset.chartId = chartKey;
    bar.innerHTML = `<span class="bar-value">${total}</span><div class="bar-fill" style="height:${height}px;background:${color}"><span class="bar-pct">${pct}%</span></div><span class="bar-label">${escapeHtml(label)}</span>`;
    bar.addEventListener('click', () => {
      selectAdminColorTarget(`${chartKey}Chart`, label);
    });
    barsWrap.appendChild(bar);
  });
  inner.appendChild(axis);
  inner.appendChild(barsWrap);
  chartWrap.appendChild(inner);
  target.appendChild(chartWrap);
}

function renderAdminHorizontalChart(target, chartKey, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  target.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'chart-horizontal-wrap';
  const group = chartGroupForId(`${chartKey}Chart`);
  sortedStats.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'chart-horizontal-row';
    const width = Math.round((item.total / max) * 100);
    const pct = Math.round((item.total / Math.max(sortedStats.reduce((sum, x) => sum + x.total, 0), 1)) * 100);
    const color = getAdminBarColor(chartKey, group, String(item.label || ''));
    row.innerHTML = `
      <span class="chart-horizontal-label">${escapeHtml(item.label)}</span>
      <div class="chart-horizontal-track"><div class="bar-fill" style="width:${width}%;background:${color}"><span class="bar-pct">${pct}%</span></div></div>
      <span class="chart-horizontal-value">${item.total}</span>
    `;
    row.addEventListener('click', () => selectAdminColorTarget(`${chartKey}Chart`, String(item.label || '')));
    wrap.appendChild(row);
  });
  target.appendChild(wrap);
}

function renderAdminPieOrDonutChart(target, chartKey, stats, isDonut) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  target.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = `chart-pie-layout${isDonut ? ' donut' : ' pie'}`;
  const visual = document.createElement('div');
  visual.className = `chart-pie-visual${isDonut ? ' donut' : ' pie'}`;
  let angle = 0;
  const gradient = sortedStats.length
    ? sortedStats.map((item) => {
        const pct = totalAll > 0 ? (item.total / totalAll) * 100 : 0;
        const color = getAdminBarColor(chartKey, chartGroupForId(`${chartKey}Chart`), String(item.label || ''));
        const part = `${color} ${angle}% ${angle + pct}%`;
        angle += pct;
        return part;
      }).join(', ')
    : '#d9e3ee 0% 100%';
  visual.style.background = `conic-gradient(${gradient})`;
  if (isDonut) {
    const center = document.createElement('div');
    center.className = 'chart-pie-center';
    center.innerHTML = `<strong>${totalAll}</strong><span>Totale</span>`;
    visual.appendChild(center);
  }
  const legend = document.createElement('div');
  legend.className = 'chart-pie-legend';
  sortedStats.forEach((item) => {
    const pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'chart-pie-legend-row';
    row.innerHTML = `
      <span class="chart-pie-swatch" style="background:${getAdminBarColor(chartKey, chartGroupForId(`${chartKey}Chart`), String(item.label || ''))}"></span>
      <span class="chart-pie-label">${escapeHtml(item.label)}</span>
      <strong class="chart-pie-value">${item.total}</strong>
      <span class="chart-pie-percent">${pct}%</span>
    `;
    row.addEventListener('click', () => selectAdminColorTarget(`${chartKey}Chart`, String(item.label || '')));
    legend.appendChild(row);
  });
  layout.appendChild(visual);
  layout.appendChild(legend);
  target.appendChild(layout);
}

function renderAdminLineChart(target, chartKey, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  target.innerHTML = '';
  const width = 320;
  const height = 200;
  const padding = 26;
  const usableWidth = width - (padding * 2);
  const usableHeight = height - (padding * 2);
  const points = sortedStats.map((item, index) => {
    const x = sortedStats.length === 1 ? width / 2 : padding + (usableWidth * index) / (sortedStats.length - 1);
    const y = height - padding - ((item.total / max) * usableHeight);
    return { x, y, item };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'chart-line-svg');
  svg.innerHTML = `
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-line-axis"></line>
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-line-axis"></line>
    <path d="${path}" class="chart-line-path"></path>
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4.5" class="chart-line-point" fill="${getAdminBarColor(chartKey, chartGroupForId(`${chartKey}Chart`), String(point.item.label || ''))}"></circle>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" text-anchor="middle" class="chart-line-label">${escapeHtml(point.item.label)}</text>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${point.y - 10}" text-anchor="middle" class="chart-line-value">${point.item.total}</text>`).join('')}
  `;
  target.appendChild(svg);
}

function renderAdminChartByType(chart, stats, target) {
  const type = getChartType(chart.key);
  if (type === 'bar') return renderAdminHorizontalChart(target, chart.key, stats);
  if (type === 'donut') return renderAdminPieOrDonutChart(target, chart.key, stats, true);
  if (type === 'pie') return renderAdminPieOrDonutChart(target, chart.key, stats, false);
  if (type === 'line') return renderAdminLineChart(target, chart.key, stats);
  return renderAdminColumnChart(target, chart.key, stats);
}

function renderAdminChart(chart, stats) {
  const card = document.createElement('section');
  card.className = 'panel admin-chart-card';
  card.dataset.chartId = chart.key;
  card.innerHTML = `
    <div class="panel-heading-row">
      <div>
        <h3>${escapeHtml(chart.label)}</h3>
        <p class="muted">Clicca una barra per cambiarne il colore nel tema ${escapeHtml(adminColorEditTheme)}.</p>
      </div>
      <div class="chart-controls">
        <select class="chart-type-select" data-chart-target="${chart.key}" aria-label="Tipo grafico ${escapeHtml(chart.label)}">
          ${chartTypeChoices.map((choice) => `<option value="${choice.value}">${choice.label}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart admin-chart';
  renderAdminChartByType(chart, stats, chartWrap);
  card.appendChild(chartWrap);
  const select = card.querySelector('.chart-type-select');
  if (select) {
    select.value = getChartType(chart.key);
    select.addEventListener('change', () => {
      adminChartTypes[chart.key] = normalizeChartType(select.value);
      saveChartTypes();
      renderColorSettings();
    });
  }
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
  updateColorEditor();
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
  try {
    localStorage.setItem(uiColorsSyncKey, String(Date.now()));
  } catch (error) {
    // ignore storage issues
  }
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

async function fetchJson(url, options, attempt = 0) {
  const res = await fetch(url, options);
  const text = (await res.text()).replace(/^\uFEFF+/, '');
  const contentType = res.headers.get('content-type') || '';
  const looksLikeAntiBotPage = /slowAES|aes\.js|This site requires Javascript to work/i.test(text);
  const looksLikeJson = /json/i.test(contentType) || text.startsWith('{') || text.startsWith('[');
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('Login richiesta');
  }
  if (res.status === 403) {
    alert('Accesso admin richiesto.');
    window.location.href = '/index.html';
    throw new Error('Accesso admin richiesto');
  }
  if (looksLikeAntiBotPage || !looksLikeJson) {
    if (attempt < 2) {
      await delay(450 * (attempt + 1));
      return fetchJson(url, options, attempt + 1);
    }
    throw new Error('Risposta temporaneamente non disponibile');
  }
  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.error || text);
    } catch {
      if (attempt < 2) {
        await delay(450 * (attempt + 1));
        return fetchJson(url, options, attempt + 1);
      }
      throw new Error(text);
    }
  }
  return JSON.parse(text);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadCurrentAdmin() {
  try {
    const data = await fetchJson('/api/me');
    currentAdminUser = data.user || null;
  } catch (error) {
    currentAdminUser = null;
  }
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
  let categories = [];
  try {
    categories = await fetchJson('/api/categories');
  } catch (error) {
    adminMenu.innerHTML = `<div class="menu-category"><div class="category-toggle" role="alert"><span>Impossibile caricare categorie/incidents</span></div></div>`;
    throw error;
  }
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
  loadChartTypes();
  syncAdminColorToggle();
  await Promise.allSettled([
    loadAdminMenu(null),
    loadUsers(),
    loadUiColors(),
    loadAdminChartsPreviewData()
  ]);
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

adminColorEditorInput?.addEventListener('input', () => setSelectedColor(adminColorEditorInput.value));

window.addEventListener('storage', (event) => {
  if (event.key === chartTypeStorageKey) {
    loadChartTypes();
    renderColorSettings();
  }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    loadChartTypes();
    renderColorSettings();
  }
});
