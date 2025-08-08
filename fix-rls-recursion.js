// Script para corregir la recursión infinita en las políticas RLS de la tabla users
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRLSRecursion() {
  console.log('Iniciando corrección de recursión infinita en políticas RLS...');
  
  try {
    // Paso 1: Verificar si podemos acceder a la tabla users
    console.log('Verificando acceso a la tabla users...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (usersError) {
      console.log('Error al acceder a la tabla users:', usersError.message);
      console.log('Esto es esperado debido a las políticas RLS actuales.');
    } else {
      console.log('Acceso exitoso a la tabla users:', usersData);
    }
    
    // Paso 2: Modificar el código en FreePlanPage.tsx y Navbar.tsx para evitar la recursión
    console.log('\nPara resolver el problema de recursión infinita, sigue estos pasos:');
    console.log('1. Modifica la verificación de usuarios en FreePlanPage.tsx y Navbar.tsx');
    console.log('2. Asegúrate de verificar primero si el usuario existe por email antes de intentar insertar');
    console.log('3. Solo inserta el usuario si no existe previamente');
    console.log('\nEjemplo de código para verificar usuario por email:');
    console.log(`
// Verificar primero si el email ya existe en la tabla users
const emailCheckResponse = await fetch(
  \`\${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?email=eq.\${encodeURIComponent(email)}\&select=id,email\`, 
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': \`Bearer \${import.meta.env.VITE_SUPABASE_ANON_KEY}\`,
      'Content-Type': 'application/json'
    }
  }
);

const existingUserByEmail = await emailCheckResponse.json();

// Solo insertar si el usuario no existe
if (!existingUserByEmail || existingUserByEmail.length === 0) {
  // Proceder con la inserción
}
`);
    
    console.log('\nPara resolver el problema de clave duplicada:');
    console.log('1. Siempre verifica si el usuario existe antes de insertar');
    console.log('2. Usa la API REST de Supabase en lugar del cliente para evitar problemas de RLS');
    console.log('3. Maneja adecuadamente los errores de inserción');
    
    console.log('\n✅ Instrucciones generadas correctamente.');
    console.log('Revisa los archivos FreePlanPage.tsx y Navbar.tsx para implementar estas correcciones.');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función
fixRLSRecursion();