-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: prodops
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_users`
--

DROP TABLE IF EXISTS `app_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_users` (
  `id` int unsigned NOT NULL,
  `username` varchar(80) NOT NULL,
  `password` varchar(160) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `team` varchar(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_app_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_users`
--

LOCK TABLES `app_users` WRITE;
/*!40000 ALTER TABLE `app_users` DISABLE KEYS */;
INSERT INTO `app_users` VALUES (1,'admin','admin','admin','A'),(2,'user','user','user','B');
/*!40000 ALTER TABLE `app_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_categories_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'AUTOMATION',1),(2,'WMM',2),(3,'SICMA',3);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident_presets`
--

DROP TABLE IF EXISTS `incident_presets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incident_presets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `incident_id` int unsigned NOT NULL,
  `text` text NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_incident_presets_incident` (`incident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `setting_key` varchar(80) NOT NULL,
  `setting_value` longtext NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_presets`
--

LOCK TABLES `incident_presets` WRITE;
/*!40000 ALTER TABLE `incident_presets` DISABLE KEYS */;
/*!40000 ALTER TABLE `incident_presets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
INSERT INTO `app_settings` VALUES ('ui_colors','{\"charts\":{\"fabDay\":{\"light\":\"#0c5f8c\",\"dark\":\"#24a0d8\"},\"catDay\":{\"light\":\"#16a0b6\",\"dark\":\"#2ec4d6\"},\"fabYear\":{\"light\":\"#355a84\",\"dark\":\"#1fb6ff\"},\"catYear\":{\"light\":\"#6b4ea6\",\"dark\":\"#9b6cff\"}},\"labels\":{\"categories\":{\"light\":{},\"dark\":{}},\"fabs\":{\"light\":{},\"dark\":{}}}}');
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidents` (
  `id` int unsigned NOT NULL,
  `category_id` int unsigned NOT NULL,
  `name` varchar(180) NOT NULL,
  `severity_default` tinyint unsigned NOT NULL DEFAULT '1',
  `severity_mode` varchar(20) NOT NULL DEFAULT 'default',
  `fab_default` varchar(12) NOT NULL DEFAULT '',
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_incidents_category` (`category_id`),
  KEY `idx_incidents_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES (1,1,'Server non raggiungibile',1,'default','',1),(2,1,'Latenza elevata',1,'default','',2),(3,1,'Errore backup notturno',1,'default','',3),(4,2,'Crash applicazione',1,'default','',1),(5,2,'Errore login utenti',1,'default','',2),(6,2,'Bug funzionale',1,'default','',3),(7,3,'Tentativo accesso sospetto',1,'default','',1),(8,3,'Malware rilevato',1,'default','',2),(9,3,'Vulnerabilita critica',1,'default','',3);
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int unsigned NOT NULL,
  `incident_id` int unsigned NOT NULL,
  `description` text NOT NULL,
  `fab` varchar(12) NOT NULL,
  `created_at` varchar(40) NOT NULL,
  `severity` tinyint unsigned NOT NULL DEFAULT '1',
  `owner_user_id` int unsigned DEFAULT NULL,
  `owner_team` varchar(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (`id`),
  KEY `idx_tickets_incident` (`incident_id`),
  KEY `idx_tickets_created_at` (`created_at`),
  KEY `idx_tickets_owner_user` (`owner_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,1,'prova','M5','2026-06-01T09:58:30.733Z',1,NULL),(2,2,'eeee','L1','2026-06-01T09:58:47.618Z',1,NULL),(3,2,'ertere','M5','2026-06-01T09:58:51.325Z',1,NULL),(4,3,'gewgerg','NRK','2026-06-01T09:58:54.330Z',1,NULL),(5,5,'grgr','WSIC','2026-06-01T09:58:58.758Z',1,NULL),(6,6,'grgrg','NRK','2026-06-01T09:59:02.031Z',1,NULL),(7,8,'rger','EWS','2026-06-01T09:59:10.503Z',1,NULL),(8,9,'bnmm,','EWS','2026-06-01T10:17:29.894Z',1,NULL),(9,1,'test incident id','M5','2026-06-01T21:37:42+00:00',1,1),(10,1,'mysql runtime test','M5','2026-06-01T21:53:03+00:00',1,1);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-02  0:29:10
