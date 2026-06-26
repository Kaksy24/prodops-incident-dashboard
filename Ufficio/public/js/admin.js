const themeToggleBtn = document.getElementById('themeToggleBtn');
const appBasePath = new URL(document.currentScript.src).pathname.split('/public/js/')[0];

function appUrl(path) {
  const normalizedPath = String(path || '').charAt(0) === '/' ? String(path || '') : '/' + String(path || '');
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.indexOf(appBasePath + '/') === 0) return normalizedPath;
  return appBasePath + normalizedPath;
}

const adminMenu = document.getElementById('adminMenu');
const backToDashboardBtn = document.getElementById('backToDashboardBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminIncidentModal = document.getElementById('adminIncidentModal');
const adminIncidentForm = document.getElementById('adminIncidentForm');
const userCreateModal = document.getElementById('userCreateModal');
const openUserCreateModalBtn = document.getElementById('openUserCreateModalBtn');
const adminIncidentNameInput = document.getElementById('adminIncidentName');
const adminIncidentPresetInput = document.getElementById('adminIncidentPreset');
const adminSeverityDefaultSelect = document.getElementById('adminSeverityDefault');
const adminSeverityModeSelect = document.getElementById('adminSeverityMode');
const adminFabDefaultSelect = document.getElementById('adminFabDefault');
const addPresetTextFieldBtn = document.getElementById('addPresetTextFieldBtn');
const addPresetSelectFieldBtn = document.getElementById('addPresetSelectFieldBtn');
const addPresetTimestampBtn = document.getElementById('addPresetTimestampBtn');
const userCreateForm = document.getElementById('userCreateForm');
const usersList = document.getElementById('usersList');
const usersSummary = document.getElementById('usersSummary');
const groupTargetsList = document.getElementById('groupTargetsList');
const groupTargetsSummary = document.getElementById('groupTargetsSummary');
const newUsernameInput = document.getElementById('newUsername');
const newPasswordInput = document.getElementById('newPassword');
const newUserRoleSelect = document.getElementById('newUserRole');
const newUserTeamSelect = document.getElementById('newUserTeam');
const newUserGroupInput = document.getElementById('newUserGroup');
const adminColorEditorTitle = document.getElementById('adminColorEditorTitle');
const adminColorEditorMeta = document.getElementById('adminColorEditorMeta');
const adminColorEditorSwatch = document.getElementById('adminColorEditorSwatch');
const adminColorEditorInput = document.getElementById('adminColorEditorInput');
const adminChartsPreview = document.getElementById('adminChartsPreview');
const adminChartTitlesEditor = document.getElementById('adminChartTitlesEditor');
const uiColorThemeToggleBtn = document.getElementById('uiColorThemeToggleBtn');
const saveColorSettingsBtn = document.getElementById('saveColorSettingsBtn');
const adminPersonalAxisMaxInput = document.getElementById('adminPersonalAxisMaxInput');
const currentAdminBadge = document.getElementById('currentAdminBadge');
const catalogSummary = document.getElementById('catalogSummary');
const adminTabButtons = [...document.querySelectorAll('[data-admin-tab]')];
const adminTabPanels = [...document.querySelectorAll('[data-admin-panel]')];
const userSearchInput = document.getElementById('userSearchInput');
const userRoleFilter = document.getElementById('userRoleFilter');
const userTeamFilter = document.getElementById('userTeamFilter');
const usersTotalStat = document.getElementById('usersTotalStat');
const usersAdminStat = document.getElementById('usersAdminStat');
const usersOperatorStat = document.getElementById('usersOperatorStat');
const usersTeamStat = document.getElementById('usersTeamStat');
const presetRequestsList = document.getElementById('presetRequestsList');
const presetRequestsSummary = document.getElementById('presetRequestsSummary');
const presetOptionsManager = document.getElementById('presetOptionsManager');
const presetOptionsSummary = document.getElementById('presetOptionsSummary');
const uiColorsSyncKey = 'prodops_ui_colors_updated_at';
const adminTabStorageKey = 'prodops_admin_tab';

let dragCategoryId = null;
let dragIncidentId = null;
let dragIncidentCategoryId = null;
let editingIncidentId = null;
let adminOverlayPressStarted = false;
let adminModalCloseTimer = null;
let userCreateOverlayPressStarted = false;
let userCreateModalCloseTimer = null;
let currentAdminUser = null;
let adminCategoriesCache = [];
let adminUiColors = null;
let adminChartStats = null;
let adminColorEditTheme = 'light';
let adminColorSelection = null;
let adminUsersCache = [];
let adminGroupTargetsCache = [];
let presetOptionsCache = [];
const adminColorGroups = [
  { group: 'categories', label: 'Categorie', statsKey: 'catYear' },
  { group: 'teams', label: 'Team', statsKey: 'teamYear' },
  { group: 'severities', label: 'Severity', statsKey: 'severityYear' }
];
const adminChartDefinitions = [
  { key: 'personalMineChart', label: 'Ticket personali', preview: false, helper: 'Titolo del grafico personale in dashboard.' },
  { key: 'personalGroupChart', label: 'Ticket gruppo', preview: false, helper: 'Titolo del grafico gruppo in dashboard.' },
  { key: 'fabYear', label: 'Ticket per FAB', preview: true, helper: 'Grafico riepilogo per FAB.' },
  { key: 'catYear', label: 'Ticket per categoria', preview: true, helper: 'Grafico riepilogo per categoria.' },
  { key: 'teamYear', label: 'Ticket per Team', preview: true, helper: 'Grafico riepilogo per team.' },
  { key: 'severityYear', label: 'Severity Ticket', preview: true, helper: 'Grafico riepilogo per severity.' }
];
const adminFabList = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];

function setAdminTab(tabName) {
  const nextTab = adminTabPanels.some((panel) => panel.dataset.adminPanel === tabName) ? tabName : 'catalog';
  adminTabButtons.forEach((button) => {
    const isActive = button.dataset.adminTab === nextTab;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  adminTabPanels.forEach((panel) => {
    const isActive = panel.dataset.adminPanel === nextTab;
    panel.classList.toggle('active', isActive);
    panel.hidden = !isActive;
  });
  try {
    localStorage.setItem(adminTabStorageKey, nextTab);
  } catch (error) {
    // ignore storage issues
  }
}

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
    },
    titles: {
      personalMineChart: 'Ticket personali',
      personalGroupChart: 'Ticket gruppo',
      fabYear: 'Ticket per FAB',
      catYear: 'Ticket per categoria',
      teamYear: 'Ticket per Team',
      severityYear: 'Severity Ticket'
    },
    settings: {
      personal_axis_max: 0
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
    labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} }, teams: { light: {}, dark: {} }, severities: { light: {}, dark: {} } },
    titles: { ...defaults.titles },
    settings: { ...defaults.settings }
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
  if (input?.titles && typeof input.titles === 'object') {
    Object.keys(out.titles || {}).forEach((key) => {
      const title = String(input.titles[key] || '').trim();
      if (title) out.titles[key] = title;
    });
  }
  const personalAxisMax = Number(input?.settings?.personal_axis_max || 0);
  out.settings.personal_axis_max = Number.isFinite(personalAxisMax) && personalAxisMax > 0 ? Math.round(personalAxisMax) : 0;
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
  { value: 'donut', label: 'Ciambella' }
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
  if (value === 'pie') return 'donut';
  if (value === 'line') return 'bar';
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
  adminColorEditorTitle.textContent = `${adminColorSelection.chartLabel} - ${adminColorSelection.label}`;
  adminColorEditorMeta.textContent = `Tema attivo: ${adminColorEditTheme.toUpperCase()}`;
  adminColorEditorInput.disabled = false;
  adminColorEditorInput.value = color;
  adminColorEditorSwatch.style.background = color;
}

function getAdminChartLabel(chartKey) {
  ensureAdminUiColors();
  const fallback = adminChartDefinitions.find((chart) => chart.key === chartKey)?.label || chartKey;
  return String(adminUiColors?.titles?.[chartKey] || fallback);
}

function setAdminChartLabel(chartKey, value) {
  ensureAdminUiColors();
  const fallback = adminChartDefinitions.find((chart) => chart.key === chartKey)?.label || chartKey;
  const next = String(value || '').trim();
  adminUiColors.titles[chartKey] = next || fallback;
}

function setDirectGroupColor(group, label, value) {
  const clean = normalizeHexColor(value);
  if (!clean) return;
  ensureAdminUiColors();
  if (!adminUiColors.labels[group]) adminUiColors.labels[group] = { light: {}, dark: {} };
  adminUiColors.labels[group][adminColorEditTheme][label] = clean;
  chartKeysForGroup(group).forEach((chartKey) => {
    if (!adminUiColors.bars[chartKey]) adminUiColors.bars[chartKey] = { light: {}, dark: {} };
    adminUiColors.bars[chartKey][adminColorEditTheme][label] = clean;
  });
}

function selectAdminColorTarget(chartId, label) {
  const group = chartGroupForId(chartId);
  if (!group) return;
  const chartKey = chartId.replace('Chart', '');
  const chartLabel = getAdminChartLabel(chartKey);
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

function buildAdminPreviewStats(stats) {
  const rows = Array.isArray(stats) ? stats : [];
  return rows
    .map((item) => ({ label: String(item && item.label ? item.label : ''), total: 1 }))
    .filter((item) => item.label !== '');
}

function renderAdminColumnChart(target, chartKey, stats) {
  const sortedStats = buildAdminPreviewStats(stats).sort((a, b) => a.label.localeCompare(b.label));
  target.innerHTML = '';
  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart vertical-chart';
  const inner = document.createElement('div');
  inner.className = 'chart-inner';
  const axis = document.createElement('div');
  axis.className = 'chart-y-axis';
  axis.innerHTML = ['100', '75', '50', '25', '0'].map((value) => `<span>${value}</span>`).join('');
  const barsWrap = document.createElement('div');
  barsWrap.className = 'chart-bars-wrap';
  const group = chartGroupForId(`${chartKey}Chart`);
  sortedStats.forEach((item) => {
    const label = String(item.label || '');
    const color = getAdminBarColor(chartKey, group, label);
    const bar = document.createElement('button');
    bar.type = 'button';
    bar.className = 'bar admin-bar-button';
    bar.dataset.group = group;
    bar.dataset.label = label;
    bar.dataset.chartId = chartKey;
    bar.innerHTML = `<span class="bar-value admin-preview-value"> </span><div class="bar-fill" style="height:90px;background:${color}"><span class="bar-pct admin-preview-pct">50%</span></div><span class="bar-label">${escapeHtml(label)}</span>`;
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
  const sortedStats = buildAdminPreviewStats(stats).sort((a, b) => a.label.localeCompare(b.label));
  target.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'chart-horizontal-wrap';
  const group = chartGroupForId(`${chartKey}Chart`);
  sortedStats.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'chart-horizontal-row';
    const width = 50;
    const color = getAdminBarColor(chartKey, group, String(item.label || ''));
    row.innerHTML = `
      <span class="chart-horizontal-label">${escapeHtml(item.label)}</span>
      <div class="chart-horizontal-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div><span class="bar-pct admin-preview-pct">50%</span></div>
      <span class="chart-horizontal-value admin-preview-value"> </span>
    `;
    row.addEventListener('click', () => selectAdminColorTarget(`${chartKey}Chart`, String(item.label || '')));
    wrap.appendChild(row);
  });
  target.appendChild(wrap);
}

function renderAdminPieOrDonutChart(target, chartKey, stats, isDonut) {
  const sortedStats = buildAdminPreviewStats(stats).sort((a, b) => a.label.localeCompare(b.label));
  const totalAll = sortedStats.length;
  target.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = `chart-pie-layout${isDonut ? ' donut' : ' pie'}`;
  const visual = document.createElement('div');
  visual.className = `chart-pie-visual${isDonut ? ' donut' : ' pie'}`;
  let angle = 0;
  const gradient = sortedStats.length
    ? sortedStats.map((item) => {
        const pct = totalAll > 0 ? (100 / totalAll) : 0;
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
    center.innerHTML = `<strong>Preview</strong><span>Colori</span>`;
    visual.appendChild(center);
  }
  const legend = document.createElement('div');
  legend.className = 'chart-pie-legend';
  sortedStats.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'chart-pie-legend-row';
    row.innerHTML = `
      <span class="chart-pie-swatch" style="background:${getAdminBarColor(chartKey, chartGroupForId(`${chartKey}Chart`), String(item.label || ''))}"></span>
      <span class="chart-pie-label">${escapeHtml(item.label)}</span>
      <strong class="chart-pie-value admin-preview-value"> </strong>
      <span class="chart-pie-percent admin-preview-pct"> </span>
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
        <h3>${escapeHtml(getAdminChartLabel(chart.key))}</h3>
        <p class="muted">Anteprima colori: clicca un elemento per modificarne il colore nel tema ${escapeHtml(adminColorEditTheme)}.</p>
      </div>
      <div class="chart-controls">
        <select class="chart-type-select" data-chart-target="${chart.key}" aria-label="Tipo grafico ${escapeHtml(getAdminChartLabel(chart.key))}">
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

function renderAdminChartTitlesEditor() {
  if (!adminChartTitlesEditor) return;
  ensureAdminUiColors();
  adminChartTitlesEditor.innerHTML = adminChartDefinitions.map((chart) => {
    const value = getAdminChartLabel(chart.key);
    return `
      <label class="admin-chart-title-row">
        <span class="admin-chart-title-copy">
          <strong>${escapeHtml(chart.label)}</strong>
          <small>${escapeHtml(chart.helper || '')}</small>
        </span>
        <input type="text" class="admin-chart-title-input" data-chart-title="${chart.key}" value="${escapeHtml(value)}" maxlength="80" />
      </label>
    `;
  }).join('');
  adminChartTitlesEditor.querySelectorAll('[data-chart-title]').forEach((input) => {
    input.addEventListener('input', () => {
      setAdminChartLabel(input.dataset.chartTitle, input.value);
      renderColorSettings();
    });
  });
}

function collectAdminGroupLabels(group, statsKey) {
  const labels = {};
  const rows = Array.isArray(adminChartStats && adminChartStats[statsKey]) ? adminChartStats[statsKey] : [];
  rows.forEach((item) => {
    const label = String(item && item.label ? item.label : '').trim();
    if (label) labels[label] = true;
  });
  ['light', 'dark'].forEach((theme) => {
    const saved = adminUiColors?.labels?.[group]?.[theme];
    if (!saved || typeof saved !== 'object') return;
    Object.keys(saved).forEach((label) => {
      const clean = String(label || '').trim();
      if (clean) labels[clean] = true;
    });
  });
  return Object.keys(labels).sort((a, b) => a.localeCompare(b));
}

function renderAdminColorLists() {
  if (!adminChartsPreview) return;
  ensureAdminUiColors();
  adminChartsPreview.innerHTML = '';
  adminColorGroups.forEach((config) => {
    const labels = collectAdminGroupLabels(config.group, config.statsKey);
    const section = document.createElement('section');
    section.className = 'panel admin-color-list-card';
    section.innerHTML = `
      <div class="panel-heading-row">
        <div>
          <h3>${escapeHtml(config.label)}</h3>
          <p class="muted">Tema attivo: ${escapeHtml(adminColorEditTheme.toUpperCase())}</p>
        </div>
      </div>
    `;
    const list = document.createElement('div');
    list.className = 'admin-color-list';
    if (!labels.length) {
      list.innerHTML = '<p class="muted">Nessun elemento disponibile.</p>';
    } else {
      labels.forEach((label) => {
        const color = getAdminThemeColor(config.group, label);
        const row = document.createElement('label');
        row.className = 'admin-color-row';
        row.innerHTML = `
          <span class="admin-color-row-label">${escapeHtml(label)}</span>
          <span class="admin-color-row-picker">
            <span class="admin-color-row-swatch" style="background:${color}"></span>
            <input type="color" value="${color}" data-color-group="${config.group}" data-color-label="${escapeHtml(label)}" aria-label="Colore ${escapeHtml(label)}" />
          </span>
        `;
        const input = row.querySelector('input[type="color"]');
        const swatch = row.querySelector('.admin-color-row-swatch');
        input.addEventListener('input', () => {
          setDirectGroupColor(config.group, label, input.value);
          swatch.style.background = input.value;
        });
        list.appendChild(row);
      });
    }
    section.appendChild(list);
    adminChartsPreview.appendChild(section);
  });
}

function renderColorSettings() {
  ensureAdminUiColors();
  if (adminPersonalAxisMaxInput) adminPersonalAxisMaxInput.value = String(Number(adminUiColors?.settings?.personal_axis_max || 0) || 0);
  renderAdminChartTitlesEditor();
  renderAdminColorLists();
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  adminUiColors = normalizeUiColors(data.ui_colors || data || {});
  renderColorSettings();
}

async function loadAdminChartsPreviewData() {
  try {
    const [fabYear, catYear, teamYear, severityYear] = await Promise.all([
      fetchJson('/api/stats/fab/current-year?mode=months'),
      fetchJson('/api/stats/category/current-year?mode=months'),
      fetchJson('/api/stats/team/current-year?mode=months'),
      fetchJson('/api/stats/severity/current-year?mode=months')
    ]);
    adminChartStats = {
      fabYear: fabYear.stats || [],
      catYear: catYear.stats || [],
      teamYear: teamYear.stats || [],
      severityYear: severityYear.stats || []
    };
    renderColorSettings();
  } catch (error) {
    adminChartStats = {};
    renderAdminChartTitlesEditor();
    if (adminChartsPreview) {
      adminChartsPreview.innerHTML = `<p class="muted">Impossibile caricare l'elenco colori: ${escapeHtml(error.message || error)}</p>`;
    }
  }
}

async function saveUiColors() {
  ensureAdminUiColors();
  if (adminPersonalAxisMaxInput) {
    const axisMax = Number(adminPersonalAxisMaxInput.value || 0);
    adminUiColors.settings.personal_axis_max = Number.isFinite(axisMax) && axisMax > 0 ? Math.round(axisMax) : 0;
  }
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
  alert('Grafici, colori e titoli salvati.');
}

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);
themeToggleBtn.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

backToDashboardBtn.addEventListener('click', () => { window.location.href = appUrl('/index.html'); });
logoutBtn?.addEventListener('click', async () => {
  await fetch(appUrl('/api/logout'), { method: 'POST' });
  window.location.href = appUrl('/login.html');
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

function closeUserCreateModal() {
  if (!userCreateModal) return;
  if (userCreateModalCloseTimer) clearTimeout(userCreateModalCloseTimer);
  userCreateModal.classList.remove('active');
  userCreateModal.classList.add('closing');
  userCreateModal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  userCreateModalCloseTimer = setTimeout(() => {
    userCreateModal.classList.remove('show', 'closing');
    userCreateModalCloseTimer = null;
  }, 260);
}

function openUserCreateModal() {
  if (!userCreateModal) return;
  if (userCreateModalCloseTimer) {
    clearTimeout(userCreateModalCloseTimer);
    userCreateModalCloseTimer = null;
  }
  userCreateForm?.reset();
  if (newUserRoleSelect) newUserRoleSelect.value = 'user';
  if (newUserTeamSelect) newUserTeamSelect.value = 'A';
  userCreateModal.classList.remove('closing');
  userCreateModal.classList.add('show');
  userCreateModal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => {
    userCreateModal.classList.add('active');
    newUsernameInput?.focus();
  });
}

async function fetchJson(url, options, attempt = 0) {
  const res = await fetch(appUrl(url), options);
  const text = (await res.text()).replace(/^\uFEFF+/, '');
  const contentType = res.headers.get('content-type') || '';
  const looksLikeAntiBotPage = /slowAES|aes\.js|This site requires Javascript to work/i.test(text);
  const looksLikeJson = /json/i.test(contentType) || text.startsWith('{') || text.startsWith('[');
  if (res.status === 401) {
    window.location.href = appUrl('/login.html');
    throw new Error('Login richiesta');
  }
  if (res.status === 403) {
    alert('Accesso admin richiesto.');
    window.location.href = appUrl('/index.html');
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

function normalizeGroupName(value) {
  const name = String(value || '').trim();
  return name || 'ProdOps';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadCurrentAdmin() {
  try {
    const data = await fetchJson('/api/me');
    currentAdminUser = data.user || null;
    if (currentAdminBadge) currentAdminBadge.textContent = currentAdminUser ? `${currentAdminUser.username} - ${currentAdminUser.team || 'A'}` : 'Profilo non disponibile';
  } catch (error) {
    currentAdminUser = null;
    if (currentAdminBadge) currentAdminBadge.textContent = 'Profilo non disponibile';
  }
}

function renderUsers() {
  if (!usersList) return;
  const search = String(userSearchInput?.value || '').trim().toLowerCase();
  const roleFilter = String(userRoleFilter?.value || '');
  const teamFilter = String(userTeamFilter?.value || '');
  const adminCount = adminUsersCache.filter((user) => String(user.role || '') === 'admin').length;
  const activeTeams = new Set(adminUsersCache.map((user) => String(user.team || 'A')));
  const users = adminUsersCache.filter((user) => {
    const matchesSearch = !search || String(user.username || '').toLowerCase().includes(search) || String(user.id).includes(search);
    return matchesSearch && (!roleFilter || user.role === roleFilter) && (!teamFilter || user.team === teamFilter);
  });

  if (usersSummary) usersSummary.textContent = `${adminUsersCache.length} utenti configurati - ${users.length} visualizzati`;
  if (usersTotalStat) usersTotalStat.textContent = String(adminUsersCache.length);
  if (usersAdminStat) usersAdminStat.textContent = String(adminCount);
  if (usersOperatorStat) usersOperatorStat.textContent = String(adminUsersCache.length - adminCount);
  if (usersTeamStat) usersTeamStat.textContent = String(activeTeams.size);

  if (!users.length) {
    usersList.innerHTML = '<div class="users-empty muted">Nessun utente corrisponde ai filtri selezionati.</div>';
    return;
  }

  const rows = users.map((user) => {
    const isSelf = Number(user.id) === Number(currentAdminUser?.id);
    const role = String(user.role || 'user');
    const team = String(user.team || 'A');
    const lastAdmin = role === 'admin' && adminCount <= 1;
    const roleLocked = isSelf || lastAdmin;
    const deleteLocked = isSelf || lastAdmin;
    const lockReason = isSelf ? 'Il tuo ruolo non puo essere modificato qui' : 'Deve restare almeno un amministratore';
    const username = escapeHtml(user.username);
    const initial = escapeHtml(String(user.username || '?').charAt(0).toUpperCase());
    return `
      <tr class="user-table-row ${isSelf ? 'current-user-row' : ''}" data-user-id="${Number(user.id)}">
        <td>
          <div class="user-table-identity">
            <span class="user-avatar" aria-hidden="true">${initial}</span>
            <div>
              <div class="user-table-name">${username} ${isSelf ? '<span class="current-user-pill">Tu</span>' : ''}</div>
              <div class="user-card-meta"><span class="user-status"><i></i> Attivo</span><span class="user-row-id">ID #${Number(user.id)}</span></div>
            </div>
          </div>
        </td>
        <td>
          <select class="user-role-select" aria-label="Ruolo ${username}" data-user-id="${Number(user.id)}" ${roleLocked ? `disabled title="${lockReason}"` : ''}>
            ${['user', 'admin'].map((item) => `<option value="${item}" ${role === item ? 'selected' : ''}>${item === 'admin' ? 'Amministratore' : 'Operatore'}</option>`).join('')}
          </select>
        </td>
        <td>
          <select class="user-team-select" aria-label="Team ${username}" data-user-id="${Number(user.id)}">
            ${['A', 'B', 'C', 'D', 'E'].map((item) => `<option value="${item}" ${team === item ? 'selected' : ''}>Team ${item}</option>`).join('')}
          </select>
        </td>
        <td><input class="user-group-input" aria-label="Gruppo ${username}" data-user-id="${Number(user.id)}" type="text" value="${escapeHtml(String(user.group_name || 'ProdOps'))}" placeholder="Gruppo" style="width:110px" /></td>
        <td><input class="user-password-input" aria-label="Nuova password ${username}" data-user-id="${Number(user.id)}" type="password" placeholder="Nuova password" autocomplete="new-password" /></td>
        <td><span class="user-table-note">${roleLocked ? escapeHtml(lockReason) : 'Modificabile'}</span></td>
        <td>
          <div class="user-actions-cell">
            <button type="button" class="save-user-btn primary" data-user-id="${Number(user.id)}">Salva</button>
            <button type="button" class="delete-user-btn" data-user-id="${Number(user.id)}" data-username="${username}" ${deleteLocked ? `disabled title="${lockReason}"` : ''}>Elimina</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  usersList.innerHTML = `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr><th>Utente</th><th>Ruolo</th><th>Team</th><th>Gruppo</th><th>Nuova password</th><th>Protezioni</th><th>Azioni</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  usersList.querySelectorAll('.save-user-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const row = btn.closest('.user-table-row');
      const roleSelect = row?.querySelector('.user-role-select');
      const teamSelect = row?.querySelector('.user-team-select');
      const groupInput = row?.querySelector('.user-group-input');
      const passwordInput = row?.querySelector('.user-password-input');
      const current = adminUsersCache.find((user) => Number(user.id) === userId);
      const payload = { role: roleSelect?.value || current?.role || 'user', team: teamSelect?.value || 'A', group_name: normalizeGroupName(groupInput?.value || current?.group_name || 'ProdOps') };
      const password = (passwordInput?.value || '').trim();
      if (password) payload.password = password;
      try {
        btn.disabled = true;
        btn.textContent = 'Salvataggio...';
        await fetchJson(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await Promise.all([loadUsers(), loadGroupTargets()]);
      } catch (error) {
        alert(`Errore salvataggio utente: ${error.message || error}`);
        btn.disabled = false;
        btn.textContent = 'Salva';
      }
    });
  });

  usersList.querySelectorAll('.delete-user-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const username = btn.dataset.username || '';
      if (!userId || !confirm(`Eliminare definitivamente l'utente "${username}"?`)) return;
      try {
        await fetchJson(`/api/users/${userId}`, { method: 'DELETE' });
        await Promise.all([loadUsers(), loadGroupTargets()]);
      } catch (error) {
        alert(`Errore eliminazione utente: ${error.message || error}`);
      }
    });
  });
}

async function loadUsers() {
  if (!usersList) return;
  try {
    adminUsersCache = await fetchJson('/api/users');
    renderUsers();
    renderGroupTargets();
  } catch (error) {
    if (usersSummary) usersSummary.textContent = 'Impossibile caricare gli utenti.';
    usersList.innerHTML = `<div class="users-empty muted">Errore caricamento utenti: ${escapeHtml(error.message || error)}</div>`;
  }
}

function renderGroupTargets() {
  if (!groupTargetsList) return;
  const groupsMap = new Map();
  adminUsersCache.forEach((user) => {
    const groupName = normalizeGroupName(user.group_name || 'ProdOps');
    if (!groupsMap.has(groupName)) groupsMap.set(groupName, { group_name: groupName, members: 0 });
    groupsMap.get(groupName).members += 1;
  });
  adminGroupTargetsCache.forEach((item) => {
    const groupName = normalizeGroupName(item.group_name || 'ProdOps');
    if (!groupsMap.has(groupName)) groupsMap.set(groupName, { group_name: groupName, members: 0 });
  });
  const groups = Array.from(groupsMap.values()).sort((a, b) => a.group_name.localeCompare(b.group_name, 'it', { sensitivity: 'base' }));
  if (groupTargetsSummary) groupTargetsSummary.textContent = `${groups.length} gruppi configurati`;
  if (!groups.length) {
    groupTargetsList.innerHTML = '<div class="users-empty muted">Nessun gruppo disponibile.</div>';
    return;
  }
  groupTargetsList.innerHTML = `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr><th>Gruppo</th><th>Membri</th><th>Membri mensile</th><th>Membri annuale</th><th>Gruppo mensile</th><th>Gruppo annuale</th><th>Azioni</th></tr>
        </thead>
        <tbody>
          ${groups.map((group) => {
            const current = adminGroupTargetsCache.find((item) => normalizeGroupName(item.group_name) === group.group_name) || {};
            return `
              <tr data-group-name="${escapeHtml(group.group_name)}">
                <td><strong>${escapeHtml(group.group_name)}</strong></td>
                <td>${Number(group.members || 0)}</td>
                <td><input class="group-personal-target-monthly-input" type="number" min="1" value="${Number(current.personal_target_monthly || current.personal_target || 20)}" aria-label="Target membri mensile ${escapeHtml(group.group_name)}" style="width:110px" /></td>
                <td><input class="group-personal-target-annual-input" type="number" min="1" value="${Number(current.personal_target_annual || ((current.personal_target_monthly || current.personal_target || 20) * 12))}" aria-label="Target membri annuale ${escapeHtml(group.group_name)}" style="width:110px" /></td>
                <td><input class="group-total-target-monthly-input" type="number" min="1" value="${Number(current.group_target_monthly || current.group_target || 20)}" aria-label="Target gruppo mensile ${escapeHtml(group.group_name)}" style="width:110px" /></td>
                <td><input class="group-total-target-annual-input" type="number" min="1" value="${Number(current.group_target_annual || ((current.group_target_monthly || current.group_target || 20) * 12))}" aria-label="Target gruppo annuale ${escapeHtml(group.group_name)}" style="width:110px" /></td>
                <td><button type="button" class="save-group-target-btn primary" data-group-name="${escapeHtml(group.group_name)}">Salva</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  groupTargetsList.querySelectorAll('.save-group-target-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const groupName = normalizeGroupName(btn.dataset.groupName || 'ProdOps');
      const row = btn.closest('tr');
      const personalMonthlyInput = row?.querySelector('.group-personal-target-monthly-input');
      const personalAnnualInput = row?.querySelector('.group-personal-target-annual-input');
      const groupMonthlyInput = row?.querySelector('.group-total-target-monthly-input');
      const groupAnnualInput = row?.querySelector('.group-total-target-annual-input');
      try {
        btn.disabled = true;
        btn.textContent = 'Salvataggio...';
        await fetchJson('/api/group-targets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group_name: groupName,
            personal_target_monthly: Number(personalMonthlyInput?.value || 20) || 20,
            personal_target_annual: Number(personalAnnualInput?.value || 240) || 240,
            group_target_monthly: Number(groupMonthlyInput?.value || 20) || 20,
            group_target_annual: Number(groupAnnualInput?.value || 240) || 240
          })
        });
        await loadGroupTargets();
      } catch (error) {
        alert(`Errore salvataggio target gruppo: ${error.message || error}`);
        btn.disabled = false;
        btn.textContent = 'Salva';
      }
    });
  });
}

async function loadGroupTargets() {
  if (!groupTargetsList) return;
  try {
    adminGroupTargetsCache = await fetchJson('/api/group-targets');
    renderGroupTargets();
  } catch (error) {
    if (groupTargetsSummary) groupTargetsSummary.textContent = 'Impossibile caricare i target gruppo.';
    groupTargetsList.innerHTML = `<div class="users-empty muted">Errore caricamento target gruppo: ${escapeHtml(error.message || error)}</div>`;
  }
}

async function loadPresetOptionRequests() {
  if (!presetRequestsList) return;
  try {
    const requests = await fetchJson('/api/admin/preset-option-requests');
    if (presetRequestsSummary) presetRequestsSummary.textContent = `${requests.length} richieste pending`;
    if (!requests.length) {
      presetRequestsList.innerHTML = '<div class="users-empty muted">Nessuna nuova opzione da revisionare.</div>';
      return;
    }
    presetRequestsList.innerHTML = requests.map((request) => `
      <article class="preset-request-card" data-request-id="${Number(request.id)}">
        <div class="preset-request-main">
          <span class="preset-request-field">${escapeHtml(request.field_label || request.field_key)}</span>
          <strong>${escapeHtml(request.value)}</strong>
          <span class="muted">Proposto da ${escapeHtml(request.requested_by_username || `utente #${request.requested_by_user_id}`)}${Number(request.incident_id) > 0 ? ` - Incident #${Number(request.incident_id)}` : ''}</span>
        </div>
        <div class="preset-request-actions">
          <button type="button" class="reject-preset-request-btn" data-request-id="${Number(request.id)}">Rifiuta</button>
          <button type="button" class="approve-preset-request-btn primary" data-request-id="${Number(request.id)}">Approva e aggiungi al DB</button>
        </div>
      </article>
    `).join('');

    presetRequestsList.querySelectorAll('.approve-preset-request-btn, .reject-preset-request-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const requestId = Number(btn.dataset.requestId);
        const action = btn.classList.contains('approve-preset-request-btn') ? 'approve' : 'reject';
        try {
          btn.disabled = true;
          await fetchJson(`/api/admin/preset-option-requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
          });
          await loadPresetOptionRequests();
        } catch (error) {
          alert(`Errore revisione opzione: ${error.message || error}`);
          btn.disabled = false;
        }
      });
    });
  } catch (error) {
    if (presetRequestsSummary) presetRequestsSummary.textContent = 'Errore caricamento';
    presetRequestsList.innerHTML = `<div class="users-empty muted">Errore caricamento richieste: ${escapeHtml(error.message || error)}</div>`;
  }
}

function renderPresetOptionsManager() {
  if (!presetOptionsManager) return;
  const fields = Array.isArray(presetOptionsCache) ? presetOptionsCache : [];
  const totalOptions = fields.reduce((sum, field) => sum + (Array.isArray(field.options) ? field.options.length : 0), 0);
  if (presetOptionsSummary) presetOptionsSummary.textContent = `${fields.length} menu - ${totalOptions} opzioni`;
  if (!fields.length) {
    presetOptionsManager.innerHTML = '<div class="users-empty muted">Nessun menu approvato presente nel database.</div>';
    return;
  }
  presetOptionsManager.innerHTML = `<div class="preset-options-grid">${fields.map((field) => {
    const options = Array.isArray(field.options) ? field.options : [];
    const rows = options.length ? options.map((option) => `
      <tr data-field-key="${escapeHtml(field.field_key)}" data-option-value="${escapeHtml(option)}">
        <td class="preset-option-value-cell">${escapeHtml(option)}</td>
        <td>
          <div class="preset-option-actions">
            <button type="button" class="secondary preset-option-edit-btn" data-field-key="${escapeHtml(field.field_key)}" data-option-value="${escapeHtml(option)}">Modifica</button>
            <button type="button" class="preset-option-delete-btn" data-field-key="${escapeHtml(field.field_key)}" data-option-value="${escapeHtml(option)}">Elimina</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="2" class="preset-option-empty muted">Nessuna opzione approvata.</td></tr>`;
    return `
      <article class="preset-option-card" data-field-key="${escapeHtml(field.field_key)}">
        <div class="preset-option-card-header">
          <div>
            <h4>${escapeHtml(field.field_label || field.field_key)}</h4>
            <div class="preset-option-key">${escapeHtml(field.field_key)}</div>
          </div>
          <div class="admin-summary-chip preset-option-count">${options.length} elementi</div>
        </div>
        <div class="preset-option-add-row">
          <input type="text" class="preset-option-new-input" data-field-key="${escapeHtml(field.field_key)}" placeholder="Nuovo elemento approvato" />
          <button type="button" class="primary preset-option-add-btn" data-field-key="${escapeHtml(field.field_key)}" data-field-label="${escapeHtml(field.field_label || field.field_key)}">Aggiungi</button>
        </div>
        <table class="preset-option-table">
          <thead>
            <tr>
              <th>Valore</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </article>
    `;
  }).join('')}</div>`;

  presetOptionsManager.querySelectorAll('.preset-option-add-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const fieldKey = btn.dataset.fieldKey || '';
      const fieldLabel = btn.dataset.fieldLabel || fieldKey;
      const input = presetOptionsManager.querySelector(`.preset-option-new-input[data-field-key="${fieldKey}"]`);
      const value = (input?.value || '').trim();
      if (!value) {
        alert('Inserisci un nuovo elemento da aggiungere.');
        return;
      }
      try {
        btn.disabled = true;
        await fetchJson('/api/admin/preset-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field_key: fieldKey, field_label: fieldLabel, value })
        });
        await loadPresetOptionsManager();
      } catch (error) {
        alert(`Errore aggiunta elemento: ${error.message || error}`);
        btn.disabled = false;
      }
    });
  });

  presetOptionsManager.querySelectorAll('.preset-option-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fieldKey = btn.dataset.fieldKey || '';
      const originalValue = btn.dataset.optionValue || '';
      const row = btn.closest('tr');
      if (!row) return;
      row.innerHTML = `
        <td><input type="text" class="preset-option-edit-input" value="${escapeHtml(originalValue)}" /></td>
        <td>
          <div class="preset-option-actions">
            <button type="button" class="primary preset-option-save-btn">Salva</button>
            <button type="button" class="secondary preset-option-cancel-btn">Annulla</button>
          </div>
        </td>
      `;
      row.querySelector('.preset-option-save-btn')?.addEventListener('click', async () => {
        const nextValue = (row.querySelector('.preset-option-edit-input')?.value || '').trim();
        if (!nextValue) {
          alert('Il valore non puo essere vuoto.');
          return;
        }
        try {
          await fetchJson('/api/admin/preset-options', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field_key: fieldKey, original_value: originalValue, value: nextValue })
          });
          await loadPresetOptionsManager();
        } catch (error) {
          alert(`Errore modifica elemento: ${error.message || error}`);
        }
      });
      row.querySelector('.preset-option-cancel-btn')?.addEventListener('click', renderPresetOptionsManager);
    });
  });

  presetOptionsManager.querySelectorAll('.preset-option-delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const fieldKey = btn.dataset.fieldKey || '';
      const value = btn.dataset.optionValue || '';
      if (!confirm(`Eliminare "${value}" dal menu "${fieldKey}"?`)) return;
      try {
        btn.disabled = true;
        await fetchJson('/api/admin/preset-options', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field_key: fieldKey, value })
        });
        await loadPresetOptionsManager();
      } catch (error) {
        alert(`Errore eliminazione elemento: ${error.message || error}`);
        btn.disabled = false;
      }
    });
  });
}

async function loadPresetOptionsManager() {
  if (!presetOptionsManager) return;
  try {
    presetOptionsCache = await fetchJson('/api/admin/preset-options');
    renderPresetOptionsManager();
  } catch (error) {
    if (presetOptionsSummary) presetOptionsSummary.textContent = 'Errore caricamento';
    presetOptionsManager.innerHTML = `<div class="users-empty muted">Errore caricamento opzioni approvate: ${escapeHtml(error.message || error)}</div>`;
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
  if (catalogSummary) {
    const incidentCount = categories.reduce((total, category) => total + (Array.isArray(category.incidents) ? category.incidents.length : 0), 0);
    const hiddenCategoryCount = categories.filter((category) => category.hidden).length;
    const hiddenIncidentCount = categories.reduce((total, category) => total + (Array.isArray(category.incidents) ? category.incidents.filter((incident) => incident.hidden).length : 0), 0);
    catalogSummary.textContent = `${categories.length} categorie - ${incidentCount} incident - ${hiddenCategoryCount + hiddenIncidentCount} nascosti`;
  }
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
    catBtn.innerHTML = `<span>${cat.name}${cat.hidden ? '<span class="admin-hidden-badge">Nascosta</span>' : ''}</span><span class="admin-actions"><button type="button" class="tiny-toggle-hide" aria-label="${cat.hidden ? 'Mostra categoria' : 'Nascondi categoria'}" title="${cat.hidden ? 'Mostra categoria' : 'Nascondi categoria'}" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" data-hidden="${cat.hidden ? '1' : '0'}">${cat.hidden ? 'Mostra' : 'Nascondi'}</button><button type="button" class="tiny-edit" aria-label="Modifica categoria" title="Modifica categoria" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" data-hidden="${cat.hidden ? '1' : '0'}">&#9998;</button><button type="button" class="tiny-add" data-type="incident" data-id="${cat.id}" title="Nuovo incident">+</button><button type="button" class="tiny-delete" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" title="Elimina categoria">x</button></span>`;

    const ul = document.createElement('ul');
    ul.className = 'incident-list';
    cat.incidents.forEach((inc) => {
      const li = document.createElement('li');
      li.dataset.incidentId = String(inc.id);
      li.draggable = true;
      const firstPreset = Array.isArray(inc.presets) ? (inc.presets[0] || '') : '';
      li.innerHTML = `<div class="incident-btn"><span>${inc.name}${inc.hidden ? '<span class="admin-hidden-badge">Nascosto</span>' : ''}</span><span class="admin-actions"><button type="button" class="tiny-toggle-hide" aria-label="${inc.hidden ? 'Mostra incident' : 'Nascondi incident'}" title="${inc.hidden ? 'Mostra incident' : 'Nascondi incident'}" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" data-hidden="${inc.hidden ? '1' : '0'}">${inc.hidden ? 'Mostra' : 'Nascondi'}</button><button type="button" class="tiny-edit" aria-label="Modifica incident" title="Modifica incident" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" data-hidden="${inc.hidden ? '1' : '0'}" data-preset="${firstPreset.replace(/"/g, '&quot;')}" data-severity-default="${Number(inc.severity_default || 1)}" data-severity-mode="${inc.severity_mode || 'default'}" data-fab-default="${inc.fab_default || ''}">&#9998;</button><button type="button" class="tiny-delete" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" title="Elimina incident">x</button></span></div>`;

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
        if (type === 'category') {
          if (!confirm(`Eliminare categoria "${name}" e tutti gli incident collegati?`)) return;
          const res = await fetch(appUrl(`/api/categories/${id}`), { method: 'DELETE' });
          if (res.status === 409) {
            let count = 0;
            try {
              const text = (await res.text()).replace(/^ï»¿+/, '');
              const data = JSON.parse(text);
              count = data.ticket_count || 0;
            } catch (ex) {}
            const wantHide = confirm(
              `Ci sono ${count} ticket associati a questa categoria.\nSi consiglia di nascondere la categoria o eliminare tutti i ticket associati e poi cancellare la Categoria.\n\nVuoi nasconderla adesso?`
            );
            if (wantHide) {
              await fetchJson(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hidden: true, name })
              });
            }
            await loadAdminMenu();
            return;
          }
          if (!res.ok) {
            let msg = 'Errore eliminazione';
            try {
              const text = (await res.text()).replace(/^ï»¿+/, '');
              const data = JSON.parse(text);
              msg = data.error || msg;
            } catch (ex) {}
            throw new Error(msg);
          }
        } else {
          if (!confirm(`Eliminare incident "${name}"?`)) return;
          await fetchJson(`/api/incidents/${id}`, { method: 'DELETE' });
        }
        await loadAdminMenu();
      } catch (error) {
        alert(`Errore eliminazione: ${error.message || error}`);
      }
    });
  });

  document.querySelectorAll('.tiny-toggle-hide').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const type = btn.dataset.type;
        const id = Number(btn.dataset.id);
        const name = btn.dataset.name || '';
        const isHidden = btn.dataset.hidden === '1';
        if (type === 'category') {
          await fetchJson(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hidden: !isHidden, name })
          });
        } else {
          const editBtn = btn.parentElement?.querySelector('.tiny-edit');
          await fetchJson(`/api/incidents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              hidden: !isHidden,
              severity_default: Number(editBtn?.dataset.severityDefault || 1),
              severity_mode: editBtn?.dataset.severityMode || 'default',
              fab_default: editBtn?.dataset.fabDefault || ''
            })
          });
        }
        await loadAdminMenu();
      } catch (error) {
        alert(`Errore aggiornamento visibilita: ${error.message || error}`);
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

adminTabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setAdminTab(button.dataset.adminTab);
    if (button.dataset.adminTab === 'review') {
      loadPresetOptionRequests();
      loadPresetOptionsManager();
    }
  });
});

[userSearchInput, userRoleFilter, userTeamFilter].forEach((control) => {
  control?.addEventListener('input', renderUsers);
  control?.addEventListener('change', renderUsers);
});

openUserCreateModalBtn?.addEventListener('click', openUserCreateModal);

document.querySelectorAll('.close-user-modal').forEach((btn) => {
  btn.addEventListener('click', closeUserCreateModal);
});

adminIncidentModal?.addEventListener('mousedown', (e) => {
  adminOverlayPressStarted = e.target === adminIncidentModal;
});

adminIncidentModal?.addEventListener('mouseup', (e) => {
  if (e.target === adminIncidentModal && adminOverlayPressStarted) closeIncidentModal();
  adminOverlayPressStarted = false;
});

userCreateModal?.addEventListener('mousedown', (e) => {
  userCreateOverlayPressStarted = e.target === userCreateModal;
});

userCreateModal?.addEventListener('mouseup', (e) => {
  if (e.target === userCreateModal && userCreateOverlayPressStarted) closeUserCreateModal();
  userCreateOverlayPressStarted = false;
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
  const group_name = normalizeGroupName(newUserGroupInput?.value || 'ProdOps');
  if (!username || !password) {
    alert('Inserisci username e password.');
    return;
  }
  try {
    await fetchJson('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, team, group_name })
    });
    userCreateForm.reset();
    if (newUserRoleSelect) newUserRoleSelect.value = 'user';
    if (newUserTeamSelect) newUserTeamSelect.value = 'A';
    if (newUserGroupInput) newUserGroupInput.value = 'ProdOps';
    closeUserCreateModal();
    await Promise.all([loadUsers(), loadGroupTargets()]);
  } catch (error) {
    alert(`Errore creazione utente: ${error.message || error}`);
  }
});

(async function initAdminPage() {
  let savedAdminTab = 'catalog';
  try {
    savedAdminTab = localStorage.getItem(adminTabStorageKey) || 'catalog';
  } catch (error) {
    // ignore storage issues
  }
  setAdminTab(savedAdminTab);
  await loadCurrentAdmin();
  loadChartTypes();
  syncAdminColorToggle();
  await Promise.allSettled([
    loadAdminMenu(null),
    loadUsers(),
    loadGroupTargets(),
    loadPresetOptionRequests(),
    loadPresetOptionsManager(),
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
  insertAtCursor(adminIncidentPresetInput, `[[dbselect:${label.trim()}]]`);
});

addPresetTimestampBtn?.addEventListener('click', () => {
  const label = prompt('Nome campo orario (es. Orario evento):');
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[timestamp:${label.trim()}]]`);
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
