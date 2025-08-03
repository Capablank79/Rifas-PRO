# 📧 Configuración del Servicio de Email

Este documento explica cómo configurar el envío automático de emails con credenciales de demo usando Resend.

## 🚀 Configuración de Resend

### 1. Crear cuenta en Resend
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Configurar dominio (Recomendado)
1. En el dashboard de Resend, ve a "Domains"
2. Agrega tu dominio (ej: `tudominio.com`)
3. Configura los registros DNS según las instrucciones
4. Espera la verificación del dominio

### 3. Obtener API Key
1. Ve a "API Keys" en el dashboard
2. Crea una nueva API Key
3. Copia la clave generada

### 4. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example` y configura:

```env
# Email Service Configuration (Resend)
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FROM_EMAIL=noreply@tudominio.com
VITE_FROM_NAME=EasyRif Demo
```

## 📋 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|----------|
| `VITE_RESEND_API_KEY` | API Key de Resend | `re_123abc...` |
| `VITE_FROM_EMAIL` | Email remitente | `noreply@tudominio.com` |
| `VITE_FROM_NAME` | Nombre del remitente | `EasyRif Demo` |

## 🔧 Funcionamiento

### Flujo de envío de emails
1. Usuario solicita demo en el formulario
2. Se generan credenciales automáticamente
3. Se envía email con credenciales usando Resend
4. Se marca el email como enviado en la base de datos

### Template del email
El email incluye:
- 🎉 Mensaje de bienvenida
- 🔑 Credenciales de acceso (usuario y contraseña)
- ⏰ Fecha de expiración
- 🔗 Enlace directo a la demo
- 📋 Instrucciones de uso

## 🧪 Testing

### Modo desarrollo
En desarrollo, el sistema:
- Muestra información detallada en consola
- Intenta envío real si Resend está configurado
- Simula éxito si no hay configuración

### Verificar envío
```javascript
// En la consola del navegador verás:
📧 ENVIANDO EMAIL DE CREDENCIALES:
Para: usuario@ejemplo.com
Nombre: Juan Pérez
Usuario: demo_user_123
Contraseña: pass_456
Expira: 15 de enero de 2024, 14:30
✅ Email enviado exitosamente: email_id_123
```

## 🚨 Troubleshooting

### Error: "VITE_RESEND_API_KEY no configurada"
- Verifica que el archivo `.env` existe
- Confirma que la variable está correctamente escrita
- Reinicia el servidor de desarrollo

### Error: "401 Unauthorized"
- Verifica que la API Key es correcta
- Confirma que la API Key no ha expirado
- Revisa los permisos de la API Key

### Error: "403 Forbidden"
- Verifica que el dominio está verificado en Resend
- Confirma que el email remitente usa el dominio verificado
- Revisa los límites de tu plan de Resend

### Emails no llegan
- Revisa la carpeta de spam
- Verifica que el dominio no está en blacklist
- Confirma la configuración DNS del dominio

## 📊 Límites de Resend

### Plan gratuito
- 3,000 emails/mes
- 100 emails/día
- Perfecto para testing y demos

### Plan Pro
- 50,000 emails/mes
- Sin límite diario
- Soporte prioritario

## 🔐 Seguridad

### Buenas prácticas
- ✅ Nunca commitear API Keys al repositorio
- ✅ Usar variables de entorno
- ✅ Rotar API Keys periódicamente
- ✅ Usar dominios verificados
- ✅ Monitorear uso de la API

### Variables sensibles
Asegúrate de que estas variables estén en `.gitignore`:
```
.env
.env.local
.env.production
```

## 🔄 Alternativas

Si prefieres otro servicio de email:

### SendGrid
```javascript
// Reemplazar la función sendEmailWithResend
const sendEmailWithSendGrid = async (credentials) => {
  // Implementación con SendGrid API
}
```

### EmailJS
```javascript
// Para envío desde frontend
import emailjs from '@emailjs/browser'
```

### Nodemailer + SMTP
```javascript
// Para usar con servidor propio
const nodemailer = require('nodemailer')
```

## 📝 Logs y Monitoreo

### En desarrollo
- Logs detallados en consola
- Información de debugging
- Simulación cuando no hay configuración

### En producción
- Logs mínimos por seguridad
- Solo errores críticos
- Métricas de envío

## ✅ Checklist de implementación

- [ ] Cuenta de Resend creada
- [ ] Dominio configurado y verificado
- [ ] API Key generada
- [ ] Variables de entorno configuradas
- [ ] Archivo `.env` en `.gitignore`
- [ ] Testing en desarrollo
- [ ] Verificación de emails recibidos
- [ ] Configuración en producción
- [ ] Monitoreo de límites

---

**¡Listo!** Con esta configuración, los usuarios recibirán automáticamente sus credenciales de demo por email al solicitar acceso.