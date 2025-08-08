-- Script para configurar políticas RLS en la tabla users similar a waitlist
-- Este script muestra cómo configurar las políticas RLS para permitir inserciones anónimas

-- ============================================
-- PASO 1: VERIFICAR CONFIGURACIÓN ACTUAL
-- ============================================

-- Verificar si RLS está habilitado en la tabla users
SELECT
    relname as tabla,
    CASE WHEN relrowsecurity THEN 'RLS habilitado' ELSE 'RLS deshabilitado' END as estado_rls
FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verificar políticas RLS existentes
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
WHERE tablename = 'users' AND schemaname = 'public';

-- ============================================
-- PASO 2: HABILITAR RLS EN LA TABLA USERS
-- ============================================

-- Habilitar RLS en la tabla users (si no está habilitado)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: CONFIGURAR POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
DROP POLICY IF EXISTS users_delete_policy ON public.users;

-- Política para permitir inserciones anónimas (similar a waitlist)
CREATE POLICY users_insert_policy
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para permitir que los usuarios autenticados vean sus propios datos
CREATE POLICY users_select_policy
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para permitir que los usuarios autenticados actualicen sus propios datos
CREATE POLICY users_update_policy
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para permitir que los usuarios con rol 'gold' vean todos los datos
CREATE POLICY users_admin_select_policy
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));

-- ============================================
-- PASO 4: OTORGAR PERMISOS NECESARIOS
-- ============================================

-- Otorgar permisos de inserción a usuarios anónimos
GRANT INSERT ON public.users TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Otorgar permisos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- PASO 5: VERIFICAR CONFIGURACIÓN FINAL
-- ============================================

-- Verificar políticas RLS después de la configuración
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
WHERE tablename = 'users' AND schemaname = 'public';

-- ============================================
-- EXPLICACIÓN:
-- ============================================
-- Este script configura las políticas RLS para la tabla users de manera similar
-- a cómo está configurada la tabla waitlist, permitiendo inserciones anónimas.
-- 
-- La clave está en la política users_insert_policy que permite a usuarios anónimos
-- insertar datos en la tabla users con WITH CHECK (true), lo que significa que
-- no hay restricciones para la inserción.
--
-- Las demás políticas aseguran que los usuarios solo puedan ver y modificar sus
-- propios datos, mientras que los usuarios con rol 'gold' pueden ver todos los datos.
--
-- IMPORTANTE: Este script debe ser ejecutado por un administrador de la base de datos
-- o un usuario con permisos suficientes para modificar políticas RLS.