import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#be123c] text-white relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-6 md:px-8 pt-16 pb-10">
        {/* Logo & Nombre */}
        <div className="flex items-center justify-center gap-x-3">
          <Image
            src="/logo_footer.png"
            alt="INA Logo"
            width={36}
            height={36}
            className="h-9 w-auto brightness-0 invert"
          />
          <p className="font-bold text-white text-lg tracking-wide">INA Instituto</p>
        </div>

        {/* Enlaces Legales */}
        <ul className="flex flex-col items-center gap-y-4 pt-8 text-rose-100 text-sm sm:flex-row sm:justify-center sm:gap-x-8 sm:pt-6">
          <li>
            <span className="hover:text-white transition-colors cursor-pointer">
              Términos y Condiciones
            </span>
          </li>
          <li>
            <span className="hover:text-white transition-colors cursor-pointer">
              Política de Privacidad
            </span>
          </li>
          <li>
            <span className="hover:text-white transition-colors cursor-pointer">
              Política de Reembolso
            </span>
          </li>
          <li>
            <span className="hover:text-white transition-colors cursor-pointer">
              Libro de Reclamaciones
            </span>
          </li>
        </ul>

        {/* Copyright */}
        <p className="pt-8 text-center text-xs font-normal text-rose-200 sm:pt-6">
          © {new Date().getFullYear()} INA Instituto de Actualización Profesional. Todos los Derechos Reservados.
        </p>

        {/* Redes Sociales y Contacto */}
        <div className="flex items-center justify-center gap-x-8 pt-8 text-rose-200">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.facebook.com/inacursosydiplomadosperu"
            className="hover:text-white transition-colors"
            title="Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/INACursosyDiplomados"
            className="hover:text-white transition-colors"
            title="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="mailto:cursosydiplomadosprofesionales@gmail.com"
            className="hover:text-white transition-colors"
            title="Correo electrónico"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
          <a
            href="tel:+51925903204"
            className="hover:text-white transition-colors"
            title="Teléfono"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
