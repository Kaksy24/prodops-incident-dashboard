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
const customIncidentNameGroup = document.getElementById('customIncidentNameGroup');
const customIncidentNameInput = document.getElementById('customIncidentName');
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
const userYearChart = document.getElementById('userYearChart');
const personalMineChart = document.getElementById('personalMineChart');
const personalMineChartTitleText = document.getElementById('personalMineChartTitleText');
const personalMineChartUsername = document.getElementById('personalMineChartUsername');
const personalMineTargetMonthlyLabel = document.getElementById('personalMineTargetMonthlyLabel');
const personalMineTargetMonthlyInput = document.getElementById('personalMineTargetMonthlyInput');
const personalMineTargetAnnualLabel = document.getElementById('personalMineTargetAnnualLabel');
const personalMineTargetAnnualInput = document.getElementById('personalMineTargetAnnualInput');
const personalGroupChart = document.getElementById('personalGroupChart');
const personalGroupChartTitleText = document.getElementById('personalGroupChartTitleText');
const personalGroupChartUsername = document.getElementById('personalGroupChartUsername');
const personalGroupTargetMonthlyLabel = document.getElementById('personalGroupTargetMonthlyLabel');
const personalGroupTargetMonthlyInput = document.getElementById('personalGroupTargetMonthlyInput');
const personalGroupTargetAnnualLabel = document.getElementById('personalGroupTargetAnnualLabel');
const personalGroupTargetAnnualInput = document.getElementById('personalGroupTargetAnnualInput');
const generatePptReportBtn = document.getElementById('generatePptReportBtn');
const ticketTimestampInput = document.getElementById('ticketTimestamp');
const ticketModalTitle = document.getElementById('ticketModalTitle');
const ticketSeveritySelect = document.getElementById('ticketSeverity');
const ticketSeverityHint = document.getElementById('ticketSeverityHint');
const ticketSeverityGroup = document.getElementById('ticketSeverityGroup');
const presetInlineComposer = document.getElementById('presetInlineComposer');

const fabs = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];
const themeToggleBtn = document.getElementById('themeToggleBtn');
const THEMES = [
  { id: 'cappuccino', label: 'Cappuccino', sidebar: '#321805', brand: '#7c4a24' },
  { id: 'bordeaux',   label: 'Bordeaux',   sidebar: '#2c0a12', brand: '#860026' },
  { id: 'verde',      label: 'Verde',      sidebar: '#0c261a', brand: '#1a6e3e' },
  { id: 'blu',        label: 'Blu',        sidebar: '#172b45', brand: '#0c5f8c' },
  { id: 'giallo',     label: 'Giallo',     sidebar: '#2a2000', brand: '#b89200' },
];
let fabYearMode = 'day';
let catYearMode = 'day';
let teamYearMode = 'day';
let severityYearMode = 'day';
let userYearMode = 'day';
const chartCustomRanges = { fabYear: null, catYear: null, teamYear: null, severityYear: null, userYear: null };
const currentYear = new Date().getFullYear();
const incidentCategoryMap = {};
const incidentNameToIdMap = {};
const incidentIdToNameMap = {};
const incidentIdToCategoryMap = {};
const incidentIdToPresetMap = {};
const incidentIdToSeverityMap = {};
const incidentIdToFabDefaultMap = {};
const incidentIdToNameModeMap = {};
const incidentPresetMap = {};
const incidentSeverityMap = {};
const incidentFabDefaultMap = {};
const chartExportState = {};
let uiColors = null;
let editingTicketId = null;
let _pinTicketId = null;
let _pinTicketData = null;
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
let currentPaletteId = 'blu';
let currentDarkMode = false;
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
    const isSupervisor = currentUser && currentUser.role === 'supervisor';
    if (isSupervisor ? (ownerId !== userId) : (userTeam && ownerTeam === userTeam && ownerId !== userId)) team += 1;
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

/* ── PIN ticket ─────────────────────────────────────── */
function formatPinDate(s) {
  var p = (s || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s;
}
function sanitizePinText(text) {
  return String(text || '')
    .replace(/ã€ˆ([^ã€‰]*)ã€‰/g, '$1')
    .replace(/â€˜/g, '‘')
    .replace(/â€™/g, '’')
    .replace(/â€œ/g, '“')
    .replace(/â€[�]/g, '”')
    .replace(/â€“/g, '—')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã /g, 'à')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¬/g, 'ì');
}
function decoratePinnedTickets(pins) {
  if (!ticketList) return;
  var pinnedIds = new Set((pins || []).map(function(p) { return Number(p.id); }));
  ticketList.querySelectorAll('[data-ticket-id]').forEach(function(li) {
    var tid = Number(li.dataset.ticketId);
    var isPinned = pinnedIds.has(tid);
    var row = li.classList.contains('ticket-row') ? li : li.querySelector('.ticket-row');
    if (!row) return;
    var existing = row.querySelector('.ticket-pin-badge');
    if (isPinned && !existing) {
      var badge = document.createElement('span');
      badge.className = 'ticket-pin-badge';
      badge.setAttribute('aria-label', 'Ticket pinnato');
      badge.setAttribute('title', 'Ticket pinnato');
      badge.textContent = '📌';
      var top = row.querySelector('.ticket-row-top');
      if (top) top.appendChild(badge);
    } else if (!isPinned && existing) {
      existing.remove();
    }
    li.classList.toggle('ticket-pinned', isPinned);
  });
}

function updateImportantTicketsBadge() {
  var btn = document.getElementById('importantTicketsBtn');
  if (!btn) return;
  fetchJson('/api/pinned-tickets').then(function(pins) {
    var count = (pins || []).length;
    btn.classList.toggle('has-pins', count > 0);
    btn.textContent = count > 0 ? '📌 Ticket Importanti (' + count + ')' : '📌 Ticket Importanti';
    decoratePinnedTickets(pins);
  }).catch(function() {});
}
function updatePinUi(ticketId, ticketData) {
  _pinTicketId = ticketId || null;
  _pinTicketData = ticketData || null;
  var wrap = document.getElementById('ticketPinWrap');
  var check = document.getElementById('ticketPinCheck');
  var until = document.getElementById('ticketPinUntil');
  if (!wrap || !check || !until) return;
  if (!ticketId) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  check.checked = false;
  until.value = '';
  until.style.display = 'none';
  fetchJson('/api/pinned-tickets').then(function(pins) {
    var pin = (pins || []).find(function(p) { return Number(p.id) === Number(ticketId); }) || null;
    check.checked = !!pin;
    if (pin && pin.pinUntil) { until.value = pin.pinUntil; until.style.display = ''; }
  }).catch(function() {});
}

function presetValueSearchUrl(value) {
  return appUrl('/search.html?query=' + encodeURIComponent(String(value || '').trim()));
}

function renderPresetValueLink(value) {
  const label = String(value || '').trim();
  const safeLabel = escapeHtml(label);
  return '<a class="preset-value-link" href="' + escapeHtml(presetValueSearchUrl(label)) + '" target="_blank" rel="noopener noreferrer" title="Cerca ticket con ' + safeLabel + '">' +
    '<mark class="preset-value">' + safeLabel + '</mark></a>';
}

function highlightPresetValues(text) {
  return escapeHtml(text).replace(/ã€ˆ([^ã€‰]*)ã€‰/g, function(_, value) { return renderPresetValueLink(value); });
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
    personalMineChart: 'column',
    personalGroupChart: 'column',
    teamYear: 'donut',
    severityYear: 'bar'
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
  if (chartTypes && typeof chartTypes === 'object' && Object.keys(chartTypes).length) {
    const normalized = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      normalized[key] = normalizeChartType(chartTypes?.[key] || defaults[key]);
    });
    chartTypes = normalized;
    return chartTypes;
  }
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
  saveUserCharts().catch(console.error);
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
  const descTextarea = document.getElementById('description');
  const descRead = document.getElementById('descriptionRead');
  if (descTextarea) descTextarea.style.display = readMode ? 'none' : '';
  if (descRead) descRead.style.display = readMode ? '' : 'none';
  if (editFromReadBtn) editFromReadBtn.style.display = 'none';
}

function isGenericIncidentName(name) {
  return String(name || '').trim().toLowerCase() === 'generic';
}

function getIncidentBaseName(incidentId) {
  return String(incidentIdToNameMap[String(Number(incidentId || 0))] || '').trim();
}

function isGenericIncidentId(incidentId) {
  const id = String(Number(incidentId || 0));
  if (incidentIdToNameModeMap[id] === 'custom') return true;
  if (incidentIdToNameModeMap[id] === 'default') return false;
  return isGenericIncidentName(getIncidentBaseName(incidentId));
}

function updateTicketModalHeading(incidentId, customName) {
  const baseName = getIncidentBaseName(incidentId);
  if (!ticketModalTitle) return;
  if (isGenericIncidentId(incidentId)) {
    ticketModalTitle.textContent = String(customName || '').trim() || baseName || 'Nuovo Ticket';
    return;
  }
  ticketModalTitle.textContent = baseName || String(customName || '').trim() || 'Nuovo Ticket';
}

function syncCustomIncidentNameField(incidentId, currentName, readOnly) {
  const baseName = getIncidentBaseName(incidentId);
  const isGeneric = isGenericIncidentId(incidentId);
  if (!customIncidentNameGroup || !customIncidentNameInput) {
    updateTicketModalHeading(incidentId, currentName);
    return;
  }
  if (!isGeneric) {
    customIncidentNameGroup.style.display = 'none';
    customIncidentNameInput.required = false;
    customIncidentNameInput.readOnly = false;
    customIncidentNameInput.value = '';
    updateTicketModalHeading(incidentId, currentName);
    return;
  }
  customIncidentNameGroup.style.display = '';
  customIncidentNameInput.required = true;
  customIncidentNameInput.readOnly = Boolean(readOnly);
  customIncidentNameInput.value = isGenericIncidentName(currentName) ? '' : String(currentName || '').trim();
  updateTicketModalHeading(incidentId, customIncidentNameInput.value || baseName);
}

function getCustomIncidentNameForSubmit() {
  if (!customIncidentNameInput || !isGenericIncidentId(incidentTypeInput.value)) return '';
  return String(customIncidentNameInput.value || '').trim();
}

function syncSubmitBtnState() {
  if (!ticketSubmitBtn || ticketSubmitBusy || ticketForm.dataset.readMode === '1') return;
  const descEl = document.getElementById('description');
  const description = descEl.value.trim();
  const presetComplete = !getIncompletePresetFields(presetInlineComposer).length;
  const valid = !!Number(incidentTypeInput.value || 0)
    && !!description
    && presetComplete
    && !!fabValue.value
    && !!ticketTimestampInput.value
    && (!isGenericIncidentId(incidentTypeInput.value) || !!(customIncidentNameInput && customIncidentNameInput.value.trim()));
  ticketSubmitBtn.disabled = !valid;
}

if (customIncidentNameInput) {
  customIncidentNameInput.addEventListener('input', function () {
    updateTicketModalHeading(incidentTypeInput.value, customIncidentNameInput.value);
    syncSubmitBtnState();
  });
}

document.getElementById('description').addEventListener('input', syncSubmitBtnState);
if (ticketTimestampInput) ticketTimestampInput.addEventListener('input', syncSubmitBtnState);

function openTicketReadModal(ticket) {
  const item = ticket || {};
  editingTicketId = null;
  clearExtraTicketCards();
  incidentTypeInput.value = String(item.incidentId || '');
  syncCustomIncidentNameField(item.incidentId, item.incidentName || '', true);
  document.getElementById('description').value = String(item.description || '').replace(/ã€ˆ([^ã€‰]*)ã€‰/g, '$1');
  document.getElementById('description').readOnly = true;
  document.getElementById('description').style.display = '';
  document.getElementById('description').placeholder = '';
  const descReadEl = document.getElementById('descriptionRead');
  if (descReadEl) descReadEl.innerHTML = highlightPresetValues(String(item.description || ''));
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
  updatePinUi(item.ticketId || null, item);
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
    },
    titles: {
      personalMineChart: 'Ticket personali',
      personalGroupChart: 'Ticket gruppo',
      fabYear: 'Ticket per FAB',
      catYear: 'Ticket per categoria',
      teamYear: 'Ticket per Team',
      severityYear: 'Severity Ticket',
      userYear: 'Ticket Utenti'
    },
    settings: {
      personal_axis_max: 0,
      personal_axis_max_mine: 0,
      personal_axis_max_group: 0
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
  return out;
}

function getPersonalChartAxisMaxSetting(chartId) {
  const settings = (uiColors && uiColors.settings) ? uiColors.settings : {};
  const key = chartId === 'personalGroupChart' ? 'personal_axis_max_group' : 'personal_axis_max_mine';
  const axisMax = Number(settings[key] || 0);
  return Number.isFinite(axisMax) && axisMax > 0 ? Math.round(axisMax) : 0;
}

function getDashboardChartTitle(chartKey) {
  const defaults = defaultUiColors().titles;
  return String(uiColors?.titles?.[chartKey] || defaults[chartKey] || chartKey);
}

function applyDashboardChartTitles() {
  const titleMap = {
    personalMineChart: personalMineChartTitleText,
    personalGroupChart: personalGroupChartTitleText,
    fabYear: document.getElementById('fabYearChartTitle'),
    catYear: document.getElementById('catYearChartTitle'),
    teamYear: document.getElementById('teamYearChartTitle'),
    severityYear: document.getElementById('severityYearChartTitle'),
    userYear: document.getElementById('userYearChartTitle')
  };
  Object.keys(titleMap).forEach((key) => {
    if (titleMap[key]) titleMap[key].textContent = getDashboardChartTitle(key);
  });
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

const customChartGroupMap = {};

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
      return customChartGroupMap[normalizeChartKey(chartId)] || '';
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
  applyDashboardChartTitles();
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
  refreshCustomCharts();
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

function formatLocalDateStamp(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const pad = (value) => String(value).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
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

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error('Blob non disponibile'));
      return;
    }
    const reader = new FileReader();
    reader.onload = function() { resolve(String(reader.result || '')); };
    reader.onerror = function() { reject(new Error('Impossibile leggere il file generato')); };
    reader.readAsDataURL(blob);
  });
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

function buildChartCsv(title, stats) {
  const BOM = '﻿';
  const grandTotal = stats.reduce(function(s, item) { return s + Number(item.total || 0); }, 0);
  const e = function(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
  const now = new Date();
  const exportedAt = now.toLocaleDateString('it-IT') + ' ' + now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  // 3 colonne fisse: Etichetta | Totale | %
  const rows = [
    e('Grafico') + ',' + e(title || 'Grafico') + ',',
    e('Esportato il') + ',' + e(exportedAt) + ',',
    ',,',
    e('Etichetta') + ',' + e('Totale') + ',' + e('%')
  ];
  stats.forEach(function(item) {
    const pct = grandTotal > 0 ? (Math.round((Number(item.total || 0) / grandTotal) * 1000) / 10).toFixed(1) : '0.0';
    rows.push(e(item.label) + ',' + Number(item.total || 0) + ',' + pct + '%');
  });
  if (stats.length) rows.push(e('TOTALE') + ',' + grandTotal + ',100.0%');
  return BOM + rows.join('\r\n');
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

async function buildPersonalChartPngBlob(title, stats, meta) {
  const width = 1280;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const isDark = document.body.classList.contains('theme-dark');
  const bg = isDark ? '#101a2a' : '#ffffff';
  const panel = isDark ? '#16253a' : '#f7fbff';
  const textColor = isDark ? '#e6eef9' : '#17202f';
  const muted = isDark ? '#9db1c9' : '#5c6b7d';
  const grid = isDark ? 'rgba(157,177,201,.18)' : 'rgba(55,80,111,.14)';
  const lineColor = isDark ? '#2ec4d6' : '#0c5f8c';
  const pointColor = isDark ? '#7dd3fc' : '#16a0b6';
  const targetColor = isDark ? '#f59e0b' : '#d97706';
  const monthlyTarget = Number(meta && meta.targetMonthly ? meta.targetMonthly : 0);
  const annualTarget = Number(meta && meta.targetAnnual ? meta.targetAnnual : 0);
  const values = Array.isArray(stats) ? stats.map((item) => Number(item.total || 0)) : [];
  const maxVal = Math.max.apply(Math, values.concat([monthlyTarget || 0, annualTarget || 0, 1]));
  const padL = 110;
  const padR = 70;
  const padT = 120;
  const padB = 110;
  const usableW = width - padL - padR;
  const usableH = height - padT - padB;
  const count = Math.max((stats || []).length, 2);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = panel;
  ctx.fillRect(24, 24, width - 48, height - 48);

  ctx.fillStyle = textColor;
  ctx.font = '700 30px Segoe UI, sans-serif';
  ctx.fillText(title || 'Ticket personali', 56, 70);
  ctx.fillStyle = muted;
  ctx.font = '600 18px Segoe UI, sans-serif';
  ctx.fillText((meta && meta.username ? meta.username + ' - ' : '') + 'Andamento mensile e target', 56, 98);

  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padT + ((usableH / 5) * i);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - padR, y);
    ctx.stroke();
    const tick = Math.round(maxVal - ((maxVal / 5) * i));
    ctx.fillStyle = muted;
    ctx.font = '600 18px Segoe UI, sans-serif';
    ctx.fillText(String(tick), 56, y + 6);
  }

  const points = (stats || []).map((item, index) => {
    const x = padL + ((usableW * index) / (count - 1));
    const y = padT + usableH - ((Number(item.total || 0) / maxVal) * usableH);
    return { x, y, item };
  });

  if (monthlyTarget > 0) {
    const targetY = padT + usableH - ((monthlyTarget / maxVal) * usableH);
    ctx.strokeStyle = targetColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(padL, targetY);
    ctx.lineTo(width - padR, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = targetColor;
    ctx.font = '700 18px Segoe UI, sans-serif';
    ctx.fillText('Target mensile ' + monthlyTarget, width - padR - 180, targetY - 10);
  }

  if (points.length) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  points.forEach((point) => {
    ctx.fillStyle = pointColor;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = '700 18px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(point.item.total || 0), point.x, point.y - 16);
    ctx.fillStyle = muted;
    ctx.font = '600 18px Segoe UI, sans-serif';
    ctx.fillText(String(point.item.label || ''), point.x, height - 58);
  });
  ctx.textAlign = 'start';

  ctx.fillStyle = muted;
  ctx.font = '600 18px Segoe UI, sans-serif';
  ctx.fillText('Target annuale: ' + annualTarget, 56, height - 42);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

function chartModeLabel(mode) {
  if (mode === 'day') return 'Ultime 24 ore';
  if (mode === 'months') return 'Anno completo';
  return String(mode || '').toUpperCase();
}

// ── Report ────────────────────────────────────────────────────────────────────

const REPORT_BTN_HTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>Report';

function openReportModal() {
  const overlay = document.createElement('div');
  overlay.className = 'report-modal-overlay';
  const panel = document.createElement('div');
  panel.className = 'report-modal-panel';

  // ── Header ──
  const header = document.createElement('div');
  header.className = 'report-modal-header';
  const titleEl = document.createElement('h3');
  titleEl.textContent = 'Genera Report';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'report-modal-close';
  closeBtn.setAttribute('aria-label', 'Chiudi');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeOverlay);
  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  // ── Periodo ──
  var selectedPeriod = 'month';
  var customFrom = '';
  var customTo = '';

  function getPeriodDates() {
    const now = new Date();
    const pad = function(n) { return String(n).padStart(2, '0'); };
    const fmt = function(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    if (selectedPeriod === 'today') {
      const s = fmt(now);
      return { from: s, to: s, label: 'Oggi (' + s + ')' };
    }
    if (selectedPeriod === 'week') {
      const day = now.getDay() || 7;
      const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { from: fmt(mon), to: fmt(sun), label: 'Questa settimana' };
    }
    if (selectedPeriod === 'month') {
      const from = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-01';
      return { from: from, to: fmt(now), label: 'Questo mese' };
    }
    if (selectedPeriod === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      const qFrom = new Date(now.getFullYear(), q * 3, 1);
      return { from: fmt(qFrom), to: fmt(now), label: 'Questo trimestre' };
    }
    if (selectedPeriod === 'year') {
      return { from: now.getFullYear() + '-01-01', to: fmt(now), label: 'Quest\'anno' };
    }
    return { from: customFrom, to: customTo, label: (customFrom || '?') + ' → ' + (customTo || '?') };
  }

  const periodSection = document.createElement('div');
  periodSection.style.cssText = 'margin-bottom:14px';
  const periodLabel = document.createElement('p');
  periodLabel.className = 'report-modal-section-label';
  periodLabel.textContent = 'Periodo';
  const periodPresets = document.createElement('div');
  periodPresets.className = 'report-preset-row';

  const presets = [
    { value: 'today', label: 'Oggi' },
    { value: 'week', label: 'Settimana' },
    { value: 'month', label: 'Mese' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Anno' },
    { value: 'custom', label: 'Custom' }
  ];

  const customDateRow = document.createElement('div');
  customDateRow.className = 'report-period-row';
  customDateRow.style.cssText = 'display:none;margin-top:8px';
  const dateFromInput = document.createElement('input');
  dateFromInput.type = 'date';
  dateFromInput.className = 'report-date-input';
  const dateToInput = document.createElement('input');
  dateToInput.type = 'date';
  dateToInput.className = 'report-date-input';
  const nowD = new Date();
  dateFromInput.value = nowD.getFullYear() + '-01-01';
  dateToInput.value = nowD.toISOString().split('T')[0];
  customFrom = dateFromInput.value;
  customTo = dateToInput.value;
  dateFromInput.addEventListener('change', function() { customFrom = dateFromInput.value; });
  dateToInput.addEventListener('change', function() { customTo = dateToInput.value; });
  const periodSep = document.createElement('span');
  periodSep.className = 'report-period-sep';
  periodSep.textContent = '→';
  customDateRow.appendChild(dateFromInput);
  customDateRow.appendChild(periodSep);
  customDateRow.appendChild(dateToInput);

  presets.forEach(function(pr) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'report-preset-btn' + (pr.value === selectedPeriod ? ' active' : '');
    btn.textContent = pr.label;
    btn.dataset.period = pr.value;
    btn.addEventListener('click', function() {
      selectedPeriod = pr.value;
      periodPresets.querySelectorAll('.report-preset-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.period === pr.value);
      });
      customDateRow.style.display = pr.value === 'custom' ? 'flex' : 'none';
    });
    periodPresets.appendChild(btn);
  });

  periodSection.appendChild(periodLabel);
  periodSection.appendChild(periodPresets);
  periodSection.appendChild(customDateRow);

  // ── Analisi per ──
  var selectedDimension = 'category';
  const dimSection = document.createElement('div');
  dimSection.style.cssText = 'margin-bottom:14px';
  const dimLabel = document.createElement('p');
  dimLabel.className = 'report-modal-section-label';
  dimLabel.textContent = 'Analisi per';
  const dimRow = document.createElement('div');
  dimRow.className = 'report-format-row';
  const dimensions = [
    { value: 'category', label: 'Categoria' },
    { value: 'incident', label: 'Incident' },
    { value: 'fab', label: 'FAB' }
  ];
  dimensions.forEach(function(d) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'report-format-btn' + (d.value === selectedDimension ? ' active' : '');
    btn.textContent = d.label;
    btn.dataset.dim = d.value;
    btn.addEventListener('click', function() {
      selectedDimension = d.value;
      dimRow.querySelectorAll('.report-format-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.dim === d.value);
      });
    });
    dimRow.appendChild(btn);
  });
  dimSection.appendChild(dimLabel);
  dimSection.appendChild(dimRow);

  // ── Formato ──
  var selectedFormat = 'ppt';
  const fmtSection = document.createElement('div');
  fmtSection.style.cssText = 'margin-bottom:20px';
  const fmtLabel = document.createElement('p');
  fmtLabel.className = 'report-modal-section-label';
  fmtLabel.textContent = 'Formato';
  const fmtRow = document.createElement('div');
  fmtRow.className = 'report-format-row';
  const formats = [
    { value: 'ppt', label: 'PowerPoint (.pptx)' },
    { value: 'csv', label: 'CSV (.csv)' }
  ];
  formats.forEach(function(f) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'report-format-btn' + (f.value === selectedFormat ? ' active' : '');
    btn.textContent = f.label;
    btn.dataset.fmt = f.value;
    btn.addEventListener('click', function() {
      selectedFormat = f.value;
      fmtRow.querySelectorAll('.report-format-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.fmt === f.value);
      });
    });
    fmtRow.appendChild(btn);
  });
  fmtSection.appendChild(fmtLabel);
  fmtSection.appendChild(fmtRow);

  // ── Azioni ──
  const actions = document.createElement('div');
  actions.className = 'report-modal-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Annulla';
  cancelBtn.addEventListener('click', closeOverlay);
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'primary';
  confirmBtn.textContent = 'Genera →';
  confirmBtn.addEventListener('click', function() {
    const dates = getPeriodDates();
    if (!dates.from || !dates.to) { showToast('Seleziona una data di inizio e fine valide prima di generare il report.', 'warning', 'Periodo non valido'); return; }
    closeOverlay();
    const dimLabels = { category: 'Categoria', incident: 'Incident', fab: 'FAB' };
    const cfg = {
      dateFrom: dates.from,
      dateTo: dates.to,
      periodLabel: dates.label,
      dimension: selectedDimension,
      dimensionLabel: dimLabels[selectedDimension] || selectedDimension
    };
    if (selectedFormat === 'csv') {
      generateCsvReport(cfg).catch(console.error);
    } else {
      generatePowerPointReport(cfg).catch(console.error);
    }
  });
  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);

  panel.appendChild(header);
  panel.appendChild(periodSection);
  panel.appendChild(dimSection);
  panel.appendChild(fmtSection);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeOverlay(); });

  function closeOverlay() { overlay.remove(); }
}

function buildTopBarsAnalysis(stats, topN) {
  if (!stats || !stats.length) return ['Dati non disponibili.'];
  const sorted = stats.slice().sort(function(a, b) { return (b.total || 0) - (a.total || 0); });
  return sorted.slice(0, topN).map(function(s) {
    return (s.label || '—') + ': ' + (s.total || 0) + ' ticket';
  });
}

function buildRecurringIncidentsAnalysis(tickets, topN) {
  if (!tickets || !tickets.length) return ['Nessun ticket nel periodo selezionato.'];
  const counts = {};
  tickets.forEach(function(t) {
    const name = (t.incident_name || '').trim();
    if (!name) return;
    counts[name] = (counts[name] || 0) + 1;
  });
  const recurring = Object.keys(counts)
    .filter(function(name) { return counts[name] > 1; })
    .sort(function(a, b) { return counts[b] - counts[a]; })
    .slice(0, topN);
  if (!recurring.length) return ['Nessuna problematica ricorrente nel periodo.'];
  return recurring.map(function(name) { return name + ' (' + counts[name] + ' occorrenze)'; });
}

function _buildIncidentCategoryMap(meta) {
  const map = {};
  ((meta && meta.incidents) || []).forEach(function(inc) {
    const catName = inc.category_name || '';
    if (!catName) return;
    if (inc.id)   map[String(inc.id)]   = catName;
    if (inc.name) map[String(inc.name)] = catName;
  });
  return map;
}

function _aggregateBy(tickets, keyFn) {
  const counts = {};
  tickets.forEach(function(t) { const k = keyFn(t); counts[k] = (counts[k] || 0) + 1; });
  return Object.keys(counts).map(function(k) { return { label: k, total: counts[k] }; }).sort(function(a, b) { return b.total - a.total; });
}

function aggregateTicketsByDimension(tickets, dimension, meta) {
  if (dimension === 'category') {
    const catMap = _buildIncidentCategoryMap(meta);
    return _aggregateBy(tickets, function(t) {
      return catMap[String(t.incident_id)] || catMap[String(t.incident_name || '')] || 'Altro';
    });
  }
  if (dimension === 'incident') {
    return _aggregateBy(tickets, function(t) { return (t.incident_name || 'N/D').trim(); });
  }
  return _aggregateBy(tickets, function(t) { return (t.fab || 'N/D').trim(); });
}

async function generatePowerPointReport(cfg) {
  if (typeof window.PptxGenJS !== 'function') {
    showToast('Il modulo PowerPoint non è stato caricato correttamente. Prova a ricaricare la pagina.', 'error', 'Funzione non disponibile');
    return;
  }
  if (generatePptReportBtn) {
    generatePptReportBtn.disabled = true;
    generatePptReportBtn.textContent = 'Generazione...';
  }
  try {
    let periodTickets = [];
    try {
      const sd = await fetchJson('/api/tickets/search?from=' + encodeURIComponent(cfg.dateFrom) + '&to=' + encodeURIComponent(cfg.dateTo) + '&query=');
      periodTickets = Array.isArray(sd.tickets) ? sd.tickets : [];
    } catch (e) { periodTickets = []; }

    const meta = await fetchMeta();
    const stats = aggregateTicketsByDimension(periodTickets, cfg.dimension, meta);
    const total = periodTickets.length;

    const deck = new window.PptxGenJS();
    deck.layout = 'LAYOUT_WIDE';
    deck.title = 'ProdOps Report · ' + cfg.periodLabel;

    const isDark = document.body.classList.contains('theme-dark');
    const slideBg     = isDark ? '0F1B2D' : 'FFFFFF';
    const headerBg    = isDark ? '0C4A6E' : '0C5F8C';
    const headerMuted = isDark ? 'A5C8E1' : 'BFE0F5';
    const panelBg     = isDark ? '162236' : 'EFF6FC';
    const borderColor = isDark ? '253A52' : 'C9DCF0';
    const titleColor  = isDark ? 'E6EEF9' : '111827';
    const mutedColor  = isDark ? '9DB1C9' : '6B7280';
    const accentBlue  = isDark ? '38BDF8' : '0C5F8C';
    const accentTeal  = isDark ? '2EC4D6' : '0891B2';
    const accentOrange= isDark ? 'FBBF24' : 'B45309';
    const footerBg    = isDark ? '0A1422' : 'E2EDF6';
    const footerText  = isDark ? '4B6580' : '7A96AE';

    const createdAt = new Date();
    const fileDate = formatLocalDateStamp(createdAt);
    const generatedLabel = createdAt.toLocaleString('it-IT');

    function addFooter(slide, n, tot) {
      slide.addShape('rect', { x: 0, y: 7.22, w: 13.33, h: 0.28, fill: { color: footerBg }, line: { color: footerBg } });
      slide.addText(
        'ProdOps Dashboard  ·  ' + cfg.periodLabel +
        (currentUser && currentUser.username ? '  ·  ' + currentUser.username : '') +
        '  ·  ' + generatedLabel,
        { x: 0.25, y: 7.22, w: 11.8, h: 0.28, fontSize: 7, color: footerText, valign: 'middle' }
      );
      slide.addText(n + ' / ' + tot, { x: 12.7, y: 7.22, w: 0.4, h: 0.28, fontSize: 7, color: footerText, valign: 'middle', align: 'right' });
    }

    // ── SLIDE 1: COVER ──
    const cover = deck.addSlide();
    cover.background = { color: slideBg };
    cover.addShape('rect', { x: 0, y: 0, w: 4.5, h: 7.5, fill: { color: headerBg }, line: { color: headerBg } });
    cover.addShape('rect', { x: 4.5, y: 0, w: 0.035, h: 7.5, fill: { color: accentTeal }, line: { color: accentTeal } });
    cover.addText('PRODOPS', { x: 0.4, y: 0.9, w: 3.7, h: 0.65, fontSize: 32, bold: true, color: 'FFFFFF', charSpacing: 4 });
    cover.addText('Report Dashboard', { x: 0.4, y: 1.6, w: 3.7, h: 0.38, fontSize: 15, color: headerMuted });
    cover.addShape('rect', { x: 0.4, y: 2.18, w: 3.0, h: 0.025, fill: { color: headerMuted }, line: { color: headerMuted } });
    cover.addText('PERIODO', { x: 0.4, y: 2.45, w: 3.7, h: 0.22, fontSize: 7.5, color: headerMuted, bold: true, charSpacing: 1.5 });
    cover.addText(cfg.periodLabel, { x: 0.4, y: 2.7, w: 3.7, h: 0.38, fontSize: 13, color: 'FFFFFF', bold: true });
    cover.addText('ANALISI PER', { x: 0.4, y: 3.22, w: 3.7, h: 0.22, fontSize: 7.5, color: headerMuted, bold: true, charSpacing: 1.5 });
    cover.addText(cfg.dimensionLabel, { x: 0.4, y: 3.47, w: 3.7, h: 0.38, fontSize: 13, color: 'FFFFFF', bold: true });
    cover.addText('GENERATO IL', { x: 0.4, y: 3.99, w: 3.7, h: 0.22, fontSize: 7.5, color: headerMuted, bold: true, charSpacing: 1.5 });
    cover.addText(generatedLabel, { x: 0.4, y: 4.24, w: 3.7, h: 0.3, fontSize: 10.5, color: 'FFFFFF' });
    if (currentUser && currentUser.username) {
      cover.addText('UTENTE', { x: 0.4, y: 4.72, w: 3.7, h: 0.22, fontSize: 7.5, color: headerMuted, bold: true, charSpacing: 1.5 });
      cover.addText(currentUser.username, { x: 0.4, y: 4.97, w: 3.7, h: 0.35, fontSize: 14, color: 'FFFFFF', bold: true });
    }
    cover.addText('Ticket nel periodo: ' + total, { x: 0.4, y: 6.7, w: 3.7, h: 0.28, fontSize: 9.5, color: headerMuted, italic: true });

    cover.addText('RIEPILOGO ESECUTIVO', { x: 4.85, y: 0.45, w: 8.2, h: 0.3, fontSize: 8.5, color: accentBlue, bold: true, charSpacing: 1.5 });
    cover.addShape('rect', { x: 4.85, y: 0.82, w: 8.2, h: 0.022, fill: { color: borderColor }, line: { color: borderColor } });
    const kpiData = [{ label: 'Ticket totali nel periodo', value: String(total) }]
      .concat(stats.slice(0, 3).map(function(s, i) {
        return { label: (i + 1) + '° per ' + cfg.dimensionLabel, value: s.label + ' (' + s.total + ' ticket)' };
      }));
    if (stats.length > 3) kpiData.push({ label: 'Voci distinte analizzate', value: String(stats.length) });
    kpiData.forEach(function(kpi, idx) {
      const ky = 1.0 + idx * 0.56;
      cover.addShape('rect', { x: 4.85, y: ky, w: 8.2, h: 0.5, fill: { color: panelBg }, line: { color: borderColor, width: 0.5 } });
      cover.addText(kpi.label.toUpperCase(), { x: 5.05, y: ky + 0.04, w: 7.9, h: 0.18, fontSize: 7, color: mutedColor, bold: true, charSpacing: 0.5 });
      cover.addText(kpi.value, { x: 5.05, y: ky + 0.24, w: 7.9, h: 0.22, fontSize: 11, color: titleColor, bold: true });
    });
    const recY = 1.0 + kpiData.length * 0.56 + 0.22;
    cover.addText('PROBLEMATICHE RICORRENTI', { x: 4.85, y: recY, w: 8.2, h: 0.28, fontSize: 8.5, color: accentOrange, bold: true, charSpacing: 1.5 });
    cover.addShape('rect', { x: 4.85, y: recY + 0.3, w: 8.2, h: 0.022, fill: { color: borderColor }, line: { color: borderColor } });
    buildRecurringIncidentsAnalysis(periodTickets, 5).forEach(function(line, idx) {
      cover.addText((idx + 1) + '.   ' + line, { x: 4.85, y: recY + 0.42 + idx * 0.3, w: 8.2, h: 0.26, fontSize: 10, color: titleColor });
    });
    addFooter(cover, 1, 2);

    // ── SLIDE 2: ANALISI ──
    const slide = deck.addSlide();
    slide.background = { color: slideBg };
    const slideTitle = 'Ticket per ' + cfg.dimensionLabel + ' · ' + cfg.periodLabel;
    slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.52, fill: { color: headerBg }, line: { color: headerBg } });
    slide.addText(slideTitle.toUpperCase(), { x: 0.25, y: 0, w: 9.5, h: 0.52, color: 'FFFFFF', bold: true, fontSize: 12, valign: 'middle', charSpacing: 1 });
    slide.addText(String(total) + ' ticket totali', { x: 9.8, y: 0, w: 3.3, h: 0.52, color: headerMuted, fontSize: 9, align: 'right', valign: 'middle' });
    slide.addShape('rect', { x: 0, y: 0.52, w: 13.33, h: 0.025, fill: { color: accentTeal }, line: { color: accentTeal } });
    slide.addShape('rect', { x: 7.88, y: 0.55, w: 5.45, h: 6.65, fill: { color: panelBg }, line: { color: panelBg } });
    slide.addShape('rect', { x: 7.88, y: 0.55, w: 0.025, h: 6.65, fill: { color: borderColor }, line: { color: borderColor } });

    const imgBlob = await buildChartPngBlob('Ticket per ' + cfg.dimensionLabel, stats.slice(0, 15));
    if (imgBlob) {
      const imgData = await blobToDataUrl(imgBlob);
      slide.addImage({ data: imgData, x: 0.22, y: 0.64, w: 7.52, h: 5.52 });
    }

    slide.addText('RANKING', { x: 8.05, y: 0.66, w: 5.1, h: 0.24, fontSize: 7.5, color: accentBlue, bold: true, charSpacing: 1.5 });
    stats.slice(0, 12).forEach(function(s, i) {
      const y = 0.95 + i * 0.45;
      if (y > 6.9) return;
      const pct = total > 0 ? ' · ' + Math.round((s.total / total) * 100) + '%' : '';
      slide.addText((i + 1) + '.  ' + s.label + ': ' + s.total + ' ticket' + pct, {
        x: 8.05, y: y, w: 5.1, h: 0.38, fontSize: 9, color: i < 3 ? titleColor : mutedColor, bold: i < 3
      });
    });

    const sepY = 0.95 + Math.min(12, stats.length) * 0.45 + 0.1;
    if (sepY < 6.5) {
      slide.addShape('rect', { x: 8.05, y: sepY, w: 5.08, h: 0.018, fill: { color: borderColor }, line: { color: borderColor } });
      slide.addText('INCIDENT PIÙ FREQUENTI', { x: 8.05, y: sepY + 0.07, w: 5.1, h: 0.24, fontSize: 7.5, color: accentOrange, bold: true, charSpacing: 1.5 });
      buildRecurringIncidentsAnalysis(periodTickets, 4).forEach(function(rec, ri) {
        const ry = sepY + 0.38 + ri * 0.28;
        if (ry > 7.0) return;
        slide.addText('·  ' + rec, { x: 8.05, y: ry, w: 5.1, h: 0.26, fontSize: 9, color: titleColor });
      });
    }
    addFooter(slide, 2, 2);

    await deck.writeFile({ fileName: 'ProdOps_Report_' + fileDate + '.pptx', compression: true });
  } catch (err) {
    console.error(err);
    showToast('Si è verificato un errore durante la creazione del file PowerPoint. Verifica i dati selezionati e riprova.', 'error', 'Generazione report fallita');
  } finally {
    if (generatePptReportBtn) {
      generatePptReportBtn.disabled = false;
      generatePptReportBtn.innerHTML = REPORT_BTN_HTML;
    }
  }
}

async function generateCsvReport(cfg) {
  let periodTickets = [];
  try {
    const sd = await fetchJson('/api/tickets/search?from=' + encodeURIComponent(cfg.dateFrom) + '&to=' + encodeURIComponent(cfg.dateTo) + '&query=');
    periodTickets = Array.isArray(sd.tickets) ? sd.tickets : [];
  } catch (e) { periodTickets = []; }

  const meta = await fetchMeta();
  const stats = aggregateTicketsByDimension(periodTickets, cfg.dimension, meta);
  const total = periodTickets.length;
  const now = new Date();
  const stamp = formatLocalDateStamp(now);
  const generatedAt = now.toLocaleString('it-IT');
  const BOM = '﻿';
  const csvEsc = function(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"'; };
  const catMap = _buildIncidentCategoryMap(meta);

  // Tutte le righe hanno 10 colonne (il numero massimo del dettaglio ticket)
  const COLS = 10;
  const pad = function(arr) {
    while (arr.length < COLS) arr.push('');
    return arr.map(function(v) { return csvEsc(v == null ? '' : v); }).join(',');
  };
  const sep = pad([]); // riga vuota da 10 celle

  // ── Intestazione report ──────────────────────────────────────────────────
  const rows = [
    pad(['REPORT PRODOPS']),
    sep,
    pad(['Periodo', cfg.periodLabel]),
    pad(['Dimensione', cfg.dimensionLabel]),
    pad(['Ticket totali', String(total)]),
    pad(['Generato il', generatedAt]),
    sep,
    // ── Tabella riepilogo ────────────────────────────────────────────────
    pad(['RIEPILOGO PER ' + String(cfg.dimensionLabel).toUpperCase()]),
    pad(['Rank', 'Etichetta', 'Ticket', '% sul totale'])
  ];
  stats.forEach(function(item, i) {
    const pct = total > 0 ? (Math.round((item.total / total) * 1000) / 10).toFixed(1) : '0.0';
    rows.push(pad([String(i + 1), String(item.label || ''), String(item.total), pct + '%']));
  });
  rows.push(pad(['TOTALE', '', String(total), '100.0%']));
  rows.push(sep);
  // ── Tabella dettaglio ticket ─────────────────────────────────────────
  rows.push(pad(['DETTAGLIO TICKET']));
  rows.push(pad(['ID', 'Data', 'Ora', 'Categoria', 'Incident', 'FAB', 'Severità', 'Team', 'Utente', 'Descrizione']));
  periodTickets.slice().sort(function(a, b) {
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  }).forEach(function(t) {
    const dt = t.created_at ? new Date(t.created_at.replace(' ', 'T')) : null;
    const dateStr = dt && !isNaN(dt) ? dt.toLocaleDateString('it-IT') : (t.created_at || '');
    const timeStr = dt && !isNaN(dt) ? dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
    const category = catMap[String(t.incident_id || '')] || catMap[String(t.incident_name || '')] || 'N/D';
    rows.push(pad([
      String(t.id || ''), dateStr, timeStr, category,
      String(t.incident_name || ''), String(t.fab || ''),
      String(t.severity || 1), String(t.owner_team || ''),
      String(t.owner_username || ''), String(t.description || '')
    ]));
  });

  triggerDownload('ProdOps_Report_' + stamp + '.csv', BOM + rows.join('\r\n'), 'text/csv;charset=utf-8');
}

async function exportChart(targetId, format) {
  const payload = getChartExportPayload(targetId);
  if (!payload || !payload.stats.length) {
    showToast('Non ci sono dati per il periodo selezionato. Seleziona un intervallo diverso o un altro FAB.', 'warning', 'Nessun dato disponibile');
    return;
  }
  const fileRoot = sanitizeFileNamePart(payload.title || targetId) || targetId;
  const stamp = formatLocalDateStamp(new Date());
  if (format === 'csv') {
    triggerDownload(fileRoot + '_' + stamp + '.csv', buildChartCsv(payload.title, payload.stats), 'text/csv;charset=utf-8');
    return;
  }
  if (format === 'xls') {
    triggerDownload(fileRoot + '_' + stamp + '.xls', buildChartXls(payload.title, payload.stats), 'application/vnd.ms-excel;charset=utf-8');
    return;
  }
  if (format === 'png') {
    const blob = await buildChartPngBlob(payload.title, payload.stats);
    if (!blob) {
      showToast('Impossibile creare l\'immagine PNG. Verifica che il browser supporti questa funzione.', 'error', 'Esportazione fallita');
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
  updatePinUi(null, null);
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
  if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀';
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
    updateSingleTicketModalHeight();
  });
}

function updateSingleTicketModalHeight() {
  if (!modal || !mainTicketPanel || window.matchMedia('(max-width: 640px)').matches) {
    if (modal) modal.classList.remove('single-ticket-tall');
    return;
  }
  const extraCount = extraTicketModals ? extraTicketModals.querySelectorAll('.extra-ticket-modal').length : 0;
  if (extraCount > 0 || !modal.classList.contains('show')) {
    modal.classList.remove('single-ticket-tall');
    return;
  }
  const header = mainTicketPanel.querySelector('.modal-header');
  const form = mainTicketPanel.querySelector('.ticket-form');
  if (!form) {
    modal.classList.remove('single-ticket-tall');
    return;
  }
  const availableHeight = window.innerHeight - 32;
  const contentHeight = (header ? header.offsetHeight : 0) + form.scrollHeight;
  modal.classList.toggle('single-ticket-tall', contentHeight > availableHeight - 8);
}

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
  modal.classList.remove('single-ticket-tall');
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
    modal.style.gridTemplateColumns = 'minmax(620px, 620px)';
    modal.style.alignItems = 'center';
    requestAnimationFrame(updateSingleTicketModalHeight);
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
  requestAnimationFrame(updateSingleTicketModalHeight);
  positionAddSameIncidentBtn();
}

function clearExtraTicketCards() {
  if (extraTicketModals) extraTicketModals.innerHTML = '';
  extraTicketCounter = 0;
  applyMultiModalLayout();
  setTicketSubmitState(false);
}

function makeSearchableSelect(select) {
  if (select.dataset.sdInit) return { update: function() {} };
  select.dataset.sdInit = '1';

  var placeholderText = '';
  var proposeOpt = null;
  var allItems = [];

  function syncItems() {
    allItems = [];
    proposeOpt = null;
    placeholderText = '';
    for (var i = 0; i < select.options.length; i++) {
      var o = select.options[i];
      if (o.dataset && o.dataset.separator) continue;
      if (!o.value) { placeholderText = o.textContent; continue; }
      if (o.value === '__propose_new__') { proposeOpt = { value: o.value, text: o.textContent }; continue; }
      allItems.push({ value: o.value, text: o.textContent });
    }
  }
  syncItems();

  var wrapper = document.createElement('div');
  wrapper.className = 'sd-wrap';

  var trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sd-trigger';

  var triggerLabel = document.createElement('span');
  triggerLabel.className = 'sd-label sd-placeholder';

  var triggerArrow = document.createElement('span');
  triggerArrow.className = 'sd-arrow';
  triggerArrow.setAttribute('aria-hidden', 'true');

  trigger.appendChild(triggerLabel);
  trigger.appendChild(triggerArrow);

  var panel = document.createElement('div');
  panel.className = 'sd-panel';
  panel.hidden = true;

  var search = document.createElement('input');
  search.type = 'search';
  search.className = 'sd-search';
  search.placeholder = 'Cerca...';
  search.setAttribute('aria-label', 'Cerca nelle opzioni');

  var list = document.createElement('ul');
  list.className = 'sd-list';
  list.setAttribute('role', 'listbox');

  panel.appendChild(search);
  panel.appendChild(list);
  wrapper.appendChild(trigger);
  wrapper.appendChild(panel);

  function getScrollHost() {
    var el = wrapper.parentNode;
    while (el && el !== document.body) {
      if (el.nodeType === 1) {
        var oy = window.getComputedStyle(el).overflowY;
        if (oy === 'auto' || oy === 'scroll') return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  // Reserve scroll room on the modal itself (not on the field wrapper), so the
  // modal grows/scrolls to show the open panel without stretching the preset box.
  function syncOpenSpacing() {
    var host = getScrollHost();
    if (!host) return;
    host.style.paddingBottom = '';
    if (panel.hidden) return;
    var overflow = panel.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom;
    if (overflow > 0) {
      host.style.paddingBottom = Math.ceil(overflow + 16) + 'px';
    }
  }

  function updateTriggerLabel() {
    var val = select.value;
    if (!val) {
      triggerLabel.textContent = placeholderText || 'Seleziona...';
      triggerLabel.classList.add('sd-placeholder');
    } else {
      var found = allItems.find(function(o) { return o.value === val; }) ||
        Array.from(select.options).find(function(o) { return o.value === val; });
      triggerLabel.textContent = found ? (found.text || found.textContent) : val;
      triggerLabel.classList.remove('sd-placeholder');
    }
  }

  function renderList(q) {
    list.innerHTML = '';
    if (proposeOpt) {
      var li2 = document.createElement('li');
      li2.className = 'sd-option sd-propose';
      li2.dataset.value = proposeOpt.value;
      li2.textContent = proposeOpt.text;
      li2.setAttribute('role', 'option');
      li2.addEventListener('mousedown', function(e) {
        e.preventDefault();
        select.value = '__propose_new__';
        select.dispatchEvent(new Event('input', { bubbles: true }));
        closePanel();
        setTimeout(updateTriggerLabel, 80);
      });
      list.appendChild(li2);
      var sep = document.createElement('li');
      sep.className = 'sd-separator';
      sep.setAttribute('aria-hidden', 'true');
      list.appendChild(sep);
    }
    var filtered = q ? allItems.filter(function(o) { return o.text.toLowerCase().includes(q); }) : allItems;
    if (!filtered.length) {
      var empty = document.createElement('li');
      empty.className = 'sd-empty';
      empty.textContent = 'Nessun risultato';
      list.appendChild(empty);
    }
    filtered.forEach(function(item) {
      var li = document.createElement('li');
      li.className = 'sd-option' + (item.value === select.value ? ' sd-selected' : '');
      li.dataset.value = item.value;
      li.textContent = item.text;
      li.setAttribute('role', 'option');
      li.addEventListener('mousedown', function(e) {
        e.preventDefault();
        select.value = item.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        updateTriggerLabel();
        closePanel();
      });
      list.appendChild(li);
    });
  }

  function openPanel() {
    syncItems();
    panel.hidden = false;
    wrapper.setAttribute('aria-expanded', 'true');
    search.value = '';
    renderList('');
    requestAnimationFrame(function() {
      syncOpenSpacing();
      updateSingleTicketModalHeight();
    });
    search.focus();
  }

  function closePanel() {
    panel.hidden = true;
    wrapper.setAttribute('aria-expanded', 'false');
    syncOpenSpacing();
    updateSingleTicketModalHeight();
  }

  trigger.addEventListener('click', function() {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  search.addEventListener('input', function() {
    renderList(search.value.trim().toLowerCase());
    requestAnimationFrame(function() {
      syncOpenSpacing();
      updateSingleTicketModalHeight();
    });
  });

  search.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closePanel(); trigger.focus(); }
  });

  document.addEventListener('mousedown', function(e) {
    if (!wrapper.contains(e.target)) closePanel();
  }, true);

  select.style.display = 'none';
  select.parentNode.insertBefore(wrapper, select);
  updateTriggerLabel();

  select._sdSyncTrigger = function() { syncItems(); updateTriggerLabel(); };
  return { update: updateTriggerLabel };
}

function presetFieldKey(label) {
  return String(label || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
}

async function loadDbPresetOptions(token, select, initialValue) {
  try {
    const fieldKey = presetFieldKey(token.label);
    const data = await fetchJson(`/api/preset-options?field_key=${encodeURIComponent(fieldKey)}`);
    const optionMap = {};
    const pendingSet = {};
    (data.pending || []).forEach((option) => {
      const value = String(option || '').trim();
      if (value === '') return;
      pendingSet[value.toLocaleLowerCase('it')] = true;
    });
    [...(token.options || []), ...(data.options || []), ...(data.pending || [])].forEach((option) => {
      const value = String(option || '').trim();
      if (value === '') return;
      const key = value.toLocaleLowerCase('it');
      if (!optionMap[key]) optionMap[key] = value;
    });
    const options = Object.keys(optionMap).map((key) => optionMap[key])
      .sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    const currentValue = initialValue || select.value;
    const renderOptions = (filter = '') => {
      const query = String(filter || '').trim().toLocaleLowerCase('it');
      const filtered = query ? options.filter((option) => option.toLocaleLowerCase('it').includes(query)) : options;
      select.innerHTML = '';
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = filtered.length ? `Seleziona ${token.label || ''}`.trim() : 'Nessun elemento trovato';
      empty.disabled = true;
      empty.hidden = true;
      empty.selected = true;
      select.appendChild(empty);
      const propose = document.createElement('option');
      propose.value = '__propose_new__';
      propose.textContent = '+ Proponi nuovo elemento';
      select.appendChild(propose);
      const separator = document.createElement('option');
      separator.value = '';
      separator.disabled = true;
      separator.dataset.separator = '1';
      separator.textContent = '──────────';
      select.appendChild(separator);
      filtered.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = pendingSet[opt.toLocaleLowerCase('it')] ? `${opt} (in revisione)` : opt;
        select.appendChild(option);
      });
      if (filtered.includes(currentValue)) select.value = currentValue;
    };

    renderOptions();
    makeSearchableSelect(select);
  } catch (error) {
    console.error(error);
  }
}

function renderPresetForTargets(template, descriptionInput, composerContainer, incidentId = 0, savedDescription) {
  const tokens = parsePresetTokens(template);
  if (!tokens.length) {
    presetTokenState = [];
    composerContainer.dataset.presetTemplate = '';
    composerContainer.style.display = 'none';
    composerContainer.innerHTML = '';
    descriptionInput.readOnly = false;
    descriptionInput.dataset.presetAutoSync = 'off';
    descriptionInput.dataset.presetAutoValue = '';
    descriptionInput.dataset.presetMarkupValue = '';
    descriptionInput.dataset.presetGeneratedBase = '';
    descriptionInput.dataset.presetMarkupBase = '';
    descriptionInput.dataset.presetManualText = '';
    descriptionInput.placeholder = 'Inserisci descrizione problema...';
    descriptionInput.value = template || '';
    return;
  }

  const savedValues = extractPresetValuesFromMarkup(template, savedDescription);
  const tokenState = tokens.map((token) => {
    const saved = savedValues.find(function(item) { return item.key === token.key; });
    return { ...token, value: saved ? saved.value : '' };
  });
  presetTokenState = tokenState;
  composerContainer.dataset.presetTemplate = template || '';
  composerContainer.style.display = 'flex';
  composerContainer.innerHTML = '';
  descriptionInput.readOnly = false;
  descriptionInput.dataset.presetAutoSync = 'on';
  descriptionInput.dataset.presetAutoValue = '';
  descriptionInput.dataset.presetGeneratedBase = '';
  descriptionInput.dataset.presetMarkupBase = '';
  descriptionInput.dataset.presetManualText = '';
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
      loadDbPresetOptions(token, input, tokenState[tokenIndex].value || '');
    } else if (token.type === 'timestamp') {
      input = document.createElement('input');
      input.type = 'time';
      input.placeholder = 'hh:mm';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = token.label || '';
    }
    input.required = true;
    if (tokenState[tokenIndex].value) input.value = tokenState[tokenIndex].value;
    input.dataset.presetField = '1';
    input.dataset.presetLabel = token.label || `Campo ${tokenIndex + 1}`;
    input.style.width = '100%';
    const syncPresetFieldValue = async () => {
      if ((token.type === 'select' || token.type === 'dbselect') && input.value === '__propose_new__') {
        const proposedValue = await showPrompt(`Proponi un nuovo elemento per il campo "${token.label}". Verrà inviato all'amministratore per l'approvazione prima di essere disponibile.`, { title: 'Proponi nuovo elemento', placeholder: 'Nuovo valore', confirmText: 'Invia proposta' });
        if (!proposedValue || !proposedValue.trim()) {
          input.value = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          return;
        }
        const value = proposedValue.trim();
        const normalizedValue = value.toLocaleLowerCase('it');
        const duplicateOption = [...input.querySelectorAll('option')].find((option) => {
          if (!option || option.value === '__propose_new__' || option.dataset.separator === '1') return false;
          return String(option.value || '').trim().toLocaleLowerCase('it') === normalizedValue;
        });
        if (duplicateOption) {
          input.value = duplicateOption.value;
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Questo elemento esiste gia: "' + duplicateOption.value + '".', 'warning', 'Elemento duplicato');
          descriptionInput.value = replacePresetTokenInDescription(descriptionInput.value, tokenState, tokenIndex, input.value || '');
          tokenState[tokenIndex].value = input.value || '';
          descriptionInput.dataset.presetMarkupValue = buildMarkupFromCurrentDescription(descriptionInput.value, tokenState);
          syncSubmitBtnState();
          return;
        }
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
          const storedValue = (result.request && result.request.value) || (result.value) || value;
          const pendingOption = document.createElement('option');
          pendingOption.value = storedValue;
          pendingOption.textContent = `${storedValue} (in revisione)`;
          input.insertBefore(pendingOption, input.querySelector('option[value="__propose_new__"]'));
          input.value = storedValue;
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Il nuovo elemento è stato inviato all\'admin per la revisione. Sarà disponibile dopo l\'approvazione.', 'success', 'Proposta inviata');
        } catch (error) {
          input.value = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Non è stato possibile inviare la proposta: ' + (error.message || error), 'error', 'Errore invio proposta');
          return;
        }
      }
      descriptionInput.value = replacePresetTokenInDescription(descriptionInput.value, tokenState, tokenIndex, input.value || '');
      tokenState[tokenIndex].value = input.value || '';
      descriptionInput.dataset.presetMarkupValue = buildMarkupFromCurrentDescription(descriptionInput.value, tokenState);
      syncSubmitBtnState();
    };
    input.addEventListener('input', syncPresetFieldValue);
    input.addEventListener('change', syncPresetFieldValue);
    fieldWrap.appendChild(input);
    composerContainer.appendChild(fieldWrap);
  });

  descriptionInput.oninput = function() {
    descriptionInput.dataset.presetMarkupValue = buildMarkupFromCurrentDescription(descriptionInput.value, tokenState);
  };

  const initialGenerated = buildDescriptionFromTemplate(template, tokenState, true);
  const initialMarkupGenerated = buildMarkupDescription(template, tokenState);
  descriptionInput.dataset.presetGeneratedBase = initialGenerated;
  descriptionInput.dataset.presetMarkupBase = initialMarkupGenerated;
  descriptionInput.dataset.presetAutoValue = initialGenerated;
  descriptionInput.dataset.presetMarkupValue = initialMarkupGenerated;
  descriptionInput.value = initialGenerated;
  syncSubmitBtnState();
}

function getIncompletePresetFields(composerContainer) {
  if (!composerContainer || composerContainer.style.display === 'none') return [];
  return [...composerContainer.querySelectorAll('[data-preset-field="1"]')].filter((field) => {
    if (field.disabled || field.type === 'hidden') return false;
    return !String(field.value || '').trim();
  });
}

function focusFirstIncompletePresetField(composerContainer) {
  const missing = getIncompletePresetFields(composerContainer);
  if (missing.length) missing[0].focus();
  return missing;
}

function buildMissingPresetFieldsMessage(composerContainer, prefix) {
  const missing = getIncompletePresetFields(composerContainer);
  if (!missing.length) return '';
  const labels = missing.map((field) => field.dataset.presetLabel || field.getAttribute('aria-label') || field.name || 'campo');
  return (prefix ? prefix + ': ' : '') + labels.join(', ');
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
  const customIncidentName = getCustomIncidentNameForSubmit();
  const panels = [...document.querySelectorAll('.extra-ticket-modal')];
  for (let index = 0; index < panels.length; index += 1) {
    const panel = panels[index];
    const extraDescEl = panel.querySelector('.extra-description');
    const extraComposer = panel.querySelector('.extra-composer');
    const extraTokens = collectPresetStateFromComposer(extraComposer ? extraComposer.dataset.presetTemplate : '', extraComposer);
    const extraDesc = extraDescEl
      ? (((extraDescEl.dataset.presetAutoSync !== 'off') && extraTokens.length)
        ? buildMarkupFromCurrentDescription(extraDescEl.value || '', extraTokens)
        : (extraDescEl.value || '').trim())
      : '';
    const extraFab = panel.querySelector('.extra-fab')?.value || '';
    const extraDt = panel.querySelector('.extra-datetime')?.value || '';
    const userSeverity = panel.querySelector('.extra-severity')?.value;
    const extraSeverity = Number(userSeverity || panel.dataset.fixedSeverity || defaultSeverity || 1);
    const missingPresetFields = focusFirstIncompletePresetField(extraComposer);
    if (missingPresetFields.length) {
      throw new Error(`Ticket extra ${index + 1}: compila tutti i campi obbligatori del template (${buildMissingPresetFieldsMessage(extraComposer)}).`);
    }
    if (!extraDesc || !extraFab || !extraDt) {
      const missing = [];
      if (!extraDesc) missing.push('descrizione');
      if (!extraFab) missing.push('FAB');
      if (!extraDt) missing.push('data/ora');
      throw new Error(`Ticket extra ${index + 1} incompleto: manca ${missing.join(', ')}`);
    }
    payloads.push({
      incident_id: incidentId,
      incident_name: customIncidentName,
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
  syncCustomIncidentNameField(incidentIdNum, incidentName, false);
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
  _pinTicketId = null;
  _pinTicketData = null;
  var _pinWrap = document.getElementById('ticketPinWrap');
  var _pinChk = document.getElementById('ticketPinCheck');
  var _pinUnt = document.getElementById('ticketPinUntil');
  if (_pinWrap) _pinWrap.style.display = '';
  if (_pinChk) _pinChk.checked = false;
  if (_pinUnt) { _pinUnt.value = ''; _pinUnt.style.display = 'none'; }
  if (ticketSubmitBtn) ticketSubmitBtn.textContent = 'Crea Ticket';
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => { b.disabled = false; });
  setTicketModalReadMode(false);
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.classList.toggle('active', b.textContent === defaultFab);
  });
  syncSubmitBtnState();
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

function getPresetTokenDisplayValue(token) {
  return token.value ? token.value : `[${token.label || 'campo'}]`;
}

function getPresetTokenMarkupValue(token) {
  return token.value ? `ã€ˆ${token.value}ã€‰` : `[${token.label || 'campo'}]`;
}

function replacePresetTokenInDescription(text, tokens, targetIndex, nextValue) {
  var source = String(text || '');
  var searchFrom = 0;
  var tokenIndex;
  for (tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    var token = tokens[tokenIndex];
    var currentDisplay = getPresetTokenDisplayValue(token);
    var matchIndex = source.indexOf(currentDisplay, searchFrom);
    if (matchIndex < 0) return source;
    if (tokenIndex === targetIndex) {
      var replacement = nextValue ? nextValue : `[${token.label || 'campo'}]`;
      return source.slice(0, matchIndex) + replacement + source.slice(matchIndex + currentDisplay.length);
    }
    searchFrom = matchIndex + currentDisplay.length;
  }
  return source;
}

function buildMarkupFromCurrentDescription(text, tokens) {
  var source = String(text || '');
  var searchFrom = 0;
  var tokenIndex;
  for (tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    var token = tokens[tokenIndex];
    var currentDisplay = getPresetTokenDisplayValue(token);
    var replacement = getPresetTokenMarkupValue(token);
    var matchIndex = source.indexOf(currentDisplay, searchFrom);
    if (matchIndex < 0) continue;
    source = source.slice(0, matchIndex) + replacement + source.slice(matchIndex + currentDisplay.length);
    searchFrom = matchIndex + replacement.length;
  }
  return source.replace(/\n{3,}/g, '\n\n').trim();
}

function collectPresetStateFromComposer(template, composerContainer) {
  var tokens = parsePresetTokens(template || '');
  var fields = composerContainer ? composerContainer.querySelectorAll('[data-preset-field="1"]') : [];
  tokens.forEach(function(token, index) {
    token.value = fields[index] ? String(fields[index].value || '') : '';
  });
  return tokens;
}

function appendPresetManualText(baseText, manualText) {
  var base = String(baseText || '').trim();
  var manual = String(manualText || '').trim();
  if (!manual) return base;
  if (!base) return manual;
  return base + '\n\n' + manual;
}

function extractPresetValuesFromMarkup(template, savedDescription) {
  const tokens = parsePresetTokens(template);
  const source = String(savedDescription || '');
  if (!tokens.length || !source) return tokens.map(function(token) { return { key: token.key, value: '' }; });
  const values = [];
  let searchFrom = 0;
  tokens.forEach(function(token) {
    const start = source.indexOf('ã€ˆ', searchFrom);
    if (start < 0) {
      values.push({ key: token.key, value: '' });
      return;
    }
    const end = source.indexOf('ã€‰', start + 2);
    if (end < 0) {
      values.push({ key: token.key, value: '' });
      return;
    }
    values.push({ key: token.key, value: source.slice(start + 2, end) });
    searchFrom = end + 2;
  });
  return values;
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
      syncSubmitBtnState();
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
    showToast('Non hai i permessi necessari per questa operazione. Contatta un amministratore.', 'error', 'Accesso negato');
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
  if (openAdminBtn) openAdminBtn.style.display = (currentUser?.role === 'admin' || currentUser?.role === 'moderator') ? '' : 'none';
  const pill = document.getElementById('userPill');
  const pillName = document.getElementById('userPillName');
  const pillTeam = document.getElementById('userPillTeam');
  const pillRole = document.getElementById('userPillRole');
  if (pill && pillName && currentUser) {
    pillName.textContent = currentUser.username || '';
    if (pillTeam) {
      const team = currentUser.team ? 'Team ' + currentUser.team : '';
      pillTeam.textContent = team;
      const dot = pill.querySelector('.user-pill-dot');
      if (dot) dot.style.display = team ? '' : 'none';
    }
    if (pillRole) {
      const roleLabels = { admin: 'Admin', moderator: 'Moderatore', supervisor: 'Supervisor', user: 'Operatore' };
      pillRole.textContent = roleLabels[currentUser.role] || currentUser.role || '';
    }
    pill.style.display = '';
    // La preferenza avatar arriva dal server (persiste tra browser/PC/cache); localStorage è solo cache.
    const serverAvatar = (currentUser.avatar !== undefined && currentUser.avatar !== null) ? currentUser.avatar : undefined;
    if (serverAvatar !== undefined && window._cacheAvatar) window._cacheAvatar(currentUser.username, serverAvatar);
    const avatarToShow = serverAvatar !== undefined
      ? (serverAvatar || null)
      : (window._getStoredAvatar ? window._getStoredAvatar(currentUser.username) : null);
    if (window._applyUserAvatar) window._applyUserAvatar(avatarToShow);
    pill.onclick = function() { if (window._openAvatarPicker) window._openAvatarPicker(); };
  }
  // Idrata la cache locale con gli avatar di tutti gli utenti (per i badge nei ticket, cross-browser).
  if (window._hydrateAvatars) window._hydrateAvatars();
}

function formatCustomRangeLabel(range) {
  if (!range || !range.start || !range.end) return '';
  const fmt = (d) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; };
  return `${fmt(range.start)} → ${fmt(range.end)}`;
}

function chartTitleForTarget(target) {
  const baseTitle = target.closest('.panel') ? target.closest('.panel').querySelector('h3')?.textContent || target.id || 'Grafico' : (target.id || 'Grafico');
  const chartKey = normalizeChartKey(target && target.id);
  const modeByKey = { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, severityYear: severityYearMode, userYear: userYearMode };
  if (modeByKey[chartKey] === 'custom' && chartCustomRanges[chartKey]) return `${baseTitle} (${formatCustomRangeLabel(chartCustomRanges[chartKey])})`;
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

function formatChartValueWithPercent(total, pct) {
  return `${total} (${pct}%)`;
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
    row.className = 'bar chart-clickable';
    row.setAttribute('data-chart-label', s.label);
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
    row.className = 'chart-horizontal-row chart-clickable';
    row.setAttribute('data-chart-label', item.label);
    const width = Math.round((item.total / max) * 100);
    const pct = Math.round((item.total / Math.max(sortedStats.reduce((sum, x) => sum + x.total, 0), 1)) * 100);
    const color = getBarColor(target.id, item.label);
    row.innerHTML = `
      <span class="chart-horizontal-label">${escapeHtml(item.label)}</span>
      <div class="chart-horizontal-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div><span class="bar-pct">${pct}%</span></div>
      <span class="chart-horizontal-value">${formatChartValueWithPercent(item.total, pct)}</span>
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
    row.className = 'chart-pie-legend-row chart-clickable';
    row.setAttribute('data-chart-label', item.label);
    const pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
    row.innerHTML = `
      <span class="chart-pie-swatch" style="background:${getBarColor(target.id, item.label)}"></span>
      <span class="chart-pie-label">${escapeHtml(item.label)}</span>
      ${hideLegendValue ? `<strong class="chart-pie-value">${pct}%</strong>` : `<strong class="chart-pie-value">${formatChartValueWithPercent(item.total, pct)}</strong>`}
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
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4.5" class="chart-line-point chart-clickable" data-chart-label="${escapeHtml(point.item.label)}" fill="${getBarColor(target.id, point.item.label)}"></circle>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" text-anchor="middle" class="chart-line-label chart-clickable" data-chart-label="${escapeHtml(point.item.label)}">${escapeHtml(point.item.label)}</text>`).join('')}
    ${points.map((point) => `<text x="${point.x}" y="${point.y - 10}" text-anchor="middle" class="chart-line-value">${point.item.total}</text>`).join('')}
  `;
  target.appendChild(svg);
}

// Arrotonda il massimo dell'asse a valori "tondi" (1/2/2.5/5 x 10^n)
// in modo che gli step dei tick siano numeri leggibili (100, 200, 500, ...).
function niceAxisScale(rawMax, minStep) {
  var targetTicks = 5;
  var rawStep = rawMax / targetTicks;
  var mag = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10));
  var norm = rawStep / mag;
  var niceStep;
  if (norm <= 1) niceStep = 1;
  else if (norm <= 2) niceStep = 2;
  else if (norm <= 5) niceStep = 5;
  else niceStep = 10;
  niceStep = niceStep * mag;
  // Step minimo forzato (es. scaglioni da 250 per il grafico gruppo).
  if (minStep && niceStep < minStep) niceStep = minStep;
  var niceMax = Math.ceil(rawMax / niceStep) * niceStep;
  if (niceMax < niceStep) niceMax = niceStep;
  var ticks = Math.round(niceMax / niceStep);
  return { max: niceMax, step: niceStep, ticks: ticks };
}

function renderPersonalLineChart(target, stats, targetAnnual, targetMonthly, opts) {
  target.innerHTML = '';
  const drillMonth = opts && opts.month ? opts.month : null;
  const months = stats.map(function(m) { var d = m.total || 0; return { label: m.label, total: d, monthly: d }; });
  setChartExportState(target, stats);
  const targetAnnualMonthly = targetAnnual > 0 ? (targetAnnual / 12) : 0;
  const peakValue = Math.max(Math.max.apply(null, months.map(function(m) { return m.total; })), targetMonthly || 0, targetAnnualMonthly || 0, 1);
  const configuredAxisMax = getPersonalChartAxisMaxSetting(target && target.id);
  const rawMax = Math.max(1, configuredAxisMax || 0, peakValue * 1.15);
  // Ticket gruppo: scaglioni dell'asse di almeno 250.
  const axisMinStep = (target && target.id === 'personalGroupChart') ? 250 : 0;
  const axisScale = niceAxisScale(rawMax, axisMinStep);
  const maxVal = axisScale.max;
  const width = 900;
  const height = 340;
  const padL = 58;
  const padR = 22;
  const padT = 50;
  const padB = 44;
  const usableW = width - padL - padR;
  const usableH = height - padT - padB;
  const n = months.length;
  const xOf = function(i) { return padL + (usableW * i) / (n - 1); };
  const yOf = function(v) { return padT + usableH - (v / maxVal) * usableH; };
  const points = months.map(function(m, i) { return { x: xOf(i), y: yOf(m.total), m: m }; });
  const linePath = points.map(function(p, i) { return (i === 0 ? 'M' : 'L') + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  var targetMonthlyY = targetMonthly > 0 ? yOf(targetMonthly) : null;
  const bottomY = (height - padB).toFixed(1);
  const firstX = points[0].x.toFixed(1);
  const lastX = points[points.length - 1].x.toFixed(1);
  const areaPath = linePath + ' L ' + lastX + ' ' + bottomY + ' L ' + firstX + ' ' + bottomY + ' Z';

  const isGroup = target.id === 'personalGroupChart';
  const uid = target.id || Math.random().toString(36).slice(2);
  const gradId   = 'pcfill_'  + uid;
  const lineGradId = 'pcline_' + uid;
  const ptGradId = 'pcpt_'   + uid;
  const glowId   = 'pcglow_'  + uid;

  // Ticket personali: viola→ciano  |  Ticket gruppo: arancio→viola
  const colA = isGroup ? '#f97316' : '#6366f1';
  const colB = isGroup ? '#a855f7' : '#06b6d4';
  const colMid = isGroup ? '#ec4899' : '#818cf8';

  var yTicks = '';
  var tickCount = axisScale.ticks;
  for (var ti = 0; ti <= tickCount; ti++) {
    var tv = axisScale.step * ti;
    var ty = yOf(tv).toFixed(1);
    yTicks += '<line x1="' + (padL - 4) + '" y1="' + ty + '" x2="' + (width - padR) + '" y2="' + ty + '" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3 3"/>';
    yTicks += '<text x="' + (padL - 8) + '" y="' + ty + '" text-anchor="end" dominant-baseline="middle" class="personal-chart-label">' + tv + '</text>';
  }

  var circles = points.map(function(p) {
    var val = p.m.monthly;
    var dotColor;
    if (targetMonthly > 0) {
      var ratio = val / targetMonthly;
      dotColor = ratio >= 1 ? '#22c55e' : ratio >= 0.75 ? '#eab308' : '#ef4444';
    } else {
      dotColor = null; // nessun target: usa gradiente
    }
    var dotFill = dotColor ? dotColor : ('url(#' + ptGradId + ')');
    var badgeColor = dotColor ? dotColor : colA;
    if (val > 0) {
      var badgeW = String(val).length > 1 ? 30 : 24;
      var badge = '<rect x="' + (p.x - badgeW / 2).toFixed(1) + '" y="' + (p.y - 36).toFixed(1) + '" width="' + badgeW + '" height="19" rx="9.5" fill="' + badgeColor + '" opacity="0.93"/>';
      var valText = '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 26.5).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" class="personal-chart-value">' + val + '</text>';
      var dot = '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="7" fill="' + dotFill + '" stroke="#fff" stroke-width="2.5"/>';
      return badge + valText + dot;
    } else {
      var zeroColor = (targetMonthly > 0) ? '#ef4444' : 'var(--border)';
      var dot0 = '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="5" fill="' + zeroColor + '" stroke="#fff" stroke-width="2"/>';
      var zeroText = '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 12).toFixed(1) + '" text-anchor="middle" class="personal-chart-zero">0</text>';
      return dot0 + zeroText;
    }
  }).join('');

  var labels = points.map(function(p, i) {
    if (drillMonth) {
      return '<text x="' + p.x.toFixed(1) + '" y="' + (height - padB + 18) + '" text-anchor="middle" class="personal-chart-label">' + escapeHtml(p.m.label) + '</text>';
    }
    // Vista annuale: etichette mese cliccabili per il drill-down giornaliero.
    return '<text x="' + p.x.toFixed(1) + '" y="' + (height - padB + 18) + '" text-anchor="middle" data-month="' + (i + 1) + '" class="personal-chart-label personal-chart-month-hit">' + escapeHtml(p.m.label) + '</text>';
  }).join('');

  // Aree cliccabili trasparenti sui punti: aprono la lista ticket del periodo.
  var colW = n > 1 ? (usableW / (n - 1)) : usableW;
  var hitRects = points.map(function(p, i) {
    return '<rect class="personal-point-hit" data-idx="' + i + '" x="' + (p.x - colW / 2).toFixed(1) + '" y="' + padT + '" width="' + colW.toFixed(1) + '" height="' + usableH + '" fill="transparent" style="cursor:pointer"><title>Mostra ticket</title></rect>';
  }).join('');

  var targetLines = '';
  if (targetMonthlyY !== null) {
    targetLines += '<line x1="' + padL + '" y1="' + targetMonthlyY.toFixed(1) + '" x2="' + (width - padR) + '" y2="' + targetMonthlyY.toFixed(1) + '" class="personal-chart-target personal-chart-target-monthly"/>' +
      '<text x="' + (padL + 6) + '" y="' + (targetMonthlyY - 6).toFixed(1) + '" text-anchor="start" class="personal-chart-target-label personal-chart-target-label-monthly">T.mens. ' + targetMonthly + '</text>';
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'personal-chart-svg');
  svg.innerHTML =
    '<defs>' +
      '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + colA + '" stop-opacity="0.38"/>' +
        '<stop offset="65%" stop-color="' + colB + '" stop-opacity="0.10"/>' +
        '<stop offset="100%" stop-color="' + colB + '" stop-opacity="0.01"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + ptGradId + '" cx="35%" cy="30%" r="70%">' +
        '<stop offset="0%" stop-color="' + colMid + '"/>' +
        '<stop offset="100%" stop-color="' + colA + '"/>' +
      '</radialGradient>' +
      '<filter id="' + glowId + '" x="-20%" y="-60%" width="140%" height="220%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
        '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
    '</defs>' +
    yTicks +
    '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (height - padB) + '" class="personal-chart-axis"/>' +
    '<line x1="' + padL + '" y1="' + (height - padB) + '" x2="' + (width - padR) + '" y2="' + (height - padB) + '" class="personal-chart-axis"/>' +
    targetLines +
    '<path d="' + areaPath + '" fill="url(#' + gradId + ')" stroke="none"/>' +
    '<path d="' + linePath + '" fill="none" stroke="' + colA + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#' + glowId + ')"/>' +
    circles +
    labels +
    hitRects;
  target.appendChild(svg);

  // Click su un punto -> lista ticket di quel mese (annuale) o giorno (mensile).
  var pointHits = svg.querySelectorAll('.personal-point-hit');
  for (var phi = 0; phi < pointHits.length; phi++) {
    (function (el) {
      el.addEventListener('click', function () {
        openPersonalPeriodTickets(target, parseInt(el.getAttribute('data-idx'), 10));
      });
    })(pointHits[phi]);
  }

  // Overlay HTML per il drill-down mensile (posizionati sul contenitore).
  target.style.position = 'relative';
  if (drillMonth) {
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'personal-chart-back';
    backBtn.textContent = '← Torna all’anno';
    backBtn.addEventListener('click', function () { personalChartBackToYear(target.id); });
    target.appendChild(backBtn);

    if (opts && opts.monthLabel) {
      var cap = document.createElement('span');
      cap.className = 'personal-chart-month-caption';
      cap.textContent = opts.monthLabel + ' — giorno per giorno';
      target.appendChild(cap);
    }
  } else {
    // Aggancia il click sulle etichette mese per entrare nel dettaglio.
    var hits = svg.querySelectorAll('.personal-chart-month-hit');
    for (var hi = 0; hi < hits.length; hi++) {
      (function (el) {
        el.addEventListener('click', function () {
          personalChartDrillToMonth(target.id, parseInt(el.getAttribute('data-month'), 10));
        });
      })(hits[hi]);
    }
  }
}

// Stato drill-down dei grafici personali: target.id -> mese (1..12) o null (anno).
var personalChartMonthView = {};

function personalChartIsGroup(targetId) { return targetId === 'personalGroupChart'; }

async function loadPersonalChartData(target) {
  if (!target) return;
  const isGroup = personalChartIsGroup(target.id);
  const view = isGroup ? 'team' : 'mine';
  const month = personalChartMonthView[target.id] || null;
  let url = '/api/stats/personal/current-year?view=' + view;
  if (month) url += '&month=' + month;
  const data = await fetchJson(url);
  const unameEl = isGroup ? personalGroupChartUsername : personalMineChartUsername;
  if (unameEl && data.username) unameEl.textContent = '— ' + data.username;
  if (!data.stats) return;
  if (month) {
    // Vista giornaliera: nessuna linea target.
    renderPersonalLineChart(target, data.stats, 0, 0, { month: month, monthLabel: data.month_label });
  } else {
    const t = isGroup
      ? syncPersonalTargetUi(data, personalGroupTargetMonthlyInput, personalGroupTargetAnnualInput, personalGroupTargetMonthlyLabel, personalGroupTargetAnnualLabel, true)
      : syncPersonalTargetUi(data, personalMineTargetMonthlyInput, personalMineTargetAnnualInput, personalMineTargetMonthlyLabel, personalMineTargetAnnualLabel, false);
    renderPersonalLineChart(target, data.stats, t.annual, t.monthly);
  }
}

function personalChartDrillToMonth(targetId, month) {
  const target = document.getElementById(targetId);
  if (!target || !(month >= 1 && month <= 12)) return;
  personalChartMonthView[targetId] = month;
  loadPersonalChartData(target).catch(console.error);
}

function personalChartBackToYear(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  personalChartMonthView[targetId] = null;
  loadPersonalChartData(target).catch(console.error);
}

// ── Drill: click su un elemento del grafico -> pagina "Cerca ticket" ──────────
function goToSearchWithParams(params) {
  window.open(appUrl('/search.html?' + params.toString()), '_blank');
}

function handleChartElementClick(el) {
  const label = el.getAttribute('data-chart-label');
  if (!label) return;
  const chart = el.closest('[id]');
  const cfg = chart && chart._chartFilter;
  if (!cfg || !cfg.dimension) return;
  const params = new URLSearchParams();
  params.set('dimension', cfg.dimension);
  params.set('value', label);
  const win = cfg.getWindow ? cfg.getWindow() : cfg.window;
  if (win) params.set('window', win);
  if (cfg.start) params.set('start', cfg.start);
  if (cfg.end) params.set('end', cfg.end);
  params.set('scope', cfg.scope || 'all');
  if (cfg.filters) {
    Object.keys(cfg.filters).forEach(function (k) {
      (cfg.filters[k] || []).forEach(function (v) { params.append('filter_' + k + '[]', v); });
    });
  }
  goToSearchWithParams(params);
}

// Click su punto/mese dei grafici personali -> ticket di quel periodo su Cerca.
function openPersonalPeriodTickets(target, bucketIndex) {
  const isGroup = personalChartIsGroup(target.id);
  const scope = isGroup ? 'group' : 'mine';
  const year = new Date().getFullYear();
  const month = personalChartMonthView[target.id] || null;
  let startISO, endISO;
  if (month) {
    const day = bucketIndex + 1;
    startISO = new Date(Date.UTC(year, month - 1, day)).toISOString();
    endISO = new Date(Date.UTC(year, month - 1, day + 1)).toISOString();
  } else {
    const m = bucketIndex + 1;
    startISO = new Date(Date.UTC(year, m - 1, 1)).toISOString();
    endISO = new Date(Date.UTC(year, m, 1)).toISOString();
  }
  const params = new URLSearchParams();
  params.set('scope', scope);
  params.set('start', startISO);
  params.set('end', endISO);
  goToSearchWithParams(params);
}

// Listener delegato sui grafici categoriali (bar/colonne/torta/linea).
(function setupChartDrill() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.addEventListener('click', function (e) {
    const el = e.target.closest ? e.target.closest('[data-chart-label]') : null;
    if (el) handleChartElementClick(el);
  });
})();

function renderChart(target, stats) {
  const type = getChartType(target.id);
  const all = stats || [];
  const nonZero = all.filter(function (s) { return Number(s.total) > 0; });
  // Per non far sembrare il grafico vuoto, se ci sono meno di 4 elementi
  // reintegra elementi a 0 fino ad arrivare a 4 (o esaurire quelli disponibili).
  const shown = nonZero.slice();
  if (shown.length < 4) {
    const zeros = all.filter(function (s) { return Number(s.total) <= 0; });
    for (let i = 0; i < zeros.length && shown.length < 4; i++) {
      shown.push(zeros[i]);
    }
  }
  if (type === 'bar') return renderHorizontalChart(target, shown);
  if (type === 'donut') return renderPieOrDonutChart(target, shown, true);
  return renderColumnChart(target, shown);
}

function renderVerticalChart(target, stats) {
  renderChart(target, stats);
}

function syncPersonalTargetUi(personal, monthlyInput, annualInput, monthlyLabel, annualLabel, isTeamView)
{
  const targetMonthly = Number(personal && (isTeamView ? personal.group_target_monthly : personal.personal_target_monthly) ? (isTeamView ? personal.group_target_monthly : personal.personal_target_monthly) : (personal && personal.target ? personal.target : (monthlyInput ? monthlyInput.value : 0))) || 0;
  const targetAnnual = Number(personal && (isTeamView ? personal.group_target_annual : personal.personal_target_annual) ? (isTeamView ? personal.group_target_annual : personal.personal_target_annual) : (annualInput ? annualInput.value : 0)) || (targetMonthly * 12);
  if (monthlyInput) {
    monthlyInput.value = String(targetMonthly || 20);
    monthlyInput.title = isTeamView
      ? 'Il target gruppo viene impostato dall\'admin panel.'
      : 'Il target personale viene impostato dall\'admin panel.';
  }
  if (annualInput) {
    annualInput.value = String(targetAnnual || 240);
    annualInput.title = isTeamView
      ? 'Il target annuale gruppo viene impostato dall\'admin panel.'
      : 'Il target annuale personale viene impostato dall\'admin panel.';
  }
  if (monthlyLabel) monthlyLabel.textContent = 'Target mensile:';
  if (annualLabel) annualLabel.textContent = 'Target annuale:';
  return { monthly: targetMonthly, annual: targetAnnual };
}

function setupChartTypeControls() {
  document.querySelectorAll('.charts-grid .chart[id]').forEach((chart) => {
    if (chart.classList.contains('custom-chart')) return;
    const targetId = chart.id || '';
    const panel = chart.closest('.panel');
    if (!panel) return;
    const controlsRow = panel.querySelector('.chart-controls-row');
    if (!controlsRow || controlsRow.querySelector(`.chart-type-select[data-chart-target="${targetId}"]`)) return;
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
    controlsRow.insertBefore(select, controlsRow.firstChild);
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
  Object.keys(incidentIdToNameModeMap).forEach((k) => delete incidentIdToNameModeMap[k]);
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
      incidentIdToNameModeMap[String(inc.id)] = inc.name_mode || 'default';
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

function getAvatarBadge(username) {
  try {
    const all = JSON.parse(localStorage.getItem('prodops_avatars_v1') || '{}');
    const emoji = username && all[username] ? all[username] : null;
    if (!emoji) return '';
    return '<span class="ticket-owner-avatar" aria-hidden="true">' + emoji + '</span>';
  } catch { return ''; }
}

function createTicketRowElement(t, isAnimated) {
  const pad = (v) => String(v).padStart(2, '0');
  const incidentId = Number(t.incident_id || 0);
  const incidentName = String(incidentIdToNameMap[String(incidentId)] || t.incident_name || '');
  const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
  const categoryColor = getLabelColor('categories', category);
  const fabColor = getLabelColor('fabs', t.fab);
  const description = String(t.description || '');
  const d = new Date(t.created_at);
  const dayMonth = Number.isNaN(d.getTime()) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  const hhmm = Number.isNaN(d.getTime()) ? '' : pad(d.getHours()) + ':' + pad(d.getMinutes());
  const ownerUsername = String(t.owner_username || t.ownerUsername || '');
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
      (ownerUsername ? '<span class="ticket-row-owner">' + getAvatarBadge(ownerUsername) + escapeHtml(ownerUsername) + '</span>' : '') +
      '<span class="ticket-row-datetime">' + dayMonth + ' ' + hhmm + '</span>' +
    '</div>';
  return li;
}

// Chiave di identità di un ticket: due ticket sono "identici" se coincidono
// incident, fab, severity, proprietario e descrizione (owner incluso per non
// rompere i filtri "Tuoi"/"Team"). Orario e id NON contano.
function ticketDupKey(t) {
  return [
    Number(t.incident_id || 0),
    String(t.fab || ''),
    String(t.severity || ''),
    String(t.owner_user_id || ''),
    String(t.description || '').trim().toLocaleLowerCase('it')
  ].join('');
}

// Raggruppa i ticket identici mantenendo l'ordine di prima comparsa.
function groupIdenticalTickets(tickets) {
  var map = {};
  var order = [];
  (tickets || []).forEach(function (t) {
    var k = ticketDupKey(t);
    if (!map[k]) { map[k] = []; order.push(k); }
    map[k].push(t);
  });
  return order.map(function (k) { return map[k]; });
}

// Costruisce il nodo di lista per un gruppo di ticket identici: una singola
// card se il gruppo ha un solo ticket, oppure una pila (come la vista compatta)
// con un pallino in alto a destra che indica quanti ticket sono stati impilati.
function buildTicketNode(group, animatedIds) {
  var first = group[0];
  var isAnimated = animatedIds ? animatedIds.has(Number(first.id)) : false;
  var row = createTicketRowElement(first, isAnimated);
  if (group.length <= 1) return row;

  var stack = document.createElement('li');
  stack.className = 'ticket-dup-stack';
  // Ricopia i dataset sul wrapper cosi' filtro/ordinamento/compatta continuano
  // a funzionare (leggono li.dataset.* dai figli diretti della lista).
  var keys = ['ticketId', 'incidentId', 'incident', 'description', 'fab', 'createdAt', 'severity', 'category', 'canEdit', 'ownerUserId', 'ownerTeam', 'ownerUsername'];
  keys.forEach(function (k) { stack.dataset[k] = row.dataset[k] || ''; });
  stack.appendChild(row);

  var badge = document.createElement('span');
  badge.className = 'ticket-dup-badge';
  badge.textContent = String(group.length);
  stack.appendChild(badge);

  // Card per il popup al passaggio del mouse (riusa l'infrastruttura compatta).
  stack._tsCards = group.map(function (t) { return createTicketRowElement(t, false); });
  stack.addEventListener('mouseenter', function () { _tsShowPopup(this); });
  stack.addEventListener('mouseleave', function () {
    _tsPopupTimer = setTimeout(_tsHidePopup, 110);
  });
  return stack;
}

// Marca le card la cui descrizione è troncata (line-clamp).
// Hover sulla card espande il testo in loco senza aprire la modale.
function decorateClampedDescriptions(root) {
  if (!root) return;
  root.querySelectorAll('.ticket-row').forEach((row) => {
    if (row.style.display === 'none') return;
    if (row.classList.contains('has-overflow')) return;
    const desc = row.querySelector('.ticket-row-desc');
    if (!desc) return;
    if (desc.scrollHeight - desc.clientHeight <= 2) return;
    row.classList.add('has-overflow');
    const hint = document.createElement('span');
    hint.className = 'ticket-more-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '···';
    desc.insertAdjacentElement('afterend', hint);
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

    groupIdenticalTickets(data.tickets).forEach((group) => {
      ticketList.appendChild(buildTicketNode(group, animatedIds));
    });

    ticketList.classList.toggle('ticket-list-scrollable', (data.tickets || []).length > 10);
    applyCurrentShiftFilter();
    sortTicketList();
    requestAnimationFrame(() => decorateClampedDescriptions(ticketList));
    updateImportantTicketsBadge();
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
  else requestAnimationFrame(() => decorateClampedDescriptions(ticketList));
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
  syncCustomIncidentNameField(incidentId, btn.dataset.incident || incidentName, false);
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
  const editPresets = incidentIdToPresetMap[String(incidentId)] || [];
  if (presetInlineComposer) {
    presetInlineComposer.style.display = 'none';
    presetInlineComposer.innerHTML = '';
  }
  if (editPresets.length && presetInlineComposer) {
    renderPresetForTargets(editPresets[0] || '', document.getElementById('description'), presetInlineComposer, incidentId, btn.dataset.description || '');
  }
  ticketTimestampInput.value = toDatetimeLocalValue(btn.dataset.createdAt || new Date());
  fabValue.value = (btn.dataset.fab || '').toUpperCase();
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.disabled = false;
    b.classList.toggle('active', b.textContent === fabValue.value);
  });
  setTicketModalReadMode(false);
  syncSubmitBtnState();
  if (deleteTicketBtn) deleteTicketBtn.style.display = 'inline-block';
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = 'none';
  updatePinUi(Number(btn.dataset.ticketId) || null, {
    ticketId: Number(btn.dataset.ticketId),
    incidentId: Number(btn.dataset.incidentId || 0),
    incidentName: btn.dataset.incident || '',
    description: btn.dataset.description || '',
    fab: btn.dataset.fab || '',
    createdAt: btn.dataset.createdAt || '',
    severity: Number(btn.dataset.severity || 1),
  });
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

    previousShiftsContent.innerHTML = '';
    data.shifts.forEach((shift) => {
      const block = document.createElement('section');
      block.className = 'previous-shift-block';
      const heading = document.createElement('h4');
      heading.textContent = shift.label;
      block.appendChild(heading);
      const list = document.createElement('ul');
      list.className = 'ticket-list';
      const tickets = Array.isArray(shift.tickets) ? shift.tickets : [];
      if (!tickets.length) {
        const empty = document.createElement('li');
        empty.className = 'muted';
        empty.textContent = 'Nessun ticket registrato.';
        list.appendChild(empty);
      } else {
        groupIdenticalTickets(tickets).forEach((group) => list.appendChild(buildTicketNode(group, null)));
        requestAnimationFrame(() => decorateClampedDescriptions(list));
      }
      block.appendChild(list);
      previousShiftsContent.appendChild(block);
    });
    previousShiftsLoaded = true;
  } finally {
    previousShiftsLoading = false;
  }
}

setupChartExportControls();
if (generatePptReportBtn) {
  generatePptReportBtn.addEventListener('click', openReportModal);
}

const editChartModeBtn = document.getElementById('editChartModeBtn');
if (editChartModeBtn) {
  editChartModeBtn.addEventListener('click', function() {
    toggleChartsEditMode();
    var labelSpan = editChartModeBtn.childNodes;
    // update text node (last child is text)
    for (var i = editChartModeBtn.childNodes.length - 1; i >= 0; i--) {
      if (editChartModeBtn.childNodes[i].nodeType === 3) {
        editChartModeBtn.childNodes[i].textContent = chartsEditMode ? 'Fine modifica' : 'Modifica grafici';
        break;
      }
    }
  });
}

(function() {
  var grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.addEventListener('click', function(e) {
    if (!chartsEditMode) return;
    if (e.target.closest('.chart-title-edit-input')) return;
    var h3 = e.target.closest('.panel-heading-row h3');
    if (!h3 || h3.querySelector('.chart-title-edit-input')) return;
    var panel = h3.closest('.panel[id]');
    if (!panel || panel.id === 'addChartCard') return;
    startChartTitleEdit(panel, h3);
  });
}());

function buildYearStatsUrl(basePath, mode, customRange) {
  if (mode === 'custom' && customRange && customRange.start && customRange.end) {
    return `${basePath}/current-year?start=${encodeURIComponent(customRange.start)}&end=${encodeURIComponent(customRange.end)}`;
  }
  if (mode === 'day') return `${basePath}/current-day`;
  return `${basePath}/current-year?mode=${mode}`;
}

async function loadCharts() {
  try {
    const [fabYear, catYear, teamYear, severityYear, userYear] = await Promise.all([
      fetchJson(buildYearStatsUrl('/api/stats/fab', fabYearMode, chartCustomRanges.fabYear)),
      fetchJson(buildYearStatsUrl('/api/stats/category', catYearMode, chartCustomRanges.catYear)),
      fetchJson(buildYearStatsUrl('/api/stats/team', teamYearMode, chartCustomRanges.teamYear)),
      fetchJson(buildYearStatsUrl('/api/stats/severity', severityYearMode, chartCustomRanges.severityYear)),
      fetchJson(buildYearStatsUrl('/api/stats/user', userYearMode, chartCustomRanges.userYear))
    ]);
    renderChart(fabYearChart, fabYear.stats);
    renderChart(catYearChart, catYear.stats);
    renderChart(teamYearChart, teamYear.stats);
    renderChart(severityYearChart, severityYear.stats);
    if (userYearChart) renderChart(userYearChart, userYear.stats);
    // Config per il filtro-ticket al click su un elemento del grafico.
    if (fabYearChart) fabYearChart._chartFilter = { dimension: 'fab', scope: 'all', getWindow: function () { return fabYearMode; }, start: (chartCustomRanges.fabYear || {}).start || '', end: (chartCustomRanges.fabYear || {}).end || '' };
    if (catYearChart) catYearChart._chartFilter = { dimension: 'category', scope: 'all', getWindow: function () { return catYearMode; }, start: (chartCustomRanges.catYear || {}).start || '', end: (chartCustomRanges.catYear || {}).end || '' };
    if (teamYearChart) teamYearChart._chartFilter = { dimension: 'team', scope: 'all', getWindow: function () { return teamYearMode; }, start: (chartCustomRanges.teamYear || {}).start || '', end: (chartCustomRanges.teamYear || {}).end || '' };
    if (severityYearChart) severityYearChart._chartFilter = { dimension: 'severity', scope: 'all', getWindow: function () { return severityYearMode; }, start: (chartCustomRanges.severityYear || {}).start || '', end: (chartCustomRanges.severityYear || {}).end || '' };
    if (userYearChart) userYearChart._chartFilter = { dimension: 'user', scope: 'all', getWindow: function () { return userYearMode; }, start: (chartCustomRanges.userYear || {}).start || '', end: (chartCustomRanges.userYear || {}).end || '' };
    // Grafici personali/gruppo: caricati dai loader che rispettano lo stato
    // di drill-down mensile (annuale di default, o giorno per giorno).
    if (personalMineChart) await loadPersonalChartData(personalMineChart);
    if (personalGroupChart) await loadPersonalChartData(personalGroupChart);
  } catch (error) {
    console.error(error);
    [fabYearChart, catYearChart, teamYearChart, severityYearChart, userYearChart, personalMineChart, personalGroupChart].forEach((target) => {
      if (target) target.innerHTML = '<p class="muted">Impossibile caricare il grafico.</p>';
    });
  }
}

// ===== Grafici personalizzati (custom charts) =====
let customCharts = [];
let hiddenDefaultPanels = [];
let panelOrder = [];
let panelTitles = {};
let chartsEditMode = false;

const PANEL_TITLE_ELEMENTS = {
  chartPanelPersonalMine:  'personalMineChartTitleText',
  chartPanelPersonalGroup: 'personalGroupChartTitleText',
  chartPanelFab:           'fabYearChartTitle',
  chartPanelCat:           'catYearChartTitle',
  chartPanelTeam:          'teamYearChartTitle',
  chartPanelSeverity:      'severityYearChartTitle',
  chartPanelUser:          'userYearChartTitle'
};

function applyPanelTitles() {
  Object.keys(PANEL_TITLE_ELEMENTS).forEach(function(panelId) {
    if (!panelTitles[panelId]) return;
    var el = document.getElementById(PANEL_TITLE_ELEMENTS[panelId]);
    if (el) el.textContent = panelTitles[panelId];
  });
}

function toggleChartsEditMode() {
  chartsEditMode = !chartsEditMode;
  var grid = document.getElementById('chartsGrid');
  var btn = document.getElementById('editChartModeBtn');
  if (grid) grid.classList.toggle('charts-edit-mode', chartsEditMode);
  if (btn) {
    btn.classList.toggle('active', chartsEditMode);
    btn.querySelector('span') && (btn.querySelector('span').textContent = chartsEditMode ? 'Fine modifica' : 'Modifica grafici');
  }
  if (!chartsEditMode) {
    var grid2 = document.getElementById('chartsGrid');
    if (grid2) grid2.querySelectorAll('.chart-title-edit-input').forEach(function(inp) { inp.blur(); });
  }
}

function startChartTitleEdit(panel, h3) {
  var isCustom = panel.classList.contains('custom-chart-panel');
  var titleEl = h3;
  if (!isCustom && PANEL_TITLE_ELEMENTS[panel.id]) {
    titleEl = document.getElementById(PANEL_TITLE_ELEMENTS[panel.id]) || h3;
  }
  var original = titleEl.textContent || '';
  var input = document.createElement('input');
  input.type = 'text';
  input.value = original;
  input.className = 'chart-title-edit-input';
  input.maxLength = 80;
  titleEl.textContent = '';
  titleEl.appendChild(input);
  input.focus();
  input.select();
  var committed = false;
  function finish(val) {
    if (committed) return; committed = true;
    titleEl.textContent = val || original;
  }
  async function commit() {
    var val = (input.value || '').trim() || original;
    finish(val);
    if (isCustom) {
      var defId = panel.id.replace('chartPanelCustom_', '');
      var def = customCharts.find(function(c) { return String(c.id) === defId; });
      if (def) { def.title = val; await saveUserCharts(); }
    } else {
      panelTitles[panel.id] = val;
      await saveUserCharts();
    }
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') { input.blur(); }
    if (ev.key === 'Escape') { finish(original); }
  });
}

const DEFAULT_CHART_PANELS = [
  { id: 'chartPanelPersonalMine',  label: 'Ticket personali' },
  { id: 'chartPanelPersonalGroup', label: 'Ticket gruppo' },
  { id: 'chartPanelFab',           label: 'Ticket per FAB' },
  { id: 'chartPanelCat',           label: 'Ticket per categoria' },
  { id: 'chartPanelTeam',          label: 'Ticket per Team' },
  { id: 'chartPanelSeverity',      label: 'Severity Ticket' },
  { id: 'chartPanelUser',          label: 'Ticket Utenti' }
];

const CUSTOM_DIMENSIONS = [
  { value: 'category', label: 'Per categoria', group: 'categories' },
  { value: 'incident', label: 'Per incident', group: '' },
  { value: 'fab', label: 'Per FAB', group: 'fabs' },
  { value: 'team', label: 'Per team', group: 'teams' },
  { value: 'severity', label: 'Per severity', group: 'severities' }
];
const CUSTOM_WINDOWS = [
  { value: 'day',    label: '24h' },
  { value: 'month',  label: 'Mese corrente' },
  { value: 'months', label: 'Anno' },
  { value: 'q1',     label: 'Q1' },
  { value: 'q2',     label: 'Q2' },
  { value: 'q3',     label: 'Q3' },
  { value: 'q4',     label: 'Q4' }
];
const CUSTOM_WINDOW_CUSTOM_VALUE = '__custom__'; // sentinel per il chip "Personalizzato"
const CUSTOM_SCOPES = [
  { value: 'all', label: 'Tutti i ticket' },
  { value: 'mine', label: 'Solo i miei ticket' },
  { value: 'group', label: 'Il mio gruppo' }
];
const CUSTOM_TYPES = [
  { value: 'column', label: 'Colonne' },
  { value: 'bar', label: 'Barre orizzontali' },
  { value: 'donut', label: 'Ciambella' }
];

function customLabel(list, value) { const d = list.find((x) => x.value === value); return d ? d.label : value; }
function customDimensionGroup(value) { const d = CUSTOM_DIMENSIONS.find((x) => x.value === value); return d ? d.group : ''; }
function customChartElementId(def) { return 'custom_' + def.id + 'Chart'; }
function customChartKey(def) { return 'custom_' + def.id; }
function filterableCustomDimension(value) { return value === 'fab' || value === 'team'; }

// Normalizza windows (backward compat: def.window → [def.window])
function defWindows(def) {
  if (Array.isArray(def.windows) && def.windows.length) return def.windows;
  if (def.window) return [def.window];
  return ['months'];
}

// Normalizza dimensions (backward compat: def.dimension (string) → [{type, items:null}])
function defDimensions(def) {
  if (Array.isArray(def.dimensions) && def.dimensions.length) return def.dimensions;
  if (def.dimension) return [{ type: def.dimension, items: null }];
  return [{ type: 'category', items: null }];
}

function defFilterModes(def) {
  const dims = defDimensions(def);
  const dimMap = {};
  const raw = def && def.filters && typeof def.filters === 'object' ? def.filters : {};
  const out = {};
  dims.forEach((d) => { dimMap[d.type] = true; });
  Object.keys(raw).forEach((key) => {
    if (filterableCustomDimension(key) && dimMap[key]) out[key] = !!raw[key];
  });
  if (out.fab === undefined && dimMap.fab && dims.length > 1) out.fab = true;
  return out;
}

function effectiveCustomFilterModes(dims, filterModes) {
  const out = {};
  let plotCount = 0;
  dims.forEach((d) => {
    const filtered = !!(filterModes && filterModes[d.type] && filterableCustomDimension(d.type));
    if (!filtered) plotCount += 1;
  });
  dims.forEach((d) => {
    out[d.type] = !!(filterModes && filterModes[d.type] && filterableCustomDimension(d.type) && plotCount > 0);
  });
  return out;
}

// Meta cache per categorie/incident/fabs/teams/severities
let _metaCache = null;
async function fetchMeta() {
  if (_metaCache) return _metaCache;
  try { _metaCache = await fetchJson('/api/stats/meta'); } catch (e) { _metaCache = { categories: [], incidents: [], fabs: [], teams: [], severities: [] }; }
  return _metaCache;
}

// Etichetta sintetica delle dimensioni di un chart def
function defDimensionsSummary(def) {
  return defDimensions(def).map((d) => {
    const lbl = customLabel(CUSTOM_DIMENSIONS, d.type);
    if (!d.items || !d.items.length) return lbl;
    return lbl + ' (' + d.items.slice(0, 3).join(', ') + (d.items.length > 3 ? ', …' : '') + ')';
  }).join(' + ');
}

// Etichetta leggibile di un singolo window (stringa o oggetto range custom)
function windowLabel(w) {
  if (typeof w === 'string') return customLabel(CUSTOM_WINDOWS, w) || w;
  if (w && typeof w === 'object') return w.label || 'Personalizzato';
  return '?';
}

// Costruisce la querystring per /api/stats/custom dato un window (stringa o oggetto range)
function windowQueryParam(w) {
  if (typeof w === 'string') return 'window=' + encodeURIComponent(w);
  if (w && typeof w === 'object') return 'window=custom&start=' + encodeURIComponent(w.start) + '&end=' + encodeURIComponent(w.end);
  return 'window=months';
}

async function loadUserCharts() {
  try {
    const data = await fetchJson('/api/user-charts');
    customCharts = Array.isArray(data.charts) ? data.charts : [];
    hiddenDefaultPanels = Array.isArray(data.hidden_panels) ? data.hidden_panels : [];
    panelOrder = Array.isArray(data.panel_order) ? data.panel_order : [];
    panelTitles = (data.panel_titles && typeof data.panel_titles === 'object') ? data.panel_titles : {};
    chartSpans = (data.chart_spans && typeof data.chart_spans === 'object') ? data.chart_spans : chartSpans;
    chartTypes = (data.chart_types && typeof data.chart_types === 'object') ? data.chart_types : chartTypes;
    currentPaletteId = typeof data.palette === 'string' && data.palette ? data.palette : currentPaletteId;
    currentDarkMode = !!data.dark_mode;
    applyTheme(currentPaletteId, currentDarkMode);
    applyAllChartSpans();
    if (data.chart_custom_ranges && typeof data.chart_custom_ranges === 'object') {
      Object.keys(chartCustomRanges).forEach((t) => {
        const r = data.chart_custom_ranges[t];
        if (r && r.start && r.end) chartCustomRanges[t] = { start: r.start, end: r.end };
      });
    }
    if (data.chart_modes && typeof data.chart_modes === 'object') {
      const modes = data.chart_modes;
      const allowed = ['day', 'months', 'q1', 'q2', 'q3', 'q4', 'custom'];
      if (allowed.includes(modes.fabYear) && (modes.fabYear !== 'custom' || chartCustomRanges.fabYear)) fabYearMode = modes.fabYear;
      if (allowed.includes(modes.catYear) && (modes.catYear !== 'custom' || chartCustomRanges.catYear)) catYearMode = modes.catYear;
      if (allowed.includes(modes.teamYear) && (modes.teamYear !== 'custom' || chartCustomRanges.teamYear)) teamYearMode = modes.teamYear;
      if (allowed.includes(modes.severityYear) && (modes.severityYear !== 'custom' || chartCustomRanges.severityYear)) severityYearMode = modes.severityYear;
      if (allowed.includes(modes.userYear) && (modes.userYear !== 'custom' || chartCustomRanges.userYear)) userYearMode = modes.userYear;
      document.querySelectorAll('.range-btn').forEach((btn) => {
        const t = btn.dataset.target;
        const m = btn.dataset.mode;
        if (t && m) {
          const active = (t === 'fabYear' && m === fabYearMode) || (t === 'catYear' && m === catYearMode) ||
            (t === 'teamYear' && m === teamYearMode) || (t === 'severityYear' && m === severityYearMode) ||
            (t === 'userYear' && m === userYearMode);
          btn.classList.toggle('active', active);
        }
      });
      document.querySelectorAll('.range-calendar-btn').forEach((btn) => {
        const t = btn.dataset.target;
        const modeByKey = { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, severityYear: severityYearMode, userYear: userYearMode };
        btn.classList.toggle('active', modeByKey[t] === 'custom');
      });
    }
  } catch (e) {
    console.error(e);
    customCharts = [];
    hiddenDefaultPanels = [];
    panelOrder = [];
    panelTitles = {};
  }
  applyDefaultPanelVisibility();
  setupDefaultPanelHideButtons();
  renderAllCustomCharts();
  if (panelOrder.length) applyPanelOrder();
  applyPanelTitles();
  applyAllChartSpans();
}

async function saveUserCharts() {
  try {
    const data = await fetchJson('/api/user-charts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charts: customCharts, hidden_panels: hiddenDefaultPanels, panel_order: panelOrder, panel_titles: panelTitles, chart_modes: { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, severityYear: severityYearMode, userYear: userYearMode }, chart_custom_ranges: chartCustomRanges, chart_spans: chartSpans, chart_types: chartTypes, palette: currentPaletteId, dark_mode: currentDarkMode })
    });
    if (Array.isArray(data.charts)) customCharts = data.charts;
    if (Array.isArray(data.hidden_panels)) hiddenDefaultPanels = data.hidden_panels;
    if (Array.isArray(data.panel_order)) panelOrder = data.panel_order;
    if (data.panel_titles && typeof data.panel_titles === 'object') panelTitles = data.panel_titles;
    if (data.chart_spans && typeof data.chart_spans === 'object') chartSpans = data.chart_spans;
    if (data.chart_types && typeof data.chart_types === 'object') chartTypes = data.chart_types;
    if (typeof data.palette === 'string' && data.palette) currentPaletteId = data.palette;
    currentDarkMode = !!data.dark_mode;
  } catch (e) {
    console.error(e);
    showToast('Impossibile salvare le impostazioni della dashboard. Verifica la connessione e riprova.', 'error', 'Salvataggio fallito');
  }
}

function applyPanelOrder() {
  const grid = document.getElementById('chartsGrid');
  const addCard = document.getElementById('addChartCard');
  if (!grid || !panelOrder.length) return;
  const orderedIds = {};
  panelOrder.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.parentElement === grid) {
      orderedIds[id] = true;
      if (addCard) grid.insertBefore(el, addCard); else grid.appendChild(el);
    }
  });
  grid.querySelectorAll(':scope > .panel[id]').forEach((el) => {
    if (el === addCard) return;
    if (!orderedIds[el.id]) {
      if (addCard) grid.insertBefore(el, addCard); else grid.appendChild(el);
    }
  });
  if (addCard) grid.appendChild(addCard);
}

function applyDefaultPanelVisibility() {
  DEFAULT_CHART_PANELS.forEach((def) => {
    const panel = document.getElementById(def.id);
    if (!panel) return;
    const hidden = hiddenDefaultPanels.includes(def.id);
    panel.style.display = hidden ? 'none' : '';
  });
}

async function resetDashboardLayout() {
  hiddenDefaultPanels = [];
  panelOrder = [];
  const grid = document.getElementById('chartsGrid');
  const addCard = document.getElementById('addChartCard');
  if (grid) {
    // Ripristina ordine DOM: prima i default, poi i custom, poi il card +
    DEFAULT_CHART_PANELS.forEach(function(def) {
      const el = document.getElementById(def.id);
      if (el) {
        el.style.display = '';
        if (addCard) grid.insertBefore(el, addCard); else grid.appendChild(el);
      }
    });
    // I pannelli custom rimangono dove sono (non vengono toccati)
    if (addCard) grid.appendChild(addCard);
  }
  await saveUserCharts();
}

function setupDefaultPanelHideButtons() {
  DEFAULT_CHART_PANELS.forEach((def) => {
    const panel = document.getElementById(def.id);
    if (!panel) return;
    const head = panel.querySelector('.panel-heading-row');
    if (!head || head.querySelector('.default-chart-hide-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'custom-chart-delete default-chart-hide-btn';
    btn.title = 'Rimuovi dalla dashboard';
    btn.setAttribute('aria-label', 'Rimuovi dalla dashboard');
    btn.textContent = '×';
    btn.addEventListener('click', async () => {
      if (!(await showConfirm('Il pannello verrà rimosso dalla dashboard. Potrai ripristinarlo in seguito dalle impostazioni.', { title: 'Rimuovi pannello', type: 'warning', confirmText: 'Rimuovi', cancelText: 'Annulla' }))) return;
      if (!hiddenDefaultPanels.includes(def.id)) hiddenDefaultPanels.push(def.id);
      panelOrder = panelOrder.filter((id) => id !== def.id);
      panel.style.display = 'none';
      await saveUserCharts();
    });
    head.appendChild(btn);
  });
}

function renderAllCustomCharts() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .custom-chart-panel').forEach((p) => p.remove());
  customCharts.forEach((def) => {
    const panel = renderCustomChartCard(def);
    keepAddChartCardLast(grid, panel);
  });
  keepAddChartCardLast(grid);
  applyAllChartSpans();
  setupChartResizeControls();
}

function syncPanelOrderFromGrid() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  const order = [];
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    if (panel.id === 'addChartCard') return;
    order.push(panel.id);
  });
  panelOrder = order;
}

function keepAddChartCardLast(grid, panelToInsert) {
  const root = grid || document.getElementById('chartsGrid');
  if (!root) return;
  const addCard = document.getElementById('addChartCard');
  if (panelToInsert && panelToInsert !== addCard) {
    if (addCard && addCard.parentElement === root) root.insertBefore(panelToInsert, addCard);
    else root.appendChild(panelToInsert);
  }
  if (addCard && addCard.parentElement === root) root.appendChild(addCard);
}

function renderCustomChartCard(def) {
  const windows = defWindows(def);
  let activeWindow = windows[0];

  const panel = document.createElement('section');
  panel.className = 'panel custom-chart-panel';
  panel.id = 'chartPanelCustom_' + def.id;

  // --- heading (solo titolo + pulsante elimina) ---
  const head = document.createElement('div');
  head.className = 'panel-heading-row';

  const h3 = document.createElement('h3');
  h3.textContent = def.title || 'Grafico personalizzato';
  head.appendChild(h3);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'custom-chart-delete';
  del.title = 'Elimina grafico';
  del.setAttribute('aria-label', 'Elimina grafico');
  del.textContent = '×';
  del.addEventListener('click', async () => {
    if (!(await showConfirm('Il grafico personalizzato verrà eliminato definitivamente dalla dashboard.', { title: 'Elimina grafico', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
    customCharts = customCharts.filter((c) => c.id !== def.id);
    panelOrder = panelOrder.filter((id) => id !== panel.id);
    panel.remove();
    await saveUserCharts();
  });
  head.appendChild(del);

  panel.appendChild(head);

  // --- riga controlli: tendina tipo grafico (frecce resize aggiunte da setupChartResizeControls) ---
  const controlsRow = document.createElement('div');
  controlsRow.className = 'chart-controls-row';

  const typeSelect = document.createElement('select');
  typeSelect.className = 'chart-type-select';
  typeSelect.setAttribute('aria-label', 'Tipo grafico');
  CUSTOM_TYPES.forEach((c) => {
    const o = document.createElement('option');
    o.value = c.value;
    o.textContent = c.label;
    typeSelect.appendChild(o);
  });
  typeSelect.value = def.type || 'column';
  typeSelect.addEventListener('change', async () => {
    def.type = normalizeChartType(typeSelect.value);
    chartTypes[customChartKey(def)] = def.type;
    const target = document.getElementById(customChartElementId(def));
    if (target) await loadCustomChartData(def, target, activeWindow);
    await saveUserCharts();
  });
  controlsRow.appendChild(typeSelect);

  panel.appendChild(controlsRow);

  // --- toggle row: sempre visibile (anche con una sola finestra) ---
  const toggleRow = document.createElement('div');
  toggleRow.className = 'toggle-row';
  const getChartDiv = () => document.getElementById(customChartElementId(def));
  windows.forEach((w, i) => {
    const btn = document.createElement('button');
    btn.className = 'range-btn' + (i === 0 ? ' active' : '');
    btn.type = 'button';
    btn.textContent = windowLabel(w);
    btn.addEventListener('click', () => {
      if (activeWindow === w) return;
      activeWindow = w;
      toggleRow.querySelectorAll('.range-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const t = getChartDiv();
      if (t) loadCustomChartData(def, t, activeWindow);
    });
    toggleRow.appendChild(btn);
  });
  panel.appendChild(toggleRow);

  // --- area grafico ---
  const chartDiv = document.createElement('div');
  chartDiv.id = customChartElementId(def);
  chartDiv.className = 'chart vertical-chart custom-chart';
  panel.appendChild(chartDiv);

  customChartGroupMap[customChartKey(def)] = customDimensionGroup(defDimensions(def)[0].type);
  chartTypes[customChartKey(def)] = def.type || 'column';

  attachChartDragHandle(panel);
  loadCustomChartData(def, chartDiv, activeWindow);
  return panel;
}

async function loadCustomChartData(def, target, activeWindow) {
  const w = activeWindow !== undefined ? activeWindow : defWindows(def)[0];
  target.innerHTML = '<p class="muted">Caricamento…</p>';
  try {
    const dims = defDimensions(def);
    const filterModes = effectiveCustomFilterModes(dims, defFilterModes(def));
    const plotDims = dims.filter((d) => !filterModes[d.type]);
    const params = new URLSearchParams();
    plotDims.forEach((d) => params.append('dimensions[]', d.type));
    dims.forEach((d) => {
      if (d.items && d.items.length) {
        d.items.forEach((item) => params.append('filter_' + d.type + '[]', item));
      }
    });
    params.set('scope', def.scope || 'all');
    // window param
    if (typeof w === 'string') {
      params.set('window', w);
    } else if (w && typeof w === 'object') {
      params.set('window', 'custom');
      params.set('start', w.start);
      params.set('end', w.end);
    }
    const data = await fetchJson('/api/stats/custom?' + params.toString());
    const stats = Array.isArray(data.stats) ? data.stats : [];
    chartTypes[customChartKey(def)] = def.type || 'column';
    if (!stats.length || stats.every((s) => !Number(s.total))) {
      target.innerHTML = '<p class="muted">Nessun dato per il periodo selezionato.</p>';
      return;
    }
    // Config filtro-ticket: supportato solo con una singola dimensione di plot.
    if (plotDims.length === 1) {
      const filterObj = {};
      dims.forEach((d) => { if (d.items && d.items.length) filterObj[d.type] = d.items.slice(); });
      target._chartFilter = {
        dimension: plotDims[0].type,
        scope: def.scope || 'all',
        window: (typeof w === 'string') ? w : 'custom',
        start: (w && w.start) || '',
        end: (w && w.end) || '',
        filters: filterObj
      };
    } else {
      target._chartFilter = null;
    }
    renderChart(target, stats);
  } catch (e) {
    console.error(e);
    target.innerHTML = '<p class="muted">Impossibile caricare il grafico.</p>';
  }
}

function refreshCustomCharts() {
  customCharts.forEach((def) => {
    const target = document.getElementById(customChartElementId(def));
    if (target) {
      // Trova la finestra attiva corrente dal pulsante attivo nel toggle row
      const panel = target.closest('.custom-chart-panel');
      const activeBtn = panel ? panel.querySelector('.toggle-row .range-btn.active') : null;
      loadCustomChartData(def, target, activeBtn ? defWindows(def).find((w) => windowLabel(w) === activeBtn.textContent) : undefined);
    }
  });
}

function buildCustomSelect(options, value) {
  const select = document.createElement('select');
  select.className = 'add-chart-select';
  options.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  });
  if (value) select.value = value;
  return select;
}

function openAddChartModal() {
  const overlay = document.createElement('div');
  overlay.className = 'report-modal-overlay';
  function closeOverlay() { overlay.remove(); document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') closeOverlay(); }
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

  const panel = document.createElement('div');
  panel.className = 'report-modal-panel add-chart-modal-panel';

  const header = document.createElement('div');
  header.className = 'report-modal-header';
  const title = document.createElement('h3');
  title.textContent = 'Aggiungi grafico';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'report-modal-close';
  closeBtn.setAttribute('aria-label', 'Chiudi');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeOverlay);
  header.appendChild(title);
  header.appendChild(closeBtn);

  const desc = document.createElement('p');
  desc.className = 'report-modal-desc';
  desc.textContent = 'Quali informazioni vorresti visualizzare?';

  // --- Dropdown grafici default ---
  const defSection = document.createElement('div');
  defSection.className = 'add-chart-section';

  const defTitle = document.createElement('div');
  defTitle.className = 'add-chart-section-title';
  defTitle.textContent = 'Grafici default';
  defSection.appendChild(defTitle);

  const defWrap = document.createElement('div');
  defWrap.className = 'add-chart-default-dropdown-wrap';

  const defSelect = document.createElement('select');
  defSelect.className = 'add-chart-select';
  const defPlaceholder = document.createElement('option');
  defPlaceholder.value = '';
  defPlaceholder.textContent = '— Seleziona un grafico default —';
  defSelect.appendChild(defPlaceholder);

  DEFAULT_CHART_PANELS.forEach((def) => {
    const opt = document.createElement('option');
    opt.value = def.id;
    const alreadyVisible = !hiddenDefaultPanels.includes(def.id);
    opt.textContent = def.label + (alreadyVisible ? ' (già in dashboard)' : '');
    opt.disabled = alreadyVisible;
    defSelect.appendChild(opt);
  });

  const defAddBtn = document.createElement('button');
  defAddBtn.type = 'button';
  defAddBtn.className = 'primary';
  defAddBtn.textContent = 'Ripristina grafico';
  defAddBtn.addEventListener('click', async () => {
    const panelId = defSelect.value;
    if (!panelId) { showToast('Seleziona prima un grafico dalla lista a tendina per poterlo ripristinare.', 'warning', 'Nessun grafico selezionato'); return; }
    hiddenDefaultPanels = hiddenDefaultPanels.filter((id) => id !== panelId);
    const el = document.getElementById(panelId);
    if (el) el.style.display = '';
    closeOverlay();
    await saveUserCharts();
  });

  const resetAllBtn = document.createElement('button');
  resetAllBtn.type = 'button';
  resetAllBtn.className = 'secondary';
  resetAllBtn.style.cssText = 'margin-top:8px;width:100%';
  resetAllBtn.textContent = '↺ Ripristina tutto (posizioni e grafici iniziali)';
  resetAllBtn.addEventListener('click', async () => {
    if (!(await showConfirm('Tutti i grafici torneranno alla disposizione originale e i grafici personalizzati verranno rimossi. L\'operazione non è reversibile.', { title: 'Ripristina dashboard', type: 'warning', confirmText: 'Ripristina', cancelText: 'Annulla' }))) return;
    closeOverlay();
    await resetDashboardLayout();
  });

  defWrap.appendChild(defSelect);
  defWrap.appendChild(defAddBtn);
  defSection.appendChild(defWrap);
  defSection.appendChild(resetAllBtn);

  // --- Divisore ---
  const divider = document.createElement('div');
  divider.className = 'add-chart-divider';
  const dividerLabel = document.createElement('span');
  dividerLabel.className = 'add-chart-divider-label';
  dividerLabel.textContent = 'Oppure crea un grafico personalizzato';
  divider.appendChild(dividerLabel);

  // 1) Finestre temporali (chip multi-select + range personalizzato)
  const winField = document.createElement('div');
  winField.className = 'add-chart-field';
  const winLabel = document.createElement('label');
  winLabel.className = 'add-chart-label';
  winLabel.textContent = 'Finestre temporali (selezionabili nel grafico)';
  const winChips = document.createElement('div');
  winChips.className = 'add-chart-chips';

  // Chip per le finestre predefinite
  const selectedWindowValues = new Set(['months']); // string per predefinite
  const customRanges = []; // oggetti {label, start, end}

  CUSTOM_WINDOWS.forEach((w) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'add-chart-chip';
    chip.textContent = w.label;
    chip.dataset.value = w.value;
    if (selectedWindowValues.has(w.value)) chip.classList.add('active');
    chip.addEventListener('click', () => {
      if (selectedWindowValues.has(w.value)) { selectedWindowValues.delete(w.value); chip.classList.remove('active'); }
      else { selectedWindowValues.add(w.value); chip.classList.add('active'); }
    });
    winChips.appendChild(chip);
  });

  // Chip "Personalizzato"
  const customChip = document.createElement('button');
  customChip.type = 'button';
  customChip.className = 'add-chart-chip add-chart-chip-custom';
  customChip.textContent = '+ Range personalizzato';
  winChips.appendChild(customChip);

  winField.appendChild(winLabel);
  winField.appendChild(winChips);

  // Pannello date picker (nascosto di default)
  const customRangePanel = document.createElement('div');
  customRangePanel.className = 'add-chart-custom-range';
  customRangePanel.hidden = true;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = new Date().getFullYear() + '-01-01';

  const startWrap = document.createElement('div');
  startWrap.className = 'add-chart-range-row';
  const startLabel = document.createElement('label');
  startLabel.className = 'add-chart-range-label';
  startLabel.textContent = 'Da:';
  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.className = 'add-chart-input add-chart-date-input';
  startInput.value = firstOfYear;
  startInput.max = today;
  startWrap.appendChild(startLabel);
  startWrap.appendChild(startInput);

  const endWrap = document.createElement('div');
  endWrap.className = 'add-chart-range-row';
  const endLabel = document.createElement('label');
  endLabel.className = 'add-chart-range-label';
  endLabel.textContent = 'A:';
  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.className = 'add-chart-input add-chart-date-input';
  endInput.value = today;
  endInput.max = today;
  endWrap.appendChild(endLabel);
  endWrap.appendChild(endInput);

  const rangeTagList = document.createElement('div');
  rangeTagList.className = 'add-chart-range-tags';

  const addRangeBtn = document.createElement('button');
  addRangeBtn.type = 'button';
  addRangeBtn.className = 'secondary';
  addRangeBtn.textContent = 'Aggiungi questo range';

  function renderRangeTags() {
    rangeTagList.innerHTML = '';
    customRanges.forEach((r, i) => {
      const tag = document.createElement('span');
      tag.className = 'add-chart-range-tag';
      tag.textContent = r.label;
      const rem = document.createElement('button');
      rem.type = 'button';
      rem.textContent = '×';
      rem.className = 'add-chart-range-tag-remove';
      rem.addEventListener('click', () => { customRanges.splice(i, 1); renderRangeTags(); });
      tag.appendChild(rem);
      rangeTagList.appendChild(tag);
    });
  }

  addRangeBtn.addEventListener('click', () => {
    const s = startInput.value;
    const e = endInput.value;
    if (!s || !e || s >= e) { showToast('La data di inizio deve essere precedente alla data di fine. Correggi il periodo selezionato e riprova.', 'warning', 'Intervallo non valido'); return; }
    const label = s.slice(0, 7).replace('-', '/') + ' → ' + e.slice(0, 7).replace('-', '/');
    customRanges.push({ label, start: s, end: e });
    renderRangeTags();
  });

  customRangePanel.appendChild(startWrap);
  customRangePanel.appendChild(endWrap);
  customRangePanel.appendChild(addRangeBtn);
  customRangePanel.appendChild(rangeTagList);

  customChip.addEventListener('click', () => {
    customRangePanel.hidden = !customRangePanel.hidden;
    customChip.classList.toggle('active', !customRangePanel.hidden);
  });

  winField.appendChild(customRangePanel);

  // 2) Dati — multi-dimensione con item picker (caricato async da /api/stats/meta)
  const dataField = document.createElement('div');
  dataField.className = 'add-chart-field';
  const dataFieldLabel = document.createElement('label');
  dataFieldLabel.className = 'add-chart-label';
  dataFieldLabel.textContent = 'Dati da visualizzare';
  dataField.appendChild(dataFieldLabel);

  const dimSections = document.createElement('div');
  dimSections.className = 'add-chart-dim-sections';
  dataField.appendChild(dimSections);

  // Stato selezionato: Map<dimType, Set<string>|null>  (null = tutte)
  // null = non incluso in questo grafico, Set vuoto = tutti, Set pieno = selezionati
  const selectedDims = new Map(); // dimType → null | Set<string>
  const selectedDimFilters = { fab: false, team: false };

  // Helper per costruire un accordion-section per una dimensione
  function buildDimSection(dimDef, items) {
    const sec = document.createElement('div');
    sec.className = 'add-chart-dim-sec';
    sec.dataset.dim = dimDef.value;

    // Header: toggle enable + nome
    const secHead = document.createElement('div');
    secHead.className = 'add-chart-dim-head';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'dimChk_' + dimDef.value;
    chk.className = 'add-chart-dim-checkbox';

    const lbl = document.createElement('label');
    lbl.htmlFor = chk.id;
    lbl.className = 'add-chart-dim-name';
    lbl.textContent = dimDef.label;

    const countBadge = document.createElement('span');
    countBadge.className = 'add-chart-dim-badge';
    countBadge.textContent = 'tutti';

    secHead.appendChild(chk);
    secHead.appendChild(lbl);
    secHead.appendChild(countBadge);

    let filterToggleBtn = null;
    function updateFilterToggleBtn() {
      if (!filterToggleBtn) return;
      const enabled = chk.checked;
      const active = !!selectedDimFilters[dimDef.value];
      filterToggleBtn.disabled = !enabled;
      filterToggleBtn.classList.toggle('active', enabled && active);
      filterToggleBtn.textContent = enabled && active ? 'Filtro ON' : 'Filtro OFF';
      filterToggleBtn.title = enabled ? 'Attiva o disattiva l\'uso come filtro' : 'Abilita prima la dimensione';
    }

    if (filterableCustomDimension(dimDef.value)) {
      filterToggleBtn = document.createElement('button');
      filterToggleBtn.type = 'button';
      filterToggleBtn.className = 'add-chart-filter-toggle';
      filterToggleBtn.addEventListener('click', () => {
        if (!chk.checked) return;
        selectedDimFilters[dimDef.value] = !selectedDimFilters[dimDef.value];
        updateFilterToggleBtn();
      });
      secHead.appendChild(filterToggleBtn);
      updateFilterToggleBtn();
    }

    const secBody = document.createElement('div');
    secBody.className = 'add-chart-dim-body';
    secBody.hidden = true;

    if (items && items.length) {
      const selectBar = document.createElement('div');
      selectBar.className = 'add-chart-dim-selectbar';
      const selAll = document.createElement('button');
      selAll.type = 'button'; selAll.className = 'add-chart-dim-sellink'; selAll.textContent = 'Tutti';
      const selNone = document.createElement('button');
      selNone.type = 'button'; selNone.className = 'add-chart-dim-sellink'; selNone.textContent = 'Nessuno';
      selectBar.appendChild(selAll); selectBar.appendChild(document.createTextNode(' · ')); selectBar.appendChild(selNone);
      secBody.appendChild(selectBar);

      const itemGrid = document.createElement('div');
      itemGrid.className = 'add-chart-dim-item-grid';

      const itemChips = [];
      items.forEach((item) => {
        const ic = document.createElement('button');
        ic.type = 'button';
        ic.className = 'add-chart-chip add-chart-dim-item active';
        ic.textContent = typeof item === 'object' ? (item.display || item.label) : item;
        ic.dataset.val  = typeof item === 'object' ? (item.val   || item.label) : item;
        ic.addEventListener('click', () => {
          ic.classList.toggle('active');
          updateDimBadge();
        });
        itemChips.push(ic);
        itemGrid.appendChild(ic);
      });

      selAll.addEventListener('click', () => { itemChips.forEach((c) => c.classList.add('active')); updateDimBadge(); });
      selNone.addEventListener('click', () => { itemChips.forEach((c) => c.classList.remove('active')); updateDimBadge(); });

      secBody.appendChild(itemGrid);

      function updateDimBadge() {
        const active = itemChips.filter((c) => c.classList.contains('active'));
        if (active.length === 0 || active.length === itemChips.length) {
          countBadge.textContent = 'tutti';
          selectedDims.set(dimDef.value, new Set()); // empty set = tutti
        } else {
          countBadge.textContent = active.length + ' selezionati';
          selectedDims.set(dimDef.value, new Set(active.map((c) => c.dataset.val)));
        }
      }
    }

    chk.addEventListener('change', () => {
      if (chk.checked) {
        selectedDims.set(dimDef.value, new Set()); // tutti di default
        secBody.hidden = false;
      } else {
        selectedDims.delete(dimDef.value);
        if (filterableCustomDimension(dimDef.value)) selectedDimFilters[dimDef.value] = false;
        secBody.hidden = true;
      }
      sec.classList.toggle('enabled', chk.checked);
      updateFilterToggleBtn();
    });

    sec.appendChild(secHead);
    sec.appendChild(secBody);
    dimSections.appendChild(sec);
  }

  // Carica meta e popola le sezioni
  (async () => {
    dimSections.innerHTML = '<p class="muted" style="font-size:.82rem;padding:6px 0">Caricamento opzioni…</p>';
    const meta = await fetchMeta();
    dimSections.innerHTML = '';

    // Rileva incident con nome duplicato e aggiunge "(Categoria)" per disambiguare
    const incNameCount = {};
    meta.incidents.forEach((i) => { incNameCount[i.name] = (incNameCount[i.name] || 0) + 1; });
    const incItems = meta.incidents.map((i) => {
      if (incNameCount[i.name] > 1) {
        const catName = i.category_name || '';
        return { display: i.name + (catName ? ' (' + catName + ')' : ''), val: i.name };
      }
      return i.name;
    });

    const dimItemsMap = {
      category: meta.categories.map((c) => c.name),
      incident: incItems,
      fab:      meta.fabs,
      team:     meta.teams,
      severity: meta.severities.map((s) => s.label)
    };

    CUSTOM_DIMENSIONS.forEach((dimDef) => {
      buildDimSection(dimDef, dimItemsMap[dimDef.value] || []);
    });

    // Mappa incident_name → Set<fab_default> e category_name → Set<fab>
    const incFabLookup = {};
    const catFabsLookup = {};
    meta.incidents.forEach((i) => {
      const fab = (i.fab_default || '').toUpperCase();
      if (!incFabLookup[i.name]) incFabLookup[i.name] = new Set();
      if (fab) incFabLookup[i.name].add(fab);
      const cat = i.category_name || '';
      if (cat) {
        if (!catFabsLookup[cat]) catFabsLookup[cat] = new Set();
        if (fab) catFabsLookup[cat].add(fab);
      }
    });

    const fabSecEl = dimSections.querySelector('[data-dim="fab"]');
    const catSecEl = dimSections.querySelector('[data-dim="category"]');
    const incSecEl = dimSections.querySelector('[data-dim="incident"]');

    // Badge che appare nell'header FAB per segnalare la modalità filtro
    const fabFilterBadge = document.createElement('span');
    fabFilterBadge.className = 'add-chart-fab-filter-badge';
    fabFilterBadge.textContent = 'filtro';
    fabFilterBadge.style.display = 'none';
    fabSecEl?.querySelector('.add-chart-dim-head')?.appendChild(fabFilterBadge);

    function applyFabFilter() {
      const fabChk = fabSecEl?.querySelector('.add-chart-dim-checkbox');
      const otherEnabled = !!dimSections.querySelector('[data-dim]:not([data-dim="fab"]) .add-chart-dim-checkbox:checked');
      const fabEnabled = fabChk?.checked;
      const fabFiltering = fabEnabled && otherEnabled && !!selectedDimFilters.fab;
      fabFilterBadge.style.display = fabFiltering ? '' : 'none';

      if (!fabFiltering) {
        catSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => { c.style.display = ''; });
        incSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => { c.style.display = ''; });
        return;
      }
      const activeFabChips = Array.from(fabSecEl.querySelectorAll('.add-chart-dim-item.active'));
      const allFabChips = fabSecEl.querySelectorAll('.add-chart-dim-item');
      if (!activeFabChips.length || activeFabChips.length === allFabChips.length) {
        catSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => { c.style.display = ''; });
        incSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => { c.style.display = ''; });
        return;
      }
      const activeFabs = new Set(activeFabChips.map((c) => c.dataset.val));
      incSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => {
        const fabs = incFabLookup[c.dataset.val] || new Set();
        c.style.display = (!fabs.size || Array.from(fabs).some((f) => activeFabs.has(f))) ? '' : 'none';
      });
      catSecEl?.querySelectorAll('.add-chart-dim-item').forEach((c) => {
        const fabs = catFabsLookup[c.dataset.val] || new Set();
        c.style.display = (!fabs.size || Array.from(fabs).some((f) => activeFabs.has(f))) ? '' : 'none';
      });
    }

    // Reagisce a click sui chip FAB (dopo il toggle active della chip stessa)
    if (fabSecEl) {
      fabSecEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-chart-dim-item') || e.target.classList.contains('add-chart-dim-sellink') || e.target.classList.contains('add-chart-filter-toggle')) {
          setTimeout(applyFabFilter, 0);
        }
      });
      fabSecEl.querySelector('.add-chart-dim-checkbox')?.addEventListener('change', applyFabFilter);
    }
    // Reagisce all'abilitazione/disabilitazione di qualsiasi altra sezione
    dimSections.addEventListener('change', (e) => {
      if (e.target !== fabSecEl?.querySelector('.add-chart-dim-checkbox') &&
          e.target.classList.contains('add-chart-dim-checkbox')) {
        applyFabFilter();
      }
    });

    // Pre-seleziona "categoria" come default
    const firstChk = dimSections.querySelector('#dimChk_category');
    if (firstChk) { firstChk.checked = true; firstChk.dispatchEvent(new Event('change')); }
  })();

  // 3) Ambito
  const scopeField = document.createElement('div');
  scopeField.className = 'add-chart-field';
  const scopeLabel = document.createElement('label');
  scopeLabel.className = 'add-chart-label';
  scopeLabel.textContent = 'Ambito';
  const scopeSelect = buildCustomSelect(CUSTOM_SCOPES, 'all');
  scopeField.appendChild(scopeLabel);
  scopeField.appendChild(scopeSelect);

  // 4) Tipo di grafico
  const typeField = document.createElement('div');
  typeField.className = 'add-chart-field';
  const typeLabel = document.createElement('label');
  typeLabel.className = 'add-chart-label';
  typeLabel.textContent = 'Tipo di grafico';
  const typeSelect = buildCustomSelect(CUSTOM_TYPES, 'column');
  typeField.appendChild(typeLabel);
  typeField.appendChild(typeSelect);

  // Titolo opzionale
  const titleField = document.createElement('div');
  titleField.className = 'add-chart-field';
  const titleLabel = document.createElement('label');
  titleLabel.className = 'add-chart-label';
  titleLabel.textContent = 'Titolo (opzionale)';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'add-chart-input';
  titleInput.maxLength = 80;
  titleInput.placeholder = 'Es. Categorie Q1';
  titleField.appendChild(titleLabel);
  titleField.appendChild(titleInput);

  const actions = document.createElement('div');
  actions.className = 'report-modal-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Annulla';
  cancelBtn.addEventListener('click', closeOverlay);
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'primary';
  confirmBtn.textContent = 'Crea grafico →';
  confirmBtn.addEventListener('click', async () => {
    const windowsList = [...Array.from(selectedWindowValues), ...customRanges];
    if (!windowsList.length) { showToast('Scegli almeno una finestra temporale (es. settimana, mese) prima di creare il grafico.', 'warning', 'Selezione incompleta'); return; }
    if (!selectedDims.size) { showToast('Scegli almeno un tipo di dato da visualizzare (es. incidenti, downtime) prima di creare il grafico.', 'warning', 'Selezione incompleta'); return; }

    // Costruisce l'array dimensions
    const dimensionsArr = [];
    selectedDims.forEach((itemSet, dimType) => {
      const items = itemSet && itemSet.size > 0 ? Array.from(itemSet) : null;
      dimensionsArr.push({ type: dimType, items });
    });

    const scope = scopeSelect.value;
    const type = typeSelect.value;
    const baseTitle = titleInput.value.trim();
    confirmBtn.disabled = true;

    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filterModes = effectiveCustomFilterModes(dimensionsArr, selectedDimFilters);
    const titleDims = dimensionsArr.filter((d) => !filterModes[d.type]);
    const filterSuffixes = [];
    dimensionsArr.forEach((d) => {
      if (!filterModes[d.type] || !d.items || !d.items.length) return;
      filterSuffixes.push('[' + customLabel(CUSTOM_DIMENSIONS, d.type).replace(/^Per /i, '').toUpperCase() + ': ' + d.items.join(', ') + ']');
    });
    const autoTitle = titleDims.map((d) => customLabel(CUSTOM_DIMENSIONS, d.type)).join(' + ') +
      (filterSuffixes.length ? ' ' + filterSuffixes.join(' ') : '') +
      (windowsList.length === 1 ? ' (' + windowLabel(windowsList[0]) + ')' : '');
    const titleText = baseTitle || autoTitle;

    customCharts.push({ id, title: titleText, dimensions: dimensionsArr, windows: windowsList, scope, type, filters: filterModes });
    closeOverlay();
    renderAllCustomCharts();
    syncPanelOrderFromGrid();
    await saveUserCharts();
  });
  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);

  const modalBody = document.createElement('div');
  modalBody.className = 'add-chart-modal-body';
  modalBody.appendChild(desc);
  modalBody.appendChild(defSection);
  modalBody.appendChild(divider);
  modalBody.appendChild(winField);
  modalBody.appendChild(dataField);
  modalBody.appendChild(scopeField);
  modalBody.appendChild(typeField);
  modalBody.appendChild(titleField);

  panel.appendChild(header);
  panel.appendChild(modalBody);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

document.getElementById('addChartCard')?.addEventListener('click', openAddChartModal);

document.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeModal));
// La modale del ticket si chiude solo con la X / Annulla, non cliccando fuori.
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

function setChartMode(target, mode) {
  if (target === 'fabYear') fabYearMode = mode;
  if (target === 'catYear') catYearMode = mode;
  if (target === 'teamYear') teamYearMode = mode;
  if (target === 'severityYear') severityYearMode = mode;
  if (target === 'userYear') userYearMode = mode;
}

function clearChartRangeActiveState(target) {
  document.querySelectorAll(`.range-btn[data-target="${target}"]`).forEach((x) => x.classList.remove('active'));
  const calendarBtn = document.querySelector(`.range-calendar-btn[data-target="${target}"]`);
  if (calendarBtn) calendarBtn.classList.remove('active');
}

document.querySelectorAll('.range-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const target = btn.dataset.target;
    const mode = btn.dataset.mode;
    clearChartRangeActiveState(target);
    btn.classList.add('active');
    setChartMode(target, mode);
    await loadCharts();
    saveUserCharts();
  });
});

document.querySelectorAll('.range-calendar-wrap').forEach((wrap) => {
  const target = wrap.dataset.target;
  const btn = wrap.querySelector('.range-calendar-btn');
  const popover = wrap.querySelector('.range-calendar-popover');
  const startInput = wrap.querySelector('.range-calendar-start');
  const endInput = wrap.querySelector('.range-calendar-end');
  const applyBtn = wrap.querySelector('.range-calendar-apply');
  const today = new Date().toISOString().slice(0, 10);
  startInput.max = today;
  endInput.max = today;

  function closePopover() { popover.hidden = true; }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = popover.hidden;
    document.querySelectorAll('.range-calendar-popover').forEach((p) => { p.hidden = true; });
    popover.hidden = !willOpen;
    if (willOpen) {
      const existing = chartCustomRanges[target];
      if (existing) { startInput.value = existing.start; endInput.value = existing.end; }
    }
  });

  applyBtn.addEventListener('click', async () => {
    const s = startInput.value;
    const en = endInput.value;
    if (!s || !en || s > en) {
      showToast('Seleziona un intervallo di date valido: la data di inizio deve precedere (o coincidere con) quella di fine.', 'warning', 'Intervallo non valido');
      return;
    }
    chartCustomRanges[target] = { start: s, end: en };
    clearChartRangeActiveState(target);
    btn.classList.add('active');
    setChartMode(target, 'custom');
    closePopover();
    await loadCharts();
    saveUserCharts();
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closePopover();
  });
});

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!beginTicketSubmitLock()) return;
  const incident_id = Number(incidentTypeInput.value || 0);
  const descEl = document.getElementById('description');
  const presetTokens = collectPresetStateFromComposer(presetInlineComposer ? presetInlineComposer.dataset.presetTemplate : '', presetInlineComposer);
  const description = ((descEl.dataset.presetAutoSync !== 'off') && presetTokens.length)
    ? buildMarkupFromCurrentDescription(descEl.value || '', presetTokens)
    : descEl.value.trim();
  const fab = fabValue.value;
  const severity = Number(ticketSeveritySelect.value || 1);
  const ticket_time_local = ticketTimestampInput.value;
  const customIncidentName = getCustomIncidentNameForSubmit();
  if (!incident_id || !description || !fab || !ticket_time_local) {
    setTicketSubmitState(false);
    showToast('Compila tutti i campi obbligatori: incident, descrizione, data/ora e FAB.', 'warning', 'Campi obbligatori mancanti');
    return;
  }
  const missingPresetFields = focusFirstIncompletePresetField(presetInlineComposer);
  if (missingPresetFields.length) {
    setTicketSubmitState(false);
    showToast('Compila tutti i campi obbligatori del template: ' + buildMissingPresetFieldsMessage(presetInlineComposer), 'warning', 'Campi template mancanti');
    return;
  }
  if (isGenericIncidentId(incident_id) && !customIncidentName) {
    setTicketSubmitState(false);
    if (customIncidentNameInput) customIncidentNameInput.focus();
    showToast("Per i ticket di tipo Generic è obbligatorio specificare il nome dell'incident.", 'warning', 'Nome incident mancante');
    return;
  }
  const ticket_time = new Date(ticket_time_local).toISOString();
  let createdTicketIds = [];
  try {
    if (editingTicketId) {
      await fetchJson(`/api/tickets/${editingTicketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id, incident_name: customIncidentName, description, fab, ticket_time, severity })
      });
    } else {
      const payloads = [{ incident_id, incident_name: customIncidentName, description, fab, ticket_time, severity }];
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
      const _newPinCheck = document.getElementById('ticketPinCheck');
      const _newPinUntil = document.getElementById('ticketPinUntil');
      if (_newPinCheck && _newPinCheck.checked && _newPinUntil && _newPinUntil.value && createdTicketIds.length) {
        const _newTid = createdTicketIds[0];
        const _newPinVal = _newPinUntil.value;
        fetchJson('/api/pinned-tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: _newTid,
            incidentId: incident_id,
            incidentName: customIncidentName || (incidentIdToNameMap[String(incident_id)] || ''),
            description: sanitizePinText(description),
            fab: fab,
            createdAt: ticket_time,
            severity: severity,
            category: '',
            pinUntil: _newPinVal
          })
        }).then(function() {
          showToast('Ticket pinnato fino al ' + formatPinDate(_newPinVal), 'success', 'PIN salvato');
          updateImportantTicketsBadge();
        }).catch(function() {});
      }
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
    showToast('Impossibile creare il ticket: ' + message, 'error', 'Creazione ticket fallita');
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
  if (panelId === 'chartPanelPersonal') return 12;
  if (panelId === 'chartPanelPersonalMine' || panelId === 'chartPanelPersonalGroup') return 6;
  return 3;
}

function loadChartSpans() {
  if (chartSpans && typeof chartSpans === 'object' && Object.keys(chartSpans).length) return;
  try { chartSpans = JSON.parse(localStorage.getItem(chartSpanStorageKey) || '{}'); } catch (e) { chartSpans = {}; }
}

function saveChartSpans() {
  try { localStorage.setItem(chartSpanStorageKey, JSON.stringify(chartSpans)); } catch (e) {}
  saveUserCharts().catch(console.error);
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
  if (Array.isArray(panelOrder) && panelOrder.length) {
    applyPanelOrder();
    return;
  }
  try {
    const order = JSON.parse(localStorage.getItem(chartOrderStorageKey) || 'null');
    if (!Array.isArray(order)) return;
    const grid = document.getElementById('chartsGrid');
    if (!grid) return;
    order.forEach(function (panelId) {
      if (panelId === 'addChartCard') return;
      const panel = document.getElementById(panelId);
      if (panel && panel.parentElement === grid) keepAddChartCardLast(grid, panel);
    });
    keepAddChartCardLast(grid);
  } catch (e) {}
}

function saveChartOrder() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  const order = [];
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (p) {
    if (p.id === 'addChartCard') return;
    order.push(p.id);
  });
  panelOrder = order;
  try { localStorage.setItem(chartOrderStorageKey, JSON.stringify(order)); } catch (e) {}
  saveUserCharts().catch(console.error);
}

function setupChartResizeControls() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    const target = panel.querySelector('.chart-controls-row') || panel.querySelector('.panel-heading-row');
    if (!target || target.querySelector('.chart-resize-controls')) return;
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
        applyChartSpan(panel, newSpan);
        renderCharts();
        saveChartSpans();
      });
      controls.appendChild(btn);
    });
    target.appendChild(controls);
  });
}

function attachChartDragHandle(panel) {
  const grid = document.getElementById('chartsGrid');
  if (!grid || !panel) return;
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
}

function setupChartDragDrop() {
  const grid = document.getElementById('chartsGrid');
  if (!grid || grid.dataset.dragSetup === '1') return;
  grid.dataset.dragSetup = '1';

  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    attachChartDragHandle(panel);
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
    if (!dragSrcPanel) return;
    if (dragSrcPanel === overPanel) { dragSrcPanel.classList.remove('chart-dragging'); dragSrcPanel = null; return; }
    if (!overPanel || overPanel.parentElement !== grid) {
      // Drop su spazio vuoto del grid: trova il primo panel visivamente dopo il punto di drop
      const others = Array.from(grid.querySelectorAll(':scope > .panel')).filter(function (p) { return p !== dragSrcPanel && p.id !== 'addChartCard'; });
      var insertBefore = null;
      for (var i = 0; i < others.length; i++) {
        var r = others[i].getBoundingClientRect();
        if (r.top > e.clientY || (r.bottom > e.clientY && r.left > e.clientX)) { insertBefore = others[i]; break; }
      }
      if (insertBefore) { grid.insertBefore(dragSrcPanel, insertBefore); } else { keepAddChartCardLast(grid, dragSrcPanel); }
      keepAddChartCardLast(grid);
      dragSrcPanel.classList.remove('chart-dragging');
      dragSrcPanel = null;
      saveChartOrder();
      return;
    }
    const allPanels = [];
    grid.querySelectorAll(':scope > .panel').forEach(function (p) { allPanels.push(p); });
    const srcIdx = allPanels.indexOf(dragSrcPanel);
    const dstIdx = allPanels.indexOf(overPanel);
    if (srcIdx < dstIdx) { overPanel.after(dragSrcPanel); } else { overPanel.before(dragSrcPanel); }
    keepAddChartCardLast(grid);
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
  [personalMineTargetMonthlyInput, personalMineTargetAnnualInput, personalGroupTargetMonthlyInput, personalGroupTargetAnnualInput].forEach((input) => {
    if (!input) return;
    input.value = input.value || '20';
    input.disabled = true;
    input.readOnly = true;
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
      await loadUserCharts();
      renderCharts();
    } catch (error) {
      console.error(error);
    }
  });
})();

function applyTheme(paletteId, darkMode) {
  currentPaletteId = paletteId || 'blu';
  currentDarkMode = !!darkMode;
  THEMES.forEach(function(t) { document.body.classList.remove('theme-' + t.id); });
  document.body.classList.remove('theme-dark');
  if (currentPaletteId && currentPaletteId !== 'blu') document.body.classList.add('theme-' + currentPaletteId);
  if (currentDarkMode) document.body.classList.add('theme-dark');
  setThemeToggleIcon(themeToggleBtn, currentDarkMode ? 'dark' : 'light');
  document.querySelectorAll('.theme-swatch').forEach(function(el) {
    el.classList.toggle('active', el.dataset.theme === currentPaletteId);
  });
}
(function() {
  var savedPalette = localStorage.getItem('palette');
  if (!savedPalette) {
    var old = localStorage.getItem('theme') || '';
    savedPalette = (old === 'sunset') ? 'cappuccino' : 'blu';
    if (['dark','forest','purple','midnight'].indexOf(old) >= 0) localStorage.setItem('dark-mode', '1');
    localStorage.setItem('palette', savedPalette);
  }
  var savedDark = localStorage.getItem('dark-mode') === '1';
  applyTheme(savedPalette, savedDark);
})();
if(themeToggleBtn){themeToggleBtn.addEventListener('click',async()=>{
  var isDark = document.body.classList.contains('theme-dark');
  var newDark = !isDark;
  localStorage.setItem('dark-mode', newDark ? '1' : '');
  applyTheme(currentPaletteId || localStorage.getItem('palette') || 'blu', newDark);
  saveUserCharts().catch(console.error);
  await refreshColorSensitiveViews();
});}

/* --- User settings modal --- */
(function(){
  var modal = document.getElementById('userSettingsModal');
  var swatchesEl = document.getElementById('themeSwatches');
  var saveBtn = document.getElementById('saveUserSettingsBtn');
  var cancelBtn = document.getElementById('cancelUserSettingsBtn');
  var closeBtn = document.getElementById('closeUserSettingsBtn');

  function renderSwatches() {
    if (!swatchesEl) return;
    swatchesEl.innerHTML = '';
    var cur = currentPaletteId || localStorage.getItem('palette') || 'blu';
    THEMES.forEach(function(t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-swatch' + (t.id === cur ? ' active' : '');
      btn.dataset.theme = t.id;
      btn.innerHTML =
        '<div class="theme-swatch-preview" style="background:linear-gradient(135deg,'+t.sidebar+' 35%,'+t.brand+' 100%)"></div>' +
        '<span class="theme-swatch-name">'+t.label+'</span>';
      btn.addEventListener('click', function() {
        localStorage.setItem('palette', t.id);
        applyTheme(t.id, currentDarkMode);
        document.querySelectorAll('.theme-swatch').forEach(function(el) {
          el.classList.toggle('active', el.dataset.theme === t.id);
        });
        saveUserCharts().catch(console.error);
        refreshColorSensitiveViews().catch(function(){});
      });
      swatchesEl.appendChild(btn);
    });
  }

  function openUserSettingsModal() {
    if (!modal) return;
    renderSwatches();
    modal.classList.remove('closing');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    requestAnimationFrame(function() { modal.classList.add('active'); });
  }

  function closeUserSettingsModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.add('closing');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    setTimeout(function() { modal.classList.remove('show', 'closing'); modal.style.display = ''; }, 260);
  }

  if (saveBtn) saveBtn.addEventListener('click', closeUserSettingsModal);

  if (cancelBtn) cancelBtn.addEventListener('click', closeUserSettingsModal);
  if (closeBtn) closeBtn.addEventListener('click', closeUserSettingsModal);
  if (modal) modal.addEventListener('mousedown', function(e) { if (e.target === modal) closeUserSettingsModal(); });

  window._openUserSettingsModal = openUserSettingsModal;
})();

/* ── Avatar picker ───────────────────────────────────── */
(function () {
  var AVATARS = ['🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐱','🐶','🐺','🦝','🦅','🦉','🐙','🦋','🐲','🤖','👽','🥷','🦸'];
  var STORAGE_KEY = 'prodops_avatars_v1';
  var DEFAULT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }

  function getAvatar(username) {
    return username ? (getAll()[username] || null) : null;
  }

  function cacheAvatar(username, emoji) {
    if (!username) return;
    try {
      var all = getAll();
      if (emoji) all[username] = emoji; else delete all[username];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  // Salva la preferenza: server (persistente) + cache locale.
  function saveAvatar(username, emoji) {
    if (!username) return;
    cacheAvatar(username, emoji);
    try {
      fetchJson('/api/me/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: emoji || '' })
      }).catch(function () {});
    } catch {}
  }

  // Scarica la mappa avatar di tutti gli utenti dal server nella cache locale.
  function hydrateAvatars() {
    try {
      fetchJson('/api/user-avatars').then(function (data) {
        var map = (data && data.avatars) || {};
        try {
          var all = getAll();
          Object.keys(map).forEach(function (u) { if (map[u]) all[u] = map[u]; });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch {}
      }).catch(function () {});
    } catch {}
  }

  function applyAvatar(emoji) {
    var wrap = document.getElementById('userPillAvatarWrap');
    if (!wrap) return;
    wrap.innerHTML = emoji ? '<span class="user-pill-emoji">' + emoji + '</span>' : DEFAULT_SVG;
  }

  window._applyUserAvatar = applyAvatar;
  window._getStoredAvatar = getAvatar;
  window._cacheAvatar = cacheAvatar;
  window._hydrateAvatars = hydrateAvatars;

  function openPicker() {
    var existing = document.getElementById('avatarPickerOverlay');
    if (existing) { existing.remove(); }

    var current = getAvatar(currentUser && currentUser.username);
    var overlay = document.createElement('div');
    overlay.id = 'avatarPickerOverlay';
    overlay.className = 'avatar-picker-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Scegli avatar');

    var panel = document.createElement('div');
    panel.className = 'avatar-picker-panel';

    var header = document.createElement('div');
    header.className = 'avatar-picker-header';
    header.innerHTML = '<strong>Scegli il tuo avatar</strong>';
    var closeX = document.createElement('button');
    closeX.type = 'button';
    closeX.className = 'avatar-picker-close-x';
    closeX.setAttribute('aria-label', 'Chiudi');
    closeX.textContent = '×';
    closeX.addEventListener('click', closePicker);
    header.appendChild(closeX);

    var grid = document.createElement('div');
    grid.className = 'avatar-picker-grid';

    var defaultOpt = document.createElement('button');
    defaultOpt.type = 'button';
    defaultOpt.className = 'avatar-option avatar-option-default' + (!current ? ' selected' : '');
    defaultOpt.title = 'Predefinito';
    defaultOpt.setAttribute('aria-label', 'Predefinito');
    defaultOpt.innerHTML = DEFAULT_SVG;
    defaultOpt.addEventListener('click', function () {
      choose(null);
    });
    grid.appendChild(defaultOpt);

    AVATARS.forEach(function (emoji) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option' + (current === emoji ? ' selected' : '');
      btn.title = emoji;
      btn.setAttribute('aria-label', emoji);
      btn.textContent = emoji;
      btn.addEventListener('click', function () { choose(emoji); });
      grid.appendChild(btn);
    });

    var footer = document.createElement('div');
    footer.className = 'avatar-picker-footer';
    var settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.className = 'avatar-picker-settings-btn';
    settingsBtn.textContent = 'Impostazioni profilo';
    settingsBtn.addEventListener('click', function () {
      closePicker();
      if (window._openUserSettingsModal) window._openUserSettingsModal();
    });
    footer.appendChild(settingsBtn);

    panel.appendChild(header);
    panel.appendChild(grid);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () { overlay.classList.add('active'); });

    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closePicker();
    });
    document.addEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') closePicker();
  }

  function closePicker() {
    var overlay = document.getElementById('avatarPickerOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.classList.add('closing');
    document.removeEventListener('keydown', onEsc);
    setTimeout(function () { overlay.remove(); }, 220);
  }

  function choose(emoji) {
    var username = currentUser && currentUser.username;
    saveAvatar(username, emoji);
    applyAvatar(emoji);
    closePicker();
  }

  window._openAvatarPicker = openPicker;
})();

/* ── PIN checkbox listeners ─────────────────────────── */
(function() {
  var check = document.getElementById('ticketPinCheck');
  var until = document.getElementById('ticketPinUntil');
  if (!check || !until) return;
  until.min = new Date().toISOString().slice(0, 10);
  check.addEventListener('change', function() {
    if (this.checked) {
      until.style.display = '';
      until.focus();
    } else {
      until.style.display = 'none';
      until.value = '';
      if (_pinTicketId) {
        fetchJson('/api/pinned-tickets/' + _pinTicketId, { method: 'DELETE' })
          .then(function() { updateImportantTicketsBadge(); })
          .catch(function() {});
      }
    }
  });
  until.addEventListener('change', function() {
    if (!_pinTicketId || !this.value) return;
    var d = _pinTicketData || {};
    var pinVal = this.value;
    fetchJson('/api/pinned-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: _pinTicketId,
        incidentId: d.incidentId || 0,
        incidentName: d.incidentName || '',
        description: sanitizePinText(d.description || ''),
        fab: d.fab || '',
        createdAt: d.createdAt || '',
        severity: d.severity || 1,
        category: d.category || '',
        pinUntil: pinVal
      })
    }).then(function() {
      showToast('Ticket pinnato fino al ' + formatPinDate(pinVal), 'success', 'PIN salvato');
      updateImportantTicketsBadge();
    }).catch(function() {
      showToast('Errore salvataggio PIN', 'error', 'Errore');
    });
  });
})();

/* ── Ticket Importanti modal ────────────────────────── */
(function() {
  var modal = document.getElementById('importantTicketsModal');
  var listEl = document.getElementById('importantTicketsList');
  var closeBtn = document.getElementById('closeImportantTicketsBtn');
  var openBtn = document.getElementById('importantTicketsBtn');

  function renderImportantTickets() {
    if (!listEl) return;
    listEl.innerHTML = '<p class="muted" style="padding:16px;text-align:center">Caricamento…</p>';
    fetchJson('/api/pinned-tickets').then(function(pins) {
      updateImportantTicketsBadge();
      if (!pins || !pins.length) {
        listEl.innerHTML = '<p class="muted" style="padding:16px;text-align:center">Nessun ticket pinnato.</p>';
        return;
      }
      listEl.innerHTML = '';
      var today = new Date().toISOString().slice(0, 10);
      pins.forEach(function(pin) {
        var daysLeft = Math.round((new Date(pin.pinUntil).getTime() - new Date(today).getTime()) / 86400000);
        var card = document.createElement('div');
        card.className = 'important-ticket-card';
        var expiryHtml = 'fino al ' + formatPinDate(pin.pinUntil) +
          (daysLeft <= 2 ? ' <span class="itc-expires-soon">(' + daysLeft + ' gg)</span>' : '');
        card.innerHTML =
          '<div class="itc-header">' +
            '<span class="itc-name">' + escapeHtml(pin.incidentName || 'Ticket #' + pin.id) + '</span>' +
            (pin.fab ? '<span class="itc-fab">' + escapeHtml(pin.fab) + '</span>' : '') +
            '<span class="itc-expires">' + expiryHtml + '</span>' +
            '<button class="itc-unpin" title="Rimuovi PIN" data-id="' + Number(pin.id) + '">✕</button>' +
          '</div>' +
          (pin.description ? '<div class="itc-desc">' + escapeHtml(sanitizePinText(pin.description)) + '</div>' : '') +
          (pin.category || pin.createdAt
            ? '<div class="itc-meta">' +
                escapeHtml(pin.category || '') +
                (pin.category && pin.createdAt ? ' · ' : '') +
                (pin.createdAt ? new Date(pin.createdAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '') +
              '</div>'
            : '');
        card.querySelector('.itc-unpin').addEventListener('click', async function() {
          var tid = Number(this.dataset.id);
          var confirmed = await showConfirm('Il ticket importante verrà rimosso dall\'elenco dei pinnati. Vuoi continuare?', {
            title: 'Rimuovi ticket importante',
            type: 'warning',
            confirmText: 'Rimuovi',
            cancelText: 'Annulla'
          });
          if (!confirmed) return;
          fetchJson('/api/pinned-tickets/' + tid, { method: 'DELETE' })
            .then(function() {
              card.remove();
              if (!listEl.querySelector('.important-ticket-card')) {
                listEl.innerHTML = '<p class="muted" style="padding:16px;text-align:center">Nessun ticket pinnato.</p>';
              }
              updateImportantTicketsBadge();
              if (_pinTicketId === tid) {
                var chk = document.getElementById('ticketPinCheck');
                var unt = document.getElementById('ticketPinUntil');
                if (chk) chk.checked = false;
                if (unt) { unt.style.display = 'none'; unt.value = ''; }
              }
            }).catch(function() {
              showToast('Errore rimozione PIN', 'error', 'Errore');
            });
        });
        listEl.appendChild(card);
      });
    }).catch(function() {
      listEl.innerHTML = '<p class="muted" style="padding:16px;text-align:center">Errore caricamento.</p>';
    });
  }

  function openImportantTicketsModal() {
    if (!modal) return;
    renderImportantTickets();
    modal.classList.remove('closing');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    requestAnimationFrame(function() { modal.classList.add('active'); });
  }

  function closeImportantTicketsModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.add('closing');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    setTimeout(function() { modal.classList.remove('show', 'closing'); }, 260);
  }

  if (openBtn) openBtn.addEventListener('click', openImportantTicketsModal);
  if (closeBtn) closeBtn.addEventListener('click', closeImportantTicketsModal);
  if (modal) modal.addEventListener('mousedown', function(e) { if (e.target === modal) closeImportantTicketsModal(); });
})();

updateImportantTicketsBadge();

window.addEventListener('storage', (event) => {
  if (event.key === uiColorsSyncKey) {
    syncUiColorsAfterAdminChange().catch(() => {});
  }
  if (event.key === chartTypeStorageKey) {
    loadChartTypes();
    setupChartTypeControls();
    loadCharts().catch(() => {});
    refreshCustomCharts();
  }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    syncUiColorsAfterAdminChange().catch(() => {});
    loadChartTypes();
    setupChartTypeControls();
    loadCharts().catch(() => {});
    refreshCustomCharts();
  }
});




ticketList.addEventListener('click', async (e) => {
  if (e.target.closest('.preset-value-link')) return;
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
  if (e.target.closest('.preset-value-link')) return;
  const btn = e.target.closest('.edit-ticket-btn');
  if (!btn) return;
  handleEditTicketButton(btn);
});

previousShiftsContent?.addEventListener('click', async (e) => {
  if (e.target.closest('.preset-value-link')) return;
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

if (deleteTicketBtn) {
  deleteTicketBtn.addEventListener('click', async () => {
    if (!editingTicketId) return;
    const ok = await showConfirm('Il ticket verrà eliminato definitivamente. L\'operazione non è reversibile.', { title: 'Elimina ticket', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' });
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
