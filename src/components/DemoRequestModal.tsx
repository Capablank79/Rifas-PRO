import { useState, useEffect } from "react";
import { insertDemoRequest, getDemoCredentials, markEmailSent } from "../config/supabase";
import { sendDemoCredentials } from "../services/emailService";

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoRequestModal = ({ isOpen, onClose }: DemoRequestModalProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoRifa: "",
    frecuencia: "",
    comentarios: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    setShowToast({ show: true, message: `${title}: ${description}`, type: variant || 'success' });
    setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.email || !formData.telefono) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos requeridos.",
          variant: "destructive"
        });
        return;
      }

      console.log('Enviando datos a Supabase:', {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        tipo_rifa: formData.tipoRifa,
        frecuencia: formData.frecuencia,
        comentarios: formData.comentarios
      });

      // Enviar datos a Supabase (las credenciales se generan automáticamente)
      const result = await insertDemoRequest({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        tipo_rifa: formData.tipoRifa,
        frecuencia: formData.frecuencia,
        comentarios: formData.comentarios
      });

      console.log('Resultado de insertDemoRequest:', result);

      // Obtener las credenciales generadas
      if (result && result[0]?.id) {
        console.log('Obteniendo credenciales para ID:', result[0].id);
        const credentials = await getDemoCredentials(result[0].id);
        console.log('Credenciales obtenidas:', credentials);
        
        // Enviar email con credenciales
        console.log('Enviando email con credenciales...');
        const emailSent = await sendDemoCredentials({
          nombre: credentials.nombre,
          email: credentials.email,
          username: credentials.username,
          password: credentials.password,
          expires_at: credentials.expires_at
        });
        console.log('Email enviado:', emailSent);
        
        // Marcar email como enviado si fue exitoso
        if (emailSent) {
          await markEmailSent(result[0].id);
          console.log('Email marcado como enviado');
        }
      } else {
        console.error('No se pudo obtener el ID del resultado:', result);
      }

      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: "Revisa tu email para recibir las credenciales de acceso a la demo.",
      });

      // Limpiar formulario y cerrar modal
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        tipoRifa: "",
        frecuencia: "",
        comentarios: ""
      });
      onClose();

    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      toast({
        title: "Error al enviar solicitud",
        description: "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Toast */}
      {showToast.show && (
        <div className={`position-fixed top-0 end-0 p-3`} style={{ zIndex: 1060 }}>
          <div className={`alert alert-${showToast.type === 'destructive' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
            {showToast.message}
            <button type="button" className="btn-close" onClick={() => setShowToast({ show: false, message: '', type: '' })}></button>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      
      {/* Modal */}
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1}>
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center w-100 fw-bold">Solicitar Acceso a Demo</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Content */}
                <div className="col-lg-6 mb-4">
                  <div className="mb-4">
                    <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
                      Acceso a Demo Interactiva
                    </span>
                    <h3 className="fw-bold mb-3">
                      Prueba <span className="text-primary">EasyRif</span> gratis por 24 horas
                    </h3>
                    <p className="text-muted">
                      Solicita acceso a nuestra demo interactiva y recibe credenciales temporales 
                      para explorar todas las funcionalidades de EasyRif durante 24 horas.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    {[
                      "Acceso completo por 24 horas",
                      "Credenciales enviadas por email",
                      "Explora todas las funcionalidades",
                      "Únete a la waitlist desde la demo"
                    ].map((benefit, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                         <i className="bi bi-check-circle text-success me-2"></i>
                         <span className="fw-medium small">{benefit}</span>
                       </div>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="border-top pt-3">
                    <div className="row">
                      <div className="col-12 mb-3">
                        <div className="d-flex align-items-center">
                           <i className="bi bi-envelope text-primary me-2"></i>
                           <div>
                             <div className="fw-medium small">Email</div>
                             <div className="text-muted small">easyrdemo@exesoft.cl</div>
                           </div>
                         </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center">
                           <i className="bi bi-whatsapp text-primary me-2"></i>
                           <div>
                             <div className="fw-medium small">WhatsApp</div>
                             <div className="text-muted small">+56928762136</div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="col-lg-6">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre completo *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleChange("nombre", e.target.value)}
                          required
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label">Teléfono *</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                        required
                        maxLength={12}
                        placeholder="+56123456789"
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tipo de rifas que organizas</label>
                        <select 
                          className="form-select" 
                          value={formData.tipoRifa} 
                          onChange={(e) => handleChange("tipoRifa", e.target.value)}
                        >
                          <option value="">Selecciona una opción</option>
                          <option value="beneficas">Rifas benéficas</option>
                          <option value="empresariales">Eventos empresariales</option>
                          <option value="educativas">Instituciones educativas</option>
                          <option value="deportivas">Organizaciones deportivas</option>
                          <option value="otras">Otras</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Frecuencia de eventos</label>
                        <select 
                          className="form-select" 
                          value={formData.frecuencia} 
                          onChange={(e) => handleChange("frecuencia", e.target.value)}
                        >
                          <option value="">¿Qué tan seguido?</option>
                          <option value="mensual">Mensual</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="semestral">Semestral</option>
                          <option value="anual">Anual</option>
                          <option value="esporadico">Esporádico</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="comentarios" className="form-label">Comentarios adicionales</label>
                      <textarea
                        className="form-control"
                        id="comentarios"
                        value={formData.comentarios}
                        onChange={(e) => handleChange("comentarios", e.target.value)}
                        placeholder="Cuéntanos sobre tus necesidades específicas o preguntas..."
                        rows={3}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 mb-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Solicitar Acceso a Demo"}
                    </button>

                    <p className="text-muted text-center small">
                      Al enviar este formulario, recibirás credenciales temporales válidas por 24 horas 
                      para acceder a nuestra demo interactiva.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoRequestModal;