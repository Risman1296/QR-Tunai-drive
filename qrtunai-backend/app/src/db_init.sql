-- Migration: QRTunai Drive-Thru MVP

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin','teller','supervisor') NOT NULL,
  hash VARCHAR(255) NOT NULL,
  outlet_id INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outlets (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  address VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS qr_tokens (
  id VARCHAR(64) PRIMARY KEY,
  outlet_id INTEGER,
  expires_at DATETIME,
  used_at DATETIME,
  session_id VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  token_id VARCHAR(64),
  type VARCHAR(20),
  amount DECIMAL(18,2),
  bank VARCHAR(50),
  method VARCHAR(50),
  customer_name VARCHAR(100),
  phone VARCHAR(20),
  note TEXT,
  status ENUM('pending_review','approved','paid','canceled') DEFAULT 'pending_review',
  evidence_url VARCHAR(255),
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wifi_ssids (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  outlet_id INTEGER,
  ssid VARCHAR(64),
  captive_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  actor_id INTEGER,
  action VARCHAR(50),
  target VARCHAR(100),
  meta TEXT,
  at DATETIME DEFAULT CURRENT_TIMESTAMP
);
