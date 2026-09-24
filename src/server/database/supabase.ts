import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase exclusivo del servidor.
 * Se crea de forma lazy para que el build de Next.js
 * no falle cuando las variables no están presentes
 * (solo se usan en runtime/peticiones reales).
 */

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Revise .env.local o las variables de entorno en Vercel."
    );
  }

  _client = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _client;
}

export { getClient as supabase };
