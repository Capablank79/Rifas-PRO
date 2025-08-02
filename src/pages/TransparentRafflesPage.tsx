import React from 'react';
import { Link } from 'react-router-dom';

const TransparentRafflesPage: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
      {/* Hero Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center text-white mb-5">
                <div className="mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                       style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)' }}>
                    <i className="bi bi-shield-check" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h1 className="display-4 fw-bold mb-4">
                  Sorteos Transparentes
                </h1>
                <p className="lead mb-4" style={{ fontSize: '1.3rem' }}>
                  Sistema de sorteo verificable y auditable que garantiza 
                  total transparencia y genera confianza absoluta
                </p>
                <Link to="/" className="btn btn-light btn-lg px-4 py-2">
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver al Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-white">
        <div className="container">
          {/* Qué son los Sorteos Transparentes */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  ¿Qué son los Sorteos Transparentes?
                </h2>
                <p className="lead text-muted mb-5">
                  Un sistema revolucionario que permite a todos los participantes 
                  verificar la legitimidad del sorteo en tiempo real
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-eye-fill text-success" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Sorteo en Vivo</h5>
                      <p className="text-muted">
                        Transmisión en tiempo real del sorteo donde todos 
                        pueden ver el proceso completo sin ediciones
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Registro Inmutable</h5>
                      <p className="text-muted">
                        Cada paso del sorteo queda registrado de forma 
                        permanente e inalterable para futuras verificaciones
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-people-fill text-success" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Testigos Verificadores</h5>
                      <p className="text-muted">
                        Participantes aleatorios actúan como testigos 
                        independientes del proceso de sorteo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="card border-0 shadow-lg">
                <div className="card-header text-white text-center py-4" 
                     style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
                  <h3 className="mb-0">
                    <i className="bi bi-play-circle me-2"></i>
                    Demo de Sorteo Transparente
                  </h3>
                </div>
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="alert alert-info border-0">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Versión Demo:</strong> Simulación del proceso de sorteo transparente
                    </div>
                  </div>

                  {/* Simulación de Resultado */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-trophy me-2"></i>
                      Resultado del Sorteo (Simulación)
                    </h5>
                    
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <div className="mb-3">
                          <h2 className="display-4 fw-bold text-success">0247</h2>
                          <p className="lead">Número Ganador</p>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <small className="text-muted">Ganador:</small>
                            <br />
                            <strong>María González</strong>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">Fecha del Sorteo:</small>
                            <br />
                            <strong>15 Ene 2024, 8:00 PM</strong>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">Testigos Verificadores:</small>
                            <br />
                            <strong>3 confirmados</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-4">
                      En la versión PRO, todo el proceso se documenta automáticamente 
                      con certificados digitales y transmisión en vivo.
                    </p>

                    <Link to="/login" className="btn btn-outline-primary me-3">
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver al Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center p-5 rounded-3" 
                   style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                <div className="text-white">
                  <h2 className="fw-bold mb-3">¿Listo para Ganar la Confianza Total?</h2>
                  <p className="lead mb-4">
                    Implementa sorteos 100% transparentes y convierte cada rifa 
                    en una experiencia confiable y verificable
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <button className="btn btn-light btn-lg px-4">
                      <i className="bi bi-shield-check me-2"></i>
                      Ver Demo Completo
                    </button>
                    <button className="btn btn-outline-light btn-lg px-4">
                      <i className="bi bi-telephone me-2"></i>
                      Solicitar Información
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransparentRafflesPage;