import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#e11d49db] relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-6 md:px-8 pt-[80px] pb-[40px]">
        {/* Logo & Nombre */}
        <div className="flex items-center justify-center gap-x-[12px]">
          <Image
            src="/logo_footer.png"
            alt="Logo"
            width={30}
            height={30}
            className="h-[30px] w-auto"
          />
          <p className="font-bold text-white text-[17px]">INA Instituto</p>
        </div>

        {/* Enlaces Exactos del sitio original */}
        <ul className="flex flex-col items-center gap-y-[32px] pt-[56px] text-white sm:flex-row sm:justify-center sm:gap-x-5 sm:pt-5">
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://inactualizacion.com.pe/terms-conditions"
              className="hover:underline"
            >
              Términos y Condiciones
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://inactualizacion.com.pe/politica-privacidad"
              className="hover:underline"
            >
              Política de Privacidad
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://inactualizacion.com.pe/politica-reembolso"
              className="hover:underline"
            >
              Política de Reembolso
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://inactualizacion.com.pe/libro-reclamaciones"
              className="hover:underline"
            >
              Libro de Reclamaciones
            </a>
          </li>
        </ul>

        {/* Copyright Exacto */}
        <p className="pt-[56px] text-center text-[14px] font-medium text-white sm:pt-5">
          ©Copyright 2025. Angel Rojas Dev. Todos los Derechos Reservados
        </p>

        {/* Redes Sociales y Enlaces de Contacto Exactos */}
        <div className="flex items-center justify-center gap-x-[56px] pt-[40px]">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.facebook.com/inacursosydiplomadosperu"
            className="text-white hover:opacity-80 transition-opacity"
          >
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
              className="lucide lucide-facebook w-5 h-5 text-white"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/INACursosyDiplomados"
            className="text-white hover:opacity-80 transition-opacity"
          >
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
              className="lucide lucide-instagram w-5 h-5 text-white"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="mailto:cursosydiplomadosprofesionales@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
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
              className="lucide lucide-mail w-5 h-5 text-white"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
          <a
            href="tel:+51925903204"
            className="text-white hover:opacity-80 transition-opacity"
          >
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
              className="lucide lucide-phone-call w-5 h-5 text-white"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              <path d="M14.05 2a9 9 0 0 1 8 7.94" />
              <path d="M14.05 6A5 5 0 0 1 18 10" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
