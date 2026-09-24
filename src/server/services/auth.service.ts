import "server-only";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import type { Perfil } from "@/types/perfil";

/**
 * Servicio de BACKEND para autenticación administrativa.
 */

export async function validarUsuario(email: string): Promise<Perfil | null> {
  const usuario = await usuarioRepo.findByEmail(email.toLowerCase().trim());
  if (!usuario || !usuario.activo) {
    return null;
  }
  return usuario;
}
