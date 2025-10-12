-- =============================================================================
-- CREAR LAS 3 BASES DE DATOS MULTI-TENANT
-- =============================================================================
-- Este script crea las 3 bases de datos completas con todas las tablas
-- Usuario admin: username=admin, password=12345
-- Hash bcrypt: $2b$10$y5iqxP/yDF6Pv/Ojxb.Ht.vgbC4DXaO2QI5yD.RAlfTDx4aSt.Q66
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREAR LAS BASES DE DATOS
-- -----------------------------------------------------------------------------
DROP DATABASE IF EXISTS mini_sivesoft_backend;
DROP DATABASE IF EXISTS mini_sivesoft_backend_2;
DROP DATABASE IF EXISTS mini_sivesoft_backend_3;

CREATE DATABASE mini_sivesoft_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE mini_sivesoft_backend_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE mini_sivesoft_backend_3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. EMPRESA 1: mini_sivesoft_backend
-- -----------------------------------------------------------------------------
USE mini_sivesoft_backend;

-- Tabla de entidades de negocio
CREATE TABLE business_entities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    docType VARCHAR(50),
    docNumber VARCHAR(50),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_docNumber (docNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','user','super_admin') NOT NULL DEFAULT 'user',
    tenantIds TEXT NOT NULL,
    entityRelationId INT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_username (username),
    FOREIGN KEY (entityRelationId) REFERENCES business_entities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de almacenes
CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    serieWarehouse INT NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia usuarios-almacenes
CREATE TABLE users_warehouses (
    userId INT NOT NULL,
    warehouseId INT NOT NULL,
    PRIMARY KEY (userId, warehouseId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de hojas de inventario
CREATE TABLE inventory_sheets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sheetNumber VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    notes TEXT,
    userId INT,
    warehouseId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalles de hojas de inventario
CREATE TABLE inventory_sheet_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productCode VARCHAR(255) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    inventorySheetId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (inventorySheetId) REFERENCES inventory_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin
INSERT INTO users (username, password, role, tenantIds, createdAt, updatedAt) 
VALUES ('admin', '$2b$10$y5iqxP/yDF6Pv/Ojxb.Ht.vgbC4DXaO2QI5yD.RAlfTDx4aSt.Q66', 'super_admin', 'empresa1,empresa2,empresa3', NOW(), NOW());

-- Insertar datos de ejemplo
INSERT INTO business_entities (name, address, phone, email, docType, docNumber) 
VALUES ('Empresa 1 S.A.', 'Av. Principal 123', '+1234567890', 'contacto@empresa1.com', 'RUC', '20123456789');

INSERT INTO warehouses (name, address, serieWarehouse, isActive) VALUES 
('Almacén Central Empresa 1', 'Zona Norte', 1, TRUE),
('Almacén Sur Empresa 1', 'Zona Sur', 2, TRUE);

-- -----------------------------------------------------------------------------
-- 3. EMPRESA 2: mini_sivesoft_backend_2
-- -----------------------------------------------------------------------------
USE mini_sivesoft_backend_2;

-- Copiar estructura de tablas
CREATE TABLE business_entities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    docType VARCHAR(50),
    docNumber VARCHAR(50),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_docNumber (docNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','user','super_admin') NOT NULL DEFAULT 'user',
    tenantIds TEXT NOT NULL,
    entityRelationId INT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_username (username),
    FOREIGN KEY (entityRelationId) REFERENCES business_entities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    serieWarehouse INT NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users_warehouses (
    userId INT NOT NULL,
    warehouseId INT NOT NULL,
    PRIMARY KEY (userId, warehouseId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_sheets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sheetNumber VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    notes TEXT,
    userId INT,
    warehouseId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_sheet_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productCode VARCHAR(255) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    inventorySheetId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (inventorySheetId) REFERENCES inventory_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin
INSERT INTO users (username, password, role, tenantIds, createdAt, updatedAt) 
VALUES ('admin', '$2b$10$y5iqxP/yDF6Pv/Ojxb.Ht.vgbC4DXaO2QI5yD.RAlfTDx4aSt.Q66', 'super_admin', 'empresa1,empresa2,empresa3', NOW(), NOW());

-- Insertar datos de ejemplo
INSERT INTO business_entities (name, address, phone, email, docType, docNumber) 
VALUES ('Empresa 2 S.A.', 'Calle Comercio 456', '+1234567891', 'contacto@empresa2.com', 'RUC', '20987654321');

INSERT INTO warehouses (name, address, serieWarehouse, isActive) VALUES 
('Almacén Central Empresa 2', 'Distrito Financiero', 1, TRUE),
('Almacén Este Empresa 2', 'Zona Este', 2, TRUE);

-- -----------------------------------------------------------------------------
-- 4. EMPRESA 3: mini_sivesoft_backend_3
-- -----------------------------------------------------------------------------
USE mini_sivesoft_backend_3;

-- Copiar estructura de tablas
CREATE TABLE business_entities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    docType VARCHAR(50),
    docNumber VARCHAR(50),
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_docNumber (docNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','manager','user','super_admin') NOT NULL DEFAULT 'user',
    tenantIds TEXT NOT NULL,
    entityRelationId INT,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_username (username),
    FOREIGN KEY (entityRelationId) REFERENCES business_entities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warehouses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    serieWarehouse INT NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users_warehouses (
    userId INT NOT NULL,
    warehouseId INT NOT NULL,
    PRIMARY KEY (userId, warehouseId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_sheets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sheetNumber VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    notes TEXT,
    userId INT,
    warehouseId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouseId) REFERENCES warehouses(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory_sheet_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productCode VARCHAR(255) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    inventorySheetId INT NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (inventorySheetId) REFERENCES inventory_sheets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin
INSERT INTO users (username, password, role, tenantIds, createdAt, updatedAt) 
VALUES ('admin', '$2b$10$y5iqxP/yDF6Pv/Ojxb.Ht.vgbC4DXaO2QI5yD.RAlfTDx4aSt.Q66', 'super_admin', 'empresa1,empresa2,empresa3', NOW(), NOW());

-- Insertar datos de ejemplo
INSERT INTO business_entities (name, address, phone, email, docType, docNumber) 
VALUES ('Empresa 3 S.A.', 'Boulevard Industrial 789', '+1234567892', 'contacto@empresa3.com', 'RUC', '20456789123');

INSERT INTO warehouses (name, address, serieWarehouse, isActive) VALUES 
('Almacén Central Empresa 3', 'Parque Industrial', 1, TRUE),
('Almacén Oeste Empresa 3', 'Zona Oeste', 2, TRUE);

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT '=== EMPRESA 1 ===' AS Info;
SELECT id, username, role, tenantIds FROM mini_sivesoft_backend.users;
SELECT id, name FROM mini_sivesoft_backend.business_entities;
SELECT id, name, serieWarehouse FROM mini_sivesoft_backend.warehouses;

SELECT '=== EMPRESA 2 ===' AS Info;
SELECT id, username, role, tenantIds FROM mini_sivesoft_backend_2.users;
SELECT id, name FROM mini_sivesoft_backend_2.business_entities;
SELECT id, name, serieWarehouse FROM mini_sivesoft_backend_2.warehouses;

SELECT '=== EMPRESA 3 ===' AS Info;
SELECT id, username, role, tenantIds FROM mini_sivesoft_backend_3.users;
SELECT id, name FROM mini_sivesoft_backend_3.business_entities;
SELECT id, name, serieWarehouse FROM mini_sivesoft_backend_3.warehouses;

-- =============================================================================
-- ✅ COMPLETADO
-- =============================================================================
-- ✓ 3 bases de datos creadas: mini_sivesoft_backend, mini_sivesoft_backend_2, mini_sivesoft_backend_3
-- ✓ Todas las tablas creadas en cada base de datos
-- ✓ Usuario admin creado en las 3 empresas con:
--   - username: admin
--   - password: 12345
--   - role: super_admin
--   - tenantIds: empresa1,empresa2,empresa3
-- ✓ Datos de ejemplo insertados (entidades y almacenes)
-- =============================================================================
