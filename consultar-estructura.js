// Script para consultar la estructura de las tablas disponibles en Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local o .env
dotenv.config({ path: '.env.local' }) || dotenv.config();

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista de tablas disponibles según check-tables.js
const tablasDisponibles = [
  'users', 'raffles', 'prizes', 'vendors', 'raffle_numbers', 'draws', 'bank_accounts',
  'waitlist', 'demo_requests'
];

async function consultarEstructuraTabla(nombreTabla) {
  try {
    console.log(`\n📋 Estructura de la tabla ${nombreTabla}:`)
    console.log('----------------------------------------');
    
    // Consultar la estructura de la tabla usando information_schema
    const { data, error } = await supabase
      .rpc('get_table_definition', { table_name: nombreTabla });
    
    if (error) {
      // Si el RPC no está disponible, intentamos un enfoque alternativo
      console.log(`No se pudo obtener la estructura mediante RPC: ${error.message}`);
      console.log('Intentando consultar directamente...');
      
      // Intentar obtener algunos registros para inferir la estructura
      const { data: sampleData, error: sampleError } = await supabase
        .from(nombreTabla)
        .select('*')
        .limit(1);
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        const sample = sampleData[0];
        console.log('Columnas inferidas del primer registro:');
        for (const [key, value] of Object.entries(sample)) {
          const tipo = typeof value;
          console.log(`- ${key}: ${tipo} ${value === null ? '(NULL)' : ''}`);
        }
      } else {
        console.log(`No se pudieron obtener registros para inferir estructura: ${sampleError?.message || 'No hay datos'}`);
      }
    } else {
      // Mostrar la definición de la tabla si el RPC funcionó
      console.log(data);
    }
    
    // Consultar los primeros registros de la tabla
    await consultarRegistrosTabla(nombreTabla);
  } catch (error) {
    console.error(`Error al consultar la estructura de ${nombreTabla}:`, error);
  }
}

async function consultarRegistrosTabla(nombreTabla) {
  try {
    // Consultar los primeros 5 registros de la tabla
    const { data, error } = await supabase
      .from(nombreTabla)
      .select('*')
      .limit(5);

    console.log(`\n📊 Primeros registros de la tabla ${nombreTabla}:`)
    console.log('----------------------------------------');
    
    if (error) {
      console.error(`Error al consultar registros: ${error.message}`);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`No se encontraron registros en la tabla ${nombreTabla}.`);
    }
  } catch (error) {
    console.error(`Error inesperado al consultar registros de ${nombreTabla}:`, error);
  }
}

async function consultarTodasLasTablas() {
  console.log('🔍 Consultando estructura y datos de las tablas disponibles...');
  console.log('===========================================================');
  
  for (const tabla of tablasDisponibles) {
    await consultarEstructuraTabla(tabla);
  }
  
  console.log('\n✅ Consulta completada.');
}

// Ejecutar la consulta
consultarTodasLasTablas();