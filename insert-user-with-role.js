// Script para insertar un usuario con rol en la tabla users siguiendo el patrón de waitlist
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUserWithRole() {
  console.log('Insertando usuario con rol "free" directamente en la tabla users...');
  
  try {
    // Datos del usuario a insertar
    const email = 'usuario.prueba@example.com';
    const name = 'Usuario de Prueba';
    const role = 'free';
    const userId = uuidv4(); // Generar un UUID válido
    
    // 1. Verificar si el email ya existe en la tabla users
    console.log('1. Verificando si el email ya existe...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar usuario existente:', checkError.message);
      return;
    }
    
    if (existingUser) {
      console.log(`⚠️ El usuario con email ${email} ya existe en la tabla users`);
      return;
    }
    
    // 2. Verificar si hay un rol preasignado en user_roles_control
    console.log('2. Verificando si hay un rol preasignado...');
    const { data: preassignedRole } = await supabase
      .from('user_roles_control')
      .select('role')
      .eq('email', email)
      .single();
    
    // Determinar el rol a asignar (free por defecto, o el preestablecido si existe)
    const roleToAssign = preassignedRole?.role || role;
    console.log(`Rol a asignar: ${roleToAssign}`);
    
    // 3. Insertar usuario en la tabla users directamente
    console.log('3. Insertando usuario en la tabla users...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name,
          role: roleToAssign
        }
      ]);
      
    if (insertError) {
      console.error('❌ Error al insertar usuario en la tabla users:', insertError.message);
      console.log('   - Código:', insertError.code);
      console.log('   - Detalles:', insertError.details);
      return;
    }
    
    console.log('✅ Usuario insertado en la tabla users exitosamente');
    
    // 4. Insertar en user_roles_control si no existe
    if (!preassignedRole) {
      console.log('4. Insertando en user_roles_control...');
      const { error: roleError } = await supabase
        .from('user_roles_control')
        .insert([
          {
            email,
            role: roleToAssign,
            notes: 'Creado automáticamente'
          }
        ]);
        
      if (roleError) {
        console.log('⚠️ No se pudo insertar en user_roles_control:', roleError.message);
        console.log('   - Esto es normal si no tienes permisos para esta tabla');
      } else {
        console.log('✅ Rol registrado en user_roles_control');
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Usuario creado con email: ${email}`);
    console.log(`✅ ID: ${userId}`);
    console.log(`✅ Rol asignado: ${roleToAssign}`);
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función
insertUserWithRole();