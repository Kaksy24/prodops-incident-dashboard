const openAdminBtn = document.getElementById('openAdminBtn');
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
const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchModal = document.getElementById('searchModal');
const searchModalTitle = document.getElementById('searchModalTitle');
const searchModalBody = document.getElementById('searchModalBody');

const incidentCategoryMap = {};
const incidentIdToCategoryMap = {};
const incidentIdToNameMap = {};
let currentUser = null;
let uiColors = null;
let searchModalCloseTimer = null;

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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function highlightPresetValues(text) {
  return escapeHtml(text).replace(/《([^》]*)》/g, '<mark class="preset-value">$1</mark>');
}

function defaultUiColors() {
  return { labels: { categories: { light: {}, dark: {} }, fabs: { light: {}, dark: {} } } };
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

function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    const thumb = themeToggleBtn.querySelector('.switch-thumb');
    if (thumb) thumb.textContent = theme === 'dark' ? 'D' : 'L';
  }
}

async function fetchJson(url, options) {
  const res = await fetch(appUrl(url), options);
  if (res.status === 401) { window.location.href = appUrl('/login.html'); throw new Error('Login richiesta'); }
  if (res.status === 403) { alert('Non hai i permessi per questa operazione.'); throw new Error('Accesso non consentito'); }
  const text = (await res.text()).replace(/^﻿+/, '');
  try { return JSON.parse(text); } catch { throw new Error('Risposta JSON non valida'); }
}

function openSearchModal(ticket) {
  if (!searchModal) return;
  if (searchModalCloseTimer) { clearTimeout(searchModalCloseTimer); searchModalCloseTimer = null; }
  const category = incidentIdToCategoryMap[String(ticket.incidentId || '')] || incidentCategoryMap[ticket.incidentName || ''] || '';
  const categoryColor = getLabelColor('categories', category);
  const fabColor = getLabelColor('fabs', ticket.fab || '');
  const d = new Date(ticket.createdAt);
  const pad = (v) => String(v).padStart(2, '0');
  const dtStr = isNaN(d.getTime()) ? '' :
    pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
    pad(d.getHours()) + ':' + pad(d.getMinutes());
  if (searchModalTitle) searchModalTitle.textContent = ticket.incidentName || 'Dettaglio Ticket';
  if (searchModalBody) {
    searchModalBody.innerHTML =
      '<div class="ticket-row-top" style="margin-bottom:8px">' +
        (category ? '<span class="ticket-row-cat" style="color:' + categoryColor + '">' + escapeHtml(category) + '</span><span class="ticket-row-sep" aria-hidden="true"> | </span>' : '') +
        '<span class="ticket-row-fab" style="color:' + fabColor + ';font-weight:600">' + escapeHtml(String(ticket.fab || '')) + '</span>' +
      '</div>' +
      '<label>Descrizione</label>' +
      '<div class="ticket-read-desc" style="white-space:pre-wrap;padding:10px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;min-height:64px;margin-bottom:12px">' +
        highlightPresetValues(ticket.description || '') +
      '</div>' +
      (dtStr ? '<p class="muted" style="margin:0">Creato: ' + escapeHtml(dtStr) + '</p>' : '') +
      (ticket.ownerUsername ? '<p class="muted" style="margin:4px 0 0">Da: ' + escapeHtml(ticket.ownerUsername) + '</p>' : '');
  }
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
        '<span class="ticket-row-datetime">' + escapeHtml(dayMonth) + ' ' + escapeHtml(hhmm) + '</span>' +
      '</div>';

    ul.appendChild(li);
  });

  return ul;
}

async function loadCategories() {
  const data = await fetchJson('/api/categories');
  Object.keys(incidentCategoryMap).forEach((k) => delete incidentCategoryMap[k]);
  Object.keys(incidentIdToCategoryMap).forEach((k) => delete incidentIdToCategoryMap[k]);
  Object.keys(incidentIdToNameMap).forEach((k) => delete incidentIdToNameMap[k]);
  data.forEach((cat) => {
    cat.incidents.forEach((inc) => {
      incidentCategoryMap[inc.name] = cat.name;
      incidentIdToCategoryMap[String(inc.id)] = cat.name;
      incidentIdToNameMap[String(inc.id)] = inc.name;
    });
  });

  if (ticketSearchCategorySelect) {
    while (ticketSearchCategorySelect.options.length > 1) ticketSearchCategorySelect.remove(1);
    data.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      ticketSearchCategorySelect.appendChild(opt);
    });
  }

  if (ticketSearchIncidentSelect) {
    while (ticketSearchIncidentSelect.options.length > 1) ticketSearchIncidentSelect.remove(1);
    data.forEach((cat) => {
      cat.incidents.forEach((inc) => {
        const opt = document.createElement('option');
        opt.value = String(inc.id);
        opt.textContent = inc.name;
        ticketSearchIncidentSelect.appendChild(opt);
      });
    });
  }
}

async function runTicketSearch() {
  const query = ticketSearchQueryInput?.value?.trim() || '';
  const from = ticketSearchFromInput?.value || '';
  const to = ticketSearchToInput?.value || '';
  const filterFab = ticketSearchFabSelect?.value || '';
  const filterCategory = ticketSearchCategorySelect?.value || '';
  const filterIncidentId = ticketSearchIncidentSelect?.value || '';
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

  if (filterFab || filterCategory || filterIncidentId) {
    results = results.filter((ticket) => {
      if (filterFab && String(ticket.fab || '') !== filterFab) return false;
      if (filterIncidentId && String(ticket.incident_id || '') !== filterIncidentId) return false;
      if (filterCategory) {
        const incidentId = Number(ticket.incident_id || 0);
        const incidentName = String(incidentIdToNameMap[String(incidentId)] || ticket.incident_name || '');
        const category = incidentIdToCategoryMap[String(incidentId)] || incidentCategoryMap[incidentName] || '';
        if (category !== filterCategory) return false;
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
    if (ticketSearchIncidentSelect) ticketSearchIncidentSelect.value = '';
    if (ticketSearchSummary) ticketSearchSummary.textContent = 'Nessuna ricerca avviata.';
    if (ticketSearchResults) ticketSearchResults.innerHTML = '';
  });

  ticketSearchResults?.addEventListener('click', (e) => {
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
      ownerUsername: card.dataset.ownerUsername || ''
    });
  });

  if (searchModal) {
    searchModal.querySelectorAll('.close-modal').forEach((b) => b.addEventListener('click', closeSearchModal));
    let overlayPress = false;
    searchModal.addEventListener('mousedown', (e) => { overlayPress = e.target === searchModal; });
    searchModal.addEventListener('mouseup', (e) => { if (e.target === searchModal && overlayPress) closeSearchModal(); overlayPress = false; });
  }
}

(async function init() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async () => {
      const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
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
  await loadUiColors();
  const me = await fetchJson('/api/me');
  currentUser = me.user;
  if (openAdminBtn) openAdminBtn.style.display = currentUser?.role === 'admin' ? '' : 'none';
  await loadCategories();
  applyTicketSearchListeners();
})();
