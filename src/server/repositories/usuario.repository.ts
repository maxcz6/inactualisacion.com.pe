import "server-only";
import { sheetRequest } from "@/server/database/google-sheets";
import type { Perfil } from "@/types/perfil";

export async function findByEmail(email: string): Promise<Perfil | null> {
  const { rows } = await sheetRequest<{ rows: Perfil[]; total: number }>("list", {
    table: "perfiles",
    filters: { email: email.toLowerCase().trim() },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<Perfil | null> {
  const { rows } = await sheetRequest<{ rows: Perfil[]; total: number }>("list", {
    table: "perfiles",
    filters: { id },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function findAll(): Promise<Perfil[]> {
  const { rows } = await sheetRequest<{ rows: Perfil[]; total: number }>("list", {
    table: "perfiles",
    orderBy: "created_at",
    descending: true,
  });
  return rows;
}

export async function create(input: Omit<Perfil, "created_at" | "updated_at">): Promise<Perfil> {
  return sheetRequest<Perfil>("insert", { table: "perfiles", data: input });
}

export async function update(
  id: string,
  input: Partial<Pick<Perfil, "nombre" | "rol" | "activo">>
): Promise<Perfil> {
  const updated = await sheetRequest<Perfil | null>("update", {
    table: "perfiles",
    where: { id },
    data: input,
  });
  if (!updated) throw new Error("Perfil no encontrado");
  return updated;
}

export async function remove(id: string): Promise<void> {
  await sheetRequest<{ deleted: number }>("delete", { table: "perfiles", where: { id } });
}
