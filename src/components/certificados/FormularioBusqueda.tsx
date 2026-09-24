"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ResultadoCertificado from "@/components/certificados/ResultadoCertificado";
import type { CertificadoPublico } from "@/types/participante";

type Estado = "idle" | "cargando" | "ok" | "error";

function sanitizarDocumento(valor: string): string {
  return String(valor || "").trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 15);
}

export default function FormularioBusqueda({ total: initialTotal = 0 }: { total?: number }) {
  const [total, setTotal] = useState(initialTotal);
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [certificados, setCertificados] = useState<CertificadoPublico[]>([]);
  const [docBuscado, setDocBuscado] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/certificados/verificar/total")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.total === "number") setTotal(d.total);
      })
      .catch(() => {});
  }, []);

  const buscar = useCallback(async () => {
    setError("");
    const valor = sanitizarDocumento(documento);
    setDocumento(valor);

    if (!valor) {
      setError("Ingrese el número de DNI o Carnet de Extranjería.");
      inputRef.current?.focus();
      return;
    }
    if (valor.length < 6) {
      setError("El documento debe tener al menos 6 caracteres.");
      inputRef.current?.focus();
      return;
    }

    setEstado("cargando");
    setDocBuscado(valor);

    try {
      const [res] = await Promise.all([
        fetch(`/api/certificados/verificar?dni=${encodeURIComponent(valor)}`),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);

      if (!res.ok) throw new Error("No se pudo consultar el padrón.");
      const json = await res.json();
      setCertificados(json.data ?? []);
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }, [documento]);

  return (
    <div className="w-full">
      {/* Hero Principal idéntico al original */}
      <div className="relative bg-[#be123c] text-white py-12 md:py-16 overflow-hidden">
        {/* Imagen de fondo con overlay */}
        <div
          className="absolute inset-0 w-full h-full z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/feature-1.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#be123c]/90 z-0 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Columna Izquierda: Información y Pasos */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                  Verificación de Certificados
                </h1>
                <p className="text-white/90 text-lg leading-relaxed">
                  Bienvenidos al sistema de verificación de certificados de{" "}
                  <strong>Instituto Nacional de Actualización Perú</strong>. Este espacio está diseñado para confirmar la autenticidad de los documentos emitidos por nuestra institución.
                </p>
              </div>

              {/* Pasos */}
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Pasos para Verificar un Certificado
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full mt-1 flex-shrink-0">
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
                        className="lucide lucide-search-check h-5 w-5 text-white"
                      >
                        <path d="m8 11 2 2 4-4" />
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">1. Ingresa el DNI</h3>
                      <p className="text-sm text-white/80">
                        Introduce el número de documento de identidad del estudiante.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full mt-1 flex-shrink-0">
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
                        className="lucide lucide-mouse-pointer-click h-5 w-5 text-white"
                      >
                        <path d="M14 4.1 12 6" />
                        <path d="m5.1 8-2.9-.8" />
                        <path d="m6 12-1.9 2" />
                        <path d="M7.2 2.2 8 5.1" />
                        <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">2. Haz clic en &quot;Verificar&quot;</h3>
                      <p className="text-sm text-white/80">
                        Presiona el botón para iniciar la búsqueda.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-full mt-1 flex-shrink-0">
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
                        className="lucide lucide-file-check h-5 w-5 text-white"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="m9 15 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">3. Revisa el resultado</h3>
                      <p className="text-sm text-white/80">
                        El sistema mostrará los certificados válidos encontrados.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Consulta */}
            <div>
              <div className="rounded-lg bg-white text-slate-900 shadow-xl border-0 p-6 sm:p-8">
                <div className="tracking-tight text-xl font-semibold flex items-center gap-2 text-[#be123c] mb-6">
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
                    className="lucide lucide-circle-check h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Consultar Certificados
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="inputDocumento"
                        className="text-sm font-medium text-slate-700 block"
                      >
                        Ingrese el número de DNI o Carnet de Extranjería del estudiante:
                      </label>
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          id="inputDocumento"
                          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base md:text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be123c] disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                          placeholder="Ej: 12345678"
                          autoComplete="off"
                          value={documento}
                          onChange={(e) => {
                            setDocumento(sanitizarDocumento(e.target.value));
                            setError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") buscar();
                          }}
                        />
                      </div>
                      {error && (
                        <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                          </svg>
                          <span>{error}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={buscar}
                      disabled={estado === "cargando"}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#be123c] bg-[#be123c] text-white hover:bg-[#be123c]/90 h-10 px-4 py-2 w-full disabled:opacity-75 cursor-pointer shadow-sm"
                    >
                      {estado === "cargando" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
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
                            className="lucide lucide-search mr-2 h-4 w-4"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                          <span>Verificar</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      Ingrese el documento de identidad para visualizar los certificados disponibles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados de Búsqueda */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {estado === "cargando" && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#be123c]" />
            <p className="text-sm font-medium text-slate-600">Consultando padrón oficial...</p>
          </div>
        )}

        {estado === "error" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-amber-900 text-sm">Error de conexión al consultar</p>
                <p className="text-xs text-amber-700 mt-1">
                  No se pudo conectar con el servidor. Intente nuevamente en unos instantes.
                </p>
              </div>
            </div>
          </div>
        )}

        {estado === "ok" && (
          <div className="pt-2">
            <ResultadoCertificado certificados={certificados} dni={docBuscado} />
          </div>
        )}
      </div>
    </div>
  );
}
