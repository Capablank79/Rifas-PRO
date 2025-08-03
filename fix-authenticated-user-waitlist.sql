-- Script para solucionar el problema de usuarios autenticados que no pueden crear waitlist
-- Proyecto: Rifas-DEMO
-- Problema: Usuarios logueados no pueden insertar en waitlist
-- Solución: Política RLS que permite inserciones para AMBOS roles (anon y authenticated)

-- ============================================
-- 1. VERIFICAR POLÍTICAS ACTUALES
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
WHERE tablename = 'waitlist' AND schemaname = 'public'
ORDER BY policyname;

-- ============================================
-- 2. VERIFICAR ESTADO DE RLS
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
-- 3. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================
-- Esto asegura que no haya conflictos
DROP POLICY IF EXISTS "Allow anonymous waitlist inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Allow anonymous insertions" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for public" ON public.waitlist;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.waitlist;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.waitlist;
DROP POLICY IF EXISTS "Public can insert waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Users can insert their own waitlist entries" ON public.waitlist;

-- ============================================
-- 4. HABILITAR RLS
-- ============================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREAR POLÍTICA UNIVERSAL PARA INSERCIONES
-- ============================================
-- Esta política permite inserciones para TODOS los usuarios (anónimos Y autenticados)
CREATE POLICY "Universal waitlist insert policy"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- 6. CREAR POLÍTICA PARA LECTURA (SOLO AUTENTICADOS)
-- ============================================
-- Solo usuarios autenticados pueden leer los datos (para admin)
CREATE POLICY "Authenticated read policy"
ON public.waitlist
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 7. CREAR POLÍTICA PARA ACTUALIZACIÓN (SOLO AUTENTICADOS)
-- ============================================
-- Solo usuarios autenticados pueden actualizar los datos (para admin)
CREATE POLICY "Authenticated update policy"
ON public.waitlist
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. VERIFICAR POLÍTICAS CREADAS
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
WHERE tablename = 'waitlist' AND schemaname = 'public'
ORDER BY policyname;

-- ============================================
-- 9. VERIFICAR PERMISOS DEL ROL AUTHENTICATED
-- ============================================
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'waitlist' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- ============================================
-- 10. OTORGAR PERMISOS NECESARIOS
-- ============================================
GRANT INSERT ON public.waitlist TO anon;
GRANT INSERT ON public.waitlist TO authenticated;
GRANT SELECT ON public.waitlist TO authenticated;
GRANT UPDATE ON public.waitlist TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 11. TEST DE INSERCIÓN PARA USUARIO AUTENTICADO
-- ============================================
-- Descomenta para probar inserción manual
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
    'Test Authenticated User',
    'test-auth@example.com',
    '+1234567890',
    'Test Organization Auth',
    'demo',
    'Testing authenticated user insertion',
    'active',
    0,
    'auth_test'
);
*/

-- ============================================
-- 12. VERIFICAR DATOS INSERTADOS
-- ============================================
SELECT 
    id,
    name,
    email,
    created_at,
    source
FROM public.waitlist 
WHERE source IN ('auth_test', 'homepage')
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Verifica que las políticas se hayan creado correctamente
-- 3. Prueba el formulario tanto logueado como sin loguear
-- 4. Ambos casos deberían funcionar ahora

-- ============================================
-- EXPLICACIÓN DEL PROBLEMA:
-- ============================================
-- El problema era que las políticas anteriores solo permitían inserciones
-- a usuarios anónimos (anon) pero no a usuarios autenticados (authenticated).
-- Esta nueva configuración permite inserciones a AMBOS tipos de usuarios.