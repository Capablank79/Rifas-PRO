import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WebAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDevice, setCurrentDevice] = useState(0);

  const devices = [
    { name: 'Computadora', icon: 'bi-laptop', description: 'Gestión completa desde tu escritorio' },
    { name: 'Tablet', icon: 'bi-tablet', description: 'Interfaz optimizada para tablets' },
    { name: 'Móvil', icon: 'bi-phone', description: 'Acceso total desde tu smartphone' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDevice((prev) => (prev + 1) % devices.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-vh-100" style={{ background: 'hsl(228, 35%, 97%)' }}>
      {/* Hero Section */}
      <section className="py-5" style={{ background: 'var(--easyreef-gradient-primary)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <i className="bi bi-globe me-2"></i>
                Acceso Web
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Acceso Universal desde Cualquier Dispositivo
              </h1>
              <p className="fs-5 mb-4" style={{ opacity: '0.9' }}>
                Plataforma 100% web que funciona perfectamente en computadoras, tablets y móviles. 
                Sin instalaciones, sin complicaciones, solo acceso inmediato a todas las funciones.
              </p>
              <button 
                onClick={() => navigate('/')} 
                className="btn btn-light btn-lg px-4 py-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibilidad de Dispositivos */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Compatible con Todos los Dispositivos</h2>
            <p className="lead text-muted">Una experiencia perfecta sin importar cómo accedas</p>
          </div>

          <div className="row g-4">
            {devices.map((device, index) => (
              <div key={index} className="col-lg-4">
                <div className={`card h-100 border-0 shadow-sm ${index === currentDevice ? 'border-primary' : ''}`} 
                     style={{ 
                       transition: 'all 0.3s ease',
                       transform: index === currentDevice ? 'translateY(-10px)' : 'none'
                     }}>
                  <div className="card-body text-center p-4">
                    <div className="mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                        width: '80px',
                        height: '80px',
                        background: index === currentDevice ? 'var(--easyreef-gradient-primary)' : 'hsl(228, 35%, 95%)',
                        color: index === currentDevice ? 'white' : 'var(--easyreef-primary)'
                      }}>
                        <i className={`${device.icon}`} style={{ fontSize: '2.5rem' }}></i>
                      </div>
                    </div>
                    <h4 className="fw-bold mb-3">{device.name}</h4>
                    <p className="text-muted mb-4">{device.description}</p>
                    <div className="d-flex justify-content-center">
                      <span className={`badge ${index === currentDevice ? 'bg-success' : 'bg-secondary'}`}>
                        {index === currentDevice ? 'Activo' : 'Compatible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas del Acceso Web */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Ventajas del Acceso Web</h2>
            <p className="lead text-muted">Simplicidad y potencia en una sola plataforma</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-download text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Sin Instalaciones</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>No requiere descargas</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>No ocupa espacio en tu dispositivo</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Acceso inmediato desde cualquier navegador</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Siempre actualizado automáticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-cloud text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Acceso en la Nube</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Datos sincronizados en tiempo real</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Acceso desde múltiples dispositivos</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Respaldo automático de información</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Colaboración en equipo</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-speedometer2 text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Rendimiento Optimizado</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Carga rápida en cualquier conexión</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Interfaz responsiva y fluida</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Optimizado para móviles</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Funciona offline para funciones básicas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Seguridad Avanzada</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Conexión SSL encriptada</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Autenticación de dos factores</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Protección contra ataques</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Cumplimiento de normativas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo de Navegadores */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Compatible con Todos los Navegadores</h2>
            <p className="lead text-muted">Funciona perfectamente en cualquier navegador moderno</p>
          </div>

          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Navegadores Compatibles</h5>
                    <span className="badge bg-success">100% Compatible</span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-3 col-6">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="mb-2">
                          <i className="bi bi-browser-chrome" style={{ fontSize: '2rem', color: '#4285f4' }}></i>
                        </div>
                        <div className="fw-semibold small">Chrome</div>
                        <small className="text-success">✓ Compatible</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="mb-2">
                          <i className="bi bi-browser-firefox" style={{ fontSize: '2rem', color: '#ff7139' }}></i>
                        </div>
                        <div className="fw-semibold small">Firefox</div>
                        <small className="text-success">✓ Compatible</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="mb-2">
                          <i className="bi bi-browser-safari" style={{ fontSize: '2rem', color: '#006cff' }}></i>
                        </div>
                        <div className="fw-semibold small">Safari</div>
                        <small className="text-success">✓ Compatible</small>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="mb-2">
                          <i className="bi bi-browser-edge" style={{ fontSize: '2rem', color: '#0078d4' }}></i>
                        </div>
                        <div className="fw-semibold small">Edge</div>
                        <small className="text-success">✓ Compatible</small>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-3" style={{ background: 'hsl(120, 100%, 97%)', border: '1px solid hsl(120, 100%, 90%)' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle text-success me-2"></i>
                      <small className="text-success">
                        <strong>Recomendación:</strong> Para la mejor experiencia, utiliza la versión más reciente de tu navegador favorito.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Técnicas */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Características Técnicas</h2>
            <p className="lead text-muted">Tecnología de vanguardia para una experiencia superior</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="d-flex align-items-start">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--easyreef-gradient-primary)',
                  minWidth: '48px'
                }}>
                  <i className="bi bi-phone text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Diseño Responsivo</h5>
                  <p className="text-muted mb-0">
                    Interfaz que se adapta automáticamente al tamaño de pantalla, 
                    garantizando una experiencia óptima en cualquier dispositivo.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--easyreef-gradient-primary)',
                  minWidth: '48px'
                }}>
                  <i className="bi bi-lightning text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Carga Instantánea</h5>
                  <p className="text-muted mb-0">
                    Tecnología de carga progresiva que permite acceso inmediato 
                    a las funciones principales mientras se cargan los componentes adicionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--easyreef-gradient-primary)',
                  minWidth: '48px'
                }}>
                  <i className="bi bi-wifi text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Modo Offline</h5>
                  <p className="text-muted mb-0">
                    Funciones básicas disponibles sin conexión a internet, 
                    con sincronización automática cuando se restablece la conexión.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--easyreef-gradient-primary)',
                  minWidth: '48px'
                }}>
                  <i className="bi bi-arrow-clockwise text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Actualizaciones Automáticas</h5>
                  <p className="text-muted mb-0">
                    Nuevas funciones y mejoras se implementan automáticamente 
                    sin interrumpir tu trabajo ni requerir acciones adicionales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="display-6 fw-bold mb-4">
                Accede Desde Cualquier Lugar,{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  En Cualquier Momento
                </span>
              </h2>
              <p className="fs-5 text-muted mb-4">
                Experimenta la libertad de gestionar tus rifas desde cualquier dispositivo, 
                sin instalaciones ni complicaciones. Solo abre tu navegador y comienza.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn btn-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-globe me-2"></i>
                  Probar Ahora
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-outline-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Explorar Más Funciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebAccessPage;