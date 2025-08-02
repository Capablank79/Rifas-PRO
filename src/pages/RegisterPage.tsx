import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SocialLoginButtons from '../components/SocialLoginButtons';

const RegisterPage = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(180deg, hsl(0, 0%, 100%), hsl(228, 35%, 97%))'
    }}>
      {/* Hero Section */}
      <section className="position-relative d-flex align-items-center justify-content-center overflow-hidden" style={{ 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Background Elements */}
        <div className="position-absolute w-100 h-100" style={{
          background: 'linear-gradient(135deg, hsl(247, 84%, 57%, 0.1) 0%, transparent 50%, hsl(33, 100%, 60%, 0.1) 100%)'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          bottom: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)'
        }}></div>

        <div className="container position-relative text-center text-white">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Badge */}
              <div className="d-inline-flex align-items-center px-4 py-2 rounded-pill mb-4" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <i className="bi bi-share-fill me-2"></i>
                Integración Social PRO
              </div>

              {/* Headline */}
              <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                Conecta tus rifas con el{" "}
                <span style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  poder social
                </span>
              </h1>
              <p className="fs-5 mb-5" style={{ 
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto',
                opacity: '0.9'
              }}>
                Maximiza el alcance de tus rifas con integración automática a redes sociales, 
                login simplificado y sincronización de datos en tiempo real.
              </p>

              {/* Back to Home Button */}
              <Link 
                to="/" 
                className="btn btn-outline-light btn-lg px-4 py-3 me-3"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is Social Integration Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-4">
              ¿Qué es la{" "}
              <span style={{
                background: 'var(--easyreef-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Integración Social
              </span>?
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '800px' }}>
              La integración social revoluciona la forma en que tus participantes interactúan con tus rifas, 
              creando una experiencia fluida y conectada que aumenta la participación y el alcance.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm card-hover-effect">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <i className="bi bi-share text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-3">Compartir Automático</h5>
                    <p className="text-muted">
                      Publica automáticamente números disponibles, ganadores y actualizaciones 
                      en Facebook, Instagram, Twitter y WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm card-hover-effect">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <i className="bi bi-person-check text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-3">Login Social</h5>
                    <p className="text-muted">
                      Permite a tus participantes registrarse e iniciar sesión con sus cuentas 
                      de Google, Facebook o Twitter en un solo click.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm card-hover-effect">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <i className="bi bi-arrow-repeat text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-3">Sincronización</h5>
                    <p className="text-muted">
                      Sincroniza automáticamente datos de perfil, fotos y contactos 
                      desde las redes sociales de tus participantes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-4">
              Beneficios de la{" "}
              <span style={{
                background: 'var(--easyreef-gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Versión PRO
              </span>
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--easyreef-gradient-primary)'
                  }}>
                    <i className="bi bi-graph-up text-white"></i>
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Aumenta la Participación</h5>
                  <p className="text-muted mb-0">
                    Hasta 300% más participantes gracias a la viralidad de las redes sociales 
                    y la facilidad del registro social.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--easyreef-gradient-primary)'
                  }}>
                    <i className="bi bi-clock text-white"></i>
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Ahorra Tiempo</h5>
                  <p className="text-muted mb-0">
                    Automatiza la promoción y gestión de participantes. 
                    Reduce el trabajo manual en un 80%.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--easyreef-gradient-primary)'
                  }}>
                    <i className="bi bi-people text-white"></i>
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Mejor Experiencia</h5>
                  <p className="text-muted mb-0">
                    Registro simplificado y acceso instantáneo mejoran 
                    la satisfacción de tus participantes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="d-flex align-items-start mb-4">
                <div className="flex-shrink-0 me-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--easyreef-gradient-primary)'
                  }}>
                    <i className="bi bi-shield-check text-white"></i>
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Datos Verificados</h5>
                  <p className="text-muted mb-0">
                    Los datos de redes sociales están pre-verificados, 
                    reduciendo el fraude y mejorando la confianza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold mb-3">Prueba la Integración Social</h3>
                    <p className="text-muted">
                      Experimenta cómo sería el login social en la versión PRO. 
                      Esta es solo una demostración de las funcionalidades disponibles.
                    </p>
                  </div>

                  {/* Social Login Demo */}
                  <SocialLoginButtons />

                  {/* Demo Notice */}
                  <div className="alert alert-info mt-4" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle me-2"></i>
                      <div>
                        <strong>Nota:</strong> Esta es una demostración. En la versión PRO, 
                        tendrás acceso completo a todas las integraciones sociales reales.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="container text-center text-white">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">
                ¿Listo para potenciar tus rifas?
              </h2>
              <p className="fs-5 mb-4" style={{ opacity: '0.9' }}>
                Únete a cientos de organizadores que ya están usando la integración social 
                para maximizar sus resultados.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button className="btn btn-light btn-lg px-4 py-3">
                  <i className="bi bi-rocket me-2"></i>
                  Solicitar Versión PRO
                </button>
                <Link to="/" className="btn btn-outline-light btn-lg px-4 py-3">
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver al Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;