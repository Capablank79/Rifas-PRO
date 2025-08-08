/**
 * Script para actualizar los metadatos de usuario en la tabla de autenticación de Supabase
 * basándose en los datos de la tabla users
 * 
 * Este script permite:
 * 1. Actualizar los metadatos de usuario en la tabla de autenticación
 * 2. Sincronizar el rol y otros datos entre la tabla users y la autenticación
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

// Función para obtener todos los usuarios de la tabla users
async function getUsersFromTable() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener usuarios de la tabla users:', error.message);
    return [];
  }
}

// Función para obtener un usuario de autenticación por ID
async function getAuthUserById(userId) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      console.log(`Usuario de autenticación con ID ${userId} no encontrado`);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error(`Error al buscar usuario de autenticación por ID ${userId}:`, error.message);
    return null;
  }
}

// Función para actualizar los metadatos de un usuario de autenticación
async function updateAuthUserMetadata(userId, metadata) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );
    
    if (error) throw error;
    
    console.log(`✅ Metadatos actualizados para usuario ${data.user.email}`);
    return true;
  } catch (error) {
    console.error(`Error al actualizar metadatos para usuario ${userId}:`, error.message);
    return false;
  }
}

// Función principal para sincronizar metadatos
async function syncMetadata() {
  try {
    console.log('Iniciando sincronización de metadatos...');
    
    // Obtener todos los usuarios de la tabla users
    const tableUsers = await getUsersFromTable();
    
    if (tableUsers.length === 0) {
      console.log('No hay usuarios en la tabla users para sincronizar.');
      return;
    }
    
    console.log(`Encontrados ${tableUsers.length} usuarios en la tabla users.`);
    
    // Contador de resultados
    let updated = 0;
    let skipped = 0;
    
    // Procesar cada usuario
    for (const tableUser of tableUsers) {
      // Obtener el usuario de autenticación correspondiente
      const authUser = await getAuthUserById(tableUser.id);
      
      if (!authUser) {
        console.log(`⚠️ No se encontró usuario de autenticación para ${tableUser.email}`);
        skipped++;
        continue;
      }
      
      // Preparar metadatos a actualizar
      const currentMetadata = authUser.user_metadata || {};
      
      // Crear nuevos metadatos combinando los existentes con los datos de la tabla users
      const newMetadata = {
        ...currentMetadata,
        nombre: tableUser.name,
        role: tableUser.role,
        rol: tableUser.role, // Asegurar que ambos campos 'role' y 'rol' estén sincronizados
        plan: tableUser.role // Para mantener compatibilidad con ambos campos
      };
      
      // Verificar si hay cambios en los metadatos
      const needsUpdate = 
        currentMetadata.nombre !== tableUser.name ||
        currentMetadata.role !== tableUser.role ||
        currentMetadata.rol !== tableUser.role ||
        currentMetadata.plan !== tableUser.role;
      
      if (!needsUpdate) {
        console.log(`ℹ️ No se requieren cambios en metadatos para ${tableUser.email}`);
        skipped++;
        continue;
      }
      
      // Actualizar metadatos
      const success = await updateAuthUserMetadata(tableUser.id, newMetadata);
      
      if (success) updated++;
      else skipped++;
    }
    
    console.log('\nResumen de sincronización de metadatos:');
    console.log(`- Usuarios actualizados: ${updated}`);
    console.log(`- Usuarios sin cambios: ${skipped}`);
    console.log('Sincronización de metadatos completada.');
  } catch (error) {
    console.error('Error durante la sincronización de metadatos:', error.message);
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'sync':
      await syncMetadata();
      break;
    
    default:
      console.log(`
Actualizador de Metadatos de Autenticación
`);
      console.log(`Comandos disponibles:`);
      console.log(`  node update-auth-metadata.js sync - Sincronizar metadatos de autenticación con la tabla users`);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});