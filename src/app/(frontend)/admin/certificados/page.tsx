"use client";

import { useState, useEffect, useCallback } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";
import ModalAgregarParticipante from "@/components/participantes/ModalAgregarParticipante";
import ModalEditarParticipante from "@/components/participantes/ModalEditarParticipante";
import ModalGeneradorQR from "@/components/certificados/ModalGeneradorQR";
import ModalImportarCSV from "@/components/participantes/ModalImportarCSV";
import type { Participante } from "@/types/participante";
import { listarParticipantes, eliminarParticipante } from "@/services/participante.service";

interface UsuarioActual {
  email: string;
  nombre?: string;
  rol: "admin" | "superadmin";
}

export default function AdminCertificadosPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Rol del usuario actual
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [condicion, setCondicion] = useState("");

  // Modales
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [participanteAEditar, setParticipanteAEditar] = useState<Participante | null>(null);
  const [participanteQR, setParticipanteQR] = useState<Participante | null>(null);

  // Mensajes de estado
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // Estado para acciones en bloque
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [eventos, setEventos] = useState<{id:string, nombre:string}[]>([]);

  useEffect(() => {
    import("@/services/evento.service").then(m => m.listarEventos()).then(res => {
      if (res.success) setEventos(res.data);
    });
  }, []);

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

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setSeleccionados(new Set()); // Limpiar seleccionados al recargar o cambiar de página
    try {
      const res = await listarParticipantes({
        page,
        limit,
        dni: /^\d+$/.test(busqueda.trim()) ? busqueda.trim() : undefined,
        nombre: !/^\d+$/.test(busqueda.trim()) && busqueda.trim() ? busqueda.trim() : undefined,
        condicion: condicion || undefined,
      });

      if (res.success) {
        setParticipantes(res.data);
        setTotal(res.meta.total);
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error al cargar los registros." });
    } finally {
      setLoading(false);
    }
  }, [page, limit, busqueda, condicion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleEliminar = async (id: string, nombre: string) => {
    if (usuario?.rol !== "superadmin") {
      setMensaje({
        tipo: "error",
        texto: "Solo el rol Superadmin tiene permisos para eliminar registros.",
      });
      return;
    }

    if (!confirm(`¿Eliminar el registro de ${nombre}?`)) {
      return;
    }

    try {
      const res = await eliminarParticipante(id);
      if (res.success) {
        setMensaje({ tipo: "ok", texto: `Registro eliminado correctamente.` });
        cargarDatos();
      } else {
        setMensaje({ tipo: "error", texto: res.error || "No se pudo eliminar." });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de red al intentar eliminar." });
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (usuario?.rol !== "superadmin") return;
    if (seleccionados.size === 0) return;
    
    if (!confirm(`¿Eliminar los ${seleccionados.size} registros seleccionados?`)) {
      return;
    }
    
    try {
      const { eliminarParticipantes } = await import("@/services/participante.service");
      const res = await eliminarParticipantes(Array.from(seleccionados));
      if (res.success) {
        setMensaje({ tipo: "ok", texto: `Registros eliminados correctamente.` });
        cargarDatos();
      } else {
        setMensaje({ tipo: "error", texto: res.error || "No se pudo eliminar." });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error al eliminar múltiples registros." });
    }
  };

  const handleExportar = () => {
    if (participantes.length === 0) {
      setMensaje({ tipo: "error", texto: "No hay registros para exportar en esta vista." });
      return;
    }
    const headers = ["DNI", "Nombre", "Condición", "Código"];
    const rows = participantes.map(p => [p.dni, p.nombre, p.condicion, p.codigo]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participantes_pagina_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleToggleSeleccion = (id: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleTodos = () => {
    if (seleccionados.size === participantes.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(participantes.map(p => p.id)));
    }
  };

  const esSuperadmin = usuario?.rol === "superadmin";
  const totalPaginas = Math.ceil(total / limit) || 1;

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Padrón de Certificados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {total} registros en base de datos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {esSuperadmin && seleccionados.size > 0 && (
              <button
                onClick={handleEliminarSeleccionados}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all"
              >
                Eliminar Seleccionados ({seleccionados.size})
              </button>
            )}

            <button
              onClick={handleExportar}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all"
            >
              Exportar CSV (Vista)
            </button>

            <button
              onClick={() => setModalImportarAbierto(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all"
            >
              Importar CSV
            </button>

            <button
              onClick={() => setModalAgregarAbierto(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Agregar Persona</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {mensaje && (
          <div
            className={`mb-5 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm ${
              mensaje.tipo === "ok"
                ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            <span>{mensaje.texto}</span>
            <button onClick={() => setMensaje(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-3.5 mb-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Buscar por DNI o Nombre..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={condicion}
            onChange={(e) => {
              setCondicion(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">Todas las condiciones</option>
            <option value="Asistente">Asistente</option>
            <option value="Ponente">Ponente</option>
            <option value="Organizador">Organizador</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      checked={participantes.length > 0 && seleccionados.size === participantes.length}
                      onChange={handleToggleTodos}
                    />
                  </th>
                  <th className="py-3 px-4">DNI</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Condición</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Cargando padrón...
                    </td>
                  </tr>
                ) : participantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No se encontraron resultados.
                    </td>
                  </tr>
                ) : (
                  participantes.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${seleccionados.has(p.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : ''}`}>
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          checked={seleccionados.has(p.id)}
                          onChange={() => handleToggleSeleccion(p.id)}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-850 dark:text-slate-300">
                        {p.dni}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {p.nombre}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.condicion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setParticipanteQR(p)}
                            className="text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Ver QR"
                          >
                            QR
                          </button>

                          {esSuperadmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => setParticipanteAEditar(p)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Editar"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEliminar(p.id, p.nombre)}
                                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                Elim
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Página {page} de {totalPaginas}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPaginas}
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modales */}
      <ModalAgregarParticipante
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        onSuccess={() => {
          setMensaje({ tipo: "ok", texto: "Registro guardado correctamente." });
          cargarDatos();
        }}
      />

      <ModalEditarParticipante
        participante={participanteAEditar}
        isOpen={!!participanteAEditar}
        onClose={() => setParticipanteAEditar(null)}
        onSuccess={() => {
          setMensaje({ tipo: "ok", texto: "Registro actualizado correctamente." });
          cargarDatos();
        }}
      />

      <ModalGeneradorQR
        participante={participanteQR}
        isOpen={!!participanteQR}
        onClose={() => setParticipanteQR(null)}
      />

      {/* Modal Importar */}
      {modalImportarAbierto && (
        <ModalImportarCSV
          isOpen={modalImportarAbierto}
          onClose={() => setModalImportarAbierto(false)}
          onSuccess={() => {
            setMensaje({ tipo: "ok", texto: "Importación completada correctamente." });
            cargarDatos();
          }}
          eventos={eventos}
        />
      )}
    </>
  );
}
