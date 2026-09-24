export interface Evento {
  id: string;
  codigo_base: string;
  nombre: string;
  descripcion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  created_at: string;
}

export type CreateEventoInput = Omit<Evento, "id" | "created_at">;
export type UpdateEventoInput = Partial<CreateEventoInput>;
