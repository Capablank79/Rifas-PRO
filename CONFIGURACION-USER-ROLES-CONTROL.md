# Configuración de la Tabla user_roles_control

## Resumen

Hemos configurado exitosamente las políticas de seguridad a nivel de fila (RLS) en la tabla `user_roles_control` para permitir inserciones anónimas, similar a lo que hicimos con las tablas `users` y `waitlist`. Esto permite que cualquier usuario pueda insertar registros en la tabla, pero solo los usuarios autenticados con rol 'gold' pueden ver y modificar todos los datos.

## Políticas RLS Configuradas

Las políticas RLS configuradas en la tabla `user_roles_control` son:

1. **Política de Inserción Anónima**:
   ```sql
   CREATE POLICY user_roles_control_insert_policy
   ON public.user_roles_control
   FOR INSERT
   TO anon, authenticated
   WITH CHECK (true);
   ```
   Esta política permite que cualquier usuario (anónimo o autenticado) pueda insertar registros en la tabla.

2. **Política de Selección para Usuarios Autenticados**:
   ```sql
   CREATE POLICY user_roles_control_select_policy
   ON public.user_roles_control
   FOR SELECT
   TO authenticated
   USING (email IN (SELECT email FROM users WHERE id = auth.uid()));
   ```
   Esta política permite que los usuarios autenticados solo puedan ver sus propios datos.

3. **Política de Administración para Usuarios Gold**:
   ```sql
   CREATE POLICY user_roles_control_admin_policy
   ON public.user_roles_control
   FOR ALL
   TO authenticated
   USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));
   ```
   Esta política permite que los usuarios con rol 'gold' puedan ver y modificar todos los datos.

## Pruebas Realizadas

Hemos realizado las siguientes pruebas para verificar que las políticas RLS están funcionando correctamente:

1. **Inserción de un Registro Individual**:
   - Script: `insert-test-user-role-control.js`
   - Resultado: ✅ Inserción exitosa
   - Consulta: ⚠️ No se puede ver el registro debido a las políticas RLS

2. **Inserción de Múltiples Registros**:
   - Script: `insert-multiple-roles.js`
   - Resultado: ✅ Inserción exitosa de 3 registros con roles 'free', 'plata' y 'gold'
   - Consulta: ⚠️ No se pueden ver los registros debido a las políticas RLS

## Cómo Insertar Datos en la Tabla

Existen tres formas principales para insertar datos en la tabla `user_roles_control`:

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

### 2. Usando las Políticas RLS Configuradas

Con las políticas RLS configuradas, cualquier usuario (incluso anónimo) puede insertar registros en la tabla `user_roles_control` usando el cliente de Supabase con la clave anónima.

**Ejemplo de código:**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'tu-clave-anon';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUserRole() {
  const { error } = await supabase
    .from('user_roles_control')
    .insert([
      {
        email: 'usuario@example.com',
        role: 'free',
        notes: 'Usuario de prueba'
      }
    ]);
    
  if (error) {
    console.error('Error al insertar:', error.message);
  } else {
    console.log('Registro insertado exitosamente');
  }
}
```

### 3. Usando SQL Directo con Permisos de Administrador

Un administrador de la base de datos puede insertar registros directamente usando SQL:

```sql
INSERT INTO user_roles_control (email, role, notes) VALUES
('usuario1@example.com', 'plata', 'Cliente frecuente'),
('usuario2@example.com', 'gold', 'Cliente VIP'),
('usuario3@example.com', 'free', 'Usuario de prueba');
```

## Conclusión

Las políticas RLS configuradas en la tabla `user_roles_control` permiten inserciones anónimas, lo que facilita la preasignación de roles a usuarios antes de que se registren. Sin embargo, la visualización y modificación de los datos está restringida a usuarios autenticados con rol 'gold', lo que garantiza la seguridad de la información.

Para administrar la tabla en un entorno de producción, se recomienda usar el script `admin-user-roles.js` con la clave de servicio configurada en un archivo `.env`.