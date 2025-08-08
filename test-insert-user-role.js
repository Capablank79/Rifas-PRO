// Script para probar la inserción en la tabla user_roles_control
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserRolesControl() {
  console.log('Verificando acceso a la tabla user_roles_control...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // 1. Primero verificamos si podemos leer de la tabla
    console.log('1. Intentando leer de la tabla user_roles_control...');
    const { data: readData, error: readError } = await supabase
      .from('user_roles_control')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.error('❌ Error al leer de la tabla:', readError.message);
    } else {
      console.log('✅ Lectura exitosa de la tabla user_roles_control');
      console.log(`   - Registros encontrados: ${readData.length}`);
      if (readData.length > 0) {
        console.log('   - Ejemplo de registro:', readData[0]);
      }
    }
    
    // 2. Intentamos insertar un registro de prueba
    console.log('\n2. Intentando insertar un registro de prueba...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles_control')
      .insert([
        { 
          email: testEmail, 
          role: 'free',
          notes: 'Registro de prueba para verificar acceso'
        }
      ])
      .select();
    
    if (insertError) {
      console.error('❌ Error al insertar en la tabla:', insertError.message);
      console.log('   - Código:', insertError.code);
      console.log('   - Detalles:', insertError.details);
      
      // Si el error es de permisos, explicamos la razón
      if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
        console.log('\n🔒 ANÁLISIS DE PERMISOS:');
        console.log('   - La tabla tiene habilitada la seguridad a nivel de fila (RLS)');
        console.log('   - Solo los usuarios con rol "gold" pueden modificar esta tabla');
        console.log('   - Estás intentando acceder con credenciales anónimas o sin el rol adecuado');
        console.log('\n📝 SOLUCIÓN:');
        console.log('   - Usa el script admin-user-roles.js para gestionar roles (requiere clave de servicio)');
        console.log('   - O accede con una cuenta que tenga el rol "gold" asignado');
      }
    } else {
      console.log('✅ Inserción exitosa en la tabla user_roles_control');
      console.log(`   - Email insertado: ${testEmail}`);
      console.log('   - Datos insertados:', insertData[0]);
      
      // 3. Si la inserción fue exitosa, intentamos eliminar el registro de prueba
      console.log('\n3. Limpiando el registro de prueba...');
      const { error: deleteError } = await supabase
        .from('user_roles_control')
        .delete()
        .eq('email', testEmail);
      
      if (deleteError) {
        console.error('❌ Error al eliminar el registro de prueba:', deleteError.message);
      } else {
        console.log('✅ Registro de prueba eliminado correctamente');
      }
    }
    
    console.log('\n📊 RESUMEN DE LA PRUEBA:');
    if (!readError) {
      console.log('✅ Lectura: Disponible');
    } else {
      console.log('❌ Lectura: No disponible');
    }
    
    if (!insertError) {
      console.log('✅ Escritura: Disponible');
    } else {
      console.log('❌ Escritura: No disponible');
    }
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función inmediatamente
(async () => {
  await testUserRolesControl();
})();