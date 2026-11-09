import "server-only";
import { sheetRequest } from "@/server/database/google-sheets";

export interface Credencial {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
  updated_at: string;
}

export async function findByEmail(email: string): Promise<Credencial | null> {
  const { rows } = await sheetRequest<{ rows: Credencial[]; total: number }>("list", {
    table: "credenciales",
    filters: { email: email.toLowerCase().trim() },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function create(
  input: Omit<Credencial, "created_at" | "updated_at">
): Promise<Credencial> {
  return sheetRequest<Credencial>("insert", { table: "credenciales", data: input });
}
