"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  usuario_email: string;
  accion: string;
  detalle?: string;
  created_at: string;
}

// Badge de color según el tipo de acción
function AccionBadge({ accion }: { accion: string }) {
  const a = accion.toUpperCase();
  let cls = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  if (a.includes("CREA") || a.includes("INSERT") || a.includes("AGREG") || a.includes("REGIST")) {
    cls = "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
  } else if (a.includes("ELIM") || a.includes("DELET") || a.includes("BORR")) {
    cls = "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50";
  } else if (a.includes("EDIT") || a.includes("UPDAT") || a.includes("MODIF") || a.includes("ACTUAL")) {
    cls = "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50";
  } else if (a.includes("LOGIN") || a.includes("INGRES") || a.includes("ACCESO")) {
    cls = "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50";
  } else if (a.includes("LOGOUT") || a.includes("SALIDA")) {
    cls = "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {accion}
    </span>
  );
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">

      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </span>
          Registro de Auditoría
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-9">
          Historial de acciones realizadas en el sistema
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mb-5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No se pudo cargar el registro de auditoría. Intente recargar la página.
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse min-w-[600px]"
            role="table"
            aria-label="Registro de auditoría del sistema"
          >
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 whitespace-nowrap" scope="col">Fecha y Hora</th>
                <th className="py-3 px-4" scope="col">Usuario</th>
                <th className="py-3 px-4" scope="col">Acción</th>
                <th className="py-3 px-4" scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2.5">
                      <svg className="animate-spin w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Cargando registros de auditoría...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>No hay registros de auditoría aún.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Fecha */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {new Date(log.created_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(log.created_at).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Usuario */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" aria-hidden="true">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                          {log.usuario_email}
                        </span>
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="py-3 px-4">
                      <AccionBadge accion={log.accion} />
                    </td>

                    {/* Detalle */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs">
                      <span className="line-clamp-2" title={log.detalle}>
                        {log.detalle || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        {!loading && logs.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-400">
            {logs.length} {logs.length === 1 ? "evento registrado" : "eventos registrados"}
          </div>
        )}
      </div>
    </main>
  );
}
