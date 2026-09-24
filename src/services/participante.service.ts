import type { Participante, CreateParticipanteInput, UpdateParticipanteInput } from "@/types/participante";

/**
 * Servicio FRONTEND para gestión administrativa de participantes.
 * Solo realiza peticiones HTTP a /api/certificados.
 */

export async function listarParticipantes(params: {
  page?: number;
  limit?: number;
  dni?: string;
  nombre?: string;
  condicion?: string;
  evento_id?: string;
} = {}): Promise<{
  success: boolean;
  data: Participante[];
  meta: { total: number; page: number; limit: number };
}> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.dni) qs.set("dni", params.dni);
  if (params.nombre) qs.set("nombre", params.nombre);
  if (params.condicion) qs.set("condicion", params.condicion);
  if (params.evento_id) qs.set("evento_id", params.evento_id);

  const res = await fetch(`/api/certificados?${qs.toString()}`);
  return res.json();
}

export async function crearParticipante(
  data: CreateParticipanteInput
): Promise<{ success: boolean; data?: Participante; error?: string }> {
  const res = await fetch("/api/certificados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarParticipante(
  id: string,
  data: UpdateParticipanteInput
): Promise<{ success: boolean; data?: Participante; error?: string }> {
  const res = await fetch(`/api/certificados/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function eliminarParticipante(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/certificados/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function eliminarParticipantes(
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/certificados/bulk`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

export async function importarParticipantes(
  data: CreateParticipanteInput[]
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/certificados/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantes: data }),
  });
  return res.json();
}
