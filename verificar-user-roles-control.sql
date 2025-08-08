-- Script para verificar la creación de la tabla user_roles_control

-- Mostrar los tipos ENUM disponibles
\dT+ user_role;

-- Verificar si la tabla existe
\dt user_roles_control;

-- Intentar crear la tabla (si no existe)
CREATE TABLE IF NOT EXISTS user_roles_control (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('free', 'plata', 'gold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_user_roles_control_email ON user_roles_control(email);

-- Comentarios en la tabla
COMMENT ON TABLE user_roles_control IS 'Tabla para asignar roles predeterminados a usuarios antes de su registro';
COMMENT ON COLUMN user_roles_control.email IS 'Dirección de correo electrónico del usuario';
COMMENT ON COLUMN user_roles_control.role IS 'Rol a asignar: free, plata o gold';
COMMENT ON COLUMN user_roles_control.notes IS 'Notas adicionales sobre la asignación de rol';

-- Función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el timestamp automáticamente
CREATE TRIGGER update_user_roles_control_updated_at
BEFORE UPDATE ON user_roles_control
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para seguridad
-- Habilitar RLS en la tabla
ALTER TABLE user_roles_control ENABLE ROW LEVEL SECURITY;

-- Política para que solo los usuarios con rol gold puedan ver y modificar
CREATE POLICY admin_policy ON user_roles_control
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));

-- Insertar algunos datos de prueba
INSERT INTO user_roles_control (email, role, notes) VALUES
('test1@example.com', 'plata', 'Cliente frecuente'),
('test2@example.com', 'gold', 'Cliente VIP'),
('test3@example.com', 'free', 'Usuario de prueba');

-- Verificar los datos insertados
SELECT * FROM user_roles_control;

-- Verificar la política RLS
-- Esto debería mostrar los usuarios con rol 'gold' que pueden administrar la tabla
SELECT id, email, role FROM users WHERE role = 'gold';