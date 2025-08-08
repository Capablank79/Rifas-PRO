import { Link, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { formatDate, formatPrice } from '../utils/helpers';
import { useState, useRef } from 'react';
import heroIllustration from '../assets/hero-illustration.jpg';
import { insertWaitlistEntry, checkEmailInWaitlist, type WaitlistEntry, supabase } from '../config/supabase';
import { sendWaitlistConfirmation, type WaitlistConfirmationData } from '../services/emailService';

const HomePageFree = () => {
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
  
  // Referencia al formulario de waitlist
  const waitlistFormRef = useRef<HTMLFormElement>(null);

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
                      Visualiza las ventas en tiempo real, con actualizaciones instantáneas y notificaciones automáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div 
                className="card h-100 card-hover-effect" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/buyer-registry')}
              >
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    <div className="icon-container d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-gradient-primary)'
                    }}>
                      <i className="bi bi-person-badge text-white" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-2">Registro de Compradores</h5>
                    <p className="card-text text-muted small" style={{ lineHeight: '1.5' }}>
                      Mantén un registro detallado de todos los compradores, con información de contacto y números adquiridos.
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
                      Realiza sorteos transparentes y verificables, con transmisión en vivo y resultados auditables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Respuesta Rápida */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
                background: 'hsl(247, 84%, 57%, 0.1)',
                color: 'var(--easyreef-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Respuesta Rápida
              </div>
              <h2 className="display-5 fw-bold mb-4">
                Soporte técnico{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  inmediato
                </span>
              </h2>
              <p className="fs-5 text-muted mb-4">
                Nuestro equipo de soporte técnico está disponible 24/7 para ayudarte con cualquier problema o duda que puedas tener.
              </p>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-check-lg"></i>
                </div>
                <p className="mb-0">Respuesta en menos de 1 hora</p>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-check-lg"></i>
                </div>
                <p className="mb-0">Soporte por chat, email y teléfono</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-check-lg"></i>
                </div>
                <p className="mb-0">Documentación detallada y tutoriales</p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-primary)',
                      color: 'white'
                    }}>
                      <i className="bi bi-headset" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">Centro de Soporte</h5>
                      <p className="text-muted small mb-0">Disponible 24/7</p>
                    </div>
                  </div>
                  <p className="card-text mb-4">
                    ¿Tienes alguna pregunta o problema? Nuestro equipo de soporte está listo para ayudarte en cualquier momento.
                  </p>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary py-2">
                      <i className="bi bi-chat-dots me-2"></i>
                      Iniciar Chat
                    </button>
                    <button className="btn btn-outline-primary py-2">
                      <i className="bi bi-envelope me-2"></i>
                      Enviar Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seguridad de Datos */}
      <section className="py-5" style={{ background: 'hsl(0, 0%, 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-2 mb-4 mb-lg-0">
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
                background: 'hsl(247, 84%, 57%, 0.1)',
                color: 'var(--easyreef-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Seguridad de Datos
              </div>
              <h2 className="display-5 fw-bold mb-4">
                Protección{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  avanzada
                </span>{" "}
                de información
              </h2>
              <p className="fs-5 text-muted mb-4">
                Utilizamos las tecnologías más avanzadas para garantizar la seguridad de tus datos y transacciones.
              </p>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-lock"></i>
                </div>
                <p className="mb-0">Encriptación de extremo a extremo</p>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-shield-check"></i>
                </div>
                <p className="mb-0">Cumplimiento con estándares internacionales</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-database-check"></i>
                </div>
                <p className="mb-0">Backups automáticos y recuperación de desastres</p>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle me-3" style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--easyreef-primary)',
                      color: 'white'
                    }}>
                      <i className="bi bi-shield-lock" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div>
                      <h5 className="card-title mb-0">Certificaciones de Seguridad</h5>
                      <p className="text-muted small mb-0">Protección de nivel empresarial</p>
                    </div>
                  </div>
                  <p className="card-text mb-4">
                    Nuestras certificaciones de seguridad garantizan que tus datos están protegidos con los más altos estándares de la industria.
                  </p>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <i className="bi bi-patch-check text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="small mb-0">ISO 27001</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <i className="bi bi-patch-check text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="small mb-0">GDPR</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <i className="bi bi-patch-check text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="small mb-0">PCI DSS</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center">
                        <i className="bi bi-patch-check text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="small mb-0">SOC 2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acceso Temprano */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
                background: 'hsl(247, 84%, 57%, 0.1)',
                color: 'var(--easyreef-primary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Acceso Temprano
              </div>
              <h2 className="display-5 fw-bold mb-4">
                Únete a nuestra{" "}
                <span style={{
                  background: 'var(--easyreef-gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  lista de espera
                </span>
              </h2>
              <p className="fs-5 text-muted mb-4">
                Sé de los primeros en acceder a nuestra plataforma y disfruta de beneficios exclusivos.
              </p>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-gift"></i>
                </div>
                <p className="mb-0">Descuentos exclusivos para early adopters</p>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-star"></i>
                </div>
                <p className="mb-0">Acceso a funciones beta antes que nadie</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--easyreef-primary)',
                  color: 'white'
                }}>
                  <i className="bi bi-headset"></i>
                </div>
                <p className="mb-0">Soporte prioritario y personalizado</p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm" id="waitlist-form">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">Regístrate para acceso temprano</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Nombre completo</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Correo electrónico</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Teléfono (opcional)</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="organization" className="form-label">Organización (opcional)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="organization" 
                        name="organization" 
                        value={formData.organization}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="interest" className="form-label">¿Qué te interesa?</label>
                      <select 
                        className="form-select" 
                        id="interest" 
                        name="interest" 
                        value={formData.interest}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="demo">Solicitar una demo</option>
                        <option value="waitlist">Unirme a la lista de espera</option>
                        <option value="partnership">Explorar alianzas</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="form-label">Mensaje (opcional)</label>
                      <textarea 
                        className="form-control" 
                        id="message" 
                        name="message" 
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    <div className="d-grid">
                      <button 
                        type="submit" 
                        className="btn btn-primary py-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Enviando...
                          </>
                        ) : (
                          <>Enviar solicitud</>
                        )}
                      </button>
                    </div>
                    {submitStatus === 'success' && (
                      <div className="alert alert-success mt-3" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        ¡Gracias por tu interés! Te contactaremos pronto.
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="alert alert-danger mt-3" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente.
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planes de Suscripción */}
      <section className="py-5" style={{ background: 'hsl(0, 0%, 100%)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
              background: 'hsl(247, 84%, 57%, 0.1)',
              color: 'var(--easyreef-primary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Planes de Suscripción
            </div>
            <h2 className="display-5 fw-bold mb-4">
              Elige el plan{" "}
              <span style={{
                background: 'var(--easyreef-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                perfecto
              </span>{" "}
              para ti
            </h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Ofrecemos diferentes planes adaptados a tus necesidades, desde pequeñas rifas hasta grandes eventos.
            </p>
          </div>

          <div className="row g-4">
            {/* Plan Free */}
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h5 className="text-uppercase fw-bold text-muted small mb-2">Free</h5>
                    <div className="display-5 fw-bold mb-0">
                      $0
                      <span className="fs-6 text-muted fw-normal">/mes</span>
                    </div>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>1 rifa activa</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Hasta 100 números</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>1 vendedor</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Sorteo transparente</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Ventas en tiempo real</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Registro de compradores</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Análisis avanzado</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Soporte prioritario</span>
                    </li>
                  </ul>
                  <div className="d-grid">
                    <Link to="/free-plan" className="btn btn-outline-primary py-2">
                      Comenzar Gratis
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Plata */}
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm" style={{
                borderTop: '5px solid var(--easyreef-primary) !important',
                transform: 'translateY(-10px)',
                zIndex: 1
              }}>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge bg-primary px-3 py-2 rounded-pill">
                    Más Popular
                  </span>
                </div>
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h5 className="text-uppercase fw-bold text-muted small mb-2">Plata</h5>
                    <div className="display-5 fw-bold mb-0">
                      $29.99
                      <span className="fs-6 text-muted fw-normal">/mes</span>
                    </div>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>5 rifas activas</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Hasta 1,000 números por rifa</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>10 vendedores</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Sorteo transparente</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Ventas en tiempo real</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Registro de compradores</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Análisis avanzado</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="bi bi-x-circle-fill text-muted me-2"></i>
                      <span className="text-muted">Soporte prioritario</span>
                    </li>
                  </ul>
                  <div className="d-grid">
                    <button className="btn btn-primary py-2">
                      Suscribirse
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Gold */}
            <div className="col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h5 className="text-uppercase fw-bold text-muted small mb-2">Gold</h5>
                    <div className="display-5 fw-bold mb-0">
                      $99.99
                      <span className="fs-6 text-muted fw-normal">/mes</span>
                    </div>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Rifas ilimitadas</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Números ilimitados</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Vendedores ilimitados</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Sorteo transparente</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Ventas en tiempo real</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Registro de compradores</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Análisis avanzado</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  </ul>
                  <div className="d-grid">
                    <button className="btn btn-outline-primary py-2">
                      Contactar Ventas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'hsl(228, 35%, 97%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-sm overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5">
                      <h2 className="card-title fw-bold mb-3">¿Listo para crear tu primera rifa?</h2>
                      <p className="card-text mb-4">Comienza ahora y descubre lo fácil que es gestionar rifas profesionales con nuestra plataforma.</p>
                      <Link to="/create" className="btn btn-primary px-4 py-2">
                        <i className="bi bi-plus-circle me-2"></i>
                        Crear Nueva Rifa
                      </Link>
                    </div>
                  </div>
                  <div className="col-md-6 position-relative" style={{ minHeight: '300px' }}>
                    <div className="position-absolute w-100 h-100" style={{
                      background: 'linear-gradient(135deg, var(--easyreef-primary) 0%, var(--easyreef-accent) 100%)',
                      opacity: '0.9'
                    }}></div>
                    <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center text-center text-white p-4">
                      <i className="bi bi-ticket-perforated" style={{ fontSize: '4rem' }}></i>
                      <h3 className="mt-3 mb-2">¡Crea tu primera rifa gratis!</h3>
                      <p className="mb-0">Sin compromisos, sin tarjeta de crédito</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mensaje cuando no hay rifas */}
      {raffles.length === 0 && (
        <div className="container py-5">
          <div className="text-center">
            <div className="mb-4">
              <i className="bi bi-ticket-perforated" style={{ fontSize: '4rem', color: 'var(--easyreef-primary)' }}></i>
            </div>
            <h2 className="mb-3">¡Aún no tienes rifas!</h2>
            <p className="mb-4">Comienza creando tu primera rifa para aprovechar todas las funcionalidades de la plataforma.</p>
            <Link to="/create" className="btn btn-primary px-4 py-2">
              <i className="bi bi-plus-circle me-2"></i>
              Crear Nueva Rifa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageFree;