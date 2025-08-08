-- Script para configurar políticas RLS en la tabla user_roles_control para permitir inserciones anónimas
-- Similar a la configuración de la tabla users

-- ============================================
-- PASO 1: VERIFICAR CONFIGURACIÓN ACTUAL
-- ============================================

-- Verificar si RLS está habilitado en la tabla user_roles_control
SELECT
    relname as tabla,
    CASE WHEN relrowsecurity THEN 'RLS habilitado' ELSE 'RLS deshabilitado' END as estado_rls
FROM pg_class
WHERE relname = 'user_roles_control' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

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
WHERE tablename = 'user_roles_control' AND schemaname = 'public';

-- ============================================
-- PASO 2: HABILITAR RLS EN LA TABLA USER_ROLES_CONTROL
-- ============================================

-- Habilitar RLS en la tabla user_roles_control (si no está habilitado)
ALTER TABLE public.user_roles_control ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: CONFIGURAR POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS admin_policy ON public.user_roles_control;
DROP POLICY IF EXISTS user_roles_control_insert_policy ON public.user_roles_control;
DROP POLICY IF EXISTS user_roles_control_select_policy ON public.user_roles_control;

-- Política para permitir inserciones anónimas
CREATE POLICY user_roles_control_insert_policy
ON public.user_roles_control
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para permitir que los usuarios autenticados vean sus propios datos
CREATE POLICY user_roles_control_select_policy
ON public.user_roles_control
FOR SELECT
TO authenticated
USING (email IN (SELECT email FROM users WHERE id = auth.uid()));

-- Política para permitir que los usuarios con rol 'gold' vean y modifiquen todos los datos
CREATE POLICY user_roles_control_admin_policy
ON public.user_roles_control
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'));

-- ============================================
-- PASO 4: OTORGAR PERMISOS NECESARIOS
-- ============================================

-- Otorgar permisos de inserción a usuarios anónimos
GRANT INSERT ON public.user_roles_control TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Otorgar permisos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles_control TO authenticated;
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
WHERE tablename = 'user_roles_control' AND schemaname = 'public';

-- ============================================
-- EXPLICACIÓN:
-- ============================================
-- Este script configura las políticas RLS para la tabla user_roles_control
-- permitiendo inserciones anónimas similar a las tablas users y waitlist.
-- 
-- La clave está en la política user_roles_control_insert_policy que permite a usuarios anónimos
-- insertar datos en la tabla user_roles_control con WITH CHECK (true), lo que significa que
-- no hay restricciones para la inserción.
--
-- Las demás políticas aseguran que los usuarios solo puedan ver sus propios datos,
-- mientras que los usuarios con rol 'gold' pueden ver y modificar todos los datos.
--
-- IMPORTANTE: Este script debe ser ejecutado por un administrador de la base de datos
-- o un usuario con permisos suficientes para modificar políticas RLS.