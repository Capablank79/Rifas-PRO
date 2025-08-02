import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Mostrar toast con animación
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-cerrar después del duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastClasses = () => {
    const baseClasses = 'toast-custom';
    const typeClasses = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info'
    };
    
    let classes = `${baseClasses} ${typeClasses[type]}`;
    
    if (isVisible && !isLeaving) {
      classes += ' toast-show';
    }
    
    if (isLeaving) {
      classes += ' toast-hide';
    }
    
    return classes;
  };

  const getIcon = () => {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    
    return icons[type];
  };

  return (
    <div className={getToastClasses()}>
      <div className="toast-header">
        <i className={`bi ${getIcon()} me-2`}></i>
        <strong className="me-auto">{title}</strong>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default Toast;