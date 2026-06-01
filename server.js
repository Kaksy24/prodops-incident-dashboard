require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT || 5500);
const FABS = ['M5', 'L1', 'EWS', 'WSIC', 'NRK'];
const OPS_TIMEZONE = 'Europe/Rome';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
const authSecret = process.env.AUTH_SECRET || supabaseKey || 'prodops-dev-secret';
const fallbackUsers = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'user', password: 'user', role: 'user' }
];
let ticketSeveritySupported = null;
let incidentSeveritySupported = null;
let incidentFabDefaultSupported = null;
let incidentSortSupported = null;
let usersTableSupported = null;
let ticketOwnerSupported = null;

app.use(express.json());

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((acc, item) => {
    const [rawName, ...rawValue] = item.trim().split('=');
    if (!rawName) return acc;
    acc[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

function signAuthPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', authSecret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function readAuthUser(req) {
  const token = parseCookies(req).prodops_auth;
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', authSecret).update(body).digest('base64url');
  if (!sig || sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.username || !payload.role || Date.now() > Number(payload.exp || 0)) return null;
    return { id: Number(payload.id || 0), username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

function authCookieOptions(req) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 8 * 60 * 60 * 1000
  };
}

function isMissingTableError(error, tableName) {
  const msg = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    (tableName && msg.includes(String(tableName).toLowerCase()) && msg.includes('does not exist'))
  );
}

function isMissingColumnError(error, columnName) {
  const msg = String(error?.message || '').toLowerCase();
  const column = String(columnName || '').toLowerCase();
  return (
    error?.code === '42703' ||
    error?.code === 'PGRST204' ||
    (column && msg.includes(column) && (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('not found')))
  );
}

function isNoRowsError(error) {
  return error?.code === 'PGRST116' || String(error?.message || '').toLowerCase().includes('0 rows');
}

function ticketWithPermissions(ticket, user) {
  const ownerUserId = Number(ticket?.owner_user_id);
  const currentUserId = Number(user?.id);
  const canEdit = Number.isFinite(ownerUserId)
    && ownerUserId > 0
    && Number.isFinite(currentUserId)
    && ownerUserId === currentUserId;
  return {
    ...ticket,
    owner_user_id: Number.isFinite(ownerUserId) && ownerUserId > 0 ? ownerUserId : null,
    can_edit: canEdit
  };
}

async function fetchDbUsers() {
  const { data, error } = await supabase
    .from('app_users')
    .select('id,username,password,role')
    .order('id', { ascending: true });
  if (error) {
    if (isMissingTableError(error, 'app_users')) {
      usersTableSupported = false;
      return null;
    }
    throw error;
  }
  usersTableSupported = true;
  return data || [];
}

async function getAuthUsers() {
  const dbUsers = await fetchDbUsers();
  if (!dbUsers) return fallbackUsers;
  if (!dbUsers.length) return fallbackUsers;
  return dbUsers;
}

async function ensureDefaultUsers() {
  const dbUsers = await fetchDbUsers();
  if (!dbUsers) return;
  const exists = new Set((dbUsers || []).map((u) => String(u.username).toLowerCase()));
  const toInsert = fallbackUsers
    .filter((u) => !exists.has(u.username.toLowerCase()))
    .map((u) => ({ username: u.username, password: u.password, role: u.role }));
  if (!toInsert.length) return;
  const { error } = await supabase.from('app_users').insert(toInsert);
  if (error) throw error;
}

function requirePageAuth(role = 'user') {
  return (req, res, next) => {
    const user = readAuthUser(req);
    if (!user) return res.redirect('/login.html');
    if (role === 'admin' && user.role !== 'admin') return res.redirect('/index.html');
    req.user = user;
    next();
  };
}

function requireApiAuth(role = 'user') {
  return (req, res, next) => {
    const user = readAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Login richiesta' });
    if (role === 'admin' && user.role !== 'admin') return res.status(403).json({ error: 'Accesso admin richiesto' });
    req.user = user;
    next();
  };
}

app.post('/api/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const normalizedUsername = username.toLowerCase();
  const password = String(req.body.password || '').trim();
  let users;
  try {
    users = await getAuthUsers();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Errore lettura utenti' });
  }
  let account = users.find((u) => String(u.username || '').toLowerCase() === normalizedUsername && String(u.password || '') === password);
  if (!account) {
    try {
      await ensureDefaultUsers();
      users = await getAuthUsers();
      account = users.find((u) => String(u.username || '').toLowerCase() === normalizedUsername && String(u.password || '') === password);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Errore validazione utenti' });
    }
  }
  if (!account) return res.status(401).json({ error: 'Credenziali non valide' });

  const token = signAuthPayload({
    id: Number(account.id),
    username,
    role: account.role,
    exp: Date.now() + (8 * 60 * 60 * 1000)
  });
  res.cookie('prodops_auth', token, authCookieOptions(req));
  res.json({ id: Number(account.id), username, role: account.role, redirectTo: account.role === 'admin' ? '/admin.html' : '/index.html' });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('prodops_auth', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/me', requireApiAuth(), (req, res) => {
  res.json({ user: req.user });
});

app.get(['/', '/index.html'], requirePageAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin.html', requirePageAuth('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname, { index: false }));

function currentDayBounds(now = new Date()) {
  const d = new Date(now);
  const p = getZonedParts(d, OPS_TIMEZONE);
  const startTodayUtc = zonedLocalToUtc({ year: p.year, month: p.month, day: p.day, hour: 6, minute: 10, second: 0 }, OPS_TIMEZONE);
  if (d >= startTodayUtc) {
    const endUtc = zonedLocalToUtc({ year: p.year, month: p.month, day: p.day + 1, hour: 6, minute: 10, second: 0 }, OPS_TIMEZONE);
    return { start: startTodayUtc.toISOString(), end: endUtc.toISOString() };
  }
  const prevStartUtc = zonedLocalToUtc({ year: p.year, month: p.month, day: p.day - 1, hour: 6, minute: 10, second: 0 }, OPS_TIMEZONE);
  return { start: prevStartUtc.toISOString(), end: startTodayUtc.toISOString() };
}

function getZonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const parts = dtf.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function getTimeZoneOffsetMs(date, timeZone) {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function zonedLocalToUtc(parts, timeZone) {
  let utcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour || 0, parts.minute || 0, parts.second || 0);
  for (let i = 0; i < 2; i += 1) {
    const offset = getTimeZoneOffsetMs(new Date(utcMs), timeZone);
    utcMs -= offset;
  }
  return new Date(utcMs);
}

function currentOperationalShifts(now = new Date()) {
  const { start } = currentDayBounds(now);
  const dayStart = new Date(start);
  const shifts = [
    { key: 'morning', label: 'Turno Mattina 06:10 - 14:10', start: dayStart, end: new Date(dayStart.getTime() + 8 * 60 * 60 * 1000) },
    { key: 'afternoon', label: 'Turno Pomeriggio 14:10 - 22:10', start: new Date(dayStart.getTime() + 8 * 60 * 60 * 1000), end: new Date(dayStart.getTime() + 16 * 60 * 60 * 1000) },
    { key: 'night', label: 'Turno Notte 22:10 - 06:10', start: new Date(dayStart.getTime() + 16 * 60 * 60 * 1000), end: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) }
  ];
  const currentIndex = shifts.findIndex((shift) => now >= shift.start && now < shift.end);
  return { shifts, currentIndex: currentIndex === -1 ? 0 : currentIndex };
}

function yearRange(year = new Date().getFullYear()) {
  return { start: new Date(year, 0, 1).toISOString(), end: new Date(year + 1, 0, 1).toISOString(), year };
}

function yearPeriodBounds(mode = 'months', year = new Date().getFullYear()) {
  if (mode === 'q1') return { start: new Date(year, 0, 1).toISOString(), end: new Date(year, 3, 1).toISOString() };
  if (mode === 'q2') return { start: new Date(year, 3, 1).toISOString(), end: new Date(year, 6, 1).toISOString() };
  if (mode === 'q3') return { start: new Date(year, 6, 1).toISOString(), end: new Date(year, 9, 1).toISOString() };
  if (mode === 'q4') return { start: new Date(year, 9, 1).toISOString(), end: new Date(year + 1, 0, 1).toISOString() };
  return { start: new Date(year, 0, 1).toISOString(), end: new Date(year + 1, 0, 1).toISOString() };
}

function summarizeByFab(tickets) {
  return FABS.map((fab) => ({ label: fab, total: tickets.filter((t) => t.fab === fab).length }));
}

function summarizeByCategory(tickets, categories, incidents) {
  return categories.map((c) => ({
    label: c.name,
    total: tickets.filter((t) => incidents.some((i) => i.name === t.incident_name && i.category_id === c.id)).length
  }));
}

async function getIncidentPresetsMap() {
  const { data, error } = await supabase
    .from('incident_presets')
    .select('id,incident_id,text,sort_order')
    .order('sort_order', { ascending: true });
  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      (message.includes('incident_presets') && message.includes('schema cache'))
    ) {
      return { presetsByIncident: new Map(), tableMissing: true };
    }
    throw error;
  }
  const map = new Map();
  (data || []).forEach((row) => {
    if (!map.has(row.incident_id)) map.set(row.incident_id, []);
    map.get(row.incident_id).push({ id: row.id, text: row.text, sort_order: row.sort_order });
  });
  return { presetsByIncident: map, tableMissing: false };
}

async function bootstrapIfNeeded() {
  const { data: cData, error: cErr } = await supabase.from('categories').select('id').limit(1);
  if (!cErr && cData) return;

  const dbPath = path.join(__dirname, 'db.json');
  if (!fs.existsSync(dbPath)) return;
  const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const categoriesPayload = (localDb.categories || []).map((c, idx) => ({ id: c.id, name: c.name, sort_order: idx + 1 }));
  if (categoriesPayload.length) await supabase.from('categories').upsert(categoriesPayload);

  const incidentsPayload = (localDb.incidents || []).map((i) => ({ id: i.id, category_id: i.category_id, name: i.name }));
  if (incidentsPayload.length) await supabase.from('incidents').upsert(incidentsPayload);

  const ticketsPayload = (localDb.tickets || []).map((t) => ({ id: t.id, incident_name: t.incident_name, description: t.description, fab: t.fab, created_at: t.created_at || new Date().toISOString() }));
  if (ticketsPayload.length) await supabase.from('tickets').upsert(ticketsPayload);
}

app.use('/api', requireApiAuth());

app.get('/api/users', requireApiAuth('admin'), async (req, res) => {
  let users;
  try {
    users = await fetchDbUsers();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Errore lettura utenti' });
  }
  if (!users) {
    return res.status(500).json({ error: 'Tabella app_users non trovata. Creala su Supabase per gestire gli utenti.' });
  }
  res.json(users.map((u) => ({ id: Number(u.id), username: u.username, role: u.role })));
});

app.post('/api/users', requireApiAuth('admin'), async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  const role = String(req.body.role || 'user').trim().toLowerCase();
  if (!username || !password) return res.status(400).json({ error: 'Username e password obbligatori' });
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Ruolo non valido' });

  let users;
  try {
    users = await fetchDbUsers();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Errore lettura utenti' });
  }
  if (!users) {
    return res.status(500).json({ error: 'Tabella app_users non trovata. Creala su Supabase per gestire gli utenti.' });
  }

  if ((users || []).some((u) => String(u.username).toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username gia esistente' });
  }

  const { data, error } = await supabase
    .from('app_users')
    .insert({ username, password, role })
    .select('id,username,role')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: Number(data.id), username: data.username, role: data.role });
});

app.delete('/api/users/:id', requireApiAuth('admin'), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Utente non valido' });
  if (id === Number(req.user?.id)) return res.status(400).json({ error: 'Non puoi eliminare il tuo utente' });

  let users;
  try {
    users = await fetchDbUsers();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Errore lettura utenti' });
  }
  if (!users) {
    return res.status(500).json({ error: 'Tabella app_users non trovata. Creala su Supabase per gestire gli utenti.' });
  }

  const exists = (users || []).some((u) => Number(u.id) === id);
  if (!exists) return res.status(404).json({ error: 'Utente non trovato' });

  const { error } = await supabase.from('app_users').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/categories', async (req, res) => {
  const { data: categories, error: e1 } = await supabase.from('categories').select('id,name,sort_order').order('sort_order', { ascending: true });
  if (e1) return res.status(500).json({ error: e1.message });
  const { data: incidents, error: e2 } = await supabase.from('incidents').select('*').order('id', { ascending: true });
  if (e2) return res.status(500).json({ error: e2.message });
  let presetsByIncident = new Map();
  try {
    const result = await getIncidentPresetsMap();
    presetsByIncident = result.presetsByIncident;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(categories.map((c) => ({
    id: c.id,
    name: c.name,
    incidents: incidents
      .filter((i) => i.category_id === c.id)
      .sort((a, b) => {
        const sa = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
        const sb = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
        if (sa !== sb) return sa - sb;
        return Number(a.id) - Number(b.id);
      })
      .map((i) => ({
        id: i.id,
        category_id: i.category_id,
        name: i.name,
        severity_default: Number(i.severity_default || 1),
        severity_mode: i.severity_mode || 'default',
        fab_default: i.fab_default || '',
        presets: (presetsByIncident.get(i.id) || []).map((p) => p.text)
      }))
  })));
});

app.post('/api/categories', requireApiAuth('admin'), async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nome categoria obbligatorio' });
  const { data: maxRow } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  const nextOrder = (maxRow?.sort_order || 0) + 1;
  const { data, error } = await supabase.from('categories').insert({ name, sort_order: nextOrder }).select('id,name').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/categories/reorder', requireApiAuth('admin'), async (req, res) => {
  const orderedIds = Array.isArray(req.body.orderedIds) ? req.body.orderedIds.map(Number) : [];
  if (!orderedIds.length) return res.status(400).json({ error: 'Ordine non valido' });

  for (let idx = 0; idx < orderedIds.length; idx += 1) {
    const id = orderedIds[idx];
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: idx + 1 })
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

app.put('/api/categories/:id', requireApiAuth('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Dati non validi' });
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/categories/:id', requireApiAuth('admin'), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Categoria non valida' });

  const { data: incidents, error: incidentsError } = await supabase
    .from('incidents')
    .select('id')
    .eq('category_id', id);
  if (incidentsError) return res.status(500).json({ error: incidentsError.message });

  const incidentIds = (incidents || []).map((i) => i.id);
  if (incidentIds.length) {
    const { error: presetsDeleteError } = await supabase
      .from('incident_presets')
      .delete()
      .in('incident_id', incidentIds);
    if (
      presetsDeleteError &&
      presetsDeleteError.code !== '42P01' &&
      presetsDeleteError.code !== 'PGRST205'
    ) {
      return res.status(500).json({ error: presetsDeleteError.message });
    }

    const { error: incidentsDeleteError } = await supabase
      .from('incidents')
      .delete()
      .eq('category_id', id);
    if (incidentsDeleteError) return res.status(500).json({ error: incidentsDeleteError.message });
  }

  const { error: categoryDeleteError } = await supabase.from('categories').delete().eq('id', id);
  if (categoryDeleteError) return res.status(500).json({ error: categoryDeleteError.message });

  res.json({ ok: true });
});

app.post('/api/incidents', requireApiAuth('admin'), async (req, res) => {
  const category_id = Number(req.body.category_id);
  const name = (req.body.name || '').trim();
  if (!category_id || !name) return res.status(400).json({ error: 'Dati mancanti' });
  let error;
  let payload = { category_id, name };
  if (incidentSortSupported !== false) {
    const { data: maxRow } = await supabase
      .from('incidents')
      .select('sort_order')
      .eq('category_id', category_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    payload = { ...payload, sort_order: Number(maxRow?.sort_order || 0) + 1 };
  }

  ({ error } = await supabase.from('incidents').insert(payload));
  if (
    error &&
    incidentSortSupported !== false &&
    String(error.message || '').toLowerCase().includes('sort_order')
  ) {
    incidentSortSupported = false;
    ({ error } = await supabase.from('incidents').insert({ category_id, name }));
  } else if (!error) {
    incidentSortSupported = true;
  }
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/incidents/reorder', requireApiAuth('admin'), async (req, res) => {
  const categoryId = Number(req.body.category_id);
  const orderedIds = Array.isArray(req.body.orderedIds) ? req.body.orderedIds.map(Number) : [];
  if (!categoryId || !orderedIds.length) return res.status(400).json({ error: 'Ordine incident non valido' });

  for (let idx = 0; idx < orderedIds.length; idx += 1) {
    const id = orderedIds[idx];
    const { error } = await supabase
      .from('incidents')
      .update({ sort_order: idx + 1 })
      .eq('id', id)
      .eq('category_id', categoryId);

    if (error && String(error.message || '').toLowerCase().includes('sort_order')) {
      incidentSortSupported = false;
      return res.status(400).json({
        error: 'Per ordinare gli incident serve la colonna sort_order in tabella incidents.'
      });
    }
    if (error) return res.status(500).json({ error: error.message });
  }
  incidentSortSupported = true;
  res.json({ ok: true });
});

app.put('/api/incidents/:id', requireApiAuth('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body.name || '').trim();
  const severity_default = Number(req.body.severity_default || 1);
  const severity_mode = (req.body.severity_mode || 'default').toString();
  const fab_default = (req.body.fab_default || '').trim().toUpperCase();
  if (!name) return res.status(400).json({ error: 'Dati non validi' });
  let error;
  let updatePayload = { name };
  if (incidentSeveritySupported !== false) {
    updatePayload = { ...updatePayload, severity_default, severity_mode };
  }
  if (incidentFabDefaultSupported !== false) {
    updatePayload = { ...updatePayload, fab_default: fab_default || null };
  }

  ({ error } = await supabase.from('incidents').update(updatePayload).eq('id', id));

  if (
    error &&
    incidentFabDefaultSupported !== false &&
    String(error.message || '').toLowerCase().includes('fab_default')
  ) {
    incidentFabDefaultSupported = false;
    const retryPayload = { name, ...(incidentSeveritySupported !== false ? { severity_default, severity_mode } : {}) };
    ({ error } = await supabase.from('incidents').update(retryPayload).eq('id', id));
  }

  if (
    error &&
    incidentSeveritySupported !== false &&
    (
      String(error.message || '').toLowerCase().includes('severity_default') ||
      String(error.message || '').toLowerCase().includes('severity_mode')
    )
  ) {
    incidentSeveritySupported = false;
    const retryPayload = { name, ...(incidentFabDefaultSupported !== false ? { fab_default: fab_default || null } : {}) };
    ({ error } = await supabase.from('incidents').update(retryPayload).eq('id', id));
  }

  if (!error) {
    if (incidentFabDefaultSupported !== false) incidentFabDefaultSupported = true;
    if (incidentSeveritySupported !== false) incidentSeveritySupported = true;
  }
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/incidents/:id', requireApiAuth('admin'), async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Incident non valido' });

  const { error: presetsDeleteError } = await supabase
    .from('incident_presets')
    .delete()
    .eq('incident_id', id);
  if (
    presetsDeleteError &&
    presetsDeleteError.code !== '42P01' &&
    presetsDeleteError.code !== 'PGRST205'
  ) {
    return res.status(500).json({ error: presetsDeleteError.message });
  }

  const { error: incidentDeleteError } = await supabase.from('incidents').delete().eq('id', id);
  if (incidentDeleteError) return res.status(500).json({ error: incidentDeleteError.message });

  res.json({ ok: true });
});

app.put('/api/incidents/:id/presets', requireApiAuth('admin'), async (req, res) => {
  const incidentId = Number(req.params.id);
  const presets = Array.isArray(req.body.presets) ? req.body.presets : [];
  if (!incidentId) return res.status(400).json({ error: 'Incident non valido' });

  const cleanPresets = presets
    .map((item) => String(item || '').trim())
    .filter((item) => item.length > 0);

  const { tableMissing } = await getIncidentPresetsMap();
  if (tableMissing) {
    return res.status(500).json({
      error: 'Tabella incident_presets non trovata. Crea la tabella in Supabase prima di usare i precompilati.'
    });
  }

  const { error: deleteError } = await supabase.from('incident_presets').delete().eq('incident_id', incidentId);
  if (deleteError) return res.status(500).json({ error: deleteError.message });

  if (cleanPresets.length) {
    const payload = cleanPresets.map((text, idx) => ({
      incident_id: incidentId,
      text,
      sort_order: idx + 1
    }));
    const { error: insertError } = await supabase.from('incident_presets').insert(payload);
    if (insertError) return res.status(500).json({ error: insertError.message });
  }

  res.json({ ok: true, presets: cleanPresets });
});

app.post('/api/tickets', async (req, res) => {
  const { incident_name, description, fab, ticket_time, severity } = req.body;
  if (!incident_name || !description || !fab || !ticket_time || !severity) return res.status(400).json({ error: 'Dati ticket incompleti' });
  const parsedTime = new Date(ticket_time);
  if (Number.isNaN(parsedTime.getTime())) return res.status(400).json({ error: 'Data/ora ticket non valida' });
  if (ticketOwnerSupported === false) {
    return res.status(500).json({
      error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
    });
  }
  const ownerUserId = Number(req.user?.id);
  const useOwner = ticketOwnerSupported !== false && Number.isFinite(ownerUserId) && ownerUserId > 0;
  let useSeverity = ticketSeveritySupported !== false;
  let useTicketOwner = useOwner;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const payload = { incident_name, description, fab, created_at: parsedTime.toISOString() };
    if (useSeverity) payload.severity = Number(severity);
    if (useTicketOwner) payload.owner_user_id = ownerUserId;

    const { data, error } = await supabase.from('tickets').insert(payload).select('*').single();
    if (!error) {
      if (useSeverity) ticketSeveritySupported = true;
      if (useTicketOwner) ticketOwnerSupported = true;
      return res.json(ticketWithPermissions(data, req.user));
    }
    if (useSeverity && isMissingColumnError(error, 'severity')) {
      ticketSeveritySupported = false;
      useSeverity = false;
      continue;
    }
    if (useTicketOwner && isMissingColumnError(error, 'owner_user_id')) {
      ticketOwnerSupported = false;
      return res.status(500).json({
        error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
      });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Errore inserimento ticket' });
});

app.put('/api/tickets/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { incident_name, description, fab, ticket_time, severity } = req.body;
  if (!incident_name || !description || !fab || !ticket_time || !severity) return res.status(400).json({ error: 'Dati ticket incompleti' });
  const parsedTime = new Date(ticket_time);
  if (Number.isNaN(parsedTime.getTime())) return res.status(400).json({ error: 'Data/ora ticket non valida' });
  if (ticketOwnerSupported === false) {
    return res.status(500).json({
      error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
    });
  }

  if (ticketOwnerSupported !== false) {
    const { data: ownerData, error: ownerError } = await supabase
      .from('tickets')
      .select('id,owner_user_id')
      .eq('id', id)
      .maybeSingle();

    if (ownerError) {
      if (isMissingColumnError(ownerError, 'owner_user_id')) {
        ticketOwnerSupported = false;
        return res.status(500).json({
          error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
        });
      } else if (isNoRowsError(ownerError)) {
        return res.status(404).json({ error: 'Ticket non trovato' });
      } else {
        return res.status(500).json({ error: ownerError.message });
      }
    } else if (!ownerData) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    } else if (Number(ownerData.owner_user_id) !== Number(req.user?.id)) {
      return res.status(403).json({ error: 'Puoi modificare solo i ticket che hai inserito' });
    }
  }

  let useSeverity = ticketSeveritySupported !== false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const updatePayload = {
      incident_name,
      description,
      fab,
      created_at: parsedTime.toISOString()
    };
    if (useSeverity) updatePayload.severity = Number(severity);

    const { data, error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (!error) {
      if (!data) return res.status(404).json({ error: 'Ticket non trovato' });
      if (useSeverity) ticketSeveritySupported = true;
      return res.json({ ok: true, ticket: ticketWithPermissions(data, req.user) });
    }
    if (useSeverity && isMissingColumnError(error, 'severity')) {
      ticketSeveritySupported = false;
      useSeverity = false;
      continue;
    }
    if (isNoRowsError(error)) return res.status(404).json({ error: 'Ticket non trovato' });
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Errore aggiornamento ticket' });
});

app.delete('/api/tickets/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Ticket non valido' });
  if (ticketOwnerSupported === false) {
    return res.status(500).json({
      error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
    });
  }

  if (ticketOwnerSupported !== false) {
    const { data: ownerData, error: ownerError } = await supabase
      .from('tickets')
      .select('id,owner_user_id')
      .eq('id', id)
      .maybeSingle();
    if (ownerError) {
      if (isMissingColumnError(ownerError, 'owner_user_id')) {
        ticketOwnerSupported = false;
        return res.status(500).json({
          error: 'Colonna tickets.owner_user_id mancante. Aggiungila in Supabase per abilitare la proprieta ticket.'
        });
      } else if (isNoRowsError(ownerError)) {
        return res.status(404).json({ error: 'Ticket non trovato' });
      } else {
        return res.status(500).json({ error: ownerError.message });
      }
    } else if (!ownerData) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    } else if (Number(ownerData.owner_user_id) !== Number(req.user?.id)) {
      return res.status(403).json({ error: 'Puoi eliminare solo i ticket che hai inserito' });
    }
  }

  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/tickets/current-day', async (req, res) => {
  const { start, end } = currentDayBounds();
  const { data, error } = await supabase.from('tickets').select('*').gte('created_at', start).lt('created_at', end).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ day: { start, end }, tickets: (data || []).map((t) => ticketWithPermissions(t, req.user)) });
});

app.get('/api/tickets/current-shift', async (req, res) => {
  const { shifts, currentIndex } = currentOperationalShifts();
  const currentShift = shifts[currentIndex];
  const start = currentShift.start.toISOString();
  const end = currentShift.end.toISOString();
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({
    shift: {
      key: currentShift.key,
      label: currentShift.label,
      start,
      end
    },
    tickets: (data || []).map((t) => ticketWithPermissions(t, req.user))
  });
});

app.get('/api/tickets/previous-shifts', async (req, res) => {
  const { shifts, currentIndex } = currentOperationalShifts();
  const previousShifts = shifts.slice(Math.max(0, currentIndex - 2), currentIndex);

  const results = await Promise.all(previousShifts.map(async (shift) => {
    const start = shift.start.toISOString();
    const end = shift.end.toISOString();
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { label: shift.label, start, end, tickets: (data || []).map((t) => ticketWithPermissions(t, req.user)) };
  }));

  res.json({ shifts: results });
});

app.get('/api/stats/fab/current-day', async (req, res) => {
  const { start, end } = currentDayBounds();
  const { data: tickets, error } = await supabase.from('tickets').select('fab').gte('created_at', start).lt('created_at', end);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ day: { start, end }, stats: summarizeByFab(tickets || []) });
});

app.get('/api/stats/category/current-day', async (req, res) => {
  const { start, end } = currentDayBounds();
  const [{ data: tickets, error: e1 }, { data: categories, error: e2 }, { data: incidents, error: e3 }] = await Promise.all([
    supabase.from('tickets').select('incident_name').gte('created_at', start).lt('created_at', end),
    supabase.from('categories').select('id,name').order('sort_order', { ascending: true }),
    supabase.from('incidents').select('name,category_id')
  ]);
  if (e1 || e2 || e3) return res.status(500).json({ error: (e1 || e2 || e3).message });
  res.json({ day: { start, end }, stats: summarizeByCategory(tickets || [], categories || [], incidents || []) });
});

app.get('/api/stats/fab/current-year', async (req, res) => {
  const { year } = yearRange();
  const mode = (req.query.mode || 'months').toString();
  const { start, end } = yearPeriodBounds(mode, year);
  const { data: tickets, error } = await supabase.from('tickets').select('fab').gte('created_at', start).lt('created_at', end);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ year, mode, stats: summarizeByFab(tickets || []) });
});

app.get('/api/stats/category/current-year', async (req, res) => {
  const { year } = yearRange();
  const mode = (req.query.mode || 'months').toString();
  const { start, end } = yearPeriodBounds(mode, year);
  const [{ data: tickets, error: e1 }, { data: categories, error: e2 }, { data: incidents, error: e3 }] = await Promise.all([
    supabase.from('tickets').select('incident_name').gte('created_at', start).lt('created_at', end),
    supabase.from('categories').select('id,name').order('sort_order', { ascending: true }),
    supabase.from('incidents').select('name,category_id')
  ]);
  if (e1 || e2 || e3) return res.status(500).json({ error: (e1 || e2 || e3).message });
  res.json({ year, mode, stats: summarizeByCategory(tickets || [], categories || [], incidents || []) });
});

Promise.all([
  bootstrapIfNeeded(),
  ensureDefaultUsers()
]).catch((error) => {
  console.error('Bootstrap Supabase failed:', error.message);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Dashboard attiva su http://localhost:${PORT}`);
  });
}

module.exports = app;
