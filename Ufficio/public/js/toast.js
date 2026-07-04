(function () {
  'use strict';

  /* ── TOAST ──────────────────────────────────────────────────────────────── */

  var ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  var DURATIONS = { success: 4000, error: 7000, warning: 5500, info: 4500 };
  var DEFAULT_TITLES = {
    success: 'Operazione completata',
    error: 'Si è verificato un errore',
    warning: 'Attenzione',
    info: 'Informazione'
  };

  function ensureContainer() {
    var c = document.getElementById('prodops-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'prodops-toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  window.showToast = function (message, type, title) {
    type = type || 'info';
    var duration = DURATIONS[type] || 5000;
    title = title || DEFAULT_TITLES[type] || DEFAULT_TITLES.info;
    var container = ensureContainer();

    var toast = document.createElement('div');
    toast.className = 'prodops-toast prodops-toast-' + type;
    toast.setAttribute('role', 'alert');

    var iconEl = document.createElement('div');
    iconEl.className = 'prodops-toast-icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = ICONS[type] || 'ℹ';

    var body = document.createElement('div');
    body.className = 'prodops-toast-body';

    var titleEl = document.createElement('div');
    titleEl.className = 'prodops-toast-title';
    titleEl.textContent = title;

    var msgEl = document.createElement('div');
    msgEl.className = 'prodops-toast-msg';
    msgEl.textContent = message;

    body.appendChild(titleEl);
    body.appendChild(msgEl);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'prodops-toast-close';
    closeBtn.textContent = '✕';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Chiudi notifica');

    var progress = document.createElement('div');
    progress.className = 'prodops-toast-progress';
    progress.style.animationDuration = duration + 'ms';

    toast.appendChild(iconEl);
    toast.appendChild(body);
    toast.appendChild(closeBtn);
    toast.appendChild(progress);
    container.appendChild(toast);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add('prodops-toast-out');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 320);
    }

    closeBtn.addEventListener('click', dismiss);
    var timer = setTimeout(dismiss, duration);
    toast.addEventListener('mouseenter', function () { clearTimeout(timer); progress.style.animationPlayState = 'paused'; });
    toast.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 1500); progress.style.animationPlayState = 'running'; });

    requestAnimationFrame(function () { toast.classList.add('prodops-toast-in'); });
    return dismiss;
  };

  /* ── CONFIRM DIALOG ─────────────────────────────────────────────────────── */

  window.showConfirm = function (message, options) {
    options = options || {};
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'prodops-confirm-overlay';

      var dialog = document.createElement('div');
      dialog.className = 'prodops-confirm-dialog';
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');

      var type = options.type || 'warning';
      var iconWrap = document.createElement('div');
      iconWrap.className = 'prodops-confirm-icon prodops-confirm-icon-' + type;
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.textContent = type === 'error' ? '✕' : (type === 'info' ? 'ℹ' : '⚠');

      var titleEl = document.createElement('div');
      titleEl.className = 'prodops-confirm-title';
      titleEl.textContent = options.title || 'Conferma operazione';

      var msgEl = document.createElement('div');
      msgEl.className = 'prodops-confirm-msg';
      msgEl.textContent = message;

      var actions = document.createElement('div');
      actions.className = 'prodops-confirm-actions';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'secondary prodops-confirm-btn';
      cancelBtn.type = 'button';
      cancelBtn.textContent = options.cancelText || 'Annulla';

      var confirmBtn = document.createElement('button');
      confirmBtn.className = (type === 'error' ? 'danger' : 'primary') + ' prodops-confirm-btn';
      confirmBtn.type = 'button';
      confirmBtn.textContent = options.confirmText || 'Conferma';

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      dialog.appendChild(iconWrap);
      dialog.appendChild(titleEl);
      dialog.appendChild(msgEl);
      dialog.appendChild(actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      function close(result) {
        overlay.classList.add('prodops-confirm-out');
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
        resolve(result);
      }

      cancelBtn.addEventListener('click', function () { close(false); });
      confirmBtn.addEventListener('click', function () { close(true); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(false); }
      });

      requestAnimationFrame(function () {
        overlay.classList.add('prodops-confirm-in');
        confirmBtn.focus();
      });
    });
  };

  /* ── PROMPT DIALOG ──────────────────────────────────────────────────────── */

  window.showPrompt = function (message, options) {
    options = options || {};
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'prodops-confirm-overlay';

      var dialog = document.createElement('div');
      dialog.className = 'prodops-confirm-dialog prodops-prompt-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');

      var titleEl = document.createElement('div');
      titleEl.className = 'prodops-confirm-title';
      titleEl.textContent = options.title || 'Inserisci un valore';

      var msgEl = document.createElement('div');
      msgEl.className = 'prodops-confirm-msg';
      msgEl.textContent = message || '';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'prodops-prompt-input';
      input.value = options.defaultValue || '';
      if (options.placeholder) input.placeholder = options.placeholder;

      var actions = document.createElement('div');
      actions.className = 'prodops-confirm-actions';

      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'secondary prodops-confirm-btn';
      cancelBtn.type = 'button';
      cancelBtn.textContent = options.cancelText || 'Annulla';

      var confirmBtn = document.createElement('button');
      confirmBtn.className = 'primary prodops-confirm-btn';
      confirmBtn.type = 'button';
      confirmBtn.textContent = options.confirmText || 'Conferma';

      actions.appendChild(cancelBtn);
      actions.appendChild(confirmBtn);
      dialog.appendChild(titleEl);
      dialog.appendChild(msgEl);
      dialog.appendChild(input);
      dialog.appendChild(actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      var done = false;
      function close(result) {
        if (done) return;
        done = true;
        overlay.classList.add('prodops-confirm-out');
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
        resolve(result);
      }
      function submit() {
        var val = input.value.trim();
        if (options.required !== false && !val) { input.focus(); return; }
        close(val);
      }

      cancelBtn.addEventListener('click', function () { close(null); });
      confirmBtn.addEventListener('click', submit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(null); });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(null); }
      });

      requestAnimationFrame(function () {
        overlay.classList.add('prodops-confirm-in');
        input.focus();
        input.select();
      });
    });
  };

})();
