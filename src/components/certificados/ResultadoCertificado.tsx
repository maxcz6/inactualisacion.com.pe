"use client";

import type { CertificadoPublico } from "@/types/participante";

interface Props {
  certificados: CertificadoPublico[];
  dni: string;
}

export default function ResultadoCertificado({ certificados, dni }: Props) {
  // Caso: No se encontraron registros (Alerta idéntica al original)
  if (certificados.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm animate-in fade-in duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No se encontraron certificados asociados al DNI/documento{" "}
              <strong>{dni}</strong>. Por favor verifique el número e intente
              nuevamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const estudiante = certificados[0];

  return (
    <div className="rounded-lg border bg-white text-slate-900 shadow-md border-l-4 border-l-green-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera del Resultado */}
      <div className="p-6 bg-slate-50/80 border-b border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900">
          Resultados de la búsqueda
        </h3>
        <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
          <span>Estudiante:</span>
          <span className="font-bold text-slate-900 text-base">
            {estudiante.nombre}
          </span>
          <span className="mx-2 text-slate-300">|</span>
          <span>DNI / Doc:</span>
          <span className="font-semibold text-slate-800 font-mono">
            {estudiante.dni}
          </span>
        </div>
      </div>

      {/* Tabla de Certificados */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="bg-slate-100/70 border-b border-slate-200/80">
            <tr>
              <th className="h-12 px-4 font-bold text-slate-700">
                Curso / Diplomado
              </th>
              <th className="h-12 px-4 font-bold text-slate-700">
                Condición / Especialidad
              </th>
              <th className="h-12 px-4 font-bold text-slate-700">Serie</th>
              <th className="h-12 px-4 font-bold text-slate-700">
                N° Registro
              </th>
              <th className="h-12 px-4 font-bold text-slate-700 text-center">
                Estado
              </th>
              <th className="h-12 px-4 font-bold text-slate-700 text-right">
                Acreditación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {certificados.map((cert, idx) => (
              <tr
                key={cert.codigo || idx}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="p-4 font-medium text-slate-900 max-w-xs">
                  {cert.evento?.nombre || "Programa de Capacitación Profesional"}
                </td>
                <td className="p-4 capitalize text-slate-600">
                  <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200/60 text-xs px-2.5 py-0.5 rounded font-semibold">
                    {cert.condicion || "Asistente"}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-500">
                  {cert.evento?.codigo_base || "INA-2025"}
                </td>
                <td className="p-4 font-mono text-xs font-semibold text-slate-800">
                  {cert.codigo || "-"}
                </td>
                <td className="p-4 text-center font-semibold text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Válido
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-white border border-emerald-300 px-3 py-1.5 rounded-md shadow-2xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                    Certificado Oficial
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
