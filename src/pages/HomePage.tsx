import { Link, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { formatDate, formatPrice } from '../utils/helpers';
import { useState } from 'react';
import heroIllustration from '../assets/hero-illustration.jpg';
import { insertWaitlistEntry, checkEmailInWaitlist, type WaitlistEntry } from '../config/supabase';
import { sendWaitlistConfirmation, type WaitlistConfirmationData } from '../services/emailService';

const HomePage = () => {
  const { raffles, buyers, clearAllData } = useRaffle();
  const navigate = useNavigate();

  // Estados para el formulario de contacto
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    interest: 'demo',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Calcular estadísticas
  const activeRaffles = raffles.filter(raffle => raffle.status === 'active').length;
  const totalRaffles = raffles.length;
  
  // Calcular ingresos totales basado en las compras realizadas
  const totalRevenue = buyers.reduce((sum, buyer) => {
    const raffle = raffles.find(r => r.id === buyer.raffleId);
    if (raffle) {
      return sum + (buyer.numbers.length * raffle.pricePerNumber);
    }
    return sum;
  }, 0);

  // Funciones para el formulario de contacto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Verificar si el email ya existe en la waitlist
      const emailCheck = await checkEmailInWaitlist(formData.email);
      
      if (emailCheck.exists) {
        setSubmitStatus('error');
        // Mensaje actualizado para email duplicado
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'warning',
            title: 'Email ya registrado',
            message: 'Este correo ya se encuentra registrado para la lista de Espera'
          }
        }));
        return;
      }

      // Si hay error en la verificación pero no existe, continuar con advertencia
      if (emailCheck.error) {
        console.warn('⚠️ No se pudo verificar si el email existe, continuando con el registro:', emailCheck.error);
      }

      // Preparar datos para la waitlist
      const waitlistData: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        organization: formData.organization || undefined,
        interest: formData.interest as WaitlistEntry['interest'],
        message: formData.message || undefined,
        source: 'homepage'
      };

      // Insertar en la base de datos
      await insertWaitlistEntry(waitlistData);
      
      // Enviar correo de confirmación automático
      console.log('📧 Enviando correo de confirmación de waitlist...');
      const emailData: WaitlistConfirmationData = {
        name: formData.name,
        email: formData.email,
        interest: formData.interest,
        message: formData.message || undefined
      };
      
      const emailSent = await sendWaitlistConfirmation(emailData);
      
      if (emailSent) {
        console.log('✅ Correo de confirmación enviado exitosamente');
      } else {
        console.warn('⚠️ No se pudo enviar el correo de confirmación, pero el registro fue exitoso');
      }
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        interest: 'demo',
        message: ''
      });
      
      // Mostrar mensaje de éxito
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: '¡Registro exitoso!',
          message: emailSent 
            ? 'Te has registrado exitosamente. Revisa tu correo para más información.'
            : (formData.interest === 'waitlist' 
              ? 'Te has unido a nuestra lista de espera. Te contactaremos pronto.'
              : 'Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.')
        }
      }));
      
    } catch (error) {
      setSubmitStatus('error');
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Error',
          message: 'Hubo un problema al enviar el mensaje'
        }
      }));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  // Función para hacer scroll al formulario de waitlist
  const scrollToWaitlist = () => {
    const waitlistElement = document.getElementById('waitlist-form');
    if (waitlistElement) {
      waitlistElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="position-relative d-flex align-items-center justify-content-center overflow-hidden" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, hsl(0, 0%, 100%), hsl(228, 35%, 97%))'
      }}>
        {/* Background Elements */}
        <div className="position-absolute w-100 h-100" style={{
          background: 'linear-gradient(135deg, hsl(247, 84%, 57%, 0.05) 0%, transparent 50%, hsl(33, 100%, 60%, 0.05) 100%)'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          top: '25%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'hsl(247, 84%, 57%, 0.1)',
          filter: 'blur(60px)'
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          bottom: '25%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'hsl(33, 100%, 60%, 0.1)',
          filter: 'blur(60px)'
        }}></div>

        <div className="container position-relative" style={{ paddingTop: '80px' }}>
          <div className="row align-items-center">
            <div className="col-lg-6 animate-fade-in-up">
              {/* Badge */}
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
                background: 'hsl(247, 84%, 57%, 0.1)',
                color: 'var(--easyreef-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <i className="bi bi-star-fill me-2"></i>
                #1 Plataforma para Rifas
              </div>

              {/* Headline */}
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                Transforma tus{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  rifas
                </span>{" "}
                en un negocio{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-accent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  profesional
                </span>
              </h1>
              <p className="fs-5 mb-5" style={{ 
                color: 'var(--easyreef-muted-foreground)',
                lineHeight: '1.6',
                maxWidth: '600px'
              }}>
                Gestiona vendedores, ventas en tiempo real, compradores registrados y sorteos transparentes. 
                Todo con integración a redes sociales y análisis completo.
              </p>

              {/* CTAs */}
              <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                <Link to="/create" className="btn btn-primary btn-lg px-4 py-3">
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear Nueva Rifa
                </Link>
                <button 
                  onClick={scrollToWaitlist}
                  className="btn btn-outline-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-envelope me-2"></i>
                  Únete a la Lista de Espera
                </button>
              </div>

              {/* Social Proof */}
              <div className="d-flex align-items-center gap-4 pt-4" style={{
                borderTop: '1px solid hsl(228, 25%, 92%)'
              }}>
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">{totalRaffles}+</div>
                  <div className="small text-muted">Rifas Creadas</div>
                </div>
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">${Math.round(totalRevenue / 1000)}K+</div>
                  <div className="small text-muted">Recaudado</div>
                </div>
                <div className="text-center">
                  <div className="h4 fw-bold mb-0">99.9%</div>
                  <div className="small text-muted">Uptime</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="position-relative animate-float">
                <img
                  src={heroIllustration}
                  alt="Ilustración de rifa"
                  className="img-fluid rounded-3"
                  style={{ 
                    maxHeight: '400px',
                    boxShadow: 'var(--easyreef-shadow-elegant)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges y Acciones */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <span className="badge bg-success fs-6 px-3 py-2">
                <i className="bi bi-clock me-2"></i>
                Venta en tiempo real
              </span>
            </div>
            <div className="col-md-4 mb-3">
              <span className="badge bg-info fs-6 px-3 py-2">
                <i className="bi bi-shield-check me-2"></i>
                Sorteo transparente
              </span>
            </div>
            <div className="col-md-4 mb-3">
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={async () => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
                    try {
                      // Limpiar datos
                      clearAllData();
                      
                      // Mostrar mensaje de éxito
                      window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: {
                          type: 'success',
                          title: 'Datos eliminados',
                          message: 'Todos los datos han sido eliminados correctamente'
                        }
                      }));
                      
                      // Forzar recarga de la página para asegurar que se reflejen los cambios
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                      
                    } catch (error) {
                      console.error('Error al limpiar datos:', error);
                      window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: {
                          type: 'error',
                          title: 'Error',
                          message: 'Hubo un problema al eliminar los datos'
                        }
                      }));
                    }
                  }
                }}
              >
                <i className="bi bi-trash me-2"></i>
                Limpiar Datos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-5" style={{ background: 'hsl(0, 0%, 100%)' }}>
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
              background: 'hsl(247, 84%, 57%, 0.1)',
              color: 'var(--easyreef-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Características Principales
            </div>
            <h2 className="display-5 fw-bold mb-4">
              Todo lo que necesitas para{" "}
              <span style={{
                background: 'var(--easyreef-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                gestionar rifas
              </span>
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Desde la creación hasta el sorteo final, EasyRif te proporciona todas las herramientas 
              necesarias para ejecutar rifas profesionales y transparentes.
            </p>
          </div>

          {/* Features Grid */}
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div 
                className="card h-100 card-hover-effect" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/sellers')}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-people text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Gestión de Vendedores</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Administra tu equipo de vendedores con roles, comisiones y seguimiento de rendimiento en tiempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div 
                className="card h-100 card-hover-effect" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/realtime-sales')}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-graph-up text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Ventas en Tiempo Real</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Monitorea cada venta instantáneamente con dashboards en vivo y notificaciones automáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div 
                className="card h-100 card-hover-effect" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/transparent-raffles')}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Sorteos Transparentes</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Sistema de sorteo verificable y transparente que genera confianza en tus compradores.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div 
                className="card h-100 card-hover-effect" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/register')}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-share text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Integración Social</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Comparte automáticamente números disponibles en redes sociales para maximizar el alcance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 card-hover-effect" 
                   onClick={() => navigate('/smart-notifications')}
                   style={{ cursor: 'pointer' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-bell text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Notificaciones Inteligentes</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Alertas automáticas para vendedores y compradores sobre el estado de la rifa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 card-hover-effect" onClick={() => navigate('/advanced-analytics')} style={{ cursor: 'pointer' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-bar-chart text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Analíticas Avanzadas</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Reportes detallados de ventas, rendimiento y proyecciones para tomar mejores decisiones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 card-hover-effect" onClick={() => navigate('/buyer-registry')} style={{ cursor: 'pointer' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-check-circle text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Registro de Compradores</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Base de datos completa de participantes con verificación y gestión de contactos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 card-hover-effect" onClick={() => navigate('/web-access')} style={{ cursor: 'pointer' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-globe text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Acceso Web</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Plataforma 100% web, accesible desde cualquier dispositivo sin necesidad de instalación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rifas Activas */}
      {raffles.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-3">Rifas Activas</h2>
              <p className="lead text-muted">Participa en nuestras rifas disponibles</p>
            </div>

            <div className="row g-4">
              {raffles.slice(0, 6).map(raffle => (
                <div key={raffle.id} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title fw-bold">{raffle.name}</h5>
                        <span
                          className={`badge ${raffle.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                        >
                          {raffle.status === 'active' ? 'Activa' : 'Completada'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Precio por número:</span>
                          <span className="fw-bold text-primary">{formatPrice(raffle.pricePerNumber)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Fecha del sorteo:</span>
                          <span className="fw-bold">{formatDate(raffle.raffleDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <Link to={`/rafflemanagement/${raffle.id}`} className="btn btn-primary w-100">
                        <i className="bi bi-gear me-2"></i>
                        Gestionar Rifa
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {raffles.length > 6 && (
              <div className="text-center mt-4">
                <Link to="/" className="btn btn-outline-primary">
                  Ver Todas las Rifas
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Formulario de Contacto / Waitlist */}
      <section id="waitlist-form" className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
              background: 'hsl(247, 84%, 57%, 0.1)',
              color: 'var(--easyreef-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <i className="bi bi-envelope me-2"></i>
              Únete a la Lista de Espera
            </div>
            <h2 className="display-5 fw-bold mb-4">
              Sé el primero en{" "}
              <span style={{
                background: 'var(--easyreef-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                acceder
              </span>
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Regístrate para obtener acceso temprano, solicitar una demo personalizada o compartir tu feedback sobre la plataforma
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* Información Personal */}
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-semibold">
                          <i className="bi bi-person me-2"></i>
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2"></i>
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-semibold">
                          <i className="bi bi-phone me-2"></i>
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          className="form-control form-control-lg"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 234 567 8900"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="organization" className="form-label fw-semibold">
                          <i className="bi bi-building me-2"></i>
                          Organización
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          placeholder="Nombre de tu organización"
                        />
                      </div>

                      {/* Tipo de Interés */}
                      <div className="col-12">
                        <label htmlFor="interest" className="form-label fw-semibold">
                          <i className="bi bi-star me-2"></i>
                          ¿Qué te interesa más? *
                        </label>
                        <select
                          className="form-select form-select-lg"
                          id="interest"
                          name="interest"
                          value={formData.interest}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="demo">Solicitar demo personalizada</option>
                          <option value="waitlist">Unirme a la lista de espera</option>
                          <option value="feedback">Compartir feedback sobre la demo</option>
                          <option value="partnership">Oportunidades de colaboración</option>
                          <option value="pricing">Información sobre precios</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>

                      {/* Mensaje */}
                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-semibold">
                          <i className="bi bi-chat-dots me-2"></i>
                          Mensaje
                        </label>
                        <textarea
                          className="form-control"
                          id="message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Cuéntanos más sobre tus necesidades, feedback o cualquier pregunta que tengas..."
                        ></textarea>
                      </div>

                      {/* Botón de Envío */}
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg w-100"
                          disabled={isSubmitting}
                          style={{
                            background: 'var(--easyreef-gradient-primary)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Enviar Solicitud
                            </>
                          )}
                        </button>
                      </div>

                      {/* Estado del envío */}
                      {submitStatus === 'success' && (
                        <div className="col-12">
                          <div className="alert alert-success d-flex align-items-center" role="alert">
                            <i className="bi bi-check-circle me-2"></i>
                            <div>
                              <strong>¡Mensaje enviado exitosamente!</strong> Nos pondremos en contacto contigo pronto.
                            </div>
                          </div>
                        </div>
                      )}

                      {submitStatus === 'error' && (
                        <div className="col-12">
                          <div className="alert alert-danger d-flex align-items-center" role="alert">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <div>
                              <strong>Este correo ya se encuentra registrado para la lista de Espera</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Información adicional */}
              <div className="row g-4 mt-4">
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-lightning text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-2">Respuesta Rápida</h5>
                    <p className="text-muted small mb-0">
                      Te contactaremos en menos de 24 horas
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-2">Datos Seguros</h5>
                    <p className="text-muted small mb-0">
                      Tu información está completamente protegida
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-gift text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold mb-2">Acceso Temprano</h5>
                    <p className="text-muted small mb-0">
                      Sé de los primeros en usar la plataforma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planes de Suscripción */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
              background: 'hsl(247, 84%, 57%, 0.1)',
              color: 'var(--easyreef-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <i className="bi bi-stars me-2"></i>
              Planes Disponibles
            </div>
            <h2 className="display-5 fw-bold mb-4">
              Elige el plan que{" "}
              <span style={{
                background: 'var(--easyreef-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                mejor se adapte
              </span>{" "}
              a tus necesidades
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Ofrecemos diferentes opciones para que puedas gestionar tus rifas de manera profesional, sin importar el tamaño de tu organización
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Plan Free */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm">
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
                      <span>Máximo 100 números</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Máximo 5 premios</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Precio hasta $1.000/número</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center text-muted">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span>Carga masiva de vendedores</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center text-muted">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span>Rifas ilimitadas</span>
                    </li>
                  </ul>
                </div>
                <div className="card-footer bg-white border-0 p-4 text-center">
                  <button className="btn btn-outline-primary btn-lg w-100" style={{
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <i className="bi bi-download me-2"></i>
                    Obtener Gratis
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Plata */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-lg" style={{ transform: 'translateY(-10px)' }}>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge rounded-pill" style={{
                    background: 'var(--easyreef-gradient-primary)',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    <i className="bi bi-star-fill me-1"></i>
                    RECOMENDADO
                  </span>
                </div>
                <div className="card-header text-center py-4 border-0" style={{ background: 'rgba(102, 126, 234, 0.2)' }}>
                  <h3 className="fw-bold mb-0">Plata</h3>
                  <div className="d-flex justify-content-center align-items-baseline mt-3">
                    <span className="display-5 fw-bold">$19.990</span>
                    <span className="text-muted ms-1">/mes</span>
                  </div>
                  <p className="text-muted mt-2">Para organizaciones medianas</p>
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
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Carga masiva XLS</span>
                    </li>
                  </ul>
                </div>
                <div className="card-footer bg-white border-0 p-4 text-center">
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
                    <li className="mb-3 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Carga incremental XLS</span>
                    </li>
                  </ul>
                </div>
                <div className="card-footer bg-white border-0 p-4 text-center">
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
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5" style={{ background: 'var(--easyreef-gradient-primary)' }}>
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold mb-3 text-white">¿Listo para revolucionar tus rifas?</h2>
              <p className="lead mb-4 text-white opacity-75">
                Únete a cientos de organizadores que ya confían en EasyRif para gestionar 
                sus rifas de manera profesional.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link to="/create" className="btn btn-light btn-lg px-4 py-3 fw-semibold" style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Crear Mi Primera Rifa
                </Link>
                <Link to="/" className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" style={{
                  borderRadius: '12px',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <i className="bi bi-graph-up me-2"></i>
                  Ver Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mensaje para rifas vacías */}
      {raffles.length === 0 && (
        <section className="py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="bg-light rounded-3 p-5">
                  <i className="bi bi-plus-circle fs-1 text-primary mb-3"></i>
                  <h3 className="fw-bold mb-3">¡Comienza tu primera rifa!</h3>
                  <p className="text-muted mb-4">
                    No hay rifas activas en este momento. Crea tu primera rifa y comienza a generar ingresos.
                  </p>
                  <Link to="/create" className="btn btn-primary btn-lg">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Nueva Rifa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;