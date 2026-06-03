CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_categories_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS incidents (
  id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
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

CREATE TABLE IF NOT EXISTS app_users (
  id INT UNSIGNED NOT NULL,
  username VARCHAR(80) NOT NULL,
  password VARCHAR(160) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  team VARCHAR(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED NOT NULL,
  incident_id INT UNSIGNED NOT NULL,
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
