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
  const [error, setError] = useState("");

  // Cargar eventos para el selector
  useEffect(() => {
    if (isOpen) {
      listarEventos()
        .then((res) => {
          if (res.success && res.data.length > 0) {
            setEventos(res.data);
            setEventoId(res.data[0].id);
            // Sugerir código con el código base del primer evento
            generarCodigoSugerido(res.data[0].codigo_base);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const generarCodigoSugerido = (codigoBase: string) => {
    const aleatorio = Math.floor(100 + Math.random() * 900);
    setCodigo(`${codigoBase}-${aleatorio}`);
  };

  const handleEventoChange = (nuevoEventoId: string) => {
    setEventoId(nuevoEventoId);
    const ev = eventos.find((e) => e.id === nuevoEventoId);
    if (ev) {
      generarCodigoSugerido(ev.codigo_base);
    }
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
      setError("Ingrese o genere un código para el certificado.");
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
        setError(res.error || "No se pudo registrar la persona.");
        setLoading(false);
        return;
      }

      // Limpiar formulario y cerrar
      setDni("");
      setNombre("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">
        {/* Header Modal */}
        <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Agregar Persona / Certificado</h3>
              <p className="text-[11px] text-slate-400">Registrar acreditación en PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* DNI */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              DNI del Participante (8 dígitos): *
            </label>
            <input
              type="text"
              required
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej. 60006146"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Apellidos y Nombres: *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. FLORES VILA, Miriam Maryory"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
            />
          </div>

          {/* Condición y Evento en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Condición: *
              </label>
              <select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as Condicion)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:outline-none transition-all"
              >
                <option value="Asistente">Asistente</option>
                <option value="Ponente">Ponente</option>
                <option value="Organizador">Organizador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Evento / Seminario: *
              </label>
              <select
                value={eventoId}
                onChange={(e) => handleEventoChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:outline-none transition-all"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Código de Certificado */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Código Único del Certificado: *
              </label>
              <button
                type="button"
                onClick={() => {
                  const ev = eventos.find((e) => e.id === eventoId);
                  generarCodigoSugerido(ev ? ev.codigo_base : "IDEXSAM-2026-DPW-S1");
                }}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold cursor-pointer"
              >
                ↻ Generar otro código
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Ej. IDEXSAM-2026-DPW-S1-044"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-none transition-all"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 hover:dark:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Participante</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
