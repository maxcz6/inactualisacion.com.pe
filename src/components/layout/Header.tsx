"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/80">
      <nav className="px-4 flex w-full items-center justify-between py-4 lg:container lg:mx-auto h-16">
        {/* Logo */}
        <div className="flex items-center mr-4 lg:mr-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="INA Instituto Logo"
              width={80}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Buscador de cursos (opcional / estético como en el original) */}
        <div className="hidden sm:block flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 pl-10 pr-4"
              placeholder="Busca qué quieres aprender..."
              autoComplete="off"
            />
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <div className="hidden lg:flex pl-8 gap-x-8 items-center">
          <Link
            href="/"
            className="text-[#36485C] text-sm font-medium hover:text-rose-600 transition-colors p-2 rounded-md"
          >
            Inicio
          </Link>
          <Link
            href="/buscar-certificado"
            className="text-rose-600 text-sm font-semibold hover:text-rose-700 transition-colors p-2 rounded-md"
          >
            Validar Certificado
          </Link>
          <a
            href="#faq"
            className="text-[#36485C] text-sm font-medium hover:text-rose-600 transition-colors p-2 rounded-md"
          >
            Preguntas Frecuentes
          </a>
        </div>

        {/* Botón Ingresar / Login */}
        <div className="flex items-center gap-x-4">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 bg-rose-600 text-white hover:bg-rose-700 h-10 px-5 py-2 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Ingresar
          </Link>
        </div>
      </nav>
    </div>
  );
}
