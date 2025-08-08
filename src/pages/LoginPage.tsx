import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import DemoRequestModal from '../components/DemoRequestModal';

const LoginPage = () => {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        // Verificar el rol del usuario para redirigir
        if (state.user?.role === 'free') {
          navigate('/free');
        } else {
          navigate('/');
        }
      } else {
        setError('Credenciales inválidas o expiradas. Por favor, solicita nuevas credenciales desde la página principal.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="text-center mb-5 text-white">
          <h1 className="display-4 fw-bold mb-3">EasyRif Demo</h1>
          <p className="lead">Elige el plan que mejor se adapte a tus necesidades</p>
        </div>
        
        <div className="row g-4 justify-content-center">
          {/* Plan Free */}
          <div className="col-lg-4 col-md-6">
            <Link to="/free-plan" className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} 
                   onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-header text-center py-4 border-0" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                  <h3 className="fw-bold mb-0">Free</h3>
                  <div className="d-flex justify-content-center align-items-baseline mt-3">
                    <span className="display-5 fw-bold">$0</span>
                    <span className="text-muted ms-1">/mes</span>
                  </div>
                  <p className="text-muted mt-2">Para comenzar</p>
                </div>
                <div className="card-body p-4">
                  <ul className="list-unstyled mb-4">
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>1 rifa</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>50 números/rifa</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>1 premio</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-x-circle-fill text-danger me-2"></i>
                      <span className="text-muted">Precio hasta $1.000/número</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-x-circle-fill text-danger me-2"></i>
                      <span className="text-muted">Máximo 5 vendedores</span>
                    </li>
                  </ul>
                  <div className="btn btn-outline-primary btn-lg w-100" style={{
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-download me-2"></i>
                    Obtener Gratis
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Plan Plata */}
          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-lg" style={{ transform: 'translateY(-10px)' }}>
              {/* Eliminamos la etiqueta de la posición superior */}
              <div className="card-header text-center py-4 border-0" style={{ background: 'rgba(102, 126, 234, 0.2)' }}>
                <h3 className="fw-bold mb-0">Plata</h3>
                <div className="d-flex justify-content-center align-items-baseline mt-3">
                  <span className="display-5 fw-bold">$19.990</span>
                  <span className="text-muted ms-1">/mes</span>
                </div>
                <p className="text-muted mt-2">Para organizaciones medianas</p>
              </div>
              <div className="text-center py-2">
                <span className="badge rounded-pill" style={{
                  background: 'var(--easyreef-gradient-primary)',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}>
                  <i className="bi bi-star-fill me-1"></i>
                  RECOMENDADO
                </span>
              </div>
              <div className="card-body p-4">
                <ul className="list-unstyled mb-4">
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>5 rifas</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>200 números/rifa</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Premios ilimitados</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Precio hasta $3.000/número</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Máximo 100 vendedores</span>
                  </li>
                </ul>
                <button className="btn btn-primary btn-lg w-100" style={{
                  background: 'var(--easyreef-gradient-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-credit-card me-2"></i>
                  Adquirir Plan
                </button>
              </div>
            </div>
          </div>

          {/* Plan Gold */}
          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header text-center py-4 border-0" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                <h3 className="fw-bold mb-0">Gold</h3>
                <div className="d-flex justify-content-center align-items-baseline mt-3">
                  <span className="display-5 fw-bold">$39.990</span>
                  <span className="text-muted ms-1">/mes</span>
                </div>
                <p className="text-muted mt-2">Para uso profesional</p>
              </div>
              <div className="card-body p-4">
                <ul className="list-unstyled mb-4">
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Rifas ilimitadas</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Números ilimitados</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Premios ilimitados</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Precio libre</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span>Vendedores ilimitados</span>
                  </li>
                </ul>
                <button className="btn btn-outline-primary btn-lg w-100" style={{
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-credit-card me-2"></i>
                  Adquirir Plan
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mt-4 justify-content-center">
          <div className="col-md-6 text-center">
            <button 
              className="btn btn-light text-decoration-none" 
              onClick={() => setIsDemoModalOpen(true)}
            >
              <i className="bi bi-question-circle me-1"></i>
              Solicitar Credenciales Demo
            </button>
          </div>
        </div>
      </div>

      {/* Modal para solicitar credenciales demo */}
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;