import { useState, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Hook personalizado para usar toasts
export const useToast = () => {
  const showSuccess = (title: string, message: string, duration?: number) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'success', title, message, duration }
    }));
  };

  const showError = (title: string, message: string, duration?: number) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'error', title, message, duration }
    }));
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'warning', title, message, duration }
    }));
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'info', title, message, duration }
    }));
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default ToastContainer;