import React from 'react';
import { Link } from 'react-router-dom';

const SellersPage: React.FC = () => {
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
                    <i className="bi bi-people" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h1 className="display-4 fw-bold mb-4">
                  Gestión Avanzada de Vendedores
                </h1>
                <p className="lead mb-4" style={{ fontSize: '1.3rem' }}>
                  Potencia tu equipo de ventas con herramientas profesionales de gestión, 
                  seguimiento y optimización de rendimiento
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
          {/* ¿Qué es la Gestión de Vendedores? */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  ¿Qué es la Gestión de Vendedores?
                </h2>
                <p className="lead text-muted mb-5">
                  Un sistema completo para administrar, motivar y optimizar el rendimiento 
                  de tu equipo de ventas con herramientas profesionales
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                             style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                          <i className="bi bi-person-badge text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Roles y Permisos</h5>
                      <p className="text-muted">
                        Asigna roles específicos a cada vendedor con permisos personalizados 
                        para diferentes funciones y niveles de acceso
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
                          <i className="bi bi-percent text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Sistema de Comisiones</h5>
                      <p className="text-muted">
                        Configura comisiones automáticas por vendedor, con diferentes 
                        porcentajes y bonificaciones según el rendimiento
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
                          <i className="bi bi-graph-up-arrow text-white" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                      </div>
                      <h5 className="fw-bold mb-3">Seguimiento en Tiempo Real</h5>
                      <p className="text-muted">
                        Monitorea el rendimiento de cada vendedor con métricas 
                        actualizadas en tiempo real y reportes detallados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios de la Versión PRO */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  Beneficios de la Versión PRO
                </h2>
                <p className="lead text-muted">
                  Herramientas avanzadas que transformarán la gestión de tu equipo de ventas
                </p>
              </div>

              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #28a745, #20c997)' }}>
                            <i className="bi bi-trophy text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Aumenta la Productividad</h5>
                          <p className="text-muted mb-0">
                            Incrementa las ventas hasta un <strong>250%</strong> con herramientas 
                            de motivación y seguimiento personalizado
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #007bff, #6610f2)' }}>
                            <i className="bi bi-clock text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Ahorra Tiempo de Gestión</h5>
                          <p className="text-muted mb-0">
                            Reduce el tiempo de administración en un <strong>70%</strong> 
                            con automatización de comisiones y reportes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #fd7e14, #e83e8c)' }}>
                            <i className="bi bi-people-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Mejor Control del Equipo</h5>
                          <p className="text-muted mb-0">
                            Gestiona equipos de hasta <strong>100+ vendedores</strong> 
                            con roles, territorios y metas personalizadas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" 
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #17a2b8, #6f42c1)' }}>
                            <i className="bi bi-bar-chart-line text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Analíticas Avanzadas</h5>
                          <p className="text-muted mb-0">
                            Reportes detallados de rendimiento, comisiones y 
                            proyecciones para tomar decisiones estratégicas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-gradient text-white text-center py-4" 
                     style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                  <h3 className="mb-0">
                    <i className="bi bi-play-circle me-2"></i>
                    Demo de Gestión de Vendedores
                  </h3>
                </div>
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div className="alert alert-info border-0" style={{ background: 'rgba(23, 162, 184, 0.1)' }}>
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Versión Demo:</strong> Esta es una simulación de las funcionalidades PRO
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 border rounded" style={{ background: '#f8f9fa' }}>
                        <i className="bi bi-person-plus-fill text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-bold">Agregar Vendedores</h6>
                        <small className="text-muted">Funcionalidad PRO</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 border rounded" style={{ background: '#f8f9fa' }}>
                        <i className="bi bi-gear-fill text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-bold">Configurar Comisiones</h6>
                        <small className="text-muted">Funcionalidad PRO</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 border rounded" style={{ background: '#f8f9fa' }}>
                        <i className="bi bi-graph-up text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-bold">Ver Rendimiento</h6>
                        <small className="text-muted">Funcionalidad PRO</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 border rounded" style={{ background: '#f8f9fa' }}>
                        <i className="bi bi-file-earmark-text text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-bold">Generar Reportes</h6>
                        <small className="text-muted">Funcionalidad PRO</small>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-4">
                    En la versión PRO podrás gestionar vendedores reales, configurar comisiones automáticas, 
                    asignar territorios y generar reportes detallados de rendimiento.
                  </p>

                  <Link to="/login" className="btn btn-outline-primary me-3">
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver al Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center p-5 rounded-3" 
                   style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-white">
                  <h2 className="fw-bold mb-3">¿Listo para Potenciar tu Equipo de Ventas?</h2>
                  <p className="lead mb-4">
                    Solicita una demostración personalizada de nuestras herramientas 
                    de gestión de vendedores y descubre cómo aumentar tus ventas
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <button className="btn btn-light btn-lg px-4">
                      <i className="bi bi-calendar-check me-2"></i>
                      Solicitar Demo PRO
                    </button>
                    <button className="btn btn-outline-light btn-lg px-4">
                      <i className="bi bi-telephone me-2"></i>
                      Contactar Ventas
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

export default SellersPage;