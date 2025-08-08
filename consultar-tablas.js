// Script para consultar las tablas de la base de datos Supabase
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Obtener las credenciales de Supabase desde las variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarTablas() {
  try {
    // Consultar la lista de tablas disponibles en Supabase
    // Primero obtenemos la lista de tablas usando rpc
    const { data, error } = await supabase
      .rpc('get_tables')
      .select('*');

    // Si el RPC no está disponible, intentamos listar algunas tablas comunes
    if (error) {
      console.log('No se pudo usar RPC para listar tablas. Intentando listar tablas conocidas...');
      
      // Lista de tablas comunes en la aplicación EasyRif
      const tablasProbables = [
        'users',
        'raffles',
        'prizes',
        'vendors',
        'raffle_numbers',
        'draws',
        'bank_accounts',
        'user_roles_control',
        'waitlist',
        'demo_requests'
      ];
      
      // Verificar cada tabla
      const tablasExistentes = [];
      
      for (const tabla of tablasProbables) {
        const { data: testData, error: testError } = await supabase
          .from(tabla)
          .select('count(*)', { count: 'exact', head: true });
          
        if (!testError) {
          tablasExistentes.push({ tablename: tabla });
        }
      }
      
      return procesarTablas(tablasExistentes);
    }

    if (error) {
      console.error('Error al consultar las tablas:', error);
      return;
    }

    return procesarTablas(data);
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

async function procesarTablas(data) {
  console.log('\nTablas en la base de datos:');
  console.log('========================');
  
  if (data && data.length > 0) {
    data.forEach((tabla, index) => {
      console.log(`${index + 1}. ${tabla.tablename}`);
    });

    // Para cada tabla, obtener su estructura
    for (const tabla of data) {
      await consultarEstructuraTabla(tabla.tablename);
    }
  } else {
    console.log('No se encontraron tablas en el esquema public.');
  }
  
  return data;
}

async function consultarEstructuraTabla(nombreTabla) {
  try {
    // Consultar la estructura de la tabla usando la API de sistema de Postgres
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', nombreTabla);

    if (error) {
      console.error(`Error al consultar la estructura de la tabla ${nombreTabla}:`, error);
      return;
    }

    console.log(`\nEstructura de la tabla ${nombreTabla}:`);
    console.log('----------------------------------------');
    
    if (data && data.length > 0) {
      data.forEach(columna => {
        console.log(`- ${columna.column_name} (${columna.data_type}) ${columna.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Consultar los primeros 5 registros de la tabla
      await consultarRegistrosTabla(nombreTabla);
    } else {
      console.log(`No se encontraron columnas para la tabla ${nombreTabla}.`);
    }
  } catch (error) {
    console.error(`Error inesperado al consultar la estructura de ${nombreTabla}:`, error);
  }
}

async function consultarRegistrosTabla(nombreTabla) {
  try {
    // Consultar los primeros 5 registros de la tabla
    const { data, error } = await supabase
      .from(nombreTabla)
      .select('*')
      .limit(5);

    if (error) {
      console.error(`Error al consultar registros de la tabla ${nombreTabla}:`, error);
      return;
    }

    console.log(`\nPrimeros registros de la tabla ${nombreTabla}:`);
    console.log('----------------------------------------');
    
    if (data && data.length > 0) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`No se encontraron registros en la tabla ${nombreTabla}.`);
    }
  } catch (error) {
    console.error(`Error inesperado al consultar registros de ${nombreTabla}:`, error);
  }
}

// Ejecutar la consulta
consultarTablas()
  .then(() => {
    console.log('\nConsulta completada.');
  })
  .catch(error => {
    console.error('Error en la ejecución:', error);
  });