const themeToggleBtn = document.getElementById('themeToggleBtn');
const appBasePath = new URL(document.currentScript.src).pathname.split('/public/js/')[0];

function appUrl(path) {
  const normalizedPath = String(path || '').charAt(0) === '/' ? String(path || '') : '/' + String(path || '');
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.indexOf(appBasePath + '/') === 0) return normalizedPath;
  return appBasePath + normalizedPath;
}

function isCategoryLogoImage(value) {
  const text = String(value || '').trim();
  return /^(https?:\/\/|\.\/|\/|data:image\/)/i.test(text);
}

function renderCategoryLogoMarkup(value) {
  const logo = String(value || '').trim();
  if (!logo) return '';
  if (isCategoryLogoImage(logo)) {
    return `<span class="category-logo category-logo-image" aria-hidden="true"><img src="${escapeHtml(logo)}" alt="" loading="lazy" /></span>`;
  }
  return `<span class="category-logo category-logo-text" aria-hidden="true">${escapeHtml(logo)}</span>`;
}

const adminMenu = document.getElementById('adminMenu');
const adminBrandLogoBtn = document.getElementById('adminBrandLogoBtn');
const backToDashboardBtn = document.getElementById('backToDashboardBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminIncidentModal = document.getElementById('adminIncidentModal');
const adminIncidentForm = document.getElementById('adminIncidentForm');
const userCreateModal = document.getElementById('userCreateModal');
const adminCategoryModal = document.getElementById('adminCategoryModal');
const adminCategoryForm = document.getElementById('adminCategoryForm');
const adminCategoryModalTitle = document.getElementById('adminCategoryModalTitle');
const adminCategoryNameInput = document.getElementById('adminCategoryName');
const adminCategoryLogoGrid = document.getElementById('adminCategoryLogoGrid');
const openUserCreateModalBtn = document.getElementById('openUserCreateModalBtn');
const adminIncidentNameInput = document.getElementById('adminIncidentName');
const adminIncidentPresetInput = document.getElementById('adminIncidentPreset');
const adminIncidentPresetEditor = document.getElementById('adminIncidentPresetEditor');
const adminIncidentPresetToolbar = document.getElementById('adminIncidentPresetToolbar');
const adminSeverityDefaultSelect = document.getElementById('adminSeverityDefault');
const adminSeverityModeSelect = document.getElementById('adminSeverityMode');
const adminFabDefaultSelect = document.getElementById('adminFabDefault');
const adminNameModeCheckbox = document.getElementById('adminNameMode');
const addPresetTextFieldBtn = document.getElementById('addPresetTextFieldBtn');
const addPresetTextMultiFieldBtn = document.getElementById('addPresetTextMultiFieldBtn');
const addPresetSelectFieldBtn = document.getElementById('addPresetSelectFieldBtn');
const addPresetMultiFieldBtn = document.getElementById('addPresetMultiFieldBtn');
const addPresetTimestampBtn = document.getElementById('addPresetTimestampBtn');
const userCreateForm = document.getElementById('userCreateForm');
const usersList = document.getElementById('usersList');
const usersSummary = document.getElementById('usersSummary');
const groupTargetsList = document.getElementById('groupTargetsList');
const groupTargetsSummary = document.getElementById('groupTargetsSummary');
const newUsernameInput = document.getElementById('newUsername');
const newUserRoleSelect = document.getElementById('newUserRole');
const newUserTeamSelect = document.getElementById('newUserTeam');
const adminColorEditorTitle = document.getElementById('adminColorEditorTitle');
const adminColorEditorMeta = document.getElementById('adminColorEditorMeta');
const adminColorEditorSwatch = document.getElementById('adminColorEditorSwatch');
const adminColorEditorInput = document.getElementById('adminColorEditorInput');
const adminChartsPreview = document.getElementById('adminChartsPreview');
const adminDashboardLayoutPreview = document.getElementById('adminDashboardLayoutPreview');
const adminChartTitlesEditor = document.getElementById('adminChartTitlesEditor');
const uiColorThemeToggleBtn = document.getElementById('uiColorThemeToggleBtn');
const saveColorSettingsBtn = document.getElementById('saveColorSettingsBtn');
const adminPersonalAxisMaxMineInput = document.getElementById('adminPersonalAxisMaxMineInput');
const adminPersonalAxisMaxGroupInput = document.getElementById('adminPersonalAxisMaxGroupInput');
const layoutInputs = {
  panel_height_min: document.getElementById('layoutPanelHeightMin'),
  panel_height_preferred: document.getElementById('layoutPanelHeightPreferred'),
  panel_height_max: document.getElementById('layoutPanelHeightMax'),
  legend_font_size: document.getElementById('layoutLegendFontSize'),
  legend_col_min: document.getElementById('layoutLegendColMin'),
  chart_height_pct: document.getElementById('layoutChartHeightPct'),
  select_min_width: document.getElementById('layoutSelectMinWidth')
};
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
let currentPaletteId = 'blu';
let currentDarkMode = false;
const ADMIN_PRESET_INLINE_TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', UL: 'ul', OL: 'ol', LI: 'li' };
const ADMIN_PRESET_TOOLBAR_CMDS = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];

function releaseThemeSyncPending() {
  document.documentElement.classList.remove('theme-sync-pending');
}

let dragCategoryId = null;
let dragIncidentId = null;
let dragIncidentCategoryId = null;
let editingIncidentId = null;
let adminOverlayPressStarted = false;
let adminModalCloseTimer = null;
let userCreateOverlayPressStarted = false;
let userCreateModalCloseTimer = null;
let categoryModalOverlayPressStarted = false;
let categoryModalCloseTimer = null;
let editingCategoryId = null;
let currentAdminUser = null;
let adminCategoriesCache = [];
let adminUiColors = null;
let adminChartStats = null;
let adminColorEditTheme = 'light';
let adminColorSelection = null;
let adminUsersCache = [];
let adminGroupTargetsCache = [];
let presetOptionsCache = [];
let usersPage = 1;
const USERS_PAGE_SIZE = 5;
const adminColorGroups = [
  { group: 'categories', label: 'Categorie', statsKey: 'catYear' },
  { group: 'fabs', label: 'FAB', statsKey: 'fabYear' },
  { group: 'teams', label: 'Team', statsKey: 'teamYear' },
  { group: 'severities', label: 'Severity', statsKey: 'severityYear' },
  { group: 'users', label: 'Utenti', statsKey: 'userYear' }
];
const adminChartDefinitions = [
  { key: 'personalMineChart', label: 'Ticket personali', preview: false, helper: 'Titolo del grafico personale in dashboard.' },
  { key: 'personalGroupChart', label: 'Ticket gruppo', preview: false, helper: 'Titolo del grafico gruppo in dashboard.' },
  { key: 'fabYear', label: 'Ticket per FAB', preview: true, helper: 'Grafico riepilogo per FAB.' },
  { key: 'catYear', label: 'Ticket per categoria', preview: true, helper: 'Grafico riepilogo per categoria.' },
  { key: 'teamYear', label: 'Ticket per Team', preview: true, helper: 'Grafico riepilogo per team.' },
  { key: 'incidentYear', label: 'Ticket per Incident', preview: true, helper: 'Grafico riepilogo per incident.' }
];
const adminFabList = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];
const adminCategoryLogoChoices = [
  { value: './public/assets/loghi/automation.svg', label: 'Automation' },
  { value: './public/assets/loghi/wmm.svg', label: 'WMM' },
  { value: './public/assets/loghi/sicma.svg', label: 'SICMA' },
  { value: './public/assets/loghi/robotization.svg', label: 'Robotization' },
  { value: './public/assets/loghi/sealing.svg', label: 'Sealing' },
  { value: './public/assets/loghi/reperibilita.svg', label: 'Reperibilita' },
  { value: './public/assets/loghi/server.svg', label: 'Server' },
  { value: './public/assets/loghi/network.svg', label: 'Network' },
  { value: './public/assets/loghi/cloud.svg', label: 'Cloud' },
  { value: './public/assets/loghi/database.svg', label: 'Database' },
  { value: './public/assets/loghi/monitor.svg', label: 'Monitor' },
  { value: './public/assets/loghi/code.svg', label: 'Code' },
  { value: './public/assets/loghi/bug.svg', label: 'Bugfix' },
  { value: './public/assets/loghi/tools.svg', label: 'Tools' },
  { value: './public/assets/loghi/building.svg', label: 'Building' },
  { value: './public/assets/loghi/dashboard.svg', label: 'Dashboard' },
  { value: './public/assets/loghi/export.svg', label: 'Export' },
  { value: './public/assets/loghi/security.svg', label: 'Security' },
  { value: './public/assets/loghi/support.svg', label: 'Support' },
  { value: './public/assets/loghi/wifi.svg', label: 'WiFi' },
  { value: './public/assets/loghi/factory.svg', label: 'Factory' },
  { value: './public/assets/loghi/chip.svg', label: 'Chip' },
  { value: './public/assets/loghi/terminal.svg', label: 'Terminal' },
  { value: './public/assets/loghi/laptop.svg', label: 'Laptop' },
  { value: './public/assets/loghi/api.svg', label: 'API' },
  { value: './public/assets/loghi/mail.svg', label: 'Mail' },
  { value: './public/assets/loghi/printer.svg', label: 'Printer' },
  { value: './public/assets/loghi/document.svg', label: 'Document' },
  { value: './public/assets/loghi/users.svg', label: 'Users' },
  { value: './public/assets/loghi/calendar.svg', label: 'Calendar' },
  { value: './public/assets/loghi/clipboard.svg', label: 'Clipboard' },
  { value: './public/assets/loghi/settings.svg', label: 'Settings' },
  { value: './public/assets/loghi/chart.svg', label: 'Chart' }
];
const adminLayoutPreviewFallbackStats = {
  fabYear: [{ label: 'M5' }, { label: 'L1' }, { label: 'WSIC' }, { label: 'NRK' }],
  catYear: [{ label: 'HW' }, { label: 'SW' }, { label: 'NET' }, { label: 'APP' }],
  teamYear: [{ label: 'Team A' }, { label: 'Team B' }, { label: 'Team C' }, { label: 'Team D' }],
  incidentYear: [{ label: 'Robot' }, { label: 'Sealiner' }, { label: 'Vision' }, { label: 'Fabline' }]
};

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
  const palette = currentPaletteId || localStorage.getItem('palette') || 'blu';
  currentDarkMode = theme === 'dark';
  ['cappuccino','bordeaux','verde','blu','giallo'].forEach(function(p) { document.body.classList.remove('theme-' + p); });
  if (palette !== 'blu') document.body.classList.add('theme-' + palette);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
  const thumb = themeToggleBtn.querySelector('.switch-thumb');
  if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀';
}

async function loadUserPreferences() {
  const data = await fetchJson('/api/user-charts');
  currentPaletteId = typeof data.palette === 'string' && data.palette ? data.palette : (localStorage.getItem('palette') || 'blu');
  currentDarkMode = !!data.dark_mode;
  localStorage.setItem('palette', currentPaletteId || 'blu');
  localStorage.setItem('dark-mode', currentDarkMode ? '1' : '');
  applyTheme(currentDarkMode ? 'dark' : 'light');
}

function defaultUiColors() {
  return {
    charts: {
      fabDay: { light: '#0c5f8c', dark: '#24a0d8' },
      catDay: { light: '#16a0b6', dark: '#2ec4d6' },
      fabYear: { light: '#355a84', dark: '#1fb6ff' },
      catYear: { light: '#6b4ea6', dark: '#9b6cff' },
      teamYear: { light: '#d97706', dark: '#f59e0b' },
      incidentYear: { light: '#be185d', dark: '#ec4899' }
    },
    bars: {},
    labels: {
      categories: { light: {}, dark: {} },
      fabs: { light: {}, dark: {} },
      teams: { light: {}, dark: {} },
      severities: { light: {}, dark: {} },
      users: { light: {}, dark: {} }
    },
    titles: {
      personalMineChart: 'Ticket personali',
      personalGroupChart: 'Ticket gruppo',
      fabYear: 'Ticket per FAB',
      catYear: 'Ticket per categoria',
      teamYear: 'Ticket per Team',
      incidentYear: 'Ticket per Incident'
    },
    settings: {
      personal_axis_max: 0,
      personal_axis_max_mine: 0,
      personal_axis_max_group: 0
    },
    layout: {
      panel_height_min: 400,
      panel_height_preferred: 52,
      panel_height_max: 580,
      legend_font_size: 90,
      legend_col_min: 150,
      chart_height_pct: 100,
      select_min_width: 126
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
    labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} }, teams: { light: {}, dark: {} }, severities: { light: {}, dark: {} }, users: { light: {}, dark: {} } },
    titles: { ...defaults.titles },
    settings: { ...defaults.settings },
    layout: { ...defaults.layout }
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
  ['categories', 'fabs', 'teams', 'severities', 'users'].forEach((group) => {
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
  const cleanAxisMax = (raw) => {
    const num = Number(raw || 0);
    return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
  };
  const legacyAxisMax = cleanAxisMax(input?.settings?.personal_axis_max);
  out.settings.personal_axis_max = legacyAxisMax;
  out.settings.personal_axis_max_mine = input?.settings?.personal_axis_max_mine != null
    ? cleanAxisMax(input.settings.personal_axis_max_mine) : 0;
  out.settings.personal_axis_max_group = input?.settings?.personal_axis_max_group != null
    ? cleanAxisMax(input.settings.personal_axis_max_group) : 0;
  if (input?.layout && typeof input.layout === 'object') {
    Object.keys(defaults.layout).forEach((lk) => {
      if (input.layout[lk] != null) {
        const val = Math.round(Number(input.layout[lk]));
        if (val > 0) out.layout[lk] = val;
      }
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
  if (chartId === 'severityDayChart' || chartId === 'severityYearChart') return 'severities';
  if (chartId === 'userDayChart' || chartId === 'userYearChart') return 'users';
  return '';
}

function chartKeysForGroup(group) {
  if (group === 'fabs') return ['fabDay', 'fabYear'];
  if (group === 'categories') return ['catDay', 'catYear'];
  if (group === 'teams') return ['teamYear'];
  if (group === 'severities') return ['severityDay', 'severityYear'];
  if (group === 'users') return ['userDay', 'userYear'];
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
    incidentYear: 'bar'
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
  if (thumb) thumb.textContent = adminColorEditTheme === 'dark' ? '🌙' : '☀';
  uiColorThemeToggleBtn.setAttribute('aria-pressed', String(adminColorEditTheme === 'dark'));
  updateColorEditor();
}

function applyAdminColorTheme(theme) {
  adminColorEditTheme = theme === 'dark' ? 'dark' : 'light';
  syncAdminColorToggle();
  renderColorSettings();
}

function getDefaultCategoryLogo(name) {
  const text = String(name || '').trim().toUpperCase();
  if (!text) return '';
  if (text === 'AUTOMATION') return './public/assets/loghi/automation.svg';
  if (text === 'WMM') return './public/assets/loghi/wmm.svg';
  if (text === 'SICMA') return './public/assets/loghi/sicma.svg';
  if (text === 'ROBOTIZATION') return './public/assets/loghi/robotization.svg';
  if (text === 'SEALING') return './public/assets/loghi/sealing.svg';
  if (text === 'REPERIBILITA' || text === 'REPERIBILITÀ') return './public/assets/loghi/reperibilita.svg';
  return '';
}

function getCategoryLogoChoices(currentName) {
  const options = adminCategoryLogoChoices.slice();
  const defaultLogo = getDefaultCategoryLogo(currentName);
  if (defaultLogo && !options.some((item) => item.value === defaultLogo)) {
    options.unshift({ value: defaultLogo, label: currentName || 'Categoria' });
  }
  return options;
}

function renderCategoryLogoPicker(selectedValue, currentName) {
  if (!adminCategoryLogoGrid) return;
  const options = [{ value: '', label: 'Nessuna' }].concat(getCategoryLogoChoices(currentName));
  adminCategoryLogoGrid.innerHTML = options.map((option) => {
    const selected = String(selectedValue || '') === String(option.value || '');
    const preview = option.value
      ? `<span class="admin-category-logo-option-preview">${renderCategoryLogoMarkup(option.value)}</span>`
      : `<span class="admin-category-logo-option-preview"><span class="category-logo category-logo-text" aria-hidden="true">-</span></span>`;
    return `<button type="button" class="admin-category-logo-option${selected ? ' active' : ''}" data-logo-value="${escapeHtml(option.value)}" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${escapeHtml(option.label)}" title="${escapeHtml(option.label)}">${preview}</button>`;
  }).join('');
}

function getSelectedCategoryLogoValue() {
  const active = adminCategoryLogoGrid?.querySelector('.admin-category-logo-option.active');
  return active ? String(active.dataset.logoValue || '') : '';
}

function closeCategoryModal() {
  if (!adminCategoryModal) return;
  if (categoryModalCloseTimer) clearTimeout(categoryModalCloseTimer);
  adminCategoryModal.classList.remove('active');
  adminCategoryModal.classList.add('closing');
  adminCategoryModal.setAttribute('aria-hidden', 'true');
  categoryModalOverlayPressStarted = false;
  categoryModalCloseTimer = setTimeout(() => {
    adminCategoryModal.classList.remove('show', 'closing');
    categoryModalCloseTimer = null;
  }, 220);
}

function openCategoryModal(category) {
  if (!adminCategoryModal) return;
  if (categoryModalCloseTimer) {
    clearTimeout(categoryModalCloseTimer);
    categoryModalCloseTimer = null;
  }
  editingCategoryId = category && category.id ? Number(category.id) : null;
  const categoryName = String(category?.name || '').trim();
  const selectedLogo = String(category?.logo || getDefaultCategoryLogo(categoryName) || '').trim();
  if (adminCategoryModalTitle) adminCategoryModalTitle.textContent = editingCategoryId ? 'Modifica categoria' : 'Nuova categoria';
  if (adminCategoryNameInput) adminCategoryNameInput.value = categoryName;
  renderCategoryLogoPicker(selectedLogo, categoryName);
  adminCategoryModal.classList.remove('closing');
  adminCategoryModal.classList.add('show');
  adminCategoryModal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    adminCategoryModal.classList.add('active');
    adminCategoryNameInput?.focus();
    adminCategoryNameInput?.select();
  });
}

function getAdminLayoutDraft() {
  const defaults = defaultUiColors().layout;
  const normalized = normalizeUiColors(adminUiColors || {}).layout;
  const out = {
    panel_height_min: normalized.panel_height_min || defaults.panel_height_min,
    panel_height_preferred: normalized.panel_height_preferred || defaults.panel_height_preferred,
    panel_height_max: normalized.panel_height_max || defaults.panel_height_max,
    legend_font_size: normalized.legend_font_size || defaults.legend_font_size,
    legend_col_min: normalized.legend_col_min || defaults.legend_col_min,
    chart_height_pct: normalized.chart_height_pct || defaults.chart_height_pct,
    select_min_width: normalized.select_min_width || defaults.select_min_width
  };
  Object.keys(layoutInputs).forEach((key) => {
    const input = layoutInputs[key];
    if (!input) return;
    const val = Math.round(Number(input.value || 0));
    if (Number.isFinite(val) && val > 0) out[key] = val;
  });
  return out;
}

function applyAdminLayoutPreviewVars(target, layout) {
  if (!target || !layout) return;
  target.style.setProperty('--layout-panel-h-min', layout.panel_height_min + 'px');
  target.style.setProperty('--layout-panel-h-pref', layout.panel_height_preferred + 'vh');
  target.style.setProperty('--layout-panel-h-max', layout.panel_height_max + 'px');
  target.style.setProperty('--layout-legend-font', (layout.legend_font_size / 100) + 'rem');
  target.style.setProperty('--layout-legend-col-min', layout.legend_col_min + 'px');
  target.style.setProperty('--layout-chart-h-pct', layout.chart_height_pct + '%');
  target.style.setProperty('--layout-select-min-w', layout.select_min_width + 'px');
}

function getAdminLayoutPreviewStats(chartKey) {
  const liveStats = Array.isArray(adminChartStats && adminChartStats[chartKey]) ? adminChartStats[chartKey] : [];
  if (liveStats.length) return liveStats.slice(0, 4);
  return adminLayoutPreviewFallbackStats[chartKey] || [];
}

function clampLayoutInputValue(key, value) {
  const input = layoutInputs[key];
  if (!input) return Math.round(Number(value || 0)) || 0;
  const min = Number(input.min || 0);
  const max = Number(input.max || 99999);
  const step = Number(input.step || 1) || 1;
  let next = Number(value || 0);
  if (!Number.isFinite(next)) next = min;
  next = Math.max(min, Math.min(max, next));
  next = Math.round(next / step) * step;
  next = Math.max(min, Math.min(max, next));
  return next;
}

function setAdminLayoutInputValue(key, value) {
  const input = layoutInputs[key];
  if (!input) return;
  input.value = String(clampLayoutInputValue(key, value));
}

function startAdminLayoutDrag(event, config) {
  if (!config || !config.key) return;
  event.preventDefault();
  const startX = event.clientX;
  const startY = event.clientY;
  const startValue = Number(layoutInputs[config.key] && layoutInputs[config.key].value || 0);
  const stepPx = config.stepPx || 6;
  const move = function(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    const primaryDelta = config.axis === 'x' ? dx : -dy;
    const nextValue = startValue + Math.round(primaryDelta / stepPx) * (config.valueStep || 1);
    if (config.key === 'panel_height_preferred') {
      const clampedPref = clampLayoutInputValue(config.key, nextValue);
      setAdminLayoutInputValue('panel_height_preferred', clampedPref);
      setAdminLayoutInputValue('panel_height_min', clampLayoutInputValue('panel_height_min', clampedPref * 7.5));
      setAdminLayoutInputValue('panel_height_max', clampLayoutInputValue('panel_height_max', clampedPref * 11));
    } else {
      setAdminLayoutInputValue(config.key, nextValue);
    }
    renderAdminDashboardLayoutPreview();
  };
  const up = function() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

function buildAdminPreviewResizeHandle(label, hint, key, axis, valueStep, stepPx) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-layout-resize-handle admin-layout-resize-handle-' + key;
  button.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${escapeHtml(hint)}</span>`;
  button.addEventListener('pointerdown', function(event) {
    startAdminLayoutDrag(event, { key: key, axis: axis, valueStep: valueStep, stepPx: stepPx });
  });
  return button;
}

function attachAdminLayoutPreviewInteractions(card) {
  if (!card) return;
  const controls = card.querySelector('.admin-layout-preview-selects');
  const chartHost = card.querySelector('.admin-layout-preview-chart-host');
  const legend = card.querySelector('.chart-pie-legend');
  const panelBody = card.querySelector('.admin-layout-preview-body');

  if (controls) {
    controls.appendChild(buildAdminPreviewResizeHandle('Select', 'trascina orizzontale', 'select_min_width', 'x', 10, 10));
  }
  if (chartHost) {
    chartHost.appendChild(buildAdminPreviewResizeHandle('Canvas', 'trascina verticale', 'chart_height_pct', 'y', 5, 10));
  }
  if (legend) {
    legend.appendChild(buildAdminPreviewResizeHandle('Legenda', 'su/giu font, dx/sx larghezza', 'legend_font_size', 'y', 5, 12));
    const legendWidthHandle = buildAdminPreviewResizeHandle('Colonna', 'trascina orizzontale', 'legend_col_min', 'x', 10, 10);
    legendWidthHandle.classList.add('admin-layout-resize-handle-secondary');
    legend.appendChild(legendWidthHandle);
  }
  if (panelBody) {
    panelBody.appendChild(buildAdminPreviewResizeHandle('Pannello', 'trascina verticale', 'panel_height_preferred', 'y', 1, 8));
  }
}

function renderAdminDashboardLayoutPreview() {
  if (!adminDashboardLayoutPreview) return;
  ensureAdminUiColors();
  const layout = getAdminLayoutDraft();
  applyAdminLayoutPreviewVars(adminDashboardLayoutPreview, layout);
  adminDashboardLayoutPreview.innerHTML = '';

  const frame = document.createElement('div');
  frame.className = 'admin-dashboard-preview-frame';
  frame.innerHTML = `
    <div class="admin-dashboard-preview-meta">
      <span class="admin-dashboard-preview-chip">Pannelli: clamp(${layout.panel_height_min}px, ${layout.panel_height_preferred}vh, ${layout.panel_height_max}px)</span>
      <span class="admin-dashboard-preview-chip">Legenda: ${layout.legend_font_size}% / min ${layout.legend_col_min}px</span>
      <span class="admin-dashboard-preview-chip">Select min: ${layout.select_min_width}px</span>
      <span class="admin-dashboard-preview-chip">Canvas: ${layout.chart_height_pct}%</span>
    </div>
    <p class="admin-dashboard-preview-hint">Trascina le maniglie dentro il grafico esempio per cambiare direttamente pannello, select, legenda e canvas.</p>
  `;

  const grid = document.createElement('div');
  grid.className = 'admin-dashboard-preview-grid';
  var card = document.createElement('section');
  card.className = 'panel admin-dashboard-preview-card admin-layout-preview-panel';
  card.innerHTML = `
    <div class="panel-heading-row">
      <div>
        <h3>${escapeHtml(getAdminChartLabel('teamYear'))}</h3>
        <p class="muted">Anteprima layout: usa le maniglie sul pannello invece dei campi numerici.</p>
      </div>
    </div>
    <div class="chart-controls-row admin-layout-preview-selects">
      <select class="chart-type-select" disabled aria-label="Tipo grafico esempio">
        <option selected>Ciambella</option>
      </select>
      <select class="chart-range-select" disabled aria-label="Intervallo grafico esempio">
        <option selected>Anno</option>
      </select>
    </div>
    <div class="admin-layout-preview-body">
      <div class="chart admin-chart admin-layout-preview-chart-host"></div>
    </div>
  `;
  renderAdminPieOrDonutChart(card.querySelector('.admin-layout-preview-chart-host'), 'teamYear', getAdminLayoutPreviewStats('teamYear'), true);
  attachAdminLayoutPreviewInteractions(card);
  grid.appendChild(card);

  frame.appendChild(grid);
  adminDashboardLayoutPreview.appendChild(frame);
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
      renderAdminDashboardLayoutPreview();
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
            <code class="admin-color-hex">${color}</code>
            <input type="color" value="${color}" data-color-group="${config.group}" data-color-label="${escapeHtml(label)}" aria-label="Colore ${escapeHtml(label)}" />
          </span>
        `;
        const input = row.querySelector('input[type="color"]');
        const swatch = row.querySelector('.admin-color-row-swatch');
        const hex = row.querySelector('.admin-color-hex');
        input.addEventListener('input', () => {
          setDirectGroupColor(config.group, label, input.value);
          swatch.style.background = input.value;
          if (hex) hex.textContent = String(input.value || '').toUpperCase();
          renderAdminDashboardLayoutPreview();
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
  if (adminPersonalAxisMaxMineInput) adminPersonalAxisMaxMineInput.value = String(Number(adminUiColors?.settings?.personal_axis_max_mine || 0) || 0);
  if (adminPersonalAxisMaxGroupInput) adminPersonalAxisMaxGroupInput.value = String(Number(adminUiColors?.settings?.personal_axis_max_group || 0) || 0);
  const layoutDefaults = defaultUiColors().layout;
  Object.keys(layoutInputs).forEach((key) => {
    if (layoutInputs[key]) layoutInputs[key].value = String(adminUiColors?.layout?.[key] || layoutDefaults[key]);
  });
  renderAdminChartTitlesEditor();
  renderAdminDashboardLayoutPreview();
  renderAdminColorLists();
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  adminUiColors = normalizeUiColors(data.ui_colors || data || {});
  renderColorSettings();
}

async function loadAdminChartsPreviewData() {
  try {
    const [fabYear, catYear, teamYear, incidentYear, severityYear, userYear] = await Promise.all([
      fetchJson('/api/stats/fab/current-year?mode=months'),
      fetchJson('/api/stats/category/current-year?mode=months'),
      fetchJson('/api/stats/team/current-year?mode=months'),
      fetchJson('/api/stats/incident/current-year?mode=months'),
      fetchJson('/api/stats/severity/current-year?mode=months'),
      fetchJson('/api/stats/user/current-year?mode=months')
    ]);
    adminChartStats = {
      fabYear: fabYear.stats || [],
      catYear: catYear.stats || [],
      teamYear: teamYear.stats || [],
      incidentYear: incidentYear.stats || [],
      severityYear: severityYear.stats || [],
      userYear: userYear.stats || []
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
  const cleanAxisInput = (input) => {
    const num = Number((input && input.value) || 0);
    return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
  };
  if (adminPersonalAxisMaxMineInput) {
    adminUiColors.settings.personal_axis_max_mine = cleanAxisInput(adminPersonalAxisMaxMineInput);
  }
  if (adminPersonalAxisMaxGroupInput) {
    adminUiColors.settings.personal_axis_max_group = cleanAxisInput(adminPersonalAxisMaxGroupInput);
  }
  if (!adminUiColors.layout) adminUiColors.layout = {};
  Object.keys(layoutInputs).forEach((key) => {
    if (layoutInputs[key]) {
      const val = Math.round(Number(layoutInputs[key].value || 0));
      if (val > 0) adminUiColors.layout[key] = val;
    }
  });
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
  showToast('Grafici, colori e titoli personalizzati salvati con successo.', 'success', 'Impostazioni salvate');
}

themeToggleBtn.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  localStorage.setItem('dark-mode', next === 'dark' ? '1' : '');
  applyTheme(next);
  fetchJson('/api/user-charts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ palette: currentPaletteId, dark_mode: next === 'dark' })
  }).catch(function() {});
});

adminBrandLogoBtn?.addEventListener('click', () => { window.location.href = appUrl('/index.html'); });
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
  adminPresetSetContent('');
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
  adminPresetSetContent(adminIncidentPresetInput.value || '');
  adminSeverityDefaultSelect.value = String(incident.severity_default || 1);
  adminSeverityModeSelect.value = incident.severity_mode || 'default';
  adminFabDefaultSelect.value = incident.fab_default || '';
  if (adminNameModeCheckbox) adminNameModeCheckbox.checked = (incident.name_mode === 'custom');
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

function syncNewUserTeamField() {
  if (!newUserTeamSelect) return;
  const isSupervisor = newUserRoleSelect?.value === 'supervisor';
  newUserTeamSelect.disabled = isSupervisor;
  newUserTeamSelect.style.opacity = isSupervisor ? '0.4' : '';
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
  syncNewUserTeamField();
  const newUserGroupSel = document.getElementById('newUserGroup');
  const newUserGroupCustom = document.getElementById('newUserGroupCustom');
  if (newUserGroupSel) {
    const groups = Array.from(new Set(adminUsersCache.map((u) => normalizeGroupName(u.group_name || 'ProdOps')))).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    newUserGroupSel.innerHTML = groups.map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('') + '<option value="_new">+ Nuovo gruppo…</option>';
    newUserGroupSel.value = 'ProdOps';
    if (newUserGroupCustom) { newUserGroupCustom.style.display = 'none'; newUserGroupCustom.value = ''; }
  }
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
    showToast('Non hai i permessi necessari per accedere al pannello admin. Sarai reindirizzato alla dashboard.', 'error', 'Accesso non autorizzato');
    setTimeout(function () { window.location.href = appUrl('/index.html'); }, 2000);
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

function adminPresetBuildEditorHtml(storage) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(storage == null ? '' : storage);
  const out = [];
  adminPresetWalkBuild(tpl.content, out);
  return out.join('');
}

function adminPresetWalkBuild(node, out) {
  const nodes = node.childNodes || [];
  for (let i = 0; i < nodes.length; i += 1) {
    const child = nodes[i];
    if (child.nodeType === 3) {
      out.push(escapeHtml(child.nodeValue || '').replace(/\n/g, '<br>'));
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName;
    if (tag === 'BR') { out.push('<br>'); continue; }
    const wrap = ADMIN_PRESET_INLINE_TAGS[tag];
    if (wrap) {
      out.push('<' + wrap + '>');
      adminPresetWalkBuild(child, out);
      out.push('</' + wrap + '>');
      continue;
    }
    if (tag === 'DIV' || tag === 'P') {
      if (out.length) out.push('<br>');
      adminPresetWalkBuild(child, out);
      continue;
    }
    adminPresetWalkBuild(child, out);
  }
}

function adminPresetSerializeNode(node, out) {
  const nodes = node.childNodes || [];
  for (let i = 0; i < nodes.length; i += 1) {
    const child = nodes[i];
    if (child.nodeType === 3) { out.push(escapeHtml(child.nodeValue || '')); continue; }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName;
    if (tag === 'BR') { out.push('\n'); continue; }
    const wrap = ADMIN_PRESET_INLINE_TAGS[tag];
    if (wrap) {
      out.push('<' + wrap + '>');
      adminPresetSerializeNode(child, out);
      out.push('</' + wrap + '>');
      continue;
    }
    if (tag === 'DIV' || tag === 'P') {
      if (out.length) out.push('\n');
      adminPresetSerializeNode(child, out);
      continue;
    }
    adminPresetSerializeNode(child, out);
  }
}

function adminPresetGetStorage() {
  if (!adminIncidentPresetEditor) return adminIncidentPresetInput ? adminIncidentPresetInput.value : '';
  const out = [];
  adminPresetSerializeNode(adminIncidentPresetEditor, out);
  let value = out.join('');
  value = value.replace(/\n{3,}/g, '\n\n').replace(/\n/g, '<br>');
  value = value.replace(/(?:<br>){3,}/g, '<br><br>').replace(/^(?:<br>)+|(?:<br>)+$/g, '');
  return value.trim();
}

function adminPresetSyncFromEditor() {
  if (adminIncidentPresetInput) adminIncidentPresetInput.value = adminPresetGetStorage();
}

function adminPresetSetContent(storage) {
  if (!adminIncidentPresetEditor) {
    if (adminIncidentPresetInput) adminIncidentPresetInput.value = String(storage || '');
    return;
  }
  adminIncidentPresetEditor.innerHTML = adminPresetBuildEditorHtml(storage);
  adminPresetSyncFromEditor();
  adminPresetUpdateToolbarState();
}

function adminPresetUpdateToolbarState() {
  if (!adminIncidentPresetToolbar) return;
  const buttons = adminIncidentPresetToolbar.querySelectorAll('.desc-tool');
  Array.prototype.forEach.call(buttons, function (btn) {
    const cmd = btn.getAttribute('data-cmd');
    if (ADMIN_PRESET_TOOLBAR_CMDS.indexOf(cmd) === -1) return;
    let active = false;
    try { active = document.queryCommandState(cmd); } catch (error) { active = false; }
    btn.classList.toggle('is-active', !!active);
  });
}

function adminPresetMoveCaretToEnd() {
  if (!adminIncidentPresetEditor) return;
  const range = document.createRange();
  range.selectNodeContents(adminIncidentPresetEditor);
  range.collapse(false);
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

// Memorizza l'ultima posizione valida del cursore dentro l'editor: l'apertura
// del dialog showPrompt (quando si aggiunge un campo preset) toglie il focus al
// contenteditable e la selezione va persa, per cui senza questo il token finiva
// sempre all'inizio invece che dove stava il cursore.
let adminPresetSavedRange = null;

function adminPresetSaveRange() {
  if (!adminIncidentPresetEditor) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const candidate = sel.getRangeAt(0);
  if (adminIncidentPresetEditor.contains(candidate.commonAncestorContainer)) {
    adminPresetSavedRange = candidate.cloneRange();
  }
}

function adminPresetInsertText(text) {
  if (!adminIncidentPresetEditor) {
    if (adminIncidentPresetInput) insertAtCursor(adminIncidentPresetInput, text);
    return;
  }
  const sel = window.getSelection();
  let range = null;
  // Priorità al range salvato: dopo il prompt il focus()/selezione live viene
  // ripristinato collassato a inizio editor, che sembra "valido" ma non è dove
  // stava davvero il cursore. Il range salvato su keyup/mouseup/blur è affidabile.
  if (adminPresetSavedRange && adminIncidentPresetEditor.contains(adminPresetSavedRange.commonAncestorContainer)) {
    range = adminPresetSavedRange.cloneRange();
  } else if (sel && sel.rangeCount) {
    const candidate = sel.getRangeAt(0);
    if (adminIncidentPresetEditor.contains(candidate.commonAncestorContainer)) range = candidate;
  }
  adminIncidentPresetEditor.focus();
  if (!range) {
    adminPresetMoveCaretToEnd();
    if (sel && sel.rangeCount) range = sel.getRangeAt(0);
  }
  if (!range) return;
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  range.deleteContents();
  const textNode = document.createTextNode(String(text || ''));
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  adminPresetSavedRange = range.cloneRange();
  adminPresetSyncFromEditor();
  adminPresetUpdateToolbarState();
}

function initAdminPresetEditor() {
  if (!adminIncidentPresetEditor || adminIncidentPresetEditor.dataset.adminPresetInit === '1') return;
  adminIncidentPresetEditor.dataset.adminPresetInit = '1';
  try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (error) {}
  adminIncidentPresetEditor.addEventListener('input', function () { adminPresetSyncFromEditor(); adminPresetSaveRange(); });
  adminIncidentPresetEditor.addEventListener('keyup', function () { adminPresetUpdateToolbarState(); adminPresetSaveRange(); });
  adminIncidentPresetEditor.addEventListener('mouseup', function () { adminPresetUpdateToolbarState(); adminPresetSaveRange(); });
  adminIncidentPresetEditor.addEventListener('focus', adminPresetUpdateToolbarState);
  adminIncidentPresetEditor.addEventListener('blur', adminPresetSaveRange);
  if (adminIncidentPresetToolbar) {
    adminIncidentPresetToolbar.addEventListener('mousedown', function (e) {
      if (e.target.closest('.desc-tool')) e.preventDefault();
    });
    adminIncidentPresetToolbar.addEventListener('click', function (e) {
      const btn = e.target.closest('.desc-tool');
      if (!btn) return;
      adminIncidentPresetEditor.focus();
      try { document.execCommand(btn.getAttribute('data-cmd'), false, null); } catch (error) {}
      adminPresetSyncFromEditor();
      adminPresetUpdateToolbarState();
    });
  }
  adminPresetSetContent(adminIncidentPresetInput ? adminIncidentPresetInput.value : '');
}

function normalizeGroupName(value) {
  const name = String(value || '').trim();
  return name || 'ProdOps';
}

// Formatta un last_login (datetime MySQL "YYYY-MM-DD HH:MM:SS") in dd/mm/yyyy HH:MM.
function formatLastLogin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '<span class="user-lastlogin-never">Mai</span>';
  // Sostituisce lo spazio con 'T' per un parsing piu affidabile cross-browser.
  const d = new Date(raw.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return escapeHtml(raw);
  const pad = (n) => String(n).padStart(2, '0');
  return escapeHtml(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`);
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

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PAGE_SIZE));
  if (usersPage > totalPages) usersPage = totalPages;
  if (usersPage < 1) usersPage = 1;
  const pageStart = (usersPage - 1) * USERS_PAGE_SIZE;
  const pageUsers = users.slice(pageStart, pageStart + USERS_PAGE_SIZE);

  const uniqueGroups = Array.from(new Set(adminUsersCache.map((u) => normalizeGroupName(u.group_name || 'ProdOps')))).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));

  const rows = pageUsers.map((user) => {
    const isSelf = Number(user.id) === Number(currentAdminUser?.id);
    const role = String(user.role || 'user');
    const isSupervisorRow = role === 'supervisor';
    const team = isSupervisorRow ? '' : String(user.team || 'A');
    const lastAdmin = role === 'admin' && adminCount <= 1;
    const roleLocked = isSelf || lastAdmin;
    const deleteLocked = isSelf || lastAdmin;
    const lockReason = isSelf ? 'Il tuo ruolo non puo essere modificato qui' : 'Deve restare almeno un amministratore';
    const username = escapeHtml(user.username);
    const initial = escapeHtml(String(user.username || '?').charAt(0).toUpperCase());
    const currentGroup = normalizeGroupName(user.group_name || 'ProdOps');
    const isDisabled = user.disabled === true;
    const groupInList = uniqueGroups.includes(currentGroup);
    const groupOptions = uniqueGroups.map((g) => `<option value="${escapeHtml(g)}" ${currentGroup === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('') +
      (!groupInList ? `<option value="${escapeHtml(currentGroup)}" selected>${escapeHtml(currentGroup)}</option>` : '') +
      '<option value="_new">+ Nuovo gruppo…</option>';
    const statusLabel = isDisabled ? '<span class="user-disabled-badge">Disabilitato</span>' : '<span class="user-enabled-badge">Attivo</span>';
    return `
      <tr class="user-table-row ${isSelf ? 'current-user-row' : ''} ${isDisabled ? 'user-disabled-row' : ''}" data-user-id="${Number(user.id)}">
        <td>
          <div class="user-table-identity">
            <span class="user-avatar" aria-hidden="true">${initial}</span>
            <div>
              <div class="user-table-name">${username} ${isSelf ? '<span class="current-user-pill">Tu</span>' : ''}</div>
              <div class="user-card-meta">${statusLabel}<span class="user-row-id">ID #${Number(user.id)}</span></div>
            </div>
          </div>
        </td>
        <td>
          <select class="user-role-select" aria-label="Ruolo ${username}" data-user-id="${Number(user.id)}" ${roleLocked ? `disabled title="${lockReason}"` : ''}>
            ${['user', 'moderator', 'admin', 'supervisor'].map((item) => `<option value="${item}" ${role === item ? 'selected' : ''}>${item === 'admin' ? 'Amministratore' : item === 'supervisor' ? 'Supervisor' : item === 'moderator' ? 'Moderatore' : 'Operatore'}</option>`).join('')}
          </select>
        </td>
        <td>
          <select class="user-team-select" aria-label="Team ${username}" data-user-id="${Number(user.id)}" ${isSupervisorRow ? 'disabled style="opacity:0.4"' : ''}>
            ${['A', 'B', 'C', 'D', 'E'].map((item) => `<option value="${item}" ${team === item ? 'selected' : ''}>Team ${item}</option>`).join('')}
          </select>
        </td>
        <td class="user-group-cell">
          <select class="user-group-select" aria-label="Gruppo ${username}" data-user-id="${Number(user.id)}">${groupOptions}</select>
          <input class="user-group-custom" aria-label="Nuovo gruppo ${username}" data-user-id="${Number(user.id)}" type="text" placeholder="Nome gruppo" style="display:none" />
        </td>
        <td>
          <label class="user-disable-toggle" title="${isSelf ? 'Non puoi disabilitare il tuo account' : (isDisabled ? 'Clicca per abilitare' : 'Clicca per disabilitare')}">
            <input type="checkbox" class="user-disable-check" data-user-id="${Number(user.id)}" ${isDisabled ? 'checked' : ''} ${isSelf ? 'disabled' : ''} />
            <span class="user-disable-label">${isDisabled ? 'Disab.' : 'Attivo'}</span>
          </label>
        </td>
        <td class="user-lastlogin-cell">${formatLastLogin(user.last_login)}</td>
        <td class="user-privacy-cell">${user.privacy_consent ? '<span class="user-privacy-yes" title="' + escapeHtml(formatLastLogin(user.privacy_consent)) + '">Accettata</span>' : '<span class="user-privacy-no">Non accettata</span>'}</td>
        <td>
          <div class="user-actions-cell">
            <button type="button" class="save-user-btn primary" data-user-id="${Number(user.id)}">Salva</button>
            <button type="button" class="delete-user-btn" data-user-id="${Number(user.id)}" data-username="${username}" ${deleteLocked ? `disabled title="${lockReason}"` : ''}>Elimina</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const pageButtons = [];
  for (let page = 1; page <= totalPages; page += 1) {
    pageButtons.push(`<button type="button" class="${page === usersPage ? 'active' : ''}" data-page="${page}">${page}</button>`);
  }

  usersList.innerHTML = `
    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr><th>Utente</th><th>Ruolo</th><th>Team</th><th>Gruppo</th><th>Stato</th><th>Ultimo accesso</th><th>Privacy</th><th>Azioni</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="users-dt-footer">
      <div class="dt-info">Pagina ${usersPage} di ${totalPages} · ${pageStart + 1}-${Math.min(pageStart + USERS_PAGE_SIZE, users.length)} di ${users.length}</div>
      <div class="dt-pagination">
        <button type="button" class="users-page-prev" ${usersPage <= 1 ? 'disabled' : ''}>‹</button>
        ${pageButtons.join('')}
        <button type="button" class="users-page-next" ${usersPage >= totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>
  `;

  usersList.querySelector('.users-page-prev')?.addEventListener('click', () => {
    if (usersPage <= 1) return;
    usersPage -= 1;
    renderUsers();
  });
  usersList.querySelector('.users-page-next')?.addEventListener('click', () => {
    if (usersPage >= totalPages) return;
    usersPage += 1;
    renderUsers();
  });
  usersList.querySelectorAll('.dt-pagination [data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextPage = Number(btn.dataset.page || 1);
      if (!nextPage || nextPage === usersPage) return;
      usersPage = nextPage;
      renderUsers();
    });
  });

  usersList.querySelectorAll('.save-user-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const row = btn.closest('.user-table-row');
      const roleSelect = row?.querySelector('.user-role-select');
      const teamSelect = row?.querySelector('.user-team-select');
      const groupSelect = row?.querySelector('.user-group-select');
      const groupCustom = row?.querySelector('.user-group-custom');
      const current = adminUsersCache.find((user) => Number(user.id) === userId);
      let groupName;
      if (groupSelect && groupSelect.value === '_new') {
        groupName = normalizeGroupName((groupCustom && groupCustom.value.trim()) || current?.group_name || 'ProdOps');
      } else {
        groupName = normalizeGroupName((groupSelect && groupSelect.value) || current?.group_name || 'ProdOps');
      }
      const payload = { role: roleSelect?.value || current?.role || 'user', team: teamSelect?.value || 'A', group_name: groupName };
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
        showToast('Impossibile salvare le modifiche utente: ' + (error.message || error), 'error', 'Errore salvataggio');
        btn.disabled = false;
        btn.textContent = 'Salva';
      }
    });
  });

  usersList.querySelectorAll('.user-role-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const teamSel = sel.closest('.user-table-row')?.querySelector('.user-team-select');
      if (!teamSel) return;
      const isSup = sel.value === 'supervisor';
      teamSel.disabled = isSup;
      teamSel.style.opacity = isSup ? '0.4' : '';
    });
  });

  usersList.querySelectorAll('.user-group-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const row = sel.closest('.user-table-row');
      const customInput = row?.querySelector('.user-group-custom');
      if (!customInput) return;
      if (sel.value === '_new') {
        customInput.style.display = '';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
        customInput.value = '';
      }
    });
  });

  usersList.querySelectorAll('.user-disable-check').forEach((chk) => {
    chk.addEventListener('change', async () => {
      const userId = Number(chk.dataset.userId);
      const label = chk.closest('.user-disable-toggle')?.querySelector('.user-disable-label');
      const row = chk.closest('.user-table-row');
      const isDisabling = chk.checked;
      chk.disabled = true;
      try {
        await fetchJson(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disabled: isDisabling })
        });
        if (label) label.textContent = isDisabling ? 'Disab.' : 'Attivo';
        if (row) row.classList.toggle('user-disabled-row', isDisabling);
        const statusEl = row?.querySelector('.user-enabled-badge, .user-disabled-badge');
        if (statusEl) {
          statusEl.className = isDisabling ? 'user-disabled-badge' : 'user-enabled-badge';
          statusEl.textContent = isDisabling ? 'Disabilitato' : 'Attivo';
        }
        const cached = adminUsersCache.find((u) => Number(u.id) === userId);
        if (cached) cached.disabled = isDisabling;
        showToast(isDisabling ? 'Utente disabilitato' : 'Utente abilitato', 'success', 'Stato aggiornato');
      } catch (error) {
        showToast('Impossibile aggiornare lo stato: ' + (error.message || error), 'error', 'Errore');
        chk.checked = !isDisabling;
      }
      chk.disabled = false;
    });
  });

  usersList.querySelectorAll('.delete-user-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = Number(btn.dataset.userId);
      const username = btn.dataset.username || '';
      if (!userId) return;
      if (!(await showConfirm('L\'utente "' + username + '" verrà eliminato definitivamente e non potrà più accedere al sistema.', { title: 'Elimina utente', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
      try {
        await fetchJson(`/api/users/${userId}`, { method: 'DELETE' });
        await Promise.all([loadUsers(), loadGroupTargets()]);
      } catch (error) {
        showToast("Impossibile eliminare l'utente: " + (error.message || error), 'error', 'Errore eliminazione');
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
        showToast('Impossibile salvare il target del gruppo: ' + (error.message || error), 'error', 'Errore salvataggio');
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
          if (action === 'approve') await loadPresetOptionsManager();
        } catch (error) {
          showToast("Impossibile modificare l'opzione: " + (error.message || error), 'error', 'Errore modifica');
          btn.disabled = false;
        }
      });
    });
  } catch (error) {
    if (presetRequestsSummary) presetRequestsSummary.textContent = 'Errore caricamento';
    presetRequestsList.innerHTML = `<div class="users-empty muted">Errore caricamento richieste: ${escapeHtml(error.message || error)}</div>`;
  }
}

var presetOptionsState = {};

function getPresetOptionFormatMode(fieldKey) {
  var mode = null;
  (presetOptionsCache || []).forEach(function(field) {
    if (field.field_key === fieldKey) mode = field.format_mode;
  });
  return mode === 'lower' || mode === 'upper' || mode === 'capitalize' ? mode : 'none';
}

async function setPresetOptionFormatMode(fieldKey, mode) {
  var normalized = (mode === 'lower' || mode === 'upper' || mode === 'capitalize') ? mode : 'none';
  await fetchJson('/api/admin/preset-option-format', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field_key: fieldKey, mode: normalized })
  });
  (presetOptionsCache || []).forEach(function(field) {
    if (field.field_key === fieldKey) field.format_mode = normalized;
  });
}

function getPresetState(fieldKey) {
  if (!presetOptionsState[fieldKey]) presetOptionsState[fieldKey] = { page: 0, sortDir: 1, pageSize: 10 };
  return presetOptionsState[fieldKey];
}

function getPresetSearch() {
  const el = presetOptionsManager ? presetOptionsManager.querySelector('#presetOptionsSearch') : null;
  return el ? el.value.toLowerCase().trim() : '';
}

function capitalizePresetOptionValue(value) {
  var normalized = String(value || '').toLowerCase();
  return normalized.replace(/\b([a-zà-öø-ÿ])/g, function(match) { return match.toUpperCase(); });
}

function formatPresetOptionValue(value, mode) {
  var text = String(value || '').trim();
  if (!text) return '';
  if (mode === 'lower') return text.toLowerCase();
  if (mode === 'upper') return text.toUpperCase();
  if (mode === 'capitalize') return capitalizePresetOptionValue(text);
  return text;
}

function getPresetFormatLabel(mode) {
  if (mode === 'none') return 'nessun formato automatico';
  if (mode === 'lower') return 'tutto minuscolo';
  if (mode === 'upper') return 'tutto maiuscolo';
  if (mode === 'capitalize') return 'prima lettera maiuscola';
  return 'formato selezionato';
}

async function applyPresetOptionFormat(fieldKey, mode, triggerBtn) {
  var allOptions = [];
  var duplicates = [];
  var nextValuesMap = {};
  var updates = [];

  (presetOptionsCache || []).forEach(function(field) {
    if (field.field_key === fieldKey) allOptions = Array.isArray(field.options) ? field.options : [];
  });

  allOptions.forEach(function(originalValue) {
    var nextValue = formatPresetOptionValue(originalValue, mode);
    if (!nextValue) return;
    if (Object.prototype.hasOwnProperty.call(nextValuesMap, nextValue) && nextValuesMap[nextValue] !== originalValue) {
      duplicates.push(nextValue);
      return;
    }
    nextValuesMap[nextValue] = originalValue;
    if (nextValue !== originalValue) {
      updates.push({ original_value: originalValue, value: nextValue });
    }
  });

  if (duplicates.length) {
    showToast('Operazione annullata: il formato "' + getPresetFormatLabel(mode) + '" creerebbe duplicati nel menu "' + fieldKey + '".', 'warning', 'Duplicati rilevati');
    return;
  }

  if (!updates.length) {
    showToast('Gli elementi del menu "' + fieldKey + '" sono già nel formato "' + getPresetFormatLabel(mode) + '".', 'info', 'Nessuna modifica');
    return;
  }

  if (!(await showConfirm('Vuoi applicare il formato "' + getPresetFormatLabel(mode) + '" a tutti gli elementi del menu "' + fieldKey + '"?', { title: 'Formatta lista menu', type: 'warning', confirmText: 'Applica', cancelText: 'Annulla' }))) return;

  if (triggerBtn) triggerBtn.disabled = true;
  try {
    for (var i = 0; i < updates.length; i += 1) {
      await fetchJson('/api/admin/preset-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_key: fieldKey,
          original_value: updates[i].original_value,
          value: updates[i].value
        })
      });
    }
    showToast('Formato applicato a ' + updates.length + ' elementi del menu "' + fieldKey + '".', 'success', 'Lista aggiornata');
    await loadPresetOptionsManager();
  } catch (error) {
    showToast('Impossibile aggiornare la lista: ' + (error.message || error), 'error', 'Errore formattazione');
    if (triggerBtn) triggerBtn.disabled = false;
  }
}

function getPresetFieldOptions(fieldKey) {
  var allOptions = [];
  (presetOptionsCache || []).forEach(function(field) {
    if (field.field_key === fieldKey) allOptions = Array.isArray(field.options) ? field.options : [];
  });
  return allOptions;
}

function buildPresetFormatPlan(fieldKey, mode) {
  var allOptions = getPresetFieldOptions(fieldKey);
  var duplicates = [];
  var nextValuesMap = {};
  var updates = [];

  allOptions.forEach(function(originalValue) {
    var nextValue = formatPresetOptionValue(originalValue, mode);
    if (!nextValue) return;
    if (Object.prototype.hasOwnProperty.call(nextValuesMap, nextValue) && nextValuesMap[nextValue] !== originalValue) {
      duplicates.push(nextValue);
      return;
    }
    nextValuesMap[nextValue] = originalValue;
    if (nextValue !== originalValue) updates.push({ original_value: originalValue, value: nextValue });
  });

  return { duplicates: duplicates, updates: updates };
}

function syncPresetFormatInputs(fieldKey, mode) {
  if (!presetOptionsManager) return;
  var card = presetOptionsManager.querySelector('.preset-option-card[data-field-key="' + fieldKey + '"]');
  if (!card) return;
  var select = card.querySelector('.preset-option-format-select');
  if (select) select.value = mode;
}

function formatPresetOptionForField(fieldKey, value) {
  return formatPresetOptionValue(value, getPresetOptionFormatMode(fieldKey));
}

function presetOptionValueExists(fieldKey, value, excludedOriginal) {
  var options = getPresetFieldOptions(fieldKey);
  for (var i = 0; i < options.length; i += 1) {
    if (options[i] === value && options[i] !== excludedOriginal) return true;
  }
  return false;
}

async function applyPresetOptionFormatSetting(fieldKey, mode, triggerInput) {
  var previousMode = getPresetOptionFormatMode(fieldKey);
  var plan = buildPresetFormatPlan(fieldKey, mode);

  if (plan.duplicates.length) {
    showToast('Operazione annullata: il formato "' + getPresetFormatLabel(mode) + '" creerebbe duplicati nel menu "' + fieldKey + '".', 'warning', 'Duplicati rilevati');
    syncPresetFormatInputs(fieldKey, previousMode);
    return;
  }

  if (!plan.updates.length) {
    if (triggerInput) triggerInput.disabled = true;
    try {
      await setPresetOptionFormatMode(fieldKey, mode);
      showToast(mode === 'none'
        ? 'Formato automatico disattivato per il menu "' + fieldKey + '".'
        : 'Formato automatico salvato per il menu "' + fieldKey + '". I nuovi elementi useranno "' + getPresetFormatLabel(mode) + '".', 'success', 'Impostazione salvata');
      syncPresetFormatInputs(fieldKey, mode);
    } catch (error) {
      showToast('Impossibile salvare il formato: ' + (error.message || error), 'error', 'Errore formattazione');
      syncPresetFormatInputs(fieldKey, previousMode);
    } finally {
      if (triggerInput) triggerInput.disabled = false;
    }
    return;
  }

  if (!(await showConfirm('Vuoi applicare il formato "' + getPresetFormatLabel(mode) + '" a tutti gli elementi attuali del menu "' + fieldKey + '" e usarlo anche per i nuovi inserimenti?', { title: 'Formato lista', type: 'warning', confirmText: 'Applica', cancelText: 'Annulla' }))) {
    syncPresetFormatInputs(fieldKey, previousMode);
    return;
  }

  if (triggerInput) triggerInput.disabled = true;
  try {
    for (var i = 0; i < plan.updates.length; i += 1) {
      await fetchJson('/api/admin/preset-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_key: fieldKey,
          original_value: plan.updates[i].original_value,
          value: plan.updates[i].value
        })
      });
    }
    await setPresetOptionFormatMode(fieldKey, mode);
    showToast('Formato applicato a ' + plan.updates.length + ' elementi del menu "' + fieldKey + '". I nuovi elementi useranno "' + getPresetFormatLabel(mode) + '".', 'success', 'Lista aggiornata');
    await loadPresetOptionsManager();
  } catch (error) {
    showToast('Impossibile aggiornare la lista: ' + (error.message || error), 'error', 'Errore formattazione');
    if (triggerInput) triggerInput.disabled = false;
    syncPresetFormatInputs(fieldKey, previousMode);
  }
}

function renderPresetCardTable(fieldKey) {
  if (!presetOptionsManager) return;
  const card = presetOptionsManager.querySelector(`.preset-option-card[data-field-key="${fieldKey}"]`);
  if (!card) return;

  const state = getPresetState(fieldKey);
  const q = getPresetSearch();
  let allOptions = [];
  (presetOptionsCache || []).forEach((f) => { if (f.field_key === fieldKey) allOptions = Array.isArray(f.options) ? f.options : []; });

  const filtered = allOptions.filter((opt) => !q || opt.toLowerCase().indexOf(q) !== -1);
  const sorted = filtered.slice().sort((a, b) => state.sortDir * a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const total = sorted.length;
  const pageSize = state.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (state.page >= totalPages) state.page = totalPages - 1;
  if (state.page < 0) state.page = 0;
  const start = state.page * pageSize;
  const end = Math.min(start + pageSize, total);
  const paged = sorted.slice(start, end);

  const tbody = card.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = paged.length
      ? paged.map((option) => `<tr data-field-key="${escapeHtml(fieldKey)}" data-option-value="${escapeHtml(option)}">
          <td class="preset-option-value-cell">${escapeHtml(option)}</td>
          <td><div class="preset-option-actions">
            <button type="button" class="secondary preset-option-edit-btn" data-field-key="${escapeHtml(fieldKey)}" data-option-value="${escapeHtml(option)}">Modifica</button>
            <button type="button" class="preset-option-delete-btn" data-field-key="${escapeHtml(fieldKey)}" data-option-value="${escapeHtml(option)}">Elimina</button>
          </div></td>
        </tr>`).join('')
      : `<tr><td colspan="2" class="preset-option-empty muted">Nessuna opzione ${q ? 'trovata' : 'approvata'}.</td></tr>`;
  }

  const sortTh = card.querySelector('.preset-dt-sort-th');
  if (sortTh) sortTh.innerHTML = `Valore <span class="dt-sort-icon">${state.sortDir === 1 ? '▲' : '▼'}</span>`;

  const countChip = card.querySelector('.preset-option-count');
  if (countChip) countChip.textContent = `${allOptions.length} elementi`;

  const infoEl = card.querySelector('.dt-info');
  if (infoEl) infoEl.textContent = total > 0 ? `${start + 1}–${end} di ${total}` : '';

  const pagEl = card.querySelector('.dt-pagination');
  if (pagEl) {
    if (totalPages <= 1) {
      pagEl.innerHTML = '';
    } else {
      const maxBtns = 5;
      const half = Math.floor(maxBtns / 2);
      let rangeStart = Math.max(0, Math.min(state.page - half, totalPages - maxBtns));
      const rangeEnd = Math.min(totalPages, rangeStart + maxBtns);
      let btns = '';
      if (rangeStart > 0) btns += `<button type="button" class="dt-page-btn" data-page="0">1</button><span class="dt-ellipsis">…</span>`;
      for (let i = rangeStart; i < rangeEnd; i++) {
        btns += `<button type="button" class="dt-page-btn${i === state.page ? ' active' : ''}" data-page="${i}">${i + 1}</button>`;
      }
      if (rangeEnd < totalPages) btns += `<span class="dt-ellipsis">…</span><button type="button" class="dt-page-btn" data-page="${totalPages - 1}">${totalPages}</button>`;
      pagEl.innerHTML = `<button type="button" class="dt-prev-btn"${state.page === 0 ? ' disabled' : ''}>‹</button>${btns}<button type="button" class="dt-next-btn"${state.page >= totalPages - 1 ? ' disabled' : ''}>›</button>`;
    }
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

  const pageSizes = [5, 10, 25];
  const cardsHtml = fields.map((field, index) => {
    const fk = escapeHtml(field.field_key);
    const state = getPresetState(field.field_key);
    const formatMode = getPresetOptionFormatMode(field.field_key);
    const selectId = 'preset-format-select-' + index;
    return `<article class="preset-option-card" data-field-key="${fk}">
      <div class="preset-option-card-header">
        <div><h4>${escapeHtml(field.field_label || field.field_key)}</h4>
        <div class="preset-option-key">${fk}</div></div>
        <div class="admin-summary-chip preset-option-count">0 elementi</div>
      </div>
      <div class="preset-option-add-row">
        <input type="text" class="preset-option-new-input" data-field-key="${fk}" placeholder="Nuovo elemento approvato" />
        <button type="button" class="primary preset-option-add-btn" data-field-key="${fk}" data-field-label="${escapeHtml(field.field_label || field.field_key)}">Aggiungi</button>
      </div>
      <div class="preset-option-bulk-format">
        <label class="preset-option-bulk-label" for="${selectId}">Formato lista:</label>
        <select class="preset-option-format-select" id="${selectId}" data-field-key="${fk}">
          <option value="none"${formatMode === 'none' ? ' selected' : ''}>Nessuno</option>
          <option value="lower"${formatMode === 'lower' ? ' selected' : ''}>tutto minuscolo</option>
          <option value="upper"${formatMode === 'upper' ? ' selected' : ''}>TUTTO MAIUSCOLO</option>
          <option value="capitalize"${formatMode === 'capitalize' ? ' selected' : ''}>Prima Lettera Maiuscola</option>
        </select>
        <p class="preset-option-bulk-help">I nuovi elementi e le modifiche useranno automaticamente il formato selezionato.</p>
      </div>
      <table class="preset-option-table">
        <thead><tr>
          <th class="preset-dt-sort-th" data-field-key="${fk}">Valore</th>
          <th>Azioni</th>
        </tr></thead>
        <tbody></tbody>
      </table>
      <div class="dt-footer">
        <div class="dt-footer-left">
          <label class="dt-page-size-label">Righe: <select class="dt-page-size">${pageSizes.map((s) => `<option value="${s}"${s === state.pageSize ? ' selected' : ''}>${s}</option>`).join('')}</select></label>
          <span class="dt-info muted"></span>
        </div>
        <div class="dt-pagination"></div>
      </div>
    </article>`;
  }).join('');

  presetOptionsManager.innerHTML = `
    <div class="preset-options-search-bar"><input type="search" id="presetOptionsSearch" placeholder="Cerca opzione..." autocomplete="off" /></div>
    <div class="preset-options-grid">${cardsHtml}</div>`;

  fields.forEach((field) => renderPresetCardTable(field.field_key));

  // Search
  const searchInput = presetOptionsManager.querySelector('#presetOptionsSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      fields.forEach((field) => {
        getPresetState(field.field_key).page = 0;
        renderPresetCardTable(field.field_key);
        const card = presetOptionsManager.querySelector(`.preset-option-card[data-field-key="${field.field_key}"]`);
        if (card) {
          const opts = Array.isArray(field.options) ? field.options : [];
          card.style.display = (!q || opts.some((o) => o.toLowerCase().indexOf(q) !== -1)) ? '' : 'none';
        }
      });
    });
  }

  // Sort + pagination via event delegation per card
  presetOptionsManager.querySelectorAll('.preset-option-card').forEach((card) => {
    const fieldKey = card.dataset.fieldKey || '';

    card.querySelector('.preset-dt-sort-th')?.addEventListener('click', () => {
      const state = getPresetState(fieldKey);
      state.sortDir = state.sortDir === 1 ? -1 : 1;
      state.page = 0;
      renderPresetCardTable(fieldKey);
    });

    card.querySelector('.dt-page-size')?.addEventListener('change', function() {
      const state = getPresetState(fieldKey);
      state.pageSize = parseInt(this.value, 10) || 10;
      state.page = 0;
      renderPresetCardTable(fieldKey);
    });

    card.querySelector('.dt-pagination')?.addEventListener('click', (e) => {
      const state = getPresetState(fieldKey);
      let allOpts = [];
      (presetOptionsCache || []).forEach((f) => { if (f.field_key === fieldKey) allOpts = Array.isArray(f.options) ? f.options : []; });
      const totalPages = Math.max(1, Math.ceil(allOpts.length / state.pageSize));
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('dt-prev-btn') && state.page > 0) state.page--;
      else if (btn.classList.contains('dt-next-btn') && state.page < totalPages - 1) state.page++;
      else if (btn.classList.contains('dt-page-btn')) state.page = parseInt(btn.dataset.page, 10) || 0;
      renderPresetCardTable(fieldKey);
    });

    // Add
    card.querySelector('.preset-option-add-btn')?.addEventListener('click', async () => {
      const input = card.querySelector(`.preset-option-new-input[data-field-key="${fieldKey}"]`);
      const rawValue = (input?.value || '').trim();
      const fieldLabel = card.querySelector('.preset-option-add-btn')?.dataset.fieldLabel || fieldKey;
      if (!rawValue) { showToast('Il campo Ã¨ vuoto. Inserisci il valore da aggiungere al menu prima di procedere.', 'warning', 'Campo obbligatorio'); return; }
      const value = formatPresetOptionForField(fieldKey, rawValue);
      if (presetOptionValueExists(fieldKey, value, '')) { showToast('Esiste giÃ  un elemento con questo valore nel menu "' + fieldKey + '".', 'warning', 'Duplicato'); return; }
      try {
        input.disabled = true;
        await fetchJson('/api/admin/preset-options', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field_key: fieldKey, field_label: fieldLabel, value }) });
        await loadPresetOptionsManager();
      } catch (error) {
        showToast("Impossibile aggiungere l'elemento: " + (error.message || error), 'error', 'Errore aggiunta');
        if (input) input.disabled = false;
      }
    });

    card.querySelector('.preset-option-format-select')?.addEventListener('change', async function() {
      await applyPresetOptionFormatSetting(fieldKey, this.value || 'none', this);
    });

    // Edit/Delete via delegation on tbody
    card.querySelector('tbody')?.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.preset-option-delete-btn');
      if (deleteBtn) {
        const value = deleteBtn.dataset.optionValue || '';
        if (!(await showConfirm('L\'opzione "' + value + '" verrà rimossa definitivamente dal menu "' + fieldKey + '".', { title: 'Elimina opzione', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
        deleteBtn.disabled = true;
        try {
          await fetchJson('/api/admin/preset-options', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field_key: fieldKey, value }) });
          await loadPresetOptionsManager();
        } catch (error) {
          showToast("Impossibile eliminare l'elemento: " + (error.message || error), 'error', 'Errore eliminazione');
          deleteBtn.disabled = false;
        }
        return;
      }
      const editBtn = e.target.closest('.preset-option-edit-btn');
      if (editBtn) {
        const row = editBtn.closest('tr');
        if (!row) return;
        const originalValue = editBtn.dataset.optionValue || '';
        row.innerHTML = `<td><input type="text" class="preset-option-edit-input" value="${escapeHtml(originalValue)}" /></td>
          <td><div class="preset-option-actions">
            <button type="button" class="primary preset-option-save-btn">Salva</button>
            <button type="button" class="secondary preset-option-cancel-btn">Annulla</button>
          </div></td>`;
        row.querySelector('.preset-option-cancel-btn')?.addEventListener('click', () => renderPresetCardTable(fieldKey));
        row.querySelector('.preset-option-save-btn')?.addEventListener('click', async () => {
          const rawNextValue = (row.querySelector('.preset-option-edit-input')?.value || '').trim();
          const nextValue = formatPresetOptionForField(fieldKey, rawNextValue);
          if (!nextValue) { showToast('Il valore modificato non puÃ² essere vuoto. Inserisci un testo valido.', 'warning', 'Valore non valido'); return; }
          if (presetOptionValueExists(fieldKey, nextValue, originalValue)) { showToast('Esiste giÃ  un elemento con questo valore nel menu "' + fieldKey + '".', 'warning', 'Duplicato'); return; }
          try {
            await fetchJson('/api/admin/preset-options', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field_key: fieldKey, original_value: originalValue, value: nextValue }) });
            await loadPresetOptionsManager();
          } catch (error) {
            showToast("Impossibile modificare l'elemento: " + (error.message || error), 'error', 'Errore modifica');
          }
        });
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
    catBtn.innerHTML = `<span class="category-toggle-label">${renderCategoryLogoMarkup(cat.logo)}<span class="category-toggle-text">${escapeHtml(cat.name)}${cat.hidden ? '<span class="admin-hidden-badge">Nascosta</span>' : ''}</span></span><span class="admin-actions"><button type="button" class="tiny-toggle-hide" aria-label="${cat.hidden ? 'Mostra categoria' : 'Nascondi categoria'}" title="${cat.hidden ? 'Mostra categoria' : 'Nascondi categoria'}" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" data-logo="${String(cat.logo || '').replace(/"/g, '&quot;')}" data-hidden="${cat.hidden ? '1' : '0'}">${cat.hidden ? 'Mostra' : 'Nascondi'}</button><button type="button" class="tiny-edit" aria-label="Modifica categoria" title="Modifica categoria" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" data-logo="${String(cat.logo || '').replace(/"/g, '&quot;')}" data-hidden="${cat.hidden ? '1' : '0'}">&#9998;</button><button type="button" class="tiny-add" data-type="incident" data-id="${cat.id}" title="Nuovo incident">+</button><button type="button" class="tiny-delete" data-type="category" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" title="Elimina categoria">x</button></span>`;

    const ul = document.createElement('ul');
    ul.className = 'incident-list';
    cat.incidents.forEach((inc) => {
      const li = document.createElement('li');
      li.dataset.incidentId = String(inc.id);
      li.draggable = true;
      const firstPreset = Array.isArray(inc.presets) ? (inc.presets[0] || '') : '';
      li.innerHTML = `<div class="incident-btn"><span>${inc.name}${inc.hidden ? '<span class="admin-hidden-badge">Nascosto</span>' : ''}</span><span class="admin-actions"><button type="button" class="tiny-toggle-hide" aria-label="${inc.hidden ? 'Mostra incident' : 'Nascondi incident'}" title="${inc.hidden ? 'Mostra incident' : 'Nascondi incident'}" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" data-hidden="${inc.hidden ? '1' : '0'}">${inc.hidden ? 'Mostra' : 'Nascondi'}</button><button type="button" class="tiny-edit" aria-label="Modifica incident" title="Modifica incident" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" data-hidden="${inc.hidden ? '1' : '0'}" data-preset="${firstPreset.replace(/"/g, '&quot;')}" data-severity-default="${Number(inc.severity_default || 1)}" data-severity-mode="${inc.severity_mode || 'default'}" data-fab-default="${inc.fab_default || ''}" data-name-mode="${inc.name_mode || 'default'}">&#9998;</button><button type="button" class="tiny-delete" data-type="incident" data-id="${inc.id}" data-name="${inc.name.replace(/"/g, '&quot;')}" title="Elimina incident">x</button></span></div>`;

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
          showToast("Impossibile salvare l'ordinamento degli incident: " + (error.message || error), 'error', 'Errore ordinamento');
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
        const currentLogo = btn.dataset.logo || '';

        if (type === 'category') {
          openCategoryModal({ id, name: current, logo: currentLogo });
          return;
        }

        openIncidentModal({
          id,
          name: current,
          preset: btn.dataset.preset || '',
          severity_default: Number(btn.dataset.severityDefault || 1),
          severity_mode: btn.dataset.severityMode || 'default',
          fab_default: btn.dataset.fabDefault || '',
          name_mode: btn.dataset.nameMode || 'default'
        });
      } catch (error) {
        showToast("Impossibile salvare le modifiche all'incident: " + (error.message || error), 'error', 'Errore modifica');
      }
    });
  });

  document.querySelectorAll('.tiny-add').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const categoryId = Number(btn.dataset.id);
        const name = await showPrompt('Assegna un nome al nuovo incident da aggiungere a questa categoria.', { title: 'Nuovo incident', placeholder: 'Nome incident', confirmText: 'Crea' });
        if (!name || !name.trim()) return;
        await fetchJson('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: categoryId, name: name.trim() })
        });
        await loadAdminMenu();
      } catch (error) {
        showToast("Impossibile creare l'incident: " + (error.message || error), 'error', 'Errore creazione');
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
          if (!(await showConfirm('La categoria "' + name + '" e tutti gli incident collegati verranno eliminati definitivamente.', { title: 'Elimina categoria', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
          const res = await fetch(appUrl(`/api/categories/${id}`), { method: 'DELETE' });
          if (res.status === 409) {
            let count = 0;
            try {
              const text = (await res.text()).replace(/^ï»¿+/, '');
              const data = JSON.parse(text);
              count = data.ticket_count || 0;
            } catch (ex) {}
            const wantHide = await showConfirm('Ci sono ' + count + ' ticket associati a questa categoria. Si consiglia di nasconderla invece di eliminarla, oppure di eliminare prima tutti i ticket associati.\n\nVuoi nascondere la categoria adesso?', { title: 'Categoria con ticket associati', type: 'warning', confirmText: 'Nascondi categoria', cancelText: 'Annulla' });
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
          if (!(await showConfirm('L\'incident "' + name + '" verrà eliminato definitivamente.', { title: 'Elimina incident', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
          await fetchJson(`/api/incidents/${id}`, { method: 'DELETE' });
        }
        await loadAdminMenu();
      } catch (error) {
        showToast('Impossibile eliminare: ' + (error.message || error), 'error', 'Errore eliminazione');
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
          const currentLogo = btn.dataset.logo || '';
          await fetchJson(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hidden: !isHidden, name, logo: currentLogo })
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
              fab_default: editBtn?.dataset.fabDefault || '',
              name_mode: editBtn?.dataset.nameMode || 'default'
            })
          });
        }
        await loadAdminMenu();
      } catch (error) {
        showToast('Impossibile aggiornare la visibilità: ' + (error.message || error), 'error', 'Errore aggiornamento');
      }
    });
  });

  const addCategoryBtn = document.getElementById('addCategoryBtn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => openCategoryModal({ id: null, name: '', logo: '' }));
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
  control?.addEventListener('input', () => {
    usersPage = 1;
    renderUsers();
  });
  control?.addEventListener('change', () => {
    usersPage = 1;
    renderUsers();
  });
});

openUserCreateModalBtn?.addEventListener('click', openUserCreateModal);

document.querySelectorAll('.close-user-modal').forEach((btn) => {
  btn.addEventListener('click', closeUserCreateModal);
});

document.querySelectorAll('.close-category-modal').forEach((btn) => {
  btn.addEventListener('click', closeCategoryModal);
});

adminIncidentModal?.addEventListener('mousedown', (e) => {
  adminOverlayPressStarted = e.target === adminIncidentModal;
});

adminIncidentModal?.addEventListener('mouseup', (e) => {
  if (e.target === adminIncidentModal && adminOverlayPressStarted) closeIncidentModal();
  adminOverlayPressStarted = false;
});

newUserRoleSelect?.addEventListener('change', syncNewUserTeamField);

document.getElementById('newUserGroup')?.addEventListener('change', function() {
  const customInput = document.getElementById('newUserGroupCustom');
  if (!customInput) return;
  if (this.value === '_new') {
    customInput.style.display = '';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
});

userCreateModal?.addEventListener('mousedown', (e) => {
  userCreateOverlayPressStarted = e.target === userCreateModal;
});

userCreateModal?.addEventListener('mouseup', (e) => {
  if (e.target === userCreateModal && userCreateOverlayPressStarted) closeUserCreateModal();
  userCreateOverlayPressStarted = false;
});

adminCategoryModal?.addEventListener('mousedown', (e) => {
  categoryModalOverlayPressStarted = e.target === adminCategoryModal;
});

adminCategoryModal?.addEventListener('mouseup', (e) => {
  if (e.target === adminCategoryModal && categoryModalOverlayPressStarted) closeCategoryModal();
  categoryModalOverlayPressStarted = false;
});

adminCategoryLogoGrid?.addEventListener('click', (e) => {
  const button = e.target.closest('.admin-category-logo-option');
  if (!button) return;
  const currentName = String(adminCategoryNameInput?.value || '').trim();
  renderCategoryLogoPicker(String(button.dataset.logoValue || ''), currentName);
});

adminCategoryNameInput?.addEventListener('input', () => {
  const currentLogo = getSelectedCategoryLogoValue();
  renderCategoryLogoPicker(currentLogo, adminCategoryNameInput.value || '');
});

adminCategoryForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = String(adminCategoryNameInput?.value || '').trim();
  const logo = getSelectedCategoryLogoValue();
  if (!name) return;
  try {
    if (editingCategoryId) {
      await fetchJson(`/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logo })
      });
    } else {
      await fetchJson('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logo })
      });
    }
    closeCategoryModal();
    await loadAdminMenu();
  } catch (error) {
    showToast('Impossibile salvare la categoria: ' + (error.message || error), 'error', 'Errore categoria');
  }
});

adminIncidentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editingIncidentId) return;

  adminPresetSyncFromEditor();
  const nextName = (adminIncidentNameInput.value || '').trim();
  const preset = (adminIncidentPresetInput.value || '').trim();
  const severity_default = Number(adminSeverityDefaultSelect.value || 1);
  const severity_mode = (adminSeverityModeSelect.value || 'default').toString();
  const fab_default = (adminFabDefaultSelect.value || '').trim().toUpperCase();
  const name_mode = (adminNameModeCheckbox && adminNameModeCheckbox.checked) ? 'custom' : 'default';
  if (!nextName) return;

  await fetchJson(`/api/incidents/${editingIncidentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nextName, severity_default, severity_mode, fab_default, name_mode })
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
  const role = (newUserRoleSelect?.value || 'user').trim();
  const team = (newUserTeamSelect?.value || 'A').trim();
  const newUserGroupSel = document.getElementById('newUserGroup');
  const newUserGroupCustom = document.getElementById('newUserGroupCustom');
  let group_name;
  if (newUserGroupSel && newUserGroupSel.value === '_new') {
    group_name = normalizeGroupName((newUserGroupCustom && newUserGroupCustom.value.trim()) || 'ProdOps');
  } else {
    group_name = normalizeGroupName((newUserGroupSel && newUserGroupSel.value) || 'ProdOps');
  }
  if (!username) {
    showToast('Il campo username è obbligatorio. Inserisci un nome utente valido.', 'warning', 'Campo obbligatorio');
    return;
  }
  const body = { username, role, team, group_name };
  try {
    await fetchJson('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    userCreateForm.reset();
    if (newUserRoleSelect) newUserRoleSelect.value = 'user';
    if (newUserTeamSelect) newUserTeamSelect.value = 'A';
    syncNewUserTeamField();
    closeUserCreateModal();
    await Promise.all([loadUsers(), loadGroupTargets()]);
  } catch (error) {
    showToast("Impossibile creare l'utente: " + (error.message || error), 'error', 'Errore creazione');
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

  const isModerator = currentAdminUser?.role === 'moderator';
  if (isModerator) {
    const restrictedTabs = ['users', 'appearance'];
    adminTabButtons.forEach((btn) => {
      if (restrictedTabs.includes(btn.dataset.adminTab)) btn.style.display = 'none';
    });
    adminTabPanels.forEach((panel) => {
      if (restrictedTabs.includes(panel.dataset.adminPanel)) panel.hidden = true;
    });
    if (restrictedTabs.includes(savedAdminTab)) {
      savedAdminTab = 'catalog';
      setAdminTab('catalog');
    }
  }
  try {
    await loadUserPreferences();
  } catch (error) {
    console.error(error);
    const savedTheme = localStorage.getItem('dark-mode') === '1' ? 'dark' : 'light';
    applyTheme(savedTheme);
  } finally {
    releaseThemeSyncPending();
  }
  loadChartTypes();
  syncAdminColorToggle();
  await Promise.allSettled([
    loadAdminMenu(null),
    isModerator ? Promise.resolve() : loadUsers(),
    isModerator ? Promise.resolve() : loadGroupTargets(),
    loadPresetOptionRequests(),
    loadPresetOptionsManager(),
    isModerator ? Promise.resolve() : loadUiColors(),
    isModerator ? Promise.resolve() : loadAdminChartsPreviewData()
  ]);
})();

function insertAtCursor(textarea, text) {
  if (textarea === adminIncidentPresetInput && adminIncidentPresetEditor) {
    adminPresetInsertText(text);
    return;
  }
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = `${before}${text}${after}`;
  const pos = start + text.length;
  textarea.setSelectionRange(pos, pos);
  textarea.focus();
}

initAdminPresetEditor();

addPresetTextFieldBtn?.addEventListener('click', async () => {
  const label = await showPrompt('Assegna un nome al campo di testo libero da inserire nel ticket precompilato.', { title: 'Campo di testo', placeholder: 'Es. Entity', confirmText: 'Inserisci' });
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[text:${label.trim()}]]`);
});

// Box testo multiplo: come "+ Box testo" ma nel ticket compare col pulsante "+"
// per accodare altri box (i valori si uniscono con ", ").
addPresetTextMultiFieldBtn?.addEventListener('click', async () => {
  const label = await showPrompt('Assegna un nome al campo di testo multiplo. Nel ticket l\'operatore potrà accodare più box e i valori saranno uniti con ", ".', { title: 'Campo di testo multiplo', placeholder: 'Es. Entity', confirmText: 'Inserisci' });
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[texts:${label.trim()}]]`);
});

// Mostra un dialog che permette di riutilizzare un menu a tendina gia esistente
// oppure di crearne uno nuovo. Ritorna una Promise che risolve con l'etichetta scelta (o null).
function pickPresetDropdownField() {
  const existing = (Array.isArray(presetOptionsCache) ? presetOptionsCache : [])
    .map((f) => ({ key: f.field_key, label: f.field_label || f.field_key, count: Array.isArray(f.options) ? f.options.length : 0 }))
    .filter((f) => f.label)
    .sort((a, b) => String(a.label).localeCompare(String(b.label), 'it', { sensitivity: 'base' }));

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'prodops-confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'prodops-confirm-dialog preset-field-picker';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const titleEl = document.createElement('div');
    titleEl.className = 'prodops-confirm-title';
    titleEl.textContent = 'Inserisci menu a tendina';
    dialog.appendChild(titleEl);

    let done = false;
    function close(result) {
      if (done) return;
      done = true;
      overlay.classList.add('prodops-confirm-out');
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
      resolve(result);
    }

    if (existing.length) {
      const hint = document.createElement('div');
      hint.className = 'prodops-confirm-msg';
      hint.textContent = 'Riutilizza un menu esistente (mantiene le opzioni gia salvate) oppure creane uno nuovo.';
      dialog.appendChild(hint);

      const chips = document.createElement('div');
      chips.className = 'preset-field-picker-chips';
      existing.forEach((f) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'preset-field-picker-chip';
        chip.textContent = f.count ? (f.label + ' (' + f.count + ')') : f.label;
        chip.title = 'Riutilizza il menu "' + f.label + '"';
        chip.addEventListener('click', function () { close(f.label); });
        chips.appendChild(chip);
      });
      dialog.appendChild(chips);

      const sep = document.createElement('div');
      sep.className = 'preset-field-picker-or';
      sep.textContent = 'oppure crea un nuovo menu';
      dialog.appendChild(sep);
    } else {
      const hint = document.createElement('div');
      hint.className = 'prodops-confirm-msg';
      hint.textContent = 'Assegna un nome al nuovo menu a tendina (es. Motivo).';
      dialog.appendChild(hint);
    }

    const inputRow = document.createElement('div');
    inputRow.className = 'preset-field-picker-input-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nome nuovo menu (es. Motivo)';
    input.className = 'preset-field-picker-input';
    inputRow.appendChild(input);
    dialog.appendChild(inputRow);

    const actions = document.createElement('div');
    actions.className = 'prodops-confirm-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'secondary prodops-confirm-btn';
    cancelBtn.textContent = 'Annulla';
    const createBtn = document.createElement('button');
    createBtn.type = 'button';
    createBtn.className = 'primary prodops-confirm-btn';
    createBtn.textContent = 'Inserisci nuovo';
    actions.appendChild(cancelBtn);
    actions.appendChild(createBtn);
    dialog.appendChild(actions);

    function submitNew() {
      const val = (input.value || '').trim();
      if (!val) { input.focus(); return; }
      const normalized = val.toLowerCase();
      const existingMatch = existing.find((f) => String(f.label || '').trim().toLowerCase() === normalized);
      if (existingMatch) {
        showToast('Questo elemento esiste gia: "' + existingMatch.label + '".', 'warning', 'Elemento duplicato');
        input.focus();
        input.select();
        return;
      }
      close(val);
    }
    cancelBtn.addEventListener('click', function () { close(null); });
    createBtn.addEventListener('click', submitNew);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitNew(); } });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(null); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(null); }
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add('prodops-confirm-in');
      input.focus();
    });
  });
}

addPresetSelectFieldBtn?.addEventListener('click', async () => {
  const label = await pickPresetDropdownField();
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[dbselect:${label.trim()}]]`);
});

addPresetMultiFieldBtn?.addEventListener('click', async () => {
  const label = await showPrompt('Assegna un nome alla scelta multipla da inserire nel ticket precompilato.', { title: 'Scelta multipla', placeholder: 'Es. Azioni svolte', confirmText: 'Avanti' });
  if (!label || !label.trim()) return;
  const rawWords = await showPrompt('Elenca le opzioni del menu a tendina, separate da virgola (almeno 2). L\'operatore potra sceglierne una sola.', { title: 'Scelta multipla', placeholder: 'Es. Reboot, Reset, Sostituzione', confirmText: 'Inserisci' });
  if (!rawWords || !rawWords.trim()) return;
  // Ripulisce da caratteri che romperebbero il token [[multi:label|opzioni]].
  const cleanLabel = label.trim().replace(/[\[\]|]/g, '').trim();
  const words = rawWords.split(',')
    .map((w) => w.replace(/[\[\]|]/g, '').trim())
    .filter(Boolean)
    .filter((w, i, arr) => arr.indexOf(w) === i);
  if (words.length < 2) { showToast('Servono almeno 2 opzioni distinte per una scelta multipla.', 'warning', 'Opzioni insufficienti'); return; }
  insertAtCursor(adminIncidentPresetInput, `[[multi:${cleanLabel}|${words.join(',')}]]`);
});

addPresetTimestampBtn?.addEventListener('click', async () => {
  const label = await showPrompt("Assegna un nome al campo orario da inserire nel ticket precompilato.", { title: 'Campo orario', placeholder: 'Es. Orario evento', confirmText: 'Inserisci' });
  if (!label || !label.trim()) return;
  insertAtCursor(adminIncidentPresetInput, `[[timestamp:${label.trim()}]]`);
});

Object.keys(layoutInputs).forEach((key) => {
  const input = layoutInputs[key];
  if (!input) return;
  input.addEventListener('input', renderAdminDashboardLayoutPreview);
  input.addEventListener('change', renderAdminDashboardLayoutPreview);
});

[adminPersonalAxisMaxMineInput, adminPersonalAxisMaxGroupInput].forEach((input) => {
  input?.addEventListener('input', renderAdminDashboardLayoutPreview);
  input?.addEventListener('change', renderAdminDashboardLayoutPreview);
});

saveColorSettingsBtn?.addEventListener('click', async () => {
  try {
    await saveUiColors();
  } catch (error) {
    showToast('Impossibile salvare le impostazioni colori: ' + (error.message || error), 'error', 'Errore salvataggio');
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
