-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql305.infinityfree.com
-- Creato il: Giu 04, 2026 alle 10:40
-- Versione del server: 11.4.12-MariaDB
-- Versione PHP: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_42089952_tickemanager`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `app_settings`
--

CREATE TABLE `app_settings` (
  `setting_key` varchar(80) NOT NULL,
  `setting_value` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `app_settings`
--

INSERT INTO `app_settings` (`setting_key`, `setting_value`) VALUES
('ui_colors', '{\"charts\":{\"fabDay\":{\"light\":\"#0C5F8C\",\"dark\":\"#24A0D8\"},\"catDay\":{\"light\":\"#16A0B6\",\"dark\":\"#2EC4D6\"},\"fabYear\":{\"light\":\"#355A84\",\"dark\":\"#1FB6FF\"},\"catYear\":{\"light\":\"#6B4EA6\",\"dark\":\"#9B6CFF\"},\"teamYear\":{\"light\":\"#D97706\",\"dark\":\"#F59E0B\"},\"severityYear\":{\"light\":\"#BE185D\",\"dark\":\"#EC4899\"}},\"bars\":{\"fabDay\":{\"light\":{\"WSIC\":\"#640080\",\"NRK\":\"#C25E00\",\"M5\":\"#FF2E2E\"},\"dark\":[]},\"fabYear\":{\"light\":{\"WSIC\":\"#640080\",\"NRK\":\"#C25E00\",\"M5\":\"#FF2E2E\"},\"dark\":[]},\"catDay\":{\"light\":{\"SEALING\":\"#28BAD7\",\"AUTOMATION\":\"#4ED728\",\"On Duty\":\"#FF0F1B\",\"SICMA\":\"#D606E5\"},\"dark\":[]},\"catYear\":{\"light\":{\"SEALING\":\"#28BAD7\",\"AUTOMATION\":\"#4ED728\",\"On Duty\":\"#FF0F1B\",\"SICMA\":\"#D606E5\"},\"dark\":[]}},\"labels\":{\"categories\":{\"light\":{\"SEALING\":\"#28BAD7\",\"AUTOMATION\":\"#4ED728\",\"On Duty\":\"#FF0F1B\",\"SICMA\":\"#D606E5\"},\"dark\":[]},\"fabs\":{\"light\":{\"WSIC\":\"#640080\",\"NRK\":\"#C25E00\",\"M5\":\"#FF2E2E\"},\"dark\":[]},\"teams\":{\"light\":[],\"dark\":[]},\"severities\":{\"light\":[],\"dark\":[]}}}');

-- --------------------------------------------------------

--
-- Struttura della tabella `app_users`
--

CREATE TABLE `app_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(80) NOT NULL,
  `password` varchar(160) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `team` varchar(1) NOT NULL DEFAULT 'A'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `app_users`
--

INSERT INTO `app_users` (`id`, `username`, `password`, `role`, `team`) VALUES
(1, 'admin', '', 'admin', 'A'),
(2, 'user', '', 'user', 'A'),
(4, 'FaillaV', '', 'admin', 'D'),
(5, 'DibellaA', '', 'admin', 'B'),
(6, 'NicosiaF', '', 'admin', 'B');

-- --------------------------------------------------------

--
-- Struttura della tabella `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `categories`
--

INSERT INTO `categories` (`id`, `name`, `hidden`, `sort_order`) VALUES
(1, 'AUTOMATION', 0, 1),
(2, 'WMM', 0, 2),
(3, 'SICMA', 0, 3),
(4, 'ROBOTIZATION', 0, 4),
(5, 'On Duty', 0, 6),
(6, 'SEALING', 0, 5);

-- --------------------------------------------------------

--
-- Struttura della tabella `incidents`
--

CREATE TABLE `incidents` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `severity_default` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `severity_mode` varchar(20) NOT NULL DEFAULT 'default',
  `fab_default` varchar(12) NOT NULL DEFAULT '',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `incidents`
--

INSERT INTO `incidents` (`id`, `category_id`, `name`, `hidden`, `severity_default`, `severity_mode`, `fab_default`, `sort_order`) VALUES
(1, 1, 'Generic', 0, 1, 'user', '', 1),
(2, 1, 'Reset Interfaccia', 0, 1, 'default', '', 2),
(3, 1, 'Switch display', 0, 1, 'default', '', 3),
(4, 2, 'Generic', 0, 1, 'user', '', 1),
(6, 2, 'SLTA', 0, 1, 'default', '', 3),
(7, 3, 'Generic', 0, 1, 'user', 'WSIC', 1),
(8, 3, 'ADSC', 0, 1, 'default', 'WSIC', 2),
(9, 3, 'KO MONO', 0, 1, 'default', 'WSIC', 3),
(10, 4, 'Generic', 0, 1, 'default', '', 1),
(11, 4, 'Restart ISL41', 0, 1, 'default', 'M5', 2),
(12, 4, 'Restart ISL47 (SARA)', 0, 1, 'default', 'M5', 3),
(13, 5, 'Robotization', 0, 1, 'user', '', 1),
(14, 5, 'Application', 0, 2, 'user', '', 2),
(15, 5, 'Network', 0, 2, 'user', '', 3),
(16, 5, 'Automation', 0, 2, 'user', '', 4),
(17, 5, 'SICMA', 0, 1, 'user', 'WSIC', 5),
(18, 6, 'Generic', 0, 1, 'default', '', 1),
(19, 2, 'ADSC', 0, 1, 'default', '', 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `incident_presets`
--

CREATE TABLE `incident_presets` (
  `id` int(10) UNSIGNED NOT NULL,
  `incident_id` int(10) UNSIGNED NOT NULL,
  `text` text NOT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `incident_presets`
--

INSERT INTO `incident_presets` (`id`, `incident_id`, `text`, `sort_order`) VALUES
(1317, 13, '[[[text:Orario inizio intervento]]]: Contattato reperibile\n\n[[[text:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[text:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[text:Orario fine intervento]]]: Fine intervento', 1),
(1318, 2, 'Richiesto Reset Interfaccia per la macchina: [[text:macchina]]\nMotivo del reset: [[select:motivo|busy,comm.down,timeout,GUI down,stato automazione non corretto]]', 1),
(1319, 8, 'Eseguito ADSC per Box/Lotto [[text:Lotto/Box]] alla sequence [[text:Sequence]]', 1),
(1320, 11, 'Richiesto reset robotizzazione ISL41', 1),
(1321, 14, '[[[text:Orario inizio intervento]]]: Contattato reperibile\n\n[[[text:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[text:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[text:Orario fine intervento]]]: Fine intervento', 1),
(1322, 19, 'Effettuato ADSC per lotto: [[text:Lotto]] allo step: [[text:Step]]', 1),
(1323, 3, 'Switch display per entity: [[text:macchina]] su IP: [[text:Nuovo IP]]', 1),
(1324, 6, 'Eseguito SLTA su lotto [[text:lotto]] all\' attributo [[text:attributo]] da [[text:vecchio attr]] a [[text:nuovo attr]]', 1),
(1325, 9, 'Segnalato KO MONO per lotto: [[text:Lotto]] eseguito FINE-PROD', 1),
(1326, 12, 'Richiesto reset Robot SARA per: [[text:Causa reset]]', 1),
(1327, 15, '[[[text:Orario inizio intervento]]]: Contattato reperibile\n\n[[[text:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[text:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[text:Orario fine intervento]]]: Fine intervento', 1),
(1328, 16, '[[[text:Orario inizio intervento]]]: Contattato reperibile\n\n[[[text:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[text:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[text:Orario fine intervento]]]: Fine intervento', 1),
(1329, 17, '[[[text:Orario inizio intervento]]]: Contattato reperibile\n\n[[[text:Orario arrivo reperibile]]]: Arrivo Reperibile in sede\n\n[[[text:Orario info]]]: Veniamo informati dal reperibile che la problematica riguarda ...\n\n[[[text:Orario fine intervento]]]: Fine intervento', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `tickets`
--

CREATE TABLE `tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `incident_id` int(10) UNSIGNED NOT NULL,
  `description` text NOT NULL,
  `fab` varchar(12) NOT NULL,
  `created_at` varchar(40) NOT NULL,
  `severity` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `owner_user_id` int(10) UNSIGNED DEFAULT NULL,
  `owner_team` varchar(1) NOT NULL DEFAULT 'A'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dump dei dati per la tabella `tickets`
--

INSERT INTO `tickets` (`id`, `incident_id`, `description`, `fab`, `created_at`, `severity`, `owner_user_id`, `owner_team`) VALUES
(4, 2, 'Communication down', 'M5', '2026-06-03T10:55:00+00:00', 1, 1, 'A'),
(5, 14, 'Eseguito ADSC per 235626 all\'operazione 4444', 'WSIC', '2026-06-03T14:00:00+00:00', 1, 1, 'A'),
(6, 14, 'Eseguito ADSC per 346346 all\'operazione 2345', 'WSIC', '2026-06-03T14:00:00+00:00', 1, 1, 'A'),
(7, 1, 'Prova problema high', 'L1', '2026-06-04T05:42:00+00:00', 3, 1, 'A'),
(8, 4, 'richiesto reboot', 'M5', '2026-06-04T05:44:00+00:00', 1, 1, 'A'),
(9, 13, '[16:00]: Contattato reperibile\n\n[17:00]: Arrivo Reperibile in sede\n\n[17:30]: Veniamo informati dal reperibile che la problematica riguarda la cinghia del manipolatore\n\n[18:00]: Fine intervento', 'M5', '2026-06-04T06:14:00+00:00', 3, 1, 'A'),
(10, 18, 'test prova ews', 'EWS', '2026-06-04T06:17:00+00:00', 1, 1, 'A'),
(11, 8, 'Eseguito ADSC per Box/Lotto 8CRM1974 alla sequence 23', 'WSIC', '2026-06-04T06:18:00+00:00', 1, 1, 'A'),
(12, 19, 'Effettuato ADSC per lotto: 526262 allo step: 4000', 'NRK', '2026-06-04T06:21:00+00:00', 1, 1, 'A'),
(13, 19, 'Effettuato ADSC per lotto: 3246346 allo step: 1000', 'L1', '2026-06-04T06:21:00+00:00', 1, 1, 'A'),
(14, 19, 'Effettuato ADSC per lotto: 5925000 allo step: BEGIN', 'M5', '2026-06-04T06:38:00+00:00', 1, 1, 'A'),
(15, 19, 'Effettuato ADSC per lotto: V666312 allo step: 9999', 'L1', '2026-06-04T06:39:00+00:00', 1, 1, 'A'),
(16, 19, 'Effettuato ADSC per lotto: P501050 allo step: 20', 'WSIC', '2026-06-04T06:39:00+00:00', 1, 1, 'A'),
(17, 19, 'Effettuato ADSC per lotto: 363636 allo step: 2444', 'L1', '2026-06-04T06:47:00+00:00', 1, 1, 'A'),
(18, 19, 'Effettuato ADSC per lotto: 36664636 allo step: 637', 'NRK', '2026-06-04T06:47:00+00:00', 1, 1, 'A'),
(19, 13, '[17:00]: Contattato reperibile\n\n[17:30]: Arrivo Reperibile in sede\n\n[22:20]: Veniamo informati dal reperibile che la problematica riguarda bla bla bla bla\n\n[23:00]: Fine intervento', 'M5', '2026-06-04T06:49:00+00:00', 4, 1, 'A');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indici per le tabelle `app_users`
--
ALTER TABLE `app_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_app_users_username` (`username`);

--
-- Indici per le tabelle `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categories_sort` (`sort_order`);

--
-- Indici per le tabelle `incidents`
--
ALTER TABLE `incidents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_incidents_category` (`category_id`),
  ADD KEY `idx_incidents_sort` (`sort_order`);

--
-- Indici per le tabelle `incident_presets`
--
ALTER TABLE `incident_presets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_incident_presets_incident` (`incident_id`);

--
-- Indici per le tabelle `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tickets_incident` (`incident_id`),
  ADD KEY `idx_tickets_created_at` (`created_at`),
  ADD KEY `idx_tickets_owner_user` (`owner_user_id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `incident_presets`
--
ALTER TABLE `incident_presets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1330;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
