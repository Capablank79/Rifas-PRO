/**
 * Script para sincronizar usuarios de autenticación de Supabase con la tabla users
 * 
 * Este script permite:
 * 1. Verificar si los usuarios de autenticación existen en la tabla users
 * 2. Agregar usuarios faltantes a la tabla users con el rol correspondiente
 * 3. Actualizar usuarios existentes con información de autenticación
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

// Función para obtener todos los usuarios de autenticación
async function getAuthUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    return data.users || [];
  } catch (error) {
    console.error('Error al obtener usuarios de autenticación:', error.message);
    return [];
  }
}

// Función para verificar si un usuario existe en la tabla users
async function checkUserExists(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron resultados"
      throw error;
    }
    
    return data ? true : false;
  } catch (error) {
    console.error(`Error al verificar usuario ${userId}:`, error.message);
    return false;
  }
}

// Función para obtener el rol asignado en user_roles_control
async function getRoleFromControl(email) {
  try {
    const { data, error } = await supabase
      .from('user_roles_control')
      .select('role')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? data.role : 'free'; // Rol por defecto: free
  } catch (error) {
    console.error(`Error al obtener rol para ${email}:`, error.message);
    return 'free'; // En caso de error, asignar rol free
  }
}

// Función para agregar un usuario a la tabla users
async function addUserToUsersTable(authUser) {
  try {
    // Obtener el rol asignado o usar 'free' por defecto
    const role = await getRoleFromControl(authUser.email);
    
    // Preparar datos del usuario
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
      role: role
    };
    
    // Insertar usuario en la tabla users
    const { error } = await supabase
      .from('users')
      .insert([userData]);
    
    if (error) throw error;
    
    console.log(`✅ Usuario agregado a la tabla users: ${authUser.email} con rol ${role}`);
    return true;
  } catch (error) {
    console.error(`Error al agregar usuario ${authUser.email}:`, error.message);
    return false;
  }
}

// Función para actualizar un usuario existente en la tabla users
async function updateUserInUsersTable(authUser) {
  try {
    // Obtener datos actuales del usuario
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Verificar si hay cambios en el email, nombre o metadatos
    const needsUpdate = 
      currentUser.email !== authUser.email ||
      (authUser.user_metadata?.full_name && currentUser.name !== authUser.user_metadata.full_name) ||
      (authUser.user_metadata?.name && currentUser.name !== authUser.user_metadata.name);
    
    // Verificar si hay un rol asignado en user_roles_control
    const assignedRole = await getRoleFromControl(authUser.email);
    const roleNeedsUpdate = assignedRole !== 'free' && currentUser.role === 'free';
    
    if (!needsUpdate && !roleNeedsUpdate) {
      console.log(`ℹ️ No se requieren cambios para el usuario ${authUser.email}`);
      return true;
    }
    
    // Preparar datos actualizados
    const updatedData = {
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || currentUser.name
    };
    
    // Actualizar rol si hay uno asignado en user_roles_control
    if (roleNeedsUpdate) {
      updatedData.role = assignedRole;
    }
    
    // Actualizar usuario
    const { error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', authUser.id);
    
    if (error) throw error;
    
    console.log(`✅ Usuario actualizado en la tabla users: ${authUser.email}${roleNeedsUpdate ? ` con rol ${assignedRole}` : ''}`);
    return true;
  } catch (error) {
    console.error(`Error al actualizar usuario ${authUser.email}:`, error.message);
    return false;
  }
}

// Función principal para sincronizar usuarios
async function syncUsers() {
  try {
    console.log('Iniciando sincronización de usuarios...');
    
    // Obtener todos los usuarios de autenticación
    const authUsers = await getAuthUsers();
    
    if (authUsers.length === 0) {
      console.log('No hay usuarios de autenticación para sincronizar.');
      return;
    }
    
    console.log(`Encontrados ${authUsers.length} usuarios de autenticación.`);
    
    // Contador de resultados
    let added = 0;
    let updated = 0;
    let skipped = 0;
    
    // Procesar cada usuario
    for (const authUser of authUsers) {
      // Verificar si el usuario ya existe en la tabla users
      const exists = await checkUserExists(authUser.id);
      
      if (!exists) {
        // Si no existe, agregarlo
        const success = await addUserToUsersTable(authUser);
        if (success) added++;
      } else {
        // Si existe, actualizar información si es necesario
        const success = await updateUserInUsersTable(authUser);
        if (success) updated++;
        else skipped++;
      }
    }
    
    console.log('\nResumen de sincronización:');
    console.log(`- Usuarios agregados: ${added}`);
    console.log(`- Usuarios actualizados: ${updated}`);
    console.log(`- Usuarios sin cambios: ${skipped}`);
    console.log('Sincronización completada.');
  } catch (error) {
    console.error('Error durante la sincronización:', error.message);
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'sync':
      await syncUsers();
      break;
    
    default:
      console.log(`
Sincronizador de Usuarios de Autenticación
`);
      console.log(`Comandos disponibles:`);
      console.log(`  node sync-auth-users.js sync - Sincronizar usuarios de autenticación con la tabla users`);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});