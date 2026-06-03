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
const currentYear = new Date().getFullYear();
const incidentCategoryMap = {};
const incidentNameToIdMap = {};
const incidentIdToNameMap = {};
const incidentPresetMap = {};
const incidentSeverityMap = {};
const incidentFabDefaultMap = {};
let editingTicketId = null;
let presetTokenState = [];
let extraTicketCounter = 0;
let modalCloseTimer = null;
let currentUser = null;
let previousShiftsLoaded = false;
let previousShiftsLoading = false;
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
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
}
let overlayPressStarted = false;

function positionAddSameIncidentBtn() {
  if (!modal || !addSameIncidentBtn || !mainTicketPanel) return;
  if (!modal.classList.contains('show')) return;
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
  const count = extraTicketModals.querySelectorAll('.extra-ticket-modal').length;
  const totalPanels = 1 + count;
  const cols = Math.min(Math.max(totalPanels, 1), 3);
  modal.classList.toggle('compact-modals', totalPanels >= 4);
  modal.classList.toggle('dense-modals', totalPanels >= 7);

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
    descriptionInput.placeholder = 'Inserisci descrizione problema...';
    descriptionInput.value = template || '';
    return;
  }

  const tokenState = tokens.map((token) => ({ ...token, value: '' }));
  composerContainer.style.display = 'flex';
  composerContainer.innerHTML = '';
  descriptionInput.readOnly = true;
  descriptionInput.placeholder = 'La descrizione verra compilata automaticamente dai campi sottostanti.';

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
      descriptionInput.value = buildDescriptionFromTemplate(template, tokenState, true);
    });
    fieldWrap.appendChild(input);
    composerContainer.appendChild(fieldWrap);
  });

  descriptionInput.value = buildDescriptionFromTemplate(template, tokenState, true);
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
  document.querySelectorAll('.fab-btn').forEach((b) => {
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
      document.querySelectorAll('.fab-btn').forEach((b) => b.classList.remove('active'));
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

function renderVerticalChart(target, stats) {
  const sortedStats = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  const max = Math.max(...sortedStats.map((x) => x.total), 1);
  const totalAll = sortedStats.reduce((sum, item) => sum + item.total, 0);
  target.innerHTML = '';
  const colorMap = new Map(sortedStats.map((item, index) => [item.label, colorByIndex(index)]));

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
    const color = colorMap.get(s.label);
    const pct = totalAll > 0 ? Math.round((s.total / totalAll) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'bar';
    row.innerHTML = `<span class="bar-value">${s.total}</span><div class="bar-fill" style="height:${h}px;background:${color}"><span class="bar-pct">${pct}%</span></div><span class="bar-label">${s.label}</span>`;
    barsWrap.appendChild(row);
  });

  inner.appendChild(axis);
  inner.appendChild(barsWrap);
  target.appendChild(inner);
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
    const categoryColor = colorForLabel(group.category);
    const fabColor = colorForLabel(group.fab);
    const li = document.createElement('li');
    const incidents = group.incidents
      .map((item) => {
        const isAnimated = animatedIds.has(Number(item.id));
        const editBtn = item.can_edit
          ? `<button type="button" class="edit-ticket-btn" data-ticket-id="${item.id}" data-incident-id="${item.incident_id || ''}" data-incident="${item.incident_name.replace(/"/g, '&quot;')}" data-description="${item.description.replace(/"/g, '&quot;')}" data-fab="${item.fab}" data-created-at="${item.created_at || ''}" data-severity="${item.severity || ''}">Modifica</button>`
          : '';
        return `<li class="${isAnimated ? 'ticket-new-entry' : ''}" data-ticket-id="${item.id}"><span class="incident-entry-text"><span class="incident-title">${item.incident_name}</span> - ${item.description}</span>${editBtn}</li>`;
      })
      .join('');
    li.innerHTML = `<strong class="ticket-category-label" style="color:${categoryColor}">${group.category}</strong> | <strong class="ticket-fab-label" style="color:${fabColor}">${group.fab}</strong><ul>${incidents}</ul>`;
    if (group.incidents.some((item) => animatedIds.has(Number(item.id)))) li.classList.add('ticket-new-group');
    ticketList.appendChild(li);
  });
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
    const categoryColor = colorForLabel(group.category);
    const fabColor = colorForLabel(group.fab);
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
    const categoryColor = colorForLabel(group.category);
    const fabColor = colorForLabel(group.fab);
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
    if (from || to) parts.push(`date ${from || '...'} → ${to || '...'}`);
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
  document.querySelectorAll('.fab-btn').forEach((b) => {
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

async function loadCharts() {
  const [fabDay, fabYear, catDay, catYear] = await Promise.all([
    fetchJson('/api/stats/fab/current-day'),
    fetchJson(`/api/stats/fab/current-year?mode=${fabYearMode}`),
    fetchJson('/api/stats/category/current-day'),
    fetchJson(`/api/stats/category/current-year?mode=${catYearMode}`)
  ]);
  renderVerticalChart(fabDayChart, fabDay.stats);
  renderVerticalChart(fabYearChart, fabYear.stats);
  renderVerticalChart(catDayChart, catDay.stats);
  renderVerticalChart(catYearChart, catYear.stats);
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
  await Promise.all([loadCurrentUser(), loadCategories()]);
  renderFabButtons();
  await loadDayTickets();
  deferWork(async () => {
    if (!previousShiftsLoaded && previousShiftsContent && !previousShiftsContent.hidden) {
      await loadPreviousShifts();
    }
    await loadCharts();
  });
})();

function applyTheme(theme){ document.body.classList.toggle('theme-dark', theme==='dark'); if(themeToggleBtn){ themeToggleBtn.setAttribute('aria-pressed', String(theme==='dark')); const thumb = themeToggleBtn.querySelector('.switch-thumb'); if(thumb) thumb.textContent = theme==='dark' ? '🌙' : '☀'; }}
const savedTheme = localStorage.getItem('theme') || 'light'; applyTheme(savedTheme);
if(themeToggleBtn){themeToggleBtn.addEventListener('click',()=>{const next=document.body.classList.contains('theme-dark')?'light':'dark'; localStorage.setItem('theme',next); applyTheme(next);});}




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
