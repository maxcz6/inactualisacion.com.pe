"use client";

import { useState, useEffect } from "react";
import type { Condicion } from "@/types/participante";
import type { Evento } from "@/types/evento";
import { crearParticipante } from "@/services/participante.service";
import { listarEventos } from "@/services/evento.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAgregarParticipante({ isOpen, onClose, onSuccess }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [condicion, setCondicion] = useState<Condicion>("Asistente");
  const [eventoId, setEventoId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [error, setError] = useState("");

  // Cargar eventos al abrir
  useEffect(() => {
    if (isOpen) {
      listarEventos()
        .then((res) => {
          if (res.success && res.data.length > 0) {
            setEventos(res.data);
            setEventoId(res.data[0].id);
            // Obtener siguiente código correlativo desde la API
            obtenerSiguienteCodigo(res.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  /**
   * Consulta la API para obtener el siguiente número correlativo del evento.
   * Si falla, genera uno aleatorio como respaldo.
   */
  const obtenerSiguienteCodigo = async (idEvento: string) => {
    setLoadingCodigo(true);
    try {
      const res = await fetch(`/api/certificados/siguiente-codigo?evento_id=${encodeURIComponent(idEvento)}`);
      const json = await res.json();
      if (json.success && json.data?.codigo) {
        setCodigo(json.data.codigo);
      } else {
        // Fallback: aleatorio si no hay datos del evento
        const ev = eventos.find((e) => e.id === idEvento);
        const base = ev?.codigo_base ?? "INAP-2026-S1";
        const aleatorio = String(Math.floor(100 + Math.random() * 900)).padStart(3, "0");
        setCodigo(`${base}-${aleatorio}`);
      }
    } catch {
      // Fallback en error de red
      const ev = eventos.find((e) => e.id === idEvento);
      const base = ev?.codigo_base ?? "INAP-2026-S1";
      const aleatorio = String(Math.floor(100 + Math.random() * 900)).padStart(3, "0");
      setCodigo(`${base}-${aleatorio}`);
    } finally {
      setLoadingCodigo(false);
    }
  };

  const handleEventoChange = (nuevoEventoId: string) => {
    setEventoId(nuevoEventoId);
    obtenerSiguienteCodigo(nuevoEventoId);
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

    if (!codigo.trim()) {
      setError("Ingrese o genere un N° de Registro para el certificado.");
      return;
    }

    setLoading(true);

    try {
      const res = await crearParticipante({
        dni: dniLimpio,
        nombre: nombre.trim().toUpperCase(),
        condicion,
        evento_id: eventoId || null,
        codigo: codigo.trim().toUpperCase(),
      });

      if (!res.success) {
        setError(res.error || "No se pudo registrar el certificado.");
        setLoading(false);
        return;
      }

      // Limpiar y cerrar
      setDni("");
      setNombre("");
      setCodigo("");
      setLoading(false);
      onSuccess();
      onClose();
    } catch {
      setError("Error de red al conectar con el servidor.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-agregar-titulo"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 id="modal-agregar-titulo" className="text-base font-bold text-slate-100">
                Nuevo Certificado
              </h3>
              <p className="text-[11px] text-slate-400">
                Registrar acreditación en el padrón
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Cerrar formulario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200" noValidate>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* DNI */}
          <div>
            <label htmlFor="modal-dni" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              DNI del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="modal-dni"
              type="text"
              required
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej. 60006146"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
              aria-required="true"
              aria-describedby="modal-dni-hint"
            />
            <p id="modal-dni-hint" className="text-[11px] text-slate-400 mt-1">8 dígitos numéricos</p>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="modal-nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Apellidos y Nombres del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="modal-nombre"
              type="text"
              required
              placeholder="Ej. FLORES VILA, Miriam Maryory"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
              aria-required="true"
            />
          </div>

          {/* Condición y Curso en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-condicion" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Condición / Especialidad <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <select
                id="modal-condicion"
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as Condicion)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
                aria-required="true"
              >
                <option value="Asistente">Asistente</option>
                <option value="Ponente">Ponente</option>
                <option value="Organizador">Organizador</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-evento" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Curso o Diplomado <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <select
                id="modal-evento"
                value={eventoId}
                onChange={(e) => handleEventoChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
                aria-required="true"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* N° Registro */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="modal-codigo" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                N° Registro del Certificado <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={() => obtenerSiguienteCodigo(eventoId)}
                disabled={loadingCodigo}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 disabled:opacity-50 font-semibold cursor-pointer focus:outline-none focus:underline flex items-center gap-1"
                aria-label="Consultar siguiente número de registro disponible"
              >
                {loadingCodigo ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Siguiente disponible</span>
                  </>
                )}
              </button>
            </div>
            <input
              id="modal-codigo"
              type="text"
              required
              placeholder="Ej. INAP-2026-S1-008"
              value={loadingCodigo ? "" : codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              disabled={loadingCodigo}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all disabled:opacity-60"
              aria-required="true"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              {loadingCodigo ? (
                <span>Calculando siguiente número correlativo...</span>
              ) : (
                <>
                  <svg className="w-3 h-3 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Calculado a partir de los registros existentes del curso. Puedes editarlo si es necesario.
                </>
              )}
            </p>
          </div>

          {/* Botones */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Registrar Certificado</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
