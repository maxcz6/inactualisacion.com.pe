-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS public.logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_email text NOT NULL,
    accion text NOT NULL,
    detalle text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS (opcional pero recomendado)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura/escritura (permitiendo al service role el acceso completo)
-- Si la BD se maneja con SERVER ROLE (supabase service role key), esto no es estrictamente necesario,
-- pero lo dejamos listo por si acaso.
CREATE POLICY "Enable read/write for service role" ON public.logs FOR ALL USING (true) WITH CHECK (true);
