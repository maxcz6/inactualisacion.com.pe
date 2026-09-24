import { NextRequest, NextResponse } from "next/server";
import { verificarToken } from "@/lib/jwt";

/**
 * Middleware de seguridad y enrutamiento por Subdominio en Next.js.
 * 
 * 1. Soporta subdominios como "admin.inactualizacion.com.pe" o "app.inactualizacion.com.pe"
 *    (y en desarrollo "admin.localhost:3000").
 * 2. Protege todas las rutas de /admin/* verificando la firma criptográfica del token JWT.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const token = request.cookies.get("admin_token")?.value;

  // Detectar si la petición viene de un subdominio administrativo (admin.* o app.*)
  const isSubdomain =
    host.startsWith("admin.") ||
    host.startsWith("app.") ||
    host.startsWith("panel.");

  // Verificar validez y rol del token con "jose"
  const usuario = token ? await verificarToken(token) : null;

  // -------------------------------------------------------------
  // CASO 1: Acceso a través de Subdominio (ej: admin.inactualizacion.com.pe)
  // -------------------------------------------------------------
  if (isSubdomain && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    // Si visita la raíz del subdominio "/"
    if (pathname === "/") {
      if (usuario) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    // Si visita rutas directas como "/login" o "/dashboard" en el subdominio
    if (!pathname.startsWith("/admin")) {
      const adminPath = `/admin${pathname}`;
      const rewriteUrl = new URL(adminPath, request.url);
      
      // Validar permisos si no es login
      if (pathname !== "/login" && !usuario) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // -------------------------------------------------------------
  // CASO 2: Rutas /admin/* en el dominio principal o reescritas
  // -------------------------------------------------------------
  const esRutaAdmin = pathname.startsWith("/admin");
  const esRutaLogin = pathname === "/admin/login";

  // Proteger rutas /admin (excepto login)
  if (esRutaAdmin && !esRutaLogin) {
    if (!usuario) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete("admin_token");
      return response;
    }

    // Restringir usuarios y logs a rol superadmin
    if (
      (pathname.startsWith("/admin/usuarios") || pathname.startsWith("/admin/logs")) &&
      usuario.rol !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Si ya tiene sesión activa y visita /admin/login, redirigir al dashboard
  if (esRutaLogin && usuario) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * Aplicar sobre todas las rutas excepto archivos estáticos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
