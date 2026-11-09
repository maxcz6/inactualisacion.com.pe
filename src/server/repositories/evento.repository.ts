import "server-only";
import { sheetRequest } from "@/server/database/google-sheets";
import type { Evento } from "@/types/evento";

export async function findAll(): Promise<Evento[]> {
  const { rows } = await sheetRequest<{ rows: Evento[]; total: number }>("list", {
    table: "eventos",
    orderBy: "created_at",
    descending: true,
  });
  return rows;
}

export async function findById(id: string): Promise<Evento | null> {
  const { rows } = await sheetRequest<{ rows: Evento[]; total: number }>("list", {
    table: "eventos",
    filters: { id },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function create(input: Omit<Evento, "id" | "created_at">): Promise<Evento> {
  return sheetRequest<Evento>("insert", { table: "eventos", data: input });
}

export async function update(
  id: string,
  input: Partial<Omit<Evento, "id" | "created_at">>
): Promise<Evento> {
  const updated = await sheetRequest<Evento | null>("update", {
    table: "eventos",
    where: { id },
    data: input,
  });
  if (!updated) throw new Error("Evento no encontrado");
  return updated;
}

export async function remove(id: string): Promise<void> {
  await sheetRequest<{ deleted: number }>("delete", { table: "eventos", where: { id } });
}
