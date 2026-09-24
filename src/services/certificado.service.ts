import type { CertificadoPublico } from "@/types/participante";

/**
 * Servicio FRONTEND de certificados.
 * Solo realiza peticiones HTTP a la API interna (/api/certificados/...).
 * ❌ No conoce Supabase ni accede a la base de datos directamente.
 */

export async function verificarPorDni(
  dni: string
): Promise<{ success: boolean; data: CertificadoPublico[]; error?: string }> {
  const res = await fetch(`/api/certificados/verificar?dni=${encodeURIComponent(dni)}`);
  return res.json();
}

export async function obtenerPorCodigo(
  codigo: string
): Promise<{ success: boolean; data?: CertificadoPublico; error?: string }> {
  const res = await fetch(`/api/certificados/${encodeURIComponent(codigo)}`);
  return res.json();
}

export async function obtenerTotalCertificados(): Promise<number> {
  try {
    const res = await fetch("/api/certificados/verificar/total");
    if (!res.ok) return 0;
    const json = await res.json();
    return json.total ?? 0;
  } catch {
    return 0;
  }
}
