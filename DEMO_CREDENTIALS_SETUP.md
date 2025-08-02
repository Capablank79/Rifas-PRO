# Sistema de Credenciales Temporales para Demo

## Descripción

Este sistema permite que los usuarios soliciten acceso temporal a la demo de EasyRif a través de un formulario en la landing page. Las credenciales son válidas por 24 horas y se envían automáticamente por email.

## Flujo de Usuario

1. **Solicitud de Acceso**: El usuario llena un formulario en la landing page (https://rifas-landing.vercel.app)
2. **Generación de Credenciales**: El sistema genera automáticamente credenciales únicas temporales
3. **Envío de Email**: Se envía un correo con las credenciales de acceso
4. **Acceso a la Demo**: El usuario usa las credenciales para acceder a la demo
5. **Expiración**: Las credenciales expiran automáticamente después de 24 horas

## Configuración

### 1. Base de Datos (Supabase)

Ejecuta el script `demo-credentials-setup.sql` en tu proyecto de Supabase para:
- Agregar columnas necesarias a la tabla `demo_requests`
- Crear funciones para generar y validar credenciales
- Configurar triggers automáticos
- Establecer políticas de seguridad

### 2. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 3. Dependencias

Instala las dependencias necesarias:

```bash
npm install @supabase/supabase-js
```

## Desarrollo Local

Para desarrollo sin Supabase configurado, el sistema usa credenciales de prueba:

- **Usuario**: `demo_user`
- **Contraseña**: `demo_pass`
- **Validez**: 24 horas (simulado)

## Archivos Modificados

### Landing Page (Proyecto Principal)
- `src/components/DemoForm.tsx` - Formulario actualizado para solicitar acceso
- `src/config/supabase.ts` - Funciones para manejar credenciales
- `src/services/emailService.ts` - Servicio de envío de emails
- `demo-credentials-setup.sql` - Script de base de datos

### Demo App (Proyecto DEMO)
- `src/pages/LoginPage.tsx` - Página de login con formulario de credenciales
- `src/context/AuthContext.tsx` - Autenticación con validación de Supabase
- `src/config/supabase.ts` - Configuración de Supabase para el proyecto demo

## Funcionalidades

### Generación Automática de Credenciales
- Username único basado en timestamp
- Password seguro generado aleatoriamente
- Fecha de expiración automática (24 horas)

### Validación de Credenciales
- Verificación en tiempo real con Supabase
- Validación de expiración
- Manejo de errores y estados

### Seguridad
- Credenciales temporales con expiración automática
- Políticas de seguridad a nivel de base de datos
- Validación tanto en frontend como backend

## Próximos Pasos

1. **Configurar Servicio de Email**: Integrar con SendGrid, Mailgun o similar
2. **Personalizar Templates**: Mejorar el diseño del email con credenciales
3. **Analytics**: Agregar seguimiento de conversiones
4. **Lista de Espera**: Implementar registro para versión final

## Notas Técnicas

- Las credenciales se generan usando funciones de PostgreSQL
- El sistema es compatible con políticas RLS de Supabase
- Fallback automático a credenciales de desarrollo
- Manejo robusto de errores y estados de carga