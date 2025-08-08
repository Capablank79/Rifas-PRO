import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { validateDemoCredentials, validateDemoUser, supabase } from '../config/supabase';

// Estado inicial
interface AuthState {
  isAuthenticated: boolean;
  user: DemoUser | null;
  loading: boolean;
}

interface DemoUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'demo' | 'free';
  loginTime: string;
}

// Acciones
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: DemoUser }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: DemoUser }
  | { type: 'AUTH_STATE_CHANGE'; payload: DemoUser | null };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isAuthenticated: true, 
        user: action.payload, 
        loading: false 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false 
      };
    case 'RESTORE_SESSION':
      return { 
        ...state, 
        isAuthenticated: true, 
        user: action.payload, 
        loading: false 
      };
    case 'AUTH_STATE_CHANGE':
      return {
        ...state,
        isAuthenticated: !!action.payload,
        user: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

// Contexto
const AuthContext = createContext<{
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
} | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión al cargar la aplicación
  useEffect(() => {
    // Primero intentamos restaurar la sesión de Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase Auth state changed:', event, session);
        
        if (session) {
          try {
            // Crear usuario con datos básicos sin consultar la base de datos
            const user: DemoUser = {
              id: session.user.id,
              username: session.user.email || '',
              email: session.user.email || '',
              role: 'free', // Asignamos rol por defecto
              loginTime: new Date().toISOString()
            };
            
            dispatch({ type: 'AUTH_STATE_CHANGE', payload: user });
          } catch (error) {
            console.error('Error al procesar sesión de Supabase:', error);
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } else {
          // Si no hay sesión de Supabase, intentamos restaurar la sesión de demo
          const savedUser = localStorage.getItem('demoUser');
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              
              // Validar que el usuario sigue siendo válido (no expirado)
              const validationResult = await validateDemoUser(user.username);
              
              if (validationResult.isValid) {
                dispatch({ type: 'RESTORE_SESSION', payload: user });
              } else {
                // Credenciales expiradas o inválidas, limpiar localStorage
                console.log('Credenciales expiradas, requiere nuevo login');
                localStorage.removeItem('demoUser');
                dispatch({ type: 'LOGIN_FAILURE' });
              }
            } catch (error) {
              console.error('Error al restaurar sesión demo:', error);
              localStorage.removeItem('demoUser');
              dispatch({ type: 'LOGIN_FAILURE' });
            }
          } else {
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Validate credentials with Supabase
      const validationResult = await validateDemoCredentials(username, password);
      
      if (validationResult.isValid && validationResult.userData) {
        const user: DemoUser = {
          id: validationResult.userData.id.toString(),
          username: validationResult.userData.username,
          email: validationResult.userData.email,
          role: 'demo',
          loginTime: new Date().toISOString()
        };
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        localStorage.setItem('demoUser', JSON.stringify(user));
        return true;
      }
      
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error al iniciar sesión con Supabase Auth:', error);
        dispatch({ type: 'LOGIN_FAILURE' });
        return false;
      }
      
      if (data.user) {
        // La sesión se manejará automáticamente a través del listener de onAuthStateChange
        console.log('Inicio de sesión exitoso con Supabase Auth');
        return true;
      }
      
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    } catch (error) {
      console.error('Error durante el inicio de sesión con email:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = async () => {
    try {
      // Primero limpiamos todas las sesiones locales
      localStorage.clear(); // Elimina todo, incluyendo 'demoUser'
      sessionStorage.clear();
      
      // Intentamos cerrar la sesión en Supabase con scope local para evitar el error net::ERR_ABORTED
      try {
        // Usamos scope local para evitar el error net::ERR_ABORTED que ocurre con Google Auth
        await supabase.auth.signOut({ scope: 'local' });
      } catch (signOutError) {
        console.error('Error en supabase.auth.signOut:', signOutError);
        // Continuamos con el proceso de logout aunque falle signOut
      }
      
      dispatch({ type: 'LOGOUT' });
      
      // Forzamos una redirección completa para asegurar que se eliminen todas las cookies
      // y estados de sesión del navegador, añadiendo un parámetro para evitar caché
      window.location.href = '/?logout=' + new Date().getTime();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, intentamos limpiar el estado local
      localStorage.removeItem('demoUser');
      sessionStorage.clear();
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};