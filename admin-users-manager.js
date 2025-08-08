/**
 * Script para gestionar usuarios en Supabase
 * 
 * Este script combina las funcionalidades de:
 * - admin-auth-users.js: Gestión de usuarios de autenticación
 * - admin-user-roles.js: Gestión de roles de usuario
 * - sync-auth-users.js: Sincronización entre auth.users y users
 * - update-auth-metadata.js: Actualización de metadatos de autenticación
 * 
 * Permite realizar todas las operaciones de gestión de usuarios desde un solo lugar.
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

// ===== FUNCIONES DE GESTIÓN DE USUARIOS DE AUTENTICACIÓN =====

// Listar todos los usuarios de autenticación
async function listAuthUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    if (!data.users || data.users.length === 0) {
      console.log('No hay usuarios registrados.');
      return;
    }
    
    console.log(`\nUsuarios registrados (${data.users.length}):`);
    
    for (const user of data.users) {
      console.log('----------------');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log(`Último inicio de sesión: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}`);
      console.log(`Creado: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`Proveedor: ${user.app_metadata?.provider || 'email'}`);
      
      if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
        console.log('Metadatos:');
        console.log(JSON.stringify(user.user_metadata, null, 2));
      }
    }
    console.log('----------------');
  } catch (error) {
    console.error('Error al listar usuarios:', error.message);
  }
}

// Buscar un usuario de autenticación por email
async function getAuthUserByEmail(email) {
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
    console.error(`Error al buscar usuario por email ${email}:`, error.message);
    return null;
  }
}

// Actualizar un usuario de autenticación
async function updateAuthUser(email, updates) {
  try {
    const user = await getAuthUserByEmail(email);
    
    if (!user) return false;
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      updates
    );
    
    if (error) throw error;
    
    console.log(`✅ Usuario ${email} actualizado correctamente`);
    return true;
  } catch (error) {
    console.error(`Error al actualizar usuario ${email}:`, error.message);
    return false;
  }
}

// Eliminar un usuario de autenticación (requiere confirmación)
async function deleteAuthUser(email) {
  try {
    const user = await getAuthUserByEmail(email);
    
    if (!user) return false;
    
    console.log(`⚠️ Estás a punto de eliminar al usuario: ${email}`);
    console.log(`ID del usuario: ${user.id}`);
    console.log(`\nPara confirmar, ejecuta: node admin-users-manager.js confirm-delete ${user.id}`);
    
    return true;
  } catch (error) {
    console.error(`Error al preparar eliminación de usuario ${email}:`, error.message);
    return false;
  }
}

// Confirmar eliminación de un usuario de autenticación
async function confirmDeleteAuthUser(userId) {
  try {
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    console.log(`✅ Usuario con ID ${userId} eliminado correctamente`);
    
    // También eliminar de la tabla users si existe
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (!deleteError) {
      console.log(`✅ Registro eliminado también de la tabla users`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${userId}:`, error.message);
    return false;
  }
}

// ===== FUNCIONES DE GESTIÓN DE ROLES DE USUARIO =====

// Listar todos los roles asignados
async function listUserRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles_control')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('No hay roles asignados.');
      return;
    }
    
    console.log(`\nRoles asignados (${data.length}):`);
    
    for (const role of data) {
      console.log('----------------');
      console.log(`Email: ${role.email}`);
      console.log(`Rol: ${role.role}`);
      console.log(`Descripción: ${role.description || 'N/A'}`);
      console.log(`Creado: ${new Date(role.created_at).toLocaleString()}`);
    }
    console.log('----------------');
  } catch (error) {
    console.error('Error al listar roles:', error.message);
  }
}

// Asignar un rol a un usuario
async function assignUserRole(email, role, description = '') {
  try {
    // Verificar si el usuario ya tiene un rol asignado
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles_control')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron resultados"
      throw checkError;
    }
    
    let result;
    
    if (existingRole) {
      // Actualizar rol existente
      const { data, error } = await supabase
        .from('user_roles_control')
        .update({ role, description })
        .eq('email', email);
      
      if (error) throw error;
      
      result = { data, updated: true };
    } else {
      // Insertar nuevo rol
      const { data, error } = await supabase
        .from('user_roles_control')
        .insert([{ email, role, description }]);
      
      if (error) throw error;
      
      result = { data, updated: false };
    }
    
    console.log(`✅ Rol ${role} asignado a ${email}`);
    
    // Actualizar también en la tabla users si el usuario existe
    await updateUserRoleInUsersTable(email, role);
    
    return result;
  } catch (error) {
    console.error(`Error al asignar rol a ${email}:`, error.message);
    return null;
  }
}

// Actualizar el rol en la tabla users
async function updateUserRoleInUsersTable(email, role) {
  try {
    // Verificar si el usuario existe en la tabla users
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (user) {
      // Actualizar el rol en la tabla users
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('email', email);
      
      if (error) throw error;
      
      console.log(`✅ Rol actualizado en la tabla users para ${email}: ${role}`);
      
      // También actualizar los metadatos de autenticación
      const authUser = await getAuthUserByEmail(email);
      
      if (authUser) {
        const metadata = { ...authUser.user_metadata, role, rol: role, plan: role };
        await updateAuthUser(email, { user_metadata: metadata });
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error al actualizar rol en tabla users para ${email}:`, error.message);
    return false;
  }
}

// Eliminar un rol asignado
async function deleteUserRole(email) {
  try {
    const { data, error } = await supabase
      .from('user_roles_control')
      .delete()
      .eq('email', email);
    
    if (error) throw error;
    
    console.log(`✅ Rol eliminado para ${email}`);
    
    // Actualizar a rol 'free' en la tabla users si existe
    await updateUserRoleInUsersTable(email, 'free');
    
    return true;
  } catch (error) {
    console.error(`Error al eliminar rol para ${email}:`, error.message);
    return false;
  }
}

// ===== FUNCIONES DE SINCRONIZACIÓN =====

// Obtener todos los usuarios de autenticación
async function getAllAuthUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    return data.users || [];
  } catch (error) {
    console.error('Error al obtener usuarios de autenticación:', error.message);
    return [];
  }
}

// Verificar si un usuario existe en la tabla users
async function checkUserExistsInUsersTable(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error al verificar usuario ${userId} en tabla users:`, error.message);
    return false;
  }
}

// Obtener el rol asignado para un usuario desde user_roles_control
async function getUserRoleFromControl(email) {
  try {
    const { data, error } = await supabase
      .from('user_roles_control')
      .select('role')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? data.role : 'free'; // Rol por defecto: 'free'
  } catch (error) {
    console.error(`Error al obtener rol para ${email}:`, error.message);
    return 'free'; // Rol por defecto en caso de error
  }
}

// Agregar un usuario a la tabla users
async function addUserToUsersTable(authUser, role) {
  try {
    // Preparar datos para inserción
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.nombre || authUser.email,
      role: role
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData]);
    
    if (error) throw error;
    
    console.log(`✅ Usuario ${authUser.email} agregado a la tabla users con rol: ${role}`);
    return true;
  } catch (error) {
    console.error(`Error al agregar usuario ${authUser.email} a tabla users:`, error.message);
    return false;
  }
}

// Actualizar un usuario en la tabla users
async function updateUserInUsersTable(authUser, existingRole) {
  try {
    // Obtener el rol actual desde user_roles_control
    const controlRole = await getUserRoleFromControl(authUser.email);
    
    // Preparar datos para actualización
    const userData = {
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.nombre || authUser.email
    };
    
    // Actualizar el rol solo si es diferente al existente y no es 'free' o si el existente es 'free'
    if (controlRole !== existingRole && (controlRole !== 'free' || existingRole === 'free')) {
      userData.role = controlRole;
    }
    
    // Verificar si hay cambios para actualizar
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Verificar si hay cambios reales
    const needsUpdate = 
      currentUser.email !== userData.email ||
      currentUser.name !== userData.name ||
      (userData.role && currentUser.role !== userData.role);
    
    if (!needsUpdate) {
      console.log(`ℹ️ No se requieren cambios para el usuario ${authUser.email}`);
      return false;
    }
    
    // Realizar la actualización
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', authUser.id);
    
    if (error) throw error;
    
    console.log(`✅ Usuario ${authUser.email} actualizado en la tabla users`);
    if (userData.role) {
      console.log(`   Rol actualizado: ${userData.role}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error al actualizar usuario ${authUser.email} en tabla users:`, error.message);
    return false;
  }
}

// Sincronizar usuarios entre auth.users y la tabla users
async function syncUsers() {
  try {
    console.log('Iniciando sincronización de usuarios...');
    
    // Obtener todos los usuarios de autenticación
    const authUsers = await getAllAuthUsers();
    
    if (authUsers.length === 0) {
      console.log('No hay usuarios de autenticación para sincronizar.');
      return;
    }
    
    console.log(`Encontrados ${authUsers.length} usuarios de autenticación.`);
    
    // Contadores para el resumen
    let added = 0;
    let updated = 0;
    let unchanged = 0;
    
    // Procesar cada usuario
    for (const authUser of authUsers) {
      // Verificar si el usuario ya existe en la tabla users
      const exists = await checkUserExistsInUsersTable(authUser.id);
      
      if (!exists) {
        // Si no existe, obtener el rol asignado y agregarlo
        const role = await getUserRoleFromControl(authUser.email);
        const success = await addUserToUsersTable(authUser, role);
        
        if (success) added++;
      } else {
        // Si existe, obtener su rol actual y actualizar si es necesario
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.error(`Error al obtener datos de usuario ${authUser.email}:`, error.message);
          unchanged++;
          continue;
        }
        
        const updated = await updateUserInUsersTable(authUser, userData.role);
        
        if (updated) {
          updated++;
        } else {
          unchanged++;
        }
      }
    }
    
    console.log('\nResumen de sincronización:');
    console.log(`- Usuarios agregados: ${added}`);
    console.log(`- Usuarios actualizados: ${updated}`);
    console.log(`- Usuarios sin cambios: ${unchanged}`);
    console.log('Sincronización completada.');
  } catch (error) {
    console.error('Error durante la sincronización:', error.message);
  }
}

// Sincronizar metadatos entre la tabla users y auth.users
async function syncMetadata() {
  try {
    console.log('Iniciando sincronización de metadatos...');
    
    // Obtener todos los usuarios de la tabla users
    const { data: tableUsers, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    if (!tableUsers || tableUsers.length === 0) {
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
      const { data, error } = await supabase.auth.admin.getUserById(tableUser.id);
      
      if (error || !data.user) {
        console.log(`⚠️ No se encontró usuario de autenticación para ${tableUser.email}`);
        skipped++;
        continue;
      }
      
      const authUser = data.user;
      
      // Preparar metadatos a actualizar
      const currentMetadata = authUser.user_metadata || {};
      
      // Crear nuevos metadatos combinando los existentes con los datos de la tabla users
      const newMetadata = {
        ...currentMetadata,
        nombre: tableUser.name,
        role: tableUser.role,
        rol: tableUser.role,
        plan: tableUser.role
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
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tableUser.id,
        { user_metadata: newMetadata }
      );
      
      if (updateError) {
        console.error(`Error al actualizar metadatos para usuario ${tableUser.email}:`, updateError.message);
        skipped++;
      } else {
        console.log(`✅ Metadatos actualizados para usuario ${tableUser.email}`);
        updated++;
      }
    }
    
    console.log('\nResumen de sincronización de metadatos:');
    console.log(`- Usuarios actualizados: ${updated}`);
    console.log(`- Usuarios sin cambios: ${skipped}`);
    console.log('Sincronización de metadatos completada.');
  } catch (error) {
    console.error('Error durante la sincronización de metadatos:', error.message);
  }
}

// ===== PROCESAMIENTO DE COMANDOS =====

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    // Comandos de gestión de usuarios de autenticación
    case 'list-auth':
      await listAuthUsers();
      break;
    
    case 'update-auth':
      if (args.length < 3) {
        console.log('Uso: node admin-users-manager.js update-auth <email> <campo> <valor>');
        console.log('Campos disponibles: email, password, email_confirm, user_metadata');
        console.log('Para user_metadata, el valor debe ser un objeto JSON válido o campo.valor para actualizar un campo específico');
        break;
      }
      
      const email = args[1];
      const field = args[2];
      const value = args[3];
      
      let updates = {};
      
      switch (field) {
        case 'email':
          updates.email = value;
          break;
        
        case 'password':
          updates.password = value;
          break;
        
        case 'email_confirm':
          updates.email_confirmed_at = value === 'true' ? new Date().toISOString() : null;
          break;
        
        case 'user_metadata':
          try {
            // Verificar si es un objeto JSON completo o un campo específico
            if (value.includes('{') && value.includes('}')) {
              updates.user_metadata = JSON.parse(value);
            } else if (value.includes('.')) {
              // Formato: campo.valor
              const [metaField, metaValue] = value.split('.');
              
              // Obtener metadatos actuales
              const user = await getAuthUserByEmail(email);
              
              if (!user) break;
              
              const currentMetadata = user.user_metadata || {};
              updates.user_metadata = { ...currentMetadata, [metaField]: metaValue };
            } else {
              console.log('Formato incorrecto para user_metadata. Use un objeto JSON o campo.valor');
              break;
            }
          } catch (error) {
            console.error('Error al procesar user_metadata:', error.message);
            break;
          }
          break;
        
        default:
          console.log(`Campo desconocido: ${field}`);
          console.log('Campos disponibles: email, password, email_confirm, user_metadata');
          break;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateAuthUser(email, updates);
      }
      break;
    
    case 'delete-auth':
      if (args.length < 2) {
        console.log('Uso: node admin-users-manager.js delete-auth <email>');
        break;
      }
      
      await deleteAuthUser(args[1]);
      break;
    
    case 'confirm-delete':
      if (args.length < 2) {
        console.log('Uso: node admin-users-manager.js confirm-delete <user_id>');
        break;
      }
      
      await confirmDeleteAuthUser(args[1]);
      break;
    
    // Comandos de gestión de roles
    case 'list-roles':
      await listUserRoles();
      break;
    
    case 'assign':
      if (args.length < 3) {
        console.log('Uso: node admin-users-manager.js assign <email> <role> [descripción]');
        console.log('Roles disponibles: free, plata, gold');
        break;
      }
      
      const roleEmail = args[1];
      const role = args[2];
      const description = args[3] || '';
      
      if (!['free', 'plata', 'gold'].includes(role)) {
        console.log('Rol no válido. Roles disponibles: free, plata, gold');
        break;
      }
      
      await assignUserRole(roleEmail, role, description);
      break;
    
    case 'delete-role':
      if (args.length < 2) {
        console.log('Uso: node admin-users-manager.js delete-role <email>');
        break;
      }
      
      await deleteUserRole(args[1]);
      break;
    
    // Comandos de sincronización
    case 'sync-users':
      await syncUsers();
      break;
    
    case 'sync-metadata':
      await syncMetadata();
      break;
    
    case 'sync-all':
      console.log('Ejecutando sincronización completa...');
      await syncUsers();
      await syncMetadata();
      console.log('Sincronización completa finalizada.');
      break;
    
    // Comando para mostrar información de un usuario específico
    case 'info':
      if (args.length < 2) {
        console.log('Uso: node admin-users-manager.js info <email>');
        break;
      }
      
      const userEmail = args[1];
      
      // Obtener información de autenticación
      const authUser = await getAuthUserByEmail(userEmail);
      
      if (!authUser) {
        console.log(`Usuario ${userEmail} no encontrado en autenticación.`);
        break;
      }
      
      console.log('\n===== INFORMACIÓN DE USUARIO =====');
      console.log('\n--- Datos de Autenticación ---');
      console.log(`ID: ${authUser.id}`);
      console.log(`Email: ${authUser.email}`);
      console.log(`Confirmado: ${authUser.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log(`Último inicio de sesión: ${authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Nunca'}`);
      console.log(`Creado: ${new Date(authUser.created_at).toLocaleString()}`);
      console.log(`Proveedor: ${authUser.app_metadata?.provider || 'email'}`);
      
      if (authUser.user_metadata && Object.keys(authUser.user_metadata).length > 0) {
        console.log('Metadatos:');
        console.log(JSON.stringify(authUser.user_metadata, null, 2));
      }
      
      // Obtener información de la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      console.log('\n--- Datos de Tabla Users ---');
      
      if (userError) {
        console.log(`No se encontró en la tabla users.`);
      } else {
        console.log(`ID: ${userData.id}`);
        console.log(`Email: ${userData.email}`);
        console.log(`Nombre: ${userData.name}`);
        console.log(`Rol: ${userData.role}`);
        console.log(`Creado: ${new Date(userData.created_at).toLocaleString()}`);
      }
      
      // Obtener información de rol asignado
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles_control')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      console.log('\n--- Datos de Control de Roles ---');
      
      if (roleError) {
        console.log(`No tiene rol asignado en user_roles_control.`);
      } else {
        console.log(`Email: ${roleData.email}`);
        console.log(`Rol: ${roleData.role}`);
        console.log(`Descripción: ${roleData.description || 'N/A'}`);
        console.log(`Creado: ${new Date(roleData.created_at).toLocaleString()}`);
      }
      
      break;
    
    default:
      console.log(`
Gestor de Usuarios de Supabase
`);
      console.log(`Comandos disponibles:`);
      console.log(`\n--- Gestión de Usuarios de Autenticación ---`);
      console.log(`  node admin-users-manager.js list-auth - Listar todos los usuarios de autenticación`);
      console.log(`  node admin-users-manager.js update-auth <email> <campo> <valor> - Actualizar un usuario de autenticación`);
      console.log(`  node admin-users-manager.js delete-auth <email> - Iniciar proceso de eliminación de un usuario`);
      console.log(`  node admin-users-manager.js confirm-delete <user_id> - Confirmar eliminación de un usuario`);
      
      console.log(`\n--- Gestión de Roles ---`);
      console.log(`  node admin-users-manager.js list-roles - Listar todos los roles asignados`);
      console.log(`  node admin-users-manager.js assign <email> <role> [descripción] - Asignar un rol a un usuario`);
      console.log(`  node admin-users-manager.js delete-role <email> - Eliminar un rol asignado`);
      
      console.log(`\n--- Sincronización ---`);
      console.log(`  node admin-users-manager.js sync-users - Sincronizar usuarios entre auth.users y tabla users`);
      console.log(`  node admin-users-manager.js sync-metadata - Sincronizar metadatos entre tabla users y auth.users`);
      console.log(`  node admin-users-manager.js sync-all - Ejecutar ambas sincronizaciones`);
      
      console.log(`\n--- Información ---`);
      console.log(`  node admin-users-manager.js info <email> - Mostrar información completa de un usuario`);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});