// Script para eliminar todos los registros de las tablas users y user_roles_control
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase
// Usamos la clave anónima ya que hemos configurado políticas RLS que permiten eliminación
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Usamos la clave anónima en lugar de la clave de servicio

if (!supabaseKey) {
  console.error('Error: La variable de entorno VITE_SUPABASE_ANON_KEY es requerida');
  console.error('Por favor, asegúrate de que el archivo .env contiene esta variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function limpiarTablas() {
  console.log('🧹 Iniciando limpieza de tablas...');
  
  try {
    // 1. Eliminar todos los registros de la tabla user_roles_control
    console.log('\n📊 Eliminando registros de la tabla user_roles_control...');
    // Primero obtenemos todos los IDs
    const { data: roleIds, error: errorGetRoles } = await supabase
      .from('user_roles_control')
      .select('id');
      
    if (errorGetRoles) {
      console.warn(`⚠️ No se pudieron obtener los IDs de user_roles_control: ${errorGetRoles.message}`);
      console.log('   Esto puede deberse a las restricciones de las políticas RLS');
    } else if (roleIds && roleIds.length > 0) {
      console.log(`ℹ️ Se encontraron ${roleIds.length} registros para eliminar`);
      
      // Eliminamos cada registro individualmente
      for (const record of roleIds) {
        const { error: deleteError } = await supabase
          .from('user_roles_control')
          .delete()
          .eq('id', record.id);
          
        if (deleteError) {
          console.warn(`⚠️ Error al eliminar registro ${record.id}: ${deleteError.message}`);
        } else {
          console.log(`✅ Registro ${record.id} eliminado correctamente`);
        }
      }
    } else {
      console.log('ℹ️ No se encontraron registros para eliminar en user_roles_control');
    }
    
    // El manejo de errores ya se realizó en el bloque anterior
    
    // 2. Eliminar todos los registros de la tabla users
    console.log('\n👤 Eliminando registros de la tabla users...');
    // Primero obtenemos todos los IDs
    const { data: userIds, error: errorGetUsers } = await supabase
      .from('users')
      .select('id');
      
    if (errorGetUsers) {
      console.warn(`⚠️ No se pudieron obtener los IDs de users: ${errorGetUsers.message}`);
      console.log('   Esto puede deberse a las restricciones de las políticas RLS');
    } else if (userIds && userIds.length > 0) {
      console.log(`ℹ️ Se encontraron ${userIds.length} registros para eliminar`);
      
      // Eliminamos cada registro individualmente
      for (const user of userIds) {
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);
          
        if (deleteError) {
          console.warn(`⚠️ Error al eliminar usuario ${user.id}: ${deleteError.message}`);
        } else {
          console.log(`✅ Usuario ${user.id} eliminado correctamente`);
        }
      }
    } else {
      console.log('ℹ️ No se encontraron registros para eliminar en users');
    }
    
    // 3. Verificar registros visibles (según políticas RLS)
    console.log('\n🔍 Verificando registros visibles según políticas RLS...');
    
    const { data: dataRoles, error: errorCheckRoles } = await supabase
      .from('user_roles_control')
      .select('count');
    
    if (errorCheckRoles) {
      console.log(`ℹ️ No se pueden verificar registros en user_roles_control: ${errorCheckRoles.message}`);
      console.log('   Esto es normal si las políticas RLS restringen la visibilidad');
    } else {
      console.log(`📊 Registros visibles en user_roles_control: ${dataRoles[0]?.count || 0}`);
    }
    
    const { data: dataUsers, error: errorCheckUsers } = await supabase
      .from('users')
      .select('count');
    
    if (errorCheckUsers) {
      console.log(`ℹ️ No se pueden verificar registros en users: ${errorCheckUsers.message}`);
      console.log('   Esto es normal si las políticas RLS restringen la visibilidad');
    } else {
      console.log(`👤 Registros visibles en users: ${dataUsers[0]?.count || 0}`);
    }
    
    console.log('\n✨ Proceso completado');
    console.log('\n🔄 Ahora puedes hacer login con Google Auth y se crearán nuevos registros en las tablas');
    console.log('   El sistema te mostrará la página HomePageFree.tsx si las políticas RLS están configuradas correctamente');
    console.log('   Después del login, podrás verificar en Supabase que se han creado los registros correspondientes');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    process.exit(1);
  }
}

limpiarTablas();