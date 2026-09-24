"use client";

import { useState } from "react";
import { importarParticipantes } from "@/services/participante.service";
import type { CreateParticipanteInput, Condicion } from "@/types/participante";

interface ModalImportarCSVProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventos: { id: string; nombre: string }[];
}

export default function ModalImportarCSV({ isOpen, onClose, onSuccess, eventos }: ModalImportarCSVProps) {
  const [eventoId, setEventoId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!file) {
      setError("Selecciona un archivo CSV");
      return;
    }

    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l);
        
        // Asumiendo formato: DNI,Nombre,Condicion (sin cabecera o con cabecera)
        // Ignoraremos la primera línea si parece cabecera
        const startIndex = lines[0].toLowerCase().includes("dni") ? 1 : 0;
        
        const participantes: CreateParticipanteInput[] = [];

        for (let i = startIndex; i < lines.length; i++) {
          const parts = lines[i].split(",");
          if (parts.length >= 3) {
            const dni = parts[0].trim();
            let condicionRaw = parts[2].trim();
            const condicion = ["Asistente", "Ponente", "Organizador"].includes(condicionRaw) 
              ? condicionRaw as Condicion 
              : "Asistente";

            // Generar código aleatorio 8 caracteres
            const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            participantes.push({
              dni,
              nombre: parts[1].trim(),
              condicion,
              codigo: `${dni}-${randomCode}`,
              evento_id: eventoId || null
            });
          }
        }

        if (participantes.length === 0) {
          setError("No se encontraron registros válidos en el CSV.");
          setLoading(false);
          return;
        }

        const res = await importarParticipantes(participantes);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Error al importar");
        }
      } catch (err: any) {
        setError("Error al procesar el archivo: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Importar Participantes (CSV)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-lg border border-rose-100 dark:border-rose-800 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Evento (Opcional)</label>
              <select
                value={eventoId}
                onChange={(e) => setEventoId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Sin Evento (General)</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Archivo CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                El archivo debe tener 3 columnas separadas por comas (,):<br/>
                <strong className="text-slate-700 dark:text-slate-300">DNI, Nombre, Condicion</strong><br/>
                (Condiciones válidas: Asistente, Ponente, Organizador)
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Importando..." : "Importar Datos"}
          </button>
        </div>
      </div>
    </div>
  );
}
