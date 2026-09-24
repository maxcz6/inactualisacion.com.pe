"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Condicion } from "@/types/participante";
import type { Evento } from "@/types/evento";
import { listarEventos } from "@/services/evento.service";
import { crearParticipante } from "@/services/participante.service";

// ─── Vista Previa del Certificado ───────────────────────────────────────────
// Reproduce exactamente el diseño de ResultadoCertificado.tsx (página pública)
function VistaPrevia({
  dni,
  nombre,
  condicion,
  codigo,
  evento,
}: {
  dni: string;
  nombre: string;
  condicion: Condicion;
  codigo: string;
  evento: Evento | null;
}) {
  const vacio = !dni && !nombre && !codigo;

  return (
    <div className="rounded-lg border bg-white text-slate-900 shadow-md border-l-4 border-l-green-500 overflow-hidden">
      {/* Cabecera — igual a la pública */}
      <div className="p-4 sm:p-6 bg-slate-50/80 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-base font-semibold text-slate-900">
            Resultados de la búsqueda
          </h3>
          <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
            Vista previa
          </span>
        </div>
        <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
          <span>Estudiante:</span>
          <span className="font-bold text-slate-900 text-base">
            {nombre || <span className="text-slate-300 italic font-normal">Apellidos y Nombres</span>}
          </span>
          <span className="mx-2 text-slate-300">|</span>
          <span>DNI / Doc:</span>
          <span className="font-semibold text-slate-800 font-mono">
            {dni || <span className="text-slate-300 italic font-normal">00000000</span>}
          </span>
        </div>
      </div>

      {/* Tabla — igual a la pública */}
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm text-left min-w-[560px]">
          <thead className="bg-slate-100/70 border-b border-slate-200/80">
            <tr>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs">Curso / Diplomado</th>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs">Condición / Especialidad</th>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs">Serie</th>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs">N° Registro</th>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs text-center">Estado</th>
              <th className="h-10 px-4 font-bold text-slate-700 text-xs text-right">Acreditación</th>
            </tr>
          </thead>
          <tbody>
            {vacio ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-300 italic text-xs">
                  Completa el formulario para ver la vista previa
                </td>
              </tr>
            ) : (
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 font-medium text-slate-900 max-w-xs">
                  {evento?.nombre || <span className="text-slate-400 italic">Selecciona un curso</span>}
                </td>
                <td className="p-4">
                  <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200/60 text-xs px-2.5 py-0.5 rounded font-semibold">
                    {condicion || "Asistente"}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-500">
                  {evento?.codigo_base || <span className="text-slate-300">—</span>}
                </td>
                <td className="p-4 font-mono text-xs font-semibold text-slate-800">
                  {codigo || <span className="text-slate-300">—</span>}
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Válido
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-white border border-emerald-300 px-3 py-1.5 rounded-md shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                    Certificado Oficial
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function NuevoCertificadoPage() {
  const router = useRouter();

  // Datos del formulario
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [condicion, setCondicion] = useState<Condicion>("Asistente");
  const [eventoId, setEventoId] = useState("");
  const [codigo, setCodigo] = useState("");

  // Estado UI
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  // Cargar eventos
  useEffect(() => {
    listarEventos().then((res) => {
      if (res.success && res.data.length > 0) {
        setEventos(res.data);
        setEventoId(res.data[0].id);
        setEventoSeleccionado(res.data[0]);
        obtenerSiguienteCodigo(res.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const obtenerSiguienteCodigo = async (idEvento: string) => {
    setLoadingCodigo(true);
    try {
      const res = await fetch(`/api/certificados/siguiente-codigo?evento_id=${encodeURIComponent(idEvento)}`);
      const json = await res.json();
      if (json.success && json.data?.codigo) {
        setCodigo(json.data.codigo);
      }
    } catch {
      // silencioso
    } finally {
      setLoadingCodigo(false);
    }
  };

  const handleEventoChange = (id: string) => {
    setEventoId(id);
    const ev = eventos.find((e) => e.id === id) ?? null;
    setEventoSeleccionado(ev);
    obtenerSiguienteCodigo(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const dniLimpio = dni.replace(/\D/g, "").slice(0, 8);
    if (dniLimpio.length !== 8) {
      setError("El DNI debe tener exactamente 8 dígitos numéricos.");
      return;
    }
    if (nombre.trim().length < 3) {
      setError("Ingrese un nombre válido (mínimo 3 caracteres).");
      return;
    }
    if (!eventoId) {
      setError("Seleccione un Curso o Diplomado.");
      return;
    }
    if (!codigo.trim()) {
      setError("El N° de Registro no puede estar vacío.");
      return;
    }

    setLoading(true);
    try {
      const res = await crearParticipante({
        dni: dniLimpio,
        nombre: nombre.trim().toUpperCase(),
        condicion,
        evento_id: eventoId,
        codigo: codigo.trim().toUpperCase(),
      });

      if (!res.success) {
        setError(res.error || "No se pudo registrar el certificado.");
        setLoading(false);
        return;
      }

      setExito(true);
      setTimeout(() => router.push("/admin/certificados"), 2000);
    } catch {
      setError("Error de red al conectar con el servidor.");
      setLoading(false);
    }
  };

  // ─── Éxito ────────────────────────────────────────────────────────────────
  if (exito) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            ¡Certificado registrado correctamente!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirigiendo al Registro de Certificados...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">

      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Nuevo Certificado
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-9">
          Completa los datos y ve en tiempo real cómo aparecerá en el validador público
        </p>
      </div>

      {/* Layout: Formulario + Vista Previa */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* ── Formulario ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Header */}
          <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center gap-2.5 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Datos del Certificado</h2>
              <p className="text-[11px] text-slate-400">Todos los campos con <span className="text-rose-400">*</span> son requeridos</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate aria-label="Formulario de nuevo certificado">

            {/* Error */}
            {error && (
              <div role="alert" className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* DNI */}
            <div>
              <label htmlFor="nc-dni" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                DNI del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="nc-dni"
                type="text"
                required
                maxLength={8}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ej. 60006146"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
                aria-required="true"
                aria-describedby="nc-dni-hint"
              />
              <p id="nc-dni-hint" className="text-[11px] text-slate-400 mt-1">8 dígitos numéricos exactos</p>
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nc-nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Apellidos y Nombres del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="nc-nombre"
                type="text"
                required
                placeholder="Ej. FLORES VILA, Miriam Maryory"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
                aria-required="true"
                aria-describedby="nc-nombre-hint"
              />
              <p id="nc-nombre-hint" className="text-[11px] text-slate-400 mt-1">Se guardará en MAYÚSCULAS automáticamente</p>
            </div>

            {/* Condición y Curso en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nc-condicion" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Condición / Especialidad <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="nc-condicion"
                  value={condicion}
                  onChange={(e) => setCondicion(e.target.value as Condicion)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
                  aria-required="true"
                >
                  <option value="Asistente">Asistente</option>
                  <option value="Ponente">Ponente</option>
                  <option value="Organizador">Organizador</option>
                </select>
              </div>

              <div>
                <label htmlFor="nc-evento" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Curso o Diplomado <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="nc-evento"
                  value={eventoId}
                  onChange={(e) => handleEventoChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
                  aria-required="true"
                >
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Serie (solo lectura) y N° Registro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Serie (automático)
                </label>
                <div className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-500 dark:text-slate-400 select-all">
                  {eventoSeleccionado?.codigo_base || "—"}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="nc-codigo" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    N° Registro <span className="text-rose-500" aria-hidden="true">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => obtenerSiguienteCodigo(eventoId)}
                    disabled={loadingCodigo || !eventoId}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 disabled:opacity-50 font-semibold flex items-center gap-1 focus:outline-none focus:underline"
                    aria-label="Consultar siguiente número disponible"
                  >
                    {loadingCodigo ? (
                      <>
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Consultando...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Siguiente disponible
                      </>
                    )}
                  </button>
                </div>
                <input
                  id="nc-codigo"
                  type="text"
                  required
                  placeholder="Ej. INAP-2026-S1-001"
                  value={loadingCodigo ? "" : codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  disabled={loadingCodigo}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all disabled:opacity-60"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Registrar Certificado
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Vista Previa ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Vista previa — Validador público
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Así verá el estudiante su certificado al buscar por DNI en{" "}
            <span className="font-mono text-slate-600 dark:text-slate-300">inactualizacion.com.pe</span>
          </p>

          <VistaPrevia
            dni={dni}
            nombre={nombre.trim().toUpperCase()}
            condicion={condicion}
            codigo={codigo}
            evento={eventoSeleccionado}
          />

          {/* Info de campos clave */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Correspondencia de campos:</p>
            {[
              { campo: "Curso / Diplomado", valor: eventoSeleccionado?.nombre || "—" },
              { campo: "Condición / Especialidad", valor: condicion },
              { campo: "Serie", valor: eventoSeleccionado?.codigo_base || "—" },
              { campo: "N° Registro", valor: codigo || "—" },
            ].map(({ campo, valor }) => (
              <div key={campo} className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">{campo}</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
