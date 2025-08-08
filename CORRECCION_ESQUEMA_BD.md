# Corrección del Esquema de Base de Datos

## Problemas Detectados

Se identificaron dos errores en la creación de la tabla `user_roles_control`:

1. **Error de columna inexistente**:
   ```
   ERROR: 42703: column "auth_id" does not exist
   ```
   Este error ocurrió porque la política RLS hacía referencia a una columna `auth_id` en la tabla `users` que no existe en el esquema actual.

2. **Error de valor inválido para ENUM**:
   ```
   ERROR: 22P02: invalid input value for enum user_role: "admin"
   ```
   Este error ocurrió porque la política RLS hacía referencia a un rol 'admin' que no es un valor válido para el tipo ENUM `user_role`, que solo acepta 'free', 'plata' y 'gold'.

## Correcciones Realizadas

1. **Correcciones en `user-roles-control.sql`**:
   - Se modificó la política RLS para usar la columna `id` en lugar de `auth_id`:
   ```sql
   USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));
   ```
   - Se cambió el rol 'admin' por 'gold' para cumplir con los valores válidos del ENUM `user_role`:

2. **Corrección en `FreePlanPage.tsx`**:
   - Se modificó la consulta para verificar usuarios existentes:
   ```typescript
   .eq('id', session.user.id)
   ```
   - Se actualizó la inserción de usuarios para usar `id` en lugar de `auth_id`:
   ```typescript
   {
     id: session.user.id,
     email: session.user.email,
     name: session.user.user_metadata.full_name || session.user.email,
     role: roleToAssign
   }
   ```

3. **Corrección en `AuthContext.tsx`**:
   - Se modificó la consulta para obtener datos del usuario:
   ```typescript
   .eq('id', session.user.id)
   ```

## Guía para Evitar Errores Similares

### Antes de Crear Nuevas Tablas o Campos

1. **Examinar el Esquema Existente**:
   - Revisar `database-schema.sql` para entender la estructura actual de las tablas.
   - Verificar los nombres de columnas existentes, especialmente las claves primarias y foráneas.

2. **Verificar Relaciones**:
   - En Supabase, la autenticación usa `auth.uid()` que debe coincidir con la columna `id` de la tabla `users`.
   - No usar `auth_id` como columna separada, ya que la tabla `users` usa `id` como clave primaria.

3. **Probar Scripts SQL**:
   - Crear scripts de prueba como `test-user-roles-control.sql` para verificar la creación de tablas.
   - Ejecutar estos scripts en un entorno de desarrollo antes de aplicarlos en producción.

4. **Mantener Consistencia**:
   - Usar los mismos nombres de columnas en todo el código.
   - Seguir las convenciones establecidas en el esquema existente.

### Herramientas Útiles

- **Script `check-db.js`**: Utilizar para verificar la conexión a la base de datos y listar las tablas disponibles.
- **Script `check-tables.js`**: Utilizar para examinar la estructura de las tablas existentes.

## Conclusión

La corrección de estos errores garantiza que la tabla `user_roles_control` se pueda crear correctamente y que las funcionalidades de asignación de roles a usuarios funcionen como se espera. Siguiendo las guías mencionadas, se pueden evitar errores similares en el futuro.