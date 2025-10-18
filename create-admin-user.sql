-- ============================================================================
-- Script para crear usuario SUPER_ADMIN en todas las bases de datos
-- ============================================================================
-- Usuario: admin
-- Password: 12345 (encriptado con bcrypt)
-- Rol: super_admin
-- Acceso: Todas las empresas (empresa1, empresa2, empresa3)
-- ============================================================================

-- Hash bcrypt de la contraseña '12345'
-- Este hash se generó con bcrypt rounds=10
SET @password_hash = '$2b$10$xgoxYtO9H7IbsnjkbnKlhOa3CBBpIoAFZCW8T2e0JvT72DOZdLLbW';

-- ============================================================================
-- BASE DE DATOS 1: mini_sivesoft_backend (empresa1)
-- ============================================================================
USE mini_sivesoft_backend;

-- Verificar si el usuario 'admin' ya existe
SELECT 'Verificando usuario admin en mini_sivesoft_backend...' AS status;

-- Eliminar usuario admin si existe (opcional, descomentar si necesitas recrearlo)
-- DELETE FROM users WHERE username = 'admin';

-- Insertar usuario super_admin
INSERT INTO users (username, password, role, tenantIds)
VALUES (
    'admin',
    @password_hash,
    'super_admin',
    'empresa1,empresa2,empresa3'
)
ON DUPLICATE KEY UPDATE
    password = @password_hash,
    role = 'super_admin',
    tenantIds = 'empresa1,empresa2,empresa3';

SELECT 'Usuario admin creado/actualizado en mini_sivesoft_backend ✅' AS status;

-- ============================================================================
-- BASE DE DATOS 2: mini_sivesoft_backend_2 (empresa2)
-- ============================================================================
USE mini_sivesoft_backend_2;

-- Verificar si el usuario 'admin' ya existe
SELECT 'Verificando usuario admin en mini_sivesoft_backend_2...' AS status;

-- Eliminar usuario admin si existe (opcional)
-- DELETE FROM users WHERE username = 'admin';

-- Insertar usuario super_admin
INSERT INTO users (username, password, role, tenantIds)
VALUES (
    'admin',
    @password_hash,
    'super_admin',
    'empresa1,empresa2,empresa3'
)
ON DUPLICATE KEY UPDATE
    password = @password_hash,
    role = 'super_admin',
    tenantIds = 'empresa1,empresa2,empresa3';

SELECT 'Usuario admin creado/actualizado en mini_sivesoft_backend_2 ✅' AS status;

-- ============================================================================
-- BASE DE DATOS 3: mini_sivesoft_backend_3 (empresa3)
-- ============================================================================
USE mini_sivesoft_backend_3;

-- Verificar si el usuario 'admin' ya existe
SELECT 'Verificando usuario admin en mini_sivesoft_backend_3...' AS status;

-- Eliminar usuario admin si existe (opcional)
-- DELETE FROM users WHERE username = 'admin';

-- Insertar usuario super_admin
INSERT INTO users (username, password, role, tenantIds)
VALUES (
    'admin',
    @password_hash,
    'super_admin',
    'empresa1,empresa2,empresa3'
)
ON DUPLICATE KEY UPDATE
    password = @password_hash,
    role = 'super_admin',
    tenantIds = 'empresa1,empresa2,empresa3';

SELECT 'Usuario admin creado/actualizado en mini_sivesoft_backend_3 ✅' AS status;

-- ============================================================================
-- VERIFICACIÓN: Mostrar usuarios admin en todas las bases de datos
-- ============================================================================

SELECT '========================================' AS linea;
SELECT 'VERIFICACIÓN DE USUARIOS ADMIN CREADOS' AS titulo;
SELECT '========================================' AS linea;

-- Verificar en base de datos 1
USE mini_sivesoft_backend;
SELECT 
    'mini_sivesoft_backend' AS database_name,
    id,
    username,
    role,
    tenantIds,
    createdAt
FROM users 
WHERE username = 'admin';

-- Verificar en base de datos 2
USE mini_sivesoft_backend_2;
SELECT 
    'mini_sivesoft_backend_2' AS database_name,
    id,
    username,
    role,
    tenantIds,
    createdAt
FROM users 
WHERE username = 'admin';

-- Verificar en base de datos 3
USE mini_sivesoft_backend_3;
SELECT 
    'mini_sivesoft_backend_3' AS database_name,
    id,
    username,
    role,
    tenantIds,
    createdAt
FROM users 
WHERE username = 'admin';

-- ============================================================================
-- RESUMEN
-- ============================================================================
SELECT '========================================' AS linea;
SELECT 'RESUMEN' AS titulo;
SELECT '========================================' AS linea;

SELECT 
    'Usuario: admin' AS info
UNION ALL
SELECT 
    'Password: 12345' AS info
UNION ALL
SELECT 
    'Rol: super_admin' AS info
UNION ALL
SELECT 
    'Acceso a: empresa1, empresa2, empresa3' AS info
UNION ALL
SELECT 
    '✅ Usuario creado en las 3 bases de datos' AS info;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
/*
NOTAS:
1. El password '12345' está encriptado con bcrypt (rounds=10)
2. El usuario 'admin' tiene rol 'super_admin'
3. Tiene acceso a las 3 empresas: empresa1, empresa2, empresa3
4. Si el usuario ya existe, se actualiza (ON DUPLICATE KEY UPDATE)
5. El hash de bcrypt es: $2b$10$xgoxYtO9H7IbsnjkbnKlhOa3CBBpIoAFZCW8T2e0JvT72DOZdLLbW

PARA GENERAR UN NUEVO HASH:
Si necesitas cambiar la contraseña, ejecuta:
node generate-hash.js

Luego copia el hash generado y reemplázalo en la variable @password_hash al inicio de este script.

PARA EJECUTAR ESTE SCRIPT:
mysql -u root -p < create-admin-user.sql

o desde MySQL Workbench:
File > Run SQL Script > Seleccionar este archivo
*/
