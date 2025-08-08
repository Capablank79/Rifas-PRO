-- Script para corregir la recursión infinita en las políticas RLS de la tabla users

-- ============================================
-- PASO 1: IDENTIFICAR EL PROBLEMA
-- ============================================

-- El problema está en la política users_admin_select_policy que causa recursión infinita
-- porque hace referencia a la misma tabla users dentro de su condición USING

-- ============================================
-- PASO 2: ELIMINAR LA POLÍTICA PROBLEMÁTICA
-- ============================================

DROP POLICY IF EXISTS users_admin_select_policy ON public.users;

-- ============================================
-- PASO 3: CREAR UNA NUEVA POLÍTICA SIN RECURSIÓN
-- ============================================

-- Opción 1: Crear una política basada en un rol específico sin consultar la tabla users
CREATE POLICY users_admin_select_policy
ON public.users
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'service_role');

-- Opción 2: Si necesitas mantener la lógica de usuarios con rol 'gold',
-- puedes crear una vista o función que no cause recursión

-- Crear una función que verifique si un usuario tiene rol gold
CREATE OR REPLACE FUNCTION public.has_gold_role(user_id uuid)
RETURNS boolean AS $$
DECLARE
    user_role text;
BEGIN
    -- Consulta directa sin usar políticas RLS
    SELECT role INTO user_role FROM public.users WHERE id = user_id;
    RETURN user_role = 'gold';
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear política alternativa usando la función
CREATE POLICY users_gold_select_policy
ON public.users
FOR SELECT
TO authenticated
USING (public.has_gold_role(auth.uid()));

-- ============================================
-- PASO 4: VERIFICAR CONFIGURACIÓN FINAL
-- ============================================

-- Verificar políticas RLS después de la corrección
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
-- Este script corrige el problema de recursión infinita en las políticas RLS de la tabla users.
-- 
-- El problema estaba en la política users_admin_select_policy que causaba recursión infinita
-- porque hacía referencia a la misma tabla users dentro de su condición USING:
-- USING (auth.uid() IN (SELECT id FROM users WHERE role = 'gold'))
--
-- La solución implementa dos alternativas:
-- 1. Una política basada en el rol del token JWT (más simple)
-- 2. Una función SECURITY DEFINER que evita la recursión (más flexible)
--
-- IMPORTANTE: Este script debe ser ejecutado por un administrador de la base de datos
-- o un usuario con permisos suficientes para modificar políticas RLS.