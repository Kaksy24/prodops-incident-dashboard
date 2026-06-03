const menu = document.getElementById('menu');
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
const openAdminBtn = document.getElementById('openAdminBtn');
const logoutBtn = document.getElementById('logoutBtn');
const deleteTicketBtn = document.getElementById('deleteTicketBtn');
const previousShiftsToggle = document.getElementById('previousShiftsToggle');
const previousShiftsContent = document.getElementById('previousShiftsContent');
const ticketSearchForm = document.getElementById('ticketSearchForm');
const ticketSearchQueryInput = document.getElementById('ticketSearchQuery');
const ticketSearchFromInput = document.getElementById('ticketSearchFrom');
const ticketSearchToInput = document.getElementById('ticketSearchTo');
const ticketSearchResetBtn = document.getElementById('ticketSearchResetBtn');
const ticketSearchSummary = document.getElementById('ticketSearchSummary');
const ticketSearchResults = document.getElementById('ticketSearchResults');

const fabDayChart = document.getElementById('fabDayChart');
const fabYearChart = document.getElementById('fabYearChart');
const catDayChart = document.getElementById('catDayChart');
const catYearChart = document.getElementById('catYearChart');
const teamYearChart = document.getElementById('teamYearChart');
const severityYearChart = document.getElementById('severityYearChart');
const ticketTimestampInput = document.getElementById('ticketTimestamp');
const ticketModalTitle = document.getElementById('ticketModalTitle');
const ticketSeveritySelect = document.getElementById('ticketSeverity');
const ticketSeverityHint = document.getElementById('ticketSeverityHint');
const ticketSeverityGroup = document.getElementById('ticketSeverityGroup');
const presetInlineComposer = document.getElementById('presetInlineComposer');

const fabs = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];
const themeToggleBtn = document.getElementById('themeToggleBtn');
let fabYearMode = 'months';
let catYearMode = 'months';
let teamYearMode = 'months';
let severityYearMode = 'months';
const currentYear = new Date().getFullYear();
const incidentCategoryMap = {};
const incidentNameToIdMap = {};
const incidentIdToNameMap = {};
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
let currentShiftAutoRefreshTimer = null;
let currentShiftAutoRefreshBusy = false;
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const chartTypeStorageKey = 'prodops_chart_types';
const chartTypeChoices = [
  { value: 'column', label: 'Colonne' },
  { value: 'bar', label: 'Barre orizzontali' },
  { value: 'donut', label: 'Ciambella' },
  { value: 'pie', label: 'Torta' },
  { value: 'line', label: 'Linea' }
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
}

function renderPresetForTargets(template, descriptionInput, composerContainer) {
  const tokens = parsePresetTokens(template);
  if (!tokens.length) {
    composerContainer.style.display = 'none';
    composerContainer.innerHTML = '';
    descriptionInput.readOnly = false;
    descriptionInput.dataset.presetAutoSync = 'off';
    descriptionInput.dataset.presetAutoValue = '';
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
    if (token.type === 'select') {
      input = document.createElement('select');
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = `Seleziona ${token.label || ''}`.trim();
      input.appendChild(empty);
      token.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = token.label || '';
    }
    input.style.width = '100%';
    input.addEventListener('input', () => {
      tokenState[tokenIndex].value = input.value || '';
      const generated = buildDescriptionFromTemplate(template, tokenState, true);
      descriptionInput.dataset.presetAutoValue = generated;
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
  descriptionInput.value = initialGenerated;
}

function createExtraTicketCard(incidentName) {
  if (!extraTicketModals) return;
  extraTicketCounter += 1;
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

      <div class="extra-severity-group">
        <label>Severity</label>
        <select class="extra-severity">
          <option value="1">1 - Low</option>
          <option value="2">2 - Medium</option>
          <option value="3">3 - High</option>
          <option value="4">4 - Extreme</option>
        </select>
        <p class="muted extra-severity-hint"></p>
      </div>

      <p class="muted">Seleziona FAB di appartenenza:</p>
      <div class="fab-buttons extra-fab-buttons"></div>
      <input type="hidden" class="extra-fab" />

      <div class="datetime-actions-row">
        <div class="datetime-block">
          <label class="ticket-timestamp-label">Datetime</label>
          <input type="datetime-local" class="ticket-timestamp-input extra-datetime" value="${toDatetimeLocalValue(new Date())}" />
        </div>
        <div class="form-actions inline-actions">
          <button type="button" class="secondary extra-cancel-btn">Annulla</button>
          <button type="button" class="primary extra-submit-btn">Crea Ticket</button>
        </div>
      </div>
    </div>
  `;

  const severityCfg = incidentSeverityMap[incidentName] || { severity_default: 1, severity_mode: 'default' };
  const severitySelect = panel.querySelector('.extra-severity');
  const severityGroup = panel.querySelector('.extra-severity-group');
  const severityHint = panel.querySelector('.extra-severity-hint');
  severitySelect.value = String(severityCfg.severity_default || 1);
  if (severityHint) {
    severityHint.textContent = severityCfg.severity_mode === 'user'
      ? 'Severity selezionabile dall\'utente.'
      : 'Severity impostata di default dall\'admin.';
  }
  if (severityCfg.severity_mode !== 'user') {
    panel.dataset.fixedSeverity = String(severityCfg.severity_default || 1);
    if (severityGroup) severityGroup.style.display = 'none';
  }

  const defaultFab = incidentFabDefaultMap[incidentName] || '';
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

  const presetTemplate = (incidentPresetMap[incidentName] || [])[0] || '';
  const desc = panel.querySelector('.extra-description');
  const composer = panel.querySelector('.extra-composer');
  if (desc && composer) {
    renderPresetForTargets(presetTemplate, desc, composer);
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
  panel.querySelector('.extra-submit-btn')?.addEventListener('click', () => {
    ticketForm.requestSubmit();
  });
  extraTicketModals.appendChild(panel);
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

function openModal(incidentName) {
  incidentTypeInput.value = incidentName;
  if (ticketModalTitle) ticketModalTitle.textContent = incidentName || 'Nuovo Ticket';
  const defaultFab = incidentFabDefaultMap[incidentName] || '';
  fabValue.value = defaultFab;
  const presets = incidentPresetMap[incidentName] || [];
  applyPresetTemplate(presets[0] || '');
  const severityCfg = incidentSeverityMap[incidentName] || { severity_default: 1, severity_mode: 'default' };
  ticketSeveritySelect.value = String(severityCfg.severity_default || 1);
  const userChoice = severityCfg.severity_mode === 'user';
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = userChoice ? '' : 'none';
  ticketSeveritySelect.disabled = !userChoice;
  if (ticketSeverityHint) {
    ticketSeverityHint.textContent = userChoice
      ? 'Severity selezionabile dall\'utente.'
      : 'Severity impostata di default dall\'admin.';
  }
  ticketTimestampInput.value = toDatetimeLocalValue(new Date());
  editingTicketId = null;
  clearExtraTicketCards();
  if (ticketSubmitBtn) ticketSubmitBtn.textContent = 'Crea Ticket';
  if (deleteTicketBtn) deleteTicketBtn.style.display = 'none';
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = 'grid';
  fabButtonsWrap.querySelectorAll('.fab-btn').forEach((b) => {
    b.classList.toggle('active', b.textContent === defaultFab);
  });
  revealModal();
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

function parsePresetTokens(template) {
  const regex = /\[\[(text|select):([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    const type = match[1];
    const label = (match[2] || '').trim();
    const options = type === 'select' ? (match[3] || '').split(',').map((x) => x.trim()).filter(Boolean) : [];
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

function renderPresetDynamicFields(template) {
  if (!presetInlineComposer) return;
  const descriptionInput = document.getElementById('description');
  descriptionInput.style.display = '';
  renderPresetForTargets(template, descriptionInput, presetInlineComposer);
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

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('Login richiesta');
  }
  if (res.status === 403) {
    alert('Non hai i permessi per questa operazione.');
    throw new Error('Accesso non consentito');
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

async function loadCurrentUser() {
  const data = await fetchJson('/api/me');
  currentUser = data.user;
  if (openAdminBtn) openAdminBtn.style.display = currentUser?.role === 'admin' ? '' : 'none';
}

function chartTitleForTarget(target) {
  return target.closest('.panel') ? target.closest('.panel').querySelector('h3')?.textContent || target.id || 'Grafico' : (target.id || 'Grafico');
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
      <div class="chart-horizontal-track"><div class="bar-fill" style="width:${width}%;background:${color}"><span class="bar-pct">${pct}%</span></div></div>
      <span class="chart-horizontal-value">${item.total}</span>
    `;
    wrap.appendChild(row);
  });

  target.appendChild(wrap);
}

function renderPieOrDonutChart(target, stats, isDonut) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
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
      <strong class="chart-pie-value">${item.total}</strong>
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
  document.querySelectorAll('.chart-export[data-chart-target]').forEach((wrap) => {
    const targetId = wrap.dataset.chartTarget || '';
    const panelHeader = wrap.closest('.panel-heading-row');
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
    panelHeader.insertBefore(select, wrap);
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
  Object.keys(incidentPresetMap).forEach((k) => delete incidentPresetMap[k]);
  Object.keys(incidentSeverityMap).forEach((k) => delete incidentSeverityMap[k]);
  Object.keys(incidentFabDefaultMap).forEach((k) => delete incidentFabDefaultMap[k]);
  data.forEach((cat) => {
    const wrap = document.createElement('div');
    wrap.className = 'menu-category';
    wrap.innerHTML = `<button class="category-toggle" type="button" aria-expanded="false">${cat.name}</button>`;
    const ul = document.createElement('ul');
    ul.className = 'incident-list';
    cat.incidents.forEach((inc) => {
      incidentCategoryMap[inc.name] = cat.name;
      incidentNameToIdMap[inc.name] = Number(inc.id);
      incidentIdToNameMap[String(inc.id)] = inc.name;
      incidentPresetMap[inc.name] = Array.isArray(inc.presets) ? inc.presets : [];
      incidentSeverityMap[inc.name] = {
        severity_default: Number(inc.severity_default || 1),
        severity_mode: inc.severity_mode || 'default'
      };
      incidentFabDefaultMap[inc.name] = (inc.fab_default || '').toUpperCase();
      const li = document.createElement('li');
      li.innerHTML = `<button class="incident-btn" type="button">${inc.name}</button>`;
      li.querySelector('button').addEventListener('click', () => openModal(inc.name));
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
  const data = await fetchJson('/api/tickets/current-shift');
  const animatedIds = new Set((animatedTicketIds || []).map(Number));
  ticketList.innerHTML = data.tickets.length ? '' : '<li>Nessun ticket nel turno corrente.</li>';
  if (!data.tickets.length) return;

  const grouped = new Map();
  data.tickets.forEach((t) => {
    const category = incidentCategoryMap[t.incident_name] || 'Categoria non definita';
    const key = `${category}|||${t.fab}`;
    if (!grouped.has(key)) grouped.set(key, { category, fab: t.fab, incidents: [] });
    grouped.get(key).incidents.push({
      id: t.id,
      incident_name: t.incident_name,
      description: t.description,
      fab: t.fab,
      created_at: t.created_at,
      severity: t.severity,
      can_edit: Boolean(t.can_edit)
    });
  });

  grouped.forEach((group) => {
    const categoryColor = getLabelColor('categories', group.category);
    const fabColor = getLabelColor('fabs', group.fab);
    const li = document.createElement('li');
    const incidents = group.incidents
      .map((item) => {
        const isAnimated = animatedIds.has(Number(item.id));
        const editBtn = item.can_edit
          ? `<button type="button" class="edit-ticket-btn" data-ticket-id="${item.id}" data-incident-id="${item.incident_id || ''}" data-incident="${item.incident_name.replace(/"/g, '&quot;')}" data-description="${item.description.replace(/"/g, '&quot;')}" data-fab="${item.fab}" data-created-at="${item.created_at || ''}" data-severity="${item.severity || ''}">Modifica</button>`
          : '';
        const ticketTimestamp = formatTicketTimestamp(item.created_at);
        return `<li class="${isAnimated ? 'ticket-new-entry' : ''}" data-ticket-id="${item.id}"><span class="incident-entry-text"><span class="ticket-entry-time">${ticketTimestamp}</span><span class="incident-title">${item.incident_name}</span> - ${item.description}</span>${editBtn}</li>`;
      })
      .join('');
    li.innerHTML = `<strong class="ticket-category-label" style="color:${categoryColor}">${group.category}</strong> | <strong class="ticket-fab-label" style="color:${fabColor}">${group.fab}</strong><ul>${incidents}</ul>`;
    if (group.incidents.some((item) => animatedIds.has(Number(item.id)))) li.classList.add('ticket-new-group');
    ticketList.appendChild(li);
  });
}

async function refreshCurrentShiftTickets() {
  if (currentShiftAutoRefreshBusy) return;
  currentShiftAutoRefreshBusy = true;
  try {
    await loadDayTickets();
  } catch (error) {
    // Silenzio: il refresh periodico riproverà al ciclo successivo.
  } finally {
    currentShiftAutoRefreshBusy = false;
  }
}

function startCurrentShiftAutoRefresh() {
  if (currentShiftAutoRefreshTimer) return;
  currentShiftAutoRefreshTimer = window.setInterval(() => {
    refreshCurrentShiftTickets().catch(() => {});
  }, 5000);
}

function renderGroupedTickets(tickets) {
  if (!tickets.length) return '<p class="muted">Nessun ticket registrato.</p>';

  const grouped = new Map();
  tickets.forEach((ticket) => {
    const category = incidentCategoryMap[ticket.incident_name] || 'Categoria non definita';
    const key = `${category}|||${ticket.fab}`;
    if (!grouped.has(key)) grouped.set(key, { category, fab: ticket.fab, incidents: [] });
    grouped.get(key).incidents.push(ticket);
  });

  const groups = [...grouped.values()].map((group) => {
    const categoryColor = getLabelColor('categories', group.category);
    const fabColor = getLabelColor('fabs', group.fab);
    const rows = group.incidents
      .map((item) => `<li><span class="incident-entry-text"><span class="incident-title">${item.incident_name}</span> - ${item.description}</span></li>`)
      .join('');
    return `<li><strong class="ticket-category-label" style="color:${categoryColor}">${group.category}</strong> | <strong class="ticket-fab-label" style="color:${fabColor}">${group.fab}</strong><ul>${rows}</ul></li>`;
  }).join('');

  return `<ul class="ticket-list previous-ticket-list">${groups}</ul>`;
}

function renderSearchTickets(tickets) {
  if (!tickets.length) return '<p class="muted">Nessun ticket trovato con questi filtri.</p>';

  const grouped = new Map();
  tickets.forEach((ticket) => {
    const category = incidentCategoryMap[ticket.incident_name] || 'Categoria non definita';
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
      return `<li data-ticket-id="${item.id}"><span class="incident-entry-text"><span class="incident-title">${item.incident_name}</span> - ${item.description}</span>${editBtn}</li>`;
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
    ticketSearchSummary.textContent = parts.length ? `Ricerca attiva: ${parts.join(' · ')}` : 'Ricerca senza filtri: mostra tutti i ticket storici.';
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
  incidentTypeInput.value = btn.dataset.incident || '';
  if (btn.dataset.incidentId && incidentIdToNameMap[btn.dataset.incidentId]) {
    incidentTypeInput.value = incidentIdToNameMap[btn.dataset.incidentId];
  }
  if (ticketModalTitle) ticketModalTitle.textContent = incidentTypeInput.value || 'Nuovo Ticket';
  const severityCfg = incidentSeverityMap[incidentTypeInput.value] || { severity_default: 1, severity_mode: 'default' };
  const fallbackSeverity = Number(btn.dataset.severity || severityCfg.severity_default || 1);
  ticketSeveritySelect.value = String(fallbackSeverity);
  if (ticketSeverityGroup) ticketSeverityGroup.style.display = severityCfg.severity_mode === 'user' ? '' : 'none';
  ticketSeveritySelect.disabled = severityCfg.severity_mode !== 'user';
  if (ticketSeverityHint) {
    ticketSeverityHint.textContent = severityCfg.severity_mode === 'user'
      ? 'Severity selezionabile dall\'utente.'
      : 'Severity impostata di default dall\'admin.';
  }
  document.getElementById('description').value = btn.dataset.description || '';
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
    b.classList.toggle('active', b.textContent === fabValue.value);
  });
  if (deleteTicketBtn) deleteTicketBtn.style.display = 'inline-block';
  if (addSameIncidentBtn) addSameIncidentBtn.style.display = 'none';
  revealModal();
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
}

async function loadPreviousShifts() {
  if (previousShiftsLoaded || previousShiftsLoading) return;
  previousShiftsLoading = true;
  const data = await fetchJson('/api/tickets/previous-shifts');
  try {
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
  const [fabDay, fabYear, catDay, catYear, teamYear, severityYear] = await Promise.all([
    fetchJson('/api/stats/fab/current-day'),
    fetchJson(`/api/stats/fab/current-year?mode=${fabYearMode}`),
    fetchJson('/api/stats/category/current-day'),
    fetchJson(`/api/stats/category/current-year?mode=${catYearMode}`),
    fetchJson(`/api/stats/team/current-year?mode=${teamYearMode}`),
    fetchJson(`/api/stats/severity/current-year?mode=${severityYearMode}`)
  ]);
  renderChart(fabDayChart, fabDay.stats);
  renderChart(fabYearChart, fabYear.stats);
  renderChart(catDayChart, catDay.stats);
  renderChart(catYearChart, catYear.stats);
  renderChart(teamYearChart, teamYear.stats);
  renderChart(severityYearChart, severityYear.stats);
}

document.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeModal));
modal.addEventListener('mousedown', (e) => {
  overlayPressStarted = e.target === modal;
});
modal.addEventListener('mouseup', (e) => {
  if (e.target === modal && overlayPressStarted) closeModal();
  overlayPressStarted = false;
});
openAdminBtn.addEventListener('click', () => { window.location.href = '/admin.html'; });
logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

if (previousShiftsToggle) {
  previousShiftsToggle.addEventListener('click', async () => {
    const isOpen = previousShiftsToggle.getAttribute('aria-expanded') === 'true';
    previousShiftsToggle.setAttribute('aria-expanded', String(!isOpen));
    previousShiftsToggle.querySelector('.section-toggle-icon').textContent = isOpen ? '+' : '-';
    previousShiftsContent.hidden = isOpen;
    if (!isOpen && !previousShiftsLoaded) await loadPreviousShifts();
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
  const incident_name = incidentTypeInput.value;
  const incident_id = Number(incidentNameToIdMap[incident_name] || 0);
  const description = document.getElementById('description').value.trim();
  const fab = fabValue.value;
  const severity = Number(ticketSeveritySelect.value || 1);
  const ticket_time_local = ticketTimestampInput.value;
  if (!incident_id || !description || !fab || !ticket_time_local) return alert('Compila incident, descrizione, data/ora e FAB');
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
      const severityCfg = incidentSeverityMap[incident_name] || { severity_default: 1, severity_mode: 'default' };
      document.querySelectorAll('.extra-ticket-modal').forEach((panel) => {
        const extraDesc = panel.querySelector('.extra-description')?.value?.trim() || '';
        const extraFab = panel.querySelector('.extra-fab')?.value || '';
        const extraDt = panel.querySelector('.extra-datetime')?.value || '';
        if (!extraDesc || !extraFab || !extraDt) return;
        const userSeverity = panel.querySelector('.extra-severity')?.value;
        const extraSeverity = Number(userSeverity || panel.dataset.fixedSeverity || severityCfg.severity_default || 1);
        payloads.push({
          incident_id,
          description: extraDesc,
          fab: extraFab,
          ticket_time: new Date(extraDt).toISOString(),
          severity: extraSeverity
        });
      });

      const createdTickets = await Promise.all(payloads.map((payload) => fetchJson('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })));
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

(async function init() {
  document.querySelectorAll('.year-btn').forEach((btn) => { btn.textContent = String(currentYear); });
  loadChartTypes();
  await Promise.all([loadCurrentUser(), loadCategories(), loadUiColors()]);
  renderFabButtons();
  setupChartTypeControls();
  await loadDayTickets();
  startCurrentShiftAutoRefresh();
  deferWork(async () => {
    if (!previousShiftsLoaded && previousShiftsContent && !previousShiftsContent.hidden) {
      await loadPreviousShifts();
    }
    await loadCharts();
  });
})();

function applyTheme(theme){ document.body.classList.toggle('theme-dark', theme==='dark'); if(themeToggleBtn){ themeToggleBtn.setAttribute('aria-pressed', String(theme==='dark')); const thumb = themeToggleBtn.querySelector('.switch-thumb'); if(thumb) thumb.textContent = theme==='dark' ? 'D' : 'L'; }}
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
  if (!btn) return;
  handleEditTicketButton(btn);
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
  const incidentName = incidentTypeInput.value;
  if (!incidentName) return;
  createExtraTicketCard(incidentName);
  positionAddSameIncidentBtn();
});

window.addEventListener('resize', () => {
  applyMultiModalLayout();
  positionAddSameIncidentBtn();
});


