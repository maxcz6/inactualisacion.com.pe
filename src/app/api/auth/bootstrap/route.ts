import { NextResponse } from "next/server";
import * as credencialRepo from "@/server/repositories/credencial.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { hashPassword } from "@/server/auth/password";

export async function POST(request: Request) {
  const bootstrapSecret = process.env.BOOTSTRAP_ADMIN_SECRET;
  if (!bootstrapSecret) {
    return NextResponse.json({ success: false, error: "El alta inicial no está habilitada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    if (typeof body.secret !== "string" || body.secret !== bootstrapSecret) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !nombre ||
      password.length < 8 ||
      password.length > 256
    ) {
      return NextResponse.json({ success: false, error: "Datos inválidos; la contraseña requiere al menos 8 caracteres" }, { status: 400 });
    }

    if ((await usuarioRepo.findAll()).length > 0) {
      return NextResponse.json({ success: false, error: "El administrador inicial ya fue creado" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const passwordData = await hashPassword(password);
    const perfil = await usuarioRepo.create({
      id,
      email,
      nombre,
      rol: "superadmin",
      activo: true,
    });
    try {
      await credencialRepo.create({ id, email, ...passwordData });
    } catch (error) {
      try {
        await usuarioRepo.remove(id);
      } catch (rollbackError) {
        console.error("[POST /api/auth/bootstrap] No se pudo revertir el perfil incompleto", rollbackError);
        throw new Error("No se pudo guardar la contraseña ni revertir el perfil; revise Google Sheets");
      }
      throw error;
    }

    return NextResponse.json({ success: true, data: { id: perfil.id, email: perfil.email } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/bootstrap]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "No se pudo crear el administrador inicial" },
      { status: 500 }
    );
  }
}
