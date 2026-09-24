"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminNavbar from "@/components/layout/AdminNavbar";
import ModalAgregarParticipante from "@/components/participantes/ModalAgregarParticipante";
import ModalGeneradorQR from "@/components/certificados/ModalGeneradorQR";
import type { Participante } from "@/types/participante";
import { listarParticipantes } from "@/services/participante.service";
import { listarEventos } from "@/services/evento.service";

export default function AdminDashboardPage() {
  const [totalCertificados, setTotalCertificados] = useState(0);
  const [totalEventos, setTotalEventos] = useState(0);
  const [recientes, setRecientes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalQrAbierto, setModalQrAbierto] = useState(false);
  
  const [usuario, setUsuario] = useState<{rol: string} | null>(null);

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

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [partRes, evRes] = await Promise.all([
        listarParticipantes({ page: 1, limit: 5 }),
        listarEventos(),
      ]);

      if (partRes.success) {
        setTotalCertificados(partRes.meta.total);
        setRecientes(partRes.data);
      }
      if (evRes.success) {
        setTotalEventos(evRes.data.length);
      }
    } catch {
      // silencio en carga
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Cabecera limpia */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Panel de Control
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sistema de Acreditación y Validación de Certificados
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setModalQrAbierto(true)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Generar QR</span>
            </button>

            <button
              onClick={() => setModalAgregarAbierto(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nuevo Certificado</span>
            </button>

            <Link
              href="/admin/certificados"
              className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Ver Registro</span>
            </Link>
          </div>
        </div>

        {/* Tarjetas de Métricas limpias */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Certificados
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 block mt-1">
                {loading ? "..." : totalCertificados}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Eventos Académicos
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 block mt-1">
                {loading ? "..." : totalEventos}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Tu Cuenta
              </span>
              <span className={`text-sm font-semibold block mt-1 ${usuario?.rol === 'superadmin' ? 'text-purple-700 dark:text-purple-400' : 'text-sky-700 dark:text-sky-400'}`}>
                {usuario?.rol === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${usuario?.rol === 'superadmin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabla limpia de últimos registros */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Últimos Registros
            </h2>
            <Link
              href="/admin/certificados"
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
            >
              Ver registro completo →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">DNI</th>
                  <th className="py-3 px-5">Estudiante</th>
                  <th className="py-3 px-5">Condición / Especialidad</th>
                  <th className="py-3 px-5">N° Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Cargando registros...
                    </td>
                  </tr>
                ) : recientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No hay registros recientes.
                    </td>
                  </tr>
                ) : (
                  recientes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-5 font-mono font-medium text-slate-800 dark:text-slate-300">
                        {p.dni}
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-900 dark:text-slate-100">
                        {p.nombre}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.condicion}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-600 dark:text-slate-400">
                        {p.codigo}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ModalAgregarParticipante
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        onSuccess={cargarEstadisticas}
      />

      <ModalGeneradorQR
        isOpen={modalQrAbierto}
        onClose={() => setModalQrAbierto(false)}
        participante={null}
      />
    </>
  );
}
