import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarToken } from "@/lib/jwt";
import * as eventoRepo from "@/server/repositories/evento.repository";
import * as participanteRepo from "@/server/repositories/participante.repository";

/**
 * GET /api/certificados/siguiente-codigo?evento_id=xxx
 *
 * Endpoint ADMIN — requiere autenticación.
 * Analiza todos los códigos existentes del evento, extrae el número
 * correlativo más alto y retorna el siguiente número disponible.
 *
 * Ejemplo: si existen INAP-2026-S1-001, INAP-2026-S1-003, INAP-2026-S1-007
 * → retorna { siguiente: 8, codigo: "INAP-2026-S1-008" }
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const usuario = token ? await verificarToken(token) : null;
    if (!usuario) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const eventoId = searchParams.get("evento_id");

    if (!eventoId) {
      return NextResponse.json({ success: false, error: "evento_id requerido" }, { status: 400 });
    }

    const evento = await eventoRepo.findById(eventoId);
    if (!evento) {
      return NextResponse.json({ success: false, error: "Evento no encontrado" }, { status: 404 });
    }

    const codigoBase = evento.codigo_base;
    const codigos = await participanteRepo.findCodesByEvent(eventoId);
    let maximo = 0;

    const prefijo = `${codigoBase}-`;
    for (const codigo of codigos) {
      if (!codigo.startsWith(prefijo)) continue;
      const sufijo = codigo.slice(prefijo.length);
      const num = parseInt(sufijo, 10);
      if (!isNaN(num) && num > maximo) {
        maximo = num;
      }
    }

    const siguiente = maximo + 1;
    // Formato con padding: mínimo 3 dígitos (001, 002, ... 010, ... 100, 101)
    const padding = String(siguiente).padStart(3, "0");
    const codigoSugerido = `${codigoBase}-${padding}`;

    return NextResponse.json({
      success: true,
      data: {
        siguiente,
        codigo: codigoSugerido,
        codigo_base: codigoBase,
        total_existentes: codigos.length,
      },
    });
  } catch (err) {
    console.error("[GET /api/certificados/siguiente-codigo]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
