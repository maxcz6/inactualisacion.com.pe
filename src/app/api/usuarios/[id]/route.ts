import { NextResponse } from "next/server";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { addLog } from "@/server/repositories/log.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    
    const usuarioActual = await verificarToken(token);
    if (!usuarioActual || usuarioActual.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const update: { nombre?: string; activo?: boolean; rol?: "admin" | "superadmin" } = {};
    if (body.nombre !== undefined) {
      if (typeof body.nombre !== "string") {
        return NextResponse.json({ success: false, error: "Nombre inválido" }, { status: 400 });
      }
      update.nombre = body.nombre.trim();
    }
    if (body.activo !== undefined) {
      if (typeof body.activo !== "boolean") {
        return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 });
      }
      update.activo = body.activo;
    }
    if (body.rol !== undefined) {
      if (body.rol !== "admin" && body.rol !== "superadmin") {
        return NextResponse.json({ success: false, error: "Rol inválido" }, { status: 400 });
      }
      update.rol = body.rol;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: "No hay cambios para guardar" }, { status: 400 });
    }
    const perfil = await usuarioRepo.update(id, update);

    await addLog(usuarioActual.email, "EDITAR USUARIO", `Actualizado perfil de ${perfil.email} (Activo: ${perfil.activo})`);

    return NextResponse.json({ success: true, data: perfil });
  } catch (error) {
    console.error("[PUT /api/usuarios/:id]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
