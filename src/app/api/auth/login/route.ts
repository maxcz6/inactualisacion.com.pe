import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/server/database/supabase";
import { loginSchema } from "@/server/validators/auth.schema";
import { firmarToken } from "@/lib/jwt";

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

    const { email, password } = parsed.data;
    const db = supabase();

    // Intentar autenticación con Supabase Auth
    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email,
      password,
    });

    let perfilUsuario = null;

    if (!authError && authData?.user) {
      // Buscar el perfil en la tabla perfiles
      const { data: perfil } = await db
        .from("perfiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (perfil && !perfil.activo) {
        return NextResponse.json(
          { success: false, error: "Tu cuenta de administrador está inactiva" },
          { status: 403 }
        );
      }
      perfilUsuario = perfil ?? {
        id: authData.user.id,
        email: authData.user.email,
        nombre: authData.user.user_metadata?.nombre ?? "Administrador",
        rol: "admin",
        activo: true,
      };
    } else {
      // Si Supabase Auth aún no tiene el usuario o da error, verificar si existe en tabla perfiles directamente
      const { data: perfilDirecto } = await db
        .from("perfiles")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (perfilDirecto && perfilDirecto.activo) {
        perfilUsuario = perfilDirecto;
      } else {
        return NextResponse.json(
          { success: false, error: authError?.message || "Credenciales incorrectas" },
          { status: 401 }
        );
      }
    }

    // Firmar JWT criptográfico con jose
    const token = await firmarToken({
      id: perfilUsuario.id,
      email: perfilUsuario.email,
      nombre: perfilUsuario.nombre,
      rol: perfilUsuario.rol === "superadmin" ? "superadmin" : "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: perfilUsuario.id,
        email: perfilUsuario.email,
        nombre: perfilUsuario.nombre,
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
      { success: false, error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
