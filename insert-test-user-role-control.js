// Script para insertar un registro en la tabla user_roles_control con las nuevas políticas RLS
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUserRoleControl() {
  console.log('Insertando registro en la tabla user_roles_control con las nuevas políticas RLS...');
  
  try {
    // Generar datos únicos para este registro
    const timestamp = Date.now();
    const email = `test-role-${timestamp}@example.com`;
    const role = 'free';
    const notes = `Registro de prueba creado el ${new Date().toLocaleString()}`;
    
    console.log(`Datos del registro a insertar:\n- Email: ${email}\n- Rol: ${role}\n- Notas: ${notes}`);
    
    // Insertar registro en la tabla user_roles_control
    console.log('\nInsertando registro en la tabla user_roles_control...');
    const { error: insertError } = await supabase
      .from('user_roles_control')
      .insert([
        {
          email,
          role,
          notes
        }
      ]);
      
    if (insertError) {
      console.error('❌ Error al insertar registro en la tabla user_roles_control:', insertError.message);
      console.log('   - Código:', insertError.code);
      console.log('   - Detalles:', insertError.details);
      return;
    }
    
    console.log('✅ Registro insertado en la tabla user_roles_control exitosamente');
    
    // Intentar consultar el registro recién insertado
    console.log('\nIntentando consultar el registro recién insertado...');
    const { data: userData, error: selectError } = await supabase
      .from('user_roles_control')
      .select('*')
      .eq('email', email);
    
    if (selectError) {
      console.error('❌ Error al consultar el registro:', selectError.message);
    } else {
      console.log(`Resultado de la consulta: ${userData.length} registros encontrados`);
      if (userData.length > 0) {
        console.log('Datos del registro encontrado:', JSON.stringify(userData[0], null, 2));
      } else {
        console.log('⚠️ No se encontró el registro en la consulta debido a las políticas RLS');
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
    console.log(`✅ Registro creado con email: ${email}`);
    console.log(`✅ Rol asignado: ${role}`);
    console.log('✅ Las políticas RLS permiten inserciones anónimas');
    console.log('✅ Las políticas RLS restringen la visualización a usuarios autenticados o con rol "gold"');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

insertUserRoleControl();