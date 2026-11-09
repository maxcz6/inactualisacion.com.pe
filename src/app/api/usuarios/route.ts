import { NextResponse } from "next/server";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { addLog } from "@/server/repositories/log.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import * as credencialRepo from "@/server/repositories/credencial.repository";
import { hashPassword } from "@/server/auth/password";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    
    const usuario = await verificarToken(token);
    if (!usuario || usuario.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
    }

    const data = await usuarioRepo.findAll();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/usuarios]", error);
    return NextResponse.json({ success: false, error: "Error al listar usuarios" }, { status: 500 });
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

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rol = body.rol;
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !nombre ||
      password.length < 8 ||
      password.length > 256 ||
      (rol !== "admin" && rol !== "superadmin")
    ) {
      return NextResponse.json({ success: false, error: "Datos de usuario inválidos" }, { status: 400 });
    }
    const existing = (await usuarioRepo.findAll()).some((profile) => profile.email.toLowerCase() === email);
    if (existing) {
      return NextResponse.json({ success: false, error: "El email ya está registrado" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const passwordData = await hashPassword(password);
    const perfil = await usuarioRepo.create({ id, email, nombre, rol, activo: true });
    try {
      await credencialRepo.create({ id, email, ...passwordData });
    } catch (error) {
      try {
        await usuarioRepo.remove(id);
      } catch (rollbackError) {
        console.error("[POST /api/usuarios] No se pudo revertir el perfil incompleto", rollbackError);
        throw new Error("No se pudo guardar la contraseña y tampoco revertir el perfil; revise las pestañas de Google Sheets");
      }
      throw error;
    }
    await addLog(usuarioActual.email, "NUEVO USUARIO", `Creado usuario ${email} con rol ${rol}`);

    return NextResponse.json({ success: true, data: perfil });
  } catch (error) {
    console.error("[POST /api/usuarios]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error al crear usuario" },
      { status: 500 }
    );
  }
}
