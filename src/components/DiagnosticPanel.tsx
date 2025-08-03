import React, { useEffect, useState } from 'react';

interface DiagnosticData {
  mode: string;
  isProd: boolean;
  isDev: boolean;
  envVars: Record<string, string | undefined>;
  missingVars: string[];
  timestamp: string;
}

const DiagnosticPanel: React.FC = () => {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [emailTestResult, setEmailTestResult] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en desarrollo o si se pasa un parámetro especial
    const urlParams = new URLSearchParams(window.location.search);
    const showDiagnostic = import.meta.env.DEV || urlParams.get('debug') === 'env';
    
    setIsVisible(showDiagnostic);
    
    if (showDiagnostic) {
      runDiagnostic();
    }
  }, []);

  const runDiagnostic = () => {
    console.log('=== DIAGNÓSTICO DE VARIABLES DE ENTORNO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Environment Mode:', import.meta.env.MODE);
    console.log('Is Production:', import.meta.env.PROD);
    console.log('Is Development:', import.meta.env.DEV);

    const envVars = {
      VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
      VITE_FROM_EMAIL: import.meta.env.VITE_FROM_EMAIL,
      VITE_FROM_NAME: import.meta.env.VITE_FROM_NAME
    };

    console.log('\n=== VARIABLES DE ENTORNO ===');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${key}:`, value ? `[CONFIGURADA] ${value.substring(0, 10)}...` : '[NO CONFIGURADA]');
    });

    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingVars.length > 0) {
      console.warn('\n⚠️ VARIABLES FALTANTES:', missingVars);
    } else {
      console.log('\n✅ Todas las variables están configuradas');
    }

    setDiagnosticData({
      mode: import.meta.env.MODE,
      isProd: import.meta.env.PROD,
      isDev: import.meta.env.DEV,
      envVars,
      missingVars,
      timestamp: new Date().toISOString()
    });
  };

  const testEmailAPI = async () => {
    setEmailTestResult('🔄 Probando API route de email...');
    
    const fromEmail = import.meta.env.VITE_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = import.meta.env.VITE_FROM_NAME || 'EasyRif Demo';
    
    try {
      // Probar nuestra API route en lugar de llamar directamente a Resend
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test de diagnóstico desde ' + (import.meta.env.PROD ? 'PRODUCCIÓN' : 'DESARROLLO'),
          html: `<p>Este es un test de diagnóstico ejecutado el ${new Date().toISOString()}</p><p>Entorno: ${import.meta.env.PROD ? 'PRODUCCIÓN' : 'DESARROLLO'}</p>`,
          from: `${fromName} <${fromEmail}>`
        })
      });
      
      console.log('Status de respuesta API route:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setEmailTestResult(`✅ API route funciona correctamente. Email ID: ${data.emailId}`);
        console.log('✅ API route funciona correctamente', data);
      } else {
        const errorData = await response.json();
        setEmailTestResult(`❌ Error en API route (${response.status}): ${errorData.error}`);
        console.error('❌ Error en API route:', errorData);
        
        // Mostrar detalles adicionales si están disponibles
        if (errorData.details) {
          console.error('❌ Detalles del error:', errorData.details);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setEmailTestResult(`❌ Error al conectar con API route: ${errorMessage}`);
      console.error('❌ Error al conectar con API route:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 9999,
      border: '2px solid #333',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🔧 Panel de Diagnóstico</h4>
        <div style={{ fontSize: '11px', color: '#888' }}>
          Modo: {diagnosticData?.mode} | Prod: {diagnosticData?.isProd ? 'Sí' : 'No'}
        </div>
      </div>

      {diagnosticData && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <strong>📊 Variables de Entorno:</strong>
            <div style={{ marginTop: '5px' }}>
              {Object.entries(diagnosticData.envVars).map(([key, value]) => (
                <div key={key} style={{ 
                  margin: '2px 0', 
                  color: value ? '#4CAF50' : '#f44336',
                  fontSize: '11px'
                }}>
                  {key}: {value ? '✅ Configurada' : '❌ Faltante'}
                </div>
              ))}
            </div>
          </div>

          {diagnosticData.missingVars.length > 0 && (
            <div style={{ marginBottom: '10px', color: '#f44336' }}>
              <strong>⚠️ Variables faltantes:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {diagnosticData.missingVars.map(varName => (
                  <li key={varName}>{varName}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button 
            onClick={testEmailAPI}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px',
              width: '100%'
            }}
          >
            🧪 Probar API de Email
          </button>
          
          {emailTestResult && (
            <div style={{ 
              background: '#333', 
              padding: '8px', 
              borderRadius: '4px', 
              fontSize: '11px',
              marginTop: '10px',
              border: '1px solid #555'
            }}>
              <strong>Resultado del Test:</strong><br/>
              {emailTestResult}
            </div>
          )}

          <div style={{ marginTop: '15px', fontSize: '10px', color: '#666' }}>
            <strong>💡 Instrucciones:</strong><br/>
            • En desarrollo: Panel visible automáticamente<br/>
            • En producción: Añade ?debug=env a la URL<br/>
            • Revisa la consola para logs detallados
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosticPanel;