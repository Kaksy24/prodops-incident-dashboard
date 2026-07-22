const menu = document.getElementById('menu');
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

function renderCategoryLogoMarkup(value, name) {
  const logo = String(value || '').trim();
  if (!logo) return '';
  if (isCategoryLogoImage(logo)) {
    return `<span class="category-logo category-logo-image" aria-hidden="true"><img src="${escapeHtml(logo)}" alt="" loading="lazy" /></span>`;
  }
  return `<span class="category-logo category-logo-text" aria-hidden="true">${escapeHtml(logo)}</span>`;
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
const openQuickbarBtn = document.getElementById('openQuickbarBtn');
const logoutBtn = document.getElementById('logoutBtn');
const deleteTicketBtn = document.getElementById('deleteTicketBtn');
const editFromReadBtn = document.getElementById('editFromReadBtn');
const tsPopup = document.getElementById('tsPopup');
const compactModeSelect = document.getElementById('compactModeSelect');
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
const incidentYearChart = document.getElementById('incidentYearChart');
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
  { id: 'neon',       label: 'Neon Nights', sidebar: '#0d0219', brand: '#ff71ce',
    previewStyle: 'background:linear-gradient(135deg,#0d0219 30%,#ff71ce 70%,#01cdfe 100%);box-shadow:inset 0 0 10px rgba(255,113,206,.6),0 0 8px rgba(1,205,254,.4);font-family:Consolas,monospace;' },
  { id: 'papiro',     label: 'Papiro',     sidebar: '#3d2818', brand: '#7a4a2a',
    previewStyle: 'background:linear-gradient(135deg,#3d2818 30%,#a06848 100%);box-shadow:2px 2px 0 rgba(0,0,0,.25);font-family:Georgia,serif;border-radius:2px;' },
  { id: 'terminale',  label: 'Terminale',  sidebar: '#000000', brand: '#33ff33',
    previewStyle: 'background:linear-gradient(135deg,#000 30%,#004400 70%,#33ff33 100%);box-shadow:inset 0 0 8px rgba(51,255,51,.5);font-family:Consolas,monospace;border-radius:0;border:1px solid #33ff33;' },
  { id: 'aurora',     label: 'Aurora',     sidebar: '#4b2d78', brand: '#8b5cf6',
    previewStyle: 'background:linear-gradient(135deg,#a8edea 0%,#fed6e3 45%,#d4a5f9 100%);box-shadow:0 4px 16px rgba(139,92,246,.3);border-radius:14px;' },
  { id: 'blueprint',  label: 'Blueprint',  sidebar: '#0a2540', brand: '#5eead4',
    previewStyle: 'background:repeating-linear-gradient(0deg,#0a3a6b 0,#0a3a6b 4px,#0e4680 4px,#0e4680 5px),repeating-linear-gradient(90deg,transparent 0,transparent 4px,rgba(94,234,212,.25) 4px,rgba(94,234,212,.25) 5px);border:1px dashed #5eead4;font-family:Consolas,monospace;border-radius:0;' },
  { id: 'sakura',     label: 'Sakura',     sidebar: '#7a2d4e', brand: '#e86ba0',
    previewStyle: 'background:linear-gradient(135deg,#ffe4ec 30%,#fbc4d4 65%,#f9a8b8 100%);box-shadow:0 6px 20px rgba(232,107,160,.4),inset 0 1px 0 #fff5;border-radius:22px;' },
  { id: 'brutalista', label: 'Brutalista', sidebar: '#000000', brand: '#facc15',
    previewStyle: 'background:#facc15;border:3px solid #000;box-shadow:6px 6px 0 #000;font-family:Impact,"Arial Black",sans-serif;border-radius:0;color:#000;text-transform:uppercase;font-weight:900;' },
  { id: 'oceano',     label: 'Oceano',     sidebar: '#001824', brand: '#22d3ee',
    previewStyle: 'background:linear-gradient(180deg,#0e7490 0%,#0891b2 45%,#001824 100%);box-shadow:0 6px 24px rgba(34,211,238,.35),inset 0 1px 0 rgba(255,255,255,.15);border-radius:10px;' },
  { id: 'nordico',    label: 'Nordico',    sidebar: '#4c566a', brand: '#5e81ac' },
  { id: 'dracula',    label: 'Dracula',    sidebar: '#282a36', brand: '#bd93f9' },
  { id: 'monokai',    label: 'Monokai',    sidebar: '#272822', brand: '#a6e22e' },
  { id: 'vaporwave',  label: 'Vaporwave',  sidebar: '#2d1b52', brand: '#ff71ce' },
  { id: 'foresta',    label: 'Foresta',    sidebar: '#0f2a1a', brand: '#f59e0b' },
  { id: 'marmo',      label: 'Marmo',      sidebar: '#3a3128', brand: '#b8860b' },
  { id: 'solarpunk',  label: 'Solarpunk',  sidebar: '#2d4a2b', brand: '#84cc16' },
  { id: 'piombo',     label: 'Piombo',     sidebar: '#37474f', brand: '#ff6f00' },
  { id: 'manoscritto',label: 'Manoscritto',sidebar: '#1e3a5f', brand: '#1e3a5f' },
  { id: 'cyber2077',  label: 'Cyber 2077', sidebar: '#0a0a0a', brand: '#fcee0a' },
];
let fabYearMode = 'day';
let catYearMode = 'day';
let teamYearMode = 'day';
let incidentYearMode = 'day';
let userYearMode = 'day';
const chartCustomRanges = { fabYear: null, catYear: null, teamYear: null, incidentYear: null, userYear: null };
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
let previousShiftPinnedTickets = [];
const PAGE_AUTO_REFRESH_MS = 3 * 60 * 1000;
let pageAutoRefreshTimer = null;
let currentShiftAutoRefreshBusy = false;
let currentShiftOwnerFilter = 'all';
let currentShiftSortKey = 'time';
let currentShiftSortDir = 'desc';
let ticketSubmitBusy = false;
const uiColorsSyncKey = 'prodops_ui_colors_updated_at';
let currentPaletteId = 'blu';
let currentDarkMode = false;
let quickbarWindowRef = null;
const quickbarStateKey = 'prodops_quickbar_window_state';
const quickbarHeartbeatKey = 'prodops_quickbar_heartbeat';
const quickbarChannelName = 'prodops_quickbar_channel';
const isQuickbarPage = !!document.body && document.body.classList.contains('quickbar-page');
let quickbarChannel = null;
let quickbarRefocusTimer = null;
let quickbarCompactWidthBeforeModal = 0;
let quickbarIsClosing = false;
let quickbarFocusRetryTimers = [];
let quickbarWatchdogTimer = null;
let quickbarTitleAlertTimer = null;
const quickbarBaseTitle = document.title || 'ProdOps';
function releaseThemeSyncPending() {
  document.documentElement.classList.remove('theme-sync-pending');
}
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

function isStrictAdminUser() {
  return !!(currentUser && currentUser.role === 'admin');
}

function canUseBroadcastChannel() {
  return typeof BroadcastChannel !== 'undefined';
}

function getQuickbarChannel() {
  if (!canUseBroadcastChannel()) return null;
  if (!quickbarChannel) quickbarChannel = new BroadcastChannel(quickbarChannelName);
  return quickbarChannel;
}

function readQuickbarWindowState() {
  try {
    const raw = localStorage.getItem(quickbarStateKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function writeQuickbarWindowState(state) {
  try {
    localStorage.setItem(quickbarStateKey, JSON.stringify(state || {}));
  } catch (error) {}
}

function getQuickbarPopupFeatures() {
  const saved = readQuickbarWindowState() || {};
  const width = Math.max(280, Math.min(520, parseInt(saved.width, 10) || 320));
  const height = Math.max(520, Math.min(1100, parseInt(saved.height, 10) || 760));
  const left = parseInt(saved.left, 10);
  const top = parseInt(saved.top, 10);
  const features = [
    'popup=yes',
    'width=' + width,
    'height=' + height,
    'left=' + (isNaN(left) ? 80 : left),
    'top=' + (isNaN(top) ? 80 : top),
    'toolbar=no',
    'location=no',
    'menubar=no',
    'status=no',
    'resizable=yes',
    'scrollbars=yes'
  ];
  return features.join(',');
}

function quickbarHeartbeatAgeMs() {
  try {
    const raw = parseInt(localStorage.getItem(quickbarHeartbeatKey) || '0', 10);
    if (!raw) return Number.POSITIVE_INFINITY;
    return Date.now() - raw;
  } catch (error) {
    return Number.POSITIVE_INFINITY;
  }
}

function isQuickbarProbablyAlive() {
  return quickbarHeartbeatAgeMs() < 15000;
}

function touchQuickbarHeartbeat() {
  try { localStorage.setItem(quickbarHeartbeatKey, String(Date.now())); } catch (error) {}
}

function clearQuickbarHeartbeat() {
  try { localStorage.removeItem(quickbarHeartbeatKey); } catch (error) {}
}

function clearQuickbarFocusRetryTimers() {
  if (!quickbarFocusRetryTimers.length) return;
  quickbarFocusRetryTimers.forEach(function (timerId) {
    try { clearTimeout(timerId); } catch (error) {}
  });
  quickbarFocusRetryTimers = [];
}

function stopQuickbarTitleAlert() {
  if (quickbarTitleAlertTimer) {
    clearInterval(quickbarTitleAlertTimer);
    quickbarTitleAlertTimer = null;
  }
  if (isQuickbarPage && document.title !== quickbarBaseTitle) document.title = quickbarBaseTitle;
}

function startQuickbarTitleAlert() {
  if (!isQuickbarPage || quickbarTitleAlertTimer || quickbarIsClosing) return;
  let toggle = false;
  quickbarTitleAlertTimer = setInterval(function () {
    if (quickbarIsClosing) {
      stopQuickbarTitleAlert();
      return;
    }
    toggle = !toggle;
    document.title = toggle ? 'Quickbar - attenzione' : quickbarBaseTitle;
  }, 900);
}

function detachQuickbarFromDashboardWindow() {
  if (!isQuickbarPage) return;
  try {
    // La quickbar deve sopravvivere anche se la dashboard che l'ha aperta viene chiusa.
    // Spezziamo quindi il legame con window.opener e lasciamo il coordinamento a
    // BroadcastChannel/localStorage, che sono gia' indipendenti dalla tab madre.
    if (window.opener) window.opener = null;
  } catch (error) {}
}

function restoreQuickbarWindowGeometry() {
  if (!isQuickbarPage) return;
  try {
    const saved = readQuickbarWindowState();
    if (!saved) return;
    if (typeof window.moveTo === 'function' && saved.left !== undefined && saved.top !== undefined) {
      window.moveTo(saved.left, saved.top);
    }
    if (typeof window.resizeTo === 'function' && saved.width && saved.height) {
      window.resizeTo(saved.width, saved.height);
    }
  } catch (error) {}
}

function performQuickbarFrontAttempt(restoreGeometry) {
  if (!isQuickbarPage || quickbarIsClosing) return;
  if (restoreGeometry) restoreQuickbarWindowGeometry();
  try { window.focus(); } catch (error) {}
  touchQuickbarHeartbeat();
}

function openOrFocusQuickbar(forceOpen) {
  const features = getQuickbarPopupFeatures();
  if (quickbarWindowRef && !quickbarWindowRef.closed) {
    try { quickbarWindowRef.focus(); } catch (error) {}
    return quickbarWindowRef;
  }
  if (!forceOpen && isQuickbarProbablyAlive()) {
    const channel = getQuickbarChannel();
    if (channel) {
      channel.postMessage({ type: 'focus-request', ts: Date.now() });
      return null;
    }
  }
  quickbarWindowRef = window.open(appUrl('/quickbar.html'), 'prodopsQuickbar', features);
  if (quickbarWindowRef) {
    try { quickbarWindowRef.focus(); } catch (error) {}
  }
  return quickbarWindowRef;
}

function requestQuickbarFront() {
  let usedChannel = false;
  if (quickbarWindowRef && !quickbarWindowRef.closed) {
    try {
      quickbarWindowRef.focus();
      return;
    } catch (error) {}
  }
  const channel = getQuickbarChannel();
  if (channel) {
    channel.postMessage({ type: 'focus-request', ts: Date.now() });
    usedChannel = true;
  }
  if (!isQuickbarProbablyAlive()) {
    openOrFocusQuickbar(true);
    return;
  }
  if (!usedChannel) openOrFocusQuickbar(false);
}

function attemptQuickbarRefocus() {
  if (!isQuickbarPage || quickbarIsClosing) return;
  performQuickbarFrontAttempt(true);
  startQuickbarTitleAlert();
  if (quickbarRefocusTimer) clearTimeout(quickbarRefocusTimer);
  quickbarRefocusTimer = setTimeout(function () {
    if (quickbarIsClosing) return;
    performQuickbarFrontAttempt(true);
  }, 180);
  clearQuickbarFocusRetryTimers();
  [80, 260, 620, 1200, 2200].forEach(function (delay, index) {
    const timerId = setTimeout(function () {
      if (quickbarIsClosing) return;
      if (document.hasFocus && document.hasFocus() && !document.hidden) {
        clearQuickbarFocusRetryTimers();
        stopQuickbarTitleAlert();
        return;
      }
      performQuickbarFrontAttempt(index >= 2);
    }, delay);
    quickbarFocusRetryTimers.push(timerId);
  });
}

function initQuickbarLockMode() {
  if (!isQuickbarPage) return;
  window.addEventListener('blur', function () {
    attemptQuickbarRefocus();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) attemptQuickbarRefocus();
  });
  window.addEventListener('focus', function () {
    clearQuickbarFocusRetryTimers();
    stopQuickbarTitleAlert();
    touchQuickbarHeartbeat();
  });
  document.addEventListener('pointerdown', function () {
    touchQuickbarHeartbeat();
  });
  document.addEventListener('keydown', function () {
    touchQuickbarHeartbeat();
  });
  window.addEventListener('beforeunload', function () {
    quickbarIsClosing = true;
    clearQuickbarFocusRetryTimers();
    stopQuickbarTitleAlert();
    clearQuickbarHeartbeat();
    saveCurrentQuickbarWindowState();
  });
  window.addEventListener('pagehide', function () {
    quickbarIsClosing = true;
    clearQuickbarFocusRetryTimers();
    stopQuickbarTitleAlert();
    clearQuickbarHeartbeat();
    saveCurrentQuickbarWindowState();
  });
}

function saveCurrentQuickbarWindowState() {
  if (!isQuickbarPage || typeof window.outerWidth === 'undefined') return;
  writeQuickbarWindowState({
    width: window.outerWidth || 320,
    height: window.outerHeight || 760,
    left: typeof window.screenX === 'number' ? window.screenX : 80,
    top: typeof window.screenY === 'number' ? window.screenY : 80,
    updatedAt: Date.now()
  });
  if (quickbarIsClosing) {
    clearQuickbarHeartbeat();
  } else {
    touchQuickbarHeartbeat();
  }
}

function initQuickbarWindowBridge() {
  if (!isQuickbarPage) return;
  detachQuickbarFromDashboardWindow();
  saveCurrentQuickbarWindowState();
  const channel = getQuickbarChannel();
  if (channel) {
    channel.onmessage = function (event) {
      const data = event && event.data ? event.data : {};
      if (data.type === 'focus-request') {
        try { window.focus(); } catch (error) {}
        touchQuickbarHeartbeat();
      }
      if (data.type === 'ping') {
        touchQuickbarHeartbeat();
        channel.postMessage({ type: 'pong', ts: Date.now() });
      }
    };
  }
  setTimeout(function () {
    try {
      const saved = readQuickbarWindowState();
      if (!saved) return;
      if (typeof window.resizeTo === 'function' && saved.width && saved.height) window.resizeTo(saved.width, saved.height);
      if (typeof window.moveTo === 'function' && saved.left !== undefined && saved.top !== undefined) window.moveTo(saved.left, saved.top);
    } catch (error) {}
  }, 120);
  window.addEventListener('resize', saveCurrentQuickbarWindowState);
  window.addEventListener('beforeunload', saveCurrentQuickbarWindowState);
  window.addEventListener('pagehide', saveCurrentQuickbarWindowState);
  window.addEventListener('focus', touchQuickbarHeartbeat);
  setInterval(touchQuickbarHeartbeat, 5000);
  if (!quickbarWatchdogTimer) {
    quickbarWatchdogTimer = setInterval(function () {
      if (quickbarIsClosing) return;
      if ((document.hasFocus && document.hasFocus()) && !document.hidden) {
        stopQuickbarTitleAlert();
        return;
      }
      attemptQuickbarRefocus();
    }, 2500);
  }
}

let quickbarAutoFitTimer = null;
function scheduleQuickbarAutoFitHeight(delayMs) {
  if (!isQuickbarPage) return;
  if (quickbarAutoFitTimer) clearTimeout(quickbarAutoFitTimer);
  const waitMs = Math.max(0, Number(delayMs || 40));
  quickbarAutoFitTimer = setTimeout(function () {
    quickbarAutoFitTimer = null;
    fitQuickbarHeightToContent();
  }, waitMs);
}

function fitQuickbarHeightToContent() {
  if (!isQuickbarPage) return;
  if (modal && (modal.classList.contains('show') || modal.classList.contains('active'))) return;
  const shell = document.querySelector('.quickbar-shell');
  if (!shell) return;
  try {
    const chromeDelta = Math.max(0, (window.outerHeight || 0) - (window.innerHeight || 0));
    const width = Math.max(280, window.outerWidth || 320);
    const contentHeight = Math.ceil(shell.scrollHeight) + 2;
    const maxHeight = (screen && screen.availHeight) ? Math.max(220, screen.availHeight - 60) : 900;
    const targetHeight = Math.max(120, Math.min(maxHeight, contentHeight + chromeDelta));
    if (typeof window.resizeTo === 'function' && Math.abs((window.outerHeight || targetHeight) - targetHeight) > 6) {
      window.resizeTo(width, targetHeight);
    }
    saveCurrentQuickbarWindowState();
  } catch (error) {}
}

function fitQuickbarToTicketModal() {
  if (!isQuickbarPage || !modal || !mainTicketPanel) return;
  try {
    const chromeWidthDelta = Math.max(0, (window.outerWidth || 0) - (window.innerWidth || 0));
    const chromeHeightDelta = Math.max(0, (window.outerHeight || 0) - (window.innerHeight || 0));
    const panelWidth = Math.max(mainTicketPanel.scrollWidth || 0, mainTicketPanel.offsetWidth || 0, 620);
    const panelHeight = Math.max(mainTicketPanel.scrollHeight || 0, mainTicketPanel.offsetHeight || 0, 560);
    const maxWidth = (screen && screen.availWidth) ? Math.max(720, screen.availWidth - 40) : 980;
    const maxHeight = (screen && screen.availHeight) ? Math.max(620, screen.availHeight - 40) : 980;
    const targetWidth = Math.max(700, Math.min(maxWidth, panelWidth + chromeWidthDelta + 44));
    const targetHeight = Math.max(620, Math.min(maxHeight, panelHeight + chromeHeightDelta + 40));
    if (!quickbarCompactWidthBeforeModal) quickbarCompactWidthBeforeModal = window.outerWidth || 320;
    if (typeof window.resizeTo === 'function') window.resizeTo(targetWidth, targetHeight);
    saveCurrentQuickbarWindowState();
  } catch (error) {}
}

function restoreQuickbarAfterModalClose() {
  if (!isQuickbarPage) return;
  try {
    const compactWidth = Math.max(280, quickbarCompactWidthBeforeModal || 320);
    const currentHeight = window.outerHeight || 320;
    if (typeof window.resizeTo === 'function') window.resizeTo(compactWidth, currentHeight);
  } catch (error) {}
  quickbarCompactWidthBeforeModal = 0;
  scheduleQuickbarAutoFitHeight();
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
function decoratePinnedTickets(pins, container) {
  var root = container || ticketList;
  if (!root) return;
  var pinnedIds = new Set((pins || []).map(function(p) { return Number(p.id); }));
  root.querySelectorAll('[data-ticket-id]').forEach(function(li) {
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

// Rendering sicuro della descrizione: mantiene il sottoinsieme HTML di
// formattazione (grassetto/corsivo/sottolineato/elenchi), converte i marker
// 〈valore〉 in link preset ed effettua l'escape di tutto il resto. Compatibile
// con le descrizioni "legacy" solo-testo (i newline diventano <br>).
function renderDescriptionHtmlText(text) {
  return escapeHtml(String(text == null ? '' : text))
    .replace(/ã€ˆ([^ã€‰]*)ã€‰/g, function(_, value) { return renderPresetValueLink(value); })
    .replace(/\r\n?|\n/g, '<br>');
}

function renderDescriptionHtmlNode(node, out) {
  var nodes = node.childNodes, i, child;
  for (i = 0; i < nodes.length; i += 1) {
    child = nodes[i];
    if (child.nodeType === 3) { out.push(renderDescriptionHtmlText(child.nodeValue || '')); continue; }
    if (child.nodeType !== 1) continue;
    var tag = child.tagName;
    if (tag === 'BR') { out.push('<br>'); continue; }
    var map = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', UL: 'ul', OL: 'ol', LI: 'li' };
    if (map[tag]) { out.push('<' + map[tag] + '>'); renderDescriptionHtmlNode(child, out); out.push('</' + map[tag] + '>'); continue; }
    if (tag === 'DIV' || tag === 'P') { if (out.length) out.push('<br>'); renderDescriptionHtmlNode(child, out); continue; }
    renderDescriptionHtmlNode(child, out); // unwrap tag non ammessi mantenendo il testo
  }
}

function renderDescriptionHtml(raw) {
  var tpl = document.createElement('template');
  tpl.innerHTML = String(raw == null ? '' : raw);
  var out = [];
  renderDescriptionHtmlNode(tpl.content, out);
  return out.join('');
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
    incidentYear: 'bar',
    userYear: 'column'
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

function saveChartTypes(skipRemoteSave) {
  try {
    localStorage.setItem(chartTypeStorageKey, JSON.stringify(chartTypes));
  } catch (error) {
    // ignore storage issues
  }
  if (!skipRemoteSave) saveUserCharts().catch(console.error);
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
  const descRead = document.getElementById('descriptionRead');
  descShow(!readMode);
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

function hasCustomTicketIncidentName(incidentId, currentName) {
  const baseName = getIncidentBaseName(incidentId);
  const name = String(currentName || '').trim();
  if (!name) return false;
  if (!baseName) return false;
  return name.toLowerCase() !== baseName.toLowerCase();
}

function updateTicketModalHeading(incidentId, customName) {
  const baseName = getIncidentBaseName(incidentId);
  const customLabel = String(customName || '').trim();
  if (!ticketModalTitle) return;
  if (hasCustomTicketIncidentName(incidentId, customLabel)) {
    ticketModalTitle.textContent = customLabel;
    return;
  }
  if (isGenericIncidentId(incidentId)) {
    ticketModalTitle.textContent = customLabel || baseName || 'Nuovo Ticket';
    return;
  }
  ticketModalTitle.textContent = baseName || customLabel || 'Nuovo Ticket';
}

function syncCustomIncidentNameField(incidentId, currentName, readOnly) {
  const baseName = getIncidentBaseName(incidentId);
  const isGeneric = isGenericIncidentId(incidentId);
  const keepCustomName = hasCustomTicketIncidentName(incidentId, currentName);
  const showCustomField = isGeneric || keepCustomName;
  if (!customIncidentNameGroup || !customIncidentNameInput) {
    updateTicketModalHeading(incidentId, currentName);
    return;
  }
  if (!showCustomField) {
    customIncidentNameGroup.style.display = 'none';
    customIncidentNameInput.required = false;
    customIncidentNameInput.readOnly = false;
    customIncidentNameInput.value = '';
    updateTicketModalHeading(incidentId, currentName);
    return;
  }
  customIncidentNameGroup.style.display = '';
  customIncidentNameInput.required = isGeneric;
  customIncidentNameInput.readOnly = Boolean(readOnly);
  customIncidentNameInput.value = isGenericIncidentName(currentName) ? '' : String(currentName || '').trim();
  updateTicketModalHeading(incidentId, customIncidentNameInput.value || baseName);
}

function getCustomIncidentNameForSubmit() {
  if (!customIncidentNameInput || !isGenericIncidentId(incidentTypeInput.value)) return '';
  return String(customIncidentNameInput.value || '').trim();
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// ============================================================================
// Editor descrizione (rich text semplice) — contenteditable con toolbar
// (grassetto/corsivo/sottolineato + elenchi) e "chip" per i valori dei preset.
// La textarea nascosta #description resta il campo del form: viene sincronizzata
// con la stringa di storage (sottoinsieme HTML + marker token 〈valore〉).
// ============================================================================
var descEditorEl = document.getElementById('descriptionEditor');
var descTextareaEl = document.getElementById('description');
var descToolbarEl = document.getElementById('descriptionToolbar');
// I marker dei token nel resto del codice sono salvati con una sequenza
// "mojibake" (doppia codifica) e non con i veri caratteri U+3008/U+3009: per
// restare coerenti (regex di render, extractPresetValuesFromMarkup, ecc.)
// deriviamo le sequenze esatte da buildMarkupDescription invece di codificarle.
// I marker dei token sono memorizzati (e resi da renderDescriptionHtmlText e
// buildMarkupDescription) come sequenza "mojibake" a 3 caratteri, NON come i
// veri U+3008/U+3009. Le definiamo esattamente uguali a quei literal cosi che
// costruzione chip (descTokenRe), serializzazione (descSerializeNode),
// estrazione valori ed etichette combacino con i dati gia salvati.
//   apertura -> [U+00E3, U+20AC, U+02C6]   chiusura -> [U+00E3, U+20AC, U+2030]
var DESC_TOKEN_OPEN = String.fromCharCode(0x00e3, 0x20ac, 0x02c6);
var DESC_TOKEN_CLOSE = String.fromCharCode(0x00e3, 0x20ac, 0x2030);
var DESC_INLINE_TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', UL: 'ul', OL: 'ol', LI: 'li' };
var DESC_TOOLBAR_CMDS = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];

function descResolveContext(target) {
  if (target && target.editorEl) return target;
  if (target && target.nodeType === 1 && target.tagName === 'TEXTAREA') {
    if (target === descTextareaEl) return { editorEl: descEditorEl, textareaEl: descTextareaEl, toolbarEl: descToolbarEl };
    var root = target.closest('.ticket-form') || target.parentElement;
    return {
      editorEl: root ? root.querySelector('.extra-description-editor') : null,
      textareaEl: target,
      toolbarEl: root ? root.querySelector('.extra-description-toolbar') : null
    };
  }
  return { editorEl: descEditorEl, textareaEl: descTextareaEl, toolbarEl: descToolbarEl };
}

function descTokenRe() { return new RegExp(DESC_TOKEN_OPEN + '([^' + DESC_TOKEN_CLOSE + ']*)' + DESC_TOKEN_CLOSE, 'g'); }

function descChipHtml(index, label, value) {
  var empty = String(value == null ? '' : value).trim() === '';
  var safeLabel = escapeHtml(String(label || 'campo'));
  var display = empty ? '[' + safeLabel + ']' : escapeHtml(String(value));
  return '<span class="preset-chip" contenteditable="false" data-token-index="' + index +
    '" data-token-label="' + safeLabel + '" data-token-empty="' + (empty ? '1' : '0') + '">' + display + '</span>';
}

// storage string (editor DOM) -> HTML editor con chip. tokens: array opzionale
// di tokenState (per label), i marker 〈…〉 vengono convertiti in chip in ordine.
function descBuildEditorHtml(storage, tokens) {
  var tpl = document.createElement('template');
  tpl.innerHTML = String(storage == null ? '' : storage);
  var out = [];
  var ctr = { i: 0 };
  descWalkBuild(tpl.content, out, tokens || null, ctr);
  return out.join('');
}

function descWalkBuild(node, out, tokens, ctr) {
  var nodes = node.childNodes, i, child;
  for (i = 0; i < nodes.length; i += 1) {
    child = nodes[i];
    if (child.nodeType === 3) {
      var text = child.nodeValue || '';
      var re = descTokenRe();
      var last = 0, m;
      while ((m = re.exec(text)) !== null) {
        out.push(escapeHtml(text.slice(last, m.index)).replace(/\n/g, '<br>'));
        var idx = ctr.i++;
        var label = tokens && tokens[idx] ? tokens[idx].label : '';
        out.push(descChipHtml(idx, label, m[1]));
        last = m.index + m[0].length;
      }
      out.push(escapeHtml(text.slice(last)).replace(/\n/g, '<br>'));
      continue;
    }
    if (child.nodeType !== 1) continue;
    var tag = child.tagName;
    if (tag === 'BR') { out.push('<br>'); continue; }
    var wrap = DESC_INLINE_TAGS[tag];
    if (wrap) { out.push('<' + wrap + '>'); descWalkBuild(child, out, tokens, ctr); out.push('</' + wrap + '>'); continue; }
    if (tag === 'DIV' || tag === 'P') { if (out.length) out.push('<br>'); descWalkBuild(child, out, tokens, ctr); continue; }
    descWalkBuild(child, out, tokens, ctr); // unwrap span/altro
  }
}

// editor DOM -> stringa di storage (sottoinsieme HTML + 〈valore〉 per i chip)
function descSerializeNode(node, out) {
  var nodes = node.childNodes, i, child;
  for (i = 0; i < nodes.length; i += 1) {
    child = nodes[i];
    if (child.nodeType === 3) { out.push(escapeHtml(child.nodeValue || '')); continue; }
    if (child.nodeType !== 1) continue;
    var tag = child.tagName;
    if (child.classList && child.classList.contains('preset-chip')) {
      if (child.getAttribute('data-token-empty') === '1') {
        out.push('[' + (child.getAttribute('data-token-label') || 'campo') + ']');
      } else {
        out.push(DESC_TOKEN_OPEN + (child.textContent || '') + DESC_TOKEN_CLOSE);
      }
      continue;
    }
    if (tag === 'BR') { out.push('\n'); continue; }
    var wrap = DESC_INLINE_TAGS[tag];
    if (wrap) { out.push('<' + wrap + '>'); descSerializeNode(child, out); out.push('</' + wrap + '>'); continue; }
    if (tag === 'DIV' || tag === 'P') { if (out.length) out.push('\n'); descSerializeNode(child, out); continue; }
    descSerializeNode(child, out);
  }
}

function descGetStorage(target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl) return ctx.textareaEl ? ctx.textareaEl.value : '';
  var out = [];
  descSerializeNode(ctx.editorEl, out);
  var s = out.join('');
  s = s.replace(/\n{3,}/g, '\n\n').replace(/\n/g, '<br>');
  s = s.replace(/(?:<br>){3,}/g, '<br><br>').replace(/^(?:<br>)+|(?:<br>)+$/g, '');
  return s.trim();
}

function descGetText(target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl) return ctx.textareaEl ? ctx.textareaEl.value : '';
  return String(ctx.editorEl.textContent || '').replace(/ /g, ' ').trim();
}

function descSyncFromEditor(target) {
  var ctx = descResolveContext(target);
  if (ctx.textareaEl) ctx.textareaEl.value = descGetStorage(ctx);
  if (typeof syncSubmitBtnState === 'function') syncSubmitBtnState();
}

// Imposta il contenuto dell'editor da una stringa di storage. tokens opzionale
// per trasformare i marker 〈…〉 in chip (modalità preset).
function descSetContent(storage, tokens, target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl) { if (ctx.textareaEl) ctx.textareaEl.value = String(storage || ''); return; }
  ctx.editorEl.innerHTML = descBuildEditorHtml(storage, tokens);
  descSyncFromEditor(ctx);
}

// Contenuto libero (nessun token): strip degli eventuali marker 〈v〉 → v.
function descSetPlain(storage, target) {
  descSetContent(String(storage == null ? '' : storage).replace(descTokenRe(), '$1'), null, target);
}

function descSetChipValue(index, value, target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl) return;
  var chip = ctx.editorEl.querySelector('.preset-chip[data-token-index="' + index + '"]');
  if (!chip) return;
  var label = chip.getAttribute('data-token-label') || 'campo';
  var empty = String(value == null ? '' : value).trim() === '';
  chip.setAttribute('data-token-empty', empty ? '1' : '0');
  chip.textContent = empty ? '[' + label + ']' : String(value);
  descSyncFromEditor(ctx);
}

function descSetReadOnly(readOnly, target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl) return;
  ctx.editorEl.setAttribute('contenteditable', readOnly ? 'false' : 'true');
  if (ctx.toolbarEl) ctx.toolbarEl.style.display = readOnly ? 'none' : '';
}

function descShow(visible, target) {
  var ctx = descResolveContext(target);
  if (ctx.editorEl) ctx.editorEl.style.display = visible ? '' : 'none';
  if (ctx.toolbarEl) ctx.toolbarEl.style.display = (visible && ctx.editorEl && ctx.editorEl.getAttribute('contenteditable') !== 'false') ? '' : 'none';
}

function descUpdateToolbarState(target) {
  var ctx = descResolveContext(target);
  if (!ctx.toolbarEl) return;
  var buttons = ctx.toolbarEl.querySelectorAll('.desc-tool');
  Array.prototype.forEach.call(buttons, function (btn) {
    var cmd = btn.getAttribute('data-cmd');
    if (DESC_TOOLBAR_CMDS.indexOf(cmd) === -1) return;
    var active = false;
    try { active = document.queryCommandState(cmd); } catch (e) { active = false; }
    btn.classList.toggle('is-active', !!active);
  });
}

// I chip dei preset non sono cancellabili: contenteditable="false" impedisce di
// scrivere dentro al chip ma non di rimuoverlo (backspace, canc, taglia, Ctrl+A,
// drag). Qui intercettiamo l'edit prima che avvenga e lo blocchiamo se tocca un
// chip, cosi' i campi compilabili restano sempre nella descrizione.

// Il chip vivo (non il clone) toccato da range, altrimenti null. cloneContents
// include solo i nodi realmente dentro al range: un range che confina con il
// chip senza coprirlo non lo restituisce, quindi il backspace sul carattere
// prima del chip resta permesso.
function descChipHitInRange(ctx, range) {
  var frag;
  try { frag = range.cloneContents(); } catch (e) { return null; }
  var clone = frag && frag.querySelector ? frag.querySelector('.preset-chip') : null;
  if (!clone) return null;
  var live = ctx.editorEl.querySelector('.preset-chip[data-token-index="' + clone.getAttribute('data-token-index') + '"]');
  return live || clone;
}

function descStaticRangeToRange(sr) {
  try {
    var r = document.createRange();
    r.setStart(sr.startContainer, sr.startOffset);
    r.setEnd(sr.endContainer, sr.endOffset);
    return r;
  } catch (e) { return null; }
}

function descFlashChip(chip) {
  if (!chip || !chip.classList) return;
  chip.classList.remove('preset-chip-blocked');
  void chip.offsetWidth; // reflow: fa ripartire l'animazione se gia' in corso
  chip.classList.add('preset-chip-blocked');
  setTimeout(function () { chip.classList.remove('preset-chip-blocked'); }, 800);
}

// Il toast e' limitato nel tempo: tenendo premuto backspace l'evento si ripete
// molte volte al secondo e senza freno sommergerebbe lo schermo di notifiche.
var descChipToastAt = 0;
function descBlockChipEdit(chip) {
  descFlashChip(chip);
  var now = Date.now();
  if (now - descChipToastAt < 2500) return;
  descChipToastAt = now;
  var label = chip.getAttribute('data-token-label') || 'campo';
  if (typeof showToast === 'function') {
    showToast('Il campo "' + label + '" fa parte del preset e non puo\' essere rimosso dalla descrizione. Per cambiarlo usa i campi del preset qui sotto.', 'warning', 'Campo protetto');
  }
}

function descGuardBeforeInput(ctx, e) {
  var ranges = (typeof e.getTargetRanges === 'function') ? e.getTargetRanges() : [];
  var i, range, chip = null;
  for (i = 0; i < ranges.length && !chip; i += 1) {
    range = descStaticRangeToRange(ranges[i]);
    if (range) chip = descChipHitInRange(ctx, range);
  }
  if (!chip) return;
  e.preventDefault();
  descBlockChipEdit(chip);
}

function descInitEditor(target) {
  var ctx = descResolveContext(target);
  if (!ctx.editorEl || ctx.editorEl.dataset.descInit === '1') return;
  ctx.editorEl.dataset.descInit = '1';
  try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (e) {}
  ctx.editorEl.addEventListener('beforeinput', function (e) { descGuardBeforeInput(ctx, e); });
  // Trascinare un chip fuori dall'editor lo rimuoverebbe senza passare da beforeinput.
  ctx.editorEl.addEventListener('dragstart', function (e) {
    if (e.target && e.target.closest && e.target.closest('.preset-chip')) e.preventDefault();
  });
  ctx.editorEl.addEventListener('input', function () { descSyncFromEditor(ctx); });
  ctx.editorEl.addEventListener('keyup', function () { descUpdateToolbarState(ctx); });
  ctx.editorEl.addEventListener('mouseup', function () { descUpdateToolbarState(ctx); });
  ctx.editorEl.addEventListener('focus', function () { descUpdateToolbarState(ctx); });
  if (ctx.toolbarEl) {
    // mousedown preventDefault: non perdere la selezione nell'editor
    ctx.toolbarEl.addEventListener('mousedown', function (e) { if (e.target.closest('.desc-tool')) e.preventDefault(); });
    ctx.toolbarEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.desc-tool');
      if (!btn) return;
      ctx.editorEl.focus();
      try { document.execCommand(btn.getAttribute('data-cmd'), false, null); } catch (err) {}
      descSyncFromEditor(ctx);
      descUpdateToolbarState(ctx);
    });
  }
}
descInitEditor();

/* ── Tooltip "cosa manca" sul bottone Crea Ticket disabilitato ──── */
(function () {
  if (!ticketSubmitBtn) return;
  var tip = document.createElement('div');
  tip.className = 'submit-missing-tip';
  tip.setAttribute('role', 'tooltip');
  tip.style.display = 'none';
  ticketSubmitBtn.parentNode.style.position = 'relative';
  ticketSubmitBtn.parentNode.appendChild(tip);

  ticketSubmitBtn.addEventListener('mouseenter', function () {
    if (!ticketSubmitBtn.disabled) { tip.style.display = 'none'; return; }
    var missing = (ticketSubmitBtn.getAttribute('data-missing') || '').split('\n').filter(Boolean);
    if (!missing.length) { tip.style.display = 'none'; return; }
    tip.innerHTML = '<strong>Campi mancanti:</strong><ul>' +
      missing.map(function (m) { return '<li>' + escapeHtml(m) + '</li>'; }).join('') + '</ul>';
    tip.style.display = '';
  });
  ticketSubmitBtn.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
})();

function getSubmitMissingReasons() {
  var reasons = [];
  if (!Number(incidentTypeInput.value || 0)) reasons.push('Tipo di incident');
  if (!descGetText()) reasons.push('Descrizione');
  var incompletePreset = getIncompletePresetFields(presetInlineComposer);
  if (incompletePreset.length) {
    incompletePreset.forEach(function (f) {
      reasons.push(f.dataset.presetLabel || f.getAttribute('aria-label') || 'Campo preset');
    });
  }
  if (!fabValue.value) reasons.push('FAB');
  var severityCfg = incidentIdToSeverityMap[String(incidentTypeInput.value || '')] || { severity_default: 1, severity_mode: 'default' };
  if (severityCfg.severity_mode === 'user' && !String(ticketSeveritySelect && ticketSeveritySelect.value || '').trim()) reasons.push('Severity');
  if (!ticketTimestampInput.value) reasons.push('Orario');
  if (isGenericIncidentId(incidentTypeInput.value) && !(customIncidentNameInput && customIncidentNameInput.value.trim())) reasons.push('Nome incident');
  return reasons;
}

function syncSubmitBtnState() {
  if (!ticketSubmitBtn || ticketSubmitBusy || ticketForm.dataset.readMode === '1') return;
  var reasons = getSubmitMissingReasons();
  var valid = !reasons.length;
  ticketSubmitBtn.disabled = !valid;
  ticketSubmitBtn.setAttribute('data-missing', valid ? '' : reasons.join('\n'));
}

if (customIncidentNameInput) {
  customIncidentNameInput.addEventListener('input', function () {
    updateTicketModalHeading(incidentTypeInput.value, customIncidentNameInput.value);
    syncSubmitBtnState();
  });
}

if (ticketTimestampInput) ticketTimestampInput.addEventListener('input', syncSubmitBtnState);
if (ticketSeveritySelect) {
  ticketSeveritySelect.addEventListener('change', syncSubmitBtnState);
  ticketSeveritySelect.addEventListener('input', syncSubmitBtnState);
}

function openTicketReadModal(ticket) {
  const item = ticket || {};
  editingTicketId = null;
  clearExtraTicketCards();
  incidentTypeInput.value = String(item.incidentId || '');
  syncCustomIncidentNameField(item.incidentId, item.incidentName || '', true);
  descSetReadOnly(true);
  descShow(false);
  const descReadEl = document.getElementById('descriptionRead');
  if (descReadEl) descReadEl.innerHTML = renderDescriptionHtml(String(item.description || ''));
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
      incidentYear: 'Ticket per Incident',
      userYear: 'Ticket Utenti'
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
    incidentYear: document.getElementById('incidentYearChartTitle'),
    userYear: document.getElementById('userYearChartTitle')
  };
  Object.keys(titleMap).forEach((key) => {
    if (titleMap[key]) titleMap[key].textContent = getDashboardChartTitle(key);
  });
}

function applyLayoutCustomProperties() {
  const layout = uiColors?.layout || defaultUiColors().layout;
  const root = document.documentElement;
  root.style.setProperty('--layout-panel-h-min', layout.panel_height_min + 'px');
  root.style.setProperty('--layout-panel-h-pref', layout.panel_height_preferred + 'vh');
  root.style.setProperty('--layout-panel-h-max', layout.panel_height_max + 'px');
  root.style.setProperty('--layout-legend-font', (layout.legend_font_size / 100) + 'rem');
  root.style.setProperty('--layout-legend-col-min', layout.legend_col_min + 'px');
  root.style.setProperty('--layout-chart-h-pct', layout.chart_height_pct + '%');
  root.style.setProperty('--layout-select-min-w', layout.select_min_width + 'px');
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
    case 'userDay':
    case 'userYear':
      return 'users';
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

function getIncidentCategoryName(label) {
  const rawLabel = String(label || '');
  const direct = String(incidentCategoryMap[rawLabel] || '').trim();
  if (direct) return direct;
  const trimmed = rawLabel.trim();
  if (trimmed && trimmed !== rawLabel) {
    const trimmedDirect = String(incidentCategoryMap[trimmed] || '').trim();
    if (trimmedDirect) return trimmedDirect;
  }
  const normalized = rawLabel.toLocaleLowerCase('it').trim();
  if (!normalized) return '';
  const incidentNames = Object.keys(incidentCategoryMap);
  for (let index = 0; index < incidentNames.length; index += 1) {
    const name = incidentNames[index];
    if (String(name || '').toLocaleLowerCase('it').trim() === normalized) {
      return String(incidentCategoryMap[name] || '').trim();
    }
  }
  return '';
}

function getBarColor(chartId, label) {
  const chartKey = normalizeChartKey(chartId);
  const [theme, fallbackTheme] = themeFallbackOrder();
  const normalizedLabel = String(label || '');
  if (chartKey === 'incidentYear') {
    const categoryName = getIncidentCategoryName(normalizedLabel);
    if (categoryName) {
      const categoryColor = uiColors?.labels?.categories?.[theme]?.[categoryName] || uiColors?.labels?.categories?.[fallbackTheme]?.[categoryName];
      if (normalizeHexColor(categoryColor)) return normalizeHexColor(categoryColor);
      return getLabelColor('categories', categoryName);
    }
  }
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
  applyLayoutCustomProperties();
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
  const rowHeight = 78;
  const height = Math.max(380, 180 + stats.length * rowHeight);
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

  const left = 78;
  const right = width - 60;
  const top = 130;
  const barHeight = 24;
  const barGap = 54;
  const barArea = right - left - 200;

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
    ctx.fillText(label, left, y - 10);

    ctx.fillStyle = isDark ? '#22344d' : '#dbe7f5';
    ctx.fillRect(left, y, barArea, barHeight);

    const grad = ctx.createLinearGradient(left, y, left + barWidth, y);
    grad.addColorStop(0, color);
    grad.addColorStop(1, isDark ? '#2ec4d6' : '#0c5f8c');
    ctx.fillStyle = grad;
    ctx.fillRect(left, y, barWidth, barHeight);

    ctx.fillStyle = textColor;
    ctx.font = '700 20px Segoe UI, sans-serif';
    ctx.fillText(String(value), left + barArea + 18, y + 18);
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

function normalizeAnalysisText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeAnalysisKey(value) {
  return normalizeAnalysisText(value).toLowerCase();
}

function countTopValues(values, topN, minCount) {
  const counts = {};
  const labels = {};
  (values || []).forEach(function(value) {
    const normalized = normalizeAnalysisText(value);
    const key = normalizeAnalysisKey(normalized);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
    if (!labels[key]) labels[key] = normalized;
  });
  return Object.keys(counts).map(function(key) {
    return { label: labels[key] || key, total: counts[key] || 0 };
  }).sort(function(a, b) {
    if ((b.total || 0) !== (a.total || 0)) return (b.total || 0) - (a.total || 0);
    return String(a.label || '').localeCompare(String(b.label || ''), 'it');
  }).filter(function(item) {
    return (item.total || 0) >= Number(minCount || 1);
  }).slice(0, topN || 5);
}

function matchesAnalysisField(label, aliases) {
  const normalized = normalizeAnalysisKey(label);
  if (!normalized) return false;
  return (aliases || []).some(function(alias) {
    return normalized.indexOf(alias) !== -1;
  });
}

function buildCategoryDetailAnalysis(categoryName, tickets) {
  const bucket = {
    categoryName: categoryName || 'Categoria',
    total: Array.isArray(tickets) ? tickets.length : 0,
    incidentStats: [],
    fields: {
      macchina: [],
      lotto: [],
      operazione: [],
      sequenza: []
    }
  };
  if (!Array.isArray(tickets) || !tickets.length) return bucket;

  bucket.incidentStats = _aggregateBy(tickets, function(t) {
    return normalizeAnalysisText(t.incident_name || 'N/D') || 'N/D';
  }).slice(0, 6);

  tickets.forEach(function(ticket) {
    const incidentId = String(ticket && ticket.incident_id != null ? ticket.incident_id : '');
    const incidentName = normalizeAnalysisText(ticket && ticket.incident_name ? ticket.incident_name : '');
    const presets = incidentIdToPresetMap[incidentId] || incidentPresetMap[incidentName] || [];
    const template = Array.isArray(presets) && presets.length ? String(presets[0] || '') : '';
    if (!template) return;
    const extractedValues = extractPresetValuesFromMarkup(template, ticket.description || '');
    const extractedByKey = {};
    (extractedValues || []).forEach(function(item) {
      extractedByKey[item.key] = item.value;
    });
    parsePresetTokens(template).forEach(function(token) {
      const label = normalizeAnalysisText(token.label || '');
      const value = normalizeAnalysisText(extractedByKey[token.key] || '');
      if (!label || !value) return;
      if (matchesAnalysisField(label, ['macchina', 'machine'])) bucket.fields.macchina.push(value);
      if (matchesAnalysisField(label, ['lotto', 'box'])) bucket.fields.lotto.push(value);
      if (matchesAnalysisField(label, ['operazione', 'operation'])) bucket.fields.operazione.push(value);
      if (matchesAnalysisField(label, ['sequenza', 'sequence'])) bucket.fields.sequenza.push(value);
    });
  });

  return bucket;
}

function extractTicketAnalysisData(ticket) {
  const details = {
    incident: normalizeAnalysisText(ticket && ticket.incident_name ? ticket.incident_name : 'N/D') || 'N/D',
    fab: normalizeAnalysisText(ticket && ticket.fab ? ticket.fab : 'N/D') || 'N/D',
    macchina: '',
    lotto: '',
    operazione: '',
    sequenza: '',
    motivo: ''
  };
  const incidentId = String(ticket && ticket.incident_id != null ? ticket.incident_id : '');
  const incidentName = normalizeAnalysisText(ticket && ticket.incident_name ? ticket.incident_name : '');
  const presets = incidentIdToPresetMap[incidentId] || incidentPresetMap[incidentName] || [];
  const template = Array.isArray(presets) && presets.length ? String(presets[0] || '') : '';
  if (!template) return details;

  const extractedValues = extractPresetValuesFromMarkup(template, ticket.description || '');
  const extractedByKey = {};
  (extractedValues || []).forEach(function(item) {
    extractedByKey[item.key] = normalizeAnalysisText(item.value || '');
  });
  parsePresetTokens(template).forEach(function(token) {
    const label = normalizeAnalysisText(token.label || '');
    const value = normalizeAnalysisText(extractedByKey[token.key] || '');
    if (!label || !value) return;
    if (!details.macchina && matchesAnalysisField(label, ['macchina', 'machine'])) details.macchina = value;
    if (!details.lotto && matchesAnalysisField(label, ['lotto', 'box'])) details.lotto = value;
    if (!details.operazione && matchesAnalysisField(label, ['operazione', 'operation'])) details.operazione = value;
    if (!details.sequenza && matchesAnalysisField(label, ['sequenza', 'sequence'])) details.sequenza = value;
    if (!details.motivo && matchesAnalysisField(label, ['motivo', 'motivazione', 'reason', 'causa'])) details.motivo = value;
  });
  return details;
}

function buildOccurrenceTableRows(tickets) {
  const counts = {};
  const labels = {};
  (tickets || []).forEach(function(ticket) {
    const details = extractTicketAnalysisData(ticket);
    let elementType = '';
    let elementValue = '';
    let detailValue = '';
    if (details.macchina) {
      elementType = 'Macchina';
      elementValue = details.macchina;
      detailValue = details.motivo || details.incident;
    } else if (details.lotto || details.operazione) {
      elementType = 'Lotto';
      elementValue = details.lotto || 'N/D';
      detailValue = details.operazione || details.motivo || details.incident;
    } else {
      return;
    }
    const fabValue = details.fab || 'N/D';
    const key = [elementType, normalizeAnalysisKey(elementValue), normalizeAnalysisKey(detailValue), normalizeAnalysisKey(fabValue)].join('|');
    counts[key] = (counts[key] || 0) + 1;
    if (!labels[key]) {
      labels[key] = {
        tipo: elementType,
        elemento: elementValue,
        dettaglio: detailValue,
        fab: fabValue
      };
    }
  });
  return Object.keys(counts).map(function(key) {
    return {
      tipo: labels[key].tipo,
      elemento: labels[key].elemento,
      dettaglio: labels[key].dettaglio,
      fab: labels[key].fab,
      occorrenze: counts[key]
    };
  }).sort(function(a, b) {
    if (b.occorrenze !== a.occorrenze) return b.occorrenze - a.occorrenze;
    if (a.tipo !== b.tipo) return String(a.tipo).localeCompare(String(b.tipo), 'it');
    if (a.elemento !== b.elemento) return String(a.elemento).localeCompare(String(b.elemento), 'it');
    return String(a.dettaglio).localeCompare(String(b.dettaglio), 'it');
  });
}

function buildDimensionDetailAnalysis(dimension, dimensionValue, tickets, meta) {
  const valueLabel = dimensionValue || 'Voce';
  const bucket = {
    dimension: dimension,
    dimensionValue: valueLabel,
    total: Array.isArray(tickets) ? tickets.length : 0,
    incidentStats: [],
    categoryStats: [],
    fabStats: [],
    occurrenceRows: [],
    fields: {
      macchina: [],
      lotto: [],
      operazione: [],
      sequenza: []
    }
  };
  if (!Array.isArray(tickets) || !tickets.length) return bucket;

  if (dimension === 'category') {
    const categoryBucket = buildCategoryDetailAnalysis(valueLabel, tickets);
    bucket.incidentStats = categoryBucket.incidentStats;
    bucket.fields = categoryBucket.fields;
    bucket.occurrenceRows = buildOccurrenceTableRows(tickets);
    bucket.fabStats = _aggregateBy(tickets, function(t) {
      return normalizeAnalysisText(t.fab || 'N/D') || 'N/D';
    }).slice(0, 4);
    return bucket;
  }

  const catMap = _buildIncidentCategoryMap(meta);
  bucket.incidentStats = _aggregateBy(tickets, function(t) {
    return normalizeAnalysisText(t.incident_name || 'N/D') || 'N/D';
  }).slice(0, 6);
  bucket.categoryStats = _aggregateBy(tickets, function(t) {
    const categoryName = catMap[String(t.incident_id)] || catMap[String(t.incident_name || '')] || t.category || 'Altro';
    return normalizeAnalysisText(categoryName) || 'Altro';
  }).slice(0, 4);
  bucket.fabStats = _aggregateBy(tickets, function(t) {
    return normalizeAnalysisText(t.fab || 'N/D') || 'N/D';
  }).slice(0, 4);
  bucket.occurrenceRows = buildOccurrenceTableRows(tickets);

  tickets.forEach(function(ticket) {
    const details = extractTicketAnalysisData(ticket);
    if (details.macchina) bucket.fields.macchina.push(details.macchina);
    if (details.lotto) bucket.fields.lotto.push(details.lotto);
    if (details.operazione) bucket.fields.operazione.push(details.operazione);
    if (details.sequenza) bucket.fields.sequenza.push(details.sequenza);
  });

  return bucket;
}

function filterTicketsForDimensionValue(tickets, dimension, value, meta) {
  const targetValue = normalizeAnalysisKey(value);
  const catMap = _buildIncidentCategoryMap(meta);
  return (tickets || []).filter(function(ticket) {
    let ticketValue = '';
    if (dimension === 'category') {
      ticketValue = (ticket && ticket.category) || catMap[String(ticket && ticket.incident_id != null ? ticket.incident_id : '')] || catMap[String(ticket && ticket.incident_name ? ticket.incident_name : '')] || '';
    } else if (dimension === 'incident') {
      ticketValue = ticket && ticket.incident_name ? ticket.incident_name : '';
    } else {
      ticketValue = ticket && ticket.fab ? ticket.fab : '';
    }
    return normalizeAnalysisKey(ticketValue) === targetValue;
  });
}

function addDimensionDetailSlide(deck, slideRefs, cfg, detail, palette) {
  const slideBg = palette.slideBg;
  const headerBg = palette.headerBg;
  const headerMuted = palette.headerMuted;
  const panelBg = palette.panelBg;
  const borderColor = palette.borderColor;
  const titleColor = palette.titleColor;
  const mutedColor = palette.mutedColor;
  const accentBlue = palette.accentBlue;
  const accentTeal = palette.accentTeal;
  const accentOrange = palette.accentOrange;
  const detailSlide = deck.addSlide();
  slideRefs.push(detailSlide);
  detailSlide.background = { color: slideBg };
  detailSlide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.52, fill: { color: headerBg }, line: { color: headerBg } });
  detailSlide.addText((cfg.dimensionLabel + ' · ' + detail.dimensionValue).toUpperCase(), { x: 0.25, y: 0, w: 9.0, h: 0.52, color: 'FFFFFF', bold: true, fontSize: 12, valign: 'middle', charSpacing: 1 });
  detailSlide.addText(String(detail.total) + ' ticket', { x: 9.7, y: 0, w: 3.4, h: 0.52, color: headerMuted, fontSize: 9, align: 'right', valign: 'middle' });
  detailSlide.addShape('rect', { x: 0, y: 0.52, w: 13.33, h: 0.025, fill: { color: accentTeal }, line: { color: accentTeal } });
  detailSlide.addShape('rect', { x: 0.28, y: 0.82, w: 6.15, h: 5.95, fill: { color: panelBg }, line: { color: borderColor, width: 0.5 } });
  detailSlide.addShape('rect', { x: 6.63, y: 0.82, w: 6.42, h: 5.95, fill: { color: panelBg }, line: { color: borderColor, width: 0.5 } });

  const leftTitle = cfg.dimension === 'incident' ? 'FAB PIU COINVOLTE' : 'INCIDENT PIU FREQUENTI';
  const leftStats = cfg.dimension === 'incident' ? detail.fabStats : detail.incidentStats;
  const leftSuffix = ' ticket';
  detailSlide.addText(leftTitle, { x: 0.52, y: 1.02, w: 5.6, h: 0.24, fontSize: 8, color: accentOrange, bold: true, charSpacing: 1.3 });
  formatTopStatsLines(leftStats, leftSuffix).forEach(function(line, index) {
    detailSlide.addText(line, { x: 0.52, y: 1.34 + index * 0.46, w: 5.45, h: 0.36, fontSize: 10, color: titleColor, bold: index === 0 });
  });

  const topRightSections = [];
  if (cfg.dimension === 'category') {
    topRightSections.push({ title: 'FAB principali', stats: detail.fabStats });
  } else if (cfg.dimension === 'fab') {
    topRightSections.push({ title: 'Categorie principali', stats: detail.categoryStats });
  } else if (cfg.dimension === 'incident') {
    topRightSections.push({ title: 'Categorie principali', stats: detail.categoryStats });
  }

  const frequentFields = [
    { title: 'Macchine ricorrenti', stats: countTopValues(detail.fields.macchina, 3, 2) },
    { title: 'Lotti ricorrenti', stats: countTopValues(detail.fields.lotto, 3, 2) },
    { title: 'Operazioni ricorrenti', stats: countTopValues(detail.fields.operazione, 3, 2) },
    { title: 'Sequenze ricorrenti', stats: countTopValues(detail.fields.sequenza, 3, 2) }
  ];
  const rightSections = topRightSections.concat(frequentFields).filter(function(section) {
    return Array.isArray(section.stats) && section.stats.length;
  }).slice(0, 4);
  rightSections.forEach(function(section, sectionIndex) {
    const baseY = 1.02 + sectionIndex * 1.36;
    detailSlide.addText(section.title.toUpperCase(), { x: 6.88, y: baseY, w: 5.75, h: 0.22, fontSize: 7.6, color: accentBlue, bold: true, charSpacing: 1.1 });
    formatTopStatsLines(section.stats, section.title.indexOf('ricorrenti') !== -1 ? ' occ.' : ' ticket').forEach(function(line, lineIndex) {
      detailSlide.addText(line, { x: 6.88, y: baseY + 0.28 + lineIndex * 0.28, w: 5.7, h: 0.24, fontSize: 9.2, color: lineIndex === 0 ? titleColor : mutedColor, bold: lineIndex === 0 });
    });
  });

  const summaryBits = [];
  if (detail.incidentStats.length) summaryBits.push('Incident principale: ' + detail.incidentStats[0].label + ' (' + detail.incidentStats[0].total + ')');
  if (detail.categoryStats.length) summaryBits.push('Categoria principale: ' + detail.categoryStats[0].label);
  if (detail.fabStats.length) summaryBits.push('FAB principale: ' + detail.fabStats[0].label);
  ['macchina', 'lotto', 'operazione', 'sequenza'].forEach(function(fieldKey) {
    const top = countTopValues(detail.fields[fieldKey], 1, 2);
    if (top.length) summaryBits.push(fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1) + ' piu ricorrente: ' + top[0].label);
  });
  detailSlide.addShape('rect', { x: 0.28, y: 6.92, w: 12.77, h: 0.22, fill: { color: borderColor }, line: { color: borderColor } });
  detailSlide.addText(summaryBits.length ? summaryBits.join('  ·  ') : 'Nessun pattern aggiuntivo disponibile per questa vista.', {
    x: 0.35, y: 6.98, w: 12.55, h: 0.18, fontSize: 8, color: mutedColor, italic: true, align: 'center'
  });
}

function addOccurrenceTableSlides(deck, slideRefs, cfg, detail, palette) {
  const rows = Array.isArray(detail.occurrenceRows) ? detail.occurrenceRows : [];
  if (!rows.length) return;
  const pageSize = 10;
  for (let start = 0; start < rows.length; start += pageSize) {
    const pageRows = rows.slice(start, start + pageSize);
    const slide = deck.addSlide();
    slideRefs.push(slide);
    slide.background = { color: palette.slideBg };
    slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.52, fill: { color: palette.headerBg }, line: { color: palette.headerBg } });
    slide.addText((cfg.dimensionLabel + ' · ' + detail.dimensionValue + ' · ANALISI OCCORRENZE').toUpperCase(), {
      x: 0.25, y: 0, w: 10.7, h: 0.52, color: 'FFFFFF', bold: true, fontSize: 11, valign: 'middle', charSpacing: 1
    });
    slide.addText('Righe ' + (start + 1) + '-' + (start + pageRows.length) + ' di ' + rows.length, {
      x: 10.9, y: 0, w: 2.1, h: 0.52, color: palette.headerMuted, fontSize: 8, align: 'right', valign: 'middle'
    });
    slide.addShape('rect', { x: 0, y: 0.52, w: 13.33, h: 0.025, fill: { color: palette.accentTeal }, line: { color: palette.accentTeal } });

    const cols = [
      { key: 'tipo', label: 'Tipo', x: 0.35, w: 1.1 },
      { key: 'elemento', label: 'Elemento', x: 1.5, w: 3.15 },
      { key: 'dettaglio', label: 'Motivazione / Operazione', x: 4.75, w: 5.0 },
      { key: 'fab', label: 'FAB', x: 9.9, w: 1.0 },
      { key: 'occorrenze', label: 'Occ.', x: 11.15, w: 1.1 }
    ];
    slide.addShape('rect', { x: 0.32, y: 0.92, w: 12.3, h: 0.38, fill: { color: palette.panelBg }, line: { color: palette.borderColor, width: 0.5 } });
    cols.forEach(function(col) {
      slide.addText(col.label.toUpperCase(), {
        x: col.x, y: 1.0, w: col.w, h: 0.16, fontSize: 7.5, color: palette.accentBlue, bold: true, charSpacing: 0.8
      });
    });

    pageRows.forEach(function(row, index) {
      const y = 1.34 + index * 0.52;
      const fillColor = index % 2 === 0 ? palette.panelBg : palette.slideBg;
      slide.addShape('rect', { x: 0.32, y: y - 0.06, w: 12.3, h: 0.42, fill: { color: fillColor }, line: { color: palette.borderColor, width: 0.25 } });
      cols.forEach(function(col) {
        const value = row[col.key] != null ? String(row[col.key]) : '';
        slide.addText(value, {
          x: col.x, y: y, w: col.w, h: 0.18, fontSize: col.key === 'dettaglio' ? 8.2 : 8.4,
          color: col.key === 'occorrenze' ? palette.titleColor : palette.mutedColor,
          bold: col.key === 'occorrenze' || (col.key === 'elemento' && row.occorrenze > 1),
          fit: 'shrink'
        });
      });
    });
  }
}

function formatTopStatsLines(stats, suffix) {
  if (!stats || !stats.length) return ['Nessuna ricorrenza rilevata'];
  return stats.map(function(item, index) {
    return (index + 1) + '. ' + item.label + ' (' + item.total + (suffix || '') + ')';
  });
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
    const slideRefs = [];

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
    slideRefs.push(cover);
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

    // ── SLIDE 2: ANALISI ──
    const slide = deck.addSlide();
    slideRefs.push(slide);
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

    if (stats.length) {
      const detailPalette = {
        slideBg: slideBg,
        headerBg: headerBg,
        headerMuted: headerMuted,
        panelBg: panelBg,
        borderColor: borderColor,
        titleColor: titleColor,
        mutedColor: mutedColor,
        accentBlue: accentBlue,
        accentTeal: accentTeal,
        accentOrange: accentOrange
      };
      stats.forEach(function(statRow) {
        const dimensionValue = normalizeAnalysisText(statRow.label || 'Voce');
        const detailTickets = filterTicketsForDimensionValue(periodTickets, cfg.dimension, dimensionValue, meta);
        const detail = buildDimensionDetailAnalysis(cfg.dimension, dimensionValue, detailTickets, meta);
        addDimensionDetailSlide(deck, slideRefs, cfg, detail, detailPalette);
        addOccurrenceTableSlides(deck, slideRefs, cfg, detail, detailPalette);
      });
    }

    slideRefs.forEach(function(ref, index) {
      addFooter(ref, index + 1, slideRefs.length);
    });

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
    if (isQuickbarPage) restoreQuickbarAfterModalClose();
    else scheduleQuickbarAutoFitHeight();
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
  if (isQuickbarPage && !quickbarCompactWidthBeforeModal) quickbarCompactWidthBeforeModal = window.outerWidth || 320;
  modal.classList.remove('closing');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  lockModalScroll();
  requestAnimationFrame(function() {
    modal.classList.add('active');
    updateSingleTicketModalHeight();
    if (isQuickbarPage) {
      setTimeout(function () { fitQuickbarToTicketModal(); }, 20);
      setTimeout(function () { fitQuickbarToTicketModal(); }, 120);
    }
    setTimeout(function() {
      autoResizeTextarea(document.getElementById('description'));
    }, 0);
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
  var customInsertOpt = null;
  var allItems = [];

  function syncItems() {
    allItems = [];
    proposeOpt = null;
    customInsertOpt = null;
    placeholderText = '';
    for (var i = 0; i < select.options.length; i++) {
      var o = select.options[i];
      if (o.dataset && o.dataset.separator) continue;
      if (!o.value) { placeholderText = o.textContent; continue; }
      if (o.value === '__propose_new__') { proposeOpt = { value: o.value, text: o.textContent }; continue; }
      if (o.value === '__custom_insert__') { customInsertOpt = { value: o.value, text: o.textContent }; continue; }
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
        select.dataset.proposedDraft = (search.value || '').trim();
        select.value = '__propose_new__';
        select.dispatchEvent(new Event('input', { bubbles: true }));
        closePanel();
        setTimeout(updateTriggerLabel, 80);
      });
      list.appendChild(li2);
    }
    if (customInsertOpt) {
      var li3 = document.createElement('li');
      li3.className = 'sd-option sd-custom-insert';
      li3.dataset.value = customInsertOpt.value;
      li3.textContent = customInsertOpt.text;
      li3.setAttribute('role', 'option');
      li3.addEventListener('mousedown', function(e) {
        e.preventDefault();
        select.dataset.proposedDraft = (search.value || '').trim();
        select.value = '__custom_insert__';
        select.dispatchEvent(new Event('input', { bubbles: true }));
        closePanel();
        setTimeout(updateTriggerLabel, 80);
      });
      list.appendChild(li3);
    }
    if (proposeOpt || customInsertOpt) {
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
    select.dataset.proposedDraft = '';
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
    select.dataset.proposedDraft = (search.value || '').trim();
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
      const customInsert = document.createElement('option');
      customInsert.value = '__custom_insert__';
      customInsert.textContent = '+ Inserimento custom';
      select.appendChild(customInsert);
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

// Aggiunge un pulsante "+" a un campo di testo del preset per accodare altri box
// di testo. Il valore del token diventa l'unione (", ") di tutti i box non vuoti.
// onChange è syncPresetFieldValue del campo (aggiorna chip/descrizione/validazione).
function setupPresetTextMulti(primary, fieldWrap, onChange) {
  const extras = [];
  primary._presetValueGetter = function () {
    return [primary].concat(extras)
      .map(function (i) { return String(i.value || '').trim(); })
      .filter(Boolean)
      .join(', ');
  };

  // Mette il campo principale e il "+" sulla stessa riga.
  const mainRow = document.createElement('div');
  mainRow.className = 'preset-text-row';
  fieldWrap.insertBefore(mainRow, primary);
  mainRow.appendChild(primary);
  primary.style.width = ''; // il layout flex della riga gestisce la larghezza

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'preset-text-add';
  addBtn.textContent = '+';
  addBtn.title = 'Aggiungi un altro valore';
  addBtn.setAttribute('aria-label', 'Aggiungi un altro valore');
  mainRow.appendChild(addBtn);

  addBtn.addEventListener('click', function () {
    const row = document.createElement('div');
    row.className = 'preset-text-row preset-text-extra-row';
    const extra = document.createElement('input');
    extra.type = 'text';
    extra.className = 'preset-text-extra';
    extra.placeholder = primary.placeholder || '';
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'preset-text-remove';
    rm.textContent = '×';
    rm.title = 'Rimuovi questo valore';
    rm.setAttribute('aria-label', 'Rimuovi questo valore');
    rm.addEventListener('click', function () {
      const idx = extras.indexOf(extra);
      if (idx >= 0) extras.splice(idx, 1);
      row.remove();
      onChange();
    });
    extra.addEventListener('input', onChange);
    extra.addEventListener('change', onChange);
    row.appendChild(extra);
    row.appendChild(rm);
    fieldWrap.appendChild(row);
    extras.push(extra);
    extra.focus();
    onChange();
  });
}

function renderPresetForTargets(template, descriptionInput, composerContainer, incidentId = 0, savedDescription) {
  const descCtx = descResolveContext(descriptionInput);
  descInitEditor(descCtx);
  const tokens = parsePresetTokens(template);
  if (!tokens.length) {
    presetTokenState = [];
    composerContainer.dataset.presetTemplate = '';
    composerContainer.style.display = 'none';
    composerContainer.classList.remove('preset-inline-composer--triple');
    composerContainer.innerHTML = '';
    descriptionInput.readOnly = false;
    descriptionInput.dataset.presetAutoSync = 'off';
    descriptionInput.dataset.presetAutoValue = '';
    descriptionInput.dataset.presetMarkupValue = '';
    descriptionInput.dataset.presetGeneratedBase = '';
    descriptionInput.dataset.presetMarkupBase = '';
    descriptionInput.dataset.presetManualText = '';
    descSetReadOnly(false, descCtx);
    descShow(true, descCtx);
    // Nessun token: contenuto libero. In edit riusa la descrizione salvata
    // (preserva la formattazione), altrimenti parte dal template come testo.
    descSetPlain((savedDescription != null && savedDescription !== '') ? savedDescription : (template || ''), descCtx);
    return;
  }

  const savedValues = extractPresetValuesFromMarkup(template, savedDescription);
  const tokenState = tokens.map((token) => {
    const saved = savedValues.find(function(item) { return item.key === token.key; });
    return { ...token, value: saved ? saved.value : '' };
  });
  presetTokenState = tokenState;
  composerContainer.dataset.presetTemplate = template || '';
  composerContainer.style.display = 'grid';
  composerContainer.classList.toggle('preset-inline-composer--triple', tokenState.length >= 3);
  composerContainer.innerHTML = '';
  descriptionInput.readOnly = false;
  descSetReadOnly(false, descCtx);
  descShow(true, descCtx);
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
    } else if (token.type === 'multi') {
      // Blocco "scelta multipla": menu a tendina a scelta SINGOLA tra le parole
      // definite dall'admin. L'operatore puo selezionarne esattamente una.
      input = document.createElement('select');
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'Seleziona un\'opzione';
      input.appendChild(empty);
      const savedMulti = String(tokenState[tokenIndex].value || '').split(',')[0].trim();
      (token.options || []).forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
      if (savedMulti && (token.options || []).indexOf(savedMulti) !== -1) input.value = savedMulti;
    } else if (token.type === 'timestamp') {
      input = document.createElement('input');
      input.type = 'time';
      input.placeholder = 'hh:mm';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = token.label || '';
      // Solo il tipo `texts` (box testo multiplo) offre il pulsante "+" per
      // accodare altri box; il tipo `text` (box testo singolo) resta un campo
      // solo, senza pulsante di aggiunta.
      if (token.type === 'texts') input.dataset.presetTextMulti = '1';
    }
    input.required = true;
    // I select (select/dbselect/multi) impostano gia da soli l'opzione salvata;
    // riassegnare qui un valore multi-valore vecchio azzererebbe la selezione.
    if (tokenState[tokenIndex].value && input.tagName !== 'SELECT') input.value = tokenState[tokenIndex].value;
    input.dataset.presetField = '1';
    input.dataset.presetLabel = token.label || `Campo ${tokenIndex + 1}`;
    input.style.width = '100%';
    const syncPresetFieldValue = async () => {
      if ((token.type === 'select' || token.type === 'dbselect') && input.value === '__custom_insert__') {
        const customValue = await showPrompt('Inserisci un valore custom per il campo "' + (token.label || 'campo') + '".', { title: 'Inserimento custom', placeholder: 'Valore', defaultValue: String(input.dataset.proposedDraft || '').trim(), confirmText: 'Inserisci' });
        if (!customValue || !customValue.trim()) {
          input.value = '';
          input.dataset.proposedDraft = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          syncSubmitBtnState();
          return;
        }
        const val = customValue.trim();
        const existingOpt = Array.from(input.querySelectorAll('option')).find(function(o) {
          return o.value && o.value !== '__propose_new__' && o.value !== '__custom_insert__' && !o.dataset.separator && o.value.toLocaleLowerCase('it') === val.toLocaleLowerCase('it');
        });
        if (existingOpt) {
          input.value = existingOpt.value;
          showToast('Questo elemento esiste già: "' + existingOpt.value + '".', 'warning', 'Elemento duplicato');
        } else {
          var newOpt = document.createElement('option');
          newOpt.value = val;
          newOpt.textContent = val;
          var beforeEl = input.querySelector('option[value="__propose_new__"]') || input.querySelector('option[value="__custom_insert__"]');
          if (beforeEl) input.insertBefore(newOpt, beforeEl);
          else input.appendChild(newOpt);
          input.value = val;
        }
        input.dataset.proposedDraft = '';
        if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
        tokenState[tokenIndex].value = input.value || '';
        descSetChipValue(tokenIndex, input.value || '', descCtx);
        syncSubmitBtnState();
        return;
      }
      if ((token.type === 'select' || token.type === 'dbselect') && input.value === '__propose_new__') {
        const proposedValue = await showPrompt(`Proponi un nuovo elemento per il campo "${token.label}". Verrà inviato all'amministratore per l'approvazione prima di essere disponibile.`, { title: 'Proponi nuovo elemento', placeholder: 'Nuovo valore', defaultValue: String(input.dataset.proposedDraft || '').trim(), confirmText: 'Invia proposta' });
        if (!proposedValue || !proposedValue.trim()) {
          input.value = '';
          input.dataset.proposedDraft = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          syncSubmitBtnState();
          return;
        }
        const value = proposedValue.trim();
        input.dataset.proposedDraft = value;
        const normalizedValue = value.toLocaleLowerCase('it');
        const duplicateOption = [...input.querySelectorAll('option')].find((option) => {
          if (!option || option.value === '__propose_new__' || option.dataset.separator === '1') return false;
          return String(option.value || '').trim().toLocaleLowerCase('it') === normalizedValue;
        });
        if (duplicateOption) {
          input.value = duplicateOption.value;
          input.dataset.proposedDraft = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Questo elemento esiste gia: "' + duplicateOption.value + '".', 'warning', 'Elemento duplicato');
          tokenState[tokenIndex].value = input.value || '';
          descSetChipValue(tokenIndex, input.value || '', descCtx);
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
          input.dataset.proposedDraft = '';
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Il nuovo elemento è stato inviato all\'admin per la revisione. Sarà disponibile dopo l\'approvazione.', 'success', 'Proposta inviata');
        } catch (error) {
          input.value = '';
          input.dataset.proposedDraft = value;
          if (typeof input._sdSyncTrigger === 'function') input._sdSyncTrigger();
          showToast('Non è stato possibile inviare la proposta: ' + (error.message || error), 'error', 'Errore invio proposta');
          syncSubmitBtnState();
          return;
        }
      }
      // Con i box di testo accodati (+) il valore del token è l'unione di tutti
      // i box; altrimenti è semplicemente il valore del campo.
      const fieldValue = (typeof input._presetValueGetter === 'function') ? input._presetValueGetter() : (input.value || '');
      tokenState[tokenIndex].value = fieldValue;
      descSetChipValue(tokenIndex, fieldValue, descCtx);
      syncSubmitBtnState();
    };
    input.addEventListener('input', syncPresetFieldValue);
    input.addEventListener('change', syncPresetFieldValue);
    fieldWrap.appendChild(input);
    // "scelta multipla" -> menu a tendina ricercabile (scelta singola), coerente
    // con gli altri select. Va inizializzato dopo l'append (serve il parentNode).
    if (token.type === 'multi') makeSearchableSelect(input);
    // Campo di testo: aggiunge il pulsante "+" per accodare altri box di testo.
    if (input.dataset.presetTextMulti === '1') setupPresetTextMulti(input, fieldWrap, syncPresetFieldValue);
    composerContainer.appendChild(fieldWrap);
  });

  // Costruisce il contenuto dell'editor: in edit riusa la descrizione salvata
  // (preserva testo/formattazione manuale + 〈valori〉), in creazione parte dal
  // template con i token come chip (vuoti o precompilati dai valori salvati).
  var buildStr;
  if (savedDescription != null && savedDescription !== '') {
    buildStr = String(savedDescription);
  } else {
    buildStr = template || '';
    tokenState.forEach(function (t) { buildStr = buildStr.replace(t.raw, DESC_TOKEN_OPEN + (t.value || '') + DESC_TOKEN_CLOSE); });
  }
  descSetContent(buildStr, tokenState, descCtx);
  syncSubmitBtnState();
}

function getIncompletePresetFields(composerContainer) {
  if (!composerContainer || composerContainer.style.display === 'none') return [];
  var specialValues = { '__propose_new__': true, '__custom_insert__': true };
  return [...composerContainer.querySelectorAll('[data-preset-field="1"]')].filter((field) => {
    if (field.disabled || field.type === 'hidden') return false;
    var val = String(field.value || '').trim();
    return !val || specialValues[val];
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
  // Se l'incident supporta il nome custom (generico o name_mode "custom") ogni
  // ticket extra ha il PROPRIO campo "Nome incident" editabile, così puoi dare
  // un nome diverso a ciascun clone. Viene precompilato col nome del principale
  // come default, ma resta modificabile in modo indipendente.
  const baseIncidentName = incidentIdToNameMap[String(incidentId)] || '';
  const supportsCustomName = isGenericIncidentId(incidentId);
  const initialCustomName = supportsCustomName
    ? (getCustomIncidentNameForSubmit() || (isGenericIncidentName(baseIncidentName) ? '' : baseIncidentName))
    : '';
  const incidentName = (supportsCustomName && initialCustomName) ? initialCustomName : baseIncidentName;
  const mainPinCheck = document.getElementById('ticketPinCheck');
  const mainPinUntil = document.getElementById('ticketPinUntil');
  const inheritPinned = !!(mainPinCheck && mainPinCheck.checked);
  const inheritPinUntil = mainPinUntil && mainPinUntil.value ? mainPinUntil.value : '';
  const panel = document.createElement('section');
  panel.className = 'modal-panel extra-ticket-modal';
  panel.dataset.extraTicket = String(extraTicketCounter);
  panel.innerHTML = `
    <div class="modal-header">
      <h3 class="extra-ticket-title">${escapeHtml(incidentName)}</h3>
      <div class="ticket-pin-wrap extra-ticket-pin-wrap">
        <label class="ticket-pin-label">
          <input type="checkbox" class="extra-ticket-pin-check"${inheritPinned ? ' checked' : ''}> 📌 PIN
        </label>
        <input type="date" class="ticket-pin-date extra-ticket-pin-date"${inheritPinUntil ? ` value="${inheritPinUntil}"` : ''} style="display:${inheritPinned ? '' : 'none'}">
      </div>
      <button type="button" class="close-extra-modal-btn">x</button>
    </div>
    <div class="ticket-form">
      ${supportsCustomName ? `
      <div class="extra-custom-name-group">
        <label>Nome incident</label>
        <input type="text" class="extra-custom-name" placeholder="Inserisci nome incident personalizzato" value="${escapeHtml(initialCustomName)}" />
      </div>` : ''}
      <label>Descrizione problema</label>
      <div class="desc-toolbar extra-description-toolbar" role="toolbar" aria-label="Formattazione descrizione">
        <button type="button" class="desc-tool" data-cmd="bold" aria-label="Grassetto"><b>B</b></button>
        <button type="button" class="desc-tool" data-cmd="italic" aria-label="Corsivo"><i>I</i></button>
        <button type="button" class="desc-tool" data-cmd="underline" aria-label="Sottolineato"><u>U</u></button>
        <span class="desc-tool-sep" aria-hidden="true"></span>
        <button type="button" class="desc-tool" data-cmd="insertUnorderedList" aria-label="Elenco puntato">&#8226;</button>
        <button type="button" class="desc-tool" data-cmd="insertOrderedList" aria-label="Elenco numerato">1.</button>
        <span class="desc-tool-sep" aria-hidden="true"></span>
        <button type="button" class="desc-tool" data-cmd="removeFormat" aria-label="Rimuovi formattazione">T&#215;</button>
      </div>
      <div class="desc-editor extra-description-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Descrizione problema" data-placeholder="Inserisci descrizione problema..."></div>
      <textarea class="extra-description" rows="7" hidden aria-hidden="true"></textarea>
      <div class="panel preset-inline-composer extra-composer" style="display:none; margin:8px 0 10px; padding:10px 12px;"></div>

      <div class="fab-severity-row">
        <div class="fab-section">
          <p class="muted">Seleziona FAB:</p>
          <div class="fab-buttons extra-fab-buttons"></div>
        </div>
        <div class="extra-severity-group severity-inline-group">
          <label>Severity <span class="severity-info" tabindex="0" aria-label="Informazioni severity" role="button">i<span class="severity-info-popup" role="tooltip">La severity pesa il tempo speso e l'effort nella risoluzone della problematica. Scegli in maniera oculata la severity secondo il buon senso.</span></span></label>
          <select class="extra-severity">
            <option value="">Seleziona severity</option>
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
  severitySelect.value = severityCfg.severity_mode === 'user' ? '' : String(severityCfg.severity_default || 1);
  if (severityHint) {
    severityHint.textContent = severityCfg.severity_mode === 'user'
      ? 'Selezione obbligatoria.'
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
  const extraPinCheck = panel.querySelector('.extra-ticket-pin-check');
  const extraPinDate = panel.querySelector('.extra-ticket-pin-date');
  if (desc && composer) {
    descInitEditor(desc);
    // Ticket nuovo: renderizza il preset FRESCO dal template (chip vuote ma
    // funzionanti). NON ereditare la descrizione del pannello principale: le sue
    // chip vuote si serializzano come testo "[Label]" senza i marker 〈…〉, quindi
    // non tornerebbero chip qui e i campi compilabili non aggiornerebbero nulla.
    renderPresetForTargets(presetTemplate, desc, composer, Number(incidentId || 0), '');
  }
  if (extraPinCheck && extraPinDate) {
    extraPinCheck.addEventListener('change', function() {
      extraPinDate.style.display = extraPinCheck.checked ? '' : 'none';
      if (!extraPinCheck.checked) extraPinDate.value = '';
      else if (!extraPinDate.value && inheritPinUntil) extraPinDate.value = inheritPinUntil;
    });
  }

  // Nome incident per-clone: aggiorna l'intestazione del pannello in tempo reale.
  const extraCustomNameInput = panel.querySelector('.extra-custom-name');
  const extraTitleEl = panel.querySelector('.extra-ticket-title');
  if (extraCustomNameInput && extraTitleEl) {
    extraCustomNameInput.addEventListener('input', function () {
      const v = String(extraCustomNameInput.value || '').trim();
      extraTitleEl.textContent = v || baseIncidentName;
    });
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
  const mainCustomName = getCustomIncidentNameForSubmit();
  const baseIncidentName = incidentIdToNameMap[String(incidentId)] || '';
  const requiresCustomName = isGenericIncidentName(baseIncidentName);
  const panels = [...document.querySelectorAll('.extra-ticket-modal')];
  for (let index = 0; index < panels.length; index += 1) {
    const panel = panels[index];
    const extraDescEl = panel.querySelector('.extra-description');
    const extraComposer = panel.querySelector('.extra-composer');
    // Nome incident PER-clone: ogni pannello ha il proprio campo editabile;
    // se assente (incident senza nome custom) si usa quello del principale.
    const extraCustomInput = panel.querySelector('.extra-custom-name');
    const customIncidentName = extraCustomInput ? String(extraCustomInput.value || '').trim() : mainCustomName;
    // Come il ticket principale: l'editor extra tiene già i valori dei token come
    // chip → 〈valore〉 nello storage. Usiamo direttamente lo storage, senza
    // ri-applicare buildMarkupFromCurrentDescription (che raddoppierebbe i marker
    // trasformando 〈valore〉 in 〈〈valore〉〉 e lasciandoli a video come testo).
    const extraDesc = extraDescEl ? descGetStorage(extraDescEl) : '';
    const extraFab = panel.querySelector('.extra-fab')?.value || '';
    const extraDt = panel.querySelector('.extra-datetime')?.value || '';
    const userSeverity = panel.querySelector('.extra-severity')?.value;
    const severityCfg = incidentIdToSeverityMap[String(incidentId)] || { severity_default: 1, severity_mode: 'default' };
    const extraSeverity = Number(userSeverity || panel.dataset.fixedSeverity || defaultSeverity || 1);
    const extraPinCheck = panel.querySelector('.extra-ticket-pin-check');
    const extraPinDate = panel.querySelector('.extra-ticket-pin-date');
    const extraPinned = !!(extraPinCheck && extraPinCheck.checked && extraPinDate && extraPinDate.value);
    const extraPinUntil = extraPinned ? String(extraPinDate.value || '') : '';
    const missingPresetFields = focusFirstIncompletePresetField(extraComposer);
    if (missingPresetFields.length) {
      throw new Error(`Ticket extra ${index + 1}: compila tutti i campi obbligatori del template (${buildMissingPresetFieldsMessage(extraComposer)}).`);
    }
    if (!extraDesc || !extraFab || !extraDt || (requiresCustomName && !customIncidentName)) {
      const missing = [];
      if (requiresCustomName && !customIncidentName) missing.push('nome incident');
      if (!extraDesc) missing.push('descrizione');
      if (!extraFab) missing.push('FAB');
      if (!extraDt) missing.push('data/ora');
      throw new Error(`Ticket extra ${index + 1} incompleto: manca ${missing.join(', ')}`);
    }
    if (severityCfg.severity_mode === 'user' && !String(userSeverity || '').trim()) {
      throw new Error(`Ticket extra ${index + 1} incompleto: manca severity.`);
    }
    payloads.push({
      incident_id: incidentId,
      incident_name: customIncidentName,
      description: extraDesc,
      fab: extraFab,
      ticket_time: new Date(extraDt).toISOString(),
      severity: extraSeverity,
      pin_enabled: extraPinned,
      pin_until: extraPinUntil
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
  const userChoice = severityCfg.severity_mode === 'user';
  ticketSeveritySelect.value = userChoice ? '' : String(severityCfg.severity_default || 1);
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = userChoice ? '' : 'none';
  ticketSeveritySelect.disabled = !userChoice;
  ticketTimestampInput.disabled = false;
  if (ticketSeverityHint) {
    ticketSeverityHint.textContent = userChoice
      ? 'Selezione obbligatoria.'
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
  const regex = /\[\[(texts?|select|dbselect|multi|timestamp):([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    const type = match[1];
    const label = (match[2] || '').trim();
    const options = type === 'select' || type === 'dbselect' || type === 'multi' ? (match[3] || '').split(',').map((x) => x.trim()).filter(Boolean) : [];
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
  // I marker 〈 〉 sono memorizzati come sequenza "mojibake" multi-carattere:
  // usiamo la lunghezza REALE dei marker (DESC_TOKEN_OPEN/CLOSE), non offset fissi.
  // Con offset fissi (+2) restava attaccato al valore l'ultimo carattere del
  // marker di apertura (un accento tipo apice), che rompeva anche il match delle
  // tendine in fase di modifica ticket.
  const open = DESC_TOKEN_OPEN;
  const close = DESC_TOKEN_CLOSE;
  const openLen = open.length;
  const closeLen = close.length;
  const values = [];
  let searchFrom = 0;
  tokens.forEach(function(token) {
    const start = source.indexOf(open, searchFrom);
    if (start < 0) {
      values.push({ key: token.key, value: '' });
      return;
    }
    const end = source.indexOf(close, start + openLen);
    if (end < 0) {
      values.push({ key: token.key, value: '' });
      return;
    }
    values.push({ key: token.key, value: source.slice(start + openLen, end) });
    searchFrom = end + closeLen;
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
  const modeByKey = { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, incidentYear: incidentYearMode, userYear: userYearMode };
  if (modeByKey[chartKey] === 'custom' && chartCustomRanges[chartKey]) return `${baseTitle} (${formatCustomRangeLabel(chartCustomRanges[chartKey])})`;
  const modeLabel = customLabel(CUSTOM_WINDOWS, modeByKey[chartKey]);
  if (modeLabel && modeByKey[chartKey] !== 'months') return `${baseTitle} (${modeLabel})`;
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
    // Altezza in percentuale dell'area di plot (non px fissi): cosi le colonne
    // restano ancorate alle righe della griglia anche quando il panel si allunga.
    const hPct = max > 0 ? (s.total / max) * 100 : 0;
    const pct = totalAll > 0 ? Math.round((s.total / totalAll) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'bar chart-clickable';
    row.setAttribute('data-chart-label', s.label);
    // L'altezza della colonna è esposta come CSS var: il numero sopra la colonna
    // è posizionato in assoluto ancorato alla cima del riempimento, cosi NON
    // sottrae spazio alla barra (niente flex-shrink) e la colonna al 100% arriva
    // esattamente alla riga del valore massimo.
    row.style.setProperty('--bar-fill-h', hPct + '%');
    const color = getBarColor(target.id, s.label);
    row.innerHTML = `<span class="bar-value">${s.total}</span><div class="bar-fill" style="height:${hPct}%;background:${color}"><span class="bar-pct">${pct}%</span></div><span class="bar-label">${escapeHtml(chartItemLabel(s))}</span>`;
    barsWrap.appendChild(row);
  });

  inner.appendChild(axis);
  inner.appendChild(barsWrap);
  target.appendChild(inner);
  setupVerticalChartFit(target, inner);
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
      <span class="chart-horizontal-label">${escapeHtml(chartItemLabel(item))}</span>
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
  if (isDonut && target && target.id === 'teamYearChart') layout.classList.add('team-donut-chart');

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
  if (isDonut) {
    // La ciambella riempie le voci dinamicamente in base allo spazio libero
    // (vedi setupDonutLegendFit, richiamato dopo l'inserimento nel DOM): mostra
    // più di 6 voci se c'è spazio, meno se le scritte coprirebbero il grafico.
  } else {
    // Torta: manteniamo il limite fisso alle prime 6 voci (le altre nel tooltip).
    const LEGEND_MAX = 6;
    const legendStats = sortedStats.length > LEGEND_MAX ? sortedStats.slice(0, LEGEND_MAX) : sortedStats;
    const hiddenCount = sortedStats.length - legendStats.length;
    legendStats.forEach((item) => {
      legend.appendChild(makePieLegendRow(target.id, item, totalAll, hideLegendValue));
    });
    if (hiddenCount > 0) {
      const more = document.createElement('div');
      more.className = 'chart-pie-legend-more';
      more.textContent = '+' + hiddenCount + ' altri — passa il mouse sul grafico';
      legend.appendChild(more);
    }
  }

  // Tooltip degli spicchi: ricostruiamo gli intervalli angolari (in %) di ogni
  // voce e, al passaggio del mouse sulla ciambella, individuiamo lo spicchio
  // sotto il cursore in base all'angolo dal centro (0% = ore 12, orario).
  if (slices.length) {
    let acc = 0;
    const sliceRanges = slices.map((slice, i) => {
      const start = acc;
      acc += slice.pct;
      const item = sortedStats[i];
      const pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
      return { start, end: acc, color: slice.color, label: chartItemLabel(item), value: item.total, pct: pct };
    });
    attachPieTooltip(visual, sliceRanges, hideLegendValue);
  }

  if (isDonut) {
    // Nella ciambella incapsuliamo legenda e grafico in due "box" distinti
    // dentro il pannello: cosi' possiamo gestire indipendentemente lo spazio
    // (la legenda si adatta al proprio contenuto, il grafico riempie
    // dinamicamente tutto lo spazio libero rimanente).
    const legendBox = document.createElement('div');
    legendBox.className = 'chart-pie-legend-box';
    legendBox.appendChild(legend);
    const visualBox = document.createElement('div');
    visualBox.className = 'chart-pie-visual-box';
    visualBox.appendChild(visual);
    layout.appendChild(legendBox);
    layout.appendChild(visualBox);
    target.appendChild(layout);
    setupDonutLegendFit(target, layout, legend, visual, sortedStats, target.id, hideLegendValue, totalAll, visualBox);
  } else {
    layout.appendChild(visual);
    layout.appendChild(legend);
    target.appendChild(layout);
  }
}

// Costruisce una riga della legenda torta/ciambella.
function makePieLegendRow(targetId, item, totalAll, hideLegendValue) {
  var row = document.createElement('div');
  row.className = 'chart-pie-legend-row chart-clickable';
  row.setAttribute('data-chart-label', item.label);
  var pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
  row.innerHTML =
    '<span class="chart-pie-swatch" style="background:' + getBarColor(targetId, item.label) + '"></span>' +
    '<span class="chart-pie-label">' + escapeHtml(chartItemLabel(item)) + '</span>' +
    (hideLegendValue
      ? '<strong class="chart-pie-value">' + pct + '%</strong>'
      : '<strong class="chart-pie-value">' + formatChartValueWithPercent(item.total, pct) + '</strong>');
  return row;
}

function formatPieLegendTooltipRows(targetId, rows, totalAll, hideLegendValue) {
  return rows.map(function(item) {
    var pct = totalAll > 0 ? Math.round((item.total / totalAll) * 100) : 0;
    var valTxt = hideLegendValue ? (pct + '%') : formatChartValueWithPercent(item.total, pct);
    return '<div class="chart-pie-tooltip-row">' +
      '<span class="chart-pie-tooltip-swatch" style="background:' + getBarColor(targetId, item.label) + '"></span>' +
      '<span class="chart-pie-tooltip-label">' + escapeHtml(chartItemLabel(item)) + '</span>' +
      '<strong class="chart-pie-tooltip-value">' + escapeHtml(valTxt) + '</strong>' +
    '</div>';
  }).join('');
}

function attachLegendMoreTooltip(more, rows, targetId, totalAll, hideLegendValue) {
  if (!more || !rows || !rows.length) return;
  var tip = getPieTooltipEl();
  more.addEventListener('mousemove', function(e) {
    tip.innerHTML = formatPieLegendTooltipRows(targetId, rows, totalAll, hideLegendValue);
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
    tip.classList.add('visible', 'chart-pie-tooltip-list');
  });
  more.addEventListener('mouseleave', function() {
    tip.classList.remove('visible', 'chart-pie-tooltip-list');
  });
}

// Dimensiona la legenda della ciambella in base allo spazio libero: mostra il
// massimo numero di voci che entrano SOPRA il grafico senza sovrapporsi/tagliarlo
// (più di 6 se c'è spazio, meno se ce n'è poco). Le voci nascoste restano nel
// tooltip. Si ri-adatta al variare della dimensione del pannello (ResizeObserver).
function setupDonutLegendFit(target, layout, legend, visual, sortedStats, targetId, hideLegendValue, totalAll, visualBox) {
  var total = sortedStats.length;
  var LEGEND_MAX = 6;
  var shown = sortedStats.slice(0, LEGEND_MAX);
  var hidden = sortedStats.slice(LEGEND_MAX);
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function applyCenterScale() {
    // La ciambella e' dimensionata dal CSS in base al box che la contiene;
    // qui adattiamo solo la scritta al centro (totale + "Totale") all'attuale
    // diametro effettivo.
    var nextSize = visual.clientWidth || 0;
    if (!nextSize) return;
    var ratio = nextSize / 180;
    var centerScale = clamp(ratio, 0.86, 1.6);
    layout.style.setProperty('--donut-center-strong-size', 'calc(' + (1.6 * centerScale).toFixed(3).replace(/\.?0+$/, '') + 'rem * var(--chart-font-scale))');
    layout.style.setProperty('--donut-center-label-size', 'calc(' + (0.78 * Math.max(0.76, Math.min(centerScale, 1.4))).toFixed(3).replace(/\.?0+$/, '') + 'rem * var(--chart-font-scale))');
  }
  function resetLegendScale() {
    if (targetId === 'teamYearChart') {
      layout.style.setProperty('--donut-legend-font-size', 'calc(.96rem * var(--chart-font-scale))');
      layout.style.setProperty('--donut-legend-value-size', 'calc(.88rem * var(--chart-font-scale))');
      layout.style.setProperty('--donut-legend-row-gap', '9px');
    } else {
      layout.style.setProperty('--donut-legend-font-size', 'calc(.9rem * var(--chart-font-scale))');
      layout.style.setProperty('--donut-legend-value-size', 'calc(.84rem * var(--chart-font-scale))');
      layout.style.setProperty('--donut-legend-row-gap', '7px');
    }
    layout.style.setProperty('--donut-legend-min-height', '20px');
    layout.style.setProperty('--donut-swatch-size', '11px');
    layout.style.removeProperty('--donut-center-strong-size');
    layout.style.removeProperty('--donut-center-label-size');
    visual.style.removeProperty('width');
    visual.style.removeProperty('max-width');
  }
  function fill() {
    legend.innerHTML = '';
    for (var i = 0; i < shown.length; i++) {
      legend.appendChild(makePieLegendRow(targetId, shown[i], totalAll, hideLegendValue));
    }
    if (hidden.length) {
      var more = document.createElement('div');
      more.className = 'chart-pie-legend-more';
      more.textContent = '+' + hidden.length + ' altri';
      more.setAttribute('tabindex', '0');
      more.setAttribute('title', 'Passa il mouse per vedere gli altri elementi');
      attachLegendMoreTooltip(more, hidden, targetId, totalAll, hideLegendValue);
      legend.appendChild(more);
    }
  }
  function fit() {
    if (!total) { legend.innerHTML = ''; return; }
    layout.classList.add('donut-legend-fixed');
    layout.classList.remove('donut-legend-sparse');
    resetLegendScale();
    fill();
    // Dopo il layout CSS (nel frame successivo) leggiamo la dimensione finale
    // della ciambella per adattare la scritta centrale.
    requestAnimationFrame(applyCenterScale);
  }
  fit();
  if (typeof ResizeObserver !== 'undefined') {
    if (target._donutRO) target._donutRO.disconnect();
    var raf = 0;
    target._donutRO = new ResizeObserver(function() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    target._donutRO.observe(target);
    if (visualBox) {
      if (target._donutVisualRO) target._donutVisualRO.disconnect();
      var raf2 = 0;
      target._donutVisualRO = new ResizeObserver(function() {
        if (raf2) cancelAnimationFrame(raf2);
        raf2 = requestAnimationFrame(applyCenterScale);
      });
      target._donutVisualRO.observe(visualBox);
    }
  }
}

function setupVerticalChartFit(target, inner) {
  if (!target || !inner) return;
  function fit() {
    var availableHeight = target.clientHeight || 0;
    if (availableHeight <= 0) return;
    inner.style.removeProperty('transform');
    inner.style.removeProperty('width');
    inner.style.removeProperty('height');
    inner.style.removeProperty('transform-origin');
    var requiredHeight = inner.scrollHeight || inner.offsetHeight || 0;
    if (!requiredHeight || requiredHeight <= availableHeight) return;
    var scale = Math.max(0.72, Math.min(1, availableHeight / requiredHeight));
    inner.style.transformOrigin = 'top left';
    inner.style.transform = 'scale(' + scale.toFixed(4) + ')';
    inner.style.width = (100 / scale).toFixed(4) + '%';
    inner.style.height = Math.round(requiredHeight * scale) + 'px';
  }
  fit();
  if (typeof ResizeObserver !== 'undefined') {
    if (target._verticalChartRO) target._verticalChartRO.disconnect();
    var raf = 0;
    target._verticalChartRO = new ResizeObserver(function() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    target._verticalChartRO.observe(target);
  }
}

// Tooltip riutilizzabile per gli spicchi di torta/ciambella.
function getPieTooltipEl() {
  let el = document.getElementById('chartPieTooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chartPieTooltip';
    el.className = 'chart-pie-tooltip';
    document.body.appendChild(el);
  }
  return el;
}

function attachPieTooltip(visual, sliceRanges, valueIsPercentOnly) {
  const tip = getPieTooltipEl();
  function pctForEvent(e) {
    const rect = visual.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Fuori dal cerchio (o dentro il "buco" della ciambella) → nessuno spicchio.
    const r = Math.sqrt(dx * dx + dy * dy);
    const outer = rect.width / 2;
    if (r > outer) return null;
    if (visual.classList.contains('donut') && r < outer * 0.30) return null;
    let deg = Math.atan2(dx, -dy) * 180 / Math.PI; // 0 = alto, orario
    if (deg < 0) deg += 360;
    return (deg / 360) * 100;
  }
  function onMove(e) {
    const pct = pctForEvent(e);
    if (pct == null) { tip.classList.remove('visible'); return; }
    const slice = sliceRanges.find((s) => pct >= s.start && pct < s.end) || sliceRanges[sliceRanges.length - 1];
    if (!slice) { tip.classList.remove('visible'); return; }
    const valTxt = valueIsPercentOnly ? (slice.pct + '%') : (slice.value + ' (' + slice.pct + '%)');
    tip.innerHTML = '<span class="chart-pie-tooltip-swatch" style="background:' + slice.color + '"></span>' +
      '<span class="chart-pie-tooltip-label">' + escapeHtml(slice.label) + '</span>' +
      '<strong class="chart-pie-tooltip-value">' + escapeHtml(valTxt) + '</strong>';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
    tip.classList.add('visible');
  }
  visual.addEventListener('mousemove', onMove);
  visual.addEventListener('mouseleave', function() { tip.classList.remove('visible'); });
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
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" text-anchor="middle" class="chart-line-label chart-clickable" data-chart-label="${escapeHtml(point.item.label)}">${escapeHtml(chartItemLabel(point.item))}</text>`).join('')}
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
      var valLen = String(val).length;
      var badgeW = Math.max(34, 22 + (valLen * 12));
      var badgeH = 24;
      var badgeY = p.y - 44;
      var badgeRadius = badgeH / 2;
      var badgeFontSize = valLen >= 5 ? 13 : (valLen >= 4 ? 14 : 15);
      var badge = '<rect x="' + (p.x - badgeW / 2).toFixed(1) + '" y="' + badgeY.toFixed(1) + '" width="' + badgeW + '" height="' + badgeH + '" rx="' + badgeRadius + '" fill="' + badgeColor + '" opacity="0.93"/>';
      var valText = '<text x="' + p.x.toFixed(1) + '" y="' + (badgeY + (badgeH / 2) + 0.5).toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" class="personal-chart-value" style="font-size:' + badgeFontSize + 'px">' + val + '</text>';
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

  // Aree cliccabili trasparenti sui punti: in vista anno aprono il dettaglio del
  // mese; in vista mese aprono Cerca ticket sul giorno cliccato.
  var colW = n > 1 ? (usableW / (n - 1)) : usableW;
  var hitRects = points.map(function(p, i) {
    var dayAttr = drillMonth ? (' data-day="' + escapeHtml(String(p.m.label || '')) + '"') : '';
    return '<rect class="personal-point-hit" data-idx="' + i + '"' + dayAttr + ' x="' + (p.x - colW / 2).toFixed(1) + '" y="' + padT + '" width="' + colW.toFixed(1) + '" height="' + usableH + '" fill="transparent" style="cursor:pointer"><title>Mostra ticket</title></rect>';
  }).join('');

  var targetLines = '';
  if (targetMonthlyY !== null) {
    targetLines += '<line x1="' + padL + '" y1="' + targetMonthlyY.toFixed(1) + '" x2="' + (width - padR) + '" y2="' + targetMonthlyY.toFixed(1) + '" class="personal-chart-target personal-chart-target-monthly"/>' +
      '<text x="' + (padL + 6) + '" y="' + (targetMonthlyY - 6).toFixed(1) + '" text-anchor="start" class="personal-chart-target-label personal-chart-target-label-monthly">Target Mensile ' + targetMonthly + '</text>';
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  // Riempi tutta l'altezza del pannello (evita le bande bianche sopra/sotto
  // dovute al preserveAspectRatio di default "meet").
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

  // Click su un punto dei grafici "Ticket personali"/"Ticket gruppo":
  // in vista annuale entra nel dettaglio del mese; in vista mensile apre
  // Cerca ticket sul giorno cliccato nello scope corretto.
  var pointHits = svg.querySelectorAll('.personal-point-hit');
  for (var phi = 0; phi < pointHits.length; phi++) {
    (function (el) {
      el.addEventListener('click', function () {
        if (drillMonth) {
          personalChartOpenDaySearch(target.id, drillMonth, el.getAttribute('data-day'));
          return;
        }
        personalChartDrillToMonth(target.id, parseInt(el.getAttribute('data-idx'), 10) + 1);
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

function personalChartOpenDaySearch(targetId, month, day) {
  var year = (new Date()).getUTCFullYear();
  var monthNum = parseInt(month, 10);
  var dayNum = parseInt(day, 10);
  if (!(monthNum >= 1 && monthNum <= 12) || !(dayNum >= 1 && dayNum <= 31)) return;
  var startUtc = new Date(Date.UTC(year, monthNum - 1, dayNum, 0, 0, 0, 0));
  var endUtc = new Date(Date.UTC(year, monthNum - 1, dayNum + 1, 0, 0, 0, 0));
  var params = new URLSearchParams();
  params.set('start', startUtc.toISOString());
  params.set('end', endUtc.toISOString());
  params.set('scope', personalChartIsGroup(targetId) ? 'group' : 'mine');
  goToSearchWithParams(params);
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

// Listener delegato sui grafici categoriali (bar/colonne/torta/linea).
(function setupChartDrill() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.addEventListener('click', function (e) {
    const el = e.target.closest ? e.target.closest('[data-chart-label]') : null;
    if (el) handleChartElementClick(el);
  });
})();

// Testo visibile di un elemento del grafico: usa 'display' se il backend lo
// fornisce (es. team: "Team A"), altrimenti il 'label' grezzo. Il 'label' resta
// il valore usato per il filtro al click (data-chart-label) e per i colori.
function chartItemLabel(item) {
  if (item && item.display != null && String(item.display) !== '') return String(item.display);
  return item ? String(item.label) : '';
}

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
  // Se anche cosi restano meno di 4 elementi (es. dimensioni con pochi valori
  // possibili, come gli utenti), completa con segnaposto vuoti a 0 in modo da
  // mostrare sempre almeno 4 elementi.
  while (shown.length < 4) {
    shown.push({ label: '—', total: 0, __placeholder: true });
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
    const panel = select.closest('.panel');
    const current = getChartType(targetId);
    if (select.value !== current) select.value = current;
    if (select.dataset.chartBound === '1') return;
    select.dataset.chartBound = '1';
    select.addEventListener('change', () => {
      const key = normalizeChartKey(targetId);
      const nextType = normalizeChartType(select.value);
      chartTypes[key] = nextType;
      if (panel && nextType === 'bar') enforceMinChartSpanForPanel(panel.id);
      saveChartTypes(true);
      saveChartSpans(true);
      if (panel) {
        applyChartSpan(panel, getChartSpan(panel.id));
        refreshChartResizeControls(panel);
      }
      saveUserCharts().catch(console.error);
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
    wrap.innerHTML = `<button class="category-toggle" type="button" aria-expanded="false"><span class="category-toggle-label">${renderCategoryLogoMarkup(cat.logo, cat.name)}<span class="category-toggle-text">${escapeHtml(cat.name)}</span></span></button>`;
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
      const shouldOpen = !wrap.classList.contains('open');
      Array.from(menu.querySelectorAll('.menu-category.open')).forEach((other) => {
        if (other === wrap) return;
        other.classList.remove('open');
        const btn = other.querySelector('.category-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      wrap.classList.toggle('open', shouldOpen);
      wrap.querySelector('.category-toggle').setAttribute('aria-expanded', String(shouldOpen));
      scheduleQuickbarAutoFitHeight();
      scheduleQuickbarAutoFitHeight(320);
    });
    menu.appendChild(wrap);
  });
  scheduleQuickbarAutoFitHeight();
}

function getAvatarBadge(username) {
  try {
    const all = JSON.parse(localStorage.getItem('prodops_avatars_v1') || '{}');
    const emoji = username && all[username] ? all[username] : null;
    if (!emoji) return '';
    return '<span class="ticket-owner-avatar" aria-hidden="true">' + emoji + '</span>';
  } catch { return ''; }
}

function resolveTicketDisplayIncidentName(ticket) {
  const item = ticket || {};
  const incidentId = Number(item.incident_id || item.incidentId || 0);
  const storedName = String(item.incident_name || item.incidentName || '').trim();
  if (storedName) return storedName;
  return String(incidentIdToNameMap[String(incidentId)] || '');
}

function createTicketRowElement(t, isAnimated) {
  const pad = (v) => String(v).padStart(2, '0');
  const incidentId = Number(t.incident_id || 0);
  const incidentName = resolveTicketDisplayIncidentName(t);
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
      '<div class="ticket-row-desc">' + renderDescriptionHtml(description) + '</div>' +
    '</div>' +
    '<div class="ticket-row-footer">' +
      (ownerUsername ? '<span class="ticket-row-owner">' + getAvatarBadge(ownerUsername) + '<strong>' + escapeHtml(ownerUsername) + '</strong></span>' : '') +
      '<span class="ticket-row-datetime"><strong>' + dayMonth + ' ' + hhmm + '</strong></span>' +
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
  if (_compactMode && _compactFlatRows.length) _compactRestoreFlat();
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
  if (_compactMode) _compactBuild();
  else requestAnimationFrame(() => decorateClampedDescriptions(ticketList));
}

function updateSortDirBtn() {
  if (!currentShiftSortDirBtn) return;
  currentShiftSortDirBtn.textContent = currentShiftSortDir === 'asc' ? '↑' : '↓';
}

function sortTicketList() {
  if (_compactMode && _compactFlatRows.length) _compactRestoreFlat();
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
  if (_compactMode) _compactBuild();
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

function startCurrentShiftAutoRefresh() {
  if (pageAutoRefreshTimer) return;
  pageAutoRefreshTimer = window.setInterval(function() {
    refreshCurrentShiftTickets().catch(function() {});
  }, PAGE_AUTO_REFRESH_MS);
}

function renderSearchTickets(tickets) {
  if (!tickets.length) return '<p class="muted">Nessun ticket trovato con questi filtri.</p>';

  const grouped = new Map();
  tickets.forEach((ticket) => {
    const incidentId = Number(ticket.incident_id || 0);
    const incidentName = resolveTicketDisplayIncidentName(ticket);
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
      return `<li data-ticket-id="${item.id}"><span class="incident-entry-text"><span class="incident-title">${escapeHtml(item.incident_name)}</span> - ${renderDescriptionHtml(item.description)}</span>${editBtn}</li>`;
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
  descSetReadOnly(false);
  descShow(true);
  const editPresets = incidentIdToPresetMap[String(incidentId)] || [];
  if (presetInlineComposer) {
    presetInlineComposer.style.display = 'none';
    presetInlineComposer.innerHTML = '';
  }
  if (editPresets.length && presetInlineComposer) {
    renderPresetForTargets(editPresets[0] || '', document.getElementById('description'), presetInlineComposer, incidentId, btn.dataset.description || '');
  } else {
    descSetPlain(btn.dataset.description || '');
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
      block._previousShiftTickets = Array.isArray(shift.tickets) ? shift.tickets.slice() : [];
      block._previousShiftState = {
        groupBy: 'category',
        showSingles: false
      };
      const headingWrap = document.createElement('div');
      headingWrap.className = 'previous-shift-heading';
      const heading = document.createElement('h4');
      heading.textContent = shift.label;
      headingWrap.appendChild(heading);
      headingWrap.appendChild(buildPreviousShiftControls(block));
      block.appendChild(headingWrap);
      const list = document.createElement('ul');
      list.className = 'ticket-list previous-shift-ticket-list';
      block._previousShiftList = list;
      block.appendChild(list);
      renderPreviousShiftBlock(block);
      previousShiftsContent.appendChild(block);
    });
    fetchJson('/api/pinned-tickets').then(function(pins) {
      previousShiftPinnedTickets = Array.isArray(pins) ? pins : [];
      decoratePinnedTickets(pins, previousShiftsContent);
    }).catch(function() {});
    previousShiftsLoaded = true;
  } finally {
    previousShiftsLoading = false;
  }
}

function buildPreviousShiftControls(block) {
  var state = block._previousShiftState || { groupBy: 'category', showSingles: false };
  var controls = document.createElement('div');
  controls.className = 'previous-shift-controls';

  var selectWrap = document.createElement('label');
  selectWrap.className = 'previous-shift-control previous-shift-control-select';
  selectWrap.innerHTML = '<span>Raggruppa</span>';
  var select = document.createElement('select');
  select.className = 'previous-shift-group-select';
  [
    { value: 'fab', label: 'FAB' },
    { value: 'category', label: 'Categoria' },
    { value: 'incident', label: 'Incident' }
  ].forEach(function(optionData) {
    var option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    if (state.groupBy === optionData.value) option.selected = true;
    select.appendChild(option);
  });
  selectWrap.appendChild(select);
  controls.appendChild(selectWrap);

  var checkboxWrap = document.createElement('label');
  checkboxWrap.className = 'previous-shift-control previous-shift-control-check';
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!state.showSingles;
  var copy = document.createElement('span');
  copy.textContent = 'Mostra tutti singoli';
  checkboxWrap.appendChild(checkbox);
  checkboxWrap.appendChild(copy);
  controls.appendChild(checkboxWrap);

  function syncControlsState() {
    select.disabled = !!block._previousShiftState.showSingles;
    controls.classList.toggle('show-singles-active', !!block._previousShiftState.showSingles);
  }

  select.addEventListener('change', function() {
    block._previousShiftState.groupBy = String(this.value || 'category');
    renderPreviousShiftBlock(block);
  });
  checkbox.addEventListener('change', function() {
    block._previousShiftState.showSingles = !!this.checked;
    syncControlsState();
    renderPreviousShiftBlock(block);
  });
  syncControlsState();
  return controls;
}

function _compactKeyForMode(mode, row) {
  if (mode === 'incident') return String(row.dataset.incident || '').trim();
  if (mode === 'fab') return String(row.dataset.fab || '').trim();
  return String(row.dataset.category || '').trim();
}

function _compactLabelForModeValue(mode) {
  if (mode === 'incident') return 'incident';
  if (mode === 'fab') return 'FAB';
  return 'categoria';
}

function renderPreviousShiftBlock(block) {
  if (!block || !block._previousShiftList) return;
  var list = block._previousShiftList;
  var tickets = Array.isArray(block._previousShiftTickets) ? block._previousShiftTickets : [];
  var state = block._previousShiftState || { groupBy: 'category', showSingles: false };
  list.innerHTML = '';
  list.className = 'ticket-list previous-shift-ticket-list';

  if (!tickets.length) {
    var empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'Nessun ticket registrato.';
    list.appendChild(empty);
    return;
  }

  if (state.showSingles) {
    tickets.forEach(function(ticket) {
      list.appendChild(createTicketRowElement(ticket, false));
    });
  } else {
    var previousRows = groupIdenticalTickets(tickets).map(function(group) {
      return buildTicketNode(group, null);
    });
    buildCompactStacksForList(list, previousRows, state.groupBy);
  }

  decoratePinnedTickets(previousShiftPinnedTickets, list);
  requestAnimationFrame(function() { decorateClampedDescriptions(list); });
}

function buildCompactStacksForList(listEl, entries, mode) {
  if (!listEl) return;
  var flatRows = Array.isArray(entries) ? entries.slice() : [];
  var expanded = [];
  flatRows.forEach(function(entry) {
    if (!entry) return;
    if (entry.classList && entry.classList.contains('ticket-dup-stack') && Array.isArray(entry._tsCards) && entry._tsCards.length) {
      entry._tsCards.forEach(function(card) { expanded.push(card); });
      return;
    }
    expanded.push(entry);
  });

  var groups = {};
  var order = [];
  expanded.forEach(function(row) {
    var groupKey = _compactKeyForMode(mode, row);
    groupKey = groupKey || '—';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
      order.push(groupKey);
    }
    groups[groupKey].push(row);
  });

  listEl.innerHTML = '';
  listEl.classList.add('compact-visual', 'previous-shifts-compact-list');

  if (!order.length) {
    var empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'Nessun ticket corrisponde al filtro.';
    listEl.appendChild(empty);
    return;
  }

  order.forEach(function(groupKey) {
    var cards = groups[groupKey];
    var stack = document.createElement('li');
    stack.className = 'ticket-stack previous-ticket-stack' + (cards.length === 1 ? ' single' : '');
    stack.dataset.stackKey = groupKey;
    stack.dataset.category = mode === 'category' ? groupKey : String(cards[0].dataset.category || '');
    stack.dataset.fab = mode === 'fab' ? groupKey : String(cards[0].dataset.fab || '');
    stack.dataset.incident = mode === 'incident' ? groupKey : String(cards[0].dataset.incident || '');
    stack._tsCards = cards;
    stack.title = 'Compattato per ' + _compactLabelForModeValue(mode) + ': ' + groupKey;

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

    listEl.appendChild(stack);
  });
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
    const [fabYear, catYear, teamYear, incidentYear, userYear] = await Promise.all([
      fetchJson(buildYearStatsUrl('/api/stats/fab', fabYearMode, chartCustomRanges.fabYear)),
      fetchJson(buildYearStatsUrl('/api/stats/category', catYearMode, chartCustomRanges.catYear)),
      fetchJson(buildYearStatsUrl('/api/stats/team', teamYearMode, chartCustomRanges.teamYear)),
      fetchJson(buildYearStatsUrl('/api/stats/incident', incidentYearMode, chartCustomRanges.incidentYear)),
      fetchJson(buildYearStatsUrl('/api/stats/user', userYearMode, chartCustomRanges.userYear))
    ]);
    renderChart(fabYearChart, fabYear.stats);
    renderChart(catYearChart, catYear.stats);
    renderChart(teamYearChart, teamYear.stats);
    renderChart(incidentYearChart, incidentYear.stats);
    if (userYearChart) renderChart(userYearChart, userYear.stats);
    // Config per il filtro-ticket al click su un elemento del grafico.
    if (fabYearChart) fabYearChart._chartFilter = { dimension: 'fab', scope: 'all', getWindow: function () { return fabYearMode; }, start: (chartCustomRanges.fabYear || {}).start || '', end: (chartCustomRanges.fabYear || {}).end || '' };
    if (catYearChart) catYearChart._chartFilter = { dimension: 'category', scope: 'all', getWindow: function () { return catYearMode; }, start: (chartCustomRanges.catYear || {}).start || '', end: (chartCustomRanges.catYear || {}).end || '' };
    if (teamYearChart) teamYearChart._chartFilter = { dimension: 'team', scope: 'all', getWindow: function () { return teamYearMode; }, start: (chartCustomRanges.teamYear || {}).start || '', end: (chartCustomRanges.teamYear || {}).end || '' };
    if (incidentYearChart) incidentYearChart._chartFilter = { dimension: 'incident', scope: 'all', getWindow: function () { return incidentYearMode; }, start: (chartCustomRanges.incidentYear || {}).start || '', end: (chartCustomRanges.incidentYear || {}).end || '' };
    if (userYearChart) userYearChart._chartFilter = { dimension: 'user', scope: 'all', getWindow: function () { return userYearMode; }, start: (chartCustomRanges.userYear || {}).start || '', end: (chartCustomRanges.userYear || {}).end || '' };
    // Grafici personali/gruppo: caricati dai loader che rispettano lo stato
    // di drill-down mensile (annuale di default, o giorno per giorno).
    if (personalMineChart) await loadPersonalChartData(personalMineChart);
    if (personalGroupChart) await loadPersonalChartData(personalGroupChart);
  } catch (error) {
    console.error(error);
    [fabYearChart, catYearChart, teamYearChart, incidentYearChart, userYearChart, personalMineChart, personalGroupChart].forEach((target) => {
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
  chartPanelIncident:      'incidentYearChartTitle',
  chartPanelUser:          'userYearChartTitle'
};

function applyPanelTitles() {
  Object.keys(PANEL_TITLE_ELEMENTS).forEach(function(panelId) {
    if (!panelTitles[panelId]) return;
    var el = document.getElementById(PANEL_TITLE_ELEMENTS[panelId]);
    if (el) el.textContent = panelTitles[panelId];
  });
}

function refreshChartEditAffordances() {
  var grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .panel[id]').forEach(function(panel, index) {
    if (panel.id === 'addChartCard') return;
    panel.setAttribute('draggable', chartsEditMode ? 'true' : 'false');
    panel.querySelectorAll('.panel-heading-row, .chart, .personal-chart, .chart-controls-row, .toggle-row').forEach(function(surface) {
      surface.setAttribute('draggable', chartsEditMode ? 'true' : 'false');
    });
    panel.classList.toggle('chart-editable-card', chartsEditMode);
    panel.style.setProperty('--chart-wiggle-delay', String((index % 6) * 0.12) + 's');
    var h3 = panel.querySelector('.panel-heading-row h3');
    if (h3) h3.classList.toggle('chart-title-editable', chartsEditMode);
  });
}

function toggleChartsEditMode() {
  chartsEditMode = !chartsEditMode;
  var grid = document.getElementById('chartsGrid');
  var btn = document.getElementById('editChartModeBtn');
  if (grid) grid.classList.toggle('charts-edit-mode', chartsEditMode);
  refreshChartEditAffordances();
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
  { id: 'chartPanelIncident',      label: 'Ticket per Incident' },
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
  { value: 't1',     label: 'T1' },
  { value: 't2',     label: 'T2' },
  { value: 't3',     label: 'T3' },
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
function filterableCustomDimension(value) { return value === 'fab' || value === 'team' || value === 'category' || value === 'severity'; }

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
    chartSpans = (data.chart_spans && typeof data.chart_spans === 'object') ? normalizeSpanMap(data.chart_spans) : chartSpans;
    chartTypes = (data.chart_types && typeof data.chart_types === 'object') ? normalizeTypeMap(data.chart_types) : chartTypes;
    enforceMinChartSpans();
    currentPaletteId = typeof data.palette === 'string' && data.palette ? data.palette : currentPaletteId;
    currentDarkMode = !!data.dark_mode;
    try {
      localStorage.setItem('palette', currentPaletteId || 'blu');
      localStorage.setItem('dark-mode', currentDarkMode ? '1' : '');
    } catch (error) {}
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
      const allowed = ['day', 'months', 'q1', 'q2', 'q3', 'q4', 't1', 't2', 't3', 'custom'];
      if (allowed.includes(modes.fabYear) && (modes.fabYear !== 'custom' || chartCustomRanges.fabYear)) fabYearMode = modes.fabYear;
      if (allowed.includes(modes.catYear) && (modes.catYear !== 'custom' || chartCustomRanges.catYear)) catYearMode = modes.catYear;
      if (allowed.includes(modes.teamYear) && (modes.teamYear !== 'custom' || chartCustomRanges.teamYear)) teamYearMode = modes.teamYear;
      if (allowed.includes(modes.incidentYear) && (modes.incidentYear !== 'custom' || chartCustomRanges.incidentYear)) incidentYearMode = modes.incidentYear;
      if (allowed.includes(modes.userYear) && (modes.userYear !== 'custom' || chartCustomRanges.userYear)) userYearMode = modes.userYear;
      document.querySelectorAll('.chart-range-select').forEach((select) => {
        const t = select.dataset.target;
        const modeByKey = { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, incidentYear: incidentYearMode, userYear: userYearMode };
        if (t && modeByKey[t] && modeByKey[t] !== 'custom') select.value = modeByKey[t];
      });
      document.querySelectorAll('.range-calendar-btn').forEach((btn) => {
        const t = btn.dataset.target;
        const modeByKey = { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, incidentYear: incidentYearMode, userYear: userYearMode };
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
  const requestSeq = ++saveUserChartsRequestSeq;
  try {
    const data = await fetchJson('/api/user-charts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charts: customCharts, hidden_panels: hiddenDefaultPanels, panel_order: panelOrder, panel_titles: panelTitles, chart_modes: { fabYear: fabYearMode, catYear: catYearMode, teamYear: teamYearMode, incidentYear: incidentYearMode, userYear: userYearMode }, chart_custom_ranges: chartCustomRanges, chart_spans: chartSpans, chart_types: chartTypes, palette: currentPaletteId, dark_mode: currentDarkMode })
    });
    if (requestSeq < saveUserChartsAppliedSeq) return;
    saveUserChartsAppliedSeq = requestSeq;
    if (Array.isArray(data.charts)) customCharts = data.charts;
    if (Array.isArray(data.hidden_panels)) hiddenDefaultPanels = data.hidden_panels;
    if (Array.isArray(data.panel_order)) panelOrder = data.panel_order;
    if (data.panel_titles && typeof data.panel_titles === 'object') panelTitles = data.panel_titles;
    if (data.chart_spans && typeof data.chart_spans === 'object') chartSpans = normalizeSpanMap(data.chart_spans);
    if (data.chart_types && typeof data.chart_types === 'object') chartTypes = normalizeTypeMap(data.chart_types);
    if (typeof data.palette === 'string' && data.palette) currentPaletteId = data.palette;
    currentDarkMode = !!data.dark_mode;
    applyAllChartSpans();
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
  grid.querySelectorAll(':scope > .panel[id]').forEach(function(panel) {
    attachChartDragHandle(panel);
  });
  refreshChartEditAffordances();
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

  const progress = document.createElement('div');
  progress.className = 'add-chart-wizard-progress';

  const modalBody = document.createElement('div');
  modalBody.className = 'add-chart-modal-body';

  const stepHost = document.createElement('div');
  stepHost.className = 'add-chart-wizard-host';

  // --- Dropdown grafici default ---
  const defSection = document.createElement('div');
  defSection.className = 'add-chart-section';

  const defTitle = document.createElement('div');
  defTitle.className = 'add-chart-section-title';
  defTitle.textContent = 'Seleziona un grafico default';
  defSection.appendChild(defTitle);

  const defWrap = document.createElement('div');
  defWrap.className = 'add-chart-default-dropdown-wrap';

  const defSelect = document.createElement('select');
  defSelect.className = 'add-chart-select';

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
  defAddBtn.textContent = 'Aggiungi grafico';
  defAddBtn.addEventListener('click', async () => {
    const panelId = defSelect.value;
    if (!panelId) { showToast('Seleziona prima un grafico dalla lista a tendina per poterlo aggiungere.', 'warning', 'Nessun grafico selezionato'); return; }
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

  // 2) Dati — flusso guidato: categorie → (intero | incident) → filtri opzionali
  const dataField = document.createElement('div');
  dataField.className = 'add-chart-field';
  const dataFieldLabel = document.createElement('label');
  dataFieldLabel.className = 'add-chart-label';
  dataFieldLabel.textContent = 'Cosa vuoi inserire nel grafico?';
  dataField.appendChild(dataFieldLabel);

  const dataGuide = document.createElement('div');
  dataGuide.className = 'add-chart-guide';
  dataGuide.innerHTML = '<p class="muted" style="font-size:.82rem;padding:6px 0">Caricamento opzioni…</p>';
  dataField.appendChild(dataGuide);

  // Stato dello step 2 (flusso guidato)
  const step2 = {
    categories: new Set(),   // nomi categorie scelte
    mode: 'full',            // 'full' = categorie per intero | 'incident' = solo alcuni incident
    incidents: new Set(),    // nomi incident scelti (mode === 'incident')
    filterFab: '',           // singolo FAB (opzionale)
    filterTeam: '',          // singolo team (opzionale)
    filterSeverity: ''       // singola severity, come label (opzionale)
  };

  // Costruisce dimensions + filters (contratto /api/stats/custom) dallo stato guidato.
  function collectStep2() {
    const cats = Array.from(step2.categories);
    const dims = [];
    const filters = {};
    if (step2.mode === 'incident') {
      dims.push({ type: 'incident', items: step2.incidents.size ? Array.from(step2.incidents) : null });
      if (cats.length) { dims.push({ type: 'category', items: cats }); filters.category = true; }
    } else {
      dims.push({ type: 'category', items: cats.length ? cats : null });
    }
    [['fab', step2.filterFab], ['team', step2.filterTeam], ['severity', step2.filterSeverity]].forEach(function (pair) {
      if (pair[1]) { dims.push({ type: pair[0], items: [pair[1]] }); filters[pair[0]] = true; }
    });
    return { dimensions: dims, filters: filters };
  }

  (async function buildDataGuide() {
    const meta = await fetchMeta();
    dataGuide.innerHTML = '';

    function makeChip(display, val, active, onToggle) {
      const ic = document.createElement('button');
      ic.type = 'button';
      ic.className = 'add-chart-chip add-chart-dim-item' + (active ? ' active' : '');
      ic.textContent = display;
      ic.dataset.val = val;
      ic.addEventListener('click', function () {
        ic.classList.toggle('active');
        onToggle(ic.classList.contains('active'), ic);
      });
      return ic;
    }

    // ── Blocco A: categorie ──────────────────────────────────────────────
    const aBlock = document.createElement('div');
    aBlock.className = 'add-chart-guide-block';
    const aQ = document.createElement('div');
    aQ.className = 'add-chart-subq';
    aQ.textContent = 'Quali categorie vuoi inserire nel grafico?';
    aBlock.appendChild(aQ);
    const catBar = document.createElement('div');
    catBar.className = 'add-chart-dim-selectbar';
    const catAll = document.createElement('button');
    catAll.type = 'button'; catAll.className = 'add-chart-dim-sellink'; catAll.textContent = 'Tutte';
    const catNone = document.createElement('button');
    catNone.type = 'button'; catNone.className = 'add-chart-dim-sellink'; catNone.textContent = 'Nessuna';
    catBar.appendChild(catAll); catBar.appendChild(document.createTextNode(' · ')); catBar.appendChild(catNone);
    aBlock.appendChild(catBar);
    const catGrid = document.createElement('div');
    catGrid.className = 'add-chart-dim-item-grid';
    aBlock.appendChild(catGrid);
    dataGuide.appendChild(aBlock);

    // ── Blocco B: intero vs incident ─────────────────────────────────────
    const bBlock = document.createElement('div');
    bBlock.className = 'add-chart-guide-block';
    bBlock.hidden = true;
    const bQ = document.createElement('div');
    bQ.className = 'add-chart-subq';
    bQ.textContent = 'Come vuoi vedere queste categorie?';
    bBlock.appendChild(bQ);
    const modeWrap = document.createElement('div');
    modeWrap.className = 'add-chart-mode-choice';
    const modeFull = document.createElement('button');
    modeFull.type = 'button';
    modeFull.className = 'add-chart-mode-btn active';
    modeFull.innerHTML = '<strong>Categorie per intero</strong><span>Un dato per ogni categoria scelta.</span>';
    const modeInc = document.createElement('button');
    modeInc.type = 'button';
    modeInc.className = 'add-chart-mode-btn';
    modeInc.innerHTML = '<strong>Solo alcuni incident</strong><span>Scegli quali incident mostrare.</span>';
    modeWrap.appendChild(modeFull); modeWrap.appendChild(modeInc);
    bBlock.appendChild(modeWrap);
    dataGuide.appendChild(bBlock);

    // ── Blocco C: incident ───────────────────────────────────────────────
    const cBlock = document.createElement('div');
    cBlock.className = 'add-chart-guide-block';
    cBlock.hidden = true;
    const cQ = document.createElement('div');
    cQ.className = 'add-chart-subq';
    cQ.textContent = 'Quali incident vuoi mostrare?';
    cBlock.appendChild(cQ);
    const incBar = document.createElement('div');
    incBar.className = 'add-chart-dim-selectbar';
    const incAll = document.createElement('button');
    incAll.type = 'button'; incAll.className = 'add-chart-dim-sellink'; incAll.textContent = 'Tutti';
    const incNone = document.createElement('button');
    incNone.type = 'button'; incNone.className = 'add-chart-dim-sellink'; incNone.textContent = 'Nessuno';
    incBar.appendChild(incAll); incBar.appendChild(document.createTextNode(' · ')); incBar.appendChild(incNone);
    cBlock.appendChild(incBar);
    const incGrid = document.createElement('div');
    incGrid.className = 'add-chart-dim-item-grid';
    cBlock.appendChild(incGrid);
    const incEmpty = document.createElement('p');
    incEmpty.className = 'muted';
    incEmpty.style.cssText = 'font-size:.8rem;margin:4px 0 0';
    incEmpty.textContent = 'Nessun incident disponibile per le categorie scelte.';
    incEmpty.hidden = true;
    cBlock.appendChild(incEmpty);
    dataGuide.appendChild(cBlock);

    // ── Blocco D: filtri opzionali ───────────────────────────────────────
    const dBlock = document.createElement('div');
    dBlock.className = 'add-chart-guide-block';
    dBlock.hidden = true;
    const dQ = document.createElement('div');
    dQ.className = 'add-chart-subq';
    dQ.textContent = 'Vuoi filtrare per un singolo FAB, team o severity? (opzionale)';
    dBlock.appendChild(dQ);
    function makeFilterRow(labelText, options, onChange) {
      const row = document.createElement('div');
      row.className = 'add-chart-filter-row';
      const lab = document.createElement('span');
      lab.className = 'add-chart-filter-row-label';
      lab.textContent = labelText;
      const sel = document.createElement('select');
      sel.className = 'add-chart-select';
      const none = document.createElement('option');
      none.value = ''; none.textContent = '— Nessun filtro —';
      sel.appendChild(none);
      options.forEach(function (o) {
        const opt = document.createElement('option');
        opt.value = o.val; opt.textContent = o.display;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { onChange(sel.value); });
      row.appendChild(lab); row.appendChild(sel);
      return row;
    }
    const fabOpts = (meta.fabs || []).map(function (f) { return { val: f, display: f }; });
    const teamOpts = (meta.teams || []).map(function (t) { return { val: t, display: 'Team ' + t }; });
    const sevOpts = (meta.severities || []).map(function (s) { return { val: s.label, display: s.label }; });
    dBlock.appendChild(makeFilterRow('FAB', fabOpts, function (v) { step2.filterFab = v; }));
    dBlock.appendChild(makeFilterRow('Team', teamOpts, function (v) { step2.filterTeam = v; }));
    dBlock.appendChild(makeFilterRow('Severity', sevOpts, function (v) { step2.filterSeverity = v; }));
    dataGuide.appendChild(dBlock);

    // ── Logica ───────────────────────────────────────────────────────────
    function syncBlocks() {
      const hasCat = step2.categories.size > 0;
      bBlock.hidden = !hasCat;
      dBlock.hidden = !hasCat;
      cBlock.hidden = !(hasCat && step2.mode === 'incident');
      modeFull.classList.toggle('active', step2.mode === 'full');
      modeInc.classList.toggle('active', step2.mode === 'incident');
    }

    function rebuildIncidents() {
      incGrid.innerHTML = '';
      // Nome incident → categorie (tra quelle scelte) in cui compare
      const byName = new Map();
      (meta.incidents || []).forEach(function (i) {
        if (!step2.categories.has(i.category_name)) return;
        if (!byName.has(i.name)) byName.set(i.name, new Set());
        byName.get(i.name).add(i.category_name);
      });
      // Rimuove selezioni non più valide
      Array.from(step2.incidents).forEach(function (n) { if (!byName.has(n)) step2.incidents.delete(n); });
      incEmpty.hidden = byName.size > 0;
      byName.forEach(function (catsSet, name) {
        // Disambigua se lo stesso nome compare in più categorie scelte
        const display = catsSet.size > 1 ? name + ' (' + Array.from(catsSet).join(', ') + ')' : name;
        const chip = makeChip(display, name, step2.incidents.has(name), function (active) {
          if (active) step2.incidents.add(name); else step2.incidents.delete(name);
        });
        incGrid.appendChild(chip);
      });
    }

    // Categorie
    (meta.categories || []).forEach(function (c) {
      const chip = makeChip(c.name, c.name, false, function (active) {
        if (active) step2.categories.add(c.name); else step2.categories.delete(c.name);
        if (step2.mode === 'incident') rebuildIncidents();
        syncBlocks();
      });
      catGrid.appendChild(chip);
    });
    catAll.addEventListener('click', function () {
      step2.categories = new Set((meta.categories || []).map(function (c) { return c.name; }));
      catGrid.querySelectorAll('.add-chart-dim-item').forEach(function (c) { c.classList.add('active'); });
      if (step2.mode === 'incident') rebuildIncidents();
      syncBlocks();
    });
    catNone.addEventListener('click', function () {
      step2.categories.clear();
      catGrid.querySelectorAll('.add-chart-dim-item').forEach(function (c) { c.classList.remove('active'); });
      if (step2.mode === 'incident') rebuildIncidents();
      syncBlocks();
    });

    // Modalità intero/incident
    modeFull.addEventListener('click', function () { step2.mode = 'full'; syncBlocks(); });
    modeInc.addEventListener('click', function () { step2.mode = 'incident'; rebuildIncidents(); syncBlocks(); });

    // Incident: seleziona tutti / nessuno
    incAll.addEventListener('click', function () {
      incGrid.querySelectorAll('.add-chart-dim-item').forEach(function (c) { c.classList.add('active'); step2.incidents.add(c.dataset.val); });
    });
    incNone.addEventListener('click', function () {
      incGrid.querySelectorAll('.add-chart-dim-item').forEach(function (c) { c.classList.remove('active'); });
      step2.incidents.clear();
    });

    syncBlocks();
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
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'secondary';
  backBtn.textContent = '← Indietro';
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'primary';

  const choiceStep = document.createElement('div');
  choiceStep.className = 'add-chart-wizard-choice';
  const choiceCreate = document.createElement('button');
  choiceCreate.type = 'button';
  choiceCreate.className = 'add-chart-choice-card';
  choiceCreate.innerHTML = '<strong>Crea un grafico personalizzato</strong><span>Configura dati, periodo, ambito e tipo di visualizzazione passo dopo passo.</span>';
  const choiceRestore = document.createElement('button');
  choiceRestore.type = 'button';
  choiceRestore.className = 'add-chart-choice-card';
  choiceRestore.innerHTML = '<strong>Ripristina i grafici</strong><span>Riporta in dashboard un grafico nascosto oppure resetta l\'intero layout iniziale.</span>';
  choiceStep.appendChild(choiceCreate);
  choiceStep.appendChild(choiceRestore);

  const reviewField = document.createElement('div');
  reviewField.className = 'add-chart-review';

  function renderReview() {
    const windowsList = [...Array.from(selectedWindowValues), ...customRanges];
    const built = collectStep2();
    const filterModes = effectiveCustomFilterModes(built.dimensions, built.filters);
    const plotDims = built.dimensions.filter(function (d) { return !filterModes[d.type]; });
    const filterDims = built.dimensions.filter(function (d) { return filterModes[d.type] && d.items && d.items.length; });
    const dataVal = plotDims.map(function (d) {
      const base = customLabel(CUSTOM_DIMENSIONS, d.type);
      if (!d.items || !d.items.length) return base + ' (tutte)';
      return base + ': ' + d.items.slice(0, 3).join(', ') + (d.items.length > 3 ? '…' : '');
    }).join(' | ');
    const filtersVal = filterDims.map(function (d) {
      return customLabel(CUSTOM_DIMENSIONS, d.type).replace(/^Per /i, '') + ': ' + d.items.join(', ');
    }).join(' | ');
    const summary = [
      { label: 'Finestre', value: windowsList.length ? windowsList.map(windowLabel).join(', ') : 'Nessuna selezionata' },
      { label: 'Dati', value: dataVal || 'Nessun dato selezionato' },
      { label: 'Ambito', value: customLabel(CUSTOM_SCOPES, scopeSelect.value) },
      { label: 'Tipo', value: customLabel(CUSTOM_TYPES, typeSelect.value) },
      { label: 'Titolo', value: titleInput.value.trim() || 'Automatico' },
      { label: 'Filtri attivi', value: filtersVal || 'Nessuno' }
    ];
    reviewField.innerHTML = '';
    summary.forEach(function(item) {
      const row = document.createElement('div');
      row.className = 'add-chart-review-row';
      row.innerHTML = '<strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.value) + '</span>';
      reviewField.appendChild(row);
    });
  }

  async function finalizeCreate() {
    const windowsList = [...Array.from(selectedWindowValues), ...customRanges];
    if (!windowsList.length) { showToast('Scegli almeno una finestra temporale (es. settimana, mese) prima di creare il grafico.', 'warning', 'Selezione incompleta'); return; }
    if (step2.categories.size === 0) { showToast('Scegli almeno una categoria da inserire nel grafico.', 'warning', 'Selezione incompleta'); return; }
    if (step2.mode === 'incident' && step2.incidents.size === 0) { showToast('Hai scelto "Solo alcuni incident": seleziona almeno un incident.', 'warning', 'Selezione incompleta'); return; }

    // Costruisce l'array dimensions + filtri dallo stato guidato
    const built = collectStep2();
    const dimensionsArr = built.dimensions;

    const scope = scopeSelect.value;
    const type = typeSelect.value;
    const baseTitle = titleInput.value.trim();
    nextBtn.disabled = true;

    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const filterModes = effectiveCustomFilterModes(dimensionsArr, built.filters);
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
  }

  const createSteps = [
    { title: 'Finestre temporali', desc: 'Scegli quali periodi rendere selezionabili nel grafico.', content: winField },
    { title: 'Dati da visualizzare', desc: 'Seleziona le dimensioni che vuoi mostrare e gli eventuali filtri.', content: dataField },
    { title: 'Aspetto del grafico', desc: 'Definisci ambito e tipo di visualizzazione del grafico.', content: (function() {
      const wrap = document.createElement('div');
      wrap.className = 'add-chart-step-stack';
      wrap.appendChild(scopeField);
      wrap.appendChild(typeField);
      return wrap;
    }()) },
    { title: 'Titolo e riepilogo', desc: 'Controlla il riepilogo finale e conferma la creazione.', content: (function() {
      const wrap = document.createElement('div');
      wrap.className = 'add-chart-step-stack';
      wrap.appendChild(titleField);
      wrap.appendChild(reviewField);
      return wrap;
    }()) }
  ];

  let selectedFlow = '';
  let currentCreateStep = 0;

  function setChoice(active) {
    selectedFlow = active;
    currentCreateStep = 0;
    choiceCreate.classList.toggle('active', active === 'create');
    choiceRestore.classList.toggle('active', active === 'restore');
    renderWizard();
  }

  choiceCreate.addEventListener('click', function() { setChoice('create'); });
  choiceRestore.addEventListener('click', function() { setChoice('restore'); });

  function validateCurrentStep() {
    if (selectedFlow !== 'create') return true;
    if (currentCreateStep === 0) {
      const windowsList = [...Array.from(selectedWindowValues), ...customRanges];
      if (!windowsList.length) {
        showToast('Scegli almeno una finestra temporale prima di andare avanti.', 'warning', 'Selezione incompleta');
        return false;
      }
    }
    if (currentCreateStep === 1) {
      if (step2.categories.size === 0) {
        showToast('Scegli almeno una categoria da inserire nel grafico prima di andare avanti.', 'warning', 'Selezione incompleta');
        return false;
      }
      if (step2.mode === 'incident' && step2.incidents.size === 0) {
        showToast('Hai scelto "Solo alcuni incident": seleziona almeno un incident prima di andare avanti.', 'warning', 'Selezione incompleta');
        return false;
      }
    }
    return true;
  }

  function renderProgress(total, index) {
    progress.innerHTML = '';
    if (!total) { progress.hidden = true; return; }
    progress.hidden = false;
    for (var i = 0; i < total; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'add-chart-progress-dot';
      if (i === index) dot.classList.add('active');
      if (i < index) dot.classList.add('done');
      dot.textContent = String(i + 1);
      progress.appendChild(dot);
    }
  }

  function renderWizard() {
    stepHost.innerHTML = '';
    backBtn.hidden = false;
    nextBtn.hidden = false;
    nextBtn.disabled = false;

    if (!selectedFlow) {
      title.textContent = 'Aggiungi grafico';
      renderProgress(0, 0);
      stepHost.appendChild(choiceStep);
      backBtn.hidden = true;
      nextBtn.textContent = 'Avanti →';
      nextBtn.disabled = true;
      return;
    }

    if (selectedFlow === 'restore') {
      title.textContent = 'Ripristina grafici';
      renderProgress(1, 0);
      stepHost.appendChild(defSection);
      backBtn.textContent = '← Indietro';
      nextBtn.hidden = true;
      return;
    }

    var step = createSteps[currentCreateStep];
    title.textContent = 'Crea grafico personalizzato';
    renderProgress(createSteps.length, currentCreateStep);
    if (currentCreateStep === createSteps.length - 1) renderReview();
    stepHost.appendChild(step.content);
    backBtn.textContent = currentCreateStep === 0 ? '← Scelta iniziale' : '← Indietro';
    nextBtn.textContent = currentCreateStep === createSteps.length - 1 ? 'Crea grafico' : 'Avanti →';
  }

  backBtn.addEventListener('click', function() {
    if (!selectedFlow) return;
    if (selectedFlow === 'restore') {
      selectedFlow = '';
      renderWizard();
      return;
    }
    if (currentCreateStep === 0) {
      selectedFlow = '';
      renderWizard();
      return;
    }
    currentCreateStep -= 1;
    renderWizard();
  });

  nextBtn.addEventListener('click', async function() {
    if (!selectedFlow) return;
    if (selectedFlow === 'create') {
      if (!validateCurrentStep()) return;
      if (currentCreateStep === createSteps.length - 1) {
        await finalizeCreate();
        return;
      }
      currentCreateStep += 1;
      renderWizard();
      return;
    }
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(backBtn);
  actions.appendChild(nextBtn);

  modalBody.appendChild(progress);
  modalBody.appendChild(stepHost);

  panel.appendChild(header);
  panel.appendChild(modalBody);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  renderWizard();
}

document.getElementById('addChartCard')?.addEventListener('click', openAddChartModal);

document.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeModal));
// La modale del ticket si chiude solo con la X / Annulla, non cliccando fuori.
// Tasto ESC: chiude la modale del ticket in creazione/modifica. Non agisce se
// e' aperto un overlay a priorita' maggiore (dialog conferma/prompt o un menu a
// tendina ricercabile): in quei casi l'ESC serve a chiudere quello, non tutto il
// ticket.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!modal || (!modal.classList.contains('show') && !modal.classList.contains('active'))) return;
  if (document.querySelector('.prodops-confirm-overlay')) return;
  if (modal.querySelector('.sd-panel:not([hidden])')) return;
  e.preventDefault();
  closeModal();
});
openAdminBtn?.addEventListener('click', () => { window.location.href = appUrl('/admin.html'); });
openQuickbarBtn?.addEventListener('click', () => { openOrFocusQuickbar(false); });
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
  if (target === 'incidentYear') incidentYearMode = mode;
  if (target === 'userYear') userYearMode = mode;
}

function clearChartRangeActiveState(target) {
  const calendarBtn = document.querySelector(`.range-calendar-btn[data-target="${target}"]`);
  if (calendarBtn) calendarBtn.classList.remove('active');
}

document.querySelectorAll('.chart-range-select').forEach((select) => {
  select.addEventListener('change', async () => {
    const target = select.dataset.target;
    const mode = select.value;
    clearChartRangeActiveState(target);
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

ticketForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!beginTicketSubmitLock()) return;
  const incident_id = Number(incidentTypeInput.value || 0);
  // L'editor mantiene già i valori dei token come chip → 〈valore〉 nello storage.
  const description = descGetStorage();
  const fab = fabValue.value;
  const severityCfg = incidentIdToSeverityMap[String(incident_id)] || { severity_default: 1, severity_mode: 'default' };
  const severityValue = String(ticketSeveritySelect.value || '').trim();
  if (severityCfg.severity_mode === 'user' && !severityValue) {
    showToast('Seleziona la severity prima di creare il ticket.', 'error', 'Severity obbligatoria');
    syncSubmitBtnState();
    return;
  }
  const severity = Number(severityValue || severityCfg.severity_default || 1);
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
      const _newPinCheck = document.getElementById('ticketPinCheck');
      const _newPinUntil = document.getElementById('ticketPinUntil');
      const payloads = [{
        incident_id,
        incident_name: customIncidentName,
        description,
        fab,
        ticket_time,
        severity,
        pin_enabled: !!(_newPinCheck && _newPinCheck.checked && _newPinUntil && _newPinUntil.value),
        pin_until: (_newPinUntil && _newPinUntil.value) ? String(_newPinUntil.value) : ''
      }];
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
      const pinPayloads = createdTickets.map(function(createdTicket, ticketIndex) {
        var sourcePayload = payloads[ticketIndex] || payloads[0] || {};
        if (!createdTicket || !createdTicket.id || !sourcePayload.pin_enabled || !sourcePayload.pin_until) return null;
        return {
          id: createdTicket.id,
          incidentId: sourcePayload.incident_id || incident_id,
          incidentName: sourcePayload.incident_name || (incidentIdToNameMap[String(sourcePayload.incident_id || incident_id)] || ''),
          description: sanitizePinText(sourcePayload.description || ''),
          fab: sourcePayload.fab || '',
          createdAt: sourcePayload.ticket_time || ticket_time,
          severity: Number(sourcePayload.severity || severity || 1),
          category: '',
          pinUntil: sourcePayload.pin_until
        };
      }).filter(Boolean);
      if (pinPayloads.length) {
        Promise.all(pinPayloads.map(function(pinPayload) {
          return fetchJson('/api/pinned-tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pinPayload)
          });
        })).then(function() {
          var toastTitle = pinPayloads.length > 1 ? 'PIN salvati' : 'PIN salvato';
          var toastMessage = pinPayloads.length > 1
            ? 'I ticket selezionati sono stati pinnati fino al ' + formatPinDate(pinPayloads[0].pinUntil)
            : 'Ticket pinnato fino al ' + formatPinDate(pinPayloads[0].pinUntil);
          showToast(toastMessage, 'success', toastTitle);
          updateImportantTicketsBadge();
        }).catch(function() {});
      }
    }
    ticketForm.reset();
    descSetReadOnly(false);
    descSetPlain('');
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

function allowedChartSpanSteps(panelId) {
  if (panelId === 'chartPanelPersonalMine' || panelId === 'chartPanelPersonalGroup') return [6, 9, 12];
  return chartSpanSteps;
}

// Il backend serializza una mappa vuota come `[]` (json_encode PHP) e anche
// localStorage può contenere "[]": in quel caso chartSpans diventerebbe un
// Array. Impostare chiavi-stringa su un Array funziona in memoria ma
// JSON.stringify le SCARTA, azzerando i resize a ogni salvataggio. Qui
// normalizziamo sempre a un oggetto piano con sole chiavi-stringa.
function normalizeSpanMap(value) {
  var out = {};
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(function (k) {
      if (!/^\d+$/.test(k)) out[k] = value[k];
    });
  }
  return out;
}

// Come normalizeSpanMap: forza sempre un oggetto piano. Il backend PHP
// serializza una mappa vuota come `[]` (Array JSON); se `chartTypes` resta un
// Array, impostare chiavi-stringa (es. `chartTypes['catYear']='donut'`) e poi
// `JSON.stringify`-arlo le scarta → il tipo scelto non viene mai salvato e a
// ogni round-trip torna al default. Coercizzando sempre a oggetto il problema
// sparisce (stesso bug già risolto per chartSpans).
function normalizeTypeMap(value) {
  var out = {};
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(function (k) {
      if (!/^\d+$/.test(k)) out[k] = value[k];
    });
  }
  return out;
}
let dragSrcPanel = null;
let saveUserChartsRequestSeq = 0;
let saveUserChartsAppliedSeq = 0;

function panelChartTargetKey(panelId) {
  var map = {
    chartPanelFab: 'fabYearChart',
    chartPanelCat: 'catYearChart',
    chartPanelTeam: 'teamYearChart',
    chartPanelIncident: 'incidentYearChart',
    chartPanelUser: 'userYearChart',
    chartPanelPersonalMine: 'personalMineChart',
    chartPanelPersonalGroup: 'personalGroupChart'
  };
  return map[panelId] || '';
}

function minChartSpanForPanel(panelId) {
  if (panelId === 'chartPanelPersonalMine' || panelId === 'chartPanelPersonalGroup') return 6;
  var targetKey = panelChartTargetKey(panelId);
  if (targetKey && getChartType(targetKey) === 'bar') return 6;
  return 3;
}

function effectiveAllowedChartSpanSteps(panelId) {
  return allowedChartSpanSteps(panelId).filter(function (step) {
    return step >= minChartSpanForPanel(panelId);
  });
}

function enforceMinChartSpanForPanel(panelId) {
  var minSpan = minChartSpanForPanel(panelId);
  var current = Number(chartSpans[panelId] || 0);
  if (current > 0 && current < minSpan) chartSpans[panelId] = minSpan;
}

function enforceMinChartSpans() {
  Object.keys(chartSpans || {}).forEach(function (panelId) {
    enforceMinChartSpanForPanel(panelId);
  });
}

function defaultChartSpan(panelId) {
  if (panelId === 'chartPanelPersonal') return 12;
  return minChartSpanForPanel(panelId);
}

function loadChartSpans() {
  if (chartSpans && typeof chartSpans === 'object' && Object.keys(chartSpans).length) return;
  try { chartSpans = normalizeSpanMap(JSON.parse(localStorage.getItem(chartSpanStorageKey) || '{}')); } catch (e) { chartSpans = {}; }
}

function saveChartSpans(skipRemoteSave) {
  try { localStorage.setItem(chartSpanStorageKey, JSON.stringify(chartSpans)); } catch (e) {}
  if (!skipRemoteSave) saveUserCharts().catch(console.error);
}

function getChartSpan(panelId) {
  var allowed = effectiveAllowedChartSpanSteps(panelId);
  const v = Number(chartSpans[panelId]);
  return allowed.indexOf(v) !== -1 ? v : defaultChartSpan(panelId);
}

function chartGridColumnCount(grid) {
  if (!grid) return 12;
  // Deve rispecchiare i breakpoint CSS di .charts-grid: <=900 = 1 col,
  // 901-1180 = 1 col (soglia minima panel), 1181-1400 = 2 col,
  // 1401-1600 = 4 col, oltre = 12.
  if (window.matchMedia('(max-width: 900px)').matches) return 1;
  if (window.matchMedia('(min-width: 901px) and (max-width: 1180px)').matches) return 1;
  if (window.matchMedia('(min-width: 1181px) and (max-width: 1400px)').matches) return 2;
  if (window.matchMedia('(min-width: 901px) and (max-width: 1400px)').matches) return 4;
  return 12;
}

function chartSpanToGridColumns(span, columnCount) {
  if (columnCount <= 1) return 1;
  if (columnCount >= 12) return span;
  if (columnCount === 2) return span <= 6 ? 1 : 2; // 3,6 = meta ; 9,12 = pieno
  if (span === 3 || span === 4) return 1;
  if (span === 6) return 2;
  if (span === 8 || span === 9) return 3;
  return 4;
}

function chartLayoutColumns(panel, span, columnCount) {
  return chartSpanToGridColumns(span, columnCount);
}

// Prossimo step di resize che cambia DAVVERO la larghezza mostrata: quando la
// griglia ha meno di 12 colonne piu span logici mappano sulle stesse colonne
// (es. a 2 colonne 3 e 6 sono entrambi "meta"), quindi salta gli step che non
// cambierebbero nulla, cosi ogni click sulle frecce ha un effetto visibile.
function nextResizeSpan(panel, current, dir) {
  var allowed = effectiveAllowedChartSpanSteps(panel ? panel.id : '');
  var grid = document.getElementById('chartsGrid');
  var cols = chartGridColumnCount(grid);
  var curCols = chartLayoutColumns(panel, current, cols);
  var idx = allowed.indexOf(current);
  if (idx === -1) idx = allowed.indexOf(getChartSpan(panel ? panel.id : ''));
  for (var i = idx + dir; i >= 0 && i < allowed.length; i += dir) {
    if (chartLayoutColumns(panel, allowed[i], cols) !== curCols) return allowed[i];
  }
  return null;
}

function estimatedPanelWidthForSpan(grid, span, panel) {
  if (!grid) return 0;
  var columns = chartGridColumnCount(grid);
  var gridRect = grid.getBoundingClientRect();
  var styles = window.getComputedStyle(grid);
  var gap = parseFloat(styles.columnGap || styles.gap || '16') || 16;
  if (columns <= 1) return gridRect.width;
  var oneColWidth = (gridRect.width - (gap * (columns - 1))) / columns;
  var usedColumns = chartLayoutColumns(panel, span, columns);
  return (oneColWidth * usedColumns) + (gap * Math.max(0, usedColumns - 1));
}

function minReadableChartWidth(panel) {
  if (!panel) return 0;
  if (panel.id === 'chartPanelPersonalMine' || panel.id === 'chartPanelPersonalGroup') return 560;
  var chart = panel.querySelector('.chart[id]');
  if (!chart) return 0;
  var type = getChartType(chart.id);
  if (type === 'donut') return 360;
  if (type === 'bar') return 430;
  return 360;
}

function getEffectiveChartSpan(panel, baseSpan) {
  var grid = document.getElementById('chartsGrid');
  var effective = baseSpan;
  // Se l'utente ha scelto esplicitamente una larghezza (presente in chartSpans),
  // la rispettiamo alla lettera: l'auto-allargamento vale solo come default di
  // leggibilità per i grafici che l'utente non ha mai ridimensionato a mano.
  if (panel && Object.prototype.hasOwnProperty.call(chartSpans, panel.id)) return effective;
  var minWidth = minReadableChartWidth(panel);
  if (!grid || !minWidth || window.matchMedia('(max-width: 640px)').matches) return effective;
  while (effective < chartSpanSteps[chartSpanSteps.length - 1] && estimatedPanelWidthForSpan(grid, effective, panel) < minWidth) {
    var idx = chartSpanSteps.indexOf(effective);
    if (idx === -1 || idx >= chartSpanSteps.length - 1) break;
    effective = chartSpanSteps[idx + 1];
  }
  return effective;
}

function applyChartSpan(panel, span) {
  chartSpanSteps.forEach(function (s) { panel.classList.remove('chart-span-' + s); });
  var effectiveSpan = getEffectiveChartSpan(panel, span);
  var grid = document.getElementById('chartsGrid');
  var columnCount = chartGridColumnCount(grid);
  var usedColumns = chartLayoutColumns(panel, effectiveSpan, columnCount);
  panel.classList.add('chart-span-' + effectiveSpan);
  panel.style.gridColumn = 'span ' + usedColumns;
  panel.dataset.chartSpan = String(span);
  panel.dataset.chartEffectiveSpan = String(effectiveSpan);
  panel.dataset.chartDisplayColumns = String(usedColumns);
}

// Larghezza da cui partono i pulsanti di resize: se l'utente ha già scelto
// una larghezza usiamo quella, altrimenti quella effettivamente mostrata a
// video (auto-allargata) così le frecce continuano dal valore visibile.
function currentDisplaySpan(panel) {
  if (!panel) return chartSpanSteps[0];
  var allowed = effectiveAllowedChartSpanSteps(panel.id);
  if (Object.prototype.hasOwnProperty.call(chartSpans, panel.id)) return getChartSpan(panel.id);
  var eff = Number(panel.dataset.chartEffectiveSpan);
  return allowed.indexOf(eff) !== -1 ? eff : getChartSpan(panel.id);
}

function refreshChartResizeControls(panel) {
  if (!panel) return;
  var current = currentDisplaySpan(panel);
  var buttons = panel.querySelectorAll('.chart-resize-btn');
  if (buttons && buttons.length >= 2) {
    // Disabilita in base alla reale disponibilita di uno step piu piccolo/grande
    // che cambi la larghezza mostrata (coerente con nextResizeSpan).
    buttons[0].disabled = nextResizeSpan(panel, current, -1) == null;
    buttons[1].disabled = nextResizeSpan(panel, current, 1) == null;
  }
  var valueBadge = panel.querySelector('.chart-resize-value');
  if (valueBadge) valueBadge.textContent = String(current);
}

function applyAllChartSpans() {
  const grid = document.getElementById('chartsGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    applyChartSpan(panel, getChartSpan(panel.id));
    refreshChartResizeControls(panel);
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
    const target = panel.querySelector('.panel-heading-row') || panel.querySelector('.chart-controls-row');
    if (!target || target.querySelector('.chart-resize-controls')) return;
    const controls = document.createElement('div');
    controls.className = 'chart-resize-controls';
    const valueBadge = document.createElement('span');
    valueBadge.className = 'chart-resize-value';
    valueBadge.setAttribute('aria-label', 'Larghezza corrente grafico');
    controls.appendChild(valueBadge);
    [{ dir: -1, label: '◀' }, { dir: 1, label: '▶' }].forEach(function (cfg) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chart-resize-btn';
      btn.textContent = cfg.label;
      btn.title = cfg.dir === -1 ? 'Riduci larghezza' : 'Espandi larghezza';
      btn.addEventListener('click', function () {
        const current = currentDisplaySpan(panel);
        const newSpan = nextResizeSpan(panel, current, cfg.dir);
        if (newSpan == null || newSpan === current) return;
        chartSpans[panel.id] = newSpan;
        applyChartSpan(panel, newSpan);
        refreshChartResizeControls(panel);
        requestAnimationFrame(function () { refreshChartResizeControls(panel); });
        saveChartSpans();
      });
      controls.appendChild(btn);
    });
    const actionButton = target.querySelector('.custom-chart-delete, .default-chart-hide-btn');
    if (actionButton) target.insertBefore(controls, actionButton);
    else target.appendChild(controls);
    refreshChartResizeControls(panel);
  });
}

function attachChartDragHandle(panel) {
  const grid = document.getElementById('chartsGrid');
  if (!grid || !panel || panel.dataset.dragInit === '1') return;
  panel.dataset.dragInit = '1';

  function onDragStart(e) {
    if (!chartsEditMode) {
      e.preventDefault();
      return;
    }
    var blocked = e.target.closest && e.target.closest('button, input, select, textarea, label, a, .chart-controls-row, .toggle-row, .range-calendar-wrap, .chart-title-edit-input');
    if (blocked) {
      e.preventDefault();
      return;
    }
    dragSrcPanel = panel;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', panel.id);
    try { e.dataTransfer.setDragImage(panel, 20, 20); } catch (err) {}
    setTimeout(function () { panel.classList.add('chart-dragging'); }, 0);
  }

  function onDragEnd() {
    if (dragSrcPanel) dragSrcPanel.classList.remove('chart-dragging');
    grid.querySelectorAll('.chart-drag-over').forEach(function (el) { el.classList.remove('chart-drag-over'); });
    dragSrcPanel = null;
  }

  [panel]
    .concat(Array.from(panel.querySelectorAll('.panel-heading-row, .chart, .personal-chart, .chart-controls-row, .toggle-row')))
    .forEach(function(surface) {
      surface.setAttribute('draggable', 'true');
      surface.addEventListener('dragstart', onDragStart);
      surface.addEventListener('dragend', onDragEnd);
    });
}

function setupChartDragDrop() {
  const grid = document.getElementById('chartsGrid');
  if (!grid || grid.dataset.dragSetup === '1') return;
  grid.dataset.dragSetup = '1';

  grid.querySelectorAll(':scope > .panel[id]').forEach(function (panel) {
    attachChartDragHandle(panel);
  });
  refreshChartEditAffordances();

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
  initQuickbarWindowBridge();
  initQuickbarLockMode();
  if (isQuickbarPage) scheduleQuickbarAutoFitHeight();
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
  try { await loadUserCharts(); } catch (error) {
    console.error(error);
    var savedPalette = localStorage.getItem('palette');
    if (!savedPalette) {
      var old = localStorage.getItem('theme') || '';
      savedPalette = (old === 'sunset') ? 'cappuccino' : 'blu';
      if (['dark','forest','purple','midnight'].indexOf(old) >= 0) localStorage.setItem('dark-mode', '1');
      localStorage.setItem('palette', savedPalette);
    }
    var savedDark = localStorage.getItem('dark-mode') === '1';
    applyTheme(savedPalette, savedDark);
  } finally {
    releaseThemeSyncPending();
  }
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
  var themeSelect = document.getElementById('themeSelect');
  var themePreview = document.getElementById('themePreview');
  var saveBtn = document.getElementById('saveUserSettingsBtn');
  var cancelBtn = document.getElementById('cancelUserSettingsBtn');
  var closeBtn = document.getElementById('closeUserSettingsBtn');

  // Metadata usato dall'anteprima live del tema (non tocca il DOM globale).
  var THEME_PREVIEW_META = {
    blu:        { bg:'#f5f7fb', bgImage:'radial-gradient(circle at 95% 5%, #e9f2ff 0%, transparent 45%)', panel:'#fff', text:'#17202f', muted:'#5c6b7d', brand:'#0c5f8c', brand2:'#16a0b6', border:'#d9e2ef', side:'#172b45', font:'"Segoe UI","Inter",sans-serif', pRadius:'6px', pBorder:'1px solid #d9e2ef', pShadow:'0 8px 24px rgba(16,41,68,.06)' },
    cappuccino: { bg:'#f7f2ec', bgImage:'', panel:'#fff', text:'#2c1a0a', muted:'#8b6a50', brand:'#7c4a24', brand2:'#c47840', border:'#d4c4ac', side:'#321805', font:'"Segoe UI","Inter",sans-serif', pRadius:'6px', pBorder:'1px solid #d4c4ac', pShadow:'0 8px 24px rgba(50,24,5,.08)' },
    bordeaux:   { bg:'#faf2f4', bgImage:'', panel:'#fff', text:'#280810', muted:'#7d4a54', brand:'#860026', brand2:'#bf2044', border:'#dfc4cc', side:'#2c0a12', font:'"Segoe UI","Inter",sans-serif', pRadius:'6px', pBorder:'1px solid #dfc4cc', pShadow:'0 8px 24px rgba(44,10,18,.08)' },
    verde:      { bg:'#f2f8f4', bgImage:'', panel:'#fff', text:'#0a2414', muted:'#447858', brand:'#1a6e3e', brand2:'#28a860', border:'#b4d8c0', side:'#0c261a', font:'"Segoe UI","Inter",sans-serif', pRadius:'6px', pBorder:'1px solid #b4d8c0', pShadow:'0 8px 24px rgba(12,38,26,.08)' },
    giallo:     { bg:'#fefcf0', bgImage:'', panel:'#fff', text:'#241c00', muted:'#7a6520', brand:'#b89200', brand2:'#d4b000', border:'#e8d888', side:'#2a2000', font:'"Segoe UI","Inter",sans-serif', pRadius:'6px', pBorder:'1px solid #e8d888', pShadow:'0 8px 24px rgba(42,32,0,.1)' },
    neon:       { bg:'#0d0219', bgImage:'', panel:'#12082a', text:'#f5e6ff', muted:'#b967ff', brand:'#01cdfe', brand2:'#05ffa1', border:'#ff71ce', side:'#1a0532', font:'Consolas,"Courier New",monospace', pRadius:'4px', pBorder:'1px solid #ff71ce', pShadow:'0 0 12px rgba(255,113,206,.5), inset 0 0 10px rgba(1,205,254,.15)', shape:'crt' },
    papiro:     { bg:'#f0e4c8', bgImage:'', panel:'#fdf6e3', text:'#3d2818', muted:'#7a5f3a', brand:'#7a4a2a', brand2:'#a06848', border:'#8b6f47', side:'#52341f', font:'Georgia,"Times New Roman",serif', pRadius:'2px', pBorder:'1px solid #8b6f47', pShadow:'3px 3px 0 rgba(61,40,24,.18)', shape:'square' },
    terminale:  { bg:'#000', bgImage:'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(51,255,51,.06) 3px, transparent 4px)', panel:'#001a00', text:'#33ff33', muted:'#22aa22', brand:'#00ff00', brand2:'#55ff55', border:'#33ff33', side:'#001100', font:'Consolas,"Courier New",monospace', pRadius:'0', pBorder:'1px solid #33ff33', pShadow:'0 0 8px rgba(51,255,51,.4), inset 0 0 6px rgba(51,255,51,.1)', shape:'crt' },
    aurora:     { bg:'#f5f0ff', bgImage:'linear-gradient(135deg,#a8edea 0%,#fed6e3 45%,#d4a5f9 100%)', panel:'rgba(255,255,255,.55)', text:'#2d1b52', muted:'#7862a8', brand:'#8b5cf6', brand2:'#ec4899', border:'rgba(139,92,246,.35)', side:'#6b3fa8', font:'"Segoe UI","Inter",sans-serif', pRadius:'20px', pBorder:'1px solid rgba(255,255,255,.55)', pShadow:'0 8px 32px rgba(139,92,246,.2), inset 0 1px 0 rgba(255,255,255,.6)', blur:'blur(10px) saturate(140%)' },
    blueprint:  { bg:'#0a2540', bgImage:'linear-gradient(rgba(94,234,212,.14) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(90deg,rgba(94,234,212,.14) 1px, transparent 1px) 0 0/16px 16px', panel:'rgba(13,53,96,.85)', text:'#e0f7ff', muted:'#7bc4e0', brand:'#5eead4', brand2:'#38bdf8', border:'#5eead4', side:'#0a2540', font:'Consolas,"Courier New",monospace', pRadius:'0', pBorder:'1px dashed #5eead4', pShadow:'0 4px 12px rgba(0,0,0,.4)', shape:'dashed' },
    sakura:     { bg:'#fff5f8', bgImage:'radial-gradient(circle at 15% 20%, #ffe0eb 0%, transparent 60%), radial-gradient(circle at 85% 80%, #fce7f3 0%, transparent 55%)', panel:'#fff', text:'#4a1c33', muted:'#a0637e', brand:'#e86ba0', brand2:'#ec4899', border:'#f9c4d4', side:'#a03e68', font:'"Segoe UI","Inter",sans-serif', pRadius:'22px', pBorder:'1px solid #f9c4d4', pShadow:'0 8px 24px rgba(232,107,160,.2), inset 0 1px 0 #fff' },
    brutalista: { bg:'#facc15', bgImage:'', panel:'#fff', text:'#000', muted:'#262626', brand:'#facc15', brand2:'#dc2626', border:'#000', side:'#000', font:'Impact,"Arial Black",sans-serif', pRadius:'0', pBorder:'4px solid #000', pShadow:'8px 8px 0 #000', shape:'brutal' },
    oceano:     { bg:'#001824', bgImage:'radial-gradient(ellipse at 20% -10%, #0891b2 0%, transparent 55%), radial-gradient(ellipse at 80% 110%, #0e7490 0%, transparent 55%), linear-gradient(180deg,#003c52 0%,#001824 100%)', panel:'rgba(14,116,144,.35)', text:'#e0f7fa', muted:'#7dd3dc', brand:'#22d3ee', brand2:'#06b6d4', border:'rgba(34,211,238,.35)', side:'#001824', font:'"Segoe UI","Inter",sans-serif', pRadius:'12px', pBorder:'1px solid rgba(34,211,238,.35)', pShadow:'0 6px 24px rgba(0,24,36,.5), inset 0 1px 0 rgba(255,255,255,.08)', blur:'blur(6px)' },
    nordico:    { bg:'#eceff4', bgImage:'', panel:'#fff', text:'#2e3440', muted:'#4c566a', brand:'#5e81ac', brand2:'#88c0d0', border:'#d8dee9', side:'#4c566a', font:'"Segoe UI","Inter",sans-serif', pRadius:'8px', pBorder:'1px solid #d8dee9', pShadow:'0 1px 2px rgba(46,52,64,.08)' },
    dracula:    { bg:'#282a36', bgImage:'', panel:'#44475a', text:'#f8f8f2', muted:'#6272a4', brand:'#bd93f9', brand2:'#ff79c6', border:'#6272a4', side:'#21222c', font:'"Fira Code",Consolas,"Courier New",monospace', pRadius:'6px', pBorder:'1px solid #6272a4', pShadow:'0 4px 12px rgba(0,0,0,.3)' },
    monokai:    { bg:'#272822', bgImage:'', panel:'#3e3d32', text:'#f8f8f2', muted:'#75715e', brand:'#a6e22e', brand2:'#f92672', border:'#49483e', side:'#1e1f1c', font:'Consolas,"Monaco","Courier New",monospace', pRadius:'4px', pBorder:'1px solid #49483e', pShadow:'0 4px 12px rgba(0,0,0,.4)', shape:'square' },
    vaporwave:  { bg:'#2d1b52', bgImage:'linear-gradient(180deg,#ff71ce 0%,#01cdfe 45%,#05ffa1 100%)', panel:'rgba(255,255,255,.75)', text:'#2d1b52', muted:'#7a4a8f', brand:'#ff71ce', brand2:'#01cdfe', border:'rgba(255,113,206,.4)', side:'#2d1b52', font:'"Courier New",Consolas,monospace', pRadius:'6px', pBorder:'2px solid rgba(255,113,206,.5)', pShadow:'0 0 20px rgba(255,113,206,.4),inset 0 0 8px rgba(1,205,254,.15)' },
    foresta:    { bg:'#0f2a1a', bgImage:'radial-gradient(circle at 30% 20%,rgba(245,158,11,.15) 0%,transparent 45%),radial-gradient(circle at 80% 80%,rgba(34,197,94,.15) 0%,transparent 45%)', panel:'#1a3625', text:'#e8f5e9', muted:'#8bb99b', brand:'#f59e0b', brand2:'#22c55e', border:'#2d5a3f', side:'#0a1f14', font:'Georgia,"Times New Roman",serif', pRadius:'8px', pBorder:'1px solid #2d5a3f', pShadow:'0 8px 20px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.03)' },
    marmo:      { bg:'#faf7f0', bgImage:'linear-gradient(135deg,#faf7f0 0%,#f0ebe0 50%,#faf7f0 100%),radial-gradient(circle at 30% 40%,rgba(184,134,11,.05) 0%,transparent 40%)', panel:'#fff', text:'#3a3128', muted:'#8b7355', brand:'#b8860b', brand2:'#d4a017', border:'#d4c4a8', side:'#3a3128', font:'Georgia,"Playfair Display",serif', pRadius:'4px', pBorder:'1px solid #d4c4a8', pShadow:'0 4px 20px rgba(58,49,40,.12),inset 0 1px 0 #fff', shape:'square' },
    solarpunk:  { bg:'#f5f9e8', bgImage:'radial-gradient(circle at 20% 30%,rgba(132,204,22,.18) 0%,transparent 50%),radial-gradient(circle at 85% 75%,rgba(234,179,8,.15) 0%,transparent 50%)', panel:'#fff', text:'#1a2e0f', muted:'#4d7c0f', brand:'#84cc16', brand2:'#eab308', border:'#bef264', side:'#2d4a2b', font:'"Segoe UI","Inter",sans-serif', pRadius:'16px', pBorder:'1px solid #bef264', pShadow:'0 6px 20px rgba(132,204,22,.2),inset 0 1px 0 rgba(255,255,255,.5)' },
    piombo:     { bg:'#eceff1', bgImage:'', panel:'#fafafa', text:'#263238', muted:'#546e7a', brand:'#ff6f00', brand2:'#546e7a', border:'#90a4ae', side:'#37474f', font:'"Roboto Mono","Consolas",monospace', pRadius:'2px', pBorder:'1px solid #90a4ae', pShadow:'0 2px 4px rgba(38,50,56,.15),0 1px 0 rgba(0,0,0,.05)', shape:'square' },
    manoscritto:{ bg:'#f5efe0', bgImage:'repeating-linear-gradient(0deg,transparent 0,transparent 22px,rgba(30,58,95,.08) 22px,rgba(30,58,95,.08) 23px)', panel:'#fdfaef', text:'#1e3a5f', muted:'#5a7396', brand:'#1e3a5f', brand2:'#8b2a2a', border:'#c8b88a', side:'#1e3a5f', font:'"Brush Script MT","Lucida Handwriting","Segoe Script",cursive', pRadius:'2px', pBorder:'1px solid #c8b88a', pShadow:'2px 3px 8px rgba(30,58,95,.15)' },
    cyber2077:  { bg:'#0a0a0a', bgImage:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)', panel:'#161616', text:'#fcee0a', muted:'#00d9ff', brand:'#fcee0a', brand2:'#ff003c', border:'#fcee0a', side:'#0a0a0a', font:'"Impact","Arial Black",sans-serif', pRadius:'0', pBorder:'2px solid #fcee0a', pShadow:'0 0 15px rgba(252,238,10,.4),0 4px 0 #ff003c', shape:'brutal' }
  };

  function renderThemeSelect() {
    if (!themeSelect) return;
    themeSelect.innerHTML = '';
    var cur = currentPaletteId || localStorage.getItem('palette') || 'blu';
    THEMES.forEach(function(t) {
      var opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      if (t.id === cur) opt.selected = true;
      themeSelect.appendChild(opt);
    });
  }

  function updateThemePreview(themeId) {
    if (!themePreview) return;
    var meta = THEME_PREVIEW_META[themeId] || THEME_PREVIEW_META.blu;
    var canvas = themePreview;
    canvas.style.setProperty('--tp-bg', meta.bg);
    canvas.style.setProperty('--tp-bg-image', meta.bgImage || 'none');
    canvas.style.setProperty('--tp-panel', meta.panel);
    canvas.style.setProperty('--tp-text', meta.text);
    canvas.style.setProperty('--tp-muted', meta.muted);
    canvas.style.setProperty('--tp-brand', meta.brand);
    canvas.style.setProperty('--tp-brand-2', meta.brand2 || meta.brand);
    canvas.style.setProperty('--tp-border', meta.border);
    canvas.style.setProperty('--tp-side', meta.side);
    canvas.style.setProperty('--tp-font', meta.font);
    canvas.style.setProperty('--tp-panel-radius', meta.pRadius);
    canvas.style.setProperty('--tp-panel-border', meta.pBorder);
    canvas.style.setProperty('--tp-panel-shadow', meta.pShadow);
    canvas.style.setProperty('--tp-blur', meta.blur || 'none');
    if (meta.shape) canvas.setAttribute('data-shape', meta.shape); else canvas.removeAttribute('data-shape');
    // Force reflow so nuovi custom-prop entrino in effetto prima del paint
    void canvas.offsetWidth;
    canvas.innerHTML =
      '<div class="tp-sidebar">' +
        '<div class="tp-logo"></div>' +
        '<div class="tp-sidebar-item active"></div>' +
        '<div class="tp-sidebar-item"></div>' +
        '<div class="tp-sidebar-item"></div>' +
      '</div>' +
      '<div class="tp-main">' +
        '<div class="tp-topbar">' +
          '<span class="tp-title">Dashboard</span>' +
          '<span class="tp-badge">Live</span>' +
        '</div>' +
        '<div class="tp-panel">' +
          '<div class="tp-panel-title">Ticket per FAB</div>' +
          '<div class="tp-bars"><i style="height:70%"></i><i style="height:85%"></i><i style="height:55%"></i><i style="height:40%"></i><i style="height:25%"></i></div>' +
          '<div class="tp-line short"></div>' +
          '<div class="tp-line tiny"></div>' +
          '<button type="button" class="tp-btn">Apri ticket</button>' +
        '</div>' +
      '</div>';
  }

  var _settingsSnapshot = null;
  var _settingsSaved = false;

  function captureSettingsSnapshot() {
    _settingsSnapshot = {
      palette: currentPaletteId || localStorage.getItem('palette') || 'blu',
      darkMode: !!currentDarkMode,
      panelScalePct: getPanelScalePct()
    };
    _settingsSaved = false;
  }

  function restoreSettingsSnapshot() {
    if (!_settingsSnapshot) return;
    var snap = _settingsSnapshot;
    // Palette + dark
    if (snap.palette !== currentPaletteId || snap.darkMode !== currentDarkMode) {
      localStorage.setItem('palette', snap.palette);
      localStorage.setItem('dark-mode', snap.darkMode ? '1' : '');
      applyTheme(snap.palette, snap.darkMode);
      saveUserCharts().catch(console.error);
      refreshColorSensitiveViews().catch(function(){});
    }
    // Panel scale
    if (snap.panelScalePct !== getPanelScalePct()) {
      applyPanelScale(snap.panelScalePct);
    }
  }

  function openUserSettingsModal() {
    if (!modal) return;
    captureSettingsSnapshot();
    renderThemeSelect();
    updateThemePreview(currentPaletteId || 'blu');
    modal.classList.remove('closing');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    requestAnimationFrame(function() { modal.classList.add('active'); });
  }

  function closeUserSettingsModal(commit) {
    if (!modal) return;
    if (commit) {
      _settingsSaved = true;
      // Persisti sul server SOLO ora: la palette e' gia' applicata localmente
      // durante le modifiche in-modal, ma niente POST intermedie => niente race.
      if (_settingsSnapshot && (_settingsSnapshot.palette !== currentPaletteId || _settingsSnapshot.darkMode !== currentDarkMode)) {
        saveUserCharts().catch(console.error);
      }
    } else if (!_settingsSaved) {
      restoreSettingsSnapshot();
    }
    modal.classList.remove('active');
    modal.classList.add('closing');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    setTimeout(function() { modal.classList.remove('show', 'closing'); modal.style.display = ''; }, 260);
  }

  /* --- Dimensione pannelli/grafici --- */
  var PANEL_SCALE_KEY = 'prodops_panel_scale';
  var PANEL_SCALE_MIN = 70, PANEL_SCALE_MAX = 150, PANEL_SCALE_STEP = 5;
  var scaleSlider = document.getElementById('panelScaleSlider');
  var scaleValueEl = document.getElementById('panelScaleValue');
  var scaleDownBtn = document.getElementById('panelScaleDown');
  var scaleUpBtn = document.getElementById('panelScaleUp');

  function getPanelScalePct() {
    var raw = parseInt(localStorage.getItem(PANEL_SCALE_KEY) != null
      ? Math.round(parseFloat(localStorage.getItem(PANEL_SCALE_KEY)) * 100) : 100, 10);
    if (isNaN(raw)) raw = 100;
    return Math.min(PANEL_SCALE_MAX, Math.max(PANEL_SCALE_MIN, raw));
  }

  function applyPanelScale(pct) {
    pct = Math.min(PANEL_SCALE_MAX, Math.max(PANEL_SCALE_MIN, pct));
    document.documentElement.style.setProperty('--panel-scale', pct / 100);
    localStorage.setItem(PANEL_SCALE_KEY, String(pct / 100));
    if (scaleSlider) scaleSlider.value = pct;
    if (scaleValueEl) scaleValueEl.textContent = pct + '%';
    if (scaleDownBtn) scaleDownBtn.disabled = pct <= PANEL_SCALE_MIN;
    if (scaleUpBtn) scaleUpBtn.disabled = pct >= PANEL_SCALE_MAX;
  }

  function syncPanelScaleUI() { applyPanelScale(getPanelScalePct()); }

  // Cambio tema all'interno del modal: aggiorna solo stato visivo + localStorage.
  // La persistenza lato server e' fatta SOLO su Salva/Annulla per evitare race
  // condition tra POST rapide in volo (una in ritardo sovrascriverebbe il rollback).
  if (themeSelect) themeSelect.addEventListener('change', function() {
    var newId = themeSelect.value;
    localStorage.setItem('palette', newId);
    applyTheme(newId, currentDarkMode);
    updateThemePreview(newId);
    refreshColorSensitiveViews().catch(function(){});
  });

  if (scaleSlider) scaleSlider.addEventListener('input', function() { applyPanelScale(parseInt(scaleSlider.value, 10) || 100); });
  if (scaleDownBtn) scaleDownBtn.addEventListener('click', function() { applyPanelScale(getPanelScalePct() - PANEL_SCALE_STEP); });
  if (scaleUpBtn) scaleUpBtn.addEventListener('click', function() { applyPanelScale(getPanelScalePct() + PANEL_SCALE_STEP); });

  // Applica al caricamento (rinforza l'inline script anti-flash e allinea la UI)
  syncPanelScaleUI();

  var _origOpen = openUserSettingsModal;
  openUserSettingsModal = function() { syncPanelScaleUI(); _origOpen(); };

  if (saveBtn) saveBtn.addEventListener('click', function() { closeUserSettingsModal(true); });

  if (cancelBtn) cancelBtn.addEventListener('click', function() { closeUserSettingsModal(false); });
  if (closeBtn) closeBtn.addEventListener('click', function() { closeUserSettingsModal(false); });
  if (modal) modal.addEventListener('mousedown', function(e) { if (e.target === modal) closeUserSettingsModal(false); });

  window._openUserSettingsModal = openUserSettingsModal;
})();

/* ── Avatar picker ───────────────────────────────────── */
(function () {
  var AVATAR_PREVIEW_COUNT = 10;
  var AVATARS = [
    '🦁','🐯','🐻','🦊','🐼','🐨','🐸','🐱','🐶','🐺',
    '🦝','🦄','🦅','🦉','🐙','🦋','🐲','🤖','👽','🥷',
    '🦸','🐵','🐰','🐹','🐭','🦓','🦒','🦔','🦥','🦦',
    '🐘','🐷','🐮','🐗','🐴','🦚','🦜','🐢','🐬','🦈',
    '🐧','🦭','🦇','🐞','🦂','🐉','🛸','👾','🧙','🦹'
  ];
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

    var extraWrap = document.createElement('div');
    extraWrap.className = 'avatar-picker-extra';
    extraWrap.hidden = true;
    var extraGrid = document.createElement('div');
    extraGrid.className = 'avatar-picker-grid avatar-picker-grid-extra';
    extraWrap.appendChild(extraGrid);

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

    AVATARS.forEach(function (emoji, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option' + (current === emoji ? ' selected' : '');
      btn.title = emoji;
      btn.setAttribute('aria-label', emoji);
      btn.textContent = emoji;
      btn.addEventListener('click', function () { choose(emoji); });
      (index < AVATAR_PREVIEW_COUNT ? grid : extraGrid).appendChild(btn);
    });

    var toggleMoreBtn = null;
    if (AVATARS.length > AVATAR_PREVIEW_COUNT) {
      toggleMoreBtn = document.createElement('button');
      toggleMoreBtn.type = 'button';
      toggleMoreBtn.className = 'avatar-picker-expand-btn';
      toggleMoreBtn.setAttribute('aria-expanded', 'false');
      toggleMoreBtn.innerHTML = '<span class="avatar-picker-expand-copy">Mostra altre icone avatar</span><span class="avatar-picker-expand-arrow" aria-hidden="true">▾</span>';
      toggleMoreBtn.addEventListener('click', function () {
        var expanded = toggleMoreBtn.getAttribute('aria-expanded') === 'true';
        toggleMoreBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        var copy = toggleMoreBtn.querySelector('.avatar-picker-expand-copy');
        if (copy) copy.textContent = expanded ? 'Mostra altre icone avatar' : 'Nascondi icone aggiuntive';
        extraWrap.hidden = expanded;
      });
    }

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
    if (toggleMoreBtn) panel.appendChild(toggleMoreBtn);
    panel.appendChild(extraWrap);
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
          (pin.description ? '<div class="itc-desc">' + renderDescriptionHtml(sanitizePinText(pin.description)) + '</div>' : '') +
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




ticketList?.addEventListener('click', async (e) => {
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
    canEdit: (card.dataset.canEdit === '1') && isStrictAdminUser()
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
    descSetReadOnly(false);
    descSetPlain('');
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
var _compactMode = '';
var _compactFlatRows = [];
var _tsPopupTimer = null;
var _tsScrollLock = null;

function _tsLockPageScroll() {
  if (!document.body || (_tsScrollLock && _tsScrollLock.active)) return;
  var docEl = document.documentElement;
  var scrollbarGap = Math.max(0, window.innerWidth - docEl.clientWidth);
  _tsScrollLock = {
    active: true,
    paddingRight: document.body.style.paddingRight || ''
  };
  document.body.classList.add('ticket-stack-popup-open');
  if (scrollbarGap > 0) document.body.style.paddingRight = scrollbarGap + 'px';
}

function _tsUnlockPageScroll() {
  if (!document.body || !_tsScrollLock || !_tsScrollLock.active) return;
  document.body.classList.remove('ticket-stack-popup-open');
  document.body.style.paddingRight = _tsScrollLock.paddingRight;
  _tsScrollLock = null;
}

function _compactRestoreFlat() {
  ticketList.classList.remove('compact-visual');
  if (!_compactFlatRows.length) return;
  ticketList.innerHTML = '';
  _compactFlatRows.forEach(function(r) { ticketList.appendChild(r); });
}

function _compactKeyForRow(row) {
  if (_compactMode === 'incident') return String(row.dataset.incident || '').trim();
  if (_compactMode === 'fab') return String(row.dataset.fab || '').trim();
  return String(row.dataset.category || '').trim();
}

function _compactLabelForMode() {
  if (_compactMode === 'incident') return 'incident';
  if (_compactMode === 'fab') return 'FAB';
  return 'categoria';
}

function _compactExpandRows(entries) {
  var expanded = [];
  (entries || []).forEach(function(entry) {
    if (!entry || entry.style.display === 'none') return;
    if (entry.classList && entry.classList.contains('ticket-dup-stack') && Array.isArray(entry._tsCards) && entry._tsCards.length) {
      entry._tsCards.forEach(function(card) { expanded.push(card); });
      return;
    }
    expanded.push(entry);
  });
  return expanded;
}

function _compactBuild() {
  var allRows = [];
  if (_compactFlatRows.length) {
    allRows = _compactFlatRows.slice();
  } else {
    allRows = Array.from(ticketList.children).filter(function(li) {
      return !!li.dataset.ticketId;
    });
    _compactFlatRows = allRows.slice();
  }

  var visRows = _compactExpandRows(allRows);

  var groups = {};
  var order = [];
  visRows.forEach(function(row) {
    var groupKey = _compactKeyForRow(row) || '—';
    if (!groups[groupKey]) { groups[groupKey] = []; order.push(groupKey); }
    groups[groupKey].push(row);
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

  order.forEach(function(groupKey) {
    var cards = groups[groupKey];
    var stack = document.createElement('li');
    stack.className = 'ticket-stack' + (cards.length === 1 ? ' single' : '');
    stack.dataset.stackKey = groupKey;
    stack._tsCards = cards;
    stack.title = 'Compattato per ' + _compactLabelForMode() + ': ' + groupKey;

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
  if (tsPopup) tsPopup._anchorStack = stack;

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
  _tsLockPageScroll();
}

function _tsHidePopup() {
  if (tsPopup) {
    tsPopup.setAttribute('hidden', '');
    tsPopup.innerHTML = '';
    tsPopup._anchorStack = null;
  }
  _tsUnlockPageScroll();
}

if (tsPopup) {
  tsPopup.addEventListener('wheel', function(e) {
    if (tsPopup.scrollWidth <= tsPopup.clientWidth) return;
    var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    tsPopup.scrollLeft += delta;
    e.preventDefault();
  }, { passive: false });
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
    var popupIsPreviousShift = !!(tsPopup && tsPopup._anchorStack && previousShiftsContent && previousShiftsContent.contains(tsPopup._anchorStack));
    openTicketReadModal({
      ticketId: card.dataset.ticketId,
      incidentId: card.dataset.incidentId,
      incidentName: card.dataset.incident,
      description: card.dataset.description,
      fab: card.dataset.fab,
      createdAt: card.dataset.createdAt,
      severity: card.dataset.severity,
      category: card.dataset.category,
      canEdit: popupIsPreviousShift ? ((card.dataset.canEdit === '1') && isStrictAdminUser()) : (card.dataset.canEdit === '1')
    });
    _tsHidePopup();
  });
}

if (ticketList) {
  ticketList.addEventListener('mouseover', function(e) {
    var stack = e.target.closest('.ticket-stack, .ticket-dup-stack');
    if (!stack || !stack._tsCards || stack._tsCards.length <= 1) return;
    if (tsPopup && tsPopup._anchorStack === stack && !tsPopup.hasAttribute('hidden')) return;
    _tsShowPopup(stack);
  });
}

if (compactModeSelect) {
  compactModeSelect.addEventListener('change', function() {
    if (_compactMode && _compactFlatRows.length) _compactRestoreFlat();
    _compactMode = String(this.value || '');
    if (_compactMode) {
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
