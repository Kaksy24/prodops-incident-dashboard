<?php
/*
 * extensions/export.php — Export ticket per il TinyMCE di un altro sito.
 *
 * URL di produzione:
 *   .../ictsupport/modules/ticket_manager/extensions/export.php
 *
 * Se non viene passato il parametro "submit", mostra un form che chiede
 * start time, end time e formato di export (csv/json/html).
 *
 * Parametri (GET, dopo submit del form):
 *   submit = 1             marker che indica che il form e' stato inviato
 *   format = html|json|csv (default: html)
 *   start  = data/ora ISO  (opzionale) inizio intervallo, INCLUSO
 *   end    = data/ora ISO  (opzionale) fine intervallo, ESCLUSO
 *
 * Se start/end non sono indicati vengono esportati tutti i ticket.
 * Output HTML: un blocco <h3>CATEGORIA-FAB</h3> + <ul><li>…</li></ul> per ogni
 * coppia categoria/fab, con i ticket identici compattati e prefissati con [N].
 *
 * Endpoint pubblico: NON richiede autenticazione (consumato da un altro
 * programma interno che non dispone della sessione LDAP di ProdOps).
 */

// Bufferizza l'eventuale BOM/whitespace emesso dai file inclusi, poi lo scarta
// cosi' l'output resta pulito (importante per l'HTML consumato da TinyMCE).
ob_start();

// Include il backend solo per le sue funzioni helper (niente routing API).
define('PRODOPS_LIB_ONLY', true);
require dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'index.php';

// Se il form non e' stato ancora inviato ne' e' stato passato un formato
// esplicito (uso programmatico da bottone/sito esterno), chiedi
// start/end/formato prima di esportare.
if (!isset($_GET['submit']) && !isset($_GET['format'])) {
    while (ob_get_level() > 0) { ob_end_clean(); }
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">'
        . '<title>Export ticket</title>'
        . '<style>body{font-family:sans-serif;max-width:420px;margin:40px auto;}'
        . 'label{display:block;margin-top:12px;font-weight:bold;}'
        . 'input,select{width:100%;padding:6px;margin-top:4px;box-sizing:border-box;}'
        . 'button{margin-top:20px;padding:8px 16px;}</style></head><body>'
        . '<h2>Export ticket</h2>'
        . '<form method="get" action="">'
        . '<input type="hidden" name="submit" value="1">'
        . '<label for="start">Inizio (incluso)</label>'
        . '<input type="datetime-local" id="start" name="start">'
        . '<label for="end">Fine (escluso)</label>'
        . '<input type="datetime-local" id="end" name="end">'
        . '<label for="format">Formato</label>'
        . '<select id="format" name="format">'
        . '<option value="csv">CSV</option>'
        . '<option value="json">JSON</option>'
        . '<option value="html">HTML</option>'
        . '</select>'
        . '<button type="submit">Esporta</button>'
        . '</form></body></html>';
    exit;
}

$format = isset($_GET['format']) ? strtolower(trim(strval($_GET['format']))) : '';
if ($format !== 'json' && $format !== 'csv') $format = 'html';

// "start"/"end" e gli alias italiani "datainizio"/"datafine" sono equivalenti
// (il sito esterno consumatore usa i nomi italiani).
$rawStart = isset($_GET['start']) ? trim(strval($_GET['start']))
    : (isset($_GET['datainizio']) ? trim(strval($_GET['datainizio'])) : '');
$rawEnd   = isset($_GET['end']) ? trim(strval($_GET['end']))
    : (isset($_GET['datafine']) ? trim(strval($_GET['datafine'])) : '');
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
    $cat  = export_strip_tag_brackets(export_fix_mojibake(html_entity_decode(trim(custom_ticket_category_name($t, $categories, $incidents)), ENT_QUOTES, 'UTF-8')));
    $fab  = isset($t['fab']) ? export_strip_tag_brackets(export_fix_mojibake(html_entity_decode(trim(strval($t['fab'])), ENT_QUOTES, 'UTF-8'))) : '';
    $desc = isset($t['description']) ? export_strip_tag_brackets(export_fix_mojibake(html_entity_decode(trim(strval($t['description'])), ENT_QUOTES, 'UTF-8'))) : '';
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

// Scarta tutto l'output bufferato (BOM/whitespace emessi dagli include o da
// load_db) prima di inviare l'output pulito.
while (ob_get_level() > 0) { ob_end_clean(); }

if ($format === 'json') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array(
        'groups' => $groups
    ));
} else if ($format === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="export_ticket.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, array('Categoria', 'FAB', 'Conteggio', 'Descrizione'));
    foreach ($groups as $g) {
        foreach ($g['items'] as $it) {
            fputcsv($out, array($g['category'], $g['fab'], $it['count'], $it['text']));
        }
    }
    fclose($out);
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

// Ripara il testo salvato con doppia codifica UTF-8 (es. "〈ERR901〉" diventato
// "ã€ˆERR901ã€‰" perche' i byte UTF-8 originali sono stati reinterpretati come
// Windows-1252 e ri-codificati). Rilevato tramite i caratteri "spia" del blocco
// C1 (€ ‚ ƒ „ … ˆ ‰ Š ‹ Œ Ž ' ' " " • – — ˜ ™ š › œ Ÿ), che non compaiono mai
// in un normale testo italiano ma sono l'impronta tipica di questo artefatto.
function export_fix_mojibake($s) {
    if ($s === '' || !function_exists('mb_convert_encoding')) return $s;
    static $signals = null;
    if ($signals === null) {
        $signals = array(
            "\xE2\x82\xAC", "\xE2\x80\x9A", "\xC6\x92", "\xE2\x80\x9E", "\xE2\x80\xA6",
            "\xCB\x86", "\xE2\x80\xB0", "\xC5\xA0", "\xE2\x80\xB9", "\xC5\x92", "\xC5\xBD",
            "\xE2\x80\x98", "\xE2\x80\x99", "\xE2\x80\x9C", "\xE2\x80\x9D", "\xE2\x80\xA2",
            "\xE2\x80\x93", "\xE2\x80\x94", "\xCB\x9C", "\xE2\x84\xA2", "\xC5\xA1",
            "\xE2\x80\xBA", "\xC5\x93", "\xC5\xB8"
        );
    }
    $hit = false;
    foreach ($signals as $sig) {
        if (strpos($s, $sig) !== false) { $hit = true; break; }
    }
    if (!$hit) return $s;
    $fixed = @mb_convert_encoding($s, 'Windows-1252', 'UTF-8');
    if ($fixed !== false && $fixed !== '' && mb_check_encoding($fixed, 'UTF-8')) {
        return $fixed;
    }
    return $s;
}

// Toglie le parentesi angolari (sia ASCII "<>" che le varianti Unicode
// "〈〉"/"⟨⟩" usate da alcune tastiere/autocorrezioni) che racchiudono un
// valore, es. "<PEP08>" -> "PEP08", "〈16:47〉" -> "16:47", mantenendo il
// contenuto interno.
function export_strip_tag_brackets($s) {
    if ($s === '') return $s;
    $pattern = '/[<\x{2329}\x{3008}]([^<>\x{2329}\x{232A}\x{3008}\x{3009}]*)[>\x{232A}\x{3009}]/u';
    return preg_replace($pattern, '$1', $s);
}
