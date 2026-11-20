CREATE DATABASE IF NOT EXISTS dioganize_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dioganize_db;

CREATE TABLE IF NOT EXISTS service_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(128) NULL,
  service_type VARCHAR(100) NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(64) NULL,
  email VARCHAR(255) NULL,
  application_date DATE NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Pending',
  details LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_service_applications_user_id (user_id),
  INDEX idx_service_applications_status (status)
);

-- Sample seed data
INSERT INTO service_applications
  (id, user_id, service_type, applicant_name, contact_number, email, application_date, status, details)
VALUES
  (
    1,
    NULL,
    'Baptism',
    'Maria Santos',
    '09171234567',
    'maria.santos@example.com',
    '2026-12-05',
    'Pending',
    '{"service":"Baptism","applicant":"Maria Santos","childName":"Gabriel Santos","date":"2026-12-05","time":"10:00 AM","venue":"Main Church","notes":"Infant baptism request"}'
  ),
  (
    2,
    NULL,
    'Wedding',
    'Juan Dela Cruz',
    '09189876543',
    'juan.delacruz@example.com',
    '2026-12-19',
    'Approved',
    '{"service":"Wedding","applicant":"Juan Dela Cruz","brideName":"Ana Reyes","groomName":"Juan Dela Cruz","date":"2026-12-19","time":"02:00 PM","venue":"Main Church","notes":"Afternoon ceremony"}'
  )
ON DUPLICATE KEY UPDATE id = id;
