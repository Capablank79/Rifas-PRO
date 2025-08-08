-- Script SQL para eliminar todos los registros de las tablas users y user_roles_control

-- Eliminar todos los registros de la tabla user_roles_control
DELETE FROM user_roles_control;

-- Eliminar todos los registros de la tabla users
DELETE FROM users;

-- Verificar que las tablas estén vacías
SELECT COUNT(*) FROM user_roles_control;
SELECT COUNT(*) FROM users;