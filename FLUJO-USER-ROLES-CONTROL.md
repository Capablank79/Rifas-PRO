# Flujo para Llenar la Tabla user_roles_control

## Situación Actual

Actualmente, la tabla `user_roles_control` aparece vacía cuando intentamos consultarla debido a las políticas de seguridad a nivel de fila (RLS) configuradas. Estas políticas restringen la visualización y modificación de los datos solo a usuarios autenticados con rol 'gold'.

## Políticas RLS Actuales

La tabla `user_roles_control` tiene configurada la siguiente política RLS:

```sql
CREATE POLICY admin_policy ON user_roles_control
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));
```

Esta política significa que solo los usuarios autenticados con rol 'gold' pueden ver y modificar los datos en esta tabla.

## Flujos para Llenar la Tabla

Existen tres formas principales para llenar la tabla `user_roles_control`:

### 1. Usando el Script Administrativo

El script `admin-user-roles.js` está diseñado específicamente para administrar la tabla `user_roles_control`. Este script requiere la clave de servicio de Supabase (`VITE_SUPABASE_SERVICE_KEY`) que tiene permisos elevados para saltarse las restricciones de RLS.

**Ejemplo de uso:**

```bash
# Configurar variables de entorno (crear archivo .env con las claves)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_SERVICE_KEY=tu-clave-de-servicio

# Asignar un rol a un email
node admin-user-roles.js assign usuario@example.com gold "Usuario VIP"

# Listar todos los roles asignados
node admin-user-roles.js list

# Eliminar una asignación de rol
node admin-user-roles.js delete usuario@example.com
```

### 2. Modificando las Políticas RLS

Podemos modificar las políticas RLS para permitir inserciones anónimas, similar a lo que hicimos con las tablas `users` y `waitlist`. Hemos creado el script `user-roles-control-rls-policy.sql` que configura estas políticas.

Una vez aplicadas estas políticas, cualquier usuario (incluso anónimo) podrá insertar registros en la tabla, pero solo los usuarios autenticados con rol 'gold' podrán ver y modificar todos los registros.

**Ejemplo de inserción después de modificar las políticas:**

Hemos creado el script `insert-test-user-role-control.js` que demuestra cómo insertar un registro en la tabla `user_roles_control` con las nuevas políticas RLS.

### 3. Usando SQL Directo con Permisos de Administrador

Un administrador de la base de datos puede insertar registros directamente usando SQL:

```sql
INSERT INTO user_roles_control (email, role, notes) VALUES
('usuario1@example.com', 'plata', 'Cliente frecuente'),
('usuario2@example.com', 'gold', 'Cliente VIP'),
('usuario3@example.com', 'free', 'Usuario de prueba');
```

## Flujo Normal de Asignación de Roles

El flujo normal para la asignación de roles en la aplicación es:

1. **Preasignación de Roles**: Un administrador asigna roles específicos a direcciones de correo electrónico en la tabla `user_roles_control` usando el script `admin-user-roles.js` o SQL directo.

2. **Registro de Usuario**: Cuando un usuario se registra (ya sea mediante formulario o Google):
   - El sistema verifica si existe una entrada en `user_roles_control` para su email
   - Si existe, se le asigna el rol especificado
   - Si no existe, se le asigna el rol 'free' por defecto

3. **Actualización de Roles**: Si un usuario ya registrado necesita cambiar de rol, un administrador puede:
   - Actualizar su rol en la tabla `user_roles_control` usando el script `admin-user-roles.js`
   - El script también actualizará automáticamente el rol en la tabla `users` si el usuario ya existe

## Recomendaciones

1. **Para Administración Regular**: Usar el script `admin-user-roles.js` con la clave de servicio configurada en un archivo `.env`.

2. **Para Desarrollo/Pruebas**: Considerar modificar las políticas RLS para permitir inserciones anónimas usando el script `user-roles-control-rls-policy.sql`.

3. **Para Producción**: Mantener las políticas RLS restrictivas y usar exclusivamente el script administrativo o SQL directo con permisos elevados.

## Importante

La tabla `user_roles_control` está diseñada para preasignar roles a usuarios antes de que se registren. Los cambios en esta tabla no afectan automáticamente a los usuarios ya existentes en la tabla `users`, a menos que se use el script `admin-user-roles.js` que actualiza ambas tablas.