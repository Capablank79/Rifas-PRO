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

// Tipos para la tabla waitlist
export interface WaitlistEntry {
  id?: string
  name: string
  email: string
  phone?: string
  organization?: string
  interest: 'demo' | 'waitlist' | 'feedback' | 'partnership' | 'pricing' | 'other'
  message?: string
  priority?: number
  status?: 'active' | 'contacted' | 'converted' | 'inactive'
  source?: string
  created_at?: string
  updated_at?: string
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
    const { data, error } = await supabase.rpc('validate_demo_user_by_username', {
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
    console.warn('⚠️ Using placeholder Supabase credentials. Update simulated.')
    return { success: true }
  }

  const { error } = await supabase
    .from('demo_requests')
    .update({ email_sent: true })
    .eq('id', requestId)

  if (error) {
    console.error('Error marking email as sent:', error)
    throw error
  }

  return { success: true }
}

// ============================================
// FUNCIONES PARA WAITLIST
// ============================================

// Función para insertar una nueva entrada en waitlist
export const insertWaitlistEntry = async (data: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'>) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Waitlist entry simulated.')
    return [{ ...data, id: 'placeholder-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]
  }

  const { data: result, error } = await supabase
    .from('waitlist')
    .insert([{
      ...data,
      status: data.status || 'active',
      priority: data.priority || 0,
      source: data.source || 'homepage'
    }])
    .select()

  if (error) {
    console.error('Error inserting waitlist entry:', error)
    throw error
  }

  return result
}

// Función para obtener todas las entradas de waitlist (para admin)
export const getWaitlistEntries = async () => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Returning empty waitlist data.')
    return []
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching waitlist entries:', error)
    throw error
  }

  return data || []
}

// Función para actualizar el estado de una entrada de waitlist
export const updateWaitlistStatus = async (id: string, status: WaitlistEntry['status']) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Status update simulated.')
    return { success: true }
  }

  const { error } = await supabase
    .from('waitlist')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating waitlist status:', error)
    throw error
  }

  return { success: true }
}

// Función para verificar si un email ya existe en waitlist
export const checkEmailInWaitlist = async (email: string) => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Email check simulated.')
    return { exists: false }
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('id, email')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking email in waitlist:', error)
    throw error
  }

  return { exists: !!data }
}

// Función para obtener estadísticas de waitlist
export const getWaitlistStats = async () => {
  // Si estamos usando credenciales placeholder, simular la respuesta
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Using placeholder Supabase credentials. Returning mock stats.')
    return {
      total: 0,
      active: 0,
      contacted: 0,
      converted: 0,
      byInterest: {}
    }
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('status, interest')

  if (error) {
    console.error('Error fetching waitlist stats:', error)
    throw error
  }

  const stats = {
    total: data.length,
    active: data.filter(entry => entry.status === 'active').length,
    contacted: data.filter(entry => entry.status === 'contacted').length,
    converted: data.filter(entry => entry.status === 'converted').length,
    byInterest: data.reduce((acc: Record<string, number>, entry) => {
      acc[entry.interest] = (acc[entry.interest] || 0) + 1
      return acc
    }, {})
  }

  return stats
}