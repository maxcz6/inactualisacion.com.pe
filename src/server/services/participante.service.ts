import "server-only";
import * as repo from "@/server/repositories/participante.repository";
import type { Participante, CreateParticipanteInput, UpdateParticipanteInput } from "@/types/participante";

/**
 * Servicio de BACKEND para Participantes (gestión administrativa).
 */

export async function listar(params: {
  page: number;
  limit: number;
  dni?: string;
  nombre?: string;
  condicion?: string;
  evento_id?: string;
}): Promise<{ data: Participante[]; total: number }> {
  return repo.findAll(params);
}

export async function registrar(data: CreateParticipanteInput): Promise<Participante> {
  // Verificar si ya existe el código
  const existente = await repo.findByCodigo(data.codigo);
  if (existente) {
    throw new Error(`El código ${data.codigo} ya está registrado`);
  }
  return repo.create(data);
}

export async function actualizar(id: string, data: UpdateParticipanteInput): Promise<Participante> {
  return repo.update(id, data);
}

export async function eliminar(id: string): Promise<void> {
  return repo.remove(id);
}
