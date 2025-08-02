import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

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
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'RESTORE_SESSION', payload: user });
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('demoUser');
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple demo login - only accept demo credentials
    if (username === 'demo' && password === 'demo123') {
      const user: DemoUser = {
        id: '1',
        username: 'demo',
        email: 'demo@rifas.com',
        role: 'demo',
        loginTime: new Date().toISOString()
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      localStorage.setItem('demoUser', JSON.stringify(user));
      return true;
    }
    
    dispatch({ type: 'LOGIN_FAILURE' });
    return false;
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