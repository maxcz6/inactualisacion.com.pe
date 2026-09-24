import "server-only";
import * as repo from "@/server/repositories/participante.repository";
import type { CertificadoPublico } from "@/types/participante";

/**
 * Servicio de BACKEND para Certificados.
 * Contiene reglas de negocio y delega consultas al repository.
 * Marcado con "server-only" para no ejecutarse en cliente.
 */

export async function consultarPorDni(dni: string): Promise<CertificadoPublico[]> {
  const dniLimpio = dni.replace(/\D/g, "").slice(0, 8);
  if (!/^\d{8}$/.test(dniLimpio)) {
    throw new Error("DNI inválido: debe contener exactamente 8 dígitos");
  }
  return repo.findByDni(dniLimpio);
}

export async function consultarPorCodigo(codigo: string): Promise<CertificadoPublico | null> {
  const codigoLimpio = codigo.trim().toUpperCase();
  return repo.findByCodigo(codigoLimpio);
}
