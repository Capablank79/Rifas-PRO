import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { validateDemoCredentials, validateDemoUser } from '../config/supabase';

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
  role: 'admin' | 'demo';
  loginTime: string;
}

// Acciones
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: DemoUser }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: DemoUser };

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
} | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar sesión al cargar la aplicación
  useEffect(() => {
    const validateSavedSession = async () => {
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
          console.error('Error al restaurar sesión:', error);
          localStorage.removeItem('demoUser');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };
    
    validateSavedSession();
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

  const logout = () => {
    localStorage.removeItem('demoUser');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
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