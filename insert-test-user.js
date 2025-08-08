// Script para insertar un usuario de prueba con rol 'free' en la base de datos
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertTestUser() {
  console.log('Insertando usuario de prueba con rol "free"...');
  
  try {
    // Usar un correo electrónico válido
    const userId = 'test-user';
    const email = 'test@example.com';
    const password = 'password123';
    
    // 1. Registrar usuario en Supabase Auth
    console.log('1. Registrando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Usuario de Prueba',
          role: 'free'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Error al registrar usuario en Auth:', authError.message);
      return;
    }
    
    console.log('✅ Usuario registrado en Auth exitosamente');
    console.log(`   - ID: ${authData?.user?.id}`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Contraseña: ${password}`);
    
    // 2. Insertar usuario en la tabla users
    console.log('\n2. Insertando usuario en la tabla users...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authData?.user?.id,
          email,
          name: 'Usuario de Prueba',
          role: 'free'
        }
      ]);
      
    if (insertError) {
      console.error('❌ Error al insertar usuario en la tabla users:', insertError.message);
      console.log('   - Código:', insertError.code);
      console.log('   - Detalles:', insertError.details);
    } else {
      console.log('✅ Usuario insertado en la tabla users exitosamente');
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Usuario creado con email: ${email}`);
    console.log(`✅ Contraseña: ${password}`);
    console.log('✅ Rol asignado: free');
    console.log('\n🔑 PUEDES USAR ESTAS CREDENCIALES PARA INICIAR SESIÓN');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

insertTestUser();