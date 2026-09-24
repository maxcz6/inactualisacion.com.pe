import "server-only";
import { supabase } from "@/server/database/supabase";
import type { CertificadoPublico, Participante } from "@/types/participante";

export async function findByDni(dni: string): Promise<CertificadoPublico[]> {
  const db = supabase();
  const { data, error } = await db
    .from("participantes")
    .select(`dni, nombre, condicion, codigo, eventos ( nombre, codigo_base, fecha_inicio, fecha_fin )`)
    .eq("dni", dni)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    dni: row.dni,
    nombre: row.nombre,
    condicion: row.condicion,
    codigo: row.codigo,
    evento: row.eventos ?? null,
  }));
}

export async function countAll(): Promise<number> {
  try {
    const db = supabase();
    const { count, error } = await db
      .from("participantes")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function findByCodigo(codigo: string): Promise<CertificadoPublico | null> {
  const db = supabase();
  const { data, error } = await db
    .from("participantes")
    .select(`dni, nombre, condicion, codigo, eventos ( nombre, codigo_base, fecha_inicio, fecha_fin )`)
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    dni: data.dni,
    nombre: data.nombre,
    condicion: data.condicion,
    codigo: data.codigo,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evento: (data as any).eventos ?? null,
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
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const db = supabase();
  let query = db
    .from("participantes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (dni) query = query.ilike("dni", `%${dni}%`);
  if (nombre) query = query.ilike("nombre", `%${nombre}%`);
  if (condicion) query = query.eq("condicion", condicion);
  if (evento_id) query = query.eq("evento_id", evento_id);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: (data ?? []) as Participante[], total: count ?? 0 };
}

export async function create(
  input: Omit<Participante, "id" | "verificado" | "created_at">
): Promise<Participante> {
  const db = supabase();
  const { data, error } = await db
    .from("participantes")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Participante;
}

export async function update(
  id: string,
  input: Partial<Omit<Participante, "id" | "created_at">>
): Promise<Participante> {
  const db = supabase();
  const { data, error } = await db
    .from("participantes")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Participante;
}

export async function remove(id: string): Promise<void> {
  const db = supabase();
  const { error } = await db.from("participantes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeMany(ids: string[]): Promise<void> {
  const db = supabase();
  const { error } = await db.from("participantes").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export async function createMany(
  inputs: Omit<Participante, "id" | "verificado" | "created_at">[]
): Promise<void> {
  const db = supabase();
  const { error } = await db.from("participantes").insert(inputs);
  if (error) throw new Error(error.message);
}
