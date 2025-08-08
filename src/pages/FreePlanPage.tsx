import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

const FreePlanPage = () => {
  const navigate = useNavigate();
  const { state: authState, loginWithEmail } = useAuth();
  
  // Estado para controlar la vista (login o registro)
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Estados para el formulario de contacto
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    interest: 'free_plan',
    message: ''
  });
  
  // Estados para el formulario de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Funciones para el formulario de contacto/registro
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage('');
  };
  
  // Funciones para el formulario de login
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage('');
  };
  
  // Función para iniciar sesión con Google
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      // Utilizamos la función loginWithGoogle de authFunctions.js que implementa
      // la solución recomendada usando redirectTo en lugar de popups
      const { loginWithGoogle } = await import('../authFunctions');
      await loginWithGoogle();
      
      // Este código se ejecutará cuando el usuario regrese después del login con Google
      // debido a la redirección configurada en loginWithGoogle
      
      // Configuramos un listener para detectar cuando el usuario ha iniciado sesión
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'google') {
          try {
            // Verificar si es un nuevo usuario (primera vez que inicia sesión)
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            // Si no existe el usuario en la tabla users, es un nuevo registro
            if (!existingUser) {
              // Verificar si hay un rol preestablecido para este email en alguna tabla de control
              // Por ejemplo, podríamos tener una tabla 'user_roles_control' donde guardamos emails con sus roles asignados
              const { data: preassignedRole } = await supabase
                .from('user_roles_control')
                .select('role')
                .eq('email', session.user.email)
                .single();
              
              // Determinar el rol a asignar (free por defecto, o el preestablecido si existe)
              const roleToAssign = preassignedRole?.role || 'free';
              
              // Insertar el usuario en la tabla users con el rol correspondiente
              await supabase.from('users').insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata.full_name || session.user.email,
                  role: roleToAssign
                }
              ]);
              
              console.log(`Usuario registrado con rol: ${roleToAssign}`);
              
              // Enviar correo de bienvenida para usuarios de Google
              try {
                const { sendWelcomeEmail } = await import('../services/emailService');
                
                await sendWelcomeEmail({
                  name: session.user.user_metadata.full_name || session.user.email || 'Usuario',
                  email: session.user.email || '',
                  isGoogleLogin: true
                });
                
                console.log('✅ Correo de bienvenida enviado exitosamente al usuario de Google');
              } catch (emailError) {
                console.error('❌ Error al enviar correo de bienvenida al usuario de Google:', emailError);
              }
            }
          } catch (error) {
            console.error('Error al procesar el inicio de sesión con Google:', error);
          }
        }
        
        // Eliminar el listener después de usarlo
        authListener.subscription.unsubscribe();
      });
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      // No mostramos mensaje de error al usuario ya que la redirección
      // a Google se maneja automáticamente por Supabase
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para iniciar sesión con email y contraseña
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Usar la función loginWithEmail del AuthContext
      const success = await loginWithEmail(loginData.email, loginData.password);
      
      if (success) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            title: '¡Inicio de sesión exitoso!',
            message: 'Has iniciado sesión correctamente.'
          }
        }));
        navigate('/');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setErrorMessage(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para registrar un nuevo usuario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Verificar si el email ya existe en la tabla users
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .limit(1);
      
      if (checkError) {
        console.error('Error al verificar email existente:', checkError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        setSubmitStatus('error');
        setErrorMessage('Este correo ya se encuentra registrado en nuestro sistema');
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'warning',
            title: 'Email ya registrado',
            message: 'Este correo ya se encuentra registrado en nuestro sistema'
          }
        }));
        return;
      }

      // Verificar si hay un rol preestablecido para este email
      const { data: preassignedRole } = await supabase
        .from('user_roles_control')
        .select('role')
        .eq('email', formData.email)
        .single();
      
      // Determinar el rol a asignar (free por defecto, o el preestablecido si existe)
      const roleToAssign = preassignedRole?.role || 'free';
      
      console.log(`Asignando rol: ${roleToAssign} al usuario ${formData.email}`);
      
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone || undefined,
            address: formData.address || undefined,
            role: roleToAssign // Asignar el rol correspondiente
          }
        }
      });
      
      if (authError) throw authError;
      
      // Insertar usuario en la tabla users usando la API REST para evitar problemas de RLS
      try {
        console.log('Verificando si el usuario ya existe en la tabla users antes de insertar');
        
        // Verificar primero si el email ya existe en la tabla users
        const emailCheckResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(formData.email)}&select=id,email`, 
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!emailCheckResponse.ok) {
          console.error(`Error al verificar email: ${emailCheckResponse.status} ${emailCheckResponse.statusText}`);
          // Continuar con el proceso aunque haya error en la verificación
        } else {
          const existingUserByEmail = await emailCheckResponse.json();
          console.log('Verificación por email:', existingUserByEmail);
          
          // Si el usuario ya existe por email, no hacer nada más
          if (existingUserByEmail && existingUserByEmail.length > 0) {
            console.log('Usuario ya existe con este email, no es necesario insertar:', existingUserByEmail);
            // Continuamos con el proceso sin insertar
          } else {
            // Si el usuario no existe por email, verificar si existe por ID
            const idCheckResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?id=eq.${authData?.user?.id}&select=id`, 
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!idCheckResponse.ok) {
              console.error(`Error al verificar ID: ${idCheckResponse.status} ${idCheckResponse.statusText}`);
              // Continuar con el proceso aunque haya error en la verificación
            } else {
              const existingUserById = await idCheckResponse.json();
              console.log('Verificación por ID:', existingUserById);
              
              // Si el usuario ya existe por ID, no hacer nada más
              if (existingUserById && existingUserById.length > 0) {
                console.log('Usuario ya existe con este ID, no es necesario insertar:', existingUserById);
                // Continuamos con el proceso sin insertar
              } else {
                // Si llegamos aquí, el usuario no existe ni por email ni por ID, proceder a insertar
                console.log('Insertando usuario en tabla users usando API REST:', {
                  id: authData?.user?.id,
                  email: formData.email,
                  name: formData.name,
                  role: roleToAssign
                });
                
                try {
                  const insertResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users`, {
                    method: 'POST',
                    headers: {
                      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      id: authData?.user?.id,
                      email: formData.email,
                      name: formData.name,
                      phone: formData.phone || null,
                      address: formData.address || null,
                      role: roleToAssign
                    })
                  });
                  
                  if (!insertResponse.ok) {
                    const errorData = await insertResponse.text();
                    console.error('Error al insertar usuario usando API REST:', errorData);
                    // Continuamos con el proceso aunque haya error en la inserción
                  } else {
                    console.log(`Usuario agregado exitosamente con rol: ${roleToAssign}`);
                  }
                } catch (insertError) {
                  console.error('Error en la solicitud de inserción:', insertError);
                  // Continuamos con el proceso aunque haya error en la inserción
                }
              }
            }
          }
        }
      } catch (insertApiError) {
        console.error('Error al verificar/insertar usuario mediante API REST:', insertApiError);
        // Continuamos con el proceso aunque haya error en la inserción
      }
      
      // Enviar correo de confirmación automático (usando el sistema de Supabase Auth)
      console.log('📧 Supabase Auth enviará un correo de confirmación automáticamente...');
      
      // Enviar correo de bienvenida con la contraseña
      try {
        // Importar dinámicamente para evitar problemas de circular dependency
        const { sendWelcomeEmail } = await import('../services/emailService');
        
        await sendWelcomeEmail({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        console.log('✅ Correo de bienvenida enviado exitosamente');
      } catch (emailError) {
        console.error('❌ Error al enviar correo de bienvenida:', emailError);
        // No interrumpir el flujo si falla el envío del correo
      }
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        interest: 'free_plan',
        message: ''
      });
      
      // Mostrar mensaje de éxito
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: '¡Registro exitoso!',
          message: 'Te has registrado exitosamente para el plan Free. Por favor, verifica tu correo para confirmar tu cuenta.'
        }
      }));
      
      // Redirigir a la página principal después del registro exitoso
      navigate('/');
    
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Hubo un problema al procesar tu solicitud');
      console.error('Error al enviar el formulario:', error);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Error',
          message: 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.'
        }
      }));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'hsl(228, 35%, 97%)' }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <Link to="/login" className="d-inline-flex align-items-center mb-4 text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i>
            <span>Volver a planes</span>
          </Link>
          <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-4" style={{
            background: 'hsl(247, 84%, 57%, 0.1)',
            color: 'var(--easyreef-primary)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <i className="bi bi-download me-2"></i>
            Plan Free
          </div>
          <h2 className="display-5 fw-bold mb-4">
            {view === 'login' ? 'Inicia sesión para' : 'Regístrate para'}{" "}
            <span style={{
              background: 'var(--easyreef-gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              obtener el plan Free
            </span>
          </h2>
          <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
            {view === 'login' 
              ? 'Inicia sesión con tu cuenta existente o crea una nueva para acceder al plan gratuito'
              : 'Regístrate para obtener acceso gratuito a nuestra plataforma y comenzar a crear tu primera rifa'}
          </p>
          
          {/* Selector de vista (login/registro) */}
          <div className="d-flex justify-content-center mt-4 mb-2">
            <div className="btn-group" role="group" aria-label="Login options">
              <button 
                type="button" 
                className={`btn ${view === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setView('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                type="button" 
                className={`btn ${view === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setView('register')}
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Formulario de Login */}
                {view === 'login' && (
                  <>
                    {/* Botón de Google */}
                    <div className="text-center mb-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg w-100 mb-3"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                      >
                        <i className="bi bi-google me-2"></i>
                        Iniciar sesión con Google
                      </button>
                      
                      <div className="d-flex align-items-center my-4">
                        <hr className="flex-grow-1" />
                        <span className="mx-3 text-muted">o</span>
                        <hr className="flex-grow-1" />
                      </div>
                    </div>
                    
                    <form onSubmit={handleEmailLogin}>
                      <div className="mb-4">
                        <label htmlFor="login-email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2"></i>
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="login-email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginInputChange}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="login-password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2"></i>
                          Contraseña
                        </label>
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          id="login-password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginInputChange}
                          required
                          placeholder="Tu contraseña"
                        />
                      </div>
                      
                      {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                          {errorMessage}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg w-100"
                          disabled={isSubmitting}
                          style={{
                            background: 'var(--easyreef-gradient-primary)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-box-arrow-in-right me-2"></i>
                              Iniciar Sesión
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="text-center mt-4">
                        <p className="mb-0">¿No tienes una cuenta? <button type="button" className="btn btn-link p-0" onClick={() => setView('register')}>Regístrate</button></p>
                      </div>
                    </form>
                  </>
                )}
                
                {/* Formulario de Registro */}
                {view === 'register' && (
                  <form onSubmit={handleRegister}>
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
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2"></i>
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="Crea una contraseña segura"
                          minLength={6}
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
                          placeholder="Tu número de teléfono (opcional)"
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="address" className="form-label fw-semibold">
                          <i className="bi bi-geo-alt me-2"></i>
                          Dirección
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Tu dirección (opcional)"
                        />
                      </div>

                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-semibold">
                          <i className="bi bi-chat-left-text me-2"></i>
                          Mensaje (opcional)
                        </label>
                        <textarea
                          className="form-control form-control-lg"
                          id="message"
                          name="message"
                          rows={3}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Cuéntanos más sobre tu proyecto o necesidades"
                        ></textarea>
                      </div>
                      
                      {errorMessage && (
                        <div className="col-12">
                          <div className="alert alert-danger" role="alert">
                            {errorMessage}
                          </div>
                        </div>
                      )}

                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg w-100"
                          disabled={isSubmitting}
                          style={{
                            background: 'var(--easyreef-gradient-primary)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle-fill me-2"></i>
                              Registrarse y Obtener Plan Free
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="col-12 text-center mt-3">
                        <p className="mb-0">¿Ya tienes una cuenta? <button type="button" className="btn btn-link p-0" onClick={() => setView('login')}>Inicia sesión</button></p>
                      </div>
                    </div>
                  </form>
                )}

                {/* Estado del envío */}
                {submitStatus === 'success' && (
                  <div className="col-12">
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      <div>
                        <strong>¡Registro exitoso!</strong> Te hemos enviado un correo con los detalles de tu plan Free.
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="col-12">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <div>
                        <strong>Este correo ya se encuentra registrado en nuestro sistema</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="row g-4 mt-4">
              <div className="col-md-4">
                <div className="text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--easyreef-primary)'
                  }}>
                    <i className="bi bi-envelope fs-4"></i>
                  </div>
                  <h5 className="fw-semibold">Soporte por Email</h5>
                  <p className="text-muted small">soporte@easyreef.cl</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--easyreef-primary)'
                  }}>
                    <i className="bi bi-whatsapp fs-4"></i>
                  </div>
                  <h5 className="fw-semibold">WhatsApp</h5>
                  <p className="text-muted small">+56 9 2876 2136</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--easyreef-primary)'
                  }}>
                    <i className="bi bi-question-circle fs-4"></i>
                  </div>
                  <h5 className="fw-semibold">Preguntas Frecuentes</h5>
                  <p className="text-muted small">Visita nuestra sección de FAQ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePlanPage;