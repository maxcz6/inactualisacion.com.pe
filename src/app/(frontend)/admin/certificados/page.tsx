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

  // Selección en bloque
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [eventos, setEventos] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    import("@/services/evento.service").then((m) => m.listarEventos()).then((res) => {
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
    setSeleccionados(new Set());
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

    if (!confirm(`¿Eliminar el registro de ${nombre}?`)) return;

    try {
      const res = await eliminarParticipante(id);
      if (res.success) {
        setMensaje({ tipo: "ok", texto: "Registro eliminado correctamente." });
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

    if (!confirm(`¿Eliminar los ${seleccionados.size} registros seleccionados?`)) return;

    try {
      const { eliminarParticipantes } = await import("@/services/participante.service");
      const res = await eliminarParticipantes(Array.from(seleccionados));
      if (res.success) {
        setMensaje({ tipo: "ok", texto: "Registros eliminados correctamente." });
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
    const headers = ["DNI", "Nombre", "Condición / Especialidad", "Código"];
    const rows = participantes.map((p) => [p.dni, p.nombre, p.condicion, p.codigo]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `certificados_pagina_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleToggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
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
      setSeleccionados(new Set(participantes.map((p) => p.id)));
    }
  };

  const esSuperadmin = usuario?.rol === "superadmin";
  const totalPaginas = Math.ceil(total / limit) || 1;

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              {/* Ícono de certificados */}
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </span>
              Registro de Certificados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-9">
              {total} certificados en el padrón
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {esSuperadmin && seleccionados.size > 0 && (
              <button
                onClick={handleEliminarSeleccionados}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
                aria-label={`Eliminar ${seleccionados.size} registros seleccionados`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar ({seleccionados.size})
              </button>
            )}

            <button
              onClick={handleExportar}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Exportar vista actual como CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>

            <button
              onClick={() => setModalImportarAbierto(true)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Importar certificados desde archivo CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar CSV
            </button>

            <button
              onClick={() => setModalAgregarAbierto(true)}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
              aria-label="Registrar nuevo certificado"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Certificado
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {mensaje && (
          <div
            role="alert"
            aria-live="polite"
            className={`mb-5 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm ${
              mensaje.tipo === "ok"
                ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {mensaje.tipo === "ok" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{mensaje.texto}</span>
            </div>
            <button
              onClick={() => setMensaje(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold ml-4 p-1 rounded focus:outline-none focus:ring-2 focus:ring-current"
              aria-label="Cerrar notificación"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Buscador y filtros */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-3.5 mb-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <label htmlFor="busqueda-certificados" className="sr-only">
              Buscar por DNI o Nombre del estudiante
            </label>
            <input
              id="busqueda-certificados"
              type="text"
              placeholder="Buscar por DNI o Nombre del estudiante..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <label htmlFor="filtro-especialidad" className="sr-only">
            Filtrar por Condición / Especialidad
          </label>
          <select
            id="filtro-especialidad"
            value={condicion}
            onChange={(e) => {
              setCondicion(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="">Todas las especialidades</option>
            <option value="Asistente">Asistente</option>
            <option value="Ponente">Ponente</option>
            <option value="Organizador">Organizador</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table" aria-label="Registro de certificados">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-10" scope="col">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                      checked={participantes.length > 0 && seleccionados.size === participantes.length}
                      onChange={handleToggleTodos}
                      aria-label="Seleccionar todos los registros"
                    />
                  </th>
                  <th className="py-3 px-4" scope="col">DNI</th>
                  <th className="py-3 px-4" scope="col">Estudiante</th>
                  <th className="py-3 px-4" scope="col">Condición / Especialidad</th>
                  <th className="py-3 px-4" scope="col">N° Registro</th>
                  <th className="py-3 px-4 text-right" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Cargando registros...</span>
                      </div>
                    </td>
                  </tr>
                ) : participantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>No se encontraron certificados.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  participantes.map((p) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        seleccionados.has(p.id) ? "bg-sky-50/40 dark:bg-sky-900/10" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                          checked={seleccionados.has(p.id)}
                          onChange={() => handleToggleSeleccion(p.id)}
                          aria-label={`Seleccionar certificado de ${p.nombre}`}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {p.dni}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {p.nombre}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          p.condicion === "Ponente"
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50"
                            : p.condicion === "Organizador"
                            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50"
                            : "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50"
                        }`}>
                          {p.condicion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" role="group" aria-label={`Acciones para ${p.nombre}`}>
                          {/* Ver QR */}
                          <button
                            type="button"
                            onClick={() => setParticipanteQR(p)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                            title={`Ver código QR de ${p.nombre}`}
                            aria-label={`Ver código QR de ${p.nombre}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>

                          {esSuperadmin && (
                            <>
                              {/* Editar */}
                              <button
                                type="button"
                                onClick={() => setParticipanteAEditar(p)}
                                className="p-1.5 rounded-lg text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                title={`Editar certificado de ${p.nombre}`}
                                aria-label={`Editar certificado de ${p.nombre}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Eliminar */}
                              <button
                                type="button"
                                onClick={() => handleEliminar(p.id, p.nombre)}
                                className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                                title={`Eliminar certificado de ${p.nombre}`}
                                aria-label={`Eliminar certificado de ${p.nombre}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
              Página {page} de {totalPaginas} · {total} registros
            </span>

            <nav aria-label="Paginación" className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
                aria-label="Página anterior"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              <button
                disabled={page >= totalPaginas}
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
                aria-label="Página siguiente"
              >
                Siguiente
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </main>

      {/* Modales */}
      <ModalAgregarParticipante
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        onSuccess={() => {
          setMensaje({ tipo: "ok", texto: "Certificado registrado correctamente." });
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
