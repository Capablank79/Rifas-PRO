# Flujo de Login con Google Auth y Asignación de Roles

## Resumen del Proceso

Cuando un usuario se registra o inicia sesión con Google Auth, ocurre el siguiente flujo:

1. El usuario hace clic en el botón de login con Google
2. Supabase Auth maneja la autenticación con Google
3. Al completarse la autenticación, se crea automáticamente un registro en la tabla `auth.users` de Supabase
4. Un trigger de Supabase verifica si existe un registro en `user_roles_control` para el email del usuario
5. Si existe, asigna ese rol al usuario en la tabla `users`
6. Si no existe, asigna el rol 'free' por defecto
7. El usuario es redirigido a la página correspondiente según su rol (HomePageFree.tsx para usuarios 'free')

## Tablas Involucradas

### 1. Tabla `users`

Esta tabla almacena la información principal de los usuarios registrados:

- **id**: UUID del usuario (coincide con auth.users)
- **email**: Correo electrónico del usuario
- **role**: Rol asignado ('free', 'plata', 'gold')
- **created_at**: Fecha de creación
- **updated_at**: Fecha de actualización

### 2. Tabla `user_roles_control`

Esta tabla se utiliza para preasignar roles a direcciones de correo electrónico antes de que los usuarios se registren:

- **id**: ID único del registro
- **email**: Correo electrónico al que se asigna el rol
- **role**: Rol asignado ('free', 'plata', 'gold')
- **created_at**: Fecha de creación
- **updated_at**: Fecha de actualización
- **notes**: Notas adicionales (opcional)

## Políticas RLS Configuradas

Hemos configurado las siguientes políticas RLS en ambas tablas:

### Tabla `users`

1. **Política de Inserción Anónima**: Permite que cualquier usuario (anónimo o autenticado) pueda insertar registros.
2. **Política de Selección para Usuarios Autenticados**: Permite que los usuarios autenticados solo puedan ver sus propios datos.
3. **Política de Actualización para Usuarios Autenticados**: Permite que los usuarios autenticados solo puedan actualizar sus propios datos.
4. **Política de Administración para Usuarios Gold**: Permite que los usuarios con rol 'gold' puedan ver y modificar todos los datos.

### Tabla `user_roles_control`

1. **Política de Inserción Anónima**: Permite que cualquier usuario (anónimo o autenticado) pueda insertar registros.
2. **Política de Selección para Usuarios Autenticados**: Permite que los usuarios autenticados solo puedan ver sus propios datos.
3. **Política de Administración para Usuarios Gold**: Permite que los usuarios con rol 'gold' puedan ver y modificar todos los datos.

## Flujo Detallado de Login con Google

1. **Inicio del Proceso**:
   - El usuario accede a la aplicación y hace clic en el botón "Iniciar sesión con Google"
   - Este botón está implementado en el componente `SocialLoginButtons.tsx`

2. **Autenticación con Google**:
   - Supabase Auth maneja la autenticación OAuth con Google
   - Google devuelve la información del usuario (email, nombre, etc.)
   - Supabase crea o actualiza un registro en la tabla `auth.users`

3. **Creación del Usuario en la Tabla `users`**:
   - Un trigger de Supabase detecta la creación del usuario en `auth.users`
   - El trigger verifica si existe un registro en `user_roles_control` para el email del usuario
   - Si existe, asigna ese rol al usuario en la tabla `users`
   - Si no existe, asigna el rol 'free' por defecto
   - Se crea un nuevo registro en la tabla `users` con el ID, email y rol del usuario

4. **Redirección según el Rol**:
   - El componente `AuthContext.tsx` verifica el rol del usuario
   - Si el rol es 'free', redirige a `HomePageFree.tsx`
   - Si el rol es 'plata' o 'gold', redirige a otras páginas según corresponda

## Prueba del Flujo

1. **Limpieza de Tablas**:
   - Ejecuta el script `limpiar-tablas.js` para eliminar todos los registros de las tablas `users` y `user_roles_control`
   - Esto asegura que estamos partiendo de un estado limpio

2. **Preasignación de Rol (Opcional)**:
   - Si deseas preasignar un rol específico a tu cuenta de Google, ejecuta:
   ```
   node admin-user-roles.js assign tu-email@gmail.com free "Usuario de prueba"
   ```

3. **Login con Google**:
   - Accede a la aplicación y haz clic en "Iniciar sesión con Google"
   - Selecciona tu cuenta de Google
   - Serás redirigido a `HomePageFree.tsx` si todo está configurado correctamente

4. **Verificación en Supabase**:
   - Verifica que se haya creado un registro en la tabla `users` con tu email y el rol 'free'
   - Si preasignaste un rol diferente, verifica que se haya asignado correctamente

## Solución de Problemas

1. **No se crea el registro en `users`**:
   - Verifica que las políticas RLS estén configuradas correctamente
   - Asegúrate de que el trigger de Supabase esté funcionando

2. **No se asigna el rol correcto**:
   - Verifica que el registro en `user_roles_control` tenga el email exacto de tu cuenta de Google
   - Asegúrate de que el rol esté escrito correctamente ('free', 'plata', 'gold')

3. **No se redirige a la página correcta**:
   - Verifica la lógica de redirección en `AuthContext.tsx`
   - Asegúrate de que las rutas estén configuradas correctamente