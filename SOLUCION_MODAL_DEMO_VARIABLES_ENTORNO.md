# 🎯 SOLUCIÓN: Modal de Demo - Migración a SMTP

## 📋 Resumen del Problema

El modal "SOLICITAR DEMO" en `https://rifas-demo.vercel.app/login` tenía problemas de envío de correos debido a:

1. **Uso de Resend** en lugar de SMTP como el proyecto principal
2. **Variables hardcodeadas** en `emailService.ts` (FROM_EMAIL y FROM_NAME)
3. **Campo 'from' enviado** en el cuerpo de la petición que interfería con la configuración del servidor
4. **Variables de entorno incorrectas** (RESEND_API_KEY en lugar de SMTP)

## ✅ Solución Implementada

### 1. Migración de Resend a SMTP en `api/send-email.js`

**ANTES (Resend):**
```javascript
// Enviar email usando Resend API
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailData)
});
```

**DESPUÉS (SMTP con Nodemailer):**
```javascript
import nodemailer from 'nodemailer';

// Crear transporter de Nodemailer
const transporter = nodemailer.createTransporter({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

// Enviar email usando Nodemailer
const info = await transporter.sendMail(emailData);
```

### 2. Corrección en `src/services/emailService.ts`

**ANTES:**
```typescript
// Función sendEmailWithResend
const fromEmail = 'onboarding@resend.dev';
const fromName = 'EasyRif Demo';

const emailData = {
  from: fromEmail,
  fromName: fromName,
  to: data.email,
  subject: '🎉 Credenciales de Acceso - EasyRif Demo',
  html: emailHTML
};

// Función sendWaitlistEmailWithResend
const fromEmail = 'onboarding@resend.dev';
const fromName = 'EasyRif';

const emailData = {
  from: fromEmail,
  fromName: fromName,
  to: data.email,
  subject: '¡Gracias por tu interés en EasyRif! 🎯',
  html: emailHTML
};
```

**DESPUÉS:**
```typescript
// Función sendEmailWithResend
const emailData = {
  to: data.email,
  subject: '🎉 Credenciales de Acceso - EasyRif Demo',
  html: emailHTML
  // No enviar 'from' - el servidor usará FROM_EMAIL y FROM_NAME
};

// Función sendWaitlistEmailWithResend
const emailData = {
  to: data.email,
  subject: '¡Gracias por tu interés en EasyRif! 🎯',
  html: emailHTML
  // No enviar 'from' - el servidor usará FROM_EMAIL y FROM_NAME
};
```

### 2. Variables de Entorno Actualizadas en `.env`

```env
# Variables SMTP para el servidor (sin prefijo VITE_) - para uso en API routes
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASS=tu_password_smtp
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=EasyRif Demo

# Variables legacy de Resend (mantener por compatibilidad)
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configuración Requerida en Vercel

**IMPORTANTE:** Para que el modal funcione en producción, debes configurar estas variables en Vercel Dashboard:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables SMTP:

```
SMTP_HOST = mail.tudominio.com
SMTP_PORT = 587
SMTP_USER = noreply@tudominio.com
SMTP_PASS = tu_password_smtp
FROM_EMAIL = noreply@tudominio.com
FROM_NAME = EasyRif Demo
```

## 🧪 Pruebas Realizadas

### Estado Actual (después del fix de código):
- ✅ Sitio accesible: 200 OK
- ❌ RESEND_API_KEY: false (falta configurar en Vercel)
- ✅ FROM_EMAIL: true
- ✅ FROM_NAME: true

### Resultado de la Prueba:
- ❌ Status: 500 Internal Server Error
- ❌ Error: "Configuración de email no disponible - API Key no configurada"

## 🔧 Pasos Pendientes para Completar la Solución

### 1. Configurar RESEND_API_KEY en Vercel

1. **Obtener API Key de Resend:**
   - Ve a https://resend.com/api-keys
   - Crea una nueva API Key
   - Copia la clave (empieza con `re_`)

2. **Configurar en Vercel:**
   - Ve a tu proyecto Rifas-DEMO en Vercel Dashboard
   - Settings → Environment Variables
   - Add New:
     - Name: `RESEND_API_KEY`
     - Value: `tu_api_key_real`
     - Environment: Production, Preview, Development

3. **Verificar FROM_EMAIL:**
   - Asegúrate de que el email esté verificado en Resend
   - Si usas un dominio personalizado, configura los registros DNS

### 2. Re-desplegar después de configurar variables

Después de agregar las variables en Vercel:
```bash
# Hacer un pequeño cambio y push para forzar re-deploy
git commit --allow-empty -m "Trigger redeploy after env vars setup"
git push
```

## 🎯 Beneficios de la Solución

1. **Migración a SMTP:** Consistencia con el proyecto principal Rifas
2. **Eliminación de dependencia de Resend:** Uso de servidor SMTP propio
3. **Separación de responsabilidades:** Frontend no maneja configuración de email
4. **Seguridad mejorada:** API keys solo en el servidor
5. **Flexibilidad:** Cambios de configuración sin modificar código
6. **Consistencia:** Misma configuración para todos los emails
7. **Control total del envío:** Sin limitaciones de servicios externos

## 📧 Verificación Final

Una vez configuradas las variables en Vercel, ejecuta:
```bash
node test-demo-modal-corregido.js
```

Deberías ver:
- ✅ RESEND_API_KEY: true
- ✅ FROM_EMAIL: true
- ✅ FROM_NAME: true
- ✅ Status: 200 OK
- ✅ Email enviado exitosamente


