import React from 'react'
import { loginWithGoogle, logoutCompletely } from './authFunctions'

export default function AuthButtons() {
  return (
    <div>
      <button onClick={loginWithGoogle}>Iniciar sesión con Google</button>
      <button onClick={logoutCompletely}>Cerrar sesión completamente</button>
    </div>
  )
}