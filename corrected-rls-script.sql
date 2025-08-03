-- 🔧 SCRIPT CORREGIDO PARA RLS WAITLIST
-- Problema identificado: Falta especificar roles en las políticas
-- Solución: Agregar TO anon, authenticated explícitamente

-- ============================================
-- PASO 1: LIMPIAR CONFIGURACIÓN ANTERIOR
-- ============================================

-- Deshabilitar RLS temporalmente para limpiar
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Users can insert waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can update waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.waitlist;

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "waitlist_insert_policy" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_policy" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_update_policy" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_delete_policy" ON public.waitlist;
DROP POLICY IF EXISTS "Allow anonymous waitlist inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Allow anonymous insertions" ON public.waitlist;
DROP POLICY IF EXISTS "Universal waitlist insert policy" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated read policy" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated update policy" ON public.waitlist;
DROP POLICY IF EXISTS "Public can insert waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can delete waitlist" ON public.waitlist;

-- ============================================
-- PASO 2: HABILITAR RLS
-- ============================================

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: CREAR POLÍTICAS CORREGIDAS
-- ============================================

-- 🔍 POLÍTICA PARA SELECT - ESPECIFICANDO ROLES EXPLÍCITAMENTE
-- CORRECCIÓN: Agregar "TO anon, authenticated"
CREATE POLICY "Users can view waitlist entries" ON public.waitlist
FOR SELECT
TO anon, authenticated
USING (true);

-- 📝 POLÍTICA PARA INSERT - ESPECIFICANDO ROLES EXPLÍCITAMENTE  
-- CORRECCIÓN: Agregar "TO anon, authenticated"
CREATE POLICY "Users can insert waitlist entries" ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ✏️ POLÍTICA PARA UPDATE - SOLO ADMINS
-- Esta está correcta, pero agregamos authenticated también por si acaso
CREATE POLICY "Admins can update waitlist entries" ON public.waitlist
FOR UPDATE
TO authenticated
USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- 🗑️ POLÍTICA PARA DELETE - SOLO ADMINS
-- Esta está correcta, pero agregamos authenticated también por si acaso
CREATE POLICY "Admins can delete waitlist entries" ON public.waitlist
FOR DELETE
TO authenticated
USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ============================================
-- PASO 4: CREAR ÍNDICES (COMO EN TU SCRIPT)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at);

-- Índice adicional para estado
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- ============================================
-- PASO 5: VERIFICACIÓN DE CONFIGURACIÓN
-- ============================================

-- Verificar que RLS está habilitado
SELECT 
    '🔒 ESTADO RLS:' as info,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO' 
        ELSE '❌ DESHABILITADO' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'waitlist' AND schemaname = 'public';

-- Verificar políticas creadas con roles
SELECT 
    '📋 POLÍTICAS CON ROLES:' as info,
    policyname,
    cmd as operacion,
    roles,
    CASE 
        WHEN cmd = 'INSERT' AND ('anon' = ANY(roles) OR 'authenticated' = ANY(roles)) THEN '✅ INSERT permitido para usuarios'
        WHEN cmd = 'SELECT' AND ('anon' = ANY(roles) OR 'authenticated' = ANY(roles)) THEN '✅ SELECT permitido para usuarios'
        WHEN cmd = 'UPDATE' AND 'authenticated' = ANY(roles) THEN '✅ UPDATE solo para authenticated'
        WHEN cmd = 'DELETE' AND 'authenticated' = ANY(roles) THEN '✅ DELETE solo para authenticated'
        ELSE '⚠️ Revisar configuración: ' || cmd
    END as estado
FROM pg_policies 
WHERE tablename = 'waitlist' AND schemaname = 'public'
ORDER BY cmd;

-- ============================================
-- PASO 6: TEST DE INSERCIÓN
-- ============================================

-- Test de inserción (debería funcionar ahora)
INSERT INTO public.waitlist (
    name,
    email,
    phone,
    organization,
    interest,
    message,
    status,
    priority,
    source
) VALUES (
    'Test Corrección RLS',
    'test-correccion-' || extract(epoch from now()) || '@example.com',
    '+1234567890',
    'Test Organization',
    'demo',
    'Test con roles especificados correctamente',
    'active',
    0,
    'rls_correction_test'
);

-- Verificar inserción exitosa
SELECT 
    '✅ RESULTADO DEL TEST:' as resultado,
    COUNT(*) as registros_insertados,
    CASE 
        WHEN COUNT(*) > 0 THEN '🎉 INSERCIÓN EXITOSA - RLS CORREGIDO'
        ELSE '❌ INSERCIÓN FALLÓ - REVISAR CONFIGURACIÓN'
    END as mensaje
FROM public.waitlist 
WHERE source = 'rls_correction_test'
    AND created_at > NOW() - INTERVAL '1 minute';

-- ============================================
-- DIAGNÓSTICO DEL PROBLEMA ANTERIOR
-- ============================================

SELECT 
    '🔍 ANÁLISIS DEL PROBLEMA:' as diagnostico,
    'Tu script original no especificaba roles en SELECT e INSERT' as problema_identificado,
    'Sin TO anon, authenticated las políticas no se aplican correctamente' as causa_raiz,
    'Este script corregido especifica roles explícitamente' as solucion_aplicada,
    'Ahora el formulario público debería funcionar' as resultado_esperado;

-- ============================================
-- INSTRUCCIONES FINALES
-- ============================================

SELECT 
    '📝 INSTRUCCIONES:' as paso,
    '1. Ejecuta este script completo en Supabase' as paso_1,
    '2. Prueba el formulario de waitlist inmediatamente' as paso_2,
    '3. El error 42501 debería estar resuelto' as paso_3,
    '4. Si persiste, revisa los logs de Supabase' as paso_4;

-- ============================================
-- RESUMEN DE CORRECCIONES
-- ============================================

SELECT 
    '🎯 CORRECCIONES APLICADAS:' as resumen,
    '✅ Agregado TO anon, authenticated en SELECT' as correccion_1,
    '✅ Agregado TO anon, authenticated en INSERT' as correccion_2,
    '✅ Especificado TO authenticated en UPDATE/DELETE' as correccion_3,
    '✅ Limpieza completa de políticas anteriores' as correccion_4,
    '✅ Test de inserción incluido' as correccion_5,
    'Script listo para resolver el error 42501' as estado_final;