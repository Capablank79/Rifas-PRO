import React, { useState } from 'react';
import './SocialLoginButtons.css';

interface SocialLoginButtonsProps {
  onDemoLogin?: (provider: string) => void;
  showProFeatures?: boolean;
  className?: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onDemoLogin,
  showProFeatures = true,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const socialProviders = [
    {
      name: 'Google',
      icon: 'bi-google',
      color: '#4285F4',
      benefits: ['Acceso instantáneo', 'Datos de perfil automáticos', 'Sin contraseñas']
    },
    {
      name: 'Facebook',
      icon: 'bi-facebook',
      color: '#1877F2',
      benefits: ['Red social integrada', 'Compartir automático', 'Amigos en común']
    },
    {
      name: 'Twitter',
      icon: 'bi-twitter-x',
      color: '#000000',
      benefits: ['Verificación rápida', 'Promoción automática', 'Alcance viral']
    }
  ];

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    // Simular tiempo de carga realista
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mostrar mensaje demo persuasivo
    const providerData = socialProviders.find(p => p.name === provider);
    const benefits = providerData?.benefits.join('\n• ') || '';
    
    alert(
      `🚀 DEMO: Login con ${provider}\n\n` +
      `✨ En la versión PRO obtendrías:\n\n` +
      `• ${benefits}\n\n` +
      `💡 Beneficios adicionales PRO:\n` +
      `• Sincronización automática de datos\n` +
      `• Integración con redes sociales\n` +
      `• Marketing automático\n` +
      `• Analytics avanzados\n\n` +
      `🎯 ¡Actualiza a PRO para desbloquear todo el potencial!`
    );
    
    setIsLoading(null);
    
    if (onDemoLogin) {
      onDemoLogin(provider);
    }
  };

  return (
    <div className={`social-login-container ${className}`}>
      <div className="social-login-header">
        <h6 className="text-center mb-3">
          <i className="bi bi-lightning-charge text-warning me-2"></i>
          Acceso Rápido con Redes Sociales
        </h6>
        {showProFeatures && (
          <div className="pro-badge-container">
            <span className="badge bg-gradient-pro">
              <i className="bi bi-star-fill me-1"></i>
              FUNCIONALIDAD PRO
            </span>
          </div>
        )}
      </div>

      <div className="social-login-buttons">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            className={`social-login-btn ${isLoading === provider.name ? 'loading' : ''}`}
            style={{ '--social-color': provider.color } as React.CSSProperties}
            onClick={() => handleSocialLogin(provider.name)}
            disabled={isLoading !== null}
          >
            <div className="btn-content">
              {isLoading === provider.name ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <i className={`bi ${provider.icon}`}></i>
              )}
              <span className="btn-text">
                {isLoading === provider.name ? 'Conectando...' : `Continuar con ${provider.name}`}
              </span>
            </div>
            <div className="btn-benefits">
              <small>{provider.benefits[0]}</small>
            </div>
          </button>
        ))}
      </div>

      <div className="demo-vs-pro">
        <div className="comparison-card">
          <div className="demo-side">
            <h6 className="text-muted">
              <i className="bi bi-eye me-1"></i>
              DEMO
            </h6>
            <ul className="feature-list">
              <li><i className="bi bi-x-circle text-danger me-1"></i> Solo simulación</li>
              <li><i className="bi bi-x-circle text-danger me-1"></i> Sin datos reales</li>
              <li><i className="bi bi-x-circle text-danger me-1"></i> Funcionalidad limitada</li>
            </ul>
          </div>
          
          <div className="divider">
            <span className="vs-text">VS</span>
          </div>
          
          <div className="pro-side">
            <h6 className="text-primary">
              <i className="bi bi-star-fill me-1"></i>
              PRO
            </h6>
            <ul className="feature-list">
              <li><i className="bi bi-check-circle text-success me-1"></i> Autenticación real</li>
              <li><i className="bi bi-check-circle text-success me-1"></i> Datos sincronizados</li>
              <li><i className="bi bi-check-circle text-success me-1"></i> Integración completa</li>
              <li><i className="bi bi-check-circle text-success me-1"></i> Marketing automático</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="upgrade-cta">
        <button className="btn btn-gradient-pro btn-lg w-100">
          <i className="bi bi-rocket-takeoff me-2"></i>
          ¡Actualizar a PRO Ahora!
          <small className="d-block mt-1">Desbloquea todas las funcionalidades</small>
        </button>
      </div>

      <div className="demo-notice">
        <i className="bi bi-info-circle me-1"></i>
        <small>
          Esta es una demostración. En la versión PRO, tendrás acceso completo a todas las integraciones sociales.
        </small>
      </div>
    </div>
  );
};

export default SocialLoginButtons;