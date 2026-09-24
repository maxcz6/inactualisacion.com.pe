"use client";

import { useState } from "react";

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

const faqs: FaqItem[] = [
  {
    pregunta: "¿Qué hago si no encuentro mi certificado?",
    respuesta:
      "Verifique que el número de DNI ingresado sea correcto. Si el problema persiste, comuníquese con nuestra área académica para validar el estado de su certificación.",
  },
  {
    pregunta: "¿Qué sucede si el sistema dice que no hay resultados?",
    respuesta:
      "Esto puede deberse a que el certificado aún no ha sido emitido, el pago no ha sido procesado completamente, o el número de documento no coincide con nuestros registros.",
  },
  {
    pregunta: "¿Es posible verificar un certificado con otro documento?",
    respuesta:
      "Actualmente nuestro sistema de verificación pública funciona exclusivamente con el número de DNI registrado al momento de la matrícula.",
  },
  {
    pregunta: "¿Cómo puedo corregir mis datos si aparecen errados?",
    respuesta:
      "Si nota algún error en su nombre o apellidos, por favor contáctenos inmediatamente a través de nuestros canales de atención para realizar la corrección antes de la impresión física (si aplica).",
  },
];

export default function FaqSection() {
  const [abierto, setAbierto] = useState<number | null>(null);

  const toggle = (index: number) => {
    setAbierto((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-8 pt-8">
      <h2 className="text-2xl font-bold text-center text-[#be123c]">
        Preguntas Frecuentes
      </h2>

      <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100 px-4">
        {faqs.map((faq, index) => {
          const isOpen = abierto === index;
          return (
            <div key={index} className="border-b border-slate-100 last:border-b-0">
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex flex-1 w-full items-center justify-between py-4 text-left font-medium text-slate-800 hover:text-[#be123c] transition-all focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.pregunta}</span>
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
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                      isOpen ? "rotate-180 text-[#be123c]" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </h3>

              {isOpen && (
                <div className="pb-4 pt-0 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                  {faq.respuesta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
