-- Script simple y directo para solucionar el problema RLS en waitlist
-- Proyecto: Rifas-DEMO
-- Problema: Error 42501 - new row violates row-level security policy for table "waitlist"
-- Solución: Política RLS que permite inserciones anónimas y autenticadas

-- ============================================
-- 1. HABILITAR RLS EN LA TABLA WAITLIST
-- ============================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ELIMINAR Y RECREAR LA POLÍTICA CON PERMISOS EXPLÍCITOS
-- ============================================
DROP POLICY IF EXISTS "Allow anonymous waitlist inserts" ON public.waitlist;

CREATE POLICY "Allow anonymous waitlist inserts"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- 3. VERIFICAR POLÍTICAS ACTUALES (OPCIONAL)
-- ============================================
SELECT * FROM pg_policies WHERE tablename = 'waitlist';

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Verifica que la política se haya creado correctamente
-- 3. Prueba el formulario de waitlist en tu aplicación
-- 4. El error 42501 debería estar resuelto

-- ============================================
-- NOTAS:
-- ============================================
-- - Esta política permite inserciones tanto para usuarios anónimos como autenticados
-- - WITH CHECK (true) significa que no hay restricciones adicionales en los datos
-- - Es una solución simple y efectiva para formularios públicos