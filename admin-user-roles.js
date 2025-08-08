/**
 * Script para administrar roles de usuario en la tabla user_roles_control
 * 
 * Este script permite:
 * 1. Asignar roles específicos a direcciones de correo electrónico
 * 2. Listar los roles asignados
 * 3. Eliminar asignaciones de roles
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Nota: Usar service key para operaciones administrativas

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para asignar un rol a un email
async function assignRole(email, role, notes = '') {
  if (!email || !role) {
    console.error('Error: Email y rol son requeridos');
    return;
  }
  
  if (!['free', 'plata', 'gold'].includes(role)) {
    console.error('Error: Rol debe ser uno de: free, plata, gold');
    return;
  }
  
  try {
    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('user_roles_control')
      .select('id')
      .eq('email', email)
      .single();
    
    let result;
    
    if (existing) {
      // Actualizar rol existente
      result = await supabase
        .from('user_roles_control')
        .update({ role, notes, updated_at: new Date() })
        .eq('email', email);
      
      console.log(`✅ Rol actualizado para ${email}: ${role}`);
    } else {
      // Insertar nuevo rol
      result = await supabase
        .from('user_roles_control')
        .insert([{ email, role, notes }]);
      
      console.log(`✅ Rol asignado a ${email}: ${role}`);
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Verificar si el usuario ya existe en la tabla users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      // Actualizar el rol del usuario existente
      const updateResult = await supabase
        .from('users')
        .update({ role })
        .eq('email', email);
      
      if (updateResult.error) {
        console.warn(`⚠️ No se pudo actualizar el rol en la tabla users: ${updateResult.error.message}`);
      } else {
        console.log(`✅ Rol actualizado en la tabla users para ${email}: ${role}`);
      }
    } else {
      console.log(`ℹ️ El usuario ${email} aún no existe en la tabla users. Se le asignará el rol ${role} cuando se registre.`);
    }
  } catch (error) {
    console.error('Error al asignar rol:', error.message);
  }
}

// Función para listar roles asignados
async function listRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles_control')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data.length === 0) {
      console.log('No hay roles asignados.');
      return;
    }
    
    console.log('\nRoles asignados:');
    console.log('----------------');
    data.forEach(item => {
      console.log(`Email: ${item.email}`);
      console.log(`Rol: ${item.role}`);
      console.log(`Creado: ${new Date(item.created_at).toLocaleString()}`);
      if (item.notes) console.log(`Notas: ${item.notes}`);
      console.log('----------------');
    });
  } catch (error) {
    console.error('Error al listar roles:', error.message);
  }
}

// Función para eliminar una asignación de rol
async function deleteRoleAssignment(email) {
  if (!email) {
    console.error('Error: Email es requerido');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('user_roles_control')
      .delete()
      .eq('email', email);
    
    if (error) throw error;
    
    console.log(`✅ Asignación de rol eliminada para ${email}`);
  } catch (error) {
    console.error('Error al eliminar asignación de rol:', error.message);
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'assign':
      if (args.length < 3) {
        console.error('Uso: node admin-user-roles.js assign <email> <role> [notes]');
        break;
      }
      await assignRole(args[1], args[2], args[3] || '');
      break;
    
    case 'list':
      await listRoles();
      break;
    
    case 'delete':
      if (args.length < 2) {
        console.error('Uso: node admin-user-roles.js delete <email>');
        break;
      }
      await deleteRoleAssignment(args[1]);
      break;
    
    default:
      console.log(`
Administrador de Roles de Usuario
`);
      console.log(`Comandos disponibles:`);
      console.log(`  node admin-user-roles.js assign <email> <role> [notes] - Asignar rol a un email`);
      console.log(`  node admin-user-roles.js list - Listar todos los roles asignados`);
      console.log(`  node admin-user-roles.js delete <email> - Eliminar asignación de rol`);
      console.log(`
Roles disponibles: free, plata, gold`);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});