import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/server/repositories/participante.repository";
import { participantePatchSchema } from "@/server/validators/participante.schema";

import { verificarToken } from "@/lib/jwt";

async function obtenerUsuarioDeCookie(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;
  return verificarToken(token);
}

/**
 * GET    /api/certificados/[id]  → obtener por código o id
 * PUT    /api/certificados/[id]  → actualizar (Superadmin)
 * DELETE /api/certificados/[id]  → eliminar (SOLO Superadmin)
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cert = await repo.findByCodigo(id);
    if (!cert) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: cert });
  } catch (err) {
    console.error("[GET /api/certificados/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await obtenerUsuarioDeCookie(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Inicie sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = participantePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const actualizado = await repo.update(id, parsed.data);
    await import("@/server/repositories/log.repository").then(m => m.addLog(user.email, "EDICIÓN", `Certificado actualizado para DNI: ${actualizado.dni}`));
    return NextResponse.json({ success: true, data: actualizado });
  } catch (err) {
    console.error("[PUT /api/certificados/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await obtenerUsuarioDeCookie(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Inicie sesión." },
        { status: 401 }
      );
    }

    // REGLA: El admin regular NO puede eliminar. Solo superadmin.
    if (user.rol !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          error: "Acción no permitida: Solo el rol Superadmin puede eliminar registros.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    await repo.remove(id);
    await import("@/server/repositories/log.repository").then(m => m.addLog(user.email, "ELIMINACIÓN", `Certificado con ID: ${id} eliminado`));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/certificados/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
