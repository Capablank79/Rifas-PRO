# 🔧 Diagnóstico de Problemas de Email en Producción (Vercel)

Este documento te ayudará a diagnosticar y solucionar problemas con el envío de correos electrónicos en producción usando Vercel y Resend.

## 🚨 Problema Común

Los correos electrónicos se envían correctamente en desarrollo local, pero fallan en producción (Vercel) con errores como:
- "API Key no configurada"
- Variables de entorno `undefined`
- Errores de CORS al llamar directamente a `https://api.resend.com/emails`
- Errores de conexión con Resend

## ✅ Solución Implementada

**IMPORTANTE**: Se ha implementado una solución usando **API Routes de Vercel** para evitar problemas de CORS y manejo de variables de entorno:

- **Archivo**: `/api/send-email.js` - Función serverless que maneja el envío de emails
- **Frontend**: Modificado para usar `/api/send-email` en lugar de llamadas directas a Resend
- **Variables**: Ahora usa variables sin prefijo `VITE_` en el servidor

## Problema Identificado (Método Anterior)
Los correos electrónicos funcionan correctamente en desarrollo local pero fallan en producción en Vercel cuando se usa el método directo de llamadas a la API de Resend.

## 🔧 Configuración Requerida en Vercel

### 1. Variables de Entorno del Servidor (NUEVAS - Requeridas)

En el dashboard de Vercel, configura estas variables **SIN** el prefijo `VITE_`:

```
RESEND_API_KEY=re_tu_clave_real_de_resend
FROM_EMAIL=tu-email@dominio-verificado.com
FROM_NAME=EasyRif Demo
```

### 2. Variables de Entorno del Frontend (Opcionales - Compatibilidad)

Puedes mantener estas para compatibilidad, pero ya no son necesarias:

```
VITE_RESEND_API_KEY=re_tu_clave_real_de_resend
VITE_FROM_EMAIL=tu-email@dominio-verificado.com
VITE_FROM_NAME=EasyRif Demo
```

### 3. Pasos en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables del servidor (sin VITE_)
4. Asegúrate de seleccionar todos los entornos (Production, Preview, Development)
5. Haz un redeploy completo

## Causas Más Comunes (Método Anterior)

### 1. Variables de Entorno No Configuradas en Vercel

**Problema**: Las variables `VITE_*` no están configuradas en el dashboard de Vercel.

**Solución**:
1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar tu proyecto
3. Ir a **Settings** > **Environment Variables**
4. Añadir las siguientes variables:
   ```
   VITE_RESEND_API_KEY=tu_api_key_real
   VITE_FROM_EMAIL=tu_email@dominio.com
   VITE_FROM_NAME=Nombre de tu App
   ```
5. **IMPORTANTE**: Configurar para **Production** environment
6. Hacer **Redeploy** sin usar caché

### 2. Variables Undefined en Build de Producción

**Problema**: Vite no está leyendo las variables de entorno durante el build.

**Verificación**:
- Las variables deben tener prefijo `VITE_`
- Deben estar configuradas en Vercel antes del build
- El build debe ejecutarse después de configurar las variables

### 3. Caché de Vercel

**Problema**: Vercel está sirviendo una versión cacheada sin las variables de entorno.

**Solución**:
1. En Vercel Dashboard, ir a **Deployments**
2. Hacer clic en **Redeploy**
3. **DESMARCAR** "Use existing Build Cache"
4. Confirmar redeploy

## 🛠️ Herramientas de Diagnóstico Incluidas

### Panel de Diagnóstico
Hemos añadido un panel de diagnóstico que se puede usar tanto en desarrollo como en producción:

**En Desarrollo**:
- Se muestra automáticamente en la esquina superior derecha
- Verifica todas las variables de entorno
- Permite probar la API de Resend

**En Producción**:
- Añadir `?debug=env` a cualquier URL de tu sitio
- Ejemplo: `https://tu-app.vercel.app/?debug=env`
- Abre la consola del navegador para ver logs detallados

### Script de Diagnóstico
También incluimos `debug-env-vercel.js` que puedes ejecutar manualmente.

## 📋 Pasos de Diagnóstico

### Paso 1: Verificar Variables en Vercel
1. Ir a Vercel Dashboard > Tu Proyecto > Settings > Environment Variables
2. Verificar que existan:
   - `VITE_RESEND_API_KEY`
   - `VITE_FROM_EMAIL`
   - `VITE_FROM_NAME`
3. Verificar que estén configuradas para **Production**

### Paso 2: Verificar en Producción
1. Ir a tu sitio en producción
2. Añadir `?debug=env` a la URL
3. Abrir **DevTools** > **Console**
4. Buscar el log "=== DIAGNÓSTICO DE VARIABLES DE ENTORNO ==="
5. Verificar si las variables aparecen como "[CONFIGURADA]" o "[NO CONFIGURADA]"

### Paso 3: Probar API de Resend
1. En el panel de diagnóstico, hacer clic en "🧪 Probar API de Email"
2. Verificar la respuesta en la consola
3. Si falla, verificar:
   - API Key válida
   - Email de origen verificado en Resend
   - Límites de rate limiting

### Paso 4: Verificar Logs de Vercel

1. Ir a Vercel Dashboard > Tu Proyecto > **Functions**
2. Buscar logs de errores durante el envío de emails
3. Verificar si hay errores de autenticación con Resend

## 🚨 Problemas Comunes y Soluciones

### Error: "API Key not configured"
**Causa**: `VITE_RESEND_API_KEY` no está disponible
**Solución**: Configurar la variable en Vercel y redeploy

### Error: "Unauthorized" (401)
**Causa**: API Key inválida o expirada
**Solución**: 
1. Verificar API Key en Resend Dashboard
2. Regenerar si es necesario
3. Actualizar en Vercel

### Error: "From email not verified"
**Causa**: El email en `VITE_FROM_EMAIL` no está verificado en Resend
**Solución**: Verificar el dominio/email en Resend Dashboard

### Variables aparecen como "undefined"

**Causa**: Vite no está leyendo las variables durante el build
**Solución**:
1. Verificar que las variables tengan prefijo `VITE_`
2. Configurar en Vercel ANTES del build
3. Redeploy sin caché

## 🔄 Proceso de Solución Paso a Paso

1. **Configurar Variables en Vercel**
   ```
   VITE_RESEND_API_KEY=re_xxxxxxxxx
   VITE_FROM_EMAIL=noreply@tudominio.com
   VITE_FROM_NAME=Tu App Name
   ```

2. **Redeploy sin Caché**
   - Vercel Dashboard > Deployments > Redeploy
   - Desmarcar "Use existing Build Cache"

3. **Verificar con Panel de Diagnóstico**
   - Ir a `https://tu-app.vercel.app/?debug=env`
   - Verificar que todas las variables estén configuradas

4. **Probar Envío de Email**
   - Usar el botón "Probar API de Email" en el panel
   - Verificar respuesta en consola

5. **Si Persiste el Problema**
   - Verificar logs de Vercel
   - Verificar configuración de Resend
   - Considerar rotar API Key

## 📞 Contacto de Soporte

Si después de seguir estos pasos el problema persiste:
1. Capturar screenshot del panel de diagnóstico
2. Copiar logs de la consola del navegador
3. Verificar logs de Vercel Functions
4. Contactar soporte con esta información

---

**Nota**: Este diagnóstico está diseñado específicamente para aplicaciones Vite desplegadas en Vercel que usan Resend para envío de emails.