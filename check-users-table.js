/**
 * Script para verificar los usuarios en la tabla users
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

// Función para listar usuarios de la tabla users
async function listUsersTable() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('No hay usuarios en la tabla users.');
      return;
    }
    
    console.log('\nUsuarios en la tabla users:');
    console.log('----------------');
    data.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nombre: ${user.name}`);
      console.log(`Rol: ${user.role}`);
      console.log(`Creado: ${new Date(user.created_at).toLocaleString()}`);
      console.log('----------------');
    });
  } catch (error) {
    console.error('Error al listar usuarios de la tabla users:', error.message);
  }
}

// Ejecutar la función
listUsersTable().catch(error => {
  console.error('Error en la ejecución:', error);
  process.exit(1);
});