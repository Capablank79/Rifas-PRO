import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BuyerRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleBuyers = [
    { id: 1, name: 'Ana García', email: 'ana.garcia@email.com', phone: '+56 9 1234 5678', purchases: 15, totalSpent: 450000, verified: true, lastPurchase: '2024-01-15' },
    { id: 2, name: 'Carlos López', email: 'carlos.lopez@email.com', phone: '+56 9 8765 4321', purchases: 8, totalSpent: 240000, verified: true, lastPurchase: '2024-01-14' },
    { id: 3, name: 'María Rodríguez', email: 'maria.rodriguez@email.com', phone: '+56 9 5555 1234', purchases: 22, totalSpent: 660000, verified: false, lastPurchase: '2024-01-13' },
    { id: 4, name: 'Pedro Martínez', email: 'pedro.martinez@email.com', phone: '+56 9 9999 8888', purchases: 5, totalSpent: 150000, verified: true, lastPurchase: '2024-01-12' }
  ];

  const filteredBuyers = sampleBuyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <i className="bi bi-people me-2"></i>
                Registro de Compradores
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Gestión Completa de Participantes
              </h1>
              <p className="fs-5 mb-4" style={{ opacity: '0.9' }}>
                Mantén un registro detallado de todos tus compradores con verificación automática, 
                historial de compras y herramientas avanzadas de gestión de contactos.
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

      {/* Características del Sistema */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Sistema de Registro Inteligente</h2>
            <p className="lead text-muted">Automatización y control total sobre tu base de datos</p>
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
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Verificación Automática</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Validación de email en tiempo real</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Verificación de números telefónicos</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Detección de duplicados</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Validación de identidad</li>
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
                      <i className="bi bi-graph-up text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Historial Completo</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Registro de todas las compras</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Análisis de comportamiento</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Preferencias de participación</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Estadísticas personalizadas</li>
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
                      <i className="bi bi-envelope text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-0">Comunicación Directa</h5>
                  </div>
                  <ul className="list-unstyled text-muted">
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Envío masivo de notificaciones</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Segmentación de audiencias</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Plantillas personalizables</li>
                    <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Seguimiento de entregas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo del Sistema */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Panel de Gestión de Compradores</h2>
            <p className="lead text-muted">Interfaz intuitiva para administrar tu base de datos</p>
          </div>

          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Base de Datos de Compradores</h5>
                    <div className="d-flex gap-2">
                      <span className="badge bg-success">{sampleBuyers.length} Registrados</span>
                      <span className="badge bg-primary">{sampleBuyers.filter(b => b.verified).length} Verificados</span>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Barra de búsqueda */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar por nombre o email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <button className="btn btn-primary me-2">
                        <i className="bi bi-plus me-2"></i>Agregar Comprador
                      </button>
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-download me-2"></i>Exportar
                      </button>
                    </div>
                  </div>

                  {/* Tabla de compradores */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Comprador</th>
                          <th>Contacto</th>
                          <th>Compras</th>
                          <th>Total Gastado</th>
                          <th>Estado</th>
                          <th>Última Compra</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBuyers.map((buyer) => (
                          <tr key={buyer.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" style={{
                                  width: '40px',
                                  height: '40px',
                                  background: 'var(--easyreef-gradient-primary)',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}>
                                  {buyer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="fw-semibold">{buyer.name}</div>
                                  <small className="text-muted">ID: {buyer.id.toString().padStart(4, '0')}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="small">{buyer.email}</div>
                                <div className="small text-muted">{buyer.phone}</div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">{buyer.purchases}</span>
                            </td>
                            <td>
                              <span className="fw-semibold text-success">
                                ${buyer.totalSpent.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${buyer.verified ? 'bg-success' : 'bg-warning'}`}>
                                {buyer.verified ? 'Verificado' : 'Pendiente'}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">{buyer.lastPurchase}</small>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="bi bi-envelope"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-success">
                                  <i className="bi bi-pencil"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="row mt-4">
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-primary fs-5">{sampleBuyers.length}</div>
                        <small className="text-muted">Total Compradores</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-success fs-5">
                          {Math.round((sampleBuyers.filter(b => b.verified).length / sampleBuyers.length) * 100)}%
                        </div>
                        <small className="text-muted">Verificados</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-warning fs-5">
                          {Math.round(sampleBuyers.reduce((acc, b) => acc + b.purchases, 0) / sampleBuyers.length)}
                        </div>
                        <small className="text-muted">Compras Promedio</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 rounded-3" style={{ background: 'hsl(228, 35%, 98%)' }}>
                        <div className="fw-bold text-info fs-5">
                          ${Math.round(sampleBuyers.reduce((acc, b) => acc + b.totalSpent, 0) / sampleBuyers.length).toLocaleString()}
                        </div>
                        <small className="text-muted">Gasto Promedio</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios del Sistema */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Beneficios del Registro Inteligente</h2>
            <p className="lead text-muted">Optimiza tu gestión y mejora la experiencia del cliente</p>
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
                  <i className="bi bi-lightning text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Registro Automático</h5>
                  <p className="text-muted mb-0">
                    Los compradores se registran automáticamente al realizar su primera compra, 
                    sin procesos adicionales que compliquen la experiencia.
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
                  <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Seguridad Garantizada</h5>
                  <p className="text-muted mb-0">
                    Todos los datos están protegidos con encriptación de nivel bancario y 
                    cumplimos con las normativas de protección de datos.
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
                  <i className="bi bi-graph-up text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Análisis Avanzado</h5>
                  <p className="text-muted mb-0">
                    Obtén insights valiosos sobre el comportamiento de tus compradores 
                    para optimizar futuras rifas y estrategias de marketing.
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
                  <i className="bi bi-people text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-2">Fidelización de Clientes</h5>
                  <p className="text-muted mb-0">
                    Identifica a tus mejores compradores y desarrolla estrategias 
                    personalizadas para mantener su participación activa.
                  </p>
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
                Gestiona tu Base de Datos como un{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Profesional
                </span>
              </h2>
              <p className="fs-5 text-muted mb-4">
                Mantén un control total sobre tus compradores con herramientas avanzadas 
                de gestión, verificación automática y análisis detallado.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  onClick={() => navigate('/register')} 
                  className="btn btn-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-people me-2"></i>
                  Comenzar Registro
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

export default BuyerRegistryPage;