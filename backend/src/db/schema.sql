-- JobReady CRM Database Setup Script

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS jobready_crm_db;
USE jobready_crm_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla companies
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  website VARCHAR(255),
  notes TEXT,
  rating INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla applications
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyId INT NOT NULL,
  position VARCHAR(255) NOT NULL,
  status ENUM('applied', 'interview', 'offer', 'rejected') DEFAULT 'applied',
  appliedAt DATE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

-- Tabla interviews
CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT NOT NULL,
  interviewDate DATETIME,
  type ENUM('phone', 'video', 'presential') DEFAULT 'phone',
  notes TEXT,
  result TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
);

-- Tabla follow_up_tasks
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  dueDate DATE,
  done BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
);