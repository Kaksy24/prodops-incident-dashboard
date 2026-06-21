const menu = document.getElementById('menu');
const appBasePath = new URL(document.currentScript.src).pathname.split('/public/js/')[0];

function appUrl(path) {
  const normalizedPath = String(path || '').charAt(0) === '/' ? String(path || '') : '/' + String(path || '');
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.indexOf(appBasePath + '/') === 0) return normalizedPath;
  return appBasePath + normalizedPath;
}

const modal = document.getElementById('ticketModal');
const mainTicketPanel = document.querySelector('#ticketModal > .modal-panel');
const incidentTypeInput = document.getElementById('incidentType');
const ticketForm = document.getElementById('ticketForm');
const ticketSubmitBtn = document.getElementById('ticketSubmitBtn');
const addSameIncidentBtn = document.getElementById('addSameIncidentBtn');
const extraTicketModals = document.getElementById('extraTicketModals');
const fabButtonsWrap = document.getElementById('fabButtons');
const fabValue = document.getElementById('fabValue');
const ticketList = document.getElementById('ticketList');
const currentShiftToggle = document.getElementById('currentShiftToggle');
const currentShiftFilter = document.getElementById('currentShiftFilter');
const currentShiftFilterEmpty = document.getElementById('currentShiftFilterEmpty');
const currentShiftSort = document.getElementById('currentShiftSort');
const currentShiftSortDirBtn = document.getElementById('currentShiftSortDir');
const openAdminBtn = document.getElementById('openAdminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const deleteTicketBtn = document.getElementById('deleteTicketBtn');
const editFromReadBtn = document.getElementById('editFromReadBtn');
const tsPopup = document.getElementById('tsPopup');
const compactVisualToggle = document.getElementById('compactVisualToggle');
const previousShiftsToggle = document.getElementById('previousShiftsToggle');
const previousShiftsContent = document.getElementById('previousShiftsContent');
const currentShiftTotalCount = document.getElementById('currentShiftTotalCount');
const currentShiftMineCount = document.getElementById('currentShiftMineCount');
const currentShiftTeamCount = document.getElementById('currentShiftTeamCount');
const previousShiftTotalCount = document.getElementById('previousShiftTotalCount');
const ticketSearchForm = document.getElementById('ticketSearchForm');
const ticketSearchQueryInput = document.getElementById('ticketSearchQuery');
const ticketSearchFromInput = document.getElementById('ticketSearchFrom');
const ticketSearchToInput = document.getElementById('ticketSearchTo');
const ticketSearchResetBtn = document.getElementById('ticketSearchResetBtn');
const ticketSearchSummary = document.getElementById('ticketSearchSummary');
const ticketSearchResults = document.getElementById('ticketSearchResults');

const fabYearChart = document.getElementById('fabYearChart');
const catYearChart = document.getElementById('catYearChart');
const teamYearChart = document.getElementById('teamYearChart');
const severityYearChart = document.getElementById('severityYearChart');
const personalChart = document.getElementById('personalChart');
const personalChartUsername = document.getElementById('personalChartUsername');
const personalTargetInput = document.getElementById('personalTargetInput');
const personalTargetStorageKey = 'prodops_personal_target';
let personalChartView = 'mine';
const ticketTimestampInput = document.getElementById('ticketTimestamp');
const ticketModalTitle = document.getElementById('ticketModalTitle');
const ticketSeveritySelect = document.getElementById('ticketSeverity');
const ticketSeverityHint = document.getElementById('ticketSeverityHint');
const ticketSeverityGroup = document.getElementById('ticketSeverityGroup');
const presetInlineComposer = document.getElementById('presetInlineComposer');

const fabs = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];
const themeToggleBtn = document.getElementById('themeToggleBtn');
let fabYearMode = 'day';
let catYearMode = 'day';
let teamYearMode = 'day';
let severityYearMode = 'day';
const currentYear = new Date().getFullYear();
const incidentCategoryMap = {};
const incidentNameToIdMap = {};
const incidentIdToNameMap = {};
const incidentIdToCategoryMap = {};
const incidentIdToPresetMap = {};
const incidentIdToSeverityMap = {};
const incidentIdToFabDefaultMap = {};
const incidentPresetMap = {};
const incidentSeverityMap = {};
const incidentFabDefaultMap = {};
const chartExportState = {};
let uiColors = null;
let editingTicketId = null;
let presetTokenState = [];
let extraTicketCounter = 0;
let modalCloseTimer = null;
let currentUser = null;
let previousShiftsLoaded = false;
let previousShiftsLoading = false;
let previousShiftsData = null;
let syncLastTs = 0;
let syncPollTimer = null;
let currentShiftAutoRefreshBusy = false;
let currentShiftOwnerFilter = 'all';
let currentShiftSortKey = 'time';
let currentShiftSortDir = 'desc';
let ticketSubmitBusy = false;
const uiColorsSyncKey = 'prodops_ui_colors_updated_at';
const chartPalette = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#17becf',
  '#bcbd22',
  '#8c564b',
  '#e377c2',
  '#7f7f7f'
];

function colorByIndex(index) {
  return chartPalette[index % chartPalette.length];
}

function colorForLabel(label) {
  let hash = 0;
  const text = String(label || '');
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i);
  return colorByIndex(Math.abs(hash));
}

function setTextContent(node, value) {
  if (node) node.textContent = String(value);
}

function updateCurrentShiftCounters(tickets) {
  const rows = Array.isArray(tickets) ? tickets : [];
  const userId = Number(currentUser && currentUser.id ? currentUser.id : 0);
  const userTeam = String(currentUser && currentUser.team ? currentUser.team : '').toUpperCase();
  let mine = 0;
  let team = 0;
  rows.forEach((ticket) => {
    const ownerId = Number(ticket && ticket.owner_user_id ? ticket.owner_user_id : 0);
    const ownerTeam = String(ticket && ticket.owner_team ? ticket.owner_team : '').toUpperCase();
    if (userId > 0 && ownerId === userId) mine += 1;
    if (userTeam && ownerTeam === userTeam && ownerId !== userId) team += 1;
  });
  setTextContent(currentShiftTotalCount, rows.length);
  setTextContent(currentShiftMineCount, mine);
  setTextContent(currentShiftTeamCount, team);
}

function updatePreviousShiftCounter(shifts) {
  const rows = Array.isArray(shifts) ? shifts : [];
  let total = 0;
  rows.forEach((shift) => {
    total += Array.isArray(shift && shift.tickets) ? shift.tickets.length : 0;
  });
  setTextContent(previousShiftTotalCount, total);
}

async function fetchPreviousShiftsData(forceRefresh) {
  if (!forceRefresh && previousShiftsData) return previousShiftsData;
  const data = await fetchJson('/api/tickets/previous-shifts');
  previousShiftsData = data;
  updatePreviousShiftCounter(data.shifts || []);
  return data;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightPresetValues(text) {
  return escapeHtml(text).replace(/ã€ˆ([^ã€‰]*)ã€‰/g, '<mark class="preset-value">$1</mark>');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const chartTypeStorageKey = 'prodops_chart_types';
const chartTypeChoices = [
  { value: 'column', label: 'Colonne' },
  { value: 'bar', label: 'Barre orizzontali' },
  { value: 'donut', label: 'Ciambella' }
];
let chartTypes = defaultChartTypes();


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
      chartTypes = defaults;
      localStorage.setItem(chartTypeStorageKey, JSON.stringify(chartTypes));
      return chartTypes;
    }
    const parsed = JSON.parse(raw);
    chartTypes = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      chartTypes[key] = normalizeChartType(parsed?.[key] || defaults[key]);
    });
  } catch (error) {
    chartTypes = defaults;
  }
  return chartTypes;
}

function saveChartTypes() {
  try {
    localStorage.setItem(chartTypeStorageKey, JSON.stringify(chartTypes));
  } catch (error) {
    // ignore storage issues
  }
}

function getChartType(chartId) {
  const key = normalizeChartKey(chartId);
  return normalizeChartType(chartTypes?.[key] || defaultChartTypes()[key] || 'column');
}

function formatTicketTimestamp(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `[${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}]`;
}

function formatTicketDate(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatTicketTime(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTicketSeverity(severity) {
  const level = Number(severity || 0);
  if (!level || level < 1) return '';
  return `S${level}`;
}

function hexToRgba(hex, alpha) {
  const color = normalizeHexColor(hex);
  if (!color) return '';
  const value = color.slice(1);
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function isLongTicketBody(text) {
  const value = String(text || '');
  return value.length > 120 || value.indexOf('\n') !== -1;
}

function setTicketModalReadMode(isReadMode) {
  const readMode = Boolean(isReadMode);
  if (ticketSubmitBtn) {
    ticketSubmitBtn.hidden = readMode;
    ticketSubmitBtn.disabled = readMode ? true : ticketSubmitBusy;
  }
  if (deleteTicketBtn) deleteTicketBtn.style.display = readMode ? 'none' : (editingTicketId ? 'inline-block' : 'none');
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = readMode ? 'none' : 'grid';
  if (ticketForm) ticketForm.dataset.readMode = readMode ? '1' : '0';
  if (editFromReadBtn) editFromReadBtn.style.display = 'none';
}

function openTicketReadModal(ticket) {
  const item = ticket || {};
  editingTicketId = null;
  clearExtraTicketCards();
  incidentTypeInput.value = String(item.incidentId || '');
  if (ticketModalTitle) ticketModalTitle.textContent = item.incidentName || 'Dettaglio Ticket';
  document.getElementById('description').value = String(item.description || '').replace(/ã€ˆ([^ã€‰]*)ã€‰/g, '$1');
  document.getElementById('description').readOnly = true;
  document.getElementById('description').style.display = '';
  document.getElementById('description').placeholder = '';
  if (presetInlineComposer) {
    presetInlineComposer.style.display = 'none';
    presetInlineComposer.innerHTML = '';
  }
  const readSeverityCfg = incidentIdToSeverityMap[String(item.incidentId || '')] || { severity_default: 1, severity_mode: 'default' };
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = readSeverityCfg.severity_mode === 'user' ? '' : 'none';
  ticketSeveritySelect.disabled = true;
  ticketSeveritySelect.value = String(Number(item.severity || readSeverityCfg.severity_default || 1));
  if (ticketSeverityHint) {
    ticketSeverityHint.textContent = item.category ? `Categoria: ${item.category}` : '';
  }
  ticketTimestampInput.value = toDatetimeLocalValue(item.createdAt || new Date());
  ticketTimestampInput.disabled = true;
  fabValue.value = String(item.fab || '').toUpperCase();
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.classList.toggle('active', b.textContent === fabValue.value);
    b.disabled = true;
  });
  setTicketModalReadMode(true);
  if (editFromReadBtn && item.canEdit) {
    editFromReadBtn.style.display = '';
    editFromReadBtn.dataset.ticketId = String(item.ticketId || '');
    editFromReadBtn.dataset.incidentId = String(item.incidentId || '');
    editFromReadBtn.dataset.incident = String(item.incidentName || '');
    editFromReadBtn.dataset.description = String(item.description || '');
    editFromReadBtn.dataset.fab = String(item.fab || '');
    editFromReadBtn.dataset.createdAt = String(item.createdAt || '');
    editFromReadBtn.dataset.severity = String(item.severity || '');
  }
  revealModal();
  applyMultiModalLayout();
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
    out.charts[key] = {
      light: defaults.charts[key].light,
      dark: defaults.charts[key].dark
    };
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

function themeKey() {
  return document.body.classList.contains('theme-dark') ? 'dark' : 'light';
}

function themeFallbackOrder() {
  const theme = themeKey();
  return theme === 'dark' ? ['dark', 'light'] : ['light', 'dark'];
}

function normalizeChartKey(chartId) {
  const id = String(chartId || '');
  return id.endsWith('Chart') ? id.slice(0, -5) : id;
}

function getChartColor(chartId) {
  const chartKey = normalizeChartKey(chartId);
  const [theme, fallbackTheme] = themeFallbackOrder();
  const fallback = defaultUiColors().charts[chartKey];
  const custom = uiColors?.charts?.[chartKey]?.[theme] || uiColors?.charts?.[chartKey]?.[fallbackTheme];
  return normalizeHexColor(custom) || fallback?.[theme] || fallback?.[fallbackTheme] || '#0c5f8c';
}

function chartGroupForId(chartId) {
  switch (normalizeChartKey(chartId)) {
    case 'fabDay':
    case 'fabYear':
      return 'fabs';
    case 'catDay':
    case 'catYear':
      return 'categories';
    case 'teamYear':
      return 'teams';
    case 'severityYear':
      return 'severities';
    default:
      return '';
  }
}

function getLabelColor(group, label) {
  const [theme, fallbackTheme] = themeFallbackOrder();
  const normalizedLabel = String(label || '');
  const custom = uiColors?.labels?.[group]?.[theme]?.[normalizedLabel] || uiColors?.labels?.[group]?.[fallbackTheme]?.[normalizedLabel];
  return normalizeHexColor(custom) || colorForLabel(normalizedLabel);
}

function getBarColor(chartId, label) {
  const chartKey = normalizeChartKey(chartId);
  const [theme, fallbackTheme] = themeFallbackOrder();
  const normalizedLabel = String(label || '');
  const custom = uiColors?.bars?.[chartKey]?.[theme]?.[normalizedLabel] || uiColors?.bars?.[chartKey]?.[fallbackTheme]?.[normalizedLabel];
  if (normalizeHexColor(custom)) return normalizeHexColor(custom);
  const group = chartGroupForId(chartKey);
  if (group) {
    const groupColor = uiColors?.labels?.[group]?.[theme]?.[normalizedLabel] || uiColors?.labels?.[group]?.[fallbackTheme]?.[normalizedLabel];
    if (normalizeHexColor(groupColor)) return normalizeHexColor(groupColor);
  }
  return colorForLabel(normalizedLabel);
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  uiColors = normalizeUiColors(data.ui_colors || data || {});
  return uiColors;
}

async function syncUiColorsAfterAdminChange() {
  await loadUiColors();
  await loadDayTickets();
  await loadCharts();
  if (previousShiftsContent && !previousShiftsContent.hidden) {
    previousShiftsLoaded = false;
    await loadPreviousShifts();
  }
}

function announceUiColorsChange() {
  try {
    localStorage.setItem(uiColorsSyncKey, String(Date.now()));
  } catch (error) {
    // ignore storage issues
  }
}

function lockModalScroll() {
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
}

function unlockModalScroll() {
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
}

async function refreshColorSensitiveViews() {
  await loadDayTickets();
  await loadCharts();
  if (previousShiftsContent && !previousShiftsContent.hidden) {
    previousShiftsLoaded = false;
    await loadPreviousShifts();
  }
}


function sanitizeFileNamePart(value) {
  return String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '');
}

function closeChartExportMenus(exceptMenu = null) {
  document.querySelectorAll('.chart-export-menu.open').forEach((menu) => {
    if (menu !== exceptMenu) menu.classList.remove('open');
  });
  document.querySelectorAll('.chart-export-btn[aria-expanded="true"]').forEach((btn) => {
    const wrapper = btn.closest('.chart-export');
    const menu = wrapper ? wrapper.querySelector('.chart-export-menu') : null;
    if (menu !== exceptMenu) btn.setAttribute('aria-expanded', 'false');
  });
}

function triggerDownload(filename, content, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function getChartExportPayload(targetId) {
  const payload = chartExportState[targetId];
  if (!payload) return null;
  const stats = Array.isArray(payload.stats) ? payload.stats : [];
  return {
    title: payload.title || targetId,
    stats
  };
}

function buildChartCsv(stats) {
  const rows = ['label,total'];
  stats.forEach((item) => {
    rows.push(String(item.label || '').replace(/\r?\n/g, ' ') + ',' + Number(item.total || 0));
  });
  return rows.join('\r\n');
}

function buildChartXls(title, stats) {
  const safeTitle = String(title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = stats.map((item) => '<tr><td>' + String(item.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</td><td>' + Number(item.total || 0) + '</td></tr>').join('');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><tr><th colspan="2">' + safeTitle + '</th></tr><tr><th>label</th><th>total</th></tr>' + rows + '</table></body></html>';
}

async function buildChartPngBlob(title, stats) {
  const width = 1280;
  const rowHeight = 60;
  const height = Math.max(360, 160 + stats.length * rowHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isDark = document.body.classList.contains('theme-dark');
  const bg = isDark ? '#101a2a' : '#ffffff';
  const panel = isDark ? '#16253a' : '#f7fbff';
  const textColor = isDark ? '#e6eef9' : '#17202f';
  const muted = isDark ? '#9db1c9' : '#5c6b7d';
  const grid = isDark ? 'rgba(157,177,201,.22)' : 'rgba(55,80,111,.16)';
  const max = Math.max.apply(Math, stats.map((item) => Number(item.total || 0)).concat([1]));

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = panel;
  ctx.fillRect(24, 24, width - 48, height - 48);

  ctx.fillStyle = textColor;
  ctx.font = '700 30px Segoe UI, sans-serif';
  ctx.fillText(title || 'Grafico', 48, 64);
  ctx.fillStyle = muted;
  ctx.font = '600 18px Segoe UI, sans-serif';
  ctx.fillText('Export dashboard', 48, 92);

  const left = 190;
  const right = width - 60;
  const top = 130;
  const barHeight = 24;
  const barGap = 22;
  const barArea = right - left - 120;

  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = top + i * ((stats.length * (barHeight + barGap)) / 4);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  stats.forEach((item, index) => {
    const y = top + index * (barHeight + barGap);
    const label = String(item.label || '');
    const value = Number(item.total || 0);
    const barWidth = Math.max(4, Math.round((value / max) * barArea));
    const color = colorByIndex(index);

    ctx.fillStyle = textColor;
    ctx.font = '600 22px Segoe UI, sans-serif';
    ctx.fillText(label, 48, y + 18);

    ctx.fillStyle = isDark ? '#22344d' : '#dbe7f5';
    ctx.fillRect(left, y, barArea, barHeight);

    const grad = ctx.createLinearGradient(left, y, left + barWidth, y);
    grad.addColorStop(0, color);
    grad.addColorStop(1, isDark ? '#2ec4d6' : '#0c5f8c');
    ctx.fillStyle = grad;
    ctx.fillRect(left, y, barWidth, barHeight);

    ctx.fillStyle = textColor;
    ctx.font = '700 20px Segoe UI, sans-serif';
    ctx.fillText(String(value), left + barArea + 14, y + 18);
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

async function exportChart(targetId, format) {
  const payload = getChartExportPayload(targetId);
  if (!payload || !payload.stats.length) {
    alert('Nessun dato disponibile per l\'export.');
    return;
  }
  const fileRoot = sanitizeFileNamePart(payload.title || targetId) || targetId;
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'csv') {
    triggerDownload(fileRoot + '_' + stamp + '.csv', buildChartCsv(payload.stats), 'text/csv;charset=utf-8');
    return;
  }
  if (format === 'xls') {
    triggerDownload(fileRoot + '_' + stamp + '.xls', buildChartXls(payload.title, payload.stats), 'application/vnd.ms-excel;charset=utf-8');
    return;
  }
  if (format === 'png') {
    const blob = await buildChartPngBlob(payload.title, payload.stats);
    if (!blob) {
      alert('Impossibile generare il PNG.');
      return;
    }
    triggerDownload(fileRoot + '_' + stamp + '.png', blob, 'image/png');
  }
}

function setupChartExportControls() {
  document.querySelectorAll('.chart-export').forEach((wrap) => {
    const targetId = wrap.dataset.chartTarget || '';
    const btn = wrap.querySelector('.chart-export-btn');
    const menu = wrap.querySelector('.chart-export-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !menu.classList.contains('open');
      closeChartExportMenus();
      menu.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    menu.querySelectorAll('.chart-export-option').forEach((option) => {
      option.addEventListener('click', async (event) => {
        event.stopPropagation();
        closeChartExportMenus();
        btn.setAttribute('aria-expanded', 'false');
        await exportChart(targetId, option.dataset.format || 'csv');
      });
    });
  });
  document.addEventListener('click', () => closeChartExportMenus());
}

function deferWork(task) {
  const runner = () => Promise.resolve().then(task).catch((error) => console.error(error));
  if (window.requestIdleCallback) {
    window.requestIdleCallback(runner, { timeout: 1200 });
    return;
  }
  window.setTimeout(runner, 0);
}

function toDatetimeLocalValue(dateLike) {
  const date = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function closeModal() {
  if (!modal.classList.contains('show') && !modal.classList.contains('active')) return;
  if (modalCloseTimer) clearTimeout(modalCloseTimer);
  modal.classList.remove('active');
  modal.classList.add('closing');
  modal.setAttribute('aria-hidden', 'true');
  unlockModalScroll();
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = 'none';
  modalCloseTimer = setTimeout(() => {
    modal.classList.remove('show', 'closing');
    clearExtraTicketCards();
    modalCloseTimer = null;
  }, 260);
}

function setThemeToggleIcon(button, theme) {
  if (!button) return;
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  const thumb = button.querySelector('.switch-thumb');
  if (thumb) thumb.textContent = theme === 'dark' ? 'â˜¾' : 'â˜€';
  if (thumb) thumb.textContent = theme === 'dark' ? 'D' : 'L';
}

function setTicketSubmitState(isBusy) {
  ticketSubmitBusy = Boolean(isBusy);
  if (ticketSubmitBtn) {
    ticketSubmitBtn.disabled = ticketSubmitBusy;
    ticketSubmitBtn.textContent = editingTicketId
      ? (ticketSubmitBusy ? 'Salvataggio...' : 'Conferma Modifica')
      : (ticketSubmitBusy ? 'Creazione...' : 'Crea Ticket');
  }
}

function beginTicketSubmitLock() {
  if (ticketSubmitBusy) return false;
  setTicketSubmitState(true);
  return true;
}

function revealModal() {
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }
  modal.classList.remove('closing');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  lockModalScroll();
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
}
let overlayPressStarted = false;

function positionAddSameIncidentBtn() {
  if (!modal || !addSameIncidentBtn || !mainTicketPanel) return;
  if (!modal.classList.contains('show')) return;
  if (window.matchMedia('(max-width: 640px)').matches) {
    addSameIncidentBtn.style.display = 'none';
    return;
  }
  const extraPanels = [...(extraTicketModals?.querySelectorAll('.extra-ticket-modal') || [])];
  const anchor = extraPanels.length ? extraPanels[extraPanels.length - 1] : mainTicketPanel;
  const rect = anchor.getBoundingClientRect();
  const btnWidth = addSameIncidentBtn.offsetWidth || 44;
  const btnHeight = addSameIncidentBtn.offsetHeight || 44;
  const left = Math.min(window.innerWidth - btnWidth - 8, rect.right + 10);
  const top = Math.max(8, rect.top + (rect.height / 2) - (btnHeight / 2));
  addSameIncidentBtn.style.left = `${left}px`;
  addSameIncidentBtn.style.top = `${top}px`;
}

function applyMultiModalLayout() {
  if (!modal || !mainTicketPanel || !extraTicketModals) return;
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const count = extraTicketModals.querySelectorAll('.extra-ticket-modal').length;
  const totalPanels = 1 + count;
  const cols = Math.min(Math.max(totalPanels, 1), 3);
  modal.classList.toggle('compact-modals', totalPanels >= 4);
  modal.classList.toggle('dense-modals', totalPanels >= 7);

  if (isMobile) {
    modal.style.gridTemplateColumns = '1fr';
    modal.style.alignItems = 'center';
    modal.style.justifyItems = 'center';
    mainTicketPanel.style.width = 'calc(100vw - 12px)';
    extraTicketModals.querySelectorAll('.extra-ticket-modal').forEach((panel) => {
      panel.style.width = 'calc(100vw - 12px)';
    });
    positionAddSameIncidentBtn();
    return;
  }

  if (count === 0) {
    mainTicketPanel.style.width = 'min(620px, 100%)';
    modal.style.gridTemplateColumns = `minmax(620px, 620px)`;
    modal.style.alignItems = 'center';
    positionAddSameIncidentBtn();
    return;
  }

  const panelWidth = totalPanels >= 7 ? 340 : totalPanels >= 4 ? 380 : totalPanels === 3 ? 420 : 500;
  modal.style.gridTemplateColumns = `repeat(${cols}, minmax(${panelWidth}px, ${panelWidth}px))`;
  mainTicketPanel.style.width = `min(${panelWidth}px, 96vw)`;
  extraTicketModals.querySelectorAll('.extra-ticket-modal').forEach((panel) => {
    panel.style.width = `min(${panelWidth}px, 96vw)`;
  });
  modal.style.alignItems = 'flex-start';
  positionAddSameIncidentBtn();
}

function clearExtraTicketCards() {
  if (extraTicketModals) extraTicketModals.innerHTML = '';
  extraTicketCounter = 0;
  applyMultiModalLayout();
  setTicketSubmitState(false);
}

function presetFieldKey(label) {
  return String(label || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
}

async function loadDbPresetOptions(token, select) {
  try {
    const fieldKey = presetFieldKey(token.label);
    const data = await fetchJson(`/api/preset-options?field_key=${encodeURIComponent(fieldKey)}`);
    const optionMap = {};
    [...(token.options || []), ...(data.options || [])].forEach((option) => {
      const value = String(option || '').trim();
      if (value === '') return;
      const key = value.toLocaleLowerCase('it');
      if (!optionMap[key]) optionMap[key] = value;
    });
    const options = Object.keys(optionMap).map((key) => optionMap[key])
      .sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    const currentValue = select.value;
    const renderOptions = (filter = '') => {
      const query = String(filter || '').trim().toLocaleLowerCase('it');
      const filtered = query ? options.filter((option) => option.toLocaleLowerCase('it').includes(query)) : options;
      select.innerHTML = '';
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = filtered.length ? `Seleziona ${token.label || ''}`.trim() : 'Nessun elemento trovato';
      select.appendChild(empty);
      filtered.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      const propose = document.createElement('option');
      propose.value = '__propose_new__';
      propose.textContent = '+ Proponi nuovo elemento';
      select.appendChild(propose);
      if (filtered.includes(currentValue)) select.value = currentValue;
    };

    renderOptions();
    const existingSearch = select.parentElement?.querySelector('.preset-select-search');
    if (existingSearch) existingSearch.remove();
    if (options.length > 5 && select.parentElement) {
      const search = document.createElement('input');
      search.type = 'search';
      search.className = 'preset-select-search';
      search.placeholder = `Cerca ${token.label || 'elemento'}...`;
      search.setAttribute('aria-label', `Cerca ${token.label || 'elemento'}`);
      search.addEventListener('input', () => renderOptions(search.value));
      select.parentElement.insertBefore(search, select);
    }
  } catch (error) {
    console.error(error);
  }
}

function renderPresetForTargets(template, descriptionInput, composerContainer, incidentId = 0) {
  const tokens = parsePresetTokens(template);
  if (!tokens.length) {
    composerContainer.style.display = 'none';
    composerContainer.innerHTML = '';
    descriptionInput.readOnly = false;
    descriptionInput.dataset.presetAutoSync = 'off';
    descriptionInput.dataset.presetAutoValue = '';
    descriptionInput.dataset.presetMarkupValue = '';
    descriptionInput.placeholder = 'Inserisci descrizione problema...';
    descriptionInput.value = template || '';
    return;
  }

  const tokenState = tokens.map((token) => ({ ...token, value: '' }));
  composerContainer.style.display = 'flex';
  composerContainer.innerHTML = '';
  descriptionInput.readOnly = false;
  descriptionInput.dataset.presetAutoSync = 'on';
  descriptionInput.dataset.presetAutoValue = '';
  descriptionInput.placeholder = 'Puoi scrivere liberamente oppure usare i campi sottostanti.';

  tokenState.forEach((token, tokenIndex) => {
    const fieldWrap = document.createElement('div');
    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = token.label || `Campo ${tokenIndex + 1}`;
    fieldWrap.appendChild(fieldLabel);

    let input;
    if (token.type === 'select' || token.type === 'dbselect') {
      input = document.createElement('select');
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Caricamento opzioni...';
      input.appendChild(empty);
      (token.options || []).forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
      loadDbPresetOptions(token, input);
    } else if (token.type === 'timestamp') {
      input = document.createElement('input');
      input.type = 'time';
      input.placeholder = 'hh:mm';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = token.label || '';
    }
    input.style.width = '100%';
    input.addEventListener('input', async () => {
      if ((token.type === 'select' || token.type === 'dbselect') && input.value === '__propose_new__') {
        const proposedValue = prompt(`Nuovo elemento per "${token.label}":`);
        if (!proposedValue || !proposedValue.trim()) {
          input.value = '';
          return;
        }
        const value = proposedValue.trim();
        try {
          const result = await fetchJson('/api/preset-option-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              field_key: presetFieldKey(token.label),
              field_label: token.label,
              value,
              incident_id: Number(incidentId || 0)
            })
          });
          if (!result || !result.ok) throw new Error(result?.error || 'Richiesta non accettata');
          const pendingOption = document.createElement('option');
          pendingOption.value = value;
          pendingOption.textContent = `${value} (in revisione)`;
          input.insertBefore(pendingOption, input.querySelector('option[value="__propose_new__"]'));
          input.value = value;
          alert('Nuovo elemento inviato alla revisione admin.');
        } catch (error) {
          input.value = '';
          alert(`Errore invio proposta: ${error.message || error}`);
          return;
        }
      }
      tokenState[tokenIndex].value = input.value || '';
      const generated = buildDescriptionFromTemplate(template, tokenState, true);
      descriptionInput.dataset.presetAutoValue = generated;
      descriptionInput.dataset.presetMarkupValue = buildMarkupDescription(template, tokenState);
      if (descriptionInput.dataset.presetAutoSync !== 'off') {
        descriptionInput.value = generated;
      }
    });
    fieldWrap.appendChild(input);
    composerContainer.appendChild(fieldWrap);
  });

  descriptionInput.addEventListener('input', () => {
    const current = descriptionInput.value || '';
    const generated = descriptionInput.dataset.presetAutoValue || '';
    if (current !== generated) descriptionInput.dataset.presetAutoSync = 'off';
  }, { once: true });

  const initialGenerated = buildDescriptionFromTemplate(template, tokenState, true);
  descriptionInput.dataset.presetAutoValue = initialGenerated;
  descriptionInput.dataset.presetMarkupValue = buildMarkupDescription(template, tokenState);
  descriptionInput.value = initialGenerated;
}

function createExtraTicketCard(incidentId) {
  if (!extraTicketModals) return;
  extraTicketCounter += 1;
  const incidentName = incidentIdToNameMap[String(incidentId)] || '';
  const panel = document.createElement('section');
  panel.className = 'modal-panel extra-ticket-modal';
  panel.dataset.extraTicket = String(extraTicketCounter);
  panel.innerHTML = `
    <div class="modal-header">
      <h3>${incidentName}</h3>
      <button type="button" class="close-extra-modal-btn">x</button>
    </div>
    <div class="ticket-form">
      <label>Descrizione problema</label>
      <textarea class="extra-description" rows="7"></textarea>
      <div class="panel preset-inline-composer extra-composer" style="display:none; margin:8px 0 10px; padding:10px 12px;"></div>

      <div class="fab-severity-row">
        <div class="fab-section">
          <p class="muted">Seleziona FAB:</p>
          <div class="fab-buttons extra-fab-buttons"></div>
        </div>
        <div class="extra-severity-group severity-inline-group">
          <label>Severity</label>
          <select class="extra-severity">
            <option value="1">1 - Low</option>
            <option value="2">2 - Medium</option>
            <option value="3">3 - High</option>
            <option value="4">4 - Extreme</option>
          </select>
          <p class="muted extra-severity-hint"></p>
        </div>
      </div>
      <input type="hidden" class="extra-fab" />

      <div class="datetime-actions-row">
        <div class="datetime-block">
          <label class="ticket-timestamp-label">Datetime</label>
          <input type="datetime-local" class="ticket-timestamp-input extra-datetime" value="${toDatetimeLocalValue(new Date())}" />
        </div>
        <div class="form-actions inline-actions">
          <button type="button" class="secondary extra-cancel-btn">Annulla</button>
        </div>
      </div>
    </div>
  `;

  const severityCfg = incidentIdToSeverityMap[String(incidentId)] || { severity_default: 1, severity_mode: 'default' };
  const severitySelect = panel.querySelector('.extra-severity');
  const severityGroup = panel.querySelector('.extra-severity-group');
  const severityHint = panel.querySelector('.extra-severity-hint');
  severitySelect.value = String(severityCfg.severity_default || 1);
    if (severityHint) {
      severityHint.textContent = severityCfg.severity_mode === 'user'
        ? ''
        : 'Severity impostata di default dall\'admin.';
    }
  if (severityCfg.severity_mode !== 'user') {
    panel.dataset.fixedSeverity = String(severityCfg.severity_default || 1);
    if (severityGroup) severityGroup.style.display = 'none';
  }

  const defaultFab = incidentIdToFabDefaultMap[String(incidentId)] || '';
  const extraFabHidden = panel.querySelector('.extra-fab');
  const fabButtonsRoot = panel.querySelector('.extra-fab-buttons');
  if (fabButtonsRoot && extraFabHidden) {
    fabButtonsRoot.innerHTML = '';
    fabs.forEach((fab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fab-btn';
      btn.textContent = fab;
      btn.addEventListener('click', () => {
        fabButtonsRoot.querySelectorAll('.fab-btn').forEach((x) => x.classList.remove('active'));
        btn.classList.add('active');
        extraFabHidden.value = fab;
      });
      fabButtonsRoot.appendChild(btn);
      if (fab === defaultFab) {
        btn.classList.add('active');
        extraFabHidden.value = fab;
      }
    });
  }

  const presetTemplate = (incidentIdToPresetMap[String(incidentId)] || [])[0] || '';
  const desc = panel.querySelector('.extra-description');
  const composer = panel.querySelector('.extra-composer');
  if (desc && composer) {
    renderPresetForTargets(presetTemplate, desc, composer, Number(incidentId || 0));
  }

  panel.querySelector('.close-extra-modal-btn')?.addEventListener('click', () => {
    panel.remove();
    applyMultiModalLayout();
    positionAddSameIncidentBtn();
  });
  panel.querySelector('.extra-cancel-btn')?.addEventListener('click', () => {
    panel.remove();
    applyMultiModalLayout();
    positionAddSameIncidentBtn();
  });
  extraTicketModals.appendChild(panel);
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

function collectExtraTicketPayloads(incidentId, defaultSeverity) {
  const payloads = [];
  const panels = [...document.querySelectorAll('.extra-ticket-modal')];
  for (let index = 0; index < panels.length; index += 1) {
    const panel = panels[index];
    const extraDescEl = panel.querySelector('.extra-description');
    const extraDesc = extraDescEl
      ? ((extraDescEl.dataset.presetAutoSync !== 'off' && extraDescEl.dataset.presetMarkupValue)
        ? extraDescEl.dataset.presetMarkupValue
        : (extraDescEl.value || '').trim())
      : '';
    const extraFab = panel.querySelector('.extra-fab')?.value || '';
    const extraDt = panel.querySelector('.extra-datetime')?.value || '';
    const userSeverity = panel.querySelector('.extra-severity')?.value;
    const extraSeverity = Number(userSeverity || panel.dataset.fixedSeverity || defaultSeverity || 1);
    if (!extraDesc || !extraFab || !extraDt) {
      const missing = [];
      if (!extraDesc) missing.push('descrizione');
      if (!extraFab) missing.push('FAB');
      if (!extraDt) missing.push('data/ora');
      throw new Error(`Ticket extra ${index + 1} incompleto: manca ${missing.join(', ')}`);
    }
    payloads.push({
      incident_id: incidentId,
      description: extraDesc,
      fab: extraFab,
      ticket_time: new Date(extraDt).toISOString(),
      severity: extraSeverity
    });
  }
  return payloads;
}

function openModal(incidentId) {
  const incidentIdNum = Number(incidentId || 0);
  const incidentName = incidentIdToNameMap[String(incidentIdNum)] || '';
  incidentTypeInput.value = String(incidentIdNum || '');
  if (ticketModalTitle) ticketModalTitle.textContent = incidentName || 'Nuovo Ticket';
  const defaultFab = incidentIdToFabDefaultMap[String(incidentIdNum)] || '';
  fabValue.value = defaultFab;
  const presets = incidentIdToPresetMap[String(incidentIdNum)] || [];
  applyPresetTemplate(presets[0] || '');
  const severityCfg = incidentIdToSeverityMap[String(incidentIdNum)] || { severity_default: 1, severity_mode: 'default' };
  ticketSeveritySelect.value = String(severityCfg.severity_default || 1);
  const userChoice = severityCfg.severity_mode === 'user';
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = userChoice ? '' : 'none';
  ticketSeveritySelect.disabled = !userChoice;
  ticketTimestampInput.disabled = false;
    if (ticketSeverityHint) {
      ticketSeverityHint.textContent = userChoice
        ? ''
        : 'Severity impostata di default dall\'admin.';
    }
  ticketTimestampInput.value = toDatetimeLocalValue(new Date());
  editingTicketId = null;
  clearExtraTicketCards();
  if (ticketSubmitBtn) ticketSubmitBtn.textContent = 'Crea Ticket';
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => { b.disabled = false; });
  setTicketModalReadMode(false);
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.classList.toggle('active', b.textContent === defaultFab);
  });
  revealModal();
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

function parsePresetTokens(template) {
  const regex = /\[\[(text|select|dbselect|timestamp):([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    const type = match[1];
    const label = (match[2] || '').trim();
    const options = type === 'select' || type === 'dbselect' ? (match[3] || '').split(',').map((x) => x.trim()).filter(Boolean) : [];
    tokens.push({ key: `t${tokens.length}`, raw: match[0], type, label, options, value: '' });
  }
  return tokens;
}

function buildDescriptionFromTemplate(template, tokens, showPlaceholders = false) {
  let text = template;
  tokens.forEach((token) => {
    const fallback = showPlaceholders ? `[${token.label || 'campo'}]` : '';
    text = text.replace(token.raw, token.value || fallback);
  });
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function buildMarkupDescription(template, tokens) {
  let text = template;
  tokens.forEach((token) => {
    const display = token.value ? `ã€ˆ${token.value}ã€‰` : `[${token.label || 'campo'}]`;
    text = text.replace(token.raw, display);
  });
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function renderPresetDynamicFields(template) {
  if (!presetInlineComposer) return;
  const descriptionInput = document.getElementById('description');
  descriptionInput.style.display = '';
  renderPresetForTargets(template, descriptionInput, presetInlineComposer, Number(incidentTypeInput.value || 0));
}

function applyPresetTemplate(template) {
  renderPresetDynamicFields(template || '');
}

function renderFabButtons() {
  fabButtonsWrap.innerHTML = '';
  fabs.forEach((fab) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fab-btn';
    btn.textContent = fab;
    btn.addEventListener('click', () => {
      fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      fabValue.value = fab;
    });
    fabButtonsWrap.appendChild(btn);
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
    alert('Non hai i permessi per questa operazione.');
    throw new Error('Accesso non consentito');
  }

  if (looksLikeAntiBotPage || !looksLikeJson) {
    if (attempt < 2) {
      await delay(450 * (attempt + 1));
      return fetchJson(url, options, attempt + 1);
    }
    throw new Error('Risposta temporaneamente non disponibile');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    if (attempt < 2) {
      await delay(450 * (attempt + 1));
      return fetchJson(url, options, attempt + 1);
    }
    throw error;
  }
}

async function loadCurrentUser() {
  const data = await fetchJson('/api/me');
  currentUser = data.user;
  if (openAdminBtn) openAdminBtn.style.display = currentUser?.role === 'admin' ? '' : 'none';
  const pill = document.getElementById('userPill');
  const pillName = document.getElementById('userPillName');
  if (pill && pillName && currentUser) {
    pillName.textContent = currentUser.username || '';
    pill.style.display = '';
  }
}

function chartTitleForTarget(target) {
  const baseTitle = target.closest('.panel') ? target.closest('.panel').querySelector('h3')?.textContent || target.id || 'Grafico' : (target.id || 'Grafico');
  const chartKey = normalizeChartKey(target && target.id);
  if (chartKey === 'fabYear' && fabYearMode === 'day') return `${baseTitle} (24h)`;
  if (chartKey === 'catYear' && catYearMode === 'day') return `${baseTitle} (24h)`;
  return baseTitle;
}

function setChartExportState(target, sortedStats) {
  chartExportState[target.id] = {
    title: chartTitleForTarget(target),
    stats: sortedStats.map((item) => ({ label: item.label, total: item.total }))
  };
}

function renderColumnChart(target, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  target.innerHTML = '';
  setChartExportState(target, sortedStats);

  const steps = 4;
  const tickValues = Array.from({ length: steps + 1 }, (_, i) => Math.round((max * (steps - i)) / steps));

  const inner = document.createElement('div');
  inner.className = 'chart-inner';

  const axis = document.createElement('div');
  axis.className = 'chart-y-axis';
  axis.innerHTML = tickValues.map((v) => `<span>${v}</span>`).join('');

  const barsWrap = document.createElement('div');
  barsWrap.className = 'chart-bars-wrap';

  sortedStats.forEach((s) => {
    const h = Math.round((s.total / max) * 180);
    const pct = totalAll > 0 ? Math.round((s.total / totalAll) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'bar';
    const color = getBarColor(target.id, s.label);
    row.innerHTML = `<span class="bar-value">${s.total}</span><div class="bar-fill" style="height:${h}px;background:${color}"><span class="bar-pct">${pct}%</span></div><span class="bar-label">${escapeHtml(s.label)}</span>`;
    barsWrap.appendChild(row);
  });

  inner.appendChild(axis);
  inner.appendChild(barsWrap);
  target.appendChild(inner);
}

function renderHorizontalChart(target, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  target.innerHTML = '';
  setChartExportState(target, sortedStats);

  const wrap = document.createElement('div');
  wrap.className = 'chart-horizontal-wrap';

  sortedStats.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'chart-horizontal-row';
    const width = Math.round((item.total / max) * 100);
    const pct = Math.round((item.total / Math.max(sortedStats.reduce((sum, x) => sum + x.total, 0), 1)) * 100);
    const color = getBarColor(target.id, item.label);
    row.innerHTML = `
      <span class="chart-horizontal-label">${escapeHtml(item.label)}</span>
      <div class="chart-horizontal-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div><span class="bar-pct">${pct}%</span></div>
      <span class="chart-horizontal-value">${item.total}</span>
    `;
    wrap.appendChild(row);
  });

  target.appendChild(wrap);
}

function renderPieOrDonutChart(target, stats, isDonut) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  const hideLegendValue = target && target.id === 'fabYearChart';
  target.innerHTML = '';
  setChartExportState(target, sortedStats);

  const layout = document.createElement('div');
  layout.className = `chart-pie-layout${isDonut ? ' donut' : ' pie'}`;

  const visual = document.createElement('div');
  visual.className = `chart-pie-visual${isDonut ? ' donut' : ' pie'}`;
  const slices = totalAll > 0 ? sortedStats.map((item) => {
    const color = getBarColor(target.id, item.label);
    const start = 0;
    return { color, pct: (item.total / totalAll) * 100, label: item.label };
  }) : [];
  let angle = 0;
  const gradient = slices.length
    ? slices.map((slice) => {
        const nextAngle = angle + slice.pct;
        const part = `${slice.color} ${angle}% ${nextAngle}%`;
        angle = nextAngle;
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
    const row = document.createElement('div');
    row.className = 'chart-pie-legend-row';
    const pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
    row.innerHTML = `
      <span class="chart-pie-swatch" style="background:${getBarColor(target.id, item.label)}"></span>
      <span class="chart-pie-label">${escapeHtml(item.label)}</span>
      ${hideLegendValue ? '' : `<strong class="chart-pie-value">${item.total}</strong>`}
      <span class="chart-pie-percent">${pct}%</span>
    `;
    legend.appendChild(row);
  });

  layout.appendChild(visual);
  layout.appendChild(legend);
  target.appendChild(layout);
}

function renderLineChart(target, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  target.innerHTML = '';
  setChartExportState(target, sortedStats);

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
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4.5" class="chart-line-point" fill="${getBarColor(target.id, point.item.label)}"></circle>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" text-anchor="middle" class="chart-line-label">${escapeHtml(point.item.label)}</text>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${point.y - 10}" text-anchor="middle" class="chart-line-value">${point.item.total}</text>`).join('')}
  `;
  target.appendChild(svg);
}

function renderPersonalLineChart(target, stats, targetValue) {
  target.innerHTML = '';
  const months = stats;
  const maxVal = Math.max(Math.max.apply(null, months.map(function(x) { return x.total; })), targetValue || 1, 1);
  const width = 900;
  const height = 220;
  const padL = 36;
  const padR = 16;
  const padT = 28;
  const padB = 32;
  const usableW = width - padL - padR;
  const usableH = height - padT - padB;
  const n = months.length;
  const xOf = function(i) { return padL + (usableW * i) / (n - 1); };
  const yOf = function(v) { return padT + usableH - (v / maxVal) * usableH; };
  const points = months.map(function(m, i) { return { x: xOf(i), y: yOf(m.total), m: m }; });
  const linePath = points.map(function(p, i) { return (i === 0 ? 'M' : 'L') + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  const targetY = yOf(targetValue || 0).toFixed(1);

  var yTicks = '';
  var tickCount = 5;
  for (var ti = 0; ti <= tickCount; ti++) {
    var tv = Math.round((maxVal * ti) / tickCount);
    var ty = yOf(tv).toFixed(1);
    yTicks += '<line x1="' + (padL - 4) + '" y1="' + ty + '" x2="' + (width - padR) + '" y2="' + ty + '" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3 3"/>';
    yTicks += '<text x="' + (padL - 6) + '" y="' + ty + '" text-anchor="end" dominant-baseline="middle" class="personal-chart-label">' + tv + '</text>';
  }

  var circles = points.map(function(p) {
    return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4" class="personal-chart-point"/>' +
      (p.m.total > 0 ? '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 9).toFixed(1) + '" text-anchor="middle" class="personal-chart-value">' + p.m.total + '</text>' : '');
  }).join('');

  var labels = points.map(function(p) {
    return '<text x="' + p.x.toFixed(1) + '" y="' + (height - padB + 14) + '" text-anchor="middle" class="personal-chart-label">' + escapeHtml(p.m.label) + '</text>';
  }).join('');

  var targetLine = (targetValue > 0)
    ? '<line x1="' + padL + '" y1="' + targetY + '" x2="' + (width - padR) + '" y2="' + targetY + '" class="personal-chart-target"/>' +
      '<text x="' + (width - padR) + '" y="' + (parseFloat(targetY) - 5) + '" text-anchor="end" class="personal-chart-target-label">Target ' + targetValue + '</text>'
    : '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  svg.setAttribute('class', 'personal-chart-svg');
  svg.innerHTML =
    yTicks +
    '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (height - padB) + '" class="personal-chart-axis"/>' +
    '<line x1="' + padL + '" y1="' + (height - padB) + '" x2="' + (width - padR) + '" y2="' + (height - padB) + '" class="personal-chart-axis"/>' +
    targetLine +
    '<path d="' + linePath + '" class="personal-chart-path"/>' +
    circles +
    labels;
  target.appendChild(svg);
}

function renderChart(target, stats) {
  const type = getChartType(target.id);
  if (type === 'bar') return renderHorizontalChart(target, stats);
  if (type === 'donut') return renderPieOrDonutChart(target, stats, true);
  if (type === 'pie') return renderPieOrDonutChart(target, stats, false);
  if (type === 'line') return renderLineChart(target, stats);
  return renderColumnChart(target, stats);
}

function renderVerticalChart(target, stats) {
  renderChart(target, stats);
}

function setupChartTypeControls() {
  document.querySelectorAll('.charts-grid .chart[id]').forEach((chart) => {
    const targetId = chart.id || '';
    const panelHeader = chart.closest('.panel') ? chart.closest('.panel').querySelector('.panel-heading-row') : null;
    if (!panelHeader || panelHeader.querySelector(`.chart-type-select[data-chart-target="${targetId}"]`)) return;
    const select = document.createElement('select');
    select.className = 'chart-type-select';
    select.dataset.chartTarget = targetId;
    select.setAttribute('aria-label', `Tipo grafico ${targetId}`);
    chartTypeChoices.forEach((choice) => {
      const option = document.createElement('option');
      option.value = choice.value;
      option.textContent = choice.label;
      select.appendChild(option);
    });
    select.value = getChartType(targetId);
    panelHeader.appendChild(select);
  });

  document.querySelectorAll('.chart-type-select[data-chart-target]').forEach((select) => {
    const targetId = select.dataset.chartTarget || '';
    const current = getChartType(targetId);
    if (select.value !== current) select.value = current;
    if (select.dataset.chartBound === '1') return;
    select.dataset.chartBound = '1';
    select.addEventListener('change', () => {
      const key = normalizeChartKey(targetId);
      chartTypes[key] = normalizeChartType(select.value);
      saveChartTypes();
      loadCharts().catch(() => {});
    });
  });
}


async function loadCategories() {
  const data = await fetchJson('/api/categories');
  menu.innerHTML = '';
  Object.keys(incidentCategoryMap).forEach((k) => delete incidentCategoryMap[k]);
  Object.keys(incidentNameToIdMap).forEach((k) => delete incidentNameToIdMap[k]);
  Object.keys(incidentIdToNameMap).forEach((k) => delete incidentIdToNameMap[k]);
  Object.keys(incidentIdToCategoryMap).forEach((k) => delete incidentIdToCategoryMap[k]);
  Object.keys(incidentIdToPresetMap).forEach((k) => delete incidentIdToPresetMap[k]);
  Object.keys(incidentIdToSeverityMap).forEach((k) => delete incidentIdToSeverityMap[k]);
  Object.keys(incidentIdToFabDefaultMap).forEach((k) => delete incidentIdToFabDefaultMap[k]);
  Object.keys(incidentPresetMap).forEach((k) => delete incidentPresetMap[k]);
  Object.keys(incidentSeverityMap).forEach((k) => delete incidentSeverityMap[k]);
  Object.keys(incidentFabDefaultMap).forEach((k) => delete incidentFabDefaultMap[k]);
  data.forEach((cat) => {
    const visibleIncidents = [];
    const wrap = document.createElement('div');
    wrap.className = 'menu-category';
    wrap.innerHTML = `<button class="category-toggle" type="button" aria-expanded="false">${cat.name}</button>`;
    const ul = document.createElement('ul');
    ul.className = 'incident-list';
    cat.incidents.forEach((inc) => {
      incidentCategoryMap[inc.name] = cat.name;
      incidentNameToIdMap[inc.name] = Number(inc.id);
      incidentIdToNameMap[String(inc.id)] = inc.name;
      incidentIdToCategoryMap[String(inc.id)] = cat.name;
      incidentIdToPresetMap[String(inc.id)] = Array.isArray(inc.presets) ? inc.presets : [];
      incidentIdToSeverityMap[String(inc.id)] = {
        severity_default: Number(inc.severity_default || 1),
        severity_mode: inc.severity_mode || 'default'
      };
      incidentIdToFabDefaultMap[String(inc.id)] = (inc.fab_default || '').toUpperCase();
      incidentPresetMap[inc.name] = Array.isArray(inc.presets) ? inc.presets : [];
      incidentSeverityMap[inc.name] = {
        severity_default: Number(inc.severity_default || 1),
        severity_mode: inc.severity_mode || 'default'
      };
      incidentFabDefaultMap[inc.name] = (inc.fab_default || '').toUpperCase();
      if (!cat.hidden && !inc.hidden) visibleIncidents.push(inc);
    });
    if (cat.hidden || !visibleIncidents.length) {
      return;
    }
    visibleIncidents.forEach((inc) => {
      const li = document.createElement('li');
      li.innerHTML = `<button class="incident-btn" type="button">${inc.name}</button>`;
      li.querySelector('button').addEventListener('click', () => openModal(inc.id));
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    wrap.querySelector('.category-toggle').addEventListener('click', () => {
      const isOpen = wrap.classList.toggle('open');
      wrap.querySelector('.category-toggle').setAttribute('aria-expanded', String(isOpen));
    });
    menu.appendChild(wrap);
  });
}

async function loadDayTickets(animatedTicketIds = []) {
  try {
    const data = await fetchJson('/api/tickets/current-shift');
    updateCurrentShiftCounters(data.tickets || []);
    const animatedIds = new Set((animatedTicketIds || []).map(Number));
    _compactFlatRows = [];
    ticketList.innerHTML = data.tickets.length ? '' : '<li>Nessun ticket nel turno corrente.</li>';
    if (!data.tickets.length) {
      applyCurrentShiftFilter();
      return;
    }

    const pad = (v) => String(v).padStart(2, '0');
    data.tickets.forEach((t) => {
      const incidentId = Number(t.incident_id || 0);
      const incidentName = String(incidentIdToNameMap[String(incidentId)] || t.incident_name || '');
      const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
      const categoryColor = getLabelColor('categories', category);
      const fabColor = getLabelColor('fabs', t.fab);
      const isAnimated = animatedIds.has(Number(t.id));
      const description = String(t.description || '');
      const d = new Date(t.created_at);
      const dayMonth = Number.isNaN(d.getTime()) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
      const hhmm = Number.isNaN(d.getTime()) ? '' : pad(d.getHours()) + ':' + pad(d.getMinutes());
      const ownerUsername = String(t.owner_username || '');
      const li = document.createElement('li');
      li.className = 'ticket-row' + (isAnimated ? ' ticket-new-entry' : '');
      li.dataset.ticketId = String(t.id);
      li.dataset.incidentId = String(t.incident_id || '');
      li.dataset.incident = incidentName;
      li.dataset.description = description;
      li.dataset.fab = String(t.fab || '');
      li.dataset.createdAt = String(t.created_at || '');
      li.dataset.severity = String(t.severity || '');
      li.dataset.category = category;
      li.dataset.canEdit = t.can_edit ? '1' : '0';
      li.dataset.ownerUserId = String(t.owner_user_id || '');
      li.dataset.ownerTeam = String(t.owner_team || '').toUpperCase();
      li.dataset.ownerUsername = ownerUsername;
      li.style.setProperty('--ticket-accent', categoryColor);
      li.innerHTML =
        '<div class="ticket-row-top">' +
          '<span class="ticket-row-cat" style="color:' + categoryColor + '">' + escapeHtml(category) + '</span>' +
          '<span class="ticket-row-sep" aria-hidden="true">|</span>' +
          '<span class="ticket-row-fab" style="color:' + fabColor + '">' + escapeHtml(String(t.fab || '')) + '</span>' +
        '</div>' +
        '<div class="ticket-row-body">' +
          '<div class="ticket-row-title">' + escapeHtml(incidentName) + '</div>' +
          '<div class="ticket-row-desc">' + highlightPresetValues(description) + '</div>' +
        '</div>' +
        '<div class="ticket-row-footer">' +
          (ownerUsername ? '<span class="ticket-row-owner">' + escapeHtml(ownerUsername) + '</span>' : '') +
          '<span class="ticket-row-datetime">' + dayMonth + ' ' + hhmm + '</span>' +
        '</div>';
      ticketList.appendChild(li);
    });

    ticketList.classList.toggle('ticket-list-scrollable', (data.tickets || []).length > 10);
    applyCurrentShiftFilter();
    sortTicketList();
  } catch (error) {
    console.error(error);
    updateCurrentShiftCounters([]);
    if (ticketList) ticketList.innerHTML = '<li>Impossibile caricare i ticket del turno corrente.</li>';
  }
}

function applyCurrentShiftFilter() {
  if (_compactActive && _compactFlatRows.length) _compactRestoreFlat();
  if (!ticketList || !currentShiftFilter) return;
  const query = currentShiftFilter.value.trim().toLocaleLowerCase('it');
  const userId = Number(currentUser && currentUser.id ? currentUser.id : 0);
  const userTeam = String(currentUser && currentUser.team ? currentUser.team : '').toUpperCase();
  let ticketCount = 0;
  let visibleTicketCount = 0;

  Array.from(ticketList.children).forEach((li) => {
    if (!li.dataset.ticketId) return;
    ticketCount += 1;
    let ownerMatch = true;
    if (currentShiftOwnerFilter === 'mine') {
      ownerMatch = userId > 0 && Number(li.dataset.ownerUserId || 0) === userId;
    } else if (currentShiftOwnerFilter === 'team') {
      const ownerTeam = String(li.dataset.ownerTeam || '').toUpperCase();
      const ownerId = Number(li.dataset.ownerUserId || 0);
      ownerMatch = Boolean(userTeam && ownerTeam === userTeam && ownerId !== userId);
    }
    const textMatch = !query || li.textContent.toLocaleLowerCase('it').includes(query);
    const isVisible = ownerMatch && textMatch;
    li.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleTicketCount += 1;
  });

  if (currentShiftFilterEmpty) {
    const hasFilter = Boolean(query) || currentShiftOwnerFilter !== 'all';
    currentShiftFilterEmpty.hidden = !(hasFilter && ticketCount > 0 && visibleTicketCount === 0);
  }
  if (_compactActive) _compactBuild();
}

function updateSortDirBtn() {
  if (!currentShiftSortDirBtn) return;
  currentShiftSortDirBtn.textContent = currentShiftSortDir === 'asc' ? '↑' : '↓';
}

function sortTicketList() {
  if (_compactActive && _compactFlatRows.length) _compactRestoreFlat();
  if (!ticketList) return;
  var items = Array.from(ticketList.children).filter(function(li) { return li.dataset.ticketId; });
  var key = currentShiftSortKey;
  var dir = currentShiftSortDir === 'asc' ? 1 : -1;
  items.sort(function(a, b) {
    var cmp;
    if (key === 'category') {
      cmp = String(a.dataset.category || '').localeCompare(String(b.dataset.category || ''), 'it');
    } else if (key === 'incident') {
      cmp = String(a.dataset.incident || '').localeCompare(String(b.dataset.incident || ''), 'it');
    } else if (key === 'fab') {
      cmp = String(a.dataset.fab || '').localeCompare(String(b.dataset.fab || ''), 'it');
    } else {
      cmp = String(a.dataset.createdAt || '').localeCompare(String(b.dataset.createdAt || ''));
    }
    return cmp * dir;
  });
  items.forEach(function(li) { ticketList.appendChild(li); });
  if (_compactActive) _compactBuild();
}

if (currentShiftFilter) {
  currentShiftFilter.addEventListener('input', applyCurrentShiftFilter);
}

if (currentShiftSort) {
  currentShiftSort.addEventListener('change', function() {
    currentShiftSortKey = currentShiftSort.value || 'time';
    currentShiftSortDir = currentShiftSortKey === 'time' ? 'desc' : 'asc';
    updateSortDirBtn();
    sortTicketList();
  });
}

if (currentShiftSortDirBtn) {
  currentShiftSortDirBtn.addEventListener('click', function() {
    currentShiftSortDir = currentShiftSortDir === 'asc' ? 'desc' : 'asc';
    updateSortDirBtn();
    sortTicketList();
  });
}

const currentShiftCountersEl = document.getElementById('currentShiftCounters');
if (currentShiftCountersEl) {
  currentShiftCountersEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.ticket-counter-btn[data-filter]');
    if (!btn) return;
    currentShiftOwnerFilter = btn.dataset.filter;
    Array.from(currentShiftCountersEl.querySelectorAll('.ticket-counter-btn')).forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    applyCurrentShiftFilter();
  });
}

async function refreshCurrentShiftTickets() {
  if (currentShiftAutoRefreshBusy) return;
  currentShiftAutoRefreshBusy = true;
  try {
    await loadDayTickets();
  } catch (error) {
    // Silenzio: il refresh periodico riproverÃ  al ciclo successivo.
  } finally {
    currentShiftAutoRefreshBusy = false;
  }
}

function pingUrl() {
  return appUrl('/api/ping?_t=' + Date.now());
}

function startCurrentShiftAutoRefresh() {
  if (syncPollTimer) return;
  fetch(pingUrl())
    .then((r) => r.json())
    .then((data) => { syncLastTs = data.ts || 0; scheduleSyncPoll(); })
    .catch(() => scheduleSyncPoll());
}

function scheduleSyncPoll() {
  syncPollTimer = setTimeout(() => {
    syncPollTimer = null;
    fetch(pingUrl())
      .then((r) => r.json())
      .then((data) => {
        const ts = data.ts || 0;
        if (ts > syncLastTs + 0.001) {
          syncLastTs = ts;
          refreshCurrentShiftTickets().catch(() => {});
          loadCharts().catch(() => {});
          if (previousShiftsLoaded) loadPreviousShifts().catch(() => {});
        }
        scheduleSyncPoll();
      })
      .catch(() => {
        syncPollTimer = setTimeout(() => { syncPollTimer = null; scheduleSyncPoll(); }, 5000);
      });
  }, 2000);
}

function renderGroupedTickets(tickets) {
  if (!tickets.length) return '<p class="muted">Nessun ticket registrato.</p>';

  const grouped = new Map();
  tickets.forEach((ticket) => {
    const incidentId = Number(ticket.incident_id || 0);
    const incidentName = String(incidentIdToNameMap[String(incidentId)] || ticket.incident_name || '');
    const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
    const key = `${category}|||${ticket.fab}`;
    if (!grouped.has(key)) grouped.set(key, { category, fab: ticket.fab, incidents: [] });
    grouped.get(key).incidents.push(ticket);
  });

  const groups = [...grouped.values()].map((group) => {
    const categoryColor = getLabelColor('categories', group.category);
    const fabColor = getLabelColor('fabs', group.fab);
    const rows = group.incidents
      .map((item) => `<li><span class="incident-entry-text"><span class="incident-title">${escapeHtml(item.incident_name)}</span> - ${highlightPresetValues(item.description)}</span></li>`)
      .join('');
    return `<li><strong class="ticket-category-label" style="color:${categoryColor}">${group.category}</strong> | <strong class="ticket-fab-label" style="color:${fabColor}">${group.fab}</strong><ul>${rows}</ul></li>`;
  }).join('');

  return `<ul class="ticket-list previous-ticket-list">${groups}</ul>`;
}

function renderSearchTickets(tickets) {
  if (!tickets.length) return '<p class="muted">Nessun ticket trovato con questi filtri.</p>';

  const grouped = new Map();
  tickets.forEach((ticket) => {
    const incidentId = Number(ticket.incident_id || 0);
    const incidentName = String(incidentIdToNameMap[String(incidentId)] || ticket.incident_name || '');
    const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
    const key = `${category}|||${ticket.fab}`;
    if (!grouped.has(key)) grouped.set(key, { category, fab: ticket.fab, incidents: [] });
    grouped.get(key).incidents.push(ticket);
  });

  const groups = [...grouped.values()].map((group) => {
    const categoryColor = getLabelColor('categories', group.category);
    const fabColor = getLabelColor('fabs', group.fab);
    const rows = group.incidents.map((item) => {
      const editBtn = item.can_edit
        ? `<button type="button" class="edit-ticket-btn" data-ticket-id="${item.id}" data-incident-id="${item.incident_id || ''}" data-incident="${item.incident_name.replace(/"/g, '&quot;')}" data-description="${item.description.replace(/"/g, '&quot;')}" data-fab="${item.fab}" data-created-at="${item.created_at || ''}" data-severity="${item.severity || ''}">Modifica</button>`
        : '';
      return `<li data-ticket-id="${item.id}"><span class="incident-entry-text"><span class="incident-title">${escapeHtml(item.incident_name)}</span> - ${highlightPresetValues(item.description)}</span>${editBtn}</li>`;
    }).join('');
    return `<li><strong class="ticket-category-label" style="color:${categoryColor}">${group.category}</strong> | <strong class="ticket-fab-label" style="color:${fabColor}">${group.fab}</strong><ul>${rows}</ul></li>`;
  }).join('');

  return `<ul class="ticket-list previous-ticket-list">${groups}</ul>`;
}

async function runTicketSearch() {
  const query = ticketSearchQueryInput?.value?.trim() || '';
  const from = ticketSearchFromInput?.value || '';
  const to = ticketSearchToInput?.value || '';
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  if (ticketSearchSummary) {
    const parts = [];
    if (query) parts.push(`parole chiave "${query}"`);
    if (from || to) parts.push(`date ${from || '...'} ? ${to || '...'}`);
    ticketSearchSummary.textContent = parts.length ? `Ricerca attiva: ${parts.join(' Â· ')}` : 'Ricerca senza filtri: mostra tutti i ticket storici.';
  }
  const data = await fetchJson(`/api/tickets/search${suffix}`);
  if (ticketSearchResults) {
    ticketSearchResults.innerHTML = `<p class="ticket-search-count">${data.count} ticket trovati.</p>${renderSearchTickets(data.tickets || [])}`;
  }
}

function handleEditTicketButton(btn) {
  editingTicketId = Number(btn.dataset.ticketId);
  clearExtraTicketCards();
  if (ticketSubmitBtn) ticketSubmitBtn.textContent = 'Conferma Modifica';
  const incidentId = Number(btn.dataset.incidentId || 0);
  const incidentName = incidentIdToNameMap[String(incidentId)] || btn.dataset.incident || '';
  incidentTypeInput.value = String(incidentId || '');
  if (ticketModalTitle) ticketModalTitle.textContent = incidentName || 'Nuovo Ticket';
  const severityCfg = incidentIdToSeverityMap[String(incidentId)] || { severity_default: 1, severity_mode: 'default' };
  const fallbackSeverity = Number(btn.dataset.severity || severityCfg.severity_default || 1);
  ticketSeveritySelect.value = String(fallbackSeverity);
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = severityCfg.severity_mode === 'user' ? '' : 'none';
  ticketSeveritySelect.disabled = severityCfg.severity_mode !== 'user';
  ticketTimestampInput.disabled = false;
  if (ticketSeverityHint) {
    ticketSeverityHint.textContent = severityCfg.severity_mode === 'user'
      ? ''
      : 'Severity impostata di default dall\'admin.';
  }
  document.getElementById('description').value = (btn.dataset.description || '').replace(/ã€ˆ([^ã€‰]*)ã€‰/g, '$1');
  document.getElementById('description').readOnly = false;
  document.getElementById('description').style.display = '';
  document.getElementById('description').placeholder = 'Inserisci descrizione problema...';
  if (presetInlineComposer) {
    presetInlineComposer.style.display = 'none';
    presetInlineComposer.innerHTML = '';
  }
  ticketTimestampInput.value = toDatetimeLocalValue(btn.dataset.createdAt || new Date());
  fabValue.value = (btn.dataset.fab || '').toUpperCase();
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.disabled = false;
    b.classList.toggle('active', b.textContent === fabValue.value);
  });
  setTicketModalReadMode(false);
  if (deleteTicketBtn) deleteTicketBtn.style.display = 'inline-block';
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = 'none';
  revealModal();
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

if (editFromReadBtn) {
  editFromReadBtn.addEventListener('click', function () {
    handleEditTicketButton(editFromReadBtn);
  });
}

async function loadPreviousShifts() {
  if (previousShiftsLoaded || previousShiftsLoading) return;
  previousShiftsLoading = true;
  try {
    const data = await fetchPreviousShiftsData();
    if (!data.shifts.length) {
      previousShiftsContent.innerHTML = '<p class="muted">Non ci sono turni precedenti nel giorno corrente.</p>';
      previousShiftsLoaded = true;
      return;
    }

    previousShiftsContent.innerHTML = data.shifts.map((shift) => {
      return `<section class="previous-shift-block"><h4>${shift.label}</h4>${renderGroupedTickets(shift.tickets)}</section>`;
    }).join('');
    previousShiftsLoaded = true;
  } finally {
    previousShiftsLoading = false;
  }
}

setupChartExportControls();

async function loadCharts() {
  try {
    const [fabYear, catYear, teamYear, severityYear, personal] = await Promise.all([
      fetchJson(fabYearMode === 'day' ? '/api/stats/fab/current-day' : `/api/stats/fab/current-year?mode=${fabYearMode}`),
      fetchJson(catYearMode === 'day' ? '/api/stats/category/current-day' : `/api/stats/category/current-year?mode=${catYearMode}`),
      fetchJson(teamYearMode === 'day' ? '/api/stats/team/current-day' : `/api/stats/team/current-year?mode=${teamYearMode}`),
      fetchJson(severityYearMode === 'day' ? '/api/stats/severity/current-day' : `/api/stats/severity/current-year?mode=${severityYearMode}`),
      fetchJson('/api/stats/personal/current-year?view=' + personalChartView)
    ]);
    renderChart(fabYearChart, fabYear.stats);
    renderChart(catYearChart, catYear.stats);
    renderChart(teamYearChart, teamYear.stats);
    renderChart(severityYearChart, severityYear.stats);
    if (personalChart && personal.stats) {
      const target = Number(personalTargetInput ? personalTargetInput.value : 0) || 0;
      renderPersonalLineChart(personalChart, personal.stats, target);
    }
    if (personalChartUsername && personal.username) {
      personalChartUsername.textContent = '— ' + personal.username;
    }
  } catch (error) {
    console.error(error);
    [fabYearChart, catYearChart, teamYearChart, severityYearChart].forEach((target) => {
      if (target) target.innerHTML = '<p class="muted">Impossibile caricare il grafico.</p>';
    });
  }
}

document.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeModal));
modal.addEventListener('mousedown', (e) => {
  overlayPressStarted = e.target === modal;
});
modal.addEventListener('mouseup', (e) => {
  if (e.target === modal && overlayPressStarted) closeModal();
  overlayPressStarted = false;
});
openAdminBtn.addEventListener('click', () => { window.location.href = appUrl('/admin.html'); });
logoutBtn?.addEventListener('click', async () => {
  await fetch(appUrl('/api/logout'), { method: 'POST' });
  window.location.href = appUrl('/login.html');
});

if (previousShiftsToggle) {
  previousShiftsToggle.addEventListener('click', async () => {
    const isOpen = previousShiftsToggle.getAttribute('aria-expanded') === 'true';
    previousShiftsToggle.setAttribute('aria-expanded', String(!isOpen));
    previousShiftsToggle.querySelector('.section-toggle-icon').textContent = isOpen ? '+' : '-';
    previousShiftsContent.hidden = isOpen;
    if (!isOpen && !previousShiftsLoaded) await loadPreviousShifts();
  });

  currentShiftToggle?.addEventListener('click', () => {
    const isOpen = currentShiftToggle.getAttribute('aria-expanded') === 'true';
    currentShiftToggle.setAttribute('aria-expanded', String(!isOpen));
    currentShiftToggle.classList.toggle('collapsed', isOpen);
    ticketList.classList.toggle('ticket-list-collapsed', isOpen);
  });
}

document.querySelectorAll('.range-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = btn.dataset.target;
    const mode = btn.dataset.mode;
    document.querySelectorAll(`.range-btn[data-target="${target}"]`).forEach((x) => x.classList.remove('active'));
    btn.classList.add('active');
    if (target === 'fabYear') fabYearMode = mode;
    if (target === 'catYear') catYearMode = mode;
    if (target === 'teamYear') teamYearMode = mode;
    if (target === 'severityYear') severityYearMode = mode;
    await loadCharts();
  });
});

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!beginTicketSubmitLock()) return;
  const incident_id = Number(incidentTypeInput.value || 0);
  const descEl = document.getElementById('description');
  const description = (descEl.dataset.presetAutoSync !== 'off' && descEl.dataset.presetMarkupValue)
    ? descEl.dataset.presetMarkupValue
    : descEl.value.trim();
  const fab = fabValue.value;
  const severity = Number(ticketSeveritySelect.value || 1);
  const ticket_time_local = ticketTimestampInput.value;
  if (!incident_id || !description || !fab || !ticket_time_local) {
    setTicketSubmitState(false);
    return alert('Compila incident, descrizione, data/ora e FAB');
  }
  const ticket_time = new Date(ticket_time_local).toISOString();
  let createdTicketIds = [];
  try {
    if (editingTicketId) {
      await fetchJson(`/api/tickets/${editingTicketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id, description, fab, ticket_time, severity })
      });
    } else {
      const payloads = [{ incident_id, description, fab, ticket_time, severity }];
      const severityCfg = incidentIdToSeverityMap[String(incident_id)] || { severity_default: 1, severity_mode: 'default' };
      payloads.push.apply(payloads, collectExtraTicketPayloads(incident_id, severityCfg.severity_default));

      const createdTickets = [];
      for (let pi = 0; pi < payloads.length; pi += 1) {
        const ticket = await fetchJson('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloads[pi])
        });
        createdTickets.push(ticket);
      }
      createdTicketIds = createdTickets.map((ticket) => ticket?.id).filter(Boolean);
    }
    ticketForm.reset();
    editingTicketId = null;
    if (ticketSubmitBtn) ticketSubmitBtn.textContent = 'Crea Ticket';
    if (deleteTicketBtn) deleteTicketBtn.style.display = 'none';
    closeModal();
    await loadDayTickets(createdTicketIds);
    await loadCharts();
  } catch (error) {
    const message = String(error?.message || 'Errore durante il salvataggio ticket');
    alert(`Inserimento ticket fallito: ${message}`);
  } finally {
    setTicketSubmitState(false);
  }
});

ticketSubmitBtn?.addEventListener('click', (event) => {
  if (ticketSubmitBusy) {
    event.preventDefault();
    event.stopPropagation();
  }
});

ticketSearchForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await runTicketSearch();
});

ticketSearchResetBtn?.addEventListener('click', async () => {
  if (ticketSearchQueryInput) ticketSearchQueryInput.value = '';
  if (ticketSearchFromInput) ticketSearchFromInput.value = '';
  if (ticketSearchToInput) ticketSearchToInput.value = '';
  if (ticketSearchSummary) ticketSearchSummary.textContent = 'Nessuna ricerca avviata.';
  if (ticketSearchResults) ticketSearchResults.innerHTML = '';
});

// --- Chart panel spans / order / drag & resize ---
const chartSpanStorageKey = 'prodops_chart_spans';
const chartOrderStorageKey = 'prodops_chart_order';
const chartSpanSteps = [3, 6, 9, 12];
let chartSpans = {};
let dragSrcPanel = null;

function defaultChartSpan(panelId) {
  return panelId === 'chartPanelPersonal' ? 12 : 3;
}

function loadChartSpans() {
  try { chartSpans = JSON.parse(localStorage.getItem(chartSpanStorageKey) || '{}'); } catch (e) { chartSpans = {}; }
}

function saveChartSpans() {
  try { localStorage.setItem(chartSpanStorageKey, JSON.stringify(chartSpans)); } catch (e) {}
}

function getChartSpan(panelId) {
  const v = Number(chartSpans[panelId]);
  return chartSpanSteps.indexOf(v) !== -1 ? v : defaultChartSpan(panelId);
}

function applyChartSpan(panel, span) {
  chartSpanSteps.forEach(function (s) { panel.classList.remove('chart-span-' + s); });
  panel.classList.add('chart-span-' + span);
}

function applyAllChartSpans() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    applyChartSpan(panel, getChartSpan(panel.id));
  });
}

function loadChartOrder() {
  try {
    const order = JSON.parse(localStorage.getItem(chartOrderStorageKey) || 'null');
    if (!Array.isArray(order)) return;
    const grid = document.getElementById('chartsGrid');
    if (!grid) return;
    order.forEach(function (panelId) {
      const panel = document.getElementById(panelId);
      if (panel && panel.parentElement === grid) grid.appendChild(panel);
    });
  } catch (e) {}
}

function saveChartOrder() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  const order = [];
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (p) { order.push(p.id); });
  try { localStorage.setItem(chartOrderStorageKey, JSON.stringify(order)); } catch (e) {}
}

function setupChartResizeControls() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    const header = panel.querySelector('.panel-heading-row');
    if (!header || header.querySelector('.chart-resize-controls')) return;
    const controls = document.createElement('div');
    controls.className = 'chart-resize-controls';
    [{ dir: -1, label: '◀' }, { dir: 1, label: '▶' }].forEach(function (cfg) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chart-resize-btn';
      btn.textContent = cfg.label;
      btn.title = cfg.dir === -1 ? 'Riduci larghezza' : 'Espandi larghezza';
      btn.addEventListener('click', function () {
        const current = getChartSpan(panel.id);
        const idx = chartSpanSteps.indexOf(current);
        const newIdx = Math.max(0, Math.min(chartSpanSteps.length - 1, idx + cfg.dir));
        const newSpan = chartSpanSteps[newIdx];
        if (newSpan === current) return;
        chartSpans[panel.id] = newSpan;
        saveChartSpans();
        applyChartSpan(panel, newSpan);
      });
      controls.appendChild(btn);
    });
    header.appendChild(controls);
  });
}

function setupChartDragDrop() {
  const grid = document.getElementById('chartsGrid');
  if (!grid || grid.dataset.dragSetup === '1') return;
  grid.dataset.dragSetup = '1';

  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    const header = panel.querySelector('.panel-heading-row');
    if (!header || header.querySelector('.chart-drag-handle')) return;
    const handle = document.createElement('span');
    handle.className = 'chart-drag-handle';
    handle.setAttribute('draggable', 'true');
    handle.setAttribute('title', 'Trascina per spostare');
    handle.textContent = '⠇';
    header.prepend(handle);

    handle.addEventListener('dragstart', function (e) {
      dragSrcPanel = panel;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', panel.id);
      try { e.dataTransfer.setDragImage(panel, 20, 20); } catch (err) {}
      setTimeout(function () { panel.classList.add('chart-dragging'); }, 0);
    });

    handle.addEventListener('dragend', function () {
      if (dragSrcPanel) dragSrcPanel.classList.remove('chart-dragging');
      grid.querySelectorAll('.chart-drag-over').forEach(function (el) { el.classList.remove('chart-drag-over'); });
      dragSrcPanel = null;
    });
  });

  grid.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const overPanel = e.target.closest ? e.target.closest('.panel') : null;
    if (overPanel && overPanel !== dragSrcPanel && overPanel.parentElement === grid) {
      grid.querySelectorAll('.chart-drag-over').forEach(function (el) { el.classList.remove('chart-drag-over'); });
      overPanel.classList.add('chart-drag-over');
    }
  });

  grid.addEventListener('dragleave', function (e) {
    if (!grid.contains(e.relatedTarget)) {
      grid.querySelectorAll('.chart-drag-over').forEach(function (el) { el.classList.remove('chart-drag-over'); });
    }
  });

  grid.addEventListener('drop', function (e) {
    e.preventDefault();
    const overPanel = e.target.closest ? e.target.closest('.panel') : null;
    grid.querySelectorAll('.chart-drag-over').forEach(function (el) { el.classList.remove('chart-drag-over'); });
    if (!dragSrcPanel || !overPanel || dragSrcPanel === overPanel || overPanel.parentElement !== grid) return;
    const allPanels = [];
    grid.querySelectorAll(':scope > .panel').forEach(function (p) { allPanels.push(p); });
    const srcIdx = allPanels.indexOf(dragSrcPanel);
    const dstIdx = allPanels.indexOf(overPanel);
    if (srcIdx < dstIdx) { overPanel.after(dragSrcPanel); } else { overPanel.before(dragSrcPanel); }
    dragSrcPanel.classList.remove('chart-dragging');
    dragSrcPanel = null;
    saveChartOrder();
  });
}

(async function init() {
  document.querySelectorAll('.year-btn').forEach((btn) => { btn.textContent = String(currentYear); });
  loadChartTypes();
  loadChartSpans();
  loadChartOrder();
  applyAllChartSpans();
  if (personalTargetInput) {
    const savedTarget = localStorage.getItem(personalTargetStorageKey);
    if (savedTarget !== null) personalTargetInput.value = savedTarget;
    personalTargetInput.addEventListener('change', () => {
      localStorage.setItem(personalTargetStorageKey, personalTargetInput.value);
      loadCharts().catch(() => {});
    });
  }
  document.querySelectorAll('.personal-view-toggle [data-personal-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      personalChartView = btn.dataset.personalView || 'mine';
      document.querySelectorAll('.personal-view-toggle [data-personal-view]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadCharts().catch(() => {});
    });
  });
  try { await loadCurrentUser(); } catch (error) { console.error(error); }
  try { await loadCategories(); } catch (error) { console.error(error); }
  try { await loadUiColors(); } catch (error) { console.error(error); uiColors = normalizeUiColors({}); }
  renderFabButtons();
  setupChartTypeControls();
  setupChartResizeControls();
  setupChartDragDrop();
  try { await loadDayTickets(); } catch (error) { console.error(error); }
  try { await fetchPreviousShiftsData(); } catch (error) { console.error(error); updatePreviousShiftCounter([]); }
  startCurrentShiftAutoRefresh();
  deferWork(async () => {
    try {
      if (!previousShiftsLoaded && previousShiftsContent && !previousShiftsContent.hidden) {
        await loadPreviousShifts();
      }
      await loadCharts();
    } catch (error) {
      console.error(error);
    }
  });
})();

function applyTheme(theme){ document.body.classList.toggle('theme-dark', theme==='dark'); setThemeToggleIcon(themeToggleBtn, theme); }
const savedTheme = localStorage.getItem('theme') || 'light'; applyTheme(savedTheme);
if(themeToggleBtn){themeToggleBtn.addEventListener('click',async()=>{const next=document.body.classList.contains('theme-dark')?'light':'dark'; localStorage.setItem('theme',next); applyTheme(next); await refreshColorSensitiveViews();});}

window.addEventListener('storage', (event) => {
  if (event.key === uiColorsSyncKey) {
    syncUiColorsAfterAdminChange().catch(() => {});
  }
  if (event.key === chartTypeStorageKey) {
    loadChartTypes();
    setupChartTypeControls();
    loadCharts().catch(() => {});
  }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    syncUiColorsAfterAdminChange().catch(() => {});
    loadChartTypes();
    setupChartTypeControls();
    loadCharts().catch(() => {});
  }
});




ticketList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.edit-ticket-btn');
  if (btn) {
    handleEditTicketButton(btn);
    return;
  }
  const card = e.target.closest('.ticket-row');
  if (!card) return;
  openTicketReadModal({
    ticketId: card.dataset.ticketId,
    incidentId: card.dataset.incidentId,
    incidentName: card.dataset.incident,
    description: card.dataset.description,
    fab: card.dataset.fab,
    createdAt: card.dataset.createdAt,
    severity: card.dataset.severity,
    category: card.dataset.category,
    canEdit: card.dataset.canEdit === '1'
  });
});

ticketSearchResults?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.edit-ticket-btn');
  if (!btn) return;
  handleEditTicketButton(btn);
});

if (deleteTicketBtn) {
  deleteTicketBtn.addEventListener('click', async () => {
    if (!editingTicketId) return;
    const ok = confirm('Confermi eliminazione ticket?');
    if (!ok) return;
    await fetchJson(`/api/tickets/${editingTicketId}`, { method: 'DELETE' });
    editingTicketId = null;
    deleteTicketBtn.style.display = 'none';
    ticketForm.reset();
    closeModal();
    await loadDayTickets();
    await loadCharts();
  });
}

addSameIncidentBtn?.addEventListener('click', () => {
  if (editingTicketId) return;
  const incidentId = Number(incidentTypeInput.value || 0);
  if (!incidentId) return;
  createExtraTicketCard(incidentId);
  positionAddSameIncidentBtn();
});

window.addEventListener('resize', () => {
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
});

// ── Compact Visual ────────────────────────────────────────────────
var _compactActive = false;
var _compactFlatRows = [];
var _tsPopupTimer = null;

function _compactRestoreFlat() {
  ticketList.classList.remove('compact-visual');
  if (!_compactFlatRows.length) return;
  ticketList.innerHTML = '';
  _compactFlatRows.forEach(function(r) { ticketList.appendChild(r); });
}

function _compactBuild() {
  var allRows = Array.from(ticketList.children).filter(function(li) {
    return !!li.dataset.ticketId;
  });
  _compactFlatRows = allRows.slice();

  var visRows = allRows.filter(function(li) { return li.style.display !== 'none'; });

  var groups = {};
  var order = [];
  visRows.forEach(function(row) {
    var cat = row.dataset.category || '';
    if (!groups[cat]) { groups[cat] = []; order.push(cat); }
    groups[cat].push(row);
  });

  ticketList.innerHTML = '';
  ticketList.classList.add('compact-visual');
  ticketList.classList.remove('ticket-list-scrollable');

  if (!order.length) {
    var empty = document.createElement('li');
    empty.style.cssText = 'color:var(--muted);padding:8px 0;';
    empty.textContent = 'Nessun ticket corrisponde al filtro.';
    ticketList.appendChild(empty);
    return;
  }

  order.forEach(function(cat) {
    var cards = groups[cat];
    var stack = document.createElement('li');
    stack.className = 'ticket-stack' + (cards.length === 1 ? ' single' : '');
    stack.dataset.stackCat = cat;
    stack._tsCards = cards;

    var front = cards[0].cloneNode(true);
    stack.appendChild(front);

    if (cards.length > 1) {
      var badge = document.createElement('span');
      badge.className = 'ticket-stack-badge';
      badge.textContent = String(cards.length);
      stack.appendChild(badge);
    }

    stack.addEventListener('mouseenter', function() { _tsShowPopup(this); });
    stack.addEventListener('mouseleave', function() {
      _tsPopupTimer = setTimeout(_tsHidePopup, 110);
    });

    ticketList.appendChild(stack);
  });
}

function _tsShowPopup(stack) {
  if (_tsPopupTimer) { clearTimeout(_tsPopupTimer); _tsPopupTimer = null; }
  var cards = stack._tsCards;
  if (!cards || cards.length <= 1) return;

  tsPopup.innerHTML = '';
  cards.forEach(function(card) { tsPopup.appendChild(card.cloneNode(true)); });
  tsPopup.removeAttribute('hidden');

  var rect = stack.getBoundingClientRect();
  var approxW = Math.min(cards.length * 184 + 28, window.innerWidth * 0.9);
  var left = rect.left;
  var top = rect.bottom + 8;
  if (left + approxW > window.innerWidth - 10) left = Math.max(10, window.innerWidth - approxW - 10);
  if (top + 260 > window.innerHeight) top = Math.max(10, rect.top - 268);
  tsPopup.style.left = left + 'px';
  tsPopup.style.top = top + 'px';
  tsPopup.style.maxWidth = approxW + 'px';
}

function _tsHidePopup() {
  if (tsPopup) { tsPopup.setAttribute('hidden', ''); tsPopup.innerHTML = ''; }
}

if (tsPopup) {
  tsPopup.addEventListener('mouseenter', function() {
    if (_tsPopupTimer) { clearTimeout(_tsPopupTimer); _tsPopupTimer = null; }
  });
  tsPopup.addEventListener('mouseleave', function() {
    _tsPopupTimer = setTimeout(_tsHidePopup, 110);
  });
  tsPopup.addEventListener('click', function(e) {
    var btn = e.target.closest('.edit-ticket-btn');
    if (btn) { handleEditTicketButton(btn); _tsHidePopup(); return; }
    var card = e.target.closest('.ticket-row');
    if (!card) return;
    openTicketReadModal({
      ticketId: card.dataset.ticketId,
      incidentId: card.dataset.incidentId,
      incidentName: card.dataset.incident,
      description: card.dataset.description,
      fab: card.dataset.fab,
      createdAt: card.dataset.createdAt,
      severity: card.dataset.severity,
      category: card.dataset.category,
      canEdit: card.dataset.canEdit === '1'
    });
    _tsHidePopup();
  });
}

if (compactVisualToggle) {
  compactVisualToggle.addEventListener('change', function() {
    _compactActive = this.checked;
    if (_compactActive) {
      _compactBuild();
    } else {
      _compactRestoreFlat();
      _compactFlatRows = [];
      _tsHidePopup();
      ticketList.classList.toggle(
        'ticket-list-scrollable',
        Array.from(ticketList.children).filter(function(li) { return !!li.dataset.ticketId; }).length > 10
      );
    }
  });
}
// ── Fine Compact Visual ──────────────────────────────────────────

(function () {
  var handle = document.getElementById('currentShiftResizeHandle');
  if (!handle || !ticketList) return;
  var STORAGE_KEY = 'currentShiftListHeight';
  var DEFAULT_HEIGHT = 340;
  var dragging = false;
  var startY = 0;
  var startH = 0;

  function currentH() {
    var raw = ticketList.style.maxHeight;
    return raw ? parseInt(raw, 10) : DEFAULT_HEIGHT;
  }

  function applyH(h) {
    h = Math.max(80, Math.min(h, window.innerHeight - 120));
    ticketList.style.maxHeight = h + 'px';
    try { localStorage.setItem(STORAGE_KEY, String(h)); } catch (e) {}
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) ticketList.style.maxHeight = parseInt(saved, 10) + 'px';
  } catch (e) {}

  handle.addEventListener('mousedown', function (e) {
    dragging = true;
    startY = e.clientY;
    startH = currentH();
    handle.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    applyH(startH + (e.clientY - startY));
  });

  document.addEventListener('mouseup', function () {
    if (dragging) {
      dragging = false;
      handle.classList.remove('dragging');
    }
  });
}());
