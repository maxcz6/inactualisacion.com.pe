import { NextResponse } from "next/server";
import { supabase } from "@/server/database/supabase";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { addLog } from "@/server/repositories/log.repository";

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
    const { nombre, activo, rol } = await request.json();
    const db = supabase();

    const { data: perfil, error } = await db.from("perfiles")
      .update({ nombre, activo, rol })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await addLog(usuarioActual.email, "EDITAR USUARIO", `Actualizado perfil de ${perfil.email} (Activo: ${activo})`);

    return NextResponse.json({ success: true, data: perfil });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
