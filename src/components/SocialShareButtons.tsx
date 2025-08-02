import React from 'react';
import './SocialShareButtons.css';

interface SocialShareButtonsProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
  className?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  description,
  url = window.location.href,
  imageUrl,
  hashtags = [],
  className = ''
}) => {
  
  // Función para mostrar mensaje demo
  const handleDemoShare = (platform: string) => {
    alert(`🎯 DEMO: Compartir en ${platform}\n\n` +
          `Título: ${title}\n` +
          `Descripción: ${description}\n` +
          `URL: ${url}\n\n` +
          `En la versión PRO, esto abrirá ${platform} para compartir realmente.`);
  };

  // URLs simuladas para la demo (en PRO serían URLs reales)
  const shareUrls = {
    facebook: `#demo-facebook-share`,
    twitter: `#demo-twitter-share`,
    whatsapp: `#demo-whatsapp-share`,
    instagram: `#demo-instagram-share`,
    linkedin: `#demo-linkedin-share`,
    telegram: `#demo-telegram-share`
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: 'bi-facebook',
      color: '#1877F2',
      url: shareUrls.facebook
    },
    {
      name: 'Twitter',
      icon: 'bi-twitter-x',
      color: '#000000',
      url: shareUrls.twitter
    },
    {
      name: 'WhatsApp',
      icon: 'bi-whatsapp',
      color: '#25D366',
      url: shareUrls.whatsapp
    },
    {
      name: 'Instagram',
      icon: 'bi-instagram',
      color: '#E4405F',
      url: shareUrls.instagram
    },
    {
      name: 'LinkedIn',
      icon: 'bi-linkedin',
      color: '#0A66C2',
      url: shareUrls.linkedin
    },
    {
      name: 'Telegram',
      icon: 'bi-telegram',
      color: '#0088CC',
      url: shareUrls.telegram
    }
  ];

  return (
    <div className={`social-share-container ${className}`}>
      <div className="social-share-header">
        <i className="bi bi-share me-2"></i>
        <span>Compartir</span>
      </div>
      
      <div className="social-share-buttons">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            className="social-share-btn"
            style={{ '--social-color': platform.color } as React.CSSProperties}
            onClick={() => handleDemoShare(platform.name)}
            title={`Compartir en ${platform.name}`}
          >
            <i className={`bi ${platform.icon}`}></i>
            <span className="social-name">{platform.name}</span>
          </button>
        ))}
      </div>
      
      <div className="demo-notice">
        <i className="bi bi-info-circle me-1"></i>
        <small>Demo: Los enlaces de compartir son simulados</small>
      </div>
    </div>
  );
};

export default SocialShareButtons;