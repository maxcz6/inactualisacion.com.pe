import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/server/repositories/participante.repository";
import { verificarDniSchema } from "@/server/validators/participante.schema";

/**
 * GET /api/certificados/verificar?dni=12345678
 *
 * Endpoint PÚBLICO — no requiere autenticación.
 * Busca participantes por DNI y retorna sus certificados.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dniRaw = searchParams.get("dni") ?? "";

    // Validar con Zod
    const parsed = verificarDniSchema.safeParse({ dni: dniRaw });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const certificados = await repo.findByDni(parsed.data.dni);

    return NextResponse.json({ success: true, data: certificados });
  } catch (err) {
    console.error("[/api/certificados/verificar]", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
