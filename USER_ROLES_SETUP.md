# Configuración de Roles de Usuario

Este documento explica cómo configurar y gestionar los roles de usuario en el sistema, especialmente para usuarios que inician sesión con Google.

## Roles Disponibles

El sistema soporta los siguientes roles de usuario:

- **free**: Plan gratuito (por defecto)
- **plata**: Plan intermedio de pago
- **gold**: Plan premium de pago

## Tabla de Control de Roles

Se ha implementado una tabla `user_roles_control` en la base de datos para asignar roles específicos a direcciones de correo electrónico antes de que los usuarios se registren. Esto es especialmente útil para usuarios que inician sesión con Google.

### Estructura de la Tabla

```sql
CREATE TABLE user_roles_control (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('free', 'plata', 'gold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);
```

## Cómo Funciona

1. Cuando un usuario se registra (ya sea mediante formulario o Google):
   - El sistema verifica si existe una entrada en `user_roles_control` para su email
   - Si existe, se le asigna el rol especificado
   - Si no existe, se le asigna el rol 'free' por defecto

2. Para usuarios de Google:
   - Al iniciar sesión por primera vez, se crea automáticamente su cuenta con el rol correspondiente
   - Si ya tienen una cuenta, mantienen su rol actual

## Herramienta de Administración

Se proporciona un script `admin-user-roles.js` para gestionar los roles de usuario:

### Requisitos

- Node.js instalado
- Variables de entorno configuradas en `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_SERVICE_KEY` (clave de servicio con permisos administrativos)

### Comandos Disponibles

#### Asignar un rol a un email

```bash
node admin-user-roles.js assign <email> <role> [notas]
```

Ejemplo:
```bash
node admin-user-roles.js assign usuario@example.com gold "Cliente VIP"
```

#### Listar todos los roles asignados

```bash
node admin-user-roles.js list
```

#### Eliminar una asignación de rol

```bash
node admin-user-roles.js delete <email>
```

Ejemplo:
```bash
node admin-user-roles.js delete usuario@example.com
```

## Implementación en la Base de Datos

Para implementar la tabla de control de roles, ejecute el script SQL proporcionado:

```bash
psql -U <usuario> -d <base_de_datos> -f user-roles-control.sql
```

O ejecute el contenido del archivo `user-roles-control.sql` en su cliente SQL preferido.

## Notas Importantes

- Los cambios en los roles se aplican inmediatamente para nuevos registros
- Para usuarios existentes, los cambios en `user_roles_control` no afectan automáticamente su rol actual; use la herramienta de administración para actualizar ambas tablas
- La tabla tiene habilitada la seguridad a nivel de fila (RLS) para que solo los usuarios con rol 'gold' puedan modificarla