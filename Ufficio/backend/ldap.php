<?php

define('LDAP_BASE_DN', 'ou=people,dc=st,dc=com');

$LDAP_SERVERS = array(
    array('host' => 'ldap.ctn.st.com',   'port' => 389),
    array('host' => 'LDAP_SERVER',        'port' => 389),
    array('host' => 'f5ldap.ctn.st.com', 'port' => 389),
    array('host' => 'ldap2.ctn.st.com',  'port' => 389),
);

$LDAP_CONFIG = array(
    'enabled'            => true,
    'dev_bypass'         => false,
    'allow_dev_password' => false,
    'dev_password'       => '',
);

class LDAPQuery
{
    private static $instance = null;
    private $ldapServers;
    private $ldapUser;
    private $ldapPass;
    private $ldapBaseDn;
    private $ldapResource;

    private function __construct($servers, $user, $pass, $baseDn)
    {
        $this->ldapServers  = $servers;
        $this->ldapUser     = $user;
        $this->ldapPass     = $pass;
        $this->ldapBaseDn   = $baseDn;
        $this->ldapResource = $this->connect();
    }

    private function connect()
    {
        foreach ($this->ldapServers as $server) {
            $conn = @ldap_connect($server['host'], $server['port']);
            if ($conn) {
                ldap_set_option($conn, LDAP_OPT_PROTOCOL_VERSION, 3);
                ldap_set_option($conn, LDAP_OPT_REFERRALS, 0);
                return $conn;
            }
        }
        return false;
    }

    public static function getInstance($user, $pass)
    {
        global $LDAP_SERVERS;
        if (self::$instance === null) {
            self::$instance = new LDAPQuery($LDAP_SERVERS, $user, $pass, LDAP_BASE_DN);
        }
        return self::$instance;
    }

    public function isConnected()
    {
        return $this->ldapResource !== false;
    }

    public function search($filter, $attributes = array())
    {
        if (!$this->ldapResource) return array('count' => 0);
        $search  = @ldap_search($this->ldapResource, $this->ldapBaseDn, $filter, $attributes);
        if (!$search) return array('count' => 0);
        $results = @ldap_get_entries($this->ldapResource, $search);
        return is_array($results) ? $results : array('count' => 0);
    }

    public function authenticate($results)
    {
        foreach ($results as $r) {
            if (!is_array($r) || !isset($r['dn'])) continue;
            $pass = str_replace("\\", "", $this->ldapPass);
            if (@ldap_bind($this->ldapResource, $r['dn'], $pass)) {
                return $r;
            }
        }
        return false;
    }

    public function close()
    {
        if ($this->ldapResource) {
            @ldap_close($this->ldapResource);
        }
        self::$instance = null;
    }
}

function ldap_escape_filter($str)
{
    $find    = array('\\', '*', '(', ')', "\0");
    $replace = array('\\5c', '\\2a', '\\28', '\\29', '\\00');
    return str_replace($find, $replace, strval($str));
}

function ldap_auth_user($shortname, $password)
{
    global $LDAP_CONFIG;

    $cfg = is_array($LDAP_CONFIG) ? $LDAP_CONFIG : array();

    // Bypass totale per sviluppo locale — rimuovere in produzione
    if (!empty($cfg['dev_bypass'])) return true;

    if ($password === '') return false;

    // LDAP disabilitato: bypass con dev_password se configurato
    if (empty($cfg['enabled'])) {
        return !empty($cfg['allow_dev_password'])
            && isset($cfg['dev_password'])
            && $password === $cfg['dev_password'];
    }

    if (!function_exists('ldap_connect') || !class_exists('LDAPQuery')) return false;

    // Ricerca per cognome, nome completo, email o uid
    $safe   = ldap_escape_filter($shortname);
    $filter = "(|(sn=" . $safe . "*)(cn=" . $safe . "*)(mail=" . $safe . "*)(uid=" . $safe . "))";

    $ldapQuery = LDAPQuery::getInstance($shortname, $password);
    if (!$ldapQuery->isConnected()) return false;

    $results = $ldapQuery->search($filter, array());
    $theUser = $ldapQuery->authenticate($results);

    // Verifica che l'utente trovato abbia un employeeNumber valido
    if ($theUser && isset($theUser['employeenumber'][0])) {
        return true;
    }

    return false;
}
