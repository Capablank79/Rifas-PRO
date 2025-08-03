# 🔧 Configuración de Variables de Entorno en Vercel - DEMO

## 🚨 Error Actual

**Error**: `❌ Error en API route (500): Configuración de email no disponible`

**Causa**: Las variables de entorno del servidor (sin prefijo `VITE_`) no están configuradas en Vercel.

## ✅ Solución: Configurar Variables en Vercel Dashboard

### 1. Acceder al Dashboard de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Busca y selecciona tu proyecto **Rifas-DEMO**
3. Ve a **Settings** → **Environment Variables**

### 2. Variables REQUERIDAS (Sin prefijo VITE_)

Configura estas variables **EXACTAMENTE** como se muestra:

```
RESEND_API_KEY=re_tu_clave_real_de_resend
FROM_EMAIL=tu-email@dominio-verificado.com
FROM_NAME=EasyRif Demo
```

### 3. Pasos Detallados

1. **Agregar RESEND_API_KEY**:
   - Name: `RESEND_API_KEY`
   - Value: Tu API key real de Resend (empieza con `re_`)
   - Environment: Seleccionar **Production**, **Preview**, y **Development**

2. **Agregar FROM_EMAIL**:
   - Name: `FROM_EMAIL`
   - Value: Un email verificado en tu cuenta de Resend
   - Environment: Seleccionar **Production**, **Preview**, y **Development**

3. **Agregar FROM_NAME**:
   - Name: `FROM_NAME`
   - Value: `EasyRif Demo`
   - Environment: Seleccionar **Production**, **Preview**, y **Development**

### 4. Variables Opcionales (Compatibilidad)

Puedes mantener estas para compatibilidad:

```
VITE_RESEND_API_KEY=re_tu_clave_real_de_resend
VITE_FROM_EMAIL=tu-email@dominio-verificado.com
VITE_FROM_NAME=EasyRif Demo
```

## 🔄 Después de Configurar

### 1. Redeploy Obligatorio

1. Ve a **Deployments** en tu proyecto
2. Haz clic en **Redeploy** en el último deployment
3. **IMPORTANTE**: Desmarca "Use existing Build Cache"
4. Confirma el redeploy

### 2. Verificar Funcionamiento

1. Espera a que termine el deployment
2. Ve a tu sitio en producción
3. Abre el panel de diagnóstico (esquina superior derecha)
4. Haz clic en "🧪 Probar API de Email"
5. Verifica que no aparezca el error 500

## 🛠️ Troubleshooting

### Error: "API Key not configured"
- **Causa**: `RESEND_API_KEY` no está configurada o tiene un valor incorrecto
- **Solución**: Verificar que la variable esté configurada SIN el prefijo `VITE_`

### Error: "From email not verified"
- **Causa**: El email en `FROM_EMAIL` no está verificado en Resend
- **Solución**: Verificar el dominio en tu dashboard de Resend

### Error: "Unauthorized" (401)
- **Causa**: API Key inválida o expirada
- **Solución**: Regenerar API Key en Resend y actualizar en Vercel

## 📋 Checklist de Verificación

- [ ] `RESEND_API_KEY` configurada en Vercel (sin VITE_)
- [ ] `FROM_EMAIL` configurada en Vercel (sin VITE_)
- [ ] `FROM_NAME` configurada en Vercel (sin VITE_)
- [ ] Variables configuradas para Production environment
- [ ] Redeploy realizado sin caché
- [ ] Email de origen verificado en Resend
- [ ] Prueba de envío exitosa desde panel de diagnóstico

## 🎯 Resultado Esperado

Después de seguir estos pasos, el panel de diagnóstico debería mostrar:

```
✅ API route funcionando correctamente
📧 Email enviado exitosamente
```

---

**Nota**: Estas variables son específicas para las funciones serverless de Vercel y NO deben tener el prefijo `VITE_`.