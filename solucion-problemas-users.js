// Script para solucionar los problemas de recursión infinita y clave duplicada en la tabla users
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function solucionarProblemasUsers() {
  console.log('Iniciando solución de problemas en la tabla users...');
  
  try {
    // PARTE 1: SOLUCIÓN PARA RECURSIÓN INFINITA
    console.log('\n🔧 APLICANDO SOLUCIÓN PARA RECURSIÓN INFINITA:');
    console.log('1. Eliminando política problemática users_admin_select_policy...');
    
    // Ejecutar SQL para eliminar la política problemática
    const { error: dropPolicyError } = await supabase.rpc('execute_sql', {
      sql: "DROP POLICY IF EXISTS users_admin_select_policy ON public.users;"
    });
    
    if (dropPolicyError) {
      console.error('Error al eliminar política:', dropPolicyError.message);
      console.log('Intentando solución alternativa con API REST...');
      
      // Intentar con API REST si falla el método RPC
      const dropPolicyResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/execute_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: "DROP POLICY IF EXISTS users_admin_select_policy ON public.users;"
          })
        }
      );
      
      if (!dropPolicyResponse.ok) {
        console.error(`Error en API REST: ${dropPolicyResponse.status}`);
        console.log('\n⚠️ No se pudo eliminar la política automáticamente.');
        console.log('Por favor, ejecuta manualmente el script fix-users-rls-recursion.sql');
      } else {
        console.log('✅ Política eliminada correctamente.');
      }
    } else {
      console.log('✅ Política eliminada correctamente.');
    }
    
    console.log('\n2. Creando función SECURITY DEFINER para evitar recursión...');
    
    // Crear función SECURITY DEFINER
    const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.has_gold_role(user_id uuid)
    RETURNS boolean AS $$
    DECLARE
        user_role text;
    BEGIN
        -- Consulta directa sin usar políticas RLS
        SELECT role INTO user_role FROM public.users WHERE id = user_id;
        RETURN user_role = 'gold';
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: createFunctionError } = await supabase.rpc('execute_sql', {
      sql: createFunctionSQL
    });
    
    if (createFunctionError) {
      console.error('Error al crear función:', createFunctionError.message);
      console.log('\n⚠️ No se pudo crear la función automáticamente.');
      console.log('Por favor, ejecuta manualmente el script fix-users-rls-recursion.sql');
    } else {
      console.log('✅ Función creada correctamente.');
    }
    
    console.log('\n3. Creando nueva política sin recursión...');
    
    // Crear nueva política sin recursión
    const createPolicySQL = `
    CREATE POLICY users_gold_select_policy
    ON public.users
    FOR SELECT
    TO authenticated
    USING (public.has_gold_role(auth.uid()));
    `;
    
    const { error: createPolicyError } = await supabase.rpc('execute_sql', {
      sql: createPolicySQL
    });
    
    if (createPolicyError) {
      console.error('Error al crear política:', createPolicyError.message);
      console.log('\n⚠️ No se pudo crear la nueva política automáticamente.');
      console.log('Por favor, ejecuta manualmente el script fix-users-rls-recursion.sql');
    } else {
      console.log('✅ Nueva política creada correctamente.');
    }
    
    // PARTE 2: RECOMENDACIONES PARA CLAVE DUPLICADA
    console.log('\n🔧 RECOMENDACIONES PARA SOLUCIONAR CLAVE DUPLICADA:');
    console.log('El problema de clave duplicada requiere modificar el código en:');
    console.log('1. src/components/Navbar.tsx');
    console.log('2. src/pages/FreePlanPage.tsx');
    console.log('\nModificaciones necesarias:');
    console.log('- Verificar siempre si el usuario existe por ID antes de insertar');
    console.log('- Implementar una lógica de upsert (actualizar si existe, insertar si no)');
    console.log('- Manejar adecuadamente los errores de inserción');
    
    console.log('\nEjemplo de código para verificar usuario por ID:');
    console.log(`
// Verificar primero si el ID ya existe en la tabla users
const idCheckResponse = await fetch(
  \`\${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?id=eq.\${state.user.id}&select=id,email,role\`, 
  {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': \`Bearer \${import.meta.env.VITE_SUPABASE_ANON_KEY}\`,
      'Content-Type': 'application/json'
    }
  }
);

const existingUserById = await idCheckResponse.json();

// Si el usuario ya existe por ID, no hacer nada más
if (existingUserById && existingUserById.length > 0) {
  console.log('Usuario ya existe con este ID, no es necesario insertar');
  return;
}

// Si llegamos aquí, el usuario no existe, proceder a insertar
    `);
    
    console.log('\n✅ Diagnóstico y recomendaciones completados.');
    console.log('Por favor, aplica las modificaciones sugeridas en el código.');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función
solucionarProblemasUsers();