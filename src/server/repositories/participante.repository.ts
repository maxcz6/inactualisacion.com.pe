import "server-only";
import { sheetRequest } from "@/server/database/google-sheets";
import type { CertificadoPublico, Participante } from "@/types/participante";

export async function findByDni(dni: string): Promise<CertificadoPublico[]> {
  const { rows } = await sheetRequest<{ rows: Participante[]; total: number }>("list", {
    table: "participantes",
    filters: { dni },
    orderBy: "created_at",
  });
  if (rows.length === 0) return [];

  const { rows: eventos } = await sheetRequest<{ rows: Array<{
    id: string;
    nombre: string;
    codigo_base: string;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
  }>; total: number }>("list", { table: "eventos" });
  const eventosPorId = new Map(eventos.map((evento) => [evento.id, evento]));

  return rows.map((row) => ({
    dni: row.dni,
    nombre: row.nombre,
    condicion: row.condicion,
    codigo: row.codigo,
    evento: row.evento_id ? eventosPorId.get(row.evento_id) ?? null : null,
  }));
}

export async function countAll(): Promise<number> {
  const { total } = await sheetRequest<{ rows: Participante[]; total: number }>("list", {
    table: "participantes",
    limit: 0,
  });
  return total;
}

export async function findCodesByEvent(eventoId: string): Promise<string[]> {
  const { rows } = await sheetRequest<{ rows: Array<{ codigo: string }>; total: number }>("list", {
    table: "participantes",
    filters: { evento_id: eventoId },
  });
  return rows.map((row) => row.codigo);
}

export async function findByCodigo(codigo: string): Promise<CertificadoPublico | null> {
  const { rows } = await sheetRequest<{ rows: Participante[]; total: number }>("list", {
    table: "participantes",
    filters: { codigo },
    limit: 1,
  });
  const data = rows[0];
  if (!data) return null;
  const evento = data.evento_id
    ? await sheetRequest<{ rows: Array<{
        id: string;
        nombre: string;
        codigo_base: string;
        fecha_inicio?: string | null;
        fecha_fin?: string | null;
      }>; total: number }>("list", { table: "eventos", filters: { id: data.evento_id }, limit: 1 })
    : null;
  return {
    dni: data.dni,
    nombre: data.nombre,
    condicion: data.condicion,
    codigo: data.codigo,
    evento: evento?.rows[0] ?? null,
  };
}

export async function findAll(params: {
  page: number;
  limit: number;
  dni?: string;
  nombre?: string;
  condicion?: string;
  evento_id?: string;
}): Promise<{ data: Participante[]; total: number }> {
  const { page, limit, dni, nombre, condicion, evento_id } = params;
  const result = await sheetRequest<{ rows: Participante[]; total: number }>("list", {
    table: "participantes",
    filters: {
      ...(condicion ? { condicion } : {}),
      ...(evento_id ? { evento_id } : {}),
    },
    contains: {
      ...(dni ? { dni } : {}),
      ...(nombre ? { nombre } : {}),
    },
    orderBy: "created_at",
    descending: true,
    offset: (page - 1) * limit,
    limit,
  });
  return { data: result.rows, total: result.total };
}

export async function create(
  input: Omit<Participante, "id" | "verificado" | "created_at">
): Promise<Participante> {
  return sheetRequest<Participante>("insert", { table: "participantes", data: input });
}

export async function update(
  id: string,
  input: Partial<Omit<Participante, "id" | "created_at">>
): Promise<Participante> {
  const updated = await sheetRequest<Participante | null>("update", {
    table: "participantes",
    where: { id },
    data: input,
  });
  if (!updated) throw new Error("Participante no encontrado");
  return updated;
}

export async function remove(id: string): Promise<void> {
  await sheetRequest<{ deleted: number }>("delete", { table: "participantes", where: { id } });
}

export async function removeMany(ids: string[]): Promise<void> {
  await sheetRequest<{ deleted: number }>("deleteMany", { table: "participantes", ids });
}

export async function createMany(
  inputs: Omit<Participante, "id" | "verificado" | "created_at">[]
): Promise<void> {
  await sheetRequest<Participante[]>("insertMany", { table: "participantes", data: inputs });
}
