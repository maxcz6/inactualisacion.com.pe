"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import ModalGeneradorQR from "@/components/certificados/ModalGeneradorQR";
import { useTheme } from "next-themes";

interface UsuarioSesion {
  email: string;
  nombre?: string;
  rol: "admin" | "superadmin";
}

// Íconos SVG para cada sección de navegación
const NavIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    certificados: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    eventos: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    usuarios: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    nuevo: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    logs: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  };
  return <>{icons[name] ?? null}</>;
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [modalQrAbierto, setModalQrAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUsuario(d.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  const baseLinks = [
    { href: "/admin/dashboard", label: "Dashboard", key: "dashboard" },
    { href: "/admin/certificados", label: "Certificados", key: "certificados" },
    { href: "/admin/nuevo-certificado", label: "Nuevo Certificado", key: "nuevo" },
    { href: "/admin/eventos", label: "Cursos / Diplomados", key: "eventos" },
  ];

  const navLinks =
    usuario?.rol === "superadmin"
      ? [
          ...baseLinks,
          { href: "/admin/usuarios", label: "Usuarios", key: "usuarios" },
          { href: "/admin/logs", label: "Auditoría", key: "logs" },
        ]
      : baseLinks;

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <>
      <header
        className="bg-slate-900 text-white shadow-sm border-b border-slate-800 sticky top-0 z-40"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Ícono + nombre del sistema + enlaces */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-1"
                aria-label="Ir al Dashboard"
              >
                {/* Ícono de panel en lugar de logo */}
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-sky-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-xs tracking-wider uppercase block text-slate-100">
                    INAP Perú
                  </span>
                  <span className="text-[10px] text-sky-400 font-medium block tracking-tight">
                    Panel Administrativo
                  </span>
                </div>
              </Link>

              {/* Navegación desktop */}
              <nav
                className="hidden md:flex items-center gap-1"
                role="navigation"
                aria-label="Navegación principal"
              >
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                        isActive
                          ? "bg-slate-800 text-sky-400 border border-slate-700/80"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <NavIcon name={link.key} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Acciones derecha — Desktop */}
            <div className="flex items-center gap-2">
              {/* Generador QR */}
              <button
                type="button"
                onClick={() => setModalQrAbierto(true)}
                className="hidden sm:flex text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-all items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                title="Generador de código QR"
                aria-label="Abrir generador de código QR"
              >
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>QR</span>
              </button>

              {/* Toggle Tema */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                  title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                >
                  {theme === "dark" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Info de usuario */}
              {usuario && (
                <div className="hidden lg:flex items-center gap-2 border-l border-slate-700 pl-3 ml-1" aria-label={`Sesión iniciada como ${usuario.email}`}>
                  <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-medium block truncate max-w-[140px]">
                      {usuario.email}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        usuario.rol === "superadmin"
                          ? "text-purple-300"
                          : "text-sky-300"
                      }`}
                    >
                      {usuario.rol === "superadmin" ? "Superadmin" : "Admin"}
                    </span>
                  </div>
                </div>
              )}

              {/* Botón Salir */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex text-xs text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg font-medium transition-all items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir</span>
              </button>

              {/* Botón hamburguesa — Mobile */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
                aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuAbierto}
                aria-controls="mobile-menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {menuAbierto ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menú Mobile */}
        {menuAbierto && (
          <div
            id="mobile-menu"
            className="md:hidden bg-slate-800/95 border-t border-slate-700 backdrop-blur-sm"
            role="navigation"
            aria-label="Menú móvil"
          >
            <div className="px-3 pt-2 pb-3 space-y-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 text-sky-400 border border-slate-700/80"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <NavIcon name={link.key} />
                    {link.label}
                  </Link>
                );
              })}

              {/* QR — Mobile */}
              <button
                onClick={() => { setModalQrAbierto(true); setMenuAbierto(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Generador QR
              </button>

              {/* Cerrar sesión — Mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-700 hover:text-rose-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>

            {/* Info de usuario — Mobile */}
            {usuario && (
              <div className="pt-3 pb-4 border-t border-slate-700 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{usuario.nombre || "Administrador"}</div>
                    <div className="text-xs text-slate-400">{usuario.email}</div>
                  </div>
                  <span
                    className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                      usuario.rol === "superadmin"
                        ? "bg-purple-950 text-purple-300 border-purple-800/80"
                        : "bg-slate-900 text-sky-300 border-slate-700"
                    }`}
                  >
                    {usuario.rol}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <ModalGeneradorQR
        isOpen={modalQrAbierto}
        onClose={() => setModalQrAbierto(false)}
        participante={null}
      />
    </>
  );
}
