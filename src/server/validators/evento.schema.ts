import { z } from "zod";

export const eventoSchema = z.object({
  codigo_base: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9\-]+$/, { message: "Solo letras mayúsculas, números y guiones" }),
  nombre: z.string().min(3).max(200),
  descripcion: z.string().max(2000).nullable().optional(),
  fecha_inicio: z.string().date().nullable().optional(),
  fecha_fin: z.string().date().nullable().optional(),
});

export const eventoPatchSchema = eventoSchema.partial();

export type EventoInput = z.infer<typeof eventoSchema>;
export type EventoPatchInput = z.infer<typeof eventoPatchSchema>;
