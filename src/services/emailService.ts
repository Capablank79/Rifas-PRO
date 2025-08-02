// Servicio de notificaciones por email
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export interface WinnerNotificationData {
  winnerName: string;
  winnerEmail: string;
  raffleName: string;
  prizeName: string;
  prizePosition: number;
  winningNumber: number;
  drawDate: string;
  sellerName?: string;
}

export interface VendorNotificationData {
  vendorName: string;
  vendorEmail: string;
  raffleName: string;
  winnerName: string;
  prizeName: string;
  prizePosition: number;
  winningNumber: number;
  drawDate: string;
  isTheirCustomer: boolean;
  totalSales?: number;
}

// Función para generar el HTML del email de notificación
export const generateWinnerEmailHTML = (data: WinnerNotificationData): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Felicitaciones! Has ganado</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: var(--easyreef-gradient-primary);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            .winner-number {
                font-size: 48px;
                font-weight: bold;
                color: #28a745;
                text-align: center;
                margin: 20px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .prize-info {
                background-color: #e8f5e8;
                padding: 20px;
                border-radius: 8px;
                border-left: 5px solid #28a745;
                margin: 20px 0;
            }
            .details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .celebration {
                text-align: center;
                font-size: 24px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡FELICITACIONES! 🎉</h1>
                <h2>¡Has ganado en la rifa!</h2>
            </div>
            
            <div class="celebration">
                🏆 ¡Eres el ganador del ${data.prizePosition}° premio! 🏆
            </div>
            
            <div class="winner-number">
                Número ganador: #${data.winningNumber}
            </div>
            
            <div class="prize-info">
                <h3>🎁 Información del Premio</h3>
                <p><strong>Premio:</strong> ${data.prizeName}</p>
                <p><strong>Posición:</strong> ${data.prizePosition}° lugar</p>
                <p><strong>Rifa:</strong> ${data.raffleName}</p>
            </div>
            
            <div class="details">
                <h3>📋 Detalles del Sorteo</h3>
                <p><strong>Ganador:</strong> ${data.winnerName}</p>
                <p><strong>Fecha del sorteo:</strong> ${new Date(data.drawDate).toLocaleString('es-ES')}</p>
                ${data.sellerName ? `<p><strong>Vendedor:</strong> ${data.sellerName}</p>` : ''}
            </div>
            
            <div class="details">
                <h3>📞 Próximos Pasos</h3>
                <p>Para reclamar tu premio, por favor:</p>
                <ul>
                    <li>Conserva este correo como comprobante</li>
                    <li>Contacta a los organizadores de la rifa</li>
                    <li>Presenta una identificación válida</li>
                    <li>Ten a mano tu número ganador: <strong>#${data.winningNumber}</strong></li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Este es un correo automático generado por el sistema de rifas.</p>
                <p>¡Gracias por participar y felicitaciones nuevamente! 🎊</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para enviar email (simulación)
export const sendWinnerNotification = async (data: WinnerNotificationData): Promise<boolean> => {
  try {
    const emailHTML = generateWinnerEmailHTML(data);
    
    // En un entorno real, aquí se integraría con un servicio de email como:
    // - EmailJS
    // - SendGrid
    // - Nodemailer
    // - AWS SES
    // etc.
    
    console.log('📧 Enviando notificación por email a:', data.winnerEmail);
    console.log('📋 Asunto:', `¡Felicitaciones! Has ganado el ${data.prizePosition}° premio en ${data.raffleName}`);
    
    // Simulación de envío de email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Para demostración, mostrar el contenido del email en consola
    console.log('✅ Email enviado exitosamente');
    console.log('📄 Contenido del email generado:', emailHTML.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return false;
  }
};

// Función para generar el HTML del email de notificación para vendedores
export const generateVendorEmailHTML = (data: VendorNotificationData): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resultado del Sorteo - ${data.raffleName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            .winner-info {
                background-color: ${data.isTheirCustomer ? '#e8f5e8' : '#f8f9fa'};
                padding: 20px;
                border-radius: 8px;
                border-left: 5px solid ${data.isTheirCustomer ? '#28a745' : '#6c757d'};
                margin: 20px 0;
            }
            .sales-info {
                background-color: hsl(247, 84%, 95%);
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                border-left: 5px solid var(--easyreef-primary);
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 10px;
                border-radius: 5px;
                border-left: 5px solid #ffc107;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Resultado del Sorteo</h1>
                <h2>${data.raffleName}</h2>
            </div>
            
            ${data.isTheirCustomer ? `
                <div class="highlight">
                    <h3>🎉 ¡Felicitaciones!</h3>
                    <p><strong>Uno de tus clientes ha ganado el ${data.prizePosition}° premio!</strong></p>
                </div>
            ` : `
                <div class="highlight">
                    <h3>📋 Información del Sorteo</h3>
                    <p>Te informamos sobre el resultado del sorteo del ${data.prizePosition}° premio.</p>
                </div>
            `}
            
            <div class="winner-info">
                <h3>${data.isTheirCustomer ? '🏆 Tu Cliente Ganador' : '🏆 Ganador del Sorteo'}</h3>
                <p><strong>Ganador:</strong> ${data.winnerName}</p>
                <p><strong>Premio:</strong> ${data.prizeName}</p>
                <p><strong>Posición:</strong> ${data.prizePosition}° lugar</p>
                <p><strong>Número ganador:</strong> #${data.winningNumber}</p>
                <p><strong>Fecha del sorteo:</strong> ${new Date(data.drawDate).toLocaleString('es-ES')}</p>
            </div>
            
            ${data.totalSales ? `
                <div class="sales-info">
                    <h3>📊 Información de Ventas</h3>
                    <p><strong>Total de ventas:</strong> $${data.totalSales.toLocaleString()}</p>
                </div>
            ` : ''}
            
            <div class="sales-info">
                <h3>📞 Próximos Pasos</h3>
                ${data.isTheirCustomer ? `
                    <p>Como vendedor del número ganador:</p>
                    <ul>
                        <li>Contacta a tu cliente para felicitarlo</li>
                        <li>Ayúdale con el proceso de reclamación del premio</li>
                        <li>Conserva este correo como comprobante</li>
                        <li>Mantén el registro de tus ventas actualizadas</li>
                    </ul>
                ` : `
                    <p>Como participante del sistema de rifas:</p>
                    <ul>
                        <li>Conserva este correo como registro del sorteo</li>
                        <li>Continúa promoviendo futuras rifas</li>
                        <li>Contacta a los organizadores si tienes preguntas</li>
                    </ul>
                `}
            </div>
            
            <div class="footer">
                <p>Este es un correo automático generado por el sistema de rifas.</p>
                <p>¡Gracias por ser parte de nuestro sistema de rifas! 🎊</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para enviar notificación a vendedores
export const sendVendorNotification = async (data: VendorNotificationData): Promise<boolean> => {
  try {
    const emailHTML = generateVendorEmailHTML(data);
    
    console.log('📧 Enviando notificación a vendedor:', data.vendorEmail);
    console.log('📋 Asunto:', `Resultado del sorteo: ${data.raffleName} - ${data.isTheirCustomer ? '¡Tu cliente ganó!' : 'Información del sorteo'}`);
    
    // Simulación de envío de email
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ Notificación a vendedor enviada exitosamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar notificación a vendedor:', error);
    return false;
  }
};