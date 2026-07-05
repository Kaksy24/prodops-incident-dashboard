<?php
/*
 * extensions/export.php — Export ticket per il TinyMCE di un altro sito.
 *
 * URL di produzione:
 *   .../ictsupport/modules/ticket_manager/extensions/export.php?format=html
 *
 * Parametri (GET):
 *   format = html | json   (default: html)
 *   start  = data/ora ISO  (opzionale) inizio intervallo, INCLUSO
 *   end    = data/ora ISO  (opzionale) fine intervallo, ESCLUSO
 *
 * Se start/end non sono indicati vengono esportati tutti i ticket.
 * Output HTML: un blocco <h3>CATEGORIA-FAB</h3> + <ul><li>…</li></ul> per ogni
 * coppia categoria/fab, con i ticket identici compattati e prefissati con [N].
 *
 * Autenticazione: usa la sessione LDAP esistente (stesso dominio di lavoro).
 */

// Bufferizza l'eventuale BOM/whitespace emesso dai file inclusi, poi lo scarta
// cosi' l'output resta pulito (importante per l'HTML consumato da TinyMCE).
ob_start();

// Include il backend solo per le sue funzioni helper (niente routing API).
define('PRODOPS_LIB_ONLY', true);
require dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';

while (ob_get_level() > 0) { ob_end_clean(); }

// Autenticazione via cookie di sessione LDAP.
$authUser = read_auth_user();
if (!$authUser) {
    header('HTTP/1.1 401 Unauthorized');
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Autenticazione richiesta';
    exit;
}

$format = isset($_GET['format']) ? strtolower(trim(strval($_GET['format']))) : '';
if ($format !== 'json') $format = 'html';

$rawStart = isset($_GET['start']) ? trim(strval($_GET['start'])) : '';
$rawEnd   = isset($_GET['end'])   ? trim(strval($_GET['end']))   : '';
$startTs = $rawStart !== '' ? strtotime($rawStart) : false;
$endTs   = $rawEnd   !== '' ? strtotime($rawEnd)   : false;

$db = load_db($defaultUsers);
$categories = isset($db['categories']) ? $db['categories'] : array();
$incidents  = isset($db['incidents'])  ? $db['incidents']  : array();
$tickets    = isset($db['tickets'])    ? $db['tickets']    : array();

// Filtra per intervallo (start incluso, end escluso) e raggruppa per CATEGORIA-FAB,
// compattando i ticket con descrizione identica.
$groupsMap = array();
$groupsOrder = array();
$total = 0;
foreach ($tickets as $t) {
    $ts = isset($t['created_at']) ? strtotime($t['created_at']) : false;
    if ($startTs !== false && ($ts === false || $ts < $startTs)) continue;
    if ($endTs !== false && ($ts === false || $ts >= $endTs)) continue;
    $total++;
    $cat  = trim(custom_ticket_category_name($t, $categories, $incidents));
    $fab  = isset($t['fab']) ? trim(strval($t['fab'])) : '';
    $desc = isset($t['description']) ? trim(strval($t['description'])) : '';
    $gkey = strtolower($cat) . "\x01" . strtolower($fab);
    if (!isset($groupsMap[$gkey])) {
        $groupsMap[$gkey] = array('category' => $cat, 'fab' => $fab, 'items' => array(), 'order' => array());
        $groupsOrder[] = $gkey;
    }
    $dkey = strtolower($desc);
    if (!isset($groupsMap[$gkey]['items'][$dkey])) {
        $groupsMap[$gkey]['items'][$dkey] = array('text' => $desc, 'count' => 0);
        $groupsMap[$gkey]['order'][] = $dkey;
    }
    $groupsMap[$gkey]['items'][$dkey]['count']++;
}

$groups = array();
foreach ($groupsOrder as $gkey) {
    $g = $groupsMap[$gkey];
    $items = array();
    foreach ($g['order'] as $dkey) $items[] = $g['items'][$dkey];
    usort($items, 'export_cmp_items');
    $heading = ($g['category'] !== '' ? strtoupper($g['category']) : '(SENZA CATEGORIA)')
        . '-' . ($g['fab'] !== '' ? strtoupper($g['fab']) : '(SENZA FAB)');
    $groups[] = array('category' => $g['category'], 'fab' => $g['fab'], 'heading' => $heading, 'items' => $items);
}
usort($groups, 'export_cmp_groups');

$html = '';
foreach ($groups as $g) {
    $html .= '<h3>' . htmlspecialchars($g['heading'], ENT_QUOTES) . '</h3><ul>';
    foreach ($g['items'] as $it) {
        $prefix = $it['count'] > 1 ? '[' . $it['count'] . '] ' : '';
        $html .= '<li>' . htmlspecialchars($prefix . $it['text'], ENT_QUOTES) . '</li>';
    }
    $html .= '</ul>';
}

if ($format === 'json') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array(
        'start' => $rawStart,
        'end'   => $rawEnd,
        'count' => $total,
        'html'  => $html,
        'groups' => $groups
    ));
} else {
    header('Content-Type: text/html; charset=utf-8');
    echo $html;
}
exit;

// Comparatori (PHP 5.3: niente closure con "use" complesse).
function export_cmp_items($a, $b) { return strcmp($a['text'], $b['text']); }
function export_cmp_groups($a, $b) {
    $c = strcmp($a['category'], $b['category']);
    return $c !== 0 ? $c : strcmp($a['fab'], $b['fab']);
}
