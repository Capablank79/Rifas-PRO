/**
 * Script para administrar usuarios de autenticación en Supabase
 * 
 * Este script permite:
 * 1. Listar usuarios de autenticación
 * 2. Actualizar datos de usuarios
 * 3. Eliminar usuarios
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

// Función para listar usuarios de autenticación
async function listUsers() {
  try {
    // Obtener usuarios de autenticación usando la API de Admin
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    if (!data || !data.users || data.users.length === 0) {
      console.log('No hay usuarios registrados.');
      return;
    }
    
    console.log('\nUsuarios registrados:');
    console.log('----------------');
    data.users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log(`Último inicio de sesión: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}`);
      console.log(`Creado: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`Proveedor: ${user.app_metadata?.provider || 'email'}`);
      if (user.user_metadata) {
        console.log('Metadatos:');
        console.log(JSON.stringify(user.user_metadata, null, 2));
      }
      console.log('----------------');
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error.message);
  }
}

// Función para actualizar datos de un usuario
async function updateUser(userId, userData) {
  if (!userId) {
    console.error('Error: ID de usuario es requerido');
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      userData
    );
    
    if (error) throw error;
    
    console.log(`✅ Usuario actualizado: ${data.user.email}`);
    console.log('Datos actualizados:');
    console.log(JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
  }
}

// Función para eliminar un usuario
async function deleteUser(userId) {
  if (!userId) {
    console.error('Error: ID de usuario es requerido');
    return;
  }
  
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    console.log(`✅ Usuario eliminado con ID: ${userId}`);
  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
  }
}

// Función para buscar un usuario por email
async function getUserByEmail(email) {
  if (!email) {
    console.error('Error: Email es requerido');
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`Usuario con email ${email} no encontrado`);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error al buscar usuario por email:', error.message);
    return null;
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'list':
      await listUsers();
      break;
    
    case 'update':
      if (args.length < 3) {
        console.error('Uso: node admin-auth-users.js update <email> <campo=valor> [campo2=valor2] ...');
        break;
      }
      
      const email = args[1];
      const user = await getUserByEmail(email);
      
      if (!user) break;
      
      const userData = {};
      
      // Procesar pares campo=valor
      for (let i = 2; i < args.length; i++) {
        const [field, value] = args[i].split('=');
        
        if (!field || value === undefined) {
          console.error(`Error en formato: ${args[i]}. Debe ser campo=valor`);
          continue;
        }
        
        // Manejar campos específicos
        if (field === 'email') {
          userData.email = value;
        } else if (field === 'password') {
          userData.password = value;
        } else if (field === 'email_confirm') {
          userData.email_confirm = value.toLowerCase() === 'true';
        } else if (field === 'user_metadata') {
          try {
            userData.user_metadata = JSON.parse(value);
          } catch (e) {
            console.error('Error: user_metadata debe ser un JSON válido');
            return;
          }
        } else {
          // Para otros campos, asumimos que son metadatos de usuario
          if (!userData.user_metadata) userData.user_metadata = {};
          userData.user_metadata[field] = value;
        }
      }
      
      await updateUser(user.id, userData);
      break;
    
    case 'delete':
      if (args.length < 2) {
        console.error('Uso: node admin-auth-users.js delete <email>');
        break;
      }
      
      const emailToDelete = args[1];
      const userToDelete = await getUserByEmail(emailToDelete);
      
      if (!userToDelete) break;
      
      // Confirmar eliminación
      console.log(`¿Está seguro que desea eliminar el usuario ${emailToDelete}? Esta acción no se puede deshacer.`);
      console.log('Para confirmar, ejecute: node admin-auth-users.js confirm-delete <id>');
      console.log(`ID del usuario: ${userToDelete.id}`);
      break;
    
    case 'confirm-delete':
      if (args.length < 2) {
        console.error('Uso: node admin-auth-users.js confirm-delete <id>');
        break;
      }
      
      await deleteUser(args[1]);
      break;
    
    default:
      console.log(`
Administrador de Usuarios de Autenticación
`);
      console.log(`Comandos disponibles:`);
      console.log(`  node admin-auth-users.js list - Listar todos los usuarios`);
      console.log(`  node admin-auth-users.js update <email> <campo=valor> [campo2=valor2] ... - Actualizar datos de usuario`);
      console.log(`  node admin-auth-users.js delete <email> - Iniciar proceso de eliminación de usuario`);
      console.log(`  node admin-auth-users.js confirm-delete <id> - Confirmar eliminación de usuario`);
      console.log(`
Campos disponibles para actualizar:`);
      console.log(`  email=nuevo@email.com - Cambiar email`);
      console.log(`  password=nuevacontraseña - Cambiar contraseña`);
      console.log(`  email_confirm=true|false - Confirmar/desconfirmar email`);
      console.log(`  user_metadata='{"campo":"valor"}' - Actualizar metadatos (JSON)`);
      console.log(`  cualquier_campo=valor - Añadir/actualizar campo en metadatos`);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});