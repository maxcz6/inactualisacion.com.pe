import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/server/repositories/participante.repository";
import { participanteSchema, participantePatchSchema } from "@/server/validators/participante.schema";

/**
 * GET  /api/certificados        → listar con paginación (admin)
 * POST /api/certificados        → crear participante (admin)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const dni = searchParams.get("dni") ?? undefined;
    const nombre = searchParams.get("nombre") ?? undefined;
    const condicion = searchParams.get("condicion") ?? undefined;
    const evento_id = searchParams.get("evento_id") ?? undefined;

    const result = await repo.findAll({ page, limit, dni, nombre, condicion, evento_id });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: { total: result.total, page, limit },
    });
  } catch (err) {
    console.error("[GET /api/certificados]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

import { cookies } from "next/headers";
import { verificarToken } from "@/lib/jwt";
import { addLog } from "@/server/repositories/log.repository";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const usuario = token ? await verificarToken(token) : null;

    const body = await request.json();
    const parsed = participanteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const input = {
      ...parsed.data,
      evento_id: parsed.data.evento_id ?? null,
    };

    const nuevo = await repo.create(input);
    if (usuario) {
      await addLog(usuario.email, "CREACIÓN", `Certificado creado para DNI: ${nuevo.dni}`);
    }
    return NextResponse.json({ success: true, data: nuevo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    if (msg.includes("unique")) {
      return NextResponse.json({ success: false, error: "El código ya existe" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
