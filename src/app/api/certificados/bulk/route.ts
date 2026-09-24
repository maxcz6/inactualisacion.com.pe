import { NextResponse } from "next/server";
import { createMany, removeMany } from "@/server/repositories/participante.repository";
import { addLog } from "@/server/repositories/log.repository";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    const usuario = await verificarToken(token);
    if (!usuario) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { participantes } = body;

    if (!Array.isArray(participantes) || participantes.length === 0) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 });
    }

    await createMany(participantes);
    await addLog(usuario.email, "IMPORTACIÓN MASIVA", `Importados ${participantes.length} participantes.`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    const usuario = await verificarToken(token);
    if (!usuario || usuario.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "Requiere superadmin" }, { status: 403 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 });
    }

    await removeMany(ids);
    await addLog(usuario.email, "ELIMINACIÓN MASIVA", `Eliminados ${ids.length} participantes.`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
