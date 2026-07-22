const openAdminBtn = document.getElementById('openAdminBtn');

function getAvatarBadge(username) {
  try {
    const all = JSON.parse(localStorage.getItem('prodops_avatars_v1') || '{}');
    const emoji = username && all[username] ? all[username] : null;
    if (!emoji) return '';
    return '<span class="ticket-owner-avatar" aria-hidden="true">' + emoji + '</span>';
  } catch { return ''; }
}
const appBasePath = new URL(document.currentScript.src).pathname.split('/public/js/')[0];

function appUrl(path) {
  const normalizedPath = String(path || '').charAt(0) === '/' ? String(path || '') : '/' + String(path || '');
  if (!appBasePath || normalizedPath === appBasePath || normalizedPath.indexOf(appBasePath + '/') === 0) return normalizedPath;
  return appBasePath + normalizedPath;
}

const logoutBtn = document.getElementById('logoutBtn');
const ticketSearchForm = document.getElementById('ticketSearchForm');
const ticketSearchQueryInput = document.getElementById('ticketSearchQuery');
const ticketSearchFromInput = document.getElementById('ticketSearchFrom');
const ticketSearchToInput = document.getElementById('ticketSearchTo');
const ticketSearchResetBtn = document.getElementById('ticketSearchResetBtn');
const ticketSearchSummary = document.getElementById('ticketSearchSummary');
const ticketSearchResults = document.getElementById('ticketSearchResults');
const ticketSearchFabSelect = document.getElementById('ticketSearchFab');
const ticketSearchCategorySelect = document.getElementById('ticketSearchCategory');
const ticketSearchIncidentSelect = document.getElementById('ticketSearchIncident');
const ticketSearchAdvancedDetails = document.getElementById('ticketSearchAdvanced');
const ticketSearchAdvancedGrid = document.getElementById('ticketSearchAdvancedGrid');
const ticketSearchUserSelect = document.getElementById('ticketSearchUser');
const ticketSearchTeamSelect = document.getElementById('ticketSearchTeam');
const searchPinnedCount = document.getElementById('searchPinnedCount');
const searchPinnedList = document.getElementById('searchPinnedList');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchModal = document.getElementById('searchModal');
const searchModalTitle = document.getElementById('searchModalTitle');
const searchModalBody = document.getElementById('searchModalBody');
const searchModalEditBtn = document.getElementById('searchModalEditBtn');
const searchModalDeleteBtn = document.getElementById('searchModalDeleteBtn');

const incidentCategoryMap = {};
const incidentIdToCategoryMap = {};
const incidentIdToNameMap = {};
let currentUser = null;
let uiColors = null;
let currentPaletteId = 'blu';
let currentDarkMode = false;
let searchModalCloseTimer = null;
let categorySelectHandle = null;
let categoriesData = [];
let activeSearchModalTicketId = '';
let activeSearchModalTicket = null;
let searchModalEditMode = false;
let ticketSearchUserHandle = null;
let ticketSearchTeamHandle = null;
let incidentIdToPresetTemplateMap = {};
let advancedPresetFilterControls = [];

function releaseThemeSyncPending() {
  document.documentElement.classList.remove('theme-sync-pending');
}

const chartPalette = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#17becf', '#bcbd22', '#8c564b', '#e377c2', '#7f7f7f'
];

function colorByIndex(index) { return chartPalette[index % chartPalette.length]; }

function colorForLabel(label) {
  let hash = 0;
  const text = String(label || '');
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i);
  return colorByIndex(Math.abs(hash));
}

function makeSearchableSelect(select) {
  if (select.dataset.sdInit) return { update: function() {} };
  select.dataset.sdInit = '1';

  var placeholderText = '';
  var allItems = [];

  function syncItems() {
    allItems = [];
    placeholderText = '';
    for (var i = 0; i < select.options.length; i++) {
      var o = select.options[i];
      if (!o.value) { placeholderText = o.textContent; continue; }
      allItems.push({ value: o.value, text: o.textContent });
    }
  }
  syncItems();

  if (allItems.length <= 10) return null;

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

  function updateTriggerLabel() {
    var val = select.value;
    if (!val) {
      triggerLabel.textContent = placeholderText || 'Seleziona...';
      triggerLabel.classList.add('sd-placeholder');
    } else {
      var found = allItems.find(function(o) { return o.value === val; });
      triggerLabel.textContent = found ? found.text : val;
      triggerLabel.classList.remove('sd-placeholder');
    }
  }

  function renderList(q) {
    list.innerHTML = '';
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
        updateTriggerLabel();
        closePanel();
      });
      list.appendChild(li);
    });
  }

  function openPanel() {
    panel.hidden = false;
    wrapper.setAttribute('aria-expanded', 'true');
    search.value = '';
    renderList('');
    search.focus();
  }

  function closePanel() {
    panel.hidden = true;
    wrapper.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', function() {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  search.addEventListener('input', function() {
    renderList(search.value.trim().toLowerCase());
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

  return { update: updateTriggerLabel };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizePresetFieldKey(label) {
  return String(label || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
}

function parsePresetTokens(template) {
  const regex = /\[\[(texts?|select|dbselect|multi|timestamp):([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(String(template || ''))) !== null) {
    tokens.push({
      type: match[1],
      label: String(match[2] || '').trim(),
      raw: match[0]
    });
  }
  return tokens;
}

function extractPresetMarkerValues(description) {
  const values = [];
  const source = String(description || '');
  source.replace(/《([^》]*)》|ã€ˆ([^ã€‰]*)ã€‰/g, function(_, valueA, valueB) {
    values.push(String(valueA != null ? valueA : valueB || '').trim());
    return _;
  });
  return values;
}

function extractTicketPresetFieldMap(ticket) {
  const template = incidentIdToPresetTemplateMap[String(ticket?.incident_id || '')] || '';
  const tokens = parsePresetTokens(template);
  if (!tokens.length) return {};
  const markerValues = extractPresetMarkerValues(ticket?.description || '');
  const fieldMap = {};
  tokens.forEach((token, index) => {
    if (token.type !== 'select' && token.type !== 'dbselect') return;
    const key = normalizePresetFieldKey(token.label);
    if (!key) return;
    fieldMap[key] = markerValues[index] || '';
  });
  return fieldMap;
}

function syncSearchableSelect(select, handleRef) {
  if (!select) return handleRef || null;
  if (select._sdSyncTrigger) select._sdSyncTrigger();
  if (handleRef && typeof handleRef.update === 'function') {
    handleRef.update();
    return handleRef;
  }
  return makeSearchableSelect(select) || handleRef || null;
}

function refillSelect(select, placeholderText, values) {
  if (!select) return;
  while (select.options.length > 1) select.remove(1);
  if (select.options[0]) select.options[0].textContent = placeholderText;
  (values || []).forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value || '');
    option.textContent = String(value || '');
    select.appendChild(option);
  });
}

function formatPinnedDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPinnedDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function shortPinnedDescription(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function renderSearchPinnedList(pins) {
  if (!searchPinnedList) return;
  const list = Array.isArray(pins) ? pins : [];
  if (searchPinnedCount) searchPinnedCount.textContent = String(list.length);
  if (!list.length) {
    searchPinnedList.innerHTML = '<p class="sidebar-pinned-empty">Nessun ticket pinnato.</p>';
    return;
  }
  searchPinnedList.innerHTML = '';
  list.forEach((pin) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'sidebar-pinned-item';
    card.innerHTML =
      '<div class="sidebar-pinned-item-top">' +
        '<span class="sidebar-pinned-item-title">' + escapeHtml(pin.incidentName || ('Ticket #' + pin.id)) + '</span>' +
        (pin.fab ? '<span class="sidebar-pinned-item-fab">' + escapeHtml(pin.fab) + '</span>' : '') +
      '</div>' +
      (pin.description ? '<div class="sidebar-pinned-item-desc">' + escapeHtml(shortPinnedDescription(pin.description)) + '</div>' : '') +
      '<div class="sidebar-pinned-item-meta">' +
        '<span>' + escapeHtml(pin.category || 'Senza categoria') + '</span>' +
        '<span>' + escapeHtml(pin.pinUntil ? ('fino al ' + formatPinnedDate(pin.pinUntil)) : formatPinnedDateTime(pin.createdAt)) + '</span>' +
      '</div>';
    card.addEventListener('click', function() {
      openSearchModal({
        ticketId: pin.id,
        incidentId: pin.incidentId,
        incidentName: pin.incidentName,
        description: pin.description || '',
        fab: pin.fab || '',
        createdAt: pin.createdAt || '',
        severity: pin.severity || '',
        category: pin.category || '',
        ownerUsername: pin.ownerUsername || ''
      });
    });
    searchPinnedList.appendChild(card);
  });
}

async function refreshSearchPinnedTickets() {
  if (!searchPinnedList) return;
  try {
    if (searchPinnedList.children.length === 0) {
      searchPinnedList.innerHTML = '<p class="sidebar-pinned-empty">Caricamento...</p>';
    }
    const pins = await fetchJson('/api/pinned-tickets');
    renderSearchPinnedList(pins);
  } catch (error) {
    if (searchPinnedCount) searchPinnedCount.textContent = '0';
    searchPinnedList.innerHTML = '<p class="sidebar-pinned-empty">Errore caricamento.</p>';
  }
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
  return escapeHtml(text)
    .replace(/《([^》]*)》/g, function(_, value) { return renderPresetValueLink(value); })
    .replace(/ã€ˆ([^ã€‰]*)ã€‰/g, function(_, value) { return renderPresetValueLink(value); });
}

// Rendering sicuro della descrizione: mantiene il sottoinsieme HTML di
// formattazione, converte i marker 〈valore〉 in link e fa l'escape del resto.
function renderDescriptionHtmlText(text) {
  return escapeHtml(String(text == null ? '' : text))
    .replace(/《([^》]*)》/g, function(_, value) { return renderPresetValueLink(value); })
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
    renderDescriptionHtmlNode(child, out);
  }
}

function renderDescriptionHtml(raw) {
  var tpl = document.createElement('template');
  tpl.innerHTML = String(raw == null ? '' : raw);
  var out = [];
  renderDescriptionHtmlNode(tpl.content, out);
  return out.join('');
}

function defaultUiColors() {
  return {
    labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} } },
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
  const out = defaultUiColors();
  if (!input || typeof input !== 'object') return out;
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
  if (input?.layout && typeof input.layout === 'object') {
    const layoutDefaults = defaultUiColors().layout;
    Object.keys(layoutDefaults).forEach((lk) => {
      if (input.layout[lk] != null) {
        const val = Math.round(Number(input.layout[lk]));
        if (val > 0) out.layout[lk] = val;
      }
    });
  }
  return out;
}

function themeKey() { return document.body.classList.contains('theme-dark') ? 'dark' : 'light'; }

function getLabelColor(group, label) {
  const theme = themeKey();
  return normalizeHexColor(uiColors?.labels?.[group]?.[theme]?.[label]) || colorForLabel(String(label || ''));
}

function ticketMatchesLocal(ticket, query, categoryName) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return true;
  const fields = [
    ticket?.incident_name, categoryName, ticket?.description, ticket?.fab,
    ticket?.created_at, ticket?.incident_id != null ? String(ticket.incident_id) : '',
    ticket?.owner_team, ticket?.severity != null ? String(ticket.severity) : ''
  ];
  return fields.some((value) => String(value || '').toLowerCase().includes(needle));
}

async function loadUiColors() {
  const data = await fetchJson('/api/ui-colors');
  uiColors = normalizeUiColors(data.ui_colors || data || {});
}

function applyTheme(theme, paletteId) {
  const palette = paletteId || currentPaletteId || localStorage.getItem('palette') || 'blu';
  currentPaletteId = palette;
  currentDarkMode = theme === 'dark';
  ['cappuccino','bordeaux','verde','blu','giallo'].forEach(function(p) { document.body.classList.remove('theme-' + p); });
  if (palette !== 'blu') document.body.classList.add('theme-' + palette);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    const thumb = themeToggleBtn.querySelector('.switch-thumb');
    if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀';
  }
}

async function loadUserPreferences() {
  const data = await fetchJson('/api/user-charts');
  currentPaletteId = typeof data.palette === 'string' && data.palette ? data.palette : (localStorage.getItem('palette') || 'blu');
  currentDarkMode = !!data.dark_mode;
  localStorage.setItem('palette', currentPaletteId || 'blu');
  localStorage.setItem('dark-mode', currentDarkMode ? '1' : '');
  applyTheme(currentDarkMode ? 'dark' : 'light', currentPaletteId);
}

async function fetchJson(url, options) {
  const res = await fetch(appUrl(url), options);
  if (res.status === 401) { window.location.href = appUrl('/login.html'); throw new Error('Login richiesta'); }
  if (res.status === 403) { showToast('Non hai i permessi necessari per questa operazione. Contatta un amministratore.', 'error', 'Accesso negato'); throw new Error('Accesso non consentito'); }
  const text = (await res.text()).replace(/^﻿+/, '');
  try { return JSON.parse(text); } catch { throw new Error('Risposta JSON non valida'); }
}

function renderSearchModalBodyContent(ticket, editing) {
  const category = incidentIdToCategoryMap[String(ticket.incidentId || '')] || incidentCategoryMap[ticket.incidentName || ''] || '';
  const categoryColor = getLabelColor('categories', category);
  const fabColor = getLabelColor('fabs', ticket.fab || '');
  const d = new Date(ticket.createdAt);
  const pad = (v) => String(v).padStart(2, '0');
  const dtStr = isNaN(d.getTime()) ? '' :
    pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes());
  return '' +
    '<div class="ticket-row-top" style="margin-bottom:8px">' +
      (category ? '<span class="ticket-row-cat" style="color:' + categoryColor + '">' + escapeHtml(category) + '</span><span class="ticket-row-sep" aria-hidden="true"> | </span>' : '') +
      '<span class="ticket-row-fab" style="color:' + fabColor + ';font-weight:600">' + escapeHtml(String(ticket.fab || '')) + '</span>' +
    '</div>' +
    '<label>Descrizione</label>' +
    (editing
      ? '<textarea id="searchModalEditTextarea" rows="9" style="width:100%;padding:10px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;min-height:180px;margin-bottom:12px;resize:vertical">' + escapeHtml(ticket.description || '') + '</textarea>'
      : '<div class="ticket-read-desc" style="white-space:pre-wrap;padding:10px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;min-height:64px;margin-bottom:12px">' + renderDescriptionHtml(ticket.description || '') + '</div>') +
    (dtStr ? '<p class="muted" style="margin:0">Creato: ' + escapeHtml(dtStr) + '</p>' : '') +
    (ticket.ownerUsername ? '<p class="muted" style="margin:4px 0 0;display:flex;align-items:center;gap:4px">Da: ' + getAvatarBadge(ticket.ownerUsername) + escapeHtml(ticket.ownerUsername) + '</p>' : '');
}

function renderSearchModal(ticket, editing) {
  if (searchModalTitle) searchModalTitle.textContent = ticket.incidentName || 'Dettaglio Ticket';
  if (searchModalBody) searchModalBody.innerHTML = renderSearchModalBodyContent(ticket, editing);
  if (searchModalEditBtn) {
    searchModalEditBtn.style.display = (ticket.canEdit && isAdminUser()) ? '' : 'none';
    searchModalEditBtn.textContent = editing ? 'Salva testo' : 'Modifica testo';
    searchModalEditBtn.disabled = false;
  }
  if (searchModalDeleteBtn) {
    searchModalDeleteBtn.style.display = isAdminUser() ? '' : 'none';
    searchModalDeleteBtn.disabled = false;
    searchModalDeleteBtn.dataset.ticketId = activeSearchModalTicketId;
  }
}

function syncSearchResultTicket(ticket) {
  if (!ticketSearchResults || !ticket) return;
  const row = ticketSearchResults.querySelector('.ticket-row[data-ticket-id="' + String(ticket.ticketId || ticket.id || '') + '"]');
  if (!row) return;
  row.dataset.description = String(ticket.description || '');
  const desc = row.querySelector('.ticket-row-desc');
  if (desc) desc.innerHTML = renderDescriptionHtml(ticket.description || '');
}

function openSearchModal(ticket) {
  if (!searchModal) return;
  if (searchModalCloseTimer) { clearTimeout(searchModalCloseTimer); searchModalCloseTimer = null; }
  activeSearchModalTicketId = String(ticket.ticketId || '');
  activeSearchModalTicket = {
    ticketId: String(ticket.ticketId || ''),
    incidentId: Number(ticket.incidentId || 0),
    incidentName: String(ticket.incidentName || ''),
    description: String(ticket.description || ''),
    fab: String(ticket.fab || ''),
    createdAt: String(ticket.createdAt || ''),
    severity: Number(ticket.severity || 1),
    ownerUsername: String(ticket.ownerUsername || ''),
    canEdit: !!ticket.canEdit && isAdminUser()
  };
  searchModalEditMode = false;
  renderSearchModal(activeSearchModalTicket, false);
  searchModal.classList.remove('closing');
  searchModal.classList.add('show');
  searchModal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => searchModal.classList.add('active'));
}

function closeSearchModal() {
  if (!searchModal || (!searchModal.classList.contains('show') && !searchModal.classList.contains('active'))) return;
  if (searchModalCloseTimer) clearTimeout(searchModalCloseTimer);
  activeSearchModalTicketId = '';
  activeSearchModalTicket = null;
  searchModalEditMode = false;
  if (searchModalEditBtn) searchModalEditBtn.disabled = false;
  if (searchModalDeleteBtn) {
    searchModalDeleteBtn.disabled = false;
    searchModalDeleteBtn.dataset.ticketId = '';
  }
  searchModal.classList.remove('active');
  searchModal.classList.add('closing');
  searchModal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  searchModalCloseTimer = setTimeout(() => {
    searchModal.classList.remove('show', 'closing');
    searchModalCloseTimer = null;
  }, 260);
}

function isAdminUser() {
  return currentUser && currentUser.role === 'admin';
}

async function deleteSearchTicket(ticketId, triggerBtn) {
  if (!ticketId) return false;
  if (!(await showConfirm('Il ticket #' + ticketId + ' verrà eliminato definitivamente. L\'operazione non è reversibile.', { title: 'Elimina ticket', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return false;
  if (triggerBtn) triggerBtn.disabled = true;
  try {
    await fetchJson('/api/tickets/' + ticketId, { method: 'DELETE' });
    const row = ticketSearchResults ? ticketSearchResults.querySelector('.ticket-row[data-ticket-id="' + ticketId + '"]') : null;
    if (row) row.remove();
    const countEl = ticketSearchResults ? ticketSearchResults.querySelector('.ticket-search-count') : null;
    if (countEl) {
      const m = countEl.textContent.match(/(\d+)/);
      if (m) countEl.textContent = countEl.textContent.replace(/\d+/, String(Math.max(0, parseInt(m[1], 10) - 1)));
    }
    closeSearchModal();
    if (ticketSearchResults && !ticketSearchResults.querySelector('.ticket-row')) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Nessun ticket trovato con questi filtri.';
      ticketSearchResults.appendChild(empty);
    }
    refreshSearchPinnedTickets();
    return true;
  } catch (err) {
    showToast('Impossibile eliminare il ticket: ' + (err.message || err), 'error', 'Errore eliminazione');
    if (triggerBtn) triggerBtn.disabled = false;
    return false;
  }
}

async function saveSearchTicketDescription() {
  if (!activeSearchModalTicket || !activeSearchModalTicket.ticketId) return;
  const textarea = document.getElementById('searchModalEditTextarea');
  if (!textarea) return;
  const nextDescription = String(textarea.value || '').trim();
  if (!nextDescription) {
    showToast('La descrizione del ticket non può essere vuota.', 'warning', 'Campo obbligatorio');
    textarea.focus();
    return;
  }
  if (searchModalEditBtn) searchModalEditBtn.disabled = true;
  try {
    await fetchJson('/api/tickets/' + activeSearchModalTicket.ticketId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: Number(activeSearchModalTicket.incidentId || 0),
        incident_name: String(activeSearchModalTicket.incidentName || ''),
        description: nextDescription,
        fab: String(activeSearchModalTicket.fab || ''),
        ticket_time: String(activeSearchModalTicket.createdAt || ''),
        severity: Number(activeSearchModalTicket.severity || 1)
      })
    });
    activeSearchModalTicket.description = nextDescription;
    searchModalEditMode = false;
    renderSearchModal(activeSearchModalTicket, false);
    syncSearchResultTicket(activeSearchModalTicket);
    refreshSearchPinnedTickets();
    showToast('Testo ticket aggiornato.', 'success', 'Modifica salvata');
  } catch (error) {
    showToast('Impossibile salvare il ticket: ' + (error.message || error), 'error', 'Errore modifica');
    if (searchModalEditBtn) searchModalEditBtn.disabled = false;
  }
}

function renderSearchTickets(tickets) {
  if (!tickets.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Nessun ticket trovato con questi filtri.';
    return p;
  }

  const pad = (v) => String(v).padStart(2, '0');
  const ul = document.createElement('ul');
  ul.className = 'ticket-list ticket-list-scrollable';

  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  let prevMonthKey = null;

  tickets.forEach((t) => {
    const incidentId = Number(t.incident_id || 0);
    const incidentName = String(incidentIdToNameMap[String(incidentId)] || t.incident_name || '');
    const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
    const categoryColor = getLabelColor('categories', category);
    const fabColor = getLabelColor('fabs', t.fab);
    const description = String(t.description || '');
    const d = new Date(t.created_at);
    const dayMonth = isNaN(d.getTime()) ? '' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
    const hhmm = isNaN(d.getTime()) ? '' : pad(d.getHours()) + ':' + pad(d.getMinutes());
    const ownerUsername = String(t.owner_username || '');

    const monthKey = isNaN(d.getTime()) ? null : d.getFullYear() + '-' + (d.getMonth() + 1);
    if (monthKey && monthKey !== prevMonthKey) {
      prevMonthKey = monthKey;
      const sep = document.createElement('li');
      sep.className = 'ticket-search-month-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = monthNames[d.getMonth()] + ' ' + d.getFullYear();
      ul.appendChild(sep);
    }

    const li = document.createElement('li');
    li.className = 'ticket-row';
    li.dataset.ticketId = String(t.id);
    li.dataset.incidentId = String(t.incident_id || '');
    li.dataset.incident = incidentName;
    li.dataset.description = description;
    li.dataset.fab = String(t.fab || '');
    li.dataset.createdAt = String(t.created_at || '');
    li.dataset.severity = String(t.severity || '');
    li.dataset.category = category;
    li.dataset.ownerUsername = ownerUsername;
    li.dataset.canEdit = t.can_edit ? '1' : '0';
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
        (ownerUsername ? '<span class="ticket-row-owner">' + getAvatarBadge(ownerUsername) + escapeHtml(ownerUsername) + '</span>' : '') +
        '<span class="ticket-row-datetime">' + escapeHtml(dayMonth) + ' ' + escapeHtml(hhmm) + '</span>' +
        (t.can_edit ? '<button type="button" class="ticket-edit-btn" data-ticket-id="' + escapeHtml(String(t.id)) + '" title="Modifica testo ticket" aria-label="Modifica testo ticket">✎</button>' : '') +
        (isAdminUser() ? '<button type="button" class="ticket-delete-btn" data-ticket-id="' + escapeHtml(String(t.id)) + '" title="Elimina ticket" aria-label="Elimina ticket">✕</button>' : '') +
      '</div>';

    if (!isAdminUser()) {
      const editBtn = li.querySelector('.ticket-edit-btn');
      if (editBtn) editBtn.remove();
    }
    ul.appendChild(li);
  });

  return ul;
}

async function loadCategories() {
  const data = await fetchJson('/api/categories');
  Object.keys(incidentCategoryMap).forEach((k) => delete incidentCategoryMap[k]);
  Object.keys(incidentIdToCategoryMap).forEach((k) => delete incidentIdToCategoryMap[k]);
  Object.keys(incidentIdToNameMap).forEach((k) => delete incidentIdToNameMap[k]);
  Object.keys(incidentIdToPresetTemplateMap).forEach((k) => delete incidentIdToPresetTemplateMap[k]);
  data.forEach((cat) => {
    cat.incidents.forEach((inc) => {
      incidentCategoryMap[inc.name] = cat.name;
      incidentIdToCategoryMap[String(inc.id)] = cat.name;
      incidentIdToNameMap[String(inc.id)] = inc.name;
      incidentIdToPresetTemplateMap[String(inc.id)] = Array.isArray(inc.presets) && inc.presets.length ? String(inc.presets[0] || '') : '';
    });
  });

  if (ticketSearchCategorySelect) {
    while (ticketSearchCategorySelect.options.length > 1) ticketSearchCategorySelect.remove(1);
    data.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' })).forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      ticketSearchCategorySelect.appendChild(opt);
    });
    categorySelectHandle = makeSearchableSelect(ticketSearchCategorySelect);
  }

  // Il filtro Incident dipende dalla categoria: si abilita solo quando una
  // categoria è selezionata e mostra solo gli incident di quella categoria.
  categoriesData = data;
  if (ticketSearchCategorySelect) {
    ticketSearchCategorySelect.addEventListener('change', function () {
      populateIncidentsForCategory(ticketSearchCategorySelect.value);
    });
  }
  populateIncidentsForCategory(ticketSearchCategorySelect ? ticketSearchCategorySelect.value : '');
}

function populateAdvancedSearchFilters(meta) {
  const users = Array.isArray(meta?.users) ? meta.users.slice() : [];
  const teams = Array.isArray(meta?.teams) ? meta.teams.slice() : [];
  refillSelect(ticketSearchUserSelect, 'Tutti', users);
  refillSelect(ticketSearchTeamSelect, 'Tutti', teams);
  ticketSearchUserHandle = syncSearchableSelect(ticketSearchUserSelect, ticketSearchUserHandle);
  ticketSearchTeamHandle = syncSearchableSelect(ticketSearchTeamSelect, ticketSearchTeamHandle);

  advancedPresetFilterControls.forEach((entry) => {
    if (entry?.wrap?.parentNode) entry.wrap.parentNode.removeChild(entry.wrap);
  });
  advancedPresetFilterControls = [];

  const fields = Array.isArray(meta?.preset_fields) ? meta.preset_fields : [];
  fields.forEach((field) => {
    const key = normalizePresetFieldKey(field?.key || field?.label || '');
    const label = String(field?.label || key || '').trim();
    if (!ticketSearchAdvancedGrid || !key || !label) return;
    const wrap = document.createElement('div');
    const labelEl = document.createElement('label');
    const select = document.createElement('select');
    labelEl.setAttribute('for', 'ticketSearchPreset_' + key);
    labelEl.textContent = label;
    select.id = 'ticketSearchPreset_' + key;
    select.dataset.presetFieldKey = key;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Tutti';
    select.appendChild(placeholder);
    (Array.isArray(field.options) ? field.options : []).forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = String(optionValue || '');
      option.textContent = String(optionValue || '');
      select.appendChild(option);
    });
    wrap.appendChild(labelEl);
    wrap.appendChild(select);
    ticketSearchAdvancedGrid.appendChild(wrap);
    advancedPresetFilterControls.push({
      key,
      label,
      wrap,
      select,
      handle: makeSearchableSelect(select) || null
    });
  });
}

async function loadSearchFilterOptions() {
  const data = await fetchJson('/api/search-filter-options');
  populateAdvancedSearchFilters(data || {});
}

// Popola (e abilita/disabilita) il select Incident in base alla categoria scelta.
function populateIncidentsForCategory(categoryName) {
  const select = ticketSearchIncidentSelect;
  if (!select) return;
  while (select.options.length > 1) select.remove(1);
  const placeholder = select.options[0];
  select.value = '';

  if (!categoryName) {
    if (placeholder) placeholder.textContent = 'Seleziona prima una categoria';
    select.disabled = true;
    return;
  }

  const cat = categoriesData.find((c) => String(c.name) === String(categoryName));
  const incidents = (cat && Array.isArray(cat.incidents)) ? cat.incidents.slice() : [];
  incidents.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }));
  incidents.forEach((inc) => {
    const opt = document.createElement('option');
    opt.value = String(inc.id);
    opt.textContent = inc.name;
    select.appendChild(opt);
  });
  if (placeholder) placeholder.textContent = 'Tutti';
  select.disabled = false;
}

async function runTicketSearch() {
  const query = ticketSearchQueryInput?.value?.trim() || '';
  const from = ticketSearchFromInput?.value || '';
  const to = ticketSearchToInput?.value || '';
  const filterFab = ticketSearchFabSelect?.value || '';
  const filterCategory = ticketSearchCategorySelect?.value || '';
  const filterIncidentId = ticketSearchIncidentSelect?.value || '';
  const filterOwner = ticketSearchUserSelect?.value || '';
  const filterTeam = ticketSearchTeamSelect?.value || '';
  const activePresetFilters = advancedPresetFilterControls
    .map((entry) => ({ key: entry.key, label: entry.label, value: entry.select?.value || '' }))
    .filter((entry) => entry.value);
  if (ticketSearchAdvancedDetails && (filterOwner || filterTeam || activePresetFilters.length)) ticketSearchAdvancedDetails.open = true;
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  if (ticketSearchSummary) {
    const parts = [];
    if (query) parts.push(`parole chiave "${query}"`);
    if (from || to) parts.push(`date ${from || '...'} → ${to || '...'}`);
    if (filterFab) parts.push(`FAB: ${filterFab}`);
    if (filterCategory) parts.push(`categoria: ${filterCategory}`);
    if (filterIncidentId) {
      const incName = incidentIdToNameMap[filterIncidentId] || `incident #${filterIncidentId}`;
      parts.push(`incident: ${incName}`);
    }
    if (filterOwner) parts.push(`utente: ${filterOwner}`);
    if (filterTeam) parts.push(`team: ${filterTeam}`);
    activePresetFilters.forEach((entry) => parts.push(`${entry.label}: ${entry.value}`));
    ticketSearchSummary.textContent = parts.length ? `Ricerca attiva: ${parts.join(' · ')}` : 'Ricerca senza filtri: mostra tutti i ticket storici.';
  }
  let data = await fetchJson(`/api/tickets/search${suffix}`);
  let results = data.tickets || [];
  let usedLocalFallback = false;

  if (query && !results.length) {
    const allParams = new URLSearchParams();
    if (from) allParams.set('from', from);
    if (to) allParams.set('to', to);
    const allSuffix = allParams.toString() ? `?${allParams.toString()}` : '';
    const allData = await fetchJson(`/api/tickets/search${allSuffix}`);
    results = (allData.tickets || []).filter((ticket) => {
      const incidentId = Number(ticket.incident_id || 0);
      const incidentName = String(incidentIdToNameMap[String(incidentId)] || ticket.incident_name || '');
      const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || 'Categoria non definita';
      if (from || to) {
        const created = ticket?.created_at ? new Date(ticket.created_at).getTime() : NaN;
        if (from) {
          const fromTime = new Date(`${from}T00:00:00`).getTime();
          if (!Number.isNaN(fromTime) && !Number.isNaN(created) && created < fromTime) return false;
        }
        if (to) {
          const toTime = new Date(`${to}T23:59:59`).getTime();
          if (!Number.isNaN(toTime) && !Number.isNaN(created) && created > toTime) return false;
        }
      }
      return ticketMatchesLocal(ticket, query, category);
    });
    data = { ...allData, count: results.length };
    usedLocalFallback = true;
  }

  if (filterFab || filterCategory || filterIncidentId || filterOwner || filterTeam || activePresetFilters.length) {
    results = results.filter((ticket) => {
      if (filterFab && String(ticket.fab || '') !== filterFab) return false;
      if (filterIncidentId && String(ticket.incident_id || '') !== filterIncidentId) return false;
      if (filterOwner && String(ticket.owner_username || '') !== filterOwner) return false;
      if (filterTeam && String(ticket.owner_team || '') !== filterTeam) return false;
      if (filterCategory) {
        const incidentId = Number(ticket.incident_id || 0);
        const incidentName = String(incidentIdToNameMap[String(incidentId)] || ticket.incident_name || '');
        const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || '';
        if (category !== filterCategory) return false;
      }
      if (activePresetFilters.length) {
        const presetFieldMap = extractTicketPresetFieldMap(ticket);
        for (let i = 0; i < activePresetFilters.length; i += 1) {
          const entry = activePresetFilters[i];
          if (String(presetFieldMap[entry.key] || '') !== entry.value) return false;
        }
      }
      return true;
    });
    data = Object.assign({}, data, { count: results.length });
    usedLocalFallback = true;
  }

  if (ticketSearchResults) {
    ticketSearchResults.innerHTML = '';
    const countP = document.createElement('p');
    countP.className = 'ticket-search-count';
    countP.textContent = `${results.length} ticket trovati${usedLocalFallback ? ' (filtrato in locale)' : ''}.`;
    ticketSearchResults.appendChild(countP);
    ticketSearchResults.appendChild(renderSearchTickets(results));
  }
}

function chartDimensionLabelIt(dim) {
  const map = { fab: 'FAB', category: 'Categoria', team: 'Team', severity: 'Severità', user: 'Utente', incident: 'Incident' };
  return map[dim] || dim;
}

// Ricerca proveniente dal click su un grafico della dashboard: usa /api/tickets/lookup
// con gli stessi parametri (dimensione+valore o intervallo start/end), poi mostra
// i risultati nella pagina Cerca ticket.
async function runChartLookup(sp) {
  const params = new URLSearchParams();
  ['dimension', 'value', 'window', 'scope', 'start', 'end'].forEach((k) => {
    const v = sp.get(k);
    if (v) params.set(k, v);
  });
  for (const [k, v] of sp.entries()) {
    if (k.indexOf('filter_') === 0) params.append(k, v);
  }

  const dimension = sp.get('dimension') || '';
  const value = sp.get('value') || '';
  const start = sp.get('start') || '';
  const end = sp.get('end') || '';

  // Riflette i filtri nei controlli visibili, dove possibile.
  if (dimension === 'fab' && ticketSearchFabSelect) ticketSearchFabSelect.value = value;
  if (dimension === 'category' && ticketSearchCategorySelect) {
    ticketSearchCategorySelect.value = value;
    if (categorySelectHandle) categorySelectHandle.update();
    populateIncidentsForCategory(value);
  }
  if ((start || end) && ticketSearchFromInput && ticketSearchToInput) {
    const toDate = (iso) => { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10); };
    if (start) ticketSearchFromInput.value = toDate(start);
    // end e' esclusivo: mostro il giorno precedente come "a"
    if (end) { const d = new Date(end); d.setUTCDate(d.getUTCDate() - 1); ticketSearchToInput.value = isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10); }
  }

  if (ticketSearchSummary) {
    const parts = [];
    if (dimension && value) parts.push(chartDimensionLabelIt(dimension) + ': ' + value);
    if (start || end) parts.push('periodo ' + (ticketSearchFromInput?.value || '...') + ' → ' + (ticketSearchToInput?.value || '...'));
    ticketSearchSummary.textContent = 'Dal grafico → ' + (parts.length ? parts.join(' · ') : 'tutti i ticket del periodo');
  }

  const data = await fetchJson('/api/tickets/lookup?' + params.toString());
  const results = data.tickets || [];
  if (ticketSearchResults) {
    ticketSearchResults.innerHTML = '';
    const countP = document.createElement('p');
    countP.className = 'ticket-search-count';
    countP.textContent = results.length + ' ticket trovati.';
    ticketSearchResults.appendChild(countP);
    ticketSearchResults.appendChild(renderSearchTickets(results));
  }
}

function applyTicketSearchListeners() {
  ticketSearchForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await runTicketSearch(); } catch (error) {
      if (ticketSearchSummary) ticketSearchSummary.textContent = `Errore ricerca: ${error.message || error}`;
      if (ticketSearchResults) ticketSearchResults.innerHTML = '';
    }
  });

  ticketSearchResetBtn?.addEventListener('click', () => {
    if (ticketSearchQueryInput) ticketSearchQueryInput.value = '';
    if (ticketSearchFromInput) ticketSearchFromInput.value = '';
    if (ticketSearchToInput) ticketSearchToInput.value = '';
    if (ticketSearchFabSelect) ticketSearchFabSelect.value = '';
    if (ticketSearchCategorySelect) ticketSearchCategorySelect.value = '';
    if (ticketSearchUserSelect) ticketSearchUserSelect.value = '';
    if (ticketSearchTeamSelect) ticketSearchTeamSelect.value = '';
    advancedPresetFilterControls.forEach((entry) => {
      if (entry.select) entry.select.value = '';
      if (entry.handle && typeof entry.handle.update === 'function') entry.handle.update();
      else if (entry.select && entry.select._sdSyncTrigger) entry.select._sdSyncTrigger();
    });
    if (categorySelectHandle) categorySelectHandle.update();
    if (ticketSearchUserHandle) ticketSearchUserHandle.update();
    if (ticketSearchTeamHandle) ticketSearchTeamHandle.update();
    populateIncidentsForCategory('');
    if (ticketSearchSummary) ticketSearchSummary.textContent = 'Nessuna ricerca avviata.';
    if (ticketSearchResults) ticketSearchResults.innerHTML = '';
  });

  ticketSearchResults?.addEventListener('click', async (e) => {
    if (e.target.closest('.preset-value-link')) return;

    const deleteBtn = e.target.closest('.ticket-delete-btn');
    if (deleteBtn) {
      e.stopPropagation();
      const ticketId = deleteBtn.dataset.ticketId;
      if (!(await showConfirm('Il ticket #' + ticketId + ' verrà eliminato definitivamente. L\'operazione non è reversibile.', { title: 'Elimina ticket', type: 'error', confirmText: 'Elimina', cancelText: 'Annulla' }))) return;
      deleteBtn.disabled = true;
      try {
        await fetchJson('/api/tickets/' + ticketId, { method: 'DELETE' });
        const row = deleteBtn.closest('.ticket-row');
        if (row) row.remove();
        const countEl = ticketSearchResults.querySelector('.ticket-search-count');
        if (countEl) {
          const m = countEl.textContent.match(/(\d+)/);
          if (m) countEl.textContent = countEl.textContent.replace(/\d+/, String(Math.max(0, parseInt(m[1]) - 1)));
        }
      } catch (err) {
        showToast('Impossibile eliminare il ticket: ' + (err.message || err), 'error', 'Errore eliminazione');
        deleteBtn.disabled = false;
      }
      return;
    }

    const card = e.target.closest('.ticket-row');
    if (!card) return;
    openSearchModal({
      ticketId: card.dataset.ticketId,
      incidentId: card.dataset.incidentId,
      incidentName: card.dataset.incident,
      description: card.dataset.description,
      fab: card.dataset.fab,
      createdAt: card.dataset.createdAt,
      severity: card.dataset.severity,
      category: card.dataset.category,
      ownerUsername: card.dataset.ownerUsername || '',
      canEdit: (card.dataset.canEdit === '1') && isAdminUser()
    });
  });

  if (searchModal) {
    searchModal.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeSearchModal));
    searchModalEditBtn?.addEventListener('click', async () => {
      if (!activeSearchModalTicket || !activeSearchModalTicket.canEdit) return;
      if (!searchModalEditMode) {
        searchModalEditMode = true;
        renderSearchModal(activeSearchModalTicket, true);
        const textarea = document.getElementById('searchModalEditTextarea');
        if (textarea) textarea.focus();
        return;
      }
      await saveSearchTicketDescription();
    });
    searchModalDeleteBtn?.addEventListener('click', async () => {
      if (!isAdminUser()) return;
      await deleteSearchTicket(activeSearchModalTicketId || searchModalDeleteBtn.dataset.ticketId || '', searchModalDeleteBtn);
    });
    let overlayPress = false;
    searchModal.addEventListener('mousedown', (e) => { overlayPress = e.target === searchModal; });
    searchModal.addEventListener('mouseup', (e) => { if (e.target === searchModal && overlayPress) closeSearchModal(); overlayPress = false; });
  }
}

(async function init() {
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async () => {
      const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      localStorage.setItem('dark-mode', next === 'dark' ? '1' : '');
      currentDarkMode = next === 'dark';
      applyTheme(next, currentPaletteId);
      try {
        await fetchJson('/api/user-charts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ palette: currentPaletteId, dark_mode: currentDarkMode })
        });
      } catch (error) {}
      if (ticketSearchResults && ticketSearchResults.querySelector('.ticket-row')) {
        await runTicketSearch();
      }
    });
  }
  openAdminBtn?.addEventListener('click', () => { window.location.href = appUrl('/admin.html'); });
  logoutBtn?.addEventListener('click', async () => {
    await fetch(appUrl('/api/logout'), { method: 'POST' });
    window.location.href = appUrl('/login.html');
  });
  try {
    await loadUserPreferences();
  } catch (error) {
    console.error(error);
    const savedTheme = localStorage.getItem('dark-mode') === '1' ? 'dark' : 'light';
    applyTheme(savedTheme, localStorage.getItem('palette') || 'blu');
  } finally {
    releaseThemeSyncPending();
  }
  await loadUiColors();
  const me = await fetchJson('/api/me');
  currentUser = me.user;
  if (openAdminBtn) openAdminBtn.style.display = currentUser?.role === 'admin' ? '' : 'none';
  refreshSearchPinnedTickets();
  // Idrata la cache locale con gli avatar (dal server) per i badge nei ticket, cross-browser.
  try {
    const av = await fetchJson('/api/user-avatars');
    const map = (av && av.avatars) || {};
    const all = JSON.parse(localStorage.getItem('prodops_avatars_v1') || '{}');
    Object.keys(map).forEach((u) => { if (map[u]) all[u] = map[u]; });
    localStorage.setItem('prodops_avatars_v1', JSON.stringify(all));
  } catch (error) {}
  await loadCategories();
  await loadSearchFilterOptions();
  const _today = new Date();
  const _pad = function(n) { return String(n).padStart(2, '0'); };
  const _monthStart = _today.getFullYear() + '-' + _pad(_today.getMonth() + 1) + '-01';
  const _todayStr = _today.getFullYear() + '-' + _pad(_today.getMonth() + 1) + '-' + _pad(_today.getDate());
  if (ticketSearchFromInput) ticketSearchFromInput.value = _monthStart;
  if (ticketSearchToInput) ticketSearchToInput.value = _todayStr;
  applyTicketSearchListeners();
  const sp = new URLSearchParams(window.location.search);
  const initialQuery = sp.get('query');
  if (sp.get('dimension') || sp.get('start') || sp.get('end')) {
    // Arrivo dal click su un grafico della dashboard.
    try { await runChartLookup(sp); } catch (error) {
      if (ticketSearchSummary) ticketSearchSummary.textContent = 'Errore ricerca: ' + (error.message || error);
    }
  } else if (initialQuery && ticketSearchQueryInput) {
    ticketSearchQueryInput.value = initialQuery;
    await runTicketSearch();
  }
})();
