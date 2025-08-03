-- Script para configurar políticas RLS correctas para la tabla waitlist
-- Proyecto: Rifas-DEMO
-- Problema: Error 42501 - new row violates row-level security policy for table "waitlist"
-- Solución: Crear políticas RLS que permitan inserciones anónimas

-- ============================================
-- 1. VERIFICAR ESTADO ACTUAL DE RLS
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED' 
        ELSE 'RLS DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'waitlist' AND schemaname = 'public';

-- ============================================
-- 2. VERIFICAR POLÍTICAS EXISTENTES
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'waitlist' AND schemaname = 'public';

-- ============================================
-- 3. ELIMINAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- ============================================
-- Nota: Esto eliminará todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.waitlist;
DROP POLICY IF EXISTS "Users can insert their own waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Public can insert waitlist entries" ON public.waitlist;

-- ============================================
-- 4. CREAR NUEVA POLÍTICA PARA INSERCIONES ANÓNIMAS
-- ============================================
-- Esta política permite que usuarios anónimos (rol 'anon') inserten datos
CREATE POLICY "Allow anonymous insertions" 
ON public.waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- ============================================
-- 5. CREAR POLÍTICA PARA LECTURA (OPCIONAL)
-- ============================================
-- Esta política permite que usuarios autenticados lean los datos
CREATE POLICY "Allow authenticated read" 
ON public.waitlist 
FOR SELECT 
TO authenticated 
USING (true);

-- ============================================
-- 6. ASEGURAR QUE RLS ESTÉ HABILITADO
-- ============================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. VERIFICAR PERMISOS DEL ROL ANON
-- ============================================
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'waitlist' 
    AND grantee = 'anon'
ORDER BY privilege_type;

-- ============================================
-- 8. OTORGAR PERMISOS NECESARIOS AL ROL ANON
-- ============================================
GRANT INSERT ON public.waitlist TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- ============================================
-- 9. VERIFICAR POLÍTICAS DESPUÉS DE LA CONFIGURACIÓN
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'waitlist' AND schemaname = 'public';

-- ============================================
-- 10. TEST DE INSERCIÓN MANUAL
-- ============================================
-- Ejecutar este INSERT para probar si funciona
-- (Comentado por defecto, descomenta para probar)
/*
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
    'Test User RLS',
    'test-rls@example.com',
    '+1234567890',
    'Test Organization',
    'demo',
    'Testing RLS policy configuration',
    'active',
    0,
    'manual_test'
);
*/

-- ============================================
-- 11. VERIFICAR DATOS INSERTADOS
-- ============================================
SELECT 
    id,
    name,
    email,
    created_at,
    source
FROM public.waitlist 
WHERE source = 'manual_test'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Revisa los resultados de cada sección
-- 3. Si quieres probar la inserción manual, descomenta la sección 10
-- 4. Después de ejecutar, prueba el formulario de waitlist en tu aplicación
-- 5. El error 42501 debería estar resuelto

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- - Esta configuración permite inserciones anónimas en la tabla waitlist
-- - Solo usuarios autenticados pueden leer los datos
-- - Las políticas son específicas para el caso de uso de formulario público
-- - Si necesitas más restricciones, modifica las políticas según tus necesidades