import type { Evento, CreateEventoInput, UpdateEventoInput } from "@/types/evento";

export async function listarEventos(): Promise<{ success: boolean; data: Evento[] }> {
  const res = await fetch("/api/eventos");
  return res.json();
}

export async function obtenerEvento(id: string): Promise<{ success: boolean; data?: Evento }> {
  const res = await fetch(`/api/eventos/${encodeURIComponent(id)}`);
  return res.json();
}

export async function crearEvento(
  data: CreateEventoInput
): Promise<{ success: boolean; data?: Evento; error?: string }> {
  const res = await fetch("/api/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarEvento(
  id: string,
  data: UpdateEventoInput
): Promise<{ success: boolean; data?: Evento; error?: string }> {
  const res = await fetch(`/api/eventos/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function eliminarEvento(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/eventos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.json();
}
