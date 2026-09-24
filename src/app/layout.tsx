import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Validar Certificado | INA Cursos y Diplomados",
  description:
    "Verifica la autenticidad de tu certificado o diplomado del Instituto Nacional de Actualización Perú (INA) mediante tu número de DNI o documento.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.className} scroll-smooth`}>
      <body className="bg-slate-50 min-h-screen flex flex-col justify-between text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
