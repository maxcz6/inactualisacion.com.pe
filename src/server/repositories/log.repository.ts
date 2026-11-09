import "server-only";
import { sheetRequest } from "@/server/database/google-sheets";

export interface LogEntry {
  id: string;
  usuario_email: string;
  accion: string;
  detalle?: string | null;
  created_at: string;
}

export async function addLog(usuario_email: string, accion: string, detalle?: string): Promise<void> {
  await sheetRequest<LogEntry>("insert", {
  table: "logs",
  data: {
    id: crypto.randomUUID(),
    usuario_email,
    accion,
    detalle: detalle ?? null,
    created_at: new Date().toISOString(),
  },
  });
}

export async function getLogs(limit: number = 50): Promise<LogEntry[]> {
  const { rows } = await sheetRequest<{ rows: LogEntry[]; total: number }>("list", {
  table: "logs",
  orderBy: "created_at",
  descending: true,
  limit,
  });
  return rows;
}
