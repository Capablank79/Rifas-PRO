import React from 'react';
import { Link } from 'react-router-dom';

const RealtimeSalesPage: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center text-white mb-5">
                <div className="mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                       style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)' }}>
                    <i className="bi bi-graph-up" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h1 className="display-4 fw-bold mb-4">
                  Ventas en Tiempo Real
                </h1>
                <p className="lead mb-4" style={{ fontSize: '1.3rem' }}>
                  Monitorea cada venta al instante con dashboards dinámicos, 
                  notificaciones automáticas y análisis en vivo
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
          {/* Qué son las Ventas en Tiempo Real */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  ¿Qué son las Ventas en Tiempo Real?
                </h2>
                <p className="lead text-muted mb-5">
                  Un sistema avanzado de monitoreo que te permite ver cada venta 
                  al momento que ocurre, con datos actualizados instantáneamente
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                             style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                          <i className="bi bi-speedometer2 text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Dashboard en Vivo</h5>
                      <p className="text-muted">
                        Visualiza todas las ventas en un dashboard que se actualiza 
                        automáticamente cada segundo sin necesidad de recargar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                             style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                          <i className="bi bi-bell-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Notificaciones Instantáneas</h5>
                      <p className="text-muted">
                        Recibe alertas inmediatas por cada venta realizada, 
                        con detalles del comprador, vendedor y número vendido
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                             style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                          <i className="bi bi-activity text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Métricas Dinámicas</h5>
                      <p className="text-muted">
                        Estadísticas que se actualizan en tiempo real: total vendido, 
                        números disponibles, ritmo de ventas y proyecciones
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
                <div className="card-header bg-gradient text-white text-center py-4" 
                     style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                  <h3 className="mb-0">
                    <i className="bi bi-play-circle me-2"></i>
                    Demo de Ventas en Tiempo Real
                  </h3>
                </div>
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="alert alert-info border-0" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Versión Demo:</strong> Esta es una simulación de las funcionalidades PRO
                    </div>
                  </div>

                  {/* Simulación de Dashboard */}
                  <div className="row g-4 mb-4">
                    <div className="col-md-3">
                      <div className="card border-0" style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
                        <div className="card-body text-center text-white p-3">
                          <h3 className="fw-bold mb-1">247</h3>
                          <small>Números Vendidos</small>
                          <div className="mt-2">
                            <i className="bi bi-arrow-up"></i> +12 en la última hora
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0" style={{ background: 'linear-gradient(45deg, #007bff, #6610f2)' }}>
                        <div className="card-body text-center text-white p-3">
                          <h3 className="fw-bold mb-1">$2,470</h3>
                          <small>Total Recaudado</small>
                          <div className="mt-2">
                            <i className="bi bi-arrow-up"></i> +$120 última hora
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0" style={{ background: 'linear-gradient(45deg, #fd7e14, #e83e8c)' }}>
                        <div className="card-body text-center text-white p-3">
                          <h3 className="fw-bold mb-1">753</h3>
                          <small>Números Disponibles</small>
                          <div className="mt-2">
                            <i className="bi bi-clock"></i> 75.3% vendido
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0" style={{ background: 'linear-gradient(45deg, #17a2b8, #6f42c1)' }}>
                        <div className="card-body text-center text-white p-3">
                          <h3 className="fw-bold mb-1">8</h3>
                          <small>Vendedores Activos</small>
                          <div className="mt-2">
                            <i className="bi bi-people"></i> 3 en línea ahora
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-4">
                      En la versión PRO, estos datos se actualizan automáticamente cada segundo, 
                      con notificaciones push y alertas personalizadas.
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
        </div>
      </section>
    </div>
  );
};

export default RealtimeSalesPage;