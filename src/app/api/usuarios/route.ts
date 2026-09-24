import { NextResponse } from "next/server";
import { supabase } from "@/server/database/supabase";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { addLog } from "@/server/repositories/log.repository";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    
    const usuario = await verificarToken(token);
    if (!usuario || usuario.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    const db = supabase();
    const { data, error } = await db.from("perfiles").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    
    const usuarioActual = await verificarToken(token);
    if (!usuarioActual || usuarioActual.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    const { email, nombre, password, rol } = await request.json();
    const db = supabase();

    // Crear en Auth
    const { data: authData, error: authError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ success: false, error: "El email ya está registrado" }, { status: 400 });
      }
      throw new Error(authError.message);
    }

    // Insertar en perfiles
    const userId = authData.user.id;
    const { data: perfil, error: perfilError } = await db.from("perfiles").insert([{
      id: userId,
      email,
      nombre,
      rol: rol || "admin",
      activo: true
    }]).select().single();

    if (perfilError) throw new Error(perfilError.message);

    await addLog(usuarioActual.email, "NUEVO USUARIO", `Creado usuario ${email} con rol ${rol}`);

    return NextResponse.json({ success: true, data: perfil });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
