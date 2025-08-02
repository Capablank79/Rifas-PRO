import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login('demo', 'demo123');
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 mb-3 fw-bold text-primary">EasyRif Demo</h1>
                  <p className="text-muted">Sistema de Gestión de Rifas</p>
                </div>

                <div className="text-center">
                  <p className="text-muted mb-4">Haz clic para acceder a la demo:</p>
                  
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Acceder a la Demo
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-muted mb-2">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary text-decoration-none fw-bold">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Esta es una demostración local del sistema
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;