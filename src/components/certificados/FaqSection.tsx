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
      "Verifica que hayas ingresado correctamente tu número de DNI o Carnet de Extranjería sin espacios ni guiones. Si el problema persiste, comunícate con nuestro equipo de soporte institucional a través de WhatsApp o correo electrónico para validar la emisión de tu certificado.",
  },
  {
    pregunta: "¿Qué sucede si el sistema dice que no hay resultados?",
    respuesta:
      "Si no aparecen resultados, es posible que el certificado esté en proceso de emisión o registro en el padrón oficial. Los certificados se incorporan al sistema tras la culminación y aprobación del programa académico correspondiente.",
  },
  {
    pregunta: "¿Es posible verificar un certificado con otro documento?",
    respuesta:
      "Sí, puedes realizar la consulta ingresando tu DNI o Carnet de Extranjería con el cual te registraste al inscribirte en el curso o diplomado.",
  },
  {
    pregunta: "¿Cómo puedo corregir mis datos si aparecen errados?",
    respuesta:
      "Si detectas algún error en tu nombre o datos de acreditación, contacta al área académica mediante nuestros canales oficiales presentando tu documento de identidad para solicitar la rectificación correspondiente.",
  },
];

export default function FaqSection() {
  const [abierto, setAbierto] = useState<number | null>(null);

  const toggle = (index: number) => {
    setAbierto((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-rose-700">
          Preguntas Frecuentes
        </h2>
        <p className="text-sm text-slate-500">
          Encuentra respuestas rápidas a las consultas más comunes sobre la verificación de certificados.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {faqs.map((faq, index) => {
          const isOpen = abierto === index;
          return (
            <div key={index} className="transition-colors">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left font-semibold text-slate-800 hover:text-rose-600 transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm md:text-base pr-4">{faq.pregunta}</span>
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
                  className={`lucide lucide-chevron-down text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? "rotate-180 text-rose-600" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 md:px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-50 animate-fadeIn">
                  {faq.respuesta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
