"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import ModalGeneradorQR from "@/components/certificados/ModalGeneradorQR";
import { useTheme } from "next-themes";

interface UsuarioSesion {
  email: string;
  nombre?: string;
  rol: "admin" | "superadmin";
}

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
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/certificados", label: "Certificados" },
    { href: "/admin/eventos", label: "Eventos" },
  ];

  const navLinks = usuario?.rol === "superadmin" 
    ? [...baseLinks, { href: "/admin/usuarios", label: "Usuarios" }, { href: "/admin/logs", label: "Auditoría" }]
    : baseLinks;

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <>
      <header className="bg-slate-900 text-white shadow-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y enlaces */}
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <Image
                  src="/logo_sam.png"
                  alt="IDEX SAM"
                  width={34}
                  height={34}
                  className="h-8 w-auto object-contain"
                  style={{ width: "auto" }}
                />
                <div className="hidden sm:block">
                  <span className="font-bold text-xs tracking-wider uppercase block text-slate-100">
                    IDEX SAM
                  </span>
                  <span className="text-[10px] text-sky-400 font-medium block tracking-tight">
                    PE Diseño y Programación Web
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-sky-400 border border-slate-700/80"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Acciones y usuario (Desktop) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalQrAbierto(true)}
                className="hidden sm:flex text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg font-medium transition-all items-center gap-1.5 cursor-pointer"
                title="Generar código QR con logo"
              >
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                <span>Generador QR</span>
              </button>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Cambiar tema"
                >
                  {theme === "dark" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </button>
              )}

              {usuario && (
                <div className="hidden lg:flex items-center gap-2 px-2 text-right border-l border-slate-700 pl-4 ml-1">
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                    {usuario.email}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      usuario.rol === "superadmin"
                        ? "bg-purple-950 text-purple-300 border border-purple-800/80"
                        : "bg-slate-800 text-sky-300 border border-slate-700"
                    }`}
                  >
                    {usuario.rol === "superadmin" ? "Superadmin" : "Admin"}
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="hidden sm:flex text-xs text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg font-medium transition-all items-center gap-1 cursor-pointer"
                title="Cerrar sesión"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir</span>
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Mobile Menu */}
        {menuAbierto && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuAbierto(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              <button
                onClick={() => { setModalQrAbierto(true); setMenuAbierto(false); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Generador QR
              </button>
              
              <Link
                href="/"
                target="_blank"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Portal Validador
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-slate-700 hover:text-rose-300"
              >
                Cerrar sesión
              </button>
            </div>
            {usuario && (
              <div className="pt-4 pb-3 border-t border-slate-700">
                <div className="flex items-center px-5">
                  <div className="ml-3">
                    <div className="text-sm font-medium leading-none text-white">{usuario.nombre || 'Administrador'}</div>
                    <div className="text-xs font-medium leading-none text-slate-400 mt-1">{usuario.email}</div>
                  </div>
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      usuario.rol === "superadmin"
                        ? "bg-purple-950 text-purple-300 border border-purple-800/80"
                        : "bg-slate-900 text-sky-300 border border-slate-700"
                    }`}>
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
