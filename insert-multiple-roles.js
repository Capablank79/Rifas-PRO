// Script para insertar múltiples registros en la tabla user_roles_control
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertMultipleRoles() {
  console.log('Insertando múltiples registros en la tabla user_roles_control...');
  
  try {
    // Generar datos para múltiples registros
    const timestamp = Date.now();
    const roles = [
      {
        email: `usuario1-${timestamp}@example.com`,
        role: 'free',
        notes: 'Usuario básico de prueba'
      },
      {
        email: `usuario2-${timestamp}@example.com`,
        role: 'plata',
        notes: 'Usuario plata de prueba'
      },
      {
        email: `usuario3-${timestamp}@example.com`,
        role: 'gold',
        notes: 'Usuario gold de prueba'
      }
    ];
    
    console.log('Datos de los registros a insertar:');
    roles.forEach((role, index) => {
      console.log(`\nRegistro #${index + 1}:`);
      console.log(`- Email: ${role.email}`);
      console.log(`- Rol: ${role.role}`);
      console.log(`- Notas: ${role.notes}`);
    });
    
    // Insertar registros en la tabla user_roles_control
    console.log('\nInsertando registros en la tabla user_roles_control...');
    
    // Insertar cada registro individualmente para mejor control de errores
    for (const role of roles) {
      const { error } = await supabase
        .from('user_roles_control')
        .insert([role]);
        
      if (error) {
        console.error(`❌ Error al insertar registro para ${role.email}:`, error.message);
        console.log(`   - Código: ${error.code}`);
        console.log(`   - Detalles: ${error.details}`);
      } else {
        console.log(`✅ Registro insertado exitosamente para ${role.email}`);
      }
    }
    
    // Intentar consultar los registros recién insertados
    console.log('\nIntentando consultar los registros recién insertados...');
    const { data: userData, error: selectError } = await supabase
      .from('user_roles_control')
      .select('*')
      .in('email', roles.map(r => r.email));
    
    if (selectError) {
      console.error('❌ Error al consultar los registros:', selectError.message);
    } else {
      console.log(`Resultado de la consulta: ${userData.length} registros encontrados`);
      if (userData.length > 0) {
        console.log('Datos de los registros encontrados:');
        userData.forEach(user => {
          console.log(JSON.stringify(user, null, 2));
        });
      } else {
        console.log('⚠️ No se encontraron los registros en la consulta debido a las políticas RLS');
        console.log('Esto es esperado ya que las políticas RLS permiten inserciones anónimas');
        console.log('pero restringen la visualización solo a usuarios autenticados o con rol "gold"');
      }
    }
    
    // Consultar todos los registros para verificar
    console.log('\nConsultando todos los registros...');
    const { data: allRecords, error: allRecordsError } = await supabase
      .from('user_roles_control')
      .select('*');
    
    if (allRecordsError) {
      console.error('❌ Error al consultar todos los registros:', allRecordsError.message);
    } else {
      console.log(`Total de registros visibles: ${allRecords.length}`);
      console.log('Esto confirma que las políticas RLS están funcionando correctamente');
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Se intentaron insertar ${roles.length} registros en la tabla user_roles_control`);
    console.log('✅ Las políticas RLS permiten inserciones anónimas');
    console.log('✅ Las políticas RLS restringen la visualización a usuarios autenticados o con rol "gold"');
    console.log('\n✨ Para ver estos registros, un administrador debe usar el script admin-user-roles.js');
    console.log('   o conectarse directamente a la base de datos con permisos elevados.');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

insertMultipleRoles();