"use client";

import { useState, useEffect } from "react";
import type { Participante, Condicion } from "@/types/participante";
import { actualizarParticipante } from "@/services/participante.service";

interface Props {
  participante: Participante | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarParticipante({
  participante,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [condicion, setCondicion] = useState<Condicion>("Asistente");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (participante) {
      setDni(participante.dni);
      setNombre(participante.nombre);
      setCondicion(participante.condicion);
      setCodigo(participante.codigo);
      setError("");
    }
  }, [participante]);

  if (!isOpen || !participante) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (dni.length !== 8) {
      setError("El DNI debe tener 8 dígitos.");
      return;
    }

    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await actualizarParticipante(participante.id, {
        dni,
        nombre: nombre.trim().toUpperCase(),
        condicion,
        codigo: codigo.trim().toUpperCase(),
      });

      if (!res.success) {
        setError(res.error || "No se pudo actualizar el registro.");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch {
      setError("Error de conexión al servidor.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-editar-titulo"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">

        {/* Cabecera */}
        <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 id="modal-editar-titulo" className="text-base font-bold text-slate-100">
                Editar Registro
              </h3>
              <p className="text-[11px] text-slate-400">
                Modificar datos del certificado · Superadmin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Cerrar formulario de edición"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
            <label htmlFor="editar-dni" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              DNI del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="editar-dni"
              type="text"
              required
              maxLength={8}
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
              aria-required="true"
            />
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="editar-nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Apellidos y Nombres del Estudiante <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="editar-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
              aria-required="true"
            />
          </div>

          {/* Condición */}
          <div>
            <label htmlFor="editar-condicion" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Condición / Especialidad <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <select
              id="editar-condicion"
              value={condicion}
              onChange={(e) => setCondicion(e.target.value as Condicion)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
              aria-required="true"
            >
              <option value="Asistente">Asistente</option>
              <option value="Ponente">Ponente</option>
              <option value="Organizador">Organizador</option>
            </select>
          </div>

          {/* N° Registro */}
          <div>
            <label htmlFor="editar-codigo" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              N° Registro del Certificado <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <input
              id="editar-codigo"
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 transition-all"
              aria-required="true"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
