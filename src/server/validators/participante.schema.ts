import { z } from "zod";

export const condicionEnum = z.enum(["Asistente", "Ponente", "Organizador"]);

export const participanteSchema = z.object({
  evento_id: z.string().uuid().nullable().optional(),
  dni: z
    .string()
    .regex(/^\d{8}$/, { message: "El DNI debe tener exactamente 8 dígitos numéricos" }),
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(200)
    .transform((v) => v.trim().toUpperCase()),
  condicion: condicionEnum,
  codigo: z
    .string()
    .min(5)
    .max(50)
    .regex(/^[A-Z0-9\-]+$/, { message: "Solo letras mayúsculas, números y guiones" }),
});

export const participantePatchSchema = participanteSchema.partial();

export const verificarDniSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, { message: "DNI debe tener exactamente 8 dígitos" }),
});

export type ParticipanteInput = z.infer<typeof participanteSchema>;
export type ParticipantePatchInput = z.infer<typeof participantePatchSchema>;
