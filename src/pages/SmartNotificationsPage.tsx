import React from 'react';
import { Link } from 'react-router-dom';

const SmartNotificationsPage: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' }}>
      {/* Hero Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center text-white mb-5">
                <div className="mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                       style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)' }}>
                    <i className="bi bi-bell-fill" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
                <h1 className="display-4 fw-bold mb-4">
                  Notificaciones Inteligentes
                </h1>
                <p className="lead mb-4" style={{ fontSize: '1.3rem' }}>
                  Sistema automatizado de alertas que mantiene a todos informados 
                  en tiempo real sobre el progreso de las rifas
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
          {/* Qué son las Notificaciones Inteligentes */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  ¿Qué son las Notificaciones Inteligentes?
                </h2>
                <p className="lead text-muted mb-5">
                  Un sistema que envía automáticamente las alertas correctas 
                  a las personas correctas en el momento correcto
                </p>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-lightning-charge-fill text-warning" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Alertas Automáticas</h5>
                      <p className="text-muted">
                        Notificaciones instantáneas cuando se vende un número, 
                        se completa la rifa o se acerca la fecha del sorteo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-people-fill text-primary" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Segmentación Inteligente</h5>
                      <p className="text-muted">
                        Cada persona recibe solo las notificaciones relevantes: 
                        vendedores, compradores y organizadores por separado
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <i className="bi bi-chat-dots-fill text-success" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">Múltiples Canales</h5>
                      <p className="text-muted">
                        WhatsApp, SMS, Email y notificaciones push. 
                        El sistema elige el mejor canal para cada usuario
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de Notificaciones */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-4" style={{ color: '#2c3e50' }}>
                  Tipos de Notificaciones Automáticas
                </h2>
                <p className="lead text-muted">
                  Cada evento importante genera las alertas necesarias
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
                            <i className="bi bi-cart-check-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Ventas en Tiempo Real</h5>
                          <p className="text-muted mb-0">
                            <strong>Al vendedor:</strong> "¡Felicidades! Vendiste el número 0247"<br />
                            <strong>Al organizador:</strong> "Nueva venta: 85% completado"<br />
                            <strong>Al comprador:</strong> "Confirmación de compra del número 0247"
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
                            <i className="bi bi-clock-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Recordatorios de Sorteo</h5>
                          <p className="text-muted mb-0">
                            <strong>24h antes:</strong> "El sorteo es mañana a las 8:00 PM"<br />
                            <strong>1h antes:</strong> "¡El sorteo comienza en 1 hora!"<br />
                            <strong>En vivo:</strong> "El sorteo está comenzando ahora"
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
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #6f42c1, #e83e8c)' }}>
                            <i className="bi bi-trophy-fill text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Resultados del Sorteo</h5>
                          <p className="text-muted mb-0">
                            <strong>Al ganador:</strong> "¡FELICIDADES! Ganaste con el número 0247"<br />
                            <strong>A participantes:</strong> "El número ganador fue 0247"<br />
                            <strong>A vendedores:</strong> "Comisiones listas para pago"
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
                               style={{ width: '50px', height: '50px', background: 'linear-gradient(45deg, #007bff, #0056b3)' }}>
                            <i className="bi bi-graph-up-arrow text-white"></i>
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">Progreso de Ventas</h5>
                          <p className="text-muted mb-0">
                            <strong>50% vendido:</strong> "¡Vamos por buen camino!"<br />
                            <strong>90% vendido:</strong> "¡Casi agotado! Solo quedan 10 números"<br />
                            <strong>100% vendido:</strong> "¡AGOTADO! Rifa completa"
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
            <div className="col-lg-10">
              <div className="card border-0 shadow-lg">
                <div className="card-header text-white text-center py-4" 
                     style={{ background: 'linear-gradient(45deg, #6f42c1, #e83e8c)' }}>
                  <h3 className="mb-0">
                    <i className="bi bi-phone me-2"></i>
                    Demo de Notificaciones
                  </h3>
                </div>
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="alert alert-info border-0">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Versión Demo:</strong> Simulación de notificaciones automáticas
                    </div>
                  </div>

                  {/* Simulación de Notificaciones */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-chat-square-dots me-2"></i>
                      Ejemplos de Notificaciones Recientes
                    </h5>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border-success">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-whatsapp text-success me-2"></i>
                              <small className="text-muted">WhatsApp - Hace 2 min</small>
                            </div>
                            <p className="mb-0 small">
                              <strong>Para María (Vendedora):</strong><br />
                              "¡Excelente! Vendiste el número 0156. Llevas $45,000 en comisiones este mes 🎉"
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card border-primary">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-envelope text-primary me-2"></i>
                              <small className="text-muted">Email - Hace 5 min</small>
                            </div>
                            <p className="mb-0 small">
                              <strong>Para Carlos (Comprador):</strong><br />
                              "Tu número 0156 está confirmado. El sorteo es mañana a las 8:00 PM 🎲"
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card border-warning">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-phone text-warning me-2"></i>
                              <small className="text-muted">SMS - Hace 10 min</small>
                            </div>
                            <p className="mb-0 small">
                              <strong>Para Ana (Organizadora):</strong><br />
                              "ALERTA: Rifa al 95% - Solo quedan 5 números disponibles"
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card border-info">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-app text-info me-2"></i>
                              <small className="text-muted">Push - Hace 15 min</small>
                            </div>
                            <p className="mb-0 small">
                              <strong>Para todos los participantes:</strong><br />
                              "⏰ Recordatorio: El sorteo comienza en 1 hora"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-4">
                      En la versión PRO, las notificaciones se envían automáticamente 
                      según las preferencias de cada usuario y el progreso de la rifa.
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
                   style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' }}>
                <div className="text-white">
                  <h2 className="fw-bold mb-3">¿Listo para Automatizar tus Comunicaciones?</h2>
                  <p className="lead mb-4">
                    Mantén a todos informados sin esfuerzo y mejora la experiencia 
                    de vendedores y compradores con notificaciones inteligentes
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <button className="btn btn-light btn-lg px-4">
                      <i className="bi bi-bell-fill me-2"></i>
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

export default SmartNotificationsPage;