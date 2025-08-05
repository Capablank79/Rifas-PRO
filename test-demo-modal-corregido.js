// Script de prueba para verificar que el modal de demo funciona después del fix
// Simula exactamente el comportamiento del modal corregido en Rifas-DEMO

async function testModalDemoCorregido() {
  console.log('🎯 PRUEBA FINAL DEL MODAL DE DEMO CORREGIDO (RIFAS-DEMO)');
  console.log('=======================================================');
  
  try {
    // PASO 1: Verificar que el sitio está accesible
    console.log('\n🌐 PASO 1: Verificando accesibilidad del sitio...');
    const siteResponse = await fetch('https://rifas-demo.vercel.app/');
    console.log(`✅ Sitio accesible: ${siteResponse.status} ${siteResponse.statusText}`);
    
    // PASO 2: Verificar variables de entorno del servidor
    console.log('\n🔧 PASO 2: Verificando variables de entorno del servidor...');
    const envResponse = await fetch('https://rifas-demo.vercel.app/api/send-email?check=env');
    const envResult = await envResponse.json();
    
    console.log('Variables de entorno en servidor (SMTP):');
    Object.entries(envResult.envStatus).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`${status} ${key}: ${value}`);
    });
    
    // Verificar que todas las variables SMTP estén configuradas
    const smtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const smtpConfigured = smtpVars.every(varName => envResult.envStatus[varName]);
    
    if (!smtpConfigured) {
      console.log('\n⚠️ ADVERTENCIA: Faltan variables SMTP. Configurar en Vercel:');
      smtpVars.forEach(varName => {
        if (!envResult.envStatus[varName]) {
          console.log(`❌ ${varName}: Falta configurar`);
        }
      });
    }
    
    // PASO 3: Simular envío del modal de demo con la nueva configuración
    console.log('\n📧 PASO 3: Simulando envío del modal de demo corregido...');
    
    const credencialesTest = {
      nombre: "Usuario Test Modal Demo",
      email: "jlloyola@gmail.com", // Cambia por tu email
      username: `demo_modal_${Date.now()}`,
      password: 'demo123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Template HTML simplificado para la prueba
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Credenciales EasyRif Demo</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">🎉 ¡Bienvenido a EasyRif Demo!</h1>
            
            <p>Hola <strong>${credencialesTest.nombre}</strong>,</p>
            
            <p>Tu solicitud de demo ha sido procesada exitosamente. Aquí tienes tus credenciales de acceso:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📋 Credenciales de Acceso</h3>
                <p><strong>Usuario:</strong> ${credencialesTest.username}</p>
                <p><strong>Contraseña:</strong> ${credencialesTest.password}</p>
                <p><strong>Válido hasta:</strong> ${new Date(credencialesTest.expires_at).toLocaleDateString('es-ES')}</p>
            </div>
            
            <p>Puedes acceder a la demo en: <a href="https://rifas-demo.vercel.app/login">https://rifas-demo.vercel.app/login</a></p>
            
            <p>¡Disfruta explorando EasyRif!</p>
            
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">Este email fue enviado desde el modal de demo corregido</p>
        </div>
    </body>
    </html>
    `;
    
    // IMPORTANTE: Ahora NO enviamos el campo 'from' - el servidor usará sus variables
    const requestBody = {
      to: credencialesTest.email,
      subject: '🎉 Credenciales de Acceso - EasyRif Demo (PRUEBA MODAL CORREGIDO)',
      html: htmlTemplate
      // NO incluir 'from' - el servidor usará FROM_EMAIL y FROM_NAME
    };
    
    console.log('📦 Datos de la petición (SIN campo from):');
    console.log(`📧 TO: ${requestBody.to}`);
    console.log(`📝 SUBJECT: ${requestBody.subject}`);
    console.log(`📄 HTML: ${htmlTemplate.length} caracteres`);
    console.log('🚫 FROM: NO ENVIADO (servidor usará sus variables)');
    
    const response = await fetch('https://rifas-demo.vercel.app/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`\n📊 Respuesta del servidor:`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n🎉 ¡ÉXITO! Email enviado con la configuración corregida');
      console.log('📧 Email ID:', result.emailId);
      console.log('📧 Message:', result.message);
      
      console.log('\n✅ CONCLUSIÓN: El modal de demo está CORREGIDO');
      console.log('🎯 El modal de solicitud de demo ahora debería funcionar correctamente');
      console.log('📬 Revisa tu bandeja de entrada para confirmar la recepción');
      
    } else {
      const error = await response.json();
      console.error('\n❌ ERROR: Aún hay problemas con el envío');
      console.error('❌ Error:', error);
      
      if (error.details) {
        console.error('❌ Detalles:', error.details);
      }
      
      console.log('\n🔍 DIAGNÓSTICO ADICIONAL NECESARIO:');
      console.log('   1. Verificar variables de entorno en Vercel Dashboard');
      console.log('   2. Revisar configuración SMTP');
      console.log('   3. Verificar permisos del dominio');
    }
    
  } catch (error) {
    console.error('❌ ERROR GENERAL en prueba del modal:', error);
    console.error('❌ Stack:', error.stack);
  }
}

// Ejecutar la prueba del modal
testModalDemoCorregido()
  .then(() => {
    console.log('\n🏁 Prueba del modal de demo completada');
  })
  .catch(error => {
    console.error('💥 Error fatal en prueba del modal:', error);
  });