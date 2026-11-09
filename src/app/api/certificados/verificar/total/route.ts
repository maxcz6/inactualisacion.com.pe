import { NextResponse } from "next/server";
import * as participanteRepo from "@/server/repositories/participante.repository";

/**
 * GET /api/certificados/verificar/total
 * Retorna el total de participantes registrados.
 */
export async function GET() {
  try {
    const total = await participanteRepo.countAll();
    return NextResponse.json({ total });
  } catch (err) {
    console.error("[/api/certificados/verificar/total]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
