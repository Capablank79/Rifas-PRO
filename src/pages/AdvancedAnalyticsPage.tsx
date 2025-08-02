import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvancedAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentMetric, setCurrentMetric] = useState(0);

  const metrics = [
    { label: 'Ventas Totales', value: '$2,450,000', change: '+15.3%', icon: 'bi-currency-dollar' },
    { label: 'Rifas Activas', value: '24', change: '+8', icon: 'bi-ticket-perforated' },
    { label: 'Participantes', value: '1,847', change: '+23.1%', icon: 'bi-people' },
    { label: 'Tasa de Conversión', value: '68.4%', change: '+5.2%', icon: 'bi-graph-up' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
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
                <i className="bi bi-bar-chart me-2"></i>
                Analíticas Avanzadas
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Datos que Impulsan el Éxito
              </h1>
              <p className="fs-5 mb-4" style={{ opacity: '0.9' }}>
                Obtén insights profundos sobre el rendimiento de tus rifas con reportes detallados, 
                métricas en tiempo real y proyecciones inteligentes que te ayudan a tomar decisiones estratégicas.
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

      {/* Métricas en Tiempo Real */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Métricas en Tiempo Real</h2>
            <p className="lead text-muted">Monitorea el rendimiento de tus rifas al instante</p>
          </div>

          <div className="row g-4">
            {metrics.map((metric, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className={`card h-100 border-0 shadow-sm ${index === currentMetric ? 'border-primary' : ''}`} 
                     style={{ 
                       transition: 'all 0.3s ease',
                       transform: index === currentMetric ? 'translateY(-5px)' : 'none'
                     }}>
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                        width: '60px',
                        height: '60px',
                        background: index === currentMetric ? 'var(--easyreef-gradient-primary)' : 'hsl(228, 35%, 95%)',
                        color: index === currentMetric ? 'white' : 'var(--easyreef-primary)'
                      }}>
                        <i className={`${metric.icon}`} style={{ fontSize: '1.8rem' }}></i>
                      </div>
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: 'var(--easyreef-primary)' }}>
                      {metric.value}
                    </h3>
                    <p className="text-muted mb-2">{metric.label}</p>
                    <span className="badge bg-success">{metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de Reportes */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Tipos de Reportes Disponibles</h2>
            <p className="lead text-muted">Análisis completos para cada aspecto de tu negocio</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-graph-up text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Rendimiento de Ventas</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Ventas por período</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Comparativas mensuales</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Picos de actividad</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Tendencias de crecimiento</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-people text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Análisis de Participantes</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Demografía de compradores</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Comportamiento de compra</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Clientes recurrentes</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Segmentación avanzada</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-bullseye text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Proyecciones Inteligentes</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Predicción de ventas</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Optimización de precios</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Mejores fechas para rifas</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Recomendaciones estratégicas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo de Dashboard */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Dashboard Interactivo</h2>
            <p className="lead text-muted">Visualiza todos tus datos en un solo lugar</p>
          </div>

          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Panel de Control Principal</h5>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary">En Vivo</span>
                      <span className="badge bg-success">Actualizado</span>
                    </div>
                  </div>

                  {/* Gráfico Simulado */}
                  <div className="mb-4 p-4 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-semibold mb-0">Ventas de los Últimos 7 Días</h6>
                      <small className="text-muted">Actualizado hace 2 min</small>
                    </div>
                    <div className="d-flex align-items-end gap-2" style={{ height: '120px' }}>
                      {[65, 45, 80, 55, 90, 70, 85].map((height, index) => (
                        <div key={index} className="flex-fill d-flex flex-column align-items-center">
                          <div 
                            className="w-100 rounded-top" 
                            style={{ 
                              height: `${height}%`, 
                              background: 'var(--easyreef-gradient-primary)',
                              minHeight: '20px'
                            }}
                          ></div>
                          <small className="text-muted mt-2">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Métricas Rápidas */}
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-primary fs-4">$12,450</div>
                        <small className="text-muted">Ingresos Hoy</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-success fs-4">156</div>
                        <small className="text-muted">Números Vendidos</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-warning fs-4">73%</div>
                        <small className="text-muted">Progreso Rifa</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-info fs-4">2.3h</div>
                        <small className="text-muted">Tiempo Restante</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="display-6 fw-bold mb-4">
                Toma Decisiones Basadas en{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Datos Reales
                </span>
              </h2>
              <p className="fs-5 text-muted mb-4">
                Accede a reportes detallados, métricas en tiempo real y proyecciones inteligentes 
                que transformarán la forma en que gestionas tus rifas.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn btn-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Comenzar Análisis
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

export default AdvancedAnalyticsPage;