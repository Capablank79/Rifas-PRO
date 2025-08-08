// Script para consultar el esquema de la base de datos Supabase
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

async function consultarEsquema() {
  console.log('🔍 Consultando esquema de la base de datos...');
  console.log('==========================================');
  
  try {
    // Consultar tablas en el esquema public
    console.log('\n📋 Tablas en el esquema public:');
    console.log('----------------------------');
    
    const { data: tablas, error: tablasError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablasError) {
      console.error('Error al consultar tablas:', tablasError.message);
    } else if (tablas && tablas.length > 0) {
      tablas.forEach((tabla, index) => {
        console.log(`${index + 1}. ${tabla.table_name}`);
      });
      
      // Consultar estructura de cada tabla
      for (const tabla of tablas) {
        await consultarColumnas(tabla.table_name);
      }
    } else {
      console.log('No se encontraron tablas en el esquema public.');
    }
    
    // Consultar vistas en el esquema public
    console.log('\n📊 Vistas en el esquema public:');
    console.log('----------------------------');
    
    const { data: vistas, error: vistasError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (vistasError) {
      console.error('Error al consultar vistas:', vistasError.message);
    } else if (vistas && vistas.length > 0) {
      vistas.forEach((vista, index) => {
        console.log(`${index + 1}. ${vista.table_name}`);
      });
    } else {
      console.log('No se encontraron vistas en el esquema public.');
    }
    
    // Consultar funciones en el esquema public
    console.log('\n🔧 Funciones en el esquema public:');
    console.log('-------------------------------');
    
    const { data: funciones, error: funcionesError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_schema', 'public')
      .order('routine_name');
    
    if (funcionesError) {
      console.error('Error al consultar funciones:', funcionesError.message);
    } else if (funciones && funciones.length > 0) {
      funciones.forEach((funcion, index) => {
        console.log(`${index + 1}. ${funcion.routine_name} (${funcion.routine_type})`);
      });
    } else {
      console.log('No se encontraron funciones en el esquema public.');
    }
    
    // Consultar políticas RLS
    console.log('\n🔒 Políticas RLS:');
    console.log('---------------');
    
    const { data: politicas, error: politicasError } = await supabase
      .from('pg_policies')
      .select('*')
      .order('tablename');
    
    if (politicasError) {
      console.error('Error al consultar políticas RLS:', politicasError.message);
    } else if (politicas && politicas.length > 0) {
      politicas.forEach((politica, index) => {
        console.log(`${index + 1}. ${politica.policyname} (tabla: ${politica.tablename}, operación: ${politica.cmd})`);
      });
    } else {
      console.log('No se encontraron políticas RLS o no se tiene acceso a esta información.');
    }
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

async function consultarColumnas(nombreTabla) {
  try {
    console.log(`\n📝 Estructura de la tabla ${nombreTabla}:`);
    console.log('----------------------------------------');
    
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', nombreTabla)
      .order('ordinal_position');
    
    if (error) {
      console.error(`Error al consultar columnas de ${nombreTabla}:`, error.message);
    } else if (data && data.length > 0) {
      data.forEach(columna => {
        const nullable = columna.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = columna.column_default ? ` DEFAULT ${columna.column_default}` : '';
        console.log(`- ${columna.column_name} (${columna.data_type}) ${nullable}${defaultValue}`);
      });
      
      // Consultar restricciones de la tabla
      await consultarRestricciones(nombreTabla);
    } else {
      console.log(`No se encontraron columnas para la tabla ${nombreTabla}.`);
    }
  } catch (error) {
    console.error(`Error inesperado al consultar columnas de ${nombreTabla}:`, error);
  }
}

async function consultarRestricciones(nombreTabla) {
  try {
    const { data, error } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', nombreTabla);
    
    if (error) {
      console.error(`Error al consultar restricciones de ${nombreTabla}:`, error.message);
    } else if (data && data.length > 0) {
      console.log('\nRestricciones:');
      data.forEach(restriccion => {
        let tipoRestriccion = '';
        switch (restriccion.constraint_type) {
          case 'PRIMARY KEY': tipoRestriccion = 'Clave primaria'; break;
          case 'FOREIGN KEY': tipoRestriccion = 'Clave foránea'; break;
          case 'UNIQUE': tipoRestriccion = 'Valor único'; break;
          case 'CHECK': tipoRestriccion = 'Verificación'; break;
          default: tipoRestriccion = restriccion.constraint_type;
        }
        console.log(`- ${restriccion.constraint_name} (${tipoRestriccion})`);
      });
    }
  } catch (error) {
    console.error(`Error inesperado al consultar restricciones de ${nombreTabla}:`, error);
  }
}

// Ejecutar la consulta
consultarEsquema()
  .then(() => {
    console.log('\n✅ Consulta de esquema completada.');
  })
  .catch(error => {
    console.error('Error en la ejecución:', error);
  });