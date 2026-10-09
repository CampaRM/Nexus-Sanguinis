-- Nexus Sanguinis: Sistema Centralizado de Gestión de Banco de Sangre y Trazabilidad

CREATE DATABASE IF NOT EXISTS `nexus_sanguinis`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `nexus_sanguinis`;

-- 1. Tabla: Roles (roles)
CREATE TABLE IF NOT EXISTS `roles` (
  `id_role` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` ENUM('ADMIN_GENERAL', 'BANK_MANAGER') NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla: Centros Médicos (medical_centers)
CREATE TABLE IF NOT EXISTS `medical_centers` (
  `id_medical_center` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `type` VARCHAR(60) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: Usuarios (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `id_role` INT NOT NULL,
  `id_medical_center` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_users_medical_center` FOREIGN KEY (`id_medical_center`) REFERENCES `medical_centers` (`id_medical_center`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla: Unidades de Sangre (blood_units)
CREATE TABLE IF NOT EXISTS `blood_units` (
  `id_blood_unit` INT AUTO_INCREMENT PRIMARY KEY,
  `blood_type` ENUM('A', 'B', 'AB', 'O') NOT NULL,
  `rh_factor` ENUM('POSITIVE', 'NEGATIVE') NOT NULL,
  `extraction_date` DATETIME NOT NULL,
  `expiration_date` DATETIME NOT NULL,
  `status` ENUM('AVAILABLE', 'NEAR_EXPIRATION', 'EXPIRED', 'DISCARDED', 'TRANSFERRED') NOT NULL DEFAULT 'AVAILABLE',
  `id_medical_center` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_blood_units_status` (`status`),
  INDEX `idx_blood_units_type_rh` (`blood_type`, `rh_factor`),
  INDEX `idx_blood_units_expiration` (`expiration_date`),
  CONSTRAINT `fk_blood_units_center` FOREIGN KEY (`id_medical_center`) REFERENCES `medical_centers` (`id_medical_center`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla: Solicitudes de Transferencia (transfer_requests)
CREATE TABLE IF NOT EXISTS `transfer_requests` (
  `id_transfer_request` INT AUTO_INCREMENT PRIMARY KEY,
  `id_requesting_center` INT NOT NULL,
  `id_supplying_center` INT NOT NULL,
  `blood_type` ENUM('A', 'B', 'AB', 'O') NOT NULL,
  `quantity` INT NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `request_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_transfer_requests_status` (`status`),
  CONSTRAINT `fk_transfer_requesting_center` FOREIGN KEY (`id_requesting_center`) REFERENCES `medical_centers` (`id_medical_center`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_transfer_supplying_center` FOREIGN KEY (`id_supplying_center`) REFERENCES `medical_centers` (`id_medical_center`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla: Detalles de Transferencia (transfer_details)
CREATE TABLE IF NOT EXISTS `transfer_details` (
  `id_transfer_detail` INT AUTO_INCREMENT PRIMARY KEY,
  `id_transfer_request` INT NOT NULL,
  `id_blood_unit` INT NOT NULL,
  CONSTRAINT `fk_transfer_details_request` FOREIGN KEY (`id_transfer_request`) REFERENCES `transfer_requests` (`id_transfer_request`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transfer_details_unit` FOREIGN KEY (`id_blood_unit`) REFERENCES `blood_units` (`id_blood_unit`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla: Historial de Movimientos y Auditoría (movement_histories)
CREATE TABLE IF NOT EXISTS `movement_histories` (
  `id_movement_history` INT AUTO_INCREMENT PRIMARY KEY,
  `id_blood_unit` INT NOT NULL,
  `id_user` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_movement_histories_unit` (`id_blood_unit`),
  CONSTRAINT `fk_movements_blood_unit` FOREIGN KEY (`id_blood_unit`) REFERENCES `blood_units` (`id_blood_unit`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_movements_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
