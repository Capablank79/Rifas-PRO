import { supabase } from './supabaseClient'

export const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // redirige de vuelta a tu app
      queryParams: {
        prompt: 'select_account', // fuerza ingreso de credenciales
        access_type: 'online'
      }
    }
  })

  if (error) {
    console.error('Error de login:', error.message)
  }
}

export const logoutCompletely = async () => {
  await supabase.auth.signOut()
 
  // Espera 1 segundo para que Supabase cierre sesión correctamente
  setTimeout(() => {
    window.location.href = 'https://accounts.google.com/Logout'
  }, 1000)
}