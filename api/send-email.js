// API Route para Vercel - Envío de emails con cPanel SMTP usando Nodemailer
// Este archivo debe estar en /api/send-email.js para funcionar como serverless function

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
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
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
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
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const defaultFromEmail = process.env.FROM_EMAIL || smtpUser;
    const defaultFromName = process.env.FROM_NAME || 'EasyRif Demo';

    // Validar configuración SMTP
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('❌ Configuración SMTP incompleta');
      return res.status(500).json({ 
        error: 'Configuración de email no disponible',
        details: 'Configuración SMTP incompleta. Verifica SMTP_HOST, SMTP_USER y SMTP_PASS'
      });
    }

    // Crear transporter de Nodemailer
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true para puerto 465, false para otros puertos
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Verificar conexión SMTP (opcional, pero recomendado)
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP verificada correctamente');
    } catch (verifyError) {
      console.warn('⚠️ Advertencia en verificación SMTP:', verifyError.message);
    }

    // Preparar datos del email
    const emailData = {
      from: from || `${defaultFromName} <${defaultFromEmail}>`,
      to: to,
      subject: subject,
      html: html
    };

    console.log('📧 Enviando email desde servidor SMTP:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      host: smtpHost,
      port: smtpPort
    });

    // Enviar email usando Nodemailer
    const info = await transporter.sendMail(emailData);

    console.log('✅ Email enviado exitosamente:', info.messageId);
    return res.status(200).json({
      success: true,
      emailId: info.messageId,
      message: 'Email enviado correctamente',
      response: info.response
    });

  } catch (error) {
    console.error('❌ Error en API de envío:', error);
    
    let errorMessage = 'Error interno del servidor';
    let errorDetails = error.message;
    
    // Clasificar errores SMTP comunes
    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación SMTP';
      errorDetails = 'Credenciales SMTP incorrectas. Verifica SMTP_USER y SMTP_PASS';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Error de conexión SMTP';
      errorDetails = 'No se pudo conectar al servidor SMTP. Verifica host y puerto';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout de conexión SMTP';
      errorDetails = 'El servidor SMTP no responde. Verifica la configuración';
    }
    
    return res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      code: error.code
    });
  }
}