-- 🎯 RLS PARA TABLA DEMO_REQUESTS
-- Aplicando las mismas reglas exitosas de waitlist
-- Configuración para formulario público de solicitudes de demo

-- ============================================
-- LIMPIAR CONFIGURACIÓN ANTERIOR
-- ============================================

-- Deshabilitar RLS temporalmente para limpiar
ALTER TABLE public.demo_requests DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Default view policy" ON public.demo_requests;
DROP POLICY IF EXISTS "Authenticated users can insert demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Restricted update policy" ON public.demo_requests;
DROP POLICY IF EXISTS "Restricted delete policy" ON public.demo_requests;
DROP POLICY IF EXISTS "Admins have full access" ON public.demo_requests;
DROP POLICY IF EXISTS "Users can view demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Users can insert demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Admins can update demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Admins can delete demo requests" ON public.demo_requests;

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS (SIGUIENDO PATRÓN EXITOSO DE WAITLIST)
-- ============================================

-- 👀 Policy for selecting demo requests
-- Aplicando el mismo patrón exitoso: USING (true) sin restricción de roles
CREATE POLICY "Users can view demo requests" ON public.demo_requests
FOR SELECT
USING (true);

-- 📝 Policy for inserting new demo requests
-- CAMBIO IMPORTANTE: Permitir inserción pública como en waitlist
-- El script original requería auth.uid() pero necesitamos formulario público
CREATE POLICY "Users can insert demo requests" ON public.demo_requests
FOR INSERT
WITH CHECK (true);

-- ✏️ Policy for updating demo requests (restricted to admin)
-- Manteniendo la restricción admin como en waitlist
CREATE POLICY "Admins can update demo requests" ON public.demo_requests
FOR UPDATE
USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- 🗑️ Policy for deleting demo requests (restricted to admin)
-- Manteniendo la restricción admin como en waitlist
CREATE POLICY "Admins can delete demo requests" ON public.demo_requests
FOR DELETE
USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Crear índices basados en campos comunes de demo_requests
-- Ajustar según la estructura real de la tabla
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON public.demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON public.demo_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON public.demo_requests(status);

-- ============================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- ============================================

-- Verificar que RLS está habilitado
SELECT 
    '🔒 RLS STATUS DEMO_REQUESTS:' as info,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED' 
        ELSE '❌ DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'demo_requests' AND schemaname = 'public';

-- Verificar políticas activas
SELECT 
    '📋 DEMO_REQUESTS POLICIES:' as info,
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd = 'INSERT' THEN '✅ Public form functional'
        WHEN cmd = 'SELECT' THEN '✅ Public reading allowed'
        WHEN cmd = 'UPDATE' THEN '🔐 Admin only'
        WHEN cmd = 'DELETE' THEN '🔐 Admin only'
        ELSE cmd
    END as description
FROM pg_policies 
WHERE tablename = 'demo_requests' AND schemaname = 'public'
ORDER BY cmd;

-- ============================================
-- COMPARACIÓN CON SCRIPT ORIGINAL
-- ============================================

SELECT 
    '🔄 CAMBIOS APLICADOS:' as analisis,
    'Script original: INSERT requería auth.uid()' as problema_anterior,
    'Script corregido: INSERT permite formulario público' as solucion_aplicada,
    'Mismas reglas exitosas de waitlist aplicadas' as patron_usado,
    'Formulario público de demo requests ahora funcional' as resultado;

-- ============================================
-- TEST DE INSERCIÓN (OPCIONAL)
-- ============================================

-- Test de inserción pública (ajustar campos según estructura real)
/*
INSERT INTO public.demo_requests (
    name,
    email,
    company,
    message,
    status
) VALUES (
    'Test Demo Request',
    'test-demo-' || extract(epoch from now()) || '@example.com',
    'Test Company',
    'Test de formulario público de demo requests',
    'pending'
);
*/

-- ============================================
-- RESUMEN FINAL
-- ============================================

SELECT 
    '🎉 DEMO_REQUESTS RLS CONFIGURADO' as status,
    '✅ Mismas reglas exitosas de waitlist aplicadas' as patron,
    '✅ Formulario público habilitado (INSERT sin auth)' as funcionalidad,
    '✅ Seguridad admin mantenida (UPDATE/DELETE)' as seguridad,
    '✅ Índices creados para optimización' as performance,
    'Configuración lista para formulario público' as resultado;

-- ============================================
-- DIFERENCIAS CON SCRIPT ORIGINAL
-- ============================================

/*
📝 CAMBIOS REALIZADOS:

❌ SCRIPT ORIGINAL PROBLEMÁTICO:
   CREATE POLICY "Authenticated users can insert demo requests"
   FOR INSERT
   WITH CHECK (auth.uid() IS NOT NULL);  -- Requería autenticación

✅ SCRIPT CORREGIDO (PATRÓN WAITLIST):
   CREATE POLICY "Users can insert demo requests"
   FOR INSERT
   WITH CHECK (true);  -- Permite formulario público

🎯 RESULTADO:
   - Formulario público funcional
   - Misma configuración exitosa de waitlist
   - Sin errores 42501
   - Seguridad mantenida donde es necesaria
*/

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

/*
📋 PASOS PARA APLICAR:

1. ✅ Ejecutar este script completo en Supabase SQL Editor
2. ✅ Verificar que no hay errores en la ejecución
3. ✅ Probar formulario de demo requests en la aplicación
4. ✅ Confirmar que las inserciones funcionan sin error 42501
5. ✅ Verificar que solo admins pueden actualizar/eliminar

🎯 ESTE SCRIPT RESUELVE:
   - RLS habilitado en demo_requests
   - Formulario público funcional
   - Seguridad apropiada
   - Optimización de rendimiento
*/