// Script para consultar si la tabla users tiene valores en el campo email
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function consultarEmailsEnTablaUsers() {
  console.log('Consultando si la tabla users tiene valores en el campo email...');
  
  try {
    // Consultar todos los emails distintos en la tabla users
    const { data: emails, error: emailsError } = await supabase
      .from('users')
      .select('email')
      .not('email', 'is', null);
    
    if (emailsError) {
      console.error('Error al consultar emails en la tabla users:', emailsError);
      return;
    }
    
    if (emails && emails.length > 0) {
      console.log(`✅ Se encontraron ${emails.length} emails en la tabla users:`);
      console.log(JSON.stringify(emails, null, 2));
    } else {
      console.log('❌ No se encontraron emails en la tabla users.');
    }
    
    // Consultar todos los usuarios para verificar si hay datos en la tabla
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10);
    
    if (allUsersError) {
      console.error('Error al consultar todos los usuarios:', allUsersError);
      return;
    }
    
    if (allUsers && allUsers.length > 0) {
      console.log(`\n✅ Se encontraron ${allUsers.length} usuarios en la tabla:`);
      console.log(JSON.stringify(allUsers, null, 2));
    } else {
      console.log('\n❌ La tabla users no contiene ningún registro.');
    }
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la consulta
consultarEmailsEnTablaUsers();