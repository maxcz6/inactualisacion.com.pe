import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/server/validators/auth.schema";
import { firmarToken } from "@/lib/jwt";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import * as credencialRepo from "@/server/repositories/credencial.repository";
import { verifyPassword } from "@/server/auth/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const perfilUsuario = await usuarioRepo.findByEmail(email);
    const credencial = await credencialRepo.findByEmail(email);
    if (
      !perfilUsuario ||
      !perfilUsuario.activo ||
      !credencial ||
      !(await verifyPassword(parsed.data.password, credencial.password_salt, credencial.password_hash))
    ) {
      return NextResponse.json(
        { success: false, error: "Correo o contraseña incorrectos, o cuenta inactiva" },
        { status: 401 }
      );
    }

    const token = await firmarToken({
      id: perfilUsuario.id,
      email: perfilUsuario.email,
      nombre: perfilUsuario.nombre || "Administrador",
      rol: perfilUsuario.rol === "superadmin" ? "superadmin" : "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: perfilUsuario.id,
        email: perfilUsuario.email,
        nombre: perfilUsuario.nombre || "Administrador",
        rol: perfilUsuario.rol || "admin",
      },
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
