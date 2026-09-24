export type Condicion = "Asistente" | "Ponente" | "Organizador";

export interface Participante {
  id: string;
  evento_id: string | null;
  dni: string;
  nombre: string;
  condicion: Condicion;
  codigo: string;
  verificado: boolean;
  created_at: string;
}

/** Vista pública que expone la API en /api/certificados/verificar */
export interface CertificadoPublico {
  dni: string;
  nombre: string;
  condicion: Condicion;
  codigo: string;
  evento?: {
    nombre: string;
    codigo_base: string;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
  } | null;
}

export type CreateParticipanteInput = Omit<Participante, "id" | "verificado" | "created_at">;
export type UpdateParticipanteInput = Partial<CreateParticipanteInput>;
