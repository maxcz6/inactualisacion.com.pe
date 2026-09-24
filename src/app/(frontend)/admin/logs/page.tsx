"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";

interface LogEntry {
  id: string;
  usuario_email: string;
  accion: string;
  detalle?: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Registro de Auditoría</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historial de acciones realizadas en el sistema</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Fecha</th>
                  <th className="py-3 px-5">Usuario</th>
                  <th className="py-3 px-5">Acción</th>
                  <th className="py-3 px-5">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Cargando registros...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No hay registros de auditoría.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-900 dark:text-slate-100">{log.usuario_email}</td>
                      <td className="py-3 px-5 text-indigo-700 dark:text-indigo-400 font-semibold">{log.accion}</td>
                      <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{log.detalle || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
