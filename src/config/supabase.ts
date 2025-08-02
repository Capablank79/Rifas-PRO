import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fdqmyjuzgqvklhdesgik.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM'

// Advertencia en desarrollo si las variables no están configuradas
if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('⚠️ Supabase environment variables not configured. Using placeholder values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la tabla demo_requests
export interface DemoRequest {
  id?: string
  nombre: string
  email: string
  telefono: string
  tipo_rifa?: string
  frecuencia?: string
  comentarios?: string
  username?: string
  password?: string
  expires_at?: string
  status?: 'pending' | 'active' | 'expired'
  email_sent?: boolean
  created_at?: string
}

// Tipo para validación de credenciales
export interface CredentialValidation {
  isValid: boolean
  userData?: {
    id: string
    username: string
    email: string
    nombre: string
    expires_at: string
  }
}

// Función para validar solo el username (para sesiones guardadas)
export const validateDemoUser = async (username: string): Promise<CredentialValidation> => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Validation simulated.')
    
    // Simular credenciales válidas para testing
    if (username === 'demo_user') {
      return {
        isValid: true,
        userData: {
          id: 'placeholder-id',
          username: 'demo_user',
          email: 'demo@example.com',
          nombre: 'Usuario Demo',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        }
      }
    }
    
    return { isValid: false }
  }

  try {
    const { data, error } = await supabase.rpc('validate_demo_user', {
      p_username: username
    })

    if (error) {
      console.error('Error validating user:', error)
      return { isValid: false }
    }

    if (data && data.length > 0) {
      const user = data[0]
      return {
        isValid: true,
        userData: {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          expires_at: user.expires_at
        }
      }
    }

    return { isValid: false }
  } catch (error) {
    console.error('Error during user validation:', error)
    return { isValid: false }
  }
}

// Función para validar credenciales de demo
export const validateDemoCredentials = async (username: string, password: string): Promise<CredentialValidation> => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Validation simulated.')
    
    // Simular credenciales válidas para testing
    if (username === 'demo_user' && password === 'demo_pass') {
      return {
        isValid: true,
        userData: {
          id: 'placeholder-id',
          username: 'demo_user',
          email: 'demo@example.com',
          nombre: 'Usuario Demo',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        }
      }
    }
    
    return { isValid: false }
  }

  try {
    const { data, error } = await supabase.rpc('validate_demo_credentials', {
      p_username: username,
      p_password: password
    })

    if (error) {
      console.error('Error validating credentials:', error)
      return { isValid: false }
    }

    if (data && data.length > 0) {
      const user = data[0]
      return {
        isValid: true,
        userData: {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          expires_at: user.expires_at
        }
      }
    }

    return { isValid: false }
  } catch (error) {
    console.error('Error during credential validation:', error)
    return { isValid: false }
  }
}

// Función para insertar una nueva solicitud de demo
export const insertDemoRequest = async (data: Omit<DemoRequest, 'id' | 'created_at'>) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Request simulated.')
    return [{ ...data, id: 'placeholder-id', created_at: new Date().toISOString() }]
  }

  const { data: result, error } = await supabase
    .from('demo_requests')
    .insert([data])
    .select()

  if (error) {
    console.error('Error inserting demo request:', error)
    throw error
  }

  return result
}

// Función para obtener solicitudes de demo
export const getDemoRequests = async () => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Returning empty array.')
    return []
  }

  const { data, error } = await supabase
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching demo requests:', error)
    throw error
  }

  return data || []
}

// Función para obtener credenciales de demo para envío de email
export const getDemoCredentials = async (requestId: string) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Credentials simulated.')
    return {
      username: 'demo_user',
      password: 'demo_pass',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      email: 'demo@example.com',
      nombre: 'Usuario Demo'
    }
  }

  const { data, error } = await supabase
    .from('demo_requests')
    .select('username, password, expires_at, email, nombre')
    .eq('id', requestId)
    .single()

  if (error) {
    console.error('Error fetching demo credentials:', error)
    throw error
  }

  return data
}

// Función para marcar email como enviado
export const markEmailSent = async (requestId: string) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Email marked as sent (simulated).')
    return
  }

  const { error } = await supabase
    .from('demo_requests')
    .update({ email_sent: true })
    .eq('id', requestId)

  if (error) {
    console.error('Error marking email as sent:', error)
    throw error
  }
}