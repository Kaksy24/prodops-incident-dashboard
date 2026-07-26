(function () {
  var basePath = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var idx = scripts[i].src.indexOf('/public/js/privacy-consent.js');
      if (idx !== -1) return scripts[i].src.substring(new URL(scripts[i].src).origin.length, idx);
    }
    return '';
  })();

  function pUrl(path) {
    return basePath + path;
  }

  function fetchJ(url, opts) {
    return fetch(url, opts || {}).then(function (r) {
      return r.text().then(function (t) {
        return { status: r.status, data: JSON.parse(t.replace(/^\uFEFF+/, '')) };
      });
    });
  }

  function showPrivacyConsentModal() {
    var overlay = document.createElement('div');
    overlay.className = 'privacy-consent-overlay';
    overlay.innerHTML =
      '<div class="privacy-consent-modal">' +
        '<h2>Informativa sul trattamento dei dati personali</h2>' +
        '<p>Utilizzando ProdOps Ticket Manager, i seguenti dati personali saranno visibili agli altri operatori e ai supervisori:</p>' +
        '<ul class="privacy-consent-list">' +
          '<li><strong>Ticket inseriti</strong> — contenuto, data, FAB e severity sono visibili a tutti gli operatori</li>' +
          '<li><strong>Statistiche personali</strong> — conteggio ticket e avanzamento target visibili nella dashboard</li>' +
        '</ul>' +
        '<p><a href="' + pUrl('/privacy.html') + '" target="_blank" rel="noopener" class="privacy-consent-link">Leggi l\'informativa completa (Art. 13 GDPR)</a></p>' +
        '<div class="privacy-consent-actions">' +
          '<button type="button" class="privacy-consent-decline">Rifiuto</button>' +
          '<button type="button" class="privacy-consent-accept">Acconsento</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.privacy-consent-accept').addEventListener('click', function () {
      fetch(pUrl('/api/privacy-consent'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      }).then(function () {
        overlay.parentNode.removeChild(overlay);
      });
    });

    overlay.querySelector('.privacy-consent-decline').addEventListener('click', function () {
      fetch(pUrl('/api/logout'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      }).then(function () {
        window.location.replace(pUrl('/login.html'));
      });
    });
  }

  fetchJ(pUrl('/api/privacy-consent'), { credentials: 'same-origin' })
    .then(function (r) {
      if (r.status === 200 && r.data && !r.data.consented) {
        showPrivacyConsentModal();
      }
    })
    .catch(function () {});
})();
