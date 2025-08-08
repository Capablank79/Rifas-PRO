// Script para verificar la conexión a Supabase y listar las tablas
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Verificando conexión a Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Intentar una consulta simple para verificar la conexión
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error al conectar con Supabase:', error.message);
      return;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    
    // Lista de tablas a verificar
    const tablas = [
      // Tablas del esquema database-schema.sql
      'users', 'raffles', 'prizes', 'vendors', 'raffle_numbers', 'draws', 'bank_accounts',
      // Tablas mencionadas en supabase.ts
      'waitlist', 'demo_requests',
      // Tablas del sistema de Supabase
      'auth.users', 'auth.identities', 'storage.buckets', 'storage.objects',
      // Otras tablas posibles
      'profiles', 'waitlist_entries'
    ];
    
    console.log('\nVerificando tablas disponibles:');
    console.log('------------------------------');
    
    // Verificar cada tabla
    for (const tabla of tablas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Tabla ${tabla}: Disponible`);
          // Intentar contar registros
          try {
            const { count, error: countError } = await supabase
              .from(tabla)
              .select('*', { count: 'exact', head: true });
            
            if (!countError) {
              console.log(`   - Registros: ${count}`);
            }
          } catch (countErr) {
            // Ignorar errores al contar
          }
        } else {
          console.log(`❌ Tabla ${tabla}: No disponible o sin acceso (${error.message})`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${tabla}: Error al consultar (${err.message})`);
      }
    }
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función inmediatamente
(async () => {
  await checkDatabase();
})();