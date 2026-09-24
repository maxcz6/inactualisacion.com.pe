"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-white z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="px-4 flex w-full items-center justify-between py-[16px] lg:container lg:mx-auto h-16">
        {/* Logo */}
        <div className="flex items-center mr-4 lg:mr-6">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="logo"
              width={70}
              height={30}
              className="h-8 w-auto object-contain cursor-pointer"
              priority
            />
          </Link>
        </div>

        {/* Buscador */}
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
              className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 pr-10"
              placeholder="Busca que quieres aprender"
              autoComplete="off"
              id="search"
              name="search"
            />
          </div>
        </div>

        {/* Links de Navegación Exactos */}
        <div className="hidden lg:flex pl-[74px] gap-x-[56px]">
          <Link
            className="text-[#36485C] font-medium hover:bg-muted hover:bg-opacity-75 group p-2 rounded-md"
            href="https://inactualizacion.com.pe"
          >
            Inicio
          </Link>
          <Link
            className="text-[#36485C] font-medium hover:bg-muted hover:bg-opacity-75 group p-2 rounded-md"
            href="/buscar-certificado"
          >
            Validar Certificado
          </Link>
          <a
            className="text-[#36485C] font-medium hover:bg-muted hover:bg-opacity-75 group p-2 rounded-md"
            href="https://inactualizacion.com.pe#nosotros"
          >
            Nosotros
          </a>
          <a
            className="text-[#36485C] font-medium hover:bg-muted hover:bg-opacity-75 group p-2 rounded-md"
            href="https://inactualizacion.com.pe/cursos"
          >
            Cursos
          </a>
          <a
            className="text-[#36485C] font-medium hover:bg-muted hover:bg-opacity-75 group p-2 rounded-md"
            href="#faq"
          >
            Faq
          </a>
        </div>

        {/* Botón Ingresar */}
        <div className="flex items-center gap-x-5">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#be123c] text-white hover:bg-[#be123c]/90 h-10 px-4 py-2"
          >
            Ingresar
          </Link>
        </div>
      </nav>
    </div>
  );
}
