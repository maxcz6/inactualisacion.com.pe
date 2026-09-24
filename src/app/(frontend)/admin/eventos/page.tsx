"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";
import type { Evento } from "@/types/evento";
import { listarEventos, crearEvento, actualizarEvento } from "@/services/evento.service";

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [usuario, setUsuario] = useState<any>(null);


  // Formulario nuevo evento
  const [codigoBase, setCodigoBase] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const res = await listarEventos();
      if (res.success) setEventos(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUsuario(d.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargarEventos();
  }, []);

  const abrirModalNuevo = () => {
    setError('');
    setNombre('');
    setDescripcion('');
    let nextCode = 'CURSO-001';
    if (eventos.length > 0) {
      let maxNum = 0;
      let prefix = 'CURSO-';
      eventos.forEach(ev => {
        const match = ev.codigo_base.match(/^(.*?)-?(\d+)$/);
        if (match) {
          const num = parseInt(match[2], 10);
          if (num > maxNum) {
            maxNum = num;
            prefix = match[1].endsWith('-') ? match[1] : match[1] + '-';
          }
        }
      });
      if (maxNum > 0) {
        nextCode = `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
      } else {
        nextCode = `${eventos[0].codigo_base}-001`;
      }
    }
    setCodigoBase(nextCode);
    setModalAbierto(true);
  };


  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      if (eventoEditando) {
        const res = await actualizarEvento(eventoEditando.id, {
          codigo_base: codigoBase.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });

        if (!res.success) {
          setError(res.error || "No se pudo actualizar el curso/diplomado.");
          setGuardando(false);
          return;
        }
        setMensaje("Curso/Diplomado actualizado exitosamente.");
      } else {
        const res = await crearEvento({
          codigo_base: codigoBase.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });

        if (!res.success) {
          setError(res.error || "No se pudo crear el curso/diplomado.");
          setGuardando(false);
          return;
        }
        setMensaje("Curso/Diplomado creado exitosamente.");
      }

      setEventoEditando(null);
      setCodigoBase("");
      setNombre("");
      setDescripcion("");
      setGuardando(false);
      setModalAbierto(false);
      cargarEventos();
    } catch {
      setError("Error de red.");
      setGuardando(false);
    }
  };

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Cursos y Diplomados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administre los cursos, diplomados y sus códigos base de certificación.
            </p>
          </div>

          <button
            onClick={abrirModalNuevo}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Nuevo Curso / Diplomado</span>
          </button>
        </div>

        {mensaje && (
          <div className="mb-5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between">
            <span>{mensaje}</span>
            <button onClick={() => setMensaje("")} className="font-bold text-emerald-600 dark:text-emerald-400">✕</button>
          </div>
        )}

        {/* Tabla de Eventos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Código Base</th>
                <th className="py-3.5 px-6">Nombre del Curso / Diplomado</th>
                <th className="py-3.5 px-6">Descripción</th>
                <th className="py-3.5 px-6">Fecha Registro</th>
                {usuario?.rol === "superadmin" && <th className="py-3.5 px-6 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Cargando cursos y diplomados...
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    No hay cursos ni diplomados registrados aún.
                  </td>
                </tr>
              ) : (
                eventos.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {ev.codigo_base}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      {ev.nombre}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                      {ev.descripcion || "Sin descripción"}
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {new Date(ev.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nuevo Evento */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">{eventoEditando ? "Editar Curso / Diplomado" : "Agregar Curso / Diplomado"}</h3>
              <button onClick={() => { setModalAbierto(false); setEventoEditando(null); }} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Código Base (Prefijo): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. IDEXSAM-2026-DPW-S2"
                  value={codigoBase}
                  onChange={(e) => setCodigoBase(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Nombre del Curso / Diplomado: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Seminario de Inteligencia Artificial y Cloud"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Descripción (Opcional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Temario, carga horaria u observaciones..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setModalAbierto(false); setEventoEditando(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {guardando ? "Creando..." : "Crear Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
