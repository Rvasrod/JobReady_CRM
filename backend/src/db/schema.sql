-- JobReady CRM — ATS multi-tenant
-- Schema destructivo (drop & recreate). No usar en entorno con datos reales.

CREATE DATABASE IF NOT EXISTS jobready_crm_db;
USE jobready_crm_db;

-- Limpieza segura: desactivamos FKs para poder eliminar en cualquier orden
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS follow_up_tasks;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- organizations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  inviteCode VARCHAR(20) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- users (reclutadores que pertenecen a una org)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'recruiter') NOT NULL DEFAULT 'recruiter',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_users_org (organizationId)
);

-- ─────────────────────────────────────────────────────────────
-- candidates (postulantes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  seniority ENUM('junior', 'mid', 'senior') DEFAULT 'mid',
  skills JSON,
  linkedinUrl VARCHAR(255),
  notes TEXT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_candidates_org (organizationId)
);

-- ─────────────────────────────────────────────────────────────
-- positions (vacantes ofertadas por la organización)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  requirements TEXT,
  seniority ENUM('junior', 'mid', 'senior') DEFAULT 'mid',
  status ENUM('open', 'paused', 'closed') NOT NULL DEFAULT 'open',
  location VARCHAR(150),
  salary VARCHAR(100),
  modality ENUM('remote', 'presential', 'hybrid') DEFAULT 'presential',
  department VARCHAR(100),
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_positions_org (organizationId),
  INDEX idx_positions_status (organizationId, status)
);

-- ─────────────────────────────────────────────────────────────
-- applications (candidato × posición + estado del pipeline)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  candidateId INT NOT NULL,
  positionId INT NOT NULL,
  status ENUM(
    'applied',
    'cv_review',
    'interview',
    'technical_test',
    'offer',
    'hired',
    'rejected'
  ) NOT NULL DEFAULT 'applied',
  appliedAt DATE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (candidateId) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (positionId) REFERENCES positions(id) ON DELETE CASCADE,
  INDEX idx_applications_org (organizationId),
  INDEX idx_applications_status (organizationId, status),
  INDEX idx_applications_candidate (candidateId),
  INDEX idx_applications_position (positionId)
);

-- ─────────────────────────────────────────────────────────────
-- application_events (historial de eventos de cada candidatura)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE application_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT NOT NULL,
  userId INT NOT NULL,
  eventType ENUM(
    'status_changed',
    'note_added',
    'interview_scheduled',
    'offer_sent',
    'offer_accepted',
    'offer_rejected',
    'rejected'
  ) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_events_application (applicationId)
);

-- ─────────────────────────────────────────────────────────────
-- interviews (entrevistas vinculadas a una application)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT NOT NULL,
  interviewDate DATETIME,
  type ENUM('phone', 'video', 'presential') DEFAULT 'phone',
  notes TEXT,
  result TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
  INDEX idx_interviews_application (applicationId)
);
