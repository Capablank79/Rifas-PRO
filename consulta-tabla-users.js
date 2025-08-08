// Script para consultar la tabla users en Supabase y diagnosticar problemas de RLS
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function consultarTablaUsers() {
  console.log('Consultando tabla users...');
  
  try {
    // Consultar todos los usuarios
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error al consultar la tabla users:', error.message);
      console.error('Código de error:', error.code);
      console.error('Detalles:', error.details);
      console.error('Pista:', error.hint);
      
      // Si hay un error, probablemente sea por las políticas RLS
      console.log('\n🔍 El error podría estar relacionado con las políticas RLS.');
      console.log('Intentando consultar con la API REST directamente...');
      
      // Intentar consultar con la API REST directamente
      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?select=*`, 
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Error en la API REST: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Respuesta de error:', errorText);
      } else {
        const usersData = await response.json();
        console.log('Usuarios encontrados (API REST):', usersData ? usersData.length : 0);
        
        if (usersData && usersData.length > 0) {
          console.log('Primeros 5 usuarios:');
          usersData.slice(0, 5).forEach((user, index) => {
            console.log(`Usuario ${index + 1}:`, {
              id: user.id,
              email: user.email,
              role: user.role,
              created_at: user.created_at
            });
          });
        }
      }
      
      return;
    }
    
    console.log('Usuarios encontrados:', users ? users.length : 0);
    
    if (users && users.length > 0) {
      console.log('Primeros 5 usuarios:');
      users.slice(0, 5).forEach((user, index) => {
        console.log(`Usuario ${index + 1}:`, {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        });
      });
      
      // Verificar si hay usuarios duplicados por email
      const emails = users.map(user => user.email);
      const uniqueEmails = new Set(emails);
      
      if (emails.length !== uniqueEmails.size) {
        console.log('\n⚠️ ADVERTENCIA: Se encontraron emails duplicados:');
        
        // Encontrar los emails duplicados
        const emailCounts = {};
        emails.forEach(email => {
          emailCounts[email] = (emailCounts[email] || 0) + 1;
        });
        
        Object.entries(emailCounts)
          .filter(([_, count]) => count > 1)
          .forEach(([email, count]) => {
            console.log(`Email '${email}' aparece ${count} veces`);
            
            // Mostrar los usuarios con este email
            const duplicados = users.filter(user => user.email === email);
            duplicados.forEach(user => {
              console.log('  -', {
                id: user.id,
                email: user.email,
                role: user.role,
                created_at: user.created_at
              });
            });
          });
      } else {
        console.log('\n✅ No se encontraron emails duplicados.');
      }
      
      // Verificar si hay usuarios duplicados por ID
      const ids = users.map(user => user.id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        console.log('\n⚠️ ADVERTENCIA: Se encontraron IDs duplicados:');
        
        // Encontrar los IDs duplicados
        const idCounts = {};
        ids.forEach(id => {
          idCounts[id] = (idCounts[id] || 0) + 1;
        });
        
        Object.entries(idCounts)
          .filter(([_, count]) => count > 1)
          .forEach(([id, count]) => {
            console.log(`ID '${id}' aparece ${count} veces`);
            
            // Mostrar los usuarios con este ID
            const duplicados = users.filter(user => user.id === id);
            duplicados.forEach(user => {
              console.log('  -', {
                id: user.id,
                email: user.email,
                role: user.role,
                created_at: user.created_at
              });
            });
          });
      } else {
        console.log('\n✅ No se encontraron IDs duplicados.');
      }
    }
    
    // Mostrar diagnóstico sobre el problema de recursión infinita
    console.log('\n🔍 DIAGNÓSTICO DE RECURSIÓN INFINITA:');
    console.log('El problema de "infinite recursion detected in policy for relation \'users\'" se debe a:');
    console.log('1. La política RLS "users_admin_select_policy" que causa recursión infinita');
    console.log('2. Esta política hace referencia a la misma tabla users dentro de su condición USING:');
    console.log('   USING (auth.uid() IN (SELECT id FROM users WHERE role = \'gold\'))');    
    console.log('\n💡 SOLUCIÓN RECOMENDADA:');
    console.log('Ejecutar el script fix-users-rls-recursion.sql que:');
    console.log('1. Elimina la política problemática');
    console.log('2. Crea una nueva política sin recursión usando una función SECURITY DEFINER');
    console.log('3. O utiliza una política basada en el rol del token JWT');
    
    // Mostrar diagnóstico sobre el problema de clave duplicada
    console.log('\n🔍 DIAGNÓSTICO DE CLAVE DUPLICADA:');
    console.log('El problema de "duplicate key value violates unique constraint \'users_pkey\'" se debe a:');
    console.log('1. Intentos de insertar un usuario con un ID que ya existe');
    console.log('2. Esto ocurre en Navbar.tsx y FreePlanPage.tsx cuando:');
    console.log('   - Se verifica si el usuario existe por email pero no por ID');
    console.log('   - O se intenta insertar sin verificar primero si el ID ya existe');
    console.log('\n💡 SOLUCIÓN RECOMENDADA:');
    console.log('1. Modificar Navbar.tsx y FreePlanPage.tsx para verificar siempre por ID antes de insertar');
    console.log('2. Implementar una lógica de upsert (actualizar si existe, insertar si no)');
    console.log('3. Manejar adecuadamente los errores de inserción');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función
consultarTablaUsers();