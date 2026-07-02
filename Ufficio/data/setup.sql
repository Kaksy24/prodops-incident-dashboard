SET NAMES utf8;
SET foreign_key_checks = 0;

-- Schema
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_categories_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS incidents (
  id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  severity_default TINYINT UNSIGNED NOT NULL DEFAULT 1,
  severity_mode VARCHAR(20) NOT NULL DEFAULT 'default',
  fab_default VARCHAR(12) NOT NULL DEFAULT '',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_incidents_category (category_id),
  KEY idx_incidents_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS incident_presets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  incident_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_incident_presets_incident (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(80) NOT NULL,
  setting_value LONGTEXT NOT NULL,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS app_users (
  id INT UNSIGNED NOT NULL,
  username VARCHAR(80) NOT NULL,
  password VARCHAR(160) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  team VARCHAR(1) NOT NULL DEFAULT 'A',
  group_name VARCHAR(80) NOT NULL DEFAULT 'ProdOps',
  personal_target SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  group_target SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS preset_options (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  field_key VARCHAR(80) NOT NULL,
  value VARCHAR(255) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_preset_options (field_key, value),
  KEY idx_preset_options_field (field_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED NOT NULL,
  incident_id INT UNSIGNED NOT NULL,
  incident_name VARCHAR(180) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  fab VARCHAR(12) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  severity TINYINT UNSIGNED NOT NULL DEFAULT 1,
  owner_user_id INT UNSIGNED NULL,
  owner_team VARCHAR(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (id),
  KEY idx_tickets_incident (incident_id),
  KEY idx_tickets_created_at (created_at),
  KEY idx_tickets_owner_user (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Pulizia
DELETE FROM incident_presets;
DELETE FROM incidents;
DELETE FROM categories;
DELETE FROM app_users;
DELETE FROM preset_options;

-- Categorie
INSERT INTO categories (id, name, hidden, sort_order) VALUES
(1, 'AUTOMATION',   0, 1),
(2, 'WMM',          0, 2),
(3, 'SICMA',        0, 3),
(4, 'ROBOTIZATION', 0, 4),
(6, 'SEALING',      0, 5),
(5, 'REPERIBILITÀ', 0, 6);

-- Incidents
INSERT INTO incidents (id, category_id, name, hidden, severity_default, severity_mode, fab_default, name_mode, sort_order) VALUES
(1,  1, 'Generic',            0, 1, 'user',    '',     'default', 1),
(4,  2, 'Generic',            0, 1, 'user',    '',     'default', 1),
(7,  3, 'Generic',            0, 1, 'user',    'WSIC', 'default', 1),
(10, 4, 'Generic',            0, 1, 'default', '',     'default', 1),
(16, 5, 'Automation',         0, 2, 'user',    '',     'default', 1),
(18, 6, 'Generic',            0, 1, 'default', '',     'default', 1),
(2,  1, 'Reset Interfaccia',  0, 1, 'default', '',     'default', 2),
(8,  3, 'ADSC',               0, 1, 'default', 'WSIC', 'default', 2),
(11, 4, 'Restart ISL41',      0, 1, 'default', 'M5',   'default', 2),
(14, 5, 'Application',        0, 2, 'user',    '',     'default', 2),
(19, 2, 'ADSC',               0, 1, 'default', '',     'default', 2),
(3,  1, 'Switch display',     0, 1, 'default', '',     'default', 3),
(6,  2, 'SLTA',               0, 1, 'default', '',     'default', 3),
(9,  3, 'KO MONO',            0, 1, 'default', 'WSIC', 'default', 3),
(12, 4, 'Restart ISL47 (SARA)', 0, 1, 'default', 'M5', 'default', 3),
(13, 5, 'Robotization',       0, 1, 'user',    '',     'default', 3),
(15, 5, 'Network',            0, 2, 'user',    '',     'default', 4),
(17, 5, 'SICMA',              0, 1, 'user',    'WSIC', 'default', 5);

-- Preset testi
INSERT INTO incident_presets (incident_id, text, sort_order) VALUES
(16, '[[[timestamp:Orario inizio intervento]]]: Contattato reperibile\n\n[[[timestamp:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[timestamp:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[timestamp:Orario fine intervento]]]: Fine intervento', 1),
(2,  'Richiesto Reset Interfaccia per la macchina: [[dbselect:Macchina]] ;\nMotivo del reset: [[dbselect:Motivo]]', 1),
(8,  'Eseguito ADSC per Box/Lotto [[text:Lotto/Box]] alla sequence [[text:Sequence]]', 1),
(11, 'Richiesto reset robotizzazione ISL41', 1),
(14, '[[[timestamp:Orario inizio intervento]]]: Contattato reperibile\n\n[[[timestamp:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[timestamp:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[timestamp:Orario fine intervento]]]: Fine intervento', 1),
(19, 'Effettuato ADSC per lotto: [[text:Lotto]] allo step: [[text:Step]]', 1),
(3,  'Switch display per entity: [[text:macchina]] su IP: [[text:Nuovo IP]]', 1),
(6,  'Eseguito SLTA su lotto [[text:lotto]] all'' attributo [[text:attributo]] da [[text:vecchio attr]] a [[text:nuovo attr]]', 1),
(9,  'Segnalato KO MONO per lotto: [[text:Lotto]] eseguito FINE-PROD', 1),
(12, 'Richiesto reset Robot SARA per: [[text:Causa reset]]', 1),
(13, '[[[timestamp:Orario inizio intervento]]]: Contattato reperibile\n\n[[[timestamp:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[timestamp:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[timestamp:Orario fine intervento]]]: Fine intervento', 1),
(15, '[[[timestamp:Orario inizio intervento]]]: Contattato reperibile\n\n[[[timestamp:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[timestamp:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[timestamp:Orario fine intervento]]]: Fine intervento', 1),
(17, '[[[timestamp:Orario inizio intervento]]]: Contattato reperibile\n\n[[[timestamp:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[timestamp:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[timestamp:Orario fine intervento]]]: Fine intervento', 1);

-- Utente admin
INSERT INTO app_users (id, username, password, role, team, group_name, personal_target, group_target) VALUES
(1, 'dibella1', '', 'admin', 'A', 'ProdOps', 200, 20);

-- Preset options (valori dropdown)
INSERT INTO preset_options (field_key, value, sort_order) VALUES
('macchina', 'dis05',   1),
('macchina', 'dis43',   2),
('macchina', 'ebeb',    3),
('macchina', 'eeee',    4),
('macchina', 'erer',    5),
('macchina', 'erreq',   6),
('macchina', 'pep05',   7),
('macchina', 'pol887',  8),
('macchina', 'sep34',   9),
('macchina', 'ththew',  10),
('macchina', 'wos05',   11),
('motivo',   'busy',    1),
('motivo',   'comm.down', 2);

SET foreign_key_checks = 1;
