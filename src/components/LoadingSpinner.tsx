interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Cargando...', 
  overlay = false 
}: LoadingSpinnerProps) => {
  const getSizeClass = () => {
    const sizes = {
      sm: 'spinner-sm',
      md: 'spinner-md',
      lg: 'spinner-lg'
    };
    return sizes[size];
  };

  const spinner = (
    <div className={`loading-spinner ${getSizeClass()}`}>
      <div className={`spinner-border text-${color}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <div className={`loading-text text-${color} mt-2`}>
          {text}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-backdrop"></div>
        <div className="loading-content">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;