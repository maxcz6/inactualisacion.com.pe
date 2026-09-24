import "server-only";
import { supabase } from "@/server/database/supabase";

export interface LogEntry {
  id: string;
  usuario_email: string;
  accion: string;
  detalle?: string | null;
  created_at: string;
}

export async function addLog(usuario_email: string, accion: string, detalle?: string): Promise<void> {
  const db = supabase();
  const { error } = await db.from("logs").insert([{
    usuario_email,
    accion,
    detalle
  }]);
  
  if (error) {
    console.error("Error saving log:", error);
  }
}

export async function getLogs(limit: number = 50): Promise<LogEntry[]> {
  const db = supabase();
  const { data, error } = await db
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
  return data as LogEntry[];
}
