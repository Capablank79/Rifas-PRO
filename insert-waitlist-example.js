// Script para insertar datos en la tabla waitlist (ejemplo funcional)
import { createClient } from '@supabase/supabase-js';

// Usar las mismas credenciales que en el archivo supabase.ts
const supabaseUrl = 'https://fdqmyjuzgqvklhdesgik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW15anV6Z3F2a2xoZGVzZ2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQ4MzIsImV4cCI6MjA2OTY5MDgzMn0.kJMvEuoO-0BSdYRAi1Yc00erlCqnoj9Kd2R3z9VWUaM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertWaitlistEntry() {
  console.log('Insertando entrada en la tabla waitlist...');
  
  try {
    // Datos para la waitlist
    const name = 'Usuario de Ejemplo';
    const email = 'ejemplo' + Date.now() + '@example.com';
    const phone = '+1234567890';
    const organization = 'Organización de Prueba';
    const interest = 'demo'; // Valores posibles: 'demo', 'waitlist', 'feedback', 'partnership', 'pricing', 'other'
    const message = 'Este es un mensaje de prueba para demostrar la inserción en waitlist';
    
    // 1. Verificar si el email ya existe en la waitlist
    console.log('1. Verificando si el email ya existe...');
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar entrada existente:', checkError.message);
      return;
    }
    
    if (existingEntry) {
      console.log(`⚠️ El email ${email} ya existe en la tabla waitlist`);
      return;
    }
    
    // 2. Insertar en la tabla waitlist
    console.log('2. Insertando en la tabla waitlist...');
    const waitlistData = {
      name,
      email,
      phone,
      organization,
      interest,
      message,
      status: 'active',
      priority: 0,
      source: 'script_example'
    };
    
    const { data: result, error: insertError } = await supabase
      .from('waitlist')
      .insert([waitlistData])
      .select();
    
    if (insertError) {
      console.error('❌ Error al insertar en la tabla waitlist:', insertError.message);
      console.log('   - Código:', insertError.code);
      console.log('   - Detalles:', insertError.details);
      return;
    }
    
    console.log('✅ Entrada insertada en la tabla waitlist exitosamente');
    console.log('   - ID:', result[0].id);
    console.log('   - Email:', result[0].email);
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Entrada creada para: ${name}`);
    console.log(`✅ Email: ${email}`);
    console.log(`✅ Interés: ${interest}`);
    console.log('\n🔍 EXPLICACIÓN:');
    console.log('1. La tabla waitlist permite inserciones anónimas gracias a las políticas RLS configuradas');
    console.log('2. La política RLS permite que usuarios anónimos (anon) inserten datos');
    console.log('3. Para la tabla users, se necesita un enfoque similar que permita inserciones anónimas');
    console.log('4. La diferencia clave está en las políticas RLS configuradas para cada tabla');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

// Ejecutar la función
insertWaitlistEntry();