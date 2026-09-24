"use client";

import type { CertificadoPublico } from "@/types/participante";

interface Props {
  certificados: CertificadoPublico[];
  dni: string;
}

export default function ResultadoCertificado({ certificados, dni }: Props) {
  if (certificados.length === 0) {
    return (
      <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div>
            <span className="inline-block bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase mb-1.5">
              Sin registros
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-1">Documento no encontrado</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              El número de documento <strong className="font-semibold text-rose-700 font-mono bg-rose-100/60 px-1.5 py-0.5 rounded">{dni}</strong> no cuenta con certificados registrados en el padrón oficial en este momento.
            </p>
            <p className="text-xs text-slate-400 mt-2.5">
              Verifique haber ingresado los dígitos correctos o consulte con el área académica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificados.map((cert, index) => (
        <div
          key={cert.codigo || index}
          className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 shadow-md transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold tracking-wide uppercase">
                  {certificados.length > 1 ? `Certificado Oficial (${index + 1} de ${certificados.length})` : "Certificado Oficial Auténtico"}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  CÓDIGO: {cert.codigo}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{cert.nombre}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Documento de Identidad: <span className="text-slate-800 font-semibold">{cert.dni}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="block font-medium text-slate-400">Programa / Evento:</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {cert.evento?.nombre || "Capacitación y Actualización Profesional"}
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-slate-400">Condición:</span>
                  <span className="inline-block font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-0.5">
                    {cert.condicion || "Participante"}
                  </span>
                </div>
                {cert.evento?.fecha_inicio && (
                  <div>
                    <span className="block font-medium text-slate-400">Fecha de Emisión / Periodo:</span>
                    <span className="font-semibold text-slate-700">
                      {cert.evento.fecha_inicio} {cert.evento.fecha_fin ? `al ${cert.evento.fecha_fin}` : ""}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block font-medium text-slate-400">Estado de Acreditación:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Vigente y Registrado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
