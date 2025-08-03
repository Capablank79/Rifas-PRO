// API Route para Vercel - Envío de emails con Resend
// Este archivo debe estar en /api/send-email.js para funcionar como serverless function

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Manejar verificación de variables de entorno
  if (req.method === 'GET' && req.query.check === 'env') {
    const envStatus = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      FROM_EMAIL: !!process.env.FROM_EMAIL,
      FROM_NAME: !!process.env.FROM_NAME
    };
    
    return res.status(200).json({ envStatus });
  }

  // Solo permitir método POST para envío de emails
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }



  try {
    const { to, subject, html, from } = req.body;

    // Validar datos requeridos
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: to, subject, html' 
      });
    }

    // Obtener variables de entorno del servidor
    const resendApiKey = process.env.RESEND_API_KEY;
    const defaultFromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const defaultFromName = process.env.FROM_NAME || 'EasyRif Demo';

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY no configurada en el servidor');
      return res.status(500).json({ 
        error: 'Configuración de email no disponible',
        details: 'API Key no configurada'
      });
    }

    // Preparar datos del email
    const emailData = {
      from: from || `${defaultFromName} <${defaultFromEmail}>`,
      to: to,
      subject: subject,
      html: html
    };

    console.log('📧 Enviando email desde servidor:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from
    });

    // Enviar email usando Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado exitosamente:', responseData.id);
      return res.status(200).json({
        success: true,
        emailId: responseData.id,
        message: 'Email enviado correctamente'
      });
    } else {
      console.error('❌ Error de Resend API:', responseData);
      return res.status(response.status).json({
        error: 'Error al enviar email',
        details: responseData
      });
    }

  } catch (error) {
    console.error('❌ Error en API de envío:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}